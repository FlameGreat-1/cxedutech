import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminOrdersApi from '@/api/admin/orders.api';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/utils/currency';
import { extractErrorMessage } from '@/api/client';
import type { OrderStatus } from '@/types/order.types';
import OrderTimeline from '@/components/order/OrderTimeline';
import OrderItemRow from '@/components/order/OrderItemRow';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';

const STATUSES: OrderStatus[] = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const orderId = id ? parseInt(id, 10) : 0;
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const { data: order, isLoading, error } = useQuery({
    queryKey: ['admin', 'orders', 'detail', orderId],
    queryFn: () => adminOrdersApi.getById(orderId),
    enabled: orderId > 0,
    staleTime: 10_000,
  });

  const statusMutation = useMutation({
    mutationFn: (status: OrderStatus) => adminOrdersApi.updateStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      addToast('success', 'Order status updated.');
    },
  });

  const shipMutation = useMutation({
    mutationFn: () => adminOrdersApi.ship(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] });
      addToast('success', 'Shipment created.');
    },
  });

  async function handleStatusChange(newStatus: OrderStatus) {
    try {
      await statusMutation.mutateAsync(newStatus);
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    }
  }

  async function handleShip() {
    try {
      await shipMutation.mutateAsync();
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error || !order) {
    return <ErrorAlert message="Order not found." />;
  }

  const date = new Date(order.created_at).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-admin-text">Order #{order.id}</h1>
          <p className="text-sm text-admin-muted mt-1">{date}</p>
        </div>
        <div className="flex items-center gap-3">
          {order.order_status === 'Paid' && (
            <Button variant="primary" size="sm" onClick={handleShip} loading={shipMutation.isPending}>
              Ship Order
            </Button>
          )}
          <select
            value={order.order_status}
            onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
            disabled={statusMutation.isPending || order.order_status === 'Delivered' || order.order_status === 'Cancelled'}
            className="text-sm border border-admin-border rounded-lg px-3 py-2 bg-admin-bg text-admin-text focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-admin-bg rounded-xl border border-admin-border p-6 mb-6 transition-colors">
        <OrderTimeline currentStatus={order.order_status} />
      </div>

      {order.tracking_code && (
        <div className="mb-6 px-4 py-3 bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-700 rounded-lg">
          <p className="text-sm text-brand-800 dark:text-brand-300">
            Tracking: <span className="font-medium">{order.tracking_code}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="bg-admin-bg rounded-xl border border-admin-border p-6 transition-colors">
          <h2 className="text-sm font-semibold text-admin-text mb-4">Items</h2>
          <div className="max-h-[420px] overflow-y-auto -mr-2 pr-2 scrollbar-thin">
            {order.items && order.items.map((item) => (
              <OrderItemRow key={item.id} item={item} />
            ))}
          </div>
          <div className="border-t border-admin-border pt-3 mt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-admin-muted">Subtotal</span>
              <span className="font-medium text-admin-text">{formatPrice(order.subtotal, order.currency)}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-admin-muted">
                {order.shipping_carrier && order.shipping_service
                  ? `Shipping (${order.shipping_carrier} - ${order.shipping_service})`
                  : 'Shipping'}
              </span>
              <span className="font-medium text-admin-text">
                {Number(order.shipping_cost) > 0 ? formatPrice(order.shipping_cost, order.currency) : 'Free'}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-admin-muted">{Number(order.tax_rate) > 0 ? `VAT (${Number(order.tax_rate)}%)` : 'Tax'}</span>
              <span className="font-medium text-admin-text">
                {Number(order.tax_amount) > 0 ? formatPrice(order.tax_amount, order.currency) : 'N/A'}
              </span>
            </div>

            <div className="border-t border-admin-border pt-2 flex justify-between">
              <span className="font-semibold text-admin-text">Total</span>
              <span className="font-bold text-admin-text">{formatPrice(order.total_amount, order.currency)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-admin-bg rounded-xl border border-admin-border p-6 transition-colors">
            <h2 className="text-sm font-semibold text-admin-text mb-3">Shipping Address</h2>
            <div className="text-sm text-admin-muted space-y-0.5">
              <p className="font-medium text-admin-text">{order.shipping_name}</p>
              <p>{order.shipping_email}</p>
              {order.shipping_phone && <p>{order.shipping_phone}</p>}
              <p className="mt-2">{order.shipping_address_line1}</p>
              {order.shipping_address_line2 && <p>{order.shipping_address_line2}</p>}
              <p>{order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}</p>
              <p>{order.shipping_country}</p>
            </div>
          </div>

          <div className="bg-admin-bg rounded-xl border border-admin-border p-6 transition-colors">
            <h2 className="text-sm font-semibold text-admin-text mb-2">Customer</h2>
            {order.user_id ? (
              <div className="text-sm text-admin-muted">
                <p className="font-medium text-admin-text">{order.username}</p>
                <p>{order.user_email}</p>
              </div>
            ) : (
              <div className="text-sm text-admin-muted">
                <p className="font-medium text-admin-text">Guest</p>
                <p>{order.shipping_email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
