'use client';

import { clsx } from 'clsx';
import { useEffect, useRef, useState } from 'react';

import { initAccordionDetails } from '~/lib/archived-pages/accordion-details-element';

import {
  archiveAccordionDetailsProps,
  IconPlusAccordion,
  answerHtmlForRte,
} from '~/lib/makeswift/components/diabetes-care-faq/shared';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { resolveProductSingularSectionDomId } from '~/lib/makeswift/product-singular-page-section-id';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
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

export function ProductSingularDetails({
  className,
  instanceSuffix,
  sectionDomId,
  background,
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
  const rows: ProductSingularDetailsAccordion[] =
    (accordions ?? []).length > 0
      ? (accordions ?? [])
      : PRODUCT_SINGULAR_DETAILS_DEFAULT_ACCORDIONS;

  const sectionRef = useRef<HTMLDivElement>(null);
  const [accordionReady, setAccordionReady] = useState(false);

  useEffect(() => {
    setAccordionReady(true);
  }, []);

  useEffect(() => {
    if (!accordionReady || sectionRef.current == null) {
      return;
    }

    return initAccordionDetails(sectionRef.current);
  }, [accordionReady]);

  return (
    <div
      className={clsx('product-singular-details', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}
      data-accordion-hydration-pending={accordionReady ? undefined : ''}
      ref={sectionRef}
    >
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width relative">
            <div className="specifications with-background flex flex-col">
              <div className="accordions w-full">
                {rows.map((row, index) => {
                  const title = row.title?.trim() ?? `Section ${String(index + 1)}`;
                  const body = answerHtmlForRte(row.bodyHtml?.trim() ?? '');

                  return (
                    <div className="accordion" key={`product-details-acc-${String(index)}`}>
                      <details {...archiveAccordionDetailsProps(row.defaultOpen)}>
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
  );
}
