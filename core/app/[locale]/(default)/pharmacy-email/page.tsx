import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Link } from '~/components/link';
import { locales } from '~/i18n/locales';
import { PHARMACY_REGIONS, pharmacyPhoneOf, pharmacyRegionName } from '~/lib/pharmacy-mail/regions';

/*
 * =============================================================================
 * "HOW LIIVV'S PHARMACY USES EMAIL" (owner decision Q10, 2026-10-14)
 * =============================================================================
 * Linked from the contact choice, the Pharmacy page and every email footer.
 * Ontario's Information and Privacy Commissioner expects this notice BEFORE
 * consent (privacy research R9), so no email mode should go live until the
 * owner and the pharmacy privacy officer have approved this wording (D8) and
 * the French version exists (D10). DRAFT wording from the privacy research;
 * kept out of search engines until approved. The provincial pharmacies are
 * named as "Liivv's licensed pharmacy in your province" until the owner rules
 * on the legal identification line (D5).
 * =============================================================================
 */

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'How Liivv’s pharmacy uses email',
  description: 'When a Liivv pharmacist emails you, what the email says, and your choices.',
  robots: { index: false, follow: true },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold text-[#2c2a26]">{title}</h2>
      <div className="space-y-2 text-base leading-relaxed text-[#3f3d39]">{children}</div>
    </section>
  );
}

export default async function PharmacyEmailPolicyPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-[#1c3a24] sm:text-3xl">
          How Liivv’s pharmacy uses email
        </h1>
        <p className="text-base text-[#5c564c]">
          A Liivv pharmacist may need to reach you about your CPAP prescription or a mask order.
          This page explains when we email you, what our emails say, and the choices you have.
        </p>
      </header>

      <Section title="Why we email">
        <p>
          Only to tell you that your Liivv pharmacist has a message about your CPAP prescription or
          a mask order. We never use these emails for marketing.
        </p>
      </Section>

      <Section title="Your three choices">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>A notice only (recommended).</strong> The email says only that a message is
            waiting. You sign in to your Liivv account and open Pharmacy to read it and reply.
          </li>
          <li>
            <strong>The pharmacist’s message.</strong> Where we offer it, the email includes only
            what the pharmacist needs to tell or ask you.
          </li>
          <li>
            <strong>No email.</strong> We call you at the number on your account.
          </li>
        </ul>
        <p>
          The subject line is always the same, with a reference number such as “ref. LV-7Q4K2M”. It
          never names your health condition, your prescription, a product or an order. We email only
          your account address, after you have confirmed it.
        </p>
        <p>
          You can change your choice at any time on your{' '}
          <Link className="font-medium underline" href="/account/pharmacy">
            Pharmacy page
          </Link>
          .
        </p>
      </Section>

      <Section title="The risks of email, and what you can do">
        <p>
          Email is not fully private. Anyone who can open your inbox, or see your phone’s
          notifications, may see it. It can go to the wrong address, or be forwarded. Use an email
          account that only you can open, and think about what your lock screen shows.
        </p>
      </Section>

      <Section title="How to recognise our emails">
        <p>
          Our emails come from a Liivv pharmacy address and are signed by a Liivv pharmacist. Liivv
          will never ask for your password or card number by email. If you are unsure an email is
          from us, don’t click anything: call your Liivv pharmacy.
        </p>
        <ul className="grid gap-1 sm:grid-cols-2">
          {PHARMACY_REGIONS.map((region) => (
            <li key={region}>
              {pharmacyRegionName(region)}: {pharmacyPhoneOf(region)}
            </li>
          ))}
        </ul>
        <p className="text-sm text-[#6b6560]">
          Quebec and the territories: call the Ontario number.
        </p>
      </Section>

      <Section title="Your replies are part of your pharmacy record">
        <p>
          If you reply to our email, or write on your Pharmacy page, your message is added to your
          pharmacy record and shown on your Pharmacy page. Your record is held by Liivv’s licensed
          pharmacy in your province.
        </p>
      </Section>

      <Section title="How long messages are kept">
        <p>
          Messages are part of your pharmacy record, so we keep them as long as the law requires for
          pharmacy records (in Ontario, at least 10 years after your last pharmacy service).
          Changing your choice, or closing your account, stops future emails. It does not delete
          messages already in your record.
        </p>
      </Section>

      <Section title="Seeing your record, and complaints">
        <p>
          You can ask to see or correct your record, or make a complaint, by calling your Liivv
          pharmacy. You can also complain to your province’s information and privacy commissioner.
        </p>
      </Section>

      <Section title="If an email goes astray">
        <p>
          If one of our emails reaches the wrong person, we contain it as fast as we can and tell
          you what happened. If you get an email from us by mistake, please tell us by replying or
          calling, then delete it.
        </p>
      </Section>
    </main>
  );
}
