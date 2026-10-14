'use client';

/*
 * =============================================================================
 * EVERYDAY "LIIVVING" — THE CHAPTER'S OWN FIGURES
 * =============================================================================
 * Two of this site's figure kinds, registered in ./site-figures.tsx: the
 * resupply planner (card 3) and the trip list (card 8). Every word is the
 * card's own `figure` messages; the structure is chapters-meta.ts.
 *
 * Neither stores, sends or compares anything. What a reader marks, ticks or
 * types lives in component state and is gone when the page is left: no
 * localStorage, no URL, no analytics, no request. The planner's dates are
 * arithmetic only (./resupply-math.ts), never advice on when to replace a
 * part, and it says so under every result. No product, subscription, price
 * or shop link appears in either; the card's own shop strip, when the site
 * places one, sits below the card, outside the figure.
 * =============================================================================
 */

import { createTranslator, useLocale } from 'next-intl';
import { type RefObject, useRef, useState } from 'react';

import { SourceChip } from '../../_microsite/_components/source-chip';
import type { CategoryCard } from '../../_microsite/chapters/compose';
import { CardItem, FrDraftMarker, Glyph, itemText } from '../../_microsite/chapters/figure-parts';
import { CardPrintFoot, CardPrintHead } from '../../_microsite/print/card-print';
import { usePrintOnly } from '../../_microsite/print/use-print-only';
import { useSiteSources } from '../../_microsite/site-context';
import { lookUpSources } from '../../_microsite/sources';

import type { FigureMeta, ResupplyColumn, ResupplyPart, ResupplyPayer } from './chapters-meta';
import { entry, text } from './figure-words';
import {
  addPeriod,
  cellPeriods,
  everyFromPerYear,
  parseInputDate,
  type Period,
} from './resupply-math';

type ResupplyPlanner = Extract<FigureMeta, { kind: 'resupplyPlanner' }>;
type TripList = Extract<FigureMeta, { kind: 'tripList' }>;

/*
 * A `figure` message with ICU arguments ("{count, plural, …}"), filled in for
 * the page locale. The card's figure messages reach a site figure as they are
 * (`card.figureWords`), so they are formatted here, as Diabetes Care's tool
 * figures do. A missing message stays empty.
 */
function useFill() {
  const locale = useLocale();

  return (message: string, values: Record<string, string | number>) =>
    message ? createTranslator({ locale, messages: { message } })('message', values) : '';
}

/* ------------------------------------------------------------------------- */
/* The resupply planner                                                       */
/* ------------------------------------------------------------------------- */

/* Which columns a payer outlines. "A private or work plan" outlines none. */
const MARKS: Record<ResupplyPayer, readonly ResupplyColumn[]> = {
  nihb: ['nihb'],
  bcea: ['bcea'],
  ontario: ['ontario'],
  plan: [],
  self: ['manual', 'general'],
};

interface PlannerWords {
  words: unknown;
  schedules: unknown;
  rows: unknown;
  cells: unknown;
}

function plannerWords(card: CategoryCard): PlannerWords {
  const words = card.figureWords;

  return {
    words,
    schedules: entry(words, 'schedules'),
    rows: entry(words, 'rows'),
    cells: entry(words, 'cells'),
  };
}

/* The words of one cell: the manual column says "Check your manual" in every row. */
function cellText(words: PlannerWords, column: ResupplyColumn, part: ResupplyPart) {
  if (column === 'manual') return text(entry(words.schedules, 'manual'), 'cell');

  return text(entry(words.cells, column), part);
}

/* "{period}": a number of months or weeks, worded for the page locale. */
function usePeriodWords(words: unknown) {
  const fill = useFill();

  return (period: Period) =>
    'months' in period
      ? fill(text(words, 'intervalMonths'), { n: period.months })
      : fill(text(words, 'intervalWeeks'), { n: period.weeks });
}

/* The "Who pays?" choices: radio chips that outline a column, never hide or rank one. */
function PayerChoices({
  figure,
  words,
  payer,
  onChange,
}: {
  figure: ResupplyPlanner;
  words: unknown;
  payer: ResupplyPayer | '';
  onChange: (next: ResupplyPayer) => void;
}) {
  const payerWords = entry(words, 'payer');
  const options = entry(payerWords, 'options');
  const name = `sa-payer-${figure.columns.join('-')}`;
  const note = payer === 'plan' || payer === 'self' ? text(payerWords, `${payer}Note`) : '';

  return (
    <fieldset className="sa-fig-ticks sa-fig-payer">
      <legend className="sa-fig-ticks-legend">{text(payerWords, 'legend')}</legend>
      <div className="sa-fig-payer-options">
        {figure.payers.map((option) => (
          <label className={payer === option ? 'sa-fig-radio is-on' : 'sa-fig-radio'} key={option}>
            <input
              checked={payer === option}
              name={name}
              onChange={() => onChange(option)}
              type="radio"
              value={option}
            />
            <span>{text(options, option)}</span>
          </label>
        ))}
      </div>
      <p aria-live="polite" className="sa-fig-status">
        {payer ? [text(payerWords, 'status'), note].filter(Boolean).join(' ') : ''}
      </p>
    </fieldset>
  );
}

/* A column's header: its label, its kind badge and its own chips. */
function ColumnHead({
  card,
  column,
  words,
  sources,
  marked,
}: {
  card: CategoryCard;
  column: ResupplyColumn;
  words: PlannerWords;
  sources: readonly string[];
  marked: boolean;
}) {
  const map = useSiteSources();
  const own = entry(words.schedules, column);
  const label = text(own, 'label');

  return (
    <th className={marked ? 'is-marked' : undefined} scope="col">
      <span className="sa-fig-plan-col">{label}</span>
      <span className="sa-fig-plan-kind">{text(own, 'kind')}</span>
      {map ? (
        <SourceChip
          className="sa-fig-chip"
          label={`${card.title} — ${label}`}
          sources={lookUpSources(map, sources)}
        />
      ) : null}
    </th>
  );
}

/* The dates a cell's period gives from the reader's "last replaced" date, if any. */
function CellDates({
  periods,
  start,
  words,
}: {
  periods: Period[];
  start: Date | undefined;
  words: unknown;
}) {
  const locale = useLocale();
  const fill = useFill();
  const periodWords = usePeriodWords(words);

  if (!start || !periods.length) return null;

  const format = new Intl.DateTimeFormat(locale, { dateStyle: 'long' });
  const result = text(entry(words, 'dateCalc'), 'result');

  return (
    <ul className="sa-fig-plan-dates">
      {periods.map((period) => (
        <li key={JSON.stringify(period)}>
          {fill(result, {
            period: periodWords(period),
            start: format.format(start),
            date: format.format(addPeriod(start, period)),
          })}
        </li>
      ))}
    </ul>
  );
}

/* One cell: its words, the count a year as a period where it has one, and any dates. */
function PlanCell({
  figure,
  words,
  column,
  part,
  start,
  marked,
}: {
  figure: ResupplyPlanner;
  words: PlannerWords;
  column: ResupplyColumn;
  part: ResupplyPart;
  start: Date | undefined;
  marked: boolean;
}) {
  const fill = useFill();
  const periodWords = usePeriodWords(words.words);
  const perYear = figure.perYear[column]?.[part];
  const periods = cellPeriods(perYear, figure.periodMonths[column]?.[part]);

  return (
    <td className={marked ? 'is-marked' : undefined}>
      {cellText(words, column, part)}
      {perYear === undefined ? null : (
        <span className="sa-fig-plan-every">
          {fill(text(words.words, 'perYear'), {
            count: perYear,
            interval: periodWords(everyFromPerYear(perYear)),
          })}
        </span>
      )}
      <CellDates periods={periods} start={start} words={words.words} />
    </td>
  );
}

/* A row's header: the part, and once hydrated its optional "last replaced" date. */
function PartHead({
  label,
  dateLabel,
  ready,
  value,
  onChange,
}: {
  label: string;
  dateLabel: string;
  ready: boolean;
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <th scope="row">
      <span className="sa-fig-plan-part">{label}</span>
      {ready ? (
        <label className="sa-fig-plan-date">
          <span>{dateLabel}</span>
          <input
            aria-label={`${dateLabel}: ${label}`}
            onChange={(event) => onChange(event.target.value)}
            type="date"
            value={value}
          />
        </label>
      ) : null}
    </th>
  );
}

function PlanTable({
  card,
  figure,
  words,
  marks,
  dates,
  ready,
  onDate,
}: {
  card: CategoryCard;
  figure: ResupplyPlanner;
  words: PlannerWords;
  marks: readonly ResupplyColumn[];
  dates: Partial<Record<ResupplyPart, string>>;
  ready: boolean;
  onDate: (part: ResupplyPart, value: string) => void;
}) {
  const heading = text(words.words, 'heading');
  const dateLabel = text(entry(words.words, 'dateCalc'), 'label');

  return (
    <div
      aria-label={heading}
      className="sa-fig-plan-scroll"
      role="region"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- a scrolling region must take keyboard focus to scroll (WCAG 2.1.1)
      tabIndex={0}
    >
      <table className="sa-fig-plan-table">
        <caption className="sr-only">{heading}</caption>
        <thead>
          <tr>
            <td />
            {figure.columns.map((column) => (
              <ColumnHead
                card={card}
                column={column}
                key={column}
                marked={marks.includes(column)}
                sources={figure.columnSources[column]}
                words={words}
              />
            ))}
          </tr>
        </thead>
        <tbody>
          {figure.rows.map((part) => (
            <tr key={part}>
              <PartHead
                dateLabel={dateLabel}
                label={text(words.rows, part)}
                onChange={(value) => onDate(part, value)}
                ready={ready}
                value={dates[part] ?? ''}
              />
              {figure.columns.map((column) => (
                <PlanCell
                  column={column}
                  figure={figure}
                  key={column}
                  marked={marks.includes(column)}
                  part={part}
                  start={parseInputDate(dates[part] ?? '')}
                  words={words}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/*
 * "Replacement schedules, side by side": the parts a CPAP user replaces, down
 * the side; across, each kind of schedule under its own badge (your manual,
 * first; the general range; NIHB's and BC assistance's funding limits;
 * Ontario's funding; one maker's schedule, always with its credit line). Each
 * column header carries its own chips. A funding limit is what a program pays
 * for, not advice on when to replace a part, and the intro says so.
 *
 * "Who pays for your supplies?" outlines that payer's column; every column
 * stays in the table and nothing is ranked or recommended. A count a year is
 * also shown as a period (2 a year is about one every 6 months). With a
 * "last replaced" date, each cell with a period shows the date it gives,
 * both ends of a range, with the line that says this is arithmetic only. No
 * date for "When worn", "Not listed", "Not covered" or "Check your manual".
 *
 * Without JavaScript the table is all there, with the `noJs` summary above it.
 * The print button prints the table alone, with every column, the credit and
 * any dates entered.
 */
export function ResupplyPlannerFigure({
  card,
  figure,
}: {
  card: CategoryCard;
  figure: ResupplyPlanner;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [payer, setPayer] = useState<ResupplyPayer | ''>('');
  const [dates, setDates] = useState<Partial<Record<ResupplyPart, string>>>({});
  const words = plannerWords(card);
  const heading = text(words.words, 'heading');
  const { ready, print } = usePrintOnly(rootRef, { title: heading });
  const marks = payer ? MARKS[payer] : [];
  const anyDate = Object.values(dates).some((value) => parseInputDate(value));

  return (
    <div className="sa-fig-plan" ref={rootRef}>
      {ready ? <CardPrintHead title={heading} /> : null}
      <FrDraftMarker gate="resupplyPlanner" />
      <p className="oc-fig-heading">{heading}</p>
      <p className="sa-fig-plan-intro">{text(words.words, 'intro')}</p>
      <noscript>
        <p className="sa-fig-plan-intro">{text(words.words, 'noJs')}</p>
      </noscript>

      {ready ? (
        <PayerChoices figure={figure} onChange={setPayer} payer={payer} words={words.words} />
      ) : null}

      <PlanTable
        card={card}
        dates={dates}
        figure={figure}
        marks={marks}
        onDate={(part, value) => setDates((current) => ({ ...current, [part]: value }))}
        ready={ready}
        words={words}
      />

      <p className="oc-fig-detail sa-fig-plan-credit">
        <b>{text(entry(words.schedules, 'maker'), 'label')}:</b>{' '}
        {text(entry(words.schedules, 'maker'), 'credit')}
      </p>
      {anyDate ? (
        <p className="sa-fig-strip">{text(entry(words.words, 'dateCalc'), 'disclaimer')}</p>
      ) : null}
      <p className="oc-fig-detail">{text(words.words, 'footer')}</p>

      {ready ? (
        <button className="oc-fig-print" onClick={print} type="button">
          <Glyph name="print" />
          {text(words.words, 'print')}
        </button>
      ) : null}
      {ready ? <CardPrintFoot card={card} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The trip list                                                              */
/* ------------------------------------------------------------------------- */

function TripTicks({
  card,
  items,
  ready,
  ticked,
  onToggle,
  firstBoxRef,
}: {
  card: CategoryCard;
  items: readonly number[];
  ready: boolean;
  ticked: ReadonlySet<number>;
  onToggle: (item: number) => void;
  firstBoxRef: RefObject<HTMLInputElement | null>;
}) {
  if (!ready) {
    return (
      <ul className="sa-fig-trip-plain">
        {items.map((item) => (
          <li key={item}>
            <CardItem card={card} item={item} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="sa-fig-trip-ticks">
      {items.map((item, index) => (
        <li key={item}>
          <label className="sa-fig-tick">
            <input
              checked={ticked.has(item)}
              onChange={() => onToggle(item)}
              ref={index === 0 ? firstBoxRef : undefined}
              type="checkbox"
            />
            {/* The printed sheet's empty box: paper never shows a tick from the screen. */}
            <span aria-hidden className="sa-fig-signs-box" />
            <span>{itemText(card, item)}</span>
          </label>
        </li>
      ))}
    </ul>
  );
}

/*
 * "Pack list" (Everyday "Liivving" card 8). It restyles the card: its first
 * sentence (keep using your treatment; bring your CPAP everywhere you sleep)
 * leads, plain, and the six things to pack are tick boxes, each labelled with
 * the card's own sentence. Ticks are for packing only and are not saved;
 * "Clear ticks" empties them and puts focus on the first box. The print button
 * prints the list with empty boxes, to tick on paper. The card's note (a
 * hospital stay while away) stays visible under it, with its link.
 *
 * No product, shop link or battery line (05 E1, held).
 */
export function TripListFigure({ card, figure }: { card: CategoryCard; figure: TripList }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const firstBoxRef = useRef<HTMLInputElement>(null);
  const [ticked, setTicked] = useState<ReadonlySet<number>>(new Set());
  const words = card.figureWords;
  const heading = text(words, 'heading');
  const { ready, print } = usePrintOnly(rootRef, { title: card.title });

  const toggle = (item: number) =>
    setTicked((current) => {
      const next = new Set(current);

      if (next.has(item)) next.delete(item);
      else next.add(item);

      return next;
    });

  const clearTicks = () => {
    firstBoxRef.current?.focus();
    setTicked(new Set());
  };

  return (
    <div className="sa-fig-trip" ref={rootRef}>
      {ready ? <CardPrintHead title={card.title} /> : null}
      <FrDraftMarker gate="tripList" />
      {figure.lead.map((item) => (
        <p className="oc-ch-lede sa-fig-trip-lead" key={item}>
          <CardItem card={card} item={item} />
        </p>
      ))}
      <p className="oc-fig-heading">{heading}</p>
      {ready ? <p className="oc-fig-detail sa-fig-trip-hint">{text(words, 'hint')}</p> : null}
      <TripTicks
        card={card}
        firstBoxRef={firstBoxRef}
        items={figure.items}
        onToggle={toggle}
        ready={ready}
        ticked={ticked}
      />
      {ready ? (
        <div className="sa-fig-actions">
          <button className="oc-fig-print" onClick={print} type="button">
            <Glyph name="print" />
            {text(words, 'print')}
          </button>
          <button
            className="oc-fig-print sa-fig-clear"
            disabled={ticked.size === 0}
            onClick={clearTicks}
            type="button"
          >
            {text(words, 'reset')}
          </button>
        </div>
      ) : null}
      {ready ? <CardPrintFoot card={card} /> : null}
    </div>
  );
}
