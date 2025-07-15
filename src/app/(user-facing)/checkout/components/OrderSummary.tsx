"use client";

import { GetCartResponse } from "@/app/types/cart";
import { useCheckoutCost } from "@/app/contexts/CheckoutCostContext";
import { useEffect, useMemo } from "react";

interface OrderSummaryProps {
  cart: GetCartResponse;
}

export default function OrderSummary({ cart }: OrderSummaryProps) {
  const { shippingCost, updateSubtotal, tax } = useCheckoutCost();

  const cartItems = cart.data.items;

  const subtotal = useMemo(() => {
    return cartItems?.reduce(
      (sum, item) => sum + parseFloat(item.total_price),
      0,
    );
  }, [cartItems]);

  // Update subtotal in context whenever it changes
  useEffect(() => {
    updateSubtotal(subtotal);
  }, [subtotal, updateSubtotal]);

  const total = useMemo(() => {
    return subtotal + shippingCost + tax;
  }, [subtotal, shippingCost, tax]);

  return (
    <div className="border rounded-lg p-6 h-fit">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      <div className="space-y-4 mb-6">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between items-center">
            <div className="flex items-center">
              <span className="font-medium">{item.product_name}</span>
              <span className="text-gray-500 ml-2">x{item.quantity}</span>
            </div>
            <span>${parseFloat(item.total_price).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t pt-4 space-y-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>
            {shippingCost === 0 ? "Free" : `$${shippingCost.toFixed(2)}`}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="border-t pt-4 flex justify-between font-bold">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
