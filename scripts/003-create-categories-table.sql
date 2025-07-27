CREATE TABLE categories (
    id BIGINT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_category_id BIGINT,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_parent ON categories(parent_category_id);
CREATE INDEX idx_categories_active ON categories(is_active);

INSERT INTO categories (id, name, description, parent_category_id, image_url, is_active, created_at) VALUES
(1, 'Electronics', 'Electronic devices and accessories', NULL, 'https://example.com/electronics.jpg', true, '2024-01-01 00:00:00'),
(2, 'Smartphones', 'Mobile phones and accessories', 1, 'https://example.com/smartphones.jpg', true, '2024-01-01 00:00:00'),
(3, 'Clothing', 'Apparel and fashion items', NULL, 'https://example.com/clothing.jpg', true, '2024-01-01 00:00:00');