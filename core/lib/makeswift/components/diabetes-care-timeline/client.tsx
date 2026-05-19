'use client';

import { clsx } from 'clsx';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

const SHOPIFY_SECTION_ID = 'shopify-section-template--26520397447459__timeline_nyTDKQ';
const SLIDER_ID = 'Slider-template--26520397447459__timeline_nyTDKQ';

/**
 * Section-scoped CSS: export vars, desktop two-column grid for each slide, horizontal strip with
 * scroll-snap (center). Snap uses `scroll-behavior: auto` so corrections are instant — `smooth` on
 * the scroller fights mandatory snap + trackpad deltas and reads as a laggy “snap back then forward”.
 * @param {number} blockCount - `--section-blocks-count` for `.timeline-dots`.
 * @returns {string} Inline `<style>` payload.
 */
function timelineSectionCss(blockCount: number): string {
  const id = `#${SHOPIFY_SECTION_ID}`;
  /** Instant snap; arrows/dots still use `scrollIntoView({ behavior: 'smooth' })`. */
  const strip = `${id} .timeline-react-strip{display:flex;flex-flow:row nowrap;gap:clamp(16px,2.5vw,40px);overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-behavior:auto;-webkit-overflow-scrolling:touch;padding-block:var(--sp-2,8px);scrollbar-width:none;-ms-overflow-style:none}`;
  const stripScrollbar = `${id} .timeline-react-strip::-webkit-scrollbar{display:none;width:0;height:0}`;

  return `${id}{--section-padding-top:72px;--section-padding-bottom:72px;--section-blocks-count:${String(blockCount)}}@media screen and (min-width:768px){${id} .timeline__item>.timeline-slide-layout.flex{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}}${strip}${stripScrollbar}${id} .timeline-react-strip .timeline__item{flex:0 0 min(92%,1120px);max-width:100%;width:auto;scroll-snap-align:center;transition:opacity .28s ease}${id} .timeline-react-strip .timeline__item:not(.selected){opacity:.48}${id} .timeline-react-strip .timeline__item.selected{opacity:1}@media (prefers-reduced-motion:reduce){${id} .timeline-react-strip .timeline__item{transition:none}}`;
}

export interface DiabetesCareTimelineBullet {
  text?: string;
}

export interface DiabetesCareTimelineSection {
  editorLabel?: string;
  timelineLabel?: string;
  categoryLabel?: string;
  sectionHeading?: string;
  subtext?: string;
  bulletPoints?: DiabetesCareTimelineBullet[];
  buttonText?: string;
  buttonLink?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt?: string;
}

export interface DiabetesCareTimelineProps {
  className?: string;
  topHeading?: string;
  headingAccentPhrase?: string;
  sections?: DiabetesCareTimelineSection[];
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

function slideBody(section: DiabetesCareTimelineSection) {
  const bullets =
    section.bulletPoints?.filter((b) => b.text != null && String(b.text).trim().length > 0) ?? [];
  const subtextParagraphs =
    section.subtext != null && section.subtext.trim().length > 0
      ? section.subtext
          .split(/\n+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 0)
      : [];
  const showRteBlock = subtextParagraphs.length > 0 || bullets.length > 0;
  const buttonHref = section.buttonLink?.href ?? '#';
  const buttonLabel = section.buttonText?.trim() || 'Get Started';

  return { bullets, subtextParagraphs, showRteBlock, buttonHref, buttonLabel };
}

interface TimelineSlideProps {
  section: DiabetesCareTimelineSection;
  index: number;
  isSelected: boolean;
  setSlideEl: (el: HTMLDivElement | null, i: number) => void;
}

function TimelineSlide({ section, index, isSelected, setSlideEl }: TimelineSlideProps) {
  const { bullets, subtextParagraphs, showRteBlock, buttonHref, buttonLabel } = slideBody(section);

  return (
    <div
      className={clsx('timeline__item card relative', isSelected && 'selected')}
      ref={(el) => {
        setSlideEl(el, index);
      }}
    >
      <div className="timeline-slide-layout md:grid-row-reverse flex flex-col overflow-hidden">
        <picture className="media media--portrait mobile:media--wide relative block overflow-hidden">
          {section.imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element -- Makeswift image URL
            <img
              alt={section.imageAlt ?? ''}
              loading={index === 0 ? 'eager' : 'lazy'}
              src={section.imageSrc}
            />
          ) : null}
        </picture>

        <div className="timeline__item-content flex flex-col gap-4">
          {section.categoryLabel ? (
            <p className="text-opacity text-base font-bold tracking-tight lg:text-lg">
              {section.categoryLabel}
            </p>
          ) : null}

          {section.sectionHeading ? (
            <h2 className="heading text-2xl leading-none tracking-tight lg:text-3xl">
              <em
                className="highlighted-text animated relative not-italic"
                data-style="half_text"
                is="highlighted-text"
              >
                {section.sectionHeading}
              </em>
            </h2>
          ) : null}

          {showRteBlock ? (
            <div className="rte text-opacity text-base lg:text-lg">
              {subtextParagraphs.map((para, i) => (
                <p key={`${index}-sub-${i}`}>{para}</p>
              ))}
              {bullets.length > 0 ? (
                <ul>
                  {bullets.map((b, i) => (
                    <li key={`${index}-b-${i}`}>{b.text}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <p>
            <a
              className="button button--primary button--md icon-with-text"
              href={buttonHref}
              rel={section.buttonLink?.target === '_blank' ? 'noopener noreferrer' : undefined}
              target={section.buttonLink?.target}
            >
              <span className="btn-fill" data-fill />
              <span className="btn-text">
                {buttonLabel}
                <IconArrowRight />
              </span>
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export function DiabetesCareTimeline({
  className,
  topHeading,
  headingAccentPhrase,
  sections,
}: DiabetesCareTimelineProps) {
  const list = useMemo(() => sections ?? [], [sections]);
  const count = list.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);

  const safeIndex = Math.min(activeIndex, Math.max(0, count - 1));

  const setSlideEl = useCallback((el: HTMLDivElement | null, i: number) => {
    slideRefs.current[i] = el;
  }, []);

  const resolveIndexFromScroll = useCallback(() => {
    const strip = scrollRef.current;

    if (!strip || count === 0) {
      return;
    }

    const center = strip.scrollLeft + strip.clientWidth / 2;
    let best = 0;
    let bestDist = Number.POSITIVE_INFINITY;

    for (let i = 0; i < count; i += 1) {
      const slide = slideRefs.current[i];

      if (slide) {
        const mid = slide.offsetLeft + slide.offsetWidth / 2;
        const d = Math.abs(center - mid);

        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
    }

    setActiveIndex(best);
  }, [count]);

  useEffect(() => {
    setActiveIndex((i) => {
      if (count <= 0) {
        return 0;
      }

      return Math.min(i, count - 1);
    });
  }, [count]);

  /** After scroll / snap finishes: sync dots + opacity. Avoid resolving during motion — the
   *  viewport center can sit between slides for a frame while inertia moves, which toggled
   *  `.selected` and felt like a bounce. (No vertical→horizontal wheel mapping: it used
   *  `preventDefault()` and blocked normal page scroll over the strip; horizontal scrolling uses
   *  native `overflow-x` + trackpad `deltaX`, touch drag, or Shift+wheel where the OS supports it.) */
  useEffect(() => {
    const strip = scrollRef.current;

    if (!strip || count === 0) {
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
  }, [count, resolveIndexFromScroll]);

  const scrollSlideIntoView = useCallback((index: number) => {
    const slide = slideRefs.current[index];

    slide?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, []);

  const goPrev = useCallback(() => {
    const next = Math.max(0, safeIndex - 1);

    setActiveIndex(next);
    scrollSlideIntoView(next);
  }, [safeIndex, scrollSlideIntoView]);

  const goNext = useCallback(() => {
    const next = Math.min(count - 1, safeIndex + 1);

    setActiveIndex(next);
    scrollSlideIntoView(next);
  }, [count, safeIndex, scrollSlideIntoView]);

  const heading = topHeading ?? 'Your Care Journey, Simp(liivv)fied';
  const prevDisabled = count === 0 || safeIndex === 0;
  const nextDisabled = count === 0 || safeIndex >= count - 1;

  return (
    <div className={clsx('diabetes-care-timeline max-w-full', className)}>
      <div className="shopify-section" id={SHOPIFY_SECTION_ID}>
        <style dangerouslySetInnerHTML={{ __html: timelineSectionCss(count) }} />
        <div className="section section--padding">
          <div className="page-width relative overflow-hidden md:overflow-visible">
            <div className="title-wrapper z-1 relative flex flex-col gap-4 text-left leading-none md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4">
                <h2 className="heading title-md">
                  <SplitWordsHeading accentPhrase={headingAccentPhrase} text={heading} />
                </h2>
              </div>

              {count > 0 ? (
                <div className="indicators gap-2d5 hidden lg:flex">
                  <button
                    aria-controls={SLIDER_ID}
                    aria-label="Previous"
                    className="button button--secondary"
                    disabled={prevDisabled}
                    onClick={goPrev}
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
                    aria-controls={SLIDER_ID}
                    aria-label="Next"
                    className="button button--secondary"
                    disabled={nextDisabled}
                    onClick={goNext}
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
              ) : null}
            </div>

            {count === 0 ? (
              <div className="rte text-opacity mt-8 text-base lg:text-lg">
                <p>
                  Add journey sections in the left panel. Each section can include copy, bullets, a
                  button link, and an image. The bottom timeline uses the export theme styles.
                </p>
              </div>
            ) : (
              <>
                <ScrollReveal delayMs={100}>
                <div
                  aria-label={`Journey carousel, slide ${safeIndex + 1} of ${count}`}
                  aria-roledescription="carousel"
                  className="slider slider--desktop slider--tablet grid"
                  id={SLIDER_ID}
                  role="region"
                >
                  <div className="timeline timeline-react-strip" ref={scrollRef}>
                    {list.map((section, index) => (
                      <TimelineSlide
                        index={index}
                        isSelected={index === safeIndex}
                        key={`slide-${index}`}
                        section={section}
                        setSlideEl={setSlideEl}
                      />
                    ))}
                  </div>
                </div>

                <div className="scroll-area">
                  <div
                    aria-label="Journey timeline"
                    className="timeline-dots gap-2d5 grid"
                    role="tablist"
                  >
                    {list.map((section, index) => {
                      const label =
                        section.timelineLabel?.trim() ||
                        section.categoryLabel?.trim() ||
                        section.sectionHeading?.trim() ||
                        `Step ${index + 1}`;
                      const isActive = index === safeIndex;

                      return (
                        <button
                          aria-controls={SLIDER_ID}
                          aria-current={isActive ? 'true' : 'false'}
                          className="heading gap-2d5 flex items-center text-left text-lg"
                          data-index={index + 1}
                          key={`dot-${index}`}
                          onClick={() => {
                            setActiveIndex(index);
                            scrollSlideIntoView(index);
                          }}
                          type="button"
                        >
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                </ScrollReveal>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
