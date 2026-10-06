import { type AbstractIntlMessages, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { PropsWithChildren } from 'react';

import { DenyAdSignals } from '~/components/analytics/deny-ad-signals';

import { siteClientMessages } from '../_microsite/client-messages';

import { withoutHeldMessages } from './chapters/held-messages';
import { heldPathPaths } from './chapters/paths-meta';
import { heldLandingPaths } from './landing-meta';

interface Props extends PropsWithChildren {
  params: Promise<{ locale: string }>;
}

/*
 * Every page under /liivv-health/diabetes-care — the landing and the chapters
 * — is read by someone who lives with diabetes, has just been told they do, or
 * cares for someone who does. The URL says so on its own, and a page_view
 * carries the URL.
 *
 * So the advertising signals are denied for the whole section, here rather
 * than page by page, which means a page added later is covered the day it is
 * added instead of the day someone remembers. See ~/lib/analytics/ad-signals.
 *
 * The shop at /liivv-health/diabetes-care/shop-diabetes-care is not rendered
 * under this layout: the routing proxy rewrites it to the category page for
 * Shop Diabetes Care. That page renders its own flag, because the category is
 * in DIABETES_ANALYTICS_CATEGORY_IDS, and its URL still matches the path rule.
 *
 * The layout also hands the section its own copy. The root layout leaves the
 * DiabetesCare namespace out of what every page ships (see
 * ../_microsite/client-messages), so it is given back here, to the pages under
 * this layout only, with the Diabetes holds applied (./chapters/held-messages).
 * The holds include the landing's: copy whose release condition is not met
 * yet, such as the ad-signal claims, renders nowhere and so is not sent
 * either, and on /fr neither is the insulin question, which is English-only
 * (`heldLandingPaths` in ./landing-meta.ts). The
 * path pages' pharmacist band waits the same way (`heldPathPaths` in
 * ./chapters/paths-meta.ts).
 *
 * The messages are passed explicitly. A provider rendered from a server
 * component with no `messages` reads the whole tree for itself, holds and
 * all. And a nested provider replaces its parent's messages rather than adding
 * to them, so what it is given is the root bundle plus DiabetesCare: the shared
 * components on these pages still read their own namespaces.
 *
 * These are the only two things the layout does: no styling, and nothing that
 * changes what any page under it renders.
 */
const withoutDiabetesHeld = (locale: string) => (messages: AbstractIntlMessages) =>
  withoutHeldMessages(messages, [...heldLandingPaths(locale), ...heldPathPaths()]);

export default async function DiabetesCareLayout({ params, children }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  /*
   * Read with no locale argument, exactly as the root layout reads it.
   * next-intl caches the tree by that argument, and the French tree is merged
   * over the English one each time it is built. Asked for by locale, it would
   * be built twice, and the payload could not share one copy of it between the
   * two providers: every French page here would carry the whole tree twice.
   */
  const messages = await getMessages();

  return (
    <>
      <DenyAdSignals />
      <NextIntlClientProvider
        locale={locale}
        messages={siteClientMessages(messages, 'DiabetesCare', withoutDiabetesHeld(locale))}
      >
        {children}
      </NextIntlClientProvider>
    </>
  );
}
