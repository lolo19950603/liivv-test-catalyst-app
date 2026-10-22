import { NextResponse } from 'next/server';

import { getLiveChatSessionAction } from '~/app/[locale]/(default)/account/(portal)/virtual-care/_actions/virtual-care-actions';

/**
 * Load the open chat without a Server Action.
 * Server Actions re-fetch the current page. While the chat is open on sign-in,
 * that refresh sits in front of the login redirect, so the form stays on
 * "Opening the door…" until the panel is closed.
 */
export async function GET() {
  try {
    const session = await getLiveChatSessionAction();

    return NextResponse.json(session);
  } catch (error) {
    console.error('[supabase] live-chat session unavailable', error);

    return NextResponse.json({ isLoggedIn: false, data: null });
  }
}
