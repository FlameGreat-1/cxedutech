/**
 * CookieConsentBanner
 *
 * Enterprise-grade cookie consent UI.
 *
 * Renders two surfaces:
 *  1. Banner  — fixed bottom bar shown on first visit.
 *  2. Modal   — granular preferences panel (opened from banner or footer).
 *
 * Compliance:
 *  - UK GDPR / EU GDPR / ePrivacy Directive / CCPA
 *  - No pre-ticked non-essential categories
 *  - Strictly Necessary always locked ON
 *  - Accept All / Reject All / Save Preferences
 *  - Focus-trapped modal with keyboard (Escape to close)
 *  - ARIA roles and labels throughout
 *  - Smooth entrance animation (slide-up)
 */

import { useState, useEffect, useRef, type KeyboardEvent } from 'react';
import { Link } from 'react-router-dom';
import { useCookieConsent } from '@/hooks/useCookieConsent';
import type { CookiePreferences } from '@/contexts/CookieConsentContext';

/* ------------------------------------------------------------------ */
/*  Category definitions                                               */
/* ------------------------------------------------------------------ */

interface CategoryDef {
  key: keyof Omit<CookiePreferences, 'necessary'>;
  label: string;
  description: string;
  alwaysOn?: false;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: 'analytics',
    label: 'Performance & Analytics',
    description:
      'Help us understand how visitors use our website by collecting anonymised data on pages visited, time spent, and traffic sources. Used to improve our services.',
  },
  {
    key: 'functional',
    label: 'Functional',
    description:
      'Remember your preferences such as language, region, and display settings to provide a more personalised browsing experience.',
  },
  {
    key: 'marketing',
    label: 'Marketing & Advertising',
    description:
      'Currently not in use. If introduced in future, these cookies will deliver relevant advertisements and measure ad performance. Your consent will be requested at that time.',
  },
];

/* ------------------------------------------------------------------ */
/*  Toggle Switch                                                      */
/* ------------------------------------------------------------------ */

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  id,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  id: string;
}) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={[
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green focus-visible:ring-offset-2',
        checked ? 'bg-mood-toke-green' : 'bg-gray-200',
        disabled ? 'opacity-60 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <span
        className={[
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md',
          'transform transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Preferences Modal                                                  */
/* ------------------------------------------------------------------ */

function PreferencesModal() {
  const { preferences, acceptAll, rejectAll, saveCustom, closeModal } =
    useCookieConsent();

  // Local draft state — only committed on "Save Preferences"
  const [draft, setDraft] = useState<Omit<CookiePreferences, 'necessary'>>({
    analytics: preferences.analytics,
    functional: preferences.functional,
    marketing: preferences.marketing,
  });

  const overlayRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  // Focus first element on open
  useEffect(() => {
    firstFocusRef.current?.focus();
  }, []);

  // Escape key closes modal
  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Escape') closeModal();
  }

  // Click outside overlay closes modal
  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === overlayRef.current) closeModal();
  }

  function toggle(key: keyof typeof draft) {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-modal-title"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
      onClick={handleOverlayClick}
    >
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-mood-toke-green/10">
              <svg
                className="w-5 h-5 text-mood-toke-green"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75"
                />
              </svg>
            </div>
            <h2
              id="cookie-modal-title"
              className="text-base font-bold text-gray-900"
            >
              Cookie Preferences
            </h2>
          </div>
          <button
            ref={firstFocusRef}
            onClick={closeModal}
            aria-label="Close cookie preferences"
            className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 max-h-[60vh] overflow-y-auto">
          <p className="text-sm text-gray-600 leading-relaxed">
            We use cookies to enhance your experience. You can choose which
            categories to allow below. For full details, see our{' '}
            <Link
              to="/cookies"
              onClick={closeModal}
              className="text-mood-toke-green font-medium hover:underline"
            >
              Cookie Policy
            </Link>
            .
          </p>

          {/* Strictly Necessary — always on */}
          <div className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-semibold text-gray-900">
                  Strictly Necessary
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 bg-mood-toke-green/10 text-mood-toke-green rounded-full">
                  Always On
                </span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Essential for the website to function. Enables secure login,
                shopping cart, checkout, and page navigation. Cannot be
                disabled.
              </p>
            </div>
            <ToggleSwitch
              id="toggle-necessary"
              checked={true}
              onChange={() => {}}
              disabled={true}
            />
          </div>

          {/* Non-essential categories */}
          {CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors"
            >
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {cat.label}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {cat.description}
                </p>
              </div>
              <ToggleSwitch
                id={`toggle-${cat.key}`}
                checked={draft[cat.key]}
                onChange={() => toggle(cat.key)}
              />
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-5 border-t border-gray-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => saveCustom(draft)}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-mood-toke-green border border-mood-toke-green rounded-xl hover:bg-mood-toke-green/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green"
          >
            Save Preferences
          </button>
          <button
            onClick={rejectAll}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            Reject All
          </button>
          <button
            onClick={acceptAll}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-mood-toke-green rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green focus-visible:ring-offset-2"
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Banner                                                             */
/* ------------------------------------------------------------------ */

export default function CookieConsentBanner() {
  const { showBanner, showModal, acceptAll, rejectAll, openModal } =
    useCookieConsent();

  // Animate in after a short delay so it doesn't flash on hydration
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (showBanner) {
      const t = setTimeout(() => setVisible(true), 400);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [showBanner]);

  return (
    <>
      {/* ── Banner ─────────────────────────────────────────────── */}
      {showBanner && (
        <div
          role="region"
          aria-label="Cookie consent"
          aria-live="polite"
          className={[
            'fixed bottom-0 left-0 right-0 z-[9998]',
            'transition-transform duration-500 ease-out',
            visible ? 'translate-y-0' : 'translate-y-full',
          ].join(' ')}
        >
          {/* Backdrop blur strip */}
          <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">

                {/* Cookie icon + text */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="shrink-0 flex items-center justify-center w-10 h-10 rounded-xl bg-mood-toke-green/10 mt-0.5">
                    <svg
                      className="w-5 h-5 text-mood-toke-green"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.871c1.355 0 2.697.056 4.024.166C17.155 8.51 18 9.473 18 10.608v2.513M15 9.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">
                      We use cookies
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      We use cookies to improve your experience, analyse site
                      traffic, and personalise content. By clicking{' '}
                      <strong>Accept All</strong>, you consent to our use of
                      cookies.{' '}
                      <Link
                        to="/cookies"
                        className="text-mood-toke-green font-medium hover:underline whitespace-nowrap"
                      >
                        Cookie Policy
                      </Link>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={rejectAll}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 whitespace-nowrap"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={openModal}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-mood-toke-green border border-mood-toke-green rounded-xl hover:bg-mood-toke-green/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green whitespace-nowrap"
                  >
                    Manage
                  </button>
                  <button
                    onClick={acceptAll}
                    className="flex-1 sm:flex-none px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-mood-toke-green rounded-xl hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-mood-toke-green focus-visible:ring-offset-2 whitespace-nowrap"
                  >
                    Accept All
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Preferences Modal ──────────────────────────────────── */}
      {showModal && <PreferencesModal />}
    </>
  );
}
