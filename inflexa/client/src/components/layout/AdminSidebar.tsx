import { Link, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const navItems = [
  {
    to: '/admin',
    label: 'Dashboard',
    iconSrc: '/icons/dashboardIcon.svg',
    exact: true,
  },
  {
    to: '/admin/products',
    label: 'Products',
    iconSrc: '',
    exact: false,
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    iconSrc: '/icons/order.svg',
    exact: false,
  },
  {
    to: '/admin/unshipped',
    label: 'Unshipped',
    iconSrc: '/icons/unshipped.svg',
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
        <div className="flex items-center px-6 h-16 border-b border-brand-800">
          <img
            src="/logo-white.png"
            alt="Inflexa"
            className="h-7 w-auto"
          />
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
                {item.iconSrc ? (
                  <img src={item.iconSrc} alt="" className="w-5 h-5 shrink-0 object-contain" />
                ) : (
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                  </svg>
                )}
                {item.label}
              </Link>
            );
          })}
        </nav>


      </aside>
    </>
  );
}
