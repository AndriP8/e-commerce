"use client";

import Link from "next/link";
import { ProductsResponse } from "@/app/types/product-types";
import { useQueryState } from "nuqs";
import ProductCart from "./ProductCart";
import { debounce } from "@/app/utils/debounce";

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
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <span>Cart</span>
        </Link>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.data.map((product) => (
          <ProductCart key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
