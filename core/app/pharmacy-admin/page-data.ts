import 'server-only';

import { cache } from 'react';

import {
  ADMIN_CUSTOMER_PAGE_SIZE,
  getAdminCustomerDetail,
  getAdminCustomerDetailByBigCommerceId,
  listProfilesPageForAdmin,
  countProfilesForAdmin,
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
  listCarePackRequestsByProfileId,
  listPrescriptionsByProfileId,
  listRefillRequestsByProfileId,
  type AdminCarePackQueueRow,
  type AdminPrescriptionQueueRow,
  type AdminRefillQueueRow,
} from '~/lib/supabase/prescriptions';
import {
  customerSearchMinLength,
  parseCustomerSearchField,
  type CustomerSearchField,
} from '~/lib/staff/customer-search';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StaffTab = 'pharmacy' | 'customers' | 'chat';
export type PharmacyQueue = 'prescription' | 'refill' | 'carepack';

export type ChatPatientContext = {
  profileId: string;
  activePrescriptions: string[];
  openRefills: string[];
  carePacks: string[];
};

export type StaffPortalData = {
  supabaseReady: boolean;
  adminTab: StaffTab;
  customerQuery: string;
  customerSearchField: CustomerSearchField;
  customerDirectory: boolean;
  customerPage: number;
  customerPageSize: number;
  customerTotal: number;
  customerNavTotal: number;
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
  chatPatientContext: ChatPatientContext | null;
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

function parseCustomerPage(raw: string | undefined): number {
  const page = Number.parseInt(raw ?? '', 10);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.min(page, 10_000);
}

export const getStaffPortalData = cache(
  async (searchParams: Record<string, string | string[] | undefined>): Promise<StaffPortalData> => {
    const get = (key: string) => {
      const value = searchParams[key];

      return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
    };

    const adminTab = parseTab(get('tab'));
    const customerQuery = get('q').trim();
    const customerSearchField = parseCustomerSearchField(get('by'));
    const customerPage = parseCustomerPage(get('page'));
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
      customerSearchField,
      customerDirectory: false,
      customerPage: 1,
      customerPageSize: ADMIN_CUSTOMER_PAGE_SIZE,
      customerTotal: 0,
      customerNavTotal: 0,
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
      chatPatientContext: null,
    };

    if (!isSupabaseConfigured()) {
      return base;
    }

    try {
      const [customerNavTotal, queues, inbox] = await Promise.all([
        countProfilesForAdmin(),
        Promise.all([
          listAdminPrescriptionQueue(300),
          listAdminRefillQueue(300),
          listAdminCarePackQueue(300),
        ]).then(
          (rows) => ({ ok: true as const, rows }),
          () => ({ ok: false as const }),
        ),
        listConversationsForAdmin(),
      ]);

      base.customerNavTotal = customerNavTotal;

      if (queues.ok) {
        const [prescriptionQueue, refillQueue, carePackQueue] = queues.rows;

        base.prescriptionQueue = prescriptionQueue;
        base.refillQueue = refillQueue;
        base.carePackQueue = carePackQueue;
      } else {
        base.pharmacyQueueError = 'Could not load pharmacy queue right now.';
      }

      if (inbox.ok) {
        base.conversations = inbox.rows;
      } else if (adminTab === 'chat') {
        base.listError = inbox.message;
      }

      if (adminTab === 'customers') {
        if (customerQuery.length >= customerSearchMinLength(customerSearchField)) {
          const s = await searchMergedCustomersForAdmin(customerQuery, customerSearchField);

          if (!s.ok) {
            base.customerSearchError = s.message;
          } else {
            base.customerSearchRows = s.rows;
            base.customerTotal = s.rows.length;
            base.bigcommerceSearchWarning = s.bigcommerceSearchError;
          }
        } else {
          const listed = await listProfilesPageForAdmin(customerPage);

          if (!listed.ok) {
            base.customerSearchError = listed.message;
          } else {
            base.customerDirectory = true;
            base.customerSearchRows = listed.rows;
            base.customerPage = listed.page;
            base.customerPageSize = listed.pageSize;
            base.customerTotal = listed.total;
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
          let selectedProfileId: string | null = null;

          if (selectedRequestIdRaw && UUID_RE.test(selectedRequestIdRaw)) {
            if (selectedRequestType === 'refill') {
              selectedProfileId =
                base.refillQueue.find((row) => row.id === selectedRequestIdRaw)?.profile_id ?? null;
            } else if (selectedRequestType === 'carepack') {
              selectedProfileId =
                base.carePackQueue.find((row) => row.id === selectedRequestIdRaw)?.profile_id ?? null;
            } else {
              selectedProfileId =
                base.prescriptionQueue.find((row) => row.id === selectedRequestIdRaw)?.profile_id ?? null;
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
          const selectedProfileId =
            base.conversations.find((row) => row.conversationId === selectedId)?.profileId ?? null;
          const [msg, patientContext] = await Promise.all([
            listRecentMessagesForConversation(selectedId),
            selectedProfileId && UUID_RE.test(selectedProfileId)
              ? loadChatPatientContext(selectedProfileId)
              : Promise.resolve(null),
          ]);

          if (!msg.ok) {
            base.messagesError = msg.message;
          } else {
            base.messages = msg.messages;
            base.hasMoreOlder = msg.hasMoreOlder;
          }

          base.chatPatientContext = patientContext;
        }
      }
    } catch (error) {
      console.error('[supabase] pharmacist admin unavailable', error);
      base.supabaseReady = false;
      base.pharmacyQueueError = base.pharmacyQueueError ?? 'Health records are temporarily unavailable.';
      base.listError = base.listError ?? 'Health records are temporarily unavailable.';
      base.customerSearchError = base.customerSearchError ?? 'Health records are temporarily unavailable.';
    }

    return base;
  },
);

async function loadChatPatientContext(profileId: string): Promise<ChatPatientContext | null> {
  try {
    const [prescriptions, refills, carePacks] = await Promise.all([
      listPrescriptionsByProfileId(profileId),
      listRefillRequestsByProfileId(profileId),
      listCarePackRequestsByProfileId(profileId),
    ]);
    const nameById = new Map(prescriptions.map((row) => [row.id, row.medication_name]));
    const namesFor = (ids: string[]) => {
      const names = ids.map((id) => nameById.get(id)).filter((name): name is string => Boolean(name));

      return names.length > 0 ? names.join(', ') : 'Medication pending';
    };

    return {
      profileId,
      activePrescriptions: prescriptions
        .filter((row) => {
          const approval = String(row.approval_status ?? '').toLowerCase();
          const status = String(row.status ?? '').toLowerCase();

          return approval === 'approved' || status === 'active';
        })
        .slice(0, 5)
        .map((row) => row.medication_name),
      openRefills: refills
        .filter((row) => {
          const status = String(row.status ?? '').toLowerCase();

          return status === 'pending_review' || status === 'refill_processing';
        })
        .slice(0, 4)
        .map((row) => namesFor(row.prescription_ids ?? [])),
      carePacks: carePacks
        .filter((row) => {
          const status = String(row.status ?? '').toLowerCase();

          return status === 'pending_review' || status === 'setup_in_progress' || status === 'active';
        })
        .slice(0, 3)
        .map((row) => namesFor(row.prescription_ids ?? [])),
    };
  } catch {
    return null;
  }
}
