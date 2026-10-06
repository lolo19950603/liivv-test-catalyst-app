# Know Your Type: source check (2026-10-05)

Checked against `know-your-type.draft.md` (section B messages, section C claims table). I fetched every cited source fresh on 2026-10-05 (all returned HTTP 200) into `scratchpad/src/kyt/`. Journal articles were read as Europe PMC full text (Holt PMC8481000, Buzzetti PMC7809717, Phillip PMC11410955, ISPAD ch4 PMC10107883, Murphy PMC10550998, Patel PMC12017104, Sharif PMC11024828). The PDFs were read with pdftotext (CF Canada 2024, ISPAD 2022 CFRD, BCDiabetes handout).

**Result.** 96 rows checked: 83 Confirmed, 12 Partly, 1 Not confirmed. No Diabetes Express mention, product placement, dose or titration was found. The urgent exit is wired to `staying-safe` and `#red-flags`, and its link text matches Staying Safe's urgent heading ("Get emergency care now", Chapter 02).

---

## 1. Claims

Status key: **C** = Confirmed, **P** = Partly, **N** = Not confirmed.

### Must fix (N and P)

| Key | Claim | Source | Status | Correction |
|---|---|---|---|---|
| 6.s2.3 and 8.figure.familyTree.columns.insulinSoon | "You needed insulin within 3 years of diagnosis" | holt-t1d-adults-consensus-2021; ada-soc-2026-s2-summary | **N** | Holt has no "insulin within 3 years" clue. Its only "3 years" is about C-peptide testing ("Beyond 3 years after diagnosis… a random C-peptide"); its clinical clues are age <35, BMI <25, unintentional weight loss, ketoacidosis and glucose >20. ADA 2.10 says only "short time to insulin treatment". **Ch 3 does carry a number:** "time to needing insulin <1 to 2 years" (para. on clinical indicators). Use "You needed insulin within 1 to 2 years of diagnosis" cited to Ch 3, which is also Canadian. Change the family-tree column to "Needed insulin within 2 years?". The E-table row "Ch 3 '1–2 years' not found" is wrong. |
| 8.items.1 | "NIDDK says 1 to 5%" (of MODY) | niddk-monogenic | **P** | NIDDK's "about 1 to 5 of every 100 people with diabetes" is for **monogenic diabetes as a whole** (MODY plus neonatal), not MODY. Reword: "The US NIDDK says 1 to 5% of diabetes is single-gene, counting all types." |
| 13.items.2 | "20 to 50% of people without diabetes who take **high-dose** steroids develop high blood sugar" | dc-cpg-ch16-in-hospital | **P** | Ch 16: "Hyperglycemia is a common complication of corticosteroid therapy, with a prevalence between 20% and 50% among people without a previous history of diabetes." "High-dose" belongs to the next sentence, about management. Drop "high-dose" from the figure. The 48-hour line is correct. |
| 13.items.4 | Children and teens: risk "2 to 3 times higher in the first year" | dc-cpg-ch18-mental-health | **P** | Ch 18: a "2- to 3-fold increased risk of type 2 diabetes, which was apparent within the first year of follow up." The risk is not limited to year 1. Reword: "…2 to 3 times higher, and the rise can show within the first year." |
| 12.items.6 | CF pregnancy OGTT "at 12 to 16 weeks and again at 24 to 28 weeks" | cf-canada-cfrd-guideline-2024 | **P** | This applies to people with CF **without known CFRD**, at 12–16 weeks "or when pregnancy confirmed". The 24–28 week test is "if previous test at 12–16 weeks was normal". Add "if you don't already have CFRD" and "if the first is normal". |
| 12.items.7 | "After a transplant, 25 to 50% of people with CF develop new diabetes" | cf-canada-cfrd-guideline-2024 | **P** | The source says "25-50% of those who did not have CFRD before the transplantation". Add "who didn't have CFRD before". |
| 12.items.9 | "Care is shared between your CF team and a diabetes educator" | cf-canada-cfrd-guideline-2024 | **P** | CF Canada says the team "should ideally include a diabetes specialist, a respirologist, a dietitian, and a nurse", and that CF teams "can improve… by including certified diabetes educators". It also calls for collaboration between CF and diabetes clinics. Reword: "Your CF clinic works with a diabetes team, ideally including a diabetes educator." |
| programsBand.cards.1 | "Some antibody tests are ordered by specialists only" | sbgh-anti-gad65 | **P** | The St. Boniface lab says "available to endocrinologists only. All other requests require test approval form completed." Others can order with a form. Reword: "Some labs limit antibody tests to specialists unless an approval form is sent." This matches 6.s4.1. |
| 5.items.1 | "Breakthrough T1D describes stages 1 and 2 coming before stage 3" | bt1d-stages-and-diagnosis | **P** | BT1D never names stage 3. It says the process runs "months or years before diagnosis… referred to as 'early stage T1D' (or stage 1 and stage 2)". Reword: "…describes stages 1 and 2 coming before diagnosis." |
| 7.items.6 | "Breakthrough T1D describes care as a modified type 1 plan. International guidance says some type 2 medicines are less suitable…" | bt1d-lada; buzzetti-lada-consensus-2020 | **P** | BT1D's "modified T1D care plan" explicitly **includes** "glucose-lowering drugs frequently used for T2D". Buzzetti names sulfonylureas as not recommended. As written, the copy may read as "type 2 medicines are wrong for LADA". Reword: "Breakthrough T1D describes a modified type 1 plan, which can include some type 2 medicines. International guidance says others are less suitable, so ask your team before any change." |
| 6.figure.terms.2 | "IA-2, ZnT8 and IAA… may be tested if the GAD test is negative" | holt-t1d-adults-consensus-2021; phillip-pre-stage-3-monitoring-2024 | **P** | Holt's follow-up after a negative GAD test is "IA2 and/or ZNT8" only. IAA is not in that step. Reword: "Other type 1 antibodies. IA-2 and ZnT8 may be tested if the GAD test is negative." IAA can stay listed as another antibody (BT1D stages page). |
| 10.items.2 | MIDD "passes from a mother to all her children" | exeter-midd | **P** | The fact is correct, but Exeter adds "considerable variation… some children will only have deafness or only have diabetes or may have no problems at all". Add "though how much it affects each child varies". Without it the line overstates risk to a reader. |

### Confirmed (C)

| Key | Claim | Source | Status | Note or correction |
|---|---|---|---|---|
| heroBody / categoriesIntro | Team decides; some cases difficult to classify | dc-cpg-ch3 | C | — |
| 1.items.1 | ~10% type 1; no insulin; injection or pump | dc-type-1 | C | The same page also says "Five to 10 percent" lower down. "About 10%" matches the lead sentence ("Roughly 10 per cent"). |
| 1.items.2 | Can start in adulthood; ~71% diagnosed as adults | dc-type-1; bt1d-facts-and-figures | C | BT1D says "~71% of individuals with T1D are diagnosed as adults" on its Canadian facts page. |
| 1.items.3 | 85% no family connection | bt1d-facts-and-figures | C | — |
| 1.items.4 | Antibodies, low C-peptide, DKA | dc-cpg-ch3 Table 2 | C | — |
| 1.items.5 | AID preferred for all willing and able; otherwise CGM with pump or BBI | dc-cpg-ch41 | C | — |
| 2.items.1 | 90–95% | dc-type-2 | C | — |
| 2.items.2 | Over 40, family, ethnicity; may have no symptoms | dc-type-2 | C | The page joins age and family into one risk group ("over the age of 40 with a parent or sibling"). Acceptable paraphrase. |
| 2.items.3–6 | FPG ≥7.0; A1C ≥6.5% adults, not suspected T1; 2-h or random ≥11.1 | dc-cpg-ch3 Table 3 | C | — |
| 2.items.7 | Without symptoms, repeat on another day | dc-cpg-ch3 | C | — |
| 2.items.8 | Youth antibody testing "should be considered"; up to 10–20% | dc-cpg-ch35 | C | — |
| 3.items.1–4 | Prediabetes; IFG 6.1–6.9; A1C 6.0–6.4; IGT 7.8–11.0 | dc-cpg-ch3 Table 5; dc-prediabetes | C | — |
| 3.items.5 | Page links to CANRISK | dc-prediabetes | C | — |
| 4.items.1–3 | GDM first recognized in pregnancy; pre-existing; overt; A1C <20 wk if high risk | dc-cpg-ch36 | C | — |
| 4.items.4 | Screening offered 24–28 weeks | sogc-glucose-testing (also Ch 36) | C | — |
| 4.items.5 | 3–20%; usually goes away; later T2D and heart disease | dc-gestational-diabetes | C | — |
| 4.items.6 and figure.fields.2 | OGTT 6 weeks to 6 months postpartum | dc-cpg-ch36 | C | — |
| 4.items.7 | Steady fasting 5.5–8 plus family history → GCK; tell team early | exeter-gck-pregnancy-2018 | C (INTL, labelled) | Exeter: "seek an early appointment… once pregnancy has been confirmed". Side note: Exeter also says a postnatal GTT "is not necessary" for confirmed GCK. The card-4 reminder is still right for GDM. |
| 5.items.2–4 | Stage 1, 2, 3 definitions | ada-soc-2026-s2-summary Table 2.4; phillip | C (INTL, labelled) | ADA Table 2.4 calls stage 3 "Symptomatic". Phillip says stage 3 is "with or without symptoms". Keeping "type 1 is diagnosed" is the right call. The E-table reason "no source defines stage 3 by symptoms" is inaccurate: the sources conflict. |
| 5.items.5 | 2+ persistent antibodies = high risk; 10–15% family history | bt1d-stages-and-diagnosis | C | — |
| 5.items.6 | TrialNet: zero cost, home finger-stick or lab, anywhere in Canada; 2–45 / 2–20; 4–6 weeks | bt1d-trialnet | C | — |
| 5.items.7 | FEDERATE-Can (Quebec); CanScreen "launching this fall 2026/winter 2027", newborns and children | bt1d-stages; canscreen-t1d | C | Pre-publish check 1: the banner is unchanged today (page modified 2026-06-10), so the line stands. CanScreen describes itself as a research consortium designing a pilot. |
| 5.items.8 | Ch 41 makes no screening recommendation | dc-cpg-ch41 | C | Ch 41 gives the reason: "lack of current treatment availability in Canada". |
| 5.items.9 | Positives followed; regular teaching on diabetes and DKA signs | bt1d-trialnet; phillip | C (INTL, labelled) | Phillip: "regular education about symptoms of diabetes and DKA". |
| 5.items.10 | HC approval May 2025, stage 2; no provincial or territorial plan; out of pocket, private or compassionate | dc-tzield-access-2026; bt1d-tzield-update-2026; sanofi | C | Pre-publish check 2 is resolved: coverage is unchanged (CDA "do not reimburse" Jan 2026; INESSS Oct 2025). BT1D, a non-industry source, gives the indication itself: "8 years of age and older with Stage 2". So "stage 2" no longer depends on Sanofi. |
| 5.note | Screening result isn't a diagnosis | ada §2; phillip | C | Phillip also requires a second sample to confirm. |
| 6.s1.1 | "Some cases are difficult to classify" | dc-cpg-ch3 | C | — |
| 6.s1.2 | >40% of T1 after 30 first treated as T2 | holt | C (INTL, labelled) | — |
| 6.s1.3 | Right type can change treatment and family testing | holt; exeter-what-is-mody | C | International and **not labelled** (see section 3). Ch 3 ("may alter management") and Ch 35 ("may lead to more appropriate management") support the treatment half from Canadian sources, so re-cite that half. |
| 6.s2.1, .2 | Younger age or not overweight; weight loss; ketones or DKA | holt; dc-cpg-ch3 | C | — |
| 6.s2.4, .5 | Generations; diagnosed before 6 months | dc-cpg-ch3; diabetes-uk-mody | C | — |
| 6.s2.6 | Hearing loss plus mother's side | exeter-midd | C | International and not labelled (section 3). |
| 6.s2.7–.9 | Pancreas, CF, hemochromatosis; drugs; transplant; ICI; Cushing's and acromegaly | app-2; ch20; ada 2.19–2.20 | C | — |
| 6.s3.1 | GAD first | holt | C (INTL, labelled) | — |
| 6.s3.2 | C-peptide useful months to years after; not in very high sugar | exeter-c-peptide; dc-cpg-ch3 | C | Ch 3: "after months of clinical stabilization… not helpful in acute hyperglycemia". Holt: not within 2 weeks of a hyperglycaemic emergency. |
| 6.s3.3 | Genetic tests; specialist arranges | ispad ch4; on-health | C | — |
| 6.s3.4 | Levels wane; not for routine use; ADA 2.10 for overlapping adults | dc-cpg-ch3; ada §2 | C | — |
| 6.s4.1 | Manitoba GAD: endocrinologists; others need a form | sbgh-anti-gad65 | C | — |
| 6.s4.2 | BC: not covered by MSP | bcdiabetes-autoantibody-testing | C | The handout is stamped "2023-May-18" but discusses Tzield's approval, which came in 2025. The stamp is stale, not the content (K17). |
| 6.s4.3 | Referral; out-of-province approval | on-health; on-form; phsa; chusj | C | The Ontario directory has a "self referral" filter, so "usually" is needed and correct. |
| 6.terms.1, .3–.6 | GAD; C-peptide blood or urine; A1C diagnoses, ~every 3 months; OGTT 75 g; gene panel | holt; bt1d-lada; exeter; ch3; ch9 2021; ispad | C | Ch 9: "approximately every 3 months". |
| 7.items.1–5, 7 | LADA / type 1.5; >30, antibodies, ≥6 months; managed as T2; GAD; C-peptide guides; insulin sooner; 2–12% vs ~10% | bt1d-lada; diabetes-uk-lada; buzzetti; ch3 | C | Buzzetti: progression risk depends on "autoantibody level, and presence of multiple islet autoantibodies". |
| 8.items.2–6, 8–12 | 9 in 10 misdiagnosed; clues; <25 / <30 / ≤35; tests; GCK; HNF1B; 50%; pregnancy; 19/29; ancestry | diabetes-uk-mody; ch3; niddk; murphy; exeter; ispad; patel | C | Exeter's ≤35 applies to White Europeans; it uses ≤30 for high-prevalence groups. Patel's 19/29 is the 2017–2019 cohort. |
| 8.items.7 | HNF1A/4A often tablets; specialist decides | ispad; diabetes-uk-mody | C | — |
| 9.items.1–3, 5, 6 | <6 months monogenic; all babies tested; 1:100,000 and 1:90,000, 6–12 months; ~9 in 10 switch, earlier is better; adults reviewed | exeter; niddk; ch3; ispad | C | ISPAD's "earlier… greater benefits" refers to neurological outcomes. |
| 9.items.4 | Some temporary, some lifelong | niddk-monogenic | C | Pre-publish check 4 is resolved: NIDDK states permanent and transient NDM directly. Cite NIDDK for this row instead of the Exeter overview, which doesn't say it. |
| 10.items.1, 3–8 | Signs; MIDD onset 37, insulin within ~2 yrs; hearing first; organs; urine; Wolfram 1:500,000, ages 6 and 11; lipodystrophy; genetic confirmation | ispad; exeter-midd; medlineplus | C | — |
| 11.items.1–6 | App 2 list; CHS; 1 in 300 with two copies; <10% penetrance; iron test must be requested; first-degree relatives; phlebotomy mildly improves diabetes | app-2; chs pages; bc-guidelines | C | — |
| 12.items.1–5, 8 | CFRD; 3.6% → 58.7%; A1C-first vs OGTT; insulin only for children; glucagon and teaching; complication checks from 5 yrs | cf-canada; ispad-cfrd; ada §2 | C | 12.items.5: CF Canada also recommends glucagon teaching for insulin-treated people. Cite the Canadian source first, and keep ISPAD only for "the response is weaker". |
| 13.items.1, 3, 5–9 | App 2 drugs; antipsychotic weight and lipids; Table 4 baseline then schedule; ICI glucose at every visit; transplant risks; Ch 20 schedule; OGTT preferred; 20–40% | app-2; ch18; ada 2.20, 2.27; ch20; sharif | C | ADA 2.20 also says to test "before initiating treatment". |
| programsBand.cards.2–4 | Genetics referral; TrialNet free; CF yearly from 10 | as above | C | — |

---

## 2. Clinical safety

1. **Stopping insulin (highest risk).** Several lines tell readers their type may be wrong and that treatment "can change": 6.s1.3, 8.items.7 ("tablets rather than insulin"), 9.items.5 ("switch from insulin to tablets"), and the checklist. A person with type 1 who stops or cuts insulin is at risk of DKA. Holt: "C-peptide must be measured prior to insulin discontinuation to exclude severe insulin deficiency". Add one fixed line on card 6 (banner or note) and on cards 8 and 9, kept outside the collapse: "Never stop or lower insulin because of anything on this page. Any change is made with your specialist."
2. **Symptoms while waiting for a second test (2.items.7).** "Without symptoms, a second test on another day confirms it" says nothing about what to do *with* symptoms. Ch 3: with symptomatic hyperglycemia the diagnosis is made, and treatment "should not be delayed". Suggest adding: "With symptoms of high blood sugar, don't wait for a second test: see your doctor the same day. Emergency signs are in Staying Safe."
3. **Urgent exit is correct.** No card carries its own 911 or same-day block. Ketones and DKA (cards 1, 6, 7, 11, 13) point to Staying Safe, and `urgentExit` resolves to `staying-safe#red-flags` (site.ts `anchors.redFlags`). The 6.s2.2 clue "you've had ketones or DKA" has no inline pointer. That is acceptable because card 1's note and the exit cover it.
4. **Checkpoint inhibitors (13.items.6).** The held line can now be partly released with sources. ADA 2.19 says to educate on "signs of hyperglycemia and hyperglycemic crises", and Holt says ICI diabetes "may present with hyperglycaemia and diabetic ketoacidosis". A sentence such as "It can come on with ketones, so know the signs in Staying Safe" would be safer than silence.
5. **Steroid note.** 13.note ("Ask your prescriber or pharmacist before you change…") correctly guards against stopping steroids abruptly. Keep it visible (K12).

## 3. Scope and labelling

- **Dosing, titration and drug classes:** none in the messages. 8.items.7, 9.items.5, 12.items.4 and 7.items.6 are treatment-route lines with "specialist decides" attached (K14). The sources behind them name sulfonylureas, glibenclamide, GLP-1 and SGLT2; the copy correctly names none.
- **Products:** none, and no Diabetes Express. Tzield is the only brand name (5.items.10, K7). It is factual, with no promotion.
- **"International guidance" labelling (K11) gaps.** These lines rest on non-Canadian sources but don't say so:
  - 6.s1.3 (Holt and Exeter): re-cite the treatment half to Ch 3 and Ch 35;
  - 6.s2.6 (MIDD, Exeter);
  - 6.s2.3 (Holt): resolved by the Ch 3 fix above;
  - 6.figure.terms.2, .3 and .6 (Holt, Exeter, ISPAD).

  Either label them or accept the checklist and glossary as an exception in K11.
- **Canadian accuracy:** OK throughout (MSP, CDA/INESSS, provincial or territorial formularies, CANRISK, TrialNet in Canada, A1C, mmol/L, "counselling").

## 4. Held items the sources now support (for the owner)

- **"Prediabetes raises the chance of type 2" (E).** dc-prediabetes: "not everyone… will develop type 2 diabetes, many people will". Ch 3: "places individuals at high risk of developing diabetes". Can be released.
- **A1C "average over 2–3 months" (E).** Ch 3: A1C "reflects the average plasma glucose (PG) over the previous 2 to 3 months". Can be released.
- **Teplizumab age 8+ and the stage 2 indication.** Now on BT1D's Tzield update page, which is non-industry, and in ADA rec 3.17. The size of the delay conflicts (Sanofi: median 2 years; BT1D TrialNet page: average 3 years), so keep that held.
- **Antipsychotic Table 4.** It is readable on the live Ch 18 page (baseline; 1, 2, 3 months; every 3–6 months; annually). The column placement of each check is ambiguous in a text extract, so re-read it visually before releasing.
- **Ch 18 supersession (pre-publish check 3):** the live page shows no update or supersession notice. Not resolved beyond that.

## 5. Register (sources-meta.ts) issues

- `sharif-ptdm-consensus-2024` label is not the title. Actual title: "International consensus on post-transplantation diabetes mellitus".
- `patel-cpsp-monogenic-2023` label is not the title. Actual title: "Incidence Trends of Type 2 Diabetes Mellitus, Medication-Induced Diabetes, and Monogenic Diabetes in Canadian Children, Then (2006–2008) and Now (2017–2019)" (Pediatric Diabetes 2023). It is a CPSP study of all non-type 1 diabetes, not monogenic diabetes only.
- `phsa-out-of-province-test-requests`: the page title is "Out-of-Province & Out-of-Country Laboratory or Genetic Test Funding Request".
- `chusj-genetic-tests-not-available`: the `/en/` URL serves a French page ("Tests génétiques non disponibles au Québec"). `hrefLang: 'en'` is wrong, and the English label is a translation, not the publisher's title.
- `ada-soc-2026-s2-summary`: the Guideline Central page is the **whole** 2026 Standards summary ("2026 ADA Diabetes Standards of Medical Care Clinical Guideline Summary", last updated Sep 16, 2026), not a Section 2 summary. The Section 2 recommendations quoted are on it.
- `bt1d-lada`: the https link now returns 200 with no redirect (pre-publish check 6 is resolved).
