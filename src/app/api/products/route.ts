import { NextResponse, NextRequest } from "next/server";

import {
  ProductFilters,
  buildProductFilterConditions,
  transformProductData,
  ProductRow,
  TransformedProduct,
} from "@/app/utils/product-utils";
import { pool } from "@/app/db/client";
import { handleApiError, BadRequestError } from "@/app/utils/api-error-handler";
import { getPreferenceCurrency } from "@/middleware";
import { convertProductPrices } from "@/app/utils/server-currency-utils";
import { getUserPreferredCurrency } from "@/app/utils/currency-utils";
import { validateQuery } from "@/app/utils/validation";
import { productFiltersSchemaRefined } from "@/app/schemas/products";

/**
 * Aggregate data from database queries
 */
interface AggregateRow {
  id: number;
  total_stock: string | number;
  variant_count: string | number;
}

/**
 * Processed product aggregate data
 */
interface ProductAggregate {
  total_stock: number;
  variant_count: number;
}

type AggregatesMap = Record<number, ProductAggregate>;

/**
 * GET /api/products
 *
 * Retrieves a list of products with pagination, filtering, and sorting
 *
 * Query Parameters:
 * - page: Page number (default: 1)
 * - size: Number of items per page (default: 10)
 * - category_id: Filter by category ID
 * - seller_id: Filter by seller ID
 * - min_price: Filter by minimum price
 * - max_price: Filter by maximum price
 * - brand: Filter by brand name (partial match)
 * - search: Search in product name and description
 * - in_stock: Filter by stock availability (true/false)
 * - sort_by: Sort field (created_at, name, base_price, product_rating)
 * - sort_order: Sort direction (asc/desc)
 *
 * @returns JSON response with products array and pagination metadata
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Validate and parse query parameters with Zod schema
    const validatedParams = validateQuery(searchParams, productFiltersSchemaRefined);

    const {
      page,
      size,
      category_id,
      seller_id,
      min_price,
      max_price,
      brand,
      search,
      in_stock,
      sort_by,
      sort_order,
    } = validatedParams;

    const offset = (page - 1) * size;

    // Build filters object for query builder
    const filters: ProductFilters = {
      category_id,
      seller_id,
      min_price,
      max_price,
      brand,
      search,
      in_stock,
    };

    const client = await pool.connect();

    try {
      // Build the WHERE clause based on filters
      const { whereConditions, queryParams, paramCounter } =
        buildProductFilterConditions(filters);

      const sortColumn = sort_by;

      // Optimized query with reduced JOINs and better performance
      const query = `
        SELECT 
          p.id, 
          p.name, 
          p.description, 
          p.base_price, 
          p.sku, 
          p.brand, 
          p.weight, 
          p.dimensions, 
          p.is_active,
          p.created_at,
          p.updated_at,
          
          -- Category information
          c.id as category_id,
          c.name as category_name,
          c.description as category_description,
          c.image_url as category_image_url,
          
          -- Pre-calculated aggregates (to be computed separately for better performance)
          0 as total_stock,
          0 as variant_count
          
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        
        WHERE ${whereConditions.join(" AND ")}
        
        ORDER BY ${
          sortColumn === "product_rating" ? "p.created_at" : `p.${sortColumn}`
        } ${sort_order.toUpperCase()}
        LIMIT $${paramCounter} OFFSET $${paramCounter + 1}
      `;

      // Add pagination parameters
      queryParams.push(size, offset);

      // Count total products for pagination metadata
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as total
        FROM products p
        LEFT JOIN product_variants pv2 ON p.id = pv2.product_id
        WHERE ${whereConditions.join(" AND ")}
      `;

      // Function to get aggregated data for products
      const getProductAggregates = async (productIds: number[]): Promise<AggregatesMap> => {
        if (productIds.length === 0) return {};

        const aggregateQuery = `
          SELECT
            p.id,
            COALESCE(SUM(pv.stock_quantity), 0) as total_stock,
            COUNT(DISTINCT pv.id) as variant_count
          FROM products p
          LEFT JOIN reviews r ON p.id = r.product_id
          LEFT JOIN product_variants pv ON p.id = pv.product_id
          WHERE p.id = ANY($1)
          GROUP BY p.id
        `;

        const result = await client.query<AggregateRow>(aggregateQuery, [productIds]);
        return result.rows.reduce((acc: AggregatesMap, row) => {
          acc[row.id] = {
            total_stock: parseInt(String(row.total_stock)),
            variant_count: parseInt(String(row.variant_count)),
          };
          return acc;
        }, {} as AggregatesMap);
      };

      const [productsResult, countResult] = await Promise.all([
        client.query(query, queryParams),
        client.query(countQuery, queryParams.slice(0, -2)), // Remove size and offset params
      ]);

      const totalProducts = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(totalProducts / size);

      // Get product IDs for aggregate data
      const productIds = productsResult.rows.map((row) => row.id);

      // Fetch aggregated data separately for better performance
      const aggregates = await getProductAggregates(productIds);

      // Transform the data to a more structured format with aggregated data
      let products: TransformedProduct[] = productsResult.rows.map((row) => {
        const productData = transformProductData(row as ProductRow);
        const aggregate = aggregates[row.id] || {
          total_stock: 0,
          variant_count: 0,
        };

        return {
          ...productData,
          stock: {
            total_quantity: aggregate.total_stock,
            variant_count: aggregate.variant_count,
          },
        };
      });

      // Get the user's preferred currency from the request
      const currencyCode = await getPreferenceCurrency();

      // Convert product prices to the user's preferred currency
      if (currencyCode && currencyCode !== "USD") {
        products = await convertProductPrices(products, currencyCode, "USD");
      }

      const currency = await getUserPreferredCurrency();

      return NextResponse.json(
        {
          data: products,
          currency,
          pagination: {
            total: totalProducts,
            page,
            size,
            total_pages: totalPages,
            has_next_page: page < totalPages,
            has_prev_page: page > 1,
          },
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Database query error:", error);
      const apiError = handleApiError(error);

      return NextResponse.json(
        { error: apiError.message },
        { status: apiError.status },
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json(
      { error: "Database connection failed" },
      { status: 500 },
    );
  }
}
