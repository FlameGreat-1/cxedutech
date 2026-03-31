import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import type { ProductFilters as Filters } from '@/types/product.types';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';
import Pagination from '@/components/common/Pagination';

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Build filters from URL params (set by FilterBar dropdowns or sidebar)
  const filters: Filters = useMemo(() => {
    const f: Filters = {};
    const search = searchParams.get('search');
    const subject = searchParams.get('subject');
    const format = searchParams.get('format');
    const minAge = searchParams.get('min_age');
    const maxAge = searchParams.get('max_age');

    if (search) f.search = search;
    if (subject) f.subject = subject;
    if (format) f.format = format;
    if (minAge) f.min_age = parseInt(minAge, 10);
    if (maxAge) f.max_age = parseInt(maxAge, 10);

    return f;
  }, [searchParams]);

  const { products, total, page, totalPages, isLoading, error, setPage, refetch } = useProducts(filters);

  // Build a dynamic page heading based on active filters
  const pageHeading = useMemo(() => {
    const parts: string[] = [];

    if (filters.subject) parts.push(filters.subject);
    if (filters.format) parts.push(filters.format.charAt(0).toUpperCase() + filters.format.slice(1));

    let heading = parts.length > 0 ? `${parts.join(' ')} Flashcard Packs` : 'Our Flashcard Packs';

    if (filters.min_age !== undefined && filters.max_age !== undefined) {
      const ageLabel = filters.max_age > 11
        ? `${filters.min_age}+ years`
        : `${filters.min_age}-${filters.max_age} years`;
      heading += ` for ${ageLabel}`;
    }

    if (filters.search) {
      heading = `Results for "${filters.search}"`;
    }

    return heading;
  }, [filters]);

  const pageSubheading = useMemo(() => {
    if (filters.search) return 'Showing matching flashcard packs';
    const hasAnyFilter = filters.subject || filters.format || filters.min_age !== undefined;
    return hasAnyFilter
      ? 'Filtered results - use the sidebar to refine further'
      : 'Discover the perfect learning pack for your child';
  }, [filters]);

  function handleFiltersChange(newFilters: Filters) {
    const params = new URLSearchParams();
    if (newFilters.subject) params.set('subject', newFilters.subject);
    if (newFilters.format) params.set('format', newFilters.format);
    if (newFilters.min_age !== undefined) params.set('min_age', String(newFilters.min_age));
    if (newFilters.max_age !== undefined) params.set('max_age', String(newFilters.max_age));
    // Preserve search if present
    const currentSearch = searchParams.get('search');
    if (currentSearch) params.set('search', currentSearch);
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{pageHeading}</h1>
        <p className="mt-1 text-gray-600">{pageSubheading}</p>
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
