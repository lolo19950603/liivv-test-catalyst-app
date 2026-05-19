'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';

import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

import {
  answerHtmlForRte,
  buildFaqPageJsonLd,
  type FaqRow,
  faqRowsResolved,
  IconPlusAccordion,
} from '../diabetes-care-faq/shared';

import { FAQ_FIRST_ARCHIVE_STYLE, FAQ_FIRST_SECTION_ID } from './archive-styles';

export interface DiabetesCareFaqFirstProps {
  className?: string;
  heading?: string;
  intro?: string;
  items?: FaqRow[];
}

export function DiabetesCareFaqFirst({
  className,
  heading,
  intro,
  items,
}: DiabetesCareFaqFirstProps) {
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

    const entity = payload.mainEntity;

    return Array.isArray(entity) && entity.length > 0 ? payload : null;
  }, [rows]);

  return (
    <div className={clsx('diabetes-care-faq-first max-w-full overflow-x-hidden', className)}>
      <div className="shopify-section" id={FAQ_FIRST_SECTION_ID}>
        <style dangerouslySetInnerHTML={{ __html: FAQ_FIRST_ARCHIVE_STYLE }} />
        <div className="section section--padding">
          <div className="page-width page-width--narrow relative">
            <div className="title-wrapper z-1 relative flex flex-col gap-4 text-left leading-none md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4">
                <h2 className="heading title-md">
                  <SplitWordsHeading text={headingText} />
                </h2>
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

            <ScrollReveal className="faqs with-border z-1 relative flex flex-col lg:flex-row" delayMs={80}>
              <div className="grid grow gap-8 md:gap-12">
                {rows.length === 0 ? (
                  <p className="subtext-md py-6 text-contrast-500">
                    Add FAQ items in Makeswift (question + answer per row).
                  </p>
                ) : (
                  <div className="faq">
                    {rows.map((row, index) => {
                      const html = answerHtmlForRte(row.answer ?? '');

                      return (
                        <div className="accordion" key={`faq1-${String(index)}`}>
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
              </div>
            </ScrollReveal>
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
