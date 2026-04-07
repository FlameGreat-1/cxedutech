import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/api/client';
import { isValidEmail, validatePassword } from '@/utils/validators';
import Input from '@/components/common/Input';

export default function RegisterForm() {
  const { register } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirect = searchParams.get('redirect') || '/store';

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required.';
    } else if (username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!isValidEmail(email.trim())) {
      newErrors.email = 'Please enter a valid email.';
    }

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

    if (!validate()) return;

    setLoading(true);
    try {
      await register({ username: username.trim(), email: email.trim(), password });
      addToast('success', 'Account created! Welcome to Inflexa.');
      navigate(redirect, { replace: true });
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {apiError && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3">
          <p className="text-sm text-red-700">{apiError}</p>
        </div>
      )}

      <Input
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Choose a username"
        error={errors.username}
        autoComplete="username"
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        error={errors.email}
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Min 8 chars, 1 uppercase, 1 number"
        error={errors.password}
        autoComplete="new-password"
      />

      <Input
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Re-enter your password"
        error={errors.confirmPassword}
        autoComplete="new-password"
      />

      {/* Policy consent notice — required before account creation (GDPR best practice) */}
      <p className="text-xs text-center text-gray-500 leading-relaxed">
        By creating an account, you agree to our{' '}
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
          Create Account
        </button>
      </div>

      <p className="text-sm text-center text-gray-600">
        Already have an account?{' '}
        <Link
          to={redirect !== '/store' ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
          className="font-medium text-mood-toke-green hover:opacity-80 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
}
