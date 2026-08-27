/*
 * Canadian ostomy funding — types and eligibility logic.
 *
 * There is no national ostomy program. The amount, the coverage model, and who
 * signs off all change at the provincial border, which is exactly why this page
 * needs to exist: no Canadian retailer or patient org has assembled it properly.
 *
 * Prose lives in messages/*.json under `OstomyCare.funding`, so it can be
 * translated with the rest of the Liivv copy. Everything that is not
 * language-dependent — coverage model, official URL, verification date — lives
 * in ./funding-meta.ts.
 *
 * HOW THIS STAYS HONEST
 *
 * `hasAmount` in the meta records whether a jurisdiction publishes a figure at
 * all. Yukon and Nunavut do not. Numbers circulate for both on patient-org and
 * vendor sites; they are not government rates, so the message tree carries no
 * `amount` for them and the UI links out instead. A missing figure is honest;
 * a stale figure costs someone money.
 *
 * `verifiedOn` is the date the entry was last checked against `officialUrl` and
 * is rendered on the page. Re-check annually — most programs reset each fiscal
 * or program year.
 */

import { PROGRAM_META } from './funding-meta';

export type ProvinceCode =
  | 'BC'
  | 'AB'
  | 'SK'
  | 'MB'
  | 'ON'
  | 'QC'
  | 'NB'
  | 'NS'
  | 'PE'
  | 'NL'
  | 'YT'
  | 'NT'
  | 'NU';

/*
 * The four ways provinces actually pay. Knowing which one applies is the single
 * most useful thing a person can learn here — confusing them is where people
 * lose money.
 */
export type CoverageModel =
  | 'flat-grant'
  | 'cost-share'
  | 'supplies-in-kind'
  | 'categorical'
  | 'none';

export type YesNoUnsure = 'yes' | 'no' | 'unsure';

export interface ProgramFacts {
  name: string;
  programName: string;
  model: CoverageModel;
  /** Empty when the official page publishes no figure. */
  amount: string;
  howToApply: string;
  gatekeeper: string;
  deadlines?: string;
  officialUrl: string;
  officialLabel: string;
  notes?: string;
  /** ISO date (YYYY-MM-DD) this entry was last checked against officialUrl. */
  verifiedOn: string;
}

export interface CheckerInput {
  province: ProvinceCode | '';
  /** Quebec pays different amounts for permanent vs temporary. */
  permanence: 'permanent' | 'temporary' | 'unsure' | '';
  /** First Nations and Inuit route through NIHB instead of the provincial program. */
  indigenous: YesNoUnsure | '';
  /** Several programs are seniors-only or seniors-enhanced. */
  senior: YesNoUnsure | '';
  /** Territories are payer of last resort; some provinces exclude you outright. */
  otherCoverage: YesNoUnsure | '';
}

export interface ResultCard {
  id: string;
  title: string;
  body: string;
  linkLabel: string;
  linkUrl: string;
  verifiedOn?: string;
  tone: 'primary' | 'supporting' | 'caution';
}

export const FEDERAL_LINKS = {
  dtc: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/eliminating.html',
  t2201: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2201.html',
  nihb: 'https://www.sac-isc.gc.ca/eng/1579620079031/1579620259238',
  medicalExpenses:
    'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/lines-33099-33199-eligible-medical-expenses-you-claim-tax-return.html',
  rdsp: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-disability-savings-plan-rdsp.html',
} as const;

/** Territories that will not pay until private coverage is exhausted. */
const PAYER_OF_LAST_RESORT: ProvinceCode[] = ['YT', 'NT', 'NU'];

export const PROVINCE_CODES: ProvinceCode[] = [
  'BC',
  'AB',
  'SK',
  'MB',
  'ON',
  'QC',
  'NB',
  'NS',
  'PE',
  'NL',
  'YT',
  'NT',
  'NU',
];

/* ---------------------------------------------------------------------------
 * Message shapes, mirroring messages/*.json under OstomyCare.funding.
 * ------------------------------------------------------------------------- */

/*
 * Note what is absent: programName and officialLabel. Those are legal proper
 * nouns and live in funding-meta.ts, out of reach of any translation pass.
 */
interface ProgramMessages {
  name: string;
  amount?: string;
  howToApply: string;
  gatekeeper: string;
  deadlines?: string;
  notes?: string;
}

export interface FundingMessages {
  models: Record<string, { label: string; blurb: string }>;
  provinceLabels: Record<string, string>;
  programs: Record<string, ProgramMessages>;
}

/** Copy for the generated result cards, supplied by the calling component. */
export interface ResultCopy {
  nihbTitle: string;
  nihbBody: string;
  nihbLink: string;
  noProgramTitle: (province: string) => string;
  gatekeeperTitle: string;
  deadlinesTitle: string;
  lastResortTitle: string;
  lastResortBody: string;
  dtcTitle: string;
  dtcBody: string;
  dtcLink: string;
  expensesTitle: string;
  expensesBody: string;
  expensesLink: string;
}

/*
 * Compose the funding facts from translated prose plus non-translatable meta.
 * Pass the locale so official French program names are used where a jurisdiction
 * actually publishes one — never a generated translation of the legal name.
 */
export function buildPrograms(
  messages: FundingMessages,
  locale: string,
): Partial<Record<ProvinceCode, ProgramFacts>> {
  const out: Partial<Record<ProvinceCode, ProgramFacts>> = {};

  PROVINCE_CODES.forEach((code) => {
    const meta = PROGRAM_META[code];
    const prose = messages.programs[code];

    if (!prose) return;

    out[code] = {
      name: prose.name,
      programName: locale === 'fr' && meta.programNameFr ? meta.programNameFr : meta.programName,
      model: meta.model,
      // Guard both sides: the meta records whether a figure exists at all, so a
      // translation cannot introduce an amount for a jurisdiction that has none.
      amount: meta.hasAmount ? (prose.amount ?? '') : '',
      howToApply: prose.howToApply,
      gatekeeper: prose.gatekeeper,
      ...(prose.deadlines === undefined ? {} : { deadlines: prose.deadlines }),
      officialUrl: meta.officialUrl,
      officialLabel: meta.officialLabel,
      ...(prose.notes === undefined ? {} : { notes: prose.notes }),
      verifiedOn: meta.verifiedOn,
    };
  });

  return out;
}

export function buildProvinceOptions(
  messages: FundingMessages,
): Array<{ value: ProvinceCode; label: string }> {
  return PROVINCE_CODES.map((code) => ({
    value: code,
    label: messages.provinceLabels[code] ?? code,
  })).sort((a, b) => a.label.localeCompare(b.label));
}

/* True once there is enough input to say anything useful. */
export function isCheckerReady(input: CheckerInput): boolean {
  return input.province !== '';
}

/*
 * Build the personalized list of routes worth pursuing.
 * Pure function with no side effects, so it is straightforward to test — though
 * note that core has no test script today, so turbo run test skips this package
 * entirely (the diabetes checker data.test.ts next door has never run either).
 */
export function buildResults(
  input: CheckerInput,
  programs: Partial<Record<ProvinceCode, ProgramFacts>>,
  models: Record<string, { label: string; blurb: string }>,
  copy: ResultCopy,
): ResultCard[] {
  const cards: ResultCard[] = [];

  if (input.province === '') return cards;

  const program = programs[input.province];

  // First Nations and Inuit route through NIHB *instead of* the provincial
  // program, so this is surfaced first rather than as an afterthought.
  if (input.indigenous === 'yes') {
    cards.push({
      id: 'nihb',
      title: copy.nihbTitle,
      body: copy.nihbBody,
      linkLabel: copy.nihbLink,
      linkUrl: FEDERAL_LINKS.nihb,
      tone: 'primary',
    });
  }

  if (program) {
    cards.push({
      id: 'provincial',
      title: program.programName || copy.noProgramTitle(program.name),
      body: [models[program.model]?.blurb, program.amount, program.howToApply]
        .filter(Boolean)
        .join(' '),
      linkLabel: program.officialLabel,
      linkUrl: program.officialUrl,
      verifiedOn: program.verifiedOn,
      tone: 'primary',
    });

    cards.push({
      id: 'gatekeeper',
      title: copy.gatekeeperTitle,
      body: program.gatekeeper,
      linkLabel: program.officialLabel,
      linkUrl: program.officialUrl,
      tone: 'supporting',
    });

    if (program.deadlines) {
      cards.push({
        id: 'deadlines',
        title: copy.deadlinesTitle,
        body: program.deadlines,
        linkLabel: program.officialLabel,
        linkUrl: program.officialUrl,
        tone: 'caution',
      });
    }

    if (input.otherCoverage === 'yes' && PAYER_OF_LAST_RESORT.includes(input.province)) {
      cards.push({
        id: 'last-resort',
        title: copy.lastResortTitle,
        body: copy.lastResortBody,
        linkLabel: program.officialLabel,
        linkUrl: program.officialUrl,
        tone: 'caution',
      });
    }
  }

  cards.push({
    id: 'dtc',
    title: copy.dtcTitle,
    body: copy.dtcBody,
    linkLabel: copy.dtcLink,
    linkUrl: FEDERAL_LINKS.dtc,
    tone: 'supporting',
  });

  cards.push({
    id: 'medical-expenses',
    title: copy.expensesTitle,
    body: copy.expensesBody,
    linkLabel: copy.expensesLink,
    linkUrl: FEDERAL_LINKS.medicalExpenses,
    tone: 'supporting',
  });

  return cards;
}
