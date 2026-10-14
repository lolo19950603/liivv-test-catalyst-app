import { describe, expect, it } from 'vitest';

import { isRxMaskId, RX_MASK_IDS } from '../../../../../../lib/catalog/cpap-masks';
import { isPapDeviceId } from '../../../../../../lib/catalog/prescription-devices';

import {
  PAEDIATRIC_SHELF_CARDS,
  pathShelf,
  type ShelfFacts,
  shelfForCard,
  shelfRuleProblems,
  SHOP_SWITCH,
  SLEEP_PLACED_PRODUCT_IDS,
} from './chapter-shop';
import { CHAPTER_META } from './chapters-meta';

const facts: ShelfFacts = {
  isMachine: isPapDeviceId,
  isPaediatricMask: (id) => RX_MASK_IDS[id] === 'paediatric',
  isCompleteMask: isRxMaskId,
  isUrgentCard: (chapter, card) =>
    CHAPTER_META.find((meta) => meta.slug === chapter)?.categories[card - 1]?.urgentContent ===
    true,
};

const shelf = (ids: number[], notices?: Array<'rxMaskCheck' | 'rxMaskParts'>) => ({
  occasion: 'masksAndSupplies',
  offers: [{ productIds: ids }],
  ...(notices ? { notices } : {}),
});

describe('the Sleep shop rules', () => {
  it('pass on the record as it is', () => {
    expect(shelfRuleProblems(facts)).toEqual([]);
  });

  it('place nothing while the owner switch is off', () => {
    expect(SHOP_SWITCH.placements).toBe(false);
    expect(SLEEP_PLACED_PRODUCT_IDS).toEqual([]);
    expect(shelfForCard('starting-cpap', 3)).toBeUndefined();
    expect(pathShelf('cpap')).toBeUndefined();
  });

  it('never put a strip on a testing, red-flag or driving card, or a reading-only path', () => {
    const problems = shelfRuleProblems(facts, {
      placements: {
        'is-it-sleep-apnea': { 8: shelf([7999]) },
        'staying-safe': { 1: shelf([7999]) },
        'starting-cpap': { 8: shelf([7999]), 11: shelf([7999]) },
      },
      paths: { children: shelf([7999]), 'oral-appliance': shelf([7999]) },
    });

    expect(problems).toEqual([
      'shop: is-it-sleep-apnea card 8 may not carry a strip',
      'shop: staying-safe card 1 may not carry a strip',
      'shop: staying-safe card 1 is an urgent card',
      'shop: starting-cpap card 8 may not carry a strip',
      'shop: starting-cpap card 11 may not carry a strip',
      'shop: starting-cpap card 11 is an urgent card',
      'shop: path children may not carry a strip',
      'shop: path oral-appliance may not carry a strip',
    ]);
  });

  it('never place a machine or a bundle holding one', () => {
    expect(
      shelfRuleProblems(facts, { placements: { 'starting-cpap': { 6: shelf([4641, 4335]) } } }),
    ).toEqual([
      'shop: starting-cpap card 6 places machine 4641 (N1)',
      'shop: starting-cpap card 6 places machine 4335 (N1)',
    ]);
  });

  it('place a child’s mask only on a paediatric card, and there is none yet', () => {
    expect(PAEDIATRIC_SHELF_CARDS).toEqual({});
    expect(
      shelfRuleProblems(facts, {
        placements: { 'starting-cpap': { 3: shelf([4210], ['rxMaskCheck', 'rxMaskParts']) } },
      }),
    ).toEqual(["shop: starting-cpap card 3 places child's mask 4210 (C17)"]);
  });

  it('carry the prescription-check notices wherever a complete mask stands', () => {
    expect(shelfRuleProblems(facts, { paths: { cpap: shelf([4216]) } })).toEqual([
      'shop: path cpap holds a complete mask without the rxMaskCheck and rxMaskParts notices (C26)',
    ]);
    expect(
      shelfRuleProblems(facts, {
        paths: { cpap: shelf([4216, 4232], ['rxMaskCheck', 'rxMaskParts']) },
      }),
    ).toEqual([]);
  });
});
