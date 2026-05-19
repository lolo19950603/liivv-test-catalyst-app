'use client';

import { clsx } from 'clsx';

import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

import {
  IMAGE_TEXT_OVERLAY_FEATURES_VARS,
  IMAGE_TEXT_OVERLAY_SECTION_ID,
  IMAGE_TEXT_OVERLAY_VARS,
} from './archive-styles';
import { FeatureIcon, type FeatureIconName, isFeatureIconName } from './feature-icons';

function IconArrowRight() {
  return (
    <svg
      className="icon icon-arrow-right icon-sm transform"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 21 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 10H18M18 10L12.1667 4.16675M18 10L12.1667 15.8334"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface DiabetesCareImageTextOverlayFeature {
  icon?: string;
  title?: string;
  description?: string;
}

export interface DiabetesCareImageTextOverlayProps {
  className?: string;
  /** Background image URL (Makeswift Image control). */
  backgroundImageSrc?: string;
  backgroundImageAlt?: string;
  heading?: string;
  /** Rich intro line(s); HTML ok. */
  bodyHtml?: string;
  buttonLabel?: string;
  buttonLink?: { href?: string; target?: string };
  features?: DiabetesCareImageTextOverlayFeature[];
}

const DEFAULT_FEATURES: DiabetesCareImageTextOverlayFeature[] = [
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

function featuresResolved(
  features?: DiabetesCareImageTextOverlayFeature[],
): DiabetesCareImageTextOverlayFeature[] {
  if (features != null && features.length > 0) {
    return features
      .map((f) => ({
        icon: f.icon?.trim() ?? 'support',
        title: f.title?.trim() ?? '',
        description: f.description?.trim() ?? '',
      }))
      .filter((f) => f.title.length > 0);
  }

  return DEFAULT_FEATURES;
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

export function DiabetesCareImageTextOverlay({
  className,
  backgroundImageSrc,
  backgroundImageAlt,
  heading,
  bodyHtml,
  buttonLabel,
  buttonLink,
  features,
}: DiabetesCareImageTextOverlayProps) {
  const img = backgroundImageSrc?.trim() ?? '';
  const imgAlt = backgroundImageAlt?.trim() ?? '';
  const headingText = heading?.trim() ?? "We're Here if You Need Us";
  const html = bodyHtml?.trim() ?? '';
  const btn = buttonLabel?.trim() ?? '';
  const btnHref = buttonLink?.href?.trim() ?? '';
  const hasBtn = btn.length > 0 && btnHref.length > 0;
  const featureRows = featuresResolved(features);

  return (
    <div
      className={clsx('diabetes-care-image-text-overlay max-w-full overflow-x-hidden', className)}
    >
      <div className="shopify-section" id={IMAGE_TEXT_OVERLAY_SECTION_ID}>
        <style
          dangerouslySetInnerHTML={{
            __html: `${IMAGE_TEXT_OVERLAY_VARS}${IMAGE_TEXT_OVERLAY_FEATURES_VARS}`,
          }}
        />
        <div className="section section--padding section--rounded relative">
          <div className="relative">
            <div className="banner media--450px mobile:media--auto relative">
              <div className="banner__media block h-full w-full overflow-hidden">
                {img.length > 0 ? (
                  <picture className="media media--height relative block h-full w-full overflow-hidden">
                    <img
                      alt={imgAlt || headingText}
                      className="h-full w-full object-cover object-center"
                      decoding="async"
                      height={1200}
                      loading="lazy"
                      src={img}
                      width={2000}
                    />
                  </picture>
                ) : (
                  <div className="media media--height block min-h-[280px] w-full bg-zinc-300 md:min-h-[360px]" />
                )}
              </div>
              <span className="banner__overlay pointer-events-none absolute left-0 top-0 h-full w-full" />
              <div className="banner__content z-1 absolute left-0 top-0 h-full w-full overflow-hidden">
                <div className="page-width flex h-full w-full items-end justify-start md:items-center md:justify-center">
                  <div className="banner__box banner__box--small pb-10 pt-[min(35vh,12rem)] text-left md:py-0 md:text-center">
                    <h2 className="banner__title heading title-lg tracking-heading leading-none text-white">
                      <SplitWordsHeading text={headingText} />
                    </h2>
                    {html.length > 0 ? (
                      <div
                        className="rte body subtext-md leading-normal text-white"
                        dangerouslySetInnerHTML={{ __html: html }}
                      />
                    ) : null}
                    {hasBtn ? (
                      <a
                        className="button button--primary button--fixed button--md icon-with-text mt-6"
                        href={btnHref}
                        rel={buttonLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                        target={buttonLink?.target}
                      >
                        <span className="btn-fill" data-fill />
                        <span className="btn-text">
                          {btn}
                          <IconArrowRight />
                        </span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {featureRows.length > 0 ? (
          <ScrollReveal
            className="diabetes-care-image-text-overlay-features section section--padding section--next-rounded relative"
            delayMs={120}
            style={{ zIndex: 3 }}
          >
            <div className="page-width relative">
              <div
                className={clsx(
                  'text-with-icons with-background z-1 relative block lg:grid',
                  featuresGridClass(featureRows.length),
                )}
              >
                {featureRows.map((row, index) => {
                  const descHtml = featureDescriptionHtml(row.description);

                  return (
                    <div
                      className="column flex w-full flex-col gap-5 text-center xl:flex-row xl:text-left"
                      key={`overlay-feature-${String(index)}`}
                    >
                      <div className="column__icon">
                        <FeatureIcon name={featureIconName(row.icon)} />
                      </div>
                      <div className="column__content">
                        <p className="column__title heading tracking-none font-medium leading-tight">
                          {row.title}
                        </p>
                        {descHtml.length > 0 ? (
                          <div
                            className="column__text rte"
                            dangerouslySetInnerHTML={{ __html: descHtml }}
                          />
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollReveal>
        ) : null}
      </div>
    </div>
  );
}
