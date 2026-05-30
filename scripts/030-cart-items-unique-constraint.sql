-- Prevent duplicate cart items for the same product variant
ALTER TABLE cart_items ADD CONSTRAINT uq_cart_items_cart_variant UNIQUE (cart_id, product_variant_id);
