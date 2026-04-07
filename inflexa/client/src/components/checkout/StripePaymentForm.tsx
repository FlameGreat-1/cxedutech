import { useState, useCallback } from 'react';
import {
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import type { StripeCardNumberElementChangeEvent } from '@stripe/stripe-js';

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

/* ── Stripe element styling ────────────────────────────────────────────── */
const ELEMENT_STYLE = {
  style: {
    base: {
      fontSize: '14px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      fontWeight: '400',
      color: '#1f2937',
      letterSpacing: '0.025em',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#dc2626', iconColor: '#dc2626' },
  },
};

/* ── Inline SVG icons ──────────────────────────────────────────────────── */
const LOCK_ICON = (
  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);

const GENERIC_CARD_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
  </svg>
);

/* ── Card brand inline SVGs ─────────────────────────────────────────── */
const VISA_SVG = (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Visa">
    <rect rx="4" width="48" height="32" fill="#1A1F71" />
    <path d="M20.1 21h-2.8l1.8-10.8h2.8L20.1 21zm11.6-10.5c-.6-.2-1.4-.4-2.5-.4-2.8 0-4.7 1.4-4.7 3.5 0 1.5 1.4 2.3 2.5 2.8 1.1.5 1.5.9 1.5 1.3 0 .7-.9 1-1.7 1-1.1 0-1.8-.2-2.7-.6l-.4-.2-.4 2.5c.7.3 1.9.6 3.2.6 3 0 4.9-1.4 4.9-3.6 0-1.2-.8-2.1-2.4-2.9-1-.5-1.6-.8-1.6-1.3 0-.4.5-.9 1.6-.9.9 0 1.6.2 2.1.4l.3.1.4-2.3zm7.3-.3h-2.2c-.7 0-1.2.2-1.5.9L31.5 21h3l.6-1.6h3.6l.3 1.6H42l-2.4-10.8h-1.6zm-3.1 7l1.5-3.9.7 3.9h-2.2zM16.4 10.2l-2.7 7.4-.3-1.4c-.5-1.7-2.1-3.5-3.9-4.4l2.5 9.2h3l4.5-10.8h-3.1z" fill="#fff" />
    <path d="M11.2 10.2H6.7l-.1.3c3.6.9 5.9 3 6.9 5.5l-1-4.8c-.2-.7-.7-.9-1.3-1z" fill="#F9A533" />
  </svg>
);

const MASTERCARD_SVG = (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Mastercard">
    <rect rx="4" width="48" height="32" fill="#252525" />
    <circle cx="19" cy="16" r="8" fill="#EB001B" />
    <circle cx="29" cy="16" r="8" fill="#F79E1B" />
    <path d="M24 9.86a7.97 7.97 0 010 12.28 7.97 7.97 0 010-12.28z" fill="#FF5F00" />
  </svg>
);

const AMEX_SVG = (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="American Express">
    <rect rx="4" width="48" height="32" fill="#006FCF" />
    <path d="M7 16.5l-1.2-3h-1L3.5 16.5h1l.3-.7h1.5l.3.7H7zm-1.6-1.3l.5-1.1.5 1.1h-1zm3.5 1.3V13.5h-1.2l-1 2-1-2h-1.2V16.5h.8v-2.2l1.1 2.2h.6l1.1-2.2v2.2h.8zm4.1-2.4v-.6h-2.8v3h2.8v-.6h-2v-.5h1.9v-.6h-1.9v-.5h2v-.2zm2.7 2.4l-1-1.2c.6-.1.9-.5.9-1 0-.6-.5-1-1.2-1h-1.6v3.2h.8v-1.1h.5l.9 1.1h1zm-1.4-1.7h-.7v-.9h.7c.3 0 .5.2.5.5 0 .2-.2.4-.5.4zm3 1.7h.8v-3h-.8v3zm5 0v-.6l-1.5-2.4h-.9v3h.8v-2.1l1.3 2.1h1zm3.8-.6l-.5-.4c-.3.3-.7.5-1.1.5-.7 0-1.2-.5-1.2-1.1s.5-1.1 1.2-1.1c.4 0 .8.2 1.1.5l.5-.4c-.4-.4-1-.7-1.6-.7-1.1 0-2 .8-2 1.8s.9 1.8 2 1.8c.6-.1 1.2-.4 1.6-.9zm5.7.6l-1.2-3h-1L28.3 16.5h1l.3-.7h1.5l.3.7h1.1zm-1.6-1.3l.5-1.1.5 1.1h-1zm5.8 1.3V13.5h-1l-1 2.1-1.1-2.1h-1V16.5h.8v-2.2l1.1 2.2h.6l1-2.2v2.2h.6zm4.5-2.4v-.6h-2.8v3h2.8v-.6h-2v-.5h2v-.6h-2v-.5h2v-.2zm2.7 2.4l-1-1.2c.5-.1.9-.5.9-1 0-.6-.5-1-1.2-1h-1.6v3.2h.8v-1.1h.5l.9 1.1h1zm-1.4-1.7h-.7v-.9h.7c.3 0 .5.2.5.5 0 .2-.2.4-.5.4zm3 1.7h.8v-3H43v3zm3 0v-.6l-1.5-2.4H43.6v3h.8v-2.1l1.3 2.1h.8z" fill="#fff" />
  </svg>
);

const DISCOVER_SVG = (
  <svg viewBox="0 0 48 32" className="h-6 w-auto" aria-label="Discover">
    <rect rx="4" width="48" height="32" fill="#fff" stroke="#E5E7EB" strokeWidth="1" />
    <path d="M48 20c-8 4-20 8-36 10h32a4 4 0 004-4V20z" fill="#F48120" />
    <circle cx="28" cy="16" r="5" fill="#F48120" />
    <path d="M6 13.5h1.2c1.4 0 2.3.9 2.3 2.3s-.9 2.3-2.3 2.3H6v-4.6zm.8.7v3.2h.4c.9 0 1.5-.6 1.5-1.6s-.6-1.6-1.5-1.6h-.4zm3.7-.7h.8v4.6h-.8v-4.6zm3.8 2.8c.5.2.8.5.8 1 0 .6-.5 1-1.3 1-.5 0-1-.2-1.4-.5l.4-.5c.3.2.6.4 1 .4.3 0 .5-.1.5-.3 0-.2-.2-.3-.6-.5-.6-.2-.9-.5-.9-1 0-.6.5-1 1.2-1 .5 0 .9.1 1.2.4l-.4.5c-.2-.2-.5-.3-.8-.3-.3 0-.4.1-.4.3 0 .2.2.3.7.5zm3.2-.6h.7c-.2-.8-.8-1.3-1.6-1.3-1 0-1.8.8-1.8 2.4 0 1.5.8 2.4 1.8 2.4.8 0 1.4-.5 1.6-1.3h-.7c-.2.4-.5.6-.9.6-.6 0-1-.5-1-1.6 0-1.1.4-1.7 1-1.7.4 0 .7.2.9.5zm2.6-1.4c-1.1 0-1.9.9-1.9 2.4 0 1.5.8 2.4 1.9 2.4s1.9-.9 1.9-2.4c0-1.5-.8-2.4-1.9-2.4zm0 .7c.6 0 1.1.6 1.1 1.7 0 1-.5 1.7-1.1 1.7s-1.1-.6-1.1-1.7c0-1 .5-1.7 1.1-1.7zM22 13.5l1.5 4.6h-.9l-.3-1.1h-1.5l-.4 1.1h-.8l1.6-4.6H22zm-.1 1.1l-.6 1.7h1.1l-.5-1.7zm3.3-1.1h1.5c.8 0 1.3.4 1.3 1.1 0 .5-.3.9-.8 1l1 2.5h-.9l-.9-2.3h-.4v2.3h-.8v-4.6zm.8.7v1.2h.6c.4 0 .6-.2.6-.6 0-.4-.2-.6-.6-.6h-.6z" fill="#231F20" />
  </svg>
);

/* Card brand detection → shows icon inline as you type */
function BrandIcon({ brand }: { brand: string }) {
  switch (brand) {
    case 'visa': return VISA_SVG;
    case 'mastercard': return MASTERCARD_SVG;
    case 'amex': return AMEX_SVG;
    case 'discover': return DISCOVER_SVG;
    default: return GENERIC_CARD_ICON;
  }
}

export default function StripePaymentForm({ clientSecret, onSuccess, onError }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [cardBrand, setCardBrand] = useState<string>('unknown');

  const handleCardChange = useCallback((e: StripeCardNumberElementChangeEvent) => {
    setCardBrand(e.brand ?? 'unknown');
    if (e.error) setCardError(e.error.message);
    else setCardError('');
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) return;

    setProcessing(true);
    setCardError('');

    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardNumber,
        billing_details: {
          address: { postal_code: postalCode },
        },
      },
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
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">Payment Details</h2>
        <div className="flex items-center gap-1.5 text-gray-700">
          <img src="/icons/payment.svg" alt="" className="h-4 w-4" />
          <span className="text-xs font-semibold">Secured by Stripe</span>
        </div>
      </div>

      {/* ── Card fields (each on its own row) ────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm overflow-hidden divide-y divide-gray-100">

        {/* Card Number */}
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="flex-1 min-w-0">
            <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-700 mb-px">
              Card number
            </label>
            <CardNumberElement
              options={{ ...ELEMENT_STYLE, showIcon: false }}
              onChange={handleCardChange}
            />
          </div>
          <div className="shrink-0"><BrandIcon brand={cardBrand} /></div>
        </div>

        {/* Expiry */}
        <div className="px-3 py-2">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-700 mb-px">
            Expiry date
          </label>
          <CardExpiryElement options={ELEMENT_STYLE} />
        </div>

        {/* CVC */}
        <div className="px-3 py-2">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-700 mb-px">
            CVC
          </label>
          <CardCvcElement options={ELEMENT_STYLE} />
        </div>

        {/* ZIP / Postal Code */}
        <div className="px-3 py-2">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-gray-700 mb-px">
            ZIP / Postal code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={10}
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="12345"
            className="w-full bg-transparent text-gray-800 placeholder-gray-400 outline-none"
            style={{ fontSize: '14px', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', letterSpacing: '0.025em' }}
          />
        </div>
      </div>

      {/* ── Error message ────────────────────────────────────────────────── */}
      {cardError && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
          <svg className="h-4 w-4 text-red-500 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-red-700">{cardError}</p>
        </div>
      )}

      {/* ── Submit button (matches "Shop All" sizing) ────────────────────── */}
      <div className="flex justify-center pt-1">
        <button
          type="submit"
          disabled={!stripe || !elements || processing}
          className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-3 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-mood-toke-green hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {processing ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing…
            </>
          ) : (
            <>
              {LOCK_ICON}
              Pay Now
            </>
          )}
        </button>
      </div>

      {/* ── Trust badges — real icon files ────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 pt-1">
        {VISA_SVG}
        {MASTERCARD_SVG}
        {AMEX_SVG}
        {DISCOVER_SVG}
      </div>
      <p className="text-[11px] text-gray-400 text-center leading-tight">
        Your payment is encrypted and processed securely. We never store your card details.
      </p>
    </form>
  );
}
