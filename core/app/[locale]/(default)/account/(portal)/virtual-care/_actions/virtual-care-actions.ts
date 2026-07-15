'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

import { getVirtualCareChatData } from '~/app/[locale]/(default)/account/(portal)/pharmacy/page-data';
import { getOnboardingCustomer } from '~/app/[locale]/(default)/account/onboarding/page-data';
import {
  getLiveChatLastSeen,
  getLiveChatLastSeenCookieOptions,
  LIVE_CHAT_LAST_SEEN_COOKIE,
} from '~/lib/chat/cookie';
import {
  appendCustomerMessage,
  countUnreadStaffMessages,
  getConversationByProfileId,
  getOrCreateConversation,
  listOlderMessagesForConversation,
  markCustomerLeftChat,
  type ChatMessageRow,
} from '~/lib/supabase/chat-messages';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { ensureCustomerProfile } from '~/lib/supabase/profile';
import { isVirtualCareVoiceEnabled } from '~/lib/virtual-care-bot/config';
import { processCustomerMessageForBot } from '~/lib/virtual-care-bot/process-customer-message';
import { synthesizeChatSpeech, transcribeChatAudio } from '~/lib/virtual-care-bot/voice';

export type LiveChatSessionPayload = {
  supabaseReady: boolean;
  botEnabled: boolean;
  careTeamActive: boolean;
  conversationId: string | null;
  customerLeftAt: string | null;
  staffClosedAt: string | null;
  escalatedToPharmacistAt: string | null;
  messages: NonNullable<Awaited<ReturnType<typeof getVirtualCareChatData>>>['messages'];
  hasMoreOlder: boolean;
};

export async function getLiveChatSessionAction(): Promise<{
  isLoggedIn: boolean;
  data: LiveChatSessionPayload | null;
}> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { isLoggedIn: false, data: null };
  }

  const chat = await getVirtualCareChatData();

  if (!chat) {
    return { isLoggedIn: true, data: null };
  }

  return {
    isLoggedIn: true,
    data: {
      supabaseReady: chat.supabaseReady,
      botEnabled: chat.botEnabled,
      careTeamActive: chat.careTeamActive,
      conversationId: chat.conversationId,
      customerLeftAt: chat.customerLeftAt,
      staffClosedAt: chat.staffClosedAt,
      escalatedToPharmacistAt: chat.escalatedToPharmacistAt,
      messages: chat.messages,
      hasMoreOlder: chat.hasMoreOlder,
    },
  };
}

export async function loadOlderLiveChatMessagesAction(beforeCreatedAt: string): Promise<
  | { ok: true; messages: ChatMessageRow[]; hasMoreOlder: boolean }
  | { ok: false; error: string }
> {
  const customer = await getOnboardingCustomer();

  if (!customer || !isSupabaseConfigured()) {
    return { ok: false, error: 'Chat is not available.' };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { ok: false, error: 'Chat is not available.' };
  }

  const conversation = await getConversationByProfileId(ensured.profile.id);

  if (!conversation.ok || !conversation.conversationId) {
    return { ok: false, error: 'No conversation yet.' };
  }

  const cursor = beforeCreatedAt.trim();

  if (!cursor) {
    return { ok: false, error: 'Missing message cursor.' };
  }

  const listed = await listOlderMessagesForConversation(conversation.conversationId, cursor);

  if (!listed.ok) {
    return { ok: false, error: listed.message };
  }

  return { ok: true, messages: listed.messages, hasMoreOlder: listed.hasMoreOlder };
}

export async function getLiveChatUnreadStaffCountAction(): Promise<{ count: number }> {
  const customer = await getOnboardingCustomer();

  if (!customer || !isSupabaseConfigured()) {
    return { count: 0 };
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return { count: 0 };
  }

  const conversation = await getConversationByProfileId(ensured.profile.id);

  if (!conversation.ok || !conversation.conversationId) {
    return { count: 0 };
  }

  const lastSeen = await getLiveChatLastSeen();
  const unread = await countUnreadStaffMessages(conversation.conversationId, lastSeen);

  if (!unread.ok) {
    return { count: 0 };
  }

  return { count: unread.count };
}

export async function markLiveChatReadAction(): Promise<{ ok: true }> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { ok: true };
  }

  const cookieStore = await cookies();

  cookieStore.set(
    LIVE_CHAT_LAST_SEEN_COOKIE,
    encodeURIComponent(new Date().toISOString()),
    getLiveChatLastSeenCookieOptions(),
  );

  return { ok: true };
}

export type VirtualCareChatActionState = { ok?: boolean; error?: string } | null;

export async function virtualCareChatAction(
  _prevState: VirtualCareChatActionState,
  formData: FormData,
): Promise<VirtualCareChatActionState> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/?chat=open');
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

    revalidatePath('/', 'layout');
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

  const botResult = await processCustomerMessageForBot({
    conversationId: conv.conversationId,
    profileId: ensured.profile.id,
    customerMessage: body,
    staffJoinedAt: conv.staffJoinedAt,
    staffClosedAt: conv.staffClosedAt,
  });

  if (!botResult.ok) {
    console.error('[virtual-care-bot]', botResult.message);
  }

  return { ok: true };
}

export type TranscribeChatVoiceResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export async function transcribeChatVoiceAction(
  formData: FormData,
): Promise<TranscribeChatVoiceResult> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { ok: false, error: 'Please sign in to use voice chat.' };
  }

  if (!isVirtualCareVoiceEnabled()) {
    return { ok: false, error: 'Voice chat is not available right now.' };
  }

  const audio = formData.get('audio');

  if (!(audio instanceof Blob) || audio.size === 0) {
    return { ok: false, error: 'No audio received.' };
  }

  try {
    const mimeType =
      'type' in audio && typeof audio.type === 'string' && audio.type
        ? audio.type
        : 'audio/webm';
    const hasAudioExt =
      audio instanceof File && /\.(webm|mp4|m4a|wav|mp3|ogg|oga)$/i.test(audio.name);
    const extension = mimeType.includes('mp4') || mimeType.includes('m4a')
      ? 'mp4'
      : mimeType.includes('wav')
        ? 'wav'
        : 'webm';
    const file =
      audio instanceof File && hasAudioExt
        ? audio
        : new File([audio], `voice.${extension}`, { type: mimeType || `audio/${extension}` });
    const text = await transcribeChatAudio(file);

    return { ok: true, text };
  } catch (error) {
    console.error('[virtual-care-voice] transcribe', error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not transcribe that recording.',
    };
  }
}

export type SynthesizeChatVoiceResult =
  | { ok: true; audioBase64: string; mimeType: string }
  | { ok: false; error: string };

export async function synthesizeChatVoiceAction(
  text: string,
): Promise<SynthesizeChatVoiceResult> {
  const customer = await getOnboardingCustomer();

  if (!customer) {
    return { ok: false, error: 'Please sign in to use voice replies.' };
  }

  if (!isVirtualCareVoiceEnabled()) {
    return { ok: false, error: 'Voice replies are not available right now.' };
  }

  try {
    const { audio, mimeType } = await synthesizeChatSpeech(text);

    return {
      ok: true,
      audioBase64: Buffer.from(audio).toString('base64'),
      mimeType,
    };
  } catch (error) {
    console.error('[virtual-care-voice] synthesize', error);

    return {
      ok: false,
      error: error instanceof Error ? error.message : 'Could not generate speech.',
    };
  }
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
