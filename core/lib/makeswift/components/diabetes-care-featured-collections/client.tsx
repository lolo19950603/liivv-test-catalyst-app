'use client';

import { clsx } from 'clsx';
import { useLocale } from 'next-intl';
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import useSWR from 'swr';

import type { Product } from '@/vibes/soul/primitives/product-card';
import {
  BcProductSchema,
  useBcProductToVibesProduct,
} from '~/lib/makeswift/utils/use-bc-product-to-vibes-product/use-bc-product-to-vibes-product';

import {
  FEATURED_COLLECTIONS_ARCHIVE_STYLE,
  FEATURED_COLLECTIONS_SECTION_ID,
} from './archive-styles';

export interface DiabetesCareFeaturedCollectionProduct {
  /** BigCommerce catalog product id (Makeswift combobox). */
  entityId?: unknown;
}

export interface DiabetesCareFeaturedCollectionTab {
  tabLabel?: string;
  products?: DiabetesCareFeaturedCollectionProduct[];
}

export interface DiabetesCareFeaturedCollectionsProps {
  className?: string;
  /** Small overline above the main heading (export: “Your routine is personal”). */
  eyebrow?: string;
  /** Main heading; last whitespace-separated token gets the half-underline accent. */
  heading?: string;
  description?: string;
  collections?: DiabetesCareFeaturedCollectionTab[];
}

const DEFAULT_COLLECTIONS: DiabetesCareFeaturedCollectionTab[] = [
  { tabLabel: 'The Basics', products: [] },
  { tabLabel: 'Continuous Glucose Monitors', products: [] },
  { tabLabel: 'Pump Supplies', products: [] },
  { tabLabel: 'Insulin', products: [] },
  { tabLabel: 'Skin Health', products: [] },
];

function highlightedLastWord(word: string): ReactNode {
  return (
    <em
      className="highlighted-text animated relative not-italic"
      data-style="half_text"
      {...{ is: 'highlighted-text' }}
    >
      {word}
    </em>
  );
}

function headingWithLastWordHighlight(heading: string): ReactNode {
  const tokens = heading.trim().split(/\s+/).filter((t) => t.length > 0);

  if (tokens.length === 0) {
    return null;
  }

  if (tokens.length === 1) {
    return highlightedLastWord(tokens[0] ?? '');
  }

  const last = tokens[tokens.length - 1] ?? '';
  const before = tokens.slice(0, -1).join(' ');

  return (
    <>
      {before}{' '}
      {highlightedLastWord(last)}
    </>
  );
}

function IconChevronLeft() {
  return (
    <svg
      className="icon icon-chevron-left icon-md transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M14 6L8 12L14 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconChevronRight() {
  return (
    <svg
      className="icon icon-chevron-right icon-md transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10 6L16 12L10 18" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function tabHasLabel(tab: DiabetesCareFeaturedCollectionTab): boolean {
  return (tab.tabLabel?.trim() ?? '').length > 0;
}

function productHasContent(p: DiabetesCareFeaturedCollectionProduct): boolean {
  return String(p.entityId ?? '').trim().length > 0;
}

function formatProductPrice(price: Product['price']): string {
  if (price == null) {
    return '';
  }

  if (typeof price === 'string') {
    return price;
  }

  if (price.type === 'range') {
    return `${price.minValue} – ${price.maxValue}`;
  }

  if (price.type === 'sale') {
    return price.currentValue;
  }

  return '';
}

function FeaturedCollectionCatalogProduct({ entityId }: { entityId?: unknown }) {
  const id = String(entityId ?? '').trim();
  const locale = useLocale();
  const bcToVibes = useBcProductToVibesProduct();

  const { data, error, isLoading } = useSWR(
    id.length > 0 ? `/api/products/${id}?locale=${locale}` : null,
    async (url: string) => {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Product request failed: ${String(response.status)}`);
      }

      return BcProductSchema.parse(await response.json());
    },
  );

  if (id.length === 0) {
    return null;
  }

  const cardShell = (children: ReactNode) => (
    <div
      className="card product-card product-card--card relative flex flex-col leading-none"
      style={
        {
          '--motion-translateY': '0px',
          opacity: 1,
          visibility: 'visible',
        } as CSSProperties
      }
    >
      {children}
    </div>
  );

  if (isLoading && data == null) {
    return cardShell(
      <>
        <div className="product-card__media relative h-auto">
          <div className="media media--square relative block aspect-square animate-pulse overflow-hidden bg-zinc-200" />
        </div>
        <div className="product-card__content flex w-full grow flex-col justify-start gap-3 p-4 text-center">
          <div className="mx-auto h-4 w-[75%] max-w-[12rem] animate-pulse rounded bg-zinc-200" />
          <div className="mx-auto h-4 w-1/2 max-w-[8rem] animate-pulse rounded bg-zinc-200" />
        </div>
      </>,
    );
  }

  if (error != null || data == null) {
    return cardShell(
      <div className="product-card__content p-4 text-center">
        <p className="text-sm text-red-800">Could not load this product.</p>
      </div>,
    );
  }

  const vibes = bcToVibes(data);
  const href = vibes.href?.trim() ?? '#';
  const img = vibes.image?.src?.trim() ?? '';
  const title = vibes.title?.trim() ?? 'Product';
  const vendor = vibes.subtitle?.trim() ?? '';
  const vendorHref = data.brand?.path?.trim() ?? '';
  const price = formatProductPrice(vibes.price);

  return cardShell(
    <>
      <div className="product-card__media relative h-auto">
        {img.length > 0 ? (
          <a aria-hidden className="media media--square relative block overflow-hidden" href={href} tabIndex={-1}>
            <img
              alt={vibes.image?.alt ?? ''}
              className="aspect-square w-full object-cover"
              height={2000}
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              src={img}
              width={2000}
            />
          </a>
        ) : null}
      </div>
      <div className="product-card__content flex w-full grow flex-col justify-start text-center">
        {vendor.length > 0 ? (
          <div className="product-card__top w-full">
            <a
              className="caption reversed-link uppercase leading-none tracking-widest"
              href={vendorHref.length > 0 ? vendorHref : '#'}
              title={vendor}
            >
              <span className="sr-only">Vendor:</span>
              {vendor}
            </a>
          </div>
        ) : null}
        <div className="product-card__details flex w-full flex-col items-baseline gap-2 lg:flex-row">
          <p className="grow">
            <a className="product-card__title reversed-link text-base-xl font-medium leading-tight" href={href}>
              {title}
            </a>
          </p>
          {price.length > 0 ? (
            <div className="flex flex-col gap-2">
              <div className="price flex flex-wrap gap-2 md:gap-1d5 lg:flex-col lg:items-end">
                <span className="price__regular whitespace-nowrap">{price}</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </>,
  );
}

export function DiabetesCareFeaturedCollections({
  className,
  eyebrow,
  heading,
  description,
  collections,
}: DiabetesCareFeaturedCollectionsProps) {
  const reactId = useId().replace(/:/g, '');
  const tabs = useMemo(() => {
    const raw =
      collections != null && collections.length > 0 ? collections : DEFAULT_COLLECTIONS;
    const labelled = raw.filter(tabHasLabel);

    return labelled.length > 0 ? labelled : DEFAULT_COLLECTIONS;
  }, [collections]);

  const safeTabs = tabs;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const clampedIndex = Math.min(selectedIndex, Math.max(0, safeTabs.length - 1));
  const tabStripRef = useRef<HTMLDivElement>(null);

  const goToAdjacentTab = (dir: -1 | 1) => {
    if (safeTabs.length <= 1) {
      return;
    }

    setSelectedIndex((i) => {
      const n = safeTabs.length;

      return (i + dir + n) % n;
    });
  };

  useEffect(() => {
    const strip = tabStripRef.current;

    if (strip == null) {
      return;
    }

    const btn = strip.querySelector<HTMLElement>(`[data-fc-tab-index="${String(clampedIndex)}"]`);

    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [clampedIndex]);

  const eyebrowText = eyebrow?.trim() ?? 'Your routine is personal';
  const headingText = heading?.trim() ?? 'What Works, Every Day';
  const body = description?.trim() ?? '';

  const sliderDomId = `Slider-fc-${reactId}-${String(clampedIndex)}`;

  return (
    <div className={clsx('diabetes-care-featured-collections max-w-full overflow-x-hidden', className)}>
      <div
        className="shopify-section featured-collections"
        id={FEATURED_COLLECTIONS_SECTION_ID}
      >
        <style dangerouslySetInnerHTML={{ __html: FEATURED_COLLECTIONS_ARCHIVE_STYLE }} />
        <div className="section section--padding section--rounded relative">
          <div className="page-width relative">
            <div className="title-wrapper relative z-1 flex flex-col gap-4 text-left leading-none md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4">
                <p className="heading normal-case font-medium subtext-lg leading-none tracking-none">
                  {eyebrowText}
                </p>
                <h2 className="heading title-md">{headingWithLastWordHighlight(headingText)}</h2>
                {body.length > 0 ? (
                  <div className="description rte subtext-md leading-normal">
                    {body
                      .split(/\n+/)
                      .map((p) => p.trim())
                      .filter((p) => p.length > 0)
                      .map((p, i) => (
                        <p key={`desc-${String(i)}`}>{p}</p>
                      ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="tab-list flex justify-between gap-6">
              <div className="scroll-shadow grid overflow-hidden">
                <div className="scroll-area grid">
                  <div className="flex gap-4 overflow-x-auto scroll-smooth" ref={tabStripRef} role="tablist">
                    {safeTabs.map((tab, index) => {
                      const label = tab.tabLabel?.trim() ?? `Tab ${String(index + 1)}`;
                      const selected = index === clampedIndex;
                      const panelId = `TabPanel-fc-${reactId}-${String(index)}`;

                      return (
                        <button
                          aria-controls={panelId}
                          aria-selected={selected}
                          className={clsx(
                            'tab__item button whitespace-nowrap',
                            selected ? 'button--primary' : 'button--secondary',
                          )}
                          data-fc-tab-index={index}
                          disabled={selected}
                          key={`tab-${reactId}-${String(index)}`}
                          onClick={() => {
                            setSelectedIndex(index);
                          }}
                          role="tab"
                          type="button"
                        >
                          {selected ? (
                            <span className="btn-fill sf-hidden" data-fill />
                          ) : (
                            <span className="btn-fill" data-fill />
                          )}
                          <span className="btn-text">{label}</span>
                          <span className="btn-loader">
                            <span />
                            <span />
                            <span />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="indicators hidden gap-2d5 lg:flex" data-index={clampedIndex}>
                <button
                  aria-controls={sliderDomId}
                  aria-label="Previous collection"
                  className="button button--secondary"
                  disabled={safeTabs.length <= 1}
                  onClick={() => {
                    goToAdjacentTab(-1);
                  }}
                  type="button"
                >
                  <span className="btn-fill sf-hidden" data-fill />
                  <span className="btn-text">
                    <IconChevronLeft />
                  </span>
                  <span className="btn-loader">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
                <button
                  aria-controls={sliderDomId}
                  aria-label="Next collection"
                  className="button button--secondary"
                  disabled={safeTabs.length <= 1}
                  onClick={() => {
                    goToAdjacentTab(1);
                  }}
                  type="button"
                >
                  <span className="btn-fill" data-fill />
                  <span className="btn-text">
                    <IconChevronRight />
                  </span>
                  <span className="btn-loader">
                    <span />
                    <span />
                    <span />
                  </span>
                </button>
              </div>
            </div>

            {safeTabs.map((tab, index) => {
              const panelId = `TabPanel-fc-${reactId}-${String(index)}`;
              const rows = (tab.products ?? []).filter(productHasContent);
              const hidden = index !== clampedIndex;

              return (
                <div
                  className={hidden ? 'hidden' : undefined}
                  hidden={hidden}
                  id={panelId}
                  key={panelId}
                  role="tabpanel"
                >
                  <div
                    className="grid slider slider--desktop slider--tablet"
                    id={index === clampedIndex ? sliderDomId : `Slider-fc-${reactId}-panel-${String(index)}`}
                    tabIndex={0}
                  >
                    <div className="motion-list product-grid card-grid card-grid--4 mobile:card-grid--1 grid max-w-full initialized overflow-x-auto scroll-smooth">
                      {rows.length === 0 ? (
                        <p className="text-contrast-500 col-span-full py-8 text-center subtext-md">
                          Search and add catalog products for this tab in Makeswift.
                        </p>
                      ) : (
                        rows.map((p, pi) => (
                          <FeaturedCollectionCatalogProduct
                            entityId={p.entityId}
                            key={`${panelId}-p-${String(pi)}`}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
