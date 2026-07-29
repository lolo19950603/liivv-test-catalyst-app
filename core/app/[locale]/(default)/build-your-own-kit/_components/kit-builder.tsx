'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useMemo, useState, useTransition } from 'react';

import { PriceLabel, type Price } from '@/vibes/soul/primitives/price-label';
import { Button } from '@/vibes/soul/primitives/button';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { addKitToCart } from '../_actions/add-kit-to-cart';

export interface KitBuilderProduct {
  id: string;
  productEntityId: number;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  unitPrice: number;
  currencyCode: string;
  sku?: string;
}

interface KitTrayItem {
  productEntityId: number;
  title: string;
  image?: { src: string; alt: string };
  unitPrice: number;
  currencyCode: string;
  quantity: number;
  sku?: string;
}

interface Props {
  products: KitBuilderProduct[];
  searchTerm: string;
  totalCountLabel: string;
  emptyTitle: string;
  emptySubtitle: string;
}

export function KitBuilder({
  products,
  searchTerm,
  totalCountLabel,
  emptyTitle,
  emptySubtitle,
}: Props) {
  const t = useTranslations('Faceted.BuildYourOwnKit');
  const format = useFormatter();
  const [tray, setTray] = useState<KitTrayItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const runningTotal = useMemo(
    () => tray.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [tray],
  );

  const currencyCode = tray[0]?.currencyCode ?? products[0]?.currencyCode ?? 'USD';

  function addToKit(product: KitBuilderProduct) {
    setTray((prev) => {
      const existing = prev.find((item) => item.productEntityId === product.productEntityId);

      if (existing) {
        return prev.map((item) =>
          item.productEntityId === product.productEntityId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }

      return [
        ...prev,
        {
          productEntityId: product.productEntityId,
          title: product.title,
          image: product.image,
          unitPrice: product.unitPrice,
          currencyCode: product.currencyCode,
          quantity: 1,
          sku: product.sku,
        },
      ];
    });
  }

  function updateQty(productEntityId: number, quantity: number) {
    setTray((prev) => {
      if (quantity <= 0) {
        return prev.filter((item) => item.productEntityId !== productEntityId);
      }

      return prev.map((item) =>
        item.productEntityId === productEntityId ? { ...item, quantity } : item,
      );
    });
  }

  function removeFromKit(productEntityId: number) {
    setTray((prev) => prev.filter((item) => item.productEntityId !== productEntityId));
  }

  function handleAddKitToCart() {
    if (tray.length === 0) {
      toast.error(t('Errors.emptyKit'));

      return;
    }

    startTransition(async () => {
      const result = await addKitToCart({
        items: tray.map((item) => ({
          productEntityId: item.productEntityId,
          quantity: item.quantity,
          name: item.title,
          ...(item.sku ? { sku: item.sku } : {}),
        })),
      });

      if (result?.status === 'error') {
        toast.error(result.message);
      }
    });
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:px-6">
      <div className="min-w-0">
        <header className="mb-6 space-y-2">
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl font-medium text-[var(--foreground)]">
            {t('title')}
          </h1>
          <p className="text-[var(--contrast-500)]">{t('subtitle')}</p>
        </header>

        <form className="mb-4 flex gap-2" method="get">
          <input
            className="min-w-0 flex-1 rounded-lg border border-[var(--contrast-200)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            defaultValue={searchTerm}
            name="term"
            placeholder={t('searchPlaceholder')}
            type="search"
          />
          <Button type="submit" size="medium" variant="secondary">
            {t('search')}
          </Button>
        </form>

        <p className="mb-4 text-sm text-[var(--contrast-500)]">{totalCountLabel}</p>

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--contrast-200)] px-6 py-16 text-center">
            <p className="text-lg font-medium">{emptyTitle}</p>
            <p className="mt-1 text-[var(--contrast-500)]">{emptySubtitle}</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <li
                className="flex flex-col overflow-hidden rounded-xl border border-[var(--contrast-100)] bg-[var(--background)]"
                key={product.id}
              >
                <Link className="relative aspect-square bg-[var(--contrast-100)]" href={product.href}>
                  {product.image ? (
                    <Image
                      alt={product.image.alt}
                      className="object-cover"
                      fill
                      sizes="(max-width: 768px) 50vw, 20vw"
                      src={product.image.src}
                    />
                  ) : null}
                </Link>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <Link
                    className="line-clamp-2 text-sm font-medium text-[var(--foreground)] hover:underline"
                    href={product.href}
                  >
                    {product.title}
                  </Link>
                  {product.price ? <PriceLabel price={product.price} /> : null}
                  <Button
                    className="mt-auto w-full"
                    onClick={() => addToKit(product)}
                    size="small"
                    type="button"
                    variant="secondary"
                  >
                    {t('addToKit')}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <aside className="h-fit rounded-xl border border-[var(--contrast-100)] bg-[var(--contrast-100)]/40 p-4 lg:sticky lg:top-24">
        <h2 className="text-lg font-medium">{t('trayTitle')}</h2>
        <p className="mt-1 text-sm text-[var(--contrast-500)]">{t('traySubtitle')}</p>

        {tray.length === 0 ? (
          <p className="mt-6 text-sm text-[var(--contrast-500)]">{t('trayEmpty')}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {tray.map((item) => (
              <li className="flex gap-3" key={item.productEntityId}>
                <div className="relative size-14 shrink-0 overflow-hidden rounded-md bg-[var(--contrast-100)]">
                  {item.image ? (
                    <Image
                      alt={item.image.alt}
                      className="object-cover"
                      fill
                      sizes="56px"
                      src={item.image.src}
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-[var(--contrast-500)]">
                    {format.number(item.unitPrice, {
                      style: 'currency',
                      currency: item.currencyCode,
                    })}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      aria-label={t('decrement')}
                      className="flex size-7 items-center justify-center rounded border border-[var(--contrast-200)] text-sm"
                      onClick={() => updateQty(item.productEntityId, item.quantity - 1)}
                      type="button"
                    >
                      −
                    </button>
                    <span className="min-w-6 text-center text-sm">{item.quantity}</span>
                    <button
                      aria-label={t('increment')}
                      className="flex size-7 items-center justify-center rounded border border-[var(--contrast-200)] text-sm"
                      onClick={() => updateQty(item.productEntityId, item.quantity + 1)}
                      type="button"
                    >
                      +
                    </button>
                    <button
                      className="ml-auto text-xs text-[var(--contrast-500)] underline"
                      onClick={() => removeFromKit(item.productEntityId)}
                      type="button"
                    >
                      {t('remove')}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-6 border-t border-[var(--contrast-200)] pt-4">
          <div className="mb-4 flex items-center justify-between text-sm">
            <span>{t('runningTotal')}</span>
            <span className="font-semibold">
              {format.number(runningTotal, { style: 'currency', currency: currencyCode })}
            </span>
          </div>
          <Button
            className="w-full"
            disabled={tray.length === 0 || isPending}
            loading={isPending}
            onClick={handleAddKitToCart}
            type="button"
          >
            {t('addKitToCart')}
          </Button>
        </div>
      </aside>
    </div>
  );
}
