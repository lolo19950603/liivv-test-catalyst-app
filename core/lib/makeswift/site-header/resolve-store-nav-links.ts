import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import {
  normalizeHidePath,
  stripLocaleFromPathname,
} from '~/lib/makeswift/site-header/should-hide-store-header';

import { buildStoreNavFromCategoryTree, type StoreCategoryNode } from './build-store-nav-from-categories';
import { getStoreLiivvHealthNavItem } from './inject-liivv-health-nav';
import {
  mapMakeswiftAdditionalLinks,
  type MakeswiftAdditionalLinkInput,
} from './map-makeswift-nav-links';

function isLiivvHealthLabel(label: string): boolean {
  return label.trim().toLowerCase() === 'liivv health';
}

/** Temporarily hide Blog from the storefront header (CMS link can stay). */
function isBlogNavLink(link: Pick<LiivvArchiveNavLink, 'label' | 'href'>): boolean {
  if (link.label.trim().toLowerCase() === 'blog') {
    return true;
  }

  const href = link.href?.trim();

  if (!href) {
    return false;
  }

  return normalizeHidePath(stripLocaleFromPathname(href)) === '/blog';
}

function isHiddenStoreNavLink(link: Pick<LiivvArchiveNavLink, 'label' | 'href'>): boolean {
  return isLiivvHealthLabel(link.label) || isBlogNavLink(link);
}

export function resolveStoreNavLinks(
  additionalLinks: MakeswiftAdditionalLinkInput[],
  categoryTree: StoreCategoryNode[],
): LiivvArchiveNavLink[] {
  const fromStore = buildStoreNavFromCategoryTree(categoryTree).filter(
    (link) => !isHiddenStoreNavLink(link),
  );
  const fromMakeswift = mapMakeswiftAdditionalLinks(additionalLinks).filter(
    (link) => !isHiddenStoreNavLink(link),
  );

  return [...fromStore, getStoreLiivvHealthNavItem(), ...fromMakeswift];
}
