import type { LiivvArchiveNavLink } from '~/lib/makeswift/liivv-archive-header/types';

function categoryHref(label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `/shop-all?category=${slug}`;
}

function column(
  labels: string[],
): NonNullable<LiivvArchiveNavLink['columns']>[number] {
  return {
    links: labels.map((label) => ({ label, href: categoryHref(label) })),
  };
}

/** Default storefront mega menu (Liivv Your Life categories from design). */
export const DEFAULT_SITE_MEGA_NAV: LiivvArchiveNavLink[] = [
  {
    label: 'Liivv Your Life',
    href: '/shop-all',
    columns: [
      column([
        'Breathing & Lung Health',
        'Healing and Advanced Wound Care',
        'Injection Supplies',
      ]),
      column(['Heart & Blood Pressure', 'Active Recovery & Rehab', 'Everyday Meds & Relief']),
      column(['Getting Around', 'Sleep & Rest', 'Daily Nutrition']),
      column(['Personal Care & Confidence', 'Clinical Care', 'Everyday Essentials']),
      column(['Safe & Secure at Home', 'Protection & PPE']),
    ],
    exploreAll: { label: 'Explore All', href: '/shop-all' },
  },
  {
    label: 'Liivv Health',
    href: '/account',
  },
];
