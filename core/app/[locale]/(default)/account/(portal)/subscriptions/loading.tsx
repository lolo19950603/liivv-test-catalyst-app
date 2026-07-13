import { getTranslations } from 'next-intl/server';

import { Spinner } from '@/vibes/soul/primitives/spinner';

export default async function SubscriptionsLoading() {
  const t = await getTranslations('Account.Subscriptions');

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#f5f2ed] px-4">
      <Spinner loadingAriaLabel={t('loading')} size="md" />
      <p className="text-sm text-[#6b6560]">{t('loading')}</p>
    </div>
  );
}
