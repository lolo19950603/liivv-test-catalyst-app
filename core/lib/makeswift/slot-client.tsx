'use client';

import { Slot as MakeswiftSlot } from '@makeswift/runtime/next';
import { useIsInBuilder } from '@makeswift/runtime/react';
import type { ReactNode } from 'react';

import { isComponentSnapshotEmpty, type MakeswiftComponentSnapshot } from './is-component-snapshot-empty';

type Props = {
  snapshot: MakeswiftComponentSnapshot;
  label: string;
  fallback?: ReactNode;
  /** When true, empty snapshot slots render Makeswift chrome (builder only; keep false). */
  showWhenEmpty: boolean;
};

export function SlotClient({ snapshot, label, fallback, showWhenEmpty }: Props) {
  const isInBuilder = useIsInBuilder();
  const isEmpty = isComponentSnapshotEmpty(snapshot);

  if (isEmpty && !showWhenEmpty && !isInBuilder) {
    return fallback ?? null;
  }

  return <MakeswiftSlot fallback={fallback} label={label} snapshot={snapshot} />;
}
