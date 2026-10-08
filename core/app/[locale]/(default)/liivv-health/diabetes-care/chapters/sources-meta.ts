/*
 * =============================================================================
 * DIABETES CARE CHAPTERS — SOURCE REGISTER
 * =============================================================================
 * The published documents that back the Diabetes chapters. Cards and modules
 * cite a source by id; the chapter engine resolves the id to a label, link and
 * language for the page locale.
 *
 * Canadian sources come first, then international ones, then industry pages,
 * each under its own heading below. An international source is used only where
 * the Canadian ones are silent, and a card that rests on one is labelled as
 * international guidance. An industry page — a manufacturer's own site, or one
 * a manufacturer runs — is never the only source for a claim. The kind of each
 * source, and who publishes it, is in ./sources-review.ts.
 *
 * Only sources that were opened and read are here (checked 2026-10-05). A page
 * known only from a search snippet, one that would not load, and one the source
 * check could not confirm are left out, so citing an id here never cites
 * something nobody has read.
 *
 * Same rule as CitationMeta in chapters-meta.ts: titles are identifiers, so
 * they never go through the message tree. `labelFr` and `hrefFr` are set only
 * where the publisher itself issues a French title or a separate French file.
 * A journal article links to its DOI, the one address that does not move;
 * where it was actually read (a mirror, an abstract) is noted in
 * ./sources-review.ts.
 *
 * Only what a page needs is here: a title, a link, a language, and since owner
 * note 1 (2026-10-07, "sources in the element, not the prose") the publisher's
 * display name, the year where the document carries one, and whether the
 * entry may be shown at all. Every card now names its sources in its own
 * Sources disclosure (_microsite/_components/source-chip.tsx), so the reader
 * sees who backs a card without the copy saying "Diabetes Canada says". The
 * source type, the publisher's full name and the reviewer's paraphrase stay in
 * ./sources-review.ts, which the content-review export reads and no runtime
 * module imports; the export checks that each entry's `scope` (its
 * publisher's, or its own) agrees with that type.
 *
 * `display: 'reviewOnly'` keeps an entry off every page, in both locales: in
 * no Sources disclosure and in no "Where this comes from" list. It is for
 * brand-named insulin product monographs and alerts (ruling C7: brand names
 * stay in the register, not in the copy; insulin is never promoted on /fr)
 * and for a page the copy may name but must not link (ruling C36). A card can
 * still cite it, for the review.
 *
 * Publisher names are display names, not the register's full names. `nameFr`
 * is set only where the publisher itself prints a French name, each read on
 * its own French page on 2026-10-07 (see PUBLISHERS); otherwise the English
 * name stands on /fr, marked as English.
 *
 * No imports and erasable TypeScript only: the content-review export loads this
 * file directly under Node's type stripping.
 * =============================================================================
 */

export interface SourceMeta {
  /** Who publishes it, by PUBLISHERS key. A journal article's publisher is its journal. */
  publisher: PublisherId;
  /*
   * The year the document carries (its edition, update or publication), shown
   * after the publisher in a Sources list. Left out where the page shows none.
   */
  year?: number;
  /* Where the entry's own origin differs from its publisher's (a Canadian study in an international journal). */
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
}

/* How a Sources list groups an entry: Canadian first, then international, then makers. */
export type SourceScope = 'canadian' | 'international' | 'industry';

export interface Publisher {
  /** The display name, as the publisher writes it in English. */
  name: string;
  /** The publisher's own French name, only where it prints one (read 2026-10-07). */
  nameFr?: string;
  /* Where `name` itself is French (Diabète Québec), so an English page marks it as French. */
  lang?: 'fr';
  scope: SourceScope;
}

export type PublisherId =
  | '988'
  | 'abbott'
  | 'ada'
  | 'alberta-blue-cross'
  | 'am-j-transplantation'
  | 'amg-medical'
  | 'ascensia'
  | 'bcdiabetes'
  | 'breakthrough-t1d'
  | 'canscreen'
  | 'catsa'
  | 'ccsa'
  | 'cda-amc'
  | 'cdecb'
  | 'cf-canada'
  | 'chiesi'
  | 'chrc'
  | 'chs'
  | 'chu-sainte-justine'
  | 'clinicaltrials-gov'
  | 'cma'
  | 'cnib'
  | 'communications-medicine'
  | 'cos'
  | 'cps'
  | 'cra'
  | 'dexcom'
  | 'diabete-quebec'
  | 'diabetes-at-school'
  | 'diabetes-canada'
  | 'diabetes-journal'
  | 'diabetes-uk'
  | 'diabetologia'
  | 'embecta'
  | 'esdc'
  | 'exeter'
  | 'fit-canada'
  | 'gov-alberta'
  | 'gov-bc'
  | 'gov-manitoba'
  | 'gov-nb'
  | 'gov-nl'
  | 'gov-ns'
  | 'gov-nwt'
  | 'gov-ontario'
  | 'gov-pei'
  | 'gov-quebec'
  | 'gov-sk'
  | 'gov-yukon'
  | 'health-canada'
  | 'health-canada-dpd'
  | 'health-pei'
  | 'heart-stroke'
  | 'hpsa'
  | 'inesss'
  | 'insulet'
  | 'isc'
  | 'ismp-canada'
  | 'ispad'
  | 'jcem'
  | 'kidney-foundation'
  | 'lifescan'
  | 'medlineplus'
  | 'minimed'
  | 'mylife'
  | 'napra'
  | 'ndt'
  | 'niddk'
  | 'ontario-health'
  | 'pancreapedia'
  | 'parliament'
  | 'pediatric-diabetes'
  | 'phac'
  | 'phsa'
  | 'sanofi'
  | 'shared-health-mb'
  | 'sogc'
  | 'st-boniface'
  | 'tandem'
  | 'vac'
  | 'wounds-canada'
  | 'ypsomed';

/*
 * The publishers, by the name a reader knows them by. French names were read
 * on each publisher's own French page on 2026-10-07: Diabète Canada (its
 * French research-strategy page), Percée DT1 (perceedt1.ca), Société
 * canadienne de pédiatrie, Le diabète à l’école (diabetealecole.ca), Société
 * canadienne d’ophtalmologie, INCA (inca.ca, CNIB's French site), Centre
 * canadien sur les dépendances et l’usage de substances, Société des
 * obstétriciens et gynécologues du Canada, ANORP (NAPRA), Fibrose kystique
 * Canada, Cœur + AVC, Santé Canada, Agence de la santé publique du Canada,
 * Agence du revenu du Canada, Emploi et Développement social Canada, Services
 * aux Autochtones Canada, Anciens Combattants Canada, ACSTA, Commission
 * canadienne des droits de la personne, L’Agence des médicaments du Canada
 * (cda-amc.ca), Gouvernement du Manitoba. Plaies Canada is the name on Wounds
 * Canada's French file, read 2026-10-06 (sources-review.ts). The 9-8-8 name is
 * the line's own French title (`988-suicide-crisis-helpline`). No French name
 * was found for the rest, so their English name stands on /fr.
 */
export const PUBLISHERS: Record<PublisherId, Publisher> = {
  '988': {
    name: '9-8-8: Suicide Crisis Helpline',
    nameFr: '9-8-8 : Ligne d’aide en cas de crise de suicide',
    scope: 'canadian',
  },
  abbott: { name: 'Abbott', scope: 'industry' },
  ada: { name: 'American Diabetes Association', scope: 'international' },
  'alberta-blue-cross': { name: 'Alberta Blue Cross', scope: 'canadian' },
  'am-j-transplantation': { name: 'American Journal of Transplantation', scope: 'international' },
  'amg-medical': { name: 'A.M.G. Medical', scope: 'industry' },
  ascensia: { name: 'Ascensia Diabetes Care', scope: 'industry' },
  bcdiabetes: { name: 'BCDiabetes', scope: 'canadian' },
  'breakthrough-t1d': { name: 'Breakthrough T1D', nameFr: 'Percée DT1', scope: 'canadian' },
  canscreen: { name: 'CanScreen T1D', scope: 'canadian' },
  catsa: { name: 'CATSA', nameFr: 'ACSTA', scope: 'canadian' },
  ccsa: {
    name: 'Canadian Centre on Substance Use and Addiction',
    nameFr: 'Centre canadien sur les dépendances et l’usage de substances',
    scope: 'canadian',
  },
  'cda-amc': {
    name: 'Canada’s Drug Agency',
    nameFr: 'L’Agence des médicaments du Canada',
    scope: 'canadian',
  },
  cdecb: { name: 'Canadian Diabetes Educator Certification Board', scope: 'canadian' },
  'cf-canada': {
    name: 'Cystic Fibrosis Canada',
    nameFr: 'Fibrose kystique Canada',
    scope: 'canadian',
  },
  chiesi: { name: 'Chiesi', scope: 'industry' },
  chrc: {
    name: 'Canadian Human Rights Commission',
    nameFr: 'Commission canadienne des droits de la personne',
    scope: 'canadian',
  },
  chs: { name: 'Canadian Hemochromatosis Society', scope: 'canadian' },
  'chu-sainte-justine': { name: 'CHU Sainte-Justine', lang: 'fr', scope: 'canadian' },
  'clinicaltrials-gov': { name: 'ClinicalTrials.gov', scope: 'international' },
  cma: { name: 'Canadian Medical Association', scope: 'canadian' },
  cnib: { name: 'CNIB', nameFr: 'INCA', scope: 'canadian' },
  'communications-medicine': { name: 'Communications Medicine', scope: 'international' },
  cos: {
    name: 'Canadian Ophthalmological Society',
    nameFr: 'Société canadienne d’ophtalmologie',
    scope: 'canadian',
  },
  cps: {
    name: 'Canadian Paediatric Society',
    nameFr: 'Société canadienne de pédiatrie',
    scope: 'canadian',
  },
  cra: { name: 'Canada Revenue Agency', nameFr: 'Agence du revenu du Canada', scope: 'canadian' },
  dexcom: { name: 'Dexcom', scope: 'industry' },
  'diabete-quebec': { name: 'Diabète Québec', lang: 'fr', scope: 'canadian' },
  'diabetes-at-school': {
    name: 'Diabetes@School',
    nameFr: 'Le diabète à l’école',
    scope: 'canadian',
  },
  'diabetes-canada': { name: 'Diabetes Canada', nameFr: 'Diabète Canada', scope: 'canadian' },
  'diabetes-journal': { name: 'Diabetes (journal)', scope: 'international' },
  'diabetes-uk': { name: 'Diabetes UK', scope: 'international' },
  diabetologia: { name: 'Diabetologia', scope: 'international' },
  embecta: { name: 'embecta', scope: 'industry' },
  esdc: {
    name: 'Employment and Social Development Canada',
    nameFr: 'Emploi et Développement social Canada',
    scope: 'canadian',
  },
  exeter: { name: 'University of Exeter', scope: 'international' },
  'fit-canada': { name: 'FIT Canada (embecta)', scope: 'industry' },
  'gov-alberta': { name: 'Government of Alberta', scope: 'canadian' },
  'gov-bc': { name: 'Government of British Columbia', scope: 'canadian' },
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
  'gov-yukon': { name: 'Government of Yukon', scope: 'canadian' },
  'health-canada': { name: 'Health Canada', nameFr: 'Santé Canada', scope: 'canadian' },
  'health-canada-dpd': { name: 'Health Canada Drug Product Database', scope: 'canadian' },
  'health-pei': { name: 'Health PEI', scope: 'canadian' },
  'heart-stroke': { name: 'Heart and Stroke Foundation', nameFr: 'Cœur + AVC', scope: 'canadian' },
  hpsa: { name: 'Health Products Stewardship Association', scope: 'canadian' },
  inesss: { name: 'INESSS', scope: 'canadian' },
  insulet: { name: 'Insulet (Omnipod)', scope: 'industry' },
  isc: {
    name: 'Indigenous Services Canada',
    nameFr: 'Services aux Autochtones Canada',
    scope: 'canadian',
  },
  'ismp-canada': { name: 'ISMP Canada', scope: 'canadian' },
  ispad: { name: 'ISPAD', scope: 'international' },
  jcem: { name: 'The Journal of Clinical Endocrinology & Metabolism', scope: 'international' },
  'kidney-foundation': { name: 'Kidney Foundation of Canada', scope: 'canadian' },
  lifescan: { name: 'LifeScan (OneTouch)', scope: 'industry' },
  medlineplus: { name: 'MedlinePlus (US National Library of Medicine)', scope: 'international' },
  minimed: { name: 'MiniMed', scope: 'industry' },
  mylife: { name: 'mylife Diabetes Care', scope: 'industry' },
  napra: { name: 'NAPRA', nameFr: 'ANORP', scope: 'canadian' },
  ndt: { name: 'Nephrology Dialysis Transplantation', scope: 'international' },
  niddk: { name: 'NIDDK (US)', scope: 'international' },
  'ontario-health': { name: 'Ontario Health', scope: 'canadian' },
  pancreapedia: { name: 'Pancreapedia', scope: 'international' },
  parliament: { name: 'Parliament of Canada', scope: 'canadian' },
  'pediatric-diabetes': { name: 'Pediatric Diabetes', scope: 'international' },
  phac: {
    name: 'Public Health Agency of Canada',
    nameFr: 'Agence de la santé publique du Canada',
    scope: 'canadian',
  },
  phsa: { name: 'Provincial Health Services Authority (BC)', scope: 'canadian' },
  sanofi: { name: 'Sanofi', scope: 'industry' },
  'shared-health-mb': { name: 'Shared Health Manitoba', scope: 'canadian' },
  sogc: {
    name: 'Society of Obstetricians and Gynaecologists of Canada',
    nameFr: 'Société des obstétriciens et gynécologues du Canada',
    scope: 'canadian',
  },
  'st-boniface': { name: 'St. Boniface Hospital', scope: 'canadian' },
  tandem: { name: 'Tandem Diabetes Care', scope: 'industry' },
  vac: { name: 'Veterans Affairs Canada', nameFr: 'Anciens Combattants Canada', scope: 'canadian' },
  'wounds-canada': { name: 'Wounds Canada', nameFr: 'Plaies Canada', scope: 'canadian' },
  ypsomed: { name: 'Ypsomed (mylife)', scope: 'industry' },
};

export type SourceId =
  /* Canadian: Diabetes Canada clinical practice guidelines */
  | 'dc-cpg-ch3-classification-diagnosis'
  | 'dc-cpg-ch4-screening'
  | 'dc-cpg-ch5-reducing-risk'
  | 'dc-cpg-ch8-targets'
  | 'dc-cpg-ch9-monitoring-2021'
  | 'dc-cpg-ch10-physical-activity'
  | 'dc-cpg-ch11-nutrition-therapy'
  | 'dc-cpg-ch13-t2d-pharmacologic-2024'
  | 'dc-cpg-ch14-hypoglycemia-2023'
  | 'dc-cpg-ch15-hyperglycemic-emergencies'
  | 'dc-cpg-ch16-in-hospital'
  | 'dc-cpg-ch18-mental-health'
  | 'dc-cpg-ch18-mental-health-2023'
  | 'dc-cpg-ch20-transplantation'
  | 'dc-cpg-ch21-driving'
  | 'dc-cpg-ch29-ckd-2025'
  | 'dc-cpg-ch30-retinopathy'
  | 'dc-cpg-ch32-foot-care'
  | 'dc-cpg-ch34-t1d-children'
  | 'dc-cpg-ch35-t2d-children'
  | 'dc-cpg-ch36-pregnancy'
  | 'dc-cpg-ch37-older-people'
  | 'dc-cpg-ch38-indigenous'
  | 'dc-cpg-ch41-t1d-lifespan-2025'
  | 'dc-cpg-appendix-2-classification'
  /* Canadian: Diabetes Canada pages, sheets and notices */
  | 'dc-type-1'
  | 'dc-type-2'
  | 'dc-prediabetes'
  | 'dc-prediabetes-treatment'
  | 'dc-gestational-diabetes'
  | 'dc-diabetes-in-canada'
  | 'dc-checking-blood-sugar'
  | 'dc-technology-and-devices'
  | 'dc-getting-started-with-insulin'
  | 'dc-hypoglycemia-adults-sheet-2024'
  | 'dc-hyperglycemia'
  | 'dc-stay-safe-sick-days-sheet'
  | 'dc-baqsimi-shortage-notice'
  | 'dc-exercise-and-activity'
  | 'dc-carb-counting-sheet-2025'
  | 'dc-alcohol-and-diabetes-2018'
  | 'dc-diabetes-and-drinking-2019'
  | 'dc-cannabis-position-2020'
  | 'dc-foot-care-sheet-2025'
  | 'dc-kidney-disease'
  | 'dc-eye-damage-retinopathy'
  | 'dc-heart-disease-and-stroke'
  | 'dc-taking-care-of-mental-health'
  | 'dc-drive-safe-card'
  | 'dc-driving-and-diabetes'
  | 'dc-air-travel'
  | 'dc-managing-emergency-situations'
  | 'dc-kids-in-school'
  | 'dc-rights-of-people-living-with-diabetes'
  | 'dc-comparisons-by-province'
  | 'dc-out-of-pocket-costs-2022'
  | 'dc-ontario-monitoring-for-health'
  | 'dc-tzield-access-2026'
  | 'dc-virtual-diabetes-education-program'
  /* Canadian: other patient education, guidance and research */
  | 'bt1d-what-is-glucagon'
  | 'bt1d-dka-and-ketones'
  | 'bt1d-time-in-range'
  | 'bt1d-lada'
  | 'bt1d-stages-and-diagnosis'
  | 'bt1d-facts-and-figures'
  | 'bt1d-trialnet'
  | 'bt1d-tzield-update-2026'
  | 'bt1d-mental-health-support'
  | 'bt1d-coverage-map'
  | 'canscreen-t1d'
  | 'das-low-blood-sugar'
  | 'das-glucagon'
  | 'cps-t1d-in-school-2015'
  | 'dq-all-about-injections'
  | 'dq-low-blood-sugar-leaflet-2025'
  | 'dq-infodiabetes-service'
  | 'dq-trips'
  | 'sogc-glucose-testing'
  | 'wounds-canada-diabetic-foot-ulcers'
  | 'wounds-canada-foot-emergency'
  | 'cos-diabetic-retinopathy'
  | 'cnib-diabetic-retinopathy'
  | 'cnib-floaters-and-flashing-lights'
  | 'hsf-heart-attack-signs'
  | 'kfoc-end-diabetic-kidney-disease'
  | 'ccsa-alcohol-guidance-2023'
  | 'hpsa-returning-medical-sharps'
  | 'chs-hemochromatosis-condition'
  | 'chs-hemochromatosis-faq'
  | 'chs-hemochromatosis-treatment'
  | 'cf-canada-cfrd-guideline-2024'
  | 'cma-drivers-guide-endocrine'
  | 'patel-cpsp-monogenic-2023'
  | 'bcdiabetes-autoantibody-testing'
  | 'clinicaltrials-addam-nct03988764'
  | 'cdecb-find-a-cde'
  | '988-suicide-crisis-helpline'
  | 'napra-nds-insulin'
  | 'ismpc-dose-confusion-2019'
  /* Canadian: government programs, benefits and notices */
  | 'hc-glucagon-supply-notice'
  | 'hc-alert-humalog-200-2015'
  | 'hc-dpd-pm-humalog'
  | 'hc-dpd-pm-toujeo'
  | 'hc-dpd-pm-tresiba'
  | 'hc-dpd-pm-entuzity'
  | 'hc-dpd-pm-awiqli'
  | 'hc-dpd-tzield-monograph-2026'
  | 'cda-amc-tzield-recommendation-2026'
  | 'hc-healthy-eating-recommendations'
  | 'hc-infant-botulism'
  | 'phac-folic-acid'
  | 'hc-pharmacare-bilateral-agreements'
  | 'hc-diabetes-device-fund-2024'
  | 'parl-bill-c64-pharmacare'
  | 'cra-dtc-life-sustaining-therapy'
  | 'cra-dtc-how-to-apply'
  | 'cra-rc4064-2025'
  | 'cra-rc4065-2025'
  | 'esdc-rdsp-apply'
  | 'isc-nihb-updates'
  | 'isc-nihb-eligibility'
  | 'isc-nihb-pharmacy-benefits'
  | 'isc-nihb-contact'
  | 'vac-cgm-type-1'
  | 'vac-poc7-medical-supplies'
  | 'vac-contact'
  | 'catsa-diabetic-supplies'
  | 'chrc-human-rights-complaints'
  | 'on-diabetes-equipment-and-supplies'
  | 'on-odb-coverage'
  | 'on-eo-notice-cgm-2025'
  | 'on-odb-formulary-ed43-summary'
  | 'on-preventing-and-living-with-diabetes'
  | 'on-ohip-lab-schedule-2026'
  | 'on-form-014-4521-84'
  | 'on-health-genetics-clinics'
  | 'bc-national-pharmacare'
  | 'bc-diabetes-pins'
  | 'bc-insulin-pumps'
  | 'bc-sa-insulin-pumps'
  | 'bc-pharmacare-contact'
  | 'bc-news-diabetes-coverage-2026'
  | 'bc-guidelines-iron-overload'
  | 'phsa-out-of-province-test-requests'
  | 'ab-specialized-drug-benefits'
  | 'ab-iptp-eligibility-2023'
  | 'ab-non-group-coverage'
  | 'ab-cgm-fact-sheet-2025'
  | 'abc-pharmacy-reference-guide'
  | 'sk-insulin-pump-program'
  | 'sk-drug-cost-assistance'
  | 'mb-pharmacare'
  | 'mb-pharmacare-mepp'
  | 'mb-health-coverage'
  | 'mb-faq-ips'
  | 'mb-shared-health-diabetes-care'
  | 'sbgh-anti-gad65'
  | 'qc-insulin-pump-access-program'
  | 'qc-stays-outside-quebec'
  | 'inesss-libre-3-plus-2026'
  | 'inesss-dexcom-g6-g7-2026'
  | 'inesss-libre-3-plus-notice-2025-12'
  | 'chusj-genetic-tests-not-available'
  | 'nb-insulin-pump-program'
  | 'nb-drug-plans'
  | 'ns-insulin-pump-program'
  | 'ns-sbgm-program'
  | 'ns-pharmacare'
  | 'ns-health-contacts'
  | 'pe-ipp-qa'
  | 'healthpei-national-pharmacare-qa'
  | 'nl-cgm-program-2025'
  | 'nl-insulin-pump-program-2021'
  | 'nl-prescription-drug-program'
  | 'nl-program-claiming-policies'
  | 'yt-national-pharmacare'
  | 'yt-chronic-disease-benefits'
  | 'nt-extended-health-benefits'
  | 'nt-ehb-services'
  /* International: only where the Canadian sources are silent */
  | 'ispad-2022-ch4-monogenic'
  | 'ispad-2022-cfrd'
  | 'ada-soc-2026-s2-summary'
  | 'buzzetti-lada-consensus-2020'
  | 'holt-t1d-adults-consensus-2021'
  | 'phillip-pre-stage-3-monitoring-2024'
  | 'murphy-monogenic-precision-diagnostics-2023'
  | 'naylor-monogenic-precision-treatment-2024'
  | 'brown-lipodystrophy-guideline-2016'
  | 'sharif-ptdm-consensus-2014'
  | 'sharif-ptdm-consensus-2024'
  | 'niddk-monogenic'
  | 'diabetes-uk-lada'
  | 'diabetes-uk-mody'
  | 'exeter-c-peptide-antibody-tests'
  | 'exeter-what-is-mody'
  | 'exeter-mody-testing-guidelines'
  | 'exeter-gck-pregnancy-2018'
  | 'exeter-hnf1b-mody'
  | 'exeter-about-neonatal-diabetes'
  | 'exeter-neonatal-kcnj11-abcc8'
  | 'exeter-sulfonylurea-treatment'
  | 'exeter-sulfonylurea-transfer'
  | 'exeter-midd'
  | 'medlineplus-wolfram-syndrome'
  | 'pancreapedia-type-3c-2015'
  /* Industry: never the only source for a claim */
  | 'fit-canada-pocket-guide-4th-ed'
  | 'sanofi-tzield-approval-2025'
  | 'sanofi-uncovert1d-screening'
  | 'chiesi-myalepta-approval-2024'
  | 'dexcom-canada'
  | 'dexcom-technical-support'
  | 'dexcom-pumps-and-pens'
  | 'dexcom-g7-wear-time'
  | 'abbott-freestyle-canada'
  | 'abbott-freestyle-libre-3'
  | 'abbott-freestyle-contact'
  | 'abbott-libre-3-plus-launch-2025'
  | 'minimed-canada'
  | 'minimed-cgm-coverage'
  | 'minimed-simplera-licence-2026'
  | 'tandem-canada'
  | 'tandem-support'
  | 'tandem-tslim-x2-ciq-user-guide-ca'
  | 'omnipod-canada'
  | 'omnipod-contact'
  | 'omnipod-5-access-and-reimbursement'
  | 'ypsomed-mylife-loop'
  | 'mylife-about-ca'
  | 'lifescan-verio-reflect'
  | 'ascensia-support'
  | 'embecta-contact'
  | 'dex4-contact';

const DC_CPG = 'https://www.diabetes.ca/for-professionals/full-guidelines';
const DC_ASSET = 'https://www.diabetes.ca/getContentAsset';
const EXETER = 'https://www.diabetesgenes.org';

/*
 * The Canadian Diabetes Educator Certification Board's directory, the one the
 * help band links to (`cdecb-find-a-cde` below). Exported on its own so
 * ./site.ts uses the registered address without pulling the whole register
 * into the page bundle.
 */
export const EDUCATOR_DIRECTORY_HREF = 'https://systems.cdecb.ca/findCDE';

export const SOURCE_META: Record<SourceId, SourceMeta> = {
  /* ---------- Canadian: Diabetes Canada clinical practice guidelines ---------- */
  'dc-cpg-ch3-classification-diagnosis': {
    publisher: 'diabetes-canada',
    year: 2018,
    label:
      'Definition, Classification and Diagnosis of Diabetes, Prediabetes and Metabolic Syndrome',
    href: `${DC_CPG}/chapter-3`,
    hrefLang: 'en',
  },
  /* Ruling C38: chapter 5 backs the 5% weight-loss line, chapter 4 the prediabetes heart line (as backup). Both read 2026-10-06. */
  'dc-cpg-ch4-screening': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Screening for Diabetes in Adults',
    href: `${DC_CPG}/chapter-4`,
    hrefLang: 'en',
  },
  'dc-cpg-ch5-reducing-risk': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Reducing the Risk of Developing Diabetes',
    href: `${DC_CPG}/chapter-5`,
    hrefLang: 'en',
  },
  'dc-cpg-ch8-targets': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Targets for Glycemic Control',
    href: `${DC_CPG}/chapter-8`,
    hrefLang: 'en',
  },
  'dc-cpg-ch9-monitoring-2021': {
    publisher: 'diabetes-canada',
    year: 2021,
    label: 'Blood Glucose Monitoring in Adults and Children with Diabetes: Update 2021',
    href: `${DC_CPG}/chapter-9-2021-update`,
    hrefLang: 'en',
  },
  'dc-cpg-ch10-physical-activity': {
    publisher: 'diabetes-canada',
    label: 'Physical Activity and Diabetes',
    href: `${DC_CPG}/chapter-10`,
    hrefLang: 'en',
  },
  'dc-cpg-ch11-nutrition-therapy': {
    publisher: 'diabetes-canada',
    label: 'Nutrition Therapy',
    href: `${DC_CPG}/chapter-11`,
    hrefLang: 'en',
  },
  'dc-cpg-ch13-t2d-pharmacologic-2024': {
    publisher: 'diabetes-canada',
    year: 2024,
    label: 'Pharmacologic Glycemic Management of Type 2 Diabetes in Adults: 2024 Update',
    href: `${DC_CPG}/chapter-13-2024-update`,
    hrefLang: 'en',
  },
  'dc-cpg-ch14-hypoglycemia-2023': {
    publisher: 'diabetes-canada',
    year: 2023,
    label: 'Chapter 14: 2023 Update – Hypoglycemia in Adults',
    href: `${DC_CPG}/chapter-14-2023-update`,
    hrefLang: 'en',
  },
  'dc-cpg-ch15-hyperglycemic-emergencies': {
    publisher: 'diabetes-canada',
    label: 'Hyperglycemic Emergencies in Adults',
    href: `${DC_CPG}/chapter-15`,
    hrefLang: 'en',
  },
  'dc-cpg-ch16-in-hospital': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'In-Hospital Management',
    href: `${DC_CPG}/chapter-16`,
    hrefLang: 'en',
  },
  'dc-cpg-ch18-mental-health': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Diabetes and Mental Health',
    href: `${DC_CPG}/chapter-18`,
    hrefLang: 'en',
  },
  'dc-cpg-ch18-mental-health-2023': {
    publisher: 'diabetes-canada',
    year: 2023,
    label: 'Mental Health and Diabetes: 2023 Update',
    href: `${DC_CPG}/chapter-18-2023-update`,
    hrefLang: 'en',
  },
  'dc-cpg-ch20-transplantation': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Diabetes and Transplantation',
    href: `${DC_CPG}/chapter-20`,
    hrefLang: 'en',
  },
  'dc-cpg-ch21-driving': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Diabetes and Driving',
    href: `${DC_CPG}/chapter-21`,
    hrefLang: 'en',
  },
  'dc-cpg-ch29-ckd-2025': {
    publisher: 'diabetes-canada',
    year: 2025,
    label: 'Chronic Kidney Disease in Diabetes',
    href: `${DC_CPG}/chapter-29-2025-update`,
    hrefLang: 'en',
  },
  'dc-cpg-ch30-retinopathy': {
    publisher: 'diabetes-canada',
    label: 'Retinopathy',
    href: `${DC_CPG}/chapter-30`,
    hrefLang: 'en',
  },
  'dc-cpg-ch32-foot-care': {
    publisher: 'diabetes-canada',
    label: 'Foot Care',
    href: `${DC_CPG}/chapter-32`,
    hrefLang: 'en',
  },
  'dc-cpg-ch34-t1d-children': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Type 1 Diabetes in Children and Adolescents',
    href: `${DC_CPG}/chapter-34`,
    hrefLang: 'en',
  },
  'dc-cpg-ch35-t2d-children': {
    publisher: 'diabetes-canada',
    label: 'Type 2 Diabetes in Children and Adolescents',
    href: `${DC_CPG}/chapter-35`,
    hrefLang: 'en',
  },
  'dc-cpg-ch36-pregnancy': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Diabetes and Pregnancy',
    href: `${DC_CPG}/chapter-36`,
    hrefLang: 'en',
  },
  'dc-cpg-ch37-older-people': {
    publisher: 'diabetes-canada',
    label: 'Diabetes in Older People',
    href: `${DC_CPG}/chapter-37`,
    hrefLang: 'en',
  },
  'dc-cpg-ch38-indigenous': {
    publisher: 'diabetes-canada',
    label: 'Type 2 Diabetes and Indigenous Peoples',
    href: `${DC_CPG}/chapter-38`,
    hrefLang: 'en',
  },
  'dc-cpg-ch41-t1d-lifespan-2025': {
    publisher: 'diabetes-canada',
    year: 2025,
    label: 'Glycemic Management Across the Lifespan for People With Type 1 Diabetes',
    href: `${DC_CPG}/chapter-41`,
    hrefLang: 'en',
  },
  'dc-cpg-appendix-2-classification': {
    publisher: 'diabetes-canada',
    label: 'Etiologic Classification of Diabetes Mellitus',
    href: 'https://www.diabetes.ca/for-professionals/appendices/appendix-2',
    hrefLang: 'en',
  },

  /* ---------- Canadian: Diabetes Canada pages, sheets and notices ---------- */
  'dc-type-1': {
    publisher: 'diabetes-canada',
    label: 'Type 1 Diabetes',
    href: 'https://www.diabetes.ca/what-is-diabetes/types-of-diabetes/type-1-diabetes',
    hrefLang: 'en',
  },
  'dc-type-2': {
    publisher: 'diabetes-canada',
    label: 'Type 2 Diabetes',
    href: 'https://www.diabetes.ca/what-is-diabetes/types-of-diabetes/type-2-diabetes',
    hrefLang: 'en',
  },
  'dc-prediabetes': {
    publisher: 'diabetes-canada',
    label: 'Prediabetes',
    href: 'https://www.diabetes.ca/what-is-diabetes/types-of-diabetes/prediabetes',
    hrefLang: 'en',
  },
  /* Ruling C38. Read 2026-10-06; no French page found. */
  'dc-prediabetes-treatment': {
    publisher: 'diabetes-canada',
    label: 'Prediabetes Treatment',
    href: 'https://www.diabetes.ca/what-is-diabetes/treatment/prediabetes-treatment',
    hrefLang: 'en',
  },
  'dc-gestational-diabetes': {
    publisher: 'diabetes-canada',
    label: 'Gestational Diabetes',
    href: 'https://www.diabetes.ca/what-is-diabetes/types-of-diabetes/gestational-diabetes',
    hrefLang: 'en',
  },
  /* Ruling C41. Read 2026-10-06; no French page found. */
  'dc-diabetes-in-canada': {
    publisher: 'diabetes-canada',
    label: 'Diabetes in Canada',
    href: 'https://www.diabetes.ca/what-is-diabetes/diabetes-in-canada',
    hrefLang: 'en',
  },
  'dc-checking-blood-sugar': {
    publisher: 'diabetes-canada',
    label: 'Checking Blood Sugar',
    href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/checking-blood-sugar',
    hrefLang: 'en',
  },
  'dc-technology-and-devices': {
    publisher: 'diabetes-canada',
    label: 'Technology & Devices',
    href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/technology-and-devices',
    hrefLang: 'en',
  },
  'dc-getting-started-with-insulin': {
    publisher: 'diabetes-canada',
    label: 'Getting Started with Insulin',
    href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/getting-started-with-insulin',
    hrefLang: 'en',
  },
  'dc-hypoglycemia-adults-sheet-2024': {
    publisher: 'diabetes-canada',
    year: 2024,
    label: 'Hypoglycemia: low blood sugar in adults (02/24)',
    href: `${DC_ASSET}/7f36723d-3507-4657-a579-78b1fd0437e6/0f6cf596-933c-4f74-b36a-77091c512445/hypoglycemia-low-blood-sugar-in-adults.pdf?language=en`,
    hrefLang: 'en',
  },
  'dc-hyperglycemia': {
    publisher: 'diabetes-canada',
    label: 'Hyperglycemia',
    href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/hyperglycemia',
    hrefLang: 'en',
  },
  'dc-stay-safe-sick-days-sheet': {
    publisher: 'diabetes-canada',
    label: 'Stay Safe When You Have Diabetes and Are Sick or at Risk of Dehydration',
    href: `${DC_ASSET}/5bdc8b7c-4402-4d72-b86b-700f9dfd3b9d/0f6cf596-933c-4f74-b36a-77091c512445/stay-safe-when-you-have-diabetes-and-sick-or-at-risk-of-dehydration.pdf?language=en`,
    hrefLang: 'en',
  },
  'dc-baqsimi-shortage-notice': {
    publisher: 'diabetes-canada',
    label: 'Notice of Baqsimi (glucagon nasal powder) shortage',
    href: 'https://www.diabetes.ca/media-room/news/notice-of-baqsimi-(glucagon-nasal-powder)-shortage',
    hrefLang: 'en',
  },
  'dc-exercise-and-activity': {
    publisher: 'diabetes-canada',
    label: 'Exercise & Activity',
    href: 'https://www.diabetes.ca/living-with-diabetes/exercise-fitness/exercise-activity',
    hrefLang: 'en',
  },
  'dc-carb-counting-sheet-2025': {
    publisher: 'diabetes-canada',
    year: 2025,
    label: 'Basic carbohydrate counting for diabetes management (07/25)',
    href: `${DC_ASSET}/96aeaf15-ba48-40d1-ae3e-57e3d24cc14e/0f6cf596-933c-4f74-b36a-77091c512445/basic-carbohydrate-counting.pdf?language=en`,
    hrefLang: 'en',
  },
  /* The sheet linked from the 2019 article; the article itself does not carry these facts. */
  'dc-alcohol-and-diabetes-2018': {
    publisher: 'diabetes-canada',
    year: 2018,
    label: 'Alcohol and diabetes (04/18)',
    href: `${DC_ASSET}/cde22e37-4601-4a6b-883d-4299cb760606/0f6cf596-933c-4f74-b36a-77091c512445/alcohol-and-diabetes.pdf`,
    hrefLang: 'en',
  },
  'dc-diabetes-and-drinking-2019': {
    publisher: 'diabetes-canada',
    year: 2019,
    label: 'Diabetes and Drinking',
    href: 'https://www.diabetes.ca/living-with-diabetes/stories/diabetes-and-drinking',
    hrefLang: 'en',
  },
  'dc-cannabis-position-2020': {
    publisher: 'diabetes-canada',
    year: 2020,
    label: 'Cannabis Use in Adults and Adolescents with Diabetes',
    href: 'https://www.diabetes.ca/advocacy-and-policy/our-policy-positions/cannabis-use-in-adults-and-adolescents-with-diabetes',
    hrefLang: 'en',
  },
  'dc-foot-care-sheet-2025': {
    publisher: 'diabetes-canada',
    year: 2025,
    label: 'Foot care: a step toward good health (08/25)',
    href: `${DC_ASSET}/33d37ad7-82dd-4c56-a8ee-48cd7051589a/0f6cf596-933c-4f74-b36a-77091c512445/foot-care.pdf?language=en`,
    hrefLang: 'en',
  },
  'dc-kidney-disease': {
    publisher: 'diabetes-canada',
    label: 'Kidney Disease',
    href: 'https://www.diabetes.ca/living-with-diabetes/managing-complications/kidney-disease',
    hrefLang: 'en',
  },
  /* Ruling C24. Read 2026-10-06; no French page found. */
  'dc-eye-damage-retinopathy': {
    publisher: 'diabetes-canada',
    label: 'Eye Damage (Diabetic Retinopathy)',
    href: 'https://www.diabetes.ca/living-with-diabetes/managing-complications/eye-damage-diabetic-retinopathy',
    hrefLang: 'en',
  },
  'dc-heart-disease-and-stroke': {
    publisher: 'diabetes-canada',
    label: 'Heart Disease & Stroke',
    href: 'https://www.diabetes.ca/living-with-diabetes/managing-complications/heart-disease-and-stroke',
    hrefLang: 'en',
  },
  'dc-taking-care-of-mental-health': {
    publisher: 'diabetes-canada',
    label: 'Taking care of your mental health',
    href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/mental-health-and-diabetes/taking-care-of-your-mental-health',
    hrefLang: 'en',
  },
  'dc-drive-safe-card': {
    publisher: 'diabetes-canada',
    label: 'Drive Safe with Diabetes',
    href: `${DC_ASSET}/a78b7c7d-17c8-4943-8cbc-c4d4ed7270c4/0f6cf596-933c-4f74-b36a-77091c512445/drive-safe-with-diabetes.pdf?language=en`,
    hrefLang: 'en',
  },
  'dc-driving-and-diabetes': {
    publisher: 'diabetes-canada',
    label: 'Driving and Diabetes',
    href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/the-rights-of-people-living-with-diabetes/diabetes-and-driving',
    hrefLang: 'en',
  },
  'dc-air-travel': {
    publisher: 'diabetes-canada',
    label: 'Air Travel',
    href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/the-rights-of-people-living-with-diabetes/air-travel',
    hrefLang: 'en',
  },
  'dc-managing-emergency-situations': {
    publisher: 'diabetes-canada',
    label: 'Managing Diabetes in Emergency Situations',
    href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/managing-diabetes-in-emergency-situations',
    hrefLang: 'en',
  },
  'dc-kids-in-school': {
    publisher: 'diabetes-canada',
    label: 'Kids with Diabetes in School',
    href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/kids-with-diabetes-in-school',
    hrefLang: 'en',
  },
  'dc-rights-of-people-living-with-diabetes': {
    publisher: 'diabetes-canada',
    label: 'The Rights of People Living with Diabetes',
    href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/the-rights-of-people-living-with-diabetes',
    hrefLang: 'en',
  },
  'dc-comparisons-by-province': {
    publisher: 'diabetes-canada',
    label: 'Comparisons by Province/Territory',
    href: 'https://www.diabetes.ca/advocacy-and-policy/advocacy-reports/comparisons-by-province-territory',
    hrefLang: 'en',
  },
  'dc-out-of-pocket-costs-2022': {
    publisher: 'diabetes-canada',
    year: 2022,
    label: 'Diabetes and Diabetes-Related Out-of-Pocket Costs (2022)',
    href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/diabetes-and-diabetes-related-out-of-pocket-costs',
    hrefLang: 'en',
  },
  'dc-ontario-monitoring-for-health': {
    publisher: 'diabetes-canada',
    label: 'Ontario Monitoring for Health Program',
    href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/diabetes-and-diabetes-related-out-of-pocket-costs/ontario-monitoring-for-health-program',
    hrefLang: 'en',
  },
  'dc-tzield-access-2026': {
    publisher: 'diabetes-canada',
    year: 2026,
    label: 'Access to T1D immunotherapy drug Tzield in Canada',
    href: 'https://www.diabetes.ca/media-room/news/access-to-t1d-immunotherapy-drug-tzield-in-canada',
    hrefLang: 'en',
  },
  /* Opened 2026-10-06 for Every Day Living's resources shelf. No French page. */
  'dc-virtual-diabetes-education-program': {
    publisher: 'diabetes-canada',
    label: 'Virtual Diabetes Education Program',
    href: 'https://www.diabetes.ca/living-with-diabetes/virtual-learning/virtual-diabetes-education-program',
    hrefLang: 'en',
  },

  /* ---------- Canadian: other patient education, guidance and research ---------- */
  'bt1d-what-is-glucagon': {
    publisher: 'breakthrough-t1d',
    label: 'What is glucagon?',
    href: 'https://breakthrought1d.ca/daily-management/what-is-glucagon/',
    hrefLang: 'en',
  },
  'bt1d-dka-and-ketones': {
    publisher: 'breakthrough-t1d',
    label: 'Diabetic ketoacidosis (DKA) and ketones',
    href: 'https://breakthrought1d.ca/daily-management/diabetic-ketoacidosis-dka-and-ketones/',
    hrefLang: 'en',
  },
  'bt1d-time-in-range': {
    publisher: 'breakthrough-t1d',
    label: 'Time in Range',
    href: 'https://breakthrought1d.ca/daily-management/time-in-range/',
    hrefLang: 'en',
  },
  'bt1d-lada': {
    publisher: 'breakthrough-t1d',
    label: 'Latent autoimmune diabetes in adults',
    href: 'https://breakthrought1d.ca/newly-diagnosed/latent-autoimmune-diabetes-in-adults/',
    hrefLang: 'en',
  },
  'bt1d-stages-and-diagnosis': {
    publisher: 'breakthrough-t1d',
    label: 'Stages and diagnosis of T1D',
    href: 'https://breakthrought1d.ca/t1d-basics/stages-and-diagnosis-of-t1d/',
    hrefLang: 'en',
  },
  'bt1d-facts-and-figures': {
    publisher: 'breakthrough-t1d',
    label: 'Facts and figures',
    href: 'https://breakthrought1d.ca/t1d-basics/facts-and-figures/',
    hrefLang: 'en',
  },
  'bt1d-trialnet': {
    publisher: 'breakthrough-t1d',
    label: 'TrialNet',
    href: 'https://breakthrought1d.ca/research/clinical-trials/trialnet/',
    hrefLang: 'en',
  },
  'bt1d-tzield-update-2026': {
    publisher: 'breakthrough-t1d',
    year: 2026,
    label: 'Tzield update',
    labelFr: 'Mise à jour au sujet de Tzield',
    href: 'https://breakthrought1d.ca/news/tzield-update/',
    hrefFr: 'https://perceedt1.ca/nouvelles/mise-a-jour-au-sujet-de-tzield/',
    hrefLang: 'en',
  },
  /* French page on perceedt1.ca, Breakthrough T1D Canada's French site, opened 2026-10-06. */
  'bt1d-mental-health-support': {
    publisher: 'breakthrough-t1d',
    label: 'Mental Health Support',
    labelFr: 'Soutien en santé mentale',
    href: 'https://breakthrought1d.ca/mental-health-support/',
    hrefFr: 'https://perceedt1.ca/soutien-en-sante-mentale/',
    hrefLang: 'en',
  },
  'bt1d-coverage-map': {
    publisher: 'breakthrough-t1d',
    label: 'Coverage map',
    href: 'https://breakthrought1d.ca/advocacy/access-for-all/coverage-map/',
    hrefLang: 'en',
  },
  'canscreen-t1d': {
    publisher: 'canscreen',
    label: 'CanScreen T1D Research Consortium',
    href: 'https://canscreent1d.ca/',
    hrefLang: 'en',
  },
  'das-low-blood-sugar': {
    publisher: 'diabetes-at-school',
    label: 'Low blood sugar: What it is, and what to do',
    href: 'https://diabetesatschool.ca/understanding/low-blood-sugar-what-it-is-and-what-to-do',
    hrefLang: 'en',
  },
  'das-glucagon': {
    publisher: 'diabetes-at-school',
    label: 'Glucagon: What it is and how to use it',
    href: 'https://diabetesatschool.ca/understanding/glucagon',
    hrefLang: 'en',
  },
  'cps-t1d-in-school-2015': {
    publisher: 'cps',
    year: 2015,
    label: 'Managing type 1 diabetes in school (CPS position statement, 2015)',
    href: 'https://cps.ca/en/documents/position/type-1-diabetes-in-school',
    hrefLang: 'en',
  },
  'dq-all-about-injections': {
    publisher: 'diabete-quebec',
    label: 'All about injections',
    labelFr: "Tout sur l'injection",
    href: 'https://www.diabete.qc.ca/en/diabetes/diabetes-management/insulin/all-about-injections/',
    hrefFr:
      'https://www.diabete.qc.ca/le-diabete/la-gestion-du-diabete/linsuline/tout-sur-linjection/',
    hrefLang: 'en',
  },
  /* The 2025 leaflet itself, not Diabète Québec's web page (ruling C13). EN and FR files read 2026-10-06. */
  'dq-low-blood-sugar-leaflet-2025': {
    publisher: 'diabete-quebec',
    year: 2025,
    label: 'Low Blood Sugar - Symptoms and Actions to Take',
    labelFr: 'Hypoglycémie : symptômes et mesures à prendre',
    href: 'https://www.diabete.qc.ca/wp-content/uploads/2022/06/112382-DQC25-Depliants6-Hypoglycemie-EN_11-2025_web.pdf',
    hrefFr:
      'https://www.diabete.qc.ca/wp-content/uploads/2022/06/112382-DQC25-Depliants6-Hypoglycemie-FR_11_2025_web.pdf',
    hrefLang: 'en',
  },
  /*
   * Diabète Québec's question line and its travel page, each with the
   * publisher's own English and French page (their hreflang pair), opened
   * 2026-10-06 for Every Day Living's resources shelf.
   */
  'dq-infodiabetes-service': {
    publisher: 'diabete-quebec',
    label: 'InfoDiabetes Service',
    labelFr: 'Service InfoDiabète',
    href: 'https://www.diabete.qc.ca/en/service/infodiabetes-service/',
    hrefFr: 'https://www.diabete.qc.ca/service/service-infodiabete-2/',
    hrefLang: 'en',
  },
  'dq-trips': {
    publisher: 'diabete-quebec',
    label: 'Trips',
    labelFr: 'Voyages',
    href: 'https://www.diabete.qc.ca/en/diabetes/living-with-diabetes/travels/',
    hrefFr: 'https://www.diabete.qc.ca/le-diabete/la-vie-avec-le-diabete/voyages/',
    hrefLang: 'en',
  },
  'sogc-glucose-testing': {
    publisher: 'sogc',
    label: 'Glucose testing – screening for gestational diabetes',
    href: 'https://www.pregnancyinfo.ca/your-pregnancy/routine-tests/glucose-testing/',
    hrefLang: 'en',
  },
  'wounds-canada-diabetic-foot-ulcers': {
    publisher: 'wounds-canada',
    label: 'Diabetic Foot Ulcers',
    href: 'https://www.woundscanada.ca/patient-or-caregiver/preventing-and-managing-wounds/wound-basics-dev/293-patient-caregiver/wound-index/582-diabetic-foot-ulcers-overview',
    hrefLang: 'en',
  },
  /*
   * Ruling C10. The French file is a token link published on Wounds Canada's
   * French care-at-home page; it opened 2026-10-06, but re-check it before
   * publishing and on the recheck schedule.
   */
  'wounds-canada-foot-emergency': {
    publisher: 'wounds-canada',
    label: 'Diabetic Foot Complications: When is it an Emergency?',
    labelFr: 'Complications du pied diabétique: Quand est-ce considéré une urgence?',
    href: 'https://www.woundscanada.ca/docman/public/patient-or-caregiver/1727-home-emergency-df-care-1941e',
    hrefFr:
      'https://www.woundscanada.ca/doclink/home-emergency-df-care-1941f/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJob21lLWVtZXJnZW5jeS1kZi1jYXJlLTE5NDFmIiwiaWF0IjoxNjEyMTk2MDg1LCJleHAiOjE2MTIyODI0ODV9.8YjsEGrGLV5h7znJST2DfHIsR79wZJ4oO9DQd6uY07Q',
    hrefLang: 'en',
  },
  'cos-diabetic-retinopathy': {
    publisher: 'cos',
    label: 'Diabetic Retinopathy | See The Possibilities',
    labelFr: 'La rétinopathie diabétique',
    href: 'https://www.seethepossibilities.ca/eye-health/diabetic-retinopathy/',
    hrefFr:
      'https://www.seethepossibilities.ca/les-cinq-principaux-problemes/la-retinopathie-diabetique/?lang=fr',
    hrefLang: 'en',
  },
  'cnib-diabetic-retinopathy': {
    publisher: 'cnib',
    label: 'Diabetic Retinopathy',
    href: 'https://www.cnib.ca/en/sight-loss-info/your-eyes/eye-diseases/diabetic-retinopathy',
    hrefLang: 'en',
  },
  /*
   * Ruling C10. The French address is the one CNIB's own French link now
   * redirects to (cnib.ca/fr/… → inca.ca/fr/…, 301), opened 2026-10-06.
   */
  'cnib-floaters-and-flashing-lights': {
    publisher: 'cnib',
    label: 'Floaters and Flashing Lights',
    labelFr: 'Corps flottants et éclairs de lumière ou éblouissements intermittents',
    href: 'https://www.cnib.ca/en/sight-loss-info/your-eyes/eye-diseases/floaters-and-flashing-lights',
    hrefFr:
      'https://www.inca.ca/fr/corps-flottants-et-eclairs-de-lumiere-ou-eblouissements-intermittents',
    hrefLang: 'en',
  },
  'hsf-heart-attack-signs': {
    publisher: 'heart-stroke',
    label: 'Signs of a heart attack',
    labelFr: 'Les signes d’une crise cardiaque',
    href: 'https://www.heartandstroke.ca/heart-disease/emergency-signs',
    hrefFr: 'https://www.coeuretavc.ca/maladies-du-coeur/signes-d-urgence',
    hrefLang: 'en',
  },
  'kfoc-end-diabetic-kidney-disease': {
    publisher: 'kidney-foundation',
    label: 'End Diabetic Kidney Disease',
    href: 'https://kidney.ca/en/news-and-media/campaigns/end-diabetic-kidney-disease',
    hrefLang: 'en',
  },
  'ccsa-alcohol-guidance-2023': {
    publisher: 'ccsa',
    year: 2023,
    label: "Canada's Guidance on Alcohol and Health (2023)",
    labelFr: 'Repères canadiens sur l’alcool et la santé',
    href: 'https://www.ccsa.ca/en/guidance-tools-resources/substances/alcohol/canadas-guidance-alcohol-and-health',
    hrefFr: 'https://www.ccsa.ca/fr/node/18776',
    hrefLang: 'en',
  },
  'hpsa-returning-medical-sharps': {
    publisher: 'hpsa',
    label: 'Returning Medical Sharps',
    href: 'https://healthsteward.ca/consumers/returning-medical-sharps/',
    hrefLang: 'en',
  },
  'chs-hemochromatosis-condition': {
    publisher: 'chs',
    label: 'The Condition (Canadian Hemochromatosis Society)',
    href: 'https://www.toomuchiron.ca/hemochromatosis/the-condition/',
    hrefLang: 'en',
  },
  'chs-hemochromatosis-faq': {
    publisher: 'chs',
    label: 'FAQ (Canadian Hemochromatosis Society)',
    href: 'https://www.toomuchiron.ca/hemochromatosis/faq/',
    hrefLang: 'en',
  },
  'chs-hemochromatosis-treatment': {
    publisher: 'chs',
    label: 'Treatment & Maintenance (Canadian Hemochromatosis Society)',
    href: 'https://www.toomuchiron.ca/hemochromatosis/treatment-and-maintenance/',
    hrefLang: 'en',
  },
  /*
   * Cystic Fibrosis Canada's own guidelines page, which lists and links the
   * guideline (owner answer B36, 2026-10-06: official sources only), rather
   * than the PDF on the CDN it is served from; the PDF's address is recorded in
   * ./sources-review.ts. Both pages opened 2026-10-06. The label is the
   * guideline's title as the page prints it, then the page's own title.
   */
  'cf-canada-cfrd-guideline-2024': {
    publisher: 'cf-canada',
    year: 2024,
    label:
      'Cystic Fibrosis Related Diabetes (CFRD): A First Canadian Clinical Practice Guideline — Guidelines & Standards of Care (Cystic Fibrosis Canada)',
    labelFr:
      'Diabète associé à la fibrose kystique : premières lignes directrices de pratique clinique Canadiennes — Normes de soins de la FK et lignes directrices cliniques (Fibrose kystique Canada)',
    href: 'https://cysticfibrosis.ca/guidelines-and-standards-of-care',
    hrefFr: 'https://fibrosekystique.ca/normes-de-soins-de-la-fk-et-lignes-directrices-cliniques',
    hrefLang: 'en',
  },
  'cma-drivers-guide-endocrine': {
    publisher: 'cma',
    label: "Endocrine and metabolic disorders (CMA Driver's Guide, 10th ed.)",
    href: 'https://driversguide.ca/sections/endocrine-and-metabolic-disorders',
    hrefLang: 'en',
  },
  'patel-cpsp-monogenic-2023': {
    publisher: 'pediatric-diabetes',
    year: 2023,
    scope: 'canadian',
    label:
      'Incidence Trends of Type 2 Diabetes Mellitus, Medication-Induced Diabetes, and Monogenic Diabetes in Canadian Children, Then (2006–2008) and Now (2017–2019)',
    href: 'https://doi.org/10.1155/2023/5511049',
    hrefLang: 'en',
  },
  'bcdiabetes-autoantibody-testing': {
    publisher: 'bcdiabetes',
    label: 'Type 1 diabetes auto-antibody testing (BCDiabetes handout)',
    href: 'https://www.bcdiabetes.ca/wp-content/uploads/bcdpdfs/Type-1-diabetes-auto-antibody-testing.pdf',
    hrefLang: 'en',
  },
  /* The registry's record, as read. A Canadian study on a US registry. */
  'clinicaltrials-addam-nct03988764': {
    publisher: 'clinicaltrials-gov',
    scope: 'canadian',
    label: 'Accurate Diagnosis of Diabetes for Appropriate Management (ADDAM), NCT03988764',
    href: 'https://clinicaltrials.gov/api/v2/studies/NCT03988764',
    hrefLang: 'en',
  },
  /* The help band's educator directory (DIABETES_SITE.furniture.directoryHref, ./site.ts). */
  'cdecb-find-a-cde': {
    publisher: 'cdecb',
    label: 'Find a CDE®',
    href: EDUCATOR_DIRECTORY_HREF,
    hrefLang: 'en',
  },

  /* French site opened 2026-10-06: "9-8-8: Ligne d’aide en cas de crise de suicide". */
  '988-suicide-crisis-helpline': {
    publisher: '988',
    label: '9-8-8: Suicide Crisis Helpline',
    labelFr: '9-8-8 : Ligne d’aide en cas de crise de suicide',
    href: 'https://988.ca/',
    hrefFr: 'https://988.ca/fr',
    hrefLang: 'en',
  },
  /*
   * The landing's held "Behind the counter" wording on insulin and glucagon
   * (../landing-meta.ts, LANDING_HELD E5). No live line cites it yet.
   */
  'napra-nds-insulin': {
    publisher: 'napra',
    label: 'Insulin (National Drug Schedules)',
    href: 'https://www.napra.ca/nds/insulin/',
    hrefLang: 'en',
  },
  /* Ruling C7. ISMP Canada Safety Bulletin, Vol 19 Issue 9; EN and FR pages opened 2026-10-06. */
  'ismpc-dose-confusion-2019': {
    publisher: 'ismp-canada',
    year: 2019,
    label: 'Dose Confusion When Switching between Insulin Delivery Devices',
    labelFr: 'Erreur de dose en passant d’un dispositif d’administration de l’insuline à un autre',
    href: 'https://ismpcanada.ca/bulletin/dose-confusion-when-switching-between-insulin-delivery-devices/',
    hrefFr:
      'https://ismpcanada.ca/fr/bulletin/erreur-de-dose-en-passant-dun-dispositif-dadministration-de-linsuline-a-un-autre/',
    hrefLang: 'en',
  },

  /* ---------- Canadian: government programs, benefits and notices ---------- */
  'hc-glucagon-supply-notice': {
    publisher: 'health-canada',
    label: 'Glucagon injection: supply notice',
    href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/drug-shortages/information-consumers/supply-notices/glucagon-injection.html',
    hrefLang: 'en',
  },
  /* Ruling C7. Archived Health Canada alert of 2015-09-14; EN and FR pages opened 2026-10-06. */
  'hc-alert-humalog-200-2015': {
    publisher: 'health-canada',
    year: 2015,
    display: 'reviewOnly',
    label:
      'Humalog (insulin lispro) KwikPen 200 Units/mL - Information on Correct Use to Minimize Medication Errors',
    labelFr:
      'Humalog (insuline lispro) KwikPen à 200 unités/mL - Informations concernant l’utilisation correcte afin de minimiser les erreurs de médication',
    href: 'https://recalls-rappels.canada.ca/en/alert-recall/humalog-insulin-lispro-kwikpen-200-unitsml-information-correct-use-minimize-medication',
    hrefFr:
      'https://recalls-rappels.canada.ca/fr/avis-rappel/humalog-insuline-lispro-kwikpen-200-unitesml-informations-concernant-utilisation',
    hrefLang: 'en',
  },
  /*
   * Ruling C7: the product monographs, as authorized by Health Canada and served
   * by its Drug Product Database, for each insulin stronger than U-100 marketed
   * in Canada. Each file (EN, and FR where DPD has one) opened 2026-10-06. Brand
   * names stay here and in the register; the copy names strengths only.
   */
  'hc-dpd-pm-humalog': {
    publisher: 'health-canada-dpd',
    display: 'reviewOnly',
    label: 'Product Monograph: HUMALOG, HUMALOG 200 units/mL KwikPen, HUMALOG MIX25, HUMALOG MIX50',
    /* As the French monograph prints it (cover and page footer; revised 2021-04-12), read 2026-10-06. */
    labelFr:
      'Monographie de produit : HUMALOG, HUMALOG KwikPen à 200 unités/mL, HUMALOG MIX25, HUMALOG MIX50',
    href: 'https://pdf.hres.ca/dpd_pm/00063278.PDF',
    hrefFr: 'https://pdf.hres.ca/dpd_pm/00063279.PDF',
    hrefLang: 'en',
  },
  'hc-dpd-pm-toujeo': {
    publisher: 'health-canada-dpd',
    display: 'reviewOnly',
    label:
      'Product Monograph Including Patient Medication Information: TOUJEO SoloSTAR, TOUJEO DoubleSTAR',
    labelFr:
      "Monographie de produit incluant des informations concernant le médicament à l'intention du patient : TOUJEO SoloSTAR, TOUJEO DoubleSTAR",
    href: 'https://pdf.hres.ca/dpd_pm/00056295.PDF',
    hrefFr: 'https://pdf.hres.ca/dpd_pm/00057114.PDF',
    hrefLang: 'en',
  },
  'hc-dpd-pm-tresiba': {
    publisher: 'health-canada-dpd',
    display: 'reviewOnly',
    label: 'Product Monograph Including Patient Medication Information: TRESIBA',
    /* As the French monograph's cover prints it (revised 2022-10-27), read 2026-10-06. */
    labelFr:
      'Monographie de produit incluant les renseignements sur le médicament pour le patient : Tresiba',
    href: 'https://pdf.hres.ca/dpd_pm/00068133.PDF',
    hrefFr: 'https://pdf.hres.ca/dpd_pm/00068706.PDF',
    hrefLang: 'en',
  },
  'hc-dpd-pm-entuzity': {
    publisher: 'health-canada-dpd',
    display: 'reviewOnly',
    label: 'Product Monograph Including Patient Medication Information: ENTUZITY KwikPen',
    labelFr:
      'Monographie incluant les renseignements pour les patients sur les médicaments : ENTUZITY KwikPen',
    href: 'https://pdf.hres.ca/dpd_pm/00060561.PDF',
    hrefFr: 'https://pdf.hres.ca/dpd_pm/00061673.PDF',
    hrefLang: 'en',
  },
  /* DPD has no French monograph for this product. */
  'hc-dpd-pm-awiqli': {
    publisher: 'health-canada-dpd',
    display: 'reviewOnly',
    label: 'Product Monograph Including Patient Medication Information: AWIQLI',
    href: 'https://pdf.hres.ca/dpd_pm/00082796.PDF',
    hrefLang: 'en',
  },
  /*
   * Ruling C26. The monograph Health Canada authorized for Tzield (2026-07-20),
   * served by its Drug Product Database, EN and FR files read 2026-10-06; and
   * Canada's Drug Agency's reimbursement recommendation (January 2026), whose
   * French project page links only the English PDF.
   */
  'hc-dpd-tzield-monograph-2026': {
    publisher: 'health-canada-dpd',
    year: 2026,
    label: 'TZIELD Product Monograph Including Patient Medication Information',
    labelFr: 'Monographie de produit avec Renseignements destinés aux patient·e·s – TZIELD',
    href: 'https://pdf.hres.ca/dpd_pm/00085390.PDF',
    hrefFr: 'https://pdf.hres.ca/dpd_pm/00085758.PDF',
    hrefLang: 'en',
  },
  'cda-amc-tzield-recommendation-2026': {
    publisher: 'cda-amc',
    year: 2026,
    label: 'Reimbursement Recommendation: Teplizumab (Tzield)',
    href: 'https://cda-amc.ca/sites/default/files/DRR/2025/SR0867-Tzield_Recommendation.pdf',
    hrefLang: 'en',
  },
  'hc-healthy-eating-recommendations': {
    publisher: 'health-canada',
    label: 'Healthy eating recommendations',
    href: 'https://www.canada.ca/en/health-canada/services/food-guide/explore/healthy-eating-recommendations.html',
    hrefLang: 'en',
  },
  /* Ruling C18. EN and FR pages (modified 2023-02-16) opened 2026-10-06. */
  'hc-infant-botulism': {
    publisher: 'health-canada',
    label: 'Infant botulism',
    labelFr: 'Botulisme infantile',
    href: 'https://www.canada.ca/en/health-canada/services/food-safety-vulnerable-populations/infant-botulism.html',
    hrefFr:
      'https://www.canada.ca/fr/sante-canada/services/salubrite-aliments-pour-populations-vulnerables/botulisme-infantile.html',
    hrefLang: 'en',
  },
  /* Ruling C19. EN and FR pages (modified 2025-10-20) read 2026-10-06; re-open before publishing. */
  'phac-folic-acid': {
    publisher: 'phac',
    label: 'Folic acid, healthy pregnancy and neural tube defect prevention',
    labelFr: 'Acide folique, une grossesse saine et prévention des anomalies du tube neural',
    href: 'https://www.canada.ca/en/public-health/services/pregnancy/folic-acid.html',
    hrefFr: 'https://www.canada.ca/fr/sante-publique/services/grossesse/acide-folique.html',
    hrefLang: 'en',
  },
  'hc-pharmacare-bilateral-agreements': {
    publisher: 'health-canada',
    label: 'National pharmacare bilateral agreements',
    href: 'https://www.canada.ca/en/health-canada/corporate/transparency/health-agreements/national-pharmacare-bilateral-agreements.html',
    hrefLang: 'en',
  },
  'hc-diabetes-device-fund-2024': {
    publisher: 'health-canada',
    year: 2024,
    label:
      'Universal access to diabetes medications and Diabetes Device Fund for devices and supplies (February 2024)',
    href: 'https://www.canada.ca/en/health-canada/news/2024/02/universal-access-to-diabetes-medications-and-diabetes-device-fund-for-devices-and-supplies.html',
    hrefLang: 'en',
  },
  /* French page opened 2026-10-06: "C-64 (44-1) - LEGISinfo", "Loi concernant l’assurance médicaments". */
  'parl-bill-c64-pharmacare': {
    publisher: 'parliament',
    label: 'Bill C-64, Pharmacare Act (LEGISinfo)',
    labelFr: 'Projet de loi C-64, Loi concernant l’assurance médicaments (LEGISinfo)',
    href: 'https://www.parl.ca/legisinfo/en/bill/44-1/c-64',
    hrefFr: 'https://www.parl.ca/legisinfo/fr/projet-de-loi/44-1/c-64',
    hrefLang: 'en',
  },
  'cra-dtc-life-sustaining-therapy': {
    publisher: 'cra',
    label: 'Life-sustaining therapy',
    labelFr: 'Soins thérapeutiques essentiels : Critères d’admissibilité',
    href: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/life-sustaining-therapy.html',
    hrefFr:
      'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/segments/deductions-credits-impot-personnes-handicapees/credit-impot-personnes-handicapees/admissible-ciph/soins.html',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06 (releases E-27). EN and FR pages opened that day
   * (date modified 2025-11-28 on both); the French label is the page's own
   * title without the site name.
   */
  'cra-dtc-how-to-apply': {
    publisher: 'cra',
    label: 'How to apply - Disability tax credit form (DTC)',
    labelFr:
      'Comment faire une demande - Formulaire de crédit d’impôt pour personnes handicapées (CIPH)',
    href: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/how-apply-dtc.html',
    hrefFr:
      'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/segments/deductions-credits-impot-personnes-handicapees/credit-impot-personnes-handicapees/comment-demande-ciph.html',
    hrefLang: 'en',
  },
  'cra-rc4064-2025': {
    publisher: 'cra',
    year: 2025,
    label: 'Disability-Related Information 2025 (RC4064)',
    labelFr: 'Renseignements relatifs aux personnes handicapées 2025 (RC4064)',
    href: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4064/disability-related-information.html',
    hrefFr:
      'https://www.canada.ca/fr/agence-revenu/services/formulaires-publications/publications/rc4064/renseignements-relatifs-personnes-handicapees.html',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06 (releases E-14; replaces the proposed F-26, whose
   * address now returns 404). EN page (date modified 2026-01-20) and its own
   * French page ("Frais médicaux 2025") opened that day.
   */
  'cra-rc4065-2025': {
    publisher: 'cra',
    year: 2025,
    label: 'Medical Expenses 2025 (RC4065)',
    labelFr: 'Frais médicaux 2025 (RC4065)',
    href: 'https://www.canada.ca/en/revenue-agency/services/forms-publications/publications/rc4065/medical-expenses.html',
    hrefFr:
      'https://www.canada.ca/fr/agence-revenu/services/formulaires-publications/publications/rc4065/frais-medicaux.html',
    hrefLang: 'en',
  },
  /* French page (the page's own hreflang="fr" link) opened 2026-10-06. */
  'esdc-rdsp-apply': {
    publisher: 'esdc',
    label: 'Registered Disability Savings Plan: how to apply',
    labelFr:
      'Régime enregistré d’épargne-invalidité : qui peut ouvrir un régime et présenter une demande de subventions et de bons',
    href: 'https://www.canada.ca/en/employment-social-development/programs/disability/savings/apply.html',
    hrefFr:
      'https://www.canada.ca/fr/emploi-developpement-social/programmes/invalidite/epargne/demande.html',
    hrefLang: 'en',
  },
  'isc-nihb-updates': {
    publisher: 'isc',
    label: 'Non-Insured Health Benefits program updates',
    labelFr: 'Mises à jour du Programme des services de santé non assurés',
    href: 'https://www.sac-isc.gc.ca/eng/1578079214611/1578079236012',
    hrefFr: 'https://www.sac-isc.gc.ca/fra/1578079214611/1578079236012',
    hrefLang: 'en',
  },
  /*
   * Re-opened 2026-10-06 in both languages (date modified 2026-05-28); the
   * label is the page's printed title. This Might Be You card 6 links it for
   * who is eligible (owner answers B1 and B2, 2026-10-06).
   */
  'isc-nihb-eligibility': {
    publisher: 'isc',
    label:
      'Who is eligible for the Non-Insured Health Benefits (NIHB) program for First Nations and Inuit',
    labelFr:
      'Qui est admissible au Programme des services de santé non assurés (SSNA) pour les Premières Nations et les Inuit',
    href: 'https://www.sac-isc.gc.ca/eng/1574187596083/1576511384063',
    hrefFr: 'https://www.sac-isc.gc.ca/fra/1574187596083/1576511384063',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06 (releases E-15 and E-22). The client page on
   * pharmacy benefits, which describes and links the Drug Benefit List (owner
   * answer B2: link the official list, judge no eligibility). EN and FR pages
   * opened that day (date modified 2025-10-07).
   */
  'isc-nihb-pharmacy-benefits': {
    publisher: 'isc',
    label: 'Non-Insured Health Benefits program for First Nations and Inuit: Pharmacy benefits',
    labelFr:
      'Programme des services de santé non assurés pour les Premières Nations et les Inuit : Prestations pharmaceutiques',
    href: 'https://www.sac-isc.gc.ca/eng/1574784515492/1574784549876',
    hrefFr: 'https://www.sac-isc.gc.ca/fra/1574784515492/1574784549876',
    hrefLang: 'en',
  },
  /* Funding step, 2026-10-06: the NIHB client line (B22). EN and FR pages opened that day. */
  'isc-nihb-contact': {
    publisher: 'isc',
    label: 'Contact the Non-Insured Health Benefits program',
    labelFr: 'Communiquez avec le programme des Services de santé non assurés',
    href: 'https://www.sac-isc.gc.ca/eng/1579274812116/1579708265237',
    hrefFr: 'https://www.sac-isc.gc.ca/fra/1579274812116/1579708265237',
    hrefLang: 'en',
  },
  /*
   * Re-pointed 2026-10-06 (funding step, F-31, releases E-23) from the
   * Northwest Territories grid ("-5") to the base grid, which shows the same
   * rule (Alberta). Both the EN page (date modified 2026-03-19) and its own
   * French page opened that day. The French page's printed title has lost its
   * accents ("FOURNITURES POUR PERSONNES DIAB TIQUES…"); labelFr restores
   * them and nothing else.
   */
  'vac-cgm-type-1': {
    publisher: 'vac',
    label: 'Diabetic supplies: continuous glucose monitors (type 1 diabetes)',
    labelFr:
      'Fournitures pour personnes diabétiques : systèmes de surveillance de la glycémie en continu (diabète de type 1)',
    href: 'https://veterans.gc.ca/en/financial-programs-and-services/medical-costs/search-vac-treatment-benefits/diabetic-supplies-continuous-glucose-monitors-type-1-diabetes',
    hrefFr:
      'https://veterans.gc.ca/fr/programmes-et-services-financiers/frais-medicaux/rechercher-les-avantages-medicaux-dacc/fournitures-pour-personnes-diab-tiques-syst-mes-de-surveillance-de-la-glyc-mie-en-continu-diab-te-de',
    hrefLang: 'en',
  },
  /* Funding step, 2026-10-06 (F-27, releases E-18). EN and FR pages opened that day (modified 2024-04-19). */
  'vac-poc7-medical-supplies': {
    publisher: 'vac',
    label: 'Medical Supplies – General (POC 7)',
    labelFr: 'Fournitures médicales – Généralités (PDC nº 7)',
    href: 'https://www.veterans.gc.ca/en/about-vac/reports-policies-and-legislation/policies/medical-supplies-general-poc-7',
    hrefFr:
      'https://www.veterans.gc.ca/fr/propos-dacc/rapports-politiques-et-legislation/politiques/fournitures-medicales-generalites-pdc-no-7',
    hrefLang: 'en',
  },
  /* Funding step, 2026-10-06: the toll-free line (B22). English page opened that day (modified 2026-09-17). */
  'vac-contact': {
    publisher: 'vac',
    label: 'Contact us (Veterans Affairs Canada)',
    href: 'https://www.veterans.gc.ca/en/contact-us',
    hrefLang: 'en',
  },
  /* French page from the page's own language link, opened 2026-10-06. */
  'catsa-diabetic-supplies': {
    publisher: 'catsa',
    label: 'Diabetic supplies',
    labelFr: 'Fournitures pour diabétiques',
    href: 'https://www.catsa-acsta.gc.ca/en/what-can-bring/item/diabetic-supplies',
    hrefFr:
      'https://www.catsa-acsta.gc.ca/fr/que-puis-je-emporter/article/fournitures-pour-diabetiques',
    hrefLang: 'en',
  },
  /* Opened 2026-10-06 for Every Day Living's resources shelf, with its French page. */
  'chrc-human-rights-complaints': {
    publisher: 'chrc',
    label: 'Human rights complaints',
    labelFr: 'Plaintes en matière de droits de la personne',
    href: 'https://www.chrc-ccdp.gc.ca/our-work/human-rights-complaints',
    hrefFr:
      'https://www.ccdp-chrc.gc.ca/notre-travail/plaintes-en-matiere-de-droits-de-la-personne',
    hrefLang: 'en',
  },
  /*
   * Page title re-read 2026-10-06: "Diabetes equipment and supplies". Its own
   * hreflang="fr" page is titled "Pompes à insuline et fournitures nécessaires
   * au traitement du diabète". Since 2026-10-06 it is also the entry for the
   * old ADP insulin-pump address, which redirects here: `on-adp-insulin-pumps`
   * was merged into it everywhere it was cited (owner answer B31, "Keep most
   * up to date").
   */
  'on-diabetes-equipment-and-supplies': {
    publisher: 'gov-ontario',
    label: 'Diabetes equipment and supplies',
    labelFr: 'Pompes à insuline et fournitures nécessaires au traitement du diabète',
    href: 'https://www.ontario.ca/page/get-support-for-diabetes-equipment-and-supplies',
    hrefFr:
      'https://www.ontario.ca/fr/page/obtenez-une-aide-pour-lequipement-et-les-fournitures-pour-le-diabete',
    hrefLang: 'en',
  },
  /* French page (its own hreflang link, "Mis à jour : 18 août 2026") opened 2026-10-06. */
  'on-odb-coverage': {
    publisher: 'gov-ontario',
    label: 'Get coverage for prescription drugs',
    labelFr: 'Obtenez une prise en charge pour vos médicaments d’ordonnance',
    href: 'https://www.ontario.ca/page/get-coverage-prescription-drugs',
    hrefFr:
      'https://www.ontario.ca/fr/page/obtenez-une-prise-en-charge-pour-vos-medicaments-dordonnance',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06 (F-2 and F-3, release E-1). The notice prints
   * July 24, 2025 (its file name says 07-23). English only.
   */
  'on-eo-notice-cgm-2025': {
    publisher: 'gov-ontario',
    year: 2025,
    label:
      'Executive Officer Notice: Funding Continuous Glucose Monitoring Systems through the Ontario Drug Benefit Program (July 24, 2025)',
    href: 'https://www.ontario.ca/files/2025-07/moh-executive-officer-notice-en-2025-07-23.pdf',
    hrefLang: 'en',
  },
  'on-odb-formulary-ed43-summary': {
    publisher: 'gov-ontario',
    label:
      'Ontario Drug Benefit Formulary/Comparative Drug Index Edition 43: Summary of Changes, November 2025',
    href: 'https://www.ontario.ca/files/2026-01/moh-ontario-drug-benefit-odb-formulary-edition-43-summary-en-2025-11-20.pdf',
    hrefLang: 'en',
  },
  /* French page (its own hreflang link, "Mis à jour : 08 juin 2026") opened 2026-10-06. */
  'on-preventing-and-living-with-diabetes': {
    publisher: 'gov-ontario',
    label: 'Preventing and living with diabetes',
    labelFr: 'Prévenir le diabète ou vivre avec cette maladie',
    href: 'https://www.ontario.ca/page/preventing-and-living-diabetes',
    hrefFr: 'https://www.ontario.ca/fr/page/prevenir-le-diabete-ou-vivre-avec-cette-maladie',
    hrefLang: 'en',
  },
  'on-ohip-lab-schedule-2026': {
    publisher: 'gov-ontario',
    year: 2026,
    label: 'Schedule of Benefits for Laboratory Services (effective April 1, 2026)',
    href: 'https://www.ontario.ca/files/2026-04/moh-ohip-schedule-of-benefits-laboratory-services-2026-04-01.pdf',
    hrefLang: 'en',
  },
  'on-form-014-4521-84': {
    publisher: 'gov-ontario',
    label:
      'Application for Prior Approval for Full Payment of Insured OOC & OOP Laboratory & Genetics Testing (014-4521-84)',
    href: 'https://forms.mgcs.gov.on.ca/dataset/014-4521-84',
    hrefLang: 'en',
  },
  'on-health-genetics-clinics': {
    publisher: 'ontario-health',
    label: 'Genetics clinic directory (Ontario Health)',
    href: 'https://www.ontariohealth.ca/clinical/genetics/clinic-directory',
    hrefLang: 'en',
  },
  'bc-national-pharmacare': {
    publisher: 'gov-bc',
    label: 'National pharmacare (BC PharmaCare)',
    href: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/national-pharmacare',
    hrefLang: 'en',
  },
  'bc-diabetes-pins': {
    publisher: 'gov-bc',
    label: 'Diabetes product identification numbers (PINs)',
    href: 'https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/pharmacare/device-providers/diabetes-product-identification-numbers-pins',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06: BC's own pages for patients, opened that day
   * (no French versions). The pump page was last updated July 15, 2026, the
   * Special Authority page December 18, 2025, the contact page August 26,
   * 2026; the news release is of March 30, 2026 (release E-9).
   */
  'bc-insulin-pumps': {
    publisher: 'gov-bc',
    label: 'Insulin pumps and insulin pump supplies (BC PharmaCare)',
    href: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/what-we-cover/diabetes-supplies/insulin-pumps-insulin-pump-supplies',
    hrefLang: 'en',
  },
  'bc-sa-insulin-pumps': {
    publisher: 'gov-bc',
    label: 'SA for Insulin Pumps (BC PharmaCare)',
    href: 'https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/pharmacare/programs/special-authority/limited-coverage-drugs-and-medical-supplies-insulin-pumps',
    hrefLang: 'en',
  },
  'bc-pharmacare-contact': {
    publisher: 'gov-bc',
    label: 'Contact BC PharmaCare',
    href: 'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/contact-us',
    hrefLang: 'en',
  },
  'bc-news-diabetes-coverage-2026': {
    publisher: 'gov-bc',
    year: 2026,
    label:
      'Enhanced coverage in B.C. supports more people with diabetes (BC Gov News, March 30, 2026)',
    href: 'https://news.gov.bc.ca/releases/2026HLTH0030-000334',
    hrefLang: 'en',
  },
  'bc-guidelines-iron-overload': {
    publisher: 'gov-bc',
    label: 'High Ferritin and Iron Overload (BC Guidelines)',
    href: 'https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/bc-guidelines/iron-overload',
    hrefLang: 'en',
  },
  'phsa-out-of-province-test-requests': {
    publisher: 'phsa',
    label: 'Out-of-Province & Out-of-Country Laboratory or Genetic Test Funding Request',
    href: 'https://www.phsa.ca/plms/forms-test-information/out-of-province-out-of-country-test-request-forms',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06: Alberta's pages, opened that day. The program
   * page and Non-Group Coverage show no date; the eligibility PDF is of
   * August 2023, the sensor fact sheet of December 16, 2025 (it replaces the
   * proposed F-11, Benefact 1225), and Alberta Blue Cross's guide for
   * pharmacies carries the October 1, 2026 payer-of-last-resort rule (F-10).
   * Alberta publishes none of them in French.
   */
  'ab-specialized-drug-benefits': {
    publisher: 'gov-alberta',
    label: 'Specialized drug benefits (Alberta)',
    href: 'https://www.alberta.ca/specialized-drug-benefits',
    hrefLang: 'en',
  },
  'ab-iptp-eligibility-2023': {
    publisher: 'gov-alberta',
    year: 2023,
    label: 'Insulin Pump Therapy Program Eligibility Criteria (Alberta, August 2023)',
    href: 'https://www.alberta.ca/system/files/custom_downloaded_images/health-insulin-pump-therapy-program-eligibility.pdf',
    hrefLang: 'en',
  },
  'ab-non-group-coverage': {
    publisher: 'gov-alberta',
    label: 'Non-Group Coverage (Alberta)',
    href: 'https://www.alberta.ca/non-group-coverage',
    hrefLang: 'en',
  },
  'ab-cgm-fact-sheet-2025': {
    publisher: 'gov-alberta',
    year: 2025,
    label: 'Continuous glucose monitor (CGM) coverage for Albertans (December 16, 2025)',
    href: 'https://www.alberta.ca/system/files/hlth-continuous-glucose-monitor-coverage-for-albertans-fact-sheet.pdf',
    hrefLang: 'en',
  },
  'abc-pharmacy-reference-guide': {
    publisher: 'alberta-blue-cross',
    label: 'Reference Guide for Alberta Pharmacies (Alberta Blue Cross)',
    href: 'https://www.ab.bluecross.ca/pdfs/82477-ab-pharmacy-reference-guide.pdf',
    hrefLang: 'en',
  },
  'sk-insulin-pump-program': {
    publisher: 'gov-sk',
    label: 'Insulin Pump Program (Saskatchewan)',
    href: 'https://www.saskatchewan.ca/residents/health/accessing-health-care-services/insulin-pump-program',
    hrefLang: 'en',
  },
  /* Funding step, 2026-10-06: EN page and its own French page (saskatchewan.ca/bonjour) opened that day. */
  'sk-drug-cost-assistance': {
    publisher: 'gov-sk',
    label: 'Drug Cost Assistance (Saskatchewan Extended Benefits and Drug Plan)',
    labelFr: 'Aide à l’achat de médicaments',
    href: 'https://www.saskatchewan.ca/residents/health/prescription-drug-plans-and-health-coverage/extended-benefits-and-drug-plan/drug-cost-assistance',
    hrefFr:
      'https://www.saskatchewan.ca/bonjour/health-and-healthy-living/prescription-drug-plans-and-health-coverage/extended-benefits-and-drug-plan/drug-cost-assistance',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06: Manitoba's own pages, opened that day in both
   * languages where Manitoba has a French one. The Health Coverage page holds
   * the adult pump program (MAIPCP, its section `#ancillary-ten`, where
   * maipcp.html now sends you); the FAQ on pump supplies (updated April 1,
   * 2025) names the children's program.
   */
  'mb-pharmacare': {
    publisher: 'gov-manitoba',
    label: 'Pharmacare Program (Manitoba)',
    labelFr: 'Le Régime d’assurance-médicaments',
    href: 'https://www.gov.mb.ca/health/pharmacare/index.html',
    hrefFr: 'https://www.gov.mb.ca/health/pharmacare/index.fr.html',
    hrefLang: 'en',
  },
  'mb-pharmacare-mepp': {
    publisher: 'gov-manitoba',
    label: 'Manitoba Enhanced Pharmacare Program (MEPP)',
    href: 'https://www.gov.mb.ca/health/pharmacare/mepp.html',
    hrefLang: 'en',
  },
  'mb-health-coverage': {
    publisher: 'gov-manitoba',
    label: 'Health Coverage: Manitoba Adult Insulin Pump Coverage Program',
    labelFr: 'La couverture de l’assurance-maladie',
    href: 'https://www.gov.mb.ca/health/mhsip/healthcoverage.html#ancillary-ten',
    hrefFr: 'https://www.gov.mb.ca/health/mhsip/healthcoverage.fr.html',
    hrefLang: 'en',
  },
  'mb-faq-ips': {
    publisher: 'gov-manitoba',
    label: 'FAQ: Insulin Pump Supplies (Manitoba Pharmacare)',
    href: 'https://www.gov.mb.ca/health/pharmacare/profdocs/faq_ips.pdf',
    hrefLang: 'en',
  },
  'mb-shared-health-diabetes-care': {
    publisher: 'shared-health-mb',
    label: 'Diabetes care (Shared Health Manitoba)',
    href: 'https://sharedhealthmb.ca/patient-care/diabetes-care/',
    hrefLang: 'en',
  },
  'sbgh-anti-gad65': {
    publisher: 'st-boniface',
    label: 'Anti-GAD65 (St. Boniface Hospital laboratory manual)',
    href: 'https://apps.sbgh.mb.ca/labmanual/test/view?seedId=3162',
    hrefLang: 'en',
  },
  /*
   * The /en/ address serves English (re-read 2026-10-06); its own French page,
   * "Programme d'accès aux pompes à insuline", opened that day. Both still
   * show February 19, 2021.
   */
  'qc-insulin-pump-access-program': {
    publisher: 'gov-quebec',
    label: 'Insulin Pump Access Program (Québec)',
    labelFr: 'Programme d’accès aux pompes à insuline',
    href: 'https://www.quebec.ca/en/health/health-issues/a-z/diabetes/insulin-pump-access-program',
    hrefFr:
      'https://www.quebec.ca/sante/problemes-de-sante/a-z/diabete/programme-d-acces-aux-pompes-a-insuline',
    hrefLang: 'en',
  },
  /* Funding step, 2026-10-06 (F-6): EN and FR pages opened that day (last update February 12, 2021). */
  'qc-stays-outside-quebec': {
    publisher: 'gov-quebec',
    label: 'Stays Outside Québec',
    labelFr: 'Séjours hors du Québec',
    href: 'https://www.quebec.ca/en/health/health-system-and-services/stays-outside-quebec',
    hrefFr: 'https://www.quebec.ca/sante/systeme-et-services-de-sante/sejours-hors-du-quebec',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06 (releases E-8 in corrected form; replaces the
   * proposed F-30, a patient organization's page). INESSS, Québec's
   * government institute for health technology assessment, records each
   * minister's decision on the RAMQ list; RAMQ's own pages refuse requests.
   * EN and FR pages opened that day; the titles are the products' French
   * names on both. The notice (a French PDF of December 2025) holds the
   * criteria that, since February 4, 2026, apply to every continuous glucose
   * monitor on the list.
   */
  'inesss-libre-3-plus-2026': {
    publisher: 'inesss',
    year: 2026,
    label: 'FreeStyle Libre 3 Plus (surveillance de la glycémie): extract notice to the Minister',
    labelFr: 'FreeStyle Libre 3 Plus (surveillance de la glycémie) : extrait d’avis au ministre',
    href: 'https://www.inesss.qc.ca/en/themes/medicaments/drug-products-undergoing-evaluation-and-evaluated/extract-notice-to-the-minister/freestyle-libre-3-plus-surveillance-de-la-glycemie-7938.html',
    hrefFr:
      'https://www.inesss.qc.ca/thematiques/medicaments/medicaments-evaluation-aux-fins-dinscription/extrait-davis-au-ministre/freestyle-libre-3-plus-surveillance-de-la-glycemie-7938.html',
    hrefLang: 'en',
  },
  'inesss-dexcom-g6-g7-2026': {
    publisher: 'inesss',
    year: 2026,
    label: 'Dexcom G6 et Dexcom G7 (surveillance glycémie): extract notice to the Minister',
    labelFr: 'Dexcom G6 et Dexcom G7 (surveillance glycémie) : extrait d’avis au ministre',
    href: 'https://www.inesss.qc.ca/en/themes/medicaments/drug-products-undergoing-evaluation-and-evaluated/extract-notice-to-the-minister/dexcom-g6-et-dexcom-g7-surveillance-glycemie-7935.html',
    hrefFr:
      'https://www.inesss.qc.ca/thematiques/medicaments/medicaments-evaluation-aux-fins-dinscription/extrait-davis-au-ministre/dexcom-g6-et-dexcom-g7-surveillance-glycemie-7935.html',
    hrefLang: 'en',
  },
  'inesss-libre-3-plus-notice-2025-12': {
    publisher: 'inesss',
    year: 2025,
    label: 'Extrait d’avis au ministre sur Freestyle Libre 3 Plus (INESSS, décembre 2025)',
    href: 'https://www.inesss.qc.ca/fileadmin/doc/INESSS/Inscription_medicaments/Avis_au_ministre/Janvier_2026/Avis_20251215/Chg_admin_FreeStyle_libre_3_Plus_EA_2025-12.pdf',
    hrefLang: 'fr',
  },
  /* The /en/ address serves this page in French, under its French title. */
  'chusj-genetic-tests-not-available': {
    publisher: 'chu-sainte-justine',
    label: 'Tests génétiques non disponibles au Québec',
    href: 'https://www.chusj.org/en/soins-services/G/Genetique-medicale/Tests-genetiques-non-disponibles-au-Quebec',
    hrefLang: 'fr',
  },
  /* French page (its own language link; modified 2026-05-07) opened 2026-10-06. */
  'nb-insulin-pump-program': {
    publisher: 'gov-nb',
    label: 'The New Brunswick Insulin Pump Program (IPP)',
    labelFr: 'Le Programme de pompes à insuline (PPI) du Nouveau-Brunswick',
    href: 'https://www2.gnb.ca/content/gnb/en/departments/health/patientinformation/PrimaryHealthCare/A-Comprehensive-Diabetes-Strategy-for-New-Brunswickers/TheNewBrunswickInsulinPumpProgram-IPP.html',
    hrefFr:
      'https://www2.gnb.ca/content/gnb/fr/ministeres/sante/patients/SoinsDeSantePrimaires/Strategie-globale-sur-le-diabete-pour-les-Neo-Brunswickois-et-Neo-Brunswickoises/Programme-pompes-insuline-PPI-Nouveau-Brunswick.html',
    hrefLang: 'en',
  },
  /* Funding step, 2026-10-06: EN page and its own French page opened that day. */
  'nb-drug-plans': {
    publisher: 'gov-nb',
    label: 'New Brunswick Drug Plans',
    labelFr: 'Régimes de médicaments du Nouveau-Brunswick',
    href: 'https://www.gnb.ca/en/topic/health-wellness/nb-drug-plans.html',
    hrefFr: 'https://www.gnb.ca/fr/sujet/sante-mieux-etre/regimes-medicaments-nb.html',
    hrefLang: 'en',
  },
  'ns-insulin-pump-program': {
    publisher: 'gov-ns',
    label: 'Apply for funding for an insulin pump and supplies (Nova Scotia Insulin Pump Program)',
    href: 'https://www.novascotia.ca/apply-funding-insulin-pump-and-supplies-insulin-pump-program',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06: Nova Scotia's pages, opened that day (English
   * only). The sensor program's page (modified 2026-04-29) is where the
   * address proposed as F-16 (`register-…`) now leads; it releases E-13.
   */
  'ns-sbgm-program': {
    publisher: 'gov-ns',
    label: 'Apply for the Sensor-based Glucose Monitoring Program (Nova Scotia)',
    href: 'https://www.novascotia.ca/apply-sensor-based-glucose-monitoring-program',
    hrefLang: 'en',
  },
  'ns-pharmacare': {
    publisher: 'gov-ns',
    label: 'Nova Scotia Pharmacare',
    href: 'https://novascotia.ca/dhw/pharmacare/',
    hrefLang: 'en',
  },
  'ns-health-contacts': {
    publisher: 'gov-ns',
    label: 'Department of Health and Wellness: contacts (Nova Scotia)',
    href: 'https://www.novascotia.ca/contact/health-and-wellness',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06: PEI's own PDFs, opened that day. The program's
   * web page (princeedwardisland.ca) answers with a CAPTCHA, which nothing
   * here tries to get past, so the program's questions and answers (PDF dated
   * 2026-05-06; F-18) are cited instead. Health PEI's residents' Q&A on
   * national pharmacare is dated May 2025 (it replaces the proposed F-19,
   * written for providers). No French versions were read.
   */
  'pe-ipp-qa': {
    publisher: 'gov-pei',
    label: 'Insulin Pump Program Questions and Answers (Prince Edward Island)',
    href: 'https://www.princeedwardisland.ca/sites/default/files/publications/insulin_pump_program_questions_and_answers.pdf',
    hrefLang: 'en',
  },
  'healthpei-national-pharmacare-qa': {
    publisher: 'health-pei',
    label: 'National Pharmacare in PEI: Questions and Answers for PEI Residents (May 2025)',
    href: 'https://src.healthpei.ca/sites/src.healthpei.ca/files/PEI%20Pharmacare/National%20Pharmacare/National%20Pharmacare%20Q&A%20Residents.pdf',
    hrefLang: 'en',
  },
  'nl-cgm-program-2025': {
    publisher: 'gov-nl',
    year: 2025,
    label: 'Provincial Continuous Glucose Monitoring Program (Newfoundland and Labrador, 2025)',
    href: 'https://www.gov.nl.ca/releases/2025/health/0522n01/',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06: gov.nl.ca pages, opened that day. The 2021
   * release is the newest official page on the pump program (its program
   * pages now lead to NL Health Services' home page). The drug program's own
   * French page is "Programme de médicaments sur ordonnance (NLPDP)". The
   * claiming policies are section 10 of the program's provider guide,
   * updated August 20, 2025 (F-21, releases E-11).
   */
  'nl-insulin-pump-program-2021': {
    publisher: 'gov-nl',
    year: 2021,
    label:
      'Access to Provincial Insulin Pump Program Expanded (Newfoundland and Labrador, January 15, 2021)',
    href: 'https://www.gov.nl.ca/releases/2021/health/0115n01/',
    hrefLang: 'en',
  },
  'nl-prescription-drug-program': {
    publisher: 'gov-nl',
    label: 'Prescription Drug Program (NLPDP)',
    labelFr: 'Programme de médicaments sur ordonnance (NLPDP)',
    href: 'https://www.gov.nl.ca/hcs/prescription/',
    hrefFr: 'https://www.gov.nl.ca/hcs/prescription/index-fr/',
    hrefLang: 'en',
  },
  'nl-program-claiming-policies': {
    publisher: 'gov-nl',
    label: 'NLPDP Program Claiming Policies (updated August 20, 2025)',
    href: 'https://www.gov.nl.ca/hcs/files/Program-Claiming-Policies-1.pdf',
    hrefLang: 'en',
  },
  /*
   * Funding step, 2026-10-06: yukon.ca, read in a browser that day (a plain
   * request gets a bot check, which nothing here tries to get past). The
   * National Pharmacare page is modified 2026-09-28, the chronic disease
   * page 2026-05-29; their own French pages were read too.
   */
  'yt-national-pharmacare': {
    publisher: 'gov-yukon',
    label: 'Learn about the Yukon National Pharmacare Program',
    labelFr: 'Régime d’assurance-médicaments national du Yukon',
    href: 'https://yukon.ca/en/health-and-wellness/care-services/learn-about-yukon-national-pharmacare-program',
    hrefFr: 'https://yukon.ca/fr/regime-assurance-medicaments-national',
    hrefLang: 'en',
  },
  'yt-chronic-disease-benefits': {
    publisher: 'gov-yukon',
    label: 'Get help with costs if you have a chronic disease or disability (Yukon)',
    labelFr: 'Aides aux frais associés à une maladie chronique ou une incapacité',
    href: 'https://yukon.ca/en/health-and-wellness/care-services/get-help-costs-if-you-have-chronic-disease-or-disability',
    hrefFr:
      'https://yukon.ca/fr/sante-et-mieux-etre/services-de-soins/aides-aux-frais-associes-une-maladie-chronique-ou-une',
    hrefLang: 'en',
  },
  'nt-extended-health-benefits': {
    publisher: 'gov-nwt',
    label: 'GNWT finalizes new Extended Health Benefits policy',
    href: 'https://www.gov.nt.ca/en/newsroom/gnwt-finalizes-new-extended-health-benefits-policy',
    hrefLang: 'en',
  },
  /* Funding step, 2026-10-06 (F-28): the program's own page and its French page, opened that day (no date shown). */
  'nt-ehb-services': {
    publisher: 'gov-nwt',
    label: 'Extended Health Benefits (Northwest Territories Health and Social Services)',
    labelFr: 'Régime d’assurance-maladie complémentaire',
    href: 'https://www.hss.gov.nt.ca/en/services/extended-health-benefits',
    hrefFr:
      'https://www.hss.gov.nt.ca/fr/services/r%C3%A9gime-d%E2%80%99assurance-maladie-compl%C3%A9mentaire',
    hrefLang: 'en',
  },

  /* ---------- International: only where the Canadian sources are silent ---------- */
  'ispad-2022-ch4-monogenic': {
    publisher: 'pediatric-diabetes',
    label:
      'ISPAD Clinical Practice Consensus Guidelines 2022: The diagnosis and management of monogenic diabetes in children and adolescents',
    href: 'https://doi.org/10.1111/pedi.13426',
    hrefLang: 'en',
  },
  'ispad-2022-cfrd': {
    publisher: 'ispad',
    label:
      'ISPAD Clinical Practice Consensus Guidelines 2022: Management of cystic fibrosis-related diabetes in children and adolescents',
    href: 'https://www.ispad.org/asset/624EDB64-CD95-4F5D-920BE6AF1EEFDE57/',
    hrefLang: 'en',
  },
  /*
   * A secondary summary, of the whole 2026 Standards rather than Section 2
   * alone; the Section 2 recommendations cited are on it. The ADA's own pages
   * would not load. The id keeps its old name so no citation has to move.
   */
  'ada-soc-2026-s2-summary': {
    publisher: 'ada',
    label: '2026 ADA Diabetes Standards of Medical Care Clinical Guideline Summary',
    href: 'https://www.guidelinecentral.com/guideline/14119/',
    hrefLang: 'en',
  },
  'buzzetti-lada-consensus-2020': {
    publisher: 'diabetes-journal',
    year: 2020,
    label:
      'Management of Latent Autoimmune Diabetes in Adults: A Consensus Statement From an International Expert Panel',
    href: 'https://doi.org/10.2337/dbi20-0017',
    hrefLang: 'en',
  },
  'holt-t1d-adults-consensus-2021': {
    publisher: 'diabetologia',
    year: 2021,
    label: 'The management of type 1 diabetes in adults (ADA/EASD consensus report, 2021)',
    href: 'https://doi.org/10.1007/s00125-021-05568-3',
    hrefLang: 'en',
  },
  'phillip-pre-stage-3-monitoring-2024': {
    publisher: 'diabetologia',
    year: 2024,
    label:
      'Consensus guidance for monitoring individuals with islet autoantibody-positive pre-stage 3 type 1 diabetes',
    href: 'https://doi.org/10.1007/s00125-024-06205-5',
    hrefLang: 'en',
  },
  'murphy-monogenic-precision-diagnostics-2023': {
    publisher: 'communications-medicine',
    year: 2023,
    label:
      'The use of precision diagnostics for monogenic diabetes: a systematic review and expert opinion',
    href: 'https://doi.org/10.1038/s43856-023-00369-8',
    hrefLang: 'en',
  },
  'naylor-monogenic-precision-treatment-2024': {
    publisher: 'communications-medicine',
    year: 2024,
    label: 'Precision treatment of beta-cell monogenic diabetes: a systematic review',
    href: 'https://doi.org/10.1038/s43856-024-00556-1',
    hrefLang: 'en',
  },
  'brown-lipodystrophy-guideline-2016': {
    publisher: 'jcem',
    year: 2016,
    label:
      'The Diagnosis and Management of Lipodystrophy Syndromes: A Multi-Society Practice Guideline',
    href: 'https://doi.org/10.1210/jc.2016-2466',
    hrefLang: 'en',
  },
  'sharif-ptdm-consensus-2014': {
    publisher: 'am-j-transplantation',
    year: 2014,
    label: 'Sharif et al., American Journal of Transplantation 2014 (post-transplant diabetes)',
    href: 'https://doi.org/10.1111/ajt.12850',
    hrefLang: 'en',
  },
  'sharif-ptdm-consensus-2024': {
    publisher: 'ndt',
    year: 2024,
    label: 'International consensus on post-transplantation diabetes mellitus',
    href: 'https://doi.org/10.1093/ndt/gfad258',
    hrefLang: 'en',
  },
  'niddk-monogenic': {
    publisher: 'niddk',
    label: 'Monogenic Diabetes (MODY & Neonatal Diabetes Mellitus)',
    href: 'https://www.niddk.nih.gov/health-information/diabetes/overview/what-is-diabetes/monogenic-neonatal-mellitus-mody',
    hrefLang: 'en',
  },
  'diabetes-uk-lada': {
    publisher: 'diabetes-uk',
    label: 'Latent Autoimmune Diabetes in Adults (LADA)',
    href: 'https://www.diabetes.org.uk/about-diabetes/other-types-of-diabetes/latent-autoimmune-diabetes',
    hrefLang: 'en',
  },
  'diabetes-uk-mody': {
    publisher: 'diabetes-uk',
    label: 'Maturity onset diabetes of the young (MODY)',
    href: 'https://www.diabetes.org.uk/about-diabetes/other-types-of-diabetes/mody',
    hrefLang: 'en',
  },
  'exeter-c-peptide-antibody-tests': {
    publisher: 'exeter',
    label: 'C-peptide and islet autoantibody testing',
    href: `${EXETER}/nongenetictests/`,
    hrefLang: 'en',
  },
  'exeter-what-is-mody': {
    publisher: 'exeter',
    label: 'What is MODY?',
    href: `${EXETER}/what-is-mody/`,
    hrefLang: 'en',
  },
  'exeter-mody-testing-guidelines': {
    publisher: 'exeter',
    label: 'Guidelines for Genetic Testing in MODY',
    href: `${EXETER}/tests-for-diabetes-subtypes/guidelines-for-genetic-testing-in-mody/`,
    hrefLang: 'en',
  },
  'exeter-gck-pregnancy-2018': {
    publisher: 'exeter',
    year: 2018,
    label: 'GCK Guidelines in Pregnancy',
    href: `${EXETER}/gck-guidelines-in-pregnancy/`,
    hrefLang: 'en',
  },
  'exeter-hnf1b-mody': {
    publisher: 'exeter',
    label: 'HNF1B MODY',
    href: `${EXETER}/what-is-mody/hnf1b-mody/`,
    hrefLang: 'en',
  },
  'exeter-about-neonatal-diabetes': {
    publisher: 'exeter',
    label: 'About Neonatal Diabetes',
    href: `${EXETER}/about-neonatal-diabetes/`,
    hrefLang: 'en',
  },
  'exeter-neonatal-kcnj11-abcc8': {
    publisher: 'exeter',
    label: 'Neonatal diabetes caused by mutations in KCNJ11 or ABCC8',
    href: `${EXETER}/about-neonatal-diabetes/neonatal-diabetes-caused-by-mutations-in-kcnj11-or-abcc8/`,
    hrefLang: 'en',
  },
  'exeter-sulfonylurea-treatment': {
    publisher: 'exeter',
    label: 'Treatment of KCNJ11 and ABCC8 permanent neonatal diabetes with sulphonylureas',
    href: `${EXETER}/about-neonatal-diabetes/treatment-of-kcnj11-and-abcc8-permanent-neonatal-diabetes-with-sulphonylureas/`,
    hrefLang: 'en',
  },
  'exeter-sulfonylurea-transfer': {
    publisher: 'exeter',
    label: 'SU transfer in patients with KCNJ11 and ABCC8 mutations (PNDM)',
    href: `${EXETER}/about-neonatal-diabetes/su-transfer-in-patients-with-kcnj11-and-abcc8-mutations-pndm/`,
    hrefLang: 'en',
  },
  'exeter-midd': {
    publisher: 'exeter',
    label: 'Maternally Inherited Diabetes and Deafness (MIDD)',
    href: `${EXETER}/what-is-mody/maternally-inherited-diabetes-deafness-midd/`,
    hrefLang: 'en',
  },
  'medlineplus-wolfram-syndrome': {
    publisher: 'medlineplus',
    label: 'Wolfram syndrome',
    href: 'https://medlineplus.gov/genetics/condition/wolfram-syndrome/',
    hrefLang: 'en',
  },
  'pancreapedia-type-3c-2015': {
    publisher: 'pancreapedia',
    year: 2015,
    label: 'Pancreatogenic (type 3c) diabetes',
    href: 'https://pancreapedia.org/reviews/pancreatogenic-type-3c-diabetes',
    hrefLang: 'en',
  },

  /* ---------- Industry: never the only source for a claim ---------- */
  'fit-canada-pocket-guide-4th-ed': {
    publisher: 'fit-canada',
    label: 'Recommendations for Best Practice in Injection Technique, 4th ed. (pocket guide)',
    href: 'https://fit4diabetes.com/wp-content/uploads/2025/08/EMB-25-442-FIT-Pocket-Guide-Update-Layout_E01.pdf',
    hrefLang: 'en',
  },
  'sanofi-tzield-approval-2025': {
    publisher: 'sanofi',
    year: 2025,
    label:
      'Health Canada has granted approval for Tzield®, the first and only disease-modifying therapy in autoimmune type 1 diabetes in Canada',
    href: 'https://sanoficanada.mediaroom.com/2025-05-05-Health-Canada-has-granted-approval-for-Tzield-R-,-the-first-and-only-disease-modifying-therapy-in-autoimmune-type-1-diabetes-in-Canada',
    hrefLang: 'en',
  },
  'sanofi-uncovert1d-screening': {
    publisher: 'sanofi',
    display: 'reviewOnly',
    label: 'UncoverT1D Early Detection Program: Screening',
    href: 'https://www.uncovert1d.ca/en-ca/hcp/Screening',
    hrefLang: 'en',
  },
  'chiesi-myalepta-approval-2024': {
    publisher: 'chiesi',
    year: 2024,
    label: 'Health Canada approval of MYALEPTA',
    href: 'https://chiesirarediseases.com/media/health-canada-approval-of-myalepta',
    hrefLang: 'en',
  },
  'dexcom-canada': {
    publisher: 'dexcom',
    label: 'Dexcom Canada',
    href: 'https://www.dexcom.com/en-ca',
    hrefLang: 'en',
  },
  'dexcom-technical-support': {
    publisher: 'dexcom',
    label: 'Technical product support (Dexcom Canada)',
    href: 'https://www.dexcom.com/en-ca/care/technical-product-support',
    hrefLang: 'en',
  },
  'dexcom-pumps-and-pens': {
    publisher: 'dexcom',
    label: 'Pumps and pens (Dexcom Canada)',
    href: 'https://www.dexcom.com/en-ca/partnerships/pumps-and-pens',
    hrefLang: 'en',
  },
  'dexcom-g7-wear-time': {
    publisher: 'dexcom',
    label: 'How long can I wear the sensor? (Dexcom G7)',
    href: 'https://www.dexcom.com/en-ca/faqs/g7/how-long-can-i-wear-the-sensor',
    hrefLang: 'en',
  },
  'abbott-freestyle-canada': {
    publisher: 'abbott',
    label: 'FreeStyle Libre Canada',
    href: 'https://www.freestyle.abbott/ca-en/home.html',
    hrefLang: 'en',
  },
  'abbott-freestyle-libre-3': {
    publisher: 'abbott',
    label: 'FreeStyle Libre 3',
    href: 'https://www.freestyle.abbott/en-ca/products/freestyle-libre-3.html',
    hrefLang: 'en',
  },
  'abbott-freestyle-contact': {
    publisher: 'abbott',
    label: 'Contact us (FreeStyle Libre Canada)',
    href: 'https://www.freestyle.abbott/en-ca/support/contact-us.html',
    hrefLang: 'en',
  },
  'abbott-libre-3-plus-launch-2025': {
    publisher: 'abbott',
    year: 2025,
    label:
      "Abbott's latest-generation FreeStyle Libre 3 Plus glucose sensor technology launches in Canada",
    href: 'https://www.ca.abbott/en/media-center/press-releases/abbotts-latest-generation-freestyle-libre-3-plus-glucose-sensor-technology-launches-in-canada.html',
    hrefLang: 'en',
  },
  'minimed-canada': {
    publisher: 'minimed',
    label: 'MiniMed Canada',
    href: 'https://www.minimed.com/en-ca',
    hrefLang: 'en',
  },
  'minimed-cgm-coverage': {
    publisher: 'minimed',
    label: 'CGM coverage (MiniMed Canada)',
    href: 'https://www.minimed.com/en-ca/support/cgm-coverage',
    hrefLang: 'en',
  },
  'minimed-simplera-licence-2026': {
    publisher: 'minimed',
    year: 2026,
    label:
      'MiniMed announces Health Canada license for Simplera Sync sensor, type 2 diabetes indication with MiniMed 780G system',
    href: 'https://www.biospace.com/press-releases/minimed-announces-health-canada-license-for-simplera-sync-sensor-type-2-diabetes-indication-with-minimed-780g-system',
    hrefLang: 'en',
  },
  'tandem-canada': {
    publisher: 'tandem',
    label: 'Tandem Diabetes Care Canada',
    href: 'https://www.tandemdiabetes.com/en-ca',
    hrefLang: 'en',
  },
  'tandem-support': {
    publisher: 'tandem',
    label: 'Support (Tandem Diabetes Care Canada)',
    href: 'https://www.tandemdiabetes.com/en-ca/support',
    hrefLang: 'en',
  },
  /*
   * Ruling C42. Tandem's Canadian user guide (mmol/L, Control-IQ+ 7.10): EN
   * AW-1018762_B of 2026-03-05 and FR AW-1019341_A of 2026-05-20, both read
   * 2026-10-06. Re-check the version on the recheck schedule.
   */
  'tandem-tslim-x2-ciq-user-guide-ca': {
    publisher: 'tandem',
    label: 't:slim X2 Insulin Pump with Control-IQ+ Technology User Guide',
    labelFr: "Guide d'utilisation de la pompe à insuline t:slim X2 avec la technologie Control-IQ+",
    href: 'https://assets.ctfassets.net/k5s5iz8jouwn/62DA4Ubm8YCZCSWsuOcEie/8ff0929fea993853877f07ccad76b9f3/technical-user-guide-tslimX2-ciq-_7-10-2-mmoll-en-_ca-aw1018762.pdf',
    hrefFr:
      'https://assets.ctfassets.net/k5s5iz8jouwn/58gwRACnIUayCM6wZNQFnq/699887f25cbef1b68e9a7782d599dc0a/technical-user-guide-tslimX2-ciq-7-10-2-mmoll-fr-ca-aw1019341.pdf',
    hrefLang: 'en',
  },
  'omnipod-canada': {
    publisher: 'insulet',
    label: 'Omnipod Canada',
    href: 'https://www.omnipod.com/en-ca',
    hrefLang: 'en',
  },
  'omnipod-contact': {
    publisher: 'insulet',
    label: 'Contact us (Omnipod Canada)',
    href: 'https://www.omnipod.com/en-ca/contact-us',
    hrefLang: 'en',
  },
  'omnipod-5-access-and-reimbursement': {
    publisher: 'insulet',
    label: 'Omnipod 5 FAQs: access and reimbursement',
    href: 'https://www.omnipod.com/en-ca/what-is-omnipod/omnipod-5/faqs/access-and-reimbursement',
    hrefLang: 'en',
  },
  'ypsomed-mylife-loop': {
    publisher: 'ypsomed',
    label: 'mylife Loop',
    href: 'https://www.mylife-diabetescare.com/en-CA/mylife-loop.html',
    hrefLang: 'en',
  },
  /*
   * Read 2026-10-08 for the landing's brand row (owner note 10): the
   * YpsoPump's maker in Canada is mylife Diabetes Care Canada Inc., and the
   * mylife and YpsoPump trademarks are mylife Diabetes Care AG's. Backs the
   * pill's name only (landing-meta.ts BRANDS); no page shows it.
   */
  'mylife-about-ca': {
    publisher: 'mylife',
    label: 'About us (mylife Diabetes Care Canada)',
    href: 'https://www.mylife-diabetescare.com/en-CA/about-us/',
    hrefLang: 'en',
  },
  'lifescan-verio-reflect': {
    publisher: 'lifescan',
    label: 'OneTouch Verio Reflect',
    href: 'https://www.onetouch.ca/products/glucose-meters/onetouch-verio-reflect',
    hrefLang: 'en',
  },
  'ascensia-support': {
    publisher: 'ascensia',
    label: 'Support (Ascensia Diabetes Care Canada)',
    href: 'https://www.ascensiadiabetes.ca/support/',
    hrefLang: 'en',
  },
  'embecta-contact': {
    publisher: 'embecta',
    label: 'Contact us (embecta Canada)',
    href: 'https://www.embecta.com/ca/en-ca/hcp/support/contact-us/',
    hrefLang: 'en',
  },
  'dex4-contact': {
    publisher: 'amg-medical',
    label: 'Contact (Dex4 Canada)',
    href: 'https://dex4.ca/pages/contact',
    hrefLang: 'en',
  },
};
