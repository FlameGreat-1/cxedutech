import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { formatPrice } from '@/utils/currency';

export default function CartSummary() {
  const { total, currency, itemCount } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  function handleCheckout() {
    navigate('/checkout');
  }

  return (
    <div className="bg-gray-50 rounded-xl p-6 sm:p-8 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal ({itemCount} items)</span>
          <span className="font-medium text-gray-900">{formatPrice(total, currency)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="text-gray-500">Calculated at checkout</span>
        </div>
        <div className="border-t border-gray-200 pt-3 flex justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold text-gray-900">{formatPrice(total, currency)}</span>
        </div>
      </div>

      <div className="flex justify-center mb-4 mt-2">
        <button
          onClick={handleCheckout}
          disabled={itemCount === 0}
          className="inline-block rounded-full px-10 py-3 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Checkout
        </button>
      </div>

      {!isAuthenticated && (
        <p className="text-center text-sm text-gray-500 mb-3">
          Have an account?{' '}
          <Link
            to="/login?redirect=/checkout"
            className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      )}

      <button
        onClick={() => navigate('/store')}
        className="w-full text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors py-2"
      >
        Continue Shopping
      </button>
    </div>
  );
}
