import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import FilterDropdown, { type FilterOption } from './FilterDropdown';
import { useProductFilters } from '@/hooks/useProductFilters';

export default function FilterBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');
  const { subjects, formats, ageRanges } = useProductFilters();

  // Sync the search input with the URL ?search= param
  useEffect(() => {
    if (location.pathname === '/store') {
      setSearchValue(searchParams.get('search') || '');
    } else {
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

  const ageOptions: FilterOption[] = ageRanges.map((range) => {
    const label = range.max_age > 11
      ? `${range.min_age}+ years`
      : `${range.min_age}-${range.max_age} years`;
    return {
      label,
      params: { min_age: String(range.min_age), max_age: String(range.max_age) },
    };
  });

  const subjectOptions: FilterOption[] = subjects.map((s) => ({
    label: s,
    params: { subject: s },
  }));

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

  return (
    <div className="bg-gray-50/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-3 sm:py-3.5 border-b border-black">

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <FilterDropdown
              label="Age"
              options={ageOptions}
              icon={
                <img src="/icons/People.png" alt="" className="w-[18px] h-[18px] object-contain" />
              }
            />
            <FilterDropdown
              label="Subject"
              options={subjectOptions}
              icon={
                <img src="/icons/book.svg" alt="" className="w-[18px] h-[18px] object-contain" />
              }
            />
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 max-w-lg mx-auto"
          >
            <div className="relative">
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400"
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
                placeholder="Search flashcard packs..."
                className="w-full pl-11 pr-5 py-2.5 text-[15px] bg-white border border-gray-200 rounded-xl
                  placeholder-gray-400 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white
                  shadow-sm hover:shadow transition-all duration-200"
              />
            </div>
          </form>

          <div className="hidden md:flex items-center gap-2 shrink-0">
            <FilterDropdown
              label="Format"
              align="right"
              options={formatOptions}
              icon={
                <img src="/icons/Printer.png" alt="" className="w-[18px] h-[18px] object-contain" />
              }
            />
            <Link
              to="/store"
              className="flex items-center gap-2 px-6 py-3 text-lg font-normal rounded-xl border bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:text-mood-toke-green hover:shadow-sm transition-all duration-200"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.809c0-.816-.312-1.597-.872-2.163L13.803 1.95a.75.75 0 00-1.06 0L6.872 7.646C6.312 8.212 6 8.993 6 9.81V21M18 21v-3.5" /></svg>
              Store
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
