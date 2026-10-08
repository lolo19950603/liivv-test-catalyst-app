# Diabetes Care: open questions for the owner

Consolidated 2026-10-05 from the nine content files: staying-safe (SS), new-to-the-journey (NTJ), your-tools (YT), every-day-living (EDL), know-your-type (KYT), this-might-be-you (TMBY), landing (LAND), funding (FUND) and paths (PATHS). Where the same question appears in several files it is listed once, with every place it applies. The ruling numbers in brackets (R1, D4, K7, M10 and so on) are the numbers used in each file.

**How to read each item**
- **Question**: what needs deciding.
- **Options**: the one marked **(default)** is what the copy says today.
- **Applies to**: file and card or key.
- **Facts**: the source facts that bear on it, in short.

**Priority**
- **BLOCKING**: the page or card should not go live until this is settled. Used for safety lines (what to do in an emergency or urgent situation, or where an error could cause harm), the Indigenous partner review, whether the pharmacist-review notice is true, privacy sign-off, and launch blockers named in the files.
- **IMPORTANT**: needs your ruling before final sign-off. The current default is safe to publish meanwhile.
- **NICE TO HAVE**: editorial or presentation choices.

**Two numbering clashes to know about**
- "R16" means two different things. In SS and EDL it is glucagon and alcohol (item C2). In YT it is the maker-only picker facts (item B8).
- EDL calls in-use insulin "R4". Everywhere else that is R5, and R4 is the sick-day medicine list.

**2026-10-06, the owner’s answers:** A1–A9 and B1–B36 were answered by the owner on 2026-10-06, and each item says so, with the owner’s words and what was built. B4, B8, B19, B30 and B35 stay open, and so do the parts of B6, B13 and B15 that each item names. A5, A6, B7, B13, B20, B22 and B25 are finished in the funding step. B37–B45 and C46 were added on 2026-10-06 after the second full-site review; C46 is answered (protective reading of C4) and B37–B45 are open.

**Counts:** 100 items in total (46 clinical, 45 business and operations, 9 answered). 22 are blocking: 13 clinical and 9 business. (C41 added 2026-10-05, after the review of the three built chapters. C42–C45 and B31–B36 added 2026-10-06, after the full-site review; that review also added evidence to C5, C6, C10, C41, B6, B13, B17, B24 and B26.)

---

## Part 1. Clinical rulings (you, as the nurse)

### BLOCKING

**C1. What number defines a low: below 3.9 or below 4.0 mmol/L?**
- **ANSWERED 2026-10-06** ([ruling C1](clinical-rulings-2026-10-06.md#c1)). Below 3.9 mmol/L everywhere (card 1, adult and child re-treat, the NTJ ruler, the time-in-range floor); 4.0 only on the driving card, with its visible note. Built: no wording change. Diabète Québec’s 2025 leaflet is registered (`dq-low-blood-sugar-leaflet-2025`, EN and FR read) and added to SS card 1, so French readers have a French source for 3.9; the `sources-review.ts` notes on Ch14 2023, the 02/24 sheet and the Drive Safe card are closed; SS R1, NTJ R1, YT R1 and R19, EDL R1 and D1 and TMBY R1 are taken out of the review pack’s open rulings.
- Options:
  - **(default)** Below 3.9 across the site. The time-in-range floor is also 3.9, labelled "(guideline)". The driving card alone uses 4.0, with a visible note that most guidance uses 3.9. The children's view uses 3.9 for the re-treat step.
  - Below 4.0 everywhere.
  - 3.9 everywhere, including the driving card.
- Applies to:
  - SS R1: 1.items.1–2 and 5, 2.items.3, 2.figure.steps.4, programsBand.cards.1, and the child steps (F.2 #44).
  - NTJ R1: 3.figure.ruler zones and 3.items.4.
  - YT R19: 5.items.2–3 and 5.note (time in range).
  - EDL R1 and D1: 7.items.3 and 7.note (driving).
  - TMBY R1, indirectly through cards 2 and 3.
  - KYT K16, through links only.
- Facts:
  - 3.9 is used by CPG Ch14 (2023), DC's 02/24 hypoglycemia sheet, CPG Ch9 and Breakthrough T1D for time in range.
  - 4.0 is used by the Drive Safe card, CPG Ch21 (driving), Diabetes@School and Breakthrough's low page.
  - DC's patient page "Checking Blood Sugar" gives time in range as 4.0–10.0.
  - No Canadian driving source uses 3.9.
  - One ruling should set the ruler, SS card 1 and the driving card together.

**C2. Glucagon and alcohol: should the site repeat the 2018 line "glucagon won't work while alcohol is in your body"?**
- **ANSWERED 2026-10-06** ([ruling C2](clinical-rulings-2026-10-06.md#c2)). Restored in CPG Ch14 2023’s wording, never the 2018 sheet’s "will not work". Built: SS `4.items.5` now reads "Make sure someone with you knows to call 911 if you pass out, and to give you glucagon if you have it. Diabetes Canada’s guideline says glucagon may not work as well if you’ve had more than 2 standard drinks in the past few hours, so the 911 call matters even more" (EN and FR); `dc-cpg-ch14-hypoglycemia-2023` added to SS card 4; card 4 stays unpinned (preparation, C25). EDL `4.items.3` keeps its pointer; EDL D15 and SS D.2 R16 are closed. `sources-review.ts` records that the 04/18 sheet’s line is superseded.
- Options:
  - **(default, interim)** Leave it out. Keep only "make sure someone with you knows to call 911 if you pass out".
  - Restore it with newer wording, such as "may not work as well: call 911 and give it anyway". This needs a registered source.
- Applies to: SS D.2 R16 (4.items.5, removed in EN and FR on 2026-10-05) and EDL D15 (4.items.3).
- Facts:
  - The line comes from DC's 2018 "Alcohol and diabetes" sheet.
  - The chapter 04 CDE check calls it outdated. It also conflicts with the red-flag instruction to give glucagon if you have it.
  - EDL's D15 note still says the repo carries the line. That is out of date: it is no longer in `core/messages/en.json`.

**C3. Chest pain or breathlessness while exercising: what is the next step?** (default changed 2026-10-05: H2 released on a registered source; still open for you to confirm the wording)
- **ANSWERED 2026-10-06** ([ruling C3](clinical-rulings-2026-10-06.md#c3)). Keep "stop" and the Heart and Stroke 911 line; narrow breathlessness to "much more short of breath than usual"; add "tell your doctor too, before you exercise again", after the 911 instruction. Built: EDL `3.items.6` rewritten (EN and FR); EDL card 3 stays pinned. EDL D4 and H2 closed. Left as the default (choice still yours): Heart and Stroke’s other signs (upper-body discomfort, sweating, nausea, light-headedness) are not named.
- Options:
  - **(default, since 2026-10-05)** "Stop the activity", then the Heart and Stroke Foundation's signs and 911: "If you're short of breath or have chest pain, stop the activity. Chest pain, pressure or discomfort, and shortness of breath can be signs of a heart attack. If you have any of these signs, call 911 right away" (FR: "… arrêtez l'activité. Une douleur, une pression ou un inconfort à la poitrine, et l'essoufflement, peuvent être des signes d'une crise cardiaque. Si vous avez l'un de ces signes, appelez le 911 immédiatement"). The card is now pinned open (`urgentContent`), like every card with a 911 line.
  - The CDE check's wording: "If chest pain or pressure, or shortness of breath, doesn't ease quickly with rest, call 911. Once it has eased, tell your doctor". Its "doesn't ease with rest" condition is not on the Heart and Stroke page, so it rests on your ruling.
  - Restore the source's "and speak to your doctor" after the 911 line, for chest pain that has eased.
  - "Stop the activity" only (the default until 2026-10-05).
- Applies to: EDL D4 and H2 (3.items.6). The same source covers the heart-attack half of H1 on card 11; the stroke signs still have no registered source, so H1 stays held.
- Facts:
  - DC Exercise says only "stop… and speak to your doctor". As the only next step, that could delay emergency care (verify S1, high).
  - Registered 2026-10-05: `hsf-heart-attack-signs`, Heart and Stroke Foundation, "Signs of a heart attack" (heartandstroke.ca/heart-disease/emergency-signs; French page coeuretavc.ca/maladies-du-coeur/signes-d-urgence). It lists chest discomfort (pressure, squeezing, fullness or pain, burning or heaviness), sweating, upper body discomfort, nausea, shortness of breath and light-headedness, and says "If you experience any of these signs, call 9-1-1 or your local emergency number immediately", then "Stop all activity". Its ASA and nitroglycerin steps are dosing and are not used.
  - Shortness of breath is also an ordinary part of hard exercise; the page does not separate the two. That is the main thing to rule on.
  - EDL card 3 cannot be signed off until you confirm or change the wording.

**C4. The ketone ladder is written for type 1. Who sees it, and how strong is the top rung?**
- **ANSWERED 2026-10-06** ([ruling C4](clinical-rulings-2026-10-06.md#c4)). Ladder shown to everyone, labelled "written for type 1". Built: blood "Over 3.0" and urine "Large" now say "Medical emergency. Get emergency care now"; blood 1.5–3.0 and urine "Moderate" add "If you can’t reach them, go to the emergency department"; card 7’s note adds "With any type, Diabetes Canada says high ketones need medical care right away." (EN and FR). `dc-stay-safe-sick-days-sheet` added to the ladder’s figure sources; the `bt1d-dka-and-ketones` note is ruled. SS R3 (and NTJ, YT, EDL and TMBY R3) closed.
- Options:
  - **(default)** Show it to everyone, labelled "ranges written for type 1 diabetes". Rung 4 and urine "large" say "Get emergency care now", which is stronger than the source. Rung 2 calls the team only when sick.
  - Show it to type 1 readers only. Everyone else gets DC Hyperglycemia's "seek care right away for high ketones".
  - Soften rung 4 to the source's "call your team immediately and possibly go to the emergency room".
- Applies to:
  - SS R3: card 7 (figure and note), urgent.signs.3, 11.items.2–4 and programsBand.cards.2–4.
  - NTJ R3: 10.items.6 and 10.note (ketone strips only).
  - YT card 14, KYT and TMBY card 2.4 (links only).
- Facts:
  - The source is Breakthrough T1D's DKA and ketones page, which Abbott funds (noted in the register).
  - DC's sick-day sheet asks other types to check ketones only if their team has told them to.

**C5. A blood ketone reading of exactly 1.5 sits on two rungs. Which applies?**
- **ANSWERED 2026-10-06** ([ruling C5](clinical-rulings-2026-10-06.md#c5)). Exactly 1.5 goes on the higher rung. Built: rung 2 reads "0.6 to under 1.5" (meta `{ from: 0.6, below: 1.5 }`), and card 11 item 4 and band card 2 match; the ladder is credited "adapted from Breakthrough T1D" in its label and the card note (EN and FR). Figure sources now `bt1d-dka-and-ketones`, `dc-cpg-ch10-physical-activity` (and the sick-day sheet, C4). The review export prints the rung as "0.6 to under 1.5". SS R15 closed.
- Options:
  - **(default)** Keep the source's numbers, 0.6–1.5 and 1.5–3.0, unchanged.
  - Change them to "0.6 to under 1.5" and "1.5 to 3.0", matching CPG Ch10's "≥1.5" already used in 7.items.4.
  - Add "At exactly 1.5, follow the higher rung".
- Applies to: SS R15 (7.figure.blood.rungs.2–3, 11.items.3–4, 11.figure.lanes.3–4, programsBand.cards.2–3).
- Facts: Breakthrough publishes overlapping ranges. Either change departs from the page's wording, so it needs your sign-off.
- Raised again by the full-site review of 2026-10-06 (browser QA S2, "borders on safety"; clinical review ruling C):
  - A reading of exactly 1.5 sits on rung 2 ("Keep checking. If you're sick, call your diabetes team") and rung 3 ("Risk of DKA. Call your team now"). The same card's 7.items.4 already uses CPG Ch10's "1.5 or higher". 3.0 is not double-counted: rung 4 reads "Over 3.0", so 3.0 is only on rung 3.
  - The CDE reviewer recommends the third option, "At exactly 1.5, follow the higher rung", as it matches "1.5 or higher". The QA reviewer suggested the second ("0.6 to under 1.5").
  - Also noticed: urine "Small" ("Call your diabetes team") shares a colour with blood rung 2, whose action is "Keep checking. If you're sick, call your diabetes team". Same tier, different words: keep both as Breakthrough prints them, or align them?
  - Not changed in code: the ranges are the source's own, so any change is your ruling.

**C6. Red-flag routing: vomiting with no fluids kept down, and the DKA signs.**
- **ANSWERED 2026-10-06** ([ruling C6](clinical-rulings-2026-10-06.md#c6)). Vomiting with no fluids kept down stays a red flag (ED, and the team too if reachable now); "trouble breathing needs emergency care now" stays. Built: red flag 4 rewritten: "Has deep or hard breathing or fruity-smelling breath, or is very sleepy or confused with a high blood sugar or ketones. In pregnancy, or with some diabetes medicines, DKA can happen even when blood sugar is near normal" (EN and FR). SS R7 and R14 closed. The 2-or-more-in-4-hours line (C17) went on the team-or-ED list, not the red flags.
- Options:
  - **(default)** Vomiting with no fluids kept down is a red flag. It routes to the emergency department, and to the team as well if they can be reached right away. The DKA-signs flag reads "deep or hard breathing, fruity breath, or very sleepy or confused, with a high blood sugar". Trouble breathing goes to emergency care now.
  - Drop vomiting from the red flags and use the sheet's "team and/or ED" wording everywhere.
  - Drop the "with a high blood sugar" qualifier, so any of these signs means emergency care.
  - Keep "trouble breathing" on the sheet's team-or-ED line.
- Applies to: SS R7 and R14 (urgent.signs.2 and 4, 8.s4.1 and 8.s4.3, 11.items.2, programsBand.cards.4).
- Facts:
  - DC's sick-day sheet says team "and/or" ED.
  - The qualifier is ours. It stops confusion from a low being sent to the DKA line.
  - The reviewer's own card 8 wording was "or call your team". The copy uses "and" so no one waits on a callback.
  - Full-site review of 2026-10-06 (clinical, ruling A): the qualifier "with a high blood sugar" conflicts with the site's own lines that DKA can happen with near-normal sugar in pregnancy (SS card 6, TMBY card 1) and with some medicines. The CDE recommends: "…with a high blood sugar or with ketones. In pregnancy or with some diabetes medicines, DKA can happen even when blood sugar is near normal." Readings: keep the qualifier (stops a low being sent to the DKA line) or widen it as recommended (catches euglycemic DKA). Sources: `dc-cpg-ch15-hyperglycemic-emergencies`, `dc-cpg-ch36-pregnancy` (both registered). Not changed in code.

**C7. Should the site say "Never draw U-200 or U-300 insulin from a pen into a syringe"?** (URGENT in YT)
- **ANSWERED 2026-10-06** ([ruling C7](clinical-rulings-2026-10-06.md#c7)). Option (a). Registered after reading each file on 2026-10-06: the Health Canada DPD monographs `hc-dpd-pm-toujeo`, `hc-dpd-pm-humalog`, `hc-dpd-pm-tresiba`, `hc-dpd-pm-entuzity` and `hc-dpd-pm-awiqli` (EN, and FR where DPD has one; Lyumjev left out, not marketed), Health Canada’s archived 2015 alert `hc-alert-humalog-200-2015`, and ISMP Canada’s bulletin `ismpc-dose-confusion-2019`. Built: YT `8.items.2` (most insulin is U-100; U-200, U-300, U-500 or U-700 each come in their own pen), new `8.items.5` ("If your insulin is stronger than U-100 (the label says 200, 300, 500 or 700 units/mL), never use a syringe to take it out of the pen…") and `8.note` ("Always carry a spare pen and needles…ask your pharmacist what to do before you use a syringe"), always visible, EN and FR. Brand names stay in the register. YT R17 resolved and its held row removed; the line no longer depends on FIT (C14).
- Options:
  - **(default, interim)** Hold the line. Show an always-visible ask-first note: "Some insulins are stronger than U-100. Don't use a syringe with insulin from a pen until you've asked your pharmacist."
  - (a) Register the Health Canada DPD product monographs for each concentrated pen insulin (Toujeo U-300, Humalog U-200, Tresiba U-200, Awiqli U-700), then release the line scoped to what they say. The check recommends this.
  - (b) Accept FIT for this one line, with the disclosure that FIT is run by embecta.
  - (c) Keep the interim note.
- Applies to: YT R17 (8.note, E). NTJ R9 and NTJ E (injection technique deferred to YT).
- Facts:
  - Among non-industry sources only FIT says it, and FIT is industry-run (C14).
  - DC Getting Started, DC Technology & Devices, Diabète Québec and CPG Ch41 were searched, and none says it.
  - The Toujeo patient information, approved by Health Canada, says "Do not use a syringe to remove insulin from your pen". No monograph is registered.

**C8. Children's Rule of 15 amounts, and the line for automated insulin delivery.**
- **ANSWERED 2026-10-06** ([ruling C8](clinical-rulings-2026-10-06.md#c8)). Keep the CPG Ch41 Table 3 rows, the type 1 label and the always-visible automated-delivery line. Built: the child note’s last sentence is now "If your child has another type of diabetes, or uses an automated system, ask their team how much to give." (EN and FR). No change to the table, `aidNote`, child steps or band card 1. SS R8 and R12 (and TMBY R8) closed. Left as the default: the longer sentence (a shorter one was optional).
- Options:
  - **(default)** Show the CPG Ch41 table: under 5 years 5 g, 5–10 years 10 g, over 10 years 15 g. It is labelled as being for type 1 on injections or a pump that doesn't adjust on its own. An always-visible line says people of any age on an automated system "may treat a low they can manage themselves with less, 5 to 10 g". The child view swaps each 15 g line for "the amount in the table".
  - Show the table to type 1 families only.
  - Add "for other types, ask your child's team".
  - Drop the adult automated-system line and say only "if you use an automated system, ask your team how much to take".
- Applies to:
  - SS R8 and R12: 2.figure.childRows, childNote, aidNote, child steps and items, and programsBand.cards.1.
  - TMBY card 2.2, by reference.
- Facts: CPG Ch41 is a type 1 chapter. Applying it to other types is our extrapolation.

**C9. Driving after a low or a severe low.**
- **ANSWERED 2026-10-06** ([ruling C9](clinical-rulings-2026-10-06.md#c9)). Keep 40 minutes and 5.0 after a low; after a severe low while driving, stop and tell the provider and the licensing office right away. Built: EDL `7.items.8` adds "(12 months for commercial drivers)"; `7.items.9` adds Diabetes Canada’s higher medical fitness for commercial driving and the guideline’s medical exam on applying (EN and FR). SS `2.note` is C44’s. EDL D2 and D3 closed; provincial reporting rules stay held (H11).
- Options:
  - **(default)** After a low: "wait at least 40 minutes, and until your blood sugar is at least 5.0" (CPG Ch21). After a severe low while driving: stop driving right away, tell your provider and the licensing office right away, and "your provider may tell you not to drive". The same applies after more than one severe low while awake in the past 6 months. Commercial driving is covered only as "assessed as an individual".
  - After a low, use the patient sheet and Drive Safe card instead: "above 5" and "might need up to 40 minutes".
  - After a severe low, use Ch21's recommendation timing: tell the provider "as soon as possible (no longer than 72 hours)", with no mention of the licensing office.
  - Drop the licensing office and say "your provider will advise you".
  - Add DC's line on higher medical standards for commercial drivers.
- Applies to: SS R6 (2.note), EDL D2 (7.items.8) and EDL D3 (7.items.9, H12).
- Facts:
  - "While awake" means "while awake but not driving". The 6 months is for private drivers; commercial drivers have 12.
  - This line affects people's licences, so it needs a clinical call.
  - No provincial licensing pages are verified (EDL H11).

**C10. Should a red, hot, swollen foot and sudden vision changes have a same-day or emergency tier?**
- **ANSWERED 2026-10-06** ([ruling C10](clinical-rulings-2026-10-06.md#c10)). Both tiers added. Registered after reading on 2026-10-06: `wounds-canada-foot-emergency` (Wounds Canada, "Diabetic Foot Complications: When is it an Emergency?", EN PDF and the French token-link PDF) and `cnib-floaters-and-flashing-lights` (CNIB, © Canadian Ophthalmological Society; its French link now 301-redirects to inca.ca, so `hrefFr` is the inca.ca address). Built: EDL `8.items.7` ("need care right away", then the don’t-wait tier: see your doctor right away or go to the emergency department; a serious foot infection doesn’t always cause a fever) and `9.items.6` (sudden flashes with many new floaters, or part of your vision going dark: see an eye doctor right away, or the emergency department if you can’t be seen today), EN and FR. Cards 8 and 9 stay pinned. H3 and H4 released; D16 and D17 closed. Re-check the French Wounds Canada token link before publishing.
- Options:
  - **(default)** No such tier. Feet use the sheet's "right away" list plus Ch32's ulcer and infection line. Eyes use CNIB's list: dark spots; blurred, distorted or double vision; large floaters.
  - Add a foot line: "red, hot and swollen with a fever or feeling unwell: get care today" (EDL H3).
  - Add an eye line: "sudden loss of sight, a curtain or shadow, or a sudden shower of floaters: emergency eye care the same day" (EDL H4).
- Applies to: EDL D16 (8.items.7) and EDL D17 (9.items.6).
- Facts:
  - The CDE check (S4, S5) asks you to consider both.
  - Neither line is in the registered sources (foot sheet, Ch32, CNIB, COS, Ch30). Your recorded ruling, or a newly registered page, would release them.
  - The full-site review of 2026-10-06 (clinical, ruling B) repeats the CDE's recommendation for both tiers: a red, hot, swollen foot with fever, and a sudden curtain or shower of floaters. Still no registered source; not changed in code.

**C11. A reader with symptoms of high blood sugar who is waiting for a second diagnostic test.**
- **ANSWERED 2026-10-06** ([ruling C11](clinical-rulings-2026-10-06.md#c11)). Built: KYT `2.items.8` now says "Contact your doctor or another health-care provider today, without waiting for a second test" (EN and FR); KYT card 2 is pinned open (`urgentContent`, C25) and cites `dc-hyperglycemia`. K24 closed.
- Options:
  - **(default)** "Contact your doctor without waiting", then a pointer to Staying Safe. Card 2 is not pinned open.
  - Use the check's wording, "see your doctor the same day", which makes card 2 a pinned-open urgent card.
- Applies to: KYT K24 (2.items.8).
- Facts: CPG Ch3 says that with symptoms the diagnosis is made without a second test, and treatment should not be delayed.

**C12. Landing page: the link under the urgent door, and FAQ 3's 911 line.**
- **ANSWERED 2026-10-06** ([ruling C12](clinical-rulings-2026-10-06.md#c12)). Keep both: the urgent door’s secondary link stays on SS card 11 and FAQ 3’s 911 line stays word for word. Built: `dc-cpg-ch14-hypoglycemia-2023` added to FAQ 3’s sources (`landing-meta.ts`). LAND D11 and the second part of D13 are closed. **Still open here:** the CDE sentence in FAQ 3 and SS card 11 lane 6 goes to the business step (Bayshore Express Pharmacy’s general contact).
- Options:
  - **(default)** The secondary link goes to SS card 11 ("Who to call, and when"). FAQ 3 carries the new 911 line.
  - Link SS card 2 (Rule of 15) instead.
  - Change FAQ 3's wording.
- Applies to: LAND D11 and D13 (second part).
- Facts: the change to card 11 came from the source check (P8).

### IMPORTANT

**C13. How much juice is 15 g: ½ cup or ⅔ cup?**
- **ANSWERED 2026-10-06** ([ruling C13](clinical-rulings-2026-10-06.md#c13)). ⅔ cup (150 mL), from CPG Ch14 2023 Table 4. Built: SS `2.figure.options.2` is "⅔ cup (150 mL) of juice or regular pop" (FR "⅔ tasse (150 mL) de jus ou de boisson gazeuse ordinaire"); `dq-low-blood-sugar-leaflet-2025` registered and added to card 2 and its Rule of 15 figure; the Ch14 locator records Table 4. SS R2 (and the R2 carried to NTJ, YT, EDL and TMBY) closed.
- Options: **(default)** ½ cup (125 mL), or ⅔ cup (150 mL).
- Applies to: SS R2 (2.figure.options.2). NTJ, YT, EDL and TMBY don't repeat it; they link to the Rule of 15.
- Facts: DC's 02/24 hypoglycemia sheet says ½ cup. DC's own sick-day sheet, the Drive Safe card and the Alcohol PDF ("150 mL regular pop") use ⅔ cup.

**C14. Is the FIT injection guide an industry source? And may Diabète Québec's FIT-based lines stand?**
- **ANSWERED 2026-10-06** ([ruling C14](clinical-rulings-2026-10-06.md#c14)). FIT counts as industry-run: every FIT-only line stays held (SS card 9’s two lines, YT set-change timing, the lipohypertrophy dose line, "4 mm is safest"). Diabète Québec’s lines stay live beside Diabetes Canada’s. Built: no copy change; `dq-all-about-injections` gains its French address (the December 2025 « Tout sur l’injection » page) and an updated locator; Ch37 is not added to YT card 7 (reviewer evidence only). C7 no longer depends on FIT. SS, NTJ, YT, EDL and TMBY R9 and YT R18 closed.
- Options:
  - **(default)** FIT counts as industry-run, so no FIT line is live. The 4 mm and skin-lift lines rest on Diabète Québec, with DC's "shorter, thinner needles" alongside. YT 7.items.4 starts "For adults".
  - Treat FIT as a clinician consensus and release the held FIT lines with the disclosure "published on a website run by embecta, a company that makes pen needles and syringes".
  - Hold the DQ lines as FIT-derived, keeping only DC's "shorter, thinner" and its 90° / 8–12 mm lines.
- Applies to:
  - SS R9: card 9 (pump high with nausea; no set change at bedtime; the disclosure).
  - NTJ R9: card 8.
  - YT R9 and R18: 7.items.3, 4 and 6, 10.items.4–7, card 14 set timing, and the lipohypertrophy line.
  - TMBY R9: card 4 (4 mm, dexterity).
  - Also bears on C7.
- Facts:
  - fit4diabetes.com is © Embecta Corp.
  - DQ publishes the lines under its own name and has them reviewed by a nurse, but says they are "based on" FIT 2015.

**C15. How long is in-use insulin good for?**
- **ANSWERED 2026-10-06** ([ruling C15](clinical-rulings-2026-10-06.md#c15)). Keep "follow your leaflet", with a sourced ceiling. Built: YT `11.items.4` and SS `10.items.5` read "How long an opened pen or vial lasts depends on the product. Diabète Québec says most are good for up to 28 days once opened, and some for longer. Follow the leaflet that came with your insulin" (EN and FR), citing `dq-all-about-injections`. Diabetes Canada’s 30 days is not used (some labels say 28); the monographs’ in-use times are in the locators. NTJ `8.items.7–8` and EDL `6.items.7` unchanged. R5 closed in every chapter.
- Options: **(default)** "Follow your leaflet, or ask your pharmacist", with no number. Or 30 days (DC). Or 28 days (Diabète Québec; 42 for detemir).
- Applies to: SS R5 (10.items.5), NTJ R5 (8.items.7–8), YT R5 (11.items.4), and EDL "R4" (6.items.7, H6).
- Facts:
  - DC Getting Started and DC Air Travel say 30 days.
  - DQ says 28 days, and 42 for detemir.
  - The "throw out if frozen, over 30 °C or expired" line is sourced and live.

**C16. Should alcohol limits be stated, and does the 2018 "don't drink if" list stay?**
- **ANSWERED 2026-10-06** ([ruling C16](clinical-rulings-2026-10-06.md#c16)). The 2023 positions, each in its own body’s words; never 2 a week as a CCSA limit. Built (EN and FR): EDL `4.items.1` "Diabetes Canada’s 2023 guideline says that if you don’t drink, it’s healthier not to start. If you do drink, talk with your team about what’s right for you"; `4.items.2` keeps the 04/18 sheet’s don’t-drink list, attributed, and says the sheet is from 2018 so its printed limits are older than the 2023 advice; `4.items.5` states Ch18 2023 ("may mean no more than 2 standard drinks a week") and CCSA 2023 (2 or fewer a week, likely to avoid harm; more than 2 at one time raises harms; less is better). The 2018 comparison sentence and the sheet’s "no need to avoid alcohol" rule are gone; Ch18’s over-4-per-occasion line stays out. Ch11 is no longer cited on card 4. `ccsa-alcohol-guidance-2023` gains its current address and its French page (read 2026-10-06). EDL R10, D7 and H5 closed, and R10 in every other chapter.
- Options:
  - **(default)** No numbers. The card notes that the 2018 nutrition guideline is looser than Canada's 2023 guidance; that DC's 2023 guideline (Ch18) says cutting down lowers risk; that CCSA says less is better; and "if you don't drink, it's healthier not to start". The "don't drink if" list from the 04/18 sheet stays.
  - (b) State "2 standard drinks or fewer a week", backed by both CCSA 2023 and Ch18 2023. This releases H5.
  - (c) Drop the 2018 comparison and keep only the 2023 positions.
  - Drop the 04/18 list.
- Applies to: EDL R10, D7 and H5 (4.items.1, 2 and 5). SS R10 defers the decision to EDL.
- Facts:
  - Ch18 2023 says "a maximum of 2 standard drinks per week", which matches CCSA.
  - Ch11 (2018), the 04/18 sheet and the 2019 article give higher limits.
  - The 04/18 sheet reflects the 2018 guidelines. Its currency is a pre-publish check.

**C17. Sick-day medicines and insulin.**
- **ANSWERED 2026-10-06** ([ruling C17](clinical-rulings-2026-10-06.md#c17)). No class list (the pharmacist fills in the person’s list). Built (EN and FR): SS `6.items.4` names SGLT2 inhibitors as a question for the pharmacist; `8.sections.2.items.3` says Diabetes Canada’s "if you use insulin, keep taking it when you’re sick"; a new `8.sections.4.items.2` adds Diabetes Canada’s "If you’re sick and can’t eat, call your doctor or go to the emergency department if you vomit or have diarrhea 2 or more times in 4 hours" (the old items 2 and 3 are now 3 and 4). `dc-checking-blood-sugar` added to card 8, `dc-stay-safe-sick-days-sheet` to card 6. The held "keep taking your insulin" row is released; DC’s general "keep taking your diabetes medications" is not used. SS R4 and YT pre-publish check 8 closed.
- Options:
  - **(default)** No drug-class list on the page. Card 8 sends readers to their pharmacist, and the printable plan has a blank "medicines to pause" line.
  - (b) Restore the sheet's list (secretagogues; metformin, SGLT2 inhibitors, ACE inhibitors and ARBs, water pills, NSAIDs), with its note that combination pills aren't listed.
  - (c) Name SGLT2 inhibitors in card 6, as CPG Ch15 does.
- Also decide: add the two lines YT found on DC's live "Checking Blood Sugar" page? They are "If you use insulin, keep taking it when you are sick…" and "Call your doctor or go to the emergency room if you vomit or have diarrhea two or more times in 4 hours".
- Applies to: SS R4 (8.sections.3, 8.figure.fields.4, 6.items.4) and the SS E row "Keep taking your insulin when you're sick". YT pre-publish check 8.
- Facts: the DC Stay Safe sheet's list is verified. It is held for scope, not for want of a source. The new DC lines would release the held SS "keep taking your insulin" row and add a vomiting threshold, which needs to be squared with C6.

**C18. Honey for a child's low.**
- **ANSWERED 2026-10-06** ([ruling C18](clinical-rulings-2026-10-06.md#c18)). Honey stays hidden under "A child". Registered after reading on 2026-10-06: Health Canada’s `hc-infant-botulism` (EN and FR). Built (the default, a child-only note): new key `2.figure.childOptionsNote` ("Honey isn’t on the list for children. Health Canada says not to give any honey to babies under 1 year.", EN and FR) rendered under the 15 g list by `site-figures.tsx`, shown wherever the children’s table shows (the child view, and with JavaScript off); it sits inside the gated Rule of 15 figure, so it is off /fr until that gate is signed off. SS R13 closed and the held honey row removed.
- Options:
  - **(default)** Hide honey when "A child" is selected. The line "Not for babies under 1 year" is held.
  - Show honey for children with the warning, once you sign it off and a source such as Health Canada's infant botulism guidance is registered.
- Applies to: SS R13 (2.figure.options.3).

**C19. Targets and numbers that a reader could take as their own prescription.** One ruling per line:
- **ANSWERED 2026-10-06** ([ruling C19](clinical-rulings-2026-10-06.md#c19)). Keep the sourced targets with their qualifiers. Built (EN and FR): NTJ `3.items.2` adds "weighing it against the risk of lows"; TMBY `4.items.3` adds the end-of-life line ("…A1C tests are no longer recommended. The aim then is to avoid any lows, and highs that cause symptoms"); TMBY `1.sections.1.items.3` says "With diabetes, you may need a higher dose than is usually advised, so ask your team or pharmacist how much to take" (no number, no product type). Registered after reading on 2026-10-06: `phac-folic-acid` (PHAC, EN and FR, modified 2025-10-20), added to TMBY card 1; re-open it before publishing. Preconception A1C and the carbohydrate amounts stay; folic acid dose, pregnancy targets and the postpartum insulin percentage stay out. NTJ N13, TMBY M2, M3, M4, M6 and M7 and EDL D6 closed.

| Line | Default | Alternative | Where |
|---|---|---|---|
| After-meal target 5.0–8.0 | Shown as the team's decision ("your team may set a lower after-meal target") | Drop it | NTJ N13, 3.items.2 |
| Preconception A1C ≤7.0%, ≤6.5% "if it can be done safely" | Shown | Leave the number out | TMBY M4, 1.s1.2, band 1 |
| Older-adult A1C (≤7.0% independent; on medicine that can cause lows, 7.1–8.0% if functionally dependent and 7.1–8.5% if frail or with dementia "may be considered") | Shown. The functionally dependent band was added on 2026-10-05 in CPG Ch37's own words (its recommendation: "Functionally dependent: 7.1–8.0%", re-read that day); end of life ("A1C measurement not recommended") is still left out | Add the end-of-life line too; take the dependent band out again; or no numbers | TMBY M7, 4.items.2–3 |
| Carbohydrates per meal and snack (45–60 g; 15–30 g) "for most people" | Shown | Drop the numbers, keep "a dietitian or educator sets your goals" | EDL D6, 2.items.4 |
| Folic acid 1 mg; pregnancy glucose and A1C targets; at least a 50% insulin cut after birth | Not shown (held for scope) | State each with "your team sets yours" | TMBY M2, M3 and M6 |

Facts: every number above is from Diabetes Canada guidelines (Ch8, Ch36, Ch37) or DC's carbohydrate sheet. The after-meal target "must be balanced against the risk of hypoglycemia" (Ch8).

**C20. Device recommendations taken from guidelines.**
- **ANSWERED 2026-10-06** ([ruling C20](clinical-rulings-2026-10-06.md#c20)). Keep all four as they are: NTJ N6 (`6.items.3`), YT R21 (`12.items.4`), TMBY M5 (`1.sections.2.items.2`) and TMBY M8 (`4.items.5`). No change; the four come out of the review pack’s open rulings.
- Options:
  - **(default)** Keep each line, worded so the team decides:
    - NTJ N6: the CGM recommendation for type 1, with "ask your team whether that fits you" (6.items.3).
    - YT R21: automated insulin delivery for type 1 when willing and able (12.items.4).
    - TMBY M5: CGM in pregnancy, "recommended" for type 1 and "ask your team" for type 2 (1.s2.2).
    - TMBY M8: prefilled pens named as the guideline's example (4.items.5).
  - Drop any of them, or cut each to "Ask your team whether a sensor fits you".
- Facts: each is a device type with no brand, and each is a guideline recommendation (Ch9 Grade A, Ch36, Ch37, Ch41). The checks accepted them, but they sit close to the retail-scope line.

**C21. Lines that come close to treatment, and drug classes left out.**
- **ANSWERED 2026-10-06** ([ruling C21](clinical-rulings-2026-10-06.md#c21)). No medicine class or dose anywhere. Built: EDL `10.items.8` (EN and FR), "Diabetes Canada’s 2025 kidney guideline says some diabetes medicines also help protect the kidneys and heart. Ask your team whether yours does, and don’t change a medicine on your own" (Ch29 2025’s key message for people, class-free). KYT 8.items.7 and 9.items.5 cite CPG Ch3 first (Table 2 and its neonatal footnote, now in the locator); card 8’s badge stays. The heart card’s "D" stays class-free. The Kidney Foundation statistics stay out: the Indigenous figure needs an Indigenous health partner, and you have none (B1). EDL D10 and D11, KYT K14 closed.
- Options:
  - **(default)** Keep each of these with "your specialist decides" and no class or dose:
    - KYT K14: HNF1A/HNF4A "often treated with tablets"; the neonatal potassium-channel switch; CFRD "insulin is the main treatment"; LADA "some type 2 medicines are less suitable".
  - Leave out CPG Ch29's kidney-medicine key message and the KFOC dialysis and Indigenous statistics (EDL D10).
  - Name no medicine class on the heart card's "D" (EDL D11).
  - Alternatives: cut the KYT lines to "the subtype guides treatment"; add the kidney statistics (they are sourced); name the drug classes as DC does (this conflicts with retail scope).
- Applies to: KYT 7.6, 8.7, 9.5 and 12.4; EDL cards 10 and 11.

**C22. The insulin safety line, the medicine note and the checklist banner.**
- **ANSWERED 2026-10-06** ([ruling C22](clinical-rulings-2026-10-06.md#c22)). Keep "Don’t stop or lower insulin…"; approve the "Not a diagnostic tool" banner. Built (EN and FR): KYT `7.note` now starts with the insulin safety line and card 7’s note is always visible; `13.note` reads "Don’t stop or change how you take any of these medicines on your own, even if your blood sugar goes up. Ask your prescriber or pharmacist first." K12, K22 and K23 closed. Left as the default: "with your specialist" (not "your team") on card 7.
- Options:
  - **(default)** Cards 6 (in the banner), 8 and 9 say "Don't stop or lower insulin because of anything on this page. Any change is made with your specialist." Card 13's note says "Ask your prescriber or pharmacist before you change how you take any of these medicines." The clues checklist has a fixed "Not a diagnostic tool" banner, with no score and nothing saved.
  - Use "Never stop or lower insulin…", as the check proposed.
  - Add the insulin line to card 7 (LADA).
  - Use "Don't stop a medicine without your prescriber" on card 13.
- Applies to: KYT K23, K12 and K22.
- Facts: the voice rule keeps "never" for where a source says it. Holt says C-peptide "must be measured prior to insulin discontinuation".

**C23. Patient copy drawn from guidelines written for health professionals.**
- **ANSWERED 2026-10-06** ([ruling C23](clinical-rulings-2026-10-06.md#c23)). Keep the TMBY notes and the EDL Ch18 2023 lines; nothing is labelled "clinician guidance". Built (EN and FR): TMBY `1.note` now says the card "draws mostly on Diabetes Canada’s pregnancy guideline for health professionals and its key messages for people planning a pregnancy. That guideline is from 2018, and Diabetes Canada is updating it."; `4.note` says it "draws on Diabetes Canada’s guideline for health professionals and its key messages for older people." The pre-publish check for a new pregnancy chapter stays (M1). TMBY M1 and EDL D12 closed.
- Options:
  - **(default)** TMBY cards 1 and 4 say in their notes that they draw on Diabetes Canada's guideline for health professionals. EDL states fear of lows, distress screening and the 2023 alcohol position from CPG Ch18 2023.
  - Drop the TMBY note, or label the cards "Clinician guidance".
  - Keep only DC patient-page lines in EDL. Card 4 would then lose the 2023 alcohol position, which verify S7 asked for.
- Applies to: TMBY M1 (1.note, 4.note) and EDL D12 (4.items.1 and 5, 5.items.5–6).
- Facts: Ch36 (pregnancy) is still the 2018 chapter. Ch41 says pregnancy is "being updated separately".

**C24. Eye exam schedule.**
- **ANSWERED 2026-10-06** ([ruling C24](clinical-rulings-2026-10-06.md#c24)). Yearly, from Diabetes Canada’s patient page; Ch30’s starting points; Ch30’s 1–2 years only as the exception. Registered after reading on 2026-10-06: `dc-eye-damage-retinopathy` (DC, "Eye Damage (Diabetic Retinopathy)", no French page); `cos-diabetic-retinopathy` gains its French page. Built (EN and FR): EDL `9.items.4`, `9.items.5` (COS at least yearly; pregnancy credited to DC "before… and while…" and COS "first trimester"), `9.note` (the 1–2-year exception), EDL band card 1 and NTJ band card 3. The DC page leads EDL card 9’s sources and both chapters’ band sources. NTJ N2 and EDL D5 closed. EDL card 9’s ask is now `eyeCare` (C33).
- Options:
  - **(default)** CPG Ch30 first: type 2 at diagnosis; type 1 from 5 years after diagnosis, at age 15 and over; "Children have their own schedule". The Canadian Ophthalmological Society (COS) is second, then "your team decides".
  - Show only Ch30.
  - Add "Some eye specialists suggest once a year: ask yours".
- Applies to: NTJ N2 (programsBand.cards.3), EDL D5 (9.items.4–5, 9.note, band 1) and EDL G.1 (checkupYear figure, if built).
- Facts: COS says "at least once a year".

**C25. Crisis strips, and which cards stay pinned open.**
- **ANSWERED 2026-10-06** ([ruling C25](clinical-rulings-2026-10-06.md#c25)). The rule: pin a card when it tells the reader to act now (911, the emergency department, same-day care or a crisis line), including emergency steps inside a plan; not when a 911 mention only prepares someone. Pinned: SS 3, 6, 7, 8, 11; NTJ 1; EDL 3, 5, 8, 9; KYT 2; TMBY 1, 3, 5. Not pinned: NTJ 5, SS 4, SS 10, EDL 4. Ostomy parity is not adopted. Built: the rule is written in `chapters-meta.ts`; KYT 2 gains `urgentContent`; NTJ card 1’s strip now has its own `figure.body`, the same sentence as EDL card 5 ("…If your safety is at risk right now, call 911."). NTJ N1 and N10, EDL D8 and D9 and TMBY M13 closed.
- Options:
  - **(default)** Three cards are pinned open (`urgentContent`) with 9-8-8 and 911 strips (the site writes the emergency number "911" everywhere, strip labels included; review of 2026-10-05): NTJ card 1, EDL card 5 and TMBY card 5. TMBY card 5's strip has carried 911 too since 2026-10-05, with EDL card 5's sentence ("If your safety is at risk right now, call 911"). EDL feet (8) and eyes (9) are also pinned, because each has a "right away" line, and so is EDL card 3 since its 911 line shipped (C3). NTJ card 5 (support persons "taught to call 911, and how to give glucagon", reordered 2026-10-06 so 911 comes first) is not pinned.
  - Follow Ostomy: strip without pinning, or no strip.
  - Unpin EDL 8 and 9.
  - Pin NTJ card 5.
- Applies to: NTJ N1 and N10, EDL D8 and D9, TMBY M13.
- Facts:
  - The 9-8-8 page says "If your safety is at risk, call 9-1-1 right away".
  - SS removed its strip because its copy has no self-harm line.
  - The engine pins cards that carry a "same-day, emergency or crisis line".

**C26. Teplizumab (Tzield).**
- **ANSWERED 2026-10-06** ([ruling C26](clinical-rulings-2026-10-06.md#c26)). Keep it, with the brand and "aged 8 and older", and release the delay (the default; the no-figure fallback was not needed). Registered after reading on 2026-10-06: `cda-amc-tzield-recommendation-2026` (Canada’s Drug Agency, January 2026) and `hc-dpd-tzield-monograph-2026` (Health Canada DPD, authorized 2026-07-20, EN and FR); `bt1d-tzield-update-2026` gains its French page. Built (EN and FR): KYT `5.items.10` adds "to delay stage 3", the agency’s "in one study it delayed stage 3 by about 2 years, and… it can cause side effects, including serious ones", and its do-not-reimburse recommendation, before the coverage lines. No dosing. KYT K7 closed and the held "teplizumab delay" row released.
- Options:
  - **(default)** Included and flagged. It gives the May 2025 approval for people 8 and older in stage 2 (from Breakthrough T1D). It says it is on no public plan and is available out of pocket, through private insurance or through compassionate access. There is no claim about how long it delays type 1.
  - (a) Leave it out.
  - (b) Keep it without the brand name.
  - (c) Drop "aged 8 and older".
- Applies to: KYT K7 (5.items.10).
- Facts: Sanofi says a median 2-year delay and Breakthrough's TrialNet page says an average of 3, so the delay stays held. CDA (Jan 2026) and INESSS recommend against public coverage.

**C27. Know Your Type: how to show guideline figures that conflict.**
- **ANSWERED 2026-10-06** ([ruling C27](clinical-rulings-2026-10-06.md#c27)). Canadian only where Canada covers the point; labelled international figures only where Canada is silent. Built (EN and FR): KYT `6.sections.3.items.4` (K1, Ch3 only), `8.items.1` (K3, "Diabetes Canada calls single-gene diabetes rare", then the labelled international estimates), `12.items.3` (K5, CF Canada only), `13.items.8` (K6, Ch20 only), `5.items.3` (K13, "two or more type 1 antibodies"); card 5’s sources add the Health Canada monograph and the CDA recommendation; card 12 drops the ADA summary. K2 and K4 unchanged. Left as the default: "from age 10" (not "starting by age 10"). K1–K6 and K13 closed.
- Defaults: the Canadian position first, then the international one, then "your team decides". Each can be cut to Canadian only.
  - K1, routine antibody testing (6.s3.4): Ch3 "not for routine use", then ADA 2.10. Buzzetti's "screen every new type 2" is not stated.
  - K2, MODY age (8.items.4): under 25 (DC), then under 30 and 35 or under (international).
  - K3, MODY prevalence (8.items.1): 1–2% and 1–5% both shown.
  - K4, neonatal cut-off: under 6 months, with NIDDK's 6–12 months mentioned.
  - K5, CFRD screening (12.items.3, band 4): CF Canada's A1C-first approach, then international guidance prefers starting with a glucose tolerance test.
  - K6, transplant screening (13.items.8): Ch20 first.
  - K13, stage definitions (5.items.1–4): from ADA 2026 (through a secondary summary) and Phillip 2024, labelled. Alternative: keep only Breakthrough's "stages 1 and 2 come before diagnosis".

**C28. Path pages: prediabetes safety and insulin on the gestational path.**
- **ANSWERED 2026-10-06** ([ruling C28](clinical-rulings-2026-10-06.md#c28)). Prediabetes: the shared red-flags strip only (the Highs card is not listed). Gestational: the conditional insulin rows stay, and H-G1 is released. Built (EN and FR): `paths.gestational.intro.body.1` adds "Many people manage it with healthy eating and activity. Some also need medicine, such as insulin." (DC’s Gestational Diabetes page and Ch36, both already in the intro’s sources; locators updated). PATHS Q2, Q12, H-G1 and H-G2 closed.
- Options:
  - **(default)** Prediabetes carries the shared red-flags strip only.
  - Also list SS card 6 (Highs) on prediabetes.
  - **(default)** Gestational shows conditional insulin rows ("If your team starts you on insulin"). The intro line "Some people also need medicine, such as insulin" is held until the Ch36 locator note is added.
- Applies to: PATHS Q2, Q12, H-G1 and H-G2.

### NICE TO HAVE

**C29.** Should "4 Life Savers" appear in the 15 g list, as DC prints it? **(default)** No, because it is a brand. Applies to: SS R11.
- **ANSWERED 2026-10-06** ([ruling C29](clinical-rulings-2026-10-06.md#c29)). Keep it out. No copy change; `sources-review.ts` records the 4 (02/24 sheet) vs 6 (Ch14, Drive Safe, Diabète Québec) difference. SS R11 closed.

**C30.** Where does TrialNet screening for relatives go? **(default)** NTJ 5.items.4 as "free research screening". The alternative is to move it to KYT and leave a pointer. Applies to: NTJ N4.
- **ANSWERED 2026-10-06** ([ruling C30](clinical-rulings-2026-10-06.md#c30)). The default: a short pointer in NTJ card 5, with the details on KYT card 5. Built (EN and FR): NTJ `5.items.4` ends "The details are in <link>Type 1 starts before symptoms</link>, in Know Your Type", and card 5’s meta links item 4 to KYT card 5 (link text = the card’s title). NTJ N4 closed.

**C31. Small details.**
- **ANSWERED 2026-10-06** ([ruling C31](clinical-rulings-2026-10-06.md#c31)). Keep every default (N14, R20, R23, N7). Built: no copy change; the YT held row for the Dexcom G7 15 Day now carries the recheck (Health Canada authorized it 2026-07-13 per Dexcom’s investor release; not sold in Canada; confirm on MDALL before adding it as a separate 15-day sensor, with no grace period). NTJ N7 and N14, YT R20 and R23 closed.
- NTJ N14: the ruler's low band links to the Rule of 15. Alternative: link card 1.
- YT R20: belly-button distance is about 5 cm (DC). DQ says 2–3 cm; the alternative is no number.
- YT R23: the restock calculator counts G7 as 10 days and Libre 3 Plus as 15, with no grace period.
- NTJ N7: exercise starting advice (5–10 minutes a day; see your doctor first if inactive) is shown to every type.

**C32.** Sharps outside the HPSA provinces. **(default)** "Elsewhere in Canada, ask your pharmacy how to return used sharps." The alternative is to leave the line out. Applies to: YT R22 (2.items.5, 14.items.4) and NTJ E (card 9).
- **ANSWERED 2026-10-06** ([ruling C32](clinical-rulings-2026-10-06.md#c32)). Keep "Elsewhere in Canada, ask your pharmacy how to return used sharps" (YT `2.items.5`, `14.items.4`, NTJ `9.items.5`), and HPSA’s never-in-garbage line attributed to HPSA. Source gap stays: no province-wide government source covers BC, AB, SK, NS, NL or the territories. The optional PANS (Nova Scotia) entry is not registered, as it supports nothing on the page. YT R22 closed.

**C33. "Ask" roles on each card.**
- **ANSWERED 2026-10-06** ([ruling C33](clinical-rulings-2026-10-06.md#c33)). Approved and built: `cfClinic` (KYT card 12), `prescriber` (KYT card 13; its note keeps "or pharmacist"), `eyeCare` (EDL card 9), `obstetric` (TMBY card 1) and `school` (TMBY card 3), in `AskRole` (`chapters-meta.ts`) with `ui.chapter.ask.*` and `ui.chapter.roleNames.*` in EN and FR. Meters (YT cards 1 and 2) and starter supplies (NTJ card 10) now ask the pharmacist CDE; YT card 3 stays with the educator. `geneticCounsellor` and `giSpecialist` were not approved: KYT 8 and 10 stay `endo`, 11 stays `team`. One role per card; the label stays "a pharmacist CDE". KYT K10, EDL D13, TMBY M14, YT R24 and NTJ N11 closed.
- **(default)** Existing roles only.
- Proposed new roles:
  - `geneticCounsellor`, `cfClinic`, `prescriber` and `giSpecialist` (KYT K10).
  - `eyeCare` (EDL D13).
  - `obstetric` and `school` (TMBY M14).
- Also decide whether meters should go to the pharmacist CDE (YT R24) and whether card 10 should use `pharmacistCde` (NTJ N11).

**C34.** Type 3c. **(default)** The name and the pancreatic-cancer clue are held. The card is titled "Pancreas conditions and iron overload". Release both once a readable official source uses them. Applies to: KYT K9 and K20, and PATHS H-L1.
- **ANSWERED 2026-10-06** ([ruling C34](clinical-rulings-2026-10-06.md#c34)). The default: the name "type 3c" and the pancreatic-cancer clue stay held; the card stays "Pancreas conditions and iron overload". No copy change. KYT section E now records the Canadian Cancer Society’s "Risks for pancreatic cancer" (EN and FR) as the candidate source, with its risk-based framing (diabetes within the last 3 years; it does not say "after 50 with weight loss"). Not registered (it supports nothing on the page). KYT K9 and K20 and PATHS H-L1 closed as held.

**C35. Know Your Type minor content.**
- **ANSWERED 2026-10-06** ([ruling C35](clinical-rulings-2026-10-06.md#c35)). Wolfram stays under card 10’s badge; no type is named for hemochromatosis; "CGM is standard" stays held for LADA. Built: a fourth question on KYT card 7’s take-in card, `7.figure.fields.4` "Would a sensor (CGM) help me?" (FR « Un capteur (SGC) me serait-il utile? »), with the meta’s `fields: 4`. KYT K8, K15 and K19 closed.
- **(default)** Wolfram syndrome is included and flagged (K8).
- **(default)** No type is named for hemochromatosis diabetes, although the society's FAQ calls it "Type II" (K15).
- **(default)** "CGM is standard" for LADA is held (K19).

**C36. Testing routes and examples.**
- **ANSWERED 2026-10-06** ([ruling C36](clinical-rulings-2026-10-06.md#c36)). Keep the BC and Manitoba examples; release UncoverT1D only as Breakthrough T1D’s pointer, disclosed as Sanofi’s; no link to uncovert1d.ca; the free test stays held. Built (EN and FR): KYT `5.items.11`, "Breakthrough T1D also says you can ask your doctor to look at UncoverT1D, a website run by Sanofi, the company that makes teplizumab, that has information for health care providers about which tests to order", in card 5’s neutral list; it rests on `bt1d-stages-and-diagnosis` (re-read 2026-10-06), and "Sanofi makes teplizumab" on the monograph and the CDA recommendation. The optional BC lab fee schedule is not registered (it supports nothing on the page). KYT K17, K18 and K21 closed.
- **(default)** The BC MSP example is shown; its 2023 handout date is unclear (K17).
- **(default)** The Manitoba lab example is shown; it comes from one Winnipeg lab (K21).
- **(default)** The industry-run UncoverT1D screening route is held; it conflicts with Breakthrough (K18).
- Alternatives: drop the examples, or release UncoverT1D with the disclosure "run by a drug maker".

**C37.** A child's eye and kidney checks. **(default)** Left out until CPG Ch34 is re-read. Applies to: TMBY M15 (card 2).
- **ANSWERED 2026-10-06** ([ruling C37](clinical-rulings-2026-10-06.md#c37)). Add the checks now. Built (EN and FR): TMBY `2.items.9`, "Kidney checks usually start 5 years after diagnosis, or after puberty if your child was diagnosed young. Eye exams usually start at age 15, once your child has had type 1 for 5 years. Your child’s team sets the schedule", in card 2’s middle column (`[5, 9]`), citing Ch29 2025 and Ch34 (both added to the card; Ch34’s locator now records its screening lines). TMBY M15 closed and its held row released.

**C38. Prediabetes extras.**
- **ANSWERED 2026-10-06** ([ruling C38](clinical-rulings-2026-10-06.md#c38)). Release both. Registered after reading on 2026-10-06: `dc-cpg-ch5-reducing-risk` (F.1), `dc-cpg-ch4-screening` (F.2) and `dc-prediabetes-treatment` (DC, "Prediabetes Treatment"); no French versions. Built (EN and FR): `paths.prediabetes.intro.body.2` adds, before its last sentence, "If losing weight is right for you, Diabetes Canada says healthy changes that lead to a loss of 5% of your starting weight can delay or prevent type 2. Regular activity also lowers your risk, and a registered dietitian can help you find changes that suit you." (`introSources[1]` = Ch5 and the DC page); a new prediabetes reading-list row to EDL card 11 (season stage, `list.reasons.7`): "Diabetes Canada says some complications of diabetes, such as heart disease, may begin during prediabetes. This card is written for people with diabetes, so ask your doctor which parts apply to you". Q7 kept. The Ch5 medication message and the "almost 60%" figure stay out. PATHS H-P1, H-P3, Q5 and Q7 closed.
- **(default)** Held: "a 5% weight loss can delay or prevent type 2". It needs F.1 registered, and you have asked for it to be framed as one option (H-P1).
- **(default)** Held: the heart-risk line (H-P3, Q5).
- **(default)** Kept: "Ask your team which type is on your records" (Q7).

**C39.** Is the modelled "71%" type 1 figure from the T1D Index suitable for the landing page? **(default)** Shown, worded "estimates". Applies to: LAND D13 (first part).
- **ANSWERED 2026-10-06** ([ruling C39](clinical-rulings-2026-10-06.md#c39)). The default: keep it on the landing, worded as an estimate (landing unchanged). Built (EN and FR): KYT `1.items.2` and `paths.type-1.intro.body.1` now say "Breakthrough T1D estimates that about 71% of people with type 1 in Canada were diagnosed as adults". LAND D13 closed.

**C40. Style of "International guidance" labels.** The owner has allowed international sources if they are labelled (A7).
- **ANSWERED 2026-10-06** ([ruling C40](clinical-rulings-2026-10-06.md#c40)). The default: the badge stays on KYT cards 7–10; mixed cards name the international source in the sentence; NTJ’s time-in-range line stays unlabelled; PATHS row 5 unchanged. No copy change beyond C27; 12.3, 13.8 and 6.s3.4 are Canadian only now. KYT K11, NTJ N5 and PATHS P1 closed.
- **(default)** KYT cards 7–10 carry a badge. Mixed cards name the source in the sentence. NTJ's time-in-range line is not labelled, because a Canadian guideline adopts it.
- Alternatives: badge every card with any international claim (KYT 4, 5, 6, 12 and 13), or label NTJ card 3. For NTJ, "at least 70%" is the other wording option.
- Built 2026-10-06 (path pages): Less common types row 5 ("such as hearing loss or vision loss") rests only on ISPAD 2022, and its reason does not name it; the card it opens carries the badge, and the path intro says such cards say so (PATHS P1, new). Row 2 now cites `bt1d-lada` only: the record also listed `diabetes-uk-lada`, which the reason does not name.
- Applies to: KYT K11, NTJ N5 and PATHS P1.

**C41. The type 1 share: "5 to 10%" or "about 10%"?** (added 2026-10-05, review of the built chapters)
- **ANSWERED 2026-10-06** ([ruling C41](clinical-rulings-2026-10-06.md#c41)). "5 to 10%" everywhere. Registered after reading on 2026-10-06: `dc-diabetes-in-canada` (DC, "Diabetes in Canada": "5-10% of diabetes prevalence"; no French page). Built (EN and FR): KYT `1.items.1`, "Diabetes Canada says 5 to 10% of people with diabetes have type 1…", citing `dc-type-1` and `dc-diabetes-in-canada` (added to card 1). PATHS Q20 and Part 4 item 12 closed.
- Question: the two built chapters give different figures for the share of people with diabetes who have type 1. Choose one, and both sentences follow it. Neither sentence has been changed yet.
- Options:
  - "5 to 10%" in both (NTJ's wording, after its source check).
  - "About 10%" in both (KYT's wording).
- Applies to: NTJ 2.items.1 ("Diabetes Canada says 5 to 10% of people with diabetes have type 1") and KYT 1.items.1 ("About 10% of people with diabetes have type 1"). Part 4 item 12 (PATHS Q20) already proposes "5 to 10%" for KYT.
- Facts: the dc-type-1 page gives both "roughly 10" and "five to 10" percent (NTJ change log #5); with type 2 at 90 to 95%, "10%" can sum past 100%.
- The full-site review of 2026-10-06 (clinical, ruling D) found the same split, and that the landing and the type-1 path also say "5 to 10%". So KYT card 1 is the only "about 10%".

**C42. Your Tools: t:slim X2 with Dexcom G6 shows "not confirmed".** (added 2026-10-06, full-site review, clinical ruling E)
- **ANSWERED 2026-10-06** ([ruling C42](clinical-rulings-2026-10-06.md#c42)). Confirmed on Tandem’s Canadian user guide. Registered after reading on 2026-10-06: `tandem-tslim-x2-ciq-user-guide-ca` (industry; EN AW-1018762_B and FR AW-1019341_A: "Both the Dexcom G6 CGM and the Dexcom G7 CGM are compatible with the t:slim X2…"). Built in `device-pairings.ts`: G6 + t:slim X2 moves to `PAIRINGS` as `pumpMakerOnly`; G7 + t:slim X2 is now `twoMakers`, keeping Dexcom’s "not all connections are available in Canada" footnote (the default; you may drop it); the G6-to-G7 notice stays; `DEVICES_CHECKED_ON` is 2026-10-06. No message changed. YT cards 4 and 13 show both pairings with their bases.
- Question: the pump picker marks t:slim X2 + Dexcom G6 "not confirmed", which will confuse people already using that pair.
- Options:
  - **(default)** Keep "not confirmed" until a Canadian maker page states the pairing (policy 4; B8).
  - Confirm with Tandem or Dexcom Canada before publishing (pre-publish check 8), then record it in `device-pairings.ts` with its basis.
- Applies to: YT cards 4 and 13 (`device-pairings.ts`).
- Facts: G6 with t:slim X2 is listed under industry-only facts in Part 3 ("G6 with t:slim X2"). No registered page states it.

**C43. Less common types path, row 11: who gives glucagon in CFRD.** (added 2026-10-06, full-site review, clinical S3)
- **ANSWERED 2026-10-06** ([ruling C43](clinical-rulings-2026-10-06.md#c43)). Use the guideline’s own scope and the site’s glucagon line. Built (EN and FR): `paths.less-common-types.list.reasons.11`, "Cystic Fibrosis Canada’s guideline says people with CFRD who take insulin, and their families or carers, should be taught how to use glucagon. It’s for a low when the person can’t swallow, is unconscious or is having a seizure. Someone else gives it, so the people around you need to know where it is and how to use it" (row sources: the CF guideline and `bt1d-what-is-glucagon`); KYT `12.items.5` names families or carers the same way. CF Canada’s Recommendation IV ("Individuals with CFRD (and their families/carers)") is in the locator.
- Question: "Cystic Fibrosis Canada's guideline says people with CFRD who take insulin should be taught how to use glucagon" can read as if they give it to themselves. Glucagon for a severe low is always given by someone else.
- Options:
  - **(default)** Keep the verified wording (paths verify row 62 changed it to this from "recommends glucagon, and teaching").
  - The CDE's wording: "Cystic Fibrosis Canada recommends glucagon, and teaching, for people with CFRD who take insulin. Someone else gives it, so show the people around you." The second sentence rests on `bt1d-what-is-glucagon` / `das-glucagon`, which would need adding to the row.
- Applies to: `paths.less-common-types.list.reasons.11` (EN and FR).
- Facts: the CF Canada CFRD guideline (`cf-canada-cfrd-guideline-2024`) is the row's source. Not changed in code, because the source check deliberately chose the current wording.

**C44. Rule of 15, "A child": should the adult driving note hide?** (added 2026-10-06, full-site review, browser QA 9)
- **ANSWERED 2026-10-06** ([ruling C44](clinical-rulings-2026-10-06.md#c44)). Keep the note in both views, reworded for whoever drives. Built: SS `2.note` is "After a low, anyone who drives, teens included, should wait at least 40 minutes, and until their blood sugar is at least 5.0, before driving. More on driving in Every Day Living." (EN and FR). SS R6 closed.
- Question: under "A child", card 2's note ("After a low, wait at least 40 minutes, and until your blood sugar is at least 5.0, before you drive") still shows.
- Options:
  - **(default)** Keep it under both views. Teens over 10 years take the 15 g row and may drive at 16 or 17, and the note is about whoever is driving.
  - Hide it under "A child" (the QA reviewer's suggestion), or reword it for a teen driver.
- Applies to: SS 2.note.
- Facts: CPG Ch21 (`dc-cpg-ch21-driving`) gives the 40 minutes and 5.0 for any driver. The rest of the child wording was fixed in code on 2026-10-06 (steps 2 and 3 and the line after the loop now say "their"; staying-safe.md F.5).

**C45. Know Your Type cards 6 and 8: "not overweight".** (added 2026-10-06, full-site review, clinical ruling G; NICE TO HAVE)
- **ANSWERED 2026-10-06** ([ruling C45](clinical-rulings-2026-10-06.md#c45)). Built (EN and FR): KYT `6.sections.2.items.1` "You were diagnosed at a younger age, or you have a lower body weight" (the printed checklist uses it directly); `8.items.3` uses Diabetes Canada’s "not having obesity".
- Question: "You're not overweight" / "not being overweight" could read as judgement. The CDE offers "you have a lower body weight".
- Options: **(default)** keep the verified wording; or the CDE's wording, EN and FR.
- Applies to: KYT 6.sections.2.items.1 and 8.items.3 (EN and FR).

**C46. The quick-reference ketone lines: add "if you can't reach them, go to the emergency department"?** (added 2026-10-06, second full-site review; BLOCKING: safety-adjacent)
- Question: ruling C4 added "if you can't reach them, go to the emergency department" to the ketone ladder's moderate rung (SS card 7), and said not to change card 11's lane ("Your diabetes team, now: blood ketones 1.5 to 3.0, or moderate urine ketones", item 3) or the safety band's card 3 ("Call your team now"). So the two quick-reference views have no emergency fallback for the moderate range.
- Options: **(default)** as ruled (no change); or add the same fallback to SS `11.items.3` and `programsBand.cards.3.body`, EN and FR (the reviewer's recommendation).
- Applies to: SS card 11 item 3, SS band card 3.
- Facts: Breakthrough T1D's DKA page (`bt1d-dka-and-ketones`) is the ladder's source; C4's wording is already on the page in the ladder.
- **ANSWERED 2026-10-06** (owner's direction to settle clinical questions from Canadian sources; protective reading of ruling C4): the fallback is added to both quick-reference views, so they say what the ladder says. SS `11.items.3`: "… or moderate urine ketones. If you can’t reach them, go to the emergency department" (FR « … Si vous ne pouvez pas la joindre, allez à l’urgence »); SS `programsBand.cards.3.body`: "… If you can’t reach your team, go to the emergency department." (FR « … Si vous ne pouvez pas joindre votre équipe, allez à l’urgence. »). Same sources as the ladder (`bt1d-dka-and-ketones`, CPG Ch15). Logged in staying-safe.md F.11.

---

## Part 2. Business and operations (owner)

### ANSWERED by the owner on 2026-10-05

**A1. Where does Liivv have pharmacies?** ANSWERED: in every province except Quebec. There are none in the territories.
- **ANSWERED 2026-10-06** (owner): "We can support all of Canada with the pharmacies that we have - including Quebec - except for insulin in Quebec." Built: every "every province except Quebec" / "no pharmacy in Quebec or the territories" line now says Liivv's pharmacies serve all of Canada, Quebec and the territories included, and that insulin can't be ordered online for delivery in Quebec: landing trust item 2 and FAQ 1, the four path CDE bands, the Funding page's `whereHeading`/`whereBody`, `funding.liivv.pharmacies`, `quebecTitle`/`quebecBody` and `territoryTitle`/`territoryBody` (EN and FR), and the comment in `core/lib/pharmacy/pharmacy-fax.ts` (comment only). Insulin is never offered on /fr (see B11).
- Applies to: NTJ pre-publish 1 and pharmacist.body, LAND trust 2 and D7, PATHS pharmacist band, FUND ground rules.
- Still open: what Quebec and territory readers are told, and shipping (B11).

**A2. Who answers the pharmacist CDE line, for where, and when?** ANSWERED: pharmacist CDEs at the Bayshore Specialty Rx head office in Markham answer for all of Canada, by phone or by request. Hours are Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. They pass people to the right Liivv pharmacy.
- **ANSWERED 2026-10-06** (owner): "Bayshore Express Pharmacy will answer all CDE related questions"; contact "Bayshore Express Pharmacy's Pharmacists ... general contact not named individuals". Built: every CDE panel (six chapters, four paths, the landing's care band, the Funding page) names the Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, and shows its general line 1-844-561-1254 (tel: link), BayshoreExpress@bayshore.ca and "Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays", with "About Bayshore Express Pharmacy" linking https://bayshoreexpresspharmacy.ca/about/ (FR: /fr/a-propos-de-nous/), registered as `bep-about` after it was opened on 2026-10-06. The shared words are `DiabetesCare.ui.contact`; the engine draws them from `DIABETES_SITE.contact` (_microsite `SpecialistContact`). No named person anywhere. The phone and licensure parts of "Still open" are settled by B5 and B9.
- Applies to: NTJ pre-publish 1, YT R25, TMBY pre-publish 5, LAND D19, PATHS band, FUND.
- Still open: the phone number (B9), licensure and credential (B5), and what else they take (B10).

**A3. Can Omnipod be named and shown?** ANSWERED: cleared.
- **ANSWERED 2026-10-06** (owner): "Pods are stocked - Omnipod 5 Libre pairing is not yet in Canada." Built: the brand row shows Insulet's logo (Omnipod's maker; the file named `dexcom.avif` is Insulet's wordmark). The pickers already name Omnipod 5 and DASH, and Omnipod 5 with Libre 3 Plus stays "not confirmed" (`device-pairings.ts` NOT_CONFIRMED): in Canada Omnipod 5 pairs with Dexcom. Products 8090 and 8091 are still hidden in the store, so no product page is linked.
- Applies to: LAND D6 and `BRAND_NAMES` ("Omnipod stays out until pods are listed"), the YT pickers (cards 4 and 13), and the PATHS kit list.
- Still open: confirm pods are stocked before the name goes in the brands strip. The Omnipod 5 with Libre pairing is still unconfirmed by a Canadian source (YT E).
- **Store update run 2026-10-06 (owner's request):** Omnipod products 8090–8096 (Omnipod 5 pods $360, DASH pods $300, PodPals and four patch listings) are now visible and buyable in category 1151.
- **Built 2026-10-08 (owner notes 9 and 10, 2026-10-07):** the brand row has one Omnipod pill (the official Omnipod logo, trimmed; no separate Insulet pill), a link to the Diabetes Essentials shop filtered to Omnipod, which lists the two pod boxes (8090, 8091) under "Omnipod (Insulet)"; the PodPals, stickers and patches are under "Works with: Omnipod", with no device brand (landing.md S3, S6).

**A4. Who signs off kits?** ANSWERED: the owner.
- **ANSWERED 2026-10-06**: unchanged. The owner signs off each kit (kits-for-review.md); no kit is listed until then (B21).
- Applies to: LAND D22, E6 and E14, and PATHS E.1.
- ~~Still open: signing off each kit before it is listed (8049, 8051, 8053, 8058, 8060). Product placements resumed on 2026-10-06 (B21); kits stay off until then.~~
- **ANSWERED 2026-10-07** (owner): "Verified go ahead and publish" — all twelve kits (8049–8060). Built 2026-10-08: `DIABETES_LISTED_KIT_IDS` lists all twelve; the landing’s kits section, its hero and closing kits buttons and its "Kits" room render, and the Diabetes Essentials shop has a Kits filter (landing.md S5, S7). Kits are still not placed on chapter cards. Still open: the kit walkthrough’s tray and search lines (E6 in the landing’s record).

**A5. Is pay-later on offer?** ANSWERED 2026-10-06: yes. "Liivv Now, Pay Later", for insulin pump supplies, once customer service confirms eligibility; built on the Funding page. Its terms still wait for the owner and counsel (below).
- **ANSWERED 2026-10-06** (owner): "Liivv Now, Pay Later (similar to Pump Now Pay Later) - only applicable to insulin pumps and yes only after being verified by our internal customer service team". Built in the funding step (funding.md G-28): `PAY_LATER` is on. "How paying works" has a third part, "Liivv Now, Pay Later" (`#pay-later`), for insulin pump supplies, Omnipod pods included, once customer service confirms eligibility, with the program's terms mirrored (three paid orders in a row first, then a $1.00 card authorization; no credit check; pay within 45 days of receiving an order or with the next order, whichever comes first; pod orders billed every 90 days; a declined card retried 3 more times, then due within 3 business days; no prepaid cards; a late payment can hold the next shipment and end eligibility) and Bayshore Express Pharmacy's general contact, which routes the question (B10). Each pump program's card ends with a pay-later line; no other card, door or path mentions it. Another company's program name is never used (the export fails on it).
- **2026-10-06, after the second full-site review:** no pump program card carries the pay-later line any more. New Brunswick's program supplies only through its approved vendors, PEI's co-pay goes to the pump company and Alberta's IPTP does not reimburse supplies paid for personally, so a line on every card read as if Liivv could take part in each. The checker's pump group says it once instead, after its intro, as "Liivv's own way to pay for insulin pump supplies, separate from any program" (`ui.fundingResults.pumpPayLater`; funding.md G-61). The terms still name Omnipod pods, which are hidden in the store until the owner's store update.
- Still open: the owner (and counsel) confirm the terms, the $1.00 authorization and the name (FUND D-26); the checkout has no pay-later path, so customer service handles it. The landing (E10) and path doors (E.1-later) wait for the owner's go-ahead.
- Applies to: LAND E10, FUND E-20 and PATHS E.1.

**A6. Which programs does Liivv bill directly?** ANSWERED 2026-10-06: the nine provincial drug plans, each by the Liivv pharmacy in its province (not Quebec, B13); and Liivv supports all provincial pump programs.
- **ANSWERED 2026-10-06** (owner): "We support all provincial pump programs." Built in the funding step (funding.md G-26 to G-41): the checker's pump section opens "Liivv supports every provincial and territorial pump program. Tell us which program you’re on and we’ll handle your order the way it requires." Every pump program is on the page from its official page re-fetched 2026-10-06: BC (patient page and Special Authority), Alberta's IPTP (new), the SAIL program (SK), MAIPCP (MB, government page), ADP (ON), Quebec's program (paying agent as its French page names it), NB, NS (full route), PEI (new, from its Q&A PDF), NL (2021 release, partly confirmed) and Yukon (pump access, partly confirmed); NWT has no pump program on its list, Nunavut stays held, and NIHB links its official Drug Benefit List page without criteria (B2). With B13, "Programs we bill directly" lists the nine provincial drug plans (LAND E11 and PATHS P2 settled).
- **2026-10-06, after the second full-site review:** the pump intro said "every provincial and territorial pump program" and "we'll handle your order the way it requires". It now says "Liivv supports all provincial pump programs", that each program decides where its supplies come from and how it pays, and to check its rules before ordering; it shows in a province only (the Northwest Territories have no pump program on their list and Nunavut's is held). funding.md G-61.
- Applies to: LAND E11, the FUND direct-billing section and D-1, and PATHS E.1.

**A7. May international sources be used?** ANSWERED: yes, if they are labelled.
- **ANSWERED 2026-10-06** (owner): "Label as you wish." The existing labels stay (C40).
- Applies to: KYT cards 7–10, PATHS (the Exeter line), LAND (MODY chip) and NTJ N5.
- Still open: the labelling style (C40).

**A8. Are insulin and glucagon shown in the shop?** ANSWERED: yes, with a pharmacist-review notice.
- **ANSWERED 2026-10-06** (owner): "pharmacist reviews and dispenses" insulin and glucagon. Built with B3: `LANDING_GATES.insulinReviewConfirmed` is on.
- Applies to: LAND FAQ 5, E4 and E5, and the NTJ card 8 strip.
- Still open: confirming the review actually happens (B3).

**A9. Diabetes Express?** ANSWERED: no links and no name, but its wording may be mirrored.
- **ANSWERED 2026-10-06**: unchanged. Nothing customer-facing names or links Diabetes Express or its numbers. The CDE line is Bayshore Express Pharmacy's own general number (1-844-561-1254), never 1-866-418-3392, and the pharmacy is linked at its About page, not its home page (which names another retailer). The export still fails on any "Diabetes Express" in the DiabetesCare messages, and now also on any CDE lane or FAQ phone link that is not the CDE contact's own number.
- Applies to: the ground rules of every file. FUND ("no copy is reused") can now relax that rule.
- Still open: the CDE phone number must be Liivv's own line, not a Diabetes Express number (B9).

### BLOCKING

**B1. Review by an Indigenous health partner of the First Nations, Inuit and Métis card.**
- **ANSWERED 2026-10-06** (owner): no Indigenous health partner to review the card. Built: This Might Be You card 6 is now "First Nations and Inuit: NIHB coverage" (FR "Premières Nations et Inuits : la couverture du SSNA") and keeps only official program facts, each with its link: NIHB through Indigenous Services Canada; who is eligible, linked to ISC's eligibility page (`isc-nihb-eligibility`, re-opened 2026-10-06); CGM with prior approval and the 800 strips, linked to the NIHB updates page; and Funding & Coverage. Ch38's lines (care in context, remote screening, a check every 6 to 12 months) are gone with every interpretive or statistical line, and so is the prediabetes path's row to the card. TMBY M10, M12 and M16 closed.
- Options:
  - **(default)** The card is written, but the chapter is not published until the review is recorded.
  - Publish with card 6 hidden. This needs a card-level hold, which is new engine work.
  - Publish cards 1–5 only, after renumbering.
- For the partner to decide:
  - whether to include Ch38's prevalence figures, its language on colonization as a determinant of health, and its Inuit line (all held);
  - how to word the Métis line (M12);
  - whether to say that Ch38 is a type 2 chapter (M16);
  - which Indigenous-led organizations to link.
- Applies to: TMBY M10, M12 and M16 (card 6). EDL H8 (Hope for Wellness and other lines) is related.

**B2. NIHB: who isn't served by it directly, and how NIHB pays.**
- **ANSWERED 2026-10-06** (owner): "leave NIHB eligibility to what is available online - We would not be able to decide eligibility". Built: card 6 item 2 says who is eligible is on Indigenous Services Canada's eligibility page (linked, EN and FR), that Liivv can't decide whether you're eligible, and that ISC says to contact your NIHB regional office with questions. The exceptions are recorded in `sources-review.ts` only. TMBY M11 closed. The FUND rows (D-18, E-15, E-17, E-22) are for the funding step.
- Options:
  - **(default)** Hold the exceptions line. TMBY 6.items.4 sends everyone to their pharmacist, band office or land claim organization.
  - Register ISC's "Who is eligible for NIHB" page and release the held line.
- Applies to: TMBY M11 (6.items.1 and 4–5, a blocker for card 6), FUND D-18, E-15, E-17 and E-22.
- Facts:
  - The ISC page (modified 2026-05-28) lists BC First Nations who are FNHA clients, Nisga'a, Nunatsiavut, Nunavik Inuit, James Bay Cree, Bigstone Cree Nation and Akwesasne.
  - Registering it (F-24 or F-25) would also release "pays after any other plan" and "pharmacy benefits".

**B3. Does a pharmacist really review every insulin and glucagon order before it ships?**
- **ANSWERED 2026-10-06** (owner): "the pharmacist reviews all insulin and glucagon orders - we ship coldchain - insulin is not available for purchase online for Quebec but can be shipped - pharmacist can contact customer first". Built: `insulinReviewConfirmed` is on. FAQ 5 renders in English with the notice "A pharmacist reviews and dispenses every insulin and glucagon order. Shipped cold-chain in plain packaging. Insulin can't be ordered online for delivery in Quebec." (FR drafted, but never shown or sent on /fr: `FR_HELD_COPY` in landing-meta.ts). Insulin and glucagon have their own shelf room with `shop.reviewNotice`, in English only. Still not claimed: provincial rules on remote sales of Schedule II products.
- **Built 2026-10-06 (commerce):** every insulin product page (category 1116, plus Trurapi 4719 and 5002) and the glucagon page (Baqsimi 4555) shows under the buy box "A pharmacist reviews and dispenses every insulin and glucagon order. Shipped cold-chain in plain packaging.", and insulin pages add "Insulin can’t be ordered online for delivery in Quebec." (`DiabetesCare.ui.commerce`, read on the server; FR draft shows on /fr as a notice). The rule is `isInsulinProduct` / `isGlucagonProduct` in `diabetes-care/dc-ids.ts`; a new insulin filed outside 1116 must be added there. The checkout refuses insulin for a Quebec address (see B11). The Specifications list and the compare table no longer show the `COPY_SOURCE` field on any product, including under its French name `SOURCE_DE_COPIE` on /fr, and the product page no longer sends custom fields to the browser in its analytics props (landing.md rows 64–68).
- Still open for operations (catalogue fixes in BigCommerce, store writes, not code). A read-only scan of every visible product's name, description and custom fields (1,412 products, EN and FR, 2026-10-06; landing.md row 69) found 17 product descriptions that customers can read today, on the product page and in EN and /fr alike, that name the other store, link to it, or give its phone number. Each needs the mention removed or replaced (for a link, with the manufacturer's own page or Liivv's product):
  - Baqsimi (4555): "please contact us at 1-866-418-3392" (not Liivv's number).
  - Toujeo SoloStar 3-pack (4284) and 5-pack (4974): a product-monograph PDF link under www.diabetesexpress.ca.
  - Tresiba U100 FlexTouch (4605) and U200 FlexTouch (4535): "Any orders billed directly to insurance via the Diabetes Express Pharmacy are subject to standard dispensing fees." (FR "via la pharmacie Diabetes Express"). This is also a billing claim Liivv has not made.
  - Contour Next test strips (4714), Accu-Chek Aviva strips (4770, three links), Accu-Chek Softclix (4945, two links) and FreeStyle Precision β-ketone strips (4909): "works with" meter links to diabetesexpress.ca product pages.
  - Frio insulin cooling wallets (4812): a purchase link to omnipod.diabetesexpress.ca.
  - Autoshield Duo pen needles (4828): link text "outside of Diabetes Express".
  - Medicool Diapak Deluxe Black (4215): "only available in Black through Diabetes Express".
  - DiaScale nutritional scale (4874): "Diabetes Express is proud to announce…".
  - Embecta alcohol swabs (4527) and Webcol alcohol wipes (4673): "only filling orders from our current Diabetes Express clients" (also a sales restriction that may not apply to Liivv).
  - Disposable face masks (4482) and Germs Be Gone hand sanitizer (4547): "Diabetes Express has sourced … upon request from our clients".
- **Plainly, for the owner (by design until the store is fixed):** a product whose description names, links or phones another retailer is never placed or linked from a Diabetes Care page. So Staying Safe card 3 shows no glucagon (Baqsimi, 4555, still prints 1-866-418-3392), and Contour Next strips (4714), Accu-Chek Softclix (4945) and the Frio Individual wallets (4812) are left off their cards (which is why the Contour groups show only the meter, or only the lancets). Since 2026-10-06 the landing's shop preview applies the same rule (Toujeo, Tresiba and Baqsimi drop out), and New to the Journey card 8's link to the insulin shelf is held (`INSULIN_SHELF.linked`), because the shelf lists Toujeo and Tresiba. Each comes back by itself once its description is fixed; the insulin-shelf link is switched back on by hand.
- **Store fixes found 2026-10-06 (second full-site review; store writes, for the owner):**
  - Baqsimi (4555): replace 1-866-418-3392 with Bayshore Express Pharmacy's 1-844-561-1254, and link the Lilly monograph over https (`https://pi.lilly.com/ca/baqsimi-ca-pm.pdf`; it is http today).
  - Toujeo SoloStar 3-pack (4284) and 5-pack (4974): point the monograph link at Sanofi's own page; fix the description's typos ("insulin garine", "strin of Escherichia coi", "glcine", "orign").
  - Tresiba U100 (4605) and U200 (4535) FlexTouch: remove the "Diabetes Express Pharmacy" billing sentence.
  - Apidra: `/apidra-prefilled-pens-5-x-3ml`, `/apidra-10ml-vial` and `/apidra-cartridges` answer 404 in English (the French prefilled pens page opens), but are listed on the English insulin shelf and as a related product on the Lantus and Toujeo pages. Fix the English listing, or take them off the shelf and the related products.
  - Remove the customer-visible "TEST: Select an option, 30 days / Monthly" modifier (Sharps Container 1L, Dex4 Key Chain, Meal Measure Unit, FreeStyle Libre Oval Patch, among the 85 with the "Test" modifier, B21); with it gone, Ketostix and the one-size Verio strips can be one-click adds.
  - Duplicate listings with different prices: "One Touch Verio Test Strips" ($84.99, `/one-touch-verio-test-strips`) and "OneTouch Verio Test Strips" ($84.98); "FreeStyle Lite Blood Glucose Monitor" ($50.99) and "FreeStyle Lite Meter" ($46.83) (B35).
  - "KIRSTY (Insulin asparte)" should read "aspart"; Lantus SoloStar's meta description is "..."; the insulin shelf category has no meta description.
  - Omnipod pods 8090–8096: make visible (A3).
  - And `COPY_SOURCE` / `SOURCE_DE_COPIE` is still stored on 18 insulin products (hidden on every page, not deleted).
  - **Store update run 2026-10-06 (owner's request):** Baqsimi (4555) now gives 1-844-561-1254; the swab listing (4527) no longer carries the other retailer's order notice; `COPY_SOURCE` is deleted from all 18 insulin products. The other 15 descriptions above are unchanged (not yet approved). Baqsimi is now placed on Staying Safe card 3 once the catalogue cache refreshes (up to an hour).
  - How it was found, to repeat after the store fixes: the Storefront GraphQL `site.products` list (name, description, custom fields), read with `Accept-Language` en and fr, matched against `diabetes[\s_-]*express` (any case) and `866 418 3392` in any punctuation. Only Baqsimi is named in the Diabetes site's own code (`dc-ids.ts`), but shelves and search can surface any of these products.
  - **Store fixes of 2026-10-07 (owner), re-read 2026-10-08:** the 15 descriptions and the French Baqsimi and swab text no longer name another retailer. A fresh Storefront read on 2026-10-08 of all 241 products in Shop Diabetes Care and all 34 on the insulin shelf (1116), EN and FR, full HTML description (links included), its words and custom fields, found none that names, links or phones another retailer. **Built 2026-10-08:** (1) `namesAnotherRetailer` (chapter-shop.ts) replaces the bare pattern in every Diabetes loader — the landing catalogue, the chapter placements and the new Diabetes Essentials shop all read the full HTML `description` (none reads `plainTextDescription`) and test it, then its words with tags removed and entities and %-escapes decoded; `DIABETES_REFUSED_DESCRIPTION` stays as the pattern and the safety net, so a product whose text regresses drops out again by itself; (2) New to the Journey card 8 links the insulin shelf again (`INSULIN_SHELF.linked`, English only, with its notices; B21). Note: the old pattern already read the HTML and caught the Toujeo PDF address; the hardening covers entity-encoded and tag-split names.
  - **Still open (store fix):** `/apidra-prefilled-pens-5-x-3ml`, `/apidra-10ml-vial` and `/apidra-cartridges` still answer 404 in English on 2026-10-08 (local and production), and are on the insulin shelf that card 8 now links.
  - **Owner note 9 (2026-10-07), built 2026-10-08:** insulin and glucagon are never a one-click add from any listing — the Diabetes shop, the store’s category grids (the insulin shelf included), search, brand pages and compare show "View product", which opens the product page and its pharmacist notice (`withPharmacistProductsViewOnly`, lib/checkout/quebec-insulin.ts; fails closed). The product page itself is unchanged.
- Options:
  - **(default)** FAQ 5 and the insulin and glucagon tiles stay off until operations confirms.
- Applies to: LAND D4, E4 and E5. NTJ E (card 8 insulin strip).
- Operations also needs to confirm:
  - cold-chain shipping;
  - whether insulin can ship to Quebec and the territories;
  - provincial rules on remote sales of Schedule II products;
  - whether the pharmacist may contact the customer first.
- Facts:
  - Today only the Baqsimi page says a pharmacist reviews the order.
  - The "Behind the counter" wording also needs `napra-nds-insulin` registered.

**B4. Privacy sign-off.**
- **STILL OPEN 2026-10-06.** The owner did not answer; every privacy claim stays held.
- Options:
  - **(default)** Hold the claims until signed off, with interim lines that make no privacy claim.
- Applies to and needs:
  - LAND D5: the privacy lead signs off FAQ 2. Add the `liivv-care-nav` cookie (value `diabetes`) to the cookie notice. Decide whether FAQ 2 links to the privacy policy, and give its URL.
  - LAND D15 and E8: decide whether to keep "Ad tracking off on these pages" as trust item 4 or move it to FAQ 2. Either way it waits until `ad-signals.ts` and `sensitive-products.ts` are committed and deployed and preview checks pass: consent denied before `page_view` on DC pages, 1,151 products, `/compare` and wishlists.
  - FUND D-23 and E-26: engineering confirms that no analytics, session replay or event capture records the checker's inputs (health, and Indigenous and veteran status) before the line "Nothing you enter is saved or sent anywhere" is shown.
  - ~~FUND D-17: ad signals and the sitemap for the new funding route.~~ Settled 2026-10-06, when the page was built: the Diabetes Care layout denies the ad signals for the whole section, and the page is in the Liivv Health sitemap (EN; FR once its `funding` French gate is reviewed).

**B5. Pharmacist CDE licensure and credentials across provinces.**
- **ANSWERED 2026-10-06** (owner): "The only CDE pharmacists are in Bayshore Express Pharmacy in Ontario - they can support customers across Canada - the operations from the other national pharmacies are to support dispensing and products in other provinces and territories - BEP ... has the ability to transfer to other pharmacies". Built: every CDE panel and lane says the CDEs at Bayshore Express Pharmacy answer from anywhere in Canada and pass you to the Liivv pharmacy in your province when needed. The path pages' CDE band is released (`PATH_GATES.cdeBand` on).
- **UPDATED 2026-10-07** (owner note 5, "needs to be whitelabeled as services from Liivv"): every panel, lane, band, the meta description, trust item 1, FAQ 1 and 3 and the funding page now say "Liivv’s Certified Diabetes Educators" (FR « les éducateurs agréés en diabète de Liivv ») and "Liivv’s pharmacy in your province" (FR « la pharmacie de Liivv de votre province »); "Markham" is gone from service copy. The "pharmacists with diabetes training" option above still applies if anyone answering the line does not hold the CDE® credential (B48).
- Options:
  - **(default)** The copy keeps "all of Canada" (A2), frames the service as pump and CGM questions, and says "Your treatment and settings stay with your diabetes team". The PATHS band is gated.
  - Name a limit if licensure doesn't cover a province.
  - Use "pharmacists with diabetes training" if not every pharmacist holds a current CDE.
- Applies to:
  - LAND D19: trust 1, the care band, FAQ 3 and the meta description.
  - PATHS Q16, Q17 and E.1 gate 2.
  - YT R25: the pharmacist panel.
- Facts:
  - Pharmacists are licensed by province, and Quebec's is the OPQ.
  - It is not known what happens when someone in Quebec or a territory asks for a call.

**B6. Appointment form and sign-in redirect.**
- **PARTLY ANSWERED 2026-10-06** (owner): "Maybe we can use Microsoft Bookings". Not available yet: the appointment form saves nothing, so every "Request a call" stays held (`LANDING_GATES.cdeRequestReason` stays false). Microsoft Bookings, or Bayshore Express Pharmacy's own booking page (it already runs one for virtual consulting), could switch the button on later. Meanwhile every CDE panel shows the phone line, email and hours instead. The sign-in redirect is still an engineering change.
- Options:
  - **(default)** "Request a call" only. The CTA and the PATHS band don't render until the form is ready.
  - The source check suggested "Request an appointment" meanwhile. The owner's rule is "Request a call", so confirm.
- Needs:
  - a "Pump or CGM question (pharmacist CDE)" reason on `/account/virtual-care/appointment`;
  - a "Funding or claims question" reason, if B10 allows it;
  - guests who sign in should land on the virtual-care page, not the dashboard.
  - Confirmed by the full-site link crawl of 2026-10-06: `/account/virtual-care/appointment` and `/fr/account/virtual-care` both give 302 to `/login?redirectTo=%2Faccount%2Fdashboard%2F` (the English login, then the dashboard). That is the site-wide auth middleware, not the microsite; it needs its own engineering change (keep the requested path and locale in `redirectTo`).
- Applies to: LAND D3 and D8, NTJ pre-publish 1, PATHS E.1 gate 1, FUND D-5. Since 2026-10-06 the Funding page's two "Request a call" buttons (the CDE band and "Can we bill your program for you?") wait on the same `cdeRequestReason` switch as the landing's.

**B7. Funding page launch blockers.**
- **ANSWERED 2026-10-06** (owner): "apply the most recent information". Built in the funding step (funding.md G-43 to G-55): Ontario sensors are live (`on-odb-cgm`: Dexcom G7 since July 31, 2025, notice dated July 24, 2025, 45 sensors a year; FreeStyle Libre 3 Plus since November 28, 2025, 31 a year; F-2 and F-3 registered), and Alberta's private-insurance-first rule is on (`PRIVATE_FIRST.AB`, F-10 and alberta.ca Non-Group Coverage), with Alberta's sensors from the December 16, 2025 fact sheet. Also released from re-fetched official pages: Quebec sensors (INESSS, the common criteria of February 4, 2026), Nova Scotia's sensor program, NL strips (all four tiers), BC supplies (E-9), PEI pharmacare, Yukon (medicines only; devices through CDDB), VAC (E-23, E-18), NIHB billing (E-15, E-22), the DTC digital application (E-27), RC4065 medical expenses (E-14), and Monitoring for Health's age line from ontario.ca (D-21). Launch blockers D-24 and D-25 cleared.
- Ontario sensors (D-24, E-1):
  - ODB has covered Dexcom G7 since Jul 31, 2025, and Libre 3 Plus since Nov 28, 2025.
  - Today an Ontario type 2 insulin user, or anyone 65 or older or 24 or younger, sees "we're still checking".
  - Fix: register F-2 and F-3.
- Alberta private-first (D-25, E-6):
  - Since 2026-10-01, Alberta's government plans pay after private insurance.
  - Alberta readers get only the generic private-insurance card.
  - Fix: register F-10.
- Applies to: FUND.

**B8. Facts that rest only on device makers' pages (pickers and support lines).**
- **STILL OPEN 2026-10-06.** The owner didn't know; the default stays (each picker fact shows its basis and the date checked).
- Options:
  - **(default)** The pickers show each fact with a basis line and the date it was checked.
  - (a) Show only entries confirmed by the government or by two makers.
  - (b) Also hide facts that only one maker states.
  - (c) Hold all pickers until a Canadian non-industry page, such as Health Canada's licence listing, confirms each fact.
  - Makers' 24/7 support lines and numbers stay held under any option except one that accepts maker pages.
- Applies to:
  - YT R16 (URGENT, owner and nurse): card 4, 6 and 13 figures, and the held meter picker.
  - Maker support lines: SS E (card 11), NTJ E (card 11), the YT held card, and LAND E1 (FAQ 3).
- Facts:
  - Policy 4 says an industry page is never the only source.
  - Maker-only facts include G7 and Libre 3 Plus wear times, the Libre 3 Plus recall notice, every pump fact line, and the pairings for G7 with t:slim X2 and Libre 3 Plus with mylife Loop.

### IMPORTANT

**B9. The pharmacist CDE phone number.**
- **ANSWERED 2026-10-06** (owner): the contact is "Bayshore Express Pharmacy's Pharmacists ... general contact not named individuals". Built: 1-844-561-1254 (BEP's toll-free general line, written "1 844 561-1254" on /fr; tel: link), BayshoreExpress@bayshore.ca (mailto: link), the hours and the About page link, on every CDE panel, in the two CDE lanes (Staying Safe card 11, New to the Journey card 11, which show the same contact list as the panels; SS F.8 #5, NTJ F.6 #5) and in landing FAQ 3 (the pharmacy's name links its About page; landing G #59). It is not a Diabetes Express number.
- **UPDATED 2026-10-07** (owner note 5): the contact is the phone and the hours only, worded as Liivv’s: "Call Liivv: 1-844-561-1254" (FR « Appeler Liivv au 1 844 561-1254 »), list label "How to reach Liivv". The email (BayshoreExpress@bayshore.ca) and the "About Bayshore Express Pharmacy" link are gone from every panel, both CDE lanes and landing FAQ 3, and the register entry `bep-about` is deleted. Its record, kept here: Bayshore Express Pharmacy’s About page (EN https://bayshoreexpresspharmacy.ca/about/, modified 2023-03-22; FR /fr/a-propos-de-nous/, 2023-03-23), opened 2026-10-06: "We have Certified Diabetes Educators to provide you with excellent solutions for diabetes management"; its contact block 1-844-561-1254 (toll-free), BayshoreExpress@bayshore.ca, Monday to Friday 9 a.m. to 5 p.m. (EST), 233 Alden Rd, Markham, ON; owner answers A2, B5, B9, B10, B12 (the CDEs answer from anywhere in Canada and transfer to the Liivv pharmacy in another province; a general line, never a named person; closed on holidays). The Quebec checkout line now says "…or call Liivv at {phone}…". The doctor-fax template keeps the real pharmacy names (prescribers fax a licensed pharmacy). Open: B47–B50, B54.
- Options:
  - **(default)** No number is printed. "Request a call" only.
  - Print the number once the owner confirms it is Liivv's own line.
- Applies to: SS E (card 11, pharmacist panel), NTJ E, YT E, EDL H17, TMBY E, LAND D3 and E9, FUND, PATHS E.1.
- Facts: the plan's 2024 pharmacy list gives a Markham number. It must not be a Diabetes Express number.

**B10. Do the CDEs take more than pump and CGM questions?**
- **ANSWERED 2026-10-06** (owner): "they can take all sorts of questions and get answer internally". Built: the panels list "pumps, sensors, meters, supplies, billing and claims"; landing FAQ 1 ends "or ask the CDEs at Bayshore Express Pharmacy" (D8); the Funding page's "Ask a CDE" card and CDE band name billing and claims; the Gestational band stays (PATHS Q19).
- Options:
  - **(default)** Pump and CGM only. Billing "ask us" links go to "Request a call" with a funding reason, which is not yet confirmed. The Gestational band is kept with the heading "sensors and pumps".
  - Widen to billing and claims, and to meters and supplies.
  - Name another channel for billing.
  - Drop the band from Gestational.
- Applies to: LAND D8, FUND D-5, PATHS Q19.

**B11. Quebec and the territories.**
- **ANSWERED 2026-10-06** (owner): "Insulin cant be advertised to Quebec, can be billed and shipped there (if person is privately paying)". Built: with A1 above. Insulin is kept off /fr: FAQ 5 and the shelf's insulin room render in English only, and FAQ 5 is not sent to the French browser. The "insulin can't be ordered online for delivery in Quebec" restriction does appear in French (FAQ 1, Funding), as a notice, not an offer.
- **Built 2026-10-06 (commerce):** online purchase of insulin for a Quebec shipping address is blocked. `buildCheckoutSnapshot()` (`core/lib/checkout/snapshot.ts`, through `lib/checkout/quebec-insulin.ts`) throws when any cart line is insulin and the shipping province is Quebec (QC, PQ, Quebec or Québec, any case or accent), so no payment or order can be made; the checkout page shows "Insulin can’t be ordered online for delivery in Quebec. Remove it to continue, or call Bayshore Express Pharmacy at 1-844-561-1254 and a pharmacist will help." (FR draft) in the payment section, and every pay button stays off. Only the shipping address counts. Glucagon, strips and everything else still ship to Quebec. Harness: Quebec with insulin blocked, Ontario with insulin allowed, Quebec with strips allowed, Quebec with glucagon allowed. Insulin product pages carry the Quebec line too (B3).
- **Still open (operations, not built): subscription renewals to Quebec.** Renewal orders (`lib/bigcommerce/subscription-order.ts`) are created from the customer's saved address and are not checked: an insulin subscription started before this rule, or whose address later moves to Quebec, would renew. Check Stripe and Supabase for insulin subscriptions with a Quebec address before launch, and decide whether renewals hold for pharmacist contact. Also not built: the pharmacist-arranged phone order for Quebec (B3 "pharmacist can contact customer first") is handled by the pharmacy, outside the site.
- Questions:
  - What should the care band and FAQ 1 say to readers there, so it doesn't read as "we can't serve you"?
  - Can orders, including insulin, ship there, and which pharmacy fills them?
- Applies to: LAND D7, NTJ pre-publish 1 (NTJ assumed a fallback to Ontario), PATHS Q17, FUND E-8 (Quebec's plan doesn't cover drugs bought outside Quebec).

**B12. Is the pharmacist chat Ontario-only?**
- **ANSWERED 2026-10-06** (owner): "chat can be general - speak to a CDE - many HCPs can be CDEs (future state we could have CDEs who are not pharmacists)". Built: the landing's chat panel (now `care.chat`) is "Speak to a CDE" with no "Available in Ontario": the CDE contact, then the existing chat link to /account/virtual-care with its label "Talk to a pharmacist". The help band's "Ontario pharmacist chat" line is general too. The copy says "CDE", not "pharmacist CDE"; the "Ask a pharmacist CDE" chip stays (C33). Ostomy's panels still say "Available in Ontario" (not changed: Ostomy is out of scope).
- Options: **(default)** labelled "Available in Ontario", or drop the label.
- Also confirm the start time; the copy says only "until 5 p.m. Eastern".
- Applies to: LAND D2.

**B13. Program enrolment and receipts.**
- **ANSWERED 2026-10-06** (owner): "each pharmacy is already enrolled [with its province's drug plan]; Yes [Liivv receipts meet program rules]; don't know the $170 grant or the ODB co-pay line; finance team sends the invoice". Built in the funding step (funding.md G-26, G-27, G-56, G-60): "Programs we bill directly" lists the nine provincial drug plans by official name (BC PharmaCare; Alberta government-sponsored drug programs; Saskatchewan Drug Plan; Manitoba Pharmacare Program; Ontario Drug Benefit; New Brunswick Drug Plans; Nova Scotia Pharmacare; PEI Pharmacare; NLPDP), each linked to its page; Quebec is not billed (its plan doesn't cover drugs bought outside Quebec, so Quebec orders are paid privately), and no federal program or private insurer is listed (not confirmed). Programs that pay you back: "Ask us for an invoice for your claim", with no promise a claim is accepted. The landing's FAQ 1 and money door, the four path doors and Your Tools band card 4 say the same.
- **Still open:** the $170 grant ("any retailer in Ontario": does an online order count? FUND D-4) and the ODB co-pay line (FUND D-27; PATHS Q18 and H-T2-2).
- Options:
  - **(default)** Every program is shown as "you pay for your order yourself", and the page never promises a claim will be accepted.
- Questions:
  - Is the Liivv pharmacy in each province already enrolled with that province's drug plan? If so, that counts as direct billing.
  - Do Liivv receipts meet each program's rules? Manitoba wants the original receipt with a Manitoba Health number within 6 months. Quebec wants original receipts.
  - Does an online Liivv order count for Ontario's $170 grant ("any retailer in Ontario")?
  - Should the ODB co-pay line be released?
- Built 2026-10-06 (path pages): four path doors said "At Liivv, you pay for your supplies, then claim them from your program. Ask us what you need for the claim" (owner fact 30), a claim route the Funding page deliberately never promises.
- Changed 2026-10-06 after the full-site review (clinical S1): NB IPP says "NBIPP clients cannot obtain their supplies through community pharmacies", and ON ADP pays only registered vendors, so the promise was untrue for some programs. The four doors, FAQ 1 and the FR now use the Funding page's own wording (`ui.fundingPage.directEmpty`): "At Liivv, you pay for your order yourself. Some programs pay you back from a receipt, and others pay only the pharmacy or supplier directly. Check how yours pays before you order, or ask us." FAQ 1 drops "Not sure what your plan needs on a receipt?". Still yours to confirm or reword (PATHS P2), as long as no claim route is promised.
- Applies to: FUND D-1, D-3 and D-4; PATHS Q18, H-T2-2 and P2.
- Facts: some programs pay only a pharmacy or vendor: ODB and OHIP+ strips, NIHB, MEPP and Plan NP, the NB pump program, BC pumps, NS sensors and ON ADP CGM.

**B14. How do prescriptions reach Liivv?**
- **ANSWERED 2026-10-06** (owner): "We have the online dashboard account features". Built: landing FAQ 1's held sentence is released: "To fill a prescription, send it from your account's Pharmacy page: choose Add prescription, then transfer it from your current pharmacy or ask your doctor to fax it", linked to /account/pharmacy (/fr/account/pharmacy on /fr; the French says the page is in English).
- Options: a prescriber fax (the doctor-fax template), a transfer, or another route.
- Applies to: LAND D9 and E3 (FAQ 1's held sentence).

**B15. Commercial disclosure.**
- **ANSWERED 2026-10-06** for the relationship (owner): "Liivv is a company within HelioMed and part of the Bayshore Family". Built: the landing governance block opens its disclosure with "Liivv is a HelioMed company and part of the Bayshore family." (FR "Liivv est une entreprise de HelioMed et fait partie de la famille Bayshore."; `ui.landingPage.governance.relationship`). Still open: whether any manufacturer pays Liivv for listing, placement or marketing.
- Questions:
  - What is the customer-facing wording of the Liivv–Bayshore relationship?
  - Does any manufacturer pay Liivv for listing, placement or marketing? If one does, the brands strip needs a disclosure line, and it shouldn't show until that line exists.
- Applies to: LAND D10 and E7 (governance block).

**B16. Brand logos.**
- **ANSWERED 2026-10-06** (owner): permission to use all current manufacturer logos. Built: the brand row shows logos where a current file exists (Abbott `brand-4.avif`, Insulet `dexcom.avif` — despite its name, Insulet's wordmark —, Ypsomed `brand-5.avif`; alt text the maker's name) and the other makers as names in pills styled to match: Dexcom, MiniMed (not the outdated Medtronic mark), Tandem, OneTouch, Contour, Accu-Chek. Omnipod, whose pods are stocked (A3), is named in its own pill right after Insulet's logo (landing G #60). The only Dexcom file, `brand-2.webp`, is the older mark this item drops, so Dexcom shows as a name until a current Dexcom logo is supplied. FreeStyle and mylife are shown through their makers' logos.
- Options:
  - **(default)** Text names only until permission is recorded.
- Logo by logo:
  - Dexcom (`dexcom.avif`): needs permission.
  - `brand-2.webp`: an older second Dexcom logo. Drop it.
  - Medtronic (`brand-3.webp`): needs permission, and the name is outdated in Canada (it is now MiniMed Canada ULC).
  - Abbott (`brand-4.avif`): this is the corporate logo, not FreeStyle Libre. Needs permission.
  - Ypsomed (`brand-5.avif`): needs permission.
- Also confirm that each name in `BRAND_NAMES` is stocked. Omnipod is cleared (A3).
- **Owner decision 2026-10-07:** "Yes, download the six" official logo files (Omnipod and Insulet, Tandem, MiniMed, OneTouch, Contour); Dexcom, FreeStyle Libre, Accu-Chek and mylife stay names until files are supplied. **Built 2026-10-08** (owner note 10; landing.md S6): one pill per shopping brand, matching the shop’s brand filter — Dexcom, FreeStyle Libre, Omnipod, MiniMed, Tandem, mylife, OneTouch, Contour, Accu-Chek, FreeStyle — each a link to the Diabetes Essentials shop filtered to it, shown only while that brand has products on the shelf (so "each name is stocked" now holds by itself). Logos for Omnipod (trimmed), MiniMed, Tandem, OneTouch and Contour; files and sources in logo-sources.md. Abbott’s corporate mark, the old Insulet and Ypsomed files and the mislabelled `dexcom.avif` are no longer shown. "Ypsomed" is now "mylife" (confirmed on mylife Diabetes Care Canada’s "About us" page, registered `mylife-about-ca`). Still open: B73 (files to supply, Contour’s tagline) and B74.
- Applies to: LAND D6.

**B17. Launch order and cross-links.**
- **ANSWERED 2026-10-06** (owner): continue. The defaults stay as built.
- Options:
  - **(default)** Doors and chips render only when their target exists. ~~The Funding door is hidden until `/funding` exists.~~ The Funding page was built 2026-10-06, so the money door now renders.
  - Ship the landing last.
  - Point the Funding doors to Diabetes Canada's province comparisons meanwhile, with a date note (they are from 2024).
  - ~~Point NTJ's card 2 doors at the four existing path pages until KYT ships.~~ Settled for NTJ 2026-10-05: KYT is served, so the `knowYourTypeRoute` hold is lifted and N12 uses its default. The five doors open KYT cards 1 (type 1), 2 (type 2), 3 (prediabetes), 4 (gestational) and 6 (less common types), in the page locale.
  - **(default)** The "Other" chip goes to KYT card 6, which duplicates the "Is my type right?" door. Confirm that is acceptable.
  - Built 2026-10-05 (landing on the engine): the default is in code. All six chapters are on the engine, so doors 1, 3, 4 and 6 and all seven chips (LADA and MODY included) render, the chips opening KYT cards 1, 2, 4, 3, 7, 8 and 6. The money door stays hidden until `fundingPage` is switched on in `landing-meta.ts`.
  - Built 2026-10-06 (path pages): the five path pages are live, and their Funding doors open `/funding` (PATHS Q1 settled). `/chapters/your-diabetes-journey` redirects permanently to the landing’s #which-diabetes. The landing chips still open Know Your Type cards (LAND D12).
  - Built 2026-10-06 (Funding page): `fundingPage` is on, so the money door renders and opens `/liivv-health/diabetes-care/funding`; YT band card 4, the held door to Funding, is released ("Your province’s programs"). New for the owner (LAND D14): the money door's body said "and how to claim", a claim route the Funding page deliberately never promises (FUND D-1). Changed 2026-10-06 (full-site review, clinical S1) to "and how each one pays" (FR "et comment chacun paie"); confirm or reword.
- Applies to: LAND D12 and D14, NTJ N12, PATHS Q1 and Q3, and the YT band door to Funding.

**B18. Subscriptions for diabetes items.**
- **ANSWERED 2026-10-06** (owner): "Everything can be subscribed". Built: the subscribe band says anything you order here can be a subscription, and feature 1 lists pump supplies "or anything else you order".
- Question: subscriptions are on site-wide with no category gate. Does every diabetes SKU have a subscription price, and can insulin or other prescription items be subscribed to?
- **(default)** Subscribe copy covers supplies only.
- Applies to: LAND D17.

**B19. Governance block.**
- **STILL OPEN 2026-10-06.** The owner has no names yet; no byline or review line renders.
- Needed: the names and registrations of the reviewers, and the review date.
- Applies to: LAND D18, and the reviewer line on each chapter.

**B20. Who re-checks the funding facts?**
- **ANSWERED 2026-10-06** (owner): Claude sets a schedule to recheck the funding facts. Built in the funding step (funding.md G-59): `NEXT_CHECK` is 2026-11-01 and `RECHECK_OWNER` "Monthly automated recheck (scheduled), reviewed by the Liivv content owner". `core/scripts/check-funding-sources.mjs` fetches every page the Funding page cites, compares it with `core/scripts/data/funding-sources-baseline.json` (written 2026-10-06: 86 pages read, 4 yukon.ca pages blocked) and looks for each program's recheck phrases; it exits 1 on any change (docs/diabetes-content/README.md).
- **Scheduled 2026-10-06:** the task "liivv-funding-recheck" runs `check-funding-sources.mjs` at 09:07 on the 1st of each month, first run 2026-11-01. It writes its report to `docs/diabetes-content/funding-rechecks/YYYY-MM-DD.md` and changes no copy: a CHANGED or MISSING PHRASE result is re-read by hand and recorded in funding.md (G-71).
- Applies to: FUND D-15.

**B21. When do product placements resume?**
- **ANSWERED 2026-10-06** (owner): "Now?" — placements resume now, but kits stay off until the owner verifies kits-for-review.md. Built in this step: only the landing shelf's insulin room (B3); kit and product placements follow in the commerce step.
- **Built 2026-10-06 (commerce step): placements are on.** The merchandising record is `diabetes-care/chapters/chapter-shop.ts`; the shop strip is the shared engine's (`_microsite/shop/`, a port of Ostomy's strip, Ostomy's own files untouched), driven by `SiteConfig.shop`. One switch, `SHOP_SWITCH.placements`, turns every strip off.
  - Where: NTJ 8 and 10; SS 3 and 5 (never SS 2, the Rule of 15); YT 1, 2, 4–9, 11, 13, 14; EDL 2, 3, 6, 8; KYT 1, 2, 4, 7, 11–13 (never KYT 3, prediabetes); TMBY 2–4; the type-1, type-2, gestational and less-common-types paths (slot 5, never prediabetes). The funding page's pump-supplies slot was removed by the owner on 2026-10-07 (note 7); YT 13 keeps that strip. Each content file's change log lists the products card by card.
  - Insulin: never a named product. Only NTJ 8 links the insulin shelf (category 1116), with the product pages' own pharmacist and Quebec notices, on English pages only; on /fr the link, its notices and its label are left out, and the route drops anything insulin from /fr shelves (B11).
  - ~~**Held since 2026-10-06:** NTJ 8's insulin-shelf link (`INSULIN_SHELF.linked` in chapter-shop.ts): the shelf lists products whose descriptions name or link another retailer (B3). Card 8 keeps its pen needles, syringes and sharps container.~~ **Switched back on 2026-10-08**, after the owner’s store fixes of 2026-10-07 and a fresh read of every product on the shelf (none names, links or phones another retailer; B3). English only, with the pharmacist, cold-chain and Quebec notices; no /fr page links it (new-to-the-journey.md F.13). The three English Apidra listings on the shelf still answer 404 (B3).
  - **Kits (2026-10-07, owner: "Verified go ahead and publish"):** all twelve are listed on the landing and in the Diabetes Essentials shop (A4); none is placed on a chapter card.
  - **Every Diabetes loader** (landing catalogue, chapter placements, the shop) now tests the full HTML description with `namesAnotherRetailer` (B3).
  - Glucagon: Baqsimi (4555) on SS 3 only, with the pharmacist notice.
  - Checked on every request through the catalogue: a product shows only while the store shows it, sells it and has it in stock. A product with a required option or modifier (85 diabetes products carry the required "Test" modifier) is a "Choose options" link to its page, not a one-click add. The one-click add accepts only placed ids.
  - Never linked: a product whose description names or links another retailer or gives its phone number. Today that leaves out Baqsimi (so SS 3 renders nothing), Contour Next strips (4714), Accu-Chek Softclix (4945) and the Frio Individual wallets (4812) until operations fixes those descriptions (B3).
  - ~~Kits: none. `DIABETES_LISTED_KIT_IDS` stays empty until the owner verifies kits-for-review.md (A4).~~ Listed since 2026-10-08 (A4).
  - Omnipod pods (8090, 8091) are on the pump-supply strips and appear the day the owner makes them visible in the store (A3).
  - Analytics: every placed id is health-revealing by id (`DIABETES_PLACED_PRODUCT_IDS` in `sensitive-products.ts`), as the Ostomy supply list's are.
- Still open:
  - Owner: verify each kit (A4); make the Omnipod pods visible (a store write); fix the four product descriptions above (B3); remove the stray required "Test" modifier so those products can be added in one click (a store write; commerce facts, section 3).
  - Nurse: the two diabetic foot creams (7342 MagniLife, 7332 Lakota) make symptom claims; they are left off EDL card 8 until ruled. Blood β-ketone strips (4909) are left off: no blood-ketone meter is stocked. Ketone strips on the gestational path and KYT card 4 are left off until ruled.
  - Owner: whether any strip should say Subscribe & save (none does; each product page says whether it is offered).
- **(default)** On hold everywhere. No shop strips, kits, product strips or Subscribe & save links.
- Applies to:
  - SS cards 3 and 5; NTJ cards 8 and 10; YT card 6 and all cards;
  - EDL cards 2, 3, 6 and 8; KYT cards 1–13; TMBY cards 2–4;
  - LAND (kits and shelf preview); PATHS slot 5 (never on prediabetes). FUND: none since 2026-10-07 (note 7 removed its pump-supplies slot).

### NICE TO HAVE

**B22.** Should program phone numbers be shown on the funding page? **(default)** No. Applies to: FUND D-10.
- **ANSWERED 2026-10-06** (owner): yes. Built in the funding step (funding.md G-30): every program whose official page prints a number shows it on its card, federal row and the /fr plain list, as tel: links, with in-province-only toll-free numbers labelled (BC PharmaCare, Yukon CDDB). Only numbers re-checked on 2026-10-06 (e.g. MB 204-786-7365/7366 and 1-800-297-8099 ext 7365 or 7366; the NIHB client line 1-888-441-4777, not the provider line). The NL pump program's 2021 numbers are left out (they predate NL Health Services).

**B23.** May brand names appear in coverage copy where a program lists them, such as the BC row's t:slim, AutoSoft, TruSteel and VariSoft? **(default)** Yes. Applies to: FUND D-14 (owner and nurse).
- **ANSWERED 2026-10-06** (owner): yes. The default stays; the new rows name brands where their program lists them (Alberta's pumps and sensors, PEI's pumps, Quebec's and Ontario's sensors).

**B24.** Should the line "Your provincial or territorial drug plan still applies" (`notSignedBody`) be kept or cut? **(default)** Kept. Applies to: FUND D-16. (It said "provincial" only until 2026-10-06, which read wrongly for Nunavut and the Northwest Territories; full-site review.)
- **ANSWERED 2026-10-06** (owner): up to you. Kept.

**B25. Official French program names and the diabetes type options.**
- **ANSWERED 2026-10-06** (owner): "Official french names from govt websites". Built in the funding step (funding.md G-31, G-58): each program's `programNameFr` from the government's own French page — ADP (PAAF), ODB (PMO), Monitoring for Health, MAIPCP, MEPP, the NB pump program, NLPDP, NIHB (SSNA), Yukon's National Pharmacare and chronic disease programs, NWT Extended Health Benefits, the DTC (CIPH), the RDSP (REEI), the Pharmacare Act and VAC; and the Saskatchewan, Manitoba, Ontario, New Brunswick and NL drug plans in "Programs we bill directly". Left empty where the government publishes none (BC, Alberta, the SK pump program, Nova Scotia); PEI's only French name is in a translated patient handout, not a program page, so it stays empty. With Alberta's program (type 1 or type 3c) on the page, the "other" type option reads "Another type (such as LADA or type 3c), or not sure".
- Applies to: FUND D-9 and D-11.

**B26. Path page layout.**
- **ANSWERED 2026-10-06** (owner): continue. The defaults stay as built.
- **(default)** Ontario examples are labelled (Q4).
- **(default)** Full reading lists. Type 1 has 33 entries and type 2 has 28; the alternative is a cap of about 20 (Q8).
- **(default)** Row order on Less common types (Q9). As built 2026-10-06, rows 14 and 15 sit under a second "Start here" heading after the Staying Safe cards. Giving them the stage "If this is you" is a one-line change in `paths-meta.ts`. The full-site review of 2026-10-06 (clinical S3) flags the two "Start here" headings (FR "Commencez ici" twice) and suggests a stage named "Getting set up" for rows 14–15; that needs a new stage label in `ui.path` (EN and FR). Pick "If this is you", "Getting set up", or keep.
- Applies to: PATHS.

**B27. Images and accent colour.**
- **ANSWERED 2026-10-06** (owner): continue. The placeholders stay.
- **(default)** Placeholders: EDL's accent `#c9dcc0` and archive images.
- `less-common-types` reuses `chapter-journey.png`.
- Applies to: EDL D14, PATHS Q10.

**B28.** Should a resources shelf be added (mental health, travel, rights, education)? **(default)** None, because the Staying Safe shape has no shelf. Applies to: EDL H18.
- **ANSWERED 2026-10-06** (owner): "Yes definitely". Not built in this step: each link needs an official source fetched and registered first. It goes on Everyday Liivving, Ostomy's chapter-3 pattern (four groups: mental health, travel, rights, education).
- **Built 2026-10-06 (commerce step).** Everyday Liivving has a resources shelf (engine shelf, between the band and the pharmacist panel), every link a registered source opened that day, Canadian and official only, with the publisher's French page on /fr where it keeps one:
  - Mental health and support: 9-8-8 (`988-suicide-crisis-helpline`); Diabetes Canada, Taking care of your mental health; Breakthrough T1D Canada, Mental health support (French page on perceedt1.ca, now registered).
  - Travel: CATSA, Diabetic supplies (French page now registered); Diabetes Canada, Air travel; Diabète Québec, Trips / « Voyages » (new, `dq-trips`).
  - Your rights: Diabetes Canada, The rights of people living with diabetes; Canadian Human Rights Commission, Human rights complaints (new, `chrc-human-rights-complaints`, EN and FR; for federally regulated employers and services, and it helps you find your provincial or territorial commission).
  - Learning about diabetes: Diabetes Canada, Virtual Diabetes Education Program (new, `dc-virtual-diabetes-education-program`); Diabète Québec, InfoDiabetes Service / « Service InfoDiabète » (new, `dq-infodiabetes-service`).
  - No industry page and no retailer. Diabetes Canada's support line (named in EDL H18) is not on it: no page for it is registered.
  - New to the Journey gets no shelf: its content file plans none.
- Still open: the `shelf` French gate stays closed on /fr until a francophone reviewer signs off the shelf's French (Part 4, item 14).

**B29.** Do diabetes orders, including insulin cold-chain packs, ship in plain packaging? Operations to confirm. Applies to: LAND E2.
- **ANSWERED 2026-10-06** (owner): yes. Built: the subscribe band's third feature is Ostomy's "Plain packaging. Quiet checkout." / "Same discreet delivery as a one-time order. Pause, skip or cancel under Account, Subscriptions." (FR "Emballage neutre. Paiement discret."), and FAQ 5 says insulin and glucagon orders ship cold-chain in plain packaging (LAND E2 released).

**B30.** Should server-side shop rooms come before launch? The shop's room classifier is name-based. Since 2026-10-05 (`diabetes-care/shop-classify.ts`) FreeStyle meters, strips and lancets file under meters and only FreeStyle Libre under "Sensors (CGM)"; the server-side question stands. Applies to: LAND D16.
- **STILL OPEN 2026-10-06.** The owner is not sure; the name-based rooms stay. Insulin and glucagon now have their own room (B3).

### Added 2026-10-06, after the full-site review

**B31. Two register ids for one Ontario page.** (IMPORTANT)
- **ANSWERED 2026-10-06** (owner): "Keep most up to date". Built: `on-adp-insulin-pumps` is merged into `on-diabetes-equipment-and-supplies` everywhere it was cited (funding-meta `on-adp-pump`, `on-adp-cgm`, `ui.fundingPage.movingIntro`; the less common types path's funding door) and removed from the register. The current page was re-read on 2026-10-06 and its ADP facts are in the merged locator. It also states the "lost or misused pump" line (FUND D-22), for the funding step.
- Question: `on-adp-insulin-pumps` (ontario.ca/page/insulin-pumps-and-diabetes-supplies) now redirects (`redirect_year=2022`) to the page of `on-diabetes-equipment-and-supplies` (ontario.ca/page/get-support-for-diabetes-equipment-and-supplies). Re-read 2026-10-06: the page's own title is "Diabetes equipment and supplies" for both, so both ids rightly show that title, and the Funding and Less common types source lists name it twice with two URLs.
- Options:
  - **(default)** Keep both ids (each still cites what was read on 2026-10-05).
  - Merge `on-adp-insulin-pumps` into `on-diabetes-equipment-and-supplies` everywhere it is cited (funding-meta `on-adp-pump`, `on-adp-cgm`, `movingIntro`; paths LC funding door). The nurse confirms the ADP pump claims (100% of the pump price, $2,400 a year as $600 every 3 months, type 1 only, 8-week review) are on the current page: its sections include "Who qualifies", "How much is covered" and "Receiving payment for the insulin pump supplies".
- Also done 2026-10-06: the current page's French version (its own hreflang link, "Pompes à insuline et fournitures nécessaires au traitement du diabète") is registered as `labelFr`/`hrefFr` on `on-diabetes-equipment-and-supplies`.

**B32. One name for the chapter and the site.** (IMPORTANT)
- **ANSWERED 2026-10-06** (owner): "Match current build for Ostomy". Built: chapter 4 is "Everyday Liivving" (FR "Liivv au quotidien") in the messages, the header menu (`DIABETES_CHAPTER_LINKS`), the reading lists (from the chapter title) and the two notes that name it; the slug `every-day-living` stays. FR site name "Soins du diabète" everywhere: the chapter kicker, the back links and the page-title suffix.
- Question: the chapter is "Every Day Living" (title, menu label, slug `every-day-living`), the site title is "Diabetes Care & Everyday "Liivving"", and Ostomy's chapter is "Everyday Liivving". "Everyday" is the correct adjective. In French, the landing title says "Soins du diabète", while the chapter titles, kickers and back links say "Soins en diabète" (changed to "en" on 2026-10-05, SS F.4 #56).
- Options:
  - **(default)** Leave as is.
  - EN: "Everyday Living" (chapter title and menu; the slug can stay), or "Everyday Liivving" to match Ostomy and the site title.
  - FR: "Soins en diabète" everywhere (the landing title and meta follow the chapters), or "Soins du diabète" everywhere.
- Applies to: `DiabetesCare.chapters.every-day-living.title`, the header menu label (`inject-liivv-health-nav.ts`), `ui.landingPage.meta`/hero (FR), `ui.chapter.kicker`, `backToLanding`, `backToChapters` (FR).

**B33. Landing hero video on /fr.** (IMPORTANT)
- **ANSWERED 2026-10-06** (owner): "Match current build for Ostomy". The hero video stays on /fr, as Ostomy's does, and its poster (`/archive/diabetes-care/hero.png`, checked 2026-10-06) has no text. No change was needed.
- Question: `diabetes-care.mp4` has "Diabetes / AND EVERY DAY LIVING" burned in, in English, and plays on /fr. Its words also differ from the page title.
- Options: **(default)** keep; supply a version (or a poster frame) with no text, used on /fr at least; or a French version. Needs a new asset, so it waits on you or design. Settling B32 settles the wording.
- Applies to: LAND hero.

**B34. Supplements on the diabetes shelf.** (IMPORTANT)
- **ANSWERED 2026-10-06** (owner): yes, supplements stay on the shelf. No change (the default).
- Question: the landing shelf shows AOR GlucoSupport (a natural health product) and "Benylin … for People with Diabetes" beside clinical guidance. Should supplements and OTC remedies appear on the Diabetes shelf while placements are on hold (B21)?
- Options: **(default)** shown, because the shelf is the live "Shop Diabetes Care" category; or filter them out of the landing preview by name (`shop-classify.ts`), as insulin and glucagon are (LAND E5).
- Applies to: LAND shelf preview.

**B35. Duplicate strip listing.** (NICE TO HAVE; catalog, not code)
- **STILL OPEN 2026-10-06.** The owner says merge the duplicate listing. That is a store write in BigCommerce, not part of this build.
- **Store update run 2026-10-06 (owner's request, after the release):** 4948 is kept at $84.98 with brand "OneTouch" (brand 250 renamed from "One Touch"; it also covers 7356), 7895's description and three photos copied onto it. The permanent redirect `/one-touch-verio-test-strips` → `/onetouch-verio-test-strips` (EN and /fr) is in `core/next.config.ts`. **Still to do:** hide 7895 once that redirect is live in production (`scratchpad/bcfix/apply.mjs`, `HIDE_DUPLICATE_REDIRECT_LIVE`).
- Question: `/one-touch-verio-test-strips` ("One Touch Verio Test Strips", SKU WC-144766-P, from $84.99) and `/onetouch-verio-test-strips` ("OneTouch Verio Test Strips", $84.98) look like the same item. The brand is spelled "OneTouch". Merge or retire one listing in BigCommerce and correct the name.
- Applies to: the catalog (placements are on hold, so no page copy changes).

**B36. Cystic Fibrosis Canada guideline link.** (NICE TO HAVE)
- **ANSWERED 2026-10-06** (owner): "Only use official source". Built: `cf-canada-cfrd-guideline-2024` now links Cystic Fibrosis Canada's own page, https://cysticfibrosis.ca/guidelines-and-standards-of-care (opened 2026-10-06; it lists and links the PDF, whose address is recorded in `sources-review.ts`), with the French page on fibrosekystique.ca (`hrefFr`, its own hreflang link; it links the French guideline). Know Your Type's citation list follows.
- Question: `cf-canada-cfrd-guideline-2024` links to a CDN address (`cystic-fibrosis.cdn.prismic.io/…CFRDGuidelines-Branded-.pdf`), not cysticfibrosis.ca. Register the guideline's page on cysticfibrosis.ca if there is one (someone opens and reads it first), or keep the PDF.
- Applies to: KYT card 12, PATHS less common types.

### Added 2026-10-06, after the second full-site review (browser QA, link crawl, clinical and business review)

What was fixed in code that day is in each file's change log (new-to-the-journey.md F.8, staying-safe.md F.10, your-tools.md F.10, know-your-type.md F.8, this-might-be-you.md F.8, every-day-living.md F.8, landing.md, funding.md G-61 to G-71, paths.md H.8). These are the questions it left.

**B37. Does glucagon ship cold-chain?** (IMPORTANT)
- Question: the owner's answer (B3) was "the pharmacist reviews all insulin and glucagon orders - we ship coldchain". Baqsimi, the only glucagon stocked, is stored at room temperature.
- Built meanwhile (safe default, says less): the product-page and strip notice is "A pharmacist reviews and dispenses every insulin and glucagon order, shipped in plain packaging.", and "Insulin is shipped cold-chain." shows on insulin only (`ui.commerce.insulinColdChain`); FAQ 5 says the same.
- Options: **(default)** cold-chain said of insulin only; or glucagon ships cold too, and the line goes back on glucagon.
- Applies to: `ui.commerce.pharmacistNotice` and `insulinColdChain`, LAND FAQ 5, SS card 3's strip.

**B38. French insulin product pages, French search, and the English shop grid.** (BLOCKING: legal)
- Question: B11 says "Insulin cant be advertised to Quebec". Do French insulin product pages (for example /fr/lantus-insulin-solostar-prefilled-pens) count as advertising? They still open on /fr if someone has the address.
- Built 2026-10-06: on /fr no list shows insulin any more: Shop Diabetes Care (the category page the header menu links), search results and a product page's « Vous aimerez aussi » leave out every insulin product (category 1116 and Trurapi), and fail closed if the catalogue can't say which is insulin (`withoutInsulinOnFrench`, `core/lib/checkout/quebec-insulin.ts`). The result count above a French list still counts what was left off. English pages are unchanged.
- Options for the product pages: **(default)** they stay reachable by address, with the pharmacist and Quebec notices; or /fr insulin product pages redirect to the English page, or show a "not available online in Quebec" page instead.
- Also: on the English Shop Diabetes Care grid, an insulin with nothing to choose (Humalog Mix 25) adds to the cart in one click, without the pharmacist notice the product page shows. Options: **(default)** keep; or make every insulin tile a "Choose options" link to its page (a change to the store's shared product card).
- Applies to: the store's category, search and product pages; B11.

**B39. Ontario Monitoring for Health: "gestational diabetes" or "diabetes while pregnant"?** (IMPORTANT)
- Question: ontario.ca (re-read 2026-10-06) says both "Ontarian residents who use insulin or have diabetes while pregnant" (who can receive the 75%) and "to confirm that you use insulin or have gestational diabetes" (the first claim form). The card says "People who use insulin (type 1 or type 2), and people with gestational diabetes". "Diabetes while pregnant" would also take someone with type 2 who is pregnant and not on insulin.
- Options: **(default)** keep "gestational diabetes" (the claim-form wording); or "people who have diabetes while pregnant", with the checker showing the card to a type 1 or type 2 reader who is pregnant (it has no pregnancy question today).
- Applies to: `funding.programs.on-mfhp.who` (EN and FR); funding-data.ts `fitFor`.
- Fixed meanwhile: the talking meter line now carries the page's condition, "if a letter from your doctor confirms visual impairment" (funding.md G-67).

**B40. Quebec sensors: "renewed at 70% wear" for every sensor?** (IMPORTANT)
- Question: the Quebec sensor card says coverage is renewed at ≥70% wear for every sensor. The INESSS text the reviewer read states this only for FreeStyle Libre.
- Options: scope the line to FreeStyle Libre; or confirm it for Dexcom G6 and G7 from INESSS's Dexcom record (`inesss-dexcom-g6-g7-2026`) and keep it.
- Applies to: `funding.programs.qc-cgm` (EN and FR).

**B41. Four Yukon numbers could not be re-checked.** (IMPORTANT)
- Question: yukon.ca refused the reviewer's requests (403), so 867-393-7480 (Yukon National Pharmacare), 867-667-5092 (Chronic Disease and Disability Benefits), 867-667-5403 (Senior Pharmacare) and 1-800-661-0408 could not be re-read on 2026-10-06; 867-393-7480 rests only on the funding step's notes (funding-facts.md). Someone opens the Yukon pages in a browser and confirms each number, or it is taken off.
- Options: **(default)** keep (read in a browser on 2026-10-06 in the funding step); or drop any number not confirmed.
- Applies to: `yt-pump`, `yt-pharmacare`, `yt-cddb` phones (funding-meta.ts).

**B42. Two strips beside clinical lines.** (IMPORTANT)
- Question: Your Tools card 8 sells U-100 insulin syringes just under "never use a syringe with concentrated insulin". Everyday Liivving card 8 (the pinned urgent foot card) shows a product named "Infracare Socks for cold feet due to Diabetes…", a product name that makes a symptom claim.
- Options: **(default)** keep both; drop the syringes from card 8 (they stay on other cards); drop the socks from card 8, or rename the product in the store.
- Applies to: chapter-shop.ts YT 8, EDL 8.

**B43. Should every chapter list every source its cards rest on?** (NICE TO HAVE)
- **SETTLED 2026-10-07** by owner note 1 (sources in the element): every card shows its own sources (its `sources` plus its figures’), and "Where this comes from" lists every source the page names, grouped Canadian / international / makers. `citations` stays in chapters-meta.ts for the export only.
- Question: "Where this comes from" at the foot of each chapter is a short, hand-picked list (5 to 10 titles); the card-level sources are recorded for review but never shown. On 2026-10-06 Staying Safe's list gained the nine sources its cards rest on for a child's amounts, honey, glucagon, school and insulin storage (staying-safe.md F.10). The other chapters still list only their main sources (New to the Journey cites 5 of the 37 its cards use; Know Your Type 6 of 57).
- Options: **(default)** the short lists, with Staying Safe's added; or every card's sources, listed under each card or at the foot of the page.
- Applies to: every chapter's `citations` (chapters-meta.ts).

**B44. Omnipod in the brand row while its products are hidden.** (NICE TO HAVE)
- Question: the landing's brand row says the brands are there "so they're easy to find", and names Omnipod beside Insulet's logo; the Omnipod pods (8090–8096) are still hidden in the store until the owner's store update.
- Options: **(default)** keep (pods are stocked, A3); or leave Omnipod out until the pods are visible.
- Applies to: `BRANDS` (landing-meta.ts).

**B45. One look for the shop strips and the resources shelf?** (NICE TO HAVE; design)
- Question: Ostomy's chapter strips are compact rows (thumbnail, name, price, a full-width button on phones); Diabetes uses taller image cards, except on narrow phones, where since 2026-10-06 its cards are rows too. The Every Day Living resources shelf is the engine's twin of Ostomy's resource shelf (one box per group, a capitals org line); Ostomy's `#chapter-resources` uses one card per link, an intro line and larger spacing.
- Options: **(default)** keep both as built; or restyle either to match Ostomy, as a design pass on the shared engine.
- Applies to: `_microsite/shop/shop-strip.*`, `_microsite/chapters/resource-shelf.tsx`.

### Added 2026-10-07, owner notes 5 and 1 (white-label CDE service; sources in the element)

What was built that day is in each file's 2026-10-07 change log (new-to-the-journey.md F.9, which also holds the engine rows, staying-safe.md F.12, your-tools.md F.11, every-day-living.md F.9, know-your-type.md F.9, this-might-be-you.md F.9, paths.md H.9, landing.md, funding.md) and at the end of clinical-rulings-2026-10-06.md. These are the questions it left.

**B46. Confirm that note 1 overrides your own in-sentence credit rulings.** (IMPORTANT; one line)
- Question: rulings C5, C9, C11/K24, C16, C17, C23, C24, C32, C39 and C40 asked for a body to be credited in the sentence. Note 1 moves every credit into the card's Sources disclosure. Built that way; the clinical content of each ruling is unchanged.
- Options: **(default)** confirm; or name a line that must keep its in-sentence credit.
- Also for the nurse: lines that state a guideline recommendation or give clinical permission now say "Canadian guidelines…" (for example the Rule of 15 aid note "may treat a low … with less, 5 to 10 g", automated insulin delivery "preferred", the older-adult A1C targets, the alcohol lines "(2023)"); the full list is the "Canadian guidelines" rows of the change logs. Confirm the wording, or name a line to state plainly.
- Also (2026-10-07, after verification): three lines drawn from the type 1 guideline say "For type 1, Canadian guidelines…" again, because the first rewrite lost "type 1" with the guideline’s name: automated insulin delivery preferred (Know Your Type 1.items.5), the same A1C target for children of every age (This Might Be You 2.items.1), and help with giving insulin at school and daycare (This Might Be You 3.items.9, which otherwise read as a rule for every child with diabetes). Confirm the type 1 scope, or say if the school line should apply to all children.
- Also (2026-10-08, final fix pass for the owner review of 2026-10-07): Every Day Living card 12 ("Work and your rights") no longer names Diabetes Canada in its three position lines or its note; they state the positions plainly ("People with diabetes should be eligible for any job they’re qualified for", and so on), and the card’s Sources disclosure names the rights page. The helpline line keeps the name (it is the subject). Confirm, or say if those advocacy positions should be credited in the sentence again (every-day-living.md F.13).
- Also (2026-10-08): two lines the first rewrite had blurred now carry their scope again: "In hospital, 20 to 50%…" (Know Your Type 13.items.2) and "International estimates suggest about 9 in 10 people with MODY…" (Know Your Type 8.items.2); and the school line asks the school rather than telling parents ("…ask for at least two staff to be trained", This Might Be You 3.items.3). Details in each file’s F.13.
- Applies to: every chapter, the paths and the landing.

**B47. The "part of the Bayshore family" line.** (NICE TO HAVE)
- Question: note 5 asks for the services to be white-labelled as Liivv's. The landing's governance block still says "Liivv is a HelioMed company and part of the Bayshore family." (your own wording, B15). Was note 5 meant to cover it?
- Options: **(default)** keep (a corporate-ownership disclosure, not a service claim); or remove `governance.relationship`.
- Applies to: LAND governance block.

**B48. How is 1-844-561-1254 answered, and does everyone on it hold the CDE® credential?** (IMPORTANT)
- Question: the pages say "Call Liivv" and "Liivv's Certified Diabetes Educators". If the line is answered "Bayshore Express Pharmacy", a caller hears another name; if anyone answering is not a CDE, the label overstates.
- Options: **(default)** keep; a Liivv greeting, menu option or number (only `contact.tel` and `ui.contact.phone` change); "Liivv's pharmacists with diabetes training" (B5's fallback).
- Applies to: `ui.contact`, every CDE panel, lane and band, FAQ 3, the checkout's Quebec line.
- Also (clinical re-read, 2026-10-08): the landing’s care band heading "Speak to a CDE." (« Parlez à un EAD. ») sits over "Call Liivv’s Certified Diabetes Educators, or start a chat from your Liivv account"; the chat link opens /account/virtual-care, which Ostomy’s pages call the Ontario pharmacist chat. B12’s answer ("chat can be general - speak to a CDE") allows the heading; it holds only if whoever answers the chat holds the CDE® credential. **(default, unchanged)** keep; or "Call a Liivv Certified Diabetes Educator, or chat with a Liivv pharmacist from your account" (`ui.landingPage.care.chat.*`).

**B49. The store has no pharmacy disclosure.** (IMPORTANT; compliance)
- Question: the Ontario College of Pharmacists asks an online pharmacy's website to show the bricks-and-mortar pharmacy's name, accreditation number, owner, address, phone, Designated Manager and pharmacist hours (OCP "Online Pharmacies"; the "Operating Internet Sites" policy puts it on the home page). The footer shows none of these today, before and after note 5. White-labelling the service copy makes one disclosure, in one place, more important.
- Options: **(default)** nothing built yet; or a store-wide footer line and a `/pharmacy-information` page (EN/FR) naming each licensed pharmacy (the names and addresses are in `lib/pharmacy/pharmacy-fax.ts`), once compliance supplies the accreditation numbers, Designated Manager names and the Point of Care Symbol. Not read: O. Reg. 264/16 itself (the e-Laws page did not render). A compliance lead should confirm.
- Applies to: the store footer (every page, Ostomy included).

**B50. Old page snapshots still say "Bayshore Express Pharmacy".** (NICE TO HAVE)
- Question: `/archive/diabetes-care.html` and `/archive/liivv-health-page.html` (public files, linked from nowhere) and `/api/archive/diabetes-care/image_with_text_overlay_7JgREg` still serve the old "Bayshore Express Pharmacy" button, and the second says "Through our partnership with Bayshore Express Pharmacy, our clinical pharmacists can legally assess your symptoms and prescribe…".
- Options: **(default)** leave; or `noindex` or remove the `*.html` snapshots and the unused archive route. Do not move `public/archive/`: its image folders are live.
- Applies to: `core/public/archive/*.html`, `app/api/archive/diabetes-care/[section]/route.ts`.

**B51. A Liivv email address for the CDEs?** (NICE TO HAVE)
- Question: there is no Liivv-domain inbox the CDEs read, so the email line is gone. If one is set up, setting `contact.email` brings the line back with no other change.
- Applies to: `DIABETES_SITE.contact`.

**B52. "Breakthrough T1D" or "Percée DT1" in French?** (NICE TO HAVE)
- Question: the Sources disclosures on /fr name the publisher "Percée DT1", the name its French site uses (perceedt1.ca, read 2026-10-07). French prose that keeps the body as its subject (TrialNet, the ketone ladder's credit, the coverage map) still says "Breakthrough T1D".
- Options: **(default)** leave the prose; or use "Percée DT1" in the French prose too.
- Applies to: fr.json, the B lines naming Breakthrough T1D.

**B53. The Tzield monograph in a Sources list.** (NICE TO HAVE)
- Question: Know Your Type card 5's Sources list shows "TZIELD Product Monograph…, Health Canada Drug Product Database (2026)". Tzield is named in the copy already and is not insulin, so it was not hidden with the insulin monographs.
- Options: **(default)** keep; or mark `hc-dpd-tzield-monograph-2026` review-only too.
- Applies to: sources-meta.ts.

**B54. The doctor-fax dialog's intro.** (NICE TO HAVE)
- Question: the dialog says "request a fax to Liivv Pharmacy" (hard-coded English, so /fr sees English), while the template it fills names the real pharmacy, which it must. Suggested: "…to request a fax to Liivv's pharmacy in your province, named in the template below." Not changed: the fax flow keeps the real pharmacy names.
- Applies to: `components/pharmacy/add-prescription-dialog.tsx`.

**B55. Years and French names the register could not confirm.** (NICE TO HAVE)
- The Sources lists show a year where the document carries one. Seven guideline chapters (10, 15, 30, 32, 35, 37, 38) and the classification appendix show none: their pages were not re-read for it on 2026-10-07. Publishers with no French name found (the Kidney Foundation, the CMA, the provincial governments other than Manitoba and Quebec, HPSA, the hemochromatosis society, the University of Exeter) show their English name on /fr, marked as English. Confirm or supply.

### Added 2026-10-07, owner notes 2, 3 and 7 (printing, one-tap forms, the funding page's pump strip)

What was built is in the 2026-10-07 change logs: new-to-the-journey.md F.10 (the engine's printing, for every print button on both sites), staying-safe.md F.13, your-tools.md F.12, every-day-living.md F.10, know-your-type.md F.10 (the family tree), this-might-be-you.md F.10 and funding.md ("Owner notes 7 and 3 applied"). Settled by the owner: note 7 removed the funding page's pump-supplies strip (B21's FUND slot and D-13 are closed). These are the questions it left.

**B56. The family tree's questions.** (IMPORTANT; nurse)
- Built: each person answers Diabetes? Yes / No / Not sure; after a Yes only, age when diagnosed, type as told and "Needed insulin within 2 years?"; and Hearing loss? for everyone. Brothers and sisters, children and a parent's brothers and sisters are one entry per person (the paper table, and the blank print, keep one row per relation, as before). "Me" answers the same questions.
- Side by side, for your ruling:
  - Type choices: **(built)** Type 1, Type 2, Gestational, Other / as told (opens a box for what the family was told, such as MODY, LADA or "borderline"), Not sure; or another list.
  - Follow-ups after Yes only: **(built)**; or always shown.
  - Hearing loss for everyone: **(built)**, because hearing loss in a mother's family is a MIDD clue with or without diabetes (Exeter MIDD, international); or only after a Yes.
  - "Needed insulin within 2 years?": **(built)** kept from the reviewed table (Diabetes Canada Ch 3's "time to needing insulin"); the owner's note listed the other questions only. Keep, reword, or drop.
  - One entry per person rather than one aggregated row per relation: **(built)**; this changes the instrument. Or keep one row per relation on screen too.
  - "Me" asks the same questions: **(built)**; or a different set.
  - At most 20 people at once (a note then says to add anyone else by hand on the paper): **(built)**; or another number.
  - On paper (added 2026-10-07, after verification; corrected after a second verification the same day): the "as told" box now takes at most 60 characters, with a count under it. Any tree of up to 20 people answered with the one-tap choices prints on one portrait page (Letter and A4, English and French). With a 60-character type written in for everyone, the sources and the page address move to a second page from 15 people in French and 17 in English on Letter (18 and 20 on A4); with 60 characters and no spaces, from 11 (French) and 12 (English) on Letter, and the last relatives follow from 16 and 17. Never more than two pages, never a person split. **(built)** accept that second page; or a shorter box; or allow fewer people. Details: know-your-type.md F.10.
- Applies to: KYT card 8 (`familyTree` in chapters-meta.ts; `figure.familyTree.*`).

**B57. The restock calculator's days-to-cover chips.** (NICE TO HAVE; owner)
- Built: None (picked at first), 30, 60 and 90 days, or Another number. They are periods to count, not device facts, so no register entry backs them.
- Options: **(default)** keep; or other periods (for example a program's coverage period).
- Applies to: YT card 6 (`coverPresets` in chapters-meta.ts).

**B58. Ostomy's supply list has no print button.** (NICE TO HAVE; owner)
- Question: the supply list (`ostomy-care/chapters/supply-list.tsx`) still renders ruled lines meant for paper, but nothing prints it since its button was removed; its old print rules were dead and are gone (note 2). The owner asked for "all of them" to print well.
- Options: **(default)** leave as is; or give it a print button on the shared print path (the lines would show again), or delete the leftover lines.
- Applies to: Ostomy chapter supply list.

**B59. French for the printed sheet and the new controls.** (NICE TO HAVE; French reviewer)
- The new words are machine-drafted: the printed sheet's header and footer (`ui.chapter.print`, both sites; never on screen, so no draft marker shows with them, as with the Sources lines), the family tree's controls and people (gate `familyTree`), the calculator's steppers and chips (gate `restockCalc`). Production shows the last two only once their gates open.
- Also: Ostomy's button says « Imprimez cette liste », Diabetes Care's « Imprimer la liste ». Align them? A wording choice for the French review; not changed.
- Applies to: fr.json.

**B60. Print on real phones and Safari.** (IMPORTANT; engineering)
- Measured on the dev server in Chrome's print path only (every sheet 1 page except the clues sheet, the school plan and the Rule of 15 in "A child" mode, 2 each, and the family tree's limit in B56; Letter and A4; English and French; corrected after verification, 2026-10-07). iOS Safari and Android Chrome open their print sheets without waiting; if either sends `afterprint` before it has laid the page out, it prints the whole page. Check one button in each, and Firefox and Edge on Windows, before launch.
- Also (QA, 2026-10-08, Chrome, Letter): every print button gives 1 page in English except the clues sheet (2, as built); the family tree with 6 relatives answered prints on 1 page in both languages. In French, Know Your Type's "After the birth: my reminder" puts only its sources and the page address on a second page (English: 1 page).
- Applies to: `_microsite/print/`.

**B61. Ostomy's funding checker: pills too?** (NICE TO HAVE; owner)
- Built: Diabetes Care's province question is 13 one-tap pills (note 3). Ostomy Care's keeps its drop-down: a port was built, then put back after verification (2026-10-07) so Ostomy's pages stay as they were in this round. The twin checkers now differ in this one control; province codes and results are the same.
- Question: should Ostomy's province question become the same pills?
- Options: **(default)** keep Ostomy's drop-down; or port the pills (the same `RadioRow` the Diabetes checker uses).
- Also (QA, 2026-10-08): this drop-down is the one control on either site that is not one tap, so the QA rates owner note 3 "partly done" until you rule. Not changed in the final fix pass: the default stands until you rule.
- Applies to: `ostomy-care/funding/funding-checker.tsx`.

**B62. "Pump supplies, by pump." stays on Your Tools card 13.** (NICE TO HAVE; owner)
- Question: note 7 removed the strip from the funding page only. Card 13 ("Your pump's supplies: what fits") keeps the same strip under the same line. Confirm that is wanted.
- Applies to: YT card 13.

### Added 2026-10-07, owner note 6 (the chapter timeline, bookmarks, phones)

What was built is in new-to-the-journey.md F.11 (engine and Ostomy twin, every chapter on both sites), with a one-line entry in each other chapter file. **Settled by the build:** the "Your path" timeline now follows the reader (a stop, a bookmark or a section heading clicked in it is the one highlighted, at every window size tried, in English and French); a deep link stays on its card while the page finishes building itself (corrected after verification the same day: it is put back each time the page changes size in its first 10 seconds, and every jump lands where the card settles once it has eased in); bookmarks are listed at the top of the timeline; and windows under 1024px wide (phones, tablets, half-screen laptops) have an "On this page" button with every stop, the bookmarks and the Continue point. These are the questions it left.

**B63. Which browser, device and window size did you use?** (IMPORTANT; owner)
- Measured in Chromium only: desktop windows 1100x620 and 1280x720 (and others in the diagnosis), a phone at 390x844 and a tablet at 900x1000, emulated. Safari (iPhone, iPad, Mac) and a real phone were not tried. If note 6 was seen on one of those, tell us which, so it is checked there.
- Applies to: every chapter page, both sites.

**B64. The "On this page" button on phones and tablets.** (NICE TO HAVE; owner)
- Built: a button at the bottom left ("On this page", "3 of 11", and the number of bookmarks when there are any), clear of Olivia at the bottom right. It shows only while the chapter's stops fill the bottom of the screen, and steps aside whenever a "Call 911" panel or a card's exit line is in the lower part of the screen, or a box is being typed in. It opens a sheet from the bottom: Continue (from the last visit), your bookmarks, then every stop by section.
- Options: **(built)** as above; or another place or wording.
- Also: the small dots under each section title stay (now one for every stop, including a section with a single stop). **(built)** keep them; or remove them on phones now that the sheet does their job.
- Applies to: every chapter page under 1024px wide, both sites.

**B65. French for the timeline and "On this page" words.** (NICE TO HAVE; French reviewer)
- Machine-drafted, navigation only (no health content; the stops' titles come from each page): `ui.chapter.onThisPage` « Sur cette page », `.onThisPageProgress` « {current} sur {total} », `.pathBookmarks` « Étapes marquées ({count}) » (Ostomy: « Arrêts marqués ({count}) »), `.pathBookmarksEmpty` « Touchez « Marquer » sur une étape pour la garder ici. » (Ostomy: « … sur un arrêt pour le garder ici. »), `.pathHere` « Vous êtes ici », `.closeSheet` « Fermer », `.removeBookmarkFor` « Retirer la marque : {title} ». Ostomy also gained `saveStopFor` « Marquer : {title} » and `stopSavedFor` « Marqué : {title} », and its counts now agree in number (« 1 arrêt », « 1 marqué »).
- Shown on /fr as navigation chrome, like the Sources words; no draft marker, because no module or clinical line is involved.
- Applies to: fr.json, `DiabetesCare.ui.chapter` and `OstomyCare.ui.chapter`.

### Added 2026-10-07, owner notes 8 and 4 and the typeface (overlap, product cards, Poppins)

What was built is in new-to-the-journey.md F.12 (shared stylesheet and store fonts, every chapter on both sites), with a one-line entry in each other chapter file, paths.md, landing.md and funding.md. **Settled by the build:** no big band title touches the callout under it, on a first visit or a return, on any chapter of either site, in English or French; on desktop and tablet every product card in a strip is the same size whatever the count, and a single product lies on its side with a small photo (phones unchanged); and the whole store is set in Poppins, as the owner decided ("Poppins across the whole store"). These are the questions it left.

**B66. Heading weight in Poppins.** (NICE TO HAVE; owner)
- Built: headings kept the weight they had in the serif, Poppins Regular (400); body text is Regular, labels and buttons Medium or SemiBold, as before.
- The brand guide shows headings in Poppins Bold or SemiBold. Options: **(built)** Regular headings, the lighter look the pages were designed with; or SemiBold (600) headings on the care sites, which reads closer to the brand guide but makes the very large band titles heavy (they would be reduced in size).
- Applies to: every heading on Diabetes Care, Ostomy Care, Liivv Health, Women’s Health and the home page.

**B67. The callout under a band’s big title.** (NICE TO HAVE; owner)
- Built: the callout ("The right supplies, used well" and its paragraph under "Checking your glucose") now has space above it and keeps its plain look.
- The stylesheet still holds a design for it that has not shown since 2026-09-28: a white "wash" card with soft corners and a shadow, slightly tilted. Options: **(built)** plain, with space; or bring back the card (without the tilt, which the fade-in animation removes anyway).
- Applies to: the first band of every chapter, both sites.

**B68. Product card size on desktop.** (NICE TO HAVE; owner)
- Built: 168px wide cards (photo about 144px), four to a row in a chapter, five on a path page; one product: a 544px horizontal card with a 160px photo.
- Options: **(built)**; or slightly larger cards (about 184px, three to a row in a chapter).
- Applies to: every product strip in a chapter, on a path page and on Ostomy Care’s chapters.

**For the other developer (not an owner question).** The fonts change reaches pages outside the care sites: the home page, Women’s Health and Clair Health now use Poppins too, and the store’s old theme file (`core/public/archive/diabetes-care-sections.css`, loaded on every page) still embeds its own Poppins (400, 500 and 700, plus italics) for the header, footer, account pages and product pages. Both are Poppins, so nothing looks different, but the old embedded copy could be dropped in favour of the one in `core/app/fonts.ts`. Nothing in Makeswift’s stored content sets a font (the theme fonts follow the code’s defaults); if an editor had picked Inter, DM Serif Text or Roboto Mono on a single element, that element now takes the font around it (Poppins), because those fonts are no longer loaded; worth a glance at any Makeswift page that was styled by hand.

### Added 2026-10-07, owner notes 9, 10 and 11 (the Diabetes Essentials shop, the brand row, kits, the pager)

What was built is in landing.md, the entry "Owner notes 9, 10 and 11 applied" (S1 to S10), and new-to-the-journey.md F.13. **Settled by the build:** Shop Diabetes Care is a filterable shelf like Ostomy Essentials, over the whole category (241 products; 205 on /fr, with no insulin counted or shown); Omnipod pods are under Omnipod (Insulet); insulin and glucagon are never a one-click add from any listing; the brand pills are links to the shop; all twelve kits are listed (owner: "Verified go ahead and publish"); the pager and product links open at the top of the page; the landing reads the whole catalogue, not the first 150. Decisions taken on the safe side and built, for the owner to confirm or change:

**B69. Medtronic-named cases and accessories: whose are they?** (IMPORTANT; owner or buyer)
- Built (safe default): these carry **no brand** in the shop and are found under "Works with: MiniMed": 4301 Medtronic Screen Film Kit, 4315 Medtronic Leg Pouch, 4333 Medtronic Activity Guard, 4381 Sport Case Medtronic, 4638 Medtronic Extra Belt for Leg Pouch, 4676 Neoprene Case from Medtronic, 4685 Silicone Skin Medtronic 5XX & 7XX, 4693 Holster for Paradigm series pumps, 4780 Medtronic Clip with Hinge, 4851 Belt Clip for Medtronic, 4946 Activity Guard for Paradigm insulin pumps.
- Question: which of these does Medtronic (MiniMed) itself make? Each one confirmed goes under the MiniMed brand (one line in `DIABETES_BRAND_BY_ID`, dc-ids.ts). Tandem’s t:case, t:holster, decal and screen protectors and the mylife YpsoPump accessories are filed under their maker, by their own product names.

**B70. The shop’s brand and maker names.** (NICE TO HAVE; owner)
- Built: the brand filter names makers where a product line has one: Ultra-Fine, Nano PRO and AutoShield are **embecta** (formerly part of BD, register `embecta-contact`), SafetyGlide, Vacutainer and the BD sharps container **BD**; insulins **Novo Nordisk**, **Lilly**, **Sanofi** and **Biocon Biologics** (Semglee, Kirsty); Bayer Microlet, Ketostix and Keto-Diastix **Bayer** (their names say Bayer); Dex4, Frio, Unifine, Oracle (EZ Health) by name; FreeStyle Libre and FreeStyle (Lite, Precision) as two brands. Confirm, or name the ones you want different.
- The store’s own brand records are still thin (234 of 268 products in the category have none, `Dex 4` and `Dex4` are two records, and there is no Dexcom, Abbott, Insulet, Tandem or mylife record). Creating them in BigCommerce (a store write) would give the store’s search and other category pages a real brand filter too; the Diabetes shop does not need it.

**B71. "In stock" on the shop.** (NICE TO HAVE; owner)
- Built: an "In stock" filter, from the storefront’s own flag. Most diabetes products are not stock-tracked in BigCommerce, so they always count as in stock: the filter does not mean "on the shelf today". Keep it, or remove it until stock is tracked.

**B72. The shop’s filters on a phone.** (NICE TO HAVE; owner)
- Built: as Ostomy Essentials, the filters sit above the products on a phone; "Works with" is closed until opened. With 22 product types and about 27 brands that is a long list (about 1,400px at 375px wide) before the first product. Options: **(built)** as Ostomy; or a "Filters" button that opens them in a panel on phones (both shops).

**B73. Logo files still to supply, and Contour’s tagline.** (NICE TO HAVE; owner)
- Built: logos for Omnipod, MiniMed, Tandem, OneTouch and Contour (the six files approved 2026-10-07, logo-sources.md); Dexcom, FreeStyle Libre, mylife, Accu-Chek and FreeStyle are names in matching pills. Supply those files (SVG, or PNG at least 112px high) and each becomes a logo with one line in `BRANDS` (landing-meta.ts).
- `contour.png` carries the "Evolving with you" tagline, so it is shown taller; a version without the tagline from Ascensia would sit better in the row. `insulet.png` is on file but not shown: the row is by shopping brand, and Insulet’s pods are the Omnipod pill.
- To confirm (verification, 2026-10-08): five of the six files are shown, and the Omnipod one as a trimmed copy (`omnipod-trimmed.png`: the press-kit file’s white margins cut away and scaled down, artwork unchanged; logo-sources.md). Omnipod’s press terms say the logo is not to be altered. Options: **(built)** the trimmed copy; or show the untouched `omnipod.png` (its mark then sits small in the pill, or the pill grows); and say whether `insulet.png` should appear anywhere (for example beside Omnipod as "by Insulet").

**B74. The register’s "Ypsomed (mylife)" publisher name.** (NICE TO HAVE; owner)
- The brand pill now says mylife (confirmed on mylife Diabetes Care Canada’s own "About us" page, `mylife-about-ca`). The publisher name shown under Your Tools’ pump picker sources (`ypsomed-mylife-loop`) still reads "Ypsomed (mylife)". Change it to "mylife Diabetes Care" (one line in sources-meta.ts), or keep it until the pump picker is next reviewed.

### Added 2026-10-08, final fix pass for the owner review of 2026-10-07

What was fixed is in the 2026-10-08 change logs: every-day-living.md F.13, know-your-type.md F.13, this-might-be-you.md F.13, staying-safe.md F.16 (Baqsimi is "View product" on its card) and new-to-the-journey.md F.14 (engine and store: shelves and wishlists never one-click-add insulin or glucagon, the timeline re-centres after a group opens, product descriptions in Poppins, the phone header, the Ostomy landing’s /fr links). These are the questions it left.

**B75. Names kept in the prose as the subject, not as a credit.** (NICE TO HAVE; owner)
- Kept, each with its source in the card’s Sources disclosure too: the airport screening authority where its own rule is stated ("The Canadian Air Transport Security Authority (CATSA) says a syringe needs its needle guard on…", Your Tools 8.items.4; "CATSA lets insulin, juice and gels through security above the 100 mL limit…", Your Tools 11.items.7); Canada’s food guide as the resource the reader uses (New to the Journey 4.items.1–2, Every Day Living 1.items.2); "Dexcom notes that not all connections are available in Canada" (a maker on its own product, Your Tools 4 and 13). Changed: "CATSA suggests keeping medicine in its labelled packaging" is now "Keep medicine in its labelled packaging" (Every Day Living 6.items.6).
- Ostomy Care’s funding page keeps "…and the CRA’s own guidance says so" (the CRA decides the credit; its page is in the funding page’s citations).
- Options: **(default)** keep these as subjects; or state each plainly ("At Canadian airport security, a syringe needs…", "Fill half your plate with vegetables and fruit…"), leaving the name to the Sources line.
- Applies to: fr.json and en.json, the keys above.

**B76. Ostomy Care: sources in the element (owner note 1), and a conflict found while checking.** (IMPORTANT; owner and NSWOC)
- Ostomy cards have no Sources line of their own (only the recovery map’s stages and the page’s "Where this comes from" list), and Everyday Liivving still credits bodies in the prose: card 10 "CATSA states that ostomy paste tubes must be 100 mL or less and travel in your clear 1 L bag", "CATSA says you can request a private screening room", "Ostomy Canada is explicit that the pouch will not blow up"; card 11 "Ostomy Canada suggests roughly 15 to 30°C", "Coloplast’s instructions for use state the product must not be stored under freezing conditions"; card 14 "Ostomy Canada also advises caution" (French: « précise », « recommande »).
- Not rewritten: none of these is in Ostomy’s register, and the name in the sentence is today the only source the reader sees, so removing it before a card can show its sources would leave the claim unsourced.
- Checked on 2026-10-08 (Ostomy Canada, "Travel Tips", ostomycanada.ca/ostomy-lifestyle/travel-tips/, no date): it supports "The pouch will not "blow up" because the cabin is pressurized"; it says to keep supplies "in a cool spot like in a cooler (not in the trunk)" and gives **no 15 to 30°C range**; and on paste it says "Ostomy paste tubes may exceed the liquid/gel maximum but must be presented to screening officers separately", which **conflicts** with card 10’s "must be 100 mL or less and travel in your clear 1 L bag". It does not mention a private room. CATSA’s own ostomy page and Coloplast’s instructions for use were not read.
- Side by side, for your ruling: card 10’s paste rule (100 mL, in the 1 L bag) / Ostomy Canada’s Travel Tips (may exceed the limit, shown separately).
- Options: **(default)** leave Ostomy’s wording until its cards get Sources lines (the Diabetes chip ported to Ostomy, each source opened and registered first), then state the facts plainly; or remove the unconfirmed 15 to 30°C now.
- Applies to: `OstomyCare.chapters.everyday-liivving.categories.10, 11, 14`, Ostomy funding `dtcPoint1`.

**B77. Supplements and foot creams on the "Nutrition and wellness" shelf.** (IMPORTANT; owner and nurse)
- Question: Diabetes Essentials’ "Nutrition and wellness" type lists blood-sugar supplements (AOR GlucoSupport, CanPrev Blood Sugar Support) and diabetic foot-pain creams, on a site backed by certified educators whose foot card says not to treat foot problems yourself.
- Options: **(default)** keep (they are in the store’s diabetes category); or leave supplements and symptom creams off the Diabetes shelf (one rule in `shop-classify.ts`).
- Applies to: the Diabetes Essentials shop.

**For engineering (not owner questions).** The animated subscription demo (`components/subscription-flow-demo`) is English on every /fr page that shows it (both care landings, Women’s Health, the home page). A hydration warning on the two Essentials shops (React-made ids on Show / Sort by and the card forms) was seen in the 2026-10-08 QA at 1280 and 375 (and a "Hydration failed" once on the French landing), during the hour the dev server was restarting and serving a corrupt manifest. After the repair it did not come back in 18 fresh loads (both shops and the French landing, 1440, 1280 and 375 wide, twice each, 2026-10-08); not fixed in code, as no cause was found. Watch for it on the preview build.

**For operations (store fixes, not owner questions).** "Nano Pro Needle Pen" (4913) shows CA$0.00 on the shelf. The three English Apidra listings still answer 404 (B3). Both are BigCommerce fixes. Found by the 2026-10-08 sweep of all 241 shelf products: "Omnipod Star Patch" (8096, `/omnipod-star-patch`, the shelf’s first card) answered 404 on the local preview although the store resolves its address (likely a stale route cache; check on the live site), and "One Touch Verio Test Strips" (7895) is still visible in the category although its address now redirects to the merged OneTouch Verio listing (hide 7895 in BigCommerce, or the shelf keeps a card that opens another product).

---

## Part 3. Held for want of a source (summary by theme)

Each file's section E has the full rows and the wording ready to release.

- **Symptoms and everyday signs.**
  - Signs of a low (SS card 1, NTJ card 5) and of a high (SS card 6).
  - Hypoglycemia unawareness, overnight lows and HHS (SS).
  - Sleep and sleep apnea (EDL H7).
  - A step-by-step finger check (YT).
  - Only CPG text written for professionals, or nothing, covers these.
- **Emergency tiers with no registered source.**
  - Signs of a stroke (EDL H1, card 11). Chest pain on exertion with 911 (H2) was released on 2026-10-05, when Heart and Stroke's "Signs of a heart attack" was registered; its wording is still yours to confirm (C3).
  - ~~The foot same-day tier and the eye emergency tier (EDL H3, H4).~~ Released 2026-10-06 (C10), on `wounds-canada-foot-emergency` and `cnib-floaters-and-flashing-lights`.
  - Registering Heart & Stroke's stroke-signs page would release H1.
- **Industry-only facts (policy 4).**
  - Every FIT-only line: a pump high with nausea, bedtime set changes, 4 mm "safest", set timing, and lipohypertrophy dosing (they stay held, C14). The U-200/U-300 line was released 2026-10-06 on Health Canada monographs (C7).
  - Makers' support lines and insurance helplines.
  - Sensor wear times for Libre 2, G6 and Guardian 4; readers and apps; G7 "can't be restarted".
  - Meter, strip and lancet matches; pump reservoir, cartridge and set names; whether Omnipod 5 and DASH pods are interchangeable.
  - Libre with Omnipod 5; Simplera Sync; Tandem Mobi. (G6 with t:slim X2 was confirmed by Tandem’s Canadian user guide on 2026-10-06, C42.)
  - UncoverT1D’s free test and metreleptin. (Released 2026-10-06: how long teplizumab delays type 1, from Canada’s Drug Agency and the Health Canada monograph, C26; UncoverT1D as Breakthrough T1D’s pointer only, C36.)
- **Government pages not yet registered.**
  - Funding rows still held (most were released on 2026-10-06 in the funding step, funding.md G-26 to G-59: ODB CGM, Alberta pumps, CGM and private-first, Quebec and Nova Scotia sensors, PEI pumps and pharmacare, NL strips, Yukon, BC supplies, CRA medical expenses, the DTC digital application, NIHB billing and VAC strips):
    - Ontario: the ODB strips prescriber line (F-1).
    - SK sensors (F-12); the PEI Glucose Sensor Program (F-20); Nunavut (a readable list of specified conditions).
    - MB: buying a sensor by receipt (F-13).
  - Others: Health Canada recalls (the DPD monographs for insulins stronger than U-100 were registered 2026-10-06, C7); ISC NIHB eligibility; Manitoba's paediatric pump program; provincial sharps routes outside HPSA; provincial driving rules; home care and medication reviews.
- **Clinical detail not read in full, or abstract only.**
  - Type 3c detail and the pancreatic-cancer clue (Hart 2016 failed the check). They stay held (C34); the Canadian Cancer Society’s "Risks for pancreatic cancer" is recorded as the candidate source for the clue.
  - Ketosis-prone type 2; lipodystrophy checks; how fast checkpoint-inhibitor diabetes comes on.
  - Ch18 antipsychotic monitoring intervals; moving from children's to adult care; Ch36 vaccines. (Released 2026-10-06: a child's eye and kidney checks, from Ch34 and Ch29 2025, C37.)
  - The 2026 ADA/EASD "40% first treated as type 2" figure.
  - ~~Prediabetes: 5% weight loss and heart risk (F.1, F.2).~~ Released 2026-10-06 (C38), with F.1, F.2 and DC's "Prediabetes Treatment" registered.
  - Neonatal "about 40%" (a 404 page); a Canadian MODY lab; the ADDAM study.
- **Support, community and rights.**
  - Peer support lanes; Breakthrough's newly-diagnosed hub, Bag of Hope, caregiver guide contents and camps.
  - The Diabetes@School care plan template; "300 extra decisions a day".
  - Kids Help Phone, Hope for Wellness and Wellness Together; DC's mental health directory link.
  - Lower-risk cannabis guidelines.
  - Employment, human rights and insurance positions.
  - "Many education programs are free".
- **Liivv facts waiting on the owner.**
  - ~~The CDE phone number; plain packaging; how prescriptions reach Liivv.~~ Released 2026-10-06 (B9, B29, B14).
  - ~~The Bayshore relationship line~~ (released 2026-10-06, B15) and any manufacturer payments.
  - Receipts; direct billing; pay-later; the nurse check on kits.
  - The checker's privacy promise; "what CDE stands for" (needs `cdecb-home` registered).
- **Held for scope, not source** (these stay out unless you rule otherwise): drug-class lists, doses and insulin adjustments (exercise, time zones, after birth), Ch37 drug lines, the "Heart protection tool", and long-term-care deprescribing.

---

## Part 4. Pre-publish checks

These are facts to re-check, not rulings.

1. **Glucagon forms.** Confirm in Health Canada's Drug Product Database that nasal and injectable glucagon are marketed in Canada and that no auto-injector is (SS 1).
2. **CPS 2015 school statement.** Confirm in the CPS statements index that it has not been retired. If it has, follow TMBY M9's fallback (SS 2, TMBY M9 and check 1).
3. **DC "Alcohol and diabetes" PDF (04/18).** Confirm it is still DC's current sheet (SS 3, EDL D7). Still served on 2026-10-06 (code 111025); card 4 now says it is from 2018 (C16).
4. **CPG Ch36 (pregnancy).** Confirm no updated chapter has appeared (kept by C23; TMBY card 1's note says the guideline is from 2018 and being updated). Re-open the PHAC folic acid page (`phac-folic-acid`) before publishing too (C19). Also check whether the CJD addendum to Ch41 changes the automated-system line (TMBY M1 and check 4, PATHS Q15).
5. **NIHB updates page.** Confirm it is still dated 2026-07-30 or later and that the 800-strip limit holds (TMBY 2).
6. **Quebec pump program page (2021).** Re-check it quarterly, and look for a newer RAMQ or MSSS page (TMBY 3, FUND D-19).
7. **Know Your Type.**
   - The `canscreen-t1d` launch banner on the publish day.
   - Tzield coverage, if publishing is delayed; and that Breakthrough T1D still points to UncoverT1D (C36).
   - That Ch18 2023 doesn't supersede the antipsychotic passage, and a visual re-read of Table 4 (KYT 1, 2, 3 and 8).
8. **Device pages on the publish day.**
   - The Libre 3 Plus recall notice: drop it if it is gone. Since 2026-10-05 it shows wherever Libre 3 Plus is named (the sensor picker, the pump picker's sensor lists and the restock calculator's preset), from one entry in `device-pairings.ts`, so dropping it there drops all three.
   - Dexcom's pairings. Its Omnipod 5 footnote is out of date.
   - Whether Omnipod Canada now lists a Libre sensor.
   - Tandem: Control-IQ+, "Dexcom CGM sold separately" and the four-year warranty; and that the Canadian user guide (`tandem-tslim-x2-ciq-user-guide-ca`) still names the Dexcom G6 and G7 (C42).
   - Whether Simplera Sync is on sale.
   - Dexcom G7 15 Day (C31): Health Canada authorized it 2026-07-13 (Dexcom's investor release); not yet for sale in Canada. Recheck availability and confirm the authorization on MDALL before listing it as a separate 15-day sensor in the restock calculator and the sensor picker (no grace period).
   - (YT 3–7.)
9. **TrialNet age limits:** 2–45 for immediate relatives and 2–20 for others (PATHS row 39).
10. **Funding page.** (Built 2026-10-06; brought up to date the same day in the funding step.)
    - Run `node core/scripts/check-funding-sources.mjs` on the publish day; it must exit 0 (or every CHANGED page re-read), and re-read the four yukon.ca pages in a browser (README.md).
    - The NL pump and CGM programs' own pages (D-20).
    - ~~The Monitoring for Health 2026–27 age rule (D-21).~~ Done 2026-10-06: ontario.ca's line is on the card.
    - ~~The ADP "lost or misused pump" line (D-22).~~ Done 2026-10-06, in the page's own words.
    - ~~G7 on ODB: use Jul 31, 2025 (D-8).~~ Done 2026-10-06 (`on-odb-cgm`).
    - The BC Plan NP dates and the MB, PEI and YT agreements. DC's comparison tables are dated Dec 2024 to Jul 2025 (LAND D20).
11. **Register and locator fixes.**
    - `sources-review.ts` notes: SS A.1, NTJ A.1 and the YT A.1 locators (no "6 mm"; G7 "up to 10 days"; MiniMed; Dexcom pumps and pens).
    - KYT register titles (5) and locators (7).
    - FUND D-12 locators.
    - LAND F1, F2 and F4. Done 2026-10-05: F2 `napra-nds-insulin` registered (fetched: "Insulin", Schedule II, approved September 23, 1998); F4 locator fixes applied to `dc-comparisons-by-province`, `hpsa-returning-medical-sharps` and `cdecb-find-a-cde`. Still open: F1 `cdecb-home` is not registered, because the copy record gives no title for it ("the home page title as printed"). Record the title from the page, then register it; that releases LAND E13 and fixes NTJ 11.items.1.
    - PATHS F.1–F.4. Done 2026-10-06: F.1 and F.2 registered (C38); the Ch29 and Ch36 notes of F.4 are in `sources-review.ts` (C28, C37). F.3 and the rest of F.4 are still open.
    - Proposed registrations: FUND F-2, F-3 and F-10 (launch blockers), plus the rest of FUND F; the ISC eligibility page (B2). Done 2026-10-06: the DPD monographs and their companions (C7), `hc-infant-botulism` (C18), `dq-low-blood-sugar-leaflet-2025` (C13), `wounds-canada-foot-emergency` and `cnib-floaters-and-flashing-lights` (C10); then `phac-folic-acid` (C19), `dc-eye-damage-retinopathy` (C24), `cda-amc-tzield-recommendation-2026` and `hc-dpd-tzield-monograph-2026` (C26), `dc-cpg-ch4-screening`, `dc-cpg-ch5-reducing-risk` and `dc-prediabetes-treatment` (C38), `dc-diabetes-in-canada` (C41) and `tandem-tslim-x2-ciq-user-guide-ca` (C42), with French titles and addresses added to `ccsa-alcohol-guidance-2023`, `cos-diabetic-retinopathy` and `bt1d-tzield-update-2026`.
    - Re-check the French Wounds Canada link (`wounds-canada-foot-emergency` `hrefFr`, a token link) before publishing and on the recheck schedule (C10).
    - Re-cite Holt across KYT 6, 7, 8, 9 and 13 after F.3 (PATHS Q21).
12. **Cross-page consistency.**
    - ~~KYT 1.items.1 says "about 10%". Change it to "5 to 10%" (PATHS Q20). Now a clinical choice: C41.~~ Done 2026-10-06 (C41).
    - YT's "side by side" DC comparison needs a date caveat.
    - NTJ 11.items.1's CDE® citation needs the same source as LAND E13.
    - Align KYT with the landing's "hard to tell at first" clause, if wanted.
    - ~~EDL D15's note is stale: the glucagon-alcohol line is already removed (LAND D21, C2).~~ Done 2026-10-06: C2 restored the line in Ch14 2023's wording on SS card 4 only, and D15 is closed.
13. **Engine and navigation.**
    - ~~`chapters-data.ts` still numbers NTJ "03" and EDL "02".~~ Done 2026-10-06: the older chapter pages (`chapters-data.ts`, `chapter-page.tsx`, `chapter-page.css`) are deleted; every Diabetes chapter URL is an engine chapter or a path page.
    - Check that the NTJ card 1 strip renders both 9-8-8 and 911, and that the card 3 ruler renders above the take-in card.
    - Done 2026-10-05: YT card 14's note now links "On a pump: an unexplained high" to SS card 9 (`staying-safe#card-9`), with `<link>` tags around the existing words in EN and FR.
    - ~~Add `less-common-types` to the sitemap, the landing chips and the five-path rail (PATHS Q14).~~ Done 2026-10-06: in the sitemap (EN), the five-path rail and the header menu (under Know Your Type). The landing's "Other" chip still opens KYT card 6 (LAND D12).
    - ~~Retire the old `PATH_CHAPTERS` copy ("pump-adjacent shopables", "CarePack", "Olivia", "Available in Ontario"), after confirming nothing else links to it (PATHS Q13).~~ Done 2026-10-06: nothing in core/ imported or linked it; it is deleted with the older chapter pages.
    - A card-level hold, if TMBY card 6 is to be hidden (B1).
14. **French.** French copy ships only after each review gate is signed off: the landing gate, the figure gates (`checkupYear`, `meterMatch`, the pickers) and the `shelf` gate on /fr.
    - For the French reviewer (full-site review, 2026-10-06): the machine draft says "personnes diabétiques" throughout (landing, New to the Journey, Know Your Type, path pages). Prefer "personnes atteintes de diabète" or "personnes vivant avec le diabète".
    - Also new on 2026-10-06, all machine-drafted and awaiting the same review: the funding checker's province forms (`funding.provinceForms`, "en Alberta", "pour l'Ontario"…), its new result cards (`noneFit*`, `pumpInsulinOnly*`), "Pas d'entente sur l'assurance-médicaments nationale {provinceIn}", "Gérer les abonnements", "À partir de {price}", "Retour à l'étape {n}", and every French line in the 2026-10-06 change logs.
    - As built 2026-10-05, the landing follows the Ostomy precedent: its French prose ships on /fr flagged as machine translated by the governance block, the `landing` gate decides only the draft marker on previews, and the `doors` gate keeps the situation doors off /fr in production, leaving only the emergency route (in This Might Be You's approved `urgentExit` words). If the owner wants the landing's French held back entirely until review, that is a new rule to decide (the chapters ship French the same way).
15. **Ad signals.** Commit and deploy `ad-signals.ts` and `sensitive-products.ts`, and pass the preview checks before trust item 4 or FAQ 2 goes live (B4).
