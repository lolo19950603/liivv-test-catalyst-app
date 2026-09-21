'use client';

/*
 * =============================================================================
 * OPENING GAP COMPARISON (C07) — Chapter 02, card 9
 * =============================================================================
 * Three panels side by side: an opening touching the stoma, a small gap, a
 * large gap. Each is an abstract line drawing with no words, no millimetres and
 * no tissue texture, and each carries an equal-weight caption from the message
 * tree. Nothing is marked correct, nothing is highlighted, and a line above the
 * panels says the drawings are not to scale and that the reader's nurse sets
 * the size. Canadian guides give different numbers (NSWOCC 1–2 mm, Kingston
 * about 3 mm), so the figure shows the two ways it goes wrong and leaves the
 * number to the person who measures.
 *
 * Everything a reader needs is in the server HTML: the not-to-scale line, the
 * three drawings, the captions as a list, the note about mouldable barriers and
 * re-measuring, and the signpost to this chapter's emergency list. The only
 * control is a round / oval pair, a separate island (gap-compare-toggle.tsx)
 * loaded after hydration. Both shapes are drawn here and the stylesheet shows
 * one of them, so the island only flips a class and can never change a word.
 *
 * That describes this figure's markup, and stops there. A reader with
 * JavaScript off gets none of the page: every route in the (default) group is
 * streamed inside the Suspense boundary that
 * `app/[locale]/(default)/loading.tsx` opens, so the body arrives in a
 * `<div hidden>` that only an inline script moves into the document. Site-wide,
 * not this figure's, and not fixable from here — recorded as residual #12.
 *
 * The drawings are aria-hidden: the captions beside them are the content, and
 * they never repeat a word of the card's own sentences.
 * =============================================================================
 */

import dynamic from 'next/dynamic';
import { useRef } from 'react';

import type { CategoryCard, Chapter } from './chapters-data';
import { FrDraftMarker, UrgentExit } from './figure-parts';

const Toggle = dynamic(() => import('./gap-compare-toggle').then((mod) => mod.GapCompareToggle), {
  ssr: false,
});

/*
 * How much wider than the stoma the barrier's opening is drawn, per panel, in
 * the drawing's own units. Negative is an opening narrower than the stoma — the
 * barrier then sits on it, which is the first panel. These are picture
 * proportions chosen to be legible, not a measurement: the panels say so.
 */
const GAPS = [-5, 4, 17];

/* The two stoma shapes, drawn at the same place and size. Round is shown first. */
const SHAPES = [
  { key: 'round', rx: 32, ry: 32 },
  { key: 'oval', rx: 40, ry: 26 },
];

const CX = 80;
const CY = 75;

/* The barrier: a rounded rectangle. Its hole is punched with fill-rule evenodd. */
const BARRIER_OUTLINE =
  'M14,8 h132 a8,8 0 0 1 8,8 v118 a8,8 0 0 1 -8,8 h-132 a8,8 0 0 1 -8,-8 v-118 a8,8 0 0 1 8,-8 Z';

const ellipsePath = (rx: number, ry: number) =>
  `M${CX - rx},${CY} a${rx},${ry} 0 1,0 ${2 * rx},0 a${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;

/* One stoma shape inside one panel: skin, stoma, barrier, and the edge beneath it. */
function GapShape({
  gap,
  patternId,
  shape,
}: {
  gap: number;
  patternId: string;
  shape: (typeof SHAPES)[number];
}) {
  const rx = shape.rx + gap;
  const ry = shape.ry + gap;

  return (
    <g className={`oc-fig-gap-shape oc-fig-gap-shape-${shape.key}`}>
      {gap > 0 ? <ellipse cx={CX} cy={CY} fill={`url(#${patternId})`} rx={rx} ry={ry} /> : null}
      <ellipse className="oc-fig-gap-stoma" cx={CX} cy={CY} rx={shape.rx} ry={shape.ry} />
      <path
        className="oc-fig-gap-barrier"
        d={`${BARRIER_OUTLINE} ${ellipsePath(rx, ry)}`}
        fillRule="evenodd"
      />
      {gap > 0 ? null : (
        <ellipse className="oc-fig-gap-under" cx={CX} cy={CY} rx={shape.rx} ry={shape.ry} />
      )}
    </g>
  );
}

function GapPanel({ index }: { index: number }) {
  const gap = GAPS[index];

  if (gap === undefined) return null;

  /*
   * A pattern is only referable inside its own <svg>, so each panel carries its
   * own, and the id is derived from the panel rather than generated — the figure
   * appears once on the page, and a generated id would differ between the server
   * HTML and the browser.
   */
  const patternId = `oc-gap-skin-${index + 1}`;

  return (
    <svg
      aria-hidden
      className="oc-fig-gap-svg"
      focusable="false"
      viewBox="0 0 160 150"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          height="6"
          id={patternId}
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
          width="6"
        >
          <rect className="oc-fig-gap-skin-bg" height="6" width="6" />
          <line className="oc-fig-gap-skin-line" x1="0" x2="0" y1="0" y2="6" />
        </pattern>
      </defs>
      <rect className="oc-fig-gap-bg" height="150" width="160" x="0" y="0" />
      {SHAPES.map((shape) => (
        <GapShape gap={gap} key={shape.key} patternId={patternId} shape={shape} />
      ))}
    </svg>
  );
}

export function GapCompareFigure({
  card,
  exit,
}: {
  card: CategoryCard;
  exit?: Chapter['urgentExit'];
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const text = card.figureText;
  const panels = text?.panels ?? [];

  return (
    <div className="oc-fig-gap-wrap" ref={rootRef}>
      <FrDraftMarker gate="gapCompare" />
      <div className="oc-fig-gap-head">
        {text?.notToScale ? <p className="oc-fig-gap-note">{text.notToScale}</p> : null}
        <Toggle root={rootRef} />
      </div>

      <ul className="oc-fig-gap-panels">
        {panels.map((panel, index) => (
          <li key={panel.title}>
            <GapPanel index={index} />
            <b>{panel.title}</b>
            <p>{panel.body}</p>
          </li>
        ))}
      </ul>

      {text?.mouldable ? <p className="oc-fig-gap-more">{text.mouldable}</p> : null}
      {exit ? <UrgentExit exit={exit} /> : null}
    </div>
  );
}
