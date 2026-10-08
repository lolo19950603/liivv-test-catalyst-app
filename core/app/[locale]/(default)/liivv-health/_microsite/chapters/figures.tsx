/* Twin of ostomy-care/chapters/figures.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

/*
 * =============================================================================
 * MICROSITE CHAPTER FIGURES — THE GENERIC KINDS
 * =============================================================================
 * The visual shapes approved on Ostomy's Chapter 01 visual review (2026-09-15),
 * drawn for any site: crisis, routes, criteria, takeIn, columns, containers,
 * lanes and doors, plus the start-here map. Any other kind is the site's own,
 * and goes to the figure registry its wrapper gave SiteProvider.
 *
 * Every word a figure shows comes from the site's message tree: either the
 * card's own reviewed item sentences, referenced by number, or a short label
 * under the card's `figure` key. Nothing here writes copy. Structure — which
 * figure, which items, which symbols, which numbers to dial — comes from the
 * site's chapters-meta.ts.
 *
 * Symbols are wordless line drawings from one inline sprite and are always
 * paired with a text label, so meaning never depends on the drawing. No figure
 * maps a symptom to a cause or a product, and none scores the reader.
 * =============================================================================
 */

import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { Fragment, useRef } from 'react';

import { SpecialistContact } from '../_components/specialist-contact';
import { CardPrintFoot, CardPrintHead } from '../print/card-print';
import { usePrintOnly } from '../print/use-print-only';
import type { SiteKinds } from '../site';
import { useSite, useSiteFigures, useSiteMessages, useSiteT } from '../site-context';

import type { CategoryCard, Chapter, FigureText } from './compose';
import {
  CardItem,
  CardText,
  FrDraftMarker,
  Glyph,
  itemText,
  OutboundLabel,
  UrgentExit,
} from './figure-parts';
import { cardHref, chapterHref, localeHref } from './hrefs';
import {
  BASE_EXIT_CARRYING_KINDS,
  BASE_FIGURE_KINDS,
  BASE_FULL_WIDTH_KINDS,
  BASE_JOURNEY_MODULE_KINDS,
  BASE_MODULE_KINDS,
  BASE_NOTE_CARRYING_KINDS,
  BASE_RESTYLE_KINDS,
  BASE_ROW_EXIT_KINDS,
  BASE_WHOLE_CARD_KINDS,
} from './kinds';
import type {
  CrisisLine,
  EngineBaseFigureMeta,
  EngineFigureMeta,
  StartHereSegment as Segment,
} from './types';

export { UrgentExit };

/* ------------------------------------------------------------------------- */
/* What each kind does to its card                                            */
/* ------------------------------------------------------------------------- */

/*
 * The engine's kind sets (./kinds.ts) joined with the site's own (`site.kinds`).
 * Ostomy keeps these as separate constants; here they depend on the site, so
 * they are built once per site config and every check below takes them.
 */
export interface KindSets {
  /* Figures that carry the card's own sentences, so the plain list is not repeated. */
  restyle: ReadonlySet<string>;
  /*
   * Interactive modules. A card carrying one renders open with no toggle, the
   * same as a card with an urgent line, so the module is never behind a
   * disclosure.
   */
  module: ReadonlySet<string>;
  /*
   * Modules that render the chapter's emergency signpost themselves. A card
   * that carries one never gets a second copy of the same line from the row.
   */
  exitCarrying: ReadonlySet<string>;
  /* Modules the row itself signposts (CardExit in ./chapter-disclosure.tsx). */
  rowExit: ReadonlySet<string>;
  /* Figures that render the card's closing note themselves. */
  noteCarrying: ReadonlySet<string>;
  /*
   * Figures that draw the card's sections and its note themselves, wherever
   * the meta keeps the note, so the row prints neither (./chapter-disclosure.tsx).
   */
  wholeCard: ReadonlySet<string>;
  /* Figures that take the full row and must not wait on a fade. */
  fullWidth: ReadonlySet<string>;
  /* Journey entries that stay figure-led and full-stage. */
  journeyModule: ReadonlySet<string>;
}

const KIND_SETS = new WeakMap<SiteKinds, KindSets>();

function joined(base: readonly string[], own: readonly string[] | undefined): ReadonlySet<string> {
  return new Set<string>([...base, ...(own ?? [])]);
}

export function kindSets(kinds: SiteKinds): KindSets {
  const cached = KIND_SETS.get(kinds);

  if (cached) return cached;

  const sets: KindSets = {
    restyle: joined(BASE_RESTYLE_KINDS, kinds.restyle),
    module: joined(BASE_MODULE_KINDS, kinds.module),
    exitCarrying: joined(BASE_EXIT_CARRYING_KINDS, kinds.exitCarrying),
    rowExit: joined(BASE_ROW_EXIT_KINDS, kinds.rowExit),
    noteCarrying: joined(BASE_NOTE_CARRYING_KINDS, kinds.noteCarrying),
    wholeCard: joined(BASE_WHOLE_CARD_KINDS, kinds.wholeCard),
    fullWidth: joined(BASE_FULL_WIDTH_KINDS, kinds.fullWidth),
    journeyModule: joined(BASE_JOURNEY_MODULE_KINDS, kinds.journeyModule),
  };

  KIND_SETS.set(kinds, sets);

  return sets;
}

export function useKindSets() {
  return kindSets(useSite().kinds);
}

/* True when a figure carries the card's own sentences, so the plain list is not repeated. */
export function restylesCard(sets: KindSets, figures: EngineFigureMeta[] | undefined) {
  return Boolean(figures?.some((figure) => sets.restyle.has(figure.kind)));
}

/*
 * `exitFallback` is the second way a row earns the signpost, and it is set
 * rather than authored: this locale's review gate dropped a module that was
 * carrying the chapter's emergency signpost at a list on another page, so the
 * row prints it where the module would have been. It still defers to a module
 * that is present, so the line is never shown twice.
 */
export function needsCardExit(
  sets: KindSets,
  card: Pick<CategoryCard, 'exitFallback' | 'figures'>,
) {
  const figures = card.figures ?? [];

  if (figures.some((figure) => sets.exitCarrying.has(figure.kind))) return false;

  return card.exitFallback === true || figures.some((figure) => sets.rowExit.has(figure.kind));
}

/*
 * Whether any card on the chapter already prints the chapter's emergency
 * signpost in this locale — either from a module that carries it or from the
 * row itself (needsCardExit). The band after the cards repeats that signpost
 * only to stand in for a module that is not there. Pass the COMPOSED cards:
 * the composer has already dropped the modules this locale is not showing.
 */
export function showsChapterExit(
  sets: KindSets,
  categories: Array<Pick<CategoryCard, 'exitFallback' | 'figures'>>,
) {
  return categories.some(
    (card) =>
      card.figures?.some((figure) => sets.exitCarrying.has(figure.kind)) ||
      needsCardExit(sets, card),
  );
}

/*
 * Pinned open with no toggle: the card carries a same-day, emergency or crisis
 * line, or an interactive module.
 */
export function isPinnedCard(
  sets: KindSets,
  card: Pick<CategoryCard, 'urgentContent' | 'figures'>,
) {
  return (
    Boolean(card.urgentContent) ||
    Boolean(card.figures?.some((figure) => sets.module.has(figure.kind)))
  );
}

/* One of the kinds the engine draws itself, rather than one of the site's own. */
function isBaseFigure(figure: EngineFigureMeta): figure is EngineBaseFigureMeta {
  return BASE_FIGURE_KINDS.some((kind) => kind === figure.kind);
}

/* ------------------------------------------------------------------------- */
/* Symbols                                                                    */
/* ------------------------------------------------------------------------- */

/*
 * The site's symbols, rendered once per page. Never display:none — a hidden
 * sprite breaks <use> in some browsers — so it is sized to nothing and taken
 * out of flow instead.
 */
export function FigureGlyphs() {
  const { glyphs, idPrefix } = useSite();
  const symbols = Object.entries(glyphs)
    .map(([name, path]) => `<symbol id="${idPrefix}g-${name}" viewBox="0 0 24 24">${path}</symbol>`)
    .join('');

  return (
    <svg
      aria-hidden
      className="oc-fig-sprite"
      dangerouslySetInnerHTML={{ __html: `<defs>${symbols}</defs>` }}
      focusable="false"
      height="0"
      width="0"
    />
  );
}

/* ------------------------------------------------------------------------- */
/* Chapter-level                                                              */
/* ------------------------------------------------------------------------- */

/*
 * The referral line under each segment, generated from its cards' ask roles:
 * the most frequent role first, the rest after "also". Generated rather than
 * written, so it cannot drift from the chips a reader will actually meet. Role
 * names are the site's own (`ui.chapter.roleNames`); a role with no name there
 * is left out of the line rather than shown as a key.
 */
function useReferralLine(cards: Array<{ ask?: string }>) {
  const t = useSiteT('ui.chapter');
  const roleNames: Record<string, string> = useSiteMessages().ui.chapter.roleNames;
  const locale = useLocale();

  const counts = cards.reduce<Map<string, number>>((acc, card) => {
    if (card.ask && roleNames[card.ask]) acc.set(card.ask, (acc.get(card.ask) ?? 0) + 1);

    return acc;
  }, new Map());

  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([role]) => role);
  const [top, ...others] = ranked;

  if (!top) return '';

  const mostly = t('startHere.mostly', { role: roleNames[top] ?? top });

  if (!others.length) return mostly;

  const list = new Intl.ListFormat(locale, { type: 'conjunction' }).format(
    others.map((role) => roleNames[role] ?? role),
  );

  return `${mostly} · ${t('startHere.also', { roles: list })}`;
}

function StartHereSegment({
  segment,
  side,
}: {
  segment: Segment<string>;
  side: 'before' | 'after';
}) {
  const t = useSiteT('ui.chapter');
  const referral = useReferralLine(segment.cards);

  return (
    <div className={`oc-fig-seg is-${side}`}>
      <h3 className="oc-fig-seg-label">{segment.label}</h3>
      <ol>
        {segment.cards.map((card, index) => (
          <li key={card.number}>
            <a href={`#card-${card.number}`}>
              <span aria-hidden className="oc-fig-seg-num">
                {index + 1}
              </span>
              <span className="oc-fig-seg-title">{card.title}</span>
              <span aria-hidden className="oc-fig-seg-go">
                →
              </span>
            </a>
          </li>
        ))}
      </ol>
      {referral ? (
        <p className="oc-fig-seg-ref">
          <span className="oc-fig-seg-ref-label">{t('startHere.who')}</span>
          {referral}
        </p>
      ) : null}
    </div>
  );
}

/*
 * The pivot line: which half of the chapter is yours, and a jump to each card.
 * Plain anchor links — no filter, no fill, no "you are here". Always two
 * sides, because the start-here map is typed as exactly two.
 */
export function StartHereLine({ startHere }: { startHere: NonNullable<Chapter['startHere']> }) {
  const t = useSiteT('ui.chapter');
  const [first, second] = startHere.segments;

  return (
    <nav aria-label={t('startHere.nav')} className="oc-fig-sline">
      <StartHereSegment segment={first} side="before" />
      <div aria-hidden className="oc-fig-pivot">
        <span>{startHere.pivot}</span>
      </div>
      <StartHereSegment segment={second} side="after" />
    </nav>
  );
}

/* ------------------------------------------------------------------------- */
/* Card figures                                                               */
/* ------------------------------------------------------------------------- */

/*
 * How a short number is read out and printed: 9-8-8, or the way the site's
 * meta writes it (`written`, such as Diabetes Care's 911). The digits a reader
 * dials are the meta's, untouched; this is only how they are shown.
 */
function spokenNumber(line: CrisisLine) {
  if (line.written !== undefined) return line.written;

  return /^\d{3}$/.test(line.tel) ? line.tel.split('').join('-') : line.tel;
}

/*
 * The site's crisis and emergency numbers, with tap-to-call and, where the
 * line takes texts, tap-to-text. The numbers come from the meta, so a
 * translation can never change what a reader dials; the words come from
 * `ui.chapter.crisis`, and the strip's sentence from the card's own
 * `figure.body` where it has one. An emergency number (9-1-1) is worded as
 * one, never as a crisis line.
 */
function CrisisStrip({
  figure,
  card,
}: {
  figure: Extract<EngineBaseFigureMeta, { kind: 'crisis' }>;
  card: CategoryCard;
}) {
  const t = useSiteT('ui.chapter.crisis');

  return (
    <div className="oc-fig-crisis">
      <p>{card.figureText?.body ?? t('body')}</p>
      <div className="oc-fig-crisis-actions">
        {figure.numbers.map((line) => {
          const number = spokenNumber(line);

          return (
            <Fragment key={line.tel}>
              <a href={`tel:${line.tel}`}>
                <Glyph name="phone" />
                {line.kind === 'emergency' ? t('emergency', { number }) : t('call', { number })}
              </a>
              {line.sms ? (
                <a href={`sms:${line.tel}`}>
                  <Glyph name="text" />
                  {t('text', { number })}
                </a>
              ) : null}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

function RoutesFigure({
  figure,
  card,
}: {
  figure: Extract<EngineBaseFigureMeta, { kind: 'routes' }>;
  card: CategoryCard;
}) {
  const t = useSiteT('ui.chapter');
  const routes = card.figureText?.routes ?? [];

  return (
    <div className="oc-fig-routes">
      <p className="oc-fig-bracket">{t('bothNotEither')}</p>
      <div className="oc-fig-both">
        <span aria-hidden className="oc-fig-bar" />
        <ul>
          {routes.map((route, index) => (
            <li className="oc-fig-route" key={route.prompt}>
              <p>{route.prompt}</p>
              <span className="oc-fig-chips">
                {route.chips.map((chip, chipIndex) => {
                  const glyph = figure.routes[index]?.glyphs[chipIndex];

                  return (
                    <span className="oc-fig-chip" key={chip}>
                      {glyph ? <Glyph name={glyph} /> : null}
                      {chip}
                    </span>
                  );
                })}
              </span>
              {route.detail ? <p className="oc-fig-detail">{route.detail}</p> : null}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CriteriaFigure({
  figure,
  card,
}: {
  figure: Extract<EngineBaseFigureMeta, { kind: 'criteria' }>;
  card: CategoryCard;
}) {
  const text = card.figureText;
  const labels = [...(text?.items ?? []), ...(text?.more ? [text.more] : [])];

  return (
    <figure className="oc-fig-criteria">
      {text?.heading ? <figcaption className="oc-fig-heading">{text.heading}</figcaption> : null}
      <ul>
        {labels.map((label, index) => {
          const glyph = figure.glyphs[index];

          return (
            <li className={glyph === 'more' ? 'is-more' : undefined} key={label}>
              {glyph ? <Glyph name={glyph} /> : null}
              {label}
            </li>
          );
        })}
      </ul>
      {text?.captions.length ? (
        <p className="oc-fig-caprow">
          {text.captions.map((caption) => (
            <span key={caption}>{caption}</span>
          ))}
        </p>
      ) : null}
    </figure>
  );
}

/*
 * The card's own list as a card to take to an appointment. Print opens only
 * this card; the button appears after hydration so it never sits there inert.
 *
 * With `fields`, the card is a plan to fill in: after the list, that many
 * blank ruled lines, each with its label from `figure.fields`, headed by
 * `figure.heading` in place of the card title. A card made of sections rather
 * than items prints its fields alone; the sections stay in the card body.
 *
 * The card's note rides on the printed card, except where the meta keeps it
 * visible in the card body, so it is never shown twice.
 *
 * On paper (owner note 2, 2026-10-07) the card is headed by the site, a line
 * for a name and the date, and ends with the card's sources and the page it
 * came from (../print). The blank lines carry on the list's numbering rather
 * than starting again at 1.
 */
function TakeInFigure({
  figure,
  card,
}: {
  figure: Extract<EngineBaseFigureMeta, { kind: 'takeIn' }>;
  card: CategoryCard;
}) {
  const t = useSiteT('ui.chapter.takeIn');
  const ref = useRef<HTMLDivElement>(null);
  const heading = card.figureText?.heading ?? card.title;
  const { ready, print } = usePrintOnly(ref, { title: heading });
  const items = card.items ?? [];
  const labels = card.figureText?.fields ?? [];
  const fields = Array.from({ length: figure.fields ?? 0 }, (_, index) => labels[index] ?? '');

  return (
    <div className="oc-fig-takein" ref={ref}>
      {ready ? <CardPrintHead /> : null}
      <p className="oc-fig-heading">{heading}</p>
      {items.length ? (
        <ol>
          {items.map((item, index) => (
            <li key={`${index}-${item}`}>
              <CardText card={card} text={item} />
              <span aria-hidden className="oc-fig-ruled" />
            </li>
          ))}
        </ol>
      ) : null}
      {fields.length ? (
        <ol start={items.length + 1}>
          {fields.map((label, index) => (
            <li key={`field-${index}`}>
              {label}
              <span aria-hidden className="oc-fig-ruled" />
            </li>
          ))}
        </ol>
      ) : null}
      <p className="sr-only">{t('notesHint')}</p>
      {card.note && !card.noteVisible ? (
        <p className="oc-fig-detail">
          <CardText card={card} text={card.note} />
        </p>
      ) : null}
      {ready ? (
        <button className="oc-fig-print" onClick={print} type="button">
          <Glyph name="print" />
          {t('print')}
        </button>
      ) : null}
      {ready ? <CardPrintFoot card={card} /> : null}
    </div>
  );
}

function ColumnsFigure({
  figure,
  card,
}: {
  figure: Extract<EngineBaseFigureMeta, { kind: 'columns' }>;
  card: CategoryCard;
}) {
  const headings = card.figureText?.columns ?? [];

  return (
    <div className="oc-fig-columns">
      {figure.lead?.map((item) => (
        <p className="oc-fig-neutral" key={item}>
          <CardItem card={card} item={item} />
        </p>
      ))}
      <div className="oc-fig-grid">
        {figure.columns.map((items, index) => (
          <section key={headings[index] ?? index}>
            <p className="oc-fig-colhead">{headings[index]}</p>
            <ul>
              {items.map((item) => (
                <li key={item}>
                  <CardItem card={card} item={item} />
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {figure.neutral?.map((item) => (
        <p className="oc-fig-neutral" key={item}>
          <CardItem card={card} item={item} />
        </p>
      ))}
    </div>
  );
}

function ContainersFigure({
  figure,
  card,
}: {
  figure: Extract<EngineBaseFigureMeta, { kind: 'containers' }>;
  card: CategoryCard;
}) {
  const labels = card.figureText?.containers ?? [];

  return (
    <div className="oc-fig-grid">
      {figure.containers.map((container, index) => (
        <section className="oc-fig-box" key={labels[index] ?? index}>
          <p className="oc-fig-box-label">
            <Glyph name={container.glyph} />
            {labels[index]}
          </p>
          <ul>
            {container.items.map((entry) => (
              <li key={entry.item}>
                <Glyph name={entry.glyph} />
                <CardItem card={card} item={entry.item} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/*
 * The topic filter over the lanes. It loads after hydration and only where its
 * French is cleared, so with JavaScript off — and on /fr until the site's
 * `laneExtras` gate opens — the card is exactly the plain lanes it always was.
 */
const LanesTopics = dynamic(
  () => import('../../ostomy-care/chapters/lanes-topics').then((mod) => mod.LanesTopics),
  { ssr: false },
);

type LaneMeta = Extract<EngineBaseFigureMeta, { kind: 'lanes' }>['lanes'][number];

/*
 * What a lane can be marked for. Liivv's own service can only ever match the
 * topics the site allows it (`site.serviceLaneTopics`), whatever the data says:
 * a lane that sells must never answer a clinical topic.
 */
function laneTopics(lane: LaneMeta, serviceTopics: readonly string[]): string[] {
  if (!lane.service) return lane.topics;

  return lane.topics.filter((topic) => serviceTopics.includes(topic));
}

/*
 * One lane. `fits` is the badge text, present only where the filter renders;
 * it is server-rendered hidden beside every lane, and the island un-hides the
 * ones that fit — so a marked lane is never marked by colour alone. `contact`
 * draws the site's specialist contact under the lane's words (a `contact`
 * lane, outside the French gate); it renders nothing on a site without one.
 */
function Lane({
  card,
  contact,
  fits,
  href,
  hrefLang,
  lane,
  text,
}: {
  card: CategoryCard;
  contact: boolean;
  fits: string | undefined;
  href: string | undefined;
  /* The language of the page `href` opens: French where the lane opens its `hrefFr`. */
  hrefLang: LaneMeta['hrefLang'];
  lane: LaneMeta;
  text: FigureText['lanes'][number] | undefined;
}) {
  const { serviceLaneTopics } = useSite();
  const body = lane.item === undefined ? text?.body : itemText(card, lane.item);

  return (
    <li
      className={lane.service ? 'oc-fig-lane is-service' : 'oc-fig-lane'}
      data-topics={fits === undefined ? undefined : laneTopics(lane, serviceLaneTopics).join(' ')}
    >
      <span className="oc-fig-chip">
        <Glyph name={lane.glyph} />
        {text?.label}
      </span>
      {fits === undefined ? null : (
        <span className="oc-fig-fits" hidden>
          <Glyph name="check" />
          {fits}
        </span>
      )}
      {text?.scope ? <p className="oc-fig-scope">{text.scope}</p> : null}
      {body ? (
        <p>
          <CardText card={card} text={body} />
        </p>
      ) : null}
      {contact ? <SpecialistContact tone="light" /> : null}
      {href !== undefined && text?.linkLabel ? (
        <p className="oc-fig-lane-link">
          <a href={href} hrefLang={hrefLang}>
            <OutboundLabel hrefLang={hrefLang} label={text.linkLabel} />
          </a>
        </p>
      ) : null}
    </li>
  );
}

function LanesFigure({
  figure,
  card,
  exit,
}: {
  figure: Extract<EngineBaseFigureMeta, { kind: 'lanes' }>;
  card: CategoryCard;
  exit?: Chapter['urgentExit'];
}) {
  const { gates } = useSite();
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const text = card.figureText;

  /*
   * On /fr until the site's `laneExtras` gate opens: the reviewed lanes only,
   * with no link labels and no filter. Every lane the French review covered
   * carries one of the card's own sentences, so `item` is what tells them
   * apart.
   */
  const gate = gates.features.laneExtras;
  const gated = gates.isFrGated(gate, locale);
  const shown = figure.lanes
    .map((lane, index) => ({ lane, index }))
    .filter(({ lane }) => !gated || lane.item !== undefined);
  const filtered = !gated && Boolean(text?.fits) && figure.topicKeys.length > 0;
  /*
   * A lane's link is a plain <a>: a storefront path, such as a Liivv service's
   * request page, takes the /fr prefix here; an outward link is left as it is.
   */
  const laneOf = ({ lane, index }: { lane: LaneMeta; index: number }) => {
    /* The publisher's French page on /fr, where it has one (`hrefFr`). */
    const french = locale === 'fr' && lane.hrefFr !== undefined;
    const target = french ? lane.hrefFr : lane.href && localeHref(lane.href, locale);

    return (
      <Lane
        card={card}
        contact={!gated && lane.contact === true}
        fits={filtered ? text?.fits : undefined}
        href={gated ? undefined : target}
        hrefLang={french ? 'fr' : lane.hrefLang}
        key={`lane-${index}`}
        lane={lane}
        text={text?.lanes[index]}
      />
    );
  };
  const rows = shown.filter(({ lane }) => !lane.service);
  const serviceRows = shown.filter(({ lane }) => lane.service);

  return (
    <div className="oc-fig-lanes-wrap" ref={rootRef}>
      {exit ? <UrgentExit exit={exit} /> : null}
      <FrDraftMarker gate={gate} />
      {filtered ? (
        <LanesTopics
          legend={text?.legend ?? ''}
          root={rootRef}
          statusFitsMany={text?.statusFitsMany ?? ''}
          statusFitsOne={text?.statusFitsOne ?? ''}
          statusNone={text?.statusNone ?? ''}
          topics={figure.topicKeys.map((key, index) => ({
            key,
            label: text?.topics[index] ?? '',
          }))}
        />
      ) : null}
      <ul className="oc-fig-lanes">{rows.map(laneOf)}</ul>
      {serviceRows.length ? (
        <ul className="oc-fig-lanes is-service-row">{serviceRows.map(laneOf)}</ul>
      ) : null}
    </div>
  );
}

function DoorsFigure({
  figure,
  card,
}: {
  figure: Extract<EngineBaseFigureMeta, { kind: 'doors' }>;
  card: CategoryCard;
}) {
  const site = useSite();
  const labels = card.figureText?.doors ?? [];
  /* A plain <a>, so the /fr prefix has to be put on by hand — ./hrefs.ts. */
  const locale = useLocale();

  return (
    <ul className="oc-fig-doors">
      {figure.doors.map((door, index) => (
        <li key={door.item}>
          <a
            href={localeHref(
              door.card === undefined
                ? chapterHref(site, door.chapter)
                : cardHref(site, door.chapter, door.card),
              locale,
            )}
          >
            <Glyph name={door.glyph} />
            {/* Plain text: the door is the link, and a link may not hold another. */}
            <span>
              <b>{labels[index]}</b> {itemText(card, door.item)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/* One figure the engine draws. Routes render at the card foot instead (CardRoutes). */
function BaseFigure({
  figure,
  card,
  exit,
}: {
  figure: EngineBaseFigureMeta;
  card: CategoryCard;
  exit?: Chapter['urgentExit'];
}) {
  switch (figure.kind) {
    case 'crisis':
      return <CrisisStrip card={card} figure={figure} />;

    case 'criteria':
      return <CriteriaFigure card={card} figure={figure} />;

    case 'takeIn':
      return <TakeInFigure card={card} figure={figure} />;

    case 'columns':
      return <ColumnsFigure card={card} figure={figure} />;

    case 'containers':
      return <ContainersFigure card={card} figure={figure} />;

    case 'lanes':
      return <LanesFigure card={card} exit={exit} figure={figure} />;

    case 'doors':
      return <DoorsFigure card={card} figure={figure} />;

    case 'routes':
      return null;
  }
}

/*
 * Figures that sit in the card's visible body, in meta order. Routes are
 * rendered separately by the row because they replace the card's single chip
 * at its foot. Any kind the engine does not draw goes to the site's own figure
 * registry, which returns null for a kind it does not know either.
 */
export function CardFigures({ card, exit }: { card: CategoryCard; exit?: Chapter['urgentExit'] }) {
  const siteFigures = useSiteFigures();

  return (card.figures ?? []).map((figure, index) => {
    const key = `${figure.kind}-${index}`;

    if (isBaseFigure(figure)) {
      return <BaseFigure card={card} exit={exit} figure={figure} key={key} />;
    }

    return <Fragment key={key}>{siteFigures?.render(figure, { card, exit }) ?? null}</Fragment>;
  });
}

export function CardRoutes({ card }: { card: CategoryCard }) {
  const routes = card.figures?.filter(
    (figure): figure is Extract<EngineBaseFigureMeta, { kind: 'routes' }> =>
      figure.kind === 'routes',
  );

  if (!routes?.length) return null;

  return routes.map((figure, index) => <RoutesFigure card={card} figure={figure} key={index} />);
}
