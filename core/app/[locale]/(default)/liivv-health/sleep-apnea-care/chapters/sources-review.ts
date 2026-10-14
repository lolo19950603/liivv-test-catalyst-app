/*
 * =============================================================================
 * SLEEP APNEA CARE — SOURCE REGISTER, FOR THE REVIEW
 * =============================================================================
 * Generated with ./sources-meta.ts from docs/sleep-content/sources.md: same ids,
 * same order. What the reviewer needs and no page does: the publisher as the
 * register names it, the kind of source, and the locator — the register's
 * original type, the claims it supports and its check status, verbatim.
 *
 * Kinds (Diabetes Care's union, so the review export labels them alike):
 * CA-gov, CA-reg and CA-FN → canadian-government; CA-clin → canadian-guideline;
 * CA-org → canadian-patient-education; INTL → international-guideline (the
 * Healthwise pages: international-patient-education); IND → industry;
 * OPS → other.
 *
 * Read by the content-review export only; no runtime module imports it.
 * =============================================================================
 */

import type { SourceId } from './sources-meta';

export type SourceType =
  | 'canadian-guideline'
  | 'canadian-government'
  | 'canadian-patient-education'
  | 'international-guideline'
  | 'international-patient-education'
  | 'industry'
  | 'other';

export interface SourceReview {
  publisher: string;
  type: SourceType;
  locator: string;
}

export const SOURCE_REVIEW: Record<SourceId, SourceReview> = {
  'cla-sleep-apnea': {
    publisher: 'Canadian Lung Association',
    type: 'canadian-patient-education',
    locator:
      '[CA-org] Signs and risk factors, testing, CPAP use and fit, cleaning ("pure soap and warm water"), filter "every 2 months, or as needed" (re-read; leaves the plan\'s held list), travel, hospital stays, partner section, children\'s section, paediatric CPAP grant email (01–06, FUND, LAND, PATHS) Confirmed (all checks). Its children\'s section counts as child-specific only if the nurse rules so (06 R2, PATHS P4). Never the only source for a funding line.',
  },
  'lhf-sleep-apnea': {
    publisher: 'Lung Health Foundation',
    type: 'canadian-patient-education',
    locator:
      '[CA-org] Partner notices first; daytime sleepiness; crash risk; travel; hospital (01–05, PATHS) Confirmed. Mirrors CLA: corroboration only for shared sentences. It lacks CLA\'s 10%/30% weight figure and "adjustable appliances are better" (03 fixed).',
  },
  'bcg-osa-adults': {
    publisher: 'Government of BC, Guidelines and Protocols Advisory Committee',
    type: 'canadian-guideline',
    locator:
      '[CA-clin (provincial, adults 19+)] Signs, home-test rules and exclusions, AHI bands, treatment choice, CPAP generally most effective, lifestyle limits, follow-up, "events per hour" isn\'t a true AHI, driving questions, 86–95% underdiagnosed (01–05, LAND, PATHS) Confirmed. Cite the web page date. Its Appendix A (children) disagrees with CTS/CSS 2026 on home tests (01 S16): not a child source. Comfort-setting text (ramp, EPR) is never quoted.',
  },
  'bcg-osa-adults-appx-e': {
    publisher: 'BC Guidelines, 2021',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] Study levels; what a home test measures; "Overnight Oximetry … is not an appropriate test to diagnose OSA" (01, FUND) Confirmed. Level numerals sit in a separate column of the text layer.',
  },
  'bcg-osa-options-2021': {
    publisher: 'BC Guidelines, 2021',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] Oral appliance chances (about 70% mild; 50% and 40% fully effective in moderate and severe, less with BMI over 35) (03) Confirmed after a table-mode re-read. The BMI caveat applies to the moderate and severe cells only.',
  },
  'bcg-osa-oral-devices-2021': {
    publisher: 'BC Guidelines, 2021',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] Custom jaw device; "Boil and bite devices are not recommended"; nasal strips, chin straps, tongue-retaining devices (03, PATHS) Confirmed',
  },
  'cts-sdb-2011': {
    publisher: 'Canadian Thoracic Society',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] PSG is the standard; wait-time targets; APAP exclusions; "BPAP should be reserved for patients with ventilatory failure" (03 R3); heart failure care first in central apnea; complex apnea (01–03) Confirmed. Do not cite it for "oximetry alone isn\'t enough": its rec. 2 accepts Level IV (oximetry) studies (01 S6). It is older than the 2015 ASV recall.',
  },
  'cadth-osa-2017': {
    publisher: 'CADTH, now CDA-AMC',
    type: 'canadian-guideline',
    locator:
      '[CA-clin (national HTA)] CPAP has the largest effect; oral appliances if CPAP is unacceptable; lifestyle for mild OSA with overweight; no active treatment for mild OSA without overweight (03) Confirmed on the brief. Archived: the CDA-AMC report page redirects to "301 Archived Content" and the report PDFs return 404. Owner and nurse to accept the brief, labelled "2017, archived", or request the report (OPEN-QUESTIONS C22).',
  },
  'ab-cpap-buyers-2026': {
    publisher: 'MyHealth Alberta',
    type: 'canadian-government',
    locator:
      "[CA-gov] Prescription for equipment and settings; each machine set for one person; buy or rent; local vs online providers; second-hand; usual 3-year warranty; 200 days of data; children's section (fixed pressure, paediatric mask); Alberta Health Care Insurance doesn't cover CPAP; programs list; price range (held) (01–06, FUND, LAND, PATHS, RRT) Confirmed. The page carries zero-width spaces, so script matches are loose. Alias: ab-myhealth-cpap. It doesn't say who may change settings (LAND F20).",
  },
  'ab-osa-pathway-2026': {
    publisher: 'Provincial Pathways Unit, Primary Care Alberta, and Alberta Health Services',
    type: 'canadian-government',
    locator:
      '[CA-gov] Follow-up at 2–4 weeks and yearly; mask types; wear it all night; practise in the day; bloating; Health Link 811. Its 4 h / 5 nights goal is held (04 S1) (04) Confirmed. The 811 "any time, day or night" wording is on the landing page, not the PDF (04 fixed).',
  },
  'hlbc-cpap': {
    publisher: 'Healthwise content (US), published by HealthLink BC',
    type: 'international-patient-education',
    locator:
      '[INTL] Second source only (partner sleeps better; stuffy nose). "Swallowing air" rested on it alone, so it is held (04 E.17). Its "set the machine to deliver warmer or wetter air" is never used (04) Confirmed. Never the only source.',
  },
  'hlbc-snoring-osa': {
    publisher: 'Healthwise content (US), published by HealthLink BC',
    type: 'international-patient-education',
    locator:
      '[INTL] "Most people who have sleep apnea snore, [but] not all people who snore have sleep apnea" (01 6.items.2, labelled in the copy) (01) Confirmed (labelled). No Canadian adult page says this (01 S7).',
  },
  'oh-insomnia-qs-2025': {
    publisher: 'Ontario Health',
    type: 'canadian-government',
    locator:
      '[CA-gov] Insomnia disorder definition; CBT-I first-line; 4–8 sessions; sleep study if apnea suspected (01) Confirmed. Add it to the monthly link check.',
  },
  mysleepwell: {
    publisher:
      'Sleepwell, Dalhousie University; funded by the Drug Evaluation Alliance of Nova Scotia and the Government of Nova Scotia',
    type: 'canadian-patient-education',
    locator:
      "[CA-org (academic not-for-profit)] CBT-I first-line; sleep diary; see your primary care provider (01) Confirmed. /about-us/ blocks plain downloads (403): it was read through a web fetch tool, which returned the exact sentences. The site doesn't say its tools are free.",
  },
  'phac-sleep-adults': {
    publisher: 'Public Health Agency of Canada',
    type: 'canadian-government',
    locator: '[CA-gov] 7–9 h (ages 18–64); 7–8 h (65+) (01) Confirmed',
  },
  'statcan-osa-2018': {
    publisher: 'Statistics Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] 6.4% diagnosed; 12.8% at 60–79 (3 times 18–59); men twice as likely; women\'s signs differ (possible under-diagnosis); 30% at intermediate or high risk (01, 06, LAND, PATHS) Confirmed. Page marked "Archived", and catalogue 82-625-X has no newer release. The women\'s 4.0% is "Use with caution". The prose\'s "one quarter" of 60–79 at high risk doesn\'t match its table (21.4%), so it is held (06). Label the chip "(archived page)" with the survey years.',
  },
  'phac-osa-2009': {
    publisher: 'Public Health Agency of Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] 23% of adults told they had sleep apnea were never referred to a sleep lab (labelled "2009 data"); definitions (01, LAND) Confirmed',
  },
  'akh-osa': {
    publisher: 'AboutKidsHealth, The Hospital for Sick Children',
    type: 'canadian-patient-education',
    locator:
      '[CA-org (children\'s hospital)] Child signs (night and day); causes; treatments with no order; "1 to 5 children in 100"; "Some children snore but do not have OSA" (01, 02, 06, LAND, PATHS) Confirmed. No urgent or emergency wording on this page: the plan\'s red-flag line 3 had to use another AKH page (OPEN-QUESTIONS C2).',
  },
  'akh-pap': {
    publisher: 'AboutKidsHealth, SickKids',
    type: 'canadian-patient-education',
    locator:
      '[CA-org] Child fit (two fingers), first nights, cleaning, follow-up by the sleep team, home care company; urgent line "If your child is sick and you are concerned about their breathing … local emergency department" (04, 05, 06, PATHS, RRT) Confirmed. Never quote its example pressure ("5 cm H2O") or its humidifier-setting lines. Ontario-framed (home care company; Ventilator Equipment Pool). Alias: akh-pap-children.',
  },
  'akh-tonsillectomy-osa': {
    publisher: 'AboutKidsHealth, SickKids',
    type: 'canadian-patient-education',
    locator:
      '[CA-org] After-surgery "call right away" list (5 signs); bleeding or trouble breathing → closest emergency department (06; option for 02 R2) Confirmed. Its pain-medicine paragraph ("If your child is unresponsive, call 911 immediately") is held (06 R13: urgent gap on card 3).',
  },
  'akh-child-emergency': {
    publisher: 'AboutKidsHealth, SickKids',
    type: 'canadian-patient-education',
    locator:
      '[CA-org] Red flag 3, now line 6 of the "Call 911 now" tier (2026-10-13): "severe difficulty breathing", "blue lips or fingertips", "confusion or not responding as usual" → "Call 911 or go to the nearest emergency department right away" (02) Confirmed. "Asleep or awake" was removed (not on the page). It is an air-quality page, used for its general child-emergency list (02 R2; ruled "fine" under C2, 2026-10-13). 2026-10-13 (C1 check): "chest pain" is on its list and is now in the child line; its chip type is CA-org (a children\'s hospital), not government.',
  },
  'cts-css-peds-dx-2026': {
    publisher: 'Canadian Thoracic Society, Canadian Sleep Society',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] "Polysomnography remains the standard…"; home test as a second-line option for otherwise healthy children over 5 when PSG isn\'t accessible; oximetry not alone (01, 06, PATHS) Confirmed on the press release. The full guideline is blocked (403 bot check, to curl and to WebFetch). Citations point to the press release until the DOI is read (pre-publish check).',
  },
  'cts-css-peds-infographic-2026': {
    publisher: 'CTS, CSS',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] "No replacement for polysomnography"; "effectively absent" (long waits, distance, cost); age cut-off footnote (06) Confirmed',
  },
  'hlbc-ta-osa': {
    publisher: 'Healthwise content (US), published by HealthLink BC',
    type: 'international-patient-education',
    locator:
      '[INTL] Surgery often the first treatment (with CLA); under-3s watched more closely; not for snoring alone (06) Confirmed (labelled). It is the only source for 06 3.items.4 s3 and 3.note s2: a Canadian child-specific second source would be better (06 R2).',
  },
  'cts-css-driving-2014': {
    publisher: 'CTS, CSS',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] The licensing authority decides; objective CPAP use of at least 4 h on more than 70% of nights over at least 30 days (Key Message 4), framed as a licensing measure; commercial rules stricter; periodic review "for example at least every 5 years"; vendors supply compliance data; crash risk (02, 04, 05, PATHS, RRT) Confirmed. Its Table 1 (provincial rules, 2013–2014) is out of date: never use it for current rules.',
  },
  'rsbc-ccmta-18-6-1': {
    publisher: 'RoadSafetyBC, Government of BC',
    type: 'canadian-government',
    locator:
      '[CA-gov (regulator)] Standard 18.6.1 applies to all drivers (AHI ≥ 30 disqualifies unless treated; crash in the past 5 years); BC: RT-prepared download or sleep study verifies treatment; BC licence condition: stop driving and report; 2 weeks / 6 weeks improvement (02, 04, RRT) Confirmed. Plan corrections: 18.6.1 is not commercial-only; the RT download and "cease and report" are BC rules, not the national standard.',
  },
  'on-mto-reporting': {
    publisher: 'Government of Ontario, Ministry of Transportation',
    type: 'canadian-government',
    locator:
      '[CA-gov (regulator)] Physicians and nurse practitioners must report (optometrists for vision only); a mandatory report leads to suspension (02, RRT) Confirmed. The page never names sleep apnea; the form does. O. Reg. 340/94 is unread (e-Laws needs JavaScript): pre-publish check.',
  },
  'on-mto-5108e': {
    publisher: 'Ontario Ministry of Transportation',
    type: 'canadian-government',
    locator:
      '[CA-gov] Part 3 mandatory condition: OSA untreated or unsuccessfully treated with AHI ≥ 30 and daytime sleepiness (02) Confirmed',
  },
  'tc-railway-medical-rules': {
    publisher: 'Transport Canada',
    type: 'canadian-government',
    locator:
      "[CA-gov] Names sleep apnea among the conditions assessed; the railway's Chief Medical Officer decides. No usage figure. No live line cites it: it backs only the number-free release option for the held rail lines (04 E.16, 02 H15) (04) Confirmed (04 check). It replaces the plan's meaning of this id, which was the RAC handbook.",
  },
  'rac-rail-handbook-2026': {
    publisher: 'Railway Association of Canada',
    type: 'industry',
    locator:
      '[IND (industry association)] 14-day PAP report with average use of 5 h or more; yearly 30-day report. Held items only (02 H15, 04 E.16) Words confirmed on the page, but it is industry-only, so the lines are held (OPEN-QUESTIONS C20). The "≥" glyph is blank in the text layer. Reproduction is restricted by copyright.',
  },
  'on-er': {
    publisher: 'Government of Ontario, Ministry of Health',
    type: 'canadian-government',
    locator:
      '[CA-gov] "Call 911 when you need emergency care for symptoms like:" loss of consciousness, confusion, "persistent, severe chest pain", "breathing difficulty" (02 urgent emergency signs 1, 3, 4; card 11) Confirmed. Reading "can’t be woken up" as "loss of consciousness" is C\\ (02 R12). The page also says "If you need urgent medical attention for serious illness or injury, visit an ER."',
  },
  'ab-mha-emergency': {
    publisher: 'MyHealth Alberta, Government of Alberta',
    type: 'canadian-government',
    locator:
      '[CA-gov] "If you or someone with you has chest pain, trouble breathing, or severe bleeding, it could be life-threatening. Call 911 now." (02 emergency signs 1 and 3; card 11) Confirmed. "Severe bleeding" is not used.',
  },
  'health811-home': {
    publisher: 'Government of Ontario',
    type: 'canadian-government',
    locator:
      '[CA-gov] "In a medical emergency call 911 immediately." (02 emergency label and lead; LAND door 1). Also "Call 811 (TTY: 711)" (held 02 H18) Confirmed, read rendered in the desktop app\'s browser: the page is a JavaScript app and curl returns an empty shell.',
  },
  'phac-heart-attack': {
    publisher: 'Public Health Agency of Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "The most common symptom of a heart attack in both males and females is chest pain or discomfort."; "If you have any symptoms of a heart attack: … call 9-1-1 or your local emergency number" (02 emergency lead and sign 1; card 11) Confirmed. The page offers no "emergency department" option.',
  },
  'phac-stroke': {
    publisher: 'Public Health Agency of Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "Face: Is it drooping?" "Arms: Can you raise both?" "Speech: Is it slurred or jumbled?" "Time to call 9-1-1 right away." (02 emergency sign 2; card 11) Confirmed. The page links a Heart and Stroke Foundation page (a charity), not used. Keeping the stroke line is a nurse follow-up (02 R12).',
  },
  'icbc-crash-card': {
    publisher: "ICBC, BC's public auto insurer, a provincial Crown corporation",
    type: 'canadian-government',
    locator:
      '[CA-gov (Crown corporation; label the chip)] "If anyone\'s injured, call 911." (02 emergency sign 5; card 11) Confirmed (PDF text layer). The only fetched source with "911" for a crash; accepting it is a nurse follow-up (02 R12).',
  },
  'on-mto-handbook-emergencies': {
    publisher: 'Government of Ontario, Ministry of Transportation',
    type: 'canadian-government',
    locator:
      '[CA-gov] "In a collision with injuries, possible fuel leaks or serious vehicle damage, stay calm and follow these steps:" "Call for help or have someone else call." (02 emergency sign 5, supporting chip) Confirmed. It says "call for help", not 911.',
  },
  'on-mto-handbook-drowsy': {
    publisher: 'Government of Ontario, Ministry of Transportation',
    type: 'canadian-government',
    locator:
      '[CA-gov] Warning sign for every driver: "You have drifted off the road and narrowly avoided a crash." (02 stop tier: "or nearly did", C4). Held drowsy-driving line: "Pull off the road and park your vehicle in a safe, secure place."; "Lock your doors, roll up your windows and take a nap."; "Drinks containing caffeine can help you feel more alert but, if you are sleep deprived, the effects wear off quickly." (02 H4) Confirmed. No 911 line in the drowsy section; no doctor or licensing step. Ontario\'s handbook: label it "Ontario" if H4 is released.',
  },
  'hlbc-sleep-apnea': {
    publisher: 'Healthwise content (US), published by HealthLink BC',
    type: 'international-patient-education',
    locator:
      '[INTL] "Call your doctor if:" "You notice that your bed partner stops breathing, gasps, or chokes during sleep." (02 "don’t wait" tier, third chip) Confirmed (labelled). Never alone: the two Alberta pathway sources carry the line. The body has no 911 line.',
  },
  'hc-recall-philips-ra-76137': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Foam may break down; "Talk to your physician or medical device provider first before stopping or changing how you use your product"; don\'t remove the foam; clean only per the maker\'s instructions (ozone); models made before April 26, 2021; registration portal planned to close end of December 2024 (02, 05, LAND, RRT) Confirmed. Chip label must say RA-62729. "Register with the maker" advice is out of date (RRT E13, 02 H8).',
  },
  'hc-recall-philips-ra-75887': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Degraded particles could enter the air pathway (02) Confirmed. The audience is "General Public, Healthcare Professionals, Hospitals" (corrected). It gives no patient instructions. Sister listing RA-75889 not used.',
  },
  'cts-css-csrt-philips-2021': {
    publisher: 'CTS, CSS, CSRT; on css-scs.ca',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] Nightly OSA users: contact your physician and keep using in the meantime; "For all devices … discontinuing all unauthorized cleaning methods (e.g., ozone … or ultraviolet light products)"; particles → physician (02, 05, LAND, RRT) Confirmed. Scope of the cleaning line is disputed between files (02 R8 reads all devices; LAND E13 reads Philips only): OPEN-QUESTIONS C5. Its registration advice is out of date. It names a cleaner brand: never repeat it.',
  },
  'hc-recall-magnet-philips-2022': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "STOP USING the affected mask" if you or a household member, caregiver or bed partner has a listed implant (20 entries, "including but not limited to", e.g. pacemakers, stents, insulin pumps, cochlear implants); keep 15 cm away for implants not on the list; ask for a mask without magnets; lists "Wisp Youth" (02, 04, 05, 06, LAND, RRT) Confirmed. The patient-facing magnet notice. 2026-10-13 (C3, S26, N7): it has no "911" or "emergenc" wording, so the magnet line left the red-flag block; its "STOP USING" is now quoted only for the masks it names (Option A, pending the nurse: 02 R13). Liivv\'s matching masks: 4320, 4374, 4932, 4952 (through RA-64545\'s catalogue numbers).',
  },
  'hc-recall-magnet-resmed-2023': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Magnets may interfere with some implants (02, 04, 05, 06, LAND, RRT) Confirmed. No "stop using" instruction and no group named. Since ruling C3 (2026-10-13) no copy applies "stop" to these masks; readers check with the maker and their health care team. Liivv\'s 11 catalogue-number matches are in scratchpad/rulings/c3-magnets.verified.json. French title: "Masques ResMed Airtouch et Airfit".',
  },
  'hc-recall-magnet-philips-masks-2022': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Type II health product recall; audience General public, Healthcare, Industry. "The affected masks contain magnets which can potentially affect the functioning and/or induce the movement/dislocation of medical implants or medical devices that can be impacted by the magnetic fields."; "Contact the manufacturer if you require additional information." 48 catalogue numbers, all lots (02 card 6; 04 magnetNote; LAND badge and product notice; the magnet register, N7) Confirmed (added 2026-10-13, C3 and N7). No implant list and no distance. Wisp Youth is 1109298; Liivv\'s paediatric Wisp (SKU 1104953) is not listed.',
  },
  'hc-recall-magnet-novastar-2023': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Type I; audience Healthcare; a non-invasive ventilation mask with magnets. "Contact the manufacturer if you require additional information." Magnet register only (N7); never a consumer chip Confirmed (added 2026-10-13). Liivv does not sell it (store keyword search, GET only).',
  },
  'cts-css-csrt-magnets-2022': {
    publisher: 'on css-scs.ca',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] Switch to a non-magnetic mask if available; consult your physician (02) Confirmed. Always beside the Health Canada notice. No longer chipped on 02 card 6 since ruling N7 (2026-10-13: "Health Canada based information"); kept in the register.',
  },
  'fda-resmed-magnets-2024': {
    publisher: 'U.S. Food and Drug Administration',
    type: 'international-guideline',
    locator:
      '[INTL] Stop use of the recalled ResMed mask and switch to a non-magnetic mask (02 R3) Confirmed. Chip: "International guidance". Never alone. US phone and MedWatch not used. No longer chipped anywhere since rulings C3 and N7 (2026-10-13): there is no stop rule for masks whose Health Canada notice doesn\'t say "stop".',
  },
  'hc-recall-asv-2015': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Type I; serious safety concern in symptomatic chronic heart failure with reduced ejection fraction; "33.5% increased risk of cardiovascular death" (03, RRT) Confirmed. Archived. It gives no ejection-fraction number and no patient instructions: never print "≤45%" from it. Newer advisory: pre-publish check.',
  },
  'pmra-uv-ozone': {
    publisher: 'Health Canada, Pest Management Regulatory Agency',
    type: 'canadian-government',
    locator:
      '[CA-gov] General risks of ozone-generating devices (02, 05) Confirmed, narrowly. It doesn\'t mention CPAP. Its UV-burn and "not enough evidence" lines were moved to held in 05 (E13, E14) and narrowed in 02.',
  },
  'hc-buying-devices-online': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      "[CA-gov] Class II–IV devices must be licensed; risks of buying online (recalled, counterfeit, unlicensed); avoid sites with no street address or phone; ask your provider (02, RRT) Confirmed. It doesn't name MDALL.",
  },
  'hc-mdall': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Licence lookup (02, 03, LAND) Confirmed. The BC guide links an older address; use this one.',
  },
  'hc-report-device-problem': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Everyone is encouraged to report; you can report with your provider (02, RRT) Confirmed. No phone number on the page (02 H10).',
  },
  'hc-device-problem-form': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] The reporting form itself (02, 05) Confirmed. 05 cited it as hc-report-device-problem; now merged.',
  },
  'hc-about-device-problems': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator: '[CA-gov] What counts as a device problem (02) Confirmed',
  },
  'hc-recalls-safety-alerts': {
    publisher: 'Government of Canada, Health Canada and partner agencies',
    type: 'canadian-government',
    locator:
      '[CA-gov] Link target for recalls. It is a multi-agency site, so the copy says "the Government of Canada\'s recalls and safety alerts" (05, LAND) Confirmed',
  },
  'hc-mdall-api-doc': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "I=Issued/Active, M=Merge, O=Discontinued at Renewal" (machine guide Chart A; C17 store facts) Confirmed',
  },
  'mdall-lic-106650': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator: '[CA-gov] "AIRSENSE 11 AUTOSET"; "Device class: 2" (machine guide) Confirmed',
  },
  'mdall-lic-93717': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "AIRSENSE 10 AUTOSET"; identifiers include 37207 and 37208 (machine guide) Confirmed',
  },
  'mdall-lic-110422': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "AIRCURVE 11 ASV (CAN)"; "AIRCURVE 11 VAUTO (CAN)" (machine guide) Confirmed. The store\'s AirCurve SKUs (38040, 38043) don\'t match the Canadian identifiers (machine guide D14)',
  },
  'mdall-lic-99052': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator: '[CA-gov] "AIRMINI DC/DC CONVERTER" is on the same licence (machine guide) Confirmed',
  },
  'mdall-lic-105749': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "DREAMSTATION 2 AUTO CPAP ADVANCED", identifier "CAX521H12C" (machine guide) Confirmed',
  },
  'mdall-lic-113188': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "YH-680B"; heated tubing YHT-01; holder Suzhou Yuyue Medical Technology Co., Ltd (machine guide) Confirmed',
  },
  'mdall-lic-112836': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator: '[CA-gov] Lists YH-680A and "YH-680B" (machine guide) Confirmed',
  },
  'mdall-lic-102774': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] "Licence name: TRANSCEND MICRO CPAP"; identifier 506001; holder Somnetics International, Inc. (machine guide) Confirmed. No "510" device or identifier on any Transcend licence (a search, not proof: machine guide E2)',
  },
  'hc-recall-resmed-2015': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Type III, archived. "software interpreting static electricity as a fault with the tubing"; names AirSense 10 AutoSet model numbers 37207 and 37208, and AirCurve 10 VAuto and ASV (machine guide Chart A) Confirmed. Health Canada\'s site search does not find it for "AirSense": the search misses archived notices (machine guide D2)',
  },
  'csrt-rrt': {
    publisher: 'Canadian Society of Respiratory Therapists',
    type: 'canadian-guideline',
    locator:
      '[CA-clin (national society)] What the RRT credential is; colleges vs the CSRT credential "(e.g. BC, NT, NU, and YT)" (01, RRT) Confirmed. It doesn\'t mention sleep apnea. The province list is "e.g.", not complete.',
  },
  'crto-pap': {
    publisher: 'College of Respiratory Therapists of Ontario',
    type: 'canadian-government',
    locator:
      '[CA-reg] Positive pressure "falls under the controlled act authorized to RTs"; the College has no jurisdiction over non-regulated people applying CPAP (04, RRT) Confirmed. Dated 2012: confirm it is still current (pre-publish check).',
  },
  'crto-standard-5': {
    publisher: 'CRTO Standards of Practice',
    type: 'canadian-government',
    locator:
      '[CA-reg (Ontario only)] Ontario RTs must tell patients they can pick another provider or product, "and, where one exists, provide the name of at least one comparable service provider" (02, 03, 04, RRT) Confirmed. Copy scopes it "In Ontario". The duty to name a provider conflicts with the no-other-retailer rule (OPEN-QUESTIONS S25). Aliases: crto-std5-conflict.',
  },
  'crto-community-rt': {
    publisher: 'CRTO',
    type: 'canadian-government',
    locator:
      '[CA-reg (Ontario only)] "It is your right to choose your community respiratory therapy provider"; not obliged to buy from the RT who recommends equipment; care not affected; ADP list of providers; compensation disclosure (02, LAND, RRT) Confirmed. Mostly about home oxygen; names CPAP/BiPAP once. Aliases: crto-choose-provider, crto-community-rt-public.',
  },
  'bc-pap-buyers-guide': {
    publisher: 'BC Ministry of Health',
    type: 'canadian-government',
    locator:
      '[CA-gov] Prescribed after assessment and testing; APAP and BiPAP "should only be prescribed by a Sleep Specialist"; "settings should only be adjusted by trained professionals"; follow-up at 7 days, 2–4 weeks (oximetry), 30 and 60 days; machines 3–5 years, accessories 3–12 months; licence; vendor with an RRT or RPSGT; trials, warranties, loans; data on servers outside Canada; MSP doesn\'t pay; standard PAP can worsen central apnea; altitude; "online PAP providers are not recommended" for new users (held or disputed) (02–05, FUND, LAND, PATHS, RRT) Confirmed (byte-identical on re-download). A BC guide, applied nationally by the plan\'s decision (OPEN-QUESTIONS C12). Never quote its comfort-setting text. It names three private BC clinics: never repeat them.',
  },
  'nihb-pap': {
    publisher: 'Indigenous Services Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] Covered machines (CPAP, APAP; BPAP for some) and supplies; replacement guidelines are "a maximum number" (filters 14 a year; interfaces, tubing and chin straps 2 a year; machine 1 every 5 years); prior approval; RRT or RN on staff; RRTs recommend once therapy and pressures are prescribed (in AB, SK, MB, ON, QC, NS, NB, NL); rental or purchase; doesn\'t cover sleep tests; accepts level I, III and IV studies (01, 04, 05, 06, FUND, LAND, PATHS, RRT) Confirmed. Internal conflict: blanket prior approval vs filters "No"; replacement prescription vs "Initial request only" (OPEN-QUESTIONS C27). Alias: fed-nihb-respiratory.',
  },
  'cda-oat': {
    publisher: 'Canadian Dental Association',
    type: 'canadian-guideline',
    locator:
      '[CA-clin] Medical assessment first; dentist works with the physician; snoring may indicate OSA (03, PATHS) Confirmed. Its "work directly with an attending physician" line is worded for snoring, so CLA backs the dentist line too.',
  },
  'catsa-cpap': {
    publisher: 'Canadian Air Transport Security Authority',
    type: 'canadian-government',
    locator:
      '[CA-gov (federal Crown corporation)] Carry-on and checked: yes; screening alternatives (clear bag, or tubes and mask stay in the case); distilled water exempt; documentation not required (05, LAND, PATHS) Confirmed. Nothing on using the device on board.',
  },
  'catsa-respiratory-2025': {
    publisher: 'CATSA',
    type: 'canadian-government',
    locator:
      '[CA-gov] Unpack the main unit into a bin; distilled water in separate containers shown to the officer; explosive trace screening (05) Confirmed. Pre-publish: still linked from catsa-acsta.gc.ca?',
  },
  'catsa-medical-items': {
    publisher: 'CATSA',
    type: 'canadian-government',
    locator: '[CA-gov] Family and Accessible Line; contact CATSA 48 hours ahead (05) Confirmed',
  },
  'cta-mobility-aids': {
    publisher: 'Canadian Transportation Agency',
    type: 'canadian-government',
    locator:
      '[CA-gov (regulator)] Tell your reservation agent about the device, "including whether it uses batteries or needs an onboard power supply" (05) Confirmed (added by the 05 check). It doesn\'t name CPAP.',
  },
  'cta-assistive-devices-guide-2020': {
    publisher: 'CTA',
    type: 'canadian-government',
    locator:
      '[CA-gov] Second source for "tell your airline when you book" (05) Confirmed. It doesn\'t name CPAP.',
  },
  'gac-travel-medical-device': {
    publisher: 'Government of Canada, travel.gc.ca',
    type: 'canadian-government',
    locator:
      "[CA-gov] The two-carry-on limit doesn't apply to medical equipment; carry documents for your condition (05) Confirmed",
  },
  'atpdr-s49': {
    publisher: 'Justice Laws, Government of Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov (regulation)] Held items only (LAND E6, 05 E2, PATHS). s.49 covers "any small assistive device that the person needs during travel"; its examples don\'t include CPAP Confirmed as held. It doesn\'t name CPAP, so no live line rests on it.',
  },
  'nihb-eligibility': {
    publisher: 'Indigenous Services Canada',
    type: 'canadian-government',
    locator:
      "[CA-gov] Eligibility; self-government and health-authority exceptions (Nisga'a, Nunatsiavut, Nunavik, James Bay Cree, FNHA, Bigstone, Akwesasne) (06, FUND) Confirmed. Diabetes Ch06 asked for the same page (M11).",
  },
  'nihb-general-policies': {
    publisher: 'Indigenous Services Canada',
    type: 'canadian-government',
    locator:
      "[CA-gov] Prior approval form to the regional office for the provider's region; registered providers paid directly; client reimbursement within one year; Canadian online stores (with a recognized provider) (FUND) Confirmed",
  },
  'nihb-contact': {
    publisher: 'Indigenous Services Canada',
    type: 'canadian-government',
    locator: '[CA-gov] Regional office numbers ("Find your office" link) (FUND) Confirmed',
  },
  'fnha-mse': {
    publisher: 'First Nations Health Authority, Health Benefits',
    type: 'canadian-government',
    locator:
      '[CA-FN] Eligibility (status First Nations in BC; infants up to 24 months); "Oxygen, sleep and breathing aids"; registered providers bill PBC directly; 1-855-550-5454 (FUND) Confirmed. The phone sits under a sentence that starts with the dental plan (FUND D-10).',
  },
  'fnha-mse-fee-2026': {
    publisher: 'FNHA',
    type: 'canadian-government',
    locator:
      '[CA-FN] CPAP, APAP and BiPAP machines (pre-determination required; 1 every 5 years); PAP supplies; provider trial attestation (not used, FUND R-11) (FUND) Confirmed (added by the funding check; closed FUND D-11). Dollar amounts and supply counts not shown.',
  },
  'fed-vac-poc9': {
    publisher: 'Veterans Affairs Canada',
    type: 'canadian-government',
    locator:
      '[CA-gov] CPAP, APAP, BiPAP; residual after the provincial plan for non-entitled conditions; claims within 18 months; 1-866-522-2122 (06, FUND) Confirmed. Program French name: PDC 9.',
  },
  'fed-cra-medical': {
    publisher: 'Canada Revenue Agency',
    type: 'canadian-government',
    locator:
      '[CA-gov] CPAP machine "– prescription needed"; lesser of 3% of net income or $2,834 (2025 returns); Quebec → Revenu Québec; keep receipts (FUND, PATHS) Confirmed. The address without "on-your" (in the 2026-10-12 leads and the Diabetes register) is a 404: flag it to the Diabetes and Ostomy registers.',
  },
  'cra-rc4065-2025': {
    publisher: 'Canada Revenue Agency',
    type: 'canadian-government',
    locator:
      '[CA-gov] You can claim a CPAP bought with a prescription; what receipts should show (06) Confirmed (06 check, under the old id fed-cra-medical). New id from the consolidation. A yearly guide: recheck the edition each tax year.',
  },
  'cra-contact': {
    publisher: 'CRA',
    type: 'canadian-government',
    locator: '[CA-gov] 1-800-959-8281 (provinces) (FUND) Confirmed',
  },
  'on-adp-respiratory': {
    publisher: 'Government of Ontario, Assistive Devices Program',
    type: 'canadian-government',
    locator:
      '[CA-gov] 75% of the ADP price (100% on OW, ODSP, ACSD); buy from an ADP-registered business; see a doctor at an ADP-registered sleep clinic; buying before the steps means paying the full cost; no cover for replacement masks and headgear, oral appliances, ASV or repairs; long-term care exception; WSIB and Group "A" veterans excluded (01, 05, 06, FUND, PATHS, RRT) Confirmed. The page has no in-lab-study wording: that is in the manual (policy 420).',
  },
  'on-adp-resp-manual-2024': {
    publisher: 'Ontario Ministry of Health, Assistive Devices Program',
    type: 'canadian-government',
    locator:
      "[CA-gov] 225.01 package (incl. a basic mask and headgear); 420: a sleep-clinic physician and a level 1 PSG at an ADP-registered sleep lab; 500: PAP systems expected to last 5 years; 505: re-application (05, FUND) Confirmed. Still the manual linked from ADP's manuals index (updated 2026-09-03). A 2025-12-12 ontario.ca file returned 403 and isn't linked from that index.",
  },
  'on-adp-main': {
    publisher: 'Government of Ontario',
    type: 'canadian-government',
    locator:
      '[CA-gov] "We do not consider your income"; no repair costs (FUND) Confirmed. Its phone numbers are the complaints line only, so they are held (FUND E-16). The Diabetes page shows the same numbers.',
  },
  'on-odsp-msn': {
    publisher: 'Ontario Ministry of Children, Community and Social Services',
    type: 'canadian-government',
    locator:
      '[CA-gov] PAP supplies list (includes an oral appliance and a "Sanitizing unit"); for recipients diagnosed with OSA; replacement once the ministry approves the need (05, FUND) Confirmed. The published schedule has no replacement frequencies (05 business flag 2).',
  },
  'on-odsp-msn-directive': {
    publisher: 'Government of Ontario',
    type: 'canadian-government',
    locator:
      '[CA-gov] Pay direct, or add to the monthly payment; actual costs paid on receipts; vendor order releases only if ministry-approved (FUND) Confirmed',
  },
  'sk-sail-cpap': {
    publisher: 'Government of Saskatchewan',
    type: 'canadian-government',
    locator:
      '[CA-gov] CPAP loan for a $275 fee, repairs for 5 years, may be extended; referral and study levels; Level 3 in Saskatchewan; supplies client-paid (free on SHB/FHB); no reimbursement for private purchases; one machine at a time; 306-787-7121 / 1-888-787-8996 (FUND) Confirmed. Pre-publish: still the current bulletin?',
  },
  'sk-sail': {
    publisher: 'Government of Saskatchewan',
    type: 'canadian-government',
    locator:
      '[CA-gov] Eligibility; excludes people getting benefits from SGI, WCB, NIHB or Veterans Affairs; phones (FUND) Confirmed',
  },
  'mb-misericordia-cpap': {
    publisher:
      'Sleep Disorder Centre, Misericordia Health Centre, operated by the Winnipeg Regional Health Authority',
    type: 'canadian-government',
    locator:
      "[CA-gov (regional health authority)] For people prescribed CPAP by the SDC: a trial of at least a month (≥70% of nights, ≥4 h, as the program's rule); $500 co-pay; replacement every 5 years; client pays supplies, delivery, repairs; 204-788-8570, 1-866-281-0410 (FUND) Confirmed. It names two private suppliers: never repeat them. Pre-publish: is the $500 co-pay current?",
  },
  'mb-cpap-release-2023': {
    publisher: 'Government of Manitoba',
    type: 'canadian-government',
    locator:
      '[CA-gov] Held only (FUND E-5: the at-home testing route through an "interim partnership agreement") (FUND) Words confirmed; currency unconfirmed, so no live line rests on it.',
  },
  'bc-pharmacare-not-covered': {
    publisher: 'Government of BC',
    type: 'canadian-government',
    locator: "[CA-gov] PharmaCare doesn't pay for CPAP machines (FUND) Confirmed",
  },
  'bc-pharmacare-contact': {
    publisher: 'Government of BC',
    type: 'canadian-government',
    locator:
      '[CA-gov] 604-683-7151; 1-800-663-7100 (FUND) Confirmed. Same id as on the Diabetes register.',
  },
  'bc-bcea-breathing': {
    publisher: 'Government of BC, Ministry of Social Development and Poverty Reduction',
    type: 'canadian-government',
    locator:
      '[CA-gov] CPAP/BiPAP and jaw devices for eligible recipients; RT confirms need; approval before purchase; PAP devices replaced after 5 years, accessories 1 year; co-funding (05, FUND) Confirmed',
  },
  'bc-income-assistance-access': {
    publisher: 'Government of BC',
    type: 'canadian-government',
    locator: '[CA-gov] 1-866-866-0800 (FUND) Confirmed',
  },
  'ab-aish': {
    publisher: 'Government of Alberta',
    type: 'canadian-government',
    locator:
      '[CA-gov] CPAP device and supplies as an AISH health-related personal benefit; some benefits may need to be repaid (FUND) Confirmed. Open: do ADAP clients get the same (FUND pre-publish 5)?',
  },
  'qc-inesss-osa': {
    publisher: "Institut national d'excellence en santé et en services sociaux",
    type: 'canadian-government',
    locator:
      '[CA-gov (Quebec HTA)] In figures published in 2024: 74% had private insurance; some had no coverage and only the medical expense tax credit (FUND) Confirmed. The full report PDF and RAMQ (403) were not read. The April 2023 Quebec measure is held (FUND E-6).',
  },
  'nb-sd-respiratory': {
    publisher: 'Government of New Brunswick, Social Development',
    type: 'canadian-government',
    locator:
      '[CA-gov] CPAP up to $1,800, BPAP up to $3,150, masks and supplies, for Social Development clients and dependants with no other coverage; 506-453-2001 (FUND, PATHS) Confirmed. Replacement periods are in an unread policy (FUND E-8).',
  },
  'crto-virtual-care-ppg-2023': {
    publisher: 'CRTO',
    type: 'canadian-government',
    locator:
      "[CA-reg] The patient's location decides; out-of-province duties; consent, privacy, emergency plan, documentation; insurance Confirmed",
  },
  'crto-orders-ppg': {
    publisher: 'CRTO',
    type: 'canadian-government',
    locator:
      '[CA-reg] Elements of a valid order; authorized acts Partly: PAP as act #4 is an inference from the 2012 FAQ (RRT P1)',
  },
  'crto-std6-consent': {
    publisher: 'CRTO',
    type: 'canadian-government',
    locator: '[CA-reg] Consent elements; withdrawal Confirmed',
  },
  'crto-std7-documentation': {
    publisher: 'CRTO',
    type: 'canadian-government',
    locator: '[CA-reg] Documentation contents Confirmed',
  },
  'crto-regulator-links': {
    publisher: 'CRTO',
    type: 'canadian-government',
    locator: '[CA-reg] Names and links of the 8 regulators Confirmed',
  },
  'ab-crta-standards': {
    publisher: 'College of Respiratory Therapists of Alberta',
    type: 'canadian-government',
    locator:
      '[CA-reg] Good standing; documentation (2.4); reporting unsafe practice. No virtual-care standard Confirmed',
  },
  'ab-crta-sop-draft-2023': {
    publisher: 'CRTA',
    type: 'canadian-government',
    locator:
      '[CA-reg (draft)] Draft virtual-care standard 12 (restricted activities 12.2.4–12.2.6; identification 12.7.1.1) Confirmed as a draft only. Its in-force status is unknown (RRT E1, E14).',
  },
  'sk-rt-act': {
    publisher: 'Saskatchewan, via the SCRT',
    type: 'canadian-government',
    locator: '[CA-reg (Act)] s. 22 title protection. No virtual-care text Confirmed',
  },
  'mb-marrt-licensing': {
    publisher: 'Manitoba Association of Registered Respiratory Therapists',
    type: 'canadian-government',
    locator: '[CA-reg] Out-of-province RTs must hold a Manitoba licence Confirmed',
  },
  'mb-telepractice-2020': {
    publisher: 'Manitoba health regulatory colleges, incl. MARRT',
    type: 'canadian-government',
    locator:
      '[CA-reg] Consult your own college; others present, emergency contacts, adverse-event plan Confirmed',
  },
  'mb-marrt-cpg': {
    publisher: 'MARRT',
    type: 'canadian-government',
    locator:
      '[CA-reg] RRTs follow employer telepractice guidelines and policies Confirmed (added by the RRT check)',
  },
  'qc-telehealth-practice': {
    publisher: 'Gouvernement du Québec',
    type: 'canadian-government',
    locator: '[CA-gov] Quebec telehealth rules Confirmed',
  },
  'qc-tsq-fiche-09-2024': {
    publisher: 'Télésanté Québec',
    type: 'canadian-government',
    locator:
      '[CA-gov] Teleconsultations across the Quebec border (written for network professionals) Confirmed',
  },
  'nb-nbart-home': {
    publisher: 'New Brunswick Association of Respiratory Therapists',
    type: 'canadian-government',
    locator: '[CA-reg] Regulator statement Confirmed',
  },
  'nb-nbart-licence-guide': {
    publisher: 'NBART',
    type: 'canadian-government',
    locator:
      '[CA-reg] No practice before licensing Confirmed. The audience is internationally trained applicants.',
  },
  'ns-nsrrt-home': {
    publisher: 'Nova Scotia regulator of RRTs, formerly NSCRT',
    type: 'canadian-government',
    locator: '[CA-reg] Regulator name Confirmed',
  },
  'ns-nsrrt-am-i-practising': {
    publisher: 'NSRRT',
    type: 'canadian-government',
    locator: '[CA-reg] Equipment sales count as RT practice in NS Confirmed',
  },
  'ns-nsrrt-telehealth-orders-2023': {
    publisher: 'NSCRT, now NSRRT',
    type: 'canadian-government',
    locator:
      '[CA-reg] Orders from out-of-province telehealth prescribers Confirmed. The date is in the file name only.',
  },
  'pe-cahppei-home': {
    publisher: 'College of Allied Health Professionals of PEI',
    type: 'canadian-government',
    locator: '[CA-reg] Regulates RTs in PEI Confirmed',
  },
  'pe-rhpa': {
    publisher: 'Government of PEI',
    type: 'canadian-government',
    locator: '[CA-reg (Act)] s. 2(3): only members practise Confirmed',
  },
  'nl-nlchp-telepractice': {
    publisher: 'Newfoundland and Labrador Council of Health Professionals',
    type: 'canadian-government',
    locator: '[CA-reg] Registration where the patient is; consent; insurance Confirmed',
  },
  'bc-hpoa': {
    publisher: 'BC Ministry of Health',
    type: 'canadian-government',
    locator:
      '[CA-gov] RTs move under the CPSBC in 2027 (BC is unregulated today) Confirmed. Recheck in 2027.',
  },
  'on-phipa': {
    publisher: 'Ontario e-Laws',
    type: 'canadian-government',
    locator:
      '[CA-gov (Act)] Health information custodians and agents Confirmed (the page is script-rendered, so it was read from the export)',
  },
  'opc-provincial-laws': {
    publisher: 'Office of the Privacy Commissioner of Canada',
    type: 'canadian-government',
    locator: '[CA-gov] Which privacy law applies Confirmed',
  },
  'opc-health-info-contacts': {
    publisher: 'OPC',
    type: 'canadian-government',
    locator: '[CA-gov] Private health practitioner contacts by province Confirmed',
  },
  'hlbc-811': {
    publisher: 'HealthLink BC, BC Ministry of Health',
    type: 'canadian-government',
    locator:
      '[CA-gov] "Is it an emergency? … Call 9-1-1 or the local emergency number immediately": the general urgent line on every service surface (RRT); since ruling C1, also the 911 tier\'s label and lead (02) and landing door 1 Confirmed (added by the RRT check; re-checked for C1). The footer line is on every HealthLink BC page fetched, including the Healthwise sleep apnea and CPAP pages.',
  },
  'ms-bookings-services': {
    publisher: 'Microsoft Learn',
    type: 'other',
    locator:
      '[OPS] Bookings service fields and hiding a service. Never a chip; supports no health claim Confirmed (operational reference only)',
  },
  'resmed-ca-tipsheet-2021': {
    publisher: 'ResMed, manufacturer',
    type: 'industry',
    locator:
      '[IND] Only the resupply planner\'s labelled "Maker" column, which the plan approved by name (05) Confirmed (labelled). Its only other use (worn-part signs) was removed by the 05 check. The PDF ends with a store locator: cite it in the chip, never link it from the figure. Its "new technology" line is not used. Keeping the column at all is a ruling (OPEN-QUESTIONS C13).',
  },
  'resmed-airsense11-ug': {
    publisher: 'ResMed, manufacturer',
    type: 'industry',
    locator:
      '[IND (Maker)] Product specifications only, machine guide Chart B: "40 oz (1130 g)"; "27 dBA with uncertainty of 2 dBA"; "The device is equipped with cellular communication"; "SD card (not available in all devices)"; type "ResMed\'s premium auto-adjusting pressure device" Confirmed (labelled Maker). Never for a clinical claim.',
  },
  'resmed-airsense10-ug-eur': {
    publisher: 'ResMed, manufacturer',
    type: 'industry',
    locator:
      '[IND (Maker)] Chart B: "116 mm x 255 mm x 150 mm 22 mm 1248 g" (labels above the values); "auto-adjusting pressure devices" Confirmed (labelled Maker). European edition; the Canadian device may differ (machine guide D12).',
  },
  'resmed-aircurve11-ug': {
    publisher: 'ResMed, manufacturer',
    type: 'industry',
    locator:
      '[IND (Maker)] Chart B: "43 oz (1229 g)"; "Your sleep therapy data may be transferred to your care provider via SD Card (if provided)."; "The AirCurve 11 ASV is a positive airway pressure device that belongs to the adaptive servo-ventilator category." Confirmed (labelled Maker)',
  },
  'resmed-aircurve11-product-guide': {
    publisher: 'ResMed US, manufacturer',
    type: 'industry',
    locator:
      '[IND (Maker)] Chart B: "39020 – Includes HumidAir™ 11 standard water tub and ClimateLineAir 11 tubing" (39023 the same) Confirmed (labelled Maker). It also lists pressure ranges, which are never used.',
  },
  'resmed-aircurve11-page': {
    publisher: 'ResMed US, manufacturer',
    type: 'industry',
    locator:
      '[IND (Maker)] Type labels only: "adaptive servo-ventilation bilevel PAP device"; VAuto "is an auto-adjusting bilevel machine for obstructive sleep apnea" (machine guide card 1, ASV card, Chart A) Confirmed (labelled Maker). Its central-apnea indication and "LVEF ≤ 45%" are not used (machine guide E4). A maker product page: cite in the chip, never as a buy link.',
  },
  'resmed-airmini-ug': {
    publisher: 'ResMed, manufacturer',
    type: 'industry',
    locator:
      '[IND (Maker)] Chart B and card 2 item 6: "10.6 oz (300 g)"; "29 dBA with uncertainty of 2 dBA"; "The HumidX and HumidX Plus are waterless humidifiers."; "Use only ResMed AirMini parts, masks and accessories with the machine."; "The AirMini self-adjusting system" Confirmed (labelled Maker)',
  },
  'philips-ds2-manual': {
    publisher: 'Philips, manufacturer, 2025',
    type: 'industry',
    locator:
      '[IND (Maker)] Chart B: "Weight (empty water tank without power supply) 1040 g (2.29 lbs)"; "Bluetooth wireless technology and DreamMapper are not available in all markets."; "Only use a Philips Respironics DC power cord and battery adapter cable." Confirmed (labelled Maker). The manual doesn\'t state a region.',
  },
  'philips-ds2-leaflet': {
    publisher: 'Philips, manufacturer; US',
    type: 'industry',
    locator:
      '[IND (Maker)] Chart A type: "Modes: CPAP, Auto CPAP" Confirmed (labelled Maker). It also lists pressure and ramp settings, which are never used.',
  },
  'yuwell-yh680-image': {
    publisher: 'Yuwell, manufacturer',
    type: 'industry',
    locator:
      '[IND (Maker)] Chart A and B: "Integrated Humidifier"; "Auto Heated Tube"; "Mode CPAP Auto CPAP"; "Noise 27dBA±2dBA"; "Cloud Data Management" Partly: read by eye from the image; it also shows a pressure range, never copied; weight, size, test standard and data detail not stated (machine guide D11, E6).',
  },
  'transcend-micro-manual': {
    publisher: 'Transcend / Somnetics, manufacturer',
    type: 'industry',
    locator:
      '[IND (Maker)] Chart A and B: "The Transcend® Micro™ is Transcend\'s smallest and lightest Continuous Positive Airway Pressure (CPAP) device."; "Transcend Micro weight: 0.48 lbs (219.5g)"; "NOTE: The Transcend Micro is compatible with all the CPAP masks with standard 22mm connection"; "The Transcend AirMist HME assembly is sold separately"; "Sound pressure level reported in a typical use environment" Confirmed (labelled Maker). Hosted on the file server of the maker\'s own direct-to-consumer CPAP shop: the shop pages are never cited; whether the PDF may be is an owner question (machine guide D1). Its noise test conditions include a pressure figure, never copied.',
  },
  'on-returns-exchanges': {
    publisher: 'Government of Ontario',
    type: 'canadian-government',
    locator:
      '[CA-gov] The Act "does not provide a general right to return or exchange goods." (LAND returnsLine) Confirmed',
  },
  'on-shopping-online': {
    publisher: 'Government of Ontario',
    type: 'canadian-government',
    locator:
      '[CA-gov] "There are no requirements for businesses to provide returns or exchanges"; a refund if "the item is not delivered within 30 days of the delivery date in the contract" Confirmed',
  },
  'on-cpa-2002': {
    publisher: 'Ontario',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 9(3): a term that "purports to negate or vary any implied condition or warranty under the Sale of Goods Act … is void."; s. 40(1): cancel "until seven days after the consumer receives a copy of the agreement if, (a) the supplier did not disclose"; s. 26 (late delivery); s. 38(3) "the consumer has accessed the information" (B.2 checkout and policy) Confirmed. CPA 2023: "THIS ACT IS NOT YET IN FORCE."',
  },
  'on-reg-17-05': {
    publisher: 'Ontario',
    type: 'canadian-government',
    locator:
      '[CA-reg (regulation)] s. 32 para 11 (extra rights on "cancellations, returns, exchanges and refunds") and para 14: "Any other restrictions, limitations and conditions that would be imposed by the supplier."; s. 2 para 3: "A professional service provided at any of the following facilities is exempt" (a pharmacy) Confirmed. Whether the C26 validation is an exempt professional service is for legal review',
  },
  'qc-opc-online-advice': {
    publisher: 'Office de la protection du consommateur, Québec',
    type: 'canadian-government',
    locator:
      '[CA-gov] "The law does not require merchants to refund, exchange or credit an item that you no longer want."; "They must repair, exchange or refund the defective item." (LAND returnsLine) Confirmed',
  },
  'qc-cpa-p40-1': {
    publisher: 'Québec',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 54.4: "(k) the applicable cancellation, rescission, return, exchange and refund conditions, if any"; s. 261: "No person may derogate from this Act by private agreement."; ss. 37–38 (fit for use; durable); ss. 54.8, 54.9, 54.13 ("The merchant shall assume the reasonable costs of restitution."), 54.14 (B.2) Confirmed. s. 38.1 (good working order) lists no masks or supplies',
  },
  'bc-cpbc-selling-online': {
    publisher: 'Consumer Protection BC',
    type: 'canadian-government',
    locator:
      '[CA-gov (regulator)] "If you do not have return, exchange, cancellation or refund policies, you must still disclose that"; "Beyond that, as a business, you can set your own refund, return and exchange policies." (LAND returnsLine) Confirmed. BC\'s rules changed on August 1, 2026',
  },
  'bc-bpcpa': {
    publisher: 'BC',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 18.2(q) "the supplier\'s return, exchange, cancellation and refund policies"; s. 47(2) "requires the consumer to access the information"; s. 49(1)(c) (30 days); s. 50 (refund within 15 days); s. 51(4): "The supplier must accept the goods returned under subsection (1) if the goods are unused"; s. 52 (credit-card reversal) (B.2) Confirmed',
  },
  'bc-sga': {
    publisher: 'BC',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 18(b)–(c) "merchantable quality" and "durable for a reasonable period of time"; s. 20(2): a term that "purports to negative or in any way diminish the conditions or warranties under sections 17, 18 and 19" is void (B.2 policy) Confirmed',
  },
  'ab-isr-81-2001': {
    publisher: 'Alberta',
    type: 'canadian-government',
    locator:
      '[CA-reg (regulation)] s. 4(1)(a)(xii): "the supplier\'s cancellation, return, exchange and refund policies, if any;"; s. 6 (cancellation); s. 10(5): "The supplier is responsible for the reasonable cost of returning goods under subsection (2)."; s. 12(1): "may request the credit card issuer to cancel or reverse the credit card charge and any associated interest or other charges" (B.2) Confirmed. Applies over $50',
  },
  'ab-cpa': {
    publisher: 'Alberta',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 6(3)(d): an unfair practice "to make a representation that a consumer transaction involves or does not involve rights, remedies or obligations that is different from the fact."; s. 2(1): waivers void Confirmed',
  },
  'ab-sga': {
    publisher: 'Alberta',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 16(4) merchantable quality; s. 54: implied terms "may be negatived or varied by express agreement" Confirmed',
  },
  'sk-cpbp-regs': {
    publisher: 'Saskatchewan',
    type: 'canadian-government',
    locator:
      '[CA-reg (regulation)] s. 3-5: "(p) the supplier\'s cancellation, return, exchange and refund policies, if any, related to the contract"; ss. 3-2, 3-6, 3-8 (disclosure and cancellation) Confirmed (section numbers corrected by the checker; the PDF says "This consolidation is not official.")',
  },
  'sk-cpbpa': {
    publisher: 'Saskatchewan',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 19: "(g) that the consumer product and all its components are to be durable for a reasonable period"; s. 15(1): an agreement that states or implies "that any right or remedy provided by this Part… is in any way limited, modified or abrogated" is void (B.2 policy) Confirmed',
  },
  'mb-returns-exchanges': {
    publisher: 'Manitoba Consumer Protection Office',
    type: 'canadian-government',
    locator:
      '[CA-gov] Merchants "are under no obligation to do so."; "If merchandise is faulty or defective, the seller has an option to repair, replace or refund it as either cash or credit note." (LAND returnsLine) Confirmed',
  },
  'mb-cpa': {
    publisher: 'Manitoba',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 58(1): "Notwithstanding any agreement to the contrary, the following conditions or warranties on the part of the seller are implied in every retail sale of goods"; s. 129(1) (cancel "before accepting delivery"); s. 130(1)(b) (30 days) (B.2) Confirmed',
  },
  'mb-reg-176-2000': {
    publisher: 'Manitoba',
    type: 'canadian-government',
    locator:
      '[CA-reg (regulation)] s. 3(1): "(m) any restrictions or conditions that the seller may apply… (n) the seller\'s exchange, cancellation and refund policies, if applicable" Confirmed',
  },
  'nb-cpwla': {
    publisher: 'New Brunswick',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 24: "the parties cannot agree to exclude or restrict any warranty or remedy provided by this Act"; s. 12(1) durable "for a reasonable period of time" (B.2 policy) Confirmed. No internet-sales rules are in force in NB (FCNB notice of 17 Feb 2026); the FCNB returns page was blocked (403)',
  },
  'ns-isr': {
    publisher: 'Nova Scotia',
    type: 'canadian-government',
    locator:
      '[CA-reg (regulation)] s. 3: "(l) the supplier\'s cancellation, return, exchange and refund policies, if any"; s. 6 (cancellation) Confirmed',
  },
  'ns-cpa': {
    publisher: 'Nova Scotia',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 26(3) merchantable quality "Notwithstanding any agreement to the contrary"; s. 28(1): a term that "purports to negative or vary any of the conditions or warranties set out in this Act… is void." Confirmed (a first request was refused by the site firewall; a plain retry loaded it)',
  },
  'pe-bpa': {
    publisher: 'Prince Edward Island',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 2(a)(xii): an unfair practice is "a representation that the proposed transaction involves or does not involve rights, remedies or obligations if the representation is false or misleading" Partly: no internet-sales rules found in PEI law; the PEI Sale of Goods Act consolidation dates from 2003',
  },
  'nl-cpbpa': {
    publisher: 'Newfoundland and Labrador',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 29(1)(f) "the supplier\'s cancellation, return, exchange and refund policies"; s. 30(2)(a) "requires the consumer to access the information"; s. 32(1)(a): "not later than 10 days after the date that the consumer receives a copy of the contract"; s. 32(1)(c) (30 days); s. 3(1) waivers void (B.2) Confirmed',
  },
  'nl-sga': {
    publisher: 'Newfoundland and Labrador',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 16(c) merchantable quality; s. 56: "may be negatived or varied by express agreement" Confirmed',
  },
  'nt-cpa': {
    publisher: 'Northwest Territories',
    type: 'canadian-government',
    locator:
      '[CA-reg (Act)] s. 70(1): "Notwithstanding any agreement to the contrary, the following conditions or warranties on the part of the seller are implied in every retail sale of goods"; s. 107 (limits void) Confirmed (office consolidation, "not an official statement of the law"); no internet-sales rules',
  },
  'cmc-internet-template': {
    publisher: 'Consumer Measures Committee, ISED',
    type: 'canadian-government',
    locator:
      '[CA-gov] "the supplier\'s cancellation, return, exchange and refund policies, if any;" (a model only; each province\'s law governs) Confirmed',
  },
  'hc-mdr-sor-98-282': {
    publisher: 'Justice Laws, Government of Canada',
    type: 'canadian-government',
    locator:
      '[CA-reg (regulation)] s. 26: "no person shall import or sell a Class II, III or IV medical device unless the manufacturer of the device holds a licence" (C17: hide 4713, whose licence is "Discontinued at Renewal"); s. 44(2)(a) (retailers need no establishment licence); ss. 52(2) and 57(2): "Subsection (1) does not apply to (a) a retailer" (N6). The full text has no match for "online", "internet" or "prescription" Confirmed. s. 21(1) also bars selling a device without a compliant label; s. 27 bars advertising an unlicensed Class II device for sale',
  },
};
