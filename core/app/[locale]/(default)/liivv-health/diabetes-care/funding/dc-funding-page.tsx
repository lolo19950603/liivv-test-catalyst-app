'use client';

/*
 * =============================================================================
 * DIABETES CARE — FUNDING & COVERAGE
 * =============================================================================
 * The page at /liivv-health/diabetes-care/funding, in the order the verified
 * copy record sets (funding.md, A.2): the hero and the urgent signpost (the
 * engine's frame, ../../_microsite/funding/funding-page), how paying works,
 * the checker, the federal programs, what changed lately, Quebec and the
 * territories, when it isn't enough, moving provinces, the pharmacist CDE
 * band, then the closing and the furniture.
 *
 * How paying works follows the owner's answers of 2026-10-06 (A5, A6, B13):
 * the Liivv pharmacy in each province bills that province's drug plan
 * directly (DIRECT_BILLING, the nine plans by their official names; never
 * Quebec, whose plan does not pay for drugs bought outside Quebec, and no
 * federal program or private insurer); for programs that pay you back, an
 * invoice for the claim, with no promise that the claim is accepted; and
 * "Liivv Now, Pay Later" for insulin pump supplies (PAY_LATER), after
 * customer service checks eligibility. The page places no products: the
 * pump-supplies strip that sat between "How paying works" and the checker
 * (owner answer B21) was removed by the owner on 2026-10-07 (note 7); the
 * same strip stays on Your Tools card 13.
 *
 * French: the page's prose ships on /fr flagged as machine translated, as the
 * landing's does (gate `funding` decides the draft marker on previews). The
 * checker waits on its own gate, `fundingChecker`; while it is closed /fr
 * shows the plain list of each province's programs instead. The urgent
 * signpost and the federal programs are never behind a gate.
 *
 * The config is imported here, on the client side, and handed to
 * SiteProvider, so none of it is serialised into the page's payload; the
 * route passes only the register links it resolved for the page locale.
 * =============================================================================
 */

import { useLocale, useMessages, useTranslations } from 'next-intl';

import { SpecialistContact } from '../../_microsite/_components/specialist-contact';
import { chapterHref, localeHref } from '../../_microsite/chapters/hrefs';
import { PhoneList } from '../../_microsite/funding/checker-parts';
import { FundingPage, FundingRow, FundingSectionHead } from '../../_microsite/funding/funding-page';
import { SiteProvider } from '../../_microsite/site-context';
import type { ResolvedSource } from '../../_microsite/sources';
import { isFrGated, showsFrDraftMarker } from '../chapters/review-gates';
import { DIABETES_SITE } from '../chapters/site';
import { URGENT_EXIT_CHAPTER } from '../landing-meta';

import {
  FundingChecker,
  FundingProvinceList,
  type FundingSourceLinks,
  useProgramPhones,
} from './funding-checker';
import { programParagraphs, type ProgramWords } from './funding-data';
import {
  CHANGES_ORDER,
  DIRECT_BILLING,
  FEDERAL_ROWS,
  PAY_LATER,
  PROGRAM_META,
} from './funding-meta';

/* Placeholder until the Diabetes image set and palette are chosen, as on the chapters. */
const ACCENT = '#c9dcc0';
const IMG = '/archive/diabetes-care';

/* The numbered terms of "Liivv Now, Pay Later", in order (`ui.fundingPage.payLaterTerms`). */
const PAY_LATER_TERMS = ['1', '2', '3', '4', '5', '6'] as const;

function SourceLinks({ links }: { links: Array<FundingSourceLinks[string] | undefined> }) {
  const shown = links.filter((link) => link !== undefined);

  if (!shown.length) return null;

  return (
    <ul className="oc-fund-sources">
      {shown.map((link) => (
        <li key={link.href}>
          <a href={link.href} hrefLang={link.hrefLang} rel="noopener noreferrer" target="_blank">
            {link.label} ↗
          </a>
        </li>
      ))}
    </ul>
  );
}

/* One federal program: its own words, its official page, and when that page was checked. */
function FederalRow({
  index,
  programId,
  heading,
  note,
  extra,
  sources,
}: {
  index: number;
  programId: string;
  heading: string;
  note?: string;
  extra?: string;
  sources: FundingSourceLinks;
}) {
  const t = useTranslations('DiabetesCare.ui.fundingChecker');
  const programs: Record<string, ProgramWords | undefined> =
    useMessages().DiabetesCare.funding.programs;
  const phones = useProgramPhones();
  const meta = PROGRAM_META.find((program) => program.id === programId);

  if (!meta) return null;

  const link = sources[meta.sources[0]];
  const numbers = phones(meta);

  return (
    <FundingRow index={index}>
      <h3>{heading}</h3>
      {note ? <p className="oc-ch-row-note">{note}</p> : null}
      {programParagraphs(programs[meta.id]).map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {extra ? <p>{extra}</p> : null}
      {numbers.length ? <PhoneList label={t('phone.label')} phones={numbers} /> : null}
      {link ? (
        <a
          className="oc-fund-row-link"
          href={link.href}
          hrefLang={link.hrefLang}
          rel="noopener noreferrer"
          target="_blank"
        >
          {link.label} ↗
        </a>
      ) : null}
      <p className="oc-fund-row-meta">
        {t('verifiedOn', { date: meta.verifiedOn })}
        {meta.confirm ? ` ${t('confirm')}` : ''}
      </p>
    </FundingRow>
  );
}

function DcFundingSections({
  sources,
  cdeRequestHref,
}: {
  sources: FundingSourceLinks;
  cdeRequestHref: string | null;
}) {
  const locale = useLocale();
  const t = useTranslations('DiabetesCare.ui.fundingPage');
  const chrome = useTranslations('DiabetesCare.ui.chapter');
  const provinceLabels: Record<string, string> = useMessages().DiabetesCare.funding.provinceLabels;
  const checkerGated = isFrGated('fundingChecker', locale);
  const checkerDraft = showsFrDraftMarker('fundingChecker', locale);

  return (
    <>
      {/*
       * How paying works: the provincial drug plans billed directly, the
       * programs that pay you back, and Liivv Now, Pay Later for pump supplies.
       */}
      <section className="oc-ch-care rounded-top" id="paying">
        <div className="oc-ch-wrap">
          <FundingSectionHead
            eyebrow={t('payingEyebrow')}
            heading={t('payingHeading')}
            intro={t('payingIntro')}
          />
          <div className="oc-fund-parts">
            <article className="oc-fund-part">
              <h3>{t('directHeading')}</h3>
              <p>{t('directBody')}</p>
              <ul>
                {DIRECT_BILLING.map((entry) => {
                  const link: FundingSourceLinks[string] | undefined = sources[entry.source];
                  const words = t('directPlan', {
                    province: provinceLabels[entry.province] ?? entry.province,
                    plan: locale === 'fr' && entry.planFr ? entry.planFr : entry.plan,
                  });

                  return (
                    <li key={entry.province}>
                      {link ? (
                        <a
                          className="oc-fund-row-link"
                          href={link.href}
                          hrefLang={link.hrefLang}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {words} ↗
                        </a>
                      ) : (
                        words
                      )}
                    </li>
                  );
                })}
              </ul>
              <p>{t('directQuebec')}</p>
              <p>{t('directOther')}</p>
            </article>
            <article className="oc-fund-part">
              <h3>{t('claimHeading')}</h3>
              <p>{t('claimBody')}</p>
              <p>{t('claimCheck')}</p>
            </article>
            {PAY_LATER.enabled ? (
              <article className="oc-fund-part" id="pay-later">
                <h3>{PAY_LATER.name}</h3>
                <p>{t('payLaterBody')}</p>
                <ul>
                  {PAY_LATER_TERMS.map((key) => (
                    <li key={key}>{t(`payLaterTerms.${key}`)}</li>
                  ))}
                </ul>
                <p>{t('payLaterContact')}</p>
                <SpecialistContact tone="light" />
              </article>
            ) : null}
          </div>
        </div>
      </section>

      <section className="oc-fund-tool rounded-top" id="find-your-coverage">
        <div className="oc-ch-wrap">
          <FundingSectionHead
            eyebrow={t('toolEyebrow')}
            heading={t('toolHeading')}
            intro={checkerGated ? undefined : t('toolIntro')}
          />
          {checkerDraft ? <p className="oc-fig-draft">{chrome('frDraft')}</p> : null}
          {checkerGated ? (
            <FundingProvinceList sources={sources} />
          ) : (
            <FundingChecker askUsHref={cdeRequestHref} sources={sources} />
          )}
        </div>
      </section>

      <section className="oc-ch-care rounded-top" id="federal">
        <div className="oc-ch-wrap">
          <FundingSectionHead eyebrow={t('federalEyebrow')} heading={t('federalHeading')} />
          <div className="oc-ch-rows">
            {FEDERAL_ROWS.map((row, index) => (
              <FederalRow
                extra={row.program === 'fed-pharmacare' ? t('pharmacareSigned') : undefined}
                heading={t(row.heading)}
                index={index + 1}
                key={row.program}
                note={row.program === 'fed-dtc' ? t('dtcNote') : undefined}
                programId={row.program}
                sources={sources}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="oc-ch-care rounded-top">
        <div className="oc-ch-wrap">
          <FundingSectionHead eyebrow={t('changesEyebrow')} heading={t('changesHeading')} />
          <ul className="oc-fund-changes">
            {CHANGES_ORDER.map((key) => (
              <li key={key}>{t(`changes.${key}`)}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="oc-ch-care rounded-top">
        <div className="oc-ch-wrap">
          <FundingSectionHead eyebrow={t('whereEyebrow')} heading={t('whereHeading')} />
          <p className="oc-fund-plain">{t('whereBody')}</p>
        </div>
      </section>

      <section className="oc-ch-programs rounded-top">
        <div className="oc-ch-wrap">
          <FundingSectionHead eyebrow={t('enoughEyebrow')} heading={t('enoughHeading')} />
          <div className="oc-ch-programs-grid">
            <article className="oc-ch-program">
              <span className="oc-ch-program-index">01</span>
              <h3>{t('enough1Heading')}</h3>
              <p>{t('enough1Body')}</p>
            </article>
            <article className="oc-ch-program">
              <span className="oc-ch-program-index">02</span>
              <h3>{t('enough2Heading')}</h3>
              <p>{t('enough2Body')}</p>
              <SourceLinks
                links={[
                  sources['dc-comparisons-by-province'],
                  sources['dc-out-of-pocket-costs-2022'],
                ]}
              />
            </article>
            <article className="oc-ch-program">
              <span className="oc-ch-program-index">03</span>
              <h3>{t('enough3Heading')}</h3>
              <p>{t('enough3Body')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="oc-ch-care rounded-top">
        <div className="oc-ch-wrap">
          <FundingSectionHead
            eyebrow={t('movingEyebrow')}
            heading={t('movingHeading')}
            intro={t('movingIntro')}
          />
          <div className="oc-ch-rows">
            <FundingRow index={1}>
              <h3>{t('beforeHeading')}</h3>
              <ul>
                <li>{t('before1')}</li>
                <li>{t('before2')}</li>
              </ul>
            </FundingRow>
            <FundingRow index={2}>
              <h3>{t('arriveHeading')}</h3>
              <ul>
                <li>{t('arrive1')}</li>
                <li>{t('arrive2')}</li>
              </ul>
            </FundingRow>
          </div>
        </div>
      </section>

      {/*
       * The CDE band: national, with no "Available in Ontario" label. It shows
       * the general contact of Liivv's Certified Diabetes Educators
       * (DIABETES_SITE.contact; owner answers A2, B5, B9, B10, 2026-10-06;
       * owner note 5, 2026-10-07).
       * "Request a call" renders only once the appointment page offers a
       * reason for it (landing-meta.ts, `cdeRequestReason`), as on the landing.
       */}
      <section className="oc-ch-care-cta rounded-top" id="cde">
        <div className="oc-ch-wrap">
          <div className="oc-ch-care-panel">
            <div className="oc-ch-care-media">
              <img alt="" src={`${IMG}/care-chat-main.png`} />
            </div>
            <div className="oc-ch-care-copy">
              <span className="oc-ch-eyebrow">{t('cdeEyebrow')}</span>
              <h2>{t('cdeHeading')}</h2>
              <p>{t('cdeBody')}</p>
              <SpecialistContact />
              {cdeRequestHref ? (
                <a className="oc-ch-btn oc-ch-btn-soft" href={cdeRequestHref}>
                  {t('cdeCta')}
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export function DcFundingPage({
  sources,
  pageSources,
  cdeRequestHref,
}: {
  /* The register entries the page links to, resolved for the page locale. */
  sources: FundingSourceLinks;
  /* Every source the page names, once each, resolved: the grouped foot list (owner note 1). */
  pageSources: ResolvedSource[];
  /* Already in the page locale, or null while the button is held. */
  cdeRequestHref: string | null;
}) {
  const locale = useLocale();
  const messages = useMessages().DiabetesCare;

  /*
   * The approved "emergency signs are in Staying Safe" pair the landing also
   * uses (landing-meta.ts, URGENT_EXIT_CHAPTER), linked to Staying Safe's
   * emergency list. Staying Safe's own pair says "at the top of this page",
   * which is not true here.
   */
  const exitWords = messages.chapters[URGENT_EXIT_CHAPTER].urgentExit;
  const { redFlags } = DIABETES_SITE.anchors;
  const exit = {
    lead: exitWords.lead,
    link: exitWords.link,
    href: localeHref(`${chapterHref(DIABETES_SITE, redFlags.chapter)}#${redFlags.id}`, locale),
  };

  return (
    <SiteProvider value={DIABETES_SITE}>
      <FundingPage
        accent={ACCENT}
        closingHref={chapterHref(DIABETES_SITE, 'your-tools')}
        disclaimer={messages.funding.governance.disclaimer}
        exit={exit}
        frDraft={showsFrDraftMarker('funding', locale)}
        sources={pageSources}
      >
        <DcFundingSections cdeRequestHref={cdeRequestHref} sources={sources} />
      </FundingPage>
    </SiteProvider>
  );
}
