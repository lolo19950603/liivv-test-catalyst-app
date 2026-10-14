'use client';

/*
 * A Sleep Apnea Care path page on the shared engine (../../_microsite/paths).
 *
 * The site config, the path structure and the copy are read here, on the
 * client side, as the chapters' wrapper reads them, so none of it is
 * serialised into the page's payload twice: the server route passes only the
 * slug, the register entries it resolved for the page locale (the intro's,
 * shown under the intro; each entry's and the funding door's, shown on them;
 * the whole page's, for the foot list), the funding page's href once that
 * page is served, and the path's shop strip with the catalogue's answer for
 * its products (PATH_SHELVES in ./chapter-shop.ts; none while placements are
 * off, and never on oral-appliance, children or not-diagnosed-yet).
 *
 * The support band (the engine's `pharmacist` slot; Liivv's sleep support
 * team) is never drawn: its words are not in the message files until Part C
 * opens (PATH_GATES.sleepSupportBand in ./paths-meta.ts).
 *
 * The children path's entry for This Might Be You card 3 stays in the meta,
 * so its reasons pair with their entries by number; the engine leaves it out
 * while the card is held (`childTreatmentRuling`), and its reason is not sent.
 */

import { useLocale, useMessages } from 'next-intl';

import { siteChapterMessages } from '../../_microsite/chapters/compose';
import { composePath } from '../../_microsite/paths/compose';
import { PathPage } from '../../_microsite/paths/path-page';
import type { PathWords } from '../../_microsite/paths/types';
import type { CardShelf } from '../../_microsite/shop/shelves';
import { ShopProvider } from '../../_microsite/shop/shop-context';
import type { PlacementItems } from '../../_microsite/shop/types';
import { SiteProvider } from '../../_microsite/site-context';
import type { ResolvedSource } from '../../_microsite/sources';

import { addSleepPlacementToCart } from './_actions/add-placement';
import { PATH_DISCLAIMER_CHAPTER, PATH_META } from './paths-meta';
import { showsFrDraftMarker } from './review-gates';
import { SLEEP_SITE } from './site';

export function SaPathPage({
  slug,
  sources,
  introSources,
  entrySources,
  fundingSources,
  fundingHref,
  shop,
}: {
  slug: string;
  /* Every source the page names, once each, resolved for the page locale. */
  sources: ResolvedSource[];
  /* The intro's sources, shown under it. */
  introSources: ResolvedSource[];
  /* The register entries the reading list names, by id, shown on each entry. */
  entrySources: Readonly<Record<string, ResolvedSource>>;
  /* The funding door's sources, shown on the door. */
  fundingSources: ResolvedSource[];
  /* Already in the page locale, or null while the funding page is not served. */
  fundingHref: string | null;
  /* The path's shop strip and its products, or null for none. */
  shop: { shelf: CardShelf; items: PlacementItems } | null;
}) {
  const locale = useLocale();
  const messages = useMessages().SleepApneaCare;
  const words: Readonly<Record<string, PathWords | undefined>> = messages.paths;
  const path = composePath({
    site: SLEEP_SITE,
    metas: PATH_META,
    slug,
    words,
    chapters: siteChapterMessages(messages),
    locale,
    idPrefix: SLEEP_SITE.idPrefix,
  });

  // The route already 404s on an unknown slug; this guards a path missing from the messages.
  if (!path) return null;

  const page = (
    <PathPage
      chips={{ entries: entrySources, funding: fundingSources }}
      disclaimer={messages.chapters[PATH_DISCLAIMER_CHAPTER].governance.disclaimer}
      frDraft={showsFrDraftMarker('paths', locale)}
      fundingHref={fundingHref}
      introSources={introSources}
      path={path}
      pharmacist={null}
      shelf={shop?.shelf ?? null}
      sources={sources}
    />
  );

  return (
    <SiteProvider value={SLEEP_SITE}>
      {shop ? (
        <ShopProvider add={addSleepPlacementToCart} items={shop.items}>
          {page}
        </ShopProvider>
      ) : (
        page
      )}
    </SiteProvider>
  );
}
