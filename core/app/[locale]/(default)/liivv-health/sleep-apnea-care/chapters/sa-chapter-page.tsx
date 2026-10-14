'use client';

/*
 * A Sleep Apnea Care chapter on the shared engine.
 *
 * The site config and its figure registry are imported here, on the client
 * side, and handed to SiteProvider, so neither is serialised into the page's
 * payload; the server route passes only the slug, the register entries the
 * chapter names (resolved for the page locale, ./sa-register.ts) and, once
 * placements are switched on, the catalogue's answer for the products its
 * cards place (./chapter-shop.ts). Placements are off, so the route passes
 * none and the ShopProvider is left out.
 *
 * The engine's stylesheet is Ostomy's chapter-page.css, which the engine
 * imports itself. This site's own rules come after it, and every one is
 * scoped under #oc-chapter[data-site='sleep-apnea-care'], so none can reach
 * an Ostomy or Diabetes page.
 */

import { ChapterPage } from '../../_microsite/chapters/chapter-page';
import { ShopProvider } from '../../_microsite/shop/shop-context';
import type { PlacementItems } from '../../_microsite/shop/types';
import { SiteProvider } from '../../_microsite/site-context';
import type { ResolvedSource } from '../../_microsite/sources';

import { addSleepPlacementToCart } from './_actions/add-placement';
import { SLEEP_SITE } from './site';
import { SA_FIGURES } from './site-figures';

import './sa-figures.css';

export function SaChapterPage({
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
    <SiteProvider figures={SA_FIGURES} sources={sources} value={SLEEP_SITE}>
      {items ? (
        <ShopProvider add={addSleepPlacementToCart} chapter={slug} items={items}>
          {page}
        </ShopProvider>
      ) : (
        page
      )}
    </SiteProvider>
  );
}
