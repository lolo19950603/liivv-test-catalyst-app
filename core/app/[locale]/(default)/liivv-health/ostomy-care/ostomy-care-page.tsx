'use client';

import { useMemo, useState } from 'react';

import { KitFlowDemo } from '~/components/kit-flow-demo/kit-flow-demo';

import { CHAPTERS as CHAPTER_PAGES, SHOP_OSTOMY_HREF, chapterHref } from './chapters/chapters-data';
import type { OcCatalog, OcCatalogItem } from './get-oc-catalog';
import { NEW_JOURNEY_STARTER_KIT_ID } from './oc-ids';

import './ostomy-care.css';

/*
 * Ostomy Care landing — Quiet Shelf / Everyday Ritual
 * Distinct from Women's Health (no doors / float chips / kit carousel clone).
 */

const SHOP_HREF = SHOP_OSTOMY_HREF;
const PHARMACIST_HREF = '/account/virtual-care';
const IMG = '/archive/ostomy-care';

const RITUAL_CHIPS = [
  'Empty at one-third full',
  'Dry skin seals better',
  'Keep a go-bag ready',
  'Restock before you run low',
  'Measure as swelling changes',
  'Ask without the awkward',
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
    body: 'Pouches, barriers, and accessories in calm rooms — not a warehouse aisle.',
    href: '#shop-ostomy-care',
  },
  {
    num: '03',
    title: 'Your pace',
    body: 'Everyday Liivving, stoma basics, or new-to-journey — open what fits today.',
    href: '#where-are-you',
  },
  {
    num: '04',
    title: 'A kind answer',
    body: 'Ontario pharmacist chat for everyday product questions during business hours.',
    href: '#care',
  },
] as const;

const JOURNEY = [
  ...CHAPTER_PAGES.map((chapter, index) => ({
    step: String(index + 1).padStart(2, '0'),
    title: chapter.title,
    blurb: chapter.vibe,
    href: chapterHref(chapter.slug),
    image: chapter.heroImage,
  })),
  {
    step: '04',
    title: 'Shop Ostomy Essentials',
    blurb: 'Pouches, barriers, skin care, and preferred brands — restocked discreetly.',
    href: SHOP_HREF,
    image: `${IMG}/door-shop.png`,
  },
];

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

export function OstomyCarePage({ catalog }: { catalog?: OcCatalog }) {
  const [shopRoom, setShopRoom] = useState<ShopRoomId>('all');

  const allKits = catalog?.kits ?? [];
  const featuredKit =
    catalog?.featuredKit ??
    allKits.find((kit) => kit.entityId === NEW_JOURNEY_STARTER_KIT_ID) ??
    allKits[0] ??
    null;
  const shelfKits = allKits.filter((kit) => kit.entityId !== featuredKit?.entityId);
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
        <div aria-hidden className="oc-hero-bg">
          <img alt="" decoding="async" src={`${IMG}/hero.png`} />
        </div>
        <div aria-hidden className="oc-hero-mist" />
        <div className="oc-hero-inner">
          <span className="oc-hero-brand">Ostomy Care and Everyday Liivving</span>
          <h1>Care that stays discreet.</h1>
          <p className="oc-hero-lead">
            Supplies, everyday living support, and kind guidance — so your routine feels like yours again.
          </p>
          <div className="oc-hero-cta">
            <a className="oc-btn oc-btn-soft" href="#where-are-you">
              Find your pace
            </a>
            <a className="oc-btn oc-btn-ghost" href="#build-your-kit" style={{ borderColor: 'rgba(255,255,255,0.45)', color: '#fff' }}>
              Browse curated kits
            </a>
          </div>
        </div>
        <div aria-hidden className="oc-hero-mark">
          <span>Living, not managing</span>
        </div>
      </section>

      <div className="oc-ribbon">
        <div aria-label="Everyday ritual reminders" className="oc-ribbon-track">
          {RITUAL_CHIPS.map((chip) => (
            <span className="oc-ribbon-chip" key={chip}>
              {chip}
            </span>
          ))}
        </div>
      </div>

      <section aria-label="Ways into Ostomy Care" className="oc-path" id="doors">
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
        <section aria-label="Ostomy curated kits" className="oc-packs" id="build-your-kit">
          <div className="oc-wrap">
            <header className="oc-packs-head">
              <span className="oc-eyebrow">Curated kits</span>
              <h2>Start curated. Finish as yours.</h2>
              <p>
                Official kits from the Liivv Ostomy edit — open one, tune quantities, add what was missing, and
                save it for later restock.
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

            {featuredKit ? (
              <article className="oc-pack-feature">
                <div className="oc-pack-feature-media">
                  {featuredKit.image ? (
                    <img alt={featuredKit.image.alt} src={featuredKit.image.src} />
                  ) : (
                    <div aria-hidden className="oc-shelf-fallback" />
                  )}
                </div>
                <div className="oc-pack-feature-copy">
                  <span className="oc-pack-badge">Featured kit</span>
                  <h3>{featuredKit.name}</h3>
                  {hasDisplayPrice(featuredKit.priceLabel) ? (
                    <p className="oc-pack-price">{featuredKit.priceLabel}</p>
                  ) : null}
                  <p>
                    A calm Fresh Start edit — customize on the kit page, then keep your version for the weeks
                    ahead.
                  </p>
                  <a className="oc-btn oc-btn-solid" href={featuredKit.path}>
                    Customize this kit
                  </a>
                </div>
              </article>
            ) : null}

            {shelfKits.length > 0 ? (
              <div aria-label="More curated kits" className="oc-shelf">
                {shelfKits.map((kit) => (
                  <a className="oc-shelf-card" href={kit.path} key={kit.entityId}>
                    <div className="oc-shelf-media">
                      {kit.image ? (
                        <img alt={kit.image.alt} src={kit.image.src} />
                      ) : (
                        <div aria-hidden className="oc-shelf-fallback" />
                      )}
                    </div>
                    <div className="oc-shelf-meta">
                      <span className="oc-product-badge">Customizable kit</span>
                      <h3>{kit.name}</h3>
                      {hasDisplayPrice(kit.priceLabel) ? <p>{kit.priceLabel}</p> : null}
                    </div>
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasShop ? (
        <section aria-label="Shop Ostomy Essentials" className="oc-shop" id="shop-ostomy-care">
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

      <section aria-label="Journey chapters" className="oc-journey" id="where-are-you">
        <div className="oc-wrap">
          <header className="oc-journey-head">
            <span className="oc-eyebrow">Your pace</span>
            <h2>Four soft ways in.</h2>
            <p>Open a chapter — or skip to the shelf when you already know what you need.</p>
          </header>
          <div className="oc-journey-rail">
            {JOURNEY.map((item) => (
              <a className="oc-journey-card" href={item.href} key={item.step}>
                <div className="oc-journey-thumb">
                  <img alt="" src={item.image} />
                </div>
                <div className="oc-journey-body">
                  <span className="oc-journey-step">Step {item.step}</span>
                  <h3>{item.title}</h3>
                  <p>{item.blurb}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section aria-label="Pharmacist care" className="oc-care" id="care">
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
        </div>
      </section>

      <section aria-label="Preferred brands" className="oc-brands" id="brands">
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

      <section aria-label="Community voices" className="oc-voices" id="voices">
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

      <section aria-label="Frequently asked questions" className="oc-faq">
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
                Yes. Start curated, adjust quantities, add items, and save your version for later restock.
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

      <section aria-label="Closing" className="oc-close" id="manifesto">
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
              Shop Ostomy Essentials
            </a>
            <a className="oc-btn oc-btn-ghost" href="#build-your-kit" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              Browse curated kits
            </a>
            <a className="oc-btn oc-btn-ghost" href="#where-are-you" style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}>
              Find your pace
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
