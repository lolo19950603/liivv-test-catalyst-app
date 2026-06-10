import { getTranslations } from 'next-intl/server';
import { cache } from 'react';

import type { ProductImageFallbackLogo } from '@/vibes/soul/primitives/product-card';

import { client } from '~/client';
import { graphql } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { StoreLogoFragment } from '~/components/store-logo/fragment';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { resolveStoreLogo } from '~/lib/makeswift/site-header/resolve-store-logo';

const StoreLogoQuery = graphql(
  `
    query StoreLogoQuery {
      site {
        settings {
          ...StoreLogoFragment
        }
      }
    }
  `,
  [StoreLogoFragment],
);

export const getStoreLogoFallback = cache(async (): Promise<ProductImageFallbackLogo | null> => {
  const [{ data }, homeLabel] = await Promise.all([
    client.fetch({
      document: StoreLogoQuery,
      fetchOptions: { next: { revalidate } },
    }),
    getTranslations('Components.Header').then((t) => t('home')),
  ]);

  const logo = data.site.settings ? logoTransformer(data.site.settings) : '';
  const resolved = resolveStoreLogo(logo, homeLabel);

  if (resolved == null) {
    return null;
  }

  return {
    alt: resolved.alt,
    src: resolved.src,
    text: resolved.text,
  };
});
