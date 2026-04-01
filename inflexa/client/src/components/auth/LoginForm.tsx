import { useState, useEffect, useRef, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { extractErrorMessage } from '@/api/client';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

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
        <div className="mt-1 text-right">
          <Link
            to="/forgot-password"
            className="text-sm text-brand-600 hover:text-brand-700 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
      </div>

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Sign In
      </Button>

      <p className="text-sm text-center text-gray-600">
        Don't have an account?{' '}
        <Link
          to={redirect !== '/store' ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
          className="font-medium text-brand-600 hover:text-brand-700 transition-colors"
        >
          Register
        </Link>
      </p>
    </form>
  );
}
