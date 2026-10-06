/* Twin of ostomy-care/chapters/journey-memory.ts @3b343c6e — port fixes both ways until Phase 2 */

'use client';

/*
 * Lightweight per-chapter memory for Living Trail: last stop viewed, and a
 * shortlist of saved stops. localStorage only — no accounts, no sync.
 *
 * The keys are the site's own (`continuePrefix` and `savedPrefix` in its
 * `site.storage`, followed by the chapter slug), so two sites with a chapter of
 * the same slug never read each other's place or bookmarks.
 */

import type { SiteStorage } from '../site';

type JourneyKeys = Pick<SiteStorage, 'continuePrefix' | 'savedPrefix'>;

/*
 * `title` is still written, so a stored value keeps the shape Ostomy's twin
 * reads and the shape earlier `dc-` values already have, but it is never shown:
 * it is in whatever language the reader last read in. The Continue chip names
 * the card from the page it is on, by `number` (journey-memory-context.tsx).
 * A stored value without a title still reads.
 */
export interface ContinueStop {
  number: number;
  title?: string;
}

function continueKey(storage: JourneyKeys, slug: string) {
  return `${storage.continuePrefix}${slug}`;
}

function savedKey(storage: JourneyKeys, slug: string) {
  return `${storage.savedPrefix}${slug}`;
}

export function readContinue(storage: JourneyKeys, slug: string): ContinueStop | null {
  try {
    const raw = localStorage.getItem(continueKey(storage, slug));

    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== 'object' || parsed === null) return null;

    const number = 'number' in parsed ? parsed.number : null;
    const title = 'title' in parsed ? parsed.title : null;

    if (typeof number !== 'number' || !Number.isFinite(number)) return null;

    return typeof title === 'string' ? { number, title } : { number };
  } catch {
    return null;
  }
}

export function writeContinue(storage: JourneyKeys, slug: string, stop: ContinueStop) {
  try {
    localStorage.setItem(continueKey(storage, slug), JSON.stringify(stop));
  } catch {
    /* Storage blocked or full — visit still works without memory. */
  }
}

export function readSaved(storage: JourneyKeys, slug: string): number[] {
  try {
    const raw = localStorage.getItem(savedKey(storage, slug));

    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);

    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (value): value is number => typeof value === 'number' && Number.isFinite(value),
    );
  } catch {
    return [];
  }
}

export function writeSaved(storage: JourneyKeys, slug: string, numbers: number[]) {
  try {
    localStorage.setItem(savedKey(storage, slug), JSON.stringify(numbers));
  } catch {
    /* Storage blocked or full. */
  }
}
