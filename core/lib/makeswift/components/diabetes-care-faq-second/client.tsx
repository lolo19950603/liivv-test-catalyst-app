'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';

import {
  answerHtmlForRte,
  buildFaqPageJsonLd,
  faqRowsResolved,
  IconPlusAccordion,
  type FaqRow,
} from '../diabetes-care-faq/shared';

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

    const entity = payload.mainEntity as unknown[];

    return entity.length > 0 ? payload : null;
  }, [rows]);

  return (
    <div className={clsx('diabetes-care-faq-second max-w-full overflow-x-hidden', className)}>
      <div className="shopify-section" id={FAQ_SECOND_SECTION_ID}>
        <style dangerouslySetInnerHTML={{ __html: FAQ_SECOND_ARCHIVE_STYLE }} />
        <div className="section section--padding section--plain">
          <div className="page-width relative">
            <div className="faqs with-background relative z-1 flex flex-col lg:flex-row">
              <div className="grow grid gap-8 md:gap-12">
                <div className="grid gap-4 text-left md:flex-row md:items-end">
                  <div className="title-wrapper grid gap-4 text-left leading-none md:flex-row md:items-end">
                    <h2 className="heading title-md">{headingText}</h2>
                  </div>
                </div>

                {rows.length === 0 ? (
                  <p className="text-contrast-500 py-6 subtext-md">
                    Add FAQ items in Makeswift (question + answer per row).
                  </p>
                ) : (
                  rows.map((row, index) => {
                    const html = answerHtmlForRte(row.answer ?? '');

                    return (
                      <div className="faq" key={`faq2-${String(index)}`}>
                        <div className="accordion">
                          <details className="details" {...{ is: 'accordion-details' }}>
                            <summary className="details__summary flex cursor-pointer items-center justify-between gap-2">
                              <span className="text-base font-medium leading-tight lg:text-lg xl:text-xl">
                                {row.question}
                              </span>
                              <IconPlusAccordion />
                            </summary>
                            <div
                              className="details__content rte text-base"
                              // eslint-disable-next-line react/no-danger -- trusted Makeswift-authored markup
                              dangerouslySetInnerHTML={{ __html: html }}
                            />
                          </details>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
        {jsonLd != null ? (
          <script
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            type="application/ld+json"
          />
        ) : null}
      </div>
    </div>
  );
}
