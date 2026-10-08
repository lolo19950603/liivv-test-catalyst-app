'use client';

/*
 * The Diabetes funding checker, and the plain list /fr shows in its place
 * until its French is reviewed.
 *
 * Seven questions, in the order the copy record sets: where you live (the one
 * that is needed), type, how it is managed, age, First Nations or Inuit,
 * Veterans Affairs client, and private insurance. The results are grouped in
 * the owner's order (./funding-meta.ts, RESULT_GROUPS) and worked out by
 * ./funding-data.ts. The generic parts — the radio rows, the progress line and
 * the cards — are the engine's (../../_microsite/funding/checker-parts).
 *
 * The answers stay in this component's state. Nothing here saves them, sends
 * them anywhere or reports them to analytics; the page still makes no promise
 * about that until engineering has checked every tag on it (held, E-26).
 */

import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useCallback, useMemo, useState } from 'react';

import {
  CheckerProgress,
  FundingCardGroups,
  type FundingPhoneGroup,
  groupCards,
  PhoneList,
  RadioRow,
} from '../../_microsite/funding/checker-parts';

import {
  buildResults,
  type CheckerInput,
  checkerProgress,
  EMPTY_INPUT,
  isTerritory,
  programTitle,
  type ProgramWords,
  type ResultSources,
  type SourceLink,
} from './funding-data';
import {
  AGE_BANDS,
  DIABETES_TYPES,
  PAY_LATER,
  PROGRAM_META,
  type ProgramMeta,
  PROVINCE_CODES,
  type ProvinceCode,
  RESULT_GROUPS,
  type ResultGroup,
  THERAPIES,
  type YesNoUnsure,
} from './funding-meta';

/* The register entries the page links to, already in the page locale (from ./page.tsx). */
export type FundingSourceLinks = Readonly<Record<string, SourceLink>>;

const isResultGroup = (group: string): group is ResultGroup =>
  RESULT_GROUPS.some((known) => known === group);

/*
 * A province's name as each result line needs it: the plain name, and the
 * forms with a preposition ("en Alberta", "au Manitoba", "pour l’Alberta"),
 * which French cannot build from the name alone.
 */
function useProvinceWords() {
  const funding = useMessages().DiabetesCare.funding;
  const labels: Record<string, string> = funding.provinceLabels;
  const inForms: Record<string, string> = funding.provinceForms.in;
  const forForms: Record<string, string> = funding.provinceForms.for;

  return useCallback(
    (code: ProvinceCode) => ({
      province: labels[code] ?? code,
      provinceIn: inForms[code] ?? labels[code] ?? code,
      provinceFor: forForms[code] ?? labels[code] ?? code,
    }),
    [labels, inForms, forForms],
  );
}

/* The provinces and territories, by their name in the page language. */
function useProvinceOptions() {
  const labels: Record<string, string> = useMessages().DiabetesCare.funding.provinceLabels;

  return useMemo(
    () =>
      PROVINCE_CODES.map((code) => ({ value: code, label: labels[code] ?? code })).sort((a, b) =>
        a.label.localeCompare(b.label),
      ),
    [labels],
  );
}

function programLink(sources: FundingSourceLinks, meta: ProgramMeta) {
  return sources[meta.sources[0]];
}

/*
 * A program's phone numbers as its card prints them (owner answer B22): the
 * office by its own name (French where the government prints one), each
 * number dialled as +1 and printed as the page prints it, with what the page
 * says about it — toll-free, toll-free only inside the province, TTY, or the
 * area a local number serves.
 */
export function useProgramPhones() {
  const locale = useLocale();
  const t = useTranslations('DiabetesCare.ui.fundingChecker.phone');
  const provinceWords = useProvinceWords();

  return useCallback(
    (meta: ProgramMeta): FundingPhoneGroup[] =>
      (meta.phones ?? []).map((group) => ({
        /* French sets a non-breaking space before the colon the list prints after the office. */
        office: (locale === 'fr' && group.officeFr ? group.officeFr : group.office)?.concat(
          locale === 'fr' ? String.fromCharCode(160) : '',
        ),
        numbers: group.numbers.map((phone) => {
          const ext = phone.ext?.length
            ? new Intl.ListFormat(locale, { type: 'disjunction' }).format(phone.ext)
            : undefined;
          let note: string | undefined = phone.area;

          if (phone.kind === 'tollFree') note = t('tollFree');

          if (phone.kind === 'tty') note = t('tty');

          if (phone.kind === 'tollFreeIn' && meta.jurisdiction !== 'CA') {
            note = t('tollFreeIn', provinceWords(meta.jurisdiction));
          }

          return {
            text: ext ? t('ext', { number: phone.number, ext }) : phone.number,
            /*
             * Any one of the printed extensions reaches the office, so the
             * first is dialled after a pause (a comma), as phones dial it.
             */
            tel: `+1${phone.number.replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '')}${
              phone.ext?.[0] ? `,${phone.ext[0]}` : ''
            }`,
            ...(note ? { note } : {}),
          };
        }),
      })),
    [locale, t, provinceWords],
  );
}

export function FundingChecker({
  sources,
  askUsHref,
}: {
  sources: FundingSourceLinks;
  /* "Request a call", or null while the appointment page has no reason for it. */
  askUsHref: string | null;
}) {
  const funding = useMessages().DiabetesCare.funding;
  const locale = useLocale();
  const t = useTranslations('DiabetesCare.ui.fundingChecker');
  const r = useTranslations('DiabetesCare.ui.fundingResults');
  const page = useTranslations('DiabetesCare.ui.fundingPage');
  const [input, setInput] = useState<CheckerInput>(EMPTY_INPUT);
  const provinceOptions = useProvinceOptions();
  const provinceWords = useProvinceWords();
  const phones = useProgramPhones();

  const programWords: Record<string, ProgramWords | undefined> = funding.programs;
  const groupLabels: Record<string, string> = funding.groups;
  const privateFirst: Record<string, string> = funding.privateFirst;
  const typeLabels: Record<string, string> = funding.options.type;
  const therapyLabels: Record<string, string> = funding.options.therapy;
  const ageLabels: Record<string, string> = funding.options.age;

  const yesNoOptions: Array<{ value: YesNoUnsure; label: string }> = [
    { value: 'yes', label: t('yes') },
    { value: 'no', label: t('no') },
    { value: 'unsure', label: t('notSure') },
  ];

  const resultSources: ResultSources = {
    program: (meta) => programLink(sources, meta),
    comparisons: sources['dc-comparisons-by-province'],
    agreements: sources['hc-pharmacare-bilateral-agreements'],
    source: (id) => sources[id],
  };

  const results = buildResults(
    input,
    programWords,
    {
      groupLabel: (group) => groupLabels[group] ?? group,
      consideringPump: (title) => r('consideringPump', { title }),
      type1Only: r('type1Only'),
      noConfirmedTitle: (group, code) => r('noConfirmedTitle', { group, ...provinceWords(code) }),
      noConfirmedBody: (code) => r('noConfirmedBody', provinceWords(code)),
      noConfirmedLink: r('noConfirmedLink'),
      noneFitTitle: (group, code) => r('noneFitTitle', { group, ...provinceWords(code) }),
      noneFitBody: (code) => r('noneFitBody', provinceWords(code)),
      cgmInsulinOnlyTitle: r('cgmInsulinOnlyTitle'),
      cgmInsulinOnlyBody: r('cgmInsulinOnlyBody'),
      pumpInsulinOnlyTitle: r('pumpInsulinOnlyTitle'),
      pumpInsulinOnlyBody: r('pumpInsulinOnlyBody'),
      vacNotType1Title: r('vacNotType1Title'),
      vacNotType1Body: r('vacNotType1Body'),
      notSignedTitle: (code) => r('notSignedTitle', provinceWords(code)),
      notSignedBody: r('notSignedBody'),
      privateFirstTitle: r('privateFirstTitle'),
      privateFirstBody: (province) => privateFirst[province] ?? '',
      privateFirstGenericTitle: r('privateFirstGenericTitle'),
      privateFirstGenericBody: r('privateFirstGenericBody'),
      dtcTitle: page('dtcHeading'),
      dtcType1Body: r('dtcType1Body'),
      dtcInsulinBody: r('dtcInsulinBody'),
      dtcOtherBody: r('dtcOtherBody'),
      quebecTitle: funding.liivv.quebecTitle,
      quebecBody: funding.liivv.quebecBody,
      territoryTitle: funding.liivv.territoryTitle,
      territoryBody: funding.liivv.territoryBody,
      askUsTitle: funding.liivv.askUsTitle,
      askUsBody: funding.liivv.askUsBody,
      askUsCta: funding.liivv.askUsCta,
      askUsHref,
      phones,
    },
    resultSources,
    locale,
  );

  const ready = input.province !== '';
  const progress = checkerProgress(input);

  return (
    <div className="oc-fund-checker">
      <form
        aria-label={t('formLabel')}
        className="oc-fund-form"
        onSubmit={(event) => event.preventDefault()}
      >
        {/*
         * One tap per province or territory, like every other question here
         * (owner note 3, 2026-10-07): native radios, so the arrow keys move
         * between them and the group is announced with its question.
         */}
        <RadioRow
          hint={t('provinceHint')}
          legend={t('provinceLabel')}
          name="province"
          onChange={(next) => setInput((prev) => ({ ...prev, province: next }))}
          options={provinceOptions}
          value={input.province}
        />

        <RadioRow
          hint={t('typeHint')}
          legend={t('typeLegend')}
          name="type"
          onChange={(next) => setInput((prev) => ({ ...prev, type: next }))}
          options={DIABETES_TYPES.map((value) => ({ value, label: typeLabels[value] ?? value }))}
          value={input.type}
        />

        <RadioRow
          hint={t('therapyHint')}
          legend={t('therapyLegend')}
          name="therapy"
          onChange={(next) => setInput((prev) => ({ ...prev, therapy: next }))}
          options={THERAPIES.map((value) => ({ value, label: therapyLabels[value] ?? value }))}
          value={input.therapy}
        />

        <RadioRow
          hint={t('ageHint')}
          legend={t('ageLegend')}
          name="age"
          onChange={(next) => setInput((prev) => ({ ...prev, age: next }))}
          options={AGE_BANDS.map((value) => ({ value, label: ageLabels[value] ?? value }))}
          value={input.age}
        />

        <RadioRow
          hint={t('indigenousHint')}
          legend={t('indigenousLegend')}
          name="indigenous"
          onChange={(next) => setInput((prev) => ({ ...prev, indigenous: next }))}
          options={yesNoOptions}
          value={input.indigenous}
        />

        <RadioRow
          hint={t('veteranHint')}
          legend={t('veteranLegend')}
          name="veteran"
          onChange={(next) => setInput((prev) => ({ ...prev, veteran: next }))}
          options={yesNoOptions}
          value={input.veteran}
        />

        <RadioRow
          hint={t('privateHint')}
          legend={t('privateLegend')}
          name="privateInsurance"
          onChange={(next) => setInput((prev) => ({ ...prev, privateInsurance: next }))}
          options={yesNoOptions}
          value={input.privateInsurance}
        />

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
              groups={groupCards(
                results,
                (group) => (isResultGroup(group) ? groupLabels[group] : undefined),
                /*
                 * Owner answer A6 ("We support all provincial pump programs"):
                 * in a province only, with Liivv Now, Pay Later as Liivv's own
                 * option, separate from any program (A5). The territories'
                 * pump routes are not provincial programs (NWT has none on its
                 * list; Nunavut's is held), so their pump group has no intro.
                 */
                (group) =>
                  group === 'pump' && !isTerritory(input.province)
                    ? [
                        r('pumpIntro'),
                        ...(PAY_LATER.enabled ? [r('pumpPayLater', { name: PAY_LATER.name })] : []),
                      ].join(' ')
                    : undefined,
              )}
              phonesLabel={t('phone.label')}
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
  const t = useTranslations('DiabetesCare.ui.fundingChecker');
  const r = useTranslations('DiabetesCare.ui.fundingResults');
  const provinceOptions = useProvinceOptions();
  const provinceWords = useProvinceWords();
  const phones = useProgramPhones();
  const comparisons = sources['dc-comparisons-by-province'];

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
                          <PhoneList label={t('phone.label')} phones={numbers} />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p>
                  {r('noConfirmedBody', provinceWords(province.value))}
                  {comparisons ? (
                    <>
                      {' '}
                      <a href={comparisons.href} rel="noopener noreferrer" target="_blank">
                        {r('noConfirmedLink')} ↗
                      </a>
                    </>
                  ) : null}
                </p>
              )}
            </section>
          );
        })}
      </div>
      <p className="oc-fund-caveat">{t('caveat')}</p>
    </>
  );
}
