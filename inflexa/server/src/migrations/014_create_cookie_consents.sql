-- ============================================================
-- Cookie Consent Audit Log
--
-- Purpose: Persist every consent decision server-side so that
-- Inflexa can demonstrate compliance in the event of an ICO
-- investigation or GDPR subject-access request.
--
-- Design decisions:
--
--   session_id
--     Anonymous 64-char hex fingerprint generated on the client
--     via crypto.getRandomValues. Correlates records per browser
--     without storing PII.
--
--   user_id
--     Nullable FK. Populated when the visitor is authenticated,
--     NULL for guests.
--
--   ip_address
--     Stored as INET for efficient indexing. Captured from
--     X-Forwarded-For (set by nginx) or socket.remoteAddress.
--
--   preferences
--     JSONB. Stores the full per-category consent object
--     { necessary, analytics, functional, marketing }.
--
--   consent_version
--     Matches CONSENT_VERSION in the client context. Identifies
--     which revision of the Cookie Policy was accepted.
--
--   consent_expires_at
--     The CLIENT-SIDE re-consent deadline (180 days from consent).
--     When this passes, the banner re-appears and the user is
--     asked to consent again. Sent from the client.
--
--   record_expires_at
--     The SERVER-SIDE audit record retention deadline.
--     Set to 6 years from created_at by the server, independent
--     of the client TTL. Rationale:
--       - UK Limitation Act 1980: civil claims up to 6 years
--       - GDPR Art. 5(2) accountability: must prove compliance
--         for the duration of processing + reasonable period
--       - ICO enforcement practice: investigations can cover
--         several years of historical processing
--     This column is used by future data-retention cleanup jobs
--     to safely purge old records without destroying live audit
--     evidence.
--
--   Append-only
--     No UPDATE or DELETE. Every consent change inserts a new
--     row. The full history is preserved for audit purposes.
-- ============================================================

CREATE TABLE IF NOT EXISTS cookie_consents (
  id                  SERIAL        PRIMARY KEY,
  session_id          VARCHAR(64)   NOT NULL,
  user_id             INTEGER       REFERENCES users(id) ON DELETE SET NULL,
  status              VARCHAR(20)   NOT NULL
                      CHECK (status IN ('accepted', 'rejected', 'customised')),
  preferences         JSONB         NOT NULL,
  consent_version     VARCHAR(20)   NOT NULL,
  ip_address          INET,
  user_agent          TEXT,
  created_at          TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  -- Client re-consent deadline (180 days) — sent from the browser
  consent_expires_at  TIMESTAMPTZ   NOT NULL,

  -- Server audit retention deadline (6 years) — set by the server
  record_expires_at   TIMESTAMPTZ   NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_session_id
  ON cookie_consents (session_id);

CREATE INDEX IF NOT EXISTS idx_cookie_consents_user_id
  ON cookie_consents (user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cookie_consents_created_at
  ON cookie_consents (created_at DESC);

-- Used by future retention cleanup jobs to find purgeable records
CREATE INDEX IF NOT EXISTS idx_cookie_consents_record_expires_at
  ON cookie_consents (record_expires_at);
