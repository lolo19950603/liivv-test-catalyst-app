/* Twin of ostomy-care/chapters/chapter-shop.ts @3b343c6e — port fixes both ways until Phase 2 */

/*
 * =============================================================================
 * DIABETES CARE — WHICH CATALOGUE PRODUCTS A PAGE MAY SHOW
 * =============================================================================
 * The merchandising record (owner answer B21, 2026-10-06: "Now?", so
 * placements resume). Clinical copy stays in chapters-meta.ts and the message
 * tree: a change to what Liivv stocks must not change what a chapter says.
 * The shapes are the engine's (../../_microsite/shop/shelves.ts); the words
 * are `DiabetesCare.ui.chapter.shop.occasions` and `.offers`.
 *
 * Proposed from the read-only catalogue check of 2026-10-06 (commerce facts,
 * section 3). Every id is checked again on every request
 * (../../_microsite/shop/get-placement-items.ts): a product hidden in the
 * store, not purchasable or out of stock is left out, and so is one whose
 * description still names or links another retailer or gives its phone
 * number (DIABETES_REFUSED_DESCRIPTION). A product with a required option or
 * modifier (85 Shop Diabetes Care products carry a required "Test" modifier
 * today) is a "Choose options" link to its page, never a one-click add.
 *
 * The rules this record keeps:
 *   - SHOP_SWITCH.placements is the one switch: false and no card or path
 *     places anything. The funding page places nothing (owner note 7,
 *     2026-10-07, removed its pump-supplies strip; card 13 keeps it).
 *   - Nothing on Staying Safe card 2 (the Rule of 15), and nothing for
 *     prediabetes: not Know Your Type card 3, not the prediabetes path.
 *   - Insulin is never a named product: only New to the Journey card 8 links
 *     the insulin shelf, beside the pharmacist notice the insulin product
 *     pages carry, and only in English. Insulin may not be ordered online for
 *     Quebec delivery or advertised to Quebec (owner answer B11), so no /fr
 *     page links it, and the route drops anything insulin from /fr shelves.
 *   - Glucagon (Baqsimi, 4555) only on Staying Safe card 3, with the notice.
 *     It is something someone else gives; the card says so. Its card links
 *     the product page ("View product") and is never a one-click add
 *     (owner note 9; ./placement-items.ts, ./_actions/add-placement.ts).
 *   - No kit on a chapter card. The owner verified all twelve kits on
 *     2026-10-07 (A4): they are listed on the landing and in the shop
 *     (DIABETES_LISTED_KIT_IDS, ../dc-ids.ts), not placed on cards.
 *   - Omnipod pods (8090, 8091) are named on the pump-supply shelves; the
 *     storefront returns no hidden product, so they appear the day the owner
 *     makes them visible, and not before.
 *   - Left out for a ruling: the two foot creams (7342, 7332), which make
 *     symptom claims, and the blood-ketone strips (4909), which need a meter
 *     Liivv does not stock. Both are open questions in the copy record.
 *
 * Erasable TypeScript and no value imports: ./site.ts carries DIABETES_SHOP,
 * and the content-review export loads that file under Node's type stripping.
 * Every placed id is also health-revealing by id for analytics
 * (DIABETES_PLACED_PRODUCT_IDS; core/lib/analytics/sensitive-products.ts).
 * =============================================================================
 */

import type { CardShelf, ShopOffer, SiteShop } from '../../_microsite/shop/shelves';

import type { ChapterSlug } from './chapters-meta';
import type { PathSlug } from './paths-meta';

/*
 * The one switch for every product placement on the Diabetes pages: set
 * `placements` to false and no card or path places anything.
 * Held in a record, as LANDING_GATES is, so either value type-checks.
 */
export const SHOP_SWITCH: Readonly<{ placements: boolean }> = { placements: true };

export const PLACEMENTS_ON = SHOP_SWITCH.placements;

/*
 * A product whose description matches is never placed or listed: the owner's
 * rule is that nothing on these pages names or leads to another retailer.
 * Seventeen descriptions did on 2026-10-06 (B3 in OPEN-QUESTIONS.md); none
 * does since the store fixes of 2026-10-07, and the check stays as a safety
 * net. The retailer's name in any spacing, and its phone number in any
 * punctuation.
 */
export const DIABETES_REFUSED_DESCRIPTION = /diabetes[\s_-]*express|866\D{0,3}418\D{0,3}3392/i;

/*
 * Whether a product's description names or leads to another retailer. Tested
 * on the full HTML description the storefront returns (`description`, never
 * `plainTextDescription`, which drops every link's address), so a link to the
 * retailer's site counts as well as its name; then again on the words alone,
 * with tags removed and entities and %-escapes decoded, so "Diabetes&nbsp;
 * Express" or a name split by a tag is caught too. Every loader that lists
 * Diabetes products asks this: the landing's catalogue, the chapters'
 * placements and the Diabetes Essentials shop.
 */
export function namesAnotherRetailer(description: string | null | undefined): boolean {
  if (!description) return false;

  const words = description
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;|&#160;|&#xa0;/gi, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/%([0-9a-f]{2})/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)));

  return DIABETES_REFUSED_DESCRIPTION.test(description) || DIABETES_REFUSED_DESCRIPTION.test(words);
}

/*
 * The insulin shelf (category 1116), linked from New to the Journey card 8
 * instead of any named insulin: the prescriber chooses which.
 */
export const INSULIN_SHELF_HREF =
  '/liivv-your-life/nourish-balance/metabolic-glucose-support/insulin-pens-pen-needles/insulin';

/*
 * The insulin shelf link. Held from 2026-10-06 (link crawl): the shelf listed
 * Toujeo SoloStar (packs of 3 and 5), whose description linked a PDF on
 * another retailer's site, and Tresiba FlexTouch (U-100 and U-200), whose
 * description named that retailer's pharmacy, and `namesAnotherRetailer` is
 * checked only on placed products, not on a category a shelf links.
 * Switched back on 2026-10-08: the owner had those descriptions fixed in the
 * store on 2026-10-07, and a fresh read of every product on the shelf (34,
 * EN and FR, full HTML description, words and custom fields) found none that
 * names, links or phones another retailer (OPEN-QUESTIONS B3, B21). Card 8
 * links the shelf with its pharmacist, cold-chain and Quebec notices, in
 * English only; no /fr page links it. Three Apidra listings on the shelf
 * still answer 404 in English (a store fix, B3). Set `linked` to false to
 * hold the link again.
 */
export const INSULIN_SHELF: Readonly<{ linked: boolean }> = { linked: true };

/*
 * The catalogue's names on 2026-10-06, for the review pack and the record
 * only. Pages print the name the catalogue returns on the day.
 */
export const PLACED_PRODUCT_NAMES: Readonly<Record<number, string>> = {
  4227: 'Dexcom G7 Sensor 1-Pack',
  4253: 't:lock VariSoft Tandem Infusion Set',
  4255: 'Pen Plus Diabetic Travel Case',
  4287: 'OneTouch Verio Reflect Meter',
  4289: '2BEID Medical Alert Bracelets Small',
  4310: 'Dexcom G7 Design Patches (Pack of 1)',
  4314: 'mylife YpsoPump Reservoir',
  4316: 'FreeStyle Libre 3 Plus Sensor',
  4323: 'mylife YpsoPump Kids Pouch',
  4342: 'Ultra-Fine Pen Needles 5mm 31G',
  4350: 'Sharps Container 1L',
  4382: 'Meal Measure Unit',
  4398: 'Bayer Microlet Lancets 28G',
  4402: 'FreeStyle Lite Meter',
  4458: 'OneTouch Delica Plus 33G',
  4459: 'Buzzy Personal LadyBuzz',
  4467: 'Ultra-Fine Insulin Syringes 0.5mL',
  4474: 'Ultra-Fine Insulin Syringes 1mL',
  4479: 'FreeStyle Libre 2 Sensor',
  4524: 'Contour NEXT ONE Meter',
  4529: 'FlipBelt Diabetes Supply Carrying Case',
  4532: 'IV 3000 Infusion Set Dressing',
  4555: 'Baqsimi',
  4556: 'Accu-Chek Guide Meter',
  4655: 'Ultra-Fine Insulin Syringes 0.3mL',
  4656: 'Accu-Chek Guide Test Strips',
  4658: 'Tandem t:lock Cartridge',
  4663: 'FreeStyle Control Solution',
  4665: 'mylife YpsoPump Inset',
  4674: 'FreeStyle Libre 3 Reader',
  4698: 'FreeStyle Lite Test Strips',
  4714: 'Contour Next Test Strips',
  4723: 'Dexcom G7 Receiver',
  4731: 'Dex4 Key Chain',
  4750: 'Medtronic Quick-Set',
  4777: 'Nano PRO Pen Needles 4mm 32G',
  4799: 'Frio Insulin Cooling Wallet Duo',
  4808: 'Bayer Ketostix',
  4812: 'Frio Individual Insulin Cooling Wallets',
  4823: 'MiniMed Disposable Power Kit',
  4841: 'Libre Oval Patch',
  4844: 'Frio Insulin Cooling Wallet Small',
  4862: 'Medtronic Reservoir 3.0ml',
  4872: 'FreeStyle Lancets',
  4945: 'Accu-Chek Softclix',
  4948: 'OneTouch Verio Test Strips',
  4967: 'Guardian 4 Sensor (pk of 5)',
  5017: 'Jerry the Bear',
  5040: 'Infracare Socks',
  7356: 'One Touch Ultra Control Solution',
  7371: 'Dex4 Fast Acting Glucose Tablets Tropical Fruit',
  7382: 'Dex4 Glucose Gel Fruit Punch',
  7544: 'EZH Oracle 32g 4mm Pen Needle',
  7778: 'PharmaSystems Med ID Bracelet Diabetic',
  8090: 'Omnipod 5 Pods, box of 10 (hidden in the store)',
  8091: 'Omnipod DASH Pods, box of 10 (hidden in the store)',
};

/* ---------- Offers used on more than one shelf ---------- */

const METERS: ShopOffer = { productIds: [4287, 4524, 4556, 4402], line: 'meters' };
const SENSORS: ShopOffer = { productIds: [4227, 4316], line: 'sensors' };
const URINE_KETONES: ShopOffer = { productIds: [4808], line: 'ketones' };
const SHARPS = 4350;
const FAST_SUGAR = [7371, 7382];

/* The meters and their own strips, as pairs: a strip only reads in its own meter. */
const ONE_TOUCH_PAIR: ShopOffer = { productIds: [4287, 4948], line: 'oneTouch' };
const CONTOUR_PAIR: ShopOffer = { productIds: [4524, 4714], line: 'contour' };

const PUMP_SUPPLIES: ShopOffer[] = [
  { productIds: [4750, 4862], line: 'medtronic' },
  { productIds: [4253, 4658], line: 'tandem' },
  { productIds: [4665, 4314], line: 'mylife' },
  { productIds: [8090, 8091], line: 'omnipod' },
];

/* Meters, urine ketone strips and sensors, if the reader's team suggests them. */
const CHECK_TOOLS: CardShelf = {
  occasion: 'checkTools',
  offers: [METERS, URINE_KETONES, SENSORS],
};

const METER_AND_STRIPS: CardShelf = {
  occasion: 'meterAndStrips',
  offers: [ONE_TOUCH_PAIR, CONTOUR_PAIR],
};

/* ---------- Chapter cards ---------- */

const PLACEMENTS: Partial<Record<ChapterSlug, Record<number, CardShelf>>> = {
  'new-to-the-journey': {
    8: {
      occasion: 'startingInjections',
      offers: [{ productIds: [4777, 7544, SHARPS] }],
      ...(INSULIN_SHELF.linked
        ? {
            collection: {
              href: INSULIN_SHELF_HREF,
              label: 'insulinShelf',
              locales: ['en'],
              notices: ['pharmacistNotice', 'insulinColdChain', 'quebecInsulin'],
            },
          }
        : {}),
    },
    10: {
      occasion: 'starterList',
      offers: [
        METERS,
        { productIds: [4777, 7544, 4655], line: 'injections' },
        SENSORS,
        { productIds: [...FAST_SUGAR, 7778, SHARPS], line: 'everyone' },
      ],
    },
  },
  'staying-safe': {
    /* Card 2, the Rule of 15, has no shelf, on purpose. */
    3: { occasion: 'glucagon', offers: [{ productIds: [4555] }], notices: ['pharmacistNotice'] },
    5: { occasion: 'carry', offers: [{ productIds: [...FAST_SUGAR, 4731, 7778, 4289] }] },
  },
  'your-tools': {
    1: { occasion: 'meters', offers: [{ productIds: METERS.productIds }] },
    2: {
      occasion: 'matching',
      offers: [
        { productIds: [4948, 4458, 7356], line: 'oneTouch' },
        { productIds: [4714, 4398], line: 'contour' },
        { productIds: [4656, 4945], line: 'accuChek' },
        { productIds: [4698, 4872, 4663], line: 'freeStyle' },
      ],
    },
    4: { occasion: 'readers', offers: [{ productIds: [4674, 4723] }] },
    5: { occasion: 'wearing', offers: [{ productIds: [4841, 4310] }] },
    6: { occasion: 'restock', offers: [{ productIds: [4227, 4316, 4479, 4967] }] },
    7: { occasion: 'penNeedles', offers: [{ productIds: [4777, 7544, 4342] }] },
    8: { occasion: 'syringes', offers: [{ productIds: [4655, 4467, 4474] }] },
    9: { occasion: 'sharps', offers: [{ productIds: [SHARPS] }] },
    11: { occasion: 'keepCool', offers: [{ productIds: [4844, 4812, 4799] }] },
    13: { occasion: 'pumpSupplies', offers: PUMP_SUPPLIES },
    14: { occasion: 'pumpBackup', offers: [{ productIds: [4532, 4823, 4474] }] },
    /* Cards 3, 10 and 12 teach only. */
  },
  'every-day-living': {
    2: { occasion: 'portions', offers: [{ productIds: [4382] }] },
    3: { occasion: 'moving', offers: [{ productIds: [4731, 4529] }] },
    6: { occasion: 'flying', offers: [{ productIds: [4844, 4255, SHARPS] }] },
    /* The two foot creams wait on the nurse's ruling; no monofilament is stocked. */
    8: { occasion: 'feet', offers: [{ productIds: [5040] }] },
  },
  'know-your-type': {
    1: CHECK_TOOLS,
    2: METER_AND_STRIPS,
    /* Card 3, prediabetes, has no shelf, on purpose. */
    4: METER_AND_STRIPS,
    7: CHECK_TOOLS,
    11: CHECK_TOOLS,
    12: CHECK_TOOLS,
    13: CHECK_TOOLS,
    /* Cards 5, 6, 8, 9 and 10 plan no products. */
  },
  'this-might-be-you': {
    2: { occasion: 'childGear', offers: [{ productIds: [4323, 5017, 4459] }] },
    3: { occasion: 'schoolLowKit', offers: [{ productIds: [...FAST_SUGAR, 4731, 4289] }] },
    4: { occasion: 'laterLife', offers: [{ productIds: [4556, 4524, 4777] }] },
  },
};

/* ---------- Path pages: the strip between the reading list and the funding door ---------- */

/* Never prediabetes. */
export const PATH_SHELVES: Partial<Record<PathSlug, CardShelf>> = {
  'type-1': CHECK_TOOLS,
  'type-2': METER_AND_STRIPS,
  gestational: METER_AND_STRIPS,
  'less-common-types': CHECK_TOOLS,
};

/* ---------- What the engine and the route read ---------- */

export function shelfForCard(slug: string, card: number): CardShelf | undefined {
  if (!PLACEMENTS_ON) return undefined;

  const cards: Record<number, CardShelf> | undefined = Object.entries(PLACEMENTS).find(
    ([key]) => key === slug,
  )?.[1];

  return cards?.[card];
}

export function pathShelf(slug: string): CardShelf | undefined {
  if (!PLACEMENTS_ON) return undefined;

  return Object.entries(PATH_SHELVES).find(([key]) => key === slug)?.[1];
}

/* Every product id a chapter's shelves name, once each. */
export function shopIdsForChapter(slug: string): number[] {
  if (!PLACEMENTS_ON) return [];

  const cards = Object.entries(PLACEMENTS).find(([key]) => key === slug)?.[1];

  return [
    ...new Set(
      Object.values(cards ?? {}).flatMap((shelf) =>
        shelf.offers.flatMap((offer) => offer.productIds),
      ),
    ),
  ];
}

/* Every product id this record places anywhere: the add action's allowlist. */
export const DIABETES_PLACED_PRODUCT_IDS: readonly number[] = [
  ...new Set(
    [
      ...Object.values(PLACEMENTS).flatMap((cards) => Object.values(cards)),
      ...Object.values(PATH_SHELVES),
    ].flatMap((shelf) => shelf.offers.flatMap((offer) => offer.productIds)),
  ),
];

/* Whether this product is placed somewhere on the Diabetes pages. */
export function isDiabetesPlacedProduct(entityId: number): boolean {
  return DIABETES_PLACED_PRODUCT_IDS.includes(entityId);
}

export const DIABETES_SHOP: SiteShop = { on: PLACEMENTS_ON, shelfForCard };
