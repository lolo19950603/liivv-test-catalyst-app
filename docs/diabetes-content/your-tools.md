# 03 · Your Tools — chapter copy, after source check (DiabetesCare.chapters.your-tools)

Version of 2026-10-05. It applies the source check in `content/your-tools.verify.md` to `content/your-tools.draft.md`. Not compiled, not in the repo. The shape follows the `staying-safe` entry in `diabetes-care/chapters/chapters-meta.ts` and its messages at `DiabetesCare.chapters.staying-safe`; the voice follows that chapter and `OstomyCare.chapters.*`.

Ground rules applied:
- **SourceIds come only from `diabetes-care/chapters/sources-meta.ts`.** Every id cited below was checked against the register. No new id is used. Pages the check suggested (Health Canada Drug Product Database monographs, Health Canada Recalls and Safety Alerts) are not registered, so the facts that need them are **HELD** (section E), not cited.
- **Every "Not confirmed" and "Partly" row in the check is fixed** (reworded to the page, re-cited, or HELD), and every safety, scope and terminology finding is applied or recorded as a ruling. Section F lists each change. The four C† pages are now saved word for word in `scratchpad/src/yt/` and were re-read by the check, so every former **C†** row is now **C**.
- **Shop strips since 2026-10-06 (B21; F.9), but no Subscribe & save line and no kits.** Brand and model names appear only where they state a compatibility or label fact from a registered maker or government page: inside the three pickers, the restock calculator's presets (which read the sensor picker's data), and card 13's open questions. Card prose and the band name no brand (the NIHB sensor line and the calculator's grace-period line were made brand-free after the check).
- **No mention of Diabetes Express**, and no link to it.
- **Retail scope:** no doses, titration, treatment choices or drug classes. "Dial the dose your team has set" names no number; the priming amount is left out. The Ch41 line on automated insulin delivery is a guideline's device preference and stays a ruling (R21).
- **Nothing from FAIL sources** (Hart 2016; ADA 2026 summary of revisions). **Nothing from the FIT guide** (industry-run, R9).
  - **"Never draw U-200/U-300 from a pen into a syringe" is HELD** (URGENT ruling R17). No registered non-industry source says it. A Health Canada–approved product monograph does (Toujeo patient information), but no monograph is registered. Until R17 is settled, an always-visible ask-first line stands in its place (card 8 note, `noteVisible`).
  - **4 mm and skin-lift lines** rest on Diabète Québec, a registered Canadian patient body that publishes them under its own name, with Diabetes Canada's "shorter, thinner needles" alongside. DQ adapted them from FIT 2015, so the nurse rules on it (R18).
- **No "International guidance" label is needed.** Every source cited is Canadian (government, guideline, patient body) or a Canadian maker page. CPG Ch9's time-in-range table adopts the International Consensus but is cited through the Canadian CPG.
- **No red-flag block of its own.** The urgent exit is the signpost to `staying-safe#red-flags`. No card carries a 911 or same-day line, so no card is `urgentContent`.
- **Fully held cards** (not in CHAPTER_META or the messages; section E): Skin and adhesives (no Canadian source), and Your device maker's 24/7 line (maker pages only, as Staying Safe ruled).

---

## A) META OUTLINE

### A.1 SourceIds used (all exist in `sources-meta.ts`)

| Card | SourceIds |
|---|---|
| 1 Choosing a meter | `dc-checking-blood-sugar`, `dc-technology-and-devices` |
| 2 Strips, lancets and control solution | `dc-checking-blood-sugar`, `dc-technology-and-devices`, `dc-getting-started-with-insulin`, `hpsa-returning-medical-sharps`; held picker: `ascensia-support`, `lifescan-verio-reflect` |
| 3 Your meter lesson | `dc-checking-blood-sugar`, `dc-technology-and-devices` |
| 4 Sensors: which pairs with what | `dc-technology-and-devices`, `dc-checking-blood-sugar`; picker: `dexcom-g7-wear-time`, `dexcom-pumps-and-pens`, `dexcom-canada`, `omnipod-canada`, `ypsomed-mylife-loop`, `abbott-freestyle-libre-3`, `abbott-freestyle-canada`, `isc-nihb-updates` (review-only `listedBy`: `bc-diabetes-pins`) |
| 5 Wearing a sensor, and time in range | `dc-checking-blood-sugar`, `dc-cpg-ch9-monitoring-2021`, `bt1d-time-in-range`, `dc-technology-and-devices` |
| 6 Sensor restock calculator | `isc-nihb-updates`; presets: `dexcom-g7-wear-time`, `abbott-freestyle-libre-3` |
| 7 Pen needles | `dc-technology-and-devices`, `dc-getting-started-with-insulin`, `dq-all-about-injections` |
| 8 Syringes, and insulin strength | `dc-technology-and-devices`, `dc-getting-started-with-insulin`, `catsa-diabetic-supplies` |
| 9 Giving an injection | `dc-getting-started-with-insulin`, `dq-all-about-injections` |
| 10 Choosing and moving your sites | `dc-getting-started-with-insulin`, `dq-all-about-injections` |
| 11 Keeping insulin safe | `dq-all-about-injections`, `dc-getting-started-with-insulin`, `dc-air-travel`, `catsa-diabetic-supplies` |
| 12 Pumps and AID | `dc-technology-and-devices`, `dc-cpg-ch41-t1d-lifespan-2025` |
| 13 Your pump's supplies | `dc-technology-and-devices`; picker: `minimed-canada`, `tandem-canada`, `tandem-support`, `ypsomed-mylife-loop`, `omnipod-canada`, `dexcom-pumps-and-pens`, `isc-nihb-updates` |
| 14 Pump backup and set changes | `dc-technology-and-devices`, `dc-managing-emergency-situations`, `hpsa-returning-medical-sharps`, `bt1d-dka-and-ketones` (note's pointer) |
| Band | `dc-comparisons-by-province`, `isc-nihb-updates`, `cra-dtc-life-sustaining-therapy`, `cra-rc4064-2025` |

Changed by the check: `tandem-canada` no longer backs any named Dexcom pairing (it names no model); it backs only the new fact "works with a Dexcom sensor, sold separately". `minimed-canada` no longer backs Guardian 4 ↔ 780G (its page no longer names Guardian 4); that pairing now rests on `isc-nihb-updates`. `ypsomed-mylife-loop` now also backs the G6 → G7 notice. `bt1d-dka-and-ketones` added to card 14 for its pointer to Staying Safe.

Not cited, on purpose: `fit-canada-pocket-guide-4th-ed` (R9), `minimed-simplera-licence-2026` (press release; Simplera Sync held), `dexcom-technical-support`, `omnipod-contact` (24/7 lines held), `abbott-libre-3-plus-launch` and similar launch pages (no fact needed).

**Register bookkeeping for the build (repo files, not edited here):**
- `sources-review.ts` locators to correct:
  - `dexcom-g7-wear-time`: the page says "indicated to be worn for up to 10 days, with a 12-hour grace period at the end". "No restarts" is not on it; remove it from the locator.
  - `dc-getting-started-with-insulin`: "6 mm needle at 90°" is not on the page. It says 90° with a quick smooth motion, and 8 or 12 mm may need a lift or 45°. Add "Try to use shorter needles with a smaller thickness".
  - `minimed-canada`: the home page no longer names Guardian 4 and has no "available later this year" text; it now headlines "Simplera Sync sensor now licensed by Health Canada". Add the Extended infusion set line ("Use exclusively with the Extended reservoir").
  - `dexcom-pumps-and-pens`: add "* Not all connections are available in Canada" on the t:slim X2 line, and that it names only G7 for t:slim X2.
  - `tandem-canada`: "Dexcom CGM sold separately" (no model named). `tandem-support`: "Four-Year Limited Warranty".
  - `ypsomed-mylife-loop`: add Dexcom's G6 phase-out ("For now, your Dexcom G6 remains fully supported") and the 1.6 mL (160 U) U-100 cartridge.
  - `hpsa-returning-medical-sharps`: "CGM applicators with needles"; collection locations are pharmacies, vet clinics and dispensaries.
  - `isc-nihb-updates`: "Guardian Link 4 Transmitter Kits for the 780G… and Guardian Sensor 4"; the 14-per-6-months and 800-per-100-days limits are for "clients managing diabetes with insulin".
- Add the re-read facts to the locators of `dc-checking-blood-sugar`, `dc-technology-and-devices`, `dq-all-about-injections`, `ascensia-support` and `lifescan-verio-reflect` (pre-publish check 1, now done in `src/yt/`).
- To release held items: register Health Canada Drug Product Database product monographs for the U-200/U-300/U-700 insulins (R17), and Health Canada Recalls and Safety Alerts (recall pointer).

### A.2 Changes the outline needs outside this entry (listed, not made)

1. **`ui.chapter.groups`** (en + fr): add `checking: "Checking your glucose"` and `gettingInsulinIn: "Getting insulin in"`.
2. **`DiabetesFigureMeta`** (chapters-meta.ts): add four site figure kinds (section G): `meterMatch`, `sensorPicker`, `pumpPicker`, `restockCalc`. A fifth, `rotationMap`, is optional (G5).
3. **Review gates and site config:** each new kind needs a French review gate in `GATED_KINDS` (review-gates.ts) and an entry in `DIABETES_SITE.kinds` (site.ts). The four pickers and the calculator are `module` (they have controls) and `fullWidth`; `rotationMap` is not a module. None restyles its card.
4. **A Hold type.** The Diabetes meta passes no `Hold` today. Add `type DiabetesHold = 'makerOnlyFacts' | 'meterData'` and pass it as the Hold generic to `FigureMeta` / `CategoryMeta` / `ChapterMeta` (the engine's `Holdable` already takes it). `meterMatch` is `held: 'meterData'`; its words go into `HELD_CLIENT_MESSAGES` (held-messages.ts), whose `HeldMessageGroup.kind` widens to take site kinds. `makerOnlyFacts` is used only if R16 is ruled (b).
5. **No cross-chapter note link exists in the engine.** Card 14's note points to Staying Safe card 9 in words, kept visible (`noteVisible`). A real link would need a new `CategoryMeta` field (for example `noteLink: { chapter, card }`); that is an engine change, so it is listed for the build, not used here. The chapter's urgent-exit signpost (which does link to Staying Safe) is on the same page.

### A.3 Proposed CHAPTER_META entry

```ts
  /*
   * 03 · Your Tools. Copy: DiabetesCare.chapters.your-tools, after the source
   * check of 2026-10-05. The product-support core, with product placements on
   * hold: understanding and choosing tools, what works with what, and safe
   * technique. No card places a product. Brand names appear only in the
   * pickers and the calculator's presets, as compatibility or label facts from
   * registered maker or government pages, each with its basis (ruling R16).
   * The urgent exit is Staying Safe's #red-flags block.
   */
  {
    slug: 'your-tools',
    num: '03',
    chapterWord: 'three',
    heroImage: `${IMG}/hero.png`,
    accent: '#c9dcef',
    rail: false,
    majorSections: true,
    /* Exactly two segments: checking your glucose, and getting insulin in. */
    startHere: { groups: ['checking', 'gettingInsulinIn'] },
    /* No red-flag block of its own: the signpost points at Staying Safe's. */
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Checking your glucose ---------- */
      {
        // 1 Choosing a meter. No figure; the meter lesson card (3) is the printable.
        image: `${IMG}/chapter-type2.png`,
        group: 'checking',
        ask: 'pharmacist',
        sources: ['dc-checking-blood-sugar', 'dc-technology-and-devices'],
      },
      {
        // 2 Strips, lancets and control solution. The meter picker is HELD
        // (R16, G1): no registered page says which strips go with which meter.
        // The card's own sentences stand without it.
        image: `${IMG}/chapter-essentials.png`,
        group: 'checking',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'meterMatch',
            held: 'meterData',
            families: [
              {
                id: 'contourNext',
                meters: ['Contour Next Gen', 'Contour Next One', 'Contour Next EZ'],
                strips: null,
                lancing: null,
                control: { product: 'Contour Next control solution', fact: 'onlyThisOne', sources: ['ascensia-support'] },
              },
              {
                id: 'oneTouchVerio',
                meters: ['OneTouch Verio Reflect'],
                strips: null,
                lancing: { inBox: ['OneTouch Delica Plus lancing device', 'OneTouch Delica lancets'], sources: ['lifescan-verio-reflect'] },
                control: null,
              },
              // Accu-Chek and FreeStyle meters: no registered page (section E).
            ],
            checkedOn: '2026-10-05',
          },
        ],
        sources: [
          'dc-checking-blood-sugar',
          'dc-technology-and-devices',
          'dc-getting-started-with-insulin',
          'hpsa-returning-medical-sharps',
        ],
      },
      {
        // 3 Your meter lesson. Diabetes Canada's own "ask your provider" list,
        // as a printable card with four blank lines to fill in at the pharmacy.
        // Also the no-JS and no-data stand-in for card 2's picker.
        image: `${IMG}/care-chat-main.png`,
        group: 'checking',
        ask: 'educator',
        figures: [{ kind: 'takeIn', fields: 4 }],
        sources: ['dc-checking-blood-sugar', 'dc-technology-and-devices'],
      },
      {
        // 4 Sensors: which pairs with what. The ecosystem picker; its data is
        // shared with cards 6 and 13. Each pairing names who confirms it.
        image: `${IMG}/chapter-type1.png`,
        group: 'checking',
        ask: 'pharmacistCde',
        figures: [
          {
            kind: 'sensorPicker',
            sensors: [
              {
                id: 'dexcomG7',
                name: 'Dexcom G7',
                // "Up to 10 days, with a 12-hour grace period at the end". No restart claim.
                wear: { upToDays: 10, graceHours: 12, sources: ['dexcom-g7-wear-time'] },
                pumps: [
                  // Tandem's page says only "Dexcom CGM sold separately".
                  { pump: 'tslimX2', basis: 'sensorMakerOnly', caveat: 'notAllInCanada', sources: ['dexcom-pumps-and-pens'] },
                  { pump: 'omnipod5', basis: 'twoMakers', sources: ['dexcom-pumps-and-pens', 'omnipod-canada'] },
                ],
                // Review only: Canadian programs that list it. Never rendered as coverage.
                listedBy: ['isc-nihb-updates', 'bc-diabetes-pins'],
              },
              {
                id: 'dexcomG6',
                name: 'Dexcom G6',
                wear: null, // HELD: not on any registered page
                pumps: [
                  { pump: 'omnipod5', basis: 'twoMakers', sources: ['dexcom-pumps-and-pens', 'omnipod-canada'] },
                  { pump: 'mylifeLoop', basis: 'twoMakers', sources: ['dexcom-pumps-and-pens', 'ypsomed-mylife-loop'] },
                ],
                // Dexcom names only G7 for t:slim X2; Tandem names no model.
                notConfirmed: ['tslimX2'],
                notice: { key: 'g6ToG7', sources: ['dexcom-canada', 'ypsomed-mylife-loop'] },
                listedBy: ['isc-nihb-updates', 'bc-diabetes-pins'],
              },
              {
                id: 'libre3Plus',
                name: 'FreeStyle Libre 3 Plus',
                wear: { upToDays: 15, fromAge: 2, sources: ['abbott-freestyle-libre-3'] },
                pumps: [{ pump: 'mylifeLoop', basis: 'pumpMakerOnly', sources: ['ypsomed-mylife-loop'] }],
                // Owner: no Canadian source confirms Omnipod 5 with Libre 3 Plus.
                notConfirmed: ['omnipod5'],
                // Re-check on publish day; drop if Abbott's notice is gone.
                notice: { key: 'recall', sources: ['abbott-freestyle-canada'] },
                listedBy: ['bc-diabetes-pins'],
              },
              {
                id: 'libre2',
                name: 'FreeStyle Libre 2',
                wear: null, // HELD
                pumps: [],
                listedBy: ['abbott-freestyle-canada', 'isc-nihb-updates', 'bc-diabetes-pins'],
              },
              {
                id: 'guardian4',
                name: 'Guardian 4',
                forPump: 'minimed780G',
                wear: null, // HELD
                // NIHB lists "Guardian Link 4 Transmitter Kits for the 780G… and
                // Guardian Sensor 4". MiniMed's home page no longer names it.
                pumps: [{ pump: 'minimed780G', basis: 'government', sources: ['isc-nihb-updates'] }],
              },
            ],
            pumpNames: {
              tslimX2: 'Tandem t:slim X2',
              omnipod5: 'Omnipod 5',
              mylifeLoop: 'mylife YpsoPump with CamAPS FX (mylife Loop)',
              minimed780G: 'MiniMed 780G',
            },
            checkedOn: '2026-10-05',
          },
        ],
        sources: ['dc-technology-and-devices', 'dc-checking-blood-sugar'],
      },
      {
        // 5 Wearing a sensor, and time in range. The definition sits above the
        // columns; the finger-check line beneath.
        image: `${IMG}/chapter-journey.png`,
        group: 'checking',
        ask: 'team',
        figures: [{ kind: 'columns', columns: [[2, 3, 4], [5, 6]], lead: [1], neutral: [7] }],
        // The 3.9 vs 4.0 line (R19) stays outside the disclosure.
        noteVisible: true,
        sources: [
          'dc-checking-blood-sugar',
          'dc-cpg-ch9-monitoring-2021',
          'bt1d-time-in-range',
          'dc-technology-and-devices',
        ],
      },
      {
        // 6 Sensor restock calculator. Arithmetic only: no coverage, no shop
        // link (Subscribe & save is held with the product placements).
        image: `${IMG}/chapter-everyday.png`,
        group: 'checking',
        ask: 'pharmacistCde',
        figures: [
          {
            kind: 'restockCalc',
            // Presets read card 4's wear data; both are "up to". Grace periods
            // are not counted (R23). Any other sensor is "enter the days".
            presets: [
              { sensor: 'dexcomG7', days: 10, sources: ['dexcom-g7-wear-time'] },
              { sensor: 'libre3Plus', days: 15, sources: ['abbott-freestyle-libre-3'] },
            ],
            maxSensors: 99,
            maxDays: 30,
            maxCover: 366,
          },
        ],
        sources: ['isc-nihb-updates'],
      },

      /* ---------- Getting insulin in ---------- */
      {
        // 7 Pen needles: length and angle. Diabète Québec carries the 4 mm and
        // skin-lift lines (R18), with Diabetes Canada's "shorter, thinner
        // needles"; FIT is cited nowhere.
        image: `${IMG}/chapter-new.png`,
        group: 'gettingInsulinIn',
        ask: 'educator',
        figures: [{ kind: 'columns', columns: [[3, 4, 6], [5]], lead: [1, 2] }],
        sources: ['dc-technology-and-devices', 'dc-getting-started-with-insulin', 'dq-all-about-injections'],
      },
      {
        // 8 Syringes, and insulin strength. The visible note stands in for the
        // HELD "never draw U-200/U-300 from a pen into a syringe" line (R17,
        // URGENT). Never behind a disclosure.
        image: `${IMG}/chapter-prediabetes.png`,
        group: 'gettingInsulinIn',
        ask: 'pharmacist',
        noteVisible: true,
        sources: [
          'dc-technology-and-devices',
          'dc-getting-started-with-insulin',
          'catsa-diabetic-supplies',
        ],
      },
      {
        // 9 Giving an injection, step by step. Two sections; no figure.
        image: `${IMG}/chapter-gestational.png`,
        group: 'gettingInsulinIn',
        ask: 'educator',
        sources: ['dc-getting-started-with-insulin', 'dq-all-about-injections'],
      },
      {
        // 10 Choosing and moving your sites. The rotation map is optional (G5);
        // without it the card is its own list.
        image: `${IMG}/chapter-type1.png`,
        group: 'gettingInsulinIn',
        ask: 'educator',
        figures: [{ kind: 'rotationMap', zones: 4, clearCm: 5, spacingCmAtLeast: [1, 2], weeksPerZone: 1 }],
        sources: ['dc-getting-started-with-insulin', 'dq-all-about-injections'],
      },
      {
        // 11 Keeping insulin safe. "Follow your leaflet" (R5).
        image: `${IMG}/closing.png`,
        group: 'gettingInsulinIn',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'containers',
            containers: [
              { glyph: 'home', items: [{ item: 1, glyph: 'home' }, { item: 5, glyph: 'check' }] },
              { glyph: 'pen', items: [{ item: 2, glyph: 'pen' }, { item: 4, glyph: 'book' }] },
              { glyph: 'list', items: [{ item: 3, glyph: 'check' }] },
              { glyph: 'bag', items: [{ item: 6, glyph: 'bag' }, { item: 7, glyph: 'list' }] },
            ],
          },
        ],
        sources: [
          'dq-all-about-injections',
          'dc-getting-started-with-insulin',
          'dc-air-travel',
          'catsa-diabetic-supplies',
        ],
      },
      {
        // 12 Pumps and automated insulin delivery, in plain words.
        image: `${IMG}/chapter-essentials.png`,
        group: 'gettingInsulinIn',
        ask: 'team',
        sources: ['dc-technology-and-devices', 'dc-cpg-ch41-t1d-lifespan-2025'],
      },
      {
        // 13 Your pump's supplies: what fits. The "My pump" picker. Pairings
        // are read from card 4's data, inverted, so the two cannot disagree.
        image: `${IMG}/chapter-everyday.png`,
        group: 'gettingInsulinIn',
        ask: 'pharmacistCde',
        figures: [
          {
            kind: 'pumpPicker',
            pumps: [
              {
                id: 'minimed780G',
                name: 'MiniMed 780G',
                sensors: [{ sensor: 'guardian4', basis: 'government', sources: ['isc-nihb-updates'] }],
                // "Use exclusively with the Extended reservoir": a fit rule.
                facts: [{ key: 'extendedSets', sources: ['minimed-canada'] }],
                notConfirmed: ['reservoirs', 'setNames'],
                listedBy: ['bc-diabetes-pins'],
              },
              {
                id: 'tslimX2',
                name: 'Tandem t:slim X2',
                sensors: [
                  { sensor: 'dexcomG7', basis: 'sensorMakerOnly', caveat: 'notAllInCanada', sources: ['dexcom-pumps-and-pens'] },
                ],
                notConfirmedSensors: ['dexcomG6'],
                facts: [
                  { key: 'usesDexcom', sources: ['tandem-canada'] },
                  { key: 'controlIqAge', age: 2, sources: ['tandem-canada'] },
                  { key: 'warranty', years: 4, sources: ['tandem-support'] },
                ],
                notConfirmed: ['cartridge', 'setNames'],
              },
              {
                id: 'ypsoPump',
                name: 'mylife YpsoPump',
                sensors: [
                  { sensor: 'dexcomG6', basis: 'twoMakers', sources: ['ypsomed-mylife-loop', 'dexcom-pumps-and-pens'] },
                  { sensor: 'libre3Plus', basis: 'pumpMakerOnly', sources: ['ypsomed-mylife-loop'] },
                ],
                facts: [
                  { key: 'cartridge', units: 160, sources: ['ypsomed-mylife-loop'] },
                  { key: 'setNotEveryCartridge', sources: ['ypsomed-mylife-loop'] },
                  { key: 'loopApp', sources: ['ypsomed-mylife-loop'] },
                  { key: 'loopTraining', minutes: 60, sources: ['ypsomed-mylife-loop'] },
                ],
                notConfirmed: ['setNames'],
                listedBy: ['bc-diabetes-pins'],
              },
              {
                id: 'omnipod5',
                name: 'Omnipod 5',
                sensors: [
                  { sensor: 'dexcomG7', basis: 'twoMakers', sources: ['omnipod-canada', 'dexcom-pumps-and-pens'] },
                  { sensor: 'dexcomG6', basis: 'twoMakers', sources: ['omnipod-canada', 'dexcom-pumps-and-pens'] },
                ],
                // Owner ruling: Libre 2 Plus is not a Canadian product, and no
                // Canadian source confirms Libre 3 Plus. Omnipod's own page
                // mentions both (in non-Canadian blocks) and is not followed here.
                notConfirmedSensors: ['libre3Plus'],
                facts: [{ key: 'podHours', hours: 72, sources: ['omnipod-canada'] }],
                notConfirmed: ['pods'],
                listedBy: ['bc-diabetes-pins'],
              },
              {
                id: 'omnipodDash',
                name: 'Omnipod DASH',
                sensors: [],
                facts: [{ key: 'podHours', hours: 72, sources: ['omnipod-canada'] }],
                notConfirmed: ['pods'],
                listedBy: ['bc-diabetes-pins'],
              },
            ],
            checkedOn: '2026-10-05',
          },
        ],
        sources: ['dc-technology-and-devices'],
      },
      {
        // 14 Pump backup and set changes. Set-change steps and timing are HELD
        // (FIT only). The visible note sends an unexplained high to Staying
        // Safe card 9 ("On a pump: an unexplained high"), in words (A.2 item 5).
        image: `${IMG}/chapter-journey.png`,
        group: 'gettingInsulinIn',
        ask: 'team',
        noteVisible: true,
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'bag',
                items: [
                  { item: 1, glyph: 'list' },
                  { item: 2, glyph: 'pen' },
                  { item: 3, glyph: 'book' },
                ],
              },
              { glyph: 'sharps', items: [{ item: 4, glyph: 'sharps' }] },
            ],
          },
        ],
        sources: [
          'dc-technology-and-devices',
          'dc-managing-emergency-situations',
          'hpsa-returning-medical-sharps',
          'bt1d-dka-and-ketones',
        ],
      },
    ],
    /* Band "How supplies get paid for": three cards, one outward link each. */
    programsBandLinks: [
      [
        {
          href: 'https://www.diabetes.ca/comparisons-by-province-territory',
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['dc-comparisons-by-province'],
        },
      ],
      [
        {
          href: 'https://www.sac-isc.gc.ca/eng/1578079214611/1578079236012',
          hrefLang: 'en',
          locales: ['en'],
          sources: ['isc-nihb-updates'],
        },
      ],
      [
        {
          href: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/life-sustaining-therapy.html',
          hrefLang: 'en',
          locales: ['en'],
          sources: ['cra-dtc-life-sustaining-therapy'],
        },
      ],
    ],
    /* The Funding & Coverage door waits on that page existing (section E). */
    programsBandCards: [null, null, null],
    bandSources: [
      'dc-comparisons-by-province',
      'isc-nihb-updates',
      'cra-dtc-life-sustaining-therapy',
      'cra-rc4064-2025',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_CDE_REQUEST_HREF,
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'Diabetes Canada — Technology & Devices',
        href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/technology-and-devices',
      },
      {
        label: 'Diabetes Canada — Getting Started with Insulin',
        href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/getting-started-with-insulin',
      },
      {
        label: 'Diabetes Canada — Checking Blood Sugar',
        href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/checking-blood-sugar',
      },
      {
        label: 'Diabète Québec — All about injections',
        labelFr: "Diabète Québec — Tout sur l'injection",
        href: 'https://www.diabete.qc.ca/en/diabetes/diabetes-management/insulin/all-about-injections/',
      },
      {
        label: 'Health Products Stewardship Association — Returning Medical Sharps',
        href: 'https://healthsteward.ca/consumers/returning-medical-sharps/',
      },
    ],
  },
```

Notes on the outline:
- **Ask roles** (R24): `pharmacistCde` on cards 4, 6 and 13, the pump and CGM questions (owner, 2026-10-05: Liivv pharmacist CDEs, request a call); `pharmacist` on 1, 2, 8 and 11; `educator` on 3, 7, 9 and 10; `team` on 5, 12 and 14.
- **`urgentContent`:** no card has it. The chapter has no 911 or same-day line; the urgent exit sends readers to Staying Safe. The check confirmed the wiring: `urgentExit: { chapter: 'staying-safe' }` resolves to `staying-safe#red-flags`, no card carries an exit-carrying figure (`lanes`), so the chapter-level signpost renders, and its link text matches Staying Safe's `urgent.heading`.
- **Basis tags (`basis`)** say who confirms each pairing. The build renders them as a short line under each entry (G2):
  - `twoMakers`: both makers name the pairing.
  - `government`: a Canadian government program lists them together.
  - `pumpMakerOnly`: only the pump maker names it.
  - `sensorMakerOnly`: only the sensor maker names it.

  `caveat: 'notAllInCanada'` adds Dexcom's own footnote. Under R16 option (b), `pumpMakerOnly` and `sensorMakerOnly` entries and every maker-only fact line are removed at build time (`held: 'makerOnlyFacts'`).

---

## B) EN MESSAGES — `DiabetesCare.chapters.your-tools`

```json
{
  "title": "Your Tools",
  "heroBody": "Meters, sensors, pens, syringes and pumps: what each one does, what works with what, and how to use them well.",
  "focus": "Checking your glucose: choosing a meter, the strips and lancets that go with it, sensors and what pairs with them, time in range, and when to restock. Getting insulin in: pen needles, syringes, giving an injection, moving your sites, keeping insulin safe, pumps in plain words, what fits your pump, and a backup plan.",
  "vibe": "Practical and unhurried: know your tools, and use them with confidence.",
  "categoriesIntro": {
    "eyebrow": "Know what fits",
    "heading": "The right supplies, used well",
    "body": "This chapter explains your tools and how to use them. It doesn’t choose your treatment: your team does that with you. If your team, or the guide that came with your device, says something different, follow them."
  },
  "startHere": {
    "heading": "Checking your glucose, or getting insulin in?",
    "pivot": "Your tools",
    "segments": {
      "1": {
        "label": "Checking your glucose"
      },
      "2": {
        "label": "Getting insulin in"
      }
    }
  },
  "categories": {
    "1": {
      "title": "Choosing a meter",
      "items": {
        "1": "A meter reads a drop of blood from a finger prick. The drop goes on a test strip, and the strip goes into the meter",
        "2": "You can get a meter at most pharmacies, or from your diabetes educator",
        "3": "Once you have a meter, get trained on it before you start using it",
        "4": "How often you check depends on your treatment plan. Your team will tell you when, and how often",
        "5": "Even if you use a sensor, Diabetes Canada suggests keeping a meter and strips, to double-check a reading and as a backup"
      },
      "note": "Ask your pharmacist or educator which meter suits you. Coverage is under How supplies get paid for, below."
    },
    "2": {
      "title": "Strips, lancets and control solution that match",
      "items": {
        "1": "Diabetes Canada suggests asking which test strips to use with your meter, and whether your meter needs to be coded to read them",
        "2": "Used lancets go in a sharps container. Many pharmacies give out puncture-proof containers and swap a full one for a new one",
        "3": "In Manitoba, Ontario, Quebec, New Brunswick and Prince Edward Island, the Health Products Stewardship Association (HPSA) gives out free sharps containers at participating collection locations, such as pharmacies",
        "4": "HPSA says never to put sharps in the garbage or the recycling",
        "5": "Elsewhere in Canada, ask your pharmacy how to return used sharps"
      },
      "note": "If you’re not sure a strip, lancet or control solution fits your meter, check your meter’s guide or ask your pharmacist before you use it.",
      "figure": {
        "legend": "Your meter",
        "strips": "Test strips",
        "lancing": "Lancing device and lancets",
        "control": "Control solution",
        "inBox": "In the box: {products}",
        "onlyThisOne": "{product}. Ascensia says other control solutions can give inaccurate results",
        "notConfirmed": "Not confirmed here yet. Check your meter’s guide, or ask your pharmacist",
        "fromMaker": "From each maker’s Canadian site, checked 5 October 2026",
        "status": "Showing what fits {meter}.",
        "statusNone": "Pick your meter to see what fits it."
      }
    },
    "3": {
      "title": "Your meter lesson: questions to take in",
      "items": {
        "1": "How and where to take a drop of blood",
        "2": "How to use your lancets, and how to throw them away",
        "3": "How big a drop of blood your meter needs",
        "4": "Which test strips to use",
        "5": "How to clean your meter",
        "6": "How to check that your meter is accurate",
        "7": "How to code your meter to read your strips, if it needs it"
      },
      "note": "These are the questions Diabetes Canada suggests asking. Fill in the lines with your pharmacist or educator, and keep the card with your meter.",
      "figure": {
        "heading": "My meter, and what goes with it",
        "fields": {
          "1": "My meter",
          "2": "My test strips",
          "3": "My lancing device and lancets",
          "4": "How I check my meter is accurate, and my control solution if I use one"
        }
      }
    },
    "4": {
      "title": "Sensors: which pairs with what",
      "items": {
        "1": "A sensor sits on your skin like a small patch, held on by adhesive, with a thin filament just under the skin. It measures sugar in the fluid between your cells, so it can read your sugar without a finger prick each time",
        "2": "Some sensors give a reading only when you scan them with your phone. Others show your sugar all the time and can sound alarms for lows and highs",
        "3": "Some sensors connect to an insulin pump. That connection is what a hybrid closed-loop system needs",
        "4": "Diabetes Canada says this technology isn’t for everyone, and suggests talking with your team about whether it’s right for you"
      },
      "note": "Makers update which devices work together. Before you switch a sensor or a pump, check with your team, your device maker or a Liivv pharmacist who is a Certified Diabetes Educator (CDE).",
      "figure": {
        "legend": "Your sensor",
        "wear": "How long it’s worn",
        "wearDays": "Up to {days} days, with a {hours}-hour grace period at the end",
        "wearUpTo": "Up to {days} days",
        "fromAge": "From age {age}",
        "wearNotConfirmed": "Not confirmed here yet. Check your sensor’s guide",
        "pumps": "Works with these pumps",
        "noPumps": "No pump pairing confirmed in Canada yet",
        "notConfirmed": "Not confirmed by the Canadian sources we checked: {pumps}",
        "forPump": "For {pump}",
        "basis": {
          "twoMakers": "Both makers name this pairing",
          "government": "A Canadian government program lists them together",
          "pumpMakerOnly": "Only the pump maker names this pairing",
          "sensorMakerOnly": "Only the sensor maker names this pairing"
        },
        "caveats": {
          "notAllInCanada": "Dexcom notes that not all connections are available in Canada"
        },
        "notices": {
          "g6ToG7": "Dexcom is phasing out G6 and asking G6 users to move to G7. Ypsomed says G6 is still fully supported with mylife Loop for now. Check with your team before you switch",
          "recall": "When we checked on 5 October 2026, Abbott’s Canadian site showed a recall notice for some FreeStyle Libre 3 Plus sensors distributed in Canada. Check Abbott’s notice before you open a new box"
        },
        "fromMaker": "From each maker’s Canadian site, and from a government program where one is named, checked 5 October 2026. Makers update these details, so check your device’s guide too",
        "status": "Showing {sensor}.",
        "statusNone": "Pick your sensor to see what it pairs with."
      }
    },
    "5": {
      "title": "Wearing a sensor, and time in range",
      "items": {
        "1": "Time in range is the share of your day that your sugar stays in your target range",
        "2": "For most people, Diabetes Canada’s guideline aims for more than 70% of the day between 3.9 and 10.0 mmol/L",
        "3": "It also aims for less than 4% of the day below 3.9",
        "4": "Breakthrough T1D says going from 60% to 65% of the day in range adds about an hour a day in range",
        "5": "Targets can be different in pregnancy, and for children, older adults and people who have lows often. Your team sets yours",
        "6": "You can share your sensor readings from your phone with your diabetes team, so they can see your patterns over time",
        "7": "A sensor and a finger check are more likely to differ when you’re eating or exercising. If how you feel doesn’t match your sensor, or you’re treating a low, a finger check gives the most accurate number"
      },
      "note": "Some Diabetes Canada pages give the range as 4.0 to 10.0. If your team gave you a range, use theirs.",
      "figure": {
        "columns": {
          "1": {
            "heading": "The usual targets"
          },
          "2": {
            "heading": "Making them yours"
          }
        }
      }
    },
    "6": {
      "title": "Sensor restock calculator",
      "items": {
        "1": "Your sensor’s guide says how many days each sensor is worn. The calculator multiplies that by the number of sensors you have",
        "2": "If a program pays for your sensors, it may limit how many you get. For example, for one sensor it covers, the Non-Insured Health Benefits (NIHB) program for eligible First Nations and Inuit allows up to 14 every 6 months, with prior approval, for people who manage their diabetes with insulin",
        "3": "Your province or territory may set its own limits. Ask your pharmacist, or see How supplies get paid for, below"
      },
      "note": "The calculator does arithmetic only. It doesn’t know your coverage, and it can’t count a sensor that stops early.",
      "figure": {
        "sensorLabel": "Your sensor",
        "otherSensor": "Another sensor (enter the days)",
        "daysLabel": "Days each sensor is worn",
        "haveLabel": "Sensors you have",
        "coverLabel": "Days you want to cover (optional)",
        "result": "{count, plural, one {# sensor lasts} other {# sensors last}} about {days} days, to around {date}.",
        "needMore": "To cover {cover} days you need {need}: {more} more than you have.",
        "enough": "You have enough to cover {cover} days.",
        "graceNote": "If your sensor has a grace period after its wear time, the calculator doesn’t count it.",
        "invalid": "Enter whole numbers: up to 99 sensors and 30 days each.",
        "noJs": "Multiply the sensors you have by the days each one is worn. For example, 6 sensors worn 10 days each last about 60 days."
      }
    },
    "7": {
      "title": "Pen needles: length and angle",
      "items": {
        "1": "An insulin pen comes filled with insulin. You put a new needle tip on for each injection",
        "2": "You need a separate pen for each type of insulin you use",
        "3": "Diabetes Canada suggests shorter, thinner needles. Diabète Québec suggests 4, 5 or 6 mm, so the insulin doesn’t go into muscle",
        "4": "For adults, Diabète Québec says a skin lift may not be needed with a 4 mm needle, and to use one with a needle 8 mm or longer",
        "5": "Diabetes Canada says to put the needle in at 90°, with a quick, smooth motion. With a longer needle, 8 or 12 mm, you may need to gently lift the skin, or go in at 45°",
        "6": "If there’s little fat on your arms, legs or belly, Diabète Québec says a skin lift may be needed even with a 5 or 6 mm needle"
      },
      "note": "Your educator or pharmacist can show you which length suits you, and how to lift the skin if you need to.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Length and skin lift"
          },
          "2": {
            "heading": "Angle"
          }
        }
      }
    },
    "8": {
      "title": "Syringes, and insulin strength",
      "items": {
        "1": "Today’s syringes are smaller and use thinner needles. They cost less than pens and pumps",
        "2": "Insulin comes in more than one strength. Diabetes Canada’s list of insulins includes U-100, U-200 and U-700 products",
        "3": "If you use a pump, Diabetes Canada suggests keeping rapid-acting insulin pens or syringes as a backup",
        "4": "Flying? The Canadian Air Transport Security Authority (CATSA) says a syringe needs its needle guard on, and the insulin it’s for has to be with you"
      },
      "note": "Some insulins are stronger than U-100. Don’t use a syringe with insulin from a pen until you’ve asked your pharmacist."
    },
    "9": {
      "title": "Giving an injection, step by step",
      "sections": {
        "1": {
          "heading": "Before you start",
          "items": {
            "1": "Wash your hands with soap and water, and make sure the injection site is clean",
            "2": "You don’t need to wipe your skin with alcohol. If you do, let it dry completely first",
            "3": "Check the expiry date on your cartridge or vial",
            "4": "Wipe the rubber seal on the pen or vial with alcohol before you put on a new needle. Don’t wipe the needle itself",
            "5": "Cloudy insulin needs mixing until it looks milky white: roll it 10 times between your hands, then tip it upside down and back 10 times. Don’t shake it"
          }
        },
        "2": {
          "heading": "The injection",
          "items": {
            "1": "Put on a new needle, then prime the pen to check the needle isn’t blocked, the way your pen’s instructions say",
            "2": "Dial the dose your team has set",
            "3": "Put the needle in at 90° with a quick, smooth motion",
            "4": "Press the button until the counter shows 0, or the syringe is empty. Count to 10 before you take the needle out",
            "5": "Put the needle straight into your sharps container. Don’t leave a needle on your pen between injections",
            "6": "Don’t inject through clothing"
          }
        }
      },
      "note": "Your pen comes with an instruction book. Diabetes Canada suggests reading it, so you know how your pen works."
    },
    "10": {
      "title": "Choosing and moving your sites",
      "items": {
        "1": "Change where you inject each time. Diabetes Canada says this helps prevent fatty lumps that can make insulin work poorly",
        "2": "Insulin goes in fastest and most evenly from the belly. Stay about 5 cm (2 inches), three finger widths, from your belly button",
        "3": "Insulin goes in more slowly from the buttocks and thighs. The back of the upper arm is hard to reach on your own, so it’s often not suggested",
        "4": "Diabète Québec suggests leaving at least 1 to 2 cm, about a finger width, between injections, and splitting each area into four zones, using one zone for a week before you move on",
        "5": "Check and feel your injection areas regularly for lumps or dents",
        "6": "Avoid scars, moles and any other changes in the skin",
        "7": "Diabète Québec says injecting into a part of your body you’re about to exercise can make insulin act faster and lower your sugar"
      },
      "note": "If you find a lump or a dent, show it to your educator or your team.",
      "figure": {
        "heading": "One area, four zones",
        "zones": {
          "1": "Week 1",
          "2": "Week 2",
          "3": "Week 3",
          "4": "Week 4"
        },
        "centre": "Keep about 5 cm from your belly button",
        "caption": "Use one zone for a week, at least a finger width from your last injection each time. Then move to the next zone."
      }
    },
    "11": {
      "title": "Keeping insulin safe",
      "items": {
        "1": "Diabète Québec says to keep unopened insulin in the fridge, at 2 to 8 °C",
        "2": "Keep the insulin you’re using at room temperature",
        "3": "Throw out insulin that has frozen, been above 30 °C, or expired",
        "4": "How long an opened pen or vial lasts depends on the product. Follow the leaflet that came with your insulin",
        "5": "Check the expiry date before you open a new cartridge or vial",
        "6": "Diabetes Canada says insulin goes in your carry-on when you fly, not in checked luggage",
        "7": "CATSA lets insulin, juice and gels through security above the 100 mL limit, but you need to declare them separately"
      },
      "figure": {
        "containers": {
          "1": {
            "label": "Before you open it"
          },
          "2": {
            "label": "Once it’s open"
          },
          "3": {
            "label": "When to throw it out"
          },
          "4": {
            "label": "Travelling"
          }
        }
      }
    },
    "12": {
      "title": "Pumps and automated insulin delivery, in plain words",
      "items": {
        "1": "An insulin pump is a small device worn outside your body. It gives insulin through a small tube under the skin, 24 hours a day",
        "2": "It gives a small, steady trickle of insulin between meals and overnight. Extra doses can be given when they’re needed, for food or to bring a high down",
        "3": "Some pumps connect to a sensor and respond to your readings. Diabetes Canada calls this a hybrid closed-loop system. You may also hear it called automated insulin delivery",
        "4": "For type 1 diabetes, Diabetes Canada’s guideline prefers automated insulin delivery for everyone who is willing and able to wear and use the devices",
        "5": "Your team works with you to decide whether a pump suits you, and on your pump settings"
      },
      "note": "Help with paying for a pump depends on where you live. See How supplies get paid for, below."
    },
    "13": {
      "title": "Your pump’s supplies: what fits",
      "items": {
        "1": "Diabetes Canada lists infusion sets and reservoirs among the pump supplies to keep extras of",
        "2": "Makers’ Canadian sites list some of the sensors that work with their pumps. The picker shows what we could confirm, and says so where we couldn’t"
      },
      "note": "Not sure what fits your pump? Have your pump’s model ready, and ask a Liivv pharmacist CDE.",
      "figure": {
        "legend": "Your pump",
        "sensors": "Sensors it works with",
        "noSensors": "No sensor connection listed by the maker",
        "facts": "About its supplies",
        "notConfirmedHeading": "Not confirmed here yet",
        "notConfirmedSensor": "{sensor}: not confirmed with this pump by the Canadian sources we checked",
        "factLines": {
          "extendedSets": "MiniMed’s Extended infusion set is made to be worn twice as long. MiniMed says to use it only with the Extended reservoir",
          "usesDexcom": "Tandem says the pump works with a Dexcom sensor, sold separately",
          "controlIqAge": "Control-IQ+ technology, from age {age}",
          "warranty": "Tandem gives a {years}-year limited warranty",
          "cartridge": "Takes a {units}-unit cartridge",
          "setNotEveryCartridge": "The maker says the infusion set doesn’t have to be changed with every cartridge",
          "loopApp": "With the CamAPS FX app, it becomes the mylife Loop system",
          "loopTraining": "The maker asks you to finish the app’s training first. It takes about {minutes} minutes",
          "podHours": "Each pod lasts up to {hours} hours"
        },
        "openQuestions": {
          "reservoirs": "Which reservoir fits each MiniMed model",
          "setNames": "Which infusion sets fit",
          "cartridge": "Which cartridge fits",
          "pods": "Which pods fit this system"
        },
        "openQuestionsLead": "Ask your pump maker or a Liivv pharmacist CDE:",
        "basis": {
          "twoMakers": "Both makers name this pairing",
          "government": "A Canadian government program lists them together",
          "pumpMakerOnly": "Only the pump maker names this pairing",
          "sensorMakerOnly": "Only the sensor maker names this pairing"
        },
        "caveats": {
          "notAllInCanada": "Dexcom notes that not all connections are available in Canada"
        },
        "fromMaker": "From each maker’s Canadian site, and from a government program where one is named, checked 5 October 2026. Makers update these details, so check your pump’s guide too",
        "status": "Showing {pump}.",
        "statusNone": "Pick your pump to see what fits it."
      }
    },
    "14": {
      "title": "Pump backup and set changes",
      "items": {
        "1": "Diabetes Canada suggests making a pump backup plan before you need one",
        "2": "Backup supplies include rapid-acting insulin pens or syringes, long-acting insulin if your team says you need it, extra infusion sets and reservoirs, and ketone strips or a blood ketone meter",
        "3": "Learn how to switch to injections in case you can’t use your pump, and keep a written copy of your pump settings",
        "4": "Used infusion sets and sensor applicators with needles go in a sharps container. HPSA’s program takes them in Manitoba, Ontario, Quebec, New Brunswick and Prince Edward Island. Elsewhere, ask your pharmacy"
      },
      "note": "How often to change your set, and where to put it, are part of your pump training. If your sugar is high and you can’t explain it, check your ketones and follow On a pump: an unexplained high, in Staying Safe.",
      "figure": {
        "containers": {
          "1": {
            "label": "Your backup kit"
          },
          "2": {
            "label": "Afterwards"
          }
        }
      }
    }
  },
  "programsBand": {
    "heading": "How supplies get paid for",
    "cards": {
      "1": {
        "heading": "It depends where you live",
        "body": "Coverage for pumps, sensors, test strips and needles is different in each province and territory. Diabetes Canada compares them side by side.",
        "links": {
          "1": {
            "label": "Comparisons by Province/Territory — Diabetes Canada"
          }
        }
      },
      "2": {
        "heading": "First Nations and Inuit (NIHB)",
        "body": "For eligible First Nations and Inuit, the Non-Insured Health Benefits (NIHB) program covers some sensors for people who manage their diabetes with insulin. Some need prior approval. It also covers up to 800 test strips every 100 days for people who use insulin.",
        "links": {
          "1": {
            "label": "Non-Insured Health Benefits program updates — Indigenous Services Canada"
          }
        }
      },
      "3": {
        "heading": "The disability tax credit",
        "body": "The Canada Revenue Agency treats type 1 diabetes as meeting its life-sustaining therapy test. You still need to apply, with form T2201 or online.",
        "links": {
          "1": {
            "label": "Disability tax credit: life-sustaining therapy — Canada Revenue Agency"
          }
        }
      }
    }
  },
  "pharmacist": {
    "eyebrow": "Anywhere in Canada",
    "heading": "Questions about what fits your pump or sensor",
    "body": "Liivv’s pharmacist CDEs answer pump and CGM supply questions for all of Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. Your diabetes team decides your treatment and settings.",
    "cta": "Request a call"
  },
  "closing": {
    "heading": "Tools you know well",
    "body": "The right supplies, used the same careful way each time, make every day a little easier. When something doesn’t fit, ask."
  },
  "governance": {
    "disclaimer": "This is general information, not medical advice, and it is not a substitute for care from your diabetes team, doctor or pharmacist. Your treatment, your devices and your settings depend on you. Your team sets them. Device details come from each maker’s Canadian site, or a government program, on the date shown, and can change."
  },
  "urgentExit": {
    "lead": "Signs that need emergency care are in Staying Safe, under",
    "link": "Get emergency care now"
  }
}
```

**`ui` additions** (outside the chapter key; en shown):
```json
{ "chapter": { "groups": { "checking": "Checking your glucose", "gettingInsulinIn": "Getting insulin in" } } }
```

---

## C) CLAIMS TABLE (after source check)

Key paths are relative to `DiabetesCare.chapters.your-tools`. "Check" gives the result in `your-tools.verify.md` after this revision:
- **C:** confirmed on the saved page copy (`scratchpad/src/`, `src/yt/`) as now worded. Every former C† row was re-read word for word by the check and is now C.
- **C-M:** confirmed on a registered maker page, as now worded. Policy 4 says an industry page is never the only source, so these wait on R16.
- **Gov:** confirmed on a registered Canadian government page.
- **Adv:** an action line with no factual claim. **Nav:** points to another card or chapter. **Owner:** owner-supplied.

Not listed: UI strings, and instructions with no factual claim (for example "Ask your pharmacist…", "Your team sets yours", "Fill in the lines…", the calculator's behaviour).

| Key | Sentence (short) | SourceId | Fact on the source page | Check |
|---|---|---|---|---|
| heroBody, focus, vibe, startHere, closing | Framing | — | No clinical claim | — |
| categoriesIntro.body | Team chooses treatment; follow team / device guide | dc-technology-and-devices | "Your health-care team will work with you to decide… If an insulin pump will work for you; Your pump settings…" | C |
| 1.items.1 | Meter reads a finger-prick drop on a strip in the meter | dc-checking-blood-sugar | "…prick your finger so that a blood sample can be put on a test strip that is inserted into the monitor" | C |
| 1.items.2 | Meters at most pharmacies or from your educator | dc-checking-blood-sugar | "Monitors are available at most pharmacies or from your diabetes educator" | C |
| 1.items.3 | Get trained before using | dc-checking-blood-sugar | "make sure you get the proper training before you begin to use it" | C |
| 1.items.4 | How often depends on treatment plan; team says | dc-checking-blood-sugar | "How often you check your blood sugar depends on your treatment plan…" | C |
| 1.items.5 | With a sensor, keep meter and strips to double-check and as backup | dc-technology-and-devices | "Even if you're offered a CGM… a diabetes kit that includes a blood glucose monitor and testing strips for double checking CGM readings and as a backup" | C |
| 2.items.1 | Ask which strips; whether meter needs coding | dc-checking-blood-sugar; dc-technology-and-devices | "Ask your health-care provider about… The type of testing strips to use… How to code your meter… (if needed)" | C |
| 2.items.2 | Lancets in sharps; pharmacies give and swap containers | dc-getting-started-with-insulin | "Pen tips and lancets should be disposed of in a sharps container… returned to the pharmacy in exchange for a new container" | C |
| 2.items.3 | HPSA: free containers at participating collection locations in MB, ON, QC, NB, PEI | hpsa-returning-medical-sharps | "participating HPSA collection locations" (pharmacies, vet clinics, dispensaries) in those five provinces | C |
| 2.items.4 | Never put sharps in garbage or recycling | hpsa-returning-medical-sharps | "Never place used medical sharps in the garbage or recycling." ("never" is HPSA's) | C |
| 2.items.5 | Elsewhere, ask your pharmacy | — | Instruction; no source covers BC, AB, SK, NS, NL or the territories | Adv (R22) |
| 2.figure (Contour, held) | Contour Next control solution only, for Next Gen / One / EZ | ascensia-support | "…use only the CONTOUR NEXT control solution. Using any other control solution can cause inaccurate results." | C-M (figure HELD) |
| 2.figure (OneTouch, held) | Delica Plus lancing device and Delica lancets in the box | lifescan-verio-reflect | "What's in the Box": meter, OneTouch Delica Plus lancing device, 10 OneTouch Delica Lancets | C-M (figure HELD) |
| 3.items.1–7 | The seven "ask about" questions | dc-checking-blood-sugar; dc-technology-and-devices | The "Ask your health-care provider about" list; first item "How and where to draw blood" (paraphrase accepted) | C |
| 3.note | These are DC's suggested questions | dc-checking-blood-sugar | As above | C |
| 4.items.1 | Patch, adhesive, filament; fluid between cells; reads without a finger prick each time | dc-technology-and-devices; dc-checking-blood-sugar | "a sensor sits on your skin like a small, lightweight, waterproof patch… held in place by sticky material… small flexible filament"; "measure sugar in fluid between cells" | C (reworded) |
| 4.items.2 | Scan-only vs continuous with alarms | dc-technology-and-devices | isCGM "only when the sensor is scanned"; rtCGM "alarms for alerting low and high sugar levels" | C |
| 4.items.3 | Some sensors connect to a pump; hybrid closed loop | dc-technology-and-devices | "Some CGMs can connect to an insulin pump… hybrid closed loop system" | C |
| 4.items.4 | Not for everyone; talk with your team | dc-technology-and-devices | "Technology (tech) isn't for everyone though…" | C |
| 4.note | Makers update compatibility; CDE spelled out | dexcom-pumps-and-pens | "Not all connections are available in Canada" (maker pages lag) | C-M (soft) / Adv |
| 4.figure G7 wear | Up to 10 days, 12-hour grace period at the end | dexcom-g7-wear-time | "indicated to be worn for up to 10 days, with a 12-hour grace period at the end" | C-M (R16) |
| 4.figure G7 ↔ t:slim X2 | Sensor maker only; Dexcom's Canada caveat | dexcom-pumps-and-pens | t:slim X2 listed with G7, footnoted "* Not all connections are available in Canada." Tandem: "Dexcom CGM sold separately" (no model) | C-M (R16) |
| 4.figure G6 ✗ t:slim X2 | Not confirmed | dexcom-pumps-and-pens; tandem-canada | Dexcom names only G7 for t:slim X2; Tandem names no model | Shown as not confirmed |
| 4.figure G7/G6 ↔ Omnipod 5 | Both makers | dexcom-pumps-and-pens; omnipod-canada | Insulet: "Compatible with the Dexcom G6 and Dexcom G7 Sensors… The Dexcom receiver is not compatible" | C-M (R16; two makers) |
| 4.figure G6 ↔ mylife Loop | Both makers | dexcom-pumps-and-pens; ypsomed-mylife-loop | Both name it | C-M (R16; two makers) |
| 4.figure G6 → G7 notice | Dexcom phasing out G6; G6 still supported with mylife Loop for now | dexcom-canada; ypsomed-mylife-loop | Dexcom: "Dexcom G6 users: Now is the time to transition to Dexcom G7"; Ypsomed: Dexcom "will phase out the Dexcom G6… in phases. For now, your Dexcom G6 remains fully supported" | C-M (R16; two makers) |
| 4.figure Libre 3 Plus wear | Up to 15 days, from age 2 | abbott-freestyle-libre-3 | "up to 15 days"; "people aged 2 years and older" | C-M (R16) |
| 4.figure Libre 3 Plus ↔ mylife Loop | Pump maker only | ypsomed-mylife-loop | "Dexcom G6, CGM, or FreeStyle Libre 3 Plus sensor" | C-M (R16; one maker) |
| 4.figure Libre 3 Plus recall notice | Recall notice up when checked; check Abbott's notice | abbott-freestyle-canada | "An Urgent Medical Device Recall has been initiated for a subset of FreeStyle Libre 3 Plus sensors that were distributed in Canada." | C-M (2026-10-05; re-check on publish day) |
| 4.figure Libre 3 Plus ✗ Omnipod 5 | Not confirmed | — (owner ruling) | No Canadian source confirms it; Omnipod's en-ca page mixes in non-Canadian blocks (a UK 0800 number, Libre 2 Plus) | Owner |
| 4.figure Guardian 4 for 780G | Government lists them together | isc-nihb-updates | "Guardian Link 4 Transmitter Kits for the 780G… and Guardian Sensor 4 are covered for clients 19 years or younger on intensive insulin with type 1 diabetes" (Dec 2024). Coverage not rendered | Gov |
| 5.items.1 | Time in range definition | dc-checking-blood-sugar | "It's the percentage of your day your blood sugar stays in your target range" | C |
| 5.items.2 | >70% in 3.9–10.0 for most | dc-cpg-ch9-monitoring-2021; bt1d-time-in-range | ">70%… 3.9-10.0 mmol/L… for most individuals"; "At least 70%" | C (R19) |
| 5.items.3 | <4% below 3.9 | dc-cpg-ch9-monitoring-2021; bt1d-time-in-range | Table: <4% below 3.9 | C |
| 5.items.4 | 60% → 65% is about an hour a day | bt1d-time-in-range | "going from 60% to 65%… one more hour per day spent in-range" | C |
| 5.items.5 | Different in pregnancy, children, older adults, frequent lows | dc-cpg-ch9-monitoring-2021; bt1d-time-in-range; dc-checking-blood-sugar | CPG table excludes "pregnancy, children/adolescents, and older/high-risk groups"; DC "Individual targets may vary…" | C |
| 5.items.6 | Share readings with your team | dc-technology-and-devices | "record and share the data from your smartphone with your diabetes team" | C |
| 5.items.7 | Bigger gap eating or exercising; finger check | dc-technology-and-devices | "more likely to be larger when you're eating or exercising… most accurate result" | C |
| 5.note | Some DC pages use 4.0–10.0 | dc-checking-blood-sugar | TIR "4.0 – 10.0", "70% or more"; below range "3.9 mmol/L or below", <4% | C (R19) |
| 6.items.2 | NIHB, eligible First Nations and Inuit: one covered sensor, 14 per 6 months, prior approval, insulin users | isc-nihb-updates | Libre 3 added Sep 2025 with prior approval, 14 sensors every 6 months, for "clients managing diabetes with insulin" | Gov (brand removed) |
| 6.figure presets | G7 up to 10; Libre 3 Plus up to 15 | dexcom-g7-wear-time; abbott-freestyle-libre-3 | As 4.figure | C-M (R16, R23) |
| 6.figure.graceNote | Grace periods not counted | — | Describes the calculator; no product named | Adv |
| 7.items.1 | Pen preloaded; new tip each injection | dc-technology-and-devices; dc-getting-started-with-insulin | "Insulin pens are preloaded with insulin… A needle tip is added for each injection" | C |
| 7.items.2 | One pen per insulin type | same | "one pen for each type of insulin" | C |
| 7.items.3 | DC: shorter, thinner; DQ: 4, 5 or 6 mm to avoid muscle | dc-getting-started-with-insulin; dq-all-about-injections | DC: "Try to use shorter needles with a smaller thickness"; DQ: "Use short needles (4 mm, 5 mm or 6 mm) to avoid intramuscular injections" | C (R18) |
| 7.items.4 | For adults: 4 mm may need no lift; ≥8 mm use a lift | dq-all-about-injections | "In adults… A skin lift should be used when the needle is 8 mm or longer… may not be necessary especially when using a 4 mm needle" | C (R18) |
| 7.items.5 | 90°; 8 or 12 mm lift or 45° | dc-getting-started-with-insulin | "Insert pen tip or needle into skin at a 90º angle with a quick smooth motion… (8mm or 12 mm)… gently lift the skin… or… (45º)" | C |
| 7.items.6 | Little fat: lift may be needed with 5–6 mm | dq-all-about-injections | "a skin fold might be justified when using a needle of 5 mm or 6 mm" | C (R18) |
| 8.items.1 | Syringes smaller, thinner, cheaper | dc-technology-and-devices; dc-getting-started-with-insulin | "Today's syringes are smaller and use thinner needles… less costly than pens and pumps" | C |
| 8.items.2 | U-100, U-200 and U-700 on DC's list | dc-getting-started-with-insulin | "Humalog® U-200", "Tresiba® U-100, Tresiba® U-200", "Awiqli® U-700" (Toujeo listed without strength) | C |
| 8.items.3 | Pump users: rapid-acting pens or syringes as backup | dc-technology-and-devices | "Rapid-acting insulin pens or syringes" | C |
| 8.items.4 | CATSA: needle guard on; medication with you | catsa-diabetic-supplies | Syringes need the needle guard on and the medication with you | Gov |
| 8.note | Some insulins stronger than U-100; ask your pharmacist before using a syringe with pen insulin | dc-getting-started-with-insulin (first sentence) | First sentence as 8.items.2; second is an instruction standing in for the held R17 line | C / Adv (R17) |
| 9.s1.1–s1.5 | Before you start | dc-getting-started-with-insulin; dq-all-about-injections | Hands and site clean; alcohol not needed, let it dry; check expiry; wipe the seal, not the needle; roll 10 / tip 10, milky white, don't shake | C |
| 9.s2.1–s2.6 | The injection | dc-getting-started-with-insulin | New tip, prime per instructions (amount left out), dial the dose, 90°, press to 0 and count 10, sharps, not through clothing | C |
| 9.note | Pen instruction book | dc-getting-started-with-insulin | "Pens come with an instruction book. Please review it…" | C |
| 10.items.1 | Rotate; fatty lumps | dc-getting-started-with-insulin | "Change (rotate) where you inject insulin each time…" | C |
| 10.items.2 | Belly fastest and even; 5 cm / 2 in / three fingers | dc-getting-started-with-insulin | "Stay 2 inches (5 cm) or the width of three fingers away from your belly button… absorbs fast and evenly" | C (R20) |
| 10.items.3 | Buttocks and thighs slower; arm hard to reach | dc-getting-started-with-insulin; dq-all-about-injections | "Insulin absorbs more slowly"; arm "hard to reach when injecting yourself, so it is often not recommended" | C |
| 10.items.4 | At least 1–2 cm apart; four zones, a week each | dq-all-about-injections | "at least 1 to 2 cm (1 finger width) between each site"; quadrants, a week each | C |
| 10.items.5–7 | Check for lumps; avoid scars; exercise speeds insulin | dq-all-about-injections | "Regularly examine and palpate your injection areas…"; "Avoid injecting into… scars, beauty marks…"; "…faster action and a decrease in blood glucose" | C |
| 10.figure | Four zones; ~5 cm clear; at least a finger width | dq-all-about-injections; dc-getting-started-with-insulin | As 10.items.2 and .4 | C |
| 11.items.1 | Unopened 2–8 °C | dq-all-about-injections | "stored in the refrigerator (2 to 8 °C)" | C |
| 11.items.2 | In use at room temperature | dc-getting-started-with-insulin; dq-all-about-injections | "Keep insulin you are using at room temperature" | C |
| 11.items.3 | Frozen, >30 °C, expired | dc-getting-started-with-insulin | "Throw out insulin that has been frozen, exposed to temperatures greater than 30ºC, or expired" | C |
| 11.items.4 | Opened life depends on product; follow leaflet | dc-getting-started-with-insulin | "Insulin storage is different for each product…" (DC "up to 30 days" and DQ 28/42 days not stated) | C (R5) |
| 11.items.5 | Check expiry | dq-all-about-injections | "Check that the vial or cartridge has not passed its expiration date" | C |
| 11.items.6 | Carry-on, not checked | dc-air-travel | "Do not place insulin in your checked luggage as the temperature fluctuations can damage it." | C ("never" → "not") |
| 11.items.7 | Insulin, juice and gels over 100 mL; declare separately | catsa-diabetic-supplies | "Any liquids, juice or gels must be declared to the Screening Officer separately." | Gov |
| 12.items.1–3 | Pump in plain words; hybrid closed loop; AID | dc-technology-and-devices; dc-cpg-ch41-t1d-lifespan-2025 | "Give insulin 24 hours a day through a small tube…"; "Can connect to CGMs…"; Ch41 "Automated insulin delivery (AID) systems" | C |
| 12.items.4 | AID preferred for type 1, willing and able | dc-cpg-ch41-t1d-lifespan-2025 | "AID systems… are the preferred treatment method for all individuals… provided the individual is willing and able to wear and operate the devices" (verbatim twice) | C (R21) |
| 12.items.5 | Team decides pump and settings | dc-technology-and-devices | "If an insulin pump will work for you; Your pump settings" | C |
| 13.items.1 | Infusion sets and reservoirs among extras | dc-technology-and-devices | "Extra pump supplies (infusion sets, reservoirs)" | C |
| 13.items.2 | Makers' sites list some sensors | maker pages | Tandem names no model; MiniMed's page no longer names Guardian 4 | C (reworded) |
| 13.figure 780G | Guardian 4 (government); Extended set only with Extended reservoir | isc-nihb-updates; minimed-canada | NIHB as 4.figure; MiniMed: "Extended infusion set… designed for twice the wear. Use exclusively with the Extended reservoir." | Gov; C-M (R16) |
| 13.figure t:slim X2 | G7 (sensor maker only, caveat); G6 not confirmed; works with a Dexcom sensor sold separately; Control-IQ+ from 2; 4-year limited warranty | dexcom-pumps-and-pens; tandem-canada; tandem-support | "Dexcom CGM sold separately"; Control-IQ+ from age 2; "Four-Year Limited Warranty" | C-M (R16) |
| 13.figure YpsoPump | G6 (two makers); Libre 3 Plus (pump maker only); 160-unit cartridge; set needn't change every cartridge; CamAPS FX = mylife Loop; app training ~60 min | ypsomed-mylife-loop; dexcom-pumps-and-pens | "1.6 ml (160 U) 100 U/ml"; in-app training "will take you about 60 minutes" | C-M (R16) |
| 13.figure Omnipod 5 / DASH | Up to 72 h; Omnipod 5 with G6/G7; Libre 3 Plus not confirmed | omnipod-canada; dexcom-pumps-and-pens | "up to three days (72 hours)" | C-M (R16); Owner |
| 14.items.1–2 | Backup plan; backup list | dc-technology-and-devices | "a pump backup plan before one is needed"; "Rapid-acting insulin pens or syringes, Long-acting insulin (if needed), Extra pump supplies…, Ketone testing strips… or a ketone blood monitor" | C |
| 14.items.3 | Switch to injections; written settings | dc-managing-emergency-situations | Emergency kit holds "Your basal rates, insulin-to-carbohydrate ratio, insulin sensitivity factor…" | C |
| 14.items.4 | Sets and applicators with needles in sharps; HPSA five provinces; elsewhere ask | hpsa-returning-medical-sharps | "Continuous Glucose Monitors (CGM) applicators with needles", infusion sets; five provinces | C; Adv (R22) |
| 14.note | Unexplained high on a pump: check ketones, follow Staying Safe card 9 | bt1d-dka-and-ketones (via Staying Safe card 9 item 2) | Staying Safe 9.items.2: "If your blood sugar is high and you can't explain it, check your ketones and follow the ladder…" | Nav |
| programsBand.cards.1 | Coverage differs; DC compares | dc-comparisons-by-province | Lists glucose monitoring devices, insulin pumps, SMBG strips, needles, syringes and lancets | C |
| programsBand.cards.2 | NIHB, eligible First Nations and Inuit: some sensors for insulin users, some with prior approval; 800 strips per 100 days for insulin users | isc-nihb-updates | Prior approval stated for Libre 3; Libre 2, G6/G7, Guardian Connect "continue"; 800/100 for "clients managing diabetes with insulin" | Gov (reworded) |
| programsBand.cards.3 | CRA: type 1 meets life-sustaining therapy test; T2201 or online | cra-dtc-life-sustaining-therapy; cra-rc4064-2025 | As stated | Gov |
| pharmacist.body | CDE hours, all of Canada | — | Same wording as Staying Safe | Owner (R25) |
| governance.disclaimer | Device details from makers or a government program on the date shown | — | — | — |

---

## D) OPEN RULINGS (clinical defaults used, pending the nurse)

### D.1 Clinical defaults inherited from Staying Safe (used here pending the nurse)

| # | Default | Used in this chapter? |
|---|---|---|
| R1 · **ruled 2026-10-06 ([C1](clinical-rulings-2026-10-06.md#c1))** | Low = below 3.9 mmol/L | Yes, as the lower edge of time in range: 5.items.2–3 (see R19) |
| R2 · **ruled 2026-10-06 ([C13](clinical-rulings-2026-10-06.md#c13))** | ½ cup juice | Not used |
| R3 · **ruled 2026-10-06 ([C4](clinical-rulings-2026-10-06.md#c4))** | Ketone ladder written for type 1 | Not repeated. Card 14 lists ketone strips, and its note sends an unexplained high to Staying Safe card 9 |
| R5 · **ruled 2026-10-06 ([C15](clinical-rulings-2026-10-06.md#c15))** | In-use insulin: "follow your leaflet" | Yes: 11.items.4. DC's "up to 30 days" and DQ's 28 days (42 for detemir) are not stated |
| R9 · **ruled 2026-10-06 ([C14](clinical-rulings-2026-10-06.md#c14))** | FIT counted as industry-run | Yes. No FIT line is live. The U-200/U-300 line is held (R17); the 4 mm line rests on Diabète Québec and DC (R18); set-change timing is held |
| R10 · **ruled 2026-10-06 ([C16](clinical-rulings-2026-10-06.md#c16))** | No alcohol limits stated | Not used |

### D.2 Rulings for this chapter

| # | Default used | Where | Alternative |
|---|---|---|---|
| **R17 (URGENT, nurse)** · **ruled 2026-10-06 ([C7](clinical-rulings-2026-10-06.md#c7))** | **"Never draw U-200 or U-300 insulin from a pen into a syringe" is HELD.** Among the sources considered it is on FIT (industry-run) only; no registered non-industry source says it (DC Getting Started, DC Technology & Devices, Diabète Québec and CPG Ch41 were searched). The check found that a Health Canada–approved monograph says it for one product: the Toujeo patient information reads "Do not use a syringe to remove insulin from your pen. If you do you will get too much insulin" (Sanofi copy saved at `src/yt/toujeo-pmi.pdf`; the DPD copy on pdf.hres.ca is the government-hosted one). No monograph is registered. **Interim, always visible** (card 8 note, `noteVisible`): "Some insulins are stronger than U-100. Don't use a syringe with insulin from a pen until you've asked your pharmacist." The first sentence rests on DC's insulin list; the second is an instruction that carries no reason or claim. | 8.note; section E | (a, recommended by the check) Register the DPD product monographs for each concentrated pen insulin (Toujeo U-300, Humalog U-200, Tresiba U-200, Awiqli U-700) and release the line, scoped to what the monographs say. (b) Accept FIT for this one safety line, disclosed as embecta-run. (c) Keep the interim line |
| **R16 (URGENT, owner + nurse)** | **Picker facts that rest only on maker pages.** Policy 4 says an industry page is never the only source, but wear times, pairings and box contents are mostly on makers' pages. **Default:** the pickers show each fact with its basis line and the checked date. After the check the bases are: `twoMakers` (G7/G6 ↔ Omnipod 5; G6 ↔ mylife Loop; the G6 → G7 notice), `government` (Guardian 4 ↔ 780G, NIHB), `pumpMakerOnly` (Libre 3 Plus ↔ mylife Loop), `sensorMakerOnly` (G7 ↔ t:slim X2, with Dexcom's "not all connections are available in Canada"). Maker-only facts: G7 and Libre 3 Plus wear; the Libre 3 Plus recall notice; every 13.figure fact line; the held meter picker rows. Brand names appear in the pickers and the calculator's presets only (the check's scope finding 3: the calculator's grace note and the NIHB line were made brand-free). | 4, 6, 13 figures (2 held) | (a) Show only `government` and `twoMakers` entries. (b) Also hide `pumpMakerOnly`, `sensorMakerOnly` and maker-only fact lines (`held: 'makerOnlyFacts'`). (c) Hold all pickers until a Canadian non-industry page confirms each fact (for example Health Canada's Medical Devices Active Licence Listing, not registered) |
| R18 · **ruled 2026-10-06 ([C14](clinical-rulings-2026-10-06.md#c14))** | **Diabète Québec as the source for 4 mm and skin lifts.** DQ publishes them under its own name (RN-reviewed) but says they are "based on" FIT 2015 (© January 2017, updated January 2019). DC's own "Try to use shorter needles with a smaller thickness" now sits beside it in 7.items.3. 7.items.4 now starts "For adults," as DQ frames it. "4 mm is safest" is not said. | 7.items.3, .4, .6; 10.items.4–7 | Hold the DQ lines as FIT-derived, keeping only DC's "shorter, thinner" and 90° / 8–12 mm lines |
| R19 · **ruled 2026-10-06 ([C1](clinical-rulings-2026-10-06.md#c1))** | **Time-in-range lower edge 3.9** (CPG Ch9 and Breakthrough, matching R1). DC's "Checking Blood Sugar" prints 4.0–10.0; the visible note says so. | 5.items.2–3, 5.note | Use 4.0–10.0 to match the patient page |
| R20 · **ruled 2026-10-06 ([C31](clinical-rulings-2026-10-06.md#c31))** | **Belly-button distance about 5 cm** (2 in, three fingers), from DC. DQ says 2 to 3 cm. The more cautious figure is used. | 10.items.2, 10.figure.centre | 2–3 cm (DQ), or no number |
| R21 · **ruled 2026-10-06 ([C20](clinical-rulings-2026-10-06.md#c20))** | **Ch41 device preference stated** (AID for type 1, willing and able). A guideline's device preference, not a drug choice; the intro and 12.items.5 say the team decides. The check accepts it. | 12.items.4 | Leave it out (retail scope) |
| R22 · **ruled 2026-10-06 ([C32](clinical-rulings-2026-10-06.md#c32))** | **Sharps outside the HPSA provinces:** the check's recommendation is now the default: "Elsewhere in Canada, ask your pharmacy how to return used sharps" (an instruction, no claim). No source covers BC, AB, SK, NS, NL or the territories. | 2.items.5, 14.items.4 | Leave the line out; or register provincial sharps programs |
| R23 · **ruled 2026-10-06 ([C31](clinical-rulings-2026-10-06.md#c31))** | **Restock calculator counts G7 as 10 days and Libre 3 Plus as 15** (both "up to"); grace periods not counted. The grace note no longer names a brand. | 6.figure | Count the grace period, or leave G7 to "enter the days" |
| R24 · **ruled 2026-10-06 ([C33](clinical-rulings-2026-10-06.md#c33))** | **Ask roles:** `pharmacistCde` for sensors, restock and pump fit (4, 6, 13); `educator` for injection technique and the meter lesson (3, 7, 9, 10); `pharmacist` for meters, strips, syringes and storage (1, 2, 8, 11); `team` for time in range, pumps and backup (5, 12, 14). | meta | Whether meters (1–3) should also go to the pharmacist CDE |
| R25 (owner) | **Pharmacist panel says "for all of Canada"**, matching Staying Safe. Pharmacists are licensed by province; the owner confirms the CDE service is set up for every province and territory. | pharmacist.body, eyebrow | Name the provinces served |

### D.3 Pre-publish checks (factual, not clinical rulings)

1. **Done by the check:** the four C† pages are saved word for word in `src/yt/` and every C† row was re-read. Add the facts to their `sources-review.ts` locators (A.1).
2. Fix the locators listed in A.1: `dc-getting-started-with-insulin` (no "6 mm"), `dexcom-g7-wear-time` (no "no restarts"; "up to 10 days"), `minimed-canada` (Guardian 4 and "available later this year" no longer on the page), `dexcom-pumps-and-pens` (G7 only for t:slim X2; the Canada footnote).
3. Libre 3 Plus recall notice: re-check on publish day and drop the notice if it is gone.
4. Dexcom's "pumps and pens" page is out of date on where Omnipod 5 is available (its footnote says Ontario and Nova Scotia only). Only its pairings are used; re-check them.
5. Omnipod's Canadian page mixes in non-Canadian blocks (a UK 0800 number, Libre 2 Plus). Re-check whether Insulet Canada now lists a Libre sensor for Canada.
6. Tandem: re-confirm Control-IQ+, "Dexcom CGM sold separately" and the four-year limited warranty. Tandem Mobi stays out until it is authorized in Canada.
7. MiniMed: Simplera Sync is now headlined as licensed by Health Canada. If it goes on sale, and a second registered page confirms it with the 780G, add it to both pickers with a basis.
8. ~~**Cross-chapter finding for Staying Safe** (from the draft, still open): the live DC Checking Blood Sugar page has a sick-day section with "If you use insulin, keep taking it when you are sick…" and "Call your doctor or go to the emergency room if you vomit or have diarrhea two or more times in 4 hours." Pass both to the Staying Safe owner. Neither is used here.~~ Closed 2026-10-06 ([C17](clinical-rulings-2026-10-06.md#c17)): both lines are now on Staying Safe card 8.
9. Build: card 14's note names Staying Safe card 9 in words because the engine has no cross-chapter note link (A.2 item 5).

---

## E) HELD ITEMS, WITH REASONS

The wording goes in `held-messages.ts` / the review pack, and is not shipped.

| Topic | Card | Why held | Proposed wording if sourced | Source to register or check |
|---|---|---|---|---|
| **"A 4 mm pen needle is safest, without a skin lift"** (FIT's framing) | 7 | FIT only. DQ's narrower "for adults, a skin lift may not be needed with 4 mm" is used instead (R18) | "For most adults, a 4 mm pen needle at 90° without a skin lift is enough" | A non-industry Canadian source; CPG |
| **Skin and adhesives** (whole card) | — | No Canadian source for CGM or pump adhesive reactions or site infections. Product facts only, and product placements are on hold, so nothing can be shown | Title "Skin and adhesives". "If the skin under your sensor or set gets red, itchy or sore, tell your team. Your device maker's guide lists what to use under and over the adhesive" | DC; Breakthrough; a Canadian dermatology or NSWOC source |
| **Your device maker's 24/7 line** (whole card) | — | Manufacturer pages only (policy 4); Staying Safe holds the same lines | "Your pump or sensor maker runs a support line for device faults. The number is in your device's guide." Numbers released with R16 | R16 ruling |
| **Meter picker data** (`meterMatch`, whole figure) | 2 | No registered page says which strips go with which meter. Lancing fit not stated (Ascensia names Microlet Next and Single-let Next without saying which meters they fit). No registered page for Accu-Chek or FreeStyle meters. Makers only (R16) | Per family: "Strips: {name}. Lancets: {name}. Control solution: {name}" | Each maker's Canadian strip-compatibility page; Health Canada MDALL |
| ~~**Dexcom G6 ↔ Tandem t:slim X2**~~ (new after the check) · **released 2026-10-06 ([C42](clinical-rulings-2026-10-06.md#c42)): Tandem's Canadian user guide names G6 and G7** | 4, 13 | Not confirmed: Dexcom names only G7 for t:slim X2, and Tandem names no model. Shown as "not confirmed by the Canadian sources we checked" | Basis line once confirmed | Tandem Canada sensor page; Dexcom |
| **G7 "can't be restarted"** (new after the check) | 4 | Not on `dexcom-g7-wear-time`, though its locator says so | "It can't be restarted" | A Dexcom Canada page or user guide that says it, plus a non-industry cross-check |
| **Where else to check a recall** (new after the check) | 4 | Health Canada Recalls and Safety Alerts is not registered | "…or search Health Canada's Recalls and Safety Alerts" | Register recalls-rappels.canada.ca |
| **Sensor wear times:** Libre 2, Dexcom G6, Guardian 4 | 4, 6 | Not on any registered page | "Up to {n} days" | Maker pages, plus a non-industry cross-check |
| **Sensor readers and apps** | 4 | Not on any registered page | — | Maker pages |
| **G7 15 Day** | 4 | Authorized 13 Jul 2026, not on sale | Add when on sale | Dexcom; Health Canada |
| **MiniMed reservoirs per model; MiniMed set names** | 13 | Not on a registered page (only the Extended set / Extended reservoir rule is) | — | MiniMed Canada product pages |
| **Tandem cartridge and sets** (AutoSoft 90, AutoSoft 30, AutoSoft+) | 13 | Catalogue names, not on a registered page | — | Tandem Canada |
| **mylife Inset fit with YpsoPump** | 13 | Plan: confirm fit before listing | — | Ypsomed Canada |
| **Omnipod 5 and DASH pods are not interchangeable** | 13 | Not on a registered page; shown as the open question "Which pods fit this system" | "Omnipod 5 pods and DASH pods aren't interchangeable: use the pods made for your system" | Insulet Canada |
| **Omnipod 5 with FreeStyle Libre** | 4, 13 | Owner: Libre 2 Plus is not a Canadian product; no Canadian source confirms Libre 3 Plus | — | Insulet Canada / Abbott Canada |
| **Tandem Mobi** | 13 | Not authorized in Canada as of Jan 2026 (search only) | — | Health Canada MDALL |
| **Simplera Sync** | 4, 13 | Licensed; sale date and 780G pairing on maker and press pages only | — | MiniMed; a government program listing |
| **Infusion-set change timing; no set change at bedtime; set-change steps** | 14 | FIT only | "Try not to change your infusion set just before bed, so you can check it's working" | DC; Breakthrough pump pages |
| **Lipohypertrophy: lower the dose when moving off a lump** | 10 | FIT only, and it is dosing (out of scope) | Not proposed. The card says "show it to your educator or your team" | — |
| **A clean finger check, step by step** | 1–3 | DC lists these as questions to ask, not steps. The plan card became "Your meter lesson" (takeIn) | "Wash your hands in warm water and dry them. Prick the side of your fingertip…" | DC (other sheets); Diabète Québec |
| **Choosing a meter by features** (big screen, app, talking meters) | 1 | Not on any registered non-industry page | — | DC; CNIB for low vision |
| **Ontario coverage specifics** (ADP, Monitoring for Health, ODB strip tiers) | band | Province-only; belongs on Funding & Coverage | — | Funding page |
| **Band door to Funding & Coverage** | band | The page doesn't exist yet | Band card 4: "Your province's programs: see Funding & Coverage" | Build the page |
| **Sensor restock → Subscribe & save; kits** | 6, all | Shop strips built 2026-10-06 (F.9). No strip claims Subscribe & save (each product page says whether it is offered); kits wait on the owner’s sign-off (A4) | — | Owner |
| **Pharmacist CDE phone number** | pharmacist panel | Not confirmed by the owner | "Call a pharmacist CDE: 1-8xx-…" | Owner |
| **Libre 3 (not Plus)** | 4 | Only in NIHB and Ypsomed; left out to keep the picker to current Canadian models | Add if the owner wants it | — |

No live card is fully held. The two fully held plan cards (skin and adhesives; the maker's 24/7 line) are not in CHAPTER_META.

---

## F) CHANGE LOG (what the source check changed)

| # | Key | Verify finding | Change made |
|---|---|---|---|
| 1 | All C† rows | Pages now saved word for word (`src/yt/`) and re-read | Every C† now C. Section C rebuilt with the page wording. Pre-publish check 1 marked done. |
| 2 | 2.items.3 | Confirmed; locations are "participating HPSA collection locations"; spell out HPSA and PEI | "the Health Products Stewardship Association (HPSA) gives out free sharps containers at participating collection locations, such as pharmacies"; "Prince Edward Island". |
| 3 | 2.items.5 (new) | Terminology 3 / R22: no source outside the five provinces | New item "Elsewhere in Canada, ask your pharmacy how to return used sharps" (instruction). R22 updated to make it the default. |
| 4 | 4.items.1 | Partly; Safety 2: "so you don't need finger pricks" contradicts 1.items.5 and 5.items.7 | "…so it can read your sugar without a finger prick each time". |
| 5 | 4.note | Terminology 1: spell out CDE | "a Liivv pharmacist who is a Certified Diabetes Educator (CDE)". |
| 6 | 4.figure G7 wear (meta + `wearDays`) | Partly: "up to 10 days, with a 12-hour grace period at the end"; "can't be restarted" not on the page; Safety 3 | `wear: { upToDays: 10, graceHours: 12 }` (`restart` removed); "Up to {days} days, with a {hours}-hour grace period at the end". Restart line HELD (E); locator fix listed (A.1). |
| 7 | 4.figure G7 ↔ t:slim X2 | Partly: Dexcom footnotes "Not all connections are available in Canada"; Tandem names no model | Basis `twoMakers` → `sensorMakerOnly`, source `dexcom-pumps-and-pens` only, with `caveat: 'notAllInCanada'` and the new `caveats.notAllInCanada` message. Same in 13.figure. Tandem's own line added as fact `usesDexcom` ("works with a Dexcom sensor, sold separately"). |
| 8 | 4.figure G6 ↔ t:slim X2 | **Not confirmed**; Safety 3 | Pairing removed from both pickers. G6 now has `notConfirmed: ['tslimX2']`; t:slim X2 has `notConfirmedSensors: ['dexcomG6']`. HELD in E. |
| 9 | 4.figure `notConfirmed`, 13.figure `notConfirmedSensor` | Follows from 8: the old wording ("Not confirmed in Canada") asserted absence | "Not confirmed by the Canadian sources we checked: {pumps}" and "{sensor}: not confirmed with this pump by the Canadian sources we checked". |
| 10 | 4.figure G6 → G7 notice | Partly: Dexcom invites transition; Ypsomed says phase-out in stages, G6 still fully supported | "Dexcom is phasing out G6 and asking G6 users to move to G7. Ypsomed says G6 is still fully supported with mylife Loop for now. Check with your team before you switch". Sources `dexcom-canada`, `ypsomed-mylife-loop`. |
| 11 | 4.figure recall notice | Confirmed; Safety 7: add where to check | Wording follows Abbott's ("distributed in Canada"), names FreeStyle Libre 3 Plus in full, ends "Check Abbott's notice before you open a new box". Health Canada Recalls pointer HELD (not registered). |
| 12 | 4.figure / 13.figure Guardian 4 ↔ 780G | Partly: MiniMed's page no longer names Guardian 4; NIHB names it with the 780G | Basis `makerAndGovernment` → `government`, source `isc-nihb-updates` only. Basis message renamed accordingly; `fromMaker` now mentions government programs. Locator fix listed. |
| 13 | 4/13.figure basis keys | Follows from 7, 8, 12 | `oneMaker` split into `pumpMakerOnly` and `sensorMakerOnly`; wording "names this pairing" instead of "says so". |
| 14 | 6.items.2 | Partly: limits for "clients managing diabetes with insulin"; product is Libre 3, not Libre 3 Plus; spell out NIHB; Scope 3 (brand outside pickers) | Brand removed: "for one sensor it covers, the Non-Insured Health Benefits (NIHB) program for eligible First Nations and Inuit allows up to 14 every 6 months, with prior approval, for people who manage their diabetes with insulin". |
| 15 | 6.figure.graceNote | Scope 3: names Dexcom G7 outside a picker | "If your sensor has a grace period after its wear time, the calculator doesn't count it." R23 updated. |
| 16 | 7.items.3 | Confirmed; DC's "shorter needles with a smaller thickness" eases R18 | "Diabetes Canada suggests shorter, thinner needles. Diabète Québec suggests 4, 5 or 6 mm…". `dc-getting-started-with-insulin` already on card 7. |
| 17 | 7.items.4 | Partly: DQ frames it "In adults" | Starts "For adults,"; reordered to "a skin lift may not be needed with a 4 mm needle, and to use one with a needle 8 mm or longer". |
| 18 | 8.items.3 | Partly: DC says "Rapid-acting insulin pens or syringes" | "keeping rapid-acting insulin pens or syringes as a backup". |
| 19 | 8.items.4 | Terminology 1: spell out CATSA | "The Canadian Air Transport Security Authority (CATSA) says…". 11.items.7 keeps "CATSA". |
| 20 | 8.note | Safety 1 (R17, urgent): interim too soft | "Some insulins are stronger than U-100. Don't use a syringe with insulin from a pen until you've asked your pharmacist." Kept as an instruction; the check's stronger "Don't draw insulin out of a pen with a syringe" is the held claim itself, so it waits on R17. R17 now records the Toujeo monograph finding and recommends option (a). |
| 21 | 10.items.4, 10.figure.caption, rotationMap meta | Partly: "at least 1 to 2 cm" | "leaving at least 1 to 2 cm"; caption "at least a finger width"; meta `spacingCm` → `spacingCmAtLeast`. |
| 22 | 11.items.6 | Confirmed; page says "Do not place…", not "never" (voice rule) | "not in checked luggage". |
| 23 | 13.items.2 | Partly: Tandem names no model; MiniMed no longer names Guardian 4 | "Makers' Canadian sites list some of the sensors that work with their pumps…". |
| 24 | 13.figure extendedSets | Confirmed, qualifier missing: "Use exclusively with the Extended reservoir" | "MiniMed's Extended infusion set is made to be worn twice as long. MiniMed says to use it only with the Extended reservoir". |
| 25 | 13.figure warranty | Confirmed: "Four-Year Limited Warranty" | "{years}-year limited warranty". |
| 26 | 13.figure loopTraining | Partly: in-app training "will take you about 60 minutes" | "The maker asks you to finish the app's training first. It takes about {minutes} minutes". |
| 27 | 14.items.4 | Partly: "CGM applicators with needles"; spell out PEI | "sensor applicators with needles"; "Prince Edward Island"; added "Elsewhere, ask your pharmacy" (R22). |
| 28 | 14.note, card 14 meta | Safety 4: pointer was plain text and named no action; no link field exists | Note now "If your sugar is high and you can't explain it, check your ketones and follow On a pump: an unexplained high, in Staying Safe." `noteVisible: true`; `bt1d-dka-and-ketones` added to sources; the missing note-link field listed as a build item (A.2 item 5). |
| 29 | programsBand.cards.2 | Partly: prior approval stated only for Libre 3; 800/100 is for insulin users; eligibility | Heading "First Nations and Inuit (NIHB)"; body "For eligible First Nations and Inuit, the… (NIHB) program covers some sensors for people who manage their diabetes with insulin. Some need prior approval. It also covers up to 800 test strips every 100 days for people who use insulin." |
| 30 | governance.disclaimer | Follows from 12 | "…from each maker's Canadian site, or a government program, on the date shown". |
| 31 | pharmacist.body | Scope 4: "for all of Canada" needs owner confirmation | Wording kept to match Staying Safe; new ruling R25 (owner). |
| 32 | Section A | Locators wrong (Terminology 4) and new locator facts | A.1 bookkeeping list added; A.3 meta updated as above. |
| 33 | Not applied (optional) | 5.items.7: add "Don't delay treating a low to find your meter" | Not added: no Staying Safe card carries that exact sourced line to link to. Card 5's finger-check line stands. |
| 34 | Not applied (optional) | 5.items.7: add DC's "up to 15 minutes" lag; band card 3: "your medical practitioner fills in Part B" | Not added, to keep the cards short; both are confirmed if wanted later (Staying Safe card 4 carries the sensor lag). |
| 35 | Not changed | Every other row Confirmed; urgent exit wiring; no International label; no Diabetes Express; no product placements | No change. |

### F.2 Changes from the fix list (2026-10-05)

Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `chapters-meta.ts`, `device-pairings.ts`, `tool-figures.tsx`, `sources-meta.ts` and the shared engine (`_microsite`). No verified English sentence of the cards changed except the calculator's validation line (row 38). Section B above still shows the wording from before these changes.

| # | Key | Reason | Change made |
|---|---|---|---|
| 36 | 14.note (EN + FR); meta card 14 `links` | Fix list 5: the pointer was plain text | Tags only, around the existing words: "<link>On a pump: an unexplained high</link>" / "<link>Sous pompe : une glycémie élevée inexpliquée</link>". The phrase links to Staying Safe card 9 (`staying-safe#card-9`), locale-aware. |
| 37 | 6.figure.notices.recall, 13.figure.notices.recall (new, EN + FR); `device-pairings.ts` | Fix list 3: the recall notice must show wherever Libre 3 Plus appears | The Libre 3 Plus notice is marked `everywhere` in `device-pairings.ts` (one entry), and now shows under Libre 3 Plus in the pump picker (the mylife YpsoPump pairing and Omnipod 5's "not confirmed" line) and under the calculator when its Libre 3 Plus preset is picked, with its source line. The two new keys repeat card 4's verified notice word for word, EN and FR. |
| 38 | 6.figure.invalid (EN + FR) | Fix list 6: state each field's limits | "Enter whole numbers: up to 99 sensors and 30 days each." → "Enter whole numbers: 1 to 99 sensors, 1 to 30 days each, and 1 to 366 days to cover." FR: "Entrez des nombres entiers : jusqu’à 99 capteurs et 30 jours chacun." → "Entrez des nombres entiers : de 1 à 99 capteurs, de 1 à 30 jours chacun, et de 1 à 366 jours à couvrir." The export now checks all three limits against the meta. |
| 39 | meta `heroImage` (hero and closing) | Fix list 7: Staying Safe uses the same image | `hero.png` → `chapter-essentials.png` (a meter, lancing device and strips), an existing archive image. |
| 40 | Band cards 2 and 3 links (FR) | Fix list 10: on /fr the NIHB and CRA links were dropped | Both links now show on /fr and open the publisher's French page: NIHB https://www.sac-isc.gc.ca/fra/1578079214611/1578079236012 ("Mises à jour du Programme des services de santé non assurés", dated 2026-07-30) and CRA https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/segments/deductions-credits-impot-personnes-handicapees/credit-impot-personnes-handicapees/admissible-ciph/soins.html ("Soins thérapeutiques essentiels : Critères d’admissibilité"), both loaded 2026-10-05. New engine field `hrefFr` on a band link. The register also has hrefFr and labelFr for `isc-nihb-updates`, `isc-nihb-eligibility`, `cra-dtc-life-sustaining-therapy` and `cra-rc4064-2025`. The labels already existed in fr.json; the links stay behind the `bandLinks` French gate. |
| 41 | Pickers (FR only) | Fix list 10: French joining word and punctuation | The mylife Loop pairing reads "mylife YpsoPump avec CamAPS FX (mylife Loop)" on /fr (`pairedNameFr`; the device names are unchanged). Source lines join titles with " ; " on /fr ("Sources : A ; B"). EN unchanged. |
| 42 | Shared interface text: `ui.chapter.titleSuffix` (new, EN + FR) | Fix list 11: /fr page titles ended in English | Every Diabetes chapter's page title now ends "| Diabetes Care | Liivv" in English (unchanged) and "| Soins en diabète | Liivv" in French, read from the messages instead of the site config. |

---

## G) NEW SITE FIGURES NEEDED

All are named in the plan's "03 · Your Tools" section (meter compatibility picker, ecosystem picker, "My pump" picker, sensor restock calculator, rotation map). Each one:
- is a `DiabetesFigureMeta` kind, drawn by `site-figures.tsx`;
- has a French review gate of the same name in `GATED_KINDS`;
- AUGMENTS its card, so the card's sentences stay as they are;
- shows no product, price, cart action or shop link.

Brand and model names are structural (in meta, like citation labels) and never go through translation. Every word around them is in the message tree.

**Common picker behaviour (G1–G3):**
- A `fieldset` of radio buttons, one per device, legend from `figure.legend`. Nothing is preselected; `figure.statusNone` shows until a choice is made.
- On selection, a `role="status"` line reads `figure.status`, and the panel shows that device's entry.
- Each pairing or fact line carries its basis line (`figure.basis.*`), any caveat (`figure.caveats.*`), and a footnote with the SourceId's citation label (from `SOURCE_META`).
- The panel ends with `figure.fromMaker` and the `checkedOn` date. Under R16 option (b), entries tagged `pumpMakerOnly` or `sensorMakerOnly`, and maker-only fact lines, are removed at build time (`held: 'makerOnlyFacts'`) and their words go into `HELD_CLIENT_MESSAGES`.
- Selection is kept in `sessionStorage` (wrapped in try/catch) as a per-viewer convenience only.
- **No-JS fallback:** every device's entry renders as a plain definition list, one after another (`<details>` per device, all closed), so find-in-page reaches everything. The status line is absent.

### G1. `meterMatch`: meter compatibility picker (card 2) — HELD (`held: 'meterData'`)
- **Data** (A.3): `families[]`, each with `id`, `meters`, `strips | null`, `lancing | null` (or `{ inBox[] }`), `control | null` (or `{ product, fact, sources }`), plus `checkedOn`. `null` renders `figure.notConfirmed`. Today only two rows have data (Contour Next control solution; the Verio Reflect box contents), both maker-only (C-M).
- **Behaviour:** pick a meter. Rows: Test strips / Lancing device and lancets / Control solution, each with a value or "Not confirmed here yet…".
- **Release rule:** ships when every listed family has its strip row confirmed on a registered page and R16 is ruled. Until then the card's own sentences and card 3's printable stand in.
- **No-JS:** a definition list per family.

### G2. `sensorPicker`: sensor ecosystem picker (card 4; data reused by cards 6 and 13)
- **Data** (A.3): `sensors[]`, each with `id`, `name`, `wear` (`{upToDays, graceHours?, fromAge?, sources}` | `null`), `pumps[]` (`{pump, basis, caveat?, sources}`), optional `notConfirmed[]`, `forPump`, `notice {key, sources}`, review-only `listedBy[]`; plus `pumpNames` and `checkedOn`.
  - Dexcom G7: up to 10 days + 12 h grace; Omnipod 5 (two makers); t:slim X2 (sensor maker only, "not all connections are available in Canada").
  - Dexcom G6: wear held; Omnipod 5 and mylife Loop (two makers); t:slim X2 not confirmed; G6 → G7 notice.
  - FreeStyle Libre 3 Plus: up to 15 days, from age 2; mylife Loop (pump maker only); Omnipod 5 not confirmed (owner); recall notice.
  - FreeStyle Libre 2: wear held; no pump pairing.
  - Guardian 4, labelled "For MiniMed 780G": wear held; 780G (government program).
- **Behaviour:** pick a sensor. Panel: (1) "How long it's worn" (`wearDays`, or `wearUpTo` + `fromAge`, or `wearNotConfirmed`); (2) "Works with these pumps" with basis and caveat lines, or `noPumps`; (3) `notConfirmed`; (4) notice in a neutral callout, not the urgent tone. Nothing reads a glucose number. The data lives in one module (`core/lib/diabetes/compatibility.ts`, per the plan), shared with G3 and G4.
- **No-JS:** one definition list per sensor.

### G3. `pumpPicker`: "My pump" supplies-what-fits picker (card 13)
- **Data** (A.3): `pumps[]`, each with `id`, `name`, `sensors[]` (`{sensor, basis, caveat?, sources}`), optional `notConfirmedSensors[]`, `facts[]` (`{key, …numbers, sources}`), `notConfirmed[]` (open-question keys), review-only `listedBy`. Pumps: MiniMed 780G, Tandem t:slim X2, mylife YpsoPump, Omnipod 5, Omnipod DASH. A pairing is stated once, in G2, and G3 reads it inverted, so cards 4 and 13 cannot disagree.
- **Behaviour:** pick a pump. Panel: (1) "Sensors it works with" (basis, caveat), plus each `notConfirmedSensor` line, or `noSensors` for DASH; (2) "About its supplies": `factLines.*`; (3) "Not confirmed here yet", led by `openQuestionsLead`, listing `openQuestions.*`; (4) a link to the pharmacist CDE request page (`PHARMACIST_CDE_REQUEST_HREF`, sign-in needed, `hrefLang: 'en'`). No catalogue product names, no shop links.
- **No-JS:** one definition list per pump.

### G4. `restockCalc`: sensor restock calculator (card 6)
- **Data:** `presets` `[{ sensor, days, sources }]` (G7 10, Libre 3 Plus 15, read from G2's confirmed wear); `maxSensors` 99, `maxDays` 30, `maxCover` 366.
- **Behaviour (arithmetic only):** inputs are a sensor select (presets plus "Another sensor (enter the days)"), days each (prefilled for a preset, editable for "another"), sensors you have, and days to cover (optional). `days = have × daysEach`; the date is today plus `days`, in the page locale's long date format. With a cover, `need = ceil(cover ÷ daysEach)`, `more = max(0, need − have)`, reading `needMore` or `enough`. Presets show the brand-free `graceNote`. Invalid input shows `invalid` and no result. A `role="status"` line reads results as they change. Nothing is stored, sent or compared with coverage; no shop or Subscribe & save link.
- **No-JS:** inputs not rendered; `figure.noJs` shows the rule and a worked example (6 × 10 = 60 days).

### G5. `rotationMap`: injection rotation map (card 10). Optional.
- **Data:** `{ zones: 4, clearCm: 5, spacingCmAtLeast: [1, 2], weeksPerZone: 1 }`, for review parity; the words are in `figure.*`.
- **Behaviour:** a static, decorative inline SVG (`aria-hidden`, with `figure.caption` as visible text): a rounded rectangle for the belly, a dot for the belly button and a dashed keep-clear circle labelled `figure.centre`, four quadrants labelled "Week 1" to "Week 4", with small dots at least a finger width apart in one zone. No body outline, no interactivity, theme tokens only.
- **No-JS:** server-rendered; the card's own list carries every fact.
- **If not built:** drop the figure from card 10's meta. The card reads complete without it.

### F.3 Released with the Funding & Coverage page (2026-10-06)

The held band door (section E, "Band door to Funding & Coverage") is released now that `/liivv-health/diabetes-care/funding` exists. The held entry gave only a short form ("Your province's programs: see Funding & Coverage"), so the card's body is new wording, written to claim no more than the funding page shows. It is navigation only and names no register entry; the funding page cites its own sources. FR is a machine-translated draft, and on /fr in production the link stays behind the `bandLinks` gate like the other band links.

| # | Key | Reason | Change made |
|---|---|---|---|
| 43 | programsBand.cards.4 (new, EN + FR); meta `programsBandLinks[3]`, `programsBandCards[3]` | The page the door waited on is built | Heading "Your province’s programs"; body "Funding & Coverage shows what we’ve confirmed for your province, with a link to each official page."; link "Funding & Coverage" → `/liivv-health/diabetes-care/funding` (same tab, page locale). FR: "Les programmes de votre province" / "Financement et couverture présente ce que nous avons confirmé pour votre province, avec un lien vers chaque page officielle." / "Financement et couverture". The engine's band links now take a Liivv path, put in the page locale. |
| 44 | Section E, "Ontario coverage specifics" | It is on the Funding page | The held item stays out of this chapter; its "check" now points at the Funding page instead of "build the page" |

### F.4 Changes after the full-site review (2026-10-06)

| # | Key | Was | Now | Why |
|---|---|---|---|---|
| 45 | `6.figure.invalid` (EN and FR); restock calculator | "1 to 99 sensors"; 0 sensors was an error | "0 to 99 sensors" (FR "de 0 à 99 capteurs"). With 0, the "lasts about" line is skipped and "To cover {cover} days you need {need}: {more} more than you have" gives the total | Browser QA 12: starting from none is a real case |
| 46 | FR `programsBand.cards.1.links.1.label` | "Comparaisons par province et territoire — Diabète Canada" | "Comparisons by Province/Territory — Diabète Canada" (the register title, untranslated; the engine adds "(en anglais)") | Link crawl 9: a title is never translated, and the page is English only |
| 47 | Register `dc-comparisons-by-province` | https://www.diabetes.ca/comparisons-by-province-territory (now a redirect) | https://www.diabetes.ca/advocacy-and-policy/advocacy-reports/comparisons-by-province-territory, here and in the band link | Link crawl 4 |

The "Your Tools" Rule of 15 walk-through fix (a "Back to step 2" button) is in staying-safe.md F.5 #60; the figure is shared. Owner question C42 (t:slim X2 with Dexcom G6).

### F.5 Clinical rulings applied (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md). French is machine-drafted and awaits review.

| # | Key | Change (EN, then FR) | Ruling |
|---|---|---|---|
| 1 | `8.items.2` | EN "Insulin comes in more than one strength. Diabetes Canada’s list of insulins includes U-100, U-200 and U-700 products" → "Insulin comes in more than one strength. Most is U-100 (100 units/mL). Some insulins are stronger, such as U-200, U-300, U-500 or U-700, and each of these comes in its own pen" · FR → "L’insuline existe en plus d’une concentration. La plupart est de l’U-100 (100 unités/mL). Certaines insulines sont plus concentrées, comme l’U-200, l’U-300, l’U-500 ou l’U-700, et chacune se présente dans son propre stylo" | [C7](clinical-rulings-2026-10-06.md#c7) |
| 2 | `8.items.5` | New (EN) "If your insulin is stronger than U-100 (the label says 200, 300, 500 or 700 units/mL), never use a syringe to take it out of the pen. A syringe can’t measure it correctly, and you could get far too much insulin and a severe low" · FR "Si votre insuline est plus concentrée que l’U-100 (l’étiquette indique 200, 300, 500 ou 700 unités/mL), n’utilisez jamais de seringue pour la retirer du stylo. Une seringue ne peut pas mesurer la dose correctement, et vous pourriez recevoir beaucoup trop d’insuline et faire une hypoglycémie grave" | [C7](clinical-rulings-2026-10-06.md#c7) |
| 3 | `8.note` | EN "Some insulins are stronger than U-100. Don’t use a syringe with insulin from a pen until you’ve asked your pharmacist." → "Always carry a spare pen and needles. If your pen stops working, or you can’t use it, ask your pharmacist what to do before you use a syringe." · FR → "Ayez toujours sur vous un stylo et des aiguilles de rechange. Si votre stylo ne fonctionne plus, ou si vous ne pouvez pas l’utiliser, demandez à votre pharmacien quoi faire avant d’utiliser une seringue." | [C7](clinical-rulings-2026-10-06.md#c7) |
| 4 | `11.items.4` | EN "How long an opened pen or vial lasts depends on the product. Follow the leaflet that came with your insulin" → "How long an opened pen or vial lasts depends on the product. Diabète Québec says most are good for up to 28 days once opened, and some for longer. Follow the leaflet that came with your insulin" · FR → "La durée de conservation d’un stylo ou d’une fiole ouverts dépend du produit. Selon Diabète Québec, la plupart se conservent jusqu’à 28 jours une fois entamés, et certains plus longtemps. Suivez le feuillet qui accompagne votre insuline" | [C15](clinical-rulings-2026-10-06.md#c15) |
| 5 | card 8 sources; register | Registered after reading each file on 2026-10-06: `hc-dpd-pm-toujeo`, `hc-dpd-pm-humalog`, `hc-dpd-pm-tresiba`, `hc-dpd-pm-entuzity`, `hc-dpd-pm-awiqli` (Health Canada DPD product monographs, written by the sponsor; FR where DPD has one; Lyumjev left out, approved but not marketed), `hc-alert-humalog-200-2015` (Health Canada, archived alert) and `ismpc-dose-confusion-2019` (ISMP Canada). All seven added to card 8. Brand names stay in the register, not in the copy. R17 resolved; the section E row "Never draw U-200/U-300" is removed | [C7](clinical-rulings-2026-10-06.md#c7) |
| 6 | card 11 | 11.items.4 cites `dq-all-about-injections`, which now has its French address (the December 2025 « Tout sur l’injection » page). The monographs' in-use times are reviewer evidence in the locators | [C15](clinical-rulings-2026-10-06.md#c15), [C14](clinical-rulings-2026-10-06.md#c14) |
| 7 | R18 | Diabète Québec's lines stay live beside Diabetes Canada's; FIT-only lines stay held; Ch37 is not added to card 7 | [C14](clinical-rulings-2026-10-06.md#c14) |
| 8 | R19, R20, R21, R22, R23 | Kept as built (3.9 time-in-range edge; about 5 cm from the belly button; the AID preference; "ask your pharmacy" for sharps outside HPSA, a source gap; G7 10 days and Libre 3 Plus 15, no grace period) | [C1](clinical-rulings-2026-10-06.md#c1), [C31](clinical-rulings-2026-10-06.md#c31), [C20](clinical-rulings-2026-10-06.md#c20), [C32](clinical-rulings-2026-10-06.md#c32) |
| 9 | Recheck | Dexcom G7 15 Day: Health Canada authorized it 2026-07-13 (Dexcom's investor release, industry); not sold in Canada. When it is, confirm on MDALL or the Canadian labelling, then add it as a separate 15-day sensor to card 6's calculator and the sensor picker, with no grace period | [C31](clinical-rulings-2026-10-06.md#c31) |
| 10 | D.3 check 8 | Closed: Diabetes Canada's "keep taking insulin" and 2-or-more-in-4-hours lines are on Staying Safe card 8 | [C17](clinical-rulings-2026-10-06.md#c17) |

### F.6 Clinical rulings applied: targets, types and other (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md), rulings C16–C45 (the verifier's final copy; where a choice was left to the owner, the stated default). Applied in `chapters-meta.ts`, `device-pairings.ts` and `sources-meta.ts` / `sources-review.ts`. Sections B and C above still show the earlier wording and claims rows; the keys and claims below are current. All French is machine-drafted and awaits the francophone review.

| # | Key or place | Change | Ruling |
|---|---|---|---|
| 1 | cards 1 and 2 (meta) | Ask: `pharmacist` → `pharmacistCde` (meters go to the pharmacist CDE); card 3, the meter lesson, stays `educator`. One role per card. R24 closed | [C33](clinical-rulings-2026-10-06.md#c33) |
| 2 | `device-pairings.ts` | G6 with the t:slim X2 moves from `NOT_CONFIRMED` to `PAIRINGS` (`basis: 'pumpMakerOnly'`, sources `tandem-tslim-x2-ciq-user-guide-ca`); G7 with the t:slim X2 goes from `sensorMakerOnly` to `twoMakers` (sources `dexcom-pumps-and-pens`, `tandem-tslim-x2-ciq-user-guide-ca`), keeping Dexcom's `notAllInCanada` footnote (the default; the owner may drop it). The G6-to-G7 notice stays. Both block comments updated; `DEVICES_CHECKED_ON` is now 2026-10-06. Cards 4 and 13's pickers show both pairings with their bases. No message changed | [C42](clinical-rulings-2026-10-06.md#c42) |
| 3 | register | New `tandem-tslim-x2-ciq-user-guide-ca` (industry; Tandem's Canadian "t:slim X2 Insulin Pump with Control-IQ+ Technology User Guide", mmol/L, software 7.10; EN AW-1018762_B of 2026-03-05 and FR AW-1019341_A of 2026-05-20, both read 2026-10-06: "Both the Dexcom G6 CGM and the Dexcom G7 CGM are compatible…"). `dexcom-pumps-and-pens` and `tandem-canada` locators note it. Never the only source for a claim: the G6 pairing is labelled "pump maker only" | [C42](clinical-rulings-2026-10-06.md#c42) |
| 4 | R16 (still open) | Its default text in the review pack now lists the bases after C42; no pairing is `sensorMakerOnly` now | [C42](clinical-rulings-2026-10-06.md#c42) |
| 5 | R10 | Closed: alcohol is ruled in Every Day Living card 4 | [C16](clinical-rulings-2026-10-06.md#c16) |

### F.7 Owner's business answers applied (2026-10-06)

From the owner's answers of 2026-10-06 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)). French machine-drafted.

| # | Key | Change | Why |
|---|---|---|---|
| 1 | `pharmacist.body`, `pharmacist.cta` | EN body → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province. Your diabetes team decides your treatment and settings." · FR → "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province. C’est votre équipe de soins en diabète qui décide de votre traitement et de vos réglages.". Under the body, the panel shows the CDE contact from `ui.contact` (DIABETES_SITE.contact): "Call 1-844-561-1254" (tel:+18445611254; FR "Appeler le 1 844 561-1254"), "Email BayshoreExpress@bayshore.ca", "Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays", and "About Bayshore Express Pharmacy" (https://bayshoreexpresspharmacy.ca/about/; FR /fr/a-propos-de-nous/, `bep-about`). The `cta` "Request a call" is removed: the panel has no button, and the hero's "Ask a pharmacist" opens the panel (`#chapter-cde`) | Owner A2, B5, B9, B10, B12 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)) |
| 2 | `13.note`, `13.figure.openQuestionsLead` | "…ask a Liivv pharmacist CDE." → "…ask a Certified Diabetes Educator at Bayshore Express Pharmacy."; "Ask your pump maker or a Liivv pharmacist CDE:" → "Ask your pump maker or a CDE at Bayshore Express Pharmacy:" · FR "…posez la question à un éducateur agréé en diabète de la Pharmacie Bayshore Express." / "Demandez au fabricant de votre pompe ou à un éducateur agréé en diabète de la Pharmacie Bayshore Express :" | A2, B12 |
| 3 | Pump picker (`ui.pumpPicker.askCde`; meta `askHref`) | "Request a call with a Liivv pharmacist CDE (sign-in needed)" → "How to reach a CDE at Bayshore Express Pharmacy" (FR "Comment joindre un éducateur agréé en diabète de la Pharmacie Bayshore Express"), opening the CDE panel on the same page (`#chapter-cde`) instead of the appointment page | A2, B6, B9 |
| 4 | R25 | Closed: the CDEs at Bayshore Express Pharmacy support customers across Canada. The "Ask a pharmacist CDE" chip stays (C33) | B5 |
| 5 | Omnipod | Pods are stocked; Omnipod 5 with Libre stays "not confirmed" (owner: not yet in Canada) | A3 |

### F.8 Funding step (2026-10-06)

| # | Key | What changed | Why |
|---|---|---|---|
| 1 | `programsBand.cards.4.body` (the door to Funding & Coverage) | "Funding & Coverage shows what we’ve confirmed for your province, with a link to each official page." → "… with a link to each official page, and how paying works when you order from us." (FR "… avec un lien vers chaque page officielle, et comment le paiement fonctionne quand vous commandez chez nous."). The page itself now says the Liivv pharmacy in each province bills that province's drug plan directly (funding.md, G-26) | Owner answers A6, B13 |

### F.9 Commerce step: shop strips (2026-10-06)

How a strip behaves (all chapters): the products are named in `diabetes-care/chapters/chapter-shop.ts` (owner answer B21, "Now?"), drawn by the shared engine (`_microsite/shop/`) under the card's referral chip, and read from the catalogue on every request. A product shows only while the store shows it, sells it and has it in stock, and never when its description names or links another retailer or gives its phone number (17 descriptions still do; OPEN-QUESTIONS B3). A product with a required option or modifier (85 diabetes products carry a required "Test" modifier today) gets "Choose options", a link to its page, instead of a one-click add. No kit is listed (A4). One switch, `SHOP_SWITCH.placements`, turns every strip off. Every placed id is health-revealing by id for analytics (`sensitive-products.ts`). The strip's words are `ui.chapter.shop.*` (French machine-drafted, not behind a review gate, as on Ostomy).

| # | Card | Strip |
|---|---|---|
| 1 | 1 Choosing a meter | `meters`: 4287, 4524, 4556, 4402 |
| 2 | 2 Strips, lancets and control solution | `matching`, by meter brand: OneTouch (strips 4948, lancets 4458, control 7356); Contour (strips 4714, lancets 4398); Accu-Chek (strips 4656, Softclix 4945); FreeStyle (strips 4698, lancets 4872, control 4663). 4714 and 4945 do not render today: their descriptions link another retailer |
| 3 | 4 Sensors | `readers`: FreeStyle Libre 3 Reader (4674), Dexcom G7 Receiver (4723) |
| 4 | 5 Wearing a sensor | `wearing`: overpatches (4841, 4310), "Choose options" (colour and the "Test" modifier). No adhesive claim |
| 5 | 6 Sensor restock calculator | `restock`: 4227, 4316, 4479, 4967. No Subscribe & save line |
| 6 | 7 Pen needles | `penNeedles`: 4777, 7544, 4342 |
| 7 | 8 Syringes | `syringes`: 4655, 4467, 4474 |
| 8 | 9 Giving an injection | `sharps`: 4350 |
| 9 | 11 Keeping insulin safe | `keepCool`: Frio wallets 4844, 4812, 4799. 4812 does not render today: its description links another retailer |
| 10 | 13 Your pump's supplies | `pumpSupplies`, by pump: MiniMed (4750, 4862), Tandem (4253, 4658), mylife (4665, 4314), Omnipod pods (8090, 8091), which appear only once the owner makes them visible in the store |
| 11 | 14 Pump backup | `pumpBackup`: 4532, 4823, 4474 |
| 12 | 3, 10, 12 | None: teaching only |

### F.10 Fixes after the full-site review (2026-10-06)

From the browser QA, the link crawl and the step reviews of 2026-10-06. French machine-drafted. Engine-wide changes are in new-to-the-journey.md F.8.

| # | Where | Change | Why |
|---|---|---|---|
| 1 | Citations (meta) | "Diabète Québec — All about injections" opens Diabète Québec's French page on /fr (https://www.diabete.qc.ca/le-diabete/la-gestion-du-diabete/linsuline/tout-sur-linjection/, the register's `hrefFr` for `dq-all-about-injections`) | Crawl 4 |
| 2 | `4.figure.fromMaker`, `13.figure.fromMaker` | "…checked 5 October 2026. Makers update…" → "…checked 5 October 2026; the t:slim X2 pairings from Tandem’s Canadian user guide, read 6 October 2026. Makers update…" (FR « …vérifié le 5 octobre 2026 ; les jumelages de la t:slim X2 selon le guide d’utilisation canadien de Tandem, lu le 6 octobre 2026. … »). The two t:slim X2 pairs have rested on that guide since ruling C42; the meter picker's line is unchanged | K3 |
| 3 | `ismpc-dose-confusion-2019` locator (`sources-review.ts`) | Adds the bulletin's stronger sentence, re-read 2026-10-06: "each product is marketed in its own prefilled injection delivery device (known as an insulin pen)", which backs 8.items.2 | K1 |
| 4 | `hc-dpd-pm-humalog`, `hc-dpd-pm-tresiba` (register) | French titles as the French monographs print them, read 2026-10-06: « Monographie de produit : HUMALOG, HUMALOG KwikPen à 200 unités/mL, HUMALOG MIX25, HUMALOG MIX50 » (cover and page footer; revised 2021-04-12) and « Monographie de produit incluant les renseignements sur le médicament pour le patient : Tresiba » (revised 2022-10-27) | K2 |

Owner question, not changed (B42): card 8's strip sells U-100 syringes just under the line about never using a syringe with a concentrated insulin.

### F.11 Owner notes 5 and 1 applied (2026-10-07)

From the owner’s review of 2026-10-07 (notes 5 and 1; the diagnosis and its review are in the session record). French machine-drafted, the same change as the English, under the existing draft marker. **Note 5:** the Certified Diabetes Educators are presented as Liivv’s own service: no "Bayshore Express Pharmacy", no Markham, no email and no About link in any customer line; the contact is the phone and the hours (`DIABETES_SITE.contact` = `tel` only; the engine renders email and About only where a site sets them); register id `bep-about` deleted everywhere. The governance line "Liivv is a HelioMed company and part of the Bayshore family" stays (the owner’s own wording, B15). **Note 1:** sources are shown in the element, not named in the prose. Every card ends with a Sources disclosure (closed: up to three publishers, then "+N"; open: "Title, Publisher (year)", "(en anglais)" inside the link on /fr), built from the card’s own `sources` plus those of the figures this locale keeps; "Where this comes from" lists every card, figure, band and lane source, grouped Canadian, international, then makers. Prose now states the fact; a comparison says "In Canada…" / "International guidance…"; a line that gives clinical permission or states a guideline recommendation says "Canadian guidelines…" with the year in the disclosure. Numbers and hedges are unchanged. Every rewritten key is listed below with its new EN and FR.

| # | Key | Now (EN) | Now (FR) | Why |
|---|---|---|---|---|
| 1 | `pharmacist.body` | Liivv’s Certified Diabetes Educators answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to Liivv’s pharmacy in your province. Your diabetes team decides your treatment and settings. | Les éducateurs agréés en diabète de Liivv répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie de Liivv de votre province. C’est votre équipe de soins en diabète qui décide de votre traitement et de vos réglages. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 2 | `ui.pumpPicker.askCde` | How to reach Liivv’s Certified Diabetes Educators | Comment joindre les éducateurs agréés en diabète de Liivv | Owner note 5: the CDE service is Liivv’s (white-label) |
| 3 | `categories.13.note` | Not sure what fits your pump? Have your pump’s model ready, and ask one of Liivv’s Certified Diabetes Educators. | Vous ne savez pas ce qui convient à votre pompe? Ayez le modèle de votre pompe sous la main, et posez la question à un éducateur agréé en diabète de Liivv. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 4 | `categories.13.figure.openQuestionsLead` | Ask your pump maker or one of Liivv’s Certified Diabetes Educators: | Demandez au fabricant de votre pompe ou à un éducateur agréé en diabète de Liivv : | Owner note 5: the CDE service is Liivv’s (white-label) |
| 5 | `categories.1.items.5` | Even if you use a sensor, keep a meter and strips, to double-check a reading and as a backup | Même si vous utilisez un capteur, gardez un lecteur et des bandelettes, pour vérifier une lecture et en réserve | Owner note 1 (category A) |
| 6 | `categories.2.items.1` | Ask which test strips to use with your meter, and whether your meter needs to be coded to read them | Demandez quelles bandelettes utiliser avec votre lecteur, et si votre lecteur doit être codé pour les lire | Owner note 1 (category A) |
| 7 | `categories.2.items.4` | Never put sharps in the garbage or the recycling | Ne jetez jamais d’objets pointus et tranchants aux ordures ni au recyclage | Owner note 1 (category A) |
| 8 | `categories.3.note` | These are good questions to ask. Fill in the lines with your pharmacist or educator, and keep the card with your meter. | Ce sont de bonnes questions à poser. Remplissez les lignes avec votre pharmacien ou votre éducateur, et gardez la carte avec votre lecteur. | Owner note 1 (category A) |
| 9 | `categories.4.items.4` | This technology isn’t for everyone, so talk with your team about whether it’s right for you | Cette technologie ne convient pas à tout le monde : parlez-en avec votre équipe pour savoir si elle vous convient | Owner note 1 (category A) |
| 10 | `categories.5.items.2` | For most people, Canadian guidelines aim for more than 70% of the day between 3.9 and 10.0 mmol/L | Pour la plupart des gens, les lignes directrices canadiennes visent plus de 70 % de la journée entre 3,9 et 10,0 mmol/L | Owner note 1 (category A) |
| 11 | `categories.5.items.4` | Going from 60% to 65% of the day in range adds about an hour a day in range | Passer de 60 % à 65 % de la journée dans la cible ajoute environ une heure par jour dans la cible | Owner note 1 (category A) |
| 12 | `categories.5.note` | Some Canadian sources give the range as 4.0 to 10.0. If your team gave you a range, use theirs. | Certaines sources canadiennes donnent une plage de 4,0 à 10,0. Si votre équipe vous a donné une plage, utilisez la sienne. | Owner note 1 (category C) |
| 13 | `categories.7.items.3` | Shorter, thinner needles are suggested, such as 4, 5 or 6 mm, so the insulin doesn’t go into muscle | Des aiguilles plus courtes et plus fines sont suggérées, comme des aiguilles de 4, 5 ou 6 mm, pour que l’insuline n’aille pas dans le muscle | Owner note 1 (category A) |
| 14 | `categories.7.items.4` | For adults, a skin lift may not be needed with a 4 mm needle. Use one with a needle 8 mm or longer | Chez l’adulte, un pli cutané n’est peut-être pas nécessaire avec une aiguille de 4 mm. Faites-en un avec une aiguille de 8 mm ou plus | Owner note 1 (category A) |
| 15 | `categories.7.items.5` | Put the needle in at 90°, with a quick, smooth motion. With a longer needle, 8 or 12 mm, you may need to gently lift the skin, or go in at 45° | Insérez l’aiguille à 90°, d’un mouvement rapide et fluide. Avec une aiguille plus longue, de 8 ou 12 mm, vous devrez peut-être soulever doucement la peau, ou piquer à 45° | Owner note 1 (category A) |
| 16 | `categories.7.items.6` | If there’s little fat on your arms, legs or belly, a skin lift may be needed even with a 5 or 6 mm needle | S’il y a peu de gras sur vos bras, vos jambes ou votre ventre, un pli cutané peut être nécessaire même avec une aiguille de 5 ou 6 mm | Owner note 1 (category A) |
| 17 | `categories.8.items.3` | If you use a pump, keep rapid-acting insulin pens or syringes as a backup | Si vous utilisez une pompe, gardez en réserve des stylos ou des seringues d’insuline à action rapide | Owner note 1 (category A) |
| 18 | `categories.9.note` | Your pen comes with an instruction book. Read it, so you know how your pen works. | Votre stylo est accompagné d’un mode d’emploi. Lisez-le, pour savoir comment votre stylo fonctionne. | Owner note 1 (category A) |
| 19 | `categories.10.items.1` | Change where you inject each time. This helps prevent fatty lumps that can make insulin work poorly | Changez d’endroit chaque fois que vous vous injectez. Cela aide à prévenir les bosses de graisse qui peuvent nuire à l’action de l’insuline | Owner note 1 (category A) |
| 20 | `categories.10.items.4` | Try leaving at least 1 to 2 cm, about a finger width, between injections, and splitting each area into four zones, using one zone for a week before you move on | Essayez de laisser au moins 1 à 2 cm, soit environ la largeur d’un doigt, entre les injections, et de diviser chaque région en quatre zones, en utilisant une zone pendant une semaine avant de passer à la suivante | Owner note 1 (category A) |
| 21 | `categories.10.items.7` | Injecting into a part of your body you’re about to exercise can make insulin act faster and lower your sugar | L’injection dans une partie du corps que vous êtes sur le point de faire travailler peut faire agir l’insuline plus vite et faire baisser votre glycémie | Owner note 1 (category A) |
| 22 | `categories.11.items.1` | Keep unopened insulin in the fridge, at 2 to 8 °C | Gardez l’insuline non ouverte au réfrigérateur, entre 2 et 8 °C | Owner note 1 (category A) |
| 23 | `categories.11.items.4` | How long an opened pen or vial lasts depends on the product. Most are good for up to 28 days once opened, and some for longer. Follow the leaflet that came with your insulin | La durée de conservation d’un stylo ou d’une fiole ouverts dépend du produit. La plupart se conservent jusqu’à 28 jours une fois entamés, et certains plus longtemps. Suivez le feuillet qui accompagne votre insuline | Owner note 1 (category A) |
| 24 | `categories.11.items.6` | Insulin goes in your carry-on when you fly, not in checked luggage | L’insuline va dans votre bagage de cabine quand vous prenez l’avion, pas dans vos bagages enregistrés | Owner note 1 (category A) |
| 25 | `categories.12.items.3` | Some pumps connect to a sensor and respond to your readings. This is called a hybrid closed-loop system. You may also hear it called automated insulin delivery | Certaines pompes se connectent à un capteur et réagissent à vos lectures. C’est ce qu’on appelle un système hybride en boucle fermée. Vous entendrez peut-être aussi parler d’administration automatisée d’insuline | Owner note 1 (category A) |
| 26 | `categories.12.items.4` | For type 1 diabetes, Canadian guidelines prefer automated insulin delivery for everyone who is willing and able to wear and use the devices | Pour le diabète de type 1, les lignes directrices canadiennes privilégient l’administration automatisée d’insuline pour toutes les personnes qui veulent et peuvent porter et utiliser les appareils | Owner note 1 (category A) |
| 27 | `categories.13.items.1` | Infusion sets and reservoirs are among the pump supplies to keep extras of | Les ensembles de perfusion et les réservoirs font partie des fournitures pour pompe à avoir en réserve | Owner note 1 (category A) |
| 28 | `categories.14.items.1` | Make a pump backup plan before you need one | Préparez un plan de rechange pour votre pompe avant d’en avoir besoin | Owner note 1 (category A) |

Rulings whose in-sentence credit owner note 1 supersedes (2026-10-07; recorded in clinical-rulings-2026-10-06.md and on the register entry in sources-review.ts):

| Ruling | Where | Now |
|---|---|---|
| C32 | `2.items.4` | As on New to the Journey: the HPSA line is a plain statement; the program line (2.items.3, 14.items.4) keeps the name |

Corrections after the verification of notes 5 and 1 (2026-10-07):

- `categories.5.items.3` (not rewritten in F.11, so not in the table): "It also aims for less than 4% of the day below 3.9" → "They also aim for less than 4% of the day below 3.9", because the line before it (row 10) now says "Canadian guidelines" (plural). FR unchanged: « Elles visent aussi… » already agreed.

### F.12 Owner notes 2 and 3 applied (2026-10-07)

- Card 3 ("My meter, and what goes with it") prints on one page with the header and sources (engine change: new-to-the-journey.md F.10).
- Card 6, the restock calculator, is one tap per answer (note 3): the sensor is a row of radio pills (the presets from `device-pairings.ts`, then "Another sensor (enter the days)", still picked at first); "Days each sensor is worn" and "Sensors you have" are steppers (− box +; the box can still be typed in; the buttons are off at the ends of the range, and both are off while a preset fills the days in); "Days you want to cover (optional)" is chips: None (picked at first), 30, 60 and 90 days (`coverPresets` in chapters-meta.ts), or Another number, which opens the box. The chips are periods to count, not device facts; no wear time was added. Arithmetic, limits and messages are unchanged.
- New words (EN / FR), under the `restockCalc` gate and its draft marker: `figure.less` "One less: {field}" / « Un de moins : {field} »; `figure.more` "One more: {field}" / « Un de plus : {field} »; `figure.coverNone` "None" / « Aucun »; `figure.coverDays` "{days} days" / « {days} jours »; `figure.coverOther` "Another number" / « Un autre nombre »; `figure.coverOtherLabel` "Days to cover" / « Jours à couvrir ».
- Card 13 keeps its "Pump supplies, by pump." strip; the same strip was removed from the funding page (funding.md, 2026-10-07).

### F.13 Owner note 6 applied: the chapter timeline, bookmarks and phones (2026-10-07)

The engine change is in new-to-the-journey.md F.11. Here: all 14 stops are reached and highlighted from the timeline, including the stops that used to leave the previous one highlighted (cards 2, 6, 9 and 11 at 1280x720); every one is listed in the phone sheet. No copy changed.

Corrected after verification (2026-10-07): a link to card 7 in French at 1100x620 landed 20px under the header line while the card was still easing in, and the timeline could show the previous stop for about half a second after a wheel step; both fixed in the engine (new-to-the-journey.md F.11 T2b).

### F.14 Owner notes 8 and 4 and the store’s typeface applied (2026-10-07)

The engine and font change is in new-to-the-journey.md F.12. Here (the page the owner named in note 8): "Checking your glucose" / « Mesurer votre glycémie » now ends 24px above "The right supplies, used well" on a first visit, with no line of text touching another in English or French at 1440 and 768; every product card is 168px wide, card 9’s single product a horizontal card; « réapprovisionnement » in the restock steps no longer runs under its arrow at 768. The page is in Poppins. No copy changed.
