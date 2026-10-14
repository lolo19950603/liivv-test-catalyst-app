/*
 * =============================================================================
 * SLEEP APNEA CARE FUNDING & COVERAGE — STRUCTURE
 * =============================================================================
 * Everything on /liivv-health/sleep-apnea-care/funding apart from the words:
 * the programs, the official page each one rests on, the date it was last
 * checked, whether the check was only partial, who it applies to, the
 * program's phone numbers, the phrases a scheduled recheck looks for, and
 * where Liivv bills a program directly (nowhere yet). Prose lives in
 * messages/*.json under `SleepApneaCare.funding` and
 * `SleepApneaCare.ui.funding{Page,Checker,Results}`.
 *
 * From the verified copy record docs/sleep-content/funding.md (A.4, every page
 * fetched and quoted on 2026-10-13, then re-checked by an independent source
 * check the same day), with the owner's rulings of 2026-10-13 applied: B1
 * ("default": the NIHB and FNHA cards wait on an Indigenous partner review),
 * B3 ("default": the checker's privacy promise stays held, E-12) and C7
 * (E-14 closed). Every program cites register entries only
 * (../chapters/sources-meta.ts); its first source is the link its card shows.
 *
 * Program names are legal proper nouns and live here, never in the message
 * tree, so no translation pass can rename one. An official French name goes
 * in `programNameFr` only where the government prints one (D-9).
 *
 * How Liivv bills: it doesn't, yet (D-1). Every card says how the program
 * itself pays; none promises that a program will accept a receipt from
 * Liivv. Liivv sells CPAP masks and supplies only: this page links no machine
 * and places no product.
 *
 * No value imports and erasable TypeScript only: the content-review export and
 * core/scripts/check-funding-sources.mjs load this file under Node's type
 * stripping, as they load chapters-meta.ts and landing-meta.ts.
 * =============================================================================
 */

import type { ChapterSlug } from '../chapters/chapters-meta';
import type { SourceId } from '../chapters/sources-meta';

import type {
  DirectBillingEntry,
  FundingData,
  ProgramMeta,
  ProvinceCaution,
  ProvinceCode,
} from './funding-data';

/* The day every row below was checked against its official pages (and re-checked by the source check). */
const CHECKED = '2026-10-13';

/** Monthly automated recheck (plan Part B rules), reviewed by the content owner (D-14). */
export const NEXT_CHECK = '2026-11-13';

/* Who owns the recheck (D-14; confirm the scheduled task covers both sites, B17). Printed in the review pack. */
export const RECHECK_OWNER =
  'Monthly automated recheck (scheduled), reviewed by the Liivv content owner';

/*
 * HELD (E-16; source check 2026-10-13; owner ruling D-10 / B6, for the Sleep
 * and Diabetes sites together): the ADP numbers are printed on the ADP page
 * only as its complaints line ("You may make a complaint verbally if you have
 * a physical disability that prevents you from submitting a written
 * complaint."), not as a general enquiry line. Not rendered, and kept out of
 * the code until released (an unused constant would fail lint):
 *
 * const ADP_PHONES: ProgramPhoneGroup = {
 *   office: 'Assistive Devices Program',
 *   officeFr: 'Programme d’appareils et accessoires fonctionnels',
 *   source: 'on-adp-main',                       // printed under "Contact us" in the complaints section
 *   numbers: [
 *     { number: '1-800-268-6021', kind: 'tollFree' },
 *     { number: '416-327-8804', kind: 'phone' },
 *     { number: '1-800-387-5559', kind: 'tty' },
 *   ],
 * };
 */

export const PROGRAM_META: ProgramMeta[] = [
  /* ---------------- Federal ---------------- */
  {
    id: 'fed-nihb-respiratory',
    jurisdiction: 'CA',
    groups: ['nihb'],
    programName: 'Non-Insured Health Benefits (NIHB) — Respiratory equipment and supplies',
    programNameFr:
      'Programme des services de santé non assurés (SSNA) — Liste des prestations des équipements et fournitures respiratoires',
    sources: ['nihb-pap', 'nihb-general-policies', 'nihb-eligibility'],
    pays: 'provider-or-refund',
    appliesTo: { tests: ['inLab', 'home'] }, // Level I, III or IV accepted
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    contactSource: 'nihb-contact', // regional offices: no single number (D-10)
    checkPhrases: [
      'Prior approval is required for all respiratory equipment and supplies benefits',
      '1 every 5 years',
      '14 per year',
      'The NIHB program does not cover the cost of sleep disorder diagnostic testing',
      {
        source: 'nihb-general-policies',
        phrase: 'Registered NIHB providers are reimbursed directly by the program',
      },
      {
        source: 'nihb-general-policies',
        phrase: 'must be received within one year from the date of service',
      },
    ],
    /*
     * Ruling B1 ("default", 2026-10-13; D-13): until an Indigenous health
     * partner has reviewed it, the card shows only "Find your office"
     * (nihb-contact), its title and date. Delete this line to release.
     */
    held: 'indigenousPartnerReview',
  },

  /* Renders in the 'nihb' group instead of fed-nihb-respiratory when province === 'BC'. */
  {
    id: 'bc-fnha-mse',
    jurisdiction: 'BC',
    groups: ['nihb'],
    programName: 'First Nations Health Authority — Health Benefits: medical supplies and equipment',
    programNameFr: '',
    sources: ['fnha-mse', 'fnha-mse-fee-2026', 'nihb-eligibility'],
    pays: 'provider-or-refund',
    appliesTo: {},
    verifiedOn: CHECKED,
    /* Source check 2026-10-13: the May 2026 Fee Supplement lists CPAP, APAP, BiPAP and PAP supplies (D-11 closed). */
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    /* Printed under a sentence that begins with the dental plan (D-10): rule with the other phones (B6). */
    phones: [
      {
        office: 'FNHA Health Benefits',
        source: 'fnha-mse',
        numbers: [{ number: '1-855-550-5454', kind: 'tollFree' }],
      },
    ],
    checkPhrases: [
      'available to First Nations people with Indian status who live in BC',
      'Pharmacies and providers who are registered can bill directly',
      'call Health Benefits at 1-855-550-5454',
      'Oxygen, sleep and breathing aids',
      { source: 'fnha-mse-fee-2026', phrase: 'Auto CPAP (APAP)' },
    ],
    /* Ruling B1 (D-13): until the partner review, the card shows only FNHA Health Benefits' number, its title and date. */
    held: 'indigenousPartnerReview',
  },

  {
    id: 'fed-vac-poc9',
    jurisdiction: 'CA',
    groups: ['vac'],
    programName:
      'Veterans Affairs Canada — Program of Choice (POC) 9: Oxygen Therapy and Respiratory Equipment',
    programNameFr:
      'Anciens Combattants Canada — Programme de choix (PDC) 9 : Inhalothérapie et équipement respiratoire',
    sources: ['fed-vac-poc9'],
    pays: 'pay-or-refund',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [
      {
        office: 'Veterans Affairs Canada',
        officeFr: 'Anciens Combattants Canada',
        source: 'fed-vac-poc9',
        numbers: [{ number: '1-866-522-2122', kind: 'tollFree' }],
      },
    ],
    checkPhrases: [
      'continuous positive airway pressure machines (CPAP)',
      'within 18 months of the day on which the expense was incurred',
      '1-866-522-2122',
    ],
  },

  {
    id: 'fed-cra-medical',
    jurisdiction: 'CA',
    groups: ['tax'],
    programName:
      'Lines 33099 and 33199 – Eligible medical expenses you can claim on your tax return',
    programNameFr:
      'Lignes 33099 et 33199 – Frais médicaux admissibles que vous pouvez demander dans votre déclaration de revenus',
    sources: ['fed-cra-medical'],
    pays: 'tax',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false },
    phones: [
      {
        office: 'Canada Revenue Agency',
        officeFr: 'Agence du revenu du Canada',
        source: 'cra-contact',
        numbers: [
          {
            number: '1-800-959-8281',
            kind: 'tollFree',
            area: 'All of Canada except Yukon, the Northwest Territories and Nunavut',
          },
        ],
      },
    ],
    checkPhrases: [
      'a continuous positive airway pressure (CPAP) machine – prescription needed',
      { source: 'cra-contact', phrase: '1-800-959-8281' },
    ],
  },

  /* ---------------- Ontario ---------------- */
  {
    id: 'on-adp-respiratory',
    jurisdiction: 'ON',
    groups: ['machine'],
    programName: 'Assistive Devices Program — Respiratory equipment and supplies',
    programNameFr:
      'Programme d’appareils et accessoires fonctionnels (PAAF) — Appareils et fournitures d’assistance respiratoire',
    sources: ['on-adp-respiratory', 'on-adp-resp-manual-2024', 'on-adp-main'],
    pays: 'business',
    appliesTo: { needs: ['first', 'replacement'], tests: ['inLab'] },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    // phones: [ADP_PHONES] HELD by the 2026-10-13 source check (E-16): the numbers are printed only for
    // complaints ("You may make a complaint verbally if you have a physical disability…"), not as a general line.
    checkPhrases: [
      'We cover 75% of the ADP price for respiratory equipment',
      'We pay our portion directly to the business that sold you the equipment',
      'See a doctor at a sleep clinic registered with the ADP if you need a:',
      'replacement masks, headgear, etc. for continuous positive airway pressure',
      'you will be responsible for paying the full cost',
      { source: 'on-adp-resp-manual-2024', phrase: 'positive airway pressure systems - 5 years' },
      { source: 'on-adp-resp-manual-2024', phrase: 'an ADP Registered Sleep Laboratory' },
      { source: 'on-adp-main', phrase: '1-800-268-6021' },
    ],
  },

  {
    id: 'on-odsp-msn',
    jurisdiction: 'ON',
    groups: ['supplies'],
    programName:
      'Ontario Disability Support Program (ODSP) — Mandatory Special Necessities: respiratory supplies',
    programNameFr:
      'Programme ontarien de soutien aux personnes handicapées (POSPH) — Prestations obligatoires pour les nécessités spéciales : fournitures respiratoires',
    sources: ['on-odsp-msn', 'on-odsp-msn-directive'],
    pays: 'direct-or-receipts',
    appliesTo: { needs: ['supplies'], assistanceOnly: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    // No single number: recipients contact their ODSP office (D-10).
    checkPhrases: [
      'Positive airway pressure systems and supplies are intended for individuals who have been diagnosed with obstructive sleep apnea syndrome',
      'Coverage through the MSN Benefit for eligible replacement supplies is provided when requested by an ODSP recipient',
      'Interface with headgear, face/nasal/nasal pillow',
      'Oral appliance for sleep apnea',
      {
        source: 'on-odsp-msn-directive',
        phrase: 'the third-party invoices ODSP for the amount for the items or services',
      },
      { source: 'on-odsp-msn-directive', phrase: 'Actual costs will be paid based on receipts' },
    ],
  },

  /* ---------------- Saskatchewan ---------------- */
  {
    id: 'sk-sail-cpap',
    jurisdiction: 'SK',
    groups: ['machine', 'supplies'],
    programName:
      'Saskatchewan Aids to Independent Living (SAIL) — Respiratory Equipment Program: CPAP Loan Program',
    programNameFr: '',
    sources: ['sk-sail-cpap', 'sk-sail'],
    pays: 'loan',
    appliesTo: { tests: ['inLab', 'home'] }, // Level 1 or Level 3 (Level 3 in Saskatchewan)
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'SAIL Respiratory Equipment Program',
        source: 'sk-sail-cpap',
        numbers: [
          { number: '306-787-7121', kind: 'phone' },
          { number: '1-888-787-8996', kind: 'tollFree' },
        ],
      },
    ],
    checkPhrases: [
      'for a $275 program fee',
      'Individuals are responsible for the full cost of related supplies',
      'Family Health Benefits (children only)',
      'Complete a level one or level three sleep study',
      'SAIL does not reimburse for privately purchased respiratory equipment',
      'interpret test results and confirm',
      { source: 'sk-sail', phrase: '1-888-787-8996' },
      { source: 'sk-sail', phrase: 'Not receive benefits from other government agencies' },
    ],
  },

  /* ---------------- Manitoba ---------------- */
  {
    id: 'mb-misericordia-cpap',
    jurisdiction: 'MB',
    groups: ['machine', 'supplies'],
    programName: 'Manitoba CPAP program — Sleep Disorder Centre, Misericordia Health Centre',
    /* As printed in the French release (D-9): a generic phrase, not a formal title. */
    programNameFr: 'Programme de thérapie par ventilation en pression positive continue (Manitoba)',
    /* mb-cpap-release-2023 now backs only held E-5 (source check 2026-10-13). */
    sources: ['mb-misericordia-cpap'],
    pays: 'copay',
    appliesTo: {},
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'Sleep Disorder Centre',
        source: 'mb-misericordia-cpap',
        numbers: [
          { number: '204-788-8570', kind: 'phone' },
          { number: '1-866-281-0410', kind: 'tollFree', area: 'Exceptional circumstances' },
        ],
      },
    ],
    checkPhrases: [
      'pay of $500 for the CPAP machine',
      'machine replacement every five years at a $500 co-pay cost',
      'All clients will be responsible to pay for supplies',
      'the CPAP must be used at least 70 per cent',
      'If you receive a prescription for a Continuous Positive Airway Pressure (CPAP) machine',
    ],
  },

  /* ---------------- British Columbia (caution card first: bc-not-covered) ---------------- */
  {
    id: 'bc-bcea-breathing',
    jurisdiction: 'BC',
    groups: ['machine', 'supplies'],
    programName: 'BC Employment and Assistance — Medical Equipment: Breathing Devices',
    programNameFr: '',
    sources: ['bc-bcea-breathing', 'bc-income-assistance-access'],
    pays: 'approval-first',
    appliesTo: { assistanceOnly: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'Income and disability assistance',
        source: 'bc-income-assistance-access',
        numbers: [{ number: '1-866-866-0800', kind: 'tollFree' }],
      },
    ],
    checkPhrases: [
      'a respiratory therapist must confirm the medical need',
      'The ministry must approve the request before the device is bought',
      'Accessories or supplies required to operate a positive airway pressure device',
      'Breathing Device Request and Justification form (HR3727)',
      { source: 'bc-income-assistance-access', phrase: '1-866-866-0800' },
    ],
  },

  /* ---------------- Alberta (caution card first: ab-not-covered) ---------------- */
  {
    id: 'ab-aish',
    jurisdiction: 'AB',
    groups: ['machine', 'supplies'],
    programName:
      'Assured Income for the Severely Handicapped (AISH) — health-related personal benefits',
    programNameFr: '',
    sources: ['ab-aish'],
    pays: 'unconfirmed',
    appliesTo: { assistanceOnly: true },
    verifiedOn: CHECKED,
    confirm: true, // amounts and approval steps are not on the page read
    has: { covered: true, who: true, howToApply: true, notes: false },
    // No single number: "Talk to your AISH worker" (D-10).
    checkPhrases: [
      'continuous positive airway pressure (CPAP) device and supplies',
      'not be eligible under any other program or source',
    ],
  },

  /* ---------------- New Brunswick ---------------- */
  {
    id: 'nb-sd-respiratory',
    jurisdiction: 'NB',
    groups: ['machine', 'supplies'],
    programName: 'Respiratory program (Department of Social Development)',
    programNameFr: 'Programme des services respiratoires',
    sources: ['nb-sd-respiratory'],
    pays: 'unconfirmed',
    appliesTo: { assistanceOnly: true },
    verifiedOn: CHECKED,
    confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true },
    phones: [
      {
        office: 'Health Services Program',
        officeFr: 'Services d’assistance santé', // as printed on the FR page
        source: 'nb-sd-respiratory',
        numbers: [{ number: '506-453-2001', kind: 'phone' }],
      },
    ],
    checkPhrases: [
      'CPAP machines (up to $1,800) / BPAP machines (up to $3,150)',
      'CPAP and BPAP masks and supplies',
      'clients of the Department of Social Development and their dependents',
      'you must not have any other coverage for the service(s) required',
      '506-453-2001',
    ],
  },
];

/*
 * Held rows (funding.md E): ab-income-support, ab-snas, ab-aadl, on-ow-*,
 * mb-home-testing, qc-measure-2023, nb-policy-periods, sk-group-plans, every
 * NS/PE/NL/territory row. Each joins PROGRAM_META once its own official page
 * is read and registered. Their wording waits in the review pack.
 */

/*
 * Province caution cards: a government page states non-coverage (Quebec: we
 * haven't confirmed a public program). Always shown for that province, first.
 * BC's third source backs the card's assistance line (claims table, s4–5).
 */
export const PROVINCE_CAUTION: Partial<Record<ProvinceCode, ProvinceCaution>> = {
  BC: {
    id: 'bc-not-covered',
    sources: ['bc-pharmacare-not-covered', 'bc-pap-buyers-guide', 'bc-bcea-breathing'],
    phones: [
      {
        office: 'BC PharmaCare',
        source: 'bc-pharmacare-contact',
        numbers: [
          { number: '604-683-7151', kind: 'phone', area: 'Lower Mainland' },
          { number: '1-800-663-7100', kind: 'tollFreeIn', area: 'Rest of B.C.' },
        ],
      },
    ],
    verifiedOn: CHECKED,
    checkPhrases: [
      'Continuous positive airway pressure (CPAP) machines',
      { source: 'bc-pap-buyers-guide', phrase: 'not paid or reimbursed through' },
    ],
  },
  AB: {
    id: 'ab-not-covered',
    sources: ['ab-cpap-buyers-2026'],
    verifiedOn: CHECKED,
    checkPhrases: [
      'not cover the cost of CPAP therapy equipment and accessories',
      'Special Needs Assistance for Seniors',
    ],
  },
  QC: {
    id: 'qc-still-checking',
    sources: ['qc-inesss-osa'],
    verifiedOn: CHECKED,
    checkPhrases: [
      'ont une assurance privée',
      "sont uniquement admissibles au crédit d'impôt pour frais médicaux",
    ],
  },
};

/** "We're still checking": no official program page read yet (plan Part B). */
export const STILL_CHECKING: ProvinceCode[] = ['NS', 'PE', 'NL', 'YT', 'NT', 'NU'];

/** Alberta Aids to Daily Living: CPAP criteria not verified (open.alberta.ca 520, ab.bluecross.ca 403 on 2026-10-12). */
export const STILL_CHECKING_LINES: Partial<Record<ProvinceCode, string[]>> = { AB: ['aadl'] };

/*
 * Programs Liivv bills directly. Listed only once the owner confirms Liivv is a
 * registered vendor or provider with the program (ADP, NIHB, VAC, BCEA, AISH,
 * NB Social Development, the Manitoba program; SAIL lends machines itself).
 * Empty today, so the page shows ui.fundingPage.directEmpty (D-1, B4).
 */
export const DIRECT_BILLING: DirectBillingEntry[] = [];

/* The record the checker's rules run on (./funding-data.ts buildResults). */
export const FUNDING_DATA: FundingData = {
  programs: PROGRAM_META,
  caution: PROVINCE_CAUTION,
  stillChecking: STILL_CHECKING,
  stillCheckingLines: STILL_CHECKING_LINES,
};

/*
 * In-tree held paths (full message paths), stripped from the client by the
 * layout (spec 7.2) and never rendered: the words of every program whose row
 * carries `held`. Today: the NIHB and FNHA cards (ruling B1, D-13). The keys
 * stay in en.json and fr.json, so `has` still matches them both ways.
 */
export function heldFundingPaths(): string[] {
  return PROGRAM_META.filter((meta) => meta.held !== undefined).map(
    (meta) => `SleepApneaCare.funding.programs.${meta.id}`,
  );
}

/*
 * The federal section (#federal), in the record's order (A.2 item 5): NIHB
 * (with the FNHA card for BC), Veterans Affairs Canada, the medical expense
 * tax credit. Each row's heading is `ui.fundingPage.<heading>`.
 */
export const FEDERAL_ROWS: Array<{
  program: string;
  heading: 'nihbHeading' | 'vacHeading' | 'taxHeading';
  also?: string[];
}> = [
  { program: 'fed-nihb-respiratory', heading: 'nihbHeading', also: ['bc-fnha-mse'] },
  { program: 'fed-vac-poc9', heading: 'vacHeading' },
  { program: 'fed-cra-medical', heading: 'taxHeading' },
];

/*
 * "Before you buy a machine" (#paying, part 3; always visible): each line of
 * `ui.fundingPage.buyFirstItems`, the province and program it is about, and
 * the page it rests on. In the checker's results the same card lists only the
 * reader's province's line (none outside ON, BC and SK: the body alone).
 */
export const BUY_FIRST_ITEMS: Array<{
  item: '1' | '2' | '3';
  province: ProvinceCode;
  program: string;
  sources: SourceId[];
}> = [
  { item: '1', province: 'ON', program: 'on-adp-respiratory', sources: ['on-adp-respiratory'] },
  { item: '2', province: 'BC', program: 'bc-bcea-breathing', sources: ['bc-bcea-breathing'] },
  { item: '3', province: 'SK', program: 'sk-sail-cpap', sources: ['sk-sail-cpap'] },
];

/* "Where we're still checking" (A.2 item 6): checkingBody, then these cards (keys under `funding.province`). */
export const CHECKING_CARDS: Array<{ key: 'aadl' | 'qc-still-checking'; sources: SourceId[] }> = [
  { key: 'aadl', sources: [] },
  { key: 'qc-still-checking', sources: ['qc-inesss-osa'] },
];

/* In-site links. Each resolves through the engine's chapterHref in the page locale. */
export const NOT_TESTED_YET_CHAPTER: ChapterSlug = 'is-it-sleep-apnea'; // ui.fundingResults.notTestedYetLink
export const CLOSING_CHAPTER: ChapterSlug = 'starting-cpap'; // ui.fundingPage.closingCta

/*
 * The urgent exit (A.2 item 2), never gated: linked to Chapter 02's red-flag
 * block (SLEEP_SITE.anchors.redFlags). Its words are the landing's urgent-exit
 * chapter's (landing-meta.ts URGENT_EXIT_CHAPTER, 'this-might-be-you'), as on
 * the Diabetes funding page: Chapter 02's own pair says the signs are "at the
 * top of this page", which is only true on Chapter 02.
 */
export const URGENT_EXIT_WORDS_CHAPTER: ChapterSlug = 'this-might-be-you';

/*
 * The register entries behind the page's own sentences, by message key under
 * `SleepApneaCare` (claims table, section C). Program cards cite their row's
 * `sources`, caution cards PROVINCE_CAUTION's. A line about Liivv itself rests
 * on the owner's word instead (OWNER_LINES). Lines that make no factual claim
 * (advice such as "Ask your sleep clinic", headings, controls) cite nothing.
 */
export const PAGE_SOURCES: Record<string, SourceId[]> = {
  'funding.options.test.inLab': ['bcg-osa-adults-appx-e'],
  'funding.options.test.home': ['bcg-osa-adults-appx-e'],
  'funding.liivv.askUsBody': [
    'nihb-general-policies',
    'on-odsp-msn-directive',
    'on-adp-respiratory',
  ],
  'ui.fundingPage.payingIntro': [
    'sk-sail-cpap',
    'on-adp-respiratory',
    'on-odsp-msn-directive',
    'nihb-general-policies',
    'fed-cra-medical',
  ],
  'ui.fundingPage.buyFirstBody': ['on-adp-respiratory', 'bc-bcea-breathing', 'sk-sail-cpap'],
  'ui.fundingPage.buyFirstItems.1': ['on-adp-respiratory'],
  'ui.fundingPage.buyFirstItems.2': ['bc-bcea-breathing'],
  'ui.fundingPage.buyFirstItems.3': ['sk-sail-cpap'],
  'ui.fundingPage.enough1Body': ['cla-sleep-apnea', 'bc-pap-buyers-guide', 'ab-cpap-buyers-2026'],
  'ui.fundingPage.enough3Body': ['cla-sleep-apnea'],
  'ui.fundingChecker.assistanceHint': [
    'on-odsp-msn',
    'bc-bcea-breathing',
    'ab-aish',
    'nb-sd-respiratory',
  ],
  'ui.fundingChecker.indigenousHint': ['nihb-eligibility'],
  /* Not in the claims table: the benefit's own page, added so the hint carries a chip. */
  'ui.fundingChecker.veteranHint': ['fed-vac-poc9'],
  'ui.fundingChecker.privateHint': [
    'on-odsp-msn',
    'bc-bcea-breathing',
    'ab-aish',
    'nb-sd-respiratory',
    'nihb-pap',
  ],
  'ui.fundingChecker.testHint': ['on-adp-resp-manual-2024', 'sk-sail-cpap'],
  'ui.fundingChecker.needHint': ['on-adp-respiratory', 'on-odsp-msn'],
  'ui.fundingResults.notTestedYetBody': [
    'on-adp-resp-manual-2024',
    'sk-sail-cpap',
    'nihb-pap',
    'bc-bcea-breathing',
    'fed-cra-medical',
  ],
  'ui.fundingResults.testNote.on-adp-respiratory': ['on-adp-resp-manual-2024'],
  'ui.fundingResults.testNote.sk-sail-cpap': ['sk-sail-cpap'],
  'ui.fundingResults.suppliesNote.sk-sail-cpap': ['sk-sail-cpap'],
  'ui.fundingResults.suppliesNote.mb-misericordia-cpap': ['mb-misericordia-cpap'],
  'ui.fundingResults.adpNoSuppliesTitle': ['on-adp-respiratory'],
  'ui.fundingResults.adpNoSuppliesBody': ['on-adp-respiratory', 'on-odsp-msn'],
  'ui.fundingResults.privateFirstBody': [
    'on-odsp-msn',
    'bc-bcea-breathing',
    'ab-aish',
    'nb-sd-respiratory',
    'nihb-pap',
  ],
};

/* Lines about Liivv itself, resting on the owner's word (plan Part B rules; D-1, B4 default). Review only. */
export const OWNER_LINES = [
  'funding.liivv.askUsTitle',
  'funding.liivv.askUsBody',
  'ui.fundingPage.directBody',
  'ui.fundingPage.directEmpty',
];
