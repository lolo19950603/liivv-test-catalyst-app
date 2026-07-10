import type { AccountHeaderNotification } from '~/lib/account-notifications/types';

export type AccountHeaderNotificationLabels = {
  ariaLabel: string;
  panelTitle: string;
  empty: string;
  kindOrder: string;
  kindSubscription: string;
};

export type SiteHeaderNotifications = {
  items: AccountHeaderNotification[];
  unreadCount: number;
  labels: AccountHeaderNotificationLabels;
};
