"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { useApi } from "@/app/utils/api-client";
import { addToCart as addToCartAction } from "@/app/utils/cart-client-actions";

export default function AddToCart({ productId }: { productId: string }) {
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const api = useApi();
  const router = useRouter();

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart");
      router.push("/login");
      return;
    }

    setIsAdding(true);
    try {
      const result = await addToCartAction(api, productId, quantity);

      if (result.success) {
        toast.success(result.message || "Product added to cart");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to add product to cart");

        // If authentication error, redirect to login
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
      <div className="flex items-center mb-4">
        <button
          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
          className="w-10 h-10 border rounded-l-md flex items-center justify-center"
        >
          -
        </button>
        <div className="w-16 h-10 border-t border-b flex items-center justify-center">
          {quantity}
        </div>
        <button
          onClick={() => setQuantity((prev) => prev + 1)}
          className="w-10 h-10 border rounded-r-md flex items-center justify-center"
        >
          +
        </button>
      </div>

      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-400 flex items-center justify-center"
      >
        {isAdding ? <span>Adding...</span> : <span>Add to Cart</span>}
      </button>
    </div>
  );
}
