import { useState, type FormEvent } from 'react';
import * as ordersApi from '@/api/orders.api';
import { extractErrorMessage } from '@/api/client';
import { formatPrice } from '@/utils/currency';
import type { IOrder } from '@/types/order.types';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderItemRow from '@/components/order/OrderItemRow';

export default function GuestOrderLookupPage() {
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState<IOrder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      setError(extractErrorMessage(err));
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

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Look Up Order
        </Button>
      </form>

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

          <div className="border-t border-gray-200 pt-3 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">
              {formatPrice(order.total_amount, order.currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
