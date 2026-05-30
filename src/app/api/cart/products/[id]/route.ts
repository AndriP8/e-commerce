import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import {
  BadRequestError,
  handleApiError,
  NotFoundError,
} from "@/app/utils/api-error-handler";
import { updateCartItemSchema } from "@/schemas/cart";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const searchParams = await params;
    const cartItemId = searchParams.id;

    if (!cartItemId) {
      throw new BadRequestError("Invalid cart item ID");
    }

    const body = await request.json();
    const { quantity } = updateCartItemSchema.parse(body);

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const cartItemResult = await client.query(
        `SELECT ci.id, ci.cart_id, ci.product_variant_id, pv.stock_quantity
         FROM cart_items ci
         JOIN product_variants pv ON ci.product_variant_id = pv.id
         WHERE ci.id = $1`,
        [cartItemId],
      );

      if (cartItemResult.rows.length === 0) {
        throw new NotFoundError("Cart item not found");
      }

      const cartItem = cartItemResult.rows[0];

      if (quantity > cartItem.stock_quantity) {
        throw new BadRequestError(
          `Only ${cartItem.stock_quantity} items available in stock`,
        );
      }

      await client.query("UPDATE cart_items SET quantity = $1 WHERE id = $2", [
        quantity,
        cartItemId,
      ]);

      await client.query("COMMIT");

      revalidateTag("cart");

      return NextResponse.json(
        { message: "Cart item quantity updated successfully" },
        { status: 200 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Database query error:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const searchParams = await params;
    const cartItemId = searchParams.id;

    if (!cartItemId) {
      throw new BadRequestError("Invalid cart item ID");
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const cartItemResult = await client.query(
        "SELECT id, cart_id FROM cart_items WHERE id = $1",
        [cartItemId],
      );

      if (cartItemResult.rows.length === 0) {
        throw new NotFoundError("Cart item not found");
      }

      await client.query("DELETE FROM cart_items WHERE id = $1", [cartItemId]);

      await client.query("COMMIT");

      revalidateTag("cart");

      return NextResponse.json(
        { message: "Cart item removed successfully" },
        { status: 200 },
      );
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Database query error:", error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error removing cart item:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
