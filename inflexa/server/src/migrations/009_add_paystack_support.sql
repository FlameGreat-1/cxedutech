-- Add multi-provider payment support (Stripe + Paystack)

-- 1. Provider column: identifies which gateway processed the payment
ALTER TABLE payments ADD COLUMN IF NOT EXISTS provider VARCHAR(20) NOT NULL DEFAULT 'stripe'
  CHECK (provider IN ('stripe', 'paystack'));

-- 2. Paystack reference column for webhook lookups
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paystack_reference VARCHAR(255);

-- 3. Relax stripe_payment_intent_id NOT NULL (Paystack rows won't have one)
ALTER TABLE payments ALTER COLUMN stripe_payment_intent_id DROP NOT NULL;

-- 4. Drop the old unique index on stripe_payment_intent_id (it was unconditional)
--    and recreate as a partial unique index that only covers non-null values.
DROP INDEX IF EXISTS payments_stripe_payment_intent_id_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_id_unique
  ON payments (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- 5. Unique partial index on paystack_reference
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_paystack_ref_unique
  ON payments (paystack_reference)
  WHERE paystack_reference IS NOT NULL;

-- 6. Index on provider for filtered queries
CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments (provider);

-- 7. Ensure every payment row has exactly one provider reference set.
--    stripe rows must have stripe_payment_intent_id; paystack rows must have paystack_reference.
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payment_provider_reference;
ALTER TABLE payments ADD CONSTRAINT chk_payment_provider_reference CHECK (
  (provider = 'stripe' AND stripe_payment_intent_id IS NOT NULL AND paystack_reference IS NULL)
  OR
  (provider = 'paystack' AND paystack_reference IS NOT NULL AND stripe_payment_intent_id IS NULL)
);
