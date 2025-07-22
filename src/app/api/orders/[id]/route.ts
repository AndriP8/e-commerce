import { pool } from "@/app/db/client";
import handleApiError, {
  UnauthorizedError,
} from "@/app/utils/api-error-handler";
import { verifyToken } from "@/app/utils/auth-utils";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getPreferenceCurrency } from "@/middleware";
import { convertOrderPrices } from "@/app/utils/server-currency-utils";
import { getUserPreferredCurrency } from "@/app/utils/currency-utils";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const client = await pool.connect();
  const { id: orderId } = await params;
  try {
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
      throw new UnauthorizedError("Invalid authentication token");
    }
    // Get order details
    const orderResult = await client.query(
      `SELECT o.*, p.payment_status, p.payment_method, p.payment_provider, p.transaction_id
       FROM orders o
       LEFT JOIN payments p ON o.id = p.order_id
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId],
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await client.query(
      `SELECT oi.*, p.name as product_name, c.image_url
       FROM order_items oi
       JOIN product_variants pv ON oi.product_variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       JOIN categories c ON p.category_id = c.id
       WHERE oi.order_id = $1`,
      [orderId],
    );

    const items = itemsResult.rows;

    // Get shipment details
    const shipmentResult = await client.query(
      `SELECT * FROM shipments WHERE order_id = $1`,
      [orderId],
    );

    const shipment = shipmentResult.rows[0] || null;
    // Get the user's preferred currency from the request
    const currencyCode = await getPreferenceCurrency();

    // Convert order prices to the user's preferred currency
    let orderData = { order, items };

    if (currencyCode && currencyCode !== "USD") {
      const convertedData = await convertOrderPrices(
        order,
        items,
        currencyCode,
        "USD",
      );
      orderData = {
        order: convertedData.order,
        items: convertedData.items,
      };
    }

    const currency = await getUserPreferredCurrency(userId);

    return NextResponse.json({
      data: {
        ...orderData,
        shipment,
      },
      currency,
    });
  } catch (error) {
    console.error("Login error:", error);
    const apiError = handleApiError(error);

    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
