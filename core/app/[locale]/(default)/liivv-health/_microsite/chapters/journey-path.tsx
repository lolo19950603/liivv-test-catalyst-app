/* Twin of ostomy-care/chapters/journey-path.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

import { type MouseEvent, useEffect, useId, useRef } from 'react';

import { useSiteT } from '../site-context';

import type { CategoryCard } from './compose';
import { useJourneyMemoryOptional } from './journey-memory-context';
import { type PathBand, useJourneySpyOptional } from './journey-spy';
import { TextSizeControl } from './text-size-control';

export type { PathBand } from './journey-spy';

/* A plain left click; a modified click still opens the link its own way. */
export function isPlainClick(event: MouseEvent) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/*
 * The reader's bookmarks, one list for the timeline and the "On this page"
 * sheet. Stored numbers are matched to this page's own cards, so the titles
 * are in the page's language and a number with no card here is left out
 * (storage is per chapter, not per locale). `onPick` takes over a plain click
 * (the sheet closes first, then jumps); without it the link is an ordinary
 * link to the card.
 */
export function JourneyBookmarks({
  heading: Heading = 'p',
  onPick,
  showEmpty = false,
}: {
  heading?: 'h3' | 'p';
  onPick?: (number: number) => void;
  showEmpty?: boolean;
}) {
  const t = useSiteT('ui.chapter');
  const memory = useJourneyMemoryOptional();
  const spy = useJourneySpyOptional();
  const headingId = useId();
  const listRef = useRef<HTMLUListElement>(null);
  const headingRef = useRef<HTMLElement>(null);
  const refocusRef = useRef<number | null>(null);
  /* Where the list sits, for when removing the last bookmark takes the list away. */
  const hostRef = useRef<HTMLElement | null>(null);
  const saved = spy && memory ? spy.stops.filter((stop) => memory.isSaved(stop.number)) : [];

  /* After a remove, keep focus in the list: the next remove button, else the heading. */
  useEffect(() => {
    const index = refocusRef.current;

    if (index === null) return;

    refocusRef.current = null;

    const buttons = listRef.current?.querySelectorAll<HTMLButtonElement>('button') ?? [];
    const next = buttons[Math.min(index, buttons.length - 1)];

    if (next) next.focus();
    else if (headingRef.current) headingRef.current.focus();
    else hostRef.current?.querySelector<HTMLElement>('a[aria-current]')?.focus();
  }, [saved.length]);

  if (!memory || !spy || (!saved.length && !showEmpty)) return null;

  return (
    <section aria-labelledby={headingId} className="oc-journey-marks">
      <Heading
        className="oc-journey-marks-heading"
        id={headingId}
        ref={(node: HTMLElement | null) => {
          headingRef.current = node;
        }}
        tabIndex={-1}
      >
        {t('pathBookmarks', { count: String(saved.length) })}
      </Heading>
      {saved.length ? (
        <ul className="oc-journey-marks-list" ref={listRef}>
          {saved.map((stop, index) => (
            <li key={stop.number}>
              <a
                className={stop.number === spy.active ? 'is-active' : undefined}
                href={`#card-${stop.number}`}
                onClick={(event) => {
                  if (!onPick || !isPlainClick(event)) return;

                  event.preventDefault();
                  onPick(stop.number);
                }}
              >
                <span className="oc-journey-path-num">{String(stop.number).padStart(2, '0')}</span>
                <span className="oc-journey-marks-title">{stop.title}</span>
              </a>
              <button
                aria-label={t('removeBookmarkFor', { title: stop.title })}
                className="oc-journey-marks-remove"
                onClick={() => {
                  refocusRef.current = index;
                  hostRef.current = listRef.current?.closest('nav, [role="dialog"]') ?? null;
                  memory.toggleSave(stop.number);
                }}
                type="button"
              >
                <span aria-hidden>×</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="oc-journey-marks-empty">{t('pathBookmarksEmpty')}</p>
      )}
    </section>
  );
}

/*
 * Sticky Living Trail spine (desktop) and stepping-stone dots (mobile). Spy
 * only — never hijacks scroll. The stop being read comes from the chapter's
 * one spy (./journey-spy.tsx).
 */
export function JourneyPath({ bands }: { bands: PathBand[] }) {
  const t = useSiteT('ui.chapter');
  const memory = useJourneyMemoryOptional();
  const spy = useJourneySpyOptional();
  const active = spy?.active ?? 0;
  const activeBandId = spy?.activeBandId ?? bands[0]?.id ?? '';
  const hasStops = bands.some((band) => band.cards.length > 0);

  const navRef = useRef<HTMLElement>(null);

  /*
   * Keep the active stop inside the HUD's own scroll box. Scrolls the nav only —
   * scrollIntoView would move the page too.
   *
   * A jump into a collapsed group opens that group after the first measure, so
   * the stop moves down while the panel grows (QA, 2026-10-08: stop 26 left
   * below the box at 1440x900). It is centred again once the group has
   * finished opening (its `grid-template-rows` transition) or the list has
   * stopped changing size, for a short while after each change of stop, as the
   * green rail below is measured.
   */
  useEffect(() => {
    const nav = navRef.current;
    const list = nav?.querySelector<HTMLElement>('.oc-journey-path-list');

    if (!nav) return;

    let frame = 0;
    let settle = 0;

    const centre = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        if (nav.scrollHeight <= nav.clientHeight) return;

        const link = nav.querySelector<HTMLElement>('a[aria-current="true"]');

        if (!link) return;

        const navRect = nav.getBoundingClientRect();
        const linkRect = link.getBoundingClientRect();
        const target =
          nav.scrollTop + (linkRect.top - navRect.top) - (nav.clientHeight - linkRect.height) / 2;
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        nav.scrollTo({ top: Math.max(0, target), behavior: reduced ? 'auto' : 'smooth' });
      });
    };
    const onResize = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(centre, 120);
    };
    const onTransitionEnd = (event: TransitionEvent) => {
      if (event.propertyName === 'grid-template-rows') centre();
    };
    const observer = new ResizeObserver(onResize);

    centre();

    if (list) observer.observe(list);

    nav.addEventListener('transitionend', onTransitionEnd);

    const stop = window.setTimeout(() => {
      observer.disconnect();
      nav.removeEventListener('transitionend', onTransitionEnd);
    }, 2000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.clearTimeout(stop);
      observer.disconnect();
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

  if (!hasStops) return null;

  return (
    <nav aria-label={t('pathSpine')} className="oc-journey-path oc-journey-hud" ref={navRef}>
      <div className="oc-journey-path-inner">
        <p className="oc-journey-path-heading">{t('pathHeading')}</p>
        <TextSizeControl />
        <JourneyBookmarks />
        <div className="oc-journey-path-body">
          <span aria-hidden className="oc-journey-path-rail" ref={railRef}>
            <span className="oc-journey-path-rail-fill" ref={railFillRef} />
          </span>
          <ol className="oc-journey-path-list">
            {bands.map((band) => {
              const isOpen = band.id === activeBandId || bands.length === 1;
              const bandSaved = band.cards.filter(({ card }) =>
                memory?.isSaved(card.number),
              ).length;

              return (
                <li
                  className={
                    isOpen ? 'oc-journey-path-group is-open' : 'oc-journey-path-group is-collapsed'
                  }
                  key={band.id}
                >
                  <a
                    aria-expanded={isOpen}
                    className={isOpen ? 'oc-journey-path-band is-current' : 'oc-journey-path-band'}
                    href={band.id === bands[0]?.id ? '#chapter-care' : `#${band.id}`}
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
                              className={
                                [isActive ? 'is-active' : '', isSaved ? 'is-saved' : '']
                                  .filter(Boolean)
                                  .join(' ') || undefined
                              }
                              href={`#card-${card.number}`}
                              tabIndex={isOpen ? undefined : -1}
                              title={card.title}
                            >
                              <span aria-hidden className="oc-journey-path-dot" />
                              <span className="oc-journey-path-num">
                                {String(card.number).padStart(2, '0')}
                              </span>
                              <span className="oc-journey-path-copy">
                                <span className="oc-journey-path-title">{card.title}</span>
                                {isSaved ? (
                                  <span className="oc-journey-path-saved">
                                    {t('pathSavedMark')}
                                  </span>
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
  cards: Array<{ card: CategoryCard }>;
  label: string;
}) {
  const t = useSiteT('ui.chapter');
  const memory = useJourneyMemoryOptional();
  /* Marked only while the card being read is in this band. */
  const active = useJourneySpyOptional()?.active ?? 0;

  /* A band of one card gets its dot too, or that stop has no way in here. */
  if (!cards.length) return null;

  return (
    <nav aria-label={`${t('pathSpine')}: ${label}`} className="oc-journey-band-dots">
      {cards.map(({ card }) => {
        const isActive = card.number === active;
        const isSaved = memory?.isSaved(card.number) ?? false;

        return (
          <a
            aria-current={isActive ? 'true' : undefined}
            className={
              [isActive ? 'is-active' : '', isSaved ? 'is-saved' : ''].filter(Boolean).join(' ') ||
              undefined
            }
            href={`#card-${card.number}`}
            key={card.number}
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
