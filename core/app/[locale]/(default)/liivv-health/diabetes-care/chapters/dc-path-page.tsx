'use client';

/*
 * A Diabetes Care path page on the shared engine (../../_microsite/paths).
 *
 * The site config, the path structure and the copy are read here, on the
 * client side, as the chapters' wrapper reads them, so none of it is
 * serialised into the page's payload twice: the server route passes only the
 * slug, the register links it resolved for the page locale, the two hrefs
 * whose release it decides, and the path's shop strip with the catalogue's
 * answer for its products (PATH_SHELVES in ./chapter-shop.ts; never on
 * prediabetes), which ShopProvider hands to the strip with this site's own
 * add action. The engine's stylesheet is Ostomy's chapter
 * stylesheet plus the path page's own; this site's chapter rules
 * (./dc-figures.css) are scoped to its chapters and are not needed here.
 */

import { useLocale, useMessages } from 'next-intl';

import { type Citation, siteChapterMessages } from '../../_microsite/chapters/compose';
import { composePath } from '../../_microsite/paths/compose';
import { PathPage } from '../../_microsite/paths/path-page';
import type { PathWords } from '../../_microsite/paths/types';
import type { CardShelf } from '../../_microsite/shop/shelves';
import { ShopProvider } from '../../_microsite/shop/shop-context';
import type { PlacementItems } from '../../_microsite/shop/types';
import { SiteProvider } from '../../_microsite/site-context';

import { addDiabetesPlacementToCart } from './_actions/add-placement';
import { PATH_DISCLAIMER_CHAPTER, PATH_META, PATH_PHARMACIST_IMAGE } from './paths-meta';
import { showsFrDraftMarker } from './review-gates';
import { DIABETES_SITE } from './site';

export function DcPathPage({
  slug,
  citations,
  fundingHref,
  pharmacistBand,
  pharmacistHref,
  shop,
}: {
  slug: string;
  /* Every source the page names, once each, in the page locale. */
  citations: Citation[];
  /* Already in the page locale, or null while the funding page does not exist. */
  fundingHref: string | null;
  /* Whether the pharmacist band renders on this path (its hold lifted, ./paths-meta.ts). */
  pharmacistBand: boolean;
  /* The band's "Request a call", in the page locale, or null while that button is held. */
  pharmacistHref: string | null;
  /* The path's shop strip and its products, or null for none (prediabetes, or placements off). */
  shop: { shelf: CardShelf; items: PlacementItems } | null;
}) {
  const locale = useLocale();
  const messages = useMessages().DiabetesCare;
  const words: Readonly<Record<string, PathWords | undefined>> = messages.paths;
  const path = composePath({
    site: DIABETES_SITE,
    metas: PATH_META,
    slug,
    words,
    chapters: siteChapterMessages(messages),
    locale,
    idPrefix: DIABETES_SITE.idPrefix,
  });

  // The route already 404s on an unknown slug; this guards a path missing from the messages.
  if (!path) return null;

  /*
   * The band's words are sent to the browser only once its hold is lifted
   * (`heldPathPaths` in ./paths-meta.ts), so they are read only when the route
   * has released it. It shows the CDE contact (DIABETES_SITE.contact); its
   * "Request a call" waits on its own switch.
   */
  const band = pharmacistBand ? words[path.slug]?.pharmacist : undefined;

  const page = (
    <PathPage
      citations={citations}
      disclaimer={messages.chapters[PATH_DISCLAIMER_CHAPTER].governance.disclaimer}
      frDraft={showsFrDraftMarker('paths', locale)}
      fundingHref={fundingHref}
      path={path}
      pharmacist={band ? { ...band, href: pharmacistHref, image: PATH_PHARMACIST_IMAGE } : null}
      shelf={shop?.shelf ?? null}
    />
  );

  return (
    <SiteProvider value={DIABETES_SITE}>
      {shop ? (
        <ShopProvider add={addDiabetesPlacementToCart} items={shop.items}>
          {page}
        </ShopProvider>
      ) : (
        page
      )}
    </SiteProvider>
  );
}
