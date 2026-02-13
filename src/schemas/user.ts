import { z } from "zod";

/**
 * User Preference Schemas
 * Used by user preference pages and API routes
 */

// Currency preference schema
export const currencyPreferenceSchema = z.strictObject({
  currencyCode: z.string().min(3).max(3),
});

/**
 * TypeScript Type Exports
 */
export type CurrencyPreferenceInput = z.infer<typeof currencyPreferenceSchema>;
