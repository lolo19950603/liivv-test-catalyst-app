'use client';

/*
 * =============================================================================
 * OPENING GAP COMPARISON — SHAPE TOGGLE (C07)
 * =============================================================================
 * Loaded with next/dynamic after hydration, only where the gap figure renders.
 * Both shapes are already in the server HTML (gap-compare-figure.tsx); this
 * island never draws anything and never writes a caption. It flips one class on
 * the figure, and the stylesheet shows the oval drawings instead of the round
 * ones.
 *
 * So before this loads, the three panels and their captions are all there — the
 * round drawings, which is what the card's own sentence calls the common case
 * before it says many stomas are oval.
 *
 * That is a statement about this figure's markup, and with JavaScript off it is
 * now what the reader gets. The `loading.tsx` at `app/[locale]/(default)` used to
 * wrap every route in the group in a Suspense boundary, so the body arrived in a
 * `<div hidden>` that only an inline script moved into the document and a reader
 * without scripting was left on the spinner. It has been removed. The toggle is
 * still an enhancement: without it the round drawings stand, which is the case
 * the card's own sentence names first.
 *
 * The toggle changes the drawn shape and nothing else: no panel is selected,
 * ranked or marked correct, no caption changes, and nothing is stored, put in
 * the URL or sent anywhere.
 * =============================================================================
 */

import { useTranslations } from 'next-intl';
import { type RefObject, useEffect, useState } from 'react';

const OVAL_CLASS = 'is-oval';

export function GapCompareToggle({ root }: { root: RefObject<HTMLDivElement | null> }) {
  const t = useTranslations('OstomyCare.ui.chapter.gap');
  const [oval, setOval] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    const el = root.current;

    el?.classList.toggle(OVAL_CLASS, oval);

    return () => el?.classList.remove(OVAL_CLASS);
  }, [root, oval]);

  const pick = (next: boolean) => {
    setOval(next);
    setAnnouncement(next ? t('statusOval') : t('statusRound'));
  };

  return (
    <div className="oc-fig-gap-controls">
      <div aria-label={t('legend')} className="oc-fig-gap-seg" role="group">
        <button
          aria-pressed={!oval}
          className="oc-fig-gap-btn"
          onClick={() => pick(false)}
          type="button"
        >
          {t('round')}
        </button>
        <button
          aria-pressed={oval}
          className="oc-fig-gap-btn"
          onClick={() => pick(true)}
          type="button"
        >
          {t('oval')}
        </button>
      </div>
      <p className="oc-fig-gap-status" role="status">
        {announcement}
      </p>
    </div>
  );
}
