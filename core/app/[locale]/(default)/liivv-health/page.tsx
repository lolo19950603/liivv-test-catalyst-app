import { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';

import type { HealthHubKitCard } from './health-hub-data';
import { LiivvHealthPage } from './liivv-health-page';
import { getDcCatalog } from './diabetes-care/get-dc-catalog';
import { getOcCatalog } from './ostomy-care/get-oc-catalog';
import { getWhCatalog } from './womens-health/get-wh-catalog';

interface Props {
  params: Promise<{ locale: string }>;
}

export const metadata: Metadata = {
  title: 'Liivv Health | Specialized care micro-sites',
  description:
    'Liivv Health is home to specialized micro-sites — storytelling, curated kits, Ask a pharmacist, and Health Profile onboarding for the seasons of care.',
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

function pickKits(
  kits: Array<{
    entityId: number;
    name: string;
    path: string;
    image?: { src: string; alt: string };
    priceLabel?: string;
  }>,
  verticalLabel: string,
  verticalHref: string,
  kitsSectionHref: string,
  limit: number,
): HealthHubKitCard[] {
  return kits.slice(0, limit).map((kit) => ({
    entityId: kit.entityId,
    name: kit.name,
    path: kit.path,
    image: kit.image,
    priceLabel: kit.priceLabel,
    verticalLabel,
    verticalHref,
    kitsSectionHref,
  }));
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [whCatalog, ocCatalog, dcCatalog] = await Promise.all([
    getWhCatalog(locale),
    getOcCatalog(locale),
    getDcCatalog(locale),
  ]);

  const featuredKits: HealthHubKitCard[] = [
    ...pickKits(
      whCatalog.kits.length > 0
        ? whCatalog.featuredKit
          ? [whCatalog.featuredKit, ...whCatalog.kits.filter((k) => k.entityId !== whCatalog.featuredKit?.entityId)]
          : whCatalog.kits
        : [],
      "Women's Health",
      '/liivv-health/womens-health',
      '/liivv-health/womens-health#build-your-kit',
      2,
    ),
    ...pickKits(
      ocCatalog.kits.length > 0
        ? ocCatalog.featuredKit
          ? [ocCatalog.featuredKit, ...ocCatalog.kits.filter((k) => k.entityId !== ocCatalog.featuredKit?.entityId)]
          : ocCatalog.kits
        : [],
      'Ostomy Care',
      '/liivv-health/ostomy-care',
      '/liivv-health/ostomy-care#build-your-kit',
      2,
    ),
    ...pickKits(
      dcCatalog.kits.length > 0
        ? dcCatalog.featuredKit
          ? [dcCatalog.featuredKit, ...dcCatalog.kits.filter((k) => k.entityId !== dcCatalog.featuredKit?.entityId)]
          : dcCatalog.kits
        : [],
      'Diabetes Care',
      '/liivv-health/diabetes-care',
      '/liivv-health/diabetes-care#shop-diabetes-care',
      2,
    ),
  ].slice(0, 4);

  return <LiivvHealthPage featuredKits={featuredKits} />;
}
