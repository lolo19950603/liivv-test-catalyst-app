/**
 * Canadian ostomy funding — data and eligibility rules.
 *
 * There is no national ostomy program. The amount, the coverage model, and who
 * signs off all change at the provincial border, which is exactly why this page
 * needs to exist: no Canadian retailer or patient org has assembled it properly.
 *
 * HOW THIS FILE STAYS HONEST
 *
 * `amount` is only populated when the figure was confirmed on the jurisdiction's
 * own government page. When we could not confirm one, `amount` stays empty and
 * the UI links out instead of stating a number. A missing figure is honest; a
 * stale figure costs someone money. Do not copy amounts from patient-org
 * summaries into `amount` — they are secondary sources and they go out of date.
 *
 * `verifiedOn` is the date the entry was last checked against `officialUrl`.
 * It is rendered on the page. Re-check annually — most programs reset each
 * fiscal or program year.
 */

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

/**
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
  /** Official program name. Empty when the jurisdiction has no ostomy-specific program. */
  programName: string;
  model: CoverageModel;
  /**
   * Plain-language amount, ONLY when confirmed on the official government page.
   * Empty means "we could not confirm this — link out instead".
   */
  amount: string;
  howToApply: string;
  /** Who has to sign off: NSWOC, physician, program registration, or self-application. */
  gatekeeper: string;
  /** Renewal periods, claim windows, retroactivity. */
  deadlines?: string;
  officialUrl: string;
  officialLabel: string;
  /** What a person would otherwise be caught out by. */
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
  /** Rendered as "Checked against the official page on ..." */
  verifiedOn?: string;
  tone: 'primary' | 'supporting' | 'caution';
}

export const PROVINCE_OPTIONS: Array<{ value: ProvinceCode; label: string }> = [
  { value: 'BC', label: 'British Columbia' },
  { value: 'AB', label: 'Alberta' },
  { value: 'SK', label: 'Saskatchewan' },
  { value: 'MB', label: 'Manitoba' },
  { value: 'ON', label: 'Ontario' },
  { value: 'QC', label: 'Quebec' },
  { value: 'NB', label: 'New Brunswick' },
  { value: 'NS', label: 'Nova Scotia' },
  { value: 'PE', label: 'Prince Edward Island' },
  { value: 'NL', label: 'Newfoundland and Labrador' },
  { value: 'YT', label: 'Yukon' },
  { value: 'NT', label: 'Northwest Territories' },
  { value: 'NU', label: 'Nunavut' },
];

export const MODEL_COPY: Record<CoverageModel, { label: string; blurb: string }> = {
  'flat-grant': {
    label: 'A flat grant, paid to you',
    blurb:
      'A set amount arrives each year and you buy your own supplies. Anything above the grant is yours to cover — and may be claimable as a medical expense at tax time.',
  },
  'cost-share': {
    label: 'A percentage cost-share',
    blurb:
      'The program covers a share and you pay the rest, often up to an annual maximum. Low income usually reduces or removes your share.',
  },
  'supplies-in-kind': {
    label: 'Supplies issued to you',
    blurb:
      'The program sends the supplies rather than reimbursing you, so you are registered rather than applying — and you do not buy them at retail.',
  },
  categorical: {
    label: 'Only if you qualify',
    blurb:
      'There is no general program. Coverage runs through specific routes — seniors, social assistance, or a named condition — so the question is which category you fall into.',
  },
  none: {
    label: 'No ostomy-specific program',
    blurb:
      'Nothing covers ostomy supplies directly here. Federal routes and tax credits may still help.',
  },
};

export const FEDERAL_LINKS = {
  dtc: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/eliminating.html',
  t2201: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/forms/t2201.html',
  nihb: 'https://www.sac-isc.gc.ca/eng/1579620079031/1579620259238',
  medicalExpenses:
    'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/lines-33099-33199-eligible-medical-expenses-you-claim-tax-return.html',
  rdsp: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-disability-savings-plan-rdsp.html',
} as const;

/**
 * Verified 2026-08-27 against each jurisdiction's own government page.
 *
 * Entries with an empty `amount` are ones where the official page publishes no
 * figure. Numbers circulate for those jurisdictions on patient-org and vendor
 * sites; they are not government rates and are not repeated here.
 *
 * A note on the amounts that are easy to get wrong, because they are correct
 * about the wrong thing: Alberta's $500 is a ceiling on what the PATIENT pays,
 * not a benefit. Nova Scotia's premiums are Pharmacare figures, not ostomy
 * amounts. Manitoba has no dollar figure at all, and that is the right answer
 * rather than a gap. Phrase every amount so the sentence says what the number is.
 */
export const PROGRAMS: Record<ProvinceCode, ProgramFacts> = {
  ON: {
    name: 'Ontario',
    programName: 'Assistive Devices Program — Ostomy Grant',
    model: 'flat-grant',
    amount:
      'You receive $975 per ostomy per year, paid in two instalments. That rises to $1,300 if you live in a long-term care home or receive social assistance.',
    howToApply:
      'A physician or nurse practitioner examines you and confirms the ostomy, you both complete form 014-1945-67, and it goes to the Assistive Devices Program. The money is paid to you, not to a vendor, so you can buy supplies wherever you like.',
    gatekeeper:
      'A physician or nurse practitioner — an NSWOC signature is not required here, which differs from several other provinces.',
    deadlines:
      'Renew every two years; ADP sends paperwork about three months before expiry. Reviews take up to eight weeks, with the first payment within 30 days of approval.',
    officialUrl: 'https://www.ontario.ca/page/enteral-feeding-and-ostomy',
    officialLabel: 'Ontario — enteral feeding and ostomy grant',
    notes:
      'A temporary ostomy only qualifies if it is needed for longer than six months. If you receive ODSP, the Mandatory Special Necessities benefit can cover costs above the grant — but only once the ADP grant is used up.',
    verifiedOn: '2026-08-27',
  },
  BC: {
    name: 'British Columbia',
    programName: 'PharmaCare — ostomy supplies',
    model: 'cost-share',
    amount:
      'After an income-based family deductible, PharmaCare pays 70% of eligible costs — 75% if a family member was born before 1940 — then 100% once you reach the family maximum.',
    howToApply:
      'There is no ostomy application. The step that matters is registering for Fair PharmaCare, which sets your deductible. Register at gov.bc.ca or on 1-800-663-7100, then coverage applies automatically at the till through an authorised provider.',
    gatekeeper:
      'Nobody clinical — registration and CRA income verification are the gate. The practical gatekeeper is a provider who can bill under a listed product code.',
    deadlines:
      'Return the mailed consent form within 30 days or registration does not complete. Deductibles run on the calendar year.',
    officialUrl:
      'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/what-we-cover/medical-supplies-coverage/ostomy-supplies',
    officialLabel: 'BC PharmaCare — ostomy supplies',
    notes:
      'If you do not register for Fair PharmaCare you are assigned a $10,000 deductible by default, which means paying for everything yourself. Registering is the single highest-value thing a BC reader can do. Note that skin barriers, protectants, deodorants and cleansers are not covered — people routinely assume they are.',
    verifiedOn: '2026-08-27',
  },
  AB: {
    name: 'Alberta',
    programName: 'Alberta Aids to Daily Living (AADL)',
    model: 'cost-share',
    amount:
      'You pay 25% of the cost, up to a maximum of $500 per family per benefit year — after which AADL covers 100% for the rest of the year. The $500 is a ceiling on what you pay, not an amount you receive.',
    howToApply:
      'An AADL-approved authoriser assesses you and authorises the products; an approved vendor then bills AADL directly and charges you your share at the point of sale.',
    gatekeeper:
      'An AADL-approved authoriser — for ostomy products this is a registered nurse, and in practice usually an NSWOC.',
    deadlines: 'The benefit year runs 1 July to 30 June.',
    officialUrl: 'https://www.alberta.ca/aadl-cost-sharing-of-benefits',
    officialLabel: 'Alberta — AADL cost-sharing',
    notes:
      'Low-income Albertans and income-assistance recipients pay nothing at all. If you are excluded because another plan covers you fully — Veterans Affairs, NIHB, or WCB — that other plan is the route.',
    verifiedOn: '2026-08-27',
  },
  SK: {
    name: 'Saskatchewan',
    programName: 'SAIL — Ostomy Program',
    model: 'cost-share',
    amount:
      'The province pays 50% of eligible supplies within quantity limits, and you pay the other half. There is no annual dollar cap.',
    howToApply:
      'Referral from an ET/NSWOC nurse at a Saskatchewan stoma clinic. This is the only route in — a prescription from your family doctor will not register you, and there is no way to apply for yourself.',
    gatekeeper:
      'An ET/NSWOC nurse at a provincial stoma clinic. Registration comes before coverage.',
    officialUrl:
      'https://www.saskatchewan.ca/residents/health/accessing-health-care-services/health-services-for-people-with-disabilities/sail',
    officialLabel: 'Saskatchewan — SAIL',
    notes:
      'Some people get supplies at no charge rather than at 50% — Paraplegia Program registrants, and holders of Supplementary Health Benefits through SAID, SIS or SEI. Worth asking about before assuming you pay half.',
    verifiedOn: '2026-08-27',
  },
  MB: {
    name: 'Manitoba',
    programName: 'Manitoba Ostomy Program',
    model: 'supplies-in-kind',
    amount: '',
    howToApply:
      'You are registered by an NSWOC after surgery rather than applying yourself. The program then covers basic supplies in full and sends them to you — there is nothing to pay and nothing to claim back.',
    gatekeeper:
      'An NSWOC, who sets your supply list. Any change to that list also needs NSWOC approval.',
    deadlines:
      'Order at least two weeks ahead. You can request up to three months of supplies at a time.',
    officialUrl: 'https://sharedhealthmb.ca/services/mop/',
    officialLabel: 'Shared Health Manitoba — Ostomy Program',
    notes:
      'There is no dollar figure here, and that is correct rather than missing — limits are set per product in quantities, not in money. Any number you find quoted for Manitoba is not a current benefit rate.',
    verifiedOn: '2026-08-27',
  },
  QC: {
    name: 'Quebec',
    programName: 'RAMQ — Ostomy Appliances Program',
    model: 'flat-grant',
    amount:
      'An annual lump sum of $1,510 for a permanent ostomy, or $1,007 for a temporary one. Paid per ostomy, so two stomas means two allocations.',
    howToApply:
      'You apply to RAMQ yourself. The only conditions are being insured under the Québec Health Insurance Plan and having had a colostomy, ileostomy or urostomy.',
    gatekeeper: 'No clinical sign-off is needed to submit — you apply directly.',
    deadlines:
      'Amounts are indexed every 1 January. Temporary-ostomy payments are split — half when the application is accepted, then every six months until the stoma is closed.',
    officialUrl: 'https://www.ramq.gouv.qc.ca/en/citizens/aid-programs/appliances-ostomates',
    officialLabel: 'RAMQ — appliances for ostomates',
    notes:
      'If you hold a claim slip through social assistance you are reimbursed at actual cost instead of the lump sum. There is also a voluntary agreement that pays your supplier directly and ends the lump-sum payments — useful for some people, but it is a one-way switch worth understanding first.',
    verifiedOn: '2026-08-27',
  },
  NB: {
    name: 'New Brunswick',
    programName: 'Ostomy/Incontinence Program — Social Development clients only',
    model: 'categorical',
    amount: '',
    howToApply:
      'There is no general ostomy program in New Brunswick. If you are a Social Development client with a qualifying health card, eligible supplies cost you nothing and the program pays pharmacies and suppliers directly. If you are not, this route is closed and the federal and tax options below are where to look.',
    gatekeeper:
      'Your Social Development health card is the gate — it must show the right supplementary or ostomy eligibility code.',
    officialUrl:
      'https://www2.gnb.ca/content/gnb/en/departments/social_development/health_services.html',
    officialLabel: 'New Brunswick — Social Development health services',
    notes:
      'Coverage is capped by monthly quantities per product rather than by dollars — for example a set number of wafers and pouches each month.',
    verifiedOn: '2026-08-27',
  },
  NS: {
    name: 'Nova Scotia',
    programName: 'Pharmacare — ostomy supplies on the provincial formulary',
    model: 'cost-share',
    amount:
      'Ostomy products are a listed Pharmacare benefit, so what you pay depends on which plan you are in rather than on an ostomy-specific rate.',
    howToApply:
      'Ostomy products are dispensed as prescriptions through a Nova Scotia pharmacy, so the route is a prescriber plus enrolment in a Pharmacare plan. Family Pharmacare is open to any resident without other drug coverage — worth knowing, because Nova Scotia is often described as having nothing for the general public, and that is not right.',
    gatekeeper:
      'A physician or nurse practitioner prescribes. An NSWOC is not a gatekeeper here. Plan enrolment is the real step.',
    deadlines:
      'Reimbursement claims must be submitted within six months of the prescription being dispensed — the most commonly missed deadline in the province.',
    officialUrl: 'https://novascotia.ca/dhw/pharmacare/',
    officialLabel: 'Nova Scotia Pharmacare',
    notes:
      'If you are in active cancer treatment with a combined family income of $35,000 or less, the Boarding, Transportation and Ostomy program reimburses actual supply costs on top. Seniors and Income Assistance clients have their own cost-sharing rules.',
    verifiedOn: '2026-08-27',
  },
  PE: {
    name: 'Prince Edward Island',
    programName: 'Ostomy Supplies Program',
    model: 'cost-share',
    amount:
      'Reimburses 60% to 100% of what you spend depending on household income, up to $2,400 per full program year.',
    howToApply:
      'A health care professional submits the Health Care Provider Registration Form for you. After that it is income-tested rather than clinical.',
    gatekeeper: 'A health care professional — the program does not specifically require an NSWOC.',
    deadlines:
      'The program year runs 1 July to 30 June and you must re-apply before it expires or coverage stops. Old invoices are not accepted, so submit regularly rather than saving them up.',
    officialUrl:
      'https://www.princeedwardisland.ca/en/information/health-and-wellness/ostomy-supplies-program',
    officialLabel: 'PEI — Ostomy Supplies Program',
    notes: 'Joining part-way through the year pro-rates the maximum.',
    verifiedOn: '2026-08-27',
  },
  NL: {
    name: 'Newfoundland and Labrador',
    programName: 'Ostomy Subsidy Program — 65Plus Plan cardholders',
    model: 'cost-share',
    amount:
      'Reimburses 75% of the retail cost of eligible items — but only for 65Plus Plan cardholders, meaning seniors receiving both Old Age Security and the Guaranteed Income Supplement.',
    howToApply:
      'Enrolment happens automatically through your OAS and GIS status. You buy the supplies, keep the original prescription receipts, and claim the 75% back.',
    gatekeeper: 'No separate assessor — a prescription and your 65Plus card are what is needed.',
    officialUrl: 'https://www.gov.nl.ca/hcs/prescription/nlpdp-plan-overview/',
    officialLabel: 'Newfoundland and Labrador — NLPDP',
    notes:
      'If you are under 65, or not receiving GIS, the official page does not name you as eligible for this subsidy. Check the other NLPDP plans and the federal routes below.',
    verifiedOn: '2026-08-27',
  },
  YT: {
    name: 'Yukon',
    programName: 'Chronic Disease and Disability Benefits',
    model: 'cost-share',
    amount: '',
    howToApply:
      'Your physician — or a community health nurse where there is no resident doctor — applies on your behalf, and pre-approval before you buy is expected. If you are 65 or over you are covered instead through Seniors Pharmacare, enrolled automatically.',
    gatekeeper:
      'A physician or community health nurse. Note that having an ostomy is not by itself a qualifying condition — coverage runs through a closed list of chronic diseases, and several common causes of ostomy are not on it. Confirm your specific diagnosis before assuming you are covered.',
    deadlines:
      'Apply before you buy. Purchases made outside Yukon without prior approval must be claimed within one year.',
    officialUrl:
      'https://yukon.ca/en/health-and-wellness/care-services/get-help-costs-if-you-have-chronic-disease-or-disability',
    officialLabel: 'Yukon — help with costs for chronic disease or disability',
    notes:
      'Yukon publishes no ostomy figure and no deductible amount on its own pages. Numbers circulate elsewhere; we are not repeating them, because we could not confirm them. Call the program to get your own numbers before planning around them.',
    verifiedOn: '2026-08-27',
  },
  NT: {
    name: 'Northwest Territories',
    programName: 'Extended Health Benefits',
    model: 'cost-share',
    amount:
      'Seniors 60+ and lower-income bands pay nothing. Higher bands pay 25% of the cost up to a yearly family maximum of $500 to $1,500 depending on income band, after which the plan pays everything. There is no deductible on medical supplies.',
    howToApply:
      'Register under the Extended Health Benefits policy, which involves an income assessment — unless you are 60 or over, in which case you are enrolled on age. A prescriber then orders the supplies.',
    gatekeeper:
      'Program registration plus a prescription from a recognised health care prescriber.',
    deadlines: 'Bands and maximums reset on 1 September.',
    officialUrl: 'https://www.hss.gov.nt.ca/en/services/extended-health-benefits',
    officialLabel: 'NWT — Extended Health Benefits',
    notes:
      'Ostomy supplies are covered under general medical supplies rather than a named ostomy benefit. First Nations and Inuit residents go through NIHB instead.',
    verifiedOn: '2026-08-27',
  },
  NU: {
    name: 'Nunavut',
    programName: 'Extended Health Benefits — specified conditions and seniors',
    model: 'categorical',
    amount: '',
    howToApply:
      'There is no ostomy-specific program. If you qualify under specified conditions or seniors coverage, prescribed medical supplies are covered including fitting and shipping — which matters a great deal in Nunavut. Most Nunavummiut are Inuit and are covered federally through NIHB instead.',
    gatekeeper: 'A prescription is required either way.',
    officialUrl:
      'https://www.gov.nu.ca/en/health/extended-health-benefits-ehb-specified-conditions',
    officialLabel: 'Nunavut — Extended Health Benefits',
    notes:
      'Nunavut publishes no amount, cap, or per-item rate for supplies, and no list we could confirm of which conditions qualify. Call Extended Health Benefits on 867-645-8029 to ask whether your diagnosis is on the list rather than assuming either way.',
    verifiedOn: '2026-08-27',
  },
};

/* True once there is enough input to say anything useful. */
export function isCheckerReady(input: CheckerInput): boolean {
  return input.province !== '';
}

/*
 * Build the personalized list of routes worth pursuing.
 * Pure function with no side effects, so it is straightforward to test — though note
 * that core has no test script today, so turbo run test skips this package entirely
 * (the diabetes checker data.test.ts next door has never run for the same reason).
 */
export function buildResults(input: CheckerInput): ResultCard[] {
  const cards: ResultCard[] = [];

  if (input.province === '') return cards;

  const program = PROGRAMS[input.province];

  // First Nations and Inuit route through NIHB *instead of* the provincial
  // program, so this is surfaced first rather than as an afterthought.
  if (input.indigenous === 'yes') {
    cards.push({
      id: 'nihb',
      title: 'Non-Insured Health Benefits comes first',
      body: 'For registered First Nations and recognized Inuit, NIHB covers approved ostomy items subject to quantity limits and prior approval, and recognized providers bill NIHB directly so you do not pay upfront. This replaces the provincial route rather than topping it up. Ask about the exception process if you need more than the standard quantity — high output is a common reason.',
      linkLabel: 'NIHB medical supplies and equipment',
      linkUrl: FEDERAL_LINKS.nihb,
      tone: 'primary',
    });
  }

  {
    const hasAmount = program.amount !== '';

    cards.push({
      id: 'provincial',
      title: program.programName || `${program.name} — no ostomy-specific program`,
      body: [MODEL_COPY[program.model].blurb, hasAmount ? program.amount : '', program.howToApply]
        .filter(Boolean)
        .join(' '),
      linkLabel: program.officialLabel,
      linkUrl: program.officialUrl,
      verifiedOn: program.verifiedOn,
      tone: 'primary',
    });

    cards.push({
      id: 'gatekeeper',
      title: 'Who has to sign off',
      body: program.gatekeeper,
      linkLabel: program.officialLabel,
      linkUrl: program.officialUrl,
      tone: 'supporting',
    });

    if (program.deadlines) {
      cards.push({
        id: 'deadlines',
        title: 'Dates that quietly cost people money',
        body: program.deadlines,
        linkLabel: program.officialLabel,
        linkUrl: program.officialUrl,
        tone: 'caution',
      });
    }
  }

  // Payer-of-last-resort jurisdictions will not pay while private coverage exists.
  if (input.otherCoverage === 'yes' && ['YT', 'NT', 'NU'].includes(input.province)) {
    cards.push({
      id: 'last-resort',
      title: 'Your workplace plan gets billed first',
      body: 'This territory is a payer of last resort, which means private or employer insurance has to be exhausted before the territorial program pays anything. Submit to your insurer first and keep the statement — you will need it.',
      linkLabel: program.officialLabel,
      linkUrl: program.officialUrl,
      tone: 'caution',
    });
  }

  cards.push({
    id: 'dtc',
    title: 'The Disability Tax Credit — worth applying for, but read the test first',
    body: 'Having an ostomy does not qualify you on its own, and a well-managed routine is often refused. The test is whether you are unable to manage bowel or bladder function, or it takes about three times longer than it would for someone of similar age without the impairment, at least 90% of the time, for a continuous 12 months — judged even with your appliances and routine in place. That means complications, leaks and time burden are what the form has to show. Only a medical doctor or nurse practitioner can certify it.',
    linkLabel: 'CRA — eliminating (bowel or bladder)',
    linkUrl: FEDERAL_LINKS.dtc,
    tone: 'supporting',
  });

  cards.push({
    id: 'medical-expenses',
    title: 'Claim what you paid out of pocket — no approval needed',
    body: 'This one has no gate. Ostomy pads and supplies are listed eligible medical expenses, so whatever your province does not cover may be claimable on your return whether or not you have the Disability Tax Credit. Keep every receipt, including shipping where it is not covered.',
    linkLabel: 'CRA — eligible medical expenses',
    linkUrl: FEDERAL_LINKS.medicalExpenses,
    tone: 'supporting',
  });

  return cards;
}
