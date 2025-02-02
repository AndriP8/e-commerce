import { z } from "zod";

import { productSchema } from "@/lib/schema/product.schema";

type DeleteProductResponse = z.infer<typeof productSchema.delete.response>;

export async function deleteProduct(id: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${id}`,
    {
      method: "DELETE",
    },
  );
  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error);
  }
  const data = await response.json();
  return data as DeleteProductResponse;
}
