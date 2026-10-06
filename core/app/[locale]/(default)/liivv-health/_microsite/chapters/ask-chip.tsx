/* Twin of ostomy-care/chapters/ask-chip.tsx @3b343c6e — port fixes both ways until Phase 2 */

import { useSiteMessages } from '../site-context';

/*
 * The referral chip.
 *
 * Every bullet in these microsites was written to end on a named person to ask
 * — that is the rule that keeps clinical copy referral-shaped rather than
 * instructional. The rule was invisible, buried in the last clause of a
 * sentence. This surfaces it.
 *
 * The roles are the site's own (its AskRole in chapters-meta.ts), each labelled
 * from `ui.chapter.ask.<role>` in the site's messages, so a site adds a role
 * there and in its meta and nowhere else. Read from the message object rather
 * than t(), which cannot type a key that only one site has. A role with no
 * label shows its key rather than nothing, so a missing label is seen.
 *
 * 'assessment' and 'urgent' render in the warning tone on every site: those
 * two are not "someone you could ask", they are "do not act on this page
 * alone".
 *
 * Its own file so section components can use it without importing
 * chapter-page.tsx, which imports them.
 */
export function AskChip({ role }: { role: string }) {
  const labels: Record<string, string> = useSiteMessages().ui.chapter.ask;
  const loud = role === 'assessment' || role === 'urgent';

  return <span className={loud ? 'oc-ch-ask is-loud' : 'oc-ch-ask'}>{labels[role] ?? role}</span>;
}
