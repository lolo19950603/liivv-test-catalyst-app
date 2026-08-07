'use client';

import { useEffect, useMemo, useState } from 'react';

import { CHAPTERS as CHAPTER_PAGES, chapterHref } from './chapters/chapters-data';
import type { WhDemoCatalog, WhDemoCatalogItem } from './get-wh-demo-catalog';

import './womens-health-demo.css';

const SHOP_HREF = '/liivv-health/womens-health/shop-womens-health';
const PHARMACIST_HREF = '/account/virtual-care';
const IMG = '/archive/womens-health-demo';

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
    href: '#shop-womens-health',
    image: `${IMG}/mosaic-2.jpg`,
  },
  {
    id: 'care',
    label: 'Care',
    title: 'Ask without the awkward',
    body: 'Ontario pharmacists in chat — kind answers, no waiting room.',
    href: '#care',
    image: `${IMG}/care-2.jpg`,
  },
  {
    id: 'chapters',
    label: 'Chapters',
    title: 'Find your season',
    body: 'Six life chapters — pick where you are, not a number.',
    href: '#where-are-you',
    image: `${IMG}/chapter-1.jpg`,
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
  { id: 'cycle', label: 'Cycle comfort' },
  { id: 'intimate', label: 'Intimate care' },
  { id: 'prenatal', label: 'Prenatal & grow' },
  { id: 'glow', label: 'Glow & daily' },
] as const;

type ShopRoomId = (typeof SHOP_ROOMS)[number]['id'];

const KIT_DEMO_LINES = [
  { id: 'pads', name: 'Organic cotton pads', qty: 2 },
  { id: 'heat', name: 'Gentle heat wrap', qty: 1 },
  { id: 'skin', name: 'Hormonal skin basics', qty: 1 },
  { id: 'wipe', name: 'Intimate wipes', qty: 1 },
  { id: 'vitamins', name: 'Teen vitamin edit', qty: 1 },
] as const;

function roomForProduct(product: WhDemoCatalogItem): Exclude<ShopRoomId, 'all'> {
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
        {product.priceLabel ? <p className="wh-product-price">{product.priceLabel}</p> : null}
      </div>
    </a>
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

export function WomensHealthDemoPage({ catalog }: { catalog?: WhDemoCatalog }) {
  const [feelingIndex, setFeelingIndex] = useState(0);
  const [shopRoom, setShopRoom] = useState<ShopRoomId>('all');
  const [kitLines, setKitLines] = useState(() =>
    KIT_DEMO_LINES.map((line) => ({ ...line })),
  );

  const featuredKit = catalog?.featuredKit ?? null;
  const otherKits = (catalog?.kits ?? []).filter((k) => k.entityId !== featuredKit?.entityId);
  const shopProducts = catalog?.products ?? [];
  const hasKits = Boolean(featuredKit) || otherKits.length > 0;
  const hasShop = shopProducts.length > 0;

  const filteredShop = useMemo(() => {
    if (shopRoom === 'all') return shopProducts.slice(0, 12);

    return shopProducts.filter((p) => roomForProduct(p) === shopRoom).slice(0, 12);
  }, [shopProducts, shopRoom]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setFeelingIndex((i) => (i + 1) % FEELING_WORDS.length);
    }, 2600);

    return () => window.clearInterval(id);
  }, []);

  const bumpQty = (id: string, delta: number) => {
    setKitLines((lines) =>
      lines.map((line) =>
        line.id === id ? { ...line, qty: Math.max(0, line.qty + delta) } : line,
      ),
    );
  };

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
        <div aria-hidden className="hero-stack">
          <div className="hero-stack-main">
            <img alt="" src={`${IMG}/hero.jpg`} />
          </div>
          <div className="hero-chip">
            <span>Liivv vibe</span>
            Wellness that works IRL
          </div>
          <div className="hero-frame hero-frame--a">
            <img alt="" src={`${IMG}/hero-a.jpg`} />
          </div>
          <div className="hero-frame hero-frame--b">
            <img alt="" src={`${IMG}/hero-b.jpg`} />
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

      {/* 4 — Where are you? */}
      <section aria-label="Find your chapter" className="wh-chooser" id="where-are-you">
        <div className="container">
          <span className="eyebrow">Life chapters</span>
          <h2>Where are you right now?</h2>
          <p className="wh-chooser-intro">
            Chapters follow your season — not an age band. Tap one to open the full page.
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

      {/* 5 — Kit living object */}
      {hasKits ? (
        <section aria-label="Customizable kits" className="wh-kits rounded-top" id="build-your-kit">
          <div className="container">
            <span className="eyebrow">Liivv kits</span>
            <h2>Start curated. Finish as yours.</h2>
            <p className="wh-kits-intro">
              Prebuilt for the chapter — then you tune qty, add what was missing, and save it for later.
              More kits are coming; the flow stays the same.
            </p>

            {featuredKit ? (
              <div className="wh-kit-board">
                <div className="wh-kit-board-visual">
                  <div className="wh-kit-board-hero">
                    {featuredKit.image ? (
                      <img alt={featuredKit.image.alt} src={featuredKit.image.src} />
                    ) : (
                      <div aria-hidden className="wh-product-fallback" />
                    )}
                  </div>
                  <div className="wh-kit-board-meta">
                    <span className="wh-product-badge">Featured kit</span>
                    <h3>{featuredKit.name}</h3>
                    {featuredKit.priceLabel ? (
                      <p className="wh-product-price">{featuredKit.priceLabel}</p>
                    ) : null}
                    <p>
                      A calm first-chapter edit. Play with the tray below — then open the real customizer to
                      save your version.
                    </p>
                    <a className="btn btn-dark" href={featuredKit.path}>
                      Customize this kit
                    </a>
                  </div>
                </div>

                <div className="wh-kit-tray" aria-label="Demo kit tray">
                  <div className="wh-kit-tray-head">
                    <h4>Your kit tray</h4>
                    <span>Demo — opens fully on the product page</span>
                  </div>
                  <ul className="wh-kit-lines">
                    {kitLines.map((line) => (
                      <li key={line.id}>
                        <div>
                          <strong>{line.name}</strong>
                          {line.qty === 0 ? <em>Removed</em> : null}
                        </div>
                        <div className="wh-kit-qty">
                          <button
                            aria-label={`Decrease ${line.name}`}
                            onClick={() => bumpQty(line.id, -1)}
                            type="button"
                          >
                            −
                          </button>
                          <span>{line.qty}</span>
                          <button
                            aria-label={`Increase ${line.name}`}
                            onClick={() => bumpQty(line.id, 1)}
                            type="button"
                          >
                            +
                          </button>
                        </div>
                      </li>
                    ))}
                    <li className="wh-kit-add">
                      <span>+ Add something new</span>
                      <a href={featuredKit.path}>On the kit page</a>
                    </li>
                  </ul>
                  <div className="wh-kit-tray-foot">
                    <span className="wh-kit-save-chip">Save for later</span>
                    <a className="btn btn-outline" href={featuredKit.path}>
                      Open full customizer
                    </a>
                  </div>
                </div>
              </div>
            ) : null}

            {otherKits.length > 0 ? (
              <div className="wh-kit-more">
                <h3>More kits in the edit</h3>
                <div className="wh-product-grid">
                  {otherKits.map((kit) => (
                    <ProductThumb key={kit.entityId} product={kit} />
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* 6 — Shop rooms */}
      {hasShop ? (
        <section aria-label="Shop Women's Health" className="wh-shop" id="shop-womens-health">
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

      {/* 7 — Care */}
      <section className="images-text rounded-top" id="care">
        <div className="container images-text-grid">
          <div className="visuals">
            <Pic className="big" src={`${IMG}/care-1.jpg`} />
            <Pic className="mid" src={`${IMG}/care-2.jpg`} />
            <Pic className="small" src={`${IMG}/care-3.jpg`} />
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
      <section className="story rounded-top" id="clair">
        <div className="container">
          <div className="banner">
            <h2>Also in the edit: Clair</h2>
            <div aria-hidden className="clair-collage">
              <Pic className="c1" src={`${IMG}/clair-1.jpg`} />
              <Pic className="c2" src={`${IMG}/clair-2.jpg`} />
              <Pic className="c3" src={`${IMG}/clair-3.jpg`} />
              <Pic className="c4" src={`${IMG}/clair-4.jpg`} />
            </div>
          </div>
          <div className="story-grid">
            <h2>
              Continuous clarity, <span className="accent">when you want it.</span>
            </h2>
            <div>
              <p>
                Clair is a wearable that reads your body&apos;s key signals continuously — so you can see the
                shape of your month instead of guessing through it.
              </p>
              <p className="strong-close">Same calm place as the rest of Liivv Women. Same discreet delivery.</p>
              <div className="story-cta">
                <a className="btn btn-dark" href={SHOP_HREF}>
                  See Clair in the shop
                </a>
              </div>
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
              <Pic src={`${IMG}/faq-1.jpg`} />
            </div>
            <div className="wh-voice-feature-copy">
              <p className="wh-voice-kicker">First kit · Toronto</p>
              <blockquote>
                &ldquo;I finally asked a pharmacist a question I&apos;d been too shy to ask anyone for a year.
                Got a kind, straight answer on my lunch break — no waiting room, no judgment.&rdquo;
              </blockquote>
              <div className="who">
                Priya
                <span>Toronto · juggling two kids and a startup</span>
              </div>
            </div>
          </article>

          <div className="voice-cards">
            <div className="voice">
              <div aria-hidden className="voice-mark voice-mark--sage">
                <span>D</span>
              </div>
              <div className="body">
                <blockquote>
                  &ldquo;My monthly box shows up like clockwork. I genuinely forgot what running-out panic feels
                  like.&rdquo;
                </blockquote>
                <div className="who">
                  Dana
                  <span>Ottawa · marathon-in-training</span>
                </div>
              </div>
            </div>
            <div className="voice">
              <div aria-hidden className="voice-mark voice-mark--sand">
                <span>M</span>
              </div>
              <div className="body">
                <blockquote>
                  &ldquo;I used to keep three apps and a drawer of half-finished bottles. Sundays feel like
                  mine again.&rdquo;
                </blockquote>
                <div className="who">
                  Maya
                  <span>Liivv member since 2024</span>
                </div>
              </div>
            </div>
            <div className="voice">
              <div aria-hidden className="voice-mark voice-mark--taupe">
                <span>S</span>
              </div>
              <div className="body">
                <blockquote>
                  &ldquo;Sleep support and skin staples in one place changed my month. No more whisper aisle
                  hopping.&rdquo;
                </blockquote>
                <div className="who">
                  Sofia
                  <span>Mississauga · Liivv Women regular</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ — shortened */}
      <section className="faq rounded-top">
        <div className="faq-layout">
          <div aria-hidden className="faq-art">
            <Pic src={`${IMG}/faq-1.jpg`} />
            <Pic src={`${IMG}/faq-2.jpg`} />
          </div>
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
