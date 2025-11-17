import { z } from "zod";

/**
 * Cart validation schemas
 */

// Add product to cart schema
export const addToCartSchema = z.object({
  product_id: z.number().int().positive("Product ID must be a positive integer"),
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1")
    .max(999, "Quantity cannot exceed 999"),
});

// Update cart item quantity schema
export const updateCartQuantitySchema = z.object({
  quantity: z
    .number()
    .int("Quantity must be an integer")
    .positive("Quantity must be at least 1")
    .max(999, "Quantity cannot exceed 999"),
});

// Cart item ID parameter schema
export const cartItemIdSchema = z.object({
  id: z.coerce.number().int().positive("Cart item ID must be a positive integer"),
});

// Type exports for TypeScript
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
export type CartItemIdParam = z.infer<typeof cartItemIdSchema>;
