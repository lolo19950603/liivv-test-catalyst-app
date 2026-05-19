'use client';

import { clsx } from 'clsx';
import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';

import { ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';

import { headingWithLastWordHighlight } from '../diabetes-care-faq/shared';

import {
  FEATURED_COLLECTIONS_ARCHIVE_STYLE,
  FEATURED_COLLECTIONS_SECTION_ID,
} from './archive-styles';
import { DiabetesCareCatalogProductCard } from './catalog-product-card';

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

export function DiabetesCareFeaturedCollections({
  className,
  eyebrow,
  heading,
  description,
  collections,
}: DiabetesCareFeaturedCollectionsProps) {
  const reactId = useId().replace(/:/g, '');
  const tabs = useMemo(() => {
    const raw = collections != null && collections.length > 0 ? collections : DEFAULT_COLLECTIONS;
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

    if (btn == null) {
      return;
    }

    // `scrollIntoView` also scrolls the **window** to bring the tab into view, which jumps the
    // page to this section on every load/refresh. Only adjust the horizontal tab strip.
    const stripRect = strip.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    const btnCenterInStrip = btnRect.left - stripRect.left + strip.scrollLeft + btnRect.width / 2;
    const maxScroll = Math.max(0, strip.scrollWidth - strip.clientWidth);
    const nextLeft = Math.min(Math.max(0, btnCenterInStrip - strip.clientWidth / 2), maxScroll);

    strip.scrollTo({ left: nextLeft, behavior: 'smooth' });
  }, [clampedIndex]);

  const eyebrowText = eyebrow?.trim() ?? 'Your routine is personal';
  const headingText = heading?.trim() ?? 'What Works, Every Day';
  const body = description?.trim() ?? '';

  const sliderDomId = `Slider-fc-${reactId}-${String(clampedIndex)}`;

  return (
    <div
      className={clsx('diabetes-care-featured-collections max-w-full overflow-x-hidden', className)}
    >
      <div className="shopify-section featured-collections" id={FEATURED_COLLECTIONS_SECTION_ID}>
        <style dangerouslySetInnerHTML={{ __html: FEATURED_COLLECTIONS_ARCHIVE_STYLE }} />
        <div className="section section--padding section--rounded relative">
          <div className="page-width relative">
            <div className="title-wrapper z-1 relative flex flex-col gap-4 text-left leading-none md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4">
                <p className="heading subtext-lg tracking-none font-medium normal-case leading-none">
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

            <ScrollReveal className="tab-list flex justify-between gap-6" delayMs={100}>
              <div className="scroll-shadow grid overflow-hidden">
                <div className="scroll-area grid">
                  <div
                    className="flex gap-4 overflow-x-auto scroll-smooth"
                    ref={tabStripRef}
                    role="tablist"
                  >
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

              <div className="indicators gap-2d5 hidden lg:flex" data-index={clampedIndex}>
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
            </ScrollReveal>

            <ScrollReveal delayMs={120}>
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
                    className="slider slider--desktop slider--tablet grid"
                    id={
                      index === clampedIndex
                        ? sliderDomId
                        : `Slider-fc-${reactId}-panel-${String(index)}`
                    }
                    tabIndex={0}
                  >
                    <div className="product-grid card-grid card-grid--4 mobile:card-grid--1 initialized grid max-w-full overflow-x-auto scroll-smooth">
                      {rows.length === 0 ? (
                        <p className="subtext-md col-span-full py-8 text-center text-contrast-500">
                          Search and add catalog products for this tab in Makeswift.
                        </p>
                      ) : (
                        rows.map((p, pi) => (
                          <DiabetesCareCatalogProductCard
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
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
