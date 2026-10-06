# Funding draft: live source check (2026-10-05)

Checked against `funding.draft.md` (sections A.4, B and C). I fetched every registered URL in `sources-meta.ts` that the draft cites, on 2026-10-05. The page dates below are the dates printed on each page. No repo files were edited.

Status key:
- **Confirmed:** the page states it.
- **Partly:** the page states some of it, or states it differently. The correction is given.
- **Not confirmed:** the page doesn't say it, or says something else.

## 1. Claims table

| # | Claim (key) | Source (page date) | Status | Correction |
|---|---|---|---|---|
| 1 | fed-nihb.covered: these CGMs are covered: Libre 2, Dexcom G6/G7, Guardian Connect | isc-nihb-updates (modified 2026-07-30) | Partly | The page says NIHB "continues to cover" these, and that the CGM benefit is for "clients managing diabetes with insulin". "For anyone who manages their diabetes with insulin" reads as universal. Say "for NIHB clients who manage their diabetes with insulin". The page doesn't say whether these are open or limited-use, so don't imply no prior approval is needed. |
| 2 | fed-nihb: Libre 3 with prior approval, 1 reader every 3 years, 14 sensors every 6 months (Sep 2025) | isc-nihb-updates | Confirmed | — |
| 3 | fed-nihb: Guardian 4, type 1, 19 or under, MiniMed 780G (Dec 2024) | isc-nihb-updates | Partly | The page adds "on intensive insulin" and "limited use benefit with prior approval". Add both. |
| 4 | fed-nihb: test strips up to 800 every 100 days | isc-nihb-updates | Partly | The page says "for insulin-managed diabetes". Add "if you use insulin". As written, it overstates the limit for non-insulin users. |
| 5 | fed-nihb.howToApply: pharmacy benefits; some need prior approval | isc-nihb-updates | Partly | Prior approval is confirmed. "Pharmacy benefits" is not stated on this page; it needs F-24 or F-25. |
| 6 | fed-vac: CGM, type 1, code 401140, pre-authorization, 1 every 5 calendar years | vac-cgm-type-1 (NWT grid, modified 2026-03-19) | Confirmed | The page also says a NP or MD prescriber is needed, except for a replacement device. Add "with a prescription". |
| 7 | fed-vac.notes: we read only the NWT version | vac-cgm-type-1 | Confirmed, can now be resolved | The same benefit 401140, with the same rules, is on the Alberta grid (URL without the "-5" suffix) and the Manitoba grid ("-1"). The rule is evidently national. Register the base URL, drop the NWT note and set `confirm: false`. |
| 8 | fed-vac.who: "Veterans Affairs Canada clients with type 1" | vac-cgm-type-1 | Partly | The grid lists the benefit. It doesn't say every client with type 1 qualifies, because VAC eligibility depends on the client's entitlement. Say "may be covered … ask VAC". |
| 9 | on-adp-pump: 100% of the ADP price; $2,400 a year as $600 every 3 months, paid to you | on-adp-insulin-pumps (updated 2026-09-15); on-diabetes-equipment-and-supplies | Confirmed | — |
| 10 | on-adp-pump.who: type 1; not income-based | on-adp-insulin-pumps | Partly | The page says "type 1 diabetes with specific medical criteria". It also says you aren't eligible if WSIB or VAC already pays for the same items. Add "who meet the program's medical criteria". |
| 11 | on-adp-pump.howToApply: registered DEP assesses; registered vendor submits; about 8 weeks; renew supplies yearly | on-adp-insulin-pumps | Confirmed | The page says "within 8 weeks", so "up to 8 weeks" is more accurate than "about". The first $600 is sent within 30 days of approval. |
| 12 | on-adp-pump.notes: after the 5-year warranty, replaced "only with repair quotes"; lost or misused not covered | on-adp-insulin-pumps | Partly | The page: a replacement is covered if your medical needs have changed, or the pump is worn out after the 5-year warranty; a repair quote is required for a pump out of warranty. Reword to "After the 5-year warranty, a worn-out pump can be replaced; ADP asks for a repair quote." |
| 13 | on-adp-cgm: rtCGM sensors, transmitters and a receiver if needed, "up to a set amount"; type 1 meeting criteria; renew every 2 years | on-diabetes-equipment-and-supplies; on-adp-insulin-pumps | Partly | The page says "full coverage … up to a maximum allowable quantity per 24-month period", with a receiver "in some cases". Replace "up to a set amount" with "full coverage, up to a set quantity every 2 years". |
| 14 | bc-pharmacare-pumps: MiniMed 670G/770G/780G, Omnipod DASH, Omnipod 5, mylife YpsoPump on the list; some need Special Authority | bc-diabetes-pins (updated 2026-09-17) | Partly | The models are confirmed. The page says pump PINs "are provided for use by approved vendors submitting claims to PharmaCare". It does not tie Special Authority to pumps. Drop "Some need Special Authority" from the pump row, or source it. |
| 15 | bc-pharmacare-pumps.notes: Tandem pumps not on the list | bc-diabetes-pins | Confirmed (re-checked 2026-10-05) | No Tandem pump PIN is listed. Tandem t:slim cartridges and AutoSoft, TruSteel and VariSoft infusion sets are listed. Say "Tandem pump supplies are listed, but no Tandem pump was when we checked", or a reader on a Tandem pump will think their supplies aren't covered. |
| 16 | bc-cgm: Dexcom G6/G7, Libre 2 and Libre 3 Plus listed; "some need Special Authority" | bc-diabetes-pins | Partly | The page: "Special Authority must be in place for anyone wanting PharmaCare coverage of a CGM", and Special Authority "is needed" for flash monitors. Every listed sensor needs Special Authority. Change to "All of them need Special Authority". |
| 17 | sk-pump: $6,300 grant, 1 pump every 5 years; type 1 | sk-insulin-pump-program (no date shown) | Confirmed | The page adds "would benefit from a pump" and SAIL criteria. |
| 18 | sk-pump: supplies "through your Drug Plan, so your deductible and co-payments apply" | sk-insulin-pump-program | Partly | The page: you pay for supplies according to your coverage (SIS, SAID, Seniors Income Plan, Special Support, Seniors' or Children's Drug Plan), and deductibles and co-payments apply by program. Say "Pump supplies follow your Drug Plan coverage, so deductibles and co-payments apply." |
| 19 | sk-pump.howToApply: an SHA DEP assesses you; under 18 goes through the pediatric program | sk-insulin-pump-program | Partly | The application is submitted by an SHA DEP *or an authorized diabetes specialist physician*. For children, it goes through the SHA pediatric DEP, with an information session or online module. |
| 20 | mb-pump: Omnipod, Tandem, Medtronic, Ypsomed; adults 18+ with type 1 | mb-shared-health-diabetes-care | Confirmed | — |
| 21 | mb-pump.who: "pre-approval from an endocrinologist" | mb-shared-health-diabetes-care | Partly | "Assessed by either an endocrinologist or approved Diabetes Specialist who will submit a form to Manitoba Health". The MEPP page names the program "Manitoba Adult Insulin Pump Coverage Program (MAIPCP)" and calls it "no cost coverage". Use the legal name and say "at no cost". |
| 22 | mb-cgm: CGM and FGM; type 1 or 2 on basal-bolus or a pump; no prescription or EDS application; Pharmacare deductible | mb-shared-health-diabetes-care; mb-pharmacare-mepp | Confirmed | MEPP: "AGM are eligible Manitoba Pharmacare Program benefits"; supplies are "where deductibles apply". |
| 23 | mb-mepp: from Apr 15, 2025, most diabetes medicines at no cost, no deductible; Ozempic not included | mb-pharmacare-mepp (no date shown) | Confirmed | — |
| 24 | mb-mepp.howToApply: "Show your Manitoba Health card at any pharmacy" | mb-pharmacare-mepp | Partly | You also need a prescription for an eligible MEPP product. Say "Bring your prescription and your Manitoba Health card to any Manitoba pharmacy." |
| 25 | mb-mepp.notes: pumps, sensors, strips, syringes and lancets "stay under regular Pharmacare" | mb-pharmacare-mepp | Partly (wrong for pumps) | Supplies stay under Pharmacare, with the deductible. AGMs are Pharmacare benefits. **Pumps are under MAIPCP at no cost, not regular Pharmacare.** Reword. |
| 26 | qc-pump: $6,300 a pump every 5 years; $4,000 a year for supplies; join before 18, stay with a yearly review; adults can't join | qc-insulin-pump-access-program (updated 2021-02-19) | Confirmed | It is stale: a 2021 page in 2026 (it keeps `confirm: true`). The official French name is on the page, "Programme d'accès aux pompes à insuline". Fill `programNameFr` (resolves D-9 for QC). |
| 27 | qc-pump.howToApply: original receipts or insurance statements to the CHU de Québec – Université Laval; some companies are refunded directly | qc-insulin-pump-access-program | Confirmed | — |
| 28 | nb-ipp: pumps, supplies and CGM for the uninsured part; pumps type 1 at any age; CGM type 1, or type 2 on 3+ injections a day; income-tested; specialist, then online | nb-insulin-pump-program (no date shown) | Confirmed | The specialist is an endocrinologist, internist or pediatrician. "Applicants with 100% insurance coverage are NOT eligible". Insulin, strips and batteries are not covered; consider adding that. |
| 29 | nb-ipp.howToApply: co-pay to the vendor; the vendor bills the province | nb-insulin-pump-program | Confirmed on the page itself | "Remaining costs are billed to the province by the vendor." The D-12 question is resolved. |
| 30 | ns-ipp: 1 pump every 5 years (Tandem, Medtronic, Insulet) plus supplies; income-based share; type 1 diagnosed at least 4 months ago; renew Jan 1 to Mar 31 | ns-insulin-pump-program (no date shown) | Confirmed | The co-payment is annual and based on family size, with "no premiums or deductibles". The page says CGM isn't covered by IPP; it points to the Sensor-based Glucose Monitoring Program. |
| 31 | privateFirst.NS: pays after other coverage | ns-insulin-pump-program | Confirmed | "You need to use any sources of insurance that you have … before the program can begin coverage." |
| 32 | privateFirst.NB | nb-insulin-pump-program | Confirmed | — |
| 33 | nl-pump: provincial pump program with an income test | nl-cgm-program-2025 | Confirmed | — |
| 34 | nl-cgm: from fall 2025, all type 1 meeting the medical and income criteria; earlier pilots covered youth, pregnancy and GDM | nl-cgm-program-2025 (news release, 2025-05-22) | Confirmed, but stale | The pilots: children with type 1 (2023); in 2024, up to age 24, plus pregnancy and gestational diabetes. Coverage is "full or partial". The only source is a pre-launch news release from 17 months ago. Find and register the program's own page before publishing. |
| 35 | on-odb-strips: 3,000 / 400 / 200 / 200 a year; more needs a prescriber's reason | on-odb-coverage (updated 2026-08-18) | Confirmed | The prescriber is a "physician or nurse practitioner". |
| 36 | on-odb-strips.who: ODB includes 65+ and 24 and under with no private plan | on-odb-coverage | Confirmed | It also covers long-term care, home care, OW/ODSP and Trillium. "Includes" is accurate. |
| 37 | on-mfhp.who: insulin users (type 1 or 2) and GDM | dc-ontario-monitoring-for-health (updated 2026-05-19) | Confirmed | It also requires "no other coverage for supplies". Add that. |
| 38 | on-mfhp.who: 24 and under, and 65+, claim lancets and meters only, because ODB or OHIP+ covers strips | dc-ontario-monitoring-for-health | Partly | The rule is stated. But the page also says: "There is no age limit to submit claims for this program year (April 1, 2025 – March 31, 2026)". That program year is over and the page doesn't state 2026–27 rules. Have the owner confirm the current year. The same rule also applies to social assistance and Trillium clients. |
| 39 | on-mfhp.howToApply: Diabetes Canada runs it; mail the form with original receipts | dc-ontario-monitoring-for-health | Confirmed | It goes to 1000-170 University Ave., Toronto. Processing takes about 8 weeks. |
| 40 | E-3 (held): MFHP amounts | on-preventing-and-living-with-diabetes (updated 2026-06-08), already registered | **Confirmed, can be released** | The page reads "75% … meters up to a maximum of $75 once every five years"; "75% … lancets and testing strips up to a maximum of $920 once every year"; talking meters $300 every 5 years. The DC page has no amounts, which is why billing-verify missed them. Cite the ontario.ca page. |
| 41 | on-adp-seniors: $170 a year toward syringes and needles; who: "People 65 and over" | on-diabetes-equipment-and-supplies (updated 2026-09-15) | Partly | The page says "a senior (65+ years) who needs insulin every day and lives at home". Add both conditions. You renew every 2 years, and payment is by direct deposit or cheque. |
| 42 | on-adp-seniors.howToApply: any retailer in Ontario | on-diabetes-equipment-and-supplies | Confirmed | "The business does not have to be registered with … ADP." Whether an online Liivv order qualifies is still D-4. |
| 43 | bc-plan-np: from Mar 1, 2026, insulin and a set list free; a few need Special Authority; automatic with MSP | bc-national-pharmacare (updated 2026-06-29) | Confirmed | 100%: insulins, metformin, glyburide, gliclazide, dapagliflozin, empagliflozin, empagliflozin/metformin. Special Authority: linagliptin (± metformin), pioglitazone, saxagliptin (± metformin). |
| 44 | bc-np-supplies: wider devices and supplies from Apr 1, 2026, with national pharmacare funding | bc-national-pharmacare; bc-diabetes-pins | Confirmed | — |
| 45 | E-9 (held): BC quantities of lancets, swabs and ketone strips | bc-national-pharmacare | Not confirmed | They aren't on the page. Keep held. |
| 46 | nt-ehb: since Apr 1, 2024, based on income, not a disease list | nt-extended-health-benefits (release 2023-09-14) | Confirmed | No diabetes content. The "haven't confirmed" wording is correct. |
| 47 | pe-/yt-pharmacare dates, and pharmacareSigned / notSignedBody: only MB (Feb 27), BC (Mar 6), PEI (Mar 7) and YT (Mar 20, 2025); page modified 2026-01-26 | hc-pharmacare-bilateral-agreements (modified 2026-01-26) | Confirmed | Still the current page date on 2026-10-05. A web search found no further signatories. Recheck at publish. |
| 48 | changes.3: Feb 27 to Mar 20, 2025 | hc-pharmacare-bilateral-agreements | Confirmed | — |
| 49 | fed-pharmacare: Pharmacare Act law Oct 10, 2024 | parl-bill-c64-pharmacare | Confirmed | Royal Assent was 2024-10-10 (S.C. 2024, c. 24). |
| 50 | fed-pharmacare.notes: Device Fund announced Feb 2024; no page on how to use it | hc-diabetes-device-fund-2024 (2024-02-29) | Confirmed | The release says details will follow "discussions with PT partners", which means it flows through the provinces and territories. Consider saying "Its details were left to agreements with provinces and territories." |
| 51 | fed-dtc: type 1 meets LST from 2021; otherwise at least 2 times a week and an average of at least 14 hours a week; time a pump spends delivering insulin excluded | cra-dtc-life-sustaining-therapy (modified 2023-01-24); cra-rc4064-2025 (modified 2026-01-20) | Confirmed | RC4064 explicitly names the insulin pump. The LST criteria also need 12 months' duration. |
| 52 | fed-dtc.howToApply: T2201 "or the CRA's digital application"; type 1 must still apply | cra-dtc-life-sustaining-therapy | Partly | T2201 is confirmed. The digital application is on the CRA "How to apply" page (`…/disability-tax-credit/how-apply-dtc.html`), not on the cited page. Register it. |
| 53 | fed-rdsp: DTC approval; open by Dec 31 of the year you turn 59; grants and bonds until the year you turn 49 | esdc-rdsp-apply (updated 2026-07-10) | Confirmed | Also needed: Canadian residency and a SIN. |
| 54 | enough2Body: DC province comparisons and an out-of-pocket report | dc-comparisons-by-province; dc-out-of-pocket-costs-2022 | Confirmed, but dated | The pump and glucose-monitoring comparisons are dated **2024**. They predate national pharmacare, MEPP, Plan NP, ODB CGM and the NL CGM expansion. The `noConfirmed` fallback sends readers there, so add "(2024)" to the link label. |
| 55 | claimBody: ON ADP $2,400 a year, $600 every 3 months, you buy supplies yourself | on-diabetes-equipment-and-supplies | Confirmed | — |
| 56 | quebecBody: pump supplies are claimed by receipt | qc-insulin-pump-access-program | Confirmed | See problem P2 for the broader claim. |
| 57 | Owner facts: Bayshore pharmacy in every province except QC, none in the territories; CDE hours; "Request a call" | — | O (not checkable) | — |
| 58 | cdeBody: "They can also connect you with the right Liivv pharmacy" | — | Not confirmed | This isn't among the owner facts, and D-2 says order routing is unconfirmed. Cut it, or get owner sign-off. |

## 2. Problems

### P1. Overpromise: "every program on this page works as pay up front and claim" (`ui.fundingPage.directEmpty`)

This is false, and the draft's own D-1 says so. The heading `claimHeading` / `claimBody` and `askUsBody` ("you pay for your order and claim it yourself") imply the same thing.

Programs where the reader can't send in a receipt, or must use a particular pharmacy or vendor:
- **ODB and OHIP+ strips:** at an Ontario pharmacy only.
- **NIHB:** pharmacy benefits.
- **MEPP and Plan NP:** at the pharmacy counter.
- **NB IPP:** the vendor bills the province.
- **BC pump supplies:** providers only.
- **BC pumps:** "approved vendors" (bc-diabetes-pins).
- **NS sensors:** pharmacy only.
- **ON ADP CGM:** through a registered vendor.

An Ontario reader told to "pay up front and claim" for ODB strips has no claim route at all.

Replace it with something like: "None is listed yet. Some programs pay you back from a receipt, and others pay only the pharmacy or supplier directly. Check how yours pays before you order, or ask us."

### P2. Quebec and territory cards ("you pay up front and claim it yourself")

The pump supplies route by receipt is confirmed. But the line reads as a promise for everything. The draft's own held E-8 has a quebec.ca source saying the public plan doesn't cover drugs bought outside Quebec.

Limit the card to the pump-supplies program, and add "other Quebec plans may not reimburse purchases from outside Quebec".

### P3. Liivv service claim without an owner source

`cdeBody`: "connect you with the right Liivv pharmacy" (row 58). Everything else about Liivv is safe:
- no phone number is shown;
- direct billing is empty;
- pay-later has no copy;
- the "Request a call" CTA only.

The `toolIntro` line ("Nothing you enter is saved or sent anywhere. This runs entirely in your browser") is a technical promise. Engineering must confirm that no analytics or event capture records the checker inputs. This matters because the inputs include health and Indigenous or veteran status.

### P4. Stale or time-sensitive for 2026-10-05

1. **QC pump page last updated 2021-02-19.** `confirm` stays on. Look for a newer RAMQ or MSSS page.
2. **NL CGM source is a May 2025 pre-launch release.** The program has been running since fall 2025. Register its own page.
3. **MFHP age rule.** The DC page's "no age limit" note covers the 2025–26 year only. The 2026–27 rules aren't stated, so confirm with the program.
4. **ON CGM through ODB is held (E-1), but it is live.** Dexcom G7 since July 31, 2025, and Libre 3 Plus since November 28, 2025, for ODB-eligible insulin users. Today a type 2 insulin user in Ontario, or anyone 65+ or 24 and under, gets "nothing we could confirm yet" for sensors. That is misleading. Register F-2 and F-3 (the government PDFs) before launch. The search found only industry and third-party pages, which policy 4 rules out as the only source.
5. **Alberta payer of last resort from 2026-10-01 (E-6)** took effect 4 days ago. AB readers with private insurance get no private-first card. Register F-10, or add a generic line.
6. **Diabetes Canada comparisons are 2024.** See row 54.
7. **CRA life-sustaining therapy page modified 2023.** RC4064 2025 (Jan 2026) agrees with it, so no change is needed.

### P5. Accuracy fixes that change meaning

These are covered in the table:
- **NIHB strips:** "if you use insulin" is missing (row 4).
- **BC CGM:** all need Special Authority, not some (row 16).
- **BC Tandem:** supplies are listed but the pump isn't (row 15).
- **MB pumps:** not under regular Pharmacare (row 25).
- **ON seniors' needles:** daily insulin and living at home are missing (row 41).
- **ON CGM:** a quantity, not an amount (row 13).
- **ON pump replacement** wording (row 12).
- **MB MEPP:** needs a prescription (row 24).

### P6. Unsourced statistics

There are none in the reader-facing copy. The out-of-pocket report and the Device Fund release contain statistics ($18,306; 3.7 million and others), and the draft correctly doesn't quote them. Keep it that way.

### P7. Safety and scope

- The urgent exit is retained and no gate may hide it. Good.
- The disclaimer is adequate.
- No dosing or device advice. Brand names appear only where a program lists them; Ozempic is named only as a program exclusion. Acceptable, subject to D-14.
- `cgmInsulinOnlyBody` is fine.
- `vacNotType1Body` is fine.
- `fed-vac.who` overstates eligibility (row 8).
- `fed-nihb.covered` "for anyone…" overstates eligibility (row 1).

### P8. Diabetes Express

There is no mention or link in the reader-facing messages. Line 22 in the internal ground rules says the layout "mirrors" its Financial Aid page (federal first, then a province picker). That layout is generic and no copy is reused, so it is acceptable. Keep the name out of the repo, comments and commit messages.

### P9. Register or locator actions found

| Action | Register / locator | Rows |
|---|---|---|
| Register | VAC base grid URL (national rule) | 7 |
| Register | CRA how-apply-dtc page | 52 |
| Register | F-2, F-3 (ODB CGM) | P4.4 |
| Register | F-10 (AB payer of last resort) | P4.5 |
| Register | NL CGM program page | 34 |
| Re-cite | E-3 to `on-preventing-and-living-with-diabetes` | 40 |
| Locator | `nb-insulin-pump-program` locator: "vendor bills province" is on the page itself | 29 |
| Locator | `programNameFr` for QC | 26 |
