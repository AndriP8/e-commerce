CREATE TABLE reviews (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    rating INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    review_text TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);


INSERT INTO reviews (id, product_id, user_id, order_item_id, rating, title, review_text, is_verified_purchase, created_at, updated_at) VALUES
(1, 1, 1, 1, 5, 'Excellent phone!', 'The iPhone 15 Pro is amazing. Great camera quality and performance.', true, '2024-02-05 10:00:00', '2024-02-05 10:00:00'),
(2, 4, 1, 2, 4, 'Good quality shirt', 'Nice cotton material, fits well. Would recommend.', true, '2024-02-06 11:00:00', '2024-02-06 11:00:00'),
(3, 6, 3, 3, 5, 'Best headphones ever', 'Noise cancellation is incredible. Worth every penny.', true, '2024-01-30 15:00:00', '2024-01-30 15:00:00');
