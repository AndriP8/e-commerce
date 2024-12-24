import { z } from "zod";

import { productSchema } from "@/lib/schema/product.schema";

type DeleteProductResponse = z.infer<typeof productSchema.delete.response>;

export async function deleteProduct(id: string) {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`,
    {
      method: "DELETE",
    },
  );
  if (!result.ok) return result.json();
  const data = await result.json();
  return data as DeleteProductResponse;
}
