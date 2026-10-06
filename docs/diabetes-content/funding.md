# Funding & Coverage: page draft (DiabetesCare.funding, DiabetesCare.ui.funding*)

Revised draft of 2026-10-05, after the live source check in `funding.verify.md` (every registered URL re-read on 2026-10-05). Nothing here is compiled or in the repo. Route: `/liivv-health/diabetes-care/funding`. The change log is section G.

**Forked from** the Ostomy funding page:
- `ostomy-care/funding/funding-meta.ts`
- `funding-data.ts`
- `funding-page.tsx`
- `funding-checker.tsx`
- the `OstomyCare.funding` / `OstomyCare.ui.{fundingPage,checker,results}` messages

**Brief:** the plan sections "Funding & Coverage page" and "Direct billing and pay-later".

**Facts come only from:**
- `dx/survey-funding-manufacturers.md`
- `dx/billing-*.md` and `dx/billing-verify.md`
- the `sources-meta.ts` / `sources-review.ts` register

### Ground rules applied

- **SourceIds.** Every SourceId cited exists in `diabetes-care/chapters/sources-meta.ts`. A fact whose only source is unregistered is **HELD** and stays out of section B. The proposed registrations are in section F.
- **No competitor name and no competitor link**, in copy, code comments or commit messages. The layout (federal first, then a province picker) is generic, and no copy is reused.
- **No product shelves or kit carousels.** One shop strip only, approved by B21 (2026-10-06): the pump-supplies strip after "How paying works", before the checker (`#pump-supplies`; see the commerce step in the change log).
- **No testimonials and no statistics.** Program amounts and quantities appear only as published by the program.
- **Retail scope.** Nothing tells the reader which device or medicine to use or how much to take. Brand names appear only as what a program lists.
- **Liivv facts are the owner's (2026-10-05):**
  - a Bayshore pharmacy in every province except Quebec, and none in the territories;
  - pharmacist CDEs at the Bayshore Specialty Rx head office in Markham answer pump and CGM questions for all of Canada, by phone or by request, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays, and pass people to the right Liivv pharmacy as needed;
  - **"Request a call" only.** The phone number isn't confirmed, so none is shown.
- **Pay-and-claim is how Liivv orders work, not a promise that every program takes a receipt.** No program is billed directly yet, so every card is shown as "you pay for your order", with "ask us" copy. Some programs pay only a pharmacy or supplier, so the page never says a receipt will be accepted (verify P1).
- **Direct billing.** The section is present but lists **no program**. The owner lists a program only once Liivv is enrolled.
- **Pay-later.** It is **not shown**: there is no message, no slot copy and no flag set to true.
- **Partly verified rows.** Any row the research marked P carries `confirm: true`, and the page renders "Partly confirmed: check with the program".
- **Voice.** Plain, warm, second person, Canadian spelling, no exclamation marks. Curly apostrophes, matching the repo's message files.

---

## A) STRUCTURE (funding-meta-like typed data outline)

### A.1 Files (proposed, not made)

`core/app/[locale]/(default)/liivv-health/diabetes-care/funding/`:

| File | Role | Fork of |
|---|---|---|
| `page.tsx` | Route, metadata (`metaTitle` / `metaDescription`), the ad-signal denial already covers the `/liivv-health/diabetes-care` prefix (confirm in `core/lib/analytics/ad-signals.ts`) | `ostomy-care/funding/page.tsx` |
| `funding-meta.ts` | Non-translatable: program names, SourceIds, verifiedOn, confirm flags, applies-to rules, direct-billing list | `funding-meta.ts` |
| `funding-data.ts` | Types, `buildPrograms`, `buildResults` (pure) | `funding-data.ts` |
| `funding-checker.tsx` | 7 inputs, grouped result list | `funding-checker.tsx` |
| `funding-page.tsx` | Sections in A.2 | `funding-page.tsx` |
| `funding.css` | Reuse Ostomy `oc-fund-*` classes, renamed `dc-fund-*` | `funding.css` |

Elsewhere, listed but not made:
- `liivv-health-sitemap.xml/route.ts`: add the route.
- The landing page and the Ch01 links that point to Funding.
- `/fr` messages: to follow, flagged as a machine-translated draft.

Link labels resolve from `SOURCE_META[sourceId].label`. So the register is the single place a title lives, and `officialLabel` is not duplicated as it is on Ostomy.

### A.2 Page section order

Ostomy order, with "Four ways provinces pay" replaced by "How paying works":

1. **Hero:** `ui.fundingPage.kicker/title/lead`, then two CTAs (`#find-your-coverage`, `#federal`).
2. **Focus / Vibe notes**, plus the **urgent exit**. This reuses `DiabetesCare.chapters.staying-safe.urgentExit` and links to Staying Safe `#red-flags`, exactly as Ostomy reuses its Ch04 pair. No review gate may hide it.
3. **How paying works** (`#paying`), in three parts:
   - **Part 1: "Programs we bill directly".** It renders `DIRECT_BILLING` and shows the empty-state line while the list is empty (it is empty today).
   - **Part 2: "When you pay for your order yourself".** It says that some programs pay you back from a receipt and others pay only a pharmacy or supplier, and never promises a claim route.
   - **Part 3: pay-later.** No markup at all until `PAY_LATER.enabled`. No copy exists for it.
4. **Checker** (`#find-your-coverage`). The results are grouped in the owner's order (A.5).
5. **Federal** (`#federal`) rows:
   1. NIHB
   2. Veterans Affairs Canada
   3. National pharmacare, and the Diabetes Device Fund
   4. Disability Tax Credit
   5. RDSP

   The medical-expense row is HELD (E-14).
6. **What changed lately:** a dated list. Every line has a SourceId.
7. **Quebec and the territories:** where Liivv has no pharmacy.
8. **When it isn’t enough:** 3 cards.
9. **If you move:** 2 rows.
10. **Pharmacist CDE band** (national, no "Available in Ontario" label), with the "Request a call" CTA → `/account/virtual-care/appointment`. No phone number.
11. **Closing**, then `HelpBand`, `DiscoveryBand` and `GovernanceBlock`. The citations are every SourceId the page renders, resolved from the register.

**Product placement:** one strip, between sections 3 and 4 (`#pump-supplies`, `FUNDING_SHELF`), built 2026-10-06 (B21; see the commerce step in the change log).

### A.3 Types (`funding-data.ts`)

```ts
import type { SourceId } from '../chapters/sources-meta';

export type ProvinceCode =
  | 'BC' | 'AB' | 'SK' | 'MB' | 'ON' | 'QC' | 'NB' | 'NS' | 'PE' | 'NL' | 'YT' | 'NT' | 'NU';
export type Jurisdiction = ProvinceCode | 'CA';

export type DiabetesType = 'type1' | 'type2' | 'gestational' | 'other';      // 'other' = another type, or not sure
export type Therapy = 'none' | 'nonInsulin' | 'insulinInjections' | 'pump';
export type AgeBand = 'under18' | '18to24' | '25to64' | '65plus';
export type YesNoUnsure = 'yes' | 'no' | 'unsure';

/** The owner's result order. Index = render order. */
export const RESULT_GROUPS = [
  'nihb', 'vac', 'pump', 'cgm', 'supplies', 'pharmacare', 'privateFirst', 'dtcRdsp',
] as const;
export type ResultGroup = (typeof RESULT_GROUPS)[number];

/**
 * How the PROGRAM pays, from the program's own page — not how Liivv bills.
 * 'paid-to-you'     : a set amount goes to the person (ON ADP pump-supplies grant).
 * 'receipts'        : the person sends receipts (ON MFHP by mail; QC pump supplies to the CHU).
 * 'at-the-pharmacy' : the program is used at the pharmacy counter (MB MEPP, BC Plan NP, ON ODB).
 *                     NIHB moves here once F-24/F-25 are registered; until then it is 'unconfirmed'.
 * 'vendor'          : the program pays the vendor (NB IPP — the remaining cost is billed by the vendor;
 *                     BC pumps — PINs are for approved vendors submitting claims to PharmaCare).
 * 'tax'             : a tax credit or savings plan.
 * 'unconfirmed'     : the registered page does not say.
 */
export type ProgramPays = 'paid-to-you' | 'receipts' | 'at-the-pharmacy' | 'vendor' | 'tax' | 'unconfirmed';

export interface AppliesTo {
  types?: DiabetesType[];      // omitted = any
  therapies?: Therapy[];
  ages?: AgeBand[];
  /** Shown to a reader on insulin injections as "if you are considering a pump". */
  alsoIfConsideringPump?: boolean;
}

export interface ProgramMeta {
  id: string;
  jurisdiction: Jurisdiction;
  groups: ResultGroup[];
  /** Legal program name. Never translated. */
  programName: string;
  /** Official French name, only where the jurisdiction publishes one. Empty until recorded (D-9). */
  programNameFr: string;
  /** Registered SourceIds; the first one is the card's link. */
  sources: [SourceId, ...SourceId[]];
  pays: ProgramPays;
  appliesTo: AppliesTo;
  /** ISO date the row was last checked against sources[0]. */
  verifiedOn: string;
  /** Research marked this row P: render "Partly confirmed — check with the program". */
  confirm: boolean;
  /** Message keys under DiabetesCare.funding.programs.<id> that exist. */
  has: { covered: true; who: boolean; howToApply: boolean; notes: boolean };
}

export interface CheckerInput {
  province: ProvinceCode | '';
  type: DiabetesType | '';
  therapy: Therapy | '';
  age: AgeBand | '';
  indigenous: YesNoUnsure | '';
  veteran: YesNoUnsure | '';
  privateInsurance: YesNoUnsure | '';
}

export interface ResultCard {
  id: string;
  group: ResultGroup | 'liivv';
  title: string;
  body: string;
  linkLabel: string;
  linkUrl: string;
  verifiedOn?: string;
  confirm?: boolean;
  tone: 'primary' | 'supporting' | 'caution';
}
```

### A.4 Data (`funding-meta.ts`)

```ts
const CHECKED = '2026-10-05';
/** Re-verify every quarter (plan: "Data and upkeep"). */
export const NEXT_CHECK = '2027-01-05';

export const PROGRAM_META: ProgramMeta[] = [
  /* ---------- 1 · NIHB ---------- */
  { id: 'fed-nihb', jurisdiction: 'CA', groups: ['nihb'],
    programName: 'Non-Insured Health Benefits (NIHB)', programNameFr: '',
    sources: ['isc-nihb-updates'], pays: 'unconfirmed',   // "pharmacy benefits" needs F-24/F-25 (HELD E-22)
    appliesTo: {},
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false } },

  /* ---------- 2 · Veterans Affairs Canada ---------- */
  { id: 'fed-vac', jurisdiction: 'CA', groups: ['vac'],
    programName: 'Veterans Affairs Canada — continuous glucose monitors (type 1 diabetes), benefit 401140',
    programNameFr: '', sources: ['vac-cgm-type-1'], pays: 'unconfirmed',
    appliesTo: { types: ['type1'] },
    // The same 401140 rule is on the AB and MB grids (verify row 7). Once R-1 re-points
    // `vac-cgm-type-1` to the base URL: confirm → false and notes → false (HELD E-23).
    verifiedOn: CHECKED, confirm: true,
    has: { covered: true, who: true, howToApply: true, notes: true } },

  /* ---------- 3 · Pump programs ---------- */
  { id: 'on-adp-pump', jurisdiction: 'ON', groups: ['pump'],
    programName: 'Assistive Devices Program — insulin pumps and supplies', programNameFr: '',
    sources: ['on-adp-insulin-pumps', 'on-diabetes-equipment-and-supplies'], pays: 'paid-to-you',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true } },
  { id: 'bc-pharmacare-pumps', jurisdiction: 'BC', groups: ['pump'],
    programName: 'BC PharmaCare — insulin pumps', programNameFr: '',
    sources: ['bc-diabetes-pins'], pays: 'vendor', // "PINs are provided for use by approved vendors submitting claims to PharmaCare"
    appliesTo: { therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED, confirm: true,            // which plan pays and who qualifies are not on the page read
    has: { covered: true, who: false, howToApply: true, notes: true } },
  { id: 'sk-pump', jurisdiction: 'SK', groups: ['pump'],
    programName: 'Saskatchewan Insulin Pump Program', programNameFr: '',
    sources: ['sk-insulin-pump-program'], pays: 'unconfirmed',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false } },
  { id: 'mb-pump', jurisdiction: 'MB', groups: ['pump'],
    programName: 'Manitoba Adult Insulin Pump Coverage Program (MAIPCP)', programNameFr: '',
    sources: ['mb-shared-health-diabetes-care', 'mb-pharmacare-mepp'], pays: 'unconfirmed',  // MEPP page: "no cost coverage"
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true } },
  { id: 'qc-pump', jurisdiction: 'QC', groups: ['pump'],
    programName: 'Insulin Pump Access Program', programNameFr: 'Programme d’accès aux pompes à insuline',  // printed on the page
    sources: ['qc-insulin-pump-access-program'], pays: 'receipts',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED, confirm: true,            // page last updated 2021-02-19 (stale; look for a newer RAMQ/MSSS page, D-19)
    has: { covered: true, who: true, howToApply: true, notes: true } },
  { id: 'nb-ipp', jurisdiction: 'NB', groups: ['pump', 'cgm', 'privateFirst'],
    programName: 'New Brunswick Insulin Pump Program (IPP)', programNameFr: '',
    sources: ['nb-insulin-pump-program'], pays: 'vendor',   // "Remaining costs are billed to the province by the vendor" (on the page itself)
    appliesTo: { therapies: ['insulinInjections', 'pump'] },   // pump: type 1; sensors: type 1, or type 2 on 3+ injections — stated in `who`
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true } },
  { id: 'ns-ipp', jurisdiction: 'NS', groups: ['pump', 'privateFirst'],
    programName: 'Nova Scotia Insulin Pump Program', programNameFr: '',
    sources: ['ns-insulin-pump-program'], pays: 'unconfirmed',
    appliesTo: { types: ['type1'], therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: true } },
  { id: 'nl-pump', jurisdiction: 'NL', groups: ['pump'],
    programName: 'Newfoundland and Labrador Insulin Pump Program', programNameFr: '',
    sources: ['nl-cgm-program-2025'], pays: 'unconfirmed',
    appliesTo: { therapies: ['pump'], alsoIfConsideringPump: true },
    verifiedOn: CHECKED, confirm: true,            // only its income test is on a registered page
    has: { covered: true, who: false, howToApply: false, notes: false } },

  /* ---------- 4 · CGM programs ---------- */
  { id: 'on-adp-cgm', jurisdiction: 'ON', groups: ['cgm'],
    programName: 'Assistive Devices Program — real-time continuous glucose monitoring', programNameFr: '',
    sources: ['on-diabetes-equipment-and-supplies', 'on-adp-insulin-pumps'], pays: 'vendor',   // through a registered vendor (verify P1)
    appliesTo: { types: ['type1'], therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false } },
  { id: 'bc-cgm', jurisdiction: 'BC', groups: ['cgm'],
    programName: 'BC PharmaCare — glucose monitoring devices', programNameFr: '',
    sources: ['bc-diabetes-pins'], pays: 'unconfirmed',
    appliesTo: { therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED, confirm: true,            // who qualifies for Special Authority is not on the page read
    has: { covered: true, who: false, howToApply: true, notes: false } },
  { id: 'mb-cgm', jurisdiction: 'MB', groups: ['cgm'],
    programName: 'Manitoba Pharmacare — continuous and flash glucose monitors', programNameFr: '',
    sources: ['mb-shared-health-diabetes-care', 'mb-pharmacare-mepp'], pays: 'unconfirmed',
    appliesTo: { types: ['type1', 'type2'], therapies: ['insulinInjections', 'pump'] },
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false } },
  /* nb-ipp (above) also renders in 'cgm'. */
  { id: 'nl-cgm', jurisdiction: 'NL', groups: ['cgm'],
    programName: 'Provincial Continuous Glucose Monitoring Program', programNameFr: '',
    sources: ['nl-cgm-program-2025'], pays: 'unconfirmed',
    appliesTo: { types: ['type1'] },               // + 'gestational' once R-3 is registered (HELD E-25)
    verifiedOn: CHECKED, confirm: true,            // only source is a pre-launch news release (May 2025); program page not found (D-20)
    has: { covered: true, who: true, howToApply: false, notes: true } },

  /* ---------- 5 · Strips and supplies ---------- */
  { id: 'on-odb-strips', jurisdiction: 'ON', groups: ['supplies'],
    programName: 'Ontario Drug Benefit — blood glucose test strips', programNameFr: '',
    sources: ['on-odb-coverage'], pays: 'at-the-pharmacy',
    appliesTo: { types: ['type1', 'type2', 'other'] },
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: false } },
  { id: 'on-mfhp', jurisdiction: 'ON', groups: ['supplies'],
    programName: 'Monitoring for Health Program', programNameFr: '',
    sources: ['dc-ontario-monitoring-for-health', 'on-preventing-and-living-with-diabetes'], pays: 'receipts',
    appliesTo: { therapies: ['insulinInjections', 'pump'] },   // OR type === 'gestational' (special-cased in A.5)
    // Amounts released from E-3: they are on on-preventing-and-living-with-diabetes (verify row 40).
    // confirm stays true: the age rule for the 2026–27 program year is not stated (HELD E-24, D-21).
    verifiedOn: CHECKED, confirm: true,
    has: { covered: true, who: true, howToApply: true, notes: false } },
  { id: 'on-adp-seniors', jurisdiction: 'ON', groups: ['supplies'],
    programName: 'Assistive Devices Program — syringes and needles for seniors', programNameFr: '',
    sources: ['on-diabetes-equipment-and-supplies'], pays: 'paid-to-you',   // direct deposit or cheque
    appliesTo: { ages: ['65plus'], therapies: ['insulinInjections'] },     // daily insulin and living at home: stated in `who`
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false } },
  { id: 'bc-np-supplies', jurisdiction: 'BC', groups: ['supplies'],
    programName: 'BC PharmaCare — diabetes supplies', programNameFr: '',
    sources: ['bc-national-pharmacare', 'bc-diabetes-pins'], pays: 'unconfirmed', appliesTo: {},
    verifiedOn: CHECKED, confirm: true,            // quantities from a third-party page: held E-9
    has: { covered: true, who: false, howToApply: false, notes: false } },
  { id: 'nt-ehb', jurisdiction: 'NT', groups: ['supplies'],
    programName: 'Extended Health Benefits', programNameFr: '',
    sources: ['nt-extended-health-benefits'], pays: 'unconfirmed', appliesTo: {},
    verifiedOn: CHECKED, confirm: true,            // device coverage unverified
    has: { covered: true, who: false, howToApply: false, notes: false } },

  /* ---------- 6 · National pharmacare (MB, BC, PEI, YT) ---------- */
  { id: 'mb-mepp', jurisdiction: 'MB', groups: ['pharmacare'],
    programName: 'Manitoba Enhanced Pharmacare Program (MEPP)', programNameFr: '',
    sources: ['mb-pharmacare-mepp', 'hc-pharmacare-bilateral-agreements'], pays: 'at-the-pharmacy',
    appliesTo: { therapies: ['nonInsulin', 'insulinInjections', 'pump'] },
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: false, howToApply: true, notes: true } },
  { id: 'bc-plan-np', jurisdiction: 'BC', groups: ['pharmacare'],
    programName: 'PharmaCare Plan NP (national pharmacare)', programNameFr: '',
    sources: ['bc-national-pharmacare', 'hc-pharmacare-bilateral-agreements'], pays: 'at-the-pharmacy',
    appliesTo: {},
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: false } },
  { id: 'pe-pharmacare', jurisdiction: 'PE', groups: ['pharmacare'],
    programName: 'National pharmacare — Prince Edward Island agreement', programNameFr: '',
    sources: ['hc-pharmacare-bilateral-agreements'], pays: 'unconfirmed', appliesTo: {},
    verifiedOn: CHECKED, confirm: true,            // PEI's own pages blocked; details held E-10
    has: { covered: true, who: false, howToApply: false, notes: false } },
  { id: 'yt-pharmacare', jurisdiction: 'YT', groups: ['pharmacare'],
    programName: 'National pharmacare — Yukon agreement', programNameFr: '',
    sources: ['hc-pharmacare-bilateral-agreements'], pays: 'unconfirmed', appliesTo: {},
    verifiedOn: CHECKED, confirm: true,            // device stream held E-12
    has: { covered: true, who: false, howToApply: false, notes: false } },
  { id: 'fed-pharmacare', jurisdiction: 'CA', groups: ['pharmacare'],
    programName: 'Pharmacare Act', programNameFr: '',
    sources: ['parl-bill-c64-pharmacare', 'hc-pharmacare-bilateral-agreements', 'hc-diabetes-device-fund-2024'],
    pays: 'unconfirmed', appliesTo: {},
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: false, howToApply: false, notes: true } },

  /* ---------- 7 · Private insurance first (NB, NS) — rows nb-ipp and ns-ipp render here too ---------- */

  /* ---------- 8 · DTC and RDSP ---------- */
  { id: 'fed-dtc', jurisdiction: 'CA', groups: ['dtcRdsp'],
    programName: 'Disability tax credit', programNameFr: '',
    sources: ['cra-dtc-life-sustaining-therapy', 'cra-rc4064-2025'], pays: 'tax', appliesTo: {},
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: true, notes: false } },
  { id: 'fed-rdsp', jurisdiction: 'CA', groups: ['dtcRdsp'],
    programName: 'Registered Disability Savings Plan (RDSP)', programNameFr: '',
    sources: ['esdc-rdsp-apply'], pays: 'tax', appliesTo: {},
    verifiedOn: CHECKED, confirm: false,
    has: { covered: true, who: true, howToApply: false, notes: false } },
];

/**
 * Rows that render under 'privateFirst' when privateInsurance is yes or unsure. AB joins once E-6 clears
 * (F-10; Alberta's payer-of-last-resort rule took effect 2026-10-01). Every other province gets the
 * generic, claim-free `ui.fundingResults.privateFirstGenericBody` (verify P4.5).
 */
export const PRIVATE_FIRST: Partial<Record<ProvinceCode, string>> = { NB: 'nb-ipp', NS: 'ns-ipp' };

/** Where Liivv has a Bayshore pharmacy (owner, 2026-10-05). Not a billing claim. */
export const LIIVV_PHARMACY: Record<ProvinceCode, boolean> = {
  BC: true, AB: true, SK: true, MB: true, ON: true, NB: true, NS: true, PE: true, NL: true,
  QC: false, YT: false, NT: false, NU: false,
};

/*
 * Programs Liivv bills directly. The owner lists a program here only once
 * Liivv is enrolled with it; none is confirmed, so the list is empty and the
 * page shows `ui.fundingPage.directEmpty`. Quebec can never appear: RAMQ pays
 * only Quebec pharmacies and Liivv has none there.
 */
export interface DirectBillingEntry {
  programId: string;              // a PROGRAM_META id, or a payer id once the payer table exists (NIHB, Medavie, TELUS…)
  province: ProvinceCode | 'CA';
  pharmacy: string;               // the Liivv pharmacy enrolled (from pharmacy-fax.ts once real details land)
  enrolledOn: string;             // ISO date the owner confirmed enrolment
}
export const DIRECT_BILLING: DirectBillingEntry[] = [];

/* Proposed program only (plan, "Proposed program: pay-later"). Nothing renders and no copy exists. */
export const PAY_LATER = { enabled: false } as const;
```

**Held rows (E):** each one gets an entry here once its SourceId is registered. Until then, the group falls back to `noConfirmed`. The held rows are:
- `ab-iptp`
- `ab-cgm`
- `ab-last-resort`
- `sk-cgm`
- `on-odb-cgm`
- `qc-cgm`
- `ns-sbgm`
- `pe-ipp`
- `pe-gsp`
- `pe-strips`
- `nl-strips`
- `yt-devices`
- `nu-ehb`
- `fed-medical-expenses`

Held lines inside rows that do render (E-22 to E-27) keep the row; only the line waits.

### A.5 Checker logic (`buildResults`, pure)

```ts
/*
 * Province alone is enough to render (Ostomy rule). Every other answer narrows
 * or re-tones; an unanswered or 'unsure' answer never hides a card.
 */
function matches(rule: AppliesTo, input: CheckerInput): 'yes' | 'maybe' | 'no' {
  const t = input.type, th = input.therapy, a = input.age;
  if (rule.ages && a && !rule.ages.includes(a)) return 'no';
  if (rule.therapies && th && !rule.therapies.includes(th)) {
    if (rule.alsoIfConsideringPump && th === 'insulinInjections') return 'maybe';
    return 'no';
  }
  if (rule.types && t) {
    if (t === 'other') return 'maybe';            // e.g. LADA, type 3c: the `who` line says who qualifies
    if (!rule.types.includes(t)) return 'no';
  }
  return 'yes';
}

export function buildResults(input, programs, copy): ResultCard[] {
  if (!input.province) return [];
  const p = input.province;
  const out: ResultCard[] = [];
  const inJurisdiction = (m) => m.jurisdiction === p;

  // Liivv notes first where Liivv has no pharmacy (Quebec, territories).
  if (p === 'QC') out.push(copy.quebecCard);                 // tone 'caution'
  if (p === 'YT' || p === 'NT' || p === 'NU') out.push(copy.territoryCard);

  for (const group of RESULT_GROUPS) {
    switch (group) {
      case 'nihb':                                            // 1
        if (input.indigenous === 'yes' || input.indigenous === 'unsure')
          out.push(card('fed-nihb', input.indigenous === 'yes' ? 'primary' : 'supporting'));
        break;
      case 'vac':                                             // 2
        if (input.veteran === 'yes' || input.veteran === 'unsure')
          out.push(input.type && input.type !== 'type1'
            ? copy.vacNotType1Card                            // 'caution': the benefit we confirmed is type 1 CGM
            : card('fed-vac', 'primary'));
        break;
      case 'pump': case 'cgm': case 'supplies': {             // 3, 4, 5
        if (group === 'cgm' && (input.therapy === 'none' || input.therapy === 'nonInsulin')) {
          out.push(copy.cgmInsulinOnlyCard);                  // 'supporting'
          break;
        }
        let rows = PROGRAM_META.filter(m => inJurisdiction(m) && m.groups.includes(group));
        // ON MFHP: insulin users OR gestational
        rows = rows.filter(m => m.id !== 'on-mfhp'
          || input.type === 'gestational' || matches(m.appliesTo, input) !== 'no');
        const shown = rows.map(m => [m, m.id === 'on-mfhp' && input.type === 'gestational'
          ? 'yes' : matches(m.appliesTo, input)] as const).filter(([, r]) => r !== 'no');
        if (!shown.length) out.push(copy.noConfirmed(group, p)); // 'supporting', links dc-comparisons-by-province
        for (const [m, r] of shown) {
          const c = card(m.id, r === 'yes' ? 'primary' : 'supporting');
          if (r === 'maybe' && group === 'pump' && input.therapy === 'insulinInjections') c.title = copy.consideringPump(c.title);
          if (m.id === 'qc-pump' && input.age && input.age !== 'under18') c.tone = 'caution';   // must join before 18
          out.push(c);
        }
        break;
      }
      case 'pharmacare': {                                    // 6
        const own = PROGRAM_META.find(m => inJurisdiction(m) && m.groups.includes('pharmacare'));
        out.push(own ? card(own.id, 'primary') : copy.notSignedCard(p));  // notSigned links fed-pharmacare's sources
        break;
      }
      case 'privateFirst':                                    // 7
        if (input.privateInsurance === 'yes' || input.privateInsurance === 'unsure')
          out.push(PRIVATE_FIRST[p]
            ? copy.privateFirstCard(p)                        // 'caution'; body = funding.privateFirst.<p>
            : copy.privateFirstGenericCard);                  // 'supporting'; advice only, no program claim
        break;
      case 'dtcRdsp':                                         // 8
        out.push(copy.dtcCard(input.type, input.therapy));     // body variant: type1 | insulin | other
        out.push(card('fed-rdsp', 'supporting'));
        break;
    }
  }
  out.push(copy.askUsCard);                                   // 'liivv' group: you pay for your order; no claim route promised; "ask us"
  return out;
}
```

**Rendering rules carried over from Ostomy:**
- `verifiedOn` renders on every program card.
- `confirm: true` adds `ui.fundingChecker.confirm` under it.
- The progress bar counts 6 optional answers. Province is the one required answer.
- No input is saved or sent by the checker code. The reader can start over. Before the page says so in copy (`toolIntro`, HELD E-26), engineering confirms that no analytics or event capture records the checker inputs, which include health and Indigenous or veteran status (verify P3).

**Age bands, and where they straddle:**
- OHIP+ is "24 and under", which matches the 18–24 band exactly.
- The Saskatchewan sensor rule is "18–25". It is held anyway (E-7). When it lands, the card shows for 18–24, and for 25–64 with its age line visible.
- The bands live in one array, so a fifth band can be added without touching the rules.

---

## B) EN MESSAGES

These merge into `core/messages/en.json` under the existing `DiabetesCare` namespace.
- `funding` is new.
- `ui.fundingPage`, `ui.fundingChecker` and `ui.fundingResults` are new siblings of `ui.chapter`.

Program names are not in this tree (A.4).

```json
{
  "DiabetesCare": {
    "funding": {
      "provinceLabels": {
        "BC": "British Columbia",
        "AB": "Alberta",
        "SK": "Saskatchewan",
        "MB": "Manitoba",
        "ON": "Ontario",
        "QC": "Quebec",
        "NB": "New Brunswick",
        "NS": "Nova Scotia",
        "PE": "Prince Edward Island",
        "NL": "Newfoundland and Labrador",
        "YT": "Yukon",
        "NT": "Northwest Territories",
        "NU": "Nunavut"
      },
      "options": {
        "type": {
          "type1": "Type 1",
          "type2": "Type 2",
          "gestational": "Gestational diabetes",
          "other": "Another type, or not sure"
        },
        "therapy": {
          "none": "No diabetes medicine",
          "nonInsulin": "Tablets, or injections that aren’t insulin",
          "insulinInjections": "Insulin injections or pens",
          "pump": "An insulin pump"
        },
        "age": {
          "under18": "Under 18",
          "18to24": "18 to 24",
          "25to64": "25 to 64",
          "65plus": "65 or over"
        }
      },
      "groups": {
        "nihb": "Non-Insured Health Benefits",
        "vac": "Veterans Affairs Canada",
        "pump": "Insulin pump programs",
        "cgm": "Glucose sensor (CGM) programs",
        "supplies": "Test strips and supplies",
        "pharmacare": "National pharmacare",
        "privateFirst": "When private insurance pays first",
        "dtcRdsp": "Tax credit and savings"
      },
      "programs": {
        "fed-nihb": {
          "covered": "NIHB continues to cover these glucose sensors (CGM) for clients who manage their diabetes with insulin: FreeStyle Libre 2, Dexcom G6 and G7, and Guardian Connect. FreeStyle Libre 3 with prior approval, at one reader every 3 years and 14 sensors every 6 months. Guardian 4, as a limited use benefit with prior approval, for people with type 1 aged 19 or under on intensive insulin who use a MiniMed 780G. If you use insulin, test strips up to 800 every 100 days.",
          "who": "If you’re First Nations or Inuit, ask your pharmacy whether NIHB covers you.",
          "howToApply": "Some items need prior approval first. Ask your pharmacy which ones apply to you before you order."
        },
        "fed-vac": {
          "covered": "A continuous glucose monitor for type 1 diabetes, under benefit code 401140, once every 5 calendar years, with a prescription from a doctor or nurse practitioner. A replacement device doesn’t need a new prescription.",
          "who": "If you’re a Veterans Affairs Canada client with type 1 diabetes, this benefit may cover you. Ask Veterans Affairs Canada whether it applies to you.",
          "howToApply": "It needs pre-authorization, so get that before you buy.",
          "notes": "The page we link to is the Northwest Territories version of this benefit. Check with Veterans Affairs Canada that the same rule applies where you live."
        },
        "on-adp-pump": {
          "covered": "100% of the ADP price of an insulin pump. For pump supplies, up to $2,400 a year, paid to you as $600 every 3 months.",
          "who": "People with type 1 diabetes who meet the program’s medical criteria. It isn’t based on income. If WSIB or Veterans Affairs Canada already pays for the same items, ADP doesn’t.",
          "howToApply": "An ADP-registered diabetes education program assesses you, and an ADP-registered vendor sends in the application. You get a decision within 8 weeks, and the first $600 is sent within 30 days of approval. Renew pump supplies every year.",
          "notes": "After the 5-year warranty, a worn-out pump can be replaced; ADP asks for a repair quote. A replacement is also covered if your medical needs have changed."
        },
        "bc-pharmacare-pumps": {
          "covered": "PharmaCare’s list of diabetes devices includes the MiniMed 670G, 770G and 780G, Omnipod DASH, Omnipod 5 and the mylife YpsoPump. Approved vendors use this list to claim from PharmaCare.",
          "howToApply": "Ask your diabetes team or PharmaCare which plan covers your pump and what you need to apply.",
          "notes": "Tandem pump supplies, such as t:slim cartridges and AutoSoft, TruSteel and VariSoft infusion sets, are on the list, but no Tandem pump was when we checked. Ask PharmaCare before you plan around a new pump."
        },
        "sk-pump": {
          "covered": "A $6,300 grant toward one insulin pump every 5 years. Pump supplies follow your Drug Plan coverage, so deductibles and co-payments apply.",
          "who": "People with type 1 diabetes who would benefit from a pump and meet the program’s criteria.",
          "howToApply": "A Saskatchewan Health Authority diabetes education program, or an authorized diabetes specialist physician, sends in the application. For children, it goes through the Saskatchewan Health Authority’s pediatric diabetes education program, after an information session or an online module."
        },
        "mb-pump": {
          "covered": "Insulin pumps from Omnipod, Tandem, Medtronic and Ypsomed, at no cost.",
          "who": "Adults 18 and over with type 1 diabetes.",
          "howToApply": "An endocrinologist or an approved diabetes specialist assesses you and sends a form to Manitoba Health.",
          "notes": "Children have a separate program. Ask your child’s diabetes team about it."
        },
        "qc-pump": {
          "covered": "Up to $6,300 toward a pump every 5 years, and up to $4,000 a year for pump supplies.",
          "who": "You have to join before you turn 18. You can stay in after 18, with a review each year. Adults diagnosed later can’t join.",
          "howToApply": "For supplies, send your original receipts or insurance statements to the program’s paying agent, the CHU de Québec – Université Laval. With some companies you don’t pay for supplies at all, because the CHU refunds the company directly.",
          "notes": "The program’s page was last updated on February 19, 2021, so check the current amounts with the program."
        },
        "nb-ipp": {
          "covered": "Insulin pumps, pump supplies and glucose sensors (CGM), for the part that isn’t covered by other insurance.",
          "who": "Pumps: type 1, at any age. Sensors: type 1, or type 2 with 3 or more insulin injections a day. It’s based on income, and private insurance has to be used first. If your insurance already covers 100% of the cost, you can’t join.",
          "howToApply": "An endocrinologist, internist or pediatrician confirms you meet the medical criteria, then you apply online. You pay your share to the vendor, and the vendor bills the province for the rest.",
          "notes": "Insulin, test strips and batteries aren’t covered by this program."
        },
        "ns-ipp": {
          "covered": "One insulin pump every 5 years (Tandem, Medtronic or Insulet), plus pump supplies. You pay a yearly share based on your income and family size, with no premiums or deductibles.",
          "who": "People with type 1 diabetes, diagnosed at least 4 months ago.",
          "howToApply": "Renew between January 1 and March 31 every year.",
          "notes": "Glucose sensors aren’t part of this program. Nova Scotia has a separate Sensor-based Glucose Monitoring Program, so ask about that one."
        },
        "nl-pump": {
          "covered": "Newfoundland and Labrador has a provincial insulin pump program with an income test. We haven’t confirmed the rest of its details on an official page, so check with the program."
        },
        "on-adp-cgm": {
          "covered": "Full coverage of real-time CGM sensors and transmitters, and in some cases a receiver, up to a set quantity every 2 years.",
          "who": "People with type 1 diabetes who meet the program’s criteria.",
          "howToApply": "Your diabetes education program can tell you whether you meet the criteria. Coverage is renewed every 2 years."
        },
        "bc-cgm": {
          "covered": "Dexcom G6 and G7, FreeStyle Libre 2 and FreeStyle Libre 3 Plus are on PharmaCare’s list of diabetes devices. All of them need Special Authority before PharmaCare will cover them.",
          "howToApply": "Ask your diabetes team or pharmacist about Special Authority before you order."
        },
        "mb-cgm": {
          "covered": "Continuous and flash glucose monitors, through regular Pharmacare. Your Pharmacare deductible applies.",
          "who": "Type 1 or type 2 diabetes managed with several insulin injections a day (basal-bolus) or an insulin pump.",
          "howToApply": "You don’t need a prescription or a special application."
        },
        "nl-cgm": {
          "covered": "Full or partial coverage of glucose sensors (CGM).",
          "who": "In May 2025, the province announced that from fall 2025 the program would be open to everyone with type 1 diabetes who meets its medical and income criteria.",
          "notes": "The program started in 2023 for children with type 1. In 2024 it grew to include young people up to age 24, and pregnancy and gestational diabetes. Ask the program what it covers for you now."
        },
        "on-odb-strips": {
          "covered": "Test strips each year: 3,000 if you use insulin; 400 if you take a diabetes medicine with a higher risk of lows; 200 with a lower-risk medicine; 200 if you manage with diet and lifestyle alone. More needs a reason from your doctor or nurse practitioner.",
          "who": "People covered by the Ontario Drug Benefit. That includes people 65 and over, and people 24 and under with no private plan (OHIP+)."
        },
        "on-mfhp": {
          "covered": "75% of the cost of a blood glucose meter, up to $75 once every 5 years, and 75% of the cost of test strips and lancets, up to $920 a year. For a talking meter, up to $300 once every 5 years.",
          "who": "People who use insulin (type 1 or type 2), and people with gestational diabetes, who have no other coverage for these supplies. If your strips are covered another way, ask the program what you can still claim.",
          "howToApply": "Diabetes Canada runs this program for Ontario. Mail in the claim form with your original receipts. Processing takes about 8 weeks."
        },
        "on-adp-seniors": {
          "covered": "$170 a year toward insulin syringes and needles.",
          "who": "People 65 and over who need insulin every day and live at home.",
          "howToApply": "Buy them from any retailer in Ontario that sells them. Renew every 2 years. ADP pays you by direct deposit or cheque."
        },
        "bc-np-supplies": {
          "covered": "Wider coverage of diabetes devices and supplies began on April 1, 2026, paid for with national pharmacare funding. Check with PharmaCare what it covers for you."
        },
        "nt-ehb": {
          "covered": "Since April 1, 2024, Extended Health Benefits are based on income rather than on a list of diseases. We haven’t confirmed on an official page how they cover diabetes devices and supplies, so ask the program."
        },
        "mb-mepp": {
          "covered": "Since April 15, 2025, most diabetes medicines at no cost and with no deductible. Ozempic isn’t included.",
          "howToApply": "Bring your prescription and your Manitoba Health card to any Manitoba pharmacy.",
          "notes": "Pumps, glucose sensors, test strips, syringes and lancets aren’t part of it. Glucose sensors and supplies are covered under regular Pharmacare, where your deductible applies. Adult insulin pumps are covered at no cost by a separate program, shown under pump programs."
        },
        "bc-plan-np": {
          "covered": "Since March 1, 2026, insulin and a set list of other diabetes medicines at no cost. A few others need Special Authority. Wider coverage of devices and supplies began on April 1, 2026.",
          "who": "It’s automatic if you’re enrolled in MSP."
        },
        "pe-pharmacare": {
          "covered": "Prince Edward Island signed a national pharmacare agreement with the federal government on March 7, 2025. We haven’t confirmed PEI’s diabetes details on an official page yet, so check with PEI Pharmacare."
        },
        "yt-pharmacare": {
          "covered": "Yukon signed a national pharmacare agreement with the federal government on March 20, 2025. We haven’t confirmed Yukon’s diabetes details on an official page yet, so check with the program."
        },
        "fed-pharmacare": {
          "covered": "The Pharmacare Act became law on October 10, 2024. Each province and territory has to sign its own agreement before anything changes where you live.",
          "notes": "The federal government also announced a Diabetes Device Fund for devices and supplies in February 2024. The announcement said its details would follow discussions with the provinces and territories. We haven’t found an official page that says how to use it."
        },
        "fed-dtc": {
          "covered": "A tax credit for people whose impairment meets the CRA’s test. For diabetes, the usual route is life-sustaining therapy.",
          "who": "If you have type 1, the CRA treats you as meeting the life-sustaining therapy test, from 2021 on. Otherwise, the therapy has to be needed at least 2 times a week, for an average of at least 14 hours a week, and the need has to have lasted, or be expected to last, at least 12 months. Time your pump spends delivering insulin doesn’t count toward the 14 hours.",
          "howToApply": "Apply with form T2201. Even with type 1, you still have to apply."
        },
        "fed-rdsp": {
          "covered": "A long-term savings plan, with government grants and bonds.",
          "who": "You have to be approved for the Disability Tax Credit first, live in Canada and have a Social Insurance Number. You can open a plan until December 31 of the year you turn 59. Grants and bonds are paid only until the year you turn 49."
        }
      },
      "privateFirst": {
        "NB": "New Brunswick’s Insulin Pump Program covers only the part other insurance doesn’t, so your private plan pays first.",
        "NS": "Nova Scotia’s Insulin Pump Program pays after any other coverage you have, so your private plan pays first."
      },
      "liivv": {
        "pharmacies": "Liivv has a Bayshore pharmacy in every province except Quebec. There are none in the territories.",
        "askUsTitle": "Can we bill your program for you?",
        "askUsBody": "We list a program as billed directly only once we’re set up with it, and none is listed yet. For now, you pay for your order yourself. Some programs pay you back from a receipt, and others pay only the pharmacy or supplier directly. Ask us before you order and we’ll tell you where things stand.",
        "askUsCta": "Request a call",
        "quebecTitle": "Liivv doesn’t have a pharmacy in Quebec",
        "quebecBody": "If you order from us, you pay for your order yourself. For pump supplies, the Insulin Pump Access Program takes receipts, as shown below. For anything else, check with your plan before you order that it will pay you back for a purchase from outside Quebec.",
        "territoryTitle": "Liivv doesn’t have a pharmacy in the territories",
        "territoryBody": "If you order from us, you pay for your order yourself. Check with your program that it will take your receipt before you order."
      },
      "governance": {
        "disclaimer": "This is general information, not medical or financial advice. It isn’t a substitute for care from your diabetes team, doctor or pharmacist, and it doesn’t tell you which device or medicine to use. Programs change their amounts and rules often, so check the official page or ask the program before you plan around a number."
      }
    },
    "ui": {
      "fundingPage": {
        "kicker": "Diabetes Care · Money",
        "title": "What your province covers for diabetes",
        "lead": "Help with the cost of pumps, sensors, strips and medicines depends on where you live, your type of diabetes and how you manage it. Start with your province, then add what applies to you.",
        "ctaFind": "Find your coverage",
        "ctaFederal": "Federal programs and tax credits",
        "focus": "Pump and sensor programs, test strips and supplies, national pharmacare, federal programs, and the Disability Tax Credit.",
        "vibe": "Plain and specific. Every program links to the official page it came from, with the date we last checked it.",
        "payingEyebrow": "Start here",
        "payingHeading": "How paying works",
        "payingIntro": "Some programs pay a pharmacy or a supplier. Others pay you back, or pay you a set amount. Here’s how that works when you order from us.",
        "directHeading": "Programs we bill directly",
        "directBody": "We list a program here only once we’re set up to bill it for you.",
        "directEmpty": "None is listed yet. Some programs pay you back from a receipt, and others pay only the pharmacy or supplier directly. Check how yours pays before you order, or ask us.",
        "claimHeading": "When you pay for your order yourself",
        "claimBody": "Some programs pay you back when you send them a receipt. Some pay you a set amount instead: Ontario’s Assistive Devices Program pays up to $2,400 a year toward pump supplies, sent to you as $600 every 3 months, and you buy the supplies yourself. Others pay only a pharmacy or supplier directly, so a receipt from us won’t work for them.",
        "claimCheck": "Before you order, check that your program will take a receipt from you. Or ask us.",
        "toolEyebrow": "Your situation",
        "toolHeading": "Find what applies to you",
        "toolIntro": "Only where you live is needed. Answer the rest if you’re comfortable, and each answer narrows the list.",
        "federalEyebrow": "Federal",
        "federalHeading": "Help that doesn’t depend on where you live",
        "dtcHeading": "The Disability Tax Credit",
        "dtcNote": "Worth knowing about, because it also opens the door to the RDSP.",
        "rdspHeading": "Registered Disability Savings Plan",
        "nihbHeading": "Non-Insured Health Benefits",
        "vacHeading": "Veterans Affairs Canada",
        "pharmacareHeading": "National pharmacare",
        "pharmacareSigned": "As of the federal page we checked (last updated January 26, 2026), Manitoba, British Columbia, Prince Edward Island and Yukon had signed agreements. No other province or territory had.",
        "changesEyebrow": "What changed lately",
        "changesHeading": "Recent changes, with dates",
        "changes": {
          "1": "April 1, 2024: Northwest Territories Extended Health Benefits became based on income rather than on a list of diseases.",
          "2": "October 10, 2024: the federal Pharmacare Act became law.",
          "3": "February 27 to March 20, 2025: Manitoba, British Columbia, Prince Edward Island and Yukon signed national pharmacare agreements.",
          "4": "April 15, 2025: Manitoba made most diabetes medicines free, with no deductible.",
          "5": "September 2025: Non-Insured Health Benefits added FreeStyle Libre 3, with prior approval.",
          "6": "May 2025: Newfoundland and Labrador announced that its sensor program would open to everyone with type 1 who meets its criteria, from fall 2025.",
          "7": "March 1, 2026: British Columbia made insulin and a set list of diabetes medicines free. Wider device and supply coverage followed on April 1."
        },
        "whereEyebrow": "Quebec and the territories",
        "whereHeading": "Where Liivv doesn’t have a pharmacy",
        "whereBody": "Liivv has a Bayshore pharmacy in every province except Quebec, and none in the territories. If you live in Quebec, Yukon, the Northwest Territories or Nunavut and order from us, you pay for your order yourself. Check with your program that it will pay you back before you order.",
        "enoughEyebrow": "When it isn’t enough",
        "enoughHeading": "The coverage doesn’t cover it all",
        "enough1Heading": "Ask your diabetes education program",
        "enough1Body": "They know what gets approved locally, and they’re often the ones who fill in the forms. Diabetes education programs aren’t run by Liivv.",
        "enough2Heading": "Compare provinces with Diabetes Canada",
        "enough2Body": "Diabetes Canada publishes side-by-side comparisons of what each province and territory covers, and a report on diabetes out-of-pocket costs. The pump and glucose monitoring comparisons are from 2024, so some recent changes on this page aren’t in them.",
        "enough3Heading": "Ask a pharmacist CDE",
        "enough3Body": "For questions about pump and sensor supplies, Liivv’s pharmacist CDEs can help, wherever you are in Canada.",
        "movingEyebrow": "Moving",
        "movingHeading": "If you change provinces",
        "movingIntro": "Pump and sensor programs differ from province to province, and several need an assessment by a local diabetes program before they’ll cover anything.",
        "beforeHeading": "Before you go",
        "before1": "Send in any claims you still have with your current program.",
        "before2": "Ask your diabetes team for a written summary of your devices, supplies and settings.",
        "arriveHeading": "When you arrive",
        "arrive1": "Check your new province in the checker above.",
        "arrive2": "Find a diabetes education program early. Several programs need one to assess you before they’ll pay.",
        "cdeEyebrow": "Anywhere in Canada",
        "cdeHeading": "Questions about pump and sensor supplies",
        "cdeBody": "Liivv’s pharmacist CDEs answer pump and CGM questions for all of Canada, Monday to Friday, 9 a.m. to 5 p.m. Eastern, except holidays. When you need a pharmacy, they’ll pass you to the right Liivv pharmacy.",
        "cdeCta": "Request a call",
        "closingHeading": "Money shouldn’t be the reason you go without",
        "closingBody": "If the numbers aren’t working, tell your diabetes team. Your diabetes education program may know of routes this page doesn’t cover.",
        "closingCta": "Your Tools →",
        "metaTitle": "Diabetes funding in Canada: what your province covers | Liivv",
        "metaDescription": "Insulin pump and glucose sensor programs, test strips, national pharmacare, NIHB, Veterans Affairs and the Disability Tax Credit, province by province. Every program links to its official page."
      },
      "fundingChecker": {
        "formLabel": "Find what your province covers",
        "provinceLabel": "Where do you live?",
        "provinceHint": "Coverage changes completely at the provincial border, so this is the one answer we really need.",
        "provincePlaceholder": "Select a province or territory",
        "typeLegend": "What type of diabetes do you have?",
        "typeHint": "Several pump and sensor programs are for type 1 only.",
        "therapyLegend": "How do you manage it right now?",
        "therapyHint": "Most of the pump and sensor programs we found are for people who use insulin.",
        "ageLegend": "How old are you?",
        "ageHint": "Some programs depend on age, for example under 18, 24 and under, or 65 and over. If you’re asking for someone else, use their age.",
        "indigenousLegend": "Are you First Nations or Inuit?",
        "indigenousHint": "First Nations and Inuit may be covered by the federal Non-Insured Health Benefits program (NIHB).",
        "veteranLegend": "Are you a Veterans Affairs Canada client?",
        "veteranHint": "Veterans Affairs Canada has its own benefit for glucose sensors with type 1.",
        "privateLegend": "Do you have workplace or private insurance?",
        "privateHint": "Some programs pay only after private insurance has been used.",
        "yes": "Yes",
        "no": "No",
        "notSure": "Not sure",
        "startOver": "Start over",
        "empty": "Choose where you live and we’ll show the programs worth looking at, with a link to the official page for each one.",
        "verifiedOn": "Checked against the official page on {date}",
        "confirm": "Partly confirmed. Check with the program before you plan around it.",
        "caveat": "This is a starting point, not a decision. Programs change their amounts and rules often, so check the official page before you plan around a number. Your diabetes education program can often tell you what gets approved locally.",
        "progress": "{answered} of {total} answered",
        "narrowing": "Answer the rest to narrow this",
        "complete": "All answered"
      },
      "fundingResults": {
        "consideringPump": "If you’re thinking about a pump: {title}",
        "type1Only": "This program is for type 1. If your diabetes is a different type, or managed like type 1, ask your diabetes team whether it applies.",
        "noConfirmedTitle": "{group} in {province}: we’re still checking",
        "noConfirmedBody": "We haven’t finished checking this against an official {province} page, so we aren’t listing anything yet. That doesn’t mean nothing is covered. Ask your pharmacist or diabetes education program what’s covered now. Diabetes Canada’s comparisons by province may help, but they’re from 2024.",
        "noConfirmedLink": "Diabetes Canada: comparisons by province and territory (2024)",
        "cgmInsulinOnlyTitle": "Sensor programs are mostly for insulin users",
        "cgmInsulinOnlyBody": "The glucose sensor programs we found are for people who use insulin. If your treatment changes, come back and check again.",
        "vacNotType1Title": "Veterans Affairs Canada",
        "vacNotType1Body": "The Veterans Affairs Canada benefit we could confirm is for glucose sensors with type 1. Ask Veterans Affairs Canada what your benefits cover for your type of diabetes.",
        "notSignedTitle": "{province} hasn’t signed a national pharmacare agreement",
        "notSignedBody": "As of the federal page we checked (last updated January 26, 2026), only Manitoba, British Columbia, Prince Edward Island and Yukon had signed one. Your provincial drug plan still applies.",
        "privateFirstTitle": "Your private plan pays first",
        "privateFirstGenericTitle": "If you have private insurance",
        "privateFirstGenericBody": "Ask your insurer and your provincial program which one pays first, before you order.",
        "dtcType1Body": "With type 1, the CRA treats you as meeting the life-sustaining therapy test, from 2021 on. You still have to apply, with form T2201.",
        "dtcInsulinBody": "The life-sustaining therapy test asks whether therapy is needed at least 2 times a week, for an average of at least 14 hours a week, for at least 12 months. Time your pump spends delivering insulin doesn’t count. Apply with form T2201.",
        "dtcOtherBody": "For diabetes, the usual route is the life-sustaining therapy test: therapy needed at least 2 times a week, for an average of at least 14 hours a week, for at least 12 months. Apply with form T2201."
      }
    }
  }
}
```

---

## C) CLAIMS TABLE

Key paths are relative to `DiabetesCare`.

**What the Check column means:**
- **V n:** re-read on the live page on 2026-10-05 in `funding.verify.md`, claims-table row n. Where that row was Partly or Not confirmed, the sentence below is the corrected one.
- **L:** in the `sources-review.ts` locator.
- **O:** an owner fact (2026-10-05). It has no SourceId.
- **S:** a summary of sourced rows on this page. It makes no new fact.

Every V fact that the `sources-review.ts` locator doesn't yet record is listed in D-12. Extend the locator before publishing.

**Not listed:** UI strings, and advice that makes no factual claim. Examples: "Ask your diabetes team…", "Check with the program…", "Before you order, check…", `privateFirstGenericBody`, `toolIntro`, the moving and before/arrive lines.

| Key | Sentence (short) | SourceId | Fact on the source | Check |
|---|---|---|---|---|
| funding.programs.fed-nihb.covered | NIHB "continues to cover" Libre 2, Dexcom G6/G7, Guardian Connect for clients who manage with insulin | isc-nihb-updates | Same; for "clients managing diabetes with insulin" (page modified Jul 30, 2026). Open or limited-use status isn't stated, so none is implied | V 1 |
| ″ | Libre 3 with prior approval, 1 reader / 3 yrs, 14 sensors / 6 months | isc-nihb-updates | Added Sep 2025, same limits | V 2 |
| ″ | Guardian 4, limited use benefit with prior approval; type 1, ≤19, intensive insulin, MiniMed 780G | isc-nihb-updates | Added Dec 2024 | V 3 |
| ″ | Test strips up to 800 / 100 days, if you use insulin | isc-nihb-updates | "for insulin-managed diabetes" | V 4 |
| fed-nihb.howToApply | Some items need prior approval | isc-nihb-updates | Prior approval confirmed. "Pharmacy benefits" removed: HELD E-22 | V 5 |
| fed-vac.covered/howToApply | CGM type 1, benefit 401140, once per 5 calendar years, pre-authorization; NP or MD prescription, not needed for a replacement device | vac-cgm-type-1 | Same (NWT grid; the AB grid is identical, modified 2026-03-19) | V 6 |
| fed-vac.notes | The linked page is the NWT version | vac-cgm-type-1 | The registered href ends "-5" (NWT). Dropped once F-31 lands: HELD E-23 | V 7 |
| fed-vac.who | VAC clients with type 1 "may" be covered; ask VAC | vac-cgm-type-1 | The grid lists the benefit; it doesn't say every client qualifies | V 8 |
| on-adp-pump.covered | 100% ADP price; $2,400/yr as $600 every 3 months, paid to you | on-adp-insulin-pumps, on-diabetes-equipment-and-supplies | Same | V 9 |
| on-adp-pump.who | Type 1 meeting the medical criteria; not income-based; not if WSIB or VAC pays for the same items | on-adp-insulin-pumps | "type 1 diabetes with specific medical criteria"; WSIB/VAC exclusion | V 10 |
| on-adp-pump.howToApply | Registered DEP assesses; registered vendor applies; decision within 8 weeks; first $600 within 30 days of approval; renew supplies yearly | on-adp-insulin-pumps | Same (page updated Sep 15, 2026) | V 11 |
| on-adp-pump.notes | After the 5-year warranty a worn-out pump can be replaced, with a repair quote; also if medical needs changed | on-adp-insulin-pumps | Same. The old "lost or misused" line was cut (D-22) | V 12 |
| bc-pharmacare-pumps.covered | 670G/770G/780G, DASH, Omnipod 5, YpsoPump; approved vendors claim with the list | bc-diabetes-pins | "provided for use by approved vendors submitting claims to PharmaCare" (updated Sep 17, 2026). "Some need Special Authority" cut | V 14 |
| bc-pharmacare-pumps.notes | Tandem supplies (t:slim cartridges; AutoSoft, TruSteel, VariSoft sets) listed; no Tandem pump | bc-diabetes-pins | Same, re-checked Oct 5, 2026 (negative finding; recheck at publish) | V 15 |
| sk-pump.covered | $6,300 / 5 yrs; supplies follow Drug Plan coverage, deductibles and co-payments apply | sk-insulin-pump-program | Same | V 17, V 18 |
| sk-pump.who | Type 1, would benefit from a pump, meets the criteria | sk-insulin-pump-program | "would benefit from a pump"; SAIL criteria | V 17 |
| sk-pump.howToApply | SHA DEP or an authorized diabetes specialist physician submits; children via the SHA pediatric DEP after an information session or online module | sk-insulin-pump-program | Same | V 19 |
| mb-pump.covered | Omnipod, Tandem, Medtronic, Ypsomed; at no cost | mb-shared-health-diabetes-care, mb-pharmacare-mepp | Brands on Shared Health; the MEPP page calls MAIPCP "no cost coverage" | V 20, V 21 |
| mb-pump programName, who, howToApply | MAIPCP; adults 18+ with type 1; an endocrinologist or approved diabetes specialist assesses and sends a form to Manitoba Health | mb-shared-health-diabetes-care, mb-pharmacare-mepp | Same | V 20, V 21 |
| mb-pump.notes | Separate pediatric program | mb-shared-health-diabetes-care | Same | L |
| qc-pump.covered/who | $6,300 / 5 yrs; $4,000/yr supplies; join before 18, stay with a yearly review; adults can't join | qc-insulin-pump-access-program | Same (updated Feb 19, 2021: stale, `confirm: true`) | V 26 |
| qc-pump.howToApply | Original receipts or insurance statements to the CHU de Québec – Université Laval; some companies refunded directly | qc-insulin-pump-access-program | Same | V 27 |
| qc-pump.notes | Page last updated Feb 19, 2021 | qc-insulin-pump-access-program | Same | V 26 |
| qc-pump programNameFr | "Programme d’accès aux pompes à insuline" | qc-insulin-pump-access-program | Printed on the page | V 26 |
| nb-ipp.covered/who | Pumps, supplies, CGM, uninsured part; pumps type 1 any age; CGM type 1, or type 2 on 3+ injections; income-tested; private first; not if 100% insured | nb-insulin-pump-program | Same; "Applicants with 100% insurance coverage are NOT eligible" | V 28 |
| nb-ipp.howToApply | Endocrinologist, internist or pediatrician confirms, then apply online; co-pay to the vendor; the vendor bills the province | nb-insulin-pump-program | "Remaining costs are billed to the province by the vendor" (on the page itself) | V 28, V 29 |
| nb-ipp.notes | Insulin, strips and batteries not covered | nb-insulin-pump-program | Same | V 28 |
| ns-ipp.covered/who/howToApply | One pump / 5 yrs (Tandem, Medtronic, Insulet) + supplies; yearly share by income and family size, no premiums or deductibles; type 1 ≥4 months; renew Jan 1 to Mar 31 | ns-insulin-pump-program | Same | V 30 |
| ns-ipp.notes | CGM not covered by IPP; separate Sensor-based Glucose Monitoring Program | ns-insulin-pump-program | The page says so and points to it (its details stay HELD, E-13) | V 30 |
| funding.privateFirst.NS | Pays after other coverage | ns-insulin-pump-program | "You need to use any sources of insurance that you have … before the program can begin coverage" | V 31 |
| funding.privateFirst.NB | Covers only the uninsured part; private first | nb-insulin-pump-program | Same | V 32 |
| nl-pump.covered | NL has a provincial pump program with an income test | nl-cgm-program-2025 | Same | V 33 |
| on-adp-cgm.covered | Full coverage of rtCGM sensors and transmitters, a receiver in some cases, up to a set quantity every 2 years | on-diabetes-equipment-and-supplies, on-adp-insulin-pumps | "full coverage … up to a maximum allowable quantity per 24-month period" | V 13 |
| on-adp-cgm.who/howToApply | Type 1 meeting the criteria; renewed every 2 years | on-diabetes-equipment-and-supplies, on-adp-insulin-pumps | Same | V 13 |
| bc-cgm.covered | Dexcom G6/G7, Libre 2, Libre 3 Plus listed; all need Special Authority | bc-diabetes-pins | "Special Authority must be in place for anyone wanting PharmaCare coverage of a CGM" | V 16 |
| mb-cgm.* | CGM/flash via regular Pharmacare, deductible applies; type 1 or 2 on basal-bolus or a pump; no prescription or special application | mb-shared-health-diabetes-care, mb-pharmacare-mepp | Same | V 22 |
| nl-cgm.covered | Full or partial coverage | nl-cgm-program-2025 | "full or partial" | V 34 |
| nl-cgm.who | Announced May 2025: from fall 2025, all type 1 meeting the medical and income criteria | nl-cgm-program-2025 | Pre-launch release (May 22, 2025), so worded as an announcement. `confirm: true` until a program page is registered (D-20) | V 34 |
| nl-cgm.notes | 2023: children with type 1; 2024: up to 24, pregnancy, gestational | nl-cgm-program-2025 | Same | V 34 |
| on-odb-strips.covered | 3,000 / 400 / 200 / 200 a year; more needs a doctor's or NP's reason | on-odb-coverage | Same (updated Aug 18, 2026) | V 35 |
| on-odb-strips.who | ODB includes 65+ and 24-and-under with no private plan (OHIP+) | on-odb-coverage | Same | V 36 |
| on-mfhp.covered | Meter 75% up to $75 / 5 yrs; strips and lancets 75% up to $920 / yr; talking meter up to $300 / 5 yrs | on-preventing-and-living-with-diabetes | Same (updated Jun 8, 2026). Released from E-3 | V 40 |
| on-mfhp.who | Insulin users (type 1 or 2) and GDM, with no other coverage for supplies | dc-ontario-monitoring-for-health | Same (updated May 19, 2026). The age rule is HELD, E-24 | V 37, V 38 |
| on-mfhp.howToApply | Diabetes Canada runs it; mail the form with original receipts; about 8 weeks | dc-ontario-monitoring-for-health | Same | V 39 |
| on-adp-seniors.covered/who | $170/yr toward syringes and needles; 65+, need insulin every day, live at home | on-diabetes-equipment-and-supplies | "a senior (65+ years) who needs insulin every day and lives at home" | V 41 |
| on-adp-seniors.howToApply | Any retailer in Ontario; renew every 2 years; direct deposit or cheque | on-diabetes-equipment-and-supplies | Same. Whether a Liivv online order counts is D-4 | V 41, V 42 |
| bc-plan-np | Mar 1, 2026: insulin and a set list free; a few need Special Authority; Apr 1, 2026: wider devices and supplies; automatic with MSP | bc-national-pharmacare | Same (updated Jun 29, 2026) | V 43 |
| bc-np-supplies.covered | Wider devices and supplies from Apr 1, 2026, with national pharmacare funding | bc-national-pharmacare, bc-diabetes-pins | Same | V 44 |
| nt-ehb.covered | Since Apr 1, 2024, income-based, not a listed disease | nt-extended-health-benefits | Same | V 46 |
| mb-mepp.covered | Since Apr 15, 2025, most diabetes drugs free, no deductible; Ozempic excluded | mb-pharmacare-mepp | Same | V 23 |
| mb-mepp.howToApply | Prescription and Manitoba Health card at any Manitoba pharmacy | mb-pharmacare-mepp | A prescription for an eligible MEPP product is needed | V 24 |
| mb-mepp.notes | Devices and supplies not in MEPP; sensors and supplies under regular Pharmacare with the deductible; adult pumps at no cost under a separate program | mb-pharmacare-mepp | "AGM are eligible Manitoba Pharmacare Program benefits"; supplies "where deductibles apply"; MAIPCP "no cost coverage" | V 22, V 25 |
| pe-pharmacare / yt-pharmacare | PEI signed Mar 7, 2025; Yukon Mar 20, 2025 | hc-pharmacare-bilateral-agreements | Same (modified Jan 26, 2026; recheck at publish) | V 47 |
| fed-pharmacare.covered | Pharmacare Act law Oct 10, 2024 | parl-bill-c64-pharmacare | Royal Assent Oct 10, 2024 (S.C. 2024, c. 24) | V 49 |
| ″ | Each jurisdiction signs its own agreement | hc-pharmacare-bilateral-agreements | Bilateral agreements per jurisdiction | L (framing) |
| fed-pharmacare.notes | Device Fund announced Feb 2024; details to follow discussions with provinces and territories | hc-diabetes-device-fund-2024 | Feb 29, 2024 release: details after "discussions with PT partners" | V 50 |
| ui.fundingPage.pharmacareSigned, fundingResults.notSignedBody | Only MB, BC, PEI, YT signed; page last updated Jan 26, 2026 | hc-pharmacare-bilateral-agreements | Same | V 47 |
| ui.fundingResults.notSignedBody | "Your provincial drug plan still applies" | — | General; no program-specific claim | S (or cut, D-16) |
| fed-dtc.who / dtc*Body | Type 1 meets LST from 2021; otherwise ≥2×/week, ≥14 h/week average, 12 months; pump delivery time excluded | cra-dtc-life-sustaining-therapy, cra-rc4064-2025 | Same; RC4064 names the insulin pump | V 51 |
| fed-dtc.howToApply / dtc*Body | Apply with T2201; type 1 still has to apply | cra-dtc-life-sustaining-therapy | T2201 confirmed. "Digital application" removed: HELD E-27 | V 52 |
| fed-rdsp.who | DTC approval; lives in Canada with a SIN; open until Dec 31 of the year turning 59; grants and bonds until the year turning 49 | esdc-rdsp-apply | Same (updated Jul 10, 2026) | V 53 |
| ui.fundingPage.dtcNote | DTC opens the door to the RDSP | esdc-rdsp-apply | DTC approval is required | V 53 |
| ui.fundingPage.changes.1–7 | Dated changes; line 6 is now "May 2025 … announced … from fall 2025" | nt-…, parl-…, hc-pharmacare-…, mb-pharmacare-mepp, isc-nihb-updates, nl-cgm-program-2025, bc-national-pharmacare | As in the rows above | V 46–49, 23, 2, 34, 43 |
| ui.fundingPage.claimBody | ADP $2,400/yr, $600 every 3 months, to you; some programs pay only a pharmacy or supplier | on-diabetes-equipment-and-supplies; for "only a pharmacy or supplier": nb-insulin-pump-program, bc-diabetes-pins | ADP confirmed; NB vendor bills; BC approved vendors. ODB, NIHB and NS sensor examples would need unregistered F-4, F-24, F-16, so none is named | V 55, V 29, V 14 |
| ui.fundingPage.directEmpty, funding.liivv.askUsBody | Some programs pay from a receipt, others only the pharmacy or supplier | qc-insulin-pump-access-program, dc-ontario-monitoring-for-health (receipts); nb-insulin-pump-program, bc-diabetes-pins (vendor) | As above | V 27, V 39, V 29, V 14 |
| ui.fundingPage.enough2Body, fundingResults.noConfirmed* | DC publishes comparisons (from 2024) and an out-of-pocket report | dc-comparisons-by-province, dc-out-of-pocket-costs-2022 | The pump and monitoring comparisons are dated 2024 | V 54 |
| ui.fundingPage.movingIntro / arrive2 | Programs differ; several need an assessment by a local program | on-adp-insulin-pumps, sk-insulin-pump-program, mb-shared-health-diabetes-care, nb-insulin-pump-program | Registered DEP; SHA DEP; endocrinologist or diabetes specialist; specialist confirms | S |
| ui.fundingChecker.typeHint | Several pump and sensor programs are type 1 only | ON ADP, SK, MB, NS, NL, VAC rows | — | S |
| ui.fundingChecker.therapyHint, fundingResults.cgmInsulinOnlyBody | Most pump and sensor programs found are for insulin users | all rendered CGM rows | Every rendered CGM row requires insulin or type 1 (NL gestational is held, E-25) | S |
| ui.fundingChecker.veteranHint | VAC has its own sensor benefit for type 1 | vac-cgm-type-1 | As above | V 6 |
| ui.fundingChecker.privateHint | Some programs pay only after private insurance | nb-insulin-pump-program, ns-insulin-pump-program | As above | V 31, V 32 |
| ui.fundingChecker.indigenousHint | First Nations and Inuit "may be covered" by NIHB | isc-nihb-updates | Program name and scope; hedged | L (framing) |
| funding.liivv.pharmacies, whereBody, quebecTitle, territoryTitle | Bayshore pharmacy in every province except Quebec; none in the territories | — | Owner | O |
| funding.liivv.askUsBody, directEmpty | None listed yet; listed only once set up | — | Owner: none enrolled; listed only once enrolled | O |
| ui.fundingPage.cdeBody | Pharmacist CDEs, all of Canada, Mon–Fri 9–5 Eastern, except holidays; pass you to the right Liivv pharmacy | — | Owner (2026-10-05), which includes the hand-off to the right Liivv pharmacy. Resolves verify row 58 and P3 | O |
| funding.liivv.quebecBody | Pump supplies: receipts to the program | qc-insulin-pump-access-program | As above. The "outside Quebec" fact stays HELD (E-8); the card gives advice only | V 56 |
| ui.fundingPage.enough1Body | Diabetes education programs aren't run by Liivv | — | Same line as `ui.help.lead` (already live) | O |

---

## D) OPEN QUESTIONS

D-1 to D-18 keep their first-draft numbers so cross-references hold. Resolved items say so.

1. **Pay-and-claim isn't how every program works (verify P1).** Some programs won't take a receipt from the person, or pay only a pharmacy or vendor: ODB and OHIP+ strips, NIHB, MEPP and Plan NP, NB IPP, BC pumps and pump supplies, NS sensors, ON ADP CGM. The copy now says "some pay you back from a receipt, others pay only the pharmacy or supplier" and never promises a claim. **Owner:** for each province, is the Liivv pharmacy there already enrolled with its drug plan? If it is and orders route to it, that is direct billing and belongs in `DIRECT_BILLING`. **Owner, also:** the brief says every program is "shown as pay-and-claim". The draft keeps that as "you pay for your order yourself", without saying the program will pay you back. Confirm that reading.
2. **Order routing.** Unchanged: the page doesn't say "your province's Liivv pharmacy fills your order". The CDE hand-off line ("they'll pass you to the right Liivv pharmacy") is the owner's fact and promises no routing.
3. **Do Liivv receipts meet each program's rules?** Unchanged (MB: Manitoba Health number and the original receipt within 6 months; QC: original receipts). No "itemized receipt" line until operations confirms it.
4. **Ontario $170 grant: "any retailer in Ontario".** Does a Liivv online order count? The copy is still silent.
5. **CDE scope and the "ask us" route.** Do the CDEs take claim and coverage questions, as well as pump and CGM questions? Every "ask us" CTA goes to "Request a call", which needs an appointment reason such as "Funding or claims question". The phone number stays off the page until it is confirmed.
6. **Monitoring for Health amounts.** **Resolved:** the amounts are on `on-preventing-and-living-with-diabetes` (verify row 40) and are now in `on-mfhp.covered`. Correct the `dc-ontario-monitoring-for-health` locator, which still states them.
7. **VAC page.** **Resolved in substance:** the same 401140 rule is on the AB and MB grids. It needs F-31 (re-point `vac-cgm-type-1` to the base URL). Then drop the NWT note and set `confirm: false` (E-23).
8. **Date conflict: Dexcom G7 on ODB.** Use July 31, 2025 (Executive Officer notice) once F-2 is registered.
9. **Official French program names.** QC is now filled from the page ("Programme d’accès aux pompes à insuline"). Still empty: ADP, ODB, NIHB, MAIPCP and the NB and NS IPPs.
10. **Program phone numbers.** Still left out. Owner: include them or not?
11. **Diabetes type options.** Unchanged (type 3c and LADA, once AB lands).
12. **Locators to extend** (every V fact in C that the locator doesn't record, plus the corrections found live):
    - `on-diabetes-equipment-and-supplies`: "any retailer in Ontario"; "paid to you"; the seniors' daily-insulin and living-at-home conditions; renewal every 2 years; direct deposit or cheque; rtCGM "maximum allowable quantity per 24-month period".
    - `on-adp-insulin-pumps`: medical criteria; WSIB/VAC exclusion; "within 8 weeks"; first $600 within 30 days; the replacement rule.
    - `ns-insulin-pump-program`: payer of last resort; yearly co-pay by family size; CGM not covered.
    - `qc-insulin-pump-access-program`: CHU receipts and direct refund; the French program name.
    - `dc-ontario-monitoring-for-health`: mail-in with original receipts; "no other coverage"; about 8 weeks. Remove the amounts.
    - `on-preventing-and-living-with-diabetes`: MFHP amounts.
    - `on-odb-coverage`: the eligible groups; "physician or nurse practitioner".
    - `nb-insulin-pump-program`: the vendor bills the province (on the page itself); the specialist types; 100% insured excluded; insulin, strips and batteries not covered.
    - `mb-pharmacare-mepp`: prescription needed; supplies under Pharmacare; MAIPCP "no cost coverage".
    - `mb-shared-health-diabetes-care`: "endocrinologist or approved Diabetes Specialist".
    - `bc-diabetes-pins`: approved vendors; Special Authority for every CGM; Tandem supplies listed, no Tandem pump.
    - `sk-insulin-pump-program`: authorized specialist physician; the pediatric route; supplies follow Drug Plan coverage.
    - `isc-nihb-updates`: "clients managing diabetes with insulin"; Guardian 4 limited use; strips for insulin-managed diabetes. Remove "pharmacy benefits", which isn't on this page.
13. **Product placement.** Unchanged: no strip on this page. The one slot, between "How paying works" and the checker, is ON HOLD.
14. **Brand names in coverage copy.** These now include the Tandem supply names in the BC row (t:slim, AutoSoft, TruSteel, VariSoft). Owner and nurse: acceptable under retail scope?
15. **Re-verification owner.** `NEXT_CHECK` is 2027-01-05. Who owns it?
16. **"Your provincial drug plan still applies"** (`notSignedBody`). Keep it, or cut it?
17. **Ad signals and sitemap** for the new route. Still unchecked.
18. **NIHB eligibility wording.** Registering F-25 would allow "registered First Nations and recognized Inuit". F-24 or F-25 would also release "pharmacy benefits" (E-22).
19. **The Quebec page is from 2021.** Is there a newer RAMQ or MSSS page for the Insulin Pump Access Program? Until one is found, `confirm: true` stays.
20. **Newfoundland and Labrador CGM.** No program page was found on 2026-10-05. A search of gov.nl.ca found only news releases: May 22, 2025, and July 24, 2025 for gestational diabetes (proposed as F-33). Did the type 1 expansion launch in fall 2025 as announced? Owner or researcher: find the program's own page. The releases give NLCGMP@nlhealthservices.ca as the contact. Until then the row says "announced" and keeps `confirm: true`.
21. **Monitoring for Health program year.** The DC page says "no age limit" for April 1, 2025 to March 31, 2026, and doesn't state the 2026–27 rules. Confirm the current year's age rule with the program before E-24 is released.
22. **ADP "lost or misused pump" line.** It was cut because the verifier's reading of the replacement rule doesn't include it. Re-read `on-adp-insulin-pumps`; if the page states it, restore it.
23. **Checker privacy line (`toolIntro`).** Engineering: confirm that no analytics, session replay or event capture records the checker inputs (health, and Indigenous and veteran status). Until then the privacy promise is HELD (E-26).
24. **Launch blocker: Ontario sensors.** ODB CGM (E-1) is live for ODB-eligible insulin users. Today an Ontario type 2 insulin user, or anyone 65+ or 24 and under, sees "we're still checking" for sensors. Register F-2 and F-3 before launch.
25. **Launch blocker: Alberta private-first.** Alberta's government plans became payer of last resort on 2026-10-01 (E-6). Alberta readers get only the generic private-insurance card. Register F-10 before launch.

---

## E) HELD (not in section B; the wording is ready for when the source is registered)

| # | Row / line | Draft wording | Why held | Clears with |
|---|---|---|---|---|
| E-1 | `on-odb-cgm` (ON, cgm). **Live since Jul 31, 2025 (G7) and Nov 28, 2025 (Libre 3 Plus); launch blocker (D-24)** | "If you’re covered by the Ontario Drug Benefit and use insulin, Dexcom G7 (up to 45 sensors a year, plus a receiver if you don’t have a compatible phone) and FreeStyle Libre 3 Plus (up to 31 sensors a year, with a reader) are covered with a prescription." | Government sources unregistered; Libre 2 "33 sensors" is manufacturer-only (policy 4) | F-2, F-3 (and drop Libre 2 unless a gov source lists it) |
| E-2 | ON ODB strips prescriber line | "Test strips need a prescription from an Ontario doctor or nurse practitioner. A pharmacist’s prescription doesn’t count." | Unregistered (ODP manual) | F-1 |
| E-3 | ~~`on-mfhp` amounts~~ | **Released 2026-10-05** into `on-mfhp.covered`, cited to `on-preventing-and-living-with-diabetes` (verify row 40) | — | Done |
| E-4 | `ab-iptp` (AB, pump) | "One insulin pump every 5 years, plus supplies. For type 1 or type 3c, enrolled in Alberta Health. You attend an information session, make an education plan and have a clinic assessment, then sign the program’s forms. Pumps come straight from an approved manufacturer, which bills the program." | myhealth page P; eligibility PDF and ABC guide unregistered | F-7, F-8, F-9 |
| E-5 | `ab-cgm` (AB, cgm) | "Dexcom G6 and G7 and FreeStyle Libre 2 are on Alberta’s Drug Benefit List for insulin users, since December 16, 2024." | Pharmacy Benefact 1225 unregistered | F-11 |
| E-6 | `ab-last-resort` (privateFirst) | "Since October 1, 2026, Alberta’s government drug plans pay after private insurance, so your private plan pays first." | ABC pharmacy reference guide unregistered. **Took effect 2026-10-01; launch blocker (D-25).** Meanwhile AB gets `privateFirstGenericBody` | F-10 |
| E-7 | `sk-cgm` (SK, cgm) | "Dexcom G6 and G7, FreeStyle Libre 2 and Guardian sensors are covered through the Drug Plan for people under 18, and since April 1, 2025, for people 18 to 25 and 65 and over who use insulin." | Bulletin 252 unregistered; Dexcom page industry; gov release failed to load | F-12 |
| E-8 | `qc-cgm` + RAMQ note | "RAMQ covers Dexcom G6 and G7 and FreeStyle Libre 2 as exceptional medications, with a form your doctor sends." / "Quebec’s public drug plan doesn’t cover prescription drugs bought outside Quebec." (When F-6 lands, the second line joins `funding.liivv.quebecBody`, per verify P2.) | RAMQ blocked; Dexcom page industry; quebec.ca page unregistered | F-6, F-30 |
| E-9 | `bc-np-supplies` quantities | "Up to 400 lancets, 300 swabs and 100 ketone strips a year." | Third-party source | A BC page that states them |
| E-10 | `pe-ipp`, `pe-gsp`, `pe-strips`, PEI pharmacare details | "Pump program open to all ages since September 1, 2024, with your share based on income, paid to the pump company (Medtronic, Omnipod or Tandem). Sensors aren’t part of it." / "Diabetes medicines free since May 1, 2025. Test strips $11 per 100 with Diabetes Drug Program enrolment. Pen needles and syringes aren’t covered." / Glucose Sensor Program co-pay at the pharmacy | PEI pages blocked or unregistered | F-18, F-19, F-20 |
| E-11 | `nl-strips` | "Test strips: 2,500 a year with short-acting insulin, 700 with long-acting insulin only. The provincial plan pays after private insurance." | Unregistered | F-21 |
| E-12 | `yt-devices` | "Yukon’s agreement adds insulin pumps and supplies, and advanced glucose monitors, as universal, first-dollar coverage, rolled out April 15 to May 5, 2026." | Agreement page unregistered; Dexcom Yukon page industry | F-23 |
| E-13 | `ns-sbgm` | "Nova Scotia’s Sensor-based Glucose Monitoring Program covers Dexcom G6 and G7, FreeStyle Libre 2 and Guardian sensors, dispensed by a pharmacy, with a deductible based on income." | Unregistered; eligibility from search only | F-16 (re-read eligibility) |
| E-14 | `fed-medical-expenses` (federal row) | "What no program covers may be claimable as a medical expense on your tax return. Keep every receipt." | No registered CRA medical-expense source; which diabetes items are listed has not been read | F-26 (must be read first) |
| E-15 | NIHB pays last | "NIHB pays after any other plan you have." | Unregistered page | F-24 |
| E-16 | MB CGM by receipt (How paying works) | "In Manitoba, you can buy a glucose sensor straight from a supplier and send the original receipt with your Manitoba Health number within 6 months. It counts toward your deductible." | faq_agm.pdf unregistered (and dated 2023) | F-13 |
| E-17 | NIHB pumps (MS&E) | "Pumps and pump supplies are a separate NIHB benefit with prior approval." | P; MS&E lists had no diabetes items | F-25 and a re-read |
| E-18 | VAC strips/needles (non-type-1 veterans) | "Veterans Affairs Canada’s medical supplies benefit also names diabetic test strips, syringes and needles." | POC 7 page URL not recorded | F-27 |
| E-19 | `nu-ehb` | Nunavut EHB card | gov.nu.ca returned 403; nothing read | A readable gov.nu.ca page |
| E-20 | Pay-later (How paying works part 3) | No wording drafted | Proposed program, not approved; counsel review pending | Owner approval |
| E-21 | Manufacturer insurance helplines ("When it isn’t enough") | — | Industry-only (policy 4) | A non-industry source |
| E-22 | `fed-nihb.howToApply` "pharmacy benefits"; `fed-nihb` `pays: 'at-the-pharmacy'` | "These are pharmacy benefits, so you get them through a pharmacy. Some items need prior approval first." | Not on `isc-nihb-updates` (verify row 5) | F-24 or F-25 |
| E-23 | `fed-vac` national rule | Drop `fed-vac.notes`; set `confirm: false` and `has.notes: false` | The registered href is the NWT grid ("-5"); the same rule is on the AB and MB grids (verify row 7) | F-31 |
| E-24 | `on-mfhp.who` age rule | "If you’re 24 or under, or 65 or over, you claim for lancets and a meter only, because your strips are covered through the Ontario Drug Benefit or OHIP+. The same applies if you’re on social assistance or the Trillium Drug Program." | The DC page says "no age limit" for the 2025–26 program year, which has ended; the 2026–27 rule isn't stated (verify row 38) | Program confirms the current year's rule on its page (D-21) |
| E-25 | `nl-cgm` gestational diabetes | "If you’re pregnant and have gestational diabetes, the program may cover a glucose sensor while you need one, without an income test. You need to be a permanent resident with a valid MCP card, and your care team has to confirm you need it." Add `'gestational'` to `nl-cgm.appliesTo.types` | Not on `nl-cgm-program-2025` | F-33 |
| E-26 | `ui.fundingPage.toolIntro` privacy promise | "Nothing you enter is saved or sent anywhere. This runs entirely in your browser." | A technical promise covering health, Indigenous and veteran status; engineering hasn't confirmed that no analytics or event capture records the inputs (verify P3) | Engineering sign-off (D-23) |
| E-27 | DTC digital application | Add "or the CRA’s digital application" back to `fed-dtc.howToApply` and the three `dtc*Body` lines: "Apply online or by phone with the CRA’s digital application, or by mail with form T2201." | On the CRA "How to apply" page, not on `cra-dtc-life-sustaining-therapy` (verify row 52) | F-32 |

---

## F) REGISTER ADDITIONS (proposed; each needs its printed title recorded and a saved copy)

Proposed ids follow the register's naming. Unless stated otherwise, the publisher type is `canadian-government`. "Read" means the research file fetched it.

| # | Proposed SourceId | URL | Publisher | Title (as recorded) | Date | Exact facts it would back |
|---|---|---|---|---|---|---|
| F-1 | `on-odp-reference-manual-2026` | https://www.ontario.ca/files/moh-odp-reference-manual-en.pdf | Ontario Ministry of Health | Ontario Drug Programs Reference Manual | Rev. 17, Aug 3, 2026 | Test strips need an Ontario physician or NP prescription; pharmacist prescriptions not eligible; CGM claims need an insulin claim in the last 180 days (§6.18) |
| F-2 | `on-eo-notice-2025-07-23` | https://www.ontario.ca/files/2025-07/moh-executive-officer-notice-en-2025-07-23.pdf | Ontario Ministry of Health | Executive Officer Notice (Dexcom G7 listing) | Jul 23, 2025 | Dexcom G7 sensor and receiver on ODB effective Jul 31, 2025; 45 sensors per 365 days |
| F-3 | `on-odb-formulary-ed43-summary` | https://www.ontario.ca/files/2026-01/moh-ontario-drug-benefit-odb-formulary-edition-43-summary-en-2025-11-20.pdf | Ontario Ministry of Health | ODB Formulary Edition 43 summary | Nov 20, 2025 | FreeStyle Libre 3 Plus sensor and reader on ODB effective Nov 28, 2025; 31 sensors per 365 days |
| F-4 | `on-ohip-plus` | https://www.ontario.ca/page/learn-about-ohip-plus | Government of Ontario | Learn about OHIP+ | (record) | 24 and under; no private plan; filled "at any pharmacy in Ontario" |
| F-5 | `on-adp-pump-manual-2025` | https://www.ontario.ca/files/2025-11/moh-adp-policy-and-administration-manual-insulin-pump-2025-11-18.pdf | Ontario Ministry of Health | ADP Policy and Administration Manual: Insulin Pump | Nov 18, 2025 | 710.02: supplies from "any retailer"; 715.03: four equal payments to the applicant; 700: 100% of the Approved Price |
| F-6 | `qc-stays-outside-quebec` | https://www.quebec.ca/en/health/health-system-and-services/stays-outside-quebec | Gouvernement du Québec | Stays outside Québec | Feb 12, 2021 | "the public plan does not cover prescription drugs purchased outside Québec" |
| F-7 | `abc-iptp-reference-guide` | https://www.ab.bluecross.ca/pdfs/IPTP-reference-guide.pdf | Alberta Blue Cross (for Alberta Health) | Insulin Pump Therapy Program reference guide | (record) | Pumps "obtained directly from one of the approved insulin pump manufacturers, on a direct bill basis"; supplies from a licensed Alberta pharmacy or approved "manufacturers or vendors, on a direct bill basis" |
| F-8 | `ab-iptp-eligibility-2023` | https://www.alberta.ca/system/files/custom_downloaded_images/health-insulin-pump-therapy-program-eligibility.pdf | Government of Alberta | Insulin Pump Therapy Program eligibility | Aug 2023 | Type 1 or type 3c, Alberta Health enrolment; check for "IPTP participants will not be reimbursed" (billing-verify could not find it in the ABC guide) |
| F-9 | `ab-myhealth-iptp` | https://myhealth.alberta.ca/Learning/insulin-pump-therapy/IPTP | Alberta Health Services (MyHealth Alberta) | Insulin Pump Therapy Program | (record) | Info session, education plan, clinic assessment, Patient Responsibility and Eligibility forms; one pump every 5 years. Research marked P, so re-read |
| F-10 | `abc-pharmacy-reference-guide` | https://www.ab.bluecross.ca/pdfs/82477-ab-pharmacy-reference-guide.pdf | Alberta Blue Cross | Pharmacy reference guide (Alberta government-sponsored plans) | (record) | Government-sponsored plans are payer of last resort from 2026-10-01 |
| F-11 | `abc-pharmacy-benefact-1225` | https://www.ab.bluecross.ca/pdfs/pharmacy-benefacts/pharmacy-benefact-1225.pdf | Alberta Blue Cross | Pharmacy Benefact 1225 | Dec 2024 | Drug Benefit List CGM from 2024-12-16: Dexcom G6/G7 and Libre 2 restricted benefit; Guardian by special authorization for adults; insulin-claim check |
| F-12 | `sk-formulary-bulletin-252` | https://formulary.drugplan.ehealthsask.ca/Bulletins/Bulletin-0252-Mar-2025.pdf | Saskatchewan Drug Plan | Formulary Bulletin 252 | Mar 2025 | Advanced glucose monitoring from 2025-04-01: Dexcom G6/G7, Libre 2, Guardian 3/4; Exception Drug Status; ages 18–25 and 65+ on insulin; pediatric criteria |
| F-13 | `mb-faq-agm` | https://www.gov.mb.ca/health/pharmacare/profdocs/faq_agm.pdf | Government of Manitoba | Advanced glucose monitoring FAQ | Updated Mar 21, 2023 | Buy "direct from a supplier"; original receipts and MHN within six months to 300 Carlton St; counts toward the deductible. Old: confirm it is current |
| F-14 | `mb-faq-ips` | https://www.gov.mb.ca/health/pharmacare/profdocs/faq_ips.pdf | Government of Manitoba | Insulin pump supplies FAQ | Apr 1, 2025 | "order… directly from the manufacturer and submit invoices to Pharmacare", or a Manitoba pharmacy |
| F-15 | `bc-pharmacare-policy-5-18` | (record the exact page in the BC PharmaCare Policy Manual, unified, 2026-10-01) | Government of British Columbia | PharmaCare Policy Manual 5.18 (insulin pump supplies) | Oct 1, 2026 | "Only providers may submit claims for insulin pump supplies… Patients cannot submit manual claims." Backs D-1 copy, not a reader-facing promise |
| F-16 | `ns-sbgm-program` | https://www.novascotia.ca/register-sensor-based-glucose-monitoring-program | Government of Nova Scotia | Register for the Sensor-based Glucose Monitoring Program | (record) | "only covered when dispensed by a pharmacy"; "doesn't cover prescriptions purchased outside Nova Scotia except under very specific circumstances"; sensors listed (Dexcom G6/G7, Libre 2, Guardian 3/4). Eligibility was search-only, so re-read |
| F-17 | `ns-pharmacare-pharmacy-guide-2026` | https://novascotia.ca/dhw/pharmacare/documents/Pharmacy-Guide.pdf | Nova Scotia Pharmacare | Pharmacy Guide | Jun 17, 2026 | Payer of last resort; does not pay for prescriptions filled outside Nova Scotia (exceptions case by case) |
| F-18 | `pe-ipp-qa` | https://www.princeedwardisland.ca/sites/default/files/publications/insulin_pump_program_questions_and_answers.pdf | Government of PEI | Insulin Pump Program: questions and answers | (record) | "Co-payments must be made directly to the insulin pump company"; Medtronic, Omnipod, Tandem; sensors not included; all ages since Sep 1, 2024 (confirm on the Q&A) |
| F-19 | `pe-national-pharmacare-qa-providers` | https://src.healthpei.ca/sites/src.healthpei.ca/files/PEI%20Pharmacare/National%20Pharmacare/National%20Pharmacare%20Q&A%20Providers.pdf | Health PEI | National Pharmacare Q&A (providers) | May 2025 | Diabetes drugs free from May 1, 2025; strips $11 per 100 with Diabetes Drug Program enrolment; pen needles and syringes not covered; out-of-province fills not eligible |
| F-20 | `pe-glucose-sensor-renewal-form` | https://www.princeedwardisland.ca/sites/default/files/publications/glucose_sensor_program_renewal_form.pdf | Government of PEI | Glucose Sensor Program renewal form | Mar 2025 | Income-based co-pay at the pharmacy (eligibility "MDI or pump" is search-only, so re-read) |
| F-21 | `nl-program-claiming-policies` | https://www.gov.nl.ca/hcs/files/Program-Claiming-Policies-1.pdf | Government of NL (Health and Community Services) | NLPDP Program Claiming Policies | Aug 20, 2025 | Strips 2,500 a year with short-acting insulin, 700 with long-acting only; payor of last resort |
| F-22 | `nl-covered-out-of-province` | https://www.gov.nl.ca/hcs/prescription/covered-outofprovince/ | Government of NL | Coverage out of province | (record) | Out-of-province coverage only when referred out for treatment, with Department authorization |
| F-23 | `hc-pharmacare-agreement-yukon` | https://www.canada.ca/en/health-canada/corporate/transparency/health-agreements/national-pharmacare-bilateral-agreements/yukon.html | Health Canada | Canada–Yukon national pharmacare agreement | (record) | Stream 2 adds "insulin pumps and supplies" and "Advanced Glucose Monitors"; "Universal, Single-payer, First-dollar coverage"; rollout Apr 15 to May 5, 2026 |
| F-24 | `isc-nihb-pharmacy-providers` | https://www.sac-isc.gc.ca/eng/1576430557687/1576430636766 | Indigenous Services Canada | NIHB information for pharmacy providers | Jul 29, 2026 | NIHB is payer of last resort; providers enrol with Express Scripts Canada and sign the Billing Agreement |
| F-25 | `isc-nihb-mse` | https://www.sac-isc.gc.ca/eng/1579620079031/1579620259238 | Indigenous Services Canada | NIHB medical supplies and equipment (already on Ostomy's page) | (record) | "Providers enrolled with the NIHB program are paid directly"; clients who pay up front can request reimbursement; eligible First Nations and Inuit. Research marked P, so re-read for the diabetes items |
| F-26 | `cra-medical-expenses` | https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/lines-33099-33199-eligible-medical-expenses-you-claim-tax-return.html | Canada Revenue Agency | Lines 33099 and 33199: eligible medical expenses (already on Ostomy's page) | (record) | **Not yet read for diabetes.** Record which diabetes items it lists (insulin, needles and syringes, glucose monitoring devices and strips?) before E-14 is written |
| F-27 | `vac-poc7-medical-supplies` | (record: veterans.gc.ca … medical-supplies-general-poc-7) | Veterans Affairs Canada | POC 7, Medical Supplies policy | Apr 19, 2024 | Names diabetic test strips, syringes and needles |
| F-28 | `nt-ehb-services` | https://www.hss.gov.nt.ca/en/services/extended-health-benefits | GNWT Health and Social Services | Extended Health Benefits (already on Ostomy's page) | (record) | Not yet read for diabetes devices. Read before any NT device copy |
| F-29 | `abc-nwt-pharmacy-guide-2026` | https://www.ab.bluecross.ca/pdfs/82477-nwt-abc-pharmacy-reference-guide.pdf | Alberta Blue Cross (for GNWT) | NWT/YT/NU pharmacy reference guide | Mar 2026 | PINs for pumps, sets, reservoirs, Dexcom, Libre and Guardian, strips, pen needles. Provider-facing: backs D-1 only |
| F-30 | `dq-ramq-cgm-2025` and `dq-couverture-ramq` (type `canadian-patient-education`) | https://www.diabete.qc.ca/en/news/nouveaute-couverture-de-la-ramq-pour-les-systemes-de-surveillance-continue-du-glucose-scg/ ; https://www.diabete.qc.ca/en/diabetes/living-with-diabetes/finance-and-insurance/couverture-ramq/ | Diabète Québec | RAMQ coverage for CGM systems (news); RAMQ coverage | Nov 7, 2025; ©2024 | RAMQ: Dexcom G6/G7 and Libre 2 as exceptional medications; Libre 3 Plus pending (Nov 2025); strips up to 3,000 a year for insulin users; lancets not covered. Research marked P, so a re-read is needed, and RAMQ's own page is preferred if it ever loads |

**Added after the live check (2026-10-05).** F-31 and F-32 were fetched on 2026-10-05 for this revision. F-33 was fetched too; it is a news release, not the program's own page (D-20).

| # | Proposed SourceId | URL | Publisher | Title (as printed) | Date | Exact facts it would back |
|---|---|---|---|---|---|---|
| F-31 | Re-point the existing `vac-cgm-type-1` (no new id) | https://veterans.gc.ca/en/financial-programs-and-services/medical-costs/search-vac-treatment-benefits/diabetic-supplies-continuous-glucose-monitors-type-1-diabetes (the base URL, without the "-5" NWT suffix) | Veterans Affairs Canada | DIABETIC SUPPLIES - CONTINUOUS GLUCOSE MONITORS - TYPE 1 DIABETES (the base grid shows Alberta; "-1" is Manitoba, "-5" NWT) | Modified 2026-03-19 | Benefit code 401140; frequency "1/5 CY"; pre-authorization required; NP or MD prescriber, "PRESCRIBER NOT REQUIRED FOR REPLACEMENT DEVICE". The same rule on the AB, MB and NWT grids shows it is national. Releases E-23. Update the `sources-review.ts` note so it says the rule is the same in every grid read |
| F-32 | `cra-dtc-how-to-apply` | https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/how-apply-dtc.html | Canada Revenue Agency | How to apply - Disability tax credit form (DTC) | Modified 2025-11-28 | "You can apply online or by phone using the digital form"; "You can apply by mail using the paper form" (T2201); medical practitioners can complete Part B through the DTC digital application for medical practitioners; Parts A and B must use the same method. Releases E-27 |
| F-33 | `nl-cgm-gdm-2025` | https://www.gov.nl.ca/releases/2025/health/0724n01/ | Government of Newfoundland and Labrador (Health and Community Services) | Launch of Continuous Glucose Monitoring Access for Individuals with Gestational Diabetes | 2025-07-24 | CGM access extended to pregnant people with confirmed gestational diabetes who medically require it, are permanent residents and hold a valid MCP card; "Income testing will not be required"; contact NLCGMP@nlhealthservices.ca. Releases E-25. It is still a news release, so look for the program's own page (D-20). Don't name the single approved device in copy (retail scope, D-14) |

**F-2, F-3 and F-10 are now launch blockers** (D-24, D-25). **F-24 or F-25** also releases E-22.

**Not proposed (policy 4: industry pages, never the only source):**
- Dexcom provider and coverage pages (Quebec, Yukon, Saskatchewan)
- Abbott FreeStyle coverage pages
- the Omnipod access page
- the Dexcom G7 investor release

They may sit beside a government source once F-2, F-3, F-12 and F-23 are registered. They are never alone.

---

## G) CHANGE LOG (2026-10-05, applying `funding.verify.md`)

Every verify row marked Partly or Not confirmed, and every problem P1 to P9, is dealt with below. Rows marked Confirmed with no correction were left as they were. No repo file was edited.

### Claims (verify table rows)

| Verify row | Key(s) | Change |
|---|---|---|
| 1 | `fed-nihb.covered` | "for anyone who manages…" → "NIHB continues to cover … for clients who manage their diabetes with insulin". It no longer implies that no prior approval is needed |
| 3 | `fed-nihb.covered` | Guardian 4: added "limited use benefit with prior approval" and "on intensive insulin" |
| 4 | `fed-nihb.covered` | Strips: added "If you use insulin" |
| 5 | `fed-nihb.howToApply`, A.4 `pays` | "Pharmacy benefits" HELD (E-22, needs F-24 or F-25); `pays` → `'unconfirmed'`. Prior approval kept |
| 6 | `fed-vac.covered` | Added the doctor or NP prescription, and that a replacement device needs none |
| 7 | `fed-vac` | National rule proposed as F-31 (re-point to the base URL). The NWT note stays until then; its removal is HELD (E-23) |
| 8 | `fed-vac.who` | "may cover you … ask Veterans Affairs Canada whether it applies to you" |
| 10 | `on-adp-pump.who` | Added "who meet the program’s medical criteria" and the WSIB/VAC exclusion |
| 11 | `on-adp-pump.howToApply` | "about 8 weeks" → "within 8 weeks"; added the first $600 within 30 days of approval |
| 12 | `on-adp-pump.notes` | Reworded to the page's replacement rule: a pump worn out after the warranty, with a repair quote, or changed medical needs. "Lost or misused" cut pending a re-read (D-22) |
| 13 | `on-adp-cgm.covered`, A.4 | "up to a set amount" → "Full coverage … in some cases a receiver, up to a set quantity every 2 years". First source swapped to the page that says it; `pays: 'vendor'` |
| 14 | `bc-pharmacare-pumps.*`, A.4 | "Some need Special Authority" cut; added that approved vendors claim with the list; `howToApply` no longer implies Special Authority; `pays: 'vendor'` |
| 15 | `bc-pharmacare-pumps.notes` | Says Tandem supplies are listed, but no Tandem pump |
| 16 | `bc-cgm.*` | "Some" → "All of them need Special Authority" |
| 17 | `sk-pump.who` | Added "would benefit from a pump and meet the program’s criteria" |
| 18 | `sk-pump.covered` | "Pump supplies follow your Drug Plan coverage, so deductibles and co-payments apply" |
| 19 | `sk-pump.howToApply` | Added the authorized diabetes specialist physician, and the pediatric route with an information session or online module |
| 21 | `mb-pump.*`, A.4 | Legal name MAIPCP; "at no cost" (cites `mb-pharmacare-mepp`, added to sources). The assessment by "an endocrinologist or an approved diabetes specialist" moved to a new `howToApply` |
| 24 | `mb-mepp.howToApply` | "Bring your prescription and your Manitoba Health card to any Manitoba pharmacy" |
| 25 | `mb-mepp.notes` | Pumps are no longer said to be under regular Pharmacare. Sensors and supplies are under Pharmacare with the deductible; adult pumps are at no cost under a separate program |
| 26 | A.4 `qc-pump` | `programNameFr` filled; `confirm: true` kept (stale, D-19) |
| 28 | `nb-ipp.*` | Named the specialist types; added the 100%-insured exclusion; new `notes`: insulin, strips and batteries aren't covered |
| 29 | A.4 `nb-ipp` | Comment records that "vendor bills the province" is on the page itself |
| 30 | `ns-ipp.*` | Yearly share by income and family size, with no premiums or deductibles. New `notes`: CGM isn't covered, and there's a separate sensor program |
| 34 | `nl-cgm.*`, `changes.6`, A.4 | Reworded as a May 2025 announcement of a fall 2025 expansion; "full or partial" added; pilot history corrected (children 2023; up to 24, pregnancy and GDM 2024); `confirm: true`; F-33 proposed. The program page is still missing (D-20) |
| 35 | `on-odb-strips.covered` | "prescriber" → "doctor or nurse practitioner" |
| 37 | `on-mfhp.who` | Added "who have no other coverage for these supplies" |
| 38 | `on-mfhp.who` | Age line HELD (E-24), because the 2026–27 rule isn't stated. Replaced with advice only |
| 39 | `on-mfhp.howToApply` | Added "about 8 weeks" |
| 40 | `on-mfhp.covered`, E-3 | Amounts released, cited to `on-preventing-and-living-with-diabetes` (talking meter included) |
| 41 | `on-adp-seniors.*`, A.4 | Added "need insulin every day and live at home", renewal every 2 years, and direct deposit or cheque; `pays: 'paid-to-you'` |
| 45 | E-9 | Stays held |
| 50 | `fed-pharmacare.notes` | Added that details would follow discussions with the provinces and territories |
| 51 | `fed-dtc.who`, `dtcInsulinBody`, `dtcOtherBody` | Added the 12-month duration |
| 52 | `fed-dtc.howToApply`, `dtc*Body` | "digital application" HELD (E-27); F-32 proposed |
| 53 | `fed-rdsp.who` | Added living in Canada and a SIN |
| 54 | `enough2Body`, `noConfirmedLink`, `noConfirmedBody` | Dated the comparisons to 2024 |
| 58 | `cdeBody` | Kept and reworded. The owner's facts (2026-10-05) now include passing people to the right Liivv pharmacy |

### Problems

| Problem | Change |
|---|---|
| P1 Overpromise of pay-and-claim | `directEmpty` replaced with the verifier's wording. `claimHeading` → "When you pay for your order yourself". `claimBody` and `askUsBody` now say that some programs pay only a pharmacy or supplier. A.2 and the A.5 comment updated, and a new ground rule records the reading. Owner question added to D-1 |
| P2 Quebec and territory cards | "pay up front and claim it yourself" → "you pay for your order yourself". The Quebec receipt route is limited to pump supplies; other plans get advice only. The F-6 "outside Quebec" fact stays HELD (E-8). `whereBody` changed the same way |
| P3 Liivv claim and privacy promise | `cdeBody` resolved by the owner's fact. The `toolIntro` privacy promise is HELD (E-26) pending engineering (D-23); the interim line makes no privacy claim. A.5 rendering note updated |
| P4.1 QC stale | `confirm` kept; D-19 |
| P4.2 NL stale | Announcement wording; F-33; D-20 |
| P4.3 MFHP age rule | E-24; D-21 |
| P4.4 ON CGM via ODB live | `noConfirmed*` no longer reads as "nothing is covered" ("we’re still checking … That doesn’t mean nothing is covered"). E-1 marked live; F-2 and F-3 are launch blockers (D-24) |
| P4.5 AB payer of last resort | New claim-free `privateFirstGenericTitle` and `privateFirstGenericBody` for every province without a sourced private-first row. A.5 logic and the `PRIVATE_FIRST` comment updated. F-10 is a launch blocker (D-25) |
| P4.6 DC comparisons from 2024 | See row 54 |
| P4.7 CRA 2023 page | No change needed |
| P5 | All fixes made, as in the rows above |
| P6 | No statistics added |
| P7 | The urgent exit is unchanged. The VAC and NIHB eligibility overstatements are fixed (rows 1 and 8) |
| P8 | Competitor name removed from the ground rules. It now appears nowhere in this file |
| P9 | F-31 (VAC base URL), F-32 (CRA how-apply) and F-33 (NL gestational release) added with URL, publisher, title, date and facts. E-3 re-cited. The `nb-ipp` locator and QC `programNameFr` handled. F-2, F-3 and F-10 were already proposed and are now launch blockers. The NL program's own page wasn't found, so it has no F row yet (D-20) |

### Other edits

- `mb-cgm` sources: added `mb-pharmacare-mepp`, which backs "AGM are eligible Pharmacare benefits". `bc-np-supplies` sources: added `bc-diabetes-pins` (verify row 44).
- `ProgramPays` doc comment: NIHB moved out of `'at-the-pharmacy'` until F-24 or F-25; BC pumps added to `'vendor'`.
- Section C legend: dropped R and C†, which the live V check supersedes. D-12 now lists every locator gap found live.

### Built into the repo (2026-10-06)

Section B went into `core/messages/en.json` verbatim, as `DiabetesCare.funding` and `DiabetesCare.ui.{fundingPage,fundingChecker,fundingResults}`, with French in `fr.json` (machine-translated draft, awaiting review; program names stay legal English except Quebec's, which prints its own French). Section A.4 is `diabetes-care/funding/funding-meta.ts` (value-import-free, read by the review export), A.5 is `funding-data.ts`, and the page is `funding/page.tsx` + `dc-funding-page.tsx` + `funding-checker.tsx`, on the shared engine's frame (`_microsite/funding/`: `funding-page.tsx` and `checker-parts.tsx` are twins of Ostomy's files; the `oc-fund-*` classes come from Ostomy's `funding.css`, imported, not copied). No section F source was registered: every SourceId section B cites was already in the register, and F-31, F-32 and F-33 release held wording (E-23, E-27, E-25) that stays out. The review pack page is `docs/content-review/diabetes-care/{en,fr}/08-funding.md`; its open questions, held items and proposed sources are `core/scripts/content-review/diabetes-care.funding.mjs`.

No English sentence of section B changed. Where the build departs from sections A and D:

| # | Where | What changed | Why |
|---|---|---|---|
| G-1 | A.2 item 2 (urgent exit) | Uses This Might Be You's approved `urgentExit` pair ("Signs that need emergency care are in Staying Safe, under … Get emergency care now"), linked to Staying Safe `#red-flags`, as the landing does | Staying Safe's own pair says "at the top of this page", which is untrue on this page |
| G-2 | A.5 `matches` | A type the program doesn't take rules the program out before therapy is checked | As sketched, a type 2 reader on injections was shown Quebec's (type 1 only) pump program as "If you're thinking about a pump" |
| G-3 | A.2 item 2 (vibe note) | The vibe note renders with no label | Diabetes Care has no label for it ("The Liivv Vibe" is Ostomy's); no new copy was written |
| G-4 | A.2 item 10; `funding.liivv.askUsCta` | "Request a call" (CDE band and the ask-us card) renders only once `cdeRequestReason` is on in `landing-meta.ts`, as on the landing | The appointment page has no pump/CGM or funding reason yet (landing D3; D-5 here) |
| G-5 | `funding.liivv.pharmacies` | In the message files, rendered nowhere | `whereBody` opens with the same sentence; kept for the checker if the owner wants it |
| G-6 | Checker on /fr | New French review gates `fundingChecker` (the checker; while closed, /fr shows each province's programs by legal name, linked to the official page with the checked date, or the "still checking" line) and `funding` (the page's own French: draft marker on previews, and the /fr sitemap entry) | Ostomy precedent: gated modules fall back to plain lists; the urgent exit and the federal section are never gated |
| G-7 | D-17 | Resolved: the Diabetes Care layout denies ad signals for the whole section, and the page is in the Liivv Health sitemap (EN; FR once `funding` is reviewed) | — |
| G-8 | Landing; Your Tools | `LANDING_GATES.fundingPage` switched on (the Money door renders); Your Tools band card 4 (the held door to this page) released — see your-tools.md F.3 | The page exists |

### Changes after the full-site review (2026-10-06)

| # | Where | Was | Now | Why |
|---|---|---|---|---|
| G-9 | `funding.programs.nb-ipp.howToApply` (EN and FR) | "An endocrinologist, internist or pediatrician confirms you meet the medical criteria, then you apply online. You pay your share…" | "For pumps, an endocrinologist, internist or pediatrician confirms you meet the medical criteria; for sensors, the health care provider who manages your diabetes does. If you apply for both, the same specialist confirms both. Then you apply online. Devices and supplies come only from the program’s approved vendors, not from pharmacies. You pay your share…" | Clinical S2, checked against `nb-insulin-pump-program`: sensors need "your health care provider who supports the management of your diabetes"; both together need "the same Endocrinologist, Internist or Pediatrician"; "NBIPP clients cannot obtain their supplies through community pharmacies" |
| G-10 | `funding.programs.on-adp-pump.howToApply` (EN and FR) | "You get a decision within 8 weeks" | "ADP aims to review applications within 8 weeks" | Clinical S3: the page says "We aim to review your application within 8 weeks of receiving it" |
| G-11 | `ui.fundingResults.notSignedBody` (EN and FR) | "Your provincial drug plan still applies." | "Your provincial or territorial drug plan still applies." | Browser QA 8: shown to territory readers |
| G-12 | `ui.fundingResults` FR `noConfirmedTitle`, `noConfirmedBody`, `notSignedTitle` | "{group} en {province}", "pour {province}", "{province} n’a pas signé d’entente sur l’assurance-médicaments nationale" | "{group} {provinceIn}", "{provinceFor}", "Pas d’entente sur l’assurance-médicaments nationale {provinceIn}", from the new `funding.provinceForms.in` / `.for` maps (FR "au Manitoba", "dans les Territoires du Nord-Ouest", "pour l’Alberta", "pour le Nunavut"…). English messages unchanged; the EN maps hold the English forms so both locales have the same keys | Known item K1: bare names gave "pour Alberta", "en Nunavut", "Ontario n’a pas signé" |
| G-13 | New `ui.fundingResults.noneFitTitle` / `noneFitBody` (EN and FR) | — | "{group} in {province}: none we’ve confirmed fits your answers" / "None of the programs we’ve confirmed for {province} fits your answers so far. Here is who each one is for. That doesn’t mean nothing is covered: ask your pharmacist or diabetes education program what’s covered now." Then each program's own `who` line (and its `notes` where age ruled it out), and a link to the first one's official page | Browser QA 2 and 3: Ontario type 2 on insulin read "we're still checking" although the ADP programs are confirmed (type 1 only); Manitoba under 18 was shown the adult pump program. `mb-pump` now has `ages: 18to24, 25to64, 65plus` (its `who`: "Adults 18 and over"), so under 18 shows its note, "Children have a separate program. Ask your child’s diabetes team about it." No new fact: every line is a program's verified words |
| G-14 | New `ui.fundingResults.pumpInsulinOnlyTitle` / `pumpInsulinOnlyBody` (EN and FR) | Pump section said "still checking" for "No diabetes medicine" or non-insulin medicines | "Pump programs are for people who use insulin" / "An insulin pump delivers insulin, so the pump programs we found are for people who use it. If your treatment changes, come back and check again." | Browser QA 8: the same gate the sensor section already had |
| G-15 | ODB strips card | Same tone at any age | Shown quieter ("maybe") for ages 25 to 64, and for 24 and under with a private plan | Browser QA 8. Its `who` line already says who ODB covers; the card is not hidden, because other ODB routes exist |
| G-16 | Progress line | "{answered} of 6", province not counted ("2 of 6" after three answers) | Counts all seven, province included | Browser QA 8 |
| G-17 | `ui.fundingPage.metaDescription` (EN and FR) | 193 and 246 characters | "Pump and sensor programs, test strips, pharmacare, NIHB, Veterans Affairs and the Disability Tax Credit, by province. Each links to its official page." (150); FR "Programmes de pompes et de capteurs, bandelettes, assurance-médicaments, SSNA, Anciens Combattants et crédit d’impôt pour personnes handicapées, par province." (158) | Link crawl 8: search results cut them off |
| G-18 | Links on /fr | Register titles of English-only pages showed with no language note | Every source link on the page carries "(en anglais)" / "(in French)" where its page is in the other language, as chapter links do | Link crawl 9 |
| G-19 | Register (`sources-meta.ts`) | No French link | `labelFr`/`hrefFr` from each page's own French version, opened 2026-10-06: `esdc-rdsp-apply`, `vac-cgm-type-1` (title's lost accents restored), `parl-bill-c64-pharmacare`, `on-diabetes-equipment-and-supplies` | Link crawl 9 |
| G-20 | Hero on phones | Text 0 px from the screen edge | The engine keeps the side gutter (`funding-extras.css`, scoped to `[data-site]`; Ostomy's funding page has the same bug and is untouched) | Browser QA 4 |

Not changed: the NL pump card links the provincial CGM news release, because that is the only registered page that states the pump program's income test (pre-publish check 10). Owner question B31 (two register ids for one Ontario page).

### Owner's business answers applied (2026-10-06)

From the owner's answers of 2026-10-06 ([OPEN-QUESTIONS](OPEN-QUESTIONS.md)): the CDE band and the coverage lines only. The rest (A5, A6, B7, B13, B20, B22, B25) is the funding step's. French machine-drafted.

| # | Key | What changed | Why |
|---|---|---|---|
| G-21 | `ui.fundingPage.cdeHeading`, `cdeBody`; CDE band | "Questions about pump and sensor supplies" → "Questions about pumps, sensors, billing or claims"; body → "The Certified Diabetes Educators at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, Ontario, answer questions from anywhere in Canada: pumps, sensors, meters, supplies, billing and claims. When needed, they pass you to the Liivv pharmacy in your province." (FR "Questions sur les pompes, les capteurs, la facturation ou les remboursements" / "Les éducateurs agréés en diabète de la Pharmacie Bayshore Express, la pharmacie Liivv de Markham, en Ontario, répondent aux questions de partout au Canada : pompes, capteurs, lecteurs, fournitures, facturation et demandes de remboursement. Au besoin, ils vous dirigent vers la pharmacie Liivv de votre province."). The band shows the CDE contact (`ui.contact`: call 1-844-561-1254, email, hours, About Bayshore Express Pharmacy); "Request a call" stays off (B6) | A2, B5, B9, B10 (D-5 closed) |
| G-22 | `enough3Heading`, `enough3Body` | "Ask a pharmacist CDE" → "Ask a CDE"; "For questions about pump and sensor supplies, Liivv’s pharmacist CDEs can help, wherever you are in Canada." → "For questions about pumps, sensors, supplies, billing and claims, the Certified Diabetes Educators at Bayshore Express Pharmacy can help, wherever you are in Canada." (FR "Demandez à un EAD" / "Pour vos questions sur les pompes, les capteurs, les fournitures, la facturation et les demandes de remboursement, les éducateurs agréés en diabète de la Pharmacie Bayshore Express peuvent vous aider, où que vous soyez au Canada.") | B10 |
| G-23 | `whereHeading`, `whereBody` | "Where Liivv doesn’t have a pharmacy" → "Ordering from Quebec or the territories"; the body opens "Liivv’s pharmacies serve all of Canada, Quebec and the territories included. Insulin can’t be ordered online for delivery in Quebec." in place of "Liivv has a Bayshore pharmacy in every province except Quebec, and none in the territories." (FR "Commander depuis le Québec ou les territoires" / "Les pharmacies de Liivv servent tout le Canada, y compris le Québec et les territoires. L’insuline ne peut pas être commandée en ligne pour une livraison au Québec.") | A1, B11 |
| G-24 | `funding.liivv.pharmacies`, `quebecTitle`, `quebecBody`, `territoryTitle`, `territoryBody` | "Liivv has a Bayshore pharmacy in every province except Quebec. There are none in the territories." → "Liivv’s pharmacies serve all of Canada, Quebec and the territories included. Insulin can’t be ordered online for delivery in Quebec."; "Liivv doesn’t have a pharmacy in Quebec" → "Ordering from Quebec", body opening "Liivv’s pharmacies serve Quebec, but insulin can’t be ordered online for delivery in Quebec."; "Liivv doesn’t have a pharmacy in the territories" → "Ordering from the territories", body opening "Liivv’s pharmacies serve the territories too." (FR to match) | A1, B11 |
| G-25 | register | `on-adp-insulin-pumps` merged into `on-diabetes-equipment-and-supplies` (rows on-adp-pump and on-adp-cgm, `movingIntro`) and removed; the merged locator records the current page's ADP facts, re-read 2026-10-06. That page also states "We do not cover costs to replace a lost pump or supplies or to repair pumps or supplies damaged through misuse or neglect" (D-22, for the funding step) | B31 |

### Funding step: owner answers and re-fetched official pages applied (2026-10-06)

From the owner's answers of 2026-10-06 (A5, A6, B7, B13, B20, B22, B23, B25; OPEN-QUESTIONS) and the research of that day (`pump-programs.md`, `funding-facts.md`), with the verifier's corrections (`funding-verify.md`) winning wherever they differ, and nothing published that its section F lists as not re-fetched. Every page cited below was fetched again for this step (core/scripts/check-funding-sources.mjs `--url`, or a browser for yukon.ca, which refuses plain requests); princeedwardisland.ca's CAPTCHA and RAMQ were not worked around. Every row's `verifiedOn` is now 2026-10-06. FR machine-drafted, awaiting review (the Ostomy precedent: the checker stays behind `fundingChecker`; the urgent signpost and the federal rows are never gated).

**Register (sources-meta.ts, sources-review.ts).** New, each opened and read on 2026-10-06, with its French page where the publisher has one: `bc-insulin-pumps`, `bc-sa-insulin-pumps`, `bc-pharmacare-contact`, `bc-news-diabetes-coverage-2026` (E-9), `ab-specialized-drug-benefits`, `ab-iptp-eligibility-2023` (F-8), `ab-non-group-coverage`, `ab-cgm-fact-sheet-2025` (replaces F-11), `abc-pharmacy-reference-guide` (F-10), `sk-drug-cost-assistance`, `mb-pharmacare`, `mb-health-coverage` (MAIPCP, `#ancillary-ten`), `mb-faq-ips` (F-14), `on-eo-notice-cgm-2025` (F-2, printed July 24, 2025), `on-odb-formulary-ed43-summary` (F-3), `qc-stays-outside-quebec` (F-6), `inesss-libre-3-plus-2026`, `inesss-dexcom-g6-g7-2026` and `inesss-libre-3-plus-notice-2025-12` (replace F-30), `nb-drug-plans`, `ns-sbgm-program` (F-16), `ns-pharmacare`, `ns-health-contacts`, `pe-ipp-qa` (F-18), `healthpei-national-pharmacare-qa` (replaces F-19), `nl-insulin-pump-program-2021`, `nl-prescription-drug-program`, `nl-program-claiming-policies` (F-21), `yt-national-pharmacare`, `yt-chronic-disease-benefits`, `nt-ehb-services` (F-28), `isc-nihb-pharmacy-benefits` (replaces F-24), `isc-nihb-contact`, `vac-poc7-medical-supplies` (F-27), `vac-contact`, `cra-dtc-how-to-apply` (F-32), `cra-rc4065-2025` (replaces F-26, now 404). Changed: `vac-cgm-type-1` re-pointed to the base grid (F-31); French title and page added to `on-odb-coverage`, `on-preventing-and-living-with-diabetes`, `qc-insulin-pump-access-program` (its /en/ address now serves English) and `nb-insulin-pump-program`. Each locator records the page's date and the exact lines used; the rulings (D-21, B2, B22, B25, B31) are recorded in their locators.

| # | Where | What changed | Why |
|---|---|---|---|
| G-26 | `ui.fundingPage.direct*`, `DIRECT_BILLING` | "Programs we bill directly" now lists the nine provincial drug plans by the government's own names (BC PharmaCare; Alberta government-sponsored drug programs (Alberta Blue Cross); Saskatchewan Drug Plan; Manitoba Pharmacare Program; Ontario Drug Benefit (ODB); New Brunswick Drug Plans; Nova Scotia Pharmacare; PEI Pharmacare; NLPDP), each linked to the page that names it, in French where the government prints a name. New `directBody` "Our pharmacy in your province bills your provincial drug plan directly for what the plan covers. Each Liivv pharmacy is enrolled with its own province’s plan:", `directPlan` "{province}: {plan}", `directQuebec` (Quebec's plan doesn't cover drugs bought outside Quebec, so Quebec orders are paid privately; insulin can't be ordered online for Quebec), `directOther` (federal programs, territorial plans and private insurers aren't on the list). `directEmpty` removed. `DirectBillingEntry` is now `{ province, plan, planFr, source, confirmedOn }`; the export refuses Quebec, a territory, a duplicate province or an unregistered source | A6, B13 (D-1) |
| G-27 | `claimHeading`, `claimCheck` | "When you pay for your order yourself" → "Programs that pay you back"; "Before you order, check that your program will take a receipt from you. Or ask us." → "Paying for an order yourself and claiming it back? Ask us for an invoice for your claim. We can’t promise that a program will accept a claim, so check its rules before you order." | B13 (the finance team sends the invoice; no promise a claim is accepted) |
| G-28 | `PAY_LATER`, `payLaterBody`, `payLaterTerms.1–6`, `payLaterContact`; `ui.fundingResults.payLaterPump` | "Liivv Now, Pay Later" switched on: a third part of How paying works (`#pay-later`), for insulin pump supplies, Omnipod pods included, once customer service confirms eligibility. Its terms mirror the owner's program: three paid orders in a row first, then a $1.00 card authorization; no credit check; pay within 45 days of receiving an order or with the next order, whichever comes first; pod orders billed every 90 days; a declined card retried 3 more times, then due within 3 business days; no prepaid cards; a late payment can hold the next shipment and end eligibility. Contact: Bayshore Express Pharmacy's general line, which routes the question (B10). Every pump program's card ends with the pay-later line; no other card mentions it. Another company's program name is never used, and the export now fails on it | A5, B10 (E-20 released) |
| G-29 | `ui.fundingResults.pumpIntro` | New, under the pump group heading: "Liivv supports every provincial and territorial pump program. Tell us which program you’re on and we’ll handle your order the way it requires." | A6 |
| G-30 | `phones` on 30 rows; `ui.fundingChecker.phone.*`; engine `PhoneList` | Each program's phone numbers as its official page prints them, on its card, its federal row and the /fr plain list, as tel: links; toll-free lines labelled "toll-free", in-province-only ones "toll-free in {province} only" (BC PharmaCare 1-800-663-7100, Yukon CDDB 1-800-661-0408), TTY and area labels as printed. Only numbers re-checked on 2026-10-06, e.g. MB 204-786-7365/7366 and 1-800-297-8099 ext 7365 or 7366; the NIHB client line 1-888-441-4777 (not the provider line); VAC 1-866-522-2122; ADP 1-800-268-6021; NB IPP 1-855-655-5525; NS 902-470-6707 / 1-855-306-6360 and 902-496-5667 / 1-877-330-0323; PEI 902-213-4825; Alberta Blue Cross 1-800-661-6995. Left out: the NL pump program's 2021 numbers (they predate NL Health Services) and Quebec (none printed) | B22 (D-10) |
| G-31 | `programNameFr` | From each government's own French page: PAAF (ADP rows), PMO (ODB rows), "Programme de surveillance pour une bonne santé de l’Ontario", MAIPCP, MEPP, NB IPP, NLPDP strips, NIHB (SSNA), Yukon National Pharmacare and CDDB, NWT EHB, CIPH, REEI, "Loi concernant l’assurance médicaments", VAC. Empty where none is published (BC, AB, the SK pump program, NS; PEI's only French name is in a patient handout, not a program page) | B25 (D-9) |
| G-32 | `bc-pharmacare-pumps` | Now cites the patient page (July 15, 2026), the Special Authority page and the PIN list; `who` added; `covered`, `howToApply` and `notes` rewritten from the page (Fair PharmaCare deductible, then 70%, then 100%; 100% on Plans B, C, F and W; supplies covered whether or not the pump was, with no Special Authority; the Special Authority request, approval letter, 6 months, no retroactive coverage; PharmaNet claims only; no Tandem pump, Tandem supplies on the PIN list); `confirm` → false | A6, B23 |
| G-33 | `ab-iptp` (new) | Alberta's Insulin Pump Therapy Program from alberta.ca and its eligibility criteria: type 1 or type 3c, approved makers, information session, education plan, clinic assessment, Patient Responsibility Form, eligibility form to Alberta Blue Cross, direct bill to pharmacies and makers only, no reimbursement, private insurance first since 2026-10-01 | A6 (E-4 released) |
| G-34 | `sk-pump` | Title is the legal name, "Saskatchewan Aids to Independent Living (SAIL) Insulin Pump Program"; phones; the payment flow is still not stated (`unconfirmed`) | A6, B22 |
| G-35 | `mb-pump` | First source is the government's MAIPCP section (Health Coverage); `pays` → vendor ("at no cost, directly from the supplier"); `who` adds the 5-year rule and the federal-program exclusion; one pump every 5 years; supplies not covered (Pharmacare, deductible); the children's program named in the note (Manitoba Pediatric Insulin Pump Program, MPIPP, from Manitoba's pump-supplies FAQ) | A6, verify A1 |
| G-36 | `qc-pump` (FR) | The French `howToApply` names the paying agent as its own page does, "Santé Québec – CHU de Québec – Université Laval" (the English page still says "CHU de Québec – Université Laval"); `confirm` stays true (2021 page, D-19) | A6 |
| G-37 | `ns-ipp` | `howToApply` now carries the full route: contact the program, an approved Diabetes Health Centre sends the Clinical Eligibility Form, the adult or child/youth funding application by mail, 1 to 2 weeks, renew January 1 to March 31; the note points to the sensor program, now on the page | A6 |
| G-38 | `pe-ipp` (new) | PEI Insulin Pump Program from its Q&A PDF (2026-05-06): all ages since September 1, 2024, type 1, up to 100% depending on income, private insurance and device cost; Medtronic, Omnipod, Tandem; the Provincial Diabetes Program decides eligibility; co-pay straight to the pump company; renew April 1 to June 30; sensors under a separate program; the Catastrophic Drug Program cap. PEI joins `PRIVATE_FIRST` | A6 (E-10, pump part) |
| G-39 | `nl-pump` | First source is the 2021 release: basic pumps and supplies, type 1, an income test for new clients 18 and over with a hardship policy, children and youth to 18 fully covered; the note says the details are from 2021; `confirm` stays true | A6 (D-20 open) |
| G-40 | `yt-pump` (new), `yt-pharmacare`, `yt-cddb` (new) | Yukon, read in a browser: the National Pharmacare Program covers listed diabetes medicines (free at Yukon pharmacies, paid first even with private insurance, lower-cost alternative rule), not equipment, supplies or glucose monitors; medicines filled outside Yukon aren't covered; it gives access to newer pump technology, with eligibility every 5 years (`yt-pump`, partly confirmed: who pays and how to apply are not stated). Devices and supplies go through the Chronic Disease and Disability Benefits Program (`yt-cddb`: diabetes listed; syringes, glucose test kits, glucometers; the doctor applies before purchase; approval before buying outside Yukon, or a claim within 1 year; payer of last resort; annual deductible). The held E-12 line ("first-dollar coverage" of pumps and monitors) was wrong and is dropped | A6, verify A6 and E-12 |
| G-41 | `nt-ehb` | From the program's own page: the NIHB MS&E list, 75% to a family maximum of $500–$1,500, bands 2–10 and seniors 60+ at no cost, payer of last resort, the NIHB and Métis routes; still partly confirmed for devices; no NWT pump card (the list names no pump). NU stays held (E-19) | A6, research |
| G-42 | `fed-nihb` | First link is NIHB's pharmacy-benefits page, which describes and links the Drug Benefit List; `who` no longer judges eligibility ("Liivv can’t decide whether you’re eligible"); `howToApply` adds that NIHB pays when other plans don't, that enrolled pharmacies bill it directly and that there's no deductible or co-payment; `pays` → at-the-pharmacy; FR name SSNA; the client phone | B2 (D-18; E-15, E-22 released) |
| G-43 | `on-odb-cgm` (new) | Dexcom G7 since July 31, 2025 (45 sensors a year) and FreeStyle Libre 3 Plus since November 28, 2025 (31 a year), for ODB recipients on insulin, with a physician or NP prescription; notice date July 24, 2025; ServiceOntario INFOline phones; shown quieter for ages the ODB covers only through another route, as the strips row is. No co-pay line (B13: still open) | B7 (E-1, D-24) |
| G-44 | `ab-cgm` (new), Alberta private-first | From the December 16, 2025 fact sheet: enrolled in a government-sponsored plan; under 18 any insulin or pump therapy; 18+ a pump, basal-bolus or premixed insulin; yearly limits (G7 37, Libre 3 Plus 25…); Medtronic needs Special Authorization for adults; co-payments apply (Non-Group page). Alberta joins `PRIVATE_FIRST` with `funding.privateFirst.AB` ("Since October 1, 2026, Alberta’s government-sponsored programs … pay only after any private or workplace plan"); `PRIVATE_FIRST` entries now name the page that states the rule | B7 (E-5 corrected per verify A2; E-6; D-25) |
| G-45 | `qc-cgm` (new) | From INESSS (the minister's decisions on the RAMQ list): FreeStyle Libre 3 Plus listed since December 11, 2025, and Dexcom G6/G7; since February 4, 2026 the same criteria for every CGM: 2 and over; under 18, type 1; 18+, intensive insulin therapy (a pump, or ≥ 3 injections a day of at least 2 insulins) plus one of three clinical criteria; first approval 6 months; renewal at ≥ 70% wear. Not "type 2 in general" (verify A3). Partly confirmed (RAMQ's own list is unreadable). Note: Quebec's plan doesn't cover drugs bought outside Quebec | B7 (E-8 corrected) |
| G-46 | `mb-cgm.howToApply` | "You don’t need a prescription or a special application." → "You don’t need a special application." Manitoba's own AGM FAQ refers to a prescription; Shared Health says none is needed — recorded side by side for the nurse in `mb-shared-health-diabetes-care` | Verify A5 |
| G-47 | `ns-sbgm` (new) | Nova Scotia's Sensor-based Glucose Monitoring Program from its page (modified 2026-04-29): deductible by family income ($0–$1,000), no premiums or co-payments, pharmacy-dispensed with a prescription, 2 and over, Health Card, income ≤ $150,000, type 1 or 2 on ≥ 4 injections a day or a pump, private insurance first, nothing bought outside NS except in specific cases; no brands named | B7 (E-13) |
| G-48 | `nl-strips` (new) | NLPDP claiming policies (August 20, 2025): 2,500 / 700 (+100) / 100 (+50) / 50 (+50) strips a year, pregnancy as requested, a paid diabetes-medicine claim in the past year or Special Authorization, payer of last resort | B7 (E-11, all four tiers) |
| G-49 | `bc-np-supplies` | From BC's own release (March 30, 2026): 400 lancets, 300 alcohol swabs and 100 ketone strips a year from April 1, 2026, through Fair PharmaCare and Plans C, F and W (100% on C, F, W), at the pharmacy counter, after training from a diabetes education centre or primary care network; `confirm` → false | B7 (E-9) |
| G-50 | `pe-pharmacare`, `bc-plan-np`, `mb-mepp` | PEI from Health PEI's residents' Q&A (May 2025): many diabetes medicines at no cost at PEI pharmacies, strips $11 per 100 with Diabetes Drug Program enrolment, no syringes or pen needles, nothing filled out of province, federal-plan members keep their plan. BC Plan NP: "The prescription must be dispensed in B.C." MEPP: FR name and phones | B7 (E-10, pharmacare part) |
| G-51 | `on-mfhp` | The government page is the first source (B36); `who` adds "If you’re 65 or over, on social assistance or a Trillium Drug Program client, you can claim only for lancets and a blood glucose meter" (ontario.ca, June 8, 2026, which supersedes Diabetes Canada's "no age limit"); `howToApply` adds that the first claim form is signed by a doctor or NP; `confirm` → false | D-21 (E-24 released in the government's words; its "24 or under" had no official source) |
| G-52 | `on-adp-pump.notes` | Adds "ADP doesn’t cover replacing a lost pump or supplies, or repairing ones damaged through misuse or neglect." (the page's words; "stolen" is not on the page) | D-22, verify A4 |
| G-53 | `fed-vac` | Base grid (Alberta, 2026-03-19); the NWT note replaced by POC 7's "diabetic test strips, … syringes and needles"; `confirm` → false; FR name; phone | E-23, E-18 |
| G-54 | `fed-dtc`, `dtcType1Body`, `dtcInsulinBody`, `dtcOtherBody` | The CRA's digital form: "Apply online or by phone with the CRA’s digital form, or by mail with the paper form T2201. Both parts of the application have to go in the same way."; CRA phone | E-27 |
| G-55 | `fed-medical-expenses` (new federal row), `medicalHeading` | "Medical expenses on your tax return": RC4065 names insulin, needles and syringes, insulin pens, an insulin pump with its disposable parts, and a device to measure blood sugar, each with a prescription; "Keep every receipt." Strips are not named (they appear only under anticoagulation monitors) | E-14 |
| G-56 | `whereBody`, `funding.liivv.askUsBody`, `quebecBody`, `territoryBody` | Quebec: orders shipped there are paid privately (`qc-stays-outside-quebec`), and pump supplies are claimable from the Insulin Pump Access Program with our invoice; territories: our pharmacies are in the provinces, so you pay and claim with our invoice; Yukon's CDDB approval-or-claim rule as an example; "Can we bill your program for you?" now says the provincial drug plan is billed directly, except in Quebec | A1, B11, B13 |
| G-57 | `ui.fundingPage.changes.8–10` | New dated changes: ODB sensors (July 31 and November 28, 2025); Quebec's common CGM criteria (February 4, 2026); Alberta's payer-of-last-resort rule (October 1, 2026). Change 7 also cites BC's March 30, 2026 release | B7 |
| G-58 | `funding.options.type.other` | "Another type, or not sure" → "Another type (such as LADA or type 3c), or not sure" (FR to match) | B25, D-11 |
| G-59 | `NEXT_CHECK`, `RECHECK_OWNER`; core/scripts/check-funding-sources.mjs; core/scripts/data/funding-sources-baseline.json | `NEXT_CHECK` 2027-01-05 → 2026-11-01; owner note "Monthly automated recheck (scheduled), reviewed by the Liivv content owner". The recheck fetches every page the Funding page cites (90 with the French pages), compares status, address, title, printed dates and a text hash with the baseline (written today: 86 pages read, 4 yukon.ca pages blocked), and looks for each row's `checkPhrases` (128 found, 0 missing, 9 not checked: yukon.ca); it exits 1 on any change or missing phrase. Documented in README.md | B20 (D-15) |
| G-60 | Landing, path doors, Your Tools | FAQ 1, the money door, the four path Funding doors and Your Tools band card 4 now say the provincial drug plan is billed directly (not in Quebec) and that other programs pay their own way (landing.md #61–63, paths.md H.6, your-tools.md F.8) | A6, B13 |

Still open (OPEN-QUESTIONS): the $170 grant and online orders (D-4), the ODB co-pay line (D-27), clearance of the pay-later terms (D-26), the checker privacy line (B4, D-23), the Quebec (D-19) and NL (D-20) program pages, Nunavut and the PEI sensor program (held), and order routing for Quebec and the territories (D-2). Sections D, E and F above are the record as it stood before this step; the current open questions, held items and proposed sources are in the review pack (`08-funding.md`, from core/scripts/content-review/diabetes-care.funding.mjs).

### Commerce step: the pump-supplies strip (2026-10-06)

How a strip behaves (all chapters): the products are named in `diabetes-care/chapters/chapter-shop.ts` (owner answer B21, "Now?"), drawn by the shared engine (`_microsite/shop/`) under the card's referral chip, and read from the catalogue on every request. A product shows only while the store shows it, sells it and has it in stock, and never when its description names or links another retailer or gives its phone number (17 descriptions still do; OPEN-QUESTIONS B3). A product with a required option or modifier (85 diabetes products carry a required "Test" modifier today) gets "Choose options", a link to its page, instead of a one-click add. No kit is listed (A4). One switch, `SHOP_SWITCH.placements`, turns every strip off. Every placed id is health-revealing by id for analytics (`sensitive-products.ts`). The strip's words are `ui.chapter.shop.*` (French machine-drafted, not behind a review gate, as on Ostomy).

| # | Where | Change | Why |
|---|---|---|---|
| 1 | After "How paying works", before the checker (`#pump-supplies`) | `FUNDING_SHELF`: `pumpSupplies` by pump: MiniMed Quick-Set (4750) and reservoir (4862), Tandem VariSoft (4253) and cartridge (4658), mylife Inset (4665) and reservoir (4314), Omnipod 5 and DASH pods (8090, 8091) once the owner makes them visible in the store. Infusion sets need their sizes chosen, so they are "Choose options" links. The strip says nothing about coverage or Liivv Now, Pay Later | B21, A3 |
| 2 | D-13 | Updated: the slot is filled; the owner confirms the strip sits well beside the program cards | B21 |

### Fixes after the full-site review (2026-10-06)

From the browser QA, the clinical and business review and the step reviews of 2026-10-06. French machine-drafted.

| # | Where | Change | Why |
|---|---|---|---|
| G-61 | `ui.fundingResults.pumpIntro`; new `pumpPayLater`; `payLaterPump` removed | The pump group's intro was "Liivv supports every provincial and territorial pump program. Tell us which program you’re on and we’ll handle your order the way it requires." It is now "Liivv supports all provincial pump programs. Each program decides where its supplies come from and how it pays, as its card below says: some pay only their own vendors or the pump company, and some don’t pay you back for supplies you buy yourself. Check its rules before you order." then "{name} is Liivv’s own way to pay for insulin pump supplies, separate from any program; its terms are under How paying works, above." The owner said "provincial" (A6), so the intro shows in a province only: in Yukon, the Northwest Territories and Nunavut the pump group has none. No program card carries a pay-later line any more: New Brunswick's program supplies only through its approved vendors ("NBIPP clients cannot obtain their supplies through community pharmacies"), PEI's co-pay goes to the pump company, and Alberta's IPTP does not reimburse supplies paid for personally. `pumpPayLater` renders only while `PAY_LATER.enabled` | Clinical review 1; QA 6; K6 |
| G-62 | "Recent changes" | Listed oldest first by the date each line opens with (`CHANGES_ORDER` in funding-meta.ts; keys unchanged): 1, 2, 3, 4, 6, 8, 5, 9, 7, 10 | QA 11; clinical review 3 |
| G-63 | `fed-nihb` phone office | French name on /fr, from the French contact page (re-read 2026-10-06): « Centre d’appels d’Express Scripts Canada pour le programme des SSNA, ligne de demandes de renseignements pour les clients » | Clinical review 5 |
| G-64 | Phone links with an extension (`mb-pump`) | "1-800-297-8099, ext. 7365 or 7366" now dials the first extension after a pause (tel:+18002978099,7365); the page says either reaches the office | QA 13 |
| G-65 | `ui.fundingPage.payLaterTerms.5` (FR) | « nous réessayons 3 fois » → « nous réessayons 3 autres fois », as the English "3 more times" | Clinical review 6 |
| G-66 | `ui.fundingPage.changes.2`, `funding.programs.fed-pharmacare.covered` (FR) | « est entrée en vigueur » → « est devenue loi », as the English "became law" (Royal Assent, October 10, 2024) | Clinical review 7 |
| G-67 | `funding.programs.on-mfhp.covered` | The talking meter line gains the page's condition: "For a talking meter, if a letter from your doctor confirms visual impairment, up to $300 once every 5 years." (FR « …si une lettre de votre médecin confirme une déficience visuelle… »). The page's two eligibility wordings ("have diabetes while pregnant" and "have gestational diabetes") are an owner question (B39) | Clinical review 8 |
| G-68 | `pe-pharmacare` | Also listed under test strips and supplies (`groups: ['pharmacare', 'supplies']`), so PEI's supplies group shows the card that states the strip price instead of "we're still checking" | K7 |
| G-69 | Quebec cards (FR) | Checked, not changed: Quebec's French page says « vos factures originales ou vos relevés d’assurance originaux » where its English page says "the original receipts or insurance statements" (both re-read 2026-10-06), so the French cards keep « factures » (recorded in the `qc-insulin-pump-access-program` locator) | K8 |
| G-70 | Pharmacist panel (`#cde`) | The heading takes the panel's light text (contrast) | QA 4 |
| G-71 | Monthly recheck | Scheduled: the task "liivv-funding-recheck" runs `check-funding-sources.mjs` at 09:07 on the 1st of each month, first run 2026-11-01, and writes `docs/diabetes-content/funding-rechecks/YYYY-MM-DD.md`. It changes no copy: a CHANGED or MISSING PHRASE result is re-read and brought here by hand (B20) | K9 |

Not changed (owner questions or held for a source): the "we're still checking" groups (test strips in AB, MB and QC; sensors in PE and YT; Nunavut) wait for registered official pages; PEI's Glucose Sensor Program (F-20) is still unregistered, so its pump card names it but its sensor group says "still checking"; the Quebec sensor card has no RAMQ link or phone because RAMQ's pages refuse requests; the Quebec "renewed at ≥70% wear" scope is B40; the four Yukon numbers yukon.ca blocked are B41; "Manitoba Pharmacare — continuous and flash glucose monitors" and the billing list's « Régime d’assurance-médicaments » / « Le Régime d’assurance-médicaments » stay as the governments print them (B25); the pay-later terms still wait for the owner and counsel (A5, D-26).
