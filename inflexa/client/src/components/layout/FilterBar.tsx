import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FilterDropdown, { type FilterOption } from './FilterDropdown';
import { useProductFilters } from '@/hooks/useProductFilters';

export default function FilterBar() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  const { subjects, formats, ageRanges } = useProductFilters();

  /* -- Build age options dynamically -- */
  const ageOptions: FilterOption[] = ageRanges.map((range) => {
    const label = range.max_age > 11
      ? `${range.min_age}+ years`
      : `${range.min_age}-${range.max_age} years`;
    return {
      label,
      params: { min_age: String(range.min_age), max_age: String(range.max_age) },
    };
  });

  /* -- Build subject options dynamically -- */
  const subjectOptions: FilterOption[] = subjects.map((s) => ({
    label: s,
    params: { subject: s },
  }));

  /* -- Build format options dynamically -- */
  const formatOptions: FilterOption[] = [
    { label: 'All', params: {} },
    ...formats.map((f) => ({
      label: f.charAt(0).toUpperCase() + f.slice(1),
      params: { format: f },
    })),
  ];

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = searchValue.trim();
    if (trimmed) {
      navigate(`/store?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/store');
    }
  }

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleSearchSubmit(e);
    }
  }

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 py-3">

          {/* Left side: Sort by Age + Subject */}
          <div className="flex items-center gap-1 shrink-0">
            <FilterDropdown
              label="Sort by Age"
              options={ageOptions}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
            />
            <FilterDropdown
              label="Subject"
              options={subjectOptions}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              }
            />
          </div>

          {/* Center: Search */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-md mx-auto"
          >
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search flashcard packs..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-full
                  placeholder-gray-400 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 focus:bg-white
                  transition-all duration-200"
              />
            </div>
          </form>

          {/* Right side: Format */}
          <div className="flex items-center shrink-0">
            <FilterDropdown
              label="Format"
              options={formatOptions}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5zm-3 0h.008v.008H15V10.5z" />
                </svg>
              }
            />
          </div>

        </div>
      </div>
    </div>
  );
}
