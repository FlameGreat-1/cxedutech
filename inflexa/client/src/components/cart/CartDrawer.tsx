import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/currency';

export default function CartDrawer() {
  const { items, total, currency, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-sm text-gray-500 mb-3">Your cart is empty</p>
        <Link
          to="/store"
          className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="space-y-3 mb-4">
        {items.slice(0, 3).map((item) => (
          <div key={item.product_id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-brand-50 shrink-0 overflow-hidden">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-brand-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{item.title}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
          </div>
        ))}
        {items.length > 3 && (
          <p className="text-xs text-gray-500">+{items.length - 3} more items</p>
        )}
      </div>

      <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-3 mb-3">
        <span className="text-gray-600">Total</span>
        <span className="text-gray-900">{formatPrice(total, currency)}</span>
      </div>

      <Link
        to="/cart"
        className="block w-full text-center text-sm font-medium px-4 py-2 bg-brand-600 text-white
          rounded-lg hover:bg-brand-700 transition-colors"
      >
        View Cart
      </Link>
    </div>
  );
}
