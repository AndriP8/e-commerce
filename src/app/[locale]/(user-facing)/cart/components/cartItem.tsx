"use client";
import { GetCartResponse } from "@/app/types/cart";
import { debounce } from "@/app/utils/debounce";
import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { formatPrice } from "@/app/utils/format-price-currency";
import { DEFAULT_BLUR_DATA_URL } from "@/app/constants/images";
import { useApi } from "@/app/utils/api-client";
import { updateCartQuantity, removeFromCart } from "@/app/utils/cart-client-actions";
import { cartItemReducer, createInitialCartItemState } from "./cartItemReducer";
import { useTranslations } from "next-intl";

export default function CartItem({
  item,
  currency,
}: {
  item: GetCartResponse["data"]["items"][number];
  currency: GetCartResponse["currency"];
}) {
  const t = useTranslations("Cart");
  const tA11y = useTranslations("Accessibility");
  const [state, dispatch] = useReducer(cartItemReducer, createInitialCartItemState(item.quantity));
  const { quantity, debouncedQuantity, isUpdating } = state;
  const api = useApi();
  const router = useRouter();

  // Use ref to track if we need to update
  const shouldUpdateRef = useRef(false);

  // Debounced quantity change handler
  const handleQuantityChange = useMemo(
    () =>
      debounce((newQuantity: string) => {
        const num = Number(newQuantity);
        if (isNaN(num) || num < 1) {
          dispatch({ type: "SET_DEBOUNCED_QUANTITY", payload: "1" });
        } else {
          dispatch({ type: "SET_DEBOUNCED_QUANTITY", payload: newQuantity });
        }
        shouldUpdateRef.current = true;
      }, 500),
    [],
  );

  // Handle quantity update
  const handleUpdateQuantity = useCallback(async () => {
    // Reset the flag
    shouldUpdateRef.current = false;

    try {
      if (item.quantity.toString() === debouncedQuantity || isUpdating) return;

      dispatch({ type: "SET_UPDATING", payload: true });

      const result = await updateCartQuantity(api, item.id, Number(debouncedQuantity));

      if (result.success) {
        if (debouncedQuantity !== quantity) {
          dispatch({ type: "SET_DEBOUNCED_QUANTITY", payload: quantity });
        }
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update cart quantity");
        dispatch({
          type: "RESET_TO_ORIGINAL",
          payload: item.quantity.toString(),
        });
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update cart quantity");
      dispatch({
        type: "RESET_TO_ORIGINAL",
        payload: item.quantity.toString(),
      });
    } finally {
      dispatch({ type: "SET_UPDATING", payload: false });
    }
  }, [api, router, item.id, item.quantity, debouncedQuantity, quantity, isUpdating]);

  // Handle item deletion
  const handleDeleteItem = async () => {
    try {
      const result = await removeFromCart(api, item.id);

      if (result.success) {
        toast.success(result.message || "Product removed from cart");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove product from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove product from cart");
    }
  };

  // Effect to trigger update when debounced quantity changes
  useEffect(() => {
    if (shouldUpdateRef.current) {
      handleUpdateQuantity();
    }
  }, [debouncedQuantity, handleUpdateQuantity]);

  return (
    <div className="border rounded-lg p-4 flex gap-4 items-center">
      <div className="w-24 h-24 bg-gray-100 rounded relative">
        <Image
          src={item.image_url || ""}
          alt={item.product_name}
          fill
          className="object-cover rounded"
          sizes="96px"
          loading="lazy"
          placeholder="blur"
          blurDataURL={DEFAULT_BLUR_DATA_URL}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-medium">{item.product_name}</h3>
        <p className="text-gray-600">{formatPrice(item.total_price, currency)}</p>
        <div
          className="mt-2 flex items-center gap-2"
          role="group"
          aria-label={tA11y("quantityFor", { product: item.product_name })}
        >
          <button
            className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUpdating || Number(quantity) <= 1}
            aria-disabled={isUpdating || Number(quantity) <= 1}
            aria-label={tA11y("decreaseQuantity", { product: item.product_name })}
            onClick={() => {
              const newQuantity = Number(quantity) - 1;
              if (newQuantity >= 1) {
                dispatch({
                  type: "SET_QUANTITY",
                  payload: newQuantity.toString(),
                });
                handleQuantityChange(newQuantity.toString());
              }
            }}
          >
            <span aria-hidden="true">-</span>
          </button>
          <input
            type="number"
            value={quantity}
            disabled={isUpdating}
            aria-label={tA11y("quantityFor", { product: item.product_name })}
            onChange={(e) => {
              const value = e.target.value;
              dispatch({ type: "SET_QUANTITY", payload: value });
              handleQuantityChange(value || "1");
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (!value || Number(value) < 1) {
                dispatch({ type: "SET_QUANTITY", payload: "1" });
                handleQuantityChange("1");
              }
            }}
            className="w-10 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={1}
            max={999}
          />
          <button
            className="px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isUpdating}
            aria-disabled={isUpdating}
            aria-label={tA11y("increaseQuantity", { product: item.product_name })}
            onClick={() => {
              const newQuantity = Number(quantity) + 1;
              dispatch({
                type: "SET_QUANTITY",
                payload: newQuantity.toString(),
              });
              handleQuantityChange(newQuantity.toString());
            }}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
      <button
        className="text-red-500 hover:text-red-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
        onClick={handleDeleteItem}
        aria-label={tA11y("removeFromCart", { product: item.product_name })}
      >
        {t("remove")}
      </button>
    </div>
  );
}
