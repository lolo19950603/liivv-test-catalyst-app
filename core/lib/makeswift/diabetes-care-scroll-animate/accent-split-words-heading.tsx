'use client';

import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';
import { resolveAccentColors } from '~/lib/makeswift/utils/heading-accent-color';

import { SplitWordsHeading, type SplitWordsHeadingProps } from './split-words-heading';

export type AccentSplitWordsHeadingProps = SplitWordsHeadingProps & {
  accentColors?: HeadingAccentColorProps;
};

/** SplitWordsHeading with Makeswift accent / highlight color props applied. */
export function AccentSplitWordsHeading({
  accentColors,
  emphasisColor: emphasisColorProp,
  highlightStyle: highlightStyleProp,
  ...props
}: AccentSplitWordsHeadingProps) {
  const resolved = resolveAccentColors(accentColors ?? {});

  return (
    <SplitWordsHeading
      {...props}
      emphasisColor={emphasisColorProp ?? resolved.emphasisColor}
      highlightStyle={highlightStyleProp ?? resolved.highlightStyle}
    />
  );
}
