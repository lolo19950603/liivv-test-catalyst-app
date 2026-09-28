/*
 * Shared by the server (matching the transcript to the script) and the page
 * (matching script lines to elements), so both sides agree on what a word is.
 */
export function normalizeWords(text: string): string[] {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
}

export interface LineTiming {
  /** The spoken line, as written on the page. */
  text: string;
  /** Seconds from the start of the stop's audio. */
  start: number;
}

export interface StopTimings {
  version: 1;
  duration: number;
  lines: LineTiming[];
}
