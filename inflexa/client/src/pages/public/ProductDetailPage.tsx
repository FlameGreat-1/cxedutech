import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '@/hooks/useProduct';
import ProductInfo from '@/components/product/ProductInfo';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const productId = id ? parseInt(id, 10) : null;
  const { product, isLoading, error } = useProduct(productId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ErrorAlert message={error || 'Product not found.'} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProductInfo product={product} />
    </div>
  );
}
