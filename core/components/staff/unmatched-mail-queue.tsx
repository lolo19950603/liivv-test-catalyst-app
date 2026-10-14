'use client';

import { useActionState, useEffect, useState } from 'react';
// The admin lives outside the [locale] layout, so it uses Next's router
// directly (as staff-portal-client.tsx does), not the next-intl one.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useRouter } from 'next/navigation';

import {
  type MailActionState,
  pharmacyMailStaffAction,
} from '~/app/pharmacy-admin/_actions/pharmacy-mail-actions';
import type { FlaggedOutlookView, UnmatchedView } from '~/lib/pharmacy-mail/view-types';

/*
 * =============================================================================
 * PHARMACY ADMIN: "EMAIL TO MATCH" AND "SENT FROM OUTLOOK: CHECK"
 * =============================================================================
 * Owner decision Q10, 2026-10-14. Mail in a province mailbox that looks like a
 * reply to a pharmacist but could not be matched safely (another sender, no
 * thread, a failed spoofing check, an unmatched bounce, more than one possible
 * customer) waits here: a pharmacist attaches it to a thread or dismisses it
 * with a reason. An attached email is STAFF-ONLY unless "Show on the
 * customer's Pharmacy page" is ticked, which the server allows only for the
 * customer's own email (their checked address, the suggested customer, and a
 * passed spoofing check). Attaching to another customer's thread needs
 * "I checked this email belongs to this thread".
 * Below, a pharmacist's replies sent straight from Outlook that broke the
 * customer's choice. Those that didn't go to the customer's checked address
 * alone are staff-only until the privacy officer chooses "Show to customer"
 * (only when the customer was a recipient) or "Keep staff-only".
 * Text is plain text only.
 * =============================================================================
 */

const inputClass =
  'w-full rounded-md border border-[#c4b8a8] bg-white px-2.5 py-2 text-base text-[#2c2a26]';
const secondaryButton =
  'rounded-md border border-[#c4b8a8] bg-white px-3 py-1.5 text-base text-[#3f3d39] hover:bg-[#f4f3f1] disabled:opacity-60';

const FLAG_LABEL: Record<string, string> = {
  outlook_unverified_recipient: 'Not the checked address',
  outlook_extra_recipients: 'Extra recipients',
  outlook_mode_conflict: 'Against the customer’s choice',
};

function formatWhen(iso: string | null): string {
  if (!iso) {
    return '';
  }

  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
}

function useQueueAction(reviewerName: string) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<MailActionState, FormData>(
    pharmacyMailStaffAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [router, state]);

  const submit = (formData: FormData) => {
    formData.set('reviewerName', reviewerName);
    formAction(formData);
  };

  return { state, submit, isPending };
}

function UnmatchedItem({ item, reviewerName }: { item: UnmatchedView; reviewerName: string }) {
  const { state, submit, isPending } = useQueueAction(reviewerName);

  return (
    <li className="rounded-lg border border-[#e6e2dc] bg-white px-4 py-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-medium text-[#1c1b19]">{item.subject ?? '(no subject)'}</p>
        <span className="text-sm text-[#6b6560]">{formatWhen(item.receivedAt)}</span>
      </div>
      <p className="text-sm text-[#5c564c]">
        {item.regionLabel} ·{' '}
        {item.folder === 'inbox'
          ? `From ${item.from ?? 'unknown'}`
          : `Sent to ${item.to.join(', ')}`}
      </p>
      <p className="mt-1 text-sm font-semibold text-[#7a1d18]">{item.reasonText}</p>
      {item.bodyText ? (
        <details className="mt-2 text-sm">
          <summary className="cursor-pointer text-[#375a37]">Open the text</summary>
          <p className="mt-1 whitespace-pre-wrap break-words text-[#2c2a26]">{item.bodyText}</p>
        </details>
      ) : null}
      <form action={submit} className="mt-3 flex flex-wrap items-end gap-2">
        <input name="intent" type="hidden" value="pharmacy_unmatched_attach" />
        <input name="unmatchedId" type="hidden" value={item.id} />
        <label className="block min-w-[14rem] flex-1 text-sm">
          <span className="font-medium text-[#2c2a26]">Attach to thread</span>
          {item.suggestedThreads.length > 0 ? (
            <select className={`mt-1 ${inputClass}`} name="threadId">
              <option value="">Choose, or type a reference below</option>
              {item.suggestedThreads.map((thread) => (
                <option key={thread.id} value={thread.id}>
                  {thread.label}
                </option>
              ))}
            </select>
          ) : null}
          <input className={`mt-1 ${inputClass}`} name="threadRef" placeholder="LV-XXXXXX" />
        </label>
        <button className={secondaryButton} disabled={isPending} type="submit">
          Attach
        </button>
        <div className="basis-full space-y-1 text-sm text-[#2c2a26]">
          {item.reason === 'auth_failed' ? null : (
            <label className="flex items-start gap-2">
              <input className="mt-1" name="show" type="checkbox" value="yes" />
              <span>
                Show on the customer’s Pharmacy page (only their own email, from their checked
                address). Otherwise it is attached staff-only.
              </span>
            </label>
          )}
          <label className="flex items-start gap-2">
            <input className="mt-1" name="confirm" type="checkbox" value="yes" />
            <span>
              I checked this email belongs to this thread (needed when it isn’t from the customer’s
              checked address, or the thread is another customer’s).
            </span>
          </label>
        </div>
      </form>
      <form action={submit} className="mt-2 flex flex-wrap items-end gap-2">
        <input name="intent" type="hidden" value="pharmacy_unmatched_dismiss" />
        <input name="unmatchedId" type="hidden" value={item.id} />
        <label className="block min-w-[14rem] flex-1 text-sm">
          <span className="font-medium text-[#2c2a26]">Reason for dismissing</span>
          <input className={`mt-1 ${inputClass}`} maxLength={500} name="reason" required />
        </label>
        <button className={secondaryButton} disabled={isPending} type="submit">
          Dismiss
        </button>
      </form>
      {state?.error ? <p className="mt-2 text-sm text-red-700">{state.error}</p> : null}
      {state?.notice ? <p className="mt-2 text-sm text-[#2f6b2f]">{state.notice}</p> : null}
    </li>
  );
}

function FlaggedItem({ item, reviewerName }: { item: FlaggedOutlookView; reviewerName: string }) {
  const { state, submit, isPending } = useQueueAction(reviewerName);

  return (
    <li className="rounded-lg border border-[#e6e2dc] bg-white px-4 py-3">
      <p className="text-sm text-[#5c564c]">
        {formatWhen(item.createdAt)}
        {item.toAddressMasked ? ` · to ${item.toAddressMasked}` : ''}
      </p>
      <p className="mt-1 flex flex-wrap gap-1">
        {item.flags.map((flag) => (
          <span
            className="rounded bg-[#7a1d18] px-1.5 py-0.5 text-xs font-semibold text-white"
            key={flag}
          >
            {FLAG_LABEL[flag] ?? flag}
          </span>
        ))}
      </p>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-[#375a37]">Open the text</summary>
        <p className="mt-1 whitespace-pre-wrap break-words text-[#2c2a26]">{item.bodyText}</p>
      </details>
      {item.visibleToCustomer ? null : (
        <p className="mt-1 text-sm font-semibold text-[#7a1d18]">
          Not shown to the customer: it didn’t go to their checked address alone.
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {item.visibleToCustomer ? null : (
          <form action={submit}>
            <input name="intent" type="hidden" value="pharmacy_outlook_show" />
            <input name="messageId" type="hidden" value={item.id} />
            <button className={secondaryButton} disabled={isPending} type="submit">
              Show to customer
            </button>
          </form>
        )}
        <form action={submit}>
          <input name="intent" type="hidden" value="pharmacy_outlook_reviewed" />
          <input name="messageId" type="hidden" value={item.id} />
          <button className={secondaryButton} disabled={isPending} type="submit">
            {item.visibleToCustomer ? 'Reviewed' : 'Keep staff-only'}
          </button>
        </form>
        {state?.error ? <span className="text-sm text-red-700">{state.error}</span> : null}
        {state?.notice ? <span className="text-sm text-[#2f6b2f]">{state.notice}</span> : null}
      </div>
    </li>
  );
}

export function UnmatchedMailQueue({
  unmatched,
  flagged,
  error,
}: {
  unmatched: UnmatchedView[];
  flagged: FlaggedOutlookView[];
  error: string | null;
}) {
  const [reviewerName, setReviewerName] = useState('');

  return (
    <div className="h-full overflow-auto px-5 py-4">
      {error ? <p className="mb-3 text-sm text-red-700">{error}</p> : null}
      <label className="mb-4 block max-w-md text-sm">
        <span className="font-medium text-[#2c2a26]">Your name and licence number (required)</span>
        <input
          autoComplete="name"
          className={`mt-1 ${inputClass}`}
          maxLength={120}
          onChange={(event) => setReviewerName(event.target.value)}
          value={reviewerName}
        />
      </label>
      <h2 className="text-base font-semibold text-[#1c3a24]">
        Email to match ({unmatched.length})
      </h2>
      {unmatched.length === 0 ? (
        <p className="mt-2 text-base text-[#6b6560]">Nothing to match.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {unmatched.map((item) => (
            <UnmatchedItem item={item} key={item.id} reviewerName={reviewerName} />
          ))}
        </ul>
      )}
      <h2 className="mt-6 text-base font-semibold text-[#1c3a24]">
        Sent from Outlook: check ({flagged.length})
      </h2>
      {flagged.length === 0 ? (
        <p className="mt-2 text-base text-[#6b6560]">No flagged Outlook replies.</p>
      ) : (
        <ul className="mt-2 space-y-3">
          {flagged.map((item) => (
            <FlaggedItem item={item} key={item.id} reviewerName={reviewerName} />
          ))}
        </ul>
      )}
    </div>
  );
}
