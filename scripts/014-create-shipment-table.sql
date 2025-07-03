CREATE TYPE shipment_status_enum as ENUM('pending', 'in_transit', 'delivered', 'failed');

CREATE TABLE shipments (
    id BIGINT PRIMARY KEY,
    order_id BIGINT NOT NULL,
    shipment_status shipment_status_enum NOT NULL,
    carrier VARCHAR(100) NOT NULL,
    shipping_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    delivered_date TIMESTAMP,
    tracking_details JSON NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);
