/**
 * Eligibility data + rules for the "Financial help checker" section.
 *
 * Source of truth: Diabetes-Coverage-Canada-Master-Reference.docx (client-provided,
 * reviewed July 2026). Figures/eligibility change often, so every result links to the
 * official government page for the reader to confirm and apply. Update this file (not the
 * builder) when coverage changes, and re-verify against the linked primary sources.
 */

export type ProvinceCode =
  | 'BC' | 'AB' | 'SK' | 'MB' | 'ON' | 'QC' | 'NB' | 'NS' | 'PE' | 'NL' | 'YT' | 'NT' | 'NU';

export type DiabetesType = 't1' | 't2' | 'gestational' | 'prediabetes' | 'unsure';
export type YesNoUnsure = 'yes' | 'no' | 'unsure';
export type AgeGroup = 'under18' | '18to25' | '26to64' | '65plus';
export type YesNoNa = 'yes' | 'no' | 'na';

export interface CheckerInput {
  province: ProvinceCode | '';
  type: DiabetesType | '';
  insulin: YesNoUnsure | '';
  age: AgeGroup | '';
  indigenous: YesNoNa | '';
}

export interface ResultCard {
  id: string;
  title: string;
  body: string;
  linkLabel: string;
  linkUrl: string;
}

interface ProvinceData {
  name: string;
  /** National Pharmacare agreement live (many diabetes meds free at the counter). */
  pharmacareLive: boolean;
  /** Reported close but not signed (Ontario). */
  pharmacareWatch?: boolean;
  pump: string;
  cgm: string;
  applyUrl: string;
  applyLabel: string;
}

export const PROVINCE_OPTIONS: { value: ProvinceCode; label: string }[] = [
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

export const PROVINCES: Record<ProvinceCode, ProvinceData> = {
  BC: {
    name: 'British Columbia',
    pharmacareLive: true,
    pump: 'Insulin pumps, CGM and flash monitors are covered through Fair PharmaCare with Special Authority (all ages, including hybrid closed-loop systems).',
    cgm: 'CGM and flash monitors are covered via Special Authority for eligible plan members who need them.',
    applyUrl:
      'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/what-we-cover/medical-supplies-coverage/diabetes-supplies',
    applyLabel: 'BC PharmaCare — diabetes supplies',
  },
  AB: {
    name: 'Alberta',
    pharmacareLive: false,
    pump: 'The Insulin Pump Therapy Program covers pumps for people with Type 1 (or Type 3c) who meet the criteria.',
    cgm: 'CGM and the FreeStyle Libre 2 are covered for eligible insulin-dependent Albertans enrolled in a government-sponsored plan.',
    applyUrl: 'https://www.alberta.ca/specialized-drug-benefits',
    applyLabel: 'Alberta — specialized drug benefits',
  },
  SK: {
    name: 'Saskatchewan',
    pharmacareLive: false,
    pump: 'The Saskatchewan Insulin Pump Program covers adults and children (apply through an SHA diabetes education program).',
    cgm: 'Advanced glucose monitors are covered for ages under 18, 18–25, and 65+. Adults 26–64 are currently a coverage gap.',
    applyUrl:
      'https://www.saskatchewan.ca/residents/health/accessing-health-care-services/insulin-pump-program',
    applyLabel: 'Saskatchewan Insulin Pump Program',
  },
  MB: {
    name: 'Manitoba',
    pharmacareLive: true,
    pump: 'Pediatric and adult (18+, Type 1) insulin pump programs are available.',
    cgm: 'CGM and flash monitors are available for anyone with Type 1 or Type 2 on insulin who meets the criteria.',
    applyUrl: 'https://sharedhealthmb.ca/patient-care/diabetes-care/',
    applyLabel: 'Shared Health Manitoba — diabetes care',
  },
  ON: {
    name: 'Ontario',
    pharmacareLive: false,
    pharmacareWatch: true,
    pump: 'The Assistive Devices Program (ADP) funds insulin pumps for people with Type 1 who meet the criteria, plus a grant toward supplies.',
    cgm: 'CGM is funded through the ADP for eligible people with Type 1; flash monitoring is covered through the Ontario Drug Benefit for those who qualify.',
    applyUrl: 'https://www.ontario.ca/page/get-support-for-diabetes-equipment-and-supplies',
    applyLabel: 'Ontario — diabetes equipment and supplies',
  },
  QC: {
    name: 'Quebec',
    pharmacareLive: false,
    pump: 'The RAMQ Insulin Pump Access Program covers pumps for those who meet the criteria before age 18.',
    cgm: 'Dexcom and FreeStyle Libre are covered through the RAMQ drug plan for those who meet the criteria.',
    applyUrl: 'https://www.quebec.ca/en/health/health-issues/a-z/diabetes/insulin-pump-access-program',
    applyLabel: 'Quebec — Insulin Pump Access Program',
  },
  NB: {
    name: 'New Brunswick',
    pharmacareLive: false,
    pump: 'The NB Insulin Pump Program supports residents of all ages with Type 1 (income-based cost-sharing applies).',
    cgm: 'CGM support is available for medically eligible residents with Type 1. There is no public flash-monitor coverage.',
    applyUrl:
      'https://www2.gnb.ca/content/gnb/en/departments/health/patientinformation/PrimaryHealthCare/A-Comprehensive-Diabetes-Strategy-for-New-Brunswickers/TheNewBrunswickInsulinPumpProgram-IPP.html',
    applyLabel: 'NB Insulin Pump Program',
  },
  NS: {
    name: 'Nova Scotia',
    pharmacareLive: false,
    pump: 'The Nova Scotia Insulin Pump Program is open to all ages (income-based contributions apply).',
    cgm: 'The Sensor-based Glucose Monitoring Program helps residents aged 2+ with approved sensors (income-based).',
    applyUrl: 'https://www.novascotia.ca/apply-funding-insulin-pump-and-supplies-insulin-pump-program',
    applyLabel: 'Nova Scotia Insulin Pump Program',
  },
  PE: {
    name: 'Prince Edward Island',
    pharmacareLive: true,
    pump: 'The PEI Insulin Pump Program covers eligible residents of all ages with Type 1.',
    cgm: 'The Glucose Sensor Program provides sensors at reduced cost through local pharmacies.',
    applyUrl:
      'https://www.princeedwardisland.ca/en/information/health-and-wellness/insulin-pump-program',
    applyLabel: 'PEI Insulin Pump & Glucose Sensor programs',
  },
  NL: {
    name: 'Newfoundland and Labrador',
    pharmacareLive: false,
    pump: 'The NL Insulin Pump Program covers people with Type 1 (income-tested for those 18+).',
    cgm: 'CGM coverage (full or partial) is available for people with Type 1 who meet the medical and income criteria. There is no public flash-monitor coverage.',
    applyUrl: 'https://www.easternhealth.ca/find-health-care/nlipp/',
    applyLabel: 'NL Insulin Pump Program (NLIPP)',
  },
  YT: {
    name: 'Yukon',
    pharmacareLive: true,
    pump: 'Insulin pumps and 100% of pump supplies are covered for all ages.',
    cgm: 'CGM and flash monitors are covered for all ages.',
    applyUrl: 'https://yukon.ca',
    applyLabel: 'Yukon — Chronic Disease & Disability Benefit',
  },
  NT: {
    name: 'Northwest Territories',
    pharmacareLive: false,
    pump: 'Insulin pumps and 100% of supplies are covered for all ages.',
    cgm: 'Dexcom and FreeStyle Libre are covered for children 19 and under on intensive insulin and for people with Type 1.',
    applyUrl: 'https://www.hss.gov.nt.ca',
    applyLabel: 'NWT — Extended Health Benefits',
  },
  NU: {
    name: 'Nunavut',
    pharmacareLive: false,
    pump: 'Insulin pumps and 100% of supplies are covered for all ages.',
    cgm: 'There is no territorial CGM coverage. NIHB-eligible residents can access CGM federally (see First Nations & Inuit below).',
    applyUrl: 'https://www.gov.nu.ca/health',
    applyLabel: 'Government of Nunavut — Health',
  },
};

const FEDERAL = {
  pharmacare:
    'https://www.canada.ca/en/health-canada/services/health-services-benefits/national-pharmacare.html',
  dtc: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit.html',
  cdb: 'https://www.canada.ca/en/services/benefits/disability/canada-disability-benefit.html',
  childDisability:
    'https://www.canada.ca/en/revenue-agency/services/child-family-benefits/child-disability-benefit.html',
  rdsp: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/registered-disability-savings-plan-rdsp.html',
  nihb: 'https://sac-isc.gc.ca/eng/1572537161086/1572537234517',
  canrisk: 'https://www.healthycanadians.gc.ca/en/canrisk',
  smallSteps: 'https://www.smallstepsforbigchanges.com/',
} as const;

/** DTC-eligible: Type 1 qualifies on diagnosis alone; Type 2 on insulin may qualify. */
function isDtcEligible(input: CheckerInput): boolean {
  return input.type === 't1' || (input.type === 't2' && input.insulin === 'yes');
}

function usesInsulin(input: CheckerInput): boolean {
  return input.type === 't1' || input.insulin === 'yes';
}

/** True once the checker has enough to produce meaningful results. */
export function isCheckerReady(input: CheckerInput): boolean {
  return input.province !== '' && input.type !== '';
}

/**
 * Build the personalized list of programs the person likely qualifies for.
 * Pure function — safe to unit test.
 */
export function buildResults(input: CheckerInput): ResultCard[] {
  const cards: ResultCard[] = [];
  const province = input.province === '' ? undefined : PROVINCES[input.province];
  const dtc = isDtcEligible(input);
  const insulin = usesInsulin(input);

  // Free medications — National Pharmacare
  if (province?.pharmacareLive) {
    cards.push({
      id: 'pharmacare',
      title: 'Free diabetes medications',
      body: `In ${province.name}, national pharmacare covers many diabetes medications at no cost at the pharmacy counter — just your health card, no forms.`,
      linkLabel: 'About national pharmacare',
      linkUrl: FEDERAL.pharmacare,
    });
  } else if (province?.pharmacareWatch) {
    cards.push({
      id: 'pharmacare-watch',
      title: 'Free medications — coming?',
      body: `${province.name} has not signed a national pharmacare agreement yet, but it is reported to be close. Public drug coverage today runs through the province's existing plans.`,
      linkLabel: 'About national pharmacare',
      linkUrl: FEDERAL.pharmacare,
    });
  }

  // Insulin pump program (Type 1)
  if (input.type === 't1' && province) {
    cards.push({
      id: 'pump',
      title: 'Insulin pump program',
      body: province.pump,
      linkLabel: province.applyLabel,
      linkUrl: province.applyUrl,
    });
  }

  // CGM / flash monitor (anyone on insulin)
  if (insulin && province) {
    cards.push({
      id: 'cgm',
      title: 'Glucose monitor (CGM / flash)',
      body: province.cgm,
      linkLabel: province.applyLabel,
      linkUrl: province.applyUrl,
    });
  }

  // Disability Tax Credit
  if (dtc) {
    const reason =
      input.type === 't1'
        ? 'Living with Type 1 diabetes qualifies you for the federal Disability Tax Credit on diagnosis alone.'
        : 'Because you use insulin, you may qualify for the federal Disability Tax Credit under the life-sustaining therapy rules.';
    cards.push({
      id: 'dtc',
      title: 'Disability Tax Credit (DTC)',
      body: `${reason} It can mean real money back — apply with CRA Form T2201. The DTC also unlocks the benefits below.`,
      linkLabel: 'Disability Tax Credit — how to apply',
      linkUrl: FEDERAL.dtc,
    });

    // Canada Disability Benefit (18–64, income-tested)
    if (input.age === '18to25' || input.age === '26to64') {
      cards.push({
        id: 'cdb',
        title: 'Canada Disability Benefit',
        body: 'With a valid DTC, adults aged 18–64 can receive a tax-free monthly payment (income-tested). Worth checking even if you work.',
        linkLabel: 'Canada Disability Benefit',
        linkUrl: FEDERAL.cdb,
      });
    }

    // Child Disability Benefit (under 18)
    if (input.age === 'under18') {
      cards.push({
        id: 'child-disability',
        title: 'Child Disability Benefit',
        body: 'A child with a DTC is eligible for this tax-free monthly payment, paid automatically with the Canada Child Benefit once the DTC is approved.',
        linkLabel: 'Child Disability Benefit',
        linkUrl: FEDERAL.childDisability,
      });
    }

    // RDSP
    cards.push({
      id: 'rdsp',
      title: 'Registered Disability Savings Plan (RDSP)',
      body: 'With a DTC you can open an RDSP, where the federal government adds matching grants and (for lower incomes) bonds — a frequently missed opportunity.',
      linkLabel: 'RDSP — grants and bonds',
      linkUrl: FEDERAL.rdsp,
    });
  }

  // First Nations & Inuit — NIHB
  if (input.indigenous === 'yes') {
    cards.push({
      id: 'nihb',
      title: 'First Nations & Inuit (NIHB)',
      body: 'If you are a registered First Nations person or recognized Inuk, the Non-Insured Health Benefits program covers diabetes medications, CGM (for insulin users), test strips, and pumps and supplies — usually at no cost. Client line: 1-888-441-4777.',
      linkLabel: 'Non-Insured Health Benefits (NIHB)',
      linkUrl: FEDERAL.nihb,
    });
  }

  // Prediabetes / prevention
  if (input.type === 'prediabetes') {
    cards.push({
      id: 'canrisk',
      title: 'Know your risk',
      body: 'CANRISK is the official government questionnaire that scores your risk of Type 2 diabetes and tells you when to see a doctor.',
      linkLabel: 'CANRISK questionnaire',
      linkUrl: FEDERAL.canrisk,
    });
    cards.push({
      id: 'small-steps',
      title: 'Free prevention program',
      body: 'Small Steps for Big Changes is a free, evidence-based program (YMCA with Diabetes Canada and UBC) with coaching on nutrition and activity to help delay or prevent Type 2 diabetes.',
      linkLabel: 'Small Steps for Big Changes',
      linkUrl: FEDERAL.smallSteps,
    });
  }

  return cards;
}
