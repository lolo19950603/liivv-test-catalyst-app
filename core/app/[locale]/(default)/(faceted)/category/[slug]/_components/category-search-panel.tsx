'use client';

import { useId } from 'react';

import { LiivvArchiveSearchPanel } from '~/lib/makeswift/liivv-archive-header/liivv-archive-search-panel';
import type { LiivvArchiveHeaderLogo } from '~/lib/makeswift/liivv-archive-header/types';

export function CategorySearchPanel({
  categoryEntityId,
  categoryPath,
  fallbackLogo,
  searchPlaceholder,
}: {
  categoryEntityId: number;
  categoryPath: string;
  fallbackLogo?: LiivvArchiveHeaderLogo | null;
  searchPlaceholder: string;
}) {
  const reactId = useId();
  const searchPanelId = `category-search-${categoryEntityId}-${reactId.replace(/:/g, '')}`;

  return (
    <LiivvArchiveSearchPanel
      categoryEntityId={categoryEntityId}
      fallbackLogo={fallbackLogo}
      searchPanelId={searchPanelId}
      searchPlaceholder={searchPlaceholder}
      submitPath={categoryPath}
      variant="inline"
    />
  );
}
