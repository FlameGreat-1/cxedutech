import { useState, type FormEvent } from 'react';
import { useToast } from '@/hooks/useToast';
import { changePassword } from '@/api/user.api';
import { extractErrorMessage } from '@/api/client';
import { validatePassword } from '@/utils/validators';
import Button from '@/components/common/Button';

export default function AdminChangePasswordPage() {
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

  return (
    <div>
      <h1 className="text-2xl font-bold text-admin-text mb-6">Settings</h1>

      <div className="max-w-lg">
        <div className="bg-admin-bg rounded-xl border border-admin-border transition-colors">
          {/* Card header */}
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
            {apiError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 px-4 py-3">
                <p className="text-sm text-red-700 dark:text-red-400">{apiError}</p>
              </div>
            )}

            {/* Current Password */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-admin-text mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  className={`w-full px-4 py-3 pr-11 border rounded-lg text-admin-text bg-admin-bg placeholder:text-admin-muted
                    focus:outline-none focus:ring-2 transition-colors duration-150
                    ${errors.currentPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-admin-border focus:ring-brand-500 focus:border-brand-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-text transition-colors"
                  tabIndex={-1}
                >
                  {showCurrent ? (
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
              </div>
              {errors.currentPassword && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-admin-text mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 8 chars, 1 uppercase, 1 number"
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 border rounded-lg text-admin-text bg-admin-bg placeholder:text-admin-muted
                    focus:outline-none focus:ring-2 transition-colors duration-150
                    ${errors.newPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-admin-border focus:ring-brand-500 focus:border-brand-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowNew((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-text transition-colors"
                  tabIndex={-1}
                >
                  {showNew ? (
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
              </div>
              {errors.newPassword && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-admin-text mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 border rounded-lg text-admin-text bg-admin-bg placeholder:text-admin-muted
                    focus:outline-none focus:ring-2 transition-colors duration-150
                    ${errors.confirmPassword
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-admin-border focus:ring-brand-500 focus:border-brand-500'
                    }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-admin-muted hover:text-admin-text transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? (
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
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password requirements hint */}
            <div className="rounded-lg bg-admin-hover border border-admin-border px-4 py-3">
              <p className="text-xs font-medium text-admin-muted mb-1.5">Password requirements:</p>
              <ul className="text-xs text-admin-muted space-y-0.5">
                <li className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${newPassword.length >= 8 ? 'bg-brand-500' : 'bg-admin-border'}`} />
                  At least 8 characters
                </li>
                <li className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${/[A-Z]/.test(newPassword) ? 'bg-brand-500' : 'bg-admin-border'}`} />
                  One uppercase letter
                </li>
                <li className="flex items-center gap-1.5">
                  <span className={`w-1 h-1 rounded-full ${/[0-9]/.test(newPassword) ? 'bg-brand-500' : 'bg-admin-border'}`} />
                  One number
                </li>
              </ul>
            </div>

            <Button type="submit" loading={loading} className="w-full" size="lg">
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
