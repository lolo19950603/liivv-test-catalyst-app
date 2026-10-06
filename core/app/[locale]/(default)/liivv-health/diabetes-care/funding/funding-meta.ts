/*
 * =============================================================================
 * DIABETES CARE FUNDING & COVERAGE — STRUCTURE
 * =============================================================================
 * Everything on /liivv-health/diabetes-care/funding apart from the words: the
 * programs, the official page each one rests on, the date it was last checked,
 * whether the check was only partial, who it applies to, the program's phone
 * numbers, the phrases a scheduled recheck looks for, and where Liivv bills a
 * plan directly. Prose lives in messages/*.json under `DiabetesCare.funding`
 * and `DiabetesCare.ui.funding{Page,Checker,Results}`.
 *
 * From the verified copy record (funding.md), brought up to date on
 * 2026-10-06 with the owner's answers (A5, A6, B7, B13, B20, B22, B23, B25)
 * and the re-fetched official pages of that day (the verifier's corrections
 * winning over the research where they differ). Every program cites register
 * entries only (../chapters/sources-meta.ts), and its first source is the link
 * its card shows. A program whose only source is not registered is not here:
 * its wording waits in the review pack (core/scripts/content-review/
 * diabetes-care.funding.mjs, "Held items"), and its group falls back to the
 * "we're still checking" card.
 *
 * Program names are legal proper nouns and live here, never in the message
 * tree, so no translation pass can rename one. An official French name goes in
 * `programNameFr`, and only where the government prints one on its own site
 * (owner answer B25); the descriptive part after a dash follows the program's
 * own French page.
 *
 * How Liivv bills (owner answers A5, A6, B13, 2026-10-06): the Liivv pharmacy
 * in each province bills that province's drug plan directly for what the plan
 * covers (DIRECT_BILLING). Quebec's public plan does not pay for drugs bought
 * outside Quebec, so Quebec orders are paid for privately. No federal program
 * or private insurer is listed as billed directly: that is not confirmed.
 * "Liivv Now, Pay Later" is on for insulin pump supplies (PAY_LATER).
 *
 * No value imports and erasable TypeScript only: the content-review export and
 * core/scripts/check-funding-sources.mjs load this file directly under Node's
 * type stripping, as they load chapters-meta.ts and landing-meta.ts.
 * =============================================================================
 */

import type { SourceId } from '../chapters/sources-meta';

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

export type Jurisdiction = ProvinceCode | 'CA';

/* 'other' is "another type, or not sure". */
export type DiabetesType = 'type1' | 'type2' | 'gestational' | 'other';
export type Therapy = 'none' | 'nonInsulin' | 'insulinInjections' | 'pump';
/* One array, so a fifth band can be added without touching the rules. */
export type AgeBand = 'under18' | '18to24' | '25to64' | '65plus';
export type YesNoUnsure = 'yes' | 'no' | 'unsure';

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

/* The checker's answer options, in the order they are offered. */
export const DIABETES_TYPES: DiabetesType[] = ['type1', 'type2', 'gestational', 'other'];
export const THERAPIES: Therapy[] = ['none', 'nonInsulin', 'insulinInjections', 'pump'];
export const AGE_BANDS: AgeBand[] = ['under18', '18to24', '25to64', '65plus'];

/* The owner's result order. Index = render order (keys `funding.groups.<group>`). */
export const RESULT_GROUPS = [
  'nihb',
  'vac',
  'pump',
  'cgm',
  'supplies',
  'pharmacare',
  'privateFirst',
  'dtcRdsp',
] as const;

export type ResultGroup = (typeof RESULT_GROUPS)[number];

/*
 * How the PROGRAM pays, from the program's own page — never how Liivv bills.
 *   paid-to-you      a set amount goes to the person (ON ADP pump supplies)
 *   receipts         the person sends receipts (ON MFHP by mail; QC pump
 *                    supplies to the CHU)
 *   at-the-pharmacy  used at the pharmacy counter (MB MEPP, BC Plan NP, ON
 *                    ODB, NIHB, the NS sensor program)
 *   vendor           the program pays the vendor or maker (NB IPP; BC pumps;
 *                    MB and AB pumps; the PEI co-pay goes to the pump company)
 *   tax              a tax credit or savings plan
 *   unconfirmed      the registered page does not say
 * Review only: no page prints it.
 */
export type ProgramPays =
  | 'paid-to-you'
  | 'receipts'
  | 'at-the-pharmacy'
  | 'vendor'
  | 'tax'
  | 'unconfirmed';

export interface AppliesTo {
  /** Omitted = any. */
  types?: DiabetesType[];
  therapies?: Therapy[];
  ages?: AgeBand[];
  /** Shown to a reader on insulin injections as "if you're thinking about a pump". */
  alsoIfConsideringPump?: boolean;
}

/*
 * A program's phone number as its official page prints it (owner answer B22).
 *   phone        an ordinary number
 *   tollFree     printed as toll-free, with no limit
 *   tollFreeIn   printed as toll-free inside the program's own province or
 *                territory only; the card says so
 *   tty          a TTY line
 * `area` is a place name the page prints beside a local number ("Lower
 * Mainland"); `ext` the extensions it gives, any one of which reaches the
 * program. Only numbers re-checked on 2026-10-06 are here.
 */
export interface ProgramPhone {
  number: string;
  kind: 'phone' | 'tollFree' | 'tollFreeIn' | 'tty';
  area?: string;
  ext?: string[];
}

/* The numbers of one office, and the registered page that prints them. */
export interface ProgramPhoneGroup {
  /** The office as the page names it: a proper noun, never translated. */
  office?: string;
  /** Its French name, only where the government prints one. */
  officeFr?: string;
  source: SourceId;
  numbers: ProgramPhone[];
}

/*
 * A short phrase copied exactly from an official page, which the scheduled
 * recheck (core/scripts/check-funding-sources.mjs) looks for. A plain string is
 * looked for on the program's first source; otherwise on the page named, or
 * its French page (`fr`).
 */
export type CheckPhrase = string | { source: SourceId; phrase: string; fr?: boolean };

export interface ProgramMeta {
  id: string;
  jurisdiction: Jurisdiction;
  groups: ResultGroup[];
  /** Legal program name. Never translated. */
  programName: string;
  /** Official French name, only where the government prints one. Empty otherwise (B25). */
  programNameFr: string;
  /** Registered SourceIds; the first one is the card's link. */
  sources: [SourceId, ...SourceId[]];
  pays: ProgramPays;
  appliesTo: AppliesTo;
  /** ISO date the row was last checked against its sources. Rendered on every card. */
  verifiedOn: string;
  /** The check marked this row partly confirmed: the card says to check with the program. */
  confirm: boolean;
  /** Which keys exist under `funding.programs.<id>`; the export checks both ways. */
  has: { covered: true; who: boolean; howToApply: boolean; notes: boolean };
  /** The program's phone numbers, rendered on its card as tel: links (B22). */
  phones?: ProgramPhoneGroup[];
  /** What the scheduled recheck looks for on the official pages. At least one. */
  checkPhrases: [CheckPhrase, ...CheckPhrase[]];
}

/* The day every row below was re-checked against its official pages. */
const CHECKED = '2026-10-06';

/*
 * The next scheduled recheck (owner answer B20, "Claude sets a schedule"):
 * core/scripts/check-funding-sources.mjs, run monthly; see
 * docs/diabetes-content/README.md.
 */
export const NEXT_CHECK = '2026-11-01';

/* Who owns the recheck (D-15, answered by B20). Printed in the review pack. */
export const RECHECK_OWNER =
  'Monthly automated recheck (scheduled), reviewed by the Liivv content owner';

/* Phone groups used on more than one card. */
const BC_PHARMACARE_PHONES: ProgramPhoneGroup = {
  office: 'BC PharmaCare',
  source: 'bc-pharmacare-contact',
  numbers: [
    { number: '604-683-7151', kind: 'phone', area: 'Lower Mainland' },
    { number: '1-800-663-7100', kind: 'tollFreeIn' },
  ],
};

const ADP_PHONES: ProgramPhoneGroup = {
  office: 'Assistive Devices Program',
  officeFr: 'Programme d’appareils et accessoires fonctionnels',
  source: 'on-preventing-and-living-with-diabetes',
  numbers: [
    { number: '1-800-268-6021', kind: 'tollFree' },
    { number: '416-327-8804', kind: 'phone', area: 'Toronto' },
  ],
};

const MB_PHARMACARE_PHONES: ProgramPhoneGroup = {
  office: 'Manitoba Pharmacare',
  source: 'mb-pharmacare',
  numbers: [
    { number: '204-786-7141', kind: 'phone' },
    { number: '1-800-297-8099', kind: 'tollFree' },
  ],
};

const ALBERTA_BLUE_CROSS_PHONES: ProgramPhoneGroup = {
  office: 'Alberta Blue Cross',
  source: 'ab-cgm-fact-sheet-2025',
  numbers: [{ number: '1-800-661-6995', kind: 'phone' }],
};

export const PROGRAM_META: ProgramMeta[] = [
  /* ---------- 1 · NIHB ---------- */
  {
    id: 'fed-nihb',
    jurisdiction: 'CA',
    groups: ['nihb'],
    programName: 'Non-Insured Health Benefits (NIHB)',
    programNameFr: 'Programme des services de santé non assurés (SSNA)',
    /*
     * The client page on pharmacy benefits first: it describes and links the
     * Drug Benefit List, NIHB's official list (owner answer B2: link the list,
     * judge no eligibility). The sensor and strip lines are the updates page's.
     */
    sources: ['isc-nihb-pharmacy-benefits', 'isc-nihb-updates', 'isc-nihb-eligibility'],
    pays: 'at-the-pharmacy',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [
      {
        office: 'NIHB Call Centre (Express Scripts Canada), client inquiries',
        /* The French page's heading and line, read 2026-10-06 (full-site review). */
        officeFr:
          'Centre d’appels d’Express Scripts Canada pour le programme des SSNA, ligne de demandes de renseignements pour les clients',
        source: 'isc-nihb-contact',
        numbers: [{ number: '1-888-441-4777', kind: 'tollFree' }],
      },
    ],
    checkPhrases: [
      'generally send in claims to bill the NIHB program directly',
      'when not available through provincial or territorial health insurance',
      { source: 'isc-nihb-updates', phrase: 'FreeStyle Libre 3' },
      { source: 'isc-nihb-updates', phrase: '800 test strips per 100 days' },
      { source: 'isc-nihb-contact', phrase: '1-888-441-4777' },
    ],
  },

  /* ---------- 2 · Veterans Affairs Canada ---------- */
  {
    id: 'fed-vac',
    jurisdiction: 'CA',
    groups: ['vac'],
    programName:
      'Veterans Affairs Canada — continuous glucose monitors (type 1 diabetes), benefit 401140',
    programNameFr:
      'Anciens Combattants Canada — systèmes de surveillance de la glycémie en continu (diabète de type 1), 401140',
    /* The base grid since 2026-10-06 (F-31, E-23); POC 7 names strips and needles (F-27, E-18). */
    sources: ['vac-cgm-type-1', 'vac-poc7-medical-supplies'],
    pays: 'unconfirmed',
    appliesTo: { types: ['type1'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'Veterans Affairs Canada',
        officeFr: 'Anciens Combattants Canada',
        source: 'vac-contact',
        numbers: [{ number: '1-866-522-2122', kind: 'tollFree' }],
      },
    ],
    checkPhrases: [
      '401140',
      '1/5 CY',
      'PRESCRIBER NOT REQUIRED FOR REPLACEMENT DEVICE',
      { source: 'vac-poc7-medical-supplies', phrase: 'diabetic test strips' },
      { source: 'vac-contact', phrase: '1-866-522-2122' },
    ],
  },

  /* ---------- 3 · Pump programs (owner answer A6: every one) ---------- */
  {
    id: 'on-adp-pump',
    jurisdiction: 'ON',
    groups: ['pump'],
    programName: 'Assistive Devices Program — insulin pumps and supplies',
    programNameFr:
      'Programme d’appareils et accessoires fonctionnels (PAAF) — pompes à insuline et fournitures',
    /* One Ontario page since 2026-10-06 (B31): the old ADP pump address redirects to it. */
    sources: ['on-diabetes-equipment-and-supplies'],
    pays: 'paid-to-you',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [ADP_PHONES],
    checkPhrases: [
      '100% of the ADP price of an insulin pump',
      'paid to you in $600 installments every 3 months',
      'We do not consider your income',
      'We do not cover costs to replace a lost pump',
      { source: 'on-preventing-and-living-with-diabetes', phrase: '1-800-268-6021' },
    ],
  },
  {
    id: 'bc-pharmacare-pumps',
    jurisdiction: 'BC',
    groups: ['pump'],
    programName: 'BC PharmaCare — insulin pumps and insulin pump supplies',
    programNameFr: '',
    /*
     * The page for patients first (July 15, 2026), then Special Authority, then
     * the PIN list, which still backs the Tandem supply names (B23).
     */
    sources: ['bc-insulin-pumps', 'bc-sa-insulin-pumps', 'bc-diabetes-pins'],
    /* Pumps: from the maker, on approval; supplies: pharmacies and vendors claim on PharmaNet. */
    pays: 'vendor',
    appliesTo: { therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [BC_PHARMACARE_PHONES],
    checkPhrases: [
      'PharmaCare covers 70% of eligible costs',
      'Special Authority pre-approval is not required for insulin pump supplies',
      'PharmaCare cannot provide retroactive coverage',
      'submit claims on PharmaNet',
      { source: 'bc-sa-insulin-pumps', phrase: 'one insulin pump every five years' },
      { source: 'bc-pharmacare-contact', phrase: '1-800-663-7100' },
    ],
  },
  {
    id: 'ab-iptp',
    jurisdiction: 'AB',
    groups: ['pump'],
    programName: 'Insulin Pump Therapy Program (IPTP)',
    programNameFr: '',
    sources: [
      'ab-specialized-drug-benefits',
      'ab-iptp-eligibility-2023',
      'abc-pharmacy-reference-guide',
    ],
    /* "Coverage under the IPTP is provided on a direct bill basis to pharmacies and/or insulin pump manufacturers only." */
    pays: 'vendor',
    /* Type 1 or type 3c: type 3c answers "Another type, or not sure", which the program takes. */
    appliesTo: { types: ['type1', 'other'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [ALBERTA_BLUE_CROSS_PHONES],
    checkPhrases: [
      'type 1 or type 3c diabetes',
      'Omnipod 5 Insulin Management System',
      {
        source: 'ab-iptp-eligibility-2023',
        phrase:
          'will not be reimbursed for IPT supplies or an insulin pump paid by them personally',
      },
      { source: 'abc-pharmacy-reference-guide', phrase: 'operate as the payor of last resort' },
      { source: 'ab-cgm-fact-sheet-2025', phrase: '1-800-661-6995' },
    ],
  },
  {
    id: 'sk-pump',
    jurisdiction: 'SK',
    groups: ['pump'],
    /* The legal name in the page's body (its title says "Saskatchewan Insulin Pump Program"). */
    programName: 'Saskatchewan Aids to Independent Living (SAIL) Insulin Pump Program',
    programNameFr: '',
    sources: ['sk-insulin-pump-program'],
    /* Who receives the $6,300 grant is not stated. */
    pays: 'unconfirmed',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [
      {
        office: 'Saskatchewan Aids to Independent Living (SAIL)',
        source: 'sk-insulin-pump-program',
        numbers: [
          { number: '1-888-787-8996', kind: 'tollFree' },
          { number: '306-787-7121', kind: 'phone' },
        ],
      },
      {
        office: 'Drug Plan and Extended Benefits Branch',
        source: 'sk-insulin-pump-program',
        numbers: [
          { number: '1-800-667-7581', kind: 'tollFree' },
          { number: '306-787-3317', kind: 'phone' },
        ],
      },
    ],
    checkPhrases: [
      'Saskatchewan Aids to Independent Living (SAIL) Insulin Pump Program',
      '$6,300 grant',
      'one insulin pump every five years',
      '1-888-787-8996',
      '1-800-667-7581',
    ],
  },
  {
    id: 'mb-pump',
    jurisdiction: 'MB',
    groups: ['pump'],
    programName: 'Manitoba Adult Insulin Pump Coverage Program (MAIPCP)',
    programNameFr: 'Programme de couverture de pompes à insuline pour les adultes du Manitoba',
    /* The government's own program page since 2026-10-06; the supplies FAQ names the children's program. */
    sources: ['mb-health-coverage', 'mb-faq-ips'],
    /* "order an approved insulin pump, at no cost, directly from the supplier". */
    pays: 'vendor',
    /* "18 years of age and older" (its `who`); under 18, its note names the children's program. */
    appliesTo: {
      types: ['type1'],
      therapies: ['pump'],
      ages: ['18to24', '25to64', '65plus'],
      alsoIfConsideringPump: true,
    },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'Manitoba Health, Seniors and Long-Term Care, Ancillary Programs',
        source: 'mb-health-coverage',
        numbers: [
          { number: '204-786-7365', kind: 'phone' },
          { number: '204-786-7366', kind: 'phone' },
          { number: '1-800-297-8099', kind: 'tollFree', ext: ['7365', '7366'] },
        ],
      },
    ],
    checkPhrases: [
      'one approved insulin pump every 5 years',
      'do not have coverage under a federal program',
      'at no cost, directly from the supplier',
      '1-800-297-8099 ext 7365 or 7366',
      { source: 'mb-health-coverage', phrase: 'Programme de couverture de pompes', fr: true },
      { source: 'mb-faq-ips', phrase: 'Pediatric Insulin Pump Program (MPIPP)' },
    ],
  },
  {
    id: 'qc-pump',
    jurisdiction: 'QC',
    groups: ['pump'],
    programName: 'Insulin Pump Access Program',
    /* Printed on the program's page. */
    programNameFr: 'Programme d’accès aux pompes à insuline',
    sources: ['qc-insulin-pump-access-program'],
    pays: 'receipts',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    /* The page was last updated 2021-02-19: look for a newer RAMQ or MSSS page (D-19). */
    verifiedOn: CHECKED,
    confirm: true,
    has: { covered: true, who: true, howToApply: true, notes: true },
    checkPhrases: [
      'maximum refund of $6,300 per insulin pump',
      'a maximum of $4,000 per year for supplies',
      'must be under 18 years of age',
      'February 19, 2021',
      {
        source: 'qc-insulin-pump-access-program',
        phrase: 'Santé Québec – CHU de Québec – Université Laval',
        fr: true,
      },
    ],
  },
  {
    id: 'nb-ipp',
    jurisdiction: 'NB',
    groups: ['pump', 'cgm'],
    programName: 'New Brunswick Insulin Pump Program (IPP)',
    /* The title of the program's own French page. */
    programNameFr: 'Le Programme de pompes à insuline (PPI) du Nouveau-Brunswick',
    /* "Remaining costs are billed to the province by the vendor" (on the page itself). */
    sources: ['nb-insulin-pump-program'],
    pays: 'vendor',
    /* Pumps: type 1; sensors: type 1, or type 2 on 3+ injections — stated in `who`. */
    appliesTo: { therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'NBIPP Coordinator',
        source: 'nb-insulin-pump-program',
        numbers: [{ number: '1-855-655-5525', kind: 'phone' }],
      },
    ],
    checkPhrases: [
      'Remaining costs are billed to the province by the vendor',
      'cannot obtain their supplies through community pharmacies',
      'Applicants with 100% insurance coverage are NOT eligible to apply',
      '1-855-655-5525',
    ],
  },
  {
    id: 'ns-ipp',
    jurisdiction: 'NS',
    groups: ['pump'],
    programName: 'Nova Scotia Insulin Pump Program',
    programNameFr: '',
    sources: ['ns-insulin-pump-program', 'ns-health-contacts'],
    pays: 'unconfirmed',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'Insulin Pump Program',
        source: 'ns-health-contacts',
        numbers: [
          { number: '902-470-6707', kind: 'phone' },
          { number: '1-855-306-6360', kind: 'tollFree' },
        ],
      },
    ],
    checkPhrases: [
      '1 insulin pump every 5 years',
      'There are no premiums or deductibles',
      'Clinical Eligibility Form',
      'It should take 1 to 2 weeks',
      { source: 'ns-health-contacts', phrase: '1-855-306-6360' },
    ],
  },
  {
    id: 'pe-ipp',
    jurisdiction: 'PE',
    groups: ['pump'],
    programName: 'PEI Insulin Pump Program',
    /* The only French name seen is in a translated patient handout, not on a program page (B25). */
    programNameFr: '',
    /* The program's web page answers with a CAPTCHA; its questions and answers (2026-05-06) are cited. */
    sources: ['pe-ipp-qa'],
    /* "Co-payments must be made directly to the insulin pump company." */
    pays: 'vendor',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'Insulin Pump Program Administrator, PEI Pharmacare',
        source: 'pe-ipp-qa',
        numbers: [{ number: '902-213-4825', kind: 'phone' }],
      },
    ],
    checkPhrases: [
      'up to 100% coverage',
      'Co-payments must be made directly to the insulin pump company',
      'between April 1 and June 30',
      'PEI residents of all ages who are medically eligible',
      '902-213-4825',
    ],
  },
  {
    id: 'nl-pump',
    jurisdiction: 'NL',
    groups: ['pump'],
    programName: 'Newfoundland and Labrador Insulin Pump Program',
    programNameFr: '',
    /*
     * The 2021 release is the newest official page on the program (its own
     * pages now lead to NL Health Services' home page; D-20). Its phones
     * predate NL Health Services, so none is shown.
     */
    sources: ['nl-insulin-pump-program-2021', 'nl-cgm-program-2025'],
    pays: 'unconfirmed',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED,
    confirm: true,
    has: { covered: true, who: true, howToApply: false, notes: true },
    checkPhrases: [
      'basic insulin pumps and supplies',
      'financially assessed using an Income Test',
      'financial hardship policy',
      {
        source: 'nl-cgm-program-2025',
        phrase: 'same income-testing as the NL Insulin Pump Program',
      },
    ],
  },
  {
    id: 'yt-pump',
    jurisdiction: 'YT',
    groups: ['pump'],
    programName: 'Yukon National Pharmacare Program — access to insulin pumps',
    programNameFr: 'Régime d’assurance-médicaments national du Yukon — accès aux pompes à insuline',
    sources: ['yt-national-pharmacare'],
    /* Who pays for a pump, how much and how to apply are not on the page (verify item 6). */
    pays: 'unconfirmed',
    appliesTo: { therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED,
    confirm: true,
    has: { covered: true, who: false, howToApply: false, notes: true },
    phones: [
      {
        office: 'Chronic Disease and Disability Benefits',
        source: 'yt-national-pharmacare',
        numbers: [{ number: '867-667-5092', kind: 'phone' }],
      },
      {
        office: 'Senior Pharmacare Program',
        source: 'yt-national-pharmacare',
        numbers: [{ number: '867-667-5403', kind: 'phone' }],
      },
    ],
    /* yukon.ca refuses plain requests: the recheck reports it as blocked and these go unchecked. */
    checkPhrases: [
      'improves access to newer insulin pump technologies',
      'Insulin pump eligibility is granted every 5 years',
      '867-667-5092',
    ],
  },

  /* ---------- 4 · Glucose sensor (CGM) programs; nb-ipp above renders here too ---------- */
  {
    id: 'on-adp-cgm',
    jurisdiction: 'ON',
    groups: ['cgm'],
    programName: 'Assistive Devices Program — real-time continuous glucose monitoring',
    programNameFr:
      'Programme d’appareils et accessoires fonctionnels (PAAF) — surveillance du glucose en continu en temps réel',
    sources: ['on-diabetes-equipment-and-supplies'],
    /* Through a registered vendor (verify P1). */
    pays: 'vendor',
    appliesTo: { types: ['type1'], therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [ADP_PHONES],
    checkPhrases: [
      'real-time continuous glucose monitor sensors and transmitters',
      'every 2 years',
    ],
  },
  {
    id: 'on-odb-cgm',
    jurisdiction: 'ON',
    groups: ['cgm'],
    programName: 'Ontario Drug Benefit — continuous glucose monitors',
    programNameFr:
      'Programme de médicaments de l’Ontario (PMO) — systèmes de surveillance du glucose en continu',
    /* F-2 and F-3 (release E-1; launch blocker D-24 cleared). */
    sources: ['on-eo-notice-cgm-2025', 'on-odb-formulary-ed43-summary', 'on-odb-coverage'],
    /* The ministry pays the pharmacy's claim. */
    pays: 'at-the-pharmacy',
    appliesTo: { therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [
      {
        office: 'ServiceOntario INFOline',
        source: 'on-eo-notice-cgm-2025',
        numbers: [
          { number: '1-866-532-3161', kind: 'tollFree' },
          { number: '1-800-387-5559', kind: 'tty' },
        ],
      },
    ],
    checkPhrases: [
      'Effective July 31, 2025',
      'funded for ODB program recipients on insulin therapy',
      'valid prescription from a physician or nurse practitioner',
      '1-866-532-3161',
      {
        source: 'on-odb-formulary-ed43-summary',
        phrase: '31 sensors over the course of a 365-day period',
      },
    ],
  },
  {
    id: 'bc-cgm',
    jurisdiction: 'BC',
    groups: ['cgm'],
    programName: 'BC PharmaCare — glucose monitoring devices',
    programNameFr: '',
    sources: ['bc-diabetes-pins'],
    pays: 'unconfirmed',
    appliesTo: { therapies: ['insulinInjections', 'pump'] },
    /* Who qualifies for Special Authority is not on the page read. */
    verifiedOn: CHECKED,
    confirm: true,
    has: { covered: true, who: false, howToApply: true, notes: false },
    phones: [BC_PHARMACARE_PHONES],
    checkPhrases: ['Dexcom G7', 'Libre 2', 'Plus sensor'],
  },
  {
    id: 'ab-cgm',
    jurisdiction: 'AB',
    groups: ['cgm'],
    programName: 'Alberta government-sponsored health benefit plans — continuous glucose monitors',
    programNameFr: '',
    /* The fact sheet of December 16, 2025 (replaces Benefact 1225; verify A2). */
    sources: ['ab-cgm-fact-sheet-2025', 'ab-non-group-coverage'],
    /* "Government program participants can obtain their CGM from a pharmacy." */
    pays: 'at-the-pharmacy',
    appliesTo: { therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [ALBERTA_BLUE_CROSS_PHONES],
    checkPhrases: [
      '25 sensors for each benefit year',
      'a basal-bolus insulin',
      'Government program participants can obtain their CGM from a pharmacy',
      {
        source: 'ab-non-group-coverage',
        phrase: 'Co-payments apply to continuous glucose monitors',
      },
    ],
  },
  {
    id: 'mb-cgm',
    jurisdiction: 'MB',
    groups: ['cgm'],
    programName: 'Manitoba Pharmacare — continuous and flash glucose monitors',
    programNameFr: '',
    sources: ['mb-shared-health-diabetes-care', 'mb-pharmacare-mepp', 'mb-pharmacare'],
    pays: 'unconfirmed',
    appliesTo: { types: ['type1', 'type2'], therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [MB_PHARMACARE_PHONES],
    checkPhrases: [
      'Both Continuous Glucose Monitors (CGM) and Flash Glucose Monitors (FGM) are covered',
      'currently on both basal and bolus insulin or using an insulin pump',
      { source: 'mb-pharmacare', phrase: '1-800-297-8099' },
    ],
  },
  {
    id: 'qc-cgm',
    jurisdiction: 'QC',
    groups: ['cgm'],
    programName: 'Public Prescription Drug Insurance Plan — continuous glucose monitors',
    programNameFr:
      'Régime général d’assurance médicaments — appareils de mesure du glucose en continu',
    /*
     * INESSS records each minister's decision on the RAMQ list (RAMQ's own
     * pages refuse requests). Corrected per verify A3: the February 4, 2026
     * change defines intensive insulin therapy for every CGM; it did not
     * open coverage to type 2 in general.
     */
    sources: [
      'inesss-libre-3-plus-2026',
      'inesss-dexcom-g6-g7-2026',
      'inesss-libre-3-plus-notice-2025-12',
      'qc-stays-outside-quebec',
    ],
    pays: 'unconfirmed',
    appliesTo: { therapies: ['insulinInjections', 'pump'] },
    /* RAMQ's own list could not be read: check with RAMQ. */
    verifiedOn: CHECKED,
    confirm: true,
    has: { covered: true, who: true, howToApply: true, notes: true },
    checkPhrases: [
      'Diabète de type 1 et diabète de type 2',
      "Médicament d'exception (2026-02-04)",
      { source: 'inesss-dexcom-g6-g7-2026', phrase: "Médicament d'exception (2026-02-04)" },
      {
        source: 'inesss-libre-3-plus-notice-2025-12',
        phrase: 'au moins 2 insulines différentes par jour',
      },
      {
        source: 'qc-stays-outside-quebec',
        phrase: 'the public plan does not cover prescription drugs purchased outside Québec',
      },
    ],
  },
  {
    id: 'ns-sbgm',
    jurisdiction: 'NS',
    groups: ['cgm'],
    programName: 'Sensor-based Glucose Monitoring Program',
    programNameFr: '',
    sources: ['ns-sbgm-program', 'ns-health-contacts'],
    /* "You pay the full cost of the supplies at the pharmacy until you reach your deductible." */
    pays: 'at-the-pharmacy',
    appliesTo: { types: ['type1', 'type2'], therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'Sensor-based Glucose Monitoring Program',
        source: 'ns-health-contacts',
        numbers: [
          { number: '902-496-5667', kind: 'phone' },
          { number: '1-877-330-0323', kind: 'tollFree' },
        ],
      },
    ],
    checkPhrases: [
      'There are no premiums or copayments',
      'at least 4 injections per day',
      '$150,000 or less',
      'only covered when dispensed by a pharmacy with a prescription',
      { source: 'ns-health-contacts', phrase: '1-877-330-0323' },
    ],
  },
  {
    id: 'nl-cgm',
    jurisdiction: 'NL',
    groups: ['cgm'],
    programName: 'Provincial Continuous Glucose Monitoring Program',
    programNameFr: '',
    sources: ['nl-cgm-program-2025'],
    pays: 'unconfirmed',
    /* + 'gestational' once F-33 is registered (held, E-25). */
    appliesTo: { types: ['type1'] },
    /* The only source is a pre-launch news release (May 2025); no program page found (D-20). */
    verifiedOn: CHECKED,
    confirm: true,
    has: { covered: true, who: true, howToApply: false, notes: true },
    checkPhrases: ['same income-testing as the NL Insulin Pump Program'],
  },

  /* ---------- 5 · Test strips and supplies ---------- */
  {
    id: 'on-odb-strips',
    jurisdiction: 'ON',
    groups: ['supplies'],
    programName: 'Ontario Drug Benefit — blood glucose test strips',
    programNameFr: 'Programme de médicaments de l’Ontario (PMO) — bandelettes de test de glycémie',
    sources: ['on-odb-coverage'],
    pays: 'at-the-pharmacy',
    appliesTo: { types: ['type1', 'type2', 'other'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: false },
    phones: [
      {
        office: 'Ontario Drug Benefit Program',
        officeFr: 'Programme de médicaments de l’Ontario',
        source: 'on-odb-coverage',
        numbers: [
          { number: '1-888-405-0405', kind: 'tollFree' },
          { number: '416-503-4586', kind: 'phone', area: 'Toronto' },
        ],
      },
    ],
    checkPhrases: [
      'with insulin 3,000',
      'other diabetic supplies are not covered by the ODB program',
      '1-888-405-0405',
    ],
  },
  {
    id: 'on-mfhp',
    jurisdiction: 'ON',
    groups: ['supplies'],
    programName: 'Monitoring for Health Program',
    programNameFr: 'Programme de surveillance pour une bonne santé de l’Ontario',
    /* The government's page first (B36); Diabetes Canada runs the program and states the mail-in route. */
    sources: ['on-preventing-and-living-with-diabetes', 'dc-ontario-monitoring-for-health'],
    pays: 'receipts',
    /* Or gestational diabetes, at any therapy: special-cased in ./funding-data.ts. */
    appliesTo: { therapies: ['insulinInjections', 'pump'] },
    /* The age rule is now the government page's (D-21, released E-24 in its words). */
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [
      {
        office: 'Diabetes Canada',
        officeFr: 'Diabète Canada',
        source: 'on-preventing-and-living-with-diabetes',
        numbers: [{ number: '1-800-361-0796', kind: 'phone' }],
      },
    ],
    checkPhrases: [
      'can only submit to this program for lancets and/or a blood glucose meter',
      'must be signed by a doctor or nurse practitioner',
      '$920',
      '1-800-361-0796',
    ],
  },
  {
    id: 'on-adp-seniors',
    jurisdiction: 'ON',
    groups: ['supplies'],
    programName: 'Assistive Devices Program — syringes and needles for seniors',
    programNameFr:
      'Programme d’appareils et accessoires fonctionnels (PAAF) — seringues et aiguilles pour les aînés',
    sources: ['on-diabetes-equipment-and-supplies'],
    /* Direct deposit or cheque. */
    pays: 'paid-to-you',
    /* Daily insulin and living at home: stated in `who`. */
    appliesTo: { ages: ['65plus'], therapies: ['insulinInjections'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [ADP_PHONES],
    checkPhrases: [
      'you can apply for $170 annually to help pay for syringes and needles',
      'You must renew with the ADP every 2 years for syringes and needles',
    ],
  },
  {
    id: 'bc-np-supplies',
    jurisdiction: 'BC',
    groups: ['supplies'],
    programName: 'BC PharmaCare — diabetes supplies',
    programNameFr: '',
    /* The quantities are on BC's own release now (E-9 released). */
    sources: ['bc-news-diabetes-coverage-2026', 'bc-national-pharmacare'],
    pays: 'at-the-pharmacy',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: false },
    phones: [BC_PHARMACARE_PHONES],
    checkPhrases: [
      'lancets: 400',
      'alcohol swabs: 300',
      'blood or urine ketone strips: 100',
      'Coverage is processed at the pharmacy counter',
      'training from a diabetes education centre or primary care network',
    ],
  },
  {
    id: 'nl-strips',
    jurisdiction: 'NL',
    groups: ['supplies'],
    programName:
      'Newfoundland and Labrador Prescription Drug Program (NLPDP) — blood glucose test strips',
    programNameFr:
      'Programme de médicaments sur ordonnance de Terre-Neuve-et-Labrador (NLPDP) — bandelettes de test de glycémie',
    /* Claiming policies of August 20, 2025 (F-21, releases E-11 with all four tiers). */
    sources: ['nl-program-claiming-policies', 'nl-prescription-drug-program'],
    pays: 'at-the-pharmacy',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: true },
    checkPhrases: [
      'Diabetic Test Strips',
      'A paid claim for insulin and/or non-insulin diabetic medication within the past year',
      'Payor of Last Resort',
      { source: 'nl-prescription-drug-program', phrase: 'The NLPDP is payor of last resort' },
    ],
  },
  {
    id: 'yt-cddb',
    jurisdiction: 'YT',
    groups: ['supplies'],
    programName: 'Chronic Disease and Disability Benefits Program',
    programNameFr:
      'Programme d’aide pour les personnes atteintes d’une maladie chronique ou d’une incapacité',
    /* Replaces the held `yt-devices`, whose E-12 line was wrong (verify item 6). */
    sources: ['yt-chronic-disease-benefits'],
    pays: 'unconfirmed',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: false, howToApply: true, notes: true },
    phones: [
      {
        office: 'Chronic Disease and Disability Benefits',
        source: 'yt-chronic-disease-benefits',
        numbers: [
          { number: '867-667-5092', kind: 'phone' },
          { number: '1-800-661-0408', kind: 'tollFreeIn' },
        ],
      },
    ],
    /* yukon.ca refuses plain requests: the recheck reports it as blocked and these go unchecked. */
    checkPhrases: [
      'syringes and glucose test kits',
      'This program is the payer of last resort',
      'toll free in Yukon 1-800-661-0408',
    ],
  },
  {
    id: 'nt-ehb',
    jurisdiction: 'NT',
    groups: ['supplies'],
    programName: 'Extended Health Benefits',
    programNameFr: 'Régime d’assurance-maladie complémentaire',
    sources: ['nt-ehb-services', 'nt-extended-health-benefits'],
    pays: 'unconfirmed',
    appliesTo: {},
    /* The list it follows names no diabetes device we could confirm: ask the program. */
    verifiedOn: CHECKED,
    confirm: true,
    has: { covered: true, who: false, howToApply: false, notes: true },
    phones: [
      {
        office: 'Health Benefits',
        source: 'nt-ehb-services',
        numbers: [
          { number: '1-800-661-0830', kind: 'tollFree', ext: ['49462'] },
          { number: '867-777-7400', kind: 'phone' },
        ],
      },
    ],
    checkPhrases: [
      'listed in the NIHB Medical Supplies and Equipment Guide and Benefit List',
      'Family maximums range from $500 to $1500',
      'payor of last resort',
      '1-800-661-0830, ext. 49462',
    ],
  },

  /* ---------- 6 · Drug plans and national pharmacare (MB, BC, PEI, YT) ---------- */
  {
    id: 'mb-mepp',
    jurisdiction: 'MB',
    groups: ['pharmacare'],
    programName: 'Manitoba Enhanced Pharmacare Program (MEPP)',
    programNameFr: 'Régime d’assurance-médicaments amélioré du Manitoba',
    sources: ['mb-pharmacare-mepp', 'hc-pharmacare-bilateral-agreements', 'mb-pharmacare'],
    pays: 'at-the-pharmacy',
    appliesTo: { therapies: ['nonInsulin', 'insulinInjections', 'pump'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: false, howToApply: true, notes: true },
    phones: [MB_PHARMACARE_PHONES],
    checkPhrases: ['April 15, 2025', 'Diabetes supplies remain as benefits'],
  },
  {
    id: 'bc-plan-np',
    jurisdiction: 'BC',
    groups: ['pharmacare'],
    programName: 'PharmaCare Plan NP (national pharmacare)',
    programNameFr: '',
    sources: ['bc-national-pharmacare', 'hc-pharmacare-bilateral-agreements'],
    pays: 'at-the-pharmacy',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: false },
    phones: [BC_PHARMACARE_PHONES],
    checkPhrases: [
      'The prescription must be dispensed in B.C.',
      'Coverage is provided automatically at the pharmacy counter',
    ],
  },
  {
    id: 'pe-pharmacare',
    jurisdiction: 'PE',
    /*
     * Also under test strips and supplies (K7, 2026-10-06): its card states
     * the strip price, so that group shows it rather than "still checking".
     */
    groups: ['pharmacare', 'supplies'],
    programName: 'National Pharmacare Program in Prince Edward Island',
    programNameFr: '',
    /* Health PEI's residents' Q&A (May 2025) releases the PEI pharmacare part of E-10. */
    sources: ['healthpei-national-pharmacare-qa', 'hc-pharmacare-bilateral-agreements'],
    pays: 'at-the-pharmacy',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: true },
    checkPhrases: [
      'will be available at no cost',
      '$11.00 per dispense for 100 test strips',
      'filled at an out-of-province pharmacy',
      'does not cover the cost of insulin syringes or insulin',
    ],
  },
  {
    id: 'yt-pharmacare',
    jurisdiction: 'YT',
    groups: ['pharmacare'],
    programName: 'Yukon National Pharmacare Program',
    programNameFr: 'Régime d’assurance-médicaments national du Yukon',
    /* Medicines only; devices and supplies go through the chronic disease program (verify item 6). */
    sources: ['yt-national-pharmacare', 'hc-pharmacare-bilateral-agreements'],
    pays: 'at-the-pharmacy',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: true },
    phones: [
      {
        office: 'Yukon National Pharmacare Program',
        officeFr: 'Régime d’assurance-médicaments national du Yukon',
        source: 'yt-national-pharmacare',
        numbers: [{ number: '867-393-7480', kind: 'phone' }],
      },
    ],
    /* yukon.ca refuses plain requests: the recheck reports it as blocked and these go unchecked. */
    checkPhrases: [
      'Covered medications are free',
      'does not cover: diabetes equipment, supplies or glucose monitoring devices',
      'Medications filled outside the Yukon are not covered',
    ],
  },
  {
    id: 'fed-pharmacare',
    jurisdiction: 'CA',
    groups: ['pharmacare'],
    programName: 'Pharmacare Act',
    programNameFr: 'Loi concernant l’assurance médicaments',
    sources: [
      'parl-bill-c64-pharmacare',
      'hc-pharmacare-bilateral-agreements',
      'hc-diabetes-device-fund-2024',
    ],
    pays: 'unconfirmed',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: false, howToApply: false, notes: true },
    checkPhrases: [
      'Royal Assent',
      { source: 'hc-pharmacare-bilateral-agreements', phrase: 'four provinces and territories' },
    ],
  },

  /* ---------- 7 · Private insurance first: through PRIVATE_FIRST ---------- */

  /* ---------- 8 · Disability Tax Credit, RDSP and medical expenses ---------- */
  {
    id: 'fed-dtc',
    jurisdiction: 'CA',
    groups: ['dtcRdsp'],
    programName: 'Disability tax credit',
    programNameFr: 'Crédit d’impôt pour personnes handicapées (CIPH)',
    /* The CRA's "How to apply" page releases the digital application (E-27). */
    sources: ['cra-dtc-life-sustaining-therapy', 'cra-dtc-how-to-apply', 'cra-rc4064-2025'],
    pays: 'tax',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [
      {
        office: 'Canada Revenue Agency',
        officeFr: 'Agence du revenu du Canada',
        source: 'cra-dtc-how-to-apply',
        numbers: [{ number: '1-800-959-8281', kind: 'phone' }],
      },
    ],
    checkPhrases: [
      'People with Type 1 diabetes meet the eligibility criteria under life-sustaining therapy',
      {
        source: 'cra-dtc-how-to-apply',
        phrase: 'Both Part A and Part B must be submitted using the same method',
      },
      { source: 'cra-dtc-how-to-apply', phrase: '1-800-959-8281' },
    ],
  },
  {
    id: 'fed-rdsp',
    jurisdiction: 'CA',
    groups: ['dtcRdsp'],
    programName: 'Registered Disability Savings Plan (RDSP)',
    programNameFr: 'Régime enregistré d’épargne-invalidité (REEI)',
    sources: ['esdc-rdsp-apply'],
    pays: 'tax',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: false },
    checkPhrases: ['the year they turn 59', 'the year you turn 49'],
  },
  {
    id: 'fed-medical-expenses',
    jurisdiction: 'CA',
    /* A federal row only: the checker's tax group shows the DTC and the RDSP. */
    groups: ['dtcRdsp'],
    programName: 'Medical expenses (RC4065)',
    programNameFr: 'Frais médicaux (RC4065)',
    /* RC4065 (E-14 released; the F-26 address is gone). */
    sources: ['cra-rc4065-2025'],
    pays: 'tax',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: false, howToApply: true, notes: false },
    checkPhrases: [
      'Insulin or substitutes – prescription needed',
      'Infusion pump including disposable peripherals used in treating diabetes',
      'Needles and syringes – prescription needed',
    ],
  },
];

/*
 * Programs whose wording is written and checked but whose only source is not
 * registered yet. Each joins PROGRAM_META once its SourceId is; until then its
 * group shows the "we're still checking" card. Wording and release condition:
 * the review pack's "Held items". Review only.
 */
export const HELD_PROGRAM_IDS = ['sk-cgm', 'pe-gsp', 'nu-ehb'] as const;

/*
 * Provinces whose programs pay only after private insurance, with the program
 * the card is about and the official page that says so. The card's words are
 * `funding.privateFirst.<province>`. Every other province gets the claim-free
 * generic card. Alberta's government programs became payer of last resort on
 * 2026-10-01 (E-6, F-10).
 */
export const PRIVATE_FIRST: Partial<Record<ProvinceCode, { program: string; source: SourceId }>> = {
  AB: { program: 'ab-iptp', source: 'ab-non-group-coverage' },
  NB: { program: 'nb-ipp', source: 'nb-insulin-pump-program' },
  NS: { program: 'ns-ipp', source: 'ns-insulin-pump-program' },
  PE: { program: 'pe-ipp', source: 'pe-ipp-qa' },
};

/* Where Liivv has a Bayshore pharmacy (owner, 2026-10-05). Not a billing claim. */
export const LIIVV_PHARMACY: Record<ProvinceCode, boolean> = {
  BC: true,
  AB: true,
  SK: true,
  MB: true,
  ON: true,
  NB: true,
  NS: true,
  PE: true,
  NL: true,
  QC: false,
  YT: false,
  NT: false,
  NU: false,
};

/*
 * The provincial drug plans Liivv bills directly (owner answer B13,
 * 2026-10-06: "each pharmacy is already enrolled [with its province's drug
 * plan]"; A6). The Liivv pharmacy in each province bills that province's plan
 * for what the plan covers. The plan's name is the government's own, in
 * French only where the government prints one (B25); `source` is the page
 * that names it. Quebec can never appear: its public plan does not pay for
 * drugs bought outside Quebec, and Liivv has no pharmacy there. Federal
 * programs and private insurers are not listed: not confirmed.
 */
export interface DirectBillingEntry {
  province: ProvinceCode;
  /** The plan's name as the government prints it. Never translated. */
  plan: string;
  /** Its official French name, only where the government prints one. */
  planFr: string;
  source: SourceId;
  /** ISO date the owner confirmed the enrolment. */
  confirmedOn: string;
}

const ENROLMENT_CONFIRMED = '2026-10-06';

export const DIRECT_BILLING: DirectBillingEntry[] = [
  {
    province: 'BC',
    plan: 'BC PharmaCare',
    planFr: '',
    source: 'bc-pharmacare-contact',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
  {
    province: 'AB',
    plan: 'Alberta government-sponsored drug programs (Alberta Blue Cross)',
    planFr: '',
    source: 'abc-pharmacy-reference-guide',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
  {
    province: 'SK',
    plan: 'Saskatchewan Drug Plan',
    planFr: 'Régime d’assurance-médicaments',
    source: 'sk-drug-cost-assistance',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
  {
    province: 'MB',
    plan: 'Manitoba Pharmacare Program',
    planFr: 'Le Régime d’assurance-médicaments',
    source: 'mb-pharmacare',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
  {
    province: 'ON',
    plan: 'Ontario Drug Benefit (ODB)',
    planFr: 'Programme de médicaments de l’Ontario (PMO)',
    source: 'on-odb-coverage',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
  {
    province: 'NB',
    plan: 'New Brunswick Drug Plans',
    planFr: 'Régimes de médicaments du Nouveau-Brunswick',
    source: 'nb-drug-plans',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
  {
    province: 'NS',
    plan: 'Nova Scotia Pharmacare',
    planFr: '',
    source: 'ns-pharmacare',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
  {
    province: 'PE',
    plan: 'PEI Pharmacare',
    planFr: '',
    source: 'healthpei-national-pharmacare-qa',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
  {
    province: 'NL',
    plan: 'Newfoundland and Labrador Prescription Drug Program (NLPDP)',
    planFr: 'Programme de médicaments sur ordonnance de Terre-Neuve-et-Labrador (NLPDP)',
    source: 'nl-prescription-drug-program',
    confirmedOn: ENROLMENT_CONFIRMED,
  },
];

/*
 * "Liivv Now, Pay Later" (owner answer A5, 2026-10-06: "only applicable to
 * insulin pumps and yes only after being verified by our internal customer
 * service team"). For insulin pump supplies, Omnipod pods included. Its terms
 * (`ui.fundingPage.payLater*`) mirror the owner's program; it is never called
 * by another company's program name. Rests on the owner's word: no register
 * entry backs it. When `enabled` is false nothing renders for it.
 */
export const PAY_LATER: {
  enabled: boolean;
  name: string;
  approvedOn: string;
  group: ResultGroup;
} = {
  enabled: true,
  name: 'Liivv Now, Pay Later',
  approvedOn: '2026-10-06',
  /*
   * The result group whose intro mentions it, once, as Liivv's own option
   * (`ui.fundingResults.pumpPayLater`, after `pumpIntro`, in a province only).
   * No program card does (full-site review, 2026-10-06): some pump programs
   * pay only their own vendors or the pump company, and some pay nothing back
   * for supplies bought privately.
   */
  group: 'pump',
};

/*
 * The keys of "What changed lately" (`ui.fundingPage.changes`), oldest first
 * by the date each line opens with. They were listed in the order they were
 * written (full-site review, 2026-10-06); a new change takes the next key and
 * goes in its place here.
 */
export const CHANGES_ORDER = ['1', '2', '3', '4', '6', '8', '5', '9', '7', '10'] as const;

/*
 * The federal rows, in the owner's order (#federal): NIHB, Veterans Affairs,
 * national pharmacare and the Diabetes Device Fund, the Disability Tax Credit,
 * the RDSP, then medical expenses (E-14, released 2026-10-06). Each row's
 * heading is `ui.fundingPage.<heading>`.
 */
export const FEDERAL_ROWS: Array<{
  program: string;
  heading:
    | 'nihbHeading'
    | 'vacHeading'
    | 'pharmacareHeading'
    | 'dtcHeading'
    | 'rdspHeading'
    | 'medicalHeading';
}> = [
  { program: 'fed-nihb', heading: 'nihbHeading' },
  { program: 'fed-vac', heading: 'vacHeading' },
  { program: 'fed-pharmacare', heading: 'pharmacareHeading' },
  { program: 'fed-dtc', heading: 'dtcHeading' },
  { program: 'fed-rdsp', heading: 'rdspHeading' },
  { program: 'fed-medical-expenses', heading: 'medicalHeading' },
];

/*
 * The register entries behind the page's own sentences, by message key under
 * `ui.fundingPage` / `ui.fundingChecker` / `ui.fundingResults` / `funding.liivv`
 * (claims table, section C). A line about Liivv itself rests on the owner's
 * word instead (OWNER_LINES). Review only, apart from `enough2`, whose sources
 * are linked under its card, and `noConfirmedBody`, whose source is the link
 * on the "still checking" card.
 */
export const PAGE_SOURCES: Record<string, SourceId[]> = {
  'ui.fundingPage.claimBody': [
    'on-diabetes-equipment-and-supplies',
    'nb-insulin-pump-program',
    'bc-insulin-pumps',
  ],
  'ui.fundingPage.directQuebec': ['qc-stays-outside-quebec'],
  'ui.fundingPage.pharmacareSigned': ['hc-pharmacare-bilateral-agreements'],
  'ui.fundingPage.dtcNote': ['esdc-rdsp-apply'],
  'ui.fundingPage.changes.1': ['nt-extended-health-benefits'],
  'ui.fundingPage.changes.2': ['parl-bill-c64-pharmacare'],
  'ui.fundingPage.changes.3': ['hc-pharmacare-bilateral-agreements'],
  'ui.fundingPage.changes.4': ['mb-pharmacare-mepp'],
  'ui.fundingPage.changes.5': ['isc-nihb-updates'],
  'ui.fundingPage.changes.6': ['nl-cgm-program-2025'],
  'ui.fundingPage.changes.7': ['bc-national-pharmacare', 'bc-news-diabetes-coverage-2026'],
  'ui.fundingPage.changes.8': ['on-eo-notice-cgm-2025', 'on-odb-formulary-ed43-summary'],
  'ui.fundingPage.changes.9': [
    'inesss-libre-3-plus-2026',
    'inesss-dexcom-g6-g7-2026',
    'inesss-libre-3-plus-notice-2025-12',
  ],
  'ui.fundingPage.changes.10': ['abc-pharmacy-reference-guide', 'ab-non-group-coverage'],
  'ui.fundingPage.whereBody': ['qc-stays-outside-quebec', 'yt-chronic-disease-benefits'],
  'ui.fundingPage.enough2Body': ['dc-comparisons-by-province', 'dc-out-of-pocket-costs-2022'],
  'ui.fundingPage.movingIntro': [
    'on-diabetes-equipment-and-supplies',
    'sk-insulin-pump-program',
    'mb-health-coverage',
    'nb-insulin-pump-program',
  ],
  'ui.fundingChecker.veteranHint': ['vac-cgm-type-1'],
  'ui.fundingChecker.privateHint': [
    'nb-insulin-pump-program',
    'ns-insulin-pump-program',
    'ab-non-group-coverage',
  ],
  'ui.fundingChecker.indigenousHint': ['isc-nihb-updates'],
  'ui.fundingResults.noConfirmedBody': ['dc-comparisons-by-province'],
  'ui.fundingResults.notSignedBody': ['hc-pharmacare-bilateral-agreements'],
  'funding.liivv.quebecBody': ['qc-stays-outside-quebec', 'qc-insulin-pump-access-program'],
};

/* Lines about Liivv itself, resting on the owner's word (2026-10-05 and 2026-10-06). Review only. */
export const OWNER_LINES = [
  'funding.liivv.pharmacies',
  'funding.liivv.askUsBody',
  'funding.liivv.quebecTitle',
  'funding.liivv.quebecBody',
  'funding.liivv.territoryTitle',
  'funding.liivv.territoryBody',
  'ui.fundingPage.directBody',
  'ui.fundingPage.directOther',
  'ui.fundingPage.claimCheck',
  'ui.fundingPage.payLaterBody',
  'ui.fundingPage.payLaterContact',
  'ui.fundingPage.whereBody',
  'ui.fundingPage.enough1Body',
  'ui.fundingPage.cdeBody',
  'ui.fundingResults.pumpIntro',
  'ui.fundingResults.pumpPayLater',
];
