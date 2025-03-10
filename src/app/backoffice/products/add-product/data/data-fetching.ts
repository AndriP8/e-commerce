import { z } from "zod";

import { CategorySchema } from "@/lib/schema/categories.schema";
import { sizeSchema } from "@/lib/schema/sizes.schema";

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
