import { MakeswiftComponent } from '@makeswift/runtime/next';

import { getComponentSnapshot } from '~/lib/makeswift/client';

import { COMPONENT_TYPE } from './register';

type Props = {
  snapshotId?: string;
  label?: string;
};

export async function SiteFeaturedColumnsFooter({
  snapshotId = 'site-featured-columns-footer',
  label = 'Site Featured Columns Footer',
}: Props) {
  const snapshot = await getComponentSnapshot(snapshotId);

  return <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />;
}
