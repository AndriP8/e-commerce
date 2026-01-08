import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import { transformProductData } from "@/app/utils/product-utils";
import { getPreferenceCurrency } from "@/middleware";
import {
  convertProductPrices,
  convertProductVariantPrices,
} from "@/app/utils/server-currency-utils";
import { getUserPreferredCurrency } from "@/app/utils/currency-utils";

/**
 * GET /api/products/[slug]
 *
 * Retrieves detailed information about a specific product
 *
 * Path Parameters:
 * - slug: Product Slug
 *
 * @returns JSON response with product details including:
 * - Basic product information
 * - Category information
 * - Seller information
 * - Rating information
 * - Stock information
 * - Product variants
 * - Product reviews
 * - Product images
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Validate Slug
  if (!slug || typeof slug !== "string") {
    return NextResponse.json({ error: "Invalid product slug" }, { status: 400 });
  }

  try {
    const client = await pool.connect();

    try {
      // Query to get product with seller, category, rating, and stock information
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
          p.slug,
          p.created_at,
          p.updated_at,
          
          -- Category information
          c.id as category_id,
          c.name as category_name,
          c.description as category_description,
          c.image_url as category_image_url,
          
          -- Seller information
          s.id as seller_id,
          s.business_name as seller_business_name,
          s.description as seller_description,
          s.logo_url as seller_logo_url,
          s.rating as seller_rating,
          s.total_reviews as seller_total_reviews,
          s.is_verified as seller_is_verified,
          
          -- Product rating information (calculated from reviews)
          COALESCE(AVG(r.rating), 0) as product_rating,
          COUNT(r.id) as product_review_count,
          
          -- Stock information (aggregated from variants)
          COALESCE(SUM(pv.stock_quantity), 0) as total_stock,
          COUNT(pv.id) as variant_count
          
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN sellers s ON p.seller_id = s.id
        LEFT JOIN reviews r ON p.id = r.product_id
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        
        WHERE p.slug = $1 AND p.is_active = true
        
        GROUP BY 
          p.id, 
          p.name, 
          p.description, 
          p.base_price, 
          p.sku, 
          p.brand, 
          p.weight, 
          p.dimensions, 
          p.is_active,
          p.slug,
          p.created_at,
          p.updated_at,
          c.id,
          c.name,
          c.description,
          c.image_url,
          s.id,
          s.business_name,
          s.description,
          s.logo_url,
          s.rating,
          s.total_reviews,
          s.is_verified
      `;

      // Get product variants
      const variantsQuery = `
        SELECT 
          id,
          variant_name,
          price,
          sku,
          stock_quantity,
          variant_attributes,
          is_active
        FROM product_variants
        WHERE product_id = (SELECT id FROM products WHERE slug = $1) AND is_active = true
      `;

      // Get product reviews
      const reviewsQuery = `
        SELECT 
          r.id,
          r.rating,
          r.title,
          r.review_text,
          r.is_verified_purchase,
          r.created_at,
          r.updated_at,
          u.id as user_id,
          u.first_name,
          u.last_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = (SELECT id FROM products WHERE slug = $1)
        ORDER BY r.created_at DESC
        LIMIT 10
      `;

      // Get product images
      const imagesQuery = `
        SELECT 
          id,
          image_url,
          alt_text,
          is_primary,
          sort_order
        FROM product_images
        WHERE product_id = (SELECT id FROM products WHERE slug = $1)
        ORDER BY is_primary DESC, sort_order ASC
      `;

      const [productResult, variantsResult, reviewsResult, imagesResult] = await Promise.all([
        client.query(query, [slug]),
        client.query(variantsQuery, [slug]),
        client.query(reviewsQuery, [slug]),
        client.query(imagesQuery, [slug]),
      ]);

      if (productResult.rows.length === 0) {
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }

      // Transform the product data
      let product = transformProductData(productResult.rows[0]);
      let variants = variantsResult.rows;

      // Get the user's preferred currency from the request
      const currencyCode = await getPreferenceCurrency();
      // Convert product prices to the user's preferred currency
      if (currencyCode && currencyCode !== "USD") {
        const convertedProduct = await convertProductPrices([product], currencyCode, "USD");
        product = convertedProduct[0];
        const convertedVariants = await convertProductVariantPrices(variants, currencyCode, "USD");
        variants = convertedVariants;
      }

      const currency = await getUserPreferredCurrency();

      // Add variants, reviews, and images to the product
      return NextResponse.json(
        {
          data: {
            ...product,
            variants,
            reviews: reviewsResult.rows,
            images: imagesResult.rows,
          },
          currency,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Database query error:", error);
      return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
  }
}
