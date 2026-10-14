/*
 * Reviewer-only data for the Sleep Apnea Care pack, starting-cpap (generated from the build's
 * `ch04` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "S1",
      "default": "OPEN-QUESTIONS C9. **Adherence: licensing measures only, never a health target.** Card 8 shows the CTS/CSS and CCMTA/BC measures under \"not a health target; your sleep team sets your goal\". Card 7 says only \"wear it the whole time you sleep, every night\" (Alberta pathway). Side by side, not shown: Alberta's pathway sets a goal (\"at least 4 hours a night at least 5 nights a week\"); BC Guidelines (for clinicians): \"every night, all night\" and, for persistent fatigue, \"7 hours or more recommended\" (held as E.5).",
      "where": [
        "categories.7.items.3",
        "categories.8.note",
        "categories.8.figure"
      ],
      "alternative": "(a) Add Alberta's goal to card 7 with its own chip and \"your sleep team may set a different goal\"; (b) add BC's \"every night, all night\" as the ideal."
    },
    {
      "id": "S2",
      "default": "OPEN-QUESTIONS C34 (the magnet part, C3 / S26 / N7, was ANSWERED 2026-10-13 and is built: no \"stop using it\" line; tell your RT before you choose; already using one, check with the mask’s maker and your health care team; chips are Health Canada notices only). **Mask-picker mappings:** each rests on a non-industry source (BC buyer's guide, Canadian Lung Association, BC Guidelines), worded \"may suit\", never \"best for you\". The full-face line drops BC's \"(requiring high pressure settings)\"; the pillows-on-bilevel line is \"ask your RT whether nasal pillows suit you\", with no pressure words.",
      "where": [
        "categories.3.figure.reasons",
        "categories.3.figure.bilevelNote",
        "categories.3.figure.magnetNote",
        "categories.3.items.5"
      ],
      "alternative": "Drop the picker and keep only the three mask types (items 1–3)."
    },
    {
      "id": "S4",
      "default": "OPEN-QUESTIONS C12. **Follow-up schedule:** the BC buyer's guide schedule (about 7 days, 2–4 weeks with an overnight oxygen test, 30 and 60 days), then yearly (BC Guidelines; Alberta agrees on 2–4 weeks and at least yearly), shown for every province, with the basis in the note as \"Canadian provincial guidance\" (BC not named in the prose).",
      "where": [
        "categories.1.items.2",
        "categories.1.items.3",
        "categories.1.items.4",
        "categories.1.items.5",
        "categories.1.note",
        "categories.1.figure"
      ],
      "alternative": "Name BC in the note; or show only Alberta's schedule (2–4 weeks, then yearly); or \"then over the long term\" instead of \"every year\" (PATHS P11)."
    },
    {
      "id": "S5",
      "default": "OPEN-QUESTIONS C15, C16. **Children in Ch04:** two short notes (fit, first nights) from AboutKidsHealth and the paediatric-mask line from the children's section of Alberta's buyer's information. Alberta's \"Children should not use auto-adjustable pressure CPAP equipment\" is held for Ch06 (E.6).",
      "where": [
        "categories.3.items.4",
        "categories.4.note",
        "categories.7.note"
      ],
      "alternative": "Move both notes to Ch06 and link; or add the fixed-pressure line here with a child chip."
    },
    {
      "id": "S6",
      "default": "OPEN-QUESTIONS C28. **Pharmacist mentioned once**, for dry-mouth products (Canadian Lung Association: \"Ask your pharmacist for artificial saliva or oral lubricant products\"). No pharmacist lane or role on this site (E.9). With no RRT service at launch, confirm there is still no pharmacist lane.",
      "where": [
        "categories.9.items.2"
      ],
      "alternative": "Drop the pharmacist clause; or add a narrow pharmacist lane (\"products for a dry mouth or stuffy nose\")."
    },
    {
      "id": "S7",
      "default": "OPEN-QUESTIONS C13. **Replacement timing is not in this chapter;** Ch05's resupply planner shows cadences side by side. For the record: Alberta's pathway \"The mask should be replaced every 6 to 12 months\"; BC buyer's guide \"accessories every 3-12 months\", machines \"every 3-5 years\". (Card 6's note, which pointed to Everyday Liivving for this, is held out of the tree: see N2/N10 below.)",
      "where": [],
      "alternative": "Show the ranges here too."
    },
    {
      "id": "S8",
      "default": "OPEN-QUESTIONS C32. **Humidity counts as a setting:** card 5 says \"ask your RT, rather than changing the settings yourself\". HealthLink BC's (Healthwise, US) \"set the machine to deliver warmer or wetter air\" and AboutKidsHealth's \"Increase the setting… or reduce the setting\" are never used (E.4).",
      "where": [
        "categories.5.items.6",
        "categories.5.items.7",
        "categories.9.items.3",
        "categories.9.items.7"
      ],
      "alternative": "The nurse may rule that humidity comfort controls are not \"settings\" under the rule. The owner's standing rule is \"no settings advice ever\", so the default stays."
    },
    {
      "id": "S9",
      "default": "OPEN-QUESTIONS C20, C47. **Usage explainer rows (source check 2026-10-13):** \"Driving, once treated\" (CTS/CSS 2014, with \"The rules for commercial drivers are stricter\") and \"Severe sleep apnea, any licence\" (RoadSafetyBC 18.6.1, headed \"OSA – All drivers\"; the RT-download proof is a BC Guideline, so the copy says \"In BC\"). The rail row is held (E.16): its numbers rest only on the Railway Association of Canada handbook, an industry association document.",
      "where": [
        "categories.8.figure.rows"
      ],
      "alternative": "(a) Move the commercial detail to Ch02; (b) release E.16 if the RAC handbook is ruled the official text, or release only the number-free Transport Canada line."
    },
    {
      "id": "S10",
      "default": "OPEN-QUESTIONS C51. **\"Talk to your doctor before you stop\"** is our framing, after the source's \"If you stop using CPAP, your sleep apnea symptoms come back\".",
      "where": [
        "categories.10.items.6"
      ],
      "alternative": "Keep only the sourced sentence."
    },
    {
      "id": "S11",
      "default": "OPEN-QUESTIONS C52. **\"Where it’s within their scope of practice, respiratory therapists can recommend your equipment…\"** rests on NIHB's benefit rule, which names the provinces where it applies (AB, SK, MB, ON, QC, NS, NB, NL); the copy states it generally.",
      "where": [
        "categories.11.note"
      ],
      "alternative": "Limit it to NIHB clients; or drop it."
    },
    {
      "id": "S12",
      "default": "OPEN-QUESTIONS C53 (with C1, C2). **No red-flag block and no 911 line in this chapter;** it signposts Ch02's block (which since ruling C1 opens with a 911 tier) from the urgent exit, card 9 answer 10 and card 11 lane 4. Health lines: BC (8-1-1, 7-1-1) and Alberta (811, any time) only. AboutKidsHealth's \"If your child is sick and you are concerned about their breathing… local emergency department\" is not beside card 7's child note.",
      "where": [
        "categories.11.items.3",
        "categories.11.items.4",
        "categories.7.note",
        "urgentExit"
      ],
      "alternative": "Add other provinces' health lines once each one's page is fetched; add the AboutKidsHealth breathing line to 7.note."
    },
    {
      "id": "E1",
      "default": "**Red-flag link wording:** the copy's own placeholder \"Urgent signs\" is used verbatim (build spec 8.3), in the urgent exit, card 9's red-flag link and card 11's lane 4. Ch02's block heading is \"Stop and act now\" (02 R12 asks whether it becomes \"Get help now\"); 03, 05 and 06 use \"Get help now\".",
      "where": [
        "urgentExit.link",
        "categories.9.figure.redFlagLink",
        "categories.11.figure.lanes.4.label"
      ],
      "alternative": "Every signpost uses Ch02's final heading."
    },
    {
      "id": "E2",
      "default": "**Ask roles:** this chapter's `rt` (\"Ask your RT\"), `prescriber` and `sleepTeam` keys are kept as written (build spec 8.3). Chapters 01 and 02 use `rrt` (\"Ask a respiratory therapist\") for the same profession; 03 uses `team` for \"Ask your sleep team\".",
      "where": [],
      "alternative": "Merge `rt` into `rrt` (and `team` into `sleepTeam`) with one label."
    },
    {
      "id": "N2/N10",
      "default": "**Card 6's note is held out of the tree.** Its last sentence, \"Machines need a prescription, so Liivv never sells them as a one-click buy.\", implies Liivv sells machines; Liivv sells none (N1, all hidden). The supplies-only list (section 6, row 26) says to replace it with the N2 line, and the 2026-10-13 pass left that row undone. The note's other two sentences (parts wear out; when to replace them is in Everyday Liivving) go with it, because the copy is never re-cut. Card 6 ships as its six items in two columns.",
      "where": [],
      "alternative": "The content author rewrites `categories.6.note` with the N2 line (\"Liivv doesn’t sell CPAP or other sleep apnea machines yet.\", N10 still open on \"yet\") and the two sourced sentences, then it re-enters the tree."
    },
    {
      "id": "LAND-mask-door",
      "default": "**The landing's \"Struggling with my mask\" door opens this chapter at card 9** (Fix a common problem), whose wording the door's body matches (build spec 8.1, 8.3).",
      "where": [
        "categories.9.title"
      ],
      "alternative": "Card 3 (the mask picker), as this chapter's A.2 proposed."
    }
  ],
  "prePublishChecks": [
    "`crto-pap`: the CRTO Practice FAQ is from March 2012. Confirm it is still current on crto.on.ca, or find the current interpretation page (OPEN-QUESTIONS F3).",
    "`bc-pap-buyers-guide`: done by the source check (2026-10-13): the BC Patient Information page (last updated May 18, 2023) still links it. Recheck monthly (F16).",
    "`rac-rail-handbook-2026` (held E.16 only): confirm the ≥ sign in \"Average hours used over all days ≥ 5 hours\" against the rendered PDF page 141. Needed only if E.16 is released (F6).",
    "Health Canada magnet recalls: check the chip labels against Health Canada's own titles: \"Magnets in certain Philips Respironics sleep therapy masks may cause serious injury to some individuals\" (RA-64582), \"Airtouch and Airfit ResMed Masks\" (RA-74733) and \"Respironics Masks\" (RA-64545). The copy names no maker either way (F5).",
    "Card 3's chips now include `hc-recall-magnet-philips-masks-2022` (RA-64545), which section C cites for 3.items.5 and the magnet note since ruling C3; A.2's card list had not caught up.",
    "Card 11 item 3 (BC 8-1-1) cites `hlbc-cpap` (Healthwise content, chip labelled international) for HealthLink BC's own footer line. The register also has `hlbc-811` (HealthLink BC's 8-1-1 services page, CA-gov). Consider citing `hlbc-811` for that sentence.",
    "The citation for the Canadian Lung Association uses the register's current address (https://www.lung.ca/lung-diseases/sleep-apnea/); the address in the content file 301-redirects there."
  ],
  "heldCopy": {
    "released": "Closed by ruling C7 (2026-10-13): E.1, \"online providers are not recommended\" for new users. Card 1 item 1 now opens \"Wherever you get your equipment, online or in person\". Replaced by ruling C3 / S26 / N7 (2026-10-13): the source check's \"stop using it, and ask your doctor or care provider to help you find one without magnets\" in 3.items.5 and the magnet note; a current user now checks with the mask’s maker and their health care team.",
    "items": [
      {
        "topic": "Battery packs and power outages (E.2)",
        "cards": [
          6
        ],
        "why": "Held by the plan (\"battery/outage use\"); OPEN-QUESTIONS C30 default: held everywhere",
        "wording": "\"A battery pack lets you use CPAP where you can’t plug in, such as camping or a power outage. Ask your RT which one works with your machine.\"",
        "check": "cla-sleep-apnea (verified); BC buyer's guide \"Power Options\" (verified)"
      },
      {
        "topic": "Comfort features: gradual start-up pressure, exhalation relief, auto-start (E.3)",
        "cards": [
          9
        ],
        "why": "Permanent exclusion under the no-settings rule. The BC guide and BC Guidelines describe them",
        "wording": "—",
        "check": "—"
      },
      {
        "topic": "Humidity setting changes (E.4)",
        "cards": [
          5,
          9
        ],
        "why": "S8 / C32: humidity counts as a setting",
        "wording": "—",
        "check": "hlbc-cpap; akh-pap (never quoted)"
      },
      {
        "topic": "Alberta's usage goal (4 h, 5 nights a week) and BC's \"7 hours or more\" (E.5)",
        "cards": [
          7,
          8
        ],
        "why": "S1 / C9: adherence is a licensing measure, not a health target",
        "wording": "\"Ask your sleep team what your goal is. Some provincial guidance suggests at least 4 hours a night, at least 5 nights a week.\"",
        "check": "ab-osa-pathway-2026; bcg-osa-adults (verified)"
      },
      {
        "topic": "Children: fixed-pressure CPAP only (E.6)",
        "cards": [
          3
        ],
        "why": "S5 / C16; belongs in Ch06",
        "wording": "\"Children use fixed-pressure CPAP, not auto-adjusting machines. Your child’s sleep team chooses the machine.\"",
        "check": "ab-cpap-buyers-2026 (verified)"
      },
      {
        "topic": "Noise (E.7)",
        "cards": [
          9
        ],
        "why": "Alberta lists noise as a common reason people struggle, but no source gives a fix",
        "wording": "\"Machine noise bothering you? Ask your RT.\"",
        "check": "ab-osa-pathway-2026 (problem only); a source for the fix"
      },
      {
        "topic": "Medicines for a stuffy nose: saline rinses, steroid sprays, decongestants (E.8)",
        "cards": [
          9
        ],
        "why": "Medicine advice; BC Guidelines is clinician-facing and HealthLink BC is US content",
        "wording": "\"If your nose stays stuffy, ask your doctor or pharmacist what might help.\"",
        "check": "bcg-osa-adults (\"Saline nasal rinses +/- intranasal steroid\"); hlbc-cpap"
      },
      {
        "topic": "Pharmacist lane (E.9)",
        "cards": [
          11
        ],
        "why": "The plan holds the pharmacist role; S6 / C28",
        "wording": "\"A pharmacist: products for a dry mouth\"",
        "check": "cla-sleep-apnea (narrow)"
      },
      {
        "topic": "Warranty and loaners (E.10)",
        "cards": [
          6
        ],
        "why": "Liivv's own warranty and loaner policies are owner questions (Part C step 7; S20). Returns were settled by N6 (masks and supplies can't be returned once delivered; stated on the shop). Stating the general norm before Liivv's policy exists could mislead",
        "wording": "\"Equipment bought in Canada usually comes with a 3-year warranty. Ask about loaners while yours is repaired.\"",
        "check": "ab-cpap-buyers-2026 (verified)"
      },
      {
        "topic": "Mask cleaning detail and filter timing (E.11)",
        "cards": [
          5,
          6
        ],
        "why": "Belongs in Ch05. The Canadian Lung Association's \"Change the filter on your CPAP machine every 2 months, or as needed.\" is on the page (re-read 2026-10-13), so Ch05 can lift the plan's hold for its planner",
        "wording": "—",
        "check": "cla-sleep-apnea; ab-osa-pathway-2026"
      },
      {
        "topic": "PAP pillow for a child who sleeps on their tummy (E.12)",
        "cards": [
          7
        ],
        "why": "Product suggestion; child-only; Ch06",
        "wording": "\"If your child sleeps on their tummy, ask about a PAP pillow.\"",
        "check": "akh-pap (verified)"
      },
      {
        "topic": "Costs: $1,600–$2,800; trial $100–$250 (E.13)",
        "cards": [
          6
        ],
        "why": "Belongs in the funding page (Paying for it)",
        "wording": "—",
        "check": "ab-cpap-buyers-2026; ab-osa-pathway-2026"
      },
      {
        "topic": "Liivv sleep support service lines (E.14; Part C, not live)",
        "cards": [
          1,
          4,
          8,
          11
        ],
        "why": "The Liivv sleep support (RRT) service is not live and makes no promises (supplies-only decision, 2026-10-13; rows 24, 25, 29, 30, 31: machine plan, or N5). Out of the tree: card 1 figure.service.1/2/4/5 and serviceLinkLabel, card 4 service.body and linkLabel, card 8 figure.service.body and linkLabel, card 11 figure.lanes.5 (label, scope, body, linkLabel) and rtPanel (eyebrow, heading, body, cta)",
        "wording": "Card 1: \"Liivv’s sleep support team can book your setup call, by video or phone.\" / \"Liivv’s sleep support team checks in with you.\" / \"Liivv’s sleep support team reviews your machine’s data with you.\" (steps 4 and 5) / \"Book a setup call\". Card 4: \"Liivv’s sleep support team can help you check your mask fit by video.\" / \"Request a mask fit call\". Card 8: \"Need a usage report for your prescriber or insurer? Liivv’s sleep support team can prepare one from your machine’s data. It reports facts only. It never says whether you’re fit to drive.\" / \"Ask for a usage report\". Card 11 lane 5: \"Liivv’s sleep support team\" / \"A Liivv service · provinces and hours to be confirmed\" / \"Setup calls, mask fit help and data reviews, by video or phone. Pressure and settings stay with your prescriber.\" / \"Request a call (sign-in needed)\". RT panel: \"Liivv’s sleep support team\" / \"Starting CPAP? We can help you get set up.\" / \"Liivv’s respiratory therapists help with your setup, your mask fit and your first weeks, by video or phone. Your prescriber sets your treatment and your pressure.\" / \"Request a call\"",
        "check": "Owner: Part C decisions (S1–S4, S7, S16, S24) and provinces, hours and phone number"
      },
      {
        "topic": "Sleepy despite CPAP: stimulant medicine (E.15)",
        "cards": [
          9
        ],
        "why": "Out of scope (medicine); C25",
        "wording": "—",
        "check": "cla-sleep-apnea"
      },
      {
        "topic": "Rail usage row (E.16)",
        "cards": [
          8
        ],
        "why": "The 14-day report and \"average 5 hours or more\" rest only on the Railway Association of Canada handbook, an industry association document (an industry page is never the only source). Transport Canada's rules page names sleep apnea but gives no figure. The ≥ sign is blank in the PDF text layer. S9 / C20",
        "wording": "Row \"Safety-critical railway jobs\": \"With moderate or severe sleep apnea on PAP: a 14-day report showing average use of 5 hours or more over all days\" / foot \"The railway’s chief medical officer makes the decision.\" Number-free alternative (Transport Canada only): \"Sleep apnea is one of the conditions checked for fitness for duty. The railway’s chief medical officer decides.\"",
        "check": "rac-rail-handbook-2026 (industry, page 141); tc-railway-medical-rules (verified)"
      },
      {
        "topic": "Swallowing air, aerophagia (E.17)",
        "cards": [
          9
        ],
        "why": "Only the US Healthwise page names it; no Canadian page fetched for this chapter does (Alberta names bloating only)",
        "wording": "Chip and answer: \"Bloating, or swallowing air: tell your healthcare team. They may have ideas to help\"",
        "check": "A Canadian page that names it (hlbc-cpap is US content)"
      },
      {
        "topic": "Card 6's note: replacement pointer and the machine line (N2 / N10)",
        "cards": [
          6
        ],
        "why": "Its last sentence implies Liivv sells machines (by prescription, not one-click). Liivv sells no machines (N1). Supplies-only section 6, row 26: replace with the N2 line; not done in the 2026-10-13 pass. Copy is never re-cut, so the whole note waits",
        "wording": "\"Masks, tubing, filters and water chambers wear out and need replacing from time to time. When to replace them is in Everyday Liivving. Machines need a prescription, so Liivv never sells them as a one-click buy.\"",
        "check": "Owner: N2 and N10 wording; the content author re-issues 6.note (bc-pap-buyers-guide for s1)"
      }
    ]
  }
};
