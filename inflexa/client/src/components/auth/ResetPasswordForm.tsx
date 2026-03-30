import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '@/api/auth.api';
import { extractErrorMessage } from '@/api/client';
import { validatePassword } from '@/utils/validators';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

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
          className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white
            font-semibold rounded-lg hover:bg-brand-700 transition-colors"
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

      <Button type="submit" loading={loading} disabled={!token} className="w-full" size="lg">
        Reset Password
      </Button>
    </form>
  );
}
