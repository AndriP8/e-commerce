ALTER TABLE products ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
UPDATE products
SET slug = trim(both '-' from lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g')));
ALTER TABLE products ADD CONSTRAINT products_slug_key UNIQUE (slug);
ALTER TABLE products ALTER COLUMN slug SET NOT NULL;
CREATE INDEX idx_products_slug ON products(slug);
