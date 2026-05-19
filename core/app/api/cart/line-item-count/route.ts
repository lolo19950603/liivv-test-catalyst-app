import { NextResponse } from 'next/server';

import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { TAGS } from '~/client/tags';
import { getCartId } from '~/lib/cart';

const GetCartLineItemCountQuery = graphql(`
  query GetCartLineItemCountQuery($cartId: String) {
    site {
      cart(entityId: $cartId) {
        lineItems {
          totalQuantity
        }
      }
    }
  }
`);

/**
 * Live cart line-item count for client components (e.g. diabetes section header).
 * Same semantics as the main header’s streamable cart count.
 */
export async function GET() {
  const cartId = await getCartId();
  const customerAccessToken = await getSessionCustomerAccessToken();

  if (!cartId) {
    return NextResponse.json({ count: null });
  }

  const response = await client.fetch({
    document: GetCartLineItemCountQuery,
    variables: { cartId },
    customerAccessToken,
    fetchOptions: {
      cache: 'no-store',
      next: {
        tags: [TAGS.cart],
      },
    },
  });

  const count =
    response.data.site.cart?.lineItems?.totalQuantity != null
      ? response.data.site.cart.lineItems.totalQuantity
      : null;

  return NextResponse.json({ count });
}
