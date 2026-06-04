'use client';

import { Slot as MakeswiftBuiltinSlot } from '@makeswift/runtime/react/builtins/slot';
import type { ComponentProps } from 'react';

type Props = ComponentProps<typeof MakeswiftBuiltinSlot>;

/** Built-in Makeswift Slot; empty chrome hidden via makeswift-builder-chrome.css on preview/live. */
export function CatalystBuiltinSlot(props: Props) {
  return <MakeswiftBuiltinSlot {...props} />;
}
