/*
 * Reviewer-only data for the Sleep Apnea Care pack, paths (generated from the build's
 * `paths` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "P1 (OPEN-QUESTIONS E7)",
      "default": "Stage labels: the engine’s six stages are reused with this site’s labels. `types` reads \"Tests and treatments\" so it fits the testing cards (not-diagnosed-yet) and the options cards (oral-appliance). No engine change.",
      "where": [
        "ui.path.stages.start",
        "ui.path.stages.types",
        "ui.path.stages.safe",
        "ui.path.stages.tools",
        "ui.path.stages.everyday",
        "ui.path.stages.season"
      ],
      "alternative": "Make `PathStage` site-generic and add `testing` and `options`."
    },
    {
      "id": "P3 (C18; 03 R3)",
      "default": "Bilevel comfort reason left out of the intro, because Chapter 03 has it open as R3. Side by side: bc-pap-buyers-guide, \"The main reason to use BiPAP for obstructive sleep apnea is that some people find it more comfortable to breathe out against lower pressure.\"; cts-sdb-2011 (per Ch03 C, not re-read for the paths), \"BPAP should be reserved for patients with ventilatory failure\".",
      "where": [
        "paths.bilevel.intro.body.1"
      ],
      "alternative": "Add the comfort line if R3 keeps it, and re-align both pages."
    },
    {
      "id": "P4 (C15)",
      "default": "Children’s treatment list: four of AboutKidsHealth’s five treatments, with the weight loss program keeping the page’s condition (\"if your child is overweight\"). No order is given; \"usually the first treatment\" is held (section E). Side by side: akh-osa lists surgery, a weight loss program \"if your child is overweight or obese\", medicines, CPAP, and less second-hand smoke and pollution, with no order; cla-sleep-apnea (children’s section of an all-ages page): \"The most common treatment for OSA in children is the surgical removal of the tonsils and adenoids … This is the initial treatment for most children with sleep apnea\".",
      "where": [
        "paths.children.intro.body.2",
        "paths.children.list.reasons.3"
      ],
      "alternative": "Rule that the Lung Association’s children’s section counts as child-specific, and add \"Removing the tonsils and adenoids is often the first treatment.\" (held wording, section E)."
    },
    {
      "id": "P6a (C54)",
      "default": "Doctor’s note for flying: \"You don’t need a doctor’s note for screening, though one can help.\" Side by side: catsa-cpap, documentation \"is not required; however, if you feel that it would help ease your screening, it should be presented to the screening officer\"; cla-sleep-apnea, \"bring a letter from your doctor explaining what your CPAP machine is, and that it’s medically necessary for you to use it.\"",
      "where": [
        "paths.travel-cpap.intro.body.2"
      ],
      "alternative": "Say only \"Bring a letter from your doctor if you like\"."
    },
    {
      "id": "P6b (C73)",
      "default": "The insurer caution about a second machine is applied to a travel machine. bc-pap-buyers-guide: \"the third-party extended health insurer may refuse to pay for a second machine\" (its case is a medically different machine).",
      "where": [
        "paths.travel-cpap.list.reasons.2",
        "paths.travel-cpap.list.reasons.13",
        "paths.travel-cpap.funding.body"
      ],
      "alternative": "Drop the second-machine line from the travel path."
    },
    {
      "id": "P7 (C62)",
      "default": "Children’s prevalence left out of the intro. Side by side: akh-osa, \"Sleep apnea affects 1 to 5 children in 100.\"; cla-sleep-apnea, \"2 to 3% of children are likely to have sleep apnea\" (Ch01 E also cites BC \"1-4% of children\", not re-read here).",
      "where": [
        "paths.children.intro.body.1"
      ],
      "alternative": "Add AboutKidsHealth’s figure (child-specific) with its chip: \"It affects 1 to 5 children in 100.\" (held wording, section E)."
    },
    {
      "id": "P8 · owner (B4)",
      "default": "Funding doors: Ontario examples on national pages, labelled. No Liivv billing claim: ADP pays only registered businesses, so \"pay-and-claim\" is not used for programs. \"Some programs pay only businesses they register.\" on-adp-respiratory: \"You must purchase your respiratory equipment (including … PAP systems) from a business that is registered with the ADP.\"",
      "where": [
        "paths.cpap.funding.body",
        "paths.bilevel.funding.body",
        "paths.travel-cpap.funding.body",
        "paths.oral-appliance.funding.body",
        "paths.children.funding.body",
        "paths.not-diagnosed-yet.funding.body"
      ],
      "alternative": "Owner: is Liivv registering with ADP respiratory, NIHB, VAC, BCEA, AISH, NB Social Development? (Machine requests from Ontarians on ADP moved to the SLT machine plan.)"
    },
    {
      "id": "P9 (C74)",
      "default": "Adult cards on the children and bilevel paths: Ch04 cards appear on `bilevel` (with the list.intro caveat) and once on `children` (Ch04 card 4, for its child fit note, which rests on akh-pap). The children path otherwise uses Ch06 card 4 (A child on CPAP) and Ch05 card 5 (Caring for a child’s CPAP).",
      "where": [
        "paths.children.list.reasons.10",
        "paths.bilevel.list.intro",
        "PATH_META children entry Ch04 card 4"
      ],
      "alternative": "Drop Ch04 card 4 from `children`, since Ch06 card 4 covers fit."
    },
    {
      "id": "P10 (C75)",
      "default": "The oral-appliance path includes both driving cards (Ch02 cards 1 and 3), because oral appliance users may need proof of treatment (cts-css-driving-2014).",
      "where": [
        "paths.oral-appliance.list.reasons.8",
        "paths.oral-appliance.list.reasons.9"
      ],
      "alternative": "Card 1 only."
    },
    {
      "id": "P11 (C12)",
      "default": "\"Then every year\" on the CPAP intro, from the BC guideline (\"Annual follow-up is recommended with CPAP download\"), shown nationally, like Ch04 card 1’s schedule (BC buyer’s guide, \"may expect\").",
      "where": [
        "paths.cpap.intro.body.2",
        "paths.cpap.list.reasons.7"
      ],
      "alternative": "\"then over the long term\" (the guideline’s other sentence)."
    },
    {
      "id": "P12 (C42)",
      "default": "\"Your family doctor or nurse practitioner\" as the first stop. Nurse practitioner comes from BC documents: bc-pap-buyers-guide, \"referring practitioner (physician or nurse practitioner)\"; cla-sleep-apnea says \"see your doctor\"; lhf-sleep-apnea \"see your healthcare providers\".",
      "where": [
        "paths.not-diagnosed-yet.intro.body.2"
      ],
      "alternative": "\"your doctor\" only."
    },
    {
      "id": "P13 (C76)",
      "default": "List length: `cpap` has 25 entries.",
      "where": [
        "paths.cpap.list.reasons",
        "PATH_META cpap entries"
      ],
      "alternative": "Cap at about 15, with \"More cards for CPAP\". Safety entries never go behind it."
    },
    {
      "id": "P14 (C45)",
      "default": "\"Only a sleep study can tell\", the same C* wording as Ch01 (4.note, 6.note); \"only\" is ours. cla-sleep-apnea: \"The best way to diagnose … is an overnight test in a sleep laboratory\".",
      "where": [
        "paths.not-diagnosed-yet.intro.body.2"
      ],
      "alternative": "\"A sleep study is how it’s diagnosed.\""
    },
    {
      "id": "C14 (01 S16; PATHS children)",
      "default": "Follow CTS/CSS 2026: a lab study is the standard; a home test may be a second-line option for otherwise healthy children over 5 when a lab study isn’t accessible; overnight oximetry not alone. Side by side: BC guideline 2021, Appendix A, \"HSAT is not recommended as it is not sensitive enough to be accurate.\" The CTS/CSS full guideline is blocked (403); the press release is the source read.",
      "where": [
        "paths.children.intro.body.2",
        "paths.children.list.reasons.2",
        "paths.children.list.reasons.6"
      ],
      "alternative": "Keep only \"For children, an overnight lab study is the standard\", and send the rest to Chapter 06."
    },
    {
      "id": "C23 (StatCan archived)",
      "default": "Use the archived StatCan fact sheet, with the survey years in the copy and \"(archived page)\" on the chip.",
      "where": [
        "paths.not-diagnosed-yet.list.reasons.4"
      ],
      "alternative": "Drop the figure."
    },
    {
      "id": "E1 / 02 R12 (red-flag heading)",
      "default": "The strip’s link and the not-diagnosed-yet pointers name Chapter 02’s heading \"Stop and act now\" (kept under C1). FR: \"Arrêtez-vous et agissez maintenant\", as the ch02 fragment.",
      "where": [
        "ui.path.safety.link",
        "paths.not-diagnosed-yet.intro.body.2",
        "paths.not-diagnosed-yet.list.reasons.7"
      ],
      "alternative": "\"Get help now\" now that 911 comes first (02 R12); all three strings change with Ch02’s `urgent.heading`."
    }
  ],
  "prePublishChecks": [
    "BLOCKER first: the children path’s reasons are index-matched to its entries. With the Ch06 card 3 entry commented out (ruling C6), reasons 4–13 sit one place after their entries until the integrator applies option A or B in notes.md. Check the rendered children list card by card against paths.md B.2 after the fix.",
    "Every path entry points to a card that exists in its chapter (no card-?, no 0): export check 9. Card numbers are from the chapter drafts of 2026-10-13.",
    "Renumbering: entry titles are read from the chapter messages, but card numbers are in paths-meta.ts. Recheck all six paths whenever a chapter adds, removes or reorders a card.",
    "Ch02 heading: `ui.path.safety.link` (\"Chapter 02 — Stop and act now\"), `paths.not-diagnosed-yet.intro.body.2` and `list.reasons.7` must match Chapter 02’s ruled `urgent.heading` (02 R12), in English and French.",
    "Funding doors link /liivv-health/sleep-apnea-care/funding. paths.md A.1 hides them until that page exists; the build marks `fundingPage` as built. Confirm the funding page ships in the same deploy.",
    "Facts the linked card doesn’t repeat (source check): four † reasons state a fact that is not on the card they link to. The fact is sourced on the path itself (its chip): oral-appliance 10 (ADP doesn’t cover oral appliances; Ch06 card 10 doesn’t say so), travel-cpap 13 (insurer and a second machine; it is on Ch03 card 5, not Ch06 card 10), bilevel 20 (NB lists bilevel separately; Ch06 card 10 names VAC instead) and children 13 (AKH cost line; Ch06 card 10 has the Lung Association children’s grant). Either add the fact to the card or point the entry at the card that has it.",
    "Ch02 card 7 was retitled \"Cleaning the approved way\" (ruling C5, 2026-10-13) after the paths were written. Its reasons still read \"Before you buy a CPAP cleaning gadget\" (cpap 19), \"Before you buy a cleaning gadget\" (bilevel 17) and \"Why to skip ozone and UV cleaners, travel-size ones too\" (travel-cpap 11). Travel 11 reads as a general \"skip\" rule, while C5 held the every-device wording (02 H16) and kept PMRA’s general lines on the card. Nurse to confirm the reason still fits the card, or point travel-cpap 11 at Ch05 card 2 (\"Ozone and UV cleaners\").",
    "Magnets (N7): when placements turn on, the owner confirms that masks 4229, 4489 and 4884 (store text says they contain magnets, no Health Canada notice names them) stay on the cpap and bilevel strips with no badge.",
    "statcan-osa-2018: the chip label carries \"(archived page)\" (C23; register check).",
    "cts-css-peds-dx-2026: the children intro body 2 and reasons 2 and 6 rest on the CTS/CSS press release of March 24, 2026; the full guideline was not read (blocked, F7).",
    "French: the whole fragment is machine translated (⚑ awaiting French review). Check the French chapter names used inside copy match the chapters’ French titles: \"Conduire et rester en sécurité\" (not-diagnosed-yet intro body 2) and the French Ch02 heading \"Arrêtez-vous et agissez maintenant\" (safety link, not-diagnosed-yet reason 7)."
  ],
  "heldCopy": {
    "released": "Held out of tree: none of this is in en.json, fr.json or paths-meta.ts. An item is released only by the ruling or gate named in `check`, then through the file’s change log and the nurse. \"cards\" are reading-list positions (list.reasons numbers) where an item belongs to a reason; [] where it belongs to a paragraph, a door or a band.",
    "items": [
      {
        "topic": "Liivv sleep support band (engine slot `pharmacist`) on cpap, bilevel and travel-cpap",
        "cards": [],
        "why": "Part C not live; RRT licences by province not mapped (plan Part C; rrt-service.md). The site promises only what is live.",
        "wording": "eyebrow: \"Liivv’s sleep support team\"; heading: \"Help with your setup, mask and supplies\"; body: \"Liivv’s sleep support team helps with setup, mask fit and supplies, once your treatment is prescribed. [Provinces and hours.] Your prescriber chooses your treatment and sets your pressure. We never change it.\"; cta: \"Request a call\". Travel variant heading: \"Help before a trip\".",
        "check": "Gate service:sleep-support (PATH_GATES.sleepSupportBand); owner (licence map, hours); supplies-only row 39: machine plan, or rewrite for N8."
      },
      {
        "topic": "\"Ask us what you need for a claim\" (every funding door)",
        "cards": [],
        "why": "No Liivv contact line or claim support confirmed for this site; vendor status open (P8 / B4).",
        "wording": "\"Ask us what you need for your claim.\"",
        "check": "Owner (N8 names who answers)."
      },
      {
        "topic": "Accessible Transportation Regulations s.49 (travel-cpap)",
        "cards": [],
        "why": "Fetched. Section 49 covers \"any small assistive device that the person needs during travel\" and names a cane, crutches, a communication device, an orthotic positioning device and a portable oxygen concentrator. CPAP is not named; whether a CPAP user falls under it is a legal reading.",
        "wording": "\"Federal rules require airlines in Canada to let a person with a disability keep a small assistive device they need on board.\"",
        "check": "atpdr-s49 (registered, held items only); a CTA guide naming CPAP."
      },
      {
        "topic": "Children’s prevalence (children intro)",
        "cards": [],
        "why": "Sources differ (P7 / C62).",
        "wording": "\"It affects 1 to 5 children in 100.\"",
        "check": "akh-osa; nurse rules P7."
      },
      {
        "topic": "\"Surgery is usually the first treatment\" for children (children intro)",
        "cards": [],
        "why": "Only on the Lung Association’s children’s section; AboutKidsHealth lists options with no order (P4 / C15).",
        "wording": "\"Removing the tonsils and adenoids is often the first treatment.\"",
        "check": "A child-specific page (AboutKidsHealth, CPS) that states it."
      },
      {
        "topic": "Children and auto-adjusting machines (children)",
        "cards": [],
        "why": "Alberta’s adult page, children’s section: \"Children should not use auto-adjustable pressure CPAP equipment.\" A machine-type rule for children on a non-child source. Chapters 03 and 04 hold it; Ch06 card 4’s note carries it on its own sourcing. The path does not repeat it.",
        "wording": "—",
        "check": "A child-specific Canadian source; Chapter 06 (C16)."
      },
      {
        "topic": "AboutKidsHealth PAP pressure and humidifier tips (children)",
        "cards": [],
        "why": "Settings words: the page gives a sample pressure value and humidifier setting changes. Never on the site (owner rule).",
        "wording": "None. Never released.",
        "check": "—"
      },
      {
        "topic": "Bilevel funding generalisation (bilevel funding door)",
        "cards": [],
        "why": "Alberta’s page says \"Many people who need BPAP therapy can get government funding to help pay for the equipment.\" Used nationally it overstates; NB and ADP are shown instead.",
        "wording": "\"Many people who need bilevel can get government funding.\"",
        "check": "ab-cpap-buyers-2026 (Ch03 R4; C48)."
      },
      {
        "topic": "Oral appliances as a tax medical expense (oral-appliance funding door)",
        "cards": [],
        "why": "Not on the CRA page fetched (it lists \"Dental services – paid to a medical practitioner\" but no oral appliance).",
        "wording": "—",
        "check": "CRA (fed-cra-medical or another CRA page that names it)."
      },
      {
        "topic": "ADP 100% on OW, ODSP and ACSD; 5-year replacement (cpap funding door)",
        "cards": [],
        "why": "On the page (\"We cover 100% of the ADP price … if you receive financial assistance from one of these programs\"), but left to the Funding page to keep the door short.",
        "wording": "—",
        "check": "on-adp-respiratory (verified); Funding page."
      },
      {
        "topic": "Positional therapy, tirzepatide, adult surgery, nerve stimulation (cpap, oral-appliance)",
        "cards": [],
        "why": "Held site-wide (plan Part F).",
        "wording": "—",
        "check": "Nurse ruling."
      },
      {
        "topic": "Shop strips on reading-only paths; paediatric masks on any path (oral-appliance, children, not-diagnosed-yet)",
        "cards": [],
        "why": "Plan Part B: no shop on these paths; paediatric masks only on a paediatric card (C17).",
        "wording": "None. Never released.",
        "check": "—"
      },
      {
        "topic": "Machine links on the cpap and travel-cpap strips (`cpap.shop.machinesLink`, `travel-cpap.shop.machinesLink`)",
        "cards": [],
        "why": "Liivv sells no machines (ruling N1, 2026-10-13; all machines hidden in the store). Supplies-only rows 36 and 37: delete. Machine-sale copy is out of tree (spec 8.4).",
        "wording": "\"See machines (prescription required)\"; \"See travel machines (prescription required)\".",
        "check": "The SLT machine plan, and N10 (\"Not sold by Liivv yet\")."
      }
    ]
  }
};
