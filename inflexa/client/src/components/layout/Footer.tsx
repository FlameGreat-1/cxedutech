import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();

  return (
    <footer style={{ backgroundColor: '#bec7e8' }} className="text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img
                src="/logo-white.png"
                alt="Inflexa"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-700 text-sm leading-relaxed max-w-xs">
              Offline-first gamified flashcard packs for children aged 3-8.
              Making learning fun, one card at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
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
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/account" label="My Account" />
              <FooterLink
                to={isAuthenticated ? '/account/track-order' : '/guest-order'}
                label="Track Order"
              />
            </ul>
          </div>

          {/* Follow Us */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Follow Us
            </h3>
            <div className="flex items-center gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Facebook"
                className="transition-opacity duration-200 hover:opacity-80"
              >
                <img
                  src="/icons/Facebook.png"
                  alt="Facebook"
                  className="w-7 h-7 object-contain"
                />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow us on Instagram"
                className="transition-opacity duration-200 hover:opacity-80"
              >
                <img
                  src="/icons/Instagram.png"
                  alt="Instagram"
                  className="w-7 h-7 object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-400/40">
          <p className="text-sm text-gray-600 text-center">
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
        className="text-sm text-gray-700 hover:text-gray-900 transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}
