'use client';

import { startTransition, useActionState, useEffect, useRef, useState } from 'react';

import {
  pharmacyMessageAction,
  type PharmacyMessageActionState,
} from '~/app/[locale]/(default)/account/(portal)/pharmacy/_actions/pharmacy-message-actions';
import {
  type ContactChoiceValue,
  isContactChoiceComplete,
  PharmacyContactConsent,
} from '~/components/pharmacy/pharmacy-contact-consent';
import type {
  CustomerContactView,
  CustomerPharmacyMessagesData,
  CustomerThreadView,
  PharmacyContactIntake,
} from '~/lib/pharmacy-mail/view-types';
import { useRouter } from '~/i18n/routing';

/*
 * =============================================================================
 * "MESSAGES FROM YOUR PHARMACIST" ON THE ACCOUNT PHARMACY PAGE
 * =============================================================================
 * Owner decision Q10, 2026-10-14. A Liivv pharmacist's messages about the
 * customer's CPAP prescription or a mask order, and the customer's replies
 * (written here or emailed back), one block per record. Text is rendered as
 * plain text only (no HTML, no clickable links). A reply here never sends an
 * email. "How your pharmacist can reach you" sits below: the contact choice,
 * the masked address and whether it is checked.
 *
 * English only, like the rest of the Pharmacy page (French waits for D10).
 * Wording is a draft for the owner, as nurse (C1 tier for the urgent line).
 * =============================================================================
 */

const REPLY_MAX = 2000;

function formatWhen(iso: string): string {
  const date = new Date(iso);

  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('en-CA', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

function newRequestId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : '';
}

function useMessageAction() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<PharmacyMessageActionState, FormData>(
    pharmacyMessageAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
    }
  }, [router, state]);

  return { state, formAction, isPending };
}

function StateLine({ state }: { state: PharmacyMessageActionState }) {
  if (state?.error) {
    return <p className="mt-2 text-sm text-red-700">{state.error}</p>;
  }

  return state?.notice ? <p className="mt-2 text-sm text-[#2f6b2f]">{state.notice}</p> : null;
}

function ReplyForm({ thread, phone }: { thread: CustomerThreadView; phone: string }) {
  const { state, formAction, isPending } = useMessageAction();
  const [text, setText] = useState('');
  // One id per reply, kept across a double submit, so the server stores it once.
  const requestId = useRef<string | null>(null);
  const submit = (formData: FormData) => {
    requestId.current = requestId.current ?? newRequestId();
    formData.set('clientRequestId', requestId.current);
    formAction(formData);
  };

  useEffect(() => {
    if (state?.ok) {
      requestId.current = null;
      setText('');
    }
  }, [state]);

  return (
    <form action={submit} className="mt-3 space-y-2">
      <input name="intent" type="hidden" value="pharmacy_thread_reply" />
      <input name="threadId" type="hidden" value={thread.id} />
      <label className="block text-sm">
        <span className="font-medium text-[#2c2a26]">Reply</span>
        <textarea
          className="mt-1 w-full rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm focus:border-[#8a9a7b] focus:outline-none focus:ring-2 focus:ring-[#8a9a7b]/30"
          maxLength={REPLY_MAX}
          name="text"
          onChange={(event) => setText(event.target.value)}
          required
          rows={3}
          value={text}
        />
      </label>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs tabular-nums text-[#8a8176]">
          {text.length} / {REPLY_MAX}
        </span>
        <button
          className="liivv-btn-primary px-4 py-2 text-sm disabled:opacity-50"
          disabled={isPending || !text.trim()}
          type="submit"
        >
          {isPending ? 'Sending…' : 'Send reply'}
        </button>
      </div>
      <p className="text-xs text-[#6b6560]">
        For anything urgent, call {phone}. In an emergency, call 911.
      </p>
      <StateLine state={state} />
    </form>
  );
}

function ThreadBlock({ thread, phone }: { thread: CustomerThreadView; phone: string }) {
  return (
    <article className="rounded-xl border border-[#e8e2d8] bg-[#faf8f5] p-4">
      <h3 className="text-sm font-semibold text-[#2c2a26]">{thread.topicLabel}</h3>
      <ol className="mt-3 space-y-3">
        {thread.messages.map((message) => (
          <li
            className={`rounded-lg px-3 py-2 ${message.mine ? 'ml-6 bg-white' : 'mr-6 border border-[#d8e4d8] bg-[#eef4ee]'}`}
            key={message.id}
          >
            <p className="text-xs font-medium text-[#5c564c]">
              {message.senderLabel} ·{' '}
              <time dateTime={message.createdAt} suppressHydrationWarning>
                {formatWhen(message.createdAt)}
              </time>
              {message.unread ? (
                <span className="ml-2 font-semibold text-[#9a6b00]">New</span>
              ) : null}
            </p>
            <p className="mt-1 whitespace-pre-wrap break-words text-sm text-[#2c2a26]">
              {message.bodyText}
            </p>
            {message.received ? (
              <p className="mt-1 text-xs text-[#6b6560]">
                Received by Liivv pharmacy ·{' '}
                <time dateTime={message.createdAt} suppressHydrationWarning>
                  {formatWhen(message.createdAt)}
                </time>
              </p>
            ) : null}
          </li>
        ))}
      </ol>
      <ReplyForm phone={phone} thread={thread} />
    </article>
  );
}

const MODE_LABEL: Record<string, string> = {
  notice_only: 'Email me a notice only',
  message_by_email: 'Email me the pharmacist’s message',
  no_email: 'Don’t email me (phone)',
  not_chosen: 'Not chosen yet',
};

function CodeCheck({ contact }: { contact: CustomerContactView }) {
  const { state, formAction, isPending } = useMessageAction();

  if (!contact.codeAvailable) {
    return (
      <p className="text-sm text-[#5c564c]">
        Your pharmacist will confirm this address with a short test email.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <form action={formAction}>
        <input name="intent" type="hidden" value="pharmacy_email_code_send" />
        <button
          className="liivv-btn-secondary px-4 py-2 text-sm disabled:opacity-50"
          disabled={isPending}
          type="submit"
        >
          Send me a code
        </button>
      </form>
      {contact.codePending || state?.ok ? (
        <form action={formAction} className="flex flex-wrap items-end gap-2">
          <input name="intent" type="hidden" value="pharmacy_email_code_confirm" />
          <label className="block text-sm">
            <span className="font-medium text-[#2c2a26]">6-digit code</span>
            <input
              autoComplete="one-time-code"
              className="mt-1 w-32 rounded-lg border border-[#e0d9ce] px-3 py-2 text-sm tracking-widest"
              inputMode="numeric"
              maxLength={6}
              name="code"
              pattern="[0-9]{6}"
              required
            />
          </label>
          <button
            className="liivv-btn-primary px-4 py-2 text-sm disabled:opacity-50"
            disabled={isPending}
            type="submit"
          >
            Confirm
          </button>
        </form>
      ) : null}
      <StateLine state={state} />
    </div>
  );
}

function ContactForm({
  contactIntake,
  onDone,
}: {
  contactIntake: PharmacyContactIntake;
  onDone: () => void;
}) {
  const { state, formAction, isPending } = useMessageAction();
  const [value, setValue] = useState<ContactChoiceValue>({ mode: null, agree: false });

  useEffect(() => {
    if (state?.ok) {
      onDone();
    }
  }, [onDone, state]);

  return (
    <form action={formAction} className="space-y-3">
      <input name="intent" type="hidden" value="pharmacy_contact_set" />
      <input name="mode" type="hidden" value={value.mode ?? ''} />
      <input name="agree" type="hidden" value={value.agree ? 'yes' : 'no'} />
      <PharmacyContactConsent
        accountEmail={contactIntake.accountEmail}
        messageModeOffered={contactIntake.messageModeOffered}
        name="pharmacy-page-contact"
        onChange={setValue}
        value={value}
      />
      <button
        className="liivv-btn-primary px-4 py-2 text-sm disabled:opacity-50"
        disabled={isPending || !isContactChoiceComplete(value)}
        type="submit"
      >
        Save
      </button>
      <StateLine state={state} />
    </form>
  );
}

function editLabel(editing: boolean, mode: string): string {
  if (editing) {
    return 'Cancel';
  }

  return mode === 'not_chosen' ? 'Choose' : 'Change';
}

/* "Email me a notice only · j***@gmail.com · confirmed" */
function contactSummary(contact: CustomerContactView): string {
  const label = MODE_LABEL[contact.mode] ?? MODE_LABEL.not_chosen ?? '';

  if (contact.mode !== 'notice_only' && contact.mode !== 'message_by_email') {
    return label;
  }

  const address = contact.maskedEmail ? ` · ${contact.maskedEmail}` : '';

  return `${label}${address} · ${contact.verified ? 'confirmed' : 'not confirmed yet'}`;
}

function ContactPreferences({
  contact,
  contactIntake,
}: {
  contact: CustomerContactView;
  contactIntake: PharmacyContactIntake;
}) {
  const [editing, setEditing] = useState(false);
  const emailMode = contact.mode === 'notice_only' || contact.mode === 'message_by_email';

  // No email choice is offered until the owner approves its wording (D8).
  if (!contactIntake.emailOffered) {
    return (
      <div className="mt-5 border-t border-[#efe9e0] pt-4" data-pharmacy-contact="phone">
        <h3 className="text-sm font-semibold text-[#2c2a26]">How your pharmacist can reach you</h3>
        <p className="mt-1 text-sm text-[#5c564c]">
          By phone, at the number on your account. Their messages also appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-5 border-t border-[#efe9e0] pt-4" data-pharmacy-contact={contact.mode}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[#2c2a26]">
            How your pharmacist can reach you
          </h3>
          <p className="mt-1 text-sm text-[#5c564c]">{contactSummary(contact)}</p>
        </div>
        <button
          className="liivv-btn-secondary px-3 py-1.5 text-sm"
          onClick={() => setEditing(!editing)}
          type="button"
        >
          {editLabel(editing, contact.mode)}
        </button>
      </div>
      {contact.blocked === 'account_email_changed' ? (
        <p className="mt-2 text-sm text-[#9a6b00]">
          Your account email changed. Confirm the new one to keep getting email from your
          pharmacist.
        </p>
      ) : null}
      {editing ? (
        <div className="mt-3">
          <ContactForm contactIntake={contactIntake} onDone={() => setEditing(false)} />
        </div>
      ) : null}
      {!editing && emailMode && !contact.verified && contact.blocked !== 'account_email_changed' ? (
        <div className="mt-3">
          <CodeCheck contact={contact} />
        </div>
      ) : null}
    </div>
  );
}

/* Marks the pharmacist's messages read once the card has been seen. */
function useMarkRead(hasUnread: boolean) {
  const [, formAction] = useActionState<PharmacyMessageActionState, FormData>(
    pharmacyMessageAction,
    null,
  );
  const done = useRef(false);

  useEffect(() => {
    if (!hasUnread || done.current) {
      return;
    }

    done.current = true;

    const fd = new FormData();

    fd.set('intent', 'pharmacy_messages_mark_read');
    startTransition(() => formAction(fd));
  }, [formAction, hasUnread]);
}

export function PharmacyMessagesCard({
  data,
  contactIntake,
  supabaseReady,
}: {
  data: CustomerPharmacyMessagesData;
  contactIntake: PharmacyContactIntake;
  supabaseReady: boolean;
}) {
  useMarkRead(data.hasUnread);

  // Hidden while health tools are down, and before its migration has run.
  if (!supabaseReady || (!data.ready && !data.error)) {
    return null;
  }

  return (
    <section
      aria-labelledby="pharmacist-messages-title"
      className="rounded-xl border border-[#e5dfd5] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] sm:p-5"
      data-pharmacist-messages={data.threads.length}
    >
      <h2 className="text-base font-semibold text-[#2c2a26]" id="pharmacist-messages-title">
        Messages from your pharmacist
      </h2>
      {data.error ? <p className="mt-2 text-sm text-[#7a5c20]">{data.error}</p> : null}
      {data.ready && data.threads.length === 0 ? (
        <p className="mt-2 max-w-2xl text-sm text-[#5c564c]">
          When a Liivv pharmacist needs to reach you about your CPAP prescription or a mask order,
          their message will appear here.
        </p>
      ) : null}
      {data.threads.length > 0 ? (
        <div className="mt-3 space-y-3">
          {data.threads.map((thread) => (
            <ThreadBlock key={thread.id} phone={data.phone} thread={thread} />
          ))}
        </div>
      ) : null}
      {data.contact ? (
        <ContactPreferences contact={data.contact} contactIntake={contactIntake} />
      ) : null}
    </section>
  );
}
