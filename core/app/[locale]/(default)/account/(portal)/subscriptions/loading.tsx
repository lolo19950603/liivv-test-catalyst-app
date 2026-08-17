import { getTranslations } from 'next-intl/server';

import { OliviaSpinner } from '~/components/olivia/olivia-spinner';

export default async function SubscriptionsLoading() {
  const t = await getTranslations('Account.Subscriptions');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f2ed] px-4">
      <OliviaSpinner caption={t('loading')} />
    </div>
  );
}
