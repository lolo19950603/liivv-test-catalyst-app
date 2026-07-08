import {
  getPrimaryCategoryDisplay,
  type LiivPrimaryCategoryId,
} from '~/lib/onboarding/liiv-primary-health-category';

import type { AccountDashboardLabels } from '~/components/account-dashboard/types';

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
  categoryId?: string,
): { title: string; description: string } {
  const keys =
    categoryId != null
      ? CATEGORY_DAILY_TIPS_KEYS[categoryId as LiivPrimaryCategoryId]
      : undefined;

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

export function buildDashboardLabels(
  t: TranslateFn,
  options: {
    customerFirstName: string;
    primaryCategoryId?: string;
  },
): AccountDashboardLabels {
  const dailyTips = resolveDailyTips(t, options.primaryCategoryId);
  const categoryDisplay = options.primaryCategoryId
    ? (getPrimaryCategoryDisplay(
        options.primaryCategoryId as LiivPrimaryCategoryId,
      ) as { shortLabel: string; label: string })
    : null;

  return {
    signOut: t('signOut'),
    notifications: t('notifications'),
    notificationsPanelTitle: t('notificationsPanelTitle'),
    notificationsEmpty: t('notificationsEmpty'),
    notificationKindOrder: t('notificationKindOrder'),
    notificationKindSubscription: t('notificationKindSubscription'),
    cart: t('cart'),
    search: t('search'),
    myAccount: t('myAccount'),
    accountSettings: t('accountSettings'),
    brandName: t('brandName'),
    onboardingBannerMessage: t('onboardingBanner.message'),
    onboardingBannerCta: t('onboardingBanner.cta'),
    aria: {
      accountNavigation: t('aria.accountNavigation'),
      primaryNavigation: t('aria.primaryNavigation'),
      secondaryNavigation: t('aria.secondaryNavigation'),
      wellnessCategories: t('aria.wellnessCategories'),
      actionCenter: t('aria.actionCenter'),
    },
    sidebar: {
      home: t('sidebar.home'),
      orders: t('sidebar.orders'),
      shop: t('sidebar.shop'),
      wishlists: t('sidebar.wishlists'),
      settings: t('sidebar.settings'),
      help: t('sidebar.help'),
    },
    wellness: {
      greeting: t('wellness.greeting', { name: options.customerFirstName }),
      welcomeLead: t('wellness.welcomeLead'),
      hero: {
        basedOnSelection: t('wellness.hero.basedOnSelection'),
        title:
          categoryDisplay?.shortLabel ??
          categoryDisplay?.label ??
          t('wellness.hero.title'),
        subtitle: t('wellness.hero.subtitle'),
        dailyTips,
        yourSupplies: {
          title: t('wellness.hero.yourSupplies.title'),
          description: t('wellness.hero.yourSupplies.description'),
        },
        exploreMore: t('wellness.hero.exploreMore'),
        changeSelection: t('wellness.hero.changeSelection'),
      },
      actionCenter: {
        subscriptionTitle: t('wellness.actionCenter.subscriptionTitle'),
        subscriptionManage: t('wellness.actionCenter.subscriptionManage'),
        subscriptionEmpty: t('wellness.actionCenter.subscriptionEmpty'),
        orderHistory: t('wellness.actionCenter.orderHistory'),
      },
      virtualCare: {
        title: t('wellness.virtualCare.title'),
        consulting: t('wellness.virtualCare.consulting'),
        carePack: t('wellness.virtualCare.carePack'),
        pharmacy: t('wellness.virtualCare.pharmacy'),
        unreadMessages: t('wellness.virtualCare.unreadMessages'),
        hasNewMessage: t('wellness.virtualCare.hasNewMessage'),
        noNewMessages: t('wellness.virtualCare.noNewMessages'),
        openInbox: t('wellness.virtualCare.openInbox'),
      },
    },
  };
}
