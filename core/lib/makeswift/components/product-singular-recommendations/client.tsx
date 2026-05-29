'use client';

import { clsx } from 'clsx';

import { MSProductsCarousel } from '~/lib/makeswift/components/products-carousel/client';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { highlightedLastWord } from '~/lib/makeswift/components/diabetes-care-faq/shared';
import { resolveProductSingularSectionDomId } from '~/lib/makeswift/product-singular-page-section-id';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveHeadingTypography,
  type HeadingTypographyProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';

import {
  PRODUCT_SINGULAR_RECOMMENDATIONS_SECTION_ID,
  PRODUCT_SINGULAR_RECOMMENDATIONS_VARS,
} from './archive-styles';

export type ProductSingularRecommendationsProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  heading?: HeadingTypographyProps;
  collection?: 'none' | 'best-selling' | 'newest' | 'featured';
  limit?: number;
  additionalProducts?: Array<{ entityId?: string; title?: string }>;
  roundedTop?: boolean;
};

function splitHeadingForHighlight(text: string): { lead: string; last: string } {
  const trimmed = text.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length <= 1) {
    return { lead: '', last: trimmed };
  }

  return {
    lead: `${parts.slice(0, -1).join(' ')} `,
    last: parts[parts.length - 1] ?? '',
  };
}

export function ProductSingularRecommendations({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  heading,
  collection = 'best-selling',
  limit = 6,
  additionalProducts = [],
  roundedTop = true,
}: ProductSingularRecommendationsProps) {
  const resolvedSectionId = resolveProductSingularSectionDomId(
    sectionDomId ?? PRODUCT_SINGULAR_RECOMMENDATIONS_SECTION_ID,
    instanceSuffix,
  );
  const headingResolved = resolveHeadingTypography(heading);
  const headingText =
    headingResolved.text.length > 0 ? headingResolved.text : 'You may also like';
  const { lead, last } = splitHeadingForHighlight(headingText);
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: PRODUCT_SINGULAR_RECOMMENDATIONS_VARS,
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;

  return (
    <div
      className={clsx(
        'product-singular-recommendations recommendations-section',
        DC_SECTION_ROOT_CLASS,
        'max-w-full',
        className,
      )}
    >
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="related-products block">
          <div
            className={clsx(
              'section section--padding relative',
              roundedTop && 'section--rounded',
            )}
          >
            <div className="page-width relative overflow-hidden md:overflow-visible">
              <div className="title-wrapper relative z-[1] mb-8 flex flex-col gap-4 text-left md:flex-row md:items-end md:justify-between lg:gap-8">
                <div className="grid gap-4">
                  <h2 className="heading title-md" style={headingStyle}>
                    {lead}
                    {highlightedLastWord(last)}
                  </h2>
                </div>
              </div>

              <MSProductsCarousel
                additionalProducts={additionalProducts}
                aspectRatio="1:1"
                className=""
                collection={collection}
                colorScheme="dark"
                hideOverflow={false}
                limit={limit}
                showButtons
                showScrollbar={false}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
