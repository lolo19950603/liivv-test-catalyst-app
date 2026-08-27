import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';
import {
  normalizeHidePath,
  pathnameMatchesPrefix,
  stripLocaleFromPathname,
} from '~/lib/makeswift/site-header/should-hide-store-header';

export const WOMENS_HEALTH_PATH = '/liivv-health/womens-health';
export const CLAIR_HEALTH_PATH = `${WOMENS_HEALTH_PATH}/clair-health`;
export const SHOP_WOMENS_HEALTH_PATH = '/liivv-health/womens-health/shop-womens-health';

/** Hub + care verticals for the global storefront header (not the WH route nav). */
export const LIIVV_HEALTH_HUB_PATH = '/liivv-health';
export const DIABETES_CARE_PATH = '/liivv-health/diabetes-care';
export const SHOP_DIABETES_CARE_PATH = '/liivv-health/diabetes-care/shop-diabetes-care';
export const OSTOMY_CARE_PATH = '/liivv-health/ostomy-care';
export const SHOP_OSTOMY_CARE_PATH = '/liivv-health/ostomy-care/shop-ostomy-care';
export const OSTOMY_FUNDING_PATH = '/liivv-health/ostomy-care/funding';

const CHAPTER_IMG = '/archive/womens-health';

/**
 * Storefront top-level “Liivv Health” item — sits between Liivv Your Life and Blog.
 * Keep labels in sync with the Liivv Health hub cards on production.
 */
export function getStoreLiivvHealthNavItem(): LiivvArchiveNavLink {
  return {
    label: 'Liivv Health',
    href: LIIVV_HEALTH_HUB_PATH,
    columns: [
      {
        links: [
          {
            label: 'Diabetes Care & Everyday "Liivving"',
            href: DIABETES_CARE_PATH,
          },
          {
            label: 'Ostomy Care & Everyday "Liivving"',
            href: OSTOMY_CARE_PATH,
          },
          {
            label: "Women's Health",
            href: WOMENS_HEALTH_PATH,
          },
        ],
      },
    ],
  };
}

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

const OSTOMY_CHAPTER_LINKS = [
  {
    label: 'New to the Journey',
    href: `${OSTOMY_CARE_PATH}/chapters/new-to-the-journey`,
  },
  {
    label: 'Get to Know Your Stoma',
    href: `${OSTOMY_CARE_PATH}/chapters/get-to-know-your-stoma`,
  },
  {
    label: 'Food & Digestion',
    href: `${OSTOMY_CARE_PATH}/chapters/food-and-digestion`,
  },
  {
    label: 'Everyday Liivving',
    href: `${OSTOMY_CARE_PATH}/chapters/everyday-liivving`,
  },
] as const;

const DIABETES_JOURNEY_PATH_LINKS = [
  {
    label: 'Type 1',
    href: `${DIABETES_CARE_PATH}/chapters/type-1`,
  },
  {
    label: 'Type 2',
    href: `${DIABETES_CARE_PATH}/chapters/type-2`,
  },
  {
    label: 'Gestational',
    href: `${DIABETES_CARE_PATH}/chapters/gestational`,
  },
  {
    label: 'Prediabetes',
    href: `${DIABETES_CARE_PATH}/chapters/prediabetes`,
  },
] as const;

const WOMENS_HEALTH_NAV: LiivvArchiveNavLink[] = [
  {
    label: "Women's Essentials",
    href: SHOP_WOMENS_HEALTH_PATH,
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
];

const OSTOMY_CARE_NAV: LiivvArchiveNavLink[] = [
  {
    label: 'Ostomy Essentials',
    href: SHOP_OSTOMY_CARE_PATH,
  },
  ...OSTOMY_CHAPTER_LINKS,
  {
    label: 'Funding & Coverage',
    href: OSTOMY_FUNDING_PATH,
  },
];

const DIABETES_CARE_NAV: LiivvArchiveNavLink[] = [
  {
    label: 'Diabetes Essentials',
    href: SHOP_DIABETES_CARE_PATH,
  },
  {
    label: 'Every Day Living',
    href: `${DIABETES_CARE_PATH}/chapters/every-day-living`,
  },
  {
    label: 'Your Diabetes Journey',
    href: `${DIABETES_CARE_PATH}/chapters/your-diabetes-journey`,
    compactMenu: true,
    columns: [
      {
        links: [...DIABETES_JOURNEY_PATH_LINKS],
      },
    ],
  },
  {
    label: 'New to the Journey',
    href: `${DIABETES_CARE_PATH}/chapters/new-to-the-journey`,
  },
];

/** Custom header nav for the Women's Health route. */
export function getWomensHealthNav(): LiivvArchiveNavLink[] {
  return WOMENS_HEALTH_NAV;
}

/** Custom header nav for the Ostomy Care route. */
export function getOstomyCareNav(): LiivvArchiveNavLink[] {
  return OSTOMY_CARE_NAV;
}

/** Custom header nav for the Diabetes Care route. */
export function getDiabetesCareNav(): LiivvArchiveNavLink[] {
  return DIABETES_CARE_NAV;
}

export function shouldShowWomensHealthNav(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, WOMENS_HEALTH_PATH);
}

export function shouldShowOstomyCareNav(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, OSTOMY_CARE_PATH);
}

export function shouldShowDiabetesCareNav(pathname: string): boolean {
  return pathnameMatchesPrefix(pathname, DIABETES_CARE_PATH);
}

function isExactCarePath(pathname: string, path: string): boolean {
  return normalizeHidePath(stripLocaleFromPathname(pathname)) === normalizeHidePath(path);
}

/** Back link shown on care-vertical subpages after the landing item was removed from nav. */
export function getCareSectionBackLink(pathname: string): { href: string; label: string } | null {
  if (shouldShowWomensHealthNav(pathname) && !isExactCarePath(pathname, WOMENS_HEALTH_PATH)) {
    return { href: WOMENS_HEALTH_PATH, label: "Back to Women's Health page" };
  }

  if (shouldShowOstomyCareNav(pathname) && !isExactCarePath(pathname, OSTOMY_CARE_PATH)) {
    return { href: OSTOMY_CARE_PATH, label: 'Back to Ostomy Care page' };
  }

  if (shouldShowDiabetesCareNav(pathname) && !isExactCarePath(pathname, DIABETES_CARE_PATH)) {
    return { href: DIABETES_CARE_PATH, label: 'Back to Diabetes Care page' };
  }

  return null;
}

/** @deprecated Prefer shouldShowWomensHealthNav — kept for existing call sites. */
export function shouldShowLiivvHealthNav(pathname: string): boolean {
  return shouldShowWomensHealthNav(pathname);
}
