import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/utils/currency';
import { flyToCart } from '@/utils/animations';
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

    // Fire the fly-to-cart animation
    const imgEl = document.getElementById(`product-detail-image-${product.id}`) as HTMLImageElement | null;
    if (imgEl) flyToCart(imgEl);

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
          <ProductImage
            src={activeImage}
            alt={product.title}
            size="lg"
            className="lg:h-96"
            imageId={`product-detail-image-${product.id}`}
          />

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
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="blue">Subject: {product.subject}</Badge>
            <Badge variant="brand">Age: {product.age_range}</Badge>
            <Badge variant="gray">Level: {getLevelFromAge(product.age_range)}</Badge>
            <Badge variant={product.format === 'physical' ? 'green' : 'yellow'}>
              {product.format === 'physical' ? 'Physical' : 'Printable'}
            </Badge>
          </div>

          {/* Product Header */}
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">
            {getLevelFromAge(product.age_range)} {product.subject} – Ages {product.age_range}
          </h1>
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
            <div className="flex items-center gap-4 mb-8">
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

          {/* ── What This Pack Covers ───────────────────────── */}
          <div className="mb-6 p-5 bg-brand-50/50 border border-brand-100 rounded-xl">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
              What This Pack Covers
            </h2>
            {product.included_items && product.included_items.length > 0 ? (
              <ul className="space-y-2">
                {product.included_items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-mood-toke-green mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">{product.description}</p>
            )}
          </div>

          {/* ── How It Fits Into The System ──────────────────── */}
          <div className="mb-6 p-5 bg-mood-lavender/20 border border-mood-lavender/40 rounded-xl">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
              </svg>
              How It Fits Into The System
            </h2>
            <p className="text-sm text-gray-700 mb-3">
              This pack is part of the <strong>Inflexa {product.subject} Pathway</strong>
            </p>
            {/* Pathway Visualisation */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1">
              {AGE_STAGES.map((stage, i) => {
                const isCurrent = stage.age === product.age_range;
                return (
                  <div key={stage.age} className="flex items-center shrink-0">
                    <Link
                      to={`/store?subject=${product.subject}&age_range=${stage.age}`}
                      className={`flex flex-col items-center px-3 py-2 rounded-lg transition-all text-center min-w-[4.5rem] ${
                        isCurrent
                          ? 'bg-mood-toke-green text-white shadow-md scale-105'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-xs font-bold">{stage.age}</span>
                      <span className="text-[10px] mt-0.5 opacity-80">{stage.level}</span>
                    </Link>
                    {i < AGE_STAGES.length - 1 && (
                      <svg className="w-4 h-4 text-gray-300 mx-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── How To Use ───────────────────────────────────── */}
          <div className="mb-6 p-5 bg-gray-50 border border-gray-200 rounded-xl">
            <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
              How To Use
            </h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { step: '1', label: 'Pick a card' },
                { step: '2', label: 'Understand' },
                { step: '3', label: 'Practice' },
              ].map((s) => (
                <div key={s.step} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-mood-toke-green/10 flex items-center justify-center text-mood-toke-green font-bold text-lg">
                    {s.step}
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Product Attributes ────────────────────────────── */}
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-50 w-1/3">Subject</td>
                  <td className="px-4 py-3 text-gray-900">{product.subject}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-50">Age Range</td>
                  <td className="px-4 py-3 text-gray-900">{product.age_range}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-50">Level</td>
                  <td className="px-4 py-3 text-gray-900">{product.level || getLevelFromAge(product.age_range)}</td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-50">Format</td>
                  <td className="px-4 py-3 text-gray-900 capitalize">{product.format}</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-semibold text-gray-700 bg-gray-50">Focus Area</td>
                  <td className="px-4 py-3 text-gray-900">{product.focus_area}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Description (below attributes) */}
          <div className="mt-6">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ──────────────────────────────────────────────── */

const AGE_STAGES = [
  { age: '6-8',   level: 'Foundation' },
  { age: '8-10',  level: 'Developing' },
  { age: '10-12', level: 'Expanding' },
  { age: '12-14', level: 'Advanced' },
  { age: '14-16', level: 'Pre-exam' },
];

function getLevelFromAge(ageRange: string): string {
  const match = AGE_STAGES.find((s) => s.age === ageRange);
  return match ? match.level : 'Foundation';
}
