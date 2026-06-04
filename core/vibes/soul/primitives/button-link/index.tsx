'use client';

import { clsx } from 'clsx';
import { ComponentPropsWithoutRef } from 'react';

import {
  mapSoulLinkVariantToArchive,
  mapSoulSizeToArchive,
  resolveButtonAppearance,
  type StoreButtonAppearance,
} from '~/lib/store-theme/archive-button-maps';
import { useStoreTheme } from '~/lib/store-theme/store-theme';

import { ArchiveButtonLink } from '@/vibes/soul/primitives/archive-button';
import { Link } from '~/components/link';

export interface ButtonLinkProps extends ComponentPropsWithoutRef<typeof Link> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'large' | 'medium' | 'small' | 'x-small';
  shape?: 'pill' | 'rounded' | 'square' | 'circle';
  appearance?: StoreButtonAppearance | 'inherit';
}

function SoulButtonLink({
  variant = 'primary',
  size = 'large',
  shape = 'pill',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={clsx(
        'relative z-0 inline-flex h-fit select-none items-center justify-center overflow-hidden border text-center font-[family-name:var(--button-font-family)] font-semibold leading-normal after:absolute after:inset-0 after:-z-10 after:-translate-x-[105%] after:transition-[opacity,transform] after:duration-300 after:[animation-timing-function:cubic-bezier(0,0.25,0,1)] hover:after:translate-x-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--button-focus,hsl(var(--primary)))] focus-visible:ring-offset-2',
        {
          primary:
            'border-[var(--button-primary-border,hsl(var(--primary)))] bg-[var(--button-primary-background,hsl(var(--primary)))] text-[var(--button-primary-text,hsl(var(--foreground)))] after:bg-[var(--button-primary-background-hover,color-mix(in_oklab,hsl(var(--primary)),white_75%))]',
          secondary:
            'border-[var(--button-secondary-border,hsl(var(--foreground)))] bg-[var(--button-secondary-background,hsl(var(--foreground)))] text-[var(--button-secondary-text,hsl(var(--background)))] after:bg-[var(--button-secondary-background-hover,hsl(var(--background)))]',
          tertiary:
            'border-[var(--button-tertiary-border,hsl(var(--contrast-200)))] bg-[var(--button-tertiary-background,hsl(var(--background)))] text-[var(--button-tertiary-text,hsl(var(--foreground)))] after:bg-[var(--button-tertiary-background-hover,hsl(var(--contrast-100)))]',
          ghost:
            'border-[var(--button-ghost-border,transparent)] bg-[var(--button-ghost-background,transparent)] text-[var(--button-ghost-text,hsl(var(--foreground)))] after:bg-[var(--button-ghost-background-hover,hsl(var(--foreground)/5%))]',
        }[variant],
        {
          'x-small': 'min-h-8 text-xs',
          small: 'min-h-10 text-sm',
          medium: 'min-h-12 text-base',
          large: 'min-h-14 text-base',
        }[size],
        shape !== 'circle' &&
          {
            'x-small': 'gap-x-2 px-3 py-1.5',
            small: 'gap-x-2 px-4 py-2.5',
            medium: 'gap-x-2.5 px-5 py-3',
            large: 'gap-x-3 px-6 py-4',
          }[size],
        {
          pill: 'rounded-full after:rounded-full',
          rounded: 'rounded-lg after:rounded-lg',
          square: 'rounded-none after:rounded-none',
          circle: 'aspect-square rounded-full after:rounded-full',
        }[shape],
        className,
      )}
    >
      <span className={clsx(variant === 'secondary' && 'mix-blend-difference')}>{children}</span>
    </Link>
  );
}

export function ButtonLink({
  appearance = 'inherit',
  variant = 'primary',
  size = 'large',
  shape = 'pill',
  className,
  children,
  ...props
}: ButtonLinkProps) {
  const storeTheme = useStoreTheme();
  const resolvedAppearance = resolveButtonAppearance(appearance, storeTheme.buttonAppearance);

  if (resolvedAppearance !== 'archive' || variant === 'ghost' || shape === 'circle') {
    return (
      <SoulButtonLink
        className={className}
        shape={shape}
        size={size}
        variant={variant}
        {...props}
      >
        {children}
      </SoulButtonLink>
    );
  }

  return (
    <ArchiveButtonLink
      className={className}
      size={mapSoulSizeToArchive(size)}
      variant={mapSoulLinkVariantToArchive(variant)}
      {...props}
    >
      {children}
    </ArchiveButtonLink>
  );
}
