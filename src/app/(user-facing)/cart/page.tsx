import { GetCartResponse } from "@/app/types/cart";
import Link from "next/link";
import CartItem from "./components/cartItem";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth-utils";
import { formatPrice } from "@/app/utils/format-price-currency";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import { Suspense } from "react";
import { CartItemSkeleton } from "@/app/components/Skeleton";

async function getCart({
  token,
  cookieCurrency,
}: {
  token: string;
  cookieCurrency: string;
}) {
  const response = await fetch("http://localhost:3001/api/cart/products", {
    headers: {
      Cookie: `token=${token}; preferred_currency=${cookieCurrency}`,
    },
    next: {
      revalidate: 60, // 1 minute
      tags: ["cart"], // Add cache tag for targeted invalidation
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }
  const result = (await response.json()) as GetCartResponse;
  return result;
}

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const cookieCurrency = cookieStore.get("preferred_currency")?.value || "";
  let isAuthenticated = false;

  if (token) {
    try {
      await verifyToken(token);
      isAuthenticated = true;
    } catch (_error) {
      isAuthenticated = false;
    }
  }

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="mb-6">
            <ShoppingCart size={64} className="mx-auto text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Please Login
          </h2>
          <p className="text-lg mb-6 text-gray-600">
            You need to be logged in to view your cart
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/login"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cart = await getCart({ token, cookieCurrency });
  const cartItems = cart.data.items;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12 max-w-md mx-auto">
          <div className="mb-6">
            <ShoppingCart size={64} className="mx-auto text-gray-300" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-gray-900">
            Your cart is empty
          </h2>
          <p className="text-lg mb-6 text-gray-600">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          aria-label="Back to products"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Shopping</span>
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <ShoppingCart size={32} />
          Your Cart ({cartItems.length}{" "}
          {cartItems.length === 1 ? "item" : "items"})
        </h1>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Suspense
            fallback={
              <div className="space-y-4">
                {Array.from({ length: 3 }, (_, index) => (
                  <CartItemSkeleton key={index} />
                ))}
              </div>
            }
          >
            <div className="space-y-4">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} currency={cart.currency} />
              ))}
            </div>
          </Suspense>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-6 text-gray-900">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">
                  Items ({cartItems.length})
                </span>
                <span className="font-medium">
                  {formatPrice(cart.data.total_price, cart.currency)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-green-600">Free</span>
              </div>

              <hr className="border-gray-200" />

              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total</span>
                <span className="font-bold">
                  {formatPrice(cart.data.total_price, cart.currency)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200 text-center block font-medium focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Proceed to Checkout
            </Link>

            <Link
              href="/"
              className="w-full mt-3 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-center block focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
