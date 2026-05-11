import { Component } from '~/lib/makeswift/component';

import { COMPONENT_TYPE } from './register';

interface Props {
  snapshotId?: string;
  label?: string;
}

export const DemoJourneyScrollerSection = ({
  snapshotId = 'demo-journey-scroller',
  label = 'Demo journey scroller',
}: Props) => <Component label={label} snapshotId={snapshotId} type={COMPONENT_TYPE} />;
