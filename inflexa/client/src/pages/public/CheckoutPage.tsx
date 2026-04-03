import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useQuery } from '@tanstack/react-query';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/api/client';
import * as ordersApi from '@/api/orders.api';
import * as paymentsApi from '@/api/payments.api';
import type { GatewayStatus } from '@/api/payments.api';
import type { ShippingAddress } from '@/types/order.types';
import type { IOrder } from '@/types/order.types';
import type { PaymentProvider } from '@/types/payment.types';
import ShippingForm from '@/components/checkout/ShippingForm';
import OrderReview from '@/components/checkout/OrderReview';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import PaystackPaymentForm from '@/components/checkout/PaystackPaymentForm';
import Spinner from '@/components/common/Spinner';

import type { Stripe } from '@stripe/stripe-js';

type CheckoutStep = 'shipping' | 'provider' | 'payment';

const IDEMPOTENCY_STORAGE_KEY = 'inflexa_checkout_idempotency';

/**
 * Session-stable idempotency key.
 * - Stored in sessionStorage (survives refresh within same tab)
 * - Regenerated when cart contents change
 * - Cleared on successful payment or cart empty
 */
function getIdempotencyKey(cartFingerprint: string): string {
  const stored = sessionStorage.getItem(IDEMPOTENCY_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.fingerprint === cartFingerprint && parsed.key) {
        return parsed.key;
      }
    } catch {
      // Corrupted, regenerate
    }
  }
  const key = crypto.randomUUID();
  sessionStorage.setItem(IDEMPOTENCY_STORAGE_KEY, JSON.stringify({ key, fingerprint: cartFingerprint }));
  return key;
}

function clearIdempotencyKey(): void {
  sessionStorage.removeItem(IDEMPOTENCY_STORAGE_KEY);
}

function getCartFingerprint(items: { product_id: number; quantity: number }[], currency: string): string {
  return items.map((i) => `${i.product_id}:${i.quantity}`).sort().join('|') + '::' + currency;
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

  // Fetch which payment gateways are enabled from the backend
  const { data: gatewayStatus, isLoading: gatewayLoading } = useQuery({
    queryKey: ['gateway-status'],
    queryFn: paymentsApi.getGatewayStatus,
    staleTime: 60_000,
  });

  // Stripe state
  const [clientSecret, setClientSecret] = useState('');
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

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

      const fingerprint = getCartFingerprint(orderItems, currency);
      const idempotencyKey = getIdempotencyKey(fingerprint);

      const createFn = isAuthenticated ? ordersApi.create : ordersApi.createGuest;
      const newOrder = await createFn(
        { items: orderItems, shipping, currency },
        idempotencyKey
      );

      // Store guest email so Paystack callback can fetch the order
      if (!isAuthenticated) {
        sessionStorage.setItem('inflexa_guest_shipping_email', shipping.shipping_email);
      }

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
        if (gatewayStatus && gatewayStatus.stripe.publicKey) {
          setStripePromise(loadStripe(gatewayStatus.stripe.publicKey));
        }
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
    clearIdempotencyKey();
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
      <div className="flex items-center gap-2 sm:gap-4 mb-8 overflow-hidden">
        <StepIndicator number={1} label="Shipping" active={step === 'shipping'} completed={currentStepIndex > 0} />
        <div className={`flex-1 h-0.5 ${currentStepIndex >= 1 ? 'bg-mood-toke-green' : 'bg-gray-200'}`} />
        <StepIndicator number={2} label="Method" active={step === 'provider'} completed={currentStepIndex > 1} />
        <div className={`flex-1 h-0.5 ${currentStepIndex >= 2 ? 'bg-mood-toke-green' : 'bg-gray-200'}`} />
        <StepIndicator number={3} label="Payment" active={step === 'payment'} completed={false} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1">
          {step === 'shipping' && (
            <ShippingForm onSubmit={handleShippingSubmit} loading={loading} />
          )}

          {step === 'provider' && !loading && !gatewayLoading && (
            <ProviderSelector
              onSelect={handleProviderSelect}
              loading={loading}
              gatewayStatus={gatewayStatus ?? null}
            />
          )}

          {step === 'provider' && gatewayLoading && (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
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
              <p className="text-sm text-red-600">Stripe is not correctly configured in the backend.</p>
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

function ProviderSelector({ onSelect, loading, gatewayStatus }: {
  onSelect: (provider: PaymentProvider) => void;
  loading: boolean;
  gatewayStatus: GatewayStatus | null;
}) {
  // A gateway is available only if BOTH the frontend public key is configured
  // AND the admin has enabled it in the dashboard settings
  const stripeAvailable = gatewayStatus?.stripe.enabled && Boolean(gatewayStatus?.stripe.publicKey);
  const paystackAvailable = gatewayStatus?.paystack.enabled && Boolean(gatewayStatus?.paystack.publicKey);

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
            className="p-5 border-2 border-gray-200 rounded-xl hover:border-mood-toke-green hover:bg-green-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/icons/Stripe wordmark - Blurple - Large.png"
                alt="Stripe"
                className="h-8 w-auto object-contain"
              />
            </div>
            <p className="text-sm text-gray-500">Pay with credit/debit card via Stripe</p>
          </button>
        )}

        {paystackAvailable && (
          <button
            type="button"
            onClick={() => onSelect('paystack')}
            disabled={loading}
            className="p-5 border-2 border-gray-200 rounded-xl hover:border-mood-toke-green hover:bg-green-50 transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src="/icons/Paystack.webp"
                alt="Paystack"
                className="h-16 w-auto object-contain"
              />
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
    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
      <div
        className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold
          ${completed ? 'bg-mood-toke-green text-white'
            : active ? 'bg-mood-toke-green/90 text-white'
            : 'bg-gray-200 text-gray-500'
          }`}
      >
        {completed ? (
          <img src="/icons/progress.png" alt="completed" className="w-5 h-5 object-contain" style={{ filter: 'brightness(0) invert(1)' }} />
        ) : (
          number
        )}
      </div>
      <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${active || completed ? 'text-gray-900' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}
