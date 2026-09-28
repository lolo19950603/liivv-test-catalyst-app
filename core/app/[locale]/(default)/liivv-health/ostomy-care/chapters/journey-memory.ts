'use client';

/*
 * Lightweight per-chapter memory for Living Trail: last stop viewed, and a
 * shortlist of saved stops. localStorage only — no accounts, no sync.
 */

const CONTINUE_PREFIX = 'oc-journey-continue:';
const SAVED_PREFIX = 'oc-journey-saved:';

export type ContinueStop = {
  number: number;
  title: string;
};

function continueKey(slug: string) {
  return `${CONTINUE_PREFIX}${slug}`;
}

function savedKey(slug: string) {
  return `${SAVED_PREFIX}${slug}`;
}

export function readContinue(slug: string): ContinueStop | null {
  try {
    const raw = localStorage.getItem(continueKey(slug));

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) return null;

    const number = 'number' in parsed ? parsed.number : null;
    const title = 'title' in parsed ? parsed.title : null;

    if (typeof number !== 'number' || !Number.isFinite(number) || typeof title !== 'string') {
      return null;
    }

    return { number, title };
  } catch {
    return null;
  }
}

export function writeContinue(slug: string, stop: ContinueStop) {
  try {
    localStorage.setItem(continueKey(slug), JSON.stringify(stop));
  } catch {
    /* Storage blocked or full — visit still works without memory. */
  }
}

export function readSaved(slug: string): number[] {
  try {
    const raw = localStorage.getItem(savedKey(slug));

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter((value): value is number => typeof value === 'number' && Number.isFinite(value));
  } catch {
    return [];
  }
}

export function writeSaved(slug: string, numbers: number[]) {
  try {
    localStorage.setItem(savedKey(slug), JSON.stringify(numbers));
  } catch {
    /* Storage blocked or full. */
  }
}
