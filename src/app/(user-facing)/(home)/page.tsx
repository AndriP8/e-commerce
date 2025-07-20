import { cookies } from "next/headers";
import { ProductsResponse } from "../../types/product-types";
import ProductList from "./components/ProductList";

async function getProducts({
  search,
  cookieCurrency,
}: {
  search?: string | string[] | undefined;
  cookieCurrency?: string | undefined;
}): Promise<ProductsResponse> {
  const baseUrl = new URL("http://localhost:3001/api/products");
  baseUrl.searchParams.set("in_stock", "true");
  if (search && typeof search === "string") {
    baseUrl.searchParams.set("search", search);
  }

  const response = await fetch(baseUrl, {
    headers: {
      Cookie: `preferred_currency=${cookieCurrency}`,
    },
  });

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
  const cookieStore = await cookies();
  const cookieCurrency = cookieStore.get("preferred_currency")?.value || "";
  const params = await searchParams;
  const products = await getProducts({ search: params.search, cookieCurrency });

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Our Products</h1>
      <ProductList products={products} />
    </main>
  );
}
