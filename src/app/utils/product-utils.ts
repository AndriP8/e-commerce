/**
 * Raw database row structure from product queries
 */
export interface ProductRow {
  id: string;
  name: string;
  description: string;
  base_price: string | number;
  sku: string;
  brand: string;
  weight: string | number;
  dimensions: string;
  is_active: boolean;
  slug: string;
  created_at: Date | string;
  updated_at: Date | string;
  category_id: string;
  category_name: string;
  category_description: string;
  category_image_url: string;
  seller_id?: string;
  seller_business_name?: string;
  seller_description?: string;
  seller_logo_url?: string;
  seller_rating?: string | number;
  seller_total_reviews?: number;
  seller_is_verified?: boolean;
  product_rating?: string | number;
  product_review_count?: number;
  total_stock?: string | number;
  variant_count?: string | number;
}

/**
 * Transformed product data structure
 */
export interface TransformedProduct {
  id: string;
  name: string;
  description: string;
  base_price: number;
  sku: string;
  brand: string;
  weight: number;
  dimensions: string;
  is_active: boolean;
  slug: string;
  created_at: Date | string;
  updated_at: Date | string;
  category: {
    id: string;
    name: string;
    description: string;
    image_url: string;
  };
  seller: {
    id?: string;
    business_name?: string;
    description?: string;
    logo_url?: string;
    rating?: number;
    total_reviews?: number;
    is_verified?: boolean;
  };
  rating: {
    average: number;
    count: number;
  };
  stock: {
    total_quantity: number;
    variant_count: number;
  };
}

export const transformProductData = (row: ProductRow): TransformedProduct => ({
  id: row.id,
  name: row.name,
  description: row.description,
  base_price: Number(row.base_price),
  sku: row.sku,
  brand: row.brand,
  weight: Number(row.weight),
  dimensions: row.dimensions,
  is_active: row.is_active,
  slug: row.slug,
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
    rating: Number(row.seller_rating) || 0,
    total_reviews: row.seller_total_reviews || 0,
    is_verified: row.seller_is_verified,
  },
  rating: {
    average: row.product_rating ? parseFloat(String(row.product_rating)) : 0,
    count: Number(row.product_review_count) || 0,
  },
  stock: {
    total_quantity: Number(row.total_stock) || 0,
    variant_count: Number(row.variant_count) || 0,
  },
});

/**
 * Query builder return type
 */
export interface FilterConditionsResult {
  whereConditions: string[];
  queryParams: (string | number | boolean)[];
  paramCounter: number;
}

export const buildProductFilterConditions = (
  filters: ProductFilters,
): FilterConditionsResult => {
  const whereConditions = ["p.is_active = true"];
  const queryParams: (string | number | boolean)[] = [];
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
