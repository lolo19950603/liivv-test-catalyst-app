'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';

import {
  answerHtmlForRte,
  buildFaqPageJsonLd,
  type FaqRow,
  faqRowsResolved,
  IconPlusAccordion,
} from '../diabetes-care-faq/shared';

import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

import { FAQ_SECOND_ARCHIVE_STYLE, FAQ_SECOND_SECTION_ID } from './archive-styles';

export interface DiabetesCareFaqSecondProps {
  className?: string;
  heading?: string;
  items?: FaqRow[];
}

export function DiabetesCareFaqSecond({ className, heading, items }: DiabetesCareFaqSecondProps) {
  const rows = faqRowsResolved(items);
  const headingText = heading?.trim() ?? 'We Thought You Might Ask';

  const jsonLd = useMemo(() => {
    if (rows.length === 0) {
      return null;
    }

    const payload = buildFaqPageJsonLd(
      rows.map((r) => ({
        question: r.question ?? '',
        answerHtml: answerHtmlForRte(r.answer ?? ''),
      })),
    );

    const entity = payload.mainEntity;

    return Array.isArray(entity) && entity.length > 0 ? payload : null;
  }, [rows]);

  return (
    <div className={clsx('diabetes-care-faq-second max-w-full overflow-x-hidden', className)}>
      <div className="shopify-section" id={FAQ_SECOND_SECTION_ID}>
        <style dangerouslySetInnerHTML={{ __html: FAQ_SECOND_ARCHIVE_STYLE }} />
        <div className="section section--padding section--plain">
          <div className="page-width relative">
            <div className="faqs with-background z-1 relative flex flex-col lg:flex-row">
              <div className="grid grow gap-8 md:gap-12">
                <div className="grid gap-4 text-left md:flex-row md:items-end">
                  <div className="title-wrapper grid gap-4 text-left leading-none md:flex-row md:items-end">
                    <h2 className="heading title-md">
                      <SplitWordsHeading text={headingText} />
                    </h2>
                  </div>
                </div>

                <ScrollReveal delayMs={80}>
                {rows.length === 0 ? (
                  <p className="subtext-md py-6 text-contrast-500">
                    Add FAQ items in Makeswift (question + answer per row).
                  </p>
                ) : (
                  <div className="faq">
                    {rows.map((row, index) => {
                      const html = answerHtmlForRte(row.answer ?? '');

                      return (
                        <div className="accordion" key={`faq2-${String(index)}`}>
                          <details className="details" {...{ is: 'accordion-details' }}>
                            <summary className="details__summary flex cursor-pointer items-center justify-between gap-2">
                              <span className="text-base font-medium leading-tight lg:text-lg xl:text-xl">
                                {row.question}
                              </span>
                              <IconPlusAccordion />
                            </summary>
                            <div
                              className="details__content rte text-base"
                              dangerouslySetInnerHTML={{ __html: html }}
                            />
                          </details>
                        </div>
                      );
                    })}
                  </div>
                )}
                </ScrollReveal>
              </div>
            </div>
          </div>
        </div>
        {jsonLd != null ? (
          <script
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            type="application/ld+json"
          />
        ) : null}
      </div>
    </div>
  );
}
