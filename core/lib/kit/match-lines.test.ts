import { describe, expect, it } from 'vitest';

import { assignKitIdsToCartLines, formatKitPackingStaffNotes } from './match-lines';

describe('assignKitIdsToCartLines', () => {
  it('matches one kit of recipe quantities', () => {
    const lines = assignKitIdsToCartLines(
      [
        { id: 'a', productEntityId: 1, quantity: 1 },
        { id: 'b', productEntityId: 2, quantity: 2 },
      ],
      [
        {
          kitId: 'KIT-ONE',
          items: [
            { productEntityId: 1, quantity: 1, name: 'A' },
            { productEntityId: 2, quantity: 2, name: 'B' },
          ],
        },
      ],
    );

    expect(lines.map((line) => line.kitId)).toEqual(['KIT-ONE', 'KIT-ONE']);
  });

  it('matches multiplied cart quantities when shipping multiple kits', () => {
    const lines = assignKitIdsToCartLines(
      [
        { id: 'a', productEntityId: 1, quantity: 2 },
        { id: 'b', productEntityId: 2, quantity: 4 },
      ],
      [
        {
          kitId: 'KIT-ONE',
          quantity: 2,
          items: [
            { productEntityId: 1, quantity: 1, name: 'A' },
            { productEntityId: 2, quantity: 2, name: 'B' },
          ],
        },
      ],
    );

    expect(lines.map((line) => line.kitId)).toEqual(['KIT-ONE', 'KIT-ONE']);
  });

  it('does not leave leftover standalone lines when kit quantity is 2', () => {
    const lines = assignKitIdsToCartLines(
      [{ id: 'a', productEntityId: 1, quantity: 2 }],
      [
        {
          kitId: 'KIT-ONE',
          quantity: 2,
          items: [{ productEntityId: 1, quantity: 1, name: 'A' }],
        },
      ],
    );

    expect(lines[0]?.kitId).toBe('KIT-ONE');
  });
});

describe('formatKitPackingStaffNotes', () => {
  it('includes how many complete kits to ship', () => {
    const notes = formatKitPackingStaffNotes([
      {
        kitId: 'KIT-ONE',
        name: 'Bones Kit',
        quantity: 2,
        items: [{ productEntityId: 1, quantity: 1, name: 'Calcium' }],
      },
    ]);

    expect(notes).toContain('Ship 2 complete kits.');
    expect(notes).toContain('Calcium × 1');
  });
});
