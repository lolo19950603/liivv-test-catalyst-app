'use client';

/*
 * =============================================================================
 * KNOW YOUR TYPE — THE CHAPTER'S OWN FIGURES
 * =============================================================================
 * Three of this site's figure kinds, registered with the rest in
 * ./site-figures.tsx: the clues checklist and the test glossary (card 6) and
 * the family diabetes tree (card 8). Structure comes from chapters-meta.ts;
 * every word comes from the DiabetesCare messages: the card's own sections and
 * note, its `figure` messages, and `ui.cluesChecklist` / `ui.familyTree`.
 *
 * None of them stores, sends or scores anything. Ticks and typed answers live
 * in component state only: no localStorage (health information should not
 * outlast the tab on a shared device), no URL, no analytics, no request. None
 * works out a type, a risk or a result, and none says "you may have…".
 *
 * Each is complete in the server HTML. The controls (tick boxes, text fields,
 * print and clear) appear after hydration, so with JavaScript off the
 * checklist is plain lists and the family tree a blank form to fill in by
 * hand: no box renders that could not print its state. On /fr each waits on
 * its own French review gate (review-gates.ts), and the card falls back to its
 * plain sections, columns and note.
 *
 * No product, brand, price or cart action appears in any of them.
 * =============================================================================
 */

import { useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import type { CategoryCard } from '../../_microsite/chapters/compose';
import { FrDraftMarker, Glyph } from '../../_microsite/chapters/figure-parts';
import { useSite } from '../../_microsite/site-context';
import { usePrintOnly } from '../../ostomy-care/chapters/use-print-only';

import type { FamilyColumn, FigureMeta } from './chapters-meta';
import { entry, text } from './figure-words';

import './type-figures.css';

type CluesChecklist = Extract<FigureMeta, { kind: 'cluesChecklist' }>;
type TestGlossary = Extract<FigureMeta, { kind: 'testGlossary' }>;
type FamilyTree = Extract<FigureMeta, { kind: 'familyTree' }>;

/*
 * `count` numbered lines of a `figure` key, in order. The count is the meta's,
 * so a translation can neither add a line nor drop one; a missing line is
 * left out rather than shown blank.
 */
function lines(node: unknown, total: number) {
  return Array.from({ length: total }, (_, index) => text(node, String(index + 1))).filter(Boolean);
}

/* ------------------------------------------------------------------------- */
/* The clues checklist                                                        */
/* ------------------------------------------------------------------------- */

/* One section of the card, as the plain card body draws it. */
function PlainSection({
  heading,
  items,
  note,
}: {
  heading: string;
  items: string[];
  note?: string;
}) {
  return (
    <div className="oc-ch-subsection">
      <h4>{heading}</h4>
      <ul>
        {items.map((item, index) => (
          <li key={`${index}-${item}`}>{item}</li>
        ))}
      </ul>
      {note ? <p className="oc-ch-row-note">{note}</p> : null}
    </div>
  );
}

/*
 * The one sheet the print button produces, headed "Questions to bring to your
 * team": the banner (with the insulin safety line), the clues ticked, or every
 * clue in an empty box when none is, and the questions, each with a ruled line
 * to write the answer on. It is display:none on screen and prints only through
 * the button (type-figures.css); the browser's own print prints the card as it
 * is on screen.
 */
function CluesSheet({
  banner,
  clues,
  heading,
  questions,
  ticked,
}: {
  banner?: string;
  clues: string[];
  heading: string;
  questions: string[];
  ticked: ReadonlySet<number>;
}) {
  const t = useTranslations('DiabetesCare.ui.cluesChecklist');
  const none = ticked.size === 0;

  return (
    <div className="dc-fig-clues-sheet">
      <p className="oc-fig-heading">{heading}</p>
      {banner ? <p className="dc-fig-clues-banner">{banner}</p> : null}
      <p className="dc-fig-clues-sheet-head">{t('cluesTicked')}</p>
      {none ? <p className="oc-fig-detail">{t('noneTicked')}</p> : null}
      <ul className="dc-fig-clues-sheet-list">
        {clues.map((clue, index) =>
          none || ticked.has(index + 1) ? (
            <li key={`${index}-${clue}`}>
              {none ? <span aria-hidden className="dc-fig-clues-box" /> : <Glyph name="check" />}
              <span>{clue}</span>
            </li>
          ) : null,
        )}
      </ul>
      <ol className="dc-fig-clues-sheet-questions">
        {questions.map((question, index) => (
          <li key={`${index}-${question}`}>
            {question}
            <span className="dc-fig-clues-answer">{t('answer')}</span>
            <span aria-hidden className="oc-fig-ruled" />
          </li>
        ))}
      </ol>
    </div>
  );
}

/*
 * "Clues to mention" (Know Your Type card 6). It draws the whole card: the
 * card's note first, as a fixed banner that never collapses and has no close
 * control; then every section in order, with section `figure.section` as tick
 * boxes, each labelled with the item's own sentence so nothing is paraphrased;
 * then the questions to bring.
 *
 * Ticking changes nothing else on the page: no count, no score, no result.
 * The tick boxes, and the print and clear buttons, appear after hydration;
 * before that, and with JavaScript off, section 2 is the plain list it is
 * everywhere else.
 */
export function CluesChecklistFigure({
  card,
  figure,
}: {
  card: CategoryCard;
  figure: CluesChecklist;
}) {
  const t = useTranslations('DiabetesCare.ui.cluesChecklist');
  const rootRef = useRef<HTMLDivElement>(null);
  const firstBoxRef = useRef<HTMLInputElement>(null);
  const { ready, print } = usePrintOnly(rootRef);
  const [ticked, setTicked] = useState<ReadonlySet<number>>(new Set());
  const words = card.figureWords;
  const sections = card.sections ?? [];
  const clues = sections[figure.section - 1]?.items ?? [];
  const questions = lines(entry(words, 'questions'), figure.questions);
  const printHeading = text(words, 'printHeading');

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
    <div className="dc-fig-clues" ref={rootRef}>
      <FrDraftMarker gate="cluesChecklist" />

      {card.note ? (
        <p className="dc-fig-clues-banner" role="note">
          {card.note}
        </p>
      ) : null}

      <div className="dc-fig-clues-screen">
        {sections.map((section, index) => {
          if (index + 1 !== figure.section) {
            return (
              <PlainSection
                heading={section.heading}
                items={section.items}
                key={section.heading}
                note={section.note}
              />
            );
          }

          return (
            <div className="oc-ch-subsection dc-fig-clues-section" key={section.heading}>
              <h4>{section.heading}</h4>
              {ready ? (
                <fieldset className="dc-fig-clues-set">
                  <legend className="dc-fig-clues-legend">{text(words, 'legend')}</legend>
                  <ul>
                    {clues.map((clue, clueIndex) => (
                      <li key={`${clueIndex}-${clue}`}>
                        <label className="dc-fig-clues-tick">
                          <input
                            checked={ticked.has(clueIndex + 1)}
                            onChange={() => toggle(clueIndex + 1)}
                            ref={clueIndex === 0 ? firstBoxRef : undefined}
                            type="checkbox"
                          />
                          <span>{clue}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                </fieldset>
              ) : (
                <ul>
                  {clues.map((clue, clueIndex) => (
                    <li key={`${clueIndex}-${clue}`}>{clue}</li>
                  ))}
                </ul>
              )}
              {section.note ? <p className="oc-ch-row-note">{section.note}</p> : null}
            </div>
          );
        })}

        {questions.length ? (
          <div className="oc-ch-subsection dc-fig-clues-questions">
            <h4>{printHeading}</h4>
            <ol>
              {questions.map((question, index) => (
                <li key={`${index}-${question}`}>{question}</li>
              ))}
            </ol>
          </div>
        ) : null}

        {ready ? (
          <div className="dc-fig-clues-actions">
            <button className="oc-fig-print" onClick={print} type="button">
              <Glyph name="print" />
              {t('print')}
            </button>
            <button
              className="oc-fig-print dc-fig-clues-clear"
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
        <CluesSheet
          banner={card.note}
          clues={clues}
          heading={printHeading}
          questions={questions}
          ticked={ticked}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------------------------------------------------- */
/* The test glossary                                                          */
/* ------------------------------------------------------------------------- */

/*
 * Test names in plain words (Know Your Type card 6), beneath the checklist.
 * Each term is a native disclosure, so the list stays short and opens with or
 * without JavaScript, and keyboard and find-in-page reach it as they reach any
 * <details>. The line under the heading says which meanings come from
 * international guidance (ruling K11). Each term's id is its slug from the
 * meta (`<idPrefix>term-<slug>`, such as `dc-term-c-peptide`), so a link to a
 * term names the test it opens.
 *
 * After hydration one button opens every term, or closes them all once every
 * one is open (`ui.testGlossary`). It follows the terms as a reader opens and
 * closes them one at a time, so its label always says what pressing it does.
 */
export function TestGlossaryFigure({ card, figure }: { card: CategoryCard; figure: TestGlossary }) {
  const t = useTranslations('DiabetesCare.ui.testGlossary');
  const { idPrefix } = useSite();
  const headingId = useId();
  const listId = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [openCount, setOpenCount] = useState(0);
  const words = card.figureWords;
  const terms = entry(words, 'terms');
  const note = text(words, 'glossaryNote');
  const list = figure.terms
    .map(({ slug }, index) => {
      const term = entry(terms, String(index + 1));

      return { slug, term: text(term, 'term'), meaning: text(term, 'meaning') };
    })
    .filter((item) => item.term);
  const allOpen = list.length > 0 && openCount === list.length;

  useEffect(() => setReady(true), []);

  const details = () => Array.from(listRef.current?.querySelectorAll('details') ?? []);
  const recount = () => setOpenCount(details().filter((item) => item.open).length);
  const toggleAll = () => {
    details().forEach((item) => item.toggleAttribute('open', !allOpen));
    recount();
  };

  return (
    <section aria-labelledby={headingId} className="dc-fig-glossary">
      <FrDraftMarker gate="testGlossary" />
      <h4 id={headingId}>{text(words, 'glossaryHeading')}</h4>
      {note ? <p className="oc-fig-detail">{note}</p> : null}
      {ready && list.length > 1 ? (
        <button
          aria-controls={listId}
          className="oc-fig-print dc-fig-glossary-toggle"
          onClick={toggleAll}
          type="button"
        >
          {allOpen ? t('closeAll') : t('openAll')}
        </button>
      ) : null}
      <div className="dc-fig-glossary-list" id={listId} ref={listRef}>
        {list.map((item) => (
          <details id={`${idPrefix}term-${item.slug}`} key={item.slug} onToggle={recount}>
            <summary>{item.term}</summary>
            <p>{item.meaning}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------------- */
/* The family diabetes tree                                                   */
/* ------------------------------------------------------------------------- */

/*
 * "My family diabetes tree" (Know Your Type card 8), beneath the subtype
 * columns: a table with one group of rows per side of the family, a row
 * header per relative, and the five structural columns. After hydration each
 * cell is a text field, labelled by its side, its row and its column header;
 * before that, and with JavaScript off, the cells are blank ruled lines, a form
 * to print and fill in by hand.
 *
 * It works nothing out: no risk, no colour, no pattern, no calculator. What is
 * typed stays in this component and is gone when the tab closes; the fields
 * ask the browser not to remember it either. Print gives one landscape page
 * with whatever was typed, or blank ruled cells. On phones each relative is a
 * block of five labelled fields, with no horizontal scroll (type-figures.css).
 */
export function FamilyTreeFigure({ card, figure }: { card: CategoryCard; figure: FamilyTree }) {
  const t = useTranslations('DiabetesCare.ui.familyTree');
  const rootRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const { ready, print } = usePrintOnly(rootRef);
  const [values, setValues] = useState<Readonly<Record<string, string>>>({});
  const base = useId();
  const tree = entry(card.figureWords, 'familyTree');
  const rows = entry(tree, 'rows');
  const columns = entry(tree, 'columns');
  const sides = entry(tree, 'sides');
  const intro = text(tree, 'intro');
  const columnId = (key: FamilyColumn) => `${base}-col-${key}`;
  const cell = (row: number, key: FamilyColumn) => `${row}:${key}`;
  const firstRow = figure.sides[0]?.rows[0];
  const firstColumn = figure.columns[0];
  const firstCell =
    firstRow === undefined || firstColumn === undefined ? '' : cell(firstRow, firstColumn);

  /* As the checklist's clear: focus moves to the first field before the button is disabled. */
  const clearTree = () => {
    firstFieldRef.current?.focus();
    setValues({});
  };

  return (
    <div className="dc-fig-tree" ref={rootRef}>
      <FrDraftMarker gate="familyTree" />
      {intro ? <p className="oc-fig-detail dc-fig-tree-intro">{intro}</p> : null}

      <table className="dc-fig-tree-table">
        <caption className="oc-fig-heading">{text(tree, 'heading')}</caption>
        <thead>
          <tr>
            <td className="dc-fig-tree-corner" />
            {figure.columns.map((key) => (
              <th id={columnId(key)} key={key} scope="col">
                {text(columns, key)}
              </th>
            ))}
          </tr>
        </thead>
        {figure.sides.map((group) => {
          const sideId = `${base}-side-${group.side}`;

          return (
            <tbody key={group.side}>
              <tr className="dc-fig-tree-side">
                <th colSpan={figure.columns.length + 1} id={sideId} scope="rowgroup">
                  {text(sides, group.side)}
                </th>
              </tr>
              {group.rows.map((row) => {
                const rowId = `${base}-row-${row}`;

                return (
                  <tr key={row}>
                    <th id={rowId} scope="row">
                      {text(rows, String(row))}
                    </th>
                    {figure.columns.map((key) => (
                      <td key={key}>
                        <span aria-hidden className="dc-fig-tree-label">
                          {text(columns, key)}
                        </span>
                        {ready ? (
                          <input
                            aria-labelledby={`${sideId} ${rowId} ${columnId(key)}`}
                            autoComplete="off"
                            className="dc-fig-tree-input"
                            onChange={(event) => {
                              const value = event.target.value;

                              setValues((current) => ({ ...current, [cell(row, key)]: value }));
                            }}
                            ref={cell(row, key) === firstCell ? firstFieldRef : undefined}
                            spellCheck={false}
                            type="text"
                            value={values[cell(row, key)] ?? ''}
                          />
                        ) : (
                          <span aria-hidden className="oc-fig-ruled" />
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>

      {ready ? (
        <div className="dc-fig-tree-actions">
          <p className="oc-fig-detail">{t('notSaved')}</p>
          <button className="oc-fig-print" onClick={print} type="button">
            <Glyph name="print" />
            {t('print')}
          </button>
          <button
            className="oc-fig-print dc-fig-tree-clear"
            disabled={Object.values(values).every((value) => value === '')}
            onClick={clearTree}
            type="button"
          >
            {t('clear')}
          </button>
        </div>
      ) : null}
    </div>
  );
}
