/*
 * =============================================================================
 * DIABETES CARE CHAPTERS — STRUCTURE
 * =============================================================================
 * Prose lives in messages/*.json under DiabetesCare.chapters, so it can be
 * translated like the rest of the Liivv copy. This file holds only what is not
 * language-dependent: slugs, image paths, accents, the outward URLs, who each
 * card sends a reader to, and which register entries back it.
 *
 * Lists here are index-matched to the numbered keys in the message tree.
 *
 * The shapes are the shared chapter engine's
 * (../../_microsite/chapters/types.ts), filled in below with this site's own
 * names: its source register, its ask roles, its symbols, its own figures and
 * its who-to-ask topics. A chapter listed in CHAPTER_META is served by the
 * engine; the only other pages under /chapters are the path pages
 * (./paths-meta.ts), and [slug]/page.tsx decides which.
 *
 * No products anywhere in this file. Which card shows which products is the
 * merchandising record, ./chapter-shop.ts (owner answer B21, 2026-10-06:
 * placements resume), so a change to what Liivv stocks never changes what a
 * chapter says.
 *
 * Keep this file free of value imports and non-erasable TypeScript: the export
 * loads it directly under Node's type stripping. Use statement-form
 * `import type` only.
 * =============================================================================
 */

import type {
  CategoryMeta as EngineCategoryMeta,
  ChapterMeta as EngineChapterMeta,
  FigureMeta as EngineFigureMeta,
  EngineGlyph,
  LinkLang,
} from '../../_microsite/chapters/types';

import type { SensorId } from './device-pairings';
import type { SourceId } from './sources-meta';

/*
 * The six chapters, in reading order. A slug is part of a French review gate's
 * id (`chapter:<slug>` in review-gates.ts), so a chapter cannot be added here
 * without a gate of its own. `new-to-the-journey` and `every-day-living` were
 * also slugs of the older chapter pages, which are gone; both URLs are
 * served by the engine.
 */
export type ChapterSlug =
  | 'new-to-the-journey'
  | 'staying-safe'
  | 'your-tools'
  | 'every-day-living'
  | 'know-your-type'
  | 'this-might-be-you';

/*
 * Who a card can send a reader to. Labelled from `ui.chapter.ask.<role>` in the
 * DiabetesCare messages, so a role is added there before it is used here. The
 * role itself is structural, so a translation cannot change who a reader is
 * told to consult. 'assessment' and 'urgent' render in the warning tone.
 */
export type AskRole =
  | 'educator'
  | 'team'
  | 'pharmacist'
  /* A pharmacist who is also a Certified Diabetes Educator, such as Liivv's. */
  | 'pharmacistCde'
  | 'dietitian'
  | 'endo'
  | 'peer'
  | 'primaryCare'
  /*
   * Approved by ruling C33 (2026-10-06): a CF clinic, the prescriber, an eye-care
   * professional, the pregnancy care team and a child's school. One role per card;
   * a genetic counsellor and a GI specialist were not approved (a genetics
   * referral comes through a clinician, so those cards keep `endo` and `team`).
   */
  | 'cfClinic'
  | 'prescriber'
  | 'eyeCare'
  | 'obstetric'
  | 'school'
  | 'assessment'
  | 'urgent';

/*
 * Wordless line symbols. Every one is paired with a translated text label.
 * Drawings live in glyph-paths.ts. The engine's own symbols (EngineGlyph) are
 * part of the union, so glyph-paths.ts has to draw those too.
 */
export type GlyphName =
  | EngineGlyph
  | 'team'
  | 'peer'
  | 'primaryCare'
  | 'service'
  | 'home'
  | 'bag'
  | 'shirt'
  | 'list'
  | 'hands'
  | 'food'
  | 'walk'
  | 'people'
  | 'book'
  | 'video'
  | 'pin'
  | 'calendar'
  | 'coin'
  | 'drop'
  | 'meter'
  | 'sensor'
  | 'pump'
  | 'ketone'
  | 'pen'
  | 'sharps';

/*
 * What the who-to-ask lanes can be ticked for, index-matched by `topicKeys` to
 * `figure.topics.<n>.label`. A lane for Liivv's own service can only ever be
 * marked for the topics DIABETES_SITE.serviceLaneTopics allows (./site.ts).
 */
export type DiabetesLaneTopic =
  | 'low'
  | 'high'
  | 'sick'
  | 'device'
  | 'supplies'
  | 'plan'
  | 'medicines'
  | 'feelings';

/*
 * Diabetes Care's own figure kinds. The engine hands each back to this site's
 * figure registry (./site-figures.tsx) to draw. Each has a French review gate
 * of the same name in GATED_KINDS (review-gates.ts), and what each does to its
 * card is in DIABETES_SITE.kinds (./site.ts).
 *
 * Every word these figures show is in the message tree: the card's own item
 * sentences by number, its `figure` messages, and `ui.ruleOf15` /
 * `ui.ketoneLadder`. The numbers below are structure, for the content review
 * and for parity with those messages; no figure prints them as words. (The
 * target-range ruler draws its bars from them, and prints only its labels.)
 */
export type DiabetesFigureMeta =
  /*
   * The Rule of 15, as a walk-through that can also be read whole. RESTYLES
   * the card: `steps` are the loop, each keyed to its title under
   * `figure.steps.<key>` and led, where it has one, by the card's own item
   * sentence; `then` is the item that follows the loop. Like Ostomy's
   * change-routine, a cut step is deleted here only and no other key
   * renumbers.
   *
   * `child` is Diabetes Canada's table for children (CPG Ch41, Table 3: type 1
   * on injections or a pump that does not adjust insulin on its own),
   * index-matched to `figure.childRows`. An Adult / Child pair shows or hides
   * that table; it never scales the 15 g list, because the source gives no
   * child food amounts. The options listed in `hideWhenChild` (by their
   * number under `figure.options`) are hidden while "A child" is selected
   * (ruling R13/C18: honey; Health Canada, hc-infant-botulism), and
   * `figure.childOptionsNote`, where the card has one, says why under the
   * 15 g list in the child view. `aidNote` is the automated-system line, shown
   * under both (R12). With JavaScript off, every part is in the page as a list.
   */
  | {
      kind: 'ruleOf15';
      steps: Array<{ key: number; item?: number }>;
      then: number;
      child: Array<{
        ageBelow?: number;
        ageFrom?: number;
        ageTo?: number;
        ageAbove?: number;
        grams: number;
      }>;
      hideWhenChild: number[];
      aidNote: boolean;
      sources: SourceId[];
    }
  /*
   * The ketone ladder, adapted from Breakthrough T1D's ranges; 1.5 belongs to
   * the higher rung (ruling C5, CPG Ch10 ≥1.5), so rung 2 is `from` 0.6
   * `below` 1.5. Index-matched to `figure.blood.rungs` and
   * `figure.urine.rungs`. AUGMENTS: the card's own sentences stay as they
   * are. The highest blood rung and 'large' urine ketones take the urgent
   * colour. Labelled "written for type 1" in the figure itself, not only in
   * the note (R3), and it carries the card's note just above the ladder, so
   * the note's "below" is true. Nothing to type in and nothing that reads a
   * number back to the reader.
   */
  | {
      kind: 'ketoneLadder';
      blood: Array<{ below?: number; from?: number; to?: number; above?: number }>;
      urine: Array<'small' | 'moderate' | 'large'>;
      writtenFor: 'type1';
      sources: SourceId[];
    }
  /*
   * Diabetes Canada's usual target ranges, as labelled bars over one mmol/L
   * scale. AUGMENTS: the card's own sentences, which carry every number, stay
   * as they are, so /fr loses the drawing and never a target. The bars overlap
   * by design (before meals, after meals and the sensor's time in range are
   * different measures of the same thing), and each is labelled in words from
   * `figure.ruler.zones.<key>`, so none is told by colour alone. `below`,
   * `from` and `to` are the edges exactly as published; `item` is the card
   * sentence a zone comes from. The low zone takes the warning tone and links
   * to the steps for treating a low (`lowLink`), not to its definition, which
   * its own label gives. Nothing to type in and nothing that reads a number
   * back to the reader; `figure.ruler.teamNote` sits under it, always visible.
   */
  | {
      kind: 'glucoseRange';
      scale: { min: number; max: number };
      zones: Array<{
        key: 'low' | 'beforeMeals' | 'afterMeals' | 'timeInRange';
        below?: number;
        from?: number;
        to?: number;
        item?: number;
      }>;
      lowLink: { chapter: ChapterSlug; card: number };
      sources: SourceId[];
    }
  /*
   * "Clues to mention" (Know Your Type card 6). It draws the WHOLE card: every
   * section, in order, with section `section` as tick boxes, and the card's
   * note as a fixed banner above them ("Not a diagnostic tool"). There is no
   * score, count or result, and nothing ticked is saved or sent. The print
   * button produces "Questions to bring to your team": the banner, the clues
   * ticked (or all of them, if none are), then the `questions` lines from
   * `figure.questions.<n>`, each with space to write. The count is structural,
   * so a translation can neither add a question nor drop one. With JavaScript
   * off the sections are plain lists and the questions an ordered list: no box
   * renders that could not print its state.
   */
  | { kind: 'cluesChecklist'; section: number; questions: number; sources: SourceId[] }
  /*
   * Test names in plain words (Know Your Type card 6). AUGMENTS. One entry
   * per term in `figure.terms.<n>.{term,meaning}`, in order, each one a native
   * disclosure, under `figure.glossaryHeading` and the line that says which
   * meanings come from international guidance (`figure.glossaryNote`). An
   * "Open all / Close all" toggle (`ui.testGlossary`) appears after
   * hydration. Each entry's `slug` is the term's anchor (`#dc-term-<slug>`),
   * so a link to a term says which test it is and survives a reordering. The
   * count is structural, so a translation can neither add a term nor drop one.
   */
  | { kind: 'testGlossary'; terms: Array<{ slug: string }>; sources: SourceId[] }
  /*
   * The family diabetes tree (Know Your Type card 8), a printable table.
   * AUGMENTS. Rows (`figure.familyTree.rows.<n>`) are grouped by side of the
   * family; the columns are structural keys labelled from
   * `figure.familyTree.columns.<key>`. There is no calculation, no colouring
   * and no pattern detection, and typed answers stay in the browser tab: never
   * stored, never sent. With JavaScript off it is the same table with blank
   * cells, a form to fill in by hand.
   */
  | {
      kind: 'familyTree';
      sides: Array<{ side: FamilySide; rows: number[] }>;
      columns: FamilyColumn[];
      sources: SourceId[];
    }
  /*
   * Your Tools' three pickers: pick a meter, a sensor or a pump, and see what
   * fits it. AUGMENTS: the card's own sentences stay as they are. The devices,
   * what pairs with what, who confirms it and the register entries behind each
   * line are in ./device-pairings.ts, where a pairing is stated once and both
   * the sensor picker (card 4) and the pump picker (card 13) read it, so the
   * two cannot disagree. Every word around the device names is in the card's
   * `figure` messages; each line carries its basis and its sources, and the
   * panel ends with the date the pages were checked. Nothing is preselected,
   * nothing reads a number back, and no line places a product or links a shop.
   * With JavaScript off, every device's entry is in the page, one after
   * another. `askHref` is where the pump picker sends a question it cannot
   * answer: the CDE panel on the same page (`#chapter-cde`, the CDEs at
   * Bayshore Express Pharmacy), or a Liivv page, which then needs
   * `askHrefLang`.
   */
  | { kind: 'meterMatch' }
  | { kind: 'sensorPicker' }
  | { kind: 'pumpPicker'; askHref: string; askHrefLang?: LinkLang }
  /*
   * The sensor restock calculator (Your Tools card 6): arithmetic only. Sensors
   * you have, times the days each is worn, as days and a date; with a number of
   * days to cover, how many that needs. `presets` are sensors whose "up to"
   * wear time it fills in, read from ./device-pairings.ts (grace periods are
   * never counted, R23); any other sensor is "enter the days". The limits are
   * the largest numbers it takes. Nothing is stored, sent or compared with
   * coverage, and there is no shop or Subscribe & save link. With JavaScript
   * off it is the rule and a worked example (`figure.noJs`).
   */
  | {
      kind: 'restockCalc';
      presets: SensorId[];
      maxSensors: number;
      maxDays: number;
      maxCover: number;
    }
  /*
   * One injection area split into four zones, a week each (Your Tools card
   * 10). AUGMENTS: the card's own list carries every fact, and the drawing is
   * decoration with its words beside it (`figure.heading`, `figure.zones`,
   * `figure.centre`, `figure.caption`). The numbers are for the content review
   * and for parity with those words: the keep-clear distance from the belly
   * button, the least spacing between injections and the weeks per zone. No
   * body outline and nothing to press.
   */
  | {
      kind: 'rotationMap';
      zones: 4;
      clearCm: number;
      spacingCmAtLeast: [number, number];
      weeksPerZone: number;
    };

/* The family tree's groups of relatives, labelled from `figure.familyTree.sides.<side>`. */
export type FamilySide = 'yours' | 'mothers' | 'fathers';

/* The family tree's columns, labelled from `figure.familyTree.columns.<key>`. */
export type FamilyColumn =
  | 'hasDiabetes'
  | 'ageAtDiagnosis'
  | 'typeTold'
  | 'insulinSoon'
  | 'hearingLoss';

/*
 * The engine's shapes with this site's names. A new kind goes into
 * DiabetesFigureMeta above, with its French review gate in GATED_KINDS
 * (review-gates.ts) at the same time.
 *
 * A held figure is built but renders on no page, in either locale, until the
 * named thing is true; its card shows its plain list meanwhile, and its words
 * stay out of the browser (held-messages.ts). Deleting the figure's `held`
 * line is the whole switch, as on Ostomy. The last hold before these,
 * `knowYourTypeRoute` (New to the Journey card 2's doors, until Know Your Type
 * was served), was lifted on 2026-10-05 and ruling N12 now uses its default.
 */
export type FigureHold =
  /*
   * Your Tools card 2's meter picker. No registered page says which test strips
   * go with which meter, and the two rows that have data rest on makers' pages
   * alone (ruling R16). It ships when every family it lists has its strip row
   * confirmed on a registered page and R16 is ruled; until then the card's own
   * sentences and card 3's printable stand in. Should R16 be ruled (b), a
   * second reason joins it here (`makerOnlyFacts`, the maker-only pairings and
   * fact lines of ./device-pairings.ts).
   */
  'meterData';

export type FigureMeta = EngineFigureMeta<
  SourceId,
  GlyphName,
  DiabetesFigureMeta,
  DiabetesLaneTopic,
  FigureHold
>;

export type CategoryMeta = EngineCategoryMeta<
  SourceId,
  AskRole,
  GlyphName,
  DiabetesFigureMeta,
  DiabetesLaneTopic,
  FigureHold
>;

export interface ChapterMeta
  extends EngineChapterMeta<
    SourceId,
    AskRole,
    GlyphName,
    DiabetesFigureMeta,
    DiabetesLaneTopic,
    FigureHold
  > {
  slug: ChapterSlug;
}

/*
 * Images: the Diabetes chapter image set is not chosen yet. These are the
 * archive's existing pictures, standing in, and none shows a product.
 */
const IMG = '/archive/diabetes-care';

/*
 * The CDE panel at the foot of every chapter: the Certified Diabetes Educators
 * at Bayshore Express Pharmacy, the Liivv pharmacy in Markham, with its
 * general phone line, email, hours and About page (DIABETES_SITE.contact in
 * ./site.ts; owner answers A2, B5, B9, B10 and B12, 2026-10-06). The hero's
 * "ask" button and the pump picker open it on the same page. The id is the
 * engine's CONTACT_ANCHOR (_microsite/_components/specialist-contact.tsx),
 * written out because this file may not import a value. "Request a call"
 * (/account/virtual-care/appointment) stays held until a booking page can take
 * the request (`cdeRequestReason` in ../landing-meta.ts; B6).
 */
const CDE_PANEL_HREF = '#chapter-cde';

/*
 * Breakthrough T1D's mental health page, the `bt1d-mental-health-support`
 * address, and its French page on perceedt1.ca (the register's `hrefFr`),
 * which /fr opens instead (link crawl, 2026-10-06).
 */
const BT1D_MENTAL_HEALTH_HREF = 'https://breakthrought1d.ca/mental-health-support/';
const BT1D_MENTAL_HEALTH_HREF_FR = 'https://perceedt1.ca/soutien-en-sante-mentale/';

/*
 * Same address as EDUCATOR_DIRECTORY_HREF in sources-meta.ts (`cdecb-find-a-cde`);
 * a literal, as this file may not import a value.
 */
const FIND_A_CDE_HREF = 'https://systems.cdecb.ca/findCDE';

export const CHAPTER_META: ChapterMeta[] = [
  /*
   * 01 · New to the Journey. Copy: DiabetesCare.chapters.new-to-the-journey,
   * after the source check of 2026-10-05. No red-flag block of its own: the
   * start-here map signposts Staying Safe's. The clinical defaults it uses
   * (R1–R10, N1–N14) were settled by the source check and the clinical
   * rulings of 2026-10-06, except N12, which stays open in the content review.
   */
  {
    slug: 'new-to-the-journey',
    num: '01',
    chapterWord: 'one',
    heroImage: `${IMG}/chapter-new.png`,
    accent: '#a89c94',
    rail: false,
    majorSections: true,
    /* Exactly two segments: the first days, and setting up. */
    startHere: { groups: ['firstDays', 'settingUp'] },
    urgentExit: { chapter: 'staying-safe' },
    /* "Do I need a meter?" in the intro body links to card 6, where Setting up starts. */
    introCard: 6,
    categories: [
      /* ---------- The first days ---------- */
      {
        // 1 Just been told. The strip carries 9-8-8 and 911 (the 9-8-8 page
        // says "If your safety is at risk, call 9-1-1 right away"), and since
        // ruling C25 (2026-10-06) its sentence is the card's own
        // `figure.body`, the same as Every Day Living card 5's. A crisis line
        // sends the reader to act now, so the card is pinned open in every
        // locale (the C25 rule; see Staying Safe below). Diabetes Care writes
        // the emergency number 911 everywhere, the strip included; 9-8-8 keeps
        // its hyphens.
        image: `${IMG}/chapter-new.png`,
        group: 'firstDays',
        ask: 'team',
        urgentContent: true,
        figures: [
          {
            kind: 'crisis',
            numbers: [
              { tel: '988', sms: true },
              { tel: '911', kind: 'emergency', written: '911' },
            ],
          },
          { kind: 'routes', routes: [{ glyphs: ['team', 'primaryCare'] }, { glyphs: ['pin'] }] },
        ],
        sources: [
          'dc-taking-care-of-mental-health',
          'dc-cpg-ch18-mental-health-2023',
          'bt1d-mental-health-support',
          '988-suicide-crisis-helpline',
        ],
      },
      {
        // 2 Which diabetes is this? Every item is a door to its own card in Know
        // Your Type (Ch05): type 1 → 1, type 2 → 2, gestational → 4,
        // prediabetes → 3, less common types → 6 ("Could my type be
        // different?"). Ruling N12 uses its default now that Ch05 is served.
        image: `${IMG}/chapter-journey.png`,
        group: 'firstDays',
        ask: 'team',
        figures: [
          {
            kind: 'doors',
            doors: [
              { glyph: 'book', item: 1, chapter: 'know-your-type', card: 1 },
              { glyph: 'book', item: 2, chapter: 'know-your-type', card: 2 },
              { glyph: 'book', item: 3, chapter: 'know-your-type', card: 4 },
              { glyph: 'book', item: 4, chapter: 'know-your-type', card: 3 },
              { glyph: 'more', item: 5, chapter: 'know-your-type', card: 6 },
            ],
          },
        ],
        sources: [
          'dc-type-1',
          'dc-type-2',
          'dc-gestational-diabetes',
          'dc-prediabetes',
          'dc-cpg-ch3-classification-diagnosis',
        ],
      },
      {
        // 3 Your target ranges. The ruler augments; the take-in card restyles the
        // list into a printable "My team's targets" with five blank lines.
        image: `${IMG}/chapter-type2.png`,
        group: 'firstDays',
        ask: 'team',
        figures: [
          {
            kind: 'glucoseRange',
            scale: { min: 2, max: 14 },
            zones: [
              { key: 'low', below: 3.9 },
              { key: 'beforeMeals', from: 4.0, to: 7.0, item: 1 },
              { key: 'afterMeals', from: 5.0, to: 10.0, item: 1 },
              // The guideline's sensor target (CPG Ch9, from the International
              // Consensus Report). DC's patient page says 4.0–10.0: ruling R1.
              { key: 'timeInRange', from: 3.9, to: 10.0, item: 4 },
            ],
            // The steps for a low, not its definition (the zone label defines it).
            lowLink: { chapter: 'staying-safe', card: 2 },
            sources: [
              'dc-checking-blood-sugar',
              'dc-cpg-ch8-targets',
              'dc-cpg-ch9-monitoring-2021',
              'dc-hypoglycemia-adults-sheet-2024',
            ],
          },
          { kind: 'takeIn', fields: 5 },
        ],
        sources: [
          'dc-checking-blood-sugar',
          'dc-cpg-ch8-targets',
          'dc-cpg-ch9-monitoring-2021',
          'dc-cpg-ch36-pregnancy',
          'bt1d-time-in-range',
        ],
      },
      {
        // 4 Food and movement, first steps. No shop strip.
        image: `${IMG}/chapter-everyday.png`,
        group: 'firstDays',
        ask: 'dietitian',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6, 7],
            ],
          },
        ],
        sources: [
          'hc-healthy-eating-recommendations',
          'dc-cpg-ch11-nutrition-therapy',
          'dc-exercise-and-activity',
          'dc-cpg-ch10-physical-activity',
        ],
      },
      {
        // 5 Supporting someone newly diagnosed. Item 3 carries "call 911"; the
        // card's emergency detail is Staying Safe's red-flag block (urgentExit).
        // Not pinned (ruling C25): its 911 line prepares someone ("taught to
        // call 911"), it does not send the reader to act now.
        image: `${IMG}/care-chat-main.png`,
        group: 'firstDays',
        ask: 'team',
        figures: [{ kind: 'columns', columns: [[1, 2], [3]], neutral: [4, 5] }],
        // "The Rule of 15" in item 2 opens Staying Safe card 2. "Type 1 starts
        // before symptoms" in item 4 opens Know Your Type card 5, which has
        // TrialNet's details: the pointer stays here, short (ruling C30; N4).
        links: [
          { at: 'items.2', to: { chapter: 'staying-safe', card: 2 } },
          { at: 'items.4', to: { chapter: 'know-your-type', card: 5 } },
        ],
        sources: [
          'dc-cpg-ch14-hypoglycemia-2023',
          'dc-getting-started-with-insulin',
          'bt1d-trialnet',
          'bt1d-mental-health-support',
        ],
      },

      /* ---------- Setting up ---------- */
      {
        // 6 Do I need a meter? The lead says it depends; then meter, then sensor.
        image: `${IMG}/chapter-essentials.png`,
        group: 'settingUp',
        ask: 'educator',
        figures: [{ kind: 'columns', columns: [[2], [3, 4]], lead: [1], neutral: [5] }],
        // "Funding & Coverage" in the note opens that page.
        links: [{ at: 'note', to: { page: 'funding' } }],
        sources: [
          'dc-cpg-ch9-monitoring-2021',
          'dc-checking-blood-sugar',
          'dc-technology-and-devices',
          'dc-cpg-ch41-t1d-lifespan-2025',
          'on-odb-coverage',
          'dc-comparisons-by-province',
        ],
      },
      {
        // 7 Your medicines and your pharmacist. Questions to take in; no dosing.
        image: `${IMG}/care-chat-main.png`,
        group: 'settingUp',
        ask: 'pharmacist',
        figures: [{ kind: 'takeIn' }],
        sources: ['dc-stay-safe-sick-days-sheet', 'dc-getting-started-with-insulin'],
      },
      {
        // 8 Starting insulin. "Your prescriber chooses your insulin." Its shop
        // strip (chapter-shop.ts) links the insulin shelf, never a named insulin,
        // with the pharmacist notice, in English only; injection technique
        // lives in Your Tools.
        image: `${IMG}/chapter-type1.png`,
        group: 'settingUp',
        ask: 'educator',
        figures: [
          {
            kind: 'columns',
            columns: [
              [2, 3],
              [4, 5],
            ],
            lead: [1],
            neutral: [6, 7, 8],
          },
        ],
        // "The Rule of 15" in item 6 opens Staying Safe card 2.
        links: [{ at: 'items.6', to: { chapter: 'staying-safe', card: 2 } }],
        sources: ['dc-getting-started-with-insulin'],
      },
      {
        // 9 Sharps from day one. What goes in (and never in the garbage), then
        // where it goes back: HPSA provinces; elsewhere, ask your pharmacy.
        image: `${IMG}/chapter-prediabetes.png`,
        group: 'settingUp',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'sharps',
                items: [
                  { item: 1, glyph: 'pen' },
                  { item: 2, glyph: 'list' },
                  { item: 3, glyph: 'home' },
                ],
              },
              {
                glyph: 'pin',
                items: [
                  { item: 4, glyph: 'check' },
                  { item: 5, glyph: 'service' },
                ],
              },
            ],
          },
        ],
        sources: ['hpsa-returning-medical-sharps', 'dc-getting-started-with-insulin'],
      },
      {
        // 10 Your starter supply list. Generic items by therapy; the products
        // for each therapy are in its shop strip (chapter-shop.ts). Starter
        // supplies go to the pharmacist CDE (ruling C33; N11).
        image: `${IMG}/closing.png`,
        group: 'settingUp',
        ask: 'pharmacistCde',
        figures: [{ kind: 'columns', columns: [[1], [2, 3], [5, 6]], neutral: [4] }],
        sources: [
          'dc-getting-started-with-insulin',
          'dc-managing-emergency-situations',
          'dc-technology-and-devices',
          'dc-checking-blood-sugar',
        ],
      },
      {
        // 11 Who to ask. Device-maker lines and a peer lane are HELD (content
        // review, "Held for want of a source").
        image: `${IMG}/chapter-journey.png`,
        group: 'settingUp',
        ask: 'team',
        figures: [
          {
            kind: 'lanes',
            lanes: [
              {
                glyph: 'team',
                item: 1,
                // The card's note says to start with your diabetes educator, so
                // a pump, sensor or supplies question fits here too, not only
                // the Liivv pharmacist CDE's lane.
                topics: ['plan', 'device', 'supplies'],
                href: FIND_A_CDE_HREF,
                hrefLang: 'en',
                linkSources: ['cdecb-find-a-cde'],
              },
              { glyph: 'primaryCare', item: 2, topics: ['plan', 'medicines'] },
              // A pharmacist anywhere, not a Liivv-only lane.
              { glyph: 'service', item: 3, topics: ['medicines'] },
              // The CDEs at Bayshore Express Pharmacy, Liivv's pharmacy: no card
              // sentence, so its words wait on `laneExtras` on /fr. It shows the
              // pharmacy's general line, email, hours and About page, as every
              // CDE panel does (DIABETES_SITE.contact; B9).
              {
                glyph: 'service',
                service: true,
                contact: true,
                topics: ['device', 'supplies'],
                sources: ['bep-about'],
              },
              {
                glyph: 'people',
                item: 4,
                topics: ['feelings'],
                href: BT1D_MENTAL_HEALTH_HREF,
                hrefFr: BT1D_MENTAL_HEALTH_HREF_FR,
                hrefLang: 'en',
                linkSources: ['bt1d-mental-health-support'],
              },
            ],
            topicKeys: ['plan', 'medicines', 'device', 'supplies', 'feelings'],
          },
        ],
        sources: [
          'cdecb-find-a-cde',
          'dc-stay-safe-sick-days-sheet',
          'dc-getting-started-with-insulin',
          'bt1d-mental-health-support',
        ],
      },
    ],
    /*
     * Band "Your first year": five cards. It ships as the programs band; a
     * checkup-year map could take the band slot later, with these cards as its
     * no-JS and /fr fallback.
     */
    programsBandLinks: [
      [
        {
          href: FIND_A_CDE_HREF,
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['cdecb-find-a-cde'],
        },
      ],
      [],
      [],
      [],
      [],
    ],
    /* Band card 2 (A1C) names "Your target ranges", which links to card 3. */
    programsBandCards: [null, 3, null, null, null],
    /* Band card 3 (eyes) leads with Diabetes Canada's patient page (ruling C24). */
    bandSources: [
      'dc-eye-damage-retinopathy',
      'dc-cpg-ch9-monitoring-2021',
      'dc-checking-blood-sugar',
      'dc-cpg-ch30-retinopathy',
      'dc-cpg-ch29-ckd-2025',
      'dc-kidney-disease',
      'dc-cpg-ch32-foot-care',
      'dc-foot-care-sheet-2025',
      'cdecb-find-a-cde',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: CDE_PANEL_HREF,
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'Diabetes Canada — Getting Started with Insulin',
        href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/getting-started-with-insulin',
      },
      {
        label: 'Diabetes Canada — Checking Blood Sugar',
        href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/checking-blood-sugar',
      },
      {
        label:
          'Diabetes Canada — Blood Glucose Monitoring in Adults and Children with Diabetes: Update 2021',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-9-2021-update',
      },
      {
        label: 'Health Products Stewardship Association — Returning Medical Sharps',
        href: 'https://healthsteward.ca/consumers/returning-medical-sharps/',
      },
      {
        label: 'Breakthrough T1D — Mental Health Support',
        labelFr: 'Percée DT1 — Soutien en santé mentale',
        href: BT1D_MENTAL_HEALTH_HREF,
        hrefFr: BT1D_MENTAL_HEALTH_HREF_FR,
      },
    ],
  },
  /*
   * 02 · Staying Safe. Copy: DiabetesCare.chapters.staying-safe, after the
   * source check of 2026-10-05 and the clinical rulings of 2026-10-06
   * (docs/diabetes-content/clinical-rulings-2026-10-06.md), which settled
   * R1–R9 and R11–R15 here.
   *
   * Which cards are pinned open (`urgentContent`), the rule of ruling C25 for
   * the whole site: pin a card when it tells the reader to act now (call 911,
   * go to the emergency department, get same-day care, or use a crisis line),
   * including a card that gives the steps to take during an emergency, even
   * inside a plan. A card whose 911 mention only prepares someone ("teach
   * someone to call 911", "be ready") is not pinned. Pinned: Staying Safe 3,
   * 6, 7, 8 and 11; New to the Journey 1; Every Day Living 3, 5, 8 and 9; Know
   * Your Type 2; This Might Be You 1, 3 and 5. Not pinned: New to the Journey
   * 5, Staying Safe 4 and 10, Every Day Living 4. Ostomy's no-pinning
   * behaviour is not adopted.
   */
  {
    slug: 'staying-safe',
    num: '02',
    chapterWord: 'two',
    heroImage: `${IMG}/hero.png`,
    accent: '#f3c7be',
    rail: false,
    majorSections: true,
    /* Exactly two segments: when you're low, and when you're high or sick. */
    startHere: { groups: ['whenLow', 'whenHighOrSick'] },
    /*
     * The chapter's own #red-flags block, rendered from the `urgent` messages
     * (four signs), is pinned open and never gated. This exit is the start-here
     * map's signpost to it, as Ostomy's Chapter 02 points at itself.
     */
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- When you're low ---------- */
      {
        // 1 Know your low. What counts as low first, then the levels as three
        // columns, then the sensor target beneath them.
        image: `${IMG}/chapter-type1.png`,
        group: 'whenLow',
        ask: 'team',
        figures: [{ kind: 'columns', columns: [[2], [3], [4]], lead: [1], neutral: [5] }],
        sources: [
          'dc-cpg-ch14-hypoglycemia-2023',
          'dc-hypoglycemia-adults-sheet-2024',
          // Below 3.9, with a French file of its own (ruling C1).
          'dq-low-blood-sugar-leaflet-2025',
          'bt1d-time-in-range',
          'dc-cpg-ch9-monitoring-2021',
          'dc-drive-safe-card',
          'dc-cpg-ch21-driving',
          'das-low-blood-sugar',
        ],
      },
      {
        // 2 The Rule of 15. The only Rule of 15 copy on the site; others link here.
        image: `${IMG}/chapter-everyday.png`,
        group: 'whenLow',
        ask: 'team',
        figures: [
          {
            kind: 'ruleOf15',
            // Take 15 g → wait → check again → still low, take 15 g more; then the snack.
            steps: [{ key: 1, item: 1 }, { key: 2, item: 2 }, { key: 3 }, { key: 4, item: 3 }],
            then: 4,
            child: [
              { ageBelow: 5, grams: 5 },
              { ageFrom: 5, ageTo: 10, grams: 10 },
              { ageAbove: 10, grams: 15 },
            ],
            // Honey (option 3) hides under "A child"; `figure.childOptionsNote`
            // says why (ruling C18).
            hideWhenChild: [3],
            aidNote: true,
            sources: [
              // Table 4: 150 mL juice (ruling C13).
              'dc-cpg-ch14-hypoglycemia-2023',
              'dc-hypoglycemia-adults-sheet-2024',
              'dc-cpg-ch41-t1d-lifespan-2025',
              // ⅔ cup (150 mL) of juice (ruling C13, with Ch14 Table 4).
              'dq-low-blood-sugar-leaflet-2025',
              'hc-infant-botulism',
            ],
          },
        ],
        // The driving line stays outside the figure, visible, in both views:
        // it is worded for whoever drives, teens included (ruling C44).
        noteVisible: true,
        sources: [
          'dc-cpg-ch14-hypoglycemia-2023',
          'dc-hypoglycemia-adults-sheet-2024',
          'dc-cpg-ch41-t1d-lifespan-2025',
          'dc-cpg-ch21-driving',
          'dq-low-blood-sugar-leaflet-2025',
          'hc-infant-botulism',
        ],
      },
      {
        // 3 Glucagon. Carries "call 911", so it is pinned open in every locale.
        image: `${IMG}/care-chat-main.png`,
        group: 'whenLow',
        ask: 'pharmacist',
        urgentContent: true,
        // A printable card for the people around you.
        figures: [{ kind: 'takeIn' }],
        sources: [
          'bt1d-what-is-glucagon',
          'das-glucagon',
          'dc-hypoglycemia-adults-sheet-2024',
          'dc-cpg-ch14-hypoglycemia-2023',
          'dc-cpg-ch41-t1d-lifespan-2025',
        ],
      },
      {
        // 4 Lows that sneak up: after activity, after drinking; the sensor lag
        // beneath. Item 5's 911 line prepares someone ("make sure someone with
        // you knows to call 911"), so the card is not pinned (ruling C25). Its
        // glucagon-and-alcohol sentence is CPG Ch14 2023's (ruling C2).
        image: `${IMG}/chapter-journey.png`,
        group: 'whenLow',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2],
              [3, 4, 5],
            ],
            neutral: [6],
          },
        ],
        sources: [
          'dc-exercise-and-activity',
          'dc-alcohol-and-diabetes-2018',
          'dc-cpg-ch11-nutrition-therapy',
          'dc-diabetes-and-drinking-2019',
          'dc-technology-and-devices',
          'dc-cpg-ch14-hypoglycemia-2023',
        ],
      },
      {
        // 5 Carry it, wear it. Generic symbols only; no product.
        image: `${IMG}/chapter-new.png`,
        group: 'whenLow',
        ask: 'team',
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'bag',
                items: [
                  { item: 1, glyph: 'food' },
                  { item: 3, glyph: 'check' },
                ],
              },
              { glyph: 'people', items: [{ item: 2, glyph: 'hands' }] },
              {
                glyph: 'book',
                items: [
                  { item: 4, glyph: 'list' },
                  { item: 5, glyph: 'people' },
                  { item: 6, glyph: 'phone' },
                ],
              },
            ],
          },
        ],
        sources: [
          'dc-exercise-and-activity',
          'dc-alcohol-and-diabetes-2018',
          'dc-cpg-ch14-hypoglycemia-2023',
          'cps-t1d-in-school-2015',
          'dc-kids-in-school',
          'das-low-blood-sugar',
        ],
      },

      /* ---------- When you're high, or sick ---------- */
      {
        // 6 Highs. The note says "need care right away". No figure: a doors
        // figure would restyle every item into a door, and only item 1 has an
        // onward page.
        image: `${IMG}/chapter-type2.png`,
        group: 'whenHighOrSick',
        ask: 'team',
        urgentContent: true,
        sources: [
          'dc-checking-blood-sugar',
          'dc-hyperglycemia',
          'dc-cpg-ch15-hyperglycemic-emergencies',
          // Item 4 names SGLT2 inhibitors as Ch15 does, as a question for the pharmacist (ruling C17).
          'dc-stay-safe-sick-days-sheet',
        ],
      },
      {
        // 7 Ketones: check and act. The emergency rung and the DKA signs.
        image: `${IMG}/chapter-prediabetes.png`,
        group: 'whenHighOrSick',
        ask: 'team',
        urgentContent: true,
        figures: [
          {
            kind: 'ketoneLadder',
            // 1.5 belongs to the higher rung (ruling C5). Over 3.0 and "large"
            // are a medical emergency; 1.5–3.0 and "moderate" go to the
            // emergency department if the team can't be reached (ruling C4).
            blood: [
              { below: 0.6 },
              { from: 0.6, below: 1.5 },
              { from: 1.5, to: 3.0 },
              { above: 3.0 },
            ],
            urine: ['small', 'moderate', 'large'],
            writtenFor: 'type1',
            sources: [
              'bt1d-dka-and-ketones',
              'dc-cpg-ch10-physical-activity',
              'dc-stay-safe-sick-days-sheet',
            ],
          },
        ],
        sources: [
          'bt1d-dka-and-ketones',
          'dc-hyperglycemia',
          'dc-stay-safe-sick-days-sheet',
          'dc-cpg-ch10-physical-activity',
        ],
      },
      {
        // 8 Sick days. "Go to the emergency department" pins it open.
        image: `${IMG}/chapter-gestational.png`,
        group: 'whenHighOrSick',
        ask: 'pharmacist',
        urgentContent: true,
        // "Which of your medicines" is never behind a disclosure.
        noteVisible: true,
        // The printable plan, five blank lines filled in with the pharmacist.
        figures: [{ kind: 'takeIn', fields: 5 }],
        sources: [
          'dc-stay-safe-sick-days-sheet',
          'bt1d-dka-and-ketones',
          // "Keep taking insulin" and the 2-or-more-in-4-hours call line (ruling C17).
          'dc-checking-blood-sugar',
        ],
      },
      {
        // 9 On a pump: an unexplained high. Rests on Diabetes Canada and
        // Breakthrough only; the FIT lines (an embecta-run site) are HELD (R9)
        // and are not in the message files.
        image: `${IMG}/chapter-essentials.png`,
        group: 'whenHighOrSick',
        ask: 'team',
        sources: [
          'dc-technology-and-devices',
          'dc-managing-emergency-situations',
          'bt1d-dka-and-ketones',
        ],
      },
      {
        // 10 Be ready for emergencies. Preparation, so not pinned (ruling C25).
        // Item 5's in-use line cites Diabète Québec (ruling C15).
        image: `${IMG}/closing.png`,
        group: 'whenHighOrSick',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'bag',
                items: [
                  { item: 1, glyph: 'calendar' },
                  { item: 2, glyph: 'list' },
                  { item: 3, glyph: 'list' },
                ],
              },
              {
                glyph: 'home',
                items: [
                  { item: 4, glyph: 'home' },
                  { item: 5, glyph: 'book' },
                ],
              },
            ],
          },
        ],
        sources: [
          'dc-managing-emergency-situations',
          'dq-all-about-injections',
          'dc-getting-started-with-insulin',
        ],
      },
      {
        // 11 Who to call, and when. Carries the 911 line, so it is pinned open.
        // No crisis strip: the verified copy has no self-harm line, and the
        // card's own 911 lane says when to call (review of 2026-10-05).
        image: `${IMG}/chapter-type1.png`,
        group: 'whenHighOrSick',
        ask: 'team',
        urgentContent: true,
        figures: [
          {
            kind: 'lanes',
            lanes: [
              { glyph: 'urgent', item: 1, topics: ['low'] },
              { glyph: 'urgent', item: 2, topics: ['high', 'sick'] },
              { glyph: 'team', item: 3, topics: ['high', 'sick'] },
              // Your diabetes team also answers a pump, sensor or supplies
              // question, as New to the Journey's educator lane does; the
              // Liivv pharmacist CDE's lane is not the only one that fits.
              { glyph: 'team', item: 4, topics: ['high', 'sick', 'device', 'supplies'] },
              // A pharmacist anywhere, not a Liivv-only lane.
              { glyph: 'service', item: 5, topics: ['sick', 'low'] },
              // The CDEs at Bayshore Express Pharmacy, Liivv's pharmacy: no card
              // sentence, so its words wait on `laneExtras` on /fr. It shows the
              // pharmacy's general line, email, hours and About page, as every
              // CDE panel does (DIABETES_SITE.contact; B9, C12).
              {
                glyph: 'service',
                service: true,
                contact: true,
                topics: ['device', 'supplies'],
                sources: ['bep-about'],
              },
            ],
            topicKeys: ['low', 'high', 'sick', 'device', 'supplies'],
          },
        ],
        sources: [
          'bt1d-what-is-glucagon',
          'das-glucagon',
          'bt1d-dka-and-ketones',
          'dc-stay-safe-sick-days-sheet',
          'dc-hyperglycemia',
          'dc-cpg-ch14-hypoglycemia-2023',
        ],
      },
    ],
    /* Band "The safety ladder": four cards, no links. */
    programsBandLinks: [[], [], [], []],
    /*
     * Band card 1 (treat and check again) sends a child's carer to the Rule of
     * 15 (card 2) for the amount by age: that title in its body links there.
     */
    programsBandCards: [2, null, null, null],
    bandSources: [
      'dc-cpg-ch14-hypoglycemia-2023',
      'bt1d-dka-and-ketones',
      'dc-stay-safe-sick-days-sheet',
      'bt1d-what-is-glucagon',
      'das-glucagon',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: CDE_PANEL_HREF,
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'Diabetes Canada — Chapter 14: 2023 Update – Hypoglycemia in Adults',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-14-2023-update',
      },
      {
        label: 'Diabetes Canada — Hypoglycemia: low blood sugar in adults (02/24)',
        href: 'https://www.diabetes.ca/getContentAsset/7f36723d-3507-4657-a579-78b1fd0437e6/0f6cf596-933c-4f74-b36a-77091c512445/hypoglycemia-low-blood-sugar-in-adults.pdf?language=en',
      },
      {
        label:
          'Diabetes Canada — Stay Safe When You Have Diabetes and Are Sick or at Risk of Dehydration',
        href: 'https://www.diabetes.ca/getContentAsset/5bdc8b7c-4402-4d72-b86b-700f9dfd3b9d/0f6cf596-933c-4f74-b36a-77091c512445/stay-safe-when-you-have-diabetes-and-sick-or-at-risk-of-dehydration.pdf?language=en',
      },
      {
        label: 'Breakthrough T1D — Diabetic ketoacidosis (DKA) and ketones',
        href: 'https://breakthrought1d.ca/daily-management/diabetic-ketoacidosis-dka-and-ketones/',
      },
      {
        label: 'Diabetes Canada — Managing Diabetes in Emergency Situations',
        href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/managing-diabetes-in-emergency-situations',
      },
      /*
       * Added 2026-10-06 (full-site review): the pages the cards rest on for a
       * child's amounts, honey, glucagon, school and insulin storage, which the
       * list above left out. Titles and links as the register has them.
       */
      {
        label:
          'Diabetes Canada — Glycemic Management Across the Lifespan for People With Type 1 Diabetes',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-41',
      },
      {
        label: 'Diabète Québec — Low Blood Sugar - Symptoms and Actions to Take',
        labelFr: 'Diabète Québec — Hypoglycémie : symptômes et mesures à prendre',
        href: 'https://www.diabete.qc.ca/wp-content/uploads/2022/06/112382-DQC25-Depliants6-Hypoglycemie-EN_11-2025_web.pdf',
        hrefFr:
          'https://www.diabete.qc.ca/wp-content/uploads/2022/06/112382-DQC25-Depliants6-Hypoglycemie-FR_11_2025_web.pdf',
      },
      {
        label: 'Health Canada — Infant botulism',
        labelFr: 'Santé Canada — Botulisme infantile',
        href: 'https://www.canada.ca/en/health-canada/services/food-safety-vulnerable-populations/infant-botulism.html',
        hrefFr:
          'https://www.canada.ca/fr/sante-canada/services/salubrite-aliments-pour-populations-vulnerables/botulisme-infantile.html',
      },
      {
        label: 'Breakthrough T1D — What is glucagon?',
        href: 'https://breakthrought1d.ca/daily-management/what-is-glucagon/',
      },
      {
        label: 'Diabetes@School — Low blood sugar: What it is, and what to do',
        href: 'https://diabetesatschool.ca/understanding/low-blood-sugar-what-it-is-and-what-to-do',
      },
      {
        label: 'Diabetes@School — Glucagon: What it is and how to use it',
        href: 'https://diabetesatschool.ca/understanding/glucagon',
      },
      {
        label:
          'Canadian Paediatric Society — Managing type 1 diabetes in school (CPS position statement, 2015)',
        href: 'https://cps.ca/en/documents/position/type-1-diabetes-in-school',
      },
      {
        label: 'Diabetes Canada — Diabetes and Driving',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-21',
      },
      {
        label: 'Diabète Québec — All about injections',
        labelFr: "Diabète Québec — Tout sur l'injection",
        href: 'https://www.diabete.qc.ca/en/diabetes/diabetes-management/insulin/all-about-injections/',
        hrefFr:
          'https://www.diabete.qc.ca/le-diabete/la-gestion-du-diabete/linsuline/tout-sur-linjection/',
      },
    ],
  },
  /*
   * 03 · Your Tools. Copy: DiabetesCare.chapters.your-tools, after the source
   * check of 2026-10-05. The product-support core, with product placements on
   * hold: understanding and choosing tools, what works with what, and safe
   * technique. No card places a product. Brand names appear only in the
   * pickers and the calculator's presets (./device-pairings.ts), as
   * compatibility or label facts from registered maker or government pages,
   * each with its basis (ruling R16). No red-flag block of its own and no card
   * with a same-day or 911 line: the signpost goes to Staying Safe's
   * #red-flags. The open rulings (R16–R25, and the Staying Safe defaults it
   * uses) are with the nurse and the owner, and are recorded in the content
   * review, not settled here.
   */
  {
    slug: 'your-tools',
    num: '03',
    chapterWord: 'three',
    /* A meter, lancing device and strips; Staying Safe has hero.png. A stand-in, like every image here. */
    heroImage: `${IMG}/chapter-essentials.png`,
    accent: '#c9dcef',
    rail: false,
    majorSections: true,
    /* Exactly two segments: checking your glucose, and getting insulin in. */
    startHere: { groups: ['checking', 'gettingInsulinIn'] },
    /* No red-flag block of its own: the signpost goes to Staying Safe's #red-flags. */
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Checking your glucose ---------- */
      {
        // 1 Choosing a meter. No figure; the meter lesson (card 3) is the printable.
        // Meters go to the pharmacist CDE, as card 2 does (ruling C33; R24).
        image: `${IMG}/chapter-type2.png`,
        group: 'checking',
        ask: 'pharmacistCde',
        sources: ['dc-checking-blood-sugar', 'dc-technology-and-devices'],
      },
      {
        // 2 Strips, lancets and control solution. The meter picker is HELD
        // (R16, G1): no registered page says which strips go with which meter.
        // The card's own sentences stand without it. Ask: the pharmacist CDE
        // (ruling C33); card 3, the meter lesson, stays with the educator.
        image: `${IMG}/chapter-essentials.png`,
        group: 'checking',
        ask: 'pharmacistCde',
        figures: [{ kind: 'meterMatch', held: 'meterData' }],
        sources: [
          'dc-checking-blood-sugar',
          'dc-technology-and-devices',
          'dc-getting-started-with-insulin',
          'hpsa-returning-medical-sharps',
        ],
      },
      {
        // 3 Your meter lesson. Diabetes Canada's own "ask your provider" list,
        // as a printable card with four blank lines to fill in at the pharmacy.
        // Also the no-JS and held stand-in for card 2's picker.
        image: `${IMG}/care-chat-main.png`,
        group: 'checking',
        ask: 'educator',
        figures: [{ kind: 'takeIn', fields: 4 }],
        sources: ['dc-checking-blood-sugar', 'dc-technology-and-devices'],
      },
      {
        // 4 Sensors: which pairs with what. The sensor picker; its data is
        // shared with cards 6 and 13. Each pairing names who confirms it.
        image: `${IMG}/chapter-type1.png`,
        group: 'checking',
        ask: 'pharmacistCde',
        figures: [{ kind: 'sensorPicker' }],
        sources: ['dc-technology-and-devices', 'dc-checking-blood-sugar'],
      },
      {
        // 5 Wearing a sensor, and time in range. The definition sits above the
        // columns; the finger-check line beneath.
        image: `${IMG}/chapter-journey.png`,
        group: 'checking',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [2, 3, 4],
              [5, 6],
            ],
            lead: [1],
            neutral: [7],
          },
        ],
        // The 3.9 vs 4.0 line (R19) stays outside the disclosure.
        noteVisible: true,
        sources: [
          'dc-checking-blood-sugar',
          'dc-cpg-ch9-monitoring-2021',
          'bt1d-time-in-range',
          'dc-technology-and-devices',
        ],
      },
      {
        // 6 Sensor restock calculator. Arithmetic only: no coverage, no shop
        // link (Subscribe & save is held with the product placements).
        image: `${IMG}/chapter-everyday.png`,
        group: 'checking',
        ask: 'pharmacistCde',
        figures: [
          {
            kind: 'restockCalc',
            // Up to 10 and up to 15 days, from the sensors' wear in
            // ./device-pairings.ts. Grace periods are not counted (R23).
            presets: ['dexcomG7', 'libre3Plus'],
            maxSensors: 99,
            maxDays: 30,
            maxCover: 366,
          },
        ],
        sources: ['isc-nihb-updates'],
      },

      /* ---------- Getting insulin in ---------- */
      {
        // 7 Pen needles: length and angle. Diabète Québec carries the 4 mm and
        // skin-lift lines (R18), with Diabetes Canada's "shorter, thinner
        // needles"; FIT is cited nowhere.
        image: `${IMG}/chapter-new.png`,
        group: 'gettingInsulinIn',
        ask: 'educator',
        figures: [{ kind: 'columns', columns: [[3, 4, 6], [5]], lead: [1, 2] }],
        sources: [
          'dc-technology-and-devices',
          'dc-getting-started-with-insulin',
          'dq-all-about-injections',
        ],
      },
      {
        // 8 Syringes, and insulin strength. Item 5, "never use a syringe to take
        // insulin stronger than U-100 out of the pen", tied to the strength on
        // the label, rests on the Health Canada monographs of each such insulin
        // marketed in Canada, Health Canada's 2015 alert and ISMP Canada
        // (ruling C7, 2026-10-06; R17 resolved, FIT not needed). Brand names
        // stay in the register, not in the copy. The note (spare pen and
        // needles; ask the pharmacist before any syringe) is never behind a
        // disclosure.
        image: `${IMG}/chapter-prediabetes.png`,
        group: 'gettingInsulinIn',
        ask: 'pharmacist',
        noteVisible: true,
        sources: [
          'dc-technology-and-devices',
          'dc-getting-started-with-insulin',
          'catsa-diabetic-supplies',
          'hc-dpd-pm-toujeo',
          'hc-dpd-pm-humalog',
          'hc-dpd-pm-tresiba',
          'hc-dpd-pm-awiqli',
          'hc-dpd-pm-entuzity',
          'hc-alert-humalog-200-2015',
          'ismpc-dose-confusion-2019',
        ],
      },
      {
        // 9 Giving an injection, step by step. Two sections; no figure. No
        // dose: "Dial the dose your team has set" names no number.
        image: `${IMG}/chapter-gestational.png`,
        group: 'gettingInsulinIn',
        ask: 'educator',
        sources: ['dc-getting-started-with-insulin', 'dq-all-about-injections'],
      },
      {
        // 10 Choosing and moving your sites. The rotation map augments the
        // card, whose own list carries every fact.
        image: `${IMG}/chapter-type1.png`,
        group: 'gettingInsulinIn',
        ask: 'educator',
        figures: [
          { kind: 'rotationMap', zones: 4, clearCm: 5, spacingCmAtLeast: [1, 2], weeksPerZone: 1 },
        ],
        sources: ['dc-getting-started-with-insulin', 'dq-all-about-injections'],
      },
      {
        // 11 Keeping insulin safe. "Follow your leaflet", with Diabète Québec's
        // "most up to 28 days once opened, some longer" (R5, ruling C15).
        image: `${IMG}/closing.png`,
        group: 'gettingInsulinIn',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'home',
                items: [
                  { item: 1, glyph: 'home' },
                  { item: 5, glyph: 'check' },
                ],
              },
              {
                glyph: 'pen',
                items: [
                  { item: 2, glyph: 'pen' },
                  { item: 4, glyph: 'book' },
                ],
              },
              { glyph: 'list', items: [{ item: 3, glyph: 'check' }] },
              {
                glyph: 'bag',
                items: [
                  { item: 6, glyph: 'bag' },
                  { item: 7, glyph: 'list' },
                ],
              },
            ],
          },
        ],
        sources: [
          'dq-all-about-injections',
          'dc-getting-started-with-insulin',
          'dc-air-travel',
          'catsa-diabetic-supplies',
        ],
      },
      {
        // 12 Pumps and automated insulin delivery, in plain words.
        image: `${IMG}/chapter-essentials.png`,
        group: 'gettingInsulinIn',
        ask: 'team',
        sources: ['dc-technology-and-devices', 'dc-cpg-ch41-t1d-lifespan-2025'],
      },
      {
        // 13 Your pump's supplies: what fits. The "My pump" picker reads card
        // 4's pairings from the other end (./device-pairings.ts), so the two
        // cannot disagree. A question it cannot answer goes to the CDE panel
        // on the same page (Bayshore Express Pharmacy).
        image: `${IMG}/chapter-everyday.png`,
        group: 'gettingInsulinIn',
        ask: 'pharmacistCde',
        figures: [{ kind: 'pumpPicker', askHref: CDE_PANEL_HREF }],
        sources: ['dc-technology-and-devices'],
      },
      {
        // 14 Pump backup and set changes. Set-change steps and timing are HELD
        // (FIT only). The visible note sends an unexplained high to Staying
        // Safe card 9, and that card's title in it is the link.
        image: `${IMG}/chapter-journey.png`,
        group: 'gettingInsulinIn',
        ask: 'team',
        noteVisible: true,
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'bag',
                items: [
                  { item: 1, glyph: 'list' },
                  { item: 2, glyph: 'pen' },
                  { item: 3, glyph: 'book' },
                ],
              },
              { glyph: 'sharps', items: [{ item: 4, glyph: 'sharps' }] },
            ],
          },
        ],
        // "On a pump: an unexplained high" in the note opens Staying Safe card 9.
        links: [{ at: 'note', to: { chapter: 'staying-safe', card: 9 } }],
        sources: [
          'dc-technology-and-devices',
          'dc-managing-emergency-situations',
          'hpsa-returning-medical-sharps',
          'bt1d-dka-and-ketones',
        ],
      },
    ],
    /* Band "How supplies get paid for": three cards, one outward link each. */
    programsBandLinks: [
      [
        {
          href: 'https://www.diabetes.ca/advocacy-and-policy/advocacy-reports/comparisons-by-province-territory',
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['dc-comparisons-by-province'],
        },
      ],
      [
        {
          href: 'https://www.sac-isc.gc.ca/eng/1578079214611/1578079236012',
          hrefFr: 'https://www.sac-isc.gc.ca/fra/1578079214611/1578079236012',
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['isc-nihb-updates'],
        },
      ],
      [
        {
          href: 'https://www.canada.ca/en/revenue-agency/services/tax/individuals/segments/tax-credits-deductions-persons-disabilities/disability-tax-credit/eligible-dtc/life-sustaining-therapy.html',
          hrefFr:
            'https://www.canada.ca/fr/agence-revenu/services/impot/particuliers/segments/deductions-credits-impot-personnes-handicapees/credit-impot-personnes-handicapees/admissible-ciph/soins.html',
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: ['cra-dtc-life-sustaining-therapy'],
        },
      ],
      /*
       * Card 4, the door to Funding & Coverage, held until that page existed
       * (released 2026-10-06). A Liivv page, so it opens in the page locale
       * and names no register entry of its own: the page cites its own.
       */
      [
        {
          href: '/liivv-health/diabetes-care/funding',
          hrefLang: 'en',
          locales: ['en', 'fr'],
          sources: [],
        },
      ],
    ],
    programsBandCards: [null, null, null, null],
    bandSources: [
      'dc-comparisons-by-province',
      'isc-nihb-updates',
      'cra-dtc-life-sustaining-therapy',
      'cra-rc4064-2025',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: CDE_PANEL_HREF,
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'Diabetes Canada — Technology & Devices',
        href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/technology-and-devices',
      },
      {
        label: 'Diabetes Canada — Getting Started with Insulin',
        href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/getting-started-with-insulin',
      },
      {
        label: 'Diabetes Canada — Checking Blood Sugar',
        href: 'https://www.diabetes.ca/living-with-diabetes/blood-sugar-management/checking-blood-sugar',
      },
      {
        label: 'Diabète Québec — All about injections',
        labelFr: "Diabète Québec — Tout sur l'injection",
        href: 'https://www.diabete.qc.ca/en/diabetes/diabetes-management/insulin/all-about-injections/',
        hrefFr:
          'https://www.diabete.qc.ca/le-diabete/la-gestion-du-diabete/linsuline/tout-sur-linjection/',
      },
      {
        label: 'Health Products Stewardship Association — Returning Medical Sharps',
        href: 'https://healthsteward.ca/consumers/returning-medical-sharps/',
      },
    ],
  },
  /*
   * 04 · Every Day Living. Copy: DiabetesCare.chapters.every-day-living, after
   * the source check of 2026-10-05. It replaced the older chapter of the same
   * slug. No red-flag block of its own: the signpost goes
   * to Staying Safe's #red-flags, which covers lows and highs only, and the
   * signpost says no more than that. The clinical defaults it uses (R1–R10
   * from Staying Safe, and its own D1–D17) are open with the nurse and are
   * recorded in the content review, not settled here. The checkup-year map
   * (an optional band figure) is not built: the band ships as four cards.
   */
  {
    slug: 'every-day-living',
    num: '04',
    chapterWord: 'four',
    heroImage: `${IMG}/chapter-everyday.png`,
    /* Placeholder until the Diabetes image set and palette are chosen (D14). */
    accent: '#c9dcc0',
    rail: false,
    majorSections: true,
    /* Exactly two segments: day to day, and protecting your body. */
    startHere: { groups: ['dayToDay', 'protectingYourBody'] },
    /* No red-flag block of its own: the signpost goes to Staying Safe's #red-flags. */
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Day to day ---------- */
      {
        // 1 Food without a rulebook. The eating styles above, then more often,
        // less often and how you eat.
        image: `${IMG}/chapter-everyday.png`,
        group: 'dayToDay',
        ask: 'dietitian',
        figures: [{ kind: 'columns', columns: [[2, 3], [4], [5, 6]], lead: [1] }],
        sources: [
          'dc-cpg-ch11-nutrition-therapy',
          'hc-healthy-eating-recommendations',
          'dc-carb-counting-sheet-2025',
        ],
      },
      {
        // 2 Carb counting. No insulin maths. A printable "My carbohydrate goals"
        // with five blank lines, filled in with a dietitian or educator (D6).
        image: `${IMG}/chapter-prediabetes.png`,
        group: 'dayToDay',
        ask: 'dietitian',
        figures: [{ kind: 'takeIn', fields: 5 }],
        sources: ['dc-cpg-ch11-nutrition-therapy', 'dc-carb-counting-sheet-2025'],
      },
      {
        // 3 Moving your body. Lows after activity stay in Staying Safe card 4,
        // which item 7 links to. Item 6 keeps "stop the activity" for chest
        // pain or breathlessness and adds Heart & Stroke's heart-attack signs
        // and "call 911" (held line H2, released once that source was
        // registered). Worded as ruled on 2026-10-06 (C3: "much more short of
        // breath than usual", stop and call 911, then tell your doctor before
        // exercising again; D4 and H2 closed). The 911 line sends the reader
        // to act now, so the card is pinned open (C25).
        image: `${IMG}/chapter-journey.png`,
        group: 'dayToDay',
        ask: 'team',
        urgentContent: true,
        figures: [{ kind: 'columns', columns: [[1, 2, 3], [4], [5]], neutral: [6, 7] }],
        // "Lows that sneak up" in item 7 opens Staying Safe card 4.
        links: [{ at: 'items.7', to: { chapter: 'staying-safe', card: 4 } }],
        sources: [
          'dc-cpg-ch10-physical-activity',
          'dc-exercise-and-activity',
          'hsf-heart-attack-signs',
        ],
      },
      {
        // 4 Alcohol and cannabis. Ruling C16 (2026-10-06): each 2023 position in
        // its own body's words: Diabetes Canada's (CPG Ch18 2023: don't start;
        // cutting down "may mean" at most 2 standard drinks a week) and CCSA's
        // (2 or fewer a week, more than 2 at one time raises harms, less is
        // better), never as a CCSA limit. The 04/18 sheet's don't-drink list
        // stays, attributed and dated; Ch11 (2018) is no longer cited here
        // (R10, D7 and H5 closed). Ch18's over-4-per-occasion line stays out.
        // The glucagon-and-alcohol line lives in Staying Safe card 4 only, in
        // CPG Ch14 2023's words; item 3 here keeps its pointer (D15, ruling
        // C2). Its 911 mention prepares, so the card is not pinned (C25).
        image: `${IMG}/chapter-type2.png`,
        group: 'dayToDay',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3, 4, 5],
              [6, 7],
            ],
          },
        ],
        // "Lows that sneak up" in item 3 opens Staying Safe card 4.
        links: [{ at: 'items.3', to: { chapter: 'staying-safe', card: 4 } }],
        sources: [
          'dc-alcohol-and-diabetes-2018',
          'dc-diabetes-and-drinking-2019',
          'dc-cpg-ch18-mental-health-2023',
          'ccsa-alcohol-guidance-2023',
          'dc-cannabis-position-2020',
        ],
      },
      {
        // 5 Distress, stress and sleep. The strip carries 911 as well as 9-8-8
        // (the 9-8-8 page says "If your safety is at risk, call 9-1-1 right
        // away"), so the card is pinned open in every locale (D9). The routes
        // say who to tell, so there is no ask chip, as on Ostomy.
        image: `${IMG}/care-chat-main.png`,
        group: 'dayToDay',
        urgentContent: true,
        figures: [
          {
            kind: 'crisis',
            numbers: [
              { tel: '911', kind: 'emergency', written: '911' },
              { tel: '988', sms: true },
            ],
          },
          { kind: 'routes', routes: [{ glyphs: ['team', 'primaryCare'] }, { glyphs: ['book'] }] },
        ],
        sources: [
          'dc-taking-care-of-mental-health',
          'dc-cpg-ch18-mental-health-2023',
          'dc-exercise-and-activity',
          'bt1d-mental-health-support',
          '988-suicide-crisis-helpline',
        ],
      },
      {
        // 6 Flying with diabetes supplies. Generic symbols only; no product.
        // Insulin changes for time zones are left out (dosing): the note sends
        // the reader to their doctor or educator.
        image: `${IMG}/chapter-new.png`,
        group: 'dayToDay',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'containers',
            containers: [
              {
                glyph: 'bag',
                items: [
                  { item: 1, glyph: 'pen' },
                  { item: 2, glyph: 'drop' },
                  { item: 3, glyph: 'sharps' },
                  { item: 7, glyph: 'pen' },
                ],
              },
              {
                glyph: 'people',
                items: [
                  { item: 4, glyph: 'pump' },
                  { item: 5, glyph: 'sensor' },
                ],
              },
              { glyph: 'book', items: [{ item: 6, glyph: 'list' }] },
            ],
          },
        ],
        sources: ['catsa-diabetic-supplies', 'dc-air-travel'],
      },
      {
        // 7 Driving. CPG Ch21 throughout, including its 4.0 (R1, D1; ruling
        // C1: 4.0 only here). The note on 3.9 vs 4.0 stays visible, as Staying
        // Safe's driving line does. Items 8 and 9 carry the commercial-driver
        // 12 months and medical-fitness lines (ruling C9; D2 and D3 closed);
        // provincial reporting rules stay out (H11).
        image: `${IMG}/chapter-essentials.png`,
        group: 'dayToDay',
        ask: 'team',
        noteVisible: true,
        figures: [
          {
            kind: 'columns',
            columns: [
              [2, 6],
              [3, 4, 5],
              [7, 8],
            ],
            lead: [1],
            neutral: [9],
          },
        ],
        sources: [
          'dc-cpg-ch21-driving',
          'dc-drive-safe-card',
          'dc-driving-and-diabetes',
          'dc-cpg-ch14-hypoglycemia-2023',
        ],
      },

      /* ---------- Protecting your body ---------- */
      {
        // 8 Your feet, every day. "See someone right away" is a same-day line,
        // and item 7 now ends with Wounds Canada's "don't wait" tier (see your
        // doctor right away or go to the emergency department; ruling C10, H3
        // released, D16 closed), so the card is pinned open (D8, C25).
        image: `${IMG}/chapter-type1.png`,
        group: 'protectingYourBody',
        ask: 'primaryCare',
        urgentContent: true,
        figures: [{ kind: 'columns', columns: [[2, 3, 4, 5], [6], [7], [8]], lead: [1] }],
        sources: [
          'dc-foot-care-sheet-2025',
          'dc-cpg-ch32-foot-care',
          'wounds-canada-diabetic-foot-ulcers',
          'wounds-canada-foot-emergency',
        ],
      },
      {
        // 9 Your eyes. Ruling C24 (2026-10-06; D5 closed): Diabetes Canada's
        // patient page first (once a year, unless the eye-care professional
        // says otherwise), then CPG Ch30's starting points; COS agrees on at
        // least yearly; for pregnancy each body is credited for its own advice;
        // Ch30's 1–2 years for type 2 is the exception, in the note. CNIB's
        // see-now signs pin it open (D8, C25); item 6 now ends with the sudden
        // flashes, floaters or vision going dark tier (CNIB / COS; ruling C10,
        // H4 released, D17 closed). Ask role: eye care (ruling C33; D13).
        image: `${IMG}/chapter-gestational.png`,
        group: 'protectingYourBody',
        ask: 'eyeCare',
        urgentContent: true,
        figures: [{ kind: 'columns', columns: [[4, 5], [6]], lead: [1, 2, 3], neutral: [7, 8] }],
        sources: [
          'dc-eye-damage-retinopathy',
          'dc-cpg-ch30-retinopathy',
          'cos-diabetic-retinopathy',
          'cnib-diabetic-retinopathy',
          'cnib-floaters-and-flashing-lights',
        ],
      },
      {
        // 10 Your kidneys. No figure. Item 8 states CPG Ch29 2025's key message
        // for people with no drug class: some diabetes medicines also protect
        // the kidneys and heart, ask your team, don't change a medicine on your
        // own (ruling C21; D10 closed). The Kidney Foundation's statistics stay
        // out: the Indigenous figure would need an Indigenous health partner's
        // review, and there is none (owner, B1).
        image: `${IMG}/hero.png`,
        group: 'protectingYourBody',
        ask: 'primaryCare',
        sources: ['dc-kidney-disease', 'dc-cpg-ch29-ckd-2025', 'kfoc-end-diabetic-kidney-disease'],
      },
      {
        // 11 Your heart: the ABCDEs (Diabetes Canada's patient-page spelling).
        // One column per letter; "D" names no medicine class (D11).
        image: `${IMG}/closing.png`,
        group: 'protectingYourBody',
        ask: 'primaryCare',
        figures: [
          {
            kind: 'columns',
            columns: [[3], [4], [5], [6], [7], [8]],
            lead: [1, 2],
            neutral: [9],
          },
        ],
        sources: ['dc-heart-disease-and-stroke'],
      },
      {
        // 12 Work and your rights. No ask chip: nobody on the care team owns this.
        image: `${IMG}/care-chat-main.png`,
        group: 'protectingYourBody',
        // "Driving" in item 4 opens card 7 of this chapter.
        links: [{ at: 'items.4', to: { chapter: 'every-day-living', card: 7 } }],
        sources: ['dc-rights-of-people-living-with-diabetes', 'dc-driving-and-diabetes'],
      },
    ],
    /*
     * Band "Your checkup year": four cards, no links. Each band card's body
     * names the chapter card that covers it by its exact title, which then
     * links to it: Your eyes (9), Your kidneys (10), Your feet, every day (8)
     * and Your heart: the ABCDEs (11). A checkup-year map could take the band
     * slot later, with these cards as its no-JS and /fr fallback.
     */
    programsBandLinks: [[], [], [], []],
    programsBandCards: [9, 10, 8, 11],
    /* Band card 1 (eyes) leads with Diabetes Canada's patient page (ruling C24). */
    bandSources: [
      'dc-eye-damage-retinopathy',
      'dc-cpg-ch30-retinopathy',
      'dc-cpg-ch29-ckd-2025',
      'dc-kidney-disease',
      'dc-foot-care-sheet-2025',
      'dc-cpg-ch32-foot-care',
      'dc-heart-disease-and-stroke',
      'dc-cpg-ch9-monitoring-2021',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: CDE_PANEL_HREF,
    resourceLinks: [],
    /*
     * The resources shelf (owner answer B28, 2026-10-06: "Yes definitely"),
     * Ostomy's shape: four groups, index-matched to `shelf.groups.<n>` in the
     * messages. Official Canadian pages only, each opened 2026-10-06 and
     * registered; no industry page and no retailer. A publisher's own French
     * page is used on /fr where it keeps one. The whole shelf waits on the
     * `shelf` French gate (review-gates.ts).
     */
    shelf: {
      groups: [
        {
          glyph: 'peer',
          links: [
            {
              org: '9-8-8: Suicide Crisis Helpline',
              orgFr: '9-8-8 : Ligne d’aide en cas de crise de suicide',
              href: 'https://988.ca/',
              hrefFr: 'https://988.ca/fr',
              hrefLang: 'en',
              sources: ['988-suicide-crisis-helpline'],
            },
            {
              org: 'Diabetes Canada',
              orgFr: 'Diabète Canada',
              href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/mental-health-and-diabetes/taking-care-of-your-mental-health',
              hrefLang: 'en',
              sources: ['dc-taking-care-of-mental-health'],
            },
            {
              org: 'Breakthrough T1D Canada',
              orgFr: 'Percée DT1',
              href: 'https://breakthrought1d.ca/mental-health-support/',
              hrefFr: 'https://perceedt1.ca/soutien-en-sante-mentale/',
              hrefLang: 'en',
              sources: ['bt1d-mental-health-support'],
            },
          ],
        },
        {
          glyph: 'bag',
          links: [
            {
              org: 'Canadian Air Transport Security Authority',
              orgFr: 'Administration canadienne de la sûreté du transport aérien',
              href: 'https://www.catsa-acsta.gc.ca/en/what-can-bring/item/diabetic-supplies',
              hrefFr:
                'https://www.catsa-acsta.gc.ca/fr/que-puis-je-emporter/article/fournitures-pour-diabetiques',
              hrefLang: 'en',
              sources: ['catsa-diabetic-supplies'],
            },
            {
              org: 'Diabetes Canada',
              orgFr: 'Diabète Canada',
              href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/the-rights-of-people-living-with-diabetes/air-travel',
              hrefLang: 'en',
              sources: ['dc-air-travel'],
            },
            {
              org: 'Diabetes Québec',
              orgFr: 'Diabète Québec',
              href: 'https://www.diabete.qc.ca/en/diabetes/living-with-diabetes/travels/',
              hrefFr: 'https://www.diabete.qc.ca/le-diabete/la-vie-avec-le-diabete/voyages/',
              hrefLang: 'en',
              sources: ['dq-trips'],
            },
          ],
        },
        {
          glyph: 'hands',
          links: [
            {
              org: 'Diabetes Canada',
              orgFr: 'Diabète Canada',
              href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/the-rights-of-people-living-with-diabetes',
              hrefLang: 'en',
              sources: ['dc-rights-of-people-living-with-diabetes'],
            },
            {
              org: 'Canadian Human Rights Commission',
              orgFr: 'Commission canadienne des droits de la personne',
              href: 'https://www.chrc-ccdp.gc.ca/our-work/human-rights-complaints',
              hrefFr:
                'https://www.ccdp-chrc.gc.ca/notre-travail/plaintes-en-matiere-de-droits-de-la-personne',
              hrefLang: 'en',
              sources: ['chrc-human-rights-complaints'],
            },
          ],
        },
        {
          glyph: 'book',
          links: [
            {
              org: 'Diabetes Canada',
              orgFr: 'Diabète Canada',
              href: 'https://www.diabetes.ca/living-with-diabetes/virtual-learning/virtual-diabetes-education-program',
              hrefLang: 'en',
              sources: ['dc-virtual-diabetes-education-program'],
            },
            {
              org: 'Diabetes Québec',
              orgFr: 'Diabète Québec',
              href: 'https://www.diabete.qc.ca/en/service/infodiabetes-service/',
              hrefFr: 'https://www.diabete.qc.ca/service/service-infodiabete-2/',
              hrefLang: 'en',
              sources: ['dq-infodiabetes-service'],
            },
          ],
        },
      ],
    },
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'Diabetes Canada — Foot care: a step toward good health (08/25)',
        href: 'https://www.diabetes.ca/getContentAsset/33d37ad7-82dd-4c56-a8ee-48cd7051589a/0f6cf596-933c-4f74-b36a-77091c512445/foot-care.pdf?language=en',
      },
      {
        label: 'Diabetes Canada — Diabetes and Driving',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-21',
      },
      {
        label: 'Diabetes Canada — Mental Health and Diabetes: 2023 Update',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-18-2023-update',
      },
      {
        label: 'Diabetes Canada — Air Travel',
        href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/the-rights-of-people-living-with-diabetes/air-travel',
      },
      {
        label: 'Diabetes Canada — Heart Disease & Stroke',
        href: 'https://www.diabetes.ca/living-with-diabetes/managing-complications/heart-disease-and-stroke',
      },
      {
        label: 'Diabetes Canada — Kidney Disease',
        href: 'https://www.diabetes.ca/living-with-diabetes/managing-complications/kidney-disease',
      },
      {
        label: 'Heart and Stroke Foundation — Signs of a heart attack',
        labelFr: 'Fondation des maladies du cœur et de l’AVC — Les signes d’une crise cardiaque',
        href: 'https://www.heartandstroke.ca/heart-disease/emergency-signs',
        hrefFr: 'https://www.coeuretavc.ca/maladies-du-coeur/signes-d-urgence',
      },
    ],
  },
  /*
   * 05 · Know Your Type. Copy: DiabetesCare.chapters.know-your-type, after the
   * source check of 2026-10-05. No red-flag block of its own: emergency signs
   * live only in Staying Safe, reached through the signpost. Card 2 carries
   * the one same-day line ("contact your doctor or another health-care
   * provider today"), so it is pinned (rulings C11, C25). Cards 7–10 rest mainly on non-Canadian sources and
   * carry the "International guidance" badge in their messages; mixed cards
   * name the international source in the sentence (ruling C40). Rulings K1–K24
   * were settled by the clinical rulings of 2026-10-06
   * (docs/diabetes-content/clinical-rulings-2026-10-06.md): where a Canadian
   * source covers a point, the line is Canadian only (C27).
   */
  {
    slug: 'know-your-type',
    num: '05',
    chapterWord: 'five',
    // A stand-in, like every image here; the accent is a placeholder too.
    heroImage: `${IMG}/chapter-journey.png`,
    accent: '#cfdcef',
    rail: false,
    majorSections: true,
    /* Exactly two segments: the common types, and the less common types. */
    startHere: { groups: ['commonTypes', 'lessCommonTypes'] },
    /* No red-flag block of its own: the signpost goes to Staying Safe's #red-flags. */
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- The common types ---------- */
      {
        // 1 Type 1, including in adults.
        image: `${IMG}/chapter-type1.png`,
        group: 'commonTypes',
        ask: 'endo',
        // "Ketones and DKA" in the note opens Staying Safe card 7 (Ketones).
        links: [{ at: 'note', to: { chapter: 'staying-safe', card: 7 } }],
        // Item 1 says "5 to 10%", as everywhere else (ruling C41); item 2 words
        // the 71% as Breakthrough T1D's estimate (C39).
        sources: [
          'dc-type-1',
          'dc-diabetes-in-canada',
          'bt1d-facts-and-figures',
          'dc-cpg-ch3-classification-diagnosis',
          'dc-cpg-ch41-t1d-lifespan-2025',
        ],
      },
      {
        // 2 Type 2. The diagnostic numbers as three columns. Item 8 (with
        // symptoms, don't wait for a second test) is a same-day line,
        // "contact your doctor or another health-care provider today", so the
        // card is pinned (rulings C11, C25; K24 closed).
        image: `${IMG}/chapter-type2.png`,
        group: 'commonTypes',
        ask: 'primaryCare',
        urgentContent: true,
        figures: [
          { kind: 'columns', columns: [[4], [5], [6]], lead: [1, 2, 3], neutral: [7, 8, 9] },
        ],
        // "Emergency signs" in item 8 opens Staying Safe's red-flag list.
        links: [{ at: 'items.8', to: { chapter: 'staying-safe', anchor: 'red-flags' } }],
        sources: [
          'dc-type-2',
          'dc-cpg-ch3-classification-diagnosis',
          'dc-cpg-ch35-t2d-children',
          'dc-hyperglycemia',
        ],
      },
      {
        // 3 Prediabetes. Card 2's three columns, with the prediabetes ranges.
        // No shop strip, on purpose.
        image: `${IMG}/chapter-prediabetes.png`,
        group: 'commonTypes',
        ask: 'primaryCare',
        figures: [{ kind: 'columns', columns: [[2], [3], [4]], lead: [1], neutral: [5, 6] }],
        sources: ['dc-cpg-ch3-classification-diagnosis', 'dc-prediabetes'],
      },
      {
        // 4 Gestational, or from before pregnancy. The after-birth reminder:
        // three blank lines, filled in with the team.
        image: `${IMG}/chapter-gestational.png`,
        group: 'commonTypes',
        ask: 'team',
        figures: [{ kind: 'takeIn', fields: 3 }],
        sources: [
          'dc-cpg-ch36-pregnancy',
          'sogc-glucose-testing',
          'dc-gestational-diabetes',
          'exeter-gck-pregnancy-2018',
        ],
      },
      {
        // 5 Type 1 starts before symptoms. The stages as three columns, the
        // screening routes beneath. Stages 2 and 3 now have Canadian sources
        // too (ruling C27, K13). Item 10 (teplizumab, ruling C26; K7 closed)
        // gives the brand, age 8 and over, and the "about 2 years" delay beside
        // the serious side effects and the do-not-reimburse decision; no
        // dosing. Item 11 is Breakthrough T1D's pointer to UncoverT1D, which
        // says Sanofi runs it and is never linked (ruling C36; K18 closed): the
        // pointer rests on `bt1d-stages-and-diagnosis`, "Sanofi makes
        // teplizumab" on the monograph and the CDA recommendation.
        image: `${IMG}/chapter-journey.png`,
        group: 'commonTypes',
        ask: 'primaryCare',
        figures: [
          {
            kind: 'columns',
            columns: [[2], [3], [4]],
            lead: [1],
            neutral: [5, 6, 7, 8, 9, 10, 11],
          },
        ],
        sources: [
          'bt1d-stages-and-diagnosis',
          'ada-soc-2026-s2-summary',
          'phillip-pre-stage-3-monitoring-2024',
          'bt1d-trialnet',
          'canscreen-t1d',
          'dc-cpg-ch41-t1d-lifespan-2025',
          'dc-tzield-access-2026',
          // Not industry, and gives the indication itself ("8 years of age and
          // older with Stage 2"), so no manufacturer page is cited here.
          'bt1d-tzield-update-2026',
          // Health Canada's authorized monograph (written by the sponsor) and
          // Canada's Drug Agency: the indication, the delay and the harms (C26).
          'hc-dpd-tzield-monograph-2026',
          'cda-amc-tzield-recommendation-2026',
        ],
      },

      /* ---------- Less common types ---------- */
      {
        // 6 Could my type be different? Four sections. The clues checklist
        // draws the whole card, with section 2 as tick boxes and the card's
        // note as its fixed "Not a diagnostic tool" banner, which carries the
        // insulin safety line (K23); the glossary sits beneath it. With both
        // dropped on /fr the card is its four sections and that note.
        image: `${IMG}/chapter-new.png`,
        group: 'lessCommonTypes',
        ask: 'team',
        noteVisible: true,
        figures: [
          {
            kind: 'cluesChecklist',
            section: 2,
            questions: 5,
            sources: [
              'dc-cpg-ch3-classification-diagnosis',
              'holt-t1d-adults-consensus-2021',
              'ada-soc-2026-s2-summary',
              'diabetes-uk-mody',
              'exeter-midd',
              'dc-cpg-appendix-2-classification',
              'dc-cpg-ch20-transplantation',
            ],
          },
          {
            kind: 'testGlossary',
            // Anchors #dc-term-gad … #dc-term-gene-panel, in `figure.terms` order.
            terms: [
              { slug: 'gad' },
              { slug: 'ia-2-znt8-iaa' },
              { slug: 'c-peptide' },
              { slug: 'a1c' },
              { slug: 'ogtt' },
              { slug: 'gene-panel' },
            ],
            // `figure.glossaryNote`, under the heading, labels the international meanings (K11).
            sources: [
              'holt-t1d-adults-consensus-2021',
              'buzzetti-lada-consensus-2020',
              'bt1d-lada',
              'phillip-pre-stage-3-monitoring-2024',
              'exeter-c-peptide-antibody-tests',
              'dc-cpg-ch3-classification-diagnosis',
              'dc-cpg-ch9-monitoring-2021',
              'dc-cpg-ch36-pregnancy',
              'ispad-2022-ch4-monogenic',
              'exeter-mody-testing-guidelines',
            ],
          },
        ],
        sources: [
          'dc-cpg-ch3-classification-diagnosis',
          'dc-cpg-ch35-t2d-children',
          'holt-t1d-adults-consensus-2021',
          'exeter-what-is-mody',
          'diabetes-uk-mody',
          'exeter-midd',
          'dc-cpg-appendix-2-classification',
          'ada-soc-2026-s2-summary',
          'dc-cpg-ch20-transplantation',
          'exeter-c-peptide-antibody-tests',
          'ispad-2022-ch4-monogenic',
          'on-health-genetics-clinics',
          'sbgh-anti-gad65',
          'bcdiabetes-autoantibody-testing',
          'on-form-014-4521-84',
          'phsa-out-of-province-test-requests',
          'chusj-genetic-tests-not-available',
        ],
      },
      {
        // 7 LADA. International guidance (management rests on Buzzetti).
        // Questions to bring: four blank lines; the fourth question asks
        // whether a sensor would help, since "CGM is standard" stays held for
        // LADA (ruling C35; K19 closed). The note carries the insulin safety
        // line (ruling C22), so it stays visible.
        image: `${IMG}/chapter-essentials.png`,
        group: 'lessCommonTypes',
        ask: 'endo',
        noteVisible: true,
        figures: [{ kind: 'takeIn', fields: 4 }],
        sources: [
          'bt1d-lada',
          'buzzetti-lada-consensus-2020',
          'diabetes-uk-lada',
          'dc-cpg-ch3-classification-diagnosis',
        ],
      },
      {
        // 8 MODY. International guidance. The subtypes as three columns, then
        // the family tree. The note carries the insulin safety line, so it
        // stays visible. Item 3's clue is Diabetes Canada's "not having obesity"
        // (ruling C45). A genetic counsellor role was declined (C33; K10): a
        // genetics referral comes through a clinician, so the ask stays endo.
        image: `${IMG}/chapter-everyday.png`,
        group: 'lessCommonTypes',
        ask: 'endo',
        noteVisible: true,
        figures: [
          {
            kind: 'columns',
            columns: [[6], [7], [8]],
            lead: [1, 2, 3, 4, 5],
            neutral: [9, 10, 11, 12],
          },
          {
            kind: 'familyTree',
            sides: [
              { side: 'yours', rows: [1, 2, 3] },
              { side: 'mothers', rows: [4, 5, 6, 7] },
              { side: 'fathers', rows: [8, 9, 10, 11] },
            ],
            columns: ['hasDiabetes', 'ageAtDiagnosis', 'typeTold', 'insulinSoon', 'hearingLoss'],
            sources: [
              'dc-cpg-ch3-classification-diagnosis',
              'diabetes-uk-mody',
              'exeter-mody-testing-guidelines',
              'exeter-midd',
            ],
          },
        ],
        sources: [
          'diabetes-uk-mody',
          'exeter-what-is-mody',
          'niddk-monogenic',
          'dc-cpg-ch3-classification-diagnosis',
          'exeter-mody-testing-guidelines',
          'murphy-monogenic-precision-diagnostics-2023',
          'ispad-2022-ch4-monogenic',
          'exeter-hnf1b-mody',
          'exeter-gck-pregnancy-2018',
          'patel-cpsp-monogenic-2023',
        ],
      },
      {
        // 9 Diabetes in babies. International guidance. No "about 40%" figure
        // (source check). The note carries the insulin safety line, so it
        // stays visible.
        image: `${IMG}/care-chat-main.png`,
        group: 'lessCommonTypes',
        ask: 'endo',
        noteVisible: true,
        sources: [
          'dc-cpg-ch3-classification-diagnosis',
          'exeter-about-neonatal-diabetes',
          'niddk-monogenic',
          'ispad-2022-ch4-monogenic',
          'exeter-sulfonylurea-treatment',
        ],
      },
      {
        // 10 Genetic syndromes. International guidance. Wolfram (column 2, item
        // 6) stays under the card's badge (ruling C35; K8 closed). A genetic
        // counsellor role was declined (C33; K10), so the ask stays endo.
        image: `${IMG}/closing.png`,
        group: 'lessCommonTypes',
        ask: 'endo',
        figures: [{ kind: 'columns', columns: [[2, 3, 4, 5], [6], [7]], lead: [1], neutral: [8] }],
        sources: ['ispad-2022-ch4-monogenic', 'exeter-midd', 'medlineplus-wolfram-syndrome'],
      },
      {
        // 11 Pancreas conditions and iron overload. The type 3c name and detail
        // and the pancreatic-cancer clue stay HELD (ruling C34; K9 and K20
        // closed): the Canadian Cancer Society's "Risks for pancreatic cancer"
        // is the candidate source, and any release follows its risk-based
        // wording. No type is named for hemochromatosis (C35; K15). A GI
        // specialist role was declined (C33; K10), so the ask stays team.
        image: `${IMG}/hero.png`,
        group: 'lessCommonTypes',
        ask: 'team',
        figures: [{ kind: 'columns', columns: [[1], [2, 3, 4, 5, 6]] }],
        sources: [
          'dc-cpg-appendix-2-classification',
          'chs-hemochromatosis-condition',
          'chs-hemochromatosis-faq',
          'bc-guidelines-iron-overload',
          'chs-hemochromatosis-treatment',
        ],
      },
      {
        // 12 CFRD. Item 3 (screening) rests on CF Canada 2024 alone (ruling
        // C27, K5); item 5 keeps the guideline's own scope for glucagon
        // teaching, people on insulin and their families or carers (C43), and
        // names ISPAD in the sentence. Ask: the CF clinic (ruling C33; K10).
        image: `${IMG}/chapter-type1.png`,
        group: 'lessCommonTypes',
        ask: 'cfClinic',
        // "the Rule of 15" in the note opens Staying Safe card 2.
        links: [{ at: 'note', to: { chapter: 'staying-safe', card: 2 } }],
        sources: [
          'dc-cpg-appendix-2-classification',
          'cf-canada-cfrd-guideline-2024',
          'ispad-2022-cfrd',
        ],
      },
      {
        // 13 Medicines and transplant. Four columns. The note ("don't stop or
        // change how you take any of these medicines on your own", ruling C22)
        // stays visible (K12). Item 8 (transplant screening) rests on CPG Ch20
        // alone (ruling C27, K6). Ask: the prescriber, one role only; the
        // visible note keeps "or pharmacist" (ruling C33; K10).
        image: `${IMG}/chapter-type2.png`,
        group: 'lessCommonTypes',
        ask: 'prescriber',
        noteVisible: true,
        figures: [
          {
            kind: 'columns',
            columns: [[2], [3, 4, 5], [6], [7, 8, 9]],
            lead: [1],
            neutral: [10],
          },
        ],
        // "signs of high blood sugar and ketones" in item 10 opens Staying Safe card 6 (Highs).
        links: [{ at: 'items.10', to: { chapter: 'staying-safe', card: 6 } }],
        sources: [
          'dc-cpg-appendix-2-classification',
          'dc-cpg-ch16-in-hospital',
          'dc-cpg-ch18-mental-health',
          'ada-soc-2026-s2-summary',
          // Item 6: checkpoint-inhibitor diabetes "may present with… diabetic ketoacidosis".
          'holt-t1d-adults-consensus-2021',
          'dc-cpg-ch20-transplantation',
          'sharif-ptdm-consensus-2024',
        ],
      },
    ],
    /* Band "Who does the testing": four cards, no links. */
    programsBandLinks: [[], [], [], []],
    /*
     * Each band card's body names a chapter card by its exact title, which then
     * links to it: Could my type be different? (6), MODY: single-gene diabetes
     * (8), Type 1 starts before symptoms (5), Cystic fibrosis-related diabetes (12).
     */
    programsBandCards: [6, 8, 5, 12],
    bandSources: [
      'sbgh-anti-gad65',
      'bcdiabetes-autoantibody-testing',
      'dc-cpg-ch3-classification-diagnosis',
      'on-health-genetics-clinics',
      'on-form-014-4521-84',
      'phsa-out-of-province-test-requests',
      'chusj-genetic-tests-not-available',
      'bt1d-trialnet',
      'cf-canada-cfrd-guideline-2024',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: CDE_PANEL_HREF,
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label:
          'Diabetes Canada — Definition, Classification and Diagnosis of Diabetes, Prediabetes and Metabolic Syndrome',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-3',
      },
      {
        label: 'Breakthrough T1D — Stages and diagnosis of T1D',
        href: 'https://breakthrought1d.ca/t1d-basics/stages-and-diagnosis-of-t1d/',
      },
      {
        label: 'Breakthrough T1D — TrialNet',
        href: 'https://breakthrought1d.ca/research/clinical-trials/trialnet/',
      },
      {
        label: 'Breakthrough T1D — Latent autoimmune diabetes in adults',
        href: 'https://breakthrought1d.ca/newly-diagnosed/latent-autoimmune-diabetes-in-adults/',
      },
      /* The guideline's official page, which links it (owner answer B36, 2026-10-06). */
      {
        label:
          'Cystic Fibrosis Canada — Cystic Fibrosis Related Diabetes (CFRD): A First Canadian Clinical Practice Guideline (2024)',
        labelFr:
          'Fibrose kystique Canada — Diabète associé à la fibrose kystique : premières lignes directrices de pratique clinique Canadiennes (2024)',
        href: 'https://cysticfibrosis.ca/guidelines-and-standards-of-care',
        hrefFr:
          'https://fibrosekystique.ca/normes-de-soins-de-la-fk-et-lignes-directrices-cliniques',
      },
      {
        label:
          'ISPAD — Clinical Practice Consensus Guidelines 2022: The diagnosis and management of monogenic diabetes in children and adolescents',
        href: 'https://doi.org/10.1111/pedi.13426',
      },
    ],
  },
  /*
   * 06 · This Might Be You. Copy: DiabetesCare.chapters.this-might-be-you,
   * after the source check of 2026-10-05 and the clinical rulings of
   * 2026-10-06, which settled R1–R10 and M1–M8, M13–M15 here; M9–M12 and M16
   * stay open and are recorded in the content review. Card 6 waits on review by an Indigenous health partner
   * before it is published (M10), and on the NIHB eligibility page's
   * exceptions line being released (M11). No new figure kind: every card uses
   * one the engine draws. Products for cards 2 to 4 are in chapter-shop.ts.
   */
  {
    slug: 'this-might-be-you',
    num: '06',
    chapterWord: 'six',
    heroImage: `${IMG}/chapter-gestational.png`,
    // Placeholder; the owner picks the accent with the image set.
    accent: '#cdbfdc',
    rail: false,
    majorSections: true,
    /* Exactly two segments: seasons of life, and care and community. */
    startHere: { groups: ['seasonsOfLife', 'careAndCommunity'] },
    /*
     * No red flags of its own. Cards 1, 2, 3 and 5 are read by someone who may
     * meet a low, a high or DKA (a pregnant reader, a parent, school staff, a
     * carer), so the chapter points at Staying Safe's list.
     */
    urgentExit: { chapter: 'staying-safe' },
    categories: [
      /* ---------- Seasons of life ---------- */
      {
        // 1 Pregnancy with type 1 or type 2. Rests on CPG Ch36 (2018); the note
        // says it draws mostly on that guideline for health professionals and
        // its key messages for people planning a pregnancy, and that it is
        // being updated (ruling C23; M1). The folic acid line says a higher
        // dose may be needed, with no amount (ruling C19, with PHAC). Pinned
        // open: "DKA needs medical care right away" (s2 item 4). Ask: the
        // pregnancy care team (ruling C33; M14).
        image: `${IMG}/chapter-gestational.png`,
        group: 'seasonsOfLife',
        ask: 'obstetric',
        urgentContent: true,
        // The printable preconception plan: five blank lines, filled in with
        // the team. No amounts are pre-printed (M2, M3).
        figures: [{ kind: 'takeIn', fields: 5 }],
        // "Know Your Type" in the note opens Know Your Type card 4 (gestational).
        links: [{ at: 'note', to: { chapter: 'know-your-type', card: 4 } }],
        sources: [
          'dc-cpg-ch36-pregnancy',
          'dc-cpg-ch9-monitoring-2021',
          'cos-diabetic-retinopathy',
          'dc-cpg-ch15-hyperglycemic-emergencies',
          'bt1d-dka-and-ketones',
          'dc-gestational-diabetes',
          'phac-folic-acid',
        ],
      },
      {
        // 2 A child with type 1. Items 2 and 4 send the reader to Staying
        // Safe's Rule of 15 and ketone ladder by title; the amounts live there.
        // Item 9, in the growing-up column, says when eye and kidney checks
        // start: kidneys per CPG Ch29 2025, eyes per Ch34, then "your child's
        // team sets the schedule" (ruling C37; M15).
        image: `${IMG}/chapter-type1.png`,
        group: 'seasonsOfLife',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3, 4],
              [5, 9],
              [6, 7, 8],
            ],
          },
        ],
        // "The Rule of 15" in item 2 opens Staying Safe card 2 with the
        // amounts for a child showing (`view: 'child'`); "Ketones: check and
        // act" in item 4 opens Staying Safe card 7; "Funding & Coverage" in the
        // note opens that page.
        links: [
          { at: 'items.2', to: { chapter: 'staying-safe', card: 2, view: 'child' } },
          { at: 'items.4', to: { chapter: 'staying-safe', card: 7 } },
          { at: 'note', to: { page: 'funding' } },
        ],
        sources: [
          'dc-cpg-ch41-t1d-lifespan-2025',
          'bt1d-dka-and-ketones',
          'dc-cpg-ch18-mental-health-2023',
          'cra-dtc-life-sustaining-therapy',
          'cra-rc4064-2025',
          'esdc-rdsp-apply',
          'qc-insulin-pump-access-program',
          'sk-insulin-pump-program',
          'dc-cpg-ch29-ckd-2025',
          'dc-cpg-ch34-t1d-children',
        ],
      },
      {
        // 3 Your child at school. The printable care-plan card: the items,
        // then six blank lines the family fills in with the school. Pinned
        // open: item 7 is the severe-low emergency step (call 911, side, stay, nothing
        // by mouth), from Diabetes@School and the CPS statement. Ask: the
        // child's school (ruling C33; M14).
        image: `${IMG}/chapter-new.png`,
        group: 'seasonsOfLife',
        ask: 'school',
        urgentContent: true,
        figures: [{ kind: 'takeIn', fields: 6 }],
        sources: [
          'dc-kids-in-school',
          'cps-t1d-in-school-2015',
          'das-low-blood-sugar',
          'das-glucagon',
          'dc-cpg-ch41-t1d-lifespan-2025',
          'dc-comparisons-by-province',
        ],
      },
      {
        // 4 Later life. Rests on CPG Ch37; the note says it draws on that
        // guideline for health professionals and its key messages for older
        // people (ruling C23; M1). Item 3 adds Ch37's end-of-life line (C19). How targets are set first, then two columns, then the
        // Ontario line beneath. The FIT lines (4 mm needles, dexterity) are
        // HELD (R9).
        image: `${IMG}/chapter-type2.png`,
        group: 'seasonsOfLife',
        ask: 'team',
        figures: [
          {
            kind: 'columns',
            columns: [
              [2, 3, 4],
              [5, 6],
            ],
            lead: [1],
            neutral: [7],
          },
        ],
        // "Funding & Coverage" in the note opens that page.
        links: [{ at: 'note', to: { page: 'funding' } }],
        sources: [
          'dc-cpg-ch37-older-people',
          'dc-cpg-ch8-targets',
          'on-diabetes-equipment-and-supplies',
        ],
      },

      /* ---------- Care and community ---------- */
      {
        // 5 Caring for someone with diabetes. Carries the crisis strip, so it
        // is pinned open (M13). As on Every Day Living card 5, the strip
        // carries 911 as well as 9-8-8 (the 9-8-8 page says "If your safety is
        // at risk, call 9-1-1 right away"), and the card words the strip's
        // sentence itself (`figure.body`).
        image: `${IMG}/care-chat-main.png`,
        group: 'careAndCommunity',
        ask: 'peer',
        urgentContent: true,
        noteVisible: true,
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2, 3],
              [4, 5, 6],
            ],
          },
          {
            kind: 'crisis',
            numbers: [
              { tel: '911', kind: 'emergency', written: '911' },
              { tel: '988', sms: true },
            ],
          },
        ],
        // "the Rule of 15" in item 1 opens Staying Safe card 2.
        links: [{ at: 'items.1', to: { chapter: 'staying-safe', card: 2 } }],
        sources: [
          'dc-cpg-ch14-hypoglycemia-2023',
          'bt1d-mental-health-support',
          'dc-taking-care-of-mental-health',
          'dc-cpg-ch18-mental-health-2023',
          '988-suicide-crisis-helpline',
        ],
      },
      {
        // 6 First Nations, Inuit and Métis. Official program facts only, each
        // with its link: NIHB, through Indigenous Services Canada. With no
        // Indigenous health partner to review the card (owner answer B1,
        // 2026-10-06), it carries no interpretive or statistical content, so
        // the guideline's lines on care (Ch38) are gone. Who is eligible is
        // left to ISC's own page, linked from item 2, and the card says Liivv
        // can't decide it (B2, "We would not be able to decide eligibility").
        image: `${IMG}/chapter-journey.png`,
        group: 'careAndCommunity',
        ask: 'pharmacist',
        figures: [
          {
            kind: 'columns',
            columns: [
              [1, 2],
              [3, 4, 5],
            ],
          },
        ],
        // The tagged phrase in item 2 opens ISC's eligibility page
        // (`isc-nihb-eligibility`), the one in item 3 ISC's list of NIHB
        // updates (`isc-nihb-updates`), and "Funding & Coverage" in item 5
        // that page. The addresses are the register's, written out because
        // this file may not import a value; the export checks them.
        links: [
          {
            at: 'items.2',
            to: {
              source: 'isc-nihb-eligibility',
              href: 'https://www.sac-isc.gc.ca/eng/1574187596083/1576511384063',
              hrefFr: 'https://www.sac-isc.gc.ca/fra/1574187596083/1576511384063',
            },
          },
          {
            at: 'items.3',
            to: {
              source: 'isc-nihb-updates',
              href: 'https://www.sac-isc.gc.ca/eng/1578079214611/1578079236012',
              hrefFr: 'https://www.sac-isc.gc.ca/fra/1578079214611/1578079236012',
            },
          },
          { at: 'items.5', to: { page: 'funding' } },
        ],
        sources: ['isc-nihb-eligibility', 'isc-nihb-updates'],
      },
    ],
    /* Band "Who to bring in": four cards, no outward links. */
    programsBandLinks: [[], [], [], []],
    /*
     * Each band card names a chapter card in its last sentence; that title
     * links to it: pregnancy (1), school (3), later life (4), carers (5).
     */
    programsBandCards: [1, 3, 4, 5],
    bandSources: [
      'dc-cpg-ch36-pregnancy',
      'cps-t1d-in-school-2015',
      'dc-kids-in-school',
      'dc-cpg-ch37-older-people',
      'bt1d-mental-health-support',
    ],
    pharmacistImage: `${IMG}/care-chat-main.png`,
    pharmacistHref: CDE_PANEL_HREF,
    resourceLinks: [],
    /* Titles and links as the register has them (sources-meta.ts). */
    citations: [
      {
        label: 'Diabetes Canada — Diabetes and Pregnancy',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-36',
      },
      {
        label:
          'Diabetes Canada — Glycemic Management Across the Lifespan for People With Type 1 Diabetes',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-41',
      },
      {
        label: 'Diabetes Canada — Kids with Diabetes in School',
        href: 'https://www.diabetes.ca/living-with-diabetes/life-with-diabetes/kids-with-diabetes-in-school',
      },
      {
        label:
          'Canadian Paediatric Society — Managing type 1 diabetes in school (CPS position statement, 2015)',
        href: 'https://cps.ca/en/documents/position/type-1-diabetes-in-school',
      },
      {
        label: 'Diabetes@School — Glucagon: What it is and how to use it',
        href: 'https://diabetesatschool.ca/understanding/glucagon',
      },
      {
        label: 'Diabetes Canada — Diabetes in Older People',
        href: 'https://www.diabetes.ca/for-professionals/full-guidelines/chapter-37',
      },
      {
        label: 'Breakthrough T1D — Mental Health Support',
        labelFr: 'Percée DT1 — Soutien en santé mentale',
        href: BT1D_MENTAL_HEALTH_HREF,
        hrefFr: BT1D_MENTAL_HEALTH_HREF_FR,
      },
      {
        label:
          'Indigenous Services Canada — Who is eligible for the Non-Insured Health Benefits (NIHB) program for First Nations and Inuit',
        labelFr:
          'Services aux Autochtones Canada — Qui est admissible au Programme des services de santé non assurés (SSNA) pour les Premières Nations et les Inuit',
        href: 'https://www.sac-isc.gc.ca/eng/1574187596083/1576511384063',
        hrefFr: 'https://www.sac-isc.gc.ca/fra/1574187596083/1576511384063',
      },
      {
        label: 'Indigenous Services Canada — Non-Insured Health Benefits program updates',
        labelFr:
          'Services aux Autochtones Canada — Mises à jour du Programme des services de santé non assurés',
        href: 'https://www.sac-isc.gc.ca/eng/1578079214611/1578079236012',
        hrefFr: 'https://www.sac-isc.gc.ca/fra/1578079214611/1578079236012',
      },
      {
        label: '9-8-8: Suicide Crisis Helpline',
        labelFr: '9-8-8 : Ligne d’aide en cas de crise de suicide',
        href: 'https://988.ca/',
        hrefFr: 'https://988.ca/fr',
      },
    ],
  },
];
