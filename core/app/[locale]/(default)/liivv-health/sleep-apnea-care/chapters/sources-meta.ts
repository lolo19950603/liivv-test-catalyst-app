/*
 * =============================================================================
 * SLEEP APNEA CARE — SOURCE REGISTER
 * =============================================================================
 * Generated from docs/sleep-content/sources.md (sections 1–11 and 13: 169
 * ids; section 12 is never registered) by the integration step of the Sleep
 * build. Regenerate rather than hand-edit, and keep the two in step.
 *
 * Same shapes and rules as Diabetes Care's register (../../diabetes-care/
 * chapters/sources-meta.ts): titles are identifiers and never go through the
 * message tree; `labelFr` and `hrefFr` only where sources.md records a French
 * twin ("FR:"); every other entry shows its English title and page on /fr,
 * marked as English.
 *
 * Scope: CA-gov, CA-reg, CA-clin, CA-org and CA-FN rows are `canadian`; INTL
 * rows `international` (the Healthwise pages HealthLink BC publishes are
 * labelled "Healthwise content (US), published by HealthLink BC" and never stand
 * alone); IND rows `industry` (never the only source for a claim).
 *
 * `display: 'reviewOnly'`: the operations row (OPS), every consumer-law row
 * (section 13: a legal basis for the returns policy, never a chip) and the
 * Medical Devices Regulations. Cards may cite them for the review; no page
 * shows them.
 *
 * Labels follow the register's checks: RA-62729 in the Philips recall label,
 * "(archived page)" on the Statistics Canada fact sheet, "(2017, archived)" on
 * the CADTH brief, ICBC named as a BC Crown corporation. Yuwell's product
 * image is served over http only: its https form is registered (BLOCKER for
 * the machine guide if that does not serve).
 *
 * No imports and erasable TypeScript only: the content-review export loads this
 * file directly under Node's type stripping.
 * =============================================================================
 */

export interface SourceMeta {
  /** Who publishes it, by PUBLISHERS key. */
  publisher: PublisherId;
  /* The year the document carries, shown after the publisher. Left out where none is printed. */
  year?: number;
  /* Where the entry's own scope differs from its publisher's. */
  scope?: SourceScope;
  /* Never rendered on a page: see the header. */
  display?: 'reviewOnly';
  /** The title as its publisher prints it. Never translated. */
  label: string;
  /** Official French title, only where the publisher issues one. */
  labelFr?: string;
  href: string;
  /** Official French file or page, only where the publisher maintains one. */
  hrefFr?: string;
  /** Language of the page or file at `href`. A `hrefFr` link is always French. */
  hrefLang: 'en' | 'fr';
  /*
   * An open ruling holds the link: the entry is still cited by title and
   * publisher, unlinked, until the ruling lets the link show (../../_microsite/sources.ts).
   */
  linkHeld?: string;
}

/* How a Sources list groups an entry: Canadian first, then international, then makers. */
export type SourceScope = 'canadian' | 'international' | 'industry';

export interface Publisher {
  /** The display name, as the publisher writes it in English. */
  name: string;
  /** The publisher's own French name, only where Diabetes Care's register recorded one. */
  nameFr?: string;
  /* Where `name` itself is French, so an English page marks it as French. */
  lang?: 'fr';
  scope: SourceScope;
}

export type PublisherId =
  | 'ab-pathways'
  | 'aboutkidshealth'
  | 'bc-guidelines'
  | 'cadth'
  | 'cahppei'
  | 'catsa'
  | 'cda'
  | 'cla'
  | 'cmc'
  | 'consumer-protection-bc'
  | 'cra'
  | 'crta'
  | 'crto'
  | 'csrt'
  | 'cta'
  | 'cts'
  | 'cts-css'
  | 'cts-css-csrt'
  | 'fda'
  | 'fnha'
  | 'gov-alberta'
  | 'gov-bc'
  | 'gov-canada'
  | 'gov-manitoba'
  | 'gov-nb'
  | 'gov-nl'
  | 'gov-ns'
  | 'gov-nwt'
  | 'gov-ontario'
  | 'gov-pei'
  | 'gov-quebec'
  | 'gov-sk'
  | 'health-canada'
  | 'healthlink-bc'
  | 'healthwise'
  | 'icbc'
  | 'inesss'
  | 'isc'
  | 'justice-canada'
  | 'lhf'
  | 'marrt'
  | 'microsoft'
  | 'misericordia'
  | 'myhealth-alberta'
  | 'nbart'
  | 'nlchp'
  | 'nsrrt'
  | 'on-mto'
  | 'ontario-health'
  | 'opc'
  | 'phac'
  | 'philips'
  | 'qc-opc'
  | 'rac'
  | 'resmed'
  | 'roadsafetybc'
  | 'sleepwell'
  | 'statcan'
  | 'telesante-quebec'
  | 'transcend'
  | 'transport-canada'
  | 'vac'
  | 'yuwell';

export const PUBLISHERS: Record<PublisherId, Publisher> = {
  'ab-pathways': { name: 'Primary Care Alberta and Alberta Health Services', scope: 'canadian' },
  aboutkidshealth: { name: 'AboutKidsHealth (SickKids)', scope: 'canadian' },
  'bc-guidelines': { name: 'BC Guidelines (Government of BC)', scope: 'canadian' },
  cadth: { name: 'CADTH (now Canada’s Drug Agency)', scope: 'canadian' },
  cahppei: { name: 'College of Allied Health Professionals of PEI', scope: 'canadian' },
  catsa: { name: 'CATSA', nameFr: 'ACSTA', scope: 'canadian' },
  cda: { name: 'Canadian Dental Association', scope: 'canadian' },
  cla: { name: 'Canadian Lung Association', scope: 'canadian' },
  cmc: { name: 'Consumer Measures Committee', scope: 'canadian' },
  'consumer-protection-bc': { name: 'Consumer Protection BC', scope: 'canadian' },
  cra: { name: 'Canada Revenue Agency', nameFr: 'Agence du revenu du Canada', scope: 'canadian' },
  crta: { name: 'College of Respiratory Therapists of Alberta', scope: 'canadian' },
  crto: { name: 'College of Respiratory Therapists of Ontario', scope: 'canadian' },
  csrt: { name: 'Canadian Society of Respiratory Therapists', scope: 'canadian' },
  cta: { name: 'Canadian Transportation Agency', scope: 'canadian' },
  cts: { name: 'Canadian Thoracic Society', scope: 'canadian' },
  'cts-css': { name: 'Canadian Thoracic Society and Canadian Sleep Society', scope: 'canadian' },
  'cts-css-csrt': {
    name: 'Canadian Thoracic Society, Canadian Sleep Society and Canadian Society of Respiratory Therapists',
    scope: 'canadian',
  },
  fda: { name: 'U.S. Food and Drug Administration', scope: 'international' },
  fnha: { name: 'First Nations Health Authority', scope: 'canadian' },
  'gov-alberta': { name: 'Government of Alberta', scope: 'canadian' },
  'gov-bc': { name: 'Government of British Columbia', scope: 'canadian' },
  'gov-canada': { name: 'Government of Canada', scope: 'canadian' },
  'gov-manitoba': {
    name: 'Government of Manitoba',
    nameFr: 'Gouvernement du Manitoba',
    scope: 'canadian',
  },
  'gov-nb': { name: 'Government of New Brunswick', scope: 'canadian' },
  'gov-nl': { name: 'Government of Newfoundland and Labrador', scope: 'canadian' },
  'gov-ns': { name: 'Government of Nova Scotia', scope: 'canadian' },
  'gov-nwt': { name: 'Government of the Northwest Territories', scope: 'canadian' },
  'gov-ontario': { name: 'Government of Ontario', scope: 'canadian' },
  'gov-pei': { name: 'Government of Prince Edward Island', scope: 'canadian' },
  'gov-quebec': { name: 'Gouvernement du Québec', lang: 'fr', scope: 'canadian' },
  'gov-sk': { name: 'Government of Saskatchewan', scope: 'canadian' },
  'health-canada': { name: 'Health Canada', nameFr: 'Santé Canada', scope: 'canadian' },
  'healthlink-bc': { name: 'HealthLink BC', scope: 'canadian' },
  healthwise: {
    name: 'Healthwise content (US), published by HealthLink BC',
    scope: 'international',
  },
  icbc: {
    name: 'ICBC (BC’s public auto insurer, a provincial Crown corporation)',
    scope: 'canadian',
  },
  inesss: { name: 'INESSS', scope: 'canadian' },
  isc: {
    name: 'Indigenous Services Canada',
    nameFr: 'Services aux Autochtones Canada',
    scope: 'canadian',
  },
  'justice-canada': { name: 'Justice Laws Website (Government of Canada)', scope: 'canadian' },
  lhf: { name: 'Lung Health Foundation', scope: 'canadian' },
  marrt: { name: 'Manitoba Association of Registered Respiratory Therapists', scope: 'canadian' },
  microsoft: { name: 'Microsoft', scope: 'industry' },
  misericordia: { name: 'Misericordia Health Centre Sleep Disorder Centre', scope: 'canadian' },
  'myhealth-alberta': { name: 'MyHealth Alberta', scope: 'canadian' },
  nbart: { name: 'New Brunswick Association of Respiratory Therapists', scope: 'canadian' },
  nlchp: { name: 'Newfoundland and Labrador Council of Health Professionals', scope: 'canadian' },
  nsrrt: { name: 'Nova Scotia regulator of respiratory therapists (NSRRT)', scope: 'canadian' },
  'on-mto': { name: 'Ontario Ministry of Transportation', scope: 'canadian' },
  'ontario-health': { name: 'Ontario Health', scope: 'canadian' },
  opc: { name: 'Office of the Privacy Commissioner of Canada', scope: 'canadian' },
  phac: {
    name: 'Public Health Agency of Canada',
    nameFr: 'Agence de la santé publique du Canada',
    scope: 'canadian',
  },
  philips: { name: 'Philips', scope: 'industry' },
  'qc-opc': { name: 'Office de la protection du consommateur', lang: 'fr', scope: 'canadian' },
  rac: { name: 'Railway Association of Canada', scope: 'industry' },
  resmed: { name: 'ResMed', scope: 'industry' },
  roadsafetybc: { name: 'RoadSafetyBC (Government of BC)', scope: 'canadian' },
  sleepwell: { name: 'Sleepwell (Dalhousie University)', scope: 'canadian' },
  statcan: { name: 'Statistics Canada', scope: 'canadian' },
  'telesante-quebec': { name: 'Télésanté Québec', lang: 'fr', scope: 'canadian' },
  transcend: { name: 'Transcend (Somnetics)', scope: 'industry' },
  'transport-canada': { name: 'Transport Canada', scope: 'canadian' },
  vac: { name: 'Veterans Affairs Canada', nameFr: 'Anciens Combattants Canada', scope: 'canadian' },
  yuwell: { name: 'Yuwell', scope: 'industry' },
};

export type SourceId =
  | 'cla-sleep-apnea'
  | 'lhf-sleep-apnea'
  | 'bcg-osa-adults'
  | 'bcg-osa-adults-appx-e'
  | 'bcg-osa-options-2021'
  | 'bcg-osa-oral-devices-2021'
  | 'cts-sdb-2011'
  | 'cadth-osa-2017'
  | 'ab-cpap-buyers-2026'
  | 'ab-osa-pathway-2026'
  | 'hlbc-cpap'
  | 'hlbc-snoring-osa'
  | 'oh-insomnia-qs-2025'
  | 'mysleepwell'
  | 'phac-sleep-adults'
  | 'statcan-osa-2018'
  | 'phac-osa-2009'
  | 'akh-osa'
  | 'akh-pap'
  | 'akh-tonsillectomy-osa'
  | 'akh-child-emergency'
  | 'cts-css-peds-dx-2026'
  | 'cts-css-peds-infographic-2026'
  | 'hlbc-ta-osa'
  | 'cts-css-driving-2014'
  | 'rsbc-ccmta-18-6-1'
  | 'on-mto-reporting'
  | 'on-mto-5108e'
  | 'tc-railway-medical-rules'
  | 'rac-rail-handbook-2026'
  | 'on-er'
  | 'ab-mha-emergency'
  | 'health811-home'
  | 'phac-heart-attack'
  | 'phac-stroke'
  | 'icbc-crash-card'
  | 'on-mto-handbook-emergencies'
  | 'on-mto-handbook-drowsy'
  | 'hlbc-sleep-apnea'
  | 'hc-recall-philips-ra-76137'
  | 'hc-recall-philips-ra-75887'
  | 'cts-css-csrt-philips-2021'
  | 'hc-recall-magnet-philips-2022'
  | 'hc-recall-magnet-resmed-2023'
  | 'hc-recall-magnet-philips-masks-2022'
  | 'hc-recall-magnet-novastar-2023'
  | 'cts-css-csrt-magnets-2022'
  | 'fda-resmed-magnets-2024'
  | 'hc-recall-asv-2015'
  | 'pmra-uv-ozone'
  | 'hc-buying-devices-online'
  | 'hc-mdall'
  | 'hc-report-device-problem'
  | 'hc-device-problem-form'
  | 'hc-about-device-problems'
  | 'hc-recalls-safety-alerts'
  | 'hc-mdall-api-doc'
  | 'mdall-lic-106650'
  | 'mdall-lic-93717'
  | 'mdall-lic-110422'
  | 'mdall-lic-99052'
  | 'mdall-lic-105749'
  | 'mdall-lic-113188'
  | 'mdall-lic-112836'
  | 'mdall-lic-102774'
  | 'hc-recall-resmed-2015'
  | 'csrt-rrt'
  | 'crto-pap'
  | 'crto-standard-5'
  | 'crto-community-rt'
  | 'bc-pap-buyers-guide'
  | 'nihb-pap'
  | 'cda-oat'
  | 'catsa-cpap'
  | 'catsa-respiratory-2025'
  | 'catsa-medical-items'
  | 'cta-mobility-aids'
  | 'cta-assistive-devices-guide-2020'
  | 'gac-travel-medical-device'
  | 'atpdr-s49'
  | 'nihb-eligibility'
  | 'nihb-general-policies'
  | 'nihb-contact'
  | 'fnha-mse'
  | 'fnha-mse-fee-2026'
  | 'fed-vac-poc9'
  | 'fed-cra-medical'
  | 'cra-rc4065-2025'
  | 'cra-contact'
  | 'on-adp-respiratory'
  | 'on-adp-resp-manual-2024'
  | 'on-adp-main'
  | 'on-odsp-msn'
  | 'on-odsp-msn-directive'
  | 'sk-sail-cpap'
  | 'sk-sail'
  | 'mb-misericordia-cpap'
  | 'mb-cpap-release-2023'
  | 'bc-pharmacare-not-covered'
  | 'bc-pharmacare-contact'
  | 'bc-bcea-breathing'
  | 'bc-income-assistance-access'
  | 'ab-aish'
  | 'qc-inesss-osa'
  | 'nb-sd-respiratory'
  | 'crto-virtual-care-ppg-2023'
  | 'crto-orders-ppg'
  | 'crto-std6-consent'
  | 'crto-std7-documentation'
  | 'crto-regulator-links'
  | 'ab-crta-standards'
  | 'ab-crta-sop-draft-2023'
  | 'sk-rt-act'
  | 'mb-marrt-licensing'
  | 'mb-telepractice-2020'
  | 'mb-marrt-cpg'
  | 'qc-telehealth-practice'
  | 'qc-tsq-fiche-09-2024'
  | 'nb-nbart-home'
  | 'nb-nbart-licence-guide'
  | 'ns-nsrrt-home'
  | 'ns-nsrrt-am-i-practising'
  | 'ns-nsrrt-telehealth-orders-2023'
  | 'pe-cahppei-home'
  | 'pe-rhpa'
  | 'nl-nlchp-telepractice'
  | 'bc-hpoa'
  | 'on-phipa'
  | 'opc-provincial-laws'
  | 'opc-health-info-contacts'
  | 'hlbc-811'
  | 'ms-bookings-services'
  | 'resmed-ca-tipsheet-2021'
  | 'resmed-airsense11-ug'
  | 'resmed-airsense10-ug-eur'
  | 'resmed-aircurve11-ug'
  | 'resmed-aircurve11-product-guide'
  | 'resmed-aircurve11-page'
  | 'resmed-airmini-ug'
  | 'philips-ds2-manual'
  | 'philips-ds2-leaflet'
  | 'yuwell-yh680-image'
  | 'transcend-micro-manual'
  | 'on-returns-exchanges'
  | 'on-shopping-online'
  | 'on-cpa-2002'
  | 'on-reg-17-05'
  | 'qc-opc-online-advice'
  | 'qc-cpa-p40-1'
  | 'bc-cpbc-selling-online'
  | 'bc-bpcpa'
  | 'bc-sga'
  | 'ab-isr-81-2001'
  | 'ab-cpa'
  | 'ab-sga'
  | 'sk-cpbp-regs'
  | 'sk-cpbpa'
  | 'mb-returns-exchanges'
  | 'mb-cpa'
  | 'mb-reg-176-2000'
  | 'nb-cpwla'
  | 'ns-isr'
  | 'ns-cpa'
  | 'pe-bpa'
  | 'nl-cpbpa'
  | 'nl-sga'
  | 'nt-cpa'
  | 'cmc-internet-template'
  | 'hc-mdr-sor-98-282';

/* Literals other files mirror (a meta file may not import a value). */
export const MDALL_HREF = 'https://health-products.canada.ca/mdall-limh/';
export const HC_RECALLS_HREF = 'https://recalls-rappels.canada.ca/en';

export const SOURCE_META: Record<SourceId, SourceMeta> = {
  /* ---------- 1. Clinical guidance (adults) ---------- */
  'cla-sleep-apnea': {
    publisher: 'cla',
    label: 'Sleep apnea',
    href: 'https://www.lung.ca/lung-diseases/sleep-apnea/',
    hrefLang: 'en',
  },
  'lhf-sleep-apnea': {
    publisher: 'lhf',
    label: 'Sleep apnea',
    href: 'https://lunghealth.ca/lung-disease/sleep-apnea/',
    hrefLang: 'en',
  },
  'bcg-osa-adults': {
    publisher: 'bc-guidelines',
    year: 2023,
    label: 'Obstructive Sleep Apnea (OSA): Assessment and Management in Adults',
    href: 'https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/bc-guidelines/sleep-apnea',
    hrefLang: 'en',
  },
  'bcg-osa-adults-appx-e': {
    publisher: 'bc-guidelines',
    year: 2021,
    label: 'Appendix E: Sleep Study Levels',
    href: 'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/bc-guidelines/appenidxe_sleepapnea-guideline-2021-v2.pdf',
    hrefLang: 'en',
  },
  'bcg-osa-options-2021': {
    publisher: 'bc-guidelines',
    year: 2021,
    label: 'Appendix F: OSA Management Options',
    href: 'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/bc-guidelines/appenidxf_sleepapnea-guideline-2021-v2.pdf',
    hrefLang: 'en',
  },
  'bcg-osa-oral-devices-2021': {
    publisher: 'bc-guidelines',
    year: 2021,
    label: 'Appendix G: Oral and Other Devices',
    href: 'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/bc-guidelines/appenidxg_sleepapnea-guideline-2021-v2.pdf',
    hrefLang: 'en',
  },
  'cts-sdb-2011': {
    publisher: 'cts',
    year: 2011,
    label:
      'Canadian Thoracic Society 2011 guideline update: Diagnosis and treatment of sleep disordered breathing',
    href: 'https://cts-sct.ca/wp-content/uploads/2018/01/Diagnosis_treatment-Sleep-Disordered-Breathing_2011.pdf',
    hrefLang: 'en',
  },
  'cadth-osa-2017': {
    publisher: 'cadth',
    year: 2017,
    label: 'Interventions for the Treatment of Obstructive Sleep Apnea in Adults (2017, archived)',
    href: 'https://www.inahta.org/upload/2017/17017_Interventions%20for%20the%20Treatment%20of%20Obstructive%20Sleep%20Apnea%20in%20Adults.pdf',
    hrefLang: 'en',
  },
  'ab-cpap-buyers-2026': {
    publisher: 'myhealth-alberta',
    year: 2026,
    label: "Buyer's Information for CPAP Therapy Equipment",
    href: 'https://myhealth.alberta.ca/Alberta/Pages/Buyers-Information-for-CPAP-Therapy-Equipment.aspx',
    hrefLang: 'en',
  },
  'ab-osa-pathway-2026': {
    publisher: 'ab-pathways',
    year: 2026,
    label: 'Your journey with obstructive sleep apnea: patient pathway',
    href: 'https://myhealth.alberta.ca/HealthTopics/obstructive-sleep-apnea-pathway/Documents/obstructive-sleep-apnea-pathway.pdf',
    hrefLang: 'en',
  },
  'hlbc-cpap': {
    publisher: 'healthwise',
    year: 2022,
    label: 'CPAP therapy for obstructive sleep apnea',
    href: 'https://www.healthlinkbc.ca/healthwise/continuous-positive-airway-pressure-cpap-therapy-obstructive-sleep-apnea',
    hrefLang: 'en',
  },
  'hlbc-snoring-osa': {
    publisher: 'healthwise',
    year: 2022,
    label: 'Snoring and Obstructive Sleep Apnea',
    href: 'https://www.healthlinkbc.ca/healthwise/snoring-and-obstructive-sleep-apnea',
    hrefLang: 'en',
  },
  'oh-insomnia-qs-2025': {
    publisher: 'ontario-health',
    year: 2025,
    label: 'Insomnia Disorder: Care for Adults (quality standard)',
    href: 'https://ontariohealth.ca/content/dam/ontariohealth/documents/filter-list/qs/qs-insomnia-disorder-en.pdf',
    hrefLang: 'en',
  },
  mysleepwell: {
    publisher: 'sleepwell',
    label: 'Sleepwell (mysleepwell.ca)',
    href: 'https://mysleepwell.ca/',
    hrefLang: 'en',
  },
  'phac-sleep-adults': {
    publisher: 'phac',
    year: 2019,
    label: 'Are Canadian adults getting enough sleep? (infographic)',
    href: 'https://www.canada.ca/en/public-health/services/publications/healthy-living/canadian-adults-getting-enough-sleep-infographic.html',
    hrefLang: 'en',
  },
  /* ---------- 2. How common it is ---------- */
  'statcan-osa-2018': {
    publisher: 'statcan',
    year: 2018,
    label: 'Sleep apnea in Canada, 2016 and 2017 (archived page)',
    href: 'https://www150.statcan.gc.ca/n1/pub/82-625-x/2018001/article/54979-eng.htm',
    hrefLang: 'en',
  },
  'phac-osa-2009': {
    publisher: 'phac',
    year: 2021,
    label: 'What is the impact of sleep apnea on Canadians?',
    href: 'https://www.canada.ca/en/public-health/services/chronic-diseases/sleep-apnea/what-impact-sleep-apnea-on-canadians.html',
    hrefLang: 'en',
  },
  /* ---------- 3. Children ---------- */
  'akh-osa': {
    publisher: 'aboutkidshealth',
    year: 2025,
    label: 'Obstructive sleep apnea',
    href: 'https://www.aboutkidshealth.ca/obstructive-sleep-apnea',
    hrefLang: 'en',
  },
  'akh-pap': {
    publisher: 'aboutkidshealth',
    year: 2025,
    label: 'Positive airway pressure (PAP): CPAP and BPAP',
    href: 'https://www.aboutkidshealth.ca/healthaz/respiratory/positive-airway-pressure-pap-cpap-and-bpap/',
    hrefLang: 'en',
  },
  'akh-tonsillectomy-osa': {
    publisher: 'aboutkidshealth',
    year: 2024,
    label: 'Tonsillectomy with obstructive sleep apnea',
    href: 'https://www.aboutkidshealth.ca/healthaz/otolaryngology/tonsillectomy-with-obstructive-sleep-apnea/',
    hrefLang: 'en',
  },
  'akh-child-emergency': {
    publisher: 'aboutkidshealth',
    year: 2026,
    label: "Air quality and your child's health",
    href: 'https://www.aboutkidshealth.ca/healthaz/na/air-quality-and-your-childs-health/?language=en',
    hrefLang: 'en',
  },
  'cts-css-peds-dx-2026': {
    publisher: 'cts-css',
    year: 2026,
    label:
      'Press release: new CTS/CSS guideline on the diagnosis of obstructive sleep apnea in children',
    href: 'https://cts-sct.ca/wp-content/uploads/2026/03/Pediatric-OSA-Guideline-Press-Release_EN_Final.pdf',
    hrefLang: 'en',
  },
  'cts-css-peds-infographic-2026': {
    publisher: 'cts-css',
    year: 2026,
    label: 'Obstructive Sleep Apnea Diagnosis Guideline in Children: infographic for physicians',
    href: 'https://cts-sct.ca/wp-content/uploads/2026/05/Infographic-FINAL-1.pdf',
    hrefLang: 'en',
  },
  'hlbc-ta-osa': {
    publisher: 'healthwise',
    year: 2023,
    label: 'Tonsillectomy and Adenoidectomy for Obstructive Sleep Apnea and Snoring',
    href: 'https://www.healthlinkbc.ca/healthwise/tonsillectomy-and-adenoidectomy-obstructive-sleep-apnea-and-snoring',
    hrefLang: 'en',
  },
  /* ---------- 4. Driving and work ---------- */
  'cts-css-driving-2014': {
    publisher: 'cts-css',
    year: 2014,
    label:
      'Canadian Thoracic Society and Canadian Sleep Society position paper: Obstructive sleep apnea and driving',
    href: 'https://cts-sct.ca/wp-content/uploads/2018/02/1-CTS_CSS_Position_Paper_OSA_Driving_2014.pdf',
    hrefLang: 'en',
  },
  'rsbc-ccmta-18-6-1': {
    publisher: 'roadsafetybc',
    year: 2021,
    label: '18 - Sleep disorders - CCMTA Medical Standards',
    href: 'https://www2.gov.bc.ca/gov/content/transportation/driving-and-cycling/roadsafetybc/medical-fitness/medical-prof/med-standards/18-sleep-disorders',
    hrefLang: 'en',
  },
  'on-mto-reporting': {
    publisher: 'on-mto',
    year: 2026,
    label: 'Reporting a driver for medical review',
    href: 'https://www.ontario.ca/page/reporting-driver-medical-review',
    hrefLang: 'en',
  },
  'on-mto-5108e': {
    publisher: 'on-mto',
    year: 2022,
    label: 'Medical Condition Report (Form 5108E)',
    href: 'https://forms.mgcs.gov.on.ca/dataset/e8eea5c6-3f7b-4b39-95a1-6861e15e69eb/resource/32c95fc5-7abd-4e12-853d-9778068e600e/download/5108e.pdf',
    hrefLang: 'en',
  },
  'tc-railway-medical-rules': {
    publisher: 'transport-canada',
    year: 2024,
    label: 'Railway Medical Rules for Positions Critical to Safe Railway Operations',
    href: 'https://tc.canada.ca/en/rail-transportation/operating-federal-railway/railway-employee-work-rest-rules-medical-rules/railway-medical-rules-positions-critical-safe-railway-operations',
    hrefLang: 'en',
  },
  'rac-rail-handbook-2026': {
    publisher: 'rac',
    year: 2026,
    label:
      'Canadian Railway Medical Rules Handbook (For Positions Critical to Safe Railway Operations), section 14',
    href: 'https://www.railcan.ca/wp-content/uploads/2026/03/RAC-Handbook-2026-03-23.pdf',
    hrefLang: 'en',
  },
  /* ---------- 4b. When to call 911 (ruling C1, 2026-10-13) ---------- */
  'on-er': {
    publisher: 'gov-ontario',
    year: 2026,
    label: 'Emergency rooms',
    href: 'https://www.ontario.ca/page/emergency-rooms',
    hrefLang: 'en',
  },
  'ab-mha-emergency': {
    publisher: 'myhealth-alberta',
    label: '"Is It an EMERGENCY?" box, Health Information & Tools',
    href: 'https://myhealth.alberta.ca/Pages/HealthInfoToolsDefault.aspx',
    hrefLang: 'en',
  },
  'health811-home': {
    publisher: 'gov-ontario',
    year: 2025,
    label: 'Health811 home',
    href: 'https://health811.ontario.ca/static/guest/home',
    hrefLang: 'en',
  },
  'phac-heart-attack': {
    publisher: 'phac',
    year: 2026,
    label: 'Heart attack',
    href: 'https://www.canada.ca/en/public-health/services/diseases/heart-health/heart-attack.html',
    hrefLang: 'en',
  },
  'phac-stroke': {
    publisher: 'phac',
    year: 2026,
    label: 'Stroke',
    href: 'https://www.canada.ca/en/public-health/services/diseases/heart-health/stroke.html',
    hrefLang: 'en',
  },
  'icbc-crash-card': {
    publisher: 'icbc',
    label: 'What to do after a crash',
    href: 'https://icbc.com/assets/pa/72Je4sNObH4LCHFOSNbIbe/what-to-do-after-crash.pdf',
    hrefLang: 'en',
  },
  'on-mto-handbook-emergencies': {
    publisher: 'on-mto',
    year: 2026,
    label: "Dealing with emergencies, Official MTO Driver's Handbook",
    href: 'https://www.ontario.ca/document/official-mto-drivers-handbook/dealing-emergencies',
    hrefLang: 'en',
  },
  'on-mto-handbook-drowsy': {
    publisher: 'on-mto',
    year: 2022,
    label: "Dealing with particular situations: drowsy driving, Official MTO Driver's Handbook",
    href: 'https://www.ontario.ca/document/official-mto-drivers-handbook/dealing-particular-situations',
    hrefLang: 'en',
  },
  'hlbc-sleep-apnea': {
    publisher: 'healthwise',
    year: 2022,
    label: 'Sleep Apnea',
    href: 'https://www.healthlinkbc.ca/healthwise/sleep-apnea',
    hrefLang: 'en',
  },
  /* ---------- 5. Devices and safety ---------- */
  'hc-recall-philips-ra-76137': {
    publisher: 'health-canada',
    year: 2021,
    label:
      'Philips Respironics recalls several models of CPAP and BiLevel PAP machines and mechanical ventilators (RA-62729)',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/philips-respironics-recalls-several-models-cpap-and-bilevel-pap-machines-and',
    hrefLang: 'en',
  },
  'hc-recall-philips-ra-75887': {
    publisher: 'health-canada',
    year: 2021,
    label:
      'Continuous Positive Airway Pressure (CPAP), Bi-Level Positive Airway Pressure (BiPAP), and Mechanical Ventilators (RA-75887)',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/continuous-positive-airway-pressure-cpap-bi-level-positive-airway-pressure-bipap-and',
    hrefLang: 'en',
  },
  'cts-css-csrt-philips-2021': {
    publisher: 'cts-css-csrt',
    year: 2021,
    label:
      'Position statement from the Canadian Thoracic Society, Canadian Sleep Society and the Canadian Society of Respiratory Therapists: Philips Respironics device recall',
    href: 'https://css-scs.ca/society-news/position-statement-from-the-canadian-thoracic-society-canadian-sleep-society-and-the-canadian-society-of-respiratory-therapists-philips-respironics-device-recall/',
    hrefLang: 'en',
  },
  'hc-recall-magnet-philips-2022': {
    publisher: 'health-canada',
    year: 2022,
    label:
      'Magnets in certain Philips Respironics sleep therapy masks may cause serious injury to some individuals (RA-64582)',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/magnets-certain-philips-respironics-sleep-therapy-masks-may-cause-serious-injury-some',
    hrefLang: 'en',
  },
  'hc-recall-magnet-resmed-2023': {
    publisher: 'health-canada',
    year: 2023,
    label: 'Airtouch and Airfit ResMed Masks (RA-74733)',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/airtouch-and-airfit-resmed-masks',
    hrefLang: 'en',
  },
  'hc-recall-magnet-philips-masks-2022': {
    publisher: 'health-canada',
    year: 2022,
    label: 'Respironics Masks (RA-64545)',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/respironics-masks',
    hrefFr: 'https://recalls-rappels.canada.ca/fr/avis-rappel/respironics-masks',
    hrefLang: 'en',
  },
  'hc-recall-magnet-novastar-2023': {
    publisher: 'health-canada',
    year: 2023,
    label: 'Novastar Full Face Mask (RA-72611)',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/novastar-full-face-mask',
    hrefLang: 'en',
  },
  'cts-css-csrt-magnets-2022': {
    publisher: 'cts-css-csrt',
    year: 2022,
    label:
      'Message from the Canadian Thoracic Society, the Canadian Sleep Society, and the Canadian Society of Respiratory Therapists: Health Canada product recall – Respironics masks',
    href: 'https://css-scs.ca/society-news/health-canada-product-recall-respironics-masks/',
    hrefLang: 'en',
  },
  'fda-resmed-magnets-2024': {
    publisher: 'fda',
    year: 2024,
    label:
      'Certain ResMed Ltd. Masks for BiPAP and CPAP Machines Recalled Due to Safety Issue with Magnets That May Affect Certain Medical Devices',
    href: 'https://www.fda.gov/medical-devices/safety-communications/certain-resmed-ltd-masks-bipap-cpap-machines-recalled-due-safety-issue-magnets-may-affect-certain',
    hrefLang: 'en',
  },
  'hc-recall-asv-2015': {
    publisher: 'health-canada',
    year: 2015,
    label: 'Adaptive Servo-Ventilation (ASV) therapy devices (RA-53771)',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/adaptive-servo-ventilation-avs-therapy-devices-2015-05-13',
    hrefLang: 'en',
  },
  'pmra-uv-ozone': {
    publisher: 'health-canada',
    year: 2023,
    label:
      'Regulating ultraviolet radiation-emitting and ozone-generating devices under the Pest Control Products Act: Overview',
    href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/covid19-industry/disinfectants-sanitizers-cleaners-soaps/ultra-violet-radiation-emitting-ozone-generating-devices.html',
    hrefLang: 'en',
  },
  'hc-buying-devices-online': {
    publisher: 'health-canada',
    year: 2011,
    label: 'Buying Medical Devices from the Internet',
    href: 'https://www.canada.ca/en/health-canada/services/healthy-living/your-health/medical-information/buying-medical-devices-over-internet.html',
    hrefLang: 'en',
  },
  'hc-mdall': {
    publisher: 'health-canada',
    year: 2019,
    label:
      'Medical Devices Active Licence Listing (MDALL) - Your reference tool for licensed medical devices in Canada',
    href: 'https://health-products.canada.ca/mdall-limh/',
    hrefLang: 'en',
  },
  'hc-report-device-problem': {
    publisher: 'health-canada',
    year: 2019,
    label: 'Report a medical device problem: consumers (MedEffect Canada)',
    href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medeffect-canada/adverse-reaction-reporting/medical-device/consumer.html',
    hrefLang: 'en',
  },
  'hc-device-problem-form': {
    publisher: 'health-canada',
    year: 2025,
    label: 'Consumer Medical Device Report Form',
    href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/problem-reporting/medical-device-consumer.html',
    hrefLang: 'en',
  },
  'hc-about-device-problems': {
    publisher: 'health-canada',
    year: 2020,
    label: 'About medical device problems',
    href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/medeffect-canada/adverse-reaction-reporting/medical-device-problems.html',
    hrefLang: 'en',
  },
  'hc-recalls-safety-alerts': {
    publisher: 'gov-canada',
    year: 2026,
    label: 'Find recalls, advisories and safety alerts - Canada.ca',
    href: 'https://recalls-rappels.canada.ca/en',
    hrefLang: 'en',
  },
  /* ---------- 5b. Machine guide: licences and recalls (ruling N2, 2026-10-13) ---------- */
  'hc-mdall-api-doc': {
    publisher: 'health-canada',
    label: 'MDALL API documentation',
    href: 'https://health-products.canada.ca/api/documentation/mdall-documentation-en.html',
    hrefLang: 'en',
  },
  'mdall-lic-106650': {
    publisher: 'health-canada',
    year: 2021,
    label: 'MDALL licence 106650, "AIRSENSE 11"',
    href: 'https://health-products.canada.ca/mdall-limh/information?licenceId=106650&type=active&lang=eng',
    hrefLang: 'en',
  },
  'mdall-lic-93717': {
    publisher: 'health-canada',
    year: 2014,
    label: 'MDALL licence 93717, "AIRSENSE 10 AUTOSET"',
    href: 'https://health-products.canada.ca/mdall-limh/information?licenceId=93717&type=active&lang=eng',
    hrefLang: 'en',
  },
  'mdall-lic-110422': {
    publisher: 'health-canada',
    year: 2023,
    label: 'MDALL licence 110422, "AIRCURVE 11"',
    href: 'https://health-products.canada.ca/mdall-limh/information?licenceId=110422&type=active&lang=eng',
    hrefLang: 'en',
  },
  'mdall-lic-99052': {
    publisher: 'health-canada',
    year: 2017,
    label: 'MDALL licence 99052, "AIRMINI"',
    href: 'https://health-products.canada.ca/mdall-limh/information?licenceId=99052&type=active&lang=eng',
    hrefLang: 'en',
  },
  'mdall-lic-105749': {
    publisher: 'health-canada',
    year: 2021,
    label: 'MDALL licence 105749, DreamStation 2 Auto CPAP Advanced',
    href: 'https://health-products.canada.ca/mdall-limh/information?licenceId=105749&type=active&lang=eng',
    hrefLang: 'en',
  },
  'mdall-lic-113188': {
    publisher: 'health-canada',
    year: 2025,
    label: 'MDALL licence 113188, "BREATHCARE PAP POSITIVE AIRWAY PRESSURE UNITS" (System)',
    href: 'https://health-products.canada.ca/mdall-limh/information?licenceId=113188&type=active&lang=eng',
    hrefLang: 'en',
  },
  'mdall-lic-112836': {
    publisher: 'health-canada',
    year: 2025,
    label: 'MDALL licence 112836, BreathCare (Device Family)',
    href: 'https://health-products.canada.ca/mdall-limh/information?licenceId=112836&type=active&lang=eng',
    hrefLang: 'en',
  },
  'mdall-lic-102774': {
    publisher: 'health-canada',
    year: 2024,
    label: 'MDALL licence 102774, "TRANSCEND MICRO CPAP"',
    href: 'https://health-products.canada.ca/mdall-limh/information?licenceId=102774&type=active&lang=eng',
    hrefLang: 'en',
  },
  'hc-recall-resmed-2015': {
    publisher: 'health-canada',
    year: 2015,
    label: 'Various Medical Devices Recalled by Resmed (RA-53273)',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/various-medical-devices-recalled-resmed-2015-04-09',
    hrefLang: 'en',
  },
  /* ---------- 6. Who helps, and who regulates them ---------- */
  'csrt-rrt': {
    publisher: 'csrt',
    label: 'About Respiratory Therapists',
    href: 'https://www.csrt.com/about-respiratory-therapists/',
    hrefLang: 'en',
  },
  'crto-pap': {
    publisher: 'crto',
    year: 2012,
    label: 'Practice FAQs (March 2012): applying CPAP',
    href: 'https://www.crto.on.ca/pdf/FAQs/FAQ2.Mar.2012.pdf',
    hrefLang: 'en',
  },
  'crto-standard-5': {
    publisher: 'crto',
    year: 2026,
    label: 'Standard 5. Conflict of Interest',
    href: 'https://standards.crto.on.ca/standard-5/',
    hrefLang: 'en',
  },
  'crto-community-rt': {
    publisher: 'crto',
    label: 'What you need to know about community respiratory therapy',
    href: 'https://www.crto.on.ca/public/respiratory-health-information/need-know-respiratory-therapy/',
    hrefLang: 'en',
  },
  'bc-pap-buyers-guide': {
    publisher: 'gov-bc',
    label: "Positive Airway Pressure (PAP) Buyer's Guide",
    href: 'https://www2.gov.bc.ca/assets/gov/health/practitioner-pro/medical-services-plan/diagnostic-facilities/announcements/pap_buyers_guide.pdf',
    hrefLang: 'en',
  },
  'nihb-pap': {
    publisher: 'isc',
    year: 2026,
    label:
      'Respiratory benefits, section 8: positive airway pressure (NIHB Medical Supplies and Equipment benefit list)',
    href: 'https://www.sac-isc.gc.ca/eng/1585323161648/1585323186650',
    hrefFr: 'https://www.sac-isc.gc.ca/fra/1585323161648/1585323186650',
    hrefLang: 'en',
  },
  'cda-oat': {
    publisher: 'cda',
    year: 2005,
    label: 'CDA Position on Oral Appliance Therapy for Snoring and Obstructive Sleep Apnea',
    href: 'https://www.cda-adc.ca/policy-and-advocacy/position-statements/position-statement/cda-position-on-oral-appliance-therapy-for-snoring-and-obstructive-sleep-apnea',
    hrefLang: 'en',
  },
  /* ---------- 7. Travel and away from home ---------- */
  'catsa-cpap': {
    publisher: 'catsa',
    year: 2023,
    label: 'Continuous Positive Airway Pressure (CPAP) device (What can I bring?)',
    href: 'https://www.catsa-acsta.gc.ca/en/what-can-bring/item/continuous-positive-airway-pressure-cpap-device',
    hrefLang: 'en',
  },
  'catsa-respiratory-2025': {
    publisher: 'catsa',
    year: 2025,
    label: 'How to Travel with Respiratory Devices (infographic)',
    href: 'https://www.catsa-acsta.gc.ca/sites/default/files/2025-01/respiratory-devices-infographic-en-2025.pdf',
    hrefLang: 'en',
  },
  'catsa-medical-items': {
    publisher: 'catsa',
    year: 2026,
    label: 'Medication and Medical Items',
    href: 'https://www.catsa-acsta.gc.ca/en/what-can-bring/medication-and-medical-items',
    hrefLang: 'en',
  },
  'cta-mobility-aids': {
    publisher: 'cta',
    year: 2023,
    label: 'Mobility aids and assistive devices',
    href: 'https://otc-cta.gc.ca/eng/mobility-aids-and-assistive-devices',
    hrefLang: 'en',
  },
  'cta-assistive-devices-guide-2020': {
    publisher: 'cta',
    year: 2020,
    label:
      'Accessible Transportation — Travelling with Mobility Aids and Other Assistive Devices: A Guide',
    href: 'https://otc-cta.gc.ca/sites/default/files/documents/atpdr_guide_mobility_aids_assistive_devices.pdf',
    hrefLang: 'en',
  },
  'gac-travel-medical-device': {
    publisher: 'gov-canada',
    year: 2026,
    label: 'Travelling with a medical device',
    href: 'https://travel.gc.ca/travelling/health-safety/medical-device',
    hrefLang: 'en',
  },
  'atpdr-s49': {
    publisher: 'justice-canada',
    year: 2026,
    label:
      'Accessible Transportation for Persons with Disabilities Regulations (SOR/2019-244), section 49',
    href: 'https://laws-lois.justice.gc.ca/eng/regulations/SOR-2019-244/section-49.html',
    hrefLang: 'en',
  },
  /* ---------- 8. Funding: federal and First Nations ---------- */
  'nihb-eligibility': {
    publisher: 'isc',
    year: 2026,
    label:
      'Who is eligible for the Non-Insured Health Benefits (NIHB) program for First Nations and Inuit',
    href: 'https://www.sac-isc.gc.ca/eng/1574187596083/1576511384063',
    hrefFr: 'https://www.sac-isc.gc.ca/fra/1574187596083/1576511384063',
    hrefLang: 'en',
  },
  'nihb-general-policies': {
    publisher: 'isc',
    year: 2026,
    label: 'NIHB Medical Supplies and Equipment Benefits Guide: 1.0 General policies',
    href: 'https://www.sac-isc.gc.ca/eng/1585321312092/1585321331369',
    hrefLang: 'en',
  },
  'nihb-contact': {
    publisher: 'isc',
    label: 'Contact the Non-Insured Health Benefits program',
    href: 'https://www.sac-isc.gc.ca/eng/1579274812116/1579708265237',
    hrefLang: 'en',
  },
  'fnha-mse': {
    publisher: 'fnha',
    label: 'Medical supplies and equipment',
    href: 'https://fnha.ca/benefits/benefits-guide/medical-supplies-and-equipment/',
    hrefLang: 'en',
  },
  'fnha-mse-fee-2026': {
    publisher: 'fnha',
    year: 2026,
    label:
      'Medical Supplies & Equipment Fee Supplement For Clients of the First Nations Health Authority',
    href: 'https://www.fnha.ca/wp-content/uploads/migrated/pdf-bin/fnha/0799.013_FNHA_MSE-FeeSupplement.pdf',
    hrefLang: 'en',
  },
  'fed-vac-poc9': {
    publisher: 'vac',
    year: 2025,
    label: 'Oxygen Therapy and Respiratory Equipment (POC 9)',
    href: 'https://www.veterans.gc.ca/en/about-vac/reports-policies-and-legislation/policies/oxygen-therapy-and-respiratory-equipment-poc-9',
    hrefFr:
      'https://www.veterans.gc.ca/fr/propos-dacc/rapports-politiques-et-legislation/politiques/inhalotherapie-et-equipement-respiratoire-pdc-9',
    hrefLang: 'en',
  },
  'fed-cra-medical': {
    publisher: 'cra',
    year: 2026,
    label: 'Details of medical expenses (lines 33099 and 33199)',
    href: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/lines-33099-33199-eligible-medical-expenses-you-claim-on-your-tax-return/details-medical-expenses.html',
    hrefLang: 'en',
  },
  'cra-rc4065-2025': {
    publisher: 'cra',
    year: 2026,
    label: 'Medical Expenses 2025 (Guide RC4065)',
    href: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4065/medical-expenses.html',
    hrefLang: 'en',
  },
  'cra-contact': {
    publisher: 'cra',
    label: 'Contact the Canada Revenue Agency',
    href: 'https://www.canada.ca/en/revenue-agency/corporate/contact-information.html',
    hrefLang: 'en',
  },
  /* ---------- 9. Funding: provinces ---------- */
  'on-adp-respiratory': {
    publisher: 'gov-ontario',
    year: 2026,
    label: 'Respiratory equipment and supplies',
    href: 'https://www.ontario.ca/page/respiratory-equipment-and-supplies',
    hrefFr: 'https://www.ontario.ca/fr/page/appareils-et-fournitures-dassistance-respiratoire',
    hrefLang: 'en',
  },
  'on-adp-resp-manual-2024': {
    publisher: 'gov-ontario',
    year: 2024,
    label: 'Respiratory Equipment Policy and Administration Manual',
    href: 'https://www.ontario.ca/files/2024-11/moh-adp-policy-and-administration-manual-respiratory-equipment-2024-11-08.pdf',
    hrefLang: 'en',
  },
  'on-adp-main': {
    publisher: 'gov-ontario',
    year: 2026,
    label: 'Assistive Devices Program',
    href: 'https://www.ontario.ca/page/assistive-devices-program',
    hrefLang: 'en',
  },
  'on-odsp-msn': {
    publisher: 'gov-ontario',
    year: 2026,
    label: 'ODSP Schedule of Benefits, Mandatory Special Necessities: Respiratory supplies',
    href: 'https://www.ontario.ca/document/odsp-schedule-benefits-mandatory-special-necessities/respiratory-supplies',
    hrefFr:
      'https://www.ontario.ca/fr/document/posph-liste-prestations-necessites-speciales-obligatoires/fournitures-respiratoires',
    hrefLang: 'en',
  },
  'on-odsp-msn-directive': {
    publisher: 'gov-ontario',
    year: 2026,
    label: '9.12 — Mandatory Special Necessities (ODSP Income Support Directives)',
    labelFr: '9.12 — Prestations obligatoires pour les nécessités spéciales',
    href: 'https://www.ontario.ca/document/ontario-disability-support-program-policy-directives-income-support/912-mandatory-special',
    hrefFr:
      'https://www.ontario.ca/fr/document/directives-du-programme-ontarien-de-soutien-aux-personnes-handicapees-concernant-le/912',
    hrefLang: 'en',
  },
  'sk-sail-cpap': {
    publisher: 'gov-sk',
    year: 2023,
    label:
      'SAIL Respiratory Equipment Program Overview - CPAP (Extended Health Benefits Information Bulletin)',
    href: 'https://publications.saskatchewan.ca/api/v1/products/87731/formats/104417/download',
    hrefLang: 'en',
  },
  'sk-sail': {
    publisher: 'gov-sk',
    label: 'Saskatchewan Aids to Independent Living',
    href: 'https://www.saskatchewan.ca/residents/health/accessing-health-care-services/health-services-for-people-with-disabilities/sail',
    hrefLang: 'en',
  },
  'mb-misericordia-cpap': {
    publisher: 'misericordia',
    label: 'Guidelines and policies for CPAP treatment',
    href: 'https://misericordia.mb.ca/wp-content/uploads/CPAP-information.pdf',
    hrefLang: 'en',
  },
  'mb-cpap-release-2023': {
    publisher: 'gov-manitoba',
    year: 2023,
    label:
      'Manitoba Government Invests Nearly $1.8 Million in Long-Term System Capacity with Sleep Disorder Centre Agreement',
    href: 'https://news.gov.mb.ca/news/print,index.html?item=59858',
    hrefFr: 'https://news.gov.mb.ca/news/print,index.fr.html?item=59858',
    hrefLang: 'en',
  },
  'bc-pharmacare-not-covered': {
    publisher: 'gov-bc',
    year: 2026,
    label: 'What BC PharmaCare covers (section "What BC PharmaCare does not cover")',
    href: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/what-we-cover',
    hrefLang: 'en',
  },
  'bc-pharmacare-contact': {
    publisher: 'gov-bc',
    year: 2026,
    label: 'Contact BC PharmaCare',
    href: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/contact-us',
    hrefLang: 'en',
  },
  'bc-bcea-breathing': {
    publisher: 'gov-bc',
    year: 2026,
    label: 'Medical Equipment – Breathing Devices (BCEA Policy and Procedure Manual)',
    href: 'https://www2.gov.bc.ca/gov/content/governments/policies-for-government/bcea-policy-and-procedure-manual/health-supplements-and-programs/medical-equipment-breathing-devices',
    hrefLang: 'en',
  },
  'bc-income-assistance-access': {
    publisher: 'gov-bc',
    year: 2026,
    label: 'Access income and disability assistance services',
    href: 'https://www2.gov.bc.ca/gov/content/family-social-supports/income-assistance/access-services',
    hrefLang: 'en',
  },
  'ab-aish': {
    publisher: 'gov-alberta',
    label: 'What you get with AISH',
    href: 'https://www.alberta.ca/aish-what-you-get',
    hrefLang: 'en',
  },
  'qc-inesss-osa': {
    publisher: 'inesss',
    year: 2024,
    label:
      "Appareils à pression positive continue pour le traitement de l'apnée obstructive du sommeil",
    href: 'https://www.inesss.qc.ca/publications/repertoire-des-publications/publication/appareils-a-pression-positive-continue-pour-le-traitement-de-lapnee-obstructive-du-sommeil.html',
    hrefLang: 'fr',
  },
  'nb-sd-respiratory': {
    publisher: 'gov-nb',
    label: 'Respiratory program / Programme des services respiratoires',
    href: 'https://www.gnb.ca/en/topic/family-home-community/persons-with-disabilities/respiratory.html',
    hrefFr:
      'https://www.gnb.ca/fr/sujet/famille-foyer-collectivite/personnes-ayant-hadicap/respiratoires.html',
    hrefLang: 'en',
  },
  /* ---------- 10. Liivv sleep support service (RRT): licensure, practice and privacy ---------- */
  'crto-virtual-care-ppg-2023': {
    publisher: 'crto',
    year: 2023,
    label: 'Respiratory Therapists Providing Virtual Care (PPG-175)',
    href: 'https://www.crto.on.ca/pdf/PPG/Virtual_Care_PPG.pdf',
    hrefFr: 'https://www.crto.on.ca/pdf/fr/PPG/Virtual_Care_PPG_FR.pdf',
    hrefLang: 'en',
  },
  'crto-orders-ppg': {
    publisher: 'crto',
    year: 2024,
    label: 'Orders for Medical Care (PPG)',
    href: 'https://orders.crto.on.ca/',
    hrefLang: 'en',
  },
  'crto-std6-consent': {
    publisher: 'crto',
    label: 'Standard 6: Consent',
    href: 'https://standards.crto.on.ca/standard-6/',
    hrefLang: 'en',
  },
  'crto-std7-documentation': {
    publisher: 'crto',
    label: 'Standard 7: Documentation & Information Management',
    href: 'https://standards.crto.on.ca/standard-7/',
    hrefLang: 'en',
  },
  'crto-regulator-links': {
    publisher: 'crto',
    label: 'Respiratory Therapy Regulatory Bodies in Canada',
    href: 'https://www.crto.on.ca/public/resources-and-links/regulatory/',
    hrefLang: 'en',
  },
  'ab-crta-standards': {
    publisher: 'crta',
    label: 'Standards of Practice',
    href: 'https://rrtalberta.ca/about/standards-of-practice.aspx',
    hrefLang: 'en',
  },
  'ab-crta-sop-draft-2023': {
    publisher: 'crta',
    year: 2023,
    label: 'DRAFT CRTA Standards of Practice (2023 draft 2a)',
    href: 'https://rrtalberta.ca/media/415922/2023-sop-draft-2a.pdf',
    hrefLang: 'en',
  },
  'sk-rt-act': {
    publisher: 'gov-sk',
    label: 'The Respiratory Therapists Act (c. R-22.0002)',
    href: 'https://scrt.ca/document/6945/Respiratory_Therapists_Act.pdf',
    hrefLang: 'en',
  },
  'mb-marrt-licensing': {
    publisher: 'marrt',
    label: 'Application for Licensure',
    href: 'https://www.marrt.org/site/licensing/membership?nav=sidebar',
    hrefLang: 'en',
  },
  'mb-telepractice-2020': {
    publisher: 'marrt',
    label: 'Guidance on Telepractice',
    href: 'https://marrt.org/uploaded/web/Telepractice%20Guidance%20Document-%20Final%2004%2002%2020.pdf',
    hrefLang: 'en',
  },
  'mb-marrt-cpg': {
    publisher: 'marrt',
    label: 'Clinical Practice Guidelines',
    href: 'https://www.marrt.org/site/profession/cp-guidelines?nav=sidebar',
    hrefLang: 'en',
  },
  'qc-telehealth-practice': {
    publisher: 'gov-quebec',
    label: 'Telehealth practice',
    href: 'https://www.quebec.ca/en/health/health-system-and-services/telehealth/telehealth-practice',
    hrefLang: 'en',
  },
  'qc-tsq-fiche-09-2024': {
    publisher: 'telesante-quebec',
    year: 2024,
    label: 'Fiche téléconsultation 09 : Les téléconsultations hors Québec',
    href: 'https://telesantequebec.ca/wp-content/uploads/fiches_informatives/09-teleconsultation_hors_quebec_102024.pdf',
    hrefLang: 'fr',
  },
  'nb-nbart-home': {
    publisher: 'nbart',
    label: 'NBART home page',
    href: 'https://www.nbart.ca/',
    hrefLang: 'en',
  },
  'nb-nbart-licence-guide': {
    publisher: 'nbart',
    label: 'Application and License Guide for Applicants Trained Outside of Canada',
    href: 'https://www.nbart.ca/images/NBARTGuideforApplicantsTrainedOutsideofCanada_V2.pdf',
    hrefLang: 'en',
  },
  'ns-nsrrt-home': {
    publisher: 'nsrrt',
    year: 2025,
    label: 'NSRRT home page',
    href: 'https://nsrrt.ca/',
    hrefLang: 'en',
  },
  'ns-nsrrt-am-i-practising': {
    publisher: 'nsrrt',
    year: 2024,
    label: '"Am I Practising?" Fact Sheet',
    href: 'https://nsrrt.ca/images/20240614_NSRRT_Am_I_Practising_Fact_Sheet.pdf',
    hrefLang: 'en',
  },
  'ns-nsrrt-telehealth-orders-2023': {
    publisher: 'nsrrt',
    year: 2023,
    label: 'Assignment of Interventions to RRTs by PAs, NPs and Physicians Practicing Telehealth',
    href: 'https://nsrrt.ca/images/202310_Guidance_on_Assignment_of_Interventions_by_other_HCP_Revised_Oct_2023.pdf',
    hrefLang: 'en',
  },
  'pe-cahppei-home': {
    publisher: 'cahppei',
    label: 'CAHPPEI home page',
    href: 'https://www.cahppei.ca/',
    hrefLang: 'en',
  },
  'pe-rhpa': {
    publisher: 'gov-pei',
    label: 'Regulated Health Professions Act',
    href: 'https://www.princeedwardisland.ca/sites/default/files/legislation/r-10-1-regulated_health_professions_act.pdf',
    hrefLang: 'en',
  },
  'nl-nlchp-telepractice': {
    publisher: 'nlchp',
    year: 2020,
    label: 'NLCHP Telepractice Resource Guide',
    href: 'https://nlchp.ca/wp-content/uploads/2023/09/NLCHP-Telepractice-Resources-FINAL.pdf',
    hrefLang: 'en',
  },
  'bc-hpoa': {
    publisher: 'gov-bc',
    year: 2026,
    label: 'Health Professions and Occupations Act',
    href: 'https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/professional-regulation/health-professions-and-occupations-act',
    hrefLang: 'en',
  },
  'on-phipa': {
    publisher: 'gov-ontario',
    year: 2026,
    label: 'Personal Health Information Protection Act, 2004',
    href: 'https://www.ontario.ca/laws/statute/04p03',
    hrefLang: 'en',
  },
  'opc-provincial-laws': {
    publisher: 'opc',
    year: 2020,
    label: 'Provincial laws that may apply instead of PIPEDA',
    href: 'https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/r_o_p/prov-pipeda/',
    hrefLang: 'en',
  },
  'opc-health-info-contacts': {
    publisher: 'opc',
    year: 2025,
    label: 'Who to contact about personal health information',
    href: 'https://www.priv.gc.ca/en/privacy-topics/health-genetic-and-other-body-information/02_05_d_70_phi/',
    hrefLang: 'en',
  },
  'hlbc-811': {
    publisher: 'healthlink-bc',
    year: 2026,
    label: 'HealthLink BC 8-1-1 services',
    href: 'https://www.healthlinkbc.ca/find-care/healthlink-bc-8-1-1-services',
    hrefLang: 'en',
  },
  'ms-bookings-services': {
    publisher: 'microsoft',
    year: 2026,
    display: 'reviewOnly',
    label: 'Define your services in Shared Bookings',
    href: 'https://learn.microsoft.com/en-us/microsoft-365/bookings/define-service-offerings?view=o365-worldwide',
    hrefLang: 'en',
  },
  /* ---------- 11. Industry (labelled, never alone) ---------- */
  'resmed-ca-tipsheet-2021': {
    publisher: 'resmed',
    year: 2021,
    label: 'Canada tip sheet: ResMed CPAP supplies & replacement parts',
    href: 'https://document.resmed.com/documents/us/sleep-apnea-cpap-supplies-and-replacement-parts-tip-sheet-fr.pdf',
    hrefLang: 'en',
  },
  'resmed-airsense11-ug': {
    publisher: 'resmed',
    label: 'AirSense 11 user guide, Americas',
    href: 'https://document.resmed.com/documents/products/machine/airsense-11/user-guide/airsense11_user-guide_amer_mul.pdf',
    hrefLang: 'en',
  },
  'resmed-airsense10-ug-eur': {
    publisher: 'resmed',
    label: 'AirSense 10 user guide, EUR3 edition',
    href: 'https://document.resmed.com/documents/products/machine/airsense-series/user-guide/3781126_airsense-10-autoset-elite-afh_user-guide_eur3_multi.pdf',
    hrefLang: 'en',
  },
  'resmed-aircurve11-ug': {
    publisher: 'resmed',
    label: 'AirCurve 11 user guide, Americas',
    href: 'https://document.resmed.com/documents/products/machine/aircurve-11/user-guide/398195_aircurve-11_user-guide_amer_multi.pdf',
    hrefLang: 'en',
  },
  'resmed-aircurve11-product-guide': {
    publisher: 'resmed',
    label: 'AirCurve 11 VAuto and ASV product guide',
    href: 'https://document.resmed.com/documents/us/10113730-AirCurve-11-VAuto-ASV-combined-product-guide.pdf',
    hrefLang: 'en',
  },
  'resmed-aircurve11-page': {
    publisher: 'resmed',
    label: 'AirCurve 11 Bilevel',
    href: 'https://www.resmed.com/en-us/products/cpap/machines/aircurve-11-bilevel/',
    hrefLang: 'en',
  },
  'resmed-airmini-ug': {
    publisher: 'resmed',
    label: 'AirMini user guide, Americas',
    href: 'https://document.resmed.com/documents/products/machine/airmini/user-guide/airmini_user-guide_amer_eng.pdf',
    hrefLang: 'en',
  },
  'philips-ds2-manual': {
    publisher: 'philips',
    year: 2025,
    label: 'DreamStation 2 CPAP Advanced / Auto CPAP Advanced user manual',
    href: 'https://www.documents.philips.com/assets/Instruction%20for%20Use/20251030/c9c42c8a0ebf4f4d8fddb3860138cc7d.pdf',
    hrefLang: 'en',
  },
  'philips-ds2-leaflet': {
    publisher: 'philips',
    year: 2021,
    label: 'DreamStation 2 Auto CPAP Advanced leaflet',
    href: 'https://www.documents.philips.com/assets/20210928/cba1342139634168bb97adb100008e6b.pdf',
    hrefLang: 'en',
  },
  'yuwell-yh680-image': {
    publisher: 'yuwell',
    year: 2024,
    label: 'Yuwell Medtech EU product 440 (YH-680AB), product image',
    href: 'https://for-hybrisprd.oss-cn-hangzhou.aliyuncs.com/2024-12-14/1734161816738/PC-%E4%BA%A7%E5%93%81-%E5%91%BC%E5%90%B8%E6%B2%BB%E7%96%97-%E5%91%BC%E5%90%B8%E6%9C%BA-YH-680AB%20%E6%8B%B7%E8%B4%9D.jpg',
    hrefLang: 'en',
  },
  'transcend-micro-manual': {
    publisher: 'transcend',
    label: 'Transcend Micro CPAP user manual 104149 Rev F',
    href: 'https://cdn.shopify.com/s/files/1/0670/0272/8513/files/104149-Rev-F.pdf',
    hrefLang: 'en',
    /*
     * The file sits on the maker's own shop file server (cdn.shopify.com).
     * Whether linking it fits the no-retailer rule is open (machine-guide.md
     * D1), so it is cited unlinked until that is ruled. Delete this line to link it.
     */
    linkHeld: 'machine-guide D1',
  },
  /* ---------- 13. Consumer law: the returns policy (ruling N6, 2026-10-13), and the device regulations (C17) ---------- */
  'on-returns-exchanges': {
    publisher: 'gov-ontario',
    year: 2024,
    display: 'reviewOnly',
    label: 'Returns, exchanges and warranties in Ontario',
    href: 'https://www.ontario.ca/page/returns-exchanges-and-warranties-ontario',
    hrefLang: 'en',
  },
  'on-shopping-online': {
    publisher: 'gov-ontario',
    year: 2021,
    display: 'reviewOnly',
    label: 'Advice on shopping online or over the phone',
    href: 'https://www.ontario.ca/page/advice-shopping-online-or-over-phone',
    hrefLang: 'en',
  },
  'on-cpa-2002': {
    publisher: 'gov-ontario',
    year: 2025,
    display: 'reviewOnly',
    label: 'Consumer Protection Act, 2002',
    href: 'https://www.ontario.ca/laws/statute/02c30',
    hrefLang: 'en',
  },
  'on-reg-17-05': {
    publisher: 'gov-ontario',
    year: 2026,
    display: 'reviewOnly',
    label: 'O. Reg. 17/05, General (Consumer Protection Act, 2002)',
    href: 'https://www.ontario.ca/laws/regulation/050017',
    hrefLang: 'en',
  },
  'qc-opc-online-advice': {
    publisher: 'qc-opc',
    year: 2026,
    display: 'reviewOnly',
    label: 'Consumer Tips: Before Buying Online',
    href: 'https://www.opc.gouv.qc.ca/en/consumer/topic/purchase/online-purchase/advice',
    hrefLang: 'en',
  },
  'qc-cpa-p40-1': {
    publisher: 'gov-quebec',
    display: 'reviewOnly',
    label: 'Consumer Protection Act, CQLR c P-40.1',
    href: 'https://www.legisquebec.gouv.qc.ca/en/document/cs/P-40.1',
    hrefLang: 'en',
  },
  'bc-cpbc-selling-online': {
    publisher: 'consumer-protection-bc',
    year: 2026,
    display: 'reviewOnly',
    label: 'Selling online or over the phone? Contract rules for businesses',
    href: 'https://www.consumerprotectionbc.ca/selling-online-contract-rules-for-businesses/',
    hrefLang: 'en',
  },
  'bc-bpcpa': {
    publisher: 'gov-bc',
    year: 2026,
    display: 'reviewOnly',
    label: 'Business Practices and Consumer Protection Act',
    href: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/04002_00_multi',
    hrefLang: 'en',
  },
  'bc-sga': {
    publisher: 'gov-bc',
    year: 2026,
    display: 'reviewOnly',
    label: 'Sale of Goods Act',
    href: 'https://www.bclaws.gov.bc.ca/civix/document/id/complete/statreg/96410_01',
    hrefLang: 'en',
  },
  'ab-isr-81-2001': {
    publisher: 'gov-alberta',
    year: 2023,
    display: 'reviewOnly',
    label: 'Internet Sales Contract Regulation, AR 81/2001',
    href: 'https://kings-printer.alberta.ca/documents/Regs/2001_081.pdf',
    hrefLang: 'en',
  },
  'ab-cpa': {
    publisher: 'gov-alberta',
    year: 2026,
    display: 'reviewOnly',
    label: 'Consumer Protection Act, RSA 2000 c C-26.3',
    href: 'https://kings-printer.alberta.ca/documents/Acts/C26P3.pdf',
    hrefLang: 'en',
  },
  'ab-sga': {
    publisher: 'gov-alberta',
    year: 2022,
    display: 'reviewOnly',
    label: 'Sale of Goods Act, RSA 2000 c S-2',
    href: 'https://kings-printer.alberta.ca/documents/Acts/S02.pdf',
    hrefLang: 'en',
  },
  'sk-cpbp-regs': {
    publisher: 'gov-sk',
    display: 'reviewOnly',
    label: 'The Consumer Protection and Business Practices Regulations, C-30.2 Reg 1',
    href: 'https://publications.saskatchewan.ca/api/v1/products/71437/formats/79510/download',
    hrefLang: 'en',
  },
  'sk-cpbpa': {
    publisher: 'gov-sk',
    year: 2024,
    display: 'reviewOnly',
    label: 'The Consumer Protection and Business Practices Act',
    href: 'https://publications.saskatchewan.ca/api/v1/products/71365/formats/79349/download',
    hrefLang: 'en',
  },
  'mb-returns-exchanges': {
    publisher: 'gov-manitoba',
    display: 'reviewOnly',
    label: 'Returns & exchanges',
    href: 'https://www.gov.mb.ca/consumerinfo/initiatives/shopping/returns-and-exchanges.html',
    hrefLang: 'en',
  },
  'mb-cpa': {
    publisher: 'gov-manitoba',
    year: 2026,
    display: 'reviewOnly',
    label: 'The Consumer Protection Act, C.C.S.M. c. C200',
    href: 'https://web2.gov.mb.ca/laws/statutes/ccsm/c200.php',
    hrefLang: 'en',
  },
  'mb-reg-176-2000': {
    publisher: 'gov-manitoba',
    display: 'reviewOnly',
    label: 'Internet Agreements Regulation 176/2000',
    href: 'https://web2.gov.mb.ca/laws/regs/current/176-2000.php?lang=en',
    hrefLang: 'en',
  },
  'nb-cpwla': {
    publisher: 'gov-nb',
    year: 2024,
    display: 'reviewOnly',
    label: 'Consumer Product Warranty and Liability Act',
    href: 'https://laws.gnb.ca/en/document/cs/C-18.1',
    hrefLang: 'en',
  },
  'ns-isr': {
    publisher: 'gov-ns',
    display: 'reviewOnly',
    label: 'Internet Sales Contract Regulations, NS Reg 91/2002',
    href: 'https://novascotia.ca/just/regulations/regs/cpintrnt.htm',
    hrefLang: 'en',
  },
  'ns-cpa': {
    publisher: 'gov-ns',
    year: 2025,
    display: 'reviewOnly',
    label: 'Consumer Protection Act, RSNS c 92',
    href: 'https://nslegislature.ca/sites/default/files/legc/statutes/consumer%20protection.pdf',
    hrefLang: 'en',
  },
  'pe-bpa': {
    publisher: 'gov-pei',
    year: 2026,
    display: 'reviewOnly',
    label: 'Business Practices Act',
    href: 'https://www.princeedwardisland.ca/sites/default/files/legislation/B-07-Business%20Practices%20Act.pdf',
    hrefLang: 'en',
  },
  'nl-cpbpa': {
    publisher: 'gov-nl',
    display: 'reviewOnly',
    label: 'Consumer Protection and Business Practices Act, SNL 2009 c C-31.1',
    href: 'https://www.assembly.nl.ca/legislation/sr/statutes/c31-1.htm',
    hrefLang: 'en',
  },
  'nl-sga': {
    publisher: 'gov-nl',
    display: 'reviewOnly',
    label: 'Sale of Goods Act',
    href: 'https://www.assembly.nl.ca/legislation/sr/statutes/s06.htm',
    hrefLang: 'en',
  },
  'nt-cpa': {
    publisher: 'gov-nwt',
    display: 'reviewOnly',
    label: 'Consumer Protection Act, RSNWT 1988 c C-17',
    href: 'https://www.justice.gov.nt.ca/en/files/legislation/consumer-protection/consumer-protection.a.pdf',
    hrefLang: 'en',
  },
  'cmc-internet-template': {
    publisher: 'cmc',
    year: 2019,
    display: 'reviewOnly',
    label: 'Internet Sales Contract Harmonization Template',
    href: 'https://ised-isde.canada.ca/site/consumer-measures-committee/en/formal-agreements/internet-sales-contract-harmonization-template',
    hrefLang: 'en',
  },
  'hc-mdr-sor-98-282': {
    publisher: 'justice-canada',
    year: 2026,
    display: 'reviewOnly',
    label: 'Medical Devices Regulations, SOR/98-282',
    href: 'https://laws-lois.justice.gc.ca/eng/regulations/SOR-98-282/FullText.html',
    hrefLang: 'en',
  },
};
