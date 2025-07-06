CREATE TABLE product_variants (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    variant_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    stock_quantity INT NOT NULL DEFAULT 0,
    variant_attributes JSON NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);

ALTER TABLE product_variants ADD COLUMN is_active BOOLEAN DEFAULT TRUE;


INSERT INTO PRODUCT_VARIANTS (id, product_id, variant_name, price, sku, stock_quantity, variant_attributes, is_active) VALUES
(1, 1, 'iPhone 15 Pro 128GB Natural Titanium', 999.99, 'APPL-IP15PRO-128-NAT', 50, '{"storage": "128GB", "color": "Natural Titanium"}', true),
(2, 1, 'iPhone 15 Pro 256GB Blue Titanium', 1099.99, 'APPL-IP15PRO-256-BLU', 30, '{"storage": "256GB", "color": "Blue Titanium"}', true),
(3, 4, 'Premium Cotton T-Shirt Medium Black', 29.99, 'FASH-TSHIRT-001-M-BLK', 100, '{"size": "Medium", "color": "Black"}', true);
(4, 4, 'Premium Cotton T-Shirt Small Black', 29.99, 'FASH-TSHIRT-001-S-BLK', 100, '{"size": "Small", "color": "Black"}', true);
(5, 4, 'Premium Cotton T-Shirt Large Black', 29.99, 'FASH-TSHIRT-001-L-BLK', 100, '{"size": "Large", "color": "Black"}', true);
(6, 4, 'Premium Cotton T-Shirt Extra Large Black', 29.99, 'FASH-TSHIRT-001-EL-BLK', 100, '{"size": "Extra Large", "color": "Black"}', true),
(7, 4, 'Premium Cotton T-Shirt Kids Black', 29.99, 'FASH-TSHIRT-001-K-BLK', 100, '{"size": "Kids", "color": "Black"}', true),
(9, 6, 'Sony WH-1000XM5 Noise-canceling wireless headphones', 399.99, 'SONY-WH1000XM5', 50, '{"color": "Black"}', true),
(10, 7,'iPad Air 11 M2 Chip 64GB Space Gray', 599.99, 'APPL-IPADAIR11', 50, '{"storage": "64GB", "color": "Space Gray"}', true);

select * from products;