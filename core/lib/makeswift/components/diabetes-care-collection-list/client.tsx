'use client';

import { clsx } from 'clsx';
import { type KeyboardEventHandler, useId, useRef } from 'react';

import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

import { COLLECTION_LIST_SECTION_ID, COLLECTION_LIST_VARS } from './archive-styles';

export interface DiabetesCareCollectionListCardProps {
  imageSrc?: string;
  imageAlt?: string;
  title?: string;
  cardLink?: { href?: string; target?: string };
  ariaLabel?: string;
}

export interface DiabetesCareCollectionListProps {
  className?: string;
  headingLead?: string;
  /** Text wrapped with the storefront “half underline” accent (can be multiple words). */
  headingEmphasis?: string;
  descriptionHtml?: string;
  cards?: DiabetesCareCollectionListCardProps[];
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

function cardHasMedia(c: DiabetesCareCollectionListCardProps): boolean {
  return (
    String(c.cardLink?.href ?? '').trim().length > 0 &&
    String(c.imageSrc ?? '').trim().length > 0 &&
    String(c.title ?? '').trim().length > 0
  );
}

export function DiabetesCareCollectionList({
  className,
  headingLead,
  headingEmphasis,
  descriptionHtml,
  cards,
}: DiabetesCareCollectionListProps) {
  const reactId = useId().replace(/:/g, '');
  const scrollerRef = useRef<HTMLDivElement>(null);
  const lead = headingLead?.trim() ?? 'Care Designed for';
  const emphasis = headingEmphasis?.trim() ?? 'Every Stage of Health';
  const desc = descriptionHtml?.trim() ?? '';

  const list = cards != null ? cards.filter(cardHasMedia) : [];

  const slide = (direction: -1 | 1) => {
    const el = scrollerRef.current;

    if (el == null) {
      return;
    }

    const delta = Math.max(260, Math.floor(el.clientWidth * 0.85)) * direction;

    el.scrollBy({ left: delta, behavior: 'smooth' });
  };

  const onKeyNav: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      slide(-1);
    }

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      slide(1);
    }
  };

  const sliderDomId = `dcl-carousel-${reactId}`;

  return (
    <div className={clsx('diabetes-care-collection-list max-w-full overflow-x-hidden', className)}>
      <div className="shopify-section" id={COLLECTION_LIST_SECTION_ID}>
        <style dangerouslySetInnerHTML={{ __html: COLLECTION_LIST_VARS }} />
        <div className="section section--padding">
          <div className="page-width relative">
            <div className="title-wrapper z-1 relative flex flex-col gap-4 text-left md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4 leading-none">
                <h2 className="heading title-md leading-none">
                  <SplitWordsHeading emphasis={emphasis} lead={lead} />
                </h2>
                {desc.length > 0 ? (
                  <div
                    className="description rte subtext-md leading-normal"
                    dangerouslySetInnerHTML={{ __html: desc }}
                  />
                ) : null}
              </div>
              <div className="indicators gap-2d5 hidden lg:flex">
                <button
                  aria-controls={sliderDomId}
                  aria-label="Previous"
                  className="button button--secondary"
                  disabled={list.length <= 1}
                  onClick={() => {
                    slide(-1);
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
                  aria-label="Next"
                  className="button button--secondary"
                  disabled={list.length <= 1}
                  onClick={() => {
                    slide(1);
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

            <div
              aria-label="Collection carousel"
              className="slider slider--desktop slider--tablet mt-10 grid lg:mt-14"
              id={sliderDomId}
              onKeyDown={list.length > 0 ? onKeyNav : undefined}
              role="region"
              tabIndex={list.length > 0 ? 0 : undefined}
            >
              <ScrollReveal delayMs={100}>
              <div
                className={clsx(
                  'motion-list initialized card-grid grid max-w-full',
                  // Mirrors archived template: horizontal snap on tablet, 1-up on mobile.
                  'mobile:card-grid--1 gap-8 overflow-x-auto overscroll-contain scroll-smooth [scrollbar-width:none] lg:gap-12 [&::-webkit-scrollbar]:hidden',
                  'card-grid--4 [--card-grid-template:auto/auto-flow_minmax(0,288px)]',
                )}
                ref={scrollerRef}
              >
                {list.length === 0 ? (
                  <p className="subtext-md col-span-full py-8 text-center text-contrast-500">
                    Add collections in Makeswift (image, title, and link).
                  </p>
                ) : (
                  list.map((c, i) => {
                    const href = c.cardLink?.href?.trim() ?? '#';
                    const src = c.imageSrc?.trim() ?? '';
                    const cardTitle = c.title?.trim() ?? '';
                    const label =
                      (c.ariaLabel?.trim() ?? cardTitle).length > 0
                        ? (c.ariaLabel?.trim() ?? cardTitle)
                        : undefined;

                    return (
                      <div
                        className="card media-card media-card--card shrink-0"
                        key={`dcc-${reactId}-${String(i)}`}
                      >
                        <a
                          aria-label={label}
                          className="media-card__link relative flex h-full w-full flex-col"
                          href={href}
                          rel={c.cardLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
                          target={c.cardLink?.target}
                        >
                          <div className="media media--wide relative overflow-hidden">
                            <img
                              alt={c.imageAlt?.trim() ?? cardTitle}
                              className="aspect-[4/3] w-full object-cover"
                              decoding="async"
                              height={800}
                              loading="lazy"
                              src={src}
                              width={1000}
                            />
                          </div>
                          <div className="media-card__info flex justify-between gap-3 p-6">
                            <p className="grow">
                              <span className="heading reversed-link text-lg-md font-medium leading-tight">
                                {cardTitle}
                              </span>
                            </p>
                          </div>
                        </a>
                      </div>
                    );
                  })
                )}
              </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
