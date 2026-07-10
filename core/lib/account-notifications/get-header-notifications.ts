import 'server-only';

import { cache } from 'react';

import { getTranslations } from 'next-intl/server';

import { getCustomerOrders } from '~/app/[locale]/(default)/account/(portal)/orders/page-data';
import {
  getDashboardCustomer,
  getDashboardStripeSubscriptions,
} from '~/app/[locale]/(default)/account/(portal)/dashboard/page-data';
import { getConversationByProfileId, getLatestMessageForConversation } from '~/lib/supabase/chat-messages';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { ensureCustomerProfile } from '~/lib/supabase/profile';

import {
  getAccountNotificationsLastSeen,
  isAccountNotificationUnread,
} from './cookie';
import type { AccountDashboardNotifications, AccountHeaderNotification } from './types';

async function buildHeaderNotifications(
  locale: string,
): Promise<AccountHeaderNotification[]> {
  const t = await getTranslations({ locale, namespace: 'Account.Dashboard' });
  const translate = t as unknown as (
    key: string,
    values?: Record<string, string>,
  ) => string;
  const notifications: AccountHeaderNotification[] = [];

  try {
    const ordersData = await getCustomerOrders({ limit: 5 });

    for (const order of ordersData?.orders ?? []) {
      const createdAt = order.orderedAt?.utc ?? new Date().toISOString();
      const statusLabel = order.status?.label ?? translate('notificationOrderTitle');

      notifications.push({
        id: `order:${order.entityId}`,
        kind: 'order',
        title: translate('notificationOrderTitle'),
        body: translate('notificationOrderBody', {
          orderId: String(order.entityId),
          status: statusLabel,
        }),
        href: `/account/orders/${order.entityId}/`,
        createdAt,
      });
    }
  } catch (error) {
    console.error('[account notifications] header order notifications', error);
  }

  try {
    const subscriptions = await getDashboardStripeSubscriptions();

    for (const subscription of subscriptions.slice(0, 5)) {
      const shortId = subscription.id.replace(/^sub_/, '').slice(0, 8);

      notifications.push({
        id: `subscription:${subscription.id}`,
        kind: 'subscription',
        title: translate('notificationSubscriptionTitle'),
        body: translate('notificationSubscriptionBody', {
          id: shortId,
          status: subscription.status.toUpperCase(),
        }),
        href: '/account/subscriptions/',
        createdAt: new Date(subscription.currentPeriodStart * 1000).toISOString(),
      });
    }
  } catch (error) {
    console.error('[account notifications] header subscription notifications', error);
  }

  notifications.sort(
    (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );

  return notifications.slice(0, 15);
}

async function getHasUnreadChatMessage(lastSeen: Date | null): Promise<boolean> {
  if (!isSupabaseConfigured()) {
    return false;
  }

  try {
    const customer = await getDashboardCustomer();

    if (!customer) {
      return false;
    }

    const ensured = await ensureCustomerProfile({
      entityId: customer.entityId,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
    });

    if (ensured.status !== 'ok') {
      return false;
    }

    const conversation = await getConversationByProfileId(ensured.profile.id);

    if (!conversation.ok || !conversation.conversationId) {
      return false;
    }

    const latest = await getLatestMessageForConversation(conversation.conversationId);

    if (!latest.ok || !latest.message || latest.message.sender_type !== 'staff') {
      return false;
    }

    return isAccountNotificationUnread(latest.message.created_at, lastSeen);
  } catch {
    return false;
  }
}

export const getCachedHeaderNotifications = cache(async (locale: string) =>
  buildHeaderNotifications(locale),
);

export async function getAccountDashboardNotifications(
  locale: string,
): Promise<AccountDashboardNotifications> {
  const lastSeen = await getAccountNotificationsLastSeen();
  const headerNotifications = await getCachedHeaderNotifications(locale);
  const unreadCount = headerNotifications.filter((notification) =>
    isAccountNotificationUnread(notification.createdAt, lastSeen),
  ).length;
  const hasUnreadChatMessage = await getHasUnreadChatMessage(lastSeen);

  return {
    headerNotifications,
    unreadCount,
    hasUnreadChatMessage,
  };
}
