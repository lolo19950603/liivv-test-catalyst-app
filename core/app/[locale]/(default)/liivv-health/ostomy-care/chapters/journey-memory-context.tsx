'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useTranslations } from 'next-intl';

import {
  readContinue,
  readSaved,
  writeContinue,
  writeSaved,
  type ContinueStop,
} from './journey-memory';

type JourneyMemoryValue = {
  slug: string;
  saved: Set<number>;
  toggleSave: (number: number) => void;
  isSaved: (number: number) => boolean;
  rememberStop: (number: number, title: string) => void;
  trackProgress: boolean;
  continueStop: ContinueStop | null;
  showContinue: boolean;
  dismissContinue: () => void;
};

const JourneyMemoryContext = createContext<JourneyMemoryValue | null>(null);

export function JourneyMemoryProvider({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  const [saved, setSaved] = useState<number[]>([]);
  const [continueStop, setContinueStop] = useState<ContinueStop | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [trackProgress, setTrackProgress] = useState(false);

  useEffect(() => {
    const stored = readSaved(slug);
    const resume = readContinue(slug);
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const hasCardHash = /^#card-\d+/.test(hash);

    setSaved(stored);
    setContinueStop(resume);
    /* Only offer Continue when landing without a deep link. */
    setShowContinue(Boolean(resume) && !hasCardHash);
    setTrackProgress(false);

    /*
     * Wait a beat before persisting the spy target so the first Intersection
     * Observer pass does not wipe the stored Continue stop.
     */
    const timer = window.setTimeout(() => setTrackProgress(true), 1200);

    return () => window.clearTimeout(timer);
  }, [slug]);

  const toggleSave = useCallback(
    (number: number) => {
      setSaved((prev) => {
        const next = prev.includes(number) ? prev.filter((n) => n !== number) : [...prev, number].sort((a, b) => a - b);

        writeSaved(slug, next);

        return next;
      });
    },
    [slug],
  );

  const rememberStop = useCallback(
    (number: number, title: string) => {
      writeContinue(slug, { number, title });
      /*
       * Leave continueStop alone while the chip is up — otherwise the spy
       * would rewrite the invite mid-view. Storage still updates for next visit.
       */
    },
    [slug],
  );

  const dismissContinue = useCallback(() => {
    setShowContinue(false);
  }, []);

  const savedSet = useMemo(() => new Set(saved), [saved]);

  const value = useMemo<JourneyMemoryValue>(
    () => ({
      slug,
      saved: savedSet,
      toggleSave,
      isSaved: (number) => savedSet.has(number),
      rememberStop,
      trackProgress,
      continueStop,
      showContinue,
      dismissContinue,
    }),
    [slug, savedSet, toggleSave, rememberStop, trackProgress, continueStop, showContinue, dismissContinue],
  );

  return <JourneyMemoryContext.Provider value={value}>{children}</JourneyMemoryContext.Provider>;
}

export function useJourneyMemory() {
  const ctx = useContext(JourneyMemoryContext);

  if (!ctx) {
    throw new Error('useJourneyMemory must be used within JourneyMemoryProvider');
  }

  return ctx;
}

/** Safe when outside the provider (e.g. non-journey layouts). */
export function useJourneyMemoryOptional() {
  return useContext(JourneyMemoryContext);
}

export function JourneyContinueChip() {
  const t = useTranslations('OstomyCare.ui.chapter');
  const memory = useJourneyMemoryOptional();

  if (!memory?.showContinue || !memory.continueStop) return null;

  const { continueStop, dismissContinue } = memory;

  return (
    <p className="oc-journey-continue">
      <a
        className="oc-journey-continue-link"
        href={`#card-${continueStop.number}`}
        onClick={dismissContinue}
      >
        {t('continueReading', { title: continueStop.title })}
      </a>
    </p>
  );
}
