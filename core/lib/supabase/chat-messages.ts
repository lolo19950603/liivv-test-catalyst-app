import 'server-only';

import {
  STAFF_JOINED_CHAT_MESSAGE,
  STAFF_LEFT_CHAT_FOLLOWUP_MESSAGE,
  STAFF_LEFT_CHAT_MESSAGE,
  isCareTeamChatActive,
} from '~/lib/chat/session';
import { getSupabaseClient } from '~/lib/supabase/client';

export type ChatMessageSenderType = 'customer' | 'staff' | 'bot' | 'system';

export type ChatMessageRow = {
  id: string;
  conversation_id: string;
  sender_type: ChatMessageSenderType;
  body: string;
  created_at: string;
};

const MAX_BODY = 8000;

export {
  STAFF_JOINED_CHAT_MESSAGE,
  STAFF_LEFT_CHAT_FOLLOWUP_MESSAGE,
  STAFF_LEFT_CHAT_MESSAGE,
  isCareTeamChatActive,
  isStaffJoinedToChat,
};

export async function getConversationByProfileId(profileId: string): Promise<
  | {
      ok: true;
      conversationId: string | null;
      customerLeftAt: string | null;
      staffJoinedAt: string | null;
      staffClosedAt: string | null;
      escalatedToPharmacistAt: string | null;
    }
  | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('id, customer_left_at, staff_joined_at, staff_closed_at, escalated_to_pharmacist_at')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data?.id) {
    return {
      ok: true,
      conversationId: null,
      customerLeftAt: null,
      staffJoinedAt: null,
      staffClosedAt: null,
      escalatedToPharmacistAt: null,
    };
  }

  return {
    ok: true,
    conversationId: data.id,
    customerLeftAt: (data.customer_left_at as string | null) ?? null,
    staffJoinedAt: (data.staff_joined_at as string | null) ?? null,
    staffClosedAt: (data.staff_closed_at as string | null) ?? null,
    escalatedToPharmacistAt: (data.escalated_to_pharmacist_at as string | null) ?? null,
  };
}

export async function getConversationEscalationStatus(conversationId: string): Promise<
  | { ok: true; escalatedToPharmacistAt: string | null }
  | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('escalated_to_pharmacist_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  return {
    ok: true,
    escalatedToPharmacistAt: (data?.escalated_to_pharmacist_at as string | null) ?? null,
  };
}

export async function getOrCreateConversation(profileId: string): Promise<
  | {
      ok: true;
      conversationId: string;
      customerLeftAt: string | null;
      staffJoinedAt: string | null;
      staffClosedAt: string | null;
      escalatedToPharmacistAt: string | null;
    }
  | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const existing = await getConversationByProfileId(profileId);

  if (!existing.ok) {
    return existing;
  }

  if (existing.conversationId) {
    return {
      ok: true,
      conversationId: existing.conversationId,
      customerLeftAt: existing.customerLeftAt,
      staffJoinedAt: existing.staffJoinedAt,
      staffClosedAt: existing.staffClosedAt,
      escalatedToPharmacistAt: existing.escalatedToPharmacistAt,
    };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({ profile_id: profileId, created_at: now, updated_at: now })
    .select('id')
    .single();

  if (error || !data?.id) {
    return { ok: false, message: error?.message ?? 'Could not create conversation.' };
  }

  return {
    ok: true,
    conversationId: data.id,
    customerLeftAt: null,
    staffJoinedAt: null,
    staffClosedAt: null,
    escalatedToPharmacistAt: null,
  };
}

export async function appendSystemMessage(
  conversationId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = body.trim();

  if (!trimmed) {
    return { ok: false, message: 'System message cannot be empty.' };
  }

  if (trimmed.length > MAX_BODY) {
    return { ok: false, message: `Message must be at most ${MAX_BODY} characters.` };
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    sender_type: 'system',
    body: trimmed,
    created_at: now,
  });

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  const { error: updateError } = await supabase
    .from('chat_conversations')
    .update({ updated_at: now })
    .eq('id', conversationId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  return { ok: true };
}

export async function appendBotMessage(
  conversationId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = body.trim();

  if (!trimmed) {
    return { ok: false, message: 'Bot message cannot be empty.' };
  }

  if (trimmed.length > MAX_BODY) {
    return { ok: false, message: `Message must be at most ${MAX_BODY} characters.` };
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    sender_type: 'bot',
    body: trimmed,
    created_at: now,
  });

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  const { error: updateError } = await supabase
    .from('chat_conversations')
    .update({ updated_at: now })
    .eq('id', conversationId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  return { ok: true };
}

export async function escalateConversationToPharmacist(
  conversationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('chat_conversations')
    .update({ escalated_to_pharmacist_at: now, updated_at: now })
    .eq('id', conversationId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

/** Default page size for customer chat UI (newest first, then scroll up for older). */
export const CHAT_MESSAGE_PAGE_SIZE = 40;

/** How many recent turns the bot should see (keeps prompt size bounded). */
export const BOT_MESSAGE_HISTORY_LIMIT = 40;

export async function listMessagesForConversation(
  conversationId: string,
): Promise<{ ok: true; messages: ChatMessageRow[] } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, conversation_id, sender_type, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, messages: (data ?? []) as ChatMessageRow[] };
}

/**
 * Newest page of messages, returned oldest→newest within the page.
 * Uses limit+1 to know whether older messages exist.
 */
export async function listRecentMessagesForConversation(
  conversationId: string,
  limit: number = CHAT_MESSAGE_PAGE_SIZE,
): Promise<
  | { ok: true; messages: ChatMessageRow[]; hasMoreOlder: boolean }
  | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, conversation_id, sender_type, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (error) {
    return { ok: false, message: error.message };
  }

  const rows = (data ?? []) as ChatMessageRow[];
  const hasMoreOlder = rows.length > limit;
  const page = hasMoreOlder ? rows.slice(0, limit) : rows;

  return { ok: true, messages: page.reverse(), hasMoreOlder };
}

/** Older messages before a cursor (created_at of the currently oldest loaded message). */
export async function listOlderMessagesForConversation(
  conversationId: string,
  beforeCreatedAt: string,
  limit: number = CHAT_MESSAGE_PAGE_SIZE,
): Promise<
  | { ok: true; messages: ChatMessageRow[]; hasMoreOlder: boolean }
  | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, conversation_id, sender_type, body, created_at')
    .eq('conversation_id', conversationId)
    .lt('created_at', beforeCreatedAt)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (error) {
    return { ok: false, message: error.message };
  }

  const rows = (data ?? []) as ChatMessageRow[];
  const hasMoreOlder = rows.length > limit;
  const page = hasMoreOlder ? rows.slice(0, limit) : rows;

  return { ok: true, messages: page.reverse(), hasMoreOlder };
}

export async function getLatestMessageForConversation(
  conversationId: string,
): Promise<{ ok: true; message: ChatMessageRow | null } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, conversation_id, sender_type, body, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: (data as ChatMessageRow | null) ?? null };
}

export async function countUnreadStaffMessages(
  conversationId: string,
  lastSeen: Date | null,
): Promise<{ ok: true; count: number } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const since = lastSeen
    ? lastSeen.toISOString()
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const { count, error } = await supabase
    .from('chat_messages')
    .select('id', { count: 'exact', head: true })
    .eq('conversation_id', conversationId)
    .eq('sender_type', 'staff')
    .gt('created_at', since);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, count: count ?? 0 };
}

export async function appendCustomerMessage(
  conversationId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = body.trim();

  if (!trimmed) {
    return { ok: false, message: 'Message cannot be empty.' };
  }

  if (trimmed.length > MAX_BODY) {
    return { ok: false, message: `Message must be at most ${MAX_BODY} characters.` };
  }

  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  const { error: insertError } = await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    sender_type: 'customer',
    body: trimmed,
    created_at: now,
  });

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  const { error: updateError } = await supabase
    .from('chat_conversations')
    .update({ updated_at: now, customer_left_at: null })
    .eq('id', conversationId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  return { ok: true };
}

export async function markCustomerLeftChat(
  conversationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('chat_conversations')
    .update({ customer_left_at: now, updated_at: now })
    .eq('id', conversationId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export type AdminConversationSummary = {
  conversationId: string;
  profileId: string;
  bigcommerceCustomerId: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  updatedAt: string;
  customerLeftAt: string | null;
  staffJoinedAt: string | null;
  staffClosedAt: string | null;
  escalatedToPharmacistAt: string | null;
};

export async function listConversationsForAdmin(): Promise<
  { ok: true; rows: AdminConversationSummary[] } | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const { data: convs, error: convErr } = await supabase
    .from('chat_conversations')
    .select(
      'id, profile_id, updated_at, customer_left_at, staff_joined_at, staff_closed_at, escalated_to_pharmacist_at',
    )
    .order('updated_at', { ascending: false });

  if (convErr) {
    return { ok: false, message: convErr.message };
  }

  const list = convs ?? [];

  if (list.length === 0) {
    return { ok: true, rows: [] };
  }

  const profileIds = [...new Set(list.map((c) => c.profile_id))];
  const { data: profiles, error: profErr } = await supabase
    .from('profiles')
    .select('id, bigcommerce_customer_id, email, first_name, last_name')
    .in('id', profileIds);

  if (profErr) {
    return { ok: false, message: profErr.message };
  }

  const byProfile = new Map(
    (profiles ?? []).map((p) => [
      p.id,
      p as {
        id: string;
        bigcommerce_customer_id: string;
        email: string | null;
        first_name: string | null;
        last_name: string | null;
      },
    ]),
  );

  const rows: AdminConversationSummary[] = list.map((c) => {
    const p = byProfile.get(c.profile_id);

    return {
      conversationId: c.id,
      profileId: c.profile_id,
      bigcommerceCustomerId: p?.bigcommerce_customer_id ?? '',
      email: p?.email ?? null,
      firstName: p?.first_name ?? null,
      lastName: p?.last_name ?? null,
      updatedAt: c.updated_at,
      customerLeftAt: (c as { customer_left_at?: string | null }).customer_left_at ?? null,
      staffJoinedAt: (c as { staff_joined_at?: string | null }).staff_joined_at ?? null,
      staffClosedAt: (c as { staff_closed_at?: string | null }).staff_closed_at ?? null,
      escalatedToPharmacistAt:
        (c as { escalated_to_pharmacist_at?: string | null }).escalated_to_pharmacist_at ?? null,
    };
  });

  return { ok: true, rows };
}

export async function appendStaffMessage(
  conversationId: string,
  body: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const trimmed = body.trim();

  if (!trimmed) {
    return { ok: false, message: 'Message cannot be empty.' };
  }

  if (trimmed.length > MAX_BODY) {
    return { ok: false, message: `Message must be at most ${MAX_BODY} characters.` };
  }

  const supabase = getSupabaseClient();
  const { data: convRow, error: convReadErr } = await supabase
    .from('chat_conversations')
    .select('staff_joined_at, staff_closed_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convReadErr) {
    return { ok: false, message: convReadErr.message };
  }

  const joinedAt = (convRow as { staff_joined_at?: string | null } | null)?.staff_joined_at ?? null;
  const closedAt = (convRow as { staff_closed_at?: string | null } | null)?.staff_closed_at ?? null;

  if (!joinedAt || closedAt) {
    return {
      ok: false,
      message: 'Join the chat before replying.',
    };
  }

  const now = new Date().toISOString();
  const { error: insertError } = await supabase.from('chat_messages').insert({
    conversation_id: conversationId,
    sender_type: 'staff',
    body: trimmed,
    created_at: now,
  });

  if (insertError) {
    return { ok: false, message: insertError.message };
  }

  const { error: updateError } = await supabase
    .from('chat_conversations')
    .update({ updated_at: now })
    .eq('id', conversationId);

  if (updateError) {
    return { ok: false, message: updateError.message };
  }

  return { ok: true };
}

export async function markStaffClosedConversation(
  conversationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { data: convRow, error: convReadErr } = await supabase
    .from('chat_conversations')
    .select('staff_joined_at, staff_closed_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convReadErr) {
    return { ok: false, message: convReadErr.message };
  }

  const joinedAt = (convRow as { staff_joined_at?: string | null } | null)?.staff_joined_at ?? null;
  const closedAt = (convRow as { staff_closed_at?: string | null } | null)?.staff_closed_at ?? null;

  if (!joinedAt || closedAt) {
    return { ok: true };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('chat_conversations')
    .update({ staff_closed_at: now, updated_at: now })
    .eq('id', conversationId);

  if (error) {
    return { ok: false, message: error.message };
  }

  const left = await appendSystemMessage(conversationId, STAFF_LEFT_CHAT_MESSAGE);

  if (!left.ok) {
    return left;
  }

  return appendSystemMessage(conversationId, STAFF_LEFT_CHAT_FOLLOWUP_MESSAGE);
}

export async function joinStaffConversation(
  conversationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const { data: convRow, error: convReadErr } = await supabase
    .from('chat_conversations')
    .select('staff_joined_at, staff_closed_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convReadErr) {
    return { ok: false, message: convReadErr.message };
  }

  const joinedAt = (convRow as { staff_joined_at?: string | null } | null)?.staff_joined_at ?? null;
  const closedAt = (convRow as { staff_closed_at?: string | null } | null)?.staff_closed_at ?? null;

  if (joinedAt && !closedAt) {
    return { ok: true };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from('chat_conversations')
    .update({ staff_joined_at: now, staff_closed_at: null, updated_at: now })
    .eq('id', conversationId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return appendSystemMessage(conversationId, STAFF_JOINED_CHAT_MESSAGE);
}

export async function reopenStaffConversation(
  conversationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  return joinStaffConversation(conversationId);
}
