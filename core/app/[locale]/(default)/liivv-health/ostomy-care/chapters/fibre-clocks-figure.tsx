'use client';

/*
 * =============================================================================
 * EARLY-WEEKS FOOD CLOCKS (C11) — Chapter 03, card 3
 * =============================================================================
 * Two rows, one for a colostomy and one for an ileostomy, because the two run
 * on very different clocks: Alberta Health Services gives about 2 to 4 weeks
 * after a colostomy and about 6 to 8 weeks after an ileostomy. The card already
 * says "how long varies"; showing the two side by side heads off the commonest
 * early mix-up without inventing a date.
 *
 * It is not a "lower-fibre clock" for both rows, and it used to be called one.
 * The AHS colostomy sheet says SOFTER foods may be easier for the first 2 to 4
 * weeks; only the ileostomy guidance gives a lower-fibre stretch. The colostomy
 * sentence had been written as "Softer, lower-fibre foods", which invented a
 * restriction its own source does not impose and then contradicted itself in
 * the next clause ("Fibre is okay after surgery"). The sentence now says what
 * the source says, and whether a colostomy row belongs on this figure at all is
 * an open question in the content-review pack.
 *
 * The card's own note leads — how long this lasts is the surgical team's call —
 * so a reader meets that before either duration. It renders here and nowhere
 * else on the card (NOTE_CARRYING_KINDS in figures.tsx), so it is never shown
 * twice.
 *
 * Each row's weeks are written out in its sentence. The bar beneath is
 * aria-hidden decoration: it fades from solid to nothing across the range
 * rather than stopping at a line, because no one is moved on by a bar and
 * neither end of the range is a date. Nothing here is ticked, ranked or marked
 * finished, and there is no control at all: every word of this figure is in the
 * server HTML and no script adds, changes or reveals any of it.
 *
 * Which is not the same as saying a reader with JavaScript off sees it. They do
 * not see the page: every route in the (default) group is streamed inside the
 * Suspense boundary that `app/[locale]/(default)/loading.tsx` opens, so the body
 * arrives in a `<div hidden>` that only an inline script moves into the
 * document. Site-wide, not this figure's, and not fixable from here — recorded
 * as residual #12, named as a ship blocker in that file's own comment and in
 * `docs/content-review/README.md`. The only thing rescued from it is the
 * emergency list and the crisis line, which ride outside the boundary from the
 * root layout (`_components/no-script-emergency.tsx`). This figure is not.
 *
 * There is no urostomy row. No Canadian source gives a lower-fibre period after
 * urostomy surgery, and a third bar drawn for symmetry would invent one.
 *
 * This is not a diet plan. No foods, no lists, no products.
 * =============================================================================
 */

import { useTranslations } from 'next-intl';

import type { CategoryCard, Chapter } from './chapters-data';
import type { FigureMeta } from './chapters-meta';
import { FrDraftMarker, UrgentExit } from './figure-parts';

/*
 * The scale the bars are drawn on, in weeks: the "about 3 months" the axis
 * names at its far end. A row's range is placed on it as a proportion, so the
 * two bars are comparable — which is the whole point of the figure.
 */
const AXIS_WEEKS = 12;

type ClockRow = Extract<FigureMeta, { kind: 'fibreClocks' }>['rows'][number];

/*
 * A week as a percentage across the axis, rounded to a whole number so the
 * server HTML and the browser's render are byte-identical, and clamped so a
 * range longer than the axis cannot draw outside the bar.
 */
function offset(week: number) {
  const share = Math.round((week / AXIS_WEEKS) * 100);

  return `${Math.min(Math.max(share, 0), 100)}%`;
}

/*
 * One bar. The track and its rounded ends are CSS, so the drawing stretches to
 * whatever width the row is without distorting them; the only thing drawn here
 * is the fade, and the gradient id is derived from the ostomy type rather than
 * generated, because a generated id would differ between the server HTML and
 * the browser.
 */
function ClockBar({ row }: { row: ClockRow }) {
  const gradientId = `oc-clock-fade-${row.type}`;

  return (
    <svg
      aria-hidden
      className="oc-fig-clock-bar"
      focusable="false"
      preserveAspectRatio="none"
      viewBox="0 0 100 8"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
          <stop offset={offset(row.fadeFromWeek)} stopColor="currentColor" stopOpacity="1" />
          <stop offset={offset(row.fadeToWeek)} stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect fill={`url(#${gradientId})`} height="8" width="100" x="0" y="0" />
    </svg>
  );
}

export function FibreClocksFigure({
  card,
  exit,
  figure,
}: {
  card: CategoryCard;
  exit?: Chapter['urgentExit'];
  figure: Extract<FigureMeta, { kind: 'fibreClocks' }>;
}) {
  /*
   * The row labels are the shared ostomy-type names the recovery map uses, so
   * one surgery is never called two things on the same site, and they are not
   * new wording for anyone to review.
   */
  const t = useTranslations('OstomyCare.ui.chapter.recoveryMap');
  const text = card.figureText;
  const axis = text?.axis;

  return (
    <div className="oc-fig-clocks-wrap">
      <FrDraftMarker gate="fibreClocks" />
      {card.note ? <p className="oc-fig-clocks-note">{card.note}</p> : null}

      <ol className="oc-fig-clocks">
        {figure.rows.map((row, index) => (
          <li key={row.type}>
            <b>{t(`types.${row.type}`)}</b>
            <p>{text?.clocks[index]}</p>
            <ClockBar row={row} />
            {axis ? (
              /*
               * The scale under the bar. Hidden from assistive technology with
               * the bar it labels: the weeks are already in the sentence above
               * in words, so nothing is lost, and "Surgery / about 3 months"
               * read on its own between two sentences says nothing.
               */
              <span aria-hidden className="oc-fig-clock-axis">
                <span>{axis.start}</span>
                <span>{axis.end}</span>
              </span>
            ) : null}
          </li>
        ))}
      </ol>

      {exit ? <UrgentExit exit={exit} /> : null}
    </div>
  );
}
