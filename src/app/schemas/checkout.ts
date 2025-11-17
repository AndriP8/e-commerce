import { z } from "zod";
import {
  addressSchema,
  paymentMethodEnum,
  paymentProviderEnum,
  paymentStatusEnum,
} from "./shared";

/**
 * Checkout validation schemas
 */

// Shipping detail schema
export const shippingDetailSchema = z.object({
  shipping_method_id: z.number().int().positive("Shipping method ID is required"),
  estimated_delivery: z.string().min(1, "Estimated delivery is required"),
  tracking_number: z.string().optional(),
  carrier: z.string().optional(),
});

// Payment detail schema
export const paymentDetailSchema = z.object({
  payment_method: paymentMethodEnum,
  payment_provider: paymentProviderEnum,
  transaction_id: z.string().optional(),
  payment_status: paymentStatusEnum.default("pending"),
  amount: z.number().positive("Payment amount must be positive").optional(),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("USD"),
});

// Address detail schema for checkout (extends base address)
export const addressDetailSchema = z.object({
  address_type: z.enum(["shipping", "billing"]).default("shipping"),
  is_default: z.boolean().default(false),
  label: z.string().max(50).optional(), // e.g., "Home", "Office"
});

// Create order schema
export const createOrderSchema = z.object({
  cart_id: z.number().int().positive("Cart ID is required"),
  address_detail: addressDetailSchema.optional(),
  shipping_detail: shippingDetailSchema,
  shipping_address: addressSchema,
  payment_detail: paymentDetailSchema,
  billing_address: addressSchema.optional(),
  notes: z.string().max(500).optional(),
});

// Payment intent schema
export const createPaymentIntentSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().length(3, "Currency must be a 3-letter code").default("USD"),
  payment_method: paymentMethodEnum.optional(),
  order_id: z.number().int().positive().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

// Update payment status schema
export const updatePaymentStatusSchema = z.object({
  payment_status: paymentStatusEnum,
  transaction_id: z.string().optional(),
  payment_intent_id: z.string().optional(),
});

// Order ID parameter schema
export const orderIdSchema = z.object({
  orderId: z.coerce.number().int().positive("Order ID must be a positive integer"),
});

// Type exports for TypeScript
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreatePaymentIntentInput = z.infer<typeof createPaymentIntentSchema>;
export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
export type OrderIdParam = z.infer<typeof orderIdSchema>;
