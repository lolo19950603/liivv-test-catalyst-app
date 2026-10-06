/**
 * Reviewer-only data for Chapter 03 · Your Tools, read by the Diabetes Care
 * pass of the content-review export (./diabetes-care.mjs).
 *
 * From the chapter's copy record after the source check of 2026-10-05: its open
 * rulings (section D), the factual checks still to make before it is published,
 * and the wording it holds back (section E). None of it renders on any page and
 * none of it is in the message files. ./diabetes-care.mjs says what each list
 * is for and checks every `where` path and card number against the chapter.
 *
 * Staying Safe's defaults, once carried here, and R17–R24 were ruled on
 * 2026-10-06; R25 was answered by the owner the same day (B5: the CDEs at
 * Bayshore Express Pharmacy support customers across Canada). R16 is still
 * open. When the nurse or the owner rules on one, the copy changes (or stays)
 * and the entry comes out.
 */

export const YOUR_TOOLS = {
  openRulings: [
    /* New for this chapter (D.2). */
    {
      id: 'R16',
      default:
        '**URGENT (owner and nurse). Picker facts that rest only on makers’ pages.** Policy 4 says an industry page is never the only source, but wear times, pairings and box contents are mostly on makers’ pages. Default: the pickers show each fact with its basis line, its sources and the date checked. The bases after the source check and ruling C42 (2026-10-06): `twoMakers` (G7 and G6 with Omnipod 5; G6 with mylife Loop; G7 with the t:slim X2, still with Dexcom’s "not all connections are available in Canada"; the G6 → G7 notice), `government` (Guardian 4 with the 780G, from NIHB), `pumpMakerOnly` (Libre 3 Plus with mylife Loop; G6 with the t:slim X2, from Tandem’s Canadian user guide). No pairing is `sensorMakerOnly` now. Maker-only facts: the G7 and Libre 3 Plus wear times, the Libre 3 Plus recall notice, every fact line in the pump picker, and the held meter picker. Brand names appear only in the pickers and the calculator’s presets (`device-pairings.ts`).',
      where: [
        'categories.2.figure',
        'categories.4.figure',
        'categories.6.figure',
        'categories.13.figure',
      ],
      alternative:
        '(a) Show only `government` and `twoMakers` entries. (b) Also hold the `pumpMakerOnly` and `sensorMakerOnly` entries and every maker-only fact line (a `makerOnlyFacts` hold). (c) Hold all the pickers until a Canadian non-industry page (for example Health Canada’s Medical Devices Active Licence Listing, not registered) confirms each fact.',
    },
  ],

  prePublishChecks: [
    'Done by the source check: the four pages it could not read word for word at first were saved and re-read, and every claim on them is confirmed. Their facts, and the locator corrections the check listed (`dc-getting-started-with-insulin` names no 6 mm needle; `dexcom-g7-wear-time` says "up to 10 days" and nothing on restarts; `minimed-canada` no longer names Guardian 4; `dexcom-pumps-and-pens` names only G7 for the t:slim X2, with its Canada footnote), are now in `sources-review.ts`.',
    'Libre 3 Plus recall notice (the sensor picker, under Libre 3 Plus in the pump picker’s lists, and under its calculator preset; one notice in `device-pairings.ts`, marked `everywhere`): re-check Abbott’s Canadian site on publish day, and drop the notice from `device-pairings.ts` if it is gone.',
    'Dexcom’s "Pumps and pens" page is out of date on where Omnipod 5 is available (its footnote says Ontario and Nova Scotia only). Only its pairings are used; re-check them.',
    'Omnipod’s Canadian page mixes in blocks from other countries (a UK 0800 number, Libre 2 Plus). Re-check whether Insulet Canada now lists a Libre sensor for Canada.',
    'Tandem: re-confirm Control-IQ+ from age 2, "Dexcom CGM sold separately" and the four-year limited warranty, and that the Canadian user guide (`tandem-tslim-x2-ciq-user-guide-ca`, EN AW-1018762_B, FR AW-1019341_A) still names the Dexcom G6 and G7 (ruling C42). Tandem Mobi stays out until it is authorized in Canada.',
    'MiniMed: Simplera Sync is now headlined as licensed by Health Canada. If it goes on sale, and a second registered page confirms it with the 780G, add it to both pickers with its basis.',
  ],

  heldCopy: {
    released:
      'Released by the owner’s answers of 2026-10-06 (A2, B5, B9, B12): the CDE contact, the general phone line, email, hours and About page of Bayshore Express Pharmacy, in the CDE panel and the CDE lane (`ui.contact`).',
    items: [
      {
        topic: '"A 4 mm pen needle is safest, without a skin lift" (FIT’s framing)',
        cards: [7],
        why: 'FIT only (ruling C14: FIT-only lines stay held). Diabète Québec’s narrower "for adults, a skin lift may not be needed with 4 mm" is used instead',
        wording: '"For most adults, a 4 mm pen needle at 90° without a skin lift is enough"',
        check: 'A non-industry Canadian source; the CPG',
      },
      {
        topic: 'Skin and adhesives (a whole card)',
        cards: [],
        also: 'a card not in the chapter',
        why: 'No Canadian source for sensor or pump adhesive reactions or site infections. Product facts only (card 5’s shop strip shows sensor patches, with no claim)',
        wording:
          'Title "Skin and adhesives". "If the skin under your sensor or set gets red, itchy or sore, tell your team. Your device maker’s guide lists what to use under and over the adhesive"',
        check: 'Diabetes Canada; Breakthrough T1D; a Canadian dermatology or NSWOC source',
      },
      {
        topic: 'Your device maker’s 24/7 line (a whole card)',
        cards: [],
        also: 'a card not in the chapter',
        why: 'Manufacturer pages only (policy 4); Staying Safe holds the same lines',
        wording:
          '"Your pump or sensor maker runs a support line for device faults. The number is in your device’s guide." Numbers released with R16',
        check: 'The R16 ruling',
      },
      {
        topic: 'Meter picker data (the `meterMatch` figure, held as `meterData`)',
        cards: [2],
        why: 'No registered page says which strips go with which meter. Lancing fit is not stated (Ascensia names Microlet Next and Single-let Next without saying which meters they fit). No registered page for Accu-Chek or FreeStyle meters. Makers only (R16)',
        wording: 'Per family: "Strips: {name}. Lancets: {name}. Control solution: {name}"',
        check: 'Each maker’s Canadian strip-compatibility page; Health Canada MDALL',
      },
      {
        topic: 'G7 "can’t be restarted"',
        cards: [4],
        why: 'Not on `dexcom-g7-wear-time`, though its locator said so (corrected)',
        wording: '"It can’t be restarted"',
        check: 'A Dexcom Canada page or user guide that says it, and a non-industry cross-check',
      },
      {
        topic: 'Where else to check a recall',
        cards: [4],
        why: 'Health Canada Recalls and Safety Alerts is not registered',
        wording: '"…or search Health Canada’s Recalls and Safety Alerts"',
        check: 'Register recalls-rappels.canada.ca',
      },
      {
        topic: 'Sensor wear times: Libre 2, Dexcom G6, Guardian 4',
        cards: [4, 6],
        why: 'Not on any registered page',
        wording: '"Up to {n} days"',
        check: 'Makers’ pages, and a non-industry cross-check',
      },
      {
        topic: 'Sensor readers and apps',
        cards: [4],
        why: 'Not on any registered page',
        wording: '—',
        check: 'Makers’ pages',
      },
      {
        topic: 'Dexcom G7 15 Day',
        cards: [4, 6],
        why: 'Health Canada authorized it 2026-07-13 (Dexcom investor release, an industry source); not yet for sale in Canada (ruling C31)',
        wording:
          'When it is sold in Canada: a separate "G7 15 Day" sensor (15 days) in card 6’s calculator data and the sensor picker, still with no grace period',
        check:
          'Health Canada MDALL or the Canadian product labelling, and whether it is on sale (recheck schedule)',
      },
      {
        topic: 'MiniMed reservoirs per model; MiniMed set names',
        cards: [13],
        why: 'Not on a registered page (only the Extended set and Extended reservoir rule is)',
        wording: '—',
        check: 'MiniMed Canada product pages',
      },
      {
        topic: 'Tandem cartridge and sets (AutoSoft 90, AutoSoft 30, AutoSoft+)',
        cards: [13],
        why: 'Catalogue names, not on a registered page',
        wording: '—',
        check: 'Tandem Canada',
      },
      {
        topic: 'mylife Inset fit with the YpsoPump',
        cards: [13],
        why: 'The plan was to confirm fit before listing it',
        wording: '—',
        check: 'Ypsomed Canada',
      },
      {
        topic: 'Omnipod 5 and DASH pods are not interchangeable',
        cards: [13],
        why: 'Not on a registered page; the pump picker asks "Which pods fit this system" instead',
        wording:
          '"Omnipod 5 pods and DASH pods aren’t interchangeable: use the pods made for your system"',
        check: 'Insulet Canada',
      },
      {
        topic: 'Omnipod 5 with FreeStyle Libre',
        cards: [4, 13],
        why: 'Owner: Libre 2 Plus is not a Canadian product, and no Canadian source confirms Libre 3 Plus. Owner again, 2026-10-06 (A3): "Omnipod 5 Libre pairing is not yet in Canada"; in Canada Omnipod 5 pairs with Dexcom only',
        wording: '—',
        check: 'Insulet Canada; Abbott Canada',
      },
      {
        topic: 'Tandem Mobi',
        cards: [13],
        why: 'Not authorized in Canada as of January 2026 (search only)',
        wording: '—',
        check: 'Health Canada MDALL',
      },
      {
        topic: 'Simplera Sync',
        cards: [4, 13],
        why: 'Licensed; its sale date and 780G pairing are on maker and press pages only',
        wording: '—',
        check: 'MiniMed; a government program listing',
      },
      {
        topic: 'Infusion-set change timing; no set change at bedtime; set-change steps',
        cards: [14],
        why: 'FIT only',
        wording:
          '"Try not to change your infusion set just before bed, so you can check it’s working"',
        check: 'Diabetes Canada; Breakthrough T1D pump pages',
      },
      {
        topic: 'Lipohypertrophy: lower the dose when moving off a lump',
        cards: [10],
        why: 'FIT only, and it is dosing (out of scope)',
        wording: 'Not proposed. The card says "show it to your educator or your team"',
        check: '—',
      },
      {
        topic: 'A clean finger check, step by step',
        cards: [1, 2, 3],
        why: 'Diabetes Canada lists these as questions to ask, not steps. The card became "Your meter lesson" (a take-in card)',
        wording: '"Wash your hands in warm water and dry them. Prick the side of your fingertip…"',
        check: 'Diabetes Canada (other sheets); Diabète Québec',
      },
      {
        topic: 'Choosing a meter by features (big screen, app, talking meters)',
        cards: [1],
        why: 'Not on any registered non-industry page',
        wording: '—',
        check: 'Diabetes Canada; CNIB for low vision',
      },
      {
        topic: 'Ontario coverage specifics (ADP, Monitoring for Health, ODB strip tiers)',
        cards: [],
        also: 'the band',
        why: 'Province-only; it is on the Funding & Coverage page, which band card 4 now opens',
        wording: '—',
        check: 'None: stays on the Funding & Coverage page',
      },
      {
        topic: 'Sensor restock → Subscribe & save; kits',
        cards: [6],
        also: 'every card',
        why: 'Placements resumed (B21) and cards 1, 2, 4 to 9, 11, 13 and 14 carry shop strips (chapter-shop.ts). No strip claims Subscribe & save (whether a product offers it is on its own page), and no kit is listed until the owner verifies kits-for-review.md (A4)',
        wording: '—',
        check: 'Owner: a Subscribe & save line; kit sign-off',
      },
      {
        topic: 'FreeStyle Libre 3 (not Plus)',
        cards: [4],
        why: 'Only in NIHB and Ypsomed; left out to keep the picker to current Canadian models',
        wording: 'Add it if the owner wants it',
        check: '—',
      },
    ],
  },
};
