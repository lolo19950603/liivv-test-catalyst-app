/*
 * Reviewer-only data for the Sleep Apnea Care pack, is-it-sleep-apnea (generated from the build's
 * `ch01` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "S1 (C10)",
      "default": "AHI bands from the BC guideline (Table 1): normal under 5, mild 5–14, moderate 15–29, severe 30 or more. Side by side: BC gives \"Mild (5-14 events per hour)\", \"Moderate (15-29 events per hour)\", \"Severe (≥ 30 events per hour)\"; the Lung Association and the Lung Health Foundation give \"5 to 15 events per hour: mild\", \"15 to 30 events per hour: moderate\", \"over 30 events per hour: severe\".",
      "where": [
        "categories.9.items.3",
        "categories.9.items.4",
        "categories.9.figure.scale.zones",
        "CHAPTER_META card 9 ahiScale zones"
      ],
      "alternative": "Use the Lung Association's wording (edges shared at 15 and 30), or show both with their labels."
    },
    {
      "id": "S2 (C35)",
      "default": "Risk factors listed with no numbers and no score: male, over 40, family history, a large thick neck or a lot of extra weight, large tonsils, a recessed chin. Plain lines, never tick boxes. Neck sizes, BMI over 35 and age over 50 are left out, because together they rebuild STOP-Bang (owner rule).",
      "where": [
        "categories.4.sections.3"
      ],
      "alternative": "Drop section 3 entirely; or keep only \"Anyone of any age\" and \"runs in your family\"."
    },
    {
      "id": "S3 (C36)",
      "default": "Drowsy-driving line in two places: a tick item (4.sections.2.items.11) and the fixed banner (4.note). Card 4 is pinned open (urgentContent). The red-flag wording itself stays in Chapter 02.",
      "where": [
        "categories.4.sections.2.items.11",
        "categories.4.note",
        "CHAPTER_META card 4 urgentContent"
      ],
      "alternative": "Banner only (no tick item); or no pin."
    },
    {
      "id": "S4 (C37)",
      "default": "CTS 2011 wait-time targets shown, with the year: 4 weeks for suspected severe cases, safety-critical jobs or some serious conditions; 6 months for everyone. These are targets, not real waits, and may raise hopes a region can’t meet.",
      "where": [
        "categories.7.items.6"
      ],
      "alternative": "Drop the targets and keep \"Waits can be long\" plus question 3 on the print sheet."
    },
    {
      "id": "S5 (C38)",
      "default": "PHAC 2009 \"23% never referred\" on card 7, labelled \"In a 2009 survey\".",
      "where": [
        "categories.7.items.7"
      ],
      "alternative": "Landing fact band only."
    },
    {
      "id": "S6 (C11)",
      "default": "Overnight oximetry alone isn’t enough to diagnose (BC Appendix E, 2021). Side by side: BC Appendix E says \"Overnight Oximetry - measures oxygen saturation and pulse rate. It is not an appropriate test to diagnose OSA.\" CTS 2011 (recommendation 2) says Level II, III and IV studies \"including oximetry\" can confirm OSA in patients with a moderate to high pretest probability. NIHB accepts level IV (overnight oximetry) for a CPAP benefit. CTS 2011 is not cited for this sentence.",
      "where": [
        "categories.8.items.9"
      ],
      "alternative": "Soften to \"Overnight oximetry on its own is usually not enough to diagnose sleep apnea\"; or add \"Some funding programs accept oximetry results. Your doctor decides whether it’s enough for you.\""
    },
    {
      "id": "S7 (C39)",
      "default": "One international line, labelled in the copy: \"International guidance: most people with sleep apnea snore, but not everyone who snores has sleep apnea\" (Healthwise US content on HealthLink BC, current as of 2022-11-07). No Canadian adult page fetched says it.",
      "where": [
        "categories.6.items.2"
      ],
      "alternative": "Drop the item. The card still works on items 1, 3 and 4."
    },
    {
      "id": "S8 (C40)",
      "default": "The machine's \"events per hour\" line on the AHI card, as a daily sign, not a test result; questions go to the sleep team. No settings advice.",
      "where": [
        "categories.9.items.7"
      ],
      "alternative": "Move it to Starting CPAP (Ch04, usage explainer)."
    },
    {
      "id": "S9 (C41)",
      "default": "Sex difference given only as \"twice as likely\". StatCan’s 4.0% for women is flagged \"Use with caution\", so the percentages are not printed.",
      "where": [
        "categories.3.items.3"
      ],
      "alternative": "Print 8.8% and 4.0% with \"(women: use with caution)\"."
    },
    {
      "id": "S10 (C28)",
      "default": "Ask roles: doctor (cards 1–8, 11) and sleepTeam (cards 9, 10). rrt is defined but not used as a card chip; the RRT is a lane on card 11. No pharmacist role or lane (no source).",
      "where": [
        "CHAPTER_META card ask roles",
        "categories.11.figure.lanes"
      ],
      "alternative": "Use rrt on card 10."
    },
    {
      "id": "S11 (C42)",
      "default": "Testing pathway framed as \"differs by province\". The home-test requisition is BC’s; Ontario’s ADP funding starts at a registered sleep clinic. Neither is named as the national rule. The family doctor or nurse practitioner is the first stop.",
      "where": [
        "categories.7.items.5"
      ],
      "alternative": "Name BC and Ontario as examples."
    },
    {
      "id": "S12 (C29)",
      "default": "Health risks of untreated sleep apnea: crashes, high blood pressure, heart attack and stroke (CLA, BC guideline). Diabetes and heart-failure links are left out (held, section E), although the BC guideline and StatCan both name diabetes.",
      "where": [
        "categories.1.items.5"
      ],
      "alternative": "Add \"type 2 diabetes\" (BC guideline, StatCan); or keep to \"daytime sleepiness and car crashes\" only."
    },
    {
      "id": "S13 (C43)",
      "default": "Sleep hours (7–9, or 7–8 at 65 and over) on the insomnia signpost, from PHAC’s 2019 infographic.",
      "where": [
        "categories.5.items.6"
      ],
      "alternative": "Drop it, so the signpost stays short."
    },
    {
      "id": "S14 (C43)",
      "default": "Sleepwell link on the insomnia signpost (route 2 chip opens https://mysleepwell.ca/cbti/). A not-for-profit led from Dalhousie, funded by the Drug Evaluation Alliance of Nova Scotia and the Government of Nova Scotia, with no industry funder listed. The copy doesn’t say \"free\".",
      "where": [
        "categories.5.items.4",
        "categories.5.figure.routes.2",
        "CHAPTER_META card 5 routes[1].link"
      ],
      "alternative": "Link only the Ontario Health standard, or no link."
    },
    {
      "id": "S15 (C44)",
      "default": "Women’s presentation line repeated on card 3 and in the checklist’s \"Signs vary\" section, so a woman whose main sign is tiredness isn’t put off by a snoring-led list.",
      "where": [
        "categories.3.items.4",
        "categories.4.sections.1.items.2"
      ],
      "alternative": "Keep it on one card only."
    },
    {
      "id": "S16 (C14)",
      "default": "Children’s home test follows CTS/CSS 2026 (press release, March 24, 2026): a lab study is the standard; a home test is second-line for otherwise healthy children over 5 when a lab study isn’t accessible. Side by side: BC guideline 2021, Appendix A: \"Polysomnography remains the gold standard for OSA diagnosis in children. HSAT is not recommended as it is not sensitive enough to be accurate.\"",
      "where": [
        "categories.8.note"
      ],
      "alternative": "Keep only \"For children, an overnight lab study is the standard\" and send the rest to Ch06."
    },
    {
      "id": "C45",
      "default": "\"Only a sleep study can tell\" wording (C\\*: \"only\" is ours; CLA says the best way to diagnose is an overnight lab test).",
      "where": [
        "categories.6.note",
        "categoriesIntro.heading"
      ],
      "alternative": "\"A sleep study is how it’s diagnosed.\""
    },
    {
      "id": "C23",
      "default": "Statistics Canada 2018 fact sheet (archived page) used for card 3's figures, with the survey years in the copy and \"(archived page)\" on the chip.",
      "where": [
        "categories.3.items.1",
        "categories.3.items.2",
        "categories.3.items.3",
        "categories.3.items.4",
        "categories.3.items.5"
      ],
      "alternative": "Drop the figures."
    },
    {
      "id": "E2 (build 8.3)",
      "default": "ui.chapter.ask.urgent = \"Don’t wait\" (01 and 02 wording). Each chapter keeps its own role keys (sleepTeam, rrt here).",
      "where": [
        "ui.chapter.ask.urgent"
      ],
      "alternative": "03's \"Call, don’t wait\"; or merge team/sleepTeam and rt/rrt into one role each."
    },
    {
      "id": "E1 (build 8.3)",
      "default": "urgentExit.link verbatim per chapter: \"Chapter 02 — Driving & Staying Safe\".",
      "where": [
        "urgentExit.link"
      ],
      "alternative": "All chapters use \"Stop and act now\"."
    },
    {
      "id": "E7 (build, card 11 lane 4)",
      "default": "Lane 4's in-site link to staying-safe#red-flags uses the spec's E-7 `to` field, gated like every lane link label (laneExtras): on /fr until laneExtras opens, the lane keeps its words (item 4) but drops the link; the never-gated urgentExit signpost still links to the red-flag block. The chapter file wanted this link never gated.",
      "where": [
        "categories.11.figure.lanes.4.linkLabel",
        "CHAPTER_META card 11 lanes[3].to"
      ],
      "alternative": "Make in-site lane links (to) ungated, as the urgentExit signpost is."
    }
  ],
  "prePublishChecks": [
    "Owner: the Liivv sleep support lane (card 11) and the care panel stay held until the Liivv sleep support service (Part C) is live; both are now in the machine plan (OPEN-QUESTIONS-SUPPLIES-ONLY section 6, rows 16 and 17).",
    "Engine: card 11 lane 4 uses E-7 (`to: { chapter: 'staying-safe', anchor: 'red-flags' }` on LaneMeta) and card 5 route 2 uses E-6 (`link` on a routes entry). Check both render; fallback: drop the link and keep the words (urgentExit already links the red-flag block).",
    "Navigation: chapter names in the copy (\"Chapter 02 — Driving & Staying Safe\", \"Your Treatment Options\", \"Starting CPAP\", \"This Might Be You\", \"Funding & Coverage\") match the built chapter titles and numbers.",
    "Chapter 02 hand-off: AboutKidsHealth's OSA page gives no emergency or \"when to seek care\" wording (checked 2026-10-13), so it cannot source a child red-flag line.",
    "Register hrefs (F18): cla-sleep-apnea → https://www.lung.ca/lung-diseases/sleep-apnea/; lhf-sleep-apnea → https://lunghealth.ca/lung-disease/sleep-apnea/; oh-insomnia-qs-2025 → the ontariohealth.ca content/dam PDF. Add the Ontario Health PDF to the monthly link check.",
    "statcan-osa-2018 chip carries \"(archived page)\"; the chapter's citation label (\"Statistics Canada — Sleep apnea in Canada, 2016 and 2017\") does not. Decide whether the foot citation should say it too.",
    "F7: read the full CTS/CSS 2026 paediatric guideline (Taylor & Francis returned 403) and confirm the card 8 note; then switch the citation to the DOI.",
    "mysleepwell: /about-us/ blocks plain downloads (403); re-check it loads before publishing, and that /cbti/ still serves.",
    "French (/fr): the AHI scale's adults-only line (figure.scale.adultsNote) goes with the figure while the ahiScale gate is closed, so /fr shows the bands in items 3–4 without \"adults (19 and over)\"; and the card note's \"This scale\" then refers to a drawing that isn't shown. Nurse to confirm this is acceptable until French review, or keep the figure on /fr."
  ],
  "heldCopy": {
    "released": "None. Every item below stays out of the message files and the meta; none of it is in section B.",
    "items": [
      {
        "topic": "Liivv sleep support team lane",
        "cards": [
          11
        ],
        "why": "Service not live (plan Part C: the site promises only what is live; each service line has its own gate). Owner sourced, no SourceId. Supplies-only decision 2026-10-13: keep held; machine plan.",
        "wording": "Label: \"Liivv’s sleep support team\". Scope: \"A Liivv service · [provinces where Liivv’s RRTs are licensed] · [hours]\". Body: \"Help choosing and using your equipment, once your treatment is prescribed. Your prescriber sets your settings.\" Link: \"Book a call (sign-in needed)\".",
        "check": "Gate service:rrt-pap-start; owner (licence map, hours)"
      },
      {
        "topic": "Care panel (\"Questions about getting started\", the slot Diabetes uses for its pharmacist panel)",
        "cards": [],
        "why": "As above: the Liivv sleep support service is not live. Supplies-only decision 2026-10-13: keep held; machine plan.",
        "wording": "Heading: \"Got a prescription? We can help from here\". Body: \"Liivv’s sleep support team helps with your equipment once your treatment is prescribed. Your diagnosis and your settings stay with your doctor and sleep team.\" CTA: \"Book a call\".",
        "check": "Gate service:rrt-pap-start"
      },
      {
        "topic": "Pharmacist lane",
        "cards": [
          11
        ],
        "why": "No source on a pharmacist’s role in sleep apnea (plan Part F; C28).",
        "wording": "—",
        "check": "A Canadian pharmacy body’s page"
      },
      {
        "topic": "Provincial health line lane (811, HealthLink BC navigator)",
        "cards": [
          11
        ],
        "why": "Not fetched for this chapter. HealthLink BC’s snoring page only says \"Speak to a navigator…\".",
        "wording": "\"Your provincial health line: questions about where to start\"",
        "check": "Each province’s 811 page"
      },
      {
        "topic": "Dentist lane",
        "cards": [
          11
        ],
        "why": "Oral appliances belong to Ch03. CDA position (cda-oat) not fetched in this pass.",
        "wording": "\"A dentist: an oral appliance, once a doctor has diagnosed sleep apnea\"",
        "check": "cda-oat"
      },
      {
        "topic": "Anti-snoring and \"boil-and-bite\" devices",
        "cards": [
          6
        ],
        "why": "BC Appendix G (\"boil-and-bite not recommended\") not fetched in this pass; it belongs to Ch03.",
        "wording": "\"Over-the-counter snoring devices aren’t a treatment for sleep apnea. See Your Treatment Options.\"",
        "check": "bcg-osa-adults Appendix G; cda-oat"
      },
      {
        "topic": "ADP \"in-lab Level 1 study at an ADP-registered lab\"",
        "cards": [
          7
        ],
        "why": "The ADP web page (fetched) names only \"a doctor at a sleep clinic registered with the ADP\". The Level 1 requirement is in the policy manual, not fetched in this pass.",
        "wording": "\"In Ontario, ADP funding needs an in-lab sleep study at an ADP-registered sleep clinic.\"",
        "check": "ADP Respiratory Policy & Administration Manual"
      },
      {
        "topic": "Other provinces’ test rules (Saskatchewan accepts Level 1 or 3; NIHB accepts I, III, IV)",
        "cards": [
          7
        ],
        "why": "Saskatchewan not fetched in this pass. The NIHB levels are verified but held for the funding page (S6).",
        "wording": "—",
        "check": "sk-sail-cpap; funding.md"
      },
      {
        "topic": "STOP-Bang and Epworth questionnaires themselves",
        "cards": [
          4,
          7
        ],
        "why": "Owner rule (no STOP-Bang). Card 7 mentions only \"a short questionnaire about daytime sleepiness\".",
        "wording": "—",
        "check": "—"
      },
      {
        "topic": "Neck, BMI and age cut-offs",
        "cards": [
          4
        ],
        "why": "S2 (would rebuild STOP-Bang).",
        "wording": "—",
        "check": "—"
      },
      {
        "topic": "Real wait times (CTS 2011: Ontario, \"a mean time of 11.6 months to initiate CPAP therapy\")",
        "cards": [
          7
        ],
        "why": "A 2004-era study, now dated.",
        "wording": "—",
        "check": "A current provincial wait-time source"
      },
      {
        "topic": "Diabetes and heart-failure links",
        "cards": [
          1
        ],
        "why": "Plan holds \"heart and diabetes links\" (S12, C29).",
        "wording": "\"It’s also linked to type 2 diabetes and heart failure.\"",
        "check": "Heart & Stroke or Diabetes Canada page; or the nurse rules BC/StatCan enough"
      },
      {
        "topic": "Sleep hypoventilation, Cheyne-Stokes, complex apnea",
        "cards": [
          1
        ],
        "why": "Specialist detail. Central and complex apnea belong to Ch03 (ASV held).",
        "wording": "—",
        "check": "bcg-osa-adults (on page)"
      },
      {
        "topic": "Children’s prevalence (LHF: \"2 to 3% of children are likely to have sleep apnea\"; BC: \"1-4% of children\")",
        "cards": [
          1
        ],
        "why": "The two sources differ, and the topic belongs to Ch06.",
        "wording": "—",
        "check": "Ch06 ruling"
      },
      {
        "topic": "AboutKidsHealth emergency wording for a child struggling to breathe (Ch02 red flags)",
        "cards": [],
        "why": "The page has no \"when to seek care\" or emergency text (fetched 2026-10-13). Affects Chapter 02, not this chapter.",
        "wording": "—",
        "check": "Another child-specific Canadian page (CPS / Caring for Kids), or the nurse rules the line out"
      },
      {
        "topic": "Sleep On It (Canadian Sleep Society public site)",
        "cards": [
          5
        ],
        "why": "Site down (plan Part F).",
        "wording": "—",
        "check": "Recheck"
      }
    ]
  }
};
