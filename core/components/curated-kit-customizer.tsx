'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '~/i18n/routing';

import { Select } from '@/vibes/soul/form/select';
import { PriceLabel, type Price } from '@/vibes/soul/primitives/price-label';
import { Button } from '@/vibes/soul/primitives/button';
import { Modal } from '@/vibes/soul/primitives/modal';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Image } from '~/components/image';
import { Link } from '~/components/link';
import { addKitToCart } from '~/lib/kit/add-kit-to-cart';
import { getKitAddOnProduct } from '~/lib/kit/get-kit-addon-product';
import { saveKitToAccount } from '~/lib/kit/save-kit-to-account';
import { searchKitProducts } from '~/lib/kit/search-kit-products';

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

/** Lightweight suggestion card (full options loaded on add). */
export interface CuratedKitSuggestedProduct {
  productEntityId: number;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  hasOptions: boolean;
}

interface SelectedItem {
  productEntityId: number;
  quantity: number;
  selectedOptions?: CuratedKitProduct['selectedOptions'];
  variantEntityId?: number;
}

interface Props {
  kitName: string;
  products: CuratedKitProduct[];
  suggestedProducts?: CuratedKitSuggestedProduct[];
}

const PENDING_SAVE_STORAGE_KEY = 'liivv:pending-kit-save';

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

function buildKitItemsPayload(
  included: SelectedItem[],
  productById: Map<number, CuratedKitProduct>,
) {
  return included.map((item) => {
    const product = productById.get(item.productEntityId);
    const selectedOptions =
      item.selectedOptions ?? (product ? fallbackSelectedOptions(product) : undefined);

    return {
      productEntityId: item.productEntityId,
      quantity: item.quantity,
      name: product?.title ?? String(item.productEntityId),
      ...(product?.sku ? { sku: product.sku } : {}),
      ...(item.variantEntityId ?? product?.variantEntityId
        ? { variantEntityId: item.variantEntityId ?? product?.variantEntityId }
        : {}),
      ...(selectedOptions ? { selectedOptions } : {}),
    };
  });
}

/**
 * Buy-box for curated kits — qty / remove / variants / add-ons.
 * Replaces the normal ProductDetail add-to-cart form while keeping the rest of the PDP intact.
 */
export function CuratedKitCustomizer({
  kitName,
  products: initialProducts,
  suggestedProducts = [],
}: Props) {
  // Namespace typing can hit TS depth limits on this large messages tree.
  const t = useTranslations('Faceted.CuratedKit') as unknown as {
    (key: string, values?: Record<string, string | number | Date>): string;
  };
  const format = useFormatter();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isSaving, startSaveTransition] = useTransition();
  const [catalog, setCatalog] = useState<CuratedKitProduct[]>(initialProducts);
  const [selected, setSelected] = useState<SelectedItem[]>(() =>
    initialProducts.map((product) => ({
      productEntityId: product.productEntityId,
      quantity: product.defaultQuantity,
      selectedOptions: fallbackSelectedOptions(product),
      ...(product.variantEntityId ? { variantEntityId: product.variantEntityId } : {}),
    })),
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; title: string; href: string; image?: { src: string; alt: string } }>
  >([]);
  const [isSearching, startSearchTransition] = useTransition();
  const [addingProductId, setAddingProductId] = useState<number | null>(null);

  const productById = useMemo(() => {
    return new Map(catalog.map((product) => [product.productEntityId, product]));
  }, [catalog]);

  const included = selected.filter((item) => item.quantity > 0);
  const baseProductIds = useMemo(
    () => new Set(initialProducts.map((product) => product.productEntityId)),
    [initialProducts],
  );
  const removed = initialProducts.filter(
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

  const currencyCode = catalog[0]?.currencyCode ?? 'USD';

  const visibleSuggestions = useMemo(() => {
    const includedIds = new Set(included.map((item) => item.productEntityId));

    return suggestedProducts.filter((product) => !includedIds.has(product.productEntityId));
  }, [suggestedProducts, included]);

  const ensureInCatalog = useCallback((product: CuratedKitProduct) => {
    setCatalog((prev) => {
      if (prev.some((entry) => entry.productEntityId === product.productEntityId)) {
        return prev;
      }

      return [...prev, product];
    });
  }, []);

  const setQuantity = useCallback((productEntityId: number, quantity: number) => {
    setSelected((prev) => {
      const nextQty = Math.max(0, quantity);
      const existing = prev.find((item) => item.productEntityId === productEntityId);

      if (existing) {
        return prev.map((item) =>
          item.productEntityId === productEntityId ? { ...item, quantity: nextQty } : item,
        );
      }

      const product = productById.get(productEntityId);

      return [
        ...prev,
        {
          productEntityId,
          quantity: nextQty,
          selectedOptions: product ? fallbackSelectedOptions(product) : undefined,
          ...(product?.variantEntityId ? { variantEntityId: product.variantEntityId } : {}),
        },
      ];
    });
  }, [productById]);

  const setOptionValue = useCallback(
    (productEntityId: number, optionEntityId: number, optionValueEntityId: number) => {
      setSelected((prev) =>
        prev.map((item) => {
          if (item.productEntityId !== productEntityId) {
            return item;
          }

          const product = productById.get(productEntityId);
          const current = item.selectedOptions ?? (product ? fallbackSelectedOptions(product) : undefined);
          const multipleChoices = [...(current?.multipleChoices ?? [])];
          const index = multipleChoices.findIndex(
            (choice) => choice.optionEntityId === optionEntityId,
          );

          if (index >= 0) {
            multipleChoices[index] = { optionEntityId, optionValueEntityId };
          } else {
            multipleChoices.push({ optionEntityId, optionValueEntityId });
          }

          return {
            ...item,
            selectedOptions: { multipleChoices },
            variantEntityId: undefined,
          };
        }),
      );
    },
    [productById],
  );

  const addProductToKit = useCallback(
    async (productEntityId: number) => {
      setAddingProductId(productEntityId);

      try {
        const existing = productById.get(productEntityId);

        if (existing) {
          setQuantity(productEntityId, Math.max(1, existing.defaultQuantity));
          setSearchOpen(false);

          return;
        }

        const result = await getKitAddOnProduct(productEntityId);

        if (result.status === 'error') {
          toast.error(result.message);

          return;
        }

        ensureInCatalog(result.product);
        setSelected((prev) => {
          if (prev.some((item) => item.productEntityId === productEntityId && item.quantity > 0)) {
            return prev.map((item) =>
              item.productEntityId === productEntityId
                ? { ...item, quantity: Math.max(1, item.quantity) }
                : item,
            );
          }

          return [
            ...prev.filter((item) => item.productEntityId !== productEntityId),
            {
              productEntityId,
              quantity: result.product.defaultQuantity,
              selectedOptions: fallbackSelectedOptions(result.product),
              ...(result.product.variantEntityId
                ? { variantEntityId: result.product.variantEntityId }
                : {}),
            },
          ];
        });
        setSearchOpen(false);
        toast.success(t('addedToKit'));
      } finally {
        setAddingProductId(null);
      }
    },
    [ensureInCatalog, productById, setQuantity, t],
  );

  function handleAddKitToCart() {
    if (included.length === 0) {
      toast.error(t('Errors.emptyKit'));

      return;
    }

    startTransition(async () => {
      const result = await addKitToCart({
        kitName,
        items: buildKitItemsPayload(included, productById),
      });

      if (result?.status === 'error') {
        toast.error(result.message);
      }
    });
  }

  const persistKitToAccount = useCallback(
    (returnTo: string) => {
      if (included.length === 0) {
        toast.error(t('Errors.emptyKit'));

        return;
      }

      const items = buildKitItemsPayload(included, productById);

      startSaveTransition(async () => {
        const result = await saveKitToAccount({
          kitName,
          items,
          returnTo,
        });

        if (result.status === 'login_required') {
          try {
            sessionStorage.setItem(
              PENDING_SAVE_STORAGE_KEY,
              JSON.stringify({ kitName, items }),
            );
          } catch {
            // ignore storage failures
          }

          router.push(result.redirectTo);

          return;
        }

        if (result.status === 'error') {
          toast.error(result.message);

          return;
        }

        try {
          sessionStorage.removeItem(PENDING_SAVE_STORAGE_KEY);
        } catch {
          // ignore
        }

        toast.success(t('saveSuccess', { name: result.name }));
      });
    },
    [included, kitName, productById, router, t],
  );

  function handleSaveForLater() {
    const params = new URLSearchParams(searchParams.toString());
    params.set('resumeSaveKit', '1');
    const returnTo = `${pathname}?${params.toString()}`;

    persistKitToAccount(returnTo);
  }

  // Resume save after login redirect.
  useEffect(() => {
    if (searchParams.get('resumeSaveKit') !== '1') {
      return;
    }

    let pending: { kitName: string; items: ReturnType<typeof buildKitItemsPayload> } | null =
      null;

    try {
      const raw = sessionStorage.getItem(PENDING_SAVE_STORAGE_KEY);

      if (raw) {
        pending = JSON.parse(raw) as {
          kitName: string;
          items: ReturnType<typeof buildKitItemsPayload>;
        };
      }
    } catch {
      pending = null;
    }

    if (!pending?.items?.length) {
      return;
    }

    startSaveTransition(async () => {
      const result = await saveKitToAccount({
        kitName: pending.kitName,
        items: pending.items,
        returnTo: '/account/wishlists/',
      });

      try {
        sessionStorage.removeItem(PENDING_SAVE_STORAGE_KEY);
      } catch {
        // ignore
      }

      const params = new URLSearchParams(searchParams.toString());
      params.delete('resumeSaveKit');
      const nextQuery = params.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);

      if (result.status === 'login_required') {
        router.push(result.redirectTo);

        return;
      }

      if (result.status === 'error') {
        toast.error(result.message);

        return;
      }

      toast.success(t('saveSuccess', { name: result.name }));
    });
    // Intentionally once on mount when resume flag is present.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const term = searchTerm.trim();

    if (term.length < 2) {
      setSearchResults([]);

      return;
    }

    const timeoutId = window.setTimeout(() => {
      startSearchTransition(async () => {
        const formData = new FormData();
        formData.set('term', term);
        const result = await searchKitProducts(
          {
            lastResult: null,
            searchResults: null,
          },
          formData,
        );

        const productsGroup = result.searchResults?.find((group) => group.type === 'products');

        setSearchResults(productsGroup?.type === 'products' ? productsGroup.products : []);
      });
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchOpen, searchTerm]);

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

              const options = product.options ?? [];
              const selectedOptions =
                item.selectedOptions ?? fallbackSelectedOptions(product);

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
                    {!baseProductIds.has(product.productEntityId) ? (
                      <p className="mt-0.5 text-xs text-[var(--contrast-500)]">{t('addedLabel')}</p>
                    ) : null}
                    {product.price ? (
                      <div className="mt-0.5">
                        <PriceLabel className="text-sm" price={product.price} />
                      </div>
                    ) : null}
                    {options.length > 0 ? (
                      <div className="mt-2 space-y-2">
                        {options.map((option) => {
                          const currentValue =
                            selectedOptions?.multipleChoices.find(
                              (choice) => choice.optionEntityId === option.entityId,
                            )?.optionValueEntityId ??
                            option.values.find((value) => value.isDefault)?.entityId ??
                            option.values[0]?.entityId;

                          return (
                            <Select
                              key={option.entityId}
                              label={option.displayName}
                              name={`option-${product.productEntityId}-${option.entityId}`}
                              onValueChange={(value) =>
                                setOptionValue(
                                  product.productEntityId,
                                  option.entityId,
                                  Number(value),
                                )
                              }
                              options={option.values.map((value) => ({
                                label: value.label,
                                value: String(value.entityId),
                              }))}
                              value={currentValue != null ? String(currentValue) : undefined}
                              variant="rectangle"
                            />
                          );
                        })}
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

      {visibleSuggestions.length > 0 ? (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">{t('suggestedTitle')}</h3>
          <p className="text-xs text-[var(--contrast-500)]">{t('suggestedSubtitle')}</p>
          <ul className="space-y-2">
            {visibleSuggestions.map((product) => (
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
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-medium">{product.title}</p>
                  {product.price ? (
                    <PriceLabel className="text-xs" price={product.price} />
                  ) : null}
                </div>
                <Button
                  disabled={addingProductId === product.productEntityId}
                  loading={addingProductId === product.productEntityId}
                  onClick={() => {
                    void addProductToKit(product.productEntityId);
                  }}
                  size="x-small"
                  type="button"
                  variant="secondary"
                >
                  {t('addProduct')}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div>
        <Button
          className="w-full"
          onClick={() => setSearchOpen(true)}
          type="button"
          variant="secondary"
        >
          {t('searchAddProduct')}
        </Button>
      </div>

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
        <Button
          className="w-full"
          disabled={included.length === 0 || isSaving}
          loading={isSaving}
          onClick={handleSaveForLater}
          type="button"
          variant="secondary"
        >
          {t('saveForLater')}
        </Button>
      </div>

      <Modal
        isOpen={searchOpen}
        setOpen={(open) => {
          setSearchOpen(open);

          if (!open) {
            setSearchTerm('');
            setSearchResults([]);
          }
        }}
        title={t('searchModalTitle')}
      >
        <div className="space-y-4">
          <input
            autoFocus
            className="w-full rounded-lg border border-[var(--contrast-200)] px-3 py-2 text-sm"
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={t('searchPlaceholder')}
            type="search"
            value={searchTerm}
          />
          {isSearching ? (
            <p className="text-sm text-[var(--contrast-500)]">{t('searching')}</p>
          ) : null}
          {searchResults.length > 0 ? (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {searchResults.map((product) => {
                const entityId = Number(product.id);

                return (
                  <li
                    className="flex items-center gap-3 rounded-lg border border-[var(--contrast-100)] p-2"
                    key={product.id}
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
                      disabled={!Number.isFinite(entityId) || addingProductId === entityId}
                      loading={addingProductId === entityId}
                      onClick={() => {
                        void addProductToKit(entityId);
                      }}
                      size="x-small"
                      type="button"
                      variant="secondary"
                    >
                      {t('addProduct')}
                    </Button>
                  </li>
                );
              })}
            </ul>
          ) : searchTerm.trim().length >= 2 && !isSearching ? (
            <p className="text-sm text-[var(--contrast-500)]">{t('searchEmpty')}</p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
