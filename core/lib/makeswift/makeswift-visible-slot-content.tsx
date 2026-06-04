'use client';

import { useIsInBuilder } from '@makeswift/runtime/react';
import { isValidElement, type ReactElement, type ReactNode } from 'react';

export function isEmptyMakeswiftPlaceholder(node: ReactNode): boolean {
  if (node == null || node === false) {
    return true;
  }

  if (typeof node === 'string') {
    return node.trim().length === 0;
  }

  if (Array.isArray(node)) {
    return node.length === 0 || node.every(isEmptyMakeswiftPlaceholder);
  }

  if (!isValidElement(node)) {
    return false;
  }

  const element = node as ReactElement<{ children?: ReactNode } & Record<string, unknown>>;
  const props = element.props;

  return isEmptyMakeswiftPlaceholder(props.children);
}

/** Renders Makeswift slot children on live/preview only when they have real content. */
export function MakeswiftVisibleSlotContent({ children }: { children: ReactNode }) {
  const isInBuilder = useIsInBuilder();

  if (isInBuilder) {
    return <>{children}</>;
  }

  if (isEmptyMakeswiftPlaceholder(children)) {
    return null;
  }

  return <>{children}</>;
}
