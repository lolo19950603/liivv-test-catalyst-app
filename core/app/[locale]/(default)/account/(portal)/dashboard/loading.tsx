import { getTranslations } from 'next-intl/server';

export default async function DashboardLoading() {
  const t = await getTranslations('Account.Dashboard');

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f2ed] px-4">
      <p className="text-sm text-[#6b6560]">{t('loading')}</p>
    </div>
  );
}
