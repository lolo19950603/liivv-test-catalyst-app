'use client';

import { clsx } from 'clsx';
import {
  type ComponentPropsWithoutRef,
  createContext,
  type CSSProperties,
  type PropsWithChildren,
  useContext,
  useLayoutEffect,
} from 'react';

import { Footer } from '@/vibes/soul/sections/footer';
import {
  resolveBodyTextColor,
  resolveSectionBackgroundChannels,
  type BodyTextProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';

import {
  SITE_FOOTER_CONTENT_LAYOUT_CSS,
  SITE_FOOTER_ROUNDED_BOTTOM_CSS,
  SITE_FOOTER_SECTION_ID,
} from './archive-styles';

import { mergeSections } from '../../utils/merge-sections';

/** `#312f30` as archive RGB channels. */
export const SITE_FOOTER_DEFAULT_BACKGROUND_HEX = '#312f30';
/** `#312f30` as archive RGB channels. */
export const SITE_FOOTER_DEFAULT_BACKGROUND_CHANNELS = '49 47 48';
/** Default footer copy color. */
export const SITE_FOOTER_DEFAULT_TEXT_HEX = '#fbfbfb';

export function footerThemeStyle(
  background?: SectionBackgroundProps | null,
  bodyText?: BodyTextProps | null,
): CSSProperties {
  const bgChannels = resolveSectionBackgroundChannels(
    background,
    SITE_FOOTER_DEFAULT_BACKGROUND_CHANNELS,
  );
  const text = resolveBodyTextColor(bodyText) ?? SITE_FOOTER_DEFAULT_TEXT_HEX;

  return {
    '--footer-background': `rgb(${bgChannels})`,
    '--footer-border-top': 'rgb(255 255 255 / 0.12)',
    '--footer-border-bottom': `rgb(${bgChannels})`,
    '--footer-section-title': text,
    '--footer-link': text,
    '--footer-link-hover': text,
    '--footer-contact-title': text,
    '--footer-contact-text': text,
    '--footer-copyright': text,
    '--footer-social-icon': text,
    '--footer-social-icon-hover': text,
  } as CSSProperties;
}

type FooterProps = ComponentPropsWithoutRef<typeof Footer>;

// MakeswiftFooter does not support streamable sections
type ContextProps = Omit<
  FooterProps,
  'sections' | 'logo' | 'paymentIcons' | 'copyright' | 'contactInformation' | 'socialMediaLinks'
> & {
  logo: Awaited<FooterProps['logo']>;
  sections: Awaited<FooterProps['sections']>;
  copyright?: string;
  paymentIcons?: import('react').ReactNode[];
  contactInformation?: Awaited<NonNullable<FooterProps['contactInformation']>>;
  socialMediaLinks?: Awaited<NonNullable<FooterProps['socialMediaLinks']>>;
};

const PropsContext = createContext<ContextProps>({
  logo: null,
  sections: [],
});

export { PropsContext };

export const PropsContextProvider = ({
  value,
  children,
}: PropsWithChildren<{ value: ContextProps }>) => (
  <PropsContext.Provider value={value}>{children}</PropsContext.Provider>
);

interface Props {
  sections: Array<{
    title: string;
    links: Array<{
      label: string;
      link: { href: string; target?: string };
    }>;
  }>;
  background?: SectionBackgroundProps;
  bodyText?: BodyTextProps;
  roundedBottom?: boolean;
}

function combineSections(
  passedSections: ContextProps['sections'],
  makeswiftSections: Props['sections'],
): ContextProps['sections'] {
  return mergeSections(
    passedSections,
    makeswiftSections.map(({ title, links }) => ({
      title,
      links: links.map(({ label, link }) => ({ label, href: link.href, target: link.target })),
    })),
    (left, right) => ({ ...left, links: [...left.links, ...right.links] }),
  );
}

export function syncFooterShellBackgroundChannels(channels: string) {
  if (typeof document === 'undefined') {
    return;
  }

  const footerGroup = document.querySelector('.site-footer-reveal-footer');

  if (!(footerGroup instanceof HTMLElement)) {
    return;
  }

  footerGroup.style.setProperty('--site-footer-shell-bg', channels);
  footerGroup.style.setProperty('--site-footer-reveal-overlay-bg', channels);
}

export const MakeswiftFooter = ({
  sections,
  background,
  bodyText,
  roundedBottom = true,
}: Omit<Props, 'copyright' | 'logo'>) => {
  const passedProps = useContext(PropsContext);
  const bgChannels = resolveSectionBackgroundChannels(
    background,
    SITE_FOOTER_DEFAULT_BACKGROUND_CHANNELS,
  );
  const isRounded = roundedBottom !== false;
  const themeStyle = {
    ...footerThemeStyle(background, bodyText),
    ...(isRounded
      ? {
          borderBottomLeftRadius: 'var(--border-radius, 1.5rem)',
          borderBottomRightRadius: 'var(--border-radius, 1.5rem)',
        }
      : {}),
  } as CSSProperties;

  useLayoutEffect(() => {
    syncFooterShellBackgroundChannels(bgChannels);
  }, [bgChannels]);

  const footerClassName = clsx(
    'site-footer-makeswift__panel',
    isRounded && ['site-footer-makeswift__panel--rounded', 'relative'],
    'border-b-0',
    'border-t-0',
    passedProps.className,
  );

  const footer = (
    <Footer
      {...passedProps}
      className={footerClassName}
      copyright={undefined}
      logo={null}
      logoHeight={0}
      logoWidth={0}
      paymentIcons={undefined}
      sections={combineSections(passedProps.sections, sections)}
    />
  );

  if (!isRounded) {
    return (
      <div className="site-footer-makeswift" style={themeStyle}>
        <style dangerouslySetInnerHTML={{ __html: SITE_FOOTER_CONTENT_LAYOUT_CSS }} />
        {footer}
      </div>
    );
  }

  return (
    <div
      className={clsx('site-footer-makeswift', 'site-footer-makeswift__shell')}
      style={themeStyle}
    >
      <div className="shopify-section" id={SITE_FOOTER_SECTION_ID} style={themeStyle}>
        <style dangerouslySetInnerHTML={{ __html: SITE_FOOTER_ROUNDED_BOTTOM_CSS }} />
        {footer}
      </div>
    </div>
  );
};
