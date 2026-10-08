/**
 * Reviewer-only data for the Diabetes Care Funding & Coverage page, read by
 * the Diabetes Care pass of the content-review export (./diabetes-care.mjs).
 *
 * From the page's copy record (docs/diabetes-content/funding.md), brought up
 * to date on 2026-10-06 with the owner's answers (A5, A6, B7, B13, B20, B22,
 * B23, B25) and the official pages re-fetched that day: its open questions
 * for the owner, the nurse, operations and engineering (section D), the
 * wording it still holds back for want of a registered source (section E),
 * and the sources still proposed for the register (section F). None of it
 * renders on any page.
 *
 * The held wording is in no message file. A held program has no row in
 * diabetes-care/funding/funding-meta.ts either (HELD_PROGRAM_IDS names it),
 * so its group shows the "we're still checking" card until its source is
 * registered and the row is added.
 *
 * `where` is message paths from the root of the DiabetesCare tree, checked
 * against en.json, so a question cannot keep pointing at a line that has gone.
 * When a question is answered, the copy changes (or stays) and the entry moves
 * to `settled`. D numbers are the copy record's own, so cross-references hold.
 */

export const FUNDING = {
  /* Answered, by the source check, by building the page or by the owner; printed for the record. */
  settled: [
    {
      id: 'D-1 (owner, 2026-10-06, A6, B13)',
      note: '"each pharmacy is already enrolled [with its province\'s drug plan]"; "We support all provincial pump programs". The Liivv pharmacy in each province bills that province\'s drug plan directly: `DIRECT_BILLING` lists the nine plans (BC, AB, SK, MB, ON, NB, NS, PE, NL) by their official names, linked to the page that names each. Quebec is not on it (its public plan does not cover drugs bought outside Quebec, `qc-stays-outside-quebec`), and no federal program, territorial plan or private insurer is, because none is confirmed. Other programs: "ask us for an invoice for your claim" (finance team sends the invoice; B13 "Yes [Liivv receipts meet program rules]"), with no promise that a claim is accepted.',
    },
    {
      id: 'D-3 (owner, 2026-10-06, B13)',
      note: '"Yes [Liivv receipts meet program rules]; … finance team sends the invoice". The page now offers an invoice for a claim (`claimCheck`, `askUsBody`, `quebecBody`, `territoryBody`, `whereBody`) and still promises no claim will be accepted.',
    },
    {
      id: 'D-5 (owner, 2026-10-06, B10, B9, B6)',
      note: '"they can take all sorts of questions and get answer internally": the CDEs at Bayshore Express Pharmacy take claim and coverage questions too, and the CDE band and "Ask a CDE" (`enough3Body`) say so. The band shows the CDEs’ general phone line and hours (no email since owner note 5, 2026-10-07, which presents the service as Liivv’s); "Request a call" stays off until a booking page can take the request (B6). The same contact sits under "Liivv Now, Pay Later" (B10: they route questions internally).',
    },
    {
      id: 'D-6',
      note: "Monitoring for Health amounts: on `on-preventing-and-living-with-diabetes` (verify row 40), and in `on-mfhp.covered`. Since 2026-10-06 that government page is the row's first source (B36).",
    },
    {
      id: 'D-7 (2026-10-06, F-31)',
      note: '`vac-cgm-type-1` re-points to the base grid (Alberta, modified 2026-03-19); the Northwest Territories note is gone and the row is no longer partly confirmed (E-23 released).',
    },
    {
      id: 'D-8 (2026-10-06, F-2)',
      note: 'Dexcom G7 on ODB: July 31, 2025, from the Executive Officer notice, which is printed July 24, 2025 (its file name says 07-23). `on-odb-cgm` is live (E-1 released).',
    },
    {
      id: 'D-9 (owner, 2026-10-06, B25)',
      note: "\"Official french names from govt websites\". Filled from each government's own French page: ADP (PAAF), ODB (PMO), Monitoring for Health, MAIPCP, MEPP, the NB pump program, NLPDP, NIHB (SSNA), Yukon's National Pharmacare and chronic disease programs, NWT Extended Health Benefits, the DTC (CIPH), the RDSP (REEI), the Pharmacare Act, and the Saskatchewan, Manitoba, New Brunswick and NL drug plans. None is published by BC, Alberta, Nova Scotia or Saskatchewan's pump program; PEI's only French name is in a translated patient handout, not a program page, so it stays empty.",
    },
    {
      id: 'D-10 (owner, 2026-10-06, B22)',
      note: "Program phone numbers are on every card whose official page prints one (`phones` in funding-meta.ts), each dialled as a tel: link, with in-province-only toll-free lines labelled as such. Only numbers re-checked on 2026-10-06 are used: the NIHB client line (not the provider line), MB 204-786-7365/7366 and 1-800-297-8099 ext 7365 or 7366. The NL pump program's 2021 numbers predate NL Health Services and are left out.",
    },
    {
      id: 'D-11 (owner, 2026-10-06, B25)',
      note: 'Alberta\'s pump program (type 1 or type 3c) is on the page, so the "other" type option now reads "Another type (such as LADA or type 3c), or not sure", and `ab-iptp` takes that answer.',
    },
    {
      id: 'D-14 (owner, 2026-10-06, B23)',
      note: "Brand names may appear in coverage copy where a program lists them (the BC pump row's Tandem supply names, the pump and sensor lists of AB, MB, PEI, ON and Quebec).",
    },
    {
      id: 'D-15 (owner, 2026-10-06, B20)',
      note: '"Claude sets a schedule to recheck funding facts". `NEXT_CHECK` is 2026-11-01 and `RECHECK_OWNER` reads "Monthly automated recheck (scheduled), reviewed by the Liivv content owner". The recheck is core/scripts/check-funding-sources.mjs (docs/diabetes-content/README.md): it fetches every page the Funding page cites, compares it with core/scripts/data/funding-sources-baseline.json and looks for each row\'s recheck phrases.',
    },
    {
      id: 'D-16 (owner, 2026-10-06, B24)',
      note: '"Up to you": "Your provincial or territorial drug plan still applies" is kept.',
    },
    {
      id: 'D-17',
      note: 'Ad signals and sitemap (built 2026-10-06): the Diabetes Care layout denies the advertising signals for everything under /liivv-health/diabetes-care, this page included, and the page is in the Liivv Health sitemap in English. Its /fr URL joins once the owner opens the `funding` French review gate.',
    },
    {
      id: 'D-18 (owner, 2026-10-06, B2)',
      note: '"leave NIHB eligibility to what is available online - We would not be able to decide eligibility". `fed-nihb` links the NIHB pharmacy-benefits page, which describes and links the Drug Benefit List, and says Liivv can\'t decide eligibility; the payer-of-last-resort and pharmacy-billing facts are released (E-15, E-22). No criteria are stated.',
    },
    {
      id: 'D-21 (2026-10-06, clinical direction: verified Canadian sources)',
      note: 'Monitoring for Health: ontario.ca (updated June 8, 2026) says seniors 65+, social assistance recipients and Trillium clients "can only submit to this program for lancets and/or a blood glucose meter"; it supersedes Diabetes Canada\'s "no age limit" line (2025–26 only). `on-mfhp.who` carries the government line, and the row is no longer partly confirmed. E-24\'s "24 or under" had no official source and is dropped.',
    },
    {
      id: 'D-22 (2026-10-06)',
      note: 'ADP\'s "We do not cover costs to replace a lost pump or supplies or to repair pumps or supplies damaged through misuse or neglect" is back in `on-adp-pump.notes`, in the page\'s own terms (the word "stolen" is not on the page).',
    },
    {
      id: 'D-24 (2026-10-06, launch blocker cleared)',
      note: '`on-odb-cgm` (F-2, F-3): Dexcom G7 since July 31, 2025 (45 sensors a year) and FreeStyle Libre 3 Plus since November 28, 2025 (31 a year), for ODB recipients on insulin with a prescription from a physician or nurse practitioner.',
    },
    {
      id: 'D-25 (2026-10-06, launch blocker cleared)',
      note: "Alberta joins `PRIVATE_FIRST` (F-10 and alberta.ca Non-Group Coverage): since October 1, 2026, Alberta's government-sponsored programs pay only after private or workplace coverage. PEI joins too (its pump program deducts private insurance first).",
    },
  ],

  /*
   * How the page was built from the record, where the build had to choose.
   * Reviewer-only; each is a place to look if the page and the record differ.
   */
  buildNotes: [
    'The urgent signpost uses This Might Be You’s approved pair ("Signs that need emergency care are in Staying Safe, under … Get emergency care now"), as the landing does. The record named Staying Safe’s own pair, which says "at the top of this page" and would be untrue here.',
    'The focus and vibe notes: the vibe note renders without a label. "The Liivv Vibe" is Ostomy’s word, and Diabetes Care has no label for it.',
    'The checker rules a program out for a type it does not take before it looks at therapy. The record’s sketch (A.5) checked therapy first, which showed type 1 pump programs to a type 2 reader on injections as "If you’re thinking about a pump".',
    '"Request a call" (the CDE band and the "Can we bill your program for you?" card) renders only once the appointment page can take the request (`cdeRequestReason` in landing-meta.ts, landing D3; B6), as on the landing. Since 2026-10-06 the CDE band shows the CDE contact in its place: since owner note 5 (2026-10-07), the phone and hours of Liivv’s Certified Diabetes Educators.',
    '`funding.liivv.pharmacies` renders nowhere today: "Ordering from Quebec or the territories" (`whereBody`) opens with the same sentence (owner answers A1 and B11, 2026-10-06). It is kept for the checker’s Liivv cards if the owner wants it there.',
    '`funding.liivv.quebecBody` says the Insulin Pump Access Program takes receipts "as shown below". Its card is below only when the reader’s answers leave it in (type 1 or not sure, and a pump or insulin injections).',
    'On /fr while the `fundingChecker` gate is closed, the section shows each province and territory with its programs by their legal names, each linked to its official page with the date it was checked and its phone numbers, and the "still checking" line for a province with none. No question is asked there, so `toolIntro` and the pump group\'s intro are left off.',
    'Owner answer A6 ("We support all provincial pump programs"): in a province, the pump group in the checker opens with `ui.fundingResults.pumpIntro` (each program decides where its supplies come from and how it pays; check its rules before ordering), then `pumpPayLater`, which says once that Liivv Now, Pay Later is Liivv\'s own way to pay, separate from any program (A5). No program card mentions pay-later (full-site review, 2026-10-06: New Brunswick\'s program supplies only through its vendors, PEI\'s co-pay goes to the pump company, and Alberta\'s pays nothing back for supplies bought privately). In the territories the pump group has no intro: their routes are not provincial programs.',
    "Phone numbers (B22) render under a program's words on its card, in its federal row and in the /fr plain list, as tel: links (+1 and the ten digits; an extension is printed, and the first one is dialled after a pause, as a comma in the tel: link, since 2026-10-06). An office name is the program's own proper noun, in French only where the government prints one. The engine card part gained an optional `phones` list and a group `intro` line (_microsite/funding/checker-parts.tsx, a Diabetes-first addition to the Ostomy twin).",
    'The Yukon pump card (`yt-pump`) is partly confirmed: the National Pharmacare page states pump access and the 5-year cycle, but not who pays, how much, or how to apply (verify item 6). yukon.ca refuses plain requests, so the scheduled recheck reports its pages as blocked; they were read in a browser on 2026-10-06.',
    "The PEI pump card cites the program's questions and answers (PDF, 2026-05-06): the program's web page answers with a CAPTCHA, which nothing here tries to get past.",
    'No products on this page. The pump-supplies strip that sat between "How paying works" and the checker (#pump-supplies, B21) was removed by the owner on 2026-10-07 (note 7), which closes D-13; the page makes no catalogue request. The same strip, "Pump supplies, by pump.", stays on Your Tools card 13.',
    "Quebec sensors (`qc-cgm`) rest on INESSS's records of the minister's decisions (RAMQ's own pages refuse requests), so the card stays partly confirmed. Corrected per the verifier: the February 4, 2026 change defines intensive insulin therapy for every CGM; it did not open coverage to type 2 in general.",
  ],

  openQuestions: [
    {
      id: 'D-2',
      who: 'Owner',
      question:
        'Order routing: the page says "Our pharmacy in your province bills your provincial drug plan directly" (B13). It does not say which pharmacy fills an order from Quebec or a territory; the CDE hand-off line ("they pass you to the Liivv pharmacy in your province") is the owner’s fact. Confirm both.',
      where: ['ui.fundingPage.directBody', 'ui.fundingPage.cdeBody'],
    },
    {
      id: 'D-4',
      who: 'Owner',
      question:
        'Ontario’s $170 syringes-and-needles grant says the business "does not have to be registered" with ADP, and the copy says "any retailer in Ontario". Does a Liivv online order count? The owner did not know (B13, 2026-10-06), so the copy stays silent on it.',
      where: ['funding.programs.on-adp-seniors.howToApply'],
    },
    {
      id: 'D-12',
      who: 'Content',
      question:
        'Locators still to extend in sources-review.ts (facts checked live that the locator does not record yet): `dc-ontario-monitoring-for-health` (mail-in with original receipts; "no other coverage"; about 8 weeks; remove the amounts); `mb-pharmacare-mepp` (prescription needed; MAIPCP "no cost coverage"); `bc-diabetes-pins` (approved vendors; Special Authority for every CGM); `isc-nihb-updates` ("clients managing diabetes with insulin"; Guardian 4 limited use). The rows re-read on 2026-10-06 are recorded.',
      where: [],
    },
    {
      id: 'D-19',
      who: 'Content',
      question:
        'The Quebec Insulin Pump Access Program page was last updated in 2021 (re-read 2026-10-06; its French page now names "Santé Québec – CHU de Québec – Université Laval"). Is there a newer RAMQ or MSSS page? Until one is found, `confirm: true` stays. The monthly recheck watches it.',
      where: ['funding.programs.qc-pump.notes'],
    },
    {
      id: 'D-20',
      who: 'Owner or researcher',
      question:
        "Newfoundland and Labrador: no program page for the pump or CGM programs (their old pages lead to NL Health Services' home page, whose Diabetes Care page is still being built). The pump card rests on a 2021 release and the CGM card on a 2025 release; both stay partly confirmed. Find the programs' own pages; the 2025 releases give NLCGMP@nlhealthservices.ca as the contact.",
      where: ['funding.programs.nl-cgm.who', 'funding.programs.nl-pump.notes'],
    },
    {
      id: 'D-23',
      who: 'Engineering',
      question:
        'Checker privacy line: confirm that no analytics, session replay or event capture records the checker’s inputs (health, and Indigenous and veteran status). The checker code keeps its answers in its own state and sends nothing, but every tag on the page has to be checked. Until then the privacy promise is held (E-26) and `toolIntro` makes none. Still open after the owner’s answers (B4).',
      where: ['ui.fundingPage.toolIntro'],
    },
    {
      id: 'D-26',
      who: 'Owner (and counsel)',
      question:
        '"Liivv Now, Pay Later" (A5) mirrors the owner\'s program terms: three paid orders first, a $1.00 card authorization, payment within 45 days of receiving an order or with the next order, no credit check, three retries on a declined card then 3 business days, no prepaid cards, pod orders billed every 90 days. Confirm the terms, and that the $1.00 authorization and the name have been cleared (the research flagged consumer-credit disclosure rules in Ontario, BC and Quebec). The checkout has no pay-later path yet: customer service handles it.',
      where: ['ui.fundingPage.payLaterTerms.2', 'ui.fundingPage.payLaterBody'],
    },
    {
      id: 'D-27',
      who: 'Owner',
      question:
        'The Ontario Drug Benefit co-pay line (B13: the owner did not know). The ODB sensor notice says claims are paid "less any applicable co-payment"; the page does not mention a co-pay. Release a co-pay line, or keep it out?',
      where: ['funding.programs.on-odb-cgm.howToApply'],
    },
  ],

  heldItems: [
    {
      id: 'E-2',
      item: 'Ontario ODB strips: who may prescribe',
      wording:
        '"Test strips need a prescription from an Ontario doctor or nurse practitioner. A pharmacist’s prescription doesn’t count."',
      why: 'Unregistered (ODP manual)',
      releases: 'F-1',
    },
    {
      id: 'E-7',
      item: '`sk-cgm` (Saskatchewan, sensors)',
      wording:
        '"Dexcom G6 and G7, FreeStyle Libre 2 and Guardian sensors are covered through the Drug Plan for people under 18, and since April 1, 2025, for people 18 to 25 and 65 and over who use insulin."',
      why: 'Bulletin 252 not re-read; the April 1, 2025 release was read by the research but not registered',
      releases: 'F-12',
    },
    {
      id: 'E-10b',
      item: '`pe-gsp` (PEI Glucose Sensor Program)',
      wording: 'Glucose Sensor Program co-pay at the pharmacy',
      why: 'The program page is behind a CAPTCHA; the renewal form was not re-read',
      releases: 'F-20 (re-read)',
    },
    {
      id: 'E-16',
      item: 'Manitoba sensors by receipt (How paying works)',
      wording:
        '"In Manitoba, you can buy a glucose sensor straight from a supplier and send the original receipt with your Manitoba Health number within 6 months. It counts toward your deductible."',
      why: 'faq_agm.pdf unregistered (and dated 2023); it also refers to a prescription, which Shared Health says is not needed — for the nurse',
      releases: 'F-13',
    },
    {
      id: 'E-17',
      item: 'NIHB pumps (medical supplies and equipment)',
      wording: '"Pumps and pump supplies are a separate NIHB benefit with prior approval."',
      why: 'The MS&E guide names no insulin item; pump coverage sits on the Drug Benefit List, which is not readable as a page',
      releases: 'A readable Drug Benefit List entry',
    },
    {
      id: 'E-19',
      item: '`nu-ehb`',
      wording: 'Nunavut Extended Health Benefits card',
      why: 'The eligibility groups and phone are readable now, but whether diabetes is a specified condition is not',
      releases: 'A readable gov.nu.ca list of specified conditions',
    },
    {
      id: 'E-21',
      item: 'Manufacturer insurance helplines (When it isn’t enough)',
      wording: '—',
      why: 'Industry-only (policy 4)',
      releases: 'A non-industry source',
    },
    {
      id: 'E-25',
      item: '`nl-cgm` gestational diabetes',
      wording:
        '"If you’re pregnant and have gestational diabetes, the program may cover a glucose sensor while you need one, without an income test. You need to be a permanent resident with a valid MCP card, and your care team has to confirm you need it." Add \'gestational\' to `nl-cgm.appliesTo.types`',
      why: 'Not on `nl-cgm-program-2025`',
      releases: 'F-33',
    },
    {
      id: 'E-26',
      item: '`ui.fundingPage.toolIntro` privacy promise',
      wording: '"Nothing you enter is saved or sent anywhere. This runs entirely in your browser."',
      why: 'A technical promise covering health, Indigenous and veteran status; engineering hasn’t confirmed that no analytics or event capture records the inputs (verify P3; B4 still open)',
      releases: 'Engineering sign-off (D-23)',
    },
  ],

  /*
   * Proposed register entries (section F) still to register. Each needs its
   * printed title recorded and a saved copy before it is registered; registering
   * one is what releases the held wording that names it. Registered on
   * 2026-10-06: F-2, F-3, F-6, F-8, F-10, F-14, F-16, F-18, F-21, F-27, F-28,
   * F-31 and F-32, with newer pages in place of F-11 (Alberta's CGM fact
   * sheet), F-19 (Health PEI's residents' Q&A), F-24 (NIHB's client page on
   * pharmacy benefits), F-26 (RC4065) and F-30 (INESSS).
   */
  proposedSources: [
    {
      id: 'F-1',
      source: 'on-odp-reference-manual-2026',
      url: 'https://www.ontario.ca/files/moh-odp-reference-manual-en.pdf',
      backs:
        'Strips need an Ontario physician or NP prescription; CGM claims need an insulin claim in the last 180 days',
    },
    {
      id: 'F-4',
      source: 'on-ohip-plus',
      url: 'https://www.ontario.ca/page/learn-about-ohip-plus',
      backs: '24 and under; no private plan; filled at any pharmacy in Ontario',
    },
    {
      id: 'F-5',
      source: 'on-adp-pump-manual-2025',
      url: 'https://www.ontario.ca/files/2025-11/moh-adp-policy-and-administration-manual-insulin-pump-2025-11-18.pdf',
      backs:
        'Supplies from any retailer; four equal payments to the applicant; 100% of the Approved Price',
    },
    {
      id: 'F-7',
      source: 'abc-iptp-reference-guide',
      url: 'https://www.ab.bluecross.ca/pdfs/IPTP-reference-guide.pdf',
      backs: 'Pumps and supplies on a direct-bill basis from approved manufacturers or vendors',
    },
    {
      id: 'F-12',
      source: 'sk-formulary-bulletin-252',
      url: 'https://formulary.drugplan.ehealthsask.ca/Bulletins/Bulletin-0252-Mar-2025.pdf',
      backs: 'Advanced glucose monitoring from 2025-04-01; ages 18–25 and 65+ on insulin',
    },
    {
      id: 'F-13',
      source: 'mb-faq-agm',
      url: 'https://www.gov.mb.ca/health/pharmacare/profdocs/faq_agm.pdf',
      backs:
        'Buy direct from a supplier; original receipts and MHN within six months (dated 2023: confirm it is current)',
    },
    {
      id: 'F-15',
      source: 'bc-pharmacare-policy-5-18',
      url: '(record the exact page in the BC PharmaCare Policy Manual)',
      backs: 'Only providers may submit claims for insulin pump supplies (backs D-1 only)',
    },
    {
      id: 'F-17',
      source: 'ns-pharmacare-pharmacy-guide-2026',
      url: 'https://novascotia.ca/dhw/pharmacare/documents/Pharmacy-Guide.pdf',
      backs: 'Payer of last resort; does not pay for prescriptions filled outside Nova Scotia',
    },
    {
      id: 'F-20',
      source: 'pe-glucose-sensor-renewal-form',
      url: 'https://www.princeedwardisland.ca/sites/default/files/publications/glucose_sensor_program_renewal_form.pdf',
      backs: 'Income-based co-pay at the pharmacy (re-read eligibility)',
    },
    {
      id: 'F-22',
      source: 'nl-covered-out-of-province',
      url: 'https://www.gov.nl.ca/hcs/prescription/covered-outofprovince/',
      backs: 'Out-of-province coverage only when referred out for treatment',
    },
    {
      id: 'F-23',
      source: 'hc-pharmacare-agreement-yukon',
      url: 'https://www.canada.ca/en/health-canada/corporate/transparency/health-agreements/national-pharmacare-bilateral-agreements/yukon.html',
      backs:
        'Stream 2: increase access to insulin pumps and advanced glucose monitors by expanding eligibility (not universal first-dollar coverage: verify item 6)',
    },
    {
      id: 'F-25',
      source: 'isc-nihb-mse',
      url: 'https://www.sac-isc.gc.ca/eng/1579620079031/1579620259238',
      backs: 'Enrolled providers paid directly; clients who pay up front can request reimbursement',
    },
    {
      id: 'F-29',
      source: 'abc-nwt-pharmacy-guide-2026',
      url: 'https://www.ab.bluecross.ca/pdfs/82477-nwt-abc-pharmacy-reference-guide.pdf',
      backs: 'PINs for pumps, sets, sensors, strips and pen needles (backs D-1 only)',
    },
    {
      id: 'F-33',
      source: 'nl-cgm-gdm-2025',
      url: 'https://www.gov.nl.ca/releases/2025/health/0724n01/',
      backs:
        'CGM for gestational diabetes, no income test (a news release; look for the program page, D-20); releases E-25',
    },
  ],
};
