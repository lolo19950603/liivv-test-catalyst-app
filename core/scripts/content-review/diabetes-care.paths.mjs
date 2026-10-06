/**
 * Reviewer-only data for the Diabetes Care path pages, read by the Diabetes
 * Care pass of the content-review export (./diabetes-care.mjs).
 *
 * From the paths' copy record after the source check of 2026-10-05
 * (paths.md): its open questions (section G), what it holds back by policy and
 * for want of a source (section E), the sources proposed for the register
 * (section F.1–F.3) and the locator notes due on registered ones (F.4). None
 * of it renders on any page.
 *
 * The held wording is in no message file. The CDE band, written into every
 * path but one, was held by `cdeBand` in diabetes-care/chapters/paths-meta.ts
 * until the owner's answers of 2026-10-06 (A1, A2, B5, B9, B10, B11) settled
 * Q16, Q17 and Q19; it now renders with the CDE contact.
 *
 * `where` is message paths from the root of the DiabetesCare tree, checked
 * against en.json, so a question cannot keep pointing at a line that has gone.
 * When a question is answered, the copy changes (or stays) and the entry
 * comes out. Q numbers are the copy record's own, so cross-references hold.
 */

const PAY_AND_CLAIM = [
  'paths.type-1.funding.body',
  'paths.type-2.funding.body',
  'paths.gestational.funding.body',
  'paths.less-common-types.funding.body',
];

export const PATHS = {
  /* Answered by the source check, or by building the pages; printed for the record. */
  settled: [
    {
      id: 'P2 (owner, 2026-10-06, A6, B13)',
      note: '"each pharmacy is already enrolled [with its province\'s drug plan]". The four doors now say "At Liivv, our pharmacy in your province bills your provincial drug plan for what it covers, except in Quebec. Other programs each pay their own way, so check how yours pays before you order, or ask us." (FR to match), the Funding page\'s how-paying-works fact (`DIRECT_BILLING`). They still promise no claim route for other programs.',
    },
    {
      id: 'Q16 (owner, 2026-10-06, A2, B5, B12)',
      note: 'The CDEs are at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, and "many HCPs can be CDEs", so every band says "Certified Diabetes Educators at Bayshore Express Pharmacy", never "pharmacist CDEs". `cdeBand` is on.',
    },
    {
      id: 'Q17 (owner, 2026-10-06, A1, B5, B11)',
      note: 'Liivv’s pharmacies serve all of Canada, Quebec and the territories included, and Bayshore Express Pharmacy passes people to the Liivv pharmacy in their province. The bands no longer say there is no Liivv pharmacy in Quebec or the territories.',
    },
    {
      id: 'Q19 (owner, 2026-10-06, B10)',
      note: '"they can take all sorts of questions": the CDEs answer questions about pumps, sensors, meters, supplies, billing and claims, so the Gestational band stays, and every band says so.',
    },
    {
      id: 'Q1',
      note: 'The Funding page was built on 2026-10-06 (`fundingPage` in landing-meta.ts), so every door links to /liivv-health/diabetes-care/funding, in the page locale.',
    },
    {
      id: 'Q6',
      note: 'Type 1 share: "5 to 10%", as the register locator and New to the Journey already use (source check).',
    },
    {
      id: 'Q11',
      note: 'All five printed titles confirmed by the source check; the title and locator fixes are listed under "Locator notes" below.',
    },
    {
      id: 'Q13',
      note: 'The old `PATH_CHAPTERS` copy ("pump-adjacent shopables", "CarePack", "Olivia", "Available in Ontario") is retired with the rest of the older chapter pages: `diabetes-care/chapters/chapters-data.ts`, `chapter-page.tsx` and `chapter-page.css` are deleted, after a search of core/ found nothing else importing them or linking to their card titles.',
    },
    {
      id: 'Q14',
      note: '`less-common-types` is in the Liivv Health sitemap (English; /fr once the `paths` gate opens), in the five-path rail on every path page, and in the Diabetes Care header menu under Know Your Type. The landing’s "Which diabetes?" chips still open Know Your Type cards, so the "Other" chip opens card 6 (landing D12).',
    },
  ],

  /*
   * How the pages were built from the record, where the build had to choose.
   * Reviewer-only; each is a place to look if a page and the record differ.
   */
  buildNotes: [
    'One generic renderer serves all five paths (`_microsite/paths`), in the chapters’ look: hero, intro with the emergency signpost under it, the reading list, the funding door, the other-paths rail, then the help, discovery and governance furniture. The shop-strip slot between the list and the door renders nothing.',
    'The reading list is grouped by runs of the same stage, in row order, never re-sorted (Q9’s default). So on Less common types, rows 14 and 15 (stage "Start here") come after the Staying Safe cards under a second "Start here" heading.',
    'Each entry shows the card’s title as its chapter holds it, "Chapter <num> · <chapter title>", the reason, and "Read the card", and links to the card’s `#card-<n>` anchor in the page locale. No title is retyped.',
    'The hero’s one button reads the list heading (`list.heading`) and jumps to the list; the record names no separate button label.',
    'The governance block carries Know Your Type’s disclaimer (`chapters.know-your-type.governance.disclaimer`, every path starts from that chapter); the record gives the paths no disclaimer of their own. It lists every source the page names, once each.',
    'The CDE band renders on every path but Prediabetes (`cdeBand` on since 2026-10-06), with the general phone line, email, hours and About page of Bayshore Express Pharmacy (`DIABETES_SITE.contact`) in place of a button. Its "Request a call" (`cta`) renders only once the appointment page can take the request (`cdeRequestReason`, landing D3; B6).',
    'Less common types row 2 cites `bt1d-lada` only. The record also lists `diabetes-uk-lada`, but the reason does not name it, and an international source is cited only where the sentence names it; the Canadian page carries the whole fact.',
    'Accent and images are placeholders (Q10): every path uses `#c9dcc0`; Less common types reuses Know Your Type’s `chapter-journey.png`.',
    'The old "Your Diabetes Journey" hub (`/chapters/your-diabetes-journey`, and /fr) redirects permanently to the landing’s #which-diabetes (next.config.ts); `/pages/your-diabetes-journey` goes straight there too.',
    'French follows the Ostomy precedent: the paths’ prose ships on /fr flagged as machine translated, with the draft marker on previews (French review gate `paths`). A path has no module to hold back, and its emergency signpost is never behind a gate.',
  ],

  openQuestions: [
    {
      id: 'Q3',
      who: 'Owner',
      question:
        'Prediabetes’ Funding door makes no supply claim. Keep it, or drop it? The pharmacist band is left off Prediabetes, because the CDEs answer pump and CGM questions. (Default: door kept, band dropped.)',
      where: ['paths.prediabetes.funding.body'],
    },
    {
      id: 'Q4',
      who: 'Owner',
      question:
        'Ontario examples on national pages: the Type 2 and Gestational doors use Ontario programs, named as examples. OK, or generic until the checker is live on /fr? (Default: Ontario examples, labelled.)',
      where: ['paths.type-2.funding.body', 'paths.gestational.funding.body'],
    },
    {
      id: 'Q8',
      who: 'Owner and nurse',
      question:
        'List length: Type 1 has 33 entries and Type 2 has 28. Cap at about 20 with "More cards for type 1"? Safety entries would never go behind it. (Default: the full list, grouped by stage.)',
      where: ['paths.type-1.list.intro', 'paths.type-2.list.intro'],
    },
    {
      id: 'Q9',
      who: 'Owner',
      question:
        'Order against stage on Less common types: rows 14 and 15 come after Staying Safe on purpose. As built, the list keeps row order, so they sit under a second "Start here" heading. Keep that, or give them the stage "If this is you"? (Default: row order.)',
      where: ['paths.less-common-types.list.reasons.14', 'paths.less-common-types.list.reasons.15'],
    },
    {
      id: 'Q10',
      who: 'Owner',
      question:
        'Hero images: `less-common-types` has none of its own, and the older path images are placeholders. (Default: reuse `chapter-journey.png`.)',
      where: [],
    },
    {
      id: 'Q15',
      who: 'Content',
      question:
        'Ch 41 addendum: CJD has published an addendum to the 2025 type 1 chapter (S1499-2671(25)00089-9). Does it change the automated insulin delivery line? (Default: the line ships; check before release.)',
      where: ['paths.type-1.intro.body.2', 'paths.type-1.list.reasons.19'],
    },
    {
      id: 'Q18',
      who: 'Owner',
      question:
        'ODB co-pay line (H-T2-2): release "usually billed at the pharmacy… co-pay" alongside the how-paying-works sentence, or leave ODB as a strip-limit example only? (Default: strip-limit example only, with the how-paying-works sentence first.)',
      where: ['paths.type-2.funding.body'],
    },
    {
      id: 'Q21',
      who: 'Content',
      question:
        'Know Your Type cards 6, 7, 8, 9 and 13 cite `holt-t1d-adults-consensus-2021`, which the 2026 ADA/EASD report supersedes. Re-cite once F.3 is read and registered. The Less common types intro’s insulin line rested on it too, and is now safety framing that states no fact.',
      where: ['paths.less-common-types.intro.body.2'],
    },
  ],

  /*
   * Section E: on hold by policy, and held for want of a source. None of it is
   * in a message file; the CDE band was, and is released (`cdeBand`).
   */
  heldItems: [
    {
      id: 'E.1-kits',
      item: 'Starter kits (Tandem, mylife, Omnipod, Dexcom G7, Sick-Day Ready, meter starters)',
      where: 'The same slot',
      wording: '—',
      releases: 'The owner signs off each kit',
    },
    {
      id: 'E.1-later',
      item: 'Pay-later for pump supplies',
      where: 'Funding door, Type 1 and Less common types',
      wording: '—',
      releases:
        'Approved 2026-10-06 (A5, "Liivv Now, Pay Later"): on the Funding page and its pump program cards only. The doors point there; a line on them needs the owner’s go-ahead',
    },
    {
      id: 'E.1-gate1',
      item: 'The CDE band’s "Request a call" button (release gate 1)',
      where: 'Every path but Prediabetes, under the CDE contact',
      wording: 'The band’s `cta`, as written under each path above',
      releases:
        'A booking page can take the request (`cdeRequestReason`, landing D3): Microsoft Bookings, or Bayshore Express Pharmacy’s own (B6)',
    },
    {
      id: 'H-P2',
      item: 'Prediabetes: an "almost 60%" risk-reduction figure',
      where: 'Prediabetes intro',
      wording: '—',
      releases:
        'Recommended to leave out for good: a trial-population figure, not a personal promise',
    },
    {
      id: 'H-T1',
      item: 'Type 1: "About 300,000 Canadians have type 1"',
      where: 'Type 1 intro',
      wording: '—',
      releases: 'Confirmed, not used (one statistic per paragraph). Release on request',
    },
    {
      id: 'H-T2-1',
      item: 'Type 2: the "about 40%" consensus figure',
      where: 'Type 2 intro, paragraph 2, in place of the Breakthrough T1D sentence',
      wording:
        '"An international consensus says about 40% of people who develop type 1 after age 30 are first treated as type 2."',
      releases: 'Register F.3 after a direct read of the 2026 report, and match its wording',
    },
    {
      id: 'H-T2-2',
      item: 'Type 2: how ODB is paid',
      where: 'Type 2 Funding door, after the ODB example',
      wording:
        '"The Ontario Drug Benefit is usually billed at the pharmacy, and you pay a small co-pay."',
      releases: 'An F.4 locator note on `on-odb-coverage`, then the owner’s ruling (Q18)',
    },
    {
      id: 'H-L1',
      item: 'Less common types: the name "type 3c"',
      where: 'Less common types intro',
      wording: '—',
      releases:
        'Stays held (ruling C34, 2026-10-06). A readable official source that uses the name; the Canadian Cancer Society page recorded for the pancreatic-cancer clue does not',
    },
  ],

  /* Section F.1–F.3. F.1 and F.2 were registered on 2026-10-06 (ruling C38); F.3 is not, and nothing that ships depends on it. */
  proposedSources: [
    {
      id: 'F.3',
      source: 'ada-easd-t1d-adults-consensus-2026',
      url: 'https://doi.org/10.1007/s00125-026-06833-z',
      backs:
        'H-T2-1, and the Know Your Type re-cites (Q21). Its text could not be read on 2026-10-05 (sign-in wall), so no fact is recorded yet',
    },
  ],

  /* Section F.4: notes due in sources-review.ts before release. No new source. */
  locatorNotes: [
    {
      source: 'dc-ontario-monitoring-for-health; on-preventing-and-living-with-diabetes',
      note: 'Only for people with no other funding for these supplies; mail receipts and a claim form, prescriber signature the first time; about 8 weeks. Title confirmed: remove `UNCHECKED_TITLE`',
      backs: 'Gestational door',
    },
    {
      source: 'on-odb-coverage',
      note: 'The receipt route (ODB Receipt Submission Form); co-pay up to $6.11 for seniors after a $100 deductible, up to $2 for others. Title confirmed: remove `UNCHECKED_TITLE`',
      backs: 'H-T2-2',
    },
    {
      source: 'cra-dtc-life-sustaining-therapy',
      note: 'Title confirmed ("Life-sustaining therapy eligibility"): remove `UNCHECKED_TITLE`',
      backs: 'Type 1 door',
    },
    {
      source: 'on-diabetes-equipment-and-supplies',
      note: 'Done 2026-10-06 (owner answer B31): `on-adp-insulin-pumps`, whose address redirects here, is merged into this entry, and the Less common types door cites this one. ADP also covers rtCGM for type 1 under medical criteria (in its locator)',
      backs: 'Less common types door',
    },
    {
      source: 'isc-nihb-updates',
      note: '"limited use benefit for clients managing diabetes with insulin. Prior approval is required"; both provider billing and client reimbursement exist',
      backs: 'Less common types door; Type 1 row 33, Type 2 row 28',
    },
    {
      source: 'exeter-gck-pregnancy-2018',
      note: 'Persistent fasting 5.5–8 and family history are separate listed features, not one combined rule',
      backs: 'Gestational row 21',
    },
    {
      source: 'cf-canada-cfrd-guideline-2024',
      note: 'Rec IV: education covers handling hypoglycemia "including the use of glucagon for insulin-treated individuals"; Rec II covers hospital access only. Since 2026-10-06 (owner answer B36) the entry links Cystic Fibrosis Canada’s own guidelines page, which links the PDF, and its French page on fibrosekystique.ca',
      backs: 'Less common types row 11',
    },
    {
      source: 'dc-cpg-ch41-t1d-lifespan-2025',
      note: 'CJD 2025;49(1):5–18, doi 10.1016/j.jcjd.2025.01.001; an addendum exists (S1499-2671(25)00089-9)',
      backs: 'Type 1 intro paragraph 2, row 19',
    },
    {
      source: 'holt-t1d-adults-consensus-2021',
      note: 'Superseded by F.3 (2026-09-15)',
      backs: '—',
    },
  ],
};
