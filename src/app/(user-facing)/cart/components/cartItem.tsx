"use client";
import { GetCartResponse } from "@/app/types/cart";
import { debounce } from "@/app/utils/debounce";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { formatPrice } from "@/app/utils/format-price-currency";

const updateCartQuantity = async ({
  cartItemId,
  newQuantity,
}: {
  cartItemId: string;
  newQuantity: number;
}) => {
  const response = await fetch(`/api/cart/products/${cartItemId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      quantity: newQuantity,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update cart quantity");
  }

  return response.json();
};
const deleteCartItem = async (cartItemId: string) => {
  const response = await fetch(`/api/cart/products/${cartItemId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete cart item");
  }

  return response.json();
};

export default function CartItem({
  item,
  currency,
}: {
  item: GetCartResponse["data"]["items"][number];
  currency: GetCartResponse["currency"];
}) {
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const [debouncedQuantity, setQuantityDebounce] = useState(
    item.quantity.toString(),
  );

  const router = useRouter();

  const handleQuantityChange = useCallback(
    debounce((newQuantity: string) => {
      const num = Number(newQuantity);
      if (isNaN(num) || num < 1) {
        setQuantity("1");
        setQuantityDebounce("1");
      } else {
        setQuantityDebounce(newQuantity);
      }
    }, 200),
    [],
  );

  const handleUpdateQuantity = useCallback(async () => {
    try {
      if (item.quantity.toString() === debouncedQuantity) return;
      await updateCartQuantity({
        cartItemId: item.id,
        newQuantity: Number(debouncedQuantity),
      });
      setQuantity(debouncedQuantity);
      router.refresh();
    } catch (_error) {
      toast.error("Failed to update cart quantity");
    }
  }, [item.id, debouncedQuantity]);

  const handleDeleteItem = async () => {
    try {
      deleteCartItem(item.id);
      toast.success("Product removed from cart");
      router.refresh();
    } catch (_error) {
      toast.error("Failed to remove product from cart");
    }
  };

  useEffect(() => {
    handleUpdateQuantity();
  }, [handleUpdateQuantity]);

  return (
    <div className="border rounded-lg p-4 flex gap-4 items-center">
      <div className="w-24 h-24 bg-gray-100 rounded relative">
        <Image
          src={`${process.env.NEXT_PUBLIC_CDN_URL}/${item.image_url}`}
          alt={item.product_name}
          fill
          className="object-cover"
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
              setQuantity(newQuantity.toString());
              handleQuantityChange(newQuantity.toString());
            }}
          >
            -
          </button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => {
              const value = e.target.value;
              setQuantity(value);
              handleQuantityChange(value || "1");
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (!value || Number(value) < 1) {
                setQuantity("1");
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
              setQuantity(newQuantity.toString());
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
