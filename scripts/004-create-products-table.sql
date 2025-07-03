CREATE TABLE products (
    id BIGINT PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100),
    weight DECIMAL(10,2),
    dimensions VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_sku ON products(sku);

INSERT INTO PRODUCTS (id, seller_id, category_id, name, description, base_price, sku, brand, weight, dimensions, is_active, created_at, updated_at) VALUES
(1, 1, 2, 'iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip', 999.99, 'APPL-IP15PRO', 'Apple', 0.187, '5.77 x 2.78 x 0.32 inches', true, '2024-01-20 10:00:00', '2024-01-20 10:00:00'),
(2, 1, 2, 'Samsung Galaxy S24', 'Flagship Android smartphone with AI features', 899.99, 'SAMS-GS24', 'Samsung', 0.168, '5.79 x 2.70 x 0.30 inches', true, '2024-01-21 10:00:00', '2024-01-21 10:00:00'),
(3, 1, 1, 'MacBook Pro 14"', 'Professional laptop with M3 chip', 1999.99, 'APPL-MBP14', 'Apple', 1.6, '12.31 x 8.71 x 0.61 inches', true, '2024-01-22 10:00:00', '2024-01-22 10:00:00'),
(4, 2, 3, 'Premium Cotton T-Shirt', 'High-quality 100% cotton t-shirt', 29.99, 'FASH-TSHIRT-001', 'Fashion Hub', 0.15, '12 x 8 x 1 inches', true, '2024-01-23 10:00:00', '2024-01-23 10:00:00'),
(5, 2, 3, 'Denim Jeans', 'Classic straight-fit denim jeans', 79.99, 'FASH-JEANS-001', 'Fashion Hub', 0.8, '14 x 10 x 2 inches', true, '2024-01-24 10:00:00', '2024-01-24 10:00:00'),
(6, 1, 1, 'Sony WH-1000XM5', 'Noise-canceling wireless headphones', 399.99, 'SONY-WH1000XM5', 'Sony', 0.25, '10.2 x 7.3 x 3.0 inches', true, '2024-01-25 10:00:00', '2024-01-25 10:00:00'),
(7, 1, 1, 'iPad Air 11"', 'Powerful tablet with M2 chip', 599.99, 'APPL-IPADAIR11', 'Apple', 0.461, '9.74 x 7.02 x 0.24 inches', true, '2024-01-26 10:00:00', '2024-01-26 10:00:00'),
(8, 3, 1, 'KitchenAid Stand Mixer', 'Professional 5-quart stand mixer', 449.99, 'KITCH-MIXER-001', 'KitchenAid', 11.0, '14.6 x 8.8 x 14.1 inches', true, '2024-01-27 10:00:00', '2024-01-27 10:00:00'),
(9, 2, 3, 'Leather Jacket', 'Genuine leather motorcycle jacket', 299.99, 'FASH-JACKET-001', 'Fashion Hub', 1.2, '16 x 12 x 3 inches', true, '2024-01-28 10:00:00', '2024-01-28 10:00:00'),
(10, 1, 2, 'Google Pixel 8 Pro', 'AI-powered Android smartphone', 799.99, 'GOOG-PIX8PRO', 'Google', 0.213, '6.40 x 3.01 x 0.35 inches', true, '2024-01-29 10:00:00', '2024-01-29 10:00:00'),
(11, 1, 1, 'Dell XPS 13', 'Ultra-portable laptop with Intel Core i7', 1299.99, 'DELL-XPS13', 'Dell', 1.27, '11.64 x 7.82 x 0.55 inches', true, '2024-01-30 10:00:00', '2024-01-30 10:00:00'),
(12, 3, 1, 'Dyson V15 Detect', 'Cordless vacuum with laser detection', 749.99, 'DYSON-V15', 'Dyson', 3.1, '49.6 x 9.8 x 10.5 inches', true, '2024-01-31 10:00:00', '2024-01-31 10:00:00'),
(13, 2, 3, 'Running Shoes', 'Professional athletic running shoes', 149.99, 'FASH-SHOES-001', 'Nike', 0.9, '12 x 8 x 5 inches', true, '2024-02-01 10:00:00', '2024-02-01 10:00:00'),
(14, 1, 1, 'Canon EOS R6', 'Professional mirrorless camera', 2399.99, 'CANON-R6', 'Canon', 0.68, '5.4 x 3.9 x 2.8 inches', true, '2024-02-02 10:00:00', '2024-02-02 10:00:00'),
(15, 3, 1, 'Ninja Blender', 'High-power blender with multiple cups', 199.99, 'NINJA-BLEND-001', 'Ninja', 5.2, '15.7 x 8.4 x 17.8 inches', true, '2024-02-03 10:00:00', '2024-02-03 10:00:00');
