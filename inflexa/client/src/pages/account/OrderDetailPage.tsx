import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as ordersApi from '@/api/orders.api';
import { formatPrice } from '@/utils/currency';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderItemRow from '@/components/order/OrderItemRow';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id, 10) : 0;

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['orders', 'mine', 'detail', orderId],
    queryFn: () => ordersApi.getMyOrder(orderId),
    enabled: orderId > 0,
    staleTime: 15_000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <ErrorAlert message="Order not found or you don't have access." />
      </div>
    );
  }

  const date = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const subtotal = Number(order.subtotal);
  const shippingCost = Number(order.shipping_cost);
  const taxAmount = Number(order.tax_amount);
  const taxRate = Number(order.tax_rate);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order #{order.id}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed on {date}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <OrderTimeline currentStatus={order.order_status} />
      </div>

      {/* Tracking */}
      {order.tracking_code && (
        <div className="mb-6 px-4 py-3 bg-brand-50 border border-brand-200 rounded-lg">
          <p className="text-sm text-brand-800">
            Tracking Code: <span className="font-medium">{order.tracking_code}</span>
          </p>
        </div>
      )}

      {/* Items + Cost Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Items</h2>
        {order.items && order.items.map((item) => (
          <OrderItemRow key={item.id} item={item} />
        ))}

        <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="font-medium text-gray-900">{formatPrice(subtotal, order.currency)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {order.shipping_carrier && order.shipping_service
                ? `Shipping (${order.shipping_carrier} - ${order.shipping_service})`
                : 'Shipping'}
            </span>
            <span className="font-medium text-gray-900">
              {shippingCost > 0 ? formatPrice(shippingCost, order.currency) : 'Free'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">{taxRate > 0 ? `VAT (${taxRate}%)` : 'Tax'}</span>
            <span className="font-medium text-gray-900">
              {taxAmount > 0 ? formatPrice(taxAmount, order.currency) : 'N/A'}
            </span>
          </div>

          <div className="border-t border-gray-200 pt-2 flex justify-between">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-bold text-gray-900">{formatPrice(order.total_amount, order.currency)}</span>
          </div>
        </div>
      </div>

      {/* Shipping Address */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Shipping Address</h2>
        <div className="text-sm text-gray-600 space-y-0.5">
          <p className="font-medium text-gray-900">{order.shipping_name}</p>
          <p>{order.shipping_address_line1}</p>
          {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
          <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
          <p>{order.shipping_country}</p>
          {order.shipping_phone && <p className="mt-1">Phone: {order.shipping_phone}</p>}
        </div>
      </div>
    </div>
  );
}
