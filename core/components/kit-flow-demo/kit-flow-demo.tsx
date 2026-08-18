'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import './kit-flow-demo.css';

const KIT_FLOW_STEPS = [
  {
    id: 'customize',
    num: '01',
    title: 'Customize',
    body: "Tune quantities on what's already in your kit — keep what helps, dial back the rest.",
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
    body: "Checkout when you're ready. Same calm flow, same discreet delivery.",
  },
  {
    id: 'save',
    num: '04',
    title: 'Save for later',
    body: 'Keep your version for next month — no starting from scratch.',
  },
] as const;

const DEFAULT_SEARCH_FALLBACKS = [
  'Intimate wipes',
  'Period underwear',
  'Magnesium calm pack',
  'Cycle comfort tea',
  'Soft heat wrap refill',
] as const;

const EMPTY_SEARCH_POOL: string[] = [];

type KitPointerTarget = 'qty' | 'add' | 'search' | 'cart' | 'save';

export type KitFlowTrayLine = {
  name: string;
  note: string;
  qty?: number;
  /** Marks the line whose + control the cursor animates */
  isQtyTarget?: boolean;
};

const DEFAULT_TRAY_LINES: KitFlowTrayLine[] = [
  { name: 'Organic cotton pads', note: 'Starter staple', qty: 2, isQtyTarget: true },
  { name: 'Gentle heat wrap', note: 'For cramp days', qty: 1 },
  { name: 'Hormonal skin basics', note: 'Calm routine', qty: 1 },
];

export type KitFlowDemoProps = {
  kitName?: string;
  kitImage?: { src: string; alt: string } | null;
  kitHref?: string;
  searchPool?: string[];
  searchFallbacks?: readonly string[];
  badge?: string;
  description?: string;
  trayLines?: KitFlowTrayLine[];
  fallbackImageSrc?: string;
};

export function KitFlowDemo({
  kitName,
  kitImage,
  kitHref,
  searchPool = EMPTY_SEARCH_POOL,
  searchFallbacks = DEFAULT_SEARCH_FALLBACKS,
  badge = 'Featured kit',
  description = 'A calm first-chapter edit — customize quantities, add what was missing, then save or checkout.',
  trayLines = DEFAULT_TRAY_LINES,
  fallbackImageSrc = '/archive/womens-health/door-shop-kit.jpg',
}: KitFlowDemoProps) {
  const [step, setStep] = useState(0);
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const qtyTarget = trayLines.find((line) => line.isQtyTarget) ?? trayLines[0];
  const [padsCount, setPadsCount] = useState(qtyTarget?.qty ?? 2);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHighlight, setSearchHighlight] = useState(false);
  const [activeTarget, setActiveTarget] = useState<KitPointerTarget | null>(null);
  const [pointer, setPointer] = useState({ x: 72, y: 48, visible: false, clicking: false });
  const [reduceMotion, setReduceMotion] = useState(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const inViewRef = useRef(true);
  const qtyRef = useRef<HTMLSpanElement>(null);
  const addRef = useRef<HTMLLIElement>(null);
  const searchResultRef = useRef<HTMLLIElement>(null);
  const cartRef = useRef<HTMLButtonElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const catalogNamesRef = useRef<string[]>([...searchFallbacks]);

  const title = kitName ?? 'Curated starter kit';
  const href = kitHref ?? '#';
  const imageSrc = kitImage?.src ?? fallbackImageSrc;
  const imageAlt = kitImage?.alt ?? title;
  const fallbackPick = searchFallbacks[0] ?? 'Add-on item';

  const catalogNames = useMemo(() => {
    const names = searchPool.map((name) => name.trim()).filter(Boolean);
    return names.length > 0 ? names : [...searchFallbacks];
  }, [searchPool, searchFallbacks]);

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
    const root = rootRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = Boolean(entry?.isIntersecting);
      },
      { rootMargin: '80px 0px', threshold: 0.08 },
    );

    observer.observe(root);
    return () => observer.disconnect();
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
      setPadsCount((qtyTarget?.qty ?? 2) + 1);
      setAddedItem(catalogNamesRef.current[0] ?? fallbackPick);
      setSearchOpen(false);
      setActiveTarget(null);
      setPointer((prev) => ({ ...prev, visible: false, clicking: false }));
      return;
    }

    let cancelled = false;
    let timerId = 0;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        timerId = window.setTimeout(() => resolve(), ms);
      });

    const wait = async (ms: number) => {
      let remaining = ms;

      while (!cancelled && remaining > 0) {
        if (!inViewRef.current) {
          await sleep(400);
          continue;
        }

        const chunk = Math.min(remaining, 250);
        const started = performance.now();
        await sleep(chunk);
        remaining -= performance.now() - started;
      }
    };

    const pickProduct = () => {
      const names = catalogNamesRef.current;
      return names[Math.floor(Math.random() * names.length)] ?? fallbackPick;
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
        setPadsCount(qtyTarget?.qty ?? 2);
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
        setPadsCount((qtyTarget?.qty ?? 2) + 1);
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
  }, [measurePointer, reduceMotion, qtyTarget?.qty, fallbackPick]);

  const active = KIT_FLOW_STEPS[step] ?? KIT_FLOW_STEPS[0];
  const caption = KIT_FLOW_STEPS[hoverStep ?? step] ?? active;
  const searchResults = catalogNames
    .filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.length < 2)
    .slice(0, 4);
  const highlighted = searchResults[0] ?? addedItem ?? fallbackPick;

  return (
    <div className="kit-flow-demo" ref={rootRef}>
      <div className="kf-flow" data-step={active.id}>
        <div
          aria-label="How kits work"
          className="kf-flow-steps"
          onMouseLeave={() => setHoverStep(null)}
          role="tablist"
        >
          {KIT_FLOW_STEPS.map((item, index) => (
            <div className="kf-flow-step" key={item.id}>
              <button
                aria-selected={index === step}
                className={
                  [index === step ? 'is-active' : '', hoverStep === index ? 'is-preview' : '']
                    .filter(Boolean)
                    .join(' ') || undefined
                }
                onBlur={() => setHoverStep(null)}
                onFocus={() => setHoverStep(index)}
                onMouseEnter={() => setHoverStep(index)}
                role="tab"
                type="button"
              >
                <span className="kf-flow-num">{item.num}</span>
                <span className="kf-flow-label">{item.title}</span>
              </button>
              {index < KIT_FLOW_STEPS.length - 1 ? (
                <span aria-hidden className="kf-flow-arrow">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <p aria-live="polite" className="kf-flow-caption">
          <strong>{caption.title}.</strong> {caption.body}
        </p>

        <div aria-hidden className="kf-page" ref={pageRef}>
          <div className="kf-page-chrome">
            <span />
            <span />
            <span />
            <em>liivv.ca{href.startsWith('/') ? href : `/${href}`}</em>
          </div>

          <div className="kf-page-body">
            <div className="kf-page-product">
              <div className="kf-page-media">
                <img alt={imageAlt} src={imageSrc} />
              </div>
              <span className="kf-product-badge">{badge}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>

            <div className="kf-page-tray">
              <div className="kf-page-tray-head">
                <h4>Your kit tray</h4>
                <span>Live preview</span>
              </div>

              <ul className="kf-page-lines">
                {trayLines.map((line) => {
                  const isTarget = Boolean(line.isQtyTarget);
                  const qty = isTarget ? padsCount : (line.qty ?? 1);
                  return (
                    <li
                      className={`kf-page-line${isTarget && activeTarget === 'qty' && pointer.clicking ? ' is-pressed' : ''}`}
                      key={line.name}
                    >
                      <div>
                        <strong>{line.name}</strong>
                        <em>{line.note}</em>
                      </div>
                      <div className="kf-page-qty">
                        <span>−</span>
                        <b>{qty}</b>
                        {isTarget ? (
                          <span
                            className={`kf-page-qty-plus${activeTarget === 'qty' && pointer.clicking ? ' is-pressed' : ''}`}
                            ref={qtyRef}
                          >
                            +
                          </span>
                        ) : (
                          <span>+</span>
                        )}
                      </div>
                    </li>
                  );
                })}
                {addedItem ? (
                  <li className="kf-page-line kf-page-line--new" key={addedItem}>
                    <div>
                      <strong>{addedItem}</strong>
                      <em>Just added</em>
                    </div>
                    <div className="kf-page-qty">
                      <span>−</span>
                      <b>1</b>
                      <span>+</span>
                    </div>
                  </li>
                ) : null}
                <li
                  className={`kf-page-line kf-page-line--add${activeTarget === 'add' && pointer.clicking ? ' is-pressed' : ''}`}
                  ref={addRef}
                >
                  + Add something new
                </li>
              </ul>

              <div className="kf-page-actions">
                <button
                  className={`kf-page-save${activeTarget === 'save' && pointer.clicking ? ' is-pressed' : ''}`}
                  ref={saveRef}
                  type="button"
                >
                  Save for later
                </button>
                <button
                  className={`kf-page-cart${activeTarget === 'cart' && pointer.clicking ? ' is-pressed' : ''}`}
                  ref={cartRef}
                  type="button"
                >
                  Add to cart
                </button>
              </div>
            </div>
          </div>

          {searchOpen ? (
            <div className="kf-search">
              <div className="kf-search-card">
                <p className="kf-search-label">Search the edit</p>
                <div className="kf-search-input">
                  <span>{searchQuery}</span>
                  <i className="kf-search-caret" />
                </div>
                <ul className="kf-search-results">
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
              className={`kf-cursor${pointer.clicking ? ' is-clicking' : ''}`}
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
              <span className="kf-cursor-ripple" />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
