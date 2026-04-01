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
          <img
            src="/icons/Paystack.webp"
            alt="Paystack"
            className="h-12 w-auto object-contain"
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
