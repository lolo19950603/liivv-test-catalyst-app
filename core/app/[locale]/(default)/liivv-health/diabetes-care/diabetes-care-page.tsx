'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type TransitionEvent } from 'react';

import { HeroLoopVideo, RotatingHeroWord } from '~/components/health-hero';
import { OliviaHelpBand } from '~/components/olivia/olivia-help-band';
import { GuestCategoryQuiz } from '~/components/onboarding/guest-category-quiz';
import { KitFlowDemo } from '~/components/kit-flow-demo/kit-flow-demo';
import { SpecializedSubscribe } from '~/components/specialized-subscribe/specialized-subscribe';

import { CHAPTERS as CHAPTER_PAGES, SHOP_DIABETES_HREF, chapterHref } from './chapters/chapters-data';
import { DAY_ONE_STARTER_KIT_ID } from './dc-ids';
import type { DcCatalog, DcCatalogItem } from './get-dc-catalog';

import './diabetes-care.css';

/*
 * Diabetes Care landing — Steady Balance / Everyday Rhythm
 * Distinct from Women's Health and Ostomy Care (no WH float chips; blush/cream vs ostomy mist).
 */

const SHOP_HREF = SHOP_DIABETES_HREF;
const PHARMACIST_HREF = '/account/virtual-care';
const IMG = '/archive/diabetes-care';
const HERO_WORDS = ['pace with you', 'you steady', 'in balance', 'your rhythm', 'up with you'] as const;

const TRUST_ITEMS = [
  'Ontario pharmacist chat',
  'Discreet delivery',
  'Subscribe & save restocks',
  'Living, not managing',
] as const;

const SUBSCRIBE_FEATURES = [
  {
    title: 'Never hunt for strips',
    body: 'Test strips, lancets, and overlays restock on your schedule — not in a last-minute rush.',
  },
  {
    title: 'Match your wear time',
    body: 'Weekly, monthly, or every 14 / 30 days. Start today or pick a date ahead.',
  },
  {
    title: 'Pause without guilt',
    body: 'Skip a delivery, change frequency, or cancel in Account. No phone calls.',
  },
] as const;

const STATS = [
  { value: '10k+', label: 'people in the Liivv community, growing every day' },
  { value: '24/7', label: 'Olivia for shopping and account help — anytime' },
  { value: '19+', label: 'everyday concerns Ontario pharmacists can help with in chat' },
  { value: '1', label: 'calm place for supplies, routines, and everyday living' },
] as const;

const PATH_LINKS = [
  {
    num: '01',
    title: 'Diabetes Essentials',
    body: 'Meters, strips, sensors — subscribe so the restock staples show up before you scramble.',
    href: SHOP_HREF,
  },
  {
    num: '02',
    title: 'Every Day Living',
    body: 'Food, movement, and rhythm for the hours between appointments.',
    href: chapterHref('every-day-living'),
  },
  {
    num: '03',
    title: 'New to the Journey',
    body: 'Clear basics and kind guides when you are still learning the ropes.',
    href: chapterHref('new-to-the-journey'),
  },
  {
    num: '04',
    title: 'Your Diabetes Journey',
    body: 'Type 1, Type 2, Gestational, and Prediabetes — pick the path that fits.',
    href: chapterHref('your-diabetes-journey'),
  },
] as const;

const JOURNEY = [
  {
    step: '01',
    title: 'Diabetes Essentials',
    blurb: 'Meters, sensors, and everyday staples — restocked discreetly.',
    href: SHOP_HREF,
    image: `${IMG}/chapter-essentials.png`,
  },
  ...CHAPTER_PAGES.map((chapter, index) => ({
    step: String(index + 2).padStart(2, '0'),
    title: chapter.title,
    blurb: chapter.vibe,
    href: chapterHref(chapter.slug),
    image: chapter.heroImage,
  })),
];

const SHOP_ROOMS = [
  { id: 'all', label: 'All' },
  { id: 'kits', label: 'CarePacks & kits' },
  { id: 'meters', label: 'Meters & strips' },
  { id: 'cgm', label: 'CGM & sensors' },
  { id: 'injection', label: 'Injection & pump' },
  { id: 'accessories', label: 'Accessories' },
] as const;

type ShopRoomId = (typeof SHOP_ROOMS)[number]['id'];

const BRAND_LOGOS = [
  { src: '/archive/diabetes-care-logos/dexcom.avif', alt: 'Dexcom' },
  { src: '/archive/diabetes-care-logos/brand-2.webp', alt: 'Partner brand' },
  { src: '/archive/diabetes-care-logos/brand-3.webp', alt: 'Partner brand' },
  { src: '/archive/diabetes-care-logos/brand-4.avif', alt: 'Partner brand' },
  { src: '/archive/diabetes-care-logos/brand-5.avif', alt: 'Partner brand' },
] as const;

const BRAND_POINTS = ['CGM & meters', 'Site care', 'Restock staples', 'Discreet delivery'];

const KIT_FLOW_SEARCH_FALLBACKS = [
  'Test strips',
  'CGM overlays',
  'Lancets',
  'Pen needles',
  'Alcohol wipes',
] as const;

const KIT_FLOW_TRAY = [
  { name: 'FreeStyle Lite Meter', note: 'Day-one staple', qty: 1, isQtyTarget: true },
  { name: 'Freestyle Lite Test Strips', note: 'Restock rhythm', qty: 2 },
  { name: 'Freestyle Lancets', note: 'Site care', qty: 1 },
] as const;

const VOICES = [
  {
    lead: true,
    name: 'Jordan',
    meta: 'Toronto · Type 2 · busy parent',
    quote:
      'I finally asked a pharmacist a question I had been sitting on for months. Kind answer on my lunch break — no waiting room, no judgment.',
    image: `${IMG}/voice-1.png`,
  },
  {
    name: 'Alex',
    meta: 'Ottawa · Type 1 · CGM user',
    quote: 'My essentials show up like clockwork. I genuinely forgot what running-out-of-strips panic feels like.',
    image: `${IMG}/voice-2.png`,
  },
  {
    name: 'Sam',
    meta: 'Hamilton · new to the journey',
    quote: 'Newly diagnosed and overwhelmed — this page made the basics feel doable instead of like a textbook.',
    image: `${IMG}/voice-3.png`,
  },
  {
    name: 'Riley',
    meta: 'Mississauga · Liivv Diabetes regular',
    quote: 'Everyday living tips and restock in one place. I stopped bouncing between three different shops.',
    image: `${IMG}/voice-4.png`,
  },
] as const;

function roomForProduct(product: DcCatalogItem): Exclude<ShopRoomId, 'all' | 'kits'> {
  const n = product.name.toLowerCase();

  if (/dexcom|libre|freestyle|cgm|sensor|overlay|patch/.test(n)) {
    return 'cgm';
  }

  if (/meter|strip|lancet|onetouch|verio|contour|accu-chek|glucometer/.test(n)) {
    return 'meters';
  }

  if (
    /syringe|needle|pen|insulin|pump|infusion|kwikpen|solostar|humalog|novolin|toujeo|inject/.test(n)
  ) {
    return 'injection';
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
  kits: DcCatalogItem[];
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

  const renderFeature = (kit: DcCatalogItem, offset: number) => {
    const isFeatured = kit.entityId === DAY_ONE_STARTER_KIT_ID;
    const isCenter = offset === shift;
    const body = (
      <>
        <div className="dc-pack-feature-media">
          {kit.image ? (
            <img alt={isCenter ? kit.image.alt : ''} src={kit.image.src} />
          ) : (
            <div aria-hidden className="dc-shelf-fallback" />
          )}
        </div>
        <div className="dc-pack-feature-copy">
          <span className="dc-pack-badge">{isFeatured ? 'Featured kit' : 'Customizable kit'}</span>
          <h3>{kit.name}</h3>
          {hasDisplayPrice(kit.priceLabel) ? (
            <p className="dc-pack-price">{kit.priceLabel}</p>
          ) : (
            <p className="dc-pack-price dc-pack-price--spacer">&nbsp;</p>
          )}
          <p>
            {isFeatured
              ? 'A calm Day-One edit — open it to tune quantities, add what was missing, and save your version.'
              : 'Open it to tune quantities, add what was missing, and save your version.'}
          </p>
          {isCenter && shift === 0 ? (
            <a className="dc-btn dc-btn-solid" href={kit.path}>
              Customize this kit
            </a>
          ) : (
            <span className="dc-btn dc-btn-solid dc-pack-feature-cta-ghost">Customize this kit</span>
          )}
        </div>
      </>
    );

    if (isCenter && shift === 0) {
      return (
        <article
          aria-current="true"
          className="dc-pack-feature dc-kits-carousel-slide is-center"
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
        className={`dc-pack-feature dc-kits-carousel-slide${isCenter ? ' is-center' : ' is-side'}${
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
    <div className="dc-kits-carousel">
      <p className="dc-kits-carousel-count">
        {active + 1} / {count} kits
      </p>

      <div className="dc-kits-carousel-frame">
        {count > 1 ? (
          <button
            aria-label="Previous kit"
            className="dc-kits-carousel-btn is-prev"
            onClick={() => go(-1)}
            type="button"
          >
            ←
          </button>
        ) : null}

        <div
          aria-label="Diabetes kits carousel"
          aria-roledescription="carousel"
          className="dc-kits-carousel-viewport"
          ref={viewportRef}
        >
          <div
            className={`dc-kits-carousel-track${instant ? ' is-instant' : ''}`}
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
            className="dc-kits-carousel-btn is-next"
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

export function DiabetesCarePage({
  catalog,
  showGuestQuiz = false,
  isSignedIn = false,
}: {
  catalog?: DcCatalog;
  showGuestQuiz?: boolean;
  isSignedIn?: boolean;
}) {
  const [shopRoom, setShopRoom] = useState<ShopRoomId>('all');

  const allKits = catalog?.kits ?? [];
  const featuredKit =
    catalog?.featuredKit ??
    allKits.find((kit) => kit.entityId === DAY_ONE_STARTER_KIT_ID) ??
    allKits[0] ??
    null;
  const shopProducts = catalog?.products ?? [];
  const hasKits = allKits.length > 0;
  const hasShop = shopProducts.length > 0 || allKits.length > 0;

  const filteredShop = useMemo(() => {
    if (shopRoom === 'kits') return allKits.slice(0, 12);
    if (shopRoom === 'all') return shopProducts.slice(0, 12);
    return shopProducts.filter((product) => roomForProduct(product) === shopRoom).slice(0, 12);
  }, [allKits, shopProducts, shopRoom]);

  const kitSearchPool = useMemo(
    () => shopProducts.map((product) => product.name),
    [shopProducts],
  );

  return (
    <div id="diabetes-care">
      <section aria-label="Diabetes Care hero" className="dc-hero">
        <div className="dc-hero-stage">
          <div aria-hidden className="dc-hero-glow">
            <span />
            <span />
          </div>

          <div className="dc-hero-copy">
            <span className="dc-hero-kicker">
              <i />
              Diabetes Care
            </span>
            <h1>
              Care that keeps <RotatingHeroWord className="dc-hero-word" words={HERO_WORDS} />
            </h1>
            <p>
              Supplies, routines, and everyday living support — so diabetes care fits your life, not the other
              way around.
            </p>
            <div className="dc-hero-actions">
              <a className="dc-hero-cta" href="#where-are-you">
                Find your pace
              </a>
              <a className="dc-hero-cta-ghost" href="#build-your-kit">
                {hasKits ? 'Browse CarePacks' : 'See how kits work'}
              </a>
            </div>
          </div>

          <div aria-hidden className="dc-hero-media">
            <HeroLoopVideo
              className="dc-hero-video"
              poster={`${IMG}/hero.png`}
              src={`${IMG}/diabetes-care.mp4`}
            />
            <div className="dc-hero-veil" />
          </div>
        </div>
      </section>

      <section aria-label="Why Liivv Diabetes Care" className="dc-trust">
        <div className="dc-trust-track">
          {TRUST_ITEMS.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      {showGuestQuiz ? (
        <GuestCategoryQuiz
          categoryId="diabetes_care_everyday"
          className="rounded-top"
          isSignedIn={isSignedIn}
        />
      ) : null}

      <section aria-label="Liivv Diabetes community notes" className="dc-stats rounded-top">
        <div className="dc-wrap">
          <div className="dc-stats-grid">
            {STATS.map((stat) => (
              <article className="dc-stat" key={stat.value}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Ways into Diabetes Care" className="dc-path rounded-top" id="doors">
        <div className="dc-wrap">
          <header className="dc-path-head">
            <span className="dc-eyebrow">The Liivv Diabetes edit</span>
            <h2>Four ways to stay in balance</h2>
          </header>
          <div className="dc-path-list">
            {PATH_LINKS.map((item) => (
              <a className="dc-path-item" href={item.href} key={item.num}>
                <span className="dc-path-num">{item.num}</span>
                <div className="dc-path-copy">
                  <h3>{item.title}</h3>
                  <p>{item.body}</p>
                </div>
                <span className="dc-path-go">Continue →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Diabetes CarePacks" className="dc-packs rounded-top" id="build-your-kit">
        <div className="dc-wrap">
          <header className="dc-packs-head">
            <span className="dc-eyebrow">Also in the edit: CarePacks</span>
            <h2>Essentials, organized for real life.</h2>
            <p>
              CarePacks gather the daily pieces you already rely on — so mornings start with one small rip
              instead of a shelf of bottles and open boxes. Customize quantities, add what was missing, then
              save your version — or subscribe so it keeps arriving.
            </p>
          </header>

          <KitFlowDemo
            badge="Featured CarePack"
            description="A calm Day-One edit — customize quantities, add what was missing, then save or checkout."
            fallbackImageSrc={`${IMG}/kit-products/kit-diabetes-day-one.png`}
            kitHref={featuredKit?.path ?? SHOP_HREF}
            kitImage={featuredKit?.image}
            kitName={featuredKit?.name ?? 'Just Diagnosed: Diabetes Day-One Starter'}
            searchFallbacks={KIT_FLOW_SEARCH_FALLBACKS}
            searchPool={kitSearchPool}
            trayLines={[...KIT_FLOW_TRAY]}
          />

            <KitsCarousel initialId={featuredKit?.entityId} kits={allKits} />
        </div>
      </section>

      {hasShop ? (
        <section aria-label="Shop Diabetes Care" className="dc-shop rounded-top" id="shop-diabetes-care">
          <div className="dc-wrap">
            <div className="dc-shop-head">
              <div>
                <span className="dc-eyebrow">The shelf</span>
                <h2>Diabetes Essentials</h2>
                <p>Live catalog, sorted into quiet rooms so restocking does not feel loud.</p>
              </div>
              <a className="dc-btn dc-btn-solid" href={SHOP_HREF}>
                Open full shop
              </a>
            </div>

            <div aria-label="Shop filters" className="dc-filters" role="tablist">
              {SHOP_ROOMS.filter((room) => room.id !== 'kits' || hasKits).map((room) => (
                <button
                  aria-selected={shopRoom === room.id}
                  className={`dc-filter${shopRoom === room.id ? ' is-active' : ''}`}
                  key={room.id}
                  onClick={() => setShopRoom(room.id)}
                  role="tab"
                  type="button"
                >
                  {room.label}
                </button>
              ))}
            </div>

            <div className="dc-product-grid">
              {filteredShop.map((product) => (
                <a className="dc-product" href={product.path} key={product.entityId}>
                  <div className="dc-product-media">
                    {product.image ? (
                      <img alt={product.image.alt} src={product.image.src} />
                    ) : (
                      <div aria-hidden className="dc-shelf-fallback" />
                    )}
                  </div>
                  <div className="dc-product-meta">
                    {product.isKit ? <span className="dc-product-badge">Customizable kit</span> : null}
                    <h3>{product.name}</h3>
                    {hasDisplayPrice(product.priceLabel) ? (
                      <p className="dc-product-price">{product.priceLabel}</p>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>

            {filteredShop.length === 0 ? (
              <p className="dc-shop-empty">Nothing in this room yet — try All or another filter.</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <SpecializedSubscribe
        className="dc-subs rounded-top"
        demoProductBlurb="Strips, sensors, and staples — restocked on your testing rhythm."
        demoProductName="Diabetes Essentials"
        demoProductPath="liivv.ca/product/diabetes-essentials"
        features={SUBSCRIBE_FEATURES}
        lead="The staples you already use can show up before you run out. Subscribe on the product page, pick a frequency that matches your testing or sensor cycle, then pause or skip when life shifts."
        primaryCtaClass="dc-btn dc-btn-solid"
        secondaryCtaClass="dc-btn dc-btn-ghost"
        shopHref={SHOP_HREF}
        shopLabel="Shop to subscribe"
        title="Strips and sensors, on a rhythm — not a scramble"
        wrapClassName="dc-wrap"
      />

      <section aria-label="Journey chapters" className="dc-journey rounded-top" id="where-are-you">
        <div className="dc-wrap">
          <header className="dc-journey-head">
            <span className="dc-eyebrow">Your pace</span>
            <h2>Four soft ways in.</h2>
            <p>Open a chapter — or skip to the shelf when you already know what you need.</p>
          </header>
          <div className="dc-journey-rail">
            {JOURNEY.map((item) => (
              <a className="dc-journey-card" href={item.href} key={item.step}>
                <div className="dc-journey-thumb">
                  <img alt="" src={item.image} />
                </div>
                <div className="dc-journey-body">
                  <span className="dc-journey-step">Step {item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.blurb}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Pharmacist care" className="dc-care rounded-top" id="care">
        <div className="dc-wrap">
          <div className="dc-care-panel">
            <div className="dc-care-visual">
              <img alt="" src={`${IMG}/care-chat-main.png`} />
            </div>
            <div className="dc-care-copy">
              <span className="dc-eyebrow">Available in Ontario</span>
              <h2>Questions that do not need a waiting room.</h2>
              <p>
                Everyday concerns in chat during business hours until 5 p.m. Eastern. Outside those hours,
                Olivia can help with shopping and your account — she does not give medical advice.
              </p>
              <a className="dc-btn dc-btn-soft" href={PHARMACIST_HREF}>
                Talk to a Pharmacist
              </a>
            </div>
          </div>
          <div className="dc-olivia-band">
            <OliviaHelpBand
              body="Olivia can find supplies, check an order, or walk you through your account — anytime. She does not give medical advice."
              title="Shopping questions? Wave at Olivia."
            />
          </div>
        </div>
      </section>

      <section aria-label="Preferred brands" className="dc-brands rounded-top" id="brands">
        <div className="dc-wrap">
          <div className="dc-brands-inner">
            <span className="dc-eyebrow">Shop context</span>
            <h2>Names you already know.</h2>
            <p>
              Listed so familiar meters, sensors, and supplies are easy to find — not a clinical endorsement.
              Your care team remains the guide for therapy.
            </p>
            <div className="dc-brand-row">
              {BRAND_LOGOS.map((brand) => (
                <img alt={brand.alt} className="dc-brand-logo" key={brand.src} src={brand.src} />
              ))}
            </div>
            <ul className="dc-brand-points">
              {BRAND_POINTS.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-label="Community voices" className="dc-voices rounded-top" id="voices">
        <div className="dc-wrap">
          <header className="dc-voices-head">
            <span className="dc-eyebrow">What people are saying</span>
            <h2>Notes from everyday living.</h2>
          </header>
          <div className="dc-voice-stack">
            {VOICES.map((voice) => (
              <article className={`dc-voice${voice.lead ? ' is-lead' : ''}`} key={voice.name}>
                <img alt="" className="dc-voice-avatar" src={voice.image} />
                <div>
                  <blockquote>&ldquo;{voice.quote}&rdquo;</blockquote>
                  <div className="dc-voice-who">
                    <strong>{voice.name}</strong>
                    {voice.meta}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Frequently asked questions" className="dc-faq rounded-top">
        <div className="dc-wrap">
          <div className="dc-faq-panel">
            <h2>Good questions. Honest answers.</h2>
            <p>Practical notes — not medical advice.</p>
            <details open>
              <summary>Is this only for one type of diabetes?</summary>
              <p>
                Not at all. Liivv Diabetes covers Essentials, Every Day Living, New to the Journey, and Your
                Diabetes Journey — with paths for Type 1, Type 2, Gestational, and Prediabetes. You pick what
                fits; we follow your lead.
              </p>
            </details>
            <details>
              <summary>What is the difference between Essentials and Every Day Living?</summary>
              <p>
                Essentials is supplies and restock — meters, strips, sensors, and the staples you should not
                scramble for. Every Day Living is food, movement, and lifestyle rhythm for the hours between
                appointments.
              </p>
            </details>
            <details>
              <summary>I am newly diagnosed — where should I start?</summary>
              <p>
                Start with{' '}
                <a href={chapterHref('new-to-the-journey')}>New to the Journey</a> for calm basics, then browse{' '}
                <a href={SHOP_HREF}>Diabetes Essentials</a> when you are ready to stock up. Your Diabetes
                Journey can help if you already know your path.
              </p>
            </details>
            <details>
              <summary>How private is my order?</summary>
              <p>
                Very. Everything arrives in plain, discreet packaging, and your conversations with our team stay
                between you and us.
              </p>
            </details>
            <details>
              <summary>What can I actually chat with a pharmacist about?</summary>
              <p>
                Everyday product questions in Ontario during business hours (until 5 p.m. Eastern). Olivia helps
                with shopping anytime — she does not give medical advice.
              </p>
            </details>
            <details>
              <summary>What is a CarePack?</summary>
              <p>
                Daily pieces organized so mornings start with one small rip instead of a shelf of bottles.
                Customize once, then subscribe so it keeps arriving.
              </p>
            </details>
            <details>
              <summary>How do subscriptions work?</summary>
              <p>
                On a product page, choose Subscribe &amp; save, pick a frequency that matches your strips or
                sensors, then check out like any order. Pause, skip, or cancel under Account → Subscriptions —
                no phone calls, no guilt trips.
              </p>
            </details>
            <details>
              <summary>Can I change or pause my routine anytime?</summary>
              <p>Always. Swap products, skip a month, or pause entirely — no phone calls, no guilt trips.</p>
            </details>
          </div>
        </div>
      </section>

      <section aria-label="Closing" className="dc-close rounded-top" id="manifesto">
        <div aria-hidden className="dc-close-bg">
          <img alt="" decoding="async" src={`${IMG}/closing.png`} />
        </div>
        <div className="dc-close-inner">
          <span className="dc-eyebrow">Your next step</span>
          <h2>starts steady</h2>
          <p>
            Whatever path you are on, there is a version of care that fits your everyday. Let us find it
            together.
          </p>
          <div className="dc-close-cta">
            <a className="dc-btn dc-btn-soft" href={SHOP_HREF}>
              Shop Diabetes Care
            </a>
            <a
              className="dc-btn dc-btn-ghost"
              href="#subscriptions"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Subscribe &amp; save
            </a>
            <a
              className="dc-btn dc-btn-ghost"
              href="#where-are-you"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              Find your pace
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
