import Link from "next/link";
import { ProductsResponse } from "@/app/types/product-types";
import ProductCart from "./ProductCart";
import { Frown, ShoppingCart } from "lucide-react";
import SearchBox from "./SearchBox";

export default function ProductList({
  products,
  searchParams,
}: {
  products: ProductsResponse;
  searchParams?: { search?: string };
}) {
  const searchQuery = searchParams?.search || "";

  return (
    <div>
      <header className="flex items-center justify-between mb-8">
        <SearchBox defaultValue={searchQuery} />
        <Link href="/cart" className="flex items-center gap-2">
          <ShoppingCart className="size-6" />
          <span>Cart</span>
        </Link>
      </header>
      <div>
        <h2 className="text-xl font-semibold mb-6 text-gray-900">
          {searchQuery ? `Search Results for "${searchQuery}"` : "Featured Products"}
        </h2>
        {products.data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Frown className="size-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No products found</h3>
            <p className="text-gray-500">Try adjusting your search criteria</p>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}
