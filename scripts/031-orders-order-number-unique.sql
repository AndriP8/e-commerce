-- Ensure order numbers are unique
ALTER TABLE orders ADD CONSTRAINT uq_orders_order_number UNIQUE (order_number);
