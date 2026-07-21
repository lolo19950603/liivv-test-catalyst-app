import { describe, expect, it } from 'vitest';

import { buildResults, type CheckerInput, isCheckerReady } from './data';

const ids = (input: CheckerInput) => buildResults(input).map((card) => card.id);

describe('isCheckerReady', () => {
  it('requires both province and diabetes type', () => {
    expect(isCheckerReady({ province: '', type: '', insulin: '', age: '', indigenous: '' })).toBe(
      false,
    );
    expect(isCheckerReady({ province: 'ON', type: '', insulin: '', age: '', indigenous: '' })).toBe(
      false,
    );
    expect(
      isCheckerReady({ province: 'ON', type: 't1', insulin: '', age: '', indigenous: '' }),
    ).toBe(true);
  });
});

describe('buildResults', () => {
  it('Ontario Type 1 on insulin (26–64): pump, CGM, DTC, CDB, RDSP; no free meds/child/NIHB', () => {
    const result = ids({ province: 'ON', type: 't1', insulin: 'yes', age: '26to64', indigenous: 'no' });

    expect(result).toEqual(expect.arrayContaining(['pump', 'cgm', 'dtc', 'cdb', 'rdsp']));
    expect(result).not.toContain('pharmacare'); // Ontario has no pharmacare agreement yet
    expect(result).not.toContain('child-disability');
    expect(result).not.toContain('nihb');
  });

  it('shows free medications where national pharmacare is live (BC)', () => {
    expect(
      ids({ province: 'BC', type: 't1', insulin: 'yes', age: '18to25', indigenous: 'no' }),
    ).toContain('pharmacare');
  });

  it('Type 2 qualifies for the DTC only when on insulin', () => {
    expect(
      ids({ province: 'MB', type: 't2', insulin: 'no', age: '65plus', indigenous: 'no' }),
    ).not.toContain('dtc');

    const withInsulin = ids({ province: 'MB', type: 't2', insulin: 'yes', age: '65plus', indigenous: 'no' });

    expect(withInsulin).toEqual(expect.arrayContaining(['dtc', 'cgm', 'rdsp']));
    expect(withInsulin).not.toContain('cdb'); // Canada Disability Benefit is 18–64 only
    expect(withInsulin).not.toContain('pump'); // insulin pump program is Type 1 only
  });

  it('gives under-18s the Child Disability Benefit, not the Canada Disability Benefit', () => {
    const result = ids({ province: 'AB', type: 't1', insulin: 'yes', age: 'under18', indigenous: 'no' });

    expect(result).toContain('child-disability');
    expect(result).not.toContain('cdb');
  });

  it('adds NIHB for First Nations & Inuit clients', () => {
    expect(
      ids({ province: 'NU', type: 't1', insulin: 'yes', age: '26to64', indigenous: 'yes' }),
    ).toContain('nihb');
  });

  it('shows prevention resources only for prediabetes', () => {
    const result = ids({ province: 'ON', type: 'prediabetes', insulin: 'no', age: '26to64', indigenous: 'no' });

    expect(result).toEqual(expect.arrayContaining(['canrisk', 'small-steps']));
    expect(result).not.toContain('dtc');
    expect(result).not.toContain('pump');
  });

  it('gestational on insulin shows a glucose monitor but not a pump or the DTC', () => {
    const result = ids({ province: 'QC', type: 'gestational', insulin: 'yes', age: '26to64', indigenous: 'no' });

    expect(result).toContain('cgm');
    expect(result).not.toContain('pump');
    expect(result).not.toContain('dtc');
  });

  it('gives every result card content and an official https link', () => {
    const cards = buildResults({ province: 'ON', type: 't1', insulin: 'yes', age: 'under18', indigenous: 'yes' });

    expect(cards.length).toBeGreaterThan(0);

    for (const card of cards) {
      expect(card.title.length).toBeGreaterThan(0);
      expect(card.body.length).toBeGreaterThan(0);
      expect(card.linkUrl).toMatch(/^https:\/\//u);
    }
  });
});
