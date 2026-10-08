'use client';

import { useEffect, useId, useRef, useState } from 'react';

export type MedicationResult = {
  drugCode: number;
  din: string;
  brandName: string;
  companyName: string;
  descriptor?: string;
  classType?: string;
  status?: unknown;
};

export type MedicationDetails = {
  ingredients: { name: string; strength: string; strengthUnit: string }[];
  forms: string[];
  routes: string[];
};

type MedicationSearchApiError = {
  error?: string;
};

export type DpdMedicationSearchFieldProps = {
  medicationsBaseUrl: string;
  onSelect: (med: MedicationResult, details: MedicationDetails | null) => void;
  fetchDetailsOnSelect?: boolean;
  clearQueryAfterSelect?: boolean;
  inputId?: string;
  label?: string;
  placeholder?: string;
};

export function DpdMedicationSearchField({
  medicationsBaseUrl,
  onSelect,
  fetchDetailsOnSelect = true,
  clearQueryAfterSelect = false,
  inputId = 'dpd-med-search',
  label = 'Search medication',
  placeholder = 'Type medication name (e.g. Metformin, Ozempic)...',
}: DpdMedicationSearchFieldProps) {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState<number | null>(null);
  const [results, setResults] = useState<MedicationResult[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [dpdUnavailable, setDpdUnavailable] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setDpdUnavailable(false);
      setRateLimited(false);

      return;
    }

    setIsFetching(true);
    const t = setTimeout(() => {
      void (async () => {
        try {
          const res = await fetch(`${medicationsBaseUrl}/search?q=${encodeURIComponent(query)}`);
          const data = (await res.json()) as MedicationResult[] | MedicationSearchApiError;

          if (!res.ok) {
            setResults([]);
            setDpdUnavailable(!Array.isArray(data) && data?.error === 'dpd_unavailable');
            setRateLimited(!Array.isArray(data) && data?.error === 'rate_limited');

            return;
          }

          setDpdUnavailable(false);
          setRateLimited(false);
          setResults(Array.isArray(data) ? data : []);
          setActiveIndex(0);
        } catch {
          setResults([]);
          setDpdUnavailable(true);
          setRateLimited(false);
        } finally {
          setIsFetching(false);
        }
      })();
    }, 300);

    return () => clearTimeout(t);
  }, [medicationsBaseUrl, query]);

  const finishSelection = (med: MedicationResult) => {
    setShowResults(false);
    setQuery(clearQueryAfterSelect ? '' : med.brandName);
    setActiveIndex(0);
  };

  const handleSelect = (med: MedicationResult) => {
    if (!fetchDetailsOnSelect) {
      onSelect(med, null);
      finishSelection(med);

      return;
    }

    // Add immediately so a slow details lookup cannot block the next step.
    onSelect(med, null);
    finishSelection(med);
    setLoadingDetails(med.drugCode);

    void (async () => {
      try {
        const res = await fetch(`${medicationsBaseUrl}/${med.drugCode}/details`);
        const raw = (await res.json()) as Partial<MedicationDetails>;
        const details: MedicationDetails = {
          ingredients: Array.isArray(raw.ingredients) ? raw.ingredients : [],
          forms: Array.isArray(raw.forms) ? raw.forms : [],
          routes: Array.isArray(raw.routes) ? raw.routes : [],
        };

        onSelect(med, details);
      } catch {
        // The medication is already on the list.
      } finally {
        setLoadingDetails(null);
      }
    })();
  };

  return (
    <div ref={rootRef}>
      <label className="text-sm font-medium text-[#2c2a26]" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative z-20 mt-2">
        <div className="flex overflow-hidden rounded-lg border border-[#e0d9ce] bg-white focus-within:border-[#8a9a7b] focus-within:ring-2 focus-within:ring-[#8a9a7b]/30">
          <input
            aria-activedescendant={
              showResults && results[activeIndex] ? `${listboxId}-${results[activeIndex].drugCode}` : undefined
            }
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-expanded={showResults && results.length > 0}
            className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-[#2c2a26] placeholder:text-[#9a928a] focus:outline-none focus:ring-0"
            id={inputId}
            onBlur={(event) => {
              const next = event.relatedTarget;

              if (next instanceof Node && rootRef.current?.contains(next)) {
                return;
              }

              setShowResults(false);
            }}
            onChange={(e) => {
              const v = e.target.value;

              setQuery(v);
              setShowResults(v.length >= 2);
              setActiveIndex(0);
            }}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            onKeyDown={(event) => {
              if (!showResults || results.length === 0) {
                return;
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setActiveIndex((index) => (index + 1) % results.length);
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActiveIndex((index) => (index - 1 + results.length) % results.length);
              } else if (event.key === 'Enter') {
                event.preventDefault();
                const med = results[activeIndex] ?? results[0];

                if (med) {
                  handleSelect(med);
                }
              } else if (event.key === 'Escape') {
                setShowResults(false);
              }
            }}
            placeholder={placeholder}
            role="combobox"
            value={query}
          />
          {isFetching || loadingDetails != null ? (
            <span className="flex items-center pr-3 text-xs text-[#8a8176]">…</span>
          ) : null}
        </div>
        {showResults && results.length > 0 ? (
          <div
            className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-md border border-[#e0d9ce] bg-white shadow-lg"
            id={listboxId}
            role="listbox"
          >
            {results.map((med, index) => (
              <button
                aria-selected={index === activeIndex}
                className={
                  index === activeIndex
                    ? 'flex w-full items-center gap-3 bg-[#eef4ee] px-4 py-3 text-left'
                    : 'flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f7f4ef]'
                }
                id={`${listboxId}-${med.drugCode}`}
                key={`${med.drugCode}-${med.din}`}
                onMouseDown={(event) => {
                  // Keep focus in the field so blur cannot close the list before the choice is saved.
                  event.preventDefault();
                  handleSelect(med);
                }}
                role="option"
                type="button"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[#2c2a26]">{med.brandName}</div>
                  <div className="truncate text-xs text-[#6b6560]">
                    DIN: {med.din} | {med.companyName}
                  </div>
                </div>
                <span className="shrink-0 text-xs font-semibold text-[#2d4a2d]">Add</span>
              </button>
            ))}
          </div>
        ) : null}
        {showResults && query.length >= 2 && !isFetching && results.length === 0 ? (
          <div className="absolute left-0 right-0 top-full z-30 mt-1 rounded-md border border-[#e0d9ce] bg-white p-4 text-center shadow-lg">
            <p className="text-sm text-[#6b6560]">
              {rateLimited
                ? 'Too many searches. Please wait a minute and try again.'
                : dpdUnavailable
                  ? 'Health Canada DPD is temporarily unavailable. Please try again later.'
                  : 'No medications found. Try another spelling or a shorter search.'}
            </p>
          </div>
        ) : null}
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#8a8176]">
        Powered by Health Canada Drug Product Database (DPD)
      </p>
    </div>
  );
}
