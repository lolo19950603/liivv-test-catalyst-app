import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

export type MakeswiftAdditionalLinkInput = {
  label: string;
  link: { href?: string };
};

/** Flat extra nav links authored in Makeswift (appended after store categories). */
export function mapMakeswiftAdditionalLinks(
  links: MakeswiftAdditionalLinkInput[],
): LiivvArchiveNavLink[] {
  return links
    .filter((item) => item.label.trim().length > 0)
    .map((item) => ({
      label: item.label,
      href: resolveMakeswiftHref(item.link.href, '/'),
    }));
}
