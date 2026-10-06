/*
 * =============================================================================
 * YOUR TOOLS — WHAT WORKS WITH WHAT
 * =============================================================================
 * The device facts behind Your Tools' pickers and its restock calculator
 * (Chapter 03, cards 2, 4, 6 and 13), from the source check of 2026-10-05. One
 * file, so the three figures that read it cannot disagree: a sensor and a pump
 * are paired once, in PAIRINGS, and the sensor picker (card 4) and the "My
 * pump" picker (card 13) both read that list, one from each end. The
 * calculator's presets (card 6) read a sensor's wear time from SENSORS. A
 * sensor's notice marked `everywhere` (a recall) is shown by all three,
 * wherever the sensor is named, so it is stated here once too.
 *
 * Brand and model names are structural, like citation labels: they never go
 * through the message tree, so a translation cannot rename a device. Every
 * word around them is in DiabetesCare.chapters.your-tools.categories.<n>.figure.
 *
 * Every fact names the register entries it rests on (`sources`), and every
 * pairing says who confirms it (`basis`), which the pickers print under it.
 * Most of these pages are makers' own (industry), and policy 4 says an
 * industry page is never the only source for a claim; ruling R16 is open with
 * the owner and the nurse on what the pickers may show meanwhile. Until it is
 * ruled they show every fact with its basis and the date it was checked.
 * Option (b) would hold the `pumpMakerOnly` and `sensorMakerOnly` pairings and
 * every maker-only fact line; that is a hold to add, not a default to change.
 *
 * `listedBy` is review only: the Canadian programs that list a device. It is
 * never rendered, and never as coverage.
 *
 * No products, prices, shop links or cart actions: the products a card shows
 * are in ./chapter-shop.ts, never here.
 * Nothing here names a catalogue item, only a device's own model name.
 *
 * Erasable TypeScript and statement-form `import type` only: the content-review
 * export loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { SourceId } from './sources-meta';

/*
 * The day the facts below were last checked: each was read on its page on
 * 2026-10-05, and the t:slim X2 pairings were re-checked on Tandem's Canadian
 * user guide on 2026-10-06 (ruling C42).
 */
export const DEVICES_CHECKED_ON = '2026-10-06';

export type SensorId = 'dexcomG7' | 'dexcomG6' | 'libre3Plus' | 'libre2' | 'guardian4';

export type PumpId = 'minimed780G' | 'tslimX2' | 'ypsoPump' | 'omnipod5' | 'omnipodDash';

/*
 * Who confirms a pairing, labelled from `figure.basis.<key>`:
 *   twoMakers        both makers name it
 *   government       a Canadian government program lists them together
 *   pumpMakerOnly    only the pump maker names it
 *   sensorMakerOnly  only the sensor maker names it
 */
export type PairingBasis = 'twoMakers' | 'government' | 'pumpMakerOnly' | 'sensorMakerOnly';

/* A maker's own footnote on a pairing, labelled from `figure.caveats.<key>`. */
export type PairingCaveat = 'notAllInCanada';

/*
 * A notice under a sensor, labelled from card 4's `figure.notices.<key>`. One
 * marked `everywhere` is also labelled from cards 6 and 13's.
 */
export type SensorNotice = 'g6ToG7' | 'recall';

/* A fact about a pump's supplies, labelled from card 13's `figure.factLines.<key>`. */
export type PumpFact =
  | 'extendedSets'
  | 'usesDexcom'
  | 'controlIqAge'
  | 'warranty'
  | 'cartridge'
  | 'setNotEveryCartridge'
  | 'loopApp'
  | 'loopTraining'
  | 'podHours';

/* What no registered page confirms about a pump, from card 13's `figure.openQuestions.<key>`. */
export type PumpQuestion = 'reservoirs' | 'setNames' | 'cartridge' | 'pods';

export interface SensorEntry {
  id: SensorId;
  name: string;
  /* A sensor made for one pump only, labelled "For <pump>" (`figure.forPump`). */
  forPump?: PumpId;
  /*
   * How long it is worn, "up to" as the maker says. Null where no registered
   * page says (held, section E): the picker says it is not confirmed here.
   */
  wear: {
    upToDays: number;
    /* A grace period after the wear time. The restock calculator never counts it (R23). */
    graceHours?: number;
    fromAge?: number;
    sources: SourceId[];
  } | null;
  /*
   * `everywhere`: a safety notice (a recall) that the pump picker's sensor
   * lists and the calculator's presets show as well, wherever the sensor is
   * named. Any other notice shows in the sensor picker only.
   */
  notice?: { key: SensorNotice; sources: SourceId[]; everywhere?: true };
  listedBy?: SourceId[];
}

export interface PumpEntry {
  id: PumpId;
  name: string;
  /* How the sensor picker names it, where the pairing is with a wider system. */
  pairedName?: string;
  /*
   * The same on /fr: only the joining word is French. The device names in it
   * are never translated.
   */
  pairedNameFr?: string;
  /* The numbers a fact line prints, by its ICU argument name. */
  facts: Array<{
    key: PumpFact;
    values?: Partial<Record<'age' | 'years' | 'units' | 'minutes' | 'hours', number>>;
    sources: SourceId[];
  }>;
  openQuestions: PumpQuestion[];
  listedBy?: SourceId[];
}

export interface Pairing {
  sensor: SensorId;
  pump: PumpId;
  basis: PairingBasis;
  caveat?: PairingCaveat;
  sources: SourceId[];
}

/*
 * Sensors, in the order the picker offers them. Card 4 of the copy record
 * (G2), with the source check's corrections: G7 is "up to 10 days, with a
 * 12-hour grace period at the end", and nothing here says it cannot be
 * restarted (held); Libre 2, G6 and Guardian 4 wear times are held.
 */
export const SENSORS: readonly SensorEntry[] = [
  {
    id: 'dexcomG7',
    name: 'Dexcom G7',
    wear: { upToDays: 10, graceHours: 12, sources: ['dexcom-g7-wear-time'] },
    listedBy: ['isc-nihb-updates', 'bc-diabetes-pins'],
  },
  {
    id: 'dexcomG6',
    name: 'Dexcom G6',
    wear: null,
    notice: { key: 'g6ToG7', sources: ['dexcom-canada', 'ypsomed-mylife-loop'] },
    listedBy: ['isc-nihb-updates', 'bc-diabetes-pins'],
  },
  {
    id: 'libre3Plus',
    name: 'FreeStyle Libre 3 Plus',
    wear: { upToDays: 15, fromAge: 2, sources: ['abbott-freestyle-libre-3'] },
    // Re-check on publish day, and drop it if Abbott's notice is gone. A
    // recall, so the pump picker and the calculator show it too.
    notice: { key: 'recall', sources: ['abbott-freestyle-canada'], everywhere: true },
    listedBy: ['bc-diabetes-pins'],
  },
  {
    id: 'libre2',
    name: 'FreeStyle Libre 2',
    wear: null,
    listedBy: ['abbott-freestyle-canada', 'isc-nihb-updates', 'bc-diabetes-pins'],
  },
  {
    id: 'guardian4',
    name: 'Guardian 4',
    forPump: 'minimed780G',
    wear: null,
  },
];

/* Pumps, in the order the "My pump" picker offers them (card 13, G3). */
export const PUMPS: readonly PumpEntry[] = [
  {
    id: 'minimed780G',
    name: 'MiniMed 780G',
    // "Use exclusively with the Extended reservoir": a fit rule, not a product.
    facts: [{ key: 'extendedSets', sources: ['minimed-canada'] }],
    openQuestions: ['reservoirs', 'setNames'],
    listedBy: ['bc-diabetes-pins'],
  },
  {
    id: 'tslimX2',
    name: 'Tandem t:slim X2',
    // Tandem's page says only "Dexcom CGM sold separately"; its Canadian user
    // guide names the models (the G6 and G7 pairings below, ruling C42).
    facts: [
      { key: 'usesDexcom', sources: ['tandem-canada'] },
      { key: 'controlIqAge', values: { age: 2 }, sources: ['tandem-canada'] },
      { key: 'warranty', values: { years: 4 }, sources: ['tandem-support'] },
    ],
    openQuestions: ['cartridge', 'setNames'],
  },
  {
    id: 'ypsoPump',
    name: 'mylife YpsoPump',
    pairedName: 'mylife YpsoPump with CamAPS FX (mylife Loop)',
    pairedNameFr: 'mylife YpsoPump avec CamAPS FX (mylife Loop)',
    facts: [
      { key: 'cartridge', values: { units: 160 }, sources: ['ypsomed-mylife-loop'] },
      { key: 'setNotEveryCartridge', sources: ['ypsomed-mylife-loop'] },
      { key: 'loopApp', sources: ['ypsomed-mylife-loop'] },
      { key: 'loopTraining', values: { minutes: 60 }, sources: ['ypsomed-mylife-loop'] },
    ],
    openQuestions: ['setNames'],
    listedBy: ['bc-diabetes-pins'],
  },
  {
    id: 'omnipod5',
    name: 'Omnipod 5',
    facts: [{ key: 'podHours', values: { hours: 72 }, sources: ['omnipod-canada'] }],
    openQuestions: ['pods'],
    listedBy: ['bc-diabetes-pins'],
  },
  {
    id: 'omnipodDash',
    name: 'Omnipod DASH',
    facts: [{ key: 'podHours', values: { hours: 72 }, sources: ['omnipod-canada'] }],
    openQuestions: ['pods'],
    listedBy: ['bc-diabetes-pins'],
  },
];

/*
 * Which sensor works with which pump, each stated once. Ruling C42
 * (2026-10-06): Tandem's Canadian user guide for the t:slim X2 with
 * Control-IQ+ names both the Dexcom G6 and the G7, so G7 with the t:slim X2
 * rests on both makers (Dexcom keeps its "Not all connections are available in
 * Canada" footnote, which the owner may drop), and G6 with the t:slim X2 is a
 * pairing on the pump maker's word. Dexcom's G6-to-G7 notice stays. Guardian 4
 * with the 780G rests on the NIHB listing, since MiniMed's page no longer
 * names it.
 */
export const PAIRINGS: readonly Pairing[] = [
  {
    sensor: 'dexcomG7',
    pump: 'tslimX2',
    basis: 'twoMakers',
    caveat: 'notAllInCanada',
    sources: ['dexcom-pumps-and-pens', 'tandem-tslim-x2-ciq-user-guide-ca'],
  },
  {
    sensor: 'dexcomG6',
    pump: 'tslimX2',
    basis: 'pumpMakerOnly',
    sources: ['tandem-tslim-x2-ciq-user-guide-ca'],
  },
  {
    sensor: 'dexcomG7',
    pump: 'omnipod5',
    basis: 'twoMakers',
    sources: ['dexcom-pumps-and-pens', 'omnipod-canada'],
  },
  {
    sensor: 'dexcomG6',
    pump: 'omnipod5',
    basis: 'twoMakers',
    sources: ['dexcom-pumps-and-pens', 'omnipod-canada'],
  },
  {
    sensor: 'dexcomG6',
    pump: 'ypsoPump',
    basis: 'twoMakers',
    sources: ['dexcom-pumps-and-pens', 'ypsomed-mylife-loop'],
  },
  {
    sensor: 'libre3Plus',
    pump: 'ypsoPump',
    basis: 'pumpMakerOnly',
    sources: ['ypsomed-mylife-loop'],
  },
  {
    sensor: 'guardian4',
    pump: 'minimed780G',
    basis: 'government',
    sources: ['isc-nihb-updates'],
  },
];

/*
 * Pairs no Canadian source we checked confirms, shown on both pickers as "not
 * confirmed by the Canadian sources we checked" rather than as a pairing that
 * does not exist. Libre 3 Plus with Omnipod 5: the owner's ruling (no Canadian
 * source confirms it; Omnipod's Canadian page mixes in blocks from other
 * countries, and is not followed here; the owner adds that Omnipod 5 with Libre
 * is not yet in Canada, A3). G6 with the t:slim X2 left this list on
 * 2026-10-06, when Tandem's Canadian guide confirmed it (ruling C42).
 */
export const NOT_CONFIRMED: ReadonlyArray<{ sensor: SensorId; pump: PumpId }> = [
  { sensor: 'libre3Plus', pump: 'omnipod5' },
];

/*
 * The meter picker (card 2, G1), HELD as `meterData`: no registered page says
 * which strips go with which meter, so no family has its strip row, and the
 * two rows that have data rest on makers alone (R16). A null row reads "Not
 * confirmed here yet". Accu-Chek and FreeStyle meters have no registered page
 * and are left out (section E).
 */
export interface MeterFamily {
  id: string;
  meters: string[];
  strips: { products: string[]; sources: SourceId[] } | null;
  lancing: { inBox: string[]; sources: SourceId[] } | null;
  control: { product: string; fact: 'onlyThisOne'; sources: SourceId[] } | null;
}

export const METER_FAMILIES: readonly MeterFamily[] = [
  {
    id: 'contourNext',
    meters: ['Contour Next Gen', 'Contour Next One', 'Contour Next EZ'],
    strips: null,
    lancing: null,
    control: {
      product: 'Contour Next control solution',
      fact: 'onlyThisOne',
      sources: ['ascensia-support'],
    },
  },
  {
    id: 'oneTouchVerio',
    meters: ['OneTouch Verio Reflect'],
    strips: null,
    lancing: {
      inBox: ['OneTouch Delica Plus lancing device', 'OneTouch Delica lancets'],
      sources: ['lifescan-verio-reflect'],
    },
    control: null,
  },
];
