"use server";

import { revalidateTag } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export interface CartActionResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function addToCartAction(
  productId: string,
  quantity: number = 1,
): Promise<CartActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        success: false,
        error:
          "Authentication required. Please login to add items to your cart.",
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/products`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({
          product_id: productId,
          quantity,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to add product to cart",
      };
    }

    // Invalidate cart cache immediately after successful addition
    revalidateTag("cart");

    return {
      success: true,
      message: "Product added to cart successfully!",
    };
  } catch (error) {
    console.error("Error in addToCartAction:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function updateCartQuantityAction(
  cartItemId: string,
  newQuantity: number,
): Promise<CartActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/products/${cartItemId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Cookie: `token=${token}`,
        },
        body: JSON.stringify({
          quantity: newQuantity,
        }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to update cart item",
      };
    }

    // Invalidate cart cache after successful update
    revalidateTag("cart");

    return {
      success: true,
      message: "Cart updated successfully!",
    };
  } catch (error) {
    console.error("Error in updateCartQuantityAction:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function removeFromCartAction(
  cartItemId: string,
): Promise<CartActionResult> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart/products/${cartItemId}`,
      {
        method: "DELETE",
        headers: {
          Cookie: `token=${token}`,
        },
      },
    );

    if (!response.ok) {
      const data = await response.json();
      return {
        success: false,
        error: data.error || "Failed to remove item from cart",
      };
    }

    // Invalidate cart cache after successful removal
    revalidateTag("cart");

    return {
      success: true,
      message: "Item removed from cart successfully!",
    };
  } catch (error) {
    console.error("Error in removeFromCartAction:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

export async function redirectToLogin() {
  redirect("/login");
}
