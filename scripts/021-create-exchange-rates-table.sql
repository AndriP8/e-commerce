-- Create exchange_rates table to store currency conversion rates
CREATE TABLE exchange_rates (
    id BIGINT PRIMARY KEY,
    from_currency_id BIGINT NOT NULL,
    to_currency_id BIGINT NOT NULL,
    rate DECIMAL(15,8) NOT NULL, -- High precision for exchange rates
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (from_currency_id) REFERENCES currencies(id) ON DELETE CASCADE,
    FOREIGN KEY (to_currency_id) REFERENCES currencies(id) ON DELETE CASCADE,
    UNIQUE(from_currency_id, to_currency_id, effective_date)
);

-- Create indexes for efficient rate lookups
CREATE INDEX idx_exchange_rates_from_to ON exchange_rates(from_currency_id, to_currency_id);

-- Create sequence for exchange_rates
CREATE SEQUENCE exchange_rates_id_seq START 1;
ALTER TABLE exchange_rates ALTER COLUMN id SET DEFAULT nextval('exchange_rates_id_seq');

-- Insert initial exchange rates (USD as base currency)
-- Note: These are example rates and should be updated with real-time data
INSERT INTO exchange_rates (id, from_currency_id, to_currency_id, rate, effective_date) VALUES
-- USD to other currencies
(2, 1, 2, 0.92000000, CURRENT_TIMESTAMP), -- USD to EUR
(3, 1, 3, 0.79000000, CURRENT_TIMESTAMP), -- USD to GBP
(4, 1, 4, 149.50000000, CURRENT_TIMESTAMP), -- USD to JPY
(5, 1, 5, 1.35000000, CURRENT_TIMESTAMP), -- USD to CAD
(6, 1, 6, 1.52000000, CURRENT_TIMESTAMP), -- USD to AUD
(7, 1, 7, 0.88000000, CURRENT_TIMESTAMP), -- USD to CHF
(8, 1, 8, 7.25000000, CURRENT_TIMESTAMP), -- USD to CNY
(9, 1, 9, 10.85000000, CURRENT_TIMESTAMP), -- USD to SEK
(10, 1, 10, 1.65000000, CURRENT_TIMESTAMP), -- USD to NZD
(11, 1, 26, 165.00000000, CURRENT_TIMESTAMP), -- USD to IDR
(12, 2, 1, 1.08695652, CURRENT_TIMESTAMP), -- EUR to USD
(13, 3, 1, 1.26582278, CURRENT_TIMESTAMP), -- GBP to USD
(14, 4, 1, 0.00668896, CURRENT_TIMESTAMP), -- JPY to USD
(15, 5, 1, 0.74074074, CURRENT_TIMESTAMP), -- CAD to USD
(16, 6, 1, 0.65789474, CURRENT_TIMESTAMP), -- AUD to USD
(17, 7, 1, 1.13636364, CURRENT_TIMESTAMP), -- CHF to USD
(18, 8, 1, 0.13793103, CURRENT_TIMESTAMP), -- CNY to USD
(19, 9, 1, 0.09216590, CURRENT_TIMESTAMP), -- SEK to USD
(20, 10, 1, 0.60606061, CURRENT_TIMESTAMP), -- NZD to USD
(21, 26, 1, 0.00006415, CURRENT_TIMESTAMP); -- IDR to USD

UPDATE exchange_rates SET rate = 15600.00000000, from_currency_id = 1, to_currency_id = 26 WHERE id = 11;
