import { NextResponse } from 'next/server';

import { getOnboardingCustomer } from '~/lib/account/get-session-customer';
import { getLiveChatLastSeen } from '~/lib/chat/cookie';
import {
  countUnreadStaffMessages,
  getConversationByProfileId,
} from '~/lib/supabase/chat-messages';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { ensureCustomerProfile } from '~/lib/supabase/profile';

/**
 * Poll unread staff messages without a Server Action.
 * Server Actions re-fetch the current RSC page; an API route does not.
 */
export async function GET() {
  const customer = await getOnboardingCustomer();

  if (!customer || !isSupabaseConfigured()) {
    return NextResponse.json({ count: 0 });
  }

  const ensured = await ensureCustomerProfile(customer);

  if (ensured.status !== 'ok') {
    return NextResponse.json({ count: 0 });
  }

  const conversation = await getConversationByProfileId(ensured.profile.id);

  if (!conversation.ok || !conversation.conversationId) {
    return NextResponse.json({ count: 0 });
  }

  const lastSeen = await getLiveChatLastSeen();
  const unread = await countUnreadStaffMessages(conversation.conversationId, lastSeen);

  if (!unread.ok) {
    return NextResponse.json({ count: 0 });
  }

  return NextResponse.json({ count: unread.count });
}
