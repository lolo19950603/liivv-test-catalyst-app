import { MakeswiftComponent } from '@makeswift/runtime/next';
import { Streamable } from '@/vibes/soul/lib/streamable';

import { getComponentSnapshot } from '~/lib/makeswift/client';

import type { StoreCategoryNode } from '~/lib/makeswift/site-header/build-store-nav-from-categories';

import type { AccountMenuLink } from '~/lib/account/account-menu-links';
import type { SiteHeaderNotifications } from '~/lib/account-notifications/header-notification-labels';

import { PropsContextProvider, type SiteHeaderContextValue } from './client';
import { COMPONENT_TYPE } from './register';

type Props = {
  snapshotId?: string;
  label?: string;
  accountHref: string;
  accountMenuLinks?: AccountMenuLink[];
  accountCustomerName?: string;
  accountLabel?: string;
  categoryTree: Streamable<StoreCategoryNode[]>;
  initialPathname: string;
  storeLogo: SiteHeaderContextValue['storeLogo'];
  storeLogoLabel: string;
  cartCount: Streamable<number | null>;
  searchPlaceholder: string;
  notifications?: SiteHeaderNotifications | null;
  banner?: SiteHeaderContextValue['banner'];
};

export const SiteHeader = async ({
  snapshotId = 'site-header',
  label = 'Site Header',
  accountHref,
  accountMenuLinks,
  accountCustomerName,
  accountLabel,
  categoryTree,
  initialPathname,
  storeLogo,
  storeLogoLabel,
  cartCount,
  searchPlaceholder,
  notifications = null,
  banner,
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  const contextValue: SiteHeaderContextValue = {
    accountHref,
    accountMenuLinks,
    accountCustomerName,
    accountLabel,
    categoryTree: await categoryTree,
    initialPathname,
    storeLogo,
    storeLogoLabel,
    cartCount: await cartCount,
    searchPlaceholder,
    notifications,
    banner,
  };

  return (
    <PropsContextProvider value={contextValue}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
