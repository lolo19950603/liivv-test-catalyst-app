import 'server-only';

import { getSupabaseClient } from '~/lib/supabase/client';

export type ChatMessageRow = {
  id: string;
  conversation_id: string;
  sender_type: 'customer' | 'staff';
  body: string;
  created_at: string;
};

const MAX_BODY = 8000;

export async function getConversationByProfileId(profileId: string): Promise<
  | {
      ok: true;
      conversationId: string | null;
      customerLeftAt: string | null;
      staffClosedAt: string | null;
    }
  | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('id, customer_left_at, staff_closed_at')
    .eq('profile_id', profileId)
    .maybeSingle();

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data?.id) {
    return { ok: true, conversationId: null, customerLeftAt: null, staffClosedAt: null };
  }

  return {
    ok: true,
    conversationId: data.id,
    customerLeftAt: (data.customer_left_at as string | null) ?? null,
    staffClosedAt: (data.staff_closed_at as string | null) ?? null,
  };
}

export async function getOrCreateConversation(profileId: string): Promise<
  | { ok: true; conversationId: string; customerLeftAt: string | null; staffClosedAt: string | null }
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
      staffClosedAt: existing.staffClosedAt,
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

  return { ok: true, conversationId: data.id, customerLeftAt: null, staffClosedAt: null };
}

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
    .update({ updated_at: now, customer_left_at: null, staff_closed_at: null })
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
  staffClosedAt: string | null;
};

export async function listConversationsForAdmin(): Promise<
  { ok: true; rows: AdminConversationSummary[] } | { ok: false; message: string }
> {
  const supabase = getSupabaseClient();
  const { data: convs, error: convErr } = await supabase
    .from('chat_conversations')
    .select('id, profile_id, updated_at, customer_left_at, staff_closed_at')
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
      staffClosedAt: (c as { staff_closed_at?: string | null }).staff_closed_at ?? null,
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
    .select('staff_closed_at')
    .eq('id', conversationId)
    .maybeSingle();

  if (convReadErr) {
    return { ok: false, message: convReadErr.message };
  }

  if ((convRow as { staff_closed_at?: string | null } | null)?.staff_closed_at) {
    return {
      ok: false,
      message:
        'This conversation is closed. Reopen it before replying, or wait for the customer to message.',
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
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('chat_conversations')
    .update({ staff_closed_at: now, updated_at: now })
    .eq('id', conversationId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function reopenStaffConversation(
  conversationId: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('chat_conversations')
    .update({ staff_closed_at: null, updated_at: now })
    .eq('id', conversationId);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
