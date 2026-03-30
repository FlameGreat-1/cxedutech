-- Multi-provider payment support (Stripe + Paystack)
-- For fresh databases, 004_create_payments.sql already includes all columns/indexes.
-- This migration handles upgrades from older schemas that only had Stripe.

-- 1. Provider column
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'stripe';
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_provider_check'
  ) THEN
    ALTER TABLE payments ADD CONSTRAINT payments_provider_check
      CHECK (provider IN ('stripe', 'paystack'));
  END IF;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END;
$$;

-- 2. Paystack reference column
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(255);

-- 3. Relax stripe_payment_intent_id NOT NULL (Paystack rows won't have one)
--    Only needed when upgrading from old schema where it was NOT NULL.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments'
      AND column_name = 'stripe_payment_intent_id'
      AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE payments ALTER COLUMN stripe_payment_intent_id DROP NOT NULL;
  END IF;
END;
$$;

-- 4. Replace the old unconditional unique constraint/index on stripe_payment_intent_id
--    with a partial unique index that only covers non-null values.
DO $$
BEGIN
  -- Drop the CONSTRAINT first (this also removes the backing index)
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'payments_stripe_payment_intent_id_key'
      AND conrelid = 'payments'::regclass
  ) THEN
    ALTER TABLE payments DROP CONSTRAINT payments_stripe_payment_intent_id_key;
  END IF;
END;
$$;

-- Now safely drop any leftover standalone index with the same name
DROP INDEX IF EXISTS payments_stripe_payment_intent_id_key;

-- Create partial unique indexes (IF NOT EXISTS keeps this safe for fresh DBs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_id_unique
  ON payments (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_paystack_ref_unique
  ON payments (paystack_reference)
  WHERE paystack_reference IS NOT NULL;

-- 5. Index on provider
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments (provider);

-- 6. Provider-reference integrity constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payment_provider_reference;
ALTER TABLE payments ADD CONSTRAINT chk_payment_provider_reference CHECK (
  (provider = 'stripe'   AND stripe_payment_intent_id IS NOT NULL AND paystack_reference IS NULL)
  OR
  (provider = 'paystack' AND paystack_reference IS NOT NULL AND stripe_payment_intent_id IS NULL)
);
