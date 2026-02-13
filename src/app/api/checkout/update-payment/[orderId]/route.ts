import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth-utils";
import { cookies } from "next/headers";
import { pool } from "@/app/db/client";
import { handleApiError } from "@/app/utils/api-error-handler";

import { updatePaymentSchema } from "@/schemas/api-schemas";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const client = await pool.connect();
  try {
    const body = await request.json();

    // Validate input parameters using Zod
    const { transaction_id, payment_status } = updatePaymentSchema.parse(body);

    const { orderId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    let userId: string;
    try {
      const decoded = await verifyToken(token);
      userId = decoded.userId.toString();
    } catch {
      return NextResponse.json({ error: "Invalid authentication token" }, { status: 401 });
    }

    // Start a transaction
    await client.query("BEGIN");

    // Verify the order belongs to the user
    const orderResult = await client.query("SELECT * FROM orders WHERE id = $1 AND user_id = $2", [
      orderId,
      userId,
    ]);

    if (orderResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Order not found or does not belong to the user" },
        { status: 404 },
      );
    }

    // Update payment record
    await client.query(
      `UPDATE payments 
       SET transaction_id = $1, payment_status = $2 
       WHERE order_id = $3`,
      [transaction_id, payment_status, orderId],
    );

    // If payment is completed, update order status to confirmed
    if (payment_status === "completed") {
      await client.query(`UPDATE orders SET order_status = 'confirmed' WHERE id = $1`, [orderId]);

      // Update order items status
      await client.query(`UPDATE order_items SET item_status = 'confirmed' WHERE order_id = $1`, [
        orderId,
      ]);
    } else if (payment_status === "failed") {
      // If payment failed, update order status to cancelled
      await client.query(`UPDATE orders SET order_status = 'cancelled' WHERE id = $1`, [orderId]);

      // Update order items status
      await client.query(`UPDATE order_items SET item_status = 'cancelled' WHERE order_id = $1`, [
        orderId,
      ]);
    }

    // Commit the transaction
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      order_id: orderId,
      payment_status,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await client.query("ROLLBACK");
    console.error("Error updating payment:", error);
    const apiError = handleApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  } finally {
    client.release();
  }
}
