import { Link, useLocation } from 'react-router-dom';

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

/* ── MENU nav items ─────────────────────────────────────────────── */
const menuItems = [
  {
    to: '/admin',
    label: 'Dashboard',
    iconSrc: '/icons/dashboardIcon.svg',
    exact: true,
  },
  {
    to: '/admin/products',
    label: 'Products',
    iconSrc: '/icons/product.png',
    exact: false,
  },
  {
    to: '/admin/orders',
    label: 'Orders',
    iconSrc: '/icons/order.svg',
    exact: false,
  },
  {
    to: '/admin/payments',
    label: 'Payments',
    iconSrc: '/icons/payment.svg',
    exact: false,
  },
  {
    to: '/admin/unshipped',
    label: 'Unshipped',
    iconSrc: '/icons/unshipped.svg',
    exact: false,
  },
  {
    to: '/admin/shipped',
    label: 'Shipped',
    iconSrc: '/icons/shipping.png',
    exact: false,
  },
];

/* ── SETTINGS nav items ─────────────────────────────────────────── */
const settingsItems = [
  { to: '/admin/settings', label: 'Settings', iconSrc: '/icons/gearIcon.svg' },
  { to: '/admin/help', label: 'Help & FAQs', iconSrc: '/icons/helpAndFaq.svg' },
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
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-admin-bg border-r border-admin-border
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link to="/" className="flex items-center gap-2.5 px-6 h-[72px]">
          <img
            src="/icons/dark-green.svg"
            alt="Inflexa"
            className="h-9 w-auto dark:hidden"
          />
          <img
            src="/icons/Wordmark-white.svg"
            alt="Inflexa"
            className="h-9 w-auto hidden dark:block"
          />
        </Link>

        {/* ── MENU Section ─────────────────────────────────────── */}
        <div className="px-4 pt-5">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-admin-label mb-2">
            Menu
          </p>
          <hr className="mx-0 mb-3 border-0 border-t border-admin-border" />
          <nav className="space-y-0.5">
            {menuItems.map((item) => {
              const active = isActive(item.to, item.exact);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium
                    transition-colors duration-150
                    ${active
                      ? 'bg-admin-active text-white'
                      : 'text-admin-muted hover:bg-admin-hover hover:text-admin-text'
                    }`}
                >
                  <img
                    src={item.iconSrc}
                    alt=""
                    className={`w-6 h-6 shrink-0 object-contain ${active ? 'brightness-0 invert' : 'dark:invert dark:opacity-70 dark:group-hover:opacity-100'}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* ── Divider ──────────────────────────────────────────── */}
        <hr className="mx-5 my-5 border-0 border-t border-admin-border" />

        {/* ── SETTINGS Section ─────────────────────────────────── */}
        <div className="px-4">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-admin-label mb-2">
            Settings
          </p>
          <nav className="space-y-0.5">
            {settingsItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium
                    transition-colors duration-150
                    ${active
                      ? 'bg-admin-active text-white'
                      : 'text-admin-muted hover:bg-admin-hover hover:text-admin-text'
                    }`}
                >
                  <img
                    src={item.iconSrc}
                    alt=""
                    className={`w-6 h-6 shrink-0 object-contain ${active ? 'brightness-0 invert' : 'dark:invert dark:opacity-70 dark:group-hover:opacity-100'}`}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
