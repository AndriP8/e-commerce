import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { handleApiError } from "@/app/utils/api-error-handler";

function getStripeInstance() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  return new Stripe(secretKey);
}

import { paymentIntentSchema } from "@/schemas/api-schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input parameters using Zod
    const { cart_id, amount, currency } = paymentIntentSchema.parse(body);

    // Create a PaymentIntent with the order amount and currency
    const stripe = getStripeInstance();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        cart_id,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    const apiError = handleApiError(error);
    return NextResponse.json({ error: apiError.message }, { status: apiError.status });
  }
}
