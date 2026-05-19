import { MakeswiftComponent } from '@makeswift/runtime/next';
import { Streamable } from '@/vibes/soul/lib/streamable';

import { getComponentSnapshot } from '~/lib/makeswift/client';

import {
  PropsContextProvider,
  type SiteHeaderContextValue,
} from './client';
import { COMPONENT_TYPE } from './register';

type Props = {
  snapshotId?: string;
  label?: string;
  categoryLinks: Streamable<SiteHeaderContextValue['categoryLinks']>;
  fallbackLogo: SiteHeaderContextValue['fallbackLogo'];
  fallbackLogoLabel: string;
  cartCount: Streamable<number | null>;
  searchPlaceholder: string;
  banner?: SiteHeaderContextValue['banner'];
};

export const SiteHeader = async ({
  snapshotId = 'site-header',
  label = 'Site Header',
  categoryLinks,
  fallbackLogo,
  fallbackLogoLabel,
  cartCount,
  searchPlaceholder,
  banner,
}: Props) => {
  const snapshot = await getComponentSnapshot(snapshotId);

  const contextValue: SiteHeaderContextValue = {
    categoryLinks: await categoryLinks,
    fallbackLogo,
    fallbackLogoLabel,
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
