CREATE TABLE product_images (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
CREATE INDEX idx_product_images_primary ON product_images(is_primary);
CREATE INDEX idx_product_images_order ON product_images(sort_order);

INSERT INTO product_images (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, 1, 'ip-15-front.webp', 'iPhone 15 Pro front view', 1, true),
(2, 1, 'ip-15-back.webp', 'iPhone 15 Pro back view', 2, false),
(3, 4, '400x500.webp', 'Black cotton t-shirt front view', 1, true);
