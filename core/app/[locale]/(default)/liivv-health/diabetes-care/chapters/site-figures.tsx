'use client';

/*
 * =============================================================================
 * DIABETES CARE — THE SITE'S OWN FIGURES
 * =============================================================================
 * The figure kinds the shared engine does not draw itself, handed back here
 * through the registry the site's wrapper gives SiteProvider
 * (./dc-chapter-page.tsx). Structure comes from chapters-meta.ts; every word
 * comes from the DiabetesCare messages: the card's own item sentences by
 * number, its `figure` messages (read from `card.figureWords`, whose shape the
 * engine leaves to the site), and `ui.ruleOf15` / `ui.ketoneLadder`. Know
 * Your Type's three figures live in ./type-figures.tsx and Your Tools' five in
 * ./tool-figures.tsx; all are registered here.
 *
 * Every figure is complete in the server HTML. A figure whose French is not
 * yet reviewed is dropped on /fr by the composer (review-gates.ts), and its
 * card falls back to its own plain list, as Ostomy's gated modules do.
 *
 * No product, price or cart action appears in any figure. Brand names appear
 * only in Your Tools' pickers and calculator, as the device's own model name
 * beside a compatibility or label fact (./device-pairings.ts).
 * =============================================================================
 */

import dynamic from 'next/dynamic';
import { useLocale, useTranslations } from 'next-intl';
import { type CSSProperties, useRef } from 'react';

import type { CategoryCard, Chapter } from '../../_microsite/chapters/compose';
import { CardText, FrDraftMarker, Glyph, itemText } from '../../_microsite/chapters/figure-parts';
import { cardHref, localeHref } from '../../_microsite/chapters/hrefs';
import { type SiteFigureRegistry, useSite } from '../../_microsite/site-context';
import { usePrintOnly } from '../../ostomy-care/chapters/use-print-only';

import type { FigureMeta } from './chapters-meta';
/* Reading a card's `figure` messages without a cast: see the file. */
import { entry, numbered, text } from './figure-words';
import { CluesChecklistFigure, FamilyTreeFigure, TestGlossaryFigure } from './type-figures';

type RuleOf15 = Extract<FigureMeta, { kind: 'ruleOf15' }>;
type KetoneLadder = Extract<FigureMeta, { kind: 'ketoneLadder' }>;
type GlucoseRange = Extract<FigureMeta, { kind: 'glucoseRange' }>;

const Controls = dynamic(
  () => import('./rule-of-15-controls').then((mod) => mod.RuleOf15Controls),
  { ssr: false },
);

/*
 * Your Tools' figures (./tool-figures.tsx). Server-rendered like every other
 * figure here, but split into a chunk of their own: they read the source
 * register's titles for their source lines, and only Your Tools needs those
 * in the browser.
 */
const MeterMatchFigure = dynamic(() =>
  import('./tool-figures').then((mod) => mod.MeterMatchFigure),
);
const SensorPickerFigure = dynamic(() =>
  import('./tool-figures').then((mod) => mod.SensorPickerFigure),
);
const PumpPickerFigure = dynamic(() =>
  import('./tool-figures').then((mod) => mod.PumpPickerFigure),
);
const RestockCalcFigure = dynamic(() =>
  import('./tool-figures').then((mod) => mod.RestockCalcFigure),
);
const RotationMapFigure = dynamic(() =>
  import('./tool-figures').then((mod) => mod.RotationMapFigure),
);

/* ------------------------------------------------------------------------- */
/* The Rule of 15                                                             */
/* ------------------------------------------------------------------------- */

/*
 * One line in its adult and its child wording. Every amount the adult wording
 * names ("Take 15 g") has a child wording that points to the age table instead,
 * so "A child" never shows a bare 15 g. The stylesheet shows one of the two:
 * the child wording only while "A child" is selected, and the adult wording
 * otherwise, including before the island runs and with JavaScript off. A line
 * with no child wording is the same for both.
 */
function ByAge({
  adult,
  child,
  as: Tag = 'p',
  className,
}: {
  adult: string;
  child: string;
  as?: 'p' | 'span';
  className?: string;
}) {
  if (!child) return adult ? <Tag className={className}>{adult}</Tag> : null;

  return (
    <>
      <Tag className={className} data-dc-adult-only="">
        {adult}
      </Tag>
      <Tag className={className} data-dc-child-only="">
        {child}
      </Tag>
    </>
  );
}

/*
 * The amounts in step 1: the children's table, then the 15 g list.
 *
 * The table is a real table (age, amount), captioned with `childHeading`. It
 * and its note sit in one wrapper the stylesheet hides while "An adult" is
 * selected; the options named in `hideWhenChild` carry a marker the
 * stylesheet hides while "A child" is. Under the list, `childOptionsNote` says
 * why an option is missing for a child (ruling C18: honey, Health Canada); it
 * shows wherever the children's table does, so in the child view and, before
 * the island runs or with JavaScript off, beside the full list. Nothing here
 * sets `display` on a node the walk-through hides with hidden="until-found".
 */
function RuleOf15Amounts({ figure, words }: { figure: RuleOf15; words: unknown }) {
  const t = useTranslations('DiabetesCare.ui.ruleOf15');
  const rows = numbered(entry(words, 'childRows'));
  const options = numbered(entry(words, 'options'));
  const childNote = text(words, 'childNote');
  const childOptionsNote = text(words, 'childOptionsNote');

  return (
    <>
      {rows.length ? (
        <div className="dc-fig-r15-child">
          <table className="dc-fig-r15-table">
            <caption>{text(words, 'childHeading')}</caption>
            <thead>
              <tr>
                <th scope="col">{t('ageHeader')}</th>
                <th scope="col">{t('amountHeader')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key}>
                  <th scope="row">{text(row.value, 'age')}</th>
                  <td>{text(row.value, 'amount')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {childNote ? <p className="dc-fig-r15-childnote">{childNote}</p> : null}
        </div>
      ) : null}
      {options.length ? (
        <>
          <ByAge
            adult={text(words, 'optionsHeading')}
            child={text(words, 'childOptionsHeading')}
            className="dc-fig-r15-options-head"
          />
          <ul className="dc-fig-r15-options">
            {options.map((option) => (
              <li
                data-dc-adult-only={figure.hideWhenChild.includes(option.key) ? '' : undefined}
                key={option.key}
              >
                {typeof option.value === 'string' ? option.value : ''}
              </li>
            ))}
          </ul>
          {childOptionsNote && rows.length ? (
            <p className="dc-fig-r15-childnote dc-fig-r15-options-note">{childOptionsNote}</p>
          ) : null}
        </>
      ) : null}
    </>
  );
}

/*
 * Treat, wait, check again, and take more if still low, as numbered steps that
 * read whole or one at a time; then the snack, after the loop; then the line
 * for automated insulin systems, under both the adult and the child amounts.
 *
 * Restyles card 2: each of the card's sentences is the lead of a step, or the
 * line after the loop, looked up by number, so every reviewed sentence has
 * one place on the page. The driving note stays outside, in the card.
 *
 * A step with no item sentence of its own takes its body from
 * `figure.stepBodies` (step 3, "Check again", reuses the verified "check your
 * blood sugar again").
 *
 * Under "A child", each title and sentence that names 15 g is swapped for its
 * `figure.childSteps` / `figure.childItems` wording, which points to the age
 * table (ByAge). The 15 g list is never scaled. Sentences that say "your blood
 * sugar" or "your next meal" have child wording too ("their"), including the
 * step-3 body (`figure.childStepBodies`) and the line after the loop.
 *
 * The last step loops back to the second, and says so in words ("back to step
 * 2"); only the arrow is decoration. After the loop, the snack, a pointer to
 * the chapter's red flags, and the automated-system line.
 */
function RuleOf15Figure({ card, figure }: { card: CategoryCard; figure: RuleOf15 }) {
  const t = useTranslations('DiabetesCare.ui.ruleOf15');
  const { anchors } = useSite();
  const rootRef = useRef<HTMLDivElement>(null);
  const { ready, print } = usePrintOnly(rootRef);
  const words = card.figureWords;
  const titles = entry(words, 'steps');
  const bodies = entry(words, 'stepBodies');
  const childTitles = entry(words, 'childSteps');
  const childItems = entry(words, 'childItems');
  const childBodies = entry(words, 'childStepBodies');
  const toggleWords = entry(words, 'toggle');
  const hasChild = numbered(entry(words, 'childRows')).length > 0;
  const total = figure.steps.length;
  const loopTo = total > 2 ? 2 : 1;
  const then = itemText(card, figure.then);
  const childThen = text(childItems, String(figure.then));
  const aidNote = figure.aidNote ? text(words, 'aidNote') : '';

  return (
    <div className="oc-fig-steps-wrap dc-fig-r15" ref={rootRef}>
      <FrDraftMarker gate="ruleOf15" />

      <Controls
        root={rootRef}
        toggle={
          hasChild
            ? {
                legend: text(toggleWords, 'legend'),
                adult: text(toggleWords, 'adult'),
                child: text(toggleWords, 'child'),
              }
            : undefined
        }
      />

      <ol className="oc-fig-steps">
        {figure.steps.map((step, index) => {
          const number = index + 1;
          const key = String(step.key);
          const lead = step.item === undefined ? text(bodies, key) : itemText(card, step.item);
          const childLead =
            step.item === undefined ? text(childBodies, key) : text(childItems, String(step.item));
          const amounts = index === 0;

          return (
            <li id={`dc-r15-step-${step.key}`} key={step.key}>
              <h4 tabIndex={-1}>
                <span className="oc-fig-steps-n">{number}.</span>{' '}
                <span className="sr-only" data-oc-step-of="" hidden>
                  {t('stepOf', { n: String(number), total: String(total) })}
                </span>{' '}
                <ByAge adult={text(titles, key)} as="span" child={text(childTitles, key)} />
                {number === total && total > 1 ? (
                  <>
                    {' '}
                    <span className="dc-fig-r15-loop">
                      <span aria-hidden>↻ </span>
                      {t('loopBack', { n: String(loopTo) })}
                    </span>
                  </>
                ) : null}
              </h4>
              {lead || amounts ? (
                <div className="oc-fig-steps-body">
                  <ByAge adult={lead} child={childLead} className="oc-fig-steps-lead" />
                  {amounts ? <RuleOf15Amounts figure={figure} words={words} /> : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {then ? (
        <div className="dc-fig-r15-then">
          <p className="dc-fig-r15-then-label">{t('then')}</p>
          {childThen ? (
            <>
              <p data-dc-adult-only="">
                <CardText card={card} text={then} />
              </p>
              <p data-dc-child-only="">{childThen}</p>
            </>
          ) : (
            <p>
              <CardText card={card} text={then} />
            </p>
          )}
        </div>
      ) : null}

      <p className="dc-fig-r15-flags">
        {t('redFlagsLead')} <a href={`#${anchors.redFlags.id}`}>{t('redFlagsLink')}</a>
      </p>

      {aidNote ? <p className="dc-fig-r15-aid">{aidNote}</p> : null}

      {ready ? (
        <button className="oc-fig-print" onClick={print} type="button">
          <Glyph name="print" />
          {t('print')}
        </button>
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The ketone ladder                                                          */
/* ------------------------------------------------------------------------- */

/*
 * How far up the ladder a rung is, 1 to 4, so blood and urine rungs that call
 * for the same action share a colour: urine "small" sits with 0.6–1.5,
 * "moderate" with 1.5–3.0, "large" with over 3.0. Rung 4 is the urgent colour,
 * and it also carries the urgent symbol, so it is never told by colour alone.
 */
const URINE_TONE = { small: 2, moderate: 3, large: 4 } as const;

interface Rung {
  key: number;
  range: string;
  action: string;
  tone: number;
}

function Ladder({ heading, rungs }: { heading: string; rungs: Rung[] }) {
  const t = useTranslations('DiabetesCare.ui.ketoneLadder');

  return (
    <section className="dc-fig-ketone-col">
      <h4 className="dc-fig-ketone-head">{heading}</h4>
      <p className="dc-fig-ketone-order">{t('order')}</p>
      <ol className="dc-fig-ketone-rungs">
        {rungs.map((rung) => (
          <li className={`dc-fig-ketone-rung is-tone-${rung.tone}`} key={rung.key}>
            {rung.tone === 4 ? <Glyph name="urgent" /> : null}
            <span>
              <b>{rung.range}</b> {rung.action}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/*
 * Breakthrough T1D's ladder: what to do at each blood and urine ketone
 * reading, labelled in the figure as written for type 1 diabetes (R3). It
 * augments card 7, whose own sentences stay as they are, and it carries the
 * card's note, just above the ladder the note introduces. Never collapsible:
 * card 7 carries the emergency rung, so it is pinned open in every locale.
 * There is nothing to type in, and nothing reads a number back.
 */
function KetoneLadderFigure({ card, figure }: { card: CategoryCard; figure: KetoneLadder }) {
  const words = card.figureWords;
  const blood = entry(words, 'blood');
  const urine = entry(words, 'urine');
  const bloodWords = numbered(entry(blood, 'rungs'));
  const urineWords = numbered(entry(urine, 'rungs'));

  const rungs = (list: Array<{ key: number; value: unknown }>, tones: number[]): Rung[] =>
    list.flatMap(({ key, value }, index) => {
      const tone = tones[index];

      return tone === undefined
        ? []
        : [{ key, range: text(value, 'range'), action: text(value, 'action'), tone }];
    });

  return (
    <div className="dc-fig-ketone-wrap">
      <FrDraftMarker gate="ketoneLadder" />
      {card.note ? (
        <p className="oc-ch-row-note dc-fig-ketone-note">
          <CardText card={card} text={card.note} />
        </p>
      ) : null}
      <figure className="dc-fig-ketone">
        <figcaption className="dc-fig-ketone-for">{text(words, 'writtenFor')}</figcaption>
        <div className="dc-fig-ketone-ladders">
          <Ladder
            heading={text(blood, 'heading')}
            rungs={rungs(
              bloodWords,
              figure.blood.map((_, index) => index + 1),
            )}
          />
          <Ladder
            heading={text(urine, 'heading')}
            rungs={rungs(
              urineWords,
              figure.urine.map((level) => URINE_TONE[level]),
            )}
          />
        </div>
      </figure>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The target-range ruler                                                     */
/* ------------------------------------------------------------------------- */

/* Where a value sits along the ruler, as a percentage of its length. */
function rulerAt(scale: GlucoseRange['scale'], value: number) {
  const share = (value - scale.min) / (scale.max - scale.min);

  return `${Math.min(100, Math.max(0, share * 100))}%`;
}

/*
 * Diabetes Canada's usual targets as labelled bars over one mmol/L scale: low,
 * before meals, two hours after meals, and the guideline's sensor time in
 * range. It augments card 3, whose own sentences carry every number, and sits
 * above the printable "My team's targets" card.
 *
 * The drawing is decoration for sighted readers and is hidden from assistive
 * technology: every bar is labelled in words beside it, and the same labels
 * follow as a plain list, which is what a screen reader reads and what prints
 * (bar colours do not survive most printers). The low bar takes the warning
 * tone and an open left end ("below"), and the link under the ruler goes to
 * the steps for treating a low. Nothing to type in, no slider, and nothing
 * reads a number back to the reader. Every word is from `figure.ruler`.
 */
function GlucoseRangeFigure({ card, figure }: { card: CategoryCard; figure: GlucoseRange }) {
  const site = useSite();
  const locale = useLocale();
  const ruler = entry(card.figureWords, 'ruler');
  const labels = entry(ruler, 'zones');
  const lowLink = text(ruler, 'lowLink');
  const teamNote = text(ruler, 'teamNote');
  const unit = text(ruler, 'unit');
  const { scale } = figure;
  const number = new Intl.NumberFormat(locale);
  const ticks = Array.from(
    { length: Math.floor((scale.max - scale.min) / 2) + 1 },
    (_, index) => scale.min + index * 2,
  );

  const zones = figure.zones.map((zone) => {
    const start = zone.below === undefined ? (zone.from ?? scale.min) : scale.min;
    const end = zone.below ?? zone.to ?? scale.max;
    // CSS custom properties, typed without an assertion.
    const bar: CSSProperties & Record<string, string> = {
      '--dc-from': rulerAt(scale, start),
      '--dc-to': rulerAt(scale, end),
    };

    return { key: zone.key, label: text(labels, zone.key), open: zone.below !== undefined, bar };
  });

  return (
    <figure className="dc-fig-range">
      <FrDraftMarker gate="glucoseRange" />
      <figcaption className="oc-fig-heading">{text(ruler, 'heading')}</figcaption>

      <div aria-hidden className="dc-fig-range-ruler">
        {zones.map((zone) => (
          <div className={`dc-fig-range-row is-${zone.key}`} key={zone.key}>
            <span className="dc-fig-range-label">{zone.label}</span>
            <span className="dc-fig-range-track">
              <span
                className={zone.open ? 'dc-fig-range-bar is-open' : 'dc-fig-range-bar'}
                style={zone.bar}
              />
            </span>
          </div>
        ))}
        <div className="dc-fig-range-axis">
          {ticks.map((tick) => {
            const at: CSSProperties & Record<string, string> = { '--dc-at': rulerAt(scale, tick) };

            return (
              <span className="dc-fig-range-tick" key={tick} style={at}>
                {number.format(tick)}
              </span>
            );
          })}
        </div>
        {unit ? <span className="dc-fig-range-unit">{unit}</span> : null}
      </div>

      <ul className="dc-fig-range-list">
        {zones.map((zone) => (zone.label ? <li key={zone.key}>{zone.label}</li> : null))}
      </ul>

      {lowLink ? (
        <p className="dc-fig-range-low">
          <Glyph name="drop" />
          <a href={localeHref(cardHref(site, figure.lowLink.chapter, figure.lowLink.card), locale)}>
            {lowLink}
          </a>
        </p>
      ) : null}

      {teamNote ? <p className="oc-fig-detail dc-fig-range-team">{teamNote}</p> : null}
    </figure>
  );
}

/* ------------------------------------------------------------------------- */
/* The registry                                                               */
/* ------------------------------------------------------------------------- */

/*
 * What the engine calls for any kind it does not draw itself. A kind this site
 * does not know returns null, as the engine's own switch does.
 */
export const DC_FIGURES: SiteFigureRegistry<
  FigureMeta,
  CategoryCard,
  NonNullable<Chapter['urgentExit']>
> = {
  render(figure, { card }) {
    switch (figure.kind) {
      case 'ruleOf15':
        return <RuleOf15Figure card={card} figure={figure} />;

      case 'ketoneLadder':
        return <KetoneLadderFigure card={card} figure={figure} />;

      case 'glucoseRange':
        return <GlucoseRangeFigure card={card} figure={figure} />;

      case 'cluesChecklist':
        return <CluesChecklistFigure card={card} figure={figure} />;

      case 'testGlossary':
        return <TestGlossaryFigure card={card} figure={figure} />;

      case 'familyTree':
        return <FamilyTreeFigure card={card} figure={figure} />;

      case 'meterMatch':
        return <MeterMatchFigure card={card} figure={figure} />;

      case 'sensorPicker':
        return <SensorPickerFigure card={card} />;

      case 'pumpPicker':
        return <PumpPickerFigure card={card} figure={figure} />;

      case 'restockCalc':
        return <RestockCalcFigure card={card} figure={figure} />;

      case 'rotationMap':
        return <RotationMapFigure card={card} figure={figure} />;

      default:
        return null;
    }
  },
};
