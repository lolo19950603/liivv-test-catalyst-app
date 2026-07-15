import { clsx } from 'clsx';
import { forwardRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';

import { Link } from '~/components/link';

import type { ArchiveButtonSize, ArchiveButtonVariant } from './index';

export interface ArchiveButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: ArchiveButtonVariant;
  size?: ArchiveButtonSize;
  children: ReactNode;
}

export const ArchiveButtonLink = forwardRef<HTMLAnchorElement, ArchiveButtonLinkProps>(
  function ArchiveButtonLink(
    { variant = 'primary', size = 'md', className, children, ...props },
    ref,
  ) {
    return (
      <Link
        className={clsx(
          'button',
          `button--${variant}`,
          size === 'fixed' ? 'button--fixed' : `button--${size}`,
          className,
        )}
        ref={ref}
        {...props}
      >
        <span className="btn-fill" data-fill="" suppressHydrationWarning />
        <span className="btn-text">
          <span className="inline-flex items-center justify-center gap-2">{children}</span>
        </span>
      </Link>
    );
  },
);
