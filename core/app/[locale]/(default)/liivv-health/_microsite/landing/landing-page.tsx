/* Twin of ostomy-care/ostomy-care-page.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

import { useLocale } from 'next-intl';
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

import { HashTargetScroll } from '../../ostomy-care/_components/hash-target-scroll';
import { SpecialistContact } from '../_components/specialist-contact';
import { localeHref } from '../chapters/hrefs';
import { useSite, useSiteMessages, useSiteT } from '../site-context';

import { LandingGovernance, SourceLine } from './landing-furniture';
import { linkParts } from './links';
import type { LandingFaq, LandingItem, LandingSetup } from './types';

/*
 * =============================================================================
 * A CARE SITE'S LANDING PAGE
 * =============================================================================
 * Ostomy's landing, with what was Ostomy's own handed in by the site: its
 * structure as data (./types.ts, built by the site's route from its
 * landing-meta.ts), its words from `<ns>.ui.landingPage` through the
 * SiteProvider, and its look from the site's own stylesheet, which every class
 * here is prefixed for (`classPrefix`) and which the site's wrapper imports.
 *
 * Every word on the page is in the message tree; what is left in this file is
 * structure: ids, hrefs, image paths, and the order things come in. The ids
 * are what the page filters and keys on and are never rendered.
 *
 * Differences from Ostomy's, each because the copy record asked for it:
 *   - no "Ways in" list: the situation doors (a server slot, as Ostomy's C13)
 *     and the chapter rail are the ways in;
 *   - a "which type?" row of chips and a fact band, each fact and the chips'
 *     intro naming the published sources it rests on;
 *   - the care band has two panels (the site's specialist service, and the
 *     existing pharmacist chat) above Olivia;
 *   - each answer lists its sources, and may link a phrase of its own words;
 *   - the page ends with a governance block: the commercial disclosure, the
 *     machine-translation notice on /fr, and every source the page names;
 *   - the kit walkthrough is not drawn: its tray and search lines are
 *     written from an approved kit's contents, which no site has given yet.
 *
 * There are no testimonials and no unsourced numbers on this page. An invented
 * reader is not a safe way to say anything on a health page, and a number
 * nobody can check is not a fact.
 * =============================================================================
 */

/* The rotating word after the heading's lead. Keys into `hero.words`. */
const HERO_WORD_KEYS = ['1', '2', '3', '4', '5'] as const;

/* The subscription band's three features. Keys into `subscribe.features`. */
const SUBSCRIBE_FEATURE_KEYS = ['1', '2', '3'] as const;

/* The four lines under the brand row. Keys into `brands.points`. */
const BRAND_POINT_KEYS = ['1', '2', '3', '4'] as const;

/* How many products a shop room shows before "Open the full shop". */
const SHELF_SIZE = 12;

/*
 * A catalog path ("/one-touch-verio-test-strips/") in the page locale, without
 * the trailing slash that costs a redirect: /fr readers stay on /fr, as
 * Ostomy's shop strip does.
 */
function productHref(path: string, locale: string) {
  return localeHref(path.replace(/(.)\/$/, '$1'), locale);
}

/*
 * A line a shop room prints once above its products, where the site words one
 * (`shop.roomNotes`): Diabetes Care's insulin room carries the Quebec line.
 */
function RoomNote({ className, room }: { className: string; room: string }) {
  const shop = useSiteMessages().ui.landingPage.shop;
  const notes: Record<string, string | undefined> = 'roomNotes' in shop ? shop.roomNotes : {};
  const note = notes[room];

  return note ? <p className={className}>{note}</p> : null;
}

function hasDisplayPrice(priceLabel?: string) {
  const match = priceLabel?.match(/(\d+(?:[.,]\d+)?)/);

  if (!match?.[1]) return false;

  const amount = Number(match[1].replace(',', '.'));

  return amount > 0;
}

/*
 * className separators here are the space before each `${`, never a space
 * inside the interpolated string: prettier-plugin-tailwindcss normalises class
 * strings and strips a leading space inside one (Ostomy's twin says how that
 * once broke the carousel and the shop filter).
 */
function slideDirectionClass(offset: number, shift: number) {
  if (offset < shift) return 'is-prev';
  if (offset > shift) return 'is-next';

  return '';
}

function KitsCarousel({
  kits,
  initialId,
  k,
}: {
  kits: LandingItem[];
  initialId?: number | null;
  k: (name: string) => string;
}) {
  const t = useSiteT('ui.landingPage.kits');
  const locale = useLocale();
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

  /* The five slides around the active one. Never empty: count > 0 here. */
  const slots = [-2, -1, 0, 1, 2].flatMap((offset) => {
    const kit = kits[(active + offset + count) % count];

    return kit ? [{ kit, offset }] : [];
  });

  const renderFeature = (kit: LandingItem, offset: number) => {
    const isFeatured = kit.entityId === initialId;
    const isCenter = offset === shift;
    const body = (
      <>
        <div className={k('pack-feature-media')}>
          {kit.image ? (
            <img alt={isCenter ? kit.image.alt : ''} src={kit.image.src} />
          ) : (
            <div aria-hidden className={k('shelf-fallback')} />
          )}
        </div>
        <div className={k('pack-feature-copy')}>
          <span className={k('pack-badge')}>
            {isFeatured ? t('featuredBadge') : t('customBadge')}
          </span>
          <h3>{kit.name}</h3>
          {hasDisplayPrice(kit.priceLabel) ? (
            <p className={k('pack-price')}>{kit.priceLabel}</p>
          ) : (
            <p className={`${k('pack-price')} ${k('pack-price--spacer')}`}>&nbsp;</p>
          )}
          <p>{isFeatured ? t('featuredBody') : t('cardBody')}</p>
          {isCenter && shift === 0 ? (
            <a className={`${k('btn')} ${k('btn-solid')}`} href={productHref(kit.path, locale)}>
              {t('cta')}
            </a>
          ) : (
            <span className={`${k('btn')} ${k('btn-solid')} ${k('pack-feature-cta-ghost')}`}>
              {t('cta')}
            </span>
          )}
        </div>
      </>
    );

    if (isCenter && shift === 0) {
      return (
        <article
          aria-current="true"
          className={`${k('pack-feature')} ${k('kits-carousel-slide')} is-center`}
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
        className={`${k('pack-feature')} ${k('kits-carousel-slide')} ${
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
    <div className={k('kits-carousel')}>
      <p className={k('kits-carousel-count')}>
        {t('count', { active: String(active + 1), count: String(count) })}
      </p>

      <div className={k('kits-carousel-frame')}>
        {count > 1 ? (
          <button
            aria-label={t('previous')}
            className={`${k('kits-carousel-btn')} is-prev`}
            onClick={() => go(-1)}
            type="button"
          >
            ←
          </button>
        ) : null}

        <div
          aria-label={t('carouselLabel')}
          aria-roledescription="carousel"
          className={k('kits-carousel-viewport')}
          ref={viewportRef}
        >
          <div
            className={`${k('kits-carousel-track')} ${instant ? 'is-instant' : ''}`}
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
            className={`${k('kits-carousel-btn')} is-next`}
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
 * An answer, with its linked phrases. A phrase whose target is not live yet
 * (null) is plain text, so the sentence reads the same either way.
 */
function Answer({ text, faq }: { text: string; faq: LandingFaq }) {
  return (
    <>
      {linkParts(text).map((part, index) => {
        const href = part.link === undefined ? null : faq.links[part.link];

        if (!href) return part.text;

        const outward = href.startsWith('https://');

        return (
          <a
            href={href}
            key={index}
            {...(outward ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
          >
            {part.text}
          </a>
        );
      })}
    </>
  );
}

/*
 * `doors` is rendered on the server by the site's route and passed in as a
 * slot (./situation-doors.tsx), above every shop surface on the page.
 */
export function LandingPage({ setup, doors }: { setup: LandingSetup; doors?: ReactNode }) {
  const t = useSiteT('ui.landingPage');
  const chapterT = useSiteT('ui.chapter');
  const locale = useLocale();
  const { contact } = useSite();
  /*
   * The numbered lists, and anything keyed by a structural id, are read off
   * the messages object rather than through `t()`: a key built at runtime is
   * not a literal, and every one of these is a plain sentence with nothing to
   * interpolate. `t()` is used wherever the key is fixed.
   *
   * The chips and the fact band are read through `in`, because a site's
   * landing that has neither (Ostomy's, today) has no such keys.
   */
  const copy = useSiteMessages().ui.landingPage;
  const trust: Record<string, string | undefined> = copy.trust.items;
  const chips: Record<string, string | undefined> = 'types' in copy ? copy.types.chips : {};
  const hints: Record<string, string | undefined> = 'types' in copy ? copy.types.hints : {};
  const facts: Record<string, { value: string; label: string } | undefined> =
    'facts' in copy ? copy.facts.items : {};
  const rooms: Record<string, string | undefined> = copy.shop.rooms;
  const faqs: Record<string, { q: string; a: string } | undefined> = copy.faq.items;

  const k = (name: string) => `${setup.classPrefix}${name}`;
  const { images, kits, products, shopAnchor } = setup;
  const shopHref = setup.shopHref;

  const [shopRoom, setShopRoom] = useState('all');

  const featuredKit = kits.find((kit) => kit.entityId === setup.featuredKitId) ?? kits[0] ?? null;
  /*
   * Kits are allowlisted by the site. With none listed, this page has to read
   * well anyway, so everything that points at #build-your-kit goes with the
   * section: the hero's second button, the "Kits" shop room and the closing
   * link. A heading with nothing under it, or a link to an anchor that is not
   * on the page, would be worse than no kits at all.
   */
  const hasKits = kits.length > 0;
  const hasShop = products.length > 0 || hasKits;
  const shopRooms = hasKits ? setup.shopRooms : setup.shopRooms.filter((room) => room !== 'kits');

  const filteredShop = useMemo(() => {
    if (shopRoom === 'kits') return kits.slice(0, SHELF_SIZE);
    if (shopRoom === 'all') return products.slice(0, SHELF_SIZE);

    return products.filter((product) => product.room === shopRoom).slice(0, SHELF_SIZE);
  }, [kits, products, shopRoom]);

  const ghostLight = { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' };

  return (
    <div id={setup.rootId}>
      {/* Chapters link back here by fragment; see the file. */}
      <HashTargetScroll />
      <section aria-label={t('hero.label')} className={k('hero')}>
        <div className={k('hero-stage')}>
          <div aria-hidden className={k('hero-glow')}>
            <span />
            <span />
          </div>

          <div className={k('hero-copy')}>
            {setup.frDraft ? <p className={k('fr-draft')}>{chapterT('frDraft')}</p> : null}
            <span className={k('hero-kicker')}>
              <i />
              {t('hero.kicker')}
            </span>
            <h1>
              {t('hero.headingLead')}{' '}
              <RotatingHeroWord
                className={k('hero-word')}
                words={HERO_WORD_KEYS.map((key) => copy.hero.words[key])}
              />
            </h1>
            <p>{t('hero.body')}</p>
            <div className={k('hero-actions')}>
              <a className={k('hero-cta')} href="#where-are-you">
                {t('hero.cta')}
              </a>
              {/* Never a link to an anchor that is not on the page. */}
              {hasKits ? (
                <a className={k('hero-cta-ghost')} href="#build-your-kit">
                  {t('hero.kitsCta')}
                </a>
              ) : null}
              {!hasKits && hasShop ? (
                <a className={k('hero-cta-ghost')} href={`#${shopAnchor}`}>
                  {t('hero.shopCta')}
                </a>
              ) : null}
            </div>
          </div>

          <div aria-hidden className={k('hero-media')}>
            <HeroLoopVideo
              className={k('hero-video')}
              poster={images.heroPoster}
              src={images.heroVideo}
            />
            <div className={k('hero-veil')} />
          </div>
        </div>
      </section>

      <section aria-label={t('trust.label')} className={k('trust')}>
        <div className={k('trust-track')}>
          {setup.trustKeys.map((key) => (trust[key] ? <span key={key}>{trust[key]}</span> : null))}
        </div>
      </section>

      {doors}

      {setup.chips.length ? (
        <section
          aria-labelledby={k('types-heading')}
          className={`${k('types')} rounded-top`}
          id="which-diabetes"
        >
          <div className={k('wrap')}>
            <header className={k('types-head')}>
              <span className={k('eyebrow')}>{t('types.eyebrow')}</span>
              <h2 id={k('types-heading')}>{t('types.heading')}</h2>
              <p>{t('types.body')}</p>
              <SourceLine
                className={k('source-line')}
                label={t('facts.sourcesLabel')}
                sources={setup.typesSources}
              />
            </header>
            <ul aria-label={t('types.label')} className={k('chip-list')}>
              {setup.chips.map((chip) =>
                chips[chip.id] ? (
                  <li key={chip.id}>
                    <a className={k('chip')} href={chip.href}>
                      <b>{chips[chip.id]}</b>
                      {hints[chip.id] ? <span>{hints[chip.id]}</span> : null}
                    </a>
                  </li>
                ) : null,
              )}
            </ul>
          </div>
        </section>
      ) : null}

      <section aria-label={t('facts.label')} className={`${k('facts')} rounded-top`} id="facts">
        <div className={k('wrap')}>
          <header className={k('facts-head')}>
            <span className={k('eyebrow')}>{t('facts.eyebrow')}</span>
            <h2>{t('facts.heading')}</h2>
          </header>
          <div className={k('facts-grid')}>
            {setup.facts.map((fact) => {
              const text = facts[fact.key];

              if (!text) return null;

              return (
                <article className={k('fact')} key={fact.key}>
                  <strong>{text.value}</strong>
                  <span>{text.label}</span>
                  <SourceLine
                    className={k('source-line')}
                    label={t('facts.sourcesLabel')}
                    sources={fact.sources}
                  />
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {hasKits ? (
        <section
          aria-label={t('kits.label')}
          className={`${k('packs')} rounded-top`}
          id="build-your-kit"
        >
          <div className={k('wrap')}>
            <header className={k('packs-head')}>
              <span className={k('eyebrow')}>{t('kits.eyebrow')}</span>
              <h2>{t('kits.heading')}</h2>
              <p>{t('kits.body')}</p>
            </header>

            <KitsCarousel initialId={featuredKit?.entityId} k={k} kits={kits} />
          </div>
        </section>
      ) : null}

      {hasShop ? (
        <section
          aria-label={t('shop.label')}
          className={`${k('shop')} rounded-top`}
          id={shopAnchor}
        >
          <div className={k('wrap')}>
            <div className={k('shop-head')}>
              <div>
                <span className={k('eyebrow')}>{t('shop.eyebrow')}</span>
                <h2>{t('shop.heading')}</h2>
                <p>{t('shop.body')}</p>
              </div>
              <a className={`${k('btn')} ${k('btn-solid')}`} href={shopHref}>
                {t('shop.openShop')}
              </a>
            </div>

            <div aria-label={t('shop.filtersLabel')} className={k('filters')} role="tablist">
              {shopRooms.map((room) => (
                <button
                  aria-selected={shopRoom === room}
                  className={`${k('filter')} ${shopRoom === room ? 'is-active' : ''}`}
                  key={room}
                  onClick={() => setShopRoom(room)}
                  role="tab"
                  type="button"
                >
                  {rooms[room] ?? room}
                </button>
              ))}
            </div>

            <RoomNote className={k('shop-room-note')} room={shopRoom} />

            <div className={k('product-grid')}>
              {filteredShop.map((product) => (
                <a
                  className={k('product')}
                  href={productHref(product.path, locale)}
                  key={product.entityId}
                >
                  <div className={k('product-media')}>
                    {product.image ? (
                      <img alt={product.image.alt} src={product.image.src} />
                    ) : (
                      <div aria-hidden className={k('shelf-fallback')} />
                    )}
                  </div>
                  <div className={k('product-meta')}>
                    {product.isKit ? (
                      <span className={k('product-badge')}>{t('shop.kitBadge')}</span>
                    ) : null}
                    <h3>{product.name}</h3>
                    {/* The site's notice for an item a pharmacist reviews before it ships. */}
                    {product.reviewNotice ? (
                      <p className={k('product-notice')}>{t('shop.reviewNotice')}</p>
                    ) : null}
                    {hasDisplayPrice(product.priceLabel) ? (
                      <p className={k('product-price')}>{product.priceLabel}</p>
                    ) : null}
                  </div>
                </a>
              ))}
            </div>

            {filteredShop.length === 0 ? (
              <p className={k('shop-empty')}>{t('shop.empty')}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      <SpecializedSubscribe
        className={`${k('subs')} rounded-top`}
        demoProductBlurb={t('subscribe.demoBlurb')}
        demoProductName={t('subscribe.demoName')}
        demoProductPath={setup.subscribeDemoPath}
        eyebrow={t('subscribe.eyebrow')}
        features={SUBSCRIBE_FEATURE_KEYS.map((key) => copy.subscribe.features[key])}
        lead={t('subscribe.lead')}
        manageHref={localeHref('/account/subscriptions', locale)}
        manageLabel={t('subscribe.manageLabel')}
        primaryCtaClass={`${k('btn')} ${k('btn-solid')}`}
        secondaryCtaClass={`${k('btn')} ${k('btn-ghost')}`}
        shopHref={shopHref}
        shopLabel={t('subscribe.shopLabel')}
        title={t('subscribe.title')}
        wrapClassName={k('wrap')}
      />

      <section
        aria-label={t('chapters.label')}
        className={`${k('journey')} rounded-top`}
        id="where-are-you"
      >
        <div className={k('wrap')}>
          <header className={k('journey-head')}>
            <span className={k('eyebrow')}>{t('chapters.eyebrow')}</span>
            <h2>{t('chapters.heading')}</h2>
            <p>
              {t('chapters.body')}
              {hasShop ? (
                <>
                  {' '}
                  {t('chapters.skipPrompt')} <a href={`#${shopAnchor}`}>{t('chapters.skipLink')}</a>
                  .
                </>
              ) : null}
            </p>
          </header>
          <div className={k('journey-rail')}>
            {setup.chapters.map((item) => (
              <a className={k('journey-card')} href={item.href} key={item.slug}>
                <div className={k('journey-thumb')}>
                  <img alt="" src={item.image} />
                </div>
                <div className={k('journey-body')}>
                  <span className={k('journey-step')}>
                    {t('chapters.chapterWord', { word: item.word })}
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.blurb}</p>
                  <span className={k('journey-go')}>{t('chapters.open')}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section aria-label={t('care.label')} className={`${k('care')} rounded-top`} id="care">
        <div className={k('wrap')}>
          <div className={k('care-panel')}>
            <div className={k('care-visual')}>
              <img alt="" src={images.care} />
            </div>
            <div className={k('care-copy')}>
              <span className={k('eyebrow')}>{t('care.cde.eyebrow')}</span>
              <h2>{t('care.cde.heading')}</h2>
              <p>{t('care.cde.body')}</p>
              {/* Only once the request page can take this request; never a phone number. */}
              {setup.cdeRequestHref ? (
                <p className={k('care-cta')}>
                  <a className={`${k('btn')} ${k('btn-soft')}`} href={setup.cdeRequestHref}>
                    {t('care.cde.cta')}
                  </a>{' '}
                  <span className={k('care-cta-note')}>{t('care.cde.ctaNote')}</span>
                </p>
              ) : null}
            </div>
          </div>
          {/*
           * The second panel: how to reach the site's specialist service. Its
           * direct contact (SiteContact) where the site has one, then the
           * existing chat, which stays the secondary way in.
           */}
          <div className={k('care-chat')}>
            <span className={k('eyebrow')}>{t('care.chat.eyebrow')}</span>
            <h3>{t('care.chat.heading')}</h3>
            <p>{t('care.chat.body')}</p>
            {contact ? <SpecialistContact tone="light" /> : null}
            <a className={`${k('btn')} ${k('btn-ghost')}`} href={setup.chatHref}>
              {t('care.chat.cta')}
            </a>
          </div>
          <div className={k('olivia-band')}>
            {/*
             * Every string, not just the two: the kicker, the button, the
             * bubble, the ghost link and the note would otherwise fall back to
             * the component's English defaults on /fr. Olivia helps with
             * orders and restocks; which supply fits is a question for the
             * site's specialist, so she is not offered for it.
             */}
            <OliviaHelpBand
              body={t('care.oliviaBody')}
              bubble={t('care.oliviaBubble')}
              ctaLabel={t('care.oliviaCta')}
              kicker={t('care.oliviaKicker')}
              moreHref={localeHref('/#olivia', locale)}
              moreLabel={t('care.oliviaMore')}
              note={t('care.oliviaNote')}
              title={t('care.oliviaTitle')}
            />
          </div>
        </div>
      </section>

      <section aria-label={t('brands.label')} className={`${k('brands')} rounded-top`} id="brands">
        <div className={k('wrap')}>
          <div className={k('brands-inner')}>
            <span className={k('eyebrow')}>{t('brands.eyebrow')}</span>
            <h2>{t('brands.heading')}</h2>
            <p>{t('brands.body')}</p>
            {/*
             * A maker's logo where the site has a file it may show, its name
             * as text otherwise, both in the same pill. The logo's alt text is
             * the maker's name.
             */}
            <div className={k('brand-row')}>
              {setup.brands.map((brand) =>
                brand.logo ? (
                  <span className={`${k('brand-pill')} ${k('brand-logo')}`} key={brand.name}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- a small static logo file, shown at its own size */}
                    <img alt={brand.name} decoding="async" loading="lazy" src={brand.logo} />
                  </span>
                ) : (
                  <span className={k('brand-pill')} key={brand.name}>
                    {brand.name}
                  </span>
                ),
              )}
            </div>
            <ul className={k('brand-points')}>
              {BRAND_POINT_KEYS.map((key) => (
                <li key={key}>{copy.brands.points[key]}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-label={t('faq.label')} className={`${k('faq')} rounded-top`} id="faq">
        <div className={k('wrap')}>
          <div className={k('faq-panel')}>
            <h2>{t('faq.heading')}</h2>
            <p>{t('faq.note')}</p>
            {/* The first question is open; the rest are closed. */}
            {setup.faqs.map((faq, index) => {
              const item = faqs[faq.key];

              if (!item) return null;

              return (
                <details key={faq.key} open={index === 0}>
                  <summary>{item.q}</summary>
                  <p>
                    <Answer faq={faq} text={item.a} />
                  </p>
                  <SourceLine
                    className={k('source-line')}
                    label={t('facts.sourcesLabel')}
                    sources={faq.sources}
                  />
                </details>
              );
            })}
          </div>
        </div>
      </section>

      <section
        aria-label={t('closing.label')}
        className={`${k('close')} rounded-top`}
        id="manifesto"
      >
        <div aria-hidden className={k('close-bg')}>
          <img alt="" decoding="async" src={images.closing} />
        </div>
        <div className={k('close-inner')}>
          <span className={k('eyebrow')}>{t('closing.eyebrow')}</span>
          <h2>{t('closing.heading')}</h2>
          <p>{t('closing.body')}</p>
          <div className={k('close-cta')}>
            <a className={`${k('btn')} ${k('btn-soft')}`} href={shopHref}>
              {t('closing.shop')}
            </a>
            <a className={`${k('btn')} ${k('btn-ghost')}`} href="#subscriptions" style={ghostLight}>
              {t('closing.subscribe')}
            </a>
            {hasKits ? (
              <a
                className={`${k('btn')} ${k('btn-ghost')}`}
                href="#build-your-kit"
                style={ghostLight}
              >
                {t('closing.kits')}
              </a>
            ) : null}
            <a className={`${k('btn')} ${k('btn-ghost')}`} href="#where-are-you" style={ghostLight}>
              {t('closing.chapter')}
            </a>
          </div>
        </div>
      </section>

      <LandingGovernance classPrefix={setup.classPrefix} sources={setup.pageSources} />
    </div>
  );
}
