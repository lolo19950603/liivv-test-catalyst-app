/*
 * =============================================================================
 * SLEEP APNEA CARE PATH PAGES — STRUCTURE
 * =============================================================================
 * The six path pages at /liivv-health/sleep-apnea-care/chapters/<path>: one
 * reading list per kind of reader, generated from the chapters (the engine's
 * renderer is ../../_microsite/paths). Prose lives in messages/*.json under
 * `SleepApneaCare.paths.<slug>`, with the shared labels under `ui.path`; this
 * file holds only what is not language-dependent: which card each entry
 * opens, its stage, and the register entries behind every fact.
 *
 * From the verified copy record docs/sleep-content/paths.md (version of
 * 2026-10-13, independently source-checked the same day, with the owner and
 * nurse rulings of 2026-10-13 applied: C1, C2, C3, C6, C17, C26, N7).
 * Entries are index-matched to `list.reasons.<n>`; `introSources` to
 * `intro.body.<n>`. A reason that states a fact (marked † in paths.md B.2)
 * names its sources; a navigation reason names none. Every source is
 * Canadian: no reason needs the "International guidance" label.
 *
 * What a path never has: a machine (Liivv sells none, ruling N1), a
 * paediatric mask (only ever on a paediatric card, C17), a kit, a pressure or
 * a setting, or a red-flag line of its own (the one block is
 * staying-safe#red-flags, which every path signposts through the shared
 * safety strip, never gated). oral-appliance, children and not-diagnosed-yet
 * have no shop at all; the others' strips are PATH_SHELVES in
 * ./chapter-shop.ts, empty while placements are off.
 *
 * Card numbers are from the chapter drafts of 2026-10-13 (Ch01 11 cards,
 * Ch02 11, Ch03 10, Ch04 11, Ch05 10, Ch06 10). Recheck all six paths whenever
 * a chapter adds, removes or reorders a card; the content-review export fails
 * on a card that doesn't exist.
 *
 * No value imports and erasable TypeScript only: the content-review export
 * loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { PathMeta } from '../../_microsite/paths/types';

import type { ChapterSlug } from './chapters-meta';
import type { SourceId } from './sources-meta';

export type PathSlug =
  | 'cpap'
  | 'bilevel'
  | 'travel-cpap'
  | 'oral-appliance'
  | 'children'
  | 'not-diagnosed-yet';

/*
 * =============================================================================
 * WHAT HAS TO BE TRUE BEFORE A LINE GOES LIVE
 * =============================================================================
 * The support band (engine slot `pharmacist`; on this site it would be
 * Liivv's sleep support team) waits on Part C: the service live and the RRT
 * licence map by province confirmed (paths.md E; rrt-service.md). Its words
 * are not in the message files at all (held out of tree), so heldPathPaths()
 * has nothing to strip. `pharmacist: true` below means only that the band
 * belongs on that path once the service exists.
 * =============================================================================
 */
export const PATH_GATES = {
  sleepSupportBand: false,
};

/* No Sleep image set or palette yet (landing D12): placeholders that exist today. */
const IMG = '/archive/liivv-home/corner-sleep.png';
const ACCENT = '#b9aecf';

export const PATH_META: Array<PathMeta<PathSlug, ChapterSlug, SourceId>> = [
  {
    slug: 'cpap',
    heroImage: IMG,
    accent: ACCENT,
    introSources: [
      /* Most effective (BC guideline); most common PAP, how it works, CPAP vs APAP (BC buyer's guide);
       * prescription, prescriber sets the settings (MyHealth Alberta). */
      ['bcg-osa-adults', 'bc-pap-buyers-guide', 'ab-cpap-buyers-2026'],
      /* Treatment not cure, up to 6 weeks, mask fit (Lung Association); follow-up then yearly (BC
       * guideline, applied nationally: P11 / C12). */
      ['cla-sleep-apnea', 'bcg-osa-adults'],
    ],
    /* Eligible medical expense (CRA); ADP 75% of its price, registered business, no replacement
     * masks or headgear, buy-first rule, "some programs" (ADP). */
    fundingSources: ['fed-cra-medical', 'on-adp-respiratory'],
    pharmacist: true, // Liivv sleep support band; held (PATH_GATES, Part C)
    entries: [
      { chapter: 'treatment-options', card: 1, stage: 'start' },
      { chapter: 'treatment-options', card: 5, stage: 'start' },
      { chapter: 'is-it-sleep-apnea', card: 10, stage: 'start' },
      { chapter: 'staying-safe', card: 1, stage: 'safe', sources: ['cts-css-driving-2014'] },
      { chapter: 'staying-safe', card: 3, stage: 'safe' },
      { chapter: 'staying-safe', card: 4, stage: 'safe' },
      { chapter: 'starting-cpap', card: 1, stage: 'tools', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'starting-cpap', card: 2, stage: 'tools', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'starting-cpap', card: 3, stage: 'tools' },
      { chapter: 'starting-cpap', card: 4, stage: 'tools', sources: ['cla-sleep-apnea'] },
      { chapter: 'starting-cpap', card: 5, stage: 'tools' },
      { chapter: 'starting-cpap', card: 6, stage: 'tools' },
      { chapter: 'starting-cpap', card: 7, stage: 'tools', sources: ['cla-sleep-apnea'] },
      { chapter: 'starting-cpap', card: 8, stage: 'tools' },
      { chapter: 'starting-cpap', card: 9, stage: 'tools', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'starting-cpap', card: 10, stage: 'tools' },
      /* Back to `safe` on purpose: the device-safety cards (magnets, recalls, cleaning) sit straight
       * after the setup cards, where a new user meets them. */
      { chapter: 'staying-safe', card: 6, stage: 'safe' },
      { chapter: 'staying-safe', card: 5, stage: 'safe' },
      { chapter: 'staying-safe', card: 7, stage: 'safe' },
      { chapter: 'everyday-liivving', card: 1, stage: 'everyday' },
      {
        chapter: 'everyday-liivving',
        card: 3,
        stage: 'everyday',
        sources: ['bc-pap-buyers-guide'],
      },
      { chapter: 'everyday-liivving', card: 4, stage: 'everyday' },
      { chapter: 'everyday-liivving', card: 7, stage: 'everyday', sources: ['catsa-cpap'] },
      { chapter: 'this-might-be-you', card: 7, stage: 'season' },
      { chapter: 'this-might-be-you', card: 10, stage: 'season' },
    ],
  },
  {
    slug: 'bilevel',
    heroImage: IMG,
    accent: ACCENT,
    introSources: [
      /* Higher in, lower out; more complex, a sleep specialist prescribes (BC buyer's guide); other
       * breathing problems when O2 and CO2 don't improve with CPAP (Lung Association). The comfort
       * reason is left out while 03 R3 / C18 is open (P3). */
      ['bc-pap-buyers-guide', 'cla-sleep-apnea'],
      /* Central sleep apnea: specialist assessment; standard machines alone can make it worse; only
       * trained professionals change settings (BC buyer's guide). */
      ['bc-pap-buyers-guide'],
    ],
    /* Differs by province (NB, ADP); NB up to $3,150 with masks and supplies, no other coverage
     * (NB Social Development); talk to your team about paying (MyHealth Alberta). */
    fundingSources: ['nb-sd-respiratory', 'on-adp-respiratory', 'ab-cpap-buyers-2026'],
    pharmacist: true,
    entries: [
      { chapter: 'treatment-options', card: 2, stage: 'start' },
      { chapter: 'treatment-options', card: 3, stage: 'start', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'treatment-options', card: 1, stage: 'start' },
      { chapter: 'treatment-options', card: 5, stage: 'start', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'staying-safe', card: 1, stage: 'safe' },
      { chapter: 'staying-safe', card: 3, stage: 'safe' },
      /* Ch04 cards were written for adult CPAP; list.intro says so (P9 / C74). */
      { chapter: 'starting-cpap', card: 1, stage: 'tools' },
      { chapter: 'starting-cpap', card: 2, stage: 'tools', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'starting-cpap', card: 3, stage: 'tools' },
      { chapter: 'starting-cpap', card: 4, stage: 'tools' },
      { chapter: 'starting-cpap', card: 5, stage: 'tools' },
      { chapter: 'starting-cpap', card: 7, stage: 'tools' },
      { chapter: 'starting-cpap', card: 9, stage: 'tools', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'starting-cpap', card: 10, stage: 'tools' },
      { chapter: 'staying-safe', card: 6, stage: 'safe' },
      { chapter: 'staying-safe', card: 5, stage: 'safe' },
      { chapter: 'staying-safe', card: 7, stage: 'safe' },
      { chapter: 'everyday-liivving', card: 1, stage: 'everyday' },
      { chapter: 'everyday-liivving', card: 3, stage: 'everyday' },
      { chapter: 'this-might-be-you', card: 10, stage: 'season', sources: ['nb-sd-respiratory'] },
    ],
  },
  {
    slug: 'travel-cpap',
    heroImage: IMG,
    accent: ACCENT,
    introSources: [
      /* No holiday from sleep apnea; take it (Lung Association); travel machine pros and cons (BC
       * buyer's guide); still needs a prescription, set for you (MyHealth Alberta). */
      ['cla-sleep-apnea', 'bc-pap-buyers-guide', 'ab-cpap-buyers-2026'],
      /* Carry-on and distilled water (CATSA); no note needed, one can help (CATSA and the Lung
       * Association side by side: P6 / C54); altitude (BC buyer's guide: P6, C61). */
      ['catsa-cpap', 'cla-sleep-apnea', 'bc-pap-buyers-guide'],
    ],
    /* Insurer and a second machine (BC buyer's guide, applied to a travel machine: P6 / C73);
     * eligible medical expense (CRA). */
    fundingSources: ['bc-pap-buyers-guide', 'fed-cra-medical'],
    pharmacist: true,
    entries: [
      { chapter: 'treatment-options', card: 4, stage: 'start' },
      { chapter: 'treatment-options', card: 5, stage: 'start' },
      { chapter: 'staying-safe', card: 8, stage: 'safe', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'everyday-liivving', card: 7, stage: 'everyday', sources: ['catsa-cpap'] },
      { chapter: 'everyday-liivving', card: 8, stage: 'everyday', sources: ['cla-sleep-apnea'] },
      { chapter: 'everyday-liivving', card: 1, stage: 'everyday' },
      { chapter: 'everyday-liivving', card: 3, stage: 'everyday' },
      { chapter: 'starting-cpap', card: 2, stage: 'tools', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'starting-cpap', card: 5, stage: 'tools', sources: ['bc-pap-buyers-guide'] },
      { chapter: 'starting-cpap', card: 9, stage: 'tools' },
      { chapter: 'staying-safe', card: 7, stage: 'safe' },
      { chapter: 'staying-safe', card: 1, stage: 'safe' },
      { chapter: 'this-might-be-you', card: 10, stage: 'season', sources: ['bc-pap-buyers-guide'] },
    ],
  },
  {
    slug: 'oral-appliance',
    heroImage: IMG,
    accent: ACCENT,
    introSources: [
      /* How it works; custom device as effective as CPAP for some (BC Appendix G); mild to moderate,
       * or can't use / don't want CPAP (BC guideline). */
      ['bcg-osa-oral-devices-2021', 'bcg-osa-adults'],
      /* Medical assessment first, dentist works with the doctor (CDA, Lung Association); boil-and-bite
       * not recommended (BC Appendix G); follow-up sleep test (Lung Association). */
      ['cda-oat', 'bcg-osa-oral-devices-2021', 'cla-sleep-apnea'],
    ],
    /* ADP doesn't cover dental or oral appliances for OSA. */
    fundingSources: ['on-adp-respiratory'],
    pharmacist: false, // the support team would help with PAP equipment only
    entries: [
      { chapter: 'treatment-options', card: 6, stage: 'start' },
      { chapter: 'is-it-sleep-apnea', card: 9, stage: 'start', sources: ['bcg-osa-adults'] },
      { chapter: 'is-it-sleep-apnea', card: 10, stage: 'start' },
      { chapter: 'treatment-options', card: 8, stage: 'types' },
      {
        chapter: 'treatment-options',
        card: 9,
        stage: 'types',
        sources: ['bcg-osa-oral-devices-2021'],
      },
      { chapter: 'treatment-options', card: 7, stage: 'types' },
      /* Medical assessment first (CDA); a dentist with experience (Lung Association). */
      {
        chapter: 'treatment-options',
        card: 10,
        stage: 'types',
        sources: ['cda-oat', 'cla-sleep-apnea'],
      },
      /* Both driving cards: oral appliance users may need proof of treatment (P10 / C75). */
      { chapter: 'staying-safe', card: 1, stage: 'safe' },
      { chapter: 'staying-safe', card: 3, stage: 'safe', sources: ['cts-css-driving-2014'] },
      { chapter: 'this-might-be-you', card: 10, stage: 'season', sources: ['on-adp-respiratory'] },
    ],
  },
  {
    slug: 'children',
    heroImage: IMG,
    accent: ACCENT,
    /* Child-specific sources only (AboutKidsHealth, the CTS/CSS 2026 paediatric guideline). */
    introSources: [
      /* What it is in a child; night and day signs; some snore without OSA. */
      ['akh-osa'],
      /* Diagnosed by a sleep study (AKH); lab the standard, home test second-line over 5, oximetry
       * not alone (CTS/CSS 2026); tonsils and adenoids, the four treatments (AKH; P4 / C15). */
      ['akh-osa', 'cts-css-peds-dx-2026'],
    ],
    /* Government assistance or private insurance may cover some of a child's CPAP. */
    fundingSources: ['akh-pap'],
    pharmacist: false, // children's set-ups go to a paediatric team (rrt-service.md)
    entries: [
      { chapter: 'this-might-be-you', card: 1, stage: 'start' },
      { chapter: 'this-might-be-you', card: 2, stage: 'start', sources: ['cts-css-peds-dx-2026'] },
      /*
       * HELD with Ch06 card 3 (ruling C6 "default", 2026-10-13: Chapter 06 launches without it).
       * The entry stays in the list, so every reason pairs with its entry by number
       * (`list.reasons.<n>` is entry n, as paths.md B numbers them). While the card carries
       * `held: 'childTreatmentRuling'`, the engine's path composer leaves the entry out
       * (../../_microsite/paths/compose.ts), and its reason, `paths.children.list.reasons.3`,
       * is held in tree under the same hold (HELD_CARD_PATHS), so neither reaches the browser.
       * Deleting the card's `held` line brings both back; nothing is renumbered.
       */
      { chapter: 'this-might-be-you', card: 3, stage: 'start', sources: ['akh-osa'] },
      { chapter: 'is-it-sleep-apnea', card: 1, stage: 'start' },
      { chapter: 'is-it-sleep-apnea', card: 6, stage: 'start', sources: ['akh-osa'] },
      { chapter: 'is-it-sleep-apnea', card: 8, stage: 'start', sources: ['cts-css-peds-dx-2026'] },
      { chapter: 'staying-safe', card: 11, stage: 'safe' },
      { chapter: 'staying-safe', card: 6, stage: 'safe' },
      /* A child on CPAP (P9): Ch06 card 4 replaces the adult mask-type and first-nights cards. */
      { chapter: 'this-might-be-you', card: 4, stage: 'tools', sources: ['akh-pap'] },
      /* Kept for its child fit note, which rests on akh-pap (P9 / C74). */
      { chapter: 'starting-cpap', card: 4, stage: 'tools', sources: ['akh-pap'] },
      { chapter: 'everyday-liivving', card: 5, stage: 'tools' },
      { chapter: 'this-might-be-you', card: 8, stage: 'season' },
      { chapter: 'this-might-be-you', card: 10, stage: 'season', sources: ['akh-pap'] },
    ],
  },
  {
    slug: 'not-diagnosed-yet',
    heroImage: IMG,
    accent: ACCENT,
    introSources: [
      /* Underdiagnosed, 86% to 95% (BC guideline); partner notices first (Lung Health Foundation);
       * loud snoring, pauses (BC guideline); daytime sleepiness most common (BC guideline, Lung
       * Association). */
      ['bcg-osa-adults', 'lhf-sleep-apnea', 'cla-sleep-apnea'],
      /* Only a sleep study (Lung Association; P14 / C45); home tests not for people without symptoms
       * (BC guideline); family doctor or nurse practitioner (Lung Association, BC buyer's guide, Lung
       * Health Foundation; P12 / C42); crash risk (CTS/CSS 2014). */
      [
        'cla-sleep-apnea',
        'bcg-osa-adults',
        'bc-pap-buyers-guide',
        'lhf-sleep-apnea',
        'cts-css-driving-2014',
      ],
    ],
    /* ADP starts with a doctor at a registered sleep clinic; NIHB doesn't pay for sleep tests. */
    fundingSources: ['on-adp-respiratory', 'nihb-pap'],
    pharmacist: false,
    entries: [
      { chapter: 'is-it-sleep-apnea', card: 1, stage: 'start' },
      { chapter: 'is-it-sleep-apnea', card: 2, stage: 'start', sources: ['lhf-sleep-apnea'] },
      { chapter: 'is-it-sleep-apnea', card: 4, stage: 'start' },
      /* Archived StatCan fact sheet, survey years in the copy (C23). */
      { chapter: 'is-it-sleep-apnea', card: 3, stage: 'start', sources: ['statcan-osa-2018'] },
      { chapter: 'is-it-sleep-apnea', card: 5, stage: 'start' },
      { chapter: 'is-it-sleep-apnea', card: 6, stage: 'start' },
      { chapter: 'staying-safe', card: 1, stage: 'safe', sources: ['cts-css-driving-2014'] },
      { chapter: 'staying-safe', card: 2, stage: 'safe', sources: ['cts-css-driving-2014'] },
      { chapter: 'is-it-sleep-apnea', card: 7, stage: 'types' },
      { chapter: 'is-it-sleep-apnea', card: 8, stage: 'types', sources: ['bcg-osa-adults'] },
      { chapter: 'is-it-sleep-apnea', card: 9, stage: 'types' },
      { chapter: 'is-it-sleep-apnea', card: 10, stage: 'types' },
      { chapter: 'is-it-sleep-apnea', card: 11, stage: 'types' },
      { chapter: 'treatment-options', card: 8, stage: 'types' },
    ],
  },
];

/* The chapter whose governance disclaimer a path page carries. */
export const PATH_DISCLAIMER_CHAPTER: ChapterSlug = 'is-it-sleep-apnea';

/* The support band's image, for when Part C opens (placeholder that exists today). */
export const PATH_PHARMACIST_IMAGE = '/archive/liivv-home/care-chat.png';

/*
 * The path copy kept out of the browser today, by path from the root of the
 * message tree. None: the support band's words are out of tree (never in the
 * message files) until Part C, and the children path's held reason travels
 * with Ch06 card 3 in HELD_CARD_PATHS (./held-messages.ts).
 */
export function heldPathPaths(): string[] {
  return [];
}
