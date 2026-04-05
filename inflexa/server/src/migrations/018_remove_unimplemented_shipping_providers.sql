-- Remove shipstation and manual from shipping_configs.
-- These providers had no backend implementation and could mislead admins.

DELETE FROM shipping_configs WHERE provider IN ('shipstation', 'manual');

ALTER TABLE shipping_configs DROP CONSTRAINT IF EXISTS shipping_configs_provider_check;
ALTER TABLE shipping_configs
  ADD CONSTRAINT shipping_configs_provider_check
  CHECK (provider IN ('easypost', 'shipengine', 'shippo', 'easyship'));
