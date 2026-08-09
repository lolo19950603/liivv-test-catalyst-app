import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import { pathnameMatchesPrefix } from '~/lib/makeswift/site-header/should-hide-store-header';

export const WOMEN_HEALTH_DEMO_PATH = '/liivv-health/womens-health-demo';

const LIIVV_HEALTH_NAV: LiivvArchiveNavLink = {
  label: 'Liivv Health',
  href: WOMEN_HEALTH_DEMO_PATH,
  columns: [
    {
      links: [
        {
          label: "Women's Health Demo",
          href: WOMEN_HEALTH_DEMO_PATH,
        },
      ],
    },
  ],
};

export function shouldShowLiivvHealthNav(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, WOMEN_HEALTH_DEMO_PATH);
}

/** Insert Liivv Health after “Liivv Your Life” (or before Blog) when on the WH demo. */
export function injectLiivvHealthNav(links: LiivvArchiveNavLink[]): LiivvArchiveNavLink[] {
  if (links.some((link) => link.label.trim().toLowerCase() === 'liivv health')) {
    return links;
  }

  const afterYourLife = links.findIndex((link) =>
    /liivv\s+your\s+life/i.test(link.label.trim()),
  );

  if (afterYourLife >= 0) {
    return [...links.slice(0, afterYourLife + 1), LIIVV_HEALTH_NAV, ...links.slice(afterYourLife + 1)];
  }

  const beforeBlog = links.findIndex((link) => /^blog$/i.test(link.label.trim()));

  if (beforeBlog >= 0) {
    return [...links.slice(0, beforeBlog), LIIVV_HEALTH_NAV, ...links.slice(beforeBlog)];
  }

  return [...links, LIIVV_HEALTH_NAV];
}
