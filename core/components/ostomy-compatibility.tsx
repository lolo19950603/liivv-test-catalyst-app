'use client';

import { useLocale, useTranslations } from 'next-intl';
import { parseAsString, useQueryStates } from 'nuqs';

import { Link } from '~/i18n/routing';

import {
  flangeKeyFromLabels,
  type CompatibilityProduct,
  type FlangeKey,
  type FlangeOption,
} from '~/lib/ostomy/compatibility';

export interface CompatibilityGroup {
  key: FlangeKey;
  items: CompatibilityProduct[];
}

function labelFor(option: FlangeOption | undefined, selected: string | null) {
  if (!option) return undefined;

  const id = selected || option.values.find((value) => value.isDefault)?.id || option.values[0]?.id;

  return option.values.find((value) => value.id === id)?.label;
}

export function CompatibilitySection({
  groups,
  options,
}: {
  groups: CompatibilityGroup[];
  options: FlangeOption[];
}) {
  const t = useTranslations('Product.Compatibility');
  const locale = useLocale();
  const schema = options.reduce<Record<string, typeof parseAsString>>((acc, option) => {
    acc[option.param] = parseAsString;

    return acc;
  }, {});
  const [params] = useQueryStates(schema);
  const allowed = groups.map((group) => group.key);
  const size = options.find((option) => option.role === 'size');
  const colour = options.find((option) => option.role === 'colour');
  const sizeFromUrl = Boolean(size && params[size.param]);
  const colourFromUrl = Boolean(colour && params[colour.param]);
  const sizeLabel =
    sizeFromUrl || !colourFromUrl ? labelFor(size, params[size?.param ?? ''] ?? null) : undefined;
  const colourLabel = sizeFromUrl
    ? undefined
    : labelFor(colour, params[colour?.param ?? ''] ?? null);
  const fromLabels = flangeKeyFromLabels(sizeLabel, colourLabel, allowed);
  const key = fromLabels ?? allowed[0];
  const group = groups.find((item) => item.key === key);
  const items = group?.items ?? [];

  if (!allowed.length) return null;

  return (
    <section className="border-t border-[var(--product-detail-border,hsl(var(--contrast-100)))] py-8">
      <h2 className="mb-4 text-lg font-medium">{t('title')}</h2>
      {items.length ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.entityId}>
              <Link className="block" href={item.path} locale={locale}>
                {item.image ? (
                  <img alt="" className="mb-2 aspect-square w-full rounded-lg object-contain" src={item.image.src} />
                ) : (
                  <span className="mb-2 block aspect-square w-full rounded-lg bg-[hsl(var(--contrast-100))]" />
                )}
                <span className="block text-sm">{item.name}</span>
                {item.priceLabel ? <span className="block text-sm">{item.priceLabel}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">{t('empty')}</p>
      )}
      <p className="mt-4 text-sm text-[var(--product-detail-secondary-text,hsl(var(--contrast-500)))]">{t('note')}</p>
    </section>
  );
}
