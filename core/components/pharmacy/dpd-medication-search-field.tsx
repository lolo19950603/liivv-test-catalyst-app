'use client';

import { useEffect, useState } from 'react';

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

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setDpdUnavailable(false);

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

            return;
          }

          setDpdUnavailable(false);
          setResults(Array.isArray(data) ? data : []);
        } catch {
          setResults([]);
          setDpdUnavailable(true);
        } finally {
          setIsFetching(false);
        }
      })();
    }, 300);

    return () => clearTimeout(t);
  }, [medicationsBaseUrl, query]);

  const handleSelect = async (med: MedicationResult) => {
    if (!fetchDetailsOnSelect) {
      onSelect(med, null);
      setShowResults(false);
      setQuery(clearQueryAfterSelect ? '' : med.brandName);

      return;
    }

    setLoadingDetails(med.drugCode);

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
      onSelect(med, null);
    }

    setLoadingDetails(null);
    setShowResults(false);
    setQuery(clearQueryAfterSelect ? '' : med.brandName);
  };

  return (
    <div className="relative">
      <label className="text-sm font-medium text-[#2c2a26]" htmlFor={inputId}>
        {label}
      </label>
      <div className="relative mt-2 flex overflow-hidden rounded-lg border border-[#e0d9ce] bg-white focus-within:border-[#8a9a7b] focus-within:ring-2 focus-within:ring-[#8a9a7b]/30">
        <input
          className="w-full border-0 bg-transparent px-3 py-2.5 text-sm text-[#2c2a26] placeholder:text-[#9a928a] focus:outline-none focus:ring-0"
          id={inputId}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          onChange={(e) => {
            const v = e.target.value;

            setQuery(v);
            setShowResults(v.length >= 2);
          }}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          value={query}
        />
        {isFetching ? <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8a8176]">…</span> : null}
      </div>
      {showResults && results.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-[#e0d9ce] bg-white shadow-lg">
          {results.map((med) => (
            <button
              className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f7f4ef]"
              disabled={loadingDetails === med.drugCode}
              key={med.drugCode}
              onClick={() => void handleSelect(med)}
              type="button"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-[#2c2a26]">{med.brandName}</div>
                <div className="truncate text-xs text-[#6b6560]">
                  DIN: {med.din} | {med.companyName}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : null}
      {showResults && query.length >= 2 && !isFetching && results.length === 0 ? (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-md border border-[#e0d9ce] bg-white p-4 text-center shadow-lg">
          <p className="text-sm text-[#6b6560]">
            {dpdUnavailable
              ? 'Health Canada DPD is temporarily unavailable. Please try again later.'
              : 'No medications found. Try another spelling or a shorter search.'}
          </p>
        </div>
      ) : null}
      <p className="mt-2 text-xs leading-relaxed text-[#8a8176]">
        Powered by Health Canada Drug Product Database (DPD)
      </p>
    </div>
  );
}
