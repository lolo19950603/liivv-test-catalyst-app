import type { DashboardHeroTab } from '~/components/account-dashboard/types';
import {
  getPrimaryCategoryDisplay,
  resolveInitialHealthCategoriesWithRank,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';

export function buildDashboardHeroTabs(options: {
  careInterests: string[];
  primaryCategoryId?: string;
  shopHref: string;
  changeSelectionHref: string;
  changeSelectionLabel: string;
}): DashboardHeroTab[] {
  const ranked = resolveInitialHealthCategoriesWithRank(options.careInterests).slice(0, 2);
  const tabs: DashboardHeroTab[] = ranked.map(({ id }) => ({
    id,
    label: getPrimaryCategoryDisplay(id as LiivPrimaryCategoryId).shortLabel,
    href: options.shopHref,
    active: id === options.primaryCategoryId,
  }));

  tabs.push({
    id: 'change-selection',
    label: options.changeSelectionLabel,
    href: options.changeSelectionHref,
    active: ranked.length === 0,
  });

  return tabs;
}
