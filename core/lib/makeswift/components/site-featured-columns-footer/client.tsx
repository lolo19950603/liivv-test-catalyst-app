'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  type BodyTextProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';
import { resolvePlainTextColor } from '~/lib/makeswift/utils/heading-accent-color';

import {
  SITE_FEATURED_COLUMNS_FOOTER_ROUNDED_BOTTOM_CSS,
  SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID,
  SITE_FEATURED_COLUMNS_FOOTER_VARS,
} from './archive-styles';
import { FeatureIcon, type FeatureIconName, isFeatureIconName } from './feature-icons';

export type SiteFeaturedColumnsFooterTextProps = {
  text?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export interface SiteFeaturedColumnsFooterFeature {
  icon?: string;
  /** Popover group or legacy plain string. */
  title?: SiteFeaturedColumnsFooterTextProps | string;
  /** Popover group or legacy plain string. */
  description?: SiteFeaturedColumnsFooterTextProps | string;
}

export type SiteFeaturedColumnsFooterProps = {
  className?: string;
  background?: SectionBackgroundProps;
  features?: SiteFeaturedColumnsFooterFeature[];
  /** Optional fallback body color when feature description blocks omit one. */
  bodyText?: BodyTextProps;
  roundedBottom?: boolean;
};

type SiteFeaturedColumnsFooterResolved = {
  icon: string;
  title: string;
  titleStyle: CSSProperties | undefined;
  description: string;
  descriptionStyle: CSSProperties | undefined;
};

const MAX_FEATURES = 4;

const DEFAULT_FEATURES: SiteFeaturedColumnsFooterFeature[] = [
  {
    icon: 'support',
    title: 'Here When You Need Us',
    description: 'Friendly customer support to help answer questions or guide your care',
  },
  {
    icon: 'box',
    title: 'Easy, Reliable Shipping',
    description: 'Fast, dependable delivery straight to your door.',
  },
  {
    icon: 'heart',
    title: 'Care You Can Trust',
    description: 'Thoughtfully curated products and support designed for everyday life',
  },
  {
    icon: 'shield',
    title: 'Simple, Secure Payments',
    description: 'Multiple payment options with safe, secure checkout',
  },
];

function featureIconName(raw?: string): FeatureIconName {
  const t = raw?.trim() ?? '';

  return isFeatureIconName(t) ? t : 'support';
}

function featureTextBlockStyle(
  block?: SiteFeaturedColumnsFooterTextProps | null,
): CSSProperties | undefined {
  const color = resolvePlainTextColor({
    textColor: block?.textColor,
    textColorHex: block?.textColorHex,
  });
  const fontSize = resolveHeadingFontSizeCss(block?.fontSize, block?.fontSizeMobile);

  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

function resolveFeatureTextField(
  field?: SiteFeaturedColumnsFooterTextProps | string,
): { text: string; style: CSSProperties | undefined } {
  if (field == null) {
    return { text: '', style: undefined };
  }

  if (typeof field === 'string') {
    return { text: field.trim(), style: undefined };
  }

  return {
    text: field.text?.trim() ?? '',
    style: featureTextBlockStyle(field),
  };
}

function featureDescriptionHtml(raw?: string): string {
  const t = raw?.trim() ?? '';

  if (t.length === 0) {
    return '';
  }

  if (/<[a-z][\s\S]*>/i.test(t)) {
    return t;
  }

  return `<p>${t}</p>`;
}

function resolveFeatureRow(
  feature: SiteFeaturedColumnsFooterFeature,
): SiteFeaturedColumnsFooterResolved | null {
  const title = resolveFeatureTextField(feature.title);
  const description = resolveFeatureTextField(feature.description);

  if (title.text.length === 0) {
    return null;
  }

  return {
    icon: feature.icon?.trim() ?? 'support',
    title: title.text,
    titleStyle: title.style,
    description: description.text,
    descriptionStyle: description.style,
  };
}

function featuresResolved(
  features?: SiteFeaturedColumnsFooterFeature[],
): SiteFeaturedColumnsFooterResolved[] {
  if (features != null && features.length > 0) {
    return features
      .map(resolveFeatureRow)
      .filter((row): row is SiteFeaturedColumnsFooterResolved => row != null)
      .slice(0, MAX_FEATURES);
  }

  return DEFAULT_FEATURES.flatMap((f) => {
    const row = resolveFeatureRow(f);

    return row != null ? [row] : [];
  });
}

function featuresGridClass(count: number): string {
  if (count >= 4) {
    return 'grid--4';
  }

  if (count === 3) {
    return 'grid--3';
  }

  if (count === 2) {
    return 'grid--2';
  }

  return 'grid--1';
}

export function SiteFeaturedColumnsFooter({
  className,
  background,
  features,
  bodyText,
  roundedBottom = true,
}: SiteFeaturedColumnsFooterProps) {
  const featureRows = featuresResolved(features);

  if (featureRows.length === 0) {
    return null;
  }

  const { sectionCss: themeCss, sectionStyle } = buildSectionTheme({
    sectionId: SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID,
    sectionCss: SITE_FEATURED_COLUMNS_FOOTER_VARS,
    background,
    highlight: null,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });

  const sectionCss =
    roundedBottom === true
      ? `${themeCss}${SITE_FEATURED_COLUMNS_FOOTER_ROUNDED_BOTTOM_CSS}`
      : themeCss;

  const fallbackBodyColor = resolveBodyTextColor(bodyText);

  const panel = (
    <div
      className={clsx(
        'site-featured-columns-footer__panel section section--padding relative',
        roundedBottom && 'site-featured-columns-footer__panel--rounded section--next-rounded',
      )}
      style={{ zIndex: 3 }}
    >
      <ScrollReveal className="site-featured-columns-footer__row relative" delayMs={120}>
        <div className="page-width relative px-4 sm:px-5 md:px-0">
          <div
            className={clsx(
              'text-with-icons with-background z-1 relative block lg:grid',
              featuresGridClass(featureRows.length),
            )}
          >
            {featureRows.map((row, index) => {
              const descHtml = featureDescriptionHtml(row.description);
              const descStyle: CSSProperties | undefined =
                row.descriptionStyle ??
                (fallbackBodyColor != null ? { color: fallbackBodyColor } : undefined);

              return (
                <div
                  className="column flex w-full flex-col gap-5 text-center xl:flex-row xl:text-left"
                  key={`feature-column-${String(index)}`}
                >
                  <div className="column__icon">
                    <FeatureIcon name={featureIconName(row.icon)} />
                  </div>
                  <div className="column__content">
                    <p
                      className="column__title heading tracking-none font-medium leading-tight"
                      style={row.titleStyle}
                    >
                      {row.title}
                    </p>
                    {descHtml.length > 0 ? (
                      <div
                        className="column__text rte"
                        dangerouslySetInnerHTML={{ __html: descHtml }}
                        style={descStyle}
                      />
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );

  return (
    <div
      className={clsx(
        'site-featured-columns-footer',
        DC_SECTION_ROOT_CLASS,
        'max-w-full',
        roundedBottom && 'site-featured-columns-footer__shell',
        className,
      )}
    >
      <div
        className="shopify-section"
        id={SITE_FEATURED_COLUMNS_FOOTER_SECTION_ID}
        style={sectionStyle}
      >
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        {panel}
      </div>
    </div>
  );
}
