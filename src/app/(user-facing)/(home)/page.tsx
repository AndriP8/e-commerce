import { ProductsResponse } from "../../types/product-types";
import ProductList from "./components/ProductList";

async function getProducts({
  search,
}: {
  search?: string | string[] | undefined;
}): Promise<ProductsResponse> {
  const url = new URL("http://localhost:3001/api/products?in_stock=true");
  if (search && typeof search === "string") {
    url.searchParams.set("search", search);
  }
  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  console.log(params);
  const products = await getProducts({ search: params.search });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Our Products</h1>
      <ProductList products={products} />
    </main>
  );
}
