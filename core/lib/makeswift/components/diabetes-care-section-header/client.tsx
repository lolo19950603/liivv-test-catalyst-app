'use client';

import { clsx } from 'clsx';

import { LiivvArchiveHeader } from '~/lib/makeswift/liivv-archive-header/liivv-archive-header';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import {
  DIABETES_CARE_HEADER_SECTION_ID,
} from './archive-styles';

export interface DiabetesCareSectionNavLink {
  label: string;
  link: { href: string };
}

export interface DiabetesCareSectionHeaderProps {
  className?: string;
  showLogo?: boolean;
  logoImage?: string;
  logoAlt?: string;
  logoLink?: { href?: string };
  navLinks: DiabetesCareSectionNavLink[];
  showUtilityIcons?: boolean;
  searchPlaceholder?: string;
}

export function DiabetesCareSectionHeader({
  className,
  showLogo = true,
  logoImage,
  logoAlt = 'Liivv',
  logoLink,
  navLinks,
  showUtilityIcons = true,
  searchPlaceholder = 'Search products',
}: DiabetesCareSectionHeaderProps) {
  const links = (navLinks ?? []).map((item) => ({
    label: item.label,
    href: resolveMakeswiftHref(item.link.href, '/'),
  }));

  return (
    // Pin-on-scroll uses native CSS `position: sticky` via the
    // `.header-sticky` class baked into the archived theme CSS — no JS
    // scroll listener, no fixed-position fallback, no spacer required.
    // `header-sticky` provides `position: sticky; top: 0; z-index: 20`.
    // Always applied: the section header is fixed to stick on top.
    <LiivvArchiveHeader
      className={clsx(className, 'header-sticky')}
      logo={
        showLogo && logoImage
          ? {
              src: logoImage,
              alt: logoAlt,
              href: logoLink?.href,
            }
          : null
      }
      navAriaLabel="Specialized page"
      navLinks={links}
      searchPlaceholder={searchPlaceholder}
      sectionId={DIABETES_CARE_HEADER_SECTION_ID}
      showLogo={showLogo}
      showUtilityIcons={showUtilityIcons}
      withPinSpacer={false}
    />
  );
}
