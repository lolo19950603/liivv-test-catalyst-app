import {
  DEFAULT_FACETED_PAGE_SIZE,
  FACETED_PAGE_SIZES,
} from '@/vibes/soul/sections/products-list-section/constants';
import { Option } from '@/vibes/soul/sections/products-list-section/sorting';

export function getFacetedPageSizeOptions(perPageLabel: (count: number) => string): Option[] {
  return FACETED_PAGE_SIZES.map((count) => ({
    value: String(count),
    label: perPageLabel(count),
  }));
}

export { DEFAULT_FACETED_PAGE_SIZE };
