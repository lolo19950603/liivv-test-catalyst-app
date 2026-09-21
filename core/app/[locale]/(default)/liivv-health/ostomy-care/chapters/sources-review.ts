/*
 * =============================================================================
 * OSTOMY CARE CHAPTERS — SOURCE REGISTER, REVIEWER-ONLY FIELDS
 * =============================================================================
 * What each source in sources-meta.ts publishes, who publishes it, and the
 * paraphrase of the passage it is cited for. None of it is ever rendered: the
 * page needs a title, a link and a language, and that is all sources-meta.ts
 * holds. These three fields exist for the people checking the microsite against
 * its sources, and they are read by one caller — the content-review export.
 *
 * They live in their own file because chapters-data.ts is pulled into the
 * browser bundle by the chapter page, and a reviewer's private note on what a
 * regulation says has no business being shipped to a reader. Import this file
 * from the export script and from nothing else; if a runtime module ever needs
 * a publisher name, copy the string into sources-meta.ts rather than importing
 * this file.
 *
 * Keys and order follow sources-meta.ts exactly. The Record type makes tsc flag
 * a source that gains an entry there and not here.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { SourceId } from './sources-meta';

export type SourceType =
  | 'canadian-patient-education'
  | 'canadian-guideline'
  | 'international-guideline'
  | 'other';

export interface SourceReview {
  publisher: string;
  type: SourceType;
  /** Reviewer-only paraphrase of the supporting passage. Never rendered. */
  locator: string;
}

const NSWOCC = 'NSWOCC';
const OSTOMY_CANADA = 'Ostomy Canada Society';

export const SOURCE_REVIEW: Record<SourceId, SourceReview> = {
  'nswocc-ileostomy-guide-2022': {
    publisher: 'Nurses Specialized in Wound, Ostomy and Continence Canada (NSWOCC)',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: opening 1–2 mm larger than stoma; stoma shrinks about 6–8 weeks; notify NSWOC or surgeon over 1,200 ml/day; stopped output with vomiting goes to doctor or ED; ask if an NSWOC serves your community.',
  },
  'nswocc-colostomy-guide-2022': {
    publisher: NSWOCC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: NSWOC gives a detailed supply list; measure at each full change; colostomy position varies along the colon; pouch liner is a pouch option; some exercise content credited to Coloplast Canada.',
  },
  'nswocc-colostomy-guide-2022-alt': {
    publisher: NSWOCC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: avoid powder unless an NSWOC or doctor directs; avoid moisturising baby wipes; carry extra supplies and clothes away from home.',
  },
  'nswocc-ileal-conduit-guide-2022': {
    publisher: NSWOCC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: absorb urine with gauze never inserted into the stoma; stents stay 5 days to 2 weeks or longer; stoma need not be dried; pouch has a tap.',
  },
  'nswocc-patient-guides': {
    publisher: NSWOCC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: listing of English and French editions of the colostomy, ileostomy and ileal conduit guides.',
  },
  'cua-urinary-diversions-position-2022': {
    publisher: 'Canadian Urological Association, NSWOCC and Urology Nurses of Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: early NSWOC phone and in-person follow-up, then weeks and months (Table 3 differs); stabilise stents during changes; 5–15 kg weight loss common in three months after discharge.',
  },
  'clwk-one-piece-pouch-change-2026': {
    publisher: 'BC Provincial Nursing Ostomy Committee (CLWK)',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: wash hands and put on PPE before the change, and remove gloves and wash hands after it; gentle hand pressure 1–2 minutes, heat helps set flange; easier when pouch empty; pre-cut once size established about 8 weeks; LPN entry level excludes rods and stents; endorsement pending.',
  },
  'tru-clinical-procedures-ostomy-care': {
    publisher: 'Thompson Rivers University / BCcampus (CC BY 4.0)',
    type: 'other',
    locator:
      'Paraphrase (Checklist 89): step 1 perform hand hygiene, step 2 gather supplies, and hand hygiene again at the end; palm over pouch 2 minutes, some flanges heat activated; sterile technique with ureteral stents; rod removed only by physician or wound nurse; empty contents; community nurse referral.',
  },
  'nsh-one-piece-pouch-change-2023': {
    publisher: 'Nova Scotia Health',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: nurse-ticked checklist; press belly while lifting wafer; garbage disposal; opening 2 mm bigger; firm pressure 30–60 seconds; change every 4–5 days. Update due July 2026: confirm current.',
  },
  'nsh-two-piece-pouch-change-2023': {
    publisher: 'Nova Scotia Health',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: centre the wafer, then attach the pouch to it. Update due July 2026: confirm current.',
  },
  'ocs-changing-your-pouching-system': {
    publisher: 'Ostomy Canada Society (page credits myostomycare.com)',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: change when stoma is quiet; press skin away from flange while removing; flange opening must not touch the stoma.',
  },
  'ocs-routine-ostomy-care-colostomy': {
    publisher: OSTOMY_CANADA,
    type: 'canadian-patient-education',
    locator: 'Paraphrase: drainable systems typically changed every 3 to 7 days.',
  },
  'ocs-ostomy-accessories': {
    publisher: OSTOMY_CANADA,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: NSWOCs take a less-is-best approach and recommend accessories only when needed.',
  },
  'ocs-find-a-chapter': {
    publisher: OSTOMY_CANADA,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: chapter and peer group locator; listings carry volunteer contacts; meetings may include manufacturer representatives.',
  },
  'nswocc-find-an-nswoc': {
    publisher: NSWOCC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: not for emergencies or urgent needs; no commercial use; English/French selector.',
  },
  'wounds-canada-professional-guide-2023': {
    publisher: 'Wounds Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: normal stoma soft, warm, moist, pinkish-red; patients need sealed bags for used supplies. Link token may expire; retrieve from woundscanada.ca.',
  },
  'khsc-ileostomy-care-2020': {
    publisher: 'Kingston Health Sciences Centre',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: hole 3 mm larger; measure each change 6–8 weeks; skin protector optional; no abdominal exercises 4–6 weeks; intensive core no sooner than 3 months; surgeon 4–6 weeks after discharge.',
  },
  'sunnybrook-eras-bowel-surgery': {
    publisher: 'Sunnybrook Health Sciences Centre',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: 10 lb lifting limit for 4–6 weeks; drive once off opioid pain medicine (general bowel surgery).',
  },
  'ahs-eating-well-ileostomy-2025': {
    publisher: 'Alberta Health Services, Nutrition Services',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: soft, lower-fibre foods first 6–8 weeks, then add higher-fibre foods gradually.',
  },
  'ahs-eating-well-colostomy-2025': {
    publisher: 'Alberta Health Services, Nutrition Services',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: softer foods may be easier first 2–4 weeks; fibre is okay after surgery, added slowly.',
  },
  'healthlinkbc-caring-for-your-ostomy': {
    publisher: 'HealthLink BC (Healthwise content, US-authored, provincially hosted)',
    type: 'other',
    locator: 'Paraphrase: do not flush used pouches. Not counted toward Canadian consensus.',
  },
  'sante-laurentides-stomie-videos': {
    publisher: 'Santé Québec Laurentides',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: French teaching videos including a starter-kit segment; links onward to a manufacturer-hosted library. Not yet watched.',
  },
  'akh-legal-information': {
    publisher: 'The Hospital for Sick Children (AboutKidsHealth)',
    type: 'canadian-patient-education',
    locator: 'Paraphrase: linking encouraged; framing prohibited; no suggestion of endorsement.',
  },
  'akh-ostomy-care-instructions': {
    publisher: 'The Hospital for Sick Children',
    type: 'canadian-patient-education',
    locator:
      "Paraphrase: SickKids staff article on changing a child's pouch and when to call the nurse; updated December 2023.",
  },
  'akh-stomie-overview-fr': {
    publisher: 'The Hospital for Sick Children',
    type: 'canadian-patient-education',
    locator: 'Paraphrase: French overview page last updated November 2013.',
  },
  'wocn-basic-ostomy-skin-care-2024': {
    publisher: 'Wound, Ostomy and Continence Nurses Society (US; update funded by Hollister grant)',
    type: 'international-guideline',
    locator:
      'Paraphrase: warm water or remover to release; cut or mould to size and shape; healthy skin not red or darker than usual; contact nurse if changing more often.',
  },
  'ascn-stoma-care-guidelines-2016': {
    publisher: 'Association of Stoma Care Nurses UK',
    type: 'international-guideline',
    locator:
      'Paraphrase: written instructions prompt first home changes; a prolapse may need a larger opening.',
  },
  'hra-large-intestine-male-v1-3': {
    publisher: 'HuBMAP / Human Reference Atlas',
    type: 'other',
    locator:
      'Paraphrase: mainly colonoscopy-derived data aligned to the Visible Human Male; named colon segments; CC BY 4.0.',
  },
  'hra-small-intestine-male-v1-2': {
    publisher: 'HuBMAP / Human Reference Atlas',
    type: 'other',
    locator: 'Paraphrase: Visible Human Male data with named jejunum and ileum; CC BY 4.0.',
  },
  'nih3d-hra-collection': {
    publisher: 'NIH 3D',
    type: 'other',
    locator:
      'Paraphrase: organs built by a medical illustrator and reviewed by organ experts (wording not to be reused on Liivv pages).',
  },
  'datacite-hbm487-zksn-693': {
    publisher: 'DataCite',
    type: 'other',
    locator: 'Paraphrase: DOI record for the Large Intestine, Male, v1.3 reference organ.',
  },
  'datacite-hbm789-xtdk-794': {
    publisher: 'DataCite',
    type: 'other',
    locator: 'Paraphrase: DOI record for the Small Intestine, Male, v1.2 reference organ.',
  },
  'nih3d-terms': {
    publisher: 'NIH / NIAID',
    type: 'other',
    locator: 'Paraphrase: models are illustrative and educational, not for diagnosis or treatment.',
  },
  'nlm-terms-and-conditions': {
    publisher: 'U.S. National Library of Medicine',
    type: 'other',
    locator:
      "Paraphrase: credit NLM with a 'Courtesy of the U.S. National Library of Medicine' line.",
  },
  'cc-by-4-0-legal-code': {
    publisher: 'Creative Commons',
    type: 'other',
    locator:
      'Paraphrase: credit, indicate modifications, imply no endorsement, add no restrictive terms.',
  },
  'google-fix-lazy-loaded-content': {
    publisher: 'Google Search Central',
    type: 'other',
    locator:
      'Paraphrase: Search does not interact with pages, so content must load without a click.',
  },
  'hc-advertising-promotional-examples': {
    publisher: 'Health Canada',
    type: 'canadian-guideline',
    locator:
      "Paraphrase: a tool may be promotional if it links to one product's benefits or does not stress consulting a health professional.",
  },
  'hc-advertising-distinction-overview': {
    publisher: 'Health Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: covers medical devices; messages not from an independent party are more likely promotional.',
  },
  'food-and-drugs-act-s20': {
    publisher: 'Justice Laws Website, Government of Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: no device sold or advertised in a misleading way, including about performance or intended use.',
  },
  'medical-devices-regulations-s27': {
    publisher: 'Justice Laws Website, Government of Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: Class II–IV devices may not be advertised for sale unless licensed (conditions apply).',
  },
  'hc-device-class-keyword-index-2006': {
    publisher: 'Health Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: ostomy appliances indexed Class 1, but index classes are indicative only.',
  },
  'mdall-licence-1011': {
    publisher: 'Health Canada Medical Devices Active Licence Listing API',
    type: 'other',
    locator: 'Paraphrase: a colostomy irrigation system licensed at risk class 2.',
  },
  'competition-bureau-fake-urgency': {
    publisher: 'Competition Bureau Canada',
    type: 'canadian-guideline',
    locator: 'Paraphrase: urgency cues pushing immediate purchase can be deceptive.',
  },
  'competition-bureau-drip-pricing': {
    publisher: 'Competition Bureau Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: advertised prices must be attainable, with mandatory fees shown up front.',
  },
  'casl-ss1-6': {
    publisher: 'Justice Laws Website, Government of Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: hyperlinks can make a message commercial; commercial messages need consent, identification and unsubscribe.',
  },
  'casl-s9': {
    publisher: 'Justice Laws Website, Government of Canada',
    type: 'canadian-guideline',
    locator: 'Paraphrase: aiding or inducing a contravention of ss.6–8 is prohibited.',
  },
  'opc-meaningful-consent-guidelines': {
    publisher: 'Office of the Privacy Commissioner of Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: health information is generally sensitive and usually needs express consent.',
  },
  'opc-pipeda-findings-2014-001': {
    publisher: 'Office of the Privacy Commissioner of Canada',
    type: 'canadian-guideline',
    locator: 'Paraphrase: ads based on sensitive health browsing required express consent.',
  },
  'cai-quebec-privacy-settings': {
    publisher: "Commission d'accès à l'information du Québec",
    type: 'canadian-guideline',
    locator:
      'Paraphrase: public technology products must default to the highest confidentiality settings.',
  },
  'oqlf-waterco-infraction-2025': {
    publisher: 'Office québécois de la langue française',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: Charter s.52 requires commercial publications, including websites, in French.',
  },
  'cno-independent-practice': {
    publisher: 'College of Nurses of Ontario',
    type: 'canadian-guideline',
    locator:
      'Paraphrase: selling care products can create conflict; do not use a designation to endorse a product. Binds Ontario registrants.',
  },
  'nhs-pharmaceutical-regulations-2013-sch5': {
    publisher: 'legislation.gov.uk (UK Government)',
    type: 'international-guideline',
    locator:
      'Paraphrase: appliance contractors advise patients to request only items they need (England).',
  },
};
