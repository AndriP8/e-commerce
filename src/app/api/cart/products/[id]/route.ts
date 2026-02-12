import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import { handleApiError, BadRequestError, NotFoundError } from "@/app/utils/api-error-handler";
import { revalidateTag } from "next/cache";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const searchParams = await params;
    const cartItemId = parseInt(searchParams.id);

    if (isNaN(cartItemId)) {
      throw new BadRequestError("Invalid cart item ID");
    }

    // Parse the request body
    const body = await request.json();
    const { quantity } = body;

    // Validate the quantity
    if (!quantity || typeof quantity !== "number" || quantity < 1) {
      throw new BadRequestError("Quantity must be a positive number");
    }

    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query("BEGIN");

      // Check if the cart item exists
      const cartItemQuery = `
        SELECT ci.id, ci.cart_id, ci.product_variant_id, pv.stock_quantity 
        FROM cart_items ci
        JOIN product_variants pv ON ci.product_variant_id = pv.id
        WHERE ci.id = $1
      `;

      const cartItemResult = await client.query(cartItemQuery, [cartItemId]);

      if (cartItemResult.rows.length === 0) {
        throw new NotFoundError("Cart item not found");
      }

      const cartItem = cartItemResult.rows[0];

      // Check if the requested quantity is available in stock
      if (quantity > cartItem.stock_quantity) {
        throw new BadRequestError(`Only ${cartItem.stock_quantity} items available in stock`);
      }

      // Update the cart item quantity
      const updateCartItemQuery = `
        UPDATE cart_items
        SET quantity = $1
        WHERE id = $2
        RETURNING id, cart_id, product_variant_id, quantity, unit_price, added_at
      `;

      await client.query(updateCartItemQuery, [quantity, cartItemId]);

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

      const updatedCartResult = await client.query(updatedCartQuery, [cartItem.cart_id]);

      // Commit the transaction
      await client.query("COMMIT");

      revalidateTag("cart");

      return NextResponse.json(
        {
          message: "Cart item quantity updated successfully",
          data: updatedCartResult.rows[0],
        },
        { status: 200 },
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await client.query("ROLLBACK");
      console.error("Database query error:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    const apiError = handleApiError(error);

    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const searchParams = await params;
    const cartItemId = parseInt(searchParams.id);

    if (isNaN(cartItemId)) {
      throw new BadRequestError("Invalid cart item ID");
    }

    const client = await pool.connect();

    try {
      // Start a transaction
      await client.query("BEGIN");

      // Check if the cart item exists and get the cart_id
      const cartItemQuery = `
        SELECT id, cart_id FROM cart_items WHERE id = $1
      `;

      const cartItemResult = await client.query(cartItemQuery, [cartItemId]);

      if (cartItemResult.rows.length === 0) {
        throw new NotFoundError("Cart item not found");
      }

      const cartId = cartItemResult.rows[0].cart_id;

      // Delete the cart item
      const deleteCartItemQuery = `
        DELETE FROM cart_items WHERE id = $1
      `;

      await client.query(deleteCartItemQuery, [cartItemId]);

      // Get the updated cart with items
      const updatedCartQuery = `
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
        WHERE sc.id = $1
        GROUP BY sc.id, sc.user_id, sc.created_at, sc.updated_at
      `;

      const updatedCartResult = await client.query(updatedCartQuery, [cartId]);

      // Commit the transaction
      await client.query("COMMIT");

      revalidateTag("cart");

      return NextResponse.json(
        {
          message: "Cart item removed successfully",
          data: updatedCartResult.rows[0],
        },
        { status: 200 },
      );
    } catch (error) {
      // Rollback the transaction in case of error
      await client.query("ROLLBACK");
      console.error("Database query error:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error removing cart item:", error);
    const apiError = handleApiError(error);

    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
