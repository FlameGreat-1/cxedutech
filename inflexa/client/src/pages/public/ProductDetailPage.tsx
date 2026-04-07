import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProduct } from '@/hooks/useProduct';
import { useProducts } from '@/hooks/useProducts';
import { decodeId, encodeId } from '@/utils/obfuscate';
import ProductInfo from '@/components/product/ProductInfo';
import ProductGrid from '@/components/product/ProductGrid';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? decodeId(id) : null;
  const { product, isLoading, error } = useProduct(productId);

  // Fetch a broad list for prev/next navigation
  const { products: allProducts } = useProducts({}, { limit: 100 });

  // Find current index, previous and next products
  const { prevProduct, nextProduct } = useMemo(() => {
    if (!product || allProducts.length === 0) return { prevProduct: null, nextProduct: null };
    const idx = allProducts.findIndex((p) => p.id === product.id);
    if (idx === -1) return { prevProduct: null, nextProduct: null };
    return {
      prevProduct: idx > 0 ? allProducts[idx - 1] : null,
      nextProduct: idx < allProducts.length - 1 ? allProducts[idx + 1] : null,
    };
  }, [product, allProducts]);

  // Related products: same subject, excluding current product
  const { products: relatedRaw } = useProducts(
    product ? { subject: product.subject } : {},
    { limit: 5 },
  );

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    return relatedRaw.filter((p) => p.id !== product.id).slice(0, 4);
  }, [product, relatedRaw]);

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
      {/* ── Prev / Next Navigation ─────────────────────────── */}
      <div className="flex items-center justify-end gap-2 mb-6">
        {/* Previous */}
        <div className="relative group">
          <button
            onClick={() => prevProduct && navigate(`/product/${encodeId(prevProduct.id)}`)}
            disabled={!prevProduct}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${prevProduct
                ? 'text-gray-700 hover:text-mood-toke-green hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                : 'text-gray-300 border border-gray-100 cursor-not-allowed'
              }`}
            aria-label="Previous product"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Previous
          </button>

          {/* Hover tooltip */}
          {prevProduct && (
            <div className="absolute right-0 top-full mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-52">
                {prevProduct.image_url && (
                  <img
                    src={prevProduct.image_url}
                    alt={prevProduct.title}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="text-xs font-semibold text-gray-900 line-clamp-2">{prevProduct.title}</p>
              </div>
            </div>
          )}
        </div>

        {/* Next */}
        <div className="relative group">
          <button
            onClick={() => nextProduct && navigate(`/product/${encodeId(nextProduct.id)}`)}
            disabled={!nextProduct}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200
              ${nextProduct
                ? 'text-gray-700 hover:text-mood-toke-green hover:bg-gray-50 border border-gray-200 hover:border-gray-300'
                : 'text-gray-300 border border-gray-100 cursor-not-allowed'
              }`}
            aria-label="Next product"
          >
            Next
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

          {/* Hover tooltip */}
          {nextProduct && (
            <div className="absolute right-0 top-full mt-2 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible
              transition-all duration-200 transform translate-y-1 group-hover:translate-y-0 pointer-events-none">
              <div className="bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-52">
                {nextProduct.image_url && (
                  <img
                    src={nextProduct.image_url}
                    alt={nextProduct.title}
                    className="w-full h-28 object-cover rounded-lg mb-2"
                  />
                )}
                <p className="text-xs font-semibold text-gray-900 line-clamp-2">{nextProduct.title}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Product Info ───────────────────────────────────── */}
      <ProductInfo product={product} />

      {/* ── Related Products ───────────────────────────────── */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Related Products</h2>
          <p className="text-gray-500 mb-8">More packs in {product.subject}</p>
          <ProductGrid
            products={relatedProducts}
            isLoading={false}
            error={null}
            columns={4}
          />
        </section>
      )}
    </div>
  );
}

