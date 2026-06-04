import { MakeswiftComponent } from '@makeswift/runtime/next';
import { Streamable } from '@/vibes/soul/lib/streamable';

import { getComponentSnapshot } from '~/lib/makeswift/client';

import type { StoreCategoryNode } from '~/lib/makeswift/site-header/build-store-nav-from-categories';

import { PropsContextProvider, type SiteHeaderContextValue } from './client';
import { COMPONENT_TYPE } from './register';

type Props = {
  snapshotId?: string;
  label?: string;
  categoryTree: Streamable<StoreCategoryNode[]>;
  storeLogo: SiteHeaderContextValue['storeLogo'];
  storeLogoLabel: string;
  cartCount: Streamable<number | null>;
  searchPlaceholder: string;
  banner?: SiteHeaderContextValue['banner'];
};

export const SiteHeader = async ({
  snapshotId = 'site-header',
  label = 'Site Header',
  categoryTree,
  storeLogo,
  storeLogoLabel,
  cartCount,
  searchPlaceholder,
  banner,
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  const contextValue: SiteHeaderContextValue = {
    categoryTree: await categoryTree,
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
