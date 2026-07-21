'use client';

import { clsx } from 'clsx';
import { useId, useMemo, useState, type CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';

import {
  buildResults,
  isCheckerReady,
  PROVINCE_OPTIONS,
  type AgeGroup,
  type CheckerInput,
  type DiabetesType,
  type ProvinceCode,
  type YesNoNa,
  type YesNoUnsure,
} from './data';

/** CSS variables consumed by the shared diabetes-care section chrome. */
type ShopifyThemeStyle = CSSProperties & Record<string, string | number | undefined>;

const SECTION_ID = 'diabetes-care-financial-checker';
const SECTION_CSS =
  `#${SECTION_ID}{--section-padding-top:56px;--section-padding-bottom:56px}` +
  `@media screen and (max-width:767px){#${SECTION_ID}{--section-padding-top:36px;--section-padding-bottom:40px}}`;

const TYPE_OPTIONS: { value: DiabetesType; label: string }[] = [
  { value: 't1', label: 'Type 1' },
  { value: 't2', label: 'Type 2' },
  { value: 'gestational', label: 'Gestational' },
  { value: 'prediabetes', label: 'Prediabetes' },
  { value: 'unsure', label: 'Not sure yet' },
];

const INSULIN_OPTIONS: { value: YesNoUnsure; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'unsure', label: 'Not sure' },
];

const AGE_OPTIONS: { value: AgeGroup; label: string }[] = [
  { value: 'under18', label: 'Under 18' },
  { value: '18to25', label: '18–25' },
  { value: '26to64', label: '26–64' },
  { value: '65plus', label: '65+' },
];

const INDIGENOUS_OPTIONS: { value: YesNoNa; label: string }[] = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
  { value: 'na', label: 'Prefer not to say' },
];

const EMPTY_INPUT: CheckerInput = {
  province: '',
  type: '',
  insulin: '',
  age: '',
  indigenous: '',
};

export interface DiabetesCareFinancialCheckerProps {
  className?: string;
  background?: SectionBackgroundProps;
  roundedTop?: boolean;
  heading?: HeadingWithHighlightProps;
  intro?: string;
  disclaimer?: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block text-sm font-medium text-[#312F2F]">
      <span className="mb-1 block">{label}</span>
      <select
        className="w-full rounded-lg border border-black/15 bg-white px-3 py-2.5 text-base text-[#312F2F] shadow-sm outline-none focus:border-[#8EA58D] focus:ring-2 focus:ring-[#8EA58D]/40"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Select…</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DiabetesCareFinancialChecker({
  className,
  background,
  roundedTop = true,
  heading,
  intro,
  disclaimer,
}: DiabetesCareFinancialCheckerProps) {
  const [input, setInput] = useState<CheckerInput>(EMPTY_INPUT);
  const [submitted, setSubmitted] = useState(false);

  const results = useMemo(() => (submitted ? buildResults(input) : []), [submitted, input]);
  const ready = isCheckerReady(input);
  const typography = resolveHeadingTypography(heading);
  const headingId = useId();
  const resultsId = useId();

  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: SECTION_ID,
    sectionCss: SECTION_CSS,
    background,
  });
  const sectionVars: ShopifyThemeStyle = { ...sectionStyle };

  const headingStyle: CSSProperties = {
    ...(typography.color != null ? { color: typography.color } : {}),
    ...(typography.fontSize != null ? { fontSize: typography.fontSize } : {}),
  };

  function update<K extends keyof CheckerInput>(key: K, value: CheckerInput[K]) {
    setInput((previous) => ({ ...previous, [key]: value }));
    setSubmitted(false);
  }

  return (
    <div
      className={clsx('diabetes-care-financial-checker', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
    >
      <div className="shopify-section" id={SECTION_ID} style={sectionVars}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding relative', roundedTop && 'section--rounded')}>
          <div className="page-width relative mx-auto max-w-3xl px-4 sm:px-5">
            {typography.text.length > 0 ? (
              <h2
                className="heading title-lg text-center font-bold leading-tight tracking-tight"
                id={headingId}
                style={headingStyle}
              >
                {typography.text}
              </h2>
            ) : null}

            {intro != null && intro.length > 0 ? (
              <p className="mx-auto mt-3 max-w-2xl text-center text-base leading-relaxed text-[#312F2F]/80">
                {intro}
              </p>
            ) : null}

            <form
              className="mt-8 grid gap-4 rounded-2xl bg-white/70 p-5 shadow-sm backdrop-blur sm:grid-cols-2 sm:p-6"
              onSubmit={(event) => {
                event.preventDefault();
                setSubmitted(true);
              }}
            >
              <SelectField
                label="Province or territory"
                onChange={(value) => update('province', value as ProvinceCode | '')}
                options={PROVINCE_OPTIONS}
                value={input.province}
              />
              <SelectField
                label="Type of diabetes"
                onChange={(value) => update('type', value as DiabetesType | '')}
                options={TYPE_OPTIONS}
                value={input.type}
              />
              <SelectField
                label="Do you use insulin?"
                onChange={(value) => update('insulin', value as YesNoUnsure | '')}
                options={INSULIN_OPTIONS}
                value={input.insulin}
              />
              <SelectField
                label="Age group"
                onChange={(value) => update('age', value as AgeGroup | '')}
                options={AGE_OPTIONS}
                value={input.age}
              />
              <SelectField
                label="First Nations or Inuit?"
                onChange={(value) => update('indigenous', value as YesNoNa | '')}
                options={INDIGENOUS_OPTIONS}
                value={input.indigenous}
              />

              <div className="flex items-end sm:col-span-2">
                <button
                  aria-controls={resultsId}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#312F2F] px-6 py-3 text-base font-semibold text-white transition hover:bg-[#4a4646] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                  disabled={!ready}
                  type="submit"
                >
                  Show my options
                </button>
              </div>
            </form>

            <div aria-live="polite" className="mt-8" id={resultsId}>
              {submitted && results.length > 0 ? (
                <>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {results.map((card) => (
                      <li
                        className="flex flex-col rounded-xl border border-black/10 bg-white p-5 shadow-sm"
                        key={card.id}
                      >
                        <h3 className="heading text-lg font-bold tracking-tight text-[#312F2F]">
                          {card.title}
                        </h3>
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-[#312F2F]/85">
                          {card.body}
                        </p>
                        <a
                          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#5f7a63] underline-offset-4 hover:underline"
                          href={card.linkUrl}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {card.linkLabel}
                          <span aria-hidden="true">→</span>
                        </a>
                      </li>
                    ))}
                  </ul>

                  {disclaimer != null && disclaimer.length > 0 ? (
                    <p className="mt-6 text-xs leading-relaxed text-[#312F2F]/70">{disclaimer}</p>
                  ) : null}
                </>
              ) : submitted ? (
                <p className="text-center text-[#312F2F]/70">
                  Add your province and diabetes type above and we&rsquo;ll show what you may qualify
                  for.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
