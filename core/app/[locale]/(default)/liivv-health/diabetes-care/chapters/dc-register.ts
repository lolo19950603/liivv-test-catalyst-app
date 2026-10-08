import 'server-only';

/*
 * The Diabetes Care register as the shared engine reads it (../../_microsite/
 * sources.ts): the entries and their publishers, resolved on the server by
 * each route for the page locale, so a page is sent only the entries it
 * names (owner note 1, 2026-10-07: sources are shown in the element). An
 * entry kept for the review only (`display: 'reviewOnly'` in ./sources-meta.ts)
 * never resolves.
 */

import { collectSourceIds, resolveSourceMap, type SiteRegister } from '../../_microsite/sources';

import { CHAPTER_META } from './chapters-meta';
import { PUBLISHERS, SOURCE_META } from './sources-meta';

export const DC_REGISTER: SiteRegister = { entries: SOURCE_META, publishers: PUBLISHERS };

/*
 * Every entry a chapter could name in this locale, resolved: its cards', its
 * figures' (the lanes' links included) and its band's. The engine picks out
 * what each card and the foot list show, after the French review gates.
 */
export function chapterSources(slug: string, locale: string) {
  const meta = CHAPTER_META.find((chapter) => chapter.slug === slug);

  if (!meta) return {};

  return resolveSourceMap(
    DC_REGISTER,
    collectSourceIds(meta, ['sources', 'linkSources', 'bandSources']),
    locale,
  );
}
