import { MakeswiftComponent } from '@makeswift/runtime/next';

import { getComponentSnapshot } from '~/lib/makeswift/client';

import { COMPONENT_TYPE } from './register';

type Props = {
  snapshotId?: string;
  label?: string;
};

export async function SiteFooterBottomBar({
  snapshotId = 'site-footer-bottom-bar',
  label = 'Site Footer Bottom Bar',
}: Props) {
  const snapshot = await getComponentSnapshot(snapshotId);

  return <MakeswiftComponent label={label} snapshot={snapshot} type={COMPONENT_TYPE} />;
}
