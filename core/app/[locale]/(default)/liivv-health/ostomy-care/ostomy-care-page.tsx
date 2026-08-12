'use client';

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';

import { CHAPTERS as CHAPTER_PAGES, SHOP_OSTOMY_HREF, chapterHref } from './chapters/chapters-data';
import type { OcCatalog, OcCatalogItem } from './get-oc-catalog';
import {
  HERO_FLOAT_BARRIER_ID,
  HERO_FLOAT_POUCH_ID,
  NEW_JOURNEY_STARTER_KIT_ID,
} from './oc-ids';

import './ostomy-care.css';

/*
 * =============================================================================
 * OSTOMY CARE ? CONTENT MAP
 * =============================================================================
 * Page URL: /liivv-health/ostomy-care
 *
 * Edit copy in two places:
 *   1. Constants below (shared lists: doors, trust items, brands, etc.)
 *   2. JSX sections in OstomyCarePage (search "SECTION N ?")
 *
 * Chapter cards pull titles/blurbs from: ./chapters/chapters-data.ts
 * Images live under: /public/archive/ostomy-care/
 * =============================================================================
 */

/** Links used by CTAs across the page */
const SHOP_HREF = SHOP_OSTOMY_HREF;
const PHARMACIST_HREF = '/account/virtual-care';
const IMG = '/archive/ostomy-care';
/** SECTION 1 ? Hero float product images */
const HERO_FLOAT_KIT_IMG = `${IMG}/door-shop.jpg`;
const HERO_FLOAT_ACCESSORY_IMG = `${IMG}/door-care.jpg`;

/** SECTION 4 ? Kit flow demo step labels + captions */
const KIT_FLOW_STEPS = [
  {
    id: 'customize',
    num: '01',
    title: 'Customize',
    body: 'Tune quantities on what\'s already in your kit ? keep what helps, dial back the rest.',
  },
  {
    id: 'add',
    num: '02',
    title: 'Add something new',
    body: 'Missing a wipe, ring, or spare pouch? Add it to the tray before you save.',
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
    body: 'Keep your version for next restock ? no starting from scratch.',
  },
] as const;

/** SECTION 8 ? Preferred brands (shop context, not clinical endorsement) */
const PREFERRED_BRANDS = ['Coloplast', 'Hollister', 'Convatec'] as const;
const BRAND_POINTS = [
  'Pouches & barriers',
  'Skin comfort accessories',
  'Belts, rings & paste',
  'Discreet restock',
] as const;

/** SECTION 1 ? Rotating words in the hero headline */
const FEELING_WORDS = ['at ease', 'discreet', 'prepared', 'confident', 'like yourself'] as const;

/** SECTION 2 ? Trust strip items under the hero */
const TRUST_ITEMS = [
  'Ontario pharmacist chat',
  'Discreet delivery',
  'Customize & save kits',
  'Preferred brands in one place',
] as const;

/** SECTION 3 ? Three "doors" cards (Shop / Care / Chapters) */
const DOORS = [
  {
    id: 'shop',
    label: 'Shop',
    title: 'The Ostomy edit',
    body: 'Pouches, barriers, accessories, and kits ? curated for real routines.',
    href: '#build-your-kit',
    image: `${IMG}/door-shop.jpg`,
  },
  {
    id: 'care',
    label: 'Care',
    title: 'Ask without the awkward',
    body: 'Ontario pharmacists in chat ? kind answers, no waiting room.',
    href: '#care',
    image: `${IMG}/door-care.jpg`,
  },
  {
    id: 'chapters',
    label: 'Chapters',
    title: 'Find your place',
    body: 'Everyday Liivving, stoma basics, and new-to-journey guidance ? at your pace.',
    href: '#where-are-you',
    image: `${IMG}/door-chapters.jpg`,
  },
] as const;

/**
 * SECTION 6 ? Journey chapter cards (+ shop essentials link)
 */
const CHAPTER_CHOOSER = [
  ...CHAPTER_PAGES.map((chapter) => ({
    num: chapter.num,
    shortTitle: chapter.title,
    title: chapter.title,
    blurb: chapter.vibe,
    href: chapterHref(chapter.slug),
    image: chapter.heroImage,
  })),
  {
    num: '04',
    shortTitle: 'Shop Ostomy Essentials',
    title: 'Shop Ostomy Essentials',
    blurb: 'Pouches, barriers, skin care, and preferred brands ? restocked discreetly.',
    href: SHOP_HREF,
    image: `${IMG}/door-shop.jpg`,
  },
];

/** SECTION 5 ? Shop room filter tab labels */
const SHOP_ROOMS = [
  { id: 'all', label: 'All' },
  { id: 'kits', label: 'Curated kits' },
  { id: 'onePiece', label: 'One-piece' },
  { id: 'twoPiece', label: 'Two-piece' },
  { id: 'barriers', label: 'Barriers & flanges' },
  { id: 'accessories', label: 'Accessories' },
] as const;

type ShopRoomId = (typeof SHOP_ROOMS)[number]['id'];

function roomForProduct(product: OcCatalogItem): Exclude<ShopRoomId, 'all' | 'kits'> {
  const n = product.name.toLowerCase();

  if (/1-piece|one-piece|1 piece|premier one-piece|pouchkins newborn|pouchkins drainable pediatric one|activelife/.test(n)) {
    return 'onePiece';
  }

  if (/2-piece|two-piece|2 piece|new image two|sensura mio click|sensura click|natura 2|sur-fit/.test(n)) {
    return 'twoPiece';
  }

  if (/barrier|flange|wafer|ring|paste|powder|flextend|flexwear|ceraplus|stomahesive|eakin/.test(n) && !/pouch/.test(n)) {
    return 'barriers';
  }

  if (/belt|clamp|deodorant|odor|adapter|wipe|remover|sheet|lubricat|sponge/.test(n)) {
    return 'accessories';
  }

  if (/pouch/.test(n) && /urostom|drainable|closed/.test(n)) {
    return /1-piece|one-piece|premier one|assura 1|sensura 1|sensura light 1|activelife|pouchkins/.test(n)
      ? 'onePiece'
      : 'twoPiece';
  }

  return 'accessories';
}
function hasDisplayPrice(priceLabel?: string) {
  return Boolean(priceLabel && !/(\$|CA\$)?\s*0([.,]0+)?\b/i.test(priceLabel));
}

function ProductThumb({ product }: { product: OcCatalogItem }) {
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
  kits: OcCatalogItem[];
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

  const renderFeature = (kit: OcCatalogItem, offset: number) => {
    const isFeatured = kit.entityId === NEW_JOURNEY_STARTER_KIT_ID;
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
              ? 'A calm first-weeks edit — open it to tune quantities, add what was missing, and save your version.'
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
          aria-label="Ostomy Care kits carousel"
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

const KIT_SEARCH_FALLBACKS = [
  'Barrier wipe',
  'Barrier ring',
  'Ostomy belt',
  'Odor eliminator',
  'Stoma powder',
] as const;

const EMPTY_SEARCH_POOL: string[] = [];
const EMPTY_PRODUCTS: OcCatalogItem[] = [];

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
  const [hoverStep, setHoverStep] = useState<number | null>(null);
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
  const caption = KIT_FLOW_STEPS[hoverStep ?? step] ?? active;
  const searchResults = catalogNames
    .filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.length < 2)
    .slice(0, 4);
  const highlighted = searchResults[0] ?? addedItem ?? 'Intimate wipes';

  return (
    <div className="wh-kit-flow" data-step={active.id}>
      <div
        className="wh-kit-flow-steps"
        onMouseLeave={() => setHoverStep(null)}
        role="tablist"
        aria-label="How kits work"
      >
        {KIT_FLOW_STEPS.map((item, index) => (
          <div className="wh-kit-flow-step" key={item.id}>
            <button
              aria-selected={index === step}
              className={[
                index === step ? 'is-active' : '',
                hoverStep === index ? 'is-preview' : '',
              ]
                .filter(Boolean)
                .join(' ') || undefined}
              onBlur={() => setHoverStep(null)}
              onFocus={() => setHoverStep(index)}
              onMouseEnter={() => setHoverStep(index)}
              role="tab"
              type="button"
            >
              <span className="wh-kit-flow-num">{item.num}</span>
              <span className="wh-kit-flow-label">{item.title}</span>
            </button>
            {index < KIT_FLOW_STEPS.length - 1 ? (
              <span aria-hidden className="wh-kit-flow-arrow">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>

      <p className="wh-kit-flow-caption" aria-live="polite">
        <strong>{caption.title}.</strong> {caption.body}
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
            <p>A calm first-weeks edit — customize quantities, add what was missing, then save or checkout.</p>
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

export function OstomyCarePage({ catalog }: { catalog?: OcCatalog }) {
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
        isKit: id === NEW_JOURNEY_STARTER_KIT_ID,
      } satisfies OcCatalogItem;
    };

    return {
      primary: resolve(NEW_JOURNEY_STARTER_KIT_ID, '/new-journey-starter-kit/', 'New Journey Starter Kit'),
      secondary: resolve(HERO_FLOAT_POUCH_ID, '/sensura-1-piece-drainable-pouch-flat-opaque/', 'SenSura 1-Piece Drainable Pouch'),
      tertiary: resolve(HERO_FLOAT_BARRIER_ID, '/adapt-barrier-rings/', 'Adapt Barrier Rings'),
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
    <div id="ostomy-care">
      {/* =====================================================================
          SECTION 1 — HERO
          ===================================================================== */}
      <section className="hero" aria-label="Ostomy Care hero">
        <div className="hero-inner">
          <span className="hero-kicker">Ostomy Care and Everyday Liivving</span>
          <h1>
            Care that stays{' '}
            <span aria-live="polite" className="hero-feeling" key={FEELING_WORDS[feelingIndex]}>
              {FEELING_WORDS[feelingIndex]}
            </span>
            .
          </h1>
          <p>
            Ostomy supplies, everyday living support, and kind guidance — so your routine feels like yours
            again.
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
            <span>Care that stays discreet</span>
            Supplies, fit support, everyday living
          </div>
          <div aria-hidden className="hero-frame hero-frame--a hero-frame--product">
            <img
              alt={heroFloatPrimary.image?.alt || heroFloatPrimary.name}
              src={heroFloatPrimary.image?.src || HERO_FLOAT_KIT_IMG}
            />
          </div>
          <div aria-hidden className="hero-frame hero-frame--b hero-frame--product">
            <img
              alt={heroFloatSecondary.image?.alt || heroFloatSecondary.name}
              src={heroFloatSecondary.image?.src || HERO_FLOAT_ACCESSORY_IMG}
            />
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 2 — TRUST STRIP
          ===================================================================== */}
      <section aria-label="Why Liivv Ostomy" className="wh-trust">
        <div className="container wh-trust-track">
          {TRUST_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      {/* =====================================================================
          SECTION 3 — THREE DOORS (Shop / Care / Chapters)
          Anchor: #doors
          Edit card copy + images in: DOORS (top of file).
          Eyebrow + headline below are edited inline.
          ===================================================================== */}
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

      {/* =====================================================================
          SECTION 4 — CUSTOMIZABLE KITS
          Anchor: #build-your-kit
          Eyebrow / headline / intro below. Kit products come from catalog.
          Step captions: KIT_FLOW_STEPS. Demo UI: KitFlowDemo component.
          ===================================================================== */}
      {hasKits ? (
        <section aria-label="Customizable kits" className="wh-kits rounded-top" id="build-your-kit">
          <div className="container">
            <span className="eyebrow">Liivv kits</span>
            <h2>Start curated. Finish as yours.</h2>
            <p className="wh-kits-intro">
              Prebuilt for your journey — then customize on the kit page and save it for later restock.
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

      {/* =====================================================================
          SECTION 5 — SHOP ROOMS
          Anchor: #shop-womens-health
          Filter tab labels: SHOP_ROOMS. Products come from live catalog.
          Eyebrow / headline / intro / CTA below are edited inline.
          ===================================================================== */}
      {hasShop ? (
        <section aria-label="Shop Ostomy Care" className="wh-shop rounded-top" id="shop-ostomy-care">
          <div className="container">
            <span className="eyebrow">Shop Ostomy Essentials</span>
            <h2>Rooms in the edit</h2>
            <p className="wh-shop-intro">
              Live catalog from Shop Ostomy Care — filtered into calm rooms so it doesn&apos;t feel like a
              warehouse.
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
                Shop all Ostomy Essentials
              </a>
            </div>
          </div>
        </section>
      ) : null}

      {/* =====================================================================
          SECTION 6 — JOURNEY CHAPTERS
          ===================================================================== */}
      <section aria-label="Find your chapter" className="wh-chooser rounded-top" id="where-are-you">
        <div className="container">
          <span className="eyebrow">Your journey</span>
          <h2>Four ways in. One that fits.</h2>
          <p className="wh-chooser-intro">
            Everyday Liivving, stoma education, new-to-journey basics, or jump straight to the shop.
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

      {/* =====================================================================
          SECTION 7 — CARE / PHARMACIST CHAT
          Anchor: #care
          Images, eyebrow, headline, body copy, CTA — all edited inline below.
          ===================================================================== */}
      <section className="images-text rounded-top" id="care">
        <div className="container images-text-grid">
          <div className="visuals">
            <Pic className="big" src={`${IMG}/care-chat-main.jpg`} />
            <Pic className="mid" src={`${IMG}/care-chat-desk.jpg`} />
            <Pic className="small" src={`${IMG}/care-chat-moment.jpg`} />
          </div>
          <div>
            <span className="eyebrow">Available in Ontario</span>
            <h2>Fit questions that don&apos;t need a waiting room</h2>
            <p>
              Product fit, restock questions, and everyday concerns — chat with an Ontario pharmacist during
              business hours until 5 p.m. Eastern.
            </p>
            <p>
              Outside those hours, Olivia can help with shopping and your account — she does not give medical
              advice. Clinical stoma concerns belong with your WOC nurse or care team.
            </p>
            <a className="btn btn-white" href={PHARMACIST_HREF}>
              Talk to a Pharmacist
            </a>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 8 — PREFERRED BRANDS
          ===================================================================== */}
      <section aria-label="Preferred ostomy brands" className="wh-clair rounded-top" id="brands">
        <div aria-hidden className="wh-clair-media">
          <img alt="" src={`${IMG}/door-shop.jpg`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div aria-hidden className="wh-clair-veil" />
        <div className="container wh-clair-board">
          <div className="wh-clair-copy">
            <span className="eyebrow">Preferred brands · shop context</span>
            <h2>
              Names you already know, <em>restocked discreetly.</em>
            </h2>
            <p className="wh-clair-lead">
              Coloplast, Hollister, and Convatec — listed as shop context so you can find familiar systems
              and accessories in one calm place. Not a clinical endorsement; your WOC nurse remains your guide
              for fit.
            </p>

            <div className="wh-clair-signals" role="list">
              {PREFERRED_BRANDS.map((brand) => (
                <span key={brand} role="listitem">
                  {brand}
                </span>
              ))}
            </div>

            <ul className="wh-clair-uses">
              {BRAND_POINTS.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="wh-clair-close">
              Same calm place as the rest of Liivv Health. Same discreet delivery.
            </p>

            <div className="wh-clair-cta">
              <a className="btn btn-dark" href={SHOP_HREF}>
                Shop Ostomy Essentials
              </a>
              <a className="btn btn-outline" href="#build-your-kit">
                Browse kits
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
          <span className="eyebrow voices-eyebrow">Beyond the aisle</span>
          <h2>
            Real talk <em>from the community</em>
          </h2>

          <article className="wh-voice-feature">
            <div className="wh-voice-feature-media">
              <Pic alt="Morgan" src={`${IMG}/voice-1.jpg`} />
            </div>
            <div className="wh-voice-feature-copy">
              <p className="wh-voice-kicker">Fit question · Toronto</p>
              <blockquote>
                &ldquo;I finally asked about convex vs flat without feeling silly. Got a kind, practical answer
                on my lunch break — no waiting room, no awkward aisle.&rdquo;
              </blockquote>
              <div className="who">
                <img alt="" className="wh-voice-avatar" src={`${IMG}/voice-1.jpg`} />
                <div>
                  Morgan
                  <span>Toronto · colostomy · busy parent</span>
                </div>
              </div>
            </div>
          </article>

          <div className="voice-cards">
            <article className="voice">
              <img alt="" className="wh-voice-avatar wh-voice-avatar--lg" src={`${IMG}/voice-2.jpg`} />
              <div className="body">
                <blockquote>
                  &ldquo;My usuals show up like clockwork. I genuinely forgot what running-out panic feels
                  like.&rdquo;
                </blockquote>
                <div className="who">
                  Casey
                  <span>Ottawa · ileostomy · veteran restocker</span>
                </div>
              </div>
            </article>
            <article className="voice">
              <img alt="" className="wh-voice-avatar wh-voice-avatar--lg" src={`${IMG}/voice-3.jpg`} />
              <div className="body">
                <blockquote>
                  &ldquo;The go-bag kit idea changed travel for me. Extra pouch, wipes, done — quiet
                  confidence.&rdquo;
                </blockquote>
                <div className="who">
                  Jordan
                  <span>Hamilton · new to the journey</span>
                </div>
              </div>
            </article>
            <article className="voice">
              <img alt="" className="wh-voice-avatar wh-voice-avatar--lg" src={`${IMG}/voice-4.jpg`} />
              <div className="body">
                <blockquote>
                  &ldquo;Skin was angry until I got the seal right. Powder, ring, and a pharmacist chat — then
                  quiet days again.&rdquo;
                </blockquote>
                <div className="who">
                  Avery
                  <span>Mississauga · Liivv Ostomy regular</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* =====================================================================
          SECTION 10 — FAQ
          Questions + answers edited inline in the <details> blocks below.
          ===================================================================== */}
      <section className="faq rounded-top">
        <div className="faq-layout faq-layout--copy-only">
          <div>
            <h2>Good questions, honest answers</h2>
            <p className="intro">The things people actually ask — answered like a friend would.</p>
            <details open>
              <summary>How often should I empty or change my pouch?</summary>
              <p>
                Empty drainable pouches when they are about one-third to one-half full. Full system changes are
                often every few days — or sooner if you feel burning, itching, or a leak. Your WOC nurse can
                help you find a wear time that fits you.
              </p>
            </details>
            <details>
              <summary>Can I customize a kit?</summary>
              <p>
                Yes. Start with a curated kit, adjust quantities, add items, and save your version for later
                restock.
              </p>
            </details>
            <details>
              <summary>What should I keep in a go-bag?</summary>
              <p>
                Spare barrier and pouch, soft wipes, disposal bags, and any skin protectant or remover you use —
                plus a spare underwear or liner if it helps you feel ready.
              </p>
            </details>
            <details>
              <summary>What can I chat with a pharmacist about?</summary>
              <p>
                Everyday product and restock questions in Ontario during business hours (until 5 p.m. Eastern).
                Olivia helps with shopping anytime — she does not give medical advice. Clinical concerns belong
                with your WOC nurse or care team.
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
      <section className="closing rounded-top" id="manifesto">
        <div className="closing-bg">
          <img alt="" src={`${IMG}/closing.jpg`} />
        </div>
        <div className="container">
          <p className="wh-manifesto-kicker">The Liivv promise</p>
          <h2>
            No awkward aisle.
            <br />
            <span>Just everyday Liivving.</span>
          </h2>
          <p>
            Supplies that show up on time, guidance without overwhelm, and room for the rest of your life —
            at your pace.
          </p>
          <div className="wh-closing-cta">
            <a className="btn btn-white" href={SHOP_HREF}>
              Shop Ostomy Essentials
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
