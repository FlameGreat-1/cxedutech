import { useQuery } from '@tanstack/react-query';
import * as adminOrdersApi from '@/api/admin/orders.api';
import { formatPrice } from '@/utils/currency';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import EmptyState from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';

export default function ShippedOrdersPage() {
  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'orders', 'shipped'],
    queryFn: () => adminOrdersApi.getShipped(),
    staleTime: 10_000,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorAlert message="Failed to load shipped orders." onRetry={refetch} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-admin-text">Shipped Orders</h1>
        <p className="text-sm text-admin-muted">Orders that have been shipped or delivered</p>
      </div>

      {(!orders || orders.length === 0) ? (
        <EmptyState
          title="No shipped orders"
          description="There are no shipped orders to display."
        />
      ) : (
        <div className="bg-admin-bg rounded-xl border border-admin-border overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-admin-hover border-b border-admin-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order.id}`} className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-admin-text">{order.shipping_name}</td>
                    <td className="px-4 py-3 font-medium text-admin-text">
                      {formatPrice(order.total_amount, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.order_status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
