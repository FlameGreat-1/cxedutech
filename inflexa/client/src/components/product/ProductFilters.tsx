import { useState } from 'react';
import type { ProductFilters as Filters } from '@/types/product.types';
import { useProductFilters } from '@/hooks/useProductFilters';
import Button from '@/components/common/Button';

interface ProductFiltersProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  /** Set of filter section keys to hide (e.g. 'age', 'subject', 'format') */
  hideSections?: Set<string>;
}

export default function ProductFilters({ filters, onChange, hideSections }: ProductFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { subjects, formats, ageRanges } = useProductFilters();

  const showAge = !hideSections?.has('age');
  const showSubject = !hideSections?.has('subject');
  const showFormat = !hideSections?.has('format');

  /* Build age range options dynamically with "All Ages" prepended */
  const ageOptions = [
    { label: 'All Ages', min: undefined as number | undefined, max: undefined as number | undefined },
    ...ageRanges.map((r) => ({
      label: r.max_age > 11 ? `${r.min_age}+ yrs` : `${r.min_age}-${r.max_age} yrs`,
      min: r.min_age,
      max: r.max_age,
    })),
  ];

  function setFilter(key: keyof Filters, value: string | number | undefined) {
    const next = { ...filters };
    if (value === undefined || value === '') {
      delete next[key];
    } else {
      (next as Record<string, unknown>)[key] = value;
    }
    onChange(next);
  }

  function setAgeRange(min?: number, max?: number) {
    const next = { ...filters };
    if (min === undefined) {
      delete next.min_age;
      delete next.max_age;
    } else {
      next.min_age = min;
      next.max_age = max;
    }
    onChange(next);
  }

  function clearAll() {
    onChange({});
  }

  // Only count filters that are visible in the sidebar for the "has filters" check
  const visibleFilterCount = [
    showAge && (filters.min_age !== undefined),
    showSubject && filters.subject,
    showFormat && filters.format,
  ].filter(Boolean).length;

  const hasFilters = visibleFilterCount > 0;

  const selectedAgeLabel = ageOptions.find(
    (r) => r.min === filters.min_age && r.max === filters.max_age
  )?.label || 'All Ages';

  const filterContent = (
    <div className="space-y-6">
      {/* Age Range - only show if not pre-set from navigation */}
      {showAge && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Age Range</h4>
          <div className="flex flex-wrap gap-2">
            {ageOptions.map((range) => {
              const active = selectedAgeLabel === range.label;
              return (
                <button
                  key={range.label}
                  onClick={() => setAgeRange(range.min, range.max)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors
                    ${active
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                    }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Subject - only show if not pre-set from navigation */}
      {showSubject && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Subject</h4>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <label key={subject} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.subject === subject}
                  onChange={() =>
                    setFilter('subject', filters.subject === subject ? undefined : subject)
                  }
                  className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
                />
                <span className="text-sm text-gray-700">{subject}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Format - only show if not pre-set from navigation */}
      {showFormat && (
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Format</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('format', undefined)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors
                ${!filters.format
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                }`}
            >
              All
            </button>
            {formats.map((fmt) => (
              <button
                key={fmt}
                onClick={() => setFilter('format', filters.format === fmt ? undefined : fmt)}
                className={`px-3 py-1.5 text-sm font-medium rounded-full border transition-colors capitalize
                  ${filters.format === fmt
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-brand-400'
                  }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Clear - only show if there are visible active filters */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearAll} className="w-full">
          Clear All Filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Refine Results
          {hasFilters && (
            <span className="bg-brand-600 text-white text-xs rounded-full px-1.5 py-0.5">
              {visibleFilterCount}
            </span>
          )}
        </button>

        {mobileOpen && (
          <div className="mt-4 p-4 bg-white rounded-xl border border-gray-200">
            {filterContent}
          </div>
        )}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        {filterContent}
      </div>
    </>
  );
}
