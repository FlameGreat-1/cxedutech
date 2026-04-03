CREATE TABLE IF NOT EXISTS payment_gateway_configs (
  id              SERIAL PRIMARY KEY,
  provider        VARCHAR(20)    NOT NULL UNIQUE
                  CHECK (provider IN ('stripe', 'paystack')),
  currency        VARCHAR(3)     NOT NULL DEFAULT 'GBP',
  secret_key      TEXT           NOT NULL DEFAULT '',
  webhook_secret  TEXT           NOT NULL DEFAULT '',
  is_enabled      BOOLEAN        NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pgc_provider ON payment_gateway_configs (provider);
CREATE INDEX IF NOT EXISTS idx_pgc_enabled  ON payment_gateway_configs (is_enabled);

-- Seed default rows so the admin always has something to toggle
INSERT INTO payment_gateway_configs (provider, currency)
VALUES ('stripe', 'GBP'), ('paystack', 'NGN')
ON CONFLICT (provider) DO NOTHING;

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pgc_updated_at'
  ) THEN
    CREATE TRIGGER trg_pgc_updated_at
      BEFORE UPDATE ON payment_gateway_configs
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;
