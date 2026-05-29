'use client';

import { clsx } from 'clsx';
import { useMemo, type CSSProperties, type FormEvent } from 'react';

import {
  buildFaqPageJsonLd,
  faqRowsResolvedStyled,
  IconPlusAccordion,
  type FaqRow,
} from '~/lib/makeswift/components/diabetes-care-faq/shared';
import { DC_SECTION_ROOT_CLASS } from '~/lib/makeswift/diabetes-care-mobile-classes';
import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';
import { resolveProductSingularSectionDomId } from '~/lib/makeswift/product-singular-page-section-id';
import { ARCHIVE_CREAM_BACKGROUND_CHANNELS } from '~/lib/makeswift/utils/diabetes-care-archive-theme';
import {
  buildSectionTheme,
  resolveBodyTextColor,
  resolveHeadingTypography,
  type BodyTextProps,
  type HeadingTypographyProps,
  type SectionBackgroundProps,
} from '~/lib/makeswift/utils/diabetes-care-section-style';

import { PRODUCT_SINGULAR_FAQ_SECTION_ID, PRODUCT_SINGULAR_FAQ_VARS } from './archive-styles';

export const PRODUCT_SINGULAR_FAQ_DEFAULT_ITEMS: FaqRow[] = [
  {
    question: { text: 'Do I need a diagnosis to shop here?' },
    answer: {
      bodyHtml:
        '<p>Not at all. Many people come here simply to explore everyday care products or support what they’re already experiencing. You don’t need a diagnosis, a label, or a specific reason to be here — just curiosity or a desire to feel supported.</p>',
    },
  },
  {
    question: { text: 'Are these just medical products?' },
    answer: {
      bodyHtml:
        '<p>Not at all. Many of the items here are everyday care products — things people use regularly to support comfort, balance, confidence, and wellness. Think practical, familiar, and thoughtfully chosen.</p>',
    },
  },
  {
    question: { text: 'Do you offer prescriptions or professional support?' },
    answer: {
      bodyHtml:
        '<p>If you’re looking for more support, we do offer access to consultations, treatments, and prescriptions where appropriate. These are always optional and handled with care, privacy, and respect.</p>',
    },
  },
  {
    question: { text: 'Can I talk to someone if I’m not sure what I need?' },
    answer: {
      bodyHtml:
        '<p>Absolutely. If you have questions, want reassurance, or just need help choosing between a few options, our care team is here. There’s no pressure to know what to ask — we’ll meet you where you are.</p>',
    },
  },
  {
    question: { text: 'How do I know what’s right for me?' },
    answer: {
      bodyHtml:
        '<p>You’re the expert on your own life. We’re here to offer options, guidance if you want it, and support along the way — but the choice is always yours.</p>',
    },
  },
];

export type ProductSingularFaqProps = {
  className?: string;
  instanceSuffix?: string;
  sectionDomId?: string;
  background?: SectionBackgroundProps;
  heading?: HeadingTypographyProps;
  introBody?: BodyTextProps & { bodyHtml?: string };
  items?: FaqRow[];
  contactHeading?: HeadingTypographyProps;
  contactBody?: BodyTextProps & { bodyHtml?: string };
  submitLabel?: string;
  roundedTop?: boolean;
};

export function ProductSingularFaq({
  className,
  instanceSuffix,
  sectionDomId,
  background,
  heading,
  introBody,
  items,
  contactHeading,
  contactBody,
  submitLabel = 'Send message',
  roundedTop = true,
}: ProductSingularFaqProps) {
  const resolvedSectionId = resolveProductSingularSectionDomId(
    sectionDomId ?? PRODUCT_SINGULAR_FAQ_SECTION_ID,
    instanceSuffix,
  );
  const headingResolved = resolveHeadingTypography(heading);
  const contactHeadingResolved = resolveHeadingTypography(contactHeading);
  const { sectionCss, sectionStyle } = buildSectionTheme({
    sectionId: resolvedSectionId,
    sectionCss: PRODUCT_SINGULAR_FAQ_VARS,
    background,
    defaultBackgroundChannels: ARCHIVE_CREAM_BACKGROUND_CHANNELS,
  });
  const introHtml = introBody?.bodyHtml?.trim() ?? '';
  const introColor = resolveBodyTextColor(introBody);
  const contactBodyHtml = contactBody?.bodyHtml?.trim() ?? '';
  const contactBodyColor = resolveBodyTextColor(contactBody);
  const rows = faqRowsResolvedStyled(
    (items ?? []).length > 0 ? items : PRODUCT_SINGULAR_FAQ_DEFAULT_ITEMS,
  );
  const headingText = headingResolved.text.length > 0 ? headingResolved.text : 'FAQs';
  const contactHeadingText =
    contactHeadingResolved.text.length > 0
      ? contactHeadingResolved.text
      : "Didn't find your answer?";

  const headingStyle =
    headingResolved.color != null || headingResolved.fontSize != null
      ? ({
          ...(headingResolved.color != null ? { color: headingResolved.color } : {}),
          ...(headingResolved.fontSize != null ? { fontSize: headingResolved.fontSize } : {}),
        } satisfies CSSProperties)
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  return (
    <div className={clsx('product-singular-faq', DC_SECTION_ROOT_CLASS, 'max-w-full', className)}>
      <div className="shopify-section" id={resolvedSectionId} style={sectionStyle}>
        <style dangerouslySetInnerHTML={{ __html: sectionCss }} />
        <div
          className={clsx(
            'section section--padding section--plain',
            roundedTop && 'section--rounded',
          )}
        >
          <div className="page-width relative">
            <div className="faqs with-background relative z-[1] flex flex-col lg:flex-row">
              <div className="grid grow gap-8 md:gap-12">
                <div className="grid gap-4 text-left md:flex-row md:items-end">
                  <div className="title-wrapper grid gap-4 text-left leading-none md:flex-row md:items-end">
                    <h2 className="heading title-lg tracking-heading" style={headingStyle}>
                      <SplitWordsHeading text={headingText} />
                    </h2>
                    {introHtml.length > 0 ? (
                      <div
                        className="page-width--narrow rte text-sm leading-normal xl:text-base"
                        dangerouslySetInnerHTML={{ __html: introHtml }}
                        style={introColor != null ? { color: introColor } : undefined}
                      />
                    ) : null}
                  </div>
                </div>

                <div className="faq">
                  {rows.map((row, index) => (
                    <div className="accordion" key={`product-faq-${String(index)}`}>
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
              </div>

              <form
                className="grow-0"
                method="post"
                action="/contact"
                onSubmit={onSubmit}
              >
                <div className="contact__sidebar sticky top-0 grid gap-7d5 md:gap-10 lg:sticky">
                  <div className="flex justify-between gap-6">
                    <div className="grid gap-2d5">
                      <p className="heading text-2xl leading-none tracking-tight lg:text-3xl">
                        {contactHeadingText}
                      </p>
                      {contactBodyHtml.length > 0 ? (
                        <div
                          className="text-opacity rte text-base"
                          dangerouslySetInnerHTML={{ __html: contactBodyHtml }}
                          style={
                            contactBodyColor != null ? { color: contactBodyColor } : undefined
                          }
                        />
                      ) : null}
                    </div>
                  </div>

                  <div className="grid gap-4d5 md:gap-6">
                    <div className="field">
                      <input
                        autoComplete="name"
                        className="input is-floating"
                        id={`${resolvedSectionId}-contact-name`}
                        name="contact[Name]"
                        placeholder="Name"
                        type="text"
                      />
                      <label
                        className="label is-floating"
                        htmlFor={`${resolvedSectionId}-contact-name`}
                      >
                        Name
                      </label>
                    </div>
                    <div className="field">
                      <input
                        autoComplete="email"
                        className="input is-floating"
                        id={`${resolvedSectionId}-contact-email`}
                        name="contact[email]"
                        placeholder="Email"
                        required
                        spellCheck={false}
                        type="email"
                      />
                      <label
                        className="label is-floating"
                        htmlFor={`${resolvedSectionId}-contact-email`}
                      >
                        Email
                      </label>
                    </div>
                    <div className="field">
                      <textarea
                        className="textarea is-floating"
                        id={`${resolvedSectionId}-contact-message`}
                        name="contact[Message]"
                        placeholder=" "
                        rows={4}
                      />
                      <label
                        className="label is-floating"
                        htmlFor={`${resolvedSectionId}-contact-message`}
                      >
                        Message
                      </label>
                    </div>
                    <div className="field">
                      <button
                        className="button button--primary button--fixed"
                        type="submit"
                        {...{ is: 'hover-button' }}
                      >
                        <span className="btn-fill" data-fill="" />
                        <span className="btn-text">{submitLabel}</span>
                        <span className="btn-loader">
                          <span />
                          <span />
                          <span />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
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
