import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import * as adminPaymentsApi from '@/api/admin/payments.api';
import { formatPrice } from '@/utils/currency';
import { extractErrorMessage } from '@/api/client';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const PROVIDER_STYLES: Record<string, string> = {
  stripe: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  paystack: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400',
};

const ORDER_STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  Paid: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  Delivered: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number | string;
  currency: string;
  product_title?: string;
  product_image_url?: string;
}

export default function PaymentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const paymentId = id ? parseInt(id, 10) : 0;

  const { data: payment, isLoading, error } = useQuery({
    queryKey: ['admin', 'payments', 'detail', paymentId],
    queryFn: () => adminPaymentsApi.getById(paymentId),
    enabled: paymentId > 0,
    staleTime: 10_000,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Spinner size="lg" /></div>;
  }

  if (error || !payment) {
    return <ErrorAlert message={error ? extractErrorMessage(error) : 'Payment not found.'} />;
  }

  const p = payment as any;
  const orderItems = (p.order_items as OrderItem[]) || [];
  const createdAt = new Date(payment.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  const orderCreatedAt = p.order_created_at ? new Date(p.order_created_at as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link to="/admin/payments" className="text-sm text-admin-muted hover:text-admin-text transition-colors">
              &larr; Payments
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-admin-text">Payment #{payment.id}</h1>
          <p className="text-sm text-admin-muted mt-1">{createdAt}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${STATUS_STYLES[payment.status] || 'bg-admin-hover text-admin-text'}`}>
            {payment.status}
          </span>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${PROVIDER_STYLES[payment.provider] || 'bg-admin-hover text-admin-text'}`}>
            {payment.provider}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Details Card */}
        <div className="bg-admin-bg rounded-xl border border-admin-border p-6 transition-colors">
          <h2 className="text-sm font-semibold text-admin-text mb-4">Payment Details</h2>
          <dl className="space-y-3">
            <DetailRow label="Amount" value={formatPrice(payment.amount, payment.currency)} />
            <DetailRow label="Currency" value={payment.currency} />
            <DetailRow label="Payment Method" value={payment.payment_method} />
            <DetailRow label="Provider" value={payment.provider === 'stripe' ? 'Stripe' : 'Paystack'} />
            {payment.stripe_payment_intent_id && (
              <DetailRow label="Stripe Intent ID" value={payment.stripe_payment_intent_id} mono />
            )}
            {payment.paystack_reference && (
              <DetailRow label="Paystack Reference" value={payment.paystack_reference} mono />
            )}
            <DetailRow label="Status" value={payment.status} />
            <DetailRow label="Created" value={createdAt} />
          </dl>
        </div>

        {/* Order Info Card */}
        <div className="bg-admin-bg rounded-xl border border-admin-border p-6 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-admin-text">Order Details</h2>
            <Link
              to={`/admin/orders/${payment.order_id}`}
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              View Order &rarr;
            </Link>
          </div>
          <dl className="space-y-3">
            <div className="flex justify-between text-sm">
              <dt className="text-admin-muted">Order ID</dt>
              <dd>
                <Link to={`/admin/orders/${payment.order_id}`} className="font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors">
                  #{payment.order_id}
                </Link>
              </dd>
            </div>
            {p.order_status && (
              <div className="flex justify-between text-sm items-center">
                <dt className="text-admin-muted">Order Status</dt>
                <dd>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ORDER_STATUS_STYLES[p.order_status as string] || 'bg-admin-hover text-admin-text'}`}>
                    {p.order_status as string}
                  </span>
                </dd>
              </div>
            )}
            {p.order_total_amount && (
              <DetailRow label="Order Total" value={formatPrice(p.order_total_amount as number, (p.order_currency as string) || payment.currency)} />
            )}
            {orderCreatedAt && <DetailRow label="Order Date" value={orderCreatedAt} />}
            {p.tracking_code && <DetailRow label="Tracking" value={p.tracking_code as string} mono />}
          </dl>
        </div>

        {/* Customer Card */}
        <div className="bg-admin-bg rounded-xl border border-admin-border p-6 transition-colors">
          <h2 className="text-sm font-semibold text-admin-text mb-3">Customer</h2>
          <div className="text-sm text-admin-text space-y-0.5">
            <p className="font-medium text-admin-text">{p.shipping_name as string || '-'}</p>
            <p className="text-admin-muted">{p.shipping_email as string || ''}</p>
            {p.shipping_phone && <p className="text-admin-muted">{p.shipping_phone as string}</p>}
            {p.shipping_address_line1 && (
              <div className="mt-2 text-admin-text">
                <p>{p.shipping_address_line1 as string}</p>
                {p.shipping_address_line2 && <p>{p.shipping_address_line2 as string}</p>}
                <p>{p.shipping_city as string}, {p.shipping_state as string} {p.shipping_postal_code as string}</p>
                {p.shipping_country && <p>{p.shipping_country as string}</p>}
              </div>
            )}
          </div>
          {p.username && (
            <div className="border-t border-admin-border pt-3 mt-3">
              <p className="text-sm text-admin-muted">
                <span className="font-medium text-admin-text">{p.username as string}</span>
                {p.user_email && <span className="text-admin-muted"> ({p.user_email as string})</span>}
              </p>
            </div>
          )}
          {!p.user_id && (
            <div className="border-t border-admin-border pt-3 mt-3">
              <p className="text-sm text-admin-muted italic">Guest checkout</p>
            </div>
          )}
        </div>

        {/* Order Items Card */}
        {orderItems.length > 0 && (
          <div className="bg-admin-bg rounded-xl border border-admin-border p-6 transition-colors">
            <h2 className="text-sm font-semibold text-admin-text mb-4">Order Items</h2>
            <div className="space-y-3">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  {item.product_image_url ? (
                    <img src={item.product_image_url} alt={item.product_title || ''} className="w-10 h-10 rounded-lg object-cover border border-admin-border" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-admin-hover flex items-center justify-center">
                      <svg className="w-5 h-5 text-admin-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-admin-text dark:text-white truncate">{item.product_title || `Product #${item.product_id}`}</p>
                    <p className="text-xs text-admin-muted">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-admin-text dark:text-white">
                    {formatPrice(item.unit_price, item.currency)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between text-sm">
      <dt className="text-admin-muted">{label}</dt>
      <dd className={`font-medium text-admin-text ${mono ? 'font-mono text-xs break-all text-right max-w-[200px]' : ''}`}>
        {value}
      </dd>
    </div>
  );
}
