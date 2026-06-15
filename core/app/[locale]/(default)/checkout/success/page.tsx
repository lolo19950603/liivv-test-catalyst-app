import { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { fulfillCheckoutPayment } from '~/lib/checkout/payment';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Checkout.Success' });

  return {
    title: t('title'),
  };
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const query = await searchParams;
  const paymentIntentId =
    typeof query.payment_intent === 'string' ? query.payment_intent : undefined;

  setRequestLocale(locale);

  if (paymentIntentId) {
    await fulfillCheckoutPayment(paymentIntentId);
  }

  const t = await getTranslations('Checkout.Success');

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-start gap-6 px-4 py-16">
      <h1 className="font-[family-name:var(--font-family-heading)] text-4xl font-medium">{t('title')}</h1>
      <p className="text-[var(--contrast-500,hsl(var(--contrast-500)))]">{t('description')}</p>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/account/orders/" size="medium" variant="primary">
          {t('viewOrders')}
        </ButtonLink>
        <ButtonLink href="/account/subscriptions/" size="medium" variant="secondary">
          {t('viewSubscriptions')}
        </ButtonLink>
        <ButtonLink href="/" size="medium" variant="secondary">
          {t('continueShopping')}
        </ButtonLink>
      </div>
    </div>
  );
}
