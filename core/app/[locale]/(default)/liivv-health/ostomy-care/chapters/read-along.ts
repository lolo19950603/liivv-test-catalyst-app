import { type LineTiming, normalizeWords } from '~/lib/chapter-audio/normalize';

/* Controls, decoration and navigation never hold the words being read. */
const SKIP = 'button, svg, script, style, nav, [aria-hidden="true"], .oc-audio-bar, .oc-journey-hud';

export const LINE_CLASS = 'is-audio-line';

function toLineTiming(value: unknown): LineTiming | null {
  if (!value || typeof value !== 'object' || !('text' in value) || !('start' in value)) return null;

  const { text, start } = value;

  return typeof text === 'string' && typeof start === 'number' ? { text, start } : null;
}

export function parseTimings(value: unknown): LineTiming[] | null {
  if (!value || typeof value !== 'object' || !('lines' in value) || !Array.isArray(value.lines)) {
    return null;
  }

  const lines = value.lines
    .map(toLineTiming)
    .filter((line): line is LineTiming => line !== null);

  return lines.length ? lines : null;
}

export async function fetchTimings(url: string): Promise<LineTiming[] | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) return null;

    const body: unknown = await response.json();

    return parseTimings(body);
  } catch {
    return null;
  }
}

function readingRoot(stop: number): HTMLElement | null {
  return document.getElementById(stop === 0 ? 'oc-chapter' : `card-${stop}`);
}

/*
 * Each spoken line goes to the smallest visible element that contains it, so
 * a list item lights up rather than the whole list around it.
 */
export function findLineElements(stop: number, lines: LineTiming[]): Array<HTMLElement | null> {
  const root = readingRoot(stop);

  if (!root) return lines.map(() => null);

  const candidates = Array.from(root.querySelectorAll<HTMLElement>('*'))
    .filter((el) => !el.closest(SKIP))
    .filter((el) => stop !== 0 || !el.closest('[id^="card-"]'))
    .filter((el) => el.getClientRects().length > 0)
    .map((el) => ({ el, words: ` ${normalizeWords(el.textContent ?? '').join(' ')} ` }))
    .filter((candidate) => candidate.words.trim());

  return lines.map((line) => {
    const words = normalizeWords(line.text);

    if (!words.length) return null;

    const needle = ` ${words.slice(0, 12).join(' ')} `;

    return candidates.reduce<{ el: HTMLElement; size: number } | null>((best, candidate) => {
      if (!candidate.words.includes(needle)) return best;
      if (best && best.size <= candidate.words.length) return best;

      return { el: candidate.el, size: candidate.words.length };
    }, null)?.el ?? null;
  });
}

/*
 * Script lines in the order the page shows them. Figures lay a card out their
 * own way, so the recording's order and the page's order can differ; playing
 * by page order keeps the voice moving down the page. A line with no element
 * stays right after the line before it.
 */
export function pageOrder(elements: Array<HTMLElement | null>): number[] {
  let previous: HTMLElement | null = null;
  const anchors = elements.map((el) => {
    previous = el ?? previous;

    return previous;
  });

  return elements
    .map((_, line) => line)
    .sort((a, b) => {
      const first = anchors[a];
      const second = anchors[b];

      if (!first || !second || first === second) return a - b;

      // eslint-disable-next-line no-bitwise
      return first.compareDocumentPosition(second) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
    });
}

/* Where a line stops in the recording: where the next recorded line begins. */
export function lineEnd(lines: LineTiming[], line: number): number {
  return lines[line + 1]?.start ?? Number.POSITIVE_INFINITY;
}

/* Share of the stop heard so far, counted in page order rather than file order. */
export function playedShare(
  lines: LineTiming[],
  order: number[],
  pos: number,
  time: number,
  duration: number,
): number {
  if (!duration) return 0;

  const before = order
    .slice(0, pos)
    .reduce(
      (sum, line) => sum + Math.min(lineEnd(lines, line), duration) - (lines[line]?.start ?? 0),
      0,
    );
  const current = order[pos];
  const within = current === undefined ? 0 : Math.max(0, time - (lines[current]?.start ?? 0));

  return Math.min(1, (before + within) / duration);
}

export function activeLineIndex(lines: LineTiming[], time: number): number {
  // A small lead so the highlight lands as the first word is spoken, not after.
  const now = time + 0.15;

  return lines.findLastIndex((line) => line.start <= now);
}
