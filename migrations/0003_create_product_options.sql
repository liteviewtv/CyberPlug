CREATE TABLE IF NOT EXISTS product_options (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price REAL NOT NULL DEFAULT 0,
  stock INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS product_options_product ON product_options(product_id, sort_order);
ALTER TABLE order_items ADD COLUMN option_id TEXT;
ALTER TABLE order_items ADD COLUMN option_title TEXT NOT NULL DEFAULT '';
ALTER TABLE order_items ADD COLUMN option_description TEXT NOT NULL DEFAULT '';
