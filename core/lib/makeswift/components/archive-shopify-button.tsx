'use client';

import { clsx } from 'clsx';
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react';
import { useId } from 'react';

import {
  resolveButtonTheme,
  type ArchiveButtonVariant,
  type ButtonColorProps,
} from '~/lib/makeswift/utils/diabetes-care-button-theme';

type ArchiveShopifyButtonBaseProps = {
  className?: string;
  variant?: ArchiveButtonVariant;
  colors?: ButtonColorProps | null;
  children: ReactNode;
};

export type ArchiveShopifyLinkButtonProps = ArchiveShopifyButtonBaseProps & {
  as?: 'link';
  href: string;
  target?: string;
  rel?: string;
};

export type ArchiveShopifyNativeButtonProps = ArchiveShopifyButtonBaseProps & {
  as: 'button';
  type?: 'button' | 'submit';
  disabled?: boolean;
  onClick?: () => void;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style' | 'children' | 'type'>;

export type ArchiveShopifyButtonProps = ArchiveShopifyLinkButtonProps | ArchiveShopifyNativeButtonProps;

function ArchiveShopifyButtonInner({
  className,
  variant = 'primary',
  colors,
  children,
  scopeId,
  ...rest
}: ArchiveShopifyButtonBaseProps & { scopeId: string } & (
    | { as?: 'link'; href: string; target?: string; rel?: string }
    | ({ as: 'button' } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'style' | 'children'>)
  )) {
  const theme = resolveButtonTheme(colors, { scopeId, variant });
  const shared = {
    className: clsx('button', className),
    'data-dc-btn': theme.dataDcBtn,
    style: theme.style as CSSProperties | undefined,
  };

  return (
    <>
      {theme.scopeCss.length > 0 ? (
        <style dangerouslySetInnerHTML={{ __html: theme.scopeCss }} />
      ) : null}
      {rest.as === 'button' ? (
        <button {...rest} {...shared}>
          <span className="btn-fill" data-fill />
          <span className="btn-text">{children}</span>
        </button>
      ) : (
        <a {...shared} href={rest.href} rel={rest.rel} target={rest.target}>
          <span className="btn-fill" data-fill />
          <span className="btn-text">{children}</span>
        </a>
      )}
    </>
  );
}

export function ArchiveShopifyButton(props: ArchiveShopifyButtonProps) {
  const reactId = useId().replace(/:/g, '');
  const scopeId = `dcbtn-${reactId}`;

  if (props.as === 'button') {
    return <ArchiveShopifyButtonInner {...props} scopeId={scopeId} />;
  }

  return <ArchiveShopifyButtonInner {...props} as="link" scopeId={scopeId} />;
}
