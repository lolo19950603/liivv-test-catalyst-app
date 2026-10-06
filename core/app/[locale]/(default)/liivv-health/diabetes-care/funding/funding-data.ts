/*
 * Diabetes funding — what the checker shows for a set of answers.
 *
 * Pure functions with no side effects and no React, so the logic can be read
 * (and tested) apart from the page. The data is ./funding-meta.ts; the words
 * are handed in by the caller from `DiabetesCare.funding` and
 * `DiabetesCare.ui.fundingResults`, and the official page each card links to
 * comes from the source register, already resolved for the page locale.
 *
 * Province alone is enough to show something. Every other answer narrows the
 * list or changes a card's tone; an unanswered or "not sure" answer never
 * hides a card. Nothing the reader enters is stored or sent anywhere by this
 * code: it runs on what the checker holds in memory.
 */

import type { FundingCard } from '../../_microsite/funding/checker-parts';
import type { SourceId } from '../chapters/sources-meta';

import {
  type AgeBand,
  type AppliesTo,
  type DiabetesType,
  PRIVATE_FIRST,
  PROGRAM_META,
  type ProgramMeta,
  type ProvinceCode,
  RESULT_GROUPS,
  type ResultGroup,
  type Therapy,
  type YesNoUnsure,
} from './funding-meta';

export interface CheckerInput {
  province: ProvinceCode | '';
  type: DiabetesType | '';
  therapy: Therapy | '';
  age: AgeBand | '';
  indigenous: YesNoUnsure | '';
  veteran: YesNoUnsure | '';
  privateInsurance: YesNoUnsure | '';
}

export const EMPTY_INPUT: CheckerInput = {
  province: '',
  type: '',
  therapy: '',
  age: '',
  indigenous: '',
  veteran: '',
  privateInsurance: '',
};

/*
 * The seven answers the progress line counts, province first. Province is the
 * one required answer, but it is counted too, so "3 of 7 answered" means three.
 */
export const CHECKER_QUESTIONS = [
  'province',
  'type',
  'therapy',
  'age',
  'indigenous',
  'veteran',
  'privateInsurance',
] as const;

/* A card in the result list, with the group it is listed under ('liivv' has no heading). */
export interface ResultCard extends FundingCard {
  group: ResultGroup | 'liivv';
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

/* Everything the result list says that is not a program's own words. */
export interface ResultCopy {
  groupLabel: (group: ResultGroup) => string;
  consideringPump: (title: string) => string;
  type1Only: string;
  /* Province lines take the code, so each locale can print its own grammatical form. */
  noConfirmedTitle: (group: string, province: ProvinceCode) => string;
  noConfirmedBody: (province: ProvinceCode) => string;
  noConfirmedLink: string;
  noneFitTitle: (group: string, province: ProvinceCode) => string;
  noneFitBody: (province: ProvinceCode) => string;
  cgmInsulinOnlyTitle: string;
  cgmInsulinOnlyBody: string;
  pumpInsulinOnlyTitle: string;
  pumpInsulinOnlyBody: string;
  vacNotType1Title: string;
  vacNotType1Body: string;
  notSignedTitle: (province: ProvinceCode) => string;
  notSignedBody: string;
  privateFirstTitle: string;
  privateFirstBody: (province: ProvinceCode) => string;
  privateFirstGenericTitle: string;
  privateFirstGenericBody: string;
  dtcTitle: string;
  dtcType1Body: string;
  dtcInsulinBody: string;
  dtcOtherBody: string;
  quebecTitle: string;
  quebecBody: string;
  territoryTitle: string;
  territoryBody: string;
  askUsTitle: string;
  askUsBody: string;
  askUsCta: string;
  /* "Request a call", or null while the appointment page has no reason for it. */
  askUsHref: string | null;
  /* A program's phone numbers, worded and linked for the page locale (owner answer B22). */
  phones: (meta: ProgramMeta) => FundingCard['phones'];
}

export interface ResultSources {
  /** The link a program's card shows: its first source. */
  program: (meta: ProgramMeta) => SourceLink | undefined;
  /** Diabetes Canada's comparisons, for the "still checking" card. */
  comparisons: SourceLink | undefined;
  /** The federal agreements page, for the "hasn't signed" card. */
  agreements: SourceLink | undefined;
  /** Any register entry the page links, such as the private-insurance rule's own page. */
  source: (id: SourceId) => SourceLink | undefined;
}

const TERRITORIES: ProvinceCode[] = ['YT', 'NT', 'NU'];

/* Yukon, the Northwest Territories or Nunavut. */
export function isTerritory(province: ProvinceCode | '') {
  return province !== '' && TERRITORIES.includes(province);
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
  const { type, therapy, age } = input;

  if (rule.ages && age && !rule.ages.includes(age)) return 'no';

  /*
   * A type the program does not take rules it out, whatever the therapy. The
   * copy record's sketch checked therapy first, which showed type 1 pump
   * programs to a type 2 reader on injections as "if you're thinking about a
   * pump".
   */
  if (rule.types && type && type !== 'other' && !rule.types.includes(type)) return 'no';

  if (rule.therapies && therapy && !rule.therapies.includes(therapy)) {
    if (rule.alsoIfConsideringPump && therapy === 'insulinInjections') return 'maybe';

    return 'no';
  }

  if (rule.types && type) {
    /* Such as LADA or type 3c: the program's `who` line says who qualifies. */
    if (type === 'other') return 'maybe';
    if (!rule.types.includes(type)) return 'no';
  }

  return 'yes';
}

/* A type 1 program shown to a reader who answered "another type, or not sure". */
function isType1OnlyMaybe(meta: ProgramMeta, input: CheckerInput) {
  const types = meta.appliesTo.types;

  return input.type === 'other' && types?.length === 1 && types[0] === 'type1';
}

/* Everything one result group needs to work out its cards. */
interface GroupContext {
  input: CheckerInput;
  province: ProvinceCode;
  copy: ResultCopy;
  sources: ResultSources;
  words: Record<string, ProgramWords | undefined>;
  locale: string;
}

const byId = (id: string) => PROGRAM_META.find((meta) => meta.id === id);

/* A card's link to an official page, where there is one. */
function linkTo(link: SourceLink | undefined): Pick<ResultCard, 'link'> {
  return link ? { link: { label: link.label, href: link.href, external: true } } : {};
}

function programCard(
  meta: ProgramMeta,
  group: ResultGroup,
  tone: ResultCard['tone'],
  context: GroupContext,
): ResultCard {
  return {
    id: `${group}-${meta.id}`,
    group,
    title: programTitle(meta, context.locale),
    body: programParagraphs(context.words[meta.id]),
    ...linkTo(context.sources.program(meta)),
    phones: context.copy.phones(meta),
    verifiedOn: meta.verifiedOn,
    confirm: meta.confirm,
    tone,
  };
}

const answeredYesOrUnsure = (answer: YesNoUnsure | '') => answer === 'yes' || answer === 'unsure';

/* 1 · NIHB, for a reader who is, or may be, First Nations or Inuit. */
function nihbCards(context: GroupContext): ResultCard[] {
  const nihb = byId('fed-nihb');
  const answer = context.input.indigenous;

  if (!nihb || !answeredYesOrUnsure(answer)) return [];

  return [programCard(nihb, 'nihb', answer === 'yes' ? 'primary' : 'supporting', context)];
}

/* 2 · Veterans Affairs. The benefit we could confirm is for type 1 sensors. */
function vacCards(context: GroupContext): ResultCard[] {
  const vac = byId('fed-vac');
  const { input, copy, sources } = context;

  if (!vac || !answeredYesOrUnsure(input.veteran)) return [];

  if (input.type && input.type !== 'type1') {
    return [
      {
        id: 'vac-not-type-1',
        group: 'vac',
        title: copy.vacNotType1Title,
        body: [copy.vacNotType1Body],
        ...linkTo(sources.program(vac)),
        tone: 'caution',
      },
    ];
  }

  return [programCard(vac, 'vac', 'primary', context)];
}

/*
 * The ODB covers people 65 and over and people 24 and under with no private
 * plan (OHIP+); anyone else only through another ODB route, so the card is
 * shown quieter for them rather than hidden.
 */
function odbStripsLikely(input: CheckerInput) {
  if (input.age === '25to64') return false;

  if ((input.age === 'under18' || input.age === '18to24') && input.privateInsurance === 'yes') {
    return false;
  }

  return true;
}

/* The Ontario Drug Benefit rows, whose who-line names the groups ODB covers. */
const ODB_ROWS = ['on-odb-strips', 'on-odb-cgm'];

/* Monitoring for Health takes gestational diabetes at any therapy. */
function fitFor(meta: ProgramMeta, input: CheckerInput) {
  if (meta.id === 'on-mfhp' && input.type === 'gestational') return 'yes';

  const fit = matches(meta.appliesTo, input);

  if (ODB_ROWS.includes(meta.id) && fit === 'yes' && !odbStripsLikely(input)) return 'maybe';

  return fit;
}

/* The program has an age rule, and the reader's age is outside it. */
const outsideAges = (meta: ProgramMeta, input: CheckerInput) =>
  Boolean(meta.appliesTo.ages && input.age && !meta.appliesTo.ages.includes(input.age));

/*
 * Programs are on record for this group here, but none takes the reader's
 * answers: say so, with who each one is for (its own `who` line, and its note
 * when age ruled it out, such as Manitoba's pointer to the children's
 * program), rather than "we're still checking".
 */
function noneFitCard(
  excluded: ProgramMeta[],
  group: 'pump' | 'cgm' | 'supplies',
  context: GroupContext,
): ResultCard {
  const { input, province, copy, words, sources, locale } = context;
  const lines = excluded.flatMap((meta) => {
    const own = words[meta.id];
    const who = own?.who ? [`${programTitle(meta, locale)}: ${own.who}`] : [];
    const note = outsideAges(meta, input) && own?.notes ? [own.notes] : [];

    return [...who, ...note];
  });
  const [first] = excluded;

  return {
    id: `${group}-none-fit`,
    group,
    title: copy.noneFitTitle(copy.groupLabel(group), province),
    body: [copy.noneFitBody(province), ...lines],
    ...(first ? linkTo(sources.program(first)) : {}),
    ...(first ? { verifiedOn: first.verifiedOn } : {}),
    tone: 'supporting',
  };
}

/* One program the reader's answers leave in, with its title and tone adjusted to them. */
function provincialCard(
  meta: ProgramMeta,
  fit: 'yes' | 'maybe',
  group: ResultGroup,
  context: GroupContext,
): ResultCard {
  const { input, copy } = context;
  const card = programCard(meta, group, fit === 'yes' ? 'primary' : 'supporting', context);

  if (fit === 'maybe' && group === 'pump' && input.therapy === 'insulinInjections') {
    card.title = copy.consideringPump(card.title);
  }

  if (fit === 'maybe' && isType1OnlyMaybe(meta, input)) {
    card.body = [...card.body, copy.type1Only];
  }

  /* Quebec's pump program has to be joined before 18. */
  if (meta.id === 'qc-pump' && input.age && input.age !== 'under18') card.tone = 'caution';

  /*
   * No program card mentions "Liivv Now, Pay Later" (full-site review,
   * 2026-10-06): some programs pay only their own vendors or the pump company,
   * or pay nothing back for supplies bought privately. It is Liivv's own
   * option, said once in the pump section's intro and in How paying works.
   */
  return card;
}

/* 3, 4, 5 · Pump, sensor and supply programs in the reader's province. */
function provincialCards(group: 'pump' | 'cgm' | 'supplies', context: GroupContext): ResultCard[] {
  const { input, province, copy, sources } = context;
  const usesNoInsulin = input.therapy === 'none' || input.therapy === 'nonInsulin';

  if (group === 'cgm' && usesNoInsulin) {
    return [
      {
        id: 'cgm-insulin-only',
        group,
        title: copy.cgmInsulinOnlyTitle,
        body: [copy.cgmInsulinOnlyBody],
        tone: 'supporting',
      },
    ];
  }

  /* A pump delivers insulin: every pump program is for people who use it. */
  if (group === 'pump' && usesNoInsulin) {
    return [
      {
        id: 'pump-insulin-only',
        group,
        title: copy.pumpInsulinOnlyTitle,
        body: [copy.pumpInsulinOnlyBody],
        tone: 'supporting',
      },
    ];
  }

  const onRecord = PROGRAM_META.filter(
    (meta) => meta.jurisdiction === province && meta.groups.includes(group),
  );
  const shown = onRecord.flatMap((meta) => {
    const fit = fitFor(meta, input);

    return fit === 'no' ? [] : [provincialCard(meta, fit, group, context)];
  });

  if (shown.length) return shown;

  if (onRecord.length) return [noneFitCard(onRecord, group, context)];

  /* Nothing confirmed for this group here: say we're still checking, never that nothing is covered. */
  return [
    {
      id: `${group}-still-checking`,
      group,
      title: copy.noConfirmedTitle(copy.groupLabel(group), province),
      body: [copy.noConfirmedBody(province)],
      ...(sources.comparisons
        ? {
            link: { label: copy.noConfirmedLink, href: sources.comparisons.href, external: true },
          }
        : {}),
      tone: 'supporting',
    },
  ];
}

/* 6 · National pharmacare: the province's agreement, or that it has not signed one. */
function pharmacareCards(context: GroupContext): ResultCard[] {
  const { province, copy, sources } = context;
  const own = PROGRAM_META.find(
    (meta) => meta.jurisdiction === province && meta.groups.includes('pharmacare'),
  );

  if (own) return [programCard(own, 'pharmacare', 'primary', context)];

  return [
    {
      id: 'pharmacare-not-signed',
      group: 'pharmacare',
      title: copy.notSignedTitle(province),
      body: [copy.notSignedBody],
      ...linkTo(sources.agreements),
      tone: 'supporting',
    },
  ];
}

/* 7 · Private insurance first. Advice only where no program rule is sourced. */
function privateFirstCards(context: GroupContext): ResultCard[] {
  const { input, province, copy, sources } = context;

  if (!answeredYesOrUnsure(input.privateInsurance)) return [];

  const rule = PRIVATE_FIRST[province];
  const program = rule ? byId(rule.program) : undefined;

  if (rule && program) {
    return [
      {
        id: 'private-first',
        group: 'privateFirst',
        title: copy.privateFirstTitle,
        body: [copy.privateFirstBody(province)],
        ...linkTo(sources.source(rule.source)),
        tone: 'caution',
      },
    ];
  }

  return [
    {
      id: 'private-first-generic',
      group: 'privateFirst',
      title: copy.privateFirstGenericTitle,
      body: [copy.privateFirstGenericBody],
      tone: 'supporting',
    },
  ];
}

/* The Disability Tax Credit line that fits the answers: type 1, insulin, or the general test. */
function dtcBody(input: CheckerInput, copy: ResultCopy) {
  if (input.type === 'type1') return copy.dtcType1Body;
  if (input.therapy === 'insulinInjections' || input.therapy === 'pump') return copy.dtcInsulinBody;

  return copy.dtcOtherBody;
}

/* 8 · The Disability Tax Credit and the RDSP, for everyone. */
function dtcRdspCards(context: GroupContext): ResultCard[] {
  const { input, copy, sources } = context;
  const dtc = byId('fed-dtc');
  const rdsp = byId('fed-rdsp');

  return [
    ...(dtc
      ? [
          {
            id: 'dtc',
            group: 'dtcRdsp' as const,
            title: copy.dtcTitle,
            body: [dtcBody(input, copy)],
            ...linkTo(sources.program(dtc)),
            verifiedOn: dtc.verifiedOn,
            confirm: dtc.confirm,
            tone: 'supporting' as const,
          },
        ]
      : []),
    ...(rdsp ? [programCard(rdsp, 'dtcRdsp', 'supporting', context)] : []),
  ];
}

const GROUP_CARDS: Record<ResultGroup, (context: GroupContext) => ResultCard[]> = {
  nihb: nihbCards,
  vac: vacCards,
  pump: (context) => provincialCards('pump', context),
  cgm: (context) => provincialCards('cgm', context),
  supplies: (context) => provincialCards('supplies', context),
  pharmacare: pharmacareCards,
  privateFirst: privateFirstCards,
  dtcRdsp: dtcRdspCards,
};

/* Where Liivv has no pharmacy (Quebec, the territories), said first. */
function liivvOpeningCards(province: ProvinceCode, copy: ResultCopy): ResultCard[] {
  if (province === 'QC') {
    return [
      {
        id: 'liivv-quebec',
        group: 'liivv',
        title: copy.quebecTitle,
        body: [copy.quebecBody],
        tone: 'caution',
      },
    ];
  }

  if (TERRITORIES.includes(province)) {
    return [
      {
        id: 'liivv-territory',
        group: 'liivv',
        title: copy.territoryTitle,
        body: [copy.territoryBody],
        tone: 'caution',
      },
    ];
  }

  return [];
}

/*
 * The result list, in the owner's group order (RESULT_GROUPS). Quebec and the
 * territories, where Liivv has no pharmacy, are told so first; the list ends
 * with how paying for an order from Liivv works: the provincial drug plan
 * billed directly, an invoice for a claim elsewhere, and never a promise that
 * a claim will be accepted. Pay-later is not on any card: the pump section's
 * intro says it once, as Liivv's own option (funding-checker.tsx).
 */
export function buildResults(
  input: CheckerInput,
  words: Record<string, ProgramWords | undefined>,
  copy: ResultCopy,
  sources: ResultSources,
  locale: string,
): ResultCard[] {
  if (!input.province) return [];

  const context: GroupContext = {
    input,
    province: input.province,
    copy,
    sources,
    words,
    locale,
  };

  const askUs: ResultCard = {
    id: 'liivv-ask-us',
    group: 'liivv',
    title: copy.askUsTitle,
    body: [copy.askUsBody],
    ...(copy.askUsHref
      ? { link: { label: copy.askUsCta, href: copy.askUsHref, external: false } }
      : {}),
    tone: 'supporting',
  };

  return [
    ...liivvOpeningCards(input.province, copy),
    ...RESULT_GROUPS.flatMap((group) => GROUP_CARDS[group](context)),
    askUs,
  ];
}

/* How many of the seven answers are in, province included. */
export function checkerProgress(input: CheckerInput) {
  const answered = CHECKER_QUESTIONS.filter((question) => input[question] !== '').length;

  return { answered, total: CHECKER_QUESTIONS.length };
}
