CREATE TABLE sellers (
        id BIGINT PRIMARY KEY,
        user_id BIGINT NOT NULL,
        business_name VARCHAR(255) NOT NULL,
        business_type VARCHAR(100) NOT NULL,
        tax_id VARCHAR(100) NOT NULL,
        description TEXT,
        logo_url VARCHAR(255),
        rating DECIMAL(10,2) NOT NULL DEFAULT 0,
        total_reviews INT NOT NULL DEFAULT 0,
        is_verified BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO sellers (id, user_id, business_name, business_type, tax_id, description, logo_url, rating, total_reviews, is_verified, created_at) VALUES
(1, 2, 'TechWorld Store', 'LLC', 'TAX123456', 'Premium electronics retailer', 'https://example.com/techworld-logo.jpg', 4.5, 1250, true, '2024-01-16 15:00:00'),
(2, 3, 'Fashion Hub', 'Corporation', 'TAX789012', 'Trendy clothing and accessories', 'https://example.com/fashionhub-logo.jpg', 4.2, 890, true, '2024-01-17 10:00:00'),
(3, 1, 'Home Essentials', 'Partnership', 'TAX345678', 'Home and kitchen products', 'https://example.com/homeessentials-logo.jpg', 4.8, 2100, true, '2024-01-18 12:00:00');