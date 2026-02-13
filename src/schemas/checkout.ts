import { z } from "zod";
import { fullAddressSchema } from "./common";
import { paymentStatusEnumSchema } from "./db-schemas";

/**
 * Checkout Schemas
 * Used by both checkout pages and API routes
 */

// Shipping detail schema
export const shippingDetailSchema = z.object({
  shipping_method_id: z.string().min(1, "Please select a shipping method"),
  estimated_delivery: z.string().or(z.date()),
});

// Checkout form schema (frontend multi-step form)
export const checkoutFormSchema = z.object({
  addressDetail: fullAddressSchema,
  shippingDetail: shippingDetailSchema,
  useSameForBilling: z.boolean(),
  billingAddress: fullAddressSchema,
});

// Payment intent schema
export const paymentIntentSchema = z.strictObject({
  cart_id: z.string().min(1, "Valid cart_id is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(3).max(3),
});

// Update payment schema
export const updatePaymentSchema = z.strictObject({
  transaction_id: z.string().min(1, "Transaction ID is required"),
  payment_status: paymentStatusEnumSchema,
});

// Create order schema (backend API)
export const createOrderSchema = z.strictObject({
  cart_id: z.string().min(1, "Valid cart_id is required"),
  address_detail: fullAddressSchema,
  shipping_detail: shippingDetailSchema,
  shipping_address: fullAddressSchema,
  payment_detail: z.looseObject({
    payment_method: z.string(),
    payment_provider: z.string(),
  }),
});

/**
 * TypeScript Type Exports
 */
export type ShippingDetail = z.infer<typeof shippingDetailSchema>;
export type CheckoutFormInput = z.infer<typeof checkoutFormSchema>;
export type PaymentIntentInput = z.infer<typeof paymentIntentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
