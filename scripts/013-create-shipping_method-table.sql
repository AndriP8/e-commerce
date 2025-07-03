CREATE TABLE shipping_methods (
    id BIGINT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_costs DECIMAL(10,2) NOT NULL,
    estimated_days_min INT NOT NULL,
    estimated_days_max INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);
