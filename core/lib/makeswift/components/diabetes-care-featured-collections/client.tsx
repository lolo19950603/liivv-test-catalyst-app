'use client';

import { clsx } from 'clsx';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  DC_CAROUSEL_HOST_CLASS,
  DC_SECTION_ROOT_CLASS,
} from '~/lib/makeswift/diabetes-care-mobile-classes';
import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { ARCHIVE_SAGE_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolvePlainTextColor } from '~/lib/makeswift/utils/heading-accent-color';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';

import { initShopifyButtonFillHover } from '~/lib/archived-pages/init-shopify-button-fill-hover';

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

export type FeaturedCollectionsBodyProps = BodyTextProps & {
  text?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type DiabetesCareFeaturedCollectionsProps = {
  className?: string;
  background?: SectionBackgroundProps;
  roundedTop?: boolean;
  eyebrow?: {
    text?: string;
    textColor?: string;
    textColorHex?: string;
    fontSize?: number;
    fontSizeMobile?: number;
  };
  heading?: HeadingWithHighlightProps;
  body?: FeaturedCollectionsBodyProps;
  /** @deprecated Use `body.text`. */
  description?: string;
  collections?: DiabetesCareFeaturedCollectionTab[];
  /** @deprecated Use `body` popover colors. */
  bodyText?: BodyTextProps;
};

function mergeTypographyStyle(
  color?: string,
  fontSize?: string,
): CSSProperties | undefined {
  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

function resolveFeaturedBody(props: {
  body?: FeaturedCollectionsBodyProps;
  description?: string;
  bodyText?: BodyTextProps;
}): { text: string; color?: string; fontSize?: string } {
  const group = props.body;

  if (group != null && typeof group === 'object') {
    return {
      text: group.text?.trim() ?? '',
      color: resolveBodyTextColor(group),
      fontSize: resolveHeadingFontSizeCss(group.fontSize, group.fontSizeMobile),
    };
  }

  return {
    text: props.description?.trim() ?? '',
    color: resolveBodyTextColor(props.bodyText),
    fontSize: undefined,
  };
}

export const DEFAULT_FEATURED_COLLECTION_TABS: DiabetesCareFeaturedCollectionTab[] = [
  { tabLabel: 'The Basics', products: [] },
  { tabLabel: 'Continuous Glucose Monitors', products: [] },
  { tabLabel: 'Pump Supplies', products: [] },
  { tabLabel: 'Insulin', products: [] },
  { tabLabel: 'Skin Health', products: [] },
];

function resolveCollectionTabs(
  collections?: DiabetesCareFeaturedCollectionTab[],
): DiabetesCareFeaturedCollectionTab[] {
  const raw =
    collections != null && collections.length > 0
      ? collections
      : DEFAULT_FEATURED_COLLECTION_TABS;

  const withLabels = raw.map((tab, index) => {
    const trimmed = tab.tabLabel?.trim() ?? '';
    const fallback = DEFAULT_FEATURED_COLLECTION_TABS[index]?.tabLabel ?? `Tab ${String(index + 1)}`;

    return {
      ...tab,
      tabLabel: trimmed.length > 0 ? trimmed : fallback,
    };
  });

  if (withLabels.length === 0) {
    return DEFAULT_FEATURED_COLLECTION_TABS;
  }

  const labels = withLabels.map((tab) => tab.tabLabel?.trim() ?? '');

  /* Makeswift list items all inherit register defaultValue "The Basics". */
  if (labels.length > 1 && new Set(labels).size === 1) {
    return withLabels.map((tab, index) => ({
      ...tab,
      tabLabel:
        DEFAULT_FEATURED_COLLECTION_TABS[index]?.tabLabel ??
        tab.tabLabel ??
        `Tab ${String(index + 1)}`,
    }));
  }

  return withLabels;
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

const MOBILE_CAROUSEL_MQ = '(max-width: 1023px)';

function CarouselArrowButton({
  ariaLabel,
  controls,
  direction,
  disabled,
  onClick,
  variant = 'default',
}: {
  ariaLabel: string;
  controls?: string;
  direction: 'prev' | 'next';
  disabled: boolean;
  onClick: () => void;
  variant?: 'default' | 'overlay';
}) {
  if (variant === 'overlay') {
    return (
      <button
        aria-controls={controls}
        aria-label={ariaLabel}
        className="fc-carousel-arrow-overlay flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/45 bg-white/50 text-current shadow-md backdrop-blur-[2px] transition enabled:hover:bg-white/70 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          onClick();
        }}
        onPointerDown={(event) => {
          event.stopPropagation();
        }}
        type="button"
      >
        {direction === 'prev' ? <IconChevronLeft /> : <IconChevronRight />}
      </button>
    );
  }

  return (
    <button
      aria-controls={controls}
      aria-label={ariaLabel}
      className="button button--secondary"
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      type="button"
    >
      <span className="btn-fill sf-hidden" data-fill />
      <span className="btn-text">
        {direction === 'prev' ? <IconChevronLeft /> : <IconChevronRight />}
      </span>
      <span className="btn-loader">
        <span />
        <span />
        <span />
      </span>
    </button>
  );
}

/** Debounced scroll-end sync for one-item-at-a-time horizontal carousels (mobile). */
function useCarouselScrollSync(
  stripRef: RefObject<HTMLDivElement | null>,
  itemCount: number,
  onIndexChange: (index: number) => void,
  enabled: boolean,
) {
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const setItemRef = useCallback((el: HTMLElement | null, index: number) => {
    itemRefs.current[index] = el;
  }, []);

  const resolveIndexFromScroll = useCallback(() => {
    const strip = stripRef.current;

    if (!strip || itemCount === 0) {
      return;
    }

    const center = strip.scrollLeft + strip.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < itemCount; i += 1) {
      const item = itemRefs.current[i];

      if (item) {
        const mid = item.offsetLeft + item.offsetWidth / 2;
        const d = Math.abs(center - mid);

        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
    }

    onIndexChange(best);
  }, [itemCount, onIndexChange, stripRef]);

  useEffect(() => {
    const strip = stripRef.current;

    if (!enabled || !strip || itemCount <= 1) {
      return;
    }

    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const finish = () => {
      clearTimeout(idleTimer);
      idleTimer = undefined;
      resolveIndexFromScroll();
    };

    const onScroll = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(finish, 220);
    };

    const onScrollEnd = () => {
      finish();
    };

    strip.addEventListener('scroll', onScroll, { passive: true });
    strip.addEventListener('scrollend', onScrollEnd);

    return () => {
      clearTimeout(idleTimer);
      strip.removeEventListener('scroll', onScroll);
      strip.removeEventListener('scrollend', onScrollEnd);
    };
  }, [enabled, itemCount, resolveIndexFromScroll, stripRef]);

  const scrollItemIntoView = useCallback(
    (index: number) => {
      itemRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    },
    [],
  );

  return { setItemRef, scrollItemIntoView };
}

function productHasContent(p: DiabetesCareFeaturedCollectionProduct): boolean {
  return String(p.entityId ?? '').trim().length > 0;
}

export function DiabetesCareFeaturedCollections({
  className,
  background,
  roundedTop = true,
  eyebrow,
  heading,
  body,
  description,
  collections,
  bodyText,
}: DiabetesCareFeaturedCollectionsProps) {
  const headingResolved = resolveHeadingTypography(heading);
  const eyebrowStyle = mergeTypographyStyle(
    resolvePlainTextColor({
      textColor: eyebrow?.textColor,
      textColorHex: eyebrow?.textColorHex,
    }),
    resolveHeadingFontSizeCss(eyebrow?.fontSize, eyebrow?.fontSizeMobile),
  );
  const bodyResolved = resolveFeaturedBody({ body, description, bodyText });
  const bodyStyle = mergeTypographyStyle(bodyResolved.color, bodyResolved.fontSize);
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: FEATURED_COLLECTIONS_SECTION_ID,
    sectionCss: FEATURED_COLLECTIONS_ARCHIVE_STYLE,
    background,
    highlight: heading,
    defaultBackgroundChannels: ARCHIVE_SAGE_BACKGROUND_CHANNELS,
  });
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;
  const reactId = useId().replace(/:/g, '');
  const tabs = useMemo(() => resolveCollectionTabs(collections), [collections]);

  const safeTabs = tabs;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [productIndex, setProductIndex] = useState(0);
  const clampedIndex = Math.min(selectedIndex, Math.max(0, safeTabs.length - 1));
  const tabStripRef = useRef<HTMLDivElement>(null);
  const productStripRef = useRef<HTMLDivElement>(null);

  const activeProducts = useMemo(
    () => (safeTabs[clampedIndex]?.products ?? []).filter(productHasContent),
    [safeTabs, clampedIndex],
  );
  const productCount = activeProducts.length;
  const clampedProductIndex = Math.min(productIndex, Math.max(0, productCount - 1));
  const [isMobileCarouselView, setIsMobileCarouselView] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_CAROUSEL_MQ);
    const update = () => {
      setIsMobileCarouselView(mq.matches);
    };

    update();
    mq.addEventListener('change', update);

    return () => {
      mq.removeEventListener('change', update);
    };
  }, []);

  const productScrollSyncEnabled = productCount > 1;

  const selectTab = useCallback(
    (index: number) => {
      if (index < 0 || index >= safeTabs.length) {
        return;
      }

      setSelectedIndex(index);
    },
    [safeTabs.length],
  );

  const { setItemRef: setTabItemRef, scrollItemIntoView: scrollTabIntoView } =
    useCarouselScrollSync(
      tabStripRef,
      safeTabs.length,
      selectTab,
      isMobileCarouselView && safeTabs.length > 1,
    );

  const selectProduct = useCallback(
    (index: number) => {
      if (index < 0 || index >= productCount) {
        return;
      }

      setProductIndex(index);
    },
    [productCount],
  );

  const { setItemRef: setProductItemRef } = useCarouselScrollSync(
      productStripRef,
      productCount,
      selectProduct,
      productScrollSyncEnabled,
    );

  const goToAdjacentTab = useCallback(
    (dir: -1 | 1) => {
      if (safeTabs.length <= 1) {
        return;
      }

      const next = (clampedIndex + dir + safeTabs.length) % safeTabs.length;

      setSelectedIndex(next);
      scrollTabIntoView(next);
    },
    [clampedIndex, safeTabs.length, scrollTabIntoView],
  );

  useEffect(() => {
    setProductIndex(0);
  }, [clampedIndex]);

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

  useEffect(() => {
    const strip = tabStripRef.current;

    if (strip == null) {
      return;
    }

    const frameId = requestAnimationFrame(() => {
      initShopifyButtonFillHover(strip);
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [safeTabs.length, clampedIndex]);

  const eyebrowText = eyebrow?.text?.trim() ?? 'Your routine is personal';
  const headingText =
    headingResolved.text.length > 0 ? headingResolved.text : 'What Works, Every Day';
  const bodyCopy = bodyResolved.text;

  const sliderDomId = `Slider-fc-${reactId}-${String(clampedIndex)}`;
  const tabCarouselId = `fc-tabs-${reactId}`;
  const activeTabLabel =
    safeTabs[clampedIndex]?.tabLabel?.trim() ?? `Tab ${String(clampedIndex + 1)}`;
  const tabPrevDisabled = safeTabs.length <= 1;
  const tabNextDisabled = safeTabs.length <= 1;
  return (
    <div
      className={clsx('diabetes-care-featured-collections', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
    >
      <div
        className="shopify-section featured-collections"
        id={FEATURED_COLLECTIONS_SECTION_ID}
        style={sectionStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div
          className={clsx('section section--padding relative', roundedTop && 'section--rounded')}
        >
          <div className="page-width relative min-w-0 max-w-full px-4 sm:px-5 md:px-0">
            <div className="title-wrapper z-1 relative flex flex-col gap-4 text-left leading-none md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4">
                <p
                  className="heading subtext-lg tracking-none font-medium normal-case leading-none"
                  style={eyebrowStyle}
                >
                  {eyebrowText}
                </p>
                <h2 className="heading title-md" style={headingStyle}>
                  <SplitWordsHeading text={headingText} />
                </h2>
                {bodyCopy.length > 0 ? (
                  <div className="description rte subtext-md leading-normal" style={bodyStyle}>
                    {bodyCopy
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

            <ScrollReveal className="tab-list flex flex-col gap-4 lg:flex-row lg:justify-between lg:gap-6" delayMs={100}>
              <div
                aria-label="Product collections"
                className="flex min-w-0 items-center gap-2 lg:flex-1"
                id={tabCarouselId}
                role="region"
              >
                <div className="indicators shrink-0 gap-2d5 flex lg:hidden">
                  <CarouselArrowButton
                    ariaLabel="Previous collection"
                    controls={sliderDomId}
                    direction="prev"
                    disabled={tabPrevDisabled}
                    onClick={() => {
                      goToAdjacentTab(-1);
                    }}
                  />
                </div>

                <div className="scroll-shadow grid min-w-0 flex-1 overflow-hidden">
                  <div
                    aria-label={`Collections, ${activeTabLabel}. Swipe or use arrows to change.`}
                    className="fc-tab-strip flex touch-pan-x gap-4 scroll-smooth overscroll-x-contain lg:gap-4"
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
                          key={`tab-${reactId}-${String(index)}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            selectTab(index);
                            scrollTabIntoView(index);
                          }}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                          }}
                          ref={(el) => {
                            setTabItemRef(el, index);
                          }}
                          role="tab"
                          tabIndex={selected ? 0 : -1}
                          type="button"
                        >
                          <span className="btn-fill" data-fill />
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

                <div className="indicators shrink-0 gap-2d5 flex lg:hidden">
                  <CarouselArrowButton
                    ariaLabel="Next collection"
                    controls={sliderDomId}
                    direction="next"
                    disabled={tabNextDisabled}
                    onClick={() => {
                      goToAdjacentTab(1);
                    }}
                  />
                </div>
              </div>

              <p aria-live="polite" className="text-opacity text-center text-sm tabular-nums lg:hidden">
                {clampedIndex + 1} of {safeTabs.length}
              </p>

              <div
                className="indicators hidden shrink-0 gap-2d5 lg:flex"
                data-index={clampedIndex}
              >
                <CarouselArrowButton
                  ariaLabel="Previous collection"
                  controls={sliderDomId}
                  direction="prev"
                  disabled={tabPrevDisabled}
                  onClick={() => {
                    goToAdjacentTab(-1);
                  }}
                />
                <CarouselArrowButton
                  ariaLabel="Next collection"
                  controls={sliderDomId}
                  direction="next"
                  disabled={tabNextDisabled}
                  onClick={() => {
                    goToAdjacentTab(1);
                  }}
                />
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
                    className={clsx(
                      'fc-product-carousel-host relative overflow-visible',
                      rows.length > 1 && 'fc-product-carousel-host--peek overflow-x-clip',
                    )}
                  >
                    <div
                      aria-label={`Products in ${tab.tabLabel?.trim() ?? 'collection'}. Swipe to browse.`}
                      className={clsx(
                        'fc-product-panel grid min-w-0 w-full max-w-full',
                        DC_CAROUSEL_HOST_CLASS,
                        'slider slider--tablet slider--desktop',
                      )}
                      id={
                        index === clampedIndex
                          ? sliderDomId
                          : `Slider-fc-${reactId}-panel-${String(index)}`
                      }
                      role="region"
                      tabIndex={0}
                    >
                      <div
                        className={clsx(
                          'product-grid card-grid card-grid--4 mobile:card-grid--1 initialized grid min-w-0 max-w-full',
                          'fc-product-strip fc-product-strip--scroll-row touch-pan-x overscroll-x-contain scroll-smooth',
                          rows.length > 1 && 'fc-product-strip--peek-carousel',
                        )}
                        ref={index === clampedIndex ? productStripRef : undefined}
                      >
                        {rows.length === 0 ? (
                          <p className="subtext-md col-span-full py-8 text-center text-contrast-500">
                            Search and add catalog products for this tab in Makeswift.
                          </p>
                        ) : (
                          rows.map((p, pi) => (
                              <div
                                className="fc-product-slide min-w-0"
                                key={`${panelId}-p-${String(pi)}`}
                                ref={(el) => {
                                  if (index === clampedIndex) {
                                    setProductItemRef(el, pi);
                                  }
                                }}
                              >
                                <DiabetesCareCatalogProductCard entityId={p.entityId} />
                              </div>
                            ))
                        )}
                      </div>
                    </div>

                    {index === clampedIndex && rows.length > 1 ? (
                      <p
                        aria-live="polite"
                        className="text-opacity mt-3 text-center text-sm tabular-nums"
                      >
                        Product {clampedProductIndex + 1} of {rows.length}
                      </p>
                    ) : null}
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
