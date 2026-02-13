import { cookies } from "next/headers";
import { ProductsResponse } from "@/app/types/product-types";
import ProductList from "./home-components/ProductList";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const revalidate = 300; // 5 minutes

const DEFAULT_PAGE_SIZE = 12;

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Home" });
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const { search } = await searchParams;
  const searchQuery = typeof search === "string" ? search : "";

  // Create canonical URL - if search param exists, don't include it in canonical
  const canonicalUrl = baseUrl;

  return {
    title: searchQuery
      ? `${t("search.results", { query: searchQuery })} | ${t("metadata.title")}`
      : t("metadata.title"),
    description: searchQuery
      ? `${t("search.results", { query: searchQuery })} - ${t("metadata.description")}`
      : t("metadata.description"),
    keywords: searchQuery
      ? `${searchQuery}, search results, e-commerce, shopping`
      : "e-commerce, shopping, fast loading, performance",
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

async function getProducts({
  search,
  page,
  cookieCurrency,
}: {
  search?: string | string[] | undefined;
  page?: number;
  cookieCurrency?: string | undefined;
}): Promise<ProductsResponse> {
  const baseUrl = new URL(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products`);
  baseUrl.searchParams.set("in_stock", "true");
  baseUrl.searchParams.set("size", DEFAULT_PAGE_SIZE.toString());
  if (page && page > 1) {
    baseUrl.searchParams.set("page", page.toString());
  }
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

export default async function Page({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const cookieStore = await cookies();
  const cookieCurrency = cookieStore.get("preferred_currency")?.value || "";
  const resolvedSearchParams = await searchParams;

  // Parse page number from query params
  const pageParam = resolvedSearchParams.page;
  const currentPage = typeof pageParam === "string" ? Math.max(1, parseInt(pageParam, 10) || 1) : 1;

  const products = await getProducts({
    search: resolvedSearchParams.search,
    page: currentPage,
    cookieCurrency,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <ProductList
        products={products}
        searchParams={{
          search:
            typeof resolvedSearchParams.search === "string"
              ? resolvedSearchParams.search
              : undefined,
        }}
        locale={locale}
      />
    </div>
  );
}
