-- Add currency_code field to track the currency used for purchase
ALTER TABLE orders ADD COLUMN currency_code VARCHAR(3) DEFAULT 'USD';
ALTER TABLE orders ADD CONSTRAINT fk_orders_currency 
    FOREIGN KEY (currency_code) REFERENCES currencies(code) ON DELETE SET DEFAULT;

-- Create index for currency code in orders
CREATE INDEX idx_orders_currency_code ON orders(currency_code);