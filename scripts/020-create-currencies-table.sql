-- Create currencies table to store supported currencies
CREATE TABLE currencies (
    id BIGINT PRIMARY KEY,
    code VARCHAR(3) NOT NULL UNIQUE, -- ISO 4217 currency code (USD, EUR, etc.)
    name VARCHAR(100) NOT NULL, -- Full currency name
    symbol VARCHAR(10) NOT NULL, -- Currency symbol ($, €, £, etc.)
    decimal_places INTEGER DEFAULT 2 NOT NULL, -- Number of decimal places for the currency
    is_active BOOLEAN DEFAULT true NOT NULL, -- Whether the currency is currently supported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Create indexes for efficient lookups
CREATE INDEX idx_currencies_code ON currencies(code);
CREATE INDEX idx_currencies_active ON currencies(is_active);

-- Create sequence for currencies
CREATE SEQUENCE currencies_id_seq START 1;
ALTER TABLE currencies ALTER COLUMN id SET DEFAULT nextval('currencies_id_seq');

-- Insert supported currencies
INSERT INTO currencies (id, code, name, symbol, decimal_places, is_active) VALUES
(1, 'USD', 'US Dollar', '$', 2, true),
(2, 'EUR', 'Euro', '€', 2, true),
(3, 'GBP', 'British Pound Sterling', '£', 2, true),
(4, 'JPY', 'Japanese Yen', '¥', 0, true), -- JPY typically has no decimal places
(5, 'CAD', 'Canadian Dollar', 'C$', 2, true),
(6, 'AUD', 'Australian Dollar', 'A$', 2, true),
(7, 'CHF', 'Swiss Franc', 'CHF', 2, true),
(8, 'CNY', 'Chinese Yuan', '¥', 2, true),
(9, 'SEK', 'Swedish Krona', 'kr', 2, true),
(10, 'NZD', 'New Zealand Dollar', 'NZ$', 2, true),
(11, 'NOK', 'Norwegian Krone', 'kr', 2, true),
(12, 'DKK', 'Danish Krone', 'kr', 2, true),
(13, 'PLN', 'Polish Złoty', 'zł', 2, true),
(14, 'CZK', 'Czech Koruna', 'Kč', 2, true),
(15, 'HUF', 'Hungarian Forint', 'Ft', 0, true), -- HUF typically has no decimal places
(16, 'RUB', 'Russian Ruble', '₽', 2, true),
(17, 'BRL', 'Brazilian Real', 'R$', 2, true),
(18, 'MXN', 'Mexican Peso', '$', 2, true),
(19, 'INR', 'Indian Rupee', '₹', 2, true),
(20, 'KRW', 'South Korean Won', '₩', 0, true), -- KRW typically has no decimal places
(21, 'SGD', 'Singapore Dollar', 'S$', 2, true),
(22, 'HKD', 'Hong Kong Dollar', 'HK$', 2, true),
(23, 'THB', 'Thai Baht', '฿', 2, true),
(24, 'MYR', 'Malaysian Ringgit', 'RM', 2, true),
(25, 'PHP', 'Philippine Peso', '₱', 2, true),
(26, 'IDR', 'Indonesian Rupiah', 'Rp', 2, true);