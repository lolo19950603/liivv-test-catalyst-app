/*
 * =============================================================================
 * MICROSITE SOURCES — A SITE'S REGISTER, RESOLVED FOR A PAGE
 * =============================================================================
 * Owner note 1 (2026-10-07): the source is shown in the element, not named in
 * the prose. Every card, path intro, landing fact and FAQ answer carries a
 * small Sources disclosure (./_components/source-chip.tsx) naming the
 * publishers that back it, and the foot of each page lists them all, grouped
 * Canadian, international, then makers.
 *
 * This file turns a site's register ids into what those lists draw: a title
 * and a link in the page locale, the publisher's name in the page language
 * where the publisher prints one, the year, and the group. It is called on
 * the server, by a site's routes, so a page is sent only the entries it
 * names, already resolved; the client components only look them up by id.
 *
 * An entry marked `display: 'reviewOnly'` never resolves, so it can reach no
 * page in either locale. Two ids that open the same page are one entry.
 *
 * Plain functions with no client or server dependency, like ./chapters/hrefs.
 * No Ostomy twin: Ostomy's pages do not show per-card sources yet (Phase 2).
 * =============================================================================
 */

export type SourceScope = 'canadian' | 'international' | 'industry';

/* What a site's register (its sources-meta.ts) holds for one entry, as far as a page needs it. */
export interface RegisterEntry {
  label: string;
  labelFr?: string;
  href: string;
  hrefFr?: string;
  hrefLang: 'en' | 'fr';
  publisher: string;
  year?: number;
  scope?: SourceScope;
  display?: 'reviewOnly';
}

export interface PublisherEntry {
  name: string;
  nameFr?: string;
  /* The language `name` is in, where it is French already (Diabète Québec). */
  lang?: 'en' | 'fr';
  scope: SourceScope;
}

export interface SiteRegister {
  entries: Readonly<Record<string, RegisterEntry>>;
  publishers: Readonly<Record<string, PublisherEntry>>;
}

/* One source as a page draws it, in the page locale. */
export interface ResolvedSource {
  id: string;
  /** The published title: the French one on /fr where the publisher issues one. */
  title: string;
  titleLang: 'en' | 'fr';
  href: string;
  /** The language of the page `href` opens. */
  hrefLang: 'en' | 'fr';
  publisher: string;
  publisherLang: 'en' | 'fr';
  year?: number;
  scope: SourceScope;
}

const SCOPE_ORDER: readonly SourceScope[] = ['canadian', 'international', 'industry'];

/*
 * One register entry in the page locale, or nothing for an unknown id or one
 * kept for the review only.
 */
export function resolveSource(
  register: SiteRegister,
  id: string,
  locale: string,
): ResolvedSource | undefined {
  const entry = register.entries[id];

  if (!entry || entry.display === 'reviewOnly') return undefined;

  const publisher = register.publishers[entry.publisher];

  if (!publisher) return undefined;

  const french = locale === 'fr';
  const frenchPage = french && entry.hrefFr !== undefined;
  const frenchTitle = french && entry.labelFr !== undefined;
  const frenchName = french && publisher.nameFr !== undefined;

  return {
    id,
    title: frenchTitle && entry.labelFr ? entry.labelFr : entry.label,
    /* A title is in the language of the page it names, unless it is the French title. */
    titleLang: frenchTitle ? 'fr' : entry.hrefLang,
    href: frenchPage && entry.hrefFr ? entry.hrefFr : entry.href,
    hrefLang: frenchPage ? 'fr' : entry.hrefLang,
    publisher: frenchName && publisher.nameFr ? publisher.nameFr : publisher.name,
    publisherLang: frenchName ? 'fr' : (publisher.lang ?? 'en'),
    ...(entry.year === undefined ? {} : { year: entry.year }),
    scope: entry.scope ?? publisher.scope,
  };
}

/* Several ids, once each by the page they open, in the order first named. */
export function resolveSources(
  register: SiteRegister,
  ids: readonly string[],
  locale: string,
): ResolvedSource[] {
  const seen = new Set<string>();

  return ids.flatMap((id) => {
    const source = resolveSource(register, id, locale);

    if (!source || seen.has(source.href)) return [];

    seen.add(source.href);

    return [source];
  });
}

/* The same, keyed by id, for a client page that looks its entries up. */
export function resolveSourceMap(
  register: SiteRegister,
  ids: readonly string[],
  locale: string,
): Record<string, ResolvedSource> {
  return Object.fromEntries(
    [...new Set(ids)].flatMap((id) => {
      const source = resolveSource(register, id, locale);

      return source ? [[id, source]] : [];
    }),
  );
}

/* Canadian first, then international, then makers; the order within each group is kept. */
export function byScope(sources: readonly ResolvedSource[]): ResolvedSource[] {
  return SCOPE_ORDER.flatMap((scope) => sources.filter((source) => source.scope === scope));
}

/* The groups of a "Where this comes from" list, empty ones left out. */
export function groupByScope(
  sources: readonly ResolvedSource[],
): Array<{ scope: SourceScope; sources: ResolvedSource[] }> {
  return SCOPE_ORDER.flatMap((scope) => {
    const inScope = sources.filter((source) => source.scope === scope);

    return inScope.length ? [{ scope, sources: inScope }] : [];
  });
}

/* Ids, once each by the page they open, from a map a page was given. Unknown ids are dropped. */
export function lookUpSources(
  map: Readonly<Record<string, ResolvedSource>>,
  ids: readonly string[],
): ResolvedSource[] {
  const seen = new Set<string>();

  return ids.flatMap((id) => {
    const source = map[id];

    if (!source || seen.has(source.href)) return [];

    seen.add(source.href);

    return [source];
  });
}

/*
 * Every register id named anywhere in a structure: the values of every
 * `sources` array (and of the other keys asked for), at any depth. Used for a
 * card's figures, which keep their sources wherever their own shape puts them.
 */
export function collectSourceIds(node: unknown, keys: readonly string[] = ['sources']): string[] {
  const found: string[] = [];

  const walk = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach(walk);

      return;
    }

    if (value === null || typeof value !== 'object') return;

    Object.entries(value).forEach(([key, child]) => {
      if (keys.includes(key) && Array.isArray(child)) {
        child.forEach((id) => {
          if (typeof id === 'string') found.push(id);
        });

        return;
      }

      walk(child);
    });
  };

  walk(node);

  return found;
}
