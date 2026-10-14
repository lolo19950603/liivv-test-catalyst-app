/*
 * =============================================================================
 * SLEEP APNEA CARE MACHINE GUIDE — STRUCTURE
 * =============================================================================
 * The guide the owner asked for in ruling N2 (2026-10-13): "A guide can be
 * provided on common machines or ones that were were planning to sell - maybe
 * with information or a chart to help compare." From the verified copy record
 * docs/sleep-content/machine-guide.md (version of 2026-10-13, every quote
 * re-checked by an independent checker the same day).
 *
 * Liivv sells no machines (N1, "Hide all 24"). This page never links a product,
 * a price, a cart or a retailer, and gives no pressure, ramp, comfort or other
 * setting. Its "not sold" line keeps N10's current wording ("…yet") until the
 * owner rules N10.
 *
 * Where it lives is open (machine-guide.md D13). Spec 8.3 builds it as its own
 * page, /liivv-health/sleep-apnea-care/machine-guide, linked from nowhere while
 * LANDING_GATES.machineGuideLinked is false. Words: SleepApneaCare.machineGuide.
 * Chart rows: ./machine-guide-data.ts.
 *
 * Cards render in the order of MACHINE_GUIDE.cards (1, ASV, 2, 3, 4, 5), not in
 * message-key order: JavaScript lists integer-like keys first, so
 * `machineGuide.cards` reads 1, 2, 3, 4, 5, asv once parsed.
 *
 * Every card names the register entries its sentences rest on (`sources`, from
 * the claims table, section C). A maker's own document (scope `industry`) backs
 * only that product's own words, never a clinical claim, and is never a card's
 * only source; its chip is labelled by the register's scope, so no per-card
 * label override is kept (A.2's `sourceLabels` dropped, spec 3.2).
 *
 * Nothing here is held in the message tree. Held out of tree (machine-guide.md
 * section E, never in messages or data): the Z2 Auto row (E1), the Transcend
 * Micro 510 row (E2), the US DreamStation 2 overheating line (E3), the maker's
 * ejection-fraction cut-off (E4), the heart-failure instruction (E5), and
 * Yuwell's size, weight, test standard and data detail (E6).
 *
 * No value imports and erasable TypeScript only: the content-review export loads
 * this file under Node's type stripping.
 * =============================================================================
 */

import type { SourceId } from '../chapters/sources-meta';

export type GuideCardKey = '1' | 'asv' | '2' | '3' | '4' | '5';

/* Card 4's two outward links; words at machineGuide.cards.4.links.<key>, shown under the card. */
export type GuideLinkKey = 'mdall' | 'recalls';

export interface GuideCardMeta {
  key: GuideCardKey;
  /* Chips for the card, every id from the claims table rows of its sentences. */
  sources: SourceId[];
  /* Never collapsed (the ASV card carries a Type I recall). */
  alwaysOpen?: true;
  links?: Array<{ key: GuideLinkKey; href: string; source: SourceId }>;
}

export const MACHINE_GUIDE: {
  cards: GuideCardMeta[];
  chart: {
    /* Chips under chart.footnote: licences (MDALL and what status "I" means) and the recall search. */
    sources: SourceId[];
    /* Chip for chart.a.adpNote, under table A. */
    adpNoteSources: SourceId[];
  };
  checkedOn: '2026-10-13';
} = {
  cards: [
    {
      /*
       * 1 Machine types, and who prescribes each. Items 1-3 and 6: BC guide (and
       * Alberta for 6); item 4: BC's "more sophisticated BiPAP devices" line, with
       * "ASV is one of these" framed on the maker's own type label (Maker); item
       * 5: Alberta, BC and the Lung Association (charity, never alone) for "needs a
       * prescription", BC alone for "only by a sleep specialist" (C19 open: the
       * same guide says a family doctor prescribes in most cases).
       */
      key: '1',
      sources: [
        'bc-pap-buyers-guide',
        'ab-cpap-buyers-2026',
        'cla-sleep-apnea',
        'resmed-aircurve11-page',
      ],
    },
    {
      /*
       * ASV. Always open. Item 1: maker's type label + BC's bilevel line (C19);
       * item 2: BC; item 3: Health Canada RA-53771 in its own terms (no cut-off,
       * no patient instruction: E4, E5; wording open with the nurse, C21);
       * item 4: Ontario ADP's "We do not cover" list.
       */
      key: 'asv',
      alwaysOpen: true,
      sources: [
        'hc-recall-asv-2015',
        'bc-pap-buyers-guide',
        'on-adp-respiratory',
        'resmed-aircurve11-page',
      ],
    },
    {
      /*
       * 2 Travel machines. Items 1-3: BC guide; item 4: the Canadian
       * Transportation Agency's on-board line, which doesn't name CPAP (our
       * framing, D7); item 5: the Lung Association's travel tip (charity); item 6:
       * the AirMini guide's own parts rule (Maker; "some" is ours).
       */
      key: '2',
      sources: ['bc-pap-buyers-guide', 'cta-mobility-aids', 'cla-sleep-apnea', 'resmed-airmini-ug'],
    },
    {
      /* 3 Data and apps. Items 1-3: BC guide. The note points at the chart (framing). */
      key: '3',
      sources: ['bc-pap-buyers-guide'],
    },
    {
      /*
       * 4 Recalls and safety. Item 1: BC guide, MDALL, Health Canada's buying page;
       * items 2-3: the Philips foam recall, chip labelled RA-62729 (register).
       * "Talk to your doctor before you stop" is scoped to that recall (C8 open)
       * and the card names Philips because the recall does (C46 open); the ozone
       * line stays Philips-scoped (C5, ruled "default"). The note is operational.
       */
      key: '4',
      sources: [
        'bc-pap-buyers-guide',
        'hc-mdall',
        'hc-buying-devices-online',
        'hc-recall-philips-ra-76137',
      ],
      links: [
        /* Mirrors MDALL_HREF in ../chapters/sources-meta.ts (the hc-mdall href). */
        { key: 'mdall', href: 'https://health-products.canada.ca/mdall-limh/', source: 'hc-mdall' },
        /* Mirrors HC_RECALLS_HREF in ../chapters/sources-meta.ts (the hc-recalls-safety-alerts href). */
        {
          key: 'recalls',
          href: 'https://recalls-rappels.canada.ca/en',
          source: 'hc-recalls-safety-alerts',
        },
      ],
    },
    {
      /*
       * 5 Questions to ask before you buy. Written for any supplier, online or not
       * (C7). Items 1-3: Health Canada's buying page (+ Alberta for the warranty
       * and CSA line); item 4: Alberta's online-provider question, asked of any
       * seller; item 5 is a question (framing); item 6: BC; item 7: Alberta;
       * note: BC.
       */
      key: '5',
      sources: ['hc-buying-devices-online', 'bc-pap-buyers-guide', 'ab-cpap-buyers-2026'],
    },
  ],
  chart: {
    sources: ['hc-mdall', 'hc-mdall-api-doc', 'hc-recalls-safety-alerts'],
    adpNoteSources: ['on-adp-respiratory'],
  },
  /* The day every licence and recall search was checked. Re-check before the page publishes. */
  checkedOn: '2026-10-13',
};
