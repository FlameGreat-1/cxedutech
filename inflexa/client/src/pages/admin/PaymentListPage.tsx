import { useAdminPayments } from '@/hooks/useAdminPayments';
import { formatPrice } from '@/utils/currency';
import Pagination from '@/components/common/Pagination';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import { Link } from 'react-router-dom';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const PROVIDER_STYLES: Record<string, string> = {
  stripe: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  paystack: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
};

export default function PaymentListPage() {
  const { payments, total, page, totalPages, isLoading, error, setPage, refetch } = useAdminPayments();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error) {
    return <ErrorAlert message={error} onRetry={refetch} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-admin-text">Payments</h1>
        <p className="text-sm text-admin-muted">{total} total payments</p>
      </div>

      {payments.length === 0 ? (
        <div className="bg-admin-bg rounded-xl border border-admin-border p-12 text-center transition-colors">
          <img src="/icons/payment.svg" alt="" className="w-12 h-12 mx-auto mb-4 opacity-40 dark:invert" />
          <p className="text-admin-muted">No payments have been made yet.</p>
        </div>
      ) : (
        <div className="bg-admin-bg rounded-xl border border-admin-border overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-admin-hover border-b border-admin-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">ID</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted hidden sm:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">Amount</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">Provider</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-admin-muted hidden md:table-cell">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-admin-muted">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-admin-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-admin-hover transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/payments/${payment.id}`}
                        className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                      >
                        #{payment.id}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/admin/orders/${payment.order_id}`}
                        className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
                      >
                        #{payment.order_id}
                      </Link>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div>
                        <p className="text-admin-text">{payment.shipping_name || '-'}</p>
                        <p className="text-xs text-admin-muted">{payment.shipping_email || ''}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-admin-text">
                      {formatPrice(payment.amount, payment.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PROVIDER_STYLES[payment.provider] || 'bg-admin-hover text-admin-text'}`}>
                        {payment.provider}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[payment.status] || 'bg-admin-hover text-admin-text'}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-admin-muted hidden md:table-cell">
                      {new Date(payment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link to={`/admin/payments/${payment.id}`} className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
