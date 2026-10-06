# 01 · New to the Journey — chapter copy, after source check (DiabetesCare.chapters.new-to-the-journey)

Version of 2026-10-05. It applies the source check in `content/new-to-the-journey.verify.md` to `content/new-to-the-journey.draft.md`. Not compiled, not in the repo. The shape follows the finished Staying Safe entry (`diabetes-care/chapters/chapters-meta.ts`, `DiabetesCare.chapters.staying-safe` in `core/messages/en.json`). Voice and the `crisis`, `routes` and `doors` figures follow Ostomy Chapter 01 (`OstomyCare.chapters.new-to-the-journey`).

Ground rules applied:
- Every SourceId below exists in `diabetes-care/chapters/sources-meta.ts`. All 35 were checked against the file on 2026-10-05. Facts come from the page and PDF wording recorded in `new-to-the-journey.verify.md` (copies in `scratchpad/src/ntj/`, `scratchpad/src/edl/` and `scratchpad/src/`). Every "Partly" row in the check has been reworded or re-cited. The check found no "Not confirmed" rows. Section F lists each change.
- All cited sources are Canadian: Diabetes Canada, Health Canada, 9-8-8, the Ontario Drug Benefit program, HPSA, CDECB and Breakthrough T1D Canada. No card needs the "International guidance" label. Card 3's sensor target is an international consensus target, but it is cited through Diabetes Canada's own guideline (CPG Ch9), which adopts it, and the copy now says so (N5). `bt1d-time-in-range` is only ever a second source (it is coalition-funded). No source that `types-verify.md` marked FAIL is used: neither Hart 2016 nor the ADA 2026 summary of revisions.
- No product or brand names in the copy. Since 2026-10-06 (B21) cards 8 and 10 carry shop strips (`chapter-shop.ts`; F.7): card 8 links the insulin shelf, never a named insulin, with the pharmacist notice, in English only; card 10 groups starter products by therapy. Card 10 stays `columns`; a ticking `supplyList` with products is not built.
- There is no dosing, titration or treatment decision, and no drug-class recommendation. "Your prescriber chooses your insulin." The one target a team may tighten (3.items.2) is now framed as the team's decision.
- There is no Diabetes Express mention or link. The unconfirmed phone number is no longer printed anywhere in this file (section E).
- Urgent exit: this chapter has no red-flag block. It signposts `/liivv-health/diabetes-care/chapters/staying-safe#red-flags` through `urgentExit: { chapter: 'staying-safe' }`. The card 1 crisis strip now carries 9-1-1 as well as 9-8-8.
- Liivv pharmacist CDE: "Request a call" only (`/account/virtual-care/appointment`). The phone number is not confirmed.

Clinical defaults used, pending the nurse. Section D shows where each one is used.
- Low is below 3.9 mmol/L. This now also covers the 3.9 vs 4.0 time-in-range floor.
- Juice for a low is ½ cup. It is not repeated here; the chapter links to The Rule of 15.
- The ketone ladder is written for type 1. It is referenced here only through "ketone strips".
- In-use insulin: "follow your leaflet".
- No alcohol limits are stated.
- FIT is treated as industry-run, so no FIT line is used.

---

## A) META OUTLINE

### A.1 Type and register changes this chapter needs (outside the chapter entry)

| File | Change |
|---|---|
| `chapters-meta.ts` | `DiabetesLaneTopic` gains `'plan' \| 'medicines' \| 'feelings'` (card 11 topics). `DIABETES_SITE.serviceLaneTopics` stays `['device', 'supplies']`, so the Liivv lane can only ever be ticked for those two. |
| `chapters-meta.ts` | `DiabetesFigureMeta` gains `glucoseRange` (card 3, G.1). Optional later: `checkupYear` (band slot, G.2) and `starterList` (card 10, G.3). |
| `chapters-meta.ts` | New consts. `BT1D_MENTAL_HEALTH_HREF = 'https://breakthrought1d.ca/mental-health-support/'` is the `bt1d-mental-health-support` address. `FIND_A_CDE_HREF = 'https://systems.cdecb.ca/findCDE'` is a literal copy of `EDUCATOR_DIRECTORY_HREF` in `sources-meta.ts`, with a comment saying so. It is a copy because the meta file must stay free of value imports. |
| `review-gates.ts` | Add `GATED_KINDS.glucoseRange = 'glucoseRange'`. The GateId already exists, and the template literal type already covers the `chapter:new-to-the-journey` gate. On /fr the card falls back to its own items, which carry every number. |
| `en.json` `DiabetesCare.ui.chapter.groups` | Add `"firstDays": "The first days"` and `"settingUp": "Setting up"`. |
| `sources-review.ts` | Update these notes from what the source check read on the live pages: **988-suicide-crisis-helpline**: card 1 of this chapter shows the strip, with 9-1-1 ("If your safety is at risk, call 9-1-1 right away"). **dc-type-1**: the page gives both "roughly 10 per cent" and "five to 10 percent", and the copy uses 5 to 10%. **bt1d-mental-health-support**: the directory lists "registered mental health providers", and the Caregiver Guide is for parents and caregivers of children and teens with T1D. **bt1d-time-in-range**: supported by the Time in Range Coalition (diaTribe keeps editorial independence), so use it as a second source only. **dc-cpg-ch9-monitoring-2021**: its time-in-range targets come from the International Consensus Report and exclude pregnancy, children and adolescents, and older or high-risk groups. A1C at least every 6 months in adults who are stable at target. |
| Routing | Adding this slug to `CHAPTER_META` moves `/chapters/new-to-the-journey` from `chapters-data.ts` onto the engine. The card 2 doors open the matching `know-your-type` cards (1, 2, 4, 3, 6); Ch05 is served, so the hold is lifted (D, N12; F.2 #35). |

### A.2 Proposed CHAPTER_META entry

```ts
const BT1D_MENTAL_HEALTH_HREF = 'https://breakthrought1d.ca/mental-health-support/';
/* Same address as EDUCATOR_DIRECTORY_HREF in sources-meta.ts (`cdecb-find-a-cde`); a literal, as this file may not import a value. */
const FIND_A_CDE_HREF = 'https://systems.cdecb.ca/findCDE';

/*
 * 01 · New to the Journey. Copy: DiabetesCare.chapters.new-to-the-journey,
 * after the source check of 2026-10-05. No red-flag block of its own: the
 * start-here map signposts Staying Safe's. Clinical defaults (R1–R10, N1–N14)
 * are open with the nurse and recorded in the content review.
 */
{
  slug: 'new-to-the-journey',
  num: '01',
  chapterWord: 'one',
  heroImage: `${IMG}/chapter-new.png`,
  accent: '#a89c94',
  rail: false,
  majorSections: true,
  /* Exactly two segments: the first days, and setting up. */
  startHere: { groups: ['firstDays', 'settingUp'] },
  urgentExit: { chapter: 'staying-safe' },
  /* "Do I need a meter?" in the intro body links to card 6, where Setting up starts. */
  introCard: 6,
  categories: [
    /* ---------- The first days ---------- */
    {
      // 1 Just been told. The strip carries 9-8-8 and 9-1-1 (the 9-8-8 page
      // says "If your safety is at risk, call 9-1-1 right away"), so the card
      // is pinned open in every locale.
      image: `${IMG}/chapter-new.png`,
      group: 'firstDays',
      ask: 'team',
      urgentContent: true,
      figures: [
        { kind: 'crisis', numbers: [{ tel: '988', sms: true }, { tel: '911', kind: 'emergency' }] },
        { kind: 'routes', routes: [{ glyphs: ['team', 'primaryCare'] }, { glyphs: ['pin'] }] },
      ],
      sources: [
        'dc-taking-care-of-mental-health',
        'dc-cpg-ch18-mental-health-2023',
        'bt1d-mental-health-support',
        '988-suicide-crisis-helpline',
      ],
    },
    {
      // 2 Which diabetes is this? Every item is a door to Know Your Type (Ch05).
      image: `${IMG}/chapter-journey.png`,
      group: 'firstDays',
      ask: 'team',
      figures: [
        {
          kind: 'doors',
          doors: [
            { glyph: 'book', item: 1, chapter: 'know-your-type' },
            { glyph: 'book', item: 2, chapter: 'know-your-type' },
            { glyph: 'book', item: 3, chapter: 'know-your-type' },
            { glyph: 'book', item: 4, chapter: 'know-your-type' },
            { glyph: 'more', item: 5, chapter: 'know-your-type' },
          ],
        },
      ],
      sources: [
        'dc-type-1',
        'dc-type-2',
        'dc-gestational-diabetes',
        'dc-prediabetes',
        'dc-cpg-ch3-classification-diagnosis',
      ],
    },
    {
      // 3 Your target ranges. The ruler augments; the take-in card restyles the
      // list into a printable "My team's targets" with five blank lines.
      image: `${IMG}/chapter-type2.png`,
      group: 'firstDays',
      ask: 'team',
      figures: [
        {
          kind: 'glucoseRange',
          scale: { min: 2, max: 14 },
          zones: [
            { key: 'low', below: 3.9 },
            { key: 'beforeMeals', from: 4.0, to: 7.0, item: 1 },
            { key: 'afterMeals', from: 5.0, to: 10.0, item: 1 },
            // The guideline's sensor target (CPG Ch9, from the International
            // Consensus Report). DC's patient page says 4.0–10.0: ruling R1.
            { key: 'timeInRange', from: 3.9, to: 10.0, item: 4 },
          ],
          // The steps for a low, not its definition (the zone label defines it).
          lowLink: { chapter: 'staying-safe', card: 2 },
          sources: [
            'dc-checking-blood-sugar',
            'dc-cpg-ch8-targets',
            'dc-cpg-ch9-monitoring-2021',
            'dc-hypoglycemia-adults-sheet-2024',
          ],
        },
        { kind: 'takeIn', fields: 5 },
      ],
      sources: [
        'dc-checking-blood-sugar',
        'dc-cpg-ch8-targets',
        'dc-cpg-ch9-monitoring-2021',
        'dc-cpg-ch36-pregnancy',
        'bt1d-time-in-range',
      ],
    },
    {
      // 4 Food and movement, first steps. No shop strip.
      image: `${IMG}/chapter-everyday.png`,
      group: 'firstDays',
      ask: 'dietitian',
      figures: [
        {
          kind: 'columns',
          columns: [
            [1, 2, 3],
            [4, 5, 6, 7],
          ],
        },
      ],
      sources: [
        'hc-healthy-eating-recommendations',
        'dc-cpg-ch11-nutrition-therapy',
        'dc-exercise-and-activity',
        'dc-cpg-ch10-physical-activity',
      ],
    },
    {
      // 5 Supporting someone newly diagnosed. Item 3 carries "call 911"; the
      // card's emergency detail is Staying Safe's red-flag block (urgentExit).
      image: `${IMG}/care-chat-main.png`,
      group: 'firstDays',
      ask: 'team',
      figures: [{ kind: 'columns', columns: [[1, 2], [3]], neutral: [4, 5] }],
      sources: [
        'dc-cpg-ch14-hypoglycemia-2023',
        'dc-getting-started-with-insulin',
        'bt1d-trialnet',
        'bt1d-mental-health-support',
      ],
    },

    /* ---------- Setting up ---------- */
    {
      // 6 Do I need a meter? The lead says it depends; then meter, then sensor.
      image: `${IMG}/chapter-essentials.png`,
      group: 'settingUp',
      ask: 'educator',
      figures: [{ kind: 'columns', columns: [[2], [3, 4]], lead: [1], neutral: [5] }],
      sources: [
        'dc-cpg-ch9-monitoring-2021',
        'dc-checking-blood-sugar',
        'dc-technology-and-devices',
        'dc-cpg-ch41-t1d-lifespan-2025',
        'on-odb-coverage',
        'dc-comparisons-by-province',
      ],
    },
    {
      // 7 Your medicines and your pharmacist. Questions to take in; no dosing.
      image: `${IMG}/care-chat-desk.png`,
      group: 'settingUp',
      ask: 'pharmacist',
      figures: [{ kind: 'takeIn' }],
      sources: ['dc-stay-safe-sick-days-sheet', 'dc-getting-started-with-insulin'],
    },
    {
      // 8 Starting insulin. "Your prescriber chooses your insulin." Shop strip
      // since 2026-10-06 (B21; F.7): pen needles, sharps and an English-only link to the
      // insulin shelf with the pharmacist notice; injection technique lives in Your Tools.
      image: `${IMG}/chapter-type1.png`,
      group: 'settingUp',
      ask: 'educator',
      figures: [
        {
          kind: 'columns',
          columns: [
            [2, 3],
            [4, 5],
          ],
          lead: [1],
          neutral: [6, 7, 8],
        },
      ],
      sources: ['dc-getting-started-with-insulin'],
    },
    {
      // 9 Sharps from day one. What goes in (and never in the garbage), then
      // where it goes back: HPSA provinces; elsewhere, ask your pharmacy.
      image: `${IMG}/chapter-prediabetes.png`,
      group: 'settingUp',
      ask: 'pharmacist',
      figures: [
        {
          kind: 'containers',
          containers: [
            {
              glyph: 'sharps',
              items: [
                { item: 1, glyph: 'pen' },
                { item: 2, glyph: 'list' },
                { item: 3, glyph: 'home' },
              ],
            },
            {
              glyph: 'pin',
              items: [
                { item: 4, glyph: 'check' },
                { item: 5, glyph: 'service' },
              ],
            },
          ],
        },
      ],
      sources: ['hpsa-returning-medical-sharps', 'dc-getting-started-with-insulin'],
    },
    {
      // 10 Your starter supply list. Generic items by therapy, no products
      // (the plan's supplyList waits on product review; see G.3).
      image: `${IMG}/closing.png`,
      group: 'settingUp',
      ask: 'educator',
      figures: [{ kind: 'columns', columns: [[1], [2, 3], [5, 6]], neutral: [4] }],
      sources: [
        'dc-getting-started-with-insulin',
        'dc-managing-emergency-situations',
        'dc-technology-and-devices',
        'dc-checking-blood-sugar',
      ],
    },
    {
      // 11 Who to ask. Device-maker lines and a peer lane are HELD (section E).
      image: `${IMG}/care-chat-moment.png`,
      group: 'settingUp',
      ask: 'team',
      figures: [
        {
          kind: 'lanes',
          lanes: [
            {
              glyph: 'team',
              item: 1,
              topics: ['plan'],
              href: FIND_A_CDE_HREF,
              hrefLang: 'en',
              linkSources: ['cdecb-find-a-cde'],
            },
            { glyph: 'primaryCare', item: 2, topics: ['plan', 'medicines'] },
            // A pharmacist anywhere, not a Liivv-only lane.
            { glyph: 'service', item: 3, topics: ['medicines'] },
            // Liivv's pharmacist CDE: no card sentence, so its words wait on `laneExtras` on /fr.
            {
              glyph: 'service',
              service: true,
              topics: ['device', 'supplies'],
              href: PHARMACIST_CDE_REQUEST_HREF,
              hrefLang: 'en',
            },
            {
              glyph: 'people',
              item: 4,
              topics: ['feelings'],
              href: BT1D_MENTAL_HEALTH_HREF,
              hrefLang: 'en',
              linkSources: ['bt1d-mental-health-support'],
            },
          ],
          topicKeys: ['plan', 'medicines', 'device', 'supplies', 'feelings'],
        },
      ],
      sources: [
        'cdecb-find-a-cde',
        'dc-stay-safe-sick-days-sheet',
        'dc-getting-started-with-insulin',
        'bt1d-mental-health-support',
      ],
    },
  ],
  /*
   * Band "Your first year": five cards. Ships as the programs band; the
   * checkup-year map (G.2) can take the band slot later, with these cards as
   * its no-JS and /fr fallback.
   */
  programsBandLinks: [
    [{ href: FIND_A_CDE_HREF, hrefLang: 'en', locales: ['en', 'fr'], sources: ['cdecb-find-a-cde'] }],
    [],
    [],
    [],
    [],
  ],
  /* Band card 2 (A1C) names "Your target ranges", which links to card 3. */
  programsBandCards: [null, 3, null, null, null],
  bandSources: [
    'dc-cpg-ch9-monitoring-2021',
    'dc-checking-blood-sugar',
    'dc-cpg-ch30-retinopathy',
    'dc-cpg-ch29-ckd-2025',
    'dc-kidney-disease',
    'dc-cpg-ch32-foot-care',
    'dc-foot-care-sheet-2025',
    'cdecb-find-a-cde',
  ],
  pharmacistImage: `${IMG}/care-chat-main.png`,
  pharmacistHref: PHARMACIST_CDE_REQUEST_HREF,
  resourceLinks: [],
  /* Titles and links as the register has them (sources-meta.ts). */
  citations: [
    {
      label: 'Diabetes Canada — Getting Started with Insulin',
      href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/getting-started-with-insulin',
    },
    {
      label: 'Diabetes Canada — Checking Blood Sugar',
      href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/checking-blood-sugar',
    },
    {
      label: 'Diabetes Canada — Blood Glucose Monitoring in Adults and Children with Diabetes: Update 2021',
      href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-9-2021-update',
    },
    {
      label: 'Health Products Stewardship Association — Returning Medical Sharps',
      href: 'https://healthsteward.ca/consumers/returning-medical-sharps/',
    },
    {
      label: 'Breakthrough T1D — Mental Health Support',
      href: 'https://breakthrought1d.ca/mental-health-support/',
    },
  ],
},
```

Notes on the meta:
- Card 1 is `urgentContent` because its strip is a crisis and emergency line, which is the engine's definition. Ostomy Ch01 card 1 carries the strip without the flag. The crisis kind is never gated or collapsed either way, so the flag only pins the card open (N1). Unlike Staying Safe card 11, which lost its strip in review, this card's subject is mood. The strip's own body (`ui.chapter.crisis.body`) is the self-harm line, and the 9-8-8 page backs it.
- Card 3 pairs an augmenting site figure with the restyling `takeIn`. No Staying Safe card does this. Check in the engine that the ruler renders above the printable card. If it does not, ship `takeIn` alone and put the ruler behind its gate.
- Card 5 has no `urgentContent`. Its "call 911" line sits inside a supporter's how-to, not an emergency list. The chapter's urgent exit already points to the red-flag block. The nurse may prefer to pin it (N10).
- Card 6 uses `ask: 'educator'`, not `pharmacistCde`, because whether to check at all is a plan question. Liivv's CDE lane is on card 11, for supply questions.
- Card 9's items were renumbered (section F): the "never in the garbage" line is now item 3, under "What goes in", because it applies everywhere.
- No `shelf`. The plan names none for Ch01, and Staying Safe has none.

---

## B) EN MESSAGES — `DiabetesCare.chapters.new-to-the-journey`

```json
{
  "title": "New to the Journey",
  "heroBody": "Just been told, or getting set up: calm first steps, the numbers your team will talk about, and who to ask.",
  "focus": "The first days: how you’re feeling, which diabetes this is, your target ranges, first steps with food and movement, and supporting someone. Setting up: meters and sensors, your medicines, starting insulin, sharps, a starter list, and who to ask.",
  "vibe": "Calm and unhurried: a soft place to start.",
  "categoriesIntro": {
    "eyebrow": "First steps",
    "heading": "You don’t have to learn it all at once",
    "body": "This chapter covers the first days after a diagnosis, then getting set up. If you’ve just been told, start at the top. If you already have a plan and supplies, start at Do I need a meter?"
  },
  "startHere": {
    "heading": "Just been told, or setting up?",
    "pivot": "Where you are",
    "segments": {
      "1": {
        "label": "The first days"
      },
      "2": {
        "label": "Setting up"
      }
    }
  },
  "categories": {
    "1": {
      "title": "Just been told",
      "items": {
        "1": "There’s no right way to feel about this news, and no need to take it all in at once",
        "2": "Diabetes Canada says depression is more common in people with diabetes, so looking after your mood is part of looking after your diabetes",
        "3": "Diabetes Canada’s guideline says diabetes teams should ask everyone, from time to time, about diabetes distress and about mood and anxiety. You can bring it up first",
        "4": "Your team will start with what you need to know first. The rest can wait"
      },
      "note": "If it isn’t easing, tell your diabetes team or your doctor. If you’d like to talk to a mental health professional, Breakthrough T1D keeps a Mental Health + Diabetes Directory of registered providers.",
      "figure": {
        "routes": {
          "1": {
            "prompt": "If it isn’t easing, or it’s hard to get through the day",
            "chips": {
              "1": "Tell your diabetes team",
              "2": "Tell your doctor"
            }
          },
          "2": {
            "prompt": "If you’d like to talk to a mental health professional",
            "chips": {
              "1": "Breakthrough T1D directory"
            },
            "detail": "Breakthrough T1D keeps a Mental Health + Diabetes Directory of registered mental health providers."
          }
        }
      }
    },
    "2": {
      "title": "Which diabetes is this?",
      "items": {
        "1": "Type 1: the pancreas doesn’t make insulin. Diabetes Canada says 5 to 10% of people with diabetes have type 1, and it can start in adulthood too",
        "2": "Type 2: the most common type, 90 to 95% of people with diabetes. It may have no symptoms",
        "3": "Gestational diabetes: shows up during pregnancy, in 3 to 20% of pregnancies. It usually goes away after the birth, but it raises the chance of type 2 later, for you and your child",
        "4": "Prediabetes: blood sugar that’s higher than normal, but not yet high enough to be called type 2 diabetes",
        "5": "Less common types: Diabetes Canada’s guideline lists less common forms, such as LADA (which it counts as type 1) and monogenic diabetes, and says some cases are hard to classify. If your type doesn’t seem to fit, ask your team"
      },
      "note": "Know Your Type has a card for each one, including the less common types.",
      "figure": {
        "doors": {
          "1": {
            "label": "Type 1"
          },
          "2": {
            "label": "Type 2"
          },
          "3": {
            "label": "Gestational"
          },
          "4": {
            "label": "Prediabetes"
          },
          "5": {
            "label": "Less common types"
          }
        }
      }
    },
    "3": {
      "title": "Your target ranges",
      "items": {
        "1": "Diabetes Canada’s usual targets are 4.0 to 7.0 mmol/L before meals and 5.0 to 10.0 two hours after eating",
        "2": "If your A1C isn’t at target, your team may set a lower after-meal target. Diabetes Canada gives 5.0 to 8.0",
        "3": "A1C is a blood test that shows your average blood sugar over the past 2 to 3 months. It’s usually done about every 3 months, and Diabetes Canada’s usual target is 7.0% or less",
        "4": "If you use a sensor, Diabetes Canada’s guideline uses international targets: for most adults, more than 70% of the day between 3.9 and 10.0",
        "5": "Your team may set different targets, for example for children, or if you’re pregnant, frail, or often have severe lows"
      },
      "note": "Write your own targets on the card and keep it with your meter. If your team gave you different numbers, use theirs.",
      "figure": {
        "ruler": {
          "heading": "Diabetes Canada’s usual targets, in mmol/L",
          "unit": "mmol/L",
          "zones": {
            "low": "Low: below 3.9",
            "beforeMeals": "Before meals: 4.0 to 7.0",
            "afterMeals": "Two hours after meals: 5.0 to 10.0",
            "timeInRange": "Sensor time in range (guideline): 3.9 to 10.0"
          },
          "lowLink": "What to do about a low: The Rule of 15",
          "teamNote": "Your team may set different numbers, for example for a child. Use theirs."
        },
        "heading": "My team’s targets",
        "fields": {
          "1": "Before meals",
          "2": "Two hours after meals",
          "3": "My A1C target",
          "4": "Time in range, if I use a sensor",
          "5": "My diabetes team’s phone number"
        }
      }
    },
    "4": {
      "title": "Food and movement: first steps",
      "items": {
        "1": "Canada’s food guide suggests plenty of vegetables and fruit, whole grains and protein foods, with plant protein more often",
        "2": "It suggests water as your drink of choice, and limiting highly processed foods",
        "3": "Diabetes Canada’s guideline supports more than one way of eating, including Mediterranean, DASH and vegetarian. A dietitian can help you find what fits",
        "4": "Start slowly, with 5 to 10 minutes of activity a day, and build up",
        "5": "Diabetes Canada suggests working up to 150 minutes a week of moderate to vigorous activity, such as 30 minutes on 5 days",
        "6": "If you haven’t been active for a while, talk to your doctor before you start anything harder than a brisk walk",
        "7": "If you take insulin or other medicines that lower blood sugar, carry fast-acting sugar when you’re active"
      },
      "note": "Carb counting, eating out and more on moving your body are in Every Day Living. If you take insulin, ask your team how to plan around activity.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Food"
          },
          "2": {
            "heading": "Movement"
          }
        }
      }
    },
    "5": {
      "title": "Supporting someone newly diagnosed",
      "items": {
        "1": "Ask what help they’d like. Some people want company at appointments, and some would rather manage on their own",
        "2": "Learn what a low looks like for them, and where they keep fast-acting sugar. The steps are in The Rule of 15, in Staying Safe",
        "3": "If they’re at risk of a severe low, such as people who take insulin, Diabetes Canada’s guideline says the people around them should be taught how to give glucagon, and to call 911. The signs that need emergency care are in Staying Safe",
        "4": "If they have type 1, immediate family aged 2 to 45, and other relatives aged 2 to 20, can ask about free research screening through TrialNet, anywhere in Canada",
        "5": "Your own feelings count too. If you’re caring for a child or teen with type 1, Breakthrough T1D has a Caregiver Guide"
      },
      "note": "More for families and caregivers is in This Might Be You.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Helps early on"
          },
          "2": {
            "heading": "If they’re at risk of a severe low"
          }
        }
      }
    },
    "6": {
      "title": "Do I need a meter?",
      "items": {
        "1": "Whether you check your blood sugar at home, and how often, depends on your type and your treatment. Your team will tell you what you need",
        "2": "If you take insulin more than once a day, Diabetes Canada’s guideline says to check at least 3 times a day",
        "3": "For type 1 on injections or a pump, Diabetes Canada’s guidelines recommend a sensor that reads all the time (a continuous glucose monitor). Ask your team whether that fits you",
        "4": "A sensor can run up to 15 minutes behind your blood sugar, so Diabetes Canada suggests keeping a meter and strips as a backup",
        "5": "Choosing a meter, and the strips and lancets that go with it, is in Your Tools"
      },
      "note": "Some provinces cover strips and sensors, and how much often depends on your treatment. Funding & Coverage has the details for your province.",
      "figure": {
        "columns": {
          "1": {
            "heading": "A meter"
          },
          "2": {
            "heading": "A sensor"
          }
        }
      }
    },
    "7": {
      "title": "Your medicines and your pharmacist",
      "items": {
        "1": "What is each of my medicines for, and when do I take it?",
        "2": "Can any of them cause a low? If so, what should I keep with me?",
        "3": "Do any of them need to be paused on a sick day? Diabetes Canada’s sick-day sheet has a space for your pharmacist to write this down",
        "4": "How do I store each one, and how long does it keep once it’s open?",
        "5": "Which supplies go with my medicines, and are they covered by my plan?"
      },
      "note": "Take this list to your pharmacist or your next appointment, with your medicines or a list of them. Your prescriber chooses your medicines. Your pharmacist helps you use them safely."
    },
    "8": {
      "title": "Starting insulin",
      "items": {
        "1": "Diabetes Canada says everyone with type 1, and many people with type 2, need insulin to stay healthy",
        "2": "There’s no one-size-fits-all plan. Your team works out with you how many injections, when, how much, and whether a pump suits you",
        "3": "Insulin can be taken with a pen, a syringe or a pump. Pens come with an instruction book, so read it to learn how yours works",
        "4": "Change where you inject each time. Diabetes Canada says this helps prevent fatty lumps that can make insulin work poorly",
        "5": "Use a new pen tip or needle every time, then put it in a sharps container",
        "6": "Insulin raises your risk of a low. Diabetes Canada says to always have fast-acting sugar with you, at home and when you go out. The steps are in The Rule of 15, in Staying Safe",
        "7": "Storage is different for each insulin. Follow the leaflet that came with yours, or ask your pharmacist",
        "8": "Diabetes Canada says to throw out insulin that has been frozen, has been in temperatures over 30°C, or has expired"
      },
      "note": "Your prescriber chooses your insulin, and fine-tuning your routine takes time. A step-by-step injection guide is in Your Tools.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Planned with your team"
          },
          "2": {
            "heading": "Each time you inject"
          }
        }
      }
    },
    "9": {
      "title": "Sharps from day one",
      "items": {
        "1": "Used lancets, pen tips and needles go in a sharps container. Diabetes Canada says pen tips and needles are for one use only",
        "2": "Sharps include lancets, pen needles, sensor applicators that have a needle, infusion sets and syringes",
        "3": "Never put used sharps in the garbage or recycling, says the Health Products Stewardship Association",
        "4": "In Manitoba, Ontario, Quebec, New Brunswick and Prince Edward Island, participating pharmacies give out free sharps containers and take them back",
        "5": "Elsewhere in Canada, ask your pharmacy. Diabetes Canada says many pharmacies supply containers and swap a full one for a new one"
      },
      "note": "Ask your pharmacy where to return a full container near you.",
      "figure": {
        "containers": {
          "1": {
            "label": "What goes in"
          },
          "2": {
            "label": "Where it goes back"
          }
        }
      }
    },
    "10": {
      "title": "Your starter supply list",
      "items": {
        "1": "If you check with a meter: the meter, its strips and lancets, and a sharps container",
        "2": "If you take insulin: a new pen tip or needle for each injection, and a sharps container",
        "3": "If you take insulin: fast-acting sugar with you, at home and when you go out",
        "4": "A card in your wallet that says you have diabetes, or medical ID such as a bracelet or necklace",
        "5": "If you use a sensor: a meter and strips as a backup",
        "6": "If you use a pump: backup insulin pens or syringes, extra pump supplies, ketone strips or a blood ketone meter, and a written copy of your pump settings"
      },
      "note": "Your team’s list comes first. Ask them whether you need ketone strips or glucagon.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Checking with a meter"
          },
          "2": {
            "heading": "Taking insulin"
          },
          "3": {
            "heading": "A sensor or a pump"
          }
        }
      }
    },
    "11": {
      "title": "Who to ask",
      "items": {
        "1": "Your diabetes educator: your plan, your readings and everyday questions. Many are Certified Diabetes Educators (CDE®), licensed health professionals certified in diabetes education",
        "2": "Your doctor: your diagnosis, your prescriptions and your checkups",
        "3": "A pharmacist: what each medicine is for, how to store it, and your sick-day medicine plan",
        "4": "How you’re feeling: your team, or a registered mental health provider from Breakthrough T1D’s Mental Health + Diabetes Directory"
      },
      "note": "Not sure where to start? Start with your diabetes educator. Some educators in the CDE directory see people without a referral.",
      "figure": {
        "legend": "What’s your question about?",
        "topics": {
          "1": {
            "label": "My plan or my readings"
          },
          "2": {
            "label": "My medicines"
          },
          "3": {
            "label": "A pump or sensor"
          },
          "4": {
            "label": "Supplies"
          },
          "5": {
            "label": "How I’m feeling"
          }
        },
        "fits": "Fits what you ticked",
        "statusFitsOne": "{count} place fits what you ticked. Everyone stays listed.",
        "statusFitsMany": "{count} places fit what you ticked. Everyone stays listed.",
        "statusNone": "Nothing ticked. Everyone stays listed.",
        "lanes": {
          "1": {
            "label": "Your diabetes educator",
            "linkLabel": "Find a CDE (lists only educators who chose to be listed; opens their site)"
          },
          "2": {
            "label": "Your doctor"
          },
          "3": {
            "label": "A pharmacist"
          },
          "4": {
            "label": "Liivv pharmacist CDE",
            "scope": "A Liivv service · all of Canada · Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays",
            "body": "Questions about pump, sensor and other diabetes supplies.",
            "linkLabel": "Request a call (sign-in needed)"
          },
          "5": {
            "label": "Someone to talk to",
            "linkLabel": "Breakthrough T1D mental health support (opens their site)"
          }
        }
      }
    }
  },
  "programsBand": {
    "heading": "Your first year",
    "cards": {
      "1": {
        "heading": "Learning the basics",
        "body": "The first months are for learning, at your own pace. Your diabetes educator can go over your plan, your readings and your questions. With gestational diabetes or prediabetes, your checkups are different, so ask your team which of these apply.",
        "links": {
          "1": {
            "label": "Find a CDE — Canadian Diabetes Educator Certification Board"
          }
        }
      },
      "2": {
        "heading": "About every 3 months: A1C",
        "body": "Diabetes Canada’s guideline suggests an A1C test about every 3 months. For adults whose numbers have been steady at target, your team may space it out. Your usual target is in Your target ranges."
      },
      "3": {
        "heading": "Eyes",
        "body": "With type 2, Diabetes Canada’s guideline says to have an eye exam at diagnosis. With type 1, for people 15 and over, yearly eye exams start 5 years after diagnosis. Children have their own schedule. Your team tells you when yours is due."
      },
      "4": {
        "heading": "Kidneys",
        "body": "Diabetes Canada’s guideline says two tests, called ACR and eGFR, check your kidneys at least once a year. With type 2 they start at diagnosis. With type 1 they usually start 5 years after diagnosis. Children have their own schedule, so ask your team."
      },
      "5": {
        "heading": "Feet",
        "body": "Diabetes Canada suggests washing, drying and checking your feet every day, with a mirror if you need one. At least once a year, your team checks your bare feet, including feeling and blood flow."
      }
    }
  },
  "pharmacist": {
    "eyebrow": "Anywhere in Canada",
    "heading": "Questions about your first supplies",
    "body": "Liivv’s pharmacist CDEs answer pump, sensor and supply questions for all of Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays, and pass you to the right Liivv pharmacy when needed. Your plan and your medicines still belong with your diabetes team.",
    "cta": "Request a call"
  },
  "closing": {
    "heading": "One step, then the next",
    "body": "New to the Journey is permission to learn slowly: a few numbers, a few supplies, and people to ask."
  },
  "governance": {
    "disclaimer": "This is general information, not medical advice, and it is not a substitute for care from your diabetes team, doctor or pharmacist. Your type, your targets and your medicines depend on you. Your team sets them."
  },
  "urgentExit": {
    "lead": "Signs that need emergency care, for a low or a high, are in",
    "link": "Chapter 02 — Staying Safe"
  }
}
```

Also outside the chapter key, in `DiabetesCare.ui.chapter.groups`:

```json
"firstDays": "The first days",
"settingUp": "Setting up"
```

The crisis strip's words are the site-wide `ui.chapter.crisis` ("…call or text 9-8-8, Canada’s Suicide Crisis Helpline, any time." and "Emergency: call {number}"). They are unchanged.

---

## C) CLAIMS TABLE (after source check)

Key paths are relative to `DiabetesCare.chapters.new-to-the-journey`. The Fact column holds the wording the source check read on the page (verify file, section A). Status codes:
- **C**: on the page as worded.
- **C\***: more conservative than the source, recorded as a ruling.

No row is V any more: all four pre-publish checks were resolved.

| Key | Sentence (short) | SourceId | Fact on the source page | Status |
|---|---|---|---|---|
| 1.items.2 | Depression more common with diabetes | dc-taking-care-of-mental-health | "Depression is more common compared to the general population"; mental health "just as important" | C |
| 1.items.3 | Teams should ask everyone, from time to time, about distress, mood and anxiety | dc-cpg-ch18-mental-health-2023 | Screen everyone "at appropriate intervals for the presence of diabetes distress, as well as symptoms of common psychiatric disorders" ("especially mood and anxiety disorders") | C |
| 1.note s2; 1.figure.routes.2; 11.items.4 | Breakthrough keeps a Mental Health + Diabetes Directory of registered providers | bt1d-mental-health-support | Information "about registered mental health providers" for people "living with or affected by diabetes" | C |
| 1 crisis strip (`ui.chapter.crisis`) | Call or text 9-8-8, any time; emergency: call 911 | 988-suicide-crisis-helpline | "24/7/365", "Call 9-8-8 / Text 9-8-8"; "If your safety is at risk, call 9-1-1 right away" | C |
| 2.items.1 | T1: pancreas doesn’t make insulin; 5 to 10%; can start in adulthood | dc-type-1 | "Does not produce any insulin"; "Five to 10 percent" (also "Roughly 10 per cent"); "can also develop in adulthood" | C |
| 2.items.2 | T2: 90 to 95%; may have no symptoms | dc-type-2 | "90-95% of diabetes cases in Canada"; "some may have no symptoms at all" | C |
| 2.items.3 | GDM: 3 to 20%; usually goes after birth; raises later type 2 risk for parent and child | dc-gestational-diabetes | "Between three to 20% of pregnant women…"; "after giving birth, the diabetes usually goes away"; "you may both have a higher risk… later in life such as type 2 diabetes" | C |
| 2.items.4 | Prediabetes: higher than normal, not yet high enough to be called type 2 | dc-prediabetes; dc-cpg-ch3-classification-diagnosis | "blood sugar levels are higher than normal, but are not yet high enough to be diagnosed as type 2 diabetes" | C |
| 2.items.5 | Guideline lists LADA (counted as type 1) and monogenic diabetes; some cases hard to classify | dc-cpg-ch3-classification-diagnosis | LADA listed under type 1; the chapter's term is "monogenic diabetes"; "Some cases are difficult to classify" | C |
| 3.items.1 | 4.0–7.0 before; 5.0–10.0 two hours after | dc-checking-blood-sugar; dc-cpg-ch8-targets | Both give these numbers; Ch8 ties them to "an A1C ≤7.0%" | C |
| 3.items.2 | If A1C isn’t at target, team may set a lower after-meal target; DC gives 5.0–8.0 | dc-checking-blood-sugar; dc-cpg-ch8-targets | "(5.0 to 8.0 mmol/L if A1C targets not met)"; Ch8: "may be considered, but must be balanced against the risk of hypoglycemia" | C\* (N13) |
| 3.items.3 | A1C shows the average over 2 to 3 months; about every 3 months; target 7.0% or less | dc-checking-blood-sugar; dc-cpg-ch9-monitoring-2021; dc-cpg-ch8-targets | "A1C is a measure of your average blood sugar control for the last 2-3 months"; Ch9 "approximately every 3 months"; "≤7.0%" | C |
| 3.items.4 | Sensor: guideline uses international targets; most adults >70% in 3.9–10.0 | dc-cpg-ch9-monitoring-2021 (bt1d-time-in-range second) | Ch9 Table 2: TIR ">70%", 3.9–10.0, "recommended targets from the International Consensus Report for most individuals with type 1 or type 2 diabetes (excluding pregnancy, children/adolescents, and older/high-risk groups)" | C (R1, N5) |
| 3.items.5 | Different targets for children, pregnancy, frailty, frequent severe lows | dc-cpg-ch8-targets; dc-cpg-ch36-pregnancy; dc-cpg-ch9-monitoring-2021; dc-checking-blood-sugar; bt1d-time-in-range | Ch8 7.1–8.5% (recurrent severe lows, frail elderly); Ch36 pregnancy targets; Ch9 sensor targets exclude children; DC page names children | C |
| 3.figure.ruler.zones.low | Low: below 3.9 | dc-hypoglycemia-adults-sheet-2024 | "Blood sugar below 3.9 is considered low" | C (R1) |
| 3.figure.ruler.zones.timeInRange | Sensor time in range (guideline): 3.9 to 10.0 | dc-cpg-ch9-monitoring-2021 | As 3.items.4; DC's patient page says 4.0–10.0 | C (R1) |
| 4.items.1–2 | Vegetables, fruit, whole grains, protein (plant more often); water; limit highly processed | hc-healthy-eating-recommendations | Each phrase as quoted | C |
| 4.items.3 | Mediterranean, DASH, vegetarian supported | dc-cpg-ch11-nutrition-therapy | Mediterranean, vegan or vegetarian, DASH (and Nordic) | C |
| 4.items.4 | Start with 5–10 min a day, build up | dc-exercise-and-activity | "Start slowly, with 5 to 10 minutes per day, gradually building up to your goal" | C |
| 4.items.5 | 150 min a week moderate to vigorous, e.g. 30 min × 5 days | dc-exercise-and-activity; dc-cpg-ch10-physical-activity | "at least 150 minutes of moderate- to vigorous intensity aerobic exercise each week, (e.g. 30 minutes, 5 days a week)" | C |
| 4.items.6 | Inactive for a while → doctor before anything harder than a brisk walk | dc-exercise-and-activity | Page wording | C |
| 4.items.7 | On insulin or other lowering medicines → carry fast sugar when active | dc-exercise-and-activity | "especially if you are taking insulin or other medications that lower your blood sugar"; "Carry fast-acting carbohydrate…" | C |
| 5.items.3 | At risk of severe low → people around them taught glucagon, and to call 911 | dc-cpg-ch14-hypoglycemia-2023 | "support persons should be taught how to administer SC/IM or IN glucagon"; "should be prescribed glucagon" for those "at high risk… such as those treated with insulin"; support persons "should call for emergency services" | C (N10) |
| 5.items.4 | TrialNet free research screening: immediate family 2–45, other relatives 2–20, anywhere in Canada | bt1d-trialnet | "(parents, siblings, children)… age 2 – 45"; "age 2 – 20"; "available anywhere in Canada at zero cost" | C (N4) |
| 5.items.5 | Caregiver Guide for carers of a child or teen with type 1 | bt1d-mental-health-support | "for parents and caregivers of children and adolescents living with T1D" | C |
| 6.items.1 | Checking depends on type and treatment | dc-cpg-ch9-monitoring-2021; dc-checking-blood-sugar | "How often you check… depends on your treatment plan"; Ch9 frequencies differ by treatment | C |
| 6.items.2 | Insulin more than once a day → check at least 3 times a day | dc-cpg-ch9-monitoring-2021 | "at least 3 times per day" | C |
| 6.items.3 | T1 on injections or pump → guidelines recommend CGM | dc-cpg-ch9-monitoring-2021; dc-cpg-ch41-t1d-lifespan-2025 | Ch9 "rtCGM should be used" (basal-bolus or CSII, "willing and able"); Ch41 "CGM is recommended for people using insulin injections or pumps" | C (N6) |
| 6.items.4 | Sensor up to 15 min behind; meter and strips as backup | dc-technology-and-devices | "slower to show actual blood sugar levels by up to 15 minutes"; keep "a blood glucose monitor and testing strips… as a backup" | C |
| 6.note s1 | Some provinces cover strips and sensors; amount depends on treatment | on-odb-coverage; dc-comparisons-by-province | ODB: "a maximum number of diabetic testing strips based on your current treatment method"; DC comparisons of "glucose monitoring devices" and strips | C |
| 7.items.3 s2 | Sick-day sheet has a space for the pharmacist | dc-stay-safe-sick-days-sheet | "Ask your pharmacist to tell you: The medications I need to TEMPORARILY STOP are:…" | C |
| 7.items.4 (question) | Storage differs by product | dc-getting-started-with-insulin | "Insulin storage is different for each product" | C |
| 8.items.1 | Everyone with T1 and many with T2 need insulin | dc-getting-started-with-insulin | Verbatim | C |
| 8.items.2 | No one-size plan; team decides number, timing, amount, pump | dc-getting-started-with-insulin | Verbatim in substance | C |
| 8.items.3 | Pen, syringe or pump; pens come with an instruction book | dc-getting-started-with-insulin | "Pens come with an instruction book. Please review it…" | C |
| 8.items.4 | Rotate each time; helps prevent fatty lumps | dc-getting-started-with-insulin | Verbatim | C |
| 8.items.5 | New tip or needle every time; into sharps container | dc-getting-started-with-insulin | "should only be used once before safely adding to a sharps container" | C |
| 8.items.6 | Insulin raises low risk; always have fast sugar, home and out | dc-getting-started-with-insulin | Verbatim ("always" is the source’s) | C |
| 8.items.7 | Storage differs; follow your leaflet, or ask your pharmacist | dc-getting-started-with-insulin | "Look at product information or contact your healthcare provider" | C (R5) |
| 8.items.8 | Throw out insulin that was frozen, over 30°C, or expired | dc-getting-started-with-insulin | "Throw out insulin that has been frozen, exposed to temperatures greater than 30ºC, or expired" | C |
| 8.note s1 | Fine-tuning takes time | dc-getting-started-with-insulin | Verbatim | C |
| 9.items.1 | Lancets, tips, needles in a sharps container; single use | dc-getting-started-with-insulin | "Pen tips and lancets should be disposed of in a sharps container"; "only be used once" | C |
| 9.items.2 | Lancets, pen needles, sensor applicators with a needle, infusion sets, syringes | hpsa-returning-medical-sharps | "Continuous Glucose Monitors (CGM) applicators with needles", infusion sets, lancets, needles, pen tips, syringes | C |
| 9.items.3 | Never put used sharps in the garbage or recycling | hpsa-returning-medical-sharps | "Never place used medical sharps in the garbage or recycling." ("never" is the source’s; unqualified) | C |
| 9.items.4 | MB, ON, QC, NB, PEI: participating pharmacies give free containers and take them back | hpsa-returning-medical-sharps | The five provinces; "Free medical sharps containers are available at participating HPSA collection locations"; "return it free of charge" | C |
| 9.items.5 | Elsewhere ask your pharmacy; many supply and swap containers | dc-getting-started-with-insulin | Verbatim in substance | C |
| 10.items.1 | Meter, strips, lancets, sharps container | dc-checking-blood-sugar; dc-managing-emergency-situations | Lancet and strip described; kit lists "Blood sugar (glucose) meter", "Lancets and lancing device", "sharps container" | C |
| 10.items.2–3 | Tip or needle each injection; fast sugar at home and out | dc-getting-started-with-insulin | As 8.items.5–6 | C |
| 10.items.4 | Wallet card, or medical ID bracelet or necklace | dc-getting-started-with-insulin | "card in your wallet or purse… bracelets and necklaces" (brand left out) | C |
| 10.items.5 | Sensor → meter and strips as backup | dc-technology-and-devices; dc-managing-emergency-situations | As 6.items.4; "have a back-up glucometer and blood sugar testing supplies" | C |
| 10.items.6 | Pump → backup pens or syringes, extra pump supplies, ketone strips or a blood ketone meter, written settings | dc-technology-and-devices; dc-managing-emergency-situations | "Rapid-acting insulin pens or syringes; Long-acting insulin (if needed); Extra pump supplies…; Ketone testing strips for urine or a ketone blood monitor"; "Your basal rates, insulin-to-carbohydrate ratio, insulin sensitivity factor…" | C |
| 11.items.1 | Diabetes educator; many are CDE®, licensed professionals certified in diabetes education | cdecb-find-a-cde | Credential "is only valid… when the candidate has a full and valid licence to practice as a regulated health care professional" | C |
| 11.items.3 | Pharmacist: sick-day medicine plan | dc-stay-safe-sick-days-sheet | "Ask your pharmacist to tell you…" | C |
| 11.note s2; 11.figure.lanes.1.linkLabel | Directory lists only those who opted in; some see people without referral | cdecb-find-a-cde | "CDE®s appearing on this page have opted to participate"; "They may be available for appointments without referral" | C |
| 11.figure.lanes.4; pharmacist.* | Liivv CDE: all of Canada, hours, passes to the right Liivv pharmacy | — (owner, 2026-10-05) | Not clinical; owner-supplied (plan: CDEs answer for all of Canada and transfer to provincial pharmacies; Quebec and territories fall back to Ontario) | n/a |
| programsBand.cards.2 | A1C about every 3 months; adults steady at target may space it out | dc-cpg-ch9-monitoring-2021 | "approximately every 3 months"; "Testing at least every 6 months should be performed in adults during periods of treatment and healthy behaviour stability when glycemic targets have been consistently achieved" | C |
| programsBand.cards.3 | T2 eye exam at diagnosis; T1 15+ yearly from 5 years; children own schedule | dc-cpg-ch30-retinopathy | "Type 1 diabetes: 5 years after diagnosis in all individuals ≥15 years", "rescreen annually", "Type 2… at diagnosis"; under 15 follow the paediatric chapter | C (N2) |
| programsBand.cards.4 | ACR and eGFR at least yearly; T2 at diagnosis; T1 usually from 5 years; children own schedule | dc-cpg-ch29-ckd-2025; dc-kidney-disease | "at least annually"; type 1 "5 years after onset or, if onset is at an earlier age, screening should start after puberty"; DC page "screened regularly" | C |
| programsBand.cards.5 | Daily wash, dry, check with mirror; yearly bare-foot check incl. feeling and blood flow | dc-foot-care-sheet-2025; dc-cpg-ch32-foot-care | "WASH… DRY… ASSESS… LOOK in a hand mirror"; "at least once a year or more often if you've been told you are high risk", "nerve damage and poor blood flow"; Ch32 "at least annually" | C |
| programsBand.cards.1.links.1 | Find a CDE | cdecb-find-a-cde | The search loads at https://systems.cdecb.ca/findCDE | C |

These sentences make no factual claim, so they need no source: framing, "ask your team" and navigation. categoriesIntro.*, startHere.*, 1.items.1, 1.items.4, 1.note s1, 2.note, 3.note, 3.figure.ruler.teamNote, 4.note, 5.items.1, 5.items.2, 5.items.3 s2, 5.note, 6.items.5, 7.items.1–2, 7.items.5, 7.note, 8.note s2–3, 9.note, 10.note, 11.items.2, 11.note s1, programsBand.cards.1 body, closing, governance, urgentExit, and the figure labels.

---

## D) OPEN RULINGS (clinical defaults used, pending the nurse)

Carried from Staying Safe (same defaults, so the two chapters agree):

| # | Default used | Where in this chapter | Alternative |
|---|---|---|---|
| R1 · **ruled 2026-10-06 ([C1](clinical-rulings-2026-10-06.md#c1))** | **Low = below 3.9 mmol/L.** **Widened by the source check:** the sensor time-in-range floor is also 3.9 (CPG Ch9 / International Consensus), but DC’s own patient page (Checking Blood Sugar) gives "4.0-10.0 mmol/L for 70% or more of the day". The ruler labels the bar "(guideline)". | 3.figure.ruler.zones.low, .timeInRange; 3.items.4 | Below 4.0 (Drive Safe card, Diabetes@School, Breakthrough), and/or time in range 4.0–10.0 from DC’s patient page. One ruling should set the ruler, Staying Safe card 1 and this card together. |
| R2 · **ruled 2026-10-06 ([C13](clinical-rulings-2026-10-06.md#c13))** | **½ cup juice.** Not repeated here; cards 5 and 8 and the ruler link to The Rule of 15. | — | ⅔ cup. |
| R3 · **ruled 2026-10-06 ([C4](clinical-rulings-2026-10-06.md#c4))** | **Ketone ladder written for type 1.** Not shown here. Card 10 lists "ketone strips or a blood ketone meter" for pump users (DC Technology & Devices), and its note tells everyone else to ask whether they need ketone strips. | 10.items.6, 10.note | — |
| R5 · **ruled 2026-10-06 ([C15](clinical-rulings-2026-10-06.md#c15))** | **In-use insulin: "follow your leaflet"**, now "or ask your pharmacist". The new 8.items.8 (throw out if frozen, over 30°C or expired) carries no in-use duration. | 8.items.7–8, 7.items.4 | 30 days (DC) or 28 days (Diabète Québec). |
| R9 · **ruled 2026-10-06 ([C14](clinical-rulings-2026-10-06.md#c14))** | **FIT treated as industry-run.** No FIT line is used. These stay in Your Tools: 4 mm needles, site checks, "never draw U-200/U-300 into a syringe", and DC’s "6 mm at 90°" line. | 8 | Release the FIT lines in Ch03 with the embecta disclosure. |
| R10 · **ruled 2026-10-06 ([C16](clinical-rulings-2026-10-06.md#c16))** | **No alcohol limits stated.** Alcohol is not in this chapter. | — | Decide in Ch04. |

New for this chapter:

| # | Default used | Where | Alternative |
|---|---|---|---|
| N1 · **ruled 2026-10-06 ([C25](clinical-rulings-2026-10-06.md#c25))** | **Crisis strip on card 1, now with 9-8-8 and 9-1-1** (source check, Safety 1). The card is `urgentContent` (pinned open). Staying Safe removed its strip because its copy had no self-harm line. Here the card is about feelings, and the strip’s own body is the self-harm line. | 1 | Ostomy behaviour (strip without `urgentContent`), or no strip and the routes only. |
| N2 · **ruled 2026-10-06 ([C24](clinical-rulings-2026-10-06.md#c24))** | **Eye exams follow CPG Ch30**: type 2 at diagnosis; type 1 from 5 years after diagnosis, age 15 and over; "Children have their own schedule" added. The Canadian Ophthalmological Society page says "at least once a year". | programsBand.cards.3 | Add "Some eye specialists suggest once a year: ask yours". |
| N3 | **Resolved by the source check.** A1C "about every 3 months", plus "for adults whose numbers have been steady at target, your team may space it out" (Ch9 "at least every 6 months… in adults"). The band does not print the 6-month figure. | programsBand.cards.2 | Print "at least every 6 months" as well. |
| N4 · **ruled 2026-10-06 ([C30](clinical-rulings-2026-10-06.md#c30))** | **TrialNet screening for relatives in Ch01 card 5**, worded "free research screening". It answers a common family question in week one, but Ch05 (Know Your Type) may own screening. | 5.items.4 | Move it to Ch05 and leave a pointer. |
| N5 · **ruled 2026-10-06 ([C40](clinical-rulings-2026-10-06.md#c40))** | **Time in range "more than 70%" (CPG Ch9).** It is now worded "Diabetes Canada’s guideline uses international targets: for most adults…". It is not labelled "International guidance", because a Canadian guideline adopts it. Breakthrough says "at least 70%". | 3.items.4, ruler | "At least 70%"; or add the "International guidance" label to card 3. |
| N6 · **ruled 2026-10-06 ([C20](clinical-rulings-2026-10-06.md#c20))** | **Card 6 item 3 states the guideline’s CGM recommendation for type 1** on injections or a pump, with "ask your team whether that fits you". It names a device type, not a drug or a brand, and makes no individual recommendation. | 6.items.3 | Say only "Ask your team whether a sensor fits you." |
| N7 · **ruled 2026-10-06 ([C31](clinical-rulings-2026-10-06.md#c31))** | **Exercise starting advice** (5–10 minutes a day, doctor first if inactive) shown to every type, from the DC patient page. Insulin adjustments around exercise are not given (clinician-level only). | 4.items.4–7 | — |
| N8 | **Resolved by the source check.** Type 1 is now "5 to 10%" (on the DC page), so 5–10% and 90–95% no longer sum past 100%. | 2.items.1–2 | "About 10%" (also on the page). |
| N9 | **Resolved by the source check.** The prediabetes definition now follows DC’s wording ("higher than normal, but not yet high enough to be… type 2 diabetes"). | 2.items.4 | Add DC’s "Not everyone with prediabetes will develop type 2 diabetes, but many people will." |
| N10 · **ruled 2026-10-06 ([C25](clinical-rulings-2026-10-06.md#c25))** | **Card 5 item 3: glucagon for support persons, now with "and to call 911"** (Ch14’s same recommendation; Safety 2) and a pointer to Staying Safe’s emergency signs. The card is not pinned open. | 5.items.3 | "Ask their team whether the people around them should learn to give glucagon"; or pin card 5 (`urgentContent`). |
| N11 · **ruled 2026-10-06 ([C33](clinical-rulings-2026-10-06.md#c33))** | **Ask roles**: card 4 `dietitian`; cards 6, 8 and 10 `educator`; cards 7 and 9 `pharmacist`. No card uses `pharmacistCde` as its chip. Liivv’s CDE is a lane on card 11 and the pharmacist panel. | meta | Use `pharmacistCde` on card 10. |
| N12 | **Card 2 doors open the matching Know Your Type cards.** Default now in use (2026-10-05): Ch05 is served, so the `knowYourTypeRoute` hold is lifted. Type 1 → card 1, type 2 → card 2, gestational → card 4, prediabetes → card 3, less common types → card 6. | 2.figure | Point the doors at the four existing path pages (`type-1`, `type-2`, `gestational`, `prediabetes`) instead, with the "less common types" door going to Know Your Type card 6. |
| N13 · **ruled 2026-10-06 ([C19](clinical-rulings-2026-10-06.md#c19))** | **NEW. 5.0–8.0 after meals kept, framed as the team’s decision** (Scope 1): "your team may set a lower after-meal target. Diabetes Canada gives 5.0 to 8.0." Ch8 says it "must be balanced against the risk of hypoglycemia". | 3.items.2 | Drop the item from Ch01. |
| N14 · **ruled 2026-10-06 ([C31](clinical-rulings-2026-10-06.md#c31))** | **NEW. The ruler’s low band links to The Rule of 15 (Staying Safe card 2)**, labelled "What to do about a low", rather than to card 1 (Safety 3). The band’s own label already defines low. | 3.figure.ruler.lowLink | Link card 1, labelled "What counts as low: Know your low". |

**Pre-publish checks.** The draft listed four factual checks. All four were resolved by the source check:
- the pump backup line;
- the prediabetes wording;
- Ch9’s "at least every 6 months";
- "150 minutes" in the page text.

What remains is non-clinical:
1. **Owner:** confirm the pharmacist CDE hours, the Canada-wide scope, and "pass you to the right Liivv pharmacy". There are no Liivv pharmacies in Quebec or the territories, so they fall back to Ontario. Also add the "Pump or CGM question (pharmacist CDE)" reason to `/account/virtual-care/appointment`.
2. **Register:** apply the `sources-review.ts` note updates in A.1.
3. **Navigation:** the urgentExit text "Chapter 02 — Staying Safe" matches the meta (`num: '02'`), but the older `chapters-data.ts` still numbers New to the Journey "03" and Every Day Living "02". Check the shipped chapter nav once this chapter moves onto the engine.
4. **Engine:** check that the card 1 strip renders both numbers, with 9-1-1 worded through `ui.chapter.crisis.emergency`, and that the card 3 ruler renders above the take-in card.

---

## E) HELD (with reasons)

Wording proposed here goes in `held-messages.ts` only if it is released. None of it is in section B.

**Released by the source check (now in the copy):** what A1C measures, "over the past 2 to 3 months" (dc-checking-blood-sugar), in 3.items.3. The draft’s "about 3 months" was replaced with the page’s "2 to 3 months".

| Topic | Card | Why held | Proposed wording if sourced | Likely source to check |
|---|---|---|---|---|
| **Device maker 24/7 support lane** | 11 | Manufacturer pages only (policy 4). Staying Safe holds the same lane. | "Your pump or sensor maker: device faults, any time" | A neutral Canadian source naming maker support |
| **Peer support lane** (Breakthrough T1D, Diabetes Canada) | 11 | No verified Canada-wide peer finder in the register. `site.ts` leaves the help band’s peer card out for the same reason. | "Someone who lives with diabetes: a local or online peer group" | Breakthrough T1D peer pages; DC Connect community (neither registered) |
| **Breakthrough Caregiver Guide contents** | 5 | Only the guide’s existence and audience are confirmed (children and teens with T1D) | Specific caregiver tips from the guide | The guide itself |
| **Breakthrough "Newly diagnosed" hub, Bag of Hope** | 1, 5 | The survey marks it "Partial": the link was seen but the content was not opened. Not in the register. | "Breakthrough T1D has newly diagnosed guides for children, teens and adults" | breakthrought1d.ca/newly-diagnosed/ |
| **DC Type 1 Adult Toolkit and How 2 Type 1 videos** | 2, 8 | Known only as links on dc-type-1; not opened | Shelf links | Each resource |
| **Diabetes education programs: "many are free", run by hospitals and community health centres** | 11, band 1 | Existing site copy (`ui.help`) but no registered source | "Many hospitals and community health centres run diabetes education programs, and many are free" | Provincial program pages; DC |
| **Signs of a low** | 5 | Held in Staying Safe (not in the verified claims) | "Signs of a low can include feeling shaky, sweaty, hungry or confused" | DC 02/24 sheet; das-low-blood-sugar |
| **Sharps outside HPSA provinces** (municipal or provincial rules in BC, AB, SK, NS, NL and the territories) | 9 | Survey: UNVERIFIED. Card 9 says "ask your pharmacy" (DC). | Province-specific return routes | Provincial or municipal pages |
| **Injection technique** (needle length, angle, skin lift, site checks, U-200/U-300, pen tips off between injections) | 8 | Belongs to Ch03 Your Tools; the FIT lines are industry-run (R9) | — | Ch03 (DC’s "Do not leave pen tips on the end of the pen" is sourced and can go there) |
| **Kids Help Phone / other crisis lines** | 1 | Not checked (survey; 988 locator) | Add to the crisis strip | Each line’s own page |
| **Pharmacist CDE phone number** | 11, pharmacist panel | Not confirmed by the owner. The plan’s 2024 pharmacy list gives a Markham number. It is not printed here until the owner confirms it is Liivv’s own line and not a Diabetes Express number (source check, Scope 4). | "Call a pharmacist CDE: [number]" | Owner |
| ~~**Insulin shop strip with the pharmacist-review notice** (plan card 8)~~ | 8 | Released 2026-10-06 (B21, B3): a link to the insulin shelf with `ui.commerce.pharmacistNotice` and `quebecInsulin`, English pages only (F.7) | — | — |
| **`supplyList` with products** (plan card 10) | 10 | Card 10 has a shop strip by therapy (F.7); a ticking supply list with products per line is a new module, not built | — | Owner |

No card is fully HELD. Card 11 ships with five lanes, and two more lanes are held (maker lines, peer support).

---

## F) CHANGE LOG (what the source check changed)

| # | Key | Verify finding | Change made |
|---|---|---|---|
| 1 | meta card 1 `crisis` | Safety 1: the strip had only 9-8-8. The 9-8-8 page itself says "If your safety is at risk, call 9-1-1 right away". | Added `{ tel: '911', kind: 'emergency' }` (worded by `ui.chapter.crisis.emergency`). N1 updated. |
| 2 | 1.items.3 | Partly: Ch18 says distress plus "mood and anxiety", "at appropriate intervals"; it does not single out depression | "…should ask everyone, from time to time, about diabetes distress and about mood and anxiety. You can bring it up first". |
| 3 | 1.note s2; 1.figure.routes.2.prompt/.detail | Partly: the directory lists "registered mental health providers"; it does not say they know diabetes | Prompt "If you’d like to talk to a mental health professional"; detail and note "…Directory of registered (mental health) providers". |
| 4 | 11.items.4 | Same as #3 | "…or a registered mental health provider from Breakthrough T1D’s Mental Health + Diabetes Directory". |
| 5 | 2.items.1 | Partly: the page gives both "roughly 10" and "five to 10" percent; 10% + 90–95% exceeds 100% | "Diabetes Canada says 5 to 10%…". N8 resolved. sources-review note added (A.1). |
| 6 | 2.items.3 | Confirmed; optional "for you and your baby" | Added "for you and your child" (page: "you may both have a higher risk"). |
| 7 | 2.items.4 | Confirmed (V resolved); match DC’s wording | "…higher than normal, but not yet high enough to be called type 2 diabetes". N9 resolved. |
| 8 | 2.items.5 | Partly: "MODY" appears only in a reference title; the chapter says "monogenic diabetes" and counts LADA as type 1 | "…lists less common forms, such as LADA (which it counts as type 1) and monogenic diabetes…". |
| 9 | 3.items.2 | Scope 1: nearest thing to titration | "If your A1C isn’t at target, your team may set a lower after-meal target. Diabetes Canada gives 5.0 to 8.0". New N13. |
| 10 | 3.items.3 | Section E release: A1C definition sourced (DC Checking Blood Sugar, "2-3 months") | Added "shows your average blood sugar over the past 2 to 3 months"; kept "about every 3 months" and "7.0% or less". |
| 11 | 3.items.4 | Partly: "Canadian targets" is wrong; Ch9 attributes them to the International Consensus Report, for most adults (excludes pregnancy, children, older/high-risk) | "Diabetes Canada’s guideline uses international targets: for most adults, more than 70%…". bt1d-time-in-range kept as second source only. R1 widened; N5 updated. |
| 12 | 3.items.5 | Safety 5: children not named | Added "for children". Cited Ch9 and DC Checking Blood Sugar for it. |
| 13 | 3.figure.ruler.zones.timeInRange | Partly: heading implies DC’s patient page target, which is 4.0–10.0 | Label now "Sensor time in range (guideline): 3.9 to 10.0". |
| 14 | 3.figure.ruler.lowLink; meta `lowLink` | Safety 3: label promised "what to do" but pointed at the definition card | Now "What to do about a low: The Rule of 15", pointing at Staying Safe card 2. New N14. |
| 15 | 3.figure.ruler.teamNote | Safety 5 | Added "for example for a child". |
| 16 | 5.items.3 | Safety 2: no emergency step; Ch14 says support persons "should call for emergency services" | Added "and to call 911. The signs that need emergency care are in Staying Safe" (the chapter’s urgentExit links #red-flags). "such as on insulin" → "such as people who take insulin". N10 updated. |
| 17 | 5.items.4 | Confirmed; suggest "free research screening" | Added "research". |
| 18 | 5.items.5 | Partly: the Caregiver Guide is for carers of children and teens with T1D | "If you’re caring for a child or teen with type 1, Breakthrough T1D has a Caregiver Guide". |
| 19 | 6.items.4 | Confirmed; suggest "a meter and strips" | "keeping a meter and strips as a backup". |
| 20 | 8.items.7 | Confirmed; suggest "or ask your pharmacist" | Added "or ask your pharmacist". |
| 21 | 8.items.8 (new); meta card 8 neutral | Optional, safe: "Throw out insulin that has been frozen, exposed to temperatures greater than 30ºC, or expired" | New neutral item; meta `neutral: [6, 7, 8]`. No in-use duration (R5 unaffected). |
| 22 | 9.items.2 | Partly: HPSA takes CGM applicators "with needles" | "sensor applicators that have a needle". |
| 23 | 9.items.3–4 (renumbered); meta card 9 containers | Partly / Safety 4: "In those provinces" implied the garbage is fine elsewhere | Garbage line now unqualified: "Never put used sharps in the garbage or recycling, says the Health Products Stewardship Association". It moved to item 3, under "What goes in". The HPSA provinces line is now item 4. Containers: [1, 2, 3] and [4, 5]. |
| 24 | 10.items.5 | As #19 | "a meter and strips as a backup". |
| 25 | 10.items.6 | Confirmed (V resolved): page lists extra pump supplies and "ketone testing strips for urine or a ketone blood monitor" | "backup insulin pens or syringes, extra pump supplies, ketone strips or a blood ketone meter, and a written copy of your pump settings". |
| 26 | 11.items.1 | Partly: not every diabetes educator holds the CDE® | "Your diabetes educator: … Many are Certified Diabetes Educators (CDE®), licensed health professionals certified in diabetes education". |
| 27 | 11.note | Optional, sourced: "They may be available for appointments without referral" | Added "Some educators in the CDE directory see people without a referral." |
| 28 | programsBand.cards.2 | Confirmed (V resolved): Ch9 "at least every 6 months… in adults… when targets consistently achieved" | "For adults whose numbers have been steady at target, your team may space it out." N3 resolved. |
| 29 | programsBand.cards.3 | Confirmed; optional children qualifier (Safety 5) | Added "Children have their own schedule." |
| 30 | programsBand.cards.4 | Partly: Ch29 starts type 1 screening after puberty if onset was earlier; "yearly" is Ch29’s "at least annually", not the DC page | Attributed to the guideline; "at least once a year"; "usually start 5 years after diagnosis. Children have their own schedule, so ask your team". |
| 31 | pharmacist.body | Owner facts (not a verify row): no Liivv pharmacy in Quebec or the territories, which fall back to Ontario | "connect you with Liivv’s pharmacy in your province" → "pass you to the right Liivv pharmacy". Owner to confirm (pre-publish 1). |
| 32 | Section E, phone number | Scope 4: confirm the number isn’t a Diabetes Express one | Number no longer printed in this file; the row says why. |
| 33 | Section C | All four pre-publish checks resolved | Every V row is now C, quoting the page wording the check read. Card 3 sources reordered: Ch9 is the primary for time in range, and bt1d-time-in-range is second. |
| 34 | A.1 | Register notes out of date | Listed the `sources-review.ts` updates (988, dc-type-1, bt1d-mental-health-support, bt1d-time-in-range, Ch9). |

**Checked and unchanged:**
- Safety 7: the urgent exit resolves to `staying-safe#red-flags`.
- Safety 8: card 1 routes have no time limit, which is acceptable with 9-1-1 on the strip.
- Scope 2 and 3: no dosing, no drug class, no brands.
- Scope 6: Canadian terms.
- All rows marked Confirmed.

**Optional, sourced, but not applied** (to keep the cards short):
- DC Prediabetes: "Not everyone with prediabetes will develop type 2 diabetes, but many people will" (N9 alternative).
- Ch11 names Nordic eating.
- Ch10 adds 2 resistance sessions a week.
- DC Getting Started: "Do not leave pen tips on the end of the pen" (left to Ch03).

### F.2 Changes after the review of the built chapters (2026-10-05)

Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), the Diabetes chapter meta and the shared engine (`_microsite`). No verified English sentence of this chapter changed. Section B above still shows the wording from before these changes.

| # | Key | Review finding | Change made |
|---|---|---|---|
| 35 | meta card 2 doors; `held-messages.ts` | 1: Know Your Type is served | The `knowYourTypeRoute` hold is lifted: the `held:` line and its `held-messages.ts` entry are gone, so the five doors render and their labels ship. Doors open Know Your Type cards 1 (type 1), 2 (type 2), 4 (gestational), 3 (prediabetes) and 6 (less common types) through a new engine field, `doors[].card`, in the page locale (`/fr/…` on /fr). N12 now uses its default. No wording change. |
| 36 | meta card 11 lane 1 topics | 2: the card's note says to start with your diabetes educator | The educator lane also fits "A pump or sensor" and "Supplies" (topics `plan`, `device`, `supplies`). The Liivv pharmacist CDE lane still fits both. No wording change. |
| 37 | 5.items.2, 8.items.6 (EN + FR); meta `links` | 3: the Rule of 15 pointer was not a link | Tags only: “<link>The Rule of 15</link>” / “<link>la règle des 15</link>”. The phrase links to Staying Safe card 2 (`staying-safe#card-2`), locale-aware. New engine field `links` (per card: the message, `items.<n>` or `note`, and a target chapter with a card number or an anchor). No wording change. |
| 38 | meta card 1 crisis | 4: write the emergency number as 911 | Strip label now “Emergency: call 911” / “Urgence : appeler le 911” (meta `written: '911'`); 9-8-8 unchanged. N1 text updated. |
| 39 | urgentExit.lead, urgentExit.link (FR only) | 8: “dans le chapitre 02”, lower case, with the article | “…se trouvent dans” + “Chapitre 02 — Rester en sécurité” → “…se trouvent dans le” + “chapitre 02 — Rester en sécurité”. EN unchanged. |
| 40 | Shared interface text | 8 (and 4) | Shared French interface text (`DiabetesCare.ui`, every chapter; review 8): `ui.chapter.takeIn.print` “Imprimez cette liste” → “Imprimer la liste”, so every print button uses the infinitive (“Imprimer la règle des 15”, “Imprimer mes indices et mes questions”, “Imprimer l’arbre familial”); “Soins du diabète” → “Soins en diabète” in `ui.chapter.kicker`, `backToLanding` and `backToChapters`; `ui.governance.machineTranslated` “votre équipe de soins du diabète” → “votre équipe de soins en diabète”. No link label stacks two brackets any more: the engine now puts the “(en anglais)” note inside a label’s own closing bracket (“(s’ouvre sur leur site, en anglais)”, “(connexion requise, en anglais)”), with no message change. Emergency number (review 4): the crisis strip’s label is now “Emergency: call 911” / “Urgence : appeler le 911” (meta `written: '911'`); the message text already said 911 everywhere, and 9-8-8 keeps its hyphens. |

New open question: **C41** in `OPEN-QUESTIONS.md` (nice to have): the type 1 share is “5 to 10%” here (2.items.1) and “about 10%” in Know Your Type (1.items.1). Neither sentence was changed.

---

## G) NEW SITE FIGURES

All three are named in the plan. Each lists its data, its behaviour and its no-JS fallback. None reads a number back to the reader, and none places a product.

### G.1 `glucoseRange` — target-range ruler (card 3). Required.

- **Plan:** "Static ruler plus a printable 'my team's targets' card." GateId `glucoseRange` already exists in `review-gates.ts`.
- **Meta type (add to `DiabetesFigureMeta`):**
  ```ts
  | {
      kind: 'glucoseRange';
      scale: { min: number; max: number };
      zones: Array<{
        key: 'low' | 'beforeMeals' | 'afterMeals' | 'timeInRange';
        below?: number; from?: number; to?: number;
        item?: number; // the card sentence the zone comes from
      }>;
      lowLink: { chapter: 'staying-safe'; card: number };
      sources: SourceId[];
    }
  ```
- **Data (section A):**
  - The scale runs from 2 to 14 mmol/L.
  - Low is below 3.9 (R1).
  - Before meals is 4.0–7.0.
  - Two hours after meals is 5.0–10.0.
  - Sensor time in range (guideline) is 3.9–10.0 (R1, N5).
  - Edges are exactly as published.
- **Behaviour:** AUGMENTS the card.
  - A static horizontal SVG ruler shows the four bands as labelled bars stacked over one scale. They overlap by design.
  - Labels come from `figure.ruler.zones.*`.
  - The low band uses the warning tone and links to Staying Safe card 2 (`staying-safe#card-2`, "What to do about a low: The Rule of 15", N14).
  - `figure.ruler.teamNote` sits under the ruler and is always visible.
  - There is nothing to type in, no slider and no "your number is…".
  - Colour is never the only cue: each bar is labelled in text.
- **No-JS fallback:** none is needed for function, because the SVG is static. The SVG carries `role="img"` and an `aria-label`. The same four zones print as a plain `<ul>` under it, visually hidden on screen and shown in print. On /fr, until the gate opens, the card falls back to its own items, which carry every number.
- **Kinds (`site.ts`):** not `module`, not `restyle`, not `fullWidth`.

### G.2 `checkupYear` — "Your first year" map (band slot). Optional; ships as the programs band.

- **Plan:** the band "Your first year" covers education, A1C about every 3 months, and eyes, kidneys and feet. Ch04’s band "Your checkup year" can reuse it.
- **Engine work needed:** today `ChapterBandSlot` renders only `programsBand` and `shelf`. It needs a site band-slot hook, like the one Ostomy’s recovery map has, and a new GateId `checkupYear`.
- **Data:**
  ```ts
  checkupYear: {
    months: [0, 3, 6, 9, 12],
    rows: [
      { key: 'learning', marks: 'ongoing', band: 1 },
      { key: 'a1c', marks: [3, 6, 9, 12], band: 2, note: 'mayBeSpacedAdultsAtTarget' },
      { key: 'eyes', types: { type2: [0], type1: 'from5YearsAge15Plus' }, band: 3, note: 'childrenOwnSchedule' },
      { key: 'kidneys', types: { type2: [0, 12], type1: 'from5Years' }, band: 4, note: 'childrenOwnSchedule' },
      { key: 'feet', marks: 'daily+12', band: 5 },
    ],
    filter: ['type1', 'type2', 'other'], // local to the figure, as recovery-map-filter.tsx
    sources: [ /* bandSources */ ],
  }
  ```
  Every label is the band card’s own heading plus a short line from its body, so the map adds no new clinical sentence. The "children have their own schedule" notes come from band cards 3 and 4. "Other" (gestational, prediabetes, less common) shows only the learning row, with band card 1’s "ask your team which of these apply".
- **Behaviour:**
  - A 12-month timeline, one row per check, with dots on the months.
  - A local "My type" filter (Type 1 / Type 2 / Other) dims rows that don’t apply yet. For type 1, eyes and kidneys show "from 5 years after diagnosis". Nothing is removed.
  - There are no reminders or dates. The only thing stored is the filter’s per-viewer choice.
- **No-JS fallback:** the five programs-band cards in section B, rendered in the page as they are now. With JS the map sits above them, and the cards stay.

### G.3 `starterList` — therapy filter on card 10. Optional, after product review.

- **Plan:** "`supplyList`, filtered by therapy." The Ostomy `supplyList` carries products. As built: card 10 ships as `columns` (section A), and since placements resumed on 2026-10-06 (B21) its shop strip (`starterList` in chapter-shop.ts: meters, injection supplies, sensors and the everyone items) sits under it. The therapy filter is not built (updated 2026-10-06, K10).
- **Data:** the card’s six items, each tagged by therapy:
  - `meter`: item 1
  - `insulin`: items 2 and 3
  - `sensor`: item 5
  - `pump`: item 6
  - `everyone`: item 4
- **Behaviour:** tick boxes for "I check with a meter", "I take insulin", "I use a sensor" and "I use a pump". The list shows the ticked groups plus "everyone", with a print button. Products join each line only once placements and the owner’s kit sign-off resume.
- **No-JS fallback:** the `columns` figure in section A, which shows every item under its heading.

### F.3 Changes after the full-site review (2026-10-06)

Continues section F (change log).

| # | Key (EN and FR) | Was | Now | Why |
|---|---|---|---|---|
| F3-1 | `5.items.3` | "…should be taught how to give glucagon, and to call 911." (FR "…apprendre à donner du glucagon, et à appeler le 911.") | "…should be taught to call 911, and how to give glucagon." (FR "…apprendre à appeler le 911, et à donner du glucagon.") | Clinical S3: 911 first, as everywhere else on the site. Same facts and source (`dc-cpg-ch14-hypoglycemia-2023`); order only |
| F3-2 | `6.note` | "Funding & Coverage has the details…" as plain text | `<link>` tags around "Funding & Coverage" (FR "Financement et couverture"), opening `/liivv-health/diabetes-care/funding` in the page locale (meta `links: [{ at: 'note', to: { page: 'funding' } }]`, a new engine target for the site's own pages). No word changed | Known item K3 |
| F3-3 | Register | `dc-type-1` and `dc-type-2` pointed at diabetes.ca addresses that now redirect | Final addresses (`/what-is-diabetes/types-of-diabetes/type-1-diabetes`, `…/type-2-diabetes`); same pages | Link crawl 4 |
| F3-4 | FR `programsBand.cards.1.links.1.label` | "Trouver un EAD — Canadian Diabetes Educator Certification Board" | "Find a CDE — Canadian Diabetes Educator Certification Board" (the English-only directory's own title, untranslated; the engine adds "(en anglais)") | Link crawl 9: a title is never translated |

### F.4 Clinical rulings applied (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md). French is machine-drafted and awaits review.

| # | Key | Change (EN, then FR) | Ruling |
|---|---|---|---|
| 1 | `1.figure.body` | New (EN) "If you’re thinking about harming yourself, call or text 9-8-8, Canada’s Suicide Crisis Helpline, any time of day or night. If your safety is at risk right now, call 911." · FR "Si vous pensez à vous faire du mal, appelez ou envoyez un texto au 9-8-8, la Ligne d’aide en cas de crise de suicide du Canada, à toute heure du jour ou de la nuit. Si votre sécurité est menacée en ce moment, appelez le 911." | [C25](clinical-rulings-2026-10-06.md#c25) |
| 2 | N1, N10 (pinning) | The written rule (pin a card that sends the reader to act now; not one whose 911 mention only prepares someone) is recorded in `chapters-meta.ts`. Card 1 stays pinned, now with its own strip sentence; card 5 stays unpinned. Ostomy parity is not adopted | [C25](clinical-rulings-2026-10-06.md#c25) |
| 3 | N6 | Card 6 item 3 (the guideline's CGM recommendation for type 1) stays as it is | [C20](clinical-rulings-2026-10-06.md#c20) |
| 4 | N7, N14 | Kept: exercise starting advice for every type; the ruler's low band links to the Rule of 15 | [C31](clinical-rulings-2026-10-06.md#c31) |
| 5 | R1, R2, R3, R5, R9 | Carried rulings settled site-wide (3.9; ⅔ cup in Staying Safe; ladder for type 1 with stronger top rungs; "most up to 28 days, follow your leaflet" in Your Tools and Staying Safe; FIT stays industry). No wording in this chapter changed for them | [C1](clinical-rulings-2026-10-06.md#c1), [C13](clinical-rulings-2026-10-06.md#c13), [C4](clinical-rulings-2026-10-06.md#c4), [C15](clinical-rulings-2026-10-06.md#c15), [C14](clinical-rulings-2026-10-06.md#c14) |
| 6 | Section E, sharps outside HPSA | Card 9 keeps "ask your pharmacy" (instruction only); no province-wide government source exists (source gap) | [C32](clinical-rulings-2026-10-06.md#c32) |

### F.5 Clinical rulings applied: targets, types and other (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md), rulings C16–C45 (the verifier's final copy; where a choice was left to the owner, the stated default). Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only) and `chapters-meta.ts`. Sections B and C above still show the earlier wording and claims rows; the keys and claims below are current. All French is machine-drafted and awaits the francophone review.

| # | Key or place | Change | Ruling |
|---|---|---|---|
| 1 | `3.items.2` | EN "If your A1C isn’t at target, your team may set a lower after-meal target. Diabetes Canada gives 5.0 to 8.0" → "If your A1C isn’t at target, your team may set a lower after-meal target, weighing it against the risk of lows. Diabetes Canada gives 5.0 to 8.0" · FR → "Si votre A1C n’est pas dans la cible, votre équipe pourrait fixer une cible plus basse après les repas, en tenant compte du risque d’hypoglycémie. Diabète Canada indique de 5,0 à 8,0" | [C19](clinical-rulings-2026-10-06.md#c19) |
| 2 | `programsBand.cards.3.body` | EN "With type 2, Diabetes Canada’s guideline says to have an eye exam at diagnosis. With type 1, for people 15 and over, yearly eye exams start 5 years after diagnosis. Children have their own schedule. Your team tells you when yours is due." → "Diabetes Canada says to have an eye exam once a year, unless your eye-care professional suggests something different. With type 2, the first one is at diagnosis. With type 1, for people 15 and over, they start 5 years after diagnosis. Children have their own schedule. Your team tells you when yours is due." · FR → "Diabète Canada recommande un examen de la vue une fois par année, à moins que votre professionnel des soins de la vue ne suggère autre chose. Avec le type 2, le premier a lieu au moment du diagnostic. Avec le type 1, chez les personnes de 15 ans et plus, les examens commencent 5 ans après le diagnostic. Les enfants ont leur propre calendrier. Votre équipe vous dira quand le vôtre est prévu." | [C24](clinical-rulings-2026-10-06.md#c24) |
| 3 | `5.items.4` | EN "If they have type 1, immediate family aged 2 to 45, and other relatives aged 2 to 20, can ask about free research screening through TrialNet, anywhere in Canada" → "If they have type 1, immediate family aged 2 to 45, and other relatives aged 2 to 20, can ask about free research screening through TrialNet, anywhere in Canada. The details are in <link>Type 1 starts before symptoms</link>, in Know Your Type" · FR → "Si elle a le type 1, ses proches parents de 2 à 45 ans, et les autres membres de sa famille de 2 à 20 ans, peuvent se renseigner sur le dépistage gratuit offert dans le cadre de la recherche TrialNet, partout au Canada. Les détails sont dans <link>Le type 1 commence avant les symptômes</link>, dans Connaître votre type" | [C30](clinical-rulings-2026-10-06.md#c30) |
| 4 | card 5 (meta) | `links` adds `{ at: 'items.4', to: { chapter: 'know-your-type', card: 5 } }`: the pointer's link text is the destination card's title, as elsewhere on the site. TrialNet's details stay on Know Your Type card 5. N4 closed | [C30](clinical-rulings-2026-10-06.md#c30) |
| 5 | card 10 (meta) | Ask: `educator` → `pharmacistCde` (starter supplies go to the pharmacist CDE; the label stays "Ask a pharmacist CDE"). N11 closed | [C33](clinical-rulings-2026-10-06.md#c33) |
| 6 | band (meta) | `bandSources` leads with `dc-eye-damage-retinopathy`; band card 3's claim cites it. N2 closed | [C24](clinical-rulings-2026-10-06.md#c24) |
| 7 | 3.items.2 claims | Cites `dc-checking-blood-sugar` and `dc-cpg-ch8-targets` (Ch8: "must be balanced against the risk of hypoglycemia"). N13 closed | [C19](clinical-rulings-2026-10-06.md#c19) |
| 8 | N5 | Kept as built: the time-in-range line is not labelled international, because a Canadian guideline adopts it | [C40](clinical-rulings-2026-10-06.md#c40) |
| 9 | R10 | Closed: alcohol is ruled in Every Day Living card 4 | [C16](clinical-rulings-2026-10-06.md#c16) |

### F.6 Owner's business answers applied (2026-10-06)

From the owner's answers of 2026-10-06 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)). French machine-drafted.

| # | Key | Change | Why |
|---|---|---|---|
| 1 | `pharmacist.body`, `pharmacist.cta` | EN body → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province. Your plan and your medicines still belong with your diabetes team." · FR → "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province. Votre plan et vos médicaments restent l’affaire de votre équipe de soins en diabète.". Under the body, the panel shows the CDE contact from `ui.contact` (DIABETES_SITE.contact): "Call 1-844-561-1254" (tel:+18445611254; FR "Appeler le 1 844 561-1254"), "Email BayshoreExpress@bayshore.ca", "Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays", and "About Bayshore Express Pharmacy" (https://bayshoreexpresspharmacy.ca/about/; FR /fr/a-propos-de-nous/, `bep-about`). The `cta` "Request a call" is removed: the panel has no button, and the hero's "Ask a pharmacist" opens the panel (`#chapter-cde`) | Owner A2, B5, B9, B10, B12 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)) |
| 2 | `11.figure.lanes.4` (meta: lane 4) | label "Liivv pharmacist CDE" → "Bayshore Express Pharmacy CDEs"; scope → "The Liivv pharmacy in Markham, Ontario · all of Canada · Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays"; body → "Questions about pumps, sensors, meters and other diabetes supplies, and about billing and claims."; link "Request a call (sign-in needed)" → "Call 1-844-561-1254", dialling tel:+18445611254 (no language; meta `sources: ['bep-about']`) · FR "Éducateurs agréés en diabète de la Pharmacie Bayshore Express" / "La pharmacie Liivv de Markham, en Ontario · partout au Canada · du lundi au vendredi, de 9 h à 17 h, heure de l’Est, sauf les jours fériés" / "Questions sur les pompes, les capteurs, les lecteurs et les autres fournitures pour le diabète, et sur la facturation et les demandes de remboursement." / "Appeler le 1 844 561-1254". Still behind `laneExtras` on /fr | A2, B9, B10 |
| 3 | `4.note` | "…are in Every Day Living." → "…are in Everyday Liivving." (FR "…dans La vie de tous les jours." → "…dans Liivv au quotidien.") | B32 |
| 4 | Pre-publish 1 | Answered (hours, scope, hand-off to the Liivv pharmacy in the reader's province); what remains is the booking page for "Request a call" (B6) | A1, A2, B5 |
| 5 | `11.figure.lanes.4` (meta: lane 4, `contact: true`) | The lane now shows the whole CDE contact under its words, as every CDE panel does: "Call 1-844-561-1254" (tel:+18445611254), "Email BayshoreExpress@bayshore.ca", the hours and "About Bayshore Express Pharmacy" (`ui.contact`, DIABETES_SITE.contact). The single "Call 1-844-561-1254" link (`linkLabel`) is removed, and the hours leave the scope line, which is now "The Liivv pharmacy in Markham, Ontario · all of Canada" (FR "La pharmacie Liivv de Markham, en Ontario · partout au Canada"). Still behind `laneExtras` on /fr | B9 (email and About page in the CDE lanes too) |

### F.7 Commerce step: shop strips (2026-10-06)

How a strip behaves (all chapters): the products are named in `diabetes-care/chapters/chapter-shop.ts` (owner answer B21, "Now?"), drawn by the shared engine (`_microsite/shop/`) under the card's referral chip, and read from the catalogue on every request. A product shows only while the store shows it, sells it and has it in stock, and never when its description names or links another retailer or gives its phone number (17 descriptions still do; OPEN-QUESTIONS B3). A product with a required option or modifier (85 diabetes products carry a required "Test" modifier today) gets "Choose options", a link to its page, instead of a one-click add. No kit is listed (A4). One switch, `SHOP_SWITCH.placements`, turns every strip off. Every placed id is health-revealing by id for analytics (`sensitive-products.ts`). The strip's words are `ui.chapter.shop.*` (French machine-drafted, not behind a review gate, as on Ostomy).

| # | Card | Strip | Why |
|---|---|---|---|
| 1 | 8 Starting insulin | `startingInjections`: pen needles (4777, 7544) and a 1 L sharps container (4350); a link to the insulin shelf (category 1116, `offers.insulinShelf`) with `ui.commerce.pharmacistNotice` and `quebecInsulin`, the words the insulin product pages print. No insulin product is named: the prescriber chooses. On /fr the link and both notices are left out, and the link's label is not sent to the browser (`FR_HELD_COPY`): insulin may not be advertised to Quebec | B21, B3, B11 |
| 2 | 10 Your starter supply list | `starterList`, by therapy: meters (4287, 4524, 4556, 4402); injections (4777, 7544, syringes 4655); sensors (4227, 4316); everyone (Dex4 tablets 7371 and gel 7382, a medical ID 7778, sharps 4350) | B21 |
| 3 | No shelf | The plan names none for this chapter, so no resources shelf is added (B28 applies to Everyday Liivving) | B28 |

### F.8 Fixes after the full-site review (2026-10-06)

From the browser QA, the link crawl and the clinical and business review of 2026-10-06. French machine-drafted. The engine-wide rows (5 and 6) apply to every chapter and are recorded here once.

| # | Where | Change | Why |
|---|---|---|---|
| 1 | Card 7 image (meta) | `/archive/diabetes-care/care-chat-desk.png` → `care-chat-main.png`. The old file exists only for Ostomy, so the card showed a broken image (404). Card 11's `care-chat-moment.png` was missing too: → `chapter-journey.png` | QA 2 |
| 2 | Card 11 lane 5 (meta), citations | Breakthrough T1D's mental health page opens its French page on /fr, https://perceedt1.ca/soutien-en-sante-mentale/ (the register's `hrefFr` for `bt1d-mental-health-support`), so the French link no longer says "en anglais". The citation gets the French title and page, "Percée DT1 — Soutien en santé mentale". Engine: `LaneMeta.hrefFr` (new, engine-only; Ostomy's twin has none) | Crawl 4 |
| 3 | Card 8 strip (`chapter-shop.ts`) | The link to the insulin shelf, and the notices under it, are held (`INSULIN_SHELF.linked`, false). The refused-description check sees only placed products, and the shelf lists Toujeo SoloStar (packs of 3 and 5; the description links a PDF on another retailer's site) and Tresiba FlexTouch U-100 and U-200 (the description names that retailer's pharmacy); three Apidra listings on it answer 404 in English. The pen needles, syringes and sharps container stay. The link comes back when the owner has fixed those products in the store (OPEN-QUESTIONS B3) | Crawl 1, 2, 5 (S1) |
| 4 | `ui.commerce.pharmacistNotice`; new `ui.commerce.insulinColdChain` | "A pharmacist reviews and dispenses every insulin and glucagon order. Shipped cold-chain in plain packaging." → "A pharmacist reviews and dispenses every insulin and glucagon order, shipped in plain packaging." and, for insulin only, "Insulin is shipped cold-chain." (FR « Un pharmacien vérifie et prépare chaque commande d’insuline et de glucagon, expédiée dans un emballage neutre. » / « L’insuline est expédiée sous chaîne du froid. »). Baqsimi (glucagon) is kept at room temperature, so the product page and the strips no longer say cold-chain of it. Whether glucagon ships cold is the owner's to confirm (B37) | QA 1 |
| 5 | Pharmacist panel heading, every chapter, path and the funding page | The heading takes the panel's light text (#f4f7f3). It was the page's dark ink on dark green, about 3:1. Scoped to engine pages (`[data-site]`); Ostomy's panels have the same rule and are not changed here | QA 4 |
| 6 | Shop strips, every page | Product links use the catalogue path without its trailing slash, so no redirect. At 400px and narrower each card is a row (photo, name, price) with its button full width under it, so "Add to cart" / « Ajouter au panier » and "Choose options" sit on one line inside the card | Crawl 6, QA 7 |
| 7 | G.3 below | Brought up to the built state (placements resumed 2026-10-06) | K10 |
