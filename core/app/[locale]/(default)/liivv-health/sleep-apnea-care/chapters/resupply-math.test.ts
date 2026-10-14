import { describe, expect, it } from 'vitest';

import {
  addMonths,
  addPeriod,
  addWeeks,
  cellPeriods,
  everyFromPerYear,
  isUnruledCount,
  nextDates,
  parseInputDate,
} from './resupply-math';

const day = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

describe('everyFromPerYear (05 G.1)', () => {
  it('gives whole months when 12 ÷ count is a whole number of months or more', () => {
    expect(everyFromPerYear(2)).toEqual({ months: 6 });
    expect(everyFromPerYear(1)).toEqual({ months: 12 });
    expect(everyFromPerYear(12)).toEqual({ months: 1 });
  });

  it('gives weeks, rounded to the nearest week, otherwise', () => {
    /* 52 ÷ 14 = 3.7, about one every 4 weeks. */
    expect(everyFromPerYear(14)).toEqual({ weeks: 4 });
    expect(everyFromPerYear(26)).toEqual({ weeks: 2 });
  });

  it('falls back to weeks for a count G.1 does not rule, and flags it', () => {
    expect(everyFromPerYear(5)).toEqual({ weeks: 10 });
    expect(isUnruledCount(5)).toBe(true);
    expect(isUnruledCount(2)).toBe(false);
    expect(isUnruledCount(14)).toBe(false);
  });

  it('refuses a count that is not positive', () => {
    expect(() => everyFromPerYear(0)).toThrow(RangeError);
  });
});

describe('date arithmetic', () => {
  it('adds months on the same day, or the end of a shorter month', () => {
    expect(day(addMonths(new Date(2026, 0, 15), 6))).toBe('2026-07-15');
    expect(day(addMonths(new Date(2026, 0, 31), 1))).toBe('2026-02-28');
    expect(day(addMonths(new Date(2027, 10, 30), 3))).toBe('2028-02-29');
    expect(day(addMonths(new Date(2026, 9, 14), 60))).toBe('2031-10-14');
  });

  it('adds weeks', () => {
    expect(day(addWeeks(new Date(2026, 11, 20), 4))).toBe('2027-01-17');
    expect(day(addPeriod(new Date(2026, 0, 1), { weeks: 4 }))).toBe('2026-01-29');
    expect(day(addPeriod(new Date(2026, 0, 1), { months: 2 }))).toBe('2026-03-01');
  });

  it('gives both ends of a range', () => {
    const dates = nextDates(new Date(2026, 3, 1), [3, 12]);

    expect(dates.map(day)).toEqual(['2026-07-01', '2027-04-01']);
    expect(nextDates(new Date(2026, 3, 1), 12).map(day)).toEqual(['2027-04-01']);
  });
});

describe('cellPeriods', () => {
  it('reads months first, then a count a year, else nothing', () => {
    expect(cellPeriods(undefined, 6)).toEqual([{ months: 6 }]);
    expect(cellPeriods(undefined, [3, 12])).toEqual([{ months: 3 }, { months: 12 }]);
    expect(cellPeriods(2, undefined)).toEqual([{ months: 6 }]);
    expect(cellPeriods(14, undefined)).toEqual([{ weeks: 4 }]);
    expect(cellPeriods(undefined, undefined)).toEqual([]);
  });
});

describe('parseInputDate', () => {
  it('reads a date input value as a local calendar date', () => {
    const date = parseInputDate('2026-10-14');

    expect(date && day(date)).toBe('2026-10-14');
  });

  it('refuses anything else', () => {
    expect(parseInputDate('')).toBeUndefined();
    expect(parseInputDate('2026-02-30')).toBeUndefined();
    expect(parseInputDate('14/10/2026')).toBeUndefined();
  });
});
