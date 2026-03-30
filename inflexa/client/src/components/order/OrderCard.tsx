import { Link } from 'react-router-dom';
import { formatPrice } from '@/utils/currency';
import type { IOrder } from '@/types/order.types';
import OrderStatusBadge from './OrderStatusBadge';

interface OrderCardProps {
  order: IOrder;
}

export default function OrderCard({ order }: OrderCardProps) {
  const date = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5 hover:shadow-sm transition-shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h3 className="text-sm font-semibold text-gray-900">Order #{order.id}</h3>
            <OrderStatusBadge status={order.order_status} />
          </div>
          <p className="text-xs text-gray-500">{date}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-gray-900">
              {formatPrice(order.total_amount, order.currency)}
            </p>
            <p className="text-xs text-gray-500">
              {order.items?.length || 0} item{(order.items?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            to={`/account/orders/${order.id}`}
            className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors whitespace-nowrap"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
