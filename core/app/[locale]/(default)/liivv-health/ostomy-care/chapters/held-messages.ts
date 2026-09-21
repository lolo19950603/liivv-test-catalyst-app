/*
 * =============================================================================
 * A HOLD HAS TO COVER SHIPPING, NOT JUST RENDERING
 * =============================================================================
 * `held` in chapters-meta.ts takes a figure off every page, in both locales,
 * until a named ruling is recorded. `gateFigures` in chapters-data.ts drops it
 * before anything looks at it, and the served markup is genuinely clean.
 *
 * The words were not. The root layout hands the WHOLE message object to
 * `NextIntlClientProvider` (D22 deferred `pick()` scoping), so every page on the
 * store — /cart and every product page included — carried the held figure's
 * copy in its RSC payload, retrievable from the HTML by anyone who looked. A
 * hold that is a render switch and not a shipping switch is only half a hold:
 * the whole point of `writtenRuling` is that nobody outside the review has seen
 * this wording yet.
 *
 * So the held figure's message subtrees are removed from what the client is
 * given. The review pack still prints them — the ruling is made on the words as
 * well as on the drawing — and they stay in the message files, where lifting the
 * hold is still one line in chapters-meta.ts.
 *
 * WHAT IS LISTED HERE, AND WHAT IS NOT
 * -----------------------------------------------------------------------------
 * Only a figure kind that is held at EVERY placement it has. The bowel
 * reference is held on Chapter 03 card 2 and renders on Chapter 02 card 1, so
 * its strings are needed and are not listed. `core/scripts/export-content-review.mjs`
 * checks both directions: a kind held everywhere with no entry here fails, and
 * an entry here for a kind that renders somewhere fails too, so this cannot
 * fall behind the holds or outlive one.
 *
 * Server-only in practice: the paths are applied in the root layout, before the
 * provider, so nothing in a browser bundle reads this file.
 * =============================================================================
 */

import type { AbstractIntlMessages } from 'next-intl';

import type { FigureMeta } from './chapters-meta';

/* Message subtrees owned by a figure kind, from the root of the message tree. */
export interface HeldMessageGroup {
  kind: FigureMeta['kind'];
  paths: readonly string[];
}

export const HELD_CLIENT_MESSAGES: readonly HeldMessageGroup[] = [
  {
    // C08, "parts of a pouching system", Chapter 02 card 3. Held on
    // `writtenRuling`: the owner and the NSWOC have to rule in writing that an
    // unbranded schematic is not product imagery in an explanatory figure, and
    // IP counsel has to check the drawing for trade dress.
    kind: 'partsOfSystem',
    paths: [
      // The four terms and their definitions.
      'OstomyCare.chapters.get-to-know-your-stoma.categories.3.figure',
      // The view controls and their status lines.
      'OstomyCare.ui.chapter.parts',
    ],
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

/* The messages to hand a browser: everything except what a hold covers. */
export function withoutHeldMessages(messages: AbstractIntlMessages): AbstractIntlMessages {
  return HELD_CLIENT_MESSAGES.flatMap((group) => group.paths).reduce(
    (node, path) => withoutPath(node, path.split('.')),
    messages,
  );
}
