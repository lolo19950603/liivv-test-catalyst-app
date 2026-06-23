import { MakeswiftComponent } from '@makeswift/runtime/next';
import { Streamable } from '@/vibes/soul/lib/streamable';

import { getComponentSnapshot } from '~/lib/makeswift/client';

import type { StoreCategoryNode } from '~/lib/makeswift/site-header/build-store-nav-from-categories';

import type { AccountMenuLink } from '~/lib/account/account-menu-links';

import { PropsContextProvider, type SiteHeaderContextValue } from './client';
import { COMPONENT_TYPE } from './register';

type Props = {
  snapshotId?: string;
  label?: string;
  accountHref: string;
  accountMenuLinks?: AccountMenuLink[];
  categoryTree: Streamable<StoreCategoryNode[]>;
  initialPathname: string;
  storeLogo: SiteHeaderContextValue['storeLogo'];
  storeLogoLabel: string;
  cartCount: Streamable<number | null>;
  searchPlaceholder: string;
  banner?: SiteHeaderContextValue['banner'];
};

export const SiteHeader = async ({
  snapshotId = 'site-header',
  label = 'Site Header',
  accountHref,
  accountMenuLinks,
  categoryTree,
  initialPathname,
  storeLogo,
  storeLogoLabel,
  cartCount,
  searchPlaceholder,
  banner,
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  const contextValue: SiteHeaderContextValue = {
    accountHref,
    accountMenuLinks,
    categoryTree: await categoryTree,
    initialPathname,
    storeLogo,
    storeLogoLabel,
    cartCount: await cartCount,
    searchPlaceholder,
    banner,
  };

  return (
    <PropsContextProvider value={contextValue}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
