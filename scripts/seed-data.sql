-- Sample Data for E-commerce Database

-- USERS
INSERT INTO USERS (user_id, email, password_hash, first_name, last_name, phone, created_at, updated_at, is_active, user_type) VALUES
(1, 'john.doe@email.com', '$2a$12$hashed_password1', 'John', 'Doe', '+1234567890', '2024-01-15 10:30:00', '2024-01-15 10:30:00', true, 'buyer'),
(2, 'jane.smith@email.com', '$2a$12$hashed_password2', 'Jane', 'Smith', '+1234567891', '2024-01-16 14:20:00', '2024-01-16 14:20:00', true, 'seller'),
(3, 'admin@ecommerce.com', '$2a$12$hashed_password3', 'Admin', 'User', '+1234567892', '2024-01-10 09:00:00', '2024-01-10 09:00:00', true, 'admin');

-- USER_ADDRESSES
INSERT INTO USER_ADDRESSES (address_id, user_id, address_line1, address_line2, city, state, postal_code, country, is_default, address_type, created_at) VALUES
(1, 1, '123 Main St', 'Apt 4B', 'New York', 'NY', '10001', 'USA', true, 'shipping', '2024-01-15 10:35:00'),
(2, 1, '456 Oak Ave', NULL, 'New York', 'NY', '10002', 'USA', false, 'billing', '2024-01-15 10:36:00'),
(3, 2, '789 Pine Rd', 'Suite 100', 'Los Angeles', 'CA', '90210', 'USA', true, 'shipping', '2024-01-16 14:25:00');

-- CATEGORIES
INSERT INTO CATEGORIES (category_id, name, description, parent_category_id, image_url, is_active, created_at) VALUES
(1, 'Electronics', 'Electronic devices and accessories', NULL, 'https://example.com/electronics.jpg', true, '2024-01-01 00:00:00'),
(2, 'Smartphones', 'Mobile phones and accessories', 1, 'https://example.com/smartphones.jpg', true, '2024-01-01 00:00:00'),
(3, 'Clothing', 'Apparel and fashion items', NULL, 'https://example.com/clothing.jpg', true, '2024-01-01 00:00:00');

-- SELLERS
INSERT INTO SELLERS (seller_id, user_id, business_name, business_type, tax_id, description, logo_url, rating, total_reviews, is_verified, created_at) VALUES
(1, 2, 'TechWorld Store', 'LLC', 'TAX123456', 'Premium electronics retailer', 'https://example.com/techworld-logo.jpg', 4.5, 1250, true, '2024-01-16 15:00:00'),
(2, 3, 'Fashion Hub', 'Corporation', 'TAX789012', 'Trendy clothing and accessories', 'https://example.com/fashionhub-logo.jpg', 4.2, 890, true, '2024-01-17 10:00:00'),
(3, 1, 'Home Essentials', 'Partnership', 'TAX345678', 'Home and kitchen products', 'https://example.com/homeessentials-logo.jpg', 4.8, 2100, true, '2024-01-18 12:00:00');

-- PRODUCTS (15 products as requested)
INSERT INTO PRODUCTS (product_id, seller_id, category_id, name, description, base_price, sku, brand, weight, dimensions, is_active, created_at, updated_at) VALUES
(1, 1, 2, 'iPhone 15 Pro', 'Latest Apple smartphone with A17 Pro chip', 999.99, 'APPL-IP15PRO', 'Apple', 0.187, '5.77 x 2.78 x 0.32 inches', true, '2024-01-20 10:00:00', '2024-01-20 10:00:00'),
(2, 1, 2, 'Samsung Galaxy S24', 'Flagship Android smartphone with AI features', 899.99, 'SAMS-GS24', 'Samsung', 0.168, '5.79 x 2.70 x 0.30 inches', true, '2024-01-21 10:00:00', '2024-01-21 10:00:00'),
(3, 1, 1, 'MacBook Pro 14"', 'Professional laptop with M3 chip', 1999.99, 'APPL-MBP14', 'Apple', 1.6, '12.31 x 8.71 x 0.61 inches', true, '2024-01-22 10:00:00', '2024-01-22 10:00:00'),
(4, 2, 3, 'Premium Cotton T-Shirt', 'High-quality 100% cotton t-shirt', 29.99, 'FASH-TSHIRT-001', 'Fashion Hub', 0.15, '12 x 8 x 1 inches', true, '2024-01-23 10:00:00', '2024-01-23 10:00:00'),
(5, 2, 3, 'Denim Jeans', 'Classic straight-fit denim jeans', 79.99, 'FASH-JEANS-001', 'Fashion Hub', 0.8, '14 x 10 x 2 inches', true, '2024-01-24 10:00:00', '2024-01-24 10:00:00'),
(6, 1, 1, 'Sony WH-1000XM5', 'Noise-canceling wireless headphones', 399.99, 'SONY-WH1000XM5', 'Sony', 0.25, '10.2 x 7.3 x 3.0 inches', true, '2024-01-25 10:00:00', '2024-01-25 10:00:00'),
(7, 1, 1, 'iPad Air 11"', 'Powerful tablet with M2 chip', 599.99, 'APPL-IPADAIR11', 'Apple', 0.461, '9.74 x 7.02 x 0.24 inches', true, '2024-01-26 10:00:00', '2024-01-26 10:00:00'),
(8, 3, 1, 'KitchenAid Stand Mixer', 'Professional 5-quart stand mixer', 449.99, 'KITCH-MIXER-001', 'KitchenAid', 11.0, '14.6 x 8.8 x 14.1 inches', true, '2024-01-27 10:00:00', '2024-01-27 10:00:00'),
(9, 2, 3, 'Leather Jacket', 'Genuine leather motorcycle jacket', 299.99, 'FASH-JACKET-001', 'Fashion Hub', 1.2, '16 x 12 x 3 inches', true, '2024-01-28 10:00:00', '2024-01-28 10:00:00'),
(10, 1, 2, 'Google Pixel 8 Pro', 'AI-powered Android smartphone', 799.99, 'GOOG-PIX8PRO', 'Google', 0.213, '6.40 x 3.01 x 0.35 inches', true, '2024-01-29 10:00:00', '2024-01-29 10:00:00'),
(11, 1, 1, 'Dell XPS 13', 'Ultra-portable laptop with Intel Core i7', 1299.99, 'DELL-XPS13', 'Dell', 1.27, '11.64 x 7.82 x 0.55 inches', true, '2024-01-30 10:00:00', '2024-01-30 10:00:00'),
(12, 3, 1, 'Dyson V15 Detect', 'Cordless vacuum with laser detection', 749.99, 'DYSON-V15', 'Dyson', 3.1, '49.6 x 9.8 x 10.5 inches', true, '2024-01-31 10:00:00', '2024-01-31 10:00:00'),
(13, 2, 3, 'Running Shoes', 'Professional athletic running shoes', 149.99, 'FASH-SHOES-001', 'Nike', 0.9, '12 x 8 x 5 inches', true, '2024-02-01 10:00:00', '2024-02-01 10:00:00'),
(14, 1, 1, 'Canon EOS R6', 'Professional mirrorless camera', 2399.99, 'CANON-R6', 'Canon', 0.68, '5.4 x 3.9 x 2.8 inches', true, '2024-02-02 10:00:00', '2024-02-02 10:00:00'),
(15, 3, 1, 'Ninja Blender', 'High-power blender with multiple cups', 199.99, 'NINJA-BLEND-001', 'Ninja', 5.2, '15.7 x 8.4 x 17.8 inches', true, '2024-02-03 10:00:00', '2024-02-03 10:00:00');

-- PRODUCT_VARIANTS (3 variants for different products)
INSERT INTO PRODUCT_VARIANTS (variant_id, product_id, variant_name, price, sku, stock_quantity, variant_attributes, is_active) VALUES
(1, 1, 'iPhone 15 Pro 128GB Natural Titanium', 999.99, 'APPL-IP15PRO-128-NAT', 50, '{"storage": "128GB", "color": "Natural Titanium"}', true),
(2, 1, 'iPhone 15 Pro 256GB Blue Titanium', 1099.99, 'APPL-IP15PRO-256-BLU', 30, '{"storage": "256GB", "color": "Blue Titanium"}', true),
(3, 4, 'Premium Cotton T-Shirt Medium Black', 29.99, 'FASH-TSHIRT-001-M-BLK', 100, '{"size": "Medium", "color": "Black"}', true);

-- PRODUCT_IMAGES (3 images for different products)
INSERT INTO PRODUCT_IMAGES (image_id, product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, 1, 'https://example.com/iphone15pro-front.jpg', 'iPhone 15 Pro front view', 1, true),
(2, 1, 'https://example.com/iphone15pro-back.jpg', 'iPhone 15 Pro back view', 2, false),
(3, 4, 'https://example.com/tshirt-black-front.jpg', 'Black cotton t-shirt front view', 1, true);

-- PRODUCT_ATTRIBUTES (3 attributes for different products)
INSERT INTO PRODUCT_ATTRIBUTES (attribute_id, product_id, attribute_name, attribute_value, attribute_type) VALUES
(1, 1, 'Operating System', 'iOS 17', 'text'),
(2, 1, 'Screen Size', '6.1 inches', 'text'),
(3, 4, 'Material', '100% Cotton', 'text');


-- SHOPPING_CART (3 shopping carts)
INSERT INTO SHOPPING_CART (cart_id, user_id, created_at, updated_at) VALUES
(1, 1, '2024-02-01 15:30:00', '2024-02-01 15:30:00'),
(2, 2, '2024-02-01 16:30:00', '2024-02-01 16:30:00'),
(3, 3, '2024-02-01 17:30:00', '2024-02-01 17:30:00');

-- CART_ITEMS (3 cart items)
INSERT INTO CART_ITEMS (cart_item_id, cart_id, product_variant_id, quantity, unit_price, added_at) VALUES
(1, 1, 1, 1, 999.99, '2024-02-01 15:30:00'),
(2, 1, 3, 2, 29.99, '2024-02-01 15:31:00'),
(3, 2, 2, 1, 1099.99, '2024-02-01 16:30:00');

-- ORDERS (3 orders)
INSERT INTO ORDERS (order_id, user_id, order_number, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, order_status, order_date, estimated_delivery, shipping_address, billing_address) VALUES
(1, 1, 'ORD-2024-001', 1059.97, 84.80, 9.99, 0.00, 1154.76, 'confirmed', '2024-02-01 18:00:00', '2024-02-05 18:00:00', '{"address_line1": "123 Main St", "address_line2": "Apt 4B", "city": "New York", "state": "NY", "postal_code": "10001", "country": "USA"}', '{"address_line1": "456 Oak Ave", "city": "New York", "state": "NY", "postal_code": "10002", "country": "USA"}'),
(2, 2, 'ORD-2024-002', 1099.99, 87.99, 0.00, 50.00, 1137.98, 'processing', '2024-02-02 10:00:00', '2024-02-06 10:00:00', '{"address_line1": "789 Pine Rd", "address_line2": "Suite 100", "city": "Los Angeles", "state": "CA", "postal_code": "90210", "country": "USA"}', '{"address_line1": "789 Pine Rd", "address_line2": "Suite 100", "city": "Los Angeles", "state": "CA", "postal_code": "90210", "country": "USA"}'),
(3, 3, 'ORD-2024-003', 399.99, 32.00, 5.99, 0.00, 437.98, 'delivered', '2024-01-25 14:30:00', '2024-01-28 14:30:00', '{"address_line1": "999 Admin St", "city": "Chicago", "state": "IL", "postal_code": "60601", "country": "USA"}', '{"address_line1": "999 Admin St", "city": "Chicago", "state": "IL", "postal_code": "60601", "country": "USA"}');

-- ORDER_ITEMS (3 order items)
INSERT INTO ORDER_ITEMS (order_item_id, order_id, product_variant_id, seller_id, quantity, unit_price, total_price, item_status) VALUES
(1, 1, 1, 1, 1, 999.99, 999.99, 'confirmed'),
(2, 1, 3, 2, 2, 29.99, 59.98, 'confirmed'),
(3, 2, 2, 1, 1, 1099.99, 1099.99, 'processing');

-- PAYMENT_METHODS (3 payment methods)
INSERT INTO PAYMENT_METHODS (payment_method_id, user_id, method_type, card_last_four, card_brand, is_default, created_at, encrypted_details) VALUES
(1, 1, 'credit_card', '4567', 'Visa', true, '2024-01-15 10:40:00', '{"encrypted_card_number": "enc_card_123", "exp_month": 12, "exp_year": 2027}'),
(2, 1, 'paypal', NULL, NULL, false, '2024-01-15 10:41:00', '{"paypal_email": "john.doe@email.com"}'),
(3, 2, 'credit_card', '8901', 'Mastercard', true, '2024-01-16 14:30:00', '{"encrypted_card_number": "enc_card_456", "exp_month": 8, "exp_year": 2026}');

-- PAYMENTS (3 payments)
INSERT INTO PAYMENTS (payment_id, order_id, user_id, amount, payment_method, payment_provider, transaction_id, payment_status, payment_date, payment_details) VALUES
(1, 1, 1, 1154.76, 'credit_card', 'stripe', 'txn_1234567890', 'completed', '2024-02-01 18:01:00', '{"card_last_four": "4567", "card_brand": "Visa"}'),
(2, 2, 2, 1137.98, 'credit_card', 'stripe', 'txn_2345678901', 'completed', '2024-02-02 10:01:00', '{"card_last_four": "8901", "card_brand": "Mastercard"}'),
(3, 3, 3, 437.98, 'paypal', 'paypal', 'txn_3456789012', 'completed', '2024-01-25 14:31:00', '{"paypal_email": "admin@ecommerce.com"}');

-- SHIPPING_METHODS (3 shipping methods)
INSERT INTO SHIPPING_METHODS (shipping_method_id, name, description, base_cost, estimated_days_min, estimated_days_max, is_active) VALUES
(1, 'Standard Shipping', 'Regular delivery within 3-5 business days', 9.99, 3, 5, true),
(2, 'Express Shipping', 'Fast delivery within 1-2 business days', 19.99, 1, 2, true),
(3, 'Free Shipping', 'Free delivery for orders over $50', 0.00, 5, 7, true);

-- NOTIFICATIONS (3 notifications)
INSERT INTO NOTIFICATIONS (notification_id, user_id, title, message, notification_type, is_read, created_at) VALUES
(1, 1, 'Order Confirmed', 'Your order #ORD-2024-001 has been confirmed and is being processed.', 'order_update', true, '2024-02-01 18:01:00'),
(2, 2, 'New Sale!', 'Get 20% off on all electronics this weekend only!', 'promotion', false, '2024-02-03 09:00:00'),
(3, 3, 'Order Delivered', 'Your order #ORD-2024-003 has been delivered successfully.', 'order_update', true, '2024-01-28 16:30:00');