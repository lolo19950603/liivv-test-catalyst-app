export type PageRangeItem = number | 'ellipsis';

export function buildPageRange(currentPage: number, totalPages: number): PageRangeItem[] {
  if (totalPages <= 1) {
    return [1];
  }

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set<number>([1, totalPages]);

  for (let page = currentPage - 1; page <= currentPage + 1; page += 1) {
    if (page >= 1 && page <= totalPages) {
      pages.add(page);
    }
  }

  const sortedPages = [...pages].sort((a, b) => a - b);
  const range: PageRangeItem[] = [];

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1];

    if (index > 0 && previousPage != null && page - previousPage > 1) {
      range.push('ellipsis');
    }

    range.push(page);
  });

  return range;
}
