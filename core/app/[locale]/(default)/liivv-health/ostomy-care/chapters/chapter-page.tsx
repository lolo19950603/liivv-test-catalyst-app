'use client';

import { useLocale, useMessages, useTranslations } from 'next-intl';
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';

import { HashTargetScroll } from '../_components/hash-target-scroll';
import { DiscoveryBand, GovernanceBlock, HelpBand } from '../_components/page-furniture';
import type { OcCatalogItem } from '../get-oc-catalog';

import { AskChip } from './ask-chip';
import { CardExit, CardShop, RowMore, rowLayout } from './chapter-disclosure';
import {
  type BandLink,
  buildChapters,
  type CategoryCard,
  type Chapter,
  chapterHref,
  getChapterNeighbors,
  LANDING_HREF,
  localeHref,
  type ResourceGroup,
  type UrgentCallout,
} from './chapters-data';
import type { FigureMeta } from './chapters-meta';
import { FrDraftMarker, OutboundLabel } from './figure-parts';
import {
  CardFigures,
  CardRoutes,
  FigureGlyphs,
  isPinnedCard,
  showsChapterExit,
  StartHereLine,
  UrgentExit,
} from './figures';
import type { SupplyItem } from './get-supply-items';
import { ChapterReveal } from './chapter-reveal';
import { JourneyGrid } from './journey-layout';
import { JourneyBandDots, JourneyPath } from './journey-path';
import { RecoveryMap } from './recovery-map';
import { ResourceShelf } from './resource-shelf';

import './chapter-page.css';

/*
 * Ostomy chapter page — soft journal / path layout (not Women's Health chapter chrome).
 *
 * The referral chip (AskChip) lives in ./ask-chip.tsx.
 */

function CategoryRow({
  card,
  index,
  products,
  supplyItems,
  exit,
}: {
  card: CategoryCard;
  index: number;
  /** Unused; kept so older call sites compile. Cards are always fully open. */
  openByDefault?: boolean;
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  exit?: Chapter['urgentExit'];
}) {
  const moreId = useId();
  const { lede, rest, noteOutside, noteInMore } = rowLayout(card);

  return (
    <article className="oc-ch-row is-open" id={`card-${card.number}`}>
      <span aria-hidden className="oc-ch-row-thumb">
        <img alt="" loading="lazy" src={card.image} />
        <b>{String(index + 1).padStart(2, '0')}</b>
      </span>
      <div>
        <h3>
          {card.title}
          {card.badge ? ` · ${card.badge}` : ''}
        </h3>

        {lede ? <p className="oc-ch-lede">{lede}</p> : null}

        <CardFigures card={card} exit={exit} />

        {noteOutside ? <p className="oc-ch-row-note">{card.note}</p> : null}

        <RowMore card={card} id={moreId} noteInMore={noteInMore} rest={rest} />

        <CardRoutes card={card} />

        <CardExit card={card} exit={exit} />

        {card.ask ? (
          <div className="oc-ch-row-foot">
            <AskChip role={card.ask} />
          </div>
        ) : null}

        <CardShop card={card} products={products} supplyItems={supplyItems} visible />
      </div>
    </article>
  );
}

/*
 * Red-flag block. Deliberately its own component with its own styling so it can
 * never be mistaken for an ordinary tip, and `role="alert"` is omitted on purpose
 * — this is standing content, not a live announcement.
 */
function UrgentBlock({ urgent }: { urgent: UrgentCallout }) {
  return (
    <section className="oc-ch-urgent rounded-top" id="red-flags">
      <div className="oc-ch-wrap">
        <aside aria-labelledby="oc-ch-urgent-heading" className="oc-ch-urgent-panel">
          <span aria-hidden className="oc-ch-urgent-mark">
            !
          </span>
          <div>
            <h2 id="oc-ch-urgent-heading">{urgent.heading}</h2>
            <p className="oc-ch-urgent-intro">{urgent.intro}</p>
            <ul>
              {urgent.signs.map((sign, i) => (
                <li key={`${i}-${sign}`}>{sign}</li>
              ))}
            </ul>
            <p className="oc-ch-urgent-action">{urgent.action}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ResourceGroupBlock({ group }: { group: ResourceGroup }) {
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <div className="oc-ch-res-group">
      <header className="oc-ch-care-head">
        <span className="oc-ch-eyebrow">{group.eyebrow}</span>
        <h3>{group.heading}</h3>
        {group.body ? <p>{group.body}</p> : null}
      </header>
      <ul className="oc-ch-res-list">
        {group.links.map((link) => (
          <li key={link.href}>
            <a
              className="oc-ch-res-card"
              href={link.href}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="oc-ch-res-org">{link.org}</span>
              <span className="oc-ch-res-title">
                {link.title}
                {link.note ? <em className="oc-ch-res-note"> · {link.note}</em> : null}
              </span>
              <span className="oc-ch-res-body">{link.body}</span>
              <span aria-hidden className="oc-ch-res-go">
                {t('opensOnTheirSite')}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/*
 * The plain links under a band card (C12).
 *
 * Same tab, `hrefLang` on the anchor, and the language note inside the link
 * text wherever the page it opens is in the other language — the same treatment
 * every other link out of a chapter gets, so one destination is never described
 * two ways. Each link names the publisher, because "ostomy care instructions"
 * on its own says nothing about who wrote them.
 *
 * Nothing wraps them: no card, no thumbnail, no "recommended" styling, and no
 * product anywhere in this band. AboutKidsHealth encourages plain links and
 * prohibits framing and any suggestion of endorsement, and this is a plain link.
 */
function BandLinks({ links }: { links: BandLink[] }) {
  return (
    <>
      <FrDraftMarker gate="childLinks" />
      <ul className="oc-ch-program-links">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} hrefLang={link.hrefLang}>
              <OutboundLabel hrefLang={link.hrefLang} label={link.label} />
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}

/*
 * The band after the cards: short referral or timing cards under one heading.
 *
 * Where it stands in for a module whose French is not yet reviewed it carries
 * the same emergency signpost that module would have shown, so the fallback
 * never drops a line the thing it replaces showed (review-gates.ts). `exit` is
 * therefore passed only when nothing else on the page is showing it — see
 * ChapterBand below.
 */
function ProgramsBand({
  band,
  exit,
}: {
  band: NonNullable<Chapter['programsBand']>;
  exit?: Chapter['urgentExit'];
}) {
  const t = useTranslations('OstomyCare.ui.chapter');

  return (
    <section className="oc-ch-programs rounded-top">
      <div className="oc-ch-wrap">
        {exit ? <UrgentExit exit={exit} /> : null}
        {band.heading ? (
          <header className="oc-ch-care-head oc-journey-meadow-head">
            <ChapterReveal variant="clearing">
              <span className="oc-ch-eyebrow">{t('softMap')}</span>
              <h2>{band.heading}</h2>
            </ChapterReveal>
          </header>
        ) : null}
        <div className="oc-ch-programs-grid">
          {band.cards.map((card, index) => (
            <article className="oc-ch-program" key={card.heading}>
              <span className="oc-ch-program-index">{String(index + 1).padStart(2, '0')}</span>
              <h3>{card.heading}</h3>
              <p>{card.body}</p>
              {card.links ? <BandLinks links={card.links} /> : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/*
 * The band itself. The recovery map takes the slot where the chapter has one;
 * where the map is held or its French is not yet reviewed, the chapter's
 * programs band renders instead, so /fr never loses the timing band.
 *
 * The band is a rescue, not a placement. It is a section about something else —
 * on Chapter 03, four ways provinces pay — and the approved sheets put the
 * emergency signpost inside the module that needs it, never above a funding
 * band. So the band prints the signpost only where no card on the page already
 * does.
 *
 * On Chapter 03 no card ever hands it the job: the fibre clocks carry the
 * blockage signpost on /en, and on /fr in production, where the clocks wait on a
 * review gate, their card prints it in their place (`exitWhenGated` in
 * chapters-meta.ts). The band stays quiet in both locales, which is what the
 * approved sheets ask for.
 *
 * This rule is chapter-wide, so it also changes Chapter 01 on /fr in
 * production, where the recovery map is gated and the band takes its slot: the
 * who-to-ask lanes are not gated and carry the signpost, so the band there now
 * stays quiet where it printed the line before. Nothing urgent is lost — the
 * line at the top of the page and the lanes card both still carry it — and
 * Chapters 02 and 04 are untouched, the one having no band and the other no
 * urgentExit.
 */
function ChapterBand({ chapter }: { chapter: Chapter }) {
  if (chapter.recoveryMap) {
    return <RecoveryMap exit={chapter.urgentExit} map={chapter.recoveryMap} />;
  }

  if (!chapter.programsBand) return null;

  const exit = showsChapterExit(chapter.categories) ? undefined : chapter.urgentExit;

  return <ProgramsBand band={chapter.programsBand} exit={exit} />;
}

/*
 * Everything between the cards and the pharmacist panel: the band slot, then
 * the outward resources shelf (C14) on the chapters that carry one.
 */
function ChapterBandSlot({ chapter }: { chapter: Chapter }) {
  return (
    <>
      <ChapterBand chapter={chapter} />
      {chapter.shelf ? <ResourceShelf shelf={chapter.shelf} /> : null}
    </>
  );
}

/*
 * A card that has to occupy the full row, and that must not wait on a fade:
 * an emergency or interactive module (pinned open), the crisis line, the
 * who-to-ask lanes, or the bowel diagram, whose names sit beside the picture
 * and were written for the full measure. Everything else in a group shares
 * one horizontal row.
 */
const FULL_WIDTH_KINDS: ReadonlySet<FigureMeta['kind']> = new Set([
  'bowelReference',
  'crisis',
  'lanes',
]);

function readsFullWidth(card: CategoryCard) {
  return (
    isPinnedCard(card) ||
    Boolean(card.figures?.some((figure) => FULL_WIDTH_KINDS.has(figure.kind)))
  );
}

type PlacedCard = { card: CategoryCard; index: number };

function groupBands(categories: CategoryCard[]) {
  const bands: { label: string; id: string; cards: PlacedCard[] }[] = [];

  categories.forEach((card, index) => {
    const label = card.group ?? '';
    const last = bands[bands.length - 1];

    if (last && last.label === label) {
      last.cards.push({ card, index });

      return;
    }

    bands.push({
      label,
      id: `oc-group-${bands.length + 1}`,
      cards: [{ card, index }],
    });
  });

  return bands;
}

/* Consecutive shelf cards become one strip. A full-width card breaks the strip. */
function bandChunks(cards: PlacedCard[]) {
  const chunks: { kind: 'full' | 'strip'; items: PlacedCard[] }[] = [];

  cards.forEach((item) => {
    const full = readsFullWidth(item.card);
    const last = chunks[chunks.length - 1];

    if (!full && last?.kind === 'strip') {
      last.items.push(item);

      return;
    }

    chunks.push({ kind: full ? 'full' : 'strip', items: [item] });
  });

  return chunks;
}

function CardStrip({
  items,
  products,
  supplyItems,
  exit,
  label,
}: {
  items: PlacedCard[];
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  exit?: Chapter['urgentExit'];
  label: string;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const viewportRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const count = items.length;

  const sync = useCallback(() => {
    frameRef.current = null;
    const viewport = viewportRef.current;

    if (!viewport) return;

    const left = viewport.getBoundingClientRect().left;
    let nearest = 0;
    let best = Infinity;

    [...viewport.children].forEach((slide, i) => {
      const distance = Math.abs(slide.getBoundingClientRect().left - left);

      if (distance < best) {
        best = distance;
        nearest = i;
      }
    });

    setIndex((current) => (current === nearest ? current : nearest));
  }, []);

  useEffect(
    () => () => {
      if (frameRef.current != null) cancelAnimationFrame(frameRef.current);
    },
    [],
  );

  const go = (next: number) => {
    const viewport = viewportRef.current;
    const slide = viewport?.children[next];

    if (!viewport || !(slide instanceof HTMLElement)) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const delta = slide.getBoundingClientRect().left - viewport.getBoundingClientRect().left;

    viewport.scrollBy({ left: delta, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (count < 2) {
    const only = items[0];

    if (!only) return null;

    return (
      <ChapterReveal>
        <CategoryRow
          card={only.card}
          exit={exit}
          index={only.index}
          openByDefault={false}
          products={products}
          supplyItems={supplyItems}
        />
      </ChapterReveal>
    );
  }

  return (
    <div className="oc-ch-strip">
      <div className="oc-ch-strip-bar">
        <button
          aria-label={t('stripPrev')}
          disabled={index === 0}
          onClick={() => go(index - 1)}
          type="button"
        >
          <span aria-hidden>←</span>
        </button>
        <p className="oc-ch-strip-status">
          {t('stripStatus', { current: String(index + 1), total: String(count) })}
        </p>
        <button
          aria-label={t('stripNext')}
          disabled={index === count - 1}
          onClick={() => go(index + 1)}
          type="button"
        >
          <span aria-hidden>→</span>
        </button>
        <div className="oc-ch-strip-dots">
          {items.map((item, dot) => (
            <button
              aria-current={dot === index ? 'true' : undefined}
              aria-label={item.card.title}
              key={item.card.title}
              onClick={() => go(dot)}
              type="button"
            />
          ))}
        </div>
      </div>
      <div
        aria-label={label || undefined}
        className="oc-ch-strip-viewport"
        onScroll={() => {
          if (frameRef.current != null) return;

          frameRef.current = requestAnimationFrame(sync);
        }}
        ref={viewportRef}
      >
        {items.map((item) => (
          <div className="oc-ch-strip-slide" key={item.card.title}>
            <ChapterReveal>
              <CategoryRow
                card={item.card}
                exit={exit}
                index={item.index}
                openByDefault={false}
                products={products}
                supplyItems={supplyItems}
              />
            </ChapterReveal>
          </div>
        ))}
      </div>
    </div>
  );
}

function BandCards({
  band,
  products,
  supplyItems,
  exit,
  layout = 'strip',
}: {
  band: ReturnType<typeof groupBands>[number];
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  exit?: Chapter['urgentExit'];
  layout?: 'strip' | 'journey';
}) {
  if (layout === 'journey') {
    return (
      <JourneyGrid
        cards={band.cards}
        exit={exit}
        products={products}
        supplyItems={supplyItems}
      />
    );
  }

  return (
    <div className="oc-ch-rows">
      {bandChunks(band.cards).map((chunk, chunkIndex) =>
        chunk.kind === 'full' ? (
          <div className="oc-ch-rows" key={`${band.id}-full-${chunkIndex}`}>
            {chunk.items.map((item) => (
              <CategoryRow
                card={item.card}
                exit={exit}
                index={item.index}
                key={item.card.title}
                openByDefault={false}
                products={products}
                supplyItems={supplyItems}
              />
            ))}
          </div>
        ) : (
          <CardStrip
            exit={exit}
            items={chunk.items}
            key={`${band.id}-strip-${chunkIndex}`}
            label={band.label}
            products={products}
            supplyItems={supplyItems}
          />
        ),
      )}
    </div>
  );
}

/*
 * Every chapter. Each group is a full section: sand, then cream, with the
 * group label as the heading and the cards in the bento. Chapter 01's old
 * intro heading stays unrendered. The other chapters keep that heading and
 * its body in the first band's callout.
 */
function LinkedIntroBody({
  body,
  phrase,
  href,
}: {
  body: string;
  phrase?: string;
  href?: string;
}) {
  if (!phrase || !href) return <p>{body}</p>;

  const at = body.indexOf(phrase);

  if (at < 0) return <p>{body}</p>;

  return (
    <p>
      {body.slice(0, at)}
      <a href={href}>{phrase}</a>
      {body.slice(at + phrase.length)}
    </p>
  );
}

function MajorSections({
  chapter,
  products,
  supplyItems,
}: {
  chapter: Chapter;
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const bands = useMemo(() => groupBands(chapter.categories), [chapter.categories]);
  const labeled = bands.filter((band) => band.label);
  const railed = chapter.rail && labeled.length > 1;
  const showIntroHeading = chapter.slug !== 'new-to-the-journey';
  /* Same card the landing door "just home" opens: First Week Basics. */
  const firstWeek =
    chapter.slug === 'new-to-the-journey'
      ? chapter.categories.find((card) => card.number === 6)
      : undefined;
  const pathBands = labeled.map((band) => ({
    id: band.id,
    label: band.label,
    cards: band.cards,
  }));
  const showPath =
    pathBands.length > 1 || pathBands.some((band) => band.cards.length > 1);
  /* Spine replaces the group rail when the editorial path is on. */
  const showRail = railed && !showPath;

  return (
    <div className="oc-journey-shell">
      {showPath ? <JourneyPath bands={pathBands} /> : null}
      <div className="oc-journey-stream">
        {bands.map((band, index) => (
          <section
            className={index % 2 === 0 ? 'oc-ch-major rounded-top' : 'oc-ch-major is-alt rounded-top'}
            id={index === 0 ? 'chapter-care' : band.id}
            key={band.id}
          >
            <div className="oc-ch-wrap">
              {index === 0 && showRail ? (
                <nav aria-label={t('groupJump')} className="oc-ch-rail">
                  {labeled.map((item, itemIndex) => (
                    <a href={itemIndex === 0 ? '#chapter-care' : `#${item.id}`} key={item.id}>
                      {item.label}
                      <span className="oc-ch-rail-count">{item.cards.length}</span>
                    </a>
                  ))}
                </nav>
              ) : null}
              <header className="oc-ch-major-head oc-journey-gate oc-journey-clearing">
                <ChapterReveal variant="clearing">
                  <span aria-hidden className="oc-journey-clearing-wash" />
                  <span className="oc-journey-gate-num" aria-hidden>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="oc-ch-eyebrow">{t('pathEyebrow')}</span>
                  <h2>{band.label}</h2>
                  {index === 0 ? (
                    <div className="oc-journey-banner oc-journey-banner--wash">
                      {showIntroHeading ? (
                        <h3 className="oc-journey-banner-title">{chapter.categoriesIntro.heading}</h3>
                      ) : null}
                      <LinkedIntroBody
                        body={chapter.categoriesIntro.body}
                        href={firstWeek ? `#card-${firstWeek.number}` : undefined}
                        phrase={firstWeek?.title}
                      />
                    </div>
                  ) : null}
                </ChapterReveal>
                <JourneyBandDots cards={band.cards} label={band.label ?? ''} />
              </header>
              <BandCards
                band={band}
                exit={chapter.urgentExit}
                layout="journey"
                products={products}
                supplyItems={supplyItems}
              />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

/*
 * Groups stay in the page, in order. Vertical scroll moves from one group to
 * the next. Inside a group the shelf cards sit in a horizontal snap row, so a
 * twenty-card chapter is eight short rows rather than one long document.
 *
 * Nothing is filtered off. A deep link to #card-N still resolves, and
 * find-in-page still reaches a collapsed row. The rail is a set of jump links,
 * not a filter and not a sticky spy — a sticky rail fights thumb-scrolling.
 * Emergency and interactive cards stay full width and outside the row.
 */
function GroupRail({
  categories,
  products,
  showRail,
  supplyItems,
  exit,
}: {
  categories: CategoryCard[];
  products: Record<number, OcCatalogItem>;
  showRail: boolean;
  supplyItems?: Promise<SupplyItem[]>;
  exit?: Chapter['urgentExit'];
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const bands = useMemo(() => groupBands(categories), [categories]);
  const labeled = bands.filter((band) => band.label);
  const railed = showRail && labeled.length > 1;

  return (
    <>
      {railed ? (
        <nav aria-label={t('groupJump')} className="oc-ch-rail">
          {labeled.map((band) => (
            <a href={`#${band.id}`} key={band.id}>
              {band.label}
              <span className="oc-ch-rail-count">{band.cards.length}</span>
            </a>
          ))}
        </nav>
      ) : null}

      {bands.map((band) => (
        <section className="oc-ch-band" id={band.label ? band.id : undefined} key={band.id}>
          {band.label ? (
            <ChapterReveal>
              <h3 className="oc-ch-band-heading">{band.label}</h3>
            </ChapterReveal>
          ) : null}
          <BandCards
            band={band}
            exit={exit}
            products={products}
            supplyItems={supplyItems}
          />
        </section>
      ))}
    </>
  );
}

export function ChapterPage({
  slug,
  products = {},
  supplyItems,
}: {
  slug: string;
  products?: Record<number, OcCatalogItem>;
  /*
   * What Liivv can actually add for the supply list, still in flight. The
   * route starts the fetch and does not await it, so the chapter renders
   * without waiting on the catalogue and the optional shop section streams in
   * behind its own boundary.
   */
  supplyItems?: Promise<SupplyItem[]>;
}) {
  // Copy comes from the message tree so it can be translated; the structure it
  // is composed with lives in chapters-meta.ts.
  const messages = useMessages();
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.chapter');
  const chapters = buildChapters(
    messages.OstomyCare.chapters,
    locale,
    messages.OstomyCare.ui.chapter.groups,
  );
  const { prev, next, chapter } = getChapterNeighbors(chapters, slug);

  // The route already 404s on an unknown slug, so this only guards against a
  // chapter present in chapters-meta.ts but absent from the messages.
  if (!chapter) return null;

  /*
   * Every href below goes through `localeHref`: these are plain <a>, so nothing
   * adds the /fr prefix for them and a bare micro-site path lands a French
   * reader on the English page (chapters-data.ts).
   */
  const landingHref = localeHref(LANDING_HREF, locale);
  const nextHref = next
    ? localeHref(chapterHref(next.slug), locale)
    : `${landingHref}#where-are-you`;

  /*
   * The ordinal is structural ('one'..'four' in chapters-meta.ts) but has to
   * read in the page language, or the French kicker says 'Chapitre three'. Read
   * from the message object rather than t(), which cannot type a dynamic key.
   */
  const words: Record<string, string> = messages.OstomyCare.ui.chapter.words;
  const chapterWord = words[chapter.chapterWord] ?? chapter.chapterWord;
  // Derived, not authored — see chapters-data.ts.
  const nextLabel = next ? `${next.title} →` : t('backToChapters');
  const chapterIndex = chapters.findIndex((item) => item.slug === chapter.slug);

  // CSS custom property, typed without an assertion.
  const accentStyle: CSSProperties & Record<string, string> = {
    '--chapter-accent': chapter.accent,
  };

  return (
    <div className="is-journey" id="oc-chapter" style={accentStyle}>
      {/* Every cross-page link into this chapter names a fragment; see the file. */}
      <HashTargetScroll />
      <section className="oc-ch-hero">
        <div className="oc-ch-hero-bg">
          <img alt="" decoding="async" src={chapter.heroImage} />
        </div>
        <div aria-hidden className="oc-ch-hero-veil" />
        <div className="oc-ch-hero-inner">
          <span className="oc-ch-kicker">{t('kicker', { word: chapterWord })}</span>
          <p aria-hidden className="oc-ch-num">
            {chapter.num}
          </p>
          <h1>{chapter.title}</h1>
          <p className="oc-ch-hero-lead">{chapter.heroBody}</p>
          <div className="oc-ch-hero-actions">
            <a className="oc-ch-btn oc-ch-btn-soft" href="#chapter-care">
              {t('readChapter')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={chapter.pharmacist.href}>
              {t('askPharmacist')}
            </a>
          </div>
          <div aria-hidden className="oc-ch-progress">
            {chapters.map((item, index) => (
              <span className={index === chapterIndex ? 'is-current' : undefined} key={item.slug} />
            ))}
          </div>
        </div>
      </section>

      <FigureGlyphs />

      <section className="oc-ch-journal rounded-top" id="chapter-pulse">
        {chapter.startHere ? (
          <div className="oc-ch-starthere">
            <StartHereLine startHere={chapter.startHere} />
            <p className="oc-fig-caption">{chapter.focus}</p>
            {chapter.urgentExit ? <UrgentExit exit={chapter.urgentExit} /> : null}
          </div>
        ) : null}
        {chapter.startHere ? null : (
          <div className="oc-ch-journal-grid">
            <article className="oc-ch-note">
              <span className="oc-ch-note-label">{t('theFocus')}</span>
              <p>{chapter.focus}</p>
            </article>
          </div>
        )}
      </section>

      {chapter.urgent ? <UrgentBlock urgent={chapter.urgent} /> : null}

      {chapter.majorSections ? (
        <MajorSections chapter={chapter} products={products} supplyItems={supplyItems} />
      ) : (
        <section className="oc-ch-care rounded-top" id="chapter-care">
          <div className="oc-ch-wrap">
            <header className="oc-ch-care-head">
              <span className="oc-ch-eyebrow">{chapter.categoriesIntro.eyebrow}</span>
              <h2>{chapter.categoriesIntro.heading}</h2>
              <p>{chapter.categoriesIntro.body}</p>
            </header>
            <GroupRail
              categories={chapter.categories}
              exit={chapter.urgentExit}
              products={products}
              showRail={chapter.rail}
              supplyItems={supplyItems}
            />
          </div>
        </section>
      )}

      <ChapterBandSlot chapter={chapter} />

      {chapter.resources?.length ? (
        <section className="oc-ch-resources rounded-top" id="chapter-resources">
          <div className="oc-ch-wrap">
            <header className="oc-ch-res-intro">
              <span className="oc-ch-eyebrow">{t('resourcesEyebrow')}</span>
              <h2>{t('resourcesHeading')}</h2>
              <p>{t('resourcesIntro')}</p>
            </header>
            {chapter.resources.map((group) => (
              <ResourceGroupBlock group={group} key={group.heading} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="oc-ch-care-cta rounded-top">
        <div className="oc-ch-wrap">
          <div className="oc-ch-care-panel">
            <div className="oc-ch-care-media">
              <img alt="" src={chapter.pharmacist.image} />
            </div>
            <div className="oc-ch-care-copy">
              <span className="oc-ch-eyebrow">{chapter.pharmacist.eyebrow}</span>
              <h2>{chapter.pharmacist.heading}</h2>
              <p>{chapter.pharmacist.body}</p>
              <a className="oc-ch-btn oc-ch-btn-soft" href={chapter.pharmacist.href}>
                {chapter.pharmacist.cta}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="oc-ch-map rounded-top">
        <div className="oc-ch-wrap">
          <span className="oc-ch-eyebrow">{t('pathEyebrow')}</span>
          <h2>{t('allChapters')}</h2>
          <div aria-label={t('chapterNav')} className="oc-ch-map-rail">
            {chapters.map((item) => {
              const active = item.slug === chapter.slug;

              return (
                <a
                  aria-current={active ? 'page' : undefined}
                  className={active ? 'is-active' : undefined}
                  href={localeHref(chapterHref(item.slug), locale)}
                  key={item.slug}
                >
                  <span className="oc-ch-map-num">{item.num}</span>
                  <span>{item.title}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section className="oc-ch-close rounded-top">
        <div className="oc-ch-close-bg">
          <img alt="" src={chapter.heroImage} />
        </div>
        <div aria-hidden className="oc-ch-close-veil" />
        <div className="oc-ch-close-inner">
          <span className="oc-ch-eyebrow">{t('keepGoing')}</span>
          <h2>{chapter.closing.heading}</h2>
          <p>{chapter.closing.body}</p>
          <div className="oc-ch-close-cta">
            <a className="oc-ch-btn oc-ch-btn-soft" href={landingHref}>
              {t('backToLanding')}
            </a>
            <a className="oc-ch-btn oc-ch-btn-ghost-light" href={nextHref}>
              {nextLabel}
            </a>
          </div>
          {prev ? (
            <p className="oc-ch-prev">
              <a href={localeHref(chapterHref(prev.slug), locale)}>← {prev.title}</a>
            </p>
          ) : null}
        </div>
      </section>

      <HelpBand />

      <DiscoveryBand />

      <GovernanceBlock
        citations={chapter.citations}
        governance={chapter.governance}
        stageSources={Boolean(chapter.recoveryMap)}
      />
    </div>
  );
}
