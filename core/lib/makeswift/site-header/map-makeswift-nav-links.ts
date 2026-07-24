import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import { distributeIntoColumns } from './build-store-nav-from-categories';

export type MakeswiftAdditionalSubLinkInput = {
  label?: string;
  link?: { href?: string };
  previewImage?: string;
  previewImageAlt?: string;
};

export type MakeswiftAdditionalLinkInput = {
  label?: string;
  link?: { href?: string };
  subLinks?: MakeswiftAdditionalSubLinkInput[];
};

function hasNavLabel(label: string | undefined): boolean {
  return (label?.trim() ?? '').length > 0;
}

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
    .filter((item) => hasNavLabel(item.label))
    .map((item) => {
      const label = item.label!.trim();
      const href = resolveMakeswiftHref(item.link?.href, '/');

      const subLinks = (item.subLinks ?? [])
        .filter((sub) => hasNavLabel(sub.label))
        .map((sub) => {
          const subLabel = sub.label!.trim();

          return {
            label: subLabel,
            href: resolveMakeswiftHref(sub.link?.href, '/'),
            image: mapMakeswiftNavImage(sub.previewImage, sub.previewImageAlt, subLabel),
          };
        });

      const columns = subLinks.length > 0 ? distributeIntoColumns(subLinks) : undefined;

      return {
        label,
        href,
        columns,
      };
    });
}
