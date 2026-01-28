CREATE SEQUENCE reviews_id_seq START 1;

CREATE TABLE reviews (
    id BIGINT PRIMARY KEY DEFAULT nextval('reviews_id_seq'),
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    order_item_id BIGINT NOT NULL,
    rating INT NOT NULL,

    review_text TEXT NOT NULL,
    is_verified_purchase BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE CASCADE
);
