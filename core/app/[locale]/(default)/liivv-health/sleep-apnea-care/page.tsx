import { Metadata } from 'next';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { locales } from '~/i18n/locales';
import { getMetadataAlternates } from '~/lib/seo/canonical';

import { chapterHref, localeHref } from '../_microsite/chapters/hrefs';
import {
  chapterPlace,
  isEngineChapter,
  landingChapters,
  landingCitations,
  uniqueCitations,
} from '../_microsite/landing/compose';

import { showsFrDraftMarker } from './chapters/review-gates';
import { SA_REGISTER } from './chapters/sa-register';
import { SLEEP_SITE } from './chapters/site';
import { getSaCatalog } from './get-sa-catalog';
import {
  CARE_SLEEP_TEAM_SOURCES,
  FACT_BAND,
  FAQ_META,
  HERO_SOURCES,
  LANDING_GATES,
  type LandingLinkTo,
  MAGNET_BADGE_SOURCES,
  RETURNS_POLICY_HREF,
  SHOP_MAGNET_LINK,
  SHOP_MAGNET_SOURCES,
  SHOP_ROOMS,
  SHOP_SLEEP_HREF,
  SHOP_SOURCES,
  SITUATION_DOORS,
  THERAPIES_SOURCES,
  THERAPY_CHIPS,
  type TherapyChip,
  TRUST_ITEMS,
  URGENT_EXIT_CHAPTER,
} from './landing-meta';
import { MAGNET_NOTICE_MASK_IDS } from './sa-ids';
import { SaLandingPage } from './sa-landing-page';
import type { SaLandingSetup, SaTherapyChip } from './sa-landing-types';
import { SaSituationDoors } from './sa-situation-doors';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = SLEEP_SITE.basePath;
const IMG = '/archive/liivv-home';

/*
 * The landing's own anchors. Every chapter's back link goes to #where-are-you,
 * so it may not change. #doors the situation doors, #which-therapy the
 * therapy chips, #shop-sleep-apnea-care the shelf, #care the care band.
 */
const SHOP_ANCHOR = 'shop-sleep-apnea-care';
const DOORS_ANCHOR = 'doors';

/*
 * No FAQPage JSON-LD, for Ostomy's and Diabetes Care's reasons. No `robots`
 * here: the section's layout sets noindex while it is not live (./launch.ts).
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SleepApneaCare.ui.landingPage.meta' });

  return {
    title: t('title'),
    description: t('description'),
    alternates: await getMetadataAlternates({ path: PATH, locale }),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/* Where a linked phrase in an answer goes, in the page locale; null while its target is not served. */
function linkHref(to: LandingLinkTo, locale: string) {
  if ('source' in to) return landingCitations(SA_REGISTER, [to.source], locale)[0]?.href ?? null;

  if ('tel' in to) return `tel:${to.tel}`;

  if ('page' in to) return localeHref(to.page, locale);

  return chapterPlace(SLEEP_SITE, locale, to.chapter, to.anchor);
}

/*
 * A therapy chip opens its path page (chapters/[slug] serves all six), or its
 * chapter card while that chapter is on the engine. A chip with neither is
 * left off (landing.md A, row 4).
 */
function chipHref(chip: TherapyChip, locale: string) {
  if (chip.path) {
    return localeHref(chapterHref(SLEEP_SITE, chip.path), locale);
  }

  if (chip.card && isEngineChapter(SLEEP_SITE, chip.card.chapter)) {
    return chapterPlace(SLEEP_SITE, locale, chip.card.chapter, chip.card.anchor);
  }

  return null;
}

/* The ICU values of an answer whose switch is on. */
function liveValues(faq: (typeof FAQ_META)[number]) {
  return (faq.values ?? [])
    .filter((value) => !value.gate || LANDING_GATES[value.gate])
    .map((value) => value.name);
}

/* The magnet warning's sources, and each notice named by a mask on today's shelf. */
function magnetSources(products: Awaited<ReturnType<typeof getSaCatalog>>, locale: string) {
  const notices = [
    ...new Set(
      products.flatMap((product) => {
        const notice = MAGNET_NOTICE_MASK_IDS[product.entityId];

        return notice ? [notice] : [];
      }),
    ),
  ];

  return landingCitations(
    SA_REGISTER,
    [...new Set([...SHOP_MAGNET_SOURCES, ...notices.flatMap((n) => MAGNET_BADGE_SOURCES[n])])],
    locale,
  );
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [products, messages] = await Promise.all([getSaCatalog(locale), getMessages({ locale })]);
  const cite = (ids: readonly string[]) => landingCitations(SA_REGISTER, ids, locale);

  const chips = THERAPY_CHIPS.flatMap((chip): SaTherapyChip[] => {
    const href = chipHref(chip, locale);

    return href ? [{ id: chip.id, href, sources: cite(chip.sources) }] : [];
  });
  const therapiesSources = chips.length ? cite(THERAPIES_SOURCES) : [];
  const facts = FACT_BAND.map((fact, index) => ({
    key: String(index + 1),
    sources: cite(fact.sources),
  }));
  /* A question whose answer waits on a switch is left out whole, never shown without it. */
  const faqs = FAQ_META.flatMap((faq, index) =>
    faq.gate && !LANDING_GATES[faq.gate]
      ? []
      : [
          {
            key: String(index + 1),
            sources: cite(faq.sources),
            links: (faq.links ?? []).map((to) => linkHref(to, locale)),
            values: liveValues(faq),
          },
        ],
  );
  const hasShop = products.length > 0;
  const shop = {
    rxMaskLine: LANDING_GATES.rxMaskGateShipped,
    returnsHref:
      LANDING_GATES.returnsPolicyPublished && RETURNS_POLICY_HREF
        ? localeHref(RETURNS_POLICY_HREF, locale)
        : null,
    magnetHref: chapterPlace(SLEEP_SITE, locale, SHOP_MAGNET_LINK.chapter, SHOP_MAGNET_LINK.anchor),
    settingsSources: cite(SHOP_SOURCES),
    magnetSources: magnetSources(products, locale),
  };
  const heroSources = cite(HERO_SOURCES);
  const careSources = cite(CARE_SLEEP_TEAM_SOURCES);
  const doorSources = cite(SITUATION_DOORS.flatMap((door) => door.sources ?? []));

  const setup: SaLandingSetup = {
    rootId: 'sleep-apnea-care',
    classPrefix: 'sa-',
    images: {
      hero: `${IMG}/corner-sleep.png`,
      care: `${IMG}/care-chat.png`,
      closing: `${IMG}/corner-sleep.png`,
    },
    shopHref: localeHref(SHOP_SLEEP_HREF, locale),
    shopAnchor: SHOP_ANCHOR,
    trustKeys: TRUST_ITEMS.flatMap((item, index) =>
      item.gate && !LANDING_GATES[item.gate] ? [] : [String(index + 1)],
    ),
    heroSources,
    chips,
    therapiesSources,
    facts,
    chapters: landingChapters(SLEEP_SITE, messages, locale),
    /* "All", and each room only while today's shelf has something in it. */
    shopRooms: SHOP_ROOMS.filter(
      (room) => room === 'all' || products.some((product) => product.room === room),
    ),
    products,
    shop,
    careSources,
    faqs,
    pageSources: uniqueCitations([
      heroSources,
      doorSources,
      therapiesSources,
      ...chips.map((chip) => chip.sources),
      ...facts.map((fact) => fact.sources),
      ...(hasShop ? [shop.settingsSources, shop.magnetSources] : []),
      careSources,
      ...faqs.map((faq) => faq.sources),
    ]),
    frDraft: showsFrDraftMarker('landing', locale),
  };

  /*
   * The doors are rendered here, on the server, and handed to the client page
   * as a slot: the links cost the landing no client JavaScript. The urgent
   * door is never gated; the "Paying for it" door opens the funding page
   * (`fundingPage` in ./landing-meta.ts).
   */
  return (
    <SaLandingPage
      doors={
        <SaSituationDoors
          doors={SITUATION_DOORS}
          fundingHref={LANDING_GATES.fundingPage ? `${PATH}/funding` : null}
          id={DOORS_ANCHOR}
          locale={locale}
          urgentExitChapter={URGENT_EXIT_CHAPTER}
        />
      }
      setup={setup}
    />
  );
}
