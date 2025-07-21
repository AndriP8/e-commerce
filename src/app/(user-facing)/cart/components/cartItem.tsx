"use client";
import { GetCartResponse } from "@/app/types/cart";
import { debounce } from "@/app/utils/debounce";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { formatPrice } from "@/app/utils/format-price-currency";
import { DEFAULT_BLUR_DATA_URL } from "@/app/constants/images";
import {
  updateCartQuantityAction,
  removeFromCartAction,
} from "@/app/actions/cart-actions";
import { cartItemReducer, createInitialCartItemState } from "./cartItemReducer";

export default function CartItem({
  item,
  currency,
}: {
  item: GetCartResponse["data"]["items"][number];
  currency: GetCartResponse["currency"];
}) {
  const [state, dispatch] = useReducer(
    cartItemReducer,
    createInitialCartItemState(item.quantity),
  );
  const { quantity, debouncedQuantity, isUpdating } = state;

  // Use ref to track if we need to update
  const shouldUpdateRef = useRef(false);

  // Debounced quantity change handler
  const handleQuantityChange = useCallback(
    debounce((newQuantity: string) => {
      const num = Number(newQuantity);
      if (isNaN(num) || num < 1) {
        dispatch({ type: "SET_QUANTITY", payload: "1" });
        dispatch({ type: "SET_DEBOUNCED_QUANTITY", payload: "1" });
      } else {
        dispatch({ type: "SET_DEBOUNCED_QUANTITY", payload: newQuantity });
        shouldUpdateRef.current = true;
      }
    }, 200),
    [],
  );

  // Handle quantity update
  const handleUpdateQuantity = useCallback(async () => {
    // Reset the flag
    shouldUpdateRef.current = false;

    try {
      if (item.quantity.toString() === debouncedQuantity || isUpdating) return;

      dispatch({ type: "SET_UPDATING", payload: true });

      const result = await updateCartQuantityAction(
        item.id,
        Number(debouncedQuantity),
      );

      if (result.success) {
        dispatch({ type: "SET_QUANTITY", payload: debouncedQuantity });
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
  }, [item.id, item.quantity, debouncedQuantity, isUpdating]);

  // Handle item deletion
  const handleDeleteItem = async () => {
    try {
      const result = await removeFromCartAction(item.id);

      if (result.success) {
        toast.success(result.message || "Product removed from cart");
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
          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${item.image_url}`}
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
        <p className="text-gray-600">
          {formatPrice(parseFloat(item.total_price), currency)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <button
            className="px-2 py-1 border rounded"
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
            -
          </button>
          <input
            type="number"
            value={quantity}
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
            className="w-10 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min={1}
            max={999}
          />
          <button
            className="px-2 py-1 border rounded"
            onClick={() => {
              const newQuantity = Number(quantity) + 1;
              dispatch({
                type: "SET_QUANTITY",
                payload: newQuantity.toString(),
              });
              handleQuantityChange(newQuantity.toString());
            }}
          >
            +
          </button>
        </div>
      </div>
      <button
        className="text-red-500 hover:text-red-700 cursor-pointer"
        onClick={handleDeleteItem}
      >
        Remove
      </button>
    </div>
  );
}
