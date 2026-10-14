/*
 * Reviewer-only data for the Sleep Apnea Care pack, this-might-be-you (generated from the build's
 * `ch06` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "C15 (06 R2)",
      "default": "AboutKidsHealth, the CTS/CSS 2026 paediatric guideline and the HealthLink BC tonsillectomy page count as child-specific pages. The Lung Association’s and MyHealth Alberta’s children sections of adult pages are second sources, and the only source for 1.items.6 (bed-wetting, night terrors, positions), 4.items.3 (follow-up differs) and 4.note s2 (no auto-adjusting machines); also 3.items.3 s2 on held card 3. US Healthwise content (HealthLink BC, labelled) is the only source for 3.items.4 s3 and 3.note s2 (card 3, held).",
      "where": [
        "categories.1.items.6",
        "categories.3.items.1",
        "categories.3.items.3",
        "categories.3.items.4",
        "categories.3.note",
        "categories.4.items.2",
        "categories.4.items.3",
        "categories.4.note"
      ],
      "alternative": "Drop the lines that rest only on a children section; or accept children sections as child-specific; or find a Canadian child-specific second source (a children’s hospital or CPS page) for the two Healthwise-only lines."
    },
    {
      "id": "C16 (06 R3, open part)",
      "default": "4.note says “Auto-adjusting machines are not for children” (MyHealth Alberta’s children section), as a device-type statement, not a setting. The paediatric-mask half of R3 is ANSWERED (C17, 2026-10-13): sold online as complete masks under the C26 pharmacist check; still no strip in this chapter.",
      "where": [
        "categories.4.note"
      ],
      "alternative": "Drop 4.note s2 and keep “one steady pressure, set by the sleep team”."
    },
    {
      "id": "C17 follow-ups (06 R3)",
      "default": "No paediatric shop strip anywhere in this chapter (every children’s card has urgent lines; placements are off). Nurse follow-ups still open: a child’s prescription for auto-adjusting equipment, and how long a child’s validated prescription lasts.",
      "where": [
        "categories.1",
        "categories.2",
        "categories.4"
      ],
      "alternative": "The owner names a children’s card without urgent lines for a paediatric-mask strip (R3 placement question)."
    },
    {
      "id": "C62 (06 R4)",
      "default": "“1 to 5 children in 100” (AboutKidsHealth, the child-specific page).",
      "where": [
        "categories.1.items.1"
      ],
      "alternative": "The Lung Association’s “2 to 3%” (BC says “1-4% of children”), or drop the number."
    },
    {
      "id": "C63 (06 R5)",
      "default": "The physician guideline’s recommendations stated plainly for parents, with the chip; “a finger sensor that measures oxygen” glosses oximetry. The full guideline is unread (403).",
      "where": [
        "categories.2.items.2",
        "categories.2.items.4",
        "categories.2.items.5"
      ],
      "alternative": "Add “Canadian guidelines (2026)…” to each item (the Diabetes “guideline recommendation” pattern)."
    },
    {
      "id": "C14 (home sleep test for children)",
      "default": "Follow CTS/CSS 2026: a lab study is the standard; a home test may be a second option for otherwise healthy children over 5 when a lab study is out of reach.",
      "where": [
        "categories.2.items.2",
        "categories.2.items.4"
      ],
      "alternative": "Keep only “an overnight lab study is the standard” (BC 2021 Appendix A: “HSAT is not recommended as it is not sensitive enough to be accurate.”)."
    },
    {
      "id": "C64 (06 R6)",
      "default": "“Most go home after one night” (SickKids practice, AboutKidsHealth). Card 3 is held (C6), so this ships only if card 3 is released.",
      "where": [
        "categories.3.items.4"
      ],
      "alternative": "Drop it and keep “watched more closely in hospital” (HealthLink BC/Healthwise: most people go home the same day)."
    },
    {
      "id": "C31 (06 R7)",
      "default": "Keep “tell everyone caring for you that you have sleep apnea” before sedation or anesthesia (Lung Association). It is about telling the team, not about medicines; the source check agrees it is standard safety advice.",
      "where": [
        "categories.5.items.5",
        "categories.8.items.6"
      ],
      "alternative": "Hold both lines with the opioid and sedative topic."
    },
    {
      "id": "C23 (StatCan archived)",
      "default": "Use Statistics Canada’s archived 2018 fact sheet, with the survey years in the copy and “(archived page)” on the citation. No newer national figure was found.",
      "where": [
        "categories.5.items.1",
        "categories.5.items.2",
        "categories.5.note",
        "categories.6.items.1",
        "categories.6.items.2",
        "categories.6.items.3",
        "categories.6.items.4",
        "categories.8.items.7"
      ],
      "alternative": "Drop the figures."
    },
    {
      "id": "C44 (women’s card)",
      "default": "Card 6 (Women: the signs can look different) ships in Seasons of life; it was not in the plan’s list but is fully sourced.",
      "where": [
        "categories.6",
        "categories.8.items.7"
      ],
      "alternative": "Keep the women’s line on Chapter 01 card 3 only, and drop card 6."
    },
    {
      "id": "C3 Option A (02 R13), card 7",
      "default": "Health Canada’s “stop” is kept only for the masks its 2022 advisory names; everyone else checks with the mask’s maker and their health care team (ruling C3, 2026-10-13; must match Driving & Staying Safe card 6).",
      "where": [
        "categories.7.items.4",
        "categories.7.note",
        "programsBand.cards.3.body"
      ],
      "alternative": "Option B (no “stop” word anywhere): “Health Canada has issued notices about some masks with magnets. What to do depends on the mask and the implant, so check with the mask’s maker and your health care team”."
    },
    {
      "id": "C27 (06 R10)",
      "default": "NIHB’s general rules: “Prior approval is needed” for everything, and “Each replacement needs a new prescription”, although its own table marks inlet filters “No” prior approval and supplies need a prescriber for the “Initial request only”. Card 9 is held (B1), so this ships only when card 9 is released.",
      "where": [
        "categories.9.items.1",
        "categories.9.items.5"
      ],
      "alternative": "Drop the replacement-prescription sentence, or say “Machine replacements need a new prescription”; confirm with the NIHB regional office."
    },
    {
      "id": "C65 (06 R11)",
      "default": "The Lung Association’s paediatric CPAP grant program named as a program (the page gives an email only; the copy gives none).",
      "where": [
        "categories.10.items.7"
      ],
      "alternative": "Drop it until the grant has its own page with eligibility."
    },
    {
      "id": "C66 (06 R12)",
      "default": "Pregnancy is held: no Canadian source could be fetched. Not in the message files.",
      "where": [
        "categories.6"
      ],
      "alternative": "The owner or nurse names a Canadian source (for example SOGC) for a later pass."
    },
    {
      "id": "B1 (06 R8), release of card 9",
      "default": "ANSWERED 2026-10-13 (“default”): card 9 shows only its title and heldNote (“…contact your NIHB regional office.”) until an Indigenous health partner reviews it. Items, note, link and figure are in the message files, held (indigenousPartnerReview), stripped before the browser.",
      "where": [
        "categories.9"
      ],
      "alternative": "Publish card 9 after the review, by deleting its `held:` line. Whether to add a line for Métis readers (not NIHB clients) is for the partner. Ruling B1 also mentions “in BC, FNHA Health Benefits”; the heldNote in section B does not name FNHA."
    },
    {
      "id": "C6 (06 R13), release of card 3",
      "default": "ANSWERED 2026-10-13 (“default”): card 3 is held whole (childTreatmentRuling) and Chapter 06 launches without it. Its after-surgery medicine warning (with 911) stays held out of tree (section E).",
      "where": [
        "categories.3"
      ],
      "alternative": "(a) Release the medicine line onto card 3, pinned, with its 911 tier; (b) keep it held and add “Follow the medicine instructions from your child’s surgical team”; (c) hold all of card 3’s surgery lines until the medicine topic is ruled. Releasing card 3 means deleting its `held:` line."
    },
    {
      "id": "E1 (urgentExit label)",
      "default": "Verbatim per chapter (spec 8.3): “Get help now”, the placeholder 03 and 06 share. Chapter 02’s red-flag heading is “Stop and act now” (C1 kept it).",
      "where": [
        "urgentExit.link"
      ],
      "alternative": "Use one label everywhere (“Stop and act now”, or “Get help now” if 02 R12 changes the heading)."
    },
    {
      "id": "E2 (ask roles)",
      "default": "Keep each chapter’s key: 06 uses `sleepTeam` (“Ask your sleep team”), `doctor`, `provider`, and adds `childTeam` and `nihb`. 03 uses `team` for the same label.",
      "where": [
        "ui.chapter.ask.childTeam",
        "ui.chapter.ask.nihb",
        "ui.chapter.roleNames.childTeam",
        "ui.chapter.roleNames.nihb"
      ],
      "alternative": "Merge `team` into `sleepTeam` across the site."
    },
    {
      "id": "BUILD card 7 ask chip",
      "default": "Card 7 keeps 06 A.2’s ask role `provider` (“Ask your equipment provider”). Since ruling C3 the card’s own words send readers to “the mask’s maker and your health care team”.",
      "where": [
        "categories.7"
      ],
      "alternative": "Use `sleepTeam` (or `doctor`) for card 7’s chip so it matches the C3 wording."
    },
    {
      "id": "BUILD 10.note pointer to card 9",
      "default": "10.note s1 says “First Nations or Inuit? See NIHB coverage above.” While card 9 is held, “above” shows only card 9’s title and its heldNote (contact your NIHB regional office). Copy unchanged (section B).",
      "where": [
        "categories.10.note"
      ],
      "alternative": "Owner rewords 10.note s1 while card 9 is held (for example “contact your NIHB regional office”), in EN and FR."
    },
    {
      "id": "BUILD band card 4 and its NIHB link",
      "default": "Band card 4 (“Your NIHB regional office … See First Nations and Inuit.”) and its link “Who is eligible for NIHB” (ISC eligibility page) ship: they say only to ask the regional office, which matches card 9’s heldNote. A.2 did not gate them. `programsBandCards[3]` is null: “First Nations and Inuit” is not card 9’s full title, so no card link could render.",
      "where": [
        "programsBand.cards.4"
      ],
      "alternative": "Hold band card 4’s link (or the whole band card) with card 9 until the partner review (B1)."
    },
    {
      "id": "BUILD 10.serviceNote (supplies-only row 34)",
      "default": "Out of tree with all Part C service copy (spec 8.4), so card 10 ends at its note and the funding door.",
      "where": [
        "categories.10"
      ],
      "alternative": "Supplies-only row 34: release the first sentence (“Liivv gives you a receipt and your prescription details for your insurer or program.”) as a store fact once C26 puts a prescription on file (B5); delete the second sentence until B4 (supplies) is answered."
    }
  ],
  "prePublishChecks": [
    "CTS/CSS 2026 paediatric guideline: read the full text (Taylor & Francis, 403 behind a bot check on 2026-10-13) and confirm the three recommendations and the age cut-off match the press release and the infographic; then switch the citation and the cts-css-peds-dx-2026 href to the DOI (06 pre-publish check 1; F7).",
    "Health Canada Recalls and Safety Alerts: check for any magnet advisory newer than RA-64582 (2022) and RA-74733 (2023), and for any recall of a paediatric mask (06 pre-publish check 2). A search on 2026-10-13 found US notices from 2024 only; a search is not proof.",
    "Ontario ADP: confirm the 75%/100% wording, “replacement masks, headgear” not covered, and the long-term care exception are unchanged on publishing day (06 pre-publish check 3).",
    "NIHB: confirm the benefit list effective date (July 29, 2026) is still current before card 9 is released (06 pre-publish check 4).",
    "Statistics Canada 2018 fact sheet is marked “Archived”; check catalogue 82-625-X again for a newer sleep apnea fact sheet (C23).",
    "nihb-eligibility’s French address (https://www.sac-isc.gc.ca/fra/1574187596083/1576511384063) is recorded in sources.md but not fetched: open it before /fr serves band card 4’s link (and card 9’s, once released).",
    "CRA Guide RC4065 is a yearly guide: recheck the edition (Medical Expenses 2025) each tax year (10.items.1, 10.note)."
  ],
  "heldCopy": {
    "released": "Nothing out of tree is released. Section E items wait for a source confirmed on the page and the nurse’s review; the settings item is never released. The Liivv sleep support lines (10.serviceNote, support.*) wait for Part C (supplies-only rows 34 and 35). Held IN tree, in the message files but stripped before the browser: card 3 whole (C6, childTreatmentRuling) and card 9’s items, note, link and figure (B1, indigenousPartnerReview; its title and heldNote ship).",
    "items": [
      {
        "topic": "Pregnancy (snoring and sleep apnea in pregnancy, risks, testing)",
        "cards": [
          6
        ],
        "why": "No Canadian source fetched. Searches of SOGC/pregnancyinfo.ca, canada.ca, HealthLink BC and lung.ca returned only blogs and foreign pages (R12; C66).",
        "wording": "Snoring can start or get worse in pregnancy. If you snore loudly, stop breathing in your sleep, or are very sleepy, tell your pregnancy care provider",
        "check": "SOGC patient information (pregnancyinfo.ca); HealthLink BC pregnancy pages; Health Canada"
      },
      {
        "topic": "After-surgery pain medicine warning (with 911)",
        "cards": [
          3
        ],
        "why": "AKH tonsillectomy page: “When using these medications, if you notice any changes in either breathing or level of drowsiness that concern you, stop the medication and seek medical attention. If your child is unresponsive, call 911 immediately.” Opioid and sedative content is held site-wide, and it adds a 911 tier the nurse has not ruled. Urgent: if released, it goes on card 3, pinned (R13; C6). Card 3 itself is held.",
        "wording": "After surgery, if your child is very drowsy or breathing differently while taking prescription pain medicine, get medical help. If your child doesn’t respond, call 911",
        "check": "akh-tonsillectomy-osa (fetched 2026-10-13); nurse ruling on 911 and medicines"
      },
      {
        "topic": "Example pressure and humidifier setting changes",
        "cards": [
          4
        ],
        "why": "AKH PAP page gives an example pressure and humidifier setting advice. Settings words are never on the site (owner rule).",
        "wording": "None. Never released.",
        "check": "—"
      },
      {
        "topic": "Bilevel for children and Ontario’s Ventilator Equipment Pool",
        "cards": [
          4
        ],
        "why": "AKH PAP page: BPAP “will be provided through the Ventilator Equipment Pool of the Ministry of Health” at “no cost to you”. Ontario-only, from one hospital’s page; Liivv sells no machines (N1).",
        "wording": "In Ontario, a child’s bilevel machine comes through a provincial program at no cost; you pay for replacement masks, filters and hoses",
        "check": "Ontario Ministry of Health Ventilator Equipment Pool page"
      },
      {
        "topic": "Sleep-study day details for children (one parent stays overnight, what to bring)",
        "cards": [
          2
        ],
        "why": "AKH “Sleep studies: Having a polysomnogram” is dated November 10th 2009.",
        "wording": "One parent or caregiver usually stays overnight. Bring pyjamas, any medicines, and a favourite blanket or toy",
        "check": "A current AKH or Canadian children’s hospital page"
      },
      {
        "topic": "Some children improve without surgery",
        "cards": [
          3
        ],
        "why": "HealthLink BC (US Healthwise content) only: “Some children with sleep apnea who do not have the surgery also get better over time.” Could be read as “wait and see”.",
        "wording": "Some children’s sleep apnea gets better over time. Your child’s sleep team decides whether and when to treat",
        "check": "A Canadian child-specific source"
      },
      {
        "topic": "Older adults at high risk (“one quarter”)",
        "cards": [
          5
        ],
        "why": "StatCan prose says “one quarter of older adults aged 60 to 79” were high risk; its own Chart 5 table says 21.4%.",
        "wording": "About 1 in 5 adults aged 60 to 79 is at high risk",
        "check": "statcan-osa-2018 (fetched); StatCan to confirm"
      },
      {
        "topic": "Heart and diabetes links in later life",
        "cards": [
          5
        ],
        "why": "Held by the plan (no Heart & Stroke or Diabetes Canada page); StatCan gives survey associations only (C29).",
        "wording": "None proposed.",
        "check": "Heart & Stroke; Diabetes Canada"
      },
      {
        "topic": "Helping someone who is sleepy at the wheel (what to say, reporting)",
        "cards": [
          8
        ],
        "why": "Driving & Staying Safe owns driving and reporting; only a pointer here (8.note).",
        "wording": "None proposed.",
        "check": "cts-css-driving-2014; on-mto-reporting (Chapter 02)"
      },
      {
        "topic": "Métis coverage",
        "cards": [
          9
        ],
        "why": "Métis people are not NIHB clients; no provincial Métis program page fetched. For the Indigenous health partner (R8; B1).",
        "wording": "None proposed.",
        "check": "Partner review (R8)"
      },
      {
        "topic": "Liivv as an NIHB, ADP or VAC vendor",
        "cards": [
          9,
          10
        ],
        "why": "Owner question (B4): every program shows as pay-and-claim until Liivv is registered.",
        "wording": "Liivv can bill NIHB directly for your supplies",
        "check": "Owner"
      },
      {
        "topic": "Liivv’s receipt and direct billing (10.serviceNote)",
        "cards": [
          10
        ],
        "why": "Part C copy (the Liivv sleep support service is not live), and the second sentence waits on B4 (supplies). Supplies-only row 34: the first sentence is a store fact and could be released once C26 puts a prescription on file (B5).",
        "wording": "Liivv gives you a receipt and your prescription details for your insurer or program. Liivv’s sleep support team can tell you which programs Liivv can bill directly in your province.",
        "check": "Owner (B4, B5, N8)"
      },
      {
        "topic": "Liivv’s sleep support panel (support.*)",
        "cards": [],
        "why": "Part C not live; RRT licences by province not mapped. Supplies-only row 35: rewrite for N8, or keep held.",
        "wording": "Liivv’s sleep support team · Help for you, and for the person you care for · Liivv’s sleep support team helps with masks, supplies and getting used to CPAP. For a child, your child’s sleep team leads the care. We never change anyone’s pressure. · Request a call",
        "check": "Owner (Part C, N8)"
      }
    ]
  }
};
