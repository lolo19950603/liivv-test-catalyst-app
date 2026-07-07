export type AccountHeaderNotificationKind = 'order' | 'subscription';

export type AccountHeaderNotification = {
  id: string;
  kind: AccountHeaderNotificationKind;
  title: string;
  body: string;
  href: string;
  createdAt: string;
};

export type AccountDashboardNotifications = {
  headerNotifications: AccountHeaderNotification[];
  unreadCount: number;
  hasUnreadChatMessage: boolean;
};
