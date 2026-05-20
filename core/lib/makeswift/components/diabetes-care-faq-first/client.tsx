'use client';

import { clsx } from 'clsx';
import { useMemo } from 'react';

import { AccentSplitWordsHeading, ScrollReveal } from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';

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
  background?: SectionBackgroundProps;
  heading?: HeadingWithHighlightProps;
  intro?: { text?: string };
  items?: FaqRow[];
  bodyText?: BodyTextProps;
}

export function DiabetesCareFaqFirst({
  className,
  background,
  heading,
  intro,
  items,
  bodyText,
}: DiabetesCareFaqFirstProps) {
  const headingResolved = resolveHeadingTypography(heading);
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: FAQ_FIRST_SECTION_ID,
    sectionCss: FAQ_FIRST_ARCHIVE_STYLE,
    background,
    highlight: heading,
  });
  const bodyColor = resolveBodyTextColor(bodyText);
  const rows = faqRowsResolved(items);
  const headingText =
    headingResolved.text.length > 0 ? headingResolved.text : 'Support, Wherever You Are';
  const introText = intro?.text?.trim() ?? '';
  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? {
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        }
      : undefined;

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
      <div className="shopify-section" id={FAQ_FIRST_SECTION_ID} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className="section section--padding">
          <div className="page-width page-width--narrow relative">
            <div className="title-wrapper z-1 relative flex flex-col gap-4 text-left leading-none md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4">
                <h2 className="heading title-md" style={headingStyle}>
                  <AccentSplitWordsHeading accentColors={heading} text={headingText} />
                </h2>
                {introText.length > 0 ? (
                  <div
                    className="description rte subtext-md leading-normal"
                    style={bodyColor != null ? { color: bodyColor } : undefined}
                  >
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
