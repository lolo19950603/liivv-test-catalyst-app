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
 * That is a statement about this figure's markup, and it stops there. With
 * JavaScript off the reader gets none of the page: every route in the (default)
 * group is streamed inside the Suspense boundary that
 * `app/[locale]/(default)/loading.tsx` opens, so the body arrives in a
 * `<div hidden>` that only an inline script moves into the document, and a
 * reader without scripting is left on the spinner. Site-wide, not this figure's,
 * and not fixable from here — recorded as residual #12.
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
