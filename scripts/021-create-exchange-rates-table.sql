CREATE SEQUENCE exchange_rates_id_seq START 1;
CREATE TABLE exchange_rates (
    id BIGINT PRIMARY KEY DEFAULT nextval('exchange_rates_id_seq'),
    from_currency_id BIGINT NOT NULL,
    to_currency_id BIGINT NOT NULL,
    rate DECIMAL(15,8) NOT NULL, -- High precision for exchange rates
    effective_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP,
    FOREIGN KEY (from_currency_id) REFERENCES currencies(id) ON DELETE CASCADE,
    FOREIGN KEY (to_currency_id) REFERENCES currencies(id) ON DELETE CASCADE,
    UNIQUE(from_currency_id, to_currency_id)
);

-- Insert exchange rates for USD as base currency
INSERT INTO exchange_rates (from_currency_id, to_currency_id, rate, effective_date)
SELECT 
    c1.id as from_currency_id,
    c2.id as to_currency_id,
    CASE 
        WHEN c2.code = 'EUR' THEN 0.92345678 -- USD to EUR
        WHEN c2.code = 'SGD' THEN 1.34567890 -- USD to SGD
        WHEN c2.code = 'JPY' THEN 149.123456 -- USD to JPY
        WHEN c2.code = 'GBP' THEN 0.78901234 -- USD to GBP
        WHEN c2.code = 'CNY' THEN 7.23456789 -- USD to CNY
        WHEN c2.code = 'IDR' THEN 15678.9012 -- USD to IDR
    END as rate,
    CURRENT_TIMESTAMP as effective_date
FROM currencies c1
CROSS JOIN currencies c2
WHERE c1.code = 'USD'
AND c2.code IN ('EUR', 'SGD', 'JPY', 'GBP', 'CNY', 'IDR');

-- Insert exchange rates for EUR as base currency
INSERT INTO exchange_rates (from_currency_id, to_currency_id, rate, effective_date)
SELECT 
    c1.id as from_currency_id,
    c2.id as to_currency_id,
    CASE 
        WHEN c2.code = 'USD' THEN 1.08289012 -- EUR to USD
        WHEN c2.code = 'SGD' THEN 1.45678901 -- EUR to SGD
        WHEN c2.code = 'JPY' THEN 161.234567 -- EUR to JPY
        WHEN c2.code = 'GBP' THEN 0.85432109 -- EUR to GBP
        WHEN c2.code = 'CNY' THEN 7.83456789 -- EUR to CNY
        WHEN c2.code = 'IDR' THEN 16890.1234 -- EUR to IDR
    END as rate,
    CURRENT_TIMESTAMP as effective_date
FROM currencies c1
CROSS JOIN currencies c2
WHERE c1.code = 'EUR'
AND c2.code IN ('USD', 'SGD', 'JPY', 'GBP', 'CNY', 'IDR');

-- Insert remaining currency pairs with approximate rates
INSERT INTO exchange_rates (from_currency_id, to_currency_id, rate, effective_date)
SELECT 
    c1.id as from_currency_id,
    c2.id as to_currency_id,
    CASE 
        -- SGD based rates
        WHEN c1.code = 'SGD' AND c2.code = 'USD' THEN 0.74323456
        WHEN c1.code = 'SGD' AND c2.code = 'EUR' THEN 0.68654321
        WHEN c1.code = 'SGD' AND c2.code = 'JPY' THEN 110.678901
        WHEN c1.code = 'SGD' AND c2.code = 'GBP' THEN 0.58765432
        WHEN c1.code = 'SGD' AND c2.code = 'CNY' THEN 5.37654321
        WHEN c1.code = 'SGD' AND c2.code = 'IDR' THEN 11567.8901
        -- JPY based rates
        WHEN c1.code = 'JPY' AND c2.code = 'USD' THEN 0.00670890
        WHEN c1.code = 'JPY' AND c2.code = 'EUR' THEN 0.00620123
        WHEN c1.code = 'JPY' AND c2.code = 'SGD' THEN 0.00904321
        WHEN c1.code = 'JPY' AND c2.code = 'GBP' THEN 0.00529012
        WHEN c1.code = 'JPY' AND c2.code = 'CNY' THEN 0.04856789
        WHEN c1.code = 'JPY' AND c2.code = 'IDR' THEN 104.567890
        -- GBP based rates
        WHEN c1.code = 'GBP' AND c2.code = 'USD' THEN 1.26789012
        WHEN c1.code = 'GBP' AND c2.code = 'EUR' THEN 1.17012345
        WHEN c1.code = 'GBP' AND c2.code = 'SGD' THEN 1.70234567
        WHEN c1.code = 'GBP' AND c2.code = 'JPY' THEN 188.901234
        WHEN c1.code = 'GBP' AND c2.code = 'CNY' THEN 9.15678901
        WHEN c1.code = 'GBP' AND c2.code = 'IDR' THEN 19789.0123
        -- CNY based rates
        WHEN c1.code = 'CNY' AND c2.code = 'USD' THEN 0.13823456
        WHEN c1.code = 'CNY' AND c2.code = 'EUR' THEN 0.12765432
        WHEN c1.code = 'CNY' AND c2.code = 'SGD' THEN 0.18601234
        WHEN c1.code = 'CNY' AND c2.code = 'JPY' THEN 20.5678901
        WHEN c1.code = 'CNY' AND c2.code = 'GBP' THEN 0.10901234
        WHEN c1.code = 'CNY' AND c2.code = 'IDR' THEN 2167.89012
        -- IDR based rates
        WHEN c1.code = 'IDR' AND c2.code = 'USD' THEN 0.00006378
        WHEN c1.code = 'IDR' AND c2.code = 'EUR' THEN 0.00005890
        WHEN c1.code = 'IDR' AND c2.code = 'SGD' THEN 0.00008645
        WHEN c1.code = 'IDR' AND c2.code = 'JPY' THEN 0.00956789
        WHEN c1.code = 'IDR' AND c2.code = 'GBP' THEN 0.00005054
        WHEN c1.code = 'IDR' AND c2.code = 'CNY' THEN 0.00046123
    END as rate,
    CURRENT_TIMESTAMP as effective_date
FROM currencies c1
CROSS JOIN currencies c2
WHERE c1.code IN ('SGD', 'JPY', 'GBP', 'CNY', 'IDR')
AND c2.code IN ('USD', 'EUR', 'SGD', 'JPY', 'GBP', 'CNY', 'IDR')
AND c1.code != c2.code;

