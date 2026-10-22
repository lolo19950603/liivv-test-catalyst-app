'use server';

import { revalidatePath } from 'next/cache';

import { runStaffAction } from '~/lib/action-gateway/session';
import { prependOrderStaffNote } from '~/lib/bigcommerce/order-staff-notes';
import { cpapToday, previousDay } from '~/lib/pharmacy/cpap-prescription';
import { isCpapPrescriptionRow } from '~/lib/pharmacy/pharmacy-mappers';
import { getStaffAccessContext, revalidateStaffPortalPaths } from '~/lib/staff-access';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  appendStaffMessage,
  joinStaffConversation,
  listConversationsForAdmin,
  listOlderMessagesForConversation,
  markStaffClosedConversation,
  type ChatMessageRow,
} from '~/lib/supabase/chat-messages';
import {
  getPrescriptionById,
  updateCarePackRequestStatus,
  updateCpapPrescriptionReview,
  updatePrescriptionApprovalStatus,
  updateRefillRequestStatus,
} from '~/lib/supabase/prescriptions';
import {
  getRxOrderCheckById,
  type RxOrderCheckStatus,
  updateRxOrderCheckStatus,
} from '~/lib/supabase/rx-order-checks';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StaffActionState = { ok?: boolean; error?: string } | null;

const STAFF_UNAUTHORIZED = { ok: false, error: 'Unauthorized.' } as const;

/*
 * =============================================================================
 * CPAP PRESCRIPTIONS AND COMPLETE-MASK ORDERS (owner ruling C26 (b), 2026-10-13)
 * =============================================================================
 * A CPAP prescription (prescriptions.rx_kind 'cpap') lets the customer pay for
 * a complete CPAP mask while it is approved and its expiry is today or later
 * (~/lib/checkout/checkout-gates.ts). So approving one REQUIRES an expiry,
 * rejecting one needs a reason, and both record the pharmacist who decided
 * and when. The generic status and end-date intents refuse CPAP rows.
 *
 * Every paid complete-mask order is a Mask orders row (rx_order_checks) that a
 * pharmacist signs off, asks for more information on, or rejects. Phase 1
 * records the decision, and puts a neutral line at the top of the BigCommerce
 * order's staff notes so fulfilment sees it there ("RX-CHECK: SIGNED OFF ...
 * OK to ship", "... Do not ship"). A rejected order is cancelled and refunded
 * by hand until phase 2 adds the BigCommerce hold and the refund.
 *
 * The admin is one shared login, so every decision also asks for the
 * pharmacist's own name and licence number, recorded in reviewed_by with the
 * login it came from.
 *
 * Each intent has its allowed "from" statuses, checked against the row and
 * again when the row is written.
 * =============================================================================
 */

type CpapRxIntent = 'cpap_rx_approve' | 'cpap_rx_reject' | 'cpap_rx_reopen' | 'cpap_rx_expire';

/* CPAP prescription: which approval statuses each decision may start from. */
const CPAP_RX_TRANSITIONS: Record<CpapRxIntent, readonly string[]> = {
  cpap_rx_approve: ['pending_review', 'needs_info', 'approved', 'expired'],
  cpap_rx_reject: ['pending_review', 'needs_info', 'approved', 'expired'],
  cpap_rx_reopen: ['approved', 'rejected', 'expired'],
  cpap_rx_expire: ['approved'],
};

const CPAP_RX_NOT_ALLOWED: Record<CpapRxIntent, string> = {
  cpap_rx_approve: 'Set this CPAP prescription back to pending review first.',
  cpap_rx_reject: 'This CPAP prescription can’t be rejected from its current status.',
  cpap_rx_reopen: 'This CPAP prescription is already pending review.',
  cpap_rx_expire: 'Only an approved CPAP prescription can be marked expired.',
};

type MaskOrderIntent = 'mask_order_sign_off' | 'mask_order_needs_info' | 'mask_order_reject';

/* Mask orders: which statuses each decision may start from, and where it goes. */
const MASK_ORDER_TRANSITIONS: Record<
  MaskOrderIntent,
  { to: RxOrderCheckStatus; from: readonly RxOrderCheckStatus[]; reasonError: string | null }
> = {
  mask_order_sign_off: {
    to: 'signed_off',
    from: ['awaiting_signoff', 'needs_info'],
    reasonError: null,
  },
  mask_order_needs_info: {
    to: 'needs_info',
    from: ['awaiting_signoff'],
    reasonError: 'Say what information is needed.',
  },
  mask_order_reject: {
    to: 'rejected',
    from: ['awaiting_signoff', 'needs_info'],
    reasonError: 'Give a reason for rejecting this order.',
  },
};

const REASON_MAX = 500;
const REVIEWER_MAX = 120;

/*
 * The line put at the top of the BigCommerce order's staff notes for each
 * decision. Neutral words only: never the reason, which may hold health
 * details.
 */
const MASK_ORDER_STAFF_NOTE: Record<MaskOrderIntent, (day: string) => string> = {
  mask_order_sign_off: (day) => `RX-CHECK: SIGNED OFF by a Liivv pharmacist on ${day}. OK to ship.`,
  mask_order_needs_info: (day) =>
    `RX-CHECK: ON HOLD since ${day}. A Liivv pharmacist needs more information. Do not ship.`,
  mask_order_reject: (day) =>
    `RX-CHECK: REJECTED by a Liivv pharmacist on ${day}. DO NOT SHIP. Cancel and refund by hand.`,
};

/* A form field as trimmed text; anything that is not text reads as empty. */
function formText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === 'string' ? value.trim() : '';
}

/*
 * Who made this decision: the pharmacist's own name and licence number, as
 * typed on the form (the admin is one shared login), with the login it came
 * from. Unauthorized without a staff session; an error when the name is
 * missing.
 */
async function reviewerOf(
  formData: FormData,
): Promise<{ reviewedBy: string } | { unauthorized: true } | { error: string }> {
  const username = (await getStaffAccessContext())?.username;

  if (!username) {
    return { unauthorized: true };
  }

  const pharmacist = formText(formData, 'reviewerName').replace(/\s+/g, ' ').slice(0, REVIEWER_MAX);

  if (pharmacist.length < 3) {
    return { error: 'Enter your name and licence number.' };
  }

  return { reviewedBy: `${pharmacist} (login: ${username})` };
}

function isCpapRxIntent(intent: string): intent is CpapRxIntent {
  return Object.hasOwn(CPAP_RX_TRANSITIONS, intent);
}

function isMaskOrderIntent(intent: string): intent is MaskOrderIntent {
  return Object.hasOwn(MASK_ORDER_TRANSITIONS, intent);
}

/* The update one CPAP decision makes, or an error the pharmacist must fix first. */
function cpapRxDecision(
  intent: CpapRxIntent,
  formData: FormData,
  currentEndDate: string | null,
):
  | { error: string }
  | {
      update: {
        approval_status: 'approved' | 'rejected' | 'pending_review' | 'expired';
        status: string;
        end_date?: string;
        review_reason?: string | null;
      };
    } {
  if (intent === 'cpap_rx_approve') {
    const endDate = formText(formData, 'endDate');

    if (!/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return { error: 'Set the date this CPAP prescription is valid until.' };
    }

    if (endDate < cpapToday()) {
      return { error: 'The expiry must be today or later.' };
    }

    return {
      update: { approval_status: 'approved', status: 'active', end_date: endDate, review_reason: null },
    };
  }

  if (intent === 'cpap_rx_reject') {
    const reason = formText(formData, 'reason').slice(0, REASON_MAX);

    if (!reason) {
      return { error: 'Give a reason for not accepting this CPAP prescription.' };
    }

    return { update: { approval_status: 'rejected', status: 'rejected', review_reason: reason } };
  }

  if (intent === 'cpap_rx_reopen') {
    return { update: { approval_status: 'pending_review', status: 'pending', review_reason: null } };
  }

  // Marked expired today: an expiry still in the future (or none) becomes
  // yesterday, so the customer's card and this panel never show a "valid
  // until" date that has not come yet.
  const today = cpapToday();
  const lastDay = String(currentEndDate ?? '').slice(0, 10);
  const keepsEndDate = /^\d{4}-\d{2}-\d{2}$/.test(lastDay) && lastDay < today;

  return {
    update: {
      approval_status: 'expired',
      status: 'expired',
      ...(keepsEndDate ? {} : { end_date: previousDay(today) }),
    },
  };
}

async function cpapPrescriptionAction(
  intent: CpapRxIntent,
  formData: FormData,
): Promise<StaffActionState> {
  const prescriptionId = formText(formData, 'prescriptionId');

  if (!UUID_RE.test(prescriptionId)) {
    return { ok: false, error: 'Invalid prescription payload.' };
  }

  const reviewer = await reviewerOf(formData);

  if ('unauthorized' in reviewer) {
    return STAFF_UNAUTHORIZED;
  }

  if ('error' in reviewer) {
    return { ok: false, error: reviewer.error };
  }

  const row = await getPrescriptionById(prescriptionId);

  if (!row || !isCpapPrescriptionRow(row)) {
    return { ok: false, error: 'CPAP prescription not found.' };
  }

  const current = (row.approval_status ?? '').trim().toLowerCase() || 'pending_review';

  if (!CPAP_RX_TRANSITIONS[intent].includes(current)) {
    return { ok: false, error: CPAP_RX_NOT_ALLOWED[intent] };
  }

  const decision = cpapRxDecision(intent, formData, row.end_date);

  if ('error' in decision) {
    return { ok: false, error: decision.error };
  }

  const updated = await updateCpapPrescriptionReview({
    prescriptionId,
    fromStatuses: CPAP_RX_TRANSITIONS[intent],
    ...decision.update,
    reviewed_by: reviewer.reviewedBy,
  });

  return updated.ok ? { ok: true } : { ok: false, error: updated.message };
}

async function maskOrderAction(
  intent: MaskOrderIntent,
  formData: FormData,
): Promise<StaffActionState> {
  const checkId = formText(formData, 'checkId');

  if (!UUID_RE.test(checkId)) {
    return { ok: false, error: 'Invalid mask order payload.' };
  }

  const reviewer = await reviewerOf(formData);

  if ('unauthorized' in reviewer) {
    return STAFF_UNAUTHORIZED;
  }

  if ('error' in reviewer) {
    return { ok: false, error: reviewer.error };
  }

  const transition = MASK_ORDER_TRANSITIONS[intent];
  const reason = formText(formData, 'reason').slice(0, REASON_MAX);

  if (transition.reasonError && !reason) {
    return { ok: false, error: transition.reasonError };
  }

  const check = await getRxOrderCheckById(checkId);

  if (!check) {
    return { ok: false, error: 'Mask order not found.' };
  }

  const updated = await updateRxOrderCheckStatus({
    id: checkId,
    status: transition.to,
    fromStatuses: transition.from,
    reason: transition.reasonError ? reason : null,
    reviewedBy: reviewer.reviewedBy,
  });

  if (!updated.ok) {
    return { ok: false, error: updated.message };
  }

  // Tell fulfilment in BigCommerce too. Best effort: the decision is already
  // recorded, so a failure here is reported for the pharmacist to fix by hand.
  const note = MASK_ORDER_STAFF_NOTE[intent](cpapToday());

  try {
    await prependOrderStaffNote(Number(check.bigcommerce_order_id), note);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(
      `[rx-order-checks] The staff note on BigCommerce order ${check.bigcommerce_order_id} could not be updated.`,
      error,
    );

    return {
      ok: true,
      error: `Decision recorded, but BigCommerce order #${check.bigcommerce_order_id} could not be updated. Add this line to its staff notes by hand: "${note}"`,
    };
  }

  return { ok: true };
}

export async function staffPortalAction(
  _prevState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  return runStaffAction(STAFF_UNAUTHORIZED, async (): Promise<StaffActionState> => {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const intent = String(formData.get('intent') ?? '').trim();

  if (isCpapRxIntent(intent)) {
    const result = await cpapPrescriptionAction(intent, formData);

    if (result?.ok) {
      revalidateStaffPortalPaths(revalidatePath);
    }

    return result;
  }

  if (isMaskOrderIntent(intent)) {
    const result = await maskOrderAction(intent, formData);

    if (result?.ok) {
      revalidateStaffPortalPaths(revalidatePath);
    }

    return result;
  }

  if (intent === 'prescription_set_status') {
    const prescriptionId = String(formData.get('prescriptionId') ?? '').trim();
    const nextStatus = String(formData.get('status') ?? '').trim();

    if (!UUID_RE.test(prescriptionId)) {
      return { ok: false, error: 'Invalid prescription payload.' };
    }

    if (!['pending_review', 'approved', 'rejected', 'expired'].includes(nextStatus)) {
      return { ok: false, error: 'Invalid prescription status.' };
    }

    // A CPAP prescription is approved only with an expiry and rejected only
    // with a reason (cpap_rx_approve / cpap_rx_reject).
    const existing = await getPrescriptionById(prescriptionId);

    if (!existing) {
      return { ok: false, error: 'Prescription not found.' };
    }

    if (isCpapPrescriptionRow(existing)) {
      return { ok: false, error: 'Use the CPAP prescription controls for this prescription.' };
    }

    const updated = await updatePrescriptionApprovalStatus({
      prescriptionId,
      approval_status: nextStatus,
      status:
        nextStatus === 'approved'
          ? 'active'
          : nextStatus === 'rejected'
            ? 'rejected'
            : nextStatus === 'expired'
              ? 'expired'
              : 'pending',
    });

    if (!updated.ok) {
      return { ok: false, error: updated.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  if (intent === 'prescription_set_end_date') {
    const prescriptionId = String(formData.get('prescriptionId') ?? '').trim();
    const endDateRaw = String(formData.get('endDate') ?? '').trim();

    if (!UUID_RE.test(prescriptionId)) {
      return { ok: false, error: 'Invalid prescription payload.' };
    }

    if (endDateRaw && !/^\d{4}-\d{2}-\d{2}$/.test(endDateRaw)) {
      return { ok: false, error: 'Invalid prescription end date.' };
    }

    const existing = await getPrescriptionById(prescriptionId);

    if (!existing) {
      return { ok: false, error: 'Prescription not found.' };
    }

    if (isCpapPrescriptionRow(existing)) {
      return { ok: false, error: 'Use the CPAP prescription controls for this prescription.' };
    }

    const today = new Date().toISOString().slice(0, 10);
    const autoExpired = Boolean(endDateRaw) && endDateRaw <= today;
    const updated = await updatePrescriptionApprovalStatus({
      prescriptionId,
      approval_status: autoExpired
        ? 'expired'
        : String(formData.get('approvalStatus') ?? 'pending_review'),
      status: autoExpired ? 'expired' : undefined,
      end_date: endDateRaw || null,
    });

    if (!updated.ok) {
      return { ok: false, error: updated.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  if (intent === 'refill_mark_processing' || intent === 'refill_mark_completed') {
    const refillRequestId = String(formData.get('refillRequestId') ?? '').trim();

    if (!UUID_RE.test(refillRequestId)) {
      return { ok: false, error: 'Invalid refill payload.' };
    }

    const nextStatus = intent === 'refill_mark_processing' ? 'refill_processing' : 'completed';
    const updated = await updateRefillRequestStatus({ refillRequestId, status: nextStatus });

    if (!updated.ok) {
      return { ok: false, error: updated.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  if (intent === 'refill_set_status') {
    const refillRequestId = String(formData.get('refillRequestId') ?? '').trim();
    const nextStatus = String(formData.get('status') ?? '').trim();

    if (!UUID_RE.test(refillRequestId)) {
      return { ok: false, error: 'Invalid refill payload.' };
    }

    if (!['pending_review', 'refill_processing', 'completed', 'rejected'].includes(nextStatus)) {
      return { ok: false, error: 'Invalid refill status.' };
    }

    const updated = await updateRefillRequestStatus({ refillRequestId, status: nextStatus });

    if (!updated.ok) {
      return { ok: false, error: updated.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  if (intent === 'carepack_mark_setup' || intent === 'carepack_mark_active') {
    const carePackRequestId = String(formData.get('carePackRequestId') ?? '').trim();

    if (!UUID_RE.test(carePackRequestId)) {
      return { ok: false, error: 'Invalid CarePack payload.' };
    }

    const nextStatus = intent === 'carepack_mark_setup' ? 'setup_in_progress' : 'active';
    const updated = await updateCarePackRequestStatus({ carePackRequestId, status: nextStatus });

    if (!updated.ok) {
      return { ok: false, error: updated.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  if (intent === 'carepack_set_status') {
    const carePackRequestId = String(formData.get('carePackRequestId') ?? '').trim();
    const nextStatus = String(formData.get('status') ?? '').trim();

    if (!UUID_RE.test(carePackRequestId)) {
      return { ok: false, error: 'Invalid CarePack payload.' };
    }

    if (!['pending_review', 'setup_in_progress', 'active', 'rejected'].includes(nextStatus)) {
      return { ok: false, error: 'Invalid CarePack status.' };
    }

    const updated = await updateCarePackRequestStatus({ carePackRequestId, status: nextStatus });

    if (!updated.ok) {
      return { ok: false, error: updated.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  const conversationId = String(formData.get('conversationId') ?? '').trim();

  if (!UUID_RE.test(conversationId)) {
    return { ok: false, error: 'Invalid conversation.' };
  }

  const convs = await listConversationsForAdmin();

  if (!convs.ok) {
    return { ok: false, error: convs.message };
  }

  if (!convs.rows.some((r) => r.conversationId === conversationId)) {
    return { ok: false, error: 'Conversation not found.' };
  }

  if (intent === 'reply') {
    const body = String(formData.get('body') ?? '');
    const result = await appendStaffMessage(conversationId, body);

    if (!result.ok) {
      return { ok: false, error: result.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  if (intent === 'endConversation') {
    const result = await markStaffClosedConversation(conversationId);

    if (!result.ok) {
      return { ok: false, error: result.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  if (intent === 'joinConversation' || intent === 'reopenConversation') {
    const access = await getStaffAccessContext();

    if (!access) {
      return STAFF_UNAUTHORIZED;
    }

    const result = await joinStaffConversation(conversationId, access.username);

    if (!result.ok) {
      return { ok: false, error: result.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  return { ok: false, error: 'Invalid request.' };
  });
}

export async function loadOlderStaffChatMessagesAction(
  conversationId: string,
  beforeCreatedAt: string,
): Promise<
  | { ok: true; messages: ChatMessageRow[]; hasMoreOlder: boolean }
  | { ok: false; error: string }
> {
  return runStaffAction({ ok: false, error: 'Unauthorized.' }, async () => {
  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  const id = conversationId.trim();
  const cursor = beforeCreatedAt.trim();

  if (!UUID_RE.test(id)) {
    return { ok: false, error: 'Invalid conversation.' };
  }

  if (!cursor) {
    return { ok: false, error: 'Missing message cursor.' };
  }

  const convs = await listConversationsForAdmin();

  if (!convs.ok) {
    return { ok: false, error: convs.message };
  }

  if (!convs.rows.some((row) => row.conversationId === id)) {
    return { ok: false, error: 'Conversation not found.' };
  }

  const listed = await listOlderMessagesForConversation(id, cursor);

  if (!listed.ok) {
    return { ok: false, error: listed.message };
  }

  return { ok: true, messages: listed.messages, hasMoreOlder: listed.hasMoreOlder };
  });
}
