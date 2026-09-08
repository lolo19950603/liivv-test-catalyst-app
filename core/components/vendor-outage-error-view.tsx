'use client';

import { useTranslations } from 'next-intl';

import { Error as ErrorSection } from '@/vibes/soul/sections/error';
import { Link } from '~/components/link';
import { vendorFromDigest, type VendorName } from '~/lib/vendor-outage';
import { vendorOutageCopy } from '~/lib/vendor-outage/ui';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

function vendorFromError(error: Error & { digest?: string }): VendorName | null {
  return vendorFromDigest(error.digest);
}

export function VendorOutageErrorView({ error, reset }: Props) {
  const t = useTranslations('Error');
  const vendor = vendorFromError(error);

  if (!vendor) {
    return (
      <ErrorSection
        ctaAction={reset}
        ctaLabel={t('cta')}
        subtitle={t('subtitle')}
        title={t('title')}
      />
    );
  }

  const copy = vendorOutageCopy(vendor);
  const href = vendor === 'supabase' ? '/' : vendor === 'stripe' ? '/cart/' : undefined;

  return (
    <section className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-3 font-heading text-3xl font-medium">{copy.title}</h1>
      <p className="text-lg text-contrast-500">{copy.body}</p>
      <div className="mt-8 flex flex-wrap gap-3">
        <form action={reset}>
          <button
            className="rounded-full bg-[#2c2a26] px-5 py-2.5 text-sm font-medium text-white"
            type="submit"
          >
            {t('cta')}
          </button>
        </form>
        {href ? (
          <Link
            className="inline-flex rounded-full border border-[#dcd6cc] px-5 py-2.5 text-sm font-medium text-[#2c2a26]"
            href={href}
          >
            {copy.cta}
          </Link>
        ) : null}
      </div>
    </section>
  );
}
