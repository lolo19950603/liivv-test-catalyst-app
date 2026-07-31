'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';

import { PriceLabel, type Price } from '@/vibes/soul/primitives/price-label';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { addKitToCart } from '~/lib/kit/add-kit-to-cart';

export interface CuratedKitOptionValue {
  entityId: number;
  label: string;
  isDefault: boolean;
}

export interface CuratedKitOption {
  entityId: number;
  displayName: string;
  isRequired: boolean;
  values: CuratedKitOptionValue[];
}

export interface CuratedKitProduct {
  productEntityId: number;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  unitPrice: number;
  currencyCode: string;
  sku?: string;
  defaultQuantity: number;
  /** Fallback option catalog when kit_variants does not override this component. */
  options?: CuratedKitOption[];
  /** Kit-specific locked selections (from kit_variants or product defaults). */
  selectedOptions?: {
    multipleChoices: Array<{
      optionEntityId: number;
      optionValueEntityId: number;
    }>;
  };
  variantEntityId?: number;
}

interface SelectedItem {
  productEntityId: number;
  quantity: number;
}

interface Props {
  kitName: string;
  products: CuratedKitProduct[];
}

function fallbackSelectedOptions(product: CuratedKitProduct) {
  if (product.selectedOptions?.multipleChoices?.length) {
    return product.selectedOptions;
  }

  const multipleChoices = (product.options ?? []).flatMap((option) => {
    const preferred = option.values.find((value) => value.isDefault) ?? option.values[0];

    if (!preferred) {
      return [];
    }

    return [
      {
        optionEntityId: option.entityId,
        optionValueEntityId: preferred.entityId,
      },
    ];
  });

  return multipleChoices.length > 0 ? { multipleChoices } : undefined;
}

/**
 * Buy-box for curated kits — qty / remove only. Meant to replace the normal
 * ProductDetail add-to-cart form while keeping the rest of the PDP intact.
 */
export function CuratedKitCustomizer({ kitName, products }: Props) {
  // Namespace typing can hit TS depth limits on this large messages tree.
  const t = useTranslations('Faceted.CuratedKit') as unknown as {
    (key: string, values?: Record<string, string | number | Date>): string;
  };
  const format = useFormatter();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<SelectedItem[]>(() =>
    products.map((product) => ({
      productEntityId: product.productEntityId,
      quantity: product.defaultQuantity,
    })),
  );

  const productById = useMemo(() => {
    return new Map(products.map((product) => [product.productEntityId, product]));
  }, [products]);

  const included = selected.filter((item) => item.quantity > 0);
  const removed = products.filter(
    (product) =>
      !selected.some(
        (item) => item.productEntityId === product.productEntityId && item.quantity > 0,
      ),
  );

  const runningTotal = useMemo(
    () =>
      included.reduce((sum, item) => {
        const product = productById.get(item.productEntityId);

        return sum + (product?.unitPrice ?? 0) * item.quantity;
      }, 0),
    [included, productById],
  );

  const currencyCode = products[0]?.currencyCode ?? 'USD';

  function setQuantity(productEntityId: number, quantity: number) {
    setSelected((prev) => {
      const nextQty = Math.max(0, quantity);
      const existing = prev.find((item) => item.productEntityId === productEntityId);

      if (existing) {
        return prev.map((item) =>
          item.productEntityId === productEntityId ? { ...item, quantity: nextQty } : item,
        );
      }

      return [...prev, { productEntityId, quantity: nextQty }];
    });
  }

  function handleAddKitToCart() {
    if (included.length === 0) {
      toast.error(t('Errors.emptyKit'));

      return;
    }

    startTransition(async () => {
      const result = await addKitToCart({
        kitName,
        items: included.map((item) => {
          const product = productById.get(item.productEntityId);
          const selectedOptions = product ? fallbackSelectedOptions(product) : undefined;

          return {
            productEntityId: item.productEntityId,
            quantity: item.quantity,
            name: product?.title ?? String(item.productEntityId),
            ...(product?.sku ? { sku: product.sku } : {}),
            ...(product?.variantEntityId ? { variantEntityId: product.variantEntityId } : {}),
            ...(selectedOptions ? { selectedOptions } : {}),
          };
        }),
      });

      if (result?.status === 'error') {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-base font-medium">{t('includedTitle')}</h2>
          <p className="text-sm text-[var(--contrast-500)]">
            {t('includedCount', { count: included.length })}
          </p>
        </div>

        {included.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--contrast-200)] px-4 py-6 text-center text-sm text-[var(--contrast-500)]">
            {t('allRemoved')}
          </p>
        ) : (
          <ul className="divide-y divide-[var(--contrast-100)] overflow-hidden rounded-xl border border-[var(--contrast-100)]">
            {included.map((item) => {
              const product = productById.get(item.productEntityId);

              if (!product) {
                return null;
              }

              return (
                <li className="flex gap-3 p-3" key={item.productEntityId}>
                  <Link
                    className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-[var(--contrast-100)]"
                    href={product.href}
                  >
                    {product.image ? (
                      <Image
                        alt={product.image.alt}
                        className="object-cover"
                        fill
                        sizes="56px"
                        src={product.image.src}
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      className="line-clamp-2 text-sm font-medium text-[var(--foreground)] hover:underline"
                      href={product.href}
                    >
                      {product.title}
                    </Link>
                    {product.price ? (
                      <div className="mt-0.5">
                        <PriceLabel className="text-sm" price={product.price} />
                      </div>
                    ) : null}
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          aria-label={t('decrement')}
                          className="flex size-7 items-center justify-center rounded border border-[var(--contrast-200)] text-sm"
                          onClick={() => setQuantity(item.productEntityId, item.quantity - 1)}
                          type="button"
                        >
                          −
                        </button>
                        <span className="min-w-5 text-center text-sm">{item.quantity}</span>
                        <button
                          aria-label={t('increment')}
                          className="flex size-7 items-center justify-center rounded border border-[var(--contrast-200)] text-sm"
                          onClick={() => setQuantity(item.productEntityId, item.quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-xs text-[var(--contrast-500)] underline"
                        onClick={() => setQuantity(item.productEntityId, 0)}
                        type="button"
                      >
                        {t('remove')}
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {removed.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t('removedTitle')}</h3>
          <ul className="space-y-2">
            {removed.map((product) => (
              <li
                className="flex items-center gap-3 rounded-lg border border-[var(--contrast-100)] p-2"
                key={product.productEntityId}
              >
                <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-[var(--contrast-100)]">
                  {product.image ? (
                    <Image
                      alt={product.image.alt}
                      className="object-cover"
                      fill
                      sizes="40px"
                      src={product.image.src}
                    />
                  ) : null}
                </div>
                <p className="min-w-0 flex-1 line-clamp-2 text-xs font-medium">{product.title}</p>
                <Button
                  onClick={() => setQuantity(product.productEntityId, product.defaultQuantity)}
                  size="x-small"
                  type="button"
                  variant="secondary"
                >
                  {t('addBack')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-[var(--contrast-100)] pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm text-[var(--contrast-500)]">{t('runningTotal')}</p>
          <p className="text-lg font-semibold">
            {format.number(runningTotal, { style: 'currency', currency: currencyCode })}
          </p>
        </div>
        <Button
          className="w-full"
          disabled={included.length === 0 || isPending}
          loading={isPending}
          onClick={handleAddKitToCart}
          type="button"
        >
          {t('addKitToCart')}
        </Button>
      </div>
    </div>
  );
}
