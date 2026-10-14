/*
 * =============================================================================
 * SLEEP APNEA CARE FUNDING — TYPES, AND WHAT THE CHECKER SHOWS
 * =============================================================================
 * The shape of the funding record (docs/sleep-content/funding.md, A.3) and the
 * checker's rules (A.5), as pure functions with no React and no side effects,
 * so the rules can be read and tested apart from the page.
 *
 * Everything is handed in: the record (`FundingData`, from ./funding-meta.ts),
 * the words (from `SleepApneaCare.funding` and `SleepApneaCare.ui.fundingResults`,
 * in the page locale) and each official page (from the source register,
 * resolved for the page locale). So this file and ./funding-meta.ts import
 * each other's types only, and both load under Node's type stripping (the
 * content-review export, check-funding-sources.mjs, the unit test).
 *
 * Province alone is enough to show something. Every other answer narrows the
 * list or changes a card's tone: an unanswered or "not sure" answer never
 * hides a card, and an explicit "no" to assistance hides only the programs
 * for people on assistance. Nothing here stores or sends what a reader
 * answers: it runs on what the checker holds in memory. (Saying so on the
 * page waits on the privacy sign-off: funding.md E-12, ruling B3.)
 *
 * Erasable TypeScript, statement-form `import type` only.
 * =============================================================================
 */

import type { FundingCard, FundingPhoneGroup } from '../../_microsite/funding/checker-parts';
import type { SourceId } from '../chapters/sources-meta';

export type ProvinceCode =
  | 'BC'
  | 'AB'
  | 'SK'
  | 'MB'
  | 'ON'
  | 'QC'
  | 'NB'
  | 'NS'
  | 'PE'
  | 'NL'
  | 'YT'
  | 'NT'
  | 'NU';

export type Jurisdiction = ProvinceCode | 'CA';

export type YesNoUnsure = 'yes' | 'no' | 'unsure';

/** What sleep test the reader had. Level 1 = in-lab polysomnography; Level 3 = home sleep apnea test (bcg-osa-adults-appx-e). */
export type TestType = 'inLab' | 'home' | 'notYet' | 'unsure';

export type Need = 'first' | 'replacement' | 'supplies';

/* The checker's answer options, in the order they are offered (keys `funding.options.*`). */
export const PROVINCE_CODES: readonly ProvinceCode[] = [
  'BC',
  'AB',
  'SK',
  'MB',
  'ON',
  'QC',
  'NB',
  'NS',
  'PE',
  'NL',
  'YT',
  'NT',
  'NU',
];
export const TEST_TYPES: readonly TestType[] = ['inLab', 'home', 'notYet', 'unsure'];
export const NEEDS: readonly Need[] = ['first', 'replacement', 'supplies'];

/** Result order. Index = render order (keys `funding.groups.<group>`). Province notes come before all groups. */
export const RESULT_GROUPS = ['nihb', 'vac', 'machine', 'supplies', 'privateFirst', 'tax'] as const;
export type ResultGroup = (typeof RESULT_GROUPS)[number];

/**
 * How the PROGRAM pays, from the program's own page — never how Liivv bills.
 * 'business'           : the program pays its share to a registered business; you pay the rest there (ON ADP).
 * 'copay'              : you pay a set co-pay; the program pays the balance (MB).
 * 'loan'               : the program lends the machine for a fee (SK SAIL).
 * 'direct-or-receipts' : a third party invoices the program, or the amount is added to your payment, paid on receipts (ON ODSP MSN).
 * 'provider-or-refund' : registered providers bill the program; you may pay and ask for a refund (NIHB, FNHA).
 * 'pay-or-refund'      : "payment or reimbursement" (VAC POC 9).
 * 'approval-first'     : the program must approve before you buy; how it pays a new device isn't stated (BC BCEA).
 * 'tax'                : a tax credit.
 * 'unconfirmed'        : the page does not say (AB AISH, NB).
 * Review only: no page prints it.
 */
export type ProgramPays =
  | 'business'
  | 'copay'
  | 'loan'
  | 'direct-or-receipts'
  | 'provider-or-refund'
  | 'pay-or-refund'
  | 'approval-first'
  | 'tax'
  | 'unconfirmed';

export interface AppliesTo {
  /** Omitted = any need. */
  needs?: Need[];
  /** Income or disability assistance programs. */
  assistanceOnly?: boolean;
  /** Tests the program states it accepts; omitted = not stated (never rules a card out). */
  tests?: Array<Exclude<TestType, 'notYet' | 'unsure'>>;
}

export interface ProgramPhone {
  number: string;
  kind: 'phone' | 'tollFree' | 'tollFreeIn' | 'tty';
  /** A place or condition the page prints beside the number, as printed (English data). */
  area?: string;
}

export interface ProgramPhoneGroup {
  /** The office as the page names it: a proper noun, never translated. */
  office: string;
  /** Its French name, only where the government prints one. */
  officeFr?: string;
  /** The page that prints the number. */
  source: SourceId;
  numbers: ProgramPhone[];
}

/*
 * A short phrase copied exactly from an official page, which the scheduled
 * recheck looks for: on the program's first source, or on the page named.
 */
export type CheckPhrase = string | { source: SourceId; phrase: string };

/*
 * A release hold on a program's words (not a French gate). While a row
 * carries `held`, `funding.programs.<id>` is stripped from the client
 * (heldFundingPaths in ./funding-meta.ts, applied in ../layout.tsx) and its
 * card shows only its title, where to turn, its official page and the date.
 * Deleting the `held:` line releases it, as on the chapters.
 *   indigenousPartnerReview  ruling B1 ("default", 2026-10-13; funding.md D-13,
 *                            06 R8): the NIHB and FNHA cards wait on an
 *                            Indigenous health partner's review.
 */
export type FundingHold = 'indigenousPartnerReview';

export interface ProgramMeta {
  id: string;
  jurisdiction: Jurisdiction;
  groups: ResultGroup[];
  /** Legal name, never translated. */
  programName: string;
  /** Official French name as printed; '' where none was found (D-9). */
  programNameFr: string;
  /** Registered SourceIds; the first one is the card's link. */
  sources: [SourceId, ...SourceId[]];
  pays: ProgramPays;
  appliesTo: AppliesTo;
  /** ISO date the row was last checked against its sources. Rendered on every card. */
  verifiedOn: string;
  /** Renders "Partly confirmed: check with the program". */
  confirm: boolean;
  /** Which keys exist under `funding.programs.<id>`; the export checks both ways. */
  has: { covered: true; who: boolean; howToApply: boolean; notes: boolean };
  phones?: ProgramPhoneGroup[];
  /** Where there is no single number: the page that lists the office to call ("Find your office"). */
  contactSource?: SourceId;
  checkPhrases: [CheckPhrase, ...CheckPhrase[]];
  held?: FundingHold;
}

/* A province whose government page states non-coverage (or that we're still checking, Quebec). Shown first, always. */
export interface ProvinceCaution {
  /** Key under `funding.province`. */
  id: string;
  /** The first one is the card's link. */
  sources: [SourceId, ...SourceId[]];
  phones?: ProgramPhoneGroup[];
  verifiedOn: string;
  checkPhrases: CheckPhrase[];
}

/* A program Liivv bills directly. Listed only once the owner confirms the enrolment (D-1). */
export interface DirectBillingEntry {
  programId: string;
  province: ProvinceCode | 'CA';
  enrolledOn: string;
}

export interface CheckerInput {
  province: ProvinceCode | '';
  assistance: YesNoUnsure | '';
  indigenous: YesNoUnsure | '';
  veteran: YesNoUnsure | '';
  privateInsurance: YesNoUnsure | '';
  test: TestType | '';
  need: Need | '';
}

export const EMPTY_INPUT: CheckerInput = {
  province: '',
  assistance: '',
  indigenous: '',
  veteran: '',
  privateInsurance: '',
  test: '',
  need: '',
};

/*
 * The six optional answers the progress line counts (funding.md A.5,
 * rendering rules). Province is the one required answer and is not counted.
 */
export const CHECKER_QUESTIONS = [
  'assistance',
  'indigenous',
  'veteran',
  'privateInsurance',
  'test',
  'need',
] as const;

/* A card in the result list, with the group it is listed under ('province' and 'liivv' have no heading). */
export interface ResultCard extends FundingCard {
  group: ResultGroup | 'province' | 'liivv';
  /**
   * "Find your office" (a program with `contactSource`), shown under the card
   * beside its official page. Unset while the card is held: its one link is
   * then the office page.
   */
  office?: { label: string; href: string; external: true };
}

/* `funding.programs.<id>` as the message files hold it. */
export interface ProgramWords {
  covered: string;
  who?: string;
  howToApply?: string;
  notes?: string;
}

/* An official page in the page locale, from the source register. */
export interface SourceLink {
  label: string;
  href: string;
  hrefLang: 'en' | 'fr';
}

export interface CardWords {
  title: string;
  body: string;
}

/* Everything the result list says that is not a program's own words, in the page locale. */
export interface ResultCopy {
  /** `funding.province.<id>`: a caution card. */
  caution: (id: string) => CardWords;
  /** `funding.province.stillChecking`, with the province's name. */
  stillChecking: (province: ProvinceCode) => CardWords;
  /** `funding.province.<line>`: a named still-checking line (Alberta Aids to Daily Living). */
  stillCheckingLine: (line: string) => CardWords;
  /** `ui.fundingResults.notTestedYet*`, with the link to Chapter 01 in the page locale. */
  notTestedYet: CardWords & { link: { label: string; href: string } };
  /** `ui.fundingResults.testNote.<programId>`, where there is one. */
  testNote: (programId: string) => string | undefined;
  /** `ui.fundingResults.suppliesNote.<programId>`, where there is one. */
  suppliesNote: (programId: string) => string | undefined;
  /** `ui.fundingResults.adpNoSupplies*`. */
  adpNoSupplies: CardWords;
  /** `ui.fundingResults.noConfirmed*`, with the group's and the province's names. */
  noConfirmed: (group: ResultGroup, province: ProvinceCode) => CardWords;
  /** `ui.fundingResults.privateFirst*`. */
  privateFirst: CardWords;
  /** "Check with your program first": `ui.fundingPage.buyFirstHeading`, `buyFirstBody` and this province's `buyFirstItems`. */
  buyFirst: (province: ProvinceCode) => { title: string; body: string[] };
  /** `funding.liivv.askUs*`. */
  askUs: CardWords;
  /** `ui.fundingChecker.findOffice`. */
  findOffice: string;
  /** A program's or caution card's phone numbers, worded and linked for the page locale. */
  phones: (owner: { phones?: ProgramPhoneGroup[] }) => FundingPhoneGroup[] | undefined;
}

export interface ResultSources {
  /** The link a program's card shows: its first source. */
  program: (meta: ProgramMeta) => SourceLink | undefined;
  /** Any register entry the list links (a caution card's page, an office list). */
  source: (id: SourceId) => SourceLink | undefined;
}

/* The record the rules run on (./funding-meta.ts FUNDING_DATA, or a test's own). */
export interface FundingData {
  programs: readonly ProgramMeta[];
  caution: Partial<Record<ProvinceCode, ProvinceCaution>>;
  stillChecking: readonly ProvinceCode[];
  stillCheckingLines: Partial<Record<ProvinceCode, readonly string[]>>;
}

export interface ResultContext {
  data: FundingData;
  /** `funding.programs` as the client holds it (held programs are absent). */
  words: Record<string, ProgramWords | undefined>;
  copy: ResultCopy;
  sources: ResultSources;
  locale: string;
}

interface GroupContext extends ResultContext {
  input: CheckerInput;
  province: ProvinceCode;
}

/* The program's name in the page locale: its official French name where one is printed. */
export function programTitle(meta: ProgramMeta, locale: string) {
  return locale === 'fr' && meta.programNameFr ? meta.programNameFr : meta.programName;
}

/* The program's own words, in the order a card prints them. */
export function programParagraphs(words: ProgramWords | undefined) {
  if (!words) return [];

  return [words.covered, words.who, words.howToApply, words.notes].filter(
    (line): line is string => typeof line === 'string' && line !== '',
  );
}

/*
 * Does this program apply to the answers so far? 'maybe' is shown, quieter;
 * 'no' is left out. An unanswered question never rules a program out.
 */
export function matches(rule: AppliesTo, input: CheckerInput): 'yes' | 'maybe' | 'no' {
  if (rule.needs && input.need && !rule.needs.includes(input.need)) return 'no';

  if (!rule.assistanceOnly) return 'yes';

  if (input.assistance === 'no') return 'no';

  return input.assistance === 'yes' ? 'yes' : 'maybe';
}

const answeredYesOrUnsure = (answer: YesNoUnsure | '') => answer === 'yes' || answer === 'unsure';

const byId = (context: ResultContext, id: string) =>
  context.data.programs.find((meta) => meta.id === id);

/* A card's link to an official page, where there is one. */
function linkTo(link: SourceLink | undefined): Pick<ResultCard, 'link'> {
  return link ? { link: { label: link.label, href: link.href, external: true } } : {};
}

function phonesOf(owner: { phones?: ProgramPhoneGroup[] }, copy: ResultCopy) {
  const phones = copy.phones(owner);

  return phones?.length ? { phones } : {};
}

function wordsCard(
  id: string,
  group: ResultCard['group'],
  words: CardWords,
  tone: ResultCard['tone'],
): ResultCard {
  return { id, group, title: words.title, body: [words.body], tone };
}

/* "Find your office", for a program with no single number. */
function officeLink(meta: ProgramMeta, context: ResultContext): ResultCard['office'] {
  const page = meta.contactSource ? context.sources.source(meta.contactSource) : undefined;

  return page ? { label: context.copy.findOffice, href: page.href, external: true } : undefined;
}

/*
 * One program's card. A held program's words are never read (they are not on
 * the client): its card says only where to turn — the office page or its
 * phone — with its official page and the date it was checked.
 */
function programCard(
  meta: ProgramMeta,
  group: ResultGroup,
  tone: ResultCard['tone'],
  context: ResultContext,
): ResultCard {
  const office = officeLink(meta, context);
  const card: ResultCard = {
    id: `${group}-${meta.id}`,
    group,
    title: programTitle(meta, context.locale),
    body: meta.held ? [] : programParagraphs(context.words[meta.id]),
    ...linkTo(context.sources.program(meta)),
    ...phonesOf(meta, context.copy),
    verifiedOn: meta.verifiedOn,
    confirm: meta.confirm,
    tone,
  };

  if (!office) return card;

  return meta.held ? { ...card, link: office } : { ...card, office };
}

/* 0 · A government page states non-coverage (or that we're still checking): first, always. */
function cautionCard(caution: ProvinceCaution, context: ResultContext): ResultCard {
  return {
    ...wordsCard(`province-${caution.id}`, 'province', context.copy.caution(caution.id), 'caution'),
    ...linkTo(context.sources.source(caution.sources[0])),
    ...phonesOf(caution, context.copy),
    verifiedOn: caution.verifiedOn,
  };
}

function notTestedYetCard(copy: ResultCopy): ResultCard {
  return {
    ...wordsCard('province-not-tested-yet', 'province', copy.notTestedYet, 'supporting'),
    link: {
      label: copy.notTestedYet.link.label,
      href: copy.notTestedYet.link.href,
      external: false,
    },
  };
}

/* 0 · Province notes, never hidden by other answers. */
function provinceNotes(context: GroupContext): ResultCard[] {
  const { data, copy, input, province } = context;
  const caution = data.caution[province];
  const lines = data.stillCheckingLines[province] ?? [];

  return [
    ...(caution ? [cautionCard(caution, context)] : []),
    ...(data.stillChecking.includes(province)
      ? [
          wordsCard(
            'province-still-checking',
            'province',
            copy.stillChecking(province),
            'supporting',
          ),
        ]
      : []),
    ...lines.map((line) =>
      wordsCard(`province-${line}`, 'province', copy.stillCheckingLine(line), 'supporting'),
    ),
    ...(input.test === 'notYet' ? [notTestedYetCard(copy)] : []),
  ];
}

/* 1 · NIHB, or in BC the First Nations Health Authority first, for a reader who is, or may be, First Nations or Inuit. */
function nihbCards(context: GroupContext): ResultCard[] {
  const answer = context.input.indigenous;

  if (!answeredYesOrUnsure(answer)) return [];

  const tone = answer === 'yes' ? 'primary' : 'supporting';
  const nihb = byId(context, 'fed-nihb-respiratory');
  const fnha = context.province === 'BC' ? byId(context, 'bc-fnha-mse') : undefined;

  if (!fnha) return nihb ? [programCard(nihb, 'nihb', tone, context)] : [];

  /* Some BC clients are NIHB clients (self-government and other arrangements differ). */
  return [
    programCard(fnha, 'nihb', tone, context),
    ...(nihb ? [programCard(nihb, 'nihb', 'supporting', context)] : []),
  ];
}

/* 2 · Veterans Affairs Canada. */
function vacCards(context: GroupContext): ResultCard[] {
  const vac = byId(context, 'fed-vac-poc9');

  if (!vac || !answeredYesOrUnsure(context.input.veteran)) return [];

  return [programCard(vac, 'vac', 'primary', context)];
}

/*
 * One provincial program the answers leave in. A card is never hidden by the
 * test answer, only annotated: a program that names its tests and leaves out
 * a home test turns to caution (Ontario's ADP: Level 1 in a registered lab).
 */
function provincialCard(
  meta: ProgramMeta,
  fit: 'yes' | 'maybe',
  group: 'machine' | 'supplies',
  context: GroupContext,
): ResultCard {
  const { input, copy } = context;
  const card = programCard(meta, group, fit === 'yes' ? 'primary' : 'supporting', context);
  const tests = meta.appliesTo.tests;
  const homeNotNamed = input.test === 'home' && tests !== undefined && !tests.includes('home');
  const notes = [
    input.test === 'home' ? copy.testNote(meta.id) : undefined,
    group === 'supplies' ? copy.suppliesNote(meta.id) : undefined,
  ].filter((line): line is string => typeof line === 'string' && line !== '');

  return {
    ...card,
    body: [...card.body, ...notes],
    tone: homeNotNamed ? 'caution' : card.tone,
  };
}

/* Is this group asked about? Machine cards leave when the reader asks about supplies only, and the reverse. */
function groupAsked(group: 'machine' | 'supplies', need: Need | '') {
  if (group === 'machine') return need !== 'supplies';

  return need === '' || need === 'supplies';
}

/* 3, 4 · Machine and supply programs in the reader's province. */
function provincialCards(group: 'machine' | 'supplies', context: GroupContext): ResultCard[] {
  const { input, province, data, copy } = context;

  if (!groupAsked(group, input.need)) return [];

  const onRecord = data.programs.filter(
    (meta) => meta.jurisdiction === province && meta.groups.includes(group),
  );
  const cards = onRecord.flatMap((meta) => {
    const fit = matches(meta.appliesTo, input);

    if (fit === 'no') return [];

    /* A row in both groups renders once: under 'machine' unless the reader asked about supplies. */
    if (group === 'supplies' && meta.groups.includes('machine') && input.need !== 'supplies') {
      return [];
    }

    return [provincialCard(meta, fit, group, context)];
  });
  const adpNoSupplies =
    group === 'supplies' && input.need === 'supplies' && province === 'ON'
      ? [wordsCard('supplies-adp-no-supplies', 'supplies', copy.adpNoSupplies, 'caution')]
      : [];
  /*
   * "We're still checking" only where nothing is on record for this group and
   * no province note already says so. A program on record that the answers
   * leave out is not "not found" (funding.md A.5's sketch tested the shown
   * list, which would have said so to a New Brunswick reader not on assistance).
   */
  const stillChecking =
    !onRecord.length && !data.stillChecking.includes(province) && !data.caution[province]
      ? [
          wordsCard(
            `${group}-still-checking`,
            group,
            copy.noConfirmed(group, province),
            'supporting',
          ),
        ]
      : [];

  return [...cards, ...adpNoSupplies, ...stillChecking];
}

/* 5 · Private insurance usually pays first. */
function privateFirstCards(context: GroupContext): ResultCard[] {
  if (!answeredYesOrUnsure(context.input.privateInsurance)) return [];

  return [wordsCard('private-first', 'privateFirst', context.copy.privateFirst, 'supporting')];
}

/* 6 · The medical expense tax credit, for everyone. */
function taxCards(context: GroupContext): ResultCard[] {
  const tax = byId(context, 'fed-cra-medical');

  return tax ? [programCard(tax, 'tax', 'supporting', context)] : [];
}

const GROUP_CARDS: Record<ResultGroup, (context: GroupContext) => ResultCard[]> = {
  nihb: nihbCards,
  vac: vacCards,
  machine: (context) => provincialCards('machine', context),
  supplies: (context) => provincialCards('supplies', context),
  privateFirst: privateFirstCards,
  tax: taxCards,
};

/* "Check with your program first", unless the reader asked about supplies only. */
function buyFirstCards(context: GroupContext): ResultCard[] {
  if (context.input.need === 'supplies') return [];

  const words = context.copy.buyFirst(context.province);

  return [
    {
      id: 'liivv-buy-first',
      group: 'liivv',
      title: words.title,
      body: words.body,
      tone: 'caution',
    },
  ];
}

/*
 * The result list, in the owner's group order (RESULT_GROUPS), after the
 * province notes; it ends with "Check with your program first" and with how
 * paying for an order from Liivv works. Liivv bills no program directly yet
 * (DIRECT_BILLING is empty), and no card promises that a program will accept
 * a receipt from Liivv.
 */
export function buildResults(input: CheckerInput, context: ResultContext): ResultCard[] {
  if (!input.province) return [];

  const full: GroupContext = { ...context, input, province: input.province };

  return [
    ...provinceNotes(full),
    ...RESULT_GROUPS.flatMap((group) => GROUP_CARDS[group](full)),
    ...buyFirstCards(full),
    wordsCard('liivv-ask-us', 'liivv', context.copy.askUs, 'supporting'),
  ];
}

/* How many of the six optional answers are in (province is required and not counted). */
export function checkerProgress(input: CheckerInput) {
  const answered = CHECKER_QUESTIONS.filter((question) => input[question] !== '').length;

  return { answered, total: CHECKER_QUESTIONS.length };
}
