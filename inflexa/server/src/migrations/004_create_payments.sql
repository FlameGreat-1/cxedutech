CREATE TABLE IF NOT EXISTS payments (
  id                        SERIAL PRIMARY KEY,
  order_id                  INTEGER        NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  provider                  VARCHAR(20)    NOT NULL DEFAULT 'stripe'
                            CHECK (provider IN ('stripe', 'paystack')),
  stripe_payment_intent_id  VARCHAR(255),
  paystack_reference        VARCHAR(255),
  amount                    NUMERIC(10,2)  NOT NULL CHECK (amount >= 0),
  currency                  VARCHAR(3)     NOT NULL DEFAULT 'GBP',
  payment_method            VARCHAR(50)    NOT NULL DEFAULT 'card',
  status                    VARCHAR(20)    NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'completed', 'failed')),
  created_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id  ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status    ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_provider  ON payments (provider);

-- Partial unique indexes: only enforce uniqueness on non-null provider references
CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_stripe_id_unique
  ON payments (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payments_paystack_ref_unique
  ON payments (paystack_reference)
  WHERE paystack_reference IS NOT NULL;

-- Every payment must have exactly one provider reference set
ALTER TABLE payments DROP CONSTRAINT IF EXISTS chk_payment_provider_reference;
ALTER TABLE payments ADD CONSTRAINT chk_payment_provider_reference CHECK (
  (provider = 'stripe'   AND stripe_payment_intent_id IS NOT NULL AND paystack_reference IS NULL)
  OR
  (provider = 'paystack' AND paystack_reference IS NOT NULL AND stripe_payment_intent_id IS NULL)
);

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_payments_updated_at'
  ) THEN
    CREATE TRIGGER trg_payments_updated_at
      BEFORE UPDATE ON payments
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;
