/* Twin of ostomy-care/chapters/text-size-control.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

import { useCallback, useEffect, useState } from 'react';

import { useSite, useSiteT } from '../site-context';

/*
 * The saved size lives under the site's own key, and the controls on a page
 * keep in step through the site's own window event (`textSize` and
 * `textSizeEvent` in its `site.storage`). What the size does is shared: the
 * `html[data-oc-text]` hook in the shared stylesheet, written here and before
 * paint by `textSizePrePaint` in ./route.ts.
 */
export type TextSize = 'md' | 'lg' | 'xl';

const SIZES: TextSize[] = ['md', 'lg', 'xl'];

let mounted = 0;

function isTextSize(value: unknown): value is TextSize {
  return value === 'md' || value === 'lg' || value === 'xl';
}

function readTextSize(key: string): TextSize {
  try {
    const stored = window.localStorage.getItem(key);

    return isTextSize(stored) ? stored : 'md';
  } catch {
    return 'md';
  }
}

function applyTextSize(size: TextSize) {
  if (size === 'md') {
    delete document.documentElement.dataset.ocText;
  } else {
    document.documentElement.dataset.ocText = size;
  }
}

/*
 * A / A+ / A++ control. Several instances can be on the page (hero, HUD,
 * mobile act title); they stay in step through a window event.
 */
export function TextSizeControl() {
  const t = useSiteT('ui.chapter');
  const { storage } = useSite();
  const storageKey = storage.textSize;
  const changeEvent = storage.textSizeEvent;
  const [size, setSize] = useState<TextSize>('md');

  useEffect(() => {
    const initial = readTextSize(storageKey);

    applyTextSize(initial);
    setSize(initial);

    const sync = () => setSize(readTextSize(storageKey));

    window.addEventListener(changeEvent, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(changeEvent, sync);
      window.removeEventListener('storage', sync);
    };
  }, [storageKey, changeEvent]);

  useEffect(() => {
    mounted += 1;

    return () => {
      mounted -= 1;

      // Leaving the chapter must not keep the whole site scaled.
      if (mounted === 0) delete document.documentElement.dataset.ocText;
    };
  }, []);

  const choose = useCallback(
    (next: TextSize) => {
      try {
        window.localStorage.setItem(storageKey, next);
      } catch {
        // Storage can be blocked; the size still applies for this visit.
      }

      applyTextSize(next);
      setSize(next);
      window.dispatchEvent(new Event(changeEvent));
    },
    [storageKey, changeEvent],
  );

  const labels: Record<TextSize, string> = {
    md: t('textSizeDefault'),
    lg: t('textSizeLarger'),
    xl: t('textSizeLargest'),
  };
  const glyphs: Record<TextSize, string> = { md: 'A', lg: 'A+', xl: 'A++' };

  return (
    <div className="oc-text-size">
      <span aria-hidden className="oc-text-size-label">
        {t('textSize')}
      </span>
      <div aria-label={t('textSize')} className="oc-text-size-group" role="group">
        {SIZES.map((item) => (
          <button
            aria-label={labels[item]}
            aria-pressed={size === item}
            key={item}
            onClick={() => choose(item)}
            title={labels[item]}
            type="button"
          >
            {glyphs[item]}
          </button>
        ))}
      </div>
    </div>
  );
}
