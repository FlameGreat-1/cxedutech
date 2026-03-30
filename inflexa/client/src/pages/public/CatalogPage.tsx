import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useDebounce } from '@/hooks/useDebounce';
import type { ProductFilters as Filters } from '@/types/product.types';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';
import Pagination from '@/components/common/Pagination';
import Input from '@/components/common/Input';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Build filters from URL params
  const filters: Filters = useMemo(() => {
    const f: Filters = {};
    const subject = searchParams.get('subject');
    const format = searchParams.get('format');
    const minAge = searchParams.get('min_age');
    const maxAge = searchParams.get('max_age');

    if (debouncedSearch) f.search = debouncedSearch;
    if (subject) f.subject = subject;
    if (format) f.format = format;
    if (minAge) f.min_age = parseInt(minAge, 10);
    if (maxAge) f.max_age = parseInt(maxAge, 10);

    return f;
  }, [searchParams, debouncedSearch]);

  const { products, total, page, totalPages, isLoading, error, setPage, refetch } = useProducts(filters);

  function handleFiltersChange(newFilters: Filters) {
    const params = new URLSearchParams();
    if (newFilters.subject) params.set('subject', newFilters.subject);
    if (newFilters.format) params.set('format', newFilters.format);
    if (newFilters.min_age !== undefined) params.set('min_age', String(newFilters.min_age));
    if (newFilters.max_age !== undefined) params.set('max_age', String(newFilters.max_age));
    if (searchInput) params.set('search', searchInput);
    setSearchParams(params, { replace: true });
  }

  function handleSearchChange(value: string) {
    setSearchInput(value);
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Our Flashcard Packs</h1>
        <p className="mt-1 text-gray-600">Discover the perfect learning pack for your child</p>
      </div>

      {/* Search */}
      <div className="mb-6 max-w-md">
        <Input
          placeholder="Search flashcard packs..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <div className="lg:w-64 shrink-0">
          <ProductFilters filters={filters} onChange={handleFiltersChange} />
        </div>

        {/* Products */}
        <div className="flex-1">
          {/* Result count */}
          {!isLoading && !error && (
            <p className="text-sm text-gray-500 mb-4">
              Showing {products.length} of {total} products
            </p>
          )}

          <ProductGrid products={products} isLoading={isLoading} error={error} onRetry={refetch} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
