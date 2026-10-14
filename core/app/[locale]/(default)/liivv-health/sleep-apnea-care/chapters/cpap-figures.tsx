'use client';

/*
 * =============================================================================
 * STARTING CPAP — THE CHAPTER'S OWN FIGURES
 * =============================================================================
 * Four of this site's figure kinds, registered in ./site-figures.tsx:
 *   followUpTimeline   card 1, the setup and follow-up schedule
 *   maskPicker         card 3, mask types to ask your RT about
 *   usageExplainer     card 8, the usage measures driver licensing uses
 *   troubleshootFinder card 9, fix a common problem
 *
 * Every word is the card's own (its sentences by number, its `figure`
 * messages); the structure is chapters-meta.ts. None of them stores, sends or
 * scores anything: what a reader ticks or picks lives in component state and
 * is gone when the page is left. None gives a pressure, a setting or any
 * "set your…" instruction; the troubleshooter says under every answer not to
 * change them. No product, brand, price or shop link appears in any of them,
 * and the mask picker never ranks, scores or picks a mask, and never names a
 * child's mask.
 *
 * Each is complete in the server HTML: with JavaScript off the timeline and
 * the licensing rows are static anyway, the picker lists all three mask types
 * with every reason, and every troubleshooting answer is a native <details>.
 * Liivv's own service lines (setup call, check-ins, usage reports) are out of
 * the message tree until that service exists (Part C), so none appears here.
 * =============================================================================
 */

import { createTranslator, useLocale } from 'next-intl';
import { useEffect, useId, useState } from 'react';

import { SourceChip } from '../../_microsite/_components/source-chip';
import type { CategoryCard } from '../../_microsite/chapters/compose';
import { CardItem, FrDraftMarker, Glyph } from '../../_microsite/chapters/figure-parts';
import { chapterHref, localeHref } from '../../_microsite/chapters/hrefs';
import { useSite, useSiteSources } from '../../_microsite/site-context';
import { lookUpSources } from '../../_microsite/sources';

import type { FigureMeta, MaskType } from './chapters-meta';
import { entry, text } from './figure-words';

type FollowUpTimeline = Extract<FigureMeta, { kind: 'followUpTimeline' }>;
type MaskPicker = Extract<FigureMeta, { kind: 'maskPicker' }>;
type UsageExplainer = Extract<FigureMeta, { kind: 'usageExplainer' }>;
type TroubleshootFinder = Extract<FigureMeta, { kind: 'troubleshootFinder' }>;

/* A row's own chips, named for the row; nothing where the route handed down no register. */
function RowSources({ ids, label }: { ids: readonly string[]; label: string }) {
  const map = useSiteSources();

  if (!map || !ids.length) return null;

  return <SourceChip className="sa-fig-chip" label={label} sources={lookUpSources(map, ids)} />;
}

/* ------------------------------------------------------------------------- */
/* The follow-up timeline                                                     */
/* ------------------------------------------------------------------------- */

/*
 * The card's five sentences as one ordered timeline, each under the step it
 * belongs to: setup, about 7 days, 2 to 4 weeks, 30 and 60 days (one sentence
 * carries both, so the two steps share it), and every year after that. It
 * restyles the card (`kinds.restyle`), so the sentences are not repeated in a
 * plain list under it; the card's note on where the schedule comes from stays
 * visible under the timeline. Static: nothing to press, nothing entered.
 */
export function FollowUpTimelineFigure({
  card,
  figure,
}: {
  card: CategoryCard;
  figure: FollowUpTimeline;
}) {
  const words = card.figureWords;
  const labels = entry(words, 'steps');
  /* Steps resting on the same sentence are one entry, with every label it carries. */
  const entries = figure.steps.reduce<Array<{ item: number; labels: string[] }>>((list, step) => {
    const label = text(labels, String(step.label));
    const last = list[list.length - 1];

    if (last && last.item === step.item) {
      last.labels.push(label);

      return list;
    }

    return [...list, { item: step.item, labels: [label] }];
  }, []);

  return (
    <figure className="sa-fig-timeline">
      <FrDraftMarker gate="followUpTimeline" />
      <figcaption className="oc-fig-heading">{text(words, 'heading')}</figcaption>
      <ol>
        {entries.map((step) => (
          <li key={step.item}>
            <span aria-hidden className="sa-fig-timeline-dot" />
            <span className="sa-fig-timeline-when">{step.labels.filter(Boolean).join(' · ')}</span>
            <span className="sa-fig-timeline-what">
              <CardItem card={card} item={step.item} />
            </span>
          </li>
        ))}
      </ol>
    </figure>
  );
}

/* ------------------------------------------------------------------------- */
/* The mask picker                                                            */
/* ------------------------------------------------------------------------- */

/* The mask types the ticked rows suggest, once each. */
function suggestedTypes(figure: MaskPicker, ticked: ReadonlySet<number>) {
  return new Set<MaskType>(
    figure.questions.filter((row) => ticked.has(row.id)).flatMap((row) => row.suggests),
  );
}

/*
 * The three types, each highlighted type followed by the ticked sentences
 * that suggest it, in the reader's own words: a type answers one tick, not
 * necessarily all of them.
 */
function MaskTypes({
  figure,
  labels,
  questions,
  ticked,
}: {
  figure: MaskPicker;
  labels: unknown;
  questions: unknown;
  ticked: ReadonlySet<number>;
}) {
  return (
    <ul className="sa-fig-masks-types">
      {figure.types.map((type) => {
        const why = figure.questions.filter(
          (row) => ticked.has(row.id) && row.suggests.includes(type),
        );

        return (
          <li className={why.length ? 'is-on' : undefined} key={type}>
            {why.length ? <Glyph name="check" /> : null}
            <span>{text(entry(labels, type), 'label')}</span>
            {why.length ? (
              <ul className="sa-fig-masks-why">
                {why.map((row) => (
                  <li key={row.id}>{text(questions, String(row.id))}</li>
                ))}
              </ul>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/* One "may suit" reason, with its chips and, where the row says so, the chin strap to ask about. */
function MaskReason({
  card,
  row,
  words,
}: {
  card: CategoryCard;
  row: MaskPicker['questions'][number];
  words: unknown;
}) {
  const reason = text(entry(words, 'reasons'), String(row.id));

  if (!reason) return null;

  return (
    <li>
      <p>{reason}</p>
      {row.also === 'chinStrap' ? (
        <p className="sa-fig-masks-also">
          {text(words, 'askAbout')} {text(words, 'chinStrap')}
        </p>
      ) : null}
      <RowSources ids={row.sources} label={`${card.title} — ${reason}`} />
    </li>
  );
}

/*
 * A figure sentence with one phrase wrapped in `<link>…</link>` (the tags add
 * no words): the phrase links `href`, and the tags never show. Without a
 * target the sentence shows plain.
 */
function TaggedText({ value, href }: { value: string; href?: string }) {
  const [before = '', rest = ''] = value.split('<link>');
  const [phrase = '', after = ''] = rest.split('</link>');

  if (!rest) return value;
  if (!href) return `${before}${phrase}${after}`;

  return (
    <>
      {before}
      <a href={href}>{phrase}</a>
      {after}
    </>
  );
}

const untagged = (value: string) => value.replace(/<\/?link>/g, '');

/* The status line: how many types fit what is ticked. All three always stay listed. */
function useMaskStatus(words: unknown, anyTicked: boolean, count: number) {
  const locale = useLocale();

  if (!anyTicked) return text(words, 'statusNone');

  const message = text(words, count === 1 ? 'statusOne' : 'statusMany');

  return message ? createTranslator({ locale, messages: { message } })('message', { count }) : '';
}

/*
 * "What sounds like you?": eight tick boxes, each a reader's own sentence.
 * Ticking one highlights the mask types its row's sources tie to it, with a
 * check mark beside the name, never by colour alone, and shows that row's
 * "may suit" reason with its own chips. It never ranks, scores or picks a
 * mask: the status line says how many types fit, and all three stay listed.
 * Unticked, and with JavaScript off, every reason shows.
 *
 * Always visible under it, whatever is ticked: the bilevel line and the
 * magnet note (ruling C3: a warning to check with the maker and the health
 * care team, not a stop rule), each with its own chips (Health Canada's
 * notices only, ruling N7), then the line that says nothing ticked is saved.
 */
export function MaskPickerFigure({ card, figure }: { card: CategoryCard; figure: MaskPicker }) {
  const site = useSite();
  const locale = useLocale();
  const legendId = useId();
  const [ready, setReady] = useState(false);
  const [ticked, setTicked] = useState<ReadonlySet<number>>(new Set());
  const words = card.figureWords;
  const questions = entry(words, 'questions');
  const anyTicked = ticked.size > 0;
  const suggested = suggestedTypes(figure, ticked);
  const shown = anyTicked ? figure.questions.filter((row) => ticked.has(row.id)) : figure.questions;
  const status = useMaskStatus(words, anyTicked, suggested.size);
  const to = figure.magnetNote.to;
  const magnetHref = to
    ? localeHref(`${chapterHref(site, to.chapter)}#card-${to.card}`, locale)
    : undefined;

  useEffect(() => setReady(true), []);

  const toggle = (id: number) =>
    setTicked((current) => {
      const next = new Set(current);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  return (
    <div className="sa-fig-masks">
      <FrDraftMarker gate="maskPicker" />

      {ready ? (
        <fieldset aria-describedby={legendId} className="sa-fig-ticks">
          <legend className="sa-fig-ticks-legend">{text(words, 'legend')}</legend>
          <ul>
            {figure.questions.map((row) => (
              <li key={row.id}>
                <label className="sa-fig-tick">
                  <input
                    checked={ticked.has(row.id)}
                    onChange={() => toggle(row.id)}
                    type="checkbox"
                  />
                  <span>{text(questions, String(row.id))}</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      ) : null}

      <p aria-live="polite" className="sa-fig-status" id={legendId}>
        {status}
      </p>

      <MaskTypes
        figure={figure}
        labels={entry(words, 'types')}
        questions={questions}
        ticked={ticked}
      />

      <ul className="sa-fig-masks-reasons">
        {shown.map((row) => (
          <MaskReason card={card} key={row.id} row={row} words={words} />
        ))}
      </ul>

      <div className="sa-fig-masks-notes">
        <p>{text(words, 'bilevelNote')}</p>
        <RowSources
          ids={figure.bilevelNote.sources}
          label={`${card.title} — ${text(words, 'bilevelNote')}`}
        />
        <p className="sa-fig-strip">
          <TaggedText href={magnetHref} value={text(words, 'magnetNote')} />
        </p>
        <RowSources
          ids={figure.magnetNote.sources}
          label={`${card.title} — ${untagged(text(words, 'magnetNote'))}`}
        />
      </div>

      <p className="oc-fig-detail">{text(words, 'privacy')}</p>
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The usage explainer                                                        */
/* ------------------------------------------------------------------------- */

/*
 * The two usage measures driver licensing uses, each with the line that says
 * who decides, its own chip, and under every row the line that says none of
 * them is a goal for your health (ruling S1). Licensing measures only, never
 * a health target. Static: nothing entered, nothing worked out.
 */
export function UsageExplainerFigure({
  card,
  figure,
}: {
  card: CategoryCard;
  figure: UsageExplainer;
}) {
  const words = card.figureWords;
  const rows = entry(words, 'rows');
  const always = text(words, 'always');

  return (
    <figure className="sa-fig-usage">
      <FrDraftMarker gate="usageExplainer" />
      <figcaption className="oc-fig-heading">{text(words, 'heading')}</figcaption>
      <dl>
        {figure.rows.map((row) => {
          const own = entry(rows, row.id);
          const label = text(own, 'label');

          return (
            <div className="sa-fig-usage-row" key={row.id}>
              <dt>{label}</dt>
              <dd>
                <p className="sa-fig-usage-value">{text(own, 'value')}</p>
                <p className="oc-fig-detail">{text(own, 'foot')}</p>
                <RowSources ids={row.sources} label={`${card.title} — ${label}`} />
                {/* Under every row (`footerAlways`): never a health target. */}
                {always ? <p className="sa-fig-strip">{always}</p> : null}
              </dd>
            </div>
          );
        })}
      </dl>
    </figure>
  );
}

/* ------------------------------------------------------------------------- */
/* The troubleshooting finder                                                 */
/* ------------------------------------------------------------------------- */

/*
 * One chip per common problem (`figure.chips`). Every answer is the card's own
 * sentence, in a native <details> under the problem's name, so with JavaScript
 * off, and in the server HTML, every answer is there and opens on its own. A
 * chip opens its answer, closes the others and moves focus to it. Under every
 * answer, fixed: don't change your pressure or settings yourself; call your
 * RT or prescriber. The "still sleepy" answer also links Driving & Staying
 * Safe's red-flag block. It restyles the card (`kinds.restyle`): the answers
 * are the card's items, so they are not listed twice.
 */
export function TroubleshootFinderFigure({
  card,
  figure,
}: {
  card: CategoryCard;
  figure: TroubleshootFinder;
}) {
  const site = useSite();
  const locale = useLocale();
  const baseId = useId();
  const [ready, setReady] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const words = card.figureWords;
  const chips = entry(words, 'chips');
  /* Under every answer, fixed (`always`). */
  const always = text(words, 'always');
  const redFlagLink = text(words, 'redFlagLink');
  const answerId = (id: number) => `${baseId}-answer-${id}`;

  useEffect(() => setReady(true), []);

  const pick = (id: number) => {
    setPicked(id);
    /* Open the one answer, close the rest, and take the reader to it. */
    document
      .querySelectorAll<HTMLDetailsElement>(`[data-sa-answer='${baseId}']`)
      .forEach((node) => {
        node.open = node.id === answerId(id);
      });
    document.getElementById(answerId(id))?.querySelector('summary')?.focus();
  };

  /* An answer closed from its own heading leaves its chip unpressed. */
  const closed = (id: number, open: boolean) => {
    if (!open) setPicked((current) => (current === id ? null : current));
  };

  return (
    <div className="sa-fig-finder">
      <FrDraftMarker gate="troubleshootFinder" />

      {ready ? (
        <div aria-label={text(words, 'legend')} className="sa-fig-finder-chips" role="group">
          <p aria-hidden className="sa-fig-ticks-legend">
            {text(words, 'legend')}
          </p>
          {figure.problems.map((problem) => (
            <button
              aria-controls={answerId(problem.id)}
              aria-pressed={picked === problem.id}
              className={picked === problem.id ? 'sa-fig-chip-btn is-on' : 'sa-fig-chip-btn'}
              key={problem.id}
              onClick={() => pick(problem.id)}
              type="button"
            >
              {text(chips, String(problem.id))}
            </button>
          ))}
        </div>
      ) : null}

      <div className="sa-fig-finder-answers">
        {figure.problems.map((problem) => {
          const name = text(chips, String(problem.id));

          return (
            <details
              data-sa-answer={baseId}
              id={answerId(problem.id)}
              key={problem.id}
              onToggle={(event) => closed(problem.id, event.currentTarget.open)}
            >
              <summary>{name}</summary>
              <div className="sa-fig-finder-body">
                <p>
                  <CardItem card={card} item={problem.id} />
                </p>
                {problem.link && redFlagLink ? (
                  <p className="sa-fig-finder-flag">
                    <Glyph name="urgent" />
                    <a
                      href={localeHref(
                        `${chapterHref(site, problem.link.chapter)}#${problem.link.anchor}`,
                        locale,
                      )}
                    >
                      {redFlagLink}
                    </a>
                  </p>
                ) : null}
                <RowSources ids={problem.sources} label={`${card.title} — ${name}`} />
                {always ? <p className="sa-fig-strip">{always}</p> : null}
              </div>
            </details>
          );
        })}
      </div>

      <p className="oc-fig-detail">{text(words, 'privacy')}</p>
    </div>
  );
}
