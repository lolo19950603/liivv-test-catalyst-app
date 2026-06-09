import { cache } from 'react';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { BreadcrumbsCategoryFragment } from '~/components/breadcrumbs/fragment';
import { StoreLogoFragment } from '~/components/store-logo/fragment';

const CategoryPageQuery = graphql(
  `
    query CategoryPageQuery($entityId: Int!) {
      site {
        category(entityId: $entityId) {
          entityId
          name
          path
          ...BreadcrumbsFragment
          seo {
            pageTitle
            metaDescription
            metaKeywords
          }
        }
        categoryTree(rootEntityId: $entityId) {
          entityId
          name
          path
          children {
            entityId
            name
            path
            children {
              entityId
              name
              path
            }
          }
        }
        settings {
          ...StoreLogoFragment
          inventory {
            defaultOutOfStockMessage
            showOutOfStockMessage
            showBackorderMessage
          }
          storefront {
            catalog {
              productComparisonsEnabled
            }
          }
          display {
            showProductRating
          }
          reviews {
            enabled
          }
        }
      }
    }
  `,
  [BreadcrumbsCategoryFragment, StoreLogoFragment],
);

export const getCategoryPageData = cache(async (entityId: number, customerAccessToken?: string) => {
  const response = await client.fetch({
    document: CategoryPageQuery,
    variables: { entityId },
    customerAccessToken,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  return response.data.site;
});
