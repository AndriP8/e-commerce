import { z } from "zod";

import { productSchema } from "@/lib/schema/product.schema";

type DeleteProductResponse = z.infer<typeof productSchema.delete.response>;
type DeleteProductArgs = {
  params: string;
  session: string;
};

export async function deleteProduct({ params, session }: DeleteProductArgs) {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${params}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session}`,
      },
    },
  );
  if (!result.ok) return result.json();
  const data = await result.json();
  return data as DeleteProductResponse;
}
