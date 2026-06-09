import { NumberedPaginationInfo } from '@/vibes/soul/primitives/numbered-pagination';

export function numberedPaginationTransformer(
  totalItems: number,
  limit: number,
  currentPage: number,
  { pageParamName = 'page' }: { pageParamName?: string } = {},
): NumberedPaginationInfo {
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const page = Math.min(Math.max(1, currentPage), totalPages);

  return {
    currentPage: page,
    totalPages,
    pageParamName,
  };
}
