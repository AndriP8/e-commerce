import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { pool } from "@/app/db/client";
import {
  handleApiError,
  UnauthorizedError,
} from "@/app/utils/api-error-handler";
import { verifyToken } from "@/app/utils/auth-utils";
import { getPreferenceCurrency } from "@/middleware";

const paymentIntentSchema = z.strictObject({
  cart_id: z.string().min(1, "Valid cart_id is required"),
});

function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey);
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    const decoded = await verifyToken(token);
    const userId = decoded.userId;

    const body = await request.json();
    const { cart_id } = paymentIntentSchema.parse(body);

    const client = await pool.connect();
    try {
      // Verify the cart belongs to this user and compute total server-side
      const cartResult = await client.query(
        `SELECT sc.id, COALESCE(SUM(ci.quantity * ci.unit_price), 0) as total
         FROM shopping_carts sc
         JOIN cart_items ci ON sc.id = ci.cart_id
         WHERE sc.id = $1 AND sc.user_id = $2
         GROUP BY sc.id`,
        [cart_id, userId],
      );

      if (cartResult.rows.length === 0) {
        return NextResponse.json(
          { error: "Cart not found or does not belong to user" },
          { status: 404 },
        );
      }

      const amount = Number.parseFloat(cartResult.rows[0].total);

      if (amount <= 0) {
        return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
      }

      const currency = await getPreferenceCurrency();

      const stripe = getStripeInstance();
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          cart_id,
          user_id: String(userId),
        },
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating payment intent:", error);
    const apiError = handleApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
