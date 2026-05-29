'use client';

import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import {
  IconPlusAccordion,
  answerHtmlForRte,
} from '~/lib/makeswift/components/diabetes-care-faq/shared';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { resolveProductSingularSectionDomId } from '~/lib/makeswift/product-singular-page-section-id';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  type BodyTextProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';

import { PRODUCT_SINGULAR_DETAILS_SECTION_ID, PRODUCT_SINGULAR_DETAILS_VARS } from './archive-styles';

export type ProductSingularDetailsAccordion = {
  title?: string;
  bodyHtml?: string;
  defaultOpen?: boolean;
};

export type ProductSingularDetailsProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  descriptionLabel?: string;
  descriptionHtml?: string;
  descriptionBody?: BodyTextProps & { bodyHtml?: string };
  accordions?: ProductSingularDetailsAccordion[];
  roundedTop?: boolean;
};

export const PRODUCT_SINGULAR_DETAILS_DEFAULT_ACCORDIONS: ProductSingularDetailsAccordion[] = [
  {
    title: 'Own Your Day',
    bodyHtml:
      '<p>Use this text to share information about your brand with your customers. Describe a product, share announcements, or welcome customers to your store.</p>',
    defaultOpen: true,
  },
  {
    title: 'Stay in Control',
    bodyHtml:
      '<p>Use this text to share information about your brand with your customers. Describe a product, share announcements, or welcome customers to your store.</p>',
  },
  {
    title: 'Effortless Routine',
    bodyHtml:
      '<p>Use this text to share information about your brand with your customers. Describe a product, share announcements, or welcome customers to your store.</p>',
  },
  {
    title: 'Your Life, Your Way',
    bodyHtml:
      '<p>Use this text to share information about your brand with your customers. Describe a product, share announcements, or welcome customers to your store.</p>',
  },
  {
    title: 'Confidence in the Details',
    bodyHtml:
      '<p>Use this text to share information about your brand with your customers. Describe a product, share announcements, or welcome customers to your store.</p>',
  },
];

const DEFAULT_DESCRIPTION_HTML =
  '<p>The Fisher &amp; Paykel Nova Nasal CPAP Mask is designed to provide a secure, comfortable seal with minimal noise and simple, intuitive fitting.</p>';

export function ProductSingularDetails({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  descriptionLabel = 'Product description',
  descriptionHtml,
  descriptionBody,
  accordions,
  roundedTop = true,
}: ProductSingularDetailsProps) {
  const resolvedSectionId = resolveProductSingularSectionDomId(
    sectionDomId ?? PRODUCT_SINGULAR_DETAILS_SECTION_ID,
    instanceSuffix,
  );
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: PRODUCT_SINGULAR_DETAILS_VARS,
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });
  const descriptionResolved =
    descriptionHtml?.trim() ??
    descriptionBody?.bodyHtml?.trim() ??
    DEFAULT_DESCRIPTION_HTML;
  const descriptionColor = resolveBodyTextColor(descriptionBody);
  const rows: ProductSingularDetailsAccordion[] =
    (accordions ?? []).length > 0
      ? (accordions ?? [])
      : PRODUCT_SINGULAR_DETAILS_DEFAULT_ACCORDIONS;

  const descriptionStyle: CSSProperties | undefined =
    descriptionColor != null ? { color: descriptionColor } : undefined;

  return (
    <div
      className={clsx('product-singular-details', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
    >
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width relative">
            <div className="specifications with-background flex flex-col lg:flex-row">
              <div className="flex grow flex-col items-start gap-8 lg:grid lg:grid-cols-2 lg:gap-14">
                <div className="sticky top-0 flex flex-col gap-1d5 lg:sticky">
                  <div className="heading flex items-center gap-2d5 text-base font-medium leading-none normal-case md:gap-3 md:text-lg">
                    {descriptionLabel}
                  </div>
                  <div
                    className="specification rte text-base"
                    dangerouslySetInnerHTML={{
                      __html: answerHtmlForRte(descriptionResolved),
                    }}
                    style={descriptionStyle}
                  />
                </div>

                <div className="accordions w-full">
                  {rows.map((row, index) => {
                    const title = row.title?.trim() ?? `Section ${String(index + 1)}`;
                    const body = answerHtmlForRte(row.bodyHtml?.trim() ?? '');

                    return (
                      <div className="accordion" key={`product-details-acc-${String(index)}`}>
                        <details
                          className="details"
                          open={row.defaultOpen === true}
                          {...{ is: 'accordion-details' }}
                        >
                          <summary className="details__summary flex cursor-pointer items-center justify-between gap-2">
                            <span className="heading flex items-center gap-2d5 text-base-xl font-medium leading-none md:gap-3">
                              {title}
                            </span>
                            <IconPlusAccordion />
                          </summary>
                          <div className="details__content rte text-base">
                            <div className="specification grid grid-cols-12 gap-6 md:gap-10">
                              <div
                                className="col-span-full"
                                dangerouslySetInnerHTML={{ __html: body }}
                              />
                            </div>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
