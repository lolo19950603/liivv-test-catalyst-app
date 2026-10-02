/*
 * Which two-piece pouch clicks onto which barrier.
 *
 * A match is the same coupling and the same flange size. New Image uses its
 * colour code. SenSura Click, Natura, and Assura do not interchange.
 * Sizes that are not printed on the variant come from the manufacturer's
 * item number. Assura is not in this map.
 */

export type FlangeKey =
  | 'ni-57-red'
  | 'ni-70-blue'
  | 'ni-44-green'
  | 'ni-102-yellow'
  | 'sc-50'
  | 'pk-44'
  | 'natura-57'
  | 'natura-45'
  | 'natura-70';

interface Coupling {
  barriers: number[];
  pouches: number[];
}

export const COUPLINGS: Record<FlangeKey, Coupling> = {
  'ni-57-red': {
    barriers: [4541, 4512, 5028, 5034],
    pouches: [4878, 4571, 4630, 4711],
  },
  'ni-70-blue': {
    barriers: [4541, 4512, 4204],
    pouches: [4878, 4581, 4691, 4711],
  },
  'ni-44-green': {
    barriers: [],
    pouches: [4878, 4581, 4711, 4567],
  },
  'ni-102-yellow': {
    barriers: [],
    pouches: [4300, 4203],
  },
  'sc-50': {
    barriers: [4583],
    pouches: [4438, 4365],
  },
  'pk-44': {
    barriers: [4899],
    pouches: [4968],
  },
  'natura-57': {
    barriers: [4268, 4264, 4511, 5070],
    pouches: [4235, 5065, 4837],
  },
  'natura-45': {
    barriers: [],
    pouches: [4257],
  },
  'natura-70': {
    barriers: [],
    pouches: [4240],
  },
};

/** One fixed flange size for a product the catalogue sells with no size option. */
export const FIXED_FLANGE_SIZES: Record<number, { flange: string; stoma?: string }> = {
  4264: { flange: '57 mm', stoma: '33–45 mm' },
  4511: { flange: '57 mm', stoma: '13–22 mm' },
  5070: { flange: '57 mm', stoma: '33–45 mm' },
  4235: { flange: '57 mm' },
  5065: { flange: '57 mm' },
  4837: { flange: '57 mm' },
  4257: { flange: '45 mm' },
  4240: { flange: '70 mm' },
};

const KEYS = Object.keys(COUPLINGS) as FlangeKey[];

export function keysForProduct(productId: number): FlangeKey[] {
  return KEYS.filter((key) => {
    const coupling = COUPLINGS[key];

    return coupling.barriers.includes(productId) || coupling.pouches.includes(productId);
  });
}

/** The other side of this coupling: pouches for a barrier, barriers for a pouch. */
export function matchesFor(productId: number, key: FlangeKey): number[] {
  const coupling = COUPLINGS[key];

  if (coupling.barriers.includes(productId)) {
    return coupling.pouches.filter((id) => id !== productId);
  }

  if (coupling.pouches.includes(productId)) {
    return coupling.barriers.filter((id) => id !== productId);
  }

  return [];
}

export function allMatchIds(productId: number): number[] {
  const ids = new Set<number>();

  keysForProduct(productId).forEach((key) => {
    matchesFor(productId, key).forEach((id) => ids.add(id));
  });

  return [...ids];
}

export interface FlangeOption {
  role: 'size' | 'colour';
  param: string;
  values: Array<{ id: string; label: string; isDefault: boolean }>;
}

export interface CompatibilityProduct {
  entityId: number;
  name: string;
  path: string;
  image?: { src: string; alt: string };
  priceLabel?: string;
}

export function optionRole(displayName: string): 'size' | 'colour' | null {
  const name = displayName.toLowerCase();

  if (name.includes('hole') || name.includes('length') || name.includes('quantit')) return null;
  if (name.includes('colour') || name.includes('color') || name.includes('couleur')) return 'colour';
  if (name.includes('size') || name.includes('taille') || name.includes('coupling')) return 'size';

  return null;
}

export function flangeKeyFromLabels(
  size: string | undefined,
  colour: string | undefined,
  allowed: readonly FlangeKey[],
): FlangeKey | null {
  const s = (size ?? '').toLowerCase();
  const c = (colour ?? '').toLowerCase();
  const fromSize: FlangeKey[] = [];

  if (s.includes('102')) fromSize.push('ni-102-yellow');
  if (s.includes('44')) fromSize.push('ni-44-green', 'pk-44');
  if (s.includes('57')) fromSize.push('ni-57-red', 'natura-57');
  if (s.includes('70')) fromSize.push('ni-70-blue', 'natura-70');
  if (s.includes('50')) fromSize.push('sc-50');
  if (s.includes('45') && !s.includes('145')) fromSize.push('natura-45');

  const sized = fromSize.find((key) => allowed.includes(key));

  if (sized) return sized;

  const fromColour: FlangeKey[] = [];

  if (c.includes('yellow')) fromColour.push('ni-102-yellow');
  if (c.includes('green')) fromColour.push('ni-44-green', 'pk-44');
  if (c.includes('red')) fromColour.push('ni-57-red', 'natura-57');
  if (c.includes('blue')) fromColour.push('ni-70-blue', 'natura-70');

  return fromColour.find((key) => allowed.includes(key)) ?? null;
}
