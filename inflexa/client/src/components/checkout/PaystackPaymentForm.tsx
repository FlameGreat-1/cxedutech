import { useState } from 'react';
import Button from '@/components/common/Button';

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
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment</h2>

      <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
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

      <Button
        type="button"
        onClick={handlePayWithPaystack}
        loading={redirecting}
        className="w-full"
        size="lg"
      >
        Pay with Paystack
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Your payment is processed securely by Paystack. We never store your card details.
      </p>
    </div>
  );
}
