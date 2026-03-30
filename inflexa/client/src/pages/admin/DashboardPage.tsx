import { useAdminProducts } from '@/hooks/useAdminProducts';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { formatPrice } from '@/utils/currency';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import Spinner from '@/components/common/Spinner';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { products, total: totalProducts, isLoading: loadingProducts } = useAdminProducts();
  const { orders, total: totalOrders, isLoading: loadingOrders } = useAdminOrders();

  const isLoading = loadingProducts || loadingOrders;

  const pendingOrders = orders.filter((o) => o.order_status === 'Pending').length;
  const lowStockProducts = products.filter((p) => p.inventory_count < 5 && p.inventory_count > 0);
  const outOfStockProducts = products.filter((p) => p.inventory_count === 0);
  const recentOrders = orders.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Products" value={totalProducts} icon="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
        <StatCard label="Total Orders" value={totalOrders} icon="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
        <StatCard label="Pending Orders" value={pendingOrders} variant="yellow" icon="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        <StatCard label="Low / Out of Stock" value={lowStockProducts.length + outOfStockProducts.length} variant={outOfStockProducts.length > 0 ? 'red' : 'default'} icon="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-900">#{order.id}</span>
                    <span className="text-gray-500 ml-2">{order.shipping_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-gray-900">
                      {formatPrice(order.total_amount, order.currency)}
                    </span>
                    <OrderStatusBadge status={order.order_status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock Alerts */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Stock Alerts</h2>
            <Link to="/admin/products" className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors">
              Manage
            </Link>
          </div>
          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <p className="text-sm text-gray-500 py-4 text-center">All products are well stocked</p>
          ) : (
            <div className="space-y-2">
              {outOfStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm px-3 py-2 bg-red-50 rounded-lg">
                  <span className="text-gray-900 truncate">{p.title}</span>
                  <span className="text-red-600 font-medium shrink-0">Out of stock</span>
                </div>
              ))}
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm px-3 py-2 bg-yellow-50 rounded-lg">
                  <span className="text-gray-900 truncate">{p.title}</span>
                  <span className="text-yellow-700 font-medium shrink-0">{p.inventory_count} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, variant = 'default' }: {
  label: string; value: number; icon: string; variant?: 'default' | 'yellow' | 'red';
}) {
  const bgColor = variant === 'red' ? 'bg-red-50' : variant === 'yellow' ? 'bg-yellow-50' : 'bg-brand-50';
  const iconColor = variant === 'red' ? 'text-red-500' : variant === 'yellow' ? 'text-yellow-600' : 'text-brand-600';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
