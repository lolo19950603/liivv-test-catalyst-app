import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import { distributeIntoColumns } from './build-store-nav-from-categories';

export type MakeswiftAdditionalSubLinkInput = {
  label: string;
  link: { href?: string };
  previewImage?: string;
  previewImageAlt?: string;
};

export type MakeswiftAdditionalLinkInput = {
  label: string;
  link: { href?: string };
  exploreAllLabel?: string;
  subLinks?: MakeswiftAdditionalSubLinkInput[];
};

function mapMakeswiftNavImage(
  src: string | undefined,
  alt: string | undefined,
  fallbackLabel: string,
): LiivvArchiveNavLink['featuredImage'] {
  const trimmed = src?.trim();

  if (trimmed == null || trimmed.length === 0) {
    return null;
  }

  const trimmedAlt = alt?.trim();

  return {
    src: trimmed,
    alt: trimmedAlt && trimmedAlt.length > 0 ? trimmedAlt : fallbackLabel,
  };
}

/** Extra nav links from Makeswift (optional mega menu + hover preview images). */
export function mapMakeswiftAdditionalLinks(
  links: MakeswiftAdditionalLinkInput[],
): LiivvArchiveNavLink[] {
  return links
    .filter((item) => item.label.trim().length > 0)
    .map((item) => {
      const href = resolveMakeswiftHref(item.link.href, '/');

      const subLinks = (item.subLinks ?? [])
        .filter((sub) => sub.label.trim().length > 0)
        .map((sub) => ({
          label: sub.label,
          href: resolveMakeswiftHref(sub.link.href, '/'),
          image: mapMakeswiftNavImage(sub.previewImage, sub.previewImageAlt, sub.label),
        }));

      const columns = subLinks.length > 0 ? distributeIntoColumns(subLinks) : undefined;
      const exploreAllLabel = item.exploreAllLabel?.trim();

      return {
        label: item.label,
        href,
        columns,
        exploreAll:
          columns != null && columns.length > 0
            ? {
                label: exploreAllLabel && exploreAllLabel.length > 0 ? exploreAllLabel : 'Explore All',
                href,
              }
            : undefined,
      };
    });
}
