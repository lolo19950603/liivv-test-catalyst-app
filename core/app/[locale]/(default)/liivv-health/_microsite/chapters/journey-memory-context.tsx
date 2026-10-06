/* Twin of ostomy-care/chapters/journey-memory-context.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useSite, useSiteT } from '../site-context';

import {
  type ContinueStop,
  readContinue,
  readSaved,
  writeContinue,
  writeSaved,
} from './journey-memory';

interface JourneyMemoryValue {
  slug: string;
  saved: Set<number>;
  toggleSave: (number: number) => void;
  isSaved: (number: number) => boolean;
  rememberStop: (number: number, title: string) => void;
  trackProgress: boolean;
  continueStop: ContinueStop | null;
  showContinue: boolean;
  dismissContinue: () => void;
}

const JourneyMemoryContext = createContext<JourneyMemoryValue | null>(null);

export function JourneyMemoryProvider({ slug, children }: { slug: string; children: ReactNode }) {
  const { storage } = useSite();
  const [saved, setSaved] = useState<number[]>([]);
  const [continueStop, setContinueStop] = useState<ContinueStop | null>(null);
  const [showContinue, setShowContinue] = useState(false);
  const [trackProgress, setTrackProgress] = useState(false);

  useEffect(() => {
    const stored = readSaved(storage, slug);
    const resume = readContinue(storage, slug);
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
  }, [storage, slug]);

  const toggleSave = useCallback(
    (number: number) => {
      setSaved((prev) => {
        const next = prev.includes(number)
          ? prev.filter((n) => n !== number)
          : [...prev, number].sort((a, b) => a - b);

        writeSaved(storage, slug, next);

        return next;
      });
    },
    [storage, slug],
  );

  const rememberStop = useCallback(
    (number: number, title: string) => {
      writeContinue(storage, slug, { number, title });
      /*
       * Leave continueStop alone while the chip is up — otherwise the spy
       * would rewrite the invite mid-view. Storage still updates for next visit.
       */
    },
    [storage, slug],
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
    [
      slug,
      savedSet,
      toggleSave,
      rememberStop,
      trackProgress,
      continueStop,
      showContinue,
      dismissContinue,
    ],
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

/* Safe when outside the provider (e.g. non-journey layouts). */
export function useJourneyMemoryOptional() {
  return useContext(JourneyMemoryContext);
}

/*
 * The stored stop is a card number. Its title is read from this page's own
 * cards, so the chip is in this page's language whichever locale the stop was
 * stored from; a stop whose card is no longer on the page offers nothing.
 */
export function JourneyContinueChip({
  cards,
}: {
  cards: Array<{ number: number; title: string }>;
}) {
  const t = useSiteT('ui.chapter');
  const memory = useJourneyMemoryOptional();

  if (!memory?.showContinue || !memory.continueStop) return null;

  const { continueStop, dismissContinue } = memory;
  const title = cards.find((card) => card.number === continueStop.number)?.title;

  if (!title) return null;

  return (
    <p className="oc-journey-continue">
      <a
        className="oc-journey-continue-link"
        href={`#card-${continueStop.number}`}
        onClick={dismissContinue}
      >
        {t('continueReading', { title })}
      </a>
    </p>
  );
}
