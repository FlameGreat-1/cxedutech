import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/useToast';
import { useAdminSettings } from '@/hooks/useAdminSettings';
import { changePassword } from '@/api/user.api';
import { extractErrorMessage } from '@/api/client';
import { validatePassword } from '@/utils/validators';
import Button from '@/components/common/Button';
import Spinner from '@/components/common/Spinner';
import ErrorAlert from '@/components/common/ErrorAlert';
import type { PaymentGatewayProvider } from '@/types/settings.types';
import type { ShippingProvider } from '@/types/settings.types';

type Tab = 'password' | 'gateways' | 'shipping' | 'tax';

const TABS: { key: Tab; label: string }[] = [
  { key: 'password', label: 'Change Password' },
  { key: 'gateways', label: 'Payment Gateways' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'tax', label: 'Tax' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('password');

  return (
    <div>
      <h1 className="text-2xl font-bold text-admin-text mb-6">Settings</h1>

      {/* Tab bar */}
      <div className="border-b border-admin-border mb-6">
        <nav className="flex gap-6 -mb-px">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors duration-150
                ${activeTab === tab.key
                  ? 'border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400'
                  : 'border-transparent text-admin-muted hover:text-admin-text hover:border-admin-border'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'password' && <ChangePasswordTab />}
      {activeTab === 'gateways' && <PaymentGatewaysTab />}
      {activeTab === 'shipping' && <ShippingTab />}
      {activeTab === 'tax' && <TaxTab />}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Change Password Tab
// ──────────────────────────────────────────────────────────────────────────────

function ChangePasswordTab() {
  const { addToast } = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!currentPassword) e.currentPassword = 'Current password is required.';
    const pwResult = validatePassword(newPassword);
    if (!newPassword) {
      e.newPassword = 'New password is required.';
    } else if (!pwResult.valid) {
      e.newPassword = pwResult.errors[0];
    }
    if (newPassword !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(ev: FormEvent) {
    ev.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await changePassword({ current_password: currentPassword, new_password: newPassword });
      addToast('success', 'Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  function EyeButton({ show, onToggle }: { show: boolean; onToggle: () => void }) {
    return (
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-text transition-colors"
        tabIndex={-1}
      >
        {show ? (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        )}
      </button>
    );
  }

  return (
    <div className="max-w-lg">
      <div className="bg-admin-bg rounded-xl border border-admin-border transition-colors">
        <div className="px-6 py-4 border-b border-admin-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-50 dark:bg-brand-900/30 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-admin-text">Change Password</h2>
              <p className="text-xs text-admin-muted">Update your account password</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {apiError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3">
              <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
            </div>
          )}

          <div>
            <label htmlFor="current-password" className="block text-sm font-medium text-admin-text mb-1.5">Current Password</label>
            <div className="relative">
              <input id="current-password" type={showCurrent ? 'text' : 'password'} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password"
                className={`w-full px-4 py-3 pr-11 border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 transition-colors duration-150 ${errors.currentPassword ? 'border-red-500 focus:ring-red-500' : 'border-admin-border focus:ring-brand-500 focus:border-brand-500'}`} />
              <EyeButton show={showCurrent} onToggle={() => setShowCurrent((p) => !p)} />
            </div>
            {errors.currentPassword && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>}
          </div>

          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-admin-text mb-1.5">New Password</label>
            <div className="relative">
              <input id="new-password" type={showNew ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 number" autoComplete="new-password"
                className={`w-full px-4 py-3 pr-11 border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 transition-colors duration-150 ${errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-admin-border focus:ring-brand-500 focus:border-brand-500'}`} />
              <EyeButton show={showNew} onToggle={() => setShowNew((p) => !p)} />
            </div>
            {errors.newPassword && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-admin-text mb-1.5">Confirm New Password</label>
            <div className="relative">
              <input id="confirm-password" type={showConfirm ? 'text' : 'password'} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password"
                className={`w-full px-4 py-3 pr-11 border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 transition-colors duration-150 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-admin-border focus:ring-brand-500 focus:border-brand-500'}`} />
              <EyeButton show={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />
            </div>
            {errors.confirmPassword && <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
          </div>

          <div className="rounded-lg bg-admin-hover border border-admin-border px-4 py-3">
            <p className="text-xs font-medium text-admin-muted mb-1.5">Password requirements:</p>
            <ul className="text-xs text-admin-muted space-y-0.5">
              <li className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full ${newPassword.length >= 8 ? 'bg-brand-500' : 'bg-admin-muted'}`} />
                At least 8 characters
              </li>
              <li className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-brand-500' : 'bg-admin-muted'}`} />
                One uppercase letter
              </li>
              <li className="flex items-center gap-1.5">
                <span className={`w-1 h-1 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-brand-500' : 'bg-admin-muted'}`} />
                One number
              </li>
            </ul>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={loading} size="sm">Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Payment Gateways Tab
// ──────────────────────────────────────────────────────────────────────────────

const CURRENCY_OPTIONS = [
  { value: 'GBP', label: 'GBP (\u00a3)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (\u20ac)' },
  { value: 'NGN', label: 'NGN (\u20a6)' },
  { value: 'ZAR', label: 'ZAR (R)' },
  { value: 'GHS', label: 'GHS (GH\u20b5)' },
  { value: 'KES', label: 'KES (KSh)' },
  { value: 'CAD', label: 'CAD (C$)' },
  { value: 'AUD', label: 'AUD (A$)' },
  { value: 'JPY', label: 'JPY (\u00a5)' },
];

function PaymentGatewaysTab() {
  const { gateways, gatewaysLoading, gatewaysError, refetchGateways, updateGateway, isUpdatingGateway } = useAdminSettings();
  const { addToast } = useToast();

  if (gatewaysLoading) {
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (gatewaysError) {
    return <ErrorAlert message={gatewaysError} onRetry={refetchGateways} />;
  }

  return (
    <div className="space-y-6">
      {gateways.map((gw) => (
        <GatewayCard
          key={gw.provider}
          gateway={gw}
          onSave={async (data) => {
            try {
              await updateGateway({ provider: gw.provider, data });
              addToast('success', `${gw.provider.charAt(0).toUpperCase() + gw.provider.slice(1)} config updated.`);
            } catch (err) {
              addToast('error', extractErrorMessage(err));
            }
          }}
          isSaving={isUpdatingGateway}
        />
      ))}
    </div>
  );
}

function GatewayCard({
  gateway,
  onSave,
  isSaving,
}: {
  gateway: { provider: PaymentGatewayProvider; currency: string; has_public_key: boolean; masked_public_key?: string; has_secret_key: boolean; masked_secret_key?: string; has_webhook_secret: boolean; masked_webhook_secret?: string; is_enabled: boolean };
  onSave: (data: { currency?: string; public_key?: string; secret_key?: string; webhook_secret?: string; is_enabled?: boolean }) => Promise<void>;
  isSaving: boolean;
}) {
  const [currency, setCurrency] = useState(gateway.currency);
  const [publicKey, setPublicKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [enabled, setEnabled] = useState(gateway.is_enabled);
  const [saving, setSaving] = useState(false);

  const providerLabel = gateway.provider === 'stripe' ? 'Stripe' : 'Paystack';


  async function handleSave(ev: FormEvent) {
    ev.preventDefault();
    setSaving(true);
    const data: Record<string, unknown> = { currency, is_enabled: enabled };
    if (publicKey.trim()) data.public_key = publicKey.trim();
    if (secretKey.trim()) data.secret_key = secretKey.trim();
    if (webhookSecret.trim()) data.webhook_secret = webhookSecret.trim();
    await onSave(data as { currency?: string; public_key?: string; secret_key?: string; webhook_secret?: string; is_enabled?: boolean });
    setPublicKey('');
    setSecretKey('');
    setWebhookSecret('');
    setSaving(false);
  }

  async function handleToggle() {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    await onSave({ is_enabled: newEnabled });
  }

  return (
    <div className="bg-admin-bg rounded-xl border border-admin-border transition-colors">
      <div className="px-6 py-4 border-b border-admin-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-admin-hover rounded-xl flex items-center justify-center p-2">
            <img
              src={gateway.provider === 'stripe' ? '/icons/Stripe wordmark - Blurple - Large.png' : '/icons/Paystack.svg'}
              alt={providerLabel}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-admin-text">{providerLabel}</h3>
            <p className="text-xs text-admin-muted">
              {gateway.has_secret_key ? 'Secret key configured' : 'No secret key set'}
            </p>
          </div>
        </div>

        {/* Toggle */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isSaving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            ${enabled ? 'bg-brand-600' : 'bg-admin-border'}`}
          role="switch"
          aria-checked={enabled}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-admin-text mb-1.5">Currency</label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150 appearance-none"
          >
            {CURRENCY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1.5">
            Public Key / Publishable Key
            {gateway.has_public_key && (
              <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">(configured)</span>
            )}
          </label>
          <input
            type="password"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder={gateway.masked_public_key || (gateway.has_public_key ? 'Encrypted key set' : 'Enter public key')}
            className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1.5">
            Secret Key
            {gateway.has_secret_key && (
              <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">(configured)</span>
            )}
          </label>
          <input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder={gateway.masked_secret_key || (gateway.has_secret_key ? 'Encrypted key set' : 'Enter secret key')}
            className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1.5">
            Webhook Secret
            {gateway.has_webhook_secret && (
              <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">(configured)</span>
            )}
          </label>
          <input
            type="password"
            value={webhookSecret}
            onChange={(e) => setWebhookSecret(e.target.value)}
            placeholder={gateway.masked_webhook_secret || (gateway.has_webhook_secret ? 'Encrypted secret set' : 'Enter webhook secret')}
            className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving || isSaving} size="sm">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Shipping Tab
// ──────────────────────────────────────────────────────────────────────────────

const SHIPPING_PROVIDERS: { value: ShippingProvider; label: string }[] = [
  { value: 'easypost', label: 'EasyPost' },
  { value: 'shipengine', label: 'ShipEngine' },
  { value: 'shippo', label: 'Shippo' },
  { value: 'easyship', label: 'Easyship' },
];

function ShippingTab() {
  const {
    shippingConfigs, shippingLoading, shippingError, refetchShipping,
    createShipping, updateShipping, deleteShipping,
    isCreatingShipping, isUpdatingShipping, isDeletingShipping,
  } = useAdminSettings();
  const { addToast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProvider, setNewProvider] = useState<ShippingProvider>('easypost');
  const [newApiKey, setNewApiKey] = useState('');

  if (shippingLoading) {
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (shippingError) {
    return <ErrorAlert message={shippingError} onRetry={refetchShipping} />;
  }

  const existingProviders = new Set(shippingConfigs.map((c) => c.provider));
  const availableProviders = SHIPPING_PROVIDERS.filter((p) => !existingProviders.has(p.value));

  async function handleAddShipping(ev: FormEvent) {
    ev.preventDefault();
    try {
      await createShipping({ provider: newProvider, api_key: newApiKey.trim() || undefined, is_enabled: true });
      addToast('success', `${SHIPPING_PROVIDERS.find((p) => p.value === newProvider)?.label} shipping method added.`);
      setShowAddForm(false);
      setNewApiKey('');
    } catch (err) {
      addToast('error', extractErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      {/* Existing shipping configs */}
      {shippingConfigs.map((config) => (
        <ShippingCard
          key={config.provider}
          config={config}
          onUpdate={async (data) => {
            try {
              await updateShipping({ provider: config.provider, data });
              addToast('success', `${SHIPPING_PROVIDERS.find((p) => p.value === config.provider)?.label || config.provider} updated.`);
            } catch (err) {
              addToast('error', extractErrorMessage(err));
            }
          }}
          onDelete={async () => {
            try {
              await deleteShipping(config.provider);
              addToast('success', `${SHIPPING_PROVIDERS.find((p) => p.value === config.provider)?.label || config.provider} removed.`);
            } catch (err) {
              addToast('error', extractErrorMessage(err));
            }
          }}
          isSaving={isUpdatingShipping}
          isDeleting={isDeletingShipping}
        />
      ))}

      {/* New shipping method */}
      {availableProviders.length > 0 && (
        <div>
          {!showAddForm ? (
            <button
              onClick={() => {
                setNewProvider(availableProviders[0].value);
                setShowAddForm(true);
              }}
              className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Shipping Method
            </button>
          ) : (
            <div className="bg-admin-bg rounded-xl border border-admin-border transition-colors">
              <div className="px-6 py-4 border-b border-admin-border">
                <h3 className="text-sm font-semibold text-admin-text">Add Shipping Method</h3>
              </div>
              <form onSubmit={handleAddShipping} className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-admin-text mb-1.5">Provider</label>
                  <select
                    value={newProvider}
                    onChange={(e) => setNewProvider(e.target.value as ShippingProvider)}
                    className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150 appearance-none"
                  >
                    {availableProviders.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-admin-text mb-1.5">API Key</label>
                  <input
                    type="password"
                    value={newApiKey}
                    onChange={(e) => setNewApiKey(e.target.value)}
                    placeholder="Enter API key"
                    className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="ghost" type="button" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
                  <Button type="submit" loading={isCreatingShipping} size="sm">Add Method</Button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {shippingConfigs.length === 0 && !showAddForm && (
        <div className="bg-admin-bg rounded-xl border border-admin-border p-12 text-center transition-colors">
          <img src="/icons/shipping.png" alt="" className="w-12 h-12 mx-auto mb-4 opacity-40 dark:invert" />
          <p className="text-admin-muted">No shipping methods configured yet.</p>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────
// Tax Tab
// ──────────────────────────────────────────────────────────────────────────────

function TaxTab() {
  const { taxConfigs, taxLoading, taxError, refetchTax, updateTax, isUpdatingTax } = useAdminSettings();
  const { addToast } = useToast();

  if (taxLoading) {
    return <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>;
  }

  if (taxError) {
    return <ErrorAlert message={taxError} onRetry={refetchTax} />;
  }

  if (taxConfigs.length === 0) {
    return (
      <div className="bg-admin-bg rounded-xl border border-admin-border p-12 text-center transition-colors">
        <p className="text-admin-muted">No tax configurations found. Run database migrations to seed the default UK VAT config.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {taxConfigs.map((config) => (
        <TaxCard
          key={config.region}
          config={config}
          onUpdate={async (data) => {
            try {
              await updateTax({ region: config.region, data });
              addToast('success', `${config.tax_label} (${config.region}) updated.`);
            } catch (err) {
              addToast('error', extractErrorMessage(err));
            }
          }}
          isSaving={isUpdatingTax}
        />
      ))}
    </div>
  );
}

function TaxCard({
  config,
  onUpdate,
  isSaving,
}: {
  config: { region: string; tax_label: string; tax_rate: number; is_enabled: boolean };
  onUpdate: (data: { tax_label?: string; tax_rate?: number; is_enabled?: boolean }) => Promise<void>;
  isSaving: boolean;
}) {
  const [taxLabel, setTaxLabel] = useState(config.tax_label);
  const [taxRate, setTaxRate] = useState(String(config.tax_rate));
  const [enabled, setEnabled] = useState(config.is_enabled);
  const [saving, setSaving] = useState(false);

  async function handleSave(ev: FormEvent) {
    ev.preventDefault();
    const rate = parseFloat(taxRate);
    if (isNaN(rate) || rate < 0 || rate > 100) return;
    setSaving(true);
    await onUpdate({ tax_label: taxLabel.trim(), tax_rate: rate, is_enabled: enabled });
    setSaving(false);
  }

  async function handleToggle() {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    await onUpdate({ is_enabled: newEnabled });
  }

  return (
    <div className="bg-admin-bg rounded-xl border border-admin-border transition-colors">
      <div className="px-6 py-4 border-b border-admin-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-admin-hover rounded-xl flex items-center justify-center p-2.5">
            <svg className="w-7 h-7 text-admin-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-admin-text">{config.tax_label} ({config.region})</h3>
            <p className="text-xs text-admin-muted">
              {config.is_enabled ? `${config.tax_rate}% applied to orders` : 'Disabled (defaults to 0%)'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggle}
          disabled={isSaving}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
            ${enabled ? 'bg-brand-600' : 'bg-admin-border'}`}
          role="switch"
          aria-checked={enabled}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
        <div className="rounded-lg bg-admin-hover border border-admin-border px-4 py-3">
          <p className="text-xs text-admin-muted">
            When disabled, tax defaults to 0% and the admin can calculate it manually. When enabled, the configured rate is automatically applied to the subtotal during checkout.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1.5">Tax Label</label>
          <input
            type="text"
            value={taxLabel}
            onChange={(e) => setTaxLabel(e.target.value)}
            placeholder="e.g. VAT"
            className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-admin-text mb-1.5">Tax Rate (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(e.target.value)}
            placeholder="20.00"
            className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150"
          />
          {(parseFloat(taxRate) < 0 || parseFloat(taxRate) > 100) && (
            <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">Rate must be between 0 and 100.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" loading={saving || isSaving} size="sm">Save Changes</Button>
        </div>
      </form>
    </div>
  );
}

function ShippingCard({
  config,
  onUpdate,
  onDelete,
  isSaving,
  isDeleting,
}: {
  config: { provider: ShippingProvider; has_api_key: boolean; masked_api_key?: string; is_enabled: boolean; fallback_rate: number };
  onUpdate: (data: { api_key?: string; is_enabled?: boolean; fallback_rate?: number }) => Promise<void>;
  onDelete: () => Promise<void>;
  isSaving: boolean;
  isDeleting: boolean;
}) {
  const [apiKey, setApiKey] = useState('');
  const [enabled, setEnabled] = useState(config.is_enabled);
  const [fallbackRate, setFallbackRate] = useState(String(config.fallback_rate ?? 5));
  const [saving, setSaving] = useState(false);

  const providerLabel = SHIPPING_PROVIDERS.find((p) => p.value === config.provider)?.label || config.provider;

  async function handleSave(ev: FormEvent) {
    ev.preventDefault();
    const rate = parseFloat(fallbackRate);
    if (isNaN(rate) || rate < 0) return;
    setSaving(true);
    const data: { api_key?: string; is_enabled?: boolean; fallback_rate?: number } = { is_enabled: enabled, fallback_rate: rate };
    if (apiKey.trim()) data.api_key = apiKey.trim();
    await onUpdate(data);
    setApiKey('');
    setSaving(false);
  }

  async function handleToggle() {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    await onUpdate({ is_enabled: newEnabled });
  }

  return (
    <div className="bg-admin-bg rounded-xl border border-admin-border transition-colors">
      <div className="px-6 py-4 border-b border-admin-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-admin-hover rounded-xl flex items-center justify-center p-2.5">
            <img src="/icons/shipping.png" alt="" className="w-full h-full object-contain dark:invert" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-admin-text">{providerLabel}</h3>
            <p className="text-xs text-admin-muted">
              {config.has_api_key ? 'API key configured' : 'No API key set'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            disabled={isSaving}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2
              ${enabled ? 'bg-brand-600' : 'bg-admin-border'}`}
            role="switch"
            aria-checked={enabled}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="p-1.5 text-red-500 hover:text-red-600 transition-colors rounded-lg hover:bg-admin-hover"
            title="Remove shipping method"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              API Key
              {config.has_api_key && (
                <span className="ml-2 text-xs font-normal text-green-600 dark:text-green-400">(configured)</span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={config.masked_api_key || (config.has_api_key ? 'Encrypted key set' : 'Enter API key')}
              className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-admin-text mb-1.5">
              Fallback Shipping Rate
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fallbackRate}
              onChange={(e) => setFallbackRate(e.target.value)}
              placeholder="5.00"
              className="w-full px-4 py-3 border border-admin-border rounded-lg text-admin-text bg-admin-bg placeholder-admin-muted focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors duration-150"
            />
            <p className="mt-1.5 text-xs text-admin-muted">
              Flat rate charged when the shipping provider cannot return rates (e.g. address issues, API errors). Set to 0 for free shipping as fallback.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" loading={saving || isSaving} size="sm">Save Changes</Button>
          </div>
        </form>
    </div>
  );
}
