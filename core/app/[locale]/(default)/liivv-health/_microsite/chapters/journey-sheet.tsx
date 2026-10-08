/* Twin of ostomy-care/chapters/journey-sheet.tsx (new 2026-10-07) — port fixes both ways until Phase 2 */

'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useSiteT } from '../site-context';

import { useJourneyMemoryOptional } from './journey-memory-context';
import { isPlainClick, JourneyBookmarks } from './journey-path';
import { useJourneySpyOptional } from './journey-spy';

/* The strip at the foot of the window the button sits in. */
const BUTTON_STRIP = 96;

/* Lines that must never be covered: "Call 911…" panels and each card's exit line. */
const URGENT = '#oc-chapter .oc-ch-urgent-panel, #oc-chapter .oc-fig-exit';

/*
 * "On this page" for windows under 1024px, where the timeline is not shown
 * (owner note 6, 2026-10-07). A button at the bottom left, clear of the chat
 * avatar on the right, says where the reader is ("3 of 11") and how many stops
 * are bookmarked; it opens a bottom sheet with the Continue point, the
 * bookmarks and every stop, band by band.
 *
 * The button shows only while the chapter's stops fill the foot of the window
 * (not over the hero, and gone before the sections after the chapter, which
 * sit above it at z-index 70). It steps aside while a "Call 911" panel or an
 * exit line is in the lower 30% of the window, and while a form field has focus
 * (the phone's keyboard is up), unless it has focus itself.
 *
 * The sheet is a Radix dialog (focus trap, Escape, focus back to the button),
 * portalled into #oc-chapter, where the chapter's colours and sizes are
 * defined. Choosing a stop closes it, then jumps, so the jump is not undone by
 * focus going back to the button.
 */
export function JourneySheet() {
  const t = useSiteT('ui.chapter');
  const spy = useJourneySpyOptional();
  const memory = useJourneyMemoryOptional();
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [inView, setInView] = useState(false);
  const [tucked, setTucked] = useState(false);
  const [focused, setFocused] = useState(false);
  const pendingRef = useRef<number | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setContainer(document.getElementById('oc-chapter'));
  }, []);

  useEffect(() => {
    if (!container) return;

    let frame = 0;

    const compute = () => {
      frame = 0;

      const shell = container.querySelector('.oc-journey-shell');

      if (!shell) return;

      const height = window.innerHeight;
      const rect = shell.getBoundingClientRect();
      /* The section after the chapter rounds up over the shell's foot. */
      let after = shell.nextElementSibling;

      while (after && !(after instanceof HTMLElement && after.offsetHeight > 0)) {
        after = after.nextElementSibling;
      }

      const end = after ? after.getBoundingClientRect().top : rect.bottom;
      const urgent = [...document.querySelectorAll(URGENT)].some((node) => {
        const box = node.getBoundingClientRect();

        return box.height > 0 && box.top < height && box.bottom > height * 0.7;
      });
      const field = document.activeElement?.matches('input, select, textarea') ?? false;

      setInView(rect.top <= height - BUTTON_STRIP && end >= height);
      setTucked(urgent || field);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    document.addEventListener('focusin', schedule);
    document.addEventListener('focusout', schedule);
    schedule();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);

      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      document.removeEventListener('focusin', schedule);
      document.removeEventListener('focusout', schedule);
    };
  }, [container]);

  /* On open, centre the current stop inside the sheet (the page does not move). */
  useEffect(() => {
    if (!open) return;

    const frame = window.requestAnimationFrame(() => {
      const body = bodyRef.current;
      const row = body?.querySelector<HTMLElement>('a[aria-current="location"]');

      if (!body || !row) return;

      const offset = row.getBoundingClientRect().top - body.getBoundingClientRect().top;

      body.scrollTop = Math.max(
        0,
        body.scrollTop + offset - (body.clientHeight - row.offsetHeight) / 2,
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  const pick = useCallback((number: number) => {
    pendingRef.current = number;
    setOpen(false);
  }, []);

  if (!spy?.stops.length || !container) return null;

  const { active, activeIndex, bands, jumpTo, stops } = spy;
  const savedCount = memory ? stops.filter((stop) => memory.isSaved(stop.number)).length : 0;
  /* The Continue point from the last visit, when it is not where the reader is now. */
  const resumeNumber = memory?.continueStop?.number;
  const resumeStop =
    resumeNumber === active ? undefined : stops.find((stop) => stop.number === resumeNumber);
  const away = !open && !focused && (!inView || tucked);

  return (
    <Dialog.Root onOpenChange={setOpen} open={open}>
      <div
        className={away ? 'oc-journey-fab-wrap is-away' : 'oc-journey-fab-wrap'}
        inert={away || undefined}
      >
        <Dialog.Trigger
          className="oc-journey-fab"
          onBlur={() => setFocused(false)}
          onFocus={() => setFocused(true)}
        >
          <span className="oc-journey-fab-label">{t('onThisPage')}</span>
          <span className="oc-journey-fab-meta">
            <span className="oc-journey-fab-progress">
              {t('onThisPageProgress', {
                current: String(activeIndex + 1),
                total: String(stops.length),
              })}
            </span>
            {savedCount > 0 ? (
              <>
                <span aria-hidden className="oc-journey-fab-saved">
                  {savedCount}
                </span>
                <span className="sr-only">
                  {', '}
                  {t('pathBandBookmarked', { count: savedCount })}
                </span>
              </>
            ) : null}
          </span>
        </Dialog.Trigger>
      </div>
      <Dialog.Portal container={container}>
        <Dialog.Overlay className="oc-journey-sheet-overlay" />
        <Dialog.Content
          aria-describedby={undefined}
          className="oc-journey-sheet"
          onCloseAutoFocus={(event) => {
            const number = pendingRef.current;

            if (number === null) return;

            pendingRef.current = null;
            event.preventDefault();
            window.requestAnimationFrame(() => jumpTo(number));
          }}
        >
          <div className="oc-journey-sheet-head">
            <Dialog.Title className="oc-journey-sheet-title">{t('onThisPage')}</Dialog.Title>
            <Dialog.Close aria-label={t('closeSheet')} className="oc-journey-sheet-close">
              <span aria-hidden>×</span>
            </Dialog.Close>
          </div>
          <div className="oc-journey-sheet-body" ref={bodyRef}>
            {resumeStop ? (
              <p className="oc-journey-continue">
                <a
                  className="oc-journey-continue-link"
                  href={`#card-${resumeStop.number}`}
                  onClick={(event) => {
                    if (!isPlainClick(event)) return;

                    event.preventDefault();
                    memory?.dismissContinue();
                    pick(resumeStop.number);
                  }}
                >
                  {t('continueReading', { title: resumeStop.title })}
                </a>
              </p>
            ) : null}
            <JourneyBookmarks heading="h3" onPick={pick} showEmpty />
            <nav aria-label={t('pathSpine')} className="oc-journey-sheet-stops">
              {bands.map((band) => (
                <section aria-labelledby={`${band.id}-sheet`} key={band.id}>
                  <h3 className="oc-journey-sheet-band" id={`${band.id}-sheet`}>
                    {band.label}
                    <span className="oc-journey-sheet-count">
                      {t('pathBandCount', { count: band.cards.length })}
                    </span>
                  </h3>
                  <ol>
                    {band.cards.map(({ card }) => {
                      const isActive = card.number === active;
                      const isSaved = memory?.isSaved(card.number) ?? false;

                      return (
                        <li key={card.number}>
                          <a
                            aria-current={isActive ? 'location' : undefined}
                            className={
                              [isActive ? 'is-active' : '', isSaved ? 'is-saved' : '']
                                .filter(Boolean)
                                .join(' ') || undefined
                            }
                            href={`#card-${card.number}`}
                            onClick={(event) => {
                              if (!isPlainClick(event)) return;

                              event.preventDefault();
                              pick(card.number);
                            }}
                          >
                            <span aria-hidden className="oc-journey-path-dot" />
                            <span className="oc-journey-path-num">
                              {String(card.number).padStart(2, '0')}
                            </span>
                            <span className="oc-journey-path-copy">
                              <span className="oc-journey-path-title">{card.title}</span>
                              {isActive ? (
                                <span className="oc-journey-sheet-here">{t('pathHere')}</span>
                              ) : null}
                              {isSaved ? (
                                <span className="oc-journey-path-saved">{t('pathSavedMark')}</span>
                              ) : null}
                            </span>
                          </a>
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </nav>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
