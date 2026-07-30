export interface CuratedKitComponent {
  productEntityId: number;
  /** Fallback label if the catalog product cannot be resolved. */
  name: string;
  defaultQuantity?: number;
}

export interface CuratedKit {
  slug: string;
  name: string;
  description: string;
  /**
   * Show this kit on category pages whose path matches any of these
   * (trailing slashes ignored; match is by endsWith or exact).
   */
  categoryPathMatchers: string[];
  components: CuratedKitComponent[];
}

/**
 * Curated kits configured in code until kit parent products exist in BigCommerce.
 * Add new kits here and optionally assign them to category paths.
 */
export const CURATED_KITS: CuratedKit[] = [
  {
    slug: 'first-cycle-starter-kit',
    name: 'First Cycle Starter Kit',
    description:
      'A thoughtfully curated starter set for first-period care. Review what’s included, remove anything you don’t need, or add items back before adding the kit to your cart.',
    categoryPathMatchers: [
      '/shop-womens-health',
      '/liivv-health/womens-health/liivv-health-shop/shop-womens-health',
    ],
    components: [
      { productEntityId: 7828, name: 'joni Organic Bamboo Regular Pads' },
      { productEntityId: 7847, name: 'joni Organic Bamboo Super Pads' },
      { productEntityId: 7810, name: 'joni Bamboo Overnight Pads' },
      { productEntityId: 7876, name: 'Natracare Organic Cotton Intimate Wipes' },
      { productEntityId: 7849, name: 'Rael Natural Foaming Feminine Wash' },
      { productEntityId: 7970, name: 'L. Organic Cotton Tampons Regular Absorbency' },
      { productEntityId: 7971, name: 'Rael Reusable Period Underwear' },
      { productEntityId: 7972, name: 'Natracare Organic Cotton Panty Liners' },
    ],
  },
];

function normalizePath(path: string): string {
  const trimmed = path.trim().toLowerCase();

  if (trimmed.length > 1 && trimmed.endsWith('/')) {
    return trimmed.slice(0, -1);
  }

  return trimmed;
}

export function getCuratedKitBySlug(slug: string): CuratedKit | undefined {
  return CURATED_KITS.find((kit) => kit.slug === slug);
}

export function getCuratedKitsForCategoryPath(categoryPath: string): CuratedKit[] {
  const normalizedCategory = normalizePath(categoryPath);

  return CURATED_KITS.filter((kit) =>
    kit.categoryPathMatchers.some((matcher) => {
      const normalizedMatcher = normalizePath(matcher);

      return (
        normalizedCategory === normalizedMatcher ||
        normalizedCategory.endsWith(normalizedMatcher)
      );
    }),
  );
}
