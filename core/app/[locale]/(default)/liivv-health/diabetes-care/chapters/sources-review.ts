/*
 * =============================================================================
 * DIABETES CARE CHAPTERS — SOURCE REGISTER, REVIEWER-ONLY FIELDS
 * =============================================================================
 * What each source in sources-meta.ts publishes, who publishes it, and the
 * paraphrase of the passage it is cited for. None of it is ever rendered: the
 * page needs a title, a link and a language, and that is all sources-meta.ts
 * holds. These three fields exist for the people checking the microsite against
 * its sources, and they are read by one caller — the content-review export.
 *
 * They live in their own file because the chapter engine is pulled into the
 * browser bundle, and a reviewer's private note on what a guideline says has no
 * business being shipped to a reader. Import this file from the export script
 * and from nothing else; if a runtime module ever needs a publisher name, copy
 * the string into sources-meta.ts rather than importing this file.
 *
 * A locator is the paraphrase first. After it come the notes a clinical
 * reviewer needs before a card cites the source: where the source check found
 * the page says less than the research recorded, where two sources disagree,
 * and the open questions the nurse has still to rule on ("Open for the
 * nurse"). A ruling settles the copy, not the source, so the note stays until
 * the page itself changes.
 *
 * Keys and order follow sources-meta.ts exactly. The Record type makes tsc flag
 * a source that gains an entry there and not here.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { SourceId } from './sources-meta';

/*
 * Ostomy's four kinds, plus three this site needs. A provincial or federal
 * program page is not a guideline, an international patient page is not a
 * guideline either, and an industry page has to be visible as one wherever it
 * is cited, because it may never be the only source for a claim.
 */
export type SourceType =
  | 'canadian-patient-education'
  | 'canadian-guideline'
  | 'canadian-government'
  | 'international-guideline'
  | 'international-patient-education'
  | 'industry'
  | 'other';

export interface SourceReview {
  publisher: string;
  type: SourceType;
  /** Reviewer-only paraphrase of the supporting passage. Never rendered. */
  locator: string;
}

const DC = 'Diabetes Canada';
const DC_CPG = 'Diabetes Canada, Clinical Practice Guidelines';
const BT1D = 'Breakthrough T1D Canada (formerly JDRF)';
const DAS = 'Diabetes@School (Canadian Paediatric Society, CPEG and Diabetes Canada)';
const CHS = 'Canadian Hemochromatosis Society';
const ONTARIO = 'Government of Ontario';
const BC = 'Government of British Columbia';
const EXETER = 'University of Exeter, diabetesgenes.org (UK)';

/* Appended where the source check kept a page's subject but not its printed title. */
const UNCHECKED_TITLE =
  'Label describes the page: its printed title was not recorded, so check it before a card cites it.';

/* Appended to every manufacturer page. */
const NEVER_SOLE = 'Manufacturer page: never the only source for a claim.';

export const SOURCE_REVIEW: Record<SourceId, SourceReview> = {
  /* ---------- Canadian: Diabetes Canada clinical practice guidelines ---------- */
  'dc-cpg-ch3-classification-diagnosis': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (2018, Punthakee et al.; no newer version found): diabetes at FPG ≥7.0, A1C ≥6.5% (adults, not suspected type 1), 2-hour or random glucose ≥11.1, confirmed on another day without symptoms; prediabetes IFG 6.1–6.9, IGT 7.8–11.0, A1C 6.0–6.4%; LADA listed under type 1; antibodies not accurate enough for routine use and levels wane; C-peptide unhelpful in acute hyperglycemia; genetic testing for everyone diagnosed before 6 months; MODY clues (onset under 25, more than 2 generations, no obesity); some cases are difficult to classify. Its clinical indicators include "time to needing insulin <1 to 2 years" (found on the re-check of 2026-10-05; an earlier check missed it). "Type 1.5" is not on the page. Re-read 2026-10-06: Table 2 gives "First-line treatment … Depends on subtype" for monogenic diabetes, and its neonatal footnote says it "may be amenable to therapy with oral sulfonylurea in place of insulin therapy". Ruled 2026-10-06: it leads the claims on Know Your Type 8.items.7 and 9.items.5, ahead of ISPAD and Exeter, with no medicine class on the page (C21); it alone backs 6.s3.4 now (C27, K1) and calls single-gene diabetes rare on 8.items.1 (C27, K3).',
  },
  'dc-cpg-ch4-screening': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (2018, Ekoe, Goldenberg, Katz; Can J Diabetes 2018;42 Suppl 1, from S16; read 2026-10-06): people found to have prediabetes are at increased cardiovascular risk, and "These individuals would benefit from CV risk factor reduction strategies". Backup only for the prediabetes path’s row to Every Day Living card 11, whose words come from the patient page (dc-prediabetes-treatment; ruling C38).',
  },
  'dc-cpg-ch5-reducing-risk': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (2018, Prebtani, Bajaj, Goldenberg, Mullan; Can J Diabetes 2018;42 Suppl 1, from S20; read 2026-10-06): its key messages for people with prediabetes say "healthy behaviour changes that result in a loss of 5% of your initial body weight can delay or prevent type 2 diabetes from developing". Backs the prediabetes path intro, framed as conditional ("If losing weight is right for you"), with activity and a dietitian (ruling C38). Not used: its medication key message, and the "almost 60%" trial figure.',
  },
  'dc-cpg-ch8-targets': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: A1C ≤7.0%; 4.0–7.0 before meals and 5.0–10.0 two hours after; A1C 7.1–8.5% for frail people, recurrent severe lows or limited life expectancy.',
  },
  'dc-cpg-ch9-monitoring-2021': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: real-time CGM should be used in type 1 on injections or a pump, intermittently scanned CGM may be; rtCGM in type 1 pregnancy; time in range over 70% (3.9–10.0) and under 4% below 3.9 "for most individuals"; meter checks at least 3 times a day on insulin more than once daily; A1C about every 3 months, and at least every 6 months in adults who are stable at target. The time-in-range targets are the International Consensus Report’s, adopted here, and they exclude pregnancy, children and adolescents, and older or high-risk groups. Link this 2021 update, never the older chapter 9.',
  },
  'dc-cpg-ch10-physical-activity': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: at least 150 minutes a week of aerobic activity plus resistance at least twice; in type 1, extra carbohydrate or less insulin around exercise and about 20% less overnight basal after evening exercise; postpone vigorous exercise if blood ketones are ≥1.5 mmol/L. Clinician-level: no patient page gives insulin changes around exercise.',
  },
  'dc-cpg-ch11-nutrition-therapy': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: carbohydrate-counting education helps in type 1; Mediterranean, DASH and vegetarian patterns; alcohol up to 2 a day and under 10 a week for women, up to 3 a day and under 15 a week for men; lows possible up to 24 hours after drinking. These limits differ from Canada’s Guidance on Alcohol and Health (2023). Ruled 2026-10-06 (C16): they are not stated, and Every Day Living card 4 no longer cites this chapter; it uses the 2023 positions (Ch18 2023 and CCSA), each in its own words. The chapter stays current, and other cards cite it.',
  },
  'dc-cpg-ch13-t2d-pharmacologic-2024': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: metformin first-line; insulin if metabolically decompensated; combination therapy when A1C is more than 1.5% above target; GLP-1 RA or SGLT2 inhibitor for heart or kidney protection regardless of A1C. Clinician-level; the site gives no drug choices or doses.',
  },
  'dc-cpg-ch14-hypoglycemia-2023': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: level 1 often 3.0–3.9, level 2 often below 3.0, level 3 any reading that needs help from someone else; treat with 15 g of fast carbohydrate, recheck in 15 minutes and retreat if still below 3.9; prescribe glucagon to people at high risk, such as insulin users, with teaching for their support persons; a severe low is treated with intranasal or injectable glucagon (doses on the page, not used on the site). Always link this update: the old /chapter-14 still loads with older guidance (retreat below 4.0; 1 mg glucagon only). Table 4: 150 mL juice or regular soft drink; 6 Life Savers; 15 mL honey. The effectiveness of glucagon is reduced after more than 2 standard alcoholic drinks in the previous few hours (used on Staying Safe card 4, ruling C2). Ruled 2026-10-06 (C1): 3.9 site-wide; 4.0 only for driving (Ch21). Ruled 2026-10-06 (C13): the site uses Table 4’s 150 mL (⅔ cup). Ruled 2026-10-06 (C29): Table 4’s 6 Life Savers differs from the 4 on the 02/24 sheet, and the brand is left out.',
  },
  'dc-cpg-ch15-hyperglycemic-emergencies': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: DKA by pH ≤7.3, bicarbonate ≤15, anion gap over 12 and positive ketones, glucose usually ≥14.0; normal or mildly raised glucose does not rule out DKA, in pregnancy or on an SGLT2 inhibitor (now on Staying Safe’s red flag 4 and card 6, rulings C6 and C17); HHS at glucose ≥34.0 with osmolality over 320. Clinician-only: no Canadian patient page covers HHS, so it stays out of the copy.',
  },
  'dc-cpg-ch16-in-hospital': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (2018): 20–50% of people without a previous history of diabetes who take steroids develop hyperglycemia ("high-dose" belongs to the next sentence, on management, not to this figure); glucose monitoring for 48 hours after starting steroids "may be considered"; basal-bolus insulin beat correction-only, and added NPH did not help. Conflicts with CF Canada 2024, which times NPH with the steroid.',
  },
  'dc-cpg-ch18-mental-health': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (2018, Robinson et al.): second- and third-generation antipsychotics bring weight gain and worse glucose and lipids, clozapine and olanzapine most; children have 2–3 times the type 2 risk in the first year; monitor people with and without diabetes from baseline. The page gives monitoring at 1, 2 and 3 months, then every 3–6 months and yearly, so do not shorten it. Check whether the 2023 update supersedes this chapter before citing it.',
  },
  'dc-cpg-ch18-mental-health-2023': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: screen everyone for diabetes distress and depression, and for anxiety, eating disorders and fear of lows; extra attention in adolescence. Key messages for people (re-read 2026-10-05): "If you currently do not drink alcohol, it is a healthier decision to not start"; people who drink should reduce their intake to minimise harm, "This may mean consuming a maximum of 2 standard drinks per week" (stated since ruling C16 as "may mean no more than 2 standard drinks a week"; its line on more than 4 drinks per occasion is not used, as it can read as permission), and ask a provider for support to cut down; emotions are "valid responses to a chronic condition"; "Eating, sleeping, and stress-related problems are also common"; addressing a persistent fear of lows helps; questionnaires can be filled in before an appointment. That is Diabetes Canada’s own newer guidance agreeing with CCSA 2023, against chapter 11 (2018), the 04/18 alcohol sheet and the 2019 article. It also recommends counselling on hypoglycemia for people on insulin who drink (Every Day Living 4.items.3). Ruled 2026-10-06: C16, Every Day Living 4.items.1 and 4.items.5 state its key messages for people; C23, those lines come from its section written for people, so nothing is labelled "clinician guidance".',
  },
  'dc-cpg-ch20-transplantation': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (2018): risk from steroid dose, CMV, hepatitis C and the choice of immunosuppressant; screen before transplant, OGTT or post-lunch glucose in months 1–3, A1C at 3 and 12 months, then yearly; insulin for severe hyperglycemia, avoid weight-gaining drugs, metformin first-line if kidney and liver allow. Conflicts with the 2024 international consensus (OGTT essential, A1C insensitive; newer drugs first).',
  },
  'dc-cpg-ch21-driving': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: check before driving and at least every 4 hours (every 2 with unawareness or past severe lows), or use rtCGM; do not drive below 4.0; after treating a low, wait at least 40 minutes and until glucose is at least 5.0; after a severe low while driving, stop driving immediately (recommendation), and the same applies to more than one severe low while awake but not driving in the past 6 months (12 for commercial drivers); professionals should then tell the person to no longer drive. The key messages for people say to notify the provider and the licensing body immediately, where the recommendation says the provider as soon as possible, within 72 hours. The key messages say "It is suggested to wait for 40 minutes", the recommendation "at least 40 minutes". Every Day Living follows the recommendation for the wait and the key messages for notifying (ruling D2). Open for the nurse: 4.0 here vs 3.9 in the hypoglycemia chapter; "at least 40 minutes" here vs "up to 40 minutes" on the 02/24 sheet and the Drive Safe card. Staying Safe follows this chapter for driving.',
  },
  'dc-cpg-ch29-ckd-2025': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (2025 update): screen yearly with ACR and eGFR (type 1 from 5 years after onset, type 2 at diagnosis); ACR ≥2.0 mg/mmol or eGFR under 60 is abnormal; ACE inhibitor or ARB, then SGLT2 inhibitor, finerenone, GLP-1 RA. Re-read 2026-10-06. Printed title: "Special Article: Chronic Kidney Disease in Diabetes: A Clinical Practice Guideline". Key messages for people with or at risk of kidney disease from diabetes: yearly blood and urine tests; ask about your eGFR and ACR; "Prioritize glucose-lowering therapies with additional kidney and/or heart disease benefits over treatments that target only blood glucose levels"; potassium. Ruled 2026-10-06: C21, Every Day Living 10.items.8 states that key message with no drug class ("some diabetes medicines also help protect the kidneys and heart… don’t change a medicine on your own"); C37, type 1 screening "should begin 5 years after onset or, if onset is at an early age, screening should start after puberty" (This Might Be You 2.items.9), used in place of chapter 34’s older age-12 line.',
  },
  'dc-cpg-ch30-retinopathy': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: type 1 from age 15, yearly starting 5 years after onset; type 2 at diagnosis, then every 1–2 years if there is no or minimal retinopathy. Key message for people: "Discuss the recommended frequency with your diabetes healthcare team and experienced vision care professionals". Ruled 2026-10-06 (C24): the site leads with Diabetes Canada’s patient page (once a year), keeps this chapter’s starting points, and gives its 1–2 years for type 2 with little or no retinopathy only as the exception, in Every Day Living 9.note.',
  },
  'dc-cpg-ch32-foot-care': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: loss of feeling to the 10 g monofilament predicts ulcer and amputation; foot exam at least yearly, more often if high risk; fitted footwear; early referral. A foot ulcer or signs of infection, "even in the absence of pain", should be treated promptly; people at high risk should have professionally fitted footwear; test bath water with your hand.',
  },
  'dc-cpg-ch34-t1d-children': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (2018; re-read 2026-10-06): children 15 and over with 5 years’ diabetes duration should be screened yearly for retinopathy, with every 2 years allowed when control is good, duration is under 10 years and there is no significant retinopathy; children 12 and over with more than 5 years’ duration should be screened yearly for kidney disease (urine ACR); consider monogenic and neonatal diabetes when the presentation is atypical for type 1 (refers to chapter 3). Chapter 41 (2025) updates only its glycemic management portions, so these screening lines stand. Ruled 2026-10-06 (C37): This Might Be You 2.items.9 uses its eye line; for kidneys it follows chapter 29 (2025), which is newer.',
  },
  'dc-cpg-ch35-t2d-children': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: DNA testing "should be considered" with a strong autosomal-dominant family history and no features of insulin resistance; antibody testing "should be considered" in all youth with clinical type 2 (up to 10–20% are positive); fasting insulin is unreliable at diagnosis. Never reword as "should have".',
  },
  'dc-cpg-ch36-pregnancy': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: pre-existing diabetes is diagnosed before conception; GDM is glucose intolerance first recognised in pregnancy, with overt diabetes a separate category; early A1C before 20 weeks if high risk; before conception A1C ≤7.0% (ideally ≤6.5%) and folic acid 1.0 mg; targets fasting under 5.3, 1 hour under 7.8, 2 hours under 6.7; postpartum 75 g OGTT between 6 weeks and 6 months; eye exams before conception, in the first trimester and in the first year postpartum. Monogenic diabetes appears only as hyperglycemia that likely preceded the pregnancy. Re-read 2026-10-05 (This Might Be You card 1): all women with pre-existing type 1 or type 2 diabetes should receive preconception care; the A1C recommendation reads ≤7.0% "(or A1C ≤6.5% if can safely be achieved)"; folic acid 1 mg from at least 3 months before conception to 12 weeks; preconception care includes reviewing and "discontinuing potentially harmful medications"; screen for chronic kidney disease before conception; rtCGM "should be used" in pregnant women with type 1; a rapid fall in insulin needs and a risk of hypoglycemia in the immediate postpartum period, with frequent glucose monitoring in the first days; breastfeeding encouraged for at least 4 months. Still the 2018 chapter; Ch41 says pregnancy recommendations are being updated separately (no newer chapter found 2026-10-05). Clinician-level. Ruled 2026-10-06: C19, the folic acid amount (1 mg) is not shown; This Might Be You 1.s1.3 says a higher dose than usual may be needed and to ask, with PHAC (phac-folic-acid); the preconception A1C stays, with its qualifier. C23, it has a section of "Key messages for women with diabetes who are pregnant or planning a pregnancy"; still the 2018 chapter on the index 2026-10-06, and card 1’s note now says so (re-check for a new chapter before publishing, M1). C28, its professional key messages on gestational diabetes: "First-line therapy consists of diet and physical activity. If glycemic targets are not met, insulin or metformin can then be used." (the gestational path intro).',
  },
  'dc-cpg-ch37-older-people': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: A1C 7.1–8.5% if frail or living with dementia; sulfonylureas with caution (avoid glyburide), DPP-4 inhibitors preferred; simplify to once-daily basal insulin. No patient page covers older adults. Re-read 2026-10-05 (This Might Be You card 4): targets by function (functionally independent ≤7.0%, functionally dependent, frail and/or dementia, end of life); a higher A1C target "may be considered" in older people taking antihyperglycemic agents with a risk of hypoglycemia; strategies "to strictly prevent hypoglycemia"; premixed insulins and prefilled pens to reduce dosing errors; the clock drawing test may predict who will have difficulty learning to inject insulin. Clinician-level. Reviewer evidence only (ruling C14): a skin lift is not required to optimize absorption in older people (no needle length given); not cited on Your Tools card 7. Ruled 2026-10-06: C19, its end-of-life line ("A1C measurement not recommended. Avoid symptomatic hyperglycemia and any hypoglycemia") is now on This Might Be You 4.items.3; C23, card 4’s note says it draws on this guideline and its "Key messages for older people with diabetes".',
  },
  'dc-cpg-ch38-indigenous': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase: prevalence 17.2% for First Nations on reserve, 10.3% off reserve and 7.3% for Métis, vs 5.0% overall; screen every 6–12 months with risk factors; community-led, culturally appropriate care. Re-read 2026-10-05 (This Might Be You card 6): recommendation 1, care "with respect for, and sensitivity to, particular social, historical, economic, cultural and geographic issues", and support for choices about accessing cultural resources; retinal photography may be used in remote Indigenous communities [Grade B]; where it is absent, point-of-care A1C may be considered if testing has a quality control program; screening in asymptomatic Indigenous adults over 18 with additional risk factors should be considered every 6 to 12 months. A type 2 chapter. Owner answers 2026-10-06 (B1: no Indigenous health partner to review; B2): no card cites it now. This Might Be You card 6 keeps only NIHB program facts, so its three lines from this chapter (care in context, remote screening, a check every 6 to 12 months) and the prediabetes path row that pointed to them are gone. Kept in the register for the record.',
  },
  'dc-cpg-ch41-t1d-lifespan-2025': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (Can J Diabetes, Feb 2025; released Mar 2025): A1C under 7.0% at all ages; automated insulin delivery preferred for everyone willing and able, otherwise CGM with a pump or injections; a child on injections or a non-automated pump treats a low with 5 g under 5 years, 10 g at 5–10 and 15 g over 10 (0.3 g/kg), less on automated delivery, and anyone on automated delivery may use 5–10 g for a non-severe low; from age 4 intranasal or injectable glucagon, under 4 injectable unless it is unavailable; injectable glucagon availability is limited in Canada; check fasting ketones 1–2 times a week if an SGLT2 inhibitor is used. Written before Health Canada approved teplizumab (May 2025), so out of date there. The source check found no stage definitions although the research recorded them: re-read before citing. Open for the nurse: the children’s table is for injections or a non-automated pump only. Re-read 2026-10-05 (This Might Be You cards 2 and 3): "we strongly advocate for facilitation of insulin administration in schools and daycares throughout Canada". Re-read 2026-10-06: "Pregnancy is excluded from this guideline as recommendations are being updated separately" (why This Might Be You card 1’s note dates the pregnancy chapter, ruling C23); it "updates the glycemic management portions" of chapter 34 only (C37). Ruled 2026-10-06 (C27, K13): Know Your Type 5.items.4 cites it for stage 3.',
  },
  'dc-cpg-appendix-2-classification': {
    publisher: DC_CPG,
    type: 'canadian-guideline',
    locator:
      "Paraphrase (no year shown; adapted from ADA 2012): other specific types include diseases of the exocrine pancreas (pancreatitis, trauma or pancreatectomy, neoplasia, cystic fibrosis, hemochromatosis, fibrocalculous pancreatopathy), endocrinopathies (acromegaly, Cushing's, glucagonoma, hyperthyroidism, pheochromocytoma and others), and drugs including glucocorticoids, atypical antipsychotics and calcineurin inhibitors. Not on the page: cancer immunotherapy, transplant, or the term type 3c.",
  },

  /* ---------- Canadian: Diabetes Canada pages, sheets and notices ---------- */
  'dc-type-1': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (undated): type 1 is "roughly 10 per cent" of people with diabetes in one place and "five to 10 percent" in another; the copy uses 5 to 10%, so it and type 2’s 90–95% never add up to more than 100%. The pancreas makes no insulin; treated with injections or a pump; it can also develop in adulthood. Links to the Type 1 Adult Toolkit and the How 2 Type 1 videos. Nothing on LADA, antibodies or CGM. Ruled 2026-10-06 (C41): the site says 5 to 10% everywhere, Know Your Type 1.items.1 included, with dc-diabetes-in-canada.',
  },
  'dc-type-2': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: 90–95% of cases; risk factors include age over 40, family history and ethnicity; it may have no symptoms.',
  },
  'dc-prediabetes': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: a definition and a link to the CANRISK test. No thresholds on this page; use chapter 3 for those. The prediabetes path’s 5% and heart lines rest on dc-prediabetes-treatment and chapters 4 and 5 (ruling C38).',
  },
  'dc-prediabetes-treatment': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (undated; read 2026-10-06; no French page checked): take a prediabetes diagnosis seriously, "because some long-term complications associated with diabetes—such as heart disease—may begin during prediabetes"; a healthy eating pattern; activity building to 150 minutes a week; "Discussing weight management with your healthcare provider"; a registered dietitian. Backs the prediabetes path intro and its row to Every Day Living card 11 (ruling C38).',
  },
  'dc-gestational-diabetes': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: affects 3–20% of pregnancies; appears in the second or third trimester; usually goes after birth; raises the later risk of type 2 and heart disease. Re-read 2026-10-06 (ruling C28): many manage it with diet and activity, "however, some women will need to inject insulin for better control"; "your health-care provider may recommend insulin injections or pills for the duration of your pregnancy". Backs the gestational path intro’s medicine line.',
  },
  'dc-diabetes-in-canada': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (undated; it gives 2024 and 2034 estimates; read 2026-10-06; no French page verified): type 1 is "5-10% of diabetes prevalence". Backs Know Your Type 1.items.1 with dc-type-1 (ruling C41).',
  },
  'dc-checking-blood-sugar': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: 4.0–7.0 before meals and 5.0–10.0 two hours after eating (5.0–8.0 if A1C is not at target); A1C ≤7.0%; explains meters and CGM. Re-read word for word by the Your Tools source check (2026-10-05): a finger prick puts blood on a test strip inserted into the monitor; monitors are available at most pharmacies or from your diabetes educator; get the proper training before you begin to use one; how often you check depends on your treatment plan; the "Ask your health-care provider about" list (how and where to draw blood, using and disposing of lancets, the size of the drop, the testing strips to use, cleaning the meter, checking its accuracy, coding it if needed); a CGM measures sugar in the fluid between cells; time in range is "the percentage of your day your blood sugar stays in your target range", given as 4.0–10.0 mmol/L for 70% or more of the day, with 3.9 or below for under 4%; individual targets may vary. Re-read 2026-10-06 for ruling C17, its section on being ill: check more often, such as every 2–4 hours; about 15 g of carbohydrate from drinks every hour if not eating; under "If you are sick and can’t eat…", call your doctor or go to the emergency room if you vomit or have diarrhea two or more times in 4 hours, and "If you use insulin, keep taking it when you are sick. Check with your health-care team about dose or medication changes." (both now on Staying Safe card 8). It also says "Keep taking your diabetes medications", which is not used: it conflicts with the Stay Safe sheet and CPG Ch15, which list medicines to pause on sick days.',
  },
  'dc-technology-and-devices': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: intermittently scanned vs real-time CGM; a sensor is slower than blood by up to 15 minutes, so keep a meter as a backup; pumps and hybrid closed loop; pump users keep backup rapid-acting insulin pens or syringes and ketone strips. Re-read word for word by the Your Tools source check (2026-10-05), which confirmed the backup line ("Rapid-acting insulin pens or syringes, Long-acting insulin (if needed), Extra pump supplies (infusion sets, reservoirs), Ketone testing strips… or a ketone blood monitor"; make "a pump backup plan before one is needed") and found: even if offered a CGM, keep a meter and strips for double-checking CGM readings and as a backup; a sensor sits on the skin "like a small, lightweight, waterproof patch… held in place by sticky material", with a small flexible filament; intermittently scanned CGM reads "only when the sensor is scanned", real-time CGM has alarms for low and high sugar levels; some CGMs connect to an insulin pump (a hybrid closed loop system); "Tech isn\'t for everyone"; readings can be shared from a smartphone with the diabetes team; the difference from a finger check is "more likely to be larger when you\'re eating or exercising", and a finger check gives the most accurate result; pens are preloaded, with a tip added for each injection and one pen per type of insulin; today\'s syringes are smaller, use thinner needles and cost less than pens and pumps; a pump gives insulin 24 hours a day through a small tube; the team decides whether a pump will work for you and your pump settings.',
  },
  'dc-getting-started-with-insulin': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: rotate sites; insert the pen tip or needle at 90° with a quick smooth motion, and with an 8 or 12 mm needle gently lift the skin or go in at 45° (the page names no 6 mm needle; corrected by the Your Tools source check, 2026-10-05); "Try to use shorter needles with a smaller thickness"; in-use insulin keeps at room temperature up to 30 days; throw out insulin that has been frozen, above 30 °C or expired; storage differs by product, so read the product information; pen tips and lancets go in a sharps container. The source check found no 2–8 °C here; cite Diabète Québec for it. Ruled 2026-10-06 (C15): the 30 days here is not used, because some labels say 28 (Humalog, Humulin N, Entuzity); the site says most insulins are good for up to 28 days once opened, some for longer, and to follow the leaflet (Diabète Québec). Reviewer evidence on in-use times from the Health Canada monographs (C7): Toujeo 42 days, Humalog 28, Tresiba 56, Awiqli 12 weeks, Entuzity 28.',
  },
  'dc-hypoglycemia-adults-sheet-2024': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (02/24): below 3.9 is low; 15 g is glucose tablets, 1 Tbsp (15 mL) honey, 1 Tbsp sugar in water, ½ cup (125 mL) juice or regular soft drink, or 4 Life Savers (a brand, so left out of the copy); wait 15 minutes and check again; if the next meal is more than an hour away, a starch and protein snack; with more severe signs that affect mental or physical ability, 20 g if able to swallow, otherwise glucagon; drive only above 5, as the brain might need up to 40 minutes. Ruled 2026-10-06: C1 3.9 site-wide, 4.0 only for driving; C13 the site uses Ch14 Table 4’s 150 mL (⅔ cup), not this sheet’s ½ cup (125 mL); C29 this sheet’s 4 Life Savers differs from the 6 in Ch14, Drive Safe and Diabète Québec, and the brand is left out; C18 honey is hidden for children, and the babies-under-1 note is sourced to Health Canada (hc-infant-botulism).',
  },
  'dc-hyperglycemia': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: symptoms may start at fasting glucose at or above 11; check ketones if glucose stays above 14 before meals for more than a few meals; seek medical treatment right away for very high glucose or high ketones. No ketone action ranges (none anywhere on diabetes.ca); this generic line is the alternative to the type 1 ladder for readers with other types.',
  },
  'dc-stay-safe-sick-days-sheet': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: risk from vomiting, diarrhea, fever, or heat and humidity without enough to drink; drink plenty of fluids with minimal sugar unless told to limit fluids; 15 g carbohydrate foods if you cannot eat; insulin users check more often and might need to adjust insulin; medicines to stop for a short time if eating less, or dehydrated, for more than 24 hours, with a box for the pharmacist to fill in; restart when eating and drinking normally; call the team and/or go to the emergency department if you cannot drink enough, ketones are moderate or high, you do not know which medicines to stop or how to adjust insulin, or symptoms including difficulty breathing are not getting better. Open for the nurse: the medicine-class list is held off the page for scope (it does not cover combination pills); the site sends "can’t keep fluids down" to emergency care where the sheet says team and/or emergency department; ⅔ cup juice for 15 g here.',
  },
  'dc-baqsimi-shortage-notice': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator: `Paraphrase: notice of a Baqsimi (nasal glucagon) shortage, January–February 2025. Supply history only: check current supply against Health Canada before any availability claim. ${UNCHECKED_TITLE}`,
  },
  'dc-exercise-and-activity': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: exercise can lower blood sugar for up to 48 hours; monitor regularly, especially on insulin or other medicines that lower blood sugar; carry fast-acting carbohydrate; wear a medical ID bracelet or necklace. It does not say "check before and after". It also gives at least 150 minutes a week, starting with 5 to 10 minutes a day, no more than 2 days in a row without activity, resistance exercise 2 to 3 times a week, "talk to your doctor before starting any exercise program that is more strenuous than a brisk walk", "Stop the activity" if short of breath or with chest pain (it adds "and speak to your doctor", which Every Day Living leaves out: on its own it can delay emergency care, ruling D4), and benefits including "Decreased stress" and "Improved relaxation and sleep". Its medical-ID line names a brand.',
  },
  'dc-carb-counting-sheet-2025': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (07/25): grains and starches a quarter of the plate; carbohydrate 45–60% of calories, about 45–60 g a meal and 15–30 g a snack, within 5 g of target; subtract fibre; points to the Canadian Nutrient File.',
  },
  'dc-alcohol-and-diabetes-2018': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (04/18; reflects the 2018 guidelines): lows up to 24 hours after drinking, which also applies to type 2 on insulin or insulin secretagogues; eat carbohydrate when drinking; check before bed; wear diabetes identification; glucagon will not work while alcohol is in the body, so make sure someone knows to call an ambulance; 150 mL regular pop for a low. Linked from the 2019 article. Check it is still Diabetes Canada’s current sheet before publishing. Its general rule: there is no need to avoid alcohol because you have diabetes. Its don’t-drink list: pregnant or trying, breastfeeding, a personal or family history of drinking problems, "planning to drive or engage in other activities that require attention or skill", and certain medications (ask your pharmacist). Ruled 2026-10-06 (C2): its "glucagon will not work while alcohol is in the body" is superseded by CPG Ch14 2023, "The effectiveness of glucagon is reduced in individuals who have consumed more than 2 standard alcoholic drinks in the previous few hours"; Staying Safe card 4 uses the 2023 wording, and Every Day Living card 4 keeps its pointer (D15). The sheet’s link now opens a web page instead of the PDF (2026-10-06). Ruled 2026-10-06 (C16): still served (code 111025 04/18); Every Day Living card 4 keeps its don’t-drink list and its "People with diabetes should discuss alcohol use with their diabetes health-care team", attributed to the sheet and dated 2018. Its printed limits and its "no need to avoid alcohol" general rule are not used.',
  },
  'dc-diabetes-and-drinking-2019': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (2019 article): have alcohol with a meal or snack that includes carbohydrate; allows up to 2–3 drinks a day. It does not say 24 hours, check before bed or wear ID: those are on the 04/18 alcohol sheet it links to. Open for the nurse: its limits follow the 2018 guidelines, not Canada’s Guidance on Alcohol and Health (2023).',
  },
  'dc-cannabis-position-2020': {
    publisher: DC,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (position, Aug 2020): recreational cannabis is not recommended for adolescents or adults with diabetes; people with type 1 should avoid it because of a higher DKA risk; providers should ask about substance use regularly and without judgement (rec 1); edibles can contain carbohydrate and cannabis can stimulate appetite; adults who intend to use cannabis should be offered individualized counselling with a harm-reduction focus (rec 4 is for adults).',
  },
  'dc-foot-care-sheet-2025': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (08/25): every day wash, dry and check with a mirror, lotion but not between the toes, nails cut straight across; a yearly bare-foot exam with nerve and blood-flow screening; see a doctor or foot-care specialist right away for swelling, warmth, redness or pain in the feet or legs, or for corns, calluses, ingrown toenails, warts or slivers, and do not treat them yourself; the DON’T column lists going barefoot, over-the-counter corn or wart treatments and insoles, tight socks or knee-highs, soaking, hot water bottles and heating pads, sitting or crossing legs for long periods, and smoking; avoid heels of 5 cm or more.',
  },
  'dc-kidney-disease': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: diabetes is the leading cause of kidney disease in Canada; up to 50% of people with diabetes will show signs of kidney damage in their lifetime; most people have no symptoms early on; good management and regular screening can prevent or delay the loss of kidney function; screening is a urine ACR and a blood eGFR, from diagnosis in type 2 and 5 years after diagnosis in type 1, then yearly; ACR ≥2.0 is abnormal; prevention includes targets, not smoking and taking medicines as prescribed; with kidney disease, a registered dietitian advises on protein, potassium, phosphate or sodium.',
  },
  'dc-eye-damage-retinopathy': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (undated; read 2026-10-06; no French page found): "You should get an eye exam once a year, unless your ophthalmologist or optometrist has suggested something different"; an exam before getting pregnant and while pregnant; see an eye doctor immediately for blurred vision, flashes of light in the field of vision, sudden loss of vision, or blotches or spots in vision; the exam may be covered by your provincial health plan. Leads the eye schedule on Every Day Living card 9, its band card and New to the Journey’s band card 3 (ruling C24).',
  },
  'dc-heart-disease-and-stroke': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: heart disease may come 15 years earlier (no "up to"); the risk can be lowered considerably by attention to all risk factors, summed up as the ABCDEs (the page’s spelling; the guideline’s is ABCDESSS): A1C 7% or less for most, blood pressure under 130/80, LDL under 2.0 mmol/L, drugs to protect the heart (the page names ACE inhibitors, ARBs, statins, Aspirin and clopidogrel; no chapter names a class), exercise and eating, then screening, stopping smoking and self-management, including stress. Blood pressure at every diabetes visit, A1C every 3 months, lipids every year (more often on cholesterol-lowering medicines). A footnote says A1C targets differ for pregnant women, older adults and children 12 and under.',
  },
  'dc-taking-care-of-mental-health': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: depression is more common with diabetes. No crisis numbers on the page; Diabetes Canada pages list none, so 9-8-8 comes from 988.ca. It says the constant demands of diabetes can lead to diabetes distress, low moods and anxiety, names feeling angry, guilty, frightened or discouraged, and recommends reaching out to your healthcare team about any mental health concern. The footer reads "supported by an unrestricted educational grant from Sanofi": not industry-run, but recorded. It links a "Find a mental health provider near you" directory whose description matches Breakthrough T1D’s word for word; where that link goes was not recorded.',
  },
  'dc-drive-safe-card': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (2018 design): the patient version of the driving rules; do not start driving below 4; ⅔ cup juice for 15 g; drive only above 5 after a low, as the brain might need up to 40 minutes. Ruled 2026-10-06: 4.0 is used only for driving (C1); ⅔ cup (150 mL) matches Ch14 Table 4 and is the site’s amount (C13); "up to 40 minutes" is weaker than chapter 21.',
  },
  'dc-driving-and-diabetes': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: a right to individual assessment; licensing is handled by each province. No provincial ministry page has been checked.',
  },
  'dc-air-travel': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      "Paraphrase: insulin goes in carry-on, never checked; insulin keeps 30 days at room temperature; flying east and losing more than 2 hours may mean less intermediate or long-acting insulin; bring a doctor's letter. Ruled 2026-10-06 (C15): the 30 days here is not used, because some labels say 28. Also: temperature changes can damage insulin in checked luggage; do not wear a pump or CGM through the body scanner or put a pump through the X-ray, and ask for a physical search, in private if you wish; you need not disclose your diabetes or remove your pump, only tell the screening officer; a list of medicines from your pharmacist; spare supplies, an insulated bag in the heat and insulin close to the body in the cold. The insulin-unit changes for time zones are dosing and are not used anywhere on the site.",
  },
  'dc-managing-emergency-situations': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: an emergency kit with at least 1 to 2 weeks of supplies — glucose tablets or other fast-acting non-perishable carbohydrate, a meter, glucagon, ketone strips and a sharps container; written basal rates, insulin-to-carbohydrate ratio and sensitivity factor for pumps; learn how to switch to injections in case you cannot use your pump.',
  },
  'dc-kids-in-school': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: a daily diabetes management plan and a diabetes emergency plan; students may use cell phones and smartwatches to help manage their blood glucose. Re-read 2026-10-05 (This Might Be You card 3): each Individual Care Plan has a daily management plan and an emergency plan; school principals should work with the student, their parents or guardians and healthcare professionals to develop and communicate it; schools should permit students to check their blood glucose, give insulin and treat lows and highs wherever and whenever required. Positions Diabetes Canada recommends, not rules in every school.',
  },
  'dc-rights-of-people-living-with-diabetes': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: eligible for any job you are qualified for; the right to diabetes self-care in public; the right to care everywhere, including hospital, other institutions and long-term care; coverage for medicines, supplies and devices varies by government; you may be eligible for the Disability Tax Credit.',
  },
  'dc-comparisons-by-province': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: province and territory comparisons of pump, CGM and flash, test strip, needle and formulary coverage, and school policy; documents dated 2023–2026 (kids in school 2026). The four supply tables as read on 2026-10-05: insulin pumps "Updated December 2024", test strips "Last updated: May 2025", needles, syringes and lancets "Last updated: June 2025", glucose monitoring devices "Updated July 2025". The needles table shows BC PharmaCare as needles and syringes only, which predates BC’s April 2026 addition of lancets and ketone strips; the tables also predate the 2025 MB, BC, PEI and YT pharmacare agreements, which is why the landing’s FAQ 1 asks readers to check each table’s date. Also reached at diabetes.ca/advocacy-policies/advocacy-reports/comparisons-by-province-territory.',
  },
  'dc-out-of-pocket-costs-2022': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator: `Paraphrase: Diabetes Canada's 2022 report on diabetes-related out-of-pocket costs. ${UNCHECKED_TITLE}`,
  },
  'dc-ontario-monitoring-for-health': {
    publisher: 'Diabetes Canada, running an Ontario government program',
    type: 'canadian-government',
    locator: `Paraphrase: meters 75% up to $75 once every 5 years; strips and lancets 75% up to $920 a year; for insulin users (type 1 or 2) and gestational diabetes, not for non-insulin users; people 24 and under and 65 and over claim lancets and meters only, because their strips are covered elsewhere; apply by mail. ${UNCHECKED_TITLE}`,
  },
  'dc-virtual-diabetes-education-program': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (opened 2026-10-06; Every Day Living resources shelf): a free program for people newly diagnosed or wanting a refresher, with monthly live virtual sessions (Zoom) led by registered health professionals and an on-demand video library (nutrition, physical activity, medicines). No French page.',
  },
  'dc-tzield-access-2026': {
    publisher: DC,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (7 Jan 2026): Health Canada approved Tzield on 5 May 2025; CDA-AMC recommended against public reimbursement on 5 Jan 2026; on no provincial or territorial formulary; available from the maker out of pocket or through private insurance, and through compassionate access. Since ruling C26 (2026-10-06), Know Your Type 5.items.10 also cites Canada’s Drug Agency and the Health Canada monograph for the delay and the side effects.',
  },

  /* ---------- Canadian: other patient education, guidance and research ---------- */
  'bt1d-what-is-glucagon': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: glucagon is for someone who cannot swallow, is extremely drowsy, unconscious or having a seizure, given by injection, auto-injection pen or nasal spray; turn them on their side, call 911 and stay; routinely check the expiry date. No Canadian source confirms an auto-injector is marketed here, so the copy says nasal spray or injection and sends the rest to the pharmacist. Check the Drug Product Database before publishing.',
  },
  'bt1d-dka-and-ketones': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: a severe lack of insulin makes the body break down fat into ketones; test urine with strips or blood with a meter (blood preferred; urine strips expire 6 months after opening); check when glucose is above target, and in type 1 when ill, especially with vomiting, stomach pain or fever; blood ketones under 0.6 normal, 0.6–1.5 monitor closely and call the team if ill, 1.5–3.0 call the team right away, over 3.0 a medical emergency — call immediately and possibly go to the emergency room; urine small call, moderate a sign of DKA risk so call right away, large an emergency; DKA signs include deeper breathing, fruity breath, stomach pain, being sick, and tiredness or confusion, and need immediate attention. Ruled 2026-10-06 (C4): ladder shown to all, labelled type 1; over 3.0 and large = medical emergency, get emergency care now (the page’s linked 2026 infographic says above 3.0 go to the hospital); moderate/1.5–3.0 = team now, ED if unreachable (DC sick-day sheet). The linked infographic’s correction-bolus protocol is not used on the site. Ruled 2026-10-06 (C5): the page’s ranges overlap at 1.5; the site’s ladder is adapted from them, with 1.5 on the higher rung ("0.6 to under 1.5", CPG Ch10 ≥1.5). The page now carries a story campaign "with support from Abbott", which makes ketone meters; the ranges cite Diabetes Canada and are editorial.',
  },
  'bt1d-time-in-range': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: at least 70% of the time in 3.9–10.0 and under 4% below 3.9 (different targets in pregnancy); going from 60% to 65% adds about an hour a day in range. Supported by the Time in Range Coalition (diaTribe keeps editorial independence), so cite it as a second source only, never alone.',
  },
  'bt1d-lada': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (updated 2025): also called type 1.5, a form of type 1; about 10% of adult diabetes diagnoses; onset over 30, autoantibodies (mainly GADA), no insulin needed for at least 6 months; often misdiagnosed and managed as type 2; time to insulin varies widely; a modified type 1 care plan, with pumps, CGM and automated delivery discussed. Not on the page: C-peptide, antibody level or number, or any type 2 medicine named as unsuitable. The https address redirected to http when checked. Conflicts with Buzzetti 2020 on how common it is (about 10% here, 2–12% there).',
  },
  'bt1d-stages-and-diagnosis': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: stages 1 and 2 come before stage 3; two or more persistent autoantibodies mean high risk; only 10–15% of new cases have a family history; many adults do not know type 1 can start in adulthood; screening through TrialNet (relatives), FEDERATE-Can (Quebec) and a population-screening consortium. Not on the page: a definition of stage 3. Re-read 2026-10-06: "You can also ask your doctor to consult www.uncovert1d.ca for information about which tests to order", noted as a site for health care providers. Ruled 2026-10-06 (C36): Know Your Type 5.items.11 gives that pointer, says Sanofi runs the site, and does not link to it; the free test stays held.',
  },
  'bt1d-facts-and-figures': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (undated): about 300,000 Canadians have type 1; about 71% are diagnosed as adults; 85% have no family connection. Not on the page: the "over 40% first treated as type 2" figure, which is Holt 2021. Ruled 2026-10-06 (C39): the 71% is a modelled estimate, so the landing, Know Your Type 1.items.2 and the type 1 path say "Breakthrough T1D estimates".',
  },
  'bt1d-trialnet': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: a free at-home finger-stick kit or lab draw, anywhere in Canada; immediate relatives aged 2–45, other relatives 2–20; results in 4–6 weeks; people who test positive are monitored and may join prevention trials. No DKA teaching on the page.',
  },
  'bt1d-tzield-update-2026': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (5 Jan 2026): CDA-AMC’s final recommendation is "do not reimburse", as was INESSS’s (Oct 2025); testing to find stage 2 is only through TrialNet, for relatives. Conflicts with the UncoverT1D programme and the BC handout, which describe testing beyond relatives. French page « Mise à jour au sujet de Tzield » (Percée DT1) read 2026-10-06. Ruled 2026-10-06 (C26): the delay ("about 2 years") rests on Canada’s Drug Agency and the Health Canada monograph, not on Breakthrough’s TrialNet page’s "average of three years".',
  },
  'bt1d-mental-health-support': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: the Mental Health + Diabetes Directory (directory.breakthrought1d.ca), with information "about registered mental health providers" for people living with or affected by diabetes (it does not say they know diabetes), and a Caregiver Guide for parents and caregivers of children and adolescents living with T1D. Only the guide’s existence and audience were checked, not its contents. Re-read 2026-10-05 (This Might Be You card 5): "The Caregiver Guide is for parents and caregivers of children and adolescents living with T1D"; the directory is "intended to provide people living with or affected by diabetes with access to information about registered mental health providers". French page (hrefFr) opened 2026-10-06 for Every Day Living\'s resources shelf: Percée DT1, « Soutien en santé mentale », with the « Répertoire Santé mentale + Diabète » (information about licensed mental health care providers).',
  },
  'bt1d-coverage-map': {
    publisher: BT1D,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: pump, flash and CGM coverage and age criteria by province. No last-updated date; content dates from about Sep 2024 to early 2025, so it misses the 2025–2026 changes. Cross-check only.',
  },
  'canscreen-t1d': {
    publisher: 'CanScreen T1D Research Consortium (funded by Breakthrough T1D and CIHR)',
    type: 'other',
    locator:
      'Paraphrase: research into screening newborns and children for type 1, launching fall 2026 / winter 2027.',
  },
  'das-low-blood-sugar': {
    publisher: DAS,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: below 4 mmol/L is low; treat right away, where it occurs, and do not bring the student to another location; never leave a student alone. No children’s carbohydrate amounts (use chapter 41). Open for the nurse: 4.0 here vs 3.9 in the hypoglycemia chapter. The page’s list of signs of a low was saved but was not part of the Staying Safe check; re-check before citing it.',
  },
  'das-glucagon': {
    publisher: DAS,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: covers nasal glucagon; have someone call 911, then the parents; turn the student on their side and stay; do not put anything in their mouth (choking hazard); with signed consent and agreement, usually in the Individual Care Plan, staff named in the plan, and trained, give glucagon.',
  },
  'cps-t1d-in-school-2015': {
    publisher: 'Canadian Paediatric Society',
    type: 'canadian-guideline',
    locator:
      'Paraphrase (position statement, 6 Feb 2015): an individual care plan before the start of the school year; at least 2 school staff trained; glucagon training. Check the statement has not been retired before publishing.',
  },
  'dq-all-about-injections': {
    publisher: 'Diabète Québec',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: 4–6 mm needles; rotate sites 1–2 cm apart; unopened insulin in the refrigerator (2 to 8 °C), never frozen or above 30 °C; opened insulin up to 28 days (42 for detemir). Re-read word for word by the Your Tools source check (2026-10-05): "Use short needles (4 mm, 5 mm or 6 mm) to avoid intramuscular injections"; in adults a skin lift should be used with a needle of 8 mm or longer, and may not be necessary with a 4 mm needle; a skin fold might be justified with a 5 or 6 mm needle where there is little fat; at least 1 to 2 cm (1 finger width) between sites, each area split into quadrants used a week each; regularly examine and palpate injection areas; avoid scars and beauty marks; injecting into a limb about to be exercised speeds the insulin and lowers blood glucose; check the vial or cartridge has not expired. The EN page says it is adapted from FIT 2015 (© January 2017, updated January 2019; reviewed by an RN), with 28 days in use (42 for detemir). The French page « Tout sur l’injection » (hrefFr, read 2026-10-06) is © Diabète Québec, January 2017, updated December 2025; it cites FIT Canada 4th ed. (2020) and is « Adapté de » a FIT PDF hosted by embecta (fit4diabetes.com/wp-content/uploads/2025/09/EMB-25-441-FIT-Recommendations-Update-Layout_F00-1.pdf); it gives in-use times of 28 days (42 for detemir and Toujeo, 56 for degludec), says a skin fold is « recommandé si on utilise une aiguille de 8 mm », and to avoid injecting within 2 to 3 cm of the navel. Ruled 2026-10-06 (C14): Diabète Québec is a Canadian non-industry patient organization that publishes and reviews these lines under its own name, so they stay live beside Diabetes Canada’s; lines whose only source is FIT stay held. Ruled 2026-10-06 (C15): "most are good for up to 28 days once opened, and some for longer" is cited to this page (Your Tools card 11, Staying Safe card 10). Reviewer evidence on in-use times from the Health Canada monographs (C7): Toujeo 42 days, Humalog 28, Tresiba 56, Awiqli 12 weeks, Entuzity 28.',
  },
  'dq-infodiabetes-service': {
    publisher: 'Diabète Québec',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (EN and FR pages opened 2026-10-06; Every Day Living resources shelf): questions about diabetes answered by Diabète Québec\'s "health professionals" (FR « professionnelles de la santé »), by phone (1-800-361-3504), email or chat, with a reply in 2 to 3 working days; "Diabetes Quebec services are not emergency services. If you need emergency help, dial 911." No fee is stated, so the shelf does not call it free. No industry sponsor on the page.',
  },
  'dq-trips': {
    publisher: 'Diabète Québec',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (EN "Trips" and FR « Voyages », opened 2026-10-06; Every Day Living resources shelf): two sections, planning your trip and buying travel insurance. No product promotion on the page.',
  },
  'dq-low-blood-sugar-leaflet-2025': {
    publisher: 'Diabète Québec',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (© Diabetes Québec 2025; file names dated 11/2025; EN and FR leaflets read 2026-10-06): low blood sugar is less than 3.9 mmol/L, with or without symptoms; 15 g of fast carbohydrate is 150 ml (2/3 cup) of a regular soft drink, fruit beverage or fruit juice, or 15 ml (1 tbsp) of corn syrup, honey or maple syrup, or 15 ml of sugar dissolved in water, or candies (e.g. 6 Life Savers); wait 15 minutes, then measure again. Cited for the leaflet, not Diabète Québec’s web page. Backs 3.9 (C1) and ⅔ cup (C13) on Staying Safe cards 1 and 2, in French as well as English.',
  },
  'sogc-glucose-testing': {
    publisher: 'Society of Obstetricians and Gynaecologists of Canada (Pregnancy Info)',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: screening offered at 24–28 weeks; on the 50 g one-hour test, under 7.8 needs nothing further and 7.8–11.1 leads to a 75 g OGTT.',
  },
  'wounds-canada-diabetic-foot-ulcers': {
    publisher: 'Wounds Canada',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: how nerve damage and poor circulation lead to foot ulcers. The "15–34%" and "80%" figures often credited to it are not on this page.',
  },
  'wounds-canada-foot-emergency': {
    publisher: 'Wounds Canada (Canadian Association of Wound Care); in French, Plaies Canada',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (Care at Home Series, © 2021 Canadian Association of Wound Care, 1941r1E; FR 1941r1F; both PDFs read 2026-10-06): a three-tier chart (regular self care, frequent at-risk care, "Immediate, Urgent Care"); in the red area, "DO NOT WAIT. Waiting may put you at greater risk of infection and amputation. See your doctor immediately or go to the emergency department of your nearest hospital"; the urgent tier includes an open area, signs of infection, a red and warm foot changing shape, blackened skin and pain at rest; "If you have an open area (or a crack)", see a health-care professional immediately. Backs Every Day Living 8.items.7’s right-away tier (ruling C10). The tier is not conditioned on fever. The French file is a token link from Wounds Canada’s French care-at-home page: it worked 2026-10-06; re-check it before publishing and on the recheck schedule.',
  },
  'cos-diabetic-retinopathy': {
    publisher: 'Canadian Ophthalmological Society',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: "People with diabetes should schedule examinations at least once a year"; pregnant women with diabetes should book in the first trimester. The French page « La rétinopathie diabétique » (modified 2025-03-18, read 2026-10-06) says the same. Ruled 2026-10-06 (C24): it comes after Diabetes Canada’s patient page on Every Day Living card 9, each body credited for its own pregnancy advice.',
  },
  'cnib-diabetic-retinopathy': {
    publisher: 'CNIB',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: see your eye doctor immediately for dark spots, blurred, distorted or double vision, or large floaters; "Sight lost from diabetic retinopathy can’t be restored, but with early detection, treatment is often very successful and can prevent your sight from getting worse".',
  },
  'cnib-floaters-and-flashing-lights': {
    publisher: 'CNIB (content © Canadian Ophthalmological Society)',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (undated; EN read 2026-10-06; the French link 301-redirects to inca.ca, read the same day): "Sometimes, however, there is a sudden occurrence of flashing lights with many new floaters or even with a blacking out of part of the field of vision. If this happens, you should see your ophthalmologist right away to find out if you have a retinal tear or retinal detachment"; the sudden appearance of new floaters is a reason to see the ophthalmologist. Backs Every Day Living 9.items.6’s right-away tier (ruling C10). The emergency-department fallback ("if you can’t be seen today") is a protective default the page does not state. Do not cite the Fighting Blindness Canada page for this (adapted from US NIDDK, no French page).',
  },
  'hsf-heart-attack-signs': {
    publisher: 'Heart and Stroke Foundation of Canada',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (read 2026-10-05; page updated 2026-09-30): the signs of a heart attack are chest discomfort (pressure, squeezing, fullness or pain, burning or heaviness), sweating, upper body discomfort (neck, jaw, shoulder, arms, back), nausea, shortness of breath and light-headedness; "If you experience any of these signs, call 9-1-1 or your local emergency number immediately"; then "Stop all activity" and sit or lie down. Women may have a heart attack without chest pressure. The French page (coeuretavc.ca, "Les signes d’une crise cardiaque") says the same: "composez immédiatement le 9-1-1". Registered for Every Day Living card 3 (held line H2, ruling D4 / C3), which now carries the 911 line. The page also gives ASA and nitroglycerin steps: dosing, so not repeated anywhere on the site. It would also back the heart-attack half of held line H1 (card 11); the stroke signs are on a separate page, not registered.',
  },
  'kfoc-end-diabetic-kidney-disease': {
    publisher: 'Kidney Foundation of Canada',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: diabetes is the leading cause of kidney failure; about 4 in 10 new dialysis patients have diabetes; Indigenous people have about 3 times the rate of end-stage kidney disease; test yearly. Up to 50% of people with diabetes develop kidney damage. A fundraising campaign page: the facts are in a "Did you know?" list. Fine as a second source, weak as the only one. Ruled 2026-10-06 (C21): its statistics stay off the page. The Indigenous figure would need review by an Indigenous health partner, and none is available (owner, B1); the dialysis figure adds nothing the card needs.',
  },
  'ccsa-alcohol-guidance-2023': {
    publisher: 'Canadian Centre on Substance Use and Addiction',
    type: 'canadian-guideline',
    locator:
      'Paraphrase (EN and FR re-read 2026-10-06; the registered substance-use-and-addiction address now lands on the substances one, which is the `href`): a continuum of 0, 2 or fewer ("You are likely to avoid alcohol-related consequences for yourself or others at this level"), 3–6 and 7 or more standard drinks a week; more than 2 standard drinks per occasion raises the risk of harms, including injuries and violence; less is better; no known safe amount when pregnant or trying, and not drinking is safest when breastfeeding. Its FAQ: "Is CCSA recommending that people limit their alcohol use to 2 drinks a week?" "No." Conflicts with the 2018 diabetes guideline limits (chapter 11 and the 2019 article). Ruled 2026-10-06 (C16): Every Day Living card 4 states its position in its own words, never as a limit.',
  },
  'hpsa-returning-medical-sharps': {
    publisher: 'Health Products Stewardship Association',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: programs in Manitoba, Ontario, Quebec, New Brunswick and PEI only; free containers at participating HPSA collection locations, which are pharmacies, vet clinics and dispensaries; a full container is sealed and returned to a drop-off location; the accepted list says "Pen tips" and "Needles" (not "pen needles"), lancets, "CGM applicators with needles", infusion sets and syringes; glucose meters are not accepted; never put used sharps in the garbage or recycling; over 8,000 drop-off sites. Nothing here covers the other provinces or the territories.',
  },
  'chs-hemochromatosis-condition': {
    publisher: CHS,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase (undated): about 1 in 300 Canadians, mostly of Northern European descent; C282Y and H63D cause 85% of cases, and two copies are needed; about 1 in 9 are carriers; it can affect the pancreas and lead to diabetes; men 40–60, women after menopause. "1 in 300" is people with two copies of the gene (the FAQ says so), not people with the disease: BC guidance says under 10% of them develop it. Never word it as "affects 1 in 300".',
  },
  'chs-hemochromatosis-faq': {
    publisher: CHS,
    type: 'canadian-patient-education',
    locator: `Paraphrase: lists "Type II Diabetes" as a later symptom; an iron panel is not part of the standard blood test and has to be asked for; genetic testing confirms; test all first-degree relatives; 1 in 300 have two copies of the gene that puts them at risk. Calls it type 2 where the guidelines class it as exocrine-pancreas diabetes. ${UNCHECKED_TITLE}`,
  },
  'chs-hemochromatosis-treatment': {
    publisher: CHS,
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: phlebotomy is the gold standard; "mild improvement in diabetes"; blood can be donated through Canadian Blood Services or Héma-Québec.',
  },
  'cf-canada-cfrd-guideline-2024': {
    publisher: 'Cystic Fibrosis Canada',
    type: 'canadian-guideline',
    locator:
      'Paraphrase (updated 2024; Coriati, Potter … Senior, Rabasa-Lhoret): 3.6% under 18 rising to 58.7% over 35; a yearly 2-step screen from age 10 starting with A1C (OGTT at 5.5–6.4%, confirm above 6.4%), not for inpatients, anaemia, lung transplant recipients or pregnancy; check islet antibodies; insulin first-line and the only drug for children, with some non-insulin options for adults at low risk; NPH timed with steroids in hospital; microvascular screening from 5 years after diagnosis; OGTT at 12–16 and 24–28 weeks in pregnancy; new-onset diabetes in 25–50% after transplant; a CDE on the team; a patient key-messages section. Listed on cysticfibrosis.ca. Conflicts with ISPAD 2022 and ADA 2026, which prefer the OGTT, and with ISPAD on non-insulin drugs. Ruled 2026-10-06: C27 (K5), Know Your Type 12.items.3 rests on it alone, and its A1C-first screen with the OGTT added when needed, or first when A1C is not reliable; C43, Recommendation IV is addressed to "Individuals with CFRD (and their families/carers)", with education on hypoglycemia "including the use of glucagon for insulin-treated individuals", so Know Your Type 12.items.5 and the less common types path row 11 name families and carers, and say someone else gives glucagon (bt1d-what-is-glucagon). Owner answer 2026-10-06 (B36, "Only use official source"): the entry now links Cystic Fibrosis Canada’s own page, "Guidelines & Standards of Care" (cysticfibrosis.ca/guidelines-and-standards-of-care, opened 2026-10-06), which lists the guideline as "Cystic Fibrosis Related Diabetes (CFRD): A First Canadian Clinical Practice Guideline" and links the PDF this entry used to point at (cystic-fibrosis.cdn.prismic.io/cystic-fibrosis/ZvGg0bVsGrYSvuX4_NA-ENG2024CFRDGuidelines-Branded-.pdf). French (hrefFr): the same organization’s French site, fibrosekystique.ca, "Normes de soins de la FK et lignes directrices cliniques" (the English page’s own hreflang link, opened 2026-10-06), which links the French guideline, "Diabète associé à la fibrose kystique : premières lignes directrices de pratique clinique Canadiennes".',
  },
  'cma-drivers-guide-endocrine': {
    publisher: "Canadian Medical Association (CMA Driver's Guide, 10th ed.)",
    type: 'canadian-guideline',
    locator:
      'Paraphrase: no commercial licence after severe hypoglycemia while awake, or hypoglycemia unawareness, in the past 6 months. Clinician-facing.',
  },
  'patel-cpsp-monogenic-2023': {
    publisher:
      'Pediatric Diabetes (Patel … Amed; a Canadian Paediatric Surveillance Program study)',
    type: 'other',
    locator: `Paraphrase: monogenic diabetes in Canadian children at 0.21 per 100,000 a year (2006–08) and 0.23 (2017–19), no significant change; 19 of the 29 cases with genetic results in 2017–19 were GCK; it does not say where testing was done. It covers all non-type 1 diabetes in children (type 2, medication-induced and monogenic), not monogenic alone. Read via Europe PMC (PMC12017104).`,
  },
  'bcdiabetes-autoantibody-testing': {
    publisher: 'BCDiabetes (clinic handout)',
    type: 'canadian-patient-education',
    locator: `Paraphrase: none of these tests is covered by MSP; LifeLabs offers only GAD65, privately at $232; GAD65 from Alberta Precision Labs at $63 plus shipping; mIAA, IA-2 and ZnT8 from In-Common Labs at $280.75 plus shipping; free finger-prick testing through Sanofi from age 8 and TrialNet under 8. Stamped 2023-May-18 but mentions Tzield, so its real update date is unclear. ${UNCHECKED_TITLE}`,
  },
  'clinicaltrials-addam-nct03988764': {
    publisher:
      "ClinicalTrials.gov (study by McGill University Health Centre, Montreal Children's Hospital)",
    type: 'other',
    locator:
      'Paraphrase: the ADDAM study, ages 0–25 with type 1 or undetermined diabetes — a 4-antibody screen, then whole-exome sequencing if all are negative; recruiting when last checked (Dec 2024) with completion estimated Dec 31, 2025, so it may now be closed.',
  },
  'cdecb-find-a-cde': {
    publisher: 'Canadian Diabetes Educator Certification Board (CDECB)',
    type: 'canadian-patient-education',
    locator:
      'Paraphrase: a search by name or location; lists only the CDEs who opted in, some of whom may see people without a referral; the CDE®/EAD® credential is valid only with a full licence to practise in a regulated profession; a separate link verifies a designation. The directory page does not spell out CDE: "Certified Diabetes Educator" needs another source (`cdecb-home`, the CDECB home page, proposed and not yet registered). English page. Loaded (HTTP 200) and read 2026-10-05. The help band’s directory card; the owner should confirm it is the directory they want.',
  },
  'bep-about': {
    publisher: 'Bayshore Express Pharmacy (Bayshore Specialty Rx Ltd.)',
    type: 'other',
    locator:
      'Liivv’s own pharmacy, not a health source. Paraphrase (page modified 2023-03-22; opened 2026-10-06): "We have Certified Diabetes Educators to provide you with excellent solutions for diabetes management"; storage and shipment "in a controlled and monitored environment". Its contact block, the same on every page of the site: 1-844-561-1254 (toll-free), BayshoreExpress@bayshore.ca, Monday to Friday 9 a.m. to 5 p.m. (EST), 233 Alden Rd, Markham, ON. French page (hrefFr, "À propos de nous - Pharmacie Bayshore Express", modified 2023-03-23): "Nous avons des éducateurs et des éducatrices agréés en diabète"; the phone written "1 844 561-1254". Neither page names another retailer; the home page does, so it is not linked. Owner answers 2026-10-06 (A2, B5, B9, B10, B12): the CDEs at Bayshore Express Pharmacy answer all CDE-related questions from anywhere in Canada (pumps, sensors, meters, supplies, billing and claims) and transfer to the Liivv pharmacy in another province when needed; the contact is the pharmacy’s general line and email, never a named person; closed on holidays. Backs `ui.contact` and every CDE panel and lane (DIABETES_SITE.contact in site.ts). Commerce step, 2026-10-06 (owner answers A1, A8, B3, B11, B29: "the pharmacist reviews all insulin and glucagon orders - we ship coldchain - insulin is not available for purchase online for Quebec but can be shipped - pharmacist can contact customer first"; "Insulin cant be advertised to Quebec, can be billed and shipped there (if person is privately paying)"): also the phone in `ui.commerce.quebecInsulinCheckout` (through `{phone}`, `ui.contact.phone`), the checkout’s message when a cart with insulin is shipped to Quebec. The notice under the buy box of insulin and glucagon product pages (`ui.commerce.pharmacistNotice`, `quebecInsulin`) rests on those answers alone; this page’s "controlled and monitored environment" is not cited for cold-chain.',
  },
  '988-suicide-crisis-helpline': {
    publisher: '9-8-8: Suicide Crisis Helpline (Canada)',
    type: 'other',
    locator:
      'Paraphrase: call or text 9-8-8, 24/7, in English and French; "If your safety is at risk, call 9-1-1 right away". The engine crisis strip’s number. New to the Journey card 1, Every Day Living card 5 and This Might Be You card 5 show the strip, each with 9-1-1 (written 911) beside 9-8-8 on the strength of that line. Staying Safe card 11 has none (it was taken off in the review of 2026-10-05, as that card’s verified copy has no self-harm line). Other lines (Kids Help Phone, Wellness Together Canada) have not been checked.',
  },
  'napra-nds-insulin': {
    publisher: 'National Association of Pharmacy Regulatory Authorities (NAPRA)',
    type: 'other',
    locator:
      'Paraphrase: the National Drug Schedules entry for insulin: "Schedule: II", approval date September 23, 1998. Under the national model a Schedule II drug needs no prescription, and is sold from behind the counter with a pharmacist involved; drug plans still need a prescription to pay, and a province may schedule differently. Fetched and read 2026-10-05. Registered for the landing’s held "Behind the counter" line on insulin and glucagon tiles (landing E5); no live line cites it yet.',
  },
  'ismpc-dose-confusion-2019': {
    publisher: 'ISMP Canada (Institute for Safe Medication Practices Canada)',
    type: 'other',
    locator:
      'Paraphrase (ISMP Canada Safety Bulletin, 2019-11-28, Vol 19 Issue 9; EN and FR read 2026-10-06): "Insulin products are supplied predominantly as solutions with a standard concentration of 100 units/mL"; several high-concentration products (above 100 units/mL) are available for people who need high doses, "often provided in product-specific injection delivery devices"; "Several high-concentration insulin products are currently available in Canada (Table 1) and each product is marketed in its own prefilled injection delivery device (known as an insulin pen)" (re-read 2026-10-06). Backs Your Tools 8.items.2 (most insulin is U-100; stronger ones each come in their own pen; ruling C7).',
  },

  /* ---------- Canadian: government programs, benefits and notices ---------- */
  'hc-glucagon-supply-notice': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator: `Paraphrase (with the Diabetes Canada Baqsimi notice; which page carries which fact was not recorded): injectable glucagon depends on imports of Amphastar’s US product under an exceptional permission that runs to Dec 31, 2026; Lilly’s kit and GlucaGen are discontinued; Lupin’s glucagon was authorized Jun 10, 2026 with no launch date; Baqsimi is now owned by Amphastar. No evidence Gvoke or Zegalogue are sold in Canada. Re-read before any availability claim; the copy sends readers to their pharmacist. ${UNCHECKED_TITLE}`,
  },
  'hc-alert-humalog-200-2015': {
    publisher: 'Health Canada, Recalls and safety alerts (archived)',
    type: 'canadian-government',
    locator:
      'Paraphrase (2015-09-14, archived; EN and FR read 2026-10-06): the 200 units/mL insulin is to be used only with its own KwikPen; "Using any other type of device, like a syringe or infusion pump may result in an overdose causing severe low blood sugar"; the carton carries "DO NOT TRANSFER TO A SYRINGE SEVERE OVERDOSE CAN RESULT". Backs Your Tools 8.items.5 (ruling C7).',
  },
  'hc-dpd-pm-humalog': {
    publisher: 'Eli Lilly Canada Inc. / Health Canada Drug Product Database',
    type: 'canadian-government',
    locator:
      'Product monograph authorized by Health Canada and served by its Drug Product Database; the text is written by the sponsor (Eli Lilly Canada). Paraphrase (revised 2021-04-12; DPD 92402, marketed; EN and FR read 2026-10-06): the insulin in the HUMALOG 200 units/mL KwikPen cannot be transferred from the prefilled pen to other devices, such as a syringe, and overdose can result, causing severe hypoglycemia; keep a spare pen; discard 28 days after first use. Backs Your Tools 8.items.2 and 8.items.5 (ruling C7); in-use time is reviewer evidence for C15.',
  },
  'hc-dpd-pm-toujeo': {
    publisher: 'sanofi-aventis Canada Inc. / Health Canada Drug Product Database',
    type: 'canadian-government',
    locator:
      'Product monograph authorized by Health Canada and served by its Drug Product Database; the text is written by the sponsor (sanofi-aventis Canada). Paraphrase (300 U/mL; revised 2020-05-12; DPD 92621 and 98339, marketed; EN and FR read 2026-10-06): "Never use a syringe to remove insulin from your pen"; "Always carry a spare pen and spare needles in case they got lost or stop working"; 42 days in use. Backs Your Tools 8.items.2, 8.items.5 and 8.note (ruling C7); in-use time is reviewer evidence for C15.',
  },
  'hc-dpd-pm-tresiba': {
    publisher: 'Novo Nordisk Canada Inc. / Health Canada Drug Product Database',
    type: 'canadian-government',
    locator:
      'Product monograph authorized by Health Canada and served by its Drug Product Database; the text is written by the sponsor (Novo Nordisk Canada). Paraphrase (revised 2022-10-27; DPD 95624 is the 200 U/mL FlexTouch, 95622 and 95623 are U-100; EN and FR read 2026-10-06): "Do not transfer Tresiba from the Tresiba pen to a syringe"; "Always carry an extra pen and new needles with you, in case of loss or damage"; 56 days in use. Backs Your Tools 8.items.2, 8.items.5 and 8.note (ruling C7); in-use time is reviewer evidence for C15.',
  },
  'hc-dpd-pm-entuzity': {
    publisher: 'Eli Lilly Canada Inc. / Health Canada Drug Product Database',
    type: 'canadian-government',
    locator:
      'Product monograph authorized by Health Canada and served by its Drug Product Database; the text is written by the sponsor (Eli Lilly Canada). Paraphrase (500 units/mL; revised 2021-03-26; DPD 95524, marketed; EN and FR read 2026-10-06): a U-500 insulin is marketed in Canada; "Do not use a syringe to remove ENTUZITY from your ENTUZITY KwikPen"; it should not be transferred from the prefilled pen to other devices, such as a syringe; 28 days in use. Backs Your Tools 8.items.2 and 8.items.5 (ruling C7); in-use time is reviewer evidence for C15.',
  },
  'hc-dpd-pm-awiqli': {
    publisher: 'Novo Nordisk Canada Inc. / Health Canada Drug Product Database',
    type: 'canadian-government',
    locator:
      'Product monograph authorized by Health Canada and served by its Drug Product Database; the text is written by the sponsor (Novo Nordisk Canada). Paraphrase (700 units/mL; authorized 2025-12-12; DPD 103492–103494, prefilled pens, marketed since 2024-06-13; EN read 2026-10-06, DPD has no French monograph): never use a syringe to remove AWIQLI from the pen, to avoid dosing errors and potential overdose; 12 weeks in use. Backs Your Tools 8.items.2 and 8.items.5 (ruling C7); in-use time is reviewer evidence for C15.',
  },
  'hc-dpd-tzield-monograph-2026': {
    publisher: 'sanofi-aventis Canada Inc. / Health Canada Drug Product Database',
    type: 'canadian-government',
    locator:
      'Product monograph authorized by Health Canada and served by its Drug Product Database; the text is written by the sponsor (sanofi-aventis Canada). EN (authorized 2026-07-20) and FR read 2026-10-06. Paraphrase: to delay the onset of stage 3 type 1 diabetes in adults and children 8 years of age and older with stage 2; how stage 2 is confirmed (two or more antibodies, with dysglycemia); in the trial, "a difference of 24 months" in median time to stage 3. Backs Know Your Type 5.items.3 and 5.items.10, and "Sanofi makes teplizumab" in 5.items.11 (rulings C26, C27, C36). No dosing is used.',
  },
  'cda-amc-tzield-recommendation-2026': {
    publisher: 'Canada’s Drug Agency (CDA-AMC)',
    type: 'canadian-government',
    locator:
      'Paraphrase (Drugs Health Technologies Health Systems, Vol 6 Issue 1, January 2026; sponsor Sanofi-aventis Canada Inc.; read 2026-10-06): CDEC recommends that teplizumab not be reimbursed to delay the onset of stage 3 type 1 diabetes in people 8 years and older with stage 2; in one trial it likely delayed progression to stage 3 by approximately 2 years; it may cause more adverse effects, "including serious ones", and there is no information on long-term safety. Its French project page (cda-amc.ca/fr/teplizumab, « Ne pas rembourser ») links only the English PDF. Backs Know Your Type 5.items.4 and 5.items.10 (rulings C26, C27).',
  },
  'hc-healthy-eating-recommendations': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      'Paraphrase: plenty of vegetables, fruit, whole grains and protein foods, plant protein more often; water as the drink of choice; limit highly processed foods. The food-guide.canada.ca address now shows "page moved".',
  },
  'hc-infant-botulism': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator:
      'Paraphrase (modified 2023-02-16; EN and FR read 2026-10-06): in Canada, honey is the only food linked to infant botulism; "Do not give any type of honey to infants (babies who are less than one year old)"; never add honey to an infant’s food, water, formula or soother; only give honey to healthy children over one year of age. Backs the child-view honey note on Staying Safe card 2 (ruling C18).',
  },
  'phac-folic-acid': {
    publisher: 'Public Health Agency of Canada',
    type: 'canadian-government',
    locator:
      'Paraphrase (modified 2025-10-20, EN and FR; read 2026-10-06): 400 mcg (0.4 mg) of folic acid a day in a multivitamin for anyone who could become pregnant; "However, some people need a higher dose"; diabetes is one of the medical conditions that can affect folate levels; don’t increase the dose beyond 1 mg a day without talking to a health care provider. Backs This Might Be You 1.sections.1.items.3, which gives no amount (ruling C19). Re-open before publishing.',
  },
  'hc-pharmacare-bilateral-agreements': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator: `Paraphrase: national pharmacare agreements signed with Manitoba (Feb 27, 2025), BC (Mar 6), PEI (Mar 7) and Yukon (Mar 20), and no other province or territory; last modified Jan 26, 2026. ${UNCHECKED_TITLE}`,
  },
  'hc-diabetes-device-fund-2024': {
    publisher: 'Health Canada',
    type: 'canadian-government',
    locator: `Paraphrase (Feb 29, 2024): universal access to diabetes medications, and a Diabetes Device Fund for devices and supplies, announced; the fund’s details are still pending. ${UNCHECKED_TITLE}`,
  },
  'parl-bill-c64-pharmacare': {
    publisher: 'Parliament of Canada (LEGISinfo)',
    type: 'canadian-government',
    locator: `Paraphrase: the Pharmacare Act (Bill C-64) received Royal Assent on Oct 10, 2024. ${UNCHECKED_TITLE}`,
  },
  'cra-dtc-life-sustaining-therapy': {
    publisher: 'Canada Revenue Agency',
    type: 'canadian-government',
    locator: `Paraphrase: type 1 automatically meets the life-sustaining therapy test for 2021 onward; otherwise therapy is needed at least 2 times a week for an average of 14 hours a week, and time a pump spends delivering insulin does not count; apply with form T2201 or online. Re-read 2026-10-05 (This Might Be You card 2): "People with Type 1 diabetes meet the eligibility criteria under life-sustaining therapy… for 2021 and later years"; form T2201 is still needed, Part B certified by a medical practitioner, Part A online or by phone. Page title "Life-sustaining therapy", date modified 2023-01-24. French page (hrefFr, "Soins thérapeutiques essentiels : Critères d’admissibilité"), the English page’s own language link, opened 2026-10-05.`,
  },
  'cra-dtc-how-to-apply': {
    publisher: 'Canada Revenue Agency',
    type: 'canadian-government',
    locator:
      'Paraphrase (date modified 2025-11-28; EN and FR read 2026-10-06): "You may apply for the DTC using the digital form or the printed paper form"; "You can apply online or by phone using the digital form"; "You can apply by mail using the paper form"; "Both Part A and Part B must be submitted using the same method"; a call centre agent at 1-800-959-8281 or the automated voice service at 1-800-463-4421 can fill in Part A; a medical practitioner completes Part B online with the reference number. Funding step (releases E-27, F-32): backs `fed-dtc.howToApply`, the three `ui.fundingResults.dtc*Body` lines and the CRA phone on the DTC row (owner answer B22).',
  },
  'cra-rc4064-2025': {
    publisher: 'Canada Revenue Agency',
    type: 'canadian-government',
    locator:
      'Paraphrase: type 1 is deemed to qualify for life-sustaining therapy (at least twice a week, at least 14 hours a week); the time a pump spends delivering insulin does not count. French guide (`hrefFr`, "Renseignements relatifs aux personnes handicapées 2025"), the English page’s own language link, opened 2026-10-05.',
  },
  'cra-rc4065-2025': {
    publisher: 'Canada Revenue Agency',
    type: 'canadian-government',
    locator:
      'Paraphrase (Medical Expenses 2025, date modified 2026-01-20; EN and FR read 2026-10-06): eligible medical expenses include "Infusion pump including disposable peripherals used in treating diabetes, or a device designed to allow a person with diabetes to measure their blood sugar levels – prescription needed"; "Injection pens designed to be used to give an injection, such as an insulin pen – prescription needed"; "Needles and syringes – prescription needed"; "Insulin or substitutes – prescription needed". Test strips and lancets are named only under anticoagulation monitors, so the copy does not name them; the "mobile applications" exclusion was not re-checked and is not used. Funding step (releases E-14; the proposed F-26 address now returns 404): backs the federal row `fed-medical-expenses`.',
  },
  'esdc-rdsp-apply': {
    publisher: 'Employment and Social Development Canada',
    type: 'canadian-government',
    locator: `Paraphrase: you must be approved for the disability tax credit; a plan can be opened until Dec 31 of the year the person turns 59; grants and bonds are paid only until the year they turn 49. ${UNCHECKED_TITLE}`,
  },
  'isc-nihb-updates': {
    publisher: 'Indigenous Services Canada (Non-Insured Health Benefits)',
    type: 'canadian-government',
    locator:
      'Paraphrase (page dated Jul 30, 2026): CGM for anyone managing diabetes with insulin — Libre 2, Dexcom G6/G7 and Guardian Connect; Libre 3 added Sep 2025 with prior approval (1 reader every 3 years, 14 sensors every 6 months); test strips up to 800 per 100 days; the 14-sensor and 800-strip limits are for "clients managing diabetes with insulin"; "Guardian Link 4 Transmitter Kits for the 780G… and Guardian Sensor 4" covered for clients 19 or younger on intensive insulin with type 1, added Dec 2024 (the one listing that pairs Guardian 4 with the 780G now that MiniMed\'s page does not name it). Also reached at sac-isc.gc.ca/eng/1578079214611. Re-read 2026-10-05 (This Might Be You card 6): a client must be a resident of Canada and one of: a First Nations person registered under the Indian Act, an Inuk recognized by an Inuit land claim organization, or a child under 2 whose parent is an NIHB-eligible client; CGM is a limited-use benefit for clients managing diabetes with insulin, with prior approval. Who gets benefits from another plan instead is on the eligibility page (isc-nihb-eligibility), not here. French page (`hrefFr`, "Mises à jour du Programme des services de santé non assurés", dated 2026-07-30), the English page’s own language link, opened 2026-10-05; it lists the same Libre 3 change.',
  },
  'isc-nihb-eligibility': {
    publisher: 'Indigenous Services Canada (Non-Insured Health Benefits)',
    type: 'canadian-government',
    locator:
      'Paraphrase (checked live; date modified 2026-05-28): who is eligible for NIHB, and who gets benefits from another plan instead of from NIHB directly: First Nations residents of BC who are clients of the First Nations Health Authority, Nisga’a, Nunatsiavut, Nunavik Inuit and James Bay Cree (beneficiaries living in the land-claim region), Bigstone Cree Nation and Akwesasne. Re-opened 2026-10-06 in both languages (still dated 2026-05-28): "To be eligible, a client must be a resident of Canada, and one of the following"; "Coverage is available only for eligible goods and services obtained in Canada"; "Clients with questions about their eligibility should contact their NIHB regional office". Owner answers 2026-10-06 (B1: no Indigenous health partner to review the card; B2: "leave NIHB eligibility to what is available online - We would not be able to decide eligibility"): This Might Be You card 6 keeps only program facts, links this page for who is eligible and says Liivv can’t decide eligibility. The exceptions are not listed on the card, only here. French page (`hrefFr`, "Qui est admissible au Programme des services de santé non assurés (SSNA) pour les Premières Nations et les Inuit", dated 2026-05-28) opened 2026-10-05.',
  },
  'isc-nihb-pharmacy-benefits': {
    publisher: 'Indigenous Services Canada (Non-Insured Health Benefits)',
    type: 'canadian-government',
    locator:
      'Paraphrase (date modified 2025-10-07; EN and FR read 2026-10-06): NIHB covers prescription drugs and some over-the-counter products on its Drug Benefit List (open benefits, and limited use benefits "which may be eligible for coverage if the criteria for coverage are met"); it covers eligible benefits "when not available through provincial or territorial health insurance, private insurance plans, or other publicly-funded plans or programs"; "Providers who are enrolled with the NIHB program generally send in claims to bill the NIHB program directly. This means clients do not have to pay a deductible or co-payment"; clients show identification; a prescription from a licensed prescriber is needed; the list itself is on the Express Scripts Canada NIHB website, which this page links. Funding step (owner answer B2, "leave NIHB eligibility to what is available online"; releases E-15 and E-22): the first link of `fed-nihb`, the official list in place of any criteria. Nothing here says Liivv bills NIHB: that is not confirmed.',
  },
  'isc-nihb-contact': {
    publisher: 'Indigenous Services Canada (Non-Insured Health Benefits)',
    type: 'canadian-government',
    locator:
      'Paraphrase (read 2026-10-06, EN and FR): the NIHB call centre at Express Scripts Canada, "Client inquiries … 1-888-441-4777"; "Provider inquiries … 1-888-511-4666" (not used: it is for providers); the Drug Exception Centre (not used: for prescribers and pharmacists). Owner answer B22 (show program phone numbers): the client line on `fed-nihb`. French page re-read 2026-10-06 (full-site review): the section « Centre d’appels d’Express Scripts Canada pour le programme des SSNA », line « Ligne de demandes de renseignements pour les clients », which names the office on /fr (`officeFr`).',
  },
  'vac-cgm-type-1': {
    publisher: 'Veterans Affairs Canada',
    type: 'canadian-government',
    locator:
      'Paraphrase: CGM for type 1 under benefit code 401140; pre-authorization required; once per 5 calendar years. Re-pointed 2026-10-06 (funding step, F-31, releases E-23) to the base grid, read that day (date modified 2026-03-19): "Province Alberta"; "Benefit Code Number 401140"; prescriber "Nurse practitioner" or "Medical Doctor"; "Preauthorization Required Yes"; "Frequency 1/5 CY"; "NOTE 1 - PRESCRIBER NOT REQUIRED FOR REPLACEMENT DEVICE". The same rule is on the Manitoba ("-1") and Northwest Territories ("-5") grids read on 2026-10-05, so `fed-vac` drops its NWT note and is no longer marked partly confirmed. Its own French page (accents lost in its printed title) opened the same day.',
  },
  'vac-poc7-medical-supplies': {
    publisher: 'Veterans Affairs Canada',
    type: 'canadian-government',
    locator:
      'Paraphrase (policy effective April 1, 2019; date modified 2024-04-19; EN and FR read 2026-10-06): medical supplies under Program of Choice 7; "Examples include items such as: bandages, disposable gloves, diabetic test strips, colostomy bags, catheter and catheter supplies, syringes and needles, and splints and slings." Funding step (F-27, releases E-18): `fed-vac.notes`.',
  },
  'vac-contact': {
    publisher: 'Veterans Affairs Canada',
    type: 'canadian-government',
    locator:
      'Paraphrase (date modified 2026-09-17; read 2026-10-06): "Call toll-free 1-866-522-2122"; TDD/TTY 1-833-921-0071; Monday to Friday, 8:30 to 4:30, local time. Owner answer B22: the phone on `fed-vac`.',
  },
  'catsa-diabetic-supplies': {
    publisher: 'Canadian Air Transport Security Authority',
    type: 'canadian-government',
    locator:
      'Paraphrase: insulin, juice and gels are exempt from the 100 mL limit but must be declared separately; syringes need the needle guard on and the medication with you; pumps and CGMs are allowed. It recommends keeping medication properly labelled. "Date modified 2025-12-29". It names one pump system as an example of a permitted device; no chapter names it. French page « Fournitures pour diabétiques » (hrefFr, the page\'s own language link, same modified date) opened 2026-10-06 for Every Day Living\'s resources shelf.',
  },
  'chrc-human-rights-complaints': {
    publisher: 'Canadian Human Rights Commission',
    type: 'canadian-government',
    locator:
      'Paraphrase (EN and FR pages opened 2026-10-06, "Date modified: 2026-10-05"; Every Day Living resources shelf): as a federal human rights screening body, the Commission helps people work out whether they have the basis for a complaint and where to go, "whether through our federal system, or through another mechanism like a union grievance or a provincial or territorial human rights commission or tribunal"; a complaint under the Canadian Human Rights Act needs a ground of discrimination, a discriminatory action and "the name of the federally regulated organization where this happened". The page itself does not list the grounds, so the shelf does not name disability as one.',
  },
  'on-diabetes-equipment-and-supplies': {
    publisher: ONTARIO,
    type: 'canadian-government',
    locator:
      'Paraphrase: ADP pays 100% of the ADP price of a pump (type 1); pump supplies up to $2,400 a year, paid $600 a quarter; full rtCGM coverage if the criteria are met; $170 a year toward syringes and needles for seniors. Owner answer 2026-10-06 (B31, "Keep most up to date"): `on-adp-insulin-pumps` (ontario.ca/page/insulin-pumps-and-diabetes-supplies, which now redirects here with redirect_year=2022) is merged into this entry everywhere it was cited (the funding rows on-adp-pump and on-adp-cgm, `ui.fundingPage.movingIntro`, the less common types path’s funding door), and the old id is gone. Re-read 2026-10-06 for the merge: "100% of the ADP price of an insulin pump"; "up to a maximum of $2,400 a year for supplies used with an insulin pump, paid to you in $600 installments every 3 months"; "full coverage for real-time continuous glucose monitor sensors and transmitters up to a maximum allowable quantity per 24-month period"; assessment by a Diabetes Education Program registered with the ADP; "We aim to review your application within 8 weeks"; the first $600 "within 30 days of your application being approved"; renew the CGM supplies every 2 years; a replacement pump when your medical condition has changed, or the pump is worn out, out of its 5-year warranty and cannot be repaired at a reasonable cost (with a repair quote); "We do not cover costs to replace a lost pump or supplies or to repair pumps or supplies damaged through misuse or neglect"; seniors (65+) who need insulin every day and live at home, $170 a year toward syringes and needles. Funding step, 2026-10-06: the lost-or-misused line is back in `on-adp-pump.notes`, in the page’s own terms (D-22; the word "stolen" is not on the page); its own French page names the program "Programme d’appareils et accessoires fonctionnels (PAAF)" (owner answer B25). The page prints no phone number; the ADP line on the ADP cards comes from on-preventing-and-living-with-diabetes.',
  },
  'on-odb-coverage': {
    publisher: ONTARIO,
    type: 'canadian-government',
    locator:
      'Paraphrase: test strips a year under the Ontario Drug Benefit — 3,000 on insulin, 400 on drugs with a higher risk of lows, 200 on lower-risk drugs, 200 on diet or lifestyle alone; more needs a prescriber’s reason. Re-read 2026-10-06 ("Get coverage for prescription drugs", updated August 18, 2026): "Syringes, lancets, glucometers and other diabetic supplies are not covered by the ODB program"; the ODB program line, "telephone: 416-503-4586 (Toronto area)", "toll-free: 1-888-405-0405" (owner answer B22: the phones on the ODB rows). Its own French page ("Obtenez une prise en charge pour vos médicaments d’ordonnance") names the program "Programme de médicaments de l’Ontario (PMO)" (owner answer B25). Also the provincial drug plan Liivv’s Ontario pharmacy bills directly (owner answer B13, `DIRECT_BILLING`).',
  },
  'on-eo-notice-cgm-2025': {
    publisher: 'Ontario Ministry of Health',
    type: 'canadian-government',
    locator:
      'Paraphrase (Executive Officer Notice, printed July 24, 2025; read 2026-10-06): "Effective July 31, 2025, Ontario will fund Dexcom G7 Continuous Glucose Monitoring (CGM) System through the Ontario Drug Benefit (ODB) program"; "funded for ODB program recipients on insulin therapy"; "All ODB program recipients on insulin therapy for diabetes who have a valid prescription from a physician or nurse practitioner"; a maximum of 45 sensors "over the course of a 365-day period"; the receiver is listed too (or the phone app); claims are paid by the ministry to dispensers, less "any applicable co-payment" (not stated in copy: the ODB co-pay line is still open, B13); public line "ServiceOntario, Infoline at 1-866-532-3161 TTY 1-800-387-5559". Funding step (F-2, releases E-1; launch blocker D-24 cleared): `on-odb-cgm`.',
  },
  'on-odb-formulary-ed43-summary': {
    publisher: 'Ontario Ministry of Health',
    type: 'canadian-government',
    locator:
      'Paraphrase (Edition 43 Summary of Changes, November 2025, "Effective November 28, 2025"; read 2026-10-06): FreeStyle Libre 3 Plus sensor (PIN 09858386) and reader (09858385) listed; "All ODB eligible recipients on insulin therapy for diabetes who have a valid prescription from a physician or nurse practitioner"; "a maximum reimbursed quantity of 31 sensors over the course of a 365-day period". Funding step (F-3, releases E-1): `on-odb-cgm`.',
  },
  'on-preventing-and-living-with-diabetes': {
    publisher: ONTARIO,
    type: 'canadian-government',
    locator:
      'Paraphrase: Ontario’s own page on the Monitoring for Health Program, which is for insulin users and gestational diabetes. Re-read 2026-10-06 (updated June 08, 2026): 75% of a meter up to $75 every 5 years, of lancets and strips up to $920 a year, of a talking meter up to $300 every 5 years, "if letter from doctor confirms visual impairment" (added to `on-mfhp.covered` after the full-site review, 2026-10-06); eligibility is worded both "use insulin or have diabetes while pregnant" and "use insulin or have gestational diabetes" (an owner question, OPEN-QUESTIONS B39); "Your first claim form submitted to the Monitoring for Health Program must be signed by a doctor or nurse practitioner"; "Seniors aged 65 or older, social assistance recipients or Trillium Drug Program clients can only submit to this program for lancets and/or a blood glucose meter"; "call Diabetes Canada at 1-800-361-0796"; "call the ADP toll free at 1-800-268-6021 (in Toronto 416-327-8804)". Ruled 2026-10-06 (D-21, clinical direction to use verified Canadian sources): the government page supersedes Diabetes Canada’s "no age limit" line, which was for the 2025–26 program year only; `on-mfhp.who` now carries the government line and the card is no longer marked partly confirmed. Its own French page ("Prévenir le diabète ou vivre avec cette maladie") names the "Programme de surveillance pour une bonne santé de l’Ontario" (owner answer B25).',
  },
  'on-ohip-lab-schedule-2026': {
    publisher: 'Ontario Ministry of Health (OHIP)',
    type: 'canadian-government',
    locator: `Paraphrase (effective 2026-04-01): lists L346 C-peptide and L326 insulin antibodies as insured community lab tests; GAD, IA-2 and ZnT8 are not listed one by one. A fee-schedule listing does not by itself establish a patient’s coverage; hospital-lab status is unverified. ${UNCHECKED_TITLE}`,
  },
  'on-form-014-4521-84': {
    publisher: 'Government of Ontario (Ministry of Health)',
    type: 'canadian-government',
    locator:
      'Paraphrase: the form for prior approval of full payment for insured out-of-country and out-of-province lab and genetics testing; a contact address is on the GS Ontario FAQ. No MODY-specific criteria found.',
  },
  'on-health-genetics-clinics': {
    publisher: 'Ontario Health',
    type: 'canadian-government',
    locator: `Paraphrase: clinics offering Ontario Health funded genetic testing and counselling; most do not accept self-referral, so a clinician has to refer; diabetes is not mentioned. ${UNCHECKED_TITLE}`,
  },
  'bc-national-pharmacare': {
    publisher: `${BC} (PharmaCare)`,
    type: 'canadian-government',
    locator: `Paraphrase: from Mar 1, 2026, $0 for insulins, metformin, glyburide, gliclazide, dapagliflozin, empagliflozin and empagliflozin/metformin (linagliptin, pioglitazone and saxagliptin need Special Authority); wider device and supply coverage from Apr 1, 2026; automatic for anyone enrolled in MSP. Supply quantities came from a third-party page and are not confirmed here. ${UNCHECKED_TITLE}`,
  },
  'bc-diabetes-pins': {
    publisher: `${BC} (PharmaCare)`,
    type: 'canadian-government',
    locator: `Paraphrase (updated Sep 17, 2026): the device list includes Dexcom G6/G7, Libre 2, Libre 3 Plus, MiniMed 670G/770G/780G, Omnipod DASH, Omnipod 5 and the mylife YpsoPump; Tandem was not on the list seen; some devices need Special Authority. Since 2026-10-06 the BC pump card links the patient page (bc-insulin-pumps) first; this page still backs the Tandem supply names in its note (owner answer B23: brand names may appear where a program lists them). ${UNCHECKED_TITLE}`,
  },
  'bc-insulin-pumps': {
    publisher: `${BC} (PharmaCare)`,
    type: 'canadian-government',
    locator:
      'Paraphrase (last updated July 15, 2026; read 2026-10-06): pump coverage for people on Fair PharmaCare or Plan B, C, F or W, with "type 1 diabetes or another form of diabetes requiring insulin", confirmation from their endocrinologist or diabetes specialist, and Special Authority approval; the specialist submits the request, and the approval letter goes to the pump maker; "PharmaCare cannot provide retroactive coverage for purchases made before your approval is confirmed"; pumps covered: Omnipod DASH and Omnipod 5 (Insulet), mylife YpsoPump (Ypsomed), MiniMed 670G, 770G and 780G (Medtronic); on Fair PharmaCare you pay until the deductible, then "PharmaCare covers 70% of eligible costs", and 100% after the family maximum; Plans B, C, F and W, 100%; supplies (pods, infusion sets, reservoirs and cartridges, not batteries or adhesive pads) are covered whether or not the pump was, "Special Authority pre-approval is not required for insulin pump supplies", when bought "from pharmacies and approved insulin pump vendors who submit claims on PharmaNet"; no paper claims. Funding step (owner answer A6, every pump program): the first link of `bc-pharmacare-pumps`.',
  },
  'bc-sa-insulin-pumps': {
    publisher: `${BC} (PharmaCare)`,
    type: 'canadian-government',
    locator:
      'Paraphrase (last updated December 18, 2025; read 2026-10-06): form HLTH 5375; "Coverage is provided for one insulin pump every five years"; if the current pump was not covered by PharmaCare, a new one is considered once it is more than four years old and out of warranty; "If approved, the Special Authority coverage is active for six months". Backs `bc-pharmacare-pumps`.',
  },
  'bc-pharmacare-contact': {
    publisher: `${BC} (PharmaCare)`,
    type: 'canadian-government',
    locator:
      'Paraphrase (last updated August 26, 2026; read 2026-10-06): "Lower Mainland: 604-683-7151"; "Rest of B.C. (toll-free): 1-800-663-7100"; Monday to Friday 8 a.m. to 8 p.m., Saturday 8 a.m. to 4 p.m. Owner answer B22: the phones on the BC rows, the toll-free line labelled as for British Columbia only. Also the name of the plan Liivv’s BC pharmacy bills directly, "BC PharmaCare" (owner answer B13).',
  },
  'bc-news-diabetes-coverage-2026': {
    publisher: `${BC} (BC Gov News)`,
    type: 'canadian-government',
    locator:
      'Paraphrase (news release 2026HLTH0030-000334, March 30, 2026; read 2026-10-06): from April 1, 2026, lancets (400 a year), alcohol swabs (300) and blood or urine ketone strips (100), through Fair PharmaCare and Plans C, F and W, "For people covered by Plans C, F and W, coverage will be 100%"; "Coverage is processed at the pharmacy counter"; people not on Plan C, F or W should register for Fair PharmaCare; "patients must receive training from a diabetes education centre or primary care network"; the Ypsopump is "the first HCL system with PharmaCare coverage". Funding step (releases E-9 from an official source): `bc-np-supplies`.',
  },
  'bc-guidelines-iron-overload': {
    publisher: `${BC} (BC Guidelines)`,
    type: 'canadian-guideline',
    locator:
      'Paraphrase (effective 2021-06-30): primary care orders HFE testing for people of European ancestry with persistently high ferritin and transferrin saturation over 45%; first-degree relatives of C282Y homozygotes get genetic testing; phlebotomy; check glucose and A1C; under 10% of homozygotes develop the disease. Not on the page: phlebotomy improving diabetes.',
  },
  'phsa-out-of-province-test-requests': {
    publisher: 'Provincial Health Services Authority (BC), Provincial Laboratory Medicine Services',
    type: 'canadian-government',
    locator: `Paraphrase: funds tests not available in BC, with approval before testing; the test must be medically necessary and change management, after in-province tests; an active PHN; case by case, 2–3 business days, faster in pregnancy; the ordering physician needs an MSP billing number and a relevant specialty.`,
  },
  'ab-specialized-drug-benefits': {
    publisher: 'Government of Alberta',
    type: 'canadian-government',
    locator:
      'Paraphrase (no date shown; read 2026-10-06), section "Insulin pump therapy": "The Insulin Pump Therapy Program (IPTP) is designed to support Alberta residents living with type 1 or type 3c diabetes"; coverage "for the cost of an insulin pump and its supplies as well as other diabetes management supplies"; agreements with Medtronic, Ypsomed, Insulet and Tandem; pumps listed: Omnipod, Omnipod DASH and Omnipod 5, MiniMed 630G, 670G, 770G and 780G, t:slim X2 with Basal-IQ or Control-IQ, YpsoPump. No French page, no phone. Funding step (owner answer A6, every pump program; releases E-4): the first link of `ab-iptp`.',
  },
  'ab-iptp-eligibility-2023': {
    publisher: 'Government of Alberta',
    type: 'canadian-government',
    locator:
      'Paraphrase ("Insulin Pump Therapy Program Eligibility Criteria", August 2023; read 2026-10-06): a resident enrolled in or eligible for the Alberta Health Care Insurance Plan; type 1 or type 3c diabetes; a pre-insulin pump information session, an IPT education plan, at least one assessment at a clinic and a Patient Responsibility Form; adults reviewed every year, under 18 every six months; a pump every five years; pumps from approved manufacturers and supplies from "a licensed pharmacy in Alberta and/or one of the approved insulin pump manufacturers, on a direct bill basis"; "IPTP participants will not be reimbursed for IPT supplies or an insulin pump paid by them personally". The 2023 PDF does not yet list Omnipod 5; the program page does. Backs `ab-iptp`.',
  },
  'ab-non-group-coverage': {
    publisher: 'Government of Alberta',
    type: 'canadian-government',
    locator:
      'Paraphrase (no date shown; read 2026-10-06): "Beginning October 1, 2026, changes to insurance coverage (Bill 11) will be in effect … where private or other coverage is available, it pays first, and government-sponsored coverage acts as the safety net"; diabetes supplies from a licensed pharmacy up to $2,400 a year, with no co-payments; "Co-payments apply to continuous glucose monitors and these devices are not included in the annual maximum for diabetes supplies". Funding step (releases E-6; launch blocker D-25 cleared): the link of the Alberta private-insurance card, and `ab-cgm`.',
  },
  'ab-cgm-fact-sheet-2025': {
    publisher: 'Government of Alberta (Ministry of Primary and Preventative Health Services)',
    type: 'canadian-government',
    locator:
      'Paraphrase (fact sheet, "December 16, 2025" in its footer; read 2026-10-06): for people enrolled in a government-sponsored health benefit plan; under 18, "ongoing insulin therapy or insulin pump therapy"; 18 and over, "insulin pump therapy; a basal-bolus insulin; or a premixed insulin"; yearly limits: Dexcom G6, 4 transmitters and 37 sensors; G7, 1 receiver and 37 sensors; Libre 2, 1 reader per 3 years and 26 sensors; Libre 3 Plus, 1 reader per 3 years and 25 sensors; Medtronic, 1 transmitter and 52 sensors, with Special Authorization for adults; "Government program participants can obtain their CGM from a pharmacy"; Alberta Blue Cross at 1-800-661-6995. It replaces Benefact 1225 (the proposed F-11), whose adult criteria were narrower than the held E-5 line. Funding step: `ab-cgm`, and the Alberta Blue Cross phone (owner answer B22).',
  },
  'abc-pharmacy-reference-guide': {
    publisher: 'Alberta Blue Cross (for the Government of Alberta)',
    type: 'canadian-government',
    locator:
      'Paraphrase (Reference Guide for Alberta Pharmacies; read 2026-10-06): the government-sponsored programs include Non-Group Coverage, Coverage for Seniors and the Insulin Pump Therapy Program; "Effective October 1, 2026 … government sponsored drug and supplemental benefit programs operate as the payor of last resort"; "Albertans are expected to disclose all forms of insurance to the pharmacist at the point of sale"; customer service 1-800-661-6995 (French 1-888-279-9799). Funding step (F-10): backs the Alberta private-insurance lines and the name of the plans Liivv’s Alberta pharmacy bills directly (owner answer B13).',
  },
  'sk-insulin-pump-program': {
    publisher: 'Government of Saskatchewan',
    type: 'canadian-government',
    locator: `Paraphrase: a $6,300 grant toward one pump every 5 years; supplies depend on the drug-plan deductible and co-pays; type 1, assessed through a Saskatchewan Health Authority diabetes education program, under 18 through the pediatric program. Re-read 2026-10-06: the program's legal name in the body is "Saskatchewan Aids to Independent Living (SAIL) Insulin Pump Program", now the card's title; "Drug Plan and Extended Benefits Branch toll-free: 1-800-667-7581" and 306-787-3317; "Saskatchewan Aids to Independent Living Program (SAIL) toll-free: 1-888-787-8996" and 306-787-7121 (owner answer B22). Who receives the grant is not stated, so the card says nothing about it. No French page. ${UNCHECKED_TITLE}`,
  },
  'sk-drug-cost-assistance': {
    publisher: 'Government of Saskatchewan',
    type: 'canadian-government',
    locator:
      'Paraphrase (read 2026-10-06, EN and its own French page "Aide à l’achat de médicaments"): the Special Support Program sets a deductible and a co-payment from family income; the Drug Plan ("Régime d’assurance-médicaments" in French). Funding step: the name of the plan Liivv’s Saskatchewan pharmacy bills directly (owner answer B13).',
  },
  'mb-pharmacare': {
    publisher: 'Government of Manitoba',
    type: 'canadian-government',
    locator:
      'Paraphrase (read 2026-10-06, EN and FR): "Pharmacare is a drug benefit program for eligible Manitobans, regardless of disease or age"; the deductible is based on family income; "Phone: 204-786-7141", "Toll free: 1-800-297-8099". Funding step: the phones on `mb-cgm` and `mb-mepp` (owner answer B22), and the name of the plan Liivv’s Manitoba pharmacy bills directly, "Manitoba Pharmacare Program" (French "Le Régime d’assurance-médicaments"; owner answers B13, B25).',
  },
  'mb-pharmacare-mepp': {
    publisher: 'Government of Manitoba',
    type: 'canadian-government',
    locator:
      'Paraphrase: since Apr 15, 2025, most diabetes drugs at no cost and no deductible (Ozempic excluded); pumps, CGM, strips, syringes and lancets are not part of it; a Manitoba Health card at any pharmacy. Its own French page (opened 2026-10-06) is titled "Régime d’assurance-médicaments amélioré du Manitoba", the program’s official French name (owner answer B25).',
  },
  'mb-health-coverage': {
    publisher: 'Government of Manitoba',
    type: 'canadian-government',
    locator:
      'Paraphrase (Health Coverage, section "Manitoba Adult Insulin Pump Coverage Program"; read 2026-10-06, EN and FR): the MAIPCP covers eligible Manitobans 18 and over with type 1 diabetes, recommended for a pump by an endocrinologist or a physician providing their diabetes care, who "have not received an insulin pump under a Manitoba government funded program within the last 5 years; and do not have coverage under a federal program"; it covers "one approved insulin pump every 5 years", ordered from an approved supplier; supplies are not covered and may be Pharmacare benefits; the doctor submits the application, and an approved person orders the pump "at no cost, directly from the supplier"; no deductible; Ancillary Programs "Phone: 204-786-7365 or 204-786-7366", "Toll free: 1-800-297-8099 ext 7365 or 7366". French name, on the French page: "Programme de couverture de pompes à insuline pour les adultes du Manitoba". Funding step (owner answers A6, B22, B25): the first link of `mb-pump`, which now says the program pays the supplier.',
  },
  'mb-faq-ips': {
    publisher: 'Government of Manitoba (Manitoba Pharmacare)',
    type: 'canadian-government',
    locator:
      'Paraphrase ("FAQ: Insulin Pump Supplies", read 2026-10-06): names the "Manitoba Pediatric Insulin Pump Program (MPIPP)" beside the MAIPCP; clients can order pump supplies from the manufacturer and submit invoices, or buy them at a Manitoba pharmacy; supplies are subject to Pharmacare deductibles. Funding step: the children’s program named in `mb-pump.notes`.',
  },
  'mb-shared-health-diabetes-care': {
    publisher: 'Shared Health Manitoba',
    type: 'canadian-government',
    locator: `Paraphrase: CGM and flash monitors through regular Pharmacare (deductible applies) for type 1 or 2 on basal-bolus insulin or a pump, with no prescription or special-status application; an adult pump program for type 1 from 18 with endocrinologist pre-approval (Omnipod, Tandem, Medtronic, Ypsomed). Corrected 2026-10-05: the page describes adult (18+) pump coverage only and names no paediatric pump program, so it cannot back one. Funding step, 2026-10-06 (verify item 5): Manitoba's own AGM FAQ (faq_agm.pdf, March 2023) refers to "my prescription for AGM", so \`mb-cgm.howToApply\` keeps "no special application" and drops "no prescription"; the pump card now cites the government's own page (mb-health-coverage) first. ${UNCHECKED_TITLE}`,
  },
  'sbgh-anti-gad65': {
    publisher: 'St. Boniface Hospital laboratory manual (Manitoba)',
    type: 'canadian-government',
    locator: `Paraphrase: anti-GAD65 is sent to In-Common Laboratories and tested at London Health Sciences Centre (Ontario); available to endocrinologists only, others need an approval form; results within 2 weeks. ${UNCHECKED_TITLE}`,
  },
  'qc-insulin-pump-access-program': {
    publisher: 'Gouvernement du Québec',
    type: 'canadian-government',
    locator: `Paraphrase (last updated Feb 19, 2021): up to $6,300 per pump every 5 years plus up to $4,000 a year for supplies; you must enter before age 18 and may continue after 18 with a yearly re-evaluation; adults diagnosed later are excluded. Re-read 2026-10-06 in both languages (both still dated February 19, 2021): the /en/ address now serves English; its own French page ("Programme d’accès aux pompes à insuline") names the paying agent "Santé Québec – CHU de Québec – Université Laval", while the English page still says "the CHU de Québec – Université Laval, which is the program’s paying agent". Each language's copy follows its own page. For supplies the English page says "send the original receipts or insurance statements" and the French page « vos factures originales ou vos relevés d’assurance originaux » (re-read 2026-10-06), so the French cards say « factures » where the English say "receipts" on purpose (K8). No phone is printed. Still the newest official page (D-19 open, so the card stays partly confirmed).`,
  },
  'qc-stays-outside-quebec': {
    publisher: 'Gouvernement du Québec',
    type: 'canadian-government',
    locator:
      'Paraphrase (last update February 12, 2021; EN and FR read 2026-10-06): "As a general rule, however, the public plan does not cover prescription drugs purchased outside Québec. Thus, a person who obtains their drugs outside the province is not entitled to a reimbursement from the RAMQ." Funding step (F-6): why orders shipped to Quebec are paid for privately (owner answers A1, B11: insulin can’t be ordered online for Quebec, but other orders can be shipped there and paid privately); in `ui.fundingPage.directQuebec`, `whereBody`, `funding.liivv.quebecBody` and `qc-cgm.notes`.',
  },
  'inesss-libre-3-plus-2026': {
    publisher: 'Institut national d’excellence en santé et en services sociaux (INESSS), Québec',
    type: 'canadian-government',
    locator:
      'Paraphrase (INESSS id 29341, evaluation published January 14, 2026; EN and FR read 2026-10-06): indication "Diabète de type 1 et diabète de type 2"; recommendation "Modification d’une indication reconnue - Sous conditions"; minister’s decision "Modifier une indication reconnue à la Liste des médicaments du RGAM - Médicament d’exception (2026-02-04)". The earlier record (id 26531) shows the listing itself: "Inscrire à la Liste des médicaments du RGAM - Médicament d’exception (2025-12-11)". Funding step (releases E-8 in corrected form; replaces the proposed F-30): `qc-cgm`. The verifier’s correction holds: the February 4, 2026 change defines intensive insulin therapy; it did not open coverage to type 2 in general.',
  },
  'inesss-dexcom-g6-g7-2026': {
    publisher: 'Institut national d’excellence en santé et en services sociaux (INESSS), Québec',
    type: 'canadian-government',
    locator:
      'Paraphrase (INESSS id 29338, evaluation published January 14, 2026; EN and FR read 2026-10-06): Dexcom G6 sensor and transmitter and Dexcom G7 sensor; indication "Diabète de type 1 et diabète de type 2"; minister’s decision "Modifier une indication reconnue à la Liste des médicaments du RGAM - Médicament d’exception (2026-02-04)". Backs `qc-cgm`.',
  },
  'inesss-libre-3-plus-notice-2025-12': {
    publisher: 'Institut national d’excellence en santé et en services sociaux (INESSS), Québec',
    type: 'canadian-government',
    locator:
      'Paraphrase (notice to the minister, December 2025, in French; read 2026-10-06): an administrative change, "le traitement doit inclure au moins 2 insulines différentes par jour", and "La même modification de l’indication s’applique aux autres appareils de mesure du glucose en continu"; for self-monitoring "des personnes diabétiques de 2 ans ou plus"; at the start, under 18 "doit être atteinte de diabète de type 1"; 18 and over "doit être traitée par insulinothérapie intensive (traitement par pompe à insuline ou ≥ 3 injections d’insuline d’au moins 2 insulines différentes par jour)" and meet one or more of: the A1C suited to the patient not reached despite optimal care, frequent lows in the past year despite a plan, or being unable to recognize or report the symptoms of a low; "La demande initiale est autorisée pour une période de 6 mois"; continuation if the sensor is used at least 70% of the time. Backs `qc-cgm.who` and `howToApply`.',
  },
  'chusj-genetic-tests-not-available': {
    publisher: 'CHU Sainte-Justine',
    type: 'canadian-government',
    locator: `Paraphrase: for a test not available in Quebec, check the MSSS supra-regional lab directory, then send RAMQ form AH-612 with a clinical form and signed consent; a decision letter in about 2 weeks. Diabetes is not mentioned. The /en/ address serves the page in French, under its French title.`,
  },
  'nb-insulin-pump-program': {
    publisher: 'Government of New Brunswick',
    type: 'canadian-government',
    locator:
      'Paraphrase: pumps, supplies and CGM sensors, the uninsured portion only; pumps for type 1 with no age cap; CGM for type 1, or type 2 on 3 or more injections a day; income-tested, private insurance first; a specialist confirms eligibility, then an online application. Re-read 2026-10-06 (modified 2026-05-08): "Remaining costs are billed to the province by the vendor"; "NBIPP clients cannot obtain their supplies through community pharmacies"; "you may contact the NBIPP Coordinator at 1-855-655-5525" (owner answer B22). Its own French page (modified 2026-05-07) is titled "Le Programme de pompes à insuline (PPI) du Nouveau-Brunswick", the official French name (owner answer B25).',
  },
  'nb-drug-plans': {
    publisher: 'Government of New Brunswick',
    type: 'canadian-government',
    locator:
      'Paraphrase (read 2026-10-06, EN and its own French page "Régimes de médicaments du Nouveau-Brunswick"): drug coverage "through the New Brunswick Drug Plan, New Brunswick Prescription Drug Program and other government-sponsored programs (known collectively as the New Brunswick Drug Plans)". Funding step: the name of the plans Liivv’s New Brunswick pharmacy bills directly (owner answers B13, B25).',
  },
  'ns-insulin-pump-program': {
    publisher: 'Government of Nova Scotia',
    type: 'canadian-government',
    locator: `Paraphrase: one pump every 5 years (Tandem, Medtronic, Insulet) plus supplies, with an income-based co-pay; type 1 diagnosed at least 4 months; renew Jan 1–Mar 31 each year. Re-read 2026-10-06 (modified 2024-07-12): how to apply — contact the program to confirm eligibility ("the program also connects you with an approved Diabetes Health Centre that can complete and submit a Clinical Eligibility Form for you"), complete the funding application (adult, and child or youth, forms) and send it by mail; "It should take 1 to 2 weeks"; private insurance first. No French name is published. ${UNCHECKED_TITLE}`,
  },
  'ns-sbgm-program': {
    publisher: 'Government of Nova Scotia',
    type: 'canadian-government',
    locator:
      'Paraphrase (modified 2026-04-29; read 2026-10-06): approved sensor-based monitors listed in the Nova Scotia Formulary; a yearly deductible by family income ($0 up to $60,000, $500 up to $80,000, $750 up to $100,000, $1,000 up to $150,000; not eligible above), "There are no premiums or copayments"; private insurance first; "You pay the full cost of the supplies at the pharmacy until you reach your deductible"; "Supplies are only covered when dispensed by a pharmacy with a prescription"; nothing bought outside Nova Scotia "except under very specific circumstances"; eligibility: resident, 2 or older, a valid Health Card, household income of $150,000 or less, "Type 1 or Type 2 diabetes and are using intensive insulin therapy (at least 4 injections per day) or rely on an insulin pump"; the form’s last page completed by a doctor, nurse practitioner or pharmacist; 1 to 2 weeks; renews automatically each February. No brands are named, so the copy names none. Funding step (releases E-13): `ns-sbgm`.',
  },
  'ns-pharmacare': {
    publisher: 'Government of Nova Scotia',
    type: 'canadian-government',
    locator:
      'Paraphrase (read 2026-10-06): the Nova Scotia Pharmacare programs page. Funding step: the name of the plan Liivv’s Nova Scotia pharmacy bills directly (owner answer B13). No French name is published.',
  },
  'ns-health-contacts': {
    publisher: 'Government of Nova Scotia',
    type: 'canadian-government',
    locator:
      'Paraphrase (modified 2026-09-04; read 2026-10-06): "Insulin Pump Program Phone: 902-470-6707 Toll-free: 1-855-306-6360"; "Sensor-based Glucose Monitoring Program Phone: 902-496-5667 Toll-free: 1-877-330-0323" (neither printed with a limit); Pharmacare Programs 902-429-6565, "Toll-free (within Nova Scotia)" 1-800-544-6191 (not used). Owner answer B22: the phones on `ns-ipp` and `ns-sbgm`.',
  },
  'pe-ipp-qa': {
    publisher: 'Government of Prince Edward Island (PEI Pharmacare)',
    type: 'canadian-government',
    locator:
      'Paraphrase ("Insulin Pump Program Questions and Answers", PDF dated 2026-05-06; read 2026-10-06): "On September 1, 2024, the Insulin Pump Program expanded to include PEI residents of all ages who are medically eligible", type 1; the Provincial Diabetes Program decides medical eligibility, and a family physician or nurse practitioner can refer; "up to 100% coverage" of the pump and quarterly supplies, depending on household income, private insurance and device costs; brands "Medtronic Diabetes / Omni-pod Insulin Pump / Tandem"; "Co-payments must be made directly to the insulin pump company"; renew "between April 1 and June 30"; sensors are under the separate PEI Glucose Sensor Program; private insurance "will be deducted before establishing the funding"; out-of-pocket costs do not count toward the Catastrophic Drug Program cap; administrator at PEI Pharmacare, "Telephone: 902-213-4825". The replacement cycle is not stated. The program’s web page answers with a CAPTCHA and was not read. Funding step (owner answer A6; releases E-10 for the pump program): `pe-ipp`, and PEI joins `PRIVATE_FIRST`. The French name seen by the research is in a translated patient handout, not a program page, so `programNameFr` stays empty (B25).',
  },
  'healthpei-national-pharmacare-qa': {
    publisher: 'Health PEI (PEI Pharmacare)',
    type: 'canadian-government',
    locator:
      'Paraphrase ("National Pharmacare in PEI: Questions and Answers for PEI Residents", May 2025; read 2026-10-06): from May 1, 2025, coverage for many diabetes medications; for PEI residents with a valid PEI Health Card, while federal-plan members keep their plan; filled at any community pharmacy in PEI, and not covered at an out-of-province pharmacy; insulin syringes and pen needles not covered; test strips need enrolment in the PEI Pharmacare Diabetes Drug Program, at $11 per 100, and with insulin 100 strips up to every 25 days; the pump and sensor programs are unchanged. Funding step (releases the PEI pharmacare part of E-10; replaces the proposed F-19, written for providers): `pe-pharmacare`, and the name of the plan Liivv’s PEI pharmacy bills directly, "PEI Pharmacare" (owner answer B13).',
  },
  'nl-cgm-program-2025': {
    publisher: 'Government of Newfoundland and Labrador',
    type: 'canadian-government',
    locator: `Paraphrase (2025 news release): from fall 2025, CGM for everyone with type 1 who meets the medical and income tests (about 4,600 people); earlier pilots covered youth, pregnancy and gestational diabetes; the same income test as the provincial pump program. ${UNCHECKED_TITLE}`,
  },
  'nl-insulin-pump-program-2021': {
    publisher: 'Government of Newfoundland and Labrador (Health and Community Services)',
    type: 'canadian-government',
    locator:
      'Paraphrase (news release of January 15, 2021; read 2026-10-06): "Administered in Newfoundland and Labrador by Eastern Health, the Insulin Pump Program covers the cost of basic insulin pumps and supplies for qualifying individuals who have Type 1 Diabetes Mellitus"; full coverage for children and youth up to 18, and those already in the program aged 18 to 24; from January 18, 2021, new clients 18 and over are "financially assessed using an Income Test", with "a financial hardship policy". The phones it prints (709-752-4436, 1-888-246-4888) predate NL Health Services and are not used. Funding step (owner answer A6): the first link of `nl-pump`, which stays partly confirmed (D-20: no current program page).',
  },
  'nl-prescription-drug-program': {
    publisher: 'Government of Newfoundland and Labrador (Health and Community Services)',
    type: 'canadian-government',
    locator:
      'Paraphrase (read 2026-10-06, EN and its own French page): the Newfoundland and Labrador Prescription Drug Program (NLPDP), five plans; "The NLPDP is payor of last resort". French name: "Programme de médicaments sur ordonnance de Terre-Neuve-et-Labrador (NLPDP)" (owner answer B25). Funding step: `nl-strips`, and the plan Liivv’s Newfoundland and Labrador pharmacy bills directly (owner answer B13).',
  },
  'nl-program-claiming-policies': {
    publisher: 'Government of Newfoundland and Labrador (Health and Community Services)',
    type: 'canadian-government',
    locator:
      'Paraphrase ("10. Program Claiming Policies (Updated August 20, 2025)" of the NLPDP provider guide; read 2026-10-06): 10.2.4 test strips a year: short-acting insulin 2,500; long-acting insulin only 700 (+100 by Special Authorization); non-insulin diabetes medicines only 100 (+50); no diabetes treatment 50 (+50, fills 6 months apart); gestational diabetes or pregnant with type 2, the quantity the health professional asks for; "Claims for glucose test strips will only be paid if the Beneficiary has: A paid claim for insulin and/or non-insulin diabetic medication within the past year; or A Special Authorization in place"; 10.20 the program is the payor of last resort (private insurance first; Nunatsiavut beneficiaries excepted). Funding step (F-21, releases E-11 with all four tiers): `nl-strips`.',
  },
  'yt-national-pharmacare': {
    publisher: 'Government of Yukon',
    type: 'canadian-government',
    locator:
      'Paraphrase (date modified 2026-09-28; EN and FR read in a browser 2026-10-06): the YNPP "covers contraceptives and diabetes medications listed in the Yukon Drug Formulary and improves access to newer insulin pump technologies"; eligibility: a Yukon resident with Yukon health care coverage who is not covered by a federal program (NIHB, Canadian Armed Forces, Veterans Affairs Canada and others); automatic enrolment; "Covered medications are paid under the YNPP first … even if you already have private insurance"; "Covered medications are free"; lower-cost alternative rule ("If you choose a brand-name drug, you must pay the difference"); "It also provides access to newer insulin pump technologies, such as the Omnipod 5 tubeless automated insulin delivery system … Insulin pump eligibility is granted every 5 years"; "The program does not cover: diabetes equipment, supplies or glucose monitoring devices" or GLP-1 medicines such as Ozempic; "Medications filled outside the Yukon are not covered under this program"; program support 867-393-7480; diabetes equipment or supplies: Chronic Disease and Disability Benefits 867-667-5092 or the Senior Pharmacare Program 867-667-5403. French name: "Régime d’assurance-médicaments national du Yukon". Funding step (verify item 6; the held E-12 line, which said pumps and monitors were first-dollar coverage, was wrong and is dropped): `yt-pharmacare` and `yt-pump`. Who pays for a pump, how much and how to apply are not stated, so `yt-pump` stays partly confirmed.',
  },
  'yt-chronic-disease-benefits': {
    publisher: 'Government of Yukon',
    type: 'canadian-government',
    locator:
      'Paraphrase (date modified 2026-05-29, French page 2026-06-05; read in a browser 2026-10-06): the Chronic Disease and Disability Benefits Program (French "Programme d’aide pour les personnes atteintes d’une maladie chronique ou d’une incapacité"); diabetes is a listed condition; supplies include "syringes and glucose test kits", equipment "glucometers"; "Your doctor must apply to the program for you. They should apply before you make a purchase"; buying outside Yukon needs prior approval, or a reimbursement claim "within 1 year of the purchase"; "This program is the payer of last resort. There’s an annual deductible"; "phone 867-667-5092, toll free in Yukon 1-800-661-0408". It names no pump. Funding step (replaces the held `yt-devices`): `yt-cddb`.',
  },
  'nt-extended-health-benefits': {
    publisher: 'Government of the Northwest Territories',
    type: 'canadian-government',
    locator:
      'Paraphrase: Extended Health Benefits became income-based on Apr 1, 2024 and no longer depend on a listed disease. NWT CGM rules and Nunavut coverage are not confirmed by any source here.',
  },
  'nt-ehb-services': {
    publisher: 'Government of the Northwest Territories (Health and Social Services)',
    type: 'canadian-government',
    locator:
      'Paraphrase (no date shown; EN and FR read 2026-10-06): "EHB covers prescribed medical supplies and equipment listed in the NIHB Medical Supplies and Equipment Guide and Benefit List"; seniors 60 and over, no cost-share; otherwise EHB pays 75% until a family maximum of $500 to $1,500; "we have temporarily adjusted the cost sharing arrangements for income band levels from two to ten", at no cost; "payor of last resort"; Métis residents use the Métis Health Benefits Program, First Nations and Inuit residents NIHB; "Toll-free: 1-800-661-0830, ext. 49462", "Phone: 867-777-7400". French name: "Régime d’assurance-maladie complémentaire". The NIHB list it points to names no insulin pump (verified by the research), so no NWT pump card. Funding step (F-28): `nt-ehb`, still partly confirmed for devices.',
  },

  /* ---------- International: only where the Canadian sources are silent ---------- */
  'ispad-2022-ch4-monogenic': {
    publisher:
      'International Society for Pediatric and Adolescent Diabetes (ISPAD); Greeley et al., Pediatric Diabetes 2022',
    type: 'international-guideline',
    locator:
      'Paraphrase: 2.5–6.5% of pediatric diabetes; gene panels preferred except in specific cases such as GCK in pregnancy; cascade testing of relatives; genetic counselling; immediate testing for everyone diagnosed under 6 months, consider at 6–12 months if antibody-negative; about 90% with potassium-channel variants can switch to sulfonylurea tablets, with more neurological benefit the earlier; GCK is mild, stable and should not be treated; HNF1A and HNF4A are sulfonylurea-sensitive, HNF4A with high birth weight or neonatal hypoglycaemia; 50% risk to children; MIDD and Wolfram clues. Not confirmed on the page: "about 40% potassium-channel genes", antibody and C-peptide tests before the genetic test, and "high insulin needs" in lipodystrophy. Read via Europe PMC (PMC10107883). The 2024 ISPAD update did not revise this chapter.',
  },
  'ispad-2022-cfrd': {
    publisher: 'ISPAD; Ode et al., Pediatric Diabetes 2022',
    type: 'international-guideline',
    locator: `Paraphrase: HbA1c is not a recommended screening test; a yearly OGTT at least by age 10 (every 3–5 years if pancreatic-sufficient with normal tolerance); A1C under 6.5% does not rule CFRD out; antibodies if diagnosed before 10, with DKA or other autoimmunity; treat with insulin, oral agents only in select cases; glucagon and teaching for people on insulin, as the glucagon response is impaired; microvascular screening from 5 years; GDM screening at 12–16 and 24–28 weeks, postpartum OGTT at 6–12 weeks. Also doi 10.1111/pedi.13453 (PMC10108242). Conflicts with CF Canada 2024 on A1C-first screening and non-insulin drugs. ${UNCHECKED_TITLE}`,
  },
  'ada-soc-2026-s2-summary': {
    publisher: 'American Diabetes Association (US), via a Guideline Central summary',
    type: 'international-guideline',
    locator:
      'Paraphrase (a summary of the whole 2026 Standards, updated 16 Sep 2026; the Section 2 recommendations, doi 10.2337/dc26-S002, are on it): 2.7 antibody screening with a family history or high genetic risk; 2.8b specialist staging with multiple antibodies; 2.9 a single antibody retested every 6 months to 3 years; 2.10 standardized antibody tests for adults whose features overlap type 1; 2.20 glucose at every visit on immune checkpoint inhibitors; CFRD screening from age 10, OGTT preferred with A1C as the alternative; OGTT preferred after transplant; 2.29a–c genetic testing for all diagnosed under 6 months, MODY testing with atypical features across generations, and a diabetes genetics centre; 3.17 discuss teplizumab from age 8 in stage 2; stages 1–3 defined. Secondary: the ADA’s own pages returned 403. Use this, not the ADA 2026 summary of revisions, which could not be confirmed.',
  },
  'buzzetti-lada-consensus-2020': {
    publisher: 'Diabetes (ADA journal); Buzzetti et al., an international expert panel',
    type: 'international-guideline',
    locator:
      'Paraphrase: 2–12% of adult-onset diabetes; criteria are onset over 30, autoantibodies and no insulin for at least 6 months; GADA most sensitive, and a higher titre or more antibodies raise the risk of needing insulin; C-peptide guides treatment (under 0.3 nmol/L insulin as for type 1, 0.3–0.7 a grey area, over 0.7 a modified type 2 approach); sulfonylureas not recommended; SGLT2 inhibitors carry DKA risk; screen everyone newly diagnosed with type 2 for GADA; "type 1.5". Read via Europe PMC (PMC7809717); listed on the Lund University research portal. Conflicts with chapter 3 (antibodies not for routine use) and with Breakthrough’s "about 10%".',
  },
  'holt-t1d-adults-consensus-2021': {
    publisher:
      'American Diabetes Association and European Association for the Study of Diabetes; Holt et al., Diabetologia 2021',
    type: 'international-guideline',
    locator:
      'Paraphrase: over 40% of people who develop type 1 after 30 are first treated as type 2; clues are age under 35, BMI under 25, unintentional weight loss, ketoacidosis and glucose over 20; test GAD first, then IA-2 and/or ZnT8; C-peptide if still uncertain more than 3 years after diagnosis; "CGM is the standard" for most adults with type 1; whether LADA is a distinct type is controversial. It says insulin within 3 years, not 1–2. Read via Europe PMC (PMC8481000).',
  },
  'phillip-pre-stage-3-monitoring-2024': {
    publisher: 'Diabetologia 2024 (also Diabetes Care); Phillip et al., international consensus',
    type: 'international-guideline',
    locator:
      'Paraphrase: stage 2 is 2 or more antibodies plus fasting glucose 5.6–6.9, a 2-hour OGTT of 7.8–11.0, HbA1c 39–47 mmol/mol or a 10% rise; antibodies counted are IAA, GADA, IA-2A and ZnT8A; stage 1 adults about yearly, children every 6–12 months (3–6 if under 3), more often in stage 2; repeated teaching on diabetes and DKA symptoms. Read via Europe PMC (PMC11410955).',
  },
  'murphy-monogenic-precision-diagnostics-2023': {
    publisher:
      'Communications Medicine; ADA/EASD Precision Medicine in Diabetes Initiative (Murphy … Gloyn)',
    type: 'international-guideline',
    locator:
      'Paraphrase: a large panel for everyone diagnosed under 6 months, test at 6–12 months, no evidence for testing after 12; GCK testing for persistent mild hyperglycemia without obesity, and in pregnancy if fasting glucose is ≥5.5 without obesity; a panel for antibody-negative or C-peptide-positive diabetes with onset under 30; the evidence is mostly from people of European ancestry, and clinical features are less reliable in others. Read via Europe PMC (PMC10550998).',
  },
  'naylor-monogenic-precision-treatment-2024': {
    publisher: 'Communications Medicine; Naylor et al. (systematic review, international)',
    type: 'other',
    locator:
      'Paraphrase (abstract only): 146 mostly observational studies with moderate-to-serious bias; stopping treatment in GCK did not worsen HbA1c; sulfonylureas work in HNF1A; HNF1B and mitochondrial diabetes are mostly treated with insulin, without comparative trials. Abstract read via Europe PMC (PMID 39025920).',
  },
  'brown-lipodystrophy-guideline-2016': {
    publisher:
      'Journal of Clinical Endocrinology & Metabolism; Brown et al., multi-society guideline',
    type: 'international-guideline',
    locator:
      'Paraphrase (abstract only): yearly screening for diabetes, lipids, and liver, kidney and heart disease; diet is essential; metreleptin for generalized and some partial lipodystrophy; metformin for glucose; oral estrogens contraindicated; genetic testing when familial lipodystrophy is suspected. Abstract read via Europe PMC (PMID 27710244). Its metformin advice does not carry over to MIDD.',
  },
  'sharif-ptdm-consensus-2014': {
    publisher: 'American Journal of Transplantation; Sharif et al.',
    type: 'international-guideline',
    locator: `Paraphrase (abstract only): renamed new-onset diabetes after transplant (NODAT) to post-transplant diabetes (PTDM), excluding transient hyperglycemia, and widened screening to post-meal glucose and HbA1c. Abstract read via Europe PMC (PMID 25307034). ${UNCHECKED_TITLE}`,
  },
  'sharif-ptdm-consensus-2024': {
    publisher: 'Nephrology Dialysis Transplantation; Sharif et al. (expert opinion, no GRADE)',
    type: 'international-guideline',
    locator: `Paraphrase: "OGTT is essential" for diagnosis and screening, as HbA1c lacks sensitivity; 20–40% in heart, lung and liver recipients; insulin for post-operative hyperglycemia, oral or non-insulin injectables once stable; do not routinely change immunosuppression. Read via Europe PMC (PMC11024828). Conflicts with chapter 20 on screening (A1C) and first drug (metformin).`,
  },
  'niddk-monogenic': {
    publisher: 'National Institute of Diabetes and Digestive and Kidney Diseases (US)',
    type: 'international-patient-education',
    locator:
      'Paraphrase (last reviewed Aug 2024): more than 20 genes; 1–5% of diabetes; consider with onset under 30, no overweight and a family history; genetic testing confirms; 50% risk to children; genetic counselling; neonatal diabetes in the first 6 to 12 months, about 1 in 90,000 babies. Conflicts: 1–5% here vs 1–2% at Diabetes UK and Exeter; 1 in 90,000 and 6–12 months vs Exeter’s 1 in 100,000 and under 6 months.',
  },
  'diabetes-uk-lada': {
    publisher: 'Diabetes UK',
    type: 'international-patient-education',
    locator:
      'Paraphrase (no review date): "type 1.5"; usually at 30–50 and a healthy weight, coming on over months; some are misdiagnosed as type 2; tested with the GADA antibody test; usually starts with metformin and moves to insulin faster than type 2. Nothing on C-peptide or CGM.',
  },
  'diabetes-uk-mody': {
    publisher: 'Diabetes UK',
    type: 'international-patient-education',
    locator:
      'Paraphrase (undated): 1–2% of UK diabetes, about 90% first misdiagnosed; clues are diagnosis under 25, a parent with diabetes, two or more generations; antibody and C-peptide tests, then a genetic test; HNF1A about 70% of cases, treated with sulphonylureas; HNF4A with high birth weight and neonatal hypoglycaemia; HNF1B with renal cysts, usually on insulin; GCK at 5.5–8 mmol/L needs no treatment; 50% risk to each child.',
  },
  'exeter-c-peptide-antibody-tests': {
    publisher: EXETER,
    type: 'international-patient-education',
    locator:
      'Paraphrase: within 3 years of diagnosis, antibodies (GAD, IA-2, ZnT8) are the best test, after 3 years C-peptide (blood or urine); C-peptide shows how much insulin you still make; a high C-peptide close to diagnosis is often unhelpful.',
  },
  'exeter-what-is-mody': {
    publisher: EXETER,
    type: 'international-patient-education',
    locator:
      'Paraphrase: 1–2% of diabetes, often unrecognised; six genes account for 87% of UK MODY; 50% inheritance; the subtype guides treatment, outlook and family counselling.',
  },
  'exeter-mody-testing-guidelines': {
    publisher: EXETER,
    type: 'international-guideline',
    locator:
      'Paraphrase: test if diagnosed at 35 or under (30 in high-prevalence groups) with type 1 unlikely (antibody-negative, C-peptide ≥200 pmol/L), plus one of: HbA1c under 7.5% at diagnosis under 18, BMI under 30 (or 27) with a parent with diabetes, or a MODY probability of ≥20% off insulin or ≥10% on insulin; sequence all MODY genes. The probability calculator page itself could not be read.',
  },
  'exeter-gck-pregnancy-2018': {
    publisher: EXETER,
    type: 'international-guideline',
    locator:
      'Paraphrase (PDF dated 18.01.2018): fetal growth depends on whether the baby inherits the variant; unaffected babies average about 600 g heavier, with about 40% macrosomia; a scan in the early third trimester guides insulin; prenatal testing of the mother’s blood can find the baby’s genotype, so contact the lab as soon as pregnancy is confirmed; persistent fasting 5.5–8 with a family history; no IV insulin needed in labour.',
  },
  'exeter-hnf1b-mody': {
    publisher: EXETER,
    type: 'international-patient-education',
    locator: `Paraphrase: renal cysts or a single kidney, genital tract malformations, a small pancreas with exocrine deficiency, abnormal liver tests, early gout, low magnesium, neurodevelopmental conditions; large gene deletions are the most frequent cause; monitor blood pressure, urine and faecal elastase. The source check did not find "usually treated with insulin" here; cite Diabetes UK for it. ${UNCHECKED_TITLE}`,
  },
  'exeter-about-neonatal-diabetes': {
    publisher: EXETER,
    type: 'international-patient-education',
    locator:
      'Paraphrase: diagnosed before 6 months; about 1 in 100,000 live births; a genetic diagnosis in over 85%; Exeter tests anyone diagnosed before 9 months, of any age, from any country (referrals from 113 countries as of July 2023); a transient 6q24 form. Cost is not stated. Not on this page: "about 40%" and "ideally with CGM".',
  },
  'exeter-neonatal-kcnj11-abcc8': {
    publisher: EXETER,
    type: 'international-patient-education',
    locator: `Paraphrase: about 40% of neonatal diabetes is due to the potassium-channel genes; it can be transient, permanent or DEND; refer for genetic testing at once. The source check’s attempt at this subpage returned 404: open the link again before citing it. ${UNCHECKED_TITLE}`,
  },
  'exeter-sulfonylurea-treatment': {
    publisher: EXETER,
    type: 'international-patient-education',
    locator: `Paraphrase: over 90% can stop insulin; HbA1c under 6.5% is achievable and lows are unusual; families report modest gains in concentration and speech. Conflicts: over 90% here, about 90% at ISPAD, 85–90% in the transfer protocol. ${UNCHECKED_TITLE}`,
  },
  'exeter-sulfonylurea-transfer': {
    publisher: EXETER,
    type: 'international-guideline',
    locator: `Paraphrase: transfer can be inpatient (rapid) or outpatient (slower, glucose at least 4 times a day, ideally CGM); Exeter advises clinicians worldwide. A clinician protocol; the site gives no doses. ${UNCHECKED_TITLE}`,
  },
  'exeter-midd': {
    publisher: EXETER,
    type: 'international-patient-education',
    locator:
      'Paraphrase: a mitochondrial variant, mostly m.3243A>G, passed from an affected mother to all her children and never from a father; up to 1% of diabetes; average onset 37, insulin usually within about 2 years; deafness in about 75%, often first; heart rhythm, kidney, retina, muscle and gut problems; a urine sample is preferred for testing; avoid metformin.',
  },
  'medlineplus-wolfram-syndrome': {
    publisher: 'MedlinePlus Genetics (US National Library of Medicine)',
    type: 'international-patient-education',
    locator:
      'Paraphrase (updated Feb 14, 2022): type 1 about 1 in 500,000; WFS1 causes over 90% of type 1, CISD2 type 2; autosomal recessive; diabetes around age 6, optic atrophy around 11, blindness within about 8 years, neurological problems in early adulthood.',
  },
  'pancreapedia-type-3c-2015': {
    publisher: 'Pancreapedia (Rickels and Gudipaty, review, 2015)',
    type: 'other',
    locator: `Paraphrase: in advanced disease glucagon secretion becomes impaired, leading to brittle diabetes; in chronic pancreatitis start with fasting glucose and HbA1c, then a 75 g OGTT if either is abnormal; pancreatic enzymes help keep incretin secretion up. The quotes came through a fetch summary, not the page: re-read before citing. Hart 2016, the type 3c review, could not be verified and is not in this register. ${UNCHECKED_TITLE}`,
  },

  /* ---------- Industry: never the only source for a claim ---------- */
  'fit-canada-pocket-guide-4th-ed': {
    publisher:
      'FIT Canada (Forum for Injection Technique), on fit4diabetes.com, a website run by embecta, which makes pen needles and syringes',
    type: 'industry',
    locator:
      'Paraphrase (file coded EMB-25-442; index at fit4diabetes.com/fit-recommendations/): a 4 mm pen needle without a skin lift is safest; a new needle every injection; check and rotate sites 1–2 cm apart; never draw U-200 or U-300 insulin from a pen into a syringe; on a pump, a sudden unexplained high, particularly with nausea and vomiting, needs prompt attention — consider insulin by injection, then check the set, tubing and reservoir (s.15); avoid changing an infusion set before bedtime (s.15). Written for clinicians. The site footer reads "© 2023 Embecta Corp.", so it is counted as industry-run: no live sentence rests on it, and the lines that would rest on it alone are held. If they are ever released, the copy has to say it is published on a website run by embecta, a company that makes pen needles and syringes.',
  },
  'sanofi-tzield-approval-2025': {
    publisher: 'Sanofi Canada (manufacturer press release)',
    type: 'industry',
    locator: `Paraphrase (5 May 2025): Health Canada approved Tzield to delay stage 3 in people aged 8 and over with stage 2 type 1; a median delay of about 24 months; plain-language stage definitions. Diabetes Canada’s Jan 2026 news covers the approval and coverage. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'sanofi-uncovert1d-screening': {
    publisher: 'Sanofi Canada (UncoverT1D, a manufacturer programme)',
    type: 'industry',
    locator: `Paraphrase: a free 4-antibody test ordered by a health care provider; Revvity is the only lab; eligible with a personal or family history of autoimmune type 1 or other autoimmunity, or raised glucose or an earlier prediabetes or type 2 diagnosis; positives get follow-up and an endocrinology referral. A page for clinicians. The BC clinic handout (from age 8) is the second source a card citing this needs. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'chiesi-myalepta-approval-2024': {
    publisher: 'Chiesi Global Rare Diseases (manufacturer press release)',
    type: 'industry',
    locator: `Paraphrase: Health Canada approved MYALEPTA (metreleptin) on Feb 5, 2024 — generalized lipodystrophy from age 2, familial or acquired partial lipodystrophy from 12 when standard treatment fails. Health Canada’s own page returned 403, so there is no second source yet. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'dexcom-canada': {
    publisher: 'Dexcom Canada (manufacturer)',
    type: 'industry',
    locator: `Paraphrase: G7 and G6, with G6 users being moved to G7; G7 15 Day authorized but not yet sold; coverage help and Dexcom Care. ${NEVER_SOLE}`,
  },
  'dexcom-technical-support': {
    publisher: 'Dexcom Canada (manufacturer)',
    type: 'industry',
    locator: `Paraphrase: 1-844-832-1810, 24/7 technical support and insurance help. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'dexcom-pumps-and-pens': {
    publisher: 'Dexcom Canada (manufacturer)',
    type: 'industry',
    locator: `Paraphrase: works with t:slim X2 (it names only G7 for the t:slim X2, footnoted "* Not all connections are available in Canada"), Omnipod 5 (G6/G7) and mylife Loop (G6). Out of date: it still says Omnipod 5 is only available in Ontario and Nova Scotia. Since ruling C42 (2026-10-06), Tandem’s Canadian user guide names both G6 and G7, so G7 with the t:slim X2 rests on both makers; Dexcom’s footnote is kept as its own caveat (the owner may drop it). ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'dexcom-g7-wear-time': {
    publisher: 'Dexcom Canada (manufacturer)',
    type: 'industry',
    locator: `Paraphrase: G7 is "indicated to be worn for up to 10 days, with a 12-hour grace period at the end" (the source check of 2026-10-05 found nothing on restarts here, so none is cited); G7 15 Day (adults 18 and over, 15.5 days plus 12 hours) was authorized Jul 13, 2026 but is not yet on sale. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'abbott-freestyle-canada': {
    publisher: 'Abbott (FreeStyle Libre, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: Libre 3 Plus and Libre 2; a cost and coverage page; a recall notice for a subset of Libre 3 Plus sensors was up when checked. ${NEVER_SOLE}`,
  },
  'abbott-freestyle-libre-3': {
    publisher: 'Abbott (FreeStyle Libre, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: Libre 3 Plus is worn up to 15 days, from age 2; Abbott says it is covered by every provincial public program, a coverage claim no Canadian source here confirms. ${NEVER_SOLE}`,
  },
  'abbott-freestyle-contact': {
    publisher: 'Abbott (FreeStyle Libre, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: 1-800-461-8481 (Mon–Fri 8am–9pm ET, Sat–Sun 9am–5pm); an online sensor-replacement request. An older 1-888-205-8296 appears only in search results. ${NEVER_SOLE}`,
  },
  'abbott-libre-3-plus-launch-2025': {
    publisher: 'Abbott Canada (manufacturer press release)',
    type: 'industry',
    locator: `Paraphrase: Libre 3 Plus launched in Canada on Jul 8, 2025. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'minimed-canada': {
    publisher: 'MiniMed Canada ULC (formerly Medtronic Diabetes; manufacturer)',
    type: 'industry',
    locator: `Paraphrase: the 780G for type 1 from age 7, and for adults with type 2 since Apr 28, 2026; the home page now headlines "Simplera Sync sensor now licensed by Health Canada" and no longer names Guardian 4 or says "available later this year" (source check, 2026-10-05); the Extended infusion set, "designed for twice the wear. Use exclusively with the Extended reservoir"; 24-hour support at 1-800-284-4416; CareLink. ${NEVER_SOLE}`,
  },
  'minimed-cgm-coverage': {
    publisher: 'MiniMed Canada ULC (manufacturer)',
    type: 'industry',
    locator: `Paraphrase: MiniMed’s own guide to CGM coverage. A coverage claim needs a Canadian program source as well. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'minimed-simplera-licence-2026': {
    publisher: 'MiniMed (manufacturer press release, via BioSpace)',
    type: 'industry',
    locator: `Paraphrase: a Health Canada licence for the Simplera Sync sensor, and a type 2 indication for the 780G system. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'tandem-canada': {
    publisher: 'Tandem Diabetes Care (manufacturer)',
    type: 'industry',
    locator: `Paraphrase: t:slim X2 with Control-IQ+ from age 2; "Dexcom CGM sold separately", naming no model; the models are in Tandem’s Canadian user guide (tandem-tslim-x2-ciq-user-guide-ca, ruling C42). ${NEVER_SOLE}`,
  },
  'tandem-support': {
    publisher: 'Tandem Diabetes Care (manufacturer)',
    type: 'industry',
    locator: `Paraphrase: (833) 509-3598, 24/7 and bilingual; insurance verification; a "Four-Year Limited Warranty". Whether Mobi is authorized in Canada is unconfirmed. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'tandem-tslim-x2-ciq-user-guide-ca': {
    publisher: 'Tandem Diabetes Care (manufacturer)',
    type: 'industry',
    locator: `Paraphrase (EN AW-1018762_B, 2026-03-05; FR AW-1019341_A, 2026-05-20; mmol/L, Control-IQ+ software 7.10; both read 2026-10-06): "Both the Dexcom G6 CGM and the Dexcom G7 CGM are compatible with the t:slim X2 insulin pump with Control-IQ+ technology." Backs G6 with the t:slim X2 (pump maker only) and, with Dexcom’s page, G7 with the t:slim X2 (both makers) in device-pairings.ts (ruling C42). ${NEVER_SOLE}`,
  },
  'omnipod-canada': {
    publisher: 'Insulet Canada (Omnipod, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: Omnipod 5 and DASH; pods last up to 72 hours; Omnipod 5 works with Dexcom G6/G7, and the page also mentions Libre 2 Plus / 3 Plus. ${NEVER_SOLE}`,
  },
  'omnipod-contact': {
    publisher: 'Insulet Canada (Omnipod, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: 1-855-763-4636, option 1 for 24/7 product support. Pod orders are routed to a single partner; nothing on the site names or links it until the owner decides. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'omnipod-5-access-and-reimbursement': {
    publisher: 'Insulet Canada (Omnipod, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: public coverage listed for ON, NS, NL, PEI, NB, NWT, AB, BC, YT, SK and MB. A coverage claim needs a Canadian program source as well. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'ypsomed-mylife-loop': {
    publisher: 'Ypsomed (mylife Diabetescare, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: YpsoPump (a 1.6 mL (160 U) cartridge of U-100 insulin; the infusion set need not be changed with every cartridge) with the CamAPS FX app, as mylife Loop; in-app training required, which "will take you about 60 minutes"; works with "Dexcom G6, CGM, or FreeStyle Libre 3 Plus sensor"; Dexcom will phase out the G6 in phases, and "For now, your Dexcom G6 remains fully supported"; 1-833-695-5959. ${NEVER_SOLE}`,
  },
  'lifescan-verio-reflect': {
    publisher: 'LifeScan (OneTouch, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: the OneTouch Verio Reflect meter with the OneTouch Reveal app; "What's in the Box": the meter, a OneTouch Delica Plus lancing device and 10 OneTouch Delica lancets (re-read by the Your Tools source check, 2026-10-05); 1-800-663-5521 and live chat. ${NEVER_SOLE}`,
  },
  'ascensia-support': {
    publisher: 'Ascensia Diabetes Care (Contour, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: Contour Next Gen, Next One and Next EZ meters and the Microlet Next lancing device; "use only the CONTOUR NEXT control solution. Using any other control solution can cause inaccurate results."; it names the Microlet Next and Single-let Next without saying which meters they fit (re-read by the Your Tools source check, 2026-10-05); 1-800-268-7200, Mon–Fri 9am–6pm ET; chat Mon–Sat. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'embecta-contact': {
    publisher: 'embecta (formerly part of BD; manufacturer)',
    type: 'industry',
    locator: `Paraphrase: pen needles and syringes; consumers 1-888-232-2737, health professionals 1-888-367-9539, Mon–Fri 8:30am–5pm ET. The same company runs fit4diabetes.com. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
  'dex4-contact': {
    publisher: 'A.M.G. Medical (Dex4, manufacturer)',
    type: 'industry',
    locator: `Paraphrase: glucose tablets (4 g each, in tubes of 10 and bottles of 50), gel and a liquid; a contact form only. ${NEVER_SOLE} ${UNCHECKED_TITLE}`,
  },
};
