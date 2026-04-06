import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/api/client';
import * as paymentsApi from '@/api/payments.api';
import { useAuth } from '@/hooks/useAuth';
import Spinner from '@/components/common/Spinner';
import Button from '@/components/common/Button';

export default function PaystackCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { addToast } = useToast();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');
  const verifiedRef = useRef(false);

  const reference = searchParams.get('reference') || searchParams.get('trxref') || '';

  useEffect(() => {
    // Wait for auth to finish restoring the session
    if (authLoading) return;

    if (!reference) {
      setStatus('failed');
      setErrorMessage('No payment reference found. Please try again.');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    async function verify() {
      try {
        const result = await paymentsApi.verifyPaystack(reference);

        if (result.verified) {
          setStatus('success');
          clearCart();
          sessionStorage.removeItem('inflexa_checkout_idempotency');
          addToast('success', 'Payment successful! Your order has been placed.');

          // The verify response now includes the full order from the DB.
          // No second fetch needed - one request, all data.
          const orderId = result.payment.order_id;
          sessionStorage.removeItem('inflexa_guest_shipping_email');

          navigate('/order-confirmation', {
            state: {
              order: result.order || {
                id: orderId,
                shipping_name: 'Customer',
                shipping_email: 'your email',
                subtotal: 0,
                shipping_cost: 0,
                shipping_carrier: null,
                shipping_service: null,
                tax_amount: 0,
                tax_rate: 0,
                total_amount: result.payment.amount,
                currency: result.payment.currency,
                created_at: new Date().toISOString(),
                items: [],
              },
            },
            replace: true,
          });
        } else {
          setStatus('failed');
          setErrorMessage('Payment was not successful. Please try again.');
        }
      } catch (err) {
        setStatus('failed');
        setErrorMessage(extractErrorMessage(err));
      }
    }

    verify();
  }, [reference, authLoading, isAuthenticated, clearCart, addToast, navigate]);

  if (status === 'verifying' || authLoading) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Verifying your payment...</p>
        <p className="mt-1 text-sm text-gray-400">Please do not close this page.</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment Failed</h1>
        <p className="text-gray-600 mb-6">{errorMessage}</p>
        <Button onClick={() => navigate('/cart')} variant="primary" size="lg">
          Return to Cart
        </Button>
      </div>
    );
  }

  return null;
}
