# 04 · Every Day Living — chapter copy after source check (DiabetesCare.chapters.every-day-living)

Draft of 2026-10-05, revised the same day against `every-day-living.verify.md` (CDE source and clinical check). Every Partly row and every safety, scope and labelling problem in that check is applied below; section F lists each change. Not compiled, not in the repo. The shape follows the staying-safe `CHAPTER_META` entry and the `DiabetesCare.chapters.staying-safe` message tree, minus the `urgent` block (only Staying Safe has one; this chapter signposts to `/liivv-health/diabetes-care/chapters/staying-safe#red-flags` through `urgentExit`).

Ground rules applied:
- Every SourceId cited is already in `sources-meta.ts`. No new ids are proposed.
- Every factual sentence was checked against the live page or PDF on 2026-10-05, not only against the survey notes. Copies of the pages are in `scratchpad/src/edl/` (HTML converted to `.txt`, PDFs read with pdftotext). Where the page says less than the survey or the register locator, the copy follows the page (see C.2).
- No product names in the copy. Since 2026-10-06 (B21) cards 2, 3, 6 and 8 carry shop strips (`chapter-shop.ts`; F.7); the foot creams and kits stay out. The resources shelf (B28) is built (F.7; its claims are in C).
- No Diabetes Express mentions or links.
- No dosing, titration or treatment decisions, and no drug-class recommendations. The heart card's "D" names no medicine class, the kidney card leaves out CPG Ch29's medicine key message, and the travel card leaves out Diabetes Canada's insulin-unit changes for time zones.
- Clinical defaults pending the nurse (see D): low = below 3.9 mmol/L site-wide (this chapter uses 4.0 only where CPG Ch21 does, for driving); ½ cup juice (not repeated here); the ketone ladder is written for type 1 (not repeated here); "follow your leaflet" for in-use insulin (the travel card leaves out "30 days"); no alcohol limits stated; FIT treated as industry-run (not cited here).

---

## A) META OUTLINE

### A.1 SourceIds used (all already in `sources-meta.ts`)

```ts
// Canadian guidelines
'dc-cpg-ch9-monitoring-2021'          // band card 4 (A1C about every 3 months)
'dc-cpg-ch10-physical-activity'       // card 3
'dc-cpg-ch11-nutrition-therapy'       // cards 1, 2, 4
'dc-cpg-ch14-hypoglycemia-2023'       // card 7 note (3.9 vs 4.0)
'dc-cpg-ch18-mental-health-2023'      // cards 4 (alcohol, 2023 position), 5
'dc-cpg-ch21-driving'                 // card 7
'dc-cpg-ch29-ckd-2025'                // card 10, band
'dc-cpg-ch30-retinopathy'             // card 9, band
'dc-cpg-ch32-foot-care'               // card 8 (incl. ulcer/infection line), band
'dc-cannabis-position-2020'           // card 4
'ccsa-alcohol-guidance-2023'          // card 4
// Diabetes Canada patient pages and sheets
'dc-carb-counting-sheet-2025'         // cards 1, 2
'dc-exercise-and-activity'            // cards 3, 5
'dc-alcohol-and-diabetes-2018'        // card 4
'dc-diabetes-and-drinking-2019'       // card 4
'dc-taking-care-of-mental-health'     // card 5
'dc-drive-safe-card'                  // card 7
'dc-driving-and-diabetes'             // cards 7, 12
'dc-air-travel'                       // card 6
'dc-foot-care-sheet-2025'             // card 8, band
'dc-kidney-disease'                   // card 10, band
'dc-heart-disease-and-stroke'         // card 11, band
'dc-rights-of-people-living-with-diabetes' // card 12
// Other Canadian
'hc-healthy-eating-recommendations'   // card 1
'catsa-diabetic-supplies'             // card 6
'bt1d-mental-health-support'          // card 5 (routes)
'988-suicide-crisis-helpline'         // card 5 (crisis strip)
'wounds-canada-diabetic-foot-ulcers'  // card 8 (second source for item 1)
'cos-diabetic-retinopathy'            // card 9
'cnib-diabetic-retinopathy'           // card 9
'kfoc-end-diabetic-kidney-disease'    // card 10
```

Registered but deliberately **not** cited: `cma-drivers-guide-endocrine` (clinician-facing; commercial rules held, E3), `dc-cpg-ch18-mental-health` (2018, superseded for this purpose by the 2023 update), `fit-canada-pocket-guide-4th-ed` (industry-run default).

### A.2 Additions outside the chapter (needed before this chapter renders)

`DiabetesCare.ui.chapter.groups` gains two keys (the start-here map and section headings read them):

```json
"dayToDay": "Day to day",
"protectingYourBody": "Protecting your body"
```

No new ask role, glyph or site figure kind is needed for v1. Every glyph used below is already in `GlyphName`. `review-gates.ts` needs the gate `chapter:every-day-living` (the slug is already in `ChapterSlug`). The `988-suicide-crisis-helpline` locator in `sources-review.ts` says no Diabetes chapter shows the strip; it needs updating once this card ships (C.2).

### A.3 Proposed CHAPTER_META entry

```ts
  /*
   * 04 · Every Day Living. Copy: DiabetesCare.chapters.every-day-living,
   * draft of 2026-10-05, checked against the live pages that day. The
   * clinical rulings it uses as defaults (R1, R4, R10 and the chapter's own,
   * D1–D12) are open with the nurse and recorded in the content review.
   */
  {
    slug: 'every-day-living',
    num: '04',
    chapterWord: 'four',
    heroImage: `${IMG}/chapter-everyday.png`,
    /* Placeholder until the Diabetes image set and palette are chosen. */
    accent: '#c9dcc0',
    rail: false,
    majorSections: true,
    /* Exactly two segments: day to day, and protecting your body. */
    startHere: { groups: ['dayToDay', 'protectingYourBody'] },
    /* No red-flag block here: the signpost points at Staying Safe's #red-flags. */
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Day to day ---------- */
      {
        // 1 Food without a rulebook. The definition line above, then more often /
        // less often / how you eat.
        image: `${IMG}/chapter-everyday.png`,
        group: 'dayToDay',
        ask: 'dietitian',
        figures: [{ kind: 'columns', lead: [1], columns: [[2, 3], [4], [5, 6]] }],
        sources: [
          'dc-cpg-ch11-nutrition-therapy',
          'hc-healthy-eating-recommendations',
          'dc-carb-counting-sheet-2025',
        ],
      },
      {
        // 2 Carb counting. No insulin maths. A printable card with blank goal
        // lines, filled in with a dietitian or educator.
        image: `${IMG}/chapter-prediabetes.png`,
        group: 'dayToDay',
        ask: 'dietitian',
        figures: [{ kind: 'takeIn', fields: 5 }],
        sources: ['dc-cpg-ch11-nutrition-therapy', 'dc-carb-counting-sheet-2025'],
      },
      {
        // 3 Moving your body. Lows after activity stay in Staying Safe card 4;
        // item 7 points there. Item 6 says only "stop the activity" for chest
        // pain or breathlessness; the 911 line is HELD (E1b) pending D4 and a
        // registered heart-attack-signs source.
        image: `${IMG}/chapter-journey.png`,
        group: 'dayToDay',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [[1, 2, 3], [4], [5]],
            neutral: [6, 7],
          },
        ],
        sources: ['dc-cpg-ch10-physical-activity', 'dc-exercise-and-activity'],
      },
      {
        // 4 Alcohol and cannabis. No limits stated (R10): the card says the 2018
        // nutrition guideline is higher than the 2023 guidance, and gives Diabetes
        // Canada's 2023 position (CPG Ch18) beside CCSA's "less is better".
        image: `${IMG}/chapter-type2.png`,
        group: 'dayToDay',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3, 4, 5],
              [6, 7],
            ],
          },
        ],
        sources: [
          'dc-alcohol-and-diabetes-2018',
          'dc-diabetes-and-drinking-2019',
          'dc-cpg-ch11-nutrition-therapy',
          'dc-cpg-ch18-mental-health-2023',
          'ccsa-alcohol-guidance-2023',
          'dc-cannabis-position-2020',
        ],
      },
      {
        // 5 Distress, stress and sleep. The crisis strip (911 and 9-8-8, call or
        // text) as on Ostomy's "Just been told", so the card is pinned open in
        // every locale. Routes carry who to tell, so no ask chip (Ostomy precedent).
        image: `${IMG}/care-chat-main.png`,
        group: 'dayToDay',
        urgentContent: true,
        figures: [
          {
            kind: 'crisis',
            numbers: [{ tel: '911', kind: 'emergency' }, { tel: '988', sms: true }],
          },
          {
            kind: 'routes',
            routes: [{ glyphs: ['team', 'primaryCare'] }, { glyphs: ['book'] }],
          },
        ],
        sources: [
          'dc-taking-care-of-mental-health',
          'dc-cpg-ch18-mental-health-2023',
          'dc-exercise-and-activity',
          'bt1d-mental-health-support',
          '988-suicide-crisis-helpline',
        ],
      },
      {
        // 6 Flying with diabetes supplies. Generic symbols only; no product.
        image: `${IMG}/chapter-new.png`,
        group: 'dayToDay',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'bag',
                items: [
                  { item: 1, glyph: 'pen' },
                  { item: 2, glyph: 'drop' },
                  { item: 3, glyph: 'sharps' },
                  { item: 7, glyph: 'pen' },
                ],
              },
              {
                glyph: 'people',
                items: [
                  { item: 4, glyph: 'pump' },
                  { item: 5, glyph: 'sensor' },
                ],
              },
              { glyph: 'book', items: [{ item: 6, glyph: 'list' }] },
            ],
          },
        ],
        sources: ['catsa-diabetic-supplies', 'dc-air-travel'],
      },
      {
        // 7 Driving. CPG Ch21 throughout, including its 4.0 (R1 / D1). The note
        // on 3.9 vs 4.0 stays visible, as Staying Safe's driving line does.
        image: `${IMG}/chapter-essentials.png`,
        group: 'dayToDay',
        ask: 'team',
        noteVisible: true,
        figures: [
          {
            kind: 'columns',
            lead: [1],
            columns: [
              [2, 6],
              [3, 4, 5],
              [7, 8],
            ],
            neutral: [9],
          },
        ],
        sources: [
          'dc-cpg-ch21-driving',
          'dc-drive-safe-card',
          'dc-driving-and-diabetes',
          'dc-cpg-ch14-hypoglycemia-2023',
        ],
      },

      /* ---------- Protecting your body ---------- */
      {
        // 8 Your feet, every day. "See someone right away" is a same-day line,
        // so the card is pinned open (D8).
        image: `${IMG}/chapter-type1.png`,
        group: 'protectingYourBody',
        ask: 'primaryCare',
        urgentContent: true,
        figures: [{ kind: 'columns', lead: [1], columns: [[2, 3, 4, 5], [6], [7], [8]] }],
        sources: [
          'dc-foot-care-sheet-2025',
          'dc-cpg-ch32-foot-care',
          'wounds-canada-diabetic-foot-ulcers',
        ],
      },
      {
        // 9 Your eyes. CPG Ch30 schedule first, COS second, "your team decides"
        // (policy 5). CNIB's see-now symptoms pin it open (D8).
        image: `${IMG}/chapter-gestational.png`,
        group: 'protectingYourBody',
        ask: 'team',
        urgentContent: true,
        figures: [
          {
            kind: 'columns',
            lead: [1, 2, 3],
            columns: [[4, 5], [6]],
            neutral: [7, 8],
          },
        ],
        sources: ['dc-cpg-ch30-retinopathy', 'cos-diabetic-retinopathy', 'cnib-diabetic-retinopathy'],
      },
      {
        // 10 Your kidneys. No figure. CPG Ch29's medicine key message is left out (D10).
        image: `${IMG}/hero.png`,
        group: 'protectingYourBody',
        ask: 'primaryCare',
        sources: ['dc-kidney-disease', 'dc-cpg-ch29-ckd-2025', 'kfoc-end-diabetic-kidney-disease'],
      },
      {
        // 11 Your heart: the ABCDEs (Diabetes Canada's patient-page spelling).
        // One box per letter; "D" names no medicine class (D11).
        image: `${IMG}/closing.png`,
        group: 'protectingYourBody',
        ask: 'primaryCare',
        figures: [
          {
            kind: 'columns',
            lead: [1, 2],
            columns: [[3], [4], [5], [6], [7], [8]],
            neutral: [9],
          },
        ],
        sources: ['dc-heart-disease-and-stroke'],
      },
      {
        // 12 Work and your rights. No ask chip: nobody on the care team owns this.
        image: `${IMG}/care-chat-main.png`,
        group: 'protectingYourBody',
        sources: ['dc-rights-of-people-living-with-diabetes', 'dc-driving-and-diabetes'],
      },
    ],
    /*
     * Band "Your checkup year": four cards, no links. Each names the chapter
     * card that covers it, and that title in its body links there. This is the
     * v1 band; the checkup-year map (section G) would take this slot later,
     * with these four cards as its fallback.
     */
    programsBandLinks: [[], [], [], []],
    programsBandCards: [9, 10, 8, 11],
    bandSources: [
      'dc-cpg-ch30-retinopathy',
      'dc-cpg-ch29-ckd-2025',
      'dc-kidney-disease',
      'dc-foot-care-sheet-2025',
      'dc-cpg-ch32-foot-care',
      'dc-heart-disease-and-stroke',
      'dc-cpg-ch9-monitoring-2021',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_CDE_REQUEST_HREF,
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'Diabetes Canada — Foot care: a step toward good health (08/25)',
        href: 'https://www.diabetes.ca/getContentAsset/33d37ad7-82dd-4c56-a8ee-48cd7051589a/0f6cf596-933c-4f74-b36a-77091c512445/foot-care.pdf?language=en',
      },
      {
        label: 'Diabetes Canada — Diabetes and Driving',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-21',
      },
      {
        label: 'Diabetes Canada — Mental Health and Diabetes: 2023 Update',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-18-2023-update',
      },
      {
        label: 'Diabetes Canada — Air Travel',
        href: 'https://www.diabetes.ca/learn-about-diabetes/your-rights/air-travel',
      },
      {
        label: 'Diabetes Canada — Heart Disease & Stroke',
        href: 'https://www.diabetes.ca/living-with-diabetes/managing-complications/heart-disease-and-stroke',
      },
      {
        label: 'Diabetes Canada — Kidney Disease',
        href: 'https://www.diabetes.ca/living-with-diabetes/managing-complications/kidney-disease',
      },
    ],
  },
```

Structural checks against the engine:
- `startHere.groups` has exactly two keys, both used by cards, in page order (cards 1–7, then 8–12).
- `crisis` carries `numbers`, as the engine's `BaseFigureMeta` requires (Ostomy's twin type has none). `crisis` and `routes` are ungateable, so card 5's help lines show on /fr too.
- Every restyling figure (`columns`, `containers`, `takeIn`) covers every item number of its card, as Staying Safe's do.
- `programsBandCards` points at cards 9, 10, 8 and 11. Each band body contains that card's exact title ("Your eyes", "Your kidneys", "Your feet, every day", "Your heart: the ABCDEs"), so `LinkedIntroBody` can link it.
- Because card 5 carries the crisis strip and the band is about checkups, the band prints the `urgentExit` signpost only if no card already shows it (`showsChapterExit`), which is the engine's existing behaviour.
- After the source check no item was added or removed, so every figure's item coverage above is unchanged (card 3 has 7 items, card 4 has 7, card 7 has 9, card 8 has 8, card 11 has 9).
- `urgentExit.lead` now claims only what Staying Safe's `#red-flags` block covers (lows and highs). It does not cover chest pain, stroke or sudden vision loss (verify S1).

---

## B) EN MESSAGES — `DiabetesCare.chapters.every-day-living`

Same key shape as `staying-safe`, without `urgent` (Staying Safe is the only chapter with a red-flag block).

```json
{
  "title": "Every Day Living",
  "heroBody": "Food, movement, mood, travel and driving, then the checkups that look after your feet, eyes, kidneys and heart.",
  "focus": "Day to day: food, carb counting, being active, alcohol and cannabis, stress and sleep, flying and driving. Protecting your body: your feet, eyes, kidneys and heart, your checkup year, and your rights.",
  "vibe": "Practical and unhurried: how a day works, and what to check each year.",
  "categoriesIntro": {
    "eyebrow": "Today, and the years ahead",
    "heading": "Diabetes, around the rest of your life",
    "body": "The first half is the everyday: what you eat, how you move, how you feel, and getting around. The second is the checkups that find changes early. If your team gave you different targets or advice, use theirs."
  },
  "startHere": {
    "heading": "Today, or the years ahead?",
    "pivot": "Your time frame",
    "segments": {
      "1": {
        "label": "Day to day"
      },
      "2": {
        "label": "Protecting your body"
      }
    }
  },
  "categories": {
    "1": {
      "title": "Food without a rulebook",
      "items": {
        "1": "Diabetes Canada’s guideline describes several styles of eating that work well with diabetes, including Mediterranean, Nordic, DASH and vegetarian",
        "2": "Canada’s food guide suggests plenty of vegetables, fruit, whole grains and protein foods, with protein from plants more often",
        "3": "Make water your drink of choice",
        "4": "Choose whole and less processed foods more often than sugary drinks, fast food and refined grains",
        "5": "Notice when you’re hungry and when you’re full",
        "6": "Culture and food traditions can be part of healthy eating"
      },
      "note": "A registered dietitian can help you make a meal plan that fits your culture, your tastes and your blood sugar goals.",
      "figure": {
        "columns": {
          "1": {
            "heading": "More often"
          },
          "2": {
            "heading": "Less often"
          },
          "3": {
            "heading": "How you eat"
          }
        }
      }
    },
    "2": {
      "title": "Carb counting",
      "items": {
        "1": "Diabetes Canada’s guideline suggests learning to count carbohydrate, because how much you eat at one time usually matters",
        "2": "Your body turns carbohydrate into sugar, which raises your blood sugar. Both the kind and the amount matter",
        "3": "Carbohydrate is in grains and starches, fruit, some vegetables, legumes, milk and milk alternatives, sweet foods and many prepared foods. Meat and alternatives, most vegetables and fats have little",
        "4": "Diabetes Canada’s sheet gives about 45 to 60 g of carbohydrate at a meal and 15 to 30 g at a snack for most people. A dietitian or diabetes educator can help you set your own goals",
        "5": "Try to keep each meal and snack within 5 g of your goal",
        "6": "On a Nutrition Facts table, check the serving size first. Then take the total carbohydrate and subtract the fibre: 36 g of carbohydrate with 6 g of fibre counts as 30 g"
      },
      "note": "If you take insulin with meals, work out with your team how carbohydrate and insulin fit together. This card covers counting only.",
      "figure": {
        "heading": "My carbohydrate goals",
        "fields": {
          "1": "Breakfast",
          "2": "Lunch",
          "3": "Dinner",
          "4": "Snacks",
          "5": "Set with (my dietitian or diabetes educator)"
        }
      }
    },
    "3": {
      "title": "Moving your body",
      "items": {
        "1": "Aim for at least 150 minutes a week of activity that raises your breathing and heart rate, like brisk walking, cycling, swimming or dancing",
        "2": "Spread it over at least 3 days, with no more than 2 days in a row off",
        "3": "Start slowly, with 5 to 10 minutes a day, and build up. Less than 150 minutes still has benefits",
        "4": "Add strength exercises at least 2 times a week, with weights, bands or your own body weight. If you’re new to them, get some instruction first",
        "5": "Break up long periods of sitting. Diabetes Canada’s guideline suggests getting up briefly every 20 to 30 minutes",
        "6": "If you’ve been inactive for a while, talk to your doctor before starting anything harder than a brisk walk. If you’re short of breath or have chest pain, stop the activity",
        "7": "Exercise can lower your blood sugar for up to 48 hours. If you take insulin or other medicines that lower blood sugar, check regularly and carry fast-acting sugar. More in Staying Safe, under Lows that sneak up"
      },
      "note": "Ask your team how to plan food and medicines around activity, especially if you use insulin.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Moving more"
          },
          "2": {
            "heading": "Getting stronger"
          },
          "3": {
            "heading": "Sitting less"
          }
        }
      }
    },
    "4": {
      "title": "Alcohol and cannabis",
      "items": {
        "1": "Diabetes Canada’s alcohol sheet says that, as a general rule, you don’t need to avoid alcohol because you have diabetes. Its newer 2023 guideline adds that if you don’t drink, it’s healthier not to start. Talk with your team about what’s right for you",
        "2": "The sheet says not to drink if you’re pregnant or trying to get pregnant, breastfeeding, have a personal or family history of drinking problems, are about to drive or do anything that needs your full attention, or take certain medicines. Ask your pharmacist about yours",
        "3": "If you take insulin or some other diabetes medicines, a low can come up to 24 hours after drinking. Eat carbohydrate when you drink, check your blood sugar before bed, and make sure someone with you knows how to help, including calling 911 if you pass out. More in Staying Safe, under Lows that sneak up",
        "4": "Alternating alcoholic drinks with water helps you avoid getting dehydrated",
        "5": "Diabetes Canada’s 2018 nutrition guideline gives higher limits than Canada’s 2023 Guidance on Alcohol and Health. Diabetes Canada’s 2023 guideline says that if you drink, cutting down lowers the risk to your health, and the 2023 guidance says that with alcohol, less is better. Your team can help if you want to cut down",
        "6": "Diabetes Canada does not recommend recreational cannabis for teens or adults with diabetes. With type 1, it says to avoid it, because it raises the risk of diabetic ketoacidosis (DKA)",
        "7": "If you do use cannabis, edibles can contain carbohydrate, and cannabis can make you hungrier. Diabetes Canada says adults who use it should be offered advice on lowering the risks"
      },
      "note": "Alcohol and cannabis aren’t things to hide from your team. Diabetes Canada asks health-care providers to talk about them regularly, without judgement.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Alcohol"
          },
          "2": {
            "heading": "Cannabis"
          }
        }
      }
    },
    "5": {
      "title": "Distress, stress and sleep",
      "items": {
        "1": "Living with diabetes can feel like a burden. Diabetes Canada says its constant demands can lead to diabetes distress, low moods and anxiety",
        "2": "You may feel angry, guilty, frightened, discouraged or low. Diabetes Canada’s guideline calls these valid responses to a long-term condition",
        "3": "Depression is more common in people with diabetes, and there are effective treatments",
        "4": "Problems with eating, sleeping and stress are common too. Tell your team about them",
        "5": "So is fear of lows. If it’s holding you back, tell your team, because there are ways to help",
        "6": "Diabetes Canada’s guideline says everyone with diabetes, and parents and caregivers of young people with diabetes, should be checked regularly for diabetes distress. Your team may give you a short questionnaire to fill in before a visit",
        "7": "Regular activity can lower stress and help you relax and sleep"
      },
      "note": "If it isn’t easing, or you’re struggling to get through the day, tell your diabetes team or your doctor rather than waiting it out.",
      "figure": {
        "body": "If you’re thinking about harming yourself, call or text 9-8-8, Canada’s Suicide Crisis Helpline, any time of day or night. If your safety is at risk right now, call 911.",
        "routes": {
          "1": {
            "prompt": "If it isn’t easing, or you’re struggling to get through the day",
            "chips": {
              "1": "Tell your diabetes team",
              "2": "Tell your doctor"
            }
          },
          "2": {
            "prompt": "If you’d like to talk with a mental health provider",
            "chips": {
              "1": "Mental Health + Diabetes Directory"
            },
            "detail": "Run by Breakthrough T1D. It lists registered mental health providers."
          }
        }
      }
    },
    "6": {
      "title": "Flying with diabetes supplies",
      "items": {
        "1": "Keep insulin and your supplies in your carry-on. Diabetes Canada says not to put insulin in checked luggage, because temperature changes can damage it",
        "2": "Insulin, and juice or gel to treat a low, can go through security in amounts over 100 mL. Declare them to the screening officer separately",
        "3": "Syringes are allowed with the needle guard on, as long as you’re carrying the medicine they’re for",
        "4": "Pumps and sensors are allowed. Diabetes Canada says not to wear them through the body scanner or put a pump through the X-ray machine. You can ask for a physical search instead, in private if you like",
        "5": "You don’t have to tell screening staff you have diabetes, and you don’t have to take off your pump. Just tell the screening officer you’re wearing one",
        "6": "CATSA suggests keeping medicine in its labelled packaging. Diabetes Canada suggests a letter from your doctor and a list of your medicines from your pharmacist",
        "7": "Pack spare insulin and supplies. In the heat, keep insulin in an insulated bag. In the cold, keep it close to your body so it doesn’t freeze"
      },
      "note": "Crossing time zones can change when you take insulin or diabetes pills. Plan it with your doctor or diabetes educator before you go.",
      "figure": {
        "containers": {
          "1": {
            "label": "In your carry-on"
          },
          "2": {
            "label": "At security"
          },
          "3": {
            "label": "Papers to bring"
          }
        }
      }
    },
    "7": {
      "title": "Driving",
      "items": {
        "1": "These steps are for people who take insulin, or a diabetes pill that can cause lows",
        "2": "Diabetes Canada suggests checking your blood sugar right before you drive, any time you feel low, and at least every 4 hours while driving, or wearing a real-time sensor",
        "3": "Don’t start driving if your blood sugar is below 4.0 mmol/L",
        "4": "After treating a low, wait at least 40 minutes, and until your blood sugar is at least 5.0 mmol/L, before you drive",
        "5": "If a low starts while you’re driving, stop somewhere safe, take the keys out of the ignition and treat it. The 40-minute wait applies here too",
        "6": "Keep fast-acting sugar within reach of the driver’s seat, and your meter and supplies with you",
        "7": "If you no longer feel the early signs of a low, or you’ve had a severe low in the past year, Diabetes Canada’s guideline says to check right before you drive and at least every 2 hours while driving, or wear a real-time sensor",
        "8": "A severe low is one where you pass out or need someone else’s help. If you have one while driving, the guideline says to stop driving right away. Tell your health-care provider and your driver licensing office right away, and do the same if you have more than one severe low while awake in the past 6 months. Your provider may tell you not to drive",
        "9": "You have the right to be assessed for a driver’s licence as an individual. Licensing is handled by each province and territory"
      },
      "note": "Diabetes Canada uses 3.9 for a low in most of its guidance, and 4.0 for driving. This card uses 4.0 because the driving guideline does. If your team gave you a number, use theirs.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Before you drive"
          },
          "2": {
            "heading": "If you’re low"
          },
          "3": {
            "heading": "If lows are harder to spot"
          }
        }
      }
    },
    "8": {
      "title": "Your feet, every day",
      "items": {
        "1": "Diabetes can damage the nerves and blood flow in your feet, so you may not feel a blister or cut, and it can be slower to heal",
        "2": "Wash your feet in warm, not hot, water and dry them well, especially between the toes",
        "3": "Check your feet and between your toes for cuts, blisters or changes. Use a hand mirror for the soles, or ask someone to help",
        "4": "Put lotion on your heels and soles, but not between your toes. Trim your nails straight across, not too short",
        "5": "Wear clean socks and well-fitting shoes. Test bath water with your hand before you step in",
        "6": "Have your bare feet checked by your doctor or a foot-care specialist, such as a podiatrist, chiropodist or foot-care nurse. Ask them to check for nerve damage and blood flow too",
        "7": "See your doctor or a foot-care specialist right away for swelling, warmth, redness or pain in your feet or legs, or for corns, calluses, ingrown toenails, warts or slivers. Don’t treat these yourself. An open sore (a foot ulcer) or signs of infection need care promptly, even if they don’t hurt",
        "8": "Don’t go barefoot, even indoors. Don’t use over-the-counter corn or wart treatments, or put hot water bottles or heating pads on your feet"
      },
      "note": "If you’ve been told your feet are at high risk, you may need checks more often, and shoes fitted by a professional.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Every day"
          },
          "2": {
            "heading": "At least once a year"
          },
          "3": {
            "heading": "See someone right away"
          },
          "4": {
            "heading": "Don’t"
          }
        }
      }
    },
    "9": {
      "title": "Your eyes",
      "items": {
        "1": "Diabetes can damage the small blood vessels in the retina, at the back of the eye. This is called diabetic retinopathy",
        "2": "It often goes unnoticed until it affects your sight, so regular exams matter even when you see well",
        "3": "An optometrist or ophthalmologist does the exam, often after drops that widen your pupils",
        "4": "Diabetes Canada’s guideline: with type 1, from age 15, a yearly exam starting 5 years after diagnosis. With type 2, an exam at diagnosis, then every 1 to 2 years if it finds little or no retinopathy. For a child under 15, ask your child’s team",
        "5": "The Canadian Ophthalmological Society suggests an exam at least once a year, and in the first trimester if you’re pregnant",
        "6": "See an eye doctor right away if you notice dark spots, blurred, distorted or double vision, or large floaters",
        "7": "Found early, retinopathy can often be treated successfully, and treatment can keep your sight from getting worse. Sight that has already been lost can’t be restored, which is why early exams matter",
        "8": "Keeping your blood sugar, blood pressure and cholesterol in range helps protect your eyes"
      },
      "note": "The two Canadian sources on this card suggest different schedules. Your eye-care professional and diabetes team decide yours, and can share your results with each other.",
      "figure": {
        "columns": {
          "1": {
            "heading": "How often"
          },
          "2": {
            "heading": "See someone right away"
          }
        }
      }
    },
    "10": {
      "title": "Your kidneys",
      "items": {
        "1": "Diabetes is the leading cause of kidney disease in Canada. Up to half of people with diabetes will have signs of kidney damage in their lifetime",
        "2": "Good diabetes management and regular screening can prevent or delay the loss of kidney function",
        "3": "Most people have no symptoms early on, so screening is how kidney disease is found",
        "4": "Screening is two tests: a urine test (ACR) that looks for protein, and a blood test (eGFR) that shows how well your kidneys are working",
        "5": "With type 2, screening starts at diagnosis. With type 1, it starts 5 years after diagnosis. After that, it’s once a year",
        "6": "Keeping your blood sugar and blood pressure at target, not smoking, and taking your medicines as prescribed all help protect your kidneys",
        "7": "If you have kidney disease, a dietitian can tell you whether to change how much protein, potassium, phosphate or salt you eat"
      },
      "note": "Ask your team for your ACR and eGFR results, and what they mean for you. Children follow their own schedule, so ask your child’s team."
    },
    "11": {
      "title": "Your heart: the ABCDEs",
      "items": {
        "1": "Diabetes raises the risk of heart disease and stroke. Heart disease may come 15 years earlier than in people without diabetes",
        "2": "You can lower that risk considerably by working on all your risk factors with your team. Diabetes Canada sums them up as the ABCDEs",
        "3": "A1C is a blood test that shows your average blood sugar over time. Most people aim for 7% or less",
        "4": "Most people aim for a blood pressure below 130/80",
        "5": "The usual LDL (“bad”) cholesterol target is below 2.0 mmol/L",
        "6": "Some medicines protect the heart. Ask your team whether any are right for you",
        "7": "Regular physical activity and healthy eating",
        "8": "Screening for complications in your heart, feet, kidneys and eyes; stopping smoking, with help if you want it; and self-management, including handling stress",
        "9": "Diabetes Canada suggests having your blood pressure checked at every diabetes visit, your A1C every 3 months, and your cholesterol every year, or more often if you take medicine to lower it"
      },
      "note": "Your targets are yours to set with your team. Diabetes Canada notes that A1C targets are different in pregnancy, for older adults and for children 12 and under.",
      "figure": {
        "columns": {
          "1": {
            "heading": "A · A1C"
          },
          "2": {
            "heading": "B · Blood pressure"
          },
          "3": {
            "heading": "C · Cholesterol"
          },
          "4": {
            "heading": "D · Drugs to protect your heart"
          },
          "5": {
            "heading": "E · Exercise and eating"
          },
          "6": {
            "heading": "S · Screening, smoking, self-management"
          }
        }
      }
    },
    "12": {
      "title": "Work and your rights",
      "items": {
        "1": "Diabetes Canada’s position is that people with diabetes should be eligible for any job they’re qualified for",
        "2": "It also says people should have the right to look after their diabetes in public places",
        "3": "It says people with diabetes have the right to care that supports the best quality of life wherever they are, including in hospital and long-term care",
        "4": "For a driver’s licence, you have the right to be assessed as an individual. More in Driving",
        "5": "Coverage for medicines, supplies and devices varies across Canada, and you may be eligible for the Disability Tax Credit",
        "6": "Diabetes Canada’s information and support line is 1-800-226-8464"
      },
      "note": "Diabetes Canada publishes position statements on employment, insurance and self-care in public places. They’re linked from its rights pages."
    }
  },
  "programsBand": {
    "heading": "Your checkup year",
    "cards": {
      "1": {
        "heading": "Eyes",
        "body": "Type 1, from age 15: an eye exam every year, starting 5 years after diagnosis. Type 2: an exam at diagnosis, then every 1 to 2 years if it finds little or no retinopathy. For a child under 15, ask your child’s team. Your team may set a different schedule: see Your eyes."
      },
      "2": {
        "heading": "Kidneys",
        "body": "A urine test (ACR) and a blood test (eGFR) once a year: from diagnosis with type 2, and from 5 years after diagnosis with type 1. See Your kidneys."
      },
      "3": {
        "heading": "Feet",
        "body": "A bare-foot check by your doctor or a foot-care specialist at least once a year, including nerves and blood flow, and more often if you’re at high risk. In between, check them yourself every day: see Your feet, every day."
      },
      "4": {
        "heading": "Heart",
        "body": "Blood pressure at every diabetes visit, A1C about every 3 months or as your team advises, and cholesterol once a year. See Your heart: the ABCDEs."
      }
    }
  },
  "pharmacist": {
    "eyebrow": "Anywhere in Canada",
    "heading": "Travelling with a pump or sensor?",
    "body": "Liivv’s pharmacist CDEs answer pump and CGM supply questions for all of Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. Your targets, your medicines and your checkups belong with your diabetes team.",
    "cta": "Request a call"
  },
  "closing": {
    "heading": "A life, not a list",
    "body": "Most of this becomes routine: a look at your feet, some movement most days, a few checkups a year. The rest is knowing who to ask."
  },
  "governance": {
    "disclaimer": "This is general information, not medical advice, and it is not a substitute for care from your diabetes team, doctor or pharmacist. Your targets, your medicines and your checkup schedule depend on you. Your team sets them."
  },
  "urgentExit": {
    "lead": "Emergencies with lows and highs are in Staying Safe, under",
    "link": "Get emergency care now"
  }
}
```

---

## C) CLAIMS TABLE (after source check)

Key paths are relative to `DiabetesCare.chapters.every-day-living`. "Fact on the page" paraphrases what was read on the live page or PDF on 2026-10-05 (copies in `scratchpad/src/edl/`). Sentences with no factual claim (headings, the intro, "ask your team" lines, closing) are listed at the end.

| Key | Sentence (short) | SourceId | Fact on the page |
|---|---|---|---|
| categoriesIntro.body s2 | Checkups find changes early | dc-cpg-ch30-retinopathy; dc-kidney-disease | Ch30: retinopathy often unnoticed until vision loss, so regular exams; Kidney: screening detects problems as early as possible |
| 1.items.1 | Several eating styles work: Mediterranean, Nordic, DASH, vegetarian | dc-cpg-ch11-nutrition-therapy | Key messages for people: those four styles "contain the key elements of a diabetes-friendly diet" |
| 1.items.2 | Vegetables, fruit, whole grains, protein; plant protein more often | hc-healthy-eating-recommendations | Same list, "Choose protein foods that come from plants more often" |
| 1.items.3 | Water as drink of choice | hc-healthy-eating-recommendations | "Make water your drink of choice" |
| 1.items.4 | Whole, less processed foods over sugary drinks, fast food, refined grains | dc-cpg-ch11-nutrition-therapy; hc-healthy-eating-recommendations | Ch11 key message names sugar-sweetened beverages, fast foods, refined grain products; HC: limit highly processed foods |
| 1.items.5 | Notice hunger and fullness | hc-healthy-eating-recommendations; dc-carb-counting-sheet-2025 | HC: notice when you are hungry and full; sheet: listen to hunger and fullness cues |
| 1.items.6 | Culture and food traditions | hc-healthy-eating-recommendations | "Culture and food traditions can be a part of healthy eating" |
| 1.note | Dietitian plan fitting culture, tastes, goals | dc-cpg-ch11-nutrition-therapy | Key message: a registered dietitian can develop a personalized plan considering culture and nutritional preferences |
| 2.items.1 | Learn to count carbs; amount at one time usually matters | dc-cpg-ch11-nutrition-therapy | Key message: "Consider learning how to count carbohydrates" because quantity at one time is usually important |
| 2.items.2 | Carbs become sugar; kind and amount matter | dc-carb-counting-sheet-2025 | Body breaks carbohydrate into glucose, raising blood sugar; type and amount both matter |
| 2.items.3 | Where carbs are; foods with little | dc-carb-counting-sheet-2025 | Step 2 lists grains/starches, fruits, some vegetables, legumes, milk and alternatives, sweet and prepared foods; meat and alternatives, most vegetables, fats have little |
| 2.items.4 | ~45–60 g a meal, 15–30 g a snack for most; dietitian/CDE sets yours | dc-carb-counting-sheet-2025 | Step 3: CPG suggests 45–60% of calories, about 45–60 g a meal or 15–30 g at snacks "for most people"; a dietitian or CDE can help set a goal |
| 2.items.5 | Within 5 g of goal | dc-carb-counting-sheet-2025 | "Aim to meet your target within 5 grams per meal or snack" |
| 2.items.6 | Serving size; subtract fibre, 36 − 6 = 30 | dc-carb-counting-sheet-2025 | Nutrition Facts panel: check serving size; subtract fibre (36 g − 6 g = 30 g available) |
| 2.note | Insulin with meals: plan with team | dc-carb-counting-sheet-2025 | Step 5: work with your health-care team on monitoring and changes. No insulin maths on the page or here |
| 3.items.1 | ≥150 min/week aerobic; examples | dc-cpg-ch10-physical-activity; dc-exercise-and-activity | Ch10 key messages: at least 150 min/week aerobic; DC page: walking, swimming, bicycling, dancing raise breathing and heart rate |
| 3.items.2 | ≥3 days, no more than 2 days in a row off | dc-cpg-ch10-physical-activity; dc-exercise-and-activity | Ch10 rec: spread over at least 3 days, no more than 2 consecutive days without; DC page: same 2-day line |
| 3.items.3 | Start at 5–10 min/day; less still helps | dc-exercise-and-activity; dc-cpg-ch10-physical-activity | DC page: start with 5 to 10 minutes per day; Ch10: smaller amounts still have some benefits |
| 3.items.4 | Strength ≥2×/week; instruction first | dc-cpg-ch10-physical-activity; dc-exercise-and-activity | Ch10: at least 2 sessions a week, instruction from a qualified specialist; DC page: 2–3 times a week, weights, bands, body weight |
| 3.items.5 | Up every 20–30 min | dc-cpg-ch10-physical-activity | Key message: interrupt sitting every 20 to 30 minutes |
| 3.items.6 | Inactive → doctor before more than a brisk walk; breathlessness or chest pain → stop the activity | dc-exercise-and-activity | "Safety first" list: "talk to your doctor before starting any exercise program that is more strenuous than a brisk walk"; "Stop the activity…if you are short of breath or have chest pain". The page's "and speak to your doctor" is left out because, alone, it can delay emergency care (verify S1); the 911 escalation is HELD (E1b, D4) |
| 3.items.7 | Lows up to 48 h; check if on insulin or other glucose-lowering medicines; carry fast sugar | dc-exercise-and-activity | Same three lines in "Safety first" |
| 4.items.1 s1 | Sheet: general rule, no need to avoid alcohol | dc-alcohol-and-diabetes-2018; dc-diabetes-and-drinking-2019 | Sheet: "As a general rule, there is no need to avoid alcohol because you have diabetes"; article: "as a general rule, you can". Now attributed to the sheet, since the 2023 guideline is stricter (verify S7) |
| 4.items.1 s2 | If you don't drink, healthier not to start | dc-cpg-ch18-mental-health-2023 | Key messages for people: "If you currently do not drink alcohol, it is a healthier decision to not start" |
| 4.items.1 s3 | Talk with your team | dc-alcohol-and-diabetes-2018 | Sheet: discuss with your health-care team |
| 4.items.2 | Don't-drink list | dc-alcohol-and-diabetes-2018 | "You should not drink alcohol if you": pregnant or trying, breastfeeding, personal or family history of drinking problems, "are planning to drive or engage in other activities that require attention or skill", certain medications (ask your pharmacist). Copy now carries the attention-or-skill qualifier |
| 4.items.3 | Lows up to 24 h on insulin/some medicines; carbs, bedtime check, someone knows how to help, including calling 911 if you pass out | dc-alcohol-and-diabetes-2018 | "For those on insulin or some diabetes medications"; delayed low up to 24 h; eat carbohydrate-rich foods; check before bed; someone with you knows how to treat a low and "to call an ambulance if you pass out". The sheet's glucagon-and-alcohol line is not repeated here (D15) |
| 4.items.4 | Alternate with water to avoid dehydration | dc-diabetes-and-drinking-2019 | "alternate between water and alcohol to reduce your risk of becoming dehydrated" |
| 4.items.5 s1 | 2018 nutrition guideline gives higher limits than the 2023 guidance | dc-cpg-ch11-nutrition-therapy; ccsa-alcohol-guidance-2023 | Ch11 (2018): ≤2/day and <10/week (women), ≤3/day and <15/week (men); CCSA 2023: 2 or fewer a week to likely avoid consequences. No numbers in the copy (R10) |
| 4.items.5 s2a | DC 2023: if you drink, cutting down lowers the risk to your health | dc-cpg-ch18-mental-health-2023 | Key messages for people: "For people who drink alcohol, it is imperative to reduce intake to minimize adverse health outcomes". Its "maximum of 2 standard drinks per week" is not stated (R10) |
| 4.items.5 s2b | Less is better | ccsa-alcohol-guidance-2023 | "when it comes to drinking alcohol, less is better" |
| 4.items.5 s3 | Your team can help you cut down | dc-cpg-ch18-mental-health-2023 | "Ask your health-care provider for support if you wish to reduce your alcohol" intake |
| 4.items.6 | Cannabis not recommended; T1 avoid, DKA | dc-cannabis-position-2020 | Recs 2 and 3, as worded |
| 4.items.7 | Edibles carbs; appetite; adults who use it should be offered advice on lowering risks | dc-cannabis-position-2020 | Cautions: edibles containing carbohydrates and appetite-stimulating effects; rec 4: adults who intend to use cannabis should receive individualized counselling with a harm-reduction focus. Copy now says "adults" |
| 4.note | Providers should discuss substance use regularly, non-judgementally | dc-cannabis-position-2020 | Rec 1, as worded |
| 5.items.1 | Burden; distress, low moods, anxiety | dc-taking-care-of-mental-health | Opening paragraph, as worded |
| 5.items.2 s1 | Angry, guilty, frightened, discouraged | dc-taking-care-of-mental-health | Same list on the page |
| 5.items.2 s2 | Valid responses | dc-cpg-ch18-mental-health-2023 | Key messages for people: "accept your emotions as valid responses to a chronic condition" |
| 5.items.3 | Depression more common; effective treatments | dc-taking-care-of-mental-health; dc-cpg-ch18-mental-health-2023 | DC page: depression more common than in the general population; Ch18: "There are effective treatments" |
| 5.items.4 | Eating, sleeping, stress problems common; tell team | dc-cpg-ch18-mental-health-2023 | Key messages for people: "Eating, sleeping, and stress-related problems are also common. Speak to your health-care providers" |
| 5.items.5 | Fear of lows; help exists | dc-cpg-ch18-mental-health-2023 | Key messages: persistent fear of hypoglycemic episodes; addressing fear of hypoglycemia is helpful |
| 5.items.6 | Everyone and parents/caregivers screened; questionnaire before visit | dc-cpg-ch18-mental-health-2023 | Screening key message (all individuals, and parents or caregivers of youth); patient key message: questionnaires can be completed before your appointment |
| 5.items.7 | Activity lowers stress; relaxation and sleep | dc-exercise-and-activity | Benefits list: "Decreased stress", "Improved relaxation and sleep" |
| 5.note | Tell your team or doctor | dc-taking-care-of-mental-health | "we recommend that you reach out to your healthcare team regarding any mental health concerns" |
| 5.figure.body | Call or text 9-8-8 any time; safety at risk, 911 | 988-suicide-crisis-helpline | Call or text 9-8-8, "24 hours a day, every day of the year"; "If your safety is at risk, call 9-1-1 right away". Written "911" to match the site (Staying Safe, Ostomy) |
| 5.figure.routes.1 | Team / doctor | dc-taking-care-of-mental-health | As 5.note |
| 5.figure.routes.2 | Mental Health + Diabetes Directory, Breakthrough, registered providers | bt1d-mental-health-support | The Directory "provide[s]… information about registered mental health providers" |
| 6.items.1 | Carry-on; not checked luggage, temperature | dc-air-travel; catsa-diabetic-supplies | DC: "Do not place insulin in your checked luggage as the temperature fluctuations can damage it"; CATSA: permitted in carry-on |
| 6.items.2 | Insulin, juice, gel over 100 mL; declare separately | catsa-diabetic-supplies; dc-air-travel | CATSA: exempt from liquid restrictions; juice and gel permitted; "must be declared to the Screening Officer separately" |
| 6.items.3 | Syringes: guard on, with the medicine | catsa-diabetic-supplies | "the needle guard must be in place"; must possess the medication |
| 6.items.4 | Pumps and sensors allowed; not through body scanner or X-ray; physical search, private | catsa-diabetic-supplies; dc-air-travel | CATSA: pumps and CGMs permitted; DC: don't wear pump or CGM through body scanner or put pump through X-ray; ask for a physical search, private location if you wish |
| 6.items.5 | No need to disclose; no need to remove pump; tell officer | dc-air-travel | "not required to disclose"; "not required to remove your insulin pump… Just inform the Screening Officer" |
| 6.items.6 | Labelled packaging; doctor's letter; medicine list from pharmacist | catsa-diabetic-supplies; dc-air-travel | CATSA: recommends medication be properly labelled; DC: doctor's letter, list of medications from your pharmacist |
| 6.items.7 | Spares; insulated bag in heat; close to body in cold | dc-air-travel | "Storing insulin while travelling", as worded. The page's "30 days at room temperature" is left out (R4) |
| 6.note | Time zones: plan with doctor or educator | dc-air-travel | "discuss your meal and insulin schedule with your doctor or diabetes educator". Unit changes left out (dosing) |
| 7.items.1 | Scope: insulin or a pill that can cause lows | dc-cpg-ch21-driving; dc-drive-safe-card | Ch21 key messages: "If you take insulin and/or an insulin secretagogue"; card: "insulin or pills that can drop your blood sugar" |
| 7.items.2 | Check before, any time you feel low, and at least every 4 h, or rtCGM | dc-cpg-ch21-driving | Key message: "Consider measuring your blood glucose level immediately before driving, if you develop symptoms of hypoglycemia, and at least every 4 hours while driving"; rtCGM as an alternative |
| 7.items.3 | Don't start driving below 4.0 | dc-cpg-ch21-driving; dc-drive-safe-card | Rec: "should not drive when their BG level is <4.0 mmol/L"; card: "Do not start driving if below 4" |
| 7.items.4 | Wait at least 40 min and until at least 5.0 mmol/L | dc-cpg-ch21-driving | Rec: "should not drive until at least 40 minutes after successful treatment of hypoglycemia has increased their BG level to at least 5.0 mmol/L". Unit added |
| 7.items.5 | Stop safely, keys out, treat; the 40-minute wait applies | dc-cpg-ch21-driving | Key message: stop in a safe location, remove the keys, treat, "consider waiting 40 minutes before driving"; the rec's "at least 40 minutes" (7.items.4) applies to any treated low |
| 7.items.6 | Fast sugar within reach; meter and supplies | dc-cpg-ch21-driving; dc-drive-safe-card | Rec: monitoring equipment and rapid carbohydrate within easy reach; card: keep fast-acting sugar where you can reach it |
| 7.items.7 | Unawareness or a severe low in the past year: before and every 2 h, or rtCGM | dc-cpg-ch21-driving | Rec: "hypoglycemia unawareness or history of severe hypoglycemia in the past 12 months must measure… immediately before and at least every 2 hours… or wear a real-time CGM device"; key message says "recurrent" |
| 7.items.8 s1 | Severe low = pass out or need help | dc-cpg-ch21-driving | Key message: "associated with loss of consciousness or needing help from another person" |
| 7.items.8 s2 | Severe low while driving: stop driving right away | dc-cpg-ch21-driving | Rec: "Must refrain from driving immediately if they experience severe hypoglycemia while driving" (verify S2) |
| 7.items.8 s3 | Tell provider and licensing office right away; same for more than 1 severe low while awake in the past 6 months | dc-cpg-ch21-driving | Key message for people: "Immediately notify your health-care provider and your driving licensing body" (private driver: 6 months; commercial: 12). The rec says provider "no longer than 72 hours" (D2) |
| 7.items.8 s4 | Your provider may tell you not to drive | dc-cpg-ch21-driving | Rec: health-care professionals "should inform people with diabetes… to no longer drive" after either event |
| 7.items.9 | Individual assessment; provincial licensing | dc-driving-and-diabetes | Right to be assessed on an individual basis; provincial motor vehicle licensing authorities |
| 7.note | 3.9 generally, 4.0 for driving | dc-cpg-ch14-hypoglycemia-2023; dc-cpg-ch21-driving | Ch14 2023: levels defined at 3.9; Ch21: do not drive <4.0 (D1) |
| 8.items.1 | Nerves and blood flow; may not feel injury; slower to heal | dc-foot-care-sheet-2025; dc-cpg-ch32-foot-care; wounds-canada-diabetic-foot-ulcers | Sheet and Ch32 key messages, same wording; Wounds Canada explains neuropathy and PAD |
| 8.items.2 | Warm not hot; dry between toes | dc-foot-care-sheet-2025 | Daily foot care list |
| 8.items.3 | Check incl. between toes; mirror or help | dc-foot-care-sheet-2025 | "ASSESS… LOOK in a hand mirror… (or ask for help)" |
| 8.items.4 | Lotion heels and soles, not between toes; nails straight across, not too short | dc-foot-care-sheet-2025 | Daily foot care list |
| 8.items.5 | Clean socks, well-fitting shoes; test bath water | dc-foot-care-sheet-2025; dc-cpg-ch32-foot-care | Sheet daily list; sheet and Ch32 key messages: test bath water with your hand |
| 8.items.6 + column "At least once a year" | Bare-foot check yearly by doctor or podiatrist/chiropodist/foot-care nurse; nerve and blood-flow screen | dc-foot-care-sheet-2025; dc-cpg-ch32-foot-care | Sheet: "at least once a year or more often if… high risk"; ask to screen for nerve damage and poor blood flow at least once a year; Ch32 rec: exam at least annually |
| 8.items.7 s1–2 | Right away: swelling; warmth, redness or pain in feet or legs; corns, calluses, ingrown nails, warts, slivers; don't self-treat | dc-foot-care-sheet-2025 | Sheet: "If you have any of the following, see your doctor or a foot-care specialist right away"; "warmth, redness or pain in feet or legs"; "Do not try to treat them yourself" |
| 8.items.7 s3 | Open sore (ulcer) or signs of infection need care promptly, even without pain | dc-cpg-ch32-foot-care | Rec: "People with diabetes who develop a foot ulcer or show signs of infection even in the absence of pain should be treated promptly" (verify S4) |
| 8.items.8 | Not barefoot even indoors; no OTC corn/wart treatments; no hot water bottles or heating pads | dc-foot-care-sheet-2025 | "DON'T" column, as worded |
| 8.note | High risk: more often; professionally fitted shoes | dc-foot-care-sheet-2025; dc-cpg-ch32-foot-care | Sheet: more often if told high risk; Ch32 rec: high risk → professionally fitted footwear |
| 9.items.1 | Retinopathy: retinal blood vessels | dc-cpg-ch30-retinopathy; cos-diabetic-retinopathy | Ch30 key message; COS: damage to retinal blood vessels |
| 9.items.2 | Often unnoticed until sight affected | dc-cpg-ch30-retinopathy; cos-diabetic-retinopathy | Ch30: "often goes unnoticed until vision loss occurs"; COS: few symptoms until very advanced |
| 9.items.3 | Optometrist or ophthalmologist; often dilating drops | dc-cpg-ch30-retinopathy | Rec: "experienced vision care professional (optometrist or ophthalmologist)"; key message: "comprehensive dilated eye exam" (rec also allows undilated wide-field imaging, hence "often") |
| 9.items.4 | T1 ≥15: yearly from 5 y; T2: at diagnosis, then 1–2 y if no/minimal; under 15: ask the child's team | dc-cpg-ch30-retinopathy | Recs 1 and 2, as worded. The recs start type 1 screening at age 15, so the copy sends younger children to their team (no claim) |
| 9.items.5 | COS: at least yearly; first trimester | cos-diabetic-retinopathy | "at least once a year"; pregnant: first trimester |
| 9.items.6 | Right away: dark spots, blurred/distorted/double vision, large floaters | cnib-diabetic-retinopathy | "see your eye doctor immediately" list |
| 9.items.7 | Found early, often treated successfully; lost sight can't be restored | cnib-diabetic-retinopathy | "Sight lost from diabetic retinopathy can't be restored, but with early detection, treatment is often very successful and can prevent your sight from getting worse" |
| 9.items.8 | Blood sugar, BP, cholesterol protect eyes | cos-diabetic-retinopathy; dc-cpg-ch30-retinopathy | COS: control blood sugar, BP and cholesterol; Ch30 rec: glucose and BP |
| 9.note | Sources differ; team decides; share results | dc-cpg-ch30-retinopathy | Rec: results and follow-up communicated to all team members; key message: discuss frequency with your team and vision care professional |
| 10.items.1 | Leading cause; up to 50% | dc-kidney-disease; kfoc-end-diabetic-kidney-disease | DC: "leading cause of kidney disease in Canada"; "Up to 50%"; KFOC: up to 50% |
| 10.items.2 | Management and screening prevent or delay | dc-kidney-disease | "good diabetes management and regular kidney screening can prevent or delay the loss of kidney function" |
| 10.items.3 | No early symptoms | dc-kidney-disease | "Most people don't experience any symptoms in the early stages" |
| 10.items.4 | ACR urine (protein) and eGFR blood | dc-kidney-disease; dc-cpg-ch29-ckd-2025 | Page explains both tests; Ch29 key message: blood and urine tests |
| 10.items.5 | T2 at diagnosis; T1 at 5 years; then yearly | dc-kidney-disease; dc-cpg-ch29-ckd-2025; kfoc-end-diabetic-kidney-disease | DC page, as worded; Ch29 recs; KFOC: test once a year |
| 10.items.6 | Targets, no smoking, medicines as prescribed | dc-kidney-disease | Prevention list (also cholesterol, meal plan, exercise) |
| 10.items.7 | Dietitian on protein, potassium, phosphate, salt | dc-kidney-disease | "limit protein foods or foods high in potassium, phosphate or sodium… see a registered dietitian" |
| 10.note s1 | Ask for ACR and eGFR | dc-cpg-ch29-ckd-2025 | Key message: ask your team about your eGFR and urine ACR |
| 10.note s2 | Children's own schedule | dc-cpg-ch29-ckd-2025 | Type 1 onset at an earlier age: screening starts after puberty |
| 11.items.1 | Higher risk; 15 years earlier | dc-heart-disease-and-stroke | "may develop heart disease 15 years earlier" |
| 11.items.2 | Lower risk considerably; ABCDEs | dc-heart-disease-and-stroke | "can lower their risk… considerably by paying careful attention to all of their risk factors"; the page's "ABCDEs" spelling (verify S10) |
| 11.items.3 | A1C ≤7% for most | dc-heart-disease-and-stroke | "Most people should aim for an A1C of seven per cent or less" |
| 11.items.4 | BP <130/80 | dc-heart-disease-and-stroke | "less than 130/80" |
| 11.items.5 | LDL <2.0 | dc-heart-disease-and-stroke | "less than 2.0 mmol/L" |
| 11.items.6 | Heart-protecting medicines: ask team | dc-heart-disease-and-stroke | "Speak with your health-care team about medication to protect against heart attack and stroke". Classes named on the page are left out (D11) |
| 11.items.7 | Exercise and eating | dc-heart-disease-and-stroke | "E – Exercise & Eating" |
| 11.items.8 | Screening, smoking, self-management incl. stress | dc-heart-disease-and-stroke | The three S lines |
| 11.items.9 | BP every visit, A1C every 3 months, lipids yearly or more often on cholesterol medicine | dc-heart-disease-and-stroke | "Keep tabs on your health" list: lipids "every year (more often if you are on cholesterol-lowering medications)". No class named |
| 11.note | A1C targets differ in pregnancy, older adults, children ≤12 | dc-heart-disease-and-stroke | Footnote: "Discuss your target values with your health-care team. Note that A1C targets for pregnant women, older adults and children 12 years of age and under are different." Copy narrowed to A1C |
| 12.items.1 | Eligible for any job qualified for | dc-rights-of-people-living-with-diabetes | "Employment discrimination" entry |
| 12.items.2 | Self-care in public | dc-rights-of-people-living-with-diabetes | "People should have the right to engage in diabetes self-care practices in public" |
| 12.items.3 | Care wherever, incl. hospital and long-term care | dc-rights-of-people-living-with-diabetes | "Your right to care everywhere": public, hospital or other institutional settings; long-term care residents deserve quality care |
| 12.items.4 | Individual licence assessment | dc-driving-and-diabetes; dc-rights-of-people-living-with-diabetes | Both pages |
| 12.items.5 | Coverage varies; may be eligible for DTC | dc-rights-of-people-living-with-diabetes | "coverage varies by government"; "You may be eligible for the Disability Tax Credit" |
| 12.items.6 | 1-800-226-8464 | dc-driving-and-diabetes | "For information: 1-800-BANTING (226-8464)"; the same number is the "Information & Support" line on every DC page |
| 12.note | Position statements on employment, insurance, self-care in public | dc-driving-and-diabetes | Links "Position on insurance", "Position on employment", "Position on Diabetes Self-Care in Public Places" |
| programsBand.cards.1 | Eye schedule; under 15, ask the child's team | dc-cpg-ch30-retinopathy | As 9.items.4 |
| programsBand.cards.2 | Kidney schedule | dc-cpg-ch29-ckd-2025; dc-kidney-disease | As 10.items.4–5 |
| programsBand.cards.3 | Foot check yearly incl. nerves and blood flow; more if high risk; daily self-check | dc-foot-care-sheet-2025; dc-cpg-ch32-foot-care | As 8.items.3, 8.items.6, 8.note |
| programsBand.cards.4 | BP each visit, A1C about every 3 months or as the team advises, cholesterol yearly | dc-heart-disease-and-stroke; dc-cpg-ch9-monitoring-2021 | DC Heart "Keep tabs"; Ch9 rec: A1C "approximately every 3 months" in most individuals, with other intervals appropriate in some circumstances |
| pharmacist.body | CDE hours and scope | owner (2026-10-05) | Not clinical; same as Staying Safe |
| shelf.groups.1.links.1 | 9-8-8: call or text, 24/7, English and French; if your safety is at risk, call 911 | 988-suicide-crisis-helpline | "call or text 9-8-8, 24/7"; "If your safety is at risk, call 9-1-1 right away" |
| shelf.groups.1.links.2 | Distress, low moods, anxiety; reach out to your team | dc-taking-care-of-mental-health | Diabetes distress, low moods and anxiety; reach out to your healthcare team |
| shelf.groups.1.links.3 | Directory with information about registered mental health providers; caregiver guide for parents of children and teens with T1D | bt1d-mental-health-support | Directory "about registered mental health providers"; the Caregiver Guide "for parents and caregivers of children and adolescents living with T1D" (FR page, Percée DT1, read 2026-10-06) |
| shelf.groups.2.links.1 | Insulin, juice and gels over 100 mL; declare them | catsa-diabetic-supplies | Exempt from the liquid limit, declare to the screening officer (EN and FR pages, modified 2025-12-29) |
| shelf.groups.2.links.2 | Insulin in carry-on; pumps and sensors at screening; packing | dc-air-travel | Insulin in carry-on, never checked; pump/CGM not through the body scanner, ask for a physical search; spare supplies |
| shelf.groups.2.links.3 | Planning a trip; travel insurance | dq-trips | Two sections: planning your trip, buying travel insurance (EN "Trips", FR « Voyages », read 2026-10-06) |
| shelf.groups.3.links.1 | Rights at work, in public, in hospital and long-term care | dc-rights-of-people-living-with-diabetes | Any job you are qualified for; self-care in public; care everywhere including hospital and long-term care |
| shelf.groups.3.links.2 | Federally regulated employer or service; helps you find where to go, such as a provincial or territorial commission | chrc-human-rights-complaints | Federal screening body; complaint needs "the name of the federally regulated organization"; helps people work out where to go, including "a provincial or territorial human rights commission or tribunal" (read 2026-10-06) |
| shelf.groups.4.links.1 | Free live online sessions led by registered health professionals; newly diagnosed or refresher | dc-virtual-diabetes-education-program | Free; monthly live virtual sessions facilitated by registered health professionals; for newly diagnosed or a refresher (read 2026-10-06) |
| shelf.groups.4.links.2 | Questions answered by Diabetes Québec’s health professionals by phone, email or chat; not an emergency service, call 911 | dq-infodiabetes-service | "health professionals"; phone, email or chat; "not emergency services. If you need emergency help, dial 911" (read 2026-10-06). No fee stated, so the shelf does not say free |

No claim (needs no source): title, heroBody, focus, vibe, categoriesIntro eyebrow/heading/body s1 and s3, startHere, all `figure.columns` / `containers` headings, card 2 `figure.heading` and `fields`, 3.note, 6 container labels, closing, governance, urgentExit.

### C.2 Register notes from re-reading the pages (for `sources-review.ts`)

- **`dc-cpg-ch18-mental-health-2023`:** its key messages for people now say "a maximum of 2 standard drinks per week" and "If you currently do not drink alcohol, it is a healthier decision to not start". That is Diabetes Canada's own newer guideline agreeing with CCSA 2023 against Ch11 (2018), the 04/18 sheet and the 2019 article. Add to the locator; it bears directly on R10. It also says "Eating, sleeping, and stress-related problems are also common", which this chapter uses.
- **`dc-cpg-ch21-driving`:** the key messages for people say "Immediately notify" the provider **and the licensing body**; the recommendation says provider "no longer than 72 hours". The key messages say "It is suggested to wait for 40 minutes"; the recommendation says "at least 40 minutes". The chapter follows the recommendation for the wait and the key message for notifying (D2).
- **`dc-exercise-and-activity`:** also carries 150 min/week, start with 5–10 min/day, no more than 2 consecutive days off, resistance 2–3 times a week, "talk to your doctor before… more strenuous than a brisk walk", "Stop… if you are short of breath or have chest pain", and benefits including "Decreased stress" and "Improved relaxation and sleep". The medical-ID line names a brand (MedicAlert).
- **`dc-taking-care-of-mental-health`:** the page footer reads "supported by an unrestricted educational grant from Sanofi". Not industry-run, but record it. The page links a "Find a mental health provider near you" directory whose description matches Breakthrough's word for word; where it points was not recorded (E).
- **`dc-air-travel`:** also says not to wear a pump or CGM through the body scanner or put a pump through the X-ray, that you need not disclose diabetes or remove your pump, and gives insulin-unit changes for time zones (dosing; not used).
- **`catsa-diabetic-supplies`:** "Date modified 2025-12-29". It names one specific pump system as an example of a permitted device; the chapter names none.
- **`dc-heart-disease-and-stroke`:** "15 years earlier" carries no "up to". "D" names ACE inhibitors, ARBs, statins, Aspirin and clopidogrel; the chapter names none.
- **`dc-kidney-disease`:** "Diabetes is the leading cause of kidney disease in Canada"; screening at type 2 diagnosis and 5 years after type 1 diagnosis, then yearly; no early symptoms.
- **`kfoc-end-diabetic-kidney-disease`:** a fundraising campaign page; the facts are in a "Did you know?" list. Fine as a second source, weak as a sole one.
- **`cnib-diabetic-retinopathy`:** the see-immediately list is dark spots; blurred, distorted or double vision; large floaters.
- **`dc-foot-care-sheet-2025`:** the DON'T column also has OTC insoles, tight socks or knee-highs, soaking, hot water bottles and heating pads, sitting or crossing legs for long periods, and smoking. "Right away" list includes warts and slivers.
- **`988-suicide-crisis-helpline`:** the locator says no Diabetes chapter shows the strip. Card 5 of this chapter does, with 911 as well, so update it when this ships. The page says "If your safety is at risk, call 9-1-1 right away."
- **`dc-cannabis-position-2020`:** rec 1 (non-judgemental discussion) and the edibles/appetite caution are on the page; add them to the locator. Rec 4 (harm-reduction counselling) is for **adults** who intend to use cannabis.
- **`dc-alcohol-and-diabetes-2018`** (added after the source check): the don't-drink list says "planning to drive or engage in other activities that require attention or skill"; the someone-with-you line includes "to call an ambulance if you pass out". The sheet also says glucagon will not work while alcohol is in the body; Staying Safe card 4 item 5 carries that line in the repo today (D15).
- **`dc-cpg-ch18-mental-health-2023`** (added after the source check): now cited on card 4 for "if you don't drink, it's healthier not to start", "reduce intake to minimize adverse health outcomes" and "Ask your health-care provider for support if you wish to reduce". Its "maximum of 2 standard drinks per week" is not used (R10).
- **`dc-cpg-ch32-foot-care`** (added after the source check): rec "a foot ulcer or show signs of infection even in the absence of pain should be treated promptly" is now cited on card 8 item 7.
- **`dc-cpg-ch9-monitoring-2021`** (added after the source check): A1C "approximately every 3 months" in most individuals; the band now says "about every 3 months or as your team advises".
- **`cnib-diabetic-retinopathy`** (added after the source check): "Sight lost from diabetic retinopathy can't be restored" is now used on card 9 item 7.
- **No registered source** gives the warning signs of a heart attack or stroke, or "call 911" for chest pain. Heart & Stroke Foundation pages would need registering before E1 and E1b can be released.

---

## D) OPEN RULINGS for the nurse

**2026-10-06:** the rows marked "ruled" are settled by [the clinical rulings record](clinical-rulings-2026-10-06.md); F.4 lists what changed. The D15 note below is out of date: the glucagon-and-alcohol line is back, in CPG Ch14 2023's wording, on Staying Safe card 4 only, and card 4 here keeps its pointer.

Site-wide defaults this chapter relies on (from Staying Safe):

| # | Default used | Where here | Note |
|---|---|---|---|
| R1 · **ruled 2026-10-06 ([C1](clinical-rulings-2026-10-06.md#c1))** | Low = below 3.9 site-wide | 7.note | This chapter uses 4.0 only on the driving card, because CPG Ch21 and the Drive Safe card do (D1). |
| R2 · **ruled 2026-10-06 ([C13](clinical-rulings-2026-10-06.md#c13))** | ½ cup juice | — | Not repeated here. |
| R3 · **ruled 2026-10-06 ([C4](clinical-rulings-2026-10-06.md#c4))** | Ketone ladder written for type 1 | — | Not repeated. Card 4 mentions DKA only as the cannabis position states it. |
| R4 · **ruled 2026-10-06 ([C15](clinical-rulings-2026-10-06.md#c15))** | In-use insulin: "follow your leaflet" | 6.items.7 | Diabetes Canada Air Travel's "keeps its strength at room temperature for 30 days" is held (H6). |
| R9 · **ruled 2026-10-06 ([C14](clinical-rulings-2026-10-06.md#c14))** | FIT treated as industry-run | — | Not cited. |
| R10 · **ruled 2026-10-06 ([C16](clinical-rulings-2026-10-06.md#c16))** | **No alcohol limits stated** | 4.items.1, 4.items.5 | After the source check the card says: the 2018 nutrition guideline gives higher limits than Canada's 2023 Guidance on Alcohol and Health; Diabetes Canada's 2023 guideline (CPG Ch18) says that if you drink, cutting down lowers the risk; CCSA says less is better; and item 1 adds Ch18 2023's "if you don't drink, it's healthier not to start". Ch18 2023 also gives "a maximum of 2 standard drinks per week", which matches CCSA's 2-or-fewer band, so Diabetes Canada's own current guidance now agrees with CCSA against Ch11 (2018), the 04/18 sheet and the 2019 article. Options: (a) keep as now, with no numbers; (b) state the 2023 number (2 standard drinks or fewer a week), backed by both CCSA and Ch18 2023 (releases H5); (c) drop the 2018 comparison sentence and keep only the 2023 positions. |

This chapter's own:

| # | Default used | Where | Alternative |
|---|---|---|---|
| D1 · **ruled 2026-10-06 ([C1](clinical-rulings-2026-10-06.md#c1))** | **Driving uses 4.0**, with a visible note that most guidance uses 3.9 | 7.items.3, 7.note | Use 3.9 on the driving card too, for one number site-wide (no Canadian driving source says 3.9). Ch14 2023 uses "<3.9" and does not mention 4.0. |
| D2 · **ruled 2026-10-06 ([C9](clinical-rulings-2026-10-06.md#c9))** | **After a severe low while driving: stop driving right away (Ch21 rec), then tell your provider and licensing office right away (Ch21 key messages for people), and "your provider may tell you not to drive" (Ch21 rec).** The same telling line applies to more than one severe low while awake in the past 6 months | 7.items.8 | (a) Follow the recommendation for timing: provider "as soon as possible (no longer than 72 hours)", licensing office not mentioned; (b) drop the licensing office and say "your provider will advise you". "While awake" is "while awake but not driving"; the 6 months is for private drivers (12 for commercial). This line has licence consequences, so it needs a clinical call. |
| D3 · **ruled 2026-10-06 ([C9](clinical-rulings-2026-10-06.md#c9))** | Commercial driving is not covered beyond "assessed as an individual" | 7.items.9 | Add DC's "higher medical standards for commercial drivers" line, or the CMA Driver's Guide rule (clinician-facing). |
| D4 · **ruled 2026-10-06 ([C3](clinical-rulings-2026-10-06.md#c3))** | **BLOCKING before sign-off. Chest pain or breathlessness while exercising: the copy now says only "stop the activity".** The source's "and speak to your doctor" was removed because, as the only next step, it can delay emergency care (verify S1, high). | 3.items.6 | The CDE check recommends ruling for "call 911": release H2 once a heart-attack-signs source (e.g. Heart & Stroke Foundation) is registered, or on the nurse's own clinical ruling recorded in the content review. Alternative: restore "and speak to your doctor" after the 911 line, for chest pain that has eased. |
| D5 · **ruled 2026-10-06 ([C24](clinical-rulings-2026-10-06.md#c24))** | **Eye exam schedule: CPG Ch30 first, COS second, "your team decides"** (policy 5) | 9.items.4–5, 9.note, band 1 | Show only CPG Ch30. |
| D6 · **ruled 2026-10-06 ([C19](clinical-rulings-2026-10-06.md#c19))** | **Carbohydrate amounts stated** as the sheet's "for most people" (45–60 g a meal, 15–30 g a snack) | 2.items.4 | Drop the numbers and keep "a dietitian or educator sets your goals"; some readers may take the range as their prescription. |
| D7 · **ruled 2026-10-06 ([C16](clinical-rulings-2026-10-06.md#c16))** | **Alcohol "don't drink if" list** from the 04/18 sheet | 4.items.2 | The sheet reflects the 2018 guidelines; confirm it is still Diabetes Canada's current sheet, or drop the list. |
| D8 · **ruled 2026-10-06 ([C25](clinical-rulings-2026-10-06.md#c25))** | **Feet (8) and eyes (9) pinned open** (`urgentContent`) because each has a "right away" line | meta | Leave them collapsible, as only 911/ED cards are pinned elsewhere. The engine's definition ("same-day, emergency or crisis line") supports pinning. |
| D9 · **ruled 2026-10-06 ([C25](clinical-rulings-2026-10-06.md#c25))** | **Card 5 pinned open** with the crisis strip and 911 as well as 9-8-8 | meta, 5.figure.body | Ostomy's "Just been told" is not `urgentContent`; this card is, because it carries 911. Owner may prefer Ostomy's parity. |
| D10 · **ruled 2026-10-06 ([C21](clinical-rulings-2026-10-06.md#c21))** | **Kidney card leaves out CPG Ch29's medicine key message** ("prioritize glucose-lowering therapies with kidney and heart benefits") and the KFOC dialysis and Indigenous statistics | 10 | Include the statistics (sourced) if the nurse wants them; the medicine line stays out under the no-drug-class rule. |
| D11 · **ruled 2026-10-06 ([C21](clinical-rulings-2026-10-06.md#c21))** | **Heart "D" names no medicine class** | 11.items.6 | Name classes as DC does (conflicts with retail scope). |
| D12 · **ruled 2026-10-06 ([C23](clinical-rulings-2026-10-06.md#c23), [C16](clinical-rulings-2026-10-06.md#c16))** | **Fear of lows, distress screening and the 2023 alcohol position** are stated from CPG Ch18 2023 (clinician guideline with key messages for people) | 4.items.1, 4.items.5, 5.items.5–6 | Keep only the DC patient page lines (card 4 would then lose its 2023 position, which verify S7 asked for). |
| D13 · **ruled 2026-10-06 ([C33](clinical-rulings-2026-10-06.md#c33))** | Ask roles: eyes uses `team`; no new role | 9 | Add an `eyeCare` role ("Ask your eye doctor"), which would join plan ruling 13's list of new roles. |
| D14 | Placeholders: `accent` '#c9dcc0' and archive images | meta | Owner picks when the Diabetes image set is chosen. |
| D15 · **ruled 2026-10-06 ([C2](clinical-rulings-2026-10-06.md#c2))** | **Glucagon and alcohol: not repeated on this card.** The CDE check calls the alcohol sheet's "glucagon will not work while alcohol is in the body" outdated and in conflict with Staying Safe's glucagon advice. But Staying Safe card 4 item 5 in the repo (`en.json`) carries that line today ("Diabetes Canada says glucagon won’t work while alcohol is in your body"). | 4.items.3; Staying Safe 4.items.5 | Nurse to rule on the line site-wide: (a) remove it from Staying Safe as the CDE check implies; (b) keep it there, with this chapter pointing to it (as now). |
| D16 · **ruled 2026-10-06 ([C10](clinical-rulings-2026-10-06.md#c10))** | **Foot "right away" list stays at the sheet's list plus Ch32's ulcer/infection line.** No same-day/emergency tier | 8.items.7 | The CDE check asks the nurse to consider a red, hot, swollen foot with fever or feeling unwell as same-day care (H3). Needs a registered source or the nurse's ruling. |
| D17 · **ruled 2026-10-06 ([C10](clinical-rulings-2026-10-06.md#c10))** | **Eyes "right away" list is CNIB's** (dark spots; blurred, distorted or double vision; large floaters) | 9.items.6 | The CDE check asks the nurse to consider sudden loss of vision, a curtain or shadow, or a sudden shower of floaters as same-day emergency eye care (H4). Not in the registered sources. |

---

## E) HELD items (not in the JSON) and things left out

### E.1 HELD

| # | Topic | Card | Why held | Proposed wording if sourced | Likely source to check |
|---|---|---|---|---|---|
| H1 | **Signs of a heart attack or stroke** | 11 | No registered source lists them (`sources-meta.ts` has no Heart & Stroke entry) | "Chest pain or pressure, trouble breathing, sudden weakness or trouble speaking: call 911" | Heart & Stroke Foundation (register it) |
| H2 · **ruled 2026-10-06 ([C3](clinical-rulings-2026-10-06.md#c3))** | **Chest pain or breathlessness during exercise: call 911** (verify S1, high) | 3 | No registered source gives a 911 line for chest pain; DC Exercise says only "stop… and speak to your doctor". Blocks sign-off of card 3 (D4) | "If chest pain or pressure, or shortness of breath, doesn’t ease quickly with rest, call 911. Once it has eased, tell your doctor" | Heart & Stroke Foundation signs of a heart attack (register it), or the nurse's ruling |
| H3 · **ruled 2026-10-06 ([C10](clinical-rulings-2026-10-06.md#c10))** | **Red, hot, swollen foot with fever or feeling unwell: same-day care** (verify S4, nurse to consider) | 8 | Not in the foot sheet or Ch32's patient lines | "If your foot is red, hot and swollen and you have a fever or feel unwell, get care today" | Nurse ruling (D16); Wounds Canada patient page (registered entry covers ulcers, not this tier) |
| H4 · **ruled 2026-10-06 ([C10](clinical-rulings-2026-10-06.md#c10))** | **Sudden vision loss, a curtain or shadow, a sudden shower of floaters: same-day emergency eye care** (verify S5) | 9 | Not in CNIB, COS or Ch30 as registered | "Sudden loss of sight, a curtain or shadow over your vision, or a sudden shower of floaters needs emergency eye care the same day" | Nurse ruling (D17); COS or CNIB emergency page (register it) |
| H5 · **ruled 2026-10-06 ([C16](clinical-rulings-2026-10-06.md#c16))** | **Alcohol numbers**: Ch11 (2018) ≤2/day, <10/week (women) and ≤3/day, <15/week (men); Ch18 2023 "a maximum of 2 standard drinks per week"; CCSA's 2 / 3–6 / 7+ continuum and "no more than 2 on any occasion" | 4 | Ruling R10 (no limits stated) | Option (b) in R10: "Canada’s 2023 guidance and Diabetes Canada’s 2023 guideline both point to 2 standard drinks or fewer a week" | Already registered (Ch11, Ch18 2023, CCSA) |
| H6 · **ruled 2026-10-06 ([C15](clinical-rulings-2026-10-06.md#c15))** | **In-use insulin "30 days at room temperature"** (DC Air Travel) | 6 | Ruling R4 ("follow your leaflet") | — | — |
| H7 | **Sleep tips and sleep apnea** | 5 | Only "sleeping problems are common" (Ch18) and activity aiding sleep (DC Exercise) are sourced. Ch21 mentions sleep apnea and driving, clinician-level | "If you snore or feel sleepy during the day, tell your team" | A Canadian patient page on sleep and diabetes (none registered) |
| H8 | **Other crisis and support lines** (Kids Help Phone, Hope for Wellness, Wellness Together Canada) | 5 | Not checked (survey); not in the register | Lanes or routes for youth and Indigenous readers | Each service's own site |
| H9 | **Diabetes Canada's mental health provider directory** | 5 | The DC page links one, but its destination was not recorded; it may be Breakthrough's | Add as a second route chip | Re-open the DC page link |
| H10 | **Lower-risk cannabis guidelines** (avoid high-potency THC, smoking, daily use) | 4 | Ch18 2023 cites Canada's Lower-Risk Cannabis Use Guidelines, which are not registered | "If you use cannabis, Canada’s lower-risk guidelines suggest…" | Canada's Lower-Risk Cannabis Use Guidelines (CAMH / Health Canada) |
| H11 | **Provincial driving and licensing rules** | 7 | No ministry page verified (survey) | Per-province reporting line | Each province's licensing authority |
| H12 · **ruled 2026-10-06 ([C9](clinical-rulings-2026-10-06.md#c9))** | **Commercial driving specifics** | 7 | CMA Driver's Guide is clinician-facing | See D3 | CMA Driver's Guide (registered); DC driving position statement (not registered) |
| H13 | **Employment accommodation, human rights complaints** | 12 | DC's employment position statement and human rights commissions are not registered | "If you’re treated unfairly at work because of diabetes, you can contact your provincial human rights commission" | DC employment position; Canadian Human Rights Commission |
| H14 | **Insurance rights** | 12 | DC insurance position not registered | — | DC insurance position statement |
| H15 | **Monofilament, foot exam method** | 8 | Ch32 is clinician-level | "Your doctor may touch your foot with a thin nylon thread to test feeling" | Ch32; a patient page |
| H16 · **ruled 2026-10-06 ([C24](clinical-rulings-2026-10-06.md#c24), [C37](clinical-rulings-2026-10-06.md#c37))** | **Pregnancy eye exams (CPG Ch36)** and children's screening schedules | 9, 10 | Belong in Ch06 (seasons of life); only COS's first-trimester line and "ask your child’s team" are here | — | CPG Ch36, Ch34 |
| H17 | **Liivv pharmacist CDE phone number** | pharmacist panel | Not confirmed by the owner | "Call a pharmacist CDE: 1-8xx-…" | Owner |
| ~~H18~~ | ~~**Resources shelf**~~ Built 2026-10-06 (B28; F.7; its claims are in C). No Diabetes Canada support line is on it: none is registered | chapter | The `shelf` gate stays closed on /fr until the French is reviewed | Four groups: mental health and support, travel, your rights, learning about diabetes | Register entries already exist for each |

### E.2 Left out on scope or placement (not held)

| Topic | Card | Why left out |
|---|---|---|
| Insulin changes for time zones ("fewer units… extra units", DC Air Travel) | 6 | Dosing |
| Exercise insulin and carbohydrate adjustments (Ch10) | 3 | Dosing |
| Medicine classes on DC Heart's "D" (ACE inhibitors, ARBs, statins, Aspirin, clopidogrel) | 11 | No drug-class recommendations (D11) |
| ~~CPG Ch29's kidney-medicine key message~~ | 10 | Released 2026-10-06 without a drug class (10.items.8, ruling C21) |
| Diabetes Canada's "Heart protection tool" self-assessment | 11 | It asks whether "you should be taking certain medications", which is close to drug-class advice |
| Glucagon kit for remote travel (DC Air Travel) | 6 | The page names a product; glucagon is covered in Staying Safe |
| Glucagon-and-alcohol line (alcohol sheet) | 4 | Covered, or not, in Staying Safe (D15) |
| Medical ID brand (DC Exercise, alcohol sheet) | 3, 4 | Brand name; medical ID is covered in Staying Safe card 5 |
| Hydration in heat | — | The plan moved hydration to Staying Safe card 8 |
| Foot creams, monofilament and kits in the shop strips | 8; 2, 3, 6, 8 | Strips built 2026-10-06 (F.7). The two diabetic foot creams make symptom claims and wait on the nurse; no monofilament is stocked; kits wait on the owner (A4) |

No card is fully HELD. The thinnest is card 12 (six sourced items, all from Diabetes Canada; no second publisher). Card 3 cannot be signed off until D4 is ruled (H2).

---

## F) CHANGE LOG (what the source check changed)

Source: `every-day-living.verify.md` (109 rows: 101 Confirmed, 7 Partly, 0 Not confirmed; safety S1–S7 and S10). Every Partly row and every safety, scope and labelling item is handled below. Rows the check confirmed with no correction are unchanged.

| # | Key | Verify finding | Change made |
|---|---|---|---|
| 1 | 3.items.6 | S1 (high): "Stop and speak to your doctor" for chest pain can delay emergency care | Now "If you’re short of breath or have chest pain, stop the activity" (the source's own "Stop the activity"). The verify's 911 line could not be added: no registered source supports it (no Heart & Stroke entry in `sources-meta.ts`). It is HELD as H2, and D4 now records the CDE recommendation ("call 911") and is marked blocking. |
| 2 | urgentExit.lead | S1 (b): "Signs that need emergency care are in Staying Safe" overpromises; `#red-flags` covers only lows and DKA | "Emergencies with lows and highs are in Staying Safe, under" + "Get emergency care now". |
| 3 | 4.items.1 | Row 4.1 + S7: sources predate Ch18 2023; add its "healthier not to start" | Attributed s1 to "Diabetes Canada’s alcohol sheet"; added "Its newer 2023 guideline adds that if you don’t drink, it’s healthier not to start". Cited `dc-cpg-ch18-mental-health-2023` on card 4 (meta and A.1). |
| 4 | 4.items.2 | Partly: missing "or engage in other activities that require attention or skill" | "are about to drive or do anything that needs your full attention". Leads with "The sheet says" now that item 1 names it. |
| 5 | 4.items.3 | S3: "call an ambulance if you pass out" missing | Added "including calling 911 if you pass out" (matches Staying Safe red-flag sign 1 and its card 4 item 5). The sheet's glucagon line stays out; see D15 for a conflict between the check and Staying Safe. |
| 6 | 4.items.5 | Partly + S7: copy implied Diabetes Canada currently disagrees with CCSA | Now: 2018 nutrition guideline gives higher limits than the 2023 guidance; Diabetes Canada's 2023 guideline says that if you drink, cutting down lowers the risk to your health; the 2023 guidance says less is better; your team can help you cut down. The check's suggested "both say less is better" was not used word for word: Ch18 2023 says "reduce intake to minimize adverse health outcomes", not "less is better", so each body keeps its own words. No numbers (R10). |
| 7 | 4.items.7 | Partly: rec 4 is for adults | "Diabetes Canada says adults who use it should be offered advice on lowering the risks". |
| 8 | 5.figure.body | Confirmed (S6: no issue) | "9-1-1" written "911" to match Staying Safe and Ostomy copy. Format only; the dialled number in meta (`tel: '911'`) is unchanged. |
| 9 | 7.items.2 | Partly: key message also says check "if you develop symptoms" | Added "any time you feel low". |
| 10 | 7.items.4 | Confirmed; unit missing | "at least 5.0 mmol/L". |
| 11 | 7.items.5 | Optional: key message "consider waiting 40 minutes" | Added "The 40-minute wait applies here too" (points to the rec in 7.items.4). |
| 12 | 7.items.7 | Partly: rec says severe hypoglycemia "in the past 12 months" | "or you’ve had a severe low in the past year". |
| 13 | 7.items.8 | S2: rec says the driver "must refrain from driving immediately" | Added "If you have one while driving, the guideline says to stop driving right away" and "Your provider may tell you not to drive" (rec: professionals "should inform… to no longer drive"). The check's "Don’t drive again until your health-care provider says you can" was not used word for word: Ch21 does not set that condition. "in 6 months" → "in the past 6 months". D2 updated. |
| 14 | 8.items.7 | S4: no open sore, ulcer or infection signs in the "right away" list | Added "An open sore (a foot ulcer) or signs of infection need care promptly, even if they don’t hurt" (Ch32 rec). The check's "isn’t healing" was not used: Ch32 says "ulcer". Also restored the sheet's "in your feet or legs". Red, hot, swollen foot with fever: HELD as H3 (D16). |
| 15 | 9.items.4; programsBand.cards.1 | Add "children under 15: ask your child’s team", as on the kidney card | Added "For a child under 15, ask your child’s team" to both. |
| 16 | 9.items.7 | CNIB also says sight lost can’t be restored; worth adding | Added after the hopeful line, framed as the reason for early exams: "Sight that has already been lost can’t be restored, which is why early exams matter". |
| 17 | 9 (eyes) | S5: sudden vision loss, curtain, shower of floaters (nurse to consider) | Not in registered sources: HELD as H4 (D17). |
| 18 | 11.title; 11.items.2; programsBand.cards.4 | S10: "ABCDES" is neither DC's "ABCDEs" nor CPG's "ABCDESSS" | "ABCDEs" (DC patient page) in the title, item 2, the band body and the meta comments, so `LinkedIntroBody` still matches the title. |
| 19 | 11.items.9 | Confirmed; page adds lipids "more often if you are on cholesterol-lowering medications" | Added "or more often if you take medicine to lower it". No class named. |
| 20 | 11.note | Partly: footnote is about A1C targets only | "Diabetes Canada notes that A1C targets are different in pregnancy, for older adults and for children 12 and under". |
| 21 | programsBand.cards.4 | Partly: Ch9 says "approximately every 3 months" | "A1C about every 3 months or as your team advises". |
| 22 | A.1, A.3 | Follows from 3, 14, 18 | Card 4 sources gain `dc-cpg-ch18-mental-health-2023`; card 3, 4 and 11 comments updated; structural checks note that item counts are unchanged and that `urgentExit.lead` now claims only lows and highs. |
| 23 | C, C.2 | Follows from all of the above | Claims rows rewritten for every changed sentence (split by sentence where a new source came in); register notes added for the alcohol sheet, Ch18 2023, Ch32, Ch9, CNIB and the missing heart-attack-signs source. |
| 24 | D, E | Follows from 1, 5, 6, 13, 14, 17 | R10 rewritten with the new copy and options; D2, D4, D9, D12 updated; D15–D17 added. E split into HELD (H1–H18, with H2–H5 new) and left-out-on-scope; product and brand names in the internal list made generic. |

Not changed:
- 2.items.4: confirmed; still open as D6.
- Card 6 (flying): all rows confirmed. CATSA allows checked baggage, but the DC advice (carry-on) is kept as the safer one.
- Canadian labelling: every source is Canadian, so no card carries "International guidance".
- No Diabetes Express mention anywhere in copy, links or citations.

Checks on the revised copy:
- No dosing, titration or alcohol limits.
- No drug class or product name.
- No "always" or "never".
- No exclamation marks.
- "911" and "9-8-8" are written as on the rest of the site.

### F.2 Changes from the fix list (2026-10-05)

Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `chapters-meta.ts`, `sources-meta.ts` and `sources-review.ts`. Sections B, D and E above still show the state before these changes; the content-review export (`docs/content-review/diabetes-care/`) and `OPEN-QUESTIONS.md` (C3) have the new defaults.

| # | Key | Reason | Change made |
|---|---|---|---|
| 25 | Register | Fix list 1: H2 waited on a heart-attack-signs source | New SourceId `hsf-heart-attack-signs`: Heart and Stroke Foundation, "Signs of a heart attack", https://www.heartandstroke.ca/heart-disease/emergency-signs (labelFr "Les signes d’une crise cardiaque", hrefFr https://www.coeuretavc.ca/maladies-du-coeur/signes-d-urgence), read 2026-10-05. Page: "If you experience any of these signs, call 9-1-1 or your local emergency number immediately"; signs include chest discomfort ("Pressure, squeezing, fullness or pain, burning or heaviness") and shortness of breath; step 2 "Stop all activity". Added to card 3's `sources` and to the chapter's citations. |
| 26 | 3.items.6 (EN + FR) | Fix list 1: release H2 on that source, keeping "stop the activity" | EN: "…If you’re short of breath or have chest pain, stop the activity. Chest pain, pressure or discomfort, and shortness of breath can be signs of a heart attack. If you have any of these signs, call 911 right away". FR: "…arrêtez l’activité. Une douleur, une pression ou un inconfort à la poitrine, et l’essoufflement, peuvent être des signes d’une crise cardiaque. Si vous avez l’un de ces signes, appelez le 911 immédiatement". H2 is out of the held list (E); D4 / C3 stay open for the nurse with this as the default. |
| 27 | meta card 3 | Follows from 26: the card now carries a 911 line | `urgentContent: true` (pinned open, never gated), as cards 5, 8 and 9 are. |
| 28 | 11.title, 11.items.2, programsBand.cards.4.body (FR only) | Fix list 10: French usage | "Votre cœur : les ABCDEs" → "Votre cœur : l’ABCDE"; "sous le nom d’ABCDEs" → "sous le nom d’ABCDE"; band card 4 "Voir Votre cœur : les ABCDEs." → "Voir Votre cœur : l’ABCDE." (the band names card 11 by its exact title, so the link still renders). EN unchanged. |

---

## G) NEW SITE FIGURES

One, named in the plan ("Band: Your checkup year"; critique: "Band slot: Your checkup year (recoveryMap timeline)"; types section: "first-year and checkup maps: type" filter). It is **not needed for v1**: the programs band above ships as written and stays as the figure's fallback.

### G.1 `checkupYear` — the checkup-year map (band slot)

**What it shows.** One year as a strip of 12 months, with a row per check and a marker at each time it falls due. Rows, each with its card link:

```ts
// DiabetesFigureMeta addition (chapters-meta.ts), with a GATED_KINDS entry 'checkupYear'
| {
    kind: 'checkupYear';
    /* Index-matched to `ui.checkupYear.rows.<n>` (label) and `.rule.<type>` (sentence). */
    rows: Array<{
      card: number;                    // chapter card it links to
      glyph: GlyphName;                // existing: 'calendar' | 'check' | 'list' | 'drop'
      every: 'visit' | 3 | 12 | '12to24';  // months; 'visit' = each diabetes visit
      startsAt: { type1?: 'dx+5y' | 'dx' | 'age15+dx+5y'; type2?: 'dx' };
      sources: SourceId[];
    }>;
    types: Array<'type1' | 'type2' | 'other'>;
  };
```

| Row | Interval | Type 1 start | Type 2 start | Sources |
|---|---|---|---|---|
| Eye exam | 12 (type 1); 12to24 if little or no retinopathy (type 2) | age ≥15, 5 years after diagnosis | at diagnosis | dc-cpg-ch30-retinopathy (COS "at least yearly" shown as a second line, D5) |
| Kidney tests (ACR + eGFR) | 12 | 5 years after diagnosis (after puberty for children) | at diagnosis | dc-cpg-ch29-ckd-2025; dc-kidney-disease |
| Foot exam (bare feet, nerves, blood flow) | 12, "more often if high risk" | any | any | dc-foot-care-sheet-2025; dc-cpg-ch32-foot-care |
| Blood pressure | visit | any | any | dc-heart-disease-and-stroke |
| A1C | 3 | any | any | dc-heart-disease-and-stroke; dc-cpg-ch9-monitoring-2021 |
| Cholesterol (lipids) | 12 | any | any | dc-heart-disease-and-stroke |
| Your own feet check | daily (shown as a note, not a marker) | any | any | dc-foot-care-sheet-2025 |

**Behaviour.**
- A local type filter ("Type 1", "Type 2", "Another type or not sure"), modelled on Ostomy's `recovery-map-filter.tsx`. It changes only the start rule sentence under each row, never removes a row. "Another type or not sure" shows both rules with "Ask your team which applies to you".
- No dates, ages or readings typed in, and nothing read back to the reader; no storage. A "Print my checkup year" button prints the rows with blank "Date booked" lines (like `takeIn` fields), filled in with the team.
- Each row's label links to its card (`#card-9`, `#card-10`, `#card-8`, `#card-11`).
- Footer line from the band: "Your team may set a different schedule."

**No-JS fallback.** Server-rendered as a plain list: one `<li>` per row with its interval and both start rules written out ("Type 1: …. Type 2: …."), then the print button hidden. On /fr until the `checkupYear` gate is signed off, and wherever the figure is gated, the four `programsBand` cards above render instead (the same rescue Ostomy's recovery map uses).

**Engine work.** Today `ChapterBandSlot` renders only `programsBand` and the shelf ("Ostomy's recovery map… stays with Ostomy"). Putting a site figure in the band slot needs a small engine hook: a chapter-level `bandFigure?: SiteFig` that the slot hands to the site figure registry, falling back to `programsBand` when gated or held. Messages: `DiabetesCare.ui.checkupYear` (`heading`, `filterLegend`, `types.*`, `rows.<n>.label`, `rows.<n>.rule.type1|type2`, `every.*`, `print`, `dateBooked`), with `held-messages.ts` covering that subtree if the figure is held.

### F.3 Changes after the full-site review (2026-10-06)

| # | Where | Was | Now | Why |
|---|---|---|---|---|
| F3-1 | Register `dc-air-travel` and the chapter's resource link "Diabetes Canada — Air Travel" | https://www.diabetes.ca/learn-about-diabetes/your-rights/air-travel (now a redirect) | https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/the-rights-of-people-living-with-diabetes/air-travel | Link crawl 4. Same page |

No wording changed. The chapter's name ("Every Day Living" against "Everyday 'Liivving'") is owner question B32.

### F.4 Clinical rulings applied (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md). Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `chapters-meta.ts` and the register. Section B still shows the earlier wording. French is machine-drafted and awaits review.

| # | Key | Change (EN, then FR) | Ruling |
|---|---|---|---|
| 1 | `3.items.6` | EN "If you’ve been inactive for a while, talk to your doctor before starting anything harder than a brisk walk. If you’re short of breath or have chest pain, stop the activity. Chest pain, pressure or discomfort, and shortness of breath can be signs of a heart attack. If you have any of these signs, call 911 right away" → "If you’ve been inactive for a while, talk to your doctor before starting anything harder than a brisk walk. If you have chest pain, pressure or discomfort, or you’re much more short of breath than usual, stop the activity and call 911 right away. These can be signs of a heart attack. Tell your doctor about it too, before you exercise again" · FR → "Si vous n’avez pas été actif depuis un moment, parlez-en à votre médecin avant de commencer quoi que ce soit de plus exigeant qu’une marche rapide. Si vous avez une douleur, une pression ou un inconfort à la poitrine, ou si vous êtes beaucoup plus essoufflé que d’habitude, arrêtez l’activité et appelez le 911 immédiatement. Ce peuvent être des signes d’une crise cardiaque. Parlez-en aussi à votre médecin avant de refaire de l’exercice" | [C3](clinical-rulings-2026-10-06.md#c3) |
| 2 | `7.items.8` | EN "A severe low is one where you pass out or need someone else’s help. If you have one while driving, the guideline says to stop driving right away. Tell your health-care provider and your driver licensing office right away, and do the same if you have more than one severe low while awake in the past 6 months. Your provider may tell you not to drive" → "A severe low is one where you pass out or need someone else’s help. If you have one while driving, the guideline says to stop driving right away. Tell your health-care provider and your driver licensing office right away, and do the same if you have more than one severe low while awake in the past 6 months (12 months for commercial drivers). Your provider may tell you not to drive" · FR → "Une hypoglycémie grave est une hypoglycémie pendant laquelle vous perdez connaissance ou avez besoin de l’aide d’une autre personne. Si vous en avez une pendant que vous conduisez, les lignes directrices indiquent d’arrêter de conduire immédiatement. Avisez immédiatement votre professionnel de la santé et le bureau des permis de conduire, et faites de même si vous avez eu plus d’une hypoglycémie grave pendant que vous étiez éveillé au cours des 6 derniers mois (12 mois pour les conducteurs de véhicules commerciaux). Votre professionnel de la santé pourrait vous dire de ne pas conduire" | [C9](clinical-rulings-2026-10-06.md#c9) |
| 3 | `7.items.9` | EN "You have the right to be assessed for a driver’s licence as an individual. Licensing is handled by each province and territory" → "You have the right to be assessed for a driver’s licence as an individual. Licensing is handled by each province and territory. Licensing offices require a higher level of medical fitness to drive a bus, a commercial van, a transport truck or an emergency vehicle. Diabetes Canada’s guideline says commercial drivers should have a medical exam when they apply for their licence" · FR → "Vous avez le droit d’être évalué individuellement pour un permis de conduire. Les permis relèvent de chaque province et territoire. Les bureaux des permis exigent un niveau plus élevé d’aptitude médicale pour conduire un autobus, une fourgonnette commerciale, un camion de transport ou un véhicule d’urgence. Selon les lignes directrices de Diabète Canada, les conducteurs de véhicules commerciaux devraient passer un examen médical lorsqu’ils demandent leur permis" | [C9](clinical-rulings-2026-10-06.md#c9) |
| 4 | `8.items.7` | EN "See your doctor or a foot-care specialist right away for swelling, warmth, redness or pain in your feet or legs, or for corns, calluses, ingrown toenails, warts or slivers. Don’t treat these yourself. An open sore (a foot ulcer) or signs of infection need care promptly, even if they don’t hurt" → "See your doctor or a foot-care specialist right away for swelling, warmth, redness or pain in your feet or legs, or for corns, calluses, ingrown toenails, warts or slivers. Don’t treat these yourself. An open sore (a foot ulcer) or signs of infection need care right away, even if they don’t hurt. Don’t wait if a sore gets more painful, red, warm, smelly or starts to drain, if your foot is red, warm and changing shape, or if skin turns black or your legs or feet hurt at rest: see your doctor right away or go to the emergency department. A serious foot infection doesn’t always cause a fever" · FR → "Consultez immédiatement votre médecin ou un spécialiste des soins des pieds en cas d’enflure, de chaleur, de rougeur ou de douleur aux pieds ou aux jambes, ou en cas de cors, de callosités, d’ongles incarnés, de verrues ou d’échardes. Ne les traitez pas vous-même. Une plaie ouverte (un ulcère du pied) ou des signes d’infection doivent être soignés immédiatement, même s’ils ne font pas mal. N’attendez pas si une plaie devient plus douloureuse, plus rouge, plus chaude, dégage une odeur ou se met à couler, si votre pied est rouge, chaud et change de forme, ou si la peau noircit ou si vos jambes ou vos pieds font mal au repos : consultez immédiatement votre médecin ou présentez-vous à l’urgence. Une infection grave du pied ne cause pas toujours de fièvre" | [C10](clinical-rulings-2026-10-06.md#c10) |
| 5 | `9.items.6` | EN "See an eye doctor right away if you notice dark spots, blurred, distorted or double vision, or large floaters" → "See an eye doctor right away if you notice dark spots, blurred, distorted or double vision, or large floaters. If you suddenly see flashes of light with a lot of new floaters, or part of your vision goes dark, don’t wait: see an eye doctor right away, or go to the emergency department if you can’t be seen today. It can be a sign of a torn or detached retina" · FR → "Consultez immédiatement un spécialiste des yeux si vous remarquez des taches sombres, une vision floue, déformée ou double, ou de gros corps flottants. Si vous voyez soudainement des éclairs de lumière avec beaucoup de nouveaux corps flottants, ou si une partie de votre champ de vision s’obscurcit, n’attendez pas : consultez immédiatement un spécialiste des yeux, ou présentez-vous à l’urgence si ce n’est pas possible aujourd’hui. Cela peut être un signe de déchirure ou de décollement de la rétine" | [C10](clinical-rulings-2026-10-06.md#c10) |
| 6 | card 8 sources | Added `wounds-canada-foot-emergency` (Wounds Canada, "Diabetic Foot Complications: When is it an Emergency?", EN PDF and the French token-link PDF, read 2026-10-06). H3 released; D16 closed. Re-check the French token link before publishing | [C10](clinical-rulings-2026-10-06.md#c10) |
| 7 | card 9 sources | Added `cnib-floaters-and-flashing-lights` (CNIB, © Canadian Ophthalmological Society; read 2026-10-06; the French link redirects to inca.ca, which is the registered `hrefFr`). H4 released; D17 closed. The emergency-department fallback is a protective default the eye page does not state | [C10](clinical-rulings-2026-10-06.md#c10) |
| 8 | D2, D3, H12 | The commercial-driver 12 months and Diabetes Canada's medical-fitness and medical-exam lines are in 7.items.8–9. Provincial reporting rules stay held (H11) | [C9](clinical-rulings-2026-10-06.md#c9) |
| 9 | D4, H2 | Card 3's wording is ruled; it stays pinned. Not named (the default; the choice stays the owner's): Heart and Stroke's other signs | [C3](clinical-rulings-2026-10-06.md#c3) |
| 10 | D8, D9 | Cards 3, 5, 8 and 9 stay pinned and card 4 is not, under the site-wide rule written in `chapters-meta.ts` | [C25](clinical-rulings-2026-10-06.md#c25) |
| 11 | D15 | Closed: the line lives on Staying Safe card 4 in Ch14 2023's words ("may not work as well"); 4.items.3 here keeps its pointer, no wording change | [C2](clinical-rulings-2026-10-06.md#c2) |
| 12 | H6 | Still not used here: Diabetes Canada's 30 days is set aside because some labels say 28. 6.items.7 is unchanged | [C15](clinical-rulings-2026-10-06.md#c15) |

### F.5 Clinical rulings applied: targets, types and other (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md), rulings C16–C45 (the verifier's final copy; where a choice was left to the owner, the stated default). Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `chapters-meta.ts` and `sources-meta.ts` / `sources-review.ts`. Sections B and C above still show the earlier wording and claims rows; the keys and claims below are current. All French is machine-drafted and awaits the francophone review.

| # | Key or place | Change | Ruling |
|---|---|---|---|
| 1 | `4.items.1` | EN "Diabetes Canada’s alcohol sheet says that, as a general rule, you don’t need to avoid alcohol because you have diabetes. Its newer 2023 guideline adds that if you don’t drink, it’s healthier not to start. Talk with your team about what’s right for you" → "Diabetes Canada’s 2023 guideline says that if you don’t drink, it’s healthier not to start. If you do drink, talk with your team about what’s right for you" · FR → "Selon les lignes directrices 2023 de Diabète Canada, si vous ne buvez pas, il est plus sain de ne pas commencer. Si vous buvez, parlez avec votre équipe de ce qui vous convient" | [C16](clinical-rulings-2026-10-06.md#c16) |
| 2 | `4.items.2` | EN "The sheet says not to drink if you’re pregnant or trying to get pregnant, breastfeeding, have a personal or family history of drinking problems, are about to drive or do anything that needs your full attention, or take certain medicines. Ask your pharmacist about yours" → "Diabetes Canada’s alcohol sheet says not to drink if you’re pregnant or trying to get pregnant, breastfeeding, have a personal or family history of drinking problems, are about to drive or do anything that needs your full attention, or take certain medicines. Ask your pharmacist about yours. The sheet is from 2018, so the drink limits printed on it are older than the 2023 advice on this card" · FR → "La fiche de Diabète Canada sur l’alcool indique de ne pas boire si vous êtes enceinte ou essayez de le devenir, si vous allaitez, si vous avez des antécédents personnels ou familiaux de problèmes d’alcool, si vous êtes sur le point de conduire ou de faire une activité qui demande toute votre attention, ou si vous prenez certains médicaments. Demandez à votre pharmacien ce qu’il en est des vôtres. La fiche date de 2018 : les limites de consommation qui y sont imprimées sont donc antérieures aux conseils de 2023 présentés dans cette section" | [C16](clinical-rulings-2026-10-06.md#c16) |
| 3 | `4.items.5` | EN "Diabetes Canada’s 2018 nutrition guideline gives higher limits than Canada’s 2023 Guidance on Alcohol and Health. Diabetes Canada’s 2023 guideline says that if you drink, cutting down lowers the risk to your health, and the 2023 guidance says that with alcohol, less is better. Your team can help if you want to cut down" → "Diabetes Canada’s 2023 guideline says that if you drink, cutting down lowers the risk to your health, and that this may mean no more than 2 standard drinks a week. Canada’s 2023 Guidance on Alcohol and Health says that at 2 standard drinks or fewer a week you’re likely to avoid harm from alcohol, that more than 2 at one time raises the risk of harms such as injuries, and that less is better. Your team can help if you want to cut down" · FR → "Selon les lignes directrices 2023 de Diabète Canada, si vous buvez, réduire votre consommation diminue les risques pour votre santé, ce qui peut vouloir dire pas plus de 2 verres standards par semaine. Les Repères canadiens sur l’alcool et la santé (2023) indiquent qu’à 2 verres standards ou moins par semaine, vous évitez généralement les conséquences de l’alcool, que plus de 2 verres par occasion augmentent le risque de méfaits comme les blessures, et que moins, c’est mieux. Votre équipe peut vous aider si vous voulez réduire" | [C16](clinical-rulings-2026-10-06.md#c16) |
| 4 | `10.items.8` | New: EN "Diabetes Canada’s 2025 kidney guideline says some diabetes medicines also help protect the kidneys and heart. Ask your team whether yours does, and don’t change a medicine on your own" · FR "Selon les lignes directrices 2025 de Diabète Canada sur les reins, certains médicaments contre le diabète aident aussi à protéger les reins et le cœur. Demandez à votre équipe si c’est le cas du vôtre, et ne changez pas un médicament par vous-même" | [C21](clinical-rulings-2026-10-06.md#c21) |
| 5 | `9.items.4` | EN "Diabetes Canada’s guideline: with type 1, from age 15, a yearly exam starting 5 years after diagnosis. With type 2, an exam at diagnosis, then every 1 to 2 years if it finds little or no retinopathy. For a child under 15, ask your child’s team" → "Diabetes Canada says to have an eye exam once a year, unless your optometrist or ophthalmologist suggests something different. With type 2, the first exam is at diagnosis. With type 1, yearly exams start 5 years after diagnosis, from age 15. For a child under 15, ask your child’s team" · FR → "Diabète Canada recommande un examen de la vue une fois par année, à moins que votre optométriste ou votre ophtalmologiste ne vous suggère autre chose. Avec le diabète de type 2, le premier examen a lieu au moment du diagnostic. Avec le diabète de type 1, les examens annuels commencent 5 ans après le diagnostic, à partir de 15 ans. Pour un enfant de moins de 15 ans, renseignez-vous auprès de l’équipe de votre enfant" | [C24](clinical-rulings-2026-10-06.md#c24) |
| 6 | `9.items.5` | EN "The Canadian Ophthalmological Society suggests an exam at least once a year, and in the first trimester if you’re pregnant" → "The Canadian Ophthalmological Society also suggests an exam at least once a year. If you’re planning a pregnancy, Diabetes Canada says to have an exam before you get pregnant and while you’re pregnant, and the Society suggests one in the first trimester" · FR → "La Société canadienne d’ophtalmologie suggère aussi un examen au moins une fois par année. Si vous planifiez une grossesse, Diabète Canada recommande un examen avant la grossesse et pendant la grossesse, et la Société suggère un examen au cours du premier trimestre" | [C24](clinical-rulings-2026-10-06.md#c24) |
| 7 | `9.note` | EN "The two Canadian sources on this card suggest different schedules. Your eye-care professional and diabetes team decide yours, and can share your results with each other." → "If an exam finds little or no damage, Diabetes Canada’s guideline allows 1 to 2 years between exams with type 2. Your eye-care professional and diabetes team decide your schedule, and can share your results with each other." · FR → "Si un examen révèle peu ou pas de dommages, les lignes directrices de Diabète Canada permettent un intervalle de 1 à 2 ans entre les examens avec le diabète de type 2. Votre professionnel des soins de la vue et votre équipe de soins en diabète établissent votre calendrier, et peuvent se communiquer vos résultats." | [C24](clinical-rulings-2026-10-06.md#c24) |
| 8 | `programsBand.cards.1.body` | EN "Type 1, from age 15: an eye exam every year, starting 5 years after diagnosis. Type 2: an exam at diagnosis, then every 1 to 2 years if it finds little or no retinopathy. For a child under 15, ask your child’s team. Your team may set a different schedule: see Your eyes." → "Once a year, unless your eye-care professional suggests something different. Type 2: the first exam at diagnosis. Type 1: from age 15, starting 5 years after diagnosis. For a child under 15, ask your child’s team. See Your eyes." · FR → "Une fois par année, à moins que votre professionnel des soins de la vue ne suggère autre chose. Type 2 : le premier examen au moment du diagnostic. Type 1 : à partir de 15 ans, à compter de 5 ans après le diagnostic. Pour un enfant de moins de 15 ans, renseignez-vous auprès de l’équipe de votre enfant. Voir Vos yeux." | [C24](clinical-rulings-2026-10-06.md#c24) |
| 9 | card 4 sources (meta) | Removed `dc-cpg-ch11-nutrition-therapy` (it stays registered for other cards). Claims: 4.items.1 sentence 1 `dc-cpg-ch18-mental-health-2023`, sentence 2 `dc-alcohol-and-diabetes-2018` ("discuss alcohol use with their diabetes health-care team") and Ch18 2023; 4.items.2 the sheet and `ccsa-alcohol-guidance-2023` (pregnancy and breastfeeding); 4.items.3 adds Ch18 2023 (counselling for insulin users who drink); 4.items.5 Ch18 2023 and CCSA. Ch18's "more than 4 per occasion" and the sheet's "no need to avoid alcohol" rule are not used. R10, D7 and H5 (in this form) closed; D12's alcohol part kept | [C16](clinical-rulings-2026-10-06.md#c16) |
| 10 | register | `ccsa-alcohol-guidance-2023`: `href` moved to the address the old one now lands on (…/substances/alcohol/…), French title « Repères canadiens sur l’alcool et la santé » and `hrefFr` https://www.ccsa.ca/fr/node/18776 (both read 2026-10-06); locator notes for CCSA, Ch18 2023, Ch11 and the 04/18 sheet (still served, code 111025) | [C16](clinical-rulings-2026-10-06.md#c16) |
| 11 | card 9 (meta) | Sources now lead with the new `dc-eye-damage-retinopathy` (Diabetes Canada, "Eye Damage (Diabetic Retinopathy)", read 2026-10-06, no French page). Claims: 9.items.4 the DC page then `dc-cpg-ch30-retinopathy`; 9.items.5 `cos-diabetic-retinopathy` and the DC page (pregnancy); 9.note Ch30 and the DC page. Band card 1 and `bandSources` lead with it too. Ask: `eyeCare` ("Ask your optometrist or ophthalmologist"). D5 and D13 closed. If the `checkupYear` map is built, type 2 shows 12 months with the 1–2-year note | [C24](clinical-rulings-2026-10-06.md#c24), [C33](clinical-rulings-2026-10-06.md#c33) |
| 12 | register | `cos-diabetic-retinopathy` gains its French page, « La rétinopathie diabétique » (seethepossibilities.ca, read 2026-10-06); its locator and Ch30's now record the yearly exam and the 1–2-year exception | [C24](clinical-rulings-2026-10-06.md#c24) |
| 13 | card 10 (meta comment) | Ch29 2025's key message for people is stated with no drug class (D10 closed). The Kidney Foundation's statistics stay out: the Indigenous figure would need review by an Indigenous health partner, and the owner says none is available (B1); the dialysis figure adds nothing the card needs. `sources-review.ts` records Ch29's key messages | [C21](clinical-rulings-2026-10-06.md#c21) |
| 14 | D6, D11, D12 | Kept as built: the carbohydrate amounts "for most people"; no medicine class on the heart card's "D"; the Ch18 2023 lines, which come from its section for people (nothing is labelled "clinician guidance") | [C19](clinical-rulings-2026-10-06.md#c19), [C21](clinical-rulings-2026-10-06.md#c21), [C23](clinical-rulings-2026-10-06.md#c23) |

### F.6 Owner's business answers applied (2026-10-06)

From the owner's answers of 2026-10-06 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)). French machine-drafted.

| # | Key | Change | Why |
|---|---|---|---|
| 1 | `title`, header menu | "Every Day Living" → "Everyday Liivving" (FR "La vie de tous les jours" → "Liivv au quotidien"), as Ostomy's chapter 3. The header menu label (`DIABETES_CHAPTER_LINKS` in inject-liivv-health-nav.ts) and every reading list follow; the slug `every-day-living` stays | B32 |
| 2 | FR site name | "Soins en diabète" → "Soins du diabète" in `ui.chapter.kicker`, `backToLanding`, `backToChapters` and `titleSuffix` (shared by every chapter) | B32 |
| 3 | `pharmacist.body`, `pharmacist.cta` | EN body → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province. Your targets, your medicines and your checkups belong with your diabetes team." · FR → "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province. Vos cibles, vos médicaments et vos examens de suivi relèvent de votre équipe de soins en diabète.". Under the body, the panel shows the CDE contact from `ui.contact` (DIABETES_SITE.contact): "Call 1-844-561-1254" (tel:+18445611254; FR "Appeler le 1 844 561-1254"), "Email BayshoreExpress@bayshore.ca", "Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays", and "About Bayshore Express Pharmacy" (https://bayshoreexpresspharmacy.ca/about/; FR /fr/a-propos-de-nous/, `bep-about`). The `cta` "Request a call" is removed: the panel has no button, and the hero's "Ask a pharmacist" opens the panel (`#chapter-cde`) | Owner A2, B5, B9, B10, B12 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)) |
| 4 | H18 (resources shelf) | Answered "Yes definitely" (B28); not built yet: each link needs an official source fetched and registered first | B28 |

### F.7 Commerce step and the resources shelf (2026-10-06)

How a strip behaves (all chapters): the products are named in `diabetes-care/chapters/chapter-shop.ts` (owner answer B21, "Now?"), drawn by the shared engine (`_microsite/shop/`) under the card's referral chip, and read from the catalogue on every request. A product shows only while the store shows it, sells it and has it in stock, and never when its description names or links another retailer or gives its phone number (17 descriptions still do; OPEN-QUESTIONS B3). A product with a required option or modifier (85 diabetes products carry a required "Test" modifier today) gets "Choose options", a link to its page, instead of a one-click add. No kit is listed (A4). One switch, `SHOP_SWITCH.placements`, turns every strip off. Every placed id is health-revealing by id for analytics (`sensitive-products.ts`). The strip's words are `ui.chapter.shop.*` (French machine-drafted, not behind a review gate, as on Ostomy).

| # | Key | Change | Why |
|---|---|---|---|
| 1 | card 2 strip | `portions`: Meal Measure Unit (4382), "Choose options" ("Test" modifier) | B21 |
| 2 | card 3 strip | `moving`: Dex4 key chain (4731), FlipBelt (4529). The SPIbelts are sold out | B21 |
| 3 | card 6 strip | `flying`: Frio wallet (4844), Pen Plus travel case (4255), sharps container (4350) | B21 |
| 4 | card 8 strip | `feet`: Infracare socks (5040). The two diabetic foot creams (7342 MagniLife, 7332 Lakota) make symptom claims and are left out until the nurse rules (OPEN-QUESTIONS B21); no monofilament is stocked | B21 |
| 5 | `shelf` (meta and messages, EN and FR) | New resources shelf, Ostomy's shape, between the band and the pharmacist panel: **Mental health and support** (9-8-8; Diabetes Canada, Taking care of your mental health; Breakthrough T1D Canada, Mental health support, French page on perceedt1.ca), **Travel** (CATSA, Diabetic supplies, with its French page; Diabetes Canada, Air travel; Diabetes Québec, Trips / « Voyages »), **Your rights** (Diabetes Canada, The rights of people living with diabetes; Canadian Human Rights Commission, Human rights complaints, with its French page), **Learning about diabetes** (Diabetes Canada, Virtual Diabetes Education Program; Diabetes Québec, InfoDiabetes Service / « Service InfoDiabète »). Official Canadian pages only; no industry page, no retailer. Each link names its publisher and says when the page is in the other language. Behind the `shelf` French gate on /fr | B28 |
| 6 | register | New, each opened 2026-10-06: `chrc-human-rights-complaints` (EN and FR), `dc-virtual-diabetes-education-program` (no French page), `dq-infodiabetes-service` and `dq-trips` (Diabète Québec's own EN and FR pages). `catsa-diabetic-supplies` gains its French page « Fournitures pour diabétiques »; `bt1d-mental-health-support` gains « Soutien en santé mentale » on perceedt1.ca. Diabetes Canada's support line (named in H18) is not on the shelf: no page for it is registered | B28 |

### F.8 Full-site review (2026-10-06)

No copy changed in this chapter. Engine-wide changes (the pharmacist panel heading's contrast, the shop strips on narrow phones) are in new-to-the-journey.md F.8. The resources shelf keeps Ostomy's twin markup: whether to restyle it like Ostomy's `#chapter-resources` cards, and whether the strips should use one pattern on both sites, are design questions (OPEN-QUESTIONS B45). Card 8's strip (the pinned urgent foot card) shows a product named "Infracare Socks for cold feet due to Diabetes…": B42.
