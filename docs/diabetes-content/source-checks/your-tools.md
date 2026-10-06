# Your Tools: source check (CDE review)

Checked on 2026-10-05 against the live pages, which were downloaded raw with curl and turned into text. They were not run through a summarising fetch. The copies are saved in `scratchpad/src/yt/` (`*.html` plus `*.txt`). The C† pages (DC Checking Blood Sugar, DC Technology & Devices, Ascensia support, OneTouch Verio Reflect) are now saved word for word, which meets pre-publish check 1. One maker page is the exception: MiniMed renders its content with JavaScript, so I also read it through WebFetch.

The saved copies of DC Getting Started with Insulin and Diabète Québec match today's live pages byte for byte.

What the results mean:
- **Confirmed:** the fact is on the page as the copy states it.
- **Partly:** the fact is there, but the copy overstates it, narrows it, drops a qualifier, or misattributes it.
- **Not confirmed:** the cited page doesn't say it.

## A) Claims table

| Key: claim | Source checked | Result | Correction |
|---|---|---|---|
| categoriesIntro.body: the team chooses treatment | dc-technology-and-devices | Confirmed | "Your health-care team will work with you to decide… If an insulin pump will work for you; Your pump settings…" |
| 1.items.1: finger-prick drop on a strip in the meter | dc-checking-blood-sugar | Confirmed | None |
| 1.items.2: at most pharmacies, or from your educator | dc-checking-blood-sugar | Confirmed | None |
| 1.items.3: get trained before using it | dc-checking-blood-sugar | Confirmed | None |
| 1.items.4: how often depends on your plan; your team says | dc-checking-blood-sugar | Confirmed | None |
| 1.items.5: keep a meter and strips with a sensor, to double-check and as backup | dc-technology-and-devices | Confirmed | The page says "Even if you're offered a CGM… a diabetes kit that includes a blood glucose monitor and testing strips for double checking CGM readings and as a backup". |
| 2.items.1: ask which strips; whether the meter needs coding | dc-checking-blood-sugar; dc-technology-and-devices | Confirmed | None |
| 2.items.2: lancets go in sharps; pharmacies give out and swap containers | dc-getting-started-with-insulin | Confirmed | None |
| 2.items.3: free containers in MB, ON, QC, NB, PEI | hpsa-returning-medical-sharps | Confirmed | HPSA says "participating HPSA collection locations", which are pharmacies, vet clinics and dispensaries. Spell out "Prince Edward Island". Name the association in full on first use: "Health Products Stewardship Association (HPSA)". |
| 2.items.4: never in the garbage or recycling | hpsa-returning-medical-sharps | Confirmed | The page says "Never place used medical sharps in the garbage or recycling." |
| 2.figure Contour (held) | ascensia-support | Confirmed | The page says "if you are using a CONTOUR NEXT GEN, CONTOUR NEXT ONE or CONTOUR NEXT EZ meter, use only the CONTOUR NEXT control solution. Using any other control solution can cause inaccurate results." |
| 2.figure OneTouch (held) | lifescan-verio-reflect | Confirmed | "What's in the Box": the meter, the OneTouch Delica Plus lancing device, 10 OneTouch Delica Lancets, a pouch and the booklet. |
| 3.items.1–7: the "ask your provider" list | dc-checking-blood-sugar; dc-technology-and-devices | Confirmed | DC's first question reads "How and where to draw blood". The paraphrase is fine. |
| 3.note: these are DC's questions | as above | Confirmed | None |
| 4.items.1: patch, adhesive, filament; fluid between cells; "so you don't need finger pricks" | dc-technology-and-devices; dc-checking-blood-sugar | Partly | The description is confirmed. "So you don't need finger pricks" contradicts 1.items.5 and 5.items.7, and the same DC page says you may still need a finger check. Change it to: "…so it can read your sugar without a finger prick each time". |
| 4.items.2: scan-only vs continuous with alarms | dc-technology-and-devices | Confirmed | None |
| 4.items.3: some sensors connect to a pump; hybrid closed loop | dc-technology-and-devices | Confirmed | None |
| 4.items.4: not for everyone; talk with your team | dc-technology-and-devices | Confirmed | None |
| 4.figure G7 wear: "{days} days, plus a 12-hour grace period. It can't be restarted" | dexcom-g7-wear-time | Partly | The page says "indicated to be worn for **up to** 10 days, with a 12-hour grace period at the end". "It can't be restarted" is **not on the page**, though the locator says it is. Drop the restart clause, or register a page that says it. Use "Up to 10 days…". |
| 4.figure G7 ↔ t:slim X2 ("Both makers say so") | dexcom-pumps-and-pens; tandem-canada | Partly | Dexcom names G7 with t:slim X2, but puts an asterisk on that line: "* Not all connections are available in Canada." Tandem says only "Dexcom CGM sold separately" and names no model. The "twoMakers" basis overstates what the pages say. |
| 4.figure G6 ↔ t:slim X2 ("Both makers say so") | dexcom-pumps-and-pens; tandem-canada | **Not confirmed** | Dexcom's page names only G7 for t:slim X2, and Tandem names no Dexcom model. Remove the pairing or hold it (also in 13.figure). |
| 4.figure G7/G6 ↔ Omnipod 5 | dexcom-pumps-and-pens; omnipod-canada | Confirmed | Insulet says "Compatible with the Dexcom G6 and Dexcom G7 Sensors… The Dexcom receiver is not compatible." Dexcom's footnote says Omnipod 5 is "only available in Ontario and Nova Scotia". See pre-publish check 4. |
| 4.figure G6 ↔ mylife Loop | dexcom-pumps-and-pens; ypsomed-mylife-loop | Confirmed | None |
| 4.figure G6→G7 notice: "people using G6 are being moved to G7" | dexcom-canada | Partly | Dexcom says "Dexcom G6 users: Now is the time to transition to Dexcom G7". Ypsomed adds that Dexcom "will phase out the Dexcom G6… in phases. For now, your Dexcom G6 remains fully supported, no action is needed." That makes it two makers. Suggested wording: "Dexcom is phasing out G6 and asking G6 users to move to G7. Check with your team before you switch." |
| 4.figure Libre 3 Plus: up to 15 days, from age 2 | abbott-freestyle-libre-3 (+ abbott-freestyle-canada) | Confirmed | The pages say "up to 15 days" and "people aged 2 years and older". |
| 4.figure Libre 3 Plus ↔ mylife Loop (one maker) | ypsomed-mylife-loop | Confirmed (maker only) | Ypsomed says "Dexcom G6, CGM, or FreeStyle Libre 3 Plus sensor". |
| 4.figure Libre 3 Plus recall notice | abbott-freestyle-canada | Confirmed (2026-10-05) | Abbott's notice reads "Urgent Notice: An Urgent Medical Device Recall has been initiated for a subset of FreeStyle Libre 3 Plus sensors that were distributed in Canada." Add where to check: Abbott's notice page, or Health Canada Recalls and Safety Alerts, which is non-industry. Re-check on publish day. |
| 4.figure Libre 3 Plus ✗ Omnipod 5 | owner ruling | Consistent | The Omnipod en-ca page mixes in non-Canadian blocks (a UK 0800 number, Libre 2 Plus), which supports the owner's ruling. |
| 4.figure Guardian 4 for 780G ("maker and government") | minimed-canada; isc-nihb-updates | Partly | NIHB is confirmed (Dec 2024): "Guardian Link 4 Transmitter Kits for the 780G… and Guardian Sensor 4 are covered for clients 19 years or younger on intensive insulin with type 1 diabetes." MiniMed's home page no longer names Guardian 4 (it says only "Compared to previous Guardian sensors"). It now headlines "Simplera Sync sensor now licensed by Health Canada", and no "available later this year" text was found. Re-check the locator and pre-publish check 7. |
| 4.note: makers update compatibility | dexcom-pumps-and-pens | Confirmed | Dexcom itself says "Not all connections are available in Canada". |
| 5.items.1: definition of time in range | dc-checking-blood-sugar | Confirmed | None |
| 5.items.2: >70% in 3.9–10.0 for most people | dc-cpg-ch9-monitoring-2021; bt1d-time-in-range | Confirmed | The CPG table says ">70%… 3.9-10.0 mmol/L… for most individuals". Breakthrough says "At least 70%". |
| 5.items.3: <4% below 3.9 | same | Confirmed | None |
| 5.items.4: 60%→65% is about an hour a day | bt1d-time-in-range | Confirmed | Breakthrough says "going from 60% to 65% – is meaningful, as that translates to one more hour per day spent in-range". |
| 5.items.5: different in pregnancy, children, older adults, frequent lows | CPG Ch9; bt1d; dc-checking | Confirmed | The CPG table excludes "pregnancy, children/adolescents, and older/high-risk groups". |
| 5.items.6: share readings with your team | dc-technology-and-devices | Confirmed | None |
| 5.items.7: bigger gap when eating or exercising; finger check | dc-technology-and-devices | Confirmed | Optional: add DC's "slower to show actual blood sugar levels by up to 15 minutes". |
| 5.note: some DC pages use 4.0–10.0 | dc-checking-blood-sugar | Confirmed | The DC page gives TIR as "4.0 – 10.0", "70% or more". Its below-range row reads "3.9 mmol/L or below", <4%. |
| 6.items.2: NIHB Libre 3, prior approval, 14 per 6 months | isc-nihb-updates | Partly | The numbers are right. The limit applies to "clients managing diabetes with insulin". The product is **Libre 3**, but the presets and picker show **Libre 3 Plus**, so a reader may assume NIHB covers 3 Plus. Say "FreeStyle Libre 3 (the version NIHB lists)", or drop the brand. Spell out "Non-Insured Health Benefits (NIHB)" here, since this is its first use. |
| 6.figure presets: G7 10, Libre 3 Plus 15 | dexcom-g7-wear-time; abbott-freestyle-libre-3 | Confirmed (both are "up to") | None |
| 7.items.1: pen preloaded; new tip each injection | dc-technology-and-devices; dc-getting-started | Confirmed | None |
| 7.items.2: one pen per insulin type | same | Confirmed | None |
| 7.items.3: 4, 5 or 6 mm to avoid muscle | dq-all-about-injections | Confirmed | DQ puts this under "Avoiding pain". DC Getting Started also says "Try to use shorter needles with a smaller thickness". That is a DC (non-FIT) line to cite as well, which eases R18. |
| 7.items.4: 4 mm may need no lift; ≥8 mm use a lift | dq-all-about-injections | Partly | DQ frames this "In adults…". Start the item with "For adults,", because children's guidance differs. |
| 7.items.5: 90°; 8 or 12 mm lift or 45° | dc-getting-started-with-insulin | Confirmed | None |
| 7.items.6: little fat, lift even with 5–6 mm | dq-all-about-injections | Confirmed | DQ says "might be justified". "May be needed" is fine. |
| 8.items.1: syringes smaller, thinner, cheaper | dc-technology-and-devices; dc-getting-started | Confirmed | None |
| 8.items.2: U-100, U-200, U-700 on DC's list | dc-getting-started-with-insulin | Confirmed | The list has Humalog U-200, Tresiba U-100/U-200 and Awiqli U-700. Toujeo is listed without its strength (U-300). |
| 8.items.3: pump users keep syringes or pens as backup | dc-technology-and-devices | Partly | DC says "**Rapid-acting insulin** pens or syringes". Say so. |
| 8.items.4: CATSA needle guard; medication with you | catsa-diabetic-supplies | Confirmed | Spell out "Canadian Air Transport Security Authority (CATSA)" on first use. |
| 9.s1.1–s1.5 | dc-getting-started; dq | Confirmed | None |
| 9.s2.1–s2.6 | dc-getting-started-with-insulin | Confirmed | None |
| 9.note: pen instruction book | dc-getting-started-with-insulin | Confirmed | None |
| 10.items.1: rotate; fatty lumps | dc-getting-started-with-insulin | Confirmed | None |
| 10.items.2: belly fastest; 5 cm / 2 in / three fingers | dc-getting-started-with-insulin | Confirmed | DC says "absorbs fast and evenly", and says the arm is "next fastest" after the belly. DQ says 2–3 cm, as R20 notes. |
| 10.items.3: buttocks and thighs slower; back of the arm hard to reach | dc-getting-started; dq | Confirmed | DC says "outer arm" and DQ says "back of the upper arm". Either is fine. |
| 10.items.4: 1–2 cm apart; four zones, a week each | dq-all-about-injections | Partly | DQ says "**at least** 1 to 2 cm… and not using the same site for a month". Add "at least". |
| 10.items.5–7 | dq-all-about-injections | Confirmed | None |
| 10.figure | dq; dc-getting-started | Confirmed | The caption should say "at least a finger width". |
| 11.items.1: unopened 2–8 °C | dq-all-about-injections | Confirmed | None |
| 11.items.2: in use at room temperature | dc-getting-started; dq | Confirmed | None |
| 11.items.3: frozen, >30 °C, expired | dc-getting-started-with-insulin | Confirmed | None |
| 11.items.4: opened life depends on product | dc-getting-started-with-insulin | Confirmed | DC also says "up to 30 days" and DQ says 28 days (42 for detemir). R5 ("follow your leaflet") stands. |
| 11.items.5: check expiry | dq-all-about-injections | Confirmed | None |
| 11.items.6: carry-on, never checked | dc-air-travel | Confirmed | The page says "Do not place insulin in your checked luggage as the temperature fluctuations can damage it." |
| 11.items.7: insulin, juice and gels over 100 mL; declare separately | catsa-diabetic-supplies | Confirmed | CATSA: "Any liquids, juice or gels must be declared to the Screening Officer separately." |
| 12.items.1–3 | dc-technology-and-devices; Ch41 | Confirmed | None |
| 12.items.4: AID preferred for type 1, for those willing and able | dc-cpg-ch41-t1d-lifespan-2025 | Confirmed | It is quoted verbatim twice in Ch41. |
| 12.items.5: the team decides on a pump and its settings | dc-technology-and-devices | Confirmed | None |
| 13.items.1: infusion sets and reservoirs among the extras | dc-technology-and-devices | Confirmed | None |
| 13.items.2: "Each maker's Canadian site says which sensors work with its pump" | maker pages | Partly | Tandem names no model, and MiniMed's page no longer names Guardian 4. Change to: "Makers' Canadian sites list some of the sensors that work with their pumps…" |
| 13.figure 780G: extended-wear sets | minimed-canada | Confirmed, but a qualifier is missing | MiniMed: "Extended infusion set… designed for twice the wear. **Use exclusively with the Extended reservoir.**" Add that this is a fit rule, which is exactly what this picker is for. |
| 13.figure t:slim X2: Control-IQ+ from age 2; 4-year warranty | tandem-canada; tandem-support | Confirmed | Tandem says "Four-Year **Limited** Warranty" and "You may have an additional year… depending on your provincial funding program". Say "limited". |
| 13.figure YpsoPump: 160-unit cartridge; set changes; CamAPS FX; training | ypsomed-mylife-loop | Confirmed except training: Partly | The cartridge is "1.6 ml (160 U) 100 U/ml, rapid-acting insulin analogue". On training, the page says complete the in-app training, which "will take you about 60 minutes". Reword: "The maker asks you to finish the app's training first. It takes about {minutes} minutes." |
| 13.figure Omnipod 5 / DASH: up to 72 h | omnipod-canada | Confirmed | The page says "up to three days (72 hours)". |
| 14.items.1–2 | dc-technology-and-devices | Confirmed | None |
| 14.items.3: switch to injections; written settings | dc-managing-emergency-situations | Confirmed | The emergency kit holds "Your basal rates, insulin-to-carbohydrate ratio, insulin sensitivity factor…". |
| 14.items.4: infusion sets and sensor applicators in sharps; HPSA five provinces | hpsa-returning-medical-sharps | Partly | HPSA says "Continuous Glucose Monitors (CGM) applicators **with needles**". Add "with needles". |
| programsBand.cards.1 | dc-comparisons-by-province | Confirmed | It lists glucose monitoring devices, insulin pumps, SMBG strips, and needles, syringes and lancets. |
| programsBand.cards.2: NIHB sensors for insulin users; strips 800 per 100 days | isc-nihb-updates | Partly | Prior approval is stated only for Libre 3. Libre 2, G6/G7 and Guardian Connect "continue" to be covered, with no criteria given on the page. The 800/100 limit is for "clients managing diabetes with insulin". Suggested: "…covers some sensors for people who manage their diabetes with insulin (some need prior approval), and up to 800 test strips every 100 days for people who use insulin." Change the heading to "First Nations and Inuit (NIHB)", or add "eligible". |
| programsBand.cards.3: T1 meets the life-sustaining therapy test; T2201 or online | cra-dtc-life-sustaining-therapy; cra-rc4064-2025 | Confirmed | Optional: "your medical practitioner fills in Part B". |
| pharmacist.body | owner | Not checkable | See scope 4. |

## B) Safety, scope and labelling

**Safety**

1. **Card 8, U-200/U-300/U-700 (R17, urgent).** The interim note is too soft for a card that lists concentrated insulins next to syringes. A Health Canada–approved monograph does say it.
   - The Toujeo patient information reads: "Do not use a syringe to remove insulin from your pen. If you do you will get too much insulin." The PDF is saved at `src/yt/toujeo-pmi.pdf`. It is the Sanofi copy; the Drug Product Database (DPD) copy on pdf.hres.ca is the government-hosted version.
   - Recommend R17 option (a). Register the DPD monographs and release the line as "Never use a syringe to take insulin out of a pen."
   - Until then, strengthen the interim note: "Some insulins in pens are stronger than U-100. Don't draw insulin out of a pen with a syringe. Ask your pharmacist first."
2. **4.items.1, "so you don't need finger pricks".** It contradicts 1.items.5 and 5.items.7 and could lead someone to drop their backup meter. Reword as in table A.
3. **G7 "can't be restarted" is unsourced, and G6 ↔ t:slim X2 is not confirmed.** These are compatibility errors that could lead to a wrong purchase or setup. Fix them before release (see table A).
4. **Card 14 note.** "For a high you can't explain on a pump, see Staying Safe" is plain text.
   - On a pump, an unexplained high can turn into DKA (diabetic ketoacidosis) within hours.
   - Make it a link to Staying Safe card 9 (`staying-safe#card-9`), and name the action: "If your sugar is high and you can't explain it, check for ketones and follow Staying Safe."
   - The meta comment says it links, but no link field is defined.
5. **5.items.7 (optional).** Add "Don't delay treating a low to find your meter," linked to Staying Safe card 2. It is already sourced there.
6. **The urgent exit is wired correctly.** `urgentExit: { chapter: 'staying-safe' }` resolves to `staying-safe#red-flags` (site.ts `redFlags`). No card carries an exit-carrying figure (`lanes`), so the chapter-level signpost renders. The link text "Get emergency care now" matches Staying Safe's `urgent.heading`. Nothing in the chapter delays emergency care.
7. **The Libre 3 Plus recall notice.** Keep it neutral, as planned, but add where to check (Abbott's notice, or Health Canada Recalls and Safety Alerts). Re-check on publish day.

**Scope**

1. There is no dosing, titration or drug-class advice. "Dial the dose your team has set" names no number, and the priming amount (2–3 units) is correctly left out.
2. 12.items.4 (Ch41's AID preference) is a guideline's device preference, set against "your team decides". I accept it (R21).
3. **Brand names outside the three pickers break the draft's own rule.**
   - 6.items.2 names "Libre 3".
   - 6.figure.graceNote names "Dexcom G7". The restock calculator is not one of the three pickers.
   - Either drop them, or widen the rule to cover the calculator and band facts that come from government sources.
4. **pharmacist.body says "for all of Canada".** The owner should confirm the CDE service is set up for every province, since pharmacists are licensed by province. The wording otherwise matches Staying Safe.
5. No product placements, shop links or Subscribe & save links appear. The pickers show compatibility facts only.

**Canadian accuracy and terminology**

1. Spell out on first use: HPSA, CATSA, NIHB (6.items.2 comes before the band) and CDE. Write "Prince Edward Island", not "PEI".
2. Make NIHB eligibility explicit ("eligible First Nations and Inuit").
3. **R22 (sharps outside the HPSA provinces).** I recommend adding "Elsewhere, ask your pharmacy how to return sharps". No source covers BC, AB, SK, NS, NL or the territories.
4. **Two locators are wrong.**
   - `dc-getting-started-with-insulin` locator: "6 mm at 90°" is not on the page (pre-publish check 2 is confirmed).
   - `dexcom-g7-wear-time` locator: "no restarts" is not on the page.

**"International guidance" labelling**

- Every source cited in this chapter is Canadian or industry. None is in the register's International section.
- No card needs the "International guidance" label, and none carries one. That is correct.
- CPG Ch9's TIR table adopts the International Consensus, but it is cited through the Canadian CPG.
- FIT is cited nowhere.

**Diabetes Express**

- It is not named or linked anywhere in the meta or the messages. The only mention is the draft's ground-rule note.
