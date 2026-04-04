/**
 * CookieConsentContext
 *
 * Enterprise-grade, UK GDPR / EU GDPR / ePrivacy / CCPA compliant
 * cookie consent state management.
 *
 * Design decisions:
 *  - Consent stored in localStorage (not a cookie) so it survives
 *    sessions without itself requiring consent.
 *  - Version-stamped: bumping CONSENT_VERSION forces re-consent on
 *    policy changes.
 *  - Strictly Necessary cookies are always ON and cannot be toggled.
 *  - All non-essential categories default to FALSE (no pre-ticking).
 *  - Expiry: consent is valid for 365 days, after which the banner
 *    re-appears automatically.
 */

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/** Bump this string whenever the cookie policy materially changes. */
export const CONSENT_VERSION = '1.0.0';

const STORAGE_KEY = 'inflexa_cookie_consent';

/** Consent expires after 365 days (ms). */
const CONSENT_TTL_MS = 365 * 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ConsentCategory = 'analytics' | 'functional' | 'marketing';

export interface CookiePreferences {
  /** Always true — cannot be disabled. */
  necessary: true;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
}

export type ConsentStatus = 'pending' | 'accepted' | 'rejected' | 'customised';

export interface PersistedConsent {
  version: string;
  status: ConsentStatus;
  preferences: CookiePreferences;
  /** ISO timestamp of when consent was given. */
  timestamp: string;
  /** ISO timestamp when consent expires. */
  expiresAt: string;
}

export interface CookieConsentContextValue {
  /** Whether the banner/modal should be shown. */
  showBanner: boolean;
  /** Whether the preferences modal is open. */
  showModal: boolean;
  /** Current consent status. */
  status: ConsentStatus;
  /** Granular per-category preferences. */
  preferences: CookiePreferences;
  /** Accept all categories. */
  acceptAll: () => void;
  /** Reject all non-essential categories. */
  rejectAll: () => void;
  /** Save a custom set of preferences. */
  saveCustom: (prefs: Omit<CookiePreferences, 'necessary'>) => void;
  /** Open the preferences modal (e.g. from footer link). */
  openModal: () => void;
  /** Close the preferences modal without saving. */
  closeModal: () => void;
  /** Whether consent has been given (any status other than pending). */
  hasConsented: boolean;
}

/* ------------------------------------------------------------------ */
/*  Defaults                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  analytics: false,
  functional: false,
  marketing: false,
};

/* ------------------------------------------------------------------ */
/*  Storage helpers                                                    */
/* ------------------------------------------------------------------ */

function readStorage(): PersistedConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: PersistedConsent = JSON.parse(raw);
    // Invalidate if version changed or consent expired
    if (parsed.version !== CONSENT_VERSION) return null;
    if (new Date(parsed.expiresAt) < new Date()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStorage(status: ConsentStatus, preferences: CookiePreferences): void {
  try {
    const now = new Date();
    const payload: PersistedConsent = {
      version: CONSENT_VERSION,
      status,
      preferences,
      timestamp: now.toISOString(),
      expiresAt: new Date(now.getTime() + CONSENT_TTL_MS).toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // localStorage unavailable (private browsing edge cases) — fail silently
  }
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

export const CookieConsentContext =
  createContext<CookieConsentContextValue | null>(null);

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<ConsentStatus>('pending');
  const [preferences, setPreferences] =
    useState<CookiePreferences>(DEFAULT_PREFERENCES);
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  /* Hydrate from localStorage on mount */
  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      setStatus(stored.status);
      setPreferences(stored.preferences);
      setShowBanner(false);
    } else {
      // No valid consent found — show banner
      setShowBanner(true);
    }
  }, []);

  const acceptAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    setPreferences(prefs);
    setStatus('accepted');
    writeStorage('accepted', prefs);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const rejectAll = useCallback(() => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    setPreferences(prefs);
    setStatus('rejected');
    writeStorage('rejected', prefs);
    setShowBanner(false);
    setShowModal(false);
  }, []);

  const saveCustom = useCallback(
    (custom: Omit<CookiePreferences, 'necessary'>) => {
      const prefs: CookiePreferences = { necessary: true, ...custom };
      setPreferences(prefs);
      setStatus('customised');
      writeStorage('customised', prefs);
      setShowBanner(false);
      setShowModal(false);
    },
    [],
  );

  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);

  const value = useMemo<CookieConsentContextValue>(
    () => ({
      showBanner,
      showModal,
      status,
      preferences,
      acceptAll,
      rejectAll,
      saveCustom,
      openModal,
      closeModal,
      hasConsented: status !== 'pending',
    }),
    [
      showBanner,
      showModal,
      status,
      preferences,
      acceptAll,
      rejectAll,
      saveCustom,
      openModal,
      closeModal,
    ],
  );

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}
