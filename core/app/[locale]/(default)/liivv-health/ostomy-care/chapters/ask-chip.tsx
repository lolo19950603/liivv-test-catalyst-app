import { useTranslations } from 'next-intl';

import type { AskRole } from './chapters-data';

/*
 * The referral chip.
 *
 * Every bullet in this microsite was written to end on a named person to ask —
 * that is the rule that keeps clinical copy referral-shaped rather than
 * instructional, and it is why the content survived its fact-checks. The rule
 * was invisible, buried in the last clause of a sentence. This surfaces it.
 *
 * 'assessment' and 'urgent' render in the warning tone: those two are not
 * "someone you could ask", they are "do not act on this page alone".
 *
 * Its own file so section components can use it without importing
 * chapter-page.tsx, which imports them.
 */
export function AskChip({ role }: { role: AskRole }) {
  const t = useTranslations('OstomyCare.ui.chapter.ask');
  const loud = role === 'assessment' || role === 'urgent';

  return <span className={loud ? 'oc-ch-ask is-loud' : 'oc-ch-ask'}>{t(role)}</span>;
}
