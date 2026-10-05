'use client';

import { useTranslations } from 'next-intl';
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
    body: 'Missing something? Search the catalog and add it before you save.',
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
    body: 'Keep this version on your account — no starting from scratch.',
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
const FALLBACK_UNIT_PRICES = [12, 18, 16] as const;
const ADDED_UNIT_PRICE = 9.5;

export type KitFlowStep = {
  id: string;
  num: string;
  title: string;
  body: string;
};

export type KitFlowTrayLine = {
  name: string;
  note: string;
  qty?: number;
  /** Unit price shown on the line. Illustrative — the live kit page uses catalog prices. */
  price?: number;
  /** Marks the line whose increase control the cursor animates */
  isQtyTarget?: boolean;
};

const DEFAULT_TRAY_LINES: KitFlowTrayLine[] = [
  { name: 'Organic cotton pads', note: 'Starter staple', qty: 2, price: 12, isQtyTarget: true },
  { name: 'Gentle heat wrap', note: 'For cramp days', qty: 1, price: 18 },
  { name: 'Hormonal skin basics', note: 'Calm routine', qty: 1, price: 16 },
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
  /** Instructional step pills. Defaults to English. The buy box itself uses CuratedKit messages. */
  steps?: readonly KitFlowStep[];
  stepsLabel?: string;
};

type KitPointerTarget = 'qty' | 'field' | 'search' | 'cart' | 'save';

function money(amount: number) {
  return `$${amount.toFixed(2)}`;
}

function thumbTone(name: string) {
  const tones = ['#e7efe4', '#f3e6dc', '#e4eaf2', '#efe8d8', '#e8e4ef'];
  let hash = 0;

  for (const char of name) {
    hash = (hash + char.charCodeAt(0)) % tones.length;
  }

  return tones[hash] ?? tones[0];
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg aria-hidden fill="none" height="14" viewBox="0 0 16 16" width="14">
      <path
        d={dir === 'left' ? 'M10 3.5 5.5 8 10 12.5' : 'M6 3.5 10.5 8 6 12.5'}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

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
  steps,
  stepsLabel = 'How kits work',
}: KitFlowDemoProps) {
  const t = useTranslations('Faceted.CuratedKit');
  const flowSteps = steps ?? KIT_FLOW_STEPS;
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
  const fieldRef = useRef<HTMLDivElement>(null);
  const searchResultRef = useRef<HTMLSpanElement>(null);
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
        : target === 'field'
          ? fieldRef.current
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
  }, [
    activeTarget,
    searchOpen,
    searchQuery,
    searchHighlight,
    addedItem,
    padsCount,
    measurePointer,
    reduceMotion,
  ]);

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
        await aim('field');
        if (cancelled) break;
        await click('field');
        if (cancelled) break;

        setSearchOpen(true);
        setSearchQuery('');
        setSearchHighlight(false);
        await wait(280);
        if (cancelled) break;

        const product = pickProduct();
        for (let i = 1; i <= product.length; i += 1) {
          if (cancelled) break;
          setSearchQuery(product.slice(0, i));
          await wait(42 + (i % 3) * 8);
        }
        if (cancelled) break;

        await wait(220);
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

  const active = flowSteps[step] ?? flowSteps[0];
  const caption = flowSteps[hoverStep ?? step] ?? active;
  const searchResults = catalogNames
    .filter((name) => name.toLowerCase().includes(searchQuery.toLowerCase()) || searchQuery.length < 2)
    .slice(0, 4);
  const highlighted = searchResults[0] ?? addedItem ?? fallbackPick;
  const searching = searchOpen && searchQuery.trim().length >= 2;
  const suggestion =
    catalogNames.find(
      (name) => name !== addedItem && !trayLines.some((line) => line.name === name),
    ) ?? fallbackPick;

  const rows = trayLines.map((line, index) => {
    const isTarget = Boolean(line.isQtyTarget);
    const qty = isTarget ? padsCount : (line.qty ?? 1);
    const unit = line.price ?? FALLBACK_UNIT_PRICES[index] ?? 12;

    return { ...line, isTarget, qty, lineTotal: unit * qty };
  });

  const itemCount = rows.length + (addedItem ? 1 : 0);
  const kitTotal =
    rows.reduce((sum, row) => sum + row.lineTotal, 0) + (addedItem ? ADDED_UNIT_PRICE : 0);

  const pressing = (target: KitPointerTarget) => activeTarget === target && pointer.clicking;

  return (
    <div className="kit-flow-demo" ref={rootRef}>
      <div className="kf-flow" data-step={active?.id}>
        <div
          aria-label={stepsLabel}
          className="kf-flow-steps"
          onMouseLeave={() => setHoverStep(null)}
          role="tablist"
        >
          {flowSteps.map((item, index) => (
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
              {index < flowSteps.length - 1 ? (
                <span aria-hidden className="kf-flow-arrow">
                  →
                </span>
              ) : null}
            </div>
          ))}
        </div>

        <p aria-live="polite" className="kf-flow-caption">
          <strong>{caption?.title}.</strong> {caption?.body}
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
            </div>

            <div className="kf-buy">
              <p className="kf-buy-badge">{badge}</p>
              <h3>{title}</h3>
              <p className="kf-buy-summary">{description}</p>

              <div className="kf-sheet">
                <section className="kf-add">
                  <h4>{t('addItemsTitle')}</h4>
                  <p>{t('addItemsSubtitle')}</p>
                  <div
                    className={`kf-search-field${pressing('field') ? ' is-pressed' : ''}${searchOpen ? ' is-active' : ''}`}
                    ref={fieldRef}
                  >
                    <svg aria-hidden fill="none" height="16" viewBox="0 0 16 16" width="16">
                      <circle cx="7" cy="7" r="4.25" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10.2 10.2 13.5 13.5" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
                    </svg>
                    <span className={searchQuery ? undefined : 'is-placeholder'}>
                      {searchQuery || t('searchPlaceholder')}
                    </span>
                    {searchOpen ? <i className="kf-search-caret" /> : null}
                  </div>
                  {searchOpen && searchQuery.trim().length === 1 ? (
                    <p className="kf-search-hint">{t('searchHint')}</p>
                  ) : null}
                  {!searching ? (
                    <div className="kf-side-row">
                      <span className="kf-thumb" style={{ background: thumbTone(suggestion) }} />
                      <span className="kf-side-copy">
                        <strong>{suggestion}</strong>
                      </span>
                      <span className="kf-add-btn">{t('addProduct')}</span>
                    </div>
                  ) : null}
                </section>

                <div className="kf-sheet-body">
                  <div className="kf-included-head">
                    <h4>{t('includedTitle')}</h4>
                    <span>{t('includedCount', { count: itemCount })}</span>
                  </div>
                  <ul className="kf-items">
                    {rows.map((row) => (
                      <li className="kf-item" key={row.name}>
                        <span className="kf-thumb" style={{ background: thumbTone(row.name) }} />
                        <span className="kf-item-copy">
                          <strong>{row.name}</strong>
                          <em>{row.note}</em>
                        </span>
                        <span className="kf-rail">
                          <span className="kf-qty">
                            <span>
                              <Chevron dir="left" />
                            </span>
                            <b>{row.qty}</b>
                            {row.isTarget ? (
                              <span className={pressing('qty') ? 'is-pressed' : undefined} ref={qtyRef}>
                                <Chevron dir="right" />
                              </span>
                            ) : (
                              <span>
                                <Chevron dir="right" />
                              </span>
                            )}
                          </span>
                          <b className="kf-line-total">{money(row.lineTotal)}</b>
                          <span className="kf-remove">
                            <svg aria-hidden fill="none" height="14" viewBox="0 0 16 16" width="14">
                              <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
                            </svg>
                          </span>
                        </span>
                      </li>
                    ))}
                    {addedItem ? (
                      <li className="kf-item kf-item--new" key={addedItem}>
                        <span className="kf-thumb" style={{ background: thumbTone(addedItem) }} />
                        <span className="kf-item-copy">
                          <i>{t('addedLabel')}</i>
                          <strong>{addedItem}</strong>
                        </span>
                        <span className="kf-rail">
                          <span className="kf-qty">
                            <span>
                              <Chevron dir="left" />
                            </span>
                            <b>1</b>
                            <span>
                              <Chevron dir="right" />
                            </span>
                          </span>
                          <b className="kf-line-total">{money(ADDED_UNIT_PRICE)}</b>
                          <span className="kf-remove">
                            <svg aria-hidden fill="none" height="14" viewBox="0 0 16 16" width="14">
                              <path d="M4 4 12 12M12 4 4 12" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
                            </svg>
                          </span>
                        </span>
                      </li>
                    ) : null}
                  </ul>

                  {searching ? (
                    <div className="kf-results">
                      {(searchQuery.length > 1 ? searchResults : catalogNames.slice(0, 3)).map((name) => {
                        const activeResult = searchHighlight && name === highlighted;

                        return (
                          <div className={`kf-side-row${activeResult ? ' is-active' : ''}`} key={name}>
                            <span className="kf-thumb" style={{ background: thumbTone(name) }} />
                            <span className="kf-side-copy">
                              <strong>{name}</strong>
                            </span>
                            <span
                              className={`kf-add-btn${activeResult && pressing('search') ? ' is-pressed' : ''}`}
                              ref={activeResult ? searchResultRef : undefined}
                            >
                              {t('addProduct')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}
                </div>

                <footer className="kf-checkout">
                  <div className="kf-total-row">
                    <span>{t('kitQuantity')}</span>
                    <span className="kf-qty">
                      <span>
                        <Chevron dir="left" />
                      </span>
                      <b>1</b>
                      <span>
                        <Chevron dir="right" />
                      </span>
                    </span>
                  </div>
                  <div className="kf-total-row">
                    <span>{t('runningTotal')}</span>
                    <strong>{money(kitTotal)}</strong>
                  </div>
                  <div className="kf-actions">
                    <button
                      className={`kf-cart${pressing('cart') ? ' is-pressed' : ''}`}
                      ref={cartRef}
                      type="button"
                    >
                      {t('addKitToCart')}
                    </button>
                    <button
                      className={`kf-save${pressing('save') ? ' is-pressed' : ''}`}
                      ref={saveRef}
                      type="button"
                    >
                      {t('saveForLater')}
                    </button>
                  </div>
                </footer>
              </div>
            </div>
          </div>

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
