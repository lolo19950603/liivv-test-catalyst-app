import { cache } from 'react';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { getCustomerAddresses } from '~/app/[locale]/(default)/account/addresses/page-data';
import {
  type CpapPrescriptionState,
  cpapPrescriptionState,
  cpapToday,
} from '~/lib/pharmacy/cpap-prescription';
import {
  isCpapPrescriptionRow,
  mapCarePackRequestRow,
  mapPrescriptionRow,
  mapRefillRequestRow,
  type PharmacyCarePackRequest,
  type PharmacyPrescription,
  type PharmacyRefillRequest,
} from '~/lib/pharmacy/pharmacy-mappers';
import { isCareTeamChatActive } from '~/lib/chat/session';
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
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { isVirtualCareBotEnabled } from '~/lib/virtual-care-bot/config';
import {
  pharmacyEmailConsentApproved,
  pharmacyMessageModeOffered,
} from '~/lib/pharmacy-mail/config';
import { pharmacyPhoneOf } from '~/lib/pharmacy-mail/regions';
import { loadCustomerPharmacyMessages } from '~/lib/pharmacy-mail/thread-views';
import type {
  CustomerPharmacyMessagesData,
  PharmacyContactIntake,
} from '~/lib/pharmacy-mail/view-types';

/* The province of the customer's first saved address (the fax requests and the pharmacy region use it). */
export const getCustomerProvince = cache(async () => {
  const addressData = await getCustomerAddresses({ limit: 1 });
  const address = addressData?.addresses[0];

  return address?.stateOrProvince?.trim() ?? null;
});

export type PharmacyPageData = {
  displayName: string;
  supabaseReady: boolean;
  /*
   * The customer's CPAP prescription, for the "CPAP prescription" card
   * (owner ruling C26 (b), 2026-10-13). CPAP rows never appear in
   * `prescriptions` (medications), refills or CarePack.
   */
  cpapPrescription: CpapPrescriptionState;
  prescriptions: PharmacyPrescription[];
  refillRequests: PharmacyRefillRequest[];
  carepackRequests: PharmacyCarePackRequest[];
  activePrescriptionCount: number;
  /*
   * "Messages from your pharmacist" and "How your pharmacist can reach you"
   * (owner decision Q10, 2026-10-14). Loads on its own terms: when it can't,
   * that card says so and the rest of the page is unaffected.
   */
  pharmacyMessages: CustomerPharmacyMessagesData;
  /* For the contact fieldset on the CPAP intake: the account email it names. */
  pharmacyContactIntake: PharmacyContactIntake;
};

const NO_PHARMACY_MESSAGES: CustomerPharmacyMessagesData = {
  ready: false,
  error: null,
  threads: [],
  contact: null,
  phone: pharmacyPhoneOf('ON'),
  hasUnread: false,
};

export const getPharmacyPageData = cache(async (): Promise<PharmacyPageData | null> => {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return null;
  }

  const first = customer.firstName.trim();
  const last = customer.lastName.trim();
  const displayName = [first, last].filter(Boolean).join(' ') || 'there';
  const contactIntake: PharmacyContactIntake = {
    accountEmail: customer.email.trim(),
    messageModeOffered: pharmacyMessageModeOffered(),
    emailOffered: pharmacyEmailConsentApproved(),
  };

  if (!isSupabaseConfigured()) {
    return {
      displayName,
      supabaseReady: false,
      cpapPrescription: { kind: 'none' },
      prescriptions: [],
      refillRequests: [],
      carepackRequests: [],
      activePrescriptionCount: 0,
      pharmacyMessages: NO_PHARMACY_MESSAGES,
      pharmacyContactIntake: contactIntake,
    };
  }

  try {
    const ensured = await ensureCustomerProfile(customer);

    if (ensured.status !== 'ok') {
      return {
        displayName,
        supabaseReady: false,
        cpapPrescription: { kind: 'none' },
        prescriptions: [],
        refillRequests: [],
        carepackRequests: [],
        activePrescriptionCount: 0,
        pharmacyMessages: NO_PHARMACY_MESSAGES,
        pharmacyContactIntake: contactIntake,
      };
    }

    const allRows = await listPrescriptionsByProfileId(ensured.profile.id);
    const rows = allRows.filter((row) => !isCpapPrescriptionRow(row));
    const cpapRows = allRows.filter((row) => isCpapPrescriptionRow(row));
    const prescriptions = rows.map((row) => mapPrescriptionRow(row));
    const refillRows = await listRefillRequestsByProfileId(ensured.profile.id);
    const carepackRows = await listCarePackRequestsByProfileId(ensured.profile.id);
    const pharmacyMessages = await loadCustomerPharmacyMessages({
      profileId: ensured.profile.id,
      accountEmail: ensured.profile.email ?? customer.email,
      province: await getCustomerProvince(),
    });

    return {
      displayName,
      supabaseReady: true,
      cpapPrescription: cpapPrescriptionState(cpapRows, cpapToday()),
      prescriptions,
      refillRequests: refillRows.map((row) => mapRefillRequestRow(row, prescriptions)),
      carepackRequests: carepackRows.map((row) => mapCarePackRequestRow(row, prescriptions)),
      activePrescriptionCount: prescriptions.filter((rx) => rx.bucket === 'active').length,
      pharmacyMessages,
      pharmacyContactIntake: contactIntake,
    };
  } catch (error) {
    console.error('[supabase] pharmacy page unavailable', error);

    return {
      displayName,
      supabaseReady: false,
      cpapPrescription: { kind: 'none' },
      prescriptions: [],
      refillRequests: [],
      carepackRequests: [],
      activePrescriptionCount: 0,
      pharmacyMessages: NO_PHARMACY_MESSAGES,
      pharmacyContactIntake: contactIntake,
    };
  }
});

export const getVirtualCareSummary = cache(async () => {
  const customer = await getOnboardingCustomer();

  if (!customer || !isSupabaseConfigured()) {
    return { hasUnreadStaffMessage: false, hasUnreadPharmacyMessage: false, activePrescriptionCount: 0 };
  }

  const [pharmacy, ensured] = await Promise.all([
    getPharmacyPageData(),
    ensureCustomerProfile(customer),
  ]);

  if (ensured.status !== 'ok') {
    return {
      hasUnreadStaffMessage: false,
      hasUnreadPharmacyMessage: pharmacy?.pharmacyMessages.hasUnread ?? false,
      activePrescriptionCount: pharmacy?.activePrescriptionCount ?? 0,
    };
  }

  const conv = await getConversationByProfileId(ensured.profile.id);

  if (!conv.ok || !conv.conversationId) {
    return {
      hasUnreadStaffMessage: false,
      hasUnreadPharmacyMessage: pharmacy?.pharmacyMessages.hasUnread ?? false,
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
    hasUnreadPharmacyMessage: pharmacy?.pharmacyMessages.hasUnread ?? false,
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
      careTeamActive: false,
      messages: [],
      hasMoreOlder: false,
      conversationId: null,
      customerLeftAt: null,
      staffClosedAt: null,
      staffJoinedAt: null,
      escalatedToPharmacistAt: null,
    };
  }

  const unavailable = {
    supabaseReady: false as const,
    botEnabled: isVirtualCareBotEnabled(),
    careTeamActive: false,
    messages: [],
    hasMoreOlder: false,
    conversationId: null,
    customerLeftAt: null,
    staffClosedAt: null,
    staffJoinedAt: null,
    escalatedToPharmacistAt: null,
  };

  try {
    const ensured = await ensureCustomerProfile(customer);

    if (ensured.status !== 'ok') {
      return unavailable;
    }

    const conv = await getConversationByProfileId(ensured.profile.id);

    if (!conv.ok || !conv.conversationId) {
      return {
        supabaseReady: true as const,
        botEnabled: isVirtualCareBotEnabled(),
        careTeamActive: false,
        conversationId: null,
        customerLeftAt: conv.ok ? conv.customerLeftAt : null,
        staffClosedAt: conv.ok ? conv.staffClosedAt : null,
        staffJoinedAt: conv.ok ? conv.staffJoinedAt : null,
        escalatedToPharmacistAt: conv.ok ? conv.escalatedToPharmacistAt : null,
        messages: [],
        hasMoreOlder: false,
      };
    }

    const { listRecentMessagesForConversation } = await import('~/lib/supabase/chat-messages');
    const listed = await listRecentMessagesForConversation(conv.conversationId);
    const messages = listed.ok ? listed.messages : [];
    const hasMoreOlder = listed.ok ? listed.hasMoreOlder : false;

    return {
      supabaseReady: true as const,
      botEnabled: isVirtualCareBotEnabled(),
      careTeamActive: isCareTeamChatActive({
        staffJoinedAt: conv.staffJoinedAt,
        staffClosedAt: conv.staffClosedAt,
      }),
      conversationId: conv.conversationId,
      customerLeftAt: conv.customerLeftAt,
      staffJoinedAt: conv.staffJoinedAt,
      staffClosedAt: conv.staffClosedAt,
      escalatedToPharmacistAt: conv.escalatedToPharmacistAt,
      messages,
      hasMoreOlder,
    };
  } catch (error) {
    console.error('[supabase] live chat unavailable', error);

    return unavailable;
  }
});

