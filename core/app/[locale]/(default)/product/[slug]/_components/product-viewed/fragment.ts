import { graphql } from '~/client/graphql';

export const ProductViewedFragment = graphql(`
  fragment ProductViewedFragment on Product {
    entityId
    name
    brand {
      name
    }
    sku
    description
    plainTextDescription(characterLimit: 1200)
    path
    # Which shelves this product sits on. Read only to decide whether an
    # analytics event may name it (~/lib/analytics/sensitive-products).
    categories(first: 25) {
      edges {
        node {
          entityId
        }
      }
    }
    variants {
      edges {
        node {
          entityId
        }
      }
    }
  }
`);
