-- Add cost breakdown columns to orders.
-- Existing rows get sensible defaults: subtotal = total_amount, everything else = 0.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS subtotal          NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (subtotal >= 0),
  ADD COLUMN IF NOT EXISTS shipping_cost      NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (shipping_cost >= 0),
  ADD COLUMN IF NOT EXISTS shipping_carrier   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS shipping_service   VARCHAR(100),
  ADD COLUMN IF NOT EXISTS tax_amount         NUMERIC(10,2) NOT NULL DEFAULT 0
    CHECK (tax_amount >= 0),
  ADD COLUMN IF NOT EXISTS tax_rate           NUMERIC(5,2)  NOT NULL DEFAULT 0
    CHECK (tax_rate >= 0 AND tax_rate <= 100);

-- Backfill existing orders: subtotal = total_amount (they had no shipping/tax)
UPDATE orders SET subtotal = total_amount WHERE subtotal = 0 AND total_amount > 0;
