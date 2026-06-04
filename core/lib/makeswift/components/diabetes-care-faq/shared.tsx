import type { CSSProperties, ReactNode } from 'react';

import { AccentSplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate/accent-split-words-heading';
import { resolveBodyTextColor } from '~/lib/makeswift/utils/diabetes-care-section-style';
import type { HeadingAccentColorProps } from '~/lib/makeswift/utils/heading-accent-color';
import { resolveHeadingFontSizeCss } from '~/lib/makeswift/utils/heading-font-size';

/** Props for archive `<details is="accordion-details">` (SSR + client must match for hydration). */
export function archiveAccordionDetailsProps(defaultOpen?: boolean) {
  const isOpen = defaultOpen === true;

  return {
    className: 'details' as const,
    ...(isOpen ? { open: true as const } : {}),
    'aria-expanded': isOpen ? ('true' as const) : ('false' as const),
    is: 'accordion-details',
    suppressHydrationWarning: true as const,
  };
}

export function IconPlusAccordion() {
  return (
    <svg
      className="icon icon-plus-2 icon-xs shrink-0"
      fill="none"
      role="presentation"
      stroke="currentColor"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M7 1V13M13 7H1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function highlightedLastWord(word: string): ReactNode {
  return (
    <em
      className="highlighted-text animated relative not-italic"
      data-style="half_text"
      {...{ is: 'highlighted-text' }}
    >
      {word}
    </em>
  );
}

export function headingWithLastWordHighlight(
  heading: string,
  accentColors?: HeadingAccentColorProps,
): ReactNode {
  return (
    <AccentSplitWordsHeading accentColors={accentColors} highlightLastWord text={heading} />
  );
}

/** Strip tags for FAQPage JSON-LD `text` fields. */
export function stripHtmlToPlain(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeAnswerHtml(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

export function answerHtmlForRte(raw: string): string {
  const t = raw.trim();

  if (t.length === 0) {
    return '';
  }

  if (/<[a-z][\s\S]*>/i.test(t)) {
    return sanitizeAnswerHtml(t);
  }

  return t
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${escapeHtml(p)}</p>`)
    .join('');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildFaqPageJsonLd(
  items: Array<{ question: string; answerHtml: string }>,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items
      .map((row) => {
        const name = row.question.trim();
        const text = stripHtmlToPlain(row.answerHtml);

        if (name.length === 0 || text.length === 0) {
          return null;
        }

        return {
          '@type': 'Question',
          name,
          acceptedAnswer: {
            '@type': 'Answer',
            text,
          },
        };
      })
      .filter((x): x is NonNullable<typeof x> => x != null),
  };
}

export type FaqQuestionProps = {
  text?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export type FaqAnswerProps = {
  bodyHtml?: string;
  textColor?: string;
  textColorHex?: string;
  fontSize?: number;
  fontSizeMobile?: number;
};

export interface FaqRow {
  /** Plain string or Makeswift popover group with `text`. */
  question?: string | FaqQuestionProps;
  /** Plain string/HTML or Makeswift popover group with `bodyHtml`. */
  answer?: string | FaqAnswerProps;
}

export function faqQuestionText(question?: FaqRow['question']): string {
  if (question == null) {
    return '';
  }

  if (typeof question === 'string') {
    return question.trim();
  }

  return question.text?.trim() ?? '';
}

export function faqAnswerText(answer?: FaqRow['answer']): string {
  if (answer == null) {
    return '';
  }

  if (typeof answer === 'string') {
    return answer.trim();
  }

  return answer.bodyHtml?.trim() ?? '';
}

export function faqRowsResolved(rows?: FaqRow[]): Array<{ question: string; answer: string }> {
  if (rows == null || rows.length === 0) {
    return [];
  }

  return rows
    .map((r) => ({
      question: faqQuestionText(r.question),
      answer: faqAnswerText(r.answer),
    }))
    .filter((r) => r.question.length > 0 && r.answer.length > 0);
}

export type FaqResolvedRow = {
  question: string;
  answerHtml: string;
  questionStyle?: CSSProperties;
  answerStyle?: CSSProperties;
};

export function faqTypographyStyle(
  props?: FaqQuestionProps | FaqAnswerProps | null,
): CSSProperties | undefined {
  const color = resolveBodyTextColor(props);
  const fontSize = resolveHeadingFontSizeCss(props?.fontSize, props?.fontSizeMobile);

  if (color == null && fontSize == null) {
    return undefined;
  }

  return {
    ...(color != null ? { color } : {}),
    ...(fontSize != null ? { fontSize } : {}),
  };
}

function resolveFaqStyledRow(row: FaqRow): FaqResolvedRow | null {
  const questionText = faqQuestionText(row.question);
  const answerRaw = faqAnswerText(row.answer);
  const questionStyle =
    typeof row.question === 'object' && row.question != null
      ? faqTypographyStyle(row.question)
      : undefined;
  const answerStyle =
    typeof row.answer === 'object' && row.answer != null
      ? faqTypographyStyle(row.answer)
      : undefined;

  if (questionText.length === 0 || answerRaw.length === 0) {
    return null;
  }

  return {
    question: questionText,
    answerHtml: answerHtmlForRte(answerRaw),
    questionStyle,
    answerStyle,
  };
}

export function faqRowsResolvedStyled(rows?: FaqRow[]): FaqResolvedRow[] {
  if (rows == null || rows.length === 0) {
    return [];
  }

  return rows
    .map((row) => resolveFaqStyledRow(row))
    .filter((row): row is FaqResolvedRow => row != null);
}
