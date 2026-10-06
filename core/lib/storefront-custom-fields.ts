import { KIT_TYPE_FIELD, KIT_VARIANTS_FIELD } from '~/lib/kit';

/*
 * =============================================================================
 * CUSTOM FIELDS A SHOPPER MUST NEVER SEE
 * =============================================================================
 * The product page's Specifications and the compare table print a product's
 * BigCommerce custom fields. Some are not specifications at all but notes the
 * catalogue keeps for itself, and one of them names the store a description
 * was imported from. Those stay off every storefront page, for every product.
 *
 * Read from the whole catalogue (1,624 products, admin API) and from the
 * storefront in English and French (1,412 visible products) on 2026-10-06.
 * A field's name can be translated, so the French storefront returns some
 * under another name. The names that exist: DIN and MPN, which are real
 * specifications, and the internal ones, hidden here:
 *
 *   COPY_SOURCE      the domain a product's copy was imported from (18
 *                    insulin products carry it)
 *   SOURCE_DE_COPIE  the same field as the French storefront names it (7 of
 *                    the 18 on /fr)
 *   kit_type         marks a curated kit
 *   kit_variants     a kit's component variant overrides (JSON)
 *
 * A field named like an import or source marker is hidden too, in case
 * another import adds one: copy_*, import_*, imported_*, scrape_*,
 * scraped_*, and source_url or *_source_url, in any case. (Not *_source on
 * its own: "Power source" is a specification.)
 *
 * And whatever its name, a field whose value names that other store, as
 * "diabetesexpress.ca" or as "Diabetes Express" (any case, with or without
 * the space), is hidden: that store is never named or linked on Liivv.
 * =============================================================================
 */

const INTERNAL_FIELD_NAMES: ReadonlySet<string> = new Set([
  KIT_TYPE_FIELD,
  KIT_VARIANTS_FIELD,
  'copy_source',
  'source_de_copie',
]);

const IMPORT_MARKER = /^(copy|import|imported|scrape|scraped)_|(^|_)source_url$/;

const NEVER_NAMED = /diabetes\s*express/i;

/* The name as the rules compare it: lowercase, words joined by underscores. */
function normalise(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/* Whether this custom field is the catalogue's own note rather than a specification. */
export function isInternalCustomField({ name, value }: { name: string; value: string }): boolean {
  const key = normalise(name);

  return INTERNAL_FIELD_NAMES.has(key) || IMPORT_MARKER.test(key) || NEVER_NAMED.test(value);
}
