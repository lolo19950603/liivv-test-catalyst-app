# 02 · Staying Safe — chapter copy, after source check (DiabetesCare.chapters.staying-safe)

Version of 2026-10-05. It applies the source check in `content/staying-safe.verify.md` to `content/staying-safe.draft.md`. Not compiled, not in the repo. The structure follows the Ostomy `CHAPTER_META` entry and the `OstomyCare.chapters.<slug>` message shape. The red-flag block uses the same `urgent` keys as `get-to-know-your-stoma`.

Ground rules applied:
- Facts and URLs come only from `dx/survey-canadian-clinical.md`, the plan, and the page and PDF wording recorded in `staying-safe.verify.md` (copies in `scratchpad/src/`). Every "Not confirmed" or "Partly" row in the check has been reworded, re-cited or HELD. Section F lists each change.
- No brand names in the copy. Since 2026-10-06 (B21) cards 3 and 5 carry shop strips (`chapter-shop.ts`; F.9). Card 2, the Rule of 15, never has one.
- No Diabetes Express mentions or links.
- No dosing. There are no glucagon doses, insulin doses or insulin adjustments. The only amounts are Diabetes Canada's amounts for treating a low (Rule of 15, the children's table and the automated-system line).
- No drug-class stop advice on the page. The sick-day sheet's medicine list is HELD by default (R4) and the reader is sent to their pharmacist.
- `diabetes-care/chapters/sources-meta.ts` **still does not exist** (checked 2026-10-05). The SourceIds below are **proposed** in the Ostomy style.

---

## A) META OUTLINE

### A.1 Proposed SourceIds (Diabetes `sources-meta.ts`, Ostomy style)

```ts
export type SourceId =
  | 'dc-cpg-ch14-hypoglycemia-2023'
  | 'dc-hypoglycemia-adults-sheet-2024'
  | 'dc-cpg-ch41-t1d-lifespan-2025'
  | 'bt1d-what-is-glucagon'
  | 'das-low-blood-sugar'
  | 'das-glucagon'
  | 'cps-t1d-in-school-2015'
  | 'dc-kids-in-school'
  | 'dc-exercise-and-activity'
  | 'dc-cpg-ch10-physical-activity'
  | 'dc-cpg-ch11-nutrition-therapy'
  | 'dc-alcohol-and-diabetes-2018'      // NEW after source check: the PDF linked from the 2019 article
  | 'dc-diabetes-and-drinking-2019'
  | 'dc-technology-and-devices'
  | 'dc-checking-blood-sugar'
  | 'dc-cpg-ch9-monitoring-2021'
  | 'bt1d-time-in-range'
  | 'dc-hyperglycemia'
  | 'dc-cpg-ch15-hyperglycemic-emergencies'
  | 'bt1d-dka-and-ketones'
  | 'dc-stay-safe-sick-days-sheet'
  | 'fit-canada-pocket-guide-4th-ed'    // HELD copy only (R9); not cited by any live sentence
  | 'dc-managing-emergency-situations'
  | 'dc-getting-started-with-insulin'
  | 'dq-all-about-injections'           // now cited in copy (card 10, item 4)
  | 'dc-cpg-ch21-driving'
  | 'dc-drive-safe-card';               // now cited in copy (card 1 note)

const DC_ASSET = 'https://www.diabetes.ca/getContentAsset';
const DC_CPG = 'https://www.diabetes.ca/for-professionals/full-guidelines';

export const SOURCE_META: Record<SourceId, SourceMeta> = {
  'dc-cpg-ch14-hypoglycemia-2023': { label: 'Chapter 14: 2023 Update – Hypoglycemia in Adults', href: `${DC_CPG}/chapter-14-2023-update`, hrefLang: 'en' },
  'dc-hypoglycemia-adults-sheet-2024': { label: 'Hypoglycemia: low blood sugar in adults (02/24)', href: `${DC_ASSET}/7f36723d-3507-4657-a579-78b1fd0437e6/0f6cf596-933c-4f74-b36a-77091c512445/hypoglycemia-low-blood-sugar-in-adults.pdf?language=en`, hrefLang: 'en' },
  'dc-cpg-ch41-t1d-lifespan-2025': { label: 'Glycemic Management Across the Lifespan for People With Type 1 Diabetes', href: `${DC_CPG}/chapter-41`, hrefLang: 'en' },
  'bt1d-what-is-glucagon': { label: 'What is glucagon?', href: 'https://breakthrought1d.ca/daily-management/what-is-glucagon/', hrefLang: 'en' },
  'das-low-blood-sugar': { label: 'Low blood sugar: What it is, and what to do', href: 'https://diabetesatschool.ca/understanding/low-blood-sugar-what-it-is-and-what-to-do', hrefLang: 'en' },
  'das-glucagon': { label: 'Glucagon: What it is and how to use it', href: 'https://diabetesatschool.ca/understanding/glucagon', hrefLang: 'en' },
  'cps-t1d-in-school-2015': { label: 'Managing type 1 diabetes in school (CPS position statement, 2015)', href: 'https://cps.ca/en/documents/position/type-1-diabetes-in-school', hrefLang: 'en' },
  'dc-kids-in-school': { label: 'Kids with Diabetes in School', href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/kids-with-diabetes-in-school', hrefLang: 'en' },
  'dc-exercise-and-activity': { label: 'Exercise & Activity', href: 'https://www.diabetes.ca/living-with-diabetes/exercise-fitness/exercise-activity', hrefLang: 'en' },
  'dc-cpg-ch10-physical-activity': { label: 'Physical Activity and Diabetes', href: `${DC_CPG}/chapter-10`, hrefLang: 'en' },
  'dc-cpg-ch11-nutrition-therapy': { label: 'Nutrition Therapy', href: `${DC_CPG}/chapter-11`, hrefLang: 'en' },
  'dc-alcohol-and-diabetes-2018': { label: 'Alcohol and diabetes (04/18)', href: `${DC_ASSET}/cde22e37-4601-4a6b-883d-4299cb760606/0f6cf596-933c-4f74-b36a-77091c512445/alcohol-and-diabetes.pdf`, hrefLang: 'en' },
  'dc-diabetes-and-drinking-2019': { label: 'Diabetes and Drinking', href: 'https://www.diabetes.ca/living-with-diabetes/stories/diabetes-and-drinking', hrefLang: 'en' },
  'dc-technology-and-devices': { label: 'Technology & Devices', href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/technology-and-devices', hrefLang: 'en' },
  'dc-checking-blood-sugar': { label: 'Checking Blood Sugar', href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/checking-blood-sugar', hrefLang: 'en' },
  'dc-cpg-ch9-monitoring-2021': { label: 'Blood Glucose Monitoring in Adults and Children with Diabetes: Update 2021', href: `${DC_CPG}/chapter-9-2021-update`, hrefLang: 'en' },
  'bt1d-time-in-range': { label: 'Time in Range', href: 'https://breakthrought1d.ca/daily-management/time-in-range/', hrefLang: 'en' },
  'dc-hyperglycemia': { label: 'Hyperglycemia', href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/hyperglycemia', hrefLang: 'en' },
  'dc-cpg-ch15-hyperglycemic-emergencies': { label: 'Hyperglycemic Emergencies in Adults', href: `${DC_CPG}/chapter-15`, hrefLang: 'en' },
  'bt1d-dka-and-ketones': { label: 'Diabetic ketoacidosis (DKA) and ketones', href: 'https://breakthrought1d.ca/daily-management/diabetic-ketoacidosis-dka-and-ketones/', hrefLang: 'en' },
  'dc-stay-safe-sick-days-sheet': { label: 'Stay Safe When You Have Diabetes and Are Sick or at Risk of Dehydration', href: `${DC_ASSET}/5bdc8b7c-4402-4d72-b86b-700f9dfd3b9d/0f6cf596-933c-4f74-b36a-77091c512445/stay-safe-when-you-have-diabetes-and-sick-or-at-risk-of-dehydration.pdf?language=en`, hrefLang: 'en' },
  'fit-canada-pocket-guide-4th-ed': { label: 'Recommendations for Best Practice in Injection Technique, 4th ed. (pocket guide)', href: 'https://fit4diabetes.com/wp-content/uploads/2025/08/EMB-25-442-FIT-Pocket-Guide-Update-Layout_E01.pdf', hrefLang: 'en' },
  'dc-managing-emergency-situations': { label: 'Managing Diabetes in Emergency Situations', href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/managing-diabetes-in-emergency-situations', hrefLang: 'en' },
  'dc-getting-started-with-insulin': { label: 'Getting Started with Insulin', href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/getting-started-with-insulin', hrefLang: 'en' },
  'dq-all-about-injections': { label: 'All about injections', labelFr: "Tout sur l'injection", href: 'https://www.diabete.qc.ca/en/diabetes/diabetes-management/insulin/all-about-injections/', hrefLang: 'en' },
  'dc-cpg-ch21-driving': { label: 'Diabetes and Driving', href: `${DC_CPG}/chapter-21`, hrefLang: 'en' },
  'dc-drive-safe-card': { label: 'Drive Safe with Diabetes', href: `${DC_ASSET}/a78b7c7d-17c8-4943-8cbc-c4d4ed7270c4/0f6cf596-933c-4f74-b36a-77091c512445/drive-safe-with-diabetes.pdf?language=en`, hrefLang: 'en' },
};
// sources-review.ts notes:
// - fit-canada-pocket-guide-4th-ed: fit4diabetes.com is run by embecta ("© 2023 Embecta Corp."). Industry-run; HELD copy only (R9).
// - bt1d-dka-and-ketones: the page now carries a "with support from Abbott" story campaign (Abbott makes ketone meters).
//   The ketone ranges themselves are editorial. No copy disclosure needed; record here.
// - dc-alcohol-and-diabetes-2018: dated 04/18 and "reflects the 2018 CPG". Check it is still DC's current sheet.
// - cps-t1d-in-school-2015: check the CPS statement has not been retired.
```

### A.2 Proposed CHAPTER_META entry

Additions this entry needs in the Diabetes meta, beyond what Ostomy has, are marked **NEW**:
- **NEW** `sources?: SourceId[]` on `CategoryMeta`. It backs the card's own sentences, is review-only and never renders.
- **NEW** ask role `pharmacistCde`, labelled "Ask a pharmacist CDE". The ask role `team` is relabelled in the DiabetesCare namespace as "Ask your diabetes team".
- **NEW** groups `whenLow` ("When you’re low") and `whenHighOrSick` ("When you’re high, or sick") under `DiabetesCare.ui.chapter.groups`.
- **NEW** lane topics: `type DiabetesLaneTopic = 'low' | 'high' | 'sick' | 'device' | 'supplies'`.
- **NEW site figures:** `ruleOf15` (card 2) and `ketoneLadder` (card 7). Every other figure is a generic Ostomy kind.
- **NEW in `ruleOf15`** (after source check): `hideWhenChild: [3]` hides the honey option while "A child" is selected (R13), and an always-visible `aidNote` line (R12).
- **Extension** of the generic `takeIn`: optional `fields: number` blank write-in lines, keyed `figure.fields.<n>`, for the sick-day plan (card 8). The alternative is a third new site figure, `sickDayPlan`.
- **Engine note:** Ostomy reads the start-here heading from `ui.chapter.startHere.heading`. This chapter needs a per-chapter heading, so `chapters.staying-safe.startHere.heading` is included in the messages.

```ts
const IMG = '/archive/diabetes-care';            // TBD: image set not yet chosen
const PHARMACIST_CDE_REQUEST_HREF = '/account/virtual-care/appointment'; // needs the "Pump or CGM question (pharmacist CDE)" reason

{
  slug: 'staying-safe',
  num: '02',
  chapterWord: 'two',
  heroImage: `${IMG}/chapter-safe.png`,          // TBD
  accent: 'TBD',
  rail: false,
  majorSections: true,
  startHere: { groups: ['whenLow', 'whenHighOrSick'] },   // exactly two segments
  /*
   * The chapter's own #red-flags block, rendered by UrgentBlock from the `urgent`
   * messages (4 signs), is pinned open and never gated. This exit is for the
   * start-here map's signpost, same as Ostomy Ch02 pointing at itself.
   */
  urgentExit: { chapter: 'staying-safe' },
  categories: [
    /* ---------- A. When you're low ---------- */
    { // 1 Know your low
      image: `${IMG}/TBD.png`, group: 'whenLow', ask: 'team',
      figures: [{ kind: 'columns', columns: [[2], [3], [4]], neutral: [1, 5] }],
      sources: ['dc-cpg-ch14-hypoglycemia-2023', 'dc-hypoglycemia-adults-sheet-2024',
                'bt1d-time-in-range', 'dc-cpg-ch9-monitoring-2021',
                'dc-drive-safe-card', 'dc-cpg-ch21-driving', 'das-low-blood-sugar'],
    },
    { // 2 The Rule of 15. The only Rule of 15 copy on the site; others link here. NO shop strip.
      image: `${IMG}/TBD.png`, group: 'whenLow', ask: 'team',
      figures: [{
        kind: 'ruleOf15',                      // NEW site figure
        /* Restyles items 1–3 as the four-step loop; adds the 15 g list and an
           Adult / Child toggle. The toggle swaps the amount row only; it never
           scales the food list (no child food amounts in the source).
           Honey (option 3) is hidden while "A child" is selected (R13).
           aidNote shows under both toggles (R12). */
        steps: [{ item: 1 }, { item: 2 }, { item: 3 }],
        child: [{ ageBelow: 5, grams: 5 }, { ageFrom: 5, ageTo: 10, grams: 10 }, { ageAbove: 10, grams: 15 }],
        hideWhenChild: [3],                    // NEW
        aidNote: true,                         // NEW
        sources: ['dc-cpg-ch14-hypoglycemia-2023', 'dc-hypoglycemia-adults-sheet-2024', 'dc-cpg-ch41-t1d-lifespan-2025'],
      }],
      noteVisible: true,                       // the driving line stays outside the disclosure
      sources: ['dc-cpg-ch14-hypoglycemia-2023', 'dc-hypoglycemia-adults-sheet-2024',
                'dc-cpg-ch41-t1d-lifespan-2025', 'dc-cpg-ch21-driving'],
    },
    { // 3 Glucagon: help someone else gives. Shop strip since 2026-10-06 (B21; F.9): Baqsimi
      // (4555) with the pharmacist notice, in chapter-shop.ts. Renders nothing until operations
      // fixes its store description (it gives another retailer's phone number; B3).
      image: `${IMG}/TBD.png`, group: 'whenLow', ask: 'pharmacist',
      urgentContent: true,                     // carries "call 911"
      figures: [{ kind: 'takeIn' }],           // printable card for the people around you
      sources: ['bt1d-what-is-glucagon', 'das-glucagon', 'dc-hypoglycemia-adults-sheet-2024',
                'dc-cpg-ch14-hypoglycemia-2023', 'dc-cpg-ch41-t1d-lifespan-2025'],
    },
    { // 4 Lows that sneak up
      image: `${IMG}/TBD.png`, group: 'whenLow', ask: 'team',
      figures: [{ kind: 'columns', columns: [[1, 2], [3, 4, 5]], neutral: [6] }],
      sources: ['dc-exercise-and-activity', 'dc-alcohol-and-diabetes-2018', 'dc-cpg-ch11-nutrition-therapy',
                'dc-diabetes-and-drinking-2019', 'dc-technology-and-devices'],
    },
    { // 5 Carry it, wear it. Shop strip since 2026-10-06 (B21; F.9): Dex4, key chain, medical IDs.
      image: `${IMG}/TBD.png`, group: 'whenLow', ask: 'team',
      figures: [{
        kind: 'containers',
        containers: [
          { glyph: 'bag',    items: [{ item: 1, glyph: 'food' }, { item: 3, glyph: 'check' }] },
          { glyph: 'people', items: [{ item: 2, glyph: 'hands' }] },
          { glyph: 'book',   items: [{ item: 4, glyph: 'list' }, { item: 5, glyph: 'people' }, { item: 6, glyph: 'phone' }] },
        ],
      }],
      sources: ['dc-exercise-and-activity', 'dc-alcohol-and-diabetes-2018', 'dc-cpg-ch14-hypoglycemia-2023',
                'cps-t1d-in-school-2015', 'dc-kids-in-school', 'das-low-blood-sugar'],
    },

    /* ---------- B. When you're high, or sick ---------- */
    { // 6 Highs
      image: `${IMG}/TBD.png`, group: 'whenHighOrSick', ask: 'team',
      urgentContent: true,                     // note: "need care right away"
      // No figure. A `doors` figure would restyle every item into a door; only item 1 has an onward page (Ch01 card 3).
      sources: ['dc-checking-blood-sugar', 'dc-hyperglycemia', 'dc-cpg-ch15-hyperglycemic-emergencies'],
    },
    { // 7 Ketones: check and act
      image: `${IMG}/TBD.png`, group: 'whenHighOrSick', ask: 'team',
      urgentContent: true,                     // emergency rung, DKA signs
      figures: [{
        kind: 'ketoneLadder',                  // NEW site figure
        /* Augments. Breakthrough's own ranges, edges exactly as published
           (0.6–1.5 and 1.5–3.0 share 1.5). Rung 4 and urine 'large' use the
           urgent colour; the figure is never collapsible. Labelled "written for
           type 1" in the figure itself, not only in the note (R3). */
        blood: [{ below: 0.6 }, { from: 0.6, to: 1.5 }, { from: 1.5, to: 3.0 }, { above: 3.0 }],
        urine: ['small', 'moderate', 'large'],
        writtenFor: 'type1',
        sources: ['bt1d-dka-and-ketones'],
      }],
      sources: ['bt1d-dka-and-ketones', 'dc-hyperglycemia', 'dc-stay-safe-sick-days-sheet', 'dc-cpg-ch10-physical-activity'],
    },
    { // 8 Sick days
      image: `${IMG}/TBD.png`, group: 'whenHighOrSick', ask: 'pharmacist',
      urgentContent: true,                     // "go to the emergency department"
      noteVisible: true,                       // "which of your medicines" line never behind a disclosure
      figures: [{ kind: 'takeIn', fields: 5 }],// EXTENSION: printable plan filled in with the pharmacist
      sources: ['dc-stay-safe-sick-days-sheet', 'bt1d-dka-and-ketones'],
    },
    { // 9 On a pump: an unexplained high
      image: `${IMG}/TBD.png`, group: 'whenHighOrSick', ask: 'team',
      // After source check: rests on DC + Breakthrough only. The FIT (embecta-run) items are HELD (R9, section E).
      sources: ['dc-technology-and-devices', 'dc-managing-emergency-situations', 'bt1d-dka-and-ketones'],
    },
    { // 10 Be ready for emergencies
      image: `${IMG}/TBD.png`, group: 'whenHighOrSick', ask: 'pharmacist',
      figures: [{
        kind: 'containers',
        containers: [
          { glyph: 'bag',  items: [{ item: 1, glyph: 'calendar' }, { item: 2, glyph: 'list' }, { item: 3, glyph: 'list' }] },
          { glyph: 'home', items: [{ item: 4, glyph: 'home' }, { item: 5, glyph: 'book' }] },
        ],
      }],
      sources: ['dc-managing-emergency-situations', 'dq-all-about-injections', 'dc-getting-started-with-insulin'],
    },
    { // 11 Who to call, and when
      image: `${IMG}/TBD.png`, group: 'whenHighOrSick', ask: 'team',
      urgentContent: true,                     // 911 line
      figures: [{
        kind: 'lanes',
        lanes: [
          { glyph: 'urgent', item: 1, topics: ['low'] },
          { glyph: 'urgent', item: 2, topics: ['high', 'sick'] },
          { glyph: 'team',   item: 3, topics: ['high', 'sick'] },
          { glyph: 'team',   item: 4, topics: ['high', 'sick'] },
          { glyph: 'service', item: 5, topics: ['sick', 'low'] },        // pharmacist (not a Liivv-only lane)
          { glyph: 'service', service: true, topics: ['device', 'supplies'],
            href: PHARMACIST_CDE_REQUEST_HREF, hrefLang: 'en' },          // Liivv pharmacist CDE: owner-sourced (no SourceId)
        ],
        topicKeys: ['low', 'high', 'sick', 'device', 'supplies'],
      }],
      sources: ['bt1d-what-is-glucagon', 'das-glucagon', 'bt1d-dka-and-ketones', 'dc-stay-safe-sick-days-sheet',
                'dc-hyperglycemia', 'dc-cpg-ch14-hypoglycemia-2023'],
    },
  ],
  /* Band "The safety ladder": `programsBand` messages, 4 cards, no links. */
  programsBandLinks: [[], [], [], []],
  bandSources: ['dc-cpg-ch14-hypoglycemia-2023', 'bt1d-dka-and-ketones', 'dc-stay-safe-sick-days-sheet',
                'bt1d-what-is-glucagon', 'das-glucagon'], // NEW, review only
  pharmacistImage: `${IMG}/TBD.png`,
  pharmacistHref: PHARMACIST_CDE_REQUEST_HREF,
  resourceLinks: [],
  citations: [
    { label: 'Diabetes Canada — Chapter 14: 2023 Update – Hypoglycemia in Adults', href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-14-2023-update' },
    { label: 'Diabetes Canada — Hypoglycemia: low blood sugar in adults (02/24)', href: '<dc-hypoglycemia-adults-sheet-2024>' },
    { label: 'Diabetes Canada — Stay Safe When You Have Diabetes and Are Sick or at Risk of Dehydration', href: '<dc-stay-safe-sick-days-sheet>' },
    { label: 'Breakthrough T1D — Diabetic ketoacidosis (DKA) and ketones', href: 'https://breakthrought1d.ca/daily-management/diabetic-ketoacidosis-dka-and-ketones/' },
    { label: 'Diabetes Canada — Managing Diabetes in Emergency Situations', href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/managing-diabetes-in-emergency-situations' },
  ],
}
```

Glyphs: all are existing Ostomy `GlyphName`s. No new glyph is required. An `id` glyph (card 5, item 3) and a `fridge` glyph (card 10, item 4) would read better, but they are optional.

---

## B) EN MESSAGES — `DiabetesCare.chapters.staying-safe`

UI additions it relies on, under `DiabetesCare.ui.chapter`, are shown first for completeness.

```json
{
  "DiabetesCare": {
    "ui": {
      "chapter": {
        "groups": {
          "whenLow": "When you’re low",
          "whenHighOrSick": "When you’re high, or sick"
        },
        "ask": {
          "team": "Ask your diabetes team",
          "pharmacist": "Ask a pharmacist",
          "pharmacistCde": "Ask a pharmacist CDE",
          "urgent": "Call, don’t wait"
        },
        "roleNames": {
          "team": "your diabetes team",
          "pharmacist": "a pharmacist",
          "pharmacistCde": "a pharmacist CDE"
        }
      }
    },
    "chapters": {
      "staying-safe": {
        "title": "Staying Safe",
        "heroBody": "Lows, highs, ketones and sick days: what to check, what to do, and when to call. Short enough to use in a hurry.",
        "focus": "When you’re low: the levels, the Rule of 15, glucagon, lows that come later, and what to carry. When you’re high or sick: highs, ketones, sick days, an unexplained high on a pump, an emergency kit, and who to call.",
        "vibe": "Calm and practical: clear steps for the moments that matter.",
        "categoriesIntro": {
          "eyebrow": "Check, act, check again",
          "heading": "Your plan, in one place",
          "body": "This chapter helps you follow the plan your diabetes team made with you, and shows when it’s time to call. If your team gave you different numbers, use theirs."
        },
        "urgent": {
          "heading": "Get emergency care now",
          "intro": "Everyday lows and highs follow your plan. These don’t. Get emergency care now if the person:",
          "action": "Call 911 or go to the nearest emergency department.",
          "signs": {
            "1": "Can’t swallow, is unconscious or is having a seizure. Call 911, give glucagon if you have it, turn them on their side and stay with them. Don’t put food or drink in their mouth",
            "2": "Is vomiting and can’t keep fluids down",
            "3": "Has blood ketones above 3.0 mmol/L, or large ketones in their urine (ranges written for type 1 diabetes)",
            "4": "Has deep or hard breathing, fruity-smelling breath, or is very sleepy or confused, with a high blood sugar"
          }
        },
        "startHere": {
          "heading": "Is your number low, or high?",
          "pivot": "Your number",
          "segments": {
            "1": { "label": "When you’re low" },
            "2": { "label": "When you’re high, or sick" }
          }
        },
        "categories": {
          "1": {
            "title": "Know your low",
            "items": {
              "1": "Diabetes Canada calls a blood sugar below 3.9 mmol/L low",
              "2": "Level 1: below 3.9, down to 3.0",
              "3": "Level 2: below 3.0",
              "4": "Level 3: a low at any number where you need someone else’s help to treat it",
              "5": "If you use a sensor, Canadian targets for most people aim for less than 4% of the day below 3.9"
            },
            "note": "Some Canadian guidance for driving and for school uses 4.0 instead of 3.9. If your team gave you a number, use theirs.",
            "figure": {
              "columns": {
                "1": { "heading": "Level 1" },
                "2": { "heading": "Level 2" },
                "3": { "heading": "Level 3" }
              }
            }
          },
          "2": {
            "title": "The Rule of 15",
            "items": {
              "1": "Take 15 g of fast-acting sugar",
              "2": "Wait 15 minutes, then check your blood sugar again",
              "3": "If it’s still below 3.9, take another 15 g",
              "4": "Once it’s back up, if your next meal is more than an hour away, have a snack with a starch and a protein"
            },
            "note": "After a low, wait at least 40 minutes, and until your blood sugar is at least 5.0, before you drive. More on driving in Every Day Living.",
            "figure": {
              "steps": {
                "1": "Take 15 g",
                "2": "Wait 15 minutes",
                "3": "Check again",
                "4": "Still below 3.9? Take 15 g more"
              },
              "optionsHeading": "15 g of fast-acting sugar is one of these:",
              "options": {
                "1": "Glucose tablets that add up to 15 g",
                "2": "½ cup (125 mL) of juice or regular pop",
                "3": "1 tablespoon (15 mL) of honey",
                "4": "1 tablespoon of sugar dissolved in water"
              },
              "toggle": {
                "legend": "Amounts for",
                "adult": "An adult",
                "child": "A child"
              },
              "childHeading": "Amount for a child",
              "childRows": {
                "1": { "age": "Under 5 years", "amount": "5 g" },
                "2": { "age": "5 to 10 years", "amount": "10 g" },
                "3": { "age": "Over 10 years", "amount": "15 g" }
              },
              "childNote": "From Diabetes Canada’s guideline for children with type 1 diabetes who use injections, or a pump that doesn’t adjust insulin on its own. Children on an automated (closed-loop) system may need less. Ask your child’s team.",
              "aidNote": "On an automated (closed-loop) insulin system? Diabetes Canada’s type 1 guideline says people of any age may treat a low they can manage themselves with less, 5 to 10 g. Ask your team what to use."
            }
          },
          "3": {
            "title": "Glucagon: help someone else gives",
            "items": {
              "1": "Glucagon is for a low when the person can’t swallow, is unconscious or is having a seizure. Someone else gives it",
              "2": "It comes as a nasal spray or an injection. Your pharmacist can tell you which is available",
              "3": "Call 911, or have someone call. Give glucagon, turn the person on their side and stay with them. Don’t put food or drink in their mouth",
              "4": "If a low is affecting the person’s thinking or movement but they can still swallow, Diabetes Canada’s sheet says to give 20 g of fast-acting sugar",
              "5": "At school, staff named in the student’s care plan, and trained, give glucagon when the plan includes consent for it"
            },
            "note": "Ask your pharmacist to show you how your glucagon works, and check its expiry date from time to time. For a child under 4, ask your child’s team which glucagon to keep."
          },
          "4": {
            "title": "Lows that sneak up",
            "items": {
              "1": "Exercise can keep lowering your blood sugar for up to 48 hours afterwards",
              "2": "Check your blood sugar regularly, especially if you take insulin or other medicines that lower blood sugar",
              "3": "If you take insulin or some diabetes pills, alcohol can cause a low up to 24 hours after you drink",
              "4": "Diabetes Canada suggests eating carbohydrate when you drink, and checking your blood sugar before bed",
              "5": "Diabetes Canada says glucagon won’t work while alcohol is in your body. Make sure someone with you knows to call 911 if you pass out",
              "6": "A sensor can run up to 15 minutes behind your blood sugar. Diabetes Canada suggests keeping a meter as a backup"
            },
            "note": "Ask your team how to plan your medicines around exercise and drinking.",
            "figure": {
              "columns": {
                "1": { "heading": "After activity" },
                "2": { "heading": "After drinking" }
              }
            }
          },
          "5": {
            "title": "Carry it, wear it",
            "items": {
              "1": "Carry fast-acting sugar when you’re active",
              "2": "If you have glucagon, show the people you spend time with how it works. Diabetes Canada’s guideline says they should be taught",
              "3": "Wear medical ID, such as a bracelet or necklace",
              "4": "For a child at school, a care plan made before the school year covers daily care and emergencies, with at least two trained staff",
              "5": "Diabetes@School says to treat a student’s low right away, where it happens, and not to leave them alone",
              "6": "Students may carry a phone or smartwatch to help manage their blood sugar"
            },
            "figure": {
              "containers": {
                "1": { "label": "With you" },
                "2": { "label": "The people around you" },
                "3": { "label": "At school" }
              }
            }
          },
          "6": {
            "title": "Highs",
            "items": {
              "1": "Diabetes Canada’s usual targets are 4.0 to 7.0 mmol/L before meals and 5.0 to 10.0 two hours after meals. Your team may set different ones",
              "2": "Symptoms of a high can show up when your fasting blood sugar is 11 or higher",
              "3": "If your blood sugar stays above 14 before meals for more than a few meals, check for ketones",
              "4": "Ketones can build up even when blood sugar is close to normal, for example in pregnancy or with some diabetes medicines. Ask your pharmacist whether this applies to you"
            },
            "note": "Very high blood sugar or high ketones need care right away. The signs are at the top of this chapter."
          },
          "7": {
            "title": "Ketones: check and act",
            "items": {
              "1": "Ketones build up when your body doesn’t have enough insulin and starts breaking down fat for energy",
              "2": "You can check ketones in your blood or in your urine. Your team will tell you which to use",
              "3": "Check when your blood sugar stays high. With type 1, check when you’re sick too, especially with vomiting, stomach pain or a fever. With other types, check when you’re sick if your team has told you to",
              "4": "Diabetes Canada’s guideline for type 1 diabetes says to put off hard exercise if blood ketones are 1.5 or higher",
              "5": "Signs of diabetic ketoacidosis (DKA) include thirst, passing a lot of urine, stomach pain, feeling or being sick, deeper breathing, fruity-smelling breath, and feeling tired, sleepy or confused. DKA needs medical care right away"
            },
            "note": "The ladder below is from Breakthrough T1D and was written for type 1 diabetes. If you have another type, ask your team which numbers to use.",
            "figure": {
              "writtenFor": "Written for type 1 diabetes, by Breakthrough T1D",
              "blood": {
                "heading": "Blood ketones (mmol/L)",
                "rungs": {
                  "1": { "range": "Under 0.6", "action": "Normal" },
                  "2": { "range": "0.6 to 1.5", "action": "Keep checking. If you’re sick, call your diabetes team" },
                  "3": { "range": "1.5 to 3.0", "action": "Risk of diabetic ketoacidosis (DKA). Call your team now" },
                  "4": { "range": "Over 3.0", "action": "Get emergency care now" }
                }
              },
              "urine": {
                "heading": "Urine ketones",
                "rungs": {
                  "1": { "range": "Small", "action": "Call your diabetes team" },
                  "2": { "range": "Moderate", "action": "Risk of DKA. Call your team now" },
                  "3": { "range": "Large", "action": "Get emergency care now" }
                }
              }
            }
          },
          "8": {
            "title": "Sick days",
            "sections": {
              "1": {
                "heading": "When it applies",
                "items": {
                  "1": "Diabetes Canada’s sick-day sheet is for vomiting, diarrhea, fever, or a lot of heat or humidity without enough to drink: anything that can leave you dehydrated"
                }
              },
              "2": {
                "heading": "What the sheet says to do",
                "items": {
                  "1": "Drink plenty of fluids with little sugar, unless you’ve been told to limit fluids",
                  "2": "If you can’t eat, the sheet lists foods with 15 g of carbohydrate to have instead",
                  "3": "If you use insulin, check your blood sugar more often. The sheet says your insulin may need adjusting, so ask your team how"
                }
              },
              "3": {
                "heading": "Your medicines on sick days",
                "items": {
                  "1": "The sheet lists some medicines to stop for a short time if you’re eating less, or dehydrated, for more than 24 hours",
                  "2": "Which of your own medicines this means is a question for your pharmacist. The sheet has a space for them to write it down",
                  "3": "The sheet says to restart them once you’re eating and drinking normally"
                }
              },
              "4": {
                "heading": "When to call",
                "items": {
                  "1": "Vomiting and can’t keep fluids down: go to the emergency department. If you can reach your team right away, call them too",
                  "2": "Call your team or go to the emergency department if you can’t drink enough, don’t know which medicines to stop or how to adjust your insulin, or your ketones are moderate. Large ketones need emergency care now",
                  "3": "Do the same if vomiting, diarrhea, stomach pain, passing a lot of urine, extreme thirst, weakness or fever isn’t getting better. Trouble breathing needs emergency care now"
                }
              }
            },
            "note": "Fill in the plan below with your pharmacist and diabetes team before you’re sick, so it’s ready when you need it.",
            "figure": {
              "heading": "My sick-day plan",
              "fields": {
                "1": "My diabetes team’s phone number",
                "2": "How often to check my blood sugar when I’m sick",
                "3": "When to check ketones, and blood or urine",
                "4": "My medicines to pause, and when to restart them (filled in with my pharmacist)",
                "5": "Foods and drinks I can manage when I’m sick"
              }
            }
          },
          "9": {
            "title": "On a pump: an unexplained high",
            "items": {
              "1": "Diabetes Canada suggests keeping backup supplies, such as rapid-acting insulin pens or syringes, and learning how to switch to injections in case you can’t use your pump",
              "2": "If your blood sugar is high and you can’t explain it, check your ketones and follow the ladder in Ketones: check and act",
              "3": "Keep a written copy of your pump settings in your emergency kit"
            },
            "note": "Your pump team’s plan comes first. Ask them what to do if you think your pump has stopped giving insulin."
          },
          "10": {
            "title": "Be ready for emergencies",
            "items": {
              "1": "Diabetes Canada suggests an emergency kit with at least one to two weeks of supplies",
              "2": "Include fast-acting sugar, glucagon if you have it, ketone strips and a sharps container",
              "3": "If you use a pump, add a written copy of your settings",
              "4": "Diabète Québec says to keep unopened insulin in the fridge, at 2 to 8 °C. Throw out insulin that has frozen, been above 30 °C, or expired",
              "5": "How long an opened pen or vial lasts depends on the product. Follow the leaflet that came with your insulin"
            },
            "figure": {
              "containers": {
                "1": { "label": "In the kit" },
                "2": { "label": "Storing insulin" }
              }
            }
          },
          "11": {
            "title": "Who to call, and when",
            "items": {
              "1": "911: someone can’t swallow, is unconscious or is having a seizure",
              "2": "Emergency department, or 911: blood ketones over 3.0, large urine ketones, vomiting with no fluids kept down, or signs of DKA such as deep breathing or fruity-smelling breath",
              "3": "Your diabetes team, now: blood ketones 1.5 to 3.0, or moderate urine ketones",
              "4": "Your diabetes team: blood ketones 0.6 to 1.5 when you’re sick, or small urine ketones",
              "5": "Your pharmacist: your sick-day medicine plan, and how your glucagon works"
            },
            "figure": {
              "legend": "What’s happening?",
              "topics": {
                "1": { "label": "A low" },
                "2": { "label": "A high or ketones" },
                "3": { "label": "Being sick" },
                "4": { "label": "A pump or sensor" },
                "5": { "label": "Supplies" }
              },
              "fits": "Fits what you ticked",
              "statusFitsOne": "{count} place fits what you ticked. Everyone stays listed.",
              "statusFitsMany": "{count} places fit what you ticked. Everyone stays listed.",
              "statusNone": "Nothing ticked. Everyone stays listed.",
              "lanes": {
                "1": { "label": "911" },
                "2": { "label": "Emergency department, or 911" },
                "3": { "label": "Your diabetes team, now" },
                "4": { "label": "Your diabetes team" },
                "5": { "label": "Your pharmacist" },
                "6": {
                  "label": "Liivv pharmacist CDE",
                  "scope": "A Liivv service · all of Canada · Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays",
                  "body": "Questions about pump and sensor supplies.",
                  "linkLabel": "Request a call (sign-in needed)"
                }
              }
            }
          }
        },
        "programsBand": {
          "heading": "The safety ladder",
          "cards": {
            "1": {
              "heading": "Treat and check again",
              "body": "A low: take 15 g of fast-acting sugar, wait 15 minutes and check again. Still below 3.9? Take 15 g more."
            },
            "2": {
              "heading": "Call your team",
              "body": "Blood ketones 0.6 to 1.5 when you’re sick, or small urine ketones."
            },
            "3": {
              "heading": "Call your team now",
              "body": "Blood ketones 1.5 to 3.0, or moderate urine ketones."
            },
            "4": {
              "heading": "Emergency care, or 911",
              "body": "Can’t swallow, unconscious or having a seizure: call 911. Blood ketones over 3.0, large urine ketones, vomiting with no fluids kept down, or signs of DKA: get emergency care now."
            }
          }
        },
        "pharmacist": {
          "eyebrow": "Anywhere in Canada",
          "heading": "Questions about pump and sensor supplies",
          "body": "Liivv’s pharmacist CDEs answer pump and CGM supply questions for all of Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. For a low or a high right now, follow your plan or the steps on this page.",
          "cta": "Request a call"
        },
        "closing": {
          "heading": "A plan you already know",
          "body": "Staying safe is the same few steps, practised: check, act, check again, and know when to call."
        },
        "governance": {
          "disclaimer": "This is general information, not medical advice, and it is not a substitute for care from your diabetes team, doctor or pharmacist. Your targets, your medicines and your sick-day plan depend on you. Your team sets them."
        },
        "urgentExit": {
          "lead": "Signs that need emergency care are at the top of this page, under",
          "link": "Get emergency care now"
        }
      }
    }
  }
}
```

Copy notes:
- Item strings have no closing period, and notes and figure bodies do, as in Ostomy. Apostrophes are curly (’).
- `pharmacist.cta` is "Request a call" only. The second CTA, "Call a pharmacist CDE", waits on the owner confirming the phone number.
- Band card 3 heading changed from "Get care now" to "Call your team now", so the ladder reads: treat and check again → call your team → call your team now → emergency care, or 911. The plan's "get care now" rung is now carried by card 4 together with 911. If the owner wants the plan's exact four labels, card 3 can go back to "Get care now" with the same body.
- The Ostomy chapters use em dashes. This copy uses periods and colons instead, to keep sentences short. The voice is otherwise the same.

---

## C) CLAIMS TABLE (after source check)

**Claims updated by the clinical rulings of 2026-10-06** ([record](clinical-rulings-2026-10-06.md); wording in F.6). These take precedence over the rows below:
- `2.figure.options.2`, ⅔ cup (150 mL) of juice or regular pop: `dc-cpg-ch14-hypoglycemia-2023` (Table 4, "150 mL juice or regular soft drink"), with `dq-low-blood-sugar-leaflet-2025` and `dc-drive-safe-card` (C13). The 02/24 sheet's ½ cup is not used.
- `2.figure.childOptionsNote`, no honey for babies under 1: `hc-infant-botulism` (C18).
- `2.note`, 40 minutes and 5.0 for anyone who drives: `dc-cpg-ch21-driving` (C44).
- `4.items.5`, glucagon "may not work as well" after more than 2 standard drinks in the past few hours: `dc-cpg-ch14-hypoglycemia-2023` (C2). The 04/18 alcohol sheet's "will not work" is superseded.
- `6.items.4`, SGLT2 inhibitors named as a question for the pharmacist: `dc-cpg-ch15-hyperglycemic-emergencies`, `dc-stay-safe-sick-days-sheet` (C17).
- `7.figure.blood.rungs` and `urine.rungs`: rung 2 "0.6 to under 1.5"; 1.5–3.0 and moderate add the emergency-department fallback (DC sick-day sheet, "and/or go the Emergency Department"); over 3.0 and large "Medical emergency" (Breakthrough; DC Hyperglycemia for any type). Ch15 and Ch41 use >1.5, Ch10 uses ≥1.5; 1.5 goes on the higher rung (C4, C5).
- `8.s2.3` and the new `8.s4.2` (old 8.s4.2–3 are now 8.s4.3–4): `dc-checking-blood-sugar` ("If you use insulin, keep taking it when you are sick"; vomiting or diarrhea two or more times in 4 hours) (C17).
- `10.items.5`, most opened insulin up to 28 days, some longer: `dq-all-about-injections` (C15).
- `urgent.signs.4`, DKA signs with no glucose qualifier on breathing or breath, and DKA with near-normal sugar: add `dc-cpg-ch15-hyperglycemic-emergencies` and `dc-cpg-ch41-t1d-lifespan-2025` (C6).

Key paths are relative to `DiabetesCare.chapters.staying-safe`. "Check" gives the result in `staying-safe.verify.md` after this revision: **C** = confirmed as now worded; **C\*** = accepted as more conservative than the source (recorded as a ruling).

| Key | Sentence (short) | SourceId | Fact on the source page | Check |
|---|---|---|---|---|
| urgent.signs.1 | Can’t swallow / unconscious / seizing → call 911, glucagon, side, stay, nothing by mouth | bt1d-what-is-glucagon; das-glucagon | Breakthrough: glucagon for "unable to swallow… unconsciousness or seizure"; Diabetes@School: recovery position, "Have someone call 911", stay, "Do not put anything in their mouth… (choking hazard)" | C |
| urgent.signs.2 | Vomiting and can’t keep fluids down | dc-stay-safe-sick-days-sheet | Sheet: team "and/or" ED "if you cannot drink enough fluids"; vomiting that isn’t getting better | C\* (R7) |
| urgent.signs.3 | Blood ketones >3.0 or large urine ketones (T1D ranges) | bt1d-dka-and-ketones | "medical emergency… call your diabetes care team immediately and possibly go to the emergency room"; "normal for people with T1D" | C\* (R3) |
| urgent.signs.4 | Deep or hard breathing, fruity breath, very sleepy or confused, with a high | bt1d-dka-and-ketones; dc-stay-safe-sick-days-sheet | DKA symptoms "breathing more deeply than usual", "breath that smells fruity", "feeling tired, sleepy or confused"; "requires immediate medical attention". Sheet: "difficulty breathing" | C (wording R14) |
| urgent.action | Call 911 or go to the nearest ED | bt1d-what-is-glucagon; das-glucagon; bt1d-dka-and-ketones | 911 for severe lows; ED for ketone emergency | C / C\* |
| 1.items.1 | Below 3.9 mmol/L is low | dc-hypoglycemia-adults-sheet-2024 | "Blood sugar below 3.9 is considered low" | C |
| 1.items.2 | Level 1: below 3.9, down to 3.0 | dc-cpg-ch14-hypoglycemia-2023 | "often between 3.0 and 3.9" | C |
| 1.items.3 | Level 2: below 3.0 | dc-cpg-ch14-hypoglycemia-2023 | "often <3.0" | C |
| 1.items.4 | Level 3: any number, needs help | dc-cpg-ch14-hypoglycemia-2023 | "regardless of glucose reading… requiring external assistance" | C |
| 1.items.5 | Sensor, for most people, <4% below 3.9 | dc-cpg-ch9-monitoring-2021; bt1d-time-in-range | "<4% for most individuals" | C |
| 1.note | Some driving and school guidance uses 4.0 | dc-drive-safe-card; das-low-blood-sugar; dc-cpg-ch21-driving | Card: "Do not start driving if below 4"; Diabetes@School: "below 4 mmol/L is considered low"; Ch21: <4.0 | C |
| 2.items.1–3 | 15 g, wait 15 min, check, repeat if <3.9 | dc-cpg-ch14-hypoglycemia-2023; dc-hypoglycemia-adults-sheet-2024 | "retreated with 15 g of carbohydrate if BG remains <3.9 mmol/L" | C |
| 2.items.4 | Meal >1 h away → starch + protein | dc-hypoglycemia-adults-sheet-2024 | As stated | C |
| 2.note | Wait at least 40 min, and until ≥5.0, before driving | dc-cpg-ch21-driving | "should not drive until at least 40 minutes after successful treatment… to at least 5.0" | C |
| 2.figure.options.1–4 | Tablets to 15 g; ½ cup juice/pop; 1 Tbsp (15 mL) honey; 1 Tbsp sugar in water | dc-hypoglycemia-adults-sheet-2024 | As stated ("regular soft drink") | C (R2, R11) |
| 2.figure.childRows | <5 y 5 g; 5–10 y 10 g; >10 y 15 g | dc-cpg-ch41-t1d-lifespan-2025 | Table 3, "BBI or IPT" (0.3 g/kg) | C (R8) |
| 2.figure.childNote | Injections or non-automated pump; automated may need less | dc-cpg-ch41-t1d-lifespan-2025 | "In conscious children and adolescents using basal bolus or non-AID IPT… 0.3 g/kg"; AID amounts lower | C |
| 2.figure.aidNote | Any age on AID: 5–10 g may be enough for a low you can manage | dc-cpg-ch41-t1d-lifespan-2025 | "Individuals of all ages using AID systems may treat non-severe hypoglycemia events with less fast-acting carbohydrate (i.e. 5–10 g)" | C (R12) |
| 3.items.1 | Glucagon for can’t swallow / unconscious / seizure; someone else gives it | bt1d-what-is-glucagon; dc-cpg-ch14-hypoglycemia-2023 | As stated | C |
| 3.items.2 | Nasal spray or injection; pharmacist says which is available | dc-cpg-ch41-t1d-lifespan-2025; bt1d-what-is-glucagon | Ch41: "intranasal or injectable glucagon"; injectable "availability is limited in Canada" | C (pre-publish DPD check) |
| 3.items.3 | Call 911 (or have someone call), give glucagon, side, stay, nothing by mouth | das-glucagon; bt1d-what-is-glucagon | "Have someone call 911"; "Do not put anything in their mouth"; "turn them on their side… stay" | C |
| 3.items.4 | Low affecting thinking or movement, can swallow → 20 g | dc-hypoglycemia-adults-sheet-2024; dc-cpg-ch14-hypoglycemia-2023 | 20 g "with more severe signs (affecting mental/physical ability)" | C |
| 3.items.5 | At school, trained staff named in the care plan, with consent | das-glucagon | "If there is a signed consent and mutual agreement… Staff identified in the care plan to give glucagon will have been trained" | C |
| 3.note s1 | Check expiry from time to time | bt1d-what-is-glucagon | "Routinely check your prescription’s expiration date" | C |
| 3.note s2 | Child under 4: ask the team which glucagon | dc-cpg-ch41-t1d-lifespan-2025 | Under 4: injectable "should be used"; intranasal "may be used" if injectable unavailable | C |
| 4.items.1 | Exercise lowers sugar up to 48 h | dc-exercise-and-activity | "Exercise can lower your blood sugar for up to 48 hours" | C |
| 4.items.2 | Check regularly, especially on insulin or other lowering medicines | dc-exercise-and-activity | "monitor your blood sugar regularly, especially if you are taking insulin or other medications that lower your blood sugar" | C |
| 4.items.3 | On insulin or some pills, alcohol lows up to 24 h | dc-alcohol-and-diabetes-2018; dc-cpg-ch11-nutrition-therapy | "up to 24 hours after alcohol consumption. This also applies to people with type 2 diabetes who are using insulin or insulin secretagogues" | C |
| 4.items.4 | Eat carbohydrate when drinking; check before bed | dc-alcohol-and-diabetes-2018; dc-diabetes-and-drinking-2019 | PDF: "Eat carbohydrate-rich foods when drinking alcohol", "Check your blood sugar before going to bed"; article: meal or snack with carbohydrate | C |
| 4.items.5 | Glucagon won’t work with alcohol in the body; someone knows to call 911 | dc-alcohol-and-diabetes-2018 | "glucagon… will not work while alcohol is in the body… make sure that someone knows to call an ambulance if you pass out" | C |
| 4.items.6 | Sensor lags up to 15 min; meter as backup | dc-technology-and-devices | "slower… by up to 15 minutes"; meter "as a backup" | C |
| 5.items.1 | Carry fast sugar when active | dc-exercise-and-activity | "Carry fast-acting carbohydrate" | C |
| 5.items.2 | Teach people around you; guideline says they should be taught | dc-cpg-ch14-hypoglycemia-2023 | "counselling on administration technique for their support persons" | C |
| 5.items.3 | Wear medical ID, bracelet or necklace | dc-exercise-and-activity; dc-alcohol-and-diabetes-2018 | "Wear your MedicAlert® bracelet or necklace"; "Wear diabetes identification" | C |
| 5.items.4 | School care plan before the year; daily + emergency; ≥2 trained staff | cps-t1d-in-school-2015; dc-kids-in-school | As stated | C (pre-publish: CPS 2015 status) |
| 5.items.5 | Treat right away, where it happens; don’t leave alone | das-low-blood-sugar | "Treat… WHERE IT OCCURS… Do not bring the student to another location"; "DO NOT leave a student alone" | C |
| 5.items.6 | Phone or smartwatch to help manage blood sugar | dc-kids-in-school | "cell phones and/ smartwatches as a tool to help manage their blood glucose" | C |
| 6.items.1 | 4.0–7.0 before; 5.0–10.0 two hours after | dc-checking-blood-sugar | "two hours after eating" | C |
| 6.items.2 | Symptoms at fasting ≥11 | dc-hyperglycemia | "at or above 11 mmol/L, you may…" | C |
| 6.items.3 | >14 before meals for a few meals → ketones | dc-hyperglycemia | As stated | C |
| 6.items.4 | Ketones with near-normal sugar (pregnancy, some medicines) | dc-cpg-ch15-hyperglycemic-emergencies | "normal or mildly elevated blood glucose… does not rule out DKA… pregnancy or with SGLT2 inhibitor use" | C |
| 6.note | Very high sugar or high ketones → care right away | dc-hyperglycemia | "seek medical treatment right away" | C |
| 7.items.1 | Ketones build up without enough insulin; fat breakdown | bt1d-dka-and-ketones | "a severe lack of insulin means the body cannot use glucose for energy and starts to break down fat… ketones" | C |
| 7.items.2 | Blood or urine | bt1d-dka-and-ketones | "in urine with test strips or in blood with a ketone meter" | C |
| 7.items.3 | When high; T1D when sick (vomiting, pain, fever); others if told | dc-hyperglycemia; bt1d-dka-and-ketones; dc-stay-safe-sick-days-sheet | Breakthrough: "checking for ketones if a person with T1D is ill, especially if they are vomiting, have stomach pain, or a fever"; sheet: "If you have been told to check your ketones" | C |
| 7.items.4 | Put off hard exercise if blood ketones ≥1.5 (T1D) | dc-cpg-ch10-physical-activity | "≥1.5 mmol/L… vigorous exercise be postponed" | C |
| 7.items.5 | DKA signs; needs care right away | bt1d-dka-and-ketones | Symptom list as stated; "requires immediate medical attention" | C |
| 7.figure.blood.rungs | <0.6 normal; 0.6–1.5 keep checking, call if sick; 1.5–3.0 call now; >3.0 emergency | bt1d-dka-and-ketones | As stated; rung 4 "possibly go to the emergency room" | C / C\* (rung 4) |
| 7.figure.urine.rungs | Small call; moderate DKA risk, call now; large emergency | bt1d-dka-and-ketones | Small "good idea to call"; moderate "sign of diabetic ketoacidosis risk… call… right away"; large "medical emergency" | C / C\* (large) |
| 8.s1.1 | Vomiting, diarrhea, fever, heat/humidity without enough to drink | dc-stay-safe-sick-days-sheet | "Excessive exposure to heat and/or humidity without drinking enough" | C |
| 8.s2.1 | Fluids with little sugar, unless told to limit | dc-stay-safe-sick-days-sheet | "DRINK plenty of fluids, with minimal sugar (unless you have been told to limit fluids)" | C |
| 8.s2.2 | 15 g carbohydrate foods if you can’t eat | dc-stay-safe-sick-days-sheet | As stated | C |
| 8.s2.3 | Insulin users check more often; insulin may need adjusting, ask team | dc-stay-safe-sick-days-sheet | "check your blood sugar more often and you might need to adjust the amount of insulin" | C |
| 8.s3.1 | Sheet lists medicines to stop for a short time, eating less or dehydrated >24 h | dc-stay-safe-sick-days-sheet | "TEMPORARILY STOP" lists, both after "more than 24 hours" | C (R4) |
| 8.s3.2 | Pharmacist says which; space on the sheet | dc-stay-safe-sick-days-sheet | "Ask your pharmacist to tell you: The medications I need to TEMPORARILY STOP are" | C |
| 8.s3.3 | Restart when eating and drinking normally | dc-stay-safe-sick-days-sheet | As stated | C |
| 8.s4.1 | Vomiting, can’t keep fluids down → ED; call team too | dc-stay-safe-sick-days-sheet | Sheet allows team and/or ED; aligned with red flag | C\* (R7) |
| 8.s4.2 | Team or ED: can’t drink enough, don’t know meds/insulin, ketones moderate; large → emergency | dc-stay-safe-sick-days-sheet; bt1d-dka-and-ketones | Sheet’s "call… and/or go the Emergency Department" list | C |
| 8.s4.3 | Same for symptoms not getting better; trouble breathing → emergency | dc-stay-safe-sick-days-sheet; bt1d-dka-and-ketones | Sheet list incl. "difficulty breathing"; DKA "requires immediate medical attention" | C\* (breathing, R14) |
| 9.items.1 | Backup pens or syringes; learn to switch to injections | dc-technology-and-devices; dc-managing-emergency-situations | Tech & Devices: "backup… rapid-acting insulin pens or syringes… ketone testing strips" (wording per verify, Scope #2); Emergency: "educate yourself on how to switch to injections, in case you are unable to use your pump" | C |
| 9.items.2 | Unexplained high → check ketones, follow the ladder | bt1d-dka-and-ketones | "important to monitor ketones when blood glucose is above target" | C |
| 9.items.3 | Written pump settings in the kit | dc-managing-emergency-situations | "Your basal rates, insulin-to-carbohydrate ratio… for insulin pumps" | C |
| 10.items.1 | Kit with at least 1–2 weeks | dc-managing-emergency-situations | "at least 1 to 2 weeks" | C |
| 10.items.2 | Fast sugar, glucagon, ketone strips, sharps container | dc-managing-emergency-situations | "Glucose tablets or other fast-acting non-perishable carbohydrates"; glucagon; strips; "sharps container" | C |
| 10.items.3 | Pump settings | dc-managing-emergency-situations | As stated | C |
| 10.items.4 | Unopened 2–8 °C (DQ); discard if frozen, >30 °C or expired | dq-all-about-injections; dc-getting-started-with-insulin | DQ: "refrigerator (2 to 8 °C)… never be frozen or exposed to extreme heat (above 30 C)"; DC: "Throw out insulin that has been frozen, exposed to temperatures greater than 30ºC, or expired" | C |
| 10.items.5 | Opened insulin: follow the leaflet | dc-getting-started-with-insulin | "Insulin storage is different for each product. Look at product information" | C (R5) |
| 11.items.1 | 911 for can’t swallow / unconscious / seizure | bt1d-what-is-glucagon; das-glucagon | As stated | C |
| 11.items.2 | ED or 911: >3.0, large, no fluids kept down, DKA signs | bt1d-dka-and-ketones; dc-stay-safe-sick-days-sheet | As red flags | C\* (R3, R7) |
| 11.items.3 | Team now: 1.5–3.0 or moderate | bt1d-dka-and-ketones | "call your diabetes care team right away" | C |
| 11.items.4 | Team: 0.6–1.5 when sick, or small | bt1d-dka-and-ketones | 0.6–1.5 "If… experiencing illness… call"; small "good idea to call" | C |
| 11.items.5 | Pharmacist: sick-day medicines, glucagon | dc-stay-safe-sick-days-sheet; dc-cpg-ch14-hypoglycemia-2023 | "Ask your pharmacist to tell you"; support-person teaching | C |
| 11.figure.lanes.6; pharmacist.body | Liivv CDE: Canada-wide, hours | — (owner, 2026-10-05) | Not clinical; owner-supplied | n/a |
| programsBand.cards.1 | Rule of 15 | dc-cpg-ch14-hypoglycemia-2023 | As card 2 | C |
| programsBand.cards.2 | 0.6–1.5 when sick, or small → team | bt1d-dka-and-ketones | As rung 2 / small | C |
| programsBand.cards.3 | 1.5–3.0 or moderate → team now | bt1d-dka-and-ketones | As rung 3 / moderate | C |
| programsBand.cards.4 | 911; >3.0, large, no fluids kept down, DKA signs → emergency | bt1d-what-is-glucagon; bt1d-dka-and-ketones; dc-stay-safe-sick-days-sheet | As red flags | C / C\* |

Sentences with no factual claim (framing, "ask your team" or "your team decides"), so no source is needed: categoriesIntro.*, 1.note s2, 3.items.2 s2, 4.note, 6.items.1 s2, 6.items.4 s2, 7.items.2 s2, 8.note, 9.note, closing, governance, startHere, urgent.intro, and the figure labels.

---

## D) OPEN RULINGS (clinical defaults used, pending the nurse)

**2026-10-06:** every ruling below is now ruled (R10, alcohol limits, by C16 in Every Day Living card 4); see [the clinical rulings record](clinical-rulings-2026-10-06.md) and F.6 for what changed. The defaults and alternatives are kept as they were, for the record.

| # | Default used | Where | Alternative |
|---|---|---|---|
| R1 · **ruled 2026-10-06 ([C1](clinical-rulings-2026-10-06.md#c1))** | **Low = below 3.9 mmol/L** (CPG Ch14 2023 + DC 02/24 sheet). 4.0 appears only in 1.note, as "some Canadian guidance for driving and for school". | 1.items.1–2, 1.items.5, 2.items.3, 2.figure.steps.4, programsBand.cards.1 | Below 4.0 (Drive Safe card, Diabetes@School, Breakthrough T1D). |
| R2 · **ruled 2026-10-06 ([C13](clinical-rulings-2026-10-06.md#c13))** | **15 g of juice = ½ cup (125 mL)** (DC 02/24 sheet). | 2.figure.options.2 | ⅔ cup (150 mL): DC’s own sick-day sheet, Drive Safe card and Alcohol PDF ("150 mL regular pop") all use it. |
| R3 · **ruled 2026-10-06 ([C4](clinical-rulings-2026-10-06.md#c4))** | **Ketone ladder from Breakthrough T1D, written for type 1**, shown to everyone and labelled in the figure, the note and now the red flag (sign 3). Rung 4 and urine "large" say "Get emergency care now", which is more conservative than the page ("call your team immediately and possibly go to the emergency room"). Rung 2 now calls the team only when sick, as the page says. | 7 (figure + note), urgent.signs.3, 11.items.2–4, programsBand.cards.2–4 | Show the ladder to type 1 readers only, and give everyone else DC Hyperglycemia’s generic "seek care right away for high ketones". Or soften rung 4 to the page’s wording. |
| R4 · **ruled 2026-10-06 ([C17](clinical-rulings-2026-10-06.md#c17))** | **Changed after the source check: no drug-class list on the page.** Card 8 says the sheet lists medicines to stop for a short time and sends the reader to their pharmacist; the printable plan keeps a blank "medicines to pause" line. The sheet’s class list (secretagogues; ACE inhibitors, ARBs, water pills, metformin, SGLT2 inhibitors, NSAIDs) is HELD (section E). Card 6 still names no class. | 8.sections.3, 8.figure.fields.4, 6.items.4 | (b) Restore the quoted list, with the sheet’s note that combination pills are not listed; or (c) name SGLT2 inhibitors in card 6 as CPG Ch15 does. |
| R5 · **ruled 2026-10-06 ([C15](clinical-rulings-2026-10-06.md#c15))** | **In-use insulin: "follow your leaflet".** | 10.items.5 | 30 days (DC Getting Started; DC Air Travel) or 28 days (Diabète Québec; 42 for detemir). |
| R6 · **ruled 2026-10-06 ([C9](clinical-rulings-2026-10-06.md#c9), [C44](clinical-rulings-2026-10-06.md#c44))** | **Changed after the source check: driving after a low uses CPG Ch21’s wording**, "wait at least 40 minutes, and until your blood sugar is at least 5.0". | 2.note | The patient sheet and Drive Safe card say "above 5" and "might need up to 40 minutes". Or leave driving out of this chapter and keep it in Ch04. |
| R7 · **ruled 2026-10-06 ([C6](clinical-rulings-2026-10-06.md#c6))** | **"Vomiting and can’t keep fluids down" stays a red flag** (the reviewer’s ruling), and card 8, card 11 and the band now route it to emergency care too: "go to the emergency department. If you can reach your team right away, call them too." The DC sheet itself says team "and/or" ED. | urgent.signs.2, 8.s4.1, 11.items.2, programsBand.cards.4 | Drop it from the red flags and use the sheet’s either-or wording everywhere. The reviewer’s own wording for card 8 was "go to the emergency department, or call your team right away if you can reach them now"; this copy uses "and" so no reader waits on a callback. |
| R8 · **ruled 2026-10-06 ([C8](clinical-rulings-2026-10-06.md#c8))** | **Children’s Rule of 15 amounts (5/10/15 g)**, from CPG Ch41 for type 1 on injections or a non-automated pump. The note now says so and points automated-system families to their team. | 2.figure.childRows, childNote | Show them only to type 1 families, or add "for other types, ask your child’s team". |
| R9 · **ruled 2026-10-06 ([C14](clinical-rulings-2026-10-06.md#c14))** | **Changed after the source check: FIT counted as industry-run.** fit4diabetes.com is © Embecta Corp. Under policy 4, the FIT-only items (unexplained high with nausea or vomiting; no set change at bedtime) are HELD. Card 9 now rests on DC Technology & Devices, DC Emergency Situations and Breakthrough (3 items). | 9.items.1–3; section E | Count FIT as a clinician consensus and release the held lines with the corrected disclosure ("published on a website run by embecta, a company that makes pen needles and syringes"). |
| R10 · **ruled 2026-10-06 ([C16](clinical-rulings-2026-10-06.md#c16))** | **Alcohol limits not stated.** Only the delayed-low facts are used, so the CPG vs CCSA 2023 question doesn’t arise here. | 4.items.3–5 | Decide in Ch04. |
| R11 · **ruled 2026-10-06 ([C29](clinical-rulings-2026-10-06.md#c29))** | **"4 Life Savers" left out** of the 15 g list, because it is a brand. | 2.figure.options | Include it as the DC sheet prints it. |
| R12 · **ruled 2026-10-06 ([C8](clinical-rulings-2026-10-06.md#c8))** | **NEW. Automated insulin delivery line:** "people of any age may treat a low they can manage themselves with less, 5 to 10 g", from CPG Ch41 (a type 1 chapter), shown under both toggles. | 2.figure.aidNote, childNote | Leave the adult line out and keep only the children’s note; or say only "if you use an automated system, ask your team how much to take". |
| R13 · **ruled 2026-10-06 ([C18](clinical-rulings-2026-10-06.md#c18))** | **NEW. Honey and babies.** Honey is hidden while "A child" is selected. The line "Not for babies under 1 year" is HELD: it is general clinical knowledge and not on any verified source. | 2.figure.options.3 (`hideWhenChild`) | Show honey for children with the warning, once the nurse signs it off and a source (for example Health Canada) is verified. |
| R14 · **ruled 2026-10-06 ([C6](clinical-rulings-2026-10-06.md#c6))** | **NEW. Red flag 4 (DKA signs)** reads "deep or hard breathing, fruity-smelling breath, or is very sleepy or confused, with a high blood sugar". The "with a high blood sugar" qualifier is ours, so confusion from a low isn’t sent to this line. Card 8 also says trouble breathing needs emergency care now, where the sheet says team and/or ED. | urgent.signs.4, 8.s4.3, 11.items.2, programsBand.cards.4 | Drop the qualifier (any of these signs → emergency care), or keep "trouble breathing" on the sheet’s team-or-ED line. |
| R15 · **ruled 2026-10-06 ([C5](clinical-rulings-2026-10-06.md#c5))** | **NEW (QA + nurse-educator review, 2026-10-05). Ketone ladder overlap at 1.5.** Breakthrough T1D publishes 0.6–1.5 and 1.5–3.0, so a blood reading of exactly 1.5 sits on two rungs (“keep checking; if you’re sick, call your team” and “risk of DKA, call your team now”). The same edge is in card 11 items 3–4 and band cards 2–3. Default: keep the source’s numbers and wording unchanged (ladder `blood` edges in chapters-meta.ts and the `range` strings are untouched). | 7.figure.blood.rungs.2–3, 11.items.3–4, 11.figure.lanes.3–4, programsBand.cards.2–3 | Make 1.5 belong to the more urgent rung (“0.6 to under 1.5” / “1.5 to 3.0”), which matches CPG Ch10’s “≥1.5” in 7.items.4; or add a line “At exactly 1.5, follow the higher rung”. Either needs the nurse’s sign-off, since it departs from the page’s wording. |

**Pre-publish checks (factual, not clinical rulings):**
1. Glucagon forms in Canada (3.items.2): confirm against Health Canada’s Drug Product Database that nasal and injectable glucagon are marketed, and no auto-injector.
2. CPS position statement (2015) on type 1 diabetes in school: confirm it has not been retired.
3. DC "Alcohol and diabetes" PDF (04/18, reflects 2018 CPG): confirm it is still DC’s current sheet.
4. DC Technology & Devices: re-read the backup line cited in 9.items.1 against the live page (the wording is recorded in the verify file only; no local copy in `src/`).

---

## E) COULD NOT SOURCE (HELD under sourcing policy 6, or left out)

The wording proposed here goes in `held-messages.ts`, held until a source is confirmed on the page and the nurse reviews it.

**Released after the source check** (now in the copy): nothing by mouth for someone who can’t swallow (das-glucagon); DKA symptoms and "ketones build up when there isn’t enough insulin" (bt1d-dka-and-ketones); fast sugar in the emergency kit (dc-managing-emergency-situations); medical ID in general (dc-exercise-and-activity + DC Alcohol PDF); checking glucagon’s expiry date (bt1d-what-is-glucagon).

| Topic | Card | Why held | Proposed wording if sourced | Likely source to check |
|---|---|---|---|---|
| **FIT: unexplained high on a pump** | 9 | FIT is the only source and is industry-run (R9; stays held, ruling C14) | "A sudden high you can’t explain, especially with nausea or vomiting, needs action fast: DKA can develop quickly when a pump stops delivering insulin. Follow your team’s backup plan for giving insulin another way, and check your infusion set, tubing and reservoir" | A non-industry Canadian source (DC Technology & Devices, Breakthrough pump pages) |
| **FIT: no infusion-set change at bedtime** | 9 | As above | "Try not to change your infusion set just before bed, so you can check it’s working" | As above |
| **FIT disclosure** | 9 | Only needed if either FIT line is released | "The FIT guide is published on a website run by embecta, a company that makes pen needles and syringes. Your pump team’s plan comes first." | — |
| **Sick-day medicine list** (R4; stays held, ruling C17) | 8 | Drug-class stop advice is out of scope by default | "If you’re eating less for more than 24 hours, it lists medicines that make your body release more insulin. If you’re dehydrated for more than 24 hours, it also lists metformin, SGLT2 inhibitors, ACE inhibitors and ARBs, water pills (diuretics) and anti-inflammatory pain relievers (NSAIDs). It doesn’t list combination pills" | DC Stay Safe sheet (verified; held for scope, not source) |
| **Symptoms of a low** (shaky, sweaty, etc.) | 1 | Not in the verified claims. The saved Diabetes@School page (`src/dasl.txt`) lists shakiness, sweating, hunger, confusion, irritability, blurry vision, weakness, dizziness, headache and pale skin, but it was not part of this check | "Signs of a low can include feeling shaky, sweaty, hungry or confused" | DC 02/24 hypo sheet; das-low-blood-sugar (re-check) |
| **Symptoms of a high** (not DKA) | 6 | DC Hyperglycemia recorded only as "symptoms when fasting ≥11" | A short list after 6.items.2 | DC Hyperglycemia |
| **HHS** | 6 | No patient-facing Canadian source; CPG Ch15 is clinician-only | None. Keep it out of patient copy unless the nurse wants a CPG-based line | — |
| **Hypoglycemia unawareness** | 4 | Only clinician driving rules mention it | "If you’ve stopped feeling your lows, tell your team" | CPG Ch14 2023 (re-check) |
| **Overnight lows in general** | 4 | Only "check before bed after drinking" (and the Alcohol PDF’s night alarm) is sourced | — | CPG Ch10 (clinician-level) |
| **Urine strips expire 6 months after opening** | 7 | Optional add from the verify file, not applied (sourced: bt1d-dka-and-ketones) | "If you use urine strips, Breakthrough T1D says to throw out a container that’s been open more than 6 months" | bt1d-dka-and-ketones (verified) |
| **Pump / sensor maker 24-hour lines** | 11 | Manufacturer pages only (policy 4) | "Your pump or sensor maker: device faults, any time" | Each maker’s page, plus a neutral source |
| **Pharmacist CDE phone number** | 11, pharmacist panel | Not confirmed by the owner | "Call a pharmacist CDE: 1-8xx-…" | Owner |
| ~~**Glucagon and fast-sugar product strips**~~ | 3, 5 | Built 2026-10-06 (B21; F.9). Card 3’s Baqsimi does not render yet: its product description gives another retailer’s phone number | — | Operations: fix the Baqsimi description |
| **Glucagon doses** | 3 | Out of scope (no dosing). If ever added, use the sources exactly | — | CPG Ch14, DC 02/24 sheet, Ch41 (never one injectable dose for all ages) |

No card is fully HELD. Card 9 has three sourced items without FIT.

---

## F) CHANGE LOG (what the source check changed)

| # | Key | Verify finding | Change made |
|---|---|---|---|
| 1 | urgent.signs.1 | Confirmed; Diabetes@School puts 911 first and says nothing by mouth (Safety #1) | Reordered to "Call 911, give glucagon…, turn them on their side and stay"; added "Don’t put food or drink in their mouth". Cited das-glucagon. |
| 2 | urgent.signs.3 | Partly: stricter than source; must be labelled T1D | Added "(ranges written for type 1 diabetes)". Kept "emergency care" as conservative (R3). |
| 3 | urgent.signs.4 | Safety #4: no red flag for a person without a meter | Added DKA-signs red flag (bt1d-dka-and-ketones; sheet "difficulty breathing"). New R14. |
| 4 | 1.items.5 | Optional "for most people" | Added. |
| 5 | 1.note | Partly: Ch21 is not a "sheet" | "Some Canadian guidance for driving and for school"; cited dc-drive-safe-card + das-low-blood-sugar + Ch21. |
| 6 | 2.note | Partly / Safety #9: "up to 40 minutes" weaker than Ch21 | Rewritten to Ch21: "at least 40 minutes, and until… at least 5.0". R6 updated. |
| 7 | 2.figure.options.3 | Safety #6: honey and babies | Added "(15 mL)"; honey hidden under the child toggle (`hideWhenChild`). Warning line HELD. New R13. |
| 8 | 2.figure.childNote | Partly / Safety #5: excludes AID | Now "injections, or a pump that doesn’t adjust insulin on its own"; automated systems "may need less". |
| 9 | 2.figure.aidNote | Ch41: all ages on AID may use 5–10 g | New always-visible line. New R12. |
| 10 | 3.items.2 | Auto-injector not confirmed for Canada (Safety #8) | "A nasal spray or an injection. Your pharmacist can tell you which is available"; cited Ch41. DPD check added to pre-publish list. |
| 11 | 3.items.3 | Order of actions (Safety #1) | "Call 911, or have someone call", then glucagon, side, stay, nothing by mouth. |
| 12 | 3.items.4 | Partly / Safety #2: missing severity qualifier | "If a low is affecting the person’s thinking or movement but they can still swallow… 20 g". |
| 13 | 3.items.5 | Partly: "only" not on page | "Staff named in the care plan, and trained… when the plan includes consent". |
| 14 | 3.note | Partly / Safety #7: nasal "from age 4" | Replaced with "For a child under 4, ask your child’s team which glucagon to keep"; added expiry check (released from E). |
| 15 | 4.items.2 | Not confirmed: "before and after" | Reworded to the page: "Check your blood sugar regularly, especially if you take insulin or other medicines that lower blood sugar". |
| 16 | 4.items.3 | Partly, wrong page | Re-cited to DC Alcohol PDF (+ Ch11); scoped to "insulin or some diabetes pills". |
| 17 | 4.items.4 | Partly, wrong page | Re-cited to DC Alcohol PDF (+ 2019 article for the carbohydrate line). |
| 18 | 4.items.5 (new) | Safety #11: glucagon and alcohol | New item from the Alcohol PDF. Sensor-lag item moved to 4.items.6; figure columns now [[1,2],[3,4,5]], neutral [6]. |
| 19 | 5.items.3 | Not confirmed, wrong page | Now a general "Wear medical ID, such as a bracelet or necklace"; cited dc-exercise-and-activity + Alcohol PDF (released from E). |
| 20 | 5.items.5 | Confirmed; "move" is better as "where it happens" | "treat a student’s low right away, where it happens, and not to leave them alone". |
| 21 | 5.items.6 | Confirmed; "phone or smartwatch" more exact | "a phone or smartwatch to help manage their blood sugar". |
| 22 | 6.items.1 | Partly: "two hours after" | Added "two hours after meals". |
| 23 | 7.items.1 (new) | E release: mechanism | New item: ketones build up without enough insulin (bt1d). Old items 1–3 now 2–4. |
| 24 | 7.items.3 (was 2) | Partly: "if your team has asked you" weaker than Breakthrough for T1D | Split: T1D check when sick (vomiting, stomach pain, fever); other types if told to (sheet). |
| 25 | 7.items.5 (new) | E release / Safety #4: DKA symptoms | New item listing DKA signs; "needs medical care right away". |
| 26 | 7.figure.blood.rungs.2 | Partly: call is conditional on illness | "Keep checking. If you’re sick, call your diabetes team." |
| 27 | 7.figure.urine.rungs.2 | Confirmed | "Urgent" replaced with the page’s own "Risk of DKA" so it matches blood rung 3. |
| 28 | 8.s1.1 | Confirmed; heat qualifier | "a lot of heat or humidity without enough to drink". |
| 29 | 8.s2.1 | Partly / Safety #10: missing fluid-restriction caveat | Added "unless you’ve been told to limit fluids". |
| 30 | 8.s2.3 | Sheet also says insulin "might need" adjusting | Added "your insulin may need adjusting, so ask your team how". No amounts. |
| 31 | 8.s3 | Scope #1: drug-class list reads as stop advice | List removed from the page (R4 option a, now the default); quoted list HELD in E. Note shortened to avoid repeating the pharmacist line. |
| 32 | 8.s4 | Partly (sheet’s list is longer) + Safety #3 (routing) | Three items: no fluids kept down → ED (team too); the sheet’s team-or-ED list incl. medicines/insulin uncertainty and moderate ketones; symptoms not getting better, with trouble breathing → emergency. |
| 33 | 9.items.1 | Not confirmed as worded; Scope #2 (FIT industry-run) | FIT line HELD. New 9.items.1 from DC Technology & Devices + DC Emergency Situations (backup pens/syringes; learn to switch to injections). |
| 34 | 9.items.2 | Confirmed | Reworded to stand alone: "If your blood sugar is high and you can’t explain it, check your ketones…". |
| 35 | 9.items.3 (was 3) | FIT-only bedtime line | HELD (R9). Pump-settings item moved up to 9.items.3. |
| 36 | 9.note | Partly: "support" understates embecta’s link | FIT disclosure removed with the FIT lines; corrected disclosure kept with the held copy. Note now: "Your pump team’s plan comes first…". |
| 37 | 10.items.1 | Confirmed ("at least") | Added "at least". |
| 38 | 10.items.2 | Confirmed; add fast sugar | Added "fast-acting sugar" (released from E). |
| 39 | 10.items.4 | Partly, wrong page for 2–8 °C | Attributed to Diabète Québec; cited dq-all-about-injections; added "or expired" (DC). |
| 40 | 11.items.2–4 | Partly (rung 2 conditional; fluids routed inconsistently) | Item 2 (and lane 2, now "Emergency department, or 911") adds no fluids kept down and DKA signs; item 3 drops fluids; item 4 adds "when you’re sick". |
| 41 | programsBand.cards.2–4 | Partly (same as rungs; Safety #3) | Card 2 "when you’re sick"; card 3 now only 1.5–3.0 / moderate, heading "Call your team now"; card 4 adds no fluids kept down and DKA signs. |
| 42 | A.1 / A.2 sources | Scope #9: wrong-source citations | Added `dc-alcohol-and-diabetes-2018`; `dq-all-about-injections` and `dc-drive-safe-card` now cited in copy; FIT no longer on any live card; card sources lists updated; sources-review notes for embecta (FIT), Abbott (Breakthrough DKA page), CPS 2015 and Alcohol PDF dates. |
| 43 | Optional, not applied | 7.items "blood preferred"; urine strips 6-month expiry | Strip expiry added to E as an optional, already-sourced line. "Blood preferred" left out to keep the item short. |

### F.2 Changes after the QA + nurse-educator review (2026-10-05)

Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only) and the Diabetes chapter meta. Section B above still shows the wording from before these changes; the keys below are the current wording. The meaning of every verified sentence is unchanged; new child-view strings repeat the existing CPG Ch41 table and add no amount. New strings await the nurse with the rest of the copy.

| # | Key | Review finding | Change made |
|---|---|---|---|
| 44 | 2.figure.childSteps.1, .4; 2.figure.childItems.1, .3; 2.figure.childOptionsHeading (all NEW) | HIGH 1: with “A child” selected the steps and the list heading still said 15 g | Child view swaps each 15 g line for wording that points to the age table: steps “Give the amount for their age” / “Still below 3.9? Give that amount again”; leads “Give fast-acting sugar. The amount for the child’s age is in the table” / “If it’s still below 3.9, give the amount in the table again”; heading “Each of these is 15 g of fast-acting sugar. For a child, give the amount in the table for their age:”. Adult view keeps the verified 15 g copy unchanged. Table (under 5 → 5 g, 5–10 → 10 g, over 10 → 15 g), childNote and aidNote unchanged. Source: dc-cpg-ch41-t1d-lifespan-2025. The 3.9 re-treat threshold is kept in the child view as it was (R1/R8: nurse to confirm it for children). |
| 45 | programsBand.cards.1 | HIGH 1: band card stated 15 g with no child caveat | Appended “For a child, the amount depends on their age: see The Rule of 15.” The title links to #card-2 (meta `programsBandCards: [2, null, null, null]`). Navigation only. |
| 46 | 2.figure.stepBodies.3 (NEW) | MEDIUM 2: step 3 “Check again” had no body | “Check your blood sugar again”, taken word for word from 2.items.2 (“…then check your blood sugar again”). No new claim. |
| 47 | ui.ruleOf15.loopBack, ui.ruleOf15.then, ui.ruleOf15.redFlagsLead/redFlagsLink (NEW or changed) | MEDIUM 2: loop badge “↻ 2” was aria-hidden only; “Then Once it’s back up”; no route out of the loop | Badge now reads “↻ back to step 2” for everyone (arrow decorative). The run-in “Then” is now a block label “After the low” above 2.items.4, so the item keeps its capital. New line under the loop: “If it won’t come up, or they get worse: see the signs that need emergency care”, linking to #red-flags. Navigation only, no new claim. |
| 48 | card 11 crisis strip (meta) | MEDIUM 3: 9-8-8 self-harm strip not in the verified copy | Crisis figure removed from card 11’s meta. The card’s verified 911 / who-to-call copy is unchanged. `ui.chapter.crisis` (engine words) stays but no Diabetes page renders it. |
| 49 | 6.note | LOW 7: two phrases for the in-page back-link | “at the top of this chapter” → “at the top of this page”, matching urgentExit.lead. |
| 50 | 8.note | LOW 10: “the plan below”, but the printable plan renders above the note | “Fill in the plan below…” → “Fill in the plan on this card…”. Meaning unchanged. |
| 51 | 1.items.1 placement (meta) | LOW 10: the definition of low rendered after the level columns | Item 1 moved above the columns (engine `columns.lead: [1]`); item 5 stays beneath. No wording change. |
| 52 | 7.figure.blood.rungs (no change) | LOW 5: 1.5 is on two rungs | Left as published; recorded as open ruling R15. |

Non-clinical copy changed in the same pass (DiabetesCare only, EN + FR): band eyebrow “Soft map” → “At a glance” / “En un coup d’œil”; help band eyebrow, heading and lead reworded for diabetes (“Wherever you are with diabetes”, “More help with your diabetes”); bookmark buttons named per card (“Bookmark: {title}”); path counts as ICU plurals. French only: typographic apostrophes throughout DiabetesCare; calques rewritten (help eyebrow, resources heading and intro, discovery band, “Chemin” → “Parcours”, reviewer line, talk card); lane 6 link label “Se connecter pour demander un appel” so the engine’s “(en anglais)” no longer doubles the brackets; guillemets with non-breaking spaces in band card 1.

## F.3 Change after the Every Day Living source check (2026-10-05)

| # | Where | Change | Reason |
|---|---|---|---|
| 53 | 4.items.5 (EN + FR) | Removed "Diabetes Canada says glucagon won't work while alcohol is in your body." Kept "Make sure someone with you knows to call 911 if you pass out." | The CDE check on chapter 04 calls the 2018 alcohol sheet's glucagon line outdated, and it conflicts with the red-flag instruction to give glucagon if you have it. Interim: keep only the sourced call-911 line until the nurse rules (R16). |

## F.4 Changes after the review of the built chapters (2026-10-05)

No verified sentence of this chapter changed. Section B above still shows the wording from before these changes.

| # | Where | Change | Reason |
|---|---|---|---|
| 54 | meta card 11 lane 4 topics | The "Your diabetes team" lane also fits "A pump or sensor" and "Supplies" (topics `high`, `sick`, `device`, `supplies`). The Liivv pharmacist CDE lane still fits both. No wording change. | Review 2: the team or educator should fit device and supplies questions, not only Liivv's lane. Lane 3 ("…, now", the urgent ketone line) is unchanged. |
| 55 | Cards 2, 6, 7 and #red-flags (targets only) | New links into this chapter from New to the Journey (cards 5 and 8 → card 2) and Know Your Type (card 1 → card 7, card 2 → #red-flags, card 12 → card 2, card 13 → card 6). Nothing in this chapter changed; every target was checked to exist. | Review 3. |
| 56 | Shared interface text | Shared French interface text (`DiabetesCare.ui`, every chapter; review 8): `ui.chapter.takeIn.print` “Imprimez cette liste” → “Imprimer la liste”, so every print button uses the infinitive (“Imprimer la règle des 15”, “Imprimer mes indices et mes questions”, “Imprimer l’arbre familial”); “Soins du diabète” → “Soins en diabète” in `ui.chapter.kicker`, `backToLanding` and `backToChapters`; `ui.governance.machineTranslated` “votre équipe de soins du diabète” → “votre équipe de soins en diabète”. No link label stacks two brackets any more: the engine now puts the “(en anglais)” note inside a label’s own closing bracket (“(s’ouvre sur leur site, en anglais)”, “(connexion requise, en anglais)”), with no message change. Emergency number (review 4): the crisis strip’s label is now “Emergency: call 911” / “Urgence : appeler le 911” (meta `written: '911'`); the message text already said 911 everywhere, and 9-8-8 keeps its hyphens. | Review 8 (and 4). |

## D.2 New open ruling

- **R16 (site-wide, safety):** **ruled 2026-10-06 ([C2](clinical-rulings-2026-10-06.md#c2)): restored in CPG Ch14 2023's wording on card 4 (F.6).** Glucagon and alcohol. Diabetes Canada's 2018 "Alcohol and diabetes" sheet says glucagon will not work while alcohol is in the body; the chapter 04 CDE check calls this outdated. Options: (a) leave it out (current interim); (b) restore it with newer wording from a registered source (e.g. "may not work as well — call 911 and give it anyway"), which needs a source.

## F.5 Changes after the full-site review (2026-10-06)

No verified adult sentence changed. Child wording added, so "A child" no longer switches back to "your":

| # | Key (EN and FR) | Now | Why |
|---|---|---|---|
| 57 | `2.figure.childItems.2` (new) | "Wait 15 minutes, then check their blood sugar again" (FR "Attendez 15 minutes, puis vérifiez de nouveau sa glycémie") | Browser QA 9: the child view read "your blood sugar" from step 2 on |
| 58 | `2.figure.childStepBodies.3` (new) | "Check their blood sugar again" (FR "Vérifiez de nouveau sa glycémie") | As 57 |
| 59 | `2.figure.childItems.4` (new; the line after the loop) | "Once it’s back up, if their next meal is more than an hour away, give them a snack with a starch and a protein" (FR "Une fois qu’elle est remontée, si son prochain repas est dans plus d’une heure, donnez-lui une collation qui contient un féculent et une protéine") | As 57. Same facts as 2.items.4 (`dc-hypoglycemia-adults-sheet-2024`, `dc-cpg-ch14-hypoglycemia-2023`) |
| 60 | `ui.ruleOf15.backToStep` (new, "Back to step {n}" / "Retour à l’étape {n}") | On the last step of the walk-through, a button does what "↻ back to step 2" says | Browser QA 13 |

Not changed, now owner questions: the ketone 1.5 overlap (OPEN-QUESTIONS C5, raised again), the DKA red-flag qualifier (C6), and whether the driving note hides under "A child" (C44). Not changed: card 2's two uses of "insulin" ("a pump that doesn't adjust insulin on its own", "On an automated (closed-loop) insulin system?"); the clinical review offered alternatives only "if the rule is literal", and no rule in this record bars the word where it names a device type.

## F.6 Clinical rulings applied (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md) (the verifier's final copy). Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `chapters-meta.ts`, `sources-meta.ts` / `sources-review.ts` and, for C18, `site-figures.tsx` and `dc-figures.css`. Section B above still shows the earlier wording; the keys below are the current wording. All French is machine-drafted and awaits the francophone review with the rest of the chapter.

| # | Key | Change (EN, then FR) | Ruling |
|---|---|---|---|
| 61 | `4.items.5` | EN "Make sure someone with you knows to call 911 if you pass out" → "Make sure someone with you knows to call 911 if you pass out, and to give you glucagon if you have it. Diabetes Canada’s guideline says glucagon may not work as well if you’ve had more than 2 standard drinks in the past few hours, so the 911 call matters even more" · FR → "Assurez-vous qu’une personne avec vous sait qu’elle doit appeler le 911 si vous perdez connaissance, et vous donner du glucagon si vous en avez. Selon les lignes directrices de Diabète Canada, le glucagon peut être moins efficace si vous avez pris plus de 2 verres standard d’alcool au cours des dernières heures : l’appel au 911 est donc d’autant plus important" | [C2](clinical-rulings-2026-10-06.md#c2) |
| 62 | `7.figure.blood.rungs.4.action` | EN "Get emergency care now" → "Medical emergency. Get emergency care now" · FR → "Urgence médicale. Obtenez des soins d’urgence maintenant" | [C4](clinical-rulings-2026-10-06.md#c4) |
| 63 | `7.figure.urine.rungs.3.action` | EN "Get emergency care now" → "Medical emergency. Get emergency care now" · FR → "Urgence médicale. Obtenez des soins d’urgence maintenant" | [C4](clinical-rulings-2026-10-06.md#c4) |
| 64 | `7.figure.blood.rungs.3.action` | EN "Risk of diabetic ketoacidosis (DKA). Call your team now" → "Risk of diabetic ketoacidosis (DKA). Call your team now. If you can’t reach them, go to the emergency department" · FR → "Risque d’acidocétose diabétique (ACD). Appelez votre équipe maintenant. Si vous ne pouvez pas la joindre, allez à l’urgence" | [C4](clinical-rulings-2026-10-06.md#c4) |
| 65 | `7.figure.urine.rungs.2.action` | EN "Risk of DKA. Call your team now" → "Risk of DKA. Call your team now. If you can’t reach them, go to the emergency department" · FR → "Risque d’ACD. Appelez votre équipe maintenant. Si vous ne pouvez pas la joindre, allez à l’urgence" | [C4](clinical-rulings-2026-10-06.md#c4) |
| 66 | `7.note` | EN "The ladder below is from Breakthrough T1D and was written for type 1 diabetes. If you have another type, ask your team which numbers to use." → "The ladder below is adapted from Breakthrough T1D and was written for type 1 diabetes. If you have another type, ask your team which numbers to use. With any type, Diabetes Canada says high ketones need medical care right away." · FR → "L’échelle ci-dessous est adaptée de Breakthrough T1D et a été rédigée pour le diabète de type 1. Si vous avez un autre type de diabète, demandez à votre équipe quelles valeurs utiliser. Peu importe le type, Diabète Canada indique que des cétones élevées demandent des soins médicaux tout de suite." | [C4](clinical-rulings-2026-10-06.md#c4), [C5](clinical-rulings-2026-10-06.md#c5) |
| 67 | `7.figure.blood.rungs.2.range` | EN "0.6 to 1.5" → "0.6 to under 1.5" · FR → "De 0,6 à moins de 1,5" | [C5](clinical-rulings-2026-10-06.md#c5) |
| 68 | `11.items.4` | EN "Your diabetes team: blood ketones 0.6 to 1.5 when you’re sick, or small urine ketones" → "Your diabetes team: blood ketones 0.6 to under 1.5 when you’re sick, or small urine ketones" · FR → "Votre équipe de soins en diabète : cétones sanguines de 0,6 à moins de 1,5 quand vous êtes malade, ou petite quantité de cétones dans l’urine" | [C5](clinical-rulings-2026-10-06.md#c5) |
| 69 | `programsBand.cards.2.body` | EN "Blood ketones 0.6 to 1.5 when you’re sick, or small urine ketones." → "Blood ketones 0.6 to under 1.5 when you’re sick, or small urine ketones." · FR → "Cétones sanguines de 0,6 à moins de 1,5 quand vous êtes malade, ou petite quantité de cétones dans l’urine." | [C5](clinical-rulings-2026-10-06.md#c5) |
| 70 | `7.figure.writtenFor` | EN "Written for type 1 diabetes, by Breakthrough T1D" → "Written for type 1 diabetes, adapted from Breakthrough T1D" · FR → "Rédigé pour le diabète de type 1, adapté de Breakthrough T1D" | [C5](clinical-rulings-2026-10-06.md#c5) |
| 71 | `urgent.signs.4` | EN "Has deep or hard breathing, fruity-smelling breath, or is very sleepy or confused, with a high blood sugar" → "Has deep or hard breathing or fruity-smelling breath, or is very sleepy or confused with a high blood sugar or ketones. In pregnancy, or with some diabetes medicines, DKA can happen even when blood sugar is near normal" · FR → "Respire profondément ou difficilement, ou a une haleine qui sent le fruit, ou est très somnolente ou confuse avec une glycémie élevée ou des cétones. Pendant la grossesse, ou avec certains médicaments contre le diabète, l’ACD peut survenir même quand la glycémie est presque normale" | [C6](clinical-rulings-2026-10-06.md#c6) |
| 72 | `2.figure.childNote` | EN "From Diabetes Canada’s guideline for children with type 1 diabetes who use injections, or a pump that doesn’t adjust insulin on its own. Children on an automated (closed-loop) system may need less. Ask your child’s team." → "From Diabetes Canada’s guideline for children with type 1 diabetes who use injections, or a pump that doesn’t adjust insulin on its own. Children on an automated (closed-loop) system may need less. If your child has another type of diabetes, or uses an automated system, ask their team how much to give." · FR → "Tiré de la ligne directrice de Diabète Canada pour les enfants atteints de diabète de type 1 qui utilisent des injections, ou une pompe qui n’ajuste pas l’insuline d’elle-même. Les enfants qui utilisent un système automatisé (en boucle fermée) pourraient avoir besoin de moins. Si votre enfant a un autre type de diabète, ou utilise un système automatisé, demandez à son équipe quelle quantité donner." | [C8](clinical-rulings-2026-10-06.md#c8) |
| 73 | `2.figure.options.2` | EN "½ cup (125 mL) of juice or regular pop" → "⅔ cup (150 mL) of juice or regular pop" · FR → "⅔ tasse (150 mL) de jus ou de boisson gazeuse ordinaire" | [C13](clinical-rulings-2026-10-06.md#c13) |
| 74 | `10.items.5` | EN "How long an opened pen or vial lasts depends on the product. Follow the leaflet that came with your insulin" → "How long an opened pen or vial lasts depends on the product. Diabète Québec says most are good for up to 28 days once opened, and some for longer. Follow the leaflet that came with your insulin" · FR → "La durée de conservation d’un stylo ou d’une fiole ouverts dépend du produit. Selon Diabète Québec, la plupart se conservent jusqu’à 28 jours une fois entamés, et certains plus longtemps. Suivez le feuillet qui accompagne votre insuline" | [C15](clinical-rulings-2026-10-06.md#c15) |
| 75 | `6.items.4` | EN "Ketones can build up even when blood sugar is close to normal, for example in pregnancy or with some diabetes medicines. Ask your pharmacist whether this applies to you" → "Ketones can build up even when blood sugar is close to normal, for example in pregnancy or with a type of diabetes pill called an SGLT2 inhibitor. Ask your pharmacist whether any of your pills is, or contains, one" · FR → "Les cétones peuvent s’accumuler même quand la glycémie est proche de la normale, par exemple pendant la grossesse ou avec un type de comprimé contre le diabète appelé inhibiteur du SGLT2. Demandez à votre pharmacien si l’un de vos comprimés en est un, ou en contient un" | [C17](clinical-rulings-2026-10-06.md#c17) |
| 76 | `8.sections.2.items.3` | EN "If you use insulin, check your blood sugar more often. The sheet says your insulin may need adjusting, so ask your team how" → "Diabetes Canada says that if you use insulin, you should keep taking it when you’re sick. Check your blood sugar more often. The sheet says your insulin may need adjusting, so ask your team how" · FR → "Diabète Canada indique que si vous utilisez de l’insuline, vous devez continuer à la prendre quand vous êtes malade. Vérifiez votre glycémie plus souvent. La fiche indique que votre insuline pourrait devoir être ajustée; demandez donc à votre équipe comment faire" | [C17](clinical-rulings-2026-10-06.md#c17) |
| 77 | `8.sections.4.items.2` | EN "Call your team or go to the emergency department if you can’t drink enough, don’t know which medicines to stop or how to adjust your insulin, or your ketones are moderate. Large ketones need emergency care now" → "If you’re sick and can’t eat, call your doctor or go to the emergency department if you vomit or have diarrhea 2 or more times in 4 hours" · FR → "Si vous êtes malade et ne pouvez pas manger, appelez votre médecin ou rendez-vous à l’urgence si vous vomissez ou avez de la diarrhée 2 fois ou plus en 4 heures" | [C17](clinical-rulings-2026-10-06.md#c17) |
| 78 | `8.sections.4.items.3` | Was 8.s4.2, unchanged wording (renumbered after the new item 2; EN and FR) | [C17](clinical-rulings-2026-10-06.md#c17) |
| 79 | `8.sections.4.items.4` | Was 8.s4.3, unchanged wording (renumbered; EN and FR) | [C17](clinical-rulings-2026-10-06.md#c17) |
| 80 | `2.figure.childOptionsNote` | New (EN) "Honey isn’t on the list for children. Health Canada says not to give any honey to babies under 1 year." · FR "Le miel ne figure pas dans la liste pour les enfants. Santé Canada indique de ne donner aucune sorte de miel aux bébés de moins d’un an." | [C18](clinical-rulings-2026-10-06.md#c18) |
| 81 | `2.note` | EN "After a low, wait at least 40 minutes, and until your blood sugar is at least 5.0, before you drive. More on driving in Every Day Living." → "After a low, anyone who drives, teens included, should wait at least 40 minutes, and until their blood sugar is at least 5.0, before driving. More on driving in Every Day Living." · FR → "Après une hypoglycémie, toute personne qui conduit, y compris les adolescents, devrait attendre au moins 40 minutes, et que sa glycémie soit d’au moins 5,0, avant de conduire. Plus d’information sur la conduite dans le chapitre sur la vie au quotidien." | [C44](clinical-rulings-2026-10-06.md#c44) |

Meta, register and record changes in the same pass:

| # | Where | Change | Ruling |
|---|---|---|---|
| 82 | card 1 sources | Added `dq-low-blood-sugar-leaflet-2025` (Diabète Québec, 2025 leaflet, EN and FR read 2026-10-06), so French readers have a French source for 3.9 | [C1](clinical-rulings-2026-10-06.md#c1) |
| 83 | card 2 and its `ruleOf15` figure sources | Added `dq-low-blood-sugar-leaflet-2025` (150 mL) and `hc-infant-botulism` (Health Canada, registered 2026-10-06, EN and FR read). The juice option now rests on CPG Ch14 2023 Table 4 (claims table: 2.figure.options.2 → `dc-cpg-ch14-hypoglycemia-2023`, Table 4) | [C13](clinical-rulings-2026-10-06.md#c13), [C18](clinical-rulings-2026-10-06.md#c18) |
| 84 | `2.figure.childOptionsNote` (renderer) | `site-figures.tsx` renders the new note under the 15 g list; `dc-figures.css` shows it wherever the children's table shows (the child view, and before the island runs or with JavaScript off). It is part of the gated `ruleOf15` figure, so /fr drops it with the figure until that gate is signed off. `hideWhenChild: [3]` is unchanged | [C18](clinical-rulings-2026-10-06.md#c18) |
| 85 | card 4 sources | Added `dc-cpg-ch14-hypoglycemia-2023` for 4.items.5; card 4 stays unpinned (the line prepares) | [C2](clinical-rulings-2026-10-06.md#c2), [C25](clinical-rulings-2026-10-06.md#c25) |
| 86 | card 6 sources | Added `dc-stay-safe-sick-days-sheet` beside Ch15 for 6.items.4 | [C17](clinical-rulings-2026-10-06.md#c17) |
| 87 | card 7 `ketoneLadder` | `blood` edges now `[{ below: 0.6 }, { from: 0.6, below: 1.5 }, { from: 1.5, to: 3.0 }, { above: 3.0 }]`; figure sources `bt1d-dka-and-ketones`, `dc-cpg-ch10-physical-activity`, `dc-stay-safe-sick-days-sheet`. Claims-table note: Ch15 and Ch41 use >1.5, Ch10 uses ≥1.5; 1.5 goes on the higher rung | [C4](clinical-rulings-2026-10-06.md#c4), [C5](clinical-rulings-2026-10-06.md#c5) |
| 88 | card 8 sources | Added `dc-checking-blood-sugar` (its sick-day section, re-read 2026-10-06) for 8.s2.3 and 8.s4.2. Its general "Keep taking your diabetes medications" is not used. Section E's "Keep taking your insulin when you’re sick" row is released and removed | [C17](clinical-rulings-2026-10-06.md#c17) |
| 89 | `urgent.signs.4` claims | Sources now also `dc-cpg-ch15-hyperglycemic-emergencies` and `dc-cpg-ch41-t1d-lifespan-2025` (euglycemic DKA in pregnancy and with some medicines) | [C6](clinical-rulings-2026-10-06.md#c6) |
| 90 | Section E | The honey row is removed (released as 2.figure.childOptionsNote, sourced to Health Canada). FIT rows stay held (C14); the medicine-class list stays held (C17) | [C14](clinical-rulings-2026-10-06.md#c14), [C17](clinical-rulings-2026-10-06.md#c17), [C18](clinical-rulings-2026-10-06.md#c18) |
| 91 | `sources-review.ts` | Notes ruled on `dc-cpg-ch14-hypoglycemia-2023` (Table 4: 150 mL, 6 Life Savers, 15 mL honey; C1, C13, C29), `dc-hypoglycemia-adults-sheet-2024`, `dc-drive-safe-card`, `bt1d-dka-and-ketones`, `dc-alcohol-and-diabetes-2018` (superseded by Ch14 2023), `dc-checking-blood-sugar`, `dq-all-about-injections` (French address added) | [C1](clinical-rulings-2026-10-06.md#c1), [C2](clinical-rulings-2026-10-06.md#c2), [C4](clinical-rulings-2026-10-06.md#c4), [C13](clinical-rulings-2026-10-06.md#c13), [C14](clinical-rulings-2026-10-06.md#c14), [C17](clinical-rulings-2026-10-06.md#c17), [C29](clinical-rulings-2026-10-06.md#c29) |
| 92 | Pinning (meta comment) | The site-wide rule is written in `chapters-meta.ts`: cards 3, 6, 7, 8 and 11 pinned; 4 and 10 not | [C25](clinical-rulings-2026-10-06.md#c25) |

Not changed here: R10 (alcohol limits, C16) is still open. The CDE sentence on card 11 lane 6 is for the business step (C12).

## F.7 Clinical rulings applied: targets, types and other (2026-10-06)

| # | Where | Record | Ruling |
|---|---|---|---|
| 1 | R10 | Closed. This chapter states no alcohol limit; card 4 keeps only the delayed-low facts and the glucagon line (C2). Every Day Living card 4 now states Diabetes Canada's and CCSA's 2023 positions, each in its own words | [C16](clinical-rulings-2026-10-06.md#c16) |

## F.8 Owner's business answers applied (2026-10-06)

From the owner's answers of 2026-10-06 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)). French machine-drafted.

| # | Key | Change | Why |
|---|---|---|---|
| 1 | `pharmacist.body`, `pharmacist.cta` | EN body → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province. For a low or a high right now, follow your plan or the steps on this page." · FR → "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province. Pour une glycémie basse ou élevée en ce moment, suivez votre plan ou les étapes de cette page.". Under the body, the panel shows the CDE contact from `ui.contact` (DIABETES_SITE.contact): "Call 1-844-561-1254" (tel:+18445611254; FR "Appeler le 1 844 561-1254"), "Email BayshoreExpress@bayshore.ca", "Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays", and "About Bayshore Express Pharmacy" (https://bayshoreexpresspharmacy.ca/about/; FR /fr/a-propos-de-nous/, `bep-about`). The `cta` "Request a call" is removed: the panel has no button, and the hero's "Ask a pharmacist" opens the panel (`#chapter-cde`) | Owner A2, B5, B9, B10, B12 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)) |
| 2 | `11.figure.lanes.6` (meta: lane 6) | label → "Bayshore Express Pharmacy CDEs"; scope → "The Liivv pharmacy in Markham, Ontario · all of Canada · Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays"; body unchanged; link → "Call 1-844-561-1254" (tel:+18445611254; meta `sources: ['bep-about']`) · FR "Éducateurs agréés en diabète de la Pharmacie Bayshore Express" / "La pharmacie Liivv de Markham, en Ontario · partout au Canada · …" / "Appeler le 1 844 561-1254". The lane still answers only pump, sensor and supply topics | C12 (business group), B9 |
| 3 | `2.note` | "More on driving in Every Day Living." → "More on driving in Everyday Liivving." (FR "…dans le chapitre sur la vie au quotidien." → "…dans Liivv au quotidien.") | B32 |
| 4 | Held list | "Pharmacist CDE phone number" released | B9 |
| 5 | `11.figure.lanes.6` (meta: lane 6, `contact: true`) | The lane now shows the whole CDE contact under its words, as every CDE panel does: "Call 1-844-561-1254" (tel:+18445611254), "Email BayshoreExpress@bayshore.ca", the hours and "About Bayshore Express Pharmacy" (`ui.contact`, DIABETES_SITE.contact). The single "Call 1-844-561-1254" link (`linkLabel`) is removed, and the hours leave the scope line, which is now "The Liivv pharmacy in Markham, Ontario · all of Canada" (FR "La pharmacie Liivv de Markham, en Ontario · partout au Canada"). Still behind `laneExtras` on /fr | B9 (email and About page in the CDE lanes too) |

## F.9 Commerce step: shop strips (2026-10-06)

How a strip behaves (all chapters): the products are named in `diabetes-care/chapters/chapter-shop.ts` (owner answer B21, "Now?"), drawn by the shared engine (`_microsite/shop/`) under the card's referral chip, and read from the catalogue on every request. A product shows only while the store shows it, sells it and has it in stock, and never when its description names or links another retailer or gives its phone number (17 descriptions still do; OPEN-QUESTIONS B3). A product with a required option or modifier (85 diabetes products carry a required "Test" modifier today) gets "Choose options", a link to its page, instead of a one-click add. No kit is listed (A4). One switch, `SHOP_SWITCH.placements`, turns every strip off. Every placed id is health-revealing by id for analytics (`sensitive-products.ts`). The strip's words are `ui.chapter.shop.*` (French machine-drafted, not behind a review gate, as on Ostomy).

| # | Card | Strip | Why |
|---|---|---|---|
| 1 | 2 The Rule of 15 | None, on purpose | B21 rule |
| 2 | 3 Glucagon | `glucagon` ("Glucagon, for someone else to give you"): Baqsimi (4555), the only glucagon placed anywhere, with `ui.commerce.pharmacistNotice`. **Renders nothing today**: the Baqsimi description still says "please contact us at 1-866-418-3392" (not Liivv's number), so the catalogue check refuses it until operations fixes the description in the store (OPEN-QUESTIONS B3). Shown on /fr too once it renders: glucagon is not insulin | B21, B3 |
| 3 | 5 Carry it, wear it | `carry`: Dex4 tablets (7371) and gel (7382), the Dex4 key chain (4731), medical IDs (7778, 4289) | B21 |
| 4 | 3, 5 (section A code mirror) | Record only: the card 3 and card 5 comments no longer say the strips are ON HOLD; they point here. Card 3 still renders nothing until the Baqsimi description is fixed in the store (row 2). Nothing on the page changes | B21, B3 |

## F.10 Fixes after the full-site review (2026-10-06)

From the browser QA, the link crawl and the clinical and business review of 2026-10-06. French machine-drafted. Engine-wide changes (the pharmacist panel heading's contrast, the shop strips on narrow phones, the cold-chain notice) are in new-to-the-journey.md F.8.

| # | Where | Change | Why |
|---|---|---|---|
| 1 | Red-flag block (`urgent.action`) | "911" in "Call 911 or go to the nearest emergency department" (FR « Appelez le 911 ou rendez-vous à l’urgence la plus proche. ») is a tel: link, as on the landing and New to the Journey. Engine: `SiteConfig.emergency` (new, engine-only), set to 911 in `DIABETES_SITE`. The words do not change | Clinical review 10 |
| 2 | "Where this comes from" (meta `citations`) | Nine sources the cards rest on are added, each with the register's title and link (French title and page where the publisher has one): Diabetes Canada's Ch41 (a child's amounts), Diabète Québec's 2025 low blood sugar leaflet (⅔ cup), Health Canada's Infant botulism (honey), Breakthrough T1D's What is glucagon?, Diabetes@School's Low blood sugar and Glucagon pages, the CPS 2015 school statement, Diabetes Canada's Ch21 (driving) and Diabète Québec's All about injections (insulin storage). The list had five. Card-level `sources` still do not render on their own: whether every chapter should list every card source is B43 | QA 5 |
| 3 | `11.figure.lanes.6.body` | "Questions about pump and sensor supplies." → "Questions about pumps, sensors, meters and other diabetes supplies, and about billing and claims." (FR « Questions sur les pompes, les capteurs, les lecteurs et les autres fournitures pour le diabète, et sur la facturation et les demandes de remboursement. »), New to the Journey's lane 4 words | Clinical review 4; B10 |
| 4 | `pharmacist.heading` | "Questions about pump and sensor supplies" → "Questions about pumps, sensors, supplies or claims" (FR « Questions sur les pompes, les capteurs, les fournitures ou les demandes de remboursement »), to match the panel's body (B10). Know Your Type's panel had the same heading and is changed the same way | Clinical review 4 |
| 5 | Card 3 strip | Unchanged and still empty: Baqsimi's description phones another retailer (1-866-418-3392), so the catalogue check refuses it until the owner fixes it in the store (B3). Its notice no longer says cold-chain (new-to-the-journey.md F.8 row 4) | Crawl 3 |

Not changed, an open nurse question (C46): the quick-reference lane "Your diabetes team, now" (card 11, item 3) and band card 3 ("Call your team now") have no "if you can't reach them, go to the emergency department" line, which ruling C4 added to the ketone ladder's moderate rung only.

## F.11 Ruling C46 applied (2026-10-06)

| # | Where | Change | Why |
|---|---|---|---|
| 1 | `11.items.3` | "Your diabetes team, now: blood ketones 1.5 to 3.0, or moderate urine ketones" → adds ". If you can’t reach them, go to the emergency department" (FR « … Si vous ne pouvez pas la joindre, allez à l’urgence »), the ladder's own moderate-rung words | C46 (protective reading of C4) |
| 2 | `programsBand.cards.3.body` | "Blood ketones 1.5 to 3.0, or moderate urine ketones." → adds " If you can’t reach your team, go to the emergency department." (FR « … Si vous ne pouvez pas joindre votre équipe, allez à l’urgence. ») | C46 |
