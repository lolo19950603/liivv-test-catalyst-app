import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { getFormatter } from 'next-intl/server';

import { pricesTransformer } from '~/data-transformers/prices-transformer';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';
import type { StoreCategoryNode } from '~/lib/makeswift/site-header/build-store-nav-from-categories';

import type { HomeCategory, HomeProduct, HomeProductCategory } from './home-types';

const IMG = '/archive/liivv-home';

/** Fallback lifestyle tiles when a BC category has no image */
const FALLBACK_IMAGES = [
  `${IMG}/hero-living.png`,
  `${IMG}/corner-nutrition.png`,
  `${IMG}/corner-personal.png`,
  `${IMG}/corner-skin.png`,
  `${IMG}/corner-sleep.png`,
  `${IMG}/corner-heart.png`,
  `${IMG}/corner-breathing.png`,
  `${IMG}/care-chat.png`,
] as const;

type PriceNode = Parameters<typeof pricesTransformer>[0];

type ProductImageNode = { altText: string; url: string; isDefault?: boolean };

type ProductNode = {
  entityId: number;
  name: string;
  path: string;
  defaultImage?: { altText: string; url: string } | null;
  images?: {
    edges?: Array<{ node: ProductImageNode | null } | null> | null;
  } | null;
  prices?: PriceNode;
  categories?: {
    edges?: Array<{ node: HomeProductCategory } | null> | null;
  } | null;
};

function priceLabelFrom(
  prices: PriceNode,
  format: Awaited<ReturnType<typeof getFormatter>>,
): string | undefined {
  const price = pricesTransformer(prices ?? null, format);

  if (typeof price === 'string') return price;
  if (price?.type === 'sale') return price.currentValue;
  if (price?.type === 'range') return `From ${price.minValue}`;

  return undefined;
}

function pickProductImage(
  node: Pick<ProductNode, 'name' | 'defaultImage' | 'images'>,
): { src: string; alt: string } | undefined {
  const gallery = removeEdgesAndNodes(node.images ?? { edges: [] }).filter((image) =>
    Boolean(image.url?.trim()),
  );
  const preferred =
    (node.defaultImage?.url?.trim() ? node.defaultImage : null) ??
    gallery.find((image) => image.isDefault) ??
    gallery[0] ??
    null;

  if (!preferred?.url?.trim()) {
    return undefined;
  }

  const src = resolveBcCdnImageUrl(preferred.url, 640);
  if (!src) return undefined;

  return {
    src,
    alt: preferred.altText || node.name,
  };
}

export function mapHomeProducts(
  connection: { edges?: Array<{ node: ProductNode } | null> | null } | null | undefined,
  format: Awaited<ReturnType<typeof getFormatter>>,
): HomeProduct[] {
  return removeEdgesAndNodes(connection ?? { edges: [] }).map((node) => {
    const categories = removeEdgesAndNodes(node.categories ?? { edges: [] }).map((cat) => ({
      name: cat.name,
      path: cat.path,
    }));

    return {
      entityId: node.entityId,
      name: node.name,
      path: node.path,
      image: pickProductImage(node),
      priceLabel: priceLabelFrom(node.prices ?? null, format),
      categories,
    };
  });
}

function isYourLifeRoot(name: string) {
  return /your\s*life/i.test(name);
}

export function findYourLifeRoot(
  tree: StoreCategoryNode[],
): { name: string; path: string } | null {
  const yourLife = tree.find((node) => isYourLifeRoot(node.name));
  if (!yourLife) return null;
  return { name: yourLife.name, path: yourLife.path };
}

/**
 * Prefer children of the "Liivv Your Life" root; otherwise top-level shop categories.
 */
export function pickYourLifeCategories(tree: StoreCategoryNode[], limit = 8): HomeCategory[] {
  if (!tree.length) {
    return [
      {
        name: 'Shop all',
        path: '/shop-all',
        image: { src: FALLBACK_IMAGES[0], alt: 'Shop all' },
      },
    ];
  }

  const yourLife = tree.find((node) => isYourLifeRoot(node.name));
  const source =
    yourLife?.children && yourLife.children.length > 0
      ? yourLife.children
      : tree.length === 1 && tree[0]?.children?.length
        ? tree[0].children
        : tree;

  return source.slice(0, limit).map((node, index) => ({
    name: node.name,
    path: node.path,
    image: node.image?.src
      ? { src: node.image.src, alt: node.image.alt || node.name }
      : {
          src: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length] ?? FALLBACK_IMAGES[0],
          alt: node.name,
        },
  }));
}

/** True if product sits in this main Your Life category (or a child path). */
export function productMatchesCategory(product: HomeProduct, category: HomeCategory): boolean {
  const base = category.path.replace(/\/$/, '').toLowerCase();
  const catName = category.name.toLowerCase();

  if (
    product.categories.some((cat) => {
      const path = cat.path.replace(/\/$/, '').toLowerCase();
      const name = cat.name.toLowerCase();
      return path === base || path.startsWith(`${base}/`) || name === catName;
    })
  ) {
    return true;
  }

  // Fallback when category edges are missing on the product node
  const productPath = product.path.replace(/\/$/, '').toLowerCase();
  return Boolean(base) && (productPath === base || productPath.startsWith(`${base}/`));
}

/** Product belongs under Liivv Your Life (root or any shelf we expose). */
export function isYourLifeProduct(
  product: HomeProduct,
  categories: HomeCategory[],
  root?: { name: string; path: string } | null,
): boolean {
  if (root) {
    const rootAsCategory: HomeCategory = {
      name: root.name,
      path: root.path,
      image: { src: '', alt: root.name },
    };
    if (productMatchesCategory(product, rootAsCategory)) {
      return true;
    }
  }

  return categories.some((category) => productMatchesCategory(product, category));
}

export function filterYourLifeProducts(
  products: HomeProduct[],
  categories: HomeCategory[],
  root?: { name: string; path: string } | null,
  limit = 24,
): HomeProduct[] {
  return products.filter((product) => isYourLifeProduct(product, categories, root)).slice(0, limit);
}

/** Tabs: All + Your Life shelves that currently have new products. */
export function buildNewestCategoryTabs(
  products: HomeProduct[],
  categories: HomeCategory[],
): Array<{ id: string; label: string; path: string }> {
  const all = { id: 'all', label: 'All', path: '' };
  const withHits = categories.filter((category) =>
    products.some((product) => productMatchesCategory(product, category)),
  );

  if (withHits.length > 0) {
    return [all, ...withHits.map((c) => ({ id: c.path, label: c.name, path: c.path }))];
  }

  // Still show the shelves so customers can browse empty rooms
  if (categories.length > 0) {
    return [all, ...categories.map((c) => ({ id: c.path, label: c.name, path: c.path }))];
  }

  return [all];
}
