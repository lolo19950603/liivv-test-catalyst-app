'use client';

import { clsx } from 'clsx';
import { useEffect, useState } from 'react';

import type { DiabetesCareSectionSuffix } from '~/lib/archived-pages/diabetes-care-section-allowlist';

export interface DiabetesCareSectionArchiveProps {
  section: DiabetesCareSectionSuffix;
  className?: string;
  hidden?: boolean;
  ariaLabel?: string;
  footnote?: string;
}

export function DiabetesCareSectionArchive({
  section,
  className,
  hidden = false,
  ariaLabel = '',
  footnote = '',
}: DiabetesCareSectionArchiveProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    setHtml(null);
    setError(null);

    const load = async () => {
      try {
        const response = await fetch(`/api/archive/diabetes-care/${encodeURIComponent(section)}`, {
          cache: 'force-cache',
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const text = await response.text();

        if (!cancelled) {
          setHtml(text);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : 'Failed to load section');
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [section]);

  if (hidden) {
    return null;
  }

  const resolvedLabel = ariaLabel.trim().length > 0 ? ariaLabel.trim() : undefined;
  const footnoteText = footnote.trim();

  return (
    <section
      aria-label={resolvedLabel}
      className={clsx('diabetes-care-section-archive', className)}
    >
      {error !== null ? (
        <p className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-900">
          {error}
        </p>
      ) : null}
      {html === null && error === null ? (
        <div aria-hidden className="min-h-[120px] animate-pulse rounded-md bg-zinc-100" />
      ) : null}
      {html !== null ? <div dangerouslySetInnerHTML={{ __html: html }} /> : null}
      {footnoteText.length > 0 ? (
        <p className="mx-auto mt-6 max-w-3xl px-4 text-center text-sm text-zinc-600">
          {footnoteText}
        </p>
      ) : null}
    </section>
  );
}
