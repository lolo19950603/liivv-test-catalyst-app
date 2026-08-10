'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';

import { CHAPTERS as CHAPTER_PAGES, chapterHref } from './chapters/chapters-data';
import type { WhDemoCatalog, WhDemoCatalogItem } from './get-wh-demo-catalog';
import {
  CLAIR_HEALTH_WRISTBAND_ID,
  FIRST_CYCLE_STARTER_KIT_ID,
} from './wh-demo-ids';

import './womens-health-demo.css';

const SHOP_HREF = '/liivv-health/womens-health/shop-womens-health';
const PHARMACIST_HREF = '/account/virtual-care';
const CLAIR_HREF = '/liivv-health/womens-health-demo/clair-health';
const CLAIR_PREORDER_HREF = '/clair-health-wristband/';
const IMG = '/archive/womens-health-demo';
const HERO_FLOAT_KIT_IMG = `${IMG}/door-shop-kit.jpg`;
const HERO_FLOAT_CLAIR_IMG = `${IMG}/clair-official-hero.jpg`;

const CLAIR_FRAME_COUNT = 40;
const CLAIR_FRAME_FPS = 14;
const CLAIR_FRAME_SRC = (index: number) =>
  `${IMG}/clair-frames/frame-${String(index + 1).padStart(3, '0')}.webp`;
const CLAIR_FRAME_POSTER = CLAIR_FRAME_SRC(0);

const KIT_FLOW_STEPS = [
  {
    id: 'customize',
    num: '01',
    title: 'Customize',
    body: 'Tune quantities on what\'s already in your kit — keep what helps, dial back the rest.',
  },
  {
    id: 'add',
    num: '02',
    title: 'Add something new',
    body: 'Missing a wipe, vitamin, or comfort pick? Add it to the tray before you save.',
  },
  {
    id: 'cart',
    num: '03',
    title: 'Add to cart',
    body: 'Checkout when you\'re ready. Same calm flow, same discreet delivery.',
  },
  {
    id: 'save',
    num: '04',
    title: 'Save for later',
    body: 'Keep your version for next month — no starting from scratch.',
  },
] as const;

const CLAIR_HORMONES = ['Estrogen', 'Progesterone', 'LH', 'FSH'] as const;
const CLAIR_CHAPTERS = [
  'Fertility planning',
  'Training & recovery',
  'Hormonal health',
  '(Peri)menopause',
] as const;

const FEELING_WORDS = ['heard', 'steady', 'like yourself', 'in rhythm', 'at ease'] as const;

const TRUST_ITEMS = [
  'Ontario pharmacist chat',
  'Discreet delivery',
  'Customize & save kits',
  'No shame. Just health.',
] as const;

const DOORS = [
  {
    id: 'shop',
    label: 'Shop',
    title: 'The Women\'s edit',
    body: 'Essentials, kits, and glow — curated for real routines.',
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

const CHAPTER_CHOOSER = CHAPTER_PAGES.map((chapter) => ({
  num: chapter.num,
  shortTitle: chapter.title.split('&')[0]?.trim() ?? chapter.title,
  title: chapter.title,
  blurb: chapter.vibe,
  href: chapterHref(chapter.slug),
  image: chapter.heroImage,
}));

const SHOP_ROOMS = [
  { id: 'all', label: 'All' },
  { id: 'kits', label: 'Curated kits' },
  { id: 'cycle', label: 'Cycle comfort' },
  { id: 'intimate', label: 'Intimate care' },
  { id: 'prenatal', label: 'Prenatal & grow' },
  { id: 'glow', label: 'Glow & daily' },
] as const;

type ShopRoomId = (typeof SHOP_ROOMS)[number]['id'];

function roomForProduct(product: WhDemoCatalogItem): Exclude<ShopRoomId, 'all' | 'kits'> {
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

function ProductThumb({ product }: { product: WhDemoCatalogItem }) {
  return (
    <a className="wh-product-card" href={product.path}>
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
  kits: WhDemoCatalogItem[];
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

  const renderFeature = (kit: WhDemoCatalogItem, offset: number) => {
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

const KIT_SEARCH_FALLBACKS = [
  'Intimate wipes',
  'Period underwear',
  'Magnesium calm pack',
  'Cycle comfort tea',
  'Soft heat wrap refill',
] as const;

const EMPTY_SEARCH_POOL: string[] = [];
const EMPTY_PRODUCTS: WhDemoCatalogItem[] = [];

type KitPointerTarget = 'qty' | 'add' | 'search' | 'cart' | 'save';

function KitFlowDemo({
  kitName,
  kitImage,
  kitHref,
  searchPool = EMPTY_SEARCH_POOL,
}: {
  kitName?: string;
  kitImage?: { src: string; alt: string } | null;
  kitHref?: string;
  searchPool?: string[];
}) {
  const [step, setStep] = useState(0);
  const [padsCount, setPadsCount] = useState(2);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHighlight, setSearchHighlight] = useState(false);
  const [activeTarget, setActiveTarget] = useState<KitPointerTarget | null>(null);
  const [pointer, setPointer] = useState({ x: 72, y: 48, visible: false, clicking: false });
  const [reduceMotion, setReduceMotion] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const qtyRef = useRef<HTMLSpanElement>(null);
  const addRef = useRef<HTMLLIElement>(null);
  const searchResultRef = useRef<HTMLLIElement>(null);
  const cartRef = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const catalogNamesRef = useRef<string[]>([...KIT_SEARCH_FALLBACKS]);

  const title = kitName ?? 'First Cycle Starter Kit';
  const href = kitHref ?? '#';
  const imageSrc = kitImage?.src ?? `${IMG}/door-shop-kit.jpg`;
  const imageAlt = kitImage?.alt ?? title;

  const catalogNames = useMemo(() => {
    const names = searchPool.map((name) => name.trim()).filter(Boolean);
    return names.length > 0 ? names : [...KIT_SEARCH_FALLBACKS];
  }, [searchPool]);

  catalogNamesRef.current = catalogNames;

  const measurePointer = useCallback((target: KitPointerTarget | null, clicking = false) => {
    const page = pageRef.current;
    if (!page || !target) {
      setPointer((prev) => ({ ...prev, visible: Boolean(target), clicking: false }));
      return;
    }

    const node =
      target === 'qty'
        ? qtyRef.current
        : target === 'add'
          ? addRef.current
          : target === 'search'
            ? searchResultRef.current
            : target === 'cart'
              ? cartRef.current
              : saveRef.current;

    if (!node) return;

    const pageBox = page.getBoundingClientRect();
    const box = node.getBoundingClientRect();
    const x = box.left - pageBox.left + box.width * 0.55;
    const y = box.top - pageBox.top + box.height * 0.55;
    setPointer({ x, y, visible: true, clicking });
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion || !activeTarget) return;
    const id = window.requestAnimationFrame(() => {
      measurePointer(activeTarget, false);
    });
    return () => window.cancelAnimationFrame(id);
  }, [activeTarget, searchOpen, searchHighlight, addedItem, padsCount, measurePointer, reduceMotion]);

  useEffect(() => {
    if (reduceMotion) {
      setStep(0);
      setPadsCount(3);
      setAddedItem(catalogNamesRef.current[0] ?? 'Intimate wipes');
      setSearchOpen(false);
      setActiveTarget(null);
      setPointer((prev) => ({ ...prev, visible: false, clicking: false }));
      return;
    }

    let cancelled = false;
    let timerId = 0;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timerId = window.setTimeout(() => {
          if (!cancelled) resolve();
        }, ms);
      });

    const pickProduct = () => {
      const names = catalogNamesRef.current;
      return names[Math.floor(Math.random() * names.length)] ?? 'Intimate wipes';
    };

    const aim = async (target: KitPointerTarget, settleMs = 700) => {
      if (cancelled) return;
      setActiveTarget(target);
      await wait(50);
      if (cancelled) return;
      measurePointer(target, false);
      await wait(settleMs);
    };

    const click = async (target: KitPointerTarget) => {
      if (cancelled) return;
      setActiveTarget(target);
      measurePointer(target, true);
      await wait(260);
      if (cancelled) return;
      setPointer((prev) => ({ ...prev, clicking: false }));
      await wait(200);
    };

    const run = async () => {
      while (!cancelled) {
        setStep(0);
        setPadsCount(2);
        setAddedItem(null);
        setSearchOpen(false);
        setSearchQuery('');
        setSearchHighlight(false);
        setActiveTarget(null);
        await wait(450);
        if (cancelled) break;

        await aim('qty');
        if (cancelled) break;
        await click('qty');
        if (cancelled) break;
        setPadsCount(3);
        await wait(1200);
        if (cancelled) break;

        setStep(1);
        await wait(350);
        if (cancelled) break;
        await aim('add');
        if (cancelled) break;
        await click('add');
        if (cancelled) break;

        setSearchOpen(true);
        setSearchQuery('');
        setSearchHighlight(false);
        await wait(300);
        if (cancelled) break;

        const product = pickProduct();
        for (let i = 1; i <= product.length; i += 1) {
          if (cancelled) break;
          setSearchQuery(product.slice(0, i));
          await wait(48 + (i % 3) * 10);
        }
        if (cancelled) break;

        await wait(250);
        if (cancelled) break;
        setSearchHighlight(true);
        await wait(140);
        if (cancelled) break;

        await aim('search', 600);
        if (cancelled) break;
        await click('search');
        if (cancelled) break;

        setSearchOpen(false);
        setSearchHighlight(false);
        setSearchQuery('');
        setAddedItem(product);
        setActiveTarget(null);
        await wait(1100);
        if (cancelled) break;

        setStep(2);
        await wait(350);
        if (cancelled) break;
        await aim('cart');
        if (cancelled) break;
        await click('cart');
        if (cancelled) break;
        await wait(1200);
        if (cancelled) break;

        setStep(3);
        await wait(350);
        if (cancelled) break;
        await aim('save');
        if (cancelled) break;
        await click('save');
        if (cancelled) break;
        await wait(1400);
      }
    };

    void run();

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [measurePointer, reduceMotion]);

  const active = KIT_FLOW_STEPS[step] ?? KIT_FLOW_STEPS[0];
  const searchResults = catalogNames
    .filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.length < 2)
    .slice(0, 4);
  const highlighted = searchResults[0] ?? addedItem ?? 'Intimate wipes';

  return (
    <div className="wh-kit-flow" data-step={active.id}>
      <div className="wh-kit-flow-steps" role="tablist" aria-label="How kits work">
        {KIT_FLOW_STEPS.map((item, index) => (
          <button
            aria-selected={index === step}
            className={index === step ? 'is-active' : undefined}
            key={item.id}
            role="tab"
            type="button"
          >
            <span className="wh-kit-flow-num">{item.num}</span>
            <span className="wh-kit-flow-label">{item.title}</span>
          </button>
        ))}
      </div>

      <p className="wh-kit-flow-caption" aria-live="polite">
        <strong>{active.title}.</strong> {active.body}
      </p>

      <div aria-hidden className="wh-kit-page" ref={pageRef}>
        <div className="wh-kit-page-chrome">
          <span />
          <span />
          <span />
          <em>liivv.ca{href.startsWith('/') ? href : `/${href}`}</em>
        </div>

        <div className="wh-kit-page-body">
          <div className="wh-kit-page-product">
            <div className="wh-kit-page-media">
              <img alt={imageAlt} src={imageSrc} />
            </div>
            <span className="wh-product-badge">Featured kit</span>
            <h3>{title}</h3>
            <p>A calm first-chapter edit — customize quantities, add what was missing, then save or checkout.</p>
          </div>

          <div className="wh-kit-page-tray">
            <div className="wh-kit-page-tray-head">
              <h4>Your kit tray</h4>
              <span>Live preview</span>
            </div>

            <ul className="wh-kit-page-lines">
              <li className={`wh-kit-page-line${activeTarget === 'qty' && pointer.clicking ? ' is-pressed' : ''}`}>
                <div>
                  <strong>Organic cotton pads</strong>
                  <em>Starter staple</em>
                </div>
                <div className="wh-kit-page-qty">
                  <span>−</span>
                  <b>{padsCount}</b>
                  <span
                    className={`wh-kit-page-qty-plus${activeTarget === 'qty' && pointer.clicking ? ' is-pressed' : ''}`}
                    ref={qtyRef}
                  >
                    +
                  </span>
                </div>
              </li>
              <li className="wh-kit-page-line">
                <div>
                  <strong>Gentle heat wrap</strong>
                  <em>For cramp days</em>
                </div>
                <div className="wh-kit-page-qty">
                  <span>−</span>
                  <b>1</b>
                  <span>+</span>
                </div>
              </li>
              <li className="wh-kit-page-line">
                <div>
                  <strong>Hormonal skin basics</strong>
                  <em>Calm routine</em>
                </div>
                <div className="wh-kit-page-qty">
                  <span>−</span>
                  <b>1</b>
                  <span>+</span>
                </div>
              </li>
              {addedItem ? (
                <li className="wh-kit-page-line wh-kit-page-line--new" key={addedItem}>
                  <div>
                    <strong>{addedItem}</strong>
                    <em>Just added</em>
                  </div>
                  <div className="wh-kit-page-qty">
                    <span>−</span>
                    <b>1</b>
                    <span>+</span>
                  </div>
                </li>
              ) : null}
              <li
                className={`wh-kit-page-line wh-kit-page-line--add${activeTarget === 'add' && pointer.clicking ? ' is-pressed' : ''}`}
                ref={addRef}
              >
                + Add something new
              </li>
            </ul>

            <div className="wh-kit-page-actions">
              <button
                className={`wh-kit-page-save${activeTarget === 'save' && pointer.clicking ? ' is-pressed' : ''}`}
                ref={saveRef}
                type="button"
              >
                Save for later
              </button>
              <button
                className={`wh-kit-page-cart${activeTarget === 'cart' && pointer.clicking ? ' is-pressed' : ''}`}
                ref={cartRef}
                type="button"
              >
                Add to cart
              </button>
            </div>
          </div>
        </div>

        {searchOpen ? (
          <div className="wh-kit-search">
            <div className="wh-kit-search-card">
              <p className="wh-kit-search-label">Search the edit</p>
              <div className="wh-kit-search-input">
                <span>{searchQuery}</span>
                <i className="wh-kit-search-caret" />
              </div>
              <ul className="wh-kit-search-results">
                {(searchQuery.length > 1 ? searchResults : catalogNames.slice(0, 3)).map((name) => (
                  <li
                    className={searchHighlight && name === highlighted ? 'is-active' : undefined}
                    key={name}
                    ref={searchHighlight && name === highlighted ? searchResultRef : undefined}
                  >
                    {name}
                    {searchHighlight && name === highlighted ? <em>Add</em> : null}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}

        {!reduceMotion && pointer.visible ? (
          <div
            className={`wh-kit-cursor${pointer.clicking ? ' is-clicking' : ''}`}
            style={{
              transform: `translate3d(${Math.max(pointer.x - 3, 0)}px, ${Math.max(pointer.y - 2, 0)}px, 0)`,
            }}
          >
            <svg fill="none" height="28" viewBox="0 0 24 28" width="24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M4 2.5 4 22.2l5.1-4.4 3.1 7.3 2.6-1.1-3.1-7.2L19.5 16 4 2.5Z"
                fill="#312f2f"
                stroke="#f5f2ed"
                strokeLinejoin="round"
                strokeWidth="1.4"
              />
            </svg>
            <span className="wh-kit-cursor-ripple" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function WomensHealthDemoPage({ catalog }: { catalog?: WhDemoCatalog }) {
  const [feelingIndex, setFeelingIndex] = useState(0);
  const [shopRoom, setShopRoom] = useState<ShopRoomId>('all');

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
      } satisfies WhDemoCatalogItem;
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
    const id = window.setInterval(() => {
      setFeelingIndex((i) => (i + 1) % FEELING_WORDS.length);
    }, 2600);

    return () => window.clearInterval(id);
  }, []);

  return (
    <div id="wh-demo">
      {/* 1 — Feeling hero */}
      <section className="hero" aria-label="Women's Health hero">
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
            <img alt="" src={`${IMG}/hero.jpg`} />
          </div>
          <div aria-hidden className="hero-chip">
            <span>Liivv vibe</span>
            Wellness that works IRL
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

      {/* 2 — Trust strip */}
      <section aria-label="Why Liivv Women" className="wh-trust">
        <div className="container wh-trust-track">
          {TRUST_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      {/* 3 — Three doors */}
      <section aria-label="Start here" className="wh-doors" id="doors">
        <div className="container">
          <span className="eyebrow">Three ways in</span>
          <h2>What do you need today?</h2>
          <div className="wh-doors-grid">
            {DOORS.map((door) => (
              <a className="wh-door" href={door.href} key={door.id}>
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

      {/* 4 — Featured kit */}
      {hasKits ? (
        <section aria-label="Customizable kits" className="wh-kits rounded-top" id="build-your-kit">
          <div className="container">
            <span className="eyebrow">Liivv kits</span>
            <h2>Start curated. Finish as yours.</h2>
            <p className="wh-kits-intro">
              Prebuilt for the chapter — then customize on the kit page and save it for later.
            </p>

            <KitFlowDemo
              kitHref={featuredKit?.path}
              kitImage={featuredKit?.image}
              kitName={featuredKit?.name}
              searchPool={kitSearchPool}
            />

            <KitsCarousel initialId={featuredKit?.entityId} kits={allKits} />
          </div>
        </section>
      ) : null}

      {/* 5 — Shop rooms */}
      {hasShop ? (
        <section aria-label="Shop Women's Health" className="wh-shop rounded-top" id="shop-womens-health">
          <div className="container">
            <span className="eyebrow">Shop Women&apos;s Health</span>
            <h2>Rooms in the edit</h2>
            <p className="wh-shop-intro">
              Live catalog from Shop Women&apos;s Health — filtered into calm rooms so it doesn&apos;t feel
              like a warehouse.
            </p>
            <div aria-label="Shop rooms" className="wh-shop-rooms" role="tablist">
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
            <div className="wh-product-grid">
              {filteredShop.map((product) => (
                <ProductThumb key={product.entityId} product={product} />
              ))}
            </div>
            {filteredShop.length === 0 ? (
              <p className="wh-shop-empty">Nothing in this room yet — try All or another filter.</p>
            ) : null}
            <div className="wh-shop-cta">
              <a className="btn btn-dark" href={SHOP_HREF}>
                Shop all Women&apos;s Health
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {/* 6 — Life chapters */}
      <section aria-label="Find your chapter" className="wh-chooser rounded-top" id="where-are-you">
        <div className="container">
          <span className="eyebrow">Life chapters</span>
          <h2>Six chapters. One that fits.</h2>
          <p className="wh-chooser-intro">
            Not an age band — a season. Open the one that feels like you.
          </p>
          <div className="wh-chooser-grid">
            {CHAPTER_CHOOSER.map((chapter) => (
              <a className="wh-chooser-card" href={chapter.href} key={chapter.num}>
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

      {/* 7 — Care */}
      <section className="images-text rounded-top" id="care">
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

      {/* 8 — Clair room */}
      <section aria-label="Clair continuous hormone wearable" className="wh-clair rounded-top" id="clair">
        <div aria-hidden className="wh-clair-media">
          <ClairFrameLoop />
        </div>
        <div aria-hidden className="wh-clair-veil" />
        <div className="container wh-clair-board">
          <div className="wh-clair-copy">
            <span className="eyebrow">Also in the edit · Clair Health</span>
            <h2>
              Continuous clarity, <em>when you want it.</em>
            </h2>
            <p className="wh-clair-lead">
              Clair is the world&apos;s first continuous, noninvasive hormone wearable — designed for women, by
              women. It reads your body&apos;s signals in real time so you see the shape of your month instead of
              guessing through it.
            </p>

            <div className="wh-clair-signals" role="list">
              {CLAIR_HORMONES.map((hormone) => (
                <span key={hormone} role="listitem">
                  {hormone}
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

      {/* 9 — Voices */}
      <section className="voices rounded-top" id="voices">
        <div className="container">
          <span className="eyebrow voices-eyebrow">Beyond the aisle</span>
          <h2>
            Real talk <em>from the community</em>
          </h2>

          <article className="wh-voice-feature">
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

          <div className="voice-cards">
            <article className="voice">
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
            <article className="voice">
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
            <article className="voice">
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

      {/* FAQ — shortened */}
      <section className="faq rounded-top">
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
                Yes. Start with a curated kit, adjust quantities, add items, and save your version for later.
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

      {/* 10 — Manifesto close */}
      <section className="closing rounded-top" id="manifesto">
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
