'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';

import { KitFlowDemo } from '~/components/kit-flow-demo/kit-flow-demo';
import { OliviaHelpBand } from '~/components/olivia/olivia-help-band';
import { GuestCategoryQuiz } from '~/components/onboarding/guest-category-quiz';
import { SpecializedSubscribe } from '~/components/specialized-subscribe/specialized-subscribe';

import { CHAPTERS as CHAPTER_PAGES, chapterHref } from './chapters/chapters-data';
import type { WhCatalog, WhCatalogItem } from './get-wh-catalog';
import { useWhMotion } from './use-wh-motion';
import {
  CLAIR_HEALTH_WRISTBAND_ID,
  FIRST_CYCLE_STARTER_KIT_ID,
} from './wh-ids';

import './womens-health.css';
import './wh-motion.css';

/*
 * =============================================================================
 * WOMEN'S HEALTH — CONTENT MAP
 * =============================================================================
 * Page URL: /liivv-health/womens-health
 *
 * Edit copy in two places:
 *   1. Constants below (shared lists: doors, trust items, Clair chips, etc.)
 *   2. JSX sections in WomensHealthPage (search "SECTION N —")
 *
 * Chapter cards pull titles/blurbs from: ./chapters/chapters-data.ts
 * Images live under: /public/archive/womens-health/
 * =============================================================================
 */

/** Links used by CTAs across the page */
const SHOP_HREF = '/liivv-health/womens-health/shop-womens-health';
const PHARMACIST_HREF = '/account/virtual-care';
const CLAIR_HREF = '/liivv-health/womens-health/clair-health';
const CLAIR_PREORDER_HREF = '/clair-health-wristband/';
const IMG = '/archive/womens-health';
/** SECTION 1 — Hero float product images */
const HERO_FLOAT_KIT_IMG = `${IMG}/door-shop-kit.jpg`;
const HERO_FLOAT_CLAIR_IMG = `${IMG}/clair-official-hero.jpg`;

/** SECTION 8 — Clair hormone wearable frame animation */
const CLAIR_FRAME_COUNT = 40;
const CLAIR_FRAME_FPS = 14;
const CLAIR_FRAME_SRC = (index: number) =>
  `${IMG}/clair-frames/frame-${String(index + 1).padStart(3, '0')}.webp`;
const CLAIR_FRAME_POSTER = CLAIR_FRAME_SRC(0);

/** SECTION 8 — Clair wellness chips (no hormone-output or fertility claims) */
const CLAIR_SIGNALS = ['Cycle insights', 'Worn like jewellery', 'Everyday signals', 'Wellness wearable'] as const;
/** SECTION 8 — Clair use-case list under the lead paragraph */
const CLAIR_CHAPTERS = [
  'Training & recovery',
  'Energy & sleep',
  'Cycle patterns',
  'Changes over time',
] as const;

/** SECTION 1 — Rotating words in the hero headline ("feel ___") */
const FEELING_WORDS = ['heard', 'steady', 'like yourself', 'in rhythm', 'at ease'] as const;

/** SECTION 2 — Trust strip items under the hero */
const TRUST_ITEMS = [
  'Ontario pharmacist chat',
  'Discreet delivery',
  'Subscribe & save staples',
  'No shame. Just health.',
] as const;

/** SECTION 3 — Three "doors" cards (Shop / Care / Chapters) */
const DOORS = [
  {
    id: 'shop',
    label: 'Shop',
    title: 'The Women\'s edit',
    body: 'Essentials, kits, and glow — subscribe so restock keeps the same pace as you.',
    href: '#build-your-kit',
    image: `${IMG}/door-shop-kit.jpg`,
  },
  {
    id: 'care',
    label: 'Care',
    title: 'Ask without the awkward',
    body: 'Ontario pharmacists in chat — kind answers, no waiting room.',
    href: '#care',
    image: `${IMG}/door-care.jpg`,
  },
  {
    id: 'chapters',
    label: 'Chapters',
    title: 'Find your season',
    body: 'Six life chapters of care — for the season you\'re in, not an age band.',
    href: '#where-are-you',
    image: `${IMG}/door-chapters.jpg`,
  },
] as const;

/**
 * SECTION 6 — Life chapter cards
 * Titles/blurbs come from ./chapters/chapters-data.ts — edit that file to change chapter copy.
 */
const CHAPTER_CHOOSER = CHAPTER_PAGES.map((chapter) => ({
  num: chapter.num,
  shortTitle: chapter.title.split('&')[0]?.trim() ?? chapter.title,
  title: chapter.title,
  blurb: chapter.vibe,
  href: chapterHref(chapter.slug),
  image: chapter.heroImage,
}));

/** SECTION 5 — Shop room filter tab labels */
const SHOP_ROOMS = [
  { id: 'all', label: 'All' },
  { id: 'kits', label: 'Curated kits' },
  { id: 'cycle', label: 'Cycle comfort' },
  { id: 'intimate', label: 'Intimate care' },
  { id: 'prenatal', label: 'Prenatal & grow' },
  { id: 'glow', label: 'Glow & daily' },
] as const;

type ShopRoomId = (typeof SHOP_ROOMS)[number]['id'];

const SUBSCRIBE_FEATURES = [
  {
    title: 'A monthly rhythm, not a drawer scramble',
    body: 'Period and intimate staples show up like clockwork — the rest of the month stays yours.',
  },
  {
    title: 'Kits that keep arriving',
    body: 'Customize a kit, then subscribe so your version restocks. Change it whenever you want.',
  },
  {
    title: 'Skip a cycle anytime',
    body: 'Season shift, travel, or a break — pause, skip, or cancel without a phone call.',
  },
] as const;

function roomForProduct(product: WhCatalogItem): Exclude<ShopRoomId, 'all' | 'kits'> {
  const n = product.name.toLowerCase();

  if (
    /pad|wipe|period|menstrual|incontinence|poise|natracare|reign|diva/.test(n)
  ) {
    return 'cycle';
  }

  if (/vaginal|replens|repagyn|gynatrof|feminine|intimate wash|moisturizer|lubric/.test(n)) {
    return 'intimate';
  }

  if (/prenatal|pregnancy|nursing|milk|motherlove|preconception|trimester/.test(n)) {
    return 'prenatal';
  }

  return 'glow';
}

function hasDisplayPrice(priceLabel?: string) {
  return Boolean(priceLabel && !/(\$|CA\$)?\s*0([.,]0+)?\b/i.test(priceLabel));
}

function ProductThumb({ product, index = 0 }: { product: WhCatalogItem; index?: number }) {
  return (
    <a className="wh-product-card" href={product.path} style={{ ['--stagger' as string]: index }}>
      <div className="wh-product-media">
        {product.image ? (
          <img alt={product.image.alt} src={product.image.src} />
        ) : (
          <div aria-hidden className="wh-product-fallback" />
        )}
      </div>
      <div className="wh-product-meta">
        {product.isKit ? <span className="wh-product-badge">Customizable kit</span> : null}
        <h3>{product.name}</h3>
        {hasDisplayPrice(product.priceLabel) ? (
          <p className="wh-product-price">{product.priceLabel}</p>
        ) : null}
      </div>
    </a>
  );
}

function KitsCarousel({
  kits,
  initialId,
}: {
  kits: WhCatalogItem[];
  initialId?: number | null;
}) {
  const startIndex = useMemo(() => {
    if (!initialId) return 0;
    const index = kits.findIndex((kit) => kit.entityId === initialId);
    return index >= 0 ? index : 0;
  }, [kits, initialId]);

  const viewportRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const [active, setActive] = useState(startIndex);
  const [shift, setShift] = useState(0);
  const [instant, setInstant] = useState(false);
  const [viewportW, setViewportW] = useState(0);
  const count = kits.length;
  const gap = 14;

  useEffect(() => {
    setActive(startIndex);
    setShift(0);
    busyRef.current = false;
  }, [startIndex]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const measure = () => setViewportW(viewport.clientWidth);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [count]);

  if (count === 0) return null;

  const slideW =
    viewportW > 0 ? Math.round(Math.min(viewportW * (viewportW < 900 ? 0.92 : 0.72), 820)) : 0;
  const step = slideW + gap;
  const baseTx = viewportW > 0 && slideW > 0 ? (viewportW - slideW) / 2 - 2 * step : 0;
  const tx = baseTx - shift * step;

  const go = (dir: -1 | 1) => {
    if (busyRef.current || count < 2 || slideW <= 0) return;
    busyRef.current = true;
    setShift(dir);
  };

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (event.propertyName !== 'transform') return;
    if (shift === 0) return;

    const dir = shift;
    setInstant(true);
    setActive((index) => (index + dir + count) % count);
    setShift(0);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setInstant(false);
        busyRef.current = false;
      });
    });
  };

  const at = (offset: number) => kits[(active + offset + count) % count]!;

  const slots = [
    { kit: at(-2), offset: -2 },
    { kit: at(-1), offset: -1 },
    { kit: at(0), offset: 0 },
    { kit: at(1), offset: 1 },
    { kit: at(2), offset: 2 },
  ];

  const renderFeature = (kit: WhCatalogItem, offset: number) => {
    const isFeatured = kit.entityId === FIRST_CYCLE_STARTER_KIT_ID;
    const isCenter = offset === shift;
    const body = (
      <>
        <div className="wh-kit-feature-media">
          {kit.image ? (
            <img alt={isCenter ? kit.image.alt : ''} src={kit.image.src} />
          ) : (
            <div aria-hidden className="wh-product-fallback" />
          )}
        </div>
        <div className="wh-kit-feature-copy">
          <span className="wh-product-badge">{isFeatured ? 'Featured kit' : 'Customizable kit'}</span>
          <h3>{kit.name}</h3>
          {hasDisplayPrice(kit.priceLabel) ? (
            <p className="wh-product-price">{kit.priceLabel}</p>
          ) : (
            <p className="wh-product-price wh-product-price--spacer">&nbsp;</p>
          )}
          <p>
            {isFeatured
              ? 'A calm first-chapter edit — open it to tune quantities, add what was missing, and save your version.'
              : 'Open it to tune quantities, add what was missing, and save your version.'}
          </p>
          {isCenter && shift === 0 ? (
            <a className="btn btn-dark" href={kit.path}>
              Customize this kit
            </a>
          ) : (
            <span className="btn btn-dark wh-kit-feature-cta-ghost">Customize this kit</span>
          )}
        </div>
      </>
    );

    if (isCenter && shift === 0) {
      return (
        <article
          aria-current="true"
          className="wh-kit-feature wh-kits-carousel-slide is-center"
          key={`${kit.entityId}-${offset}`}
          style={{ width: slideW || undefined }}
        >
          {body}
        </article>
      );
    }

    return (
      <button
        aria-hidden={Math.abs(offset) > 1 || undefined}
        aria-label={`Show ${kit.name}`}
        className={`wh-kit-feature wh-kits-carousel-slide${isCenter ? ' is-center' : ' is-side'}${
          offset < shift ? ' is-prev' : offset > shift ? ' is-next' : ''
        }`}
        disabled={shift !== 0}
        key={`${kit.entityId}-${offset}`}
        onClick={() => go(offset < 0 ? -1 : 1)}
        style={{ width: slideW || undefined }}
        type="button"
      >
        {body}
      </button>
    );
  };

  return (
    <div className="wh-kits-carousel">
      <p className="wh-kits-carousel-count">
        {active + 1} / {count} kits
      </p>

      <div className="wh-kits-carousel-frame">
        {count > 1 ? (
          <button
            aria-label="Previous kit"
            className="wh-kits-carousel-btn is-prev"
            onClick={() => go(-1)}
            type="button"
          >
            ←
          </button>
        ) : null}

        <div
          aria-label="Women's Health kits carousel"
          aria-roledescription="carousel"
          className="wh-kits-carousel-viewport"
          ref={viewportRef}
        >
          <div
            className={`wh-kits-carousel-track${instant ? ' is-instant' : ''}`}
            onTransitionEnd={handleTransitionEnd}
            style={{
              gap,
              transform: slideW > 0 ? `translate3d(${tx}px, 0, 0)` : undefined,
            }}
          >
            {slots.map(({ kit, offset }) => renderFeature(kit, offset))}
          </div>
        </div>

        {count > 1 ? (
          <button
            aria-label="Next kit"
            className="wh-kits-carousel-btn is-next"
            onClick={() => go(1)}
            type="button"
          >
            →
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Pic({
  src,
  className = '',
  alt = '',
}: {
  src: string;
  className?: string;
  alt?: string;
}) {
  return (
    <div aria-hidden={alt === '' || undefined} className={`wh-pic ${className}`.trim()}>
      <img alt={alt} src={src} />
    </div>
  );
}

/** Clair page frame sequence, autoplayed as a silent ping-pong loop. */
function ClairFrameLoop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const framesRef = useRef<(HTMLImageElement | null)[]>([]);
  const frameIndexRef = useRef(0);
  const directionRef = useRef<1 | -1>(1);
  const rafRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const paint = useCallback((index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const frames = framesRef.current;
    let frame = frames[index] ?? null;

    if (!frame) {
      for (let i = index - 1; i >= 0; i -= 1) {
        if (frames[i]) {
          frame = frames[i]!;
          break;
        }
      }
    }

    if (!frame) {
      frame = frames.find(Boolean) ?? null;
    }

    if (!frame) return;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    if (width < 1 || height < 1) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextWidth = Math.round(width * dpr);
    const nextHeight = Math.round(height * dpr);
    const sizeChanged = canvas.width !== nextWidth || canvas.height !== nextHeight;

    if (sizeChanged) {
      canvas.width = nextWidth;
      canvas.height = nextHeight;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (sizeChanged) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const scale = Math.max(width / frame.naturalWidth, height / frame.naturalHeight);
    const drawW = frame.naturalWidth * scale;
    const drawH = frame.naturalHeight * scale;
    ctx.drawImage(frame, (width - drawW) / 2, (height - drawH) / 2, drawW, drawH);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    framesRef.current = Array.from({ length: CLAIR_FRAME_COUNT }, () => null);

    const loadFrame = (index: number) =>
      new Promise<void>((resolve) => {
        const image = new Image();
        image.decoding = 'async';
        image.onload = () => {
          if (!cancelled) framesRef.current[index] = image;
          resolve();
        };
        image.onerror = () => resolve();
        image.src = CLAIR_FRAME_SRC(index);
      });

    void (async () => {
      await loadFrame(0);
      if (cancelled) return;
      paint(0);
      setReady(true);

      const rest = Array.from({ length: CLAIR_FRAME_COUNT - 1 }, (_, i) => loadFrame(i + 1));
      await Promise.all(rest);
      if (!cancelled) paint(frameIndexRef.current);
    })();

    return () => {
      cancelled = true;
    };
  }, [paint]);

  useEffect(() => {
    if (!ready || reduceMotion) return;

    const intervalMs = 1000 / CLAIR_FRAME_FPS;
    const lastFrame = CLAIR_FRAME_COUNT - 1;
    let last = performance.now();

    const tick = (now: number) => {
      const elapsed = now - last;
      if (elapsed >= intervalMs) {
        // Catch up cleanly without drifting slower over time
        last = now - (elapsed % intervalMs);
        let next = frameIndexRef.current + directionRef.current;

        if (next >= lastFrame) {
          next = lastFrame;
          directionRef.current = -1;
        } else if (next <= 0) {
          next = 0;
          directionRef.current = 1;
        }

        frameIndexRef.current = next;
        paint(next);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    const onResize = () => paint(frameIndexRef.current);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', onResize);
    };
  }, [paint, ready, reduceMotion]);

  return (
    <>
      <img
        alt=""
        aria-hidden
        className="wh-clair-poster"
        decoding="async"
        src={CLAIR_FRAME_POSTER}
      />
      <canvas
        aria-hidden
        className={`wh-clair-canvas${ready && !reduceMotion ? ' is-ready' : ''}`}
        ref={canvasRef}
      />
    </>
  );
}

const EMPTY_PRODUCTS: WhCatalogItem[] = [];

/**
 * Ping-pong hero: native-play forward clip, then a pre-rendered reverse clip,
 * forever. Much smoother than seeking currentTime backwards.
 */
function HeroLoopVideo({
  src,
  reverseSrc,
  poster,
}: {
  src: string;
  reverseSrc: string;
  poster: string;
}) {
  const forwardRef = useRef<HTMLVideoElement>(null);
  const reverseRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState<'forward' | 'reverse'>('forward');

  useEffect(() => {
    const forward = forwardRef.current;
    const reverse = reverseRef.current;
    if (!forward || !reverse) return;

    let alive = true;
    let mode: 'forward' | 'reverse' = 'forward';

    const playClip = (el: HTMLVideoElement) => {
      el.currentTime = 0;
      void el.play().catch(() => {
        /* muted + playsInline usually allowed */
      });
    };

    const show = (next: 'forward' | 'reverse') => {
      mode = next;
      setPlaying(next);
      if (next === 'forward') {
        reverse.pause();
        playClip(forward);
      } else {
        forward.pause();
        playClip(reverse);
      }
    };

    const onForwardEnded = () => {
      if (alive && mode === 'forward') show('reverse');
    };
    const onReverseEnded = () => {
      if (alive && mode === 'reverse') show('forward');
    };

    forward.addEventListener('ended', onForwardEnded);
    reverse.addEventListener('ended', onReverseEnded);
    playClip(forward);

    return () => {
      alive = false;
      forward.removeEventListener('ended', onForwardEnded);
      reverse.removeEventListener('ended', onReverseEnded);
      forward.pause();
      reverse.pause();
    };
  }, []);

  return (
    <>
      <video
        ref={forwardRef}
        className={playing === 'forward' ? 'is-active' : undefined}
        muted
        playsInline
        poster={poster}
        preload="auto"
      >
        <source src={src} type="video/mp4" />
      </video>
      <video
        ref={reverseRef}
        className={playing === 'reverse' ? 'is-active' : undefined}
        muted
        playsInline
        preload="auto"
      >
        <source src={reverseSrc} type="video/mp4" />
      </video>
    </>
  );
}

export function WomensHealthPage({
  catalog,
  showGuestQuiz = false,
  isSignedIn = false,
}: {
  catalog?: WhCatalog;
  showGuestQuiz?: boolean;
  isSignedIn?: boolean;
}) {
  const [feelingIndex, setFeelingIndex] = useState(0);
  const [shopRoom, setShopRoom] = useState<ShopRoomId>('all');
  const { reduceMotion, rootClassName } = useWhMotion('womens-health');

  const allKits = catalog?.kits ?? [];
  const featuredKit = catalog?.featuredKit ?? allKits[0] ?? null;
  const shopProducts = catalog?.products ?? EMPTY_PRODUCTS;
  const hasKits = allKits.length > 0;
  const hasShop = shopProducts.length > 0 || allKits.length > 0;
  const kitSearchPool = useMemo(
    () => (catalog?.products ?? []).map((product) => product.name),
    [catalog?.products],
  );

  const heroFloatProducts = useMemo(() => {
    const all = [...(catalog?.kits ?? []), ...(catalog?.products ?? [])];
    const byId = new Map(all.map((item) => [item.entityId, item]));

    const resolve = (id: number, fallbackPath: string, fallbackName: string) => {
      const item = byId.get(id);

      if (item?.path) {
        return item;
      }

      return {
        entityId: id,
        name: item?.name ?? fallbackName,
        path: item?.path ?? fallbackPath,
        image: item?.image,
        isKit: id === FIRST_CYCLE_STARTER_KIT_ID,
      } satisfies WhCatalogItem;
    };

    return {
      primary: resolve(FIRST_CYCLE_STARTER_KIT_ID, '/first-cycle-starter-kit/', 'First Cycle Starter Kit'),
      secondary: resolve(CLAIR_HEALTH_WRISTBAND_ID, '/clair-health-wristband/', 'Clair Health Wristband'),
    };
  }, [catalog?.kits, catalog?.products]);

  const heroFloatPrimary = heroFloatProducts.primary;
  const heroFloatSecondary = heroFloatProducts.secondary;

  const filteredShop = useMemo(() => {
    if (shopRoom === 'kits') return allKits.slice(0, 12);
    if (shopRoom === 'all') return shopProducts.slice(0, 12);

    return shopProducts.filter((p) => roomForProduct(p) === shopRoom).slice(0, 12);
  }, [allKits, shopProducts, shopRoom]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setFeelingIndex((i) => (i + 1) % FEELING_WORDS.length);
    }, 2600);

    return () => window.clearInterval(id);
  }, [reduceMotion]);

  return (
    <div className={rootClassName} id="womens-health">
      {/* =====================================================================
          SECTION 1 — HERO
          Kicker, headline, subcopy, CTAs, hero video + float chips.
          Rotating feeling words: FEELING_WORDS (top of file).
          ===================================================================== */}
      <section className="hero" aria-label="Women's Health hero">
        <div aria-hidden className="wh-orb-field">
          <span />
          <span />
          <span />
        </div>
        <div className="hero-inner">
          <span className="hero-kicker">Liivv Women · Health, your way</span>
          <h1>
            Health that makes you feel{' '}
            <span aria-live="polite" className="hero-feeling" key={FEELING_WORDS[feelingIndex]}>
              {FEELING_WORDS[feelingIndex]}
            </span>
            .
          </h1>
          <p>
            No quick fixes — just real care that moves with your life. Wellness that works IRL, at your
            pace.
          </p>
          <div className="hero-cta">
            <a className="btn btn-dark" href="#doors">
              Start here
            </a>
            <a className="btn btn-outline" href="#build-your-kit">
              Build your kit
            </a>
          </div>
        </div>
        <div className="hero-stack">
          <div aria-hidden className="hero-stack-main">
            <HeroLoopVideo
              poster={`${IMG}/hero.jpg`}
              reverseSrc={`${IMG}/womens-health-hero-video-reverse.mp4`}
              src={`${IMG}/womens-health-hero-video.mp4`}
            />
          </div>
          <div aria-hidden className="hero-chip">
            <span>Made for real life</span>
            Care that keeps up with you
          </div>
          <div aria-hidden className="hero-frame hero-frame--a hero-frame--product">
            <img
              alt={heroFloatPrimary.image?.alt || heroFloatPrimary.name}
              src={HERO_FLOAT_KIT_IMG}
            />
          </div>
          <div aria-hidden className="hero-frame hero-frame--b hero-frame--product">
            <img
              alt={heroFloatSecondary.image?.alt || heroFloatSecondary.name}
              src={HERO_FLOAT_CLAIR_IMG}
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2 — TRUST STRIP
          Scrolling / row of trust bullets under the hero.
          Edit items in: TRUST_ITEMS (top of file).
          ===================================================================== */}
      <section
        aria-label="Why Liivv Women"
        className={`wh-trust${showGuestQuiz ? ' wh-trust--quiz' : ''}`}
      >
        <div className="container wh-trust-track">
          {TRUST_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      {showGuestQuiz ? (
        <GuestCategoryQuiz
          categoryId="womens_health_wellness"
          className="rounded-top"
          isSignedIn={isSignedIn}
        />
      ) : null}

      {/* =====================================================================
          SECTION 3 — THREE DOORS (Shop / Care / Chapters)
          Anchor: #doors
          Edit card copy + images in: DOORS (top of file).
          Eyebrow + headline below are edited inline.
          ===================================================================== */}
      <section
        aria-label="Start here"
        className={`wh-doors${showGuestQuiz ? ' rounded-top' : ''}`}
        id="doors"
      >
        <div className="container" data-reveal>
          <span className="eyebrow">Three ways in</span>
          <h2>What do you need today?</h2>
          <div className="wh-doors-grid" data-reveal data-reveal-stagger>
            {DOORS.map((door, index) => (
              <a
                className="wh-door"
                href={door.href}
                key={door.id}
                style={{ ['--stagger' as string]: index }}
              >
                <div className="wh-door-media">
                  <img alt="" src={door.image} />
                </div>
                <span className="wh-door-label">{door.label}</span>
                <h3>{door.title}</h3>
                <p>{door.body}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 4 — CUSTOMIZABLE KITS
          Anchor: #build-your-kit
          Eyebrow / headline / intro below. Kit products come from catalog.
          Demo UI: shared KitFlowDemo, matching the kit product page.
          ===================================================================== */}
      {hasKits ? (
        <section aria-label="Customizable kits" className="wh-kits rounded-top" id="build-your-kit">
          <div className="container">
            <div data-reveal>
              <span className="eyebrow">Liivv kits</span>
              <h2>Start curated. Finish as yours.</h2>
              <p className="wh-kits-intro">
                Prebuilt for the chapter — then customize on the kit page, save it, or subscribe so it keeps
                arriving.
              </p>
            </div>

            <div data-reveal>
              <KitFlowDemo
                kitHref={featuredKit?.path}
                kitImage={featuredKit?.image}
                kitName={featuredKit?.name}
                searchPool={kitSearchPool}
              />
            </div>

            <div data-reveal>
              <KitsCarousel initialId={featuredKit?.entityId} kits={allKits} />
            </div>
          </div>
        </section>
      ) : null}

      {/* =====================================================================
          SECTION 5 — SHOP ROOMS
          Anchor: #shop-womens-health
          Filter tab labels: SHOP_ROOMS. Products come from live catalog.
          Eyebrow / headline / intro / CTA below are edited inline.
          ===================================================================== */}
      {hasShop ? (
        <section aria-label="Shop Women's Health" className="wh-shop rounded-top" id="shop-womens-health">
          <div className="container">
            <div data-reveal>
              <span className="eyebrow">Shop Women&apos;s Health</span>
              <h2>Rooms in the edit</h2>
              <p className="wh-shop-intro">
                Live catalog from Shop Women&apos;s Health — filtered into calm rooms so it doesn&apos;t feel
                like a warehouse.
              </p>
            </div>
            <div aria-label="Shop rooms" className="wh-shop-rooms" data-reveal role="tablist">
              {SHOP_ROOMS.map((room) => (
                <button
                  aria-selected={shopRoom === room.id}
                  className={shopRoom === room.id ? 'is-active' : undefined}
                  key={room.id}
                  onClick={() => setShopRoom(room.id)}
                  role="tab"
                  type="button"
                >
                  {room.label}
                </button>
              ))}
            </div>
            <div className="wh-product-grid" data-reveal data-reveal-stagger>
              {filteredShop.map((product, index) => (
                <ProductThumb index={index} key={product.entityId} product={product} />
              ))}
            </div>
            {filteredShop.length === 0 ? (
              <p className="wh-shop-empty">Nothing in this room yet — try All or another filter.</p>
            ) : null}
            <div className="wh-shop-cta" data-reveal>
              <a className="btn btn-dark" href={SHOP_HREF}>
                Shop all Women&apos;s Health
              </a>
            </div>
          </div>
        </section>
      ) : null}

      <SpecializedSubscribe
        align="center"
        className="wh-subs rounded-top"
        demoProductBlurb="Period and intimate staples — on a monthly rhythm, not a scramble."
        demoProductName="Cycle comfort staples"
        demoProductPath="liivv.ca/product/cycle-comfort"
        features={SUBSCRIBE_FEATURES}
        lead="Pads, wipes, comfort staples — subscribe so the month does not start with a scramble. Tune frequency with your season, skip a cycle, or pause when you need a break."
        primaryCtaClass="btn btn-dark"
        reveal
        secondaryCtaClass="btn btn-outline"
        shopHref={SHOP_HREF}
        shopLabel="Shop to subscribe"
        title="Cycle care that keeps the same pace as you"
        wrapClassName="container"
      />

      {/* =====================================================================
          SECTION 6 — LIFE CHAPTERS
          Anchor: #where-are-you
          Eyebrow / headline / intro below. Card titles & blurbs:
          ./chapters/chapters-data.ts
          ===================================================================== */}
      <section aria-label="Find your chapter" className="wh-chooser rounded-top" id="where-are-you">
        <div className="container">
          <div data-reveal>
            <span className="eyebrow">Life chapters</span>
            <h2>Six chapters. One that fits.</h2>
            <p className="wh-chooser-intro">
              Not an age band — a season. Open the one that feels like you.
            </p>
          </div>
          <div className="wh-chooser-grid" data-reveal data-reveal-stagger>
            {CHAPTER_CHOOSER.map((chapter, index) => (
              <a
                className="wh-chooser-card"
                href={chapter.href}
                key={chapter.num}
                style={{ ['--stagger' as string]: index }}
              >
                <div className="wh-chooser-media">
                  <img alt="" src={chapter.image} />
                  <span className="wh-chooser-num">{chapter.num}</span>
                </div>
                <h3>{chapter.title}</h3>
                <p>{chapter.blurb}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 7 — CARE / PHARMACIST CHAT
          Anchor: #care
          Images, eyebrow, headline, body copy, CTA — all edited inline below.
          ===================================================================== */}
      <section className="images-text rounded-top" data-reveal id="care">
        <div className="container images-text-grid">
          <div className="visuals">
            <Pic className="big" src={`${IMG}/care-chat-main.jpg`} />
            <Pic className="mid" src={`${IMG}/care-chat-desk.jpg`} />
            <Pic className="small" src={`${IMG}/care-chat-moment.jpg`} />
          </div>
          <div>
            <span className="eyebrow">Available in Ontario</span>
            <h2>Relief that doesn&apos;t wait on a waiting room</h2>
            <p>
              Clear answers, no med-speak, no judgment. Chat with an Ontario pharmacist during business hours
              — until 5 p.m. Eastern.
            </p>
            <p>
              Outside those hours, Olivia can help with shopping and your account — she does not give medical
              advice.
            </p>
            <a className="btn btn-white" href={PHARMACIST_HREF}>
              Talk to a Pharmacist
            </a>
          </div>
        </div>
      </section>

      <section aria-label="Meet Olivia" className="wh-olivia-band rounded-top">
        <div className="container">
          <OliviaHelpBand
            body="After hours — or for shopping, orders, and account how-tos — Olivia is right there in the corner. She does not give medical advice."
            title="Olivia handles the store side."
          />
        </div>
      </section>

      {/* =====================================================================
          SECTION 8 — CLAIR HEALTH WEARABLE
          Anchor: #clair
          Headline + lead + closing copy edited inline below.
          Signal chips: CLAIR_SIGNALS · Use cases: CLAIR_CHAPTERS
          ===================================================================== */}
      <section aria-label="Clair wellness wearable" className="wh-clair rounded-top" data-reveal id="clair">
        <div aria-hidden className="wh-clair-media">
          <ClairFrameLoop />
        </div>
        <div aria-hidden className="wh-clair-veil" />
        <div className="container wh-clair-board">
          <div className="wh-clair-copy">
            <span className="eyebrow">Also in the edit · Clair</span>
            <h2>
              Cycle insights, <em>when you want them.</em>
            </h2>
            <p className="wh-clair-lead">
              Clair is a hormone-aware wellness tracker, built around female physiology. Worn like jewellery, it
              estimates how your body&apos;s signals shift across your cycle.
            </p>

            <div className="wh-clair-signals" role="list">
              {CLAIR_SIGNALS.map((signal) => (
                <span key={signal} role="listitem">
                  {signal}
                </span>
              ))}
            </div>

            <ul className="wh-clair-uses">
              {CLAIR_CHAPTERS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="wh-clair-close">
              Same calm place as the rest of Liivv Women. Same discreet delivery.
            </p>

            <div className="wh-clair-cta">
              <a className="btn btn-dark" href={CLAIR_PREORDER_HREF}>
                Preorder
              </a>
              <a className="btn btn-outline" href={CLAIR_HREF}>
                Learn more
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 9 — COMMUNITY VOICES / TESTIMONIALS
          Anchor: #voices
          Featured quote + three smaller cards — all edited inline below.
          ===================================================================== */}
      <section className="voices rounded-top" id="voices">
        <div className="container">
          <div data-reveal>
            <span className="eyebrow voices-eyebrow">Beyond the aisle</span>
            <h2>
              Real talk <em>from the community</em>
            </h2>
          </div>

          <article className="wh-voice-feature" data-reveal>
            <div className="wh-voice-feature-media">
              <Pic alt="Priya" src={`${IMG}/voice-1.jpg`} />
            </div>
            <div className="wh-voice-feature-copy">
              <p className="wh-voice-kicker">First kit · Toronto</p>
              <blockquote>
                &ldquo;I finally asked a pharmacist a question I&apos;d been too shy to ask anyone for a year.
                Got a kind, straight answer on my lunch break — no waiting room, no judgment.&rdquo;
              </blockquote>
              <div className="who">
                <img alt="" className="wh-voice-avatar" src={`${IMG}/voice-1.jpg`} />
                <div>
                  Priya
                  <span>Toronto · juggling two kids and a startup</span>
                </div>
              </div>
              <a
                className="wh-voice-more"
                href="/blog/asking-the-pharmacist"
                rel="noopener noreferrer"
                target="_blank"
              >
                Read more
              </a>
            </div>
          </article>

          <div className="voice-cards" data-reveal data-reveal-stagger>
            <article className="voice" style={{ ['--stagger' as string]: 0 }}>
              <img alt="" className="wh-voice-avatar wh-voice-avatar--lg" src={`${IMG}/voice-2.jpg`} />
              <div className="body">
                <blockquote>
                  &ldquo;My monthly box shows up like clockwork. I genuinely forgot what running-out panic feels
                  like.&rdquo;
                </blockquote>
                <div className="who">
                  Dana
                  <span>Ottawa · marathon-in-training</span>
                </div>
                <a
                  className="wh-voice-more"
                  href="/blog/monthly-box-rhythm"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Read more
                </a>
              </div>
            </article>
            <article className="voice" style={{ ['--stagger' as string]: 1 }}>
              <img alt="" className="wh-voice-avatar wh-voice-avatar--lg" src={`${IMG}/voice-3.jpg`} />
              <div className="body">
                <blockquote>
                  &ldquo;I used to keep three apps and a drawer of half-finished bottles. Sundays feel like
                  mine again.&rdquo;
                </blockquote>
                <div className="who">
                  Maya
                  <span>Liivv member since 2024</span>
                </div>
                <a
                  className="wh-voice-more"
                  href="/blog/one-place-for-essentials"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Read more
                </a>
              </div>
            </article>
            <article className="voice" style={{ ['--stagger' as string]: 2 }}>
              <img alt="" className="wh-voice-avatar wh-voice-avatar--lg" src={`${IMG}/voice-4.jpg`} />
              <div className="body">
                <blockquote>
                  &ldquo;Sleep support and skin staples in one place changed my month. No more whisper aisle
                  hopping.&rdquo;
                </blockquote>
                <div className="who">
                  Sofia
                  <span>Mississauga · Liivv Women regular</span>
                </div>
                <a
                  className="wh-voice-more"
                  href="/blog/sleep-and-skin-in-one-place"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  Read more
                </a>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 10 — FAQ
          Questions + answers edited inline in the <details> blocks below.
          ===================================================================== */}
      <section className="faq rounded-top" data-reveal>
        <div className="faq-layout faq-layout--copy-only">
          <div>
            <h2>Good questions, honest answers</h2>
            <p className="intro">The things people actually ask — answered like a friend would.</p>
            <details open>
              <summary>Is this only for one age or stage?</summary>
              <p>
                No. Chapters follow where you are — Foundation, Rhythm, Reset, Grow, Transition, Longevity —
                not a number on a birthday cake.
              </p>
            </details>
            <details>
              <summary>Can I customize a kit?</summary>
              <p>
                Yes. Start with a curated kit, adjust quantities, add items, and save your version — or
                subscribe so it restocks on your rhythm.
              </p>
            </details>
            <details>
              <summary>How do subscriptions work?</summary>
              <p>
                On a product page, choose Subscribe &amp; save, pick a frequency that fits your cycle, then
                check out like any order. Skip a month, pause, or cancel under Account → Subscriptions — no
                phone calls, no guilt trips.
              </p>
            </details>
            <details>
              <summary>How private is my order?</summary>
              <p>Plain packaging. Quiet checkout. Your order is nobody&apos;s business but yours.</p>
            </details>
            <details>
              <summary>What can I chat with a pharmacist about?</summary>
              <p>
                Everyday concerns in Ontario during business hours (until 5 p.m. Eastern). Olivia helps with
                shopping anytime — she does not give medical advice.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 11 — CLOSING / MANIFESTO
          Anchor: #manifesto
          Kicker, headline, body, CTAs — all edited inline below.
          ===================================================================== */}
      <section className="closing rounded-top" data-reveal id="manifesto">
        <div className="closing-bg">
          <img alt="" src={`${IMG}/closing.jpg`} />
        </div>
        <div className="container">
          <p className="wh-manifesto-kicker">The Liivv promise</p>
          <h2>
            No shame. No hype.
            <br />
            <span>Just you — at your best.</span>
          </h2>
          <p>
            We&apos;re done with filters and false promises. Health should feel natural, modern, and
            authentically yours — at your pace.
          </p>
          <div className="wh-closing-cta">
            <a className="btn btn-white" href={SHOP_HREF}>
              Shop the edit
            </a>
            <a className="btn btn-ghost" href="#subscriptions">
              Subscribe &amp; save
            </a>
            <a className="btn btn-ghost" href="#build-your-kit">
              Build a kit
            </a>
            <a className="btn btn-ghost" href="#where-are-you">
              Find your chapter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
