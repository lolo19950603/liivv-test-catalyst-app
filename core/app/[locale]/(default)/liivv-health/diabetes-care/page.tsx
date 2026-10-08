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
import { SituationDoors } from '../_microsite/landing/situation-doors';
import type {
  LandingBrand,
  LandingChip,
  LandingFaq,
  LandingSetup,
} from '../_microsite/landing/types';

import { DC_REGISTER } from './chapters/dc-register';
import { PATH_META } from './chapters/paths-meta';
import { showsFrDraftMarker } from './chapters/review-gates';
import { DIABETES_SITE } from './chapters/site';
import { isListedDiabetesKit } from './dc-ids';
import { DiabetesCarePage } from './diabetes-care-page';
import { getDcCatalog } from './get-dc-catalog';
import { getDiabetesShopCatalog } from './get-diabetes-shop';
import {
  BRANDS,
  FACT_BAND,
  FAQ_META,
  LANDING_GATES,
  type LandingLinkTo,
  PHARMACIST_CDE_REQUEST_HREF,
  PHARMACIST_CHAT_HREF,
  SHOP_DIABETES_HREF,
  SHOP_ROOMS,
  SITUATION_DOORS,
  TRUST_ITEMS,
  TYPE_CHIPS,
  TYPE_CHIPS_CHAPTER,
  TYPES_SOURCES,
  URGENT_EXIT_CHAPTER,
} from './landing-meta';

interface Props {
  params: Promise<{ locale: string }>;
}

const PATH = DIABETES_SITE.basePath;
const IMG = '/archive/diabetes-care';

/*
 * The landing's own anchors. Other pages link to the shelf by its id
 * (liivv-health-page.tsx and the hub's page.tsx), and every chapter's back
 * link goes to #where-are-you, so neither may change. #care is the care band,
 * #which-diabetes the type chips, #doors the situation doors.
 */
const SHOP_ANCHOR = 'shop-diabetes-care';
const DOORS_ANCHOR = 'doors';

/*
 * No FAQPage JSON-LD, for Ostomy's reasons (ostomy-care/page.tsx): Google
 * shows FAQ rich results only for government and health-authority sites, and
 * schema hand-mirrored from a page drifts out of step with it.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'DiabetesCare.ui.landingPage.meta' });

  return {
    title: t('title'),
    description: t('description'),
    // Every word on the landing is in the message files now, in both locales,
    // so the page declares its French alternate as the chapters do.
    alternates: await getMetadataAlternates({ path: PATH, locale }),
  };
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

/* Where a linked phrase in an answer goes, in the page locale. */
function linkHref(to: LandingLinkTo, locale: string) {
  if ('source' in to) return landingCitations(DC_REGISTER, [to.source], locale)[0]?.href ?? null;

  if ('tel' in to) return `tel:${to.tel}`;

  if ('email' in to) return `mailto:${to.email}`;

  if ('page' in to) return localeHref(to.page, locale);

  return chapterPlace(DIABETES_SITE, locale, to.chapter, to.anchor);
}

/*
 * A "which type?" chip opens its Know Your Type card while that chapter is on
 * the engine. Before then it opens the path page of the same type, if there
 * is one (./chapters/paths-meta.ts), and a chip with neither is left off.
 */
function chipHref(chip: (typeof TYPE_CHIPS)[number], locale: string) {
  if (isEngineChapter(DIABETES_SITE, TYPE_CHIPS_CHAPTER)) {
    return chapterPlace(DIABETES_SITE, locale, TYPE_CHIPS_CHAPTER, `card-${chip.card}`);
  }

  if (chip.path && PATH_META.some((meta) => meta.slug === chip.path)) {
    return localeHref(chapterHref(DIABETES_SITE, chip.path), locale);
  }

  return null;
}

export default async function Page({ params }: Props) {
  const { locale } = await params;

  setRequestLocale(locale);

  const [catalog, shop, messages] = await Promise.all([
    getDcCatalog(locale),
    getDiabetesShopCatalog(locale, 'featured'),
    getMessages({ locale }),
  ]);

  /*
   * Kits where the owner has listed them (dc-ids.ts): all twelve, verified
   * on 2026-10-07. Insulin and glucagon join this page's preview, in their
   * own room and each with the pharmacist-review notice, once operations has
   * confirmed the review (`insulinReviewConfirmed`, landing-meta.ts). Never on /fr: insulin may not
   * be advertised to Quebec (B11), so the French preview leaves out the room
   * and its products. The full shop still lists them.
   */
  const insulinShown = LANDING_GATES.insulinReviewConfirmed && locale !== 'fr';
  const kits = catalog.kits.filter((kit) => isListedDiabetesKit(kit.entityId));
  /*
   * A product whose description names or phones another retailer is never
   * linked from here (`refused`, ./get-dc-catalog.ts), as on the chapters'
   * shelves (full-site review, 2026-10-06: Toujeo, Tresiba and Baqsimi).
   */
  const products = catalog.products
    .filter((product) => !product.refused)
    .filter((product) => insulinShown || !(product.isInsulin || product.isGlucagon))
    .map(({ isInsulin, isGlucagon, ...product }) => ({
      ...product,
      ...(isInsulin || isGlucagon ? { reviewNotice: true } : {}),
    }));

  /*
   * One pill per shopping brand that has something on the shelf today, each
   * opening the Diabetes Essentials shop filtered to it (owner note 10,
   * 2026-10-07). Read from the shop's own loader, the whole category with
   * insulin already left out on /fr, so a pill never opens an empty shelf.
   */
  const stocked = new Set(shop.products.flatMap((product) => product.brand?.slug ?? []));
  const brands = BRANDS.filter((brand) => stocked.has(brand.slug)).map(
    (brand): LandingBrand => ({
      name: brand.name,
      ...(brand.logo ? { logo: brand.logo } : {}),
      ...(brand.logoFit ? { logoFit: brand.logoFit } : {}),
      href: localeHref(`${SHOP_DIABETES_HREF}?brand=${brand.slug}`, locale),
    }),
  );

  const chips = TYPE_CHIPS.flatMap((chip): LandingChip[] => {
    const href = chipHref(chip, locale);

    return href ? [{ id: chip.id, href }] : [];
  });
  const typesSources = chips.length ? landingCitations(DC_REGISTER, TYPES_SOURCES, locale) : [];

  const facts = FACT_BAND.map((fact, index) => ({
    key: String(index + 1),
    sources: landingCitations(DC_REGISTER, fact.sources, locale),
  }));

  /*
   * A question whose answer waits on a switch is left out whole, never shown
   * without it; so is one that is not for this locale (the insulin question
   * on /fr).
   */
  const faqs = FAQ_META.flatMap((faq, index): LandingFaq[] =>
    (faq.gate && !LANDING_GATES[faq.gate]) ||
    (faq.locales && !faq.locales.some((only) => only === locale))
      ? []
      : [
          {
            key: String(index + 1),
            sources: landingCitations(DC_REGISTER, faq.sources, locale),
            links: (faq.links ?? []).map((to) => linkHref(to, locale)),
          },
        ],
  );

  const setup: LandingSetup = {
    rootId: 'diabetes-care',
    classPrefix: 'dc-',
    images: {
      heroPoster: `${IMG}/hero.png`,
      heroVideo: `${IMG}/diabetes-care.mp4`,
      care: `${IMG}/care-chat-main.png`,
      closing: `${IMG}/closing.png`,
    },
    shopHref: localeHref(SHOP_DIABETES_HREF, locale),
    shopAnchor: SHOP_ANCHOR,
    chatHref: localeHref(PHARMACIST_CHAT_HREF, locale),
    cdeRequestHref: LANDING_GATES.cdeRequestReason
      ? localeHref(PHARMACIST_CDE_REQUEST_HREF, locale)
      : null,
    subscribeDemoPath: 'liivv.ca/product/diabetes-essentials',
    trustKeys: TRUST_ITEMS.flatMap((item, index) =>
      item.gate && !LANDING_GATES[item.gate] ? [] : [String(index + 1)],
    ),
    chips,
    typesSources,
    facts,
    chapters: landingChapters(DIABETES_SITE, messages, locale),
    shopRooms: SHOP_ROOMS.filter((room) => room !== 'insulin' || insulinShown),
    products,
    kits,
    featuredKitId:
      kits.find((kit) => kit.entityId === catalog.featuredKit?.entityId)?.entityId ??
      kits[0]?.entityId ??
      null,
    brands,
    faqs,
    pageSources: uniqueCitations([
      typesSources,
      ...facts.map((fact) => fact.sources),
      ...faqs.map((faq) => faq.sources),
    ]),
    frDraft: showsFrDraftMarker('landing', locale),
  };

  /*
   * The doors are rendered here, on the server, and handed to the client page
   * as a slot, as on Ostomy (C13): the links must not cost the landing a byte
   * of client JavaScript. They took the place of the guest quiz.
   */
  return (
    <DiabetesCarePage
      doors={
        <SituationDoors
          classPrefix="dc-"
          doors={SITUATION_DOORS}
          fundingHref={LANDING_GATES.fundingPage ? `${PATH}/funding` : null}
          id={DOORS_ANCHOR}
          locale={locale}
          site={DIABETES_SITE}
          urgentExitChapter={URGENT_EXIT_CHAPTER}
        />
      }
      setup={setup}
    />
  );
}
