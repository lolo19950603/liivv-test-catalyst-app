'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { LiivvArchiveSearchPanel } from '~/lib/makeswift/liivv-archive-header/liivv-archive-search-panel';

import { IconSearch } from './icons';

/** Keep in sync with --mhd-search-drawer-duration in dashboard-styles.ts */
const SEARCH_DRAWER_DURATION_MS = 450;

export function useAccountDashboardSearch({
  ariaLabel,
  searchPlaceholder,
}: {
  ariaLabel: string;
  searchPlaceholder: string;
}) {
  const reactId = useId();
  const searchPanelId = `mhd-search-${reactId.replace(/:/g, '')}`;
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchDrawerMounted, setSearchDrawerMounted] = useState(false);

  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const toggleSearch = useCallback(() => {
    if (searchOpen) {
      setSearchOpen(false);

      return;
    }

    setSearchDrawerMounted(true);

    window.requestAnimationFrame(() => {
      setSearchOpen(true);
    });
  }, [searchOpen]);

  useEffect(() => {
    if (searchOpen || !searchDrawerMounted) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSearchDrawerMounted(false);
    }, SEARCH_DRAWER_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [searchDrawerMounted, searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);

    return () => window.clearTimeout(timer);
  }, [searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSearchOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => window.removeEventListener('keydown', onKeyDown);
  }, [searchOpen]);

  const trigger = (
    <button
      aria-controls={searchPanelId}
      aria-expanded={searchOpen}
      aria-label={ariaLabel}
      className="mhd-icon-btn mhd-search-trigger"
      onClick={toggleSearch}
      type="button"
    >
      <IconSearch />
    </button>
  );

  const drawer =
    searchDrawerMounted ? (
      <div
        aria-hidden={!searchOpen}
        className={clsx('mhd-header-search-wrap', searchOpen && 'is-open')}
        id={searchPanelId}
      >
        <div className="mhd-header-search-drawer">
          <LiivvArchiveSearchPanel
            inputRef={searchInputRef}
            onClose={closeSearch}
            open={searchOpen}
            searchPanelId={searchPanelId}
            searchPlaceholder={searchPlaceholder}
          />
        </div>
      </div>
    ) : null;

  return { trigger, drawer };
}
