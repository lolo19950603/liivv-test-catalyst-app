import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import { pathnameMatchesPrefix } from '~/lib/makeswift/site-header/should-hide-store-header';

export const WOMENS_HEALTH_PATH = '/liivv-health/womens-health';
export const CLAIR_HEALTH_PATH = `${WOMENS_HEALTH_PATH}/clair-health`;
export const SHOP_WOMENS_HEALTH_PATH = '/liivv-health/womens-health/shop-womens-health';

const CHAPTER_IMG = '/archive/womens-health';

/**
 * Keep labels/slugs in sync with
 * `app/.../womens-health/chapters/chapters-data.ts`.
 * Defined here (not imported) so the site header stays free of chapter page copy.
 * `image` drives the mega-menu preview (replaces the Liivv logo fallback).
 */
const CHAPTER_LINKS = [
  {
    label: 'Foundation & First Cycles',
    href: `${WOMENS_HEALTH_PATH}/chapters/foundation-first-cycles`,
    image: {
      src: `${CHAPTER_IMG}/chapter-1.jpg`,
      alt: 'Foundation & First Cycles',
    },
  },
  {
    label: 'Rhythm & Balance',
    href: `${WOMENS_HEALTH_PATH}/chapters/rhythm-and-balance`,
    image: {
      src: `${CHAPTER_IMG}/chapter-2.jpg`,
      alt: 'Rhythm & Balance',
    },
  },
  {
    label: 'Reset & Recharge',
    href: `${WOMENS_HEALTH_PATH}/chapters/reset-and-recharge`,
    image: {
      src: `${CHAPTER_IMG}/chapter-3.jpg`,
      alt: 'Reset & Recharge',
    },
  },
  {
    label: 'Grow & Recover',
    href: `${WOMENS_HEALTH_PATH}/chapters/grow-and-recover`,
    image: {
      src: `${CHAPTER_IMG}/chapter-4.jpg`,
      alt: 'Grow & Recover',
    },
  },
  {
    label: 'Transition & Relief',
    href: `${WOMENS_HEALTH_PATH}/chapters/transition-and-relief`,
    image: {
      src: `${CHAPTER_IMG}/chapter-5.jpg`,
      alt: 'Transition & Relief',
    },
  },
  {
    label: 'Longevity & Vitality',
    href: `${WOMENS_HEALTH_PATH}/chapters/longevity-and-vitality`,
    image: {
      src: `${CHAPTER_IMG}/chapter-6.jpg`,
      alt: 'Longevity & Vitality',
    },
  },
] as const;

const WOMENS_HEALTH_NAV: LiivvArchiveNavLink[] = [
  {
    label: "Women's Health",
    href: WOMENS_HEALTH_PATH,
  },
  {
    label: 'Clair Health',
    href: CLAIR_HEALTH_PATH,
  },
  {
    label: 'Find Your Chapter',
    href: `${WOMENS_HEALTH_PATH}#where-are-you`,
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
];

/** Custom header nav for the Women's Health route. */
export function getWomensHealthNav(): LiivvArchiveNavLink[] {
  return WOMENS_HEALTH_NAV;
}

export function shouldShowLiivvHealthNav(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, WOMENS_HEALTH_PATH);
}
