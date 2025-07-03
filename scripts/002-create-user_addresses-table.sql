CREATE TYPE address_type_enum as ENUM('shipping', 'billing');

CREATE TABLE user_addresses (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    address_type address_type_enum NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX idx_user_addresses_type ON user_addresses(address_type);
CREATE INDEX idx_user_addresses_default ON user_addresses(is_default);

INSERT INTO USER_ADDRESSES (id, user_id, address_line1, address_line2, city, state, postal_code, country, is_default, address_type, created_at) VALUES
(1, 1, '123 Main St', 'Apt 4B', 'New York', 'NY', '10001', 'USA', true, 'shipping', '2024-01-15 10:35:00'),
(2, 1, '456 Oak Ave', NULL, 'New York', 'NY', '10002', 'USA', false, 'billing', '2024-01-15 10:36:00'),
(3, 2, '789 Pine Rd', 'Suite 100', 'Los Angeles', 'CA', '90210', 'USA', true, 'shipping', '2024-01-16 14:25:00');