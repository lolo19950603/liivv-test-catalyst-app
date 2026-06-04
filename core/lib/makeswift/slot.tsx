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
  const snapshot = await getComponentSnapshot(snapshotId);

  return (
    <SlotClient
      fallback={fallback}
      label={label}
      showWhenEmpty={false}
      snapshot={snapshot}
    />
  );
}
