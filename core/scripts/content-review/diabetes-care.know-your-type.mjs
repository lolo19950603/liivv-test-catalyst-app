/**
 * Reviewer-only data for Chapter 05 · Know Your Type, read by the Diabetes Care
 * pass of the content-review export (./diabetes-care.mjs).
 *
 * From the chapter's copy record after the source check of 2026-10-05: its open
 * rulings (section D, K1–K24), the factual checks still to make before it is
 * published, and the wording it holds back (section E). None of it renders on
 * any page and none of it is in the message files. ./diabetes-care.mjs says
 * what each list is for and checks every `where` path and card number against
 * the chapter.
 *
 * The clinical rulings of 2026-10-06 settled every one of K1–K24, so none is
 * left open (docs/diabetes-content/clinical-rulings-2026-10-06.md). A new
 * question goes here; when the nurse rules on it, the copy changes (or stays)
 * and the entry comes out.
 */

export const KNOW_YOUR_TYPE = {
  openRulings: [],

  prePublishChecks: [
    'CanScreen (`5.7`): the "launching this fall 2026/winter 2027" banner was unchanged on 2026-10-05 (page modified 2026-06-10). Re-check it on the publish day, since the launch window is now.',
    'Teplizumab (`5.10`, `5.11`): coverage confirmed on 2026-10-05 (CDA-AMC "do not reimburse", Jan 2026; INESSS, Oct 2025); the delay and harms rest on the CDA-AMC recommendation and the Health Canada monograph (authorized 2026-07-20), both read 2026-10-06 (ruling C26). Re-check if publishing is delayed, and whether Breakthrough T1D still points to UncoverT1D (C36).',
    'CPG Ch18 (`13.3`–`13.5`): the live page shows no update or supersession notice. Confirm the 2023 mental-health update does not supersede the antipsychotic passage before release, and re-read Table 4 visually before the full monitoring schedule is released.',
    'Register titles: corrected in `sources-meta.ts` on 2026-10-05 (the post-transplant consensus, the Canadian children’s study, the PHSA funding request, the CHU Sainte-Justine page, now marked as French, and the ADA summary). Still unchecked: `chs-hemochromatosis-faq`, `bcdiabetes-autoantibody-testing`, `on-health-genetics-clinics`, `sbgh-anti-gad65`, `ispad-2022-cfrd`, `exeter-hnf1b-mody`, `exeter-mody-testing-guidelines` and `exeter-sulfonylurea-treatment`.',
  ],

  heldCopy: {
    released:
      'Released by the source check, and now in the copy: prediabetes and the chance of type 2 (3.6); A1C as the average over the past 2 to 3 months (6.fig.terms.4); insulin "within 1 to 2 years" from CPG Ch3 (6.s2.3, and the family tree’s column); teplizumab from age 8, in stage 2 (5.10); checkpoint-inhibitor diabetes coming on with DKA (13.6). Released by the clinical rulings of 2026-10-06: teplizumab’s "about 2 years" delay, beside its serious side effects (5.10, C26); Breakthrough T1D’s UncoverT1D pointer (5.11, C36). No card is held whole: card 11 keeps six sourced items without the type 3c detail.',
    items: [
      {
        topic:
          'Type 3c detail: 1–9% of diabetes; chronic pancreatitis about 79% of cases; lows in 78% on insulin, 17% severe; impaired glucagon; low enzymes and no antibodies as clues',
        cards: [11],
        why: 'Hart 2016 is abstract only (its full text could not be read); Pancreapedia is "other" and its quotes came through a fetch summary',
        wording:
          '"Diabetes after pancreas disease can bring frequent lows on insulin, partly because the body’s glucagon response is weaker"',
        check: 'A readable official source (Hart in full, a Canadian GI or Diabetes Canada page)',
      },
      {
        topic: 'Pancreatic-cancer clue (new diabetes after 50 with weight loss; about 1%)',
        cards: [11],
        why: 'Stays held (ruling C34, 2026-10-06). Candidate source: the Canadian Cancer Society’s "Risks for pancreatic cancer" (EN and FR), whose wording is risk-based ("people who developed diabetes within the last 3 years have the greatest risk"; it is unclear whether diabetes is an early sign) and says nothing about "after 50 with weight loss". Any release must follow that framing. Diabetes Canada’s Appendix 2 lists neoplasia under diseases of the exocrine pancreas',
        wording:
          '"New diabetes after 50 with weight loss you can’t explain is worth raising with your doctor"',
        check: 'As above',
      },
      {
        topic: 'The name "type 3c"',
        cards: [11],
        why: 'Only unreadable or unverified sources use it. Stays held (ruling C34); the card keeps the title "Pancreas conditions and iron overload"',
        wording: 'Title: "Pancreas-related diabetes (type 3c) and iron overload"',
        check: 'As above',
      },
      {
        topic: '">95% of people over 50 with new diabetes have type 2"',
        cards: [2],
        why: 'Hart could not be read in full',
        wording: 'Dropped',
        check: '—',
      },
      {
        topic: 'Ketosis-prone type 2',
        cards: [],
        also: '—',
        why: 'A citation and search snippets only',
        wording: 'None',
        check: 'Umpierrez 2006 in full',
      },
      {
        topic: 'Hormone causes beyond one line',
        cards: [6],
        why: 'Appendix 2 gives a classification list only',
        wording: 'One line kept (6.s2.9)',
        check: '—',
      },
      {
        topic: 'LADA: "CGM is standard"',
        cards: [7],
        why: 'An extrapolation from adults with type 1. Stays held (ruling C35); card 7’s take-in card asks the question instead (`7.figure.fields.4`, "Would a sensor (CGM) help me?")',
        wording: '—',
        check: 'A LADA-specific source',
      },
      {
        topic: 'CGM coverage for LADA when not on insulin',
        cards: [7],
        why: 'Unverified in each province',
        wording: '—',
        check: 'Provincial CGM program pages',
      },
      {
        topic: 'LADA relatives and TrialNet eligibility',
        cards: [7],
        why: 'Unverified',
        wording: '—',
        check: 'TrialNet’s eligibility page',
      },
      {
        topic: 'Neonatal "about 40%" potassium-channel figure',
        cards: [9],
        why: 'The Exeter subpage returned 404 at the check, which said to drop it',
        wording: '—',
        check: '`exeter-neonatal-kcnj11-abcc8`, re-opened',
      },
      {
        topic: 'Neonatal switch "ideally with CGM"',
        cards: [9],
        why: 'Not on the checked page (a transfer protocol only, clinician-level)',
        wording: '—',
        check: '`exeter-sulfonylurea-transfer` (scope)',
      },
      {
        topic:
          'Exeter tests babies diagnosed before 9 months from any country; the cost for Canadians',
        cards: [9],
        why: 'Testing routes in Canada need Canadian sources (policy 3); the cost is unverified',
        wording: '"Your specialist can ask about testing at an international centre"',
        check: 'A provincial out-of-province approval for neonatal panels',
      },
      {
        topic: 'A Canadian lab offering a MODY panel',
        cards: [8],
        why: 'None verified',
        wording: '—',
        check: 'Provincial genetics programs',
      },
      {
        topic: 'ADDAM research study (Montreal)',
        cards: [8],
        why: 'A registry entry from December 2024; it may now be closed',
        wording: '—',
        check: 'clinicaltrials.gov NCT03988764',
      },
      {
        topic: 'Lipodystrophy yearly checks, "diet is essential"',
        cards: [10],
        why: 'Brown 2016 is abstract only (policy 6)',
        wording:
          '"Yearly checks of blood sugar, blood fats, liver, kidneys and heart are recommended"',
        check: 'Brown 2016 in full',
      },
      {
        topic: 'Lipodystrophy treatment (metreleptin)',
        cards: [10],
        why: 'An industry source only; drug content is out of scope',
        wording: 'None',
        check: 'Health Canada’s Drug Product Database (returned 403)',
      },
      {
        topic: 'MIDD "avoid metformin"',
        cards: [10],
        why: 'Drug advice, out of retail scope',
        wording: 'None',
        check: '—',
      },
      {
        topic: 'Checkpoint-inhibitor diabetes coming on "suddenly" or "quickly"',
        cards: [13],
        why: 'Partly released: "can come on with DKA" is in 13.6 (Holt; ADA 2.19). The speed of onset is still unsourced; the ADA Summary of Revisions could not be confirmed',
        wording: '"It can come on quickly"',
        check: 'The ADA §2 in full, or Canadian oncology pages',
      },
      {
        topic: 'Antipsychotic monitoring intervals in full',
        cards: [13],
        why: 'Table 4 is on the live Ch18 page (baseline; 1, 2 and 3 months; every 3–6 months; yearly), but which check sits in which column is unclear in a text extract, and the schedule may not be shortened. See also the pre-publish check on Ch18',
        wording:
          '"At 1, 2 and 3 months, then every 3 to 6 months and yearly, depending on the check"',
        check: 'CPG Ch18 Table 4, re-read visually',
      },
      {
        topic: 'C-peptide insured in Ontario',
        cards: [6],
        why: 'A fee-schedule listing does not establish a patient’s coverage',
        wording: '"In Ontario, C-peptide is on the community lab schedule"',
        check: 'Ontario hospital-lab status',
      },
      {
        topic: '"Your doctor or nurse practitioner orders"',
        cards: [6],
        why: 'Nurse practitioner ordering is unverified',
        wording: '—',
        check: 'Provincial lab requisition rules',
      },
      {
        topic: 'UncoverT1D free screening (industry)',
        cards: [5],
        why: 'Ruling C36 (2026-10-06) released UncoverT1D only as Breakthrough T1D’s pointer (5.items.11), disclosed as Sanofi’s site and never linked. The free test (Sanofi, age 8 and over) stays held: an industry source, and the BC handout’s 2023-May-18 stamp is stale, though the file is current (Last-Modified 2026-09-27)',
        wording: '—',
        check: 'The BC handout and the maker’s page',
      },
      {
        topic: '"Stage 3 is when symptoms start"',
        cards: [5],
        why: 'The sources conflict: the ADA’s Table 2.4 calls stage 3 "Symptomatic"; Phillip says "with or without symptoms"',
        wording: '— (the copy says "type 1 is diagnosed")',
        check: '—',
      },
      {
        topic: '"Screen every new type 2 for GAD" (Buzzetti)',
        cards: [6],
        why: 'It conflicts with Ch3 (not for routine use); 6.s3.4 is Ch3 only now (ruling C27)',
        wording: '—',
        check: '—',
      },
      {
        topic: 'TrialNet: "taught the DKA signs"',
        cards: [5],
        why: 'Not on the TrialNet page; 5.9 cites Phillip instead',
        wording: '—',
        check: '—',
      },
      {
        topic: 'Lab prices (the BC handout: GAD65 $232 private, and others)',
        cards: [6],
        why: 'The owner’s and the plan’s default is to show no prices (ruling C36 kept the BC example without them); the handout’s date is unclear',
        wording: '—',
        check: '—',
      },
      {
        topic: 'Blood-ketone strips and a low-glucose kit in the shop strips',
        cards: [1, 2, 4, 7, 11, 12, 13],
        why: 'Placements resumed (B21): meters, urine ketone strips and sensors on cards 1, 7, 11, 12 and 13, a meter with its strips on cards 2 and 4, nothing on card 3 (chapter-shop.ts). The blood-ketone strips (4909) need a meter Liivv does not stock, and their description links another retailer; the Low-Glucose Rescue Kit waits on kit sign-off (A4)',
        wording: '—',
        check: 'A stocked blood-ketone meter; the owner’s kit sign-off',
      },
    ],
  },
};
