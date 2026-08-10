import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';

import { buildStoreNavFromCategoryTree, type StoreCategoryNode } from './build-store-nav-from-categories';
import { getStoreLiivvHealthNavItem } from './inject-liivv-health-nav';
import {
  mapMakeswiftAdditionalLinks,
  type MakeswiftAdditionalLinkInput,
} from './map-makeswift-nav-links';

function isLiivvHealthLabel(label: string): boolean {
  return label.trim().toLowerCase() === 'liivv health';
}

export function resolveStoreNavLinks(
  additionalLinks: MakeswiftAdditionalLinkInput[],
  categoryTree: StoreCategoryNode[],
): LiivvArchiveNavLink[] {
  const fromStore = buildStoreNavFromCategoryTree(categoryTree).filter(
    (link) => !isLiivvHealthLabel(link.label),
  );
  const fromMakeswift = mapMakeswiftAdditionalLinks(additionalLinks).filter(
    (link) => !isLiivvHealthLabel(link.label),
  );

  return [...fromStore, getStoreLiivvHealthNavItem(), ...fromMakeswift];
}
