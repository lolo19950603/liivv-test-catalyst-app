import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Subscribe.Success' });

  return {
    title: t('title'),
  };
}

export default async function SubscribeSuccessPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const t = await getTranslations('Subscribe.Success');

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-16 text-center">
      <h1 className="font-[family-name:var(--font-family-heading)] text-4xl font-medium tracking-tight">
        {t('title')}
      </h1>
      <p className="mt-4 text-[var(--contrast-500,hsl(var(--contrast-500)))]">{t('description')}</p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <ButtonLink href="/account/subscriptions/" size="medium" variant="primary">
          {t('viewSubscriptions')}
        </ButtonLink>
        <ButtonLink href="/" size="medium" variant="secondary">
          {t('continueShopping')}
        </ButtonLink>
      </div>
    </div>
  );
}
