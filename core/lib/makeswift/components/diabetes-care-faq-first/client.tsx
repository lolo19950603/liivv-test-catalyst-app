'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';

import {
  answerHtmlForRte,
  buildFaqPageJsonLd,
  faqRowsResolved,
  headingWithLastWordHighlight,
  IconPlusAccordion,
  type FaqRow,
} from '../diabetes-care-faq/shared';

import { FAQ_FIRST_ARCHIVE_STYLE, FAQ_FIRST_SECTION_ID } from './archive-styles';

export interface DiabetesCareFaqFirstProps {
  className?: string;
  heading?: string;
  intro?: string;
  items?: FaqRow[];
}

export function DiabetesCareFaqFirst({ className, heading, intro, items }: DiabetesCareFaqFirstProps) {
  const rows = faqRowsResolved(items);
  const headingText = heading?.trim() ?? 'Support, Wherever You Are';
  const introText = intro?.trim() ?? '';

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
    <div className={clsx('diabetes-care-faq-first max-w-full overflow-x-hidden', className)}>
      <div className="shopify-section" id={FAQ_FIRST_SECTION_ID}>
        <style dangerouslySetInnerHTML={{ __html: FAQ_FIRST_ARCHIVE_STYLE }} />
        <div className="section section--padding">
          <div className="page-width page-width--narrow relative">
            <div className="title-wrapper relative z-1 flex flex-col gap-4 text-left leading-none md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4">
                <h2 className="heading title-md">{headingWithLastWordHighlight(headingText)}</h2>
                {introText.length > 0 ? (
                  <div className="description rte subtext-md leading-normal">
                    {introText
                      .split(/\n+/)
                      .map((p) => p.trim())
                      .filter((p) => p.length > 0)
                      .map((p, i) => (
                        <p key={`intro-${String(i)}`}>{p}</p>
                      ))}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="faqs with-border relative z-1 flex flex-col lg:flex-row">
              <div className="grow grid gap-8 md:gap-12">
                {rows.length === 0 ? (
                  <p className="text-contrast-500 py-6 subtext-md">
                    Add FAQ items in Makeswift (question + answer per row).
                  </p>
                ) : (
                  rows.map((row, index) => {
                    const html = answerHtmlForRte(row.answer ?? '');

                    return (
                      <div className="faq" key={`faq1-${String(index)}`}>
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
