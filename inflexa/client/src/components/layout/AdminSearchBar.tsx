import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as searchApi from '@/api/admin/search.api';
import { formatPrice } from '@/utils/currency';
import { useProductFilters } from '@/hooks/useProductFilters';

/* ── Tiny inline filter-dropdown (admin-themed) ──────────────── */
interface FilterOption {
  label: string;
  params: Record<string, string>;
}

function AdminFilterDropdown({
  label,
  options,
  icon,
  align = 'left',
  onSelect,
}: {
  label: string;
  options: FilterOption[];
  icon: React.ReactNode;
  align?: 'left' | 'right';
  onSelect: (params: Record<string, string>) => void;
}) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(true);
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  }

  function handleOptionClick(option: FilterOption) {
    onSelect(option.params);
    setOpen(false);
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200
          ${
            open
              ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:text-gray-800 dark:hover:text-white'
          }`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="w-3.5 h-3.5 shrink-0">{icon}</span>
        {label}
        <svg
          className={`w-3 h-3 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      <div
        className={`absolute top-full mt-1.5 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl
          transition-all duration-200 z-50
          ${align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'}
          ${options.length > 4 ? 'w-[340px]' : 'w-[260px]'}
          ${open
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 scale-95 -translate-y-1 pointer-events-none'
          }`}
        role="menu"
      >
        <div className="p-2">
          <p className="px-2.5 pt-1 pb-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
          <div className={`grid gap-0.5 ${options.length > 4 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {options.map((option) => (
              <button
                key={option.label}
                onClick={() => handleOptionClick(option)}
                className="text-left px-2.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 hover:text-brand-700 dark:hover:text-brand-300
                  transition-colors duration-150 rounded-lg font-medium"
                role="menuitem"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main AdminSearchBar ─────────────────────────────────────── */
export default function AdminSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { subjects, formats, ageRanges } = useProductFilters();

  // Build filter options from dynamic data
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

  // Navigate to admin products page with filter params
  const navigateWithFilter = useCallback((params: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const qs = searchParams.toString();
    navigate(qs ? `/admin/products?${qs}` : '/admin/products');
    setOpen(false);
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.blur();
  }, [navigate]);

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['admin', 'search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 1,
    staleTime: 5_000,
  });

  const hasResults = results && (
    results.orders.length > 0 ||
    results.products.length > 0 ||
    results.payments.length > 0
  );

  const showDropdown = open && debouncedQuery.length >= 1;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    if (open) document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open]);

  const goTo = useCallback((path: string) => {
    setOpen(false);
    setQuery('');
    setDebouncedQuery('');
    navigate(path);
  }, [navigate]);

  // Submit text search -> navigate to admin products with search param
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigateWithFilter({ search: trimmed });
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Filter dropdowns */}
      <div className="hidden xl:flex items-center gap-1.5">
        <AdminFilterDropdown
          label="Age"
          options={ageOptions}
          onSelect={navigateWithFilter}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          }
        />
        <AdminFilterDropdown
          label="Subject"
          options={subjectOptions}
          onSelect={navigateWithFilter}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          }
        />
        <AdminFilterDropdown
          label="Format"
          options={formatOptions}
          align="right"
          onSelect={navigateWithFilter}
          icon={
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m10.5 0a48.536 48.536 0 00-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18.75 12h.008v.008h-.008V12zm-8.25 0h.008v.008H10.5V12z" />
            </svg>
          }
        />
      </div>

      {/* Search input + results dropdown */}
      <div ref={containerRef} className="relative w-full max-w-md">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
              placeholder="Search orders, products, payments..."
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 border border-transparent rounded-lg
                text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-white dark:focus:bg-gray-800
                transition-all duration-200"
            />
            {isLoading && debouncedQuery.length >= 1 && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-gray-300 dark:border-gray-500 border-t-brand-500 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </form>

        {/* Dropdown */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10 border border-gray-200 dark:border-gray-700 z-50 overflow-hidden max-h-[400px] overflow-y-auto">
            {!isLoading && !hasResults && debouncedQuery.length >= 1 && (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">No results found for "{debouncedQuery}"</p>
              </div>
            )}

            {/* Orders */}
            {results && results.orders.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Orders</p>
                </div>
                {results.orders.map((order) => (
                  <button
                    key={`order-${order.id}`}
                    onClick={() => goTo(`/admin/orders/${order.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <img src="/icons/order.svg" alt="" className="w-4 h-4 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Order #{order.id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{order.shipping_name} &middot; {order.order_status}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white shrink-0">
                      {formatPrice(order.total_amount, order.currency)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Products */}
            {results && results.products.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Products</p>
                </div>
                {results.products.map((product) => (
                  <button
                    key={`product-${product.id}`}
                    onClick={() => goTo('/admin/products')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    {product.image_url ? (
                      <img src={product.image_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-8 h-8 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{product.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{product.subject} &middot; Stock: {product.inventory_count}</p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white shrink-0">
                      {formatPrice(product.price, product.currency)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Payments */}
            {results && results.payments.length > 0 && (
              <div>
                <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payments</p>
                </div>
                {results.payments.map((payment) => (
                  <button
                    key={`payment-${payment.id}`}
                    onClick={() => goTo(`/admin/payments/${payment.id}`)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
                      <img src="/icons/payment.svg" alt="" className="w-4 h-4 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Payment #{payment.id}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {payment.shipping_name || `Order #${payment.order_id}`} &middot;
                        <span className="capitalize"> {payment.status}</span>
                      </p>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white shrink-0">
                      {formatPrice(payment.amount, payment.currency)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
