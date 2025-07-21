"use client";

import Link from "next/link";
import { ProductsResponse } from "@/app/types/product-types";
import { useQueryState } from "nuqs";
import ProductCart from "./ProductCart";
import { debounce } from "@/app/utils/debounce";
import { Suspense } from "react";
import { ProductListSkeleton } from "@/app/components/Skeleton";
import { Frown, ShoppingCart } from "lucide-react";

export default function ProductList({
  products,
}: {
  products: ProductsResponse;
}) {
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
  });

  const handleSearch = debounce((query: string) => {
    setSearchQuery(query);
  }, 300);

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <div className="relative w-1/2">
          <input
            type="text"
            placeholder="Search products..."
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Link href="/cart" className="flex items-center gap-2">
          <ShoppingCart className="size-6" />
          <span>Cart</span>
        </Link>
      </header>
      <div>
        {products.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Frown className="size-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">
              No products found
            </h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.data.map((product) => (
              <Suspense key={product.id} fallback={<ProductListSkeleton />}>
                <ProductCart product={product} currency={products.currency} />
              </Suspense>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
