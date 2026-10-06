/* Twin of ostomy-care/chapters/held-messages.ts @3b343c6e — port fixes both ways until Phase 2 */

/*
 * =============================================================================
 * A HOLD HAS TO COVER SHIPPING, NOT JUST RENDERING — DIABETES CARE
 * =============================================================================
 * The same rule as Ostomy's, for the DiabetesCare namespace; the reasoning is
 * in ../../ostomy-care/chapters/held-messages.ts. A figure that is `held` is
 * taken off every page until a named ruling is recorded, and its words have to
 * stay off the page too: a hold is a promise that nobody outside the review
 * has seen that wording yet.
 *
 * The DiabetesCare namespace is not in what the root layout ships. It reaches
 * the browser only through the nested provider in ../layout.tsx, and that is
 * where these paths are applied, before the provider. The review pack still
 * prints the held words, and they stay in the message files.
 *
 * A hold lists every message subtree its figure kind
 * owns, by path from the root of the message tree ('DiabetesCare.…'), and only
 * for a kind that is held at every placement it has.
 *
 * Erasable TypeScript and statement-form `import type` only, so the
 * content-review export can load this file under Node's type stripping. That
 * is also why the two functions below are copied from the Ostomy file rather
 * than imported from it.
 * =============================================================================
 */

import type { AbstractIntlMessages } from 'next-intl';

import type { FigureMeta } from './chapters-meta';

/*
 * Message subtrees owned by a figure kind, from the root of the message tree:
 * a kind the engine draws, or one of this site's own.
 */
export interface HeldMessageGroup {
  kind: FigureMeta['kind'];
  paths: readonly string[];
}

/*
 * New to the Journey card 2's door labels were held here until Know Your Type
 * was served (`knowYourTypeRoute`, lifted with ruling N12 on its default), and
 * now ship with the doors.
 */
export const HELD_CLIENT_MESSAGES: readonly HeldMessageGroup[] = [
  /*
   * Your Tools card 2's meter picker, held as `meterData` (chapters-meta.ts):
   * its labels, and the one shared label only it reads. The card's own
   * sentences are not part of it and ship as usual.
   */
  {
    kind: 'meterMatch',
    paths: ['DiabetesCare.chapters.your-tools.categories.2.figure', 'DiabetesCare.ui.meterMatch'],
  },
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/*
 * The node with one path removed, copying only the objects along that path.
 * Everything else is shared with the original, so this is not a deep clone of
 * the message tree on every request.
 */
function withoutPath(node: AbstractIntlMessages, path: readonly string[]): AbstractIntlMessages {
  const [head, ...rest] = path;

  if (head === undefined || !isRecord(node) || !(head in node)) {
    return node;
  }

  if (rest.length === 0) {
    const { [head]: _removed, ...kept } = node;

    return kept;
  }

  const child = node[head];

  if (typeof child === 'string' || child === undefined) {
    return node;
  }

  return { ...node, [head]: withoutPath(child, rest) };
}

/*
 * The messages to hand a browser: everything except what a Diabetes hold
 * covers. `alsoHeld` is more paths of the same kind that are not a figure's:
 * the landing copy whose release condition is not met yet
 * (`heldLandingPaths()` in ../landing-meta.ts) and the path pages' pharmacist
 * band (`heldPathPaths()` in ./paths-meta.ts), which ../layout.tsx passes.
 * This file may not import that list by value, so it is handed in.
 */
export function withoutHeldMessages(
  messages: AbstractIntlMessages,
  alsoHeld: readonly string[] = [],
): AbstractIntlMessages {
  return [...HELD_CLIENT_MESSAGES.flatMap((group) => group.paths), ...alsoHeld].reduce(
    (node, path) => withoutPath(node, path.split('.')),
    messages,
  );
}
