import { cache } from 'react';

import { getChannelIdFromLocale } from '~/channels.config';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';

const CATEGORY_IMAGE_WIDTH = 640;

export type StoreCategoryRecord = {
  entityId: number;
  name: string;
  path: string;
  breadcrumb: string;
  image: { src: string; alt: string } | null;
};

const CategoryTreeChildrenQuery = graphql(`
  query CategoryTreeChildrenWithImages($rootEntityId: Int!) {
    site {
      categoryTree(rootEntityId: $rootEntityId) {
        name
        path
        entityId
        image {
          url: urlTemplate(lossy: true)
          altText
        }
        children {
          name
          path
          entityId
          image {
            url: urlTemplate(lossy: true)
            altText
          }
        }
      }
    }
  }
`);

type CategoryNode = {
  name: string;
  path: string;
  entityId: number;
  image: { src: string; alt: string } | null;
};

type FrontierNode = {
  entityId: number;
  breadcrumb: string[];
};

const memoryCache = new Map<string, { expiresAt: number; categories: StoreCategoryRecord[] }>();
const MEMORY_CACHE_MS = 60 * 60 * 1000;

function mapCategoryImage(
  image: { url: string; altText: string } | null | undefined,
): CategoryNode['image'] {
  if (image?.url == null || image.url.trim().length === 0) {
    return null;
  }

  return {
    src: resolveBcCdnImageUrl(image.url, CATEGORY_IMAGE_WIDTH),
    alt: image.altText ?? '',
  };
}

async function fetchCategoryChildren(
  rootEntityId: number,
  locale?: string,
): Promise<CategoryNode[]> {
  const channelId = getChannelIdFromLocale(locale);

  const response = await client.fetch({
    document: CategoryTreeChildrenQuery,
    variables: { rootEntityId },
    channelId,
    fetchOptions: {
      ...(locale ? { headers: { 'Accept-Language': locale } } : {}),
      next: { revalidate },
    },
  });

  const node = response.data.site.categoryTree[0];

  if (node == null) {
    return [];
  }

  if (rootEntityId === 0) {
    return node.children.map((child) => ({
      name: child.name,
      path: child.path,
      entityId: child.entityId,
      image: mapCategoryImage(child.image),
    }));
  }

  return [
    {
      name: node.name,
      path: node.path,
      entityId: node.entityId,
      image: mapCategoryImage(node.image),
    },
    ...node.children.map((child) => ({
      name: child.name,
      path: child.path,
      entityId: child.entityId,
      image: mapCategoryImage(child.image),
    })),
  ];
}

async function fetchStoreCategoryCatalogUncached(locale?: string): Promise<StoreCategoryRecord[]> {
  const rows: StoreCategoryRecord[] = [];
  const seen = new Set<number>();
  let frontier: FrontierNode[] = [];

  const topLevel = await fetchCategoryChildren(0, locale);

  for (const node of topLevel) {
    if (seen.has(node.entityId)) {
      continue;
    }

    seen.add(node.entityId);
    rows.push({
      entityId: node.entityId,
      name: node.name,
      path: node.path,
      breadcrumb: node.name,
      image: node.image,
    });
    frontier.push({ entityId: node.entityId, breadcrumb: [node.name] });
  }

  while (frontier.length > 0) {
    const waveResults = await Promise.all(
      frontier.map(async (parent) => ({
        parent,
        nodes: await fetchCategoryChildren(parent.entityId, locale),
      })),
    );

    const nextFrontier: FrontierNode[] = [];

    for (const { parent, nodes } of waveResults) {
      for (const node of nodes) {
        if (node.entityId === parent.entityId || seen.has(node.entityId)) {
          continue;
        }

        seen.add(node.entityId);
        const breadcrumbParts = [...parent.breadcrumb, node.name];

        rows.push({
          entityId: node.entityId,
          name: node.name,
          path: node.path,
          breadcrumb: breadcrumbParts.join(' > '),
          image: node.image,
        });

        nextFrontier.push({
          entityId: node.entityId,
          breadcrumb: breadcrumbParts,
        });
      }
    }

    frontier = nextFrontier;
  }

  return rows;
}

async function getStoreCategoryCatalogWithMemoryCache(
  locale?: string,
): Promise<StoreCategoryRecord[]> {
  const cacheKey = locale ?? 'default';
  const cached = memoryCache.get(cacheKey);

  if (cached != null && cached.expiresAt > Date.now()) {
    return cached.categories;
  }

  const categories = await fetchStoreCategoryCatalogUncached(locale);

  memoryCache.set(cacheKey, {
    categories,
    expiresAt: Date.now() + MEMORY_CACHE_MS,
  });

  return categories;
}

export const getStoreCategoryCatalog = cache(getStoreCategoryCatalogWithMemoryCache);

export async function getCategoriesByIds(
  entityIds: number[],
  locale?: string,
): Promise<StoreCategoryRecord[]> {
  if (entityIds.length === 0) {
    return [];
  }

  const catalog = await getStoreCategoryCatalog(locale);
  const byId = new Map(catalog.map((category) => [category.entityId, category]));

  return entityIds
    .map((entityId) => byId.get(entityId))
    .filter((category): category is StoreCategoryRecord => category != null);
}
