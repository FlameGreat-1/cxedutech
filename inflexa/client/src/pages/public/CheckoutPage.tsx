import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/api/client';
import * as ordersApi from '@/api/orders.api';
import * as paymentsApi from '@/api/payments.api';
import type { ShippingAddress } from '@/types/order.types';
import type { IOrder } from '@/types/order.types';
import type { PaymentProvider } from '@/types/payment.types';
import { STRIPE_PUBLIC_KEY, PAYSTACK_PUBLIC_KEY } from '@/utils/constants';
import ShippingForm from '@/components/checkout/ShippingForm';
import OrderReview from '@/components/checkout/OrderReview';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import PaystackPaymentForm from '@/components/checkout/PaystackPaymentForm';
import Spinner from '@/components/common/Spinner';

const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

const stripeAvailable = Boolean(STRIPE_PUBLIC_KEY);
const paystackAvailable = Boolean(PAYSTACK_PUBLIC_KEY);

type CheckoutStep = 'shipping' | 'provider' | 'payment';

/**
 * Generates a deterministic idempotency key from cart contents.
 * Same cart items + currency + auth state = same key, always.
 * This ensures the server deduplicates even across page refreshes,
 * new tabs, or different browser sessions.
 */
async function generateIdempotencyKey(
  items: { product_id: number; quantity: number }[],
  currency: string,
  isAuthenticated: boolean
): Promise<string> {
  const sorted = items
    .map((i) => `${i.product_id}:${i.quantity}`)
    .sort()
    .join('|');
  const payload = `${sorted}::${currency}::${isAuthenticated ? 'auth' : 'guest'}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default function CheckoutPage() {
  const { items, clearCart, currency } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<CheckoutStep>('shipping');
  const [order, setOrder] = useState<IOrder | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<PaymentProvider | null>(null);
  const [loading, setLoading] = useState(false);

  // Stripe state
  const [clientSecret, setClientSecret] = useState('');

  // Paystack state
  const [paystackAuthUrl, setPaystackAuthUrl] = useState('');

  async function handleShippingSubmit(shipping: ShippingAddress) {
    // Reuse existing order only if auth state matches.
    // A guest order cannot be paid by an authenticated user and vice versa.
    if (order) {
      const orderIsGuest = order.user_id === null;
      const currentIsGuest = !isAuthenticated;
      if (orderIsGuest === currentIsGuest) {
        setStep('provider');
        return;
      }
      // Auth state changed since order was created - need a fresh order
      setOrder(null);
    }

    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const idempotencyKey = await generateIdempotencyKey(
        orderItems,
        currency,
        isAuthenticated
      );

      const createFn = isAuthenticated ? ordersApi.create : ordersApi.createGuest;
      const newOrder = await createFn(
        { items: orderItems, shipping, currency },
        idempotencyKey
      );
      setOrder(newOrder);
      setStep('provider');
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleProviderSelect(provider: PaymentProvider) {
    if (!order) return;

    // Use the order's own auth context, not the current isAuthenticated state.
    // This ensures the payment endpoint matches how the order was created.
    const orderIsAuthenticated = order.user_id !== null;

    setSelectedProvider(provider);
    setLoading(true);

    try {
      if (provider === 'stripe') {
        const intentFn = orderIsAuthenticated
          ? paymentsApi.createStripeIntent
          : paymentsApi.createGuestStripeIntent;
        const { clientSecret: secret } = await intentFn(order.id);
        setClientSecret(secret);
      } else {
        const initFn = orderIsAuthenticated
          ? paymentsApi.initializePaystack
          : paymentsApi.initializeGuestPaystack;
        const { authorization_url } = await initFn(order.id);
        setPaystackAuthUrl(authorization_url);
      }
      setStep('payment');
    } catch (err) {
      addToast('error', extractErrorMessage(err));
      setSelectedProvider(null);
    } finally {
      setLoading(false);
    }
  }

  function handlePaymentSuccess() {
    clearCart();
    addToast('success', 'Payment successful! Your order has been placed.');
    navigate('/order-confirmation', { state: { order }, replace: true });
  }

  function handlePaymentError(message: string) {
    addToast('error', message);
  }

  if (items.length === 0 && !order) {
    navigate('/cart', { replace: true });
    return null;
  }

  const currentStepIndex = step === 'shipping' ? 0 : step === 'provider' ? 1 : 2;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-8">
        <StepIndicator number={1} label="Shipping" active={step === 'shipping'} completed={currentStepIndex > 0} />
        <div className={`flex-1 h-0.5 ${currentStepIndex >= 1 ? 'bg-brand-500' : 'bg-gray-200'}`} />
        <StepIndicator number={2} label="Method" active={step === 'provider'} completed={currentStepIndex > 1} />
        <div className={`flex-1 h-0.5 ${currentStepIndex >= 2 ? 'bg-brand-500' : 'bg-gray-200'}`} />
        <StepIndicator number={3} label="Payment" active={step === 'payment'} completed={false} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1">
          {step === 'shipping' && (
            <ShippingForm onSubmit={handleShippingSubmit} loading={loading} />
          )}

          {step === 'provider' && !loading && (
            <ProviderSelector
              onSelect={handleProviderSelect}
              loading={loading}
            />
          )}

          {step === 'payment' && selectedProvider === 'stripe' && clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {step === 'payment' && selectedProvider === 'paystack' && paystackAuthUrl && order && (
            <PaystackPaymentForm
              authorizationUrl={paystackAuthUrl}
              amount={order.total_amount}
              currency={order.currency}
              currencySymbol={order.currency_symbol}
              onError={handlePaymentError}
            />
          )}

          {step === 'payment' && selectedProvider === 'stripe' && !stripePromise && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">Stripe is not configured. Please set VITE_STRIPE_PUBLIC_KEY.</p>
            </div>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}
        </div>

        {/* Order Review Sidebar */}
        <div className="lg:w-80 shrink-0">
          <div className="lg:sticky lg:top-24">
            <OrderReview />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProviderSelector({ onSelect, loading }: {
  onSelect: (provider: PaymentProvider) => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Choose Payment Method</h2>

      {!stripeAvailable && !paystackAvailable && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-5 py-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">Payment Unavailable</p>
              <p className="text-sm text-amber-700 mt-1">
                Online payment is not available at the moment. Please try again later or contact our support team for assistance.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {stripeAvailable && (
          <button
            type="button"
            onClick={() => onSelect('stripe')}
            disabled={loading}
            className="p-5 border-2 border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">Stripe</span>
            </div>
            <p className="text-sm text-gray-500">Pay with credit/debit card via Stripe</p>
          </button>
        )}

        {paystackAvailable && (
          <button
            type="button"
            onClick={() => onSelect('paystack')}
            disabled={loading}
            className="p-5 border-2 border-gray-200 rounded-xl hover:border-brand-500 hover:bg-brand-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                </svg>
              </div>
              <span className="font-semibold text-gray-900">Paystack</span>
            </div>
            <p className="text-sm text-gray-500">Pay with card, bank transfer, or mobile money</p>
          </button>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ number, label, active, completed }: {
  number: number; label: string; active: boolean; completed: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
          ${completed ? 'bg-brand-500 text-white'
            : active ? 'bg-brand-600 text-white'
            : 'bg-gray-200 text-gray-500'
          }`}
      >
        {completed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        ) : (
          number
        )}
      </div>
      <span className={`text-sm font-medium ${active || completed ? 'text-gray-900' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
