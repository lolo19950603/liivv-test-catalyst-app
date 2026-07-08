import type { DashboardHeroTab } from '~/components/account-dashboard/types';
import {
  getPrimaryCategoryDisplay,
  resolveInitialHealthCategoriesWithRank,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';

export function buildDashboardHeroTabs(options: {
  careInterests: string[];
  primaryCategoryId?: string;
  changeSelectionHref: string;
  changeSelectionLabel: string;
}): DashboardHeroTab[] {
  const ranked = resolveInitialHealthCategoriesWithRank(options.careInterests).slice(0, 2);
  const tabs: DashboardHeroTab[] = ranked.map(({ id }) => ({
    id,
    label: getPrimaryCategoryDisplay(id as LiivPrimaryCategoryId).shortLabel,
    active: id === options.primaryCategoryId,
    kind: 'category',
  }));

  tabs.push({
    id: 'change-selection',
    label: options.changeSelectionLabel,
    href: options.changeSelectionHref,
    active: ranked.length === 0,
    kind: 'link',
  });

  return tabs;
}
