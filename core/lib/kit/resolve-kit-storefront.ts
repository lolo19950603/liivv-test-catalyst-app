import { getSearchResults } from '~/client/queries/get-search-results';

import type { KitRecord } from './types';

/** Fill kit product page URL and image when they were not stored on add-to-cart. */
export async function resolveKitStorefront(kit: KitRecord): Promise<KitRecord> {
  if ((kit.href && kit.image) || !kit.name?.trim()) {
    return kit;
  }

  const result = await getSearchResults(kit.name);

  if (result.status !== 'success') {
    return kit;
  }

  const match =
    result.data.products.find((product) => product.name === kit.name) ?? result.data.products[0];

  if (!match) {
    return kit;
  }

  return {
    ...kit,
    href: kit.href ?? match.path,
    image:
      kit.image ??
      (match.defaultImage
        ? { src: match.defaultImage.url, alt: match.defaultImage.altText || kit.name }
        : undefined),
  };
}
