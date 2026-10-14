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
import type { MailStatusView } from '~/lib/pharmacy-mail/view-types';

/*
 * =============================================================================
 * PHARMACY ADMIN: MAIL STATUS (owner decision Q10, 2026-10-14)
 * =============================================================================
 * One row per province pharmacy: Graph or the Outlook-draft fallback (and
 * why), the mailbox, the last sync and its last error code, the subscription
 * expiry when webhooks are on. Test connection, Sync now and Reconnect. Shows
 * only whether each setting is present and which auth mode is in use: never a
 * secret.
 * =============================================================================
 */

const secondaryButton =
  'rounded-md border border-[#c9dcc4] bg-[#f4faf1] px-3 py-1.5 text-base text-[#234028] hover:bg-[#e3f0dc] disabled:opacity-60';

function formatWhen(iso: string | null): string {
  if (!iso) {
    return '—';
  }

  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-CA', {
        timeZone: 'America/Toronto',
        dateStyle: 'short',
        timeStyle: 'short',
      }).format(date);
}

function yes(value: boolean): string {
  return value ? 'set' : 'missing';
}

function testText(result: { ok: boolean; status: number | null; code: string | null }): string {
  if (result.ok) {
    return 'OK';
  }

  if (result.status === 403) {
    return '403: outside the app’s mailbox scope, or the 2-hour permission wait';
  }

  if (result.status === 404) {
    return '404: wrong mailbox address or id';
  }

  return `Error ${result.code ?? ''}`.trim();
}

function MailStatusBody({ status }: { status: MailStatusView }) {
  const router = useRouter();
  const [reviewerName, setReviewerName] = useState('');
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

  return (
    <div className="space-y-3 text-sm text-[#2c2a26]">
      <p>
        Email from the website: <strong>{status.enabled ? 'on' : 'off'}</strong> ·{' '}
        {status.deployment} · Microsoft sign-in: {status.authMode ?? 'not set'} · tenant{' '}
        {yes(status.tenantSet)} · app {yes(status.clientSet)} · credential{' '}
        {yes(status.credentialSet)} · app URL {status.appUrlOk ? 'ok' : 'not set'} · cron secret{' '}
        {yes(status.cronSecretSet)} · webhooks {status.webhooks ? 'on' : 'off'} · plus-address
        Reply-To {status.plusReplyTo ? 'on' : 'off'}
      </p>
      <p>
        Email consent wording approved (D8):{' '}
        <strong>{status.consentApproved ? 'yes' : 'no'}</strong>
        {status.consentApproved
          ? null
          : '. Until it is, customers are offered no email and are phoned instead.'}
      </p>
      {status.syncStateError ? <p className="text-red-700">{status.syncStateError}</p> : null}
      <table className="w-full border-collapse text-left">
        <thead className="text-xs uppercase tracking-wide text-[#6b6560]">
          <tr>
            <th className="py-1 pr-2">Pharmacy</th>
            <th className="py-1 pr-2">Route</th>
            <th className="py-1 pr-2">Mailbox</th>
            <th className="py-1 pr-2">Last sync</th>
            <th className="py-1 pr-2">Last error</th>
            {status.webhooks ? <th className="py-1">Subscription until</th> : null}
          </tr>
        </thead>
        <tbody>
          {status.regions.map((row) => (
            <tr className="border-t border-[#efe9e0] align-top" key={row.region}>
              <td className="py-1 pr-2">{row.label}</td>
              <td className="py-1 pr-2">
                {row.routeKind === 'graph' ? 'Microsoft 365' : `Outlook draft: ${row.reasonText}`}
              </td>
              <td className="break-all py-1 pr-2">
                {row.mailboxAddress ?? '—'}
                {row.mailboxAddress && !row.objectIdSet ? ' (no object id)' : ''}
              </td>
              <td className="py-1 pr-2">{formatWhen(row.lastSuccessAt)}</td>
              <td className="py-1 pr-2">{row.lastErrorCode ?? '—'}</td>
              {status.webhooks ? (
                <td className="py-1">{formatWhen(row.subscriptionExpiresAt)}</td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      <form action={submit} className="flex flex-wrap items-end gap-2">
        <label className="block text-sm">
          <span className="font-medium">Your name and licence number (for Reconnect)</span>
          <input
            className="mt-1 block rounded-md border border-[#c4b8a8] px-2.5 py-1.5"
            maxLength={120}
            onChange={(event) => setReviewerName(event.target.value)}
            value={reviewerName}
          />
        </label>
        <button
          className={secondaryButton}
          disabled={isPending}
          name="intent"
          type="submit"
          value="pharmacy_mail_test"
        >
          Test connection
        </button>
        <button
          className={secondaryButton}
          disabled={isPending}
          name="intent"
          type="submit"
          value="pharmacy_mail_sync_now"
        >
          Sync now
        </button>
        <button
          className={secondaryButton}
          disabled={isPending}
          name="intent"
          type="submit"
          value="pharmacy_mail_reconnect"
        >
          Reconnect
        </button>
      </form>
      {isPending ? <p className="text-[#6b6560]">Working…</p> : null}
      {state?.test ? (
        <ul className="space-y-1">
          {state.test.map((result) => (
            <li key={result.region}>
              {result.region}: {testText(result)}
            </li>
          ))}
        </ul>
      ) : null}
      {state?.notice ? <p className="text-[#2f6b2f]">{state.notice}</p> : null}
      {state?.error ? <p className="text-red-700">{state.error}</p> : null}
    </div>
  );
}

/* The header button and its panel. */
export function PharmacyMailStatus({ status }: { status: MailStatusView | null }) {
  const [open, setOpen] = useState(false);

  if (!status) {
    return null;
  }

  return (
    <div className="relative">
      <button className={secondaryButton} onClick={() => setOpen(!open)} type="button">
        Mail status
      </button>
      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[min(46rem,90vw)] rounded-lg border border-[#c9dcc4] bg-white p-4 shadow-lg">
          <MailStatusBody status={status} />
        </div>
      ) : null}
    </div>
  );
}
