CREATE TABLE IF NOT EXISTS orders (
  id                      SERIAL PRIMARY KEY,
  user_id                 INTEGER        REFERENCES users(id) ON DELETE RESTRICT,
  total_amount            NUMERIC(10,2)  NOT NULL CHECK (total_amount >= 0),
  currency                VARCHAR(3)     NOT NULL DEFAULT 'GBP',
  order_status            VARCHAR(20)    NOT NULL DEFAULT 'Pending'
                          CHECK (order_status IN ('Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled')),
  shipping_name           VARCHAR(255)   NOT NULL,
  shipping_email          VARCHAR(255)   NOT NULL,
  shipping_phone          VARCHAR(50),
  shipping_address_line1  VARCHAR(255)   NOT NULL,
  shipping_address_line2  VARCHAR(255),
  shipping_city           VARCHAR(100)   NOT NULL,
  shipping_state          VARCHAR(100)   NOT NULL,
  shipping_postal_code    VARCHAR(20)    NOT NULL,
  shipping_country        VARCHAR(5)     NOT NULL DEFAULT 'GB',
  easypost_shipment_id    VARCHAR(255),
  tracking_code           VARCHAR(255),
  created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders (order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders (created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_orders_updated_at'
  ) THEN
    CREATE TRIGGER trg_orders_updated_at
      BEFORE UPDATE ON orders
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    INTEGER        NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER        NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    INTEGER        NOT NULL CHECK (quantity > 0),
  unit_price  NUMERIC(10,2)  NOT NULL CHECK (unit_price >= 0),
  currency    VARCHAR(3)     NOT NULL DEFAULT 'GBP'
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);
