CREATE TABLE shipping_methods (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_costs DECIMAL(10,2) NOT NULL,
    estimated_days_min INT NOT NULL,
    estimated_days_max INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

INSERT INTO shipping_methods (id, name, description, base_costs, estimated_days_min, estimated_days_max)
VALUES
    (1, 'Standard Shipping', 'Delivery in 3-5 business days', '0', 3, 5),
    (2, 'Express Shipping', 'Delivery in 1-2 business days', '10.00', 1, 2)