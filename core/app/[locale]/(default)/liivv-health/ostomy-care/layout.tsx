import { PropsWithChildren } from 'react';

import { DenyAdSignals } from '~/components/analytics/deny-ad-signals';

/*
 * Every page under /liivv-health/ostomy-care — the landing, the four chapters
 * and the funding section — is read by someone who has an ostomy, is about to
 * have one, or loves someone who does. The URL says so on its own, and a
 * page_view carries the URL.
 *
 * So the advertising signals are denied for the whole section, here rather
 * than page by page, which means a page added later is covered the day it is
 * added instead of the day someone remembers. See ~/lib/analytics/ad-signals.
 *
 * This is the only thing the layout does: no markup, no styling, nothing that
 * changes what any page under it renders.
 */
export default function OstomyCareLayout({ children }: PropsWithChildren) {
  return (
    <>
      <DenyAdSignals />
      {children}
    </>
  );
}
