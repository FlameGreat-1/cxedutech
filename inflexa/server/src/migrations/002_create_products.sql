CREATE TABLE IF NOT EXISTS products (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255)   NOT NULL,
  description     TEXT           NOT NULL,
  age_range       VARCHAR(50)    NOT NULL,
  subject         VARCHAR(100)   NOT NULL,
  focus_area      VARCHAR(100)   NOT NULL,
  price           NUMERIC(10,2)  NOT NULL CHECK (price >= 0),
  currency        VARCHAR(3)     NOT NULL DEFAULT 'GBP',
  format          VARCHAR(20)    NOT NULL
                  CHECK (format IN ('physical', 'printable')),
  included_items  TEXT[]         NOT NULL DEFAULT '{}',
  inventory_count INTEGER        NOT NULL DEFAULT 0 CHECK (inventory_count >= 0),
  image_url       VARCHAR(500),
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_age_range  ON products (age_range);
CREATE INDEX IF NOT EXISTS idx_products_subject    ON products (subject);
CREATE INDEX IF NOT EXISTS idx_products_focus_area ON products (focus_area);
CREATE INDEX IF NOT EXISTS idx_products_format     ON products (format);
