import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/currency';
import type { IOrder } from '@/types/order.types';

interface OrderReviewProps {
  order?: IOrder | null;
}

export default function OrderReview({ order }: OrderReviewProps) {
  const { items, total, currency } = useCart();

  const hasOrder = order !== null && order !== undefined;
  const subtotal = hasOrder ? (Number(order.subtotal) || 0) : total;
  const shippingCost = hasOrder ? (Number(order.shipping_cost) || 0) : 0;
  const taxAmount = hasOrder ? (Number(order.tax_amount) || 0) : 0;
  const taxRate = hasOrder ? (Number(order.tax_rate) || 0) : 0;
  const grandTotal = hasOrder ? (Number(order.total_amount) || 0) : total;
  const displayCurrency = hasOrder ? order.currency : currency;

  return (
    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>

      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item.product_id} className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg overflow-hidden bg-brand-50 shrink-0">
              {item.image_url ? (
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-brand-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-medium text-gray-900 shrink-0">
              {formatPrice(item.price * item.quantity, item.currency)}
            </p>
          </div>
        ))}
      </div>

      {/* Cost breakdown */}
      <div className="border-t border-gray-200 pt-3 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium text-gray-900">{formatPrice(subtotal, displayCurrency)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {hasOrder && order.shipping_carrier && order.shipping_service
              ? `Shipping (${order.shipping_carrier} - ${order.shipping_service})`
              : 'Shipping'}
          </span>
          {hasOrder ? (
            <span className="font-medium text-gray-900">
              {shippingCost > 0 ? formatPrice(shippingCost, displayCurrency) : 'Free'}
            </span>
          ) : (
            <span className="text-gray-500 text-xs">Calculated next</span>
          )}
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">
            {hasOrder && taxRate > 0 ? `Tax (${taxRate}%)` : 'Tax'}
          </span>
          {hasOrder ? (
            <span className="font-medium text-gray-900">
              {taxAmount > 0 ? formatPrice(taxAmount, displayCurrency) : 'N/A'}
            </span>
          ) : (
            <span className="text-gray-500 text-xs">Calculated next</span>
          )}
        </div>

        <div className="border-t border-gray-200 pt-2 flex justify-between">
          <span className="text-base font-semibold text-gray-900">Total</span>
          <span className="text-base font-bold text-gray-900">{formatPrice(grandTotal, displayCurrency)}</span>
        </div>
      </div>
    </div>
  );
}
