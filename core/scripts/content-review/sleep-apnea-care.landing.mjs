/*
 * Reviewer-only data for the Sleep Apnea Care pack, landing (generated from the build's
 * `landing` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "N10",
      "default": "Machine lines keep the current wording: “Liivv doesn’t sell CPAP or other sleep apnea machines yet.” (owner; “yet” kept everywhere until ruled).",
      "where": [
        "shop.body",
        "faq.items.1.machineLine"
      ],
      "alternative": "“Liivv doesn’t sell machines” (no “yet”): “yet” reads as a promise, and the SLT has not approved the machine plan."
    },
    {
      "id": "N2",
      "default": "The page says only the N2 proposal lines it already sources: the machine line, and “Talk to your doctor before and after you buy a machine.” No retailer is named or linked.",
      "where": [
        "shop.body",
        "faq.items.1.a",
        "faq.items.1.machineLine",
        "care.sleepTeam.body"
      ],
      "alternative": "Also link “Choosing a supplier” (Ch02 card 9) and “Paying for it” (funding page) where machines come up; decide whether door 3 (“Just diagnosed, or starting CPAP”) needs its own line."
    },
    {
      "id": "N9",
      "default": "No line saying what Liivv does and doesn’t do in the shop band.",
      "where": [
        "shop.body"
      ],
      "alternative": "Add “Liivv sells masks and supplies. We don’t fit masks or follow up on your therapy: your RT or sleep clinic does.” with the N6 policy (rule with C7 and C26)."
    },
    {
      "id": "D5",
      "default": "FAQ 3 shows the BC guide’s general ranges, the CLA filter line and NIHB’s funding limits side by side, all after “Follow the manual for your machine and mask first.” No maker’s schedule on the landing (the Ch05 resupply planner adds it, labelled).",
      "where": [
        "faq.items.3.a"
      ],
      "alternative": "The nurse chooses another presentation of replacement cadences."
    },
    {
      "id": "D6",
      "default": "“NIHB’s guidelines, for example, are up to 14 inlet filters a year, 2 a year for each type of mask with headgear (face, nasal or nasal pillow), and 2 a year for tubing. More may be considered case by case, with prior approval.”",
      "where": [
        "faq.items.3.a"
      ],
      "alternative": "Drop the NIHB example and leave it to the Funding page. Note: NIHB 8.4.1 marks inlet filters “No” for prior approval while the page also says prior approval is required for all respiratory benefits."
    },
    {
      "id": "D7 (C77)",
      "default": "“Healthy habits and weight loss are advised if you carry extra weight. They aren’t enough on their own if you’re sleepy or have moderate to severe sleep apnea.”",
      "where": [
        "therapies.hints.lifestyle"
      ],
      "alternative": "Other plain words for the source’s “elevated BMI”."
    },
    {
      "id": "D8 (B3 default)",
      "default": "The privacy promise (trust item 3) and FAQ 5 stay held (gate adSignalsShipped) until the ad-signal denial is deployed and the privacy lead signs off.",
      "where": [
        "trust.items.3",
        "faq.items.5"
      ],
      "alternative": "Release both once signed off. Also open: whether the liivv-care-nav cookie gets a `sleep` value that the cookie notice must list."
    },
    {
      "id": "D9",
      "default": "No landing door for the onboarding answer “natural sleep support” (no_natural).",
      "where": [
        "doors"
      ],
      "alternative": "Reword the answer, or route it to Ch01’s signpost cards."
    },
    {
      "id": "D11",
      "default": "Olivia appears in the care band with the scope written in the copy: orders and restocks, no medical or settings advice.",
      "where": [
        "care.oliviaKicker",
        "care.oliviaTitle",
        "care.oliviaBody",
        "care.oliviaCta",
        "care.oliviaBubble",
        "care.oliviaNote"
      ],
      "alternative": "Leave Olivia off the Sleep pages, or reword to her actual scope."
    },
    {
      "id": "D12",
      "default": "Static `hero.heading` as the h1 (heroRotating false; headingLead and words held in tree); still placeholder image /archive/liivv-home/corner-sleep.png; no video; lavender placeholder accent.",
      "where": [
        "hero.heading",
        "hero.headingLead",
        "hero.words"
      ],
      "alternative": "The rotating hero (`headingLead` + `words`), a chosen image or a video, and the site palette."
    },
    {
      "id": "D14 (B10)",
      "default": "The brands strip and its governance note stay held (brandsReady false).",
      "where": [
        "brands",
        "governance.brandsNote"
      ],
      "alternative": "Owner names the brands kept after the store cleanup (Part G1), decides whether Philips Respironics stays given its recall history, records logo permissions, and removes the brands whose only catalogue products are machines (supplies-only re-sort, landing row 12: the brands of products 4599/5041 and 4991)."
    },
    {
      "id": "D15",
      "default": "Governance names, registrations and review date stay empty until the nurse signs off.",
      "where": [
        "governance"
      ],
      "alternative": "Owner and nurse supply them."
    },
    {
      "id": "D17",
      "default": "The C26 lines render (rxMaskGateShipped true): the checkout gate is built on this branch (commit 9acebbd7) and the section cannot launch before it deploys.",
      "where": [
        "shop.rxMaskLine",
        "faq.items.1.rxMaskLine",
        "shop.badges.prescription"
      ],
      "alternative": "Set rxMaskGateShipped to false until the C26 flow is confirmed in production; `{rxMaskLine}` then interpolates empty and no line promises a pharmacist check."
    },
    {
      "id": "D18",
      "default": "The returns line and link stay held (returnsPolicyPublished false) until the store’s policy page is published and legal review is done.",
      "where": [
        "shop.returnsLine",
        "shop.returnsLink"
      ],
      "alternative": "Owner and legal confirm scope, “even unopened”, the “for hygiene and safety” reason, cancellation before shipping, remedies, the 7-day request, refunds to the original payment method and the 15-day refund; French policy text."
    },
    {
      "id": "D19",
      "default": "Option A: FAQ 4 keeps Health Canada’s own “stop” for the masks in the 2022 advisory (“the advice is to stop using the mask if anyone in that group has one of the listed implants”), and “check with the mask’s maker and your health care team” for other masks.",
      "where": [
        "faq.items.4.a",
        "shop.magnetWarning.body"
      ],
      "alternative": "Option B (held E15): no “stop” anywhere: “What to do depends on the mask and the implant, so check with the mask’s maker and your health care team. Read the warning in <link>Driving & Staying Safe</link>.”"
    },
    {
      "id": "D20",
      "default": "On the landing, only door 1 carries “In a medical emergency, call 911.”; the Olivia band has no 911 line.",
      "where": [
        "doors.items.1.body",
        "care.oliviaNote"
      ],
      "alternative": "Add a fixed “In a medical emergency, call 911” line beside every contact, Olivia chat, “ask us” and request-a-call surface on both care sites."
    },
    {
      "id": "BUILD-door-mask (spec 8.3)",
      "default": "Door 4 (“Struggling with my mask”) opens Ch04 card 9, “Fix a common problem”, which is what the door’s words describe.",
      "where": [
        "doors.items.4"
      ],
      "alternative": "Ch04 card 3, “Mask types to ask your RT about” (Ch04’s own routing note)."
    },
    {
      "id": "BUILD-meta-description (N1, supplies-only section 6 row 1)",
      "default": "meta.description ships as “Plain, sourced guidance on sleep apnea and CPAP, with CPAP masks and supplies.”: the final sentence “Machines by prescription.” is dropped, as the supplies-only re-sort asks, because Liivv sells no machines (N1, “Hide all 24”). No other word changed.",
      "where": [
        "meta.description"
      ],
      "alternative": "Section B verbatim (it would tell search results and link previews that Liivv sells machines by prescription), or a reworded description from the owner."
    },
    {
      "id": "BUILD-french-names",
      "default": "Section name “Soins de l’apnée du sommeil”; Ch02 title “Conduite et sécurité” in FAQ 4’s link; door labels reused as FAQ link words (“Voyager avec un appareil CPAP”, “Il est temps de remplacer des fournitures”).",
      "where": [
        "meta.title",
        "hero.kicker",
        "shop.label",
        "faq.items.2.a",
        "faq.items.3.a",
        "faq.items.4.a"
      ],
      "alternative": "The French reviewer’s choice; the chapter and chrome fragments must use the same names."
    }
  ],
  "prePublishChecks": [
    "French: every string in this fragment is a machine translation awaiting review. The `landing` and `doors` gates stay closed (FR_REVIEWED empty, owner-only); /fr shows the governance machine-translation notice, and on /fr the doors fall back to the urgent route in Ch06’s approved urgentExit words.",
    "Urgent door: never gated, renders with JS off, and its 911 sentence carries chips health811-home and hlbc-811 (ruling C1). Check the /fr fallback still gives the 911 route.",
    "Ch02 (with the #red-flags block, card 6 “Masks with magnets” and card 11 “Who to call”) must be live with the landing (ruling B2, D10). FAQ 4’s second link and the shop magnet warning link point at staying-safe#card-6.",
    "Re-check door bodies 2–6 and 8 against the written chapters (Ch01, Ch04 cards 9, Ch05 card 3 and segment 2, Ch06). FAQ 2 links Ch05 segment 2 (sa-group-2); FAQ 3 links Ch05 card 4 “Signs a part is worn”.",
    "C26: confirm the complete-mask checkout gate is live in production before go-live (rxMaskGateShipped stays true); complete-mask tiles link the product page, never an add button; parts and supplies stay one-click.",
    "Shelf: no machines or bundles, no ASV, no paediatric masks (4210, 4543, 4713), no ozone/UV cleaners, no compliance report, no description naming another retailer; the settings notice and the magnet warning always show; the magnet badge only on Health Canada catalogue-number matches (4624 waits on the nurse).",
    "Store descriptions still conflict with N7: 52 visible masks say “This mask does not contain magnets, making it a safe choice…” and 18 carry a blanket magnet line (store write D19 not approved). Product pages can contradict the landing’s magnet warning until fixed.",
    "Trust item 2 stays held until every listed device has a recorded MDALL licence (sweep 2026-10-13: 66 licensed, 10 uncertain).",
    "Register: `hc-recall-philips-ra-76137` (page RA-62729) rename is still proposed (F3); `crto-community-rt` and `hc-recalls-safety-alerts` are registered; `statcan-osa-2018` and `phac-osa-2009` facts keep their data years in the labels.",
    "Fact band: values and years exactly as the sources (6.4%, 12.8%, 30% for 2016–2017; 23% labelled 2009 data).",
    "Governance block: renders `ui.governance` (chrome) plus `governance.relationship`, `sourcesNote` and `settingsNote`; `disclosure.sells` reads “Liivv sells CPAP masks and supplies.”; `governance.brandsNote` is held with the brands.",
    "No other retailer, no partner name, no pressure figure or settings instruction anywhere on the page (spec 0.3 words).",
    "Soft launch (2026-10-21): the hub and the header link to the page (SLEEP_APNEA_CARE_LISTED), but it stays noindex, nofollow and out of the sitemap while SLEEP_APNEA_CARE_LIVE is false."
  ],
  "heldCopy": {
    "released": "Nothing below is in the message files. Each item enters SleepApneaCare.ui.landingPage only when its condition is met and the owner (and nurse where named) approve the wording in a new copy pass. Held-in-tree lines (trust items 2 and 3, FAQ 5, the returns lines, the brands strip and note, the rotating hero) are listed by the export under “Held”, with their gate.",
    "items": [
      {
        "topic": "Trust item 4: Liivv’s sleep support team (E1, E3)",
        "cards": [
          4
        ],
        "why": "The Liivv sleep support (RRT) service is not live (Part C); supplies-only re-sort row 2 moves it to the machine plan.",
        "wording": "Liivv’s sleep support team, for CPAP setup and follow-up",
        "check": "Part C live, line by line; owner confirms."
      },
      {
        "topic": "Care band: the Liivv sleep support panel (E3)",
        "cards": [],
        "why": "Part C is not live; the panel promises setup with “your mask and machine” and a booking call (supplies-only row 8: remove from the launch build; machine plan).",
        "wording": "Eyebrow “Liivv’s sleep support team”. Heading “Starting CPAP? Talk to Liivv’s sleep support team.” Body “Liivv’s respiratory therapists help you get set up with your mask and machine, and check in during your first weeks. Your prescriber sets your treatment and your pressure.” CTA “Book a setup call”, note “Sign-in needed”.",
        "check": "RRT licences mapped by province, setup call and follow-ups live; booking service rrt-pap-start; owner confirms."
      },
      {
        "topic": "Sleep support phone number and hours (E4)",
        "cards": [],
        "why": "No number or hours confirmed.",
        "wording": "“Call Liivv’s sleep support team: [number], [days], [hours] Eastern.”",
        "check": "Owner confirms the number is Liivv’s own line, and the hours."
      },
      {
        "topic": "Subscribe & save band (E2)",
        "cards": [],
        "why": "Resupply items not stocked; per-product subscriptions and the machine block not enforced server-side.",
        "wording": "Eyebrow “Subscribe & save”; title “Filters and cushions that arrive before you need them”; lead “Subscribe to the supplies you replace, choose how often they come, and skip or pause when life changes. Machines can’t be subscribed.”; features “Your usuals, on your schedule” / “Skip when you have extras” / “Change it in your account”.",
        "check": "Plan Part D; intervals shown match those offered (2, 3 and 6 months planned); no cadence advice. Complete masks cannot be subscribed (C26)."
      },
      {
        "topic": "Machine-sale copy (N1: Liivv sells no machines)",
        "cards": [],
        "why": "All 24 machine products are hidden in the store (N1, “Hide all 24”); supplies-only rows 5 and 6.",
        "wording": "shop.rooms.machines “Machines (prescription required)”; shop.machinesLink title “Machines: prescription required”, body “See the machines we carry and how to request one with your prescription.”, CTA “See machines”.",
        "check": "Machine plan approved by the SLT; never before."
      },
      {
        "topic": "meta.description machine sentence (N1)",
        "cards": [],
        "why": "Liivv sells no machines; supplies-only row 1 says drop it.",
        "wording": "“Machines by prescription.”",
        "check": "Machine plan approved by the SLT."
      },
      {
        "topic": "Prescription check before a machine ships (E5)",
        "cards": [
          1
        ],
        "why": "Moved to the machine plan (2026-10-13): Liivv sells no machines.",
        "wording": "“We check your prescription before your machine ships.”",
        "check": "Machine plan."
      },
      {
        "topic": "Using CPAP on board (E6)",
        "cards": [
          2
        ],
        "why": "ATPDR s.49 does not name CPAP; CATSA says nothing about use on board.",
        "wording": "“If you want to use your machine on board, ask your airline before you fly.”",
        "check": "A source that covers in-flight CPAP use."
      },
      {
        "topic": "Philips program status (E7)",
        "cards": [
          4
        ],
        "why": "Health Canada’s 2024-07-05 update gives dates that have passed.",
        "wording": "None.",
        "check": "Ch02 decides whether to say anything."
      },
      {
        "topic": "Sleep kits (E9)",
        "cards": [],
        "why": "No kit signed off.",
        "wording": "None.",
        "check": "Owner signs off sleep kits (Part D). No kit contains a machine."
      },
      {
        "topic": "Direct billing per program (E11)",
        "cards": [
          1
        ],
        "why": "Vendor registrations not confirmed.",
        "wording": "“We bill [program] directly.”",
        "check": "Vendor registration confirmed (ADP, NIHB, VAC, BCEA, AISH)."
      },
      {
        "topic": "Plain packaging (E12)",
        "cards": [
          5
        ],
        "why": "Operations has not confirmed it for CPAP orders.",
        "wording": "“Orders ship in plain packaging.”",
        "check": "Operations confirms."
      },
      {
        "topic": "General ozone/UV cleaner warning (E13; kept held by ruling C5, “default”)",
        "cards": [
          4
        ],
        "why": "Today’s sources are about the recalled Philips machines only; FAQ 4 keeps the Philips-scoped line.",
        "wording": "“Don’t use ozone or UV cleaners: clean your machine only as its instructions say.”",
        "check": "A Canadian source that advises against ozone/UV cleaners for every PAP machine, plus a nurse ruling."
      },
      {
        "topic": "C26 child line and flow strings (E14; store copy, outside SleepApneaCare)",
        "cards": [],
        "why": "The nurse words the child line (C17 follow-ups); the rest waits on the approved C26 design.",
        "wording": "CareNotices.rxMask.childLine and the checkout/order-status strings in c26-design.md 5.6.",
        "check": "Approved C26 build design and the nurse’s wording. Note: CareNotices.rxMask.childLine is already in core/messages and rendered by lib/catalog/care-notices.ts (committed 9acebbd7)."
      },
      {
        "topic": "Magnets, Option B (E15)",
        "cards": [
          4
        ],
        "why": "The copy uses Option A until the nurse chooses (D19).",
        "wording": "FAQ 4 last sentences: “What to do depends on the mask and the implant, so check with the mask’s maker and your health care team. Read the warning in <link>Driving & Staying Safe</link>.” (Philips product notice B: store copy.)",
        "check": "The nurse chooses Option B."
      },
      {
        "topic": "Returns policy resale line (E16; store copy)",
        "cards": [],
        "why": "Removed by the N6 checker: no ruling or source backs it.",
        "wording": "“We never resell an item that has been delivered.”",
        "check": "Owner confirms the practice."
      }
    ]
  }
};
