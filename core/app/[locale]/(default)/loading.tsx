import { OliviaSpinner } from '~/components/olivia/olivia-spinner';

/*
 * NAMED SHIP BLOCKER: this file is why nothing renders without JavaScript.
 *
 * A `loading.tsx` at a segment wraps everything below it — nested layouts and
 * the page — in a Suspense boundary, so every route in the `(default)` group is
 * streamed. React sends the body inside a `<div hidden>` and an inline script
 * moves it into place, which means a reader with scripts disabled or blocked
 * sees this caption and nothing else: 61% to 70% of each page's text, measured
 * on the served HTML, stays hidden. It is the whole store, not one section —
 * the untouched home page behaves the same way.
 *
 * On the ostomy routes that costs the emergency red-flag list and the 9-8-8
 * crisis line, which is not an acceptable thing to lose silently. Until the
 * streaming shape is changed, those two ride outside this boundary in
 * `app/[locale]/(default)/liivv-health/ostomy-care/_components/no-script-emergency.tsx`,
 * rendered from the ROOT layout. That is a stopgap for two pieces of content,
 * not a fix: every other word on every page is still invisible without
 * JavaScript, and `docs/content-review/README.md` tells the clinical reviewer
 * so.
 */
export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-16">
      <OliviaSpinner caption="Olivia is fetching that…" />
    </div>
  );
}
