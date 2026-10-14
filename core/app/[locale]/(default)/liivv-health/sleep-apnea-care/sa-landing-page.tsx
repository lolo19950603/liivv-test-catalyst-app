'use client';

/*
 * =============================================================================
 * SLEEP APNEA CARE LANDING
 * =============================================================================
 * Sleep's own landing (spec 1.1): the engine's LandingPage is Diabetes-shaped
 * (kits, subscriptions, a CDE panel) and Sleep has none of those. It reuses
 * the engine's pieces instead: the situation doors (a server slot,
 * ./sa-situation-doors.tsx), the source lines and governance block
 * (../_microsite/landing/landing-furniture.tsx), the linked-phrase reader
 * (../_microsite/landing/links.ts), the Olivia band and the hash scroll.
 *
 * Render order (landing.md A): hero, trust strip, doors, "Which therapy?",
 * fact band, shelf, six-chapter rail, care band, FAQs, closing, governance.
 * Not drawn: the subscription band (held, E2) and the brand strip (held
 * until `brandsReady`). The hero is the static heading while `heroRotating`
 * is off (D12).
 *
 * Every word is in `SleepApneaCare.ui.landingPage`; this file is structure.
 * Every fact names its sources in the element (owner note 1): the hero's
 * prescriber line, the therapy intro and each chip's hint, each fact, the
 * settings notice and the magnet warning, the care panel and each answer.
 * No machine is sold, linked or shown (N1); a complete mask's tile links its
 * product page, where the CPAP prescription check is (C26).
 * =============================================================================
 */

import { useLocale, useMessages, useTranslations } from 'next-intl';
import { type ReactNode, useMemo, useState } from 'react';

import { OliviaHelpBand } from '~/components/olivia/olivia-help-band';

import { SourceChip } from '../_microsite/_components/source-chip';
import { localeHref } from '../_microsite/chapters/hrefs';
import { LandingGovernance, SourceLine } from '../_microsite/landing/landing-furniture';
import { linkParts } from '../_microsite/landing/links';
import type { LandingFaq } from '../_microsite/landing/types';
import { SiteProvider } from '../_microsite/site-context';
import { HashTargetScroll } from '../ostomy-care/_components/hash-target-scroll';

import { SLEEP_SITE } from './chapters/site';
import type { SaLandingItem, SaLandingSetup } from './sa-landing-types';

import './sleep-apnea-care.css';

/* How many products a shop room shows before "Open the full shop". */
const SHELF_SIZE = 12;

const k = (name: string) => `sa-${name}`;

/* A catalogue path in the page locale, without the trailing slash that costs a redirect. */
function productHref(path: string, locale: string) {
  return localeHref(path.replace(/(.)\/$/, '$1'), locale);
}

function hasDisplayPrice(priceLabel?: string) {
  const match = priceLabel?.match(/(\d+(?:[.,]\d+)?)/);

  if (!match?.[1]) return false;

  return Number(match[1].replace(',', '.')) > 0;
}

/* `{name}` placeholders filled from `values`, the rest emptied, and the spaces left behind closed up. */
function fill(text: string, values: Record<string, string>) {
  return text
    .replace(/\{(\w+)\}/g, (_, name: string) => values[name] ?? '')
    .replace(/ {2,}/g, ' ')
    .trim();
}

function useLandingCopy() {
  return useMessages().SleepApneaCare.ui.landingPage;
}

/* An answer with its linked phrases. A phrase whose target is not live is plain text. */
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

function Hero({ setup, hasShop }: { setup: SaLandingSetup; hasShop: boolean }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.hero');
  const chapterT = useTranslations('SleepApneaCare.ui.chapter');

  return (
    <section aria-label={t('label')} className={k('hero')}>
      <div className={k('hero-stage')}>
        <div aria-hidden className={k('hero-glow')}>
          <span />
          <span />
        </div>
        <div className={k('hero-copy')}>
          {setup.frDraft ? <p className={k('fr-draft')}>{chapterT('frDraft')}</p> : null}
          <span className={k('hero-kicker')}>
            <i />
            {t('kicker')}
          </span>
          <h1>{t('heading')}</h1>
          <p>{t('body')}</p>
          <SourceLine className={k('source-line')} sources={setup.heroSources} />
          <div className={k('hero-actions')}>
            <a className={k('hero-cta')} href="#where-are-you">
              {t('cta')}
            </a>
            {hasShop ? (
              <a className={k('hero-cta-ghost')} href={`#${setup.shopAnchor}`}>
                {t('shopCta')}
              </a>
            ) : null}
          </div>
        </div>
        <div aria-hidden className={k('hero-media')}>
          <img alt="" decoding="async" src={setup.images.hero} />
          <div className={k('hero-veil')} />
        </div>
      </div>
    </section>
  );
}

function TrustStrip({ keys }: { keys: string[] }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.trust');
  const items: Record<string, string | undefined> = useLandingCopy().trust.items;

  return (
    <section aria-label={t('label')} className={k('trust')}>
      <div className={k('trust-track')}>
        {keys.map((key) => (items[key] ? <span key={key}>{items[key]}</span> : null))}
      </div>
    </section>
  );
}

function Therapies({ setup }: { setup: SaLandingSetup }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.therapies');
  const copy = useLandingCopy().therapies;
  const chips: Record<string, string | undefined> = copy.chips;
  const hints: Record<string, string | undefined> = copy.hints;

  if (!setup.chips.length) return null;

  return (
    <section
      aria-labelledby={k('types-heading')}
      className={`${k('types')} rounded-top`}
      id="which-therapy"
    >
      <div className={k('wrap')}>
        <header className={k('types-head')}>
          <span className={k('eyebrow')}>{t('eyebrow')}</span>
          <h2 id={k('types-heading')}>{t('heading')}</h2>
          <p>{t('body')}</p>
          <SourceLine className={k('source-line')} sources={setup.therapiesSources} />
        </header>
        <ul aria-label={t('label')} className={k('chip-list')}>
          {setup.chips.map((chip) =>
            chips[chip.id] ? (
              <li className={k('chip-item')} key={chip.id}>
                <a className={k('chip')} href={chip.href}>
                  <b>{chips[chip.id]}</b>
                  {hints[chip.id] ? <span>{hints[chip.id]}</span> : null}
                </a>
                <SourceChip
                  className={k('chip-sources')}
                  label={chips[chip.id]}
                  sources={chip.sources}
                />
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </section>
  );
}

function Facts({ setup }: { setup: SaLandingSetup }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.facts');
  const items: Record<string, { value: string; label: string } | undefined> =
    useLandingCopy().facts.items;

  return (
    <section aria-label={t('label')} className={`${k('facts')} rounded-top`} id="facts">
      <div className={k('wrap')}>
        <header className={k('facts-head')}>
          <span className={k('eyebrow')}>{t('eyebrow')}</span>
          <h2>{t('heading')}</h2>
        </header>
        <div className={k('facts-grid')}>
          {setup.facts.map((fact) => {
            const text = items[fact.key];

            return text ? (
              <article className={k('fact')} key={fact.key}>
                <strong>{text.value}</strong>
                <span>{text.label}</span>
                <SourceLine className={k('source-line')} sources={fact.sources} />
              </article>
            ) : null;
          })}
        </div>
      </div>
    </section>
  );
}

/* The settings notice and the magnet warning: always above the grid (shelf rules 5 and 9). */
function ShopNotices({ setup }: { setup: SaLandingSetup }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.shop');

  return (
    <div className={k('shop-notices')}>
      <div className={k('shop-settings')} role="note">
        <p>{t('settingsNotice')}</p>
        <SourceLine className={k('source-line')} sources={setup.shop.settingsSources} />
      </div>
      <div className={k('shop-magnets')} role="note">
        <h3>{t('magnetWarning.heading')}</h3>
        <p>
          {t('magnetWarning.body')} <a href={setup.shop.magnetHref}>{t('magnetWarning.link')}</a>
        </p>
        <SourceLine className={k('source-line')} sources={setup.shop.magnetSources} />
      </div>
    </div>
  );
}

function ProductTile({ product, rxMaskLine }: { product: SaLandingItem; rxMaskLine: boolean }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.shop.badges');
  const locale = useLocale();

  return (
    <a className={k('product')} href={productHref(product.path, locale)}>
      <div className={k('product-media')}>
        {product.image ? (
          <img alt={product.image.alt} loading="lazy" src={product.image.src} />
        ) : (
          <div aria-hidden className={k('shelf-fallback')} />
        )}
      </div>
      <div className={k('product-meta')}>
        <h3>{product.name}</h3>
        {product.rxMask && rxMaskLine ? (
          <span className={k('product-badge')}>{t('prescription')}</span>
        ) : null}
        {product.magnetNotice ? <p className={k('product-notice')}>{t('magnets')}</p> : null}
        {hasDisplayPrice(product.priceLabel) ? (
          <p className={k('product-price')}>{product.priceLabel}</p>
        ) : null}
      </div>
    </a>
  );
}

function Shop({ setup }: { setup: SaLandingSetup }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.shop');
  const shop = useLandingCopy().shop;
  const rooms: Record<string, string | undefined> = shop.rooms;
  const [room, setRoom] = useState('all');
  const products = setup.products;
  const shown = useMemo(
    () =>
      (room === 'all' ? products : products.filter((product) => product.room === room)).slice(
        0,
        SHELF_SIZE,
      ),
    [products, room],
  );
  /* `{rxMaskLine}` while the C26 check is live; read through `in`, as it is held otherwise. */
  const rxMaskLine = setup.shop.rxMaskLine && 'rxMaskLine' in shop ? shop.rxMaskLine : '';

  return (
    <section aria-label={t('label')} className={`${k('shop')} rounded-top`} id={setup.shopAnchor}>
      <div className={k('wrap')}>
        <div className={k('shop-head')}>
          <div>
            <span className={k('eyebrow')}>{t('eyebrow')}</span>
            <h2>{t('heading')}</h2>
            <p>{fill(shop.body, { rxMaskLine })}</p>
          </div>
          <a className={`${k('btn')} ${k('btn-solid')}`} href={setup.shopHref}>
            {t('openShop')}
          </a>
        </div>

        <ShopNotices setup={setup} />

        <div aria-label={t('filtersLabel')} className={k('filters')} role="tablist">
          {setup.shopRooms.map((key) => (
            <button
              aria-selected={room === key}
              className={`${k('filter')} ${room === key ? 'is-active' : ''}`}
              key={key}
              onClick={() => setRoom(key)}
              role="tab"
              type="button"
            >
              {rooms[key] ?? key}
            </button>
          ))}
        </div>

        <div className={k('product-grid')}>
          {shown.map((product) => (
            <ProductTile
              key={product.entityId}
              product={product}
              rxMaskLine={setup.shop.rxMaskLine}
            />
          ))}
        </div>

        {shown.length === 0 ? <p className={k('shop-empty')}>{t('empty')}</p> : null}
      </div>
    </section>
  );
}

function ChapterRail({ setup, hasShop }: { setup: SaLandingSetup; hasShop: boolean }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.chapters');

  return (
    <section aria-label={t('label')} className={`${k('journey')} rounded-top`} id="where-are-you">
      <div className={k('wrap')}>
        <header className={k('journey-head')}>
          <span className={k('eyebrow')}>{t('eyebrow')}</span>
          <h2>{t('heading')}</h2>
          <p>
            {t('body')}
            {hasShop ? (
              <>
                {' '}
                {t('skipPrompt')} <a href={`#${setup.shopAnchor}`}>{t('skipLink')}</a>.
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
                <span className={k('journey-step')}>{t('chapterWord', { word: item.word })}</span>
                <h3>{item.title}</h3>
                <p>{item.blurb}</p>
                <span className={k('journey-go')}>{t('open')}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Care({ setup }: { setup: SaLandingSetup }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.care');

  return (
    <section aria-label={t('label')} className={`${k('care')} rounded-top`} id="care">
      <div className={k('wrap')}>
        <div className={k('care-panel')}>
          <div className={k('care-visual')}>
            <img alt="" src={setup.images.care} />
          </div>
          <div className={k('care-copy')}>
            <span className={k('eyebrow')}>{t('sleepTeam.eyebrow')}</span>
            <h2>{t('sleepTeam.heading')}</h2>
            <p>{t('sleepTeam.body')}</p>
            <SourceLine className={k('source-line')} sources={setup.careSources} />
          </div>
        </div>
        <div className={k('olivia-band')}>
          {/*
           * Every string in the page language. Olivia helps with orders and
           * restocks, never with treatment or settings. No "what she can do"
           * link: the Sleep copy words none, so none is shown in English on /fr.
           */}
          <OliviaHelpBand
            body={t('oliviaBody')}
            bubble={t('oliviaBubble')}
            ctaLabel={t('oliviaCta')}
            kicker={t('oliviaKicker')}
            moreHref={null}
            note={t('oliviaNote')}
            title={t('oliviaTitle')}
          />
        </div>
      </div>
    </section>
  );
}

function Faqs({ setup }: { setup: SaLandingSetup }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.faq');
  const items: Record<string, Record<string, string | undefined> | undefined> =
    useLandingCopy().faq.items;

  return (
    <section aria-label={t('label')} className={`${k('faq')} rounded-top`} id="faq">
      <div className={k('wrap')}>
        <div className={k('faq-panel')}>
          <h2>{t('heading')}</h2>
          <p>{t('note')}</p>
          {setup.faqs.map((faq, index) => {
            const item = items[faq.key];

            if (!item?.q || !item.a) return null;

            const values = Object.fromEntries(faq.values.map((name) => [name, item[name] ?? '']));

            return (
              <details key={faq.key} open={index === 0}>
                <summary>{item.q}</summary>
                <p>
                  <Answer faq={faq} text={fill(item.a, values)} />
                </p>
                <SourceLine className={k('source-line')} sources={faq.sources} />
              </details>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Closing({ setup }: { setup: SaLandingSetup }) {
  const t = useTranslations('SleepApneaCare.ui.landingPage.closing');
  const ghostLight = { borderColor: 'rgba(255,255,255,0.4)', color: '#fff' };

  return (
    <section aria-label={t('label')} className={`${k('close')} rounded-top`} id="manifesto">
      <div aria-hidden className={k('close-bg')}>
        <img alt="" decoding="async" src={setup.images.closing} />
      </div>
      <div className={k('close-inner')}>
        <span className={k('eyebrow')}>{t('eyebrow')}</span>
        <h2>{t('heading')}</h2>
        <p>{t('body')}</p>
        <div className={k('close-cta')}>
          <a className={`${k('btn')} ${k('btn-soft')}`} href={setup.shopHref}>
            {t('shop')}
          </a>
          <a className={`${k('btn')} ${k('btn-ghost')}`} href="#where-are-you" style={ghostLight}>
            {t('chapter')}
          </a>
        </div>
      </div>
    </section>
  );
}

function SaLanding({ setup, doors }: { setup: SaLandingSetup; doors?: ReactNode }) {
  const hasShop = setup.products.length > 0;

  return (
    <div id={setup.rootId}>
      {/* Chapters link back here by fragment. */}
      <HashTargetScroll />
      <Hero hasShop={hasShop} setup={setup} />
      <TrustStrip keys={setup.trustKeys} />
      {doors}
      <Therapies setup={setup} />
      <Facts setup={setup} />
      {hasShop ? <Shop setup={setup} /> : null}
      <ChapterRail hasShop={hasShop} setup={setup} />
      <Care setup={setup} />
      <Faqs setup={setup} />
      <Closing setup={setup} />
      <LandingGovernance classPrefix={setup.classPrefix} sources={setup.pageSources} />
    </div>
  );
}

/*
 * The site config is imported here, on the client side, so it is never
 * serialised into the page's payload (../_microsite/site.ts says why).
 */
export function SaLandingPage({ setup, doors }: { setup: SaLandingSetup; doors?: ReactNode }) {
  return (
    <SiteProvider value={SLEEP_SITE}>
      <SaLanding doors={doors} setup={setup} />
    </SiteProvider>
  );
}
