import { useState } from 'react';

interface PaystackPaymentFormProps {
  authorizationUrl: string;
  amount: number | string;
  currency: string;
  currencySymbol?: string;
  onError: (message: string) => void;
}

export default function PaystackPaymentForm({
  authorizationUrl,
  amount,
  currency,
  currencySymbol,
  onError,
}: PaystackPaymentFormProps) {
  const [redirecting, setRedirecting] = useState(false);

  const displayAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const symbol = currencySymbol || currency;

  function handlePayWithPaystack() {
    if (!authorizationUrl) {
      onError('Payment initialization failed. Please try again.');
      return;
    }

    setRedirecting(true);
    window.location.href = authorizationUrl;
  }

  return (
    <div className="max-w-md space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment</h2>

      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <img
            src="/icons/Paystack.webp"
            alt="Paystack"
            className="h-16 w-auto object-contain"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Paystack Secure Checkout</p>
            <p className="text-xs text-gray-500">You will be redirected to Paystack to complete payment</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <p className="text-sm text-gray-600">
            Amount: <span className="font-semibold text-gray-900">{symbol}{displayAmount.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <div className="flex justify-center mt-6 mb-4">
        <button
          type="button"
          onClick={handlePayWithPaystack}
          disabled={redirecting}
          className="inline-block rounded-full px-12 py-3.5 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {redirecting && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Pay with Paystack
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Your payment is processed securely by Paystack. We never store your card details.
      </p>
    </div>
  );
}
