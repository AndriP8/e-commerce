import { z } from "zod";

import { CategorySchema } from "@/lib/schema/categories.schema";
import { productSchema } from "@/lib/schema/product.schema";
import { sizeSchema } from "@/lib/schema/sizes.schema";

export type DetailProductResponse = z.infer<
  typeof productSchema.readDetail.response
>;
export async function getProductDetail({
  session,
  id,
}: {
  session: string;
  id: string;
}): Promise<DetailProductResponse> {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`,
    {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    },
  );
  if (!result.ok) return result.json();
  return result.json();
}

type SizesResponse = z.infer<typeof sizeSchema.read.response>;
export async function getSizes(session: string): Promise<SizesResponse> {
  const result = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/sizes`, {
    headers: {
      Authorization: `Bearer ${session}`,
    },
  });
  if (!result.ok) return result.json();
  return result.json();
}

type CategoriesResponse = z.infer<typeof CategorySchema.read.response>;
export async function getCategories(
  session: string,
): Promise<CategoriesResponse> {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/categories`,
    {
      headers: {
        Authorization: `Bearer ${session}`,
      },
    },
  );
  if (!result.ok) return result.json();
  return result.json();
}
