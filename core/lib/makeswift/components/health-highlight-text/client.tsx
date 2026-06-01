'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import { ArchiveHighlightedText } from '~/lib/makeswift/components/diabetes-care-faq/archive-highlighted-text';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { resolveHealthSectionDomId } from '~/lib/makeswift/health-page-section-id';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type HeadingTypographyProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolvePlainTextColor } from '~/lib/makeswift/utils/heading-accent-color';
import { resolveMakeswiftImageSrc } from '~/lib/makeswift/utils/makeswift-image-src';

import {
  HEALTH_HIGHLIGHT_TEXT_SECTION_ID,
  healthHighlightTextSectionCss,
} from './archive-styles';

const MAX_PILLS_PER_ROW = 5;

const PILL_MEDIA_STYLE = {
  '--media-width': '200px',
  '--media-height': '90px',
  '--media-width-mobile': '90px',
  '--media-height-mobile': '50px',
} as CSSProperties;

export type HealthHighlightPillImage = {
  image?: unknown;
  altText?: string;
  objectPosition?: string;
};

export type HealthHighlightHeadingTextProps = {
  beforeHealth?: string;
  healthPhrase?: string;
  midText?: string;
  journeyPhrase?: string;
  trailText?: string;
};

export type HealthHighlightHeadingColorProps = {
  textColor?: string;
  textColorHex?: string;
  healthPhraseAccentColor?: string;
  healthPhraseAccentColorHex?: string;
  journeyPhraseAccentColor?: string;
  journeyPhraseAccentColorHex?: string;
};

export type HealthHighlightHeadingTypographyProps = {
  fontSize?: number;
  fontSizeMobile?: number;
};

/** Nested Makeswift groups; flat keys kept for older saved instances. */
export type HealthHighlightHeadingProps = HeadingTypographyProps &
  HealthHighlightHeadingTextProps &
  HealthHighlightHeadingColorProps & {
    text?: HealthHighlightHeadingTextProps;
    colors?: HealthHighlightHeadingColorProps;
    typography?: HealthHighlightHeadingTypographyProps;
  };

function flattenHealthHighlightHeading(
  heading?: HealthHighlightHeadingProps | null,
): HealthHighlightHeadingTextProps &
  HealthHighlightHeadingColorProps &
  HealthHighlightHeadingTypographyProps {
  if (heading == null) {
    return {};
  }

  const {
    text: textGroup,
    colors: colorsGroup,
    typography: typographyGroup,
    ...legacyFlat
  } = heading;

  return {
    ...legacyFlat,
    ...textGroup,
    ...colorsGroup,
    ...typographyGroup,
    textColor: colorsGroup?.textColor ?? legacyFlat.textColor,
    textColorHex: colorsGroup?.textColorHex ?? legacyFlat.textColorHex,
    healthPhraseAccentColor:
      colorsGroup?.healthPhraseAccentColor ?? legacyFlat.healthPhraseAccentColor,
    healthPhraseAccentColorHex:
      colorsGroup?.healthPhraseAccentColorHex ?? legacyFlat.healthPhraseAccentColorHex,
    journeyPhraseAccentColor:
      colorsGroup?.journeyPhraseAccentColor ?? legacyFlat.journeyPhraseAccentColor,
    journeyPhraseAccentColorHex:
      colorsGroup?.journeyPhraseAccentColorHex ?? legacyFlat.journeyPhraseAccentColorHex,
    fontSize: typographyGroup?.fontSize ?? legacyFlat.fontSize,
    fontSizeMobile: typographyGroup?.fontSizeMobile ?? legacyFlat.fontSizeMobile,
  };
}

export type HealthHighlightTextProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  topRowImages?: HealthHighlightPillImage[];
  bottomRowImages?: HealthHighlightPillImage[];
  heading?: HealthHighlightHeadingProps;
  roundedTop?: boolean;
};

function HighlightPillPicture({ item }: { item: HealthHighlightPillImage }) {
  const src = resolveMakeswiftImageSrc(item.image);

  if (src.length === 0) {
    return null;
  }

  const alt = item.altText?.trim() ?? '';
  const objectPosition = item.objectPosition?.trim();

  return (
    <picture
      className="media media--height media--transparent media--fit relative shrink-0 overflow-hidden"
      style={PILL_MEDIA_STYLE}
    >
      <img
        alt={alt}
        className="block h-full w-full"
        decoding="async"
        loading="lazy"
        src={src}
        style={objectPosition != null && objectPosition.length > 0 ? { objectPosition } : undefined}
      />
    </picture>
  );
}

function HighlightPillRow({ images }: { images: HealthHighlightPillImage[] }) {
  const list = (images ?? [])
    .slice(0, MAX_PILLS_PER_ROW)
    .filter((item) => resolveMakeswiftImageSrc(item.image).length > 0);

  if (list.length === 0) {
    return null;
  }

  return (
    <div className="health-highlight-pill-row">
      {list.map((item, index) => (
        <HighlightPillPicture item={item} key={`pill-${index}`} />
      ))}
    </div>
  );
}

export function HealthHighlightText({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  topRowImages,
  bottomRowImages,
  heading,
  roundedTop = true,
}: HealthHighlightTextProps) {
  const resolvedSectionId = resolveHealthSectionDomId(
    sectionDomId ?? HEALTH_HIGHLIGHT_TEXT_SECTION_ID,
    instanceSuffix,
  );
  const headingProps = flattenHealthHighlightHeading(heading);
  const headingResolved = resolveHeadingTypography({
    textColor: headingProps.textColor,
    textColorHex: headingProps.textColorHex,
    fontSize: headingProps.fontSize,
    fontSizeMobile: headingProps.fontSizeMobile,
  });
  const beforeHealth = headingProps.beforeHealth?.trim() ?? 'Liivv';
  const healthPhrase = headingProps.healthPhrase?.trim() ?? 'Health';
  const midText = headingProps.midText?.trim() ?? 'is your';
  const journeyPhrase = headingProps.journeyPhrase?.trim() ?? 'customized journey';
  const trailText = headingProps.trailText?.trim() ?? 'for every day living';
  const hasHeading =
    beforeHealth.length > 0 ||
    healthPhrase.length > 0 ||
    midText.length > 0 ||
    journeyPhrase.length > 0 ||
    trailText.length > 0;
  const { sectionCss, sectionStyle: themeSectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: healthHighlightTextSectionCss(resolvedSectionId),
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });
  const backgroundChannels =
    themeSectionStyle['--color-background'] ?? ARCHIVE_CREAM_BACKGROUND_CHANNELS;
  /** Background on `.section` only — not the outer `shopify-section` (square bg hides rounded top). */
  const sectionStyle = {
    ...themeSectionStyle,
    '--color-background': backgroundChannels,
  } as CSSProperties;
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;
  const healthPhraseColor = resolvePlainTextColor({
    textColor: headingProps.healthPhraseAccentColor,
    textColorHex: headingProps.healthPhraseAccentColorHex,
  });
  const journeyPhraseColor = resolvePlainTextColor({
    textColor: headingProps.journeyPhraseAccentColor,
    textColorHex: headingProps.journeyPhraseAccentColorHex,
  });

  return (
    <div className={clsx('health-highlight-text', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div
          className={clsx(
            'section section--padding relative',
            roundedTop && 'section--rounded',
          )}
        >
          <div className="page-width relative">
            <div className="highlight-text relative z-[1] mx-auto max-w-[1120px] text-center">
              <HighlightPillRow images={topRowImages ?? []} />
              {hasHeading ? (
                <h2
                  className="heading mt-6 inline-block pb-8 leading-tight tracking-heading title-lg md:mt-8 md:pb-10"
                  style={headingStyle}
                >
                    {beforeHealth.length > 0 ? <>{beforeHealth} </> : null}
                    {healthPhrase.length > 0 ? (
                      <ArchiveHighlightedText color={healthPhraseColor} highlightStyle="text">
                        {healthPhrase}{' '}
                      </ArchiveHighlightedText>
                    ) : null}
                    {midText.length > 0 ? <>{midText} </> : null}
                    {journeyPhrase.length > 0 ? (
                      <ArchiveHighlightedText color={journeyPhraseColor} highlightStyle="text">
                        {journeyPhrase}
                      </ArchiveHighlightedText>
                    ) : null}
                    {trailText.length > 0 ? <> {trailText}</> : null}
                </h2>
              ) : null}
              <HighlightPillRow images={bottomRowImages ?? []} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
