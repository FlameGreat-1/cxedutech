import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { ShippingAddress } from '@/types/order.types';
import { isValidEmail, isNotEmpty, isValidPostalCode } from '@/utils/validators';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
  loading?: boolean;
}

const COUNTRIES = [
  { value: 'GB', label: 'United Kingdom' },
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'AU', label: 'Australia' },
  { value: 'NG', label: 'Nigeria' },
  { value: 'GH', label: 'Ghana' },
  { value: 'KE', label: 'Kenya' },
  { value: 'ZA', label: 'South Africa' },
  { value: 'IE', label: 'Ireland' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'NL', label: 'Netherlands' },
];

export default function ShippingForm({ onSubmit, loading = false }: ShippingFormProps) {
  const [form, setForm] = useState<ShippingAddress>({
    shipping_name: '',
    shipping_email: '',
    shipping_phone: '',
    shipping_address_line1: '',
    shipping_address_line2: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    shipping_country: 'GB',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function update(field: keyof ShippingAddress, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const e: Record<string, string> = {};

    if (!isNotEmpty(form.shipping_name)) e.shipping_name = 'Full name is required.';
    if (!isNotEmpty(form.shipping_email)) e.shipping_email = 'Email is required.';
    else if (!isValidEmail(form.shipping_email)) e.shipping_email = 'Enter a valid email.';
    if (!isNotEmpty(form.shipping_address_line1)) e.shipping_address_line1 = 'Address is required.';
    if (!isNotEmpty(form.shipping_city)) e.shipping_city = 'City is required.';
    if (!isNotEmpty(form.shipping_state)) e.shipping_state = 'State/Province is required.';
    if (!isNotEmpty(form.shipping_postal_code)) e.shipping_postal_code = 'Postal code is required.';
    else if (!isValidPostalCode(form.shipping_postal_code)) e.shipping_postal_code = 'Enter a valid postal code.';

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-5 sm:p-7 space-y-5">
        {/* Header mimicking Stripe form */}
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-base font-semibold text-gray-900">Shipping Details</h2>
          <div className="flex items-center gap-1.5 text-gray-700">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zm11.25 0a1.5 1.5 0 01-3 0 1.5 1.5 0 013 0zm-8.25-3h5.25v-4.5H3v6a1.5 1.5 0 001.5 1.5h.75m10.5-3h1.5a1.5 1.5 0 001.5-1.5v-3l-2.25-3H16.5m-3-6H5.25C4.007 3 3 4.007 3 5.25v1.5m10.5 0V6a1.5 1.5 0 00-1.5-1.5h-4.5A1.5 1.5 0 005.25 6v1.5m10.5 0h2.25a2.25 2.25 0 012.25 2.25v1.5m-15 0h15" />
            </svg>
            <span className="text-[10px] font-bold tracking-widest uppercase mt-[1px]">Secure Delivery</span>
          </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={form.shipping_name}
          onChange={(e) => update('shipping_name', e.target.value)}
          error={errors.shipping_name}
          placeholder="Flame Great"
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          value={form.shipping_email}
          onChange={(e) => update('shipping_email', e.target.value)}
          error={errors.shipping_email}
          placeholder="you@example.com"
          autoComplete="email"
        />
      </div>

      <Input
        label="Phone (optional)"
        type="tel"
        value={form.shipping_phone || ''}
        onChange={(e) => update('shipping_phone', e.target.value)}
        placeholder="+44 7700 900000"
        autoComplete="tel"
      />

      <Input
        label="Address Line 1"
        value={form.shipping_address_line1}
        onChange={(e) => update('shipping_address_line1', e.target.value)}
        error={errors.shipping_address_line1}
        placeholder="123 Main Street"
        autoComplete="address-line1"
      />

      <Input
        label="Address Line 2 (optional)"
        value={form.shipping_address_line2 || ''}
        onChange={(e) => update('shipping_address_line2', e.target.value)}
        placeholder="Flat 4B"
        autoComplete="address-line2"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Input
          label="City"
          value={form.shipping_city}
          onChange={(e) => update('shipping_city', e.target.value)}
          error={errors.shipping_city}
          placeholder="London"
          autoComplete="address-level2"
        />
        <Input
          label="State / Province"
          value={form.shipping_state}
          onChange={(e) => update('shipping_state', e.target.value)}
          error={errors.shipping_state}
          placeholder="England"
          autoComplete="address-level1"
        />
        <Input
          label="Postal Code"
          value={form.shipping_postal_code}
          onChange={(e) => update('shipping_postal_code', e.target.value)}
          error={errors.shipping_postal_code}
          placeholder="SW1A 1AA"
          autoComplete="postal-code"
        />
      </div>

      <Select
        label="Country"
        value={form.shipping_country || 'GB'}
        onChange={(e) => update('shipping_country', e.target.value)}
        options={COUNTRIES}
      />

      {/* Legal agreement notice — required before order placement (UK Consumer Contracts Regulations 2013) */}
      <p className="text-xs text-center text-gray-500 leading-relaxed">
        By placing your order, you agree to our{' '}
        <Link
          to="/terms"
          className="font-medium text-mood-toke-green hover:underline"
        >
          Terms &amp; Conditions
        </Link>{' '}
        and{' '}
        <Link
          to="/privacy"
          className="font-medium text-mood-toke-green hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>

      <div className="flex justify-center mt-8">
        <button
          type="submit"
          disabled={loading}
          className="inline-block rounded-full px-12 py-3.5 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Continue to Payment
        </button>
      </div>
      </div>
    </form>
  );
}
