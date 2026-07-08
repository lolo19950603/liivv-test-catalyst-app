import type { AccountHeaderNotification } from '~/lib/account-notifications/types';
import type { ReactNode } from 'react';

export type DashboardHeroTab = {
  id: string;
  label: string;
  href: string;
  active: boolean;
};

export interface AccountDashboardLabels {
  signOut: string;
  notifications: string;
  notificationsPanelTitle: string;
  notificationsEmpty: string;
  notificationKindOrder: string;
  notificationKindSubscription: string;
  cart: string;
  myAccount: string;
  accountSettings: string;
  search: string;
  brandName: string;
  onboardingBannerMessage: string;
  onboardingBannerCta: string;
  aria: {
    accountNavigation: string;
    primaryNavigation: string;
    secondaryNavigation: string;
    wellnessCategories: string;
    actionCenter: string;
  };
  sidebar: {
    home: string;
    orders: string;
    shop: string;
    wishlists: string;
    settings: string;
    help: string;
  };
  wellness: {
    greeting: string;
    welcomeLead: string;
    hero: {
      basedOnSelection: string;
      title: string;
      subtitle: string;
      dailyTips: {
        title: string;
        description: string;
      };
      yourSupplies: {
        title: string;
        description: string;
      };
      exploreMore: string;
      changeSelection: string;
    };
    actionCenter: {
      subscriptionTitle: string;
      subscriptionManage: string;
      subscriptionEmpty: string;
      orderHistory: string;
    };
    virtualCare: {
      title: string;
      consulting: string;
      carePack: string;
      pharmacy: string;
      unreadMessages: string;
      hasNewMessage: string;
      noNewMessages: string;
      openInbox: string;
    };
  };
}

export interface AccountDashboardShellProps {
  customerName: string;
  cartHref: string;
  ordersHref: string;
  subscriptionsHref: string;
  shopHref: string;
  wishlistsHref: string;
  settingsHref: string;
  contactHref: string;
  logoutHref: string;
  onboardingBannerHref?: string | null;
  labels: AccountDashboardLabels;
  headerNotifications: AccountHeaderNotification[];
  notificationsUnreadCount: number;
  logoSrc: string;
  logoAlt: string;
  children: ReactNode;
}
