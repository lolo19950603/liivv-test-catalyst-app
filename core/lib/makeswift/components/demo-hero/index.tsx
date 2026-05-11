import { Component } from '~/lib/makeswift/component';

import { COMPONENT_TYPE } from './register';

interface Props {
  snapshotId?: string;
  label?: string;
}

export const DemoHybridHero = ({
  snapshotId = 'demo-hybrid-hero',
  label = 'Demo hybrid hero',
}: Props) => <Component label={label} snapshotId={snapshotId} type={COMPONENT_TYPE} />;
