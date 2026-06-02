import { lazy } from 'react';

import { Checkbox, Slot as SlotControl } from '@makeswift/runtime/controls';
import { MakeswiftComponentType } from '@makeswift/runtime/react/builtins';
import type { ReactRuntimeCore } from '@makeswift/runtime/react/core';

/**
 * Built-in Makeswift slot registration with `showFallback` defaulting to false.
 * Upstream `@makeswift/runtime` sets `defaultValue: true` on "Use fallback".
 */
export function registerSlotComponent(runtime: ReactRuntimeCore) {
  return runtime.registerComponent(
    lazy(() =>
      import('@makeswift/runtime/react/builtins/slot').then((mod) => ({
        default: mod.Slot,
      })),
    ),
    {
      type: MakeswiftComponentType.Slot,
      label: 'Slot',
      hidden: true,
      props: {
        children: SlotControl(),
        showFallback: Checkbox({ label: 'Use fallback', defaultValue: false }),
      },
    },
  );
}
