import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      fontFamily: 'Inter, system-ui, sans-serif',
      color: '#111827',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#DC2626',
    },
  },
};

export default function StripePaymentForm({ clientSecret, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setProcessing(true);
    setCardError('');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: cardElement },
    });

    setProcessing(false);

    if (error) {
      const msg = error.message || 'Payment failed. Please try again.';
      setCardError(msg);
      onError(msg);
    } else if (paymentIntent?.status === 'succeeded') {
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment</h2>

      <div className="p-4 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-mood-toke-green focus-within:border-mood-toke-green transition-all">
        <CardElement options={CARD_ELEMENT_OPTIONS} />
      </div>

      {cardError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{cardError}</p>
        </div>
      )}

      <div className="flex justify-center mt-6 mb-4">
        <button
          type="submit"
          disabled={!stripe || !elements || processing}
          className="inline-block rounded-full px-12 py-3.5 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Pay Now
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your payment is processed securely by Stripe. We never store your card details.
      </p>
    </form>
  );
}
