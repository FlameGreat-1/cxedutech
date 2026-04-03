import { useState, useRef, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminSearchBar from './AdminSearchBar';
import ToastContainer from '@/components/common/Toast';
import { useAuth } from '@/hooks/useAuth';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useTheme } from '@/hooks/useTheme';

export default function AdminLayout() {
  return (
    <ThemeProvider>
      <AdminLayoutInner />
    </ThemeProvider>
  );
}

/* ── Route → Page title mapping ──────────────────────────────────── */
function getPageTitle(pathname: string): string {
  if (pathname === '/admin' || pathname === '/admin/') return 'Dashboard';
  if (pathname.startsWith('/admin/products')) return 'Products';
  if (pathname.startsWith('/admin/orders')) return 'Orders';
  if (pathname.startsWith('/admin/unshipped')) return 'Unshipped';
  if (pathname.startsWith('/admin/shipped')) return 'Shipped';
  if (pathname.startsWith('/admin/payments')) return 'Payments';
  if (pathname.startsWith('/admin/settings')) return 'Settings';
  return 'Dashboard';
}

function AdminLayoutInner() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  // Close dropdown on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [profileOpen]);

  function handleLogout() {
    setProfileOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <div className="admin-layout flex h-screen bg-admin-bg transition-colors duration-200">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="bg-admin-bg border-b border-admin-border h-[72px] flex items-center justify-between px-4 lg:px-8 shrink-0 transition-colors duration-200">
          {/* Left: hamburger + Dashboard title */}
          <div className="flex items-center gap-4">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 text-admin-muted hover:text-admin-text rounded-lg hover:bg-admin-hover transition-colors lg:hidden"
              aria-label="Open sidebar"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>

            {/* Page title — derived from current route */}
            <h1 className="text-2xl font-bold text-admin-text">{getPageTitle(location.pathname)}</h1>
          </div>

          {/* Search bar - desktop only */}
          <div className="hidden lg:block flex-1 max-w-md mx-4">
            <AdminSearchBar />
          </div>

          {/* Right side: theme toggle + profile dropdown */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-admin-muted hover:text-admin-text hover:bg-admin-hover transition-colors"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                </svg>
              )}
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-admin-hover transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-admin-active focus:ring-offset-2"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                <p className="text-sm font-medium text-admin-text hidden sm:block">{user?.username}</p>
                <img
                  src="/icons/profilePic.png"
                  alt={user?.username || 'Admin'}
                  className="w-9 h-9 rounded-full object-cover ring-2 ring-admin-border"
                />
                <svg
                  className={`w-4 h-4 text-admin-muted transition-transform duration-200 hidden sm:block ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-admin-bg rounded-xl shadow-lg ring-1 ring-black/5 border border-admin-border z-50 overflow-hidden animate-in">
                  {/* User info header */}
                  <div className="px-5 py-4 bg-admin-hover border-b border-admin-border">
                    <div className="flex items-center gap-3">
                      <img
                        src="/icons/profilePic.png"
                        alt={user?.username || 'Admin'}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-admin-border shadow-sm"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-admin-text truncate">
                          {user?.username}
                        </p>
                        <p className="text-xs text-admin-muted truncate">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2 px-2">
                    <Link
                      to="/admin/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-admin-muted hover:bg-admin-hover hover:text-admin-text transition-colors duration-150"
                    >
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                      Change Password
                    </Link>
                  </div>

                  {/* Logout */}
                  <div className="px-2 py-2 border-t border-admin-border">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
                    >
                      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide p-4 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ToastContainer />
    </div>
  );
}
