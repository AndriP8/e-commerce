"use client";

import { GetCartResponse } from "@/app/types/cart";
import { useCheckoutCost } from "@/app/contexts/CheckoutCostContext";
import { useEffect, useMemo } from "react";
import { formatPrice } from "@/app/utils/format-price-currency";
import { useTranslations } from "next-intl";

interface OrderSummaryProps {
  cart: GetCartResponse;
}

export default function OrderSummary({ cart }: OrderSummaryProps) {
  const t = useTranslations("Checkout");
  const { shippingCost, updateSubtotal, tax } = useCheckoutCost();

  const cartItems = cart.data.items;

  const subtotal = useMemo(() => {
    return cartItems?.reduce((sum, item) => sum + item.total_price, 0);
  }, [cartItems]);

  // Update subtotal in context whenever it changes
  useEffect(() => {
    updateSubtotal(subtotal);
  }, [subtotal, updateSubtotal]);

  const total = useMemo(() => {
    return subtotal + shippingCost + tax;
  }, [subtotal, shippingCost, tax]);

  return (
    <div
      className="border p-6 h-fit bg-gray-50 border-gray-200 rounded-lg"
      aria-labelledby="order-summary-heading"
      role="region"
    >
      <h2 id="order-summary-heading" className="text-xl font-bold mb-4">
        {t("orderSummary")}
      </h2>
      <div className="space-y-4 mb-6">
        <ul className="list-none p-0 m-0 space-y-4">
          {cartItems.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="font-medium">{item.product_name}</span>
                <span className="text-gray-500 ml-2" aria-label={`Quantity: ${item.quantity}`}>
                  x{item.quantity}
                </span>
              </div>
              <span aria-label={`Price: ${formatPrice(item.total_price, cart.currency)}`}>
                {formatPrice(item.total_price, cart.currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <dl className="border-t border-gray-200 pt-4 space-y-4">
        <div className="flex justify-between">
          <dt>{t("subtotal")}</dt>
          <dd>{formatPrice(subtotal, cart.currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t("shipping")}</dt>
          <dd>{shippingCost === 0 ? t("free") : formatPrice(shippingCost, cart.currency)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>{t("tax")}</dt>
          <dd>{formatPrice(tax, cart.currency)}</dd>
        </div>
        <div
          className="border-t border-gray-200 pt-4 flex justify-between font-bold"
          aria-live="polite"
        >
          <dt>{t("total")}</dt>
          <dd aria-label={`Total: ${formatPrice(total, cart.currency)}`}>
            {formatPrice(total, cart.currency)}
          </dd>
        </div>
      </dl>
    </div>
  );
}
