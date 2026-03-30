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
  });

  async function handleShip(orderId: number) {
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
        <h1 className="text-2xl font-bold text-gray-900">Unshipped Orders</h1>
        <p className="text-sm text-gray-500">Orders that are paid but not yet shipped</p>
      </div>

      {(!orders || orders.length === 0) ? (
        <EmptyState
          title="All caught up!"
          description="There are no paid orders waiting to be shipped."
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link to={`/admin/orders/${order.id}`} className="font-medium text-brand-600 hover:text-brand-700 transition-colors">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{order.shipping_name}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
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
                        loading={shipMutation.isPending}
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
