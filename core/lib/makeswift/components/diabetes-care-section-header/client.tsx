'use client';

import { useRef } from 'react';

import { LiivvArchiveHeader } from '~/lib/makeswift/liivv-archive-header/liivv-archive-header';
import { resolveMakeswiftHref } from '~/lib/makeswift/utils/resolve-makeswift-href';

import {
  DIABETES_CARE_HEADER_SECTION_ID,
} from './archive-styles';
import { useSectionHeaderPinAfterSlideshow } from './use-section-header-pin-after-slideshow';

export interface DiabetesCareSectionNavLink {
  label: string;
  link: { href: string };
}

export interface DiabetesCareSectionHeaderProps {
  className?: string;
  sticky?: boolean;
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
  sticky = true,
  showLogo = true,
  logoImage,
  logoAlt = 'Liivv',
  logoLink,
  navLinks,
  showUtilityIcons = true,
  searchPlaceholder = 'Search products',
}: DiabetesCareSectionHeaderProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);

  useSectionHeaderPinAfterSlideshow(sectionRef, spacerRef, sticky);

  const links = (navLinks ?? []).map((item) => ({
    label: item.label,
    href: resolveMakeswiftHref(item.link.href, '/'),
  }));

  return (
    <LiivvArchiveHeader
      className={className}
      logo={
        showLogo && logoImage
          ? {
              src: logoImage,
              alt: logoAlt,
              href: logoLink?.href,
            }
          : null
      }
      navAriaLabel="Diabetes care"
      navLinks={links}
      searchPlaceholder={searchPlaceholder}
      sectionId={DIABETES_CARE_HEADER_SECTION_ID}
      sectionRef={sectionRef}
      showLogo={showLogo}
      showUtilityIcons={showUtilityIcons}
      spacerRef={spacerRef}
      withPinSpacer={sticky}
    />
  );
}
