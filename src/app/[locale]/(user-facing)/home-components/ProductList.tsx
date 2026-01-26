import Link from "next/link";
import { ProductsResponse } from "@/app/types/product-types";
import ProductCart from "./ProductCart";
import { Frown, ShoppingCart } from "lucide-react";
import SearchBox from "./SearchBox";
import { getTranslations } from "next-intl/server";
import Pagination from "./Pagination";

export default async function ProductList({
  products,
  searchParams,
  locale,
}: {
  products: ProductsResponse;
  searchParams?: { search?: string };
  locale: string;
}) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const searchQuery = searchParams?.search || "";
  const { pagination } = products;

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <SearchBox defaultValue={searchQuery} />
        <Link href="/cart" className="flex items-center gap-2">
          <ShoppingCart className="size-6" />
          <span>{t("cart")}</span>
        </Link>
      </header>
      <div>
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {searchQuery ? t("searchResults", { query: searchQuery }) : t("featuredProducts")}
        </h2>
        {products.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Frown className="size-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">{t("noProductsFound")}</h3>
            <p className="text-gray-500">{t("tryAdjusting")}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.data.map((product, index) => (
                <ProductCart
                  key={product.id}
                  product={product}
                  currency={products.currency}
                  priority={index < 4} // Only first 4 products get priority
                />
              ))}
            </div>
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.total_pages}
              totalItems={pagination.total}
              pageSize={pagination.size}
              searchQuery={searchQuery}
            />
          </>
        )}
      </div>
    </div>
  );
}
