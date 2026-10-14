'use client';

/*
 * =============================================================================
 * IS IT SLEEP APNEA? — THE CHAPTER'S OWN FIGURES
 * =============================================================================
 * Two of this site's figure kinds, registered in ./site-figures.tsx: the signs
 * checklist (card 4) and the AHI scale (card 9). Ports of Diabetes Care's
 * clues checklist and target-range ruler (../../diabetes-care/chapters), into
 * Sleep's own file with `sa-` classes and SleepApneaCare words; the Diabetes
 * components stay where they are, so no Diabetes page changes.
 *
 * Neither stores, sends or scores anything. Ticks live in component state
 * only: no localStorage (health information should not outlast the tab on a
 * shared device), no URL, no analytics, no request. Neither works out a
 * diagnosis, a risk or a result, and neither says "you may have…".
 *
 * Both are complete in the server HTML. The checklist's tick boxes and its
 * print and clear buttons appear after hydration, so with JavaScript off it is
 * the card's plain lists; the scale has nothing to press at all.
 *
 * No product, brand, price or cart action appears in either.
 * =============================================================================
 */

import { useTranslations } from 'next-intl';
import { type CSSProperties, type RefObject, useRef, useState } from 'react';

import type { CategoryCard, CategorySection } from '../../_microsite/chapters/compose';
import { CardText, FrDraftMarker, Glyph } from '../../_microsite/chapters/figure-parts';
import { CardPrintFoot, CardPrintHead } from '../../_microsite/print/card-print';
import { usePrintOnly } from '../../_microsite/print/use-print-only';

import type { FigureMeta } from './chapters-meta';
import { entry, text } from './figure-words';

type SignsChecklist = Extract<FigureMeta, { kind: 'signsChecklist' }>;
type AhiScale = Extract<FigureMeta, { kind: 'ahiScale' }>;

/*
 * `total` numbered lines of a `figure` key, in order. The count is the meta's,
 * so a translation can neither add a line nor drop one; a missing line is left
 * out rather than shown blank.
 */
function lines(node: unknown, total: number) {
  return Array.from({ length: total }, (_, index) => text(node, String(index + 1))).filter(Boolean);
}

/* ------------------------------------------------------------------------- */
/* The signs checklist                                                        */
/* ------------------------------------------------------------------------- */

/* One section of the card, as the plain card body draws it. */
function PlainSection({ card, section }: { card: CategoryCard; section: CategorySection }) {
  return (
    <div className="oc-ch-subsection">
      <h4>{section.heading}</h4>
      <ul>
        {section.items.map((item, index) => (
          <li key={`${index}-${item}`}>
            <CardText card={card} text={item} />
          </li>
        ))}
      </ul>
      {section.note ? (
        <p className="oc-ch-row-note">
          <CardText card={card} text={section.note} />
        </p>
      ) : null}
    </div>
  );
}

/*
 * The one sheet the print button produces, headed "Questions to bring to your
 * doctor": the "Not a diagnostic tool" banner, the signs ticked, or every sign
 * in an empty box when none is, and the questions, each with a ruled line to
 * write the answer on. It is display:none on screen and prints only through
 * the button (./sa-figures.css); the browser's own print prints the card as it
 * is on screen.
 */
function SignsSheet({
  banner,
  signs,
  heading,
  questions,
  ticked,
}: {
  banner?: string;
  signs: string[];
  heading: string;
  questions: string[];
  ticked: ReadonlySet<number>;
}) {
  const t = useTranslations('SleepApneaCare.ui.signsChecklist');
  const none = ticked.size === 0;

  return (
    <div className="sa-fig-signs-sheet">
      {banner ? <p className="sa-fig-signs-banner">{banner}</p> : null}
      <p className="sa-fig-signs-sheet-head">{t('signsTicked')}</p>
      {none ? <p className="oc-fig-detail">{t('noneTicked')}</p> : null}
      <ul className="sa-fig-signs-sheet-list">
        {signs.map((sign, index) =>
          none || ticked.has(index + 1) ? (
            <li key={`${index}-${sign}`}>
              {none ? <span aria-hidden className="sa-fig-signs-box" /> : <Glyph name="check" />}
              <span>{sign}</span>
            </li>
          ) : null,
        )}
      </ul>
      <p className="oc-fig-heading">{heading}</p>
      <ol className="sa-fig-signs-sheet-questions">
        {questions.map((question, index) => (
          <li key={`${index}-${question}`}>
            {question}
            <span className="sa-fig-signs-answer">{t('answer')}</span>
            <span aria-hidden className="oc-fig-ruled" />
          </li>
        ))}
      </ol>
    </div>
  );
}

/* The tick boxes for the signs section, once hydrated; the plain list before that. */
function SignTicks({
  signs,
  legend,
  ready,
  ticked,
  onToggle,
  firstBoxRef,
}: {
  signs: string[];
  legend: string;
  ready: boolean;
  ticked: ReadonlySet<number>;
  onToggle: (item: number) => void;
  firstBoxRef: RefObject<HTMLInputElement | null>;
}) {
  if (!ready) {
    return (
      <ul>
        {signs.map((sign, index) => (
          <li key={`${index}-${sign}`}>{sign}</li>
        ))}
      </ul>
    );
  }

  return (
    <fieldset className="sa-fig-ticks">
      <legend className="sa-fig-ticks-legend">{legend}</legend>
      <ul>
        {signs.map((sign, index) => (
          <li key={`${index}-${sign}`}>
            <label className="sa-fig-tick">
              <input
                checked={ticked.has(index + 1)}
                onChange={() => onToggle(index + 1)}
                ref={index === 0 ? firstBoxRef : undefined}
                type="checkbox"
              />
              <span>{sign}</span>
            </label>
          </li>
        ))}
      </ul>
    </fieldset>
  );
}

/*
 * "Signs to mention to your doctor" (Is It Sleep Apnea? card 4). It draws the
 * whole card: the card's note first, as a fixed banner ("Not a diagnostic
 * tool") that never collapses and has no close control; then every section in
 * order, with section `figure.section` (the signs) as tick boxes, each
 * labelled with the item's own sentence so nothing is paraphrased; sections 1
 * and 3 stay plain lists, never tick boxes; then the questions to bring.
 *
 * Ticking changes nothing else on the page: no count, no score, no result.
 * "Clear my ticks" empties every box and puts focus on the first one.
 *
 * The card is `urgentContent` (its banner carries the drowsy-driving
 * signpost), so the figure is kept on /fr whatever its gate says.
 */
export function SignsChecklistFigure({
  card,
  figure,
}: {
  card: CategoryCard;
  figure: SignsChecklist;
}) {
  const t = useTranslations('SleepApneaCare.ui.signsChecklist');
  const rootRef = useRef<HTMLDivElement>(null);
  const firstBoxRef = useRef<HTMLInputElement>(null);
  const [ticked, setTicked] = useState<ReadonlySet<number>>(new Set());
  const words = card.figureWords;
  const sections = card.sections ?? [];
  const signs = sections[figure.section - 1]?.items ?? [];
  const questions = lines(entry(words, 'questions'), figure.questions);
  const printHeading = text(words, 'printHeading');
  const { ready, print } = usePrintOnly(rootRef, { title: printHeading });

  const toggle = (item: number) =>
    setTicked((current) => {
      const next = new Set(current);

      if (next.has(item)) next.delete(item);
      else next.add(item);

      return next;
    });

  /*
   * Clearing disables the button that was pressed, and a disabled button
   * drops keyboard focus to the top of the page. Focus moves to the first tick
   * box first, so a keyboard reader stays where they were.
   */
  const clearTicks = () => {
    firstBoxRef.current?.focus();
    setTicked(new Set());
  };

  return (
    <div className="sa-fig-signs" ref={rootRef}>
      {ready ? <CardPrintHead title={card.title} /> : null}
      <FrDraftMarker gate="signsChecklist" />

      {card.note ? (
        <p className="sa-fig-signs-banner" role="note">
          <CardText card={card} text={card.note} />
        </p>
      ) : null}

      <div className="sa-fig-signs-screen">
        {sections.map((section, index) =>
          index + 1 === figure.section ? (
            <div className="oc-ch-subsection sa-fig-signs-section" key={section.heading}>
              <h4>{section.heading}</h4>
              <SignTicks
                firstBoxRef={firstBoxRef}
                legend={text(words, 'legend')}
                onToggle={toggle}
                ready={ready}
                signs={signs}
                ticked={ticked}
              />
              {section.note ? <p className="oc-ch-row-note">{section.note}</p> : null}
            </div>
          ) : (
            <PlainSection card={card} key={section.heading} section={section} />
          ),
        )}

        {questions.length ? (
          <div className="oc-ch-subsection sa-fig-signs-questions">
            <h4>{printHeading}</h4>
            <ol>
              {questions.map((question, index) => (
                <li key={`${index}-${question}`}>{question}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {ready ? (
          <div className="sa-fig-actions">
            <button className="oc-fig-print" onClick={print} type="button">
              <Glyph name="print" />
              {t('print')}
            </button>
            <button
              className="oc-fig-print sa-fig-clear"
              disabled={ticked.size === 0}
              onClick={clearTicks}
              type="button"
            >
              {t('clear')}
            </button>
          </div>
        ) : null}
      </div>

      {ready ? (
        <SignsSheet
          banner={card.note}
          heading={printHeading}
          questions={questions}
          signs={signs}
          ticked={ticked}
        />
      ) : null}

      {ready ? <CardPrintFoot card={card} /> : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The AHI scale                                                              */
/* ------------------------------------------------------------------------- */

/* Where a value sits along the scale, as a percentage of its length. */
function scaleAt(scale: AhiScale['scale'], value: number) {
  const share = (value - scale.min) / (scale.max - scale.min);

  return `${Math.min(100, Math.max(0, share * 100))}%`;
}

/* Every 5 events an hour, from the scale's start to its end. */
function scaleTicks(scale: AhiScale['scale']) {
  return Array.from(
    { length: Math.floor((scale.max - scale.min) / 5) + 1 },
    (_, index) => scale.min + index * 5,
  );
}

/*
 * The adult AHI bands as labelled bars over one scale of breathing events an
 * hour: normal under 5, mild 5 to 14, moderate 15 to 29, severe 30 or more,
 * the edges exactly as card 9's own items 3 and 4 give them. It augments the
 * card, whose sentences carry every number, and it reads a report, it does not
 * test anyone: nothing to type in, no slider, no marker, nothing read back.
 *
 * Each band is labelled in words above its bar, so no band is told by colour
 * alone; severe has no upper edge, so its bar runs off the end of the scale
 * with an arrow. The drawing is hidden from assistive technology: the same
 * labels follow as a plain list, which is what a screen reader reads and what
 * prints. Under it, always: the bands are for adults (19 and over), and the
 * sleep doctor weighs more than the number.
 */
export function AhiScaleFigure({ card, figure }: { card: CategoryCard; figure: AhiScale }) {
  const words = entry(card.figureWords, 'scale');
  const labels = entry(words, 'zones');
  const unit = text(words, 'unit');
  /* Always under the bars: the bands are for adults (`adultsOnly`). */
  const adultsNote = text(words, 'adultsNote');
  const teamNote = text(words, 'teamNote');
  const { scale } = figure;

  const zones = figure.zones.map((zone) => {
    const start = zone.below === undefined ? (zone.from ?? scale.min) : scale.min;
    /* A band's top edge is the next band's start ("5 to 14" ends where 15 begins). */
    const end = zone.below ?? (zone.to === undefined ? scale.max : zone.to + 1);
    /* CSS custom properties, typed without an assertion. */
    const bar: CSSProperties & Record<string, string> = {
      '--sa-from': scaleAt(scale, start),
      '--sa-to': scaleAt(scale, end),
    };

    return {
      key: zone.key,
      label: text(labels, zone.key),
      openEnd: zone.below === undefined && zone.to === undefined,
      bar,
    };
  });

  return (
    <figure className="sa-fig-scale">
      <FrDraftMarker gate="ahiScale" />
      <figcaption className="oc-fig-heading">{text(words, 'heading')}</figcaption>

      <div aria-hidden className="sa-fig-scale-ruler">
        {zones.map((zone) => (
          <div className={`sa-fig-scale-row is-${zone.key}`} key={zone.key}>
            <span className="sa-fig-scale-label">{zone.label}</span>
            <span className="sa-fig-scale-track">
              <span
                className={zone.openEnd ? 'sa-fig-scale-bar is-open' : 'sa-fig-scale-bar'}
                style={zone.bar}
              />
              {zone.openEnd ? <span className="sa-fig-scale-arrow">→</span> : null}
            </span>
          </div>
        ))}
        <div className="sa-fig-scale-axis">
          {scaleTicks(scale).map((tick) => {
            const at: CSSProperties & Record<string, string> = { '--sa-at': scaleAt(scale, tick) };

            return (
              <span className="sa-fig-scale-tick" key={tick} style={at}>
                {tick}
              </span>
            );
          })}
        </div>
        {unit ? <span className="sa-fig-scale-unit">{unit}</span> : null}
      </div>

      <ul className="sa-fig-scale-list">
        {zones.map((zone) => (zone.label ? <li key={zone.key}>{zone.label}</li> : null))}
      </ul>

      {adultsNote ? <p className="oc-fig-detail sa-fig-scale-note">{adultsNote}</p> : null}
      {teamNote ? <p className="oc-fig-detail sa-fig-scale-note">{teamNote}</p> : null}
    </figure>
  );
}
