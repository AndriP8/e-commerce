import { z } from "zod";

import { productSchema } from "@/lib/schema/product.schema";

export const editProductSchema = productSchema.update.body;
export type EditProductSchema = z.infer<typeof editProductSchema>;
