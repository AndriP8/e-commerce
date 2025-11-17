import { z } from "zod";

/**
 * Shared validation schemas used across different API routes
 */

// Common patterns
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email format")
  .toLowerCase()
  .trim();

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password must not exceed 100 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must not exceed 100 characters")
  .trim();

export const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format")
  .trim();

export const positiveIntSchema = z
  .number()
  .int("Must be an integer")
  .positive("Must be a positive number");

export const nonNegativeIntSchema = z
  .number()
  .int("Must be an integer")
  .nonnegative("Must be a non-negative number");

// Pagination schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  size: z.number().int().positive().max(100).default(10),
});

// Address schema
export const addressSchema = z.object({
  receiver_name: z.string().min(1, "Receiver name is required").trim(),
  receiver_phone: phoneSchema,
  street_address: z.string().min(1, "Street address is required").trim(),
  city: z.string().min(1, "City is required").trim(),
  state: z.string().min(1, "State is required").trim(),
  postal_code: z.string().min(1, "Postal code is required").trim(),
  country: z.string().min(1, "Country is required").trim(),
});

// Payment enums and schemas
export const paymentMethodEnum = z.enum([
  "credit_card",
  "debit_card",
  "paypal",
  "stripe",
  "bank_transfer",
]);

export const paymentProviderEnum = z.enum([
  "stripe",
  "paypal",
  "square",
  "braintree",
]);

export const paymentStatusEnum = z.enum([
  "pending",
  "processing",
  "completed",
  "failed",
  "refunded",
  "cancelled",
]);

export const orderStatusEnum = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
]);
