/*
 * Non-translatable half of the funding data: coverage model, the official
 * government URL, and the date each entry was last checked against it.
 *
 * Prose — program names, amounts, how to apply, gatekeepers, deadlines, notes —
 * lives in messages/*.json under OstomyCare.funding.programs.
 *
 * Program names live here rather than in the message tree because they are legal
 * proper nouns. A translation pass renamed Ontario's Assistive Devices Program to
 * an invented French title, which would send a reader looking for something that
 * does not exist. Official French names go in programNameFr, deliberately.
 *
 * hasAmount records whether the jurisdiction publishes a figure at all. Yukon
 * and Nunavut do not, and the UI must not invent one for them.
 */

import type { CoverageModel, ProvinceCode } from './funding-data';

export interface ProgramMeta {
  /** Legal program name. Never translated — see the note at the top of this file. */
  programName: string;
  /** Link label for the official government page. Never translated. */
  officialLabel: string;
  /** Official French name, only where the jurisdiction publishes one. */
  programNameFr: string;
  model: CoverageModel;
  officialUrl: string;
  verifiedOn: string;
  hasAmount: boolean;
}

export const PROGRAM_META: Record<ProvinceCode, ProgramMeta> = {
  ON: {
    programName: 'Assistive Devices Program — Ostomy Grant',
    officialLabel: 'Ontario — enteral feeding and ostomy grant',
    programNameFr: 'Programme d’appareils et accessoires fonctionnels — subvention pour stomie',
    model: 'flat-grant',
    officialUrl: 'https://www.ontario.ca/page/enteral-feeding-and-ostomy',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  BC: {
    programName: 'PharmaCare — ostomy supplies',
    officialLabel: 'BC PharmaCare — ostomy supplies',
    programNameFr: '',
    model: 'cost-share',
    officialUrl:
      'https://www2.gov.bc.ca/gov/content/health/health-drug-coverage/pharmacare-for-bc-residents/what-we-cover/medical-supplies-coverage/ostomy-supplies',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  AB: {
    programName: 'Alberta Aids to Daily Living (AADL)',
    officialLabel: 'Alberta — AADL cost-sharing',
    programNameFr: '',
    model: 'cost-share',
    officialUrl: 'https://www.alberta.ca/aadl-cost-sharing-of-benefits',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  SK: {
    programName: 'SAIL — Ostomy Program',
    officialLabel: 'Saskatchewan — SAIL',
    programNameFr: '',
    model: 'cost-share',
    officialUrl:
      'https://www.saskatchewan.ca/residents/health/accessing-health-care-services/health-services-for-people-with-disabilities/sail',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  MB: {
    programName: 'Manitoba Ostomy Program',
    officialLabel: 'Shared Health Manitoba — Ostomy Program',
    programNameFr: '',
    model: 'supplies-in-kind',
    officialUrl: 'https://sharedhealthmb.ca/services/mop/',
    verifiedOn: '2026-08-27',
    hasAmount: false,
  },
  QC: {
    programName: 'RAMQ — Ostomy Appliances Program',
    officialLabel: 'RAMQ — appliances for ostomates',
    programNameFr: 'Programme relatif à l’appareillage pour les personnes stomisées (RAMQ)',
    model: 'flat-grant',
    officialUrl: 'https://www.ramq.gouv.qc.ca/en/citizens/aid-programs/appliances-ostomates',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  NB: {
    programName: 'Ostomy/Incontinence Program — Social Development clients only',
    officialLabel: 'New Brunswick — Social Development health services',
    programNameFr: '',
    model: 'categorical',
    officialUrl:
      'https://www2.gnb.ca/content/gnb/en/departments/social_development/health_services.html',
    verifiedOn: '2026-08-27',
    hasAmount: false,
  },
  NS: {
    programName: 'Pharmacare — ostomy supplies on the provincial formulary',
    officialLabel: 'Nova Scotia Pharmacare',
    programNameFr: '',
    model: 'cost-share',
    officialUrl: 'https://novascotia.ca/dhw/pharmacare/',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  PE: {
    programName: 'Ostomy Supplies Program',
    officialLabel: 'PEI — Ostomy Supplies Program',
    programNameFr: '',
    model: 'cost-share',
    officialUrl:
      'https://www.princeedwardisland.ca/en/information/health-and-wellness/ostomy-supplies-program',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  NL: {
    programName: 'Ostomy Subsidy Program — 65Plus Plan cardholders',
    officialLabel: 'Newfoundland and Labrador — NLPDP',
    programNameFr: '',
    model: 'cost-share',
    officialUrl: 'https://www.gov.nl.ca/hcs/prescription/nlpdp-plan-overview/',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  YT: {
    programName: 'Chronic Disease and Disability Benefits',
    officialLabel: 'Yukon — help with costs for chronic disease or disability',
    programNameFr: '',
    model: 'cost-share',
    officialUrl:
      'https://yukon.ca/en/health-and-wellness/care-services/get-help-costs-if-you-have-chronic-disease-or-disability',
    verifiedOn: '2026-08-27',
    hasAmount: false,
  },
  NT: {
    programName: 'Extended Health Benefits',
    officialLabel: 'NWT — Extended Health Benefits',
    programNameFr: '',
    model: 'cost-share',
    officialUrl: 'https://www.hss.gov.nt.ca/en/services/extended-health-benefits',
    verifiedOn: '2026-08-27',
    hasAmount: true,
  },
  NU: {
    programName: 'Extended Health Benefits — specified conditions and seniors',
    officialLabel: 'Nunavut — Extended Health Benefits',
    programNameFr: '',
    model: 'categorical',
    officialUrl:
      'https://www.gov.nu.ca/en/health/extended-health-benefits-ehb-specified-conditions',
    verifiedOn: '2026-08-27',
    hasAmount: false,
  },
};
