import { cache } from 'react';

import { getOnboardingCustomer } from '~/app/[locale]/(default)/account/onboarding/page-data';
import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import {
  mapCarePackRequestRow,
  mapPrescriptionRow,
  mapRefillRequestRow,
  type PharmacyCarePackRequest,
  type PharmacyPrescription,
  type PharmacyRefillRequest,
} from '~/lib/pharmacy/pharmacy-mappers';
import { getConversationByProfileId, getLatestMessageForConversation } from '~/lib/supabase/chat-messages';
import {
  getAccountNotificationsLastSeen,
  isAccountNotificationUnread,
} from '~/lib/account-notifications/cookie';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  listCarePackRequestsByProfileId,
  listPrescriptionsByProfileId,
  listRefillRequestsByProfileId,
} from '~/lib/supabase/prescriptions';
import { getPrescriptionPhotoSignedUrl } from '~/lib/supabase/prescription-storage';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { isVirtualCareBotEnabled } from '~/lib/virtual-care-bot/config';

export type PharmacyPageData = {
  displayName: string;
  supabaseReady: boolean;
  prescriptions: PharmacyPrescription[];
  refillRequests: PharmacyRefillRequest[];
  carepackRequests: PharmacyCarePackRequest[];
  activePrescriptionCount: number;
};

export const getPharmacyPageData = cache(async (): Promise<PharmacyPageData | null> => {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return null;
  }

  const first = customer.firstName.trim();
  const last = customer.lastName.trim();
  const displayName = [first, last].filter(Boolean).join(' ') || 'there';

  if (!isSupabaseConfigured()) {
    return {
      displayName,
      supabaseReady: false,
      prescriptions: [],
      refillRequests: [],
      carepackRequests: [],
      activePrescriptionCount: 0,
    };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return {
      displayName,
      supabaseReady: false,
      prescriptions: [],
      refillRequests: [],
      carepackRequests: [],
      activePrescriptionCount: 0,
    };
  }

  const rows = await listPrescriptionsByProfileId(ensured.profile.id);
  const prescriptions = await Promise.all(
    rows.map(async (row) =>
      mapPrescriptionRow(row, await getPrescriptionPhotoSignedUrl(row.photo_url)),
    ),
  );
  const refillRows = await listRefillRequestsByProfileId(ensured.profile.id);
  const carepackRows = await listCarePackRequestsByProfileId(ensured.profile.id);

  return {
    displayName,
    supabaseReady: true,
    prescriptions,
    refillRequests: refillRows.map((row) => mapRefillRequestRow(row, prescriptions)),
    carepackRequests: carepackRows.map((row) => mapCarePackRequestRow(row, prescriptions)),
    activePrescriptionCount: prescriptions.filter((rx) => rx.bucket === 'active').length,
  };
});

export const getVirtualCareSummary = cache(async () => {
  const customer = await getOnboardingCustomer();

  if (!customer || !isSupabaseConfigured()) {
    return { hasUnreadStaffMessage: false, activePrescriptionCount: 0 };
  }

  const [pharmacy, ensured] = await Promise.all([
    getPharmacyPageData(),
    ensureCustomerProfile(customer),
  ]);

  if (ensured.status !== 'ok') {
    return {
      hasUnreadStaffMessage: false,
      activePrescriptionCount: pharmacy?.activePrescriptionCount ?? 0,
    };
  }

  const conv = await getConversationByProfileId(ensured.profile.id);

  if (!conv.ok || !conv.conversationId) {
    return {
      hasUnreadStaffMessage: false,
      activePrescriptionCount: pharmacy?.activePrescriptionCount ?? 0,
    };
  }

  const latest = await getLatestMessageForConversation(conv.conversationId);
  const lastSeen = await getAccountNotificationsLastSeen();
  const hasUnreadStaffMessage =
    latest.ok &&
    latest.message?.sender_type === 'staff' &&
    isAccountNotificationUnread(latest.message.created_at, lastSeen);

  return {
    hasUnreadStaffMessage,
    activePrescriptionCount: pharmacy?.activePrescriptionCount ?? 0,
  };
});

export const getVirtualCareChatData = cache(async () => {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return null;
  }

  if (!isSupabaseConfigured()) {
    return {
      supabaseReady: false as const,
      botEnabled: isVirtualCareBotEnabled(),
      messages: [],
      conversationId: null,
      customerLeftAt: null,
      staffClosedAt: null,
      escalatedToPharmacistAt: null,
    };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return {
      supabaseReady: false as const,
      botEnabled: isVirtualCareBotEnabled(),
      messages: [],
      conversationId: null,
      customerLeftAt: null,
      staffClosedAt: null,
      escalatedToPharmacistAt: null,
    };
  }

  const conv = await getConversationByProfileId(ensured.profile.id);

  if (!conv.ok || !conv.conversationId) {
    return {
      supabaseReady: true as const,
      botEnabled: isVirtualCareBotEnabled(),
      conversationId: null,
      customerLeftAt: conv.ok ? conv.customerLeftAt : null,
      staffClosedAt: conv.ok ? conv.staffClosedAt : null,
      escalatedToPharmacistAt: conv.ok ? conv.escalatedToPharmacistAt : null,
      messages: [],
    };
  }

  const { listMessagesForConversation } = await import('~/lib/supabase/chat-messages');
  const listed = await listMessagesForConversation(conv.conversationId);

  return {
    supabaseReady: true as const,
    botEnabled: isVirtualCareBotEnabled(),
    conversationId: conv.conversationId,
    customerLeftAt: conv.customerLeftAt,
    staffClosedAt: conv.staffClosedAt,
    escalatedToPharmacistAt: conv.escalatedToPharmacistAt,
    messages: listed.ok ? listed.messages : [],
  };
});

export const getCustomerProvince = cache(async () => {
  const addressData = await getCustomerAddresses({ limit: 1 });
  const address = addressData?.addresses[0];

  return address?.stateOrProvince?.trim() ?? null;
});
