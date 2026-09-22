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
 *
 * `signedIn` is part of the answer, not a detail: without it a guest's
 * `{ count: 0 }` is indistinguishable from a signed-in reader with nothing
 * unread, and the widget has to keep polling every three seconds forever to
 * find out. It tells the caller there is nothing here to poll for yet.
 */
export async function GET() {
  try {
    const customer = await getOnboardingCustomer();

    if (!customer) {
      return NextResponse.json({ count: 0, signedIn: false });
    }

    if (!isSupabaseConfigured()) {
      return NextResponse.json({ count: 0, signedIn: true });
    }

    const ensured = await ensureCustomerProfile(customer);

    if (ensured.status !== 'ok') {
      return NextResponse.json({ count: 0, signedIn: true });
    }

    const conversation = await getConversationByProfileId(ensured.profile.id);

    if (!conversation.ok || !conversation.conversationId) {
      return NextResponse.json({ count: 0, signedIn: true });
    }

    const lastSeen = await getLiveChatLastSeen();
    const unread = await countUnreadStaffMessages(conversation.conversationId, lastSeen);

    if (!unread.ok) {
      return NextResponse.json({ count: 0, signedIn: true });
    }

    return NextResponse.json({ count: unread.count, signedIn: true });
  } catch (error) {
    console.error('[supabase] live-chat unread-count unavailable', error);

    /* `signedIn` is left out on purpose: this path knows nothing either way,
     * and claiming `false` would tell a signed-in reader's widget to back off
     * because of a transient outage. */
    return NextResponse.json({ count: 0 });
  }
}
