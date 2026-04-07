import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/api/client';
import Input from '@/components/common/Input';

export default function LoginForm() {
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const justLoggedInRef = useRef(false);

  const explicitRedirect = searchParams.get('redirect');
  const redirect = explicitRedirect || '/store';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      justLoggedInRef.current = true;
      addToast('success', 'Welcome back!');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  // Navigate after user state is set by login()
  useEffect(() => {
    if (!user || !justLoggedInRef.current) return;
    justLoggedInRef.current = false;

    if (explicitRedirect) {
      navigate(explicitRedirect, { replace: true });
    } else if (user.role === 'admin') {
      navigate('/admin', { replace: true });
    } else {
      navigate('/store', { replace: true });
    }
  }, [user, explicitRedirect, navigate]);

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
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

      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />
        <div className="mt-2 text-right">
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-mood-toke-green hover:opacity-80 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <div className="flex justify-center pt-2">
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
          Sign In
        </button>
      </div>

      <p className="text-xs text-center text-gray-500">
        Don't have an account?{' '}
        <Link
          to={redirect !== '/store' ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
          className="font-semibold text-mood-toke-green hover:opacity-80 transition-colors"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
