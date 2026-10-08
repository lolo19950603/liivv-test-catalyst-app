/* Twin of ostomy-care/_components/page-furniture.tsx @3b343c6e — port fixes both ways until Phase 2 */

'use client';

/*
 * Shared furniture for a care site's pages — the help band, the cross-vertical
 * discovery band and the clinical governance footer.
 *
 * Ostomy's, with what was Ostomy's own read from the site: its door on the
 * health hub, its specialist directory and peer finder, its pharmacist link and
 * its `ui.help`, `ui.discovery` and `ui.governance` words.
 *
 * These render inside the `#oc-chapter` root so they inherit the chapter
 * palette, spacing tokens, and `.rounded-top` behaviour from the shared
 * chapter-page.css.
 */

import { useLocale } from 'next-intl';

import { HEALTH_HUB_DOORS } from '../../health-hub-data';
import { type Citation, type Governance } from '../chapters/compose';
import { localeHref } from '../chapters/hrefs';
import type { GovernancePerson } from '../site';
import { useSite, useSiteMessages, useSiteT } from '../site-context';
import { groupByScope, type ResolvedSource } from '../sources';

import { SourceGroups } from './source-chip';

function formatReviewDate(iso: string) {
  const parsed = new Date(`${iso}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

/*
 * Persistent utility, on every page rather than buried in one chapter.
 *
 * The specialist directory and a local group are the two things people most
 * often wish they had found sooner. Two of the three cards deliberately send
 * the reader somewhere that is not us. A site with no peer finder leaves that
 * card out rather than link nowhere.
 *
 * The directory card's words are under the site's own key in `ui.help` (an
 * NSWOC is not a diabetes educator), so they are read from the message object
 * by that key rather than through t().
 */
export function HelpBand() {
  const t = useSiteT('ui.help');
  const { furniture } = useSite();
  const help: Record<string, string> = useSiteMessages().ui.help;
  /* Plain <a>, so the /fr prefix has to be put on by hand — ../chapters/hrefs.ts.
   * A no-op on the outward links, which are absolute https:// URLs. */
  const locale = useLocale();
  const directory = furniture.directoryKey;

  const cards = [
    {
      id: directory,
      title: help[`${directory}Title`] ?? '',
      org: help[`${directory}Org`] ?? '',
      body: help[`${directory}Body`] ?? '',
      href: furniture.directoryHref,
      external: true,
    },
    ...(furniture.peerFinderHref
      ? [
          {
            id: 'group',
            title: t('groupTitle'),
            org: t('groupOrg'),
            body: t('groupBody'),
            href: furniture.peerFinderHref,
            external: true,
          },
        ]
      : []),
    {
      id: 'talk',
      title: t('talkTitle'),
      org: t('talkOrg'),
      body: t('talkBody'),
      href: furniture.pharmacistHref,
      external: false,
    },
  ];

  return (
    <section className="oc-ch-help rounded-top">
      <div className="oc-ch-wrap">
        <span className="oc-ch-eyebrow">{t('eyebrow')}</span>
        <h2>{t('heading')}</h2>
        <p className="oc-ch-help-lead">{t('lead')}</p>
        <ul className="oc-ch-help-grid">
          {cards.map((c) => (
            <li key={c.id}>
              <a
                className="oc-ch-help-card"
                href={localeHref(c.href, locale)}
                {...(c.external ? { rel: 'noopener noreferrer', target: '_blank' } : {})}
              >
                <span className="oc-ch-help-org">{c.org}</span>
                <span className="oc-ch-help-title">{c.title}</span>
                <span className="oc-ch-help-body">{c.body}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/*
 * The way out of the microsite. Someone who has read this far has already got
 * value, so this is the honest moment to mention Liivv covers more than one
 * thing. The site's own door is left out.
 */
export function DiscoveryBand() {
  const t = useSiteT('ui.discovery');
  const { furniture } = useSite();
  /* Plain <a> to other micro-sites and the hub — same rule as above. */
  const locale = useLocale();
  const others = HEALTH_HUB_DOORS.filter(
    (door) => door.status === 'live' && door.id !== furniture.hubDoorId && door.href,
  );

  if (!others.length) return null;

  return (
    <section className="oc-ch-discover rounded-top">
      <div className="oc-ch-wrap">
        <span className="oc-ch-eyebrow">{t('eyebrow')}</span>
        <h2>{t('heading')}</h2>
        <p className="oc-ch-discover-lead">{t('lead')}</p>
        <div className="oc-ch-discover-grid">
          {others.map((door) => (
            <a
              className="oc-ch-discover-card"
              href={door.href ? localeHref(door.href, locale) : undefined}
              key={door.id}
            >
              <span className="oc-ch-discover-title">{door.title}</span>
              <span className="oc-ch-discover-body">{door.body}</span>
            </a>
          ))}
          <a className="oc-ch-discover-card is-hub" href={localeHref('/liivv-health', locale)}>
            <span className="oc-ch-discover-title">{t('hubTitle')}</span>
            <span className="oc-ch-discover-body">{t('hubBody')}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

/*
 * Where this page comes from: the chapter's citations. Ostomy's version also
 * links back to its recovery map's per-stage sources; no engine page has a
 * recovery map, so that link is not here.
 */
function SourceList({ citations }: { citations: Citation[] }) {
  const t = useSiteT('ui.governance');

  return (
    <div className="oc-ch-sources">
      <h2>{t('sourcesHeading')}</h2>
      <ul>
        {citations.map((citation) => (
          <li key={citation.href}>
            <a href={citation.href} rel="noopener noreferrer" target="_blank">
              {citation.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

/*
 * =============================================================================
 * THE COMMERCIAL DISCLOSURE
 * =============================================================================
 * Liivv sells the products these pages are about, so every chapter page says
 * so, in the reader's own language. Two sentences where a clinical review
 * exists, one where it does not: the review sentence explains what clinical
 * review means, so it follows `hasReview`, exactly as the byline and the
 * schema do. The reasoning is at length in Ostomy's twin.
 *
 * What never varies is the commercial half: Liivv sells these products, and
 * nothing on the page is an endorsement or a recommendation to buy them.
 * =============================================================================
 */
function CommercialDisclosure({ reviewed }: { reviewed: boolean }) {
  const t = useSiteT('ui.governance.disclosure');

  return (
    <p className="oc-ch-disclosure">
      {t('sells')} {reviewed ? t('reviewMeaning') : t('notEndorsement')}
    </p>
  );
}

/*
 * Where this page comes from, as every source it names (owner note 1,
 * 2026-10-07): grouped Canadian, international, then makers, each as
 * "Title, Publisher (year)" with its language note, and the line that citing
 * a body is not its endorsement. Engine-only so far: Ostomy's twin lists its
 * citations.
 */
function SourceFootList({ sources }: { sources: ResolvedSource[] }) {
  const t = useSiteT('ui.governance');

  return (
    <div className="oc-ch-sources">
      <h2>{t('sourcesHeading')}</h2>
      <SourceGroups groups={groupByScope(sources)} />
    </div>
  );
}

/* The resolved foot list where the page has one, otherwise Ostomy's citations. */
function PageSources({
  sources,
  citations,
}: {
  sources?: ResolvedSource[];
  citations?: Citation[];
}) {
  if (sources) return sources.length ? <SourceFootList sources={sources} /> : null;

  return citations?.length ? <SourceList citations={citations} /> : null;
}

export function GovernanceBlock({
  governance,
  citations,
  sources,
}: {
  governance: Governance;
  citations?: Citation[];
  /* Every source the page names, resolved; drawn in place of `citations` where given. */
  sources?: ResolvedSource[];
}) {
  const t = useSiteT('ui.governance');
  const locale = useLocale();

  /*
   * Author and reviewer gate independently.
   *
   * A page can legitimately carry a written-by line while still awaiting
   * review, but it must never carry a review line it has not earned — so the
   * review line additionally requires a date.
   *
   * Both are English-only. The reviewer reads the English; the French is
   * machine translated, and carrying a name across to text nobody has read
   * would assert professional review of copy no reviewer has seen. French
   * pages say the English version was reviewed instead, and every French page
   * says it was translated automatically — the draft marker French prose ships
   * with.
   *
   * Neither renders without the commercial disclosure. A credit on a page
   * published by a company that sells the products is a commercial
   * relationship, so the credit and the disclosure ship together or not at all.
   */
  const reviewedOn = governance.reviewedOn ? formatReviewDate(governance.reviewedOn) : null;
  const disclosed = Boolean(governance.disclosure);
  const isEnglish = locale === 'en';

  const hasAuthor = Boolean(governance.author.name);
  const hasReview = Boolean(governance.reviewer.name) && Boolean(reviewedOn);

  const withCredential = (p: GovernancePerson) =>
    p.credential ? `${p.name}, ${p.credential}` : p.name;

  const authorName = withCredential(governance.author);
  const reviewerName = withCredential(governance.reviewer);

  const showAuthor = hasAuthor && disclosed && isEnglish;
  const showReview = hasReview && disclosed && isEnglish;
  const showTranslatedNote = (hasAuthor || hasReview) && disclosed && !isEnglish;

  const nameNode = (p: GovernancePerson, label: string) =>
    p.registryUrl ? (
      <a href={p.registryUrl} rel="noopener noreferrer" target="_blank">
        {label}
      </a>
    ) : (
      label
    );

  return (
    <section className="oc-ch-governance rounded-top">
      <div className="oc-ch-wrap">
        <div className="oc-ch-governance-inner">
          {showAuthor ? (
            <p className="oc-ch-review">
              {t('writtenBy')} <strong>{nameNode(governance.author, authorName)}</strong>
              {governance.author.registration
                ? ` · ${t('registration', { number: governance.author.registration })}`
                : ''}
            </p>
          ) : null}

          {showReview ? (
            <p className="oc-ch-review">
              {t('reviewedBy')} <strong>{nameNode(governance.reviewer, reviewerName)}</strong>
              {governance.reviewer.registration
                ? ` · ${t('registration', { number: governance.reviewer.registration })}`
                : ''}{' '}
              · {t('lastReviewed', { date: reviewedOn ?? '' })}
            </p>
          ) : null}

          {showTranslatedNote ? (
            <p className="oc-ch-review">
              {t('reviewedEnglishOnly', { name: hasReview ? reviewerName : authorName })}
            </p>
          ) : null}

          {locale === 'en' ? null : <p className="oc-ch-machine">{t('machineTranslated')}</p>}

          {disclosed ? <CommercialDisclosure reviewed={hasReview} /> : null}

          <p className="oc-ch-disclaimer">{governance.disclaimer}</p>

          <PageSources citations={citations} sources={sources} />
        </div>
      </div>
    </section>
  );
}
