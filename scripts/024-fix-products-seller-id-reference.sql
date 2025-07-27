-- Fix the foreign key inconsistency between products.seller_id and sellers.id
-- Currently products.seller_id references users(id) but should reference sellers(id)

-- First, drop the existing foreign key constraint
ALTER TABLE products DROP CONSTRAINT IF EXISTS products_seller_id_fkey;

-- Update the seller_id values to match the corresponding seller.id
-- This assumes that each user who is a seller has a corresponding entry in the sellers table
-- with the same user_id as the current seller_id in products
UPDATE products p
SET seller_id = s.id
FROM sellers s
WHERE p.seller_id = s.user_id;

-- Add the new foreign key constraint referencing sellers(id)
ALTER TABLE products ADD CONSTRAINT products_seller_id_fkey
FOREIGN KEY (seller_id) REFERENCES sellers(id);

-- Create an index on seller_id for better query performance
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);