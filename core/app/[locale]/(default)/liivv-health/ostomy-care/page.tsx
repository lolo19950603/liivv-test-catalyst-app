import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { SituationDoors } from './_components/situation-doors';
import { getOcCatalog } from './get-oc-catalog';
import { OstomyCarePage } from './ostomy-care-page';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = '/liivv-health/ostomy-care';

/*
 * This page used to emit FAQPage JSON-LD mirroring the five visible questions.
 * It has been removed rather than kept in step, for the same reasons the
 * funding page dropped its own (see funding/page.tsx).
 *
 * Google restricted FAQ rich results to government and health-authority sites
 * in August 2023, so a commercial site wins nothing from it. And the five
 * questions were hardcoded English with inLanguage 'en-CA' regardless of
 * route, so the French page would declare English Q&A content — while the
 * schema had to be hand-mirrored from JSX in a second file, which is how
 * structured data drifts out of step with the page it describes.
 *
 * If it is wanted again, render the FAQ itself from messages/*.json so the
 * French is true as well, and generate the schema from the same source.
 */

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: 'Ostomy Care & Everyday "Liivving" | Liivv',
    // No "curated kits" while every kit is withheld from ostomy surfaces
    // (oc-ids.ts). A description is a promise about what the page holds, and
    // the page holds none. Put it back with the allowlist.
    description:
      'Ostomy supplies, everyday living support, and kind guidance — pouches, barriers, and Ontario pharmacist chat.',
    // Still suppressed, unlike the chapters and the funding section. The chapter
    // cards on this page are translated, but the landing's own copy — hero, kits,
    // shop, subscribe, FAQ — is still hardcoded English in ostomy-care-page.tsx.
    // Turn this on once that copy moves into messages/.
    alternates: await getMetadataAlternates({ path: PATH, locale, includeAlternates: false }),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const catalog = await getOcCatalog(locale);

  /*
   * C13. The doors are rendered here, on the server, and handed to the client
   * page as a slot: the landing page component is a client component, and the
   * five links must not cost the landing a byte of client JavaScript. They took
   * the place of the guest quiz and the kit flow demo, which did.
   */
  return <OstomyCarePage catalog={catalog} doors={<SituationDoors />} />;
}
