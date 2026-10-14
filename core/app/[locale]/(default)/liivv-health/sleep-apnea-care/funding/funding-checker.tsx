'use client';

/*
 * The Sleep Apnea Care funding checker, and the plain list /fr shows in its
 * place until its French is reviewed. A fork of Diabetes Care's
 * (../../diabetes-care/funding/funding-checker.tsx), with Sleep's own
 * questions and rules.
 *
 * Seven questions, in the order the copy record sets (funding.md A.5): where
 * you live (the one that is needed), income or disability assistance, First
 * Nations or Inuit, Veterans Affairs client, private insurance, the sleep test
 * you had, and what you need help with. The results are grouped in the
 * owner's order (RESULT_GROUPS) and worked out by ./funding-data.ts, a pure
 * function with its own test. The generic parts — the radio rows, the progress
 * line and the cards — are the engine's (../../_microsite/funding/checker-parts).
 *
 * The answers stay in this component's state. Nothing here saves them, sends
 * them anywhere or reports them to analytics. The page does not say so yet:
 * that promise waits on the privacy sign-off (funding.md E-12, ruling B3).
 *
 * Under some hints, the chips of the pages the hint rests on (PAGE_SOURCES in
 * ./funding-meta.ts; owner note 1). Held program words (ruling B1: NIHB and
 * FNHA, until an Indigenous health partner has reviewed them) are not on the
 * client; those cards show only where to turn, their official page and the
 * date it was checked.
 */

import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import { SourceChip } from '../../_microsite/_components/source-chip';
import { chapterHref, localeHref } from '../../_microsite/chapters/hrefs';
import {
  CheckerProgress,
  FundingCardGroups,
  type FundingPhoneGroup,
  groupCards,
  PhoneList,
  RadioRow,
} from '../../_microsite/funding/checker-parts';
import { useSiteSources } from '../../_microsite/site-context';
import { lookUpSources } from '../../_microsite/sources';
import { SLEEP_SITE } from '../chapters/site';

import {
  buildResults,
  type CheckerInput,
  checkerProgress,
  EMPTY_INPUT,
  NEEDS,
  type ProgramMeta,
  type ProgramPhoneGroup,
  programTitle,
  type ProgramWords,
  PROVINCE_CODES,
  type ProvinceCode,
  RESULT_GROUPS,
  type ResultCopy,
  type ResultGroup,
  type ResultSources,
  type SourceLink,
  TEST_TYPES,
  type YesNoUnsure,
} from './funding-data';
import {
  BUY_FIRST_ITEMS,
  FUNDING_DATA,
  NOT_TESTED_YET_CHAPTER,
  PAGE_SOURCES,
  PROGRAM_META,
} from './funding-meta';

/* The register entries the page links to, already in the page locale (from ./page.tsx). */
export type FundingSourceLinks = Readonly<Record<string, SourceLink>>;

const isResultGroup = (group: string): group is ResultGroup =>
  RESULT_GROUPS.some((known) => known === group);

/* A line's chips, from PAGE_SOURCES by its message key; nothing for a line that cites none. */
export function LineSources({ line, label }: { line: string; label?: string }) {
  const map = useSiteSources();
  const ids = PAGE_SOURCES[line] ?? [];

  if (!map || !ids.length) return null;

  return <SourceChip className="sa-fund-src" label={label} sources={lookUpSources(map, ids)} />;
}

/* The provinces and territories, by their name in the page language. */
function useProvinceLabels() {
  const labels: Record<string, string> = useMessages().SleepApneaCare.funding.provinceLabels;

  return useCallback((code: ProvinceCode) => labels[code] ?? code, [labels]);
}

function useProvinceOptions() {
  const labels: Record<string, string> = useMessages().SleepApneaCare.funding.provinceLabels;

  return useMemo(
    () =>
      PROVINCE_CODES.map((code) => ({ value: code, label: labels[code] ?? code })).sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    [labels],
  );
}

/*
 * A program's phone numbers as its card prints them: the office by its own
 * name (French where the government prints one), each number dialled as +1
 * and printed as the page prints it, with the area or condition the page
 * prints beside it. (The Sleep copy has no words yet for "toll-free" or
 * "TTY", so the number alone is shown for those.)
 */
export function useProgramPhones() {
  const locale = useLocale();

  return useCallback(
    (owner: { phones?: ProgramPhoneGroup[] }): FundingPhoneGroup[] =>
      (owner.phones ?? []).map((group) => ({
        /* French sets a non-breaking space before the colon the list prints after the office. */
        office: (locale === 'fr' && group.officeFr ? group.officeFr : group.office).concat(
          locale === 'fr' ? String.fromCharCode(160) : '',
        ),
        numbers: group.numbers.map((phone) => ({
          text: phone.number,
          tel: `+1${phone.number.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')}`,
          ...(phone.area ? { note: phone.area } : {}),
        })),
      })),
    [locale],
  );
}

/* What the result list says that is not a program's own words, in the page locale. */
function useResultCopy(): ResultCopy {
  const locale = useLocale();
  const funding = useMessages().SleepApneaCare.funding;
  const results = useMessages().SleepApneaCare.ui.fundingResults;
  const t = useTranslations('SleepApneaCare.ui.fundingChecker');
  const r = useTranslations('SleepApneaCare.ui.fundingResults');
  const page = useTranslations('SleepApneaCare.ui.fundingPage');
  const p = useTranslations('SleepApneaCare.funding.province');
  const provinceLabel = useProvinceLabels();
  const phones = useProgramPhones();
  const province: Record<string, { title: string; body: string } | undefined> = funding.province;
  const groups: Record<string, string> = funding.groups;
  const testNotes: Record<string, string | undefined> = results.testNote;
  const suppliesNotes: Record<string, string | undefined> = results.suppliesNote;
  const buyFirstItems: Record<string, string> =
    useMessages().SleepApneaCare.ui.fundingPage.buyFirstItems;
  const words = (id: string) => ({
    title: province[id]?.title ?? '',
    body: province[id]?.body ?? '',
  });

  return {
    caution: words,
    stillChecking: (code) => ({
      title: p('stillChecking.title', { province: provinceLabel(code) }),
      body: p('stillChecking.body', { province: provinceLabel(code) }),
    }),
    stillCheckingLine: words,
    notTestedYet: {
      title: r('notTestedYetTitle'),
      body: r('notTestedYetBody'),
      link: {
        label: r('notTestedYetLink'),
        href: localeHref(chapterHref(SLEEP_SITE, NOT_TESTED_YET_CHAPTER), locale),
      },
    },
    testNote: (id) => testNotes[id],
    suppliesNote: (id) => suppliesNotes[id],
    adpNoSupplies: { title: r('adpNoSuppliesTitle'), body: r('adpNoSuppliesBody') },
    noConfirmed: (group, code) => ({
      title: r('noConfirmedTitle', {
        group: groups[group] ?? group,
        province: provinceLabel(code),
      }),
      body: r('noConfirmedBody', { province: provinceLabel(code) }),
    }),
    privateFirst: { title: r('privateFirstTitle'), body: r('privateFirstBody') },
    /* The body, then only the reader's province's line (BUY_FIRST_ITEMS: ON, BC, SK). */
    buyFirst: (code) => ({
      title: page('buyFirstHeading'),
      body: [
        page('buyFirstBody'),
        ...BUY_FIRST_ITEMS.filter((line) => line.province === code).map(
          (line) => buyFirstItems[line.item] ?? '',
        ),
      ].filter(Boolean),
    }),
    askUs: { title: funding.liivv.askUsTitle, body: funding.liivv.askUsBody },
    findOffice: t('findOffice'),
    phones,
  };
}

function programLink(sources: FundingSourceLinks, meta: ProgramMeta) {
  return sources[meta.sources[0]];
}

/* One yes / no / not sure question, with the chips of the pages its hint rests on. */
function YesNoRow({
  name,
  legend,
  hint,
  hintKey,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  hint: string;
  hintKey: string;
  value: YesNoUnsure | '';
  onChange: (next: YesNoUnsure) => void;
}) {
  const t = useTranslations('SleepApneaCare.ui.fundingChecker');
  const options: Array<{ value: YesNoUnsure; label: string }> = [
    { value: 'yes', label: t('yes') },
    { value: 'no', label: t('no') },
    { value: 'unsure', label: t('notSure') },
  ];

  return (
    <div className="sa-fund-question">
      <RadioRow
        hint={hint}
        legend={legend}
        name={name}
        onChange={onChange}
        options={options}
        value={value}
      />
      <LineSources label={legend} line={hintKey} />
    </div>
  );
}

function CheckerQuestions({
  input,
  setInput,
}: {
  input: CheckerInput;
  setInput: (update: (prev: CheckerInput) => CheckerInput) => void;
}) {
  const t = useTranslations('SleepApneaCare.ui.fundingChecker');
  const options = useMessages().SleepApneaCare.funding.options;
  const testLabels: Record<string, string> = options.test;
  const needLabels: Record<string, string> = options.need;
  const provinceOptions = useProvinceOptions();
  const yesNo = (key: 'assistance' | 'indigenous' | 'veteran' | 'privateInsurance') => ({
    value: input[key],
    onChange: (next: YesNoUnsure) => setInput((prev) => ({ ...prev, [key]: next })),
  });

  return (
    <>
      <RadioRow
        hint={t('provinceHint')}
        legend={t('provinceLabel')}
        name="province"
        onChange={(next) => setInput((prev) => ({ ...prev, province: next }))}
        options={provinceOptions}
        value={input.province}
      />
      <YesNoRow
        hint={t('assistanceHint')}
        hintKey="ui.fundingChecker.assistanceHint"
        legend={t('assistanceLegend')}
        name="assistance"
        {...yesNo('assistance')}
      />
      <YesNoRow
        hint={t('indigenousHint')}
        hintKey="ui.fundingChecker.indigenousHint"
        legend={t('indigenousLegend')}
        name="indigenous"
        {...yesNo('indigenous')}
      />
      <YesNoRow
        hint={t('veteranHint')}
        hintKey="ui.fundingChecker.veteranHint"
        legend={t('veteranLegend')}
        name="veteran"
        {...yesNo('veteran')}
      />
      <YesNoRow
        hint={t('privateHint')}
        hintKey="ui.fundingChecker.privateHint"
        legend={t('privateLegend')}
        name="privateInsurance"
        {...yesNo('privateInsurance')}
      />
      <div className="sa-fund-question">
        <RadioRow
          hint={t('testHint')}
          legend={t('testLegend')}
          name="test"
          onChange={(next) => setInput((prev) => ({ ...prev, test: next }))}
          options={TEST_TYPES.map((value) => ({ value, label: testLabels[value] ?? value }))}
          value={input.test}
        />
        <LineSources label={t('testLegend')} line="ui.fundingChecker.testHint" />
      </div>
      <div className="sa-fund-question">
        <RadioRow
          hint={t('needHint')}
          legend={t('needLegend')}
          name="need"
          onChange={(next) => setInput((prev) => ({ ...prev, need: next }))}
          options={NEEDS.map((value) => ({ value, label: needLabels[value] ?? value }))}
          value={input.need}
        />
        <LineSources label={t('needLegend')} line="ui.fundingChecker.needHint" />
      </div>
    </>
  );
}

export function FundingChecker({ sources }: { sources: FundingSourceLinks }) {
  const funding = useMessages().SleepApneaCare.funding;
  const locale = useLocale();
  const t = useTranslations('SleepApneaCare.ui.fundingChecker');
  const [input, setInput] = useState<CheckerInput>(EMPTY_INPUT);
  const copy = useResultCopy();
  const programWords: Record<string, ProgramWords | undefined> = funding.programs;
  const groupLabels: Record<string, string> = funding.groups;
  const resultSources: ResultSources = {
    program: (meta) => programLink(sources, meta),
    source: (id) => sources[id],
  };
  const results = buildResults(input, {
    data: FUNDING_DATA,
    words: programWords,
    copy,
    sources: resultSources,
    locale,
  });
  const ready = input.province !== '';
  const progress = checkerProgress(input);

  return (
    <div className="oc-fund-checker">
      <form
        aria-label={t('formLabel')}
        className="oc-fund-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <CheckerQuestions input={input} setInput={setInput} />
        {ready ? (
          <button className="oc-fund-reset" onClick={() => setInput(EMPTY_INPUT)} type="button">
            {t('startOver')}
          </button>
        ) : null}
      </form>

      <div aria-live="polite" className="oc-fund-results">
        {ready ? (
          <>
            <CheckerProgress
              answered={progress.answered}
              label={t('progress', {
                answered: String(progress.answered),
                total: String(progress.total),
              })}
              state={progress.answered < progress.total ? t('narrowing') : t('complete')}
              total={progress.total}
            />
            <FundingCardGroups
              confirm={t('confirm')}
              groups={groupCards(results, (group) =>
                isResultGroup(group) ? groupLabels[group] : undefined,
              )}
              phonesLabel={t('call', { office: '' }).trim()}
              verifiedOn={(date) => t('verifiedOn', { date })}
            />
            <p className="oc-fund-caveat">{t('caveat')}</p>
          </>
        ) : (
          <p className="oc-fund-empty">{t('empty')}</p>
        )}
      </div>
    </div>
  );
}

/*
 * What /fr shows while the checker's French waits on review: every province
 * and territory, by name, with the programs on record there, each linked to
 * its official page with the date it was checked. A province with none on
 * record says we are still checking, rather than nothing. No question is
 * asked and nothing is worked out, so no unreviewed result wording is shown.
 */
export function FundingProvinceList({ sources }: { sources: FundingSourceLinks }) {
  const locale = useLocale();
  const t = useTranslations('SleepApneaCare.ui.fundingChecker');
  const r = useTranslations('SleepApneaCare.ui.fundingResults');
  const provinceOptions = useProvinceOptions();
  const phones = useProgramPhones();

  return (
    <>
      <div className="oc-fund-fallback">
        {provinceOptions.map((province) => {
          const programs = PROGRAM_META.filter((meta) => meta.jurisdiction === province.value);

          return (
            <section className="oc-fund-fallback-province" key={province.value}>
              <h3>{province.label}</h3>
              {programs.length ? (
                <ul>
                  {programs.map((meta) => {
                    const link = programLink(sources, meta);
                    const title = programTitle(meta, locale);
                    const numbers = phones(meta);

                    return (
                      <li key={meta.id}>
                        {link ? (
                          <a href={link.href} rel="noopener noreferrer" target="_blank">
                            {title} ↗
                          </a>
                        ) : (
                          title
                        )}
                        <span className="oc-fund-row-meta">
                          {' '}
                          {t('verifiedOn', { date: meta.verifiedOn })}
                          {meta.confirm ? ` ${t('confirm')}` : ''}
                        </span>
                        {numbers.length ? (
                          <PhoneList label={t('call', { office: title })} phones={numbers} />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>{r('noConfirmedBody', { province: province.label })}</p>
              )}
            </section>
          );
        })}
      </div>
      <p className="oc-fund-caveat">{t('caveat')}</p>
    </>
  );
}
