/*
 * =============================================================================
 * hidden="until-found", in one place
 * =============================================================================
 * The one primitive the microsite's islands must not get wrong. A node hidden
 * this way is still reachable by the browser's own find-in-page: the browser
 * reveals it and fires `beforematch`, which is how the walk-through jumps to a
 * step a reader searched for and how the recovery map ticks a type back on.
 *
 * `hidden` with any other value — or `hidden` as a boolean — hides the text
 * from find-in-page outright, silently: nothing throws, nothing logs, and the
 * reader simply cannot find words that are on the page. So the value is written
 * once, here, and both islands import it rather than keep their own copy.
 *
 * The attribute goes on server-rendered nodes through a ref, because React
 * types neither `hidden="until-found"` nor `beforematch`.
 *
 * The matching CSS carries its own warning (chapter-page.css): these nodes must
 * never be given an author `display`, or the browser stops revealing them.
 * =============================================================================
 */

export const UNTIL_FOUND = 'until-found';

/* Hide `el` from view but not from find-in-page, or show it again. */
export function setUntilFound(el: Element | null | undefined, hide: boolean) {
  if (hide) el?.setAttribute('hidden', UNTIL_FOUND);
  else el?.removeAttribute('hidden');
}
