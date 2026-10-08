'use client';

/*
 * =============================================================================
 * PRINT ONE ELEMENT OF THE PAGE — EVERY CARE SITE'S PRINT BUTTONS
 * =============================================================================
 * Shared by both sites: Ostomy's take-in card imports it through
 * ostomy-care/chapters/use-print-only.ts, which only re-exports it, and the
 * engine's and Diabetes Care's printable figures import it from here. It is
 * not a twin; there is one copy.
 *
 * `print` clears whatever an earlier print left marked, then marks:
 * - the element with `data-oc-printing`,
 * - every ancestor of it up to <body> with `data-oc-print-path`,
 * - and <html> with `oc-printing`.
 * The rules in ./print.css then take everything else out of the printed
 * document (display: none, so it takes no room), flatten the ancestors so
 * nothing clips, positions or filters the element, and centre it on the
 * sheet. Owner note 2 (2026-10-07): the old visibility rule printed 24 to 70
 * mostly blank sheets with the list somewhere in the middle.
 *
 * Just before it opens the print dialog it writes the date, in the page
 * locale, into each `[data-oc-print-date]` inside the element, and the page's
 * address into each `[data-oc-print-address]` (./print-frame.tsx). Written
 * into the nodes directly, at the moment of printing: never from state, which
 * React would not have committed when `window.print()` blocks, and never
 * during render, which would differ between the server and the browser.
 *
 * The tab title becomes "<title> – Liivv" while the dialog is open, so "Save
 * as PDF" names the file after the sheet.
 *
 * Every mark comes off on `afterprint`. A browser that opens its print sheet
 * without blocking (iOS Safari, Android Chrome) may never send it, so a
 * `beforeprint` that this hook did not start (the browser's own Print, or
 * Ctrl+P) clears any mark left over first: the whole page prints, as it
 * should, never an old card.
 *
 * `ready` turns true after hydration. Render the print button only when it is
 * true, so the button never sits in server HTML doing nothing. Nothing is
 * stored or sent.
 * =============================================================================
 */

import { useLocale } from 'next-intl';
import { type RefObject, useEffect, useState } from 'react';

const PRINTING_CLASS = 'oc-printing';
const TARGET = 'data-oc-printing';
const PATH = 'data-oc-print-path';
const DATE = 'data-oc-print-date';
const ADDRESS = 'data-oc-print-address';

/* A print this hook started whose `beforeprint` has not been seen yet. */
let pending = false;
/* The tab title from before the print, while the sheet's title stands in for it. */
let savedTitle: string | null = null;
let listening = false;

function clearMarks() {
  document.querySelectorAll(`[${TARGET}]`).forEach((node) => node.removeAttribute(TARGET));
  document.querySelectorAll(`[${PATH}]`).forEach((node) => node.removeAttribute(PATH));
  document.documentElement.classList.remove(PRINTING_CLASS);

  if (savedTitle !== null) {
    document.title = savedTitle;
    savedTitle = null;
  }
}

/* Once per page, whichever print button mounts first. */
function listen() {
  if (listening) return;

  listening = true;

  window.addEventListener('beforeprint', () => {
    if (pending) {
      pending = false;

      return;
    }

    clearMarks();
  });

  window.addEventListener('afterprint', () => {
    pending = false;
    clearMarks();
  });
}

export function usePrintOnly<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: { title?: string } = {},
) {
  const locale = useLocale();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    listen();
    setReady(true);
  }, []);

  const print = () => {
    const el = ref.current;

    if (!el) return;

    clearMarks();

    el.setAttribute(TARGET, '');

    for (
      let node = el.parentElement;
      node && node !== document.body && node !== document.documentElement;
      node = node.parentElement
    ) {
      node.setAttribute(PATH, '');
    }

    const date = new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(new Date());
    const address = `${window.location.host}${window.location.pathname}`;

    el.querySelectorAll(`[${DATE}]`).forEach((node) => {
      node.textContent = date;
    });
    el.querySelectorAll(`[${ADDRESS}]`).forEach((node) => {
      node.textContent = address;
    });

    document.documentElement.classList.add(PRINTING_CLASS);

    if (options.title) {
      savedTitle = document.title;
      document.title = `${options.title} – Liivv`;
    }

    pending = true;
    window.print();
  };

  return { ready, print };
}
