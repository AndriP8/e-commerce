CREATE TYPE order_status_enum as ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

CREATE TABLE orders (
    id BIGINT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    order_number VARCHAR(100) UNIQUE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) NOT NULL,
    shipping_amount DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    order_status order_status_enum NOT NULL,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    estimated_delivery TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipping_address JSON NOT NULL,
    billing_address JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_date ON orders(order_date);

CREATE SEQUENCE orders_id_seq START 1;
ALTER TABLE orders ALTER COLUMN id SET DEFAULT nextval('orders_id_seq');

ALTER TABLE orders DROP COLUMN status;

-- Add currency_code field to track the currency used for purchase
ALTER TABLE orders ADD COLUMN currency_code VARCHAR(3) DEFAULT 'USD';
ALTER TABLE orders ADD CONSTRAINT fk_orders_currency 
    FOREIGN KEY (currency_code) REFERENCES currencies(code) ON DELETE SET DEFAULT;

-- Create index for currency code in orders
CREATE INDEX idx_orders_currency_code ON orders(currency_code);