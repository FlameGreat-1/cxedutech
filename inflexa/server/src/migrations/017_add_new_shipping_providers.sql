-- ============================================================
-- Migration 017: Add ShipEngine & Easyship shipping providers
-- ============================================================

-- 1. Widen the CHECK constraint on shipping_configs to accept new providers.
--    PostgreSQL requires dropping and re-creating the constraint.
ALTER TABLE shipping_configs DROP CONSTRAINT IF EXISTS shipping_configs_provider_check;
ALTER TABLE shipping_configs
  ADD CONSTRAINT shipping_configs_provider_check
  CHECK (provider IN ('easypost', 'shippo', 'shipstation', 'shipengine', 'easyship', 'manual'));

-- 2. Seed default rows for the three new providers (skip if already present).
INSERT INTO shipping_configs (provider, api_key)
VALUES ('shipengine', '')
ON CONFLICT (provider) DO NOTHING;

INSERT INTO shipping_configs (provider, api_key)
VALUES ('shippo', '')
ON CONFLICT (provider) DO NOTHING;

INSERT INTO shipping_configs (provider, api_key)
VALUES ('easyship', '')
ON CONFLICT (provider) DO NOTHING;

-- 3. Rename the EasyPost-specific column to a generic name.
--    Existing data is preserved; only the column name changes.
ALTER TABLE orders RENAME COLUMN easypost_shipment_id TO shipment_id;

-- 4. Add a column to record which shipping provider fulfilled the order.
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS shipping_provider VARCHAR(30);

-- 5. Backfill: any order that already has a shipment_id was shipped via EasyPost.
UPDATE orders SET shipping_provider = 'easypost' WHERE shipment_id IS NOT NULL AND shipping_provider IS NULL;
