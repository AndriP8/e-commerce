"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { useApi } from "@/app/utils/api-client";
import { addToCart as addToCartAction } from "@/app/utils/cart-client-actions";
import { useTranslations } from "next-intl";

export default function AddToCart({ productId }: { productId: string }) {
  const t = useTranslations("Products");
  const tA11y = useTranslations("Accessibility");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const api = useApi();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error(t("pleaseLogin"));
      router.push("/login");
      return;
    }

    setIsAdding(true);
    try {
      const result = await addToCartAction(api, productId, quantity);

      if (result.success) {
        toast.success(result.message || t("addedToCart"));
        router.refresh();
      } else {
        toast.error(result.error || t("failedToAdd"));

        if (result.error?.includes("Authentication required")) {
          router.push("/login");
        }
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="mb-6">
      <div
        className="flex items-center mb-4"
        role="group"
        aria-label={tA11y("quantityFor", { product: "this product" })}
      >
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="w-10 h-10 border rounded-l-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10"
          aria-label={tA11y("decreaseQuantity", { product: "product" })}
          disabled={quantity <= 1}
          aria-disabled={quantity <= 1}
        >
          <span aria-hidden="true">-</span>
        </button>
        <div className="w-16 h-10 border-t border-b flex items-center justify-center">
          <span className="sr-only">{tA11y("quantityLabel")}</span>
          {quantity}
        </div>
        <button
          onClick={() => setQuantity((prev) => prev + 1)}
          className="w-10 h-10 border rounded-r-md flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10"
          aria-label={tA11y("increaseQuantity", { product: "product" })}
        >
          <span aria-hidden="true">+</span>
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        aria-disabled={isAdding}
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {isAdding ? <span>{t("adding")}</span> : <span>{t("addToCart")}</span>}
      </button>
    </div>
  );
}
