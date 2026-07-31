import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getDashboardCustomer } from '~/app/[locale]/(default)/account/(portal)/dashboard/page-data';
import { listSavedKits } from '~/lib/supabase/saved-kits-store';

import { SavedKitsList } from './_components/saved-kits-list';

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function SavedKitsPage({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  // Namespace typing can lag behind new message keys on large trees.
  const t = (await getTranslations('Account.SavedKits' as 'Account.Layout')) as unknown as {
    (key: string, values?: Record<string, string | number | Date>): string;
  };
  const customer = await getDashboardCustomer();
  const kits = customer ? await listSavedKits(String(customer.entityId)) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">{t('title')}</h1>
      <SavedKitsList
        kits={kits.map((kit) => ({
          id: kit.id,
          name: kit.name,
          itemCount: kit.items.reduce((sum, item) => sum + item.quantity, 0),
          items: kit.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            ...(item.sku ? { sku: item.sku } : {}),
          })),
          updatedAt: kit.updated_at,
        }))}
      />
    </div>
  );
}
