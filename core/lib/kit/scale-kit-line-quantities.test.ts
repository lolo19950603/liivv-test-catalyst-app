import { describe, expect, it } from 'vitest';

import { applyKitRecipeDelta, scaleKitLineQuantities } from './scale-kit-line-quantities';

describe('scaleKitLineQuantities', () => {
  it('multiplies cart quantities and keeps per-kit amounts', () => {
    const next = scaleKitLineQuantities(
      [
        {
          id: 'a',
          kitId: 'KIT-ONE',
          kitQuantity: 1,
          kitUnitQuantity: 1,
          quantity: 1,
        },
        {
          id: 'b',
          kitId: 'KIT-ONE',
          kitQuantity: 1,
          kitUnitQuantity: 2,
          quantity: 2,
        },
        { id: 'c', quantity: 1 },
      ],
      'KIT-ONE',
      3,
    );

    expect(next).toEqual([
      {
        id: 'a',
        kitId: 'KIT-ONE',
        kitQuantity: 3,
        kitUnitQuantity: 1,
        quantity: 3,
      },
      {
        id: 'b',
        kitId: 'KIT-ONE',
        kitQuantity: 3,
        kitUnitQuantity: 2,
        quantity: 6,
      },
      { id: 'c', quantity: 1 },
    ]);
  });

  it('removes kit lines when quantity is 0', () => {
    const next = scaleKitLineQuantities(
      [
        { id: 'a', kitId: 'KIT-ONE', kitUnitQuantity: 1, quantity: 1 },
        { id: 'b', quantity: 4 },
      ],
      'KIT-ONE',
      0,
    );

    expect(next).toEqual([{ id: 'b', quantity: 4 }]);
  });
});

describe('applyKitRecipeDelta', () => {
  it('adjusts per-kit recipe and scales cart quantity by kit count', () => {
    const next = applyKitRecipeDelta(
      {
        id: 'a',
        kitId: 'KIT-ONE',
        kitQuantity: 2,
        kitUnitQuantity: 1,
        quantity: 2,
      },
      1,
    );

    expect(next).toEqual({
      id: 'a',
      kitId: 'KIT-ONE',
      kitQuantity: 2,
      kitUnitQuantity: 2,
      quantity: 4,
    });
  });

  it('decrements recipe and scales cart quantity by kit count', () => {
    const next = applyKitRecipeDelta(
      {
        id: 'a',
        kitId: 'KIT-ONE',
        kitQuantity: 2,
        kitUnitQuantity: 3,
        quantity: 6,
      },
      -1,
    );

    expect(next).toEqual({
      id: 'a',
      kitId: 'KIT-ONE',
      kitQuantity: 2,
      kitUnitQuantity: 2,
      quantity: 4,
    });
  });

  it('does not drop recipe below 1', () => {
    const next = applyKitRecipeDelta(
      {
        id: 'a',
        kitId: 'KIT-ONE',
        kitQuantity: 3,
        kitUnitQuantity: 1,
        quantity: 3,
      },
      -1,
    );

    expect(next.kitUnitQuantity).toBe(1);
    expect(next.quantity).toBe(3);
  });

  it('increments standalone lines by 1', () => {
    expect(applyKitRecipeDelta({ id: 'c', quantity: 2 }, 1)).toEqual({ id: 'c', quantity: 3 });
  });
});
