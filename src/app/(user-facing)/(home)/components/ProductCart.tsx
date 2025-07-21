"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductsResponse } from "@/app/types/product-types";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import Link from "next/link";
import { formatPrice } from "@/app/utils/format-price-currency";
import { DEFAULT_BLUR_DATA_URL, IMAGE_SIZES } from "@/app/constants/images";
import { addToCartAction, redirectToLogin } from "@/app/actions/cart-actions";

interface ProductCartProps {
  product: ProductsResponse["data"][number];
  currency: ProductsResponse["currency"];
  priority?: boolean;
}

export default function ProductCart({
  product,
  currency,
  priority = false,
}: ProductCartProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuth();

  const addToCart = async (productId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart");
      await redirectToLogin();
      return;
    }

    setIsAdding(true);
    try {
      const result = await addToCartAction(productId, 1);

      if (result.success) {
        toast.success(result.message || "Product added to cart!");
      } else {
        toast.error(result.error || "Failed to add product to cart");

        if (result.error?.includes("Authentication required")) {
          await redirectToLogin();
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add product to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full bg-gray-100">
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/${product.category?.image_url}`}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes={IMAGE_SIZES.PRODUCT_CARD}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={DEFAULT_BLUR_DATA_URL}
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold ">
            {formatPrice(parseFloat(product.base_price), currency)}
          </span>

          <button
            onClick={() => addToCart(product.id)}
            disabled={isAdding}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
