import { useState } from 'react';
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
import { STRIPE_PUBLIC_KEY } from '@/utils/constants';
import ShippingForm from '@/components/checkout/ShippingForm';
import OrderReview from '@/components/checkout/OrderReview';
import StripePaymentForm from '@/components/checkout/StripePaymentForm';
import Spinner from '@/components/common/Spinner';

const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

export default function CheckoutPage() {
  const { items, clearCart, currency } = useCart();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [order, setOrder] = useState<IOrder | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleShippingSubmit(shipping: ShippingAddress) {
    setLoading(true);
    try {
      const orderItems = items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const createFn = isAuthenticated ? ordersApi.create : ordersApi.createGuest;
      const newOrder = await createFn(
        { items: orderItems, shipping, currency },
        crypto.randomUUID()
      );
      setOrder(newOrder);

      const intentFn = isAuthenticated ? paymentsApi.createIntent : paymentsApi.createGuestIntent;
      const { clientSecret: secret } = await intentFn(newOrder.id);
      setClientSecret(secret);
      setStep('payment');
    } catch (err) {
      addToast('error', extractErrorMessage(err));
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-4 mb-8">
        <StepIndicator number={1} label="Shipping" active={step === 'shipping'} completed={step === 'payment'} />
        <div className={`flex-1 h-0.5 ${step === 'payment' ? 'bg-brand-500' : 'bg-gray-200'}`} />
        <StepIndicator number={2} label="Payment" active={step === 'payment'} completed={false} />
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Form */}
        <div className="flex-1">
          {step === 'shipping' && (
            <ShippingForm onSubmit={handleShippingSubmit} loading={loading} />
          )}

          {step === 'payment' && clientSecret && stripePromise && (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <StripePaymentForm
                clientSecret={clientSecret}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
            </Elements>
          )}

          {step === 'payment' && !stripePromise && (
            <div className="text-center py-8">
              <p className="text-sm text-red-600">Stripe is not configured. Please set VITE_STRIPE_PUBLIC_KEY.</p>
            </div>
          )}

          {loading && step === 'shipping' && (
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
