import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminOrdersApi from '@/api/admin/orders.api';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/utils/currency';
import { extractErrorMessage } from '@/api/client';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import EmptyState from '@/components/common/EmptyState';
import { Link } from 'react-router-dom';

export default function UnshippedOrdersPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [shippingId, setShippingId] = useState<number | null>(null);

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['admin', 'orders', 'unshipped'],
    queryFn: () => adminOrdersApi.getUnshipped(),
    staleTime: 10_000,
  });

  const shipMutation = useMutation({
    mutationFn: (id: number) => adminOrdersApi.ship(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
    },
    onSettled: () => {
      setShippingId(null);
    },
  });

  async function handleShip(orderId: number) {
    setShippingId(orderId);
    try {
      await shipMutation.mutateAsync(orderId);
      addToast('success', `Order #${orderId} shipped.`);
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorAlert message="Failed to load unshipped orders." onRetry={refetch} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Unshipped Orders</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Orders that are paid but not yet shipped</p>
      </div>

      {(!orders || orders.length === 0) ? (
        <EmptyState
          title="All caught up!"
          description="There are no paid orders waiting to be shipped."
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600 dark:text-gray-300">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order.id}`} className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-900 dark:text-white">{order.shipping_name}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {formatPrice(order.total_amount, order.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusBadge status={order.order_status} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleShip(order.id)}
                        loading={shippingId === order.id}
                        disabled={shippingId !== null}
                      >
                        Ship
                      </Button>
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
