'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';

import { PriceLabel, type Price } from '@/vibes/soul/primitives/price-label';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { addKitToCart } from '../_actions/add-kit-to-cart';

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
}

interface SelectedItem {
  productEntityId: number;
  quantity: number;
}

interface Props {
  kitName: string;
  kitDescription: string;
  products: CuratedKitProduct[];
}

export function CuratedKitCustomizer({ kitName, kitDescription, products }: Props) {
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

          return {
            productEntityId: item.productEntityId,
            quantity: item.quantity,
            name: product?.title ?? String(item.productEntityId),
            ...(product?.sku ? { sku: product.sku } : {}),
          };
        }),
      });

      if (result?.status === 'error') {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-6">
      <header className="mb-8 space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--contrast-500)]">
          {t('eyebrow')}
        </p>
        <h1 className="font-[family-name:var(--font-family-heading)] text-3xl font-medium text-[var(--foreground)] md:text-4xl">
          {kitName}
        </h1>
        <p className="max-w-2xl text-[var(--contrast-500)]">{kitDescription}</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-medium">{t('includedTitle')}</h2>
          <p className="text-sm text-[var(--contrast-500)]">
            {t('includedCount', { count: included.length })}
          </p>
        </div>

        {included.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--contrast-200)] px-4 py-8 text-center text-sm text-[var(--contrast-500)]">
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
                <li className="flex gap-4 p-4" key={item.productEntityId}>
                  <Link
                    className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-[var(--contrast-100)]"
                    href={product.href}
                  >
                    {product.image ? (
                      <Image
                        alt={product.image.alt}
                        className="object-cover"
                        fill
                        sizes="80px"
                        src={product.image.src}
                      />
                    ) : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      className="font-medium text-[var(--foreground)] hover:underline"
                      href={product.href}
                    >
                      {product.title}
                    </Link>
                    {product.price ? (
                      <div className="mt-1">
                        <PriceLabel price={product.price} />
                      </div>
                    ) : null}
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          aria-label={t('decrement')}
                          className="flex size-8 items-center justify-center rounded border border-[var(--contrast-200)] text-sm"
                          onClick={() => setQuantity(item.productEntityId, item.quantity - 1)}
                          type="button"
                        >
                          −
                        </button>
                        <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                        <button
                          aria-label={t('increment')}
                          className="flex size-8 items-center justify-center rounded border border-[var(--contrast-200)] text-sm"
                          onClick={() => setQuantity(item.productEntityId, item.quantity + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                      <button
                        className="text-sm text-[var(--contrast-500)] underline"
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
      </section>

      {removed.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-lg font-medium">{t('removedTitle')}</h2>
          <p className="text-sm text-[var(--contrast-500)]">{t('removedSubtitle')}</p>
          <ul className="grid gap-3 sm:grid-cols-2">
            {removed.map((product) => (
              <li
                className="flex items-center gap-3 rounded-xl border border-[var(--contrast-100)] p-3"
                key={product.productEntityId}
              >
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-[var(--contrast-100)]">
                  {product.image ? (
                    <Image
                      alt={product.image.alt}
                      className="object-cover"
                      fill
                      sizes="56px"
                      src={product.image.src}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{product.title}</p>
                </div>
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
        </section>
      ) : null}

      <div className="sticky bottom-0 mt-10 border-t border-[var(--contrast-100)] bg-[var(--background)]/95 py-4 backdrop-blur">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-[var(--contrast-500)]">{t('runningTotal')}</p>
            <p className="text-xl font-semibold">
              {format.number(runningTotal, { style: 'currency', currency: currencyCode })}
            </p>
          </div>
          <Button
            className="w-full sm:w-auto"
            disabled={included.length === 0 || isPending}
            loading={isPending}
            onClick={handleAddKitToCart}
            type="button"
          >
            {t('addKitToCart')}
          </Button>
        </div>
      </div>
    </div>
  );
}
