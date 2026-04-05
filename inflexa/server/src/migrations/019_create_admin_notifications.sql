-- ============================================================
-- Migration 019: Create admin_notifications table
-- ============================================================

CREATE TABLE IF NOT EXISTS admin_notifications (
  id          SERIAL PRIMARY KEY,
  type        VARCHAR(50)   NOT NULL,
  title       VARCHAR(255)  NOT NULL,
  message     TEXT          NOT NULL,
  order_id    INTEGER       REFERENCES orders(id) ON DELETE SET NULL,
  is_read     BOOLEAN       NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read    ON admin_notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON admin_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_type       ON admin_notifications (type);
