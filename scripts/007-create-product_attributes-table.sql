CREATE TABLE product_attributes (
    id BIGINT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    attribute_name VARCHAR(100) NOT NULL,
    attribute_value TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    attribute_type VARCHAR(100) NOT NULL default 'text',
    UNIQUE (product_id, attribute_name)
);

CREATE INDEX idx_product_attributes_product ON product_attributes(product_id);

INSERT INTO product_attributes (id, product_id, attribute_name, attribute_value, attribute_type) VALUES
(1, 1, 'Operating System', 'iOS 17', 'text'),
(2, 1, 'Screen Size', '6.1 inches', 'text'),
(3, 4, 'Material', '100% Cotton', 'text');
