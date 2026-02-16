import { z } from "zod";
import { addressTypeEnumSchema } from "./db-schemas";

/**
 * Common validation patterns used across multiple features
 */

// Phone number validation regex
export const phoneRegex =
  /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;

// Address detail schema (address fields only)
export const addressDetailSchema = z.object({
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State/Province is required"),
  postal_code: z.string().min(1, "Postal code is required"),
  country: z.string().min(1, "Country is required"),
  address_type: addressTypeEnumSchema,
});

// Shipping address schema (receiver info)
export const shippingAddressSchema = z.object({
  receiver_name: z.string().min(1, "Receiver name is required"),
  receiver_phone: z
    .string()
    .min(1, "Receiver phone is required")
    .regex(phoneRegex, "Please enter a valid phone number"),
});

// Combined address schema (receiver + address details)
export const fullAddressSchema = shippingAddressSchema.extend({
  ...addressDetailSchema.shape,
});

/**
 * TypeScript Type Exports
 */
export type AddressDetail = z.infer<typeof addressDetailSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
export type FullAddress = z.infer<typeof fullAddressSchema>;
