import type { IProduct } from '@/types/product.types';
import ProductCard from './ProductCard';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import EmptyState from '@/components/common/EmptyState';

interface ProductGridProps {
  products: IProduct[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  columns?: 3 | 4 | 5;
}

export default function ProductGrid({ products, isLoading, error, onRetry, columns = 4 }: ProductGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={onRetry} />;
  }

  if (products.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        }
        title="No products found"
        description="Try adjusting your filters or search terms to find what you're looking for."
      />
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${columns === 5 ? 'xl:grid-cols-5' : columns === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-3'} gap-5`}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
