# 05 · Know Your Type — chapter copy after source check (DiabetesCare.chapters.know-your-type)

Version of 2026-10-05, after the source check in `content/know-your-type.verify.md` (96 rows: 83 Confirmed, 12 Partly, 1 Not confirmed, plus 5 safety notes and 4 labelling gaps). Every Partly and Not confirmed row is now reworded to its source, re-cited, or held, and every safety and labelling note is applied. Section F lists each change. Not compiled, not in the repo. It starts from `dx/types-design.md` and applies every correction in `dx/types-verify.md`. The shape follows the finished staying-safe entry in `diabetes-care/chapters/chapters-meta.ts` and `DiabetesCare.chapters.staying-safe` in `core/messages/en.json`. The one difference is that this chapter has **no `urgent` block**: only Staying Safe has one, and this chapter uses `urgentExit` to point to `/liivv-health/diabetes-care/chapters/staying-safe#red-flags`.

Ground rules applied:
- **Sources.** Every SourceId below exists in `diabetes-care/chapters/sources-meta.ts` (checked by script against `SOURCE_META`). No FAIL source is cited: Hart 2016 (type 3c) is not in the register, and the ADA 2026 Summary of Revisions is replaced by `ada-soc-2026-s2-summary` (the Guideline Central summary of the whole 2026 Standards, which carries the Section 2 recommendations; its register label needs fixing, D check 5). The abstract-only entries (`brown-lipodystrophy-guideline-2016`, `sharif-ptdm-consensus-2014`, `naylor-…`) are not cited (policy 6). No industry page is cited: the Sanofi page was dropped once Breakthrough T1D gave the teplizumab indication.
- **Verification corrections applied** (types-verify.md):
  - The S5/S22/S30/S39 claims are re-cited. The ">40% first treated as type 2" figure is cited to Holt only. HNF1B "usually insulin" is cited to Diabetes UK. Cancer immunotherapy and transplant are cited to the ADA Section 2 summary and CPG Ch 20, not Appendix 2. Everything that cited the ADA Summary of Revisions now cites the Section 2 summary, or is held.
  - The ">95% of people over 50 have type 2" line is dropped.
  - The type 3c detail (how common it is, 79%, lows 78%/17%, impaired glucagon, the cancer clue, enzyme clues) is **HELD**, and so is the name "type 3c".
  - Hemochromatosis now reads "about 1 in 300 Canadians **have two copies of the gene change** that puts them at risk", and "fewer than 1 in 10 of them develop the disease" (BC). It no longer says the condition "affects 1 in 300".
  - Youth antibody testing reads "**should be considered**".
  - MODY prevalence shows both figures: 1–2% (Diabetes UK, Exeter) and 1–5% (NIDDK).
  - There is no "about 40%" figure for the neonatal potassium-channel types, and no "ideally with CGM".
  - Also corrected:
    - "type 1.5" is cited to Breakthrough T1D, Buzzetti and Diabetes UK, not to CPG Ch 3;
    - time to insulin: the earlier "within 3 years" (Holt) was wrong. The fresh full-text check found no such clue in Holt, and found "time to needing insulin <1 to 2 years" in CPG Ch 3. The clue now reads "within 1 to 2 years", cited to Ch 3 (Canadian). This overrides `dx/types-verify.md` rows S1 and S12;
    - DKA teaching after a positive screen is cited to Phillip 2024, not to TrialNet;
    - the stage 3 wording claims nothing beyond "type 1 is diagnosed";
    - "doctor or NP" became "your doctor or specialist";
    - "C-peptide is insured in Ontario" is held;
    - the LADA "CGM is standard" line is held.
- **International cards are labelled.** Cards 7–10 rest mainly on non-Canadian sources and carry `badge: "International guidance"`, which the engine renders as "Title · International guidance". In the mostly-Canadian cards, each sentence that rests on an international source names the source in the sentence ("International guidance…", "An international consensus…"). The glossary carries one line saying which meanings come from international guidance. Ruling K11 covers this.
- **Insulin safety line.** Cards 6, 8 and 9 tell readers their type, and so their treatment, may change. Each now carries a visible note: "Don’t stop or lower insulin because of anything on this page. Any change is made with your specialist." It says "don’t", not "never", because the voice rule allows "never" only where a source says it.
- **No kits and no brand recommendations in the copy. Since 2026-10-06 (B21) cards 1, 2, 4, 7 and 11 to 13 carry shop strips (`chapter-shop.ts`; F.7); card 3 (prediabetes) never has one.** Tzield is named only in the flagged teplizumab line (K7), as a drug's name, not as a product.
- **No Diabetes Express** mention or link.
- **No dosing, no titration, no drug classes recommended.** Where a source names a treatment route (insulin or tablets), the copy says a specialist or the team decides. No drug class is named.
- **Clinical defaults pending the nurse** (from Staying Safe): low = below 3.9 mmol/L; ½ cup juice; ketone ladder written for type 1; "follow your leaflet" for in-use insulin; no alcohol limits stated; FIT guide treated as industry-run (its lines held). This chapter **restates none of these numbers**. It sends readers to Staying Safe for lows, ketones and glucagon, so the defaults apply only through those links (see D, K16).

---

## A) META OUTLINE

### A.1 Additions this entry needs (beyond what staying-safe already uses)

- **NEW groups** under `DiabetesCare.ui.chapter.groups`:
  - `commonTypes`: "The common types"
  - `lessCommonTypes`: "Less common types"
- **NEW site figure kinds** for `DiabetesFigureMeta`: `cluesChecklist` (card 6), `testGlossary` (card 6) and `familyTree` (card 8). Each needs:
  - a French review gate of the same name in `GATED_KINDS` (review-gates.ts);
  - an entry in `DIABETES_SITE.kinds` (site.ts);
  - a drawing in site-figures.tsx.
  - The full specification is in section G.
- **Ask roles.** No new role is used structurally. Cards that would use a proposed role carry an existing one for now; the code comment names the proposed role (K10).
  - Proposed roles: `geneticCounsellor` ("Ask a genetic counsellor"), `cfClinic` ("Ask your CF clinic team"), `prescriber` ("Ask your prescriber"), `giSpecialist` ("Ask your GI specialist").
  - Each would need `ui.chapter.ask.<role>` and `ui.chapter.roleNames.<role>` before it is used.
- **Uses the existing `badge`** on category messages (`CategoryMessages.badge`, rendered by `chapter-page.tsx`) for "International guidance".
- **`chapter:know-your-type`** French review gate. The slug is already in `ChapterSlug`.
- **No `urgent` block** and no `urgentContent: true` card. No card carries a 911 or same-day line, so nothing has to be pinned open. Emergency signs live only in Staying Safe, reached through `urgentExit`.

### A.2 Proposed CHAPTER_META entry

```ts
/*
 * 05 · Know Your Type. Copy: DiabetesCare.chapters.know-your-type, draft of
 * 2026-10-05 (content/know-your-type.md). Its open rulings (K1–K24) are
 * with the nurse. Cards 7–10 carry the "International guidance" badge in their
 * messages.
 */
{
  slug: 'know-your-type',
  num: '05',
  chapterWord: 'five',
  heroImage: `${IMG}/chapter-journey.png`,   // stand-in; image set not chosen
  accent: '#cfdcef',                          // placeholder
  rail: false,
  majorSections: true,
  /* Exactly two segments: the common types, and the less common types. */
  startHere: { groups: ['commonTypes', 'lessCommonTypes'] },
  /* No red-flag block of its own: the signpost goes to Staying Safe's #red-flags. */
  urgentExit: { chapter: 'staying-safe' },
  categories: [
    /* ---------- The common types ---------- */
    {
      // 1 Type 1, including in adults.
      image: `${IMG}/chapter-type1.png`,
      group: 'commonTypes',
      ask: 'endo',
      sources: [
        'dc-type-1',
        'bt1d-facts-and-figures',
        'dc-cpg-ch3-classification-diagnosis',
        'dc-cpg-ch41-t1d-lifespan-2025',
      ],
    },
    {
      // 2 Type 2. The diagnostic numbers as three columns.
      image: `${IMG}/chapter-type2.png`,
      group: 'commonTypes',
      ask: 'primaryCare',
      // Item 8 (with symptoms, don't wait for a second test) added by the source check.
      figures: [{ kind: 'columns', columns: [[4], [5], [6]], lead: [1, 2, 3], neutral: [7, 8, 9] }],
      sources: ['dc-type-2', 'dc-cpg-ch3-classification-diagnosis', 'dc-cpg-ch35-t2d-children'],
    },
    {
      // 3 Prediabetes. Same three columns as card 2, prediabetes ranges. No shop strip, on purpose.
      image: `${IMG}/chapter-prediabetes.png`,
      group: 'commonTypes',
      ask: 'primaryCare',
      // Item 6 (many people with prediabetes go on to type 2) released by the source check.
      figures: [{ kind: 'columns', columns: [[2], [3], [4]], lead: [1], neutral: [5, 6] }],
      sources: ['dc-cpg-ch3-classification-diagnosis', 'dc-prediabetes'],
    },
    {
      // 4 Gestational, or from before pregnancy. The after-birth reminder: three blank lines.
      image: `${IMG}/chapter-gestational.png`,
      group: 'commonTypes',
      ask: 'team',
      figures: [{ kind: 'takeIn', fields: 3 }],
      sources: [
        'dc-cpg-ch36-pregnancy',
        'sogc-glucose-testing',
        'dc-gestational-diabetes',
        'exeter-gck-pregnancy-2018',
      ],
    },
    {
      // 5 Type 1 starts before symptoms. Stages as three columns; screening routes beneath.
      // Item 10 (teplizumab) is open ruling K7.
      image: `${IMG}/chapter-journey.png`,
      group: 'commonTypes',
      ask: 'primaryCare',
      figures: [
        { kind: 'columns', columns: [[2], [3], [4]], lead: [1], neutral: [5, 6, 7, 8, 9, 10] },
      ],
      sources: [
        'bt1d-stages-and-diagnosis',
        'ada-soc-2026-s2-summary',
        'phillip-pre-stage-3-monitoring-2024',
        'bt1d-trialnet',
        'canscreen-t1d',
        'dc-cpg-ch41-t1d-lifespan-2025',
        'dc-tzield-access-2026',
        // Non-industry, and gives the indication itself ("8 years of age and older with
        // Stage 2"), so the Sanofi page is no longer cited on this card.
        'bt1d-tzield-update-2026',
      ],
    },

    /* ---------- Less common types ---------- */
    {
      // 6 Could my type be different? Four sections. The clues checklist carries the
      // whole card, with section 2 as tick boxes, and prints the card's note as its
      // fixed "Not a diagnostic tool" banner. The glossary sits beneath it.
      image: `${IMG}/chapter-new.png`,
      group: 'lessCommonTypes',
      ask: 'team',
      // The banner, with the insulin safety line, stays outside the collapsible region,
      // and stays on /fr when the checklist is gated.
      noteVisible: true,
      figures: [
        {
          kind: 'cluesChecklist',
          section: 2,
          questions: 5,
          sources: [
            'dc-cpg-ch3-classification-diagnosis',
            'holt-t1d-adults-consensus-2021',
            'ada-soc-2026-s2-summary',
            'diabetes-uk-mody',
            'exeter-midd',
            'dc-cpg-appendix-2-classification',
            'dc-cpg-ch20-transplantation',
          ],
        },
        {
          kind: 'testGlossary',
          terms: 6,
          // figure.glossaryNote, drawn under the heading, labels the international meanings.
          sources: [
            'holt-t1d-adults-consensus-2021',
            'buzzetti-lada-consensus-2020',
            'bt1d-lada',
            'phillip-pre-stage-3-monitoring-2024',
            'exeter-c-peptide-antibody-tests',
            'dc-cpg-ch3-classification-diagnosis',
            'dc-cpg-ch9-monitoring-2021',
            'dc-cpg-ch36-pregnancy',
            'ispad-2022-ch4-monogenic',
            'exeter-mody-testing-guidelines',
          ],
        },
      ],
      sources: [
        'dc-cpg-ch3-classification-diagnosis',
        'dc-cpg-ch35-t2d-children',
        'holt-t1d-adults-consensus-2021',
        'exeter-what-is-mody',
        'diabetes-uk-mody',
        'exeter-midd',
        'dc-cpg-appendix-2-classification',
        'ada-soc-2026-s2-summary',
        'dc-cpg-ch20-transplantation',
        'exeter-c-peptide-antibody-tests',
        'ispad-2022-ch4-monogenic',
        'on-health-genetics-clinics',
        'sbgh-anti-gad65',
        'bcdiabetes-autoantibody-testing',
        'on-form-014-4521-84',
        'phsa-out-of-province-test-requests',
        'chusj-genetic-tests-not-available',
      ],
    },
    {
      // 7 LADA. Badge "International guidance" (management rests on Buzzetti).
      // Questions to bring: three blank lines.
      image: `${IMG}/chapter-essentials.png`,
      group: 'lessCommonTypes',
      ask: 'endo',
      figures: [{ kind: 'takeIn', fields: 3 }],
      sources: [
        'bt1d-lada',
        'buzzetti-lada-consensus-2020',
        'diabetes-uk-lada',
        'dc-cpg-ch3-classification-diagnosis',
      ],
    },
    {
      // 8 MODY. Badge "International guidance". Subtypes as three columns, then the
      // family tree. Proposed ask: geneticCounsellor (K10). The note carries the
      // insulin safety line, so it stays visible.
      image: `${IMG}/chapter-everyday.png`,
      group: 'lessCommonTypes',
      ask: 'endo',
      noteVisible: true,
      figures: [
        {
          kind: 'columns',
          columns: [[6], [7], [8]],
          lead: [1, 2, 3, 4, 5],
          neutral: [9, 10, 11, 12],
        },
        {
          kind: 'familyTree',
          sides: [
            { side: 'yours', rows: [1, 2, 3] },
            { side: 'mothers', rows: [4, 5, 6, 7] },
            { side: 'fathers', rows: [8, 9, 10, 11] },
          ],
          columns: ['hasDiabetes', 'ageAtDiagnosis', 'typeTold', 'insulinSoon', 'hearingLoss'],
          sources: [
            'dc-cpg-ch3-classification-diagnosis',
            'diabetes-uk-mody',
            'exeter-mody-testing-guidelines',
            'exeter-midd',
          ],
        },
      ],
      sources: [
        'diabetes-uk-mody',
        'exeter-what-is-mody',
        'niddk-monogenic',
        'dc-cpg-ch3-classification-diagnosis',
        'exeter-mody-testing-guidelines',
        'murphy-monogenic-precision-diagnostics-2023',
        'ispad-2022-ch4-monogenic',
        'exeter-hnf1b-mody',
        'exeter-gck-pregnancy-2018',
        'patel-cpsp-monogenic-2023',
      ],
    },
    {
      // 9 Diabetes in babies. Badge "International guidance". No "about 40%" figure (verify).
      // The note carries the insulin safety line, so it stays visible.
      image: `${IMG}/care-chat-main.png`,
      group: 'lessCommonTypes',
      ask: 'endo',
      noteVisible: true,
      sources: [
        'dc-cpg-ch3-classification-diagnosis',
        'exeter-about-neonatal-diabetes',
        'niddk-monogenic',
        'ispad-2022-ch4-monogenic',
        'exeter-sulfonylurea-treatment',
      ],
    },
    {
      // 10 Genetic syndromes. Badge "International guidance". Wolfram (column 2) is open
      // ruling K8; drop item 6 and its column together. Proposed ask: geneticCounsellor (K10).
      image: `${IMG}/closing.png`,
      group: 'lessCommonTypes',
      ask: 'endo',
      figures: [{ kind: 'columns', columns: [[2, 3, 4, 5], [6], [7]], lead: [1], neutral: [8] }],
      sources: ['ispad-2022-ch4-monogenic', 'exeter-midd', 'medlineplus-wolfram-syndrome'],
    },
    {
      // 11 Pancreas conditions and iron overload. The type 3c detail is HELD (Hart 2016
      // FAIL). Proposed ask: giSpecialist (K10).
      image: `${IMG}/hero.png`,
      group: 'lessCommonTypes',
      ask: 'team',
      figures: [{ kind: 'columns', columns: [[1], [2, 3, 4, 5, 6]] }],
      sources: [
        'dc-cpg-appendix-2-classification',
        'chs-hemochromatosis-condition',
        'chs-hemochromatosis-faq',
        'bc-guidelines-iron-overload',
        'chs-hemochromatosis-treatment',
      ],
    },
    {
      // 12 CFRD. Canadian (CF Canada 2024) first; ISPAD and ADA named in the sentence. Proposed ask: cfClinic (K10).
      image: `${IMG}/chapter-type1.png`,
      group: 'lessCommonTypes',
      ask: 'team',
      sources: [
        'dc-cpg-appendix-2-classification',
        'cf-canada-cfrd-guideline-2024',
        'ispad-2022-cfrd',
        'ada-soc-2026-s2-summary',
      ],
    },
    {
      // 13 Medicines and transplant. Four columns. The "before you change a medicine"
      // note stays visible (K12). Proposed ask: prescriber (K10).
      image: `${IMG}/chapter-type2.png`,
      group: 'lessCommonTypes',
      ask: 'pharmacist',
      noteVisible: true,
      figures: [
        {
          kind: 'columns',
          columns: [[2], [3, 4, 5], [6], [7, 8, 9]],
          lead: [1],
          neutral: [10],
        },
      ],
      sources: [
        'dc-cpg-appendix-2-classification',
        'dc-cpg-ch16-in-hospital',
        'dc-cpg-ch18-mental-health',
        'ada-soc-2026-s2-summary',
        // Item 6: checkpoint-inhibitor diabetes "may present with… diabetic ketoacidosis".
        'holt-t1d-adults-consensus-2021',
        'dc-cpg-ch20-transplantation',
        'sharif-ptdm-consensus-2024',
      ],
    },
  ],
  /* Band "Who does the testing": four cards, no links. */
  programsBandLinks: [[], [], [], []],
  /*
   * Each band card's body names a chapter card by its exact title, which then
   * links to it: Could my type be different? (6), MODY: single-gene diabetes (8),
   * Type 1 starts before symptoms (5), Cystic fibrosis-related diabetes (12).
   */
  programsBandCards: [6, 8, 5, 12],
  bandSources: [
    'sbgh-anti-gad65',
    'bcdiabetes-autoantibody-testing',
    'dc-cpg-ch3-classification-diagnosis',
    'on-health-genetics-clinics',
    'on-form-014-4521-84',
    'phsa-out-of-province-test-requests',
    'chusj-genetic-tests-not-available',
    'bt1d-trialnet',
    'cf-canada-cfrd-guideline-2024',
  ],
  pharmacistImage: `${IMG}/care-chat-main.png`,
  pharmacistHref: PHARMACIST_CDE_REQUEST_HREF,
  resourceLinks: [],
  /* Titles and links as the register has them (sources-meta.ts). */
  citations: [
    {
      label:
        'Diabetes Canada — Definition, Classification and Diagnosis of Diabetes, Prediabetes and Metabolic Syndrome',
      href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-3',
    },
    {
      label: 'Breakthrough T1D — Stages and diagnosis of T1D',
      href: 'https://breakthrought1d.ca/t1d-basics/stages-and-diagnosis-of-t1d/',
    },
    {
      label: 'Breakthrough T1D — TrialNet',
      href: 'https://breakthrought1d.ca/research/clinical-trials/trialnet/',
    },
    {
      label: 'Breakthrough T1D — Latent autoimmune diabetes in adults',
      href: 'https://breakthrought1d.ca/newly-diagnosed/latent-autoimmune-diabetes-in-adults/',
    },
    {
      label:
        'Cystic Fibrosis Canada — Cystic Fibrosis Related Diabetes: A First Canadian Clinical Practice Guideline (2024)',
      href: 'https://cystic-fibrosis.cdn.prismic.io/cystic-fibrosis/ZvGg0bVsGrYSvuX4_NA-ENG2024CFRDGuidelines-Branded-.pdf',
    },
    {
      label:
        'ISPAD — Clinical Practice Consensus Guidelines 2022: The diagnosis and management of monogenic diabetes in children and adolescents',
      href: 'https://doi.org/10.1111/pedi.13426',
    },
  ],
},
```

### A.3 Type additions (chapters-meta.ts, `DiabetesFigureMeta`)

```ts
  /*
   * "Clues to mention" (card 6). RESTYLES the card. It draws every section, with
   * section `section` as tick boxes and the card's note as a fixed banner above
   * them ("Not a diagnostic tool"). There is no score, count or result, and
   * nothing ticked is saved or sent. The print button produces "Questions to
   * bring to your team": the clues ticked (or all of them if none are), then the
   * `questions` lines from `figure.questions.<n>`, each with space to write.
   * The count is structural, so a translation can neither add a question nor drop one.
   */
  | { kind: 'cluesChecklist'; section: number; questions: number; sources: SourceId[] }
  /*
   * Test names in plain words (card 6). AUGMENTS. `terms` entries from
   * `figure.terms.<n>.{term,meaning}`, drawn as a definition list.
   */
  | { kind: 'testGlossary'; terms: number; sources: SourceId[] }
  /*
   * The family diabetes tree (card 8), a printable table. AUGMENTS. Rows
   * (`figure.familyTree.rows.<n>`) are grouped by side of the family; the
   * columns are structural keys labelled from `figure.familyTree.columns.<key>`.
   * Typed answers stay in the browser tab and are never stored or sent.
   */
  | {
      kind: 'familyTree';
      sides: Array<{ side: 'yours' | 'mothers' | 'fathers'; rows: number[] }>;
      columns: Array<'hasDiabetes' | 'ageAtDiagnosis' | 'typeTold' | 'insulinSoon' | 'hearingLoss'>;
      sources: SourceId[];
    }
```

`DIABETES_SITE.kinds` additions:
- `module: ['cluesChecklist', 'familyTree']`: both have controls.
- `restyle: ['cluesChecklist']`.
- `noteCarrying: ['cluesChecklist']`: the banner is the card's note.
- `fullWidth: ['cluesChecklist', 'familyTree']`.

`GATED_KINDS` additions: `cluesChecklist`, `testGlossary` and `familyTree`, each with a gate id of the same name.

---

## B) EN MESSAGES — `DiabetesCare.chapters.know-your-type`

Also needed outside this subtree:
- `DiabetesCare.ui.chapter.groups.commonTypes`: "The common types"
- `DiabetesCare.ui.chapter.groups.lessCommonTypes`: "Less common types"
- the site-figure control words in section G (`DiabetesCare.ui.cluesChecklist`, `DiabetesCare.ui.familyTree`).

```json
{
  "title": "Know Your Type",
  "heroBody": "The common types of diabetes, the less common ones, and the clues that your type might be different. Your team decides your type. This chapter helps you ask.",
  "focus": "The common types: type 1 at any age, type 2, prediabetes, gestational diabetes, and how type 1 starts before symptoms. Less common types: when your type might be different, LADA, MODY, diabetes in babies, genetic syndromes, pancreas conditions and iron overload, cystic fibrosis-related diabetes, and diabetes from medicines or after a transplant.",
  "vibe": "Clear and curious: what each type is, and the right questions to ask.",
  "categoriesIntro": {
    "eyebrow": "Your type, explained",
    "heading": "What your type means",
    "body": "Most people have one of the common types. Some have a less common type, and for some the type becomes clearer over time. This chapter explains each one, and the clues worth raising with your team. Your team decides your type."
  },
  "startHere": {
    "heading": "One of the common types, or something less common?",
    "pivot": "Your type",
    "segments": {
      "1": {
        "label": "The common types"
      },
      "2": {
        "label": "Less common types"
      }
    }
  },
  "categories": {
    "1": {
      "title": "Type 1, including in adults",
      "items": {
        "1": "About 10% of people with diabetes have type 1. In type 1, the pancreas makes no insulin, so insulin is taken by injection or with a pump",
        "2": "Type 1 can start in adulthood. Breakthrough T1D says about 71% of Canadians with type 1 were diagnosed as adults",
        "3": "Breakthrough T1D also says 85% have no family connection to type 1",
        "4": "Signs your team looks for include type 1 antibodies in the blood, very little insulin of your own (a low C-peptide), and a risk of diabetic ketoacidosis (DKA)",
        "5": "Diabetes Canada’s 2025 type 1 guideline names automated insulin delivery as the preferred option for anyone willing and able to use it. Otherwise, it recommends a sensor (CGM) with a pump or with injections"
      },
      "note": "Ketones and DKA are covered in Staying Safe. The test names are explained in Could my type be different?"
    },
    "2": {
      "title": "Type 2",
      "items": {
        "1": "Type 2 is the most common type. Diabetes Canada says 90 to 95% of people with diabetes have it",
        "2": "Risk factors include being over 40, having diabetes in your family, and your ethnic background. Type 2 may cause no symptoms",
        "3": "Diabetes Canada diagnoses diabetes with any one of these results:",
        "4": "A fasting blood sugar of 7.0 mmol/L or higher",
        "5": "An A1C of 6.5% or higher, in adults. It isn’t used when type 1 is suspected",
        "6": "A blood sugar of 11.1 mmol/L or higher, 2 hours after a glucose drink or at any time of day",
        "7": "Without symptoms, a second test on another day confirms it",
        "8": "With symptoms of high blood sugar, Diabetes Canada says the diagnosis is made without a second test, and treatment shouldn’t be delayed. Contact your doctor without waiting. Emergency signs are in Staying Safe",
        "9": "For children and teens with type 2, Diabetes Canada says antibody testing should be considered, because up to 10 to 20% test positive"
      },
      "note": "If your diabetes doesn’t fit the usual picture, see Could my type be different?",
      "figure": {
        "columns": {
          "1": {
            "heading": "Fasting"
          },
          "2": {
            "heading": "A1C"
          },
          "3": {
            "heading": "2-hour or any time"
          }
        }
      }
    },
    "3": {
      "title": "Prediabetes",
      "items": {
        "1": "Prediabetes means a blood sugar above the usual range, but below the numbers for diabetes. Diabetes Canada uses any one of these results:",
        "2": "A fasting blood sugar of 6.1 to 6.9 mmol/L",
        "3": "An A1C of 6.0 to 6.4%",
        "4": "A blood sugar of 7.8 to 11.0 mmol/L, 2 hours after a glucose drink",
        "5": "Diabetes Canada’s Prediabetes page links to the CANRISK test",
        "6": "Not everyone with prediabetes goes on to develop type 2, but Diabetes Canada says many people do"
      },
      "note": "Ask your doctor what your numbers mean for you, and when to test again.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Fasting"
          },
          "2": {
            "heading": "A1C"
          },
          "3": {
            "heading": "2-hour"
          }
        }
      }
    },
    "4": {
      "title": "Gestational, or diabetes from before pregnancy?",
      "items": {
        "1": "Gestational diabetes is high blood sugar first found during pregnancy. Diabetes from before pregnancy, type 1 or type 2, was diagnosed before you conceived",
        "2": "Diabetes that is clearly there early in pregnancy is counted on its own, as overt diabetes, not as gestational diabetes",
        "3": "If you’re at high risk, Diabetes Canada’s guideline includes an A1C test before 20 weeks",
        "4": "Screening for gestational diabetes is offered between 24 and 28 weeks",
        "5": "Diabetes Canada says gestational diabetes affects 3 to 20% of pregnancies and usually goes away after birth. It raises the chance of type 2 and heart disease later",
        "6": "After the birth, Diabetes Canada recommends a glucose tolerance test between 6 weeks and 6 months",
        "7": "International guidance from the University of Exeter says a steady fasting blood sugar of 5.5 to 8 mmol/L, with diabetes in the family, can point to a single-gene type called GCK-MODY. If that sounds like you, tell your team early in pregnancy"
      },
      "note": "Fill in the reminder with your team before the birth. Pregnancy with type 1 or type 2 is covered in This Might Be You.",
      "figure": {
        "heading": "After the birth: my reminder",
        "fields": {
          "1": "My baby’s birth date",
          "2": "My glucose tolerance test, between 6 weeks and 6 months after the birth, is booked for",
          "3": "Who orders it, and where I go"
        }
      }
    },
    "5": {
      "title": "Type 1 starts before symptoms",
      "items": {
        "1": "Type 1 starts before there are symptoms. Breakthrough T1D describes stages 1 and 2 coming before diagnosis, and international guidance defines the stages like this:",
        "2": "Stage 1: two or more type 1 antibodies, with normal blood sugar",
        "3": "Stage 2: antibodies, with blood sugar starting to rise above normal",
        "4": "Stage 3: type 1 diabetes is diagnosed",
        "5": "Breakthrough T1D says two or more antibodies that last over time mean a high risk of type 1. Only 10 to 15% of people newly diagnosed have a family history",
        "6": "TrialNet screens relatives of people with type 1 at no cost, with a home finger-stick kit or a lab visit, anywhere in Canada. Immediate relatives aged 2 to 45 and other relatives aged 2 to 20 can take part. Results take 4 to 6 weeks",
        "7": "Breakthrough T1D also lists FEDERATE-Can, in Quebec. CanScreen, a Canadian research program on screening newborns and children, says it is launching in fall 2026 or winter 2027",
        "8": "Diabetes Canada’s 2025 type 1 guideline makes no recommendation about screening",
        "9": "People who test positive are followed over time. International guidance says they should be taught, and reminded, about the signs of diabetes and DKA",
        "10": "In May 2025, Health Canada approved teplizumab (Tzield) for people aged 8 and older in stage 2. Diabetes Canada says it isn’t on any provincial or territorial drug plan. It’s available out of pocket, through private insurance, or through compassionate access"
      },
      "note": "Whether to screen, and what a result means, is a conversation with your doctor. A screening result isn’t a diagnosis.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Stage 1"
          },
          "2": {
            "heading": "Stage 2"
          },
          "3": {
            "heading": "Stage 3"
          }
        }
      }
    },
    "6": {
      "title": "Could my type be different?",
      "sections": {
        "1": {
          "heading": "Why the type matters",
          "items": {
            "1": "Your diabetes team decides your type. Diabetes Canada says some cases are difficult to classify",
            "2": "An international consensus from the American Diabetes Association and the European Association for the Study of Diabetes found that more than 40% of people who develop type 1 after age 30 are first treated as type 2",
            "3": "Diabetes Canada says the right type may change your treatment. International guidance adds that it can show whether your family might be offered testing"
          }
        },
        "2": {
          "heading": "Clues to mention to your team",
          "items": {
            "1": "You were diagnosed at a younger age, or you’re not overweight",
            "2": "You lost weight without trying, or you’ve had ketones or DKA",
            "3": "You needed insulin within 1 to 2 years of diagnosis",
            "4": "Diabetes runs through generations of your family, such as a parent and a grandparent",
            "5": "You were diagnosed before 6 months of age",
            "6": "You have hearing loss, and there’s diabetes on your mother’s side of the family. International guidance links the two",
            "7": "You’ve had pancreas disease or surgery, or you have cystic fibrosis or iron overload (hemochromatosis)",
            "8": "Your diabetes started after a transplant, or after you began steroids, an antipsychotic, an anti-rejection medicine or cancer immunotherapy",
            "9": "You have a hormone condition, such as Cushing’s syndrome or acromegaly"
          }
        },
        "3": {
          "heading": "Tests that can help",
          "items": {
            "1": "Antibody tests look for signs of type 1. International guidance suggests testing for GAD antibodies first",
            "2": "A C-peptide test shows how much insulin your body still makes. It’s most useful months to years after diagnosis, and not during a very high blood sugar",
            "3": "Genetic tests look for single-gene types, such as MODY. A specialist usually arranges them",
            "4": "Diabetes Canada says antibody levels fade over time, and the tests aren’t accurate enough to use for everyone. International guidance recommends them for adults whose features overlap with type 1. Your team decides"
          }
        },
        "4": {
          "heading": "Getting tested in Canada",
          "items": {
            "1": "Your doctor or specialist orders these tests. In Manitoba, for example, the GAD antibody test is ordered by endocrinologists, and other doctors need an approval form",
            "2": "What’s covered varies by province. In BC, for example, the antibody tests aren’t covered by MSP",
            "3": "Genetic testing usually needs a referral. A test that isn’t offered in your province may need approval before it’s sent elsewhere"
          }
        }
      },
      "note": "Not a diagnostic tool. These clues are things to mention, not signs that your type is wrong. Your team decides what to test. Don’t stop or lower insulin because of anything on this page. Any change is made with your specialist.",
      "figure": {
        "legend": "Tick any that fit you",
        "printHeading": "Questions to bring to your team",
        "questions": {
          "1": "Does my type still fit, given the clues I’ve ticked?",
          "2": "Have I had antibody tests? What did they show?",
          "3": "Would a C-peptide test help, and when?",
          "4": "Should anyone in my family be tested?",
          "5": "Would a specialist or a genetics clinic help?"
        },
        "glossaryHeading": "Test names, in plain words",
        "glossaryNote": "Where Canadian guidance doesn’t explain a test, the meaning here comes from international guidance.",
        "terms": {
          "1": {
            "term": "GAD (GADA)",
            "meaning": "The antibody test most often done first when type 1 or LADA is possible."
          },
          "2": {
            "term": "IA-2, ZnT8 and IAA",
            "meaning": "Other type 1 antibodies, also used in screening. IA-2 and ZnT8 may be tested if the GAD test is negative."
          },
          "3": {
            "term": "C-peptide",
            "meaning": "Shows how much insulin your body still makes. It’s a blood or urine test."
          },
          "4": {
            "term": "A1C",
            "meaning": "A blood test that reflects your average blood sugar over the past 2 to 3 months. Diabetes Canada uses it to diagnose diabetes and prediabetes. With diabetes, it’s usually checked about every 3 months."
          },
          "5": {
            "term": "OGTT (glucose tolerance test)",
            "meaning": "Your blood sugar is checked 2 hours after a 75 g glucose drink."
          },
          "6": {
            "term": "Gene panel",
            "meaning": "A genetic test that looks at many diabetes genes at once."
          }
        }
      }
    },
    "7": {
      "title": "LADA: type 1 that starts slowly in adults",
      "badge": "International guidance",
      "items": {
        "1": "LADA (latent autoimmune diabetes in adults) is a slow-starting form of type 1. It’s sometimes called type 1.5",
        "2": "The usual pattern: it starts after age 30, antibodies are present, and insulin isn’t needed for at least the first 6 months",
        "3": "It’s often first diagnosed and managed as type 2",
        "4": "An antibody test, usually GAD, confirms it. International guidance says a C-peptide test helps guide treatment",
        "5": "Most people need insulin sooner than with type 2, and the timing varies widely. International guidance says it tends to come sooner with higher antibody levels, or more than one antibody",
        "6": "Breakthrough T1D describes a modified type 1 plan, which can include some type 2 medicines. International guidance says others are less suitable, so ask your team before any change",
        "7": "Estimates of how common it is range from 2 to 12% of adult diabetes (an international consensus) to about 10% (Breakthrough T1D)"
      },
      "note": "Bring these questions to your team. The signs of lows and ketones are in Staying Safe.",
      "figure": {
        "heading": "LADA: questions to bring to your team",
        "fields": {
          "1": "Have I had an antibody test? What did it show?",
          "2": "Would a C-peptide test help?",
          "3": "When should I check for ketones, and how?"
        }
      }
    },
    "8": {
      "title": "MODY: single-gene diabetes",
      "badge": "International guidance",
      "items": {
        "1": "MODY is caused by a change in a single gene. Diabetes UK and the University of Exeter say it’s 1 to 2% of diabetes. The US National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) says 1 to 5% of diabetes is single-gene, counting all types",
        "2": "Diabetes UK says about 9 in 10 people with MODY are first told they have another type",
        "3": "Clues include being diagnosed young, not being overweight, having no type 1 antibodies, and a parent with diabetes, in two or more generations",
        "4": "How young varies. Diabetes Canada and Diabetes UK use under 25. Other international guidance uses under 30, or 35 and under. Your team decides",
        "5": "It’s confirmed with a genetic test, usually after antibody and C-peptide tests",
        "6": "GCK: a mild, steady high blood sugar that usually needs no treatment",
        "7": "HNF1A and HNF4A: often treated with tablets rather than insulin. A specialist decides",
        "8": "HNF1B: can affect the kidneys, with cysts, and other organs. It’s usually treated with insulin",
        "9": "Each child of a parent with MODY has a 50% chance of inheriting it. Once the family’s gene change is known, relatives can be tested, and genetic counselling can help",
        "10": "In pregnancy with GCK, care depends on whether the baby inherited it, so tell your team early. HNF4A can mean a larger baby, and low blood sugar in the newborn",
        "11": "In a Canadian study of children with single-gene diabetes, GCK was the most common type: 19 of 29 children",
        "12": "Most of the evidence comes from people of European ancestry. The usual clues are less reliable for people of other ancestries"
      },
      "note": "Don’t stop or lower insulin because of anything on this page. Any change is made with your specialist. Fill in the family tree before your appointment. It helps your team, or a genetic counsellor, see the pattern.",
      "figure": {
        "columns": {
          "1": {
            "heading": "GCK"
          },
          "2": {
            "heading": "HNF1A and HNF4A"
          },
          "3": {
            "heading": "HNF1B"
          }
        },
        "familyTree": {
          "heading": "My family diabetes tree",
          "intro": "For your appointment. Fill in what you know and leave the rest blank. It doesn’t work out a risk, and nothing you type is saved or sent.",
          "sides": {
            "yours": "Me and my children",
            "mothers": "My mother’s side",
            "fathers": "My father’s side"
          },
          "rows": {
            "1": "Me",
            "2": "My brothers and sisters",
            "3": "My children",
            "4": "My mother",
            "5": "Her mother",
            "6": "Her father",
            "7": "Her brothers and sisters",
            "8": "My father",
            "9": "His mother",
            "10": "His father",
            "11": "His brothers and sisters"
          },
          "columns": {
            "hasDiabetes": "Diabetes? (yes, no, not sure)",
            "ageAtDiagnosis": "Age when diagnosed",
            "typeTold": "The type they were told",
            "insulinSoon": "Needed insulin within 2 years?",
            "hearingLoss": "Hearing loss?"
          }
        }
      }
    },
    "9": {
      "title": "Diabetes in babies",
      "badge": "International guidance",
      "items": {
        "1": "Diabetes diagnosed before 6 months of age is usually caused by a single gene",
        "2": "Diabetes Canada says every baby diagnosed before 6 months should have genetic testing",
        "3": "The University of Exeter says it affects about 1 in 100,000 births. The US NIDDK says about 1 in 90,000, and describes it in the first 6 to 12 months",
        "4": "Some forms are temporary, and others are lifelong",
        "5": "The genetic result matters. For the potassium-channel types, international guidance says about 9 in 10 people can switch from insulin to tablets under specialist care, with more benefit the earlier it happens",
        "6": "Adults told they have type 1 who were diagnosed before 6 months should have their diagnosis reviewed"
      },
      "note": "Don’t stop or lower insulin because of anything on this page. Any change in treatment is planned with a specialist team."
    },
    "10": {
      "title": "Genetic syndromes with diabetes",
      "badge": "International guidance",
      "items": {
        "1": "Some single-gene types come with other health signs, such as hearing loss or vision loss",
        "2": "MIDD (maternally inherited diabetes and deafness) passes from a mother to all her children, though how much it affects each child varies. Fathers don’t pass it on",
        "3": "Diabetes starts at 37 on average, and insulin is usually needed within about 2 years",
        "4": "Hearing loss is common and often comes first. The heart, kidneys, eyes and gut can be affected too",
        "5": "A urine sample is preferred for the test",
        "6": "Wolfram syndrome is very rare, about 1 in 500,000 people, and both parents carry the gene. Diabetes usually starts around age 6, and vision loss from the optic nerve around age 11",
        "7": "Lipodystrophy affects where the body stores fat. Clues include little or unusually placed body fat, high triglycerides (a blood fat), and darkened skin in body folds",
        "8": "These are confirmed with genetic testing, arranged through a specialist"
      },
      "note": "If several of these sound familiar, ask your team whether a genetics referral would help.",
      "figure": {
        "columns": {
          "1": {
            "heading": "MIDD"
          },
          "2": {
            "heading": "Wolfram syndrome"
          },
          "3": {
            "heading": "Lipodystrophy"
          }
        }
      }
    },
    "11": {
      "title": "Pancreas conditions and iron overload",
      "items": {
        "1": "Diabetes Canada lists diseases of the pancreas as a cause of diabetes, including pancreatitis, surgery or injury to the pancreas, a growth in the pancreas, and cystic fibrosis",
        "2": "Hemochromatosis, where the body stores too much iron, is on the same list. The Canadian Hemochromatosis Society says it can affect the pancreas and lead to diabetes",
        "3": "About 1 in 300 Canadians have two copies of the gene change that puts them at risk. BC’s guideline says fewer than 1 in 10 of them develop the disease",
        "4": "An iron test isn’t part of a standard blood test, so it has to be asked for. A genetic test confirms hemochromatosis",
        "5": "Close family, such as parents, brothers, sisters and children, should be tested",
        "6": "Treatment removes blood regularly (phlebotomy). The society says it can mildly improve diabetes"
      },
      "note": "If you’ve had pancreas disease or surgery, ask your team what it means for your diabetes care. Lows and ketones are covered in Staying Safe.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Pancreas conditions"
          },
          "2": {
            "heading": "Iron overload (hemochromatosis)"
          }
        }
      }
    },
    "12": {
      "title": "Cystic fibrosis-related diabetes",
      "items": {
        "1": "Cystic fibrosis can affect the pancreas and lead to diabetes, called cystic fibrosis-related diabetes (CFRD)",
        "2": "It becomes more common with age. In Canada, 3.6% of people with CF under 18 have it, rising to 58.7% of adults over 35",
        "3": "Screening is yearly from age 10, through your CF clinic. Canada’s guideline starts with an A1C test and adds a glucose tolerance test when needed. International guidance prefers starting with the glucose tolerance test. Your clinic decides",
        "4": "Insulin is the main treatment, and the only medicine used for children. Cystic Fibrosis Canada says some adults may have other options",
        "5": "If you use insulin, ask your team for a plan for lows. Cystic Fibrosis Canada recommends glucagon and teaching for people on insulin. International guidance adds that the body’s own response to a low is weaker in CF",
        "6": "In pregnancy, if you don’t already have CFRD, a glucose tolerance test is done early, at 12 to 16 weeks or when the pregnancy is confirmed. If that one is normal, it’s repeated at 24 to 28 weeks",
        "7": "After a transplant, 25 to 50% of people with CF who didn’t have CFRD before develop diabetes",
        "8": "Yearly eye, kidney and nerve checks start 5 years after diagnosis",
        "9": "Your CF clinic works with a diabetes team, ideally including a diabetes educator"
      },
      "note": "Glucagon and the Rule of 15 are in Staying Safe."
    },
    "13": {
      "title": "From medicines, or after a transplant",
      "items": {
        "1": "Diabetes Canada lists some medicines that can cause diabetes, including steroids, some antipsychotics and some anti-rejection medicines",
        "2": "Diabetes Canada’s hospital guideline says 20 to 50% of people without diabetes who take steroids develop high blood sugar. Checking blood sugar for 48 hours after starting may be considered",
        "3": "Some antipsychotic medicines can cause weight gain and raise blood sugar and cholesterol",
        "4": "In children and teens, the risk of type 2 diabetes is 2 to 3 times higher, and the rise can show within the first year",
        "5": "Diabetes Canada recommends checking weight, blood pressure, blood sugar and cholesterol before you start, then on a schedule that differs for each check. Ask your prescriber when yours are due",
        "6": "International guidance from the American Diabetes Association says to check blood sugar before you start a checkpoint inhibitor, a type of cancer immunotherapy, and at every visit while you’re on it. An international consensus says this diabetes can come on with DKA",
        "7": "After a transplant, the risk depends on things like the steroid dose, some infections, and which anti-rejection medicine is used",
        "8": "Diabetes Canada’s guideline checks blood sugar before the transplant, in the first 3 months after it, and with an A1C at 3 and 12 months, then every year. International guidance prefers a glucose tolerance test. Your team decides",
        "9": "An international consensus says 20 to 40% of people who have a heart, lung or liver transplant develop diabetes",
        "10": "Know the signs of high blood sugar and ketones. They’re in Staying Safe"
      },
      "note": "Ask your prescriber or pharmacist before you change how you take any of these medicines.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Steroids"
          },
          "2": {
            "heading": "Antipsychotics"
          },
          "3": {
            "heading": "Cancer immunotherapy"
          },
          "4": {
            "heading": "After a transplant"
          }
        }
      }
    }
  },
  "programsBand": {
    "heading": "Who does the testing",
    "cards": {
      "1": {
        "heading": "Your doctor or specialist",
        "body": "Orders antibody, C-peptide and A1C tests. Some labs limit antibody tests to specialists unless an approval form is sent. Bring your clues: see Could my type be different?"
      },
      "2": {
        "heading": "A genetics clinic",
        "body": "Single-gene testing usually needs a referral. A test not offered in your province may need approval first. See MODY: single-gene diabetes."
      },
      "3": {
        "heading": "TrialNet, for relatives",
        "body": "Free type 1 antibody screening for relatives, at home or at a lab, anywhere in Canada. See Type 1 starts before symptoms."
      },
      "4": {
        "heading": "Your CF clinic",
        "body": "Yearly diabetes screening from age 10 for people with cystic fibrosis. See Cystic fibrosis-related diabetes."
      }
    }
  },
  "pharmacist": {
    "eyebrow": "Anywhere in Canada",
    "heading": "Questions about pump and sensor supplies",
    "body": "Liivv’s pharmacist CDEs answer pump and CGM supply questions for all of Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. Questions about your type, and the tests for it, belong with your diabetes team.",
    "cta": "Request a call"
  },
  "closing": {
    "heading": "Knowing your type",
    "body": "Your type shapes your care, and it can be looked at again if something doesn’t fit. Bring your clues and your questions to your team."
  },
  "governance": {
    "disclaimer": "This is general information, not medical advice, and it is not a diagnosis. Your diabetes team decides your type, which tests you need, and your treatment."
  },
  "urgentExit": {
    "lead": "Signs that need emergency care, for a low, a high or ketones, are in",
    "link": "Chapter 02 — Get emergency care now"
  }
}
```

---

## C) CLAIMS TABLE (after source check)

Key paths are relative to `DiabetesCare.chapters.know-your-type`. Every row was re-read against the live page on 2026-10-05 (`know-your-type.verify.md`); rows the check marked Partly or Not confirmed carry "verify 2" and the change in section F. As in staying-safe card 1 ("Level 1: …"), an item shown under a column heading repeats its label ("Stage 1: …", "GCK: …"), so the plain list reads on its own. Facts are as the source check (`dx/types-verify.md`) and the register locators (`sources-review.ts`) record them.

**Check** column:
- **C**: confirmed as worded.
- **C\***: worded more conservatively than the source, or a plain-language rewording of a definition, recorded here.
- **K\<n\>**: rests on an open ruling.
- **INTL**: international source, labelled in the sentence or by the card badge.

| Key | Sentence (short) | SourceId | Fact on the source page | Check |
|---|---|---|---|---|
| heroBody / categoriesIntro.body | "Your team decides your type" | dc-cpg-ch3-classification-diagnosis | "some cases are difficult to classify"; classification is clinical | C\* (framing) |
| 1.items.1 | ~10% have type 1; no insulin made; injections or pump | dc-type-1 | "Roughly 10 per cent"; pancreas makes no insulin; injections or a pump | C |
| 1.items.2 | Can start in adulthood; ~71% diagnosed as adults | dc-type-1; bt1d-facts-and-figures | DC: "can also develop in adulthood"; BT1D: about 71% diagnosed as adults | C |
| 1.items.3 | 85% no family connection | bt1d-facts-and-figures | 85% have no family connection | C |
| 1.items.4 | Antibodies, low C-peptide, DKA risk | dc-cpg-ch3-classification-diagnosis | Table 2: T1 vs T2 (antibodies, C-peptide, DKA) | C |
| 1.items.5 | AID preferred; otherwise CGM with pump or injections | dc-cpg-ch41-t1d-lifespan-2025 | AID "preferred treatment method for all individuals" willing and able; otherwise CGM with pump or basal-bolus | C |
| 1.note | Cross-links to Staying Safe and card 6 | — | Navigation only | — |
| 2.items.1 | 90–95% have type 2 | dc-type-2 | 90–95% of cases | C |
| 2.items.2 | Over 40, family history, ethnicity; may have no symptoms | dc-type-2 | Risk factors age >40, family history, ethnicity; may have no symptoms | C |
| 2.items.3–6 | FPG ≥7.0; A1C ≥6.5% adults, not suspected T1; 2-h or random ≥11.1 | dc-cpg-ch3-classification-diagnosis | FPG ≥7.0, A1C ≥6.5% (adults, not suspected type 1), 2hPG or random ≥11.1 | C |
| 2.items.7 | Without symptoms, confirm on another day | dc-cpg-ch3-classification-diagnosis | "confirmed on another day without symptoms" | C |
| 2.items.8 | With symptoms, diagnosis made without a second test; treatment shouldn’t be delayed; contact doctor; emergency signs in Staying Safe | dc-cpg-ch3-classification-diagnosis | With symptomatic hyperglycemia the diagnosis is made and treatment "should not be delayed" | C (new, verify 2 safety note 2). Navigation to Staying Safe; no 911 or same-day wording, so no `urgentContent` (K23) |
| 2.items.9 | Youth: antibody testing "should be considered"; up to 10–20% positive | dc-cpg-ch35-t2d-children | "should be considered in all youth with clinical type 2"; "up to 10% to 20%" | C (verify fix; renumbered from 8) |
| 3.items.1 | Prediabetes is above the usual range, below diabetes | dc-cpg-ch3-classification-diagnosis | Prediabetes ranges sit between normal and the diabetes thresholds | C\* (definition derived from the thresholds) |
| 3.items.2–4 | IFG 6.1–6.9; A1C 6.0–6.4%; IGT 7.8–11.0 | dc-cpg-ch3-classification-diagnosis | As stated | C |
| 3.items.5 | DC Prediabetes page links to CANRISK | dc-prediabetes | Definition plus a link to the CANRISK test | C |
| 3.items.6 | Not everyone with prediabetes develops type 2, but many do | dc-prediabetes; dc-cpg-ch3-classification-diagnosis | dc-prediabetes: "not everyone… will develop type 2 diabetes, many people will". Ch 3: prediabetes "places individuals at high risk of developing diabetes" | C (released from E, verify 2 §4) |
| 4.items.1 | GDM first found in pregnancy; pre-existing diagnosed before conception | dc-cpg-ch36-pregnancy | GDM "first recognized in pregnancy"; pre-existing diagnosed before conception | C |
| 4.items.2 | Overt diabetes is its own category | dc-cpg-ch36-pregnancy | Overt diabetes a separate category | C |
| 4.items.3 | High risk: A1C before 20 weeks | dc-cpg-ch36-pregnancy | Early A1C before 20 weeks if high risk | C |
| 4.items.4 | Screening offered at 24–28 weeks | sogc-glucose-testing | Screening offered at 24–28 weeks | C |
| 4.items.5 | 3–20% of pregnancies; usually goes after birth; later T2D and heart disease | dc-gestational-diabetes | As stated | C |
| 4.items.6 | OGTT between 6 weeks and 6 months after birth | dc-cpg-ch36-pregnancy | Postpartum 75 g OGTT, 6 weeks–6 months | C |
| 4.items.7 | Steady fasting 5.5–8 with family history may be GCK-MODY; tell team early in pregnancy | exeter-gck-pregnancy-2018 | Persistent fasting 5.5–8 plus family history; contact the lab as soon as pregnancy is confirmed | C\*, INTL (clinician instruction reworded as "tell your team early") |
| 4.figure.fields.2 | Reminder line repeats 6 weeks–6 months | dc-cpg-ch36-pregnancy | As 4.items.6 | C |
| 5.items.1 | Type 1 starts before symptoms; stages 1 and 2 before diagnosis | bt1d-stages-and-diagnosis; ada-soc-2026-s2-summary | BT1D: the process runs "months or years before diagnosis… 'early stage T1D' (or stage 1 and stage 2)"; it never names stage 3. ADA §2: stages 1–3 defined | C after verify 2 fix ("before stage 3" → "before diagnosis"), INTL for the definitions (K13) |
| 5.items.2 | Stage 1: 2+ antibodies, normal sugar | ada-soc-2026-s2-summary; phillip-pre-stage-3-monitoring-2024 | Stage 1 = multiple antibodies with normal glucose | C, INTL (K13) |
| 5.items.3 | Stage 2: antibodies, sugar rising | ada-soc-2026-s2-summary; phillip-pre-stage-3-monitoring-2024 | Stage 2 = antibodies plus dysglycemia (Phillip: FPG 5.6–6.9, 2-h 7.8–11.0, HbA1c 39–47, or a 10% rise) | C, INTL (K13) |
| 5.items.4 | Stage 3: type 1 is diagnosed | ada-soc-2026-s2-summary; phillip-pre-stage-3-monitoring-2024 | ADA Table 2.4: stage 3 "Symptomatic". Phillip: stage 3 "with or without symptoms". The sources conflict, so the copy claims only "diagnosed" | C, INTL (K13) |
| 5.items.5 | 2+ persistent antibodies = high risk; 10–15% family history | bt1d-stages-and-diagnosis | As stated | C |
| 5.items.6 | TrialNet: no cost, home kit or lab, anywhere in Canada; 2–45 and 2–20; 4–6 weeks | bt1d-trialnet | As stated | C |
| 5.items.7 | FEDERATE-Can in Quebec; CanScreen launching fall 2026 / winter 2027 | bt1d-stages-and-diagnosis; canscreen-t1d | BT1D lists FEDERATE-Can; CanScreen "launching this fall 2026/winter 2027", newborns and children; a research consortium designing a pilot | C. Banner unchanged on 2026-10-05 (page modified 2026-06-10); re-check at publish |
| 5.items.8 | Ch 41 makes no screening recommendation | dc-cpg-ch41-t1d-lifespan-2025 | "no clinical practice recommendations" on screening, because of "lack of current treatment availability in Canada" | C |
| 5.items.9 | Positives followed; taught and reminded about diabetes and DKA signs | bt1d-trialnet; phillip-pre-stage-3-monitoring-2024 | TrialNet: positives monitored. Phillip: repeated teaching on diabetes and DKA symptoms | C, INTL for the teaching (verify fix: not cited to TrialNet) |
| 5.items.10 | HC approved teplizumab May 2025 for people aged 8 and older in stage 2; on no plan; out of pocket, private, compassionate | dc-tzield-access-2026; bt1d-tzield-update-2026 | DC: approved 5 May 2025; on no formulary; out of pocket, private insurance, compassionate access. BT1D: "8 years of age and older with Stage 2"; CDA-AMC "do not reimburse" (Jan 2026), INESSS (Oct 2025) | C, K7. Coverage unchanged on 2026-10-05. Both sources non-industry, so `sanofi-tzield-approval-2025` is no longer cited. The size of the delay stays HELD (Sanofi median 2 years vs BT1D average 3 years) |
| 5.note | "A screening result isn’t a diagnosis" | ada-soc-2026-s2-summary; phillip-pre-stage-3-monitoring-2024 | Stages 1–2 are pre-diagnosis; Phillip requires a second sample to confirm | C |
| 6.s1.1 | Team decides; "some cases are difficult to classify" | dc-cpg-ch3-classification-diagnosis | Quoted | C |
| 6.s1.2 | >40% of T1 after 30 first treated as T2 | holt-t1d-adults-consensus-2021 | ">40% of those developing type 1 diabetes after age 30 years are initially treated as having type 2" | C, INTL (verify fix: Holt only) |
| 6.s1.3 | DC: right type may change treatment. Intl: can show whether family might be offered testing | dc-cpg-ch3-classification-diagnosis; dc-cpg-ch35-t2d-children; exeter-what-is-mody | Ch 3: "may alter management". Ch 35: "may lead to more appropriate management". Exeter: subtype guides treatment, outlook and family counselling | C; treatment half re-cited to Canadian sources, family half labelled INTL in the sentence (verify 2 §3) |
| 6.s2.1 | Younger age, not overweight | holt-t1d-adults-consensus-2021; dc-cpg-ch3-classification-diagnosis | Holt: age <35, BMI <25. Ch 3: MODY no obesity; T1 younger | C |
| 6.s2.2 | Unplanned weight loss; ketones or DKA | holt-t1d-adults-consensus-2021; dc-cpg-ch3-classification-diagnosis | Holt: unintentional weight loss, ketoacidosis. Ch 3 Table 2: DKA | C |
| 6.s2.3 | Insulin within 1 to 2 years | dc-cpg-ch3-classification-diagnosis; ada-soc-2026-s2-summary | Ch 3, clinical indicators: "time to needing insulin <1 to 2 years". ADA 2.10: "short time to insulin treatment". Holt has no time-to-insulin clue (its "3 years" is about C-peptide timing) | C after verify 2 fix (was N: "within 3 years", Holt) |
| 6.s2.4 | Generations, e.g. parent and grandparent | dc-cpg-ch3-classification-diagnosis; diabetes-uk-mody | Ch 3: multigenerational. Diabetes UK: parent, two or more generations | C |
| 6.s2.5 | Diagnosed before 6 months | dc-cpg-ch3-classification-diagnosis | Genetic testing for all diagnosed <6 months | C |
| 6.s2.6 | Hearing loss with diabetes on mother’s side; "International guidance links the two" | exeter-midd | Maternal transmission; deafness in about 75%, often first | C, INTL, now labelled in the sentence (verify 2 §3) |
| 6.s2.7 | Pancreas disease or surgery, CF, iron overload | dc-cpg-appendix-2-classification | Pancreatitis, trauma or pancreatectomy, neoplasia, CF, hemochromatosis | C |
| 6.s2.8 | After transplant, steroids, antipsychotic, anti-rejection medicine, cancer immunotherapy | dc-cpg-appendix-2-classification; dc-cpg-ch20-transplantation; ada-soc-2026-s2-summary | App. 2: glucocorticoids, atypical antipsychotics, calcineurin inhibitors. Ch 20: post-transplant diabetes. ADA 2.20: checkpoint inhibitors | C (verify fix: immunotherapy and transplant not cited to App. 2) |
| 6.s2.9 | Hormone conditions, e.g. Cushing’s, acromegaly | dc-cpg-appendix-2-classification | Endocrinopathies incl. acromegaly, Cushing’s | C (one line only, per plan) |
| 6.s3.1 | Antibody tests; GAD first | holt-t1d-adults-consensus-2021 | Test GAD first, then IA-2 and/or ZnT8 | C, INTL |
| 6.s3.2 | C-peptide = own insulin; useful months–years after; not during very high sugar | exeter-c-peptide-antibody-tests; dc-cpg-ch3-classification-diagnosis | Exeter: C-peptide shows own insulin; best after 3 years; high result near diagnosis unhelpful. Ch 3: unhelpful in acute hyperglycemia | C |
| 6.s3.3 | Genetic tests for single-gene types; specialist arranges | ispad-2022-ch4-monogenic; on-health-genetics-clinics | ISPAD: specialist or genetics referral. Ontario Health: most clinics need a clinician referral | C |
| 6.s3.4 | Antibody levels fade; not accurate enough for routine use; ADA recommends for overlapping adults; team decides | dc-cpg-ch3-classification-diagnosis; ada-soc-2026-s2-summary | Ch 3: "levels wane"; not accurate enough to be "used routinely". ADA 2.10: standardized antibody tests for adults with overlapping features | C, K1 (Canadian first) |
| 6.s4.1 | Doctor or specialist orders; Manitoba GAD endocrinologists only, others need a form | sbgh-anti-gad65 | "available to endocrinologists only"; others need an approval form | C (verify fix: "or NP" removed) |
| 6.s4.2 | BC: antibody tests not covered by MSP | bcdiabetes-autoantibody-testing | "none of these tests is covered by MSP" | C (handout date unclear; no prices, K17) |
| 6.s4.3 | Genetic testing needs referral; out-of-province approval | on-health-genetics-clinics; on-form-014-4521-84; phsa-out-of-province-test-requests; chusj-genetic-tests-not-available | ON: clinician referral; prior-approval form for OOP genetics. BC: approval before testing. QC: RAMQ AH-612 for tests not available in Quebec | C |
| 6.note | Not a diagnostic tool; team decides; don’t stop or lower insulin because of this page | holt-t1d-adults-consensus-2021 (safety basis) | Framing, required banner. Holt: "C-peptide must be measured prior to insulin discontinuation to exclude severe insulin deficiency" | Safety framing (verify 2 safety note 1) |
| 6.figure.questions.1–5 | Questions for the team | — | Questions, not claims | — |
| 6.figure.terms.1 | GAD most often first | holt-t1d-adults-consensus-2021; buzzetti-lada-consensus-2020; bt1d-lada | Holt: GAD first. Buzzetti: GADA most sensitive. BT1D: mainly GADA | C, INTL |
| 6.figure.glossaryNote | Some meanings come from international guidance | — | Labelling line for terms 2, 3 and 6 | K11 (verify 2 §3) |
| 6.figure.terms.2 | IA-2, ZnT8 and IAA: other type 1 antibodies, also used in screening; IA-2 and ZnT8 may be tested if GAD negative | holt-t1d-adults-consensus-2021; phillip-pre-stage-3-monitoring-2024 | Holt: if GAD negative, "IA2 and/or ZNT8" (IAA not in that step). Phillip: IAA, GADA, IA-2A, ZnT8A counted in staging | C after verify 2 fix, INTL (glossary note) |
| 6.figure.terms.3 | C-peptide; blood or urine | exeter-c-peptide-antibody-tests | C-peptide (blood or urine) shows own insulin | C, INTL (glossary note) |
| 6.figure.terms.4 | A1C reflects average blood sugar over 2–3 months; diagnoses diabetes and prediabetes; checked about every 3 months | dc-cpg-ch3-classification-diagnosis; dc-cpg-ch9-monitoring-2021 | Ch 3: A1C "reflects the average plasma glucose (PG) over the previous 2 to 3 months"; thresholds. Ch 9 (2021): "approximately every 3 months" | C (definition released from E, verify 2 §4) |
| 6.figure.terms.5 | OGTT: sugar 2 h after 75 g drink | dc-cpg-ch3-classification-diagnosis; dc-cpg-ch36-pregnancy | 2hPG in a 75 g OGTT | C |
| 6.figure.terms.6 | Gene panel: many genes at once | ispad-2022-ch4-monogenic; exeter-mody-testing-guidelines | ISPAD: gene panels preferred. Exeter: sequence all MODY genes | C, INTL (glossary note) |
| 7.items.1 | LADA is slow type 1; "type 1.5" | bt1d-lada; buzzetti-lada-consensus-2020; diabetes-uk-lada; dc-cpg-ch3-classification-diagnosis | BT1D: "type 1.5", a form of T1D. Buzzetti, Diabetes UK: "type 1.5". Ch 3 lists LADA under type 1 | C (verify fix: "type 1.5" not cited to Ch 3) |
| 7.items.2 | After 30; antibodies; no insulin ≥6 months | bt1d-lada; buzzetti-lada-consensus-2020 | As stated | C |
| 7.items.3 | Often first managed as type 2 | bt1d-lada; diabetes-uk-lada | BT1D: often misdiagnosed and managed as T2D. Diabetes UK: misdiagnosed as T2 | C |
| 7.items.4 | Antibody test, usually GAD, confirms; C-peptide helps guide treatment | bt1d-lada; diabetes-uk-lada; buzzetti-lada-consensus-2020 | BT1D: mainly GADA. Diabetes UK: GADA test. Buzzetti: C-peptide guides treatment | C, INTL for C-peptide (verify fix: C-peptide not cited to BT1D or Diabetes UK) |
| 7.items.5 | Insulin sooner than T2; timing varies; sooner with higher or more antibodies | diabetes-uk-lada; bt1d-lada; buzzetti-lada-consensus-2020 | Diabetes UK: moves to insulin faster than T2D. BT1D: timing varies widely. Buzzetti: higher titre or more antibodies raise the risk | C, INTL |
| 7.items.6 | Modified type 1 plan that can include some T2 medicines; intl: others less suitable; ask before change | bt1d-lada; buzzetti-lada-consensus-2020 | BT1D: "modified T1D care plan" that includes "glucose-lowering drugs frequently used for T2D". Buzzetti: sulfonylureas not recommended (class not named on page) | C after verify 2 fix, INTL, K14 |
| 7.items.7 | 2–12% vs ~10% | buzzetti-lada-consensus-2020; bt1d-lada | As stated | C (conflict shown) |
| 7.figure.fields | Questions | — | Questions, not claims | — |
| 8.items.1 | Single gene; MODY 1–2% (Diabetes UK, Exeter); NIDDK 1–5% of diabetes is single-gene, all types | diabetes-uk-mody; exeter-what-is-mody; niddk-monogenic | Diabetes UK and Exeter: MODY 1–2%. NIDDK: "about 1 to 5 of every 100 people with diabetes" have monogenic diabetes (MODY plus neonatal) | C after verify 2 fix, K3 (both shown, each scoped to what it counts) |
| 8.items.2 | ~9 in 10 first misdiagnosed | diabetes-uk-mody | About 90% initially misdiagnosed | C |
| 8.items.3 | Young, not overweight, no antibodies, parent, 2+ generations | dc-cpg-ch3-classification-diagnosis; diabetes-uk-mody | Ch 3: onset <25, no obesity, antibodies absent, multigenerational. Diabetes UK: parent, two or more generations | C |
| 8.items.4 | <25 (DC, Diabetes UK); <30 (NIDDK, Murphy); ≤35 (Exeter) | dc-cpg-ch3-classification-diagnosis; diabetes-uk-mody; niddk-monogenic; murphy-monogenic-precision-diagnostics-2023; exeter-mody-testing-guidelines | As stated | C, K2 |
| 8.items.5 | Genetic test after antibody and C-peptide tests | diabetes-uk-mody | Antibody and C-peptide tests, then genetic test | C (verify fix: not cited to ISPAD) |
| 8.items.6 (GCK) | Mild, steady; usually no treatment | ispad-2022-ch4-monogenic; diabetes-uk-mody | ISPAD: mild, stable, "should not receive treatment". Diabetes UK: no treatment | C\* ("usually") |
| 8.items.7 (HNF1A/4A) | Often tablets rather than insulin; specialist decides | ispad-2022-ch4-monogenic; diabetes-uk-mody | Sulfonylurea-sensitive; treated with sulphonylureas | C\*, K14 (class not named) |
| 8.items.8 (HNF1B) | Kidneys (cysts), other organs; usually insulin | exeter-hnf1b-mody; diabetes-uk-mody | Exeter: renal cysts and other organs. Diabetes UK: usually on insulin | C (verify fix: insulin cited to Diabetes UK) |
| 8.items.9 | 50% per child; relatives tested once variant known; counselling | ispad-2022-ch4-monogenic; niddk-monogenic | 50% risk; cascade testing; genetic counselling | C |
| 8.items.10 | GCK pregnancy depends on baby; tell team early. HNF4A larger baby, newborn lows | exeter-gck-pregnancy-2018; ispad-2022-ch4-monogenic; diabetes-uk-mody | Exeter: fetal growth depends on inheritance; contact the lab early. ISPAD, Diabetes UK: HNF4A high birth weight, neonatal hypoglycaemia | C, INTL |
| 8.items.11 | Canadian children: GCK 19 of 29 | patel-cpsp-monogenic-2023 | "most cases (19/29) had glucokinase mutations" | C |
| 8.items.12 | Evidence mostly European ancestry; clues less reliable otherwise | murphy-monogenic-precision-diagnostics-2023 | Clinical features "less reliable… in people of non-European ancestry" | C |
| 8.note | Don’t stop or lower insulin because of this page; family tree prompt | holt-t1d-adults-consensus-2021 (safety basis) | As 6.note | Safety framing (verify 2 safety note 1); `noteVisible: true` |
| 8.figure.familyTree.columns | Diabetes, age at diagnosis, type told, insulin within 2 years, hearing loss | dc-cpg-ch3-classification-diagnosis; diabetes-uk-mody; exeter-mody-testing-guidelines; exeter-midd | The clues each column records; insulin timing from Ch 3 ("<1 to 2 years") | C (structure) after verify 2 fix ("3 years" → "2 years"; Holt removed) |
| 9.items.1 | <6 months usually single gene | exeter-about-neonatal-diabetes; dc-cpg-ch3-classification-diagnosis | Exeter: genetic diagnosis in over 85%. Ch 3: genetic testing for all <6 months | C |
| 9.items.2 | Every baby <6 months should have genetic testing | dc-cpg-ch3-classification-diagnosis; ispad-2022-ch4-monogenic | "All infants diagnosed before 6 months of age should have genetic testing" | C |
| 9.items.3 | 1 in 100,000 (Exeter); 1 in 90,000 and 6–12 months (NIDDK) | exeter-about-neonatal-diabetes; niddk-monogenic | As stated | C, K4 |
| 9.items.4 | Some temporary, some lifelong | niddk-monogenic | NIDDK names permanent and transient neonatal diabetes directly | C (re-cited from the Exeter overview, which doesn’t say it; pre-publish check 4 resolved) |
| 9.items.5 | Potassium-channel types: ~9 in 10 can switch to tablets under specialist care; earlier better | ispad-2022-ch4-monogenic; exeter-sulfonylurea-treatment | ISPAD: about 90% with KATP variants can switch; more neurological benefit the earlier. Exeter: over 90% can stop insulin | C\*, INTL, K14. No "about 40%" figure (verify fix) |
| 9.items.6 | Adults labelled T1 diagnosed <6 months: review | dc-cpg-ch3-classification-diagnosis | People labelled T1D should be reviewed for onset <6 months | C |
| 9.note | Don’t stop or lower insulin because of this page; change planned with a specialist team | holt-t1d-adults-consensus-2021 (safety basis) | As 6.note | Safety framing (verify 2 safety note 1); `noteVisible: true` |
| 10.items.1 | Some single-gene types have other signs (hearing, vision) | ispad-2022-ch4-monogenic | MIDD (hearing loss) and Wolfram (optic atrophy) clues | C, INTL |
| 10.items.2 | MIDD passes from a mother to all her children, though effect varies; fathers don’t pass it on | exeter-midd | Maternal transmission; "considerable variation… some children will only have deafness or only have diabetes or may have no problems at all" | C after verify 2 fix, INTL |
| 10.items.3–5 | MIDD: onset 37; insulin ~2 yrs; hearing loss first; organs; urine test | exeter-midd | All confirmed | C, INTL |
| 10.items.6 | Wolfram 1 in 500,000; both parents carry; diabetes ~6, optic atrophy ~11 | medlineplus-wolfram-syndrome | Type 1 about 1 in 500,000; recessive; diabetes ~6, optic atrophy ~11 | C, INTL, K8 |
| 10.items.7 | Lipodystrophy: abnormal fat, high TG, darkened skin folds | ispad-2022-ch4-monogenic | Abnormal fat distribution, high triglycerides, acanthosis | C, INTL ("high insulin needs" not used, verify fix) |
| 10.items.8 | Confirmed by genetic testing via a specialist | ispad-2022-ch4-monogenic | Specialist or genetics referral | C |
| 11.items.1 | Pancreas diseases listed as causes | dc-cpg-appendix-2-classification | Pancreatitis, trauma or pancreatectomy, neoplasia, CF | C ("growth" for neoplasia; cancer clue held, K9) |
| 11.items.2 | Hemochromatosis on the list; CHS: can affect pancreas → diabetes | dc-cpg-appendix-2-classification; chs-hemochromatosis-condition | As stated | C |
| 11.items.3 | 1 in 300 have two copies; <1 in 10 develop disease | chs-hemochromatosis-faq; bc-guidelines-iron-overload | FAQ: 1 in 300 "have two copies of the gene that puts them at risk". BC: <10% of homozygotes develop disease | C (verify fix) |
| 11.items.4 | Iron test must be requested; genetic test confirms | chs-hemochromatosis-faq; bc-guidelines-iron-overload | Iron panel "is NOT part of the standard blood test"; genetic testing confirms | C |
| 11.items.5 | Close family tested | chs-hemochromatosis-faq; bc-guidelines-iron-overload | Test all first-degree relatives | C |
| 11.items.6 | Phlebotomy; can mildly improve diabetes | chs-hemochromatosis-treatment | Phlebotomy; "mild improvement in diabetes" | C (verify: not cited to BC) |
| 12.items.1 | CF can affect the pancreas → CFRD | dc-cpg-appendix-2-classification; cf-canada-cfrd-guideline-2024 | CF under exocrine-pancreas diseases; CFRD guideline | C |
| 12.items.2 | 3.6% <18 to 58.7% >35 | cf-canada-cfrd-guideline-2024 | As stated | C |
| 12.items.3 | Yearly from 10 via CF clinic; Canada A1C first then OGTT; international prefers OGTT; clinic decides | cf-canada-cfrd-guideline-2024; ispad-2022-cfrd; ada-soc-2026-s2-summary | CF Canada: 2-step from 10 starting with A1C, OGTT at 5.5–6.4%. ISPAD: "HbA1C is not a recommended screening test". ADA §2: OGTT preferred | C, K5 |
| 12.items.4 | Insulin main; only drug for children; some adults other options | cf-canada-cfrd-guideline-2024 | As stated | C (no class named, K14) |
| 12.items.5 | Plan for lows; CF Canada: glucagon and teaching on insulin; intl: weaker response | cf-canada-cfrd-guideline-2024; ispad-2022-cfrd | CF Canada recommends glucagon teaching for insulin-treated people. ISPAD: "the glucagon response is impaired" | C; Canadian source now first, ISPAD kept only for the weaker response (verify 2 note on 12.items.5) |
| 12.items.6 | Without known CFRD: OGTT at 12–16 weeks or when pregnancy confirmed; if normal, again at 24–28 | cf-canada-cfrd-guideline-2024 | For people with CF without known CFRD, at 12–16 weeks "or when pregnancy confirmed"; 24–28 weeks "if previous test at 12–16 weeks was normal" | C after verify 2 fix |
| 12.items.7 | 25–50% of those without CFRD before develop diabetes after transplant | cf-canada-cfrd-guideline-2024 | "25-50% of those who did not have CFRD before the transplantation" | C after verify 2 fix |
| 12.items.8 | Yearly eye, kidney, nerve checks from 5 years | cf-canada-cfrd-guideline-2024 | Microvascular screening from 5 years after diagnosis | C\* (microvascular = eyes, kidneys, nerves) |
| 12.items.9 | CF clinic works with a diabetes team, ideally including a diabetes educator | cf-canada-cfrd-guideline-2024 | Team "should ideally include a diabetes specialist, a respirologist, a dietitian, and a nurse"; CF teams "can improve… by including certified diabetes educators"; CF and diabetes clinics collaborate | C after verify 2 fix |
| 13.items.1 | DC lists steroids, some antipsychotics, some anti-rejection drugs | dc-cpg-appendix-2-classification | Glucocorticoids, atypical antipsychotics, calcineurin inhibitors | C |
| 13.items.2 | 20–50% of people without diabetes on steroids; 48 h checks may be considered | dc-cpg-ch16-in-hospital | "prevalence between 20% and 50% among people without a previous history of diabetes"; "high-dose" belongs to the next sentence, on management | C after verify 2 fix ("high-dose" dropped) |
| 13.items.3 | Weight gain; higher glucose and lipids | dc-cpg-ch18-mental-health | 2nd/3rd-generation antipsychotics: weight gain, worse glucose and lipids | C |
| 13.items.4 | Children 2–3× risk; can show within the first year | dc-cpg-ch18-mental-health | "2- to 3-fold increased risk of type 2 diabetes, which was apparent within the first year of follow up" | C after verify 2 fix |
| 13.items.5 | Baseline weight, BP, glucose, lipids; then a schedule; ask prescriber | dc-cpg-ch18-mental-health | Baseline plus follow-up at 1, 2 and 3 months, then every 3–6 months and yearly, by measure | C\* (schedule deferred to the prescriber, not shortened; verify) |
| 13.items.6 | ADA: check glucose before starting and at every visit on checkpoint inhibitors; intl consensus: can come on with DKA | ada-soc-2026-s2-summary; holt-t1d-adults-consensus-2021 | ADA 2.20: test "before initiating treatment" and at each visit; ADA 2.19: educate on "signs of hyperglycemia and hyperglycemic crises". Holt: ICI diabetes "may present with hyperglycaemia and diabetic ketoacidosis" | C, INTL (verify 2 safety note 4). "Suddenly" or "quickly" stays HELD |
| 13.items.7 | Transplant risk: steroid dose, infections, immunosuppressant | dc-cpg-ch20-transplantation | Steroid dose, CMV, hepatitis C, choice of immunosuppressant | C |
| 13.items.8 | Before; months 1–3; A1C 3 and 12 months, yearly; intl prefers OGTT; team decides | dc-cpg-ch20-transplantation; sharif-ptdm-consensus-2024; ada-soc-2026-s2-summary | Ch 20: screen before; OGTT or post-lunch in months 1–3; A1C at 3, 12, yearly. Sharif: "OGTT is essential". ADA: OGTT preferred | C, K6 |
| 13.items.9 | 20–40% heart, lung, liver | sharif-ptdm-consensus-2024 | "between 20% and 40% in heart, lung and liver" | C, INTL |
| 13.items.10 | Cross-link to Staying Safe | — | Navigation | — |
| 13.note | Ask before changing how you take a medicine | — | Scope framing | K12 |
| programsBand.cards.1 | Doctor/specialist orders antibody, C-peptide, A1C; some labs limit antibody tests to specialists unless an approval form is sent | sbgh-anti-gad65; bcdiabetes-autoantibody-testing; dc-cpg-ch3-classification-diagnosis | MB: "available to endocrinologists only. All other requests require test approval form completed"; BC handout: tests ordered through labs | C after verify 2 fix (matches 6.s4.1) |
| programsBand.cards.2 | Genetic testing needs referral; out-of-province approval | on-health-genetics-clinics; on-form-014-4521-84; phsa-out-of-province-test-requests; chusj-genetic-tests-not-available | As 6.s4.3 | C |
| programsBand.cards.3 | TrialNet free, home or lab, anywhere in Canada | bt1d-trialnet | As 5.items.6 | C |
| programsBand.cards.4 | CF yearly screening from 10 | cf-canada-cfrd-guideline-2024 | As 12.items.3 | C |
| pharmacist.body | CDE hours and scope | — (owner-supplied, 2026-10-05) | Same wording as staying-safe | Owner |

---

## D) OPEN RULINGS for the nurse

The defaults are in the copy now. Numbering continues the plan's list ("New, from Know Your Type", items 6–13), expanded.

| # | Default used | Where | Alternative |
|---|---|---|---|
| K1 · **ruled 2026-10-06 ([C27](clinical-rulings-2026-10-06.md#c27))** | **Routine antibody testing (plan ruling 6).** The Canadian position comes first (Ch 3: levels fade, not for routine use), then ADA 2.10 (test adults with overlapping features), then "Your team decides". Buzzetti's "screen every new type 2 for GAD" is not stated. | 6.s3.4 | Add Buzzetti's line, or drop ADA and keep Ch 3 only. |
| K2 · **ruled 2026-10-06 ([C27](clinical-rulings-2026-10-06.md#c27))** | **MODY age cut-off (plan ruling 7).** Shows <25 (Diabetes Canada, Diabetes UK), then <30 and ≤35 (international), then "Your team decides". The clues checklist says "a younger age" with no number. | 8.items.4, 6.s2.1 | Show only Diabetes Canada's <25. |
| K3 · **ruled 2026-10-06 ([C27](clinical-rulings-2026-10-06.md#c27))** | **MODY prevalence (plan ruling 8).** Both figures shown, 1–2% and 1–5%, each with its publisher. | 8.items.1 | Show one figure. |
| K4 · **ruled 2026-10-06 ([C27](clinical-rulings-2026-10-06.md#c27))** | **Neonatal cut-off (plan ruling 9).** Under 6 months (Diabetes Canada, ISPAD, Exeter). NIDDK's 6–12 months is mentioned in 9.items.3. | 9.items.1–3, 6.s2.5 | Mention ISPAD's "consider testing at 6–12 months if antibody-negative". |
| K5 · **ruled 2026-10-06 ([C27](clinical-rulings-2026-10-06.md#c27))** | **CFRD screening (plan ruling 10).** CF Canada's A1C-first approach comes first, then "international guidance prefers starting with the glucose tolerance test", then "Your clinic decides". | 12.items.3, programsBand.cards.4 | Name ISPAD and ADA, or state CF Canada only. |
| K6 · **ruled 2026-10-06 ([C27](clinical-rulings-2026-10-06.md#c27))** | **Transplant screening (plan ruling 11).** Ch 20's schedule comes first, then "international guidance prefers a glucose tolerance test", then "Your team decides". | 13.items.8 | Ch 20 only. |
| K7 · **ruled 2026-10-06 ([C26](clinical-rulings-2026-10-06.md#c26))** | **Teplizumab (plan ruling 12), INCLUDED and flagged.** Item 5.10 names it, gives the May 2025 approval for people aged 8 and older in stage 2 (now from Breakthrough T1D, non-industry), and says it is on no provincial or territorial plan, available out of pocket, through private insurance or through compassionate access (coverage unchanged on 2026-10-05). It gives no "delay" claim and no duration: Sanofi says a median of 2 years and Breakthrough's TrialNet page an average of 3, so that stays held. The Sanofi page is no longer cited. | 5.items.10 | (a) Leave it out (delete item 10 and change `neutral` to `[5, 6, 7, 8, 9]`). (b) Keep it without the brand name. (c) Drop "aged 8 and older". |
| K8 · **ruled 2026-10-06 ([C35](clinical-rulings-2026-10-06.md#c35))** | **Wolfram syndrome (plan ruling 12), INCLUDED and flagged.** Item 10.6 plus its own column. | 10.items.6, figure column 2 | Delete item 6 and the Wolfram column (`columns: [[2,3,4,5],[7]]`), and renumber item 7 → 6 and 8 → 7 in messages and meta. |
| K9 · **ruled 2026-10-06 ([C34](clinical-rulings-2026-10-06.md#c34))** | **Pancreatic-cancer clue (plan ruling 12), HELD** with the rest of the type 3c detail (E). The card says only "a growth in the pancreas", from Appendix 2's list. | 11.items.1 | Release it once a readable official source is confirmed. |
| K10 · **ruled 2026-10-06 ([C33](clinical-rulings-2026-10-06.md#c33))** | **New ask roles (plan ruling 13).** Not used yet. These cards carry existing roles: MODY and syndromes `endo` (proposed `geneticCounsellor`), CFRD `team` (proposed `cfClinic`), medicines `pharmacist` (proposed `prescriber`), pancreas `team` (proposed `giSpecialist`). | 8, 10, 11, 12, 13 | Approve the roles. Each needs `ui.chapter.ask.*` and `roleNames.*`. |
| K11 · **ruled 2026-10-06 ([C40](clinical-rulings-2026-10-06.md#c40))** | **"International guidance" labelling.** Cards 7–10 carry the badge. Mixed cards (4, 5, 6, 12, 13) name the international source in the sentence instead of carrying a badge, so a mostly-Canadian card isn't labelled international. The source check found four unlabelled lines; now 6.s1.3 is split (treatment half re-cited to Ch 3 and Ch 35, family half labelled), 6.s2.6 ends "International guidance links the two", 6.s2.3 is Canadian (Ch 3), and the glossary carries `figure.glossaryNote` for terms 2, 3 and 6. | 7–10 badge; 4.7, 5.1–4, 5.9, 6.s1.2, 6.s1.3, 6.s2.6, 6.s3.1, 6.glossaryNote, 12.3, 12.5, 13.6, 13.8–9 | Badge every card with any international claim (4, 5, 6, 12 and 13 too), or accept the checklist and glossary as an exception without in-line labels. |
| K12 · **ruled 2026-10-06 ([C22](clinical-rulings-2026-10-06.md#c22))** | **"Before you change a medicine" wording (plan "don't stop a medicine").** The note reads "Ask your prescriber or pharmacist before you change how you take any of these medicines." It is a referral, not a sourced claim, and is kept visible. | 13.note | The plan's "Don't stop a medicine without your prescriber", or no line. |
| K13 · **ruled 2026-10-06 ([C27](clinical-rulings-2026-10-06.md#c27))** | **Stage definitions.** Rest on ADA Standards 2026 §2, read through the Guideline Central summary (a secondary source of the whole 2026 Standards), and Phillip 2024. They are labelled "international guidance" in the lead item. Breakthrough T1D (Canadian) supports only "stages 1 and 2 come before diagnosis". Stage 3 is worded "type 1 is diagnosed" because ADA calls it "Symptomatic" and Phillip says "with or without symptoms". | 5.items.1–4 | Drop the three stage columns and keep only Breakthrough's sentence. |
| K14 · **ruled 2026-10-06 ([C21](clinical-rulings-2026-10-06.md#c21))** | **Treatment-adjacent lines** (verify item 13). Kept, with no drug class or dose named and with "a specialist decides" or "under specialist care":<br>• HNF1A/HNF4A "often treated with tablets rather than insulin" (8.7)<br>• the neonatal potassium-channel switch (9.5)<br>• CFRD "insulin is the main treatment" (12.4)<br>• LADA "some type 2 medicines are less suitable" (7.6) | 7.6, 8.7, 9.5, 12.4 | Cut each to "the subtype guides treatment; your specialist decides". |
| K15 · **ruled 2026-10-06 ([C35](clinical-rulings-2026-10-06.md#c35))** | **Hemochromatosis "Type II".** The Canadian Hemochromatosis Society FAQ calls the resulting diabetes "Type II Diabetes"; the guidelines class it under diseases of the pancreas. The copy names no type. | 11.items.2 | Note the difference on the page. |
| K16 · **ruled 2026-10-06 ([C1](clinical-rulings-2026-10-06.md#c1), [C13](clinical-rulings-2026-10-06.md#c13), [C4](clinical-rulings-2026-10-06.md#c4), [C15](clinical-rulings-2026-10-06.md#c15), [C14](clinical-rulings-2026-10-06.md#c14))** | **Clinical defaults carried from Staying Safe** (low below 3.9; ½ cup juice; ketone ladder written for type 1; "follow your leaflet"; no alcohol limits; FIT counted as industry). This chapter states none of them. It links to Staying Safe for lows, ketones and glucagon. | 1.note, 7.note, 11.note, 12.note, 13.10, urgentExit | — (rulings R1–R15 in staying-safe.md apply there) |
| K17 · **ruled 2026-10-06 ([C36](clinical-rulings-2026-10-06.md#c36))** | **Lab prices and coverage examples.** No prices are shown. The only coverage example is BC MSP (antibody tests not covered), from a clinic handout stamped 2023 that mentions Tzield, so its date is unclear. Ontario's C-peptide listing is held (E). | 6.s4.2 | Drop the BC example, or add a dated Ontario line once insured status is confirmed. |
| K18 · **ruled 2026-10-06 ([C36](clinical-rulings-2026-10-06.md#c36))** | **Industry screening route (UncoverT1D), HELD.** Industry source; Breakthrough says stage-2 testing is "only available… via TrialNet" for relatives. | 5 | Release as "a free antibody test your health care provider can order, through a program run by a drug maker", citing the BC handout plus Sanofi. |
| K19 · **ruled 2026-10-06 ([C35](clinical-rulings-2026-10-06.md#c35))** | **CGM and LADA, HELD.** "CGM is standard" (Holt) is for adults with type 1. Applying it to LADA is an extrapolation, and CGM coverage for people with LADA who are not on insulin is unverified. | 7 | A line once a source covers LADA specifically. |
| K20 · **ruled 2026-10-06 ([C34](clinical-rulings-2026-10-06.md#c34))** | **The name "type 3c", HELD.** Only Hart 2016 (FAIL) and Pancreapedia ("other", re-read needed) use it. The card is titled "Pancreas conditions and iron overload". | 11.title | Use "type 3c" once a readable official source uses it. |
| K21 · **ruled 2026-10-06 ([C36](clinical-rulings-2026-10-06.md#c36))** | **Manitoba example.** "The GAD antibody test is ordered by endocrinologists, and other doctors need an approval form" comes from the St. Boniface Hospital lab manual (one Winnipeg lab), presented as an example. | 6.s4.1, programsBand.cards.1 | Drop the province example and keep "your doctor or specialist orders these tests". |
| K22 · **ruled 2026-10-06 ([C22](clinical-rulings-2026-10-06.md#c22))** | **Checklist design.** It has a fixed "Not a diagnostic tool" banner, which now ends with the insulin safety line (K23). There is no score, no count and no result message, nothing ticked is saved, and it prints all clues if none are ticked. | 6 figure | Approve the banner wording. |
| K23 · **ruled 2026-10-06 ([C22](clinical-rulings-2026-10-06.md#c22))** | **Insulin safety line (source check, safety note 1).** "Don’t stop or lower insulin because of anything on this page. Any change is made with your specialist." It is on cards 6 (in the banner), 8 and 9, each note visible (`noteVisible: true`), and on the printed checklist through the banner. The check proposed "Never stop…"; "Don’t" is used because the voice rule keeps "never" for where a source says it (Holt: C-peptide "must be measured prior to insulin discontinuation"). | 6.note, 8.note, 9.note | "Never stop or lower insulin…", as the check proposed; or add the line to card 7 (LADA) too. |
| K24 · **ruled 2026-10-06 ([C11](clinical-rulings-2026-10-06.md#c11))** | **Symptoms while waiting for a second test (source check, safety note 2).** New 2.items.8: with symptoms of high blood sugar the diagnosis is made without a second test and treatment shouldn’t be delayed (Ch 3), "Contact your doctor without waiting", then a pointer to Staying Safe. It avoids "same day" and 911 wording, so card 2 is not `urgentContent` and the chapter still has no urgent block of its own. | 2.items.8 | The check's wording, "see your doctor the same day", which would make card 2 an `urgentContent` card pinned open. |

**Pre-publish checks** (facts to re-open, not clinical rulings):
1. `canscreen-t1d`: the "launching this fall 2026/winter 2027" banner was unchanged on 2026-10-05 (page modified 2026-06-10), so 5.items.7 stands. Re-check on the publish day, since the launch window is now.
2. ~~Tzield coverage~~: resolved on 2026-10-05 (CDA "do not reimburse" Jan 2026; INESSS Oct 2025). Re-check only if publishing is delayed.
3. `dc-cpg-ch18-mental-health`: the live page shows no update or supersession notice. Still confirm the 2023 mental-health update does not supersede the antipsychotic passage before release.
4. ~~`exeter-about-neonatal-diabetes` "permanent"~~: resolved. 9.items.4 is now cited to `niddk-monogenic`, which names permanent and transient forms.
5. Register titles (repo fixes for `sources-meta.ts`, not made here):
   - `sharif-ptdm-consensus-2024`: actual title "International consensus on post-transplantation diabetes mellitus".
   - `patel-cpsp-monogenic-2023`: actual title "Incidence Trends of Type 2 Diabetes Mellitus, Medication-Induced Diabetes, and Monogenic Diabetes in Canadian Children, Then (2006–2008) and Now (2017–2019)" (Pediatric Diabetes 2023). It covers all non-type 1 diabetes, not monogenic only; 8.items.11 ("children with single-gene diabetes") still reads correctly.
   - `phsa-out-of-province-test-requests`: page title "Out-of-Province & Out-of-Country Laboratory or Genetic Test Funding Request".
   - `chusj-genetic-tests-not-available`: the `/en/` URL serves a French page ("Tests génétiques non disponibles au Québec"), so `hrefLang` should be `'fr'` and the label the French title.
   - `ada-soc-2026-s2-summary`: the page is the whole "2026 ADA Diabetes Standards of Medical Care Clinical Guideline Summary" (updated Sep 16, 2026), not a Section 2 summary. The Section 2 recommendations cited are on it.
   - Still unchecked: `chs-hemochromatosis-faq`, `bcdiabetes-autoantibody-testing`, `on-health-genetics-clinics`, `sbgh-anti-gad65`, `ispad-2022-cfrd`, `exeter-hnf1b-mody`, `exeter-mody-testing-guidelines` and `exeter-sulfonylurea-treatment`.
6. ~~`bt1d-lada` https redirect~~: resolved (https returns 200 with no redirect).
7. Register locators (`sources-review.ts`, repo fixes not made here): the Ch 3 locator says the check "did not find time to insulin (1–2 years)"; the fresh check found it ("time to needing insulin <1 to 2 years"), and 6.s2.3 now cites it. The Ch 16 locator says "high-dose steroids" for the 20–50% figure; the page ties "high-dose" to management, not to the prevalence.
8. CPG Ch 18 Table 4: re-read it visually before releasing the full antipsychotic schedule (E).

---

## E) HELD items (not in the copy)

Under sourcing policy 6, or held for scope. Proposed wording would go in `held-messages.ts` if any of it is later built into a figure.

| Topic | Card | Why held | Proposed wording if released | Source to check |
|---|---|---|---|---|
| **Type 3c detail**:<br>• 1–9% of diabetes<br>• chronic pancreatitis about 79% of cases<br>• lows in 78% on insulin, 17% severe<br>• impaired glucagon<br>• low enzymes and no antibodies as clues | 11 | Hart 2016 FAIL (abstract only; full text unreadable). Pancreapedia is "other" and its quotes came through a fetch summary | "Diabetes after pancreas disease can bring frequent lows on insulin, partly because the body’s glucagon response is weaker" | A readable official source (Hart full text, a Canadian GI or Diabetes Canada page) |
| **Pancreatic-cancer clue** (new diabetes after 50 with weight loss; about 1%) | 11 | Hart FAIL; tone ruling (K9). **Stays held ([C34](clinical-rulings-2026-10-06.md#c34)).** Candidate source recorded: Canadian Cancer Society, "Risks for pancreatic cancer" (EN https://cancer.ca/en/cancer-information/cancer-types/pancreatic/risks, FR « Risques de cancer du pancréas »). Its wording is risk-based ("people who developed diabetes within the last 3 years have the greatest risk", and it is unclear whether diabetes is an early sign); it says nothing about "after 50 with weight loss", so any release must follow its framing. DC Appendix 2 lists neoplasia under diseases of the exocrine pancreas | "New diabetes after 50 with weight loss you can’t explain is worth raising with your doctor" | As above |
| **The name "type 3c"** | 11 | Only FAIL or unverified sources use it (K20). **Stays held ([C34](clinical-rulings-2026-10-06.md#c34))** | Title: "Pancreas-related diabetes (type 3c) and iron overload" | As above |
| **">95% of people over 50 with new diabetes have type 2"** | 2 | Hart FAIL | Dropped | — |
| **Ketosis-prone type 2** | — | A citation and search snippets only | None | Umpierrez 2006 full text |
| **Hormone causes beyond one line** | 6 | Appendix 2 gives a classification list only | One line kept (6.s2.9) | — |
| **LADA: "CGM is standard"** | 7 | An extrapolation from adults with type 1 (K19). **Stays held ([C35](clinical-rulings-2026-10-06.md#c35))**; card 7's take-in card asks "Would a sensor (CGM) help me?" instead | "Ask your team whether a sensor (CGM) would help" | A LADA-specific source |
| **CGM coverage for LADA when not on insulin** | 7 | Unverified per province | — | Provincial CGM program pages |
| **LADA relatives and TrialNet eligibility** | 7 | Unverified | — | TrialNet eligibility page |
| **Neonatal "about 40%" potassium-channel** | 9 | The Exeter subpage returned 404 at the check; verify says drop it | — | `exeter-neonatal-kcnj11-abcc8`, re-opened |
| **Neonatal switch "ideally with CGM"** | 9 | Not on the checked page (transfer protocol only, clinician-level) | — | `exeter-sulfonylurea-transfer` (scope) |
| **Exeter tests babies diagnosed before 9 months from any country; cost for Canadians** | 9 | Policy 3: testing routes in Canada need Canadian sources. Cost unverified | "Your specialist can ask about testing at an international centre" | A provincial out-of-province approval for neonatal panels |
| **A Canadian lab offering a MODY panel** | 8 | None verified | — | Provincial genetics programs |
| **ADDAM research study (Montreal)** | 8 | Registry entry from Dec 2024; it may now be closed | — | clinicaltrials.gov NCT03988764 |
| **Lipodystrophy yearly checks, "diet is essential"** | 10 | Brown 2016 is abstract only (policy 6) | "Yearly checks of blood sugar, blood fats, liver, kidneys and heart are recommended" | Full text of Brown 2016 |
| **Lipodystrophy treatment (metreleptin)** | 10 | Industry source only (Chiesi); drug content out of scope | None | Health Canada DPD (returned 403) |
| **MIDD "avoid metformin"** | 10 | Drug advice, out of retail scope | None | — |
| **Checkpoint-inhibitor diabetes coming on "suddenly" or "quickly"** | 13 | Partly released: "can come on with DKA" is now in 13.items.6 (Holt; ADA 2.19). The speed of onset is still unsourced; the ADA Summary of Revisions FAILed | "It can come on quickly" | ADA §2 full text, or Canadian oncology pages |
| **Antipsychotic monitoring intervals in full** | 13 | Table 4 is readable on the live Ch 18 page (baseline; 1, 2, 3 months; every 3–6 months; annually), but which check sits in which column is unclear in a text extract, and shortening it is not allowed (register). Also pre-publish check 3 | "At 1, 2 and 3 months, then every 3 to 6 months and yearly, depending on the check" | CPG Ch 18 Table 4, re-read visually |
| **C-peptide insured in Ontario** | 6 | A fee-schedule listing does not establish a patient's coverage (verify) | "In Ontario, C-peptide is on the community lab schedule" | Ontario hospital-lab status |
| **"Your doctor or nurse practitioner orders"** | 6 | NP ordering unverified | — | Provincial lab requisition rules |
| **UncoverT1D free screening (industry)** | 5 | Industry source, and it conflicts with Breakthrough (K18). **Ruled 2026-10-06 ([C36](clinical-rulings-2026-10-06.md#c36)):** only Breakthrough T1D's pointer is released (5.items.11, Sanofi disclosed, no link); the free test (Sanofi, age 8 and over) stays held. The BC handout's 2023-May-18 stamp is stale, but the file is current (Last-Modified 2026-09-27) | See K18 | BC handout plus Sanofi |
| ~~**Teplizumab delay** (how long it may delay stage 3)~~ · **released 2026-10-06 ([C26](clinical-rulings-2026-10-06.md#c26)): "about 2 years" in 5.items.10, from CDA-AMC and the Health Canada monograph** | 5 | Sources conflict: Sanofi (industry) says a median of 2 years; Breakthrough's TrialNet page says an average of 3. Age 8+ and the stage 2 indication are now released from BT1D (K7) | — | Health Canada product monograph or DPD |
| **"Stage 3 is when symptoms start"** | 5 | Sources conflict: ADA Table 2.4 calls stage 3 "Symptomatic"; Phillip says "with or without symptoms" | — | — (copy says "type 1 is diagnosed") |
| **"Screen every new type 2 for GAD"** (Buzzetti) | 6 | Conflicts with Ch 3 (not for routine use); K1 | — | — |
| **TrialNet "taught DKA signs"** | 5 | Not on the TrialNet page; cited to Phillip instead | — | — |
| **Lab prices** (BC handout: GAD65 $232 private and others) | 6 | Owner and plan default: show no prices (K17); handout date unclear | — | — |
| **Blood-ketone strips; Low-Glucose Rescue Kit** | 1, 7, 11, 12, 13 | Strips built 2026-10-06 (F.7). The β-ketone strips (4909) need a meter Liivv does not stock; the kit waits on the owner (A4) | — | Owner |

Released from this table by the source check (now in the copy, see F): prediabetes and the chance of type 2 (3.items.6); A1C as the average over 2 to 3 months (6.figure.terms.4); time to insulin "within 1 to 2 years" from Ch 3 (6.s2.3, family tree column); teplizumab age 8+ and the stage 2 indication (5.items.10); checkpoint-inhibitor diabetes coming on with DKA (13.items.6).

No card is fully HELD. Card 11 keeps six sourced items without the type 3c detail.

---

## F) CHANGE LOG (what the source check changed)

Source check: `content/know-your-type.verify.md` (2026-10-05). "N" = Not confirmed, "P" = Partly, "S" = clinical-safety note, "L" = labelling gap, "R" = held item the check said the sources now support, "Reg" = register issue.

| # | Key | Verify finding | Change made |
|---|---|---|---|
| 1 | 6.s2.3 | N: Holt has no "insulin within 3 years" clue (its "3 years" is C-peptide timing); Ch 3 gives "time to needing insulin <1 to 2 years" | "within 3 years" → "within 1 to 2 years". Re-cited to Ch 3 (Canadian) with ADA 2.10; Holt removed from this row. The E row "Ch 3 '1–2 years' not found" is deleted. |
| 2 | 8.figure.familyTree.columns.insulinSoon; card 8 familyTree sources; G.3 | N (same finding) | "Needed insulin within 3 years?" → "Needed insulin within 2 years?". Holt removed from the family tree's sources; G.3 updated. |
| 3 | 8.items.1 | P: NIDDK's 1–5% is all monogenic diabetes (MODY plus neonatal), not MODY | Now "NIDDK says 1 to 5% of diabetes is single-gene, counting all types". K3 kept (both figures shown, each scoped). |
| 4 | 13.items.2 | P: "high-dose" belongs to the management sentence | "who take high-dose steroids" → "who take steroids". 48-hour line unchanged. Register locator fix noted (D check 7). |
| 5 | 13.items.4 | P: risk not limited to the first year | "2 to 3 times higher in the first year" → "2 to 3 times higher, and the rise can show within the first year". |
| 6 | 12.items.6 | P: applies to people without known CFRD; 24–28 weeks only if the first test was normal | Reworded: "if you don’t already have CFRD… at 12 to 16 weeks or when the pregnancy is confirmed. If that one is normal, it’s repeated at 24 to 28 weeks". |
| 7 | 12.items.7 | P: the 25–50% is of those without CFRD before transplant | Added "who didn’t have CFRD before". |
| 8 | 12.items.9 | P: CF Canada says the team should ideally include a diabetes specialist and others, and CDEs improve care | "Care is shared between your CF team and a diabetes educator" → "Your CF clinic works with a diabetes team, ideally including a diabetes educator". |
| 9 | programsBand.cards.1 | P: non-specialists can order with an approval form | "Some antibody tests are ordered by specialists only" → "Some labs limit antibody tests to specialists unless an approval form is sent". |
| 10 | 5.items.1 | P: BT1D never names stage 3 | "coming before stage 3" → "coming before diagnosis"; "defines them" → "defines the stages". |
| 11 | 7.items.6 | P: BT1D's modified type 1 plan includes type 2 drugs; the line could read as "type 2 medicines are wrong for LADA" | Now "a modified type 1 plan, which can include some type 2 medicines. International guidance says others are less suitable, so ask your team before any change". No class named (K14). |
| 12 | 6.figure.terms.2 | P: Holt's follow-up after a negative GAD is IA-2 and/or ZnT8 only | Meaning now "Other type 1 antibodies, also used in screening. IA-2 and ZnT8 may be tested if the GAD test is negative." IAA stays in the term (Phillip counts it in staging). |
| 13 | 10.items.2 | P: effect varies widely between children | Added "though how much it affects each child varies". |
| 14 | 6.note, 8.note, 9.note; cards 8 and 9 meta | S1: lines about type and treatment changing risk someone stopping insulin | Added "Don’t stop or lower insulin because of anything on this page. Any change is made with your specialist" (card 9: "Any change in treatment is planned with a specialist team"). `noteVisible: true` added to cards 8 and 9; card 6 already had it. Wording is K23. |
| 15 | 2.items.8 (new); card 2 meta | S2: nothing on what to do with symptoms | New item 8 from Ch 3 (diagnosis made without a second test; treatment shouldn’t be delayed; contact your doctor; Staying Safe pointer). Youth line renumbered 8 → 9; `neutral` [7, 8] → [7, 8, 9]. No same-day or 911 wording (K24). |
| 16 | 13.items.6; card 13 sources | S4: the held ICI line can be partly released | Now "check blood sugar before you start… and at every visit" (ADA 2.20 "before initiating treatment") plus "An international consensus says this diabetes can come on with DKA" (Holt). Holt added to card 13 sources. "Suddenly" stays held (E). |
| 17 | 13.note | S5: keep the steroid guard visible | No change; `noteVisible: true` kept (K12). |
| 18 | 6.s1.3; card 6 sources | L: rested on Holt and Exeter, unlabelled | Split: "Diabetes Canada says the right type may change your treatment" (Ch 3 "may alter management"; Ch 35) and "International guidance adds that it can show whether your family might be offered testing" (Exeter). `dc-cpg-ch35-t2d-children` added to card 6 sources. |
| 19 | 6.s2.6 | L: MIDD clue rested on Exeter, unlabelled | Added "International guidance links the two". |
| 20 | 6.figure.glossaryNote (new); G.2 | L: glossary terms 2, 3 and 6 rest on Holt, Exeter and ISPAD | New line under the glossary heading: "Where Canadian guidance doesn’t explain a test, the meaning here comes from international guidance." K11 updated. |
| 21 | 12.items.5 | C, with a note: CF Canada also recommends glucagon teaching | Canadian source now first ("Cystic Fibrosis Canada recommends glucagon and teaching for people on insulin"); ISPAD kept only for the weaker response. |
| 22 | 9.items.4 | C, re-cite: NIDDK states permanent and transient directly; the Exeter overview doesn’t | Claims row re-cited to `niddk-monogenic` (already on card 9). Pre-publish check 4 closed. |
| 23 | 3.items.6 (new); card 3 meta | R: dc-prediabetes "many people will"; Ch 3 "high risk" | Released: "Not everyone with prediabetes goes on to develop type 2, but Diabetes Canada says many people do". `neutral` [5] → [5, 6]. E row removed. |
| 24 | 6.figure.terms.4 | R: Ch 3 says A1C reflects the average over 2 to 3 months | Released: meaning now opens "A blood test that reflects your average blood sugar over the past 2 to 3 months". E row removed. |
| 25 | 5.items.10; card 5 sources | C, with notes: coverage unchanged; BT1D gives "8 years of age and older with Stage 2" | "for some people in stage 2" → "for people aged 8 and older in stage 2". `sanofi-tzield-approval-2025` removed from card 5 (no longer needed). Delay figure stays held (sources conflict). K7 and E updated. |
| 26 | 5.items.4, 5.note; E | C, with a note: the E reason "no source defines stage 3 by symptoms" is wrong; the sources conflict | Copy unchanged. E reason and K13 corrected; Phillip added to 5.note's row. |
| 27 | 5.items.7 | C: CanScreen banner unchanged today | Copy unchanged; pre-publish check 1 set to re-check on the publish day. |
| 28 | Section D pre-publish checks | Checks 2, 4 and 6 resolved; check 3 partly | Checks updated; checks 7 (register locators) and 8 (Ch 18 Table 4 visual re-read) added. |
| 29 | Register (`sources-meta.ts`) | Reg: five labels or language flags wrong (Sharif, Patel, PHSA, CHUSJ, ADA summary) | Listed in D check 5 for a repo fix. Not edited here (no repo edits). |
| 30 | Not changed | 83 Confirmed rows; urgent exit; no products, no Diabetes Express, no doses or drug classes | Kept as drafted. Header ground rules updated. |

### F.2 Changes after the review of the built chapters (2026-10-05)

Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), the Diabetes chapter meta, `type-figures.tsx` and the shared engine. No verified clinical sentence changed. Section B above still shows the wording from before these changes.

| # | Key | Review finding | Change made |
|---|---|---|---|
| 31 | 1.note, 2.items.8, 12.note, 13.items.10 (EN + FR); meta `links` | 3: pointers to Staying Safe were not links | Tags only, around words already there: “<link>Ketones and DKA</link>” → `staying-safe#card-7`; “<link>Emergency signs</link>” → `staying-safe#red-flags`; “Glucagon and <link>the Rule of 15</link>” → `staying-safe#card-2`; “Know the <link>signs of high blood sugar and ketones</link>” → `staying-safe#card-6`. FR the same phrases (“Les cétones et l’ACD”, “Les signes d’urgence”, “la règle des 15”, “les signes de l’hyperglycémie et des cétones”). Locale-aware; every target checked. No wording change. |
| 32 | urgentExit.link (EN); urgentExit.lead, .link (FR) | 5 and 8: same phrasing as New to the Journey | EN “Chapter 02 — Get emergency care now” → “Chapter 02 — Staying Safe”. FR lead “…se trouvent dans” → “…se trouvent dans le”; link “Chapitre 02 — Obtenez des soins d’urgence maintenant” → “chapitre 02 — Rester en sécurité”. Target unchanged (`staying-safe#red-flags`). Touches K16 (`urgentExit` in its `where`); its default is unchanged. |
| 33 | 8.figure.familyTree.sides.yours, .columns.typeTold (EN + FR) | 6: the first group holds brothers and sisters; the type header did not read on the “Me” row | “Me and my children” → “Me, my brothers and sisters, and my children” / “Moi et mes enfants” → “Moi, mes frères et sœurs, et mes enfants”. “The type they were told” → “Type of diabetes, as told” / “Le type qu’on lui a annoncé” → “Type de diabète, tel qu’annoncé”. Labels only; marked ✎ for the nurse in the review pack. |
| 34 | card 6 `testGlossary` (meta), `ui.testGlossary` (NEW, EN + FR); `cluesChecklist` and `familyTree` clear buttons | 7 | “Open all” / “Close all” (FR “Tout ouvrir” / “Tout fermer”), after hydration; it follows terms opened one at a time. Term anchors come from meta slugs: `#dc-term-gad`, `-ia-2-znt8-iaa`, `-c-peptide`, `-a1c`, `-ogtt`, `-gene-panel` (were `#dc-term-1`…`6`). “Clear my ticks” moves keyboard focus to the first tick box before it disables itself; the family tree’s “Clear the table” does the same with the first field. No wording change to the terms. |
| 35 | 11.note (FR) | 8: “soins en diabète” throughout | “vos soins du diabète” → “vos soins en diabète”. |
| 36 | Shared interface text | 8 (and 4) | Shared French interface text (`DiabetesCare.ui`, every chapter; review 8): `ui.chapter.takeIn.print` “Imprimez cette liste” → “Imprimer la liste”, so every print button uses the infinitive (“Imprimer la règle des 15”, “Imprimer mes indices et mes questions”, “Imprimer l’arbre familial”); “Soins du diabète” → “Soins en diabète” in `ui.chapter.kicker`, `backToLanding` and `backToChapters`; `ui.governance.machineTranslated` “votre équipe de soins du diabète” → “votre équipe de soins en diabète”. No link label stacks two brackets any more: the engine now puts the “(en anglais)” note inside a label’s own closing bracket (“(s’ouvre sur leur site, en anglais)”, “(connexion requise, en anglais)”), with no message change. Emergency number (review 4): the crisis strip’s label is now “Emergency: call 911” / “Urgence : appeler le 911” (meta `written: '911'`); the message text already said 911 everywhere, and 9-8-8 keeps its hyphens. |

New open question: **C41** in `OPEN-QUESTIONS.md` (nice to have): the type 1 share is “about 10%” here (1.items.1) and “5 to 10%” in New to the Journey (2.items.1). Neither sentence was changed.

---

## G) NEW SITE FIGURES needed

All three are named in the plan (05 · Know Your Type, card 6 interactives; card 8 "Family diabetes tree"). Each one:
- joins `DiabetesFigureMeta` (A.3);
- gets a French review gate of the same name in `GATED_KINDS`;
- gets an entry in `DIABETES_SITE.kinds`;
- is drawn in site-figures.tsx;
- is scoped CSS under `#oc-chapter[data-site='diabetes-care']`.

None of them stores, sends or scores anything.

### G.1 `cluesChecklist`: "Clues to mention" (card 6)

**Data**
- Meta: `{ kind: 'cluesChecklist', section: 2, questions: 5, sources: [...] }`.
- Words:
  - the card's own `sections.1–4` (all of them);
  - `note`, which is the banner;
  - `figure.legend` ("Tick any that fit you");
  - `figure.printHeading` ("Questions to bring to your team");
  - `figure.questions.1–5`.
- Control words, new under `DiabetesCare.ui.cluesChecklist`:
  - `print`: "Print my clues and questions"
  - `cluesTicked`: "Clues I ticked"
  - `noneTicked`: "Nothing ticked: all the clues are printed, to go through with your team."
  - `answer`: "Answer:"
  - `clear`: "Clear my ticks"

**Behaviour**
- It RESTYLES the card. Sections 1, 3 and 4 render as plain lists, in order. Section 2 renders as a `<fieldset>` with `<legend>` and one checkbox per item, labelled with the item's own sentence, so nothing is paraphrased.
- **Fixed banner.** The card's `note` ("Not a diagnostic tool…") sits in a `role="note"` box above the fieldset. It has no close control, never collapses, and stays in view in every state and in print. The card's `noteVisible: true` keeps it outside the collapsible region, and `noteCarrying` stops the row repeating it.
- **No score, no count, no result.** Ticking changes nothing else on the page. No "you may have…" text exists in any state.
- **The print button** produces one sheet, headed "Questions to bring to your team":
  - the banner, including the insulin safety line;
  - "Clues I ticked", listing the ticked items. If none are ticked, it lists all items with empty boxes and the `noneTicked` line;
  - the five questions, each with a ruled answer line.
  - Print uses the same `@media print` approach as the takeIn card.
- **State.** Ticks live in component state only. There is no localStorage, because health information should not persist on a shared device, and no network request. "Clear my ticks" resets them.
- **Accessibility.** These are native checkboxes with 44px targets. The print button is a real `<button>`, and the banner text is read before the fieldset.
- **Kinds:** `module` (renders open, no toggle), `restyle`, `noteCarrying`, `fullWidth`. **Gate:** `cluesChecklist`.

**No-JS and gated fallback.** The engine's plain card renders:
- the four sections as lists;
- the note, visible, as the banner;
- the questions as an ordered list after section 4, from the same `figure.questions` keys, server-rendered.

The browser's own print still works. No checkbox is rendered without JS, because a box that can't print its state would mislead.

### G.2 `testGlossary`: test names, in plain words (card 6)

**Data**
- Meta: `{ kind: 'testGlossary', terms: [{ slug: 'gad' }, { slug: 'ia-2-znt8-iaa' }, { slug: 'c-peptide' }, { slug: 'a1c' }, { slug: 'ogtt' }, { slug: 'gene-panel' }], sources: [...] }` (slugs added 2026-10-05, F.2 #34).
- Words: `figure.glossaryHeading`, `figure.glossaryNote` (the international-guidance line, drawn under the heading) and `figure.terms.1–6.{term, meaning}`. The six terms are GAD (GADA); IA-2, ZnT8 and IAA; C-peptide; A1C; OGTT; gene panel.
- The `terms` count is structural, so a translation can't add or drop a term.

**Behaviour**
- It AUGMENTS, sitting beneath the checklist. It is a `<dl>`, with each term as a `<details><summary>` pair so the list stays short. An "Open all" toggle is the only script.
- Each term has an id from its meta slug (`dc-term-gad`, `dc-term-c-peptide` and so on). Other cards can then link to it later: card 1's note already points readers here by card title. An "Open all / Close all" button (`ui.testGlossary`) opens or closes every term at once (2026-10-05).

**No-JS fallback.** `<details>` works without script; with it off, the terms simply start closed and open natively. The glossary note renders as plain text above the list. With the gate dropped on /fr, the card shows no glossary, and the test names stay explained in 6.s3.

### G.3 `familyTree`: "My family diabetes tree" (card 8)

*Redesigned on 2026-10-07 (owner notes 2 and 3): closed at first, people added one tap at a time, one-tap answers, portrait print. The current behaviour is in F.10; what follows is the first build.*

**Data**
- Meta: `{ kind: 'familyTree', sides: [...], columns: [...], sources: [...] }`.
- `sides` groups the row numbers:
  - yours: rows 1–3 (me, brothers and sisters, children);
  - mother's: rows 4–7 (mother, her mother, her father, her brothers and sisters);
  - father's: rows 8–11 (father, his mother, his father, his brothers and sisters).
- `columns` is structural, a fixed key list:
  - `hasDiabetes`;
  - `ageAtDiagnosis`, the MODY age clue (Ch 3, Diabetes UK, Exeter);
  - `typeTold`;
  - `insulinSoon`, insulin within 2 years (Ch 3: "time to needing insulin <1 to 2 years");
  - `hearingLoss`, with maternal side (MIDD, Exeter).
- Words: `figure.familyTree.{heading, intro, sides.*, rows.*, columns.*}`.
- Control words, new under `DiabetesCare.ui.familyTree`:
  - `print`: "Print the family tree"
  - `clear`: "Clear the table"
  - `notSaved`: "Nothing you type here is saved or sent."

**Behaviour**
- It AUGMENTS, sitting beneath the subtype columns. It is a `<table>` with a `<caption>` (the heading), one `<tbody>` per side with a row header for the side, and a text `<input>` in each cell, labelled by its row and column headers.
- The intro states that it does not work out a risk. There is no calculation, colouring, pattern detection or Exeter calculator, as the plan requires.
- **State.** Typed values live in component state only, with no localStorage and no network.
- **Print** gives a one-page landscape table with the typed values, or blank ruled cells if empty, so it can be filled in by hand.
- **Phone width.** The table becomes one stacked block per relative (row header, then five labelled fields). There is no horizontal scroll.
- **Kinds:** `module`, `fullWidth`. **Gate:** `familyTree`.

**No-JS and gated fallback.** The same table is server-rendered with empty cells and no inputs, a blank printable form. If the gate drops it on /fr, the card's note still tells the reader to note who in the family has diabetes and at what age, and the takeIn-style blank form is the fallback the nurse may prefer instead (see below).

**Simpler alternative (no new kind).** A generic `takeIn` with `fields: 11`, one labelled blank line per relative ("My mother: diabetes? age? type? insulin? hearing loss?"). It loses the table but needs no new code. It is recorded so the owner can choose it if engine time is short.

### G.4 Not built (named in the plan, deferred)

- **"Could my family join TrialNet?" explainer** (plan card 5). The eligibility is short and fully stated in 5.items.6: immediate relatives aged 2–45, other relatives aged 2–20. A picker would add a widget with no new information, so it is left as plain text.
  - If wanted later: a `trialnetExplainer` kind with a relationship radio (immediate / other) and an age field. It answers only "may be able to take part, see TrialNet" or "outside TrialNet's ages", never a risk.
  - Its no-JS fallback is 5.items.6 itself.
- **Exeter MODY probability calculator.** Not embedded (plan; design section B card 8).

### F.3 Changes after the full-site review (2026-10-06)

No wording changed in this chapter. Register addresses moved to their final diabetes.ca URLs (same pages; link crawl 4): `dc-type-1`, `dc-type-2`, `dc-ontario-monitoring-for-health`, `dc-out-of-pocket-costs-2022`. The landing's "Other" chip and the gestational path's row 21 were checked against cards 4 and 8 (paths.md H.3-2). Owner questions raised: the type 1 share (C41, again), "not overweight" (C45), and the CFRD guideline link (B36).

### F.4 Clinical rulings applied (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md). French is machine-drafted and awaits review.

| # | Key | Change (EN, then FR) | Ruling |
|---|---|---|---|
| 1 | `2.items.8` | EN "With symptoms of high blood sugar, Diabetes Canada says the diagnosis is made without a second test, and treatment shouldn’t be delayed. Contact your doctor without waiting. <link>Emergency signs</link> are in Staying Safe" → "With symptoms of high blood sugar, Diabetes Canada says the diagnosis is made without a second test, and treatment shouldn’t be delayed. Contact your doctor or another health-care provider today, without waiting for a second test. <link>Emergency signs</link> are in Staying Safe" · FR → "En présence de symptômes d’hyperglycémie, Diabète Canada indique que le diagnostic est posé sans deuxième test, et que le traitement ne doit pas être retardé. Communiquez avec votre médecin ou un autre professionnel de la santé aujourd’hui même, sans attendre un deuxième test. <link>Les signes d’urgence</link> se trouvent dans Rester en sécurité" | [C11](clinical-rulings-2026-10-06.md#c11) |
| 2 | `7.note` | EN "Bring these questions to your team. The signs of lows and ketones are in Staying Safe." → "Don’t stop or lower insulin because of anything on this page. Any change is made with your specialist. Bring these questions to your team. The signs of lows and ketones are in Staying Safe." · FR → "N’arrêtez pas et ne réduisez pas l’insuline à cause de quoi que ce soit sur cette page. Tout changement se fait avec votre spécialiste. Apportez ces questions à votre équipe. Les signes d’hypoglycémie et des cétones se trouvent dans Rester en sécurité." | [C22](clinical-rulings-2026-10-06.md#c22) |
| 3 | `13.note` | EN "Ask your prescriber or pharmacist before you change how you take any of these medicines." → "Don’t stop or change how you take any of these medicines on your own, even if your blood sugar goes up. Ask your prescriber or pharmacist first." · FR → "N’arrêtez pas ces médicaments et ne changez pas la façon dont vous les prenez de vous-même, même si votre glycémie augmente. Demandez d’abord à votre prescripteur ou à votre pharmacien." | [C22](clinical-rulings-2026-10-06.md#c22) |
| 4 | card 2 meta | `urgentContent: true` (a same-day line, so pinned open under the site-wide rule); `dc-hyperglycemia` added to its sources; the link to Staying Safe's red flags stays. K24 closed | [C11](clinical-rulings-2026-10-06.md#c11), [C25](clinical-rulings-2026-10-06.md#c25) |
| 5 | card 7 meta | `noteVisible: true`: the note now carries the insulin safety line. K23 closed | [C22](clinical-rulings-2026-10-06.md#c22) |
| 6 | K12, K22 | Card 13's note is more direct (above); the "Not a diagnostic tool" banner is approved as built; cards 6, 8 and 9 unchanged | [C22](clinical-rulings-2026-10-06.md#c22) |
| 7 | K16 | The carried Staying Safe defaults are ruled (3.9; ⅔ cup; the ladder for type 1; "most up to 28 days, follow your leaflet"; FIT industry). No alcohol limits stays open (C16) | [C1](clinical-rulings-2026-10-06.md#c1), [C13](clinical-rulings-2026-10-06.md#c13), [C4](clinical-rulings-2026-10-06.md#c4), [C15](clinical-rulings-2026-10-06.md#c15), [C14](clinical-rulings-2026-10-06.md#c14) |

Left as the default (the owner may still choose): card 7 says "with your specialist", not "with your team".

### F.5 Clinical rulings applied: targets, types and other (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md), rulings C16–C45 (the verifier's final copy; where a choice was left to the owner, the stated default). Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `chapters-meta.ts` and `sources-meta.ts` / `sources-review.ts`. Sections B and C above still show the earlier wording and claims rows; the keys and claims below are current. All French is machine-drafted and awaits the francophone review.

| # | Key or place | Change | Ruling |
|---|---|---|---|
| 1 | `5.items.10` | EN "In May 2025, Health Canada approved teplizumab (Tzield) for people aged 8 and older in stage 2. Diabetes Canada says it isn’t on any provincial or territorial drug plan. It’s available out of pocket, through private insurance, or through compassionate access" → "In May 2025, Health Canada approved teplizumab (Tzield) for people aged 8 and older in stage 2, to delay stage 3. Canada’s Drug Agency says that in one study it delayed stage 3 by about 2 years, and that it can cause side effects, including serious ones. The agency recommended that public drug plans not cover it, and Diabetes Canada says it isn’t on any provincial or territorial drug plan. It’s available out of pocket, through private insurance, or through compassionate access" · FR → "En mai 2025, Santé Canada a approuvé le teplizumab (Tzield) pour les personnes de 8 ans et plus au stade 2, afin de retarder le stade 3. Selon l’Agence des médicaments du Canada, dans une étude, il a retardé le stade 3 d’environ 2 ans, et il peut causer des effets secondaires, dont certains graves. L’Agence a recommandé que les régimes publics d’assurance médicaments ne le remboursent pas, et selon Diabète Canada, il n’est inscrit à aucun régime d’assurance médicaments provincial ou territorial. On peut l’obtenir à ses frais, par une assurance privée ou par un programme d’accès compassionnel" | [C26](clinical-rulings-2026-10-06.md#c26) |
| 2 | `6.sections.3.items.4` | EN "Diabetes Canada says antibody levels fade over time, and the tests aren’t accurate enough to use for everyone. International guidance recommends them for adults whose features overlap with type 1. Your team decides" → "Diabetes Canada says antibody levels fade over time, and the tests aren’t accurate enough to use for everyone. When your type is hard to tell, a positive test points to type 1, but a negative test doesn’t rule type 1 out. Your team decides" · FR → "Selon Diabète Canada, les taux d’anticorps diminuent avec le temps, et les tests ne sont pas assez précis pour être utilisés chez tout le monde. Quand le type est difficile à établir, un test positif oriente vers le type 1, mais un test négatif n’exclut pas le type 1. C’est votre équipe qui décide" | [C27](clinical-rulings-2026-10-06.md#c27) |
| 3 | `8.items.1` | EN "MODY is caused by a change in a single gene. Diabetes UK and the University of Exeter say it’s 1 to 2% of diabetes. The US National Institute of Diabetes and Digestive and Kidney Diseases (NIDDK) says 1 to 5% of diabetes is single-gene, counting all types" → "MODY is caused by a change in a single gene. Diabetes Canada calls single-gene diabetes rare. International estimates range from 1 to 2% of diabetes for MODY (Diabetes UK, University of Exeter) to 1 to 5% for all single-gene types (the US NIDDK)" · FR → "Le MODY est causé par une modification d’un seul gène. Diabète Canada qualifie le diabète monogénique de rare. Les estimations internationales vont de 1 à 2 % du diabète pour le MODY (Diabetes UK, Université d’Exeter) à 1 à 5 % pour l’ensemble des types monogéniques (le NIDDK des États-Unis)" | [C27](clinical-rulings-2026-10-06.md#c27) |
| 4 | `12.items.3` | EN "Screening is yearly from age 10, through your CF clinic. Canada’s guideline starts with an A1C test and adds a glucose tolerance test when needed. International guidance prefers starting with the glucose tolerance test. Your clinic decides" → "Screening is yearly from age 10, through your CF clinic. Cystic Fibrosis Canada’s guideline starts with an A1C test and adds a glucose tolerance test when needed. The glucose tolerance test may be used first if A1C isn’t reliable for you. Your clinic decides" · FR → "Le dépistage se fait chaque année dès l’âge de 10 ans, par votre clinique de fibrose kystique. Les lignes directrices de Fibrose kystique Canada commencent par un test d’A1C et ajoutent un test de tolérance au glucose au besoin. Le test de tolérance au glucose peut être fait en premier si l’A1C n’est pas fiable dans votre cas. C’est votre clinique qui décide" | [C27](clinical-rulings-2026-10-06.md#c27) |
| 5 | `13.items.8` | EN "Diabetes Canada’s guideline checks blood sugar before the transplant, in the first 3 months after it, and with an A1C at 3 and 12 months, then every year. International guidance prefers a glucose tolerance test. Your team decides" → "Diabetes Canada’s guideline checks blood sugar before the transplant, in the first 3 months after it, and with an A1C at 3 and 12 months, then every year. It says a glucose tolerance test is more sensitive than A1C, and it’s used if A1C isn’t reliable. Your team decides" · FR → "Les lignes directrices de Diabète Canada prévoient une vérification de la glycémie avant la greffe et au cours des 3 premiers mois qui suivent, et une A1C à 3 et à 12 mois, puis chaque année. Elles indiquent qu’un test de tolérance au glucose est plus sensible que l’A1C, et qu’on y a recours si l’A1C n’est pas fiable. C’est votre équipe qui décide" | [C27](clinical-rulings-2026-10-06.md#c27) |
| 6 | `5.items.3` | EN "Stage 2: antibodies, with blood sugar starting to rise above normal" → "Stage 2: two or more type 1 antibodies, with blood sugar starting to rise above normal" · FR → "Stade 2 : au moins deux anticorps du type 1, avec une glycémie qui commence à dépasser la normale" | [C27](clinical-rulings-2026-10-06.md#c27) |
| 7 | `7.figure.fields.4` | New: EN "Would a sensor (CGM) help me?" · FR "Un capteur (SGC) me serait-il utile?" | [C35](clinical-rulings-2026-10-06.md#c35) |
| 8 | `5.items.11` | New: EN "Breakthrough T1D also says you can ask your doctor to look at UncoverT1D, a website run by Sanofi, the company that makes teplizumab, that has information for health care providers about which tests to order" · FR "Breakthrough T1D indique aussi que vous pouvez demander à votre médecin de consulter UncoverT1D, un site Web géré par Sanofi, l’entreprise qui fabrique le teplizumab, qui offre de l’information aux professionnels de la santé sur les tests à prescrire" | [C36](clinical-rulings-2026-10-06.md#c36) |
| 9 | `1.items.2` | EN "Type 1 can start in adulthood. Breakthrough T1D says about 71% of Canadians with type 1 were diagnosed as adults" → "Type 1 can start in adulthood. Breakthrough T1D estimates that about 71% of people with type 1 in Canada were diagnosed as adults" · FR → "Le type 1 peut commencer à l’âge adulte. Selon une estimation de Breakthrough T1D, environ 71 % des personnes atteintes du type 1 au Canada ont reçu leur diagnostic à l’âge adulte" | [C39](clinical-rulings-2026-10-06.md#c39) |
| 10 | `1.items.1` | EN "About 10% of people with diabetes have type 1. In type 1, the pancreas makes no insulin, so insulin is taken by injection or with a pump" → "Diabetes Canada says 5 to 10% of people with diabetes have type 1. In type 1, the pancreas makes no insulin, so insulin is taken by injection or with a pump" · FR → "Selon Diabète Canada, de 5 à 10 % des personnes diabétiques ont le type 1. Dans le type 1, le pancréas ne produit pas d’insuline, alors l’insuline est prise par injection ou avec une pompe" | [C41](clinical-rulings-2026-10-06.md#c41) |
| 11 | `12.items.5` | EN "If you use insulin, ask your team for a plan for lows. Cystic Fibrosis Canada recommends glucagon and teaching for people on insulin. International guidance adds that the body’s own response to a low is weaker in CF" → "If you use insulin, ask your team for a plan for lows. Cystic Fibrosis Canada’s guideline says people on insulin, and their families or carers, should be taught how to use glucagon. International guidance adds that the body’s own response to a low is weaker in CF" · FR → "Si vous prenez de l’insuline, demandez à votre équipe un plan en cas d’hypoglycémie. Selon les lignes directrices de Fibrose kystique Canada, les personnes sous insuline, ainsi que leur famille ou leurs proches aidants, devraient apprendre à utiliser le glucagon. Des lignes directrices internationales ajoutent que la réaction naturelle du corps à une hypoglycémie est plus faible avec la fibrose kystique" | [C43](clinical-rulings-2026-10-06.md#c43) |
| 12 | `6.sections.2.items.1` | EN "You were diagnosed at a younger age, or you’re not overweight" → "You were diagnosed at a younger age, or you have a lower body weight" · FR → "Vous avez reçu le diagnostic à un plus jeune âge, ou vous avez un poids corporel plus bas" | [C45](clinical-rulings-2026-10-06.md#c45) |
| 13 | `8.items.3` | EN "Clues include being diagnosed young, not being overweight, having no type 1 antibodies, and a parent with diabetes, in two or more generations" → "Clues include being diagnosed young, not having obesity, having no type 1 antibodies, and a parent with diabetes, in two or more generations" · FR → "Parmi les indices : un diagnostic à un jeune âge, l’absence d’obésité, l’absence d’anticorps du type 1, et un parent diabétique, sur au moins deux générations" | [C45](clinical-rulings-2026-10-06.md#c45) |
| 14 | card 5 (meta) | Figure `neutral` adds 11; sources add `hc-dpd-tzield-monograph-2026` and `cda-amc-tzield-recommendation-2026`. Claims: 5.items.3 adds the monograph; 5.items.4 adds `dc-cpg-ch41-t1d-lifespan-2025` and the CDA recommendation; 5.items.10 `dc-tzield-access-2026`, `bt1d-tzield-update-2026`, the CDA recommendation and the monograph; 5.items.11 `bt1d-stages-and-diagnosis` (Breakthrough's "ask your doctor to consult www.uncovert1d.ca", re-read 2026-10-06), with "Sanofi makes teplizumab" on the monograph and the CDA recommendation (sponsor Sanofi-aventis Canada). No link to uncovert1d.ca. K7, K13 and K18 closed; section E's teplizumab-delay row is released | [C26](clinical-rulings-2026-10-06.md#c26), [C27](clinical-rulings-2026-10-06.md#c27), [C36](clinical-rulings-2026-10-06.md#c36) |
| 15 | register | New `cda-amc-tzield-recommendation-2026` (Canada's Drug Agency, "Reimbursement Recommendation: Teplizumab (Tzield)", January 2026, Vol 6 Issue 1; its French project page links only the English PDF) and `hc-dpd-tzield-monograph-2026` (Health Canada DPD, "TZIELD Product Monograph Including Patient Medication Information", authorized 2026-07-20, EN and FR files), both read 2026-10-06. `bt1d-tzield-update-2026` gains its French page, « Mise à jour au sujet de Tzield » (perceedt1.ca) | [C26](clinical-rulings-2026-10-06.md#c26) |
| 16 | card 1 (meta) | Sources add the new `dc-diabetes-in-canada` (Diabetes Canada, "Diabetes in Canada": type 1 is "5-10% of diabetes prevalence"; read 2026-10-06, no French page). Claims: 1.items.1 `dc-type-1`, `dc-diabetes-in-canada`. PATHS Q20 closed | [C41](clinical-rulings-2026-10-06.md#c41) |
| 17 | card 7 (meta) | `{ kind: 'takeIn', fields: 3 }` → `fields: 4`, for the new question. K19 closed ("CGM is standard" stays held) | [C35](clinical-rulings-2026-10-06.md#c35) |
| 18 | cards 6, 8, 12, 13 claims | 6.s3.4 `dc-cpg-ch3-classification-diagnosis` only (K1; card 6's sources unchanged, the ADA still backs 6.s2.3 and 6.s2.8); 8.items.1 adds Ch3 ("rare"; K3); 12.items.3 `cf-canada-cfrd-guideline-2024` only (K5); 13.items.8 `dc-cpg-ch20-transplantation` only (K6; card 13's sources unchanged). Card 12's sources drop `ada-soc-2026-s2-summary` (ISPAD stays for 12.items.5). K2 and K4 unchanged. Left as the default: "from age 10" (not "starting by age 10") | [C27](clinical-rulings-2026-10-06.md#c27) |
| 19 | cards 8, 9 claims | 8.items.7 and 9.items.5 cite `dc-cpg-ch3-classification-diagnosis` first (Table 2: first-line treatment "Depends on subtype"; the neonatal footnote "may be amenable to therapy with oral sulfonylurea in place of insulin therapy"), ahead of ISPAD and Exeter. The "tablets" detail still rests on international sources, so card 8's badge stays. No medicine class anywhere. K14 closed | [C21](clinical-rulings-2026-10-06.md#c21) |
| 20 | cards 12, 13 (meta) | Ask: card 12 `team` → `cfClinic` ("Ask your CF clinic"); card 13 `pharmacist` → `prescriber` ("Ask your prescriber"; its visible note keeps "or pharmacist"). Cards 8 and 10 stay `endo` and card 11 stays `team`: `geneticCounsellor` and `giSpecialist` were not approved. K10 closed | [C33](clinical-rulings-2026-10-06.md#c33) |
| 21 | 12.items.5 claims | `cf-canada-cfrd-guideline-2024` (Recommendation IV is addressed to "Individuals with CFRD (and their families/carers)"), plus `ispad-2022-cfrd` for the last sentence | [C43](clinical-rulings-2026-10-06.md#c43) |
| 22 | K8, K15, K17, K21 | Kept as built: Wolfram under card 10's badge; no type named for hemochromatosis (DC Appendix 2 outranks the society FAQ's "Type II"); the BC and Manitoba examples | [C35](clinical-rulings-2026-10-06.md#c35), [C36](clinical-rulings-2026-10-06.md#c36) |
| 23 | K9, K20 | Kept held: the name "type 3c" and the pancreatic-cancer clue; the card stays "Pancreas conditions and iron overload". Section E records the Canadian Cancer Society page as the candidate source | [C34](clinical-rulings-2026-10-06.md#c34) |
| 24 | K11 | Kept: the badge on cards 7–10; mixed cards name the international source in the sentence. 12.items.3, 13.items.8 and 6.s3.4 are Canadian only now, so they no longer need an in-line label | [C40](clinical-rulings-2026-10-06.md#c40) |
| 25 | K16 | The last carried default, alcohol, is ruled too (Every Day Living card 4) | [C16](clinical-rulings-2026-10-06.md#c16) |

### F.6 Owner's business answers applied (2026-10-06)

From the owner's answers of 2026-10-06 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)). French machine-drafted.

| # | Key | Change | Why |
|---|---|---|---|
| 1 | `pharmacist.body`, `pharmacist.cta` | EN body → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province. Questions about your type, and the tests for it, belong with your diabetes team." · FR → "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province. Les questions sur votre type, et sur les tests qui s’y rattachent, relèvent de votre équipe de soins en diabète.". Under the body, the panel shows the CDE contact from `ui.contact` (DIABETES_SITE.contact): "Call 1-844-561-1254" (tel:+18445611254; FR "Appeler le 1 844 561-1254"), "Email BayshoreExpress@bayshore.ca", "Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays", and "About Bayshore Express Pharmacy" (https://bayshoreexpresspharmacy.ca/about/; FR /fr/a-propos-de-nous/, `bep-about`). The `cta` "Request a call" is removed: the panel has no button, and the hero's "Ask a pharmacist" opens the panel (`#chapter-cde`) | Owner A2, B5, B9, B10, B12 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)) |
| 2 | register `cf-canada-cfrd-guideline-2024`; chapter citations | Now links Cystic Fibrosis Canada's own page, "Guidelines & Standards of Care" (https://cysticfibrosis.ca/guidelines-and-standards-of-care, opened 2026-10-06), which lists and links the guideline PDF; French page `hrefFr` https://fibrosekystique.ca/normes-de-soins-de-la-fk-et-lignes-directrices-cliniques (its hreflang link; it links the French guideline). Label: the guideline's title as the page prints it. Card 12 and the less common types path cite it unchanged | B36 |

### F.7 Commerce step: shop strips (2026-10-06)

How a strip behaves (all chapters): the products are named in `diabetes-care/chapters/chapter-shop.ts` (owner answer B21, "Now?"), drawn by the shared engine (`_microsite/shop/`) under the card's referral chip, and read from the catalogue on every request. A product shows only while the store shows it, sells it and has it in stock, and never when its description names or links another retailer or gives its phone number (17 descriptions still do; OPEN-QUESTIONS B3). A product with a required option or modifier (85 diabetes products carry a required "Test" modifier today) gets "Choose options", a link to its page, instead of a one-click add. No kit is listed (A4). One switch, `SHOP_SWITCH.placements`, turns every strip off. Every placed id is health-revealing by id for analytics (`sensitive-products.ts`). The strip's words are `ui.chapter.shop.*` (French machine-drafted, not behind a review gate, as on Ostomy).

| # | Card | Strip | Why |
|---|---|---|---|
| 1 | 1, 7, 11, 12, 13 | `checkTools` ("Checking supplies, if your team suggests them"): meters (4287, 4524, 4556, 4402), urine ketone strips (Ketostix 4808), sensors (4227, 4316). The blood β-ketone strips (4909) are left out: no blood-ketone meter is stocked, and their description links another retailer | B21 |
| 2 | 2, 4 | `meterAndStrips`: OneTouch (meter 4287, strips 4948) and Contour (meter 4524, strips 4714; the strips do not render today, their description links another retailer). Card 4 gets meters and strips only, not ketone strips or sensors (as the gestational path) | B21 |
| 3 | 3 Prediabetes | None, on purpose | B21 rule |
| 4 | 5, 6, 8, 9, 10 | None: no content file plans products for them | B21 |

### F.8 Fixes after the full-site review (2026-10-06)

French machine-drafted. Engine-wide changes are in new-to-the-journey.md F.8.

| # | Where | Change | Why |
|---|---|---|---|
| 1 | `pharmacist.heading` | "Questions about pump and sensor supplies" → "Questions about pumps, sensors, supplies or claims" (FR « Questions sur les pompes, les capteurs, les fournitures ou les demandes de remboursement »), as on Staying Safe: the panel's body covers meters, supplies, billing and claims too (B10) | Clinical review 4 |

### F.9 Owner notes 5 and 1 applied (2026-10-07)

From the owner’s review of 2026-10-07 (notes 5 and 1; the diagnosis and its review are in the session record). French machine-drafted, the same change as the English, under the existing draft marker. **Note 5:** the Certified Diabetes Educators are presented as Liivv’s own service: no "Bayshore Express Pharmacy", no Markham, no email and no About link in any customer line; the contact is the phone and the hours (`DIABETES_SITE.contact` = `tel` only; the engine renders email and About only where a site sets them); register id `bep-about` deleted everywhere. The governance line "Liivv is a HelioMed company and part of the Bayshore family" stays (the owner’s own wording, B15). **Note 1:** sources are shown in the element, not named in the prose. Every card ends with a Sources disclosure (closed: up to three publishers, then "+N"; open: "Title, Publisher (year)", "(en anglais)" inside the link on /fr), built from the card’s own `sources` plus those of the figures this locale keeps; "Where this comes from" lists every card, figure, band and lane source, grouped Canadian, international, then makers. Prose now states the fact; a comparison says "In Canada…" / "International guidance…"; a line that gives clinical permission or states a guideline recommendation says "Canadian guidelines…" with the year in the disclosure. Numbers and hedges are unchanged. Every rewritten key is listed below with its new EN and FR.

| # | Key | Now (EN) | Now (FR) | Why |
|---|---|---|---|---|
| 1 | `pharmacist.body` | Liivv’s Certified Diabetes Educators answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to Liivv’s pharmacy in your province. Questions about your type, and the tests for it, belong with your diabetes team. | Les éducateurs agréés en diabète de Liivv répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie de Liivv de votre province. Les questions sur votre type, et sur les tests qui s’y rattachent, relèvent de votre équipe de soins en diabète. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 2 | `categories.1.items.1` | 5 to 10% of people with diabetes have type 1. In type 1, the pancreas makes no insulin, so insulin is taken by injection or with a pump | De 5 à 10 % des personnes diabétiques ont le type 1. Dans le type 1, le pancréas ne produit pas d’insuline, alors l’insuline est prise par injection ou avec une pompe | Owner note 1 (category A) |
| 3 | `categories.1.items.2` | Type 1 can start in adulthood. An estimated 71% of people with type 1 in Canada were diagnosed as adults | Le type 1 peut commencer à l’âge adulte. On estime qu’environ 71 % des personnes atteintes du type 1 au Canada ont reçu leur diagnostic à l’âge adulte | Owner note 1 (category A) |
| 4 | `categories.1.items.3` | 85% have no family connection to type 1 | 85 % n’ont aucun lien familial avec le type 1 | Owner note 1 (category A) |
| 5 | `categories.1.items.5` | For type 1, Canadian guidelines name automated insulin delivery as the preferred option for anyone willing and able to use it. Otherwise, they recommend a sensor (CGM) with a pump or with injections | Pour le type 1, les lignes directrices canadiennes désignent l’administration automatisée d’insuline comme l’option à privilégier pour toute personne qui veut et peut l’utiliser. Sinon, elles recommandent un capteur (SGC) avec une pompe ou avec des injections | Owner note 1 (category A) |
| 6 | `categories.2.items.1` | Type 2 is the most common type. 90 to 95% of people with diabetes have it | Le type 2 est le type le plus courant. De 90 à 95 % des personnes diabétiques l’ont | Owner note 1 (category A) |
| 7 | `categories.2.items.3` | In Canada, diabetes is diagnosed with any one of these results: | Au Canada, le diagnostic de diabète est posé avec l’un ou l’autre de ces résultats : | Owner note 1 (category C) |
| 8 | `categories.2.items.8` | With symptoms of high blood sugar, the diagnosis is made without a second test, and treatment shouldn’t be delayed. Contact your doctor or another health-care provider today, without waiting for a second test. <link>Emergency signs</link> are in Staying Safe | En présence de symptômes d’hyperglycémie, le diagnostic est posé sans deuxième test, et le traitement ne doit pas être retardé. Communiquez avec votre médecin ou un autre professionnel de la santé aujourd’hui même, sans attendre un deuxième test. <link>Les signes d’urgence</link> se trouvent dans Rester en sécurité | Owner note 1 (category A) |
| 9 | `categories.2.items.9` | For children and teens with type 2, antibody testing should be considered, because up to 10 to 20% test positive | Chez les enfants et les adolescents atteints du type 2, un test d’anticorps devrait être envisagé, car jusqu’à 10 à 20 % obtiennent un résultat positif | Owner note 1 (category A) |
| 10 | `categories.3.items.1` | Prediabetes means a blood sugar above the usual range, but below the numbers for diabetes. In Canada, any one of these results is used: | Le prédiabète, c’est une glycémie au-dessus des valeurs habituelles, mais sous les seuils du diabète. Au Canada, on utilise l’un ou l’autre de ces résultats : | Owner note 1 (category C) |
| 11 | `categories.3.items.6` | Not everyone with prediabetes goes on to develop type 2, but many people do | Les personnes atteintes de prédiabète ne développent pas toutes un diabète de type 2, mais beaucoup le font | Owner note 1 (category A) |
| 12 | `categories.4.items.3` | If you’re at high risk, Canadian guidelines include an A1C test before 20 weeks | Si vous êtes à risque élevé, les lignes directrices canadiennes prévoient un test d’A1C avant 20 semaines | Owner note 1 (category A) |
| 13 | `categories.4.items.5` | Gestational diabetes affects 3 to 20% of pregnancies and usually goes away after birth. It raises the chance of type 2 and heart disease later | Le diabète gestationnel touche de 3 à 20 % des grossesses et disparaît habituellement après l’accouchement. Il augmente le risque de diabète de type 2 et de maladie du cœur plus tard | Owner note 1 (category A) |
| 14 | `categories.4.items.6` | After the birth, a glucose tolerance test between 6 weeks and 6 months is recommended | Après l’accouchement, un test de tolérance au glucose est recommandé entre 6 semaines et 6 mois | Owner note 1 (category A) |
| 15 | `categories.4.items.7` | International guidance says a steady fasting blood sugar of 5.5 to 8 mmol/L, with diabetes in the family, can point to a single-gene type called GCK-MODY. If that sounds like you, tell your team early in pregnancy | Selon des lignes directrices internationales, une glycémie à jeun stable de 5,5 à 8 mmol/L, avec du diabète dans la famille, peut indiquer un type monogénique appelé MODY-GCK. Si cela vous ressemble, parlez-en à votre équipe tôt dans la grossesse | Owner note 1 (category A) |
| 16 | `categories.5.items.1` | Type 1 starts before there are symptoms. Stages 1 and 2 come before diagnosis, and international guidance defines the stages like this: | Le type 1 commence avant l’apparition des symptômes. Les stades 1 et 2 précèdent le diagnostic, et des lignes directrices internationales définissent les stades ainsi : | Owner note 1 (category A) |
| 17 | `categories.5.items.5` | Two or more antibodies that last over time mean a high risk of type 1. Only 10 to 15% of people newly diagnosed have a family history | Au moins deux anticorps qui persistent dans le temps signifient un risque élevé de type 1. Seulement 10 à 15 % des personnes qui viennent de recevoir le diagnostic ont des antécédents familiaux | Owner note 1 (category A) |
| 18 | `categories.5.items.7` | There is also FEDERATE-Can, in Quebec. CanScreen, a Canadian research program on screening newborns and children, says it is launching in fall 2026 or winter 2027 | Il y a aussi FEDERATE-Can, au Québec. CanScreen, un programme de recherche canadien sur le dépistage chez les nouveau-nés et les enfants, indique qu’il sera lancé à l’automne 2026 ou à l’hiver 2027 | Owner note 1 (category A+B) |
| 19 | `categories.5.items.8` | In Canada, the type 1 guidelines (2025) make no recommendation about screening | Au Canada, les lignes directrices sur le type 1 (2025) ne font aucune recommandation sur le dépistage | Owner note 1 (category C) |
| 20 | `categories.5.items.10` | In May 2025, Health Canada approved teplizumab (Tzield) for people aged 8 and older in stage 2, to delay stage 3. In one study it delayed stage 3 by about 2 years, and it can cause side effects, including serious ones. Canada’s Drug Agency recommended that public drug plans not cover it, and it isn’t on any provincial or territorial drug plan. It’s available out of pocket, through private insurance, or through compassionate access | En mai 2025, Santé Canada a approuvé le teplizumab (Tzield) pour les personnes de 8 ans et plus au stade 2, afin de retarder le stade 3. Dans une étude, il a retardé le stade 3 d’environ 2 ans, et il peut causer des effets secondaires, dont certains graves. L’Agence des médicaments du Canada a recommandé que les régimes publics d’assurance médicaments ne le remboursent pas, et il n’est inscrit à aucun régime d’assurance médicaments provincial ou territorial. On peut l’obtenir à ses frais, par une assurance privée ou par un programme d’accès compassionnel | Owner note 1 (category A+B) |
| 21 | `categories.5.items.11` | You can ask your doctor to look at UncoverT1D, a website run by Sanofi, the company that makes teplizumab, that has information for health care providers about which tests to order | Vous pouvez demander à votre médecin de consulter UncoverT1D, un site Web géré par Sanofi, l’entreprise qui fabrique le teplizumab, qui offre de l’information aux professionnels de la santé sur les tests à prescrire | Owner note 1 (category A) |
| 22 | `categories.6.sections.1.items.1` | Your diabetes team decides your type. Some cases are difficult to classify | C’est votre équipe de soins en diabète qui détermine votre type. Certains cas sont difficiles à classer | Owner note 1 (category A) |
| 23 | `categories.6.sections.1.items.2` | An international consensus found that more than 40% of people who develop type 1 after age 30 are first treated as type 2 | Un consensus international a établi que plus de 40 % des personnes chez qui le type 1 apparaît après 30 ans sont d’abord traitées comme si elles avaient le type 2 | Owner note 1 (category A) |
| 24 | `categories.6.sections.1.items.3` | The right type may change your treatment. International guidance adds that it can show whether your family might be offered testing | Le bon type peut changer votre traitement. Des lignes directrices internationales ajoutent qu’il peut indiquer si un dépistage pourrait être offert à votre famille | Owner note 1 (category A) |
| 25 | `categories.6.sections.3.items.4` | Antibody levels fade over time, and the tests aren’t accurate enough to use for everyone. When your type is hard to tell, a positive test points to type 1, but a negative test doesn’t rule type 1 out. Your team decides | Les taux d’anticorps diminuent avec le temps, et les tests ne sont pas assez précis pour être utilisés chez tout le monde. Quand le type est difficile à établir, un test positif oriente vers le type 1, mais un test négatif n’exclut pas le type 1. C’est votre équipe qui décide | Owner note 1 (category A) |
| 26 | `categories.6.figure.terms.4.meaning` | A blood test that reflects your average blood sugar over the past 2 to 3 months. It’s used to diagnose diabetes and prediabetes. With diabetes, it’s usually checked about every 3 months. | Un test sanguin qui reflète votre glycémie moyenne des 2 à 3 derniers mois. On l’utilise pour diagnostiquer le diabète et le prédiabète. Avec le diabète, on le fait habituellement environ tous les 3 mois. | Owner note 1 (category A) |
| 27 | `categories.7.items.6` | A modified type 1 plan can include some type 2 medicines. International guidance says others are less suitable, so ask your team before any change | Un plan de type 1 adapté peut comprendre certains médicaments du type 2. Des lignes directrices internationales indiquent que d’autres conviennent moins, alors parlez-en à votre équipe avant tout changement | Owner note 1 (category A) |
| 28 | `categories.7.items.7` | Estimates of how common it is range from 2 to 12% of adult diabetes (international) to about 10% (Canadian) | Les estimations de sa fréquence vont de 2 à 12 % du diabète chez l’adulte (estimation internationale) à environ 10 % (estimation canadienne) | Owner note 1 (category C) |
| 29 | `categories.8.items.1` | MODY is caused by a change in a single gene. In Canada, single-gene diabetes is called rare. International estimates range from 1 to 2% of diabetes for MODY to 1 to 5% for all single-gene types | Le MODY est causé par une modification d’un seul gène. Au Canada, le diabète monogénique est qualifié de rare. Les estimations internationales vont de 1 à 2 % du diabète pour le MODY à 1 à 5 % pour l’ensemble des types monogéniques | Owner note 1 (category C) |
| 30 | `categories.8.items.2` | About 9 in 10 people with MODY are first told they have another type | Environ 9 personnes sur 10 atteintes du MODY se font d’abord dire qu’elles ont un autre type | Owner note 1 (category A) |
| 31 | `categories.8.items.4` | How young varies. Canadian guidance, and some international guidance, use under 25. Other international guidance uses under 30, or 35 and under. Your team decides | L’âge considéré comme jeune varie. Les recommandations canadiennes, et certaines recommandations internationales, utilisent moins de 25 ans. D’autres lignes directrices internationales utilisent moins de 30 ans, ou 35 ans et moins. C’est votre équipe qui décide | Owner note 1 (category C) |
| 32 | `categories.9.items.2` | Every baby diagnosed before 6 months should have genetic testing | Tout bébé qui reçoit un diagnostic avant 6 mois devrait passer un test génétique | Owner note 1 (category A) |
| 33 | `categories.9.items.3` | International estimates are about 1 in 100,000 births and about 1 in 90,000. It is described as occurring in the first 6 to 12 months | Les estimations internationales sont d’environ 1 naissance sur 100 000 et d’environ 1 sur 90 000. On le décrit comme survenant dans les 6 à 12 premiers mois | Owner note 1 (category C) |
| 34 | `categories.11.items.1` | Diseases of the pancreas can cause diabetes, including pancreatitis, surgery or injury to the pancreas, a growth in the pancreas, and cystic fibrosis | Les maladies du pancréas peuvent causer le diabète, notamment la pancréatite, une chirurgie ou une blessure au pancréas, une masse dans le pancréas et la fibrose kystique | Owner note 1 (category A) |
| 35 | `categories.11.items.2` | Hemochromatosis, where the body stores too much iron, is another cause. It can affect the pancreas and lead to diabetes | L’hémochromatose, quand le corps accumule trop de fer, est une autre cause. Elle peut toucher le pancréas et mener au diabète | Owner note 1 (category A) |
| 36 | `categories.11.items.3` | About 1 in 300 Canadians have two copies of the gene change that puts them at risk. Fewer than 1 in 10 of them develop the disease | Environ 1 Canadien sur 300 a deux copies de la modification génétique qui l’expose à ce risque. Moins de 1 sur 10 d’entre eux développent la maladie | Owner note 1 (category A) |
| 37 | `categories.11.items.6` | Treatment removes blood regularly (phlebotomy). It can mildly improve diabetes | Le traitement consiste à retirer du sang régulièrement (phlébotomie). Il peut améliorer légèrement le diabète | Owner note 1 (category A) |
| 38 | `categories.12.items.3` | Screening is yearly from age 10, through your CF clinic. Canadian guidelines start with an A1C test and add a glucose tolerance test when needed. The glucose tolerance test may be used first if A1C isn’t reliable for you. Your clinic decides | Le dépistage se fait chaque année dès l’âge de 10 ans, par votre clinique de fibrose kystique. Les lignes directrices canadiennes commencent par un test d’A1C et ajoutent un test de tolérance au glucose au besoin. Le test de tolérance au glucose peut être fait en premier si l’A1C n’est pas fiable dans votre cas. C’est votre clinique qui décide | Owner note 1 (category A) |
| 39 | `categories.12.items.4` | Insulin is the main treatment, and the only medicine used for children. Some adults may have other options | L’insuline est le principal traitement, et le seul médicament utilisé chez les enfants. Certains adultes peuvent avoir d’autres options | Owner note 1 (category A) |
| 40 | `categories.12.items.5` | If you use insulin, ask your team for a plan for lows. Canadian guidelines say people on insulin, and their families or carers, should be taught how to use glucagon. International guidance adds that the body’s own response to a low is weaker in CF | Si vous prenez de l’insuline, demandez à votre équipe un plan en cas d’hypoglycémie. Selon les lignes directrices canadiennes, les personnes sous insuline, ainsi que leur famille ou leurs proches aidants, devraient apprendre à utiliser le glucagon. Des lignes directrices internationales ajoutent que la réaction naturelle du corps à une hypoglycémie est plus faible avec la fibrose kystique | Owner note 1 (category A) |
| 41 | `categories.13.items.1` | Some medicines can cause diabetes, including steroids, some antipsychotics and some anti-rejection medicines | Certains médicaments peuvent causer le diabète, notamment les stéroïdes, certains antipsychotiques et certains médicaments antirejet | Owner note 1 (category A) |
| 42 | `categories.13.items.2` | 20 to 50% of people without diabetes who take steroids develop high blood sugar. Checking blood sugar for 48 hours after starting may be considered | De 20 à 50 % des personnes non diabétiques qui prennent des stéroïdes présentent une glycémie élevée. On peut envisager de vérifier la glycémie pendant 48 heures après le début du traitement | Owner note 1 (category A) |
| 43 | `categories.13.items.5` | Canadian guidelines recommend checking weight, blood pressure, blood sugar and cholesterol before you start, then on a schedule that differs for each check. Ask your prescriber when yours are due | Les lignes directrices canadiennes recommandent de vérifier le poids, la pression artérielle, la glycémie et le cholestérol avant le début du traitement, puis selon un calendrier qui diffère pour chaque vérification. Demandez à votre prescripteur quand les vôtres sont prévues | Owner note 1 (category A) |
| 44 | `categories.13.items.6` | International guidance says to check blood sugar before you start a checkpoint inhibitor, a type of cancer immunotherapy, and at every visit while you’re on it. An international consensus says this diabetes can come on with DKA | Des lignes directrices internationales recommandent de vérifier la glycémie avant le début d’un traitement par un inhibiteur de point de contrôle immunitaire, un type d’immunothérapie contre le cancer, et à chaque visite pendant ce traitement. Un consensus international indique que ce diabète peut se manifester par une ACD | Owner note 1 (category A) |
| 45 | `categories.13.items.8` | Canadian guidelines call for checking blood sugar before the transplant, in the first 3 months after it, and with an A1C at 3 and 12 months, then every year. A glucose tolerance test is more sensitive than A1C, and it’s used if A1C isn’t reliable. Your team decides | Les lignes directrices canadiennes prévoient une vérification de la glycémie avant la greffe et au cours des 3 premiers mois qui suivent, et une A1C à 3 et à 12 mois, puis chaque année. Un test de tolérance au glucose est plus sensible que l’A1C, et on y a recours si l’A1C n’est pas fiable. C’est votre équipe qui décide | Owner note 1 (category A) |

Rulings whose in-sentence credit owner note 1 supersedes (2026-10-07; recorded in clinical-rulings-2026-10-06.md and on the register entry in sources-review.ts):

| Ruling | Where | Now |
|---|---|---|
| C11 / K24 | `2.items.8` | The same-day line no longer says "Diabetes Canada says"; its wording from C11 is otherwise unchanged |
| C39 | `1.items.2` | "Breakthrough T1D estimates" → "An estimated 71%", not "Canadian estimate" (the Type 1 Diabetes Index is a global model) |
| C40 | every mixed card | International lines now say "International guidance…" or "An international consensus…" without naming the body; the Sources disclosure lists the body and groups it as international; the badge on cards 7–10 stays |

Corrections after the verification of notes 5 and 1 (2026-10-07):

- `categories.1.items.5` now opens "For type 1, Canadian guidelines name…" / « Pour le type 1, les lignes directrices canadiennes désignent… ». The first rewrite dropped "type 1" along with the guideline’s name; the source is the type 1 guideline, so the line is scoped to type 1 again (row 5 above shows the corrected text). For the nurse under B46.

### F.10 Owner notes 2 and 3 applied: printing and the family tree (2026-10-07)

Printing (engine change: new-to-the-journey.md F.10): cards 4 and 7 print on one page, the clues sheet (card 6) on two, each with the header and the card’s sources; the clues sheet keeps its banner with the insulin safety line.

**The family tree (card 8), redesigned (note 2: the 55-box table was too much; note 3: one tap, not typing).** Superseding G.3’s behaviour; the meta and paper table are kept.

- **Closed at first**: the heading, the intro and one "Start my family tree" button (about 180px on desktop).
- **Started**: "Me", then "Add a family member", with one-tap Add buttons grouped by the existing sides (Me, my brothers and sisters, and my children / My mother’s side / My father’s side). Brothers and sisters, children and each parent’s brothers and sisters can be added more than once (`repeatable: [2, 3, 7, 11]`); a parent or grandparent once (the button turns off). At most 20 people (`maxPeople`), with a note when full. Focus moves to the person added, and a polite status line says "Added: …" or "Removed: …".
- **Each person** is a group named by `figure.familyTree.people.<row>` ("My mother’s mother"; a repeated one is numbered, "My brother or sister 2"): Diabetes? Yes / No / Not sure (pills); after a Yes only, Age when diagnosed (a short number box), Type of diabetes, as told (Type 1, Type 2, Gestational, Other / as told, which opens a box for what the family was told, Not sure) and Needed insulin within 2 years? (Yes / No / Not sure); and Hearing loss? (Yes / No / Not sure), **asked of everyone**, because hearing loss in a mother’s family is itself a MIDD clue, with or without diabetes (review correction). Anyone but "Me" has Remove. The column labels are the reviewed `columns.*` words.
- **Nothing saved or sent**: component state only, no storage, no request; "Nothing you type here is saved or sent." stays.
- **Print**: one portrait page, with the limit in the correction below (the named landscape page is gone: it turned whole 70-page runs sideways). The people added, grouped by side, with every answer in words, then three blank "Anyone else" rows; before anything is added or answered, the blank table of all 11 rows to fill in by hand. Header, sources and page address as every sheet.
- **No JavaScript**: the blank table, in a closed disclosure titled "Start my family tree".
- **Meta** (chapters-meta.ts): `repeatable`, `types` (`FamilyType`), `maxPeople`; `FamilyAnswer` for the three yes-or-no columns.
- **New words** (EN / FR), behind the `familyTree` gate and its draft marker: `figure.familyTree.people.1–11` "Me", "My brother or sister", "My child", "My mother", "My mother’s mother", "My mother’s father", "My mother’s brother or sister", "My father", "My father’s mother", "My father’s father", "My father’s brother or sister" / « Moi », « Mon frère ou ma sœur », « Mon enfant », « Ma mère », « La mère de ma mère », « Le père de ma mère », « Le frère ou la sœur de ma mère », « Mon père », « La mère de mon père », « Le père de mon père », « Le frère ou la sœur de mon père »; `answers` Yes / No / Not sure / « Oui », « Non », « Je ne sais pas »; `types` Type 1, Type 2, Gestational, Other / as told, Not sure / « Type 1 », « Type 2 », « Gestationnel », « Autre / tel qu’annoncé », « Je ne sais pas »; `ui.familyTree.start` "Start my family tree" / « Commencer mon arbre familial », `addHeading` "Add a family member" / « Ajouter un membre de la famille », `add` "Add: {person}" / « Ajouter : {person} », `added` "Added: {person}" / « Ajouté : {person} », `remove` "Remove" / « Retirer », `removeLabel` "Remove: {person}" / « Retirer : {person} », `removed` "Removed: {person}" / « Retiré : {person} », `full` "The tree holds {max} people. Add anyone else by hand on the printed copy." / « L’arbre peut contenir {max} personnes. Ajoutez les autres à la main sur la copie imprimée. », `anyoneElse` "Anyone else" / « Autre personne ». Changed: `ui.familyTree.clear` "Clear the table" → "Clear the tree" / « Effacer le tableau » → « Effacer l’arbre ».
- **For the nurse** (OPEN-QUESTIONS.md B56): the type list, the follow-ups after Yes, hearing loss for everyone, keeping "Needed insulin within 2 years?", one person per entry rather than one aggregated row per relation, and whether "Me" asks the same questions. Built as described until ruled.
- **Correction after verification (2026-10-07)**: with 16 to 20 people the sheet ran onto a second page (English from 18 on Letter, French from 16). A first fix (tighter rows from 13 people) was measured with brothers and sisters only, and its claim of one page at any size was wrong: with relatives on all three sides it still ran to two pages (French, Letter, 19 and 20 people), and with a type written in the "as told" box from 9 people (French, Letter). Second fix, after that verification (2026-10-07): the printed table has fixed columns (the type as told gets the most room, about a third of the width; a long name wraps instead of squeezing the answers into three lines), and the rows tighten (8.5pt type, writing lines 1.15rem, a smaller sources footer) once the answers reach 10 rows’ worth (`SHEET_COMPACT_FROM` in type-figures.tsx; a person counts once, a type written in counts twice). Below that nothing changes. Re-measured on the dev server (Chrome print path, the store’s current typeface; to be measured again once Poppins replaces it): every tree of 1 to 20 people prints on one portrait page, Letter and A4, English and French, on one side of the family or all three, answered with the one-tap choices, left mostly blank, or with a type written in for everyone that fits one line of its column (about 35 characters, such as "MODY, as the genetics clinic said"). **Limit:** a type written in at two lines’ length (about 70 characters) for nearly everyone still runs to a second page from 17 people (English, Letter), 20 (English, A4), 15 (French, Letter) and 18 (French, A4); the whole table stays on the first page, the sources and the page address go to the second, and no person is split. `maxPeople` stays 20; no words changed. Whether that is acceptable is OPEN-QUESTIONS B56. (The limits in this bullet are superseded by the next one.)
- **Second correction after verification (2026-10-07)**: verification found two faults in the printed sheet. (1) The age column (9% of the width) was narrower than its heading’s longest word at 9pt, so "diagnosed" / « diagnostic » ran into the type column on the normal sheet (and by 2px on the tightened one). (2) The "as told" box had no length limit, so the claims above held only for the lengths tested. Fixed: the printed columns are now the person 22%, Diabetes? 12.5%, Age when diagnosed 11.5%, Type of diabetes, as told 29%, Needed insulin 12.5%, Hearing loss 12.5% (type-figures.css), and a typed answer with no spaces breaks inside its own cell; the "as told" box takes at most 60 characters (`TOLD_MAX` in type-figures.tsx) and shows a count under it, new word `ui.familyTree.toldCount` "{count} of {max} characters" / « {count} sur {max} caractères » (behind the `familyTree` gate with the tree’s other words; machine-drafted French, B59); the rows tighten from 8 rows’ worth of answers instead of 10 (`SHEET_COMPACT_FROM`), because nine people answered with the one-tap choices ran past one Letter page in French once measured with "Je ne sais pas" in the yes-or-no columns. Measured on the dev server (Chrome print path, the store’s current typeface; relatives on all three sides; 1 to 20 people; Letter and A4; English and French): **no column heading overlaps another**, on the normal or the tightened sheet. **One-tap answers** (Yes, an age, a type chip, Not sure / « Je ne sais pas »): one portrait page at every size from 1 to 20 people. **A 60-character type written in for everyone** ("MODY type 3 (HNF1A), told by the genetics clinic at age 30, " / « MODY de type 3 (HNF1A), selon la clinique de génétique en 20 »): one page up to 16 people (English, Letter), 19 (English, A4), 14 (French, Letter) and 17 (French, A4); beyond that two pages, with the whole table on the first and only the sources and the page address on the second. **The worst case** (60 characters with no spaces for everyone): one page up to 11 people (English, Letter), 13 (English, A4), 10 (French, Letter) and 11 (French, A4); beyond that two pages; the "Anyone else" lines also move to the second page from 16, 17, 15 and 16 people respectively, and the last relatives from 17, 19, 16 and 18. **Never more than two pages**, and no person’s row is split across them. Whether that second page is acceptable stays OPEN-QUESTIONS B56. `maxPeople` stays 20.

### F.11 Owner note 6 applied: the chapter timeline, bookmarks and phones (2026-10-07)

The engine change is in new-to-the-journey.md F.11. Here: all 13 stops are reached and highlighted from the timeline in English and French (cards 7, 8, 11, 12 and 13 used to leave the previous one highlighted; the French cards are the tallest on the site), and a click on a section name in the timeline opens that section (it used to stay on the first). The landing page’s type chips link to cards here (`#card-N`); they now land on the card once the figures above it have built themselves. No copy changed.

### F.12 Owner notes 8 and 4 and the store’s typeface applied (2026-10-07)

The engine and font change is in new-to-the-journey.md F.12. Here: the first band’s title ("The common types") gets the same space above its callout, and the single-product cards (1, 2, 4, 7, 11, 12, 13) are horizontal cards. The page is in Poppins. Not yet re-measured on this page (see F.12). No copy changed.

### F.13 Owner review of 2026-10-07: final fix pass (fixed 2026-10-08)

Two meaning drifts from the note-1 rewrite (F.9), found by the clinical re-read of 2026-10-08. Sources and figures unchanged.

| # | Key | Was (after F.9) | Now (EN / FR) | Why |
|---|---|---|---|---|
| 1 | `categories.13.items.2` | "20 to 50% of people without diabetes who take steroids develop high blood sugar. …" | "In hospital, 20 to 50% of people without diabetes who take steroids develop high blood sugar. …" / « À l’hôpital, de 20 à 50 % des personnes non diabétiques qui prennent des stéroïdes … » | The figure is from the in-hospital guideline; "hospital" had gone with the guideline’s name, so it read as a figure for anyone on steroids. |
| 2 | `categories.8.items.2` | "About 9 in 10 people with MODY are first told they have another type" | "International estimates suggest about 9 in 10 people with MODY are first told they have another type" / « Selon des estimations internationales, environ 9 personnes sur 10 … » | A UK figure (`diabetes-uk-mody`) had lost its label and read as a general fact (Canadian first, international labelled). |
