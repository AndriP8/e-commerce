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

ALTER TABLE currencies ADD COLUMN locales VARCHAR(20) NOT NULL;

-- Update locales column
-- Update locales for existing currencies
UPDATE currencies SET locales = 'en-US' WHERE code = 'USD';
UPDATE currencies SET locales = 'en-EU' WHERE code = 'EUR';
UPDATE currencies SET locales = 'en-GB' WHERE code = 'GBP';
UPDATE currencies SET locales = 'ja-JP' WHERE code = 'JPY';
UPDATE currencies SET locales = 'en-CA' WHERE code = 'CAD';
UPDATE currencies SET locales = 'en-AU' WHERE code = 'AUD';
UPDATE currencies SET locales = 'de-CH' WHERE code = 'CHF';
UPDATE currencies SET locales = 'zh-CN' WHERE code = 'CNY';
UPDATE currencies SET locales = 'sv-SE' WHERE code = 'SEK';
UPDATE currencies SET locales = 'en-NZ' WHERE code = 'NZD';
UPDATE currencies SET locales = 'nb-NO' WHERE code = 'NOK';
UPDATE currencies SET locales = 'da-DK' WHERE code = 'DKK';
UPDATE currencies SET locales = 'pl-PL' WHERE code = 'PLN';
UPDATE currencies SET locales = 'cs-CZ' WHERE code = 'CZK';
UPDATE currencies SET locales = 'hu-HU' WHERE code = 'HUF';
UPDATE currencies SET locales = 'ru-RU' WHERE code = 'RUB';
UPDATE currencies SET locales = 'pt-BR' WHERE code = 'BRL';
UPDATE currencies SET locales = 'es-MX' WHERE code = 'MXN';
UPDATE currencies SET locales = 'en-IN' WHERE code = 'INR';
UPDATE currencies SET locales = 'ko-KR' WHERE code = 'KRW';
UPDATE currencies SET locales = 'en-SG' WHERE code = 'SGD';
UPDATE currencies SET locales = 'zh-HK' WHERE code = 'HKD';
UPDATE currencies SET locales = 'th-TH' WHERE code = 'THB';
UPDATE currencies SET locales = 'ms-MY' WHERE code = 'MYR';
UPDATE currencies SET locales = 'en-PH' WHERE code = 'PHP';
UPDATE currencies SET locales = 'id-ID' WHERE code = 'IDR';
