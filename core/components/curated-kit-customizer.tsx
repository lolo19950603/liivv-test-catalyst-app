'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePathname, useRouter } from '~/i18n/routing';

import { Select } from '@/vibes/soul/form/select';
import { PriceLabel, type Price } from '@/vibes/soul/primitives/price-label';
import { ArchiveButton } from '@/vibes/soul/primitives/archive-button';
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

function KitQuantityStepper({
  quantity,
  decrementLabel,
  incrementLabel,
  onDecrement,
  onIncrement,
}: {
  quantity: number;
  decrementLabel: string;
  incrementLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
}) {
  return (
    <div className="quantity relative inline-flex w-fit shrink-0">
      <button
        aria-label={decrementLabel}
        className="quantity__button"
        onClick={onDecrement}
        type="button"
      >
        <ChevronLeft className="icon icon-chevron-left icon-sm stroke-2" size={16} strokeWidth={2} />
      </button>
      <span className="quantity__input flex min-w-[2.5rem] items-center justify-center text-center text-sm font-medium sm:min-w-[3rem] sm:text-base">
        {quantity}
      </span>
      <button
        aria-label={incrementLabel}
        className="quantity__button"
        onClick={onIncrement}
        type="button"
      >
        <ChevronRight
          className="icon icon-chevron-right icon-sm stroke-2"
          size={16}
          strokeWidth={2}
        />
      </button>
    </div>
  );
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
    <div className="liivv-kit-customizer">
      <header className="liivv-kit-customizer__intro">
        <p className="liivv-kit-customizer__eyebrow">{t('eyebrow')}</p>
        <p className="liivv-kit-customizer__subtitle">{t('subtitle')}</p>
      </header>

      <section aria-labelledby="kit-included-heading" className="liivv-kit-customizer__panel">
        <div className="liivv-kit-customizer__panel-head">
          <h2 className="liivv-kit-customizer__panel-title" id="kit-included-heading">
            {t('includedTitle')}
          </h2>
          <span className="liivv-kit-customizer__count">
            {t('includedCount', { count: included.length })}
          </span>
        </div>

        {included.length === 0 ? (
          <p className="liivv-kit-customizer__empty">{t('allRemoved')}</p>
        ) : (
          <ul className="liivv-kit-customizer__items">
            {included.map((item) => {
              const product = productById.get(item.productEntityId);

              if (!product) {
                return null;
              }

              const options = product.options ?? [];
              const selectedOptions =
                item.selectedOptions ?? fallbackSelectedOptions(product);
              const lineTotal = product.unitPrice * item.quantity;
              const isAddOn = !baseProductIds.has(product.productEntityId);

              return (
                <li className="liivv-kit-item" key={item.productEntityId}>
                  <Link className="liivv-kit-item__media" href={product.href}>
                    {product.image ? (
                      <Image
                        alt={product.image.alt}
                        className="object-cover"
                        fill
                        sizes="80px"
                        src={product.image.src}
                      />
                    ) : (
                      <span aria-hidden className="liivv-kit-item__media-fallback" />
                    )}
                  </Link>

                  <div className="liivv-kit-item__body">
                    <div className="liivv-kit-item__top">
                      <div className="liivv-kit-item__copy">
                        {isAddOn ? (
                          <span className="liivv-kit-item__badge">{t('addedLabel')}</span>
                        ) : null}
                        <Link className="liivv-kit-item__title" href={product.href}>
                          {product.title}
                        </Link>
                        {product.price ? (
                          <div className="liivv-kit-item__unit-price">
                            <PriceLabel className="text-sm" price={product.price} />
                          </div>
                        ) : null}
                      </div>
                      <p className="liivv-kit-item__line-total">
                        {format.number(lineTotal, {
                          style: 'currency',
                          currency: currencyCode,
                        })}
                      </p>
                    </div>

                    {options.length > 0 ? (
                      <div className="liivv-kit-item__options">
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

                    <div className="liivv-kit-item__actions">
                      <KitQuantityStepper
                        decrementLabel={t('decrement')}
                        incrementLabel={t('increment')}
                        onDecrement={() => setQuantity(item.productEntityId, item.quantity - 1)}
                        onIncrement={() => setQuantity(item.productEntityId, item.quantity + 1)}
                        quantity={item.quantity}
                      />
                      <button
                        className="liivv-kit-item__remove"
                        onClick={() => setQuantity(item.productEntityId, 0)}
                        type="button"
                      >
                        <X aria-hidden size={14} strokeWidth={2} />
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
        <section aria-labelledby="kit-removed-heading" className="liivv-kit-customizer__side">
          <div className="liivv-kit-customizer__side-head">
            <h3 className="liivv-kit-customizer__side-title" id="kit-removed-heading">
              {t('removedTitle')}
            </h3>
            <p className="liivv-kit-customizer__side-subtitle">{t('removedSubtitle')}</p>
          </div>
          <ul className="liivv-kit-side-list">
            {removed.map((product) => (
              <li className="liivv-kit-side-row" key={product.productEntityId}>
                <div className="liivv-kit-side-row__media">
                  {product.image ? (
                    <Image
                      alt={product.image.alt}
                      className="object-cover"
                      fill
                      sizes="48px"
                      src={product.image.src}
                    />
                  ) : null}
                </div>
                <p className="liivv-kit-side-row__title">{product.title}</p>
                <ArchiveButton
                  className="liivv-kit-side-row__cta shrink-0"
                  onClick={() => setQuantity(product.productEntityId, product.defaultQuantity)}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  {t('addBack')}
                </ArchiveButton>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {visibleSuggestions.length > 0 ? (
        <section aria-labelledby="kit-suggested-heading" className="liivv-kit-customizer__side">
          <div className="liivv-kit-customizer__side-head">
            <h3 className="liivv-kit-customizer__side-title" id="kit-suggested-heading">
              {t('suggestedTitle')}
            </h3>
            <p className="liivv-kit-customizer__side-subtitle">{t('suggestedSubtitle')}</p>
          </div>
          <ul className="liivv-kit-side-list">
            {visibleSuggestions.map((product) => (
              <li className="liivv-kit-side-row" key={product.productEntityId}>
                <div className="liivv-kit-side-row__media">
                  {product.image ? (
                    <Image
                      alt={product.image.alt}
                      className="object-cover"
                      fill
                      sizes="48px"
                      src={product.image.src}
                    />
                  ) : null}
                </div>
                <div className="liivv-kit-side-row__copy">
                  <p className="liivv-kit-side-row__title">{product.title}</p>
                  {product.price ? (
                    <PriceLabel className="text-xs" price={product.price} />
                  ) : null}
                </div>
                <ArchiveButton
                  className="liivv-kit-side-row__cta shrink-0"
                  disabled={addingProductId === product.productEntityId}
                  loading={addingProductId === product.productEntityId}
                  onClick={() => {
                    void addProductToKit(product.productEntityId);
                  }}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <Plus aria-hidden size={14} strokeWidth={2} />
                  {t('addProduct')}
                </ArchiveButton>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <button
        className="liivv-kit-customizer__search-trigger"
        onClick={() => setSearchOpen(true)}
        type="button"
      >
        <Search aria-hidden size={16} strokeWidth={2} />
        <span>{t('searchAddProduct')}</span>
      </button>

      <div className="liivv-kit-customizer__checkout">
        <div className="liivv-kit-customizer__total-row">
          <span className="liivv-kit-customizer__total-label">{t('runningTotal')}</span>
          <span className="liivv-kit-customizer__total-value">
            {format.number(runningTotal, { style: 'currency', currency: currencyCode })}
          </span>
        </div>
        <div className="liivv-kit-customizer__checkout-actions">
          <ArchiveButton
            className="w-full"
            disabled={included.length === 0 || isPending}
            loading={isPending}
            onClick={handleAddKitToCart}
            size="fixed"
            type="button"
            variant="primary"
            {...{ is: 'hover-button' }}
          >
            {t('addKitToCart')}
          </ArchiveButton>
          <ArchiveButton
            className="w-full"
            disabled={included.length === 0 || isSaving}
            loading={isSaving}
            onClick={handleSaveForLater}
            size="fixed"
            type="button"
            variant="secondary"
          >
            {t('saveForLater')}
          </ArchiveButton>
        </div>
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
        <div className="liivv-kit-search">
          <label className="liivv-kit-search__field">
            <Search aria-hidden className="liivv-kit-search__icon" size={16} strokeWidth={2} />
            <input
              autoFocus
              className="liivv-kit-search__input"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder={t('searchPlaceholder')}
              type="search"
              value={searchTerm}
            />
          </label>
          {isSearching ? (
            <p className="liivv-kit-search__status">{t('searching')}</p>
          ) : null}
          {searchResults.length > 0 ? (
            <ul className="liivv-kit-search__results">
              {searchResults.map((product) => {
                const entityId = Number(product.id);

                return (
                  <li className="liivv-kit-side-row" key={product.id}>
                    <div className="liivv-kit-side-row__media">
                      {product.image ? (
                        <Image
                          alt={product.image.alt}
                          className="object-cover"
                          fill
                          sizes="48px"
                          src={product.image.src}
                        />
                      ) : null}
                    </div>
                    <p className="liivv-kit-side-row__title">{product.title}</p>
                    <ArchiveButton
                      className="liivv-kit-side-row__cta shrink-0"
                      disabled={!Number.isFinite(entityId) || addingProductId === entityId}
                      loading={addingProductId === entityId}
                      onClick={() => {
                        void addProductToKit(entityId);
                      }}
                      size="sm"
                      type="button"
                      variant="secondary"
                    >
                      <Plus aria-hidden size={14} strokeWidth={2} />
                      {t('addProduct')}
                    </ArchiveButton>
                  </li>
                );
              })}
            </ul>
          ) : searchTerm.trim().length >= 2 && !isSearching ? (
            <p className="liivv-kit-search__status">{t('searchEmpty')}</p>
          ) : null}
        </div>
      </Modal>
    </div>
  );
}
