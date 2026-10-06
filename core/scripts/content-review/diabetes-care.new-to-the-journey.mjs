/**
 * Reviewer-only data for Chapter 01 · New to the Journey, read by the Diabetes
 * Care pass of the content-review export (./diabetes-care.mjs).
 *
 * From the chapter's copy record after the source check of 2026-10-05: its open
 * rulings (section D), the factual checks still to make before it is published,
 * and the wording it holds back (section E). None of it renders on any page and
 * none of it is in the message files. ./diabetes-care.mjs says what each list
 * is for and checks every `where` path and card number against the chapter.
 *
 * A ruling marked `settled` was answered by the source check itself; it is
 * printed for the record, apart from the open ones, and is not counted as open.
 * When the nurse rules on an open one, the copy changes (or stays) and the
 * entry comes out.
 */

export const NEW_TO_THE_JOURNEY = {
  openRulings: [
    /* New for this chapter. */
    {
      id: 'N3',
      settled: true,
      default:
        '**Settled by the source check.** A1C "about every 3 months", plus "for adults whose numbers have been steady at target, your team may space it out" (Ch9 "at least every 6 months… in adults"). The band does not print the 6-month figure.',
      where: ['programsBand.cards.2'],
      alternative: 'Print "at least every 6 months" as well.',
    },
    {
      id: 'N8',
      settled: true,
      default:
        '**Settled by the source check.** Type 1 is now "5 to 10%" (on the DC page), so 5–10% and 90–95% no longer add up to more than 100%.',
      where: ['categories.2.items.1', 'categories.2.items.2'],
      alternative: '"About 10%" (also on the page).',
    },
    {
      id: 'N9',
      settled: true,
      default:
        '**Settled by the source check.** The prediabetes definition follows DC’s wording ("higher than normal, but not yet high enough to be… type 2 diabetes").',
      where: ['categories.2.items.4'],
      alternative:
        'Add DC’s "Not everyone with prediabetes will develop type 2 diabetes, but many people will."',
    },
    {
      id: 'N12',
      default:
        '**Card 2’s doors open the matching Know Your Type cards** (now in use: Ch05 is served, so the `knowYourTypeRoute` hold is lifted, review of 2026-10-05). Type 1 → card 1, type 2 → card 2, prediabetes → card 3, gestational → card 4, less common types → card 6 ("Could my type be different?"), in the page locale.',
      where: ['categories.2.figure'],
      alternative:
        'Point the doors at the four existing path pages (`type-1`, `type-2`, `gestational`, `prediabetes`) instead, with the "less common types" door going to Know Your Type card 6.',
    },
  ],

  prePublishChecks: [
    'Booking: "Request a call" stays held until a booking page can take the request (Microsoft Bookings, or Bayshore Express Pharmacy’s own; OPEN-QUESTIONS B6). The CDE hours, the Canada-wide scope and the hand-off to the Liivv pharmacy in the reader’s province were answered by the owner on 2026-10-06 (A1, A2, B5) and are in `11.fig.lanes.4` and `pharmacist.body`; the lane, like the panel, shows the pharmacy’s phone line, email, hours and About page from `ui.contact` (since 2026-10-06).',
  ],

  heldCopy: {
    released:
      'Released by the source check, and now in the copy: what A1C measures, "over the past 2 to 3 months" (dc-checking-blood-sugar), in 3.3. The draft’s "about 3 months" was replaced with the page’s "2 to 3 months". Released by the owner’s answers of 2026-10-06 (A2, B5, B9, B12): the CDE contact, the general phone line, email, hours and About page of Bayshore Express Pharmacy, in the CDE panel and the CDE lane (`ui.contact`).',
    items: [
      {
        topic: 'Device maker 24/7 support lane',
        cards: [11],
        why: 'Manufacturer pages only (policy 4). Staying Safe holds the same lane',
        wording: '"Your pump or sensor maker: device faults, any time"',
        check: 'A neutral Canadian source naming maker support',
      },
      {
        topic: 'Peer support lane (Breakthrough T1D, Diabetes Canada)',
        cards: [11],
        why: 'No verified Canada-wide peer finder in the register. `site.ts` leaves the help band’s peer card out for the same reason',
        wording: '"Someone who lives with diabetes: a local or online peer group"',
        check: 'Breakthrough T1D peer pages; DC Connect community (neither registered)',
      },
      {
        topic: 'Breakthrough T1D Caregiver Guide contents',
        cards: [5],
        why: 'Only the guide’s existence and audience are confirmed (children and teens with T1D)',
        wording: 'Specific caregiver tips from the guide',
        check: 'The guide itself',
      },
      {
        topic: 'Breakthrough T1D "Newly diagnosed" hub, Bag of Hope',
        cards: [1, 5],
        why: 'Marked "Partial" in the survey: the link was seen but the content was not opened. Not in the register',
        wording: '"Breakthrough T1D has newly diagnosed guides for children, teens and adults"',
        check: 'breakthrought1d.ca/newly-diagnosed/',
      },
      {
        topic: 'DC Type 1 Adult Toolkit and How 2 Type 1 videos',
        cards: [2, 8],
        why: 'Known only as links on dc-type-1; not opened',
        wording: 'Shelf links',
        check: 'Each resource',
      },
      {
        topic:
          'Diabetes education programs: "many are free", run by hospitals and community health centres',
        cards: [11],
        also: 'band card 1',
        why: 'Existing site copy (`ui.help`) but no registered source',
        wording:
          '"Many hospitals and community health centres run diabetes education programs, and many are free"',
        check: 'Provincial program pages; DC',
      },
      {
        topic: 'Signs of a low',
        cards: [5],
        why: 'Held in Staying Safe (not in the verified claims)',
        wording: '"Signs of a low can include feeling shaky, sweaty, hungry or confused"',
        check: 'DC 02/24 sheet; das-low-blood-sugar',
      },
      {
        topic: 'Sharps outside the HPSA provinces (BC, AB, SK, NS, NL and the territories)',
        cards: [9],
        why: 'No province-wide government source covers sharps return outside the HPSA provinces (ruling C32, source gap). Card 9 keeps the instruction "ask your pharmacy"',
        wording: 'Province-specific return routes',
        check: 'Provincial or municipal pages',
      },
      {
        topic:
          'Injection technique (needle length, angle, skin lift, site checks, U-200/U-300, pen tips off between injections)',
        cards: [8],
        why: 'Belongs to Ch03 Your Tools; the FIT lines are industry-run (R9)',
        wording: '—',
        check:
          'Ch03 (DC’s "Do not leave pen tips on the end of the pen" is sourced and can go there)',
      },
      {
        topic: 'Kids Help Phone and other crisis lines',
        cards: [1],
        why: 'Not checked (survey; 9-8-8 locator)',
        wording: 'Add to the crisis strip',
        check: 'Each line’s own page',
      },
      {
        topic: 'Starter supply list as a ticking module',
        cards: [10],
        why: 'Placements resumed (B21): card 10 keeps its columns, and its shop strip groups the products by therapy (chapter-shop.ts). A ticking supply list with products per line is a new module, not built',
        wording: '—',
        check: 'Owner',
      },
      {
        topic: 'Kits in the shop strips',
        cards: [8, 10],
        why: 'No kit is listed until the owner verifies kits-for-review.md (A4)',
        wording: '—',
        check: 'Owner sign-off of each kit',
      },
    ],
  },
};
