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
  accountCustomerName?: Streamable<string | undefined>;
  accountLabel?: string;
  categoryTree: Streamable<StoreCategoryNode[]>;
  initialPathname: string;
  storeLogo: SiteHeaderContextValue['storeLogo'];
  storeLogoLabel: string;
  cartCount: Streamable<number | null>;
  searchPlaceholder: string;
  notifications?: Streamable<SiteHeaderNotifications | null>;
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

  const [resolvedCategoryTree, resolvedCartCount, resolvedNotifications, resolvedCustomerName] =
    await Promise.all([
      categoryTree,
      cartCount,
      notifications ?? Promise.resolve(null),
      accountCustomerName ?? Promise.resolve(undefined),
    ]);

  const contextValue: SiteHeaderContextValue = {
    accountHref,
    accountMenuLinks,
    accountCustomerName: resolvedCustomerName,
    accountLabel,
    categoryTree: resolvedCategoryTree,
    initialPathname,
    storeLogo,
    storeLogoLabel,
    cartCount: resolvedCartCount,
    searchPlaceholder,
    notifications: resolvedNotifications,
    banner,
  };

  return (
    <PropsContextProvider value={contextValue}>
      <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />
    </PropsContextProvider>
  );
};
