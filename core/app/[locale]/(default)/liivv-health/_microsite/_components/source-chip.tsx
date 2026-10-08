'use client';

/*
 * =============================================================================
 * SOURCES, SHOWN IN THE ELEMENT THEY BACK
 * =============================================================================
 * Owner note 1 (2026-10-07): the copy states the fact, and the element names
 * who backs it. One component for every element that states facts: the foot
 * of each chapter card, the path intro, and the landing's facts, type chips
 * and answers. Closed, it is one line that names up to three publishers
 * ("Sources: Diabetes Canada, Percée DT1 +2"); open, it lists each source as
 * "Title, Publisher (year)", linked, with "(en anglais)" inside the link text
 * where the page it opens is in the other language (OutboundLabel), and every
 * English title or name on /fr marked as English.
 *
 * The summary line is the pickers' own source line (`ui.chapter.sources.line`
 * is the same message as `ui.sensorPicker.sources`, French spacing included),
 * so a card shows one style of "Sources", not two.
 *
 * The entries arrive resolved (../sources.ts): an entry kept for the review
 * only never reaches here. A closed disclosure does not print, so a plain-text
 * line under it does, with no addresses.
 *
 * Governance furniture, like the landing's source lines and the foot list: it
 * is never behind a French review gate, because sources are facts and must
 * show on /fr too (review-gates.ts). No Ostomy twin yet (Phase 2).
 * =============================================================================
 */

import { useLocale } from 'next-intl';
import type { ReactNode } from 'react';

import type { CategoryCard } from '../chapters/compose';
import { OutboundLabel } from '../chapters/figure-parts';
import { useSiteSources, useSiteT } from '../site-context';
import { byScope, lookUpSources, type ResolvedSource } from '../sources';

import './source-chip.css';

/* How many publishers the closed line names before "+N". */
const NAMED = 3;

/* The `lang` attribute a part needs: only where it differs from the page. */
const langOf = (lang: 'en' | 'fr', locale: string) => (lang === locale ? undefined : lang);

/* "Title, Publisher (2023)", each part in its own language. */
export function SourceEntryText({ source }: { source: ResolvedSource }) {
  const locale = useLocale();

  return (
    <>
      <span lang={langOf(source.titleLang, locale)}>{source.title}</span>,{' '}
      <span lang={langOf(source.publisherLang, locale)}>{source.publisher}</span>
      {source.year === undefined ? null : ` (${source.year})`}
    </>
  );
}

/* One source as a link, in a new tab, with the language note inside the link text. */
export function SourceEntryLink({ source }: { source: ResolvedSource }) {
  const locale = useLocale();

  return (
    <a
      className="ms-src-link"
      href={source.href}
      hrefLang={langOf(source.hrefLang, locale)}
      rel="noopener noreferrer"
      target="_blank"
    >
      <OutboundLabel hrefLang={source.hrefLang} label={<SourceEntryText source={source} />} />
    </a>
  );
}

/* The distinct publishers, in list order, each once. */
function publishersOf(sources: readonly ResolvedSource[]) {
  const seen = new Set<string>();

  return sources.flatMap((source) => {
    if (seen.has(source.publisher)) return [];

    seen.add(source.publisher);

    return [{ name: source.publisher, lang: source.publisherLang }];
  });
}

/*
 * The closed line: the shared ICU message with the publishers set into it as
 * marked-up names. The message is filled with a marker and split on it, so
 * the words around the names stay the message's own in either language.
 */
function useSummary(sources: readonly ResolvedSource[]): ReactNode {
  const t = useSiteT('ui.chapter.sources');
  const locale = useLocale();
  const publishers = publishersOf(sources);
  const named = publishers.slice(0, NAMED);
  const more = publishers.length - named.length;
  const marker = '⁣';
  const [before = '', after = ''] = t('line', { count: sources.length, titles: marker }).split(
    marker,
  );

  return (
    <>
      {before}
      {named.map((publisher, index) => (
        <span key={publisher.name}>
          {index > 0 ? ', ' : null}
          <span lang={langOf(publisher.lang, locale)}>{publisher.name}</span>
        </span>
      ))}
      {more > 0 ? ` ${t('more', { count: String(more) })}` : null}
      {after}
    </>
  );
}

/*
 * The disclosure. `label` names what it belongs to (a card's title), for
 * screen readers, so the many Sources lines on a page do not all read alike.
 * Nothing renders for no sources.
 */
export function SourceChip({
  sources,
  label,
  className,
}: {
  sources: readonly ResolvedSource[];
  label?: string;
  className?: string;
}) {
  const ordered = byScope(sources);
  const summary = useSummary(ordered);
  const t = useSiteT('ui.chapter.sources');

  if (!ordered.length) return null;

  return (
    <div className={className ? `ms-src ${className}` : 'ms-src'}>
      <details className="ms-src-disclosure">
        <summary>
          <span className="ms-src-summary">
            {summary}
            {label ? <span className="sr-only"> — {label}</span> : null}
          </span>
        </summary>
        <ul>
          {ordered.map((source) => (
            <li key={source.href}>
              <SourceEntryLink source={source} />
            </li>
          ))}
        </ul>
      </details>
      <p aria-hidden className="ms-src-print">
        {t('line', {
          count: ordered.length,
          titles: ordered
            .map(
              (source) =>
                `${source.title}, ${source.publisher}${source.year === undefined ? '' : ` (${source.year})`}`,
            )
            .join('; '),
        })}
      </p>
    </div>
  );
}

/*
 * A chapter card's own disclosure, at its foot and outside its collapsible
 * part, so a collapsed card still names its sources. Nothing where the route
 * handed down no register (a site that does not show card sources yet).
 */
export function CardSources({ card }: { card: CategoryCard }) {
  const map = useSiteSources();

  if (!map || !card.sourceIds) return null;

  return (
    <SourceChip
      className="ms-src-card"
      label={card.title}
      sources={lookUpSources(map, card.sourceIds)}
    />
  );
}

/*
 * "Where this comes from": every source a page names, grouped Canadian,
 * international, then makers, each group under its own small heading. The
 * same entries, in the same "Title, Publisher (year)" form, as the chips.
 */
export function SourceGroups({
  groups,
  headingLevel = 3,
  showNote = true,
}: {
  groups: ReadonlyArray<{ scope: ResolvedSource['scope']; sources: ResolvedSource[] }>;
  headingLevel?: 3 | 4;
  /* The landing says it already, in its own governance block (`sourcesNote`). */
  showNote?: boolean;
}) {
  const t = useSiteT('ui.chapter.sources');
  const Heading = headingLevel === 3 ? 'h3' : 'h4';

  return (
    <div className="ms-src-groups">
      {groups.map((group) => (
        <section key={group.scope}>
          <Heading>{t(group.scope)}</Heading>
          <ul>
            {group.sources.map((source) => (
              <li key={source.href}>
                <SourceEntryLink source={source} />
              </li>
            ))}
          </ul>
        </section>
      ))}
      {showNote ? <p className="ms-src-note">{t('note')}</p> : null}
    </div>
  );
}
