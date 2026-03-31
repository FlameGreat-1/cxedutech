import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/utils/currency';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, total, currency } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="shrink-0">
            <img
              src="/logo-dark-green.png"
              alt="Inflexa"
              className="h-8 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {isAuthenticated && (
              <NavLink to="/account" label="My Account" current={location.pathname} />
            )}
            {isAdmin && (
              <NavLink to="/admin" label="Dashboard" current={location.pathname} />
            )}
          </nav>

          {/* Desktop Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Cart with total amount - always shows currency */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-brand-600 transition-colors rounded-lg hover:bg-gray-50"
              aria-label={`Cart with ${itemCount} items, total ${formatPrice(total, currency)}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className={`text-sm font-semibold transition-colors ${
                itemCount > 0 ? 'text-brand-700' : 'text-gray-400'
              }`}>
                {formatPrice(total, currency)}
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  Hi, <span className="font-medium text-gray-900">{user?.username}</span>
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-brand-600 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/cart"
              className="relative flex items-center gap-1.5 p-2 text-gray-600 hover:text-brand-600 transition-colors"
              aria-label={`Cart with ${itemCount} items, total ${formatPrice(total, currency)}`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className={`text-xs font-semibold transition-colors ${
                itemCount > 0 ? 'text-brand-700' : 'text-gray-400'
              }`}>
                {formatPrice(total, currency)}
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-96 border-t border-gray-100' : 'max-h-0'
        }`}
      >
        <nav className="px-4 py-4 space-y-1 bg-white">
          {isAuthenticated && (
            <MobileNavLink to="/account" label="My Account" />
          )}
          {isAdmin && (
            <MobileNavLink to="/admin" label="Dashboard" />
          )}

          <div className="pt-3 mt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <>
                <p className="px-3 py-2 text-sm text-gray-500">
                  Signed in as <span className="font-medium text-gray-900">{user?.username}</span>
                </p>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors text-center"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 text-sm font-medium bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

/* Desktop nav link with active underline indicator */
function NavLink({ to, label, current }: { to: string; label: string; current: string }) {
  const isActive = to === '/' ? current === '/' : current.startsWith(to);

  return (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors relative py-1
        ${isActive
          ? 'text-brand-700'
          : 'text-gray-600 hover:text-brand-600'
        }`}
    >
      {label}
      {isActive && (
        <span className="absolute -bottom-[19px] left-0 right-0 h-0.5 bg-brand-600 rounded-full" />
      )}
    </Link>
  );
}

/* Mobile nav link with full-width tap target */
function MobileNavLink({ to, label }: { to: string; label: string }) {
  return (
    <Link
      to={to}
      className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-brand-600 rounded-lg transition-colors"
    >
      {label}
    </Link>
  );
}
