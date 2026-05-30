import { z } from "zod";
import { fullAddressSchema } from "./common";

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
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
