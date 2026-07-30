import { getTranslations } from 'next-intl/server';

import { ButtonLink } from '@/vibes/soul/primitives/button-link';
import { getCuratedKitsForCategoryPath } from '~/lib/kit';

export async function CategoryCuratedKits({ categoryPath }: { categoryPath: string }) {
  const kits = getCuratedKitsForCategoryPath(categoryPath);

  if (kits.length === 0) {
    return null;
  }

  const t = await getTranslations('Faceted.CuratedKit');

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-6">
      <div className="rounded-2xl border border-[var(--contrast-100)] bg-[var(--contrast-100)]/30 p-5 md:p-6">
        <div className="mb-4">
          <h2 className="text-lg font-medium text-[var(--foreground)]">{t('categorySectionTitle')}</h2>
          <p className="mt-1 text-sm text-[var(--contrast-500)]">{t('categorySectionSubtitle')}</p>
        </div>
        <ul className="grid gap-3 md:grid-cols-2">
          {kits.map((kit) => (
            <li
              className="flex flex-col justify-between gap-3 rounded-xl border border-[var(--contrast-100)] bg-[var(--background)] p-4 sm:flex-row sm:items-center"
              key={kit.slug}
            >
              <div className="min-w-0">
                <p className="font-medium text-[var(--foreground)]">{kit.name}</p>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--contrast-500)]">
                  {kit.description}
                </p>
                <p className="mt-2 text-xs text-[var(--contrast-500)]">
                  {t('componentCount', { count: kit.components.length })}
                </p>
              </div>
              <ButtonLink
                className="shrink-0"
                href={`/kit/${kit.slug}`}
                size="medium"
                variant="secondary"
              >
                {t('customizeKit')}
              </ButtonLink>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
