import { z } from "zod";

import { productSchema } from "@/lib/schema/product.schema";

export type Product = z.infer<typeof productSchema.read.response>;
type ProductQuery = z.infer<typeof productSchema.read.query>;
type FetchProductsArgs = ProductQuery;

export async function getProducts({
  page,
  size,
  search,
}: FetchProductsArgs): Promise<Product> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (search) params.append("search", search);

  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products?${params.toString()}`,
  );
  if (!result.ok) return result.json();
  const data = await result.json();
  return data as Product;
}
