import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import type { PoolClient } from "pg";
import { pool } from "@/app/db/client";
import { handleApiError } from "@/app/utils/api-error-handler";
import { verifyToken } from "@/app/utils/auth-utils";
import { calculateTax } from "@/app/utils/tax-utils";
import { createOrderSchema } from "@/schemas/checkout";

export async function POST(request: NextRequest) {
  let client: PoolClient | undefined;
  try {
    const body = await request.json();

    // Validate input parameters using Zod
    const {
      cart_id,
      address_detail,
      shipping_detail,
      shipping_address,
      payment_detail,
    } = createOrderSchema.parse(body);

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

    client = await pool.connect();

    // Start a transaction
    await client.query("BEGIN");

    // Get cart items
    const cartResult = await client.query(
      `SELECT ci.*, p.seller_id, p.name as product_name, pv.price as unit_price
       FROM cart_items ci
       JOIN product_variants pv ON ci.product_variant_id = pv.id
       JOIN products p ON pv.product_id = p.id
       WHERE ci.cart_id = $1`,
      [cart_id],
    );

    const cartItems = cartResult.rows;

    if (cartItems.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    // Calculate order totals
    const subtotal = cartItems.reduce(
      (sum: number, item: { unit_price: string; quantity: number }) =>
        sum + Number.parseFloat(item.unit_price) * item.quantity,
      0,
    );

    // Get shipping method details
    const shippingMethodResult = await client.query(
      "SELECT * FROM shipping_methods WHERE id = $1",
      [shipping_detail.shipping_method_id],
    );

    if (shippingMethodResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json(
        { error: "Invalid shipping method" },
        { status: 400 },
      );
    }

    const shippingMethod = shippingMethodResult.rows[0];
    const shippingAmount = parseFloat(shippingMethod.base_costs);

    // Calculate tax amount based on subtotal
    const taxAmount = calculateTax(subtotal);

    const discountAmount = 0; // No discount for now

    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;

    // Generate a unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the order
    const orderResult = await client.query(
      `INSERT INTO orders (
        id, user_id, order_number, subtotal, tax_amount, shipping_amount, 
        discount_amount, total_amount, order_status, order_date, 
        estimated_delivery, shipping_address, billing_address
      ) VALUES (nextval('orders_id_seq'), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id`,
      [
        userId,
        orderNumber,
        subtotal,
        taxAmount,
        shippingAmount,
        discountAmount,
        totalAmount,
        "pending", // Initial order status
        new Date(), // Order date
        shipping_detail.estimated_delivery, // Estimated delivery date
        JSON.stringify(shipping_address),
        JSON.stringify(address_detail),
      ],
    );

    const orderId = orderResult.rows[0].id;

    // Create order items and decrement inventory
    for (const item of cartItems) {
      const inventoryResult = await client.query(
        `UPDATE product_variants
         SET stock_quantity = stock_quantity - $1
         WHERE id = $2 AND stock_quantity >= $1
         RETURNING stock_quantity`,
        [item.quantity, item.product_variant_id],
      );

      if (inventoryResult.rows.length === 0) {
        await client.query("ROLLBACK");
        return NextResponse.json(
          {
            error: "Insufficient stock",
            product_variant_id: item.product_variant_id,
            product_name: item.product_name,
          },
          { status: 400 },
        );
      }

      await client.query(
        `INSERT INTO order_items (
          id, order_id, product_variant_id, seller_id, quantity,
          unit_price, total_price, item_status
        ) VALUES (nextval('order_items_id_seq'),$1, $2, $3, $4, $5, $6, $7)`,
        [
          orderId,
          item.product_variant_id,
          item.seller_id,
          item.quantity,
          item.unit_price,
          parseFloat(item.unit_price) * item.quantity,
          "pending", // Initial item status
        ],
      );
    }

    // Create payment record (initially pending)
    await client.query(
      `INSERT INTO payments (
        id, order_id, user_id, amount, payment_method, 
        payment_provider, payment_status, payment_date
      ) VALUES (nextval('payment_id_seq'), $1, $2, $3, $4, $5, $6, $7)`,
      [
        orderId,
        userId,
        totalAmount,
        payment_detail.payment_method,
        payment_detail.payment_provider,
        "pending", // Initial payment status
        new Date(), // Payment date
      ],
    );

    // Dummy shipping_date
    const currentDate = new Date();
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    const shipping_date = nextDay;

    // Dummy tracking details
    const tracking_details = {
      status: "pending",
      location: "Warehouse",
      last_update: new Date().toISOString(),
      estimated_arrival: shipping_detail.estimated_delivery,
      tracking_events: [
        {
          timestamp: new Date().toISOString(),
          status: "Order Received",
          location: "Warehouse",
          description: "Order has been received and is being processed",
        },
      ],
    };

    // Create shipment record
    await client.query(
      `INSERT INTO shipments (
        id, order_id, shipment_status, carrier, shipping_date, tracking_details
      ) VALUES (nextval('shipments_id_seq'), $1, $2, $3, $4, $5)`,
      [
        orderId,
        "pending", // Initial shipment status
        shippingMethod.name,
        shipping_date,
        tracking_details,
      ],
    );

    // Commit the transaction
    await client.query("COMMIT");

    return NextResponse.json({
      success: true,
      order_id: orderId,
      order_number: orderNumber,
    });
  } catch (error) {
    // Rollback the transaction in case of error
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Error rolling back transaction:", rollbackError);
      }
    }
    console.error("Error creating order:", error);
    const apiError = handleApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  } finally {
    if (client) {
      client.release();
    }
  }
}
