'use client';

import { clsx } from 'clsx';
import { useMemo, type CSSProperties } from 'react';

import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { ScrollReveal, SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingWithHighlightProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';

import {
  answerHtmlForRte,
  buildFaqPageJsonLd,
  type FaqRow,
  faqRowsResolvedStyled,
  IconPlusAccordion,
} from '../diabetes-care-faq/shared';

import { FAQ_FIRST_ARCHIVE_STYLE, FAQ_FIRST_SECTION_ID } from './archive-styles';

export type FaqFirstIntroBodyProps = BodyTextProps & {
  bodyHtml?: string;
};

export interface DiabetesCareFaqFirstProps {
  className?: string;
  background?: SectionBackgroundProps;
  roundedTop?: boolean;
  heading?: HeadingWithHighlightProps;
  introBody?: FaqFirstIntroBodyProps;
  /** @deprecated Use `introBody.bodyHtml`. */
  intro?: { text?: string };
  items?: FaqRow[];
  /** @deprecated Use `introBody` popover colors. */
  bodyText?: BodyTextProps;
}

function resolveIntroBody(props: {
  introBody?: FaqFirstIntroBodyProps;
  intro?: { text?: string };
  bodyText?: BodyTextProps;
}): { html: string; style: CSSProperties | undefined } {
  const group = props.introBody;

  if (group != null && typeof group === 'object') {
    const html = answerHtmlForRte(group.bodyHtml?.trim() ?? '');
    const color = resolveBodyTextColor(group);
    const fontSize = resolveHeadingFontSizeCss(group.fontSize, group.fontSizeMobile);

    return {
      html,
      style:
        color != null || fontSize != null
          ? {
              ...(color != null ? { color } : {}),
              ...(fontSize != null ? { fontSize } : {}),
            }
          : undefined,
    };
  }

  const legacyText = props.intro?.text?.trim() ?? '';
  const legacyColor = resolveBodyTextColor(props.bodyText);

  return {
    html: answerHtmlForRte(legacyText),
    style: legacyColor != null ? { color: legacyColor } : undefined,
  };
}

export function DiabetesCareFaqFirst({
  className,
  background,
  roundedTop = true,
  heading,
  introBody,
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
  const introResolved = resolveIntroBody({ introBody, intro, bodyText });
  const rows = faqRowsResolvedStyled(items);
  const headingText =
    headingResolved.text.length > 0 ? headingResolved.text : 'Support, Wherever You Are';
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
        question: r.question,
        answerHtml: r.answerHtml,
      })),
    );

    const entity = payload.mainEntity;

    return Array.isArray(entity) && entity.length > 0 ? payload : null;
  }, [rows]);

  return (
    <div className={clsx('diabetes-care-faq-first', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={FAQ_FIRST_SECTION_ID} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div className={clsx('section section--padding', roundedTop && 'section--rounded')}>
          <div className="page-width page-width--narrow relative px-4 sm:px-5 md:px-0">
            <div className="title-wrapper z-1 relative flex flex-col gap-4 text-left leading-none md:flex-row md:items-end md:justify-between lg:gap-8">
              <div className="grid gap-4">
                <h2 className="heading title-md" style={headingStyle}>
                  <SplitWordsHeading text={headingText} />
                </h2>
                {introResolved.html.length > 0 ? (
                  <div
                    className="description rte subtext-md leading-normal"
                    dangerouslySetInnerHTML={{ __html: introResolved.html }}
                    style={introResolved.style}
                  />
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
                    {rows.map((row, index) => (
                        <div className="accordion" key={`faq1-${String(index)}`}>
                          <details className="details" {...{ is: 'accordion-details' }}>
                            <summary className="details__summary flex cursor-pointer items-center justify-between gap-2">
                              <span
                                className="text-base font-medium leading-tight lg:text-lg xl:text-xl"
                                style={row.questionStyle}
                              >
                                {row.question}
                              </span>
                              <IconPlusAccordion />
                            </summary>
                            <div
                              className="details__content rte text-base"
                              dangerouslySetInnerHTML={{ __html: row.answerHtml }}
                              style={row.answerStyle}
                            />
                          </details>
                        </div>
                      ))}
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
