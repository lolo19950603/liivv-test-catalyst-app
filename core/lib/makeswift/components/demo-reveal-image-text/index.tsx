import { Component } from '~/lib/makeswift/component';

import { COMPONENT_TYPE } from './register';

interface Props {
  snapshotId?: string;
  label?: string;
}

export const DemoRevealImageWithTextSection = ({
  snapshotId = 'demo-reveal-image-with-text',
  label = 'Demo reveal image with text',
}: Props) => <Component label={label} snapshotId={snapshotId} type={COMPONENT_TYPE} />;
