import { Link, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    to: '/admin',
    label: 'Dashboard',
    icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z',
    exact: true,
  },
  {
    to: '/admin/products',
    label: 'Products',
    icon: 'M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z',
    exact: false,
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    icon: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z',
    exact: false,
  },
  {
    to: '/admin/unshipped',
    label: 'Unshipped',
    icon: 'M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25m-2.25 0h-2.25m4.5 0v3.375c0 .621-.504 1.125-1.125 1.125H9.375a1.125 1.125 0 01-1.125-1.125V11.25m4.5 0h2.25M6 18.75V20.25',
    exact: false,
  },
];

export default function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const location = useLocation();

  function isActive(to: string, exact: boolean) {
    return exact ? location.pathname === to : location.pathname.startsWith(to);
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-brand-900 text-white
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 h-16 border-b border-brand-800">
          <img
            src="/logo-white.png"
            alt="Inflexa"
            className="h-7 w-auto"
          />
          <span className="text-sm font-medium text-brand-300">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.to, item.exact);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${active
                    ? 'bg-brand-800 text-white'
                    : 'text-brand-200 hover:bg-brand-800 hover:text-white'
                  }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Back to store link */}
        <div className="absolute bottom-0 left-0 right-0 px-3 py-4 border-t border-brand-800">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-brand-300 hover:bg-brand-800 hover:text-white transition-colors duration-150"
          >
            <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
            Back to Store
          </Link>
        </div>
      </aside>
    </>
  );
}
