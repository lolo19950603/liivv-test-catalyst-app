'use client';

/*
 * =============================================================================
 * SLEEP APNEA CARE — FUNDING & COVERAGE
 * =============================================================================
 * The page at /liivv-health/sleep-apnea-care/funding, in the order the
 * verified copy record sets (funding.md A.2): the hero and the urgent
 * signpost (the engine's frame, ../../_microsite/funding/funding-page), how
 * paying works with the "check with your program first" card, the checker,
 * the federal programs, where we are still checking, when it isn't enough,
 * then the closing and the furniture. Liivv's sleep support band (A.2 item 8)
 * is not drawn: its words are out of the message files until that service
 * exists (Part C).
 *
 * How paying works says only what each program's own page says about how it
 * pays. Liivv bills no program directly yet (DIRECT_BILLING is empty, D-1), so
 * that part says so, and nothing promises a claim route. The page places no
 * products and links no machine.
 *
 * Sources are shown on the lines they back (owner note 1): every sentence
 * PAGE_SOURCES names carries its chips, every program its official page and
 * the date it was checked, and the foot list names everything once.
 *
 * French: the page's prose ships on /fr flagged as machine translated (gate
 * `funding` decides the draft marker on previews). The checker waits on its
 * own gate, `fundingChecker`; while it is closed /fr shows the plain list of
 * each province's programs instead. The urgent signpost, the federal programs
 * and the "check with your program first" card are never behind a gate.
 * =============================================================================
 */

import { useLocale, useMessages, useTranslations } from 'next-intl';

import { chapterHref, localeHref } from '../../_microsite/chapters/hrefs';
import { PhoneList } from '../../_microsite/funding/checker-parts';
import { FundingPage, FundingRow, FundingSectionHead } from '../../_microsite/funding/funding-page';
import { SiteProvider } from '../../_microsite/site-context';
import type { ResolvedSource } from '../../_microsite/sources';
import { isFrGated, showsFrDraftMarker } from '../chapters/review-gates';
import { SLEEP_SITE } from '../chapters/site';

import {
  FundingChecker,
  FundingProvinceList,
  type FundingSourceLinks,
  LineSources,
  useProgramPhones,
} from './funding-checker';
import { programParagraphs, programTitle, type ProgramWords } from './funding-data';
import {
  BUY_FIRST_ITEMS,
  CHECKING_CARDS,
  CLOSING_CHAPTER,
  DIRECT_BILLING,
  FEDERAL_ROWS,
  PROGRAM_META,
  URGENT_EXIT_WORDS_CHAPTER,
} from './funding-meta';

import './sa-funding.css';

/* Placeholders until the Sleep palette is chosen, as on the chapters (landing D12). */
const ACCENT = '#b9aecf';

/* The chapter whose governance disclaimer the page carries (general information, prescriber decides). */
const DISCLAIMER_CHAPTER = 'treatment-options';

/* An email address in a sentence becomes a mailto link; the words stay exactly as they are. */
function WithMail({ text }: { text: string }) {
  const parts = text.split(/([\w.+-]+@[\w-]+\.[\w.]+[\w])/);

  return parts.map((part, index) =>
    index % 2 ? (
      <a href={`mailto:${part}`} key={part}>
        {part}
      </a>
    ) : (
      part
    ),
  );
}

/* One program on the record: its words (unless held), phones, official page and checked date. */
function ProgramRow({
  index,
  programId,
  heading,
  sources,
}: {
  index: number;
  programId: string;
  heading?: string;
  sources: FundingSourceLinks;
}) {
  const locale = useLocale();
  const t = useTranslations('SleepApneaCare.ui.fundingChecker');
  const programs: Record<string, ProgramWords | undefined> =
    useMessages().SleepApneaCare.funding.programs;
  const phones = useProgramPhones();
  const meta = PROGRAM_META.find((program) => program.id === programId);

  if (!meta) return null;

  const title = programTitle(meta, locale);
  const link = sources[meta.sources[0]];
  const office = meta.contactSource ? sources[meta.contactSource] : undefined;
  const numbers = phones(meta);

  return (
    <FundingRow index={index}>
      {heading ? <h3>{heading}</h3> : null}
      <p className="oc-fund-row-title">{title}</p>
      {meta.held
        ? null
        : programParagraphs(programs[meta.id]).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
      {numbers.length ? <PhoneList label={t('call', { office: title })} phones={numbers} /> : null}
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
      {office ? (
        <a
          className="oc-fund-row-link"
          href={office.href}
          hrefLang={office.hrefLang}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('findOffice')} ↗
        </a>
      ) : null}
      <p className="oc-fund-row-meta">
        {t('verifiedOn', { date: meta.verifiedOn })}
        {meta.confirm ? ` ${t('confirm')}` : ''}
      </p>
    </FundingRow>
  );
}

/* Part 1 and part 3 of "How paying works": programs billed directly, and check before you buy. */
function PayingSection() {
  const t = useTranslations('SleepApneaCare.ui.fundingPage');
  const items: Record<string, string> = useMessages().SleepApneaCare.ui.fundingPage.buyFirstItems;

  return (
    <section className="oc-ch-care rounded-top" id="paying">
      <div className="oc-ch-wrap">
        <FundingSectionHead
          eyebrow={t('payingEyebrow')}
          heading={t('payingHeading')}
          intro={t('payingIntro')}
        />
        <LineSources label={t('payingHeading')} line="ui.fundingPage.payingIntro" />
        <div className="oc-fund-parts">
          <article className="oc-fund-part">
            <h3>{t('directHeading')}</h3>
            <p>{t('directBody')}</p>
            {/* Liivv bills no program directly yet (D-1): the list is empty, and says so. */}
            {DIRECT_BILLING.length ? null : <p>{t('directEmpty')}</p>}
          </article>
          <article className="oc-fund-part sa-fund-caution" id="before-you-buy">
            <span className="oc-ch-eyebrow">{t('buyFirstEyebrow')}</span>
            <h3>{t('buyFirstHeading')}</h3>
            <p>{t('buyFirstBody')}</p>
            <ul>
              {BUY_FIRST_ITEMS.map((line) => (
                <li key={line.item}>
                  {items[line.item]}
                  <LineSources
                    label={items[line.item]}
                    line={`ui.fundingPage.buyFirstItems.${line.item}`}
                  />
                </li>
              ))}
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

function CheckerSection({ sources }: { sources: FundingSourceLinks }) {
  const locale = useLocale();
  const t = useTranslations('SleepApneaCare.ui.fundingPage');
  const chrome = useTranslations('SleepApneaCare.ui.chapter');
  const checkerGated = isFrGated('fundingChecker', locale);

  return (
    <section className="oc-fund-tool rounded-top" id="find-your-coverage">
      <div className="oc-ch-wrap">
        <FundingSectionHead
          eyebrow={t('toolEyebrow')}
          heading={t('toolHeading')}
          intro={checkerGated ? undefined : t('toolIntro')}
        />
        {showsFrDraftMarker('fundingChecker', locale) ? (
          <p className="oc-fig-draft">{chrome('frDraft')}</p>
        ) : null}
        {checkerGated ? (
          <FundingProvinceList sources={sources} />
        ) : (
          <FundingChecker sources={sources} />
        )}
      </div>
    </section>
  );
}

function FederalSection({ sources }: { sources: FundingSourceLinks }) {
  const t = useTranslations('SleepApneaCare.ui.fundingPage');
  const rows = FEDERAL_ROWS.flatMap((row) => [
    { program: row.program, heading: t(row.heading) },
    ...(row.also ?? []).map((program) => ({ program, heading: undefined })),
  ]);

  return (
    <section className="oc-ch-care rounded-top" id="federal">
      <div className="oc-ch-wrap">
        <FundingSectionHead eyebrow={t('federalEyebrow')} heading={t('federalHeading')} />
        <div className="oc-ch-rows">
          {rows.map((row, index) => (
            <ProgramRow
              heading={row.heading}
              index={index + 1}
              key={row.program}
              programId={row.program}
              sources={sources}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* Where we're still checking: the provinces with no program read yet, then Alberta's AADL and Quebec. */
function CheckingSection({ sources }: { sources: FundingSourceLinks }) {
  const t = useTranslations('SleepApneaCare.ui.fundingPage');
  const province: Record<string, { title: string; body: string } | undefined> =
    useMessages().SleepApneaCare.funding.province;

  return (
    <section className="oc-ch-care rounded-top" id="still-checking">
      <div className="oc-ch-wrap">
        <FundingSectionHead eyebrow={t('checkingEyebrow')} heading={t('checkingHeading')} />
        <p className="oc-fund-plain">{t('checkingBody')}</p>
        <div className="oc-ch-rows">
          {CHECKING_CARDS.map((card, index) => {
            const words = province[card.key];
            const link = card.sources[0] ? sources[card.sources[0]] : undefined;

            return words ? (
              <FundingRow index={index + 1} key={card.key}>
                <h3>{words.title}</h3>
                <p>{words.body}</p>
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
              </FundingRow>
            ) : null;
          })}
        </div>
      </div>
    </section>
  );
}

function EnoughSection() {
  const t = useTranslations('SleepApneaCare.ui.fundingPage');
  const cards = [
    { n: '01', heading: t('enough1Heading'), body: t('enough1Body'), line: 'enough1Body' },
    { n: '02', heading: t('enough2Heading'), body: t('enough2Body'), line: 'enough2Body' },
    { n: '03', heading: t('enough3Heading'), body: t('enough3Body'), line: 'enough3Body' },
  ];

  return (
    <section className="oc-ch-programs rounded-top">
      <div className="oc-ch-wrap">
        <FundingSectionHead eyebrow={t('enoughEyebrow')} heading={t('enoughHeading')} />
        <div className="oc-ch-programs-grid">
          {cards.map((card) => (
            <article className="oc-ch-program" key={card.n}>
              <span className="oc-ch-program-index">{card.n}</span>
              <h3>{card.heading}</h3>
              <p>
                <WithMail text={card.body} />
              </p>
              <LineSources label={card.heading} line={`ui.fundingPage.${card.line}`} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SaFundingPage({
  sources,
  links,
  pageSources,
}: {
  /* The register entries the page's chips name, resolved for the page locale. */
  sources: Readonly<Record<string, ResolvedSource>>;
  /* The official pages the program cards link to, worded for the page locale. */
  links: FundingSourceLinks;
  /* Every source the page names, once each, resolved: the grouped foot list (owner note 1). */
  pageSources: ResolvedSource[];
}) {
  const locale = useLocale();
  const messages = useMessages().SleepApneaCare;

  /*
   * This Might Be You's "signs that need care right away … are in Driving &
   * Staying Safe" pair, linked to its red-flag block, as the landing uses it
   * (URGENT_EXIT_WORDS_CHAPTER). Driving & Staying Safe's own pair says "at
   * the top of this page", which is only true there. Never gated.
   */
  const exitWords = messages.chapters[URGENT_EXIT_WORDS_CHAPTER].urgentExit;
  const { redFlags } = SLEEP_SITE.anchors;
  const exit = {
    lead: exitWords.lead,
    link: exitWords.link,
    href: localeHref(`${chapterHref(SLEEP_SITE, redFlags.chapter)}#${redFlags.id}`, locale),
  };

  return (
    <SiteProvider sources={sources} value={SLEEP_SITE}>
      <FundingPage
        accent={ACCENT}
        closingHref={chapterHref(SLEEP_SITE, CLOSING_CHAPTER)}
        disclaimer={messages.chapters[DISCLAIMER_CHAPTER].governance.disclaimer}
        exit={exit}
        frDraft={showsFrDraftMarker('funding', locale)}
        sources={pageSources}
      >
        <PayingSection />
        <CheckerSection sources={links} />
        <FederalSection sources={links} />
        <CheckingSection sources={links} />
        <EnoughSection />
      </FundingPage>
    </SiteProvider>
  );
}
