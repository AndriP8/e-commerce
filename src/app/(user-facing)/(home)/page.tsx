import { cookies } from "next/headers";
import { ProductsResponse } from "../../types/product-types";
import ProductList from "./components/ProductList";
import { Metadata } from "next";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const { search } = await searchParams;

  // Create canonical URL - if search param exists, don't include it in canonical
  const canonicalUrl = baseUrl;

  return {
    title: search
      ? `Search results for "${search}" | E-Commerce Store`
      : "E-Commerce Store - Fast & Reliable Shopping",
    description: search
      ? `Browse our products matching "${search}" - High-performance e-commerce platform`
      : "High-performance e-commerce platform with optimized loading times and excellent user experience",
    keywords: search
      ? `${search}, search results, e-commerce, shopping`
      : "e-commerce, shopping, fast loading, performance",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

async function getProducts({
  search,
  cookieCurrency,
}: {
  search?: string | string[] | undefined;
  cookieCurrency?: string | undefined;
}): Promise<ProductsResponse> {
  const baseUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`);
  baseUrl.searchParams.set("in_stock", "true");
  if (search && typeof search === "string") {
    baseUrl.searchParams.set("search", search);
  }

  const response = await fetch(baseUrl, {
    headers: {
      Cookie: `preferred_currency=${cookieCurrency}`,
    },
    next: { revalidate: 60 * 5 }, // 5 minutes
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

  // Preload critical images for LCP optimization
  const criticalProducts = products.data?.slice(0, 4) || [];

  return (
    <>
      {/* Preload critical product images */}
      {criticalProducts.map((product) => (
        <link
          key={`preload-${product.id}`}
          rel="preload"
          as="image"
          href={`${process.env.NEXT_PUBLIC_CDN_URL}/${product.category?.image_url}`}
          imageSizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ))}

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8 text-gray-900">Our Products</h1>
        <ProductList products={products} />
      </main>
    </>
  );
}
