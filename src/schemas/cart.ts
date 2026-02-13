import { z } from "zod";

/**
 * Cart Schemas
 * Used by both cart pages and API routes
 */

// Add to cart schema
export const addToCartSchema = z.strictObject({
  product_id: z.string().min(1, "Valid product_id is required"),
  quantity: z.coerce
    .number()
    .refine((val) => !isNaN(val) && val >= 1, "Valid quantity is required (minimum 1)"),
});

// Update cart item schema
export const updateCartItemSchema = z.strictObject({
  quantity: z.number().int().positive("Quantity must be a positive number"),
});

/**
 * TypeScript Type Exports
 */
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
