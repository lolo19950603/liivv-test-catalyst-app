/**
 * Reviewer-only data for Chapter 06 · This Might Be You, read by the Diabetes
 * Care pass of the content-review export (./diabetes-care.mjs).
 *
 * From the chapter's copy record after the source check of 2026-10-05: its open
 * rulings (section D), the factual checks still to make before it is published,
 * and the wording it holds back (section E). None of it renders on any page and
 * none of it is in the message files. ./diabetes-care.mjs says what each list
 * is for and checks every `where` path and card number against the chapter.
 *
 * The clinical rulings of 2026-10-06 settled Staying Safe's defaults carried
 * here and M1–M8 and M13–M15. The owner's answers of 2026-10-06 settled M10,
 * M11, M12 and M16 (B1: there is no Indigenous health partner to review card
 * 6; B2: "leave NIHB eligibility to what is available online - We would not be
 * able to decide eligibility"): card 6 now keeps only NIHB program facts, each
 * with its link, sends the reader to Indigenous Services Canada's eligibility
 * page, says Liivv can't decide eligibility, and carries no interpretive or
 * statistical content, so Ch38's lines and the Métis question are gone with
 * it. M9 is still open. When the nurse or the owner rules on one, the copy
 * changes (or stays) and the entry comes out.
 */

export const THIS_MIGHT_BE_YOU = {
  openRulings: [
    /* This chapter's own. */
    {
      id: 'M9',
      default:
        '**CPS 2015 school statement treated as current.** The downloaded page shows "Current" in its breadcrumb and no retired or reaffirmed notice, but the CPS statements index hasn’t been checked.',
      where: ['categories.3.items.3', 'categories.3.items.7', 'programsBand.cards.2'],
      alternative:
        'If retired: cite Diabetes Canada Kids in School and Diabetes@School only, and drop "at least two staff trained" (item 7 still stands on Diabetes@School).',
    },
  ],

  prePublishChecks: [
    'CPS 2015 school statement: confirm its status in the CPS statements index (M9).',
    'NIHB updates page: still dated 2026-07-30 or later, and the 800-strip limit unchanged, at publish.',
    'Quebec pump program page (last updated 2021-02-19): the before-18 rule was confirmed current on 2026-10-05; re-check quarterly with Funding & Coverage.',
    'CPG Ch36: confirm Diabetes Canada has not published an updated pregnancy chapter (M1, kept by ruling C23); card 1’s note says the guideline is from 2018 and being updated.',
    'PHAC folic acid page (`phac-folic-acid`, ruling C19): read 2026-10-06 (modified 2025-10-20); re-open it before publishing, as the ruling asks.',
    'Card 6: re-open Indigenous Services Canada’s eligibility page (`isc-nihb-eligibility`, modified 2026-05-28) and the NIHB updates page before publishing; the card links both.',
  ],

  heldCopy: {
    released:
      'Released after the source check, and now in the copy: NIHB children under 2 of an eligible parent (isc-nihb-updates); the severe-low school emergency step (das-glucagon, das-low-blood-sugar, CPS); lows more likely after the birth (Ch36); caregiver distress screening (Ch18). Released by the clinical rulings of 2026-10-06: when a child’s kidney and eye checks start (2.items.9, Ch29 2025 and Ch34; C37); the end-of-life line for older adults (4.items.3, Ch37; C19); a higher folic acid dose may be needed, with no amount (1.s1.3, Ch36 and PHAC; C19). Released by the owner’s answers of 2026-10-06 (A2, B5, B9, B12): the CDE contact, the general phone line, email, hours and About page of Bayshore Express Pharmacy, in the CDE panel (`ui.contact`).',
    items: [
      {
        topic:
          'NIHB exceptions: FNHA (BC), Nisga’a, Nunatsiavut, Nunavik Inuit, James Bay Cree, Bigstone Cree Nation, Akwesasne',
        cards: [6],
        why: 'Left out for good by the owner’s answer B2 (2026-10-06): eligibility is left to Indigenous Services Canada’s own page, which card 6 links (6.items.2, `isc-nihb-eligibility`), and Liivv says it can’t decide it',
        wording:
          '"Some Nations and regions run their own health benefits instead of NIHB, including the First Nations Health Authority in British Columbia. Your pharmacist or band office can tell you which plan covers you."',
        check: 'isc-nihb-eligibility (registered)',
      },
      {
        topic: 'Manitoba paediatric pump program',
        cards: [2],
        why: 'The registered Shared Health page describes only adult (18+) pump coverage',
        wording: '"Manitoba has a separate pump program for children"',
        check: 'A Manitoba paediatric pump page',
      },
      {
        topic: 'Indigenous-led diabetes organizations and patient education',
        cards: [6],
        why: 'There is no Indigenous health partner to choose them (owner answer B1, 2026-10-06), so card 6 links only Indigenous Services Canada',
        wording: 'The partner’s choice of links',
        check: 'An Indigenous health partner, if the owner finds one',
      },
      {
        topic: 'Ch38 prevalence, colonization and Inuit lines',
        cards: [6],
        why: 'Interpretive and statistical content stays off card 6 with no Indigenous health partner to review it (owner answer B1, 2026-10-06; ruling C21 keeps the Kidney Foundation statistic off too). The card’s other Ch38 lines (care in context, remote screening, a check every 6 to 12 months) came out with it',
        wording: 'As the guideline states them',
        check: 'dc-cpg-ch38-indigenous',
      },
      {
        topic: 'Breakthrough caregiver guide contents',
        cards: [5],
        why: 'Only the guide’s existence and audience are on a registered page',
        wording: 'A one-line summary of what it covers, plus a band link',
        check: 'Register the guide page',
      },
      {
        topic: '"Up to 300 extra decisions a day"',
        cards: [5],
        why: 'Not in the locator; the number came from a summariser',
        wording: '"Type 1 can mean hundreds of extra decisions a day, about food, rest and play"',
        check: 'bt1d-mental-health-support (re-read)',
      },
      {
        topic: 'Moving from children’s to adult care (transition)',
        cards: [2],
        why: 'No source in the register',
        wording:
          '"Ask your child’s clinic, a year or two ahead, when and how they hand over to adult care"',
        check: 'CPG Ch34 / Ch41 (re-read); CPS',
      },
      {
        topic: 'Diabetes camps; Bag of Hope; newly-diagnosed child pages',
        cards: [2],
        why: 'Not in the register',
        wording: '—',
        check: 'Breakthrough newly-diagnosed pages',
      },
      {
        topic: 'Diabetes@School care plan template and checklist pages',
        cards: [3],
        why: 'Only the low and glucagon pages are registered',
        wording: 'Band link: "Diabetes@School: Individual Care Plan"',
        check: 'Register the Diabetes@School care plan page',
      },
      {
        topic: 'CPS: glucagon training when an ambulance is more than 20 minutes away',
        cards: [3],
        why: 'On the page; left out for length while items 7–8 cover the emergency. Can be released',
        wording:
          '"Where an ambulance could take more than 20 minutes, the CPS strongly recommends training school staff to give glucagon"',
        check: 'cps-t1d-in-school-2015 (confirmed)',
      },
      {
        topic: 'FIT: 4 mm needles, injecting with less dexterity or eyesight',
        cards: [4],
        why: 'FIT is industry-run (R9)',
        wording:
          '"Shorter pen needles (4 mm) work for most adults, and a pharmacist can show you devices that are easier to handle"',
        check: 'A non-industry Canadian source',
      },
      {
        topic: 'Eyesight and hand strength',
        cards: [4],
        why: 'No source beyond FIT; Ch37 covers memory only',
        wording: '"If eyesight or hand strength is changing, tell your team"',
        check: '—',
      },
      {
        topic: 'Home care, community nursing, pharmacist medication reviews for seniors',
        cards: [4],
        why: 'No source in the register',
        wording: '"Ask your care team what home care your province provides"',
        check: 'Provincial pages (for example, Ontario MedsCheck)',
      },
      {
        topic: 'Long-term care: no sliding-scale insulin, deprescribing',
        cards: [4],
        why: 'Clinician-level, close to treatment decisions',
        wording: '—',
        check: 'dc-cpg-ch37-older-people (held for scope)',
      },
      {
        topic:
          'Ch37 drug lines (DPP-4 over sulfonylureas, avoid glyburide, once-daily basal, premixed insulin)',
        cards: [4],
        why: 'Out of scope (no drug classes or treatment choices)',
        wording: '—',
        check: '—',
      },
      {
        topic:
          'Pregnancy numbers: folic acid 1 mg, glucose targets, pregnancy A1C, 50% insulin cut',
        cards: [1],
        why: 'Held for scope by default (M2, M3, M6)',
        wording: 'As in M2, M3 and M6',
        check: 'dc-cpg-ch36-pregnancy (confirmed)',
      },
      {
        topic: 'Ch36 vaccinations and thyroid screening after the birth',
        cards: [1],
        why: 'Not re-read by the source check; minor',
        wording: '"Your team will check your vaccines are up to date before you try"',
        check: 'dc-cpg-ch36-pregnancy (re-read)',
      },
      {
        topic: 'Kits in the shop strips (a school low kit, pen and meter starters)',
        cards: [2, 3, 4],
        why: 'Placements resumed (B21) and cards 2 to 4 carry product strips (chapter-shop.ts); no kit is listed until the owner verifies kits-for-review.md (A4)',
        wording: '—',
        check: 'Owner sign-off of each kit',
      },
    ],
  },
};
