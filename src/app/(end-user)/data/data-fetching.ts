import { z } from "zod";

import { publicProductSchema } from "@/lib/schema/public/product.schema";

export type FeaturedProductsResponse = Omit<
  z.infer<typeof publicProductSchema.read.response>,
  "pagination"
>;

export async function getFeaturedProducts(): Promise<FeaturedProductsResponse> {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/public/products/featured`,
  );
  return result.json();
}
