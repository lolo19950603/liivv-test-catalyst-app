import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from 'vitest';

import {
  CPAP_PART_IDS,
  isRxMaskId,
  matchesRxMaskNameRule,
  NOT_RX_MASK_IDS,
  RX_MASK_IDS,
  rxMaskKindOf,
  rxMasksOfLines,
} from './cpap-masks';
import { PAP_DEVICE_IDS } from './prescription-devices';

/* Catalogue facts as read on 2026-10-13 (scratchpad rulings/c26-table.md). */
const VISIBLE_COMPLETE_MASKS = [
  4210, 4216, 4229, 4233, 4241, 4248, 4281, 4291, 4294, 4306, 4319, 4320, 4343, 4352, 4373, 4374,
  4386, 4393, 4408, 4410, 4419, 4443, 4444, 4449, 4462, 4472, 4475, 4483, 4489, 4493, 4495, 4515,
  4522, 4533, 4543, 4545, 4546, 4550, 4570, 4580, 4585, 4603, 4620, 4622, 4624, 4648, 4659, 4679,
  4681, 4682, 4713, 4749, 4763, 4771, 4782, 4789, 4822, 4830, 4833, 4884, 4895, 4929, 4932, 4944,
  4952, 4955, 4960, 4969, 4970, 4985, 4997, 5024, 5027, 5055, 5056,
];
const HIDDEN_DISCONTINUED_MASKS = [4377, 4389, 4447, 4478, 4584, 4807, 4810, 4950, 5023];

let warn: MockInstance<typeof console.warn>;

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
});

afterEach(() => {
  warn.mockRestore();
});

describe('the complete-mask register', () => {
  it('holds the 75 visible complete masks and the 9 hidden discontinued ones, and nothing else', () => {
    expect(VISIBLE_COMPLETE_MASKS).toHaveLength(75);
    expect(HIDDEN_DISCONTINUED_MASKS).toHaveLength(9);
    expect(
      Object.keys(RX_MASK_IDS)
        .map(Number)
        .sort((a, b) => a - b),
    ).toEqual([...VISIBLE_COMPLETE_MASKS, ...HIDDEN_DISCONTINUED_MASKS].sort((a, b) => a - b));
  });

  it('marks exactly 4210, 4543 and 4713 as paediatric', () => {
    const paediatric = Object.entries(RX_MASK_IDS)
      .filter(([, kind]) => kind === 'paediatric')
      .map(([id]) => Number(id));

    expect(paediatric).toEqual([4210, 4543, 4713]);
    expect(rxMaskKindOf({ entityId: 4543 })).toBe('paediatric');
    expect(rxMaskKindOf({ entityId: 4585 })).toBe('adult');
  });

  it('keeps the reviewed lists apart from the register and from the machines', () => {
    expect(CPAP_PART_IDS).toEqual([4232]);
    expect(NOT_RX_MASK_IDS).toEqual([4416, 7999, 4265]);
    [...CPAP_PART_IDS, ...NOT_RX_MASK_IDS].forEach((id) => expect(isRxMaskId(id)).toBe(false));
    Object.keys(PAP_DEVICE_IDS).forEach((id) => expect(isRxMaskId(Number(id))).toBe(false));
  });
});

describe('the fail-closed rule', () => {
  it('keeps the part one-click, even on a mask shelf', () => {
    expect(
      rxMaskKindOf({
        entityId: 4232,
        name: 'Nasal Pillow for RespCare Aloha Nasal Pillow CPAP Mask - Large',
        categoryIds: [1128],
      }),
    ).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });

  it('lets the reviewed non-masks through', () => {
    expect(
      rxMaskKindOf({
        entityId: 4416,
        name: 'ZephAir CPAP Hose Connector for ResMed AirMini',
        categoryIds: [1087],
      }),
    ).toBeNull();
    expect(
      rxMaskKindOf({
        entityId: 7999,
        name: 'MedPro Defense Cleansing Wipes for CPAP & Nebulizer Masks',
        categoryIds: [1087],
      }),
    ).toBeNull();
    expect(
      rxMaskKindOf({
        entityId: 4265,
        name: 'CPAP Compliance Report – ResMed AirSense 10 & ResMed AirSense 11',
        categoryIds: [1068],
      }),
    ).toBeNull();
  });

  it('finds 4895 by the register although it is filed under 1142 Mask Parts', () => {
    expect(
      rxMaskKindOf({
        entityId: 4895,
        name: 'Respironics FitLife Total Face CPAP Mask - Complete System',
        categoryIds: [1142],
      }),
    ).toBe('adult');
    expect(warn).not.toHaveBeenCalled();
  });

  it('never makes a product a part because it is on 1142 alone', () => {
    expect(
      rxMaskKindOf({
        entityId: 7001,
        name: 'Some New Full Face Mask - Fit Pack',
        categoryIds: [1142],
      }),
    ).toBe('adult');
    expect(
      rxMaskKindOf({ entityId: 7002, name: 'Cushion, medium', categoryIds: [1142] }),
    ).toBeNull();
  });

  it('treats the value packs with spare parts as complete masks', () => {
    [4281, 4319, 4545, 4944].forEach((id) => expect(rxMaskKindOf({ entityId: id })).toBe('adult'));
  });

  it('treats any other product on 1120, 1128 or 1136 as a complete mask, and logs it once', () => {
    const unregistered = { entityId: 7100, name: 'New Mask Cushion', categoryIds: [1120] };

    expect(rxMaskKindOf(unregistered)).toBe('adult');
    expect(rxMaskKindOf(unregistered)).toBe('adult');
    expect(warn).toHaveBeenCalledTimes(1);
    expect(rxMaskKindOf({ entityId: 7101, name: 'Kids Nasal Mask', categoryIds: [1136] })).toBe(
      'paediatric',
    );
    expect(rxMaskKindOf({ entityId: 7102, name: 'Anything', categoryIds: [1128] })).toBe('adult');
  });

  it('finds a complete mask by its name off the mask shelves, and logs it', () => {
    [
      'Brand X Full Face CPAP Mask - Complete System',
      'Brand X Nasal Mask FitPack',
      'Brand X Nasal Pillow Mask - Fit pack',
      'Brand X Mask Starter Pack',
      'Brand X Mask - Starter Kit',
      'Brand X All-In-One Mask',
      'Brand X Nasal CPAP Mask System',
    ].forEach((name, index) => {
      expect(matchesRxMaskNameRule(name)).toBe(true);
      expect(rxMaskKindOf({ entityId: 7200 + index, name, categoryIds: [1031] })).toBe('adult');
    });
    expect(warn).toHaveBeenCalledTimes(7);
  });

  it('lets parts and other names through', () => {
    [
      'AirFit F20 Cushion',
      'Replacement Headgear for AirFit N20',
      'Replacement nasal pillow, small',
      'CPAP tubing, 6 ft',
      'Fit Pack of filters',
      'Mask wipes',
    ].forEach((name, index) => {
      expect(matchesRxMaskNameRule(name)).toBe(false);
      expect(rxMaskKindOf({ entityId: 7300 + index, name, categoryIds: [1087] })).toBeNull();
    });
  });

  it('keeps machines and machine-and-mask bundles as devices, never masks', () => {
    expect(
      rxMaskKindOf({
        entityId: 4335,
        name: 'ResMed AirSense 11 CPAP Machine & ResMed AirFit N30i Nasal CPAP Mask - Exclusive Value Package',
        categoryIds: [1136],
      }),
    ).toBeNull();
    [4372, 4394, 4424, 4632, 4927, 5030, 4992, 4733, 5014].forEach((id) =>
      expect(rxMaskKindOf({ entityId: id, categoryIds: [1120] })).toBeNull(),
    );
    expect(
      rxMaskKindOf({
        entityId: 7400,
        name: 'AirSense 12 Machine with Mask Fit Pack',
        categoryIds: [],
      }),
    ).toBeNull();
  });

  it('treats a kit holding a complete mask as one, and a child mask kit as paediatric', () => {
    expect(
      rxMaskKindOf({
        entityId: 8300,
        name: 'Sleep starter kit',
        categoryIds: [],
        components: [{ entityId: 4585 }, { entityId: 7999 }],
      }),
    ).toBe('adult');
    expect(
      rxMaskKindOf({
        entityId: 8301,
        name: 'Kids sleep kit',
        categoryIds: [],
        components: [{ entityId: 4585 }, { entityId: 4210 }],
      }),
    ).toBe('paediatric');
    expect(
      rxMaskKindOf({
        entityId: 8302,
        name: 'Mask care kit',
        categoryIds: [],
        components: [{ entityId: 4232 }, { entityId: 7999 }],
      }),
    ).toBeNull();
    expect(
      rxMaskKindOf({
        entityId: 8303,
        name: 'Machine kit',
        categoryIds: [],
        components: [{ entityId: 4585 }, { entityId: 4641 }],
      }),
    ).toBeNull();
  });
});

describe('the parent mask shelf (review fix)', () => {
  it('treats an unreviewed product filed on 1048 CPAP Masks as a complete mask', () => {
    expect(rxMaskKindOf({ entityId: 7500, name: 'New Nasal CPAP Mask', categoryIds: [1048] })).toBe(
      'adult',
    );
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it('still keeps the reviewed part one-click on 1048', () => {
    expect(rxMaskKindOf({ entityId: 4232, categoryIds: [1048, 1128] })).toBeNull();
  });
});

describe('complete masks among cart and order lines (review fix)', () => {
  it('adds the register and the name rule on each line to the catalogue’s answer', () => {
    const found = rxMasksOfLines(
      [
        // Hidden, so the storefront returned nothing for it: the register still finds it.
        { productEntityId: 4810, name: 'ResMed AirFit F10 Full Face CPAP Mask - DISCONTINUED' },
        // Unregistered and not returned: the line's own name says it is a complete mask.
        { productEntityId: 7600, name: 'Brand Y Full Face CPAP Mask - Fit Pack' },
        // The catalogue's answer (a shelf hit the line alone can't see) is kept.
        { productEntityId: 7601, name: 'Brand Y Nasal Mask' },
        // A part and an ordinary product are left out.
        {
          productEntityId: 4232,
          name: 'Nasal Pillow for RespCare Aloha Nasal Pillow CPAP Mask - Large',
        },
        { productEntityId: 4100, name: 'Test strips' },
      ],
      new Map([[7601, 'adult']]),
    );

    expect([...found.keys()].sort((a, b) => a - b)).toEqual([4810, 7600, 7601]);
  });

  it('lets a child’s mask win, from either side', () => {
    expect(
      rxMasksOfLines([{ productEntityId: 4543, name: 'Pixi' }], new Map([[4543, 'adult']])).get(
        4543,
      ),
    ).toBe('paediatric');
    expect(
      rxMasksOfLines(
        [{ productEntityId: 7700, name: 'Kids Mask' }],
        new Map([[7700, 'paediatric']]),
      ).get(7700),
    ).toBe('paediatric');
  });

  it('never calls a machine or machine bundle a mask', () => {
    expect(rxMasksOfLines([{ productEntityId: 4641, name: 'AirSense 11' }]).size).toBe(0);
  });
});
