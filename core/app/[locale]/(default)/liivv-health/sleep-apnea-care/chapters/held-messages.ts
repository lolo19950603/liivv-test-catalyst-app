/* Twin of ../../diabetes-care/chapters/held-messages.ts — functions letter for letter, plus card holds */

/*
 * =============================================================================
 * A HOLD HAS TO COVER SHIPPING, NOT JUST RENDERING — SLEEP APNEA CARE
 * =============================================================================
 * The same rule as Diabetes Care's; the reasoning is in
 * ../../ostomy-care/chapters/held-messages.ts. Held words stay in the message
 * files (the review pack prints them) but are never sent to a browser: the
 * SleepApneaCare namespace reaches the browser only through the nested
 * provider in ../layout.tsx, and these paths are taken out there.
 *
 * Two kinds of hold:
 *   HELD_CLIENT_MESSAGES  a figure kind held at every placement (none today)
 *   HELD_CARD_PATHS       a card held whole (CategoryMeta `held`), or held to
 *                         its title and `heldNote`, and the path lines that
 *                         point at it. The chapter engine renders neither.
 *
 * Erasable TypeScript and statement-form `import type` only, so the
 * content-review export can load this file under Node's type stripping.
 * =============================================================================
 */

import type { AbstractIntlMessages } from 'next-intl';

import type { FigureMeta, SleepHold } from './chapters-meta';

/* Message subtrees owned by a figure kind, from the root of the message tree. */
export interface HeldMessageGroup {
  kind: FigureMeta['kind'];
  paths: readonly string[];
}

/* No Sleep figure kind is held everywhere. */
export const HELD_CLIENT_MESSAGES: readonly HeldMessageGroup[] = [];

/* Message subtrees a card hold covers, by path from the root of the message tree. */
export interface HeldCardGroup {
  hold: SleepHold;
  paths: readonly string[];
}

export const HELD_CARD_PATHS: readonly HeldCardGroup[] = [
  /* 06 card 3, Treatment for children: the whole card waits on ruling C6 (2026-10-13, "default"). */
  {
    hold: 'childTreatmentRuling',
    paths: ['SleepApneaCare.chapters.this-might-be-you.categories.3'],
  },
  /*
   * 06 card 9, First Nations and Inuit: NIHB coverage. Its title and heldNote ship; everything else
   * waits on the Indigenous health partner's review (R8; ruling B1, 2026-10-13, "default").
   */
  {
    hold: 'indigenousPartnerReview',
    paths: [
      'SleepApneaCare.chapters.this-might-be-you.categories.9.items',
      'SleepApneaCare.chapters.this-might-be-you.categories.9.note',
      'SleepApneaCare.chapters.this-might-be-you.categories.9.links',
      'SleepApneaCare.chapters.this-might-be-you.categories.9.figure',
      /* The band card that says where NIHB questions go keeps its words; its eligibility link waits too. */
      'SleepApneaCare.chapters.this-might-be-you.programsBand.cards.4.links',
    ],
  },
  /*
   * paths fragment. The children path's reason for Ch06 card 3 ("Large tonsils or adenoids are a
   * common cause…") waits with the card (ruling C6 "default", 2026-10-13). Merge into the ch06
   * fragment's childTreatmentRuling group if the integrator prefers one group per hold.
   */
  {
    hold: 'childTreatmentRuling',
    paths: ['SleepApneaCare.paths.children.list.reasons.3'],
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
 * The messages to hand a browser: everything except what a Sleep hold covers.
 * `alsoHeld` is more paths of the same kind: the landing copy whose release
 * condition is not met yet (`heldLandingPaths()` in ../landing-meta.ts), the
 * path pages' (`heldPathPaths()` in ./paths-meta.ts) and the funding page's
 * (`heldFundingPaths()` in ../funding/funding-meta.ts), which ../layout.tsx
 * passes. This file may not import those by value, so they are handed in.
 */
export function withoutHeldMessages(
  messages: AbstractIntlMessages,
  alsoHeld: readonly string[] = [],
): AbstractIntlMessages {
  return [
    ...HELD_CLIENT_MESSAGES.flatMap((group) => group.paths),
    ...HELD_CARD_PATHS.flatMap((group) => group.paths),
    ...alsoHeld,
  ].reduce((node, path) => withoutPath(node, path.split('.')), messages);
}
