CREATE TABLE order_items (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    product_variant_id BIGINT NOT NULL,
    seller_id BIGINT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    item_status order_status_enum NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_variant_id ON order_items(product_variant_id);

INSERT INTO order_items (id, order_id, product_variant_id, seller_id, quantity, unit_price, total_price, item_status) VALUES
(1, 1, 1, 1, 1, 999.99, 999.99, 'confirmed'),
(2, 1, 3, 2, 2, 29.99, 59.98, 'confirmed'),
(3, 2, 2, 1, 1, 1099.99, 1099.99, 'processing');
