export const transformProductData = (row: any) => ({
  id: row.id,
  name: row.name,
  description: row.description,
  base_price: Number(row.base_price),
  sku: row.sku,
  brand: row.brand,
  weight: Number(row.weight),
  dimensions: row.dimensions,
  is_active: row.is_active,
  created_at: row.created_at,
  updated_at: row.updated_at,
  category: {
    id: row.category_id,
    name: row.category_name,
    description: row.category_description,
    image_url: row.category_image_url,
  },
  seller: {
    id: row.seller_id,
    business_name: row.seller_business_name,
    description: row.seller_description,
    logo_url: row.seller_logo_url,
    rating: Number(row.seller_rating),
    total_reviews: row.seller_total_reviews,
    is_verified: row.seller_is_verified,
  },
  rating: {
    average: parseFloat(row.product_rating),
    count: Number(row.product_review_count),
  },
  stock: {
    total_quantity: Number(row.total_stock),
    variant_count: Number(row.variant_count),
  },
});

/**
 * Builds SQL WHERE conditions based on product filters
 * @param filters Object containing filter parameters
 * @returns Object with whereConditions array and queryParams array
 */
export const buildProductFilterConditions = (filters: ProductFilters) => {
  const whereConditions = ["p.is_active = true"];
  const queryParams: any[] = [];
  let paramCounter = 1;

  if (filters.category_id) {
    whereConditions.push(`p.category_id = $${paramCounter}`);
    queryParams.push(filters.category_id);
    paramCounter++;
  }

  if (filters.seller_id) {
    whereConditions.push(`p.seller_id = $${paramCounter}`);
    queryParams.push(filters.seller_id);
    paramCounter++;
  }

  if (filters.min_price) {
    whereConditions.push(`p.base_price >= $${paramCounter}`);
    queryParams.push(filters.min_price);
    paramCounter++;
  }

  if (filters.max_price) {
    whereConditions.push(`p.base_price <= $${paramCounter}`);
    queryParams.push(filters.max_price);
    paramCounter++;
  }

  if (filters.brand) {
    whereConditions.push(`p.brand ILIKE $${paramCounter}`);
    queryParams.push(`%${filters.brand}%`);
    paramCounter++;
  }

  if (filters.search) {
    whereConditions.push(
      `(p.name ILIKE $${paramCounter} OR p.description ILIKE $${paramCounter})`,
    );
    queryParams.push(`%${filters.search}%`);
    paramCounter++;
  }

  if (filters.in_stock !== undefined) {
    if (filters.in_stock) {
      whereConditions.push(
        `EXISTS (SELECT 1 FROM product_variants pv2 WHERE pv2.product_id = p.id AND pv2.stock_quantity > 0)`,
      );
    } else {
      whereConditions.push(
        `NOT EXISTS (SELECT 1 FROM product_variants pv2 WHERE pv2.product_id = p.id AND pv2.stock_quantity > 0)`,
      );
    }
  }

  return { whereConditions, queryParams, paramCounter };
};

/**
 * Product filter type definition
 */
export type ProductFilters = {
  category_id?: number;
  seller_id?: number;
  min_price?: number;
  max_price?: number;
  brand?: string;
  search?: string;
  in_stock?: boolean;
};
