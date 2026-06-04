import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';

import { buildStoreNavFromCategoryTree, type StoreCategoryNode } from './build-store-nav-from-categories';
import {
  mapMakeswiftAdditionalLinks,
  type MakeswiftAdditionalLinkInput,
} from './map-makeswift-nav-links';

export function resolveStoreNavLinks(
  additionalLinks: MakeswiftAdditionalLinkInput[],
  categoryTree: StoreCategoryNode[],
): LiivvArchiveNavLink[] {
  const fromStore = buildStoreNavFromCategoryTree(categoryTree);
  const fromMakeswift = mapMakeswiftAdditionalLinks(additionalLinks);

  return [...fromStore, ...fromMakeswift];
}
