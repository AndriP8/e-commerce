import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/app/utils/auth-utils";
import { cookies } from "next/headers";
import Stripe from "stripe";
import { validateBody } from "@/app/utils/validation";
import { createPaymentIntentSchema } from "@/app/schemas/checkout";
import { handleApiError, UnauthorizedError } from "@/app/utils/api-error-handler";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      throw new UnauthorizedError("Authentication required");
    }

    try {
      await verifyToken(token);
    } catch {
      throw new UnauthorizedError("Invalid authentication token");
    }

    // Validate request body with Zod schema
    const { amount, currency, metadata } = await validateBody(
      request,
      createPaymentIntentSchema
    );

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: (metadata || {}) as Record<string, string>,
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    const apiError = handleApiError(error);
    return NextResponse.json(
      { error: apiError.message },
      { status: apiError.status },
    );
  }
}
