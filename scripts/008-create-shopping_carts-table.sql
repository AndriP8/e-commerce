CREATE TABLE shopping_carts (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_shopping_carts_user_id ON shopping_carts(user_id);

CREATE SEQUENCE shopping_carts_id_seq START 1;

select * from shopping_carts;