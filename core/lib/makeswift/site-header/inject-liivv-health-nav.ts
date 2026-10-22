import { SHOP_DIABETES_CARE_CATEGORY_ID } from '~/app/[locale]/(default)/liivv-health/diabetes-care/dc-ids';
import { SHOP_OSTOMY_CARE_CATEGORY_ID } from '~/app/[locale]/(default)/liivv-health/ostomy-care/oc-ids';
import { SLEEP_APNEA_CARE_LISTED } from '~/app/[locale]/(default)/liivv-health/sleep-apnea-care/launch';
import type { SaLandingSetup } from '~/app/[locale]/(default)/liivv-health/sleep-apnea-care/sa-landing-types';
import { isCpapCategoryIds, PAP_DEVICE_CATEGORY_ID } from '~/lib/catalog/prescription-devices';
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
export const DIABETES_FUNDING_PATH = '/liivv-health/diabetes-care/funding';
export const OSTOMY_CARE_PATH = '/liivv-health/ostomy-care';
export const SHOP_OSTOMY_CARE_PATH = '/liivv-health/ostomy-care/shop-ostomy-care';
export const OSTOMY_FUNDING_PATH = '/liivv-health/ostomy-care/funding';
/*
 * Sleep Apnea Care's menu, the Liivv Health menu's entry for it and the 'sleep'
 * care section all wait on SLEEP_APNEA_CARE_LISTED (sleep-apnea-care/launch.ts;
 * on since the soft launch, 2026-10-21). With it off, every function here
 * answers exactly as it did before the section had a menu: Sleep pages leave
 * whichever menu a reader carried in, and a CPAP product keeps none. Listing
 * the section does not index it; that is SLEEP_APNEA_CARE_LIVE, read only by
 * the section's layout and the sitemap.
 */
export const SLEEP_APNEA_CARE_PATH = '/liivv-health/sleep-apnea-care';
export const SLEEP_FUNDING_PATH = '/liivv-health/sleep-apnea-care/funding';

/*
 * The landing's own shelf: CPAP masks and supplies, never the machine shelf
 * (sleep-apnea-care/sa-ids.ts; ruling N1, Liivv sells no machine). The store's
 * CPAP category page lists the machine shelf beside it, so the menu does not
 * go there. Typed by the landing's own anchor, so a renamed anchor fails here.
 */
const SLEEP_SHOP_ANCHOR: SaLandingSetup['shopAnchor'] = 'shop-sleep-apnea-care';

export const SHOP_SLEEP_APNEA_CARE_PATH = `${SLEEP_APNEA_CARE_PATH}#${SLEEP_SHOP_ANCHOR}`;

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
          ...(SLEEP_APNEA_CARE_LISTED
            ? [{ label: 'Sleep Apnea Care & Everyday "Liivving"', href: SLEEP_APNEA_CARE_PATH }]
            : []),
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

/**
 * Keep labels/slugs in sync with the chapter titles in
 * `DiabetesCare.chapters` (messages/en.json) and the slugs in
 * `app/.../diabetes-care/chapters/chapters-meta.ts`, in reading order.
 */
const DIABETES_CHAPTER_LINKS = [
  {
    label: 'New to the Journey',
    href: `${DIABETES_CARE_PATH}/chapters/new-to-the-journey`,
  },
  {
    label: 'Staying Safe',
    href: `${DIABETES_CARE_PATH}/chapters/staying-safe`,
  },
  {
    label: 'Your Tools',
    href: `${DIABETES_CARE_PATH}/chapters/your-tools`,
  },
  {
    label: 'Everyday Liivving',
    href: `${DIABETES_CARE_PATH}/chapters/every-day-living`,
  },
  {
    label: 'Know Your Type',
    href: `${DIABETES_CARE_PATH}/chapters/know-your-type`,
  },
  {
    label: 'This Might Be You',
    href: `${DIABETES_CARE_PATH}/chapters/this-might-be-you`,
  },
] as const;

/**
 * The five path pages (reading lists by type), under "Your path, by type". Keep in
 * sync with `DiabetesCare.paths.<slug>.title` and
 * `app/.../diabetes-care/chapters/paths-meta.ts`.
 */
const DIABETES_PATH_LINKS = [
  {
    label: 'Type 1',
    href: `${DIABETES_CARE_PATH}/chapters/type-1`,
  },
  {
    label: 'Type 2',
    href: `${DIABETES_CARE_PATH}/chapters/type-2`,
  },
  {
    label: 'Gestational diabetes',
    href: `${DIABETES_CARE_PATH}/chapters/gestational`,
  },
  {
    label: 'Prediabetes',
    href: `${DIABETES_CARE_PATH}/chapters/prediabetes`,
  },
  {
    label: 'Less common types',
    href: `${DIABETES_CARE_PATH}/chapters/less-common-types`,
  },
] as const;

/**
 * Keep labels/slugs in sync with the chapter titles in
 * `SleepApneaCare.chapters` (messages/en.json) and the slugs in
 * `app/.../sleep-apnea-care/chapters/chapters-meta.ts`, in reading order.
 */
const SLEEP_CHAPTER_LINKS = [
  {
    label: 'Is It Sleep Apnea?',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/is-it-sleep-apnea`,
  },
  {
    label: 'Driving & Staying Safe',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/staying-safe`,
  },
  {
    label: 'Your Treatment Options',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/treatment-options`,
  },
  {
    label: 'Starting CPAP',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/starting-cpap`,
  },
  {
    label: 'Everyday Liivving',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/everyday-liivving`,
  },
  {
    label: 'This Might Be You',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/this-might-be-you`,
  },
] as const;

/**
 * The six path pages (reading lists), under "Your path". Keep in sync with
 * `SleepApneaCare.paths.<slug>.title` and
 * `app/.../sleep-apnea-care/chapters/paths-meta.ts`.
 */
const SLEEP_PATH_LINKS = [
  {
    label: 'CPAP',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/cpap`,
  },
  {
    label: 'Bilevel',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/bilevel`,
  },
  {
    label: 'Travel CPAP',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/travel-cpap`,
  },
  {
    label: 'Oral appliance',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/oral-appliance`,
  },
  {
    label: 'Children',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/children`,
  },
  {
    label: 'Not diagnosed yet',
    href: `${SLEEP_APNEA_CARE_PATH}/chapters/not-diagnosed-yet`,
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

/** Same shape as OSTOMY_CARE_NAV: the shop, the chapters, Funding & Coverage. */
const DIABETES_CARE_NAV: LiivvArchiveNavLink[] = [
  {
    label: 'Diabetes Essentials',
    href: SHOP_DIABETES_CARE_PATH,
  },
  {
    label: 'Chapters',
    href: `${DIABETES_CARE_PATH}#where-are-you`,
    columns: [
      {
        links: [...DIABETES_CHAPTER_LINKS],
      },
      {
        /*
         * Not "Know Your Type" a second time (it is chapter 05 in the column
         * beside): the paths' own group, opening the landing's "which
         * diabetes?" chips (full-site review, 2026-10-06).
         */
        heading: {
          label: 'Your path, by type',
          href: `${DIABETES_CARE_PATH}#which-diabetes`,
        },
        links: [...DIABETES_PATH_LINKS],
      },
    ],
  },
  {
    label: 'Funding & Coverage',
    href: DIABETES_FUNDING_PATH,
  },
];

/*
 * Same shape as DIABETES_CARE_NAV. The shop is the landing's own shelf of
 * masks and supplies (SHOP_SLEEP_APNEA_CARE_PATH; no machines: Liivv sells
 * none). No machine guide link: where it is linked is still open
 * (machineGuideLinked in sleep-apnea-care/landing-meta.ts).
 */
const SLEEP_APNEA_CARE_NAV: LiivvArchiveNavLink[] = [
  {
    label: 'Sleep Apnea Essentials',
    href: SHOP_SLEEP_APNEA_CARE_PATH,
  },
  {
    label: 'Chapters',
    href: `${SLEEP_APNEA_CARE_PATH}#where-are-you`,
    columns: [
      {
        links: [...SLEEP_CHAPTER_LINKS],
      },
      {
        /* The paths' own group, opening the landing's "Which therapy?" chips. */
        heading: {
          label: 'Your path',
          href: `${SLEEP_APNEA_CARE_PATH}#which-therapy`,
        },
        links: [...SLEEP_PATH_LINKS],
      },
    ],
  },
  {
    label: 'Funding & Coverage',
    href: SLEEP_FUNDING_PATH,
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

/* Custom header nav for the Sleep Apnea Care route (shown only while it is listed). */
export function getSleepApneaCareNav(): LiivvArchiveNavLink[] {
  return SLEEP_APNEA_CARE_NAV;
}

export type CareNavSection = 'ostomy' | 'womens' | 'diabetes' | 'sleep';

/** Remembers which specialized menu to keep on a product opened from that section. */
export const CARE_NAV_COOKIE = 'liivv-care-nav';

/** Set on a product request when the product itself belongs to a care catalog. */
export const CARE_NAV_HEADER = 'x-care-nav';

/**
 * Shop Ostomy Care and Shop Diabetes Care each list every product in their
 * category, kits and the rest. Ostomy is asked first, so a product in both
 * keeps the Ostomy menu exactly as before. A product on a CPAP mask or supplies
 * shelf keeps the Sleep Apnea Care menu while that section is listed, asked
 * last. A product on the machine shelf (PAP_DEVICE_CATEGORY_ID) never does:
 * Liivv sells no machine (ruling N1).
 */
export function careNavSectionForCategoryIds(
  categoryIds: readonly number[],
): CareNavSection | null {
  if (categoryIds.includes(SHOP_OSTOMY_CARE_CATEGORY_ID)) return 'ostomy';
  if (categoryIds.includes(SHOP_DIABETES_CARE_CATEGORY_ID)) return 'diabetes';

  if (
    SLEEP_APNEA_CARE_LISTED &&
    isCpapCategoryIds(categoryIds) &&
    !categoryIds.includes(PAP_DEVICE_CATEGORY_ID)
  ) {
    return 'sleep';
  }

  return null;
}

const STORE_CHROME_PREFIXES = ['/cart', '/checkout', '/account', '/login', '/register'] as const;

export function careNavSectionForPath(pathname: string): CareNavSection | null {
  if (shouldShowOstomyCareNav(pathname)) return 'ostomy';
  if (shouldShowWomensHealthNav(pathname)) return 'womens';
  if (shouldShowDiabetesCareNav(pathname)) return 'diabetes';
  if (shouldShowSleepApneaCareNav(pathname)) return 'sleep';

  return null;
}

export function parseCareNavCookie(value: string | undefined | null): CareNavSection | null {
  if (value === 'ostomy' || value === 'womens' || value === 'diabetes') return value;
  /* A 'sleep' cookie from a listed period means nothing once the section is unlisted. */
  if (value === 'sleep' && SLEEP_APNEA_CARE_LISTED) return value;

  return null;
}

/**
 * Home, the health hub and the sections with no menu of their own leave the
 * specialized menu. Sleep Apnea Care is one of those only while it is not
 * listed; listed, its pages have their own menu.
 */
export function shouldClearCareNav(pathname: string): boolean {
  const path = normalizeHidePath(stripLocaleFromPathname(pathname));

  return (
    path === '/' ||
    path === LIIVV_HEALTH_HUB_PATH ||
    (!SLEEP_APNEA_CARE_LISTED && pathnameMatchesPrefix(pathname, SLEEP_APNEA_CARE_PATH))
  );
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
 * Diabetes Care or (while listed) Sleep Apnea Care keeps that section's menu
 * until the reader goes home.
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

export function shouldShowSleepApneaCareNav(pathname: string): boolean {
  return SLEEP_APNEA_CARE_LISTED && pathnameMatchesPrefix(pathname, SLEEP_APNEA_CARE_PATH);
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
    /* Short, so the Diabetes menu fits beside the EN/FR toggle at laptop widths. */
    return { href: DIABETES_CARE_PATH, label: 'Diabetes Care' };
  }

  /* Short, as Diabetes Care's is. 'sleep' only ever resolves while the section is listed. */
  if (section === 'sleep' && !isExactCarePath(pathname, SLEEP_APNEA_CARE_PATH)) {
    return { href: SLEEP_APNEA_CARE_PATH, label: 'Sleep Apnea Care' };
  }

  return null;
}

/** @deprecated Prefer shouldShowWomensHealthNav — kept for existing call sites. */
export function shouldShowLiivvHealthNav(pathname: string): boolean {
  return shouldShowWomensHealthNav(pathname);
}
