-- Indexes for frequently-joined foreign keys missing from previous migrations
CREATE INDEX IF NOT EXISTS idx_cart_items_product_variant_id ON cart_items(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order_id ON shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
