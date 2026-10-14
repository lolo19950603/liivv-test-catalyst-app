import { describe, expect, it } from 'vitest';

import {
  buildResults,
  type CheckerInput,
  checkerProgress,
  EMPTY_INPUT,
  matches,
  programParagraphs,
  type ResultContext,
  type ResultCopy,
} from './funding-data';
import { FUNDING_DATA, heldFundingPaths, PROGRAM_META } from './funding-meta';

/* Words that name what they stand for, so a test can see which card it got. */
const copy: ResultCopy = {
  caution: (id) => ({ title: `caution:${id}`, body: 'b' }),
  stillChecking: (province) => ({ title: `checking:${province}`, body: 'b' }),
  stillCheckingLine: (line) => ({ title: `line:${line}`, body: 'b' }),
  notTestedYet: { title: 'notTested', body: 'b', link: { label: 'l', href: '/x' } },
  testNote: (id) => (id === 'on-adp-respiratory' ? 'level-1-note' : undefined),
  suppliesNote: (id) => (id === 'sk-sail-cpap' ? 'sk-supplies-note' : undefined),
  adpNoSupplies: { title: 'adpNoSupplies', body: 'b' },
  noConfirmed: (group, province) => ({ title: `none:${group}:${province}`, body: 'b' }),
  privateFirst: { title: 'privateFirst', body: 'b' },
  buyFirst: (province) => ({ title: 'buyFirst', body: [`buyFirst:${province}`] }),
  askUs: { title: 'askUs', body: 'b' },
  findOffice: 'Find your office',
  phones: (owner) =>
    owner.phones?.map((group) => ({
      office: group.office,
      numbers: group.numbers.map((n) => ({ text: n.number, tel: n.number })),
    })),
};

/* Every program's words, as if none were held (the page strips held ones itself). */
const words = Object.fromEntries(
  PROGRAM_META.map((meta) => [meta.id, { covered: `covered:${meta.id}` }]),
);

const context: ResultContext = {
  data: FUNDING_DATA,
  words,
  copy,
  sources: {
    program: (meta) => ({
      label: meta.sources[0],
      href: `https://x/${meta.sources[0]}`,
      hrefLang: 'en',
    }),
    source: (id) => ({ label: id, href: `https://x/${id}`, hrefLang: 'en' }),
  },
  locale: 'en',
};

const run = (answers: Partial<CheckerInput>) =>
  buildResults({ ...EMPTY_INPUT, ...answers }, context);

const ids = (answers: Partial<CheckerInput>) => run(answers).map((card) => card.id);

describe('buildResults', () => {
  it('shows nothing until a province is chosen', () => {
    expect(run({})).toEqual([]);
  });

  it('puts the province notes first: Quebec is still being checked', () => {
    const cards = run({ province: 'QC' });

    expect(cards[0]?.title).toBe('caution:qc-still-checking');
    expect(cards.map((card) => card.id)).toContain('tax-fed-cra-medical');
    expect(cards.at(-1)?.id).toBe('liivv-ask-us');
  });

  it('says we are still checking a province with no program on record', () => {
    const cards = run({ province: 'NS' });

    expect(cards[0]?.title).toBe('checking:NS');
    /* No second "not found" card where the province note already says so. */
    expect(cards.some((card) => card.title.startsWith('none:'))).toBe(false);
  });

  it('lists Ontario ADP for a machine, and never hides it for a home test, only annotates it', () => {
    const cards = run({ province: 'ON', need: 'first', test: 'home' });
    const adp = cards.find((card) => card.id === 'machine-on-adp-respiratory');

    expect(adp?.tone).toBe('caution');
    expect(adp?.body).toContain('level-1-note');
  });

  it('shows ADP has no supplies for an Ontario reader asking about supplies, and no buy-first card', () => {
    const list = ids({ province: 'ON', need: 'supplies' });

    expect(list).toContain('supplies-on-odsp-msn');
    expect(list).toContain('supplies-adp-no-supplies');
    expect(list).not.toContain('machine-on-adp-respiratory');
    expect(list).not.toContain('liivv-buy-first');
  });

  it('leaves assistance-only programs out only on an explicit no', () => {
    expect(ids({ province: 'BC', assistance: 'no' })).not.toContain('machine-bc-bcea-breathing');
    expect(run({ province: 'BC' }).find((c) => c.id === 'machine-bc-bcea-breathing')?.tone).toBe(
      'supporting',
    );
    expect(
      run({ province: 'BC', assistance: 'yes' }).find((c) => c.id === 'machine-bc-bcea-breathing')
        ?.tone,
    ).toBe('primary');
  });

  it('renders a row in both groups once, under machine unless the reader asked about supplies', () => {
    const both = ids({ province: 'SK' });

    expect(both.filter((id) => id.endsWith('sk-sail-cpap'))).toEqual(['machine-sk-sail-cpap']);

    const supplies = run({ province: 'SK', need: 'supplies' });
    const sail = supplies.find((card) => card.id === 'supplies-sk-sail-cpap');

    expect(sail?.body).toContain('sk-supplies-note');
  });

  it('puts the First Nations Health Authority first in BC, with NIHB after it', () => {
    const list = ids({ province: 'BC', indigenous: 'yes' });

    expect(list.indexOf('nihb-bc-fnha-mse')).toBeLessThan(
      list.indexOf('nihb-fed-nihb-respiratory'),
    );
    expect(ids({ province: 'ON', indigenous: 'no' })).not.toContain('nihb-fed-nihb-respiratory');
  });

  it('shows a held program without its words: where to turn, its page and its date', () => {
    const nihb = run({ province: 'ON', indigenous: 'yes' }).find(
      (card) => card.id === 'nihb-fed-nihb-respiratory',
    );

    expect(nihb?.body).toEqual([]);
    expect(nihb?.link?.label).toBe('Find your office');
    expect(nihb?.verifiedOn).toBeTruthy();
  });

  it('adds the not-tested-yet card and private insurance first when answered', () => {
    const list = ids({ province: 'MB', test: 'notYet', privateInsurance: 'unsure' });

    expect(list).toContain('province-not-tested-yet');
    expect(list).toContain('private-first');
  });

  it('ends with the buy-first card for a machine, then how ordering from Liivv works', () => {
    const cards = run({ province: 'ON', need: 'first' });

    expect(cards.at(-2)?.id).toBe('liivv-buy-first');
    expect(cards.at(-2)?.body).toEqual(['buyFirst:ON']);
    expect(cards.at(-1)?.id).toBe('liivv-ask-us');
  });
});

describe('matches', () => {
  it('rules a program out by need, and never by an unanswered question', () => {
    expect(matches({ needs: ['supplies'] }, { ...EMPTY_INPUT, need: 'first' })).toBe('no');
    expect(matches({ needs: ['supplies'] }, EMPTY_INPUT)).toBe('yes');
    expect(matches({ assistanceOnly: true }, { ...EMPTY_INPUT, assistance: 'unsure' })).toBe(
      'maybe',
    );
  });
});

describe('checkerProgress', () => {
  it('counts the six optional answers, not the province', () => {
    expect(checkerProgress({ ...EMPTY_INPUT, province: 'ON' })).toEqual({ answered: 0, total: 6 });
    expect(
      checkerProgress({ ...EMPTY_INPUT, province: 'ON', need: 'first', test: 'home' }),
    ).toEqual({
      answered: 2,
      total: 6,
    });
  });
});

describe('the record', () => {
  it('holds the NIHB and FNHA words until the partner review (ruling B1)', () => {
    expect(heldFundingPaths()).toEqual([
      'SleepApneaCare.funding.programs.fed-nihb-respiratory',
      'SleepApneaCare.funding.programs.bc-fnha-mse',
    ]);
  });

  it('prints a program’s paragraphs in order, skipping the ones it has none of', () => {
    expect(programParagraphs({ covered: 'a', notes: 'd' })).toEqual(['a', 'd']);
    expect(programParagraphs(undefined)).toEqual([]);
  });

  it('never names a machine retailer or a setting in any program name', () => {
    PROGRAM_META.forEach((meta) => {
      expect(meta.programName).not.toMatch(/cpap\s*outlet|diabetes\s*express|cm\s*h2o/i);
    });
  });
});
