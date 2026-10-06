# Verification — paths.draft.md (DiabetesCare.paths)

Checked 2026-10-05 against the live official pages (WebFetch; the PDFs were read with pdftotext). Repo files were not edited.
Status key: **Confirmed** = the source says this · **Partly** = right in substance, but needs narrowing, rewording or re-citing · **Not confirmed** = the source does not support it, or the source has been superseded.

**Result:** 70 rows checked. 54 Confirmed, 13 Partly, 1 Not confirmed (stale), and 2 owner facts that can't be verified. Row 41 counts as Partly. No Diabetes Express mention appears in the copy. Line 30 of the draft is an internal ground rule and does not ship. There is no direct-billing claim, no pay-later offer, no phone number and no dosing.

---

## 1. Intro, hero and Funding claims

| # | Claim (path · key) | Source fetched | Status | Correction |
|---|---|---|---|---|
| 1 | T1 · body.1 Pancreas makes no insulin. Insulin by injection or pump | diabetes.ca/about-diabetes/type-1 | Confirmed | — ("The pancreas does not produce any insulin"; "inject insulin or use an insulin pump") |
| 2 | T1 · body.1 "about 10%" have type 1 | same | Partly | The page says both "Roughly 10 per cent" and "Five to 10 percent". New to the Journey card 2 uses "5 to 10%". Use "up to 10%" or "5 to 10%" so the site is consistent (Q6) |
| 3 | T1 · body.1 Can start in adulthood | same | Confirmed | "can also develop in adulthood" |
| 4 | T1 · body.1 Breakthrough T1D: about 71% diagnosed as adults | breakthrought1d.ca/t1d-basics/facts-and-figures | Confirmed | "~71% of individuals with T1D are diagnosed as adults". BT1D credits the Type 1 Diabetes Index, which is a modelled estimate. The attribution in the sentence is correct |
| 5 | T1 · body.2 "Diabetes Canada's 2025 type 1 guideline prefers AID for anyone willing and able" | diabetes.ca …/chapter-41; CJD 49(1):5–18, Feb 2025 (released 27 Mar 2025) | Confirmed | AID is "the preferred treatment method for all individuals… provided the individual is willing and able to wear and operate the devices". "2025" is correct (CJD 2025, DOI 10.1016/j.jcjd.2025.01.001). The Diabetes Canada web page shows no year, so keep the year in the register. CJD has published an addendum (S1499-2671(25)00089-9). Glance at it before release |
| 6 | T1 · funding DTC: type 1 meets life-sustaining therapy for 2021+. You still need to apply | canada.ca …/life-sustaining-therapy.html (H1 "Life-sustaining therapy eligibility", modified 2023-01-24); RC4064 Rev. 25 (modified 2026-01-20) | Confirmed | "People with Type 1 diabetes meet the eligibility criteria under life-sustaining therapy" (2021 and later). RC4064: "deemed to have met the above criteria". A medical practitioner still certifies on Form T2201. The UT title is now confirmed |
| 7 | T1 · funding Pump, sensor and strip help depends on where you live | diabetes.ca/comparisons-by-province-territory | Confirmed | The page is live. The pump and CGM comparisons are dated **2024**, so they may lag 2026 provincial changes. Don't use them as the Q1 fallback without a date caveat |
| 8 | T2 · body.1 90–95% in Canada | diabetes.ca/about-diabetes/type-2 | Confirmed | "accounts for 90-95% of diabetes cases in Canada" |
| 9 | T2 · body.1 May cause no symptoms | same | Confirmed | "some may have no symptoms at all" |
| 10 | T2 · body.1 "Many people with type 2 need insulin to stay healthy" | diabetes.ca …/getting-started-with-insulin | Confirmed | "All people living with type 1 diabetes and many living with type 2 need insulin to stay healthy." |
| 11 | T2 · body.2 International consensus: more than 40% with type 1 after 30 first treated as type 2 | Holt et al., ADA/EASD 2021 (Diabetologia/Diabetes Care 44(11):2589) | **Not confirmed (stale)** | The 2021 report says this. **But ADA/EASD published an updated 2026 consensus report on 2026-09-15** (doi 10.1007/s00125-026-06833-z), which builds on and replaces the 2021 one. Secondary coverage gives the figure as "approximately 40%". Springer is paywalled, so this couldn't be read verbatim. Re-cite to the 2026 report after a direct read, and change "more than 40%" to match its wording (probably "about 40%"). Every other use of `holt-t1d-adults-consensus-2021` needs the same re-cite (kyt 6/7/8/9/13, less-common intro.body.2) |
| 12 | T2 · funding ODB strip limit higher on insulin than on diet/activity alone | ontario.ca/page/get-coverage-prescription-drugs (H1 "Get coverage for prescription drugs", updated 2026-08-18) | Confirmed | Insulin 3,000/yr. Diet/lifestyle only 200/yr (400 and 200 for higher- and lower-hypo-risk medicines). The UT title is now confirmed |
| 13 | T2 · funding "At Liivv, you pay… then claim them from your program" (next to ODB) | same | Partly | ODB has a receipt route ("submit your receipts online via the Ontario Drug Benefit Program Receipt Submission Form"), so the copy isn't false. ODB is usually billed at the pharmacy counter, though, and the person pays only the co-pay (up to $6.11 for seniors after a $100 deductible, up to $2 for others). Reimbursement is at the ODB amount less the co-pay. Add "ODB pays back its share, less your co-pay", or don't name ODB in a sentence that runs straight into the pay-and-claim line |
| 14 | GDM · body.1 High blood sugar first found in pregnancy | diabetes.ca …/chapter-36 | Confirmed | "glucose intolerance first recognized in pregnancy" (plain-language wording) |
| 15 | GDM · body.1 Diabetes Canada: 3–20% of pregnancies; usually goes away after birth | diabetes.ca …/gestational-diabetes | Confirmed | "Between three to 20% of pregnant women develop gestational diabetes, depending on their risk factors"; "the diabetes usually goes away" |
| 16 | GDM · body.1 Screening offered at 24–28 weeks | pregnancyinfo.ca (SOGC) glucose-testing | Confirmed | "should be offered blood glucose screening for GD between 24 and 28 weeks". Ch 36 agrees, and adds earlier screening (<20 weeks, A1C) for high-risk women. Consider adding "or earlier if you're at higher risk" |
| 17 | GDM · body.2 Raises chance of type 2 later, for you and your child | diabetes.ca …/gestational-diabetes | Confirmed | "may both have a higher risk of health problems later in life such as type 2 diabetes and heart disease" |
| 18 | GDM · body.2 OGTT between 6 weeks and 6 months after the birth | Ch 36 | Confirmed | "screened for diabetes between 6 weeks and 6 months postpartum, with a 75 g oral glucose tolerance test" |
| 19 | GDM · funding Ontario Monitoring for Health helps pay for meter, strips and lancets with GDM | diabetes.ca …/ontario-monitoring-for-health-program (H1 "Ontario Monitoring for Health Program", updated 2026-05-19); ontario.ca/page/preventing-and-living-diabetes (updated 2026-06-08) | Partly | Eligibility (insulin users **or** gestational diabetes) and items are confirmed. Both pages limit it to people with **no other funding** for these supplies. People 65+ and under 25 get limited coverage because ODB/OHIP+ applies. Add "if you have no other coverage". It is a true pay-and-claim program: mail the receipts and a claim form (physician or NP signature the first time), currently about 8 weeks to process. Amounts (75%, meter ≤ $75 every 5 years, strips and lancets ≤ $920 a year) are on ontario.ca if wanted. UT titles confirmed |
| 20 | P · body.1 Higher than normal, not high enough for type 2 | diabetes.ca …/prediabetes | Confirmed | "higher than normal, but are not yet high enough to be diagnosed as type 2 diabetes" |
| 21 | P · body.1 Not everyone goes on to type 2, but many do | same | Confirmed | "Although not everyone with prediabetes will develop type 2 diabetes, many people will." |
| 22 | LC · body.1 "Some cases are difficult to classify" | diabetes.ca …/chapter-3 | Confirmed | Verbatim |
| 23 | LC · body.1 Guideline lists LADA (type 1) and single-gene types such as MODY | Ch 3 | Confirmed | LADA is under type 1. Monogenic diabetes is described |
| 24 | LC · body.1 LADA "a type 1 that starts slowly in adults" | breakthrought1d.ca …/latent-autoimmune-diabetes-in-adults | Confirmed | "a form of type 1 diabetes"; ">30 years"; autoimmune process "happens more slowly" |
| 25 | LC · body.1 Linked to pancreas, CF, iron overload, some medicines | diabetes.ca/for-professionals/appendices/appendix-2 | Confirmed | Exocrine pancreas: cystic fibrosis, hemochromatosis, pancreatitis, pancreatectomy. Drugs: glucocorticoids, atypical antipsychotics, calcineurin inhibitors |
| 26 | LC · body.1 Can start after a transplant | diabetes.ca …/chapter-20 | Confirmed | PTDM is "newly diagnosed diabetes mellitus in a clinically stable person after solid organ transplantation". Appendix 2 does not list it, so citing Ch 20 is correct |
| 27 | LC · body.2 Right type "may change your treatment" | Ch 3 | Confirmed | "may alter management" |
| 28 | LC · funding Ontario's pump program is for type 1 | ontario.ca/page/insulin-pumps-and-diabetes-supplies (H1 **"Diabetes equipment and supplies"**, updated 2026-09-15) | Confirmed | "If you have type 1 diabetes and meet the specific medical eligibility criteria…". Not income-tested. The register's UT title should be "Diabetes equipment and supplies". New since earlier drafts: ADP now also covers a real-time CGM for type 1 under medical criteria. The supply grant ($2,400 a year in $600 instalments) is paid to the person |
| 29 | LC · funding NIHB sensor coverage for people managing diabetes with insulin | sac-isc.gc.ca/eng/1578079214611/1578079236012 (H1 "Non-Insured Health Benefits program updates") | Confirmed | "limited use benefit for clients managing diabetes with insulin. Prior approval is required" (Sept 2025). Nothing changed in the Dec 2025, Apr 2026 or Jul 2026 updates. NIHB allows both provider direct billing and client reimbursement, so pay-and-claim is accurate. Mention "prior approval" in the Funding page detail |
| 30 | All · "At Liivv you pay, then claim; ask us" | Owner, 2026-10-05 | Owner fact | Not verifiable. Wording is consistent with what was fetched: MfH and the ADP supply grant pay the person, and NIHB and ODB both have a receipt route. See rows 13 and 19 |
| 31 | All · Pharmacist CDE band (national, Mon–Fri 9–5 ET, holidays excepted, "Request a call") | Owner | Owner fact | Not verifiable. See Problems P5 and P6 |

## 2. Reading-list reasons marked (src), plus unmarked reasons that state a fact

| # | Path · row | Claim | Source fetched | Status | Correction |
|---|---|---|---|---|---|
| 32 | T1·9, LC·12 | Ketone ladder written for type 1 | breakthrought1d.ca …/dka-and-ketones | Confirmed | Thresholds are framed for "people with T1D" (<0.6 / 0.6–1.5 / 1.5–3.0 / >3.0) |
| 33 | T1·12 | Kit with one to two weeks of supplies | diabetes.ca …/managing-diabetes-in-emergency-situations | Partly | Source: "at least 1 to 2 weeks". Change to "at least one to two weeks of supplies" |
| 34 | T1·19 | AID preferred, willing and able | Ch 41 (2025) | Confirmed | As row 5 |
| 35 | T1·23 | Exercise can lower blood sugar for up to 48 h | diabetes.ca …/exercise-activity | Confirmed | "Exercise can lower your blood sugar for up to 48 hours." |
| 36 | T1·24 | Type 1: avoid cannabis, DKA risk | diabetes.ca policy position (Aug 2020) | Partly | Source says "avoid **recreational** cannabis use because of the increased risk of DKA". Add "recreational". Medical cannabis is a separate conversation with the prescriber |
| 37 | T1·27 | Type 1, from age 15: yearly eye exam starting 5 years after diagnosis | Ch 30 | Confirmed | "annually… starting 5 years after the onset of diabetes" (age ≥15) |
| 38 | T1·28 | Type 1 kidney screening starts 5 years after diagnosis | Ch 29 (2025 update); diabetes.ca kidney-disease | Partly | CPG: "5 years after onset or, if onset is at an earlier age, screening should start after puberty". This path also serves parents (rows 30–31). Add "(for children, after puberty)" or "your team will tell you when" |
| 39 | T1·32 | TrialNet free, anywhere in Canada, for relatives | breakthrought1d.ca …/trialnet | Partly | "available anywhere in Canada at zero cost" is confirmed. Eligibility has age limits: immediate relatives 2–45, other relatives 2–20. Add "for relatives within the age limits" so people over 45 aren't sent to it. The page shows © 2024 and no review date, so recheck before release |
| 40 | T1·33, T2·28 | NIHB covers sensors and strips for people on insulin | sac-isc NIHB updates | Confirmed | CGM is a limited-use benefit for people on insulin, with prior approval. Strips: up to 800 per 100 days on insulin. Strips are also covered without insulin at lower limits, so "for people on insulin" describes the sensor rule correctly, but don't imply strips are insulin-only |
| 41 | T2·6, GDM·5 | Checking depends on your treatment | Ch 9 (2021); diabetes.ca checking-blood-sugar | Confirmed (T2) / Partly (GDM) | DC page: "How often you check… depends on your treatment plan." For **GDM** this framing is clinically weak: nearly everyone with GDM checks at home (fasting and after meals) even when diet-controlled, because Ch 36's targets assume self-monitoring. Nurse view: change the GDM reason to "How often to check, and when, from your team" and drop "whether" |
| 42 | T2·8 | Many with type 2 need insulin | DC getting-started-with-insulin | Confirmed | As row 10 |
| 43 | T2·11 | Alcohol can cause a low up to 24 h later on insulin or some pills | DC alcohol sheet PDF; Ch 11 | Confirmed | Sheet: delayed low "up to 24 hours after alcohol consumption… type 2 diabetes who are using insulin or insulin secretagogues" |
| 44 | T2·12, GDM·14 | Ketones with near-normal sugar: some medicines; pregnancy | Ch 15 | Confirmed | "A normal or mildly elevated blood glucose level does not rule out diabetic ketoacidosis in certain conditions, such as pregnancy or with SGLT2 inhibitor use." |
| 45 | T2·13 | Some medicines paused on sick days; pharmacist tells you which | DC "Stay Safe When You Have Diabetes and Are Sick…" PDF | Confirmed | "TEMPORARILY STOP" lists, plus "Ask your pharmacist to tell you: The medications I need to TEMPORARILY STOP are…" |
| 46 | T2·18, P·4 | More than one way of eating works; dietitian | Ch 11 | Confirmed | "choose the dietary pattern that best aligns with their values, preferences and treatment goals"; "nutrition counselling by a registered dietitian" |
| 47 | T2·21 | Driving card for insulin or a pill that can cause lows | DC Drive Safe card PDF; Ch 21 | Confirmed | "If you take insulin or pills that can drop your blood sugar below 4 mmol/L" |
| 48 | T2·23 | Type 2 eye exam at diagnosis, then on a schedule | Ch 30 | Confirmed | At diagnosis. Interval 1–2 years if minimal or no retinopathy |
| 49 | T2·24 | Type 2 kidney screening at diagnosis | Ch 29 (2025); DC kidney page | Confirmed | "begin at diagnosis and annually thereafter" |
| 50 | T2·25 | Diabetes raises heart and stroke risk; ABCDEs | diabetes.ca heart-disease-and-stroke | Confirmed | "diabetes increases your risk of heart disease and stroke" |
| 51 | GDM·3 | Targets are different in pregnancy | Ch 36 (Ch 8 cited too) | Partly | Ch 36 gives pregnancy targets (fasting <5.3, 1 h <7.8 in GDM, 2 h <6.7). The fetched **Ch 8 does not mention pregnancy**, so drop `dc-cpg-ch8-targets` from this row's citation |
| 52 | GDM·19 | Alcohol sheet: don't drink if pregnant or breastfeeding | DC alcohol sheet PDF | Confirmed | "You should not drink alcohol if you: are pregnant or trying to get pregnant… are breastfeeding". Optionally add "or trying to get pregnant" |
| 53 | GDM·21 | International guidance: a steady fasting 5.5–8 with diabetes in the family can point to a single-gene type; tell your team early | diabetesgenes.org GCK in pregnancy (Exeter, PDF dated 18 Jan 2018) | Partly | Exeter lists six separate features, including "Persisting fasting hyperglycaemia… (5.5-8mmol/L)" and a first-degree relative with GDM, fasting >5.5 or "type 2". It does not say the two together "point to" GCK. Use "can be a sign worth raising". The source is 2018 UK clinical guidance, and the sentence names it as international, which is right. Keep "tell your team" and add no management advice. GCK changes how insulin is used in pregnancy, which is a specialist decision |
| 54 | GDM·22 | GDM raises the chance of heart disease later | DC gestational-diabetes page | Confirmed | "higher risk… later in life such as type 2 diabetes and heart disease" |
| 55 | P·2 | With symptoms, contact your doctor without waiting | Ch 3 | Confirmed | With symptoms, "a single test result in the diabetes range is sufficient". Treatment shouldn't be delayed |
| 56 | P·6 | Indigenous adults with risk factors: consider a check every 6–12 months | Ch 38 | Confirmed | "should be considered every 6 to 12 months in those with additional risk factors" (adults >18). Wording matches |
| 57 | LC·2 | LADA often first treated as type 2 | BT1D LADA; Diabetes UK LADA | Confirmed | BT1D: "often misdiagnosed and managed as T2D". DUK: "some people are diagnosed with having type 2 diabetes by mistake" |
| 58 | LC·4 | Diagnosed before 6 months, including adults looking back | Ch 3 | Confirmed | "all people with a diagnosis of type 1 diabetes should be reviewed to determine if diagnosis occurred prior to 6 months of age and, if so, genetic testing should be performed" |
| 59 | LC·5 | Syndromes with hearing or vision loss | ISPAD 2022 Ch 4 (Greeley et al., Pediatr Diabetes; PMC10107883) | Confirmed | Covers Wolfram/DIDMOAD (diabetes, optic atrophy, deafness) and Alström (visual impairment, hearing loss). INTL badge is correct |
| 60 | LC·7 | CFRD yearly screening from age 10, through the CF clinic | CF Canada CFRD guideline (updated 2024) | Confirmed | "annual screening for CFRD should start by age 10 with an A1c"; "CF clinics should have protocols for CFRD screening" |
| 61 | LC·9 | Diabetes Canada counts LADA as type 1 | Ch 3 | Confirmed | — |
| 62 | LC·11 | CF Canada recommends glucagon and teaching for people with CFRD on insulin | CF Canada CFRD guideline, Rec IV | Partly | The guideline recommends self-management **education** that covers "handling hypoglycemia (including the use of glucagon for insulin-treated individuals)". It doesn't separately recommend that every person be prescribed glucagon (only hospital access, Rec II). Use "Cystic Fibrosis Canada's guideline says people with CFRD who take insulin should be taught how to use glucagon" |
| 63 | LC·18 | Diabetes can feel like a burden; you can ask for help | DC taking-care-of-your-mental-health | Confirmed | "Living with diabetes can feel like a burden" |
| 64 | LC·8 (not marked src) | "Steroids, some antipsychotics, cancer immunotherapy, and diabetes after a transplant" | Appendix 2; Ch 20; kyt cites ada-soc-2026-s2-summary for immunotherapy | Partly | This is a fact claim with no (src) mark. Appendix 2 does not list checkpoint inhibitors. Mark it (src) and add kyt 6.s2.8's sources (App. 2 + Ch 20 + ADA 2026 S2) to D.6, or drop "cancer immunotherapy" from the reason |

## 3. Held items and proposed register additions (checked so the register entries are right)

| # | Item | Source | Status | Correction |
|---|---|---|---|---|
| 65 | F.1 Ch 5 title and authors | diabetes.ca …/chapter-5 | Confirmed | "Reducing the Risk of Developing Diabetes"; Prebtani, Bajaj, Goldenberg, Mullan; CJD 2018. The page range wasn't shown, so confirm it from CJD |
| 66 | H-P1 5% weight loss can delay or prevent type 2; RD; activity | Ch 5 | Confirmed (verbatim) | "a loss of 5% of your initial body weight can delay or prevent type 2 diabetes from developing"; RD and activity lines are verbatim. Can be released once registered. Nurse note: present it as one option, not a weight-loss instruction, and keep "a dietitian can help" |
| 67 | H-P2 "almost 60%" | Ch 5 | Confirmed, keep held | "can reduce the risk of progression… by almost 60%". This applies to intensive structured programmes in trial populations. Agree it should stay out |
| 68 | F.2 Ch 4 title and authors; prediabetes CV risk | diabetes.ca …/chapter-4 | Confirmed | "Screening for Diabetes in Adults"; Ekoe, Goldenberg, Katz. Quotes for H-P3 are verbatim |
| 69 | H-G1 GDM managed with eating and activity; some also need insulin | Ch 36 | Partly | Ch 36: "First-line therapy consists of diet and physical activity. If glycemic targets are not met, insulin **or metformin** can then be used." To stay out of drug naming, use "some people also need medicine, often insulin". The locator can now be added (no new SourceId) |
| 70 | H-T1 About 300,000 Canadians have type 1 | BT1D facts | Confirmed | "~300,000 Canadians have T1D" (T1D Index). Fine to keep held |

---

## Problems

**P1. Stale source (high).** `holt-t1d-adults-consensus-2021` was superseded by the ADA/EASD **2026** consensus report, published 2026-09-15. The Type 2 intro (row 11) and the less-common safety line both rest on it, and so do several kyt cards. Read the 2026 report directly (Diabetologia or Diabetes Care, doi 10.1007/s00125-026-06833-z), register it, and match its wording. Secondary reports give "approximately 40%", not "more than 40%".

**P2. Funding claims that overreach or leave out conditions (medium).**
- Type 2: naming ODB right before "At Liivv, you pay… then claim" suggests ODB is a normal pay-and-claim program. It's normally billed at the counter with a co-pay. A receipt route exists, and reimbursement is less the co-pay. Reword (row 13).
- Gestational: MfH is only for people with **no other funding**, so add that condition (row 19).
- Less-common: NIHB CGM needs **prior approval**. Say so on the Funding page.
- Nothing claims direct billing, pay-later or a phone number. Those stay held, which is correct.

**P3. Clinical wording that could mislead (medium, nurse).**
- GDM·5 suggests home checking is optional in GDM. Reword (row 41).
- T1·28 leaves out the "after puberty" rule for children on a path that also serves parents (row 38).
- T1·24 should say "recreational" (row 36).
- LC·11 overstates the CF guideline (row 62).
- GDM·21 turns two separate Exeter features into one rule (row 53).
- H-G1 leaves out metformin if released (row 69).

**P4. Unsourced fact (low).** LC·8 lists cancer immunotherapy with no (src) mark, and Appendix 2 doesn't support it. Cite kyt 6.s2.8's sources or drop it (row 64). T1·12 should be "at least" one to two weeks (row 33). TrialNet needs its age limits (row 39). Drop the Ch 8 citation from GDM·3 (row 51).

**P5. Pharmacist CDE band: mismatch and scope (medium, owner).**
- On Gestational ("Questions about your supplies") and Type 2 ("sensors and supplies"), the shared body says CDEs answer "pump and CGM questions". Most people with GDM use a meter, strips and lancets, so the heading promises more than the body. Either widen the body ("questions about meters, sensors, pumps and supplies") if the owner confirms that scope, or give each path a heading that matches the body.
- "for all of Canada… pass you to the right Liivv pharmacy" implies Liivv holds pharmacy licences, or partner pharmacies, in each province or territory a caller might be in. Owner must confirm before release. Pharmacist advice is regulated provincially.
- "CDE" is a protected credential (CDECB). Owner must confirm every pharmacist answering holds a current CDE, or use "pharmacists with diabetes training".

**P6. Owner facts not verifiable (info).** Hours, holiday closures and "Request a call" routing to `/account/virtual-care/appointment` can't be verified from public sources, and the appointment form doesn't yet have the "Pump or CGM question" reason (E.1). Don't publish the band until that reason exists.

**P7. Dated comparison data (low).** If Q1's fallback links to Diabetes Canada's province comparisons, note that the pump and CGM documents there are from 2024.

**P8. Register titles (Q11 resolved).** Printed titles: `cra-dtc-life-sustaining-therapy` = "Life-sustaining therapy eligibility". `on-odb-coverage` = "Get coverage for prescription drugs". `dc-ontario-monitoring-for-health` = "Ontario Monitoring for Health Program". `on-preventing-and-living-with-diabetes` = "Preventing and living with diabetes". `on-adp-insulin-pumps` = **"Diabetes equipment and supplies"**. The last one probably differs from the register slug or title. Update the register.

**P9. Checks with nothing found.** No Diabetes Express mention in the copy, no testimonials, no dosing, no product or shop placement (the slot is ON HOLD and Prediabetes is excluded). The safety strip is on all five paths, and no unsourced statistic appears in the shipped JSON. The 10%, 71%, 90–95%, 3–20% and 40% figures are each named to a source in the sentence.
