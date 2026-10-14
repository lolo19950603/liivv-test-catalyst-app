/*
 * Reviewer-only data for the Sleep Apnea Care pack, staying-safe (generated from the build's
 * `ch02` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "R5",
      "default": "Usage figures are framed as licensing measures, not health targets, in the item, the card note and the figure's fixed strip. The copy uses Key Message 4's \">70% of nights, over at least 30 days\"; Key Message 6's \"within the previous 90 days\" is left out.",
      "where": [
        "categories.3.items.4",
        "categories.3.note",
        "categories.3.figure.measureNote"
      ],
      "alternative": "Use Key Message 6's wording (70% of days, within the previous 90 days); or show only \"your sleep team will tell you what records your licensing authority needs\"."
    },
    {
      "id": "R7",
      "default": "Philips Respironics is named in the recall card, because Health Canada's advisory is published under that name and readers need it to know whether their machine is affected. No other brand appears.",
      "where": [
        "categories.5.items.1",
        "categories.5.note"
      ],
      "alternative": "\"One maker\", with the link to the advisory only."
    },
    {
      "id": "R9",
      "default": "The railway tab of card 3 (items 8 and 9, tab \"Railway safety-critical jobs\") is HELD out of the tree (H15): its figures rest only on the Railway Association of Canada handbook (rac-rail-handbook-2026, an industry association).",
      "where": [
        "categories.3 (fourth licenceClasses tab, not built)"
      ],
      "alternative": "(a) Rule that the RAC handbook counts as the official text of rules approved by the Minister of Transport, and release the tab. (b) Release only a number-free line from Transport Canada's page (\"Railway safety-critical jobs have their own medical rules; the railway's chief medical officer decides\"). (c) Leave it held."
    },
    {
      "id": "R10",
      "default": "The RT-download verification is labelled \"In BC\": it is BC's guideline under the national standard, not the standard itself.",
      "where": [
        "categories.3.items.3"
      ],
      "alternative": "Drop the item; or keep it unlabelled under \"Every class\"."
    },
    {
      "id": "R11",
      "default": "\"If your machine is recalled, don't stop or change your therapy before you talk to your doctor or equipment provider\" applies to any recall. Both sources were written for the Philips recall; the 2021 statement also says the decision \"must be individualized\".",
      "where": [
        "categories.5.items.2",
        "programsBand.cards.2.body"
      ],
      "alternative": "Scope it to the Philips recall (\"If your machine is part of this recall…\"); or keep the general wording as the safer default."
    },
    {
      "id": "R12.1",
      "default": "Adult breathing line reads \"Trouble breathing\" (Alberta's and Ontario's words).",
      "where": [
        "urgent.tiers.emergency.signs.3",
        "categories.11.items.5"
      ],
      "alternative": "\"Severe trouble breathing\" (\"severe\" is AboutKidsHealth's word for children; only Healthwise (US) defines it)."
    },
    {
      "id": "R12.2",
      "default": "No qualifier on \"Trouble breathing\" (911), although a bed partner could read it as the night-time pauses that the \"don't wait\" tier sends to the doctor. No official source gives a qualifier such as \"while awake\".",
      "where": [
        "urgent.tiers.emergency.signs.3",
        "urgent.tiers.soon.signs.1"
      ],
      "alternative": "A qualifier such as \"while awake\" (no official source gives one)."
    },
    {
      "id": "R12.3",
      "default": "The stroke (FAST) line is kept in the 911 tier.",
      "where": [
        "urgent.tiers.emergency.signs.2",
        "categories.11.items.5"
      ],
      "alternative": "Drop the stroke line (no sleep page names stroke signs; phac-osa-2009 lists cerebrovascular disease)."
    },
    {
      "id": "R12.4",
      "default": "\"Can't be woken up\" is read as Ontario's \"loss of consciousness\" (C*).",
      "where": [
        "urgent.tiers.emergency.signs.4",
        "urgent.tiers.soon.signs.1",
        "categories.11.items.5"
      ],
      "alternative": "Do not accept the C* reading; the nurse words the line (on-er says \"loss of consciousness\" and \"confusion\")."
    },
    {
      "id": "R12.5",
      "default": "\"Chest pain\" is kept in the child line (it is on the same AboutKidsHealth list).",
      "where": [
        "urgent.tiers.emergency.signs.6",
        "categories.11.items.5"
      ],
      "alternative": "Leave \"chest pain\" out of the child line (it was added on 2026-10-13 from the same list)."
    },
    {
      "id": "R12.6",
      "default": "ICBC (a BC Crown corporation, chip labelled) is the 911 source for \"Anyone hurt in a crash\"; Ontario's handbook is a supporting chip (it says only \"Call for help\").",
      "where": [
        "urgent.tiers.emergency.signs.5",
        "meta: urgentTiers[emergency].signs[4].sources"
      ],
      "alternative": "Do not accept ICBC as the 911 source for a crash; the Ontario handbook says only \"Call for help\"."
    },
    {
      "id": "R12.7",
      "default": "The \"Not an emergency, but don't wait\" tier stays in the red-flag block.",
      "where": [
        "urgent.tiers.soon"
      ],
      "alternative": "Move it to card 1 or to Chapter 01."
    },
    {
      "id": "R12.8 / E1",
      "default": "The red-flag heading stays \"Stop and act now\", and is this chapter's urgentExit.link label (each chapter keeps its own label verbatim, spec 8.3).",
      "where": [
        "urgent.heading",
        "urgentExit.link"
      ],
      "alternative": "\"Get help now\", now that 911 comes first; then every chapter's urgentExit.link, the paths' safety strip and the landing door change with it."
    },
    {
      "id": "R12.9 / H4",
      "default": "The drowsy-driving tips line is HELD out of the tree (would be urgent.tiers.stop.signs.2).",
      "where": [
        "urgent.tiers.stop (signs.2, not built)"
      ],
      "alternative": "Release it, and say whether the Ontario chip is labelled \"Ontario\" or treated as general road-safety advice."
    },
    {
      "id": "R12.10 / H14",
      "default": "The child CPR line is HELD out of the tree.",
      "where": [
        "urgent.tiers.emergency (not built)"
      ],
      "alternative": "Add \"A child isn't breathing, or is only gasping, and doesn't respond when you try to wake them: start CPR and have someone call 911\" (akh-cpr-child, akh-cpr-baby; register section 12)."
    },
    {
      "id": "R12.11 / H18",
      "default": "No 811 line under the block (HELD out of the tree; ties to OPEN-QUESTIONS C53).",
      "where": [
        "urgent (not built)"
      ],
      "alternative": "Add \"Not sure? Call 811 to talk to a nurse, day or night.\""
    },
    {
      "id": "R12.12",
      "default": "The 911-tier chips (canada.ca, ontario.ca, AboutKidsHealth, ICBC, MyHealth Alberta, HealthLink BC) show on /fr as English pages (hrefLang 'en'); no French twin is recorded in sources.md, so none is used.",
      "where": [
        "meta: urgentTiers (all chips)",
        "categories.6.note (recalls link)"
      ],
      "alternative": "Fetch the French pages before /fr launches and record hrefFr/labelFr in the register."
    },
    {
      "id": "R13.1",
      "default": "Option A: Health Canada's own \"stop using\" instruction is kept, scoped to the masks its 2022 public advisory names (items 6 and 7, band card 3). Option B is HELD out of the tree (H17).",
      "where": [
        "categories.6.items.6",
        "categories.6.items.7",
        "meta: categories[5].figures[0].columns",
        "programsBand.cards.3.body",
        "closing.body"
      ],
      "alternative": "Option B: no \"stop\" word anywhere; 6.items.6 becomes \"Some masks are named in Health Canada notices, and each notice says what to do. Look up your mask, and check with its maker and your health care team\", item 7 is left out, columns become [[3, 4], [5, 6]]. Under B, the four Liivv masks RA-64545 lists (4320, 4374, 4932, 4952) would not show the advisory's \"STOP USING\" instruction."
    },
    {
      "id": "R13.2",
      "default": "Card 6 stays pinned open through urgentContent.",
      "where": [
        "meta: categories[5].urgentContent"
      ],
      "alternative": "A separate engine `warning` flag, now that it is not a red flag."
    },
    {
      "id": "R13.3",
      "default": "Under N7, the 2022 CTS/CSS/CSRT message and the US FDA ResMed notice are not chipped on card 6 (both stay in sources.md).",
      "where": [
        "meta: categories[5].sources"
      ],
      "alternative": "Chip them again beside the Health Canada notices."
    },
    {
      "id": "R13.4",
      "default": "\"Check with … the mask's maker\" stands for every magnet mask (backed for the Philips masks by RA-64582 and by \"Contact the manufacturer\" in RA-64545 and RA-74733; for other masks it is the owner's ruling C3).",
      "where": [
        "categories.6.items.5",
        "programsBand.cards.3.body"
      ],
      "alternative": "Keep the maker line only for the masks whose Health Canada notices say to contact the maker (RA-64582, RA-64545, RA-74733)."
    },
    {
      "id": "E2",
      "default": "Each chapter keeps its own ask keys and labels as written (spec 8.3). This chapter uses doctor, sleepTeam, rrt (label only; no card uses it), provider (cards 7 and 9) and urgent (card 11).",
      "where": [
        "ui.chapter.ask",
        "ui.chapter.roleNames"
      ],
      "alternative": "Merge team/sleepTeam and rt/rrt into one role each across chapters."
    },
    {
      "id": "8.3 ask.urgent",
      "default": "ui.chapter.ask.urgent = \"Don’t wait\" (01, 02).",
      "where": [
        "ui.chapter.ask.urgent"
      ],
      "alternative": "Chapter 03's \"Call, don’t wait\"."
    }
  ],
  "prePublishChecks": [
    "Ontario O. Reg. 340/94: e-Laws would not render (JavaScript page). Confirm that the OSA line on form 5108E (Part 3, Sudden Incapacitation) is a mandatory condition under the regulation (card 2 item 5). The form and ontario.ca support it; the regulation text was not read.",
    "CRTO Standards of Practice: a revised draft is dated 2025-09-25. Confirm Standard 5 still carries the alternate-supplier line when the revision is adopted (card 9 item 4).",
    "Register: the hc-recall-philips-ra-76137 chip label must carry \"RA-62729\" (cards 5, 7, 10, 11 and the band); icbc-crash-card labelled as a BC Crown corporation, akh-child-emergency as CA-org, hlbc-sleep-apnea as Healthwise (US); hlbc-811 uses the repointed href; cla-sleep-apnea and lhf-sleep-apnea use their new hrefs.",
    "Card 11's lanes figure has no statusFitsOne / statusFitsMany / statusNone words in 02 B (Chapters 01 and 03 have them), so the topic filter's live status line is empty. Owner to supply (or copy 01's lines) before go-live; nothing was invented in the build.",
    "Card 9: the takeIn figure draws the card's items, then the five questions as write-in lines, then the card note; the note says \"Bring the questions below\", but on screen it sits after the questions. Check the wording or the note's position on the built page."
  ],
  "heldCopy": {
    "released": "Nothing below is in en.json, fr.json or the chapter meta. Each item enters the tree only when its ruling or gate is recorded (02 section E, OPEN-QUESTIONS), with its source chips, and its own change-log row.",
    "items": [
      {
        "topic": "H1 · Liivv's sleep support team: card 11 lane 6",
        "cards": [
          11
        ],
        "why": "Part C service is not live (gate service:sleep-support). Hours, provinces covered and the phone number are owner questions; supplies-only row 18: rewrite for N8 or keep held.",
        "wording": "Label \"Liivv’s sleep support team\"; scope \"A Liivv service · GATED: provinces, days and hours to come from Part C\"; body \"Questions about your mask, supplies and getting used to your equipment. We never change your settings.\"; link \"Request a call (sign-in needed)\" to /account/virtual-care/appointment?service=rrt-pap-start.",
        "check": "Part C step live; owner supplies provinces and hours; N8 (who answers supplies questions) decided."
      },
      {
        "topic": "H1 · Liivv's sleep support team: the support band",
        "cards": [],
        "why": "Part C service is not live. The draft body opens with the drafting marker \"GATED (Part C). Proposed:\", left out here. Supplies-only row 19.",
        "wording": "Eyebrow \"A Liivv service\"; heading \"Liivv’s sleep support team\"; body \"Liivv’s sleep support team helps with mask fit, supplies and getting used to your equipment. We never change your settings. In an emergency, or for sleepiness at the wheel or a child’s breathing, follow the lines at the top of this page.\"; button \"Request a call\".",
        "check": "As above."
      },
      {
        "topic": "H4 · Drowsy-driving tips (urgent.tiers.stop.signs.2)",
        "cards": [],
        "why": "Sourced (on-mto-handbook-drowsy), but not a 911 line and not part of ruling C1; held until the nurse releases it (R12.9). \"Drive in pairs\" is still unsourced.",
        "wording": "You feel drowsy while you’re driving. Pull off the road, park somewhere safe and secure, and take a nap. Caffeine, a louder radio or an open window help only for a short time if you haven’t had enough sleep",
        "check": "Nurse release; Ontario chip labelled \"Ontario\" or general. If released, the flat-list fallback becomes \"Lines 1 to 6: call 911 now. Lines 7 and 8: stop, then tell your doctor. Line 9: talk to your doctor soon.\""
      },
      {
        "topic": "H5 · Quebec (SAAQ), aviation and marine fitness rules",
        "cards": [
          2,
          3
        ],
        "why": "No source found.",
        "wording": "None drafted.",
        "check": "Find official SAAQ, Transport Canada Civil Aviation and marine pages."
      },
      {
        "topic": "H6 · Other provinces' reporting rules beyond Ontario",
        "cards": [
          2
        ],
        "why": "The only province-by-province table is in the 2014 CTS/CSS paper (Table 1), out of date.",
        "wording": "None drafted.",
        "check": "Current provincial pages only."
      },
      {
        "topic": "H7 · ASV recall (Health Canada RA-53771, 2015)",
        "cards": [],
        "why": "Belongs to Chapter 03 (central apnea); the page gives no patient instruction.",
        "wording": "None for this chapter.",
        "check": "Chapter 03."
      },
      {
        "topic": "H8 · Registering a Philips machine on the maker's site",
        "cards": [
          5
        ],
        "why": "The portal was planned to close at the end of December 2024 (5.note). No current instruction found.",
        "wording": "None drafted.",
        "check": "A current Health Canada instruction."
      },
      {
        "topic": "H9 · Where magnets sit on masks, beyond \"the clips or straps\"",
        "cards": [
          6
        ],
        "why": "Finer detail (lower straps, frame clips) is only on the US FDA page and secondary sites.",
        "wording": "None drafted.",
        "check": "A Health Canada source."
      },
      {
        "topic": "H10 · Health Canada reporting phone number (1-800-267-9675)",
        "cards": [
          10
        ],
        "why": "Seen only on implant- and mesh-specific pages in search results, not on the consumer device-problem pages fetched.",
        "wording": "None drafted.",
        "check": "The number on a consumer device-problem page."
      },
      {
        "topic": "H11 · \"Tell your supplier or the maker as well\"",
        "cards": [
          10
        ],
        "why": "The consumer reporting page does not say so.",
        "wording": "Tell your supplier or the maker as well",
        "check": "A source that says so."
      },
      {
        "topic": "H12 · Alberta's warranty and CSA stamp line",
        "cards": [],
        "why": "Not a safety step for this chapter; candidate for Chapter 04 or the shop's policy copy.",
        "wording": "Equipment bought in Canada usually has a warranty of 3 years and should have a CSA stamp on it.",
        "check": "Owner: Chapter 04 or shop policy."
      },
      {
        "topic": "H13 · Battery and power-outage safety; opioids, sedatives and alcohol with driving",
        "cards": [],
        "why": "Held by the plan (Part F) and C31. hc-opioid-overdose (fetched for C1) is listed for the nurse only.",
        "wording": "None drafted.",
        "check": "Nurse (C30, C31)."
      },
      {
        "topic": "H14 · A child who stops breathing: CPR",
        "cards": [],
        "why": "Sourced (akh-cpr-child, akh-cpr-baby; register section 12), but the \"can’t be woken up\" line already sends the reader to 911; the nurse decides whether to add CPR (R12.10).",
        "wording": "A child isn’t breathing, or is only gasping, and doesn’t respond when you try to wake them: start CPR and have someone call 911",
        "check": "Nurse release; register akh-cpr-child and akh-cpr-baby."
      },
      {
        "topic": "H15 · Railway tab of card 3",
        "cards": [
          3
        ],
        "why": "Both lines rest only on the Railway Association of Canada handbook (rac-rail-handbook-2026), an industry association; an industry page is never the only source. Same hold as Chapter 04 E.16 (R9).",
        "wording": "Tab \"Railway safety-critical jobs\"; items \"Railway safety-critical jobs, moderate or severe sleep apnea treated with a PAP machine: a 14-day machine report showing an average of 5 hours or more over all days\" and \"Railway safety-critical jobs: checked again every year with a 30-day machine report\".",
        "check": "Ruling R9 (a), (b) or (c)."
      },
      {
        "topic": "H16 · Ozone and UV for every PAP machine",
        "cards": [
          7
        ],
        "why": "Ruling C5 (\"default\"): hold the every-device wording, keep the Philips-scoped line. LAND E13 is held for the same reason.",
        "wording": "\"Stop using cleaning methods the maker hasn’t approved, such as ozone or UV-light cleaners\" (was 7.items.2) and \"Skip ozone and UV-light cleaners the maker hasn’t approved.\" (was programsBand.cards.4).",
        "check": "Nurse re-rules C5."
      },
      {
        "topic": "H17 · Card 6, Option B (no \"stop\" word)",
        "cards": [
          6
        ],
        "why": "The nurse chooses A or B (R13.1). A is in the copy.",
        "wording": "6.items.6 \"Some masks are named in Health Canada notices, and each notice says what to do. Look up your mask, and check with its maker and your health care team\"; no item 7; columns [[3, 4], [5, 6]].",
        "check": "Nurse rules R13.1."
      },
      {
        "topic": "H18 · An 811 line under the block",
        "cards": [],
        "why": "Verified for BC, Alberta and Ontario; \"most provinces and territories\" rests only on Healthwise (US). Ties to OPEN-QUESTIONS C53 (R12.11).",
        "wording": "Not sure? Call 811 to talk to a nurse, day or night.",
        "check": "Nurse release; C53."
      },
      {
        "topic": "Resources lines (not built, spec 2.4: no `resources` subtree)",
        "cards": [],
        "why": "Sleep chapters carry no resources shelf (resourceLinks: []). The three links are already on the page: MDALL (band card 1), recalls (card 6 note), report (card 11 lane 4).",
        "wording": "\"Search licensed medical devices (MDALL)\", \"Search recalls and safety alerts\", \"Report a medical device problem\".",
        "check": "None unless a resources shelf is added."
      }
    ]
  }
};
