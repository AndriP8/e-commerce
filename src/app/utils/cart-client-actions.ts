"use client";

import type { useApi } from "./api-client";

export interface CartActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function addToCart(
  api: ReturnType<typeof useApi>,
  productId: string,
  quantity: number = 1,
): Promise<CartActionResult> {
  try {
    const response = await api.post("/api/cart/products", {
      product_id: productId,
      quantity,
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || "Failed to add product to cart",
      };
    }

    return {
      success: true,
      message: "Product added to cart successfully!",
    };
  } catch (error) {
    console.error("Error in addToCart:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateCartQuantity(
  api: ReturnType<typeof useApi>,
  cartItemId: string,
  newQuantity: number,
): Promise<CartActionResult> {
  try {
    const response = await api.put(`/api/cart/products/${cartItemId}`, {
      quantity: newQuantity,
    });

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || "Failed to update cart item",
      };
    }

    return {
      success: true,
      message: "Cart updated successfully!",
    };
  } catch (error) {
    console.error("Error in updateCartQuantity:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function removeFromCart(
  api: ReturnType<typeof useApi>,
  cartItemId: string,
): Promise<CartActionResult> {
  try {
    const response = await api.delete(`/api/cart/products/${cartItemId}`);

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || "Failed to remove item from cart",
      };
    }

    return {
      success: true,
      message: "Item removed from cart successfully!",
    };
  } catch (error) {
    console.error("Error in removeFromCart:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}
