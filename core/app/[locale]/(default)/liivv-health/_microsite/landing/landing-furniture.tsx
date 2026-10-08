'use client';

/*
 * The landing page's sourcing and governance furniture: the "Sources" line
 * under a fact or an answer, and the block at the foot of the page.
 *
 * The block follows the chapters' GovernanceBlock (../_components/
 * page-furniture.tsx) rule for rule — the byline and the review line gate
 * independently, both are English-only, neither renders without the
 * commercial disclosure, and every French page says it was translated
 * automatically — but it is drawn with the landing's own classes, because the
 * chapter stylesheet that styles that block is not loaded on a landing page.
 * It adds the landing's two notes: citing a body is not its endorsement, and
 * brand names are there to be found, not recommended.
 */

import { useLocale } from 'next-intl';

import { SourceEntryText, SourceGroups } from '../_components/source-chip';
import { OutboundLabel } from '../chapters/figure-parts';
import type { GovernancePerson } from '../site';
import { useSite, useSiteMessages, useSiteT } from '../site-context';
import { byScope, groupByScope } from '../sources';

import type { LandingCitation } from './types';

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
 * A source's link: "Title, Publisher (year)", saying inside the link text
 * when it opens a page in the other language, as every chapter link does.
 */
function SourceLink({ source }: { source: LandingCitation }) {
  const locale = useLocale();

  return (
    <a
      href={source.href}
      hrefLang={source.hrefLang === locale ? undefined : source.hrefLang}
      rel="noopener noreferrer"
      target="_blank"
    >
      <OutboundLabel hrefLang={source.hrefLang} label={<SourceEntryText source={source} />} />
    </a>
  );
}

/*
 * "Source: Title, Publisher (year)" (or "Sources: A; B") under a fact, the
 * type chips' intro or an answer, Canadian sources first. The same message as
 * the chapters' Sources line (`ui.chapter.sources.line`), so a single source
 * reads "Source". It stays open: the landing's facts are short, and the line
 * is the in-element source the owner asked for (note 1, 2026-10-07). Nothing
 * when there are none.
 */
export function SourceLine({
  sources,
  className,
}: {
  sources: LandingCitation[];
  className: string;
}) {
  const t = useSiteT('ui.chapter.sources');
  const ordered = byScope(sources);
  const marker = '⁣';
  const [before = '', after = ''] = t('line', { count: ordered.length, titles: marker }).split(
    marker,
  );

  if (!ordered.length) return null;

  return (
    <p className={className}>
      {before}
      {ordered.map((source, index) => (
        <span key={source.href}>
          {index > 0 ? '; ' : null}
          <SourceLink source={source} />
        </span>
      ))}
      {after}
    </p>
  );
}

/*
 * The written-by and reviewed-by lines, or the French note that stands in for
 * them. Author and reviewer gate independently, and the review line also
 * needs a date. Returns whether a review is credited, which the disclosure
 * sentence follows.
 */
function useByline() {
  const t = useSiteT('ui.governance');
  const { governance } = useSite();
  const locale = useLocale();

  const reviewedOn = governance.reviewedOn ? formatReviewDate(governance.reviewedOn) : null;
  const disclosed = governance.disclosure;
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

  const byline = (className: string) => (
    <>
      {showAuthor ? (
        <p className={className}>
          {t('writtenBy')} <strong>{nameNode(governance.author, authorName)}</strong>
          {governance.author.registration
            ? ` · ${t('registration', { number: governance.author.registration })}`
            : ''}
        </p>
      ) : null}

      {showReview ? (
        <p className={className}>
          {t('reviewedBy')} <strong>{nameNode(governance.reviewer, reviewerName)}</strong>
          {governance.reviewer.registration
            ? ` · ${t('registration', { number: governance.reviewer.registration })}`
            : ''}{' '}
          · {t('lastReviewed', { date: reviewedOn ?? '' })}
        </p>
      ) : null}

      {showTranslatedNote ? (
        <p className={className}>
          {t('reviewedEnglishOnly', { name: hasReview ? reviewerName : authorName })}
        </p>
      ) : null}
    </>
  );

  return { byline, hasReview, disclosed };
}

export function LandingGovernance({
  classPrefix,
  sources,
}: {
  classPrefix: string;
  sources: LandingCitation[];
}) {
  const k = (name: string) => `${classPrefix}${name}`;
  const t = useSiteT('ui.governance');
  const disclosure = useSiteT('ui.governance.disclosure');
  const landing = useSiteT('ui.landingPage.governance');
  /* Read through `in`: a site's landing without these words of its own has no such key. */
  const landingCopy = useSiteMessages().ui.landingPage;
  const relationship =
    'governance' in landingCopy && 'relationship' in landingCopy.governance
      ? landingCopy.governance.relationship
      : null;
  const locale = useLocale();
  const { byline, hasReview, disclosed } = useByline();

  return (
    <section
      aria-label={landing('label')}
      className={`${k('governance')} rounded-top`}
      id="governance"
    >
      <div className={k('wrap')}>
        <div className={k('governance-inner')}>
          {byline(k('governance-review'))}

          {locale === 'en' ? null : (
            <p className={k('governance-machine')}>{t('machineTranslated')}</p>
          )}

          {disclosed ? (
            <p className={k('governance-disclosure')}>
              {/* Who Liivv is part of, where the site words it (`relationship`). */}
              {relationship ? `${relationship} ` : null}
              {disclosure('sells')}{' '}
              {hasReview ? disclosure('reviewMeaning') : disclosure('notEndorsement')}
            </p>
          ) : null}

          <p>{landing('brandsNote')}</p>
          <p>{landing('sourcesNote')}</p>

          {sources.length ? (
            <div className={k('governance-sources')}>
              <h2>{t('sourcesHeading')}</h2>
              <SourceGroups groups={groupByScope(sources)} showNote={false} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
