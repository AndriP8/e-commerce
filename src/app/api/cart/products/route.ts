import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import {
  BadRequestError,
  handleApiError,
  UnauthorizedError,
} from "@/app/utils/api-error-handler";
import { verifyToken } from "@/app/utils/auth-utils";
import { getCachedUserCurrency } from "@/app/utils/currency-utils";
import { convertCartPrices } from "@/app/utils/server-currency-utils";
import { getPreferenceCurrency } from "@/middleware";
import { addToCartSchema } from "@/schemas/cart";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const decoded = await verifyToken(token);
    const user_id = decoded.userId;

    const client = await pool.connect();

    try {
      const cartResult = await client.query(
        "SELECT id FROM shopping_carts WHERE user_id = $1",
        [user_id],
      );

      if (cartResult.rows.length === 0) {
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

      const currencyCode = await getPreferenceCurrency();

      let cartData = cartWithItemsResult.rows[0];

      if (currencyCode && currencyCode !== "USD" && cartData.items.length > 0) {
        cartData = await convertCartPrices(cartData, currencyCode, "USD");
      }

      const currency = await getCachedUserCurrency(user_id, currencyCode);

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { product_id, quantity } = addToCartSchema.parse(body);

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const decoded = await verifyToken(token);
    const user_id = decoded.userId;

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

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

      if (product.stock_quantity < quantity) {
        throw new BadRequestError("Not enough stock available");
      }

      const cartResult = await client.query(
        "SELECT id FROM shopping_carts WHERE user_id = $1",
        [user_id],
      );

      let cart_id: string | number;

      if (cartResult.rows.length === 0) {
        const newCartResult = await client.query(
          `INSERT INTO shopping_carts (id, user_id, created_at, updated_at)
           VALUES (nextval('shopping_carts_id_seq'), $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
           RETURNING id`,
          [user_id],
        );
        cart_id = newCartResult.rows[0].id;
      } else {
        cart_id = cartResult.rows[0].id;
      }

      // Atomic upsert: add quantity if exists, insert otherwise.
      // The UNIQUE constraint on (cart_id, product_variant_id) guarantees no duplicates.
      const upsertResult = await client.query(
        `INSERT INTO cart_items (id, cart_id, product_variant_id, quantity, unit_price, added_at)
         VALUES (nextval('cart_items_id_seq'), $1, $2, $3, $4, CURRENT_TIMESTAMP)
         ON CONFLICT (cart_id, product_variant_id)
         DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity,
                       unit_price = EXCLUDED.unit_price
         RETURNING quantity`,
        [cart_id, product.variant_id, quantity, product.base_price],
      );

      const finalQty = upsertResult.rows[0].quantity;
      if (finalQty > product.stock_quantity) {
        throw new BadRequestError(
          "Adding this quantity would exceed available stock",
        );
      }

      await client.query(
        "UPDATE shopping_carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [cart_id],
      );

      await client.query("COMMIT");

      revalidateTag("cart");

      return NextResponse.json(
        { message: "Product added to cart successfully" },
        { status: 200 },
      );
    } catch (error) {
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
