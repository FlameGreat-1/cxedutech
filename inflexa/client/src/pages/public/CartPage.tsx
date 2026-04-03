import { useCart } from '@/hooks/useCart';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import EmptyState from '@/components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function CartPage() {
  const { items, itemCount } = useCart();
  const navigate = useNavigate();

  if (itemCount === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={
            <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          }
          title="Your cart is empty"
          description="Looks like you haven't added any flashcard packs yet. Browse our collection to find the perfect learning tools."
          actionLabel="Browse Products"
          onAction={() => navigate('/store')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 xl:gap-16">
        {/* Cart Items */}
        <div className="flex-1 lg:max-w-3xl">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
            {items.map((item) => (
              <CartItem key={item.product_id} item={item} />
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="lg:w-96 shrink-0">
          <div className="lg:sticky lg:top-24">
            <CartSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
