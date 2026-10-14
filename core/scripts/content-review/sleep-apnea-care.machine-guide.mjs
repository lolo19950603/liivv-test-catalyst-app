/*
 * Reviewer-only data for the Sleep Apnea Care pack, machine-guide (generated from the build's
 * `guide` fragment review.json: its open rulings with their defaults and alternatives,
 * the pre-publish checks, and the held copy that is not in the message files).
 * Read by ./sleep-apnea-care.mjs only; nothing renders it.
 */

export const REVIEW = {
  "openRulings": [
    {
      "id": "N10 (machine-guide D16)",
      "default": "“Liivv doesn’t sell CPAP or other sleep apnea machines yet.” The “…yet” wording stays until the owner rules N10 (the same words as the store’s machine pages).",
      "where": [
        "notSold"
      ],
      "alternative": "“Liivv doesn’t sell machines” wording, without “yet” (change the store’s machine-page notices at the same time)."
    },
    {
      "id": "D13 (placement)",
      "default": "Its own page, /liivv-health/sleep-apnea-care/machine-guide, linked from nowhere while LANDING_GATES.machineGuideLinked is false (spec 8.3). Not in the sitemap before launch.",
      "where": [
        "(whole page)"
      ],
      "alternative": "A section of Chapter 03 after card 5, with the chart as a site figure; and/or link it from Chapter 03 cards 1 to 5 and the landing’s machines slot (“Machines: not sold by Liivv yet. Compare common machines”, machine-guide.md A.1)."
    },
    {
      "id": "C19 (machine-guide D3)",
      "default": "“Every machine needs a prescription” (Alberta, BC, Lung Association), and “Some provincial guidance says auto and bilevel machines should be prescribed only by a sleep specialist” (BC guide, chip only). The chart’s prescriber cells say the same, naming BC.",
      "where": [
        "cards.1.items.5",
        "cards.asv.items.1",
        "CHART_A.*.prescriber"
      ],
      "alternative": "The same BC guide also says “In most cases the specific design will be prescribed by a primary care physician or family practitioner”; Alberta and the Lung Association say a doctor’s prescription. Say only “Needs a prescription. Your prescriber decides”, or show both BC lines side by side."
    },
    {
      "id": "C21 (machine-guide D6)",
      "default": "The ASV card as written: ASV framed as bilevel through the maker’s own type label; Health Canada RA-53771 in its own terms (Type I, symptomatic chronic heart failure with reduced left ventricular ejection fraction, 33.5% increased risk of cardiovascular death); no ejection-fraction cut-off; no “used for central sleep apnea”; no heart-failure instruction. Chapter 03’s 3.note differs (it keeps “used for central sleep apnea” and “If you have heart failure, make sure your sleep specialist knows”).",
      "where": [
        "cards.asv.items.1",
        "cards.asv.items.2",
        "cards.asv.items.3",
        "cards.asv.items.4",
        "CHART_A.aircurve11Asv"
      ],
      "alternative": "Align this card and Chapter 03 3.note on one wording; release E5 (heart-failure line) if the nurse approves it as framing; show the maker’s “LVEF ≤ 45%” labelled Maker (E4; default: not)."
    },
    {
      "id": "D7 (CTA on-board line)",
      "default": "Keep cards.2.items.4: the Canadian Transportation Agency’s line on telling the reservation agent about batteries or onboard power, applied to CPAP (the page doesn’t name CPAP: our framing).",
      "where": [
        "cards.2.items.4"
      ],
      "alternative": "Drop item 4 and keep only the Lung Association’s carry-on tip (item 5). Dropping it would leave a gap in cards.2.items, so it is a copy change in machine-guide.md B (EN and FR), not a hold."
    },
    {
      "id": "C8 and C46 (machine-guide D10)",
      "default": "“Talk to your doctor or equipment provider before you stop or change how you use it” is scoped to the Philips foam recall only, and the card names Philips because the recall is published under that name. The ozone line stays Philips-scoped (C5, ruled “default”).",
      "where": [
        "cards.4.items.2",
        "cards.4.items.3",
        "CHART_A.dreamstation2.recall"
      ],
      "alternative": "C8: apply “talk to your doctor before you stop” to any recall. C46: don’t name Philips (new wording to be drafted in machine-guide.md B and checked against the recall page)."
    },
    {
      "id": "D2 (recall absence)",
      "default": "Keep “None found (a search, not proof)” in the recall cells of AirSense 11, AirCurve 11 VAuto, AirMini, Yuwell and Transcend Micro, and the footnote line (Health Canada’s site search misses archived notices).",
      "where": [
        "chart.a.noRecall",
        "chart.footnote",
        "CHART_A.*.recall (null cells)",
        "CHART_A.dreamstation2.recall"
      ],
      "alternative": "Drop the recall column for models with no notice found."
    },
    {
      "id": "D1 (Transcend manual hosting)",
      "default": "Cite the Transcend Micro manual PDF (transcend-micro-manual) as the Maker chip for its type and table B cells. The PDF sits on the file server of the maker’s own direct-to-consumer CPAP shop (cdn.shopify.com); the shop pages are never cited or linked.",
      "where": [
        "CHART_A.transcendMicro.type",
        "CHART_B.transcendMicro.*"
      ],
      "alternative": "Ask the maker for a copy hosted elsewhere; or set the source to display: 'reviewOnly' (cells keep their text, lose the chip link); or hold the Transcend Micro rows until a copy is found."
    },
    {
      "id": "D4 (Z2 Auto)",
      "default": "Left out (held, E1): removed from both its Health Canada licences in March 2026 and discontinued by the maker.",
      "where": [
        "CHART_A",
        "CHART_B"
      ],
      "alternative": "Add one owners’ line (wording in heldCopy E1)."
    },
    {
      "id": "D5 (Transcend Micro 510)",
      "default": "Held (E2): no MDALL device name or identifier found. The manuals name Transcend Inc.; the licence holder is Somnetics International, Inc. The Transcend Micro row prints its identifier (506001) where the other rows print the maker.",
      "where": [
        "CHART_A.transcendMicro"
      ],
      "alternative": "Ask the maker which Health Canada licence and identifier cover the 510, and add it then."
    },
    {
      "id": "D8 (Transcend Micro type)",
      "default": "The manual’s words: \"Continuous Positive Airway Pressure (CPAP) device\". The store’s own product name says “Auto CPAP”.",
      "where": [
        "CHART_A.transcendMicro.type"
      ],
      "alternative": "Not stated otherwise in any fetched source; keep the manual’s words."
    },
    {
      "id": "D9 (DreamStation 2, US FDA)",
      "default": "Out (held, E3): no Health Canada notice found; the 2023 US FDA overheating communication is a foreign regulator.",
      "where": [
        "CHART_A.dreamstation2.recall"
      ],
      "alternative": "Show the US line labelled US (wording in heldCopy E3)."
    },
    {
      "id": "D11 (Yuwell)",
      "default": "Cells from the maker’s product image only, read by eye: humidifier, heated tube, noise (test standard not stated), cloud data (no detail). Travel, size and weight, and masks show “Not stated by the maker” (E6).",
      "where": [
        "CHART_A.yuwellYh680b.type",
        "CHART_B.yuwellYh680.*"
      ],
      "alternative": "Ask Yuwell for a spec sheet and fill the cells from it."
    },
    {
      "id": "D12 (AirSense 10 edition)",
      "default": "AirSense 10 type words and table B figures come from the European user guide (EUR3), including its 4G/3G/2G wireless module; no Americas edition was reachable.",
      "where": [
        "CHART_A.airsense10.type",
        "CHART_B.airsense10.*"
      ],
      "alternative": "Confirm the Canadian figures with ResMed and replace them."
    },
    {
      "id": "Build: review markers in prescriber cells",
      "default": "The B.2 prescriber cells of AirSense 11 and AirCurve 11 VAuto end “(C19 open)”, and those of AirMini, DreamStation 2 and Yuwell end “(C19 for auto)”. These are review markers, not reader copy: the page shows the cell without them, and each cell’s `openRuling` keeps the marker for this pack.",
      "where": [
        "CHART_A.airsense11.prescriber",
        "CHART_A.aircurve11VAuto.prescriber",
        "CHART_A.airmini.prescriber",
        "CHART_A.dreamstation2.prescriber",
        "CHART_A.yuwellYh680b.prescriber"
      ],
      "alternative": "Show the markers to readers (not recommended), or give those cells reader words for the open question once C19 is ruled."
    },
    {
      "id": "Build: BC named in chart cells",
      "default": "The prescriber cells keep B.2’s wording “BC: …”, which names the province whose guidance it is (a scope, like “In Ontario”), while the cards say “Some provincial guidance”. Sources still render as chips on the cell.",
      "where": [
        "CHART_A.airsense11.prescriber",
        "CHART_A.aircurve11VAuto.prescriber",
        "CHART_A.aircurve11Asv.prescriber"
      ],
      "alternative": "Match the cards: “Some provincial guidance: …” (a copy change in machine-guide.md B.2 first)."
    }
  ],
  "prePublishChecks": [
    "Re-check the eight licences (MDALL licence pages 106650, 93717, 110422, 99052, 105749, 113188, 112836, 102774: status I, class 2, the named device or identifier still listed) and repeat the recall searches. Then change the date in four places together: GUIDE_CHECKED_ON, MACHINE_GUIDE.checkedOn, machineGuide.cards.4.note and machineGuide.chart.footnote (EN and FR). They were checked on 2026-10-13.",
    "hc-recall-asv-2015 (RA-53771) is archived: check Health Canada for a newer ASV advisory before publishing.",
    "Register: hc-recall-philips-ra-76137’s chip label must say RA-62729, and its href is the redirect target; cla-sleep-apnea’s href must be updated to https://www.lung.ca/lung-diseases/sleep-apnea/ (sources.md checks).",
    "Register: yuwell-yh680-image is an http:// address. Use the https:// form of the same URL; if it doesn’t serve, mark it display: 'reviewOnly', set CHART_A.yuwellYh680b.type to null (it then reads “Not stated by the maker”), and decide whether the Yuwell table B cells (sourced to it alone) stay or go null too (spec 3.3).",
    "D1: decide whether the Transcend Micro manual PDF on the maker’s own shop file server may be cited before the page is linked.",
    "D14 (machine plan only, no copy here): the AirCurve store SKUs 38040 and 38043 don’t match the Canadian MDALL identifiers (39495 and 39498, or the CAN TRI packs 39020 and 39023).",
    "D15: all 10 machine products read is_visible: false but availability “available”. Confirm the code-level block covers direct product links. The guide links no product.",
    "French: hc-mdall and hc-recalls-safety-alerts have no French page recorded in the register, so card 4’s two links open English pages on /fr (marked by OutboundLabel). Add hrefFr only if the register records the publisher’s French page.",
    "Before linking the page from anywhere (machineGuideLinked), rule D13 and re-run this list."
  ],
  "heldCopy": {
    "released": "Section E items never enter the message files or machine-guide-data.ts. To release one: the owner or nurse rules on the named question, its source moves from sources.md section 12 into the register (if it has one), and the row, cell or line is added to machine-guide-data.ts (chart) or to machineGuide in en.json and fr.json (card copy), with its chip.",
    "items": [
      {
        "topic": "E1 · Z2 Auto (Breas) row in both tables",
        "cards": [],
        "why": "Identifier 718175 (the store’s SKU) was removed from licence 93643 on 2026-03-12 and from licence 103870 on 2026-03-13; the maker has discontinued the Z Sleep Travel CPAP line. Both licences stay active for accessories only. Open question D4.",
        "wording": "Optional owners’ line: “No longer licensed in Canada for sale (March 2026). The maker has discontinued it; parts are available through October 2030.”",
        "check": "mdall-di-z2-718175 (sources.md 12: \"end_date\":\"2026-03-12\" and \"2026-03-13\"); breas-z2-page (Maker, for the owner only: the page carries “Buy Online” links, never link shoppers to it)."
      },
      {
        "topic": "E2 · Transcend Micro 510 row in both tables",
        "cards": [],
        "why": "No MDALL device name or identifier found for the 510 (a search, not proof). Its manual lists “Ventilator Mode:” CPAP only. Open question D5.",
        "wording": "—",
        "check": "mdall-lic-102774 (no 510 device or identifier); transcend-micro510-manual (sources.md 12; same hosting question as D1)."
      },
      {
        "topic": "E3 · DreamStation 2 overheating (US FDA, 2023), in the DreamStation 2 recall cell",
        "cards": [],
        "why": "Foreign regulator; no Health Canada notice found. Open question D9 (default: out).",
        "wording": "“In 2023, the US regulator told patients to carefully monitor DreamStation 2 machines for signs of overheating.” (labelled US)",
        "check": "fda-ds2-overheating-2023 (sources.md 12, INTL): “Date Issued: November 28, 2023”; “carefully monitor Philips DreamStation 2 continuous positive airway pressure (CPAP) machines”."
      },
      {
        "topic": "E4 · ASV card: the ejection-fraction cut-off",
        "cards": [],
        "why": "Maker labelling only; Health Canada’s notice RA-53771 has no cut-off. Open question D6 / C21 (default: not shown).",
        "wording": "—",
        "check": "resmed-aircurve11-page (Maker): “reduced left ventricular ejection fraction (LVEF ≤ 45%)”. Never print ≤45% from hc-recall-asv-2015."
      },
      {
        "topic": "E5 · ASV card: “If you have heart failure, make sure your sleep specialist knows”",
        "cards": [],
        "why": "No fetched source gives this instruction; RA-53771 gives no patient instructions (the independent checker removed it). Chapter 03’s 3.note still carries it. Nurse ruling C21.",
        "wording": "“If you have heart failure, make sure your sleep specialist knows.”",
        "check": "No source; nurse ruling only (C21)."
      },
      {
        "topic": "E6 · Yuwell size, weight, noise test standard and data detail",
        "cards": [],
        "why": "Not stated by the maker: the only maker source is a product image. The size cell (B.2 “Not stated (unverified)”), travel and masks cells render “Not stated by the maker”. Open question D11.",
        "wording": "—",
        "check": "yuwell-yh680-image (Maker image, read by eye; it also shows a pressure range, never copied)."
      }
    ]
  }
};
