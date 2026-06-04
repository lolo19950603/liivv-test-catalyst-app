import type { FragmentOf } from 'gql.tada';

import type { HeaderLinksFragment } from '~/components/header/fragment';
import { resolveBcCdnImageUrl } from '~/lib/resolve-bc-cdn-image-url';

import type { StoreCategoryNode } from './build-store-nav-from-categories';

const CATEGORY_IMAGE_WIDTH = 640;

type CategoryTree = FragmentOf<typeof HeaderLinksFragment>['categoryTree'];
type CategoryTreeItem = CategoryTree[number];
type CategoryImage = NonNullable<CategoryTreeItem['image']>;

function mapCategoryImage(
  image: CategoryImage | null | undefined,
): StoreCategoryNode['image'] {
  if (image?.url == null || image.url.length === 0) {
    return null;
  }

  return {
    src: resolveBcCdnImageUrl(image.url, CATEGORY_IMAGE_WIDTH),
    alt: image.altText ?? '',
  };
}

function mapCategoryNode(node: CategoryTreeItem): StoreCategoryNode {
  return {
    name: node.name,
    path: node.path,
    image: mapCategoryImage(node.image),
    children: node.children?.map(mapCategoryNode),
  };
}

export function mapCategoryTreeFromStore(categoryTree: CategoryTree): StoreCategoryNode[] {
  return categoryTree.map(mapCategoryNode);
}
