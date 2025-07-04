
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY,
    product_variant_id BIGINT NOT NULL,
    quantity_available INT NOT NULL,
    quantity_reserved INT NOT NULL,
    reorder_level INT NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (product_variant_id) REFERENCES product_variants(id)
);

INSERT INTO INVENTORY (id, product_variant_id, quantity_available, quantity_reserved, reorder_level, last_updated) VALUES
(1, 1, 50, 5, 10, '2024-02-01 10:00:00'),
(2, 2, 30, 2, 10, '2024-02-01 10:00:00'),
(3, 3, 100, 0, 20, '2024-02-01 10:00:00');

