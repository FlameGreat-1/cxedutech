import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useCookieConsent } from '@/hooks/useCookieConsent';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth();
  const { openModal } = useCookieConsent();

  return (
    <footer className="bg-white border-t border-black text-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <img
                src="/logo-dark-green.png"
                alt="Inflexa"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-700 text-sm leading-relaxed max-w-xs">
              Offline-first gamified flashcard packs for children aged 3-8.
              Making learning fun, one card at a time.
            </p>
            <address className="mt-3 not-italic text-sm text-gray-600 leading-relaxed">
              128 City Road, London,<br />
              EC1V 2NX, United Kingdom
            </address>
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
              <FooterLink to="/account" label="My Account" />
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Customer Support
            </h3>
            <ul className="space-y-2">
              <FooterLink
                to={isAuthenticated ? '/account/track-order' : '/guest-order'}
                label="Track Order"
              />
              <FooterLink to="/faqs" label="FAQs" />
              <FooterLink to="/shipping" label="Shipping & Returns" />
              <FooterLink to="/contact" label="Contact Us" />
            </ul>
          </div>

          {/* Legal & Follow Us */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-2">
              <FooterLink to="/privacy" label="Privacy Policy" />
              <FooterLink to="/cookies" label="Cookie Policy" />
              {/* Manage Preferences — opens modal, not a route */}
              <li>
                <button
                  onClick={openModal}
                  className="text-sm text-gray-700 hover:text-mood-toke-green transition-colors text-left"
                >
                  Cookie Preferences
                </button>
              </li>
            </ul>

            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mt-6 mb-4">
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
                  className="w-7 h-7 object-contain brightness-0"
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
                  className="w-7 h-7 object-contain brightness-0"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-black flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 text-center sm:text-left">
            &copy; {currentYear} Inflexa. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-5">
            <img src="/icons/Stripe wordmark - Blurple - Large.png" alt="Stripe" className="h-8 sm:h-9 object-contain" />
            <img src="/icons/google-pay.svg" alt="Google Pay" className="h-10 sm:h-11 object-contain" />
            <img src="/icons/Paystack.svg" alt="Paystack" className="h-6 sm:h-7 object-contain" />
            <img src="/icons/Apple_Pay.svg" alt="Apple Pay" className="h-8 sm:h-9 object-contain" />
          </div>
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
        className="text-sm text-gray-700 hover:text-mood-toke-green transition-colors"
      >
        {label}
      </Link>
    </li>
  );
}
