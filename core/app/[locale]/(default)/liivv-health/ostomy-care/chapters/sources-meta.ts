/*
 * =============================================================================
 * OSTOMY CARE CHAPTERS — SOURCE REGISTER
 * =============================================================================
 * The published documents that back the interactive modules (C01–C04, C07–C09,
 * C11–C14), taken from the approved source register. Modules cite a source by
 * id; chapters-data.ts resolves the id to a label, link and language for the
 * page locale.
 *
 * Same rule as CitationMeta in chapters-meta.ts: titles are identifiers, so
 * they never go through the message tree. `labelFr` and `hrefFr` are set only
 * where the publisher itself issues a French title or a separate French file.
 *
 * Only what a page needs is here: a title, a link and a language. The publisher
 * name, the source type and the reviewer's paraphrase of the passage are in
 * ./sources-review.ts, which the content-review export reads and no runtime
 * module imports — chapters-data.ts is pulled into the browser bundle by the
 * chapter page, and reviewer notes have no business shipping to a reader.
 *
 * No imports and erasable TypeScript only: the content-review export loads this
 * file directly under Node's type stripping.
 * =============================================================================
 */

export interface SourceMeta {
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

export type SourceId =
  | 'nswocc-ileostomy-guide-2022'
  | 'nswocc-colostomy-guide-2022'
  | 'nswocc-colostomy-guide-2022-alt'
  | 'nswocc-ileal-conduit-guide-2022'
  | 'nswocc-patient-guides'
  | 'cua-urinary-diversions-position-2022'
  | 'clwk-one-piece-pouch-change-2026'
  | 'tru-clinical-procedures-ostomy-care'
  | 'nsh-one-piece-pouch-change-2023'
  | 'nsh-two-piece-pouch-change-2023'
  | 'ocs-changing-your-pouching-system'
  | 'ocs-routine-ostomy-care-colostomy'
  | 'ocs-ostomy-accessories'
  | 'ocs-find-a-chapter'
  | 'nswocc-find-an-nswoc'
  | 'wounds-canada-professional-guide-2023'
  | 'khsc-ileostomy-care-2020'
  | 'sunnybrook-eras-bowel-surgery'
  | 'ahs-eating-well-ileostomy-2025'
  | 'ahs-eating-well-colostomy-2025'
  | 'healthlinkbc-caring-for-your-ostomy'
  | 'sante-laurentides-stomie-videos'
  | 'akh-legal-information'
  | 'akh-ostomy-care-instructions'
  | 'akh-stomie-overview-fr'
  | 'wocn-basic-ostomy-skin-care-2024'
  | 'ascn-stoma-care-guidelines-2016'
  | 'hra-large-intestine-male-v1-3'
  | 'hra-small-intestine-male-v1-2'
  | 'nih3d-hra-collection'
  | 'datacite-hbm487-zksn-693'
  | 'datacite-hbm789-xtdk-794'
  | 'nih3d-terms'
  | 'nlm-terms-and-conditions'
  | 'cc-by-4-0-legal-code'
  | 'google-fix-lazy-loaded-content'
  | 'hc-advertising-promotional-examples'
  | 'hc-advertising-distinction-overview'
  | 'food-and-drugs-act-s20'
  | 'medical-devices-regulations-s27'
  | 'hc-device-class-keyword-index-2006'
  | 'mdall-licence-1011'
  | 'competition-bureau-fake-urgency'
  | 'competition-bureau-drip-pricing'
  | 'casl-ss1-6'
  | 'casl-s9'
  | 'opc-meaningful-consent-guidelines'
  | 'opc-pipeda-findings-2014-001'
  | 'cai-quebec-privacy-settings'
  | 'oqlf-waterco-infraction-2025'
  | 'cno-independent-practice'
  | 'nhs-pharmaceutical-regulations-2013-sch5';

const NSWOCC_FILES = 'https://www.nswoc.ca/_files/ugd';

export const SOURCE_META: Record<SourceId, SourceMeta> = {
  'nswocc-ileostomy-guide-2022': {
    label: 'A Guide to Living with an Ileostomy (2nd ed., 2022)',
    labelFr: 'Guide pour vivre avec une iléostomie (2e édition, 2022)',
    href: `${NSWOCC_FILES}/9d080f_cf19532eba504fd79c71485cd36099f4.pdf`,
    hrefFr: `${NSWOCC_FILES}/9d080f_53515f95802e4b67ab78f88baa665c65.pdf`,
    hrefLang: 'en',
  },
  'nswocc-colostomy-guide-2022': {
    label: 'A Guide to Living with a Colostomy (2nd ed., 2022)',
    labelFr: 'Guide pour vivre avec une colostomie (2e édition, 2022)',
    href: `${NSWOCC_FILES}/9d080f_58583a56551e41338be7de2c0777b76f.pdf`,
    hrefFr: `${NSWOCC_FILES}/9d080f_0932a4cf043440a28b260f7bd605fb81.pdf`,
    hrefLang: 'en',
  },
  /* A second PDF of the same edition, hosted separately. The French edition is the same file. */
  'nswocc-colostomy-guide-2022-alt': {
    label: 'A Guide to Living with a Colostomy (2nd ed., 2022), alternate PDF',
    labelFr: 'Guide pour vivre avec une colostomie (2e édition, 2022)',
    href: `${NSWOCC_FILES}/9d080f_d603fcad1d9d46209335902153cc6300.pdf`,
    hrefFr: `${NSWOCC_FILES}/9d080f_0932a4cf043440a28b260f7bd605fb81.pdf`,
    hrefLang: 'en',
  },
  'nswocc-ileal-conduit-guide-2022': {
    label: 'A Guide to Living with an Ileal Conduit (2nd ed., 2022)',
    labelFr: 'Guide pour vivre avec un conduit iléal (2e édition, 2022)',
    href: `${NSWOCC_FILES}/9d080f_69294c4210794eab98ac330800967756.pdf`,
    hrefFr: `${NSWOCC_FILES}/9d080f_e334ad31efa940c7a47370e5fb3d54fb.pdf`,
    hrefLang: 'en',
  },
  'nswocc-patient-guides': {
    label: 'Patient Guides to Living with an Ostomy',
    href: 'https://www.nswoc.ca/guides',
    hrefLang: 'en',
  },
  'cua-urinary-diversions-position-2022': {
    label: 'Canadian Urinary Diversions Position Statement (1st ed., January 2022)',
    href: `${NSWOCC_FILES}/9d080f_1d03fe28d93743ac9af21e2f0c89d186.pdf`,
    hrefLang: 'en',
  },
  'clwk-one-piece-pouch-change-2026': {
    label:
      'Changing One-Piece Ostomy Pouching System: Procedure (Decision Support Tool, January 2026)',
    href: 'https://www.clwk.ca/get-resource/changing-one-piece-ostomy-pouching-system-procedure/',
    hrefLang: 'en',
  },
  'tru-clinical-procedures-ostomy-care': {
    label: 'Clinical Procedures for Safer Patient Care, 11.2 Ostomy Care (Checklist 89)',
    href: 'https://pressbooks.bccampus.ca/clinicalproceduresforsaferpatientcaretrubscn/chapter/11-2-ostomy-care/',
    hrefLang: 'en',
  },
  'nsh-one-piece-pouch-change-2023': {
    label: 'Changing a One-piece Colostomy or Ileostomy Pouch: Western Zone (WI85-2230, 2023)',
    href: 'https://www.nshealth.ca/sites/default/files/documents/pamphlets/2230.pdf',
    hrefLang: 'en',
  },
  'nsh-two-piece-pouch-change-2023': {
    label: 'Changing a Two-piece Colostomy or Ileostomy Pouch: Western Zone (WI85-2231, 2023)',
    href: 'https://www.nshealth.ca/sites/default/files/documents/pamphlets/2231.pdf',
    hrefLang: 'en',
  },
  'ocs-changing-your-pouching-system': {
    label: 'Changing your pouching system',
    href: 'https://www.ostomycanada.ca/ostomy-care-basics/general-management/changing-your-pouching-system/',
    hrefLang: 'en',
  },
  'ocs-routine-ostomy-care-colostomy': {
    label: 'Routine Ostomy Care (colostomy)',
    href: 'https://www.ostomycanada.ca/ostomy-journey/colostomy/routine-ostomy-care/',
    hrefLang: 'en',
  },
  'ocs-ostomy-accessories': {
    label: 'Ostomy Accessories',
    href: 'https://www.ostomycanada.ca/ostomy-care/products-and-supplies/ostomy-accessories/',
    hrefLang: 'en',
  },
  'ocs-find-a-chapter': {
    label: 'Find a Chapter / Peer Support Group',
    href: 'https://ostomycanada.ca/find-a-chapter-peer-support-group/',
    hrefLang: 'en',
  },
  'nswocc-find-an-nswoc': {
    label: 'Find an NSWOC',
    href: 'https://membersnswoc.ca/find.phtml',
    hrefLang: 'en',
  },
  'wounds-canada-professional-guide-2023': {
    label: 'Professional Guide: Caring for a Person with an Ostomy (2023)',
    href: 'https://www.woundscanada.ca/doclink/professional-guide-ostomy/eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJwcm9mZXNzaW9uYWwtZ3VpZGUtb3N0b215IiwiaWF0IjoxNjg3MTkyODMwLCJleHAiOjE2ODcyNzkyMzB9.6LzQUBa55Ahh5mgbMqLms4vgMQko5689CDt78LrrjHs',
    hrefLang: 'en',
  },
  'khsc-ileostomy-care-2020': {
    label: 'A New Beginning... Ileostomy Care (September 2020)',
    href: 'https://kingstonhsc.ca/sites/default/files/legacy/files/subsite-basic-page/ileostomy_patient_education_booklet_eng.pdf',
    hrefLang: 'en',
  },
  'sunnybrook-eras-bowel-surgery': {
    label: 'A Guide to Enhancing Your Recovery After Bowel Surgery (ERAS)',
    href: 'https://sunnybrook.ca/wp-content/uploads/2026/01/A-Guide-to-Enhancing-Your-Recovery-After-Bowel-Surgery-ERAS-booklet.pdf',
    hrefLang: 'en',
  },
  'ahs-eating-well-ileostomy-2025': {
    label: 'Eating Well After Ileostomy Surgery (Jan 2025)',
    href: 'https://www.albertahealthservices.ca/assets/info/nutrition/if-nfs-eating-well-after-ileostomy-surgery.pdf',
    hrefLang: 'en',
  },
  'ahs-eating-well-colostomy-2025': {
    label: 'Eating Well After Colostomy Surgery (Jan 2025)',
    href: 'https://www.albertahealthservices.ca/assets/info/nutrition/if-nfs-eating-well-after-colostomy-surgery.pdf',
    hrefLang: 'en',
  },
  'healthlinkbc-caring-for-your-ostomy': {
    label: 'Bowel Disease: Caring for Your Ostomy',
    href: 'https://www.healthlinkbc.ca/healthwise/bowel-disease-caring-your-ostomy',
    hrefLang: 'en',
  },
  /* French videos behind an English-language page path; the publisher's French path is hrefFr. */
  'sante-laurentides-stomie-videos': {
    label: "Vidéos d'enseignement pour les personnes ayant une stomie",
    href: 'https://www.santelaurentides.gouv.qc.ca/en/care-and-services/stomie/videos-stomie/',
    hrefFr: 'https://www.santelaurentides.gouv.qc.ca/soins-et-services/stomie/videos-stomie/',
    hrefLang: 'fr',
  },
  'akh-legal-information': {
    label: 'Legal information for AboutKidsHealth.ca',
    href: 'https://www.aboutkidshealth.ca/about/legal-info/',
    hrefLang: 'en',
  },
  'akh-ostomy-care-instructions': {
    label: 'Ostomy care instructions (AboutKidsHealth)',
    href: 'https://www.aboutkidshealth.ca/ostomy-care-instructions',
    hrefLang: 'en',
  },
  'akh-stomie-overview-fr': {
    label: 'Stomie (AboutKidsHealth French overview)',
    href: 'https://www.aboutkidshealth.ca/ostomy-overview?language=fr',
    hrefLang: 'fr',
  },
  'wocn-basic-ostomy-skin-care-2024': {
    label: 'Basic Ostomy Skin Care: A Guide for Patients and Health Care Workers (2024)',
    href: 'https://www.ostomy.org/wp-content/uploads/2024/07/wocn_basic_ostomy_skin_care_2024-07.pdf',
    hrefLang: 'en',
  },
  'ascn-stoma-care-guidelines-2016': {
    label: 'ASCN Stoma Care Clinical Guidelines 2016',
    href: 'https://www.sath.nhs.uk/wp-content/uploads/2017/11/Stoma-Care-Guidelines.pdf',
    hrefLang: 'en',
  },
  'hra-large-intestine-male-v1-3': {
    label: 'HRA 3D Reference Organ: Large Intestine, Male v1.3 (metadata)',
    href: 'https://lod.humanatlas.io/ref-organ/large-intestine-male/latest',
    hrefLang: 'en',
  },
  'hra-small-intestine-male-v1-2': {
    label: 'HRA 3D Reference Organ: Small Intestine, Male v1.2 (metadata)',
    href: 'https://lod.humanatlas.io/ref-organ/small-intestine-male/latest',
    hrefLang: 'en',
  },
  'nih3d-hra-collection': {
    label: 'Human Reference Atlas 3D Reference Object Library collection',
    href: 'https://3d.nih.gov/collections/hra',
    hrefLang: 'en',
  },
  'datacite-hbm487-zksn-693': {
    label: 'DataCite record for 10.48539/HBM487.ZKSN.693',
    href: 'https://api.datacite.org/dois/10.48539/HBM487.ZKSN.693',
    hrefLang: 'en',
  },
  'datacite-hbm789-xtdk-794': {
    label: 'DataCite record for 10.48539/HBM789.XTDK.794',
    href: 'https://api.datacite.org/dois/10.48539/HBM789.XTDK.794',
    hrefLang: 'en',
  },
  'nih3d-terms': {
    label: 'NIH 3D Terms',
    href: 'https://3d.nih.gov/terms',
    hrefLang: 'en',
  },
  'nlm-terms-and-conditions': {
    label: 'NLM Terms and Conditions (data download)',
    href: 'https://www.nlm.nih.gov/databases/download/terms_and_conditions.html',
    hrefLang: 'en',
  },
  'cc-by-4-0-legal-code': {
    label: 'CC BY 4.0 Legal Code',
    href: 'https://creativecommons.org/licenses/by/4.0/legalcode.en',
    hrefLang: 'en',
  },
  'google-fix-lazy-loaded-content': {
    label: 'Fix lazy-loaded content',
    href: 'https://developers.google.com/search/docs/crawling-indexing/javascript/lazy-loading',
    hrefLang: 'en',
  },
  'hc-advertising-promotional-examples': {
    label: 'Guidance on distinction between advertising and other activities: promotional examples',
    href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/regulatory-requirements-advertising/policies-guidance-documents/policy-distinction-between-advertising-activities/promotional-examples.html',
    hrefLang: 'en',
  },
  'hc-advertising-distinction-overview': {
    label:
      'Guidance on distinction between advertising and other activities for health products: Overview',
    href: 'https://www.canada.ca/en/health-canada/services/drugs-health-products/regulatory-requirements-advertising/policies-guidance-documents/policy-distinction-between-advertising-activities.html',
    hrefLang: 'en',
  },
  'food-and-drugs-act-s20': {
    label: 'Food and Drugs Act (R.S.C., 1985, c. F-27), s.20',
    href: 'https://laws-lois.justice.gc.ca/eng/acts/F-27/page-2.html',
    hrefLang: 'en',
  },
  'medical-devices-regulations-s27': {
    label: 'Medical Devices Regulations (SOR/98-282), s.27',
    href: 'https://laws-lois.justice.gc.ca/eng/regulations/SOR-98-282/page-2.html',
    hrefLang: 'en',
  },
  'hc-device-class-keyword-index-2006': {
    label: 'Keyword Index to Assist Manufacturers in Verifying the Class of Medical Devices (2006)',
    href: 'https://www.canada.ca/content/dam/hc-sc/migration/hc-sc/dhp-mps/alt_formats/hpfb-dgpsa/pdf/md-im/keyword_motscles2-eng.pdf',
    hrefLang: 'en',
  },
  'mdall-licence-1011': {
    label: 'MDALL licence record 1011 (VISI-FLOW Irrigation System)',
    href: 'https://health-products.canada.ca/api/medical-devices/licence/?lang=en&type=json&id=1011',
    hrefLang: 'en',
  },
  'competition-bureau-fake-urgency': {
    label: 'Fake urgency cues',
    href: 'https://competition-bureau.canada.ca/en/deceptive-marketing-practices/types-deceptive-marketing-practices/fake-urgency-cues',
    hrefLang: 'en',
  },
  'competition-bureau-drip-pricing': {
    label: 'Drip pricing',
    href: 'https://competition-bureau.canada.ca/en/deceptive-marketing-practices/drip-pricing',
    hrefLang: 'en',
  },
  'casl-ss1-6': {
    label:
      'An Act to promote the efficiency and adaptability of the Canadian economy (S.C. 2010, c. 23, CASL), ss.1(2) and 6',
    href: 'https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-1.html',
    hrefLang: 'en',
  },
  'casl-s9': {
    label: 'CASL (S.C. 2010, c. 23), s.9',
    href: 'https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-2.html',
    hrefLang: 'en',
  },
  'opc-meaningful-consent-guidelines': {
    label: 'Guidelines for obtaining meaningful consent',
    href: 'https://www.priv.gc.ca/en/privacy-topics/collecting-personal-information/consent/gl_omc_201805/',
    hrefLang: 'en',
  },
  'opc-pipeda-findings-2014-001': {
    label: 'PIPEDA Report of Findings #2014-001',
    href: 'https://www.priv.gc.ca/en/opc-actions-and-decisions/investigations/investigations-into-businesses/2014/pipeda-2014-001/',
    hrefLang: 'en',
  },
  'cai-quebec-privacy-settings': {
    label: 'Principaux changements (thématique : paramètres de confidentialité)',
    href: 'https://www.cai.gouv.qc.ca/espace-evolutif-modernisation-lois/thematiques/parametres-confidentialite',
    hrefLang: 'fr',
  },
  'oqlf-waterco-infraction-2025': {
    label: 'Office québécois de la langue française: Waterco infraction notice (2025)',
    href: 'https://www.oqlf.gouv.qc.ca/office/communiques/2025/20251114_infraction_waterco.aspx',
    hrefLang: 'fr',
  },
  'cno-independent-practice': {
    label: 'Independent Practice (Practice Guideline)',
    href: 'https://www.cno.org/Assets/CNO/Documents/Standard-and-Learning/Practice-Standards/41011_fsindepprac.pdf',
    hrefLang: 'en',
  },
  'nhs-pharmaceutical-regulations-2013-sch5': {
    label:
      'The National Health Service (Pharmaceutical and Local Pharmaceutical Services) Regulations 2013, Schedule 5',
    href: 'https://www.legislation.gov.uk/uksi/2013/349/schedule/5/made',
    hrefLang: 'en',
  },
};
