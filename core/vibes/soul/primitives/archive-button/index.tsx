import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

export type ArchiveButtonVariant = 'primary' | 'secondary';
export type ArchiveButtonSize = 'sm' | 'md' | 'lg' | 'fixed';

export interface ArchiveButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ArchiveButtonVariant;
  size?: ArchiveButtonSize;
  loading?: boolean;
  children: ReactNode;
}

/**
 * Archive Shopify theme button (matches product-singular / diabetes-care sections).
 * Requires `diabetes-care-sections.css` and `data-button-hover="standard"` on a parent (via layout theme).
 */
export const ArchiveButton = forwardRef<HTMLButtonElement, ArchiveButtonProps>(function ArchiveButton(
  {
    variant = 'primary',
    size = 'md',
    className,
    children,
    loading = false,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      aria-busy={loading}
      className={clsx(
        'button',
        `button--${variant}`,
        size === 'fixed' ? 'button--fixed' : `button--${size}`,
        loading && 'pointer-events-none',
        className,
      )}
      disabled={disabled || loading}
      ref={ref}
      type={type}
      {...props}
    >
      <span className="btn-fill" data-fill="" />
      <span className="btn-text">
        {loading ? (
          <Loader2 className="size-5 animate-spin" strokeWidth={1.5} />
        ) : (
          <span className="inline-flex items-center justify-center gap-2">{children}</span>
        )}
      </span>
    </button>
  );
});

export { ArchiveButtonLink } from './archive-button-link';
