'use client';

import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

type HighlightStyle = 'half_text' | 'text';

export function ArchiveHighlightedText({
  children,
  className,
  color,
  highlightStyle = 'half_text',
}: {
  children: ReactNode;
  className?: string;
  color?: string;
  highlightStyle?: HighlightStyle;
}) {
  const style: CSSProperties | undefined =
    typeof color === 'string' && color.trim().length > 0 ? { color: color.trim() } : undefined;

  return (
    <em
      className={clsx('highlighted-text animated relative not-italic', className)}
      data-style={highlightStyle}
      style={style}
      {...{ is: 'highlighted-text' }}
    >
      {children}
    </em>
  );
}
