-- Products table indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at_desc ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_base_price ON products(base_price);

-- Product variants indexes
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_stock ON product_variants(stock_quantity);

-- Exchange rates indexes (for currency conversion performance)
CREATE INDEX IF NOT EXISTS idx_exchange_rates_from_currency ON exchange_rates(from_currency_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_to_currency ON exchange_rates(to_currency_id);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_effective_date ON exchange_rates(effective_date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_rates_lookup ON exchange_rates(from_currency_id, to_currency_id, effective_date DESC);

-- Currencies indexes
CREATE INDEX IF NOT EXISTS idx_currencies_code ON currencies(code) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_currencies_is_active ON currencies(is_active);

-- Full-text search indexes for products (optional, requires pg_trgm extension)
-- Uncomment if you want to enable full-text search optimization
-- CREATE EXTENSION IF NOT EXISTS pg_trgm;
-- CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON products USING gin(name gin_trgm_ops);
-- CREATE INDEX IF NOT EXISTS idx_products_description_trgm ON products USING gin(description gin_trgm_ops);

-- Composite index for common product queries
CREATE INDEX IF NOT EXISTS idx_products_active_category ON products(is_active, category_id, created_at DESC);

COMMENT ON INDEX idx_products_category_id IS 'Improves product filtering by category';
COMMENT ON INDEX idx_products_is_active IS 'Improves filtering for active products';
COMMENT ON INDEX idx_products_created_at_desc IS 'Improves sorting by creation date';
COMMENT ON INDEX idx_exchange_rates_lookup IS 'Optimizes currency conversion queries';
COMMENT ON INDEX idx_currencies_code IS 'Speeds up currency lookups by code';
