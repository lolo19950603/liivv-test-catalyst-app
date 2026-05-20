'use client';

import { clsx } from 'clsx';
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';

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
  background,
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
  const tabs = useMemo(() => {
    const raw = collections != null && collections.length > 0 ? collections : DEFAULT_COLLECTIONS;
    const labelled = raw.filter(tabHasLabel);

    return labelled.length > 0 ? labelled : DEFAULT_COLLECTIONS;
  }, [collections]);

  const safeTabs = tabs;
  const [selectedIndex, setSelectedIndex] = useState(0);
  const clampedIndex = Math.min(selectedIndex, Math.max(0, safeTabs.length - 1));
  const tabStripRef = useRef<HTMLDivElement>(null);

  const selectTab = (index: number) => {
    if (index === clampedIndex || index < 0 || index >= safeTabs.length) {
      return;
    }

    setSelectedIndex(index);
  };

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

  const eyebrowText = eyebrow?.text?.trim() ?? 'Your routine is personal';
  const headingText =
    headingResolved.text.length > 0 ? headingResolved.text : 'What Works, Every Day';
  const bodyCopy = bodyResolved.text;

  const sliderDomId = `Slider-fc-${reactId}-${String(clampedIndex)}`;

  return (
    <div
      className={clsx('diabetes-care-featured-collections max-w-full overflow-x-hidden', className)}
    >
      <div
        className="shopify-section featured-collections"
        id={FEATURED_COLLECTIONS_SECTION_ID}
        style={sectionStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="section section--padding section--rounded relative">
          <div className="page-width relative">
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

            <ScrollReveal className="tab-list flex justify-between gap-6" delayMs={100}>
              <div className="scroll-shadow grid min-w-0 flex-1 overflow-hidden">
                <div
                  className="fc-tab-strip flex gap-4 scroll-smooth"
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
                          }}
                          onPointerDown={(event) => {
                            event.stopPropagation();
                          }}
                          role="tab"
                          tabIndex={selected ? 0 : -1}
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

              <div className="indicators shrink-0 gap-2d5 hidden lg:flex" data-index={clampedIndex}>
                <button
                  aria-controls={sliderDomId}
                  aria-label="Previous collection"
                  className="button button--secondary"
                  disabled={safeTabs.length <= 1}
                  onClick={(event) => {
                    event.stopPropagation();
                    goToAdjacentTab(-1);
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
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
                  onClick={(event) => {
                    event.stopPropagation();
                    goToAdjacentTab(1);
                  }}
                  onPointerDown={(event) => {
                    event.stopPropagation();
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
