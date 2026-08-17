import type { AccountHeaderNotification } from '~/lib/account-notifications/types';
import type { AccountMenuLink } from '~/lib/account/account-menu-links';
import type { ReactNode } from 'react';

export type DashboardHeroTab = {
  id: string;
  label: string;
  href?: string;
  active: boolean;
  kind: 'category' | 'link';
};

export type DashboardHeroPanel = {
  id: string;
  title: string;
  subtitle: string;
  dailyTips: {
    title: string;
    description: string;
  };
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
    olivia: {
      stageLabel: string;
      healthHotspot: string;
      insuranceHotspot: string;
      setupEyebrow: string;
      setupTitle: string;
      healthHint: string;
      insuranceHint: string;
      later: string;
      laterChip: string;
      healthSheetTitle: string;
      insuranceSheetTitle: string;
      closeSheet: string;
      mascotAlt: string;
      insuranceDescription: string;
      noInsurance: string;
      noCoverageOnFile: string;
      providerName: string;
      policyNumber: string;
      memberId: string;
      groupNumber: string;
      primaryHolderName: string;
      relationship: string;
      skip: string;
      saveInsurance: string;
      savingInsurance: string;
      talkHealth: string[];
      talkInsurance: string[];
      talkIdle: string[];
      talkDone: string[];
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
  cartCount: number | null;
  ordersHref: string;
  subscriptionsHref: string;
  shopHref: string;
  wishlistsHref: string;
  settingsHref: string;
  contactHref: string;
  logoutHref: string;
  labels: AccountDashboardLabels;
  headerNotifications: AccountHeaderNotification[];
  notificationsUnreadCount: number;
  logoSrc: string;
  logoAlt: string;
  searchPlaceholder: string;
  accountMenuLinks: AccountMenuLink[];
  children: ReactNode;
}
