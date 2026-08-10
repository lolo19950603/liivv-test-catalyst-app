import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import { pathnameMatchesPrefix } from '~/lib/makeswift/site-header/should-hide-store-header';

export const WOMEN_HEALTH_DEMO_PATH = '/liivv-health/womens-health-demo';
export const CLAIR_HEALTH_PATH = `${WOMEN_HEALTH_DEMO_PATH}/clair-health`;
export const SHOP_WOMENS_HEALTH_PATH = '/liivv-health/womens-health/shop-womens-health';

/**
 * Keep labels/slugs in sync with
 * `app/.../womens-health-demo/chapters/chapters-data.ts`.
 * Defined here (not imported) so the site header stays free of chapter page copy.
 */
const CHAPTER_LINKS = [
  {
    label: 'Foundation & First Cycles',
    href: `${WOMEN_HEALTH_DEMO_PATH}/chapters/foundation-first-cycles`,
  },
  {
    label: 'Rhythm & Balance',
    href: `${WOMEN_HEALTH_DEMO_PATH}/chapters/rhythm-and-balance`,
  },
  {
    label: 'Reset & Recharge',
    href: `${WOMEN_HEALTH_DEMO_PATH}/chapters/reset-and-recharge`,
  },
  {
    label: 'Grow & Recover',
    href: `${WOMEN_HEALTH_DEMO_PATH}/chapters/grow-and-recover`,
  },
  {
    label: 'Transition & Relief',
    href: `${WOMEN_HEALTH_DEMO_PATH}/chapters/transition-and-relief`,
  },
  {
    label: 'Longevity & Vitality',
    href: `${WOMEN_HEALTH_DEMO_PATH}/chapters/longevity-and-vitality`,
  },
] as const;

/** Custom header nav for the Women’s Health demo route only. */
export function getWomensHealthDemoNav(): LiivvArchiveNavLink[] {
  return [
    {
      label: "Women's Health",
      href: WOMEN_HEALTH_DEMO_PATH,
    },
    {
      label: 'Find Your Chapter',
      href: `${WOMEN_HEALTH_DEMO_PATH}#where-are-you`,
      columns: [
        {
          links: [...CHAPTER_LINKS],
        },
      ],
    },
    {
      label: "Shop Women's Health Essentials",
      href: SHOP_WOMENS_HEALTH_PATH,
    },
    {
      label: 'Clair Health',
      href: CLAIR_HEALTH_PATH,
    },
  ];
}

export function shouldShowLiivvHealthNav(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, WOMEN_HEALTH_DEMO_PATH);
}
