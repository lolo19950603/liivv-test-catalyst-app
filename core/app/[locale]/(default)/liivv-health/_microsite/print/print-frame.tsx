'use client';

/*
 * =============================================================================
 * THE PRINTED SHEET'S HEADER AND FOOTER
 * =============================================================================
 * Every printable figure on both care sites renders these two inside the
 * element its print button prints (./use-print-only.ts), the head first and
 * the foot last. They are `.oc-print-only`: never on screen, never in the
 * browser's own Print of the whole page, only on the sheet a print button
 * makes (./print.css).
 *
 * Head: the site's name, the sheet's title where the figure has no heading of
 * its own, a line to write a name on, and the date it was printed. Foot: the
 * sources that back the card, as the card's own Sources line gives them
 * (Canadian first, then international, each group under its own label), and
 * the address of the page it was printed from. The date and the address are
 * written in by the hook when the button is pressed, so neither is ever stale
 * nor sent from the server.
 *
 * Words come in as props, already in the page locale: Diabetes Care's through
 * ./card-print.tsx, Ostomy's from its own messages. Nothing here adds a
 * sentence: no safety line, no product, no shop link.
 * =============================================================================
 */

import type { ReactNode } from 'react';

import './print.css';

export function PrintHead({
  site,
  title,
  name,
  printed,
}: {
  /** "Liivv · Diabetes Care". */
  site: string;
  /** The sheet's title, only where the printed figure has no heading of its own. */
  title?: string;
  /** "Name:" */
  name: string;
  /** "Printed on", followed by the date the hook writes in. */
  printed: string;
}) {
  return (
    <div aria-hidden className="oc-print-only oc-print-head">
      <p className="oc-print-site">{site}</p>
      {title ? <p className="oc-print-title">{title}</p> : null}
      <p className="oc-print-lines">
        <span>
          {name} <span className="oc-print-blank" />
        </span>
        <span>
          {printed} <span data-oc-print-date="" />
        </span>
      </p>
    </div>
  );
}

export function PrintFoot({
  sources,
  page,
}: {
  /** The card's sources, one line per group; nothing for a card without any. */
  sources?: ReactNode;
  /** "From the page", followed by the address the hook writes in. */
  page: string;
}) {
  return (
    <div aria-hidden className="oc-print-only oc-print-foot">
      {sources}
      <p>
        {page} <span data-oc-print-address="" />
      </p>
    </div>
  );
}
