import type { Metadata } from 'next';
import { type AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { DenyAdSignals } from '~/components/analytics/deny-ad-signals';

import { siteClientMessages } from '../_microsite/client-messages';

import { withoutHeldMessages } from './chapters/held-messages';
import { heldPathPaths } from './chapters/paths-meta';
import { heldFundingPaths } from './funding/funding-meta';
import { heldLandingPaths } from './landing-meta';
import { SLEEP_APNEA_CARE_LIVE } from './launch';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

/*
 * Pre-launch: every page under /liivv-health/sleep-apnea-care — the landing,
 * the chapters, the path pages, the funding page and the machine guide —
 * is `noindex, nofollow` until the owner flips SLEEP_APNEA_CARE_LIVE
 * (./launch.ts). The pages set no `robots` of their own, so they all inherit
 * this one. The section is reachable at its URL, but nothing links to it and
 * the sitemap leaves it out.
 */
export const metadata: Metadata = SLEEP_APNEA_CARE_LIVE
  ? {}
  : { robots: { index: false, follow: false } };

/*
 * Every page here is read by someone who has sleep apnea, thinks they might,
 * or cares for someone who does, and the URL says so on its own. The
 * advertising signals are denied for the whole section, here rather than page
 * by page, from the day the pages exist, launched or not
 * (~/lib/analytics/ad-signals.ts covers the path as well).
 *
 * The layout also hands the section its own copy. The root layout leaves the
 * SleepApneaCare namespace out of what every page ships
 * (../_microsite/client-messages), so it is given back here, to the pages
 * under this layout only, with the Sleep holds applied: the held cards
 * (./chapters/held-messages.ts), the landing copy whose release condition is
 * not met yet (`heldLandingPaths`), and the path and funding pages' held
 * words (none today). Held words render nowhere and so are not sent either.
 *
 * A nested provider replaces its parent's messages rather than adding to
 * them, so what it is given is the root bundle plus SleepApneaCare. Read with
 * no locale argument, exactly as the root layout reads it (Diabetes Care's
 * layout says why).
 */
const withoutSleepHeld = (locale: string) => (messages: AbstractIntlMessages) =>
  withoutHeldMessages(messages, [
    ...heldLandingPaths(locale),
    ...heldPathPaths(),
    ...heldFundingPaths(),
  ]);

export default async function SleepApneaCareLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const messages = await getMessages();

  return (
    <>
      <DenyAdSignals />
      <NextIntlClientProvider
        locale={locale}
        messages={siteClientMessages(messages, 'SleepApneaCare', withoutSleepHeld(locale))}
      >
        {children}
      </NextIntlClientProvider>
    </>
  );
}
