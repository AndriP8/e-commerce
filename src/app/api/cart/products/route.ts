import { NextResponse, NextRequest } from "next/server";
import { pool } from "@/app/db/client";
import {
  handleApiError,
  BadRequestError,
  UnauthorizedError,
} from "@/app/utils/api-error-handler";
import { verifyToken } from "@/app/utils/auth-utils";
import { cookies } from "next/headers";
import { getPreferenceCurrency } from "@/middleware";
import { convertCartPrices } from "@/app/utils/server-currency-utils";
import { getUserPreferredCurrency } from "@/app/utils/currency-utils";

/**
 * GET /api/cart/products
 *
 * Retrieves the current user's shopping cart with all items
 *
 * @returns JSON response with cart information
 */
export async function GET(_request: NextRequest) {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    // Verify the token and get the user ID
    const decoded = await verifyToken(token);
    const user_id = decoded.userId;

    const client = await pool.connect();

    try {
      // Find the user's shopping cart
      const cartQuery = `
        SELECT id FROM shopping_carts 
        WHERE user_id = $1
      `;

      const cartResult = await client.query(cartQuery, [user_id]);

      if (cartResult.rows.length === 0) {
        // No cart found, return empty cart
        return NextResponse.json(
          {
            data: {
              cart_id: null,
              user_id,
              items: [],
              total_price: 0,
              item_count: 0,
            },
          },
          { status: 200 },
        );
      }

      const cart_id = cartResult.rows[0].id;

      // Get the cart with items
      const cartWithItemsQuery = `
        SELECT 
          sc.id as cart_id,
          sc.user_id,
          sc.created_at,
          sc.updated_at,
          CASE WHEN COUNT(ci.id) = 0 THEN '[]'::json
            ELSE json_agg(
              json_build_object(
                'id', ci.id,
                'product_id', p.id,
                'product_name', p.name,
                'image_url', c.image_url,
                'variant_id', pv.id,
                'quantity', ci.quantity,
                'unit_price', ci.unit_price,
                'total_price', (ci.quantity * ci.unit_price),
                'added_at', ci.added_at
              )
            ) 
          END as items,
          COALESCE(SUM(ci.quantity * ci.unit_price), 0) as total_price,
          COUNT(ci.id) as item_count
        FROM shopping_carts sc
        LEFT JOIN cart_items ci ON sc.id = ci.cart_id
        LEFT JOIN product_variants pv ON ci.product_variant_id = pv.id
        LEFT JOIN products p ON pv.product_id = p.id
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE sc.id = $1
        GROUP BY sc.id, sc.user_id, sc.created_at, sc.updated_at
      `;

      const cartWithItemsResult = await client.query(cartWithItemsQuery, [
        cart_id,
      ]);

      // Get the user's preferred currency from the request
      const currencyCode = await getPreferenceCurrency();

      // Get the cart data
      let cartData = cartWithItemsResult.rows[0];

      // Convert cart prices to the user's preferred currency
      if (currencyCode && currencyCode !== "USD" && cartData.items.length > 0) {
        cartData = await convertCartPrices(cartData, currencyCode, "USD");
      }

      const currency = await getUserPreferredCurrency(user_id);

      return NextResponse.json(
        {
          data: cartData,
          currency,
        },
        { status: 200 },
      );
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error retrieving cart:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}

/**
 * POST /api/cart/products
 *
 * Adds a product to the user's shopping cart
 *
 * Request Body:
 * - product_id: ID of the product to add
 * - quantity: Number of items to add
 *
 * @returns JSON response with updated cart information
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { product_id, quantity } = body;

    // Validate input parameters
    if (!product_id || isNaN(Number(product_id))) {
      throw new BadRequestError("Valid product_id is required");
    }

    if (!quantity || isNaN(Number(quantity)) || Number(quantity) < 1) {
      throw new BadRequestError("Valid quantity is required (minimum 1)");
    }

    // Get the token from cookies
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    // Verify the token and get the user ID
    const decoded = await verifyToken(token);
    const user_id = decoded.userId;

    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query("BEGIN");

      // Check if the product exists and get the default variant
      const productQuery = `
        SELECT p.id, p.base_price, pv.id as variant_id, pv.stock_quantity 
        FROM products p
        LEFT JOIN product_variants pv ON p.id = pv.product_id
        WHERE p.id = $1
        LIMIT 1
      `;

      const productResult = await client.query(productQuery, [product_id]);

      if (productResult.rows.length === 0) {
        throw new BadRequestError("Product not found");
      }

      const product = productResult.rows[0];

      // Check if the product has enough stock
      if (product.stock_quantity < quantity) {
        throw new BadRequestError("Not enough stock available");
      }

      // Find or create a shopping cart for the user
      const cartQuery = `
        SELECT id FROM shopping_carts 
        WHERE user_id = $1
      `;

      const cartResult = await client.query(cartQuery, [user_id]);

      let cart_id;

      if (cartResult.rows.length === 0) {
        // Create a new cart
        const createCartQuery = `
          INSERT INTO shopping_carts (id, user_id, created_at, updated_at)
          VALUES (nextval('shopping_carts_id_seq'), $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          RETURNING id
        `;

        const newCartResult = await client.query(createCartQuery, [user_id]);
        cart_id = newCartResult.rows[0].id;
      } else {
        cart_id = cartResult.rows[0].id;
      }

      // Check if the product is already in the cart
      const cartItemQuery = `
        SELECT id, quantity FROM cart_items
        WHERE cart_id = $1 AND product_variant_id = $2
      `;

      const cartItemResult = await client.query(cartItemQuery, [
        cart_id,
        product.variant_id,
      ]);

      if (cartItemResult.rows.length > 0) {
        // Update existing cart item
        const existingItem = cartItemResult.rows[0];
        const newQuantity = existingItem.quantity + Number(quantity);

        // Check if the new quantity exceeds available stock
        if (newQuantity > product.stock_quantity) {
          throw new BadRequestError(
            "Adding this quantity would exceed available stock",
          );
        }

        const updateCartItemQuery = `
          UPDATE cart_items
          SET quantity = $1, unit_price = $2
          WHERE id = $3
          RETURNING id, quantity, unit_price
        `;

        await client.query(updateCartItemQuery, [
          newQuantity,
          product.base_price,
          existingItem.id,
        ]);
      } else {
        // Add new cart item
        const addCartItemQuery = `
          INSERT INTO cart_items (id, cart_id, product_variant_id, quantity, unit_price, added_at)
          VALUES (nextval('cart_items_id_seq'), $1, $2, $3, $4, CURRENT_TIMESTAMP)
          RETURNING id, quantity, unit_price
        `;
        await client.query(addCartItemQuery, [
          cart_id,
          product.variant_id,
          quantity,
          product.base_price,
        ]);
      }

      // Update the cart's updated_at timestamp
      await client.query(
        "UPDATE shopping_carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [cart_id],
      );

      // Get the updated cart with items
      const updatedCartQuery = `
        SELECT 
          sc.id as cart_id,
          sc.user_id,
          sc.created_at,
          sc.updated_at,
          json_agg(
            json_build_object(
              'id', ci.id,
              'product_id', p.id,
              'product_name', p.name,
              'variant_id', pv.id,
              'quantity', ci.quantity,
              'unit_price', ci.unit_price,
              'total_price', (ci.quantity * ci.unit_price),
              'added_at', ci.added_at
            )
          ) as items,
          SUM(ci.quantity * ci.unit_price) as total_price,
          COUNT(ci.id) as item_count
        FROM shopping_carts sc
        JOIN cart_items ci ON sc.id = ci.cart_id
        JOIN product_variants pv ON ci.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        WHERE sc.id = $1
        GROUP BY sc.id, sc.user_id, sc.created_at, sc.updated_at
      `;

      const updatedCartResult = await client.query(updatedCartQuery, [cart_id]);

      // Commit the transaction
      await client.query("COMMIT");

      // Get the user's preferred currency from the request
      const currencyCode = await getPreferenceCurrency();

      // Get the updated cart data
      let updatedCartData = updatedCartResult.rows[0];

      // Convert cart prices to the user's preferred currency
      if (
        currencyCode &&
        currencyCode !== "USD" &&
        updatedCartData.items.length > 0
      ) {
        updatedCartData = await convertCartPrices(
          updatedCartData,
          currencyCode,
          "USD",
        );
      }

      return NextResponse.json(
        {
          message: "Product added to cart successfully",
          data: updatedCartData,
          currency: currencyCode,
        },
        { status: 200 },
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
