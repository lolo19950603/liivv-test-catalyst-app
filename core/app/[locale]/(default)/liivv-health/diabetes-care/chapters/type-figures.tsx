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
 * Each is complete in the server HTML. The controls (tick boxes, one-tap
 * answers, print and clear) appear after hydration, so with JavaScript off the
 * checklist is plain lists and the family tree a blank form to fill in by
 * hand: no box renders that could not print its state. Their print buttons
 * print the figure alone, headed and footed as every printed sheet is
 * (../../_microsite/print, owner note 2, 2026-10-07). On /fr each waits on
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
import { CardPrintFoot, CardPrintHead } from '../../_microsite/print/card-print';
import { usePrintOnly } from '../../_microsite/print/use-print-only';
import { useSite } from '../../_microsite/site-context';

import type { FamilyAnswer, FamilyColumn, FigureMeta } from './chapters-meta';
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
  const [ticked, setTicked] = useState<ReadonlySet<number>>(new Set());
  const words = card.figureWords;
  const sections = card.sections ?? [];
  const clues = sections[figure.section - 1]?.items ?? [];
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
    <div className="dc-fig-clues" ref={rootRef}>
      {ready ? <CardPrintHead /> : null}
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

      {ready ? <CardPrintFoot card={card} /> : null}
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

/* One person in the tree, as the reader has answered so far. */
interface TreePerson {
  id: number;
  /* The row of the paper table this person belongs to, which also names them. */
  row: number;
  answers: Partial<Record<FamilyColumn, string>>;
  /* What the family was told, when the type is "other". */
  told: string;
}

/* The columns that follow a Yes to diabetes. Hearing loss is asked of everyone. */
const AFTER_YES: ReadonlySet<FamilyColumn> = new Set(['ageAtDiagnosis', 'typeTold', 'insulinSoon']);
/* The columns answered Yes, No or Not sure. */
const YES_NO: ReadonlySet<FamilyColumn> = new Set(['hasDiabetes', 'insulinSoon', 'hearingLoss']);
const ANSWERS: readonly FamilyAnswer[] = ['yes', 'no', 'notSure'];
/*
 * The printed sheet tightens its rows from this many rows' worth of answers.
 * A person counts once; a type written in the "as told" box counts twice,
 * since it may wrap. From 8, not 10: in French, nine people answered with the
 * one-tap choices ran past one Letter page untightened ("Je ne sais pas" and
 * the longer names take two lines). Measured on the dev server (Chrome print,
 * know-your-type.md F.10, OPEN-QUESTIONS B56): answered with the one-tap
 * choices, every tree of 1 to `maxPeople` (20) prints on one portrait page,
 * Letter and A4, English and French. With a type of the most the box takes
 * (`TOLD_MAX`, 60 characters) written in for everyone, the table stays on
 * page one and the sources and page address move to page two from 17 people
 * (English, Letter), 20 (English, A4), 15 (French, Letter) and 18 (French,
 * A4). Never more than two pages, and no person is split across them.
 */
const SHEET_COMPACT_FROM = 8;
/* The longest type the "as told" box takes, with a count under the box. */
const TOLD_MAX = 60;

/* The words the tree reads from its card's `figure.familyTree` messages. */
interface TreeWords {
  tree: unknown;
  rows: unknown;
  columns: unknown;
  sides: unknown;
  people: unknown;
  answers: unknown;
  types: unknown;
}

function useTreeWords(card: CategoryCard): TreeWords {
  const tree = entry(card.figureWords, 'familyTree');

  return {
    tree,
    rows: entry(tree, 'rows'),
    columns: entry(tree, 'columns'),
    sides: entry(tree, 'sides'),
    people: entry(tree, 'people'),
    answers: entry(tree, 'answers'),
    types: entry(tree, 'types'),
  };
}

/*
 * The paper form: one group of rows per side of the family, a row header per
 * relative, the five columns, and a ruled line in every cell to write on.
 * What JavaScript-off readers open, and what prints before anyone is added.
 */
function PaperTable({
  figure,
  words,
  labelledBy,
}: {
  figure: FamilyTree;
  words: TreeWords;
  labelledBy: string;
}) {
  return (
    <table aria-labelledby={labelledBy} className="dc-fig-tree-table">
      <thead>
        <tr>
          <td className="dc-fig-tree-corner" />
          {figure.columns.map((key) => (
            <th key={key} scope="col">
              {text(words.columns, key)}
            </th>
          ))}
        </tr>
      </thead>
      {figure.sides.map((group) => (
        <tbody key={group.side}>
          <tr className="dc-fig-tree-side">
            <th colSpan={figure.columns.length + 1} scope="rowgroup">
              {text(words.sides, group.side)}
            </th>
          </tr>
          {group.rows.map((row) => (
            <tr key={row}>
              <th scope="row">{text(words.rows, String(row))}</th>
              {figure.columns.map((key) => (
                <td key={key}>
                  <span aria-hidden className="dc-fig-tree-label">
                    {text(words.columns, key)}
                  </span>
                  <span aria-hidden className="oc-fig-ruled" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  );
}

/* A row of one-tap choices: native radios in pill labels, under the question as legend. */
function Choices({
  legend,
  name,
  options,
  value,
  onChange,
  firstId,
}: {
  legend: string;
  name: string;
  options: Array<{ value: string; label: string }>;
  value: string | undefined;
  onChange: (next: string) => void;
  firstId?: string;
}) {
  return (
    <fieldset className="dc-fig-tree-q">
      <legend>{legend}</legend>
      <div className="dc-fig-tree-pills">
        {options.map((option, index) => (
          <label className="dc-fig-tree-pill" key={option.value}>
            <input
              checked={value === option.value}
              id={index === 0 ? firstId : undefined}
              name={name}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/*
 * "My family diabetes tree" (Know Your Type card 8), beneath the subtype
 * columns. Owner note 2 (2026-10-07): a 55-box table was too much on screen,
 * so it starts closed, as its heading, its intro and one "Start my family
 * tree" button. Started, it is "Me" and a bar of Add buttons, grouped by side
 * of the family; each person added is a small group of one-tap questions:
 * diabetes Yes, No or Not sure; after a Yes, the age it was found, the type
 * as told (with a box for a type the chips do not name) and whether insulin
 * was needed within 2 years; and hearing loss, asked of everyone, because in
 * a mother's family it is a clue even without diabetes. Anyone but "Me" can
 * be removed. Focus follows each step, and a polite status line says who was
 * added or removed.
 *
 * It works nothing out: no risk, no colour, no pattern, no calculator. The
 * answers stay in this component and are gone when the tab closes; nothing is
 * stored or sent, and the boxes ask the browser not to remember them either.
 *
 * Print (../../_microsite/print) gives one portrait page (its limit is at
 * `SHEET_COMPACT_FROM`): the people added, grouped by side, with every answer
 * in words, then blank lines for anyone else; before anyone is added, the
 * blank table of every row. With JavaScript off, that blank table is in a
 * closed disclosure under the intro, to open and print by hand.
 */
export function FamilyTreeFigure({ card, figure }: { card: CategoryCard; figure: FamilyTree }) {
  const t = useTranslations('DiabetesCare.ui.familyTree');
  const rootRef = useRef<HTMLDivElement>(null);
  const words = useTreeWords(card);
  const heading = text(words.tree, 'heading');
  const intro = text(words.tree, 'intro');
  const { ready, print } = usePrintOnly(rootRef, { title: heading });
  const base = useId();
  const headingId = `${base}-heading`;
  const meRow = figure.sides[0]?.rows[0] ?? 1;
  const blank = (id: number, row: number): TreePerson => ({ id, row, answers: {}, told: '' });
  const [started, setStarted] = useState(false);
  const [people, setPeople] = useState<readonly TreePerson[]>([blank(0, meRow)]);
  const [nextId, setNextId] = useState(1);
  const [announce, setAnnounce] = useState('');
  const [focusId, setFocusId] = useState<string | null>(null);
  const firstId = (person: TreePerson) => `${base}-p${person.id}-first`;
  const addBarId = `${base}-add`;
  const order = figure.sides.flatMap((group) => group.rows);
  const sorted = [...people].sort(
    (a, b) => order.indexOf(a.row) - order.indexOf(b.row) || a.id - b.id,
  );
  const full = people.length >= figure.maxPeople;
  const answered = people.some(
    (person) =>
      person.row !== meRow || Object.values(person.answers).some(Boolean) || person.told !== '',
  );

  /* Focus moves after the render that drew its target. */
  useEffect(() => {
    if (!focusId) return;

    document.getElementById(focusId)?.focus();
    setFocusId(null);
  }, [focusId]);

  /* "My brother or sister 2" where a row has more than one person. */
  const nameOf = (person: TreePerson) => {
    const label = text(words.people, String(person.row));
    const same = sorted.filter((other) => other.row === person.row);

    return same.length > 1 ? `${label} ${same.indexOf(person) + 1}` : label;
  };

  const start = () => {
    setStarted(true);
    setFocusId(`${base}-p${people[0]?.id ?? 0}-first`);
  };

  const add = (row: number) => {
    const person = blank(nextId, row);

    setPeople((current) => [...current, person]);
    setNextId((current) => current + 1);
    setAnnounce(t('added', { person: text(words.people, String(row)) }));
    setFocusId(firstId(person));
  };

  const remove = (person: TreePerson) => {
    const index = sorted.indexOf(person);
    const before = sorted[index - 1];

    setPeople((current) => current.filter((other) => other.id !== person.id));
    setAnnounce(t('removed', { person: nameOf(person) }));
    setFocusId(before ? firstId(before) : addBarId);
  };

  const answer = (person: TreePerson, key: FamilyColumn, value: string) =>
    setPeople((current) =>
      current.map((other) =>
        other.id === person.id ? { ...other, answers: { ...other.answers, [key]: value } } : other,
      ),
    );

  const tell = (person: TreePerson, value: string) =>
    setPeople((current) =>
      current.map((other) => (other.id === person.id ? { ...other, told: value } : other)),
    );

  /* As the checklist's clear: focus moves first, then the button is disabled. */
  const clearTree = () => {
    setFocusId(`${base}-p0-first`);
    setPeople([blank(0, meRow)]);
    setNextId(1);
    setAnnounce('');
  };

  const answerOptions = ANSWERS.map((value) => ({ value, label: text(words.answers, value) }));
  const typeOptions = figure.types.map((value) => ({ value, label: text(words.types, value) }));

  /* An answer as the printed sheet says it, or nothing where it was not given. */
  const said = (person: TreePerson, key: FamilyColumn) => {
    if (AFTER_YES.has(key) && person.answers.hasDiabetes !== 'yes') return '';

    const value = person.answers[key] ?? '';

    if (key === 'ageAtDiagnosis') return value;

    if (key === 'typeTold') {
      if (value === 'other') return person.told.trim() || text(words.types, 'other');

      return value ? text(words.types, value) : '';
    }

    return value ? text(words.answers, value) : '';
  };

  const question = (person: TreePerson, key: FamilyColumn, first: boolean) => {
    const label = text(words.columns, key);
    const name = `${base}-p${person.id}-${key}`;
    const firstControl = first ? firstId(person) : undefined;

    if (key === 'ageAtDiagnosis') {
      return (
        <div className="dc-fig-tree-q" key={key}>
          <label htmlFor={firstControl ?? name}>{label}</label>
          <input
            autoComplete="off"
            className="dc-fig-tree-input dc-fig-tree-age"
            id={firstControl ?? name}
            inputMode="numeric"
            maxLength={3}
            onChange={(event) =>
              answer(person, key, event.target.value.replace(/\D/g, '').slice(0, 3))
            }
            spellCheck={false}
            type="text"
            value={person.answers[key] ?? ''}
          />
        </div>
      );
    }

    if (key === 'typeTold') {
      return (
        <div className="dc-fig-tree-type" key={key}>
          <Choices
            firstId={firstControl}
            legend={label}
            name={name}
            onChange={(next) => answer(person, key, next)}
            options={typeOptions}
            value={person.answers[key]}
          />
          {person.answers[key] === 'other' ? (
            <>
              <input
                aria-describedby={`${name}-count`}
                aria-label={`${label}: ${text(words.types, 'other')}`}
                autoComplete="off"
                className="dc-fig-tree-input dc-fig-tree-told"
                maxLength={TOLD_MAX}
                onChange={(event) => tell(person, event.target.value.slice(0, TOLD_MAX))}
                spellCheck={false}
                type="text"
                value={person.told}
              />
              <p className="oc-fig-detail dc-fig-tree-told-count" id={`${name}-count`}>
                {t('toldCount', { count: String(person.told.length), max: String(TOLD_MAX) })}
              </p>
            </>
          ) : null}
        </div>
      );
    }

    return YES_NO.has(key) ? (
      <Choices
        firstId={firstControl}
        key={key}
        legend={label}
        name={name}
        onChange={(next) => answer(person, key, next)}
        options={answerOptions}
        value={person.answers[key]}
      />
    ) : null;
  };

  /* The printed sheet, once anyone is added or anything answered. */
  const sheetRows = figure.sides.flatMap((group) => {
    const inSide = sorted.filter((person) => group.rows.includes(person.row));

    return inSide.length ? [{ side: group.side, people: inSide }] : [];
  });
  /* Rows' worth of answers on the sheet (`SHEET_COMPACT_FROM`). */
  const sheetLoad = people.reduce(
    (load, person) =>
      load +
      (person.answers.hasDiabetes === 'yes' &&
      person.answers.typeTold === 'other' &&
      person.told.trim()
        ? 2
        : 1),
    0,
  );

  return (
    <div className="dc-fig-tree" ref={rootRef}>
      {ready ? <CardPrintHead /> : null}
      <FrDraftMarker gate="familyTree" />
      <p className="oc-fig-heading" id={headingId}>
        {heading}
      </p>
      {intro ? <p className="oc-fig-detail dc-fig-tree-intro">{intro}</p> : null}

      {!ready ? (
        <details className="dc-fig-tree-paper">
          <summary>{t('start')}</summary>
          <PaperTable figure={figure} labelledBy={headingId} words={words} />
        </details>
      ) : null}

      {ready && !started ? (
        <div data-oc-print-hide="">
          <button className="oc-fig-print dc-fig-tree-start" onClick={start} type="button">
            {t('start')}
          </button>
        </div>
      ) : null}

      {ready && started ? (
        <div className="dc-fig-tree-screen" data-oc-print-hide="">
          <ul className="dc-fig-tree-people">
            {sorted.map((person) => {
              const shown = figure.columns.filter(
                (key) => !AFTER_YES.has(key) || person.answers.hasDiabetes === 'yes',
              );

              return (
                <li key={person.id}>
                  <fieldset className="dc-fig-tree-person">
                    <legend>{nameOf(person)}</legend>
                    {shown.map((key, index) => question(person, key, index === 0))}
                    {person.row === meRow ? null : (
                      <button
                        aria-label={t('removeLabel', { person: nameOf(person) })}
                        className="oc-fig-print dc-fig-tree-remove"
                        onClick={() => remove(person)}
                        type="button"
                      >
                        {t('remove')}
                      </button>
                    )}
                  </fieldset>
                </li>
              );
            })}
          </ul>

          <div aria-labelledby={`${addBarId}-label`} className="dc-fig-tree-add" role="group">
            <p className="dc-fig-tree-add-head" id={`${addBarId}-label`}>
              <span id={addBarId} tabIndex={-1}>
                {t('addHeading')}
              </span>
            </p>
            {figure.sides.map((group) => {
              const rows = group.rows.filter((row) => row !== meRow);
              const sideId = `${base}-add-${group.side}`;

              return rows.length ? (
                <div
                  aria-labelledby={sideId}
                  className="dc-fig-tree-add-side"
                  key={group.side}
                  role="group"
                >
                  <p id={sideId}>{text(words.sides, group.side)}</p>
                  <div className="dc-fig-tree-add-buttons">
                    {rows.map((row) => {
                      const person = text(words.people, String(row));
                      const once =
                        !figure.repeatable.includes(row) &&
                        people.some((other) => other.row === row);

                      return (
                        <button
                          aria-label={t('add', { person })}
                          className="dc-fig-tree-add-btn"
                          disabled={full || once}
                          key={row}
                          onClick={() => add(row)}
                          type="button"
                        >
                          <span aria-hidden>+ </span>
                          {person}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null;
            })}
            {full ? (
              <p className="oc-fig-detail">{t('full', { max: String(figure.maxPeople) })}</p>
            ) : null}
          </div>

          <div className="dc-fig-tree-actions">
            <p className="oc-fig-detail">{t('notSaved')}</p>
            <button className="oc-fig-print" onClick={print} type="button">
              <Glyph name="print" />
              {t('print')}
            </button>
            <button
              className="oc-fig-print dc-fig-tree-clear"
              disabled={!answered}
              onClick={clearTree}
              type="button"
            >
              {t('clear')}
            </button>
          </div>
        </div>
      ) : null}

      {ready ? (
        <p aria-live="polite" className="sr-only" data-oc-print-hide="">
          {announce}
        </p>
      ) : null}

      {ready ? (
        <div
          className="oc-print-only dc-fig-tree-sheet"
          data-compact={sheetLoad >= SHEET_COMPACT_FROM ? '' : undefined}
        >
          {started && answered ? (
            <table className="dc-fig-tree-table">
              <thead>
                <tr>
                  <td className="dc-fig-tree-corner" />
                  {figure.columns.map((key) => (
                    <th key={key} scope="col">
                      {text(words.columns, key)}
                    </th>
                  ))}
                </tr>
              </thead>
              {sheetRows.map((group) => (
                <tbody key={group.side}>
                  <tr className="dc-fig-tree-side">
                    <th colSpan={figure.columns.length + 1} scope="rowgroup">
                      {text(words.sides, group.side)}
                    </th>
                  </tr>
                  {group.people.map((person) => (
                    <tr key={person.id}>
                      <th scope="row">{nameOf(person)}</th>
                      {figure.columns.map((key) => {
                        const value = said(person, key);

                        return (
                          <td key={key}>
                            {value || <span aria-hidden className="oc-fig-ruled" />}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              ))}
              <tbody>
                {[1, 2, 3].map((line) => (
                  <tr key={line}>
                    <th scope="row">{t('anyoneElse')}</th>
                    {figure.columns.map((key) => (
                      <td key={key}>
                        <span aria-hidden className="oc-fig-ruled" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <PaperTable figure={figure} labelledBy={headingId} words={words} />
          )}
        </div>
      ) : null}

      {ready ? <CardPrintFoot card={card} /> : null}
    </div>
  );
}
