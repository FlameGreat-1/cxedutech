import { useContext } from 'react';
import { CookieConsentContext } from '@/contexts/CookieConsentContext';

/**
 * useCookieConsent
 *
 * Provides access to the cookie consent state and actions.
 *
 * Usage:
 *   const { preferences, acceptAll, rejectAll, openModal } = useCookieConsent();
 *
 * Throws if used outside <CookieConsentProvider>.
 */
export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error(
      'useCookieConsent must be used within a <CookieConsentProvider>',
    );
  }
  return ctx;
}
