CREATE TABLE IF NOT EXISTS shipping_configs (
  id              SERIAL PRIMARY KEY,
  provider        VARCHAR(30)    NOT NULL UNIQUE
                  CHECK (provider IN ('easypost', 'shippo', 'shipstation', 'manual')),
  api_key         TEXT           NOT NULL DEFAULT '',
  is_enabled      BOOLEAN        NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sc_provider ON shipping_configs (provider);
CREATE INDEX IF NOT EXISTS idx_sc_enabled  ON shipping_configs (is_enabled);

-- Seed default row
INSERT INTO shipping_configs (provider, api_key)
VALUES ('easypost', '')
ON CONFLICT (provider) DO NOTHING;

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sc_updated_at'
  ) THEN
    CREATE TRIGGER trg_sc_updated_at
      BEFORE UPDATE ON shipping_configs
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;
