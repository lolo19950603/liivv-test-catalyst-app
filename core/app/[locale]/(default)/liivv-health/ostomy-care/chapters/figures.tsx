'use client';

/*
 * =============================================================================
 * CHAPTER FIGURES
 * =============================================================================
 * The visual shapes approved on the Chapter 01 visual review (2026-09-15).
 *
 * Every word a figure shows comes from the message tree: either the card's own
 * reviewed item sentences, referenced by number, or a short label under the
 * card's `figure` key. Nothing here writes copy. Structure — which figure, which
 * items, which symbols — comes from chapters-meta.ts.
 *
 * Symbols are wordless line drawings from one inline sprite and are always
 * paired with a text label, so meaning never depends on the drawing. No figure
 * maps a symptom to a cause or a product, and none scores the reader.
 * =============================================================================
 */

import dynamic from 'next/dynamic';
import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useRef } from 'react';

import { BowelReferenceFigure } from './bowel-reference-figure';
import { ChangeRoutineFigure } from './change-routine-figure';
import {
  type AskRole,
  type CategoryCard,
  type Chapter,
  chapterHref,
  type FigureText,
  localeHref,
} from './chapters-data';
import type { FigureMeta, LaneTopic } from './chapters-meta';
import { FibreClocksFigure } from './fibre-clocks-figure';
import { FrDraftMarker, Glyph, itemText, OutboundLabel, UrgentExit } from './figure-parts';
import { GapCompareFigure } from './gap-compare-figure';
import { GLYPH_PATHS } from './glyph-paths';
import { PartsOfSystemFigure } from './parts-of-system-figure';
import { isFrGated } from './review-gates';
import { usePrintOnly } from './use-print-only';

export { UrgentExit };

const RESTYLE_KINDS = new Set<FigureMeta['kind']>([
  'takeIn',
  'columns',
  'containers',
  'lanes',
  'doors',
  'changeRoutine',
]);

/* True when a figure carries the card's own sentences, so the plain list is not repeated. */
export function restylesCard(figures: FigureMeta[] | undefined) {
  return Boolean(figures?.some((figure) => RESTYLE_KINDS.has(figure.kind)));
}

/*
 * Interactive modules. A card carrying one renders open with no toggle, the
 * same as a card with an urgent line, so the module is never behind a
 * disclosure.
 */
export const MODULE_KINDS: ReadonlySet<FigureMeta['kind']> = new Set<FigureMeta['kind']>([
  'changeRoutine',
  'supplyList',
  'goBag',
  'gapCompare',
  'fibreClocks',
  'partsOfSystem',
]);

/*
 * Modules that render the chapter's emergency signpost themselves, as approved
 * on the visual review: the pouch change walk-through, the who-to-ask lanes,
 * the gap comparison and the fibre clocks. A card that carries one of these
 * never gets a second copy of the same line from the row.
 */
const EXIT_CARRYING_KINDS: ReadonlySet<FigureMeta['kind']> = new Set<FigureMeta['kind']>([
  'lanes',
  'changeRoutine',
  'gapCompare',
  'fibreClocks',
]);

/*
 * Modules the row itself signposts (CardExit in chapter-page.tsx). Only the
 * supply list earns one: it is the single card on the chapter whose band holds
 * a shopping tool, so the emergency line sits in the card body above it, never
 * beside a thing to buy. It goes when the band goes — on /fr the supply list
 * waits on a review gate, and with it the band and this line both drop.
 *
 * The go-bag card is deliberately not here. Its band is one same-page link back
 * to the list on the card above, and the approved prototype carries no signpost
 * on either supply card; repeating the same sentence on four cards in a row
 * dilutes it rather than reinforcing it.
 */
const ROW_EXIT_KINDS: ReadonlySet<FigureMeta['kind']> = new Set<FigureMeta['kind']>(['supplyList']);

/*
 * `exitFallback` is the second way a row earns one, and it is set rather than
 * authored: this locale's review gate dropped a module that was carrying the
 * chapter's emergency signpost at a list on another page, so the row prints it
 * where the module would have been (chapters-meta.ts `exitWhenGated`). It still
 * defers to a module that is present, so the line is never shown twice.
 */
export function needsCardExit(card: Pick<CategoryCard, 'exitFallback' | 'figures'>) {
  const figures = card.figures ?? [];

  if (figures.some((figure) => EXIT_CARRYING_KINDS.has(figure.kind))) return false;

  return card.exitFallback === true || figures.some((figure) => ROW_EXIT_KINDS.has(figure.kind));
}

/*
 * Whether any card on the chapter already prints the chapter's emergency
 * signpost in this locale — either from a module that carries it
 * (EXIT_CARRYING_KINDS) or from the row itself (needsCardExit).
 *
 * The band after the cards repeats that signpost only to stand in for a module
 * that is not there (ProgramsBand in chapter-page.tsx), so this is the question
 * it has to ask. Pass the COMPOSED cards: `gateFigures` in chapters-data.ts has
 * already dropped the modules this locale is not showing, and has set
 * `exitFallback` on any card whose dropped module was carrying the signpost. So
 * on Chapter 03 the answer is yes in both locales — the fibre clocks on /en, the
 * clocks' card on /fr — and the funding band stays out of it either way.
 */
export function showsChapterExit(
  categories: Array<Pick<CategoryCard, 'exitFallback' | 'figures'>>,
) {
  return categories.some(
    (card) =>
      card.figures?.some((figure) => EXIT_CARRYING_KINDS.has(figure.kind)) || needsCardExit(card),
  );
}

/*
 * Figures that render the card's closing note themselves, so the row does not
 * repeat it: the take-in card, and the fibre clocks, which lead with the note
 * so "your surgical team's call" is read before either duration.
 */
export const NOTE_CARRYING_KINDS: ReadonlySet<FigureMeta['kind']> = new Set<FigureMeta['kind']>([
  'takeIn',
  'fibreClocks',
]);

/*
 * Pinned open with no toggle: the card carries a same-day, emergency or crisis
 * line, or an interactive module.
 */
export function isPinnedCard(card: Pick<CategoryCard, 'urgentContent' | 'figures'>) {
  return (
    Boolean(card.urgentContent) ||
    Boolean(card.figures?.some((figure) => MODULE_KINDS.has(figure.kind)))
  );
}

/* ------------------------------------------------------------------------- */
/* Symbols                                                                    */
/* ------------------------------------------------------------------------- */

/*
 * Rendered once per page. Never display:none — a hidden sprite breaks <use> in
 * some browsers — so it is sized to nothing and taken out of flow instead.
 */
export function FigureGlyphs() {
  const symbols = Object.entries(GLYPH_PATHS)
    .map(([name, path]) => `<symbol id="oc-g-${name}" viewBox="0 0 24 24">${path}</symbol>`)
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
 * written, so it cannot drift from the chips a reader will actually meet.
 */
function useReferralLine(cards: Array<{ ask?: AskRole }>) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const messages = useMessages();
  const locale = useLocale();
  const roleNames: Record<string, string> = messages.OstomyCare.ui.chapter.roleNames;

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
}: {
  segment: NonNullable<Chapter['startHere']>['segments'][number];
}) {
  const referral = useReferralLine(segment.cards);

  return (
    <div className="oc-fig-seg">
      <p className="oc-fig-seg-label">{segment.label}</p>
      <ol>
        {segment.cards.map((card) => (
          <li key={card.number}>
            <a href={`#card-${card.number}`}>{card.title}</a>
          </li>
        ))}
      </ol>
      {referral ? <p className="oc-fig-seg-ref">{referral}</p> : null}
    </div>
  );
}

/*
 * The surgery line: which half of the chapter is yours, and a jump to each card.
 * Plain anchor links — no filter, no fill, no "you are here".
 */
export function StartHereLine({ startHere }: { startHere: NonNullable<Chapter['startHere']> }) {
  const t = useTranslations('OstomyCare.ui.chapter');
  const [first, second] = startHere.segments;

  return (
    <nav aria-label={t('startHere.nav')} className="oc-fig-sline">
      {first ? <StartHereSegment segment={first} /> : null}
      <div aria-hidden className="oc-fig-pivot">
        <span>{startHere.pivot}</span>
      </div>
      {second ? <StartHereSegment segment={second} /> : null}
    </nav>
  );
}

/* ------------------------------------------------------------------------- */
/* Card figures                                                               */
/* ------------------------------------------------------------------------- */

/* 9-8-8, word for word, with tap-to-call and tap-to-text. */
function CrisisStrip() {
  const t = useTranslations('OstomyCare.ui.chapter.crisis');

  return (
    <div className="oc-fig-crisis">
      <p>{t('body')}</p>
      <div className="oc-fig-crisis-actions">
        <a href="tel:988">
          <Glyph name="phone" />
          {t('call')}
        </a>
        <a href="sms:988">
          <Glyph name="text" />
          {t('text')}
        </a>
      </div>
    </div>
  );
}

function RoutesFigure({
  figure,
  card,
}: {
  figure: Extract<FigureMeta, { kind: 'routes' }>;
  card: CategoryCard;
}) {
  const t = useTranslations('OstomyCare.ui.chapter');
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
  figure: Extract<FigureMeta, { kind: 'criteria' }>;
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
 */
function TakeInFigure({ card }: { card: CategoryCard }) {
  const t = useTranslations('OstomyCare.ui.chapter.takeIn');
  const ref = useRef<HTMLDivElement>(null);
  const { ready, print } = usePrintOnly(ref);

  return (
    <div className="oc-fig-takein" ref={ref}>
      <p className="oc-fig-heading">{card.title}</p>
      <ol>
        {(card.items ?? []).map((item, index) => (
          <li key={`${index}-${item}`}>
            {item}
            <span aria-hidden className="oc-fig-ruled" />
          </li>
        ))}
      </ol>
      <p className="sr-only">{t('notesHint')}</p>
      {card.note ? <p className="oc-fig-detail">{card.note}</p> : null}
      {ready ? (
        <button className="oc-fig-print" onClick={print} type="button">
          <Glyph name="print" />
          {t('print')}
        </button>
      ) : null}
    </div>
  );
}

function ColumnsFigure({
  figure,
  card,
}: {
  figure: Extract<FigureMeta, { kind: 'columns' }>;
  card: CategoryCard;
}) {
  const headings = card.figureText?.columns ?? [];

  return (
    <div className="oc-fig-columns">
      <div className="oc-fig-grid">
        {figure.columns.map((items, index) => (
          <section key={headings[index] ?? index}>
            <p className="oc-fig-colhead">{headings[index]}</p>
            <ul>
              {items.map((item) => (
                <li key={item}>{itemText(card, item)}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {figure.neutral?.map((item) => (
        <p className="oc-fig-neutral" key={item}>
          {itemText(card, item)}
        </p>
      ))}
    </div>
  );
}

function ContainersFigure({
  figure,
  card,
}: {
  figure: Extract<FigureMeta, { kind: 'containers' }>;
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
                {itemText(card, entry.item)}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/*
 * The topic filter over the lanes (C09). It loads after hydration and only
 * where its French is cleared, so with JavaScript off — and on /fr until the
 * `finder` gate opens — the card is exactly the plain lanes it always was.
 */
const LanesTopics = dynamic(() => import('./lanes-topics').then((mod) => mod.LanesTopics), {
  ssr: false,
});

type LaneMeta = Extract<FigureMeta, { kind: 'lanes' }>['lanes'][number];

/*
 * What a lane can be marked for. Liivv's own service can only ever match the
 * product topic, whatever the data says: a lane that sells must never answer
 * "the stoma, fit or skin".
 */
function laneTopics(lane: LaneMeta): LaneTopic[] {
  if (!lane.service) return lane.topics;

  return lane.topics.filter((topic) => topic === 'product');
}

/*
 * One lane. `fits` is the badge text, present only where the filter renders;
 * it is server-rendered hidden beside every lane, and the island un-hides the
 * ones that fit — so a marked lane is never marked by colour alone.
 */
function Lane({
  card,
  fits,
  href,
  lane,
  text,
}: {
  card: CategoryCard;
  fits: string | undefined;
  href: string | undefined;
  lane: LaneMeta;
  text: FigureText['lanes'][number] | undefined;
}) {
  const body = lane.item === undefined ? text?.body : itemText(card, lane.item);

  return (
    <li
      className={lane.service ? 'oc-fig-lane is-service' : 'oc-fig-lane'}
      data-topics={fits === undefined ? undefined : laneTopics(lane).join(' ')}
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
      {body ? <p>{body}</p> : null}
      {href !== undefined && text?.linkLabel ? (
        <p className="oc-fig-lane-link">
          <a href={href} hrefLang={lane.hrefLang}>
            <OutboundLabel hrefLang={lane.hrefLang} label={text.linkLabel} />
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
  figure: Extract<FigureMeta, { kind: 'lanes' }>;
  card: CategoryCard;
  exit?: Chapter['urgentExit'];
}) {
  const locale = useLocale();
  const rootRef = useRef<HTMLDivElement>(null);
  const text = card.figureText;

  /*
   * On /fr until the `finder` gate opens: the reviewed lanes only, with no
   * link labels and no filter. Every lane the French review covered carries
   * one of the card's own sentences, so `item` is what tells them apart.
   */
  const gated = isFrGated('finder', locale);
  const shown = figure.lanes
    .map((lane, index) => ({ lane, index }))
    .filter(({ lane }) => !gated || lane.item !== undefined);
  const filtered = !gated && Boolean(text?.fits) && figure.topicKeys.length > 0;
  const laneOf = ({ lane, index }: { lane: LaneMeta; index: number }) => (
    <Lane
      card={card}
      fits={filtered ? text?.fits : undefined}
      href={gated ? undefined : lane.href}
      key={`lane-${index}`}
      lane={lane}
      text={text?.lanes[index]}
    />
  );
  const rows = shown.filter(({ lane }) => !lane.service);
  const serviceRows = shown.filter(({ lane }) => lane.service);

  return (
    <div className="oc-fig-lanes-wrap" ref={rootRef}>
      {exit ? <UrgentExit exit={exit} /> : null}
      <FrDraftMarker gate="finder" />
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
  figure: Extract<FigureMeta, { kind: 'doors' }>;
  card: CategoryCard;
}) {
  const labels = card.figureText?.doors ?? [];
  /* A plain <a>, so the /fr prefix has to be put on by hand — chapters-data.ts. */
  const locale = useLocale();

  return (
    <ul className="oc-fig-doors">
      {figure.doors.map((door, index) => (
        <li key={door.item}>
          <a href={localeHref(chapterHref(door.chapter), locale)}>
            <Glyph name={door.glyph} />
            <span>
              <b>{labels[index]}</b> {itemText(card, door.item)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/*
 * Figures that sit in the card's visible body, in meta order. Routes are
 * rendered separately by the row because they replace the card's single chip
 * at its foot.
 */
export function CardFigures({ card, exit }: { card: CategoryCard; exit?: Chapter['urgentExit'] }) {
  return (card.figures ?? []).map((figure, index) => {
    const key = `${figure.kind}-${index}`;

    switch (figure.kind) {
      case 'crisis':
        return <CrisisStrip key={key} />;

      case 'criteria':
        return <CriteriaFigure card={card} figure={figure} key={key} />;

      case 'takeIn':
        return <TakeInFigure card={card} key={key} />;

      case 'columns':
        return <ColumnsFigure card={card} figure={figure} key={key} />;

      case 'containers':
        return <ContainersFigure card={card} figure={figure} key={key} />;

      case 'lanes':
        return <LanesFigure card={card} exit={exit} figure={figure} key={key} />;

      case 'doors':
        return <DoorsFigure card={card} figure={figure} key={key} />;

      case 'changeRoutine':
        return <ChangeRoutineFigure card={card} exit={exit} figure={figure} key={key} />;

      case 'gapCompare':
        return <GapCompareFigure card={card} exit={exit} key={key} />;

      /*
       * Held in chapters-meta.ts, so `gateFigures` never hands this case a
       * figure today. The case stays wired up so lifting the hold is one line.
       */
      case 'partsOfSystem':
        return <PartsOfSystemFigure card={card} key={key} />;

      case 'fibreClocks':
        return <FibreClocksFigure card={card} exit={exit} figure={figure} key={key} />;

      /*
       * Every word this figure shows is shared (`ui.chapter.anatomy`) rather
       * than written per card, because the same picture names the same parts
       * wherever it is placed. It takes no props for that reason.
       */
      case 'bowelReference':
        return <BowelReferenceFigure key={key} />;

      default:
        return null;
    }
  });
}

export function CardRoutes({ card }: { card: CategoryCard }) {
  const routes = card.figures?.filter(
    (figure): figure is Extract<FigureMeta, { kind: 'routes' }> => figure.kind === 'routes',
  );

  if (!routes?.length) return null;

  return routes.map((figure, index) => <RoutesFigure card={card} figure={figure} key={index} />);
}
