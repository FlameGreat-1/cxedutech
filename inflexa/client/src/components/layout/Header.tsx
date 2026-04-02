import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useProductFilters } from '@/hooks/useProductFilters';
import { formatPrice } from '@/utils/currency';

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, total, currency } = useCart();
  const { subjects, formats, ageRanges } = useProductFilters();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60'
          : 'bg-white border-b border-gray-100'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[4.5rem] sm:h-20">

          <Link to="/" className="shrink-0 group">
            <img
              src="/logo-dark-green.png"
              alt="Inflexa"
              className="h-10 sm:h-11 w-auto transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {isAuthenticated && (
              <NavLink to="/account" label="My Account" current={location.pathname} />
            )}
            {isAdmin && (
              <NavLink to="/admin" label="Dashboard" current={location.pathname} />
            )}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/cart"
              className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-200 ${
                itemCount > 0
                  ? 'bg-brand-50 text-brand-700 hover:bg-brand-100'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={`Cart with ${itemCount} items, total ${formatPrice(total, currency)}`}
            >
              <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-[15px] font-bold">
                {formatPrice(total, currency)}
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <div className="w-px h-7 bg-gray-200" />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/icons/profilePic.png"
                    alt={user?.username || 'User'}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <span className="text-[15px] font-medium text-gray-800">
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[15px] font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-[15px] font-semibold text-gray-700 hover:text-brand-700 transition-colors px-5 py-2.5 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-[15px] font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-white shadow-sm hover:shadow-md bg-mood-toke-green opacity-100 hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <Link
              to="/cart"
              className={`relative flex items-center gap-1.5 p-2.5 rounded-lg transition-colors ${
                itemCount > 0
                  ? 'text-brand-700 bg-brand-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
              aria-label={`Cart with ${itemCount} items`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-sm font-bold">
                {formatPrice(total, currency)}
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-accent-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen((prev) => !prev)}
              className="p-2.5 text-gray-600 hover:text-gray-900 transition-colors rounded-lg hover:bg-gray-50"
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

      <div
        className={`md:hidden overflow-y-auto transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[85vh] border-t border-gray-100' : 'max-h-0'
        }`}
      >
        <nav className="px-4 py-4 space-y-1 bg-white">
          {isAuthenticated && (
            <MobileNavLink to="/account" label="My Account" icon="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          )}
          {isAdmin && (
            <MobileNavLink to="/admin" label="Dashboard" icon="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          )}

          <div className="pt-2 pb-2">
            <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Shop Filters</p>
            <details className="group">
              <summary className="flex items-center gap-3 px-3 py-3 text-base font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors cursor-pointer list-none">
                <img src="/icons/People.png" alt="" className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100" />
                <div className="flex-1 flex items-center justify-between">
                  Shop by Age
                  <svg className="w-4 h-4 transition group-open:-rotate-180 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </summary>
              <div className="pl-11 pr-4 pb-2 flex flex-col gap-1">
                {ageRanges.map((range) => (
                  <Link
                    key={range.min_age}
                    to={`/store?min_age=${range.min_age}&max_age=${range.max_age}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-[15px] font-medium text-gray-600 hover:text-mood-toke-green py-2 block"
                  >
                    {range.max_age > 11 ? `${range.min_age}+ years` : `${range.min_age}-${range.max_age} years`}
                  </Link>
                ))}
              </div>
            </details>

            <details className="group">
              <summary className="flex items-center gap-3 px-3 py-3 text-base font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors cursor-pointer list-none">
                <img src="/icons/book.svg" alt="" className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100" />
                <div className="flex-1 flex items-center justify-between">
                  Shop by Subject
                  <svg className="w-4 h-4 transition group-open:-rotate-180 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </summary>
              <div className="pl-11 pr-4 pb-2 flex flex-col gap-1">
                {subjects.map((sub) => (
                  <Link
                    key={sub}
                    to={`/store?subject=${encodeURIComponent(sub)}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-[15px] font-medium text-gray-600 hover:text-mood-toke-green py-2 block"
                  >
                    {sub}
                  </Link>
                ))}
              </div>
            </details>

            <details className="group">
              <summary className="flex items-center gap-3 px-3 py-3 text-base font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors cursor-pointer list-none">
                <img src="/icons/Printer.png" alt="" className="w-5 h-5 object-contain opacity-70 group-hover:opacity-100" />
                <div className="flex-1 flex items-center justify-between">
                  Shop by Format
                  <svg className="w-4 h-4 transition group-open:-rotate-180 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                </div>
              </summary>
              <div className="pl-11 pr-4 pb-2 flex flex-col gap-1">
                <Link to="/store" onClick={() => setMobileOpen(false)} className="text-[15px] font-medium text-gray-600 hover:text-mood-toke-green py-2 block">All</Link>
                {formats.map((f) => (
                  <Link
                    key={f}
                    to={`/store?format=${encodeURIComponent(f)}`}
                    onClick={() => setMobileOpen(false)}
                    className="text-[15px] font-medium text-gray-600 hover:text-mood-toke-green py-2 block"
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Link>
                ))}
              </div>
            </details>

            <Link
              to="/store"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-3 mt-1 text-base font-semibold text-gray-700 hover:bg-brand-50 hover:text-mood-toke-green rounded-lg transition-colors cursor-pointer"
            >
              <svg className="w-5 h-5 text-gray-400 opacity-70 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.809c0-.816-.312-1.597-.872-2.163L13.803 1.95a.75.75 0 00-1.06 0L6.872 7.646C6.312 8.212 6 8.993 6 9.81V21M18 21v-3.5" /></svg>
              Store
            </Link>
          </div>

          <div className="pt-3 mt-3 border-t border-gray-100">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-3">
                  <img
                    src="/icons/profilePic.png"
                    alt={user?.username || 'User'}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-base font-semibold text-gray-900">{user?.username}</p>
                    <p className="text-sm text-gray-500">Signed in</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-1"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2.5 px-1">
                <Link
                  to="/login"
                  className="px-4 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 rounded-xl transition-colors text-center border border-gray-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-3 text-base font-semibold text-white rounded-xl transition-colors text-center shadow-sm bg-mood-toke-green opacity-100 hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavLink({ to, label, current }: { to: string; label: string; current: string }) {
  const isActive = to === '/' ? current === '/' : current.startsWith(to);

  return (
    <Link
      to={to}
      className={`text-[15px] font-semibold px-5 py-2.5 rounded-lg transition-all duration-200
        ${isActive
          ? 'text-brand-800 bg-brand-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
        }`}
    >
      {label}
    </Link>
  );
}

function MobileNavLink({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-3 text-base font-semibold text-gray-700 hover:bg-brand-50 hover:text-brand-700 rounded-lg transition-colors"
    >
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {label}
    </Link>
  );
}
