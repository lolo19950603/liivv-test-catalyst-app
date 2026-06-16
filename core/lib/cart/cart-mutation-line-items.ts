import { graphql } from '~/client/graphql';

export const CartMutationLineItemsFragment = graphql(`
  fragment CartMutationLineItemsFragment on CartLineItems {
    physicalItems {
      entityId
      productEntityId
      selectedOptions {
        entityId
        ... on CartSelectedMultipleChoiceOption {
          valueEntityId
        }
        ... on CartSelectedCheckboxOption {
          valueEntityId
        }
      }
    }
    digitalItems {
      entityId
      productEntityId
      selectedOptions {
        entityId
        ... on CartSelectedMultipleChoiceOption {
          valueEntityId
        }
        ... on CartSelectedCheckboxOption {
          valueEntityId
        }
      }
    }
  }
`);

export type CartMutationLineItem = {
  entityId: string;
  productEntityId: number;
  selectedOptions: Array<{
    entityId: number;
    valueEntityId?: number | null;
  }>;
};

export interface AddToOrCreateCartResult {
  cartId: string;
  lineItems: CartMutationLineItem[];
}

export function collectCartMutationLineItems(lineItems: {
  physicalItems: CartMutationLineItem[];
  digitalItems: CartMutationLineItem[];
}): CartMutationLineItem[] {
  return [...lineItems.physicalItems, ...lineItems.digitalItems];
}
