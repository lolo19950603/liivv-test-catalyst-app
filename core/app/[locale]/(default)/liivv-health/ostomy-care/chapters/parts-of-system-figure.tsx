'use client';

/*
 * =============================================================================
 * PARTS OF A POUCHING SYSTEM (C08) — Chapter 02, card 3
 * =============================================================================
 * BUILT AND HELD. `held: 'writtenRuling'` on the figure in chapters-meta.ts
 * keeps it off every page, in both locales, until the owner and the NSWOC rule
 * in writing that an unbranded schematic is not "product imagery in an
 * explanatory figure". Deleting that one line is the whole switch; nothing in
 * this file has to change with it.
 *
 * An abstract line drawing beside a list of terms. The drawing is aria-hidden
 * and carries no words at all — no labels, no leaders, no numbers — because the
 * <dl> next to it is the content, and a reader who never sees the picture loses
 * nothing. The terms are the short forms of card 3's own sentences about the
 * appliance and the barrier, plus the two the card does not have words for: the
 * pouch, and where the two parts join.
 *
 * Everything is in the server HTML at once: both systems, all three pouch
 * shapes, and every term and definition. The only control is a pair of view
 * segments (parts-of-system-toggle.tsx), loaded after hydration, and all it
 * does is put a class on this wrapper so the stylesheet draws a different
 * shape. It cannot change a word, and with JavaScript off the drawing is a
 * two-piece system with a drainable pouch and the whole list is already there.
 *
 * What is deliberately not drawn: convexity, which stays a sentence on this
 * card because it is an assessment rather than a shape; any coupling
 * mechanism, click ring or tab; and any outline, proportion or trade dress
 * belonging to a real product. The join is a dashed outline and a caption.
 * =============================================================================
 */

import dynamic from 'next/dynamic';
import { useRef } from 'react';

import type { CategoryCard } from './chapters-data';
import { FrDraftMarker } from './figure-parts';

const Toggle = dynamic(
  () => import('./parts-of-system-toggle').then((mod) => mod.PartsOfSystemToggle),
  { ssr: false },
);

/* The corner radius the pouch outlines are rounded with, in drawing units. */
const CORNER = 16;

/*
 * One pouch outline: a rounded bag whose foot is either closed off or narrowed
 * into a plain spout. The spout says "this one opens" and nothing more — it is
 * not a closure, a clip or a tap, none of which any source describes the same
 * way twice.
 */
function pouchPath(x: number, top: number, width: number, height: number, closed: boolean) {
  const straight = height - 2 * CORNER;
  const spout = -width / 2 + 12;
  const head = `M${x + CORNER},${top} h${width - 2 * CORNER} a${CORNER},${CORNER} 0 0 1 ${CORNER},${CORNER} v${straight}`;
  const foot = closed
    ? ` a${width / 2},18 0 0 1 ${-width},0`
    : ` q0,16 ${spout},22 h-24 q${spout},-6 ${spout},-22`;

  return `${head}${foot} v${-straight} a${CORNER},${CORNER} 0 0 1 ${CORNER},${-CORNER} Z`;
}

/*
 * The two pouch outlines for one system, drawn in the same place. The
 * stylesheet shows one of them; the drainable outline is the one that shows
 * with no JavaScript, and the urostomy view is that same outline with the
 * drain below it.
 */
function Pouch({ height, width, x, y }: { height: number; width: number; x: number; y: number }) {
  return (
    <>
      <path
        className="oc-fig-parts-pouch oc-fig-parts-pouch-open"
        d={pouchPath(x, y, width, height, false)}
      />
      <path
        className="oc-fig-parts-pouch oc-fig-parts-pouch-closed"
        d={pouchPath(x, y, width, height, true)}
      />
    </>
  );
}

/*
 * Two pieces: a barrier on the skin, a pouch beside it, and a dashed outline
 * round each of the places they meet. The arrow says the pouch goes on to the
 * barrier; it is not a step and there is no second arrow coming back.
 */
function TwoPiece() {
  return (
    <g className="oc-fig-parts-sys oc-fig-parts-sys-two">
      <rect className="oc-fig-parts-barrier" height="80" rx="14" width="80" x="14" y="44" />
      <circle className="oc-fig-parts-stoma" cx="54" cy="84" r="13" />
      <circle className="oc-fig-parts-seam" cx="54" cy="84" r="26" />
      <path className="oc-fig-parts-arrow" d="M100,84 h14" markerEnd="url(#oc-parts-arrow)" />
      <Pouch height={120} width={82} x={124} y={18} />
      <circle className="oc-fig-parts-seam" cx="165" cy="62" r="26" />
      <rect className="oc-fig-parts-tap" height="12" rx="3" width="14" x="158" y="141" />
    </g>
  );
}

/* One piece: the same two parts, with no seam drawn, because there is none. */
function OnePiece() {
  return (
    <g className="oc-fig-parts-sys oc-fig-parts-sys-one">
      <Pouch height={124} width={90} x={66} y={18} />
      <rect className="oc-fig-parts-barrier" height="60" rx="12" width="60" x="81" y="32" />
      <circle className="oc-fig-parts-stoma" cx="111" cy="62" r="11" />
      <rect className="oc-fig-parts-tap" height="12" rx="3" width="14" x="104" y="145" />
    </g>
  );
}

export function PartsOfSystemFigure({ card }: { card: CategoryCard }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const terms = card.figureText?.terms ?? [];

  return (
    <div className="oc-fig-parts-wrap" ref={rootRef}>
      <FrDraftMarker gate="partsOfSystem" />
      <Toggle root={rootRef} />

      <div className="oc-fig-parts">
        {/*
         * The marker id is written out rather than generated: the figure appears
         * once on the page, and a generated id would differ between the server
         * HTML and the browser.
         */}
        <svg
          aria-hidden
          className="oc-fig-parts-svg"
          focusable="false"
          viewBox="0 0 220 170"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <marker
              id="oc-parts-arrow"
              markerHeight="6"
              markerWidth="6"
              orient="auto"
              refX="8"
              refY="5"
              viewBox="0 0 10 10"
            >
              <path className="oc-fig-parts-arrowhead" d="M0,0 L10,5 L0,10 z" />
            </marker>
          </defs>
          <TwoPiece />
          <OnePiece />
        </svg>

        <dl className="oc-fig-parts-terms">
          {terms.map((entry) => (
            <div key={entry.term}>
              <dt>{entry.term}</dt>
              <dd>{entry.def}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
