/**
 * Reviewer-only data for the Diabetes Care landing page, read by the Diabetes
 * Care pass of the content-review export (./diabetes-care.mjs).
 *
 * From the landing's copy record after the source check of 2026-10-05: its
 * open questions for the owner, the nurse, operations and engineering
 * (section D), and the wording it holds back (section E). None of it renders
 * on any page.
 *
 * The owner's business answers of 2026-10-06 settled D2, D4, D6, D7, D8, D9,
 * D17 and D19 and released E2, E3, E4, E5 and E9 (and E7's relationship
 * line); they are recorded under `settled`.
 *
 * Two kinds of hold, kept apart:
 *   - `heldItems` is wording that is NOT in the message files at all.
 *   - Copy that is written and checked but waits on a switch (trust item 4,
 *     FAQ 2 and FAQ 5) IS in the message files, and is kept off the page and
 *     out of the browser by LANDING_GATED_COPY in diabetes-care/landing-meta.ts.
 *     The pack prints it where it would render, with the switch that holds it.
 *
 * `where` is message paths under `ui.landingPage`, checked against en.json, so
 * a question cannot keep pointing at a line that has gone. When a question is
 * answered, the copy changes (or stays) and the entry comes out.
 */

export const LANDING = {
  /* Answered by the source check itself; printed for the record. */
  settled: [
    {
      id: 'E11 (owner, 2026-10-06, A6, B13)',
      note: '"each pharmacy is already enrolled [with its province\'s drug plan]". FAQ 1 now says "Our pharmacy in your province bills your provincial drug plan directly for what it covers, except in Quebec, where orders are paid for privately. Other programs each pay their own way: where one pays you back, we can give you an invoice for your claim." (FR to match), and the money door (`doors.items.5.body`) adds "and how we bill your provincial drug plan". The plans are listed on the Funding page (`DIRECT_BILLING`); no federal program or private insurer is named as billed directly.',
    },
    {
      id: 'D1',
      note: 'Type 1 share: "5 to 10%" is confirmed against Diabetes Canada and matches Chapter 01.',
    },
    {
      id: 'D13 (part 3)',
      note: 'The `dc-technology-and-devices` backup line (FAQ 3) was re-read and matches.',
    },
    {
      id: 'D2 (owner, 2026-10-06, B12)',
      note: '"chat can be general - speak to a CDE." The chat panel is now "Speak to a CDE" (`care.chat`), with no "Available in Ontario" label: the CDE contact of Bayshore Express Pharmacy (phone, email, Monday to Friday 9 a.m. to 5 p.m. Eastern except holidays, About page), then the existing chat button. Since owner note 5 (2026-10-07) it is the contact of Liivv’s Certified Diabetes Educators: phone and hours only ("By phone or chat").',
    },
    {
      id: 'D4 (owner, 2026-10-06, A8, B3, B11)',
      note: '"the pharmacist reviews all insulin and glucagon orders - we ship coldchain - insulin is not available for purchase online for Quebec but can be shipped - pharmacist can contact customer first"; "Insulin cant be advertised to Quebec". `insulinReviewConfirmed` is on: FAQ 5 renders in English with the notice "A pharmacist reviews and dispenses every insulin and glucagon order. Shipped cold-chain in plain packaging. Insulin can’t be ordered online for delivery in Quebec.", and insulin and glucagon have their own shelf room with `shop.reviewNotice`. On /fr neither renders (FR_HELD_COPY in landing-meta.ts, and the shelf filter in page.tsx). Remote-sale rules for Schedule II products were not answered and are not claimed.',
    },
    {
      id: 'D6 (owner, 2026-10-06, A3, B16)',
      note: 'Permission to use every current maker logo; pods are stocked. Since owner notes 9 and 10 (2026-10-07; built 2026-10-08) the row has one pill per shopping brand, matching the Diabetes Essentials shop’s brand filter, each a link to the shop filtered to it and shown only while that brand has products on the shelf: Dexcom, FreeStyle Libre, Omnipod, MiniMed, Tandem, mylife, OneTouch, Contour, Accu-Chek, FreeStyle. Logos from the six official files the owner approved (Omnipod trimmed, MiniMed, Tandem, OneTouch, Contour; docs/diabetes-content/logo-sources.md); the rest are names in matching pills. Abbott’s corporate mark, the old Insulet and Ypsomed files and the mislabelled `dexcom.avif` are no longer shown. "Ypsomed" became "mylife", confirmed on mylife Diabetes Care Canada’s "About us" page (`mylife-about-ca`).',
    },
    {
      id: 'D7 (owner, 2026-10-06, A1, B11)',
      note: '"We can support all of Canada with the pharmacies that we have - including Quebec - except for insulin in Quebec." Trust item 2 now says Liivv pharmacies serve all of Canada, Quebec and the territories included; FAQ 1 adds that insulin can’t be ordered online for delivery in Quebec.',
    },
    {
      id: 'D8 (owner, 2026-10-06, B10)',
      note: '"they can take all sorts of questions and get answer internally." FAQ 1 ends "or ask Liivv’s Certified Diabetes Educators" (owner note 5, 2026-10-07; it named Bayshore Express Pharmacy until then), plain text, as their contact is in the care band below.',
    },
    {
      id: 'D9 (owner, 2026-10-06, B14)',
      note: '"We have the online dashboard account features." FAQ 1’s prescription sentence is released: send it from the account’s Pharmacy page (linked, /fr prefix on /fr), Add prescription, by transfer or doctor fax. The account pages are English only, and the French says so.',
    },
    {
      id: 'D17 (owner, 2026-10-06, B18, B29)',
      note: '"Everything can be subscribed"; plain packaging confirmed. The subscribe band says anything ordered here can be a subscription, and its third feature is Ostomy’s "Plain packaging. Quiet checkout."',
    },
    {
      id: 'D19 (owner, 2026-10-06, A2, B5, B12)',
      note: 'The CDEs are at Bayshore Express Pharmacy in Ontario and support customers across Canada; the pharmacies in other provinces and territories dispense, and Bayshore Express Pharmacy transfers to them. Trust item 1, the care band, FAQ 3 and the meta description name Bayshore Express Pharmacy’s Certified Diabetes Educators, with no limit by province. "Many HCPs can be CDEs", so the copy says CDE, not pharmacist CDE (the "Ask a pharmacist CDE" chip stays, ruling C33). Owner note 5 (2026-10-07): the service is presented as Liivv’s, so those lines now say "Liivv’s Certified Diabetes Educators" and no customer-facing line names the pharmacy (the governance line "part of the Bayshore family" stays, the owner’s own wording).',
    },
    {
      id: 'D20',
      note: 'Funding page handoff (P1, P2), built 2026-10-06: the Funding page cites the provinces’ own pages, carries BC Plan NP (medications from 2026-03-01; devices and supplies from 2026-04-01) and the MB, PEI and YT agreements, and dates Diabetes Canada’s comparisons to 2024 wherever it points to them (08-funding.md).',
    },
  ],

  openQuestions: [
    {
      id: 'D3',
      who: 'Owner and engineering',
      question:
        '"Request a call" stays off (`cdeRequestReason` in landing-meta.ts): the appointment form saves nothing and offers no CDE reason, and a guest who signs in from it lands on the dashboard. The owner suggested Microsoft Bookings (B6, 2026-10-06); Bayshore Express Pharmacy’s own booking page is another option. Either could switch the button on once it can take the request. Meanwhile the care band shows the CDEs’ phone line and hours (answered, B9; phone and hours only since owner note 5, 2026-10-07).',
      where: ['care.cde.cta', 'care.cde.ctaNote'],
    },
    {
      id: 'D5',
      who: 'Privacy lead',
      question:
        'Sign off FAQ 2’s wording. List the `liivv-care-nav` session cookie (value `diabetes`) in the cookie notice. Say whether FAQ 2 should link to the privacy policy, and give its address.',
      where: ['faq.items.2.a'],
    },
    {
      id: 'D10',
      who: 'Owner',
      question:
        'Commercial disclosure: does any manufacturer pay Liivv for listing, placement or marketing? If one does, the brands strip needs a disclosure line (E7). The relationship line is answered (B15, 2026-10-06) and in the governance block: "Liivv is a HelioMed company and part of the Bayshore family." (`governance.relationship`)',
      where: ['governance.brandsNote'],
    },
    {
      id: 'D12',
      who: 'Owner',
      question:
        'Chip targets: Know Your Type cards (as built), or the generated path pages (all five are live since 2026-10-06, including `less-common-types`)? As built, "Other" opens card 6, which duplicates the "Is my type right?" door. Acceptable?',
      where: ['types.chips.other', 'doors.items.4.label'],
    },
    {
      id: 'D14',
      who: 'Owner',
      question:
        'Launch order. Doors 1, 3, 4 and 6 and the LADA and MODY chips need their chapters on the engine (they are, today), and the money door the Funding page, which exists since 2026-10-06 (`fundingPage` is on). Ship the landing last, or ship with the gated doors and chips hidden? The money door’s body said "and how to claim", a claim route the Funding page deliberately never promises (funding D-1, verify P1); since the full-site review of 2026-10-06 it says "and how each one pays" (FR "et comment chacun paie"), and FAQ 1 uses the Funding page’s how-paying-works wording. Confirm both.',
      where: ['doors.items.5.label', 'doors.items.5.body'],
    },
    {
      id: 'D15',
      who: 'Owner',
      question:
        '"Ad tracking off on these pages": keep it as a trust claim once it is true, or move it to FAQ 2 only?',
      where: ['trust.items.4'],
    },
    {
      id: 'D16',
      who: 'Engineering',
      question:
        'The shelf’s rooms are read from product names (diabetes-care/shop-classify.ts). Do server-side rooms come before launch? The name rules now put FreeStyle meters, strips and lancets under meters and only FreeStyle Libre under sensors.',
      where: ['shop.rooms.sensors'],
    },
    {
      id: 'D18',
      who: 'Owner and nurse',
      question:
        'The names, registrations and review date for the governance block. Until then the page carries no byline and no review line.',
      where: [],
    },
    {
      id: 'D21',
      who: 'Content',
      question:
        'Cross-page consistency: Chapter 03 still says Diabetes Canada compares coverage "side by side" with no date caveat; Chapter 01 `11.items.1` cites `cdecb-find-a-cde` for "Certified Diabetes Educators (CDE®)", which that page does not spell out (needs the same source as E13); Know Your Type keeps "Your team decides your type" without the landing’s "hard to tell at first" clause.',
      where: [],
    },
    {
      id: 'D22',
      who: 'Owner',
      question:
        'Kits (E14): confirm in writing that a nurse checks every kit before it is listed. The sentence stays out until then; the kits section is hidden anyway, as no kit is listed.',
      where: ['kits.body'],
    },
    {
      id: 'D23',
      who: 'Register keeper',
      question:
        '`napra-nds-insulin` is registered (fetched and confirmed 2026-10-05). `cdecb-home` is not: the copy record gives no title for it ("the home page title as printed, to record on registration"), so it waits until the title is recorded from the page. The F4 locator fixes are applied.',
      where: [],
    },
  ],

  /* Wording that is not in the message files at all. */
  heldItems: [
    {
      id: 'E1',
      item: 'Sensor makers’ replacement and support lines',
      where: 'FAQ 3, after "where you can reach them"',
      wording:
        '"Your sensor maker runs a support line for a sensor that fails or comes off early. The number is in your device’s guide." Numbers only with R16.',
      releases:
        'Ruling R16 (industry pages as sole source), or a non-industry Canadian source. None identified.',
    },
    {
      id: 'E6',
      item: 'The kit walkthrough’s tray and search lines (the kit carousel itself is live: the owner verified all twelve kits on 2026-10-07, and they are listed)',
      where: 'Kits section',
      wording: 'Written from an approved kit’s actual contents.',
      releases:
        'The owner picks the kit the walkthrough shows (all twelve, 8049–8060, are verified and in DIABETES_LISTED_KIT_IDS).',
    },
    {
      id: 'E7',
      item: 'Any manufacturer payment line',
      where: 'Governance block',
      wording: '"[Brand] pays Liivv for …"',
      releases: 'D10. The relationship line itself was released on 2026-10-06 (B15).',
    },
    {
      id: 'E8',
      item: 'Trust item 4 and FAQ 2 (the ad-signal claims)',
      where: 'Trust strip, FAQ 2 — in the message files, kept off the page by `adSignalsShipped`',
      wording: 'As printed under trust item 4 and FAQ 2 above.',
      releases:
        '`ad-signals.ts` and `sensitive-products.ts` are committed and deployed, and the preview checks pass (consent denial before page_view on Diabetes pages, category 1151 products, /compare, wish lists); D5 signed off.',
    },
    {
      id: 'E10',
      item: 'Pay-later for pump supplies',
      where: 'Care band or FAQ 1',
      wording: 'None.',
      releases:
        'Approved 2026-10-06 (A5, "Liivv Now, Pay Later"), and shown on the Funding page and its pump program cards only. A landing line needs the owner’s go-ahead.',
    },
    {
      id: 'E12',
      item: 'Reviewed French',
      where: 'Every line',
      wording: '—',
      releases:
        'The `landing` and `doors` French review gates (review-gates.ts). Until then the French ships flagged as machine translated, and on /fr in production the doors show only the emergency route.',
    },
    {
      id: 'E13',
      item: 'What CDE stands for',
      where: 'Care band (`care.cde.cdeMeaning`)',
      wording: '"CDE® stands for Certified Diabetes Educator."',
      releases: '`cdecb-home` is registered (D23).',
    },
    {
      id: 'E14',
      item: 'Nurse check on kits',
      where: 'Kits body',
      wording: '"Each kit is checked by a nurse before it’s listed."',
      releases: 'The owner confirms (D22) and a kit is listed.',
    },
  ],
};
