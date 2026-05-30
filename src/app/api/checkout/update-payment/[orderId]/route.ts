import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/app/db/client";
import { handleApiError } from "@/app/utils/api-error-handler";
import { verifyToken } from "@/app/utils/auth-utils";

// Only accepts a transaction_id to associate the Stripe PaymentIntent with this order.
// Actual payment status transitions are handled by the Stripe webhook.
const linkPaymentSchema = z.strictObject({
  transaction_id: z.string().min(1, "Transaction ID is required"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const client = await pool.connect();
  try {
    const body = await request.json();
    const { transaction_id } = linkPaymentSchema.parse(body);
    const { orderId } = await params;

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    let userId: string;
    try {
      const decoded = await verifyToken(token);
      userId = decoded.userId.toString();
    } catch {
      return NextResponse.json(
        { error: "Invalid authentication token" },
        { status: 401 },
      );
    }

    await client.query("BEGIN");

    // Verify ownership, only update if still pending, and transaction_id not yet set.
    // Prevents overwriting a transaction_id after it's been linked (guards against
    // a client swapping the PI id after the webhook fires on the original one).
    const result = await client.query(
      `UPDATE payments
       SET transaction_id = $1, payment_status = 'completed'
       WHERE order_id = $2
         AND payment_status = 'pending'
         AND transaction_id IS NULL
         AND order_id IN (SELECT id FROM orders WHERE id = $2 AND user_id = $3)
       RETURNING order_id`,
      [transaction_id, orderId, userId],
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        {
          error:
            "Order not found, not owned by user, or payment already processed",
        },
        { status: 404 },
      );
    }

    await client.query(
      `UPDATE orders SET order_status = 'confirmed'
       WHERE id = $1 AND order_status = 'pending'`,
      [orderId],
    );

    await client.query("COMMIT");

    return NextResponse.json({ success: true, order_id: orderId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error linking payment:", error);
    const apiError = handleApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  } finally {
    client.release();
  }
}
