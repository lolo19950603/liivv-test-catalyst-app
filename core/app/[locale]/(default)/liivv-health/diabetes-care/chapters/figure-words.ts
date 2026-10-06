/*
 * Reading a card's `figure` messages, for this site's own figures
 * (./site-figures.tsx and the figures it registers).
 *
 * `figureWords` is the card's `figure` messages as they are, typed `unknown`
 * below the engine's own keys. These read it without a cast: a missing or
 * misshapen entry reads as empty, and an empty label renders as nothing.
 */

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function entry(node: unknown, key: string): unknown {
  return isRecord(node) ? node[key] : undefined;
}

export function text(node: unknown, key: string): string {
  const value = entry(node, key);

  return typeof value === 'string' ? value : '';
}

/* A numbered-key object ("1", "2", …) in order, each with its key. */
export function numbered(node: unknown): Array<{ key: number; value: unknown }> {
  if (!isRecord(node)) return [];

  return Object.keys(node)
    .map(Number)
    .filter(Number.isInteger)
    .sort((a, b) => a - b)
    .map((key) => ({ key, value: node[String(key)] }));
}
