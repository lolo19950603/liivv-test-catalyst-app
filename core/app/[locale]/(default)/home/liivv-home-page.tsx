'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';

import { HEALTH_TEASER_LINKS, LIIVV_HEALTH_HUB_HREF } from './health-teaser';
import type { HomeCategory, HomeProduct } from './home-types';
import { buildNewestCategoryTabs, productMatchesCategory } from './map-home-catalog';
import { SubscriptionFlowDemo } from './subscription-flow-demo';
import { OliviaFigure } from '~/components/olivia/olivia-figure';
import { openLiveChat } from '~/components/virtual-care/live-chat-widget';

import './liivv-home.css';

/*
 * =============================================================================
 * LIIVV YOUR LIFE — HOME
 * =============================================================================
 * Commerce storefront. Deep feature sections for pharmacy / Olivia / subscriptions.
 * Liivv Health storytelling lives at /liivv-health.
 * =============================================================================
 */

const IMG = '/archive/liivv-home';
const SHOP_ALL_HREF = '/shop-all';
const PHARMACY_RX = '/account/pharmacy?section=prescriptions';
const PHARMACY_REFILL = '/account/pharmacy?section=refill_requests';
const PHARMACY_CAREPAK = '/account/pharmacy?section=carepack';
const SUBSCRIPTIONS = '/account/subscriptions';

const FEELING_WORDS = ['simple', 'yours', 'steady', 'easy', 'real'] as const;

function useScrollReveal(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const root = document.getElementById('liivv-home');
    if (!root) return;

    const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (!nodes.length) return;

    const reveal = (el: Element) => {
      el.classList.add('is-revealed');
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -6% 0px', threshold: 0.08 },
    );

    for (const node of nodes) {
      const rect = node.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.94 && rect.bottom > 0;
      if (inView) {
        reveal(node);
      } else {
        io.observe(node);
      }
    }

    return () => io.disconnect();
  }, [enabled]);
}

const TRUST_ITEMS = [
  'Liivv Health',
  'Care, customized',
  'Discreet delivery',
  'Prescriptions',
  'CarePak',
  'Refills',
  'Ask a pharmacist (soon)',
  'Olivia',
  'Subscriptions',
] as const;

const PHARMACY_STEPS = [
  {
    id: 'rx',
    title: 'Prescriptions',
    body: 'Upload or transfer Rx, keep your list tidy, and track what’s on file.',
    href: PHARMACY_RX,
    cta: 'Open prescriptions',
  },
  {
    id: 'refill',
    title: 'Refills',
    body: 'Request a refill in a few taps — no phone-tree workout.',
    href: PHARMACY_REFILL,
    cta: 'Request a refill',
  },
] as const;

const CAREPAK_STEPS = [
  'Have an eligible tablet prescription on file',
  'Choose meds and complete a short CarePak intake',
  'Our pharmacy team reviews before the first ship',
  'Pouches arrive every 4 weeks, organized by dose time',
] as const;

const OLIVIA_CAPABILITIES = [
  {
    title: 'Shop with her',
    body: 'Find products, check stock and price, add to cart — she won’t complete checkout for you.',
  },
  {
    title: 'Orders & reorders',
    body: 'Recent order status, tracking links, and what you buy most.',
  },
  {
    title: 'Subscriptions in chat',
    body: 'Pause, resume, skip a delivery, change frequency or address, cancel with a clear confirm.',
  },
  {
    title: 'Rx status (ops only)',
    body: 'Operational prescription and refill status — never medical advice.',
  },
  {
    title: 'Account how-tos',
    body: 'Pharmacy, CarePak, addresses, settings — step-by-step when you ask.',
  },
  {
    title: 'Voice when enabled',
    body: 'Talk instead of type when voice is on in Virtual Care chat.',
  },
] as const;

const SUB_FEATURES = [
  'Recurring delivery on your schedule — cancel anytime',
  'Choose frequency (weekly, monthly, every 14 or 30 days, and more)',
  'Start today or pick a future date (up to a year ahead)',
  'Pause, resume, or skip a delivery with no charge that cycle',
  'Manage payment and shipping in Account → Subscriptions',
] as const;

function ProductCard({ product, index = 0 }: { product: HomeProduct; index?: number }) {
  return (
    <a className="lh-product" href={product.path} style={{ '--stagger': index } as CSSProperties}>
      <div className="lh-product-media">
        {product.image ? (
          <img alt={product.image.alt} src={product.image.src} />
        ) : (
          <div aria-hidden className="lh-product-fallback" />
        )}
      </div>
      <div className="lh-product-meta">
        <h3>{product.name}</h3>
        {product.priceLabel ? <p className="lh-product-price">{product.priceLabel}</p> : null}
      </div>
    </a>
  );
}

function ProductRail({
  products,
  label,
  shopHref,
  shopLabel,
}: {
  products: HomeProduct[];
  label: string;
  shopHref: string;
  shopLabel: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  if (products.length === 0) {
    return <p className="lh-rail-empty">Nothing in this category yet — try All or another shelf.</p>;
  }

  const scrollBy = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(360, el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <div className="lh-rail">
      <div className="lh-rail-toolbar">
        <a className="lh-text-link" href={shopHref}>
          {shopLabel}
        </a>
        <div className="lh-rail-nav">
          <button aria-label={`Previous ${label}`} onClick={() => scrollBy(-1)} type="button">
            ←
          </button>
          <button aria-label={`Next ${label}`} onClick={() => scrollBy(1)} type="button">
            →
          </button>
        </div>
      </div>
      <div aria-label={label} className="lh-rail-track" ref={trackRef}>
        {products.map((product, index) => (
          <ProductCard index={index} key={product.entityId} product={product} />
        ))}
      </div>
    </div>
  );
}

function NewestByCategory({
  products,
  categories,
}: {
  products: HomeProduct[];
  categories: HomeCategory[];
}) {
  const tabs = useMemo(
    () => buildNewestCategoryTabs(products, categories),
    [categories, products],
  );

  const [activeId, setActiveId] = useState('all');

  useEffect(() => {
    if (!tabs.some((tab) => tab.id === activeId)) {
      setActiveId('all');
    }
  }, [tabs, activeId]);

  const filtered = useMemo(() => {
    if (activeId === 'all') return products;
    const fromYourLife = categories.find((c) => c.path === activeId);
    if (fromYourLife) {
      return products.filter((product) => productMatchesCategory(product, fromYourLife));
    }
    const fromTab = tabs.find((t) => t.id === activeId);
    if (!fromTab || !fromTab.path) return products;
    return products.filter((product) =>
      productMatchesCategory(product, {
        name: fromTab.label,
        path: fromTab.path,
        image: { src: '', alt: fromTab.label },
      }),
    );
  }, [activeId, categories, products, tabs]);

  const shopHref = activeId === 'all' ? SHOP_ALL_HREF : activeId;
  const showTabs = tabs.length > 1;

  return (
    <section aria-label="New arrivals" className="lh-products lh-products--soft rounded-top" id="new">
      <div className="lh-section-head" data-reveal>
        <span className="eyebrow">Just in</span>
        <h2>New on the shelf</h2>
        <p>
          {showTabs
            ? 'Toggle a Your Life category to see what just landed there.'
            : 'Fresh arrivals from Liivv Your Life.'}
        </p>
      </div>

      {showTabs ? (
        <div aria-label="Filter by category" className="lh-product-tabs" data-reveal role="tablist">
          {tabs.map((tab) => (
            <button
              aria-selected={activeId === tab.id}
              className={activeId === tab.id ? 'is-active' : undefined}
              key={tab.id}
              onClick={() => setActiveId(tab.id)}
              role="tab"
              type="button"
            >
              {tab.label}
            </button>
          ))}
        </div>
      ) : null}

      <div data-reveal data-reveal-stagger>
        <ProductRail
          key={activeId}
          label={`New products${activeId === 'all' ? '' : ` · ${tabs.find((t) => t.id === activeId)?.label ?? ''}`}`}
          products={filtered}
          shopHref={shopHref}
          shopLabel={activeId === 'all' ? 'Shop new →' : 'Shop this category →'}
        />
      </div>
    </section>
  );
}

export function LiivvHomePage({
  featured,
  newest,
  categories,
}: {
  featured: HomeProduct[];
  newest: HomeProduct[];
  categories: HomeCategory[];
}) {
  const [feelingIndex, setFeelingIndex] = useState(0);
  const [heroReady, setHeroReady] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setHeroReady(true);
      return;
    }
    const id = window.requestAnimationFrame(() => setHeroReady(true));
    return () => window.cancelAnimationFrame(id);
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion) return;
    const id = window.setInterval(() => {
      setFeelingIndex((i) => (i + 1) % FEELING_WORDS.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [reduceMotion]);

  useScrollReveal(!reduceMotion);

  const trustLoop = [...TRUST_ITEMS, ...TRUST_ITEMS];

  return (
    <div className={reduceMotion ? 'is-reduce-motion' : undefined} id="liivv-home">
      {/* SECTION 1 — HERO */}
      <section
        aria-label="Liivv Your Life hero"
        className={`lh-hero${heroReady ? ' is-ready' : ''}`}
      >
        <div aria-hidden className="lh-hero-orbs">
          <span />
          <span />
          <span />
        </div>
        <div className="lh-hero-board">
          <p className="lh-hero-brand lh-enter" style={{ '--enter-delay': '0ms' } as CSSProperties}>
            Liivv
          </p>
          <p className="lh-hero-kicker lh-enter" style={{ '--enter-delay': '80ms' } as CSSProperties}>
            Your Life · Shop everyday wellness
          </p>
          <h1 className="lh-enter" style={{ '--enter-delay': '160ms' } as CSSProperties}>
            Essentials that make living feel{' '}
            <span aria-live="polite" className="lh-feel" key={FEELING_WORDS[feelingIndex]}>
              {FEELING_WORDS[feelingIndex]}
            </span>
            .
          </h1>
          <p className="lh-hero-lead lh-enter" style={{ '--enter-delay': '240ms' } as CSSProperties}>
            A calm store for everyday products — plus pharmacy tools, Olivia, and subscriptions when you need
            them.
          </p>
          <div className="lh-hero-cta lh-enter" style={{ '--enter-delay': '320ms' } as CSSProperties}>
            <a className="btn btn-dark" href="#liivv-health">
              Find care that fits you
            </a>
            <a className="btn btn-outline" href={SHOP_ALL_HREF}>
              Shop all
            </a>
          </div>
          <div className="lh-hero-olivia lh-enter" style={{ '--enter-delay': '420ms' } as CSSProperties}>
            <button
              aria-label="Meet Olivia"
              className="lh-hero-olivia-btn"
              onClick={() => openLiveChat()}
              type="button"
            >
              <span className="olivia-bubble">Hey — I am Olivia.</span>
              <OliviaFigure alt="" mood="live" size="md" />
            </button>
          </div>
        </div>

        <div className="lh-hero-panel lh-enter" style={{ '--enter-delay': '200ms' } as CSSProperties}>
          <img alt="" src={`${IMG}/hero-living.png`} />
          <div aria-hidden className="lh-hero-stamp">
            <span>Shop</span>
            Everyday living, delivered
          </div>
          <nav aria-label="Liivv Health paths" className="lh-hero-bubbles">
            {HEALTH_TEASER_LINKS.map((link) => (
              <a className={`lh-hero-bubble lh-hero-bubble--${link.id}`} href={link.href} key={link.id}>
                <span className="lh-hero-bubble-pop">
                  <span className="lh-hero-bubble-media">
                    <img alt="" src={link.image} />
                  </span>
                  <span className="lh-hero-bubble-copy">
                    <span className="lh-hero-bubble-kicker">Explore</span>
                    <span className="lh-hero-bubble-title">{link.label}</span>
                  </span>
                </span>
              </a>
            ))}
          </nav>
        </div>
      </section>

      {/* SECTION 2 — TRUST TICKER */}
      <section aria-label="What we offer" className="lh-ticker">
        <div className="lh-ticker-track">
          {trustLoop.map((item, i) => (
            <span key={`${item}-${i}`}>{item}</span>
          ))}
        </div>
      </section>

      {/* SECTION 3 — LIIVV HEALTH */}
      <section aria-label="Liivv Health" className="lh-health rounded-top" id="liivv-health">
        <div className="lh-health-stage" data-reveal>
          <div aria-hidden className="lh-health-glow">
            <span />
            <span />
          </div>

          <div className="lh-health-copy">
            <span className="lh-health-kicker">
              <i />
              Liivv Health
            </span>
            <h2>
              Care that meets you <em>where you are</em>
            </h2>
            <p>
              One shelf can&apos;t know your story. Step into a hub built around you — Women&apos;s Health,
              Diabetes, Ostomy, and more. Tailored guidance, honest talk, and products for the season
              you&apos;re in.
            </p>
            <a className="lh-health-cta" href={LIIVV_HEALTH_HUB_HREF}>
              Start your customized path
            </a>
          </div>

          <div className="lh-health-media">
            {reduceMotion ? (
              <img alt="" src={`${IMG}/corner-womens.png`} />
            ) : (
              <video
                autoPlay
                className="lh-health-video"
                loop
                muted
                playsInline
                poster={`${IMG}/corner-womens.png`}
                preload="metadata"
              >
                <source src={`${IMG}/liivvhealth.mp4`} type="video/mp4" />
              </video>
            )}
            <div aria-hidden className="lh-health-media-veil" />
          </div>
        </div>
      </section>

      {/* SECTION 4 — CATEGORIES */}
      <section aria-label="Shop by category" className="lh-categories rounded-top" id="shop">
        <div className="lh-section-head" data-reveal>
          <span className="eyebrow">Shop by category</span>
          <h2>Find what fits your day</h2>
          <p>Browse the Your Life edit — curated shelves, not a warehouse maze.</p>
        </div>
        <div className="lh-category-grid" data-reveal data-reveal-stagger>
          {categories.map((category, index) => (
            <a
              className="lh-category"
              href={category.path}
              key={category.path}
              style={{ '--stagger': index } as CSSProperties}
            >
              <div className="lh-category-media">
                <img alt={category.image.alt} src={category.image.src} />
              </div>
              <h3>{category.name}</h3>
            </a>
          ))}
        </div>
        <div className="lh-section-cta" data-reveal>
          <a className="btn btn-outline" href={SHOP_ALL_HREF}>
            Shop all products
          </a>
        </div>
      </section>

      {/* SECTION 5 — FEATURED */}
      {featured.length > 0 ? (
        <section aria-label="Featured products" className="lh-products rounded-top" id="featured">
          <div className="lh-section-head" data-reveal>
            <span className="eyebrow">Featured</span>
            <h2>Picked for real routines</h2>
          </div>
          <div data-reveal data-reveal-stagger>
            <ProductRail
              label="Featured products"
              products={featured}
              shopHref={SHOP_ALL_HREF}
              shopLabel="View all →"
            />
          </div>
        </section>
      ) : null}

      {/* SECTION 6 — NEWEST BY CATEGORY */}
      {newest.length > 0 ? <NewestByCategory categories={categories} products={newest} /> : null}

      {/* SECTION 7 — PHARMACY FAMILY */}
      <section aria-label="Pharmacy" className="lh-pharmacy rounded-top" id="pharmacy">
        <div className="lh-section-head" data-reveal>
          <span className="eyebrow">Pharmacy</span>
          <h2>Your pharmacy, without the counter</h2>
          <p>
            Prescriptions and refills live in one calm place. The two that change the day-to-day — CarePak and
            Ask a pharmacist — are featured below.
          </p>
        </div>
        <div className="lh-pharmacy-pair" data-reveal data-reveal-stagger>
          {PHARMACY_STEPS.map((item, index) => (
            <div
              className="lh-pharmacy-card"
              key={item.id}
              style={{ '--stagger': index } as CSSProperties}
            >
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <a className="lh-text-link" href={item.href}>
                {item.cta} →
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 8 — CAREPAK FEATURED */}
      <section aria-label="CarePak" className="lh-feature lh-feature--carepak rounded-top" id="carepak">
        <div className="lh-feature-grid" data-reveal>
          <div className="lh-feature-media">
            <img alt="" src={`${IMG}/corner-personal.png`} />
          </div>
          <div className="lh-feature-copy">
            <span className="eyebrow">Main selling point</span>
            <h2>CarePak — never forget another dose</h2>
            <p>
              Pre-packaged pouches for eligible tablet medications, organized by date and time, shipped every
              4 weeks. Ideal if you take multiple tablets daily — a pharmacist reviews before your first
              shipment.
            </p>
            <ol className="lh-feature-steps">
              {CAREPAK_STEPS.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <a className="btn btn-dark" href={PHARMACY_CAREPAK}>
              Request CarePak
            </a>
          </div>
        </div>
      </section>

      {/* SECTION 9 — ASK A PHARMACIST (COMING SOON) */}
      <section
        aria-label="Ask a pharmacist — coming soon"
        className="lh-feature lh-feature--chat lh-feature--soon rounded-top"
        id="ask-a-pharmacist"
      >
        <div className="lh-feature-grid lh-feature-grid--flip" data-reveal>
          <div className="lh-feature-media">
            <img alt="" src={`${IMG}/care-chat.png`} />
            <span className="lh-soon-badge">Coming soon</span>
          </div>
          <div className="lh-feature-copy">
            <span className="eyebrow">Ontario · Coming soon</span>
            <h2>Ask a pharmacist — no waiting room</h2>
            <p>
              Clear answers, no med-speak theater. Soon you&apos;ll message an Ontario pharmacist during
              business hours — until 5 p.m. Eastern — for medication questions that need a human clinician.
            </p>
            <ul className="lh-feature-bullets">
              <li>
                <strong>Clinical questions</strong> — dosing, interactions, symptoms → a pharmacist joins
              </li>
              <li>
                <strong>Shopping &amp; account</strong> — leave those to Olivia anytime (next section)
              </li>
              <li>
                <strong>Secure in-app chat</strong> — same Virtual Care home as appointments and pharmacy
              </li>
            </ul>
            <span className="btn btn-soon" aria-disabled="true">
              Coming soon
            </span>
          </div>
        </div>
      </section>

      {/* SECTION 10 — OLIVIA */}
      <section aria-label="Olivia AI assistant" className="lh-olivia rounded-top" id="olivia">
        <div className="lh-olivia-stage" data-reveal>
          <div className="lh-olivia-mascot">
            <OliviaFigure mood="celebrate" priority size="xl" />
            <p className="lh-olivia-caption">Waves included. Medical advice not included.</p>
          </div>
          <div className="lh-section-head lh-olivia-intro">
            <span className="eyebrow">Meet Olivia</span>
            <h2>Your sprout-sized store assistant</h2>
            <p>
              Olivia helps with products, orders, subscriptions, and account how-tos in secure chat. She does{' '}
              <em>not</em> give medical advice — when Ask a pharmacist launches, she&apos;ll escalate clinical
              questions there.
            </p>
            <button className="btn btn-dark" onClick={() => openLiveChat()} type="button">
              Chat with Olivia
            </button>
            <p className="lh-olivia-note">
              She lives in the corner of every page. Hover the sprout. She will wave back.
            </p>
          </div>
        </div>
        <div className="lh-olivia-grid" data-reveal data-reveal-stagger>
          {OLIVIA_CAPABILITIES.map((item, index) => (
            <article
              className="lh-olivia-card"
              key={item.title}
              style={{ '--stagger': index } as CSSProperties}
            >
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SECTION 11 — SUBSCRIPTIONS */}
      <section aria-label="Subscriptions" className="lh-subs rounded-top" id="subscriptions">
        <div className="lh-section-head" data-reveal>
          <span className="eyebrow">Subscriptions</span>
          <h2>Recurring delivery on your schedule</h2>
          <p>Subscribe &amp; save on the product page, check out like any order, then manage anytime.</p>
        </div>

        <ul className="lh-subs-features" data-reveal data-reveal-stagger>
          {SUB_FEATURES.map((line, index) => (
            <li key={line} style={{ '--stagger': index } as CSSProperties}>
              {line}
            </li>
          ))}
        </ul>

        <div data-reveal>
          <SubscriptionFlowDemo />
        </div>

        <div className="lh-section-cta lh-subs-cta" data-reveal>
          <a className="btn btn-dark" href={SUBSCRIPTIONS}>
            Manage subscriptions
          </a>
          <a className="btn btn-outline" href={SHOP_ALL_HREF}>
            Shop to subscribe
          </a>
        </div>
      </section>

      {/* SECTION 12 — FAQ + CLOSE */}
      <section aria-label="Frequently asked questions" className="lh-faq rounded-top" id="faq">
        <div className="lh-faq-rail" data-reveal>
          <span className="eyebrow">FAQ</span>
          <h2>Good questions, honest answers</h2>
          <p>Shopping, pharmacy, Olivia, and how Liivv Health personalizes your care.</p>
        </div>
        <div className="lh-faq-list" data-reveal>
          <details open>
            <summary>What is Liivv Your Life?</summary>
            <p>
              Your everyday store — products and categories, plus pharmacy tools (prescriptions, refills,
              CarePak), Ask a pharmacist in Ontario (coming soon), Olivia for store help, and subscriptions.
            </p>
          </details>
          <details>
            <summary>What is CarePak?</summary>
            <p>
              Pre-packaged pouches for eligible tablet medications, organized by date and time, shipped every
              4 weeks. A pharmacist reviews before your first shipment. Request it from Pharmacy → CarePak.
            </p>
          </details>
          <details>
            <summary>Olivia vs Ask a pharmacist — who do I talk to?</summary>
            <p>
              Olivia helps anytime with shopping, orders, subscriptions, and account how-tos — she does not
              give medical advice. Ask a pharmacist (Ontario, business hours until 5 p.m. Eastern) is coming
              soon for medication questions that need a clinician.
            </p>
          </details>
          <details>
            <summary>How do subscriptions work?</summary>
            <p>
              On a product page, choose Subscribe &amp; save, pick frequency and start date, then check out
              like any order. Manage pause, skip, frequency, payment, and address under Account →
              Subscriptions — or ask Olivia.
            </p>
          </details>
          <details>
            <summary>What is Liivv Health?</summary>
            <p>
              A customized care experience — Women&apos;s Health, Diabetes, Ostomy, and more. Each hub is a
              tailored path of stories, guidance, and products for your season. Start at the hub, then go as
              deep as you need.
            </p>
          </details>
        </div>
      </section>

      <section aria-label="The Liivv promise" className="lh-close rounded-top" data-reveal id="manifesto">
        <div aria-hidden className="lh-close-bg">
          <img alt="" src={`${IMG}/hero-living.png`} />
        </div>
        <div className="lh-close-inner">
          <p className="lh-close-kicker">The Liivv promise</p>
          <h2>
            No shame. No hype.
            <span>Just you — at your best.</span>
          </h2>
          <p>Shop Your Life. Explore Health when the story needs more room.</p>
          <div className="lh-close-cta">
            <a className="btn btn-dark" href={SHOP_ALL_HREF}>
              Shop all
            </a>
            <a className="btn btn-outline" href={LIIVV_HEALTH_HUB_HREF}>
              Explore Liivv Health
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
