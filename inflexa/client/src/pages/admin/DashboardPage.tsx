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
      <h1 className="text-2xl font-bold text-admin-text mb-6">Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Products" value={totalProducts} iconSrc="/icons/total.png" />
        <StatCard label="Total Orders" value={totalOrders} iconSrc="/icons/order.svg" />
        <StatCard label="Pending Orders" value={pendingOrders} variant="yellow" iconSrc="/icons/pending.png" />
        <StatCard label="Low / Out of Stock" value={lowStockProducts.length + outOfStockProducts.length} variant={outOfStockProducts.length > 0 ? 'red' : 'default'} iconSrc="/icons/low.png" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-admin-bg rounded-xl border border-admin-border p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-admin-text">Recent Orders</h2>
            <Link to="/admin/orders" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              View all
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-admin-muted py-4 text-center">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-admin-text">#{order.id}</span>
                    <span className="text-admin-muted ml-2">{order.shipping_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-admin-text">
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
        <div className="bg-admin-bg rounded-xl border border-admin-border p-5 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-admin-text">Stock Alerts</h2>
            <Link to="/admin/products" className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
              Manage
            </Link>
          </div>
          {lowStockProducts.length === 0 && outOfStockProducts.length === 0 ? (
            <p className="text-sm text-admin-muted py-4 text-center">All products are well stocked</p>
          ) : (
            <div className="space-y-2">
              {outOfStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm px-3 py-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                  <span className="text-admin-text truncate">{p.title}</span>
                  <span className="text-red-600 dark:text-red-400 font-medium shrink-0">Out of stock</span>
                </div>
              ))}
              {lowStockProducts.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm px-3 py-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                  <span className="text-admin-text truncate">{p.title}</span>
                  <span className="text-yellow-700 dark:text-yellow-400 font-medium shrink-0">{p.inventory_count} left</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, iconSrc, variant = 'default' }: {
  label: string; value: number; icon?: string; iconSrc?: string; variant?: 'default' | 'yellow' | 'red';
}) {
  const bgColor = variant === 'red' ? 'bg-red-50 dark:bg-red-900/30' : variant === 'yellow' ? 'bg-yellow-50 dark:bg-yellow-900/30' : 'bg-brand-50 dark:bg-brand-900/30';
  const iconColor = variant === 'red' ? 'text-red-500' : variant === 'yellow' ? 'text-yellow-600 dark:text-yellow-400' : 'text-brand-600 dark:text-brand-400';

  return (
    <div className="bg-admin-bg rounded-xl border border-admin-border p-5 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          {iconSrc ? (
            <img src={iconSrc} alt="" className="w-5 h-5 object-contain dark:invert" />
          ) : icon ? (
            <svg className={`w-5 h-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
            </svg>
          ) : null}
        </div>
        <div>
          <p className="text-2xl font-bold text-admin-text">{value}</p>
          <p className="text-xs text-admin-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
