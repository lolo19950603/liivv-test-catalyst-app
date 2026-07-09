import 'server-only';

import { cache } from 'react';

import { GetLinksAndSectionsQuery, LayoutQuery } from '~/app/[locale]/(default)/page-data';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { HeaderFragment, HeaderLinksFragment } from '~/components/header/fragment';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { getPreferredCurrencyCode } from '~/lib/currency';
import { getComponentSnapshot } from '~/lib/makeswift/client';
import { mapCategoryTreeFromStore } from '~/lib/makeswift/site-header/map-category-tree';
import {
  type MakeswiftAdditionalLinkInput,
} from '~/lib/makeswift/site-header/map-makeswift-nav-links';
import { resolveStoreLogo } from '~/lib/makeswift/site-header/resolve-store-logo';
import { resolveStoreNavLinks } from '~/lib/makeswift/site-header/resolve-store-nav-links';
import { revalidate } from '~/client/revalidate-target';

export type DashboardStoreNavLink = {
  label: string;
  href: string;
};

export type DashboardStoreNav = {
  logo: {
    src?: string;
    text?: string;
    alt: string;
    href: string;
  };
  links: DashboardStoreNavLink[];
};

function extractMakeswiftHeaderLinks(
  snapshot: Awaited<ReturnType<typeof getComponentSnapshot>> | null,
): MakeswiftAdditionalLinkInput[] {
  const props = snapshot?.document?.data?.props as
    | { links?: MakeswiftAdditionalLinkInput[] }
    | undefined;

  return Array.isArray(props?.links) ? props.links : [];
}

export const getDashboardStoreNav = cache(async (): Promise<DashboardStoreNav> => {
  const customerAccessToken = await getSessionCustomerAccessToken();
  const currencyCode = await getPreferredCurrencyCode();

  const [snapshot, linksResponse, layoutResponse] = await Promise.all([
    getComponentSnapshot('site-header').catch(() => null),
    client.fetch({
      document: GetLinksAndSectionsQuery,
      customerAccessToken,
      variables: { currencyCode },
      validateCustomerAccessToken: false,
      fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
    }),
    client.fetch({
      document: LayoutQuery,
      fetchOptions: { next: { revalidate } },
    }),
  ]);

  const siteLinks = readFragment(HeaderLinksFragment, linksResponse.data.site);
  const categoryNodes = mapCategoryTreeFromStore(siteLinks.categoryTree);
  const additionalLinks = extractMakeswiftHeaderLinks(snapshot);
  const navLinks = resolveStoreNavLinks(additionalLinks, categoryNodes);

  const settings = readFragment(HeaderFragment, layoutResponse.data.site).settings;
  const storeLogo = resolveStoreLogo(
    settings ? logoTransformer(settings) : '',
    'Home',
  );

  return {
    logo: {
      src: storeLogo?.src,
      text: storeLogo?.text,
      alt: storeLogo?.alt ?? 'Home',
      href: storeLogo?.href ?? '/',
    },
    links: navLinks.map((link) => ({
      label: link.label,
      href: link.href,
    })),
  };
});
