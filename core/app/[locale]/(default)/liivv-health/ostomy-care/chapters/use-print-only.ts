import { type RefObject, useEffect, useState } from 'react';

/*
 * Print only one element of the page.
 *
 * `print` marks the element with data-oc-printing and adds html.oc-printing;
 * the print rules in chapter-page.css then hide everything else. Both marks
 * come off on the window's afterprint event, so two print targets on one page
 * never leave each other flagged.
 *
 * `ready` turns true after hydration. Render the print button only when it is
 * true, so the button never sits in server HTML doing nothing.
 */
export function usePrintOnly<T extends HTMLElement>(ref: RefObject<T | null>) {
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  const print = () => {
    const el = ref.current;

    if (!el) return;

    const done = () => {
      el.removeAttribute('data-oc-printing');
      document.documentElement.classList.remove('oc-printing');
      window.removeEventListener('afterprint', done);
    };

    el.setAttribute('data-oc-printing', '');
    document.documentElement.classList.add('oc-printing');
    window.addEventListener('afterprint', done);
    window.print();
  };

  return { ready, print };
}
