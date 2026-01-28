-- Migration: Add review seed data with 33/33/33 distribution
-- First 33% of products: Have reviews
-- Middle 33% of products: No reviews
-- Last 33% of products: Have reviews

DO $$
DECLARE
    v_total_products INT;
    v_first_cutoff INT;
    v_second_cutoff INT;
    v_product RECORD;
    v_variant_id INT; -- Changed to INT to match column type
    v_order_id INT;
    v_order_item_id INT;
    v_user_id INT := 1;
BEGIN
    -- Calculate cutoffs
    SELECT COUNT(*) INTO v_total_products FROM products;
    v_first_cutoff := FLOOR(v_total_products * 0.33);
    v_second_cutoff := FLOOR(v_total_products * 0.67);

    -- Iterate through products ordered by ID
    FOR v_product IN (
        SELECT p.id, row_number() OVER (ORDER BY p.id) as rn 
        FROM products p
    ) LOOP
        -- Check if product falls into the first or last 33% bucket
        IF v_product.rn <= v_first_cutoff OR v_product.rn > v_second_cutoff THEN
            
            -- Get a variant for this product
            SELECT id INTO v_variant_id FROM product_variants WHERE product_id = v_product.id LIMIT 1;
            
            IF FOUND THEN
                -- Create an Order for this product (simulated)
                INSERT INTO orders (
                    user_id, order_number, subtotal, tax_amount, shipping_amount, discount_amount, total_amount, 
                    order_status, currency_code, shipping_address, billing_address, created_at, updated_at
                ) VALUES (
                    v_user_id, 
                    'ORD-SEED-' || v_product.id, 
                    100.00, 10.00, 5.00, 0.00, 115.00, 
                    'delivered', 'USD', 
                    '{"street": "Seed St", "city": "Seed City", "country": "USA"}', 
                    '{"street": "Seed St", "city": "Seed City", "country": "USA"}', 
                    NOW(), NOW()
                ) RETURNING id INTO v_order_id;

                -- Create Order Item
                INSERT INTO order_items (
                    order_id, product_variant_id, seller_id, quantity, unit_price, total_price, item_status
                ) VALUES (
                    v_order_id, v_variant_id, 1, 1, 100.00, 100.00, 'delivered'
                ) RETURNING id INTO v_order_item_id;

                -- Create Review
                INSERT INTO reviews (
                    product_id, user_id, order_item_id, rating, review_text, is_verified_purchase, created_at
                ) VALUES (
                    v_product.id, 
                    v_user_id, 
                    v_order_item_id, 
                    FLOOR(RANDOM() * 3 + 3)::INT, -- Random rating 3-5
                    'This is a seeded review for product ' || v_product.id, 
                    true, 
                    NOW()
                );
                
                -- Toggle user for variety
                IF v_user_id = 1 THEN v_user_id := 2; ELSE v_user_id := 1; END IF;
            END IF;
        END IF;
    END LOOP;
END $$;
