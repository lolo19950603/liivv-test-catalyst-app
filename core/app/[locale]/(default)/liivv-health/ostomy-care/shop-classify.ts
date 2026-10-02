/*
 * How a Shop Ostomy Care product is filed.
 *
 * The landing preview and the full shop both use this. The room rules are the
 * ones the landing already shipped: a name is a one-piece pouch, a two-piece
 * pouch, a barrier, or an accessory. Kits are not a room. A kit is a curated
 * product (custom field) that is on the listed-kit list, and the shop files
 * it under Kits instead of under whichever room its name would suggest.
 *
 * Opening size is read from the name. Nothing here is a hardcoded size list.
 * "Cut to fit" wins over a millimetre figure, because a maximum opening in a
 * cut-to-fit name is not the size someone buys.
 */

export const SHOP_ROOMS = ['onePiece', 'twoPiece', 'barriers', 'accessories'] as const;

export type ShopRoom = (typeof SHOP_ROOMS)[number];

export const SHOP_KINDS = ['pouches', 'barriers', 'accessories', 'kits'] as const;

export type ShopKind = (typeof SHOP_KINDS)[number];

export type PouchSystem = 'one' | 'two';

/** Manufacturer names. Not copy, and never translated. */
export const PREFERRED_BRANDS = ['Coloplast', 'Hollister', 'Convatec'] as const;

export const CUT_TO_FIT = 'cut-to-fit';

export type OpeningSize = { type: 'mm'; mm: number } | { type: 'cut-to-fit' };

const CUT_TO_FIT_NAME =
  /cut[\s-]*to[\s-]*fit|à\s+découper|a\s+decouper|découp|decoup|coupée?\s+à\s+la\s+taille|coupe\s+à\s+la\s+taille|taille\s+à\s+couper/i;
const MILLIMETRE_NAME = /(\d+)\s*mm\b/i;
const ONE_PIECE_NAME =
  /1-piece|one-piece|1 piece|1 pièce|une pièce|une piece|à une pièce|a une piece|premier one-piece|pouchkins newborn|pouchkins drainable pediatric one|activelife/;
const POUCH_ONE_PIECE_NAME =
  /1-piece|one-piece|1 piece|1 pièce|une pièce|une piece|à une pièce|a une piece|premier one|assura 1|sensura 1|sensura light 1|activelife|pouchkins/;
const TWO_PIECE_NAME =
  /2-piece|two-piece|2 piece|2 pièces|deux pièces|deux pieces|à deux pièces|a deux pieces|new image two|sensura mio click|sensura click|natura 2|sur-fit/;
const BARRIER_NAME =
  /barrier|barrière|barriere|flange|bride|flasque|wafer|ring|anneau|paste|pâte|pate|powder|poudre|flextend|flexwear|ceraplus|stomahesive|eakin/;
const ACCESSORY_NAME =
  /belt|ceinture|clamp|clampe|deodorant|désodorisant|desodorisant|odor|adapter|adaptateur|wipe|lingette|remover|sheet|feuille|lubricat|sponge|éponge|eponge/;
const POUCH_NAME = /pouch|pochette|\bpoche\b|\bsac\b/;

export function roomForProductName(name: string): ShopRoom {
  const n = name.toLowerCase();

  if (ONE_PIECE_NAME.test(n)) {
    return 'onePiece';
  }

  if (TWO_PIECE_NAME.test(n)) {
    return 'twoPiece';
  }

  if (BARRIER_NAME.test(n) && !POUCH_NAME.test(n)) {
    return 'barriers';
  }

  if (ACCESSORY_NAME.test(n)) {
    return 'accessories';
  }

  if (POUCH_NAME.test(n)) {
    return POUCH_ONE_PIECE_NAME.test(n) ? 'onePiece' : 'twoPiece';
  }

  return 'accessories';
}

export function openingSize(name: string): OpeningSize | null {
  if (CUT_TO_FIT_NAME.test(name)) {
    return { type: 'cut-to-fit' };
  }

  const match = MILLIMETRE_NAME.exec(name);

  if (!match?.[1]) {
    return null;
  }

  const mm = Number(match[1]);

  if (!Number.isInteger(mm) || mm <= 0 || mm >= 200) {
    return null;
  }

  return { type: 'mm', mm };
}

export function sizeToken(size: OpeningSize): string {
  return size.type === 'cut-to-fit' ? CUT_TO_FIT : String(size.mm);
}

export function orderedBrandNames(names: ReadonlyArray<string | null | undefined>): string[] {
  const byKey = new Map<string, string>();

  names.forEach((name) => {
    const trimmed = name?.trim();

    if (!trimmed) {
      return;
    }

    const key = trimmed.toLowerCase();

    if (!byKey.has(key)) {
      byKey.set(key, trimmed);
    }
  });

  const preferredKeys = PREFERRED_BRANDS.map((brand) => brand.toLowerCase());
  const preferred = preferredKeys
    .map((key) => byKey.get(key))
    .filter((name): name is string => name != null);
  const rest = [...byKey.entries()]
    .filter(([key]) => !preferredKeys.includes(key))
    .map(([, name]) => name)
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));

  return [...preferred, ...rest];
}

export function orderedSizes(sizes: ReadonlyArray<OpeningSize | null>): OpeningSize[] {
  const millimetres = [
    ...new Set(sizes.flatMap((size) => (size?.type === 'mm' ? [size.mm] : []))),
  ].sort((a, b) => a - b);
  const cutToFit = sizes.some((size) => size?.type === 'cut-to-fit');

  return [
    ...millimetres.map((mm) => ({ type: 'mm' as const, mm })),
    ...(cutToFit ? [{ type: 'cut-to-fit' as const }] : []),
  ];
}

export interface ShelfFacts {
  name: string;
  brand: string | null;
  room: ShopRoom;
  isKit: boolean;
  size: OpeningSize | null;
}

export interface ShelfSelection {
  kind?: ShopKind;
  system?: PouchSystem;
  brands: readonly string[];
  sizes: readonly string[];
  term?: string;
}

function sameName(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function matchesKind(item: ShelfFacts, kind?: ShopKind, system?: PouchSystem): boolean {
  if (kind == null) {
    return true;
  }

  if (kind === 'kits') {
    return item.isKit;
  }

  if (item.isKit) {
    return false;
  }

  if (kind === 'barriers') {
    return item.room === 'barriers';
  }

  if (kind === 'accessories') {
    return item.room === 'accessories';
  }

  if (item.room !== 'onePiece' && item.room !== 'twoPiece') {
    return false;
  }

  if (system === 'one') {
    return item.room === 'onePiece';
  }

  if (system === 'two') {
    return item.room === 'twoPiece';
  }

  return true;
}

export function matchesShelf(item: ShelfFacts, selection: ShelfSelection): boolean {
  if (
    !matchesKind(item, selection.kind, selection.kind === 'pouches' ? selection.system : undefined)
  ) {
    return false;
  }

  if (selection.brands.length > 0) {
    const brand = item.brand?.trim() ?? '';

    if (!selection.brands.some((selected) => sameName(selected, brand))) {
      return false;
    }
  }

  if (selection.sizes.length > 0) {
    if (item.size == null || !selection.sizes.includes(sizeToken(item.size))) {
      return false;
    }
  }

  const term = selection.term?.trim();

  if (term) {
    const haystack = item.name.toLowerCase();
    const words = term.toLowerCase().split(/\s+/).filter(Boolean);

    if (!words.every((word) => haystack.includes(word))) {
      return false;
    }
  }

  return true;
}

export function countShelf(items: readonly ShelfFacts[], selection: ShelfSelection): number {
  return items.reduce((count, item) => (matchesShelf(item, selection) ? count + 1 : count), 0);
}
