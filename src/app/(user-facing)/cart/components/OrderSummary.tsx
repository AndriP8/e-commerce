"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/app/utils/format-price-currency";
import { GetCartResponse } from "@/app/types/cart";
import { useEffect } from "react";

interface OrderSummaryProps {
  cart: GetCartResponse;
  itemCount: number;
}

export default function OrderSummary({ cart, itemCount }: OrderSummaryProps) {
  const router = useRouter();

  // Prefetch checkout page when cart page loads
  useEffect(() => {
    router.prefetch("/checkout");
  }, [router]);

  const handleCheckoutHover = () => {
    // Additional prefetch on hover for immediate response
    router.prefetch("/checkout");
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-4">
      <h2 className="text-xl font-bold mb-6 text-gray-900">Order Summary</h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Items ({itemCount})</span>
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
        onMouseEnter={handleCheckoutHover}
        prefetch={true}
      >
        Proceed to Checkout
      </Link>

      <Link
        href="/"
        className="w-full mt-3 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-center block focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        prefetch={true}
      >
        Continue Shopping
      </Link>
    </div>
  );
}
