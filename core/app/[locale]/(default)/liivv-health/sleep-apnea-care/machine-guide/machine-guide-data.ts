/*
 * =============================================================================
 * SLEEP APNEA CARE MACHINE GUIDE — CHART ROWS
 * =============================================================================
 * The two comparison tables (machine-guide.md B.2), checked 2026-10-13. Every
 * licence is Class II with MDALL licence status "I" (Issued/Active; the MDALL
 * API documentation: "I=Issued/Active, M=Merge, O=Discontinued at Renewal").
 *
 * Model names, numbers and the makers' own words are data, like citation
 * labels: they never go through the message tree, so a translation cannot
 * rename a device or change a figure. On /fr the cells show this same English
 * text, marked lang="en"; every word around them (headings, column names,
 * "None found…", "Not stated by the maker", the footnote) is in
 * SleepApneaCare.machineGuide.chart.
 *
 * Cell text is the B.2 cell, character for character (straight quotes as the
 * file prints them), with one exception: the review markers "(C19 open)" and
 * "(C19 for auto)" that close four prescriber cells are not reader copy. They
 * moved to that cell's `openRuling`, which is review only and never rendered.
 *
 * Every cell names the register entries it rests on (`sources`, its chips).
 * `maker: true` marks a maker's own words or specification: its chip reads
 * "Maker" (machineGuide.chart.makerLabel), and it is never a clinical claim.
 * `links` turn the named words of a cell into a link to that register entry's
 * page (a licence page, a recall notice); the words appear once in the cell.
 *
 * Nothing here is a product, a price, a buy link, a pressure or a setting.
 * Noise figures are each maker's own and are not a ranking (chart.footnote).
 *
 * Held out of tree (machine-guide.md E): the Z2 Auto row (E1: removed from both
 * its Health Canada licences in March 2026), the Transcend Micro 510 row (E2: no
 * licence found), the US DreamStation 2 overheating notice (E3), the maker's
 * "LVEF ≤ 45%" (E4), and Yuwell's size, weight, test standard and data detail
 * (E6: those cells are null, shown as "Not stated by the maker").
 *
 * Erasable TypeScript and statement-form `import type` only: the content-review
 * export loads this file directly under Node's type stripping.
 * =============================================================================
 */

import type { SourceId } from '../chapters/sources-meta';

export const GUIDE_CHECKED_ON = '2026-10-13';

export interface GuideCell {
  text: string;
  sources: SourceId[];
  /* A maker's own words or specification: chip reads machineGuide.chart.makerLabel ("Maker"). */
  maker?: true;
  /* Words of `text` (each appearing once) that link to the register entry's page. */
  links?: Array<{ text: string; source: SourceId }>;
  /* Review only, never rendered: the open question this cell waits on (OPEN-QUESTIONS / machine-guide.md D). */
  openRuling?: string;
}

export interface GuideRowA {
  /* Stable row key (React key, review pack). */
  id: string;
  /* First cell reads `model (maker)`, or `model (identifier)` where B.2 prints the device identifier. */
  model: string;
  maker: string | null;
  identifier?: string;
  /* null → machineGuide.chart.b.notStated (only if the maker's source can no longer be shown; spec 3.3). */
  type: GuideCell | null;
  prescriber: GuideCell;
  licence: GuideCell;
  /* null → machineGuide.chart.a.noRecall ("None found (a search, not proof)"). */
  recall: GuideCell | null;
}

export interface GuideRowB {
  id: string;
  model: string;
  /* null → machineGuide.chart.b.notStated ("Not stated by the maker"). */
  humidifier: GuideCell | null;
  tube: GuideCell | null;
  travel: GuideCell | null;
  size: GuideCell | null;
  noise: GuideCell | null;
  data: GuideCell | null;
  masks: GuideCell | null;
}

/*
 * Table A: type, prescriber and Health Canada. Prescriber cells rest on Alberta,
 * BC and the Lung Association ("needs a prescription": claims row cards.1.items.5
 * s1) and on BC alone for "only by a sleep specialist" (s2; C19 open). Licence
 * cells link the licence page; their chip is MDALL (sources.md 5b). A null recall
 * cell is an absence check, not proof (D2): Health Canada's site search misses
 * archived notices, so the footnote says so.
 */
export const CHART_A: readonly GuideRowA[] = [
  {
    /* B.2: AirSense 11 AutoSet (ResMed) */
    id: 'airsense11',
    model: 'AirSense 11 AutoSet',
    maker: 'ResMed',
    type: {
      text: '"auto-adjusting pressure device"',
      sources: ['resmed-airsense11-ug'],
      maker: true,
    },
    prescriber: {
      text: 'Needs a prescription. BC: auto machines only by a sleep specialist',
      sources: ['ab-cpap-buyers-2026', 'bc-pap-buyers-guide', 'cla-sleep-apnea'],
      openRuling: 'C19',
    },
    licence: {
      text: '106650 "AIRSENSE 11"; AIRSENSE 11 AUTOSET listed 2021-09-07',
      sources: ['hc-mdall'],
      links: [{ text: '106650', source: 'mdall-lic-106650' }],
    },
    recall: null,
  },
  {
    /* B.2: AirSense 10 AutoSet (ResMed) */
    id: 'airsense10',
    model: 'AirSense 10 AutoSet',
    maker: 'ResMed',
    type: {
      text: '"auto-adjusting pressure devices"',
      sources: ['resmed-airsense10-ug-eur'],
      maker: true,
      openRuling: 'D12',
    },
    prescriber: {
      text: 'As above',
      sources: ['ab-cpap-buyers-2026', 'bc-pap-buyers-guide', 'cla-sleep-apnea'],
      openRuling: 'C19',
    },
    licence: {
      text: '93717 "AIRSENSE 10 AUTOSET", since 2014-08-12',
      sources: ['hc-mdall'],
      links: [{ text: '93717', source: 'mdall-lic-93717' }],
    },
    recall: {
      text: 'RA-53273 (2015, Type III, archived): a ClimateLineAir error message, caused by software reading static electricity as a tubing fault. Names model numbers 37207 and 37208, both on licence 93717',
      sources: ['hc-recall-resmed-2015', 'mdall-lic-93717'],
      links: [{ text: 'RA-53273', source: 'hc-recall-resmed-2015' }],
    },
  },
  {
    /* B.2: AirCurve 11 VAuto (ResMed) */
    id: 'aircurve11VAuto',
    model: 'AirCurve 11 VAuto',
    maker: 'ResMed',
    type: {
      text: '"auto-adjusting bilevel machine"',
      sources: ['resmed-aircurve11-page'],
      maker: true,
    },
    prescriber: {
      text: 'BC: bilevel machines only by a sleep specialist',
      sources: ['bc-pap-buyers-guide'],
      openRuling: 'C19',
    },
    licence: {
      text: '110422 "AIRCURVE 11"; AIRCURVE 11 VAUTO (CAN) listed 2023-11-20',
      sources: ['hc-mdall'],
      links: [{ text: '110422', source: 'mdall-lic-110422' }],
    },
    recall: null,
  },
  {
    /* B.2: AirCurve 11 ASV (ResMed) */
    id: 'aircurve11Asv',
    model: 'AirCurve 11 ASV',
    maker: 'ResMed',
    type: {
      text: '"adaptive servo-ventilation bilevel PAP device"',
      sources: ['resmed-aircurve11-page'],
      maker: true,
      openRuling: 'C21',
    },
    prescriber: {
      text: 'BC: bilevel machines only by a sleep specialist (ASV is bilevel, per the maker). BC: suspected central sleep apnea needs a detailed overnight sleep-lab test',
      sources: ['bc-pap-buyers-guide', 'resmed-aircurve11-page'],
      openRuling: 'C19, C21',
    },
    licence: {
      text: '110422; AIRCURVE 11 ASV (CAN) listed 2023-11-20',
      sources: ['hc-mdall'],
      links: [{ text: '110422', source: 'mdall-lic-110422' }],
    },
    recall: {
      text: 'RA-53771 (2015, Type I, archived): serious safety concern in symptomatic, chronic heart failure with reduced left ventricular ejection fraction on ASV therapy; 33.5% increased risk of cardiovascular death. Names older ResMed ASV models; AirCurve 11 is not listed',
      sources: ['hc-recall-asv-2015'],
      links: [{ text: 'RA-53771', source: 'hc-recall-asv-2015' }],
      openRuling: 'C21',
    },
  },
  {
    /* B.2: AirMini (ResMed) */
    id: 'airmini',
    model: 'AirMini',
    maker: 'ResMed',
    type: {
      text: '"self-adjusting system"; travel',
      sources: ['resmed-airmini-ug'],
      maker: true,
    },
    prescriber: {
      text: 'Needs a prescription',
      sources: ['ab-cpap-buyers-2026', 'bc-pap-buyers-guide', 'cla-sleep-apnea'],
      openRuling: 'C19 (auto machine)',
    },
    licence: {
      text: '99052 "AIRMINI", since 2017-04-26',
      sources: ['hc-mdall'],
      links: [{ text: '99052', source: 'mdall-lic-99052' }],
    },
    recall: null,
  },
  {
    /* B.2: DreamStation 2 Auto CPAP Advanced (Philips Respironics) */
    id: 'dreamstation2',
    model: 'DreamStation 2 Auto CPAP Advanced',
    maker: 'Philips Respironics',
    type: {
      text: '"Modes: CPAP, Auto CPAP"',
      sources: ['philips-ds2-leaflet'],
      maker: true,
    },
    prescriber: {
      text: 'Needs a prescription',
      sources: ['ab-cpap-buyers-2026', 'bc-pap-buyers-guide', 'cla-sleep-apnea'],
      openRuling: 'C19 (auto machine)',
    },
    licence: {
      text: '105749, since 2021-01-20; identifier CAX521H12C',
      sources: ['hc-mdall'],
      links: [{ text: '105749', source: 'mdall-lic-105749' }],
    },
    recall: {
      text: 'None found naming DreamStation 2. RA-62729 (Philips foam) lists DreamStation models (CAX500…, CAX501…), not CAX521H12C',
      sources: ['hc-recall-philips-ra-76137', 'hc-recalls-safety-alerts'],
      links: [{ text: 'RA-62729', source: 'hc-recall-philips-ra-76137' }],
      openRuling: 'D2, D9, C46',
    },
  },
  {
    /* B.2: BreathCare III Auto YH-680B (Yuwell) */
    id: 'yuwellYh680b',
    model: 'BreathCare III Auto YH-680B',
    maker: 'Yuwell',
    type: {
      text: 'Mode "CPAP / Auto CPAP"',
      sources: ['yuwell-yh680-image'],
      maker: true,
      openRuling: 'D11',
    },
    prescriber: {
      text: 'Needs a prescription',
      sources: ['ab-cpap-buyers-2026', 'bc-pap-buyers-guide', 'cla-sleep-apnea'],
      openRuling: 'C19 (auto machine)',
    },
    licence: {
      text: '113188 (System) and 112836 (Device Family); holder Suzhou Yuyue Medical Technology Co., Ltd',
      sources: ['hc-mdall'],
      links: [
        { text: '113188', source: 'mdall-lic-113188' },
        { text: '112836', source: 'mdall-lic-112836' },
      ],
    },
    recall: null,
  },
  {
    /* B.2: Transcend Micro (506001) */
    id: 'transcendMicro',
    model: 'Transcend Micro',
    maker: null,
    identifier: '506001',
    type: {
      text: '"Continuous Positive Airway Pressure (CPAP) device"; travel',
      sources: ['transcend-micro-manual'],
      maker: true,
      openRuling: 'D1, D8',
    },
    prescriber: {
      text: 'Needs a prescription',
      sources: ['ab-cpap-buyers-2026', 'bc-pap-buyers-guide', 'cla-sleep-apnea'],
    },
    licence: {
      text: '102774 "TRANSCEND MICRO CPAP"; 506001 listed 2024-08-12; holder Somnetics International, Inc.',
      sources: ['hc-mdall'],
      links: [{ text: '102774', source: 'mdall-lic-102774' }],
      openRuling: 'D5',
    },
    recall: null,
  },
];

/*
 * Table B: maker facts. Every cell is the maker's own specification (labelled
 * Maker), from that product's own document. AirSense 10 figures come from the
 * European user guide (D12); the Transcend Micro manual is hosted on the maker's
 * own shop file server (D1); Yuwell's only maker source is a product image read
 * by eye (D11).
 */
export const CHART_B: readonly GuideRowB[] = [
  {
    id: 'airsense11',
    model: 'AirSense 11',
    humidifier: {
      text: 'Built-in (HumidAir 11 tub)',
      sources: ['resmed-airsense11-ug'],
      maker: true,
    },
    tube: {
      text: 'ClimateLineAir 11, or SlimLine (unheated)',
      sources: ['resmed-airsense11-ug'],
      maker: true,
    },
    travel: {
      text: 'Carry-on; Air11 DC/DC converter',
      sources: ['resmed-airsense11-ug'],
      maker: true,
    },
    size: {
      text: '94.5 x 259.4 x 138.5 mm (with tub); 1130 g with tub',
      sources: ['resmed-airsense11-ug'],
      maker: true,
    },
    noise: {
      text: '27 dBA ±2 (ISO 80601-2-70:2015, tub half filled)',
      sources: ['resmed-airsense11-ug'],
      maker: true,
    },
    data: {
      text: 'Cellular to care provider; Bluetooth to myAir; SD card "not available in all devices"',
      sources: ['resmed-airsense11-ug'],
      maker: true,
    },
    masks: {
      text: 'Vented masks recommended by ResMed or the prescribing doctor',
      sources: ['resmed-airsense11-ug'],
      maker: true,
    },
  },
  {
    id: 'airsense10',
    model: 'AirSense 10',
    humidifier: {
      text: 'HumidAir tub (side cover to use without it)',
      sources: ['resmed-airsense10-ug-eur'],
      maker: true,
      openRuling: 'D12',
    },
    tube: {
      text: 'ClimateLineAir (accessory)',
      sources: ['resmed-airsense10-ug-eur'],
      maker: true,
      openRuling: 'D12',
    },
    travel: {
      text: 'Carry-on; Air10 DC/DC converter; external battery (ResMed Power Station II)',
      sources: ['resmed-airsense10-ug-eur'],
      maker: true,
      openRuling: 'D12',
    },
    size: {
      text: '116 x 255 x 150 mm; 1248 g with cleanable humidifier',
      sources: ['resmed-airsense10-ug-eur'],
      maker: true,
      openRuling: 'D12',
    },
    noise: {
      text: '27 dBA ±2 (with humidification)',
      sources: ['resmed-airsense10-ug-eur'],
      maker: true,
      openRuling: 'D12',
    },
    data: {
      text: 'Wireless module (European edition: 4G, 3G, 2G) or SD card',
      sources: ['resmed-airsense10-ug-eur'],
      maker: true,
      openRuling: 'D12',
    },
    masks: {
      text: 'Vented masks',
      sources: ['resmed-airsense10-ug-eur'],
      maker: true,
      openRuling: 'D12',
    },
  },
  {
    id: 'aircurve11',
    model: 'AirCurve 11',
    humidifier: {
      text: 'Built-in (HumidAir 11 tub)',
      sources: ['resmed-aircurve11-ug'],
      maker: true,
    },
    tube: {
      text: 'ClimateLineAir 11 (in CAN TRI packs 39020 and 39023)',
      sources: ['resmed-aircurve11-product-guide'],
      maker: true,
    },
    travel: {
      text: 'Carry-on; Air11 DC/DC converter',
      sources: ['resmed-aircurve11-ug'],
      maker: true,
    },
    size: {
      text: '94.5 x 259.4 x 138.5 mm; 1229 g with tub',
      sources: ['resmed-aircurve11-ug'],
      maker: true,
    },
    noise: {
      text: '27 dBA ±2 (tub half-filled)',
      sources: ['resmed-aircurve11-ug'],
      maker: true,
    },
    data: {
      text: 'Cellular; Bluetooth to myAir; SD card "if provided"',
      sources: ['resmed-aircurve11-ug'],
      maker: true,
    },
    masks: {
      text: 'Vented masks',
      sources: ['resmed-aircurve11-ug'],
      maker: true,
    },
  },
  {
    id: 'airmini',
    model: 'AirMini',
    humidifier: {
      text: 'Waterless HumidX or HumidX Plus (N20 and P10 set-ups only)',
      sources: ['resmed-airmini-ug'],
      maker: true,
    },
    tube: {
      text: 'None stated',
      sources: ['resmed-airmini-ug'],
      maker: true,
    },
    travel: {
      text: 'Travel; DC/DC converter (on the Health Canada licence)',
      sources: ['resmed-airmini-ug', 'mdall-lic-99052'],
      maker: true,
    },
    size: {
      text: '136 x 84 x 52 mm; 300 g',
      sources: ['resmed-airmini-ug'],
      maker: true,
    },
    noise: {
      text: '29 dBA ±2 (ISO 80601-2-70:2015, CPAP mode)',
      sources: ['resmed-airmini-ug'],
      maker: true,
    },
    data: {
      text: 'Bluetooth to the AirMini app',
      sources: ['resmed-airmini-ug'],
      maker: true,
    },
    masks: {
      text: 'AirMini set-ups only (F20, N20, P10; F30 through the F20 pack)',
      sources: ['resmed-airmini-ug'],
      maker: true,
    },
  },
  {
    id: 'dreamstation2',
    model: 'DreamStation 2',
    humidifier: {
      text: 'Integrated humidifier',
      sources: ['philips-ds2-manual'],
      maker: true,
    },
    tube: {
      text: 'Optional heated tubing',
      sources: ['philips-ds2-manual'],
      maker: true,
    },
    travel: {
      text: 'Philips Respironics DC power cord and battery adapter cable only',
      sources: ['philips-ds2-manual'],
      maker: true,
    },
    size: {
      text: '273.81 x 158.5 x 84.83 mm; 1040 g (empty tank, no power supply)',
      sources: ['philips-ds2-manual'],
      maker: true,
    },
    noise: {
      text: '27 dB(A) ±2',
      sources: ['philips-ds2-manual'],
      maker: true,
    },
    data: {
      text: 'SD card; Bluetooth to DreamMapper ("not available in all markets"); cellular modem on some devices',
      sources: ['philips-ds2-manual'],
      maker: true,
    },
    masks: {
      text: 'Tubing 12, 15 or 22 mm (Philips Respironics)',
      sources: ['philips-ds2-manual'],
      maker: true,
    },
  },
  {
    id: 'yuwellYh680',
    model: 'Yuwell YH-680A/B',
    humidifier: {
      text: '"Integrated Humidifier"',
      sources: ['yuwell-yh680-image'],
      maker: true,
      openRuling: 'D11',
    },
    tube: {
      text: '"Auto Heated Tube"',
      sources: ['yuwell-yh680-image'],
      maker: true,
      openRuling: 'D11',
    },
    travel: null,
    size: null,
    noise: {
      text: '27 dBA ±2 (test standard not stated)',
      sources: ['yuwell-yh680-image'],
      maker: true,
      openRuling: 'D11',
    },
    data: {
      text: '"Cloud Data Management" (no detail)',
      sources: ['yuwell-yh680-image'],
      maker: true,
      openRuling: 'D11',
    },
    masks: null,
  },
  {
    id: 'transcendMicro',
    model: 'Transcend Micro',
    humidifier: {
      text: 'AirMist HME, sold separately',
      sources: ['transcend-micro-manual'],
      maker: true,
      openRuling: 'D1',
    },
    tube: {
      text: 'None listed',
      sources: ['transcend-micro-manual'],
      maker: true,
      openRuling: 'D1',
    },
    travel: {
      text: 'Optional PowerAway battery',
      sources: ['transcend-micro-manual'],
      maker: true,
      openRuling: 'D1',
    },
    size: {
      text: '9.1 x 9.1 x 6.1 cm; 219.5 g',
      sources: ['transcend-micro-manual'],
      maker: true,
      openRuling: 'D1',
    },
    noise: {
      text: '27 dBA ±2 "in a typical use environment", and 31 dBA ±2; both listed under ISO 80601-2-70:2020',
      sources: ['transcend-micro-manual'],
      maker: true,
      openRuling: 'D1',
    },
    data: {
      text: 'Bluetooth to MySleepDash; USB-C data port and desktop software',
      sources: ['transcend-micro-manual'],
      maker: true,
      openRuling: 'D1',
    },
    masks: {
      text: 'Masks with a standard 22 mm connection',
      sources: ['transcend-micro-manual'],
      maker: true,
      openRuling: 'D1',
    },
  },
];
