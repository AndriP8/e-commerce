"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { useApi } from "@/app/utils/api-client";
import { addToCart as addToCartAction } from "@/app/utils/cart-client-actions";
import { useTranslations } from "next-intl";
import QuantitySelector from "@/app/components/QuantitySelector";

export default function AddToCart({ productId }: { productId: string }) {
  const t = useTranslations("ProductList");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const api = useApi();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error(t("messages.pleaseLogin"));
      router.push("/login");
      return;
    }

    setIsAdding(true);
    try {
      const result = await addToCartAction(api, productId, quantity);

      if (result.success) {
        toast.success(result.message || t("messages.addedToCart"));
        router.refresh();
      } else {
        toast.error(result.error || t("messages.failedToAdd"));

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

  const handleQuantityChange = (newQuantity: string) => {
    const num = Number(newQuantity);
    if (!isNaN(num) && num >= 1) {
      setQuantity(num);
    }
  };

  return (
    <div className="mb-6">
      <QuantitySelector
        quantity={quantity}
        onQuantityChange={handleQuantityChange}
        disabled={isAdding}
        productName="this product"
        className="mb-4"
      />

      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        aria-disabled={isAdding}
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
      >
        {isAdding ? <span>{t("actions.adding")}</span> : <span>{t("actions.addToCart")}</span>}
      </button>
    </div>
  );
}
