'use client';

/*
 * A Diabetes Care chapter on the shared engine.
 *
 * The site config and its figure registry are imported here, on the client
 * side, and handed to SiteProvider, so neither is serialised into the page's
 * payload; the server route passes only the slug and the catalogue's answer
 * for the products this chapter's cards place (./chapter-shop.ts), which
 * ShopProvider hands to each card's shop band with this site's own add
 * action. With placements switched off the route passes none, the provider
 * is left out, and no card places anything. It also passes the register
 * entries the chapter names, resolved for the page locale (./dc-register.ts),
 * which each card's Sources disclosure and the foot list look up (owner
 * note 1, 2026-10-07).
 * See ../../_microsite/site-context.tsx and ../../_microsite/shop.
 *
 * The engine's stylesheet is Ostomy's chapter-page.css, which the engine
 * imports itself. This site's own rules come after it, and every one is
 * scoped under #oc-chapter[data-site='diabetes-care'], so none can reach an
 * Ostomy page.
 */

import { ChapterPage } from '../../_microsite/chapters/chapter-page';
import { ShopProvider } from '../../_microsite/shop/shop-context';
import type { PlacementItems } from '../../_microsite/shop/types';
import { SiteProvider } from '../../_microsite/site-context';
import type { ResolvedSource } from '../../_microsite/sources';

import { addDiabetesPlacementToCart } from './_actions/add-placement';
import { DIABETES_SITE } from './site';
import { DC_FIGURES } from './site-figures';

import './dc-figures.css';

export function DcChapterPage({
  slug,
  items,
  sources,
}: {
  slug: string;
  items?: PlacementItems;
  sources: Readonly<Record<string, ResolvedSource>>;
}) {
  const page = <ChapterPage slug={slug} />;

  return (
    <SiteProvider figures={DC_FIGURES} sources={sources} value={DIABETES_SITE}>
      {items ? (
        <ShopProvider add={addDiabetesPlacementToCart} chapter={slug} items={items}>
          {page}
        </ShopProvider>
      ) : (
        page
      )}
    </SiteProvider>
  );
}
