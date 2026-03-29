CREATE TABLE IF NOT EXISTS payments (
  id                        SERIAL PRIMARY KEY,
  order_id                  INTEGER        NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  stripe_payment_intent_id  VARCHAR(255)   UNIQUE NOT NULL,
  amount                    NUMERIC(10,2)  NOT NULL CHECK (amount >= 0),
  currency                  VARCHAR(3)     NOT NULL DEFAULT 'GBP',
  payment_method            VARCHAR(50)    NOT NULL DEFAULT 'card',
  status                    VARCHAR(20)    NOT NULL DEFAULT 'pending'
                            CHECK (status IN ('pending', 'completed', 'failed')),
  created_at                TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_order_id  ON payments (order_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments (stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status    ON payments (status);
