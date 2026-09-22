/*
 * The emergency route on an ostomy shelf.
 *
 * Every page of the Ostomy Care microsite signposts Chapter 02's red-flag list
 * — the chapters render it or link it, the landing has its urgent door, the
 * funding page carries the line. The shelves did not. They are category
 * listings served by the shared faceted route, so when the store-wide
 * <noscript> emergency block was removed they were left as the only ostomy URLs
 * with no route to the list in either direction, in either locale.
 *
 * Someone arriving on an ostomy shelf from a search engine is often looking for
 * a product because something is wrong. This is a plain <a>, server-rendered,
 * so it is there with scripts off, and it is the first thing in the page's main
 * content rather than something to be found below the grid.
 *
 * The wording is not new: it is the approved `urgentExit` pair the chapters and
 * the funding page already carry, reviewed in both locales, so there is nothing
 * here for a clinical reviewer to approve twice and no way for the two to
 * drift.
 */

import { getMessages } from 'next-intl/server';

import {
  chapterHref,
  localeHref,
} from '~/app/[locale]/(default)/liivv-health/ostomy-care/chapters/chapters-data';

export async function OstomyShelfExit({ locale }: { locale: string }) {
  const messages = await getMessages({ locale });
  const exit = messages.OstomyCare.chapters['this-might-be-you'].urgentExit;

  return (
    <aside className="border-b border-[#e8ded2] bg-[#fdf7f0] px-4 py-3 text-sm text-[#5a4636] @xl:px-6">
      <span>{exit.lead} </span>
      <a
        className="font-semibold underline underline-offset-2"
        href={localeHref(`${chapterHref('get-to-know-your-stoma')}#red-flags`, locale)}
      >
        {exit.link}
      </a>
    </aside>
  );
}
