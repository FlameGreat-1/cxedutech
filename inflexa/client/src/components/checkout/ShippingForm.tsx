import { useState, type FormEvent } from 'react';
import type { ShippingAddress } from '@/types/order.types';
import { isValidEmail, isNotEmpty, isValidPostalCode } from '@/utils/validators';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Shipping Details</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Full Name"
          value={form.shipping_name}
          onChange={(e) => update('shipping_name', e.target.value)}
          error={errors.shipping_name}
          placeholder="John Doe"
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

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Continue to Payment
      </Button>
    </form>
  );
}
