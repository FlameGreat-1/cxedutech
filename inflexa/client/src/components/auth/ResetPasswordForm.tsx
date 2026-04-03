import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/api/auth.api';
import { extractErrorMessage } from '@/api/client';
import { validatePassword } from '@/utils/validators';
import Input from '@/components/common/Input';

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    const pwResult = validatePassword(password);
    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (!pwResult.valid) {
      newErrors.password = pwResult.errors[0];
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setApiError('');

    if (!token) {
      setApiError('Invalid or missing reset token. Please request a new reset link.');
      return;
    }

    if (!validate()) return;

    setLoading(true);
    try {
      await resetPassword({ token, new_password: password });
      setSuccess(true);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Password reset successful</h3>
        <p className="text-sm text-gray-600">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link
          to="/login"
          className="text-[15px] inline-flex items-center justify-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-white shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      {!token && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-4 py-3">
          <p className="text-sm text-yellow-800">
            No reset token found. Please use the link from your email, or{' '}
            <Link to="/forgot-password" className="font-medium underline">request a new one</Link>.
          </p>
        </div>
      )}

      <Input
        label="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        error={errors.password}
        autoComplete="new-password"
      />

      <Input
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your new password"
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!token || loading}
          className="inline-flex text-[15px] items-center justify-center gap-2 font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-white shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Reset Password
        </button>
      </div>
    </form>
  );
}
