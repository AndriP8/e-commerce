"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { addToCartAction, redirectToLogin } from "@/app/actions/cart-actions";

interface AddToCartButtonProps {
  productId: string;
}

export default function AddToCartButton({ productId }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuth();

  const addToCart = async () => {
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
    <button
      onClick={addToCart}
      disabled={isAdding}
      className="bg-blue-600 text-white px-4 w-full py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isAdding ? "Adding..." : "Add to Cart"}
    </button>
  );
}