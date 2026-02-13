import { z } from "zod";

/**
 * Authentication Schemas
 * Used by both login/register pages and API routes
 */

// Login schema
export const loginSchema = z.strictObject({
  email: z.email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Registration schema
export const registerSchema = z.strictObject({
  email: z.email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

// Registration with password confirmation (frontend only)
export const registerWithConfirmSchema = registerSchema
  .extend({
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/**
 * TypeScript Type Exports
 */
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type RegisterWithConfirmInput = z.infer<typeof registerWithConfirmSchema>;
