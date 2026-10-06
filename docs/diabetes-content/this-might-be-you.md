# 06 · This Might Be You — chapter copy, after source check (DiabetesCare.chapters.this-might-be-you)

Version of 2026-10-05. It applies the source check in `content/this-might-be-you.verify.md` to `content/this-might-be-you.draft.md`. Not compiled, not in the repo. The shape follows the `staying-safe` entry in `diabetes-care/chapters/chapters-meta.ts` and its messages at `DiabetesCare.chapters.staying-safe`; the voice follows `OstomyCare.chapters.this-might-be-you`.

Ground rules applied:
- **SourceIds come only from `diabetes-care/chapters/sources-meta.ts`** (167 ids). No new id is used in the copy. Two pages the check asked to register (the ISC "Who is eligible for NIHB" page, and a Manitoba paediatric pump page) are not in the register, so the facts that need them are **HELD** (section E), not cited.
- Every "Not confirmed" or "Partly" row in the check has been reworded, re-cited or HELD, and every safety and scope finding (S1–S5, C1) is applied or recorded as a ruling. Section F lists each change. Every former **C-f** row was re-read on the page by the check and is now **C**.
- **No product names in the copy. Since 2026-10-06 (B21) cards 2 to 4 carry shop strips (`chapter-shop.ts`; F.7).** No brand names in the copy. NIHB's device list is summarised as "several continuous glucose monitors (CGMs)".
- **No Diabetes Express mentions or links.**
- **No dosing, titration or treatment decisions; no drug classes.** Folic acid amount, pregnancy glucose targets, the postpartum insulin cut and Ch 37's drug lines stay out (M2, M3, M6, M8). A1C targets are the guideline's numbers with "Your team sets yours".
- **Nothing from FAIL sources** (Hart 2016; ADA 2026 summary of revisions). Nothing from the FIT guide (industry-run, R9). No international source, so no "International guidance" label.
- **No red-flag block.** The chapter's urgent exit is the `staying-safe#red-flags` signpost. Three cards carry emergency, same-day or crisis lines and are `urgentContent`: 1 (DKA), 3 (severe low at school, new after the check) and 5 (9-8-8).
- **The First Nations, Inuit and Métis card needs review by an Indigenous health partner before publishing** (open ruling M10). Its wording is kept to coverage facts and the guideline's own words on care. M11 (NIHB exceptions) is still a blocker for publishing card 6.
- **Clinician-level sources flagged:** cards 1 (CPG Ch 36, 2018) and 4 (CPG Ch 37) rest on chapters written for health professionals, and say so in their notes.

---

## A) META OUTLINE

### A.1 SourceIds used (all exist in `sources-meta.ts`)

| Card | SourceIds |
|---|---|
| 1 Pregnancy with type 1 or type 2 | `dc-cpg-ch36-pregnancy`, `dc-cpg-ch9-monitoring-2021`, `cos-diabetic-retinopathy`, `dc-cpg-ch15-hyperglycemic-emergencies`, `bt1d-dka-and-ketones`, `dc-gestational-diabetes` (note's pointer only) |
| 2 A child with type 1 | `dc-cpg-ch41-t1d-lifespan-2025`, `bt1d-dka-and-ketones`, `dc-cpg-ch18-mental-health-2023`, `cra-dtc-life-sustaining-therapy`, `cra-rc4064-2025`, `esdc-rdsp-apply`, `qc-insulin-pump-access-program`, `sk-insulin-pump-program` |
| 3 Your child at school | `dc-kids-in-school`, `cps-t1d-in-school-2015`, `das-low-blood-sugar`, `das-glucagon`, `dc-cpg-ch41-t1d-lifespan-2025`, `dc-comparisons-by-province` |
| 4 Later life | `dc-cpg-ch37-older-people`, `dc-cpg-ch8-targets`, `on-diabetes-equipment-and-supplies` |
| 5 Caring for someone with diabetes | `dc-cpg-ch14-hypoglycemia-2023`, `bt1d-mental-health-support`, `dc-taking-care-of-mental-health`, `dc-cpg-ch18-mental-health-2023`, `988-suicide-crisis-helpline` (crisis strip) |
| 6 First Nations, Inuit and Métis | `isc-nihb-updates`, `dc-cpg-ch38-indigenous` |
| Band | `dc-cpg-ch36-pregnancy`, `cps-t1d-in-school-2015`, `dc-kids-in-school`, `dc-cpg-ch37-older-people`, `bt1d-mental-health-support` |

Removed after the check: `mb-shared-health-diabetes-care` (card 2; the page has no paediatric pump program), `on-adp-insulin-pumps` (card 4; resolves to a near-identical page to `on-diabetes-equipment-and-supplies`, which carries the $170 passage).

Not cited, on purpose: `dc-cpg-ch34-t1d-children` (its locator covers one monogenic sentence only), `dc-cpg-ch35-t2d-children` (type questions belong in Ch05), `dc-cpg-ch30-retinopathy` (children under 15 are referred to Ch 34; see E), `bt1d-facts-and-figures` (Ch05's), `fit-canada-pocket-guide-4th-ed` (R9).

**Register bookkeeping for the build (repo files, not edited here):**
- `sources-review.ts`: add the passages the check re-read to the locators of `dc-cpg-ch36-pregnancy`, `dc-cpg-ch37-older-people`, `dc-cpg-ch38-indigenous`, `dc-kids-in-school`, `isc-nihb-updates` (client eligibility, including children under 2), `bt1d-mental-health-support` (caregiver guide audience, directory wording) and `dc-cpg-ch41-t1d-lifespan-2025` (insulin at school and daycare).
- `sources-review.ts`: clear `UNCHECKED_TITLE` on `cra-dtc-life-sustaining-therapy` (page title "Life-sustaining therapy", modified 2023-01-24). Correct the `mb-shared-health-diabetes-care` locator: the page describes adult (18+) pump coverage only, no paediatric program.
- `sources-meta.ts`: `on-adp-insulin-pumps` resolves to a page titled "Diabetes equipment and supplies"; fix its label or retire it.
- To release held items: register the ISC "Who is eligible for NIHB" page (https://www.sac-isc.gc.ca/eng/1574187596083/1576511384063, modified 2026-05-28) and, if wanted, a Manitoba paediatric pump page.

### A.2 New message keys outside the chapter (add with the chapter)

- `DiabetesCare.ui.chapter.groups.seasonsOfLife`: "Seasons of life"
- `DiabetesCare.ui.chapter.groups.careAndCommunity`: "Care and community"
- No new ask role. Every card uses an existing role (`team`, `peer`, `pharmacist`). See M14.
- No new glyph.
- `review-gates.ts`: a `chapter:this-might-be-you` French gate (required for any slug in CHAPTER_META). Cards 1, 3 and 5 carry emergency or crisis lines, so their figures can't be gated.

### A.3 Proposed CHAPTER_META entry

```ts
  /*
   * 06 · This Might Be You. Copy: DiabetesCare.chapters.this-might-be-you,
   * after the source check of 2026-10-05. Clinical defaults (R1–R10, M1–M16)
   * are open with the nurse and are recorded in the content review, not
   * settled here. Card 6 waits on review by an Indigenous health partner
   * before it is published (M10), and on the NIHB eligibility page being
   * registered (M11). Shop strips on cards 2 to 4 since 2026-10-06 (B21; F.7).
   */
  {
    slug: 'this-might-be-you',
    num: '06',
    chapterWord: 'six',
    heroImage: `${IMG}/chapter-gestational.png`,
    // Placeholder; the owner picks the accent with the image set.
    accent: '#cdbfdc',
    rail: false,
    majorSections: true,
    /* Exactly two segments: seasons of life, and care and community. */
    startHere: { groups: ['seasonsOfLife', 'careAndCommunity'] },
    /*
     * No red flags of its own. Cards 1, 2, 3 and 5 are read by someone who may
     * meet a low, a high or DKA (a pregnant reader, a parent, school staff, a
     * carer), so the chapter points at Staying Safe's list.
     */
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Seasons of life ---------- */
      {
        // 1 Pregnancy with type 1 or type 2. Rests on CPG Ch36 (2018,
        // clinician-level, flagged in the note). Pinned open: "DKA needs
        // medical care right away" (s2 item 4).
        image: `${IMG}/chapter-gestational.png`,
        group: 'seasonsOfLife',
        ask: 'team',
        urgentContent: true,
        // The printable preconception plan: five blank lines, filled in with
        // the team. No amounts are pre-printed (M2, M3).
        figures: [{ kind: 'takeIn', fields: 5 }],
        sources: [
          'dc-cpg-ch36-pregnancy',
          'dc-cpg-ch9-monitoring-2021',
          'cos-diabetic-retinopathy',
          'dc-cpg-ch15-hyperglycemic-emergencies',
          'bt1d-dka-and-ketones',
          'dc-gestational-diabetes',
        ],
      },
      {
        // 2 A child with type 1. Items 2 and 4 send the reader to Staying
        // Safe's Rule of 15 and ketone ladder by title; the amounts live there.
        image: `${IMG}/chapter-type1.png`,
        group: 'seasonsOfLife',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3, 4],
              [5],
              [6, 7, 8],
            ],
          },
        ],
        sources: [
          'dc-cpg-ch41-t1d-lifespan-2025',
          'bt1d-dka-and-ketones',
          'dc-cpg-ch18-mental-health-2023',
          'cra-dtc-life-sustaining-therapy',
          'cra-rc4064-2025',
          'esdc-rdsp-apply',
          'qc-insulin-pump-access-program',
          'sk-insulin-pump-program',
        ],
      },
      {
        // 3 Your child at school. The printable care-plan card: the items,
        // then six blank lines the family fills in with the school. Pinned
        // open: item 7 is the severe-low emergency step (call 911, stay, nothing
        // by mouth), from Diabetes@School and the CPS statement.
        image: `${IMG}/chapter-new.png`,
        group: 'seasonsOfLife',
        ask: 'team',
        urgentContent: true,
        figures: [{ kind: 'takeIn', fields: 6 }],
        sources: [
          'dc-kids-in-school',
          'cps-t1d-in-school-2015',
          'das-low-blood-sugar',
          'das-glucagon',
          'dc-cpg-ch41-t1d-lifespan-2025',
          'dc-comparisons-by-province',
        ],
      },
      {
        // 4 Later life. Rests on CPG Ch37 (clinician-level, flagged in the
        // note). How targets are set first, then two columns, then the
        // Ontario line beneath. The FIT lines (4 mm needles, dexterity) are
        // HELD (R9).
        image: `${IMG}/chapter-type2.png`,
        group: 'seasonsOfLife',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [2, 3, 4],
              [5, 6],
            ],
            lead: [1],
            neutral: [7],
          },
        ],
        sources: [
          'dc-cpg-ch37-older-people',
          'dc-cpg-ch8-targets',
          'on-diabetes-equipment-and-supplies',
        ],
      },

      /* ---------- Care and community ---------- */
      {
        // 5 Caring for someone with diabetes. Carries the 9-8-8 strip, so it
        // is pinned open (M13). The strip's words are ui.chapter.crisis.
        image: `${IMG}/care-chat-main.png`,
        group: 'careAndCommunity',
        ask: 'peer',
        urgentContent: true,
        noteVisible: true,
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6],
            ],
          },
          { kind: 'crisis', numbers: [{ tel: '988', sms: true }] },
        ],
        sources: [
          'dc-cpg-ch14-hypoglycemia-2023',
          'bt1d-mental-health-support',
          'dc-taking-care-of-mental-health',
          'dc-cpg-ch18-mental-health-2023',
          '988-suicide-crisis-helpline',
        ],
      },
      {
        // 6 First Nations, Inuit and Métis. Coverage first (NIHB), then the
        // guideline's own words on care. OPEN RULING M10: needs review by an
        // Indigenous health partner before publishing. M11: the NIHB
        // exceptions (FNHA in BC, Nunavik, James Bay Cree, Nunatsiavut and
        // others) are HELD until the ISC eligibility page is registered; item
        // 4 sends every reader to their pharmacist or band office meanwhile.
        image: `${IMG}/chapter-journey.png`,
        group: 'careAndCommunity',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3, 4, 5],
              [6, 7, 8],
            ],
          },
        ],
        sources: ['isc-nihb-updates', 'dc-cpg-ch38-indigenous'],
      },
    ],
    /* Band "Who to bring in": four cards, no outward links. */
    programsBandLinks: [[], [], [], []],
    /*
     * Each band card names a chapter card in its last sentence; that title
     * links to it: pregnancy (1), school (3), later life (4), carers (5).
     */
    programsBandCards: [1, 3, 4, 5],
    bandSources: [
      'dc-cpg-ch36-pregnancy',
      'cps-t1d-in-school-2015',
      'dc-kids-in-school',
      'dc-cpg-ch37-older-people',
      'bt1d-mental-health-support',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: PHARMACIST_CDE_REQUEST_HREF,
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'Diabetes Canada — Diabetes and Pregnancy',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-36',
      },
      {
        label:
          'Diabetes Canada — Glycemic Management Across the Lifespan for People With Type 1 Diabetes',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-41',
      },
      {
        label: 'Diabetes Canada — Kids with Diabetes in School',
        href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/kids-with-diabetes-in-school',
      },
      {
        label: 'Canadian Paediatric Society — Managing type 1 diabetes in school (CPS position statement, 2015)',
        href: 'https://cps.ca/en/documents/position/type-1-diabetes-in-school',
      },
      {
        label: 'Diabetes@School — Glucagon: What it is and how to use it',
        href: 'https://diabetesatschool.ca/understanding/glucagon',
      },
      {
        label: 'Diabetes Canada — Diabetes in Older People',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-37',
      },
      {
        label: 'Breakthrough T1D — Mental Health Support',
        href: 'https://breakthrought1d.ca/mental-health-support/',
      },
      {
        label: 'Indigenous Services Canada — Non-Insured Health Benefits program updates',
        href: 'https://www.sac-isc.gc.ca/eng/1578079214611/1578079236012',
      },
      {
        label: 'Diabetes Canada — Type 2 Diabetes and Indigenous Peoples',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-38',
      },
      {
        label: '9-8-8: Suicide Crisis Helpline',
        href: 'https://988.ca/',
      },
    ],
  },
```

Engine notes:
- `startHere` has exactly two groups. Segment 1 = cards 1–4, segment 2 = cards 5–6.
- `takeIn` with `fields` on a card with `sections` (card 1) follows Staying Safe card 8, the only precedent. Check it renders the three section lists in order on the printed card. Card 3's `takeIn` now has 6 fields (field 6 "Who calls 911", from the check).
- Card 3 is now `urgentContent: true`, so under `review-gates.ts` its figure can't be gated: the French gate must hold the whole chapter, not this card's figure.
- Card 5 has two figures: `columns` (restyles) then `crisis` (augments, ungateable). The Diabetes engine type needs `numbers` (`CrisisLine[]`).
- Card text that names another chapter's card ("The Rule of 15", "Ketones: check and act", "Staying Safe", "Know Your Type", "Funding & Coverage") is plain text. The engine has no in-card cross-chapter link. A `doors` figure would restyle every item into a door, so it is not used (same reasoning as Staying Safe card 6).

---

## B) EN MESSAGES — `DiabetesCare.chapters.this-might-be-you`

Validated with `node` after the check (parses; no "!" and no "always"/"never"). Same key shape as `staying-safe`, without `urgent` (no red-flag block) and with `urgentExit`.

```json
{
  "title": "This Might Be You",
  "heroBody": "Pregnancy with type 1 or 2, a child with type 1, school and later life, and the people who help: what changes, and who to ask.",
  "focus": "Seasons of life: pregnancy with type 1 or type 2, a child with type 1, school, and later life. Care and community: caring for someone with diabetes, and coverage and care for First Nations, Inuit and Métis people.",
  "vibe": "Specific and quick to refer: short on advice, clear on who to ask.",
  "categoriesIntro": {
    "eyebrow": "Not everyone the same",
    "heading": "When the usual advice isn’t enough",
    "body": "Most diabetes information is written for an adult managing on their own. These are the times when the details change, and the best next step is usually a conversation with a particular person."
  },
  "startHere": {
    "heading": "A season of life, or someone you care for?",
    "pivot": "Who it’s about",
    "segments": {
      "1": {
        "label": "Seasons of life"
      },
      "2": {
        "label": "Care and community"
      }
    }
  },
  "categories": {
    "1": {
      "title": "Pregnancy with type 1 or type 2",
      "sections": {
        "1": {
          "heading": "Before you try",
          "items": {
            "1": "Diabetes Canada’s guideline recommends planning a pregnancy with your diabetes team before you start trying",
            "2": "Its A1C target before conception is 7.0% or lower, and 6.5% or lower if it can be done safely. Your team sets yours",
            "3": "It recommends starting folic acid before you conceive. Ask your team or pharmacist how much to take",
            "4": "Bring a list of all your medicines, so your team can review them before you try. Some medicines need to be stopped or changed before pregnancy. Don’t stop any on your own",
            "5": "The guideline recommends an eye exam and a kidney check before you conceive"
          }
        },
        "2": {
          "heading": "While you’re pregnant",
          "items": {
            "1": "Blood sugar targets are tighter in pregnancy. Your team will give you yours",
            "2": "With type 1, Diabetes Canada’s guideline recommends a continuous glucose monitor (CGM) in pregnancy. With type 2, ask your team whether one suits you",
            "3": "The guideline recommends another eye exam in the first trimester",
            "4": "In pregnancy, diabetic ketoacidosis (DKA) can happen even when blood sugar is normal or only a little high. DKA needs medical care right away"
          }
        },
        "3": {
          "heading": "After the birth",
          "items": {
            "1": "If you use insulin, your needs drop quickly after the birth. Plan the change with your team before you deliver. Lows are more likely in the first days, so check more often",
            "2": "The guideline encourages breastfeeding",
            "3": "It also recommends an eye exam within the first year after the birth"
          }
        }
      },
      "note": "Gestational diabetes, which starts in pregnancy, is in Know Your Type. This card draws on Diabetes Canada’s guideline for health professionals.",
      "figure": {
        "heading": "Before we try: my plan",
        "fields": {
          "1": "My A1C goal before trying",
          "2": "Folic acid: how much, and when to start",
          "3": "My medicines: what stays the same, and what changes",
          "4": "Eye and kidney checks booked for",
          "5": "Who to call while I’m pregnant"
        }
      }
    },
    "2": {
      "title": "A child with type 1",
      "items": {
        "1": "Diabetes Canada’s 2025 type 1 guideline sets the same A1C target for children of every age: below 7.0%. Your child’s team sets theirs",
        "2": "Younger children take less fast-acting sugar for a low, depending on their age. The amounts are in The Rule of 15",
        "3": "From age 4, glucagon can be a nasal spray or an injection. For a child under 4, ask your child’s team which glucagon to keep",
        "4": "Check for ketones when your child is sick or their blood sugar stays high. The ranges are in Ketones: check and act",
        "5": "The guideline says regular check-ins on emotional health are especially helpful in the teen years and young adulthood",
        "6": "Type 1 diabetes meets the Disability Tax Credit’s life-sustaining therapy test for 2021 and later tax years. You still apply with form T2201, on paper or online, and your child’s doctor or nurse practitioner fills in their part",
        "7": "Once a child is approved for the credit, a Registered Disability Savings Plan (RDSP) can be opened for them",
        "8": "Some provincial pump programs have separate rules for children. In Quebec, a child has to join the pump program before age 18"
      },
      "note": "Your child’s diabetes clinic is the first call for anything about their plan. Programs by province are in Funding & Coverage.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Day to day"
          },
          "2": {
            "heading": "Growing up"
          },
          "3": {
            "heading": "Money and coverage"
          }
        }
      }
    },
    "3": {
      "title": "Your child at school",
      "items": {
        "1": "Diabetes Canada says a student’s care plan has two parts: a daily diabetes management plan and a diabetes emergency plan",
        "2": "Diabetes Canada says the principal should work with you, your child and your child’s health care team to write the plan",
        "3": "The Canadian Paediatric Society recommends talking it through before the school year starts, and having at least two staff trained",
        "4": "Diabetes Canada says students should be able to check their blood sugar, take insulin, and treat lows and highs wherever and whenever they need to",
        "5": "Diabetes Canada says schools should let students carry a phone or smartwatch to help manage their blood sugar",
        "6": "Diabetes@School says lows at school are common for students with type 1. They’re no cause for alarm, but they need treating right away, where they happen",
        "7": "Don’t leave a student alone if a low is suspected. If they’re unresponsive, have a seizure or can’t take sugar by mouth, it’s an emergency: have someone call 911, stay with them, and put nothing in their mouth",
        "8": "Then, if the care plan includes consent for glucagon, staff named in the plan, and trained, give it",
        "9": "Diabetes Canada’s 2025 type 1 guideline calls for help with giving insulin at school and daycare across Canada"
      },
      "note": "School rules differ by province and territory, and Diabetes Canada compares them. Diabetes@School, from the Canadian Paediatric Society and its partners, has more for families and school staff.",
      "figure": {
        "heading": "Our school care plan",
        "fields": {
          "1": "Who at school is trained (at least two people)",
          "2": "Where the low supplies are kept",
          "3": "Glucagon: is it in the plan, and who gives it",
          "4": "How my child checks their blood sugar at school",
          "5": "Who the school calls first, and the backup number",
          "6": "Who calls 911 for a severe low"
        }
      }
    },
    "4": {
      "title": "Later life",
      "items": {
        "1": "Diabetes Canada’s guideline for older people sets targets by how healthy and independent someone is",
        "2": "For people who are healthy and independent, the A1C target is 7.0% or lower",
        "3": "For people who are frail or living with dementia, and take medicine that can cause lows, the guideline says a less strict A1C target of 7.1 to 8.5% may be considered. Your team sets yours",
        "4": "The guideline puts a strong focus on preventing lows in older people",
        "5": "If injecting is getting harder, ask your team about simpler options. The guideline names prefilled insulin pens as one way to cut down on dose mistakes",
        "6": "Changes in memory or thinking can make a new skill, like injecting, harder to learn. Tell your team, so they can plan around it",
        "7": "In Ontario, people 65 and older who use insulin every day and live at home can apply to the Assistive Devices Program for $170 a year toward syringes and needles"
      },
      "note": "Ask a pharmacist to go through your full list of medicines, including anything you buy without a prescription. More programs for seniors are in Funding & Coverage. This card draws on Diabetes Canada’s guideline for health professionals.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Targets"
          },
          "2": {
            "heading": "Making it easier"
          }
        }
      }
    },
    "5": {
      "title": "Caring for someone with diabetes",
      "items": {
        "1": "The most useful things to learn are what a low and a high look like, the Rule of 15, and when to call for help. They’re all in Staying Safe",
        "2": "If they have glucagon, ask to be shown how it works. Diabetes Canada’s guideline says the people around them should be taught",
        "3": "Ask what kind of help is wanted before you offer it",
        "4": "Breakthrough T1D has a caregiver guide for parents and caregivers of children and teens with type 1",
        "5": "Its Mental Health + Diabetes Directory lists registered mental health providers, for people living with diabetes and the people affected by it",
        "6": "Low mood and worry about lows are common with diabetes, and Diabetes Canada’s guideline asks teams to check for them"
      },
      "note": "If caring is wearing you down, tell your own doctor. Diabetes Canada’s guideline says parents and caregivers of young people with diabetes should be checked for diabetes distress too.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Helping well"
          },
          "2": {
            "heading": "Support for you"
          }
        }
      }
    },
    "6": {
      "title": "First Nations, Inuit and Métis",
      "items": {
        "1": "The federal Non-Insured Health Benefits (NIHB) program covers people living in Canada who are First Nations and registered under the Indian Act, or Inuit recognized by an Inuit land claim organization. It also covers their children under 2",
        "2": "For people who manage diabetes with insulin, NIHB covers several continuous glucose monitors (CGMs), with prior approval",
        "3": "It also covers up to 800 test strips every 100 days for people who use insulin",
        "4": "Ask your pharmacist, band office or land claim organization which plan covers you, and what needs prior approval, before you order",
        "5": "If you aren’t covered by NIHB, Funding & Coverage lists the programs in each province and territory",
        "6": "Diabetes Canada’s guideline says diabetes care should take account of each person’s social, cultural and historical context, and support their choices about cultural resources",
        "7": "In remote communities, the guideline supports eye screening with retinal photographs. Where a lab isn’t available, it says on-the-spot A1C tests may be considered for diabetes screening",
        "8": "For adults without diabetes who have other risk factors, it suggests considering a diabetes check every 6 to 12 months"
      },
      "note": "NIHB adds items to its list from time to time. Your pharmacist can check what’s covered today.",
      "figure": {
        "columns": {
          "1": {
            "heading": "Coverage"
          },
          "2": {
            "heading": "Care that fits you"
          }
        }
      }
    }
  },
  "programsBand": {
    "heading": "Who to bring in",
    "cards": {
      "1": {
        "heading": "Planning a pregnancy",
        "body": "Your diabetes team, before you start trying, to go over your A1C, your medicines, and your eyes and kidneys. More in Pregnancy with type 1 or type 2."
      },
      "2": {
        "heading": "A child starting school",
        "body": "The principal, with you, your child and their diabetes team, before the school year starts. More in Your child at school."
      },
      "3": {
        "heading": "Later life",
        "body": "Your diabetes team, for targets that fit your health, and a pharmacist, for your full list of medicines. More in Later life."
      },
      "4": {
        "heading": "Someone you care for",
        "body": "Staying Safe for the basics, and Breakthrough T1D’s caregiver guide if it’s a child or teen with type 1. More in Caring for someone with diabetes."
      }
    }
  },
  "pharmacist": {
    "eyebrow": "Anywhere in Canada",
    "heading": "Supply questions, whoever you’re shopping for",
    "body": "Liivv’s pharmacist CDEs answer pump and CGM supply questions for all of Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. Questions about a pregnancy, a child’s plan or a change in someone’s health belong with their diabetes team.",
    "cta": "Request a call"
  },
  "closing": {
    "heading": "The same diabetes, a different season",
    "body": "What changes is who to bring in, and when. Knowing that is most of the work."
  },
  "governance": {
    "disclaimer": "This is general information, not medical advice. Care in pregnancy, for children and in later life differs in ways this page doesn’t try to cover. It tells you what changes and who to ask. Your diabetes team sets your targets and your plan."
  },
  "urgentExit": {
    "lead": "Signs that need emergency care are in Staying Safe, under",
    "link": "Get emergency care now"
  }
}
```

---

## C) CLAIMS TABLE (after source check)

Key paths are relative to `DiabetesCare.chapters.this-might-be-you`. "Check" gives the result in `this-might-be-you.verify.md` after this revision: **C** = confirmed on the page as now worded; **C\*** = accepted as more conservative than the source (recorded as a ruling); **Adv** = an action line with no factual claim; **Nav** = points to another card or page, no new fact; **Owner** = owner-supplied.

| Key | Sentence (short) | SourceId | Fact on the source page | Check |
|---|---|---|---|---|
| heroBody, focus, vibe, categoriesIntro, startHere, closing, governance | Framing | — | No clinical claim | — |
| 1.s1.1 | Guideline recommends planning with your team before trying | dc-cpg-ch36-pregnancy | "All women with pre-existing type 1 or type 2 diabetes should receive preconception care…" | C |
| 1.s1.2 | A1C before conception ≤7.0%, ≤6.5% if it can be done safely; team sets yours | dc-cpg-ch36-pregnancy | Recommendation: "(or A1C ≤6.5% if can safely be achieved)" | C (M4) |
| 1.s1.3 | Start folic acid before conceiving; ask how much | dc-cpg-ch36-pregnancy | 1 mg from at least 3 months before conception to 12 weeks | C\* (M2: amount left out) |
| 1.s1.4 | Bring your medicine list; some medicines need stopping or changing; don't stop any on your own | dc-cpg-ch36-pregnancy | "review medications"; preconception care includes "discontinuing potentially harmful medications" | C / Adv |
| 1.s1.5 | Eye exam and kidney check before conceiving | dc-cpg-ch36-pregnancy | Ophthalmological evaluation "during pregnancy planning"; "Prior to conception, women should be screened for chronic kidney disease (CKD)" | C |
| 1.s2.1 | Targets tighter in pregnancy; team gives yours | dc-cpg-ch36-pregnancy | Fasting <5.3, 1 h <7.8, 2 h <6.7; A1C ≤6.5% | C\* (M3: numbers left out) |
| 1.s2.2 | Type 1: guideline recommends CGM in pregnancy; type 2: ask your team | dc-cpg-ch36-pregnancy; dc-cpg-ch9-monitoring-2021 | Ch 9 (2021, Grade A) and Ch 36 recommendation: "In pregnant women with type 1 diabetes, rtCGM should be used"; Ch 9 recommends CBG testing for type 2 in pregnancy | C (M5) |
| 1.s2.3 | Eye exam in the first trimester | dc-cpg-ch36-pregnancy; cos-diabetic-retinopathy | Ch 36 recommendation; COS: "schedule an appointment in their first trimester" | C |
| 1.s2.4 | DKA in pregnancy even with normal or mildly high sugar; needs care right away | dc-cpg-ch15-hyperglycemic-emergencies; bt1d-dka-and-ketones | Ch 15: "A normal or mildly elevated blood glucose level does not rule out diabetic ketoacidosis in certain conditions, such as pregnancy"; Breakthrough: "It requires immediate medical attention" | C |
| 1.s3.1 | On insulin, needs drop quickly after birth; plan before delivery; lows more likely, check more often | dc-cpg-ch36-pregnancy | "rapid decrease in insulin needs and risk of hypoglycemia in the immediate postpartum period"; "frequent blood glucose monitoring in the first days postpartum" | C, C\* (M6: no percentage) |
| 1.s3.2 | The guideline encourages breastfeeding | dc-cpg-ch36-pregnancy | "Breastfeeding should be encouraged… for a minimum of 4 months" | C |
| 1.s3.3 | Eye exam within the first year after birth | dc-cpg-ch36-pregnancy | "within the first year postpartum" | C |
| 1.note s1 | Gestational diabetes is in Know Your Type | dc-gestational-diabetes | GDM starts in pregnancy (Ch05 card 4) | Nav |
| 1.note s2 | Draws on a guideline for health professionals | dc-cpg-ch36-pregnancy | Still the 2018 chapter; Ch 41 says pregnancy recommendations "are being updated separately"; no newer chapter found 2026-10-05 | C (M1) |
| 1.figure | Five blank lines | — | Write-in labels, no facts | — |
| 2.items.1 | 2025 guideline: A1C below 7.0% for children of every age; team sets theirs | dc-cpg-ch41-t1d-lifespan-2025 | "the new recommended A1C target for the pediatric population is <7.0% across all age groups" | C |
| 2.items.2 | Younger children take less fast sugar for a low, by age; amounts in The Rule of 15 | dc-cpg-ch41-t1d-lifespan-2025 | Table 3: under 5 → 5 g, 5–10 → 10 g, over 10 → 15 g; less for every age on AID | C / Nav (R8) |
| 2.items.3 | From age 4, nasal or injection; under 4 ask the team | dc-cpg-ch41-t1d-lifespan-2025 | "Age ≥4 years: Intranasal or injectable glucagon"; under 4 injectable, nasal "if injectable glucagon is not available" | C |
| 2.items.4 | Check ketones when sick or high; ranges in Ketones: check and act | bt1d-dka-and-ketones | "checking for ketones if a person with T1D is ill… monitor ketones when blood glucose is above target" | C / Nav (R3) |
| 2.items.5 | Regular check-ins on emotional health especially helpful in teens and young adulthood | dc-cpg-ch18-mental-health-2023 | "Regular assessments during routine diabetes care are especially helpful during adolescence and the transition to young adulthood" | C |
| 2.items.6 | Type 1 meets DTC life-sustaining therapy test for 2021+; still apply with T2201, paper or online; doctor or NP fills in their part | cra-dtc-life-sustaining-therapy; cra-rc4064-2025 | CRA: "People with Type 1 diabetes meet the eligibility criteria under life-sustaining therapy… for 2021 and later years"; RC4064 "deemed to meet"; T2201 Part B certified by a medical practitioner; Part A "online or by phone" | C |
| 2.items.7 | Once approved for the credit, an RDSP can be opened | esdc-rdsp-apply | "be approved for the Disability Tax Credit (DTC)", plus a SIN and residence; a parent or legal representative holds a minor's plan | C |
| 2.items.8 | Some pump programs have child rules; Quebec: join before 18 | qc-insulin-pump-access-program; sk-insulin-pump-program | QC: "individuals must be under 18 years of age", may continue after 18; SK: separate Pediatric Insulin Pump Program application | C (MB dropped; MB paediatric HELD) |
| 2.note | Child's clinic first; Funding & Coverage | — | — | Adv / Nav |
| 3.items.1 | Care plan has two parts | dc-kids-in-school | "Each ICP should be comprised of a daily diabetes management plan and a diabetes emergency plan" | C |
| 3.items.2 | DC: principal should work with family, child and team to write the plan | dc-kids-in-school | "School principals should work with each student…, their parents/guardians and healthcare professionals to develop and communicate… an Individual Care Plan" | C |
| 3.items.3 | CPS: talk it through before the school year; at least two staff trained | cps-t1d-in-school-2015 | "Discussions should occur before the start of the school year"; "at least 2 school personnel are trained" | C (M9: currency) |
| 3.items.4 | DC: students should be able to check, take insulin, treat wherever and whenever | dc-kids-in-school | "Schools should permit students… to monitor their blood glucose…, administer insulin and treat low… and high blood glucose… wherever and whenever required" | C |
| 3.items.5 | DC: schools should let students carry a phone or smartwatch | dc-kids-in-school | "Schools should permit…" the use of "cell phones and/ smartwatches as a tool to help manage their blood glucose" | C |
| 3.items.6 | Lows at school common with type 1; no cause for alarm; treat right away, where they happen | das-low-blood-sugar | "All students with type 1 diabetes will have low blood sugar at school… A low blood sugar reading is not cause for alarm but it must be treated without delay"; "Treat the low blood sugar WHERE IT OCCURS" | C (R1: no threshold shown) |
| 3.items.7 | Don't leave a student alone with a suspected low; unresponsive, seizure or can't take sugar by mouth = emergency; call 911, stay, nothing in their mouth | das-low-blood-sugar; das-glucagon; cps-t1d-in-school-2015 | DAS: "DO NOT leave a student alone if you suspect low blood sugar"; severe low: "Being unresponsive or unconscious", "Having a seizure", "so uncooperative that you can’t give juice or sugar by mouth"; "Have someone call 911"; "Stay with the student until ambulance arrives. Do not put anything in their mouth"; CPS: "a student must not be left alone when hypoglycemia is suspected. In the event of severe hypoglycemia, school personnel should call 911" | C (new, Safety S1) |
| 3.items.8 | Then glucagon by trained, named staff when the plan includes consent | das-glucagon | "If there is a signed consent and mutual agreement… give it now. Staff identified in the care plan to give glucagon will have been trained"; "911 should be called even before giving glucagon" | C |
| 3.items.9 | 2025 guideline calls for help giving insulin at school and daycare | dc-cpg-ch41-t1d-lifespan-2025 | "we strongly advocate for facilitation of insulin administration in schools and daycares throughout Canada" | C |
| 3.note s1 | School rules differ; DC compares them | dc-comparisons-by-province | List includes "Kids in school with diabetes" (EN PDF dated 2026) | C |
| 3.note s2 | Diabetes@School is from the CPS and partners | das-low-blood-sugar | Footer © 2026 Canadian Paediatric Society; CPEG and Diabetes Canada as partners | C |
| 3.figure | Six blank lines | cps-t1d-in-school-2015; das-glucagon | Labels echo items 3, 7, 8 ("at least two"; "Who calls 911") | — |
| 4.items.1 | Targets set by health and independence | dc-cpg-ch37-older-people | Table: functionally independent, functionally dependent, frail and/or dementia, end of life | C |
| 4.items.2 | Healthy and independent: A1C ≤7.0% | dc-cpg-ch37-older-people; dc-cpg-ch8-targets | "Functionally independent: ≤ 7.0%" | C (M7) |
| 4.items.3 | Frail or dementia, on medicine that can cause lows: 7.1–8.5% may be considered; team sets yours | dc-cpg-ch37-older-people; dc-cpg-ch8-targets | "A higher A1C target may be considered in older people with diabetes taking antihyperglycemic agent(s) with risk of hypoglycemia"; Ch 8: "Frail elderly and/or with dementia: 7.1%–8.5%" | C (M7) |
| 4.items.4 | Strong focus on preventing lows | dc-cpg-ch37-older-people | "strategies should be used to strictly prevent hypoglycemia" | C |
| 4.items.5 | Ask about simpler options; guideline names prefilled pens to cut dose mistakes | dc-cpg-ch37-older-people | "premixed insulins and prefilled insulin pens should be used to reduce dosing errors" | C, C\* (M8) |
| 4.items.6 | Memory or thinking changes can make injecting harder to learn; tell your team | dc-cpg-ch37-older-people | "The clock drawing test may be used to predict which older individuals will have difficulty learning to inject insulin" | C |
| 4.items.7 | Ontario: 65+, daily insulin, living at home, can apply to ADP for $170 a year | on-diabetes-equipment-and-supplies | "If you are a senior (65+ years) who needs insulin every day and lives at home, you can apply for $170 annually to help pay for syringes and needles" | C |
| 4.note s1 | Ask a pharmacist to review your full list | — | — | Adv |
| 4.note s2–3 | Funding & Coverage; clinician-level guideline | dc-cpg-ch37-older-people | No patient page covers older adults (survey) | Nav / C (M1) |
| 5.items.1 | Learn lows, highs, the Rule of 15, when to call; all in Staying Safe | — | — | Nav |
| 5.items.2 | Ask to be shown glucagon; guideline says people around them should be taught | dc-cpg-ch14-hypoglycemia-2023 | "ensure that support persons, including work colleagues, are counselled on administration of glucagon" | C |
| 5.items.3 | Ask what help is wanted before offering | — | — | Adv |
| 5.items.4 | Breakthrough caregiver guide for parents and caregivers of children and teens with type 1 | bt1d-mental-health-support | "The Caregiver Guide is for parents and caregivers of children and adolescents living with T1D" | C |
| 5.items.5 | Directory lists registered mental health providers, for people living with or affected by diabetes | bt1d-mental-health-support | "intended to provide people living with or affected by diabetes with access to information about registered mental health providers" | C |
| 5.items.6 | Low mood and worry about lows common; guideline asks teams to check | dc-taking-care-of-mental-health; dc-cpg-ch18-mental-health-2023 | DC: "Depression is more common compared to the general population"; Ch 18: fear of hypoglycemia "is a common occurrence", screen for it [Grade C] | C |
| 5.note | If caring wears you down, tell your doctor; guideline says parents and caregivers of young people should be checked for distress | dc-cpg-ch18-mental-health-2023 | "parents or caregivers of youth with diabetes, should be screened… for diabetes distress" | Adv / C |
| 5 crisis strip | 9-8-8, call or text, any time | 988-suicide-crisis-helpline | "Call or Text 9-8-8", "24/7/365" | C (M13) |
| 6.items.1 | NIHB covers people in Canada who are registered First Nations or recognized Inuit, and their children under 2 | isc-nihb-updates | "a client must be a resident of Canada, and 1 of the following": registered under the Indian Act; "an Inuk recognized by an Inuit land claim organization"; "a child less than 2 years old whose parent is an NIHB-eligible client" | C (exceptions HELD: M11) |
| 6.items.2 | Insulin users: several CGMs, with prior approval | isc-nihb-updates | CGM systems a "limited use benefit for clients managing diabetes with insulin. Prior approval is required" | C |
| 6.items.3 | Up to 800 strips every 100 days on insulin | isc-nihb-updates | "eligible for up to 800 test strips per 100 days" (page modified 2026-07-30) | C |
| 6.items.4 | Ask your pharmacist, band office or land claim organization which plan covers you | — | (Updates page: "for information on Inuit beneficiary enrollment, contact your land claim organization") | Adv |
| 6.items.5 | If you aren't covered by NIHB, Funding & Coverage lists the provincial and territorial programs | — | — | Nav (M12) |
| 6.items.6 | Care should take account of social, cultural and historical context; support choices about cultural resources | dc-cpg-ch38-indigenous | Rec 1: "with respect for, and sensitivity to, particular social, historical, economic, cultural and geographic issues"; "Explore patient preferences and support choices for accessing cultural resources" | C (M16) |
| 6.items.7 | Remote communities: retinal photographs for eye screening; on-the-spot A1C may be considered for screening where no lab | dc-cpg-ch38-indigenous | Retinal photography "may be used in Indigenous communities living in remote areas" [Grade B]; "in its absence, point of care testing for A1C may be considered where testing is associated with a quality control program" | C |
| 6.items.8 | Adults with other risk factors: consider a check every 6–12 months | dc-cpg-ch38-indigenous | "Screening for diabetes in asymptomatic Indigenous adults (>age 18 years) should be considered every 6 to 12 months in those with additional risk factors" | C |
| 6.note | NIHB adds items from time to time | isc-nihb-updates | An updates page (Libre 3 added) | C |
| programsBand.cards.1 | Team before trying: A1C, medicines, eyes and kidneys | dc-cpg-ch36-pregnancy | As 1.s1 | C |
| programsBand.cards.2 | Principal, with family and team, before the school year | dc-kids-in-school; cps-t1d-in-school-2015 | As 3.items.2–3 | C |
| programsBand.cards.3 | Team for targets; pharmacist for the medicine list | dc-cpg-ch37-older-people | As 4.items.1–3 | C / Adv |
| programsBand.cards.4 | Staying Safe; Breakthrough caregiver guide for a child or teen | bt1d-mental-health-support | As 5.items.4 | C / Nav |
| pharmacist | CDE hours and Canada-wide scope | — | Owner-supplied (2026-10-05), as Staying Safe; "CDE" is the correct Canadian credential | Owner |
| urgentExit | Signpost to `staying-safe#red-flags` | — | Correct anchor | Nav |

---

## D) OPEN RULINGS (for the nurse)

### D.1 Clinical defaults inherited from Staying Safe (used here pending the nurse)

| # | Default | Used in this chapter? |
|---|---|---|
| R1 · **ruled 2026-10-06 ([C1](clinical-rulings-2026-10-06.md#c1))** | Low = below 3.9 mmol/L | Indirectly. Card 2 sends children's lows to The Rule of 15. Card 3 quotes Diabetes@School without its "below 4" number, so the chapter shows no threshold. |
| R2 · **ruled 2026-10-06 ([C13](clinical-rulings-2026-10-06.md#c13))** | 15 g of juice = ½ cup | No (no food amounts here). |
| R3 · **ruled 2026-10-06 ([C4](clinical-rulings-2026-10-06.md#c4))** | Ketone ladder written for type 1 | Card 2 item 4 points to it for a child with type 1, the ladder's own audience. Card 1 says only that DKA can happen with normal or mildly high sugar and needs care right away; it doesn't send type 2 readers to the ladder. |
| R5 · **ruled 2026-10-06 ([C15](clinical-rulings-2026-10-06.md#c15))** | In-use insulin: "follow your leaflet" | No. |
| R8 · **ruled 2026-10-06 ([C8](clinical-rulings-2026-10-06.md#c8))** | Children's Rule of 15 amounts | Card 2 item 2 by reference ("Younger children take less"). |
| R9 · **ruled 2026-10-06 ([C14](clinical-rulings-2026-10-06.md#c14))** | FIT guide treated as industry-run; its lines HELD | Yes. The FIT later-life lines are HELD (section E). |
| R10 · **ruled 2026-10-06 ([C16](clinical-rulings-2026-10-06.md#c16))** | No alcohol limits stated | No alcohol content here. |

### D.2 Rulings for this chapter

| # | Default used | Where | Alternative |
|---|---|---|---|
| M1 · **ruled 2026-10-06 ([C23](clinical-rulings-2026-10-06.md#c23))** | **Clinician-level sources flagged in the card note.** Cards 1 and 4 say "This card draws on Diabetes Canada’s guideline for health professionals". Ch 36 is still the 2018 chapter (confirmed 2026-10-05; Ch 41 says pregnancy is "being updated separately"). | 1.note, 4.note | Drop the line, or label the cards "Clinician guidance". Re-check diabetes.ca for an updated pregnancy chapter at publish. |
| M2 · **ruled 2026-10-06 ([C19](clinical-rulings-2026-10-06.md#c19))** | **No folic acid amount** (Ch 36: 1 mg, from at least 3 months before conception to 12 weeks). | 1.s1.3, 1.figure.fields.2 | State "Diabetes Canada’s guideline suggests 1 mg a day". |
| M3 · **ruled 2026-10-06 ([C19](clinical-rulings-2026-10-06.md#c19))** | **No pregnancy glucose targets or pregnancy A1C.** | 1.s2.1 | State the numbers with "your team sets yours". |
| M4 · **ruled 2026-10-06 ([C19](clinical-rulings-2026-10-06.md#c19))** | **Preconception A1C stated** (≤7.0%, and ≤6.5% "if it can be done safely", the recommendation's qualifier). | 1.s1.2, band card 1 | Leave the number out. |
| M5 · **ruled 2026-10-06 ([C20](clinical-rulings-2026-10-06.md#c20))** | **CGM in pregnancy split by type** (changed by the check): type 1 "recommends" (Ch 9 Grade A, Ch 36); type 2 "ask your team". | 1.s2.2 | Drop the line. |
| M6 · **ruled 2026-10-06 ([C19](clinical-rulings-2026-10-06.md#c19))** | **Insulin after birth: no percentage** (Ch 36: at least 50% cut). The "check more often" line was added from the source, with no number. | 1.s3.1 | Drop the line, as close to titration. |
| M7 · **ruled 2026-10-06 ([C19](clinical-rulings-2026-10-06.md#c19))** | **Older-adult A1C targets stated** (≤7.0% independent; 7.1–8.5% "may be considered" if frail or with dementia and on medicine that can cause lows). The functionally dependent band (7.1–8.0%) and end of life (no A1C) are left out, which leaves a gap between items 2 and 3. | 4.items.2–3 | Add both bands, or give no numbers. |
| M8 · **ruled 2026-10-06 ([C20](clinical-rulings-2026-10-06.md#c20))** | **Prefilled pens named as the guideline's example; premixed insulin not** (drug-type choice). Close to a device recommendation (check finding C1), no brand. | 4.items.5 | Drop the pen line. |
| M9 | **CPS 2015 school statement treated as current.** The downloaded page shows "Current" in its breadcrumb and no retired or reaffirmed notice, but the CPS statements index hasn't been checked. | 3.items.3, 3.items.7, band card 2 | If retired: cite DC Kids in School and Diabetes@School only, drop "at least two staff trained" (item 7 still stands on Diabetes@School). |
| M10 | **OPEN: the First Nations, Inuit and Métis card needs review by an Indigenous health partner before publishing.** Card 6 ships in the message files, but the chapter isn't published (or card 6 is held) until that review is recorded. Left out by default, for the partner: Ch 38's prevalence figures, its language on colonization as a determinant of health, and its Inuit line. | Card 6 | Publish with the card hidden (needs a card-level hold, new engine work), or publish cards 1–5 only after renumbering. |
| M11 | **BLOCKER for publishing card 6 (widened by the check).** ISC's eligibility page lists people who don't get benefits from NIHB directly: BC First Nations who are FNHA clients, Nisga'a, Nunatsiavut, Nunavik Inuit and James Bay Cree in their regions, Bigstone Cree Nation and Akwesasne. That page isn't registered, so the line is HELD and item 4 sends everyone to their pharmacist, band office or land claim organization meanwhile. | 6.items.1, 6.items.4–5 | Register the ISC eligibility page and release the held line (section E). |
| M12 | **Métis wording.** The only Métis-relevant line is item 5's pointer to provincial and territorial programs. Métis Nation–run benefits are not in the register. | 6.items.5 | Partner to decide: name Métis people in item 5, or add a sourced Métis-specific line. |
| M13 · **ruled 2026-10-06 ([C25](clinical-rulings-2026-10-06.md#c25))** | **9-8-8 crisis strip on card 5** (carers). Staying Safe removed its strip because its copy had no self-harm line; here the carer and mental-health items make it relevant. Confirmed: "Call or Text 9-8-8", "24/7/365". | Card 5 | Leave it off and keep only the Ch04 distress card's strip. |
| M14 · **ruled 2026-10-06 ([C33](clinical-rulings-2026-10-06.md#c33))** | **No new ask roles.** Pregnancy and school use `team`, carers `peer`, the Indigenous card `pharmacist`. | All cards | Add `obstetric` or `school` roles. |
| M15 · **ruled 2026-10-06 ([C37](clinical-rulings-2026-10-06.md#c37))** | **A child’s eye and kidney checks left out** (Ch 30 refers under-15s to Ch 34, not verified for screening). | Card 2 | Re-read Ch 34 and add a "checks that start later" line. |
| M16 | **Ch 38 is a type 2 chapter; card 6 doesn't say so.** | 6.items.6–8 | Add "Diabetes Canada’s guideline on type 2 diabetes…" to item 6. Partner's call with M10. |

**Pre-publish factual checks (not clinical rulings):**
1. CPS 2015 statement status in the CPS statements index (M9).
2. NIHB updates page: still dated 2026-07-30 or later, and the 800-strip limit, at publish.
3. Quebec pump program page (last updated 2021-02-19): the before-18 rule was confirmed current on 2026-10-05; re-check quarterly with Funding.
4. Ch 36: confirm no updated Diabetes Canada pregnancy chapter at publish (M1).
5. Pharmacist CDE hours (owner).
6. Resolved by the check: the C-f locator re-reads (now C; locators to update, A.1 bookkeeping) and the Ch 36 A1C qualifier ("if can safely be achieved").

---

## E) HELD items (not in the copy)

Under sourcing policy 6, or out of scope. Wording proposed here goes to `held-messages.ts` / the content review, held until a source is confirmed on the page and the nurse reviews it.

**Released after the source check** (now in the copy): NIHB children under 2 of an eligible parent (on `isc-nihb-updates`, confirmed); the severe-low school emergency step (das-glucagon, das-low-blood-sugar, CPS); lows more likely after the birth (Ch 36); caregiver distress screening (Ch 18).

| Topic | Card | Why held | Proposed wording if released | Source to check |
|---|---|---|---|---|
| **NIHB exceptions: FNHA (BC), Nisga'a, Nunatsiavut, Nunavik Inuit, James Bay Cree, Bigstone Cree Nation, Akwesasne** | 6 | On the ISC eligibility page (checked live, modified 2026-05-28), which isn't in the register (M11). Needed before card 6 publishes | "Some Nations and regions run their own health benefits instead of NIHB, including the First Nations Health Authority in British Columbia. Your pharmacist or band office can tell you which plan covers you." | Register https://www.sac-isc.gc.ca/eng/1574187596083/1576511384063 |
| **Manitoba paediatric pump program** | 2 | The registered Shared Health page describes only adult (18+) pump coverage | "Manitoba has a separate pump program for children" | A Manitoba paediatric pump page |
| **Indigenous-led diabetes organizations and patient education** | 6 | Nothing in the register | Partner's choice of links | Indigenous health partner |
| **Ch 38 prevalence, colonization and Inuit lines** | 6 | In the source, held by default for the partner (M10) | As the guideline states them | dc-cpg-ch38-indigenous |
| **Breakthrough caregiver guide contents** | 5 | Only the guide's existence and audience are on a registered page | A one-line summary of what it covers, plus a band link | Register the guide page |
| **"Up to 300 extra decisions a day"** | 5 | Not in the locator; number from a summariser | "Type 1 can mean hundreds of extra decisions a day, about food, rest and play" | bt1d-mental-health-support (re-read) |
| **Moving from children's to adult care (transition)** | 2 | No source in the register | "Ask your child’s clinic, a year or two ahead, when and how they hand over to adult care" | CPG Ch 34 / Ch 41 (re-read); CPS |
| ~~**A child’s eye and kidney checks**~~ · **released 2026-10-06 ([C37](clinical-rulings-2026-10-06.md#c37)): 2.items.9** | 2 | Ch 34 not verified for screening (M15) | "Eye and kidney checks start a few years after diagnosis. Ask your child’s team when" | dc-cpg-ch34-t1d-children (re-read) |
| **Diabetes camps; Bag of Hope; newly-diagnosed child pages** | 2 | Not in the register | — | Breakthrough newly-diagnosed pages |
| **Diabetes@School care plan template and checklist pages** | 3 | Only the low and glucagon pages are registered | Band link: "Diabetes@School: Individual Care Plan" | Register the das ICP page |
| **CPS: glucagon training when an ambulance is more than 20 minutes away** | 3 | On the page ("if the emergency response time is expected to be more than 20 minutes, it is strongly recommended that school personnel be trained to administer glucagon"); left out for length while items 7–8 cover the emergency. Can be released | "Where an ambulance could take more than 20 minutes, the CPS strongly recommends training school staff to give glucagon" | cps-t1d-in-school-2015 (confirmed) |
| **FIT: 4 mm needles, injecting with less dexterity or eyesight** | 4 | FIT is industry-run (R9) | "Shorter pen needles (4 mm) work for most adults, and a pharmacist can show you devices that are easier to handle" | A non-industry Canadian source |
| **Eyesight and hand strength** | 4 | No source beyond FIT; Ch 37 covers memory only | "If eyesight or hand strength is changing, tell your team" | — |
| **Home care, community nursing, pharmacist medication reviews for seniors** | 4 | No source in the register | "Ask your care team what home care your province provides" | Provincial pages (for example, Ontario MedsCheck) |
| **Long-term care: no sliding-scale insulin, deprescribing** | 4 | Clinician-level, close to treatment decisions | — | dc-cpg-ch37-older-people (held for scope) |
| **Ch 37 drug lines (DPP-4 over sulfonylureas, avoid glyburide, once-daily basal, premixed insulin)** | 4 | Out of scope (no drug classes or treatment choices) | — | — |
| **Pregnancy numbers: folic acid 1 mg, glucose targets, pregnancy A1C, 50% insulin cut** | 1 | Held for scope by default (M2, M3, M6) | As in M2/M3/M6 | dc-cpg-ch36-pregnancy (confirmed) |
| **Ch 36 vaccinations and thyroid screening after birth** | 1 | Not re-read by the check; minor | "Your team will check your vaccines are up to date before you try" | dc-cpg-ch36-pregnancy (re-read) |
| **Pharmacist CDE phone number** | Pharmacist panel | Not confirmed by the owner | "Call a pharmacist CDE: 1-8xx-…" | Owner |
| **Kits in the strips** (school low kit, pen and meter starters) | 2, 3, 4 | Strips built 2026-10-06 (F.7); no kit is listed until the owner signs it off (A4) | — | Owner |

No card is fully HELD. Card 6 is complete as copy, but publishing it waits on M10 (partner review) and M11 (NIHB exceptions line).

---

## F) CHANGE LOG (what the source check changed)

| # | Key | Verify finding | Change made |
|---|---|---|---|
| 1 | 1.s1.1 | Confirmed; the guideline recommends, not suggests | "suggests" → "recommends". |
| 2 | 1.s1.2 | Partly: qualifier is "if can safely be achieved" | "if possible" → "if it can be done safely". Pre-publish check 3 resolved. |
| 3 | 1.s1.4 | Confirmed; Safety S5 | Added "Some medicines need to be stopped or changed before pregnancy. Don’t stop any on your own" (Ch 36 "discontinuing potentially harmful medications"). No drug names. |
| 4 | 1.s1.5, 1.s3.2 | Confirmed (were C-f) | Marked C. No wording change. |
| 5 | 1.s2.2 | Partly: Ch 36/Ch 9 recommend CGM for type 1 only; type 2 uses finger-prick | Split by type: type 1 "recommends a CGM in pregnancy"; type 2 "ask your team whether one suits you". M5 now records this as the default. |
| 6 | 1.s2.4 | Partly (Safety S2): Ch 15 says "normal or mildly elevated" | "only a little high" → "normal or only a little high". |
| 7 | 1.s3.1 | Confirmed; Safety S3: risk of lows after delivery | Added "Lows are more likely in the first days, so check more often". No percentage (M6). |
| 8 | 2.items.2 | Partly: over 10 takes the adult 15 g | "a child takes less… than an adult" → "Younger children take less fast-acting sugar for a low, depending on their age". |
| 9 | 2.items.5 | Partly: "extra attention" not on the page | Reworded to the page: regular check-ins "especially helpful in the teen years and young adulthood". |
| 10 | 2.items.6 | Partly: not "automatically"; T2201 still needed with Part B certified | "meets… for 2021 and later tax years. You still apply with form T2201, on paper or online, and your child’s doctor or nurse practitioner fills in their part". UNCHECKED_TITLE on the CRA page can be cleared (A.1). |
| 11 | 2.items.8 / card 2 sources | Partly: MB page has no paediatric pump program | `mb-shared-health-diabetes-care` removed from card 2; MB paediatric line HELD. Wording unchanged (QC and SK support it). |
| 12 | 3.items.2 | Partly: "leads" overstates | "Diabetes Canada says the principal should work with you, your child and your child’s health care team to write the plan". |
| 13 | 3.items.4 | Confirmed (was C-f) | Marked C. |
| 14 | 3.items.5 | Partly: a DC position, not a rule in every school | "Diabetes Canada says schools should let students carry a phone or smartwatch…". |
| 15 | 3.items.7 (new) | Safety S1: no severe-low emergency step | New item: don't leave a student alone with a suspected low; unresponsive, seizure or can't take sugar by mouth is an emergency; have someone call 911, stay, nothing in their mouth (das-glucagon, das-low-blood-sugar, CPS). "Don’t" used because both sources say so. |
| 16 | 3.items.8 (was 7) | Confirmed, incomplete: 911 comes before glucagon | Now starts "Then, if the care plan includes consent for glucagon…", so it follows the 911 step. |
| 17 | 3.items.9 (was 8) | Confirmed (was C-f) | Renumbered; marked C. |
| 18 | 3.figure.fields.6 (new); card 3 meta | Safety S1: "Who calls 911" on the plan; school staff are an audience | Added field 6 "Who calls 911 for a severe low"; `takeIn` fields 5 → 6; card 3 now `urgentContent: true`. |
| 19 | 4.items.1, .2, .4, .5, .6 | Confirmed (were C-f) | Marked C. |
| 20 | 4.items.3 | Partly (Safety S4): "may be considered", only with medicine that can cause lows | "the guideline says a less strict A1C target of 7.1 to 8.5% may be considered", scoped to people who "take medicine that can cause lows"; added "Your team sets yours". No drug class named. |
| 21 | 4.items.7 / card 4 sources | Partly: limited to 65+, daily insulin, living at home | Reworded to the page. Cited `on-diabetes-equipment-and-supplies` only; `on-adp-insulin-pumps` removed (title mismatch noted in A.1). |
| 22 | 5.note | Optional: Ch 18 caregiver screening supports the note | Added "Diabetes Canada’s guideline says parents and caregivers of young people with diabetes should be checked for diabetes distress too"; replaced "Your health matters here too". |
| 23 | 6.items.1 | Partly (accuracy blocker): eligibility exceptions on the ISC page | Reworded to the registered updates page (resident of Canada; registered First Nations; recognized Inuit; children under 2, released from E). The exceptions line is HELD (page unregistered); M11 widened to Quebec and Labrador. |
| 24 | 6.items.2 | Partly: "flash glucose monitor" not on the page | "several continuous glucose monitors (CGMs), with prior approval". |
| 25 | 6.items.4 | M11 interim: readers need to find their own plan | "Ask your pharmacist, band office or land claim organization which plan covers you, and what needs prior approval, before you order". |
| 26 | 6.items.5 | Partly: wrong for FNHA, Nunavik, Cree and other self-administered plans | Now navigation only: "If you aren’t covered by NIHB, Funding & Coverage lists the programs in each province and territory". |
| 27 | 6.items.6 | Confirmed; "community" not the guideline's word | "culture, community and history" → "social, cultural and historical context". |
| 28 | 6.items.7 | Partly: point-of-care A1C is conditional and for screening | "Where a lab isn’t available, it says on-the-spot A1C tests may be considered for diabetes screening". |
| 29 | Meta citations | das-glucagon now carries the card 3 emergency step | Added "Diabetes@School — Glucagon: What it is and how to use it". |
| 30 | Section C | All C-f rows re-read verbatim by the check | Every C-f now C; table updated with the page wording. |
| 31 | Section D | Pre-publish checks 1 and 3 resolved; QC rule confirmed current | Checks list updated; M5, M9, M11 and M13 updated. |
| 32 | Not changed | pharmacist panel hours (owner); band cards 1–4; urgentExit; 9-8-8 strip | Confirmed or owner-supplied; no change. |

### F.2 Changes from the fix list (2026-10-05)

Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `chapters-meta.ts`, the shared engine (`_microsite`) and `rule-of-15-controls.tsx`. Sections B and D above still show the state before these changes; the content-review export and `OPEN-QUESTIONS.md` (C19, C25) have the new defaults.

| # | Key | Reason | Change made |
|---|---|---|---|
| 33 | 4.items.3 (EN + FR) | Fix list 9 (M7): CPG Ch37, re-read 2026-10-05, states the band in its recommendation: "A higher A1C target may be considered in older people with diabetes taking antihyperglycemic agent(s) with risk of hypoglycemia, with any of the following: … Functionally dependent: 7.1–8.0%; Frail and/or with dementia: 7.1–8.5%" | EN: "For people who take medicine that can cause lows, the guideline says a less strict A1C target may be considered: 7.1 to 8.0% for people who are functionally dependent, and 7.1 to 8.5% for people who are frail or living with dementia. Your team sets yours". FR: "Pour les personnes qui prennent un médicament pouvant causer des hypoglycémies, les lignes directrices indiquent qu’une cible d’A1C moins stricte peut être envisagée : de 7,1 à 8,0 % pour les personnes fonctionnellement dépendantes, et de 7,1 à 8,5 % pour les personnes fragiles ou atteintes de démence. Votre équipe établit la vôtre". Same SourceIds (`dc-cpg-ch37-older-people`, `dc-cpg-ch8-targets`). End of life still left out. M7 stays open with this default. |
| 34 | 5.figure.body (new, EN + FR); meta card 5 crisis | Fix list 4: the carers' strip should carry 911 as Every Day Living card 5's does | Strip numbers now 911 (`kind: 'emergency'`, written "911") and 9-8-8, with "Emergency: call 911" / "Urgence : appeler le 911". The strip's sentence is Every Day Living card 5's, word for word: "If you’re thinking about harming yourself, call or text 9-8-8, Canada’s Suicide Crisis Helpline, any time of day or night. If your safety is at risk right now, call 911." / "Si vous pensez à vous faire du mal, appelez ou envoyez un texto au 9-8-8, la Ligne d’aide en cas de crise de suicide du Canada, à toute heure du jour ou de la nuit. Si votre sécurité est menacée en ce moment, appelez le 911." Source `988-suicide-crisis-helpline` ("If your safety is at risk, call 9-1-1 right away"), already on the card. M13 updated. |
| 35 | meta card 2 link (items.2) | Fix list 2: "The Rule of 15" should open the children's amounts | The link now opens `staying-safe?view=child#card-2`: a new engine field, `view` on a card link, which the Rule of 15's controls read once on load (for their own card only) to start on "A child". No wording change. Every other link to the Rule of 15 still opens the adult view. |
| 36 | Shared interface text: `ui.chapter.ask.peer`, `ui.chapter.roleNames.peer` (EN + FR) | Fix list 8: "someone who lives with diabetes" reads oddly on the carers' card | "Ask someone who lives with diabetes" → "Ask someone who’s been there"; "someone who lives with diabetes" → "someone who’s been there". FR: "Demandez à quelqu’un qui vit avec le diabète" → "Demandez à quelqu’un qui est passé par là"; "quelqu’un qui vit avec le diabète" → "quelqu’un qui est passé par là". UI strings only; card 5 is the only card with `ask: 'peer'`. M14 updated. |
| 37 | 6.items.3 (FR only) | Fix list 10: the site's usage | "800 bandelettes de test" → "800 bandelettes", as Your Tools' band card 2 says. EN unchanged. |
| 38 | Meta citations (FR) | Fix list 10 | The NIHB citation now has its French title and page (labelFr "Services aux Autochtones Canada — Mises à jour du Programme des services de santé non assurés", hrefFr https://www.sac-isc.gc.ca/fra/1578079214611/1578079236012, loaded 2026-10-05), from `isc-nihb-updates` in the register. |

---

## G) NEW SITE FIGURES needed

**None.** The plan's "06 · This Might Be You" section names no interactive figure, so every card uses an engine kind: `takeIn` with `fields` (card 1: 5 fields; card 3: 6 fields), `columns` (cards 2, 4, 5 and 6) and `crisis` (card 5). Each has the engine's plain-list fallback.

Considered and not proposed, because the plan does not name them:
- **A pregnancy timeline** (before trying → each trimester → after the birth). Card 1's three `sections` carry the same order as plain lists.
- **A school care-plan builder** that fills in and saves the plan. The printable `takeIn` card (six blank lines) does the job with no stored data; storing a child's plan would raise privacy questions.
- **The plan's "checkup-year map"** belongs to Ch04's band. Card 2 could link to it once the children's screening lines are sourced (M15).

### F.3 Changes after the full-site review (2026-10-06)

Continues section F (change log).

| # | Key (EN and FR) | Was | Now | Why |
|---|---|---|---|---|
| F3-1 | `3.items.7` | "…have someone call 911, stay with them, and put nothing in their mouth" (FR "…demandez à quelqu’un d’appeler le 911, restez avec lui et ne lui mettez rien dans la bouche") | "…have someone call 911, turn them on their side, stay with them, and put nothing in their mouth" (FR "…demandez à quelqu’un d’appeler le 911, tournez-le sur le côté, restez avec lui et ne lui mettez rien dans la bouche") | Clinical S3: the card's own source `das-glucagon` says "turn the student on their side and stay", and Staying Safe says the same. The meta comment is updated |
| F3-2 | `2.note`, `4.note`, `6.items.5` | "Funding & Coverage" as plain text | `<link>` tags around "Funding & Coverage" (FR "Financement et couverture"), opening the Funding page in the page locale (meta `links`, `to: { page: 'funding' }`). No word changed | Known item K3 |
| F3-3 | Register `988-suicide-crisis-helpline` | English title and site on /fr | `labelFr` "9-8-8 : Ligne d’aide en cas de crise de suicide", `hrefFr` https://988.ca/fr (the French site, opened 2026-10-06) | Clinical S3 (sources list on /fr) |

### F.4 Clinical rulings applied (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md). No wording in this chapter changed for these rulings.

| # | Where | Record | Ruling |
|---|---|---|---|
| 1 | M5 (1.sections.2.items.2), M8 (4.items.5) | Kept as built | [C20](clinical-rulings-2026-10-06.md#c20) |
| 2 | M13 and pinning | Cards 1, 3 and 5 stay pinned under the site-wide rule written in `chapters-meta.ts` (a card that sends the reader to act now: 911, the emergency department, same-day care or a crisis line); card 5's strip keeps Every Day Living card 5's sentence | [C25](clinical-rulings-2026-10-06.md#c25) |
| 3 | R1, R2, R3, R5, R8, R9 | The carried Staying Safe defaults are ruled; card 2 still sends a child's amounts and ketones to Staying Safe, whose child note now adds "If your child has another type of diabetes, or uses an automated system, ask their team how much to give" and a Health Canada honey note | [C1](clinical-rulings-2026-10-06.md#c1), [C13](clinical-rulings-2026-10-06.md#c13), [C4](clinical-rulings-2026-10-06.md#c4), [C15](clinical-rulings-2026-10-06.md#c15), [C8](clinical-rulings-2026-10-06.md#c8), [C18](clinical-rulings-2026-10-06.md#c18), [C14](clinical-rulings-2026-10-06.md#c14) |

### F.5 Clinical rulings applied: targets, types and other (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md), rulings C16–C45 (the verifier's final copy; where a choice was left to the owner, the stated default). Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `chapters-meta.ts` and `sources-meta.ts` / `sources-review.ts`. Sections B and C above still show the earlier wording and claims rows; the keys and claims below are current. All French is machine-drafted and awaits the francophone review.

| # | Key or place | Change | Ruling |
|---|---|---|---|
| 1 | `4.items.3` | EN "For people who take medicine that can cause lows, the guideline says a less strict A1C target may be considered: 7.1 to 8.0% for people who are functionally dependent, and 7.1 to 8.5% for people who are frail or living with dementia. Your team sets yours" → "For people who take medicine that can cause lows, the guideline says a less strict A1C target may be considered: 7.1 to 8.0% for people who are functionally dependent, and 7.1 to 8.5% for people who are frail or living with dementia. Your team sets yours. Near the end of life, the guideline says A1C tests are no longer recommended. The aim then is to avoid any lows, and highs that cause symptoms" · FR → "Pour les personnes qui prennent un médicament pouvant causer des hypoglycémies, les lignes directrices indiquent qu’une cible d’A1C moins stricte peut être envisagée : de 7,1 à 8,0 % pour les personnes fonctionnellement dépendantes, et de 7,1 à 8,5 % pour les personnes fragiles ou atteintes de démence. Votre équipe établit la vôtre. En fin de vie, les lignes directrices ne recommandent plus de mesurer l’A1C. Le but est alors d’éviter toute hypoglycémie, ainsi que les hyperglycémies qui causent des symptômes" | [C19](clinical-rulings-2026-10-06.md#c19) |
| 2 | `1.sections.1.items.3` | EN "It recommends starting folic acid before you conceive. Ask your team or pharmacist how much to take" → "It recommends starting folic acid before you conceive. With diabetes, you may need a higher dose than is usually advised, so ask your team or pharmacist how much to take" · FR → "Elles recommandent de commencer l’acide folique avant la conception. Avec le diabète, vous pourriez avoir besoin d’une dose plus élevée que celle habituellement conseillée : demandez à votre équipe ou à votre pharmacien combien en prendre" | [C19](clinical-rulings-2026-10-06.md#c19) |
| 3 | `1.note` | EN "Gestational diabetes, which starts in pregnancy, is in <link>Know Your Type</link>. This card draws on Diabetes Canada’s guideline for health professionals." → "Gestational diabetes, which starts in pregnancy, is in <link>Know Your Type</link>. This card draws mostly on Diabetes Canada’s pregnancy guideline for health professionals and its key messages for people planning a pregnancy. That guideline is from 2018, and Diabetes Canada is updating it." · FR → "Le diabète gestationnel, qui commence pendant la grossesse, est abordé dans <link>Connaître votre type</link>. Cette section s’appuie surtout sur les lignes directrices de Diabète Canada sur la grossesse destinées aux professionnels de la santé, et sur leurs messages clés pour les personnes qui planifient une grossesse. Ces lignes directrices datent de 2018, et Diabète Canada les met à jour." | [C23](clinical-rulings-2026-10-06.md#c23) |
| 4 | `4.note` | EN "Ask a pharmacist to go through your full list of medicines, including anything you buy without a prescription. More programs for seniors are in <link>Funding & Coverage</link>. This card draws on Diabetes Canada’s guideline for health professionals." → "Ask a pharmacist to go through your full list of medicines, including anything you buy without a prescription. More programs for seniors are in <link>Funding & Coverage</link>. This card draws on Diabetes Canada’s guideline for health professionals and its key messages for older people." · FR → "Demandez à un pharmacien de passer en revue la liste complète de vos médicaments, y compris ce que vous achetez sans ordonnance. D’autres programmes pour les aînés se trouvent dans <link>Financement et couverture</link>. Cette section s’appuie sur les lignes directrices de Diabète Canada destinées aux professionnels de la santé et sur leurs messages clés pour les personnes âgées." | [C23](clinical-rulings-2026-10-06.md#c23) |
| 5 | `2.items.9` | New: EN "Kidney checks usually start 5 years after diagnosis, or after puberty if your child was diagnosed young. Eye exams usually start at age 15, once your child has had type 1 for 5 years. Your child’s team sets the schedule" · FR "Le dépistage pour les reins commence habituellement 5 ans après le diagnostic, ou après la puberté si votre enfant a reçu son diagnostic jeune. Les examens des yeux commencent habituellement à 15 ans, quand votre enfant a le diabète de type 1 depuis 5 ans. L’équipe de votre enfant établit le calendrier" | [C37](clinical-rulings-2026-10-06.md#c37) |
| 6 | card 1 (meta) | Sources add the new `phac-folic-acid` (Public Health Agency of Canada, "Folic acid, healthy pregnancy and neural tube defect prevention", EN and FR, modified 2025-10-20, read 2026-10-06; re-open before publishing). Claims: 1.s1.3 `dc-cpg-ch36-pregnancy` and `phac-folic-acid`; no amount and no product type. Ask: `team` → `obstetric` ("Ask your pregnancy care team"). The pre-publish check for a new pregnancy chapter stays (M1). M1, M2, M3, M4, M6 and M14 closed (M2, M3 and M6 stay out as numbers; M4 stays as built) | [C19](clinical-rulings-2026-10-06.md#c19), [C23](clinical-rulings-2026-10-06.md#c23), [C33](clinical-rulings-2026-10-06.md#c33) |
| 7 | card 2 (meta) | `columns: [[1, 2, 3, 4], [5, 9], [6, 7, 8]]`; sources add `dc-cpg-ch29-ckd-2025` and `dc-cpg-ch34-t1d-children`. Claims: 2.items.9 Ch29 2025 (kidneys: 5 years after onset, or after puberty if diagnosed young) and Ch34 (eyes: from age 15 with 5 years' duration). Ch34's locator now records its screening lines (Ch41 2025 updates only its glycemic parts). M15 closed | [C37](clinical-rulings-2026-10-06.md#c37) |
| 8 | card 3 (meta) | Ask: `team` → `school` ("Ask your child’s school"). M14 closed | [C33](clinical-rulings-2026-10-06.md#c33) |
| 9 | card 4 (meta) | 4.items.3 claims add `dc-cpg-ch37-older-people` (end of life: "A1C measurement not recommended. Avoid symptomatic hyperglycemia and any hypoglycemia"). M7 closed | [C19](clinical-rulings-2026-10-06.md#c19), [C23](clinical-rulings-2026-10-06.md#c23) |
| 10 | R10 | Closed: alcohol is ruled in Every Day Living card 4 | [C16](clinical-rulings-2026-10-06.md#c16) |

### F.6 Owner's business answers applied (2026-10-06)

From the owner's answers of 2026-10-06 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)). French machine-drafted.

| # | Key | Change | Why |
|---|---|---|---|
| 1 | card 6 (`6.title`, `6.items`, `6.figure.columns`; meta) | Rewritten to official program facts only, each with its link. Title "First Nations, Inuit and Métis" → "First Nations and Inuit: NIHB coverage". Items: 1 "Indigenous Services Canada runs the federal Non-Insured Health Benefits (NIHB) program for First Nations and Inuit"; 2 "Who is eligible is set out on <link>Indigenous Services Canada’s eligibility page</link>. Liivv can’t decide whether you’re eligible. For questions about eligibility, Indigenous Services Canada says to contact your NIHB regional office"; 3 "For people who manage diabetes with insulin, NIHB covers several continuous glucose monitors (CGMs), with prior approval. The list is in <link>the NIHB program updates</link>"; 4 "It also covers up to 800 test strips every 100 days for people who use insulin"; 5 unchanged (Funding & Coverage). Columns "The program" [1, 2] / "What it covers" [3, 4, 5]. Removed: the old item 4 (ask your pharmacist, band office or land claim organization), and items 6–8 (Ch38: care in context, remote screening, a check every 6 to 12 months). Sources `isc-nihb-eligibility` and `isc-nihb-updates`; the outward links use the new card-link kind `{ source, href, hrefFr }`, checked against the register · FR "Premières Nations et Inuits : la couverture du SSNA"; "Services aux Autochtones Canada gère le Programme fédéral des services de santé non assurés (SSNA) pour les Premières Nations et les Inuits"; "Les conditions d’admissibilité sont présentées sur <link>la page d’admissibilité de Services aux Autochtones Canada</link>. Liivv ne peut pas décider si vous êtes admissible. Pour toute question sur l’admissibilité, Services aux Autochtones Canada indique de communiquer avec votre bureau régional du Programme des SSNA"; "Pour les personnes qui gèrent leur diabète avec de l’insuline, le SSNA couvre plusieurs systèmes de surveillance du glucose en continu (SGC), avec une autorisation préalable. La liste se trouve dans <link>les mises à jour du Programme des SSNA</link>"; columns "Le programme" / "Ce qu’il couvre" | B1, B2 (M10, M11, M12, M16 closed) |
| 2 | `focus` | "…and coverage and care for First Nations, Inuit and Métis people." → "…and NIHB coverage for First Nations and Inuit." (FR "…et la couverture du SSNA pour les Premières Nations et les Inuits.") | B1 |
| 3 | Chapter citations | Adds ISC's eligibility page; drops Diabetes Canada Ch38, which no card cites now | B1, B2 |
| 4 | register `isc-nihb-eligibility` | Re-opened 2026-10-06 (EN and FR, dated 2026-05-28); label is now the printed title, "Who is eligible for the Non-Insured Health Benefits (NIHB) program for First Nations and Inuit" | B2 |
| 5 | `pharmacist.body`, `pharmacist.cta` | EN body → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province. Questions about a pregnancy, a child’s plan or a change in someone’s health belong with their diabetes team." · FR → "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province. Les questions sur une grossesse, le plan d’un enfant ou un changement dans la santé d’une personne relèvent de son équipe de soins en diabète.". Under the body, the panel shows the CDE contact from `ui.contact` (DIABETES_SITE.contact): "Call 1-844-561-1254" (tel:+18445611254; FR "Appeler le 1 844 561-1254"), "Email BayshoreExpress@bayshore.ca", "Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays", and "About Bayshore Express Pharmacy" (https://bayshoreexpresspharmacy.ca/about/; FR /fr/a-propos-de-nous/, `bep-about`). The `cta` "Request a call" is removed: the panel has no button, and the hero's "Ask a pharmacist" opens the panel (`#chapter-cde`) | Owner A2, B5, B9, B10, B12 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)) |

### F.7 Commerce step: shop strips (2026-10-06)

How a strip behaves (all chapters): the products are named in `diabetes-care/chapters/chapter-shop.ts` (owner answer B21, "Now?"), drawn by the shared engine (`_microsite/shop/`) under the card's referral chip, and read from the catalogue on every request. A product shows only while the store shows it, sells it and has it in stock, and never when its description names or links another retailer or gives its phone number (17 descriptions still do; OPEN-QUESTIONS B3). A product with a required option or modifier (85 diabetes products carry a required "Test" modifier today) gets "Choose options", a link to its page, instead of a one-click add. No kit is listed (A4). One switch, `SHOP_SWITCH.placements`, turns every strip off. Every placed id is health-revealing by id for analytics (`sensitive-products.ts`). The strip's words are `ui.chapter.shop.*` (French machine-drafted, not behind a review gate, as on Ostomy).

| # | Card | Strip |
|---|---|---|
| 1 | 2 A child with type 1 | `childGear`: mylife Kids Pouch (4323), Jerry the Bear (5017), Buzzy (4459), each "Choose options" |
| 2 | 3 Your child at school | `schoolLowKit`: Dex4 tablets (7371) and gel (7382), Dex4 key chain (4731), a medical ID (4289) |
| 3 | 4 Later life | `laterLife`: meters (4556, 4524), pen needles (4777) |
| 4 | 1, 5, 6 | None |

### F.8 Fixes after the full-site review (2026-10-06)

Engine-wide changes are in new-to-the-journey.md F.8.

| # | Where | Change | Why |
|---|---|---|---|
| 1 | Citations (meta) | "Breakthrough T1D — Mental Health Support" gets its French title and page on /fr, "Percée DT1 — Soutien en santé mentale", https://perceedt1.ca/soutien-en-sante-mentale/ (the register's `hrefFr` for `bt1d-mental-health-support`) | Crawl 4 |
