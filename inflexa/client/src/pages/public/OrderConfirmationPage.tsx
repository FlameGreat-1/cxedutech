import { Link, useLocation, Navigate } from 'react-router-dom';
import { formatPrice } from '@/utils/currency';
import type { IOrder } from '@/types/order.types';
import Button from '@/components/common/Button';

export default function OrderConfirmationPage() {
  const location = useLocation();
  const order = (location.state as { order?: IOrder })?.order;

  if (!order) {
    return <Navigate to="/store" replace />;
  }

  const subtotal = Number(order.subtotal);
  const shippingCost = Number(order.shipping_cost);
  const taxAmount = Number(order.tax_amount);
  const taxRate = Number(order.tax_rate);
  const grandTotal = Number(order.total_amount);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
      {/* Success Icon */}
      <div className="flex items-center justify-center mx-auto mb-6">
        <img
          src="/icons/success.png"
          alt="Order placed successfully"
          className="w-20 h-20 object-contain"
        />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
        Thank you, {order.shipping_name.split(' ')[0]}!
      </h1>
      <p className="text-gray-600 mb-8">
        Your order has been placed successfully. We'll send a confirmation email to{' '}
        <span className="font-medium">{order.shipping_email}</span>.
      </p>

      {/* Order Details Card */}
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-left mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Order #{order.id}</h2>
          <span className="text-sm text-gray-500">
            {new Date(order.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            })}
          </span>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="space-y-2 mb-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {item.product_title || `Product #${item.product_id}`} x {item.quantity}
                </span>
                <span className="font-medium text-gray-900">
                  {formatPrice(
                    (typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price) * item.quantity,
                    item.currency
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Cost breakdown */}
        <div className="border-t border-gray-200 pt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatPrice(subtotal, order.currency)}</span>
          </div>

          {shippingCost > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {order.shipping_carrier && order.shipping_service
                  ? `Shipping (${order.shipping_carrier} - ${order.shipping_service})`
                  : 'Shipping'}
              </span>
              <span className="font-medium text-gray-900">{formatPrice(shippingCost, order.currency)}</span>
            </div>
          )}

          {taxAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{taxRate > 0 ? `VAT (${taxRate}%)` : 'Tax'}</span>
              <span className="font-medium text-gray-900">{formatPrice(taxAmount, order.currency)}</span>
            </div>
          )}

          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Grand Total</span>
            <span className="font-bold text-gray-900">{formatPrice(grandTotal, order.currency)}</span>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link to="/store">
          <Button variant="primary" size="lg">Continue Shopping</Button>
        </Link>
        {order.user_id ? (
          <Link to="/account/orders">
            <Button variant="secondary" size="lg">View Your Orders</Button>
          </Link>
        ) : (
          <Link to="/guest-order">
            <Button variant="secondary" size="lg">Track Your Order</Button>
          </Link>
        )}
      </div>
    </div>
  );
}
