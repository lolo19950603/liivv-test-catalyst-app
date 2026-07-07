export interface AccountDashboardLabels {
  signOut: string;
  notifications: string;
  notificationsUnread: string;
  notificationsPanelTitle: string;
  notificationsEmpty: string;
  cart: string;
  myAccount: string;
  accountSettings: string;
  search: string;
  sidebar: {
    home: string;
    orders: string;
    shop: string;
    loyalty: string;
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
      tabs: {
        diabetes: string;
        sleepRest: string;
        changeSelection: string;
      };
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

import type { AccountHeaderNotification } from '~/lib/account-notifications/types';

export interface AccountDashboardProps {
  customerName: string;
  cartHref: string;
  ordersHref: string;
  subscriptionsHref: string;
  shopHref: string;
  loyaltyHref: string;
  settingsHref: string;
  contactHref: string;
  logoutHref: string;
  nextSubscriptionDate: string | null;
  onboardingBannerHref?: string | null;
  wellnessSelectionHref: string;
  virtualCarePharmacyHref: string;
  virtualCareCarePackHref: string;
  virtualCareConsultingHref: string;
  labels: AccountDashboardLabels;
  headerNotifications: AccountHeaderNotification[];
  notificationsUnreadCount: number;
  hasUnreadChatMessage: boolean;
  virtualCareChatHref: string;
  heroImageSrc: string;
}
