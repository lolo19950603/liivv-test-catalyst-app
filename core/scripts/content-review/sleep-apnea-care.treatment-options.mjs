/*
 * Reviewer-only data for the Sleep Apnea Care pack, treatment-options (generated from the build's
 * `ch03` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "C24 (03 R1)",
      "default": "Mild sleep apnea without overweight: both views in one item (active treatment isn’t routinely recommended; treatment should be considered if tired or sleepy, even when mild). Card 8 reads BC Appendix F’s oral-appliance chances (about 70% mild; 50% and 40% fully effective in moderate and severe; lower with a BMI over 35).",
      "where": [
        "categories.7.items.2",
        "categories.8.items.2",
        "categories.8.items.4"
      ],
      "alternative": "Show only one view; or drop the percentages in 8.items.4 and keep \"less likely to work as severity rises\"."
    },
    {
      "id": "C19 (03 R2)",
      "default": "Fixed CPAP is the main treatment; APAP is an alternative except with heart or lung disease, nerve or muscle disease, or breathing problems that aren’t only obstructive (CTS 2011). \"Some guidance says\" only a sleep specialist should prescribe it (BC PAP Buyer’s Guide, not named in the copy).",
      "where": [
        "categories.1.note"
      ],
      "alternative": "Drop the BC clause (or the exclusions too) and say only \"Your prescriber decides\"."
    },
    {
      "id": "C18 (03 R3)",
      "default": "Bilevel for obstructive sleep apnea: keep the BC guide’s comfort reason (2.items.2) and say Canadian guidance differs (2.note); the sleep specialist decides.",
      "where": [
        "categories.2.items.2",
        "categories.2.note"
      ],
      "alternative": "Remove 2.items.2 and say bilevel is for people whose breathing problem needs more than CPAP, as the specialist decides (CTS 2011: \"BPAP should be reserved for patients with ventilatory failure\", grade 2B)."
    },
    {
      "id": "C48 (03 R4)",
      "default": "\"Government funding may help some people pay for bilevel. Ask your sleep team, and see Paying for it\" (from an Alberta page, softened 2026-10-13).",
      "where": [
        "categories.2.items.5"
      ],
      "alternative": "\"Ask your sleep team about funding\" only, or wait for the funding page rows (NB and ADP list bilevel)."
    },
    {
      "id": "C21 (03 R6)",
      "default": "ASV named as one of the newer machines; the Health Canada recall facts given exactly (RA-53771, 2015, Type I; symptomatic chronic heart failure with reduced ejection fraction; 33.5% higher risk of cardiovascular death). No ejection-fraction cut-off. Note always visible. The machine guide’s ASV card is narrower (it drops \"used for central sleep apnea\" and the heart-failure instruction): align both pages once ruled.",
      "where": [
        "categories.3.note"
      ],
      "alternative": "Drop the 33.5% figure and say \"a serious safety concern in some people with heart failure\"; or add \"45% or less\" once a Canadian page that states it is verified (held, section E)."
    },
    {
      "id": "C22 (03 pre-publish 1)",
      "default": "Cite the INAHTA brief (\"Written by: CADTH, Canada\"), chip and citation labelled \"2017, archived\".",
      "where": [
        "categories.1.items.1",
        "categories.6.items.2",
        "categories.7.items.1",
        "categories.7.items.2",
        "categories.8.items.1",
        "categories.8.items.2",
        "categories.8.items.3",
        "categories.8.items.5"
      ],
      "alternative": "Request the archived report from CDA-AMC; or rest those lines on BC Appendix F only (it broadly agrees)."
    },
    {
      "id": "C49 (03 R7)",
      "default": "\"registered respiratory therapist\" (the BC guide says \"Certified Registered Respiratory Therapist\").",
      "where": [
        "categories.5.items.4",
        "programsBand.cards.3.body"
      ],
      "alternative": "Keep the guide’s exact title."
    },
    {
      "id": "B8 (03 R8)",
      "default": "Supplier choice stated as an Ontario rule (CRTO Standard 5).",
      "where": [
        "categories.5.items.8"
      ],
      "alternative": "Drop \"In Ontario\" and say \"You can choose your supplier\" only, once a national or other-province source is verified."
    },
    {
      "id": "C50 (03 R9)",
      "default": "\"30 pounds (about 14 kg) or more\" in 7.items.9 (14 kg is Liivv’s conversion of 13.6 kg); 10.items.4 says pounds only.",
      "where": [
        "categories.7.items.9",
        "categories.10.items.4"
      ],
      "alternative": "Pounds only, as the source prints."
    },
    {
      "id": "C25 (03 E)",
      "default": "Positional therapy, adult surgery, bariatric surgery, hypoglossal nerve stimulation, tirzepatide, EPAP valves and modafinil are held: not in the message files.",
      "where": [
        "categories.7",
        "categories.9"
      ],
      "alternative": "Release positional therapy and/or adult surgery with the proposed wording in heldCopy; keep the rest held until sourced."
    },
    {
      "id": "E1 (urgentExit label)",
      "default": "Verbatim per chapter (spec 8.3): \"Get help now\", the 03 placeholder. Chapter 02’s red-flag heading is \"Stop and act now\" (C1 kept it).",
      "where": [
        "urgentExit.link"
      ],
      "alternative": "Use one label everywhere (\"Stop and act now\", or \"Get help now\" if 02 R12 changes the heading)."
    },
    {
      "id": "8.3 ask.urgent",
      "default": "ui.chapter.ask.urgent = \"Don’t wait\" (01, 02). 03 has no urgent card, so its own label is not in its fragment.",
      "where": [
        "ui.chapter.ask.urgent"
      ],
      "alternative": "03’s \"Call, don’t wait\"."
    },
    {
      "id": "E2 (ask roles)",
      "default": "Keep each chapter’s key: 03 uses `team` (\"Ask your sleep team\"), the same label as `sleepTeam` in 01, 02, 04 and 06. `provider` and `dentist` as written.",
      "where": [
        "ui.chapter.ask.team",
        "ui.chapter.roleNames.team"
      ],
      "alternative": "Merge `team` into `sleepTeam` (cards 1, 2, 3, 7, 8, 9, 10 would then use `sleepTeam`)."
    },
    {
      "id": "D13 (machine guide placement)",
      "default": "Own page at /machine-guide, linked from nowhere while LANDING_GATES.machineGuideLinked is false. Nothing in 03 links to it.",
      "where": [
        "categories.1",
        "categories.4"
      ],
      "alternative": "A section of this chapter beside cards 1 to 5; the deleted card 1 and card 4 machine strips could become a link to the guide."
    },
    {
      "id": "BUILD 2.items.5 funding link",
      "default": "The 03 copy note says 2.items.5 links to the funding page (\"Paying for it\"). Section B has no <link> tags in it, so the engine makes the whole sentence the link (meta `links: [{ at: 'items.5', to: { page: 'funding' } }]`).",
      "where": [
        "categories.2.items.5"
      ],
      "alternative": "Owner adds <link>…</link> around \"Paying for it\" in section B (EN and FR), so only those words link; or drop the link."
    }
  ],
  "prePublishChecks": [
    "CADTH 2017 (C22): the CDA-AMC report page redirects to \"301 Archived Content\" and both report PDFs return 404 (2026-10-13). Owner and nurse decide: accept the INAHTA brief (\"Written by: CADTH, Canada\") labelled \"2017, archived\", or request the archived report from CDA-AMC. Where the brief is the only source (7.items.1, 7.items.2 s1, 8.items.1), BC Appendix F broadly agrees.",
    "BC PAP Buyer’s Guide: done 2026-10-13 (still linked from the BC Home Sleep Apnea Testing patient page, last updated 2023-05-18; PDF metadata 2022-03-07). Recheck monthly (F16).",
    "Health Canada Recalls and Safety Alerts: check for any ASV advisory newer than the archived 2015 recall RA-53771 before 3.note publishes (F4). A web search on 2026-10-13 found none; a search is not proof. Still open.",
    "MDALL link target (card 5 \"Check a licence\", band card 4): done 2026-10-13. The Active Licence Search loads with no sign-in.",
    "CRTO Standard 5 still carries the alternate-supplier line on publishing day (F2; 5.items.8).",
    "Store rule for operations (03 A.1, Part D): never shelve boil-and-bite mouthguards, nasal strips, nasal dilators or chin straps as a sleep apnea treatment (cards 6 and 9 say they don’t treat it). A chin strap sold as a CPAP accessory is fine, labelled as an accessory."
  ],
  "heldCopy": {
    "released": "Nothing in this chapter is released. Section E items wait for a source confirmed on the page and the nurse’s review (C25 for the treatments). The Liivv sleep support lines wait for Part C, which the supplies-only decision of 2026-10-13 moved to the machine plan or an N8 rewrite (supplies-only rows 22–23). The card 1 and card 4 machine strips were deleted under N1 (rows 20–21). None of these is in the message files or the meta.",
    "items": [
      {
        "topic": "Positional therapy (side-sleeping, pillows, the \"tennis ball trick\", position monitors)",
        "cards": [
          7
        ],
        "why": "Held by instruction (plan Part F; nurse ruling \"content to rule in or out\", C25). Sources exist and were re-checked 2026-10-13.",
        "wording": "If your sleep test shows your apnea happens mostly on your back, sleeping on your side may help. Your sleep team can tell you if this applies to you",
        "check": "bcg-osa-adults; bcg-osa-options-2021; cla-sleep-apnea (all fetched 2026-10-13)"
      },
      {
        "topic": "Adult surgery (tonsillectomy, UPPP, maxillomandibular advancement, minimally invasive procedures)",
        "cards": [
          9
        ],
        "why": "Held by instruction (C25). Sources exist: BCG (prior referral to a sleep disorder physician; mainly tonsillar hypertrophy or craniofacial abnormalities), CLA (\"doctors don't recommend surgery in most cases\"), CADTH (no surgical maxillomandibular advancement unless other interventions failed or are unacceptable).",
        "wording": "Surgery helps only some people, and it carries risks. Most surgery can't be undone. Your sleep specialist and a surgeon decide if it's an option",
        "check": "bcg-osa-adults; cla-sleep-apnea; cadth-osa-2017"
      },
      {
        "topic": "Bariatric surgery",
        "cards": [
          7
        ],
        "why": "Out of scope with adult surgery; CTS 2011 has a recommendation not read in full.",
        "wording": "None proposed.",
        "check": "cts-sdb-2011 section V"
      },
      {
        "topic": "Hypoglossal nerve stimulation",
        "cards": [
          9
        ],
        "why": "Held by instruction (C25). Not found on any Canadian source fetched; no Health Canada licence check done.",
        "wording": "None proposed.",
        "check": "Health Canada MDALL; CADTH/CDA-AMC"
      },
      {
        "topic": "Tirzepatide for OSA",
        "cards": [
          7
        ],
        "why": "Held by instruction (C25): only confirmed indirectly. No Canadian product monograph or Health Canada page fetched.",
        "wording": "None proposed.",
        "check": "Health Canada Drug Product Database / product monograph (OSA indication, if any)"
      },
      {
        "topic": "ASV ejection-fraction cut-off (≤45%)",
        "cards": [
          3
        ],
        "why": "Not on the Health Canada recall page (it says only \"reduced left ventricular ejection fraction\"). Found only on manufacturer and Australian pages by search, which doesn't count (C21).",
        "wording": "…in people with heart failure and an ejection fraction of 45% or less",
        "check": "A Health Canada or CTS/CSS statement after SERVE-HF (2015)"
      },
      {
        "topic": "Children and auto-adjusting machines",
        "cards": [],
        "why": "For Chapter 06: Alberta’s adult page says \"Children should not use auto-adjustable pressure CPAP equipment\". Children’s content must use child-specific sources (C15, C16).",
        "wording": "Children use fixed-pressure CPAP, set by their sleep team",
        "check": "cts-css-peds-dx-2026; akh-osa"
      },
      {
        "topic": "Modafinil for leftover sleepiness",
        "cards": [],
        "why": "CLA mentions it (\"used along with CPAP\"); drug content is out of scope for this chapter, and opioid/sedative interactions are held site-wide.",
        "wording": "None proposed.",
        "check": "cla-sleep-apnea (verified); nurse scope ruling"
      },
      {
        "topic": "Expiratory pressure relief, ramp, other comfort settings",
        "cards": [
          1,
          2
        ],
        "why": "Settings words: never on the site (owner rule). BCG Table 2 and the Buyer’s Guide describe them.",
        "wording": "None. Never released.",
        "check": "—"
      },
      {
        "topic": "Nasal EPAP valves",
        "cards": [
          9
        ],
        "why": "CADTH lists \"expiratory positive airway pressure (EPAP) valves\" among assessed treatments, but gives no recommendation in the brief (C25).",
        "wording": "None proposed.",
        "check": "CADTH full report"
      },
      {
        "topic": "Card 1 machine strip (section B `categories.1.shop`)",
        "cards": [
          1
        ],
        "why": "Liivv sells no machines (N1, \"Hide all 24\"); supplies-only row 20 deletes the strip and chapter-shop.ts has no entry for card 1.",
        "wording": "Machines need a prescription / See machines (prescription required)",
        "check": "Machine plan (SLT). Never at launch."
      },
      {
        "topic": "Card 4 machine strip (section B `categories.4.shop`)",
        "cards": [
          4
        ],
        "why": "As card 1 (supplies-only row 21).",
        "wording": "Travel machines need a prescription / See travel machines (prescription required)",
        "check": "Machine plan (SLT). Never at launch."
      },
      {
        "topic": "Card 5 Liivv service note (section B `categories.5.serviceNote`)",
        "cards": [
          5
        ],
        "why": "Part C (sleep support service) is not live, and Liivv sells no machines (supplies-only row 22: replace with the N2 line, ungated, or delete).",
        "wording": "Liivv sells machines only with a prescription. Liivv’s sleep support team books a set-up call and follow-ups for everyone starting on their first machine.",
        "check": "Owner: N2 / N10 line or delete."
      },
      {
        "topic": "Card 10 Liivv lane (section B `categories.10.figure.lanes.5`)",
        "cards": [
          10
        ],
        "why": "Part C not live; RRT licences by province not mapped (supplies-only row 23: machine plan, or rewrite for N8). Card 10 ships with four lanes.",
        "wording": "Liivv’s sleep support team · A Liivv service · hours and provinces to be confirmed · Mask fit and supply questions. We never change your pressure: that’s your prescriber’s job. · Request a call (sign-in needed)",
        "check": "N8 / N5; the scope line needs confirmed hours and provinces before any release."
      },
      {
        "topic": "Sleep support panel (section B `support.*`)",
        "cards": [],
        "why": "Part C not live (supplies-only row 23). The chapter has no care panel (engine E-8).",
        "wording": "Liivv’s sleep support team / Help with your mask and supplies / Liivv’s sleep support team helps with set-up, mask fit and supplies. Your prescriber chooses your treatment and sets your pressure. We never change it. / Request a call",
        "check": "N8 / machine plan."
      },
      {
        "topic": "therapyCompare figure (03 section G.1, card 8)",
        "cards": [
          8
        ],
        "why": "Not built in this pass (spec 5.4); card 8 ships as columns. Its cell words (\"Recommended\", \"If CPAP isn't acceptable\", \"Not enough on its own\", \"Recommended if overweight\", \"An option\", \"An option; about 70% chance of working\", footer \"Your sleep team decides with you.\") are proposals, not section B copy.",
        "wording": "Rows Mild · Moderate · Severe; columns CPAP · Oral appliance · Lifestyle changes; cells as 03 G.1.",
        "check": "Owner approval of the cell words, then a French review gate `therapyCompare`."
      }
    ]
  }
};
