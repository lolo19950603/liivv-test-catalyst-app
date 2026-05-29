'use client';

import { clsx } from 'clsx';
import { useContext, type CSSProperties } from 'react';

import { PropsContext } from '~/lib/makeswift/components/site-footer/client';
import {
  resolveBodyTextColor,
  type BodyTextProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import {
  SITE_FOOTER_BOTTOM_BAR_CSS,
  SITE_FOOTER_BOTTOM_BAR_SECTION_ID,
} from './archive-styles';

/** Default bottom bar copy color. */
export const SITE_FOOTER_BOTTOM_BAR_DEFAULT_TEXT_HEX = '#5d4e4b';

/** Logo cap for the bottom bar (store text logos inherit huge heading styles). */
const BOTTOM_BAR_LOGO_MAX_WIDTH = 280;
const BOTTOM_BAR_LOGO_MAX_HEIGHT = 72;

type BottomBarLogoProps = {
  show: boolean;
  src?: string;
  width: number;
  height: number;
  alt: string;
};

function resolveBottomBarLogo(
  logo: BottomBarLogoProps,
  storeLogo: string | { src: string; alt: string } | null | undefined,
): string | { src: string; alt: string } | null {
  if (logo.show === false) {
    return null;
  }

  if (logo.src != null && logo.src !== '') {
    return { src: logo.src, alt: logo.alt };
  }

  return storeLogo ?? null;
}

function clampLogoSize(width: number, height: number) {
  const scale = Math.min(
    BOTTOM_BAR_LOGO_MAX_WIDTH / Math.max(width, 1),
    BOTTOM_BAR_LOGO_MAX_HEIGHT / Math.max(height, 1),
    1,
  );

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function BottomBarLogo({
  logo,
  resolvedLogo,
  logoHref,
  logoLabel,
}: {
  logo: BottomBarLogoProps;
  resolvedLogo: string | { src: string; alt: string };
  logoHref: string;
  logoLabel: string;
}) {
  const { width, height } = clampLogoSize(logo.width, logo.height);

  return (
    <Link
      aria-label={logoLabel}
      className="relative inline-flex shrink-0 items-center overflow-hidden outline-0 ring-[var(--logo-focus,hsl(var(--primary)))] ring-offset-4 focus-visible:ring-2"
      href={logoHref}
      style={{
        maxWidth: `${Math.min(width, BOTTOM_BAR_LOGO_MAX_WIDTH)}px`,
        maxHeight: `${Math.min(height, BOTTOM_BAR_LOGO_MAX_HEIGHT)}px`,
      }}
    >
      {typeof resolvedLogo === 'object' && resolvedLogo.src !== '' ? (
        <Image
          alt={resolvedLogo.alt}
          className="h-auto w-auto object-contain object-left"
          style={{
            maxHeight: `${BOTTOM_BAR_LOGO_MAX_HEIGHT}px`,
            maxWidth: `${BOTTOM_BAR_LOGO_MAX_WIDTH}px`,
          }}
          height={height}
          src={resolvedLogo.src}
          width={width}
        />
      ) : (
        <span className="block text-3xl font-semibold leading-none text-[var(--logo-text,#5d4e4b)]">
          {resolvedLogo}
        </span>
      )}
    </Link>
  );
}

export type SiteFooterBottomBarProps = {
  className?: string;
  bodyText?: BodyTextProps;
  copyright?: string;
  logo: BottomBarLogoProps;
};

export function SiteFooterBottomBar({
  className,
  bodyText,
  copyright,
  logo,
}: SiteFooterBottomBarProps) {
  const passedProps = useContext(PropsContext);
  const resolvedCopyright = copyright ?? passedProps.copyright;
  const paymentIcons = passedProps.paymentIcons;
  const resolvedLogo = resolveBottomBarLogo(logo, passedProps.logo);
  const copyrightColor =
    resolveBodyTextColor(bodyText) ?? SITE_FOOTER_BOTTOM_BAR_DEFAULT_TEXT_HEX;
  const shellStyle = {
    '--footer-copyright': copyrightColor,
  } as CSSProperties;
  const logoHref = passedProps.logoHref ?? '/';
  const logoLabel = passedProps.logoLabel ?? 'Home';

  if (
    resolvedLogo == null &&
    (resolvedCopyright == null || resolvedCopyright === '') &&
    (paymentIcons == null || paymentIcons.length === 0)
  ) {
    return null;
  }

  return (
    <div className="site-footer-bottom-bar__shell bg-white" style={shellStyle}>
      <div className="shopify-section" id={SITE_FOOTER_BOTTOM_BAR_SECTION_ID}>
        <style dangerouslySetInnerHTML={{ __html: SITE_FOOTER_BOTTOM_BAR_CSS }} />
        <div
          className={clsx(
            'site-footer-bottom-bar site-footer-bottom-bar--rounded-bottom border-t-0 bg-white',
            className,
          )}
        >
          <div className="site-footer-bottom-bar__inner w-full py-5">
            <div className="flex items-start justify-between gap-x-4 gap-y-3">
              <div className="flex min-w-0 flex-col gap-2">
                {resolvedLogo != null ? (
                  <BottomBarLogo
                    logo={logo}
                    logoHref={logoHref}
                    logoLabel={logoLabel}
                    resolvedLogo={resolvedLogo}
                  />
                ) : null}
                {resolvedCopyright != null && resolvedCopyright !== '' ? (
                  <p className="min-w-0 text-sm text-[var(--footer-copyright,#5d4e4b)]">
                    {resolvedCopyright}
                  </p>
                ) : null}
              </div>
              {paymentIcons != null && paymentIcons.length > 0 ? (
                <div className="flex shrink-0 flex-wrap justify-end gap-2 self-center">
                  {paymentIcons}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
