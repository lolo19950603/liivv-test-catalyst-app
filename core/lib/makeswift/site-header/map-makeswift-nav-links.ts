import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import { DEFAULT_SITE_MEGA_NAV } from './default-mega-nav';

type MakeswiftSubLink = {
  label: string;
  link: { href?: string };
};

type MakeswiftColumn = {
  label?: string;
  link?: { href?: string };
  links?: MakeswiftSubLink[];
};

export type MakeswiftNavLinkInput = {
  label: string;
  link: { href?: string };
  exploreAllLabel?: string;
  exploreAllLink?: { href?: string };
  groups?: MakeswiftColumn[];
};

export function mapMakeswiftNavLinks(links: MakeswiftNavLinkInput[]): LiivvArchiveNavLink[] {
  if (links.length === 0) {
    return DEFAULT_SITE_MEGA_NAV;
  }

  const mapped = links.map((item) => {
    const columns =
      item.groups
        ?.map((group) => ({
          links: (group.links ?? []).map((sub) => ({
            label: sub.label,
            href: resolveMakeswiftHref(sub.link.href, '/shop-all'),
          })),
        }))
        .filter((col) => col.links.length > 0) ?? [];

    const exploreAllLabel = item.exploreAllLabel?.trim();
    const exploreAllHref = item.exploreAllLink?.href;

    return {
      label: item.label,
      href: resolveMakeswiftHref(item.link.href, '/'),
      columns: columns.length > 0 ? columns : undefined,
      exploreAll:
        exploreAllLabel && exploreAllHref
          ? {
              label: exploreAllLabel,
              href: resolveMakeswiftHref(exploreAllHref, '/shop-all'),
            }
          : columns.length > 0
            ? { label: 'Explore All', href: '/shop-all' }
            : undefined,
    };
  });

  const hasMegaMenu = mapped.some((item) => (item.columns?.length ?? 0) > 0);

  return hasMegaMenu ? mapped : DEFAULT_SITE_MEGA_NAV;
}
