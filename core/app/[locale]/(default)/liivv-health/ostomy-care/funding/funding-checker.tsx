'use client';

import { useLocale, useMessages, useTranslations } from 'next-intl';
import { useId, useMemo, useState } from 'react';

import {
  buildPrograms,
  buildProvinceOptions,
  buildResults,
  type CheckerInput,
  isCheckerReady,
  type ProvinceCode,
  type YesNoUnsure,
} from './funding-data';

type Permanence = CheckerInput['permanence'];

const EMPTY_INPUT: CheckerInput = {
  province: '',
  permanence: '',
  indigenous: '',
  senior: '',
  otherCoverage: '',
};

/*
 * Generic so each call site keeps its own value type — this is what lets the
 * checker avoid casting `string` back to the union on every change handler.
 */
function RadioRow<T extends string>({
  legend,
  hint,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  name: string;
  options: Array<{ value: T; label: string }>;
  value: T | '';
  onChange: (next: T) => void;
}) {
  return (
    <fieldset className="oc-fund-field">
      <legend>{legend}</legend>
      {hint ? <p className="oc-fund-hint">{hint}</p> : null}
      <div className="oc-fund-choices">
        {options.map((option) => (
          <label
            className={value === option.value ? 'oc-fund-choice is-on' : 'oc-fund-choice'}
            key={option.value}
          >
            <input
              checked={value === option.value}
              name={name}
              onChange={() => onChange(option.value)}
              type="radio"
              value={option.value}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FundingChecker() {
  const messages = useMessages();
  const locale = useLocale();
  const t = useTranslations('OstomyCare.ui.checker');
  const r = useTranslations('OstomyCare.ui.results');
  const [input, setInput] = useState<CheckerInput>(EMPTY_INPUT);
  const provinceId = useId();

  const funding = messages.OstomyCare.funding;

  const programs = useMemo(() => buildPrograms(funding, locale), [funding, locale]);
  const provinceOptions = useMemo(() => buildProvinceOptions(funding), [funding]);

  /* Narrows a raw select value without an assertion. */
  const isProvinceCode = (value: string): value is ProvinceCode =>
    provinceOptions.some((option) => option.value === value);

  const yesNoOptions: Array<{ value: YesNoUnsure; label: string }> = [
    { value: 'yes', label: t('yes') },
    { value: 'no', label: t('no') },
    { value: 'unsure', label: t('notSure') },
  ];

  const permanenceOptions: Array<{ value: Exclude<Permanence, ''>; label: string }> = [
    { value: 'permanent', label: t('permanent') },
    { value: 'temporary', label: t('temporary') },
    { value: 'unsure', label: t('notSure') },
  ];

  const results = buildResults(input, programs, funding.models, {
    nihbTitle: r('nihbTitle'),
    nihbBody: r('nihbBody'),
    nihbLink: r('nihbLink'),
    noProgramTitle: (province: string) => r('noProgramTitle', { province }),
    gatekeeperTitle: r('gatekeeperTitle'),
    deadlinesTitle: r('deadlinesTitle'),
    lastResortTitle: r('lastResortTitle'),
    lastResortBody: r('lastResortBody'),
    dtcTitle: r('dtcTitle'),
    dtcBody: r('dtcBody'),
    dtcLink: r('dtcLink'),
    expensesTitle: r('expensesTitle'),
    expensesBody: r('expensesBody'),
    expensesLink: r('expensesLink'),
  });

  const ready = isCheckerReady(input);

  return (
    <div className="oc-fund-checker">
      <form
        aria-label={t('formLabel')}
        className="oc-fund-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="oc-fund-field">
          <label htmlFor={provinceId}>{t('provinceLabel')}</label>
          <p className="oc-fund-hint">{t('provinceHint')}</p>
          <select
            id={provinceId}
            onChange={(event) => {
              const next = event.target.value;

              setInput((prev) => ({ ...prev, province: isProvinceCode(next) ? next : '' }));
            }}
            value={input.province}
          >
            <option value="">{t('provincePlaceholder')}</option>
            {provinceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <RadioRow
          legend={t('permanenceLegend')}
          name="permanence"
          onChange={(next) => setInput((prev) => ({ ...prev, permanence: next }))}
          options={permanenceOptions}
          value={input.permanence}
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
          hint={t('seniorHint')}
          legend={t('seniorLegend')}
          name="senior"
          onChange={(next) => setInput((prev) => ({ ...prev, senior: next }))}
          options={yesNoOptions}
          value={input.senior}
        />

        <RadioRow
          hint={t('otherCoverageHint')}
          legend={t('otherCoverageLegend')}
          name="otherCoverage"
          onChange={(next) => setInput((prev) => ({ ...prev, otherCoverage: next }))}
          options={yesNoOptions}
          value={input.otherCoverage}
        />

        {ready ? (
          <button className="oc-fund-reset" onClick={() => setInput(EMPTY_INPUT)} type="button">
            {t('startOver')}
          </button>
        ) : null}
      </form>

      <div aria-live="polite" className="oc-fund-results">
        {ready ? (
          <ul className="oc-fund-cards">
            {results.map((card) => (
              <li className={`oc-fund-card is-${card.tone}`} key={card.id}>
                <h3>{card.title}</h3>
                <p>{card.body}</p>
                <a href={card.linkUrl} rel="noopener noreferrer" target="_blank">
                  {card.linkLabel} ↗
                </a>
                {card.verifiedOn ? (
                  <p className="oc-fund-verified">{t('verifiedOn', { date: card.verifiedOn })}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="oc-fund-empty">{t('empty')}</p>
        )}

        {ready ? <p className="oc-fund-caveat">{t('caveat')}</p> : null}
      </div>
    </div>
  );
}
