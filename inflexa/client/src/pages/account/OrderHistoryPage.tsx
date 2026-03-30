import { useOrders } from '@/hooks/useOrders';
import OrderCard from '@/components/order/OrderCard';
import Pagination from '@/components/common/Pagination';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import EmptyState from '@/components/common/EmptyState';
import { useNavigate } from 'react-router-dom';

export default function OrderHistoryPage() {
  const { orders, page, totalPages, isLoading, error, setPage, refetch } = useOrders();
  const navigate = useNavigate();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Order History</h1>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      )}

      {error && <ErrorAlert message={error} onRetry={refetch} />}

      {!isLoading && !error && orders.length === 0 && (
        <EmptyState
          title="No orders yet"
          description="You haven't placed any orders. Browse our flashcard packs to get started."
          actionLabel="Browse Products"
          onAction={() => navigate('/store')}
        />
      )}

      {!isLoading && !error && orders.length > 0 && (
        <>
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
