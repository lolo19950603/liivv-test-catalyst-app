/*
 * The `<link>…</link>` phrases in a landing sentence.
 *
 * The same rule as a chapter card's (CardLinkMeta in ../chapters/types.ts):
 * the tags wrap words already in the sentence and never add any. A landing
 * answer can carry more than one, so the site's meta lists their targets in
 * the order the tags appear. The sentence is read from the message object,
 * never through t(), which would take the tags for rich-text markup.
 */

const TAGGED = /<link>(.*?)<\/link>/;
/* The same, as a split separator: the capture keeps each tagged phrase. */
const TAGGED_RUNS = /(<link>.*?<\/link>)/;

export interface LinkPart {
  text: string;
  /* The index of this phrase among the sentence's links; absent for plain text. */
  link?: number;
}

/* The sentence as plain runs and linked phrases, in order. */
export function linkParts(sentence: string): LinkPart[] {
  let links = 0;

  return sentence
    .split(TAGGED_RUNS)
    .filter(Boolean)
    .map((run) => {
      const tagged = TAGGED.exec(run);

      if (!tagged) return { text: run };

      links += 1;

      return { text: tagged[1] ?? '', link: links - 1 };
    });
}

/* How many linked phrases a sentence carries. */
export function linkCount(sentence: string): number {
  return linkParts(sentence).filter((part) => part.link !== undefined).length;
}
