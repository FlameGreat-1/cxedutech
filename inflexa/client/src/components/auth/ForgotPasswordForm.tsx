import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '@/api/auth.api';
import { extractErrorMessage } from '@/api/client';
import { isValidEmail } from '@/utils/validators';
import Input from '@/components/common/Input';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
}

export default function ForgotPasswordForm({ onSuccess }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email.');
      return;
    }
    if (!isValidEmail(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email: email.trim() });
      setSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto">
          <img
            src="/icons/messagesIcon.svg"
            alt="Email sent"
            className="w-8 h-8"
          />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
        <p className="text-sm text-gray-600 max-w-sm mx-auto">
          If an account with that email exists, we've sent a password reset link.
          Please check your inbox and spam folder.
        </p>
          <Link
            to="/login"
            className="inline-block text-sm font-medium text-mood-toke-green hover:opacity-80 transition-colors"
          >
            Back to login
          </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-gray-600">
        Enter the email address associated with your account and we'll send you a link to reset your password.
      </p>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <div className="flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-full px-10 py-3 text-white font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow-md bg-mood-toke-green hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          Send Reset Link
        </button>
      </div>

      <p className="text-sm text-center text-gray-600">
        Remember your password?{' '}
        <Link to="/login" className="font-medium text-mood-toke-green hover:opacity-80 transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
