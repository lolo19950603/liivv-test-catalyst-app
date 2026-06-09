'use client';

import { useForm } from '@conform-to/react';
import { clsx } from 'clsx';
import debounce from 'lodash.debounce';
import { ChevronUp, Loader2, XIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  type RefObject,
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import { FormStatus } from '@/vibes/soul/form/form-status';
import { type SearchResult } from '@/vibes/soul/primitives/navigation';
import { PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Link } from '~/components/link';
import { search } from '~/components/header/_actions/search';
import type { LiivvArchiveHeaderLogo } from '~/lib/makeswift/liivv-archive-header/types';

const SEARCH_RESULTS_PATH = '/search';
const SEARCH_PARAM_NAME = 'term';
const MIN_QUERY_LENGTH = 1;

function buildSearchPanelStyle(searchPanelId: string) {
  return `
#${searchPanelId} .liivv-archive-search-form {
  display: flex;
  align-items: stretch;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
}
#${searchPanelId} .liivv-archive-search-input-wrap {
  flex: 1;
  min-width: 0;
  position: relative;
}
#${searchPanelId} .liivv-archive-search-input {
  width: 100%;
  border: 2px solid rgb(var(--color-foreground) / 0.12);
  border-radius: var(--rounded-full, 9999px);
  background: rgb(var(--color-background));
  color: rgb(var(--color-foreground));
  font: inherit;
  font-size: var(--text-base, 1rem);
  line-height: 1.5;
  padding: 0.625rem 2.5rem 0.625rem 1rem;
}
#${searchPanelId} .liivv-archive-search-input::-webkit-search-cancel-button {
  -webkit-appearance: none;
  appearance: none;
  display: none;
}
#${searchPanelId} .liivv-archive-search-input-action {
  align-items: center;
  background: transparent;
  border: 0;
  color: rgb(var(--color-foreground) / 0.45);
  cursor: pointer;
  display: flex;
  height: 1.25rem;
  justify-content: center;
  padding: 0;
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
}
#${searchPanelId} .liivv-archive-search-input-action:hover,
#${searchPanelId} .liivv-archive-search-input-action:focus-visible {
  color: rgb(var(--color-foreground));
  outline: none;
}
#${searchPanelId} .liivv-archive-search-input-action--loading {
  cursor: default;
  pointer-events: none;
}
#${searchPanelId} .liivv-archive-search-input:focus,
#${searchPanelId} .liivv-archive-search-input:focus-visible {
  border-color: #8da58e;
  outline: none;
}
#${searchPanelId} .liivv-archive-search-submit {
  flex-shrink: 0;
  border: 0;
  border-radius: var(--rounded-full, 9999px);
  background: rgb(var(--color-button-background, var(--color-foreground)));
  color: rgb(var(--color-button-text, var(--color-background)));
  cursor: pointer;
  font: inherit;
  font-size: var(--text-sm, 0.875rem);
  font-weight: var(--font-medium, 500);
  padding: 0.625rem 1.25rem;
}
#${searchPanelId} .liivv-archive-search-close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid rgb(var(--color-foreground) / 0.12);
  border-radius: 50%;
  background: rgb(var(--color-background));
  color: rgb(var(--color-foreground));
  cursor: pointer;
  padding: 0;
}
#${searchPanelId} .liivv-archive-search-close:hover,
#${searchPanelId} .liivv-archive-search-close:focus-visible {
  border-color: rgb(var(--color-foreground) / 0.25);
  outline: none;
}
#${searchPanelId} .liivv-archive-search-results {
  border-top: 1px solid rgb(var(--color-foreground) / 0.08);
  max-height: min(70vh, 28rem);
  overflow-y: auto;
}
#${searchPanelId} .liivv-archive-search-results--stale {
  opacity: 0.5;
}
#${searchPanelId} .liivv-archive-search-results-inner {
  display: flex;
  flex-direction: column;
}
@media (min-width: 768px) {
  #${searchPanelId} .liivv-archive-search-results-inner {
    flex-direction: row;
  }
}
#${searchPanelId} .liivv-archive-search-section {
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgb(var(--color-foreground) / 0.08);
}
@media (min-width: 768px) {
  #${searchPanelId} .liivv-archive-search-section {
    border-bottom: 0;
    border-right: 1px solid rgb(var(--color-foreground) / 0.08);
    min-width: 12rem;
    max-width: 16rem;
  }
  #${searchPanelId} .liivv-archive-search-section--products {
    flex: 1;
    max-width: none;
    border-right: 0;
  }
}
#${searchPanelId} .liivv-archive-search-section-title {
  font-size: var(--text-xs, 0.75rem);
  font-weight: var(--font-semibold, 600);
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}
#${searchPanelId} .liivv-archive-search-link {
  border-radius: var(--rounded-lg, 0.5rem);
  color: rgb(var(--color-foreground) / 0.7);
  display: block;
  font-size: var(--text-sm, 0.875rem);
  font-weight: var(--font-medium, 500);
  padding: 0.5rem 0.75rem;
  text-decoration: none;
}
#${searchPanelId} .liivv-archive-search-link:hover,
#${searchPanelId} .liivv-archive-search-link:focus-visible {
  background: rgb(var(--color-foreground) / 0.06);
  color: rgb(var(--color-foreground));
  outline: none;
}
#${searchPanelId} .liivv-archive-search-product {
  align-items: center;
  border-radius: var(--rounded-lg, 0.5rem);
  color: inherit;
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
}
#${searchPanelId} .liivv-archive-search-product:hover,
#${searchPanelId} .liivv-archive-search-product:focus-visible {
  background: rgb(var(--color-foreground) / 0.06);
  outline: none;
}
#${searchPanelId} .liivv-archive-search-product-image {
  border-radius: var(--rounded-md, 0.375rem);
  flex-shrink: 0;
  height: 3rem;
  object-fit: cover;
  width: 3rem;
}
#${searchPanelId} .liivv-archive-search-product-image--logo {
  background: rgb(var(--color-background));
  object-fit: contain;
  padding: 0.25rem;
}
#${searchPanelId} .liivv-archive-search-product-image--text {
  align-items: center;
  background: rgb(var(--color-background));
  color: rgb(var(--color-foreground) / 0.7);
  display: flex;
  font-size: 0.5rem;
  font-weight: var(--font-semibold, 600);
  justify-content: center;
  line-height: 1.1;
  overflow: hidden;
  padding: 0.25rem;
  text-align: center;
  text-transform: uppercase;
}
#${searchPanelId} .liivv-archive-search-product-title {
  font-size: var(--text-sm, 0.875rem);
  font-weight: var(--font-medium, 500);
}
#${searchPanelId} .liivv-archive-search-empty,
#${searchPanelId} .liivv-archive-search-error {
  padding: 1.25rem;
}
#${searchPanelId} .liivv-archive-search-empty-title {
  font-size: var(--text-lg, 1.125rem);
  font-weight: var(--font-medium, 500);
  margin-bottom: 0.25rem;
}
#${searchPanelId} .liivv-archive-search-empty-subtitle {
  color: rgb(var(--color-foreground) / 0.6);
  font-size: var(--text-sm, 0.875rem);
}
`;
}

function SearchLinksSection({ result }: { result: Extract<SearchResult, { type: 'links' }> }) {
  if (result.links.length === 0) {
    return null;
  }

  return (
    <section aria-label={result.title} className="liivv-archive-search-section" role="region">
      <h3 className="liivv-archive-search-section-title">{result.title}</h3>
      <ul className="list-none" role="listbox">
        {result.links.map((link) => (
          <li key={link.href}>
            <Link className="liivv-archive-search-link" href={link.href} role="option">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchProductThumbnail({
  fallbackLogo,
  productImage,
  productTitle,
}: {
  fallbackLogo?: LiivvArchiveHeaderLogo | null;
  productImage?: { src: string; alt: string };
  productTitle: string;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const productSrc = productImage?.src;

  if (productSrc && !imageFailed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={productImage.alt || productTitle}
        className="liivv-archive-search-product-image"
        onError={() => setImageFailed(true)}
        src={productSrc}
      />
    );
  }

  if (fallbackLogo?.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt={fallbackLogo.alt}
        className="liivv-archive-search-product-image liivv-archive-search-product-image--logo"
        src={fallbackLogo.src}
      />
    );
  }

  if (fallbackLogo?.text) {
    return (
      <span
        aria-hidden
        className="liivv-archive-search-product-image liivv-archive-search-product-image--text"
      >
        {fallbackLogo.text}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="liivv-archive-search-product-image liivv-archive-search-product-image--logo"
    />
  );
}

function SearchProductsSection({
  fallbackLogo,
  result,
}: {
  fallbackLogo?: LiivvArchiveHeaderLogo | null;
  result: Extract<SearchResult, { type: 'products' }>;
}) {
  if (result.products.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={result.title}
      className="liivv-archive-search-section liivv-archive-search-section--products"
      role="region"
    >
      <h3 className="liivv-archive-search-section-title">{result.title}</h3>
      <ul className="list-none" role="listbox">
        {result.products.map((product) => (
          <li key={product.id}>
            <Link className="liivv-archive-search-product" href={product.href} role="option">
              <SearchProductThumbnail
                fallbackLogo={fallbackLogo}
                productImage={product.image}
                productTitle={product.title}
              />
              <span>
                <span className="liivv-archive-search-product-title">{product.title}</span>
                {product.price != null ? (
                  <span className="block text-sm text-[rgb(var(--color-foreground)/0.6)]">
                    <PriceLabel price={product.price} />
                  </span>
                ) : null}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function SearchResultsPanel({
  fallbackLogo,
  query,
  searchResults,
  stale,
  emptySearchTitle,
  emptySearchSubtitle,
  errors,
}: {
  fallbackLogo?: LiivvArchiveHeaderLogo | null;
  query: string;
  searchResults: SearchResult[] | null;
  stale: boolean;
  emptySearchTitle: string;
  emptySearchSubtitle: string;
  errors?: string[];
}) {
  if (query.length < MIN_QUERY_LENGTH) {
    return null;
  }

  if (errors != null && errors.length > 0) {
    if (stale) {
      return null;
    }

    return (
      <div className="liivv-archive-search-results">
        <div className="liivv-archive-search-error">
          {errors.map((error) => (
            <FormStatus key={error} type="error">
              {error}
            </FormStatus>
          ))}
        </div>
      </div>
    );
  }

  if (searchResults == null || searchResults.length === 0) {
    if (stale) {
      return null;
    }

    return (
      <div className="liivv-archive-search-results">
        <div className="liivv-archive-search-empty">
          <p className="liivv-archive-search-empty-title">{emptySearchTitle}</p>
          <p className="liivv-archive-search-empty-subtitle">{emptySearchSubtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={clsx('liivv-archive-search-results', stale && 'liivv-archive-search-results--stale')}
    >
      <div className="liivv-archive-search-results-inner">
        {searchResults.map((result, index) => {
          switch (result.type) {
            case 'links':
              return <SearchLinksSection key={`result-${index}`} result={result} />;

            case 'products':
              return (
                <SearchProductsSection
                  fallbackLogo={fallbackLogo}
                  key={`result-${index}`}
                  result={result}
                />
              );

            default:
              return null;
          }
        })}
      </div>
    </div>
  );
}

const CATEGORY_ENTITY_ID_FIELD = 'categoryEntityId';

export function LiivvArchiveSearchPanel({
  categoryEntityId,
  fallbackLogo,
  searchPanelId,
  searchPlaceholder,
  inputRef,
  open,
  onClose,
  submitPath = SEARCH_RESULTS_PATH,
  variant = 'drawer',
}: {
  categoryEntityId?: number;
  fallbackLogo?: LiivvArchiveHeaderLogo | null;
  searchPanelId: string;
  searchPlaceholder: string;
  inputRef?: RefObject<HTMLInputElement | null>;
  open?: boolean;
  onClose?: () => void;
  submitPath?: string;
  variant?: 'drawer' | 'inline';
}) {
  const t = useTranslations('Components.Header.Search');
  const submitLabel = t('submitLabel');
  const clearLabel = t('clearLabel');
  const closeLabel = t('closeLabel');
  const loadingLabel = t('loadingLabel');
  const [query, setQuery] = useState('');
  const [isSearching, startSearching] = useTransition();
  const [{ searchResults, lastResult, emptyStateTitle, emptyStateSubtitle }, formAction] =
    useActionState(search, {
      searchResults: null,
      lastResult: null,
      emptyStateTitle: '',
      emptyStateSubtitle: '',
    });
  const [isDebouncing, setIsDebouncing] = useState(false);
  const isPending = isSearching || isDebouncing;
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setIsDebouncing(false);

        if (value.length < MIN_QUERY_LENGTH) {
          return;
        }

        const formData = new FormData();

        formData.append(SEARCH_PARAM_NAME, value);

        if (categoryEntityId != null) {
          formData.append(CATEGORY_ENTITY_ID_FIELD, String(categoryEntityId));
        }

        startSearching(() => {
          formAction(formData);
        });
      }, 300),
    [categoryEntityId, formAction],
  );

  const debouncedOnChange = useMemo(
    () => (value: string) => {
      setIsDebouncing(true);
      debouncedSearch(value);
    },
    [debouncedSearch],
  );

  const clearQuery = () => {
    debouncedSearch.cancel();
    setIsDebouncing(false);
    setQuery('');
    inputRef?.current?.focus();
  };

  const [form] = useForm({ lastResult });
  const isDrawer = variant === 'drawer';
  const panelOpen = open ?? true;
  const panelRootId = `${searchPanelId}-inner`;

  useEffect(() => {
    if (isDrawer && !panelOpen) {
      debouncedSearch.cancel();
      setQuery('');
      setIsDebouncing(false);
    }
  }, [debouncedSearch, isDrawer, panelOpen]);

  return (
    <div
      className={clsx(
        variant === 'inline' &&
          'liivv-archive-search-panel--inline mb-6 rounded-2xl border border-[rgb(var(--color-foreground)/0.08)] bg-[rgb(var(--color-background))] shadow-[0_12px_40px_rgb(33_33_33/0.06)]',
      )}
      id={panelRootId}
    >
      <style>{buildSearchPanelStyle(panelRootId)}</style>
      <form
        action={submitPath}
        className="liivv-archive-search-form"
        method="get"
        role="search"
      >
        <label className="sr-only" htmlFor={`${searchPanelId}-input`}>
          {searchPlaceholder}
        </label>
        <div className="liivv-archive-search-input-wrap">
          <input
            aria-autocomplete="list"
            aria-controls={`${searchPanelId}-results`}
            aria-expanded={query.length >= MIN_QUERY_LENGTH}
            autoComplete="off"
            className="liivv-archive-search-input"
            id={`${searchPanelId}-input`}
            name={SEARCH_PARAM_NAME}
            onChange={(event) => {
              const value = event.currentTarget.value;

              setQuery(value);
              debouncedOnChange(value);
            }}
            placeholder={searchPlaceholder}
            ref={inputRef}
            role="combobox"
            type="search"
            value={query}
          />
          {isPending ? (
            <span
              aria-label={loadingLabel}
              className="liivv-archive-search-input-action liivv-archive-search-input-action--loading"
              role="status"
            >
              <Loader2 aria-hidden className="size-4 animate-spin" strokeWidth={2} />
            </span>
          ) : query.length > 0 ? (
            <button
              aria-label={clearLabel}
              className="liivv-archive-search-input-action"
              onClick={clearQuery}
              type="button"
            >
              <XIcon aria-hidden size={16} strokeWidth={2} />
            </button>
          ) : null}
        </div>
        <button className="liivv-archive-search-submit" type="submit">
          {submitLabel}
        </button>
        {isDrawer && onClose ? (
          <button
            aria-label={closeLabel}
            className="liivv-archive-search-close"
            onClick={onClose}
            type="button"
          >
            <ChevronUp aria-hidden size={18} strokeWidth={2} />
          </button>
        ) : null}
      </form>
      <div id={`${searchPanelId}-results`}>
        <SearchResultsPanel
          emptySearchSubtitle={emptyStateSubtitle ?? t('noSearchResultsSubtitle')}
          emptySearchTitle={emptyStateTitle ?? t('noSearchResultsTitle', { term: query })}
          errors={form.errors}
          fallbackLogo={fallbackLogo}
          query={query}
          searchResults={searchResults}
          stale={isPending}
        />
      </div>
    </div>
  );
}
