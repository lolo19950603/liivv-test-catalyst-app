'use server';

import { revalidatePath } from 'next/cache';

import { hasStaffAccess, revalidateStaffPortalPaths } from '~/lib/staff-access';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import {
  appendStaffMessage,
  joinStaffConversation,
  listConversationsForAdmin,
  markStaffClosedConversation,
} from '~/lib/supabase/chat-messages';
import {
  updateCarePackRequestStatus,
  updatePrescriptionApprovalStatus,
  updateRefillRequestStatus,
} from '~/lib/supabase/prescriptions';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type StaffActionState = { ok?: boolean; error?: string } | null;

async function requireStaffSession(): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await hasStaffAccess())) {
    return { ok: false, error: 'Unauthorized.' };
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Supabase is not configured.' };
  }

  return { ok: true };
}

export async function staffPortalAction(
  _prevState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const auth = await requireStaffSession();

  if (!auth.ok) {
    return auth;
  }

  const intent = String(formData.get('intent') ?? '').trim();

  if (intent === 'prescription_mark_active') {
    const prescriptionId = String(formData.get('prescriptionId') ?? '').trim();

    if (!UUID_RE.test(prescriptionId)) {
      return { ok: false, error: 'Invalid prescription payload.' };
    }

    const updated = await updatePrescriptionApprovalStatus({
      prescriptionId,
      approval_status: 'approved',
      status: 'active',
    });

    if (!updated.ok) {
      return { ok: false, error: updated.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
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
    const result = await joinStaffConversation(conversationId);

    if (!result.ok) {
      return { ok: false, error: result.message };
    }

    revalidateStaffPortalPaths(revalidatePath);
    return { ok: true };
  }

  return { ok: false, error: 'Invalid request.' };
}
