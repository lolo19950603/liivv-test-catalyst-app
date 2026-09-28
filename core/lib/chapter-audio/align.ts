import type { TranscriptWord } from '~/lib/openai/speech';

import { type LineTiming, normalizeWords } from './normalize';

interface ScriptToken {
  token: string;
  line: number;
}

interface HeardToken {
  token: string;
  start: number;
}

/*
 * Longest common subsequence between the words we asked for and the words
 * Whisper heard. Transcripts spell numbers and names their own way, so an
 * exact word-for-word walk drifts; the LCS skips those and keeps the rest.
 */
function matchTokens(script: ScriptToken[], heard: HeardToken[]): Array<number | undefined> {
  const n = script.length;
  const m = heard.length;
  const width = m + 1;
  const table = new Uint32Array((n + 1) * width);

  for (let row = n - 1; row >= 0; row -= 1) {
    for (let col = m - 1; col >= 0; col -= 1) {
      table[row * width + col] =
        script[row]?.token === heard[col]?.token
          ? (table[(row + 1) * width + col + 1] ?? 0) + 1
          : Math.max(table[(row + 1) * width + col] ?? 0, table[row * width + col + 1] ?? 0);
    }
  }

  const times: Array<number | undefined> = new Array<number | undefined>(n).fill(undefined);
  let i = 0;
  let j = 0;

  while (i < n && j < m) {
    if (script[i]?.token === heard[j]?.token) {
      times[i] = heard[j]?.start;
      i += 1;
      j += 1;
    } else if ((table[(i + 1) * width + j] ?? 0) >= (table[i * width + j + 1] ?? 0)) {
      i += 1;
    } else {
      j += 1;
    }
  }

  return times;
}

export function alignLines(
  lines: string[],
  words: TranscriptWord[],
  duration: number,
): LineTiming[] {
  const script = lines.flatMap((text, line) =>
    normalizeWords(text).map((token) => ({ token, line })),
  );
  const heard = words.flatMap((word) =>
    normalizeWords(word.word).map((token) => ({ token, start: word.start })),
  );
  const times = matchTokens(script, heard);

  const firstHeard = lines.map((_, line) => {
    const index = script.findIndex((token, k) => token.line === line && times[k] !== undefined);

    return index >= 0 ? times[index] : undefined;
  });

  // Lines with no matched word sit between their neighbours, spread by length.
  const starts = firstHeard.map((start, line) => {
    if (start !== undefined) return start;

    const before = firstHeard.slice(0, line).findLastIndex((value) => value !== undefined);
    const afterOffset = firstHeard.slice(line + 1).findIndex((value) => value !== undefined);
    const after = afterOffset >= 0 ? line + 1 + afterOffset : lines.length;
    const from = before >= 0 ? (firstHeard[before] ?? 0) : 0;
    const to = after < lines.length ? (firstHeard[after] ?? duration) : duration;
    const span = after - before;

    return from + ((to - from) * (line - before)) / Math.max(span, 1);
  });

  // Starts must never run backwards, or the highlight would jump back.
  let floor = 0;

  return lines.map((text, line) => {
    floor = Math.max(floor, starts[line] ?? floor);

    return { text, start: Math.round(floor * 100) / 100 };
  });
}
