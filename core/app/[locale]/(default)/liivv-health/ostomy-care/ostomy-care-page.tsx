'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';

import { HeroLoopVideo, RotatingHeroWord } from '~/components/health-hero';
import { OliviaHelpBand } from '~/components/olivia/olivia-help-band';
import { GuestCategoryQuiz } from '~/components/onboarding/guest-category-quiz';
import { KitFlowDemo } from '~/components/kit-flow-demo/kit-flow-demo';
import { SpecializedSubscribe } from '~/components/specialized-subscribe/specialized-subscribe';

import { CHAPTERS as CHAPTER_PAGES, SHOP_OSTOMY_HREF, chapterHref } from './chapters/chapters-data';
import type { OcCatalog, OcCatalogItem } from './get-oc-catalog';
import { NEW_JOURNEY_STARTER_KIT_ID } from './oc-ids';

import './ostomy-care.css';

/*
 * Ostomy Care landing — Quiet Shelf / Everyday Ritual
 * Distinct from Women's Health (no doors / float chips) — kits carousel matches WH.
 */

const SHOP_HREF = SHOP_OSTOMY_HREF;
const PHARMACIST_HREF = '/account/virtual-care';
const IMG = '/archive/ostomy-care';
const HERO_WORDS = ['discreet', 'private', 'quiet', 'personal', 'kind'] as const;

const TRUST_ITEMS = [
  'Ontario pharmacist chat',
  'Discreet delivery',
  'Subscribe & save restocks',
  'Kind, private, yours',
] as const;

const SUBSCRIBE_FEATURES = [
  {
    title: 'Your usuals, on your wear time',
    body: 'Pouches, barriers, rings, and skin care — restocked before the last box is empty.',
  },
  {
    title: 'Skip when you have extras',
    body: 'Travel stash or a slower week? Skip a cycle with no charge and nothing ships.',
  },
  {
    title: 'Plain packaging. Quiet checkout.',
    body: 'Same discreet delivery as a one-time order. Pause, skip, or cancel in Account.',
  },
] as const;

const PATH_LINKS = [
  {
    num: '01',
    title: 'Curated kits',
    body: 'Starter kits you can tune — then save for the next quiet restock.',
    href: '#build-your-kit',
  },
  {
    num: '02',
    title: 'The shelf',
    body: 'Pouches, barriers, and accessories — subscribe so restock stays quiet, not a scramble.',
    href: '#shop-ostomy-care',
  },
  {
    num: '03',
    title: 'The chapters',
    body: 'New to the journey, stoma basics, or the help that exists in Canada — open the story that fits today.',
    href: '#where-are-you',
  },
  {
    num: '04',
    title: 'A kind answer',
    body: 'Ontario pharmacist chat for everyday product questions during business hours.',
    href: '#care',
  },
] as const;

const LIFE_CHAPTERS = CHAPTER_PAGES.map((chapter) => ({
  num: chapter.num,
  word: chapter.chapterWord,
  title: chapter.title,
  blurb: chapter.vibe,
  href: chapterHref(chapter.slug),
  image: chapter.heroImage,
}));

const SHOP_ROOMS = [
  { id: 'all', label: 'All' },
  { id: 'kits', label: 'Curated kits' },
  { id: 'onePiece', label: 'One-piece' },
  { id: 'twoPiece', label: 'Two-piece' },
  { id: 'barriers', label: 'Barriers' },
  { id: 'accessories', label: 'Accessories' },
] as const;

type ShopRoomId = (typeof SHOP_ROOMS)[number]['id'];

const PREFERRED_BRANDS = ['Coloplast', 'Hollister', 'Convatec'] as const;
const BRAND_POINTS = ['Pouches & barriers', 'Skin comfort', 'Belts, rings & paste', 'Discreet restock'];

const KIT_FLOW_SEARCH_FALLBACKS = [
  'Barrier rings',
  'Adhesive remover wipes',
  'Skin barrier powder',
  'Ostomy belt',
  'Lubricating deodorant',
] as const;

const KIT_FLOW_TRAY = [
  { name: 'Drainable pouch', note: 'Daily staple', qty: 2, isQtyTarget: true },
  { name: 'Skin barrier wafer', note: 'Secure seal', qty: 1 },
  { name: 'Stoma powder', note: 'Skin comfort', qty: 1 },
] as const;

const VOICES = [
  {
    lead: true,
    name: 'Morgan',
    meta: 'Toronto · colostomy · busy parent',
    quote:
      'I finally asked about convex vs flat without feeling silly. Kind answer on my lunch break — no waiting room.',
    image: `${IMG}/voice-1.png`,
  },
  {
    name: 'Casey',
    meta: 'Ottawa · ileostomy · restocker',
    quote: 'My usuals show up like clockwork. Running-out panic feels like someone else’s story now.',
    image: `${IMG}/voice-2.png`,
  },
  {
    name: 'Jordan',
    meta: 'Hamilton · new to the journey',
    quote: 'The go-bag idea changed travel for me. Extra pouch, wipes, done.',
    image: `${IMG}/voice-3.png`,
  },
  {
    name: 'Avery',
    meta: 'Mississauga · Liivv Ostomy regular',
    quote: 'Skin was angry until the seal was right. Powder, ring, pharmacist chat — then quieter days.',
    image: `${IMG}/voice-4.png`,
  },
] as const;

function roomForProduct(product: OcCatalogItem): Exclude<ShopRoomId, 'all' | 'kits'> {
  const n = product.name.toLowerCase();

  if (/1-piece|one-piece|1 piece|premier one-piece|pouchkins newborn|pouchkins drainable pediatric one|activelife/.test(n)) {
    return 'onePiece';
  }

  if (/2-piece|two-piece|2 piece|new image two|sensura mio click|sensura click|natura 2|sur-fit/.test(n)) {
    return 'twoPiece';
  }

  if (
    /barrier|flange|wafer|ring|paste|powder|flextend|flexwear|ceraplus|stomahesive|eakin/.test(n) &&
    !/pouch/.test(n)
  ) {
    return 'barriers';
  }

  if (/belt|clamp|deodorant|odor|adapter|wipe|remover|sheet|lubricat|sponge/.test(n)) {
    return 'accessories';
  }

  if (/pouch/.test(n)) {
    return /1-piece|one-piece|premier one|assura 1|sensura 1|sensura light 1|activelife|pouchkins/.test(n)
      ? 'onePiece'
      : 'twoPiece';
  }

  return 'accessories';
}

function hasDisplayPrice(priceLabel?: string) {
  return Boolean(priceLabel && !/(\$|CA\$)?\s*0([.,]0+)?\b/i.test(priceLabel));
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
        <div className="oc-pack-feature-media">
          {kit.image ? (
            <img alt={isCenter ? kit.image.alt : ''} src={kit.image.src} />
          ) : (
            <div aria-hidden className="oc-shelf-fallback" />
          )}
        </div>
        <div className="oc-pack-feature-copy">
          <span className="oc-pack-badge">{isFeatured ? 'Featured kit' : 'Customizable kit'}</span>
          <h3>{kit.name}</h3>
          {hasDisplayPrice(kit.priceLabel) ? (
            <p className="oc-pack-price">{kit.priceLabel}</p>
          ) : (
            <p className="oc-pack-price oc-pack-price--spacer">&nbsp;</p>
          )}
          <p>
            {isFeatured
              ? 'A calm Fresh Start edit — open it to tune quantities, add what was missing, and save your version.'
              : 'Open it to tune quantities, add what was missing, and save your version.'}
          </p>
          {isCenter && shift === 0 ? (
            <a className="oc-btn oc-btn-solid" href={kit.path}>
              Customize this kit
            </a>
          ) : (
            <span className="oc-btn oc-btn-solid oc-pack-feature-cta-ghost">Customize this kit</span>
          )}
        </div>
      </>
    );

    if (isCenter && shift === 0) {
      return (
        <article
          aria-current="true"
          className="oc-pack-feature oc-kits-carousel-slide is-center"
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
        className={`oc-pack-feature oc-kits-carousel-slide${isCenter ? ' is-center' : ' is-side'}${
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
    <div className="oc-kits-carousel">
      <p className="oc-kits-carousel-count">
        {active + 1} / {count} kits
      </p>

      <div className="oc-kits-carousel-frame">
        {count > 1 ? (
          <button
            aria-label="Previous kit"
            className="oc-kits-carousel-btn is-prev"
            onClick={() => go(-1)}
            type="button"
          >
            ←
          </button>
        ) : null}

        <div
          aria-label="Ostomy Care kits carousel"
          aria-roledescription="carousel"
          className="oc-kits-carousel-viewport"
          ref={viewportRef}
        >
          <div
            className={`oc-kits-carousel-track${instant ? ' is-instant' : ''}`}
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
            className="oc-kits-carousel-btn is-next"
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

export function OstomyCarePage({
  catalog,
  showGuestQuiz = false,
  isSignedIn = false,
}: {
  catalog?: OcCatalog;
  showGuestQuiz?: boolean;
  isSignedIn?: boolean;
}) {
  const [shopRoom, setShopRoom] = useState<ShopRoomId>('all');

  const allKits = catalog?.kits ?? [];
  const featuredKit =
    catalog?.featuredKit ??
    allKits.find((kit) => kit.entityId === NEW_JOURNEY_STARTER_KIT_ID) ??
    allKits[0] ??
    null;
  const shopProducts = catalog?.products ?? [];
  const hasKits = allKits.length > 0;
  const hasShop = shopProducts.length > 0 || allKits.length > 0;

  const filteredShop = useMemo(() => {
    if (shopRoom === 'kits') return allKits.slice(0, 12);
    if (shopRoom === 'all') return shopProducts.slice(0, 12);
    return shopProducts.filter((p) => roomForProduct(p) === shopRoom).slice(0, 12);
  }, [allKits, shopProducts, shopRoom]);

  const kitSearchPool = useMemo(
    () => shopProducts.map((product) => product.name),
    [shopProducts],
  );

  return (
    <div id="ostomy-care">
      <section aria-label="Ostomy Care hero" className="oc-hero">
        <div className="oc-hero-stage">
          <div aria-hidden className="oc-hero-glow">
            <span />
            <span />
          </div>

          <div className="oc-hero-copy">
            <span className="oc-hero-kicker">
              <i />
              Ostomy Care
            </span>
            <h1>
              Care that stays <RotatingHeroWord className="oc-hero-word" words={HERO_WORDS} />
            </h1>
            <p>
              Supplies, everyday living support, and kind guidance — so your routine feels like yours again.
            </p>
            <div className="oc-hero-actions">
              <a className="oc-hero-cta" href="#where-are-you">
                Find your pace
              </a>
              <a className="oc-hero-cta-ghost" href="#build-your-kit">
                Browse curated kits
              </a>
            </div>
          </div>

          <div aria-hidden className="oc-hero-media">
            <HeroLoopVideo
              className="oc-hero-video"
              poster={`${IMG}/hero.png`}
              src={`${IMG}/ostomy-care.mp4`}
            />
            <div className="oc-hero-veil" />
          </div>
        </div>
      </section>

      <section
        aria-label="Why Liivv Ostomy Care"
        className={`oc-trust${showGuestQuiz ? ' oc-trust--quiz' : ''}`}
      >
        <div className="oc-trust-track">
          {TRUST_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      {showGuestQuiz ? (
        <GuestCategoryQuiz
          categoryId="ostomy_care_everyday"
          className="rounded-top"
          isSignedIn={isSignedIn}
        />
      ) : null}

      <section
        aria-label="Ways into Ostomy Care"
        className={`oc-path${showGuestQuiz ? ' rounded-top' : ''}`}
        id="doors"
      >
        <div className="oc-wrap">
          <header className="oc-path-head">
            <span className="oc-eyebrow">A quiet path in</span>
            <h2>What would help today?</h2>
          </header>
          <div className="oc-path-list">
            {PATH_LINKS.map((item) => (
              <a className="oc-path-item" href={item.href} key={item.num}>
                <span className="oc-path-num">{item.num}</span>
                <div className="oc-path-copy">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <span className="oc-path-go">Continue →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {hasKits ? (
        <section aria-label="Ostomy curated kits" className="oc-packs rounded-top" id="build-your-kit">
          <div className="oc-wrap">
            <header className="oc-packs-head">
              <span className="oc-eyebrow">Curated kits</span>
              <h2>Start curated. Finish as yours.</h2>
              <p>
                Official kits from the Liivv Ostomy edit — open one, tune quantities, add what was missing, and
                save it — or subscribe so the quiet restock keeps arriving.
              </p>
            </header>

            <KitFlowDemo
              description="A calm Fresh Start edit — customize quantities, add what was missing, then save or checkout."
              fallbackImageSrc={`${IMG}/door-shop.png`}
              kitHref={featuredKit?.path}
              kitImage={featuredKit?.image}
              kitName={featuredKit?.name}
              searchFallbacks={KIT_FLOW_SEARCH_FALLBACKS}
              searchPool={kitSearchPool}
              trayLines={[...KIT_FLOW_TRAY]}
            />

            <KitsCarousel initialId={featuredKit?.entityId} kits={allKits} />
          </div>
        </section>
      ) : null}

      {hasShop ? (
        <section aria-label="Ostomy Essentials" className="oc-shop rounded-top" id="shop-ostomy-care">
          <div className="oc-wrap">
            <div className="oc-shop-head">
              <div>
                <span className="oc-eyebrow">The shelf</span>
                <h2>Ostomy Essentials</h2>
                <p>Live catalog, sorted into quiet rooms so restocking does not feel loud.</p>
              </div>
              <a className="oc-btn oc-btn-solid" href={SHOP_HREF}>
                Open full shop
              </a>
            </div>

            <div aria-label="Shop filters" className="oc-filters" role="tablist">
              {SHOP_ROOMS.map((room) => (
                <button
                  aria-selected={shopRoom === room.id}
                  className={`oc-filter${shopRoom === room.id ? ' is-active' : ''}`}
                  key={room.id}
                  onClick={() => setShopRoom(room.id)}
                  role="tab"
                  type="button"
                >
                  {room.label}
                </button>
              ))}
            </div>

            <div className="oc-product-grid">
              {filteredShop.map((product) => (
                <a className="oc-product" href={product.path} key={product.entityId}>
                  <div className="oc-product-media">
                    {product.image ? (
                      <img alt={product.image.alt} src={product.image.src} />
                    ) : (
                      <div aria-hidden className="oc-shelf-fallback" />
                    )}
                  </div>
                  <div className="oc-product-meta">
                    {product.isKit ? <span className="oc-product-badge">Customizable kit</span> : null}
                    <h3>{product.name}</h3>
                    {hasDisplayPrice(product.priceLabel) ? (
                      <p className="oc-product-price">{product.priceLabel}</p>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>

            {filteredShop.length === 0 ? (
              <p className="oc-shop-empty">Nothing in this room yet — try All or another filter.</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <SpecializedSubscribe
        className="oc-subs rounded-top"
        demoProductBlurb="Pouches, barriers, and skin care — restocked before you run out."
        demoProductName="Ostomy Essentials"
        demoProductPath="liivv.ca/product/ostomy-essentials"
        features={SUBSCRIBE_FEATURES}
        lead="Ostomy supplies are not optional — and running out should not be part of the routine. Subscribe to your usuals so restock stays quiet, discreet, and on time."
        primaryCtaClass="oc-btn oc-btn-solid"
        secondaryCtaClass="oc-btn oc-btn-ghost"
        shopHref={SHOP_HREF}
        shopLabel="Shop to subscribe"
        title="Pouches and barriers that arrive before you need them"
        wrapClassName="oc-wrap"
      />

      <section aria-label="Life chapters" className="oc-chapters rounded-top" id="where-are-you">
        <div className="oc-wrap">
          <header className="oc-chapters-head">
            <span className="oc-eyebrow">Life chapters</span>
            <h2>Three stories. Open the one that fits.</h2>
            <p>
              New to this, learning your stoma, or looking for support and funding — pick the chapter that feels like today.
              Already know the aisle?{' '}
              <a href="#shop-ostomy-care">Skip to the shelf</a>.
            </p>
          </header>
          <div className="oc-chapters-grid">
            {LIFE_CHAPTERS.map((item) => (
              <a className="oc-chapter-card" href={item.href} key={item.num}>
                <div className="oc-chapter-media">
                  <img alt="" src={item.image} />
                  <span className="oc-chapter-word">Chapter {item.word}</span>
                </div>
                <div className="oc-chapter-body">
                  <h3>{item.title}</h3>
                  <p>{item.blurb}</p>
                  <span className="oc-chapter-go">Open chapter →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Pharmacist care" className="oc-care rounded-top" id="care">
        <div className="oc-wrap">
          <div className="oc-care-panel">
            <div className="oc-care-visual">
              <img alt="" src={`${IMG}/care-chat-main.png`} />
            </div>
            <div className="oc-care-copy">
              <span className="oc-eyebrow">Available in Ontario</span>
              <h2>Fit questions that do not need a waiting room.</h2>
              <p>
                Everyday product and restock questions — chat with an Ontario pharmacist during business hours
                until 5 p.m. Eastern. Clinical concerns still belong with your WOC nurse or care team.
              </p>
              <a className="oc-btn oc-btn-soft" href={PHARMACIST_HREF}>
                Talk to a Pharmacist
              </a>
            </div>
          </div>
          <div className="oc-olivia-band">
            <OliviaHelpBand
              body="Need a restock, a product match, or help with an order? Olivia is the little sprout in the corner. She does not give medical advice."
              title="Olivia can fetch the everyday bits."
            />
          </div>
        </div>
      </section>

      <section aria-label="Preferred brands" className="oc-brands rounded-top" id="brands">
        <div className="oc-wrap">
          <div className="oc-brands-inner">
            <span className="oc-eyebrow">Shop context</span>
            <h2>Names you already know.</h2>
            <p>
              Listed so familiar systems are easy to find — not a clinical endorsement. Your WOC nurse remains
              the guide for fit.
            </p>
            <div className="oc-brand-row">
              {PREFERRED_BRANDS.map((brand) => (
                <span className="oc-brand-pill" key={brand}>
                  {brand}
                </span>
              ))}
            </div>
            <ul className="oc-brand-points">
              {BRAND_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-label="Community voices" className="oc-voices rounded-top" id="voices">
        <div className="oc-wrap">
          <header className="oc-voices-head">
            <span className="oc-eyebrow">Beyond the aisle</span>
            <h2>Notes from the shelf.</h2>
          </header>
          <div className="oc-voice-stack">
            {VOICES.map((voice) => (
              <article className={`oc-voice${voice.lead ? ' is-lead' : ''}`} key={voice.name}>
                <img alt="" className="oc-voice-avatar" src={voice.image} />
                <div>
                  <blockquote>&ldquo;{voice.quote}&rdquo;</blockquote>
                  <div className="oc-voice-who">
                    <strong>{voice.name}</strong>
                    {voice.meta}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Frequently asked questions" className="oc-faq rounded-top">
        <div className="oc-wrap">
          <div className="oc-faq-panel">
            <h2>Quiet questions. Honest answers.</h2>
            <p>Practical notes — not medical advice.</p>
            <details open>
              <summary>How often should I empty or change my pouch?</summary>
              <p>
                Empty drainable pouches around one-third to one-half full. Full system changes are often every
                few days — or sooner if you feel burning, itching, or a leak. Your WOC nurse can help you find a
                wear time that fits.
              </p>
            </details>
            <details>
              <summary>Can I customize a kit?</summary>
              <p>
                Yes. Start curated, adjust quantities, add items, and save your version — or subscribe so the
                restock keeps arriving.
              </p>
            </details>
            <details>
              <summary>How do subscriptions work?</summary>
              <p>
                On a product page, choose Subscribe &amp; save, pick a frequency that matches your wear time,
                then check out like any order. Skip a delivery when you still have extras — no charge, nothing
                ships. Manage pause, skip, or cancel under Account → Subscriptions.
              </p>
            </details>
            <details>
              <summary>What belongs in a go-bag?</summary>
              <p>
                Spare barrier and pouch, soft wipes, disposal bags, and any skin protectant or remover you use —
                plus a spare underwear or liner if it helps you feel ready.
              </p>
            </details>
            <details>
              <summary>What can I chat with a pharmacist about?</summary>
              <p>
                Everyday product questions in Ontario during business hours (until 5 p.m. Eastern). Olivia helps
                with shopping anytime — she does not give medical advice.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section aria-label="Closing" className="oc-close rounded-top" id="manifesto">
        <div aria-hidden className="oc-close-bg">
          <img alt="" decoding="async" src={`${IMG}/closing.png`} />
        </div>
        <div className="oc-close-inner">
          <span className="oc-eyebrow">The Liivv promise</span>
          <h2>No awkward aisle. Just everyday Liivving.</h2>
          <p>
            Supplies that show up on time, guidance without overwhelm, and room for the rest of your life — at
            your pace.
          </p>
          <div className="oc-close-cta">
            <a className="oc-btn oc-btn-soft" href={SHOP_HREF}>
              Ostomy Essentials
            </a>
            <a className="oc-btn oc-btn-ghost" href="#subscriptions" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              Subscribe &amp; save
            </a>
            <a className="oc-btn oc-btn-ghost" href="#build-your-kit" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              Browse curated kits
            </a>
            <a className="oc-btn oc-btn-ghost" href="#where-are-you" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              Open a chapter
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
