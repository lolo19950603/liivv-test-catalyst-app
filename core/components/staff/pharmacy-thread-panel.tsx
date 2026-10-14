'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';
// The admin lives outside the [locale] layout, so it uses Next's router
// directly (as staff-portal-client.tsx does), not the next-intl one.
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useRouter } from 'next/navigation';

import {
  type MailActionState,
  pharmacyMailStaffAction,
} from '~/app/pharmacy-admin/_actions/pharmacy-mail-actions';
import type { StaffMessageView, ThreadPanelData } from '~/lib/pharmacy-mail/view-types';
import {
  ADMIN_TEMPLATES,
  fillAdminTemplate,
  mailtoAddressCheckHref,
  mailtoFromReminder,
  mailtoNoticeHref,
  validateSignAs,
} from '~/lib/pharmacy-mail/templates';

/*
 * =============================================================================
 * PHARMACY ADMIN: "MESSAGES WITH CUSTOMER" FOR ONE CPAP PRESCRIPTION OR MASK ORDER
 * =============================================================================
 * Owner decision Q10, 2026-10-14. The pharmacist writes here; the message goes
 * to the customer's Pharmacy page, and the customer hears about it by the
 * route the panel shows:
 *   - Graph on for the thread's province and a checked address: a notice email
 *     from the province mailbox (the full text only in full-message mode);
 *   - Graph off: "Email customer (Outlook)" opens a notice-only draft, to be
 *     sent from the province's Liivv mailbox (shown), then "I sent it"; an
 *     unchecked address gets "Send address check (Outlook)" and "Customer
 *     confirmed this address" first. No Outlook draft until that mailbox is
 *     set: a pharmacist never emails a customer from their own mailbox;
 *   - no email allowed (or the consent wording not approved yet, D8): the
 *     phone number, and "Record outcome".
 * History is plain text only (no HTML, no clickable links). Staff notes and
 * flags never reach the customer. The admin is one shared login, so every
 * action records the pharmacist's typed name and licence number.
 * =============================================================================
 */

const inputClass =
  'w-full rounded-md border border-[#c4b8a8] bg-white px-2.5 py-2 text-base text-[#2c2a26]';
const primaryButton =
  'rounded-md bg-[#375a37] px-3 py-1.5 text-base font-medium text-white disabled:opacity-60';
const secondaryButton =
  'rounded-md border border-[#c4b8a8] bg-white px-3 py-1.5 text-base text-[#3f3d39] hover:bg-[#f4f3f1] disabled:opacity-60';
const TEXT_MAX = 2000;
const SIGN_AS_KEY = 'liivv-pharmacist-sign-as';

const MODE_LABEL: Record<string, string> = {
  notice_only: 'notice only',
  message_by_email: 'the pharmacist’s message',
  no_email: 'don’t email',
  not_chosen: 'not chosen',
};

const SOURCE_LABEL: Record<string, string> = {
  admin: 'On Pharmacy page',
  portal: 'Written on Pharmacy page',
  email: 'Received by email',
  outlook: 'Sent from Outlook',
  manual: 'Recorded by hand',
  system: 'System',
};

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

function readStoredSignAs(): string {
  try {
    return window.localStorage.getItem(SIGN_AS_KEY) ?? '';
  } catch {
    return '';
  }
}

function storeSignAs(value: string): void {
  try {
    window.localStorage.setItem(SIGN_AS_KEY, value);
  } catch {
    // Private windows and blocked storage: just not remembered.
  }
}

function newRequestId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '';
}

interface Signing {
  signAs: string;
  reviewerName: string;
}

/* One action hook per panel: every form adds the panel's signing fields. */
function usePanelAction(signing: Signing) {
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
    formData.set('signAs', signing.signAs);
    formData.set('reviewerName', signing.reviewerName);
    formAction(formData);
  };

  return { state, submit, isPending };
}

function deliveryLine(panel: ThreadPanelData): string {
  const contact = panel.contact;

  if (!contact) {
    return panel.loadError ?? '';
  }

  if (contact.mode === 'no_email') {
    return `Customer chose: don’t email. Phone ${panel.phone}.`;
  }

  if (contact.mode === 'not_chosen') {
    return `Not chosen yet: phone the customer (${panel.phone}), or ask them to choose on their Pharmacy page.`;
  }

  const checked = contact.verifiedAt
    ? `, checked ${formatWhen(contact.verifiedAt)}`
    : ', not checked';
  const address = `Email: ${MODE_LABEL[contact.mode] ?? contact.mode} · ${contact.maskedEmail}${checked}`;
  const block = contact.blockedText ? ` ${contact.blockedText}` : '';
  const route = panel.route.kind === 'mailto' ? ` ${panel.route.reasonText}` : '';

  return `${address}.${block}${route}`;
}

function whatSendDoes(panel: ThreadPanelData): string {
  switch (panel.plan.kind) {
    case 'graph_notice':
      return 'Send posts this to the customer’s Pharmacy page and emails them a notice from the province mailbox.';

    case 'graph_message':
      return 'Send posts this to the Pharmacy page and emails the text to the customer (they chose this).';

    case 'mailto_notice':
      return 'Send posts this to the Pharmacy page. Then use “Email customer (Outlook)” and press “I sent it”.';

    case 'mailto_address_check':
      return 'Send posts this to the Pharmacy page. The address isn’t checked: send the address check from Outlook first.';

    default:
      return `Send posts this to the Pharmacy page only. ${noEmailReason(panel)}Phone the customer at ${panel.phone} and record the outcome.`;
  }
}

/* Why no email goes with the message, when the reason is ours rather than the customer's. */
function noEmailReason(panel: ThreadPanelData): string {
  if (panel.plan.kind !== 'none') {
    return '';
  }

  if (panel.plan.reason === 'email_not_approved') {
    return 'Email to customers waits for the consent wording to be approved. ';
  }

  return panel.plan.reason === 'mailbox_not_set'
    ? 'The province’s Liivv pharmacy mailbox isn’t set up yet, so there is no Outlook email. '
    : '';
}

function deliveryStatus(message: StaffMessageView): string {
  if (message.source === 'email' || message.source === 'portal' || message.source === 'manual') {
    return SOURCE_LABEL[message.source] ?? message.source;
  }

  const email: Record<string, string> = {
    notice: 'notice emailed',
    message: 'emailed',
    mailto: 'notice sent from Outlook',
  };
  const status: Record<string, string> = {
    failed: `Failed${message.errorCode ? ` (${message.errorCode})` : ''}`,
    bounced: 'Bounced',
    queued: 'Sending',
    confirmed: 'Delivered to Sent Items',
  };
  const parts = [
    SOURCE_LABEL[message.source] ?? message.source,
    email[message.emailDelivery],
    message.sentAt ? formatWhen(message.sentAt) : null,
    status[message.status],
  ];

  return parts.filter(Boolean).join(' · ');
}

function senderOf(message: StaffMessageView): string {
  if (message.direction === 'from_customer') {
    return 'Customer';
  }

  if (message.direction === 'staff_note') {
    return message.source === 'email' || message.source === 'outlook'
      ? 'Attached email (staff only, not shown to the customer)'
      : 'Staff note (not shown to the customer)';
  }

  if (message.direction === 'system') {
    return 'System';
  }

  return message.source === 'outlook' ? 'Sent from Outlook' : (message.senderLabel ?? 'Pharmacist');
}

/* A message to or from the customer that is kept off their Pharmacy page. */
function hiddenFromCustomer(message: StaffMessageView): boolean {
  return (
    (message.direction === 'to_customer' || message.direction === 'from_customer') &&
    !message.visibleToCustomer
  );
}

function messageTone(unread: boolean, muted: boolean): string {
  if (unread) {
    return 'border-[#f0b429] bg-[#fff8e6]';
  }

  return muted ? 'border-[#e6e2dc] bg-[#f4f3f1] text-[#5c564c]' : 'border-[#e6e2dc] bg-white';
}

function MessageItem({ message, signing }: { message: StaffMessageView; signing: Signing }) {
  const { state, submit, isPending } = usePanelAction(signing);
  const muted = message.direction === 'staff_note' || message.direction === 'system';

  return (
    <li className={`rounded-md border px-3 py-2 ${messageTone(message.unread, muted)}`}>
      <p className="text-sm font-medium text-[#3f3d39]" title={message.staffAuthor ?? undefined}>
        {senderOf(message)} · {formatWhen(message.createdAt)}
        {message.unread ? <span className="ml-2 font-semibold text-[#9a6b00]">Unread</span> : null}
        {hiddenFromCustomer(message) ? (
          <span className="ml-2 font-semibold text-[#7a1d18]">Not shown to the customer</span>
        ) : null}
      </p>
      <p className="text-xs text-[#6b6560]">
        {deliveryStatus(message)}
        {message.toAddressMasked ? ` · to ${message.toAddressMasked}` : ''}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-base text-[#2c2a26]">
        {message.bodyText}
      </p>
      {message.fullBodyText && message.fullBodyText !== message.bodyText ? (
        <details className="mt-1 text-sm">
          <summary className="cursor-pointer text-[#375a37]">Show full email</summary>
          <p className="mt-1 whitespace-pre-wrap break-words text-[#3f3d39]">
            {message.fullBodyText}
          </p>
        </details>
      ) : null}
      {message.hasAttachments ? (
        <p className="mt-1 text-sm text-[#5c564c]">Has attachments: open in Outlook.</p>
      ) : null}
      {message.flags.length > 0 ? (
        <p className="mt-1 flex flex-wrap gap-1">
          {message.flags.map((flag) => (
            <span
              className="rounded bg-[#7a1d18] px-1.5 py-0.5 text-xs font-semibold text-white"
              key={flag}
            >
              {FLAG_LABEL[flag] ?? flag}
            </span>
          ))}
        </p>
      ) : null}
      {message.status === 'failed' ? (
        <form action={submit} className="mt-2">
          <input name="intent" type="hidden" value="pharmacy_thread_retry" />
          <input name="messageId" type="hidden" value={message.id} />
          <button className={secondaryButton} disabled={isPending} type="submit">
            Retry email
          </button>
          {state?.error ? <span className="ml-2 text-sm text-red-700">{state.error}</span> : null}
        </form>
      ) : null}
    </li>
  );
}

function SigningFields({
  signing,
  onChange,
}: {
  signing: Signing;
  onChange: (next: Signing) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      <label className="block text-sm">
        <span className="font-medium text-[#2c2a26]">Sign as (shown to the customer)</span>
        <input
          className={`mt-1 ${inputClass}`}
          maxLength={40}
          minLength={2}
          onChange={(event) => {
            onChange({ ...signing, signAs: event.target.value });
            storeSignAs(event.target.value);
          }}
          placeholder="Priya S."
          value={signing.signAs}
        />
      </label>
      <label className="block text-sm">
        <span className="font-medium text-[#2c2a26]">Your name and licence number (required)</span>
        <input
          autoComplete="name"
          className={`mt-1 ${inputClass}`}
          maxLength={120}
          onChange={(event) => onChange({ ...signing, reviewerName: event.target.value })}
          value={signing.reviewerName}
        />
      </label>
    </div>
  );
}

function Composer({ panel, signing }: { panel: ThreadPanelData; signing: Signing }) {
  const { state, submit, isPending } = usePanelAction(signing);
  const [text, setText] = useState('');
  const requestId = useRef<string | null>(null);
  const templates = ADMIN_TEMPLATES[panel.topic];

  useEffect(() => {
    if (state?.ok) {
      requestId.current = null;
      setText('');
    }
  }, [state]);

  const send = (formData: FormData) => {
    requestId.current = requestId.current ?? newRequestId();
    formData.set('clientRequestId', requestId.current);
    submit(formData);
  };

  return (
    <form action={send} className="space-y-2">
      <input name="intent" type="hidden" value="pharmacy_thread_send" />
      <input name="topic" type="hidden" value={panel.topic} />
      <input name="recordId" type="hidden" value={panel.recordId} />
      <label className="block text-sm">
        <span className="font-medium text-[#2c2a26]">Template</span>
        <select
          className={`mt-1 ${inputClass}`}
          defaultValue=""
          onChange={(event) => {
            const template = templates.find((item) => item.id === event.target.value);

            if (template) {
              setText(fillAdminTemplate(template.text, { ...panel.prefill, phone: panel.phone }));
            }
          }}
        >
          <option value="">Write freely</option>
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium text-[#2c2a26]">Message to the customer</span>
        <textarea
          className={`mt-1 ${inputClass}`}
          maxLength={TEXT_MAX}
          name="text"
          onChange={(event) => setText(event.target.value)}
          required
          rows={4}
          value={text}
        />
      </label>
      <p className="text-xs text-[#6b6560]">
        {text.length} / {TEXT_MAX} · Keep it to what’s needed. Never ask for card numbers or
        passwords.
      </p>
      <button className={primaryButton} disabled={isPending || !text.trim()} type="submit">
        {isPending ? 'Sending…' : 'Send'}
      </button>
      <p className="text-sm text-[#5c564c]">{whatSendDoes(panel)}</p>
      {state?.notice ? <p className="text-sm text-[#2f6b2f]">{state.notice}</p> : null}
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
    </form>
  );
}

function MailtoButtons({ panel, signing }: { panel: ThreadPanelData; signing: Signing }) {
  const { state, submit, isPending } = usePanelAction(signing);
  const email = panel.contact?.email;
  const ref = panel.ref;
  const from = panel.route.outlookFrom;

  if (
    !email ||
    !from ||
    (panel.plan.kind !== 'mailto_notice' && panel.plan.kind !== 'mailto_address_check')
  ) {
    return null;
  }

  if (!ref) {
    return (
      <p className="text-sm text-[#5c564c]">
        Send a message (or record an outcome) first: the Outlook buttons need the thread’s
        reference.
      </p>
    );
  }

  const notice = panel.plan.kind === 'mailto_notice';
  const signAs = validateSignAs(signing.signAs);

  if (notice && !signAs.ok) {
    return <p className="text-sm text-[#5c564c]">Fill in “Sign as” to open the Outlook notice.</p>;
  }

  const href = notice
    ? mailtoNoticeHref({
        to: email,
        ref,
        region: panel.region,
        origin: panel.origin,
        locale: panel.contact?.locale,
        signAs: signAs.ok ? signAs.value : '',
      })
    : mailtoAddressCheckHref({ to: email, ref, region: panel.region });
  const hidden = (
    <>
      <input name="topic" type="hidden" value={panel.topic} />
      <input name="recordId" type="hidden" value={panel.recordId} />
      <input name="threadId" type="hidden" value={panel.threadId ?? ''} />
    </>
  );

  return (
    <div className="space-y-2 rounded-md border border-[#c9d8c9] bg-[#f4f7f0] p-3">
      <a className={`${primaryButton} inline-block`} href={href}>
        {notice ? 'Email customer (Outlook)' : 'Send address check (Outlook)'}
      </a>
      <p className="text-sm text-[#5c564c]">{mailtoFromReminder(panel.region, from)}</p>
      <div className="flex flex-wrap gap-2">
        <form action={submit}>
          <input name="intent" type="hidden" value="pharmacy_thread_mailto_sent" />
          <input name="kind" type="hidden" value={notice ? 'notice' : 'address_check'} />
          {hidden}
          <button className={secondaryButton} disabled={isPending} type="submit">
            I sent it
          </button>
        </form>
        {notice ? null : (
          <form action={submit}>
            <input name="intent" type="hidden" value="pharmacy_address_staff_confirmed" />
            {hidden}
            <button className={secondaryButton} disabled={isPending} type="submit">
              Customer confirmed this address
            </button>
          </form>
        )}
      </div>
      {state?.notice ? <p className="text-sm text-[#2f6b2f]">{state.notice}</p> : null}
      {state?.error ? <p className="text-sm text-red-700">{state.error}</p> : null}
    </div>
  );
}

function RecordOutcome({ panel, signing }: { panel: ThreadPanelData; signing: Signing }) {
  const { state, submit, isPending } = usePanelAction(signing);

  return (
    <details className="rounded-md border border-[#e6e2dc] p-3 text-sm">
      <summary className="cursor-pointer font-medium text-[#2c2a26]">
        Record outcome or phone choice
      </summary>
      <form action={submit} className="mt-2 space-y-2">
        <input name="intent" type="hidden" value="pharmacy_thread_record_outcome" />
        <input name="topic" type="hidden" value={panel.topic} />
        <input name="recordId" type="hidden" value={panel.recordId} />
        <select className={inputClass} name="outcome" required>
          <option value="notice_sent_outlook">Notice sent from Outlook</option>
          <option value="phoned_spoke">Phoned and spoke with the customer</option>
          <option value="phoned_voicemail">Phoned and left a voicemail with no details</option>
          <option value="could_not_reach">Couldn’t reach the customer</option>
        </select>
        <textarea
          className={inputClass}
          maxLength={500}
          name="note"
          placeholder="Note (staff only)"
          rows={2}
        />
        <button className={secondaryButton} disabled={isPending} type="submit">
          Record outcome
        </button>
      </form>
      <form action={submit} className="mt-3 space-y-2 border-t border-[#efe9e0] pt-3">
        <input name="intent" type="hidden" value="pharmacy_contact_staff_phone" />
        <input name="topic" type="hidden" value={panel.topic} />
        <input name="recordId" type="hidden" value={panel.recordId} />
        <input name="threadId" type="hidden" value={panel.threadId ?? ''} />
        <label className="block">
          <span className="font-medium text-[#2c2a26]">The customer told me on the phone:</span>
          <select className={`mt-1 ${inputClass}`} name="mode" required>
            {panel.emailApproved ? (
              <option value="notice_only">Email a notice only (to their account email)</option>
            ) : null}
            {panel.emailApproved && panel.messageModeOn ? (
              <option value="message_by_email">Email the pharmacist’s message</option>
            ) : null}
            <option value="no_email">Don’t email me</option>
          </select>
        </label>
        <button className={secondaryButton} disabled={isPending} type="submit">
          Record the customer’s choice
        </button>
      </form>
      {state?.notice ? <p className="mt-2 text-[#2f6b2f]">{state.notice}</p> : null}
      {state?.error ? <p className="mt-2 text-red-700">{state.error}</p> : null}
    </details>
  );
}

function ThreadStatusButton({ panel, signing }: { panel: ThreadPanelData; signing: Signing }) {
  const { state, submit, isPending } = usePanelAction(signing);

  if (!panel.threadId) {
    return null;
  }

  return (
    <form action={submit} className="inline">
      <input
        name="intent"
        type="hidden"
        value={panel.status === 'closed' ? 'pharmacy_thread_reopen' : 'pharmacy_thread_close'}
      />
      <input name="threadId" type="hidden" value={panel.threadId} />
      <button className={secondaryButton} disabled={isPending} type="submit">
        {panel.status === 'closed' ? 'Reopen thread' : 'Close thread'}
      </button>
      {state?.error ? <span className="ml-2 text-sm text-red-700">{state.error}</span> : null}
    </form>
  );
}

/* Opening the panel audits the view and marks the customer's messages read. */
function useMarkRead(panel: ThreadPanelData) {
  const [, formAction] = useActionState<MailActionState, FormData>(pharmacyMailStaffAction, null);
  const done = useRef<string | null>(null);

  useEffect(() => {
    if (!panel.threadId || done.current === panel.threadId) {
      return;
    }

    done.current = panel.threadId;

    const fd = new FormData();

    fd.set('intent', 'pharmacy_thread_mark_read');
    fd.set('threadId', panel.threadId);
    startTransition(() => formAction(fd));
  }, [formAction, panel.threadId]);
}

export function PharmacyThreadPanel({ panel }: { panel: ThreadPanelData | undefined }) {
  const [signing, setSigning] = useState<Signing>({ signAs: '', reviewerName: '' });

  useEffect(() => {
    const stored = readStoredSignAs();

    if (stored) {
      setSigning((current) => (current.signAs ? current : { ...current, signAs: stored }));
    }
  }, []);

  if (!panel) {
    return null;
  }

  return <PanelBody panel={panel} setSigning={setSigning} signing={signing} />;
}

function PanelBody({
  panel,
  signing,
  setSigning,
}: {
  panel: ThreadPanelData;
  signing: Signing;
  setSigning: (next: Signing) => void;
}) {
  useMarkRead(panel);

  return (
    <section
      className="mt-3 space-y-3 rounded-lg border border-[#d7e3f0] bg-[#f6f9fc] px-3 py-3"
      data-thread-panel={panel.threadId ?? 'new'}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-[#1f5f8b]">Messages with customer</h4>
          <p className="text-sm text-[#3f3d39]">
            {panel.ref ? `${panel.ref} · ` : ''}
            {panel.regionLabel}
            {panel.status === 'closed' ? ' · Closed' : ''}
            {panel.route.mailboxAddress ? ` · ${panel.route.mailboxAddress}` : ''}
          </p>
        </div>
        <ThreadStatusButton panel={panel} signing={signing} />
      </div>
      <p className="text-sm text-[#3f3d39]">{deliveryLine(panel)}</p>
      {panel.loadError ? <p className="text-sm text-red-700">{panel.loadError}</p> : null}
      {panel.messages.length > 0 ? (
        <ol className="space-y-2">
          {panel.messages.map((message) => (
            <MessageItem key={message.id} message={message} signing={signing} />
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[#6b6560]">No messages yet.</p>
      )}
      {panel.loadError ? null : (
        <>
          <SigningFields onChange={setSigning} signing={signing} />
          <Composer panel={panel} signing={signing} />
          <MailtoButtons panel={panel} signing={signing} />
          <RecordOutcome panel={panel} signing={signing} />
        </>
      )}
    </section>
  );
}
