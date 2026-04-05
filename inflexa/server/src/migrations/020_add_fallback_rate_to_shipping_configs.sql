-- ============================================================
-- Migration 020: Add fallback_rate to shipping_configs
-- ============================================================
-- When a shipping provider is enabled but returns no rates
-- (sandbox limitations, address issues, API errors), this
-- flat-rate fallback is charged instead of defaulting to zero.

ALTER TABLE shipping_configs
  ADD COLUMN IF NOT EXISTS fallback_rate NUMERIC(10,2) NOT NULL DEFAULT 5.00
    CHECK (fallback_rate >= 0);
