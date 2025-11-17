import { z } from "zod";
import { paginationSchema } from "./shared";

/**
 * Product validation schemas
 */

// Valid sort columns
const sortByEnum = z.enum(["created_at", "name", "base_price", "product_rating"]);
const sortOrderEnum = z.enum(["asc", "desc"]);

// Product filters schema
export const productFiltersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  size: z.coerce.number().int().positive().max(100).default(10),
  category_id: z.coerce.number().int().positive().optional(),
  seller_id: z.coerce.number().int().positive().optional(),
  min_price: z.coerce.number().nonnegative().optional(),
  max_price: z.coerce.number().nonnegative().optional(),
  brand: z.string().min(1).max(100).trim().optional(),
  search: z.string().min(1).max(200).trim().optional(),
  in_stock: z
    .string()
    .toLowerCase()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  sort_by: sortByEnum.default("created_at"),
  sort_order: sortOrderEnum.default("desc"),
});

// Refine to ensure min_price <= max_price
export const productFiltersSchemaRefined = productFiltersSchema.refine(
  (data) => {
    if (data.min_price !== undefined && data.max_price !== undefined) {
      return data.min_price <= data.max_price;
    }
    return true;
  },
  {
    message: "min_price must be less than or equal to max_price",
    path: ["min_price"],
  }
);

// Product ID parameter schema
export const productIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

// Type exports for TypeScript
export type ProductFilters = z.infer<typeof productFiltersSchemaRefined>;
export type ProductIdParam = z.infer<typeof productIdSchema>;
