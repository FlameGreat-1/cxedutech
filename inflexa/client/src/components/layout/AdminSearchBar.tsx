import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as searchApi from '@/api/admin/search.api';
import { formatPrice } from '@/utils/currency';

export default function AdminSearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Enter key -> navigate to admin products page with search filter
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      goTo(`/admin/products?search=${encodeURIComponent(trimmed)}`);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSearchSubmit}>
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-admin-muted"
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
            className="w-full pl-9 pr-4 py-2 text-sm bg-admin-hover border border-transparent rounded-lg
              text-admin-text placeholder-admin-muted
              focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 focus:bg-admin-bg
              transition-all duration-200"
          />
          {isLoading && debouncedQuery.length >= 1 && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-admin-border border-t-brand-500 rounded-full animate-spin" />
            </div>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-admin-bg rounded-xl shadow-lg ring-1 ring-admin-border border border-admin-border z-50 overflow-hidden max-h-[400px] overflow-y-auto scrollbar-thin">
          {!isLoading && !hasResults && debouncedQuery.length >= 1 && (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-admin-muted">No results found for "{debouncedQuery}"</p>
            </div>
          )}

          {/* Orders */}
          {results && results.orders.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-admin-hover border-b border-admin-border">
                <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider">Orders</p>
              </div>
              {results.orders.map((order) => (
                <button
                  key={`order-${order.id}`}
                  onClick={() => goTo(`/admin/orders/${order.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-admin-hover transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-admin-hover rounded-lg flex items-center justify-center shrink-0">
                    <img src="/icons/order.svg" alt="" className="w-4 h-4 object-contain dark:invert" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-admin-text">Order #{order.id}</p>
                    <p className="text-xs text-admin-muted truncate">{order.shipping_name} &middot; {order.order_status}</p>
                  </div>
                  <span className="text-sm font-medium text-admin-text shrink-0">
                    {formatPrice(order.total_amount, order.currency)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Products */}
          {results && results.products.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-admin-hover border-b border-admin-border">
                <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider">Products</p>
              </div>
              {results.products.map((product) => (
                <button
                  key={`product-${product.id}`}
                  onClick={() => goTo(`/admin/products?search=${encodeURIComponent(debouncedQuery)}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-admin-hover transition-colors text-left"
                >
                  {product.image_url ? (
                    <img src={product.image_url} alt="" className="w-8 h-8 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-8 h-8 bg-admin-hover rounded-lg flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-admin-text dark:invert" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-admin-text truncate">{product.title}</p>
                    <p className="text-xs text-admin-muted">{product.subject} &middot; Stock: {product.inventory_count}</p>
                  </div>
                  <span className="text-sm font-medium text-admin-text shrink-0">
                    {formatPrice(product.price, product.currency)}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Payments */}
          {results && results.payments.length > 0 && (
            <div>
              <div className="px-3 py-2 bg-admin-hover border-b border-admin-border">
                <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider">Payments</p>
              </div>
              {results.payments.map((payment) => (
                <button
                  key={`payment-${payment.id}`}
                  onClick={() => goTo(`/admin/payments/${payment.id}`)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-admin-hover transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-admin-hover rounded-lg flex items-center justify-center shrink-0">
                    <img src="/icons/payment.svg" alt="" className="w-4 h-4 object-contain dark:invert" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-admin-text">Payment #{payment.id}</p>
                    <p className="text-xs text-admin-muted truncate">
                      {payment.shipping_name || `Order #${payment.order_id}`} &middot;
                      <span className="capitalize"> {payment.status}</span>
                    </p>
                  </div>
                  <span className="text-sm font-medium text-admin-text shrink-0">
                    {formatPrice(payment.amount, payment.currency)}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
