'use client';

import { useId, useMemo, useState } from 'react';

import {
  buildResults,
  type CheckerInput,
  isCheckerReady,
  PROVINCE_OPTIONS,
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

const PERMANENCE_OPTIONS: Array<{ value: Exclude<Permanence, ''>; label: string }> = [
  { value: 'permanent', label: 'Permanent' },
  { value: 'temporary', label: 'Temporary' },
  { value: 'unsure', label: 'Not sure' },
];

const YES_NO_OPTIONS: Array<{ value: YesNoUnsure; label: string }> = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

/* Narrows a raw <select> value without an assertion. */
function isProvinceCode(value: string): value is ProvinceCode {
  return PROVINCE_OPTIONS.some((option) => option.value === value);
}

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
  const [input, setInput] = useState<CheckerInput>(EMPTY_INPUT);
  const provinceId = useId();

  const results = useMemo(() => buildResults(input), [input]);
  const ready = isCheckerReady(input);

  return (
    <div className="oc-fund-checker">
      <form
        aria-label="Find what your province covers"
        className="oc-fund-form"
        onSubmit={(event) => event.preventDefault()}
      >
        <div className="oc-fund-field">
          <label htmlFor={provinceId}>Where do you live?</label>
          <p className="oc-fund-hint">
            Coverage changes completely at the provincial border, so this is the one answer we
            really need.
          </p>
          <select
            id={provinceId}
            onChange={(event) => {
              const next = event.target.value;

              setInput((prev) => ({ ...prev, province: isProvinceCode(next) ? next : '' }));
            }}
            value={input.province}
          >
            <option value="">Select a province or territory</option>
            {PROVINCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <RadioRow
          legend="Is your ostomy permanent or temporary?"
          name="permanence"
          onChange={(next) => setInput((prev) => ({ ...prev, permanence: next }))}
          options={PERMANENCE_OPTIONS}
          value={input.permanence}
        />

        <RadioRow
          hint="First Nations and Inuit are covered federally through NIHB instead of the provincial program."
          legend="Are you First Nations or Inuit?"
          name="indigenous"
          onChange={(next) => setInput((prev) => ({ ...prev, indigenous: next }))}
          options={YES_NO_OPTIONS}
          value={input.indigenous}
        />

        <RadioRow
          hint="Several programs are seniors-only, or cover more once you turn 65."
          legend="Are you 65 or older?"
          name="senior"
          onChange={(next) => setInput((prev) => ({ ...prev, senior: next }))}
          options={YES_NO_OPTIONS}
          value={input.senior}
        />

        <RadioRow
          hint="Some programs will not pay until private coverage is used up — and a few exclude you entirely."
          legend="Do you have workplace or private insurance?"
          name="otherCoverage"
          onChange={(next) => setInput((prev) => ({ ...prev, otherCoverage: next }))}
          options={YES_NO_OPTIONS}
          value={input.otherCoverage}
        />

        {ready ? (
          <button className="oc-fund-reset" onClick={() => setInput(EMPTY_INPUT)} type="button">
            Start over
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
                  <p className="oc-fund-verified">
                    Checked against the official page on {card.verifiedOn}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="oc-fund-empty">
            Choose where you live and we will show the routes worth pursuing, with a link to the
            official page for each one.
          </p>
        )}

        {ready ? (
          <p className="oc-fund-caveat">
            This is a starting point, not a decision. Programs change their amounts and rules every
            year — always confirm on the official page before you plan around a number, and your
            NSWOC can often tell you what actually gets approved locally.
          </p>
        ) : null}
      </div>
    </div>
  );
}
