import { SHOP_OSTOMY_CARE_CATEGORY_ID } from '~/app/[locale]/(default)/liivv-health/ostomy-care/oc-ids';
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
 * Storefront top-level “Liivv Health” item — sits after Liivv Your Life.
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
    label: 'Your Stoma, and Your Fit',
    href: `${OSTOMY_CARE_PATH}/chapters/get-to-know-your-stoma`,
  },
  {
    label: 'Everyday Liivving',
    href: `${OSTOMY_CARE_PATH}/chapters/everyday-liivving`,
  },
  {
    label: 'This Might Be You',
    href: `${OSTOMY_CARE_PATH}/chapters/this-might-be-you`,
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
  {
    label: 'Chapters',
    href: `${OSTOMY_CARE_PATH}#where-are-you`,
    columns: [
      {
        links: [...OSTOMY_CHAPTER_LINKS],
      },
    ],
  },
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

export type CareNavSection = 'ostomy' | 'womens' | 'diabetes';

/** Remembers which specialized menu to keep on a product opened from that section. */
export const CARE_NAV_COOKIE = 'liivv-care-nav';

/** Set on a product request when the product itself belongs to a care catalog. */
export const CARE_NAV_HEADER = 'x-care-nav';

/** Shop Ostomy Care lists every product in this category, kits and the rest. */
export function careNavSectionForCategoryIds(
  categoryIds: readonly number[],
): CareNavSection | null {
  if (categoryIds.includes(SHOP_OSTOMY_CARE_CATEGORY_ID)) return 'ostomy';

  return null;
}

const STORE_CHROME_PREFIXES = ['/cart', '/checkout', '/account', '/login', '/register'] as const;

export function careNavSectionForPath(pathname: string): CareNavSection | null {
  if (shouldShowOstomyCareNav(pathname)) return 'ostomy';
  if (shouldShowWomensHealthNav(pathname)) return 'womens';
  if (shouldShowDiabetesCareNav(pathname)) return 'diabetes';

  return null;
}

export function parseCareNavCookie(value: string | undefined | null): CareNavSection | null {
  if (value === 'ostomy' || value === 'womens' || value === 'diabetes') return value;

  return null;
}

/** Home and the health hub leave the specialized menu. */
export function shouldClearCareNav(pathname: string): boolean {
  const path = normalizeHidePath(stripLocaleFromPathname(pathname));

  return path === '/' || path === LIIVV_HEALTH_HUB_PATH;
}

/** Cart, checkout, and account keep the main store menu. */
export function isStoreChromePath(pathname: string): boolean {
  const path = normalizeHidePath(stripLocaleFromPathname(pathname));

  return STORE_CHROME_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

/**
 * Specialized menu for this page. A product opened from Ostomy, Women's Health,
 * or Diabetes Care keeps that section's menu until the reader goes home.
 */
export function resolveCareNavSection(
  pathname: string,
  remembered: CareNavSection | null,
): CareNavSection | null {
  const fromPath = careNavSectionForPath(pathname);

  if (fromPath) return fromPath;
  if (shouldClearCareNav(pathname) || isStoreChromePath(pathname)) return null;

  return remembered;
}

export function writeCareNavCookie(section: CareNavSection) {
  document.cookie = `${CARE_NAV_COOKIE}=${section}; path=/; samesite=lax`;
}

export function clearCareNavCookie() {
  document.cookie = `${CARE_NAV_COOKIE}=; path=/; max-age=0; samesite=lax`;
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

/** Back link shown on care-vertical subpages, including a product opened from that section. */
export function getCareSectionBackLink(
  pathname: string,
  section: CareNavSection | null = careNavSectionForPath(pathname),
): { href: string; label: string } | null {
  if (section === 'womens' && !isExactCarePath(pathname, WOMENS_HEALTH_PATH)) {
    return { href: WOMENS_HEALTH_PATH, label: "Back to Women's Health page" };
  }

  if (section === 'ostomy' && !isExactCarePath(pathname, OSTOMY_CARE_PATH)) {
    return { href: OSTOMY_CARE_PATH, label: 'Back to Ostomy Care page' };
  }

  if (section === 'diabetes' && !isExactCarePath(pathname, DIABETES_CARE_PATH)) {
    return { href: DIABETES_CARE_PATH, label: 'Back to Diabetes Care page' };
  }

  return null;
}

/** @deprecated Prefer shouldShowWomensHealthNav — kept for existing call sites. */
export function shouldShowLiivvHealthNav(pathname: string): boolean {
  return shouldShowWomensHealthNav(pathname);
}
