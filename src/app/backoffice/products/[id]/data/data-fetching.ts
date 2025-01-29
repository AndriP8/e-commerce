import { z } from "zod";

import { CategorySchema } from "@/lib/schema/categories.schema";
import { productSchema } from "@/lib/schema/product.schema";
import { sizeSchema } from "@/lib/schema/sizes.schema";

export type DetailProductResponse = z.infer<
  typeof productSchema.readDetail.response
>;
export async function getProductDetail(
  id: string,
): Promise<DetailProductResponse> {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`,
  );
  if (!result.ok) return result.json();
  return result.json();
}

type SizesResponse = z.infer<typeof sizeSchema.read.response>;
export async function getSizes(): Promise<SizesResponse> {
  const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sizes`);
  if (!result.ok) return result.json();
  return result.json();
}

type CategoriesResponse = z.infer<typeof CategorySchema.read.response>;
export async function getCategories(): Promise<CategoriesResponse> {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`,
  );
  if (!result.ok) return result.json();
  return result.json();
}
