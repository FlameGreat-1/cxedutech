import { useState, type FormEvent } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import * as ordersApi from '@/api/orders.api';
import { extractErrorMessage } from '@/api/client';
import { formatPrice } from '@/utils/currency';
import type { IOrder } from '@/types/order.types';
import Input from '@/components/common/Input';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderItemRow from '@/components/order/OrderItemRow';
import Spinner from '@/components/common/Spinner';

export default function GuestOrderLookupPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Wait for auth state to resolve before deciding
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Logged-in users should use the authenticated track order page
  if (isAuthenticated) {
    return <Navigate to="/account/track-order" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setOrder(null);

    if (!orderId.trim() || !email.trim()) {
      setError('Please fill in both fields.');
      return;
    }

    setLoading(true);
    try {
      const result = await ordersApi.getGuestOrder(parseInt(orderId, 10), email.trim());
      setOrder(result);
    } catch (err) {
      const message = extractErrorMessage(err);
      if (message.toLowerCase().includes('not a guest order')) {
        setError(
          'This order is linked to an account. Please sign in to track it.'
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
      <p className="text-gray-600 mb-8">
        Enter your order number and the email address you used during checkout.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <Input
          label="Order Number"
          type="text"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. 12345"
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />

        <div className="flex justify-center mt-6">
          <button
            type="submit"
            disabled={loading}
            className="inline-block rounded-full px-12 py-3.5 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading && (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            Look Up Order
          </button>
        </div>
      </form>

      <p className="text-center text-sm text-gray-500 mb-8">
        Have an account?{' '}
        <Link
          to="/login?redirect=/account/track-order"
          className="font-medium text-mood-toke-green hover:opacity-80 transition-colors"
        >
          Sign in to track your orders
        </Link>
      </p>

      {/* Order Result */}
      {order && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Order #{order.id}</h2>
            <span className="text-sm text-gray-500">
              {new Date(order.created_at).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}
            </span>
          </div>

          <div className="mb-6">
            <OrderTimeline currentStatus={order.order_status} />
          </div>

          {order.tracking_code && (
            <div className="mb-6 px-4 py-3 bg-brand-50 border border-brand-200 rounded-lg">
              <p className="text-sm text-brand-800">
                Tracking: <span className="font-medium">{order.tracking_code}</span>
              </p>
            </div>
          )}

          {order.items && order.items.length > 0 && (
            <div className="mb-4">
              {order.items.map((item) => (
                <OrderItemRow key={item.id} item={item} />
              ))}
            </div>
          )}

          <div className="border-t border-gray-200 pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">{formatPrice(order.subtotal, order.currency)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {order.shipping_carrier && order.shipping_service
                  ? `Shipping (${order.shipping_carrier} - ${order.shipping_service})`
                  : 'Shipping'}
              </span>
              <span className="font-medium text-gray-900">
                {Number(order.shipping_cost) > 0 ? formatPrice(order.shipping_cost, order.currency) : 'Free'}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{Number(order.tax_rate) > 0 ? `VAT (${Number(order.tax_rate)}%)` : 'Tax'}</span>
              <span className="font-medium text-gray-900">
                {Number(order.tax_amount) > 0 ? formatPrice(order.tax_amount, order.currency) : 'N/A'}
              </span>
            </div>

            <div className="border-t border-gray-200 pt-2 flex justify-between">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-gray-900">{formatPrice(order.total_amount, order.currency)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
