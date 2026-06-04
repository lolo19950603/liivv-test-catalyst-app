import { getSiteVersion } from '@makeswift/runtime/next/server';

import { getComponentSnapshot } from './client';
import { SlotClient } from './slot-client';

export async function Slot({
  snapshotId,
  label,
  fallback,
}: {
  snapshotId: string;
  label: string;
  fallback?: React.ReactNode;
}) {
  const [snapshot, siteVersion] = await Promise.all([
    getComponentSnapshot(snapshotId),
    getSiteVersion(),
  ]);

  return (
    <SlotClient
      fallback={fallback}
      label={label}
      showWhenEmpty={siteVersion != null}
      snapshot={snapshot}
    />
  );
}
