import { useAdminOrders } from '@/hooks/useAdminOrders';
import { useToast } from '@/hooks/useToast';
import { formatPrice } from '@/utils/currency';
import { extractErrorMessage } from '@/api/client';
import type { OrderStatus } from '@/types/order.types';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import Button from '@/components/common/Button';
import Pagination from '@/components/common/Pagination';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import { Link } from 'react-router-dom';

const STATUSES: OrderStatus[] = ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrderListPage() {
  const { orders, total, page, totalPages, isLoading, error, setPage, refetch, updateStatus, exportCsv, isUpdatingStatus } = useAdminOrders();
  const { addToast } = useToast();

  async function handleStatusChange(orderId: number, newStatus: OrderStatus) {
    try {
      await updateStatus({ id: orderId, status: newStatus });
      addToast('success', `Order #${orderId} updated to ${newStatus}.`);
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    }
  }

  async function handleExport() {
    try {
      await exportCsv();
      addToast('success', 'CSV exported successfully.');
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-sm text-gray-500">{total} total orders</p>
        </div>
        <Button variant="secondary" onClick={handleExport}>Export CSV</Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Date</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
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
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div>
                      <p className="text-gray-900">{order.shipping_name}</p>
                      <p className="text-xs text-gray-500">{order.shipping_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {formatPrice(order.total_amount, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.order_status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                      disabled={isUpdatingStatus || order.order_status === 'Delivered' || order.order_status === 'Cancelled'}
                      className="text-xs border border-gray-300 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                    {new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/admin/orders/${order.id}`} className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
