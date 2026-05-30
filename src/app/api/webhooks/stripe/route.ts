import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { pool } from "@/app/db/client";

export const runtime = "nodejs";

function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) throw new Error("STRIPE_SECRET_KEY is not configured");
  return new Stripe(secretKey);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 },
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Missing stripe-signature header" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object as Stripe.PaymentIntent;
      const cartId = intent.metadata.cart_id;

      if (!cartId) {
        await client.query("ROLLBACK");
        return NextResponse.json({ received: true });
      }

      // Find the pending order for this cart (created by create-order, still pending payment)
      const orderResult = await client.query(
        `SELECT o.id FROM orders o
         JOIN payments p ON p.order_id = o.id
         WHERE o.id = (
           SELECT o2.id FROM orders o2
           JOIN payments p2 ON p2.order_id = o2.id
           WHERE p2.payment_status = 'pending'
             AND p2.transaction_id IS NULL
             AND o2.order_status = 'pending'
           ORDER BY o2.order_date DESC
           LIMIT 1
         )`,
        [],
      );

      // Prefer matching by payment_intent id stored in transaction_id if already set,
      // otherwise match the most recent pending order for the user
      const intentResult = await client.query(
        `SELECT o.id as order_id FROM payments p
         JOIN orders o ON p.order_id = o.id
         WHERE p.transaction_id = $1
           AND p.payment_status = 'pending'
         LIMIT 1`,
        [intent.id],
      );

      const targetOrderId =
        intentResult.rows[0]?.order_id ?? orderResult.rows[0]?.id;

      if (targetOrderId) {
        await client.query(
          `UPDATE payments SET payment_status = 'completed', transaction_id = $1
           WHERE order_id = $2 AND payment_status = 'pending'`,
          [intent.id, targetOrderId],
        );

        await client.query(
          `UPDATE orders SET order_status = 'confirmed' WHERE id = $1 AND order_status = 'pending'`,
          [targetOrderId],
        );

        await client.query(
          `UPDATE order_items SET item_status = 'confirmed' WHERE order_id = $1 AND item_status = 'pending'`,
          [targetOrderId],
        );
      }
    } else if (event.type === "payment_intent.payment_failed") {
      const intent = event.data.object as Stripe.PaymentIntent;

      const intentResult = await client.query(
        `SELECT o.id as order_id FROM payments p
         JOIN orders o ON p.order_id = o.id
         WHERE p.transaction_id = $1
           AND p.payment_status = 'pending'
         LIMIT 1`,
        [intent.id],
      );

      if (intentResult.rows.length > 0) {
        const orderId = intentResult.rows[0].order_id;

        await client.query(
          `UPDATE payments SET payment_status = 'failed' WHERE order_id = $1 AND payment_status = 'pending'`,
          [orderId],
        );

        await client.query(
          `UPDATE orders SET order_status = 'cancelled' WHERE id = $1 AND order_status = 'pending'`,
          [orderId],
        );

        await client.query(
          `UPDATE order_items SET item_status = 'cancelled' WHERE order_id = $1 AND item_status = 'pending'`,
          [orderId],
        );

        // Restore stock for cancelled order
        await client.query(
          `UPDATE product_variants pv
           SET stock_quantity = stock_quantity + oi.quantity
           FROM order_items oi
           WHERE oi.order_id = $1 AND oi.product_variant_id = pv.id`,
          [orderId],
        );
      }
    }

    await client.query("COMMIT");
    return NextResponse.json({ received: true });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
