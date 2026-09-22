'use client';

import { useLocale, useMessages, useTranslations } from 'next-intl';
import { type CSSProperties, useEffect, useId, useMemo, useRef, useState } from 'react';

import { HashTargetScroll } from '../_components/hash-target-scroll';
import { DiscoveryBand, GovernanceBlock, HelpBand } from '../_components/page-furniture';
import type { OcCatalogItem } from '../get-oc-catalog';

import { AskChip } from './ask-chip';
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
  needsCardExit,
  NOTE_CARRYING_KINDS,
  restylesCard,
  showsChapterExit,
  StartHereLine,
  UrgentExit,
} from './figures';
import type { SupplyItem } from './get-supply-items';
import { RecoveryMap } from './recovery-map';
import { ResourceShelf } from './resource-shelf';
import { GoBagBand, SupplyList } from './supply-list';
import { setUntilFound } from './until-found';

import './chapter-page.css';

/*
 * Ostomy chapter page — soft journal / path layout (not Women's Health chapter chrome).
 *
 * The referral chip (AskChip) lives in ./ask-chip.tsx.
 */

/*
 * Commerce, in its own band.
 *
 * Placement is declared in chapters-meta.ts, not decided here. The test a card
 * has to pass is about its COPY, not its topic: does anything on this card
 * argue against buying something?
 *
 * An earlier version asked the topic question instead, and put a $234 kit named
 * "Peristomal Skin Health & Infection Prevention" under the card that says
 * broken skin "needs an NSWOC to look at it — not a product recommendation from
 * the internet". Eight cards are deliberately empty:
 *
 *   Flat or convex                convexity is prescribed after an assessment
 *   Leaks and short wear time     its own note calls rings and pastes an
 *                                 assessment rather than a shopping decision
 *   Sore, itchy, or weeping skin  broken skin needs an NSWOC, not a product
 *   A bulge around the stoma      symptom card
 *   Hernias, lifting and core     belts have not been shown to prevent hernia
 *   Getting back to activity      it sits under that card, so a belt band here
 *                                 makes the recommendation that one withholds
 *   Children                      a failing seal is a call to the nurse
 *   Ballooning and gas            symptom card, and its first sentence says a
 *                                 wetted-out filter is normal rather than a
 *                                 fault — so a band of filtered pouches
 *                                 answered a sentence saying nothing needs an
 *                                 answer
 *
 * No card anywhere in the four chapters carries a product band today. The
 * second test, for a card that ever gets one back, is about the SHELF: three or
 * more manufacturers, or no band — see cards 4, 5, 10 and 17 in chapters-meta.ts.
 *
 * The band sits after the ask chip so the referral is the last clinical thing
 * said, and it carries its own disclosure rather than borrowing the page's.
 */
function ProductBand({
  ids,
  products,
}: {
  ids: number[];
  products: Record<number, OcCatalogItem>;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const items = ids
    .map((id) => products[id])
    .filter((item): item is OcCatalogItem => Boolean(item));

  if (!items.length) return null;

  return (
    <aside className="oc-ch-shop">
      <span className="oc-ch-shop-label">{t('productsLabel')}</span>
      <ul className="oc-ch-shop-list">
        {items.map((item) => (
          <li key={item.entityId}>
            <a className="oc-ch-shop-card" href={item.path}>
              {item.image ? (
                <img alt="" loading="lazy" src={item.image.src} />
              ) : (
                <span className="oc-ch-shop-blank" />
              )}
              <span className="oc-ch-shop-name">{item.name}</span>
              {item.priceLabel ? <span className="oc-ch-shop-price">{item.priceLabel}</span> : null}
            </a>
          </li>
        ))}
      </ul>
      <p className="oc-ch-shop-note">{t('productsNote')}</p>
    </aside>
  );
}

/*
 * The shop band, whatever shape it takes on this card.
 *
 * Three kinds, and a card can only have one: the supply list (C02), the go-bag
 * card's link back to it, or the plain product band above. The band is always
 * an aside with its own label and its own disclosure, so a reader can tell the
 * shop from the chapter without reading a word of it.
 *
 * Only the product band hides with the card's disclosure: a card carrying the
 * supply list or the go-bag link is pinned open, so there is nothing to hide
 * behind.
 */
function CardShop({
  card,
  products,
  supplyItems,
  visible,
}: {
  card: CategoryCard;
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  visible: boolean;
}) {
  const supply = card.figures?.find(
    (figure): figure is Extract<FigureMeta, { kind: 'supplyList' }> => figure.kind === 'supplyList',
  );

  if (supply) return <SupplyList card={card} figure={supply} supplyItems={supplyItems} />;

  if (card.figures?.some((figure) => figure.kind === 'goBag')) return <GoBagBand card={card} />;

  if (!card.productIds) return null;

  return (
    <div hidden={!visible}>
      <ProductBand ids={card.productIds} products={products} />
    </div>
  );
}

/*
 * The chapter's emergency signpost in a card's own body (needsCardExit in
 * figures.tsx). Two cards earn one: the supply-list card, whose band holds a
 * shopping tool, and a card whose signposting module this locale's review gate
 * dropped. Either way it sits above the foot — outside the shop band, never
 * beside something to buy, and where the module would have put it.
 */
function CardExit({ card, exit }: { card: CategoryCard; exit?: Chapter['urgentExit'] }) {
  if (!exit || !needsCardExit(card)) return null;

  return <UrgentExit exit={exit} />;
}

/*
 * Where a card's words go.
 *
 * A figure that restyles the card carries the card's own item sentences, so the
 * plain list is not repeated and there is nothing left to collapse. Otherwise
 * the first bullet is the lede and the rest collapse; a card built from sections
 * has no single lede, so it collapses whole. The closing note sits outside the
 * collapsible region when the meta asks for it, or when a restyle figure has
 * taken the list — except where a figure carries the note itself (the take-in
 * card; see NOTE_CARRYING_KINDS).
 */
function rowLayout(card: CategoryCard) {
  const restyled = restylesCard(card.figures);
  const carriesNote = Boolean(card.figures?.some((figure) => NOTE_CARRYING_KINDS.has(figure.kind)));
  const rest = restyled ? [] : (card.items?.slice(1) ?? []);
  const noteOutside = Boolean(card.note) && Boolean(card.noteVisible || (restyled && !carriesNote));

  return {
    lede: restyled ? undefined : card.items?.[0],
    rest,
    hidden: rest.length + (card.sections?.length ?? 0),
    noteOutside,
    noteInMore: Boolean(card.note) && !noteOutside && !carriesNote,
  };
}

/*
 * The collapsed part of a card. It holds the bulk of a chapter's text — on
 * Chapter 02 roughly a third of the page — so it is hidden the revealable way,
 * `hidden="until-found"`, and find-in-page can still reach it.
 *
 * React serialises `hidden={true}` as the boolean `hidden=""`, which hides the
 * text from find-in-page outright, so the server render collapses the row the
 * boolean way (no flash of expanded cards) and this effect swaps the value the
 * moment the island hydrates. React keeps managing the prop; because the prop
 * does not change while the row stays shut, it never overwrites the swap, and
 * opening the row removes the attribute as before.
 *
 * `beforematch` is what the browser fires when it reveals the row for a match:
 * the button and `aria-expanded` would otherwise keep saying "3 more" over
 * text the reader is looking at, so the row's own state is opened to match.
 * See until-found.ts, and note chapter-page.css deliberately gives this node
 * no author `display`.
 */
function RowMore({
  card,
  id,
  open,
  rest,
  noteInMore,
  onReveal,
}: {
  card: CategoryCard;
  id: string;
  open: boolean;
  rest: string[];
  noteInMore: boolean;
  onReveal: (open: boolean) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUntilFound(ref.current, !open);
  }, [open]);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const onMatch = () => onReveal(true);

    el.addEventListener('beforematch', onMatch);

    return () => el.removeEventListener('beforematch', onMatch);
  }, [onReveal]);

  return (
    <div className="oc-ch-row-more" hidden={!open} id={id} ref={ref}>
      {rest.length ? (
        <ul>
          {rest.map((item, i) => (
            <li key={`${i}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : null}
      {card.sections?.map((section) => (
        <div className="oc-ch-subsection" key={section.heading}>
          <h4>{section.heading}</h4>
          <ul>
            {section.items.map((item, i) => (
              <li key={`${i}-${item}`}>{item}</li>
            ))}
          </ul>
          {section.note ? <p className="oc-ch-row-note">{section.note}</p> : null}
        </div>
      ))}
      {noteInMore ? <p className="oc-ch-row-note">{card.note}</p> : null}
    </div>
  );
}

function CategoryRow({
  card,
  index,
  openByDefault,
  products,
  supplyItems,
  exit,
}: {
  card: CategoryCard;
  index: number;
  openByDefault: boolean;
  products: Record<number, OcCatalogItem>;
  supplyItems?: Promise<SupplyItem[]>;
  exit?: Chapter['urgentExit'];
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
  /*
   * A card carrying a same-day, emergency or crisis line, or an interactive
   * module, is pinned open with no toggle. Collapsing rows by default once hid
   * 9-8-8 on chapter 04.
   */
  const pinned = isPinnedCard(card);
  const [open, setOpen] = useState(openByDefault || pinned);
  const moreId = useId();

  const { lede, rest, hidden, noteOutside, noteInMore } = rowLayout(card);
  const collapsible = hidden > 0 && !pinned;

  return (
    <article className={open ? 'oc-ch-row is-open' : 'oc-ch-row'} id={`card-${card.number}`}>
      <span aria-hidden className="oc-ch-row-thumb">
        <img alt="" loading="lazy" src={card.image} />
        <b>{String(index + 1).padStart(2, '0')}</b>
      </span>
      <div>
        {card.group ? <span className="oc-ch-group">{card.group}</span> : null}
        <h3>
          {card.title}
          {card.badge ? ` · ${card.badge}` : ''}
        </h3>

        {lede ? <p className="oc-ch-lede">{lede}</p> : null}

        <CardFigures card={card} exit={exit} />

        {noteOutside ? <p className="oc-ch-row-note">{card.note}</p> : null}

        <RowMore
          card={card}
          id={moreId}
          noteInMore={noteInMore}
          onReveal={setOpen}
          open={open}
          rest={rest}
        />

        <CardRoutes card={card} />

        <CardExit card={card} exit={exit} />

        <div className="oc-ch-row-foot">
          {collapsible ? (
            <button
              aria-controls={moreId}
              aria-expanded={open}
              aria-label={`${open ? t('showLess') : t('showMore', { count: String(hidden) })} — ${card.title}`}
              className="oc-ch-toggle"
              onClick={() => setOpen(!open)}
              type="button"
            >
              {open ? t('showLess') : t('showMore', { count: String(hidden) })}
            </button>
          ) : null}
          {card.ask ? <AskChip role={card.ask} /> : null}
        </div>

        <CardShop
          card={card}
          products={products}
          supplyItems={supplyItems}
          visible={open || !collapsible}
        />
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
          <header className="oc-ch-care-head">
            <span className="oc-ch-eyebrow">{t('softMap')}</span>
            <h2>{band.heading}</h2>
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
 * Second-level navigation, built from the `group` labels the categories were
 * already authored with. This is what makes a twenty-row chapter browsable, and
 * what makes consolidating back to four chapters possible.
 *
 * Filtering rather than scroll-spying: on a phone a sticky spy rail and the
 * thumb-scroll fight each other, and filtering gives the same answer with less
 * machinery. Rows are hidden, never unmounted — search must still see them all.
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
  const [active, setActive] = useState('');

  const groups = useMemo(() => {
    const counts = categories.reduce<Map<string, number>>((acc, card) => {
      if (card.group) acc.set(card.group, (acc.get(card.group) ?? 0) + 1);

      return acc;
    }, new Map());

    return [...counts.entries()].map(([label, count]) => ({ label, count }));
  }, [categories]);

  // One group, or none, is not a navigation problem worth a control — and a
  // chapter can switch the rail off where a start-here map does the job.
  const railed = showRail && groups.length > 1;
  const seenGroups = new Set<string>();

  return (
    <>
      {railed ? (
        <div aria-label={t('groupNav')} className="oc-ch-rail" role="group">
          <button aria-pressed={active === ''} onClick={() => setActive('')} type="button">
            {t('allGroups')}
            <span className="oc-ch-rail-count">{categories.length}</span>
          </button>
          {groups.map((group) => (
            <button
              aria-pressed={active === group.label}
              key={group.label}
              onClick={() => setActive(group.label)}
              type="button"
            >
              {group.label}
              <span className="oc-ch-rail-count">{group.count}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="oc-ch-rows">
        {categories.map((card, index) => {
          const lead = Boolean(card.group) && !seenGroups.has(card.group ?? '');

          if (card.group) seenGroups.add(card.group);

          return (
            <div hidden={active !== '' && card.group !== active} key={card.title}>
              <CategoryRow
                card={card}
                exit={exit}
                index={index}
                openByDefault={lead || !card.group}
                products={products}
                supplyItems={supplyItems}
              />
            </div>
          );
        })}
      </div>
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
    <div id="oc-chapter" style={accentStyle}>
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
        <div className="oc-ch-journal-grid">
          {chapter.startHere ? null : (
            <article className="oc-ch-note">
              <span className="oc-ch-note-label">{t('theFocus')}</span>
              <p>{chapter.focus}</p>
            </article>
          )}
          <article className="oc-ch-note is-vibe">
            <span className="oc-ch-note-label">{t('theVibe')}</span>
            <p>{chapter.vibe}</p>
          </article>
        </div>
      </section>

      {chapter.urgent ? <UrgentBlock urgent={chapter.urgent} /> : null}

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
