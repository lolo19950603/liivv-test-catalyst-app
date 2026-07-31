'use server';

import { BigCommerceGQLError, removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { SubmissionResult } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';

import { SearchResult } from '@/vibes/soul/primitives/navigation';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { SearchProductFragment } from '~/components/header/_actions/fragment';
import { searchResultsTransformer } from '~/data-transformers/search-results-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';

const GetKitProductSearchQuery = graphql(
  `
    query getKitProductSearchResults(
      $filters: SearchProductsFiltersInput!
      $currencyCode: currencyCode
    ) {
      site {
        search {
          searchProducts(filters: $filters) {
            products(first: 8) {
              edges {
                node {
                  ...SearchProductFragment
                }
              }
            }
          }
        }
      }
    }
  `,
  [SearchProductFragment],
);

export async function searchKitProducts(
  prevState: {
    lastResult: SubmissionResult | null;
    searchResults: SearchResult[] | null;
    emptyStateTitle?: string;
    emptyStateSubtitle?: string;
  },
  formData: FormData,
): Promise<{
  lastResult: SubmissionResult | null;
  searchResults: SearchResult[] | null;
  emptyStateTitle: string;
  emptyStateSubtitle: string;
}> {
  const t = await getTranslations('Components.Header.Search');
  const submission = parseWithZod(formData, {
    schema: z.object({ term: z.string() }),
  });
  const emptyStateTitle = t('noSearchResultsTitle', {
    term: submission.status === 'success' ? submission.value.term : '',
  });
  const emptyStateSubtitle = t('noSearchResultsSubtitle');

  if (submission.status !== 'success') {
    return {
      lastResult: submission.reply(),
      searchResults: prevState.searchResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }

  const term = submission.value.term.trim();

  if (term.length < 2) {
    return {
      lastResult: submission.reply(),
      searchResults: null,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }

  try {
    const customerAccessToken = await getSessionCustomerAccessToken();
    const currencyCode = await getPreferredCurrencyCode();
    const { data } = await client.fetch({
      document: GetKitProductSearchQuery,
      variables: {
        filters: { searchTerm: term },
        currencyCode,
      },
      customerAccessToken,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    });

    const products = removeEdgesAndNodes(data.site.search.searchProducts.products);
    const searchResults = await searchResultsTransformer(products, { productsOnly: true });

    return {
      lastResult: submission.reply(),
      searchResults,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  } catch (error) {
    if (error instanceof BigCommerceGQLError) {
      return {
        lastResult: submission.reply({ formErrors: [error.message] }),
        searchResults: null,
        emptyStateTitle,
        emptyStateSubtitle,
      };
    }

    return {
      lastResult: submission.reply({ formErrors: ['Search failed'] }),
      searchResults: null,
      emptyStateTitle,
      emptyStateSubtitle,
    };
  }
}
