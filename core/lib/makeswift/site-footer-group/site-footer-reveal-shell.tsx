'use client';

import type { CSSProperties, ReactNode } from 'react';

import { SITE_FOOTER_ROUNDED_BOTTOM_CSS } from '~/lib/makeswift/components/site-footer/archive-styles';
import { SITE_FOOTER_DEFAULT_BACKGROUND_CHANNELS } from '~/lib/makeswift/components/site-footer/client';

import { SITE_FOOTER_REVEAL_CSS } from './site-footer-reveal-css';

const DEFAULT_OVERLAY_HEIGHT = 120;

type SiteFooterRevealShellProps = {
  /** Cream featured-columns band (scrolls with the page). */
  featuredColumns: ReactNode;
  /** Dark site footer (sticky layer above the bottom bar on desktop). */
  footer: ReactNode;
  /** Copyright + payment icons bar (sticky at viewport bottom on desktop). */
  footerBottom?: ReactNode;
  /** Page main content (`<main>`). */
  children: ReactNode;
  /** Footer background RGB channels for the top gradient overlay. */
  footerBackgroundChannels?: string;
};

export function SiteFooterRevealShell({
  featuredColumns,
  footer,
  footerBottom,
  children,
  footerBackgroundChannels = SITE_FOOTER_DEFAULT_BACKGROUND_CHANNELS,
}: SiteFooterRevealShellProps) {
  const footerGroupStyle = {
    '--site-footer-shell-bg': footerBackgroundChannels,
    '--site-footer-reveal-overlay-height': `${DEFAULT_OVERLAY_HEIGHT}px`,
    '--site-footer-reveal-overlay-bg': footerBackgroundChannels,
  } as CSSProperties;

  return (
    <div className="site-footer-reveal-shell">
      <style
        dangerouslySetInnerHTML={{
          __html: `${SITE_FOOTER_REVEAL_CSS}${SITE_FOOTER_ROUNDED_BOTTOM_CSS}`,
        }}
      />
      {children}
      <div className="site-footer-reveal-footer footer-group block w-full" style={footerGroupStyle}>
        <div className="site-footer-reveal-features">{featuredColumns}</div>
        <div className="site-footer-reveal-main relative">
          <div aria-hidden className="footer-overlay hidden md:block" />
          {footer}
        </div>
        {footerBottom != null ? (
          <div className="site-footer-reveal-bottom">{footerBottom}</div>
        ) : null}
      </div>
    </div>
  );
}
