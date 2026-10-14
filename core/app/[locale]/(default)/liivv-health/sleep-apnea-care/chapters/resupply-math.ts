/*
 * =============================================================================
 * THE RESUPPLY PLANNER'S ARITHMETIC (Everyday "Liivving" card 3)
 * =============================================================================
 * Pure date and count arithmetic for ./everyday-figures.tsx, with no React and
 * no imports, so it can be read and tested on its own (./resupply-math.test.ts).
 * Nothing here is advice: it turns a schedule a column already prints ("up to
 * 2 a year", "every 6 months") into a date, and the figure says so under every
 * result (`figure.dateCalc.disclaimer`).
 *
 * The rounding is 05-everyday-liivving.md G.1 exactly: a count a year becomes
 * "about one every 12 ÷ count months" when that is a whole number of months or
 * more (2 a year: every 6 months); otherwise "about one every 52 ÷ count
 * weeks", rounded to the nearest whole week (14 a year: 3.7, so every 4
 * weeks). A count whose 12 ÷ count is a month or more but not whole (5 a
 * year: 2.4 months) is not ruled by G.1; it falls back to weeks and is a
 * question for the nurse, not a guess. No count on the page today is one
 * (NIHB's counts are 2 and 14).
 * =============================================================================
 */

export type Period = { months: number } | { weeks: number };

/* A schedule column's period for a part: a number of months, or a range of them. */
export type MonthPeriod = number | readonly [number, number];

/* 12 ÷ count months when whole; otherwise 52 ÷ count weeks, to the nearest week. */
export function everyFromPerYear(count: number): Period {
  if (!Number.isFinite(count) || count <= 0) {
    throw new RangeError(`everyFromPerYear: count must be positive, got ${count}`);
  }

  const months = 12 / count;

  if (months >= 1 && Number.isInteger(months)) return { months };

  return { weeks: Math.max(1, Math.round(52 / count)) };
}

/* Whether a count needs the nurse's ruling (G.1 does not cover it): a month or more, not whole. */
export function isUnruledCount(count: number) {
  const months = 12 / count;

  return months >= 1 && !Number.isInteger(months);
}

/* The last day of a month (month 0-11), in the calendar of local dates. */
function daysIn(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/*
 * `n` calendar months after `date`, on the same day of the month, or the last
 * day of a shorter month (January 31 plus one month is the end of February).
 */
export function addMonths(date: Date, n: number): Date {
  const total = date.getMonth() + n;
  const year = date.getFullYear() + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  const day = Math.min(date.getDate(), daysIn(year, month));

  return new Date(year, month, day);
}

export function addWeeks(date: Date, n: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + n * 7);
}

export function addPeriod(date: Date, period: Period): Date {
  return 'months' in period ? addMonths(date, period.months) : addWeeks(date, period.weeks);
}

/* One date for a single period, or both ends of a range ("every 3 to 12 months"). */
export function nextDates(last: Date, period: MonthPeriod): [Date] | [Date, Date] {
  if (typeof period === 'number') return [addMonths(last, period)];

  return [addMonths(last, period[0]), addMonths(last, period[1])];
}

/*
 * The periods a cell has, from the planner's meta: its months (one, or both
 * ends of a range), or its count a year as a period. None for a cell with
 * neither ("When worn", "Not listed", "Not covered", "Check your manual").
 */
export function cellPeriods(
  perYear: number | undefined,
  months: MonthPeriod | undefined,
): Period[] {
  if (months !== undefined) {
    return typeof months === 'number'
      ? [{ months }]
      : [{ months: months[0] }, { months: months[1] }];
  }

  if (perYear !== undefined) return [everyFromPerYear(perYear)];

  return [];
}

/*
 * A date typed into <input type="date"> ("2026-10-14"), read as a local
 * calendar date, so no time zone moves it a day. Anything else is undefined.
 */
export function parseInputDate(value: string): Date | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

  if (!match) return undefined;

  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);

  return date.getMonth() === month - 1 && date.getDate() === day ? date : undefined;
}
