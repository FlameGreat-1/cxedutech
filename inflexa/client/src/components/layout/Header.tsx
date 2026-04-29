import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useProductFilters } from '@/hooks/useProductFilters';
import { formatPrice } from '@/utils/currency';

function formatAgeRange(age: { min_age: number; max_age: number }): string {
  if (age.max_age > 11 && age.max_age === 99) return `${age.min_age}+`;
  return `${age.min_age}-${age.max_age}`;
}

export default function Header() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount, total, currency } = useCart();
  const { subjects, ageRanges } = useProductFilters();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);


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

  const headerBg = scrolled
    ? 'rgba(21, 76, 33, 0.95)'
    : '#154c21';

  return (
    <header
      style={{ backgroundColor: headerBg }}
      className={`sticky top-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'backdrop-blur-md shadow-lg border-b border-white/10'
          : 'border-b border-white/10'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[4.5rem]">

          <Link to="/" className="shrink-0 group">
            <img
              src="/icons/Wordmark-white.svg"
              alt="Inflexa"
              className="h-10 sm:h-11 w-auto transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          <DesktopNav currentPath={location.pathname} subjects={subjects} ageRanges={ageRanges} />

          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/cart"
              data-cart-icon
              className={`relative flex items-center gap-2.5 px-5 py-2.5 rounded-full transition-all duration-200 whitespace-nowrap shrink-0 ${
                itemCount > 0
                  ? 'bg-white/15 text-white hover:bg-white/25'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-label={`Cart with ${itemCount} items, total ${formatPrice(total, currency)}`}
            >
              <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-[15px] font-bold text-white">
                {formatPrice(total, currency)}
              </span>
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent-500 text-white text-[11px] font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>

            <div className="w-px h-7 bg-white/20" />

            {isAuthenticated && !isAdmin ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/icons/profilePic.png"
                    alt={user?.username || 'User'}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-white/30"
                  />
                  <span className="text-[15px] font-medium text-white">
                    {user?.username}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-[15px] font-medium text-white/70 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/10"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-[15px] font-semibold text-white/90 hover:text-white transition-colors px-5 py-2.5 rounded-lg hover:bg-white/10 whitespace-nowrap shrink-0"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-[15px] font-semibold px-6 py-2.5 rounded-xl transition-all duration-200 text-mood-toke-green bg-white shadow-sm hover:shadow-md hover:bg-white/90 whitespace-nowrap shrink-0"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 lg:hidden">
            <Link
              to="/cart"
              data-cart-icon
              className={`relative flex md:hidden items-center gap-1.5 p-2.5 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                itemCount > 0
                  ? 'text-white bg-white/15'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
              aria-label={`Cart with ${itemCount} items`}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <span className="text-sm font-bold text-white">
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
              className="p-2.5 text-white/90 hover:text-white transition-colors rounded-lg hover:bg-white/10"
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
        className={`lg:hidden overflow-y-auto transition-all duration-300 ease-in-out ${
          mobileOpen ? 'max-h-[85vh] border-t border-white/10' : 'max-h-0'
        }`}
      >
        <nav className="px-4 py-4 space-y-1 bg-white shadow-xl">
          {isAuthenticated && !isAdmin && (
            <MobileNavLink to="/account" label="My Account" icon="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          )}

          {/* ── Shop ── */}
          <MobileAccordion
            label="Shop"
            isOpen={mobileExpanded === 'shop'}
            onToggle={() => setMobileExpanded(mobileExpanded === 'shop' ? null : 'shop')}
          >
            <Link to="/store" onClick={() => setMobileOpen(false)} className="mobile-acc-link">All Products</Link>
            <Link to="/store?sort=popular" onClick={() => setMobileOpen(false)} className="mobile-acc-link">Best Sellers</Link>
            <Link to="/store?sort=newest" onClick={() => setMobileOpen(false)} className="mobile-acc-link">New Releases</Link>
          </MobileAccordion>

          {/* ── Subjects ── */}
          <MobileAccordion
            label="Subjects"
            isOpen={mobileExpanded === 'subjects'}
            onToggle={() => setMobileExpanded(mobileExpanded === 'subjects' ? null : 'subjects')}
          >
            {subjects.map((subject) => (
              <div key={subject}>
                <Link
                  to={`/store?subject=${subject}`}
                  onClick={() => setMobileOpen(false)}
                  className="mobile-acc-link font-semibold"
                >
                  {subject}
                </Link>
                <div className="pl-4 flex flex-wrap gap-1.5 pb-2">
                  {ageRanges.map((ageObj) => {
                    const ageStr = formatAgeRange(ageObj);
                    return (
                      <Link
                        key={ageStr}
                        to={`/store?subject=${subject}&age_range=${ageStr}`}
                        onClick={() => setMobileOpen(false)}
                        className="text-xs px-2.5 py-1 rounded-full border border-gray-200 text-gray-600 hover:border-mood-toke-green hover:text-mood-toke-green transition-colors"
                      >
                        {ageStr}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </MobileAccordion>

          {/* ── Ages ── */}
          <MobileAccordion
            label="Ages"
            isOpen={mobileExpanded === 'ages'}
            onToggle={() => setMobileExpanded(mobileExpanded === 'ages' ? null : 'ages')}
          >
            {ageRanges.map((ageObj) => {
              const ageStr = formatAgeRange(ageObj);
              return (
                <Link key={ageStr} to={`/store?age_range=${ageStr}`} onClick={() => setMobileOpen(false)} className="mobile-acc-link">
                  {ageStr} Years
                </Link>
              );
            })}
          </MobileAccordion>

          {/* ── Bundles ── */}
          <MobileAccordion
            label="Bundles"
            isOpen={mobileExpanded === 'bundles'}
            onToggle={() => setMobileExpanded(mobileExpanded === 'bundles' ? null : 'bundles')}
          >
            <Link to="/store?pack_type=Starter Bundle" onClick={() => setMobileOpen(false)} className="mobile-acc-link">Starter Bundles</Link>
            <Link to="/store?pack_type=By Age" onClick={() => setMobileOpen(false)} className="mobile-acc-link">By Age</Link>
            <Link to="/store?pack_type=By Subject" onClick={() => setMobileOpen(false)} className="mobile-acc-link">By Subject</Link>
          </MobileAccordion>

          {/* ── Page Links ── */}
          <div className="pt-2 mt-2 border-t border-gray-100">
            <MobileNavLink to="/how-it-works" label="How It Works" icon="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            <MobileNavLink to="/about" label="About" icon="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
            <MobileNavLink to="/schools" label="For Schools" icon="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </div>

          {/* ── Auth Section ── */}
          <div className="pt-3 mt-3 border-t border-gray-100">
            {isAuthenticated && !isAdmin ? (
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
          ? 'text-white bg-white/15'
          : 'text-white/80 hover:text-white hover:bg-white/10'
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
      className="flex items-center gap-3 px-3 py-3 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg transition-colors"
    >
      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      {label}
    </Link>
  );
}

function MobileAccordion({
  label,
  isOpen,
  onToggle,
  children,
}: {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-3 py-3 text-base font-semibold text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
      >
        {label}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-200 ease-in-out ${
          isOpen ? 'max-h-[500px] opacity-100 pb-2' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="pl-4 pr-2 flex flex-col gap-0.5">
          {children}
        </div>
      </div>
    </div>
  );
}

function DesktopNav({
  currentPath,
  subjects,
  ageRanges
}: {
  currentPath: string;
  subjects: string[];
  ageRanges: { min_age: number; max_age: number }[];
}) {
  return (
    <nav className="hidden lg:flex items-center gap-1 ml-6 flex-1">
      {/* Shop Dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-1 text-[15px] font-semibold text-white/90 hover:text-white px-3 py-2 rounded-lg transition-colors">
          Shop
          <svg className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 p-2">
          <Link to="/store" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">All Products</Link>
          <Link to="/store?sort=popular" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">Best Sellers</Link>
          <Link to="/store?sort=newest" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">New Releases</Link>
        </div>
      </div>

      {/* Subjects Dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-1 text-[15px] font-semibold text-white/90 hover:text-white px-3 py-2 rounded-lg transition-colors">
          Subjects
          <svg className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
        <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 p-2">
          {subjects.map((subject) => (
            <div key={subject} className="relative group/sub">
              <Link to={`/store?subject=${subject}`} className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">
                {subject}
                <svg className="w-4 h-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
              </Link>
              {/* Flyout for Age Breakdown */}
              <div className="absolute top-0 left-full ml-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover/sub:opacity-100 group-hover/sub:visible transition-all duration-200 p-2">
                <div className="px-3 py-1 text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Ages</div>
                {ageRanges.map((ageObj) => {
                  const ageStr = formatAgeRange(ageObj);
                  return (
                    <Link key={ageStr} to={`/store?subject=${subject}&age_range=${ageStr}`} className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">
                      {ageStr}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ages Dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-1 text-[15px] font-semibold text-white/90 hover:text-white px-3 py-2 rounded-lg transition-colors">
          Ages
          <svg className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
        <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 p-2">
          {ageRanges.map((ageObj) => {
            const ageStr = formatAgeRange(ageObj);
            return (
              <Link key={ageStr} to={`/store?age_range=${ageStr}`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">
                {ageStr}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Bundles Dropdown */}
      <div className="relative group">
        <button className="flex items-center gap-1 text-[15px] font-semibold text-white/90 hover:text-white px-3 py-2 rounded-lg transition-colors">
          Bundles
          <svg className="w-4 h-4 opacity-70 group-hover:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top scale-95 group-hover:scale-100 p-2">
          <Link to="/store?pack_type=Starter Bundle" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">Starter Bundles</Link>
          <Link to="/store?pack_type=By Age" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">By Age</Link>
          <Link to="/store?pack_type=By Subject" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-mood-toke-green rounded-lg">By Subject</Link>
        </div>
      </div>

      {/* Standard Links */}
      <NavLink to="/how-it-works" label="How It Works" current={currentPath} />
      <div className="relative group">
        <span className="absolute -top-2 -right-1 bg-accent-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full z-10">Future</span>
        <NavLink to="/schools" label="For Schools" current={currentPath} />
      </div>
      <NavLink to="/about" label="About" current={currentPath} />
    </nav>
  );
}
