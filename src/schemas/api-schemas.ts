import { z } from "zod";
import { paymentStatusEnumSchema } from "./db-schemas";

/**
 * Auth Schemas
 */
export const loginSchema = z.strictObject({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const registerSchema = z.strictObject({
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

/**
 * Cart Schemas
 */
export const addToCartSchema = z.strictObject({
  product_id: z.string().min(1, "Valid product_id is required"),
  quantity: z.coerce
    .number()
    .refine((val) => !isNaN(val) && val >= 1, "Valid quantity is required (minimum 1)"),
});

export const updateCartItemSchema = z.strictObject({
  quantity: z.number().int().positive("Quantity must be a positive number"),
});

/**
 * Checkout Schemas
 */
export const createOrderSchema = z.strictObject({
  cart_id: z.string().min(1, "Valid cart_id is required"),
  address_detail: z.looseObject({
    address_line1: z.string(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
  }),
  shipping_detail: z.looseObject({
    shipping_method_id: z.string().min(1, "Valid shipping_method_id is required"),
    estimated_delivery: z.string().or(z.date()),
  }),
  shipping_address: z.looseObject({
    receiver_name: z.string().min(1, "Receiver name is required"),
    receiver_phone: z.string().min(1, "Receiver phone is required"),
  }),
  payment_detail: z.looseObject({
    payment_method: z.string(),
    payment_provider: z.string(),
  }),
});

export const paymentIntentSchema = z.strictObject({
  cart_id: z.string().min(1, "Valid cart_id is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(3).max(3),
});

export const updatePaymentSchema = z.strictObject({
  transaction_id: z.string().min(1, "Transaction ID is required"),
  payment_status: paymentStatusEnumSchema,
});

/**
 * User Preference Schemas
 */
export const currencyPreferenceSchema = z.strictObject({
  currencyCode: z.string().min(3).max(3),
});
