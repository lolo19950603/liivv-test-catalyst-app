/*
 * Reviewer-only data for the Sleep Apnea Care pack, everyday-liivving (generated from the build's
 * `ch05` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "R1",
      "default": "Cadences side by side: the planner shows six labelled columns (Your manual first with no value; General range from the BC guide and the CLA filter line; NIHB and BCEA funding limits; Ontario ADP/ODSP funding; one maker, ResMed Canada, labelled \"Maker\"). Only one maker is shown.",
      "where": [
        "categories.3.figure",
        "categories.3.items.4",
        "categories.3.items.6"
      ],
      "alternative": "Drop the maker column (a single brand may read as an endorsement); or add more makers' published Canadian schedules (Fisher & Paykel, Philips) so no brand stands alone. (OPEN-QUESTIONS C13.)"
    },
    {
      "id": "R3",
      "default": "Doctor's letter for flying: both shown. Not required at security (7.items.6), but a letter can help (7.note); the checklist lists it (8.items.4).",
      "where": [
        "categories.7.items.6",
        "categories.7.note",
        "categories.8.items.4"
      ],
      "alternative": "Drop the letter from the checklist and keep only CATSA's line."
    },
    {
      "id": "R4",
      "default": "Hospital stays released as card 9 (sourced on CLA and LHF), with the medical alert bracelet line. Nothing about hospital rules for equipment from home.",
      "where": [
        "categories.9",
        "categories.8.note"
      ],
      "alternative": "Hold card 9 and keep only 8.note; or drop the bracelet line (9.items.4)."
    },
    {
      "id": "R5",
      "default": "Child's mask cleaning \"each morning\" (AboutKidsHealth only) on card 5, which stays in this chapter. Paediatric masks are sold online (C17 answered), but card 5 gets no shop strip because its note is urgent.",
      "where": [
        "categories.5.items.2",
        "categories.5"
      ],
      "alternative": "Move card 5 to Chapter 06 (children); or keep it here and add a link from Chapter 06. Where a paediatric strip goes is an owner placement question."
    },
    {
      "id": "R6",
      "default": "Batteries and power outages: held (E1). Sources exist.",
      "where": [
        "categories.8.items",
        "categories.4.items"
      ],
      "alternative": "Release E1's wording on card 8 and a new power-outage line, as the nurse rules."
    },
    {
      "id": "R7",
      "default": "The 4 h / 70% figure is shown once, framed as a licensing measure for people told not to drive, with \"your sleep team sets your goal\".",
      "where": [
        "categories.6.items.7"
      ],
      "alternative": "Drop the figure here and link to Chapter 04's usage explainer only."
    },
    {
      "id": "R8",
      "default": "The machine's \"events per hour\" read-out is explained as a daily sign, not a sleep test result.",
      "where": [
        "categories.6.items.3"
      ],
      "alternative": "Drop the item (some readers may self-interpret the number)."
    },
    {
      "id": "R9",
      "default": "Vinegar rinse included as an option, after \"manual first\". Some manuals may not allow it.",
      "where": [
        "categories.1.items.4"
      ],
      "alternative": "Drop the vinegar clause; keep \"rinse in plain water\"."
    },
    {
      "id": "R10",
      "default": "Distilled water stated for any humidifier (CLA states it under \"If you have a heated humidifier\"; the BC guide describes humidifiers generally).",
      "where": [
        "categories.1.items.7"
      ],
      "alternative": "Say \"If you use a heated humidifier\"."
    },
    {
      "id": "R11",
      "default": "Worn-part signs rest on CLA (4.items.2). The weight-change line links NIHB's early-replacement rule to mask fit (4.items.6 s3).",
      "where": [
        "categories.4.items.6"
      ],
      "alternative": "Drop 4.items.6 s3 (\"and a mask may no longer meet your needs\")."
    },
    {
      "id": "R12",
      "default": "Airline lines: 7.items.8 rests on the CTA web page (tell the reservation agent about the device, batteries or onboard power), supported by the CTA guide; neither names CPAP. 7.items.9 (two-carry-on limit) from travel.gc.ca, with \"check your airline\" added. ATPDR s.49 stays held (E2).",
      "where": [
        "categories.7.items.8",
        "categories.7.items.9",
        "categories.8.items.7"
      ],
      "alternative": "Replace both with the landing's E6 wording: \"If you want to use your machine on board, ask your airline before you fly.\""
    },
    {
      "id": "R13",
      "default": "Altitude in the travel checklist (BC guide): the copy says only \"altitude can change how some machines work\" and \"ask your equipment provider first\" (no pressure-setting words).",
      "where": [
        "categories.8.items.6"
      ],
      "alternative": "Drop the item (Chapter 03 card 4 already covers altitude)."
    },
    {
      "id": "ops-1",
      "default": "ODSP lists a \"Sanitizing unit\" among eligible PAP supplies; NIHB excludes sanitizing machines and cleansers. The planner leaves sanitizing units out and card 2 does not mention funding. Liivv never stocks ozone or UV sanitizers (Part D store rule).",
      "where": [
        "categories.3.figure",
        "categories.2"
      ],
      "alternative": "Owner: confirm the store rule stands whatever a program funds."
    },
    {
      "id": "ops-2",
      "default": "ODSP replacement frequencies are not published on the schedule page; the planner says \"replacements for recipients, with approval\" without a frequency.",
      "where": [
        "categories.3.figure.cells.ontario"
      ],
      "alternative": "Owner question: do Liivv's pharmacy staff have ODSP's MSN frequency table?"
    },
    {
      "id": "ops-3",
      "default": "Subscription intervals (plan Part D: 2, 3 and 6 months) are never presented as the \"right\" schedule; the planner never links to Subscribe & save (landing E2; held E11).",
      "where": [
        "categories.3.figure"
      ],
      "alternative": "Owner: unchanged until landing E2 is met."
    }
  ],
  "prePublishChecks": [
    "NIHB list (nihb-pap): re-check the effective date and the supply rows (2026-07-29 version) before go-live; limits change. (OPEN-QUESTIONS F8)",
    "BCEA manual (bc-bcea-breathing): confirm the replacement table (effective 2024-09-01) is unchanged. (F9)",
    "ADP (on-adp-resp-manual-2024): confirm the July 2024 policy manual is still the current edition (a 2026-04-01 product manual exists; it is a price list and was not read).",
    "ResMed Canada tip sheet (resmed-ca-tipsheet-2021): confirm the 2021-07 sheet is still the maker's current Canadian sheet. (F11)",
    "CATSA infographic (catsa-respiratory-2025): confirm the 2025 PDF is still linked from catsa-acsta.gc.ca. (F12)"
  ],
  "heldCopy": {
    "released": "Released, not held: hospital stays (card 9, sourced on CLA and LHF, R4 default) and the CLA filter line (3.items.4, re-read 2026-10-13). Ruling C5 (2026-10-13, \"default\") applied: card 2 is \"Ozone and UV cleaners\" with the Philips-scoped 2.items.2; the every-device line is E15. Rulings C3/S26/N7 applied to 3.note (no \"stop using\" line). No card is fully held; nothing in this chapter is held in tree.",
    "items": [
      {
        "topic": "Battery packs and power outages",
        "cards": [
          8,
          4
        ],
        "why": "Held by instruction (brief; plan Part F \"battery/outage use\"). Sources exist (CLA battery-pack lines; BC guide alternative power options). CATSA \"Guidelines for batteries\" does not name CPAP.",
        "wording": "Ask your equipment provider whether a battery pack works with your machine, for trips or a power outage. Check your airline’s battery rules before you fly.",
        "check": "cla-sleep-apnea; bc-pap-buyers-guide; CATSA guidelines for batteries (catsa-batteries, sources.md section 12: register only if E1 is released). Ruling R6."
      },
      {
        "topic": "Using CPAP on board: ATPDR s.49",
        "cards": [
          7
        ],
        "why": "s.49 does not name CPAP, and the s.1 definition does not settle whether a CPAP is a \"small assistive device\" for a given traveller. The CTA mobility-aids page’s on-board line does not list CPAP either. Same as landing E6.",
        "wording": "Canada’s accessible transportation rules say an airline must let a person with a disability keep a small assistive device they need during travel with them on board. Ask your airline how this applies to your CPAP.",
        "check": "A CTA decision or guidance naming CPAP (atpdr-s49 registered, held use only)."
      },
      {
        "topic": "In-flight power and outlets",
        "cards": [
          7
        ],
        "why": "No Canadian source fetched covers in-flight power for CPAP.",
        "wording": "— (none proposed)",
        "check": "Airline pages (industry; would need an official second source)."
      },
      {
        "topic": "Medicines that make sleep apnea worse (before hospital stays)",
        "cards": [
          9
        ],
        "why": "Sourced on CLA, but opioid and sedative interactions are held site-wide (plan Part F).",
        "wording": "Ask your sleep doctor about all your medicines, including herbal and over-the-counter ones. Some can make sleep apnea worse.",
        "check": "cla-sleep-apnea (verified); nurse scope ruling."
      },
      {
        "topic": "Philips recall: particles in the tubing or mask",
        "cards": [
          4
        ],
        "why": "Recall-specific: belongs in Chapter 02’s recall card, not a general worn-part list.",
        "wording": "(Chapter 02)",
        "check": "cts-css-csrt-philips-2021 (verified)."
      },
      {
        "topic": "Driving: RT data download for licensing (BC)",
        "cards": [
          6
        ],
        "why": "Driving content belongs to Chapter 02; card 6 links there.",
        "wording": "(Chapter 02)",
        "check": "rsbc-ccmta-18-6-1 (verified)."
      },
      {
        "topic": "Distilled water alternatives (boiled or tap water when distilled isn’t available)",
        "cards": [
          1,
          8
        ],
        "why": "No Canadian source found.",
        "wording": "— (none proposed)",
        "check": "—"
      },
      {
        "topic": "Cleaning when you have a cold, or more often in summer",
        "cards": [
          1
        ],
        "why": "No Canadian source found.",
        "wording": "— (none proposed)",
        "check": "—"
      },
      {
        "topic": "Packing spare supplies for a trip",
        "cards": [
          8
        ],
        "why": "No source found (the CTA guide’s note on equipment at destination is about carriers accepting it, not a packing tip).",
        "wording": "Pack a spare mask cushion and filter for longer trips.",
        "check": "—"
      },
      {
        "topic": "Machine replacement for \"new technology\" or comfort features",
        "cards": [
          3
        ],
        "why": "Maker’s claim only; industry-only and promotional. Liivv sells no machines.",
        "wording": "None",
        "check": "—"
      },
      {
        "topic": "Subscribe & save in the planner",
        "cards": [
          3
        ],
        "why": "Landing E2 conditions (stock, per-product intervals, machines blocked).",
        "wording": "—",
        "check": "Owner."
      },
      {
        "topic": "Liivv’s sleep support team (Part C service; not live): card 6 service note, card 10 lane 6, support panel",
        "cards": [
          6,
          10
        ],
        "why": "Part C is not live; hours, provinces, data access and consent wording not drafted. Out of tree under spec 8.4 (all sleep-support service copy). Supplies-only re-sort rows 32-33: machine plan, or rewrite for N8.",
        "wording": "categories.6.serviceNote: With your consent, Liivv’s sleep support team checks in after you start and reviews your machine’s data with you at 30 and 60 days. Any change to your pressure goes to your prescriber. | categories.10.figure.lanes.6: label \"Liivv’s sleep support team\"; scope \"A Liivv service · hours and provinces to be confirmed\"; body \"Supplies, mask fit and your replacement schedule. We never change your pressure: that’s your prescriber’s job.\"; linkLabel \"Request a call (sign-in needed)\" (href /account/virtual-care/appointment?service=rrt-data-review, topics parts, paying) | support: eyebrow \"Liivv’s sleep support team\"; heading \"Help with supplies and your schedule\"; body \"Liivv’s sleep support team helps with supplies, mask fit and your replacement schedule. Your prescriber sets your pressure. We never change it.\"; cta \"Request a call\"",
        "check": "Owner; rrt-service.md."
      },
      {
        "topic": "UV cleaners: burns to skin and eyes (was 2.items.5)",
        "cards": [
          2
        ],
        "why": "The PMRA page is about disinfection devices for surfaces, water and air, treats enclosed UV devices separately and does not name CPAP cleaners.",
        "wording": "UV light from these devices may cause severe burns to the skin and eyes",
        "check": "A Health Canada page on CPAP UV cleaners."
      },
      {
        "topic": "Health Canada’s evidence on UV and ozone devices (was 2.items.6)",
        "cards": [
          2
        ],
        "why": "The PMRA line refers to UV and ozone disinfection devices sold since COVID-19, not CPAP cleaners by name.",
        "wording": "Health Canada has not received enough evidence that all of these devices are safe to use, or that they work",
        "check": "A Health Canada page that names CPAP cleaners."
      },
      {
        "topic": "Ozone and UV for every machine (was 2.items.2)",
        "cards": [
          2
        ],
        "why": "Ruling C5 (\"default\", 2026-10-13): hold the every-device wording, keep the Philips-scoped line. Landing E13 and Ch02 H16 are held for the same reason.",
        "wording": "Stop using cleaners that use ozone or ultraviolet (UV) light. They aren’t authorized cleaning methods for CPAP machines",
        "check": "cts-css-csrt-philips-2021."
      },
      {
        "topic": "Card shop strips (product placements off; resupply and travel items not stocked)",
        "cards": [
          1,
          3,
          4,
          7
        ],
        "why": "SHOP_SWITCH.placements is false (no product ids approved; spec 3.8), and A.1 gates the card 3, 4 and 7 strips on stock:resupply / stock:travel. The engine has no per-card shop words (strip headings come from ui.chapter.shop.occasions), so these B strings stay out of the message tree until placements turn on.",
        "wording": "card 1: heading \"Cleaning supplies\", linkLabel \"See cleaning supplies\" | card 3: heading \"Replacement supplies\", linkLabel \"See masks, cushions, tubing and filters\" | card 4: heading \"Replacement supplies\", linkLabel \"See masks, cushions, tubing and filters\" | card 7: heading \"For the trip\", linkLabel \"See travel cases and bags\"",
        "check": "Owner (placements, stock). Card 1 never ozone or UV devices; card 7 never a machine; complete masks on card 3/4 strips carry the C26 prescription-check notices; no paediatric masks; no Subscribe & save (E11)."
      }
    ]
  }
};
