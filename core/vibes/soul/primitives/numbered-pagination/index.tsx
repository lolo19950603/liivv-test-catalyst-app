'use client';

import { ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createSerializer, parseAsInteger, parseAsString } from 'nuqs';
import { Suspense } from 'react';

import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { Link } from '~/components/link';

import { buildPageRange } from './build-page-range';
import './numbered-pagination.css';

export interface NumberedPaginationInfo {
  currentPage: number;
  totalPages: number;
  pageParamName?: string;
}

interface Props {
  label?: Streamable<string | null>;
  info: Streamable<NumberedPaginationInfo>;
  nextLabel?: Streamable<string | null>;
  scroll?: boolean;
}

export function NumberedPagination(props: Props) {
  return (
    <Suspense fallback={<NumberedPaginationSkeleton />}>
      <NumberedPaginationResolved {...props} />
    </Suspense>
  );
}

function NumberedPaginationResolved({
  label: streamableLabel,
  info,
  nextLabel: streamableNextLabel,
  scroll,
}: Props) {
  const label = useStreamable(streamableLabel) ?? 'Pagination';
  const nextLabel = useStreamable(streamableNextLabel) ?? 'Next';
  const { currentPage, totalPages, pageParamName = 'page' } = useStreamable(info);
  const searchParams = useSearchParams();
  const serialize = createSerializer({
    [pageParamName]: parseAsInteger,
    before: parseAsString,
    after: parseAsString,
  });

  if (totalPages <= 1) {
    return null;
  }

  const pageRange = buildPageRange(currentPage, totalPages);
  const hasNextPage = currentPage < totalPages;

  return (
    <nav aria-label={label} className="liivv-numbered-pagination" role="navigation">
      <ol className="liivv-numbered-pagination__pages">
        {pageRange.map((item, index) => {
          if (item === 'ellipsis') {
            return (
              <li key={`ellipsis-${index}`}>
                <span aria-hidden className="liivv-numbered-pagination__ellipsis">
                  …
                </span>
              </li>
            );
          }

          const isActive = item === currentPage;

          return (
            <li key={item}>
              {isActive ? (
                <span aria-current="page" className="liivv-numbered-pagination__page is-active">
                  {item}
                </span>
              ) : (
                <Link
                  className="liivv-numbered-pagination__page"
                  href={serialize(searchParams, {
                    [pageParamName]: item,
                    before: null,
                    after: null,
                  })}
                  scroll={scroll}
                >
                  {item}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
      {hasNextPage ? (
        <Link
          className="liivv-numbered-pagination__nav"
          href={serialize(searchParams, {
            [pageParamName]: currentPage + 1,
            before: null,
            after: null,
          })}
          scroll={scroll}
        >
          {nextLabel}
          <ArrowRight aria-hidden className="liivv-numbered-pagination__nav-icon" size={16} />
        </Link>
      ) : (
        <span aria-disabled className="liivv-numbered-pagination__nav">
          {nextLabel}
          <ArrowRight aria-hidden className="liivv-numbered-pagination__nav-icon" size={16} />
        </span>
      )}
    </nav>
  );
}

export function NumberedPaginationSkeleton() {
  return (
    <div aria-hidden className="liivv-numbered-pagination">
      <div className="h-8 w-48 animate-pulse rounded-full bg-contrast-100" />
    </div>
  );
}
