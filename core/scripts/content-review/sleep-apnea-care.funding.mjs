/*
 * Reviewer-only data for the Sleep Apnea Care pack, funding (generated from the build's
 * `funding` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "R-1 (C9)",
      "default": "Manitoba's trial rule is shown as the program's condition, not a health target: \"To pass the trial, you use it on at least 70% of nights, for 4 hours or more. That’s the program’s rule; your sleep team sets your own goal.\" The sheet's next line (\"This is required to get benefit from the treatment.\") is not used. Side by side: the CTS/CSS 2014 driving paper uses ≥4 h on >70% of nights over ≥30 days as a licensing measure (Ch02); Manitoba uses it as a funding trial.",
      "where": [
        "funding.programs.mb-misericordia-cpap.howToApply"
      ],
      "alternative": "Drop the numbers and say \"a successful trial of at least a month\"; or keep the sheet's sentence."
    },
    {
      "id": "R-2 (C67)",
      "default": "Bilevel and APAP are named as covered machines where the program lists them (ADP, NIHB, VAC, NB, BCEA, FNHA). The page never says who should use one.",
      "where": [
        "funding.programs.fed-nihb-respiratory.covered",
        "funding.programs.bc-fnha-mse.covered",
        "funding.programs.fed-vac-poc9.covered",
        "funding.programs.on-adp-respiratory.covered",
        "funding.programs.bc-bcea-breathing.covered",
        "funding.programs.nb-sd-respiratory.covered"
      ],
      "alternative": "Name only \"CPAP machines\" and say \"and other PAP machines\"."
    },
    {
      "id": "R-3 (C68)",
      "default": "Oral appliances are mentioned where a program funds one (ODSP's list; BCEA's mandibular advancement device if PAP isn't tolerated) and where one doesn't (ADP).",
      "where": [
        "funding.programs.on-odsp-msn.covered",
        "funding.programs.bc-bcea-breathing.covered",
        "funding.programs.on-adp-respiratory.notes"
      ],
      "alternative": "Leave oral appliances off this PAP page."
    },
    {
      "id": "R-4 (06 R10)",
      "default": "NIHB prior approval: the copy names the machine, masks, tubing and chin straps, and is silent on filters. Side by side: 8.1.3 \"Prior approval is required for all respiratory equipment and supplies benefits.\" vs the 8.4.1 table \"Filters, inlet … No\". (Held in tree with the whole NIHB card until the partner review, ruling B1.)",
      "where": [
        "funding.programs.fed-nihb-respiratory.howToApply"
      ],
      "alternative": "Say \"everything needs prior approval\"; or ask NIHB."
    },
    {
      "id": "R-5 (C69)",
      "default": "CRA threshold amounts shown (2025 returns: the lesser of 3% of net income or $2,834). The recheck phrase is not set on \"$2,834\", so a yearly change shows as CHANGED, not MISSING.",
      "where": [
        "funding.programs.fed-cra-medical.howToApply"
      ],
      "alternative": "Say only \"a yearly threshold\" and link."
    },
    {
      "id": "R-6 (C70)",
      "default": "ODSP list: \"Sanitizing unit\" left out. The ODSP schedule lists it; Health Canada and PMRA advise against ozone/UV cleaners (Ch02, pmra-uv-ozone). Naming it could read as an endorsement.",
      "where": [
        "funding.programs.on-odsp-msn.covered"
      ],
      "alternative": "List it as printed, with a link to Ch02's cleaner warning."
    },
    {
      "id": "R-7 (C71)",
      "default": "Manitoba's at-home testing route is held (E-5): the \"or its at-home testing partner\" clause is out of the copy; its only source is a 2023 release about an \"interim partnership agreement\" whose current status is unconfirmed. mb-cpap-release-2023 backs no live line.",
      "where": [
        "funding.programs.mb-misericordia-cpap.who"
      ],
      "alternative": "Restore the clause once a current gov.mb.ca or Shared Health page confirms the route."
    },
    {
      "id": "R-8 (C72)",
      "default": "The Quebec card shows the dated INESSS facts (translated from the French-only page) with \"we're checking whether a public program has started since\".",
      "where": [
        "funding.province.qc-still-checking.body"
      ],
      "alternative": "Show only \"we're still checking\", like Nova Scotia and PEI."
    },
    {
      "id": "R-9 (C65)",
      "default": "The Canadian Lung Association's children's CPAP grant is named (the organisation is the subject, not a source named in prose), with info@lung.ca. Ch06 card 10 item 7 uses it too.",
      "where": [
        "ui.fundingPage.enough3Heading",
        "ui.fundingPage.enough3Body"
      ],
      "alternative": "Drop it until the grant has its own page."
    },
    {
      "id": "R-10",
      "default": "No 911 line on this page. The urgent exit links Chapter 02's red-flag block, which owns the 911 tier (ruling C1). Never gated.",
      "where": [
        "page: urgent exit (A.2 item 2)"
      ],
      "alternative": "None recorded."
    },
    {
      "id": "R-11",
      "default": "FNHA's 30-day / 70% trial is not shown: in the Fee Supplement it is a provider attestation that names the plan administrator. Side by side: Manitoba's sheet uses the same 70% / 4-hour measure as a funding trial (R-1).",
      "where": [
        "funding.programs.bc-fnha-mse.howToApply"
      ],
      "alternative": "Add \"Your provider gives you a 30-day trial first. That's the program's rule; your sleep team sets your own goal.\" (same framing as R-1)."
    },
    {
      "id": "B1 / D-13 (applied: held in tree)",
      "default": "Ruling B1 (\"default\", 2026-10-13): the NIHB and FNHA cards wait on an Indigenous health partner's review. Their words (funding.programs.fed-nihb-respiratory.*, funding.programs.bc-fnha-mse.*) are in en/fr but stripped from the client and never rendered. Meanwhile the NIHB card shows its program name, \"Find your office\" (linking the NIHB regional offices page, nihb-contact) and the date it was checked; the FNHA card shows its name, the FNHA Health Benefits number, its official page and the date. No new words were written: section B has no \"Contact your NIHB regional office\" line for this page.",
      "where": [
        "funding.programs.fed-nihb-respiratory",
        "funding.programs.bc-fnha-mse",
        "PROGRAM_META held: 'indigenousPartnerReview'"
      ],
      "alternative": "Show Chapter 06's 9.heldNote wording on the cards (\"…is being reviewed with an Indigenous health partner… Until then, contact your NIHB regional office.\"), or approve a funding-page held note. Also decide whether the partner review covers ui.fundingChecker.indigenousHint, funding.groups.nihb, ui.fundingPage.nihbHeading and the FNHA sentence on the BC caution card; they are shown today because they are not cards."
    },
    {
      "id": "N8 (supplies-only row 42)",
      "default": "Section B kept verbatim: \"…Check how yours pays before you order, or ask us.\" (funding.liivv.askUsBody) and \"…before you order, or ask us.\" (ui.fundingPage.directEmpty). There is no \"ask us\" route in the tree: the support band and its \"Request a call\" are held out of tree (Part C not live, D-7).",
      "where": [
        "funding.liivv.askUsBody",
        "ui.fundingPage.directEmpty"
      ],
      "alternative": "The supplies-only re-sort proposes dropping \"or ask us\" until N8 names who answers (a section B edit), or hold both lines."
    },
    {
      "id": "D-1 / B4",
      "default": "Liivv bills no program directly: DIRECT_BILLING is empty, the page shows ui.fundingPage.directEmpty, and every card says how the program itself pays.",
      "where": [
        "ui.fundingPage.directHeading",
        "ui.fundingPage.directBody",
        "ui.fundingPage.directEmpty",
        "DIRECT_BILLING"
      ],
      "alternative": "List each program once the owner confirms Liivv is a registered vendor or provider with it (ADP, NIHB/FNHA, VAC, BCEA, AISH, NB Social Development, ODSP pay-direct, the Manitoba program)."
    },
    {
      "id": "D-2 / B5",
      "default": "No line says Liivv bills a private insurer, or what a Liivv receipt shows.",
      "where": [
        "funding.liivv.askUsBody"
      ],
      "alternative": "Add a receipt line once the owner confirms it shows what insurers and NIHB ask for (prescription, item, Canadian business, CAD)."
    },
    {
      "id": "D-3",
      "default": "The NIHB card promises nothing about reimbursement for items bought from Liivv (NIHB requires a recognized provider).",
      "where": [
        "funding.programs.fed-nihb-respiratory.howToApply"
      ],
      "alternative": "Owner confirms whether Liivv is recognized by NIHB to dispense PAP supplies."
    },
    {
      "id": "D-4",
      "default": "ODSP card describes pay-direct only as the program's own method; no Liivv line.",
      "where": [
        "funding.programs.on-odsp-msn.howToApply"
      ],
      "alternative": "Owner confirms whether Liivv can be a ministry-approved third party for MSN supplies."
    },
    {
      "id": "D-5 / B7",
      "default": "The Quebec and still-checking cards say nothing about Liivv shipping there.",
      "where": [
        "funding.province.qc-still-checking",
        "funding.province.stillChecking"
      ],
      "alternative": "Add a Liivv line once shipping to Quebec and the territories is confirmed."
    },
    {
      "id": "D-6 / B13",
      "default": "Ontario Works supplies not read; nothing said (E-4 held).",
      "where": [
        "PROGRAM_META (ON)"
      ],
      "alternative": "Read the OW directives and add a row if OW has a supplies benefit."
    },
    {
      "id": "D-7 / B14",
      "default": "No \"Request a call\" on this page: the support band is out of tree and the Liivv card has no link.",
      "where": [
        "funding.liivv (askUs card)",
        "ui.fundingPage.support* (out of tree)"
      ],
      "alternative": "Confirm \"Funding or coverage question\" as an appointment reason on /account/virtual-care/appointment, then link it from the Liivv card."
    },
    {
      "id": "D-9 / B16",
      "default": "Official French program names only where printed (PAAF, POSPH and its MSN, SSNA, ACC PDC 9, NB, CRA; Manitoba's generic phrase). SAIL, BCEA, AISH, FNHA and BC PharmaCare keep their English names in French copy.",
      "where": [
        "PROGRAM_META programNameFr",
        "fr.json"
      ],
      "alternative": "Find official French pages for the five before /fr goes live."
    },
    {
      "id": "D-10 / B6",
      "default": "ADP's numbers held (E-16: complaints line). NIHB shows \"Find your office\" (no single number). FNHA's 1-855-550-5454 is shown although the page prints it under a sentence that begins with the dental plan. CRA shows only the provinces' number. ODSP and AISH have no number (\"your ODSP office\", \"your AISH worker\").",
      "where": [
        "PROGRAM_META phones",
        "PROVINCE_CAUTION.BC phones"
      ],
      "alternative": "Rule phones for the Sleep and Diabetes sites together; hold FNHA's number too if the dental-plan context is a concern."
    },
    {
      "id": "D-14 / B17",
      "default": "Monthly recheck through check-funding-sources.mjs --site=sleep-apnea-care, under the existing scheduled task (NEXT_CHECK 2026-11-13).",
      "where": [
        "NEXT_CHECK",
        "RECHECK_OWNER"
      ],
      "alternative": "Confirm the scheduled task covers both sites."
    },
    {
      "id": "D-15 / E4",
      "default": "Not applied: the checker still shows the SAIL card as primary to a Saskatchewan reader who answers yes to First Nations/Inuit or veteran, although SAIL excludes people with NIHB or Veterans Affairs benefits (its who line says so). funding.md A.5 does not make the change and B has no extra line for it.",
      "where": [
        "buildResults (SK)",
        "funding.programs.sk-sail-cpap.who"
      ],
      "alternative": "Tone 'supporting' with an extra line in that case (needs copy)."
    },
    {
      "id": "BUILD-urgent-exit-words",
      "default": "The urgent exit uses the landing's urgent-exit chapter words (this-might-be-you: \"Signs that need care right away, including a child’s breathing, are in Driving & Staying Safe, under\" / \"Get help now\"), linked to staying-safe#red-flags, as the Diabetes funding page does. Never gated.",
      "where": [
        "URGENT_EXIT_WORDS_CHAPTER"
      ],
      "alternative": "funding.md A.2 names chapters.staying-safe.urgentExit, but its lead says \"at the top of this page\", which is only true on Chapter 02."
    },
    {
      "id": "BUILD-still-checking-rule",
      "default": "A group's \"we're still checking\" card shows only when nothing is on record for that group in the province (and no province note already says so). A program that the answers leave out is not \"not found\".",
      "where": [
        "buildResults",
        "ui.fundingResults.noConfirmedTitle",
        "ui.fundingResults.noConfirmedBody"
      ],
      "alternative": "funding.md A.5's sketch tested the shown list, which would tell a New Brunswick reader not on assistance (or an Ontarian asking about supplies, not on ODSP) that no official program was found. A \"none of the programs fits your answers\" line (as Diabetes has) would need new copy."
    },
    {
      "id": "BUILD-buy-first-in-results",
      "default": "In the checker's results, \"Check with your program first\" lists ui.fundingPage.buyFirstBody plus only the reader's province's line (Ontario item 1, BC item 2, Saskatchewan item 3); elsewhere the body alone. The page's own card (#paying, part 3) always shows all three.",
      "where": [
        "BUY_FIRST_ITEMS",
        "ResultCopy.buyFirst"
      ],
      "alternative": "Show all three lines in the results too."
    },
    {
      "id": "BUILD-chips-beyond-C",
      "default": "Two chips not in the claims table: bc-bcea-breathing on the BC caution card (the claims table cites it for the card's assistance sentence, s4–5, but A.4 listed only two sources), and fed-vac-poc9 on ui.fundingChecker.veteranHint (the benefit's own page). Caution cards also carry their checked date (2026-10-13).",
      "where": [
        "PROVINCE_CAUTION.BC.sources",
        "PAGE_SOURCES['ui.fundingChecker.veteranHint']",
        "ProvinceCaution.verifiedOn"
      ],
      "alternative": "Keep A.4's two BC sources; leave the hint without a chip; no date on caution cards."
    }
  ],
  "prePublishChecks": [
    "sk-sail-cpap is a March 2023 bulletin: confirm it is still the current SAIL CPAP sheet (it is the one linked from the SAIL page today). (FUND pre-publish 1; F13)",
    "mb-misericordia-cpap prints no date (footer SDC-6-24): confirm with the Sleep Disorder Centre or a gov.mb.ca page that the $500 co-pay is current. Manitoba's sleep-study guide PDF returned 404. (FUND pre-publish 2; F14)",
    "on-adp-resp-manual-2024: checked 2026-10-13 (still the policy manual linked from ADP's manuals page, updated 2026-09-03); recheck monthly. (FUND pre-publish 3; F10: ADP wording unchanged on publishing day)",
    "bc-pap-buyers-guide: no printed date; confirm it is still the current BC guide. (FUND pre-publish 4; F16)",
    "ab-aish: the AISH pages now sit beside ADAP (Alberta Disability Assistance Program); check whether ADAP clients get the same CPAP benefit. (FUND pre-publish 5; F15)",
    "NIHB benefit list (nihb-pap): effective date and supply rows unchanged. (F8)",
    "BCEA replacement table (bc-bcea-breathing) unchanged. (F9)",
    "Every program row's checkPhrases still on its page on publishing day: add the Sleep funding ids to check-funding-sources.mjs --site=sleep-apnea-care with its own baseline; today's script reads PROGRAM_META and PAGE_SOURCES only, so the PROVINCE_CAUTION check phrases need reading too. (F19; D-14)",
    "Register hrefs that now redirect: fnha-mse, fed-vac-poc9, cra-contact, cla-sleep-apnea (use the addresses they land on). (F18)",
    "Flag the CRA 404 (…-claim-tax-return.html without \"on-your\") to the Diabetes and Ostomy registers. (F17)",
    "French names to verify before /fr ships without the draft marker: \"Aide à l’égard d’enfants qui ont un handicap grave\" (Ontario ACSD), \"Ontario au travail\", \"Aide à l’emploi et au revenu\" (Manitoba EIA), \"carte des Services d’assistance santé\" (New Brunswick Health Services card), \"carte Santé\" (Ontario), and whether the federal French name of the First Nations Health Authority (likely \"Régie de la santé des Premières Nations\") should replace the English name. (D-9, B16)"
  ],
  "heldCopy": {
    "released": "None of these is in the message files or the code. Each is released by the named check or ruling: the wording (or a new one) is added to docs/sleep-content/funding.md section B (and A.4 for a program row) with a change-log row, then re-extracted. The NIHB and FNHA program words are held in tree instead (ruling B1): delete the row's `held:` line after the partner review.",
    "items": [
      {
        "topic": "E-1 · Alberta Income Support and Special Needs Assistance for Seniors as program rows",
        "cards": [],
        "why": "Named in the Alberta caution card (from MyHealth Alberta's list), but their own pages were not read.",
        "wording": "Alberta Income Support may help with CPAP equipment if you get income support. Ask your worker.",
        "check": "Read and register their alberta.ca pages."
      },
      {
        "topic": "E-2 · Alberta Aids to Daily Living CPAP criteria",
        "cards": [],
        "why": "open.alberta.ca returned 520 and ab.bluecross.ca 403 (2026-10-12). The page shows the \"we're still checking\" line instead (funding.province.aadl).",
        "wording": "—",
        "check": "Read the AADL manual."
      },
      {
        "topic": "E-3 · Nova Scotia, PEI, Newfoundland and Labrador, Yukon, NWT and Nunavut programs",
        "cards": [],
        "why": "No official page found or read (PEI behind a bot check). The page lists them as still checking.",
        "wording": "—",
        "check": "Find and read each official program page (B22)."
      },
      {
        "topic": "E-4 · Ontario Works supplies",
        "cards": [],
        "why": "Not read (D-6, B13).",
        "wording": "—",
        "check": "Read the ontario.ca OW directives."
      },
      {
        "topic": "E-5 · Manitoba free at-home testing, and CPAP program access after an at-home test",
        "cards": [],
        "why": "The 2023 release calls it an \"interim partnership agreement… at no cost to them\"; current status unread; the partner is a private company (never named). The clause was removed from funding.programs.mb-misericordia-cpap.who by the source check (R-7).",
        "wording": "In Manitoba, you may be able to get a home sleep test at no cost, and still use the CPAP program. Ask your doctor.",
        "check": "A current gov.mb.ca or Shared Health page confirming the route (mb-cpap-release-2023 is verified but dated June 7, 2023)."
      },
      {
        "topic": "E-6 · Quebec's April 2023 CPAP reimbursement announcement",
        "cards": [],
        "why": "INESSS's abstract (via INAHTA) records the announcement with terms \"not yet defined\"; status since May 2024 unread (RAMQ 403; BAnQ showed a CAPTCHA, not attempted further).",
        "wording": "In April 2023, Quebec announced funding to help pay for CPAP machines. Its rules weren’t set as of May 2024.",
        "check": "A quebec.ca or RAMQ page."
      },
      {
        "topic": "E-7 · Saskatchewan group benefit plans",
        "cards": [],
        "why": "The lead (group plans no longer pay for private CPAP purchases) is from a shared-services organisation, not the program; not fetched.",
        "wording": "—",
        "check": "A saskatchewan.ca page."
      },
      {
        "topic": "E-8 · New Brunswick replacement periods",
        "cards": [],
        "why": "In the Social Development Respiratory Program Policy, not read. The card says only that the period varies.",
        "wording": "—",
        "check": "Read the NB respiratory policy (2024)."
      },
      {
        "topic": "E-9 · ADP doesn't cover ASV",
        "cards": [],
        "why": "ADP lists ASV under \"We do not cover\"; ASV detail waits until the Health Canada advisory is registered (Ch03). Liivv sells no machines; the ASV listing is hidden.",
        "wording": "Ontario’s program doesn’t pay for ASV machines.",
        "check": "Health Canada ASV advisory registered and the Ch03 ASV wording ruled (C21)."
      },
      {
        "topic": "E-10 · ODSP oral appliance amount and ADP's 3-year warranty minimum",
        "cards": [],
        "why": "Warranty policy is an owner question (Part C step 7).",
        "wording": "—",
        "check": "Owner warranty policy."
      },
      {
        "topic": "E-11 · Price ranges",
        "cards": [],
        "why": "MyHealth Alberta: \"In Canada, CPAP therapy equipment and accessories cost between $1,600 and $2,800.\" The file's reason (\"Liivv sells machines by request\") is out of date: Liivv sells no machines (N1), so the range would now be general information only (B18; supplies-only row 43).",
        "wording": "A CPAP machine and accessories usually cost $1,600 to $2,800 in Canada.",
        "check": "Owner ruling B18."
      },
      {
        "topic": "E-12 · Checker privacy promise (toolIntro)",
        "cards": [],
        "why": "Engineering and the privacy lead must confirm no analytics, session replay or event capture records the inputs (health, assistance, Indigenous and veteran status). Kept held by ruling B3 (\"default\", 2026-10-13).",
        "wording": "Nothing you enter is saved or sent anywhere. This runs in your browser.",
        "check": "Privacy sign-off (D-8, B3)."
      },
      {
        "topic": "E-13 · Direct billing lines",
        "cards": [],
        "why": "Vendor status not confirmed (D-1, B4).",
        "wording": "We bill {program} directly.",
        "check": "Owner confirms each enrolment."
      },
      {
        "topic": "E-15 · Canadian Lung Association advocacy line",
        "cards": [],
        "why": "\"We believe that everyone who needs CPAP treatment … should have it paid for.\" Advocacy, not a fact. Not for release.",
        "wording": "—",
        "check": "—"
      },
      {
        "topic": "E-16 · ADP phone numbers (ADP_PHONES: 416-327-8804, 1-800-268-6021, TTY 1-800-387-5559)",
        "cards": [],
        "why": "Printed on the ADP page only as the complaints line (\"You may make a complaint verbally if you have a physical disability that prevents you from submitting a written complaint.\"). The constant is commented out in funding-meta.ts.",
        "wording": "phones: [ADP_PHONES] on on-adp-respiratory",
        "check": "Owner ruling D-10 / B6, for the Sleep and Diabetes sites together."
      },
      {
        "topic": "Liivv sleep support band (A.2 item 8): ui.fundingPage.supportEyebrow, supportHeading, supportBody, supportCta",
        "cards": [],
        "why": "Part C service copy: the Liivv sleep support (RRT) service is not live and makes no promises (supplies-only decision; row 41). Kept out of the message files (spec 8.4).",
        "wording": "Liivv’s sleep support team · Questions about coverage and supplies · Liivv’s sleep support team can help you understand what your program needs from you and which supplies you need. · Request a call",
        "check": "Part C live, or rewritten for N8 / B14 (who answers), and D-7 (the appointment reason)."
      }
    ]
  }
};
