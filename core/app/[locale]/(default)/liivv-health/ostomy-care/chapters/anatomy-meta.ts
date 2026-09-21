/*
 * =============================================================================
 * BOWEL REFERENCE STILL (C04) — WHAT IS NOT LANGUAGE
 * =============================================================================
 * The still is one flat, wordless picture of normal bowel anatomy, rendered
 * from two openly licensed models by `core/scripts/render-bowel-reference.mjs`.
 * Everything a reader can read is HTML: the part names come from
 * `ui.chapter.anatomy.parts` in the message tree, and the numbers on the
 * picture are positioned from the percentages below.
 *
 * Keeping the labels out of the image is the whole design. They translate, they
 * reflow, they scale with the reader's font size, they are selectable, and a
 * screen reader reads them. A rendered label would do none of that, and would
 * have to be re-rendered to fix a word.
 *
 * WHAT THE FIGURE IS NOT. No stoma is drawn and no pouch, there is no exit and
 * no "this part is removed" shading, and it is never introduced as the reader's
 * own body — which surgery removed what varies far too much for one picture.
 * The duodenum, the appendix and the ileocecal valve are hidden, so it shows
 * the parts the chapters talk about and no more.
 *
 * Keep this file free of imports and of non-erasable TypeScript: the
 * content-review export loads it directly under Node's type stripping.
 * =============================================================================
 */

/*
 * The parts the figure names, in the order they are numbered. The order runs
 * the way food does — jejunum, ileum, caecum, and on around the colon to the
 * rectum — so the numbers on the picture read as a route rather than as a
 * ranking. Labels live in `ui.chapter.anatomy.parts.<key>`.
 */
export type AnatomyPartKey =
  | 'jejunum'
  | 'ileum'
  | 'caecum'
  | 'ascending'
  | 'transverse'
  | 'descending'
  | 'sigmoid'
  | 'rectum';

/*
 * One numbered marker. `x` and `y` are percentages of the rendered frame, `y`
 * measured from the top, so they hold at every width the picture is served at.
 *
 * They are measured, not chosen: the render script paints each part a flat id
 * colour, reads the frame back and takes the visible pixel nearest that part's
 * centroid — which is why a marker never lands in the hole in the middle of a
 * loop of bowel. Re-running the script prints this list again; it is the only
 * thing that should ever edit these numbers.
 */
export interface AnatomyPart {
  key: AnatomyPartKey;
  x: number;
  y: number;
}

export const ANATOMY_PARTS: AnatomyPart[] = [
  { key: 'jejunum', x: 62.2, y: 34.3 },
  { key: 'ileum', x: 49.8, y: 53.3 },
  { key: 'caecum', x: 29.2, y: 58 },
  { key: 'ascending', x: 23.9, y: 35.6 },
  { key: 'transverse', x: 49.5, y: 25.2 },
  { key: 'descending', x: 71.6, y: 49 },
  { key: 'sigmoid', x: 48.6, y: 71.4 },
  { key: 'rectum', x: 46.4, y: 83.2 },
];

/*
 * The rendered files. The script writes `<src>-<width>.avif` and
 * `<src>-<width>.webp` for each width; `width` and `height` are the intrinsic
 * size of the largest, and are on the <img> so the page reserves the right box
 * before the picture arrives.
 */
export const BOWEL_STILL = {
  src: '/archive/ostomy-care/figures/bowel-reference',
  widths: [640, 960, 1280],
  width: 1280,
  height: 1600,
};

/*
 * A published work the geometry comes from. Titles, versions and DOIs are
 * identifiers and are never translated — the same rule as citation labels in
 * chapters-meta.ts and programName in funding-meta.ts. A translation pass once
 * renamed a journal, and a renamed DOI is a citation nobody can follow.
 */
export interface BowelCreditWork {
  title: string;
  version: string;
  doi: string;
}

/*
 * The credit beside the figure.
 *
 * CC BY 4.0 asks for the creator, the licence, a link to it, and an indication
 * that the work was changed. All four are here, and the same wording is written
 * into the image files' EXIF by the render script, so it travels with a file
 * that leaves the page.
 *
 * What is here is the IDENTIFIERS, and they are fixed in both locales: a
 * collection name, two work titles with their versions and DOIs, two author
 * surnames, a consortium and a licence code are the names of published things,
 * and translating a name misattributes it.
 *
 * The prose that sits beside them is not here. "Recoloured for this page, with
 * some structures hidden" and "For education, not diagnosis" are sentences
 * rather than identifiers, and they used to render in English on the French
 * page for no better reason than sitting in this constant next to the DOIs.
 * They are `ui.chapter.anatomy.credit.modification` and `.purpose` in both
 * message files now, and the export's own scan covers them there.
 *
 * `courtesy` stays here, and stays verbatim English, because the NLM asks for
 * that sentence in those words. `ui.chapter.anatomy.credit.courtesyGloss`
 * follows it in brackets on /fr so a francophone reader is not left with an
 * unexplained English sentence; the required wording itself is untouched.
 * Whether the NLM would accept an official French rendering instead is a
 * question for regulatory and IP review, and the content-review export lists it
 * as open.
 *
 * Two things this line must never say. "NIH" — the models are the Human
 * Reference Atlas, distributed through an NIH library, and naming the agency
 * beside health advice implies an endorsement nobody gave. And
 * "expert-approved", which is how the upstream collection describes its own
 * review process: Liivv has no clinician sign-off on this figure, so it cannot
 * borrow someone else's.
 */
export const BOWEL_CREDIT = {
  /* Reads as "3D geometry: HRA 3D Reference Organs — …". */
  lead: '3D geometry',
  collection: 'HRA 3D Reference Organs',
  works: [
    { title: 'Large Intestine, Male', version: 'v1.3', doi: '10.48539/HBM487.ZKSN.693' },
    { title: 'Small Intestine, Male', version: 'v1.2', doi: '10.48539/HBM789.XTDK.794' },
  ],
  authors: 'Browne K, Schlehlein H',
  consortium: 'HuBMAP',
  licence: 'CC BY 4.0',
  licenceHref: 'https://creativecommons.org/licenses/by/4.0/',
  /* NLM asks for this sentence, in these words, on anything built from its data. */
  courtesy: 'Courtesy of the U.S. National Library of Medicine.',
};
