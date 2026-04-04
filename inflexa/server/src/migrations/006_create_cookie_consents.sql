-- ============================================================
-- Cookie Consent Audit Log
--
-- Purpose: Persist every consent decision server-side so that
-- Inflexa can demonstrate compliance in the event of an ICO
-- investigation or GDPR subject-access request.
--
-- Design decisions:
--   - session_id: anonymous fingerprint (SHA-256 of IP + UA)
--     so we can correlate records without storing PII directly.
--   - user_id: nullable FK — populated when the visitor is
--     authenticated, NULL for guests.
--   - ip_address: stored as INET for efficient indexing.
--   - preferences: JSONB for flexible per-category storage.
--   - consent_version: matches CONSENT_VERSION in the client
--     context so we know which policy revision was accepted.
--   - expires_at: mirrors the client-side 180-day TTL.
--   - No UPDATE / DELETE — this is an append-only audit log.
--     A new row is inserted on every consent change.
-- ============================================================

CREATE TABLE IF NOT EXISTS cookie_consents (
  id               SERIAL        PRIMARY KEY,
  session_id       VARCHAR(64)   NOT NULL,
  user_id          INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  status           VARCHAR(20)   NOT NULL
                   CHECK (status IN ('accepted', 'rejected', 'customised')),
  preferences      JSONB         NOT NULL,
  consent_version  VARCHAR(20)   NOT NULL,
  ip_address       INET,
  user_agent       TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  expires_at       TIMESTAMPTZ   NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_session_id
  ON cookie_consents (session_id);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_user_id
  ON cookie_consents (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cookie_consents_created_at
  ON cookie_consents (created_at DESC);
