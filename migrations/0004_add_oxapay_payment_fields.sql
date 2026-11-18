ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK(payment_status IN ('unpaid','paying','paid','expired','failed'));
ALTER TABLE orders ADD COLUMN payment_provider TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN payment_track_id TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN payment_url TEXT NOT NULL DEFAULT '';
CREATE INDEX IF NOT EXISTS orders_payment_status_created ON orders(payment_status, created_at);