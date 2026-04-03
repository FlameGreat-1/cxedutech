import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/utils/currency';
import type { IProduct } from '@/types/product.types';
import ProductImage from './ProductImage';
import Badge from '@/components/common/Badge';

interface ProductInfoProps {
  product: IProduct;
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const { addItem } = useCart();
  const { addToast } = useToast();
  const [quantity, setQuantity] = useState(1);

  // Build image list from images array, falling back to image_url
  const imageUrls: string[] = product.images && product.images.length > 0
    ? product.images.map((img) => img.image_url)
    : product.image_url
      ? [product.image_url]
      : [];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = imageUrls[activeIndex] || null;

  const outOfStock = product.inventory_count === 0;
  const lowStock = product.inventory_count > 0 && product.inventory_count < 5;
  const price = formatPrice(product.price, product.currency);

  function handleAddToCart() {
    if (outOfStock) return;
    addItem(
      {
        product_id: product.id,
        title: product.title,
        price: typeof product.price === 'string' ? parseFloat(product.price) : product.price,
        currency: product.currency,
        image_url: product.image_url,
        format: product.format,
        subject: product.subject,
        age_range: product.age_range,
      },
      quantity
    );
    addToast('success', `${quantity}x ${product.title} added to cart`);
    setQuantity(1);
  }

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-brand-600 transition-colors">Home</Link>
        <span>/</span>
        <Link to="/store" className="hover:text-brand-600 transition-colors">Store</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium truncate">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div>
          {/* Main image */}
          <ProductImage src={activeImage} alt={product.title} size="lg" className="lg:h-96" />

          {/* Thumbnails */}
          {imageUrls.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {imageUrls.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all
                    ${idx === activeIndex
                      ? 'border-brand-500 ring-2 ring-brand-200'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <img
                    src={url}
                    alt={`${product.title} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="brand">{product.age_range} yrs</Badge>
            <Badge variant="blue">{product.subject}</Badge>
            <Badge variant={product.format === 'physical' ? 'green' : 'yellow'}>
              {product.format === 'physical' ? 'Physical' : 'Printable'}
            </Badge>
          </div>

          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.title}</h1>
          <p className="text-sm text-gray-500 mb-4">Focus: {product.focus_area}</p>

          {/* Price */}
          <p className="text-3xl font-bold text-gray-900 mb-6">{price}</p>

          {/* Stock */}
          {outOfStock && (
            <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm font-medium text-red-700">Out of Stock</p>
            </div>
          )}
          {lowStock && (
            <div className="mb-4 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-700">
                Low Stock - Only {product.inventory_count} left
              </p>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {!outOfStock && (
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-gray-50
                    transition-colors rounded-l-lg text-lg font-bold min-w-[2.5rem]"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-base font-semibold text-gray-900 min-w-[3rem] text-center flex items-center justify-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="px-3.5 py-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-gray-50
                    transition-colors rounded-r-lg text-lg font-bold min-w-[2.5rem]"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                className="inline-block rounded-full px-10 py-3 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add to Cart
              </button>
            </div>
          )}

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* What's Included */}
          {product.included_items && product.included_items.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-2">What's Included</h2>
              <ul className="space-y-1.5">
                {product.included_items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
