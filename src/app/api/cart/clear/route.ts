import { NextResponse } from "next/server";
import { pool } from "@/app/db/client";
import {
  handleApiError,
  UnauthorizedError,
} from "@/app/utils/api-error-handler";
import { verifyToken } from "@/app/utils/auth-utils";
import { cookies } from "next/headers";

/**
 * DELETE /api/cart/clear
 *
 * Clears all items from the user's shopping cart
 *
 * @returns JSON response with success message
 */
export async function DELETE(request: Request) {
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
      // Start a transaction
      await client.query("BEGIN");

      // Find the user's shopping cart
      const cartQuery = `
        SELECT id FROM shopping_carts 
        WHERE user_id = $1
      `;

      const cartResult = await client.query(cartQuery, [user_id]);

      if (cartResult.rows.length === 0) {
        // No cart found, return success (nothing to clear)
        return NextResponse.json(
          {
            success: true,
            message: "Cart is already empty",
          },
          { status: 200 },
        );
      }

      const cart_id = cartResult.rows[0].id;

      // Delete all cart items for this cart
      const deleteCartItemsQuery = `
        DELETE FROM cart_items
        WHERE cart_id = $1
      `;

      await client.query(deleteCartItemsQuery, [cart_id]);

      // Update the cart's updated_at timestamp
      await client.query(
        "UPDATE shopping_carts SET updated_at = CURRENT_TIMESTAMP WHERE id = $1",
        [cart_id],
      );

      // Commit the transaction
      await client.query("COMMIT");

      return NextResponse.json(
        {
          success: true,
          message: "Cart cleared successfully",
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
    console.error("Error clearing cart:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}