/*
 * =============================================================================
 * WHICH PRODUCTS ARE HEALTH-REVEALING
 * =============================================================================
 * One answer, used by every analytics emitter: does naming this product tell
 * an outside party something about a person's body?
 *
 * A pouch, a barrier or a stoma powder does. Sending "SenSura 1-Piece Drainable
 * Opaque" to an advertising and measurement platform is sending a health fact
 * about the person who viewed it, whatever the page around it says. The OPC's
 * meaningful-consent guidance treats health information as sensitive and
 * usually needing express consent; its policy position on online behavioural
 * advertising says to keep health data out of it; and PIPEDA Report of
 * Findings #2014-001 found that ads based on sensitive health browsing
 * required express consent. Nobody has given that consent here.
 *
 * Two ways a product qualifies:
 *
 *   by shelf    it sits in one of the ostomy categories (OSTOMY_ANALYTICS_
 *               CATEGORY_IDS in oc-ids.ts) — the general rule.
 *   by id       it is a curated ostomy kit, or a product the ostomy supply
 *               list may add to a cart. These are named on ostomy surfaces, so
 *               they are covered even where categories are not known at event
 *               time (a cart line item carries no categories at all).
 *
 * Kits are matched against OSTOMY_KIT_IDS, every curated ostomy kit, rather
 * than the listed/withheld split: whether Liivv may *show* a kit is a
 * merchandising question, and it has nothing to do with what naming one
 * reveals. All eight are ostomy kits.
 *
 * This file is imported by client components, so it holds no fetching and no
 * server-only code. The catalogue lookup that answers "which categories is
 * this product in?" lives in get-sensitive-product-ids.ts.
 * =============================================================================
 */

import { SUPPLY_CART_ALLOWLIST } from '~/app/[locale]/(default)/liivv-health/ostomy-care/chapters/supply-list-merchandising';
import {
  isOstomyCategoryIds,
  OSTOMY_KIT_IDS,
} from '~/app/[locale]/(default)/liivv-health/ostomy-care/oc-ids';

export interface SensitiveProductInput {
  /** The product's entity id, where the emitter knows it. */
  entityId?: number | null;
  /** Every category the product is in, where the emitter knows them. */
  categoryIds?: readonly number[] | null;
}

/*
 * Every category id a shelf's answer may come from: its own, plus each
 * ancestor on its breadcrumb trail.
 *
 * Sensitivity follows the catalogue tree rather than a hand-kept list of
 * leaves. A shelf added under 1035 "Ostomy Care" tomorrow — "Irrigation
 * Supplies", say — is then covered the day it appears, without anyone
 * remembering to edit oc-ids.ts, and a shelf moved out of that branch stops
 * being covered by the same rule. The breadcrumb trail is already fetched by
 * the category query for the crumbs on screen, so this costs no request.
 */
export function categoryLineageIds(
  entityId: number,
  breadcrumbs: ReadonlyArray<{ entityId?: number | null }>,
): number[] {
  const ancestors = breadcrumbs.flatMap((crumb) =>
    typeof crumb.entityId === 'number' ? [crumb.entityId] : [],
  );

  return [entityId, ...ancestors];
}

/* Product ids that are health-revealing whatever categories they are in. */
export function isSensitiveProductId(entityId: number): boolean {
  return OSTOMY_KIT_IDS.includes(entityId) || SUPPLY_CART_ALLOWLIST.has(entityId);
}

/*
 * Whether an analytics event may name this product.
 *
 * Both inputs are optional and a missing one simply cannot match. An emitter
 * that knows neither gets `false`, so a caller must not read a `false` as
 * proof that a product is safe to name — it may only mean nothing was looked
 * up. Every emitter in this repo supplies at least one of the two.
 */
export function isSensitiveProduct({ entityId, categoryIds }: SensitiveProductInput): boolean {
  if (typeof entityId === 'number' && isSensitiveProductId(entityId)) {
    return true;
  }

  return categoryIds != null && isOstomyCategoryIds(categoryIds);
}
