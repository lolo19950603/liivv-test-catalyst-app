# Diabetes Care landing: source check (2026-10-05)

Checked: `landing.draft.md` (section B copy and the C claims table). Every cited page was fetched on 2026-10-05. Diabetes Canada's comparison PDFs were downloaded and read. Owner, code and page claims can't be checked against a public source; they are listed with the check each one needs. No repo file was edited.

## 1. Claims against sources

| # | Claim (key) | Source fetched | Result | Correction / note |
|---|---|---|---|---|
| 1 | facts.1: "5 to 10%" of people with diabetes have type 1; it can start in adulthood | diabetes.ca/about-diabetes/type-1 | Confirmed | The page states both "Roughly 10 per cent" and "Five to 10 percent". It also says type 1 "can also develop in adulthood". 5 to 10% is correct and matches Ch01. Undated page. |
| 2 | facts.2: "90 to 95%" have type 2; it may have no symptoms | diabetes.ca/about-diabetes/type-2 | Confirmed | Source: "90-95% of diabetes cases in Canada" and "some may have no symptoms at all". Optional: add "in Canada" to match the source. |
| 3 | facts.3: "3 to 20%" of pregnancies are affected by gestational diabetes; it usually goes away after birth | diabetes.ca/.../gestational-diabetes | Partly | Source: "Between three to 20% of pregnant women develop gestational diabetes, **depending on their risk factors**." The copy leaves out the qualifier and swaps "pregnant women develop" for "pregnancies are affected". Suggest: "of pregnant people develop gestational diabetes, depending on their risk factors, Diabetes Canada says. It usually goes away after birth." The "goes away after birth" part is confirmed. |
| 4 | facts.4: "About 71%" of Canadians with type 1 were diagnosed as adults | breakthrought1d.ca/t1d-basics/facts-and-figures | Confirmed (with note) | Source: "~71% of individuals with T1D are diagnosed as adult". It sits among Canada-specific figures, with footnote 1 citing the Type 1 Diabetes Index, which is a modelled estimate. The source wording is "individuals with T1D", so the safer copy is "of people with type 1 in Canada". Undated. |
| 5 | types.hints.lada: "Type 1 that starts slowly in adults" | breakthrought1d.ca/.../latent-autoimmune-diabetes-in-adults; DC CPG ch. 3 | Confirmed | BT1D: LADA is "a form of type 1 diabetes" and "the autoimmune process in LADA happens more slowly than in typical T1D". The CPG (Table 1) uses the term for apparent type 2 with immune-mediated beta-cell loss. Consistent. |
| 6 | types.hints.mody: "Single-gene diabetes" | diabetes.org.uk MODY; diabetesgenes.org/what-is-mody | Confirmed (international) | Both say MODY is caused by a change in a single gene. Both sources are UK. The chip states no fact, but Ch05 card 8 must carry the "International guidance" badge, as the draft says. |
| 7 | types.body: "Your team decides your type" | DC CPG ch. 3 | Partly | The CPG says telling the types apart "can be difficult at the time of diagnosis" and calls for "clinical judgement". It doesn't say "your team decides". As guidance this is fine. Treat it as a voice line, not a sourced fact. |
| 8 | faq.1: coverage of pumps, sensors, strips and needles differs by province and territory, "and Diabetes Canada compares them side by side" | diabetes.ca/comparisons-by-province-territory, plus four PDFs read | Partly, **stale** | The topics are confirmed: glucose monitoring devices, insulin pumps, SMBG strips, and needles, syringes and lancets. The documents are province-by-province tables. **But they are out of date for 2026-10-05.** The PDFs say: CGM "Updated July 2025", pumps "Updated December 2024", strips "Last updated: May 2025", needles "Last updated: June 2025". The needles table still says BC PharmaCare covers "needles and syringes … only". BC Plan NP (page updated 2026-08-27) added lancets and blood and urine ketone strips on 2026-04-01, the mylife YpsoPump on 2025-12-17 and Omnipod 5 on 2026-04-01. Federal pharmacare agreements that include "Increased Access to Diabetes Devices and Supplies" were signed with MB, BC, PEI and YT in Feb–Mar 2025 (canada.ca, modified 2026-01-26). Suggest: "…and Diabetes Canada compares them by province and territory. Coverage changes, so check the date on each comparison and confirm with your provincial plan." |
| 9 | faq.3: a sensor reads up to 15 minutes behind a finger-prick check; keep a meter as backup | diabetes.ca/.../technology-and-devices | Confirmed | Source: CGM "is slower to show actual blood sugar levels by up to 15 minutes", and you should keep "a blood glucose monitor and testing strips for double checking CGM readings and as a backup". The pre-publish re-read (D13) is now done, and it matches. |
| 10 | faq.4: HPSA operates in MB, ON, QC, NB and PEI | healthsteward.ca/consumers/returning-medical-sharps | Confirmed | Quoted list, exact. |
| 11 | faq.4: free sharps containers at participating collection locations, such as pharmacies, which take them back | same | Confirmed | "Free medical sharps containers are available at participating HPSA collection locations". The locations are "participating pharmacies, vet clinics and dispensaries". "Return the sealed container safely to your nearest HPSA drop off location." |
| 12 | faq.4: accepts "lancets, pen needles, syringes, infusion sets and sensor applicators with needles" | same | Partly | HPSA's list says **"Pen tips"** (and "Needles"), not "pen needles". The others match: "Lancets", "Syringes", "Infusion sets", "Continuous Glucose Monitors (CGM) applicators with needles". Suggest "lancets, pen tips (pen needles), syringes, infusion sets and CGM applicators with needles". Also note that glucose meters are **not accepted**. |
| 13 | faq.4: HPSA says never put sharps in the garbage or recycling | same | Confirmed | "Never place used medical sharps in the garbage or recycling." |
| 14 | faq.4: elsewhere, ask your pharmacy | dc-getting-started-with-insulin (supporting) | Confirmed as an instruction | DC: "Check with your local pharmacy. Many pharmacies supply safe, puncture-proof containers." This could be cited for the "elsewhere" line instead of having no source. |
| 15 | faq.5: "Your prescriber chooses your insulin" | diabetes.ca/.../getting-started-with-insulin | Partly | DC: "Your health-care provider will work with you to decide" the number, timing and dose of injections, and the pump and its settings. It doesn't say "prescriber chooses". Insulin is also NAPRA **Schedule II** (napra.ca/nds/insulin, approved 1998-09-23): no prescription is needed under the national model, though plans need one for coverage. "Prescriber" implies a prescription is always required. Suggest: "Your diabetes team helps you choose your insulin and dose." |
| 16 | faq.5: "follow the leaflet that comes with your insulin" to store it | same | Partly | DC: "Insulin storage is different for each product. Look at product information or contact your healthcare provider." Suggest: "Storage is different for each insulin. Follow its product information, or ask your pharmacist." |
| 17 | care.cde.cdeMeaning: CDE stands for Certified Diabetes Educator | systems.cdecb.ca/findCDE (registered `cdecb-find-a-cde`) | Partly | The registered directory page doesn't spell out CDE. cdecb.ca's home page does: "A Certified Diabetes Educator (CDE)® is a health professional…". Either cite cdecb.ca or add a register locator. CDE® is a registered mark, so consider "CDE®" on first use. |
| 18 | faq.2 / trust.4: ad signals off on DC pages | code: `core/lib/analytics/ad-signals.ts` (CARE_PATH includes `diabetes-care`) | Code-only; gate holds | The code matches, but `ad-signals.ts` and `sensitive-products.ts` are **uncommitted** (git status M). Keep the `adSignalsShipped` gate. |
| 19 | trust.1 / care.cde.body: pharmacist CDEs "across Canada", Mon–Fri 9–5 ET | owner | Not confirmable | No public source. See problem P4 (licensure). |
| 20 | trust.2: a Liivv pharmacy in every province except Quebec | owner | Not confirmable | No public source. It also implies no pharmacy in the territories, which matches D7, but the wording should not suggest Quebec readers can't be served if they can (D7). |
| 21 | faq.1: Liivv doesn't bill any program directly yet; pay and claim | owner | Not confirmable | See P1 about "yet" and "for now". |
| 22 | kits.body: each kit is checked by a nurse | owner | Not confirmable; gated (`hasKits`) | OK while hidden. |
| 23 | subscribe.*: skip with no charge, nothing ships; pause, skip or cancel in Account | code | Not checked against code in this pass | Confirm that the Stripe subscription flow is enabled for diabetes SKUs, not just ostomy (D17). |

Program rows: the live copy has only one program row with eligibility detail, HPSA (rows 10–13). Funding programs are deferred to the Funding page (doors.5, gated `fundingPage`), so there are no amounts, ages or payer statements to check on this page.

## 2. Problems

**Stale for 2026-10-05**
- **P1. FAQ 1, the "side by side" comparisons.** All four comparison PDFs are dated December 2024 to July 2025. They predate BC's April 2026 device and supply expansion, and possibly changes in MB, PEI and YT under the 2025 pharmacare agreements. The BC needles row is already wrong: it doesn't list lancets. Pointing readers there as the comparison, with no caveat, steers them to stale coverage. Add the "check the date and your provincial plan" caveat (row 8). The Funding page should use primary provincial sources.
- **P2. Funding door (doors.5).** "What your province and other programs may cover" is fine as a teaser. But the Funding page must reflect national pharmacare: BC Plan NP covers select diabetes medications at 100% from 2026-03-01, and there are MB, PEI and YT agreements.

**Overpromising Liivv services**
- **P3. FAQ 1, "doesn’t bill any program directly *yet*, so *for now*…".** "Yet" and "for now" imply direct billing is coming. That is E11, unconfirmed. Suggest: "Liivv doesn’t bill provincial or private plans directly. You pay for your order and claim it from your plan." Also, "Ask us before you order" points to a channel that doesn't exist yet (D8). Hold the sentence, or link it only once D8 is decided.
- **P4. "Pharmacist CDEs … for all of Canada" (trust.1, care.cde.body, FAQ 3).** Pharmacists are licensed by province. Answering a patient's device questions in a province where the pharmacist isn't registered, especially Quebec (OPQ), where there is no Liivv pharmacy, may be outside scope. The owner must confirm the CDEs are licensed in, or allowed to serve, each province. Until then, frame the service as device and supply education, not pharmacy care: "Your treatment and settings stay with your diabetes team" helps. Or limit it to the provinces where Liivv has a pharmacy.
- **P5. care.cde.cta "Request a call".** The target `/account/virtual-care/appointment` has no CDE reason yet (D3), and the phone line is held (E9). "Request a call" promises a phone call that isn't confirmed. Use "Request an appointment" until both are in place.
- **P6. Pay-later (E10) and direct billing (E11)** are correctly held and appear in no live string. A phone number (E9) is correctly held, and there is no number in the copy.
- **P7. FAQ 5 (gated).** "Yes. Insulin is listed…" Insulin is Schedule II (pharmacist intervention, behind the counter). Shipping it raises open questions: cold chain (E2), shipping to Quebec and the territories (D7), and provincial rules on remote Schedule II sales. Keep FAQ 5 gated until operations also confirms these, not only the pharmacist review.

**Unsourced statistics**
- None in the live copy. All four facts trace to fetched sources, and the removed `STATS` band ("10k+", "24/7", "19+") stays out. Row 4 (71%) is a modelled T1D Index estimate. Acceptable, but the nurse should approve it (D13).

**Safety and scope**
- **P8.** The doors.2 urgent door, with emergency signs first, is correct. Check that the secondary "Not an emergency? The Rule of 15" doesn't invite self-treatment of a severe low. Card 11 ("Who to call") is the safer secondary (D11).
- **P9.** FAQ 3: "For a low, a high or a sick day, go to Staying Safe" is fine. Consider adding: "If you can’t treat a low yourself, or you feel very unwell, call 911."
- **P10.** FAQ 5 "prescriber chooses" and the "leaflet" storage line: see rows 15 and 16. Use the source wording, and give no storage or dosing specifics.
- **P11.** FAQ 4: HPSA doesn't accept glucose meters, and the program covers only five provinces. "Elsewhere … ask your pharmacy" is right. Cite the DC insulin page (row 14) for it.

**Diabetes Express**
- No mention of Diabetes Express, by name or link, anywhere in the draft. The draft keeps the "partner site the owner asked us not to name" unnamed and unlinked. OK.

**Register / citation fixes**
- `cdecb-find-a-cde` doesn't spell out CDE. Use the cdecb.ca home page, or add a locator (row 17).
- `dc-comparisons-by-province` locator: record the PDF dates (pumps December 2024, strips May 2025, needles June 2025, CGM July 2025) and the BC lancet gap.
- `hpsa-returning-medical-sharps` locator: the items are "Pen tips", not "pen needles", and glucose meters are not accepted.
- F1 (NAPRA): the insulin entry now has a read. https://www.napra.ca/nds/insulin/ gives "Schedule: II", approved September 23, 1998. Register it if FAQ 1 or FAQ 5 is to say anything about prescriptions.

## Sources fetched (2026-10-05)
- https://www.diabetes.ca/about-diabetes/type-1
- https://www.diabetes.ca/about-diabetes/type-2
- https://www.diabetes.ca/what-is-diabetes/types-of-diabetes/gestational-diabetes
- https://breakthrought1d.ca/t1d-basics/facts-and-figures/
- https://breakthrought1d.ca/newly-diagnosed/latent-autoimmune-diabetes-in-adults/
- https://www.diabetes.ca/for-professionals/full-guidelines/chapter-3
- https://www.diabetes.org.uk/about-diabetes/other-types-of-diabetes/mody
- https://www.diabetesgenes.org/what-is-mody/
- https://www.diabetes.ca/comparisons-by-province-territory (plus the CGM, pump, strip and needle PDFs)
- https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/technology-and-devices
- https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/getting-started-with-insulin
- https://healthsteward.ca/consumers/returning-medical-sharps/
- https://systems.cdecb.ca/findCDE and https://www.cdecb.ca/
- https://www.napra.ca/nds/insulin/
- https://www2.gov.bc.ca/gov/content/health/practitioner-professional-resources/pharmacare/plans/national-pharmacare-plan-np
- https://www.canada.ca/en/health-canada/corporate/transparency/health-agreements/national-pharmacare-bilateral-agreements.html
- news.gov.bc.ca/releases/2026HLTH0030-000334: fetch failed (certificate error). BC facts were taken from the gov.bc.ca Plan NP page instead.
