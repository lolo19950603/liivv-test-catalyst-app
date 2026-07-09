import {
  getPrimaryCategoryDisplay,
  resolveInitialHealthCategoriesWithRank,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';

import type { DashboardHeroPanel } from '~/components/account-dashboard/types';

type TranslateFn = (key: string, values?: Record<string, string>) => string;

const CATEGORY_DAILY_TIPS_KEYS: Partial<
  Record<LiivPrimaryCategoryId, { title: string; description: string }>
> = {
  ostomy_care_everyday: {
    title: 'wellness.hero.categories.ostomy.dailyTips.title',
    description: 'wellness.hero.categories.ostomy.dailyTips.description',
  },
  diabetes_care_everyday: {
    title: 'wellness.hero.categories.diabetes.dailyTips.title',
    description: 'wellness.hero.categories.diabetes.dailyTips.description',
  },
  sleep_rest: {
    title: 'wellness.hero.categories.sleep.dailyTips.title',
    description: 'wellness.hero.categories.sleep.dailyTips.description',
  },
};

function resolveDailyTips(
  t: TranslateFn,
  categoryId: LiivPrimaryCategoryId,
): { title: string; description: string } {
  const keys = CATEGORY_DAILY_TIPS_KEYS[categoryId];

  if (keys) {
    return {
      title: t(keys.title),
      description: t(keys.description),
    };
  }

  return {
    title: t('wellness.hero.dailyTips.title'),
    description: t('wellness.hero.dailyTips.description'),
  };
}

export function buildDashboardHeroPanels(options: {
  careInterests: string[];
  subtitle: string;
  t: TranslateFn;
}): DashboardHeroPanel[] {
  const ranked = resolveInitialHealthCategoriesWithRank(options.careInterests).slice(0, 2);

  return ranked.map(({ id }) => {
    const display = getPrimaryCategoryDisplay(id);

    return {
      id,
      title: display.shortLabel ?? display.label,
      subtitle: options.subtitle,
      dailyTips: resolveDailyTips(options.t, id),
    };
  });
}
