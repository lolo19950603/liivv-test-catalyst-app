import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { redirect } from 'next/navigation';

import { Link } from '~/components/link';
import { OnboardingSectionHeader } from '~/components/onboarding/onboarding-section-header';
import { OpenLiveChatButton } from '~/components/virtual-care/live-chat-widget';
import { getOnboardingCustomer } from '~/app/[locale]/(default)/account/onboarding/page-data';

interface Props {
  params: Promise<{ locale: string }>;
}

const cardClass =
  'rounded-xl border border-[#e5dfd5] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-[#c4b8a8]';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  setRequestLocale(locale);

  return { title: 'Virtual care' };
}

export default async function VirtualCareHubPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const customer = await getOnboardingCustomer();

  if (!customer) {
    redirect('/login?redirectTo=/account/virtual-care');
  }

  const first = customer.firstName.trim();

  return (
    <section className="space-y-8">
      <OnboardingSectionHeader
        description="Book a visit with our team or message us in secure in-app chat."
        kicker="Virtual care"
        title={
          first ? (
            <>
              <span className="font-semibold text-[#1a1a1a]">Hi {first}, how can we </span>
              <span className="font-normal text-[#8E9E88]">help?</span>
            </>
          ) : (
            <>
              <span className="font-semibold text-[#1a1a1a]">Virtual </span>
              <span className="font-normal text-[#8E9E88]">care</span>
            </>
          )
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Link className={`${cardClass} block no-underline`} href="/account/virtual-care/appointment">
          <h2 className="text-lg font-semibold text-[#2c2a26]">Book an appointment</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            Choose a date and time and tell us what you need. We&apos;ll follow up to confirm.
          </p>
          <span className="mt-4 inline-flex text-sm font-medium text-[#5a6d4d]">Continue →</span>
        </Link>

        <OpenLiveChatButton
          className={`liivv-virtual-care-card ${cardClass} block w-full text-left no-underline`}
        >
          <h2 className="text-lg font-semibold text-[#2c2a26]">Live chat</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            Open the chat assistant from any page — ask about products, orders, or your account.
          </p>
          <span className="mt-4 inline-flex text-sm font-medium text-[#5a6d4d]">Open chat →</span>
        </OpenLiveChatButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link className={`${cardClass} block no-underline`} href="/account/pharmacy">
          <h2 className="text-lg font-semibold text-[#2c2a26]">Pharmacy</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            Manage prescriptions, refills, and transfers.
          </p>
          <span className="mt-4 inline-flex text-sm font-medium text-[#5a6d4d]">Continue →</span>
        </Link>

        <Link
          className={`${cardClass} block no-underline`}
          href="/account/pharmacy?section=carepack"
        >
          <h2 className="text-lg font-semibold text-[#2c2a26]">CarePack</h2>
          <p className="mt-2 text-sm text-[#6b6560]">
            Request pre-packaged medication pouches for eligible tablet prescriptions.
          </p>
          <span className="mt-4 inline-flex text-sm font-medium text-[#5a6d4d]">Continue →</span>
        </Link>
      </div>
    </section>
  );
}
