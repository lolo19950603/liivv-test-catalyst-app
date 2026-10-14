'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { getLocale } from 'next-intl/server';

import { type OnboardingCustomer } from '~/lib/account/get-session-customer';
import { runCustomerAction } from '~/lib/action-gateway/session';
import { consumeIpRateLimit } from '~/lib/api-gateway/ip-rate-limit';
import { confirmAddressCode, sendAddressCode } from '~/lib/pharmacy-mail/code-check';
import {
  pharmacyEmailConsentApproved,
  pharmacyMessageModeOffered,
} from '~/lib/pharmacy-mail/config';
import { isPharmacyContactChoice, wantsEmail } from '~/lib/pharmacy-mail/consent';
import { cleanOutboundText } from '~/lib/pharmacy-mail/sanitize';
import { customerRegion } from '~/lib/pharmacy-mail/thread-views';
import { isSupabaseConfigured } from '~/lib/supabase/client';
import { addConsent, readContactState } from '~/lib/supabase/pharmacy-email-consent';
import {
  countPortalRepliesSince,
  getThreadById,
  insertMessageOnce,
  insertPharmacyAudit,
  isMessagesMigrationMissing,
  listThreadsForProfile,
  markCustomerRead,
  noteThreadActivity,
} from '~/lib/supabase/pharmacy-threads';
import { ensureCustomerProfile } from '~/lib/supabase/profile';

import { getCustomerProvince } from '../page-data';

/*
 * =============================================================================
 * PHARMACY PAGE: MESSAGES FROM YOUR PHARMACIST (owner decision Q10, 2026-10-14)
 * =============================================================================
 * The customer's own actions, behind runCustomerAction:
 *   pharmacy_contact_set          how their Liivv pharmacist may reach them
 *                                 (a new consent row; the account email only;
 *                                 the email modes only once the owner has
 *                                 approved the consent wording, D8);
 *   pharmacy_email_code_send      a 6-digit code to the account email (Graph
 *                                 only, and only when they chose email for
 *                                 that address; 3 an hour, 6 a day, and a
 *                                 per-IP limit);
 *   pharmacy_email_code_confirm   the code (5 attempts, 30 minutes);
 *   pharmacy_thread_reply         a reply on one of THEIR threads (10 an hour,
 *                                 30 a day, double submits blocked); it never
 *                                 emails the customer and reopens a closed thread;
 *   pharmacy_messages_mark_read   their pharmacist's messages are read.
 * =============================================================================
 */

export type PharmacyMessageActionState = { ok?: boolean; error?: string; notice?: string } | null;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REPLIES_PER_HOUR = 10;
const REPLIES_PER_DAY = 30;
const CODE_REQUESTS_PER_IP_PER_HOUR = 10;

interface Profile {
  id: string;
  email: string | null;
}

type Handler = (formData: FormData, profile: Profile) => Promise<PharmacyMessageActionState>;

function formText(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === 'string' ? value.trim() : '';
}

async function profileOf(customer: OnboardingCustomer): Promise<Profile | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const ensured = await ensureCustomerProfile(customer);

  return ensured.status === 'ok'
    ? { id: ensured.profile.id, email: ensured.profile.email?.trim().toLowerCase() || null }
    : null;
}

const setContact: Handler = async (formData, profile) => {
  const mode = formText(formData, 'mode');

  if (
    !isPharmacyContactChoice(mode) ||
    (mode === 'message_by_email' && !pharmacyMessageModeOffered())
  ) {
    return { ok: false, error: 'Choose how your Liivv pharmacist can reach you.' };
  }

  // No email choice can be recorded before the owner approves its wording (D8).
  if (mode !== 'no_email' && !pharmacyEmailConsentApproved()) {
    return {
      ok: false,
      error: 'Email from your pharmacist isn’t available yet. They’ll phone you.',
    };
  }

  if (mode !== 'no_email' && formText(formData, 'agree') !== 'yes') {
    return { ok: false, error: 'Tick the box to agree to email at your account address.' };
  }

  if (mode !== 'no_email' && !profile.email) {
    return {
      ok: false,
      error: 'Your account has no email address. Add one in Account settings first.',
    };
  }

  await addConsent({
    profileId: profile.id,
    mode,
    accountEmail: profile.email,
    locale: await getLocale(),
    source: 'pharmacy_page',
  });
  await insertPharmacyAudit({
    profileId: profile.id,
    actor: 'customer',
    action: 'consent',
    detail: { mode, source: 'pharmacy_page' },
  });

  return { ok: true, notice: 'Saved.' };
};

/* A per-IP limit on code requests, across every account. */
async function codeRequestAllowed(): Promise<boolean> {
  const request = new Request('https://liivv.local/account/pharmacy', { headers: await headers() });
  const limit = await consumeIpRateLimit(
    request,
    'pharmacy-email-code',
    CODE_REQUESTS_PER_IP_PER_HOUR,
    3600,
  );

  return limit.allowed;
}

const sendCode: Handler = async (_formData, profile) => {
  if (!profile.email) {
    return { ok: false, error: 'Your account has no email address.' };
  }

  // A code goes only to an address the customer chose email for, so the
  // pharmacy mailbox can't be made to mail strangers.
  const contact = await readContactState(profile.id, profile.email);

  if (!pharmacyEmailConsentApproved() || !wantsEmail(contact) || contact.email !== profile.email) {
    return {
      ok: false,
      error: 'Choose to get email from your pharmacist first, then ask for a code.',
    };
  }

  if (!(await codeRequestAllowed())) {
    return { ok: false, error: 'Too many codes were asked for. Please try again later.' };
  }

  const threads = await listThreadsForProfile(profile.id).catch(() => []);
  const result = await sendAddressCode({
    profileId: profile.id,
    accountEmail: profile.email,
    region: customerRegion(threads, await getCustomerProvince()),
  });

  return result.ok
    ? { ok: true, notice: 'We emailed you a code. It works for 30 minutes.' }
    : result;
};

const confirmCode: Handler = async (formData, profile) => {
  if (!profile.email) {
    return { ok: false, error: 'Your account has no email address.' };
  }

  const result = await confirmAddressCode({
    profileId: profile.id,
    accountEmail: profile.email,
    code: formText(formData, 'code'),
  });

  if (result.ok) {
    await insertPharmacyAudit({
      profileId: profile.id,
      actor: 'customer',
      action: 'verify',
      detail: { method: 'code' },
    });
  }

  return result.ok ? { ok: true, notice: 'Your email address is confirmed.' } : result;
};

const reply: Handler = async (formData, profile) => {
  const threadId = formText(formData, 'threadId');
  const clientRequestId = formText(formData, 'clientRequestId');
  const text = cleanOutboundText(formText(formData, 'text'));

  if (!text) {
    return { ok: false, error: 'Write a reply of up to 2,000 characters.' };
  }

  const thread =
    UUID_RE.test(threadId) && UUID_RE.test(clientRequestId) ? await getThreadById(threadId) : null;

  // Only the customer's own thread: anything else reads as not found.
  if (!thread || thread.profile_id !== profile.id) {
    return { ok: false, error: 'This conversation could not be found.' };
  }

  const threadIds = (await listThreadsForProfile(profile.id)).map((row) => row.id);
  const now = Date.now();
  const [lastHour, lastDay] = await Promise.all([
    countPortalRepliesSince(threadIds, new Date(now - 3_600_000).toISOString()),
    countPortalRepliesSince(threadIds, new Date(now - 86_400_000).toISOString()),
  ]);

  if (lastHour >= REPLIES_PER_HOUR || lastDay >= REPLIES_PER_DAY) {
    return { ok: false, error: 'You’ve sent a lot of replies. Please call us if it’s urgent.' };
  }

  const { created } = await insertMessageOnce({
    thread_id: thread.id,
    direction: 'from_customer',
    source: 'portal',
    status: 'received',
    sender_label: 'You',
    visible_to_customer: true,
    body_text: text,
    client_request_id: clientRequestId,
    received_at: new Date().toISOString(),
  });

  if (created) {
    await noteThreadActivity(thread, 'pharmacist');
    await insertPharmacyAudit({
      threadId: thread.id,
      profileId: profile.id,
      actor: 'customer',
      action: 'post',
    });
  }

  return { ok: true, notice: 'Sent to your Liivv pharmacist.' };
};

const markRead: Handler = async (_formData, profile) => {
  const threadIds = (await listThreadsForProfile(profile.id)).map((row) => row.id);

  await markCustomerRead(threadIds);

  return { ok: true };
};

const HANDLERS: Record<string, Handler> = {
  pharmacy_contact_set: setContact,
  pharmacy_email_code_send: sendCode,
  pharmacy_email_code_confirm: confirmCode,
  pharmacy_thread_reply: reply,
  pharmacy_messages_mark_read: markRead,
};

export async function pharmacyMessageAction(
  _prevState: PharmacyMessageActionState,
  formData: FormData,
): Promise<PharmacyMessageActionState> {
  return runCustomerAction(
    { redirectTo: '/login?redirectTo=/account/pharmacy' },
    async (customer) => {
      const handler = HANDLERS[formText(formData, 'intent')];

      if (!handler) {
        return { ok: false, error: 'Invalid request.' };
      }

      const profile = await profileOf(customer);

      if (!profile) {
        return { ok: false, error: 'Pharmacy storage is not configured.' };
      }

      try {
        const result = await handler(formData, profile);

        if (result?.ok && formText(formData, 'intent') !== 'pharmacy_messages_mark_read') {
          revalidatePath('/account/pharmacy');
        }

        return result;
      } catch (error) {
        return {
          ok: false,
          error: isMessagesMigrationMissing(error)
            ? 'Messages aren’t available yet.'
            : 'That didn’t work. Please try again later.',
        };
      }
    },
  );
}
