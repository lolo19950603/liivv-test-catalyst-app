'use client';

import { clsx } from 'clsx';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { createSerializer, parseAsString } from 'nuqs';
import { Suspense } from 'react';

import { Streamable, useStreamable } from '@/vibes/soul/lib/streamable';
import { resolveButtonAppearance } from '~/lib/store-theme/archive-button-maps';
import { useStoreTheme } from '~/lib/store-theme/store-theme';
import { Link } from '~/components/link';

export interface CursorPaginationInfo {
  startCursorParamName?: string;
  startCursor?: string | null;
  endCursorParamName?: string;
  endCursor?: string | null;
}

interface Props {
  label?: Streamable<string | null>;
  info: Streamable<CursorPaginationInfo>;
  previousLabel?: Streamable<string | null>;
  nextLabel?: Streamable<string | null>;
  scroll?: boolean;
  variant?: 'default' | 'archive' | 'inherit';
}

export function CursorPagination(props: Props) {
  return (
    <Suspense fallback={<CursorPaginationSkeleton />}>
      <CursorPaginationResolved {...props} />
    </Suspense>
  );
}

function CursorPaginationResolved({
  label: streamableLabel,
  info,
  previousLabel: streamablePreviousLabel,
  nextLabel: streamableNextLabel,
  scroll,
  variant = 'inherit',
}: Props) {
  const storeTheme = useStoreTheme();
  const resolvedVariant = resolveButtonAppearance(
    variant === 'inherit' ? undefined : variant,
    storeTheme.paginationVariant,
  );
  const label = useStreamable(streamableLabel) ?? 'pagination';
  const {
    startCursorParamName = 'before',
    endCursorParamName = 'after',
    startCursor,
    endCursor,
  } = useStreamable(info);
  const searchParams = useSearchParams();
  const serialize = createSerializer({
    [startCursorParamName]: parseAsString,
    [endCursorParamName]: parseAsString,
  });
  const previousLabel = useStreamable(streamablePreviousLabel) ?? 'Go to previous page';
  const nextLabel = useStreamable(streamableNextLabel) ?? 'Go to next page';

  if (resolvedVariant === 'archive') {
    return (
      <nav aria-label={label} className="py-10" role="navigation">
        <ul className="indicators flex items-center justify-center gap-2.5">
          <li>
            {startCursor != null ? (
              <ArchivePaginationLink
                aria-label={previousLabel}
                href={serialize(searchParams, {
                  [startCursorParamName]: startCursor,
                  [endCursorParamName]: null,
                })}
                scroll={scroll}
              >
                <ArrowLeft className="icon icon-chevron-left icon-sm stroke-2" size={16} strokeWidth={2} />
              </ArchivePaginationLink>
            ) : (
              <ArchiveSkeletonLink>
                <ArrowLeft className="icon icon-chevron-left icon-sm stroke-2" size={16} strokeWidth={2} />
              </ArchiveSkeletonLink>
            )}
          </li>
          <li>
            {endCursor != null ? (
              <ArchivePaginationLink
                aria-label={nextLabel}
                href={serialize(searchParams, {
                  [endCursorParamName]: endCursor,
                  [startCursorParamName]: null,
                })}
                scroll={scroll}
              >
                <ArrowRight className="icon icon-chevron-right icon-sm stroke-2" size={16} strokeWidth={2} />
              </ArchivePaginationLink>
            ) : (
              <ArchiveSkeletonLink>
                <ArrowRight className="icon icon-chevron-right icon-sm stroke-2" size={16} strokeWidth={2} />
              </ArchiveSkeletonLink>
            )}
          </li>
        </ul>
      </nav>
    );
  }

  return (
    <nav aria-label={label} className="py-10" role="navigation">
      <ul className="flex items-center justify-center gap-3">
        <li>
          {startCursor != null ? (
            <PaginationLink
              aria-label={previousLabel}
              href={serialize(searchParams, {
                [startCursorParamName]: startCursor,
                [endCursorParamName]: null,
              })}
              scroll={scroll}
            >
              <ArrowLeft size={24} strokeWidth={1} />
            </PaginationLink>
          ) : (
            <SkeletonLink>
              <ArrowLeft size={24} strokeWidth={1} />
            </SkeletonLink>
          )}
        </li>
        <li>
          {endCursor != null ? (
            <PaginationLink
              aria-label={nextLabel}
              href={serialize(searchParams, {
                [endCursorParamName]: endCursor,
                [startCursorParamName]: null,
              })}
              scroll={scroll}
            >
              <ArrowRight size={24} strokeWidth={1} />
            </PaginationLink>
          ) : (
            <SkeletonLink>
              <ArrowRight size={24} strokeWidth={1} />
            </SkeletonLink>
          )}
        </li>
      </ul>
    </nav>
  );
}

function PaginationLink({
  href,
  children,
  scroll,
  'aria-label': ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  scroll?: boolean;
  ['aria-label']?: string;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className={clsx(
        'flex h-12 w-12 items-center justify-center rounded-full border border-contrast-100 text-foreground ring-primary transition-colors duration-300 hover:border-contrast-200 hover:bg-contrast-100 focus-visible:outline-0 focus-visible:ring-2',
      )}
      href={href}
      scroll={scroll}
    >
      {children}
    </Link>
  );
}

function SkeletonLink({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-12 w-12 cursor-not-allowed items-center justify-center rounded-full border border-contrast-100 text-foreground opacity-50 duration-300">
      {children}
    </div>
  );
}

function ArchivePaginationLink({
  href,
  children,
  scroll,
  'aria-label': ariaLabel,
}: {
  href: string;
  children: React.ReactNode;
  scroll?: boolean;
  ['aria-label']?: string;
}) {
  return (
    <Link
      aria-label={ariaLabel}
      className="button button--secondary"
      href={href}
      scroll={scroll}
    >
      <span className="btn-fill" data-fill="" />
      <span className="btn-text">{children}</span>
    </Link>
  );
}

function ArchiveSkeletonLink({ children }: { children: React.ReactNode }) {
  return (
    <span
      aria-hidden
      className="button button--secondary pointer-events-none opacity-50"
      tabIndex={-1}
    >
      <span className="btn-fill" data-fill="" />
      <span className="btn-text">{children}</span>
    </span>
  );
}

export function CursorPaginationSkeleton() {
  return (
    <div className="flex w-full justify-center bg-background py-10 text-xs">
      <div className="flex gap-2">
        <SkeletonLink>
          <ArrowLeft />
        </SkeletonLink>
        <SkeletonLink>
          <ArrowRight />
        </SkeletonLink>
      </div>
    </div>
  );
}
