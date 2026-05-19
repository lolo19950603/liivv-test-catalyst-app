import type { ReactNode } from 'react';

import { SplitWordsHeading } from '~/lib/makeswift/diabetes-care-scroll-animate';

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

export function headingWithLastWordHighlight(heading: string): ReactNode {
  return <SplitWordsHeading highlightLastWord text={heading} />;
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

export interface FaqRow {
  question?: string;
  answer?: string;
}

export function faqRowsResolved(rows?: FaqRow[]): FaqRow[] {
  if (rows == null || rows.length === 0) {
    return [];
  }

  return rows
    .map((r) => ({
      question: r.question?.trim() ?? '',
      answer: r.answer?.trim() ?? '',
    }))
    .filter((r) => r.question.length > 0 && r.answer.length > 0);
}
