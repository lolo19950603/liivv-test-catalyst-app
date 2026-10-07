import { describe, expect, it } from 'vitest';

import { toReorderCartLines } from './reorder-line-items';

describe('toReorderCartLines', () => {
  it('keeps the variant id and skips option ids when a variant is present', () => {
    expect(
      toReorderCartLines([
        {
          kind: 'product',
          name: 'Barrier cream',
          productEntityId: 10,
          quantity: 2,
          variantEntityId: 44,
          productOptions: [{ productAttributeEntityId: 1, productAttributeValueEntityId: 8 }],
        },
      ]),
    ).toEqual([
      {
        name: 'Barrier cream',
        input: { productEntityId: 10, quantity: 2, variantEntityId: 44 },
      },
    ]);
  });

  it('sends multiple-choice option ids when the line has no variant', () => {
    expect(
      toReorderCartLines([
        {
          kind: 'product',
          name: 'Pouch',
          productEntityId: 12,
          quantity: 1,
          variantEntityId: null,
          productOptions: [
            { productAttributeEntityId: 3, productAttributeValueEntityId: 9 },
            { productAttributeEntityId: null, productAttributeValueEntityId: 4 },
          ],
        },
      ]),
    ).toEqual([
      {
        name: 'Pouch',
        input: {
          productEntityId: 12,
          quantity: 1,
          selectedOptions: {
            multipleChoices: [{ optionEntityId: 3, optionValueEntityId: 9 }],
          },
        },
      },
    ]);
  });

  it('skips bundled child lines', () => {
    expect(
      toReorderCartLines([
        {
          kind: 'product',
          name: 'Kit',
          productEntityId: 1,
          quantity: 1,
        },
        {
          kind: 'product',
          name: 'Kit child',
          productEntityId: 2,
          quantity: 1,
          parentLineItemEntityId: 99,
        },
      ]),
    ).toEqual([{ name: 'Kit', input: { productEntityId: 1, quantity: 1 } }]);
  });

  it('ignores gift certificates', () => {
    expect(
      toReorderCartLines([
        { kind: 'giftCertificate', name: 'Gift card' },
        { kind: 'product', name: 'Wipes', productEntityId: 7, quantity: 3 },
      ]),
    ).toEqual([{ name: 'Wipes', input: { productEntityId: 7, quantity: 3 } }]);
  });
});
