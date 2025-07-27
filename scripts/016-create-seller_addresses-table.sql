CREATE TYPE seller_address_type as ENUM('business', 'warehouse', 'return');

CREATE TABLE seller_addresses (
    id BIGINT PRIMARY KEY,
    seller_id BIGINT NOT NULL,
    address_line1 VARCHAR(255) NOT NULL,
    address_line2 VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    address_type seller_address_type NOT NULL,
    FOREIGN KEY (seller_id) REFERENCES sellers(id) ON DELETE CASCADE
);