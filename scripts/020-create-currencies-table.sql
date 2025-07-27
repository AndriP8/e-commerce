CREATE SEQUENCE currencies_id_seq START 1;

CREATE TABLE currencies (
    id BIGINT PRIMARY KEY DEFAULT nextval('currencies_id_seq'),
    code VARCHAR(3) NOT NULL UNIQUE, -- ISO 4217 currency code (USD, EUR, etc.)
    name VARCHAR(100) NOT NULL, -- Full currency name
    symbol VARCHAR(10) NOT NULL, -- Currency symbol ($, €, £, etc.)
    locales VARCHAR(20) NOT NULL, -- Locale string (en-US, de-DE, etc.)
    decimal_places INTEGER DEFAULT 2 NOT NULL, -- Number of decimal places for the currency
    is_active BOOLEAN DEFAULT true NOT NULL, -- Whether the currency is currently supported
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP
);

-- Create indexes for efficient lookups
CREATE INDEX idx_currencies_code ON currencies(code);
CREATE INDEX idx_currencies_active ON currencies(is_active);

-- Insert only the specified currencies
INSERT INTO currencies (code, name, symbol, locales, decimal_places) VALUES
    ('USD', 'US Dollar', '$', 'en-US', 2),
    ('EUR', 'Euro', '€', 'de-DE', 2),
    ('SGD', 'Singapore Dollar', 'S$', 'en-SG', 2),
    ('JPY', 'Japanese Yen', '¥', 'ja-JP', 0),
    ('GBP', 'British Pound', '£', 'en-GB', 2),
    ('CNY', 'Chinese Yuan', '¥', 'zh-CN', 2),
    ('IDR', 'Indonesian Rupiah', 'Rp', 'id-ID', 0);

