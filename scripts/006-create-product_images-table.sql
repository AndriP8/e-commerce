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

INSERT INTO PRODUCT_IMAGES (id, product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, 1, 'https://example.com/iphone15pro-front.jpg', 'iPhone 15 Pro front view', 1, true),
(2, 1, 'https://example.com/iphone15pro-back.jpg', 'iPhone 15 Pro back view', 2, false),
(3, 4, 'https://example.com/tshirt-black-front.jpg', 'Black cotton t-shirt front view', 1, true);
