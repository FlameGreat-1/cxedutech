import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-brand-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img
                src="/logo-white.png"
                alt="Inflexa"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-brand-200 text-sm leading-relaxed max-w-xs">
              Offline-first gamified flashcard packs for children aged 3-8.
              Making learning fun, one card at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-brand-100 uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/" label="Home" />
              <FooterLink to="/store" label="Store" />
              <FooterLink to="/cart" label="Cart" />
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-sm font-semibold text-brand-100 uppercase tracking-wider mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/account" label="My Account" />
              <FooterLink to="/guest-order" label="Track Order" />
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-brand-800">
          <p className="text-sm text-brand-300 text-center">
            &copy; {currentYear} Inflexa. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ to, label }: { to: string; label: string }) {
  return (
    <li>
      <Link
        to={to}
        className="text-sm text-brand-200 hover:text-brand-300 transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}
