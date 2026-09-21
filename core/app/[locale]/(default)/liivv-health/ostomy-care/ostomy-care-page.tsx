'use client';

import { useLocale, useMessages, useTranslations } from 'next-intl';
import {
  type ReactNode,
  type TransitionEvent,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { HeroLoopVideo, RotatingHeroWord } from '~/components/health-hero';
import { OliviaHelpBand } from '~/components/olivia/olivia-help-band';
import { SpecializedSubscribe } from '~/components/specialized-subscribe/specialized-subscribe';

import { HashTargetScroll } from './_components/hash-target-scroll';
import {
  buildChapters,
  chapterHref,
  localeHref,
  SHOP_OSTOMY_HREF,
} from './chapters/chapters-data';
import type { OcCatalog, OcCatalogItem } from './get-oc-catalog';
import { NEW_JOURNEY_STARTER_KIT_ID } from './oc-ids';

import './ostomy-care.css';

/*
 * Ostomy Care landing — Quiet Shelf / Everyday Ritual
 * Distinct from Women's Health (no doors / float chips) — kits carousel matches WH.
 *
 * =============================================================================
 * EVERY WORD ON THIS PAGE IS IN THE MESSAGE TREE
 * =============================================================================
 * It was not. Until this pass the only translated thing on the whole landing
 * page was the five situation doors, and that section is behind a French review
 * gate which is closed in production — so /fr/liivv-health/ostomy-care, the
 * entry point of the French microsite, would have shipped with no French on it
 * at all. Nine of its ten headings were English, including the hero, the
 * subscriptions band and every FAQ answer. An /fr entry page in English is
 * worse than none, because every door out of it lands the reader mid-site.
 *
 * So the prose lives in `OstomyCare.ui.landingPage.*` in en.json and fr.json,
 * the way chapter-page.tsx and funding-page.tsx already work, and what is left
 * in this file is structure: ids, hrefs, image paths, and the order things come
 * in. The ids below are what the page filters and keys on and are never
 * rendered; their words are looked up beside them.
 * =============================================================================
 */

const SHOP_HREF = SHOP_OSTOMY_HREF;
const PHARMACIST_HREF = '/account/virtual-care';
const IMG = '/archive/ostomy-care';

/* The rotating word after "Care that stays". Keys into `hero.words`. */
const HERO_WORD_KEYS = ['1', '2', '3', '4', '5'] as const;

/* The four claims on the trust strip. Keys into `trust.items`. */
const TRUST_ITEM_KEYS = ['1', '2', '3', '4'] as const;

/* The subscription band's three features. Keys into `subscribe.features`. */
const SUBSCRIBE_FEATURE_KEYS = ['1', '2', '3'] as const;

/* The four lines under the brand row. Keys into `brands.points`. */
const BRAND_POINT_KEYS = ['1', '2', '3', '4'] as const;

/*
 * The ways in, in order. The number is drawn from the rendered position rather
 * than written down, because the kits door only exists when there is a kit to
 * show (see oc-ids.ts) and a list that jumps from 01 to 03 would be a bug on
 * the page. `id` is what the page filters on and what its words are looked up
 * by; nothing renders it.
 */
const PATH_LINKS = [
  { id: 'kits', href: '#build-your-kit' },
  { id: 'shelf', href: '#shop-ostomy-care' },
  { id: 'chapters', href: '#where-are-you' },
  { id: 'funding', href: '/liivv-health/ostomy-care/funding' },
  { id: 'care', href: '#care' },
] as const;

const SHOP_ROOMS = ['all', 'kits', 'onePiece', 'twoPiece', 'barriers', 'accessories'] as const;

type ShopRoomId = (typeof SHOP_ROOMS)[number];

/* Manufacturer names: not copy, and never translated. */
const PREFERRED_BRANDS = ['Coloplast', 'Hollister', 'Convatec'] as const;

/*
 * The questions, in order. Question 2 is about customizing a kit, so it is
 * gated on `hasKits` with the rest of the kit surfaces.
 */
const FAQ_KEYS = ['1', '2', '3', '4', '5'] as const;
const FAQ_KITS_KEY = '2';

/*
 * There is no "Notes from the shelf" section here any more. It carried four
 * design personas (Morgan, Casey, Jordan, Avery) presented as quoted readers,
 * with photographs, a city, an ostomy type and a first-person quote each. Even
 * labelled as illustrative in the source, nothing on the rendered page told a
 * reader they were invented, and two of them answered — in a patient's voice —
 * questions this site sends to a nurse. Removed rather than rewritten: an
 * invented ostomate is not a safe way to say anything on a health page.
 */

function roomForProduct(product: OcCatalogItem): Exclude<ShopRoomId, 'all' | 'kits'> {
  const n = product.name.toLowerCase();

  if (
    /1-piece|one-piece|1 piece|premier one-piece|pouchkins newborn|pouchkins drainable pediatric one|activelife/.test(
      n,
    )
  ) {
    return 'onePiece';
  }

  if (
    /2-piece|two-piece|2 piece|new image two|sensura mio click|sensura click|natura 2|sur-fit/.test(
      n,
    )
  ) {
    return 'twoPiece';
  }

  if (
    /barrier|flange|wafer|ring|paste|powder|flextend|flexwear|ceraplus|stomahesive|eakin/.test(n) &&
    !n.includes('pouch')
  ) {
    return 'barriers';
  }

  if (/belt|clamp|deodorant|odor|adapter|wipe|remover|sheet|lubricat|sponge/.test(n)) {
    return 'accessories';
  }

  if (n.includes('pouch')) {
    return /1-piece|one-piece|premier one|assura 1|sensura 1|sensura light 1|activelife|pouchkins/.test(
      n,
    )
      ? 'onePiece'
      : 'twoPiece';
  }

  return 'accessories';
}

function hasDisplayPrice(priceLabel?: string) {
  return Boolean(priceLabel && !/(\$|CA\$)?\s*0([.,]0+)?\b/i.test(priceLabel));
}

/*
 * className separators here are the space before each `${`, never a space
 * inside the interpolated string: prettier-plugin-tailwindcss normalises class
 * strings and strips a leading space inside one. That is how commit 6d42e4a0
 * turned these into 'oc-kits-carousel-slideis-side', 'oc-filteris-active' and
 * 'oc-kits-carousel-trackis-instant', which silently killed the carousel side
 * slides and the shop filter's active state.
 */
function slideDirectionClass(offset: number, shift: number) {
  if (offset < shift) return 'is-prev';
  if (offset > shift) return 'is-next';

  return '';
}

function KitsCarousel({ kits, initialId }: { kits: OcCatalogItem[]; initialId?: number | null }) {
  const t = useTranslations('OstomyCare.ui.landingPage.kits');
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
          <span className="oc-pack-badge">
            {isFeatured ? t('featuredBadge') : t('customBadge')}
          </span>
          <h3>{kit.name}</h3>
          {hasDisplayPrice(kit.priceLabel) ? (
            <p className="oc-pack-price">{kit.priceLabel}</p>
          ) : (
            <p className="oc-pack-price oc-pack-price--spacer">&nbsp;</p>
          )}
          <p>{isFeatured ? t('featuredBody') : t('cardBody')}</p>
          {isCenter && shift === 0 ? (
            <a className="oc-btn oc-btn-solid" href={kit.path}>
              {t('cta')}
            </a>
          ) : (
            <span className="oc-btn oc-btn-solid oc-pack-feature-cta-ghost">{t('cta')}</span>
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
        aria-label={t('show', { name: kit.name })}
        className={`oc-pack-feature oc-kits-carousel-slide ${
          isCenter ? 'is-center' : 'is-side'
        } ${slideDirectionClass(offset, shift)}`}
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
        {t('count', { active: String(active + 1), count: String(count) })}
      </p>

      <div className="oc-kits-carousel-frame">
        {count > 1 ? (
          <button
            aria-label={t('previous')}
            className="oc-kits-carousel-btn is-prev"
            onClick={() => go(-1)}
            type="button"
          >
            ←
          </button>
        ) : null}

        <div
          aria-label={t('carouselLabel')}
          aria-roledescription="carousel"
          className="oc-kits-carousel-viewport"
          ref={viewportRef}
        >
          <div
            className={`oc-kits-carousel-track ${instant ? 'is-instant' : ''}`}
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
            aria-label={t('next')}
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

/*
 * `doors` is C13, rendered on the server by page.tsx and passed in as a slot.
 * It sits where the guest quiz and the kit flow demo used to, above every shop
 * surface on the page — see situation-doors.tsx for why it is not imported
 * here.
 */
export function OstomyCarePage({ catalog, doors }: { catalog?: OcCatalog; doors?: ReactNode }) {
  // Chapter copy is translated, so the card list is built per render rather
  // than frozen at module scope.
  const messages = useMessages();
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.landingPage');
  const lifeChapters = buildChapters(
    messages.OstomyCare.chapters,
    locale,
    messages.OstomyCare.ui.chapter.groups,
  ).map((chapter) => ({
    num: chapter.num,
    word: chapter.chapterWord,
    title: chapter.title,
    blurb: chapter.vibe,
    // A plain <a>, so the /fr prefix has to be put on by hand — chapters-data.ts.
    href: localeHref(chapterHref(chapter.slug), locale),
    image: chapter.heroImage,
  }));
  const shopHref = localeHref(SHOP_HREF, locale);

  const [shopRoom, setShopRoom] = useState<ShopRoomId>('all');

  const allKits = catalog?.kits ?? [];
  const featuredKit =
    catalog?.featuredKit ??
    allKits.find((kit) => kit.entityId === NEW_JOURNEY_STARTER_KIT_ID) ??
    allKits[0] ??
    null;
  const shopProducts = catalog?.products ?? [];
  /*
   * Kits are allowlisted in oc-ids.ts and the list is empty today, so this page
   * has to read well with none. Everything that points at #build-your-kit goes
   * with the section: the door in "What would help today?", the hero's second
   * button, the "Curated kits" shop room and the closing link. A heading with
   * nothing under it, or a link to an anchor that is not on the page, would be
   * worse than no kits at all.
   */
  const hasKits = allKits.length > 0;
  const hasShop = shopProducts.length > 0 || allKits.length > 0;
  const pathLinks = hasKits ? PATH_LINKS : PATH_LINKS.filter((item) => item.id !== 'kits');
  const shopRooms = hasKits ? SHOP_ROOMS : SHOP_ROOMS.filter((room) => room !== 'kits');
  const faqKeys = hasKits ? FAQ_KEYS : FAQ_KEYS.filter((key) => key !== FAQ_KITS_KEY);
  /*
   * The numbered lists are read off the messages object rather than through
   * `t()`: a numbered key built at runtime is not a literal, and every one of
   * these is a plain sentence with nothing to interpolate. `t()` is used
   * wherever the key is fixed, and wherever there is a value to put in.
   */
  const copy = messages.OstomyCare.ui.landingPage;

  const filteredShop = useMemo(() => {
    if (shopRoom === 'kits') return allKits.slice(0, 12);
    if (shopRoom === 'all') return shopProducts.slice(0, 12);

    return shopProducts.filter((p) => roomForProduct(p) === shopRoom).slice(0, 12);
  }, [allKits, shopProducts, shopRoom]);

  return (
    <div id="ostomy-care">
      {/* Chapters link back here by fragment; see the file. */}
      <HashTargetScroll />
      <section aria-label={t('hero.label')} className="oc-hero">
        <div className="oc-hero-stage">
          <div aria-hidden className="oc-hero-glow">
            <span />
            <span />
          </div>

          <div className="oc-hero-copy">
            <span className="oc-hero-kicker">
              <i />
              {t('hero.kicker')}
            </span>
            <h1>
              {t('hero.headingLead')}{' '}
              <RotatingHeroWord
                className="oc-hero-word"
                words={HERO_WORD_KEYS.map((key) => copy.hero.words[key])}
              />
            </h1>
            <p>{t('hero.body')}</p>
            <div className="oc-hero-actions">
              <a className="oc-hero-cta" href="#where-are-you">
                {t('hero.cta')}
              </a>
              {hasKits ? (
                <a className="oc-hero-cta-ghost" href="#build-your-kit">
                  {t('hero.kitsCta')}
                </a>
              ) : null}
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

      <section aria-label={t('trust.label')} className="oc-trust">
        <div className="oc-trust-track">
          {TRUST_ITEM_KEYS.map((key) => (
            <span key={key}>{copy.trust.items[key]}</span>
          ))}
        </div>
      </section>

      {doors}

      <section aria-label={t('ways.label')} className="oc-path" id="doors">
        <div className="oc-wrap">
          <header className="oc-path-head">
            <span className="oc-eyebrow">{t('ways.eyebrow')}</span>
            <h2>{t('ways.heading')}</h2>
          </header>
          <div className="oc-path-list">
            {pathLinks.map((item, index) => (
              <a className="oc-path-item" href={localeHref(item.href, locale)} key={item.id}>
                <span className="oc-path-num">{String(index + 1).padStart(2, '0')}</span>
                <div className="oc-path-copy">
                  <h3>{copy.ways.items[item.id].title}</h3>
                  <p>{copy.ways.items[item.id].body}</p>
                </div>
                <span className="oc-path-go">{t('ways.go')}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {hasKits ? (
        <section
          aria-label={t('kits.label')}
          className="oc-packs rounded-top"
          id="build-your-kit"
        >
          <div className="oc-wrap">
            <header className="oc-packs-head">
              <span className="oc-eyebrow">{t('kits.eyebrow')}</span>
              <h2>{t('kits.heading')}</h2>
              <p>{t('kits.body')}</p>
            </header>

            <KitsCarousel initialId={featuredKit?.entityId} kits={allKits} />
          </div>
        </section>
      ) : null}

      {hasShop ? (
        <section
          aria-label={t('shop.label')}
          className="oc-shop rounded-top"
          id="shop-ostomy-care"
        >
          <div className="oc-wrap">
            <div className="oc-shop-head">
              <div>
                <span className="oc-eyebrow">{t('shop.eyebrow')}</span>
                <h2>{t('shop.heading')}</h2>
                <p>{t('shop.body')}</p>
              </div>
              <a className="oc-btn oc-btn-solid" href={shopHref}>
                {t('shop.openShop')}
              </a>
            </div>

            <div aria-label={t('shop.filtersLabel')} className="oc-filters" role="tablist">
              {shopRooms.map((room) => (
                <button
                  aria-selected={shopRoom === room}
                  className={`oc-filter ${shopRoom === room ? 'is-active' : ''}`}
                  key={room}
                  onClick={() => setShopRoom(room)}
                  role="tab"
                  type="button"
                >
                  {copy.shop.rooms[room]}
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
                    {product.isKit ? (
                      <span className="oc-product-badge">{t('shop.kitBadge')}</span>
                    ) : null}
                    <h3>{product.name}</h3>
                    {hasDisplayPrice(product.priceLabel) ? (
                      <p className="oc-product-price">{product.priceLabel}</p>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>

            {filteredShop.length === 0 ? (
              <p className="oc-shop-empty">{t('shop.empty')}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <SpecializedSubscribe
        className="oc-subs rounded-top"
        demoProductBlurb={t('subscribe.demoBlurb')}
        demoProductName={t('subscribe.demoName')}
        demoProductPath="liivv.ca/product/ostomy-essentials"
        eyebrow={t('subscribe.eyebrow')}
        features={SUBSCRIBE_FEATURE_KEYS.map((key) => copy.subscribe.features[key])}
        lead={t('subscribe.lead')}
        primaryCtaClass="oc-btn oc-btn-solid"
        secondaryCtaClass="oc-btn oc-btn-ghost"
        shopHref={shopHref}
        shopLabel={t('subscribe.shopLabel')}
        title={t('subscribe.title')}
        wrapClassName="oc-wrap"
      />

      <section
        aria-label={t('chapters.label')}
        className="oc-chapters rounded-top"
        id="where-are-you"
      >
        <div className="oc-wrap">
          <header className="oc-chapters-head">
            <span className="oc-eyebrow">{t('chapters.eyebrow')}</span>
            <h2>{t('chapters.heading')}</h2>
            <p>
              {t('chapters.body')} {t('chapters.skipPrompt')}{' '}
              <a href="#shop-ostomy-care">{t('chapters.skipLink')}</a>.
            </p>
          </header>
          <div className="oc-chapters-grid">
            {lifeChapters.map((item) => (
              <a className="oc-chapter-card" href={item.href} key={item.num}>
                <div className="oc-chapter-media">
                  <img alt="" src={item.image} />
                  <span className="oc-chapter-word">
                    {t('chapters.chapterWord', { word: item.word })}
                  </span>
                </div>
                <div className="oc-chapter-body">
                  <h3>{item.title}</h3>
                  <p>{item.blurb}</p>
                  <span className="oc-chapter-go">{t('chapters.open')}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section aria-label={t('care.label')} className="oc-care rounded-top" id="care">
        <div className="oc-wrap">
          <div className="oc-care-panel">
            <div className="oc-care-visual">
              <img alt="" src={`${IMG}/care-chat-main.png`} />
            </div>
            <div className="oc-care-copy">
              <span className="oc-eyebrow">{t('care.eyebrow')}</span>
              <h2>{t('care.heading')}</h2>
              <p>{t('care.body')}</p>
              <a className="oc-btn oc-btn-soft" href={localeHref(PHARMACIST_HREF, locale)}>
                {t('care.cta')}
              </a>
            </div>
          </div>
          <div className="oc-olivia-band">
            {/*
             * No "product match" here. Olivia is a chat assistant that can
             * search the catalogue, and matching a product to a body is a fit
             * question — the one thing this page repeatedly sends to an NSWOC.
             * She helps with restocks and orders.
             */}
            <OliviaHelpBand body={t('care.oliviaBody')} title={t('care.oliviaTitle')} />
          </div>
        </div>
      </section>

      <section aria-label={t('brands.label')} className="oc-brands rounded-top" id="brands">
        <div className="oc-wrap">
          <div className="oc-brands-inner">
            <span className="oc-eyebrow">{t('brands.eyebrow')}</span>
            <h2>{t('brands.heading')}</h2>
            <p>{t('brands.body')}</p>
            <div className="oc-brand-row">
              {PREFERRED_BRANDS.map((brand) => (
                <span className="oc-brand-pill" key={brand}>
                  {brand}
                </span>
              ))}
            </div>
            <ul className="oc-brand-points">
              {BRAND_POINT_KEYS.map((key) => (
                <li key={key}>{copy.brands.points[key]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-label={t('faq.label')} className="oc-faq rounded-top">
        <div className="oc-wrap">
          <div className="oc-faq-panel">
            <h2>{t('faq.heading')}</h2>
            <p>{t('faq.note')}</p>
            {/*
              The first question is open; the rest are closed. Question 2 is
              about customizing a kit and is gated with the hero's ghost CTA
              and the kits room: with every curated kit withheld (oc-ids.ts) it
              would send a reader off to look for kits the rest of the page has
              deliberately taken down — and they are still listed in the store.
              It comes back on its own when the allowlist is repopulated.
            */}
            {faqKeys.map((key, index) => (
              <details key={key} open={index === 0}>
                <summary>{copy.faq.items[key].q}</summary>
                <p>{copy.faq.items[key].a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-label={t('closing.label')} className="oc-close rounded-top" id="manifesto">
        <div aria-hidden className="oc-close-bg">
          <img alt="" decoding="async" src={`${IMG}/closing.png`} />
        </div>
        <div className="oc-close-inner">
          <span className="oc-eyebrow">{t('closing.eyebrow')}</span>
          <h2>{t('closing.heading')}</h2>
          <p>{t('closing.body')}</p>
          <div className="oc-close-cta">
            <a className="oc-btn oc-btn-soft" href={shopHref}>
              {t('closing.shop')}
            </a>
            <a
              className="oc-btn oc-btn-ghost"
              href="#subscriptions"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              {t('closing.subscribe')}
            </a>
            {hasKits ? (
              <a
                className="oc-btn oc-btn-ghost"
                href="#build-your-kit"
                style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
              >
                {t('closing.kits')}
              </a>
            ) : null}
            <a
              className="oc-btn oc-btn-ghost"
              href="#where-are-you"
              style={{ borderColor: 'rgba(255,255,255,0.4)', color: '#fff' }}
            >
              {t('closing.chapter')}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
