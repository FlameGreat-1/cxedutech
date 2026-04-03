import { formatPrice } from '@/utils/currency';
import type { IOrderItem } from '@/types/order.types';

interface OrderItemRowProps {
  item: IOrderItem;
}

export default function OrderItemRow({ item }: OrderItemRowProps) {
  const unitPrice = formatPrice(item.unit_price, item.currency);
  const subtotal = formatPrice(
    (typeof item.unit_price === 'string' ? parseFloat(item.unit_price) : item.unit_price) * item.quantity,
    item.currency
  );

  return (
    <div className="flex items-center gap-4 py-3 border-b border-admin-border last:border-0">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-brand-50 dark:bg-brand-900/30 shrink-0">
        {item.product_image_url ? (
          <img src={item.product_image_url} alt={item.product_title || 'Product'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-6 h-6 text-brand-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-admin-text dark:text-white truncate">{item.product_title || `Product #${item.product_id}`}</p>
        <p className="text-xs text-admin-muted">{unitPrice} x {item.quantity}</p>
      </div>

      <p className="text-sm font-semibold text-admin-text dark:text-white shrink-0">{subtotal}</p>
    </div>
  );
}
