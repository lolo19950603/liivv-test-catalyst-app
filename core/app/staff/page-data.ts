import 'server-only';

import { cache } from 'react';

import {
  getAdminCustomerDetail,
  getAdminCustomerDetailByBigCommerceId,
  searchMergedCustomersForAdmin,
  type AdminCustomerDetail,
  type AdminMergedSearchRow,
} from '~/lib/supabase/admin-customers';
import {
  getOrCreateConversation,
  listConversationsForAdmin,
  listRecentMessagesForConversation,
  type AdminConversationSummary,
  type ChatMessageRow,
} from '~/lib/supabase/chat-messages';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  listAdminCarePackQueue,
  listAdminPrescriptionQueue,
  listAdminRefillQueue,
  type AdminCarePackQueueRow,
  type AdminPrescriptionQueueRow,
  type AdminRefillQueueRow,
} from '~/lib/supabase/prescriptions';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StaffTab = 'pharmacy' | 'customers' | 'chat';
export type PharmacyQueue = 'prescription' | 'refill' | 'carepack';

export type StaffPortalData = {
  supabaseReady: boolean;
  adminTab: StaffTab;
  customerQuery: string;
  selectedProfileId: string | null;
  selectedBigCommerceId: string | null;
  customerSearchRows: AdminMergedSearchRow[];
  customerSearchError: string | null;
  bigcommerceSearchWarning: string | null;
  customerDetail: AdminCustomerDetail | null;
  customerDetailError: string | null;
  prescriptionQueue: AdminPrescriptionQueueRow[];
  refillQueue: AdminRefillQueueRow[];
  carePackQueue: AdminCarePackQueueRow[];
  pharmacyQueueError: string | null;
  pharmacyCustomerDetail: AdminCustomerDetail | null;
  pharmacyCustomerDetailError: string | null;
  pharmacyQueue: PharmacyQueue;
  selectedRequestType: PharmacyQueue | null;
  selectedRequestId: string | null;
  conversations: AdminConversationSummary[];
  listError: string | null;
  selectedConversationId: string | null;
  messages: ChatMessageRow[];
  hasMoreOlder: boolean;
  messagesError: string | null;
};

function parseTab(raw: string | undefined): StaffTab {
  if (raw === 'customers' || raw === 'chat') {
    return raw;
  }

  return 'pharmacy';
}

function parsePharmacyQueue(raw: string | undefined): PharmacyQueue {
  if (raw === 'refill' || raw === 'carepack') {
    return raw;
  }

  return 'prescription';
}

export const getStaffPortalData = cache(
  async (searchParams: Record<string, string | string[] | undefined>): Promise<StaffPortalData> => {
    const get = (key: string) => {
      const value = searchParams[key];

      return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
    };

    const adminTab = parseTab(get('tab'));
    const customerQuery = get('q').trim();
    const selectedProfileIdRaw = get('p').trim() || null;
    const selectedBigCommerceIdRaw = get('bc').trim() || null;
    const pharmacyQueue = parsePharmacyQueue(get('queue'));
    const selectedRequestTypeRaw = get('requestType').trim() as PharmacyQueue | '';
    const selectedRequestIdRaw = get('requestId').trim() || null;
    const selectedRequestType =
      selectedRequestTypeRaw === 'refill' ||
      selectedRequestTypeRaw === 'carepack' ||
      selectedRequestTypeRaw === 'prescription'
        ? selectedRequestTypeRaw
        : null;

    const base: StaffPortalData = {
      supabaseReady: isSupabaseConfigured(),
      adminTab,
      customerQuery,
      selectedProfileId: selectedProfileIdRaw,
      selectedBigCommerceId: selectedBigCommerceIdRaw,
      customerSearchRows: [],
      customerSearchError: null,
      bigcommerceSearchWarning: null,
      customerDetail: null,
      customerDetailError: null,
      prescriptionQueue: [],
      refillQueue: [],
      carePackQueue: [],
      pharmacyQueueError: null,
      pharmacyCustomerDetail: null,
      pharmacyCustomerDetailError: null,
      pharmacyQueue,
      selectedRequestType,
      selectedRequestId: selectedRequestIdRaw,
      conversations: [],
      listError: null,
      selectedConversationId: null,
      messages: [],
      hasMoreOlder: false,
      messagesError: null,
    };

    if (!isSupabaseConfigured()) {
      return base;
    }

    if (adminTab === 'customers') {
      if (customerQuery.length >= 2) {
        const s = await searchMergedCustomersForAdmin(customerQuery);

        if (!s.ok) {
          base.customerSearchError = s.message;
        } else {
          base.customerSearchRows = s.rows;
          base.bigcommerceSearchWarning = s.bigcommerceSearchError;
        }
      }

      if (selectedProfileIdRaw) {
        if (!UUID_RE.test(selectedProfileIdRaw)) {
          base.customerDetailError = 'Invalid customer id.';
        } else {
          const d = await getAdminCustomerDetail(selectedProfileIdRaw);

          if (!d.ok) {
            base.customerDetailError = d.message;
          } else {
            base.customerDetail = d.detail;
          }
        }
      } else if (selectedBigCommerceIdRaw) {
        const d = await getAdminCustomerDetailByBigCommerceId(selectedBigCommerceIdRaw);

        if (!d.ok) {
          base.customerDetailError = d.message;
        } else {
          base.customerDetail = d.detail;
        }
      }
    }

    if (adminTab === 'pharmacy') {
      try {
        const [prescriptionQueue, refillQueue, carePackQueue] = await Promise.all([
          listAdminPrescriptionQueue(300),
          listAdminRefillQueue(300),
          listAdminCarePackQueue(300),
        ]);

        base.prescriptionQueue = prescriptionQueue;
        base.refillQueue = refillQueue;
        base.carePackQueue = carePackQueue;

        let selectedProfileId: string | null = null;

        if (selectedRequestIdRaw && UUID_RE.test(selectedRequestIdRaw)) {
          if (selectedRequestType === 'refill') {
            selectedProfileId =
              refillQueue.find((row) => row.id === selectedRequestIdRaw)?.profile_id ?? null;
          } else if (selectedRequestType === 'carepack') {
            selectedProfileId =
              carePackQueue.find((row) => row.id === selectedRequestIdRaw)?.profile_id ?? null;
          } else {
            selectedProfileId =
              prescriptionQueue.find((row) => row.id === selectedRequestIdRaw)?.profile_id ?? null;
          }
        }

        if (selectedProfileId && UUID_RE.test(selectedProfileId)) {
          const detail = await getAdminCustomerDetail(selectedProfileId);

          if (detail.ok) {
            base.pharmacyCustomerDetail = detail.detail;
          } else {
            base.pharmacyCustomerDetailError = detail.message;
          }
        }
      } catch {
        base.pharmacyQueueError = 'Could not load pharmacy queue right now.';
      }
    }

    if (adminTab === 'chat') {
      const listed = await listConversationsForAdmin();

      if (!listed.ok) {
        base.listError = listed.message;
      } else {
        base.conversations = listed.rows;
      }

      let selectedId = get('c').trim() || null;
      const profileFromQuery = get('profile').trim() || null;

      if (!selectedId && profileFromQuery && UUID_RE.test(profileFromQuery)) {
        const conv = await getOrCreateConversation(profileFromQuery);

        if (conv.ok) {
          selectedId = conv.conversationId;
          const refreshed = await listConversationsForAdmin();

          if (refreshed.ok) {
            base.conversations = refreshed.rows;
          }
        }
      }

      if (
        selectedId &&
        (!UUID_RE.test(selectedId) ||
          !base.conversations.some((row) => row.conversationId === selectedId))
      ) {
        selectedId = null;
      }

      base.selectedConversationId = selectedId;

      if (selectedId) {
        const msg = await listRecentMessagesForConversation(selectedId);

        if (!msg.ok) {
          base.messagesError = msg.message;
        } else {
          base.messages = msg.messages;
          base.hasMoreOlder = msg.hasMoreOlder;
        }
      }
    }

    return base;
  },
);
