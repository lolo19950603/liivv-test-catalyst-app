'use client';

import { useTranslations } from 'next-intl';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import type { LineTiming } from '~/lib/chapter-audio/normalize';

import {
  activeLineIndex,
  fetchTimings,
  findLineElements,
  LINE_CLASS,
  lineEnd,
  pageOrder,
  playedShare,
} from './read-along';

export interface AudioStop {
  /** 0 is the chapter intro; otherwise the card number (`#card-<n>`). */
  stop: number;
  title: string;
}

type Status = 'idle' | 'loading' | 'playing' | 'paused' | 'waiting' | 'ended' | 'error';

interface AudioContextValue {
  current: AudioStop | null;
  status: Status;
  playFrom: (stop: number) => void;
}

const ChapterAudioContext = createContext<AudioContextValue | null>(null);

const RATE_KEY = 'oc-audio-rate';
const RATES = [0.75, 1, 1.25];
const AUTO_KEY = 'oc-audio-auto';

function readRate(): number {
  try {
    const stored = Number(window.localStorage.getItem(RATE_KEY));

    return RATES.includes(stored) ? stored : 1;
  } catch {
    return 1;
  }
}

function readAutoAdvance(): boolean {
  try {
    return window.localStorage.getItem(AUTO_KEY) !== 'off';
  } catch {
    return true;
  }
}

function store(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage can be blocked; the choice still applies for this visit.
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

interface ReadAlong {
  lines: LineTiming[];
  elements: Array<HTMLElement | null>;
  active: number;
  /** Script line indices in page order, and how far through that order we are. */
  order: number[];
  pos: number;
}

/* Cut a line just before the next recorded one starts; lines are split by pauses. */
const LINE_CUT_S = 0.06;

/* After the reader scrolls by hand, leave the page where they put it for a while. */
const HAND_SCROLL_PAUSE_MS = 5000;

function keepInView(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const barHeight =
    Number.parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--oc-audio-bar-h')) ||
    0;

  if (rect.top >= 80 && rect.bottom <= window.innerHeight - barHeight - 16) return;

  el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
}

/* Page order, not number order: the journey groups cards into acts. */
function orderByPage(stops: AudioStop[]): AudioStop[] {
  const position = (stop: AudioStop) => {
    if (stop.stop === 0) return -1;

    const el = document.getElementById(`card-${stop.stop}`);

    return el ? el.getBoundingClientRect().top + window.scrollY : Number.MAX_SAFE_INTEGER;
  };

  return [...stops].sort((a, b) => position(a) - position(b));
}

export function ChapterAudioProvider({
  enabled,
  slug,
  locale,
  stops,
  children,
}: {
  enabled: boolean;
  slug: string;
  locale: string;
  stops: AudioStop[];
  children: ReactNode;
}) {
  const t = useTranslations('OstomyCare.ui.chapter.audio');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const prefetchRef = useRef<HTMLAudioElement | null>(null);
  const [queue, setQueue] = useState<AudioStop[]>([]);
  const [index, setIndex] = useState(-1);
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [closing, setClosing] = useState(false);
  const closeTimerRef = useRef<number | undefined>(undefined);

  const current = index >= 0 ? (queue[index] ?? null) : null;
  const hasNext = index + 1 < queue.length;

  const srcFor = useCallback(
    (stop: number) =>
      `/api/chapter-audio?${new URLSearchParams({ locale, slug, stop: String(stop) }).toString()}`,
    [locale, slug],
  );

  useEffect(() => {
    setRate(readRate());
    setAutoAdvance(readAutoAdvance());
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = rate;
  }, [rate]);

  // Load and play whenever the current stop changes.
  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !current) return;

    setStatus('loading');
    setProgress(0);
    audio.src = srcFor(current.stop);
    audio.playbackRate = rate;
    audio.play().catch(() => setStatus('error'));

    const next = queue[index + 1];

    if (next) {
      prefetchRef.current ??= new Audio();
      prefetchRef.current.preload = 'auto';
      prefetchRef.current.src = srcFor(next.stop);
    }

    if (current.stop > 0) {
      const card = document.getElementById(`card-${current.stop}`);

      card?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
    }

    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({ title: current.title });
    }
    // `rate` is applied by its own effect; re-running here would restart the stop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, srcFor]);

  const readAlongRef = useRef<ReadAlong | null>(null);
  const handScrollAtRef = useRef(0);

  const syncLine = useCallback((time: number) => {
    const state = readAlongRef.current;

    if (!state) return;

    const line = activeLineIndex(state.lines, time);

    if (line === state.active) return;

    state.elements[state.active]?.classList.remove(LINE_CLASS);
    state.active = line;

    const el = state.elements[line];

    if (!el) return;

    el.classList.add(LINE_CLASS);

    // The first line is the heading; the stop's own scroll already brings it in.
    if (line > 0 && Date.now() - handScrollAtRef.current > HAND_SCROLL_PAUSE_MS) keepInView(el);
  }, []);

  // Line-by-line highlight, from start times made once per audio file.
  useEffect(() => {
    if (!current) return;

    let cancelled = false;

    void fetchTimings(`${srcFor(current.stop)}&format=timings`).then((lines) => {
      if (cancelled || !lines) return;

      const elements = findLineElements(current.stop, lines);
      const order = pageOrder(elements);
      const time = audioRef.current?.currentTime ?? 0;

      readAlongRef.current = {
        lines,
        elements,
        active: -1,
        order,
        pos: Math.max(order.indexOf(activeLineIndex(lines, time)), 0),
      };
      syncLine(time);
    });

    return () => {
      cancelled = true;

      const state = readAlongRef.current;

      state?.elements[state.active]?.classList.remove(LINE_CLASS);
      readAlongRef.current = null;
    };
  }, [current, srcFor, syncLine]);

  useEffect(() => {
    if (!current) return;

    const markHandScroll = () => {
      handScrollAtRef.current = Date.now();
    };
    const onKey = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) {
        markHandScroll();
      }
    };

    window.addEventListener('wheel', markHandScroll, { passive: true });
    window.addEventListener('touchmove', markHandScroll, { passive: true });
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('wheel', markHandScroll);
      window.removeEventListener('touchmove', markHandScroll);
      window.removeEventListener('keydown', onKey);
    };
  }, [current]);

  // Mark the stop being read so it stands out while the voice follows along.
  useEffect(() => {
    if (!current || current.stop === 0) return;

    const card = document.getElementById(`card-${current.stop}`);

    card?.classList.add('is-audio-current');

    return () => card?.classList.remove('is-audio-current');
  }, [current]);

  // Publish the bar's height so the chat dock and page end can sit above it.
  const barOpen = Boolean(current);

  useEffect(() => {
    const bar = barRef.current;

    if (!barOpen || !bar) return;

    const root = document.documentElement;
    const observer = new ResizeObserver(() => {
      root.style.setProperty('--oc-audio-bar-h', `${bar.offsetHeight}px`);
    });

    observer.observe(bar);

    return () => {
      observer.disconnect();
      root.style.removeProperty('--oc-audio-bar-h');
    };
  }, [barOpen]);

  const playFrom = useCallback(
    (stop: number) => {
      const ordered = orderByPage(stops);
      const start = ordered.findIndex((item) => item.stop === stop);

      window.clearTimeout(closeTimerRef.current);
      setClosing(false);
      setQueue(ordered);
      setIndex(Math.max(start, 0));
    },
    [stops],
  );

  const goTo = useCallback(
    (next: number) => {
      if (next >= 0 && next < queue.length) setIndex(next);
    },
    [queue.length],
  );

  const toggle = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) return;

    if (status === 'waiting') {
      goTo(index + 1);
    } else if (audio.paused) {
      audio.play().catch(() => setStatus('error'));
    } else {
      audio.pause();
    }
  }, [goTo, index, status]);

  // Keep the bar mounted long enough for its slide-out (matches the CSS duration).
  const close = useCallback(() => {
    audioRef.current?.pause();
    setClosing(true);
    window.clearTimeout(closeTimerRef.current);
    closeTimerRef.current = window.setTimeout(
      () => {
        setIndex(-1);
        setStatus('idle');
        setClosing(false);
      },
      prefersReducedMotion() ? 0 : 260,
    );
  }, []);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  const chooseRate = useCallback((next: number) => {
    setRate(next);
    store(RATE_KEY, String(next));
  }, []);

  const toggleAutoAdvance = useCallback(() => {
    setAutoAdvance((prev) => {
      store(AUTO_KEY, prev ? 'off' : 'on');

      return !prev;
    });
  }, []);

  const finishStop = useCallback(() => {
    if (!hasNext) {
      setStatus('ended');
    } else if (autoAdvance) {
      setIndex(index + 1);
    } else {
      setStatus('waiting');
    }
  }, [autoAdvance, hasNext, index]);

  // Move on to the next line in page order; jump in the file when that is not the next recorded line.
  const advanceLine = useCallback(
    (ended: boolean) => {
      const audio = audioRef.current;
      const state = readAlongRef.current;
      const line = state?.order[state.pos];

      if (!audio || !state || line === undefined) {
        if (ended) finishStop();

        return;
      }

      if (!ended && audio.currentTime < lineEnd(state.lines, line) - LINE_CUT_S) return;

      state.pos += 1;

      const next = state.order[state.pos];

      if (next === undefined) {
        audio.pause();
        finishStop();

        return;
      }

      if (next !== line + 1 || ended) {
        audio.currentTime = state.lines[next]?.start ?? 0;
        if (ended) audio.play().catch(() => setStatus('error'));
      }
    },
    [finishStop],
  );

  // Line ends are checked every frame: timeupdate alone is too coarse and would clip into the next line.
  useEffect(() => {
    if (status !== 'playing') return;

    let frame = 0;
    const tick = () => {
      advanceLine(false);
      frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);

    return () => window.cancelAnimationFrame(frame);
  }, [advanceLine, status]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('previoustrack', () => goTo(index - 1));
    navigator.mediaSession.setActionHandler('nexttrack', () => goTo(index + 1));

    return () => {
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
    };
  }, [goTo, index]);

  const value = useMemo<AudioContextValue | null>(
    () => (enabled ? { current, status, playFrom } : null),
    [enabled, current, status, playFrom],
  );

  const statusText: Record<Status, string> = {
    idle: '',
    loading: t('loading'),
    playing: t('nowPlaying'),
    paused: t('paused'),
    waiting: t('sectionDone'),
    ended: t('finished'),
    error: t('error'),
  };

  let mainLabel = t('play');

  if (status === 'playing') mainLabel = t('pause');
  if (status === 'waiting') mainLabel = t('continueNext');

  return (
    <ChapterAudioContext.Provider value={value}>
      {children}
      {enabled ? (
        <>
          {/* eslint-disable-next-line jsx-a11y/media-has-caption -- the spoken words are the page text itself */}
          <audio
            onEnded={() => advanceLine(true)}
            onError={() => {
              if (current) setStatus('error');
            }}
            onPause={() => setStatus((prev) => (prev === 'playing' ? 'paused' : prev))}
            onPlaying={() => setStatus('playing')}
            onTimeUpdate={(event) => {
              const { currentTime, duration } = event.currentTarget;

              const state = readAlongRef.current;
              let share = duration ? currentTime / duration : 0;

              if (state) share = playedShare(state.lines, state.order, state.pos, currentTime, duration);

              setProgress(share);
              syncLine(currentTime);
            }}
            preload="none"
            ref={audioRef}
          />
          {current ? (
            <div
              aria-label={t('player')}
              className={closing ? 'oc-audio-bar is-closing' : 'oc-audio-bar'}
              ref={barRef}
              role="region"
            >
              <div className="oc-audio-bar-inner">
                <div className="oc-audio-now">
                  <span aria-live="polite" className="oc-audio-status">
                    {statusText[status]}
                  </span>
                  <span className="oc-audio-title">{current.title}</span>
                  {status === 'waiting' ? (
                    <button className="oc-audio-continue" onClick={() => goTo(index + 1)} type="button">
                      {t('continueNext')}
                      <span aria-hidden>→</span>
                    </button>
                  ) : (
                    <span aria-hidden className="oc-audio-progress">
                      <span style={{ width: `${Math.round(progress * 100)}%` }} />
                    </span>
                  )}
                </div>
                <div className="oc-audio-controls">
                  <button
                    aria-label={t('previous')}
                    disabled={index <= 0}
                    onClick={() => goTo(index - 1)}
                    title={t('previous')}
                    type="button"
                  >
                    <span aria-hidden>⏮</span>
                  </button>
                  <button
                    aria-label={mainLabel}
                    className="oc-audio-main"
                    onClick={toggle}
                    title={mainLabel}
                    type="button"
                  >
                    <span aria-hidden>{status === 'playing' ? '❚❚' : '▶'}</span>
                  </button>
                  <button
                    aria-label={t('next')}
                    disabled={index >= queue.length - 1}
                    onClick={() => goTo(index + 1)}
                    title={t('next')}
                    type="button"
                  >
                    <span aria-hidden>⏭</span>
                  </button>
                  <div aria-label={t('speed')} className="oc-audio-rates" role="group">
                    {RATES.map((item) => (
                      <button
                        aria-pressed={rate === item}
                        key={item}
                        onClick={() => chooseRate(item)}
                        type="button"
                      >
                        {item}×
                      </button>
                    ))}
                  </div>
                  <button
                    aria-checked={autoAdvance}
                    className="oc-audio-auto"
                    onClick={toggleAutoAdvance}
                    role="switch"
                    type="button"
                  >
                    <span aria-hidden className="oc-audio-auto-track" />
                    {t('autoContinue')}
                  </button>
                  <button
                    aria-label={t('close')}
                    className="oc-audio-close"
                    onClick={close}
                    title={t('close')}
                    type="button"
                  >
                    <span aria-hidden>✕</span>
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </ChapterAudioContext.Provider>
  );
}

export function ListenChapterButton() {
  const audio = useContext(ChapterAudioContext);
  const t = useTranslations('OstomyCare.ui.chapter.audio');

  if (!audio) return null;

  return (
    <button className="oc-audio-listen oc-audio-listen--hero" onClick={() => audio.playFrom(0)} type="button">
      <span aria-hidden className="oc-audio-listen-icon">
        ▶
      </span>
      {t('listenChapter')}
    </button>
  );
}

export function ListenStopButton({ stop, title }: { stop: number; title: string }) {
  const audio = useContext(ChapterAudioContext);
  const t = useTranslations('OstomyCare.ui.chapter.audio');

  if (!audio) return null;

  const isCurrent = audio.current?.stop === stop;

  return (
    <button
      aria-label={t('listenStopNamed', { title })}
      aria-pressed={isCurrent}
      className={isCurrent ? 'oc-audio-listen is-current' : 'oc-audio-listen'}
      onClick={() => audio.playFrom(stop)}
      type="button"
    >
      <span aria-hidden className="oc-audio-listen-icon">
        {isCurrent && audio.status === 'playing' ? '♪' : '▶'}
      </span>
      {t('listenStop')}
    </button>
  );
}
