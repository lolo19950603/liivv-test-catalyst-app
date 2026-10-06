/*
 * =============================================================================
 * MICROSITE PATH PAGES — STRUCTURE TYPES
 * =============================================================================
 * A path page is a generated reading list for one kind of reader (a type of
 * diabetes, say): a sourced two-paragraph intro, the cards across the site's
 * chapters that matter most for that reader, in order, each with the reason it
 * is there, and a door to the site's funding page. It writes no card of its
 * own: every title it lists is read from the chapter it links to, so a path
 * can never disagree with the card it opens.
 *
 * A site fills these in with its own names (chapter slugs, source ids) in its
 * own paths-meta.ts, which ./compose.ts joins with the site's messages.
 *
 * Erasable TypeScript only, like ../chapters/types.ts: a site's paths-meta.ts
 * is loaded by the content-review export under Node's type stripping.
 * =============================================================================
 */

/*
 * Where an entry sits in the reading order, shown as the heading over a run of
 * entries. Entries are grouped by consecutive runs in the order the meta lists
 * them, never re-sorted by stage, so a path can come back to a stage on
 * purpose (Diabetes Care's less common types do, after its safety cards).
 */
export type PathStage = 'start' | 'types' | 'safe' | 'tools' | 'everyday' | 'season';

export interface PathEntryMeta<Chapter extends string = string, Src extends string = string> {
  /** The chapter the card is on. */
  chapter: Chapter;
  /** The card's 1-based number on that chapter (its `#card-<n>` anchor). */
  card: number;
  stage: PathStage;
  /*
   * The register entries behind the entry's reason, where the reason states a
   * fact. Listed in the page's sources and in the content review; a reason that
   * is navigation only has none.
   */
  sources?: readonly Src[];
  /** The reason rests on international guidance, which the sentence names. */
  international?: true;
}

export interface PathMeta<
  Slug extends string = string,
  Chapter extends string = string,
  Src extends string = string,
> {
  slug: Slug;
  heroImage: string;
  /** The page's accent colour (`--chapter-accent`). */
  accent: string;
  /** The reading list, in order. Reasons are the numbered keys `list.reasons.<index + 1>`. */
  entries: ReadonlyArray<PathEntryMeta<Chapter, Src>>;
  /** The sources behind each intro paragraph, index-matched to `intro.body.<n>`. */
  introSources: ReadonlyArray<readonly Src[]>;
  /** The sources behind the funding door's body. */
  fundingSources: readonly Src[];
  /*
   * Whether the pharmacist band belongs on this path at all. It still renders
   * only once the site's release condition for it is met.
   */
  pharmacist: boolean;
}

/* The words of one path, as the site's messages hold them under `paths.<slug>`. */
export interface PathWords {
  title: string;
  heroBody: string;
  intro: { eyebrow: string; heading: string; body: Record<string, string> };
  list: { heading: string; intro: string; reasons: Record<string, string> };
  funding: { heading: string; body: string; cta: string };
  pharmacist?: { eyebrow: string; heading: string; body: string; cta: string };
}
