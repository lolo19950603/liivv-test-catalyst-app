'use client';

import clsx from 'clsx';
import { useCallback, useEffect, useId, useRef, useState } from 'react';

import { LiivvArchiveSearchPanel } from '~/lib/makeswift/liivv-archive-header/liivv-archive-search-panel';

import { IconSearch } from './icons';

/** Ignore focus/layout scroll right after open; then close once the page moves down. */
const SEARCH_SCROLL_CLOSE_DELAY_MS = 150;
const SEARCH_SCROLL_CLOSE_DELTA_PX = 8;

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

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (!(target instanceof Node)) {
        return;
      }

      const element = target instanceof Element ? target : target.parentElement;

      if (
        element?.closest(`#${searchPanelId}`) != null ||
        element?.closest('.mhd-search-trigger') != null
      ) {
        return;
      }

      closeSearch();
    };

    document.addEventListener('pointerdown', onPointerDown);

    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [searchOpen, searchPanelId, closeSearch]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    let originY = window.scrollY;
    let armed = false;
    const armTimer = window.setTimeout(() => {
      armed = true;
      originY = window.scrollY;
    }, SEARCH_SCROLL_CLOSE_DELAY_MS);

    const onScroll = (event: Event) => {
      const target = event.target;

      if (target instanceof Element && target.closest(`#${searchPanelId}`) != null) {
        return;
      }

      if (!armed) {
        originY = window.scrollY;

        return;
      }

      if (target instanceof Element) {
        closeSearch();

        return;
      }

      if (window.scrollY - originY >= SEARCH_SCROLL_CLOSE_DELTA_PX) {
        closeSearch();
      }
    };

    document.addEventListener('scroll', onScroll, { capture: true, passive: true });

    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener('scroll', onScroll, { capture: true });
    };
  }, [searchOpen, searchPanelId, closeSearch]);

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
        inert={!searchOpen}
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
