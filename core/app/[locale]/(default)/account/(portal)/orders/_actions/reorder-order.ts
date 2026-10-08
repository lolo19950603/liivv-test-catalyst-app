import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { cache } from 'react';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { type ReorderSourceItem } from '~/lib/orders/reorder-line-items';

const ReorderOrderQuery = graphql(`
  query ReorderOrder($filter: OrderFilterInput) {
    site {
      order(filter: $filter) {
        entityId
        consignments {
          shipping {
            edges {
              node {
                lineItems(first: 50) {
                  edges {
                    node {
                      name
                      productEntityId
                      quantity
                      variantEntityId
                      parentLineItemEntityId
                      productOptions {
                        productAttributeEntityId
                        productAttributeValueEntityId
                      }
                    }
                  }
                }
              }
            }
          }
          downloads {
            lineItems(first: 50) {
              edges {
                node {
                  name
                  productEntityId
                  quantity
                  variantEntityId
                  parentLineItemEntityId
                  productOptions {
                    productAttributeEntityId
                    productAttributeValueEntityId
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`);

interface ReorderLineNode {
  name: string;
  productEntityId: number;
  quantity: number;
  variantEntityId?: number | null;
  parentLineItemEntityId?: number | null;
  productOptions: Array<{
    productAttributeEntityId?: number | null;
    productAttributeValueEntityId?: number | null;
  }>;
}

function toSourceLine(line: ReorderLineNode): ReorderSourceItem {
  return {
    kind: 'product',
    name: line.name,
    productEntityId: line.productEntityId,
    quantity: line.quantity,
    variantEntityId: line.variantEntityId,
    parentLineItemEntityId: line.parentLineItemEntityId,
    productOptions: line.productOptions,
  };
}

export const getReorderOrderLines = cache(
  async (id: number): Promise<ReorderSourceItem[] | undefined> => {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const response = await client.fetch({
      document: ReorderOrderQuery,
      variables: { filter: { entityId: id } },
      customerAccessToken,
      fetchOptions: { cache: 'no-store', next: { tags: [TAGS.customer] } },
      errorPolicy: 'auth',
    });

    const order = response.data.site.order;

    if (!order) {
      return undefined;
    }

    if (!order.consignments) {
      return [];
    }

    const shipping = removeEdgesAndNodes(order.consignments.shipping).flatMap((consignment) =>
      removeEdgesAndNodes(consignment.lineItems).map(toSourceLine),
    );
    const downloads = order.consignments.downloads.flatMap((consignment) =>
      removeEdgesAndNodes(consignment.lineItems).map(toSourceLine),
    );

    return [...shipping, ...downloads];
  },
);
