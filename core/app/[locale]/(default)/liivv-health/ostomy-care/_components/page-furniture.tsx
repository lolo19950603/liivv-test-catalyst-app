'use client';

/*
 * Shared furniture for Ostomy Care pages — the cross-vertical discovery band and
 * the clinical governance footer.
 *
 * Both the chapters and the funding section need these. They are extracted rather
 * than copied because this microsite pattern has already been duplicated three
 * times across verticals, and the copies have started to drift.
 *
 * These render inside a `#oc-chapter` root so they inherit the chapter palette,
 * spacing tokens, and `.rounded-top` behaviour from chapter-page.css.
 */

import { useLocale, useTranslations } from 'next-intl';

import { HEALTH_HUB_DOORS } from '../../health-hub-data';
import type { Citation, Governance } from '../chapters/chapters-data';

const OSTOMY_DOOR_ID = 'ostomy_care_everyday';

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

const NSWOC_DIRECTORY = 'https://www.nswoc.ca/';
const CHAPTER_FINDER = 'https://www.ostomycanada.ca/find-a-chapter-peer-support-group/';
const PHARMACIST_HREF = '/account/virtual-care';

/*
 * Persistent utility, on every page rather than buried in one chapter.
 *
 * Research put finding an NSWOC and finding a local group as the two things
 * people most often wish they had found sooner, and both were reachable only
 * from deep inside Everyday Liivving. Two of the three cards deliberately send
 * the reader somewhere that is not us.
 */
export function HelpBand() {
  const t = useTranslations('OstomyCare.ui.help');

  const cards = [
    {
      id: 'nswoc',
      title: t('nswocTitle'),
      org: t('nswocOrg'),
      body: t('nswocBody'),
      href: NSWOC_DIRECTORY,
      external: true,
    },
    {
      id: 'group',
      title: t('groupTitle'),
      org: t('groupOrg'),
      body: t('groupBody'),
      href: CHAPTER_FINDER,
      external: true,
    },
    {
      id: 'talk',
      title: t('talkTitle'),
      org: t('talkOrg'),
      body: t('talkBody'),
      href: PHARMACIST_HREF,
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
                href={c.href}
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
 * value, so this is the honest moment to mention Liivv covers more than one thing.
 */
export function DiscoveryBand() {
  const t = useTranslations('OstomyCare.ui.discovery');
  const others = HEALTH_HUB_DOORS.filter(
    (door) => door.status === 'live' && door.id !== OSTOMY_DOOR_ID && door.href,
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
            <a className="oc-ch-discover-card" href={door.href ?? undefined} key={door.id}>
              <span className="oc-ch-discover-title">{door.title}</span>
              <span className="oc-ch-discover-body">{door.body}</span>
            </a>
          ))}
          <a className="oc-ch-discover-card is-hub" href="/liivv-health">
            <span className="oc-ch-discover-title">{t('hubTitle')}</span>
            <span className="oc-ch-discover-body">{t('hubBody')}</span>
          </a>
        </div>
      </div>
    </section>
  );
}

export function GovernanceBlock({
  governance,
  citations,
}: {
  governance: Governance;
  citations?: Citation[];
}) {
  const t = useTranslations('OstomyCare.ui.governance');
  const locale = useLocale();

  /*
   * Three gates, all of which must pass before a clinical byline appears.
   *
   * 1. A named reviewer and a valid review date — an unreviewed page must never
   *    imply sign-off it has not had.
   * 2. The commercial disclosure. A review credit on a page published by a
   *    company that sells the products is a commercial relationship, so the
   *    credit and the disclosure ship together or not at all.
   * 3. English only. The reviewer reads the English; the French is machine
   *    translated. Carrying her name across to text she has not read would
   *    assert professional review of copy no reviewer has seen — the French
   *    pages say the English version was reviewed instead.
   */
  const reviewedOn = governance.reviewedOn ? formatReviewDate(governance.reviewedOn) : null;
  const hasReviewer = Boolean(governance.name) && Boolean(reviewedOn);
  const showByline = hasReviewer && Boolean(governance.disclosure) && locale === 'en';
  const showTranslatedNote = hasReviewer && Boolean(governance.disclosure) && locale !== 'en';

  const reviewerName = governance.credential
    ? `${governance.name}, ${governance.credential}`
    : governance.name;

  return (
    <section className="oc-ch-governance rounded-top">
      <div className="oc-ch-wrap">
        <div className="oc-ch-governance-inner">
          {showByline ? (
            <p className="oc-ch-review">
              {t('reviewedBy')}{' '}
              <strong>
                {governance.registryUrl ? (
                  <a href={governance.registryUrl} rel="noopener noreferrer" target="_blank">
                    {reviewerName}
                  </a>
                ) : (
                  reviewerName
                )}
              </strong>
              {governance.registration
                ? ` · ${t('registration', { number: governance.registration })}`
                : ''}{' '}
              · {t('lastReviewed', { date: reviewedOn ?? '' })}
            </p>
          ) : null}

          {showTranslatedNote ? (
            <p className="oc-ch-review">
              {t('reviewedEnglishOnly', { name: reviewerName, date: reviewedOn ?? '' })}
            </p>
          ) : null}

          {locale === 'en' ? null : <p className="oc-ch-machine">{t('machineTranslated')}</p>}

          {governance.disclosure ? (
            <p className="oc-ch-disclosure">{governance.disclosure}</p>
          ) : null}

          <p className="oc-ch-disclaimer">{governance.disclaimer}</p>

          {citations?.length ? (
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
          ) : null}
        </div>
      </div>
    </section>
  );
}
