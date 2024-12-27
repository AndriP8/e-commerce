import { z } from "zod";

import { productSchema } from "@/lib/schema/product.schema";

export const addProductSchema = productSchema.create.body;
export type AddProductSchema = z.infer<typeof addProductSchema>;
