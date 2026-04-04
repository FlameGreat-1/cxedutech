CREATE TABLE IF NOT EXISTS tax_configs (
  id              SERIAL PRIMARY KEY,
  region          VARCHAR(10)    NOT NULL UNIQUE DEFAULT 'GB',
  tax_label       VARCHAR(50)    NOT NULL DEFAULT 'VAT',
  tax_rate        NUMERIC(5,2)   NOT NULL DEFAULT 20.00
                  CHECK (tax_rate >= 0 AND tax_rate <= 100),
  is_enabled      BOOLEAN        NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tc_region  ON tax_configs (region);
CREATE INDEX IF NOT EXISTS idx_tc_enabled ON tax_configs (is_enabled);

-- Seed default UK VAT row (disabled by default so it defaults to zero)
INSERT INTO tax_configs (region, tax_label, tax_rate, is_enabled)
VALUES ('GB', 'VAT', 20.00, false)
ON CONFLICT (region) DO NOTHING;

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_tc_updated_at'
  ) THEN
    CREATE TRIGGER trg_tc_updated_at
      BEFORE UPDATE ON tax_configs
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;
