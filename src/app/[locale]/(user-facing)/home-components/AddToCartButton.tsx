"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { useApi } from "@/app/utils/api-client";
import { addToCart as addToCartAction } from "@/app/utils/cart-client-actions";

interface AddToCartButtonProps {
  productId: string;
  productName?: string;
}

export default function AddToCartButton({
  productId,
  productName,
}: AddToCartButtonProps) {
  const t = useTranslations("ProductList");
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
      const result = await addToCartAction(api, productId, 1);

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
      toast.error(t("messages.failedToAdd"));
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      disabled={isAdding}
      aria-disabled={isAdding}
      aria-label={
        productName
          ? `${t("actions.addToCart")} - ${productName}`
          : t("actions.addToCart")
      }
      className="bg-blue-600 text-white px-4 w-full py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      {isAdding ? t("actions.adding") : t("actions.addToCart")}
    </button>
  );
}
