import 'server-only';

/**
 * Chat / virtual-care logging policy (architecture pack G10).
 *
 * - Never write care-chat message bodies, appointment free-text, or voice
 *   transcript text to stdout / Vercel logs.
 * - Operational errors may log a short tag + a safe message (no PHI payload).
 * - Message bodies live in Canadian Supabase only; staff read them in the UI.
 */
export const CHAT_BODY_LOGGING_POLICY =
  'Do not log care-chat message bodies, appointment free-text, or voice transcripts.';

function safeErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message.slice(0, 200);
  }

  if (typeof error === 'string' && error) {
    return error.slice(0, 200);
  }

  return 'unknown error';
}

/** Log an operational failure without chat / appointment / transcript content. */
export function logChatOperationalError(tag: string, error?: unknown): void {
  if (error === undefined) {
    console.error(tag);
    return;
  }

  console.error(tag, safeErrorMessage(error));
}
