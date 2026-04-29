import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

export default function FilterBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchValue, setSearchValue] = useState('');

  // Sync the search input with the URL ?search= param
  useEffect(() => {
    if (location.pathname === '/store') {
      setSearchValue(searchParams.get('search') || '');
    } else {
      setSearchValue('');
    }
  }, [location.pathname, searchParams]);

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
        <div className="flex items-center justify-center py-2 border-b border-black">
          <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-xl"
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
                className="w-full pl-11 pr-5 py-2 text-[15px] bg-white border border-gray-200 rounded-xl
                  placeholder-gray-400 text-gray-900
                  focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white
                  shadow-sm hover:shadow transition-all duration-200"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

