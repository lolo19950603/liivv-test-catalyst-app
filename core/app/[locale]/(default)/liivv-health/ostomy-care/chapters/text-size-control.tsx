'use client';

import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { TEXT_SIZE_STORAGE_KEY as STORAGE_KEY, type TextSize } from './text-size';

const CHANGE_EVENT = 'oc-text-size-change';
const SIZES: TextSize[] = ['md', 'lg', 'xl'];

let mounted = 0;

function isTextSize(value: unknown): value is TextSize {
  return value === 'md' || value === 'lg' || value === 'xl';
}

function readTextSize(): TextSize {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);

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
  const t = useTranslations('OstomyCare.ui.chapter');
  const [size, setSize] = useState<TextSize>('md');

  useEffect(() => {
    const initial = readTextSize();

    applyTextSize(initial);
    setSize(initial);

    const sync = () => setSize(readTextSize());

    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener('storage', sync);

    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    mounted += 1;

    return () => {
      mounted -= 1;

      // Leaving the chapter must not keep the whole site scaled.
      if (mounted === 0) delete document.documentElement.dataset.ocText;
    };
  }, []);

  const choose = useCallback((next: TextSize) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the size still applies for this visit.
    }

    applyTextSize(next);
    setSize(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

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
