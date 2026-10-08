'use client';

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

import type { CategoryCard } from './chapters-data';
import { useJourneyMemoryOptional } from './journey-memory-context';

export interface PathBand {
  id: string;
  label: string;
  cards: Array<{ card: CategoryCard }>;
}

export interface JourneyStop {
  bandId: string;
  bandLabel: string;
  number: number;
  title: string;
}

interface JourneySpyValue {
  bands: PathBand[];
  stops: JourneyStop[];
  /* The card being read, by number; 0 when the chapter has no stops. */
  active: number;
  /* Its place in `stops`, from 0. */
  activeIndex: number;
  activeBandId: string;
  /* Puts card N under the header, marks it as the one being read, focuses its heading. */
  jumpTo: (number: number) => void;
}

const JourneySpyContext = createContext<JourneySpyValue | null>(null);

/* Reader input that ends a deep-link settle and releases a chosen stop. Never `scroll`. */
const INPUT_EVENTS = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const;

/* Where reading happens: 40% down the window, and never above a jump's landing line. */
const READING_LINE = 0.4;

/* How long a deep link keeps its card in place while the page is still building. */
const FOLLOW_CAP_MS = 10000;

function cardNumberOf(id: string) {
  const match = /^card-(\d+)$/.exec(id);

  return match ? Number(match[1]) : null;
}

/* A hand-typed or truncated fragment can be invalid percent-encoding. */
function decodeFragment(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/*
 * Where `node`'s top will sit once nothing is easing it in: the reveal starts
 * a card 20-35px low and lifts it, and a landing measured mid-lift ended up
 * that far under the header once it finished.
 */
function settledTop(node: HTMLElement) {
  let top = node.getBoundingClientRect().top;

  for (
    let element: Element | null = node;
    element && element !== document.documentElement;
    element = element.parentElement
  ) {
    const { transform } = getComputedStyle(element);

    if (transform && transform !== 'none') top -= new DOMMatrixReadOnly(transform).m42;
  }

  return top;
}

/* Puts `node`'s settled top on its landing line, the scroll-margin-top under the header. */
function landOn(node: HTMLElement) {
  const margin = Number.parseFloat(getComputedStyle(node).scrollMarginTop) || 0;
  const delta = settledTop(node) - margin;

  if (Math.abs(delta) > 1) window.scrollBy(0, delta);
}

/* A transform still easing a card (or what holds it) into place. */
function easing(root: HTMLElement | null) {
  if (!root || typeof CSSTransition === 'undefined') return false;

  return root
    .getAnimations({ subtree: true })
    .some(
      (animation) =>
        animation instanceof CSSTransition &&
        animation.transitionProperty === 'transform' &&
        animation.playState === 'running',
    );
}

interface Marker {
  node: HTMLElement;
  number: number;
}

/*
 * Every card, and the top of every section (`.oc-journey-act`), in document
 * order. A section top stands for the section's first card, so a jump to a
 * section heading marks that section, not the end of the one before it.
 */
function collectMarkers(stops: JourneyStop[]): Marker[] {
  const cards = stops
    .map((stop) => document.getElementById(`card-${stop.number}`))
    .filter((node): node is HTMLElement => Boolean(node));
  const acts = new Set<HTMLElement>();

  cards.forEach((card) => {
    const act = card.closest<HTMLElement>('.oc-journey-act');

    if (act) acts.add(act);
  });

  const nodes = [...cards, ...acts].sort((a, b) => {
    if (a === b) return 0;

    // eslint-disable-next-line no-bitwise
    return a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
  });
  const markers: Marker[] = [];
  let next = 0;

  for (let index = nodes.length - 1; index >= 0; index -= 1) {
    const node = nodes[index];

    if (node) {
      const number = cardNumberOf(node.id);

      if (number !== null) next = number;

      markers.unshift({ node, number: number ?? next });
    }
  }

  return markers;
}

/*
 * The chapter's one scroll spy. The timeline, the band dots, the "On this
 * page" sheet and the Continue memory all read the stop from here.
 *
 * The stop being read is the last card (or section top) whose top has passed
 * the reading line: 40% of the window, and never above a jump's landing line
 * (the card's scroll-margin-top plus 8px), so a stop chosen from the timeline
 * is the one marked. Tall cards stay marked for their whole height. Worked out
 * from the cards' positions on every scroll frame, resize and size change, and
 * on every frame while a card is easing into place, not from
 * IntersectionObserver ratios, which went stale on tall cards and missed jumps
 * that ended between cards (owner note 6, 2026-10-07).
 *
 * A stop the reader chose (a link to #card-N, or `jumpTo`) stays marked while
 * it is on screen, until the reader scrolls, taps or presses a key: near the
 * end of a chapter the page cannot always scroll a card up to the line.
 *
 * Every jump lands on the card's settled position, not where the reveal has
 * it mid-lift. A deep link (#card-N on arrival) is put back on its line each
 * time the layout changes in the first seconds (figures and images that build
 * themselves after load change the height of what is above it), until the
 * reader turns the wheel, taps, clicks or presses a key.
 */
export function JourneySpyProvider({
  bands,
  children,
}: {
  bands: PathBand[];
  children: ReactNode;
}) {
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
  const [active, setActive] = useState(stops[0]?.number ?? 0);
  const chosenRef = useRef<number | null>(null);
  const computeRef = useRef<() => void>(() => undefined);

  useEffect(() => {
    if (!stops.length) return;

    const numbers = new Set(stops.map((stop) => stop.number));
    const chapter = document.getElementById('oc-chapter');
    let markers = collectMarkers(stops);
    let frame = 0;

    const compute = () => {
      frame = 0;

      const first = markers[0];

      if (!first) return;

      const firstCard = document.getElementById(`card-${first.number}`);
      const margin = firstCard ? Number.parseFloat(getComputedStyle(firstCard).scrollMarginTop) : 0;
      const line = Math.max(
        (Number.isFinite(margin) ? margin : 0) + 8,
        window.innerHeight * READING_LINE,
      );
      let next = first.number;

      markers.forEach((marker) => {
        if (marker.node.getBoundingClientRect().top <= line) next = marker.number;
      });

      const chosen = chosenRef.current;

      if (chosen !== null) {
        const rect = document.getElementById(`card-${chosen}`)?.getBoundingClientRect();

        if (rect && rect.top < window.innerHeight && rect.bottom > 0) {
          next = chosen;
        } else {
          chosenRef.current = null;
        }
      }

      setActive(next);

      /* The reveal moves cards without a scroll: follow it frame by frame until it ends. */
      if (easing(chapter)) frame = window.requestAnimationFrame(compute);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(compute);
    };

    const refresh = () => {
      markers = collectMarkers(stops);
      schedule();
    };

    const choose = (id: string) => {
      const number = cardNumberOf(id);

      chosenRef.current = number !== null && numbers.has(number) ? number : null;
      schedule();
    };

    const release = () => {
      chosenRef.current = null;
    };

    /*
     * Runs after `release` (pointerdown, keydown), so a click on a stop keeps its
     * stop. By the next frame the browser has scrolled to the fragment, measuring
     * the card where the reveal had it; the landing moves to where it settles.
     */
    const onClick = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest('a[href^="#"]') : null;
      const href = link?.getAttribute('href');

      if (!href) return;

      const id = decodeFragment(href.slice(1));

      choose(id);
      window.requestAnimationFrame(() => {
        const node = document.getElementById(id);

        if (node?.closest('#oc-chapter') && decodeFragment(window.location.hash.slice(1)) === id) {
          landOn(node);
        }
      });
    };

    const onHash = () => choose(decodeFragment(window.location.hash.slice(1)));

    computeRef.current = compute;

    const cinema = document
      .getElementById(`card-${stops[0]?.number}`)
      ?.closest('.oc-journey-cinema');
    const resize = new ResizeObserver(refresh);

    if (cinema) resize.observe(cinema);

    INPUT_EVENTS.forEach((type) =>
      window.addEventListener(type, release, { capture: true, passive: true }),
    );
    document.addEventListener('click', onClick);
    window.addEventListener('scroll', schedule, { passive: true });
    /* A card easing into place (the reveal) moves without a scroll or resize. */
    document.addEventListener('transitionrun', schedule, true);
    document.addEventListener('transitionend', schedule, true);
    window.addEventListener('resize', refresh);
    window.addEventListener('hashchange', onHash);
    schedule();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);

      computeRef.current = () => undefined;
      resize.disconnect();
      INPUT_EVENTS.forEach((type) => window.removeEventListener(type, release, { capture: true }));
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', schedule);
      document.removeEventListener('transitionrun', schedule, true);
      document.removeEventListener('transitionend', schedule, true);
      window.removeEventListener('resize', refresh);
      window.removeEventListener('hashchange', onHash);
    };
  }, [stops]);

  /* Deep link: keep the target on its landing line while the page builds. */
  useEffect(() => {
    const id = decodeFragment(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    const root = target?.closest<HTMLElement>('#oc-chapter');

    if (!root) return;

    const number = cardNumberOf(id);

    if (number !== null) chosenRef.current = number;

    let done = false;
    let frame = 0;

    const land = () => {
      frame = 0;

      const node = document.getElementById(id);

      if (node) landOn(node);

      computeRef.current();
    };

    const schedule = () => {
      if (!done && !frame) frame = window.requestAnimationFrame(land);
    };

    /* Fires once on observe, then whenever the chapter or the page changes size. */
    const resize = new ResizeObserver(schedule);
    let cap = 0;

    const stop = () => {
      done = true;
      window.clearTimeout(cap);

      if (frame) window.cancelAnimationFrame(frame);

      resize.disconnect();
      window.removeEventListener('load', schedule);
      INPUT_EVENTS.forEach((type) => window.removeEventListener(type, stop, { capture: true }));
    };

    cap = window.setTimeout(stop, FOLLOW_CAP_MS);
    INPUT_EVENTS.forEach((type) =>
      window.addEventListener(type, stop, { capture: true, passive: true }),
    );
    window.addEventListener('load', schedule);
    resize.observe(root);
    resize.observe(document.body);
    void document.fonts.ready.then(schedule);

    return stop;
  }, []);

  /* Continue memory follows the spy, whether or not the timeline is on screen. */
  useEffect(() => {
    if (!trackProgress || !rememberStop || !active) return;

    const stop = stops.find((item) => item.number === active);

    if (stop) rememberStop(stop.number, stop.title);
  }, [active, rememberStop, stops, trackProgress]);

  const jumpTo = useCallback((number: number) => {
    const node = document.getElementById(`card-${number}`);

    if (!node) return;

    chosenRef.current = number;

    if (window.location.hash !== `#card-${number}`) {
      /* The same fragment navigation as a link to the card: one history entry. */
      window.location.hash = `card-${number}`;
    }

    landOn(node);

    const heading = node.querySelector<HTMLElement>('h3');

    if (heading) {
      if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');

      heading.focus({ preventScroll: true });
    }

    computeRef.current();
  }, []);

  const activeIndex = Math.max(
    0,
    stops.findIndex((stop) => stop.number === active),
  );
  const activeBandId = stops[activeIndex]?.bandId ?? bands[0]?.id ?? '';

  const value = useMemo<JourneySpyValue>(
    () => ({ bands, stops, active, activeIndex, activeBandId, jumpTo }),
    [bands, stops, active, activeIndex, activeBandId, jumpTo],
  );

  return <JourneySpyContext.Provider value={value}>{children}</JourneySpyContext.Provider>;
}

/* Safe outside the provider: no spy, nothing marked. */
export function useJourneySpyOptional() {
  return useContext(JourneySpyContext);
}
