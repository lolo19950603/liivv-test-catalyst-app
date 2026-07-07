'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getOnboardingCustomer } from '~/app/[locale]/(default)/account/onboarding/page-data';
import {
  appendCustomerMessage,
  getConversationByProfileId,
  getOrCreateConversation,
  markCustomerLeftChat,
} from '~/lib/supabase/chat-messages';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { ensureCustomerProfile } from '~/lib/supabase/profile';

export type VirtualCareChatActionState = { ok?: boolean; error?: string } | null;

export async function virtualCareChatAction(
  _prevState: VirtualCareChatActionState,
  formData: FormData,
): Promise<VirtualCareChatActionState> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/virtual-care/chat');
  }

  if (!isSupabaseConfigured()) {
    return { ok: false, error: 'Chat storage is not configured.' };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { ok: false, error: 'Could not load your profile.' };
  }

  const intent = String(formData.get('intent') ?? '').trim();

  if (intent === 'leave') {
    const existing = await getConversationByProfileId(ensured.profile.id);

    if (!existing.ok) {
      return { ok: false, error: existing.message };
    }

    if (!existing.conversationId) {
      return { ok: true };
    }

    const left = await markCustomerLeftChat(existing.conversationId);

    if (!left.ok) {
      return { ok: false, error: left.message };
    }

    revalidatePath('/account/virtual-care/chat');
    return { ok: true };
  }

  if (intent !== 'send') {
    return { ok: false, error: 'Invalid request.' };
  }

  const conv = await getOrCreateConversation(ensured.profile.id);

  if (!conv.ok) {
    return { ok: false, error: conv.message };
  }

  const body = String(formData.get('body') ?? '');
  const result = await appendCustomerMessage(conv.conversationId, body);

  if (!result.ok) {
    return { ok: false, error: result.message };
  }

  revalidatePath('/account/virtual-care/chat');
  return { ok: true };
}

export type VirtualCareAppointmentActionState = { ok?: boolean; error?: string } | null;

export async function virtualCareAppointmentAction(
  _prevState: VirtualCareAppointmentActionState,
  formData: FormData,
): Promise<VirtualCareAppointmentActionState> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/virtual-care/appointment');
  }

  const details = String(formData.get('details') ?? '').trim();
  const preferredDate = String(formData.get('preferredDate') ?? '').trim();
  const preferredTime = String(formData.get('preferredTime') ?? '').trim();

  if (!details) {
    return { ok: false, error: 'Please describe what the appointment is about.' };
  }

  if (!preferredDate) {
    return { ok: false, error: 'Please choose a preferred date.' };
  }

  // Manual booking flow — staff follow up by email. Microsoft Graph integration can be added later.
  const displayName = [customer.firstName, customer.lastName].filter(Boolean).join(' ') || 'Customer';

  console.info('[virtual-care appointment request]', {
    customerId: customer.entityId,
    email: customer.email,
    displayName,
    preferredDate,
    preferredTime,
    details,
  });

  revalidatePath('/account/virtual-care/appointment');
  return { ok: true };
}
