'use client';

import { Link } from '~/components/link';
import type { PharmacyContactChoice } from '~/lib/pharmacy-mail/consent';
import { PHARMACY_EMAIL_POLICY_PATH } from '~/lib/pharmacy-mail/templates';

/*
 * "How your Liivv pharmacist can reach you" (owner decision Q10, 2026-10-14;
 * privacy research R2). Used on the CPAP intake and on the Pharmacy page.
 * DRAFT wording for the owner and the pharmacy privacy officer (D8); bump
 * PHARMACY_EMAIL_CONSENT_WORDING_VERSION in ~/lib/pharmacy-mail/consent.ts
 * whenever it changes. There is no address field: the email is always the
 * account email, so no one can type someone else's address.
 */

export interface ContactChoiceValue {
  mode: PharmacyContactChoice | null;
  agree: boolean;
}

export function isContactChoiceComplete(value: ContactChoiceValue): boolean {
  return value.mode === 'no_email' || (value.mode !== null && value.agree);
}

const OPTIONS: Array<{
  mode: PharmacyContactChoice;
  title: string;
  detail: string;
  messageMode?: boolean;
}> = [
  {
    mode: 'notice_only',
    title: 'Email me a notice only (recommended).',
    detail:
      'The email will just say there is a message waiting. I’ll sign in to my Liivv account to read it and reply.',
  },
  {
    mode: 'message_by_email',
    title: 'Email me the pharmacist’s message.',
    detail: 'It will include only what the pharmacist needs to tell or ask me.',
    messageMode: true,
  },
  {
    mode: 'no_email',
    title: 'Don’t email me.',
    detail: 'Call me at the number on my account.',
  },
];

export function PharmacyContactConsent({
  accountEmail,
  messageModeOffered,
  value,
  onChange,
  name,
}: {
  accountEmail: string;
  messageModeOffered: boolean;
  value: ContactChoiceValue;
  onChange: (value: ContactChoiceValue) => void;
  /** Radio group name, unique on the page. */
  name: string;
}) {
  const emailMode = value.mode === 'notice_only' || value.mode === 'message_by_email';

  return (
    <fieldset className="space-y-3 rounded-xl border border-[#e8e2d8] bg-[#faf8f5] p-4">
      <legend className="px-1 text-sm font-semibold text-[#2c2a26]">
        How your Liivv pharmacist can reach you
      </legend>
      <p className="text-sm text-[#5c564c]">
        A Liivv pharmacist may need to contact you about your CPAP prescription or a mask order.
        Choose how:
      </p>
      <div className="space-y-2">
        {OPTIONS.filter((option) => !option.messageMode || messageModeOffered).map((option) => (
          <label className="flex cursor-pointer items-start gap-2 text-sm" key={option.mode}>
            <input
              checked={value.mode === option.mode}
              className="mt-1"
              name={name}
              onChange={() => onChange({ mode: option.mode, agree: value.agree })}
              type="radio"
              value={option.mode}
            />
            <span>
              <span className="font-medium text-[#2c2a26]">{option.title}</span>{' '}
              <span className="text-[#5c564c]">{option.detail}</span>
            </span>
          </label>
        ))}
      </div>
      <details className="text-sm text-[#5c564c]">
        <summary className="cursor-pointer font-medium text-[#2c2a26]">
          What to know about email
        </summary>
        <div className="mt-2 space-y-2">
          <p>
            Email is not fully private. It can be seen by anyone who can open your inbox or see your
            phone’s notifications. It can also go to the wrong address, or be forwarded. To limit
            this, we never put your health condition, prescription or product names in the subject
            line. We only email from our pharmacy address, and we never ask for passwords or card
            numbers by email. Use an email account that only you can open.
          </p>
          <p>
            If you reply to our email, your reply is added to your pharmacy record and shown on your
            Pharmacy page.
          </p>
          <p>
            You can change this at any time on your Pharmacy page. That stops future emails. It does
            not delete messages already in your pharmacy record, which we must keep by law.
          </p>
        </div>
      </details>
      {emailMode ? (
        <label className="flex items-start gap-2 text-sm">
          <input
            checked={value.agree}
            className="mt-1"
            onChange={(event) => onChange({ mode: value.mode, agree: event.target.checked })}
            type="checkbox"
          />
          <span className="text-[#2c2a26]">
            I agree that Liivv’s pharmacy can email me at{' '}
            <strong className="break-all">{accountEmail || 'my account email'}</strong> as I chose
            above.{' '}
            <Link
              className="font-medium underline"
              href={PHARMACY_EMAIL_POLICY_PATH}
              target="_blank"
            >
              How Liivv’s pharmacy uses email
            </Link>
          </span>
        </label>
      ) : null}
      {emailMode ? (
        <p className="text-xs text-[#6b6560]">
          To use another address, change your account email first.
        </p>
      ) : null}
    </fieldset>
  );
}
