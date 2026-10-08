/*
 * =============================================================================
 * HOW A SHOP DIABETES CARE PRODUCT IS FILED
 * =============================================================================
 * One scheme for the whole site (owner note 9, 2026-10-07): the Diabetes
 * Essentials shop (./diabetes-shop.tsx) filters by a product's type, and the
 * landing's shelf preview groups the same types into its coarser rooms
 * (`ROOM_FOR_TYPE`), so a landing room and the shop's filter never disagree
 * about what a product is.
 *
 * Read from what the catalogue says about a product: its id, its English
 * name (a French page files a product by its English name; the rules are
 * English), its BigCommerce brand and the categories it is in. Insulin is whatever
 * `isInsulinProduct` says (category 1116 Insulin, plus the Trurapi ids), and
 * glucagon whatever `isGlucagonProduct` says, never a name. A product the
 * rules file wrongly is put right by id in ./dc-ids.ts, and the override wins.
 *
 *   type       one per product, for the shop's "What you need" filter
 *   brand      the shopping brand, as a slug (`?brand=dexcom`): an id
 *              override, then the BigCommerce brand cleaned up ("Dex 4" and
 *              "Dex4" are one), then the name rules. A third-party patch,
 *              case or overlay never takes the device maker's brand; it is
 *              found through "works with" instead
 *   works      the device families a product is made for, read from its name
 *   needle     length (mm) and gauge, for pen needles and syringes, from the
 *              name and the product's own option values
 *
 * Brand and device names are names, not copy, and are never translated.
 * =============================================================================
 */

import {
  DIABETES_BRAND_BY_ID,
  DIABETES_TYPE_BY_ID,
  DIABETES_WORKS_BY_ID,
  isGlucagonProduct,
  isInsulinProduct,
} from './dc-ids';
import type { SHOP_ROOMS } from './landing-meta';

export type ShopRoom = Exclude<(typeof SHOP_ROOMS)[number], 'all' | 'kits'>;

/* The shop's "What you need" filter, in the order its chips show. */
export const SHOP_TYPES = [
  'meters',
  'strips',
  'lancets',
  'control',
  'ketone',
  'cgm',
  'pump-supplies',
  'pump-accessories',
  'pen-needles',
  'syringes',
  'insulin',
  'lows',
  'injection-aids',
  'sharps',
  'carry-cool',
  'patches',
  'foot',
  'medical-id',
  'kids-books',
  'wellness',
  'kits',
  'other',
] as const;

export type ShopType = (typeof SHOP_TYPES)[number];

/* The landing room each type is shown in. Kits have their own section. */
const ROOM_FOR_TYPE: Readonly<Record<Exclude<ShopType, 'kits'>, ShopRoom>> = {
  meters: 'meters',
  strips: 'meters',
  lancets: 'meters',
  control: 'meters',
  ketone: 'meters',
  cgm: 'sensors',
  'pump-supplies': 'pump',
  'pump-accessories': 'pump',
  'pen-needles': 'injection',
  syringes: 'injection',
  insulin: 'insulin',
  lows: 'accessories',
  'injection-aids': 'accessories',
  sharps: 'accessories',
  'carry-cool': 'accessories',
  patches: 'accessories',
  foot: 'accessories',
  'medical-id': 'accessories',
  'kids-books': 'accessories',
  wellness: 'accessories',
  other: 'accessories',
};

/* Types whose chips add the needle length and gauge rows. */
export const NEEDLE_TYPES: readonly ShopType[] = ['pen-needles', 'syringes'];

export interface ProductFacts {
  entityId: number;
  name: string;
  /* The BigCommerce brand's name, if it has one. */
  bcBrand?: string | null;
  categoryIds: readonly number[];
  isKit?: boolean;
  /* Option values ("Needle Size 4mm"), read for needle length and gauge. */
  optionText?: readonly string[];
}

function isShopType(value: string): value is ShopType {
  return SHOP_TYPES.some((type) => type === value);
}

/*
 * Name rules, in order; the first that matches (and is not excused by its
 * `unless`) files the product. Supplies that carry the word "insulin" (pen
 * needles, wallets) are never insulin: insulin is read from the catalogue's
 * categories before these run.
 */
const TYPE_NAME_RULES: ReadonlyArray<{ type: ShopType; rule: RegExp; unless?: RegExp }> = [
  {
    type: 'lows',
    rule: /dex ?4|glucose (gel|tablet|rapid)|liquiblast|gel blast/i,
    unless: /key chain/i,
  },
  { type: 'ketone', rule: /ketostix|keto diastix|b-ketone/i },
  { type: 'control', rule: /control solution/i },
  { type: 'sharps', rule: /sharps/i },
  {
    type: 'pen-needles',
    rule: /pen ?needle|needle pen|pentips|pen tip|novofine|unifine|autoshield/i,
  },
  { type: 'syringes', rule: /syringe/i },
  {
    type: 'pump-supplies',
    rule: /omnipod.*pods|infusion set|reservoir|cartridge|quick-set|silhouette|sure ?t\b|\bmio\b|inset|orbit|cleo|autosoft|varisoft|trusteel|inserter|iv 3000|mmt-326/i,
    unless: /storage box|removal tool/i,
  },
  { type: 'strips', rule: /\bstrips?\b/i },
  { type: 'lancets', rule: /lancet|softclix|fastclix|delica|microlet|safe-t-pro/i },
  { type: 'meters', rule: /meter|blood glucose monitor/i },
  { type: 'patches', rule: /patch|sticker|overlay|podpals|tartoos|aquapac/i },
  { type: 'cgm', rule: /sensor|reader|receiver|transmitter|scanner/i, unless: /case/i },
  {
    type: 'carry-cool',
    rule: /frio|cool|medicool|dia-?pak|diapak|case|pouch|spibelt|flipbelt|holster|travel|key chain|garter|daymate/i,
  },
  {
    type: 'pump-accessories',
    rule: /clip|skin\b|decal|screen|film|protector|activity guard|batter|usb cable|service pack|removal tool|storage box|silicone cover|guide to successful pumping/i,
  },
  { type: 'foot', rule: /foot|socks/i },
  { type: 'medical-id', rule: /bracelet|med id/i },
  { type: 'kids-books', rule: /jerry the bear|kids first|even little kids/i },
  { type: 'injection-aids', rule: /inject-ease|insul-cap|i-port|buzzy|meal measure|alcohol swab/i },
  { type: 'wellness', rule: /resource diabetic|canprev|glucosupport|benylin/i },
];

export function typeForProduct(facts: ProductFacts): ShopType {
  const override = DIABETES_TYPE_BY_ID[facts.entityId];

  if (override && isShopType(override)) return override;

  if (facts.isKit) return 'kits';

  if (isInsulinProduct(facts)) return 'insulin';

  if (isGlucagonProduct(facts.entityId)) return 'lows';

  const n = facts.name;

  return (
    TYPE_NAME_RULES.find(({ rule, unless }) => rule.test(n) && !unless?.test(n))?.type ?? 'other'
  );
}

/*
 * The landing room a product is shown in. Glucagon shares the insulin room,
 * which carries the pharmacist notice; in the shop it is with the lows.
 */
export function roomForProduct(facts: ProductFacts): ShopRoom {
  if (isGlucagonProduct(facts.entityId)) return 'insulin';

  const type = typeForProduct(facts);

  return type === 'kits' ? 'accessories' : ROOM_FOR_TYPE[type];
}

/* Insulin or glucagon: the products a pharmacist reviews, opened on their own page. */
export function isPharmacistProduct(facts: Pick<ProductFacts, 'entityId' | 'categoryIds'>) {
  return isInsulinProduct(facts) || isGlucagonProduct(facts.entityId);
}

/* ---------- Brand ---------- */

/*
 * The shopping brands, by slug: what the brand filter shows and what the
 * landing's brand pills link to. Ordered: device and meter families first,
 * then the rest A to Z.
 */
const BRAND_LABELS: Readonly<Record<string, string>> = {
  dexcom: 'Dexcom',
  'freestyle-libre': 'FreeStyle Libre',
  omnipod: 'Omnipod (Insulet)',
  minimed: 'MiniMed',
  tandem: 'Tandem',
  mylife: 'mylife',
  onetouch: 'OneTouch',
  contour: 'Contour',
  'accu-chek': 'Accu-Chek',
  freestyle: 'FreeStyle',
  bayer: 'Bayer',
  bd: 'BD',
  biocon: 'Biocon Biologics',
  dex4: 'Dex4',
  embecta: 'embecta',
  frio: 'Frio',
  lilly: 'Lilly',
  'novo-nordisk': 'Novo Nordisk',
  oracle: 'Oracle',
  sanofi: 'Sanofi',
  unifine: 'Unifine',
};

export const PREFERRED_BRAND_SLUGS = [
  'dexcom',
  'freestyle-libre',
  'omnipod',
  'minimed',
  'tandem',
  'mylife',
  'onetouch',
  'contour',
  'accu-chek',
  'freestyle',
] as const;

/* Device makers: a third-party accessory never takes one of these. */
const DEVICE_BRANDS: readonly string[] = [
  'dexcom',
  'freestyle-libre',
  'omnipod',
  'minimed',
  'tandem',
  'mylife',
];

/* BigCommerce brands that are a product line, or spelled twice. */
const BC_BRAND_ALIASES: Readonly<Record<string, string>> = {
  'dex-4': 'dex4',
  'precision-xtra': 'freestyle',
  ascensia: 'contour',
  novofine: 'novo-nordisk',
  'ez-health': 'oracle',
  medtronic: 'minimed',
};

/*
 * Ultra-Fine, Nano PRO and AutoShield pen needles and syringes are embecta's
 * (formerly part of BD; the register's `embecta-contact`), whatever the
 * store's brand record still says.
 */
const EMBECTA_NAME = /ultra-fine|nano ?pro|autoshield/i;

/* Name rules, in order; the first that matches names the brand. */
const BRAND_NAME_RULES: ReadonlyArray<readonly [string, RegExp]> = [
  ['dexcom', /dexcom/i],
  ['freestyle-libre', /\blibre\b/i],
  ['freestyle', /freestyle|medisense|precision xtra/i],
  ['omnipod', /^omnipod.*pods/i],
  [
    'minimed',
    /medtronic|minimed|paradigm|guardian|silhouette|quick-set|sure ?t\b|\bmio\b|mmt-|extended (reservoir|infusion)|i-port/i,
  ],
  ['tandem', /tandem|t:slim|t:lock|t:case|t:holster|autosoft/i],
  ['mylife', /mylife|ypsopump/i],
  ['onetouch', /one ?touch|delica/i],
  ['contour', /contour|ascensia/i],
  ['bayer', /^bayer\b/i],
  ['accu-chek', /accu-chek|softclix|fastclix|aviva|safe-t-pro/i],
  ['embecta', EMBECTA_NAME],
  ['bd', /\bbd\b|safetyglide|vacutainer|safety-lock/i],
  ['novo-nordisk', /novofine|novolin|novorapid|fiasp|tresiba/i],
  ['lilly', /humalog|humulin|basaglar/i],
  ['sanofi', /lantus|toujeo|apidra|admelog|trurapi/i],
  ['biocon', /semglee|kirsty/i],
  ['dex4', /dex ?4/i],
  ['frio', /frio/i],
  ['unifine', /unifine/i],
  ['oracle', /oracle|ezh\b|ez health/i],
];

/* Words that make a product an accessory for someone else's device. */
const ACCESSORY_WORD =
  /patch|sticker|overlay|podpals|case|pouch|holster|clip|belt|skin\b|decal|screen|film|protector|guard\b|tartoos|cover/i;

/*
 * Accessories the device maker itself sells, by its own product name:
 * Tandem's t:case and t:holster, its decal and screen protectors, and the
 * mylife YpsoPump range. Medtronic-named cases, pouches, belts, clips, skins
 * and films are not here: whether each one is Medtronic's own is the owner's
 * check (OPEN-QUESTIONS, note 9), so until then they carry no brand and are
 * found under "works with MiniMed".
 */
const OWN_ACCESSORY =
  /^(t:case|t:holster|tandem t:slim x2 pump decal|tandem pump screen|mylife ypsopump (kids pouch|synthetic|360|reservoir storage|neck|bra|waist|service))/i;

export function brandSlug(name: string): string {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  return BC_BRAND_ALIASES[slug] ?? slug;
}

export interface BrandFacet {
  slug: string;
  label: string;
}

export function brandForProduct(facts: ProductFacts): BrandFacet | null {
  const label = (id: string) => BRAND_LABELS[id] ?? facts.bcBrand?.trim() ?? id;
  const n = facts.name;

  if (facts.entityId in DIABETES_BRAND_BY_ID) {
    const override = DIABETES_BRAND_BY_ID[facts.entityId];

    return override ? { slug: override, label: label(override) } : null;
  }

  const thirdParty = ACCESSORY_WORD.test(n) && !OWN_ACCESSORY.test(n) && !/^omnipod.*pods/i.test(n);
  const bc = facts.bcBrand?.trim();
  let slug: string | null = bc ? brandSlug(bc) : null;

  if (slug === 'freestyle' && /\blibre\b/i.test(n)) slug = 'freestyle-libre';

  if (slug === 'bd' && EMBECTA_NAME.test(n)) slug = 'embecta';

  if (!slug && !thirdParty) {
    slug = BRAND_NAME_RULES.find(([, rule]) => rule.test(n))?.[0] ?? null;
  }

  if (!slug || (thirdParty && DEVICE_BRANDS.includes(slug))) return null;

  return { slug, label: label(slug) };
}

/* Brands in shop order: the device and meter families first, then A to Z. */
export function orderedBrands(brands: ReadonlyArray<BrandFacet | null>): BrandFacet[] {
  const bySlug = new Map<string, BrandFacet>();

  brands.forEach((brand) => {
    if (brand && !bySlug.has(brand.slug)) bySlug.set(brand.slug, brand);
  });

  const preferred: readonly string[] = PREFERRED_BRAND_SLUGS;

  return [...bySlug.values()].sort((a, b) => {
    const ai = preferred.indexOf(a.slug);
    const bi = preferred.indexOf(b.slug);

    if (ai >= 0 || bi >= 0) return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);

    return a.label.localeCompare(b.label, undefined, { sensitivity: 'base' });
  });
}

/* ---------- Works with ---------- */

/* Device families, in the order their chips show. Names, never translated. */
export const WORKS_WITH: ReadonlyArray<{ id: string; label: string; rule: RegExp }> = [
  { id: 'dexcom-g7', label: 'Dexcom G7', rule: /dexcom.*g7|g7.*dexcom/i },
  { id: 'dexcom-g6', label: 'Dexcom G6', rule: /dexcom.*g6|g6.*dexcom/i },
  { id: 'freestyle-libre', label: 'FreeStyle Libre', rule: /\blibre\b/i },
  { id: 'guardian', label: 'Guardian', rule: /guardian/i },
  { id: 'omnipod', label: 'Omnipod', rule: /omnipod|podpals/i },
  {
    id: 'minimed',
    label: 'MiniMed',
    rule: /medtronic|minimed|paradigm|silhouette|quick-set|sure ?t\b|\bmio\b|mmt-|extended (reservoir|infusion)/i,
  },
  {
    id: 'tandem',
    label: 'Tandem',
    rule: /tandem|t:slim|t:lock|t:case|t:holster|autosoft|rockadex/i,
  },
  { id: 'ypsopump', label: 'mylife YpsoPump', rule: /ypsopump|mylife/i },
  { id: 'onetouch-verio', label: 'OneTouch Verio', rule: /verio/i },
  { id: 'onetouch-ultra', label: 'OneTouch Ultra', rule: /(onetouch|one touch) ultra/i },
  { id: 'contour-next', label: 'Contour Next', rule: /contour next/i },
  { id: 'accu-chek-guide', label: 'Accu-Chek Guide', rule: /accu-chek guide/i },
  { id: 'accu-chek-aviva', label: 'Accu-Chek Aviva', rule: /aviva/i },
  { id: 'freestyle-lite', label: 'FreeStyle Lite', rule: /freestyle lite/i },
  {
    id: 'freestyle-precision',
    label: 'FreeStyle Precision',
    rule: /freestyle precision(?!.*ketone)/i,
  },
  { id: 'oracle', label: 'Oracle', rule: /oracle/i },
];

/* The device families a product is made for: an id override, else its name. */
export function worksWithProduct(facts: ProductFacts): string[] {
  const override = DIABETES_WORKS_BY_ID[facts.entityId];

  if (override) return [...override];

  return WORKS_WITH.filter(({ rule }) => rule.test(facts.name)).map(({ id }) => id);
}

/* ---------- Needle length and gauge ---------- */

export interface NeedleFacts {
  lengths: string[];
  gauges: string[];
}

/*
 * Length in millimetres and gauge, from the name and the option values: a
 * few pen needles and syringes carry them only as options. "5/16 inch" is
 * 8 mm and "0.5 inches" 12.7 mm.
 */
export function needleForProduct(facts: ProductFacts, type: ShopType): NeedleFacts {
  if (!NEEDLE_TYPES.includes(type)) return { lengths: [], gauges: [] };

  const text = [facts.name, ...(facts.optionText ?? [])].join(' | ');
  const mm = [...text.matchAll(/(\d+(?:\.\d+)?)\s*mm\b/gi)]
    .map((match) => Number(match[1]))
    .filter((value) => value > 0 && value < 20);
  const inches = [
    ...(/5\/16\s*inch/i.test(text) ? [8] : []),
    ...(/0\.5\s*inch/i.test(text) ? [12.7] : []),
  ];
  const gauges = [...text.matchAll(/\b(\d{2})\s*G\b/gi)]
    .map((match) => Number(match[1]))
    .filter((value) => value >= 25 && value <= 34);

  return {
    lengths: [...new Set([...mm, ...inches])].sort((a, b) => a - b).map(String),
    gauges: [...new Set(gauges)].sort((a, b) => a - b).map(String),
  };
}

/* ---------- The shelf ---------- */

export interface ShelfFacts {
  name: string;
  /* The English name, where the page shows another (a French page): searched too. */
  searchName?: string;
  type: ShopType;
  brand: BrandFacet | null;
  works: readonly string[];
  needle: NeedleFacts;
  inStock: boolean;
}

export interface ShelfSelection {
  type?: ShopType;
  brands: readonly string[];
  works: readonly string[];
  lengths: readonly string[];
  gauges: readonly string[];
  inStock?: boolean;
  term?: string;
}

function lower(value: string) {
  return value.toLowerCase();
}

export function matchesShelf(item: ShelfFacts, selection: ShelfSelection): boolean {
  if (selection.type && item.type !== selection.type) return false;

  if (selection.brands.length > 0) {
    const { brand } = item;

    if (
      !brand ||
      !selection.brands.some(
        (selected) => lower(selected) === brand.slug || lower(selected) === lower(brand.label),
      )
    ) {
      return false;
    }
  }

  if (selection.works.length > 0 && !selection.works.some((id) => item.works.includes(id))) {
    return false;
  }

  if (
    selection.lengths.length > 0 &&
    !selection.lengths.some((length) => item.needle.lengths.includes(length))
  ) {
    return false;
  }

  if (
    selection.gauges.length > 0 &&
    !selection.gauges.some((gauge) => item.needle.gauges.includes(gauge))
  ) {
    return false;
  }

  if (selection.inStock && !item.inStock) return false;

  const term = selection.term?.trim();

  if (term) {
    const haystack = [item.name, item.searchName ?? '', item.brand?.label ?? '']
      .join(' ')
      .toLowerCase();

    if (
      !lower(term)
        .split(/\s+/)
        .filter(Boolean)
        .every((word) => haystack.includes(word))
    ) {
      return false;
    }
  }

  return true;
}

export function countShelf(items: readonly ShelfFacts[], selection: ShelfSelection): number {
  return items.reduce((count, item) => (matchesShelf(item, selection) ? count + 1 : count), 0);
}

/* ---------- Kept for the chapters' placement filter ---------- */

/* Insulins sold in Canada, by brand or by generic name, and the glucagons. */
const INSULIN_OR_GLUCAGON_NAME =
  /\b(admelog|apidra|basaglar|fiasp|humalog|humulin|kirsty|lantus|levemir|lyumjev|novolin|novorapid|ryzodeg|semglee|soliqua|toujeo|tresiba|trurapi|xultophy|baqsimi|gvoke|zegalogue)\b|insulin(e)? (aspart|asparte|glargine|lispro|degludec|détémir|detemir)|glucagon/i;

/*
 * Whether a name is an insulin's or a glucagon's. Only the chapters' product
 * placements use it (./chapters/placement-items.ts), as a second lock on /fr
 * where the placement loader reads no categories; everything else asks
 * `isInsulinProduct` and `isGlucagonProduct`.
 */
export function isInsulinOrGlucagonName(name: string): boolean {
  return INSULIN_OR_GLUCAGON_NAME.test(name);
}
