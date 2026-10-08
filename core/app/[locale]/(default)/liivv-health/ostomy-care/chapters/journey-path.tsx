'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

import type { CategoryCard } from './chapters-data';
import { useJourneyMemoryOptional } from './journey-memory-context';
import { TextSizeControl } from './text-size-control';

export type PathBand = {
  id: string;
  label: string;
  cards: { card: CategoryCard }[];
};

/** Reading line, below the sticky header and inside the section gate. */
function readingFocus() {
  return window.innerHeight * 0.38;
}

function nearestCard(numbers: number[], focus: number) {
  let best: number | null = null;
  let dist = Number.POSITIVE_INFINITY;

  numbers.forEach((number) => {
    const node = document.getElementById(`card-${number}`);

    if (!node) return;

    const rect = node.getBoundingClientRect();
    const gap = rect.bottom < focus ? focus - rect.bottom : rect.top > focus ? rect.top - focus : 0;

    if (gap < dist) {
      dist = gap;
      best = number;
    }
  });

  return best;
}

/** Last card whose top has reached the reading line, or the nearest if none have. */
function cardAtReadingLine(numbers: number[]) {
  const focus = readingFocus();

  for (let index = numbers.length - 1; index >= 0; index -= 1) {
    const number = numbers[index];

    if (number == null) continue;

    const node = document.getElementById(`card-${number}`);

    if (node && node.getBoundingClientRect().top <= focus) return number;
  }

  return nearestCard(numbers, focus);
}

function sectionAnchor(band: PathBand, bands: PathBand[]) {
  /* The first act is addressed as #chapter-care; later acts use their band id. */
  return band.id === bands[0]?.id ? 'chapter-care' : band.id;
}

/*
 * Section gates are about a viewport tall and are not cards. A card-only spy
 * never hears a jump that lands on the next gate, so the timeline stays on the
 * stop you left. Whichever section holds the reading line owns the timeline.
 */
function stopAtReadingLine(bands: PathBand[]) {
  const focus = readingFocus();

  for (const band of bands) {
    const section = document.getElementById(sectionAnchor(band, bands));

    if (!section) continue;

    const rect = section.getBoundingClientRect();

    if (rect.top > focus || rect.bottom < focus) continue;

    return cardAtReadingLine(band.cards.map(({ card }) => card.number));
  }

  return nearestCard(
    bands.flatMap((band) => band.cards.map(({ card }) => card.number)),
    focus,
  );
}

function useReadingStop(key: string, initial: number, pick: () => number | null) {
  const pickRef = useRef(pick);

  pickRef.current = pick;

  const [active, setActive] = useState(initial);

  useEffect(() => {
    let frame = 0;

    const run = () => {
      const next = pickRef.current();

      if (next != null) setActive(next);
    };

    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(run);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('hashchange', schedule);
    window.addEventListener('resize', schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('hashchange', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [key]);

  return [active, setActive] as const;
}

/*
 * Sticky Living Trail spine (desktop) and stepping-stone dots (mobile). Spy
 * only — never hijacks scroll. The open section is whichever act holds the
 * reading line, including its gate, so a jump to another section moves the
 * timeline instead of leaving it on the stop you left.
 */
export function JourneyPath({ bands }: { bands: PathBand[] }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const memory = useJourneyMemoryOptional();
  const rememberStop = memory?.rememberStop;
  const trackProgress = memory?.trackProgress ?? false;
  const stops = useMemo(
    () =>
      bands.flatMap((band) =>
        band.cards.map(({ card }) => ({
          bandId: band.id,
          bandLabel: band.label,
          number: card.number,
          title: card.title,
        })),
      ),
    [bands],
  );
  const bandKey = bands
    .map((band) => `${band.id}:${band.cards.map(({ card }) => card.number).join('.')}`)
    .join('|');
  const [active, jumpTo] = useReadingStop(bandKey, stops[0]?.number ?? 0, () => stopAtReadingLine(bands));
  const activeBandId = useMemo(
    () => stops.find((stop) => stop.number === active)?.bandId ?? bands[0]?.id ?? '',
    [active, bands, stops],
  );
  useEffect(() => {
    if (!trackProgress || !rememberStop || !active) return;

    const stop = stops.find((item) => item.number === active);

    if (stop) rememberStop(stop.number, stop.title);
  }, [active, rememberStop, stops, trackProgress]);

  const navRef = useRef<HTMLElement>(null);

  /*
   * Keep the active stop inside the HUD's own scroll box. Scrolls the nav only —
   * scrollIntoView would move the page too.
   */
  useEffect(() => {
    const nav = navRef.current;

    if (!nav) return;

    const align = () => {
      if (nav.scrollHeight <= nav.clientHeight) return;

      const link = nav.querySelector<HTMLElement>('a[aria-current="true"]');

      if (!link) return;

      const navRect = nav.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      const target =
        nav.scrollTop + (linkRect.top - navRect.top) - (nav.clientHeight - linkRect.height) / 2;
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      nav.scrollTo({ top: Math.max(0, target), behavior: reduced ? 'auto' : 'smooth' });
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'grid-template-rows') align();
    };
    const frame = window.requestAnimationFrame(align);

    nav.addEventListener('transitionend', onTransitionEnd);

    return () => {
      window.cancelAnimationFrame(frame);
      nav.removeEventListener('transitionend', onTransitionEnd);
    };
  }, [active, activeBandId]);

  const railRef = useRef<HTMLSpanElement>(null);
  const railFillRef = useRef<HTMLSpanElement>(null);

  /*
   * The green rail ends on the current dot. Stops are not evenly spaced (wrapped
   * titles, bookmark tags, band headings), so it is measured rather than a share.
   */
  useEffect(() => {
    const rail = railRef.current;
    const railFill = railFillRef.current;
    const body = rail?.parentElement;

    if (!rail || !railFill || !body) return;

    const measure = () => {
      const dot = body.querySelector<HTMLElement>('a[aria-current="true"] .oc-journey-path-dot');

      if (!dot) return;

      const railTop = rail.getBoundingClientRect().top;
      const dotRect = dot.getBoundingClientRect();

      railFill.style.height = `${Math.max(0, dotRect.top + dotRect.height / 2 - railTop)}px`;
    };
    const observer = new ResizeObserver(measure);

    measure();
    observer.observe(body);
    body.addEventListener('transitionend', measure);

    return () => {
      observer.disconnect();
      body.removeEventListener('transitionend', measure);
    };
  }, [active, activeBandId]);

  if (!stops.length) return null;

  return (
    <nav aria-label={t('pathSpine')} className="oc-journey-path oc-journey-hud" ref={navRef}>
      <div className="oc-journey-path-inner">
        <p className="oc-journey-path-heading">{t('pathHeading')}</p>
        <TextSizeControl />
        <div className="oc-journey-path-body">
          <span aria-hidden className="oc-journey-path-rail" ref={railRef}>
            <span className="oc-journey-path-rail-fill" ref={railFillRef} />
          </span>
          <ol className="oc-journey-path-list">
            {bands.map((band) => {
              const isOpen = band.id === activeBandId || bands.length === 1;
              const bandSaved = band.cards.filter(({ card }) => memory?.isSaved(card.number)).length;

              return (
                <li
                  className={isOpen ? 'oc-journey-path-group is-open' : 'oc-journey-path-group is-collapsed'}
                  key={band.id}
                >
                  <a
                    aria-expanded={isOpen}
                    className={isOpen ? 'oc-journey-path-band is-current' : 'oc-journey-path-band'}
                    href={band.id === bands[0]?.id ? '#chapter-care' : `#${band.id}`}
                    onClick={(event) => {
                      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

                      const first = band.cards[0]?.card.number;

                      if (first != null) jumpTo(first);
                    }}
                  >
                    <span className="oc-journey-path-band-label">{band.label}</span>
                    <span className="oc-journey-path-band-meta">
                      {t('pathBandCount', { count: band.cards.length })}
                      {bandSaved > 0 ? (
                        <span className="oc-journey-path-saved">
                          <span className="sr-only">, </span>
                          {t('pathBandBookmarked', { count: bandSaved })}
                        </span>
                      ) : null}
                    </span>
                  </a>
                  <div className="oc-journey-path-panel" inert={!isOpen ? true : undefined}>
                    <ol>
                      {band.cards.map(({ card }) => {
                        const isActive = card.number === active;
                        const isSaved = memory?.isSaved(card.number) ?? false;

                        return (
                          <li key={card.number}>
                            <a
                              aria-current={isActive ? 'true' : undefined}
                              className={[isActive ? 'is-active' : '', isSaved ? 'is-saved' : '']
                                .filter(Boolean)
                                .join(' ') || undefined}
                              href={`#card-${card.number}`}
                              onClick={(event) => {
                                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

                                jumpTo(card.number);
                              }}
                              tabIndex={isOpen ? undefined : -1}
                              title={card.title}
                            >
                              <span aria-hidden className="oc-journey-path-dot" />
                              <span className="oc-journey-path-num">{String(card.number).padStart(2, '0')}</span>
                              <span className="oc-journey-path-copy">
                                <span className="oc-journey-path-title">{card.title}</span>
                                {isSaved ? (
                                  <span className="oc-journey-path-saved">{t('pathSavedMark')}</span>
                                ) : null}
                              </span>
                            </a>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
}

export function JourneyBandDots({
  cards,
  label,
}: {
  cards: { card: CategoryCard }[];
  label: string;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const memory = useJourneyMemoryOptional();
  const numbers = useMemo(() => cards.map(({ card }) => card.number), [cards]);
  const [active, jumpTo] = useReadingStop(numbers.join(','), numbers[0] ?? 0, () =>
    cardAtReadingLine(numbers),
  );

  if (cards.length < 2) return null;

  return (
    <nav aria-label={`${t('pathSpine')}: ${label}`} className="oc-journey-band-dots">
      {cards.map(({ card }) => {
        const isActive = card.number === active;
        const isSaved = memory?.isSaved(card.number) ?? false;

        return (
          <a
            aria-current={isActive ? 'true' : undefined}
            className={[isActive ? 'is-active' : '', isSaved ? 'is-saved' : ''].filter(Boolean).join(' ') || undefined}
            href={`#card-${card.number}`}
            key={card.number}
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

              jumpTo(card.number);
            }}
            title={card.title}
          >
            <span aria-hidden />
            <span className="sr-only">{card.title}</span>
          </a>
        );
      })}
    </nav>
  );
}
