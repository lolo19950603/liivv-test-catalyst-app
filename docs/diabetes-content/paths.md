# Path pages — intros and reading lists (DiabetesCare.paths)

Draft of 2026-10-05, revised the same day from the source check (`paths.verify.md`). Not compiled, not in
the repo. Covers the five path pages at `/liivv-health/diabetes-care/chapters/<slug>`:

| Slug | Status | Starts at |
|---|---|---|
| `type-1` | existing URL, copy replaced | Know Your Type card 1 |
| `type-2` | existing URL, copy replaced | Know Your Type card 2 |
| `gestational` | existing URL, copy replaced | Know Your Type card 4 |
| `prediabetes` | existing URL, copy replaced | Know Your Type card 3 |
| `less-common-types` | **new URL** | Know Your Type card 6 |

Built from the plan section "Diabetes types across the site" and the verified chapter copy in
`content/*.md` (card titles and numbers as of 2026-10-05). Every Partly and Not confirmed row and every
problem in the source check is dealt with here; section H logs each change. Ground rules applied:

- **Sources.** Every SourceId cited is in `diabetes-care/chapters/sources-meta.ts`. Three proposed
  additions are in section F (F.1–F.3), and F.4 lists locator notes to add for sources that are already
  registered. Every line that depends on F.1–F.3 is HELD and is not in the JSON. Lines that depend only
  on an F.4 locator note ship, because the source check read the fact on the live page; the note just
  has to be in `sources-review.ts` before release.
- **International guidance** appears in one sentence only, and is named in it: the Exeter (UK) line in
  a Gestational reason. The ADA/EASD consensus line in the Type 2 intro is replaced by a Canadian source
  (Breakthrough T1D), because the 2021 report has been superseded (P1). The Less common intro says that
  cards resting on international guidance carry the badge, which is navigation.
- **No product placements.** There are no shelves, strips, kits or cart actions. The old `PATH_CHAPTERS`
  cards ("pump-adjacent shopables", "CarePack", "Restock rhythm") are retired along with the rest of
  that copy. Section E says where a strip would go once placements resume. Prediabetes never gets one.
- **Prediabetes has no supply framing.** No meter, strip, tool or pharmacist-CDE supply block. Its
  Funding door makes no supply claim.
- **Funding door.** Every program is shown as pay-and-claim with "ask us" copy, per the owner. No
  program is named as directly billed, and there is no pay-later program or phone number. Program
  conditions the source check found (Monitoring for Health: no other coverage; NIHB sensors: prior
  approval) are now in the sentence.
- **Pharmacist CDE band.** Owner wording of 2026-10-05: national, Monday to Friday, 9 to 5 Eastern,
  holidays excepted, "Request a call" only. Headings now match the body (pumps and sensors). The band
  also says where Liivv has pharmacies (every province except Quebec; none in the territories). It
  ships only after the release gates in E.1 are met.
- **No Diabetes Express**, no testimonials, no unsourced statistics, no dosing.
- **Safety is never filtered.** Every path, prediabetes included, carries the shared Staying Safe
  red-flags strip (section A.3). Each reading list except Prediabetes also links the Staying Safe cards that apply.

---

## A) STRUCTURE

### A.1 Page order (each path)

1. Hero: `title`, `heroBody`.
2. Intro: `intro.eyebrow`, `intro.heading` and two paragraphs, `intro.body.1` and `intro.body.2`.
3. Safety strip, from shared copy (A.3). Never gated, never collapsible.
4. Reading list: `list.heading` and `list.intro`, then the ordered entries (section C), grouped by stage. Each entry is
   - the card title, resolved from `DiabetesCare.chapters.<slug>.categories.<n>.title`, so it is never retyped;
   - the chapter number and name;
   - the reason (`list.reasons.<n>`);
   - a link to `/liivv-health/diabetes-care/chapters/<slug>#card-<n>`, the anchor the engine already renders (`_microsite/chapters/chapter-page.tsx:85`).
5. Shop strip (`#path-shop`; `PATH_SHELVES` in `chapter-shop.ts`, since 2026-10-06, B21; H.7). Never on Prediabetes.
6. Funding & Coverage door: `funding.heading`, `funding.body`, `funding.cta`, linking to `/liivv-health/diabetes-care/funding`.
7. Pharmacist CDE band: `pharmacist.*`. Not on Prediabetes (Q3). Renders only once the E.1 release gates are met.
8. Other paths rail: five entries now, so the old "All four paths" heading has to change (`ui.path.allPaths`).

### A.2 Proposed meta shape

```ts
type PathStage = 'start' | 'types' | 'safe' | 'tools' | 'everyday' | 'season';
interface PathEntry { slug: ChapterSlug; card: number; stage: PathStage } // reason = list.reasons.<index+1>
interface PathMeta {
  slug: 'type-1' | 'type-2' | 'gestational' | 'prediabetes' | 'less-common-types';
  heroImage: string;              // existing chapter-type1/2, gestational, prediabetes images; less-common: TBD
  entries: PathEntry[];           // section C, in order
  fundingHref: '/liivv-health/diabetes-care/funding';
  pharmacist: boolean;            // false for prediabetes; also gated by E.1
  shopStrip: null;                // built as PATH_SHELVES in chapter-shop.ts (B21; H.7); never prediabetes
  introSources: SourceId[];       // review only, section D
  fundingSources: SourceId[];     // review only, section D
}
```

### A.3 Shared keys (outside the per-path block)

- `DiabetesCare.ui.path.kicker`: "Your path"
- `DiabetesCare.ui.path.allPaths`: "All five paths"
- `DiabetesCare.ui.path.chapterLabel`: "Chapter {num} · {chapter}"
- `DiabetesCare.ui.path.readCard`: "Read the card"
- `DiabetesCare.ui.path.stages`:
  - `start`: "Start here"
  - `types`: "The types"
  - `safe`: "Staying safe"
  - `tools`: "Your tools"
  - `everyday`: "Every day"
  - `season`: "If this is you"
- Safety strip: this reuses the wording of Know Your Type's `urgentExit`, moved to a shared key.
  - `DiabetesCare.ui.path.safety.lead`: "Signs that need emergency care, for a low, a high or ketones, are in"
  - `DiabetesCare.ui.path.safety.link`: "Chapter 02 — Get emergency care now"
  - The link goes to `/liivv-health/diabetes-care/chapters/staying-safe#red-flags`.
- Hub retired: `your-diabetes-journey` redirects to the landing's `#which-diabetes` (plan). `JOURNEY_HUB_HREF` and the "Back to Your Diabetes Journey" button go with it.

---

## B) EN MESSAGES — `DiabetesCare.paths`

Reasons (`list.reasons.<n>`) are in section C, next to the card each one belongs to. They compile into
`<path>.list.reasons.<n>` in the same order.

```json
{
  "type-1": {
    "title": "Type 1",
    "heroBody": "Insulin every day, lows and ketones, sensors and pumps: the cards that matter most with type 1, in one order.",
    "intro": {
      "eyebrow": "Your path",
      "heading": "Living with type 1",
      "body": {
        "1": "With type 1, your pancreas makes no insulin, so you take insulin by injection or with a pump. Diabetes Canada says 5 to 10% of people with diabetes have type 1, and it can start in adulthood too. Breakthrough T1D says about 71% of Canadians with type 1 were diagnosed as adults.",
        "2": "This path puts the cards that matter most with type 1 in one order. They cover how to treat a low and when to check for ketones, the sensors, pens and pumps you may use, and the times in life when the details change. Diabetes Canada’s 2025 type 1 guideline prefers automated insulin delivery for anyone willing and able to use it, so the pump and sensor cards are here too. Your team decides your plan with you."
      }
    },
    "list": {
      "heading": "Your type 1 reading list",
      "intro": "Read in order, or jump to what you need today. Each card opens in its own chapter."
    },
    "funding": {
      "heading": "Funding & Coverage",
      "body": "Type 1 meets the Disability Tax Credit’s life-sustaining therapy test for 2021 and later tax years. You still need to apply. Help with pumps, sensors and test strips depends on where you live. At Liivv, you pay for your supplies, then claim them from your program. Ask us what you need for the claim.",
      "cta": "See what’s covered where you live"
    },
    "pharmacist": {
      "eyebrow": "Anywhere in Canada",
      "heading": "Questions about pumps and sensors",
      "body": "Liivv’s pharmacist CDEs answer pump and CGM questions from anywhere in Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. When you need a pharmacy, they pass you to the right Liivv pharmacy. Liivv has one in every province except Quebec, and none in the territories. Your insulin plan and pump settings belong with your diabetes team.",
      "cta": "Request a call"
    }
  },
  "type-2": {
    "title": "Type 2",
    "heroBody": "From the first numbers to the yearly checkups: the cards that matter most with type 2, in one order.",
    "intro": {
      "eyebrow": "Your path",
      "heading": "Living with type 2",
      "body": {
        "1": "Type 2 is the most common type. Diabetes Canada says 90 to 95% of people with diabetes in Canada have it, and it may cause no symptoms at all. Treatment is different for each person. Diabetes Canada says many people with type 2 need insulin to stay healthy. Whether you do, and when, is decided with your team.",
        "2": "This path starts with the basics. Next come checking your blood sugar at home and the times a low can happen, then the checkups that look after your feet, eyes, kidneys and heart. If your diabetes doesn’t fit the usual picture, read Could my type be different? Breakthrough T1D says LADA, a type 1 that starts slowly in adults, is often first treated as type 2."
      }
    },
    "list": {
      "heading": "Your type 2 reading list",
      "intro": "Read in order, or jump to what you need today. Some cards are only for people who take insulin or a pill that can cause lows, and each one says so."
    },
    "funding": {
      "heading": "Funding & Coverage",
      "body": "At Liivv, you pay for your supplies, then claim them from your program. Ask us what you need for the claim. What’s covered often depends on how you treat your diabetes. Under the Ontario Drug Benefit, for example, the yearly limit on test strips is higher if you take insulin than if you manage with diet and activity alone. Each province and territory has its own rules.",
      "cta": "See what’s covered where you live"
    },
    "pharmacist": {
      "eyebrow": "Anywhere in Canada",
      "heading": "Questions about sensors and pumps",
      "body": "Liivv’s pharmacist CDEs answer pump and CGM questions from anywhere in Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. When you need a pharmacy, they pass you to the right Liivv pharmacy. Liivv has one in every province except Quebec, and none in the territories. Your medicines and your plan belong with your diabetes team.",
      "cta": "Request a call"
    }
  },
  "gestational": {
    "title": "Gestational diabetes",
    "heroBody": "During your pregnancy, and the test that comes after the birth: the cards that matter most with gestational diabetes, in one order.",
    "intro": {
      "eyebrow": "Your path",
      "heading": "Gestational diabetes",
      "body": {
        "1": "Gestational diabetes is high blood sugar first found during pregnancy. Diabetes Canada says it affects 3 to 20% of pregnancies and usually goes away after the birth. Screening for it is offered between 24 and 28 weeks, or earlier if you’re at higher risk.",
        "2": "It still matters after the birth. Diabetes Canada says it raises the chance of type 2 later, for you and your child, and recommends a glucose tolerance test between 6 weeks and 6 months after the birth. This path covers your pregnancy first, then the reminder for afterwards. If you had diabetes before you were pregnant, read Pregnancy with type 1 or type 2 instead."
      }
    },
    "list": {
      "heading": "Your reading list for gestational diabetes",
      "intro": "Read in order, or jump to what you need today. Some cards are only for people whose team has started insulin, and each one says so."
    },
    "funding": {
      "heading": "Funding & Coverage",
      "body": "In Ontario, the Monitoring for Health Program helps pay for a meter, test strips and lancets for people with gestational diabetes who have no other coverage for them. Other provinces and territories have their own programs. At Liivv, you pay for your supplies, then claim them from your program. Ask us what you need for the claim.",
      "cta": "See what’s covered where you live"
    },
    "pharmacist": {
      "eyebrow": "Anywhere in Canada",
      "heading": "Questions about sensors and pumps",
      "body": "Liivv’s pharmacist CDEs answer pump and CGM questions from anywhere in Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. When you need a pharmacy, they pass you to the right Liivv pharmacy. Liivv has one in every province except Quebec, and none in the territories. Questions about your pregnancy belong with your diabetes and pregnancy team.",
      "cta": "Request a call"
    }
  },
  "prediabetes": {
    "title": "Prediabetes",
    "heroBody": "What your numbers mean, and the everyday cards on food and movement.",
    "intro": {
      "eyebrow": "Your path",
      "heading": "Prediabetes",
      "body": {
        "1": "Prediabetes means your blood sugar is higher than normal, but not high enough to be called type 2 diabetes. Diabetes Canada says not everyone with prediabetes goes on to develop type 2, but many people do.",
        "2": "This path keeps to the everyday: what your numbers mean, and the cards on food and movement. Ask your doctor what your numbers mean for you, and when to test again."
      }
    },
    "list": {
      "heading": "Your prediabetes reading list",
      "intro": "A short list. Each card opens in its own chapter."
    },
    "funding": {
      "heading": "Funding & Coverage",
      "body": "Coverage for diabetes care is different in each province and territory. If you ever need it, Funding & Coverage explains the programs where you live.",
      "cta": "See the programs"
    }
  },
  "less-common-types": {
    "title": "Less common types",
    "heroBody": "LADA, MODY, and diabetes linked to the pancreas, cystic fibrosis, medicines or a transplant: what each one is, and what to ask.",
    "intro": {
      "eyebrow": "Your path",
      "heading": "When your type is less common",
      "body": {
        "1": "Most people have type 1 or type 2, but Diabetes Canada says some cases are difficult to classify. Its guideline lists other forms too. These include LADA, a type 1 that starts slowly in adults, and single-gene types such as MODY. Diabetes can also be linked to the pancreas, cystic fibrosis, iron overload or some medicines, and it can start after a transplant.",
        "2": "The right type matters, because Diabetes Canada says it may change your treatment. This path starts with the clues worth raising with your team, then gives each less common type its own card. Cards that rest on international guidance say so. Don’t stop or lower insulin because of anything here. Any change is made with your specialist."
      }
    },
    "list": {
      "heading": "Your reading list",
      "intro": "Start with the clues, then read the card for the type your team has named or is looking into."
    },
    "funding": {
      "heading": "Funding & Coverage",
      "body": "Some programs are written for a named type, such as Ontario’s pump program, which is for type 1. Others depend on your treatment, such as NIHB’s sensor coverage for people who manage diabetes with insulin, which needs prior approval. Ask your team which type is on your records. At Liivv, you pay for your supplies, then claim them from your program. Ask us what you need for the claim.",
      "cta": "See what’s covered where you live"
    },
    "pharmacist": {
      "eyebrow": "Anywhere in Canada",
      "heading": "Questions about pumps and sensors",
      "body": "Liivv’s pharmacist CDEs answer pump and CGM questions from anywhere in Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. When you need a pharmacy, they pass you to the right Liivv pharmacy. Liivv has one in every province except Quebec, and none in the territories. Questions about your type, and the tests for it, belong with your diabetes team.",
      "cta": "Request a call"
    }
  }
}
```

---

## C) READING LIST DATA

Slugs: `kyt` = know-your-type (05), `ntj` = new-to-the-journey (01), `ss` = staying-safe (02),
`yt` = your-tools (03), `edl` = every-day-living (04), `tmby` = this-might-be-you (06). Titles are
the verified titles. In code, use the full slug. The reason column is the EN message `list.reasons.<#>`.
A reason marked **(src)** states a fact. Its source is listed in D.6.
Every other reason is navigation or scope framing and has no source. Rows changed by the source check
are marked † (see H).

### C.1 `type-1` (33 entries)

| # | Stage | Slug | Card | Title | Reason |
|---|---|---|---|---|---|
| 1 | start | kyt | 1 | Type 1, including in adults | Start here: what type 1 is, and the signs your team looks for |
| 2 | start | ntj | 1 | Just been told | If you’re new to this: the first days, at your own pace |
| 3 | start | ntj | 3 | Your target ranges | The numbers your team will talk about, with a card to write yours on |
| 4 | start | ntj | 8 | Starting insulin | Pens, syringes or a pump, and why you keep fast-acting sugar with you |
| 5 | start | ntj | 10 | Your starter supply list | What to have on hand, depending on how you check and take insulin |
| 6 | safe | ss | 1 | Know your low | What counts as a low, and the three levels |
| 7 | safe | ss | 2 | The Rule of 15 | How to treat a low, step by step |
| 8 | safe | ss | 3 | Glucagon: help someone else gives | For a low when you can’t swallow. Show the people around you how yours works |
| 9 | safe | ss | 7 | Ketones: check and act | When to check, and what the numbers mean. The ladder on this card was written for type 1 (src) |
| 10 | safe | ss | 8 | Sick days | A plan to fill in with your pharmacist and team before you’re sick |
| 11 | safe | ss | 9 | On a pump: an unexplained high | If you use a pump |
| 12 † | safe | ss | 10 | Be ready for emergencies | A kit with at least one to two weeks of supplies (src) |
| 13 | safe | ss | 11 | Who to call, and when | Who to call for each ketone level, and when to call 911 |
| 14 | tools | yt | 4 | Sensors: which pairs with what | Which sensors work with which phones, readers and pumps |
| 15 | tools | yt | 5 | Wearing a sensor, and time in range | What time in range means, and the usual targets |
| 16 | tools | yt | 9 | Giving an injection, step by step | If you use pens or syringes |
| 17 | tools | yt | 10 | Choosing and moving your sites | Why you change where you inject each time |
| 18 | tools | yt | 11 | Keeping insulin safe | Storing insulin at home and when you travel |
| 19 | tools | yt | 12 | Pumps and automated insulin delivery, in plain words | Diabetes Canada’s type 1 guideline prefers automated insulin delivery for anyone willing and able to use it (src) |
| 20 | tools | yt | 13 | Your pump’s supplies: what fits | If you use a pump: the sets and reservoirs that go with it |
| 21 | tools | yt | 14 | Pump backup and set changes | A backup plan, made before you need one |
| 22 | everyday | edl | 2 | Carb counting | If you take insulin with meals, work this out with your team |
| 23 | everyday | edl | 3 | Moving your body | Exercise can lower your blood sugar for up to 48 hours afterwards (src) |
| 24 † | everyday | edl | 4 | Alcohol and cannabis | With type 1, Diabetes Canada says to avoid recreational cannabis, because it raises the risk of DKA (src) |
| 25 | everyday | edl | 5 | Distress, stress and sleep | How you’re feeling is part of your care, including fear of lows |
| 26 | everyday | edl | 7 | Driving | The checks to do before and while you drive, if you take insulin |
| 27 | everyday | edl | 9 | Your eyes | With type 1, from age 15: a yearly eye exam, starting 5 years after diagnosis (src) |
| 28 † | everyday | edl | 10 | Your kidneys | With type 1, adults start kidney screening 5 years after diagnosis. For a child, the team will say when (src) |
| 29 | season | tmby | 1 | Pregnancy with type 1 or type 2 | If you’re thinking about a pregnancy, start planning before you try |
| 30 | season | tmby | 2 | A child with type 1 | If you’re a parent: targets, lows, glucagon and tax credits for a child |
| 31 | season | tmby | 3 | Your child at school | A care plan, written before the school year starts |
| 32 † | season | kyt | 5 | Type 1 starts before symptoms | For your relatives: free type 1 antibody screening through TrialNet, anywhere in Canada, for immediate relatives aged 2 to 45 and other relatives aged 2 to 20 (src) |
| 33 † | season | tmby | 6 | First Nations, Inuit and Métis | If you’re eligible for NIHB: sensor coverage for people on insulin, and the test strips it covers (src) |

(Q8 asks whether the list should be cut.)

### C.2 `type-2` (28 entries)

| # | Stage | Slug | Card | Title | Reason |
|---|---|---|---|---|---|
| 1 | start | kyt | 2 | Type 2 | Start here: what type 2 is, and how it’s diagnosed |
| 2 | start | kyt | 6 | Could my type be different? | If your diabetes doesn’t fit the usual picture: the clues to mention to your team |
| 3 | start | ntj | 1 | Just been told | If you’re new to this: the first days, at your own pace |
| 4 | start | ntj | 3 | Your target ranges | The numbers your team will talk about, with a card to write yours on |
| 5 | start | ntj | 4 | Food and movement: first steps | Small first steps, and who can help |
| 6 | start | ntj | 6 | Do I need a meter? | Whether you check at home, and how often, depends on your treatment (src) |
| 7 | start | ntj | 7 | Your medicines and your pharmacist | Questions to take to your pharmacist about each of your medicines |
| 8 | start | ntj | 8 | Starting insulin | Diabetes Canada says many people with type 2 need insulin. If that’s you, start here (src) |
| 9 | safe | ss | 1 | Know your low | If you take insulin or a pill that can cause lows: what counts as a low |
| 10 | safe | ss | 2 | The Rule of 15 | How to treat a low, step by step |
| 11 | safe | ss | 4 | Lows that sneak up | If you take insulin or some diabetes pills, alcohol can cause a low up to 24 hours later (src) |
| 12 | safe | ss | 6 | Highs | Ketones can build up even when blood sugar is close to normal, for example with some diabetes medicines (src) |
| 13 | safe | ss | 8 | Sick days | Some medicines are paused for a short time on sick days. Your pharmacist can tell you which of yours (src) |
| 14 | safe | ss | 11 | Who to call, and when | Who to call, and when to call 911 |
| 15 | tools | yt | 1 | Choosing a meter | If your team asks you to check at home |
| 16 | tools | yt | 3 | Your meter lesson: questions to take in | Questions to ask when you learn your meter |
| 17 | tools | yt | 7 | Pen needles: length and angle | If you use an insulin pen |
| 18 | everyday | edl | 1 | Food without a rulebook | More than one way of eating works well with diabetes (src) |
| 19 | everyday | edl | 3 | Moving your body | How much activity to aim for, and how to build up to it |
| 20 | everyday | edl | 5 | Distress, stress and sleep | How you’re feeling is part of your care |
| 21 | everyday | edl | 7 | Driving | If you take insulin or a diabetes pill that can cause lows (src) |
| 22 | everyday | edl | 8 | Your feet, every day | A daily check, and when to see someone right away |
| 23 | everyday | edl | 9 | Your eyes | With type 2, an eye exam at diagnosis, then on a schedule your team sets (src) |
| 24 | everyday | edl | 10 | Your kidneys | With type 2, kidney screening starts at diagnosis (src) |
| 25 | everyday | edl | 11 | Your heart: the ABCDEs | Diabetes raises the risk of heart disease and stroke. The ABCDEs help you lower it (src) |
| 26 | season | tmby | 1 | Pregnancy with type 1 or type 2 | If you’re thinking about a pregnancy, start planning before you try |
| 27 | season | tmby | 4 | Later life | Targets that fit your health, and a close look at lows |
| 28 † | season | tmby | 6 | First Nations, Inuit and Métis | If you’re eligible for NIHB: sensor coverage for people on insulin, and the test strips it covers (src) |

### C.3 `gestational` (22 entries)

| # | Stage | Slug | Card | Title | Reason |
|---|---|---|---|---|---|
| 1 | start | kyt | 4 | Gestational, or diabetes from before pregnancy? | Start here: what gestational diabetes is, when it’s screened for, and a reminder for after the birth |
| 2 | start | ntj | 1 | Just been told | The first days, at your own pace |
| 3 † | start | ntj | 3 | Your target ranges | Targets are different in pregnancy, so write down the ones your team gives you (src) |
| 4 | start | ntj | 4 | Food and movement: first steps | Small first steps, and who can help |
| 5 † | start | ntj | 6 | Do I need a meter? | How often to check, and when, comes from your team. This card helps you ask (src) |
| 6 | start | ntj | 7 | Your medicines and your pharmacist | Questions to take to your pharmacist |
| 7 † | tools | yt | 1 | Choosing a meter | What to look for in the meter you’ll use |
| 8 | tools | yt | 3 | Your meter lesson: questions to take in | Questions to ask when you learn your meter |
| 9 | tools | ntj | 8 | Starting insulin | If your team starts you on insulin |
| 10 | tools | yt | 9 | Giving an injection, step by step | If you take insulin |
| 11 | tools | yt | 11 | Keeping insulin safe | If you take insulin: storing it at home and on the go |
| 12 | safe | ss | 1 | Know your low | If you take insulin: what counts as a low |
| 13 | safe | ss | 2 | The Rule of 15 | If you take insulin: how to treat a low |
| 14 | safe | ss | 6 | Highs | In pregnancy, ketones can build up even when blood sugar is close to normal (src) |
| 15 | safe | ss | 11 | Who to call, and when | Who to call, and when to call 911 |
| 16 | everyday | edl | 1 | Food without a rulebook | Eating that fits your culture and your tastes, with help from a dietitian |
| 17 | everyday | edl | 2 | Carb counting | How to read a label and count carbohydrate |
| 18 | everyday | edl | 3 | Moving your body | How much activity to aim for, and how to build up to it |
| 19 † | everyday | edl | 4 | Alcohol and cannabis | Diabetes Canada’s alcohol sheet says not to drink if you’re pregnant, trying to get pregnant or breastfeeding (src) |
| 20 | everyday | edl | 5 | Distress, stress and sleep | How you’re feeling is part of your care |
| 21 † | season | kyt | 8 | MODY: single-gene diabetes | International guidance from the UK lists signs of a single-gene type in pregnancy, such as a fasting blood sugar that stays between 5.5 and 8, or a close relative with diabetes. If that sounds like you, tell your team early in pregnancy (src, INTL) |
| 22 | season | edl | 11 | Your heart: the ABCDEs | Diabetes Canada says gestational diabetes raises the chance of heart disease later. This card explains the risk factors (src) |

### C.4 `prediabetes` (6 entries; no tools, no supplies, no pharmacist band)

| # | Stage | Slug | Card | Title | Reason |
|---|---|---|---|---|---|
| 1 | start | kyt | 3 | Prediabetes | Start here: the numbers that mean prediabetes |
| 2 | start | kyt | 2 | Type 2 | The numbers for diabetes, and why symptoms of high blood sugar mean contacting your doctor without waiting (src) |
| 3 | everyday | ntj | 4 | Food and movement: first steps | Small first steps, and who can help |
| 4 | everyday | edl | 1 | Food without a rulebook | More than one way of eating works well, and a dietitian can help you find yours (src) |
| 5 | everyday | edl | 3 | Moving your body | How much activity to aim for, and how to build up to it |
| 6 | season | tmby | 6 | First Nations, Inuit and Métis | For Indigenous adults with other risk factors, Diabetes Canada’s guideline suggests considering a diabetes check every 6 to 12 months (src) |

HELD entry (not shipped): `edl` 11, Your heart: the ABCDEs. It needs `dc-cpg-ch4-screening` (F.2) and ruling Q5.

No Staying Safe entries. The shared safety strip still renders (Q2).

### C.5 `less-common-types` (18 entries)

| # | Stage | Slug | Card | Title | Reason |
|---|---|---|---|---|---|
| 1 | start | kyt | 6 | Could my type be different? | Start here: the clues worth mentioning, and the tests that can help |
| 2 | types | kyt | 7 | LADA: type 1 that starts slowly in adults | A type 1 that starts slowly in adults, and is often first treated as type 2 (src) |
| 3 | types | kyt | 8 | MODY: single-gene diabetes | Single-gene diabetes that runs in families, with a family tree to fill in |
| 4 | types | kyt | 9 | Diabetes in babies | Diabetes diagnosed before 6 months of age, including for adults looking back at their diagnosis (src) |
| 5 | types | kyt | 10 | Genetic syndromes with diabetes | When diabetes comes with other health signs, such as hearing loss or vision loss (src) |
| 6 | types | kyt | 11 | Pancreas conditions and iron overload | After pancreas disease or surgery, or with hemochromatosis |
| 7 | types | kyt | 12 | Cystic fibrosis-related diabetes | Yearly screening from age 10, through your CF clinic (src) |
| 8 † | types | kyt | 13 | From medicines, or after a transplant | Diabetes linked to steroids, some antipsychotics or anti-rejection medicines, or that starts after a transplant (src). The card also covers cancer immunotherapy |
| 9 | types | kyt | 1 | Type 1, including in adults | Diabetes Canada counts LADA as type 1, so much of this card applies to LADA too (src) |
| 10 | safe | ss | 2 | The Rule of 15 | If you use insulin: how to treat a low |
| 11 † | safe | ss | 3 | Glucagon: help someone else gives | Cystic Fibrosis Canada’s guideline says people with CFRD who take insulin should be taught how to use glucagon (src) |
| 12 | safe | ss | 7 | Ketones: check and act | The signs of DKA, and when to check. The ladder was written for type 1, so ask your team which numbers to use (src) |
| 13 | safe | ss | 11 | Who to call, and when | Who to call, and when to call 911 |
| 14 | start | ntj | 7 | Your medicines and your pharmacist | Questions to take to your pharmacist, especially if a medicine raised your blood sugar |
| 15 | start | ntj | 11 | Who to ask | Your educator, your doctor, a pharmacist, and support for how you’re feeling |
| 16 | tools | yt | 1 | Choosing a meter | If your team asks you to check at home |
| 17 | tools | yt | 9 | Giving an injection, step by step | If you take insulin |
| 18 | everyday | edl | 5 | Distress, stress and sleep | Living with diabetes can feel like a burden, and you can ask for help with that (src) |

Rows 14 and 15 come after Staying Safe on purpose, so the safety cards sit straight after the type cards. If the
engine groups entries by stage rather than by row order, change their stage to `season` (Q9).

Row 8: the factual half (steroids, antipsychotics, anti-rejection medicines, transplant) is Canadian
(Appendix 2, Ch 20). "The card also covers cancer immunotherapy" is navigation: card 13 itself names its
US source for that line (ADA Standards of Care 2026, Section 2), so the path does not restate it.

---

## D) CLAIMS TABLE

Check column: **C** = confirmed by the source check of 2026-10-05 (`paths.verify.md` row in brackets).
**C\*** = reworded or narrowed to the source. **INTL** = an international source, named in the sentence.
**Owner** = owner fact of 2026-10-05. **Nav** = navigation or framing, no claim. **L** = the fact was read
on the live page but is not yet in the register locator; add the F.4 note before release.

### D.1 `type-1`

| Key | Sentence (short) | SourceId | Fact on the source | Check |
|---|---|---|---|---|
| intro.body.1 | Pancreas makes no insulin; injection or pump | dc-type-1 | Pancreas makes no insulin; injections or a pump | C (1) |
| intro.body.1 | 5 to 10% of people with diabetes | dc-type-1 | "Five to 10 percent" (the page also says "Roughly 10 per cent"); the register locator already records that the copy uses 5 to 10% | C\* (2), Q6 resolved |
| intro.body.1 | Can start in adulthood | dc-type-1 | "can also develop in adulthood" | C (3) |
| intro.body.1 | About 71% diagnosed as adults | bt1d-facts-and-figures | "~71% of individuals with T1D are diagnosed as adults" (T1D Index estimate) | C (4) |
| intro.body.2 | 2025 guideline prefers AID for anyone willing and able | dc-cpg-ch41-t1d-lifespan-2025 | AID "the preferred treatment method for all individuals" willing and able | C (5). Check the CJD addendum before release (Q15) |
| intro.body.2 | "Your team decides your plan with you" | — | Framing | Nav |
| funding.body | Type 1 meets the DTC life-sustaining therapy test, 2021 on; still apply | cra-dtc-life-sustaining-therapy; cra-rc4064-2025 | Type 1 meets the criteria for 2021 onward; a practitioner certifies on T2201 | C (6). Title confirmed: clear `UNCHECKED_TITLE` (F.4) |
| funding.body | Pump, sensor and strip help depends on where you live | dc-comparisons-by-province | Province and territory comparisons (pump and CGM documents dated 2024) | C (7) |
| funding.body | At Liivv you pay, then claim; ask us | — | No program enrolment confirmed | Owner (30) |
| pharmacist.body | CDEs, anywhere in Canada, Mon–Fri 9–5 ET except holidays; pass to the right pharmacy; pharmacies in every province except Quebec, none in the territories | — | Owner-supplied | Owner (31). Release gates in E.1 |

### D.2 `type-2`

| Key | Sentence (short) | SourceId | Fact on the source | Check |
|---|---|---|---|---|
| intro.body.1 | Most common; 90–95% in Canada | dc-type-2 | "90-95% of diabetes cases in Canada" | C (8) |
| intro.body.1 | May cause no symptoms | dc-type-2 | "some may have no symptoms at all" | C (9) |
| intro.body.1 | Many with type 2 need insulin to stay healthy | dc-getting-started-with-insulin | "All people living with type 1 diabetes and many living with type 2 need insulin to stay healthy." | C (10) |
| intro.body.1 | "Treatment is different for each person… decided with your team" | — | Framing | Nav |
| intro.body.2 | Breakthrough T1D: LADA, a type 1 that starts slowly in adults, is often first treated as type 2 | bt1d-lada | "often misdiagnosed and managed as T2D"; a form of type 1, onset over 30 | C (57, 24). Replaces the Holt ">40%" line (11, P1); the figure is HELD as H-T2-1 |
| funding.body | At Liivv you pay, then claim; ask us | — | — | Owner (30). Moved ahead of the ODB example so ODB does not read as a pay-and-claim program (13) |
| funding.body | ODB strip limit higher on insulin than on diet and activity alone | on-odb-coverage | 3,000 strips a year on insulin; 200 on diet or lifestyle alone | C (12). Title confirmed: clear `UNCHECKED_TITLE` (F.4) |
| funding.body | Each province and territory has its own rules | dc-comparisons-by-province | As D.1 | C (7) |
| pharmacist.body | CDE hours and pharmacy coverage | — | — | Owner (31) |

### D.3 `gestational`

| Key | Sentence (short) | SourceId | Fact on the source | Check |
|---|---|---|---|---|
| intro.body.1 | High blood sugar first found in pregnancy | dc-cpg-ch36-pregnancy | GDM is glucose intolerance "first recognized in pregnancy" | C\* (14) |
| intro.body.1 | 3–20% of pregnancies; usually goes after birth | dc-gestational-diabetes | "Between three to 20%… depending on their risk factors"; "usually goes away" | C (15) |
| intro.body.1 | Screening offered 24–28 weeks, or earlier at higher risk | sogc-glucose-testing; dc-cpg-ch36-pregnancy | SOGC: offered 24–28 weeks. Ch 36: early A1C before 20 weeks if high risk | C (16), the added clause per the check's suggestion |
| intro.body.2 | Raises chance of type 2 later, for you and your child | dc-gestational-diabetes | "may both have a higher risk… later in life such as type 2 diabetes and heart disease" | C (17) |
| intro.body.2 | OGTT between 6 weeks and 6 months after the birth | dc-cpg-ch36-pregnancy | Postpartum 75 g OGTT, 6 weeks to 6 months | C (18) |
| intro.body.2 | Pre-existing diabetes → Pregnancy with type 1 or type 2 | — | Navigation | Nav |
| funding.body | Ontario Monitoring for Health helps pay for meter, strips and lancets with GDM, if no other coverage | dc-ontario-monitoring-for-health; on-preventing-and-living-with-diabetes | For insulin users and gestational diabetes; limited to people with no other funding for these supplies; a pay-and-claim program (receipts and claim form by mail) | C\* (19), L. Titles confirmed: clear `UNCHECKED_TITLE` on both (F.4) |
| funding.body | Other provinces and territories have their own programs | dc-comparisons-by-province | As D.1 | C (7) |
| funding.body / pharmacist.body | Pay and claim; CDE hours | — | — | Owner (30, 31) |

### D.4 `prediabetes`

| Key | Sentence (short) | SourceId | Fact on the source | Check |
|---|---|---|---|---|
| intro.body.1 | Higher than normal, not high enough for type 2 | dc-prediabetes; dc-cpg-ch3-classification-diagnosis | "higher than normal, but are not yet high enough to be diagnosed as type 2 diabetes" | C (20) |
| intro.body.1 | Not everyone goes on to type 2, but many do | dc-prediabetes | "Although not everyone with prediabetes will develop type 2 diabetes, many people will." | C (21) |
| intro.body.2 | "Ask your doctor what your numbers mean… when to test again" | — | Same wording as the kyt 3 note | Nav |
| funding.body | Coverage differs by province and territory | dc-comparisons-by-province | As D.1 | C (7) |

### D.5 `less-common-types`

| Key | Sentence (short) | SourceId | Fact on the source | Check |
|---|---|---|---|---|
| intro.body.1 | Some cases are difficult to classify | dc-cpg-ch3-classification-diagnosis | Verbatim | C (22) |
| intro.body.1 | Guideline lists LADA (a type 1) and single-gene types such as MODY | dc-cpg-ch3-classification-diagnosis | LADA under type 1; monogenic diabetes described | C (23) |
| intro.body.1 | "a type 1 that starts slowly in adults" | bt1d-lada | "a form of type 1 diabetes"; ">30 years"; autoimmune process "happens more slowly" | C\* (24) |
| intro.body.1 | Linked to the pancreas, cystic fibrosis, iron overload or some medicines | dc-cpg-appendix-2-classification | Exocrine pancreas incl. CF and hemochromatosis; glucocorticoids, atypical antipsychotics, calcineurin inhibitors | C (25) |
| intro.body.1 | Can start after a transplant | dc-cpg-ch20-transplantation | Post-transplant diabetes | C (26) |
| intro.body.2 | Right type may change your treatment | dc-cpg-ch3-classification-diagnosis | "may alter management" | C (27) |
| intro.body.2 | "Cards that rest on international guidance say so" | — | kyt cards 7–10 carry the badge; mixed cards name the source in the sentence (K11) | Nav |
| intro.body.2 | Don't stop or lower insulin; change with your specialist | — | Safety framing, states no fact. Its earlier basis, `holt-t1d-adults-consensus-2021`, is superseded (P1); repoint the basis to F.3 once registered | Safety framing |
| funding.body | Ontario pump program is for type 1 | on-diabetes-equipment-and-supplies; on-adp-insulin-pumps | "If you have type 1 diabetes and meet the specific medical eligibility criteria…"; not income-tested | C (28). Printed H1 is "Diabetes equipment and supplies": relabel `on-adp-insulin-pumps` or merge it into `on-diabetes-equipment-and-supplies` (F.4) |
| funding.body | NIHB sensor coverage for people managing diabetes with insulin, with prior approval | isc-nihb-updates | CGM a "limited use benefit for clients managing diabetes with insulin. Prior approval is required" | C\* (29), L |
| funding.body | "Ask your team which type is on your records" | — | Advice | Nav, Q7 |
| funding.body / pharmacist.body | Pay and claim; CDE hours | — | — | Owner (30, 31) |

### D.6 Reasons that state a fact ("src" in C)

| Path · # | Fact | SourceId | Check |
|---|---|---|---|
| type-1 · 9; less-common · 12 | Ketone ladder written for type 1 | bt1d-dka-and-ketones | C (32) |
| type-1 · 12 | Emergency kit, at least one to two weeks | dc-managing-emergency-situations | C\* (33): "at least" added |
| type-1 · 19 | AID preferred, willing and able | dc-cpg-ch41-t1d-lifespan-2025 | C (34) |
| type-1 · 23 | Exercise lowers blood sugar up to 48 h | dc-exercise-and-activity | C (35) |
| type-1 · 24 | Type 1: avoid recreational cannabis, DKA risk | dc-cannabis-position-2020 | C\* (36): "recreational" added |
| type-1 · 27; type-2 · 23 | Eye exam schedule by type | dc-cpg-ch30-retinopathy | C (37, 48) |
| type-1 · 28 | Type 1 adults: kidney screening from 5 years after diagnosis; for children the team says when | dc-cpg-ch29-ckd-2025; dc-kidney-disease | C\* (38), L (the after-puberty rule for children) |
| type-2 · 24 | Type 2 kidney screening at diagnosis | dc-cpg-ch29-ckd-2025; dc-kidney-disease | C (49) |
| type-1 · 32 | TrialNet free, anywhere in Canada, with age limits | bt1d-trialnet | C\* (39): ages from the locator. Recheck the page before release (© 2024, no review date) |
| type-1 · 33; type-2 · 28 | NIHB: CGM for people on insulin; strips also covered (not insulin-only) | isc-nihb-updates | C\* (40): no longer implies strips are insulin-only |
| type-2 · 6 | Checking depends on treatment | dc-cpg-ch9-monitoring-2021; dc-checking-blood-sugar | C (41) |
| gestational · 5 | How often and when to check comes from your team | dc-checking-blood-sugar; dc-cpg-ch36-pregnancy | C\* (41): "whether" dropped, per nurse view |
| type-2 · 8 | Many with type 2 need insulin | dc-getting-started-with-insulin | C (42) |
| type-2 · 11 | Alcohol lows up to 24 h on insulin or some pills | dc-alcohol-and-diabetes-2018; dc-cpg-ch11-nutrition-therapy | C (43) |
| type-2 · 12; gestational · 14 | Ketones with near-normal sugar: some medicines, pregnancy | dc-cpg-ch15-hyperglycemic-emergencies | C (44) |
| type-2 · 13 | Some medicines paused on sick days; pharmacist says which | dc-stay-safe-sick-days-sheet | C (45) |
| type-2 · 18; prediabetes · 4 | More than one way of eating; dietitian | dc-cpg-ch11-nutrition-therapy | C (46) |
| type-2 · 21 | Driving card scope: insulin or a pill that can cause lows | dc-cpg-ch21-driving; dc-drive-safe-card | C (47) |
| type-2 · 25 | Higher heart and stroke risk | dc-heart-disease-and-stroke | C (50) |
| gestational · 3 | Targets different in pregnancy | dc-cpg-ch36-pregnancy | C\* (51): `dc-cpg-ch8-targets` removed |
| gestational · 19 | Don't drink if pregnant, trying to get pregnant or breastfeeding | dc-alcohol-and-diabetes-2018 | C (52), wording widened to the sheet |
| gestational · 21 | UK guidance lists signs of GCK-MODY in pregnancy, including persistent fasting 5.5–8 and a close relative with diabetes; tell your team early | exeter-gck-pregnancy-2018 | C\* (53), INTL, named in the sentence ("from the UK"). Signs given as separate features, not a combined rule. L: the locator says "with a family history"; correct it to separate features (F.4) |
| gestational · 22 | GDM raises later heart disease risk | dc-gestational-diabetes | C (54) |
| prediabetes · 2 | With symptoms, contact doctor without waiting | dc-cpg-ch3-classification-diagnosis | C (55) |
| prediabetes · 6 | Indigenous adults with risk factors: consider a check every 6–12 months | dc-cpg-ch38-indigenous | C (56) |
| less-common · 2 | LADA often first treated as type 2 | bt1d-lada; diabetes-uk-lada | C (57) |
| less-common · 4 | Diagnosed before 6 months; adults' diagnosis reviewed | dc-cpg-ch3-classification-diagnosis | C (58) |
| less-common · 5 | Syndromes with hearing or vision loss | ispad-2022-ch4-monogenic | C (59). The card carries the INTL badge |
| less-common · 7 | CFRD yearly screening from 10 via CF clinic | cf-canada-cfrd-guideline-2024 | C (60) |
| less-common · 8 | Steroids, antipsychotics, anti-rejection medicines (calcineurin inhibitors); after a transplant | dc-cpg-appendix-2-classification; dc-cpg-ch20-transplantation | C\* (64): now marked (src). Immunotherapy is named only as card navigation; its source on card 13 is ada-soc-2026-s2-summary (INTL, named on the card) |
| less-common · 9 | LADA counted as type 1 | dc-cpg-ch3-classification-diagnosis | C (61) |
| less-common · 11 | CF Canada: people with CFRD on insulin should be taught to use glucagon | cf-canada-cfrd-guideline-2024 | C\* (62): no longer says every person is prescribed glucagon. L (Rec IV education wording) |
| less-common · 18 | Diabetes can feel like a burden | dc-taking-care-of-mental-health | C (63) |

---

## E) HELD ITEMS

### E.1 On hold by policy (placements and Liivv programs), and release gates

| Item | Where it would go | Status |
|---|---|---|
| ~~Type-fitting **shop strip**~~ | Slot 5 in A.1 | Built 2026-10-06 (B21; H.7). **Never on `prediabetes`** |
| Starter kits (Tandem, mylife, Omnipod, Dexcom G7, Sick-Day Ready, meter starters) | Same slot, after owner sign-off of each kit | ON HOLD |
| "Programs Liivv bills directly" in the Funding door | `funding.body`, ahead of the pay-and-claim sentence | Shown only once Liivv is enrolled with a program. None confirmed |
| Pay-later for pump supplies | Funding door on `type-1` and `less-common-types` | PROPOSED ONLY, not shown |
| Pharmacist CDE phone number ("Call a pharmacist CDE") | `pharmacist.cta` | Not confirmed. "Request a call" only |
| **Release gate 1:** request reason "Pump or CGM question (pharmacist CDE)" | `pharmacistHref` → `/account/virtual-care/appointment` | The band does not render until this reason exists on the appointment form (P6) |
| **Release gate 2:** owner confirms the band's wording | `pharmacist.body` on all four paths | Owner confirms (a) every pharmacist answering holds a current CDE, otherwise use "pharmacists with diabetes training"; (b) how callers in Quebec and the territories are served, and that cross-province advice is within each provincial licence (P5; Q16, Q17) |

### E.2 Held for sourcing

| ID | Path · key | Proposed wording | Why held | Needs |
|---|---|---|---|---|
| H-P1 · **ruled 2026-10-06 ([C38](clinical-rulings-2026-10-06.md#c38))** | prediabetes · intro.body.2, before the final sentence | "Diabetes Canada’s guideline says healthy changes that lead to a loss of 5% of your starting weight can delay or prevent type 2. A registered dietitian and regular activity can help." | Source not in the register. The source check confirmed the wording verbatim (66) | Register `dc-cpg-ch5-reducing-risk` (F.1). Nurse: present as one option, not an instruction, and keep the dietitian line |
| H-P2 | prediabetes · intro | Any "almost 60%" risk-reduction figure | Trial-population figure for structured programmes; not a personal promise (67) | Recommend leaving it out permanently |
| H-P3 · **ruled 2026-10-06 ([C38](clinical-rulings-2026-10-06.md#c38))** | prediabetes · C.4 extra entry, `edl` 11 | "Diabetes Canada says prediabetes also raises the risk of heart disease. This card explains the risk factors." | Source not in the register; the card is written for people with diabetes | `dc-cpg-ch4-screening` (F.2), Q5 |
| H-G1 · **ruled 2026-10-06 ([C28](clinical-rulings-2026-10-06.md#c28))** | gestational · intro | "It’s managed first with healthy eating and activity. Some people also need medicine, such as insulin." | Reworded to Ch 36 ("insulin or metformin"), without naming a drug other than insulin (69) | Add the Ch 36 treatment passage to its locator (F.4). No new SourceId. Then it can ship |
| H-G2 · **ruled 2026-10-06 ([C28](clinical-rulings-2026-10-06.md#c28))** | gestational · C.3 rows 9–13 (insulin, if started) | Reasons are conditional ("If your team starts you on insulin"), so they ship | Conditional navigation, not a claim. H-G1 would back it | — |
| H-T1 | type-1 · intro | "About 300,000 Canadians have type 1" | Confirmed (70), not used: one statistic per paragraph is enough | Release on request |
| H-T2-1 | type-2 · intro.body.2 (would replace the BT1D sentence) | "An international consensus says about 40% of people who develop type 1 after age 30 are first treated as type 2." | The 2021 ADA/EASD report is superseded by the 2026 update, which could not be read directly (paywall); its figure is known only from secondary coverage (11, P1) | Register F.3 after a direct read, and match its wording. The BT1D line ships meanwhile |
| H-T2-2 | type-2 · funding.body, after the ODB example | "The Ontario Drug Benefit is usually billed at the pharmacy, and you pay a small co-pay." | The source check read the co-pay and receipt route on the ODB page (13), but neither is in the locator. It also needs the owner's view, because Liivv is not confirmed as an ODB biller | F.4 locator note, then owner ruling (Q18) |
| H-L1 · **ruled 2026-10-06 ([C34](clinical-rulings-2026-10-06.md#c34))** | less-common · intro | The name "type 3c" | kyt K20: only FAIL or unverified sources use it | As kyt E |

---

## F) REGISTER ADDITIONS (proposed; not in `sources-meta.ts`)

### F.1 `dc-cpg-ch5-reducing-risk` (Canadian guideline) · registered 2026-10-06 ([C38](clinical-rulings-2026-10-06.md#c38))

- **URL:** https://www.diabetes.ca/for-professionals/full-guidelines/chapter-5
- **Publisher:** Diabetes Canada, Clinical Practice Guidelines (Diabetes Canada Clinical Practice Guidelines Expert Committee)
- **Title as printed:** "Reducing the Risk of Developing Diabetes" (confirmed by the source check, 65)
- **Authors and date:** Prebtani APH, Bajaj HS, Goldenberg R, Mullan Y. *Can J Diabetes* 2018;42(Suppl 1). The page range (S20–S26 from the Ch 4 cross-reference) still needs confirming from CJD.
- **hrefLang:** en
- **Facts it would back (confirmed verbatim by the source check, 66–67):**
  - "a loss of 5% of your initial body weight can delay or prevent type 2 diabetes from developing" (H-P1)
  - "A registered dietitian can educate you about dietary changes that may help reduce your risk"
  - "Regular physical activity is also important to reduce your risk of diabetes"
  - Not used: medication if behaviour change isn't enough (out of retail scope).
  - Not used: structured interventions reduce progression "by almost 60%" (H-P2).
- **`sources-review.ts` entry:** `type: 'canadian-guideline'`. Locator: the paraphrase above, plus "2018; no newer version checked".

### F.2 `dc-cpg-ch4-screening` (Canadian guideline) · registered 2026-10-06 ([C38](clinical-rulings-2026-10-06.md#c38))

- **URL:** https://www.diabetes.ca/for-professionals/full-guidelines/chapter-4
- **Publisher:** Diabetes Canada, Clinical Practice Guidelines
- **Title as printed:** "Screening for Diabetes in Adults" (confirmed, 68)
- **Authors and date:** Ekoe J-M, Goldenberg R, Katz P. *Can J Diabetes* 2018;42(Suppl 1). Confirm the page range.
- **hrefLang:** en
- **Facts it would back (quotes confirmed verbatim, 68):**
  - People with prediabetes, "especially those with IGT or an A1C of 6.0% to 6.4%, not only are at increased risk of developing type 2 diabetes, but also have an increased risk of CV complications" and "would benefit from CV risk factor reduction strategies" (H-P3)
- **`sources-review.ts` entry:** `type: 'canadian-guideline'`.

### F.3 `ada-easd-t1d-adults-consensus-2026` (international guideline; replaces `holt-t1d-adults-consensus-2021`)

- **URL:** https://doi.org/10.1007/s00125-026-06833-z (Diabetologia; also published in Diabetes Care)
- **Publisher:** American Diabetes Association and European Association for the Study of Diabetes
- **Title as printed (from the publisher's listing):** "The management of type 1 diabetes in adults. The updated 2026 consensus report by the American Diabetes Association (ADA) and the European Association for the Study of Diabetes (EASD)"
- **Date:** published 2026-09-15 (per the source check). Authors to record on direct read.
- **hrefLang:** en
- **Facts it would back:** NOT YET RECORDED. Springer redirects to a sign-in, so the text could not be
  read on 2026-10-05. Secondary coverage gives "approximately 40%" of type 1 after 30 first treated as
  type 2; this must be read in the report itself before H-T2-1 ships. Also re-read, before any kyt card
  re-cites to it: the diagnostic clues and antibody order (kyt 6), C-peptide before stopping insulin
  (the safety basis for kyt 6/8/9 notes and the less-common intro line), and checkpoint-inhibitor
  diabetes with DKA (kyt 13). The 2026 report adds a diagnostic algorithm that starts with islet
  autoantibodies, which may change kyt 6.
- **`sources-review.ts` entry:** `type: 'international-guideline'`. Mark `holt-t1d-adults-consensus-2021` as superseded in its locator.
- **Dependent lines:** H-T2-1 (HELD). Nothing in this file's JSON depends on it.

### F.4 Locator notes for sources already registered (no new SourceId; repo edit to `sources-review.ts`)

| SourceId | Add or change | Backs |
|---|---|---|
| dc-ontario-monitoring-for-health; on-preventing-and-living-with-diabetes | Only for people with no other funding for these supplies; mail receipts and a claim form, prescriber signature the first time; about 8 weeks. Title confirmed: remove `UNCHECKED_TITLE` | gestational funding.body |
| on-odb-coverage | Receipt route (ODB Receipt Submission Form); co-pay up to $6.11 for seniors after a $100 deductible, up to $2 for others; reimbursed at the ODB amount less the co-pay. Title confirmed: remove `UNCHECKED_TITLE` | H-T2-2 |
| cra-dtc-life-sustaining-therapy | Title confirmed ("Life-sustaining therapy eligibility"): remove `UNCHECKED_TITLE` | type-1 funding.body |
| on-adp-insulin-pumps | Printed H1 is "Diabetes equipment and supplies": change the label, and decide whether to merge with `on-diabetes-equipment-and-supplies` (same title, other URL). Note that ADP now also covers rtCGM for type 1 under medical criteria. Remove `UNCHECKED_TITLE` | less-common funding.body |
| isc-nihb-updates | "limited use benefit for clients managing diabetes with insulin. Prior approval is required"; both provider billing and client reimbursement exist | less-common funding.body; type-1 · 33, type-2 · 28 |
| dc-cpg-ch29-ckd-2025 | Type 1: 5 years after onset, or after puberty if onset was earlier | type-1 · 28 |
| dc-cpg-ch36-pregnancy | "First-line therapy consists of diet and physical activity. If glycemic targets are not met, insulin or metformin can then be used." | H-G1 |
| exeter-gck-pregnancy-2018 | Persistent fasting 5.5–8 and family history are separate listed features, not one combined rule | gestational · 21 |
| cf-canada-cfrd-guideline-2024 | Rec IV: education covers handling hypoglycemia "including the use of glucagon for insulin-treated individuals"; Rec II covers hospital access only | less-common · 11 |
| dc-cpg-ch41-t1d-lifespan-2025 | CJD 2025;49(1):5–18, doi 10.1016/j.jcjd.2025.01.001; an addendum exists (S1499-2671(25)00089-9) | type-1 intro.body.2, type-1 · 19 |
| holt-t1d-adults-consensus-2021 | Superseded by F.3 (2026-09-15) | — |

---

## G) OPEN QUESTIONS

Resolved by the source check: **Q6** (type 1 share: "5 to 10%", as the register locator and New to the
Journey already use) and **Q11** (all five printed titles confirmed; see F.4).

| # | Question | Default used |
|---|---|---|
| Q1 | **Funding page not built yet.** Every door links to `/liivv-health/diabetes-care/funding` (phase 3). If the paths ship first, should the door point to Diabetes Canada's province comparisons for now (its pump and CGM documents are dated 2024, so it would need a date note), or be hidden? | Door renders only once `/funding` exists. Otherwise hidden |
| Q2 · **ruled 2026-10-06 ([C28](clinical-rulings-2026-10-06.md#c28))** | **Safety on Prediabetes.** Is the shared red-flags strip enough, or should Staying Safe card 6 (Highs) be listed too? | Strip only |
| Q3 | **Prediabetes Funding door and pharmacist band.** The door makes no supply claim. Drop it? The band is left off because CDEs answer pump and CGM questions | Door kept (neutral). Band dropped |
| Q4 | **Ontario examples on national pages.** The Type 2 and Gestational doors use Ontario examples, labelled. OK, or generic until the checker is live? | Ontario examples, labelled |
| Q5 · **ruled 2026-10-06 ([C38](clinical-rulings-2026-10-06.md#c38))** | **Prediabetes and the heart card** (H-P3). Release with F.2's line, or leave out? | Left out (HELD) |
| Q7 · **ruled 2026-10-06 ([C38](clinical-rulings-2026-10-06.md#c38))** | **"Ask your team which type is on your records"** (less-common door). Useful, or could it make people anxious? | Kept |
| Q8 | **List length.** Type 1 has 33 entries, Type 2 has 28. Cap at about 20 with "More cards for type 1"? Safety entries would never go behind it | Full list, grouped by stage |
| Q9 | **Order vs stage grouping** on Less common types, rows 14–15. | Row order |
| Q10 | **Hero images.** `less-common-types` has none; the old path images are placeholders. | Reuse `chapter-journey.png` |
| Q12 · **ruled 2026-10-06 ([C28](clinical-rulings-2026-10-06.md#c28))** | **Gestational and insulin** (H-G1, H-G2). Should the nurse confirm the insulin rows belong on this path? | Shipped, conditional |
| Q13 | **Retire old copy.** `PATH_CHAPTERS` in `chapters-data.ts` has unsourced framing ("pump-adjacent shopables", "CarePack", "Olivia", "Available in Ontario"). Confirm nothing else links to the old card titles. | Replace wholesale |
| Q14 | **New URL in the sitemap and nav.** `less-common-types` needs entries in `liivv-health-sitemap.xml`, the landing's "Which diabetes?" chips, and the five-path rail. | Listed, not done |
| Q15 | **Ch 41 addendum.** CJD has published an addendum to the 2025 type 1 chapter. Does it change the AID line? | Line ships; check before release |
| Q16 | **CDE credential (owner).** Does every pharmacist answering hold a current CDE? If not, use "pharmacists with diabetes training". | "pharmacist CDEs", gated (E.1) |
| Q17 | **Callers outside Liivv's provinces (owner).** The band now says there is no Liivv pharmacy in Quebec or the territories. What happens when someone there requests a call, and is cross-province advice within each provincial licence? | Band gated (E.1) |
| Q18 | **ODB co-pay line (owner).** Release H-T2-2 ("usually billed at the pharmacy… co-pay") alongside the owner's pay-and-claim rule, or leave ODB as a strip-limit example only? | Strip-limit example only; pay-and-claim sentence moved first |
| Q19 | **Pharmacist band on Gestational.** The owner's scope is pump and CGM questions, but most people with GDM use a meter. Keep the band (heading now "sensors and pumps"), widen the scope to meters and supplies if the owner confirms, or drop it from Gestational? | Kept, heading matched to scope |
| Q20 · **ruled 2026-10-06 ([C41](clinical-rulings-2026-10-06.md#c41))** | **Know Your Type card 1 still says "about 10%".** This path now uses "5 to 10%". Change kyt 1.items.1 to match? | Flagged for the kyt file |
| Q21 | **Holt re-cite across kyt.** kyt 6, 7, 8, 9 and 13 cite `holt-t1d-adults-consensus-2021`. Re-cite after F.3 is read and registered. | Not done in this file |

---

## H) CHANGE LOG (from `paths.verify.md`, 2026-10-05)

| Verify row / problem | Was | Now |
|---|---|---|
| 2 (Partly), Q6 | T1 intro: "about 10%" | "5 to 10%", matching the register locator and New to the Journey. Q6 resolved; Q20 raised for kyt 1 |
| 5 (Confirmed, note) | — | CJD addendum added as Q15; Ch 41 locator note in F.4 |
| 6, 12, 19, 28 (UT titles), P8 | Q11 open; doors flagged UT | Q11 resolved. Locator and title fixes listed in F.4 |
| 7, P7 | Q1 fallback with no date caveat | Q1 notes the 2024 date of the pump and CGM documents |
| 11 (Not confirmed, stale), P1 | T2 intro: "An international consensus found that more than 40%…" (Holt 2021) | Replaced by a Canadian source: "Breakthrough T1D says LADA, a type 1 that starts slowly in adults, is often first treated as type 2" (bt1d-lada). The 40% figure is HELD (H-T2-1) pending F.3. Ground rules now list one international sentence, not two |
| 11, P1 (less-common safety line) | Basis: Holt 2021 | Marked as safety framing with no fact; basis to repoint to F.3. Q21 raised for kyt |
| 13 (Partly), P2 | T2 door: ODB example ran into "At Liivv, you pay… then claim" | Pay-and-claim sentence moved first, so ODB isn't presented as a pay-and-claim program. Co-pay line HELD (H-T2-2, Q18) |
| 16 (Confirmed, suggestion) | "Screening… between 24 and 28 weeks." | Adds "or earlier if you’re at higher risk" (sogc + Ch 36 locator) |
| 19 (Partly), P2 | GDM door: MfH helps "for people with gestational diabetes" | Adds "who have no other coverage for them". Locator note in F.4 |
| 28 (Confirmed, title) | Cited `on-adp-insulin-pumps` only | Cites `on-diabetes-equipment-and-supplies` too; relabel or merge in F.4 |
| 29 (Confirmed, note), P2 | LC door: NIHB sensor coverage | Adds "which needs prior approval" |
| 33 (Partly), P4 | T1·12: "one to two weeks" | "at least one to two weeks" |
| 36 (Partly), P3 | T1·24: "avoid cannabis" | "avoid recreational cannabis" |
| 38 (Partly), P3 | T1·28: "starts 5 years after diagnosis" | "adults start… 5 years after diagnosis. For a child, the team will say when" |
| 39 (Partly), P4 | T1·32: TrialNet "anywhere in Canada" | Adds the age limits (immediate relatives 2–45, others 2–20). Recheck before release |
| 40 (Confirmed, note) | T1·33, T2·28: "the sensors and test strips it covers for people on insulin" | "sensor coverage for people on insulin, and the test strips it covers", so strips don't read as insulin-only |
| 41 (Partly, GDM), P3 | GDM·5: "Whether you check at home depends on your treatment" | "How often to check, and when, comes from your team." GDM·7 reworded to match ("What to look for in the meter you’ll use") |
| 51 (Partly), P4 | GDM·3 cited Ch 36 and Ch 8 | Ch 36 only |
| 52 (Confirmed, suggestion) | GDM·19: "pregnant or breastfeeding" | "pregnant, trying to get pregnant or breastfeeding" |
| 53 (Partly), P3 | GDM·21: fasting 5.5–8 "with diabetes in the family, can point to a single-gene type" | Names "guidance from the UK", lists the features separately ("such as… or…"); keeps "tell your team"; no management advice |
| 62 (Partly), P3 | LC·11: CF Canada "recommends glucagon, and teaching" | "says people with CFRD who take insulin should be taught how to use glucagon" |
| 64 (Partly), P4 | LC·8: unmarked, listed cancer immunotherapy | Marked (src) on the Canadian part (App. 2, Ch 20, adding anti-rejection medicines); immunotherapy kept as card navigation only |
| 66 (Confirmed) | F.1 "re-read before registering" | F.1 facts recorded as confirmed verbatim; H-P1 reworded slightly (two sentences); nurse framing note kept |
| 69 (Partly), P3 | H-G1: "some people also need insulin" | "Some people also need medicine, such as insulin." Releasable once the Ch 36 locator note is added |
| P5 | Headings "Questions about sensors and supplies" / "your supplies" over a pump-and-CGM body; "for all of Canada… pass you to the right Liivv pharmacy" | Headings now "pumps and sensors" on every path; body says where Liivv has pharmacies (every province except Quebec, none in the territories). CDE credential and out-of-province handling are owner gates (E.1, Q16, Q17); GDM band placement is Q19 |
| P6 | Request-reason noted as a plan item | Now a release gate: the band doesn't render until the appointment form has the reason |
| P9 | — | No change needed |

### H.2 Build, 2026-10-06

Built into the repo (`DiabetesCare.paths`, `DiabetesCare.ui.path`, `diabetes-care/chapters/paths-meta.ts`, renderer in
`_microsite/paths`). The English in section B, the reasons in section C and the shared keys in A.3 are in `en.json`
verbatim; no wording was changed. French is a machine-translation draft (gate `paths`). What the build changed or
decided:

| Item | Record | As built |
|---|---|---|
| LC·2 sources | `bt1d-lada`; `diabetes-uk-lada` (D.6) | `bt1d-lada` only. The reason does not name Diabetes UK, and an international source is cited only where the sentence names it (ground rules). New question P1 in the review pack covers LC·5, which rests only on ISPAD |
| Q1 Funding door | Hidden until `/funding` exists | `/funding` exists (built 2026-10-06), so every door renders and links to it. Settled |
| Q13 old copy | Replace wholesale | `chapters-data.ts`, `chapter-page.tsx` and `chapter-page.css` deleted; nothing else in core/ used them. Settled |
| Q14 new URL | Listed, not done | `less-common-types` in the sitemap (EN), the five-path rail and the header menu. The landing chips still open KYT cards (LAND D12). Settled |
| Pharmacist band | Renders once E.1 gates are met | Held by `cdeBand` (gate 2) and `cdeRequestReason` (gate 1); its words are not sent to the browser while held |
| Disclaimer | None given | The governance block carries Know Your Type's disclaimer |
| Hero button | None given | One button, labelled with `list.heading`, jumps to the list |
| Q9 order | Row order | Row order: LC rows 14–15 sit under a second "Start here" heading |
| Hub | Redirect to `#which-diabetes` | Permanent redirect, EN and `/fr` (next.config.ts) |
| Owner pay-and-claim | Owner fact 30 | Shipped as written; new question P2 asks whether to match the Funding page, which promises no claim route (FUND D-1) |

### H.3 Changes after the full-site review (2026-10-06)

Continues the change log above. Review files: `review3/` (browser QA, link crawl, clinical).

| # | Key | Was | Now | Why |
|---|---|---|---|---|
| H3-1 | `paths.{type-1,type-2,gestational,less-common-types}.funding.body` (EN and FR) | "At Liivv, you pay for your supplies, then claim them from your program. Ask us what you need for the claim." | "At Liivv, you pay for your order yourself. Some programs pay you back from a receipt, and others pay only the pharmacy or supplier directly. Check how yours pays before you order, or ask us." (FR: "Chez Liivv, vous payez votre commande vous-même. Certains programmes vous remboursent sur présentation d’un reçu, et d’autres ne paient que la pharmacie ou le fournisseur directement. Vérifiez comment le vôtre paie avant de commander, ou posez-nous la question.") | Clinical S1: a claim-route promise. `nb-insulin-pump-program`: "NBIPP clients cannot obtain their supplies through community pharmacies"; ON ADP pays registered vendors only. The new sentence is the Funding page's verified `ui.fundingPage.directEmpty`, word for word. Each door's `fundingSources` gains `dc-ontario-monitoring-for-health` (pays from receipts) and `nb-insulin-pump-program` (vendor only), where not already cited. P2 updated; the owner can still reword (OPEN-QUESTIONS B13) |
| H3-2 | `paths.gestational.list.reasons.21` (EN and FR) | "International guidance from the UK lists signs of a single-gene type in pregnancy, such as a fasting blood sugar that stays between 5.5 and 8, or a close relative with diabetes. …" | "International guidance from the UK says a steady fasting blood sugar of 5.5 to 8 mmol/L, with diabetes in the family, can point to a single-gene type. If that sounds like you, tell your team early in pregnancy" | Clinical S2: no unit, and "or" made family history alone read as a sign. Now Know Your Type 4.items.7's verified wording of the same source (`exeter-gck-pregnancy-2018`). The row still opens KYT card 8 (MODY, where 8.items.10 covers GCK in pregnancy): card 4 is already row 1 of this list, and a list opens each card once |
| H3-3 | `paths.type-1.list.reasons.14` (EN and FR) | "Which sensors work with which phones, readers and pumps" | "Which sensors work with which pumps, as each maker’s Canadian site lists them" | Clinical S2: Your Tools card 4 covers sensor–pump pairings only, from the makers' Canadian sites (`device-pairings.ts`) |

Not changed, now owner questions: LC·11 glucagon wording (OPEN-QUESTIONS C43); the second "Start here" on Less common types (B26, with the reviewer's "Getting set up").

### H.4 Clinical rulings applied: targets, types and other (2026-10-06)

From [the clinical rulings record](clinical-rulings-2026-10-06.md), rulings C16–C45 (the verifier's final copy; where a choice was left to the owner, the stated default). Applied in `core/messages/{en,fr}.json` (`DiabetesCare` only), `paths-meta.ts` and `sources-meta.ts` / `sources-review.ts`. Sections B–F above still show the earlier wording; the keys below are current. All French is machine-drafted and awaits the francophone review.

| # | Key or place | Change | Ruling |
|---|---|---|---|
| 1 | `gestational.intro.body.1` | EN "Gestational diabetes is high blood sugar first found during pregnancy. Diabetes Canada says it affects 3 to 20% of pregnancies and usually goes away after the birth. Screening for it is offered between 24 and 28 weeks, or earlier if you’re at higher risk." → "Gestational diabetes is high blood sugar first found during pregnancy. Diabetes Canada says it affects 3 to 20% of pregnancies and usually goes away after the birth. Screening for it is offered between 24 and 28 weeks, or earlier if you’re at higher risk. Many people manage it with healthy eating and activity. Some also need medicine, such as insulin." · FR → "Le diabète gestationnel est une glycémie élevée découverte pour la première fois pendant la grossesse. Selon Diabète Canada, il touche de 3 à 20 % des grossesses et disparaît habituellement après l’accouchement. Le dépistage est offert entre la 24e et la 28e semaine, ou plus tôt si votre risque est plus élevé. Beaucoup de personnes la gèrent par une saine alimentation et l’activité physique. Certaines ont aussi besoin d’un médicament, comme l’insuline." | [C28](clinical-rulings-2026-10-06.md#c28) |
| 2 | `prediabetes.intro.body.2` | EN "This path keeps to the everyday: what your numbers mean, and the cards on food and movement. Ask your doctor what your numbers mean for you, and when to test again." → "This path keeps to the everyday: what your numbers mean, and the cards on food and movement. If losing weight is right for you, Diabetes Canada says healthy changes that lead to a loss of 5% of your starting weight can delay or prevent type 2. Regular activity also lowers your risk, and a registered dietitian can help you find changes that suit you. Ask your doctor what your numbers mean for you, and when to test again." · FR → "Ce parcours s’en tient au quotidien : ce que vos chiffres veulent dire, et les fiches sur l’alimentation et l’activité physique. Si perdre du poids vous convient, Diabète Canada indique que de saines habitudes menant à une perte de 5 % de votre poids de départ peuvent retarder ou prévenir le diabète de type 2. L’activité physique régulière réduit aussi le risque, et une diététiste peut vous aider à trouver des changements qui vous conviennent. Demandez à votre médecin ce que vos chiffres signifient pour vous, et quand refaire un test." | [C38](clinical-rulings-2026-10-06.md#c38) |
| 3 | `prediabetes.list.reasons.7` | New: EN "Diabetes Canada says some complications of diabetes, such as heart disease, may begin during prediabetes. This card is written for people with diabetes, so ask your doctor which parts apply to you" · FR "Diabète Canada indique que certaines complications du diabète, comme les maladies du cœur, peuvent commencer dès le prédiabète. Cette fiche s’adresse aux personnes diabétiques : demandez à votre médecin quelles parties s’appliquent à vous" | [C38](clinical-rulings-2026-10-06.md#c38) |
| 4 | `type-1.intro.body.1` | EN "With type 1, your pancreas makes no insulin, so you take insulin by injection or with a pump. Diabetes Canada says 5 to 10% of people with diabetes have type 1, and it can start in adulthood too. Breakthrough T1D says about 71% of Canadians with type 1 were diagnosed as adults." → "With type 1, your pancreas makes no insulin, so you take insulin by injection or with a pump. Diabetes Canada says 5 to 10% of people with diabetes have type 1, and it can start in adulthood too. Breakthrough T1D estimates that about 71% of people with type 1 in Canada were diagnosed as adults." · FR → "Avec le type 1, votre pancréas ne produit pas d’insuline, alors vous prenez de l’insuline par injection ou avec une pompe. Selon Diabète Canada, de 5 à 10 % des personnes diabétiques ont le type 1, et il peut aussi commencer à l’âge adulte. Selon une estimation de Breakthrough T1D, environ 71 % des personnes atteintes du type 1 au Canada ont reçu leur diagnostic à l’âge adulte." | [C39](clinical-rulings-2026-10-06.md#c39) |
| 5 | `less-common-types.list.reasons.11` | EN "Cystic Fibrosis Canada’s guideline says people with CFRD who take insulin should be taught how to use glucagon" → "Cystic Fibrosis Canada’s guideline says people with CFRD who take insulin, and their families or carers, should be taught how to use glucagon. It’s for a low when the person can’t swallow, is unconscious or is having a seizure. Someone else gives it, so the people around you need to know where it is and how to use it" · FR → "Selon la ligne directrice de Fibrose kystique Canada, les personnes atteintes du diabète associé à la fibrose kystique qui prennent de l’insuline, ainsi que leur famille ou leurs proches aidants, devraient apprendre à utiliser le glucagon. Il sert en cas d’hypoglycémie quand la personne ne peut pas avaler, est inconsciente ou fait une convulsion. C’est quelqu’un d’autre qui le donne, alors les gens autour de vous doivent savoir où il se trouve et comment l’utiliser" | [C43](clinical-rulings-2026-10-06.md#c43) |
| 6 | prediabetes (paths-meta) | `introSources[1]` is now `['dc-cpg-ch5-reducing-risk', 'dc-prediabetes-treatment']` (was empty). A new last entry, `{ chapter: 'every-day-living', card: 11, stage: 'season', sources: ['dc-prediabetes-treatment', 'dc-cpg-ch4-screening'] }`, with `list.reasons.7`; the Highs card is not listed. H-P1 and H-P3 released (H-P1 framed as conditional, with activity and a dietitian); Q2, Q5 and Q7 closed (Q7's door line kept). The Ch5 medication key message and the "almost 60%" figure (H-P2) stay out | [C28](clinical-rulings-2026-10-06.md#c28), [C38](clinical-rulings-2026-10-06.md#c38) |
| 7 | register | Registered after reading on 2026-10-06: `dc-cpg-ch5-reducing-risk` (F.1; Prebtani, Bajaj, Goldenberg, Mullan; Can J Diabetes 2018;42 Suppl 1, from S20), `dc-cpg-ch4-screening` (F.2; Ekoe, Goldenberg, Katz; from S16) and `dc-prediabetes-treatment` (Diabetes Canada, "Prediabetes Treatment"; no French page). No French versions | [C38](clinical-rulings-2026-10-06.md#c38) |
| 8 | gestational | The intro's new line rests on `dc-gestational-diabetes` ("some women will need to inject insulin"; "insulin injections or pills") and `dc-cpg-ch36-pregnancy` (first-line therapy is diet and activity, then insulin or metformin), both already in `introSources[0]`. H-G1 released; H-G2's conditional rows stay; Q12 closed. F.4's Ch36 note is now in `sources-review.ts` | [C28](clinical-rulings-2026-10-06.md#c28) |
| 9 | less common types row 11 (paths-meta) | Sources `['cf-canada-cfrd-guideline-2024', 'bt1d-what-is-glucagon']`: the guideline's own scope (people on insulin and their families or carers), and the site's glucagon line (someone else gives it) | [C43](clinical-rulings-2026-10-06.md#c43) |
| 10 | type 1 | The intro says "Breakthrough T1D estimates", as the landing and Know Your Type card 1 do | [C39](clinical-rulings-2026-10-06.md#c39) |
| 11 | Q20 | Closed: Know Your Type 1.items.1 now says "5 to 10%" | [C41](clinical-rulings-2026-10-06.md#c41) |
| 12 | H-L1 | Stays held: the name "type 3c" | [C34](clinical-rulings-2026-10-06.md#c34) |
| 13 | P1 (review pack) | Kept: row 5 rests on ISPAD 2022, and the card it opens carries the badge, which the intro explains | [C40](clinical-rulings-2026-10-06.md#c40) |
| 14 | F.4 | The Ch29 (puberty clause) and Ch36 (first-line therapy) notes are now in `sources-review.ts` | [C28](clinical-rulings-2026-10-06.md#c28), [C37](clinical-rulings-2026-10-06.md#c37) |

### H.5 Owner's business answers applied (2026-10-06)

From the owner's answers of 2026-10-06 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)). French machine-drafted.

| # | Key or place | Change | Why |
|---|---|---|---|
| 1 | `PATH_GATES.cdeBand` | On: the CDE band renders on Type 1, Type 2, Gestational and Less common types, with the CDE contact (`ui.contact`: call, email, hours, About Bayshore Express Pharmacy) under the body. Its "Request a call" (`cta`) renders only when `cdeRequestReason` is on (B6); the route now passes the band and the button separately | A2, B5, B9, B11 (Q16, Q17 closed; E.1 gate 2 and E.1-phone released) |
| 2 | `paths.<slug>.pharmacist.body` (4) | "Liivv’s pharmacist CDEs answer pump and CGM questions from anywhere in Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. When you need a pharmacy, they pass you to the right Liivv pharmacy. Liivv has one in every province except Quebec, and none in the territories." → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province.", each path keeping its last sentence (FR "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province.") | A1, A2, B5, B10 (Q19 closed: the Gestational band stays) |
| 3 | Prediabetes row 6 | Removed: it opened This Might Be You card 6 for Ch38's check every 6 to 12 months, which that card no longer carries. Row 7 is now row 6 (`list.reasons` renumbered, EN and FR) | B1, B2 |
| 4 | Less common types funding door (meta `fundingSources`) | `on-adp-insulin-pumps` dropped: merged into `on-diabetes-equipment-and-supplies` | B31 |
| 5 | Chapter titles in the lists | Everyday Liivving / Liivv au quotidien, from the chapter title | B32 |

### H.6 Funding step: how paying works (2026-10-06)

From the owner's answers of 2026-10-06 (A6, B13), applied with the Funding page (funding.md, G-26 onward). FR machine-drafted, awaiting review.

| # | Key | What changed | Why |
|---|---|---|---|
| 1 | `paths.{type-1,type-2,gestational,less-common-types}.funding.body` | "At Liivv, you pay for your order yourself. Some programs pay you back from a receipt, and others pay only the pharmacy or supplier directly. Check how yours pays before you order, or ask us." → "At Liivv, our pharmacy in your province bills your provincial drug plan for what it covers, except in Quebec. Other programs each pay their own way, so check how yours pays before you order, or ask us." (FR "Chez Liivv, notre pharmacie de votre province facture votre régime provincial d’assurance-médicaments pour ce qu’il couvre, sauf au Québec. Les autres programmes paient chacun à leur façon : vérifiez comment le vôtre paie avant de commander, ou posez-nous la question.") The export's `PATH_FORBIDDEN` guard still passes: no door says a program is billed "directly", and none offers to pay later | A6, B13 (P2 settled) |
| 2 | Meta `fundingSources` (the four doors) | Adds `qc-stays-outside-quebec`, the official line behind "except in Quebec"; the comments record the owner's basis | B13, policy 1 |
| 3 | Review record (`diabetes-care.paths.mjs`) | P2 moved to settled; held item E.1-direct removed (released); E.1-later (pay-later on the doors) records that "Liivv Now, Pay Later" is on the Funding page and its pump cards only | A5, A6, B13 |

### H.7 Commerce step: the path shop strip (2026-10-06)

How a strip behaves (all chapters): the products are named in `diabetes-care/chapters/chapter-shop.ts` (owner answer B21, "Now?"), drawn by the shared engine (`_microsite/shop/`) under the card's referral chip, and read from the catalogue on every request. A product shows only while the store shows it, sells it and has it in stock, and never when its description names or links another retailer or gives its phone number (17 descriptions still do; OPEN-QUESTIONS B3). A product with a required option or modifier (85 diabetes products carry a required "Test" modifier today) gets "Choose options", a link to its page, instead of a one-click add. No kit is listed (A4). One switch, `SHOP_SWITCH.placements`, turns every strip off. Every placed id is health-revealing by id for analytics (`sensitive-products.ts`). The strip's words are `ui.chapter.shop.*` (French machine-drafted, not behind a review gate, as on Ostomy).

| # | Path | Strip |
|---|---|---|
| 1 | `type-1`, `less-common-types` | `checkTools`: meters (4287, 4524, 4556, 4402), urine ketone strips (4808), sensors (4227, 4316) |
| 2 | `type-2`, `gestational` | `meterAndStrips`: OneTouch (4287 with 4948), Contour (4524 with 4714). No ketone strips on gestational: the nurse has not ruled on them (commerce facts, section 3) |
| 3 | `prediabetes` | None, ever |

### H.8 Fixes after the full-site review (2026-10-06)

French machine-drafted. Engine-wide changes (the pharmacist band's heading contrast, the shop strips on narrow phones) are in new-to-the-journey.md F.8.

| # | Where | Change | Why |
|---|---|---|---|
| 1 | Prediabetes reading list, reason 2 | "…why symptoms of high blood sugar mean contacting your doctor without waiting" → "…contacting your doctor today" (FR « …de contacter votre médecin aujourd’hui même »), Know Your Type card 2's word (ruling C11) | Clinical review 9 |
| 2 | Gestational path intro (FR) | « Beaucoup de personnes la gèrent » → « Beaucoup de personnes le gèrent »: the antecedent is « le diabète gestationnel » | K4 |

### H.9 Owner notes 5 and 1 applied (2026-10-07)

From the owner’s review of 2026-10-07 (notes 5 and 1; the diagnosis and its review are in the session record). French machine-drafted, the same change as the English, under the existing draft marker. **Note 5:** the Certified Diabetes Educators are presented as Liivv’s own service: no "Bayshore Express Pharmacy", no Markham, no email and no About link in any customer line; the contact is the phone and the hours (`DIABETES_SITE.contact` = `tel` only; the engine renders email and About only where a site sets them); register id `bep-about` deleted everywhere. The governance line "Liivv is a HelioMed company and part of the Bayshore family" stays (the owner’s own wording, B15). **Note 1:** sources are shown in the element, not named in the prose. Every card ends with a Sources disclosure (closed: up to three publishers, then "+N"; open: "Title, Publisher (year)", "(en anglais)" inside the link on /fr), built from the card’s own `sources` plus those of the figures this locale keeps; "Where this comes from" lists every card, figure, band and lane source, grouped Canadian, international, then makers. Prose now states the fact; a comparison says "In Canada…" / "International guidance…"; a line that gives clinical permission or states a guideline recommendation says "Canadian guidelines…" with the year in the disclosure. Numbers and hedges are unchanged. Every rewritten key is listed below with its new EN and FR.

Also: each path shows a Sources disclosure under its intro (`introSources`, resolved on the server), and its foot list is grouped. The CDE band’s contact is the phone and hours only.

| # | Key | Now (EN) | Now (FR) | Why |
|---|---|---|---|---|
| 1 | `paths.type-1.pharmacist.body` | Liivv’s Certified Diabetes Educators answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to Liivv’s pharmacy in your province. Your insulin plan and pump settings belong with your diabetes team. | Les éducateurs agréés en diabète de Liivv répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie de Liivv de votre province. Votre plan d’insuline et les réglages de votre pompe relèvent de votre équipe de soins en diabète. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 2 | `paths.type-2.pharmacist.body` | Liivv’s Certified Diabetes Educators answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to Liivv’s pharmacy in your province. Your medicines and your plan belong with your diabetes team. | Les éducateurs agréés en diabète de Liivv répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie de Liivv de votre province. Vos médicaments et votre plan relèvent de votre équipe de soins en diabète. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 3 | `paths.gestational.pharmacist.body` | Liivv’s Certified Diabetes Educators answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to Liivv’s pharmacy in your province. Questions about your pregnancy belong with your diabetes and pregnancy team. | Les éducateurs agréés en diabète de Liivv répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie de Liivv de votre province. Les questions sur votre grossesse relèvent de votre équipe de soins en diabète et de grossesse. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 4 | `paths.less-common-types.pharmacist.body` | Liivv’s Certified Diabetes Educators answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to Liivv’s pharmacy in your province. Questions about your type, and the tests for it, belong with your diabetes team. | Les éducateurs agréés en diabète de Liivv répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie de Liivv de votre province. Les questions sur votre type, et sur les tests pour le déterminer, relèvent de votre équipe de soins en diabète. | Owner note 5: the CDE service is Liivv’s (white-label) |
| 5 | `paths.type-1.intro.body.1` | With type 1, your pancreas makes no insulin, so you take insulin by injection or with a pump. 5 to 10% of people with diabetes have type 1, and it can start in adulthood too. An estimated 71% of people with type 1 in Canada were diagnosed as adults. | Avec le type 1, votre pancréas ne produit pas d’insuline, alors vous prenez de l’insuline par injection ou avec une pompe. De 5 à 10 % des personnes diabétiques ont le type 1, et il peut aussi commencer à l’âge adulte. On estime qu’environ 71 % des personnes atteintes du type 1 au Canada ont reçu leur diagnostic à l’âge adulte. | Owner note 1 (category A) |
| 6 | `paths.type-1.intro.body.2` | This path puts the cards that matter most with type 1 in one order. They cover how to treat a low and when to check for ketones, the sensors, pens and pumps you may use, and the times in life when the details change. Canadian guidelines prefer automated insulin delivery for anyone with type 1 who is willing and able to use it, so the pump and sensor cards are here too. Your team decides your plan with you. | Ce parcours réunit dans un ordre de lecture les fiches qui comptent le plus avec le type 1. Elles expliquent comment traiter une hypoglycémie et quand vérifier les cétones, présentent les capteurs, les stylos et les pompes que vous pourriez utiliser, et les moments de la vie où les détails changent. Les lignes directrices canadiennes privilégient l’administration automatisée d’insuline pour toute personne atteinte du type 1 qui veut et peut l’utiliser, alors les fiches sur les pompes et les capteurs sont ici aussi. Votre équipe décide de votre plan avec vous. | Owner note 1 (category A) |
| 7 | `paths.type-1.list.reasons.19` | Canadian guidelines prefer automated insulin delivery for anyone with type 1 who is willing and able to use it | Les lignes directrices canadiennes privilégient l’administration automatisée d’insuline pour toute personne atteinte du type 1 qui veut et peut l’utiliser | Owner note 1 (category A) |
| 8 | `paths.type-1.list.reasons.24` | With type 1, avoid recreational cannabis, because it raises the risk of DKA | Avec le type 1, évitez le cannabis à des fins récréatives, car il augmente le risque d’acidocétose diabétique (ACD) | Owner note 1 (category A) |
| 9 | `paths.type-2.intro.body.1` | Type 2 is the most common type. 90 to 95% of people with diabetes in Canada have it, and it may cause no symptoms at all. Treatment is different for each person. Many people with type 2 need insulin to stay healthy. Whether you do, and when, is decided with your team. | Le type 2 est le type le plus courant. De 90 à 95 % des personnes diabétiques au Canada l’ont, et il peut ne causer aucun symptôme. Le traitement est différent pour chaque personne. Beaucoup de personnes atteintes du type 2 ont besoin d’insuline pour rester en bonne santé. Si c’est votre cas, et à quel moment, cela se décide avec votre équipe. | Owner note 1 (category A) |
| 10 | `paths.type-2.intro.body.2` | This path starts with the basics. Next come checking your blood sugar at home and the times a low can happen, then the checkups that look after your feet, eyes, kidneys and heart. If your diabetes doesn’t fit the usual picture, read Could my type be different? LADA, a type 1 that starts slowly in adults, is often first treated as type 2. | Ce parcours commence par les notions de base. Viennent ensuite la mesure de la glycémie à la maison et les moments où une hypoglycémie peut survenir, puis les examens qui prennent soin de vos pieds, de vos yeux, de vos reins et de votre cœur. Si votre diabète ne correspond pas au portrait habituel, lisez Mon type pourrait-il être différent? Le LADA, un type 1 qui commence lentement chez l’adulte, est souvent traité d’abord comme un type 2. | Owner note 1 (category A) |
| 11 | `paths.type-2.list.reasons.8` | Many people with type 2 need insulin. If that’s you, start here | Beaucoup de personnes atteintes du type 2 ont besoin d’insuline. Si c’est votre cas, commencez ici | Owner note 1 (category A) |
| 12 | `paths.gestational.intro.body.1` | Gestational diabetes is high blood sugar first found during pregnancy. It affects 3 to 20% of pregnancies and usually goes away after the birth. Screening for it is offered between 24 and 28 weeks, or earlier if you’re at higher risk. Many people manage it with healthy eating and activity. Some also need medicine, such as insulin. | Le diabète gestationnel est une glycémie élevée découverte pour la première fois pendant la grossesse. Il touche de 3 à 20 % des grossesses et disparaît habituellement après l’accouchement. Le dépistage est offert entre la 24e et la 28e semaine, ou plus tôt si votre risque est plus élevé. Beaucoup de personnes le gèrent par une saine alimentation et l’activité physique. Certaines ont aussi besoin d’un médicament, comme l’insuline. | Owner note 1 (category A) |
| 13 | `paths.gestational.intro.body.2` | It still matters after the birth. It raises the chance of type 2 later, for you and your child, and a glucose tolerance test is recommended between 6 weeks and 6 months after the birth. This path covers your pregnancy first, then the reminder for afterwards. If you had diabetes before you were pregnant, read Pregnancy with type 1 or type 2 instead. | Il compte encore après l’accouchement. Il augmente le risque de type 2 plus tard, pour vous et pour votre enfant, et un test de tolérance au glucose est recommandé entre 6 semaines et 6 mois après l’accouchement. Ce parcours couvre d’abord votre grossesse, puis le rappel pour la suite. Si vous aviez le diabète avant votre grossesse, lisez plutôt La grossesse avec un diabète de type 1 ou de type 2. | Owner note 1 (category A) |
| 14 | `paths.gestational.list.reasons.19` | Don’t drink if you’re pregnant, trying to get pregnant or breastfeeding | Ne buvez pas si vous êtes enceinte, si vous essayez de le devenir ou si vous allaitez | Owner note 1 (category A) |
| 15 | `paths.gestational.list.reasons.21` | International guidance says a steady fasting blood sugar of 5.5 to 8 mmol/L, with diabetes in the family, can point to a single-gene type. If that sounds like you, tell your team early in pregnancy | Selon des lignes directrices internationales, une glycémie à jeun stable de 5,5 à 8 mmol/L, avec du diabète dans la famille, peut indiquer un type monogénique. Si cela vous ressemble, parlez-en à votre équipe tôt dans la grossesse | Owner note 1 (category A) |
| 16 | `paths.gestational.list.reasons.22` | Gestational diabetes raises the chance of heart disease later. This card explains the risk factors | Le diabète gestationnel augmente le risque de maladie du cœur plus tard. Cette fiche explique les facteurs de risque | Owner note 1 (category A) |
| 17 | `paths.prediabetes.intro.body.1` | Prediabetes means your blood sugar is higher than normal, but not high enough to be called type 2 diabetes. Not everyone with prediabetes goes on to develop type 2, but many people do. | Le prédiabète signifie que votre glycémie est plus élevée que la normale, mais pas assez pour parler de diabète de type 2. Ce ne sont pas toutes les personnes atteintes de prédiabète qui développent un diabète de type 2, mais beaucoup le font. | Owner note 1 (category A) |
| 18 | `paths.prediabetes.intro.body.2` | This path keeps to the everyday: what your numbers mean, and the cards on food and movement. If losing weight is right for you, healthy changes that lead to a loss of 5% of your starting weight can delay or prevent type 2. Regular activity also lowers your risk, and a registered dietitian can help you find changes that suit you. Ask your doctor what your numbers mean for you, and when to test again. | Ce parcours s’en tient au quotidien : ce que vos chiffres veulent dire, et les fiches sur l’alimentation et l’activité physique. Si perdre du poids vous convient, de saines habitudes menant à une perte de 5 % de votre poids de départ peuvent retarder ou prévenir le diabète de type 2. L’activité physique régulière réduit aussi le risque, et une diététiste peut vous aider à trouver des changements qui vous conviennent. Demandez à votre médecin ce que vos chiffres signifient pour vous, et quand refaire un test. | Owner note 1 (category A) |
| 19 | `paths.prediabetes.list.reasons.6` | Some complications of diabetes, such as heart disease, may begin during prediabetes. This card is written for people with diabetes, so ask your doctor which parts apply to you | Certaines complications du diabète, comme les maladies du cœur, peuvent commencer dès le prédiabète. Cette fiche s’adresse aux personnes diabétiques : demandez à votre médecin quelles parties s’appliquent à vous | Owner note 1 (category A) |
| 20 | `paths.less-common-types.intro.body.1` | Most people have type 1 or type 2, but some cases are difficult to classify, and there are other forms too. These include LADA, a type 1 that starts slowly in adults, and single-gene types such as MODY. Diabetes can also be linked to the pancreas, cystic fibrosis, iron overload or some medicines, and it can start after a transplant. | La plupart des gens ont le type 1 ou le type 2, mais certains cas sont difficiles à classer, et il existe aussi d’autres formes. Parmi elles, le LADA, un type 1 qui commence lentement chez l’adulte, et les types causés par un seul gène, comme le MODY. Le diabète peut aussi être lié au pancréas, à la fibrose kystique, à une surcharge en fer ou à certains médicaments, et il peut commencer après une greffe. | Owner note 1 (category A) |
| 21 | `paths.less-common-types.intro.body.2` | The right type matters, because it may change your treatment. This path starts with the clues worth raising with your team, then gives each less common type its own card. Cards that rest on international guidance say so. Don’t stop or lower insulin because of anything here. Any change is made with your specialist. | Le bon type compte, car il peut changer votre traitement. Ce parcours commence par les indices à soulever avec votre équipe, puis donne à chaque type moins courant sa propre fiche. Les fiches qui s’appuient sur des lignes directrices internationales le précisent. N’arrêtez pas votre insuline et ne la diminuez pas à cause de quoi que ce soit ici. Tout changement se fait avec votre spécialiste. | Owner note 1 (category A) |
| 22 | `paths.less-common-types.list.reasons.9` | In Canada, LADA is counted as type 1, so much of this card applies to LADA too | Au Canada, le LADA est classé dans le type 1, alors une grande partie de cette fiche s’applique aussi au LADA | Owner note 1 (category C) |
| 23 | `paths.less-common-types.list.reasons.11` | Canadian guidelines say people with CFRD who take insulin, and their families or carers, should be taught how to use glucagon. It’s for a low when the person can’t swallow, is unconscious or is having a seizure. Someone else gives it, so the people around you need to know where it is and how to use it | Selon les lignes directrices canadiennes, les personnes atteintes du diabète associé à la fibrose kystique qui prennent de l’insuline, ainsi que leur famille ou leurs proches aidants, devraient apprendre à utiliser le glucagon. Il sert en cas d’hypoglycémie quand la personne ne peut pas avaler, est inconsciente ou fait une convulsion. C’est quelqu’un d’autre qui le donne, alors les gens autour de vous doivent savoir où il se trouve et comment l’utiliser | Owner note 1 (category A) |

Rulings whose in-sentence credit owner note 1 supersedes (2026-10-07; recorded in clinical-rulings-2026-10-06.md and on the register entry in sources-review.ts):

| Ruling | Where | Now |
|---|---|---|
| C39 | `type-1.intro.body.1` | "Breakthrough T1D estimates" → "An estimated 71%" |

### H.10 Owner note 4 and the store’s typeface applied (2026-10-07)

The engine and font change is in new-to-the-journey.md F.12. Here: the path shop strip (slot 5) uses the same 168px cards, and a single product (Bayer Ketostix and the like) is a horizontal card instead of a 738px card with a 712px photo. The pages are in Poppins. Not yet re-measured on the path pages (see F.12). No copy changed.
