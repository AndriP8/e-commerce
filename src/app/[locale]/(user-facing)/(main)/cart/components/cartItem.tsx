"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import QuantitySelector from "@/app/components/QuantitySelector";
import { DEFAULT_BLUR_DATA_URL } from "@/app/constants/images";
import { useCart } from "@/app/contexts/CartContext";
import type { GetCartResponse } from "@/app/types/cart";
import { useApi } from "@/app/utils/api-client";
import {
  removeFromCart,
  updateCartQuantity,
} from "@/app/utils/cart-client-actions";
import { debounce } from "@/app/utils/debounce";
import { formatPrice } from "@/app/utils/format-price-currency";

export default function CartItem({
  item,
  currency,
}: {
  item: GetCartResponse["data"]["items"][number];
  currency: GetCartResponse["currency"];
}) {
  const t = useTranslations("Cart");
  const tA11y = useTranslations("Accessibility");
  const [quantity, setQuantity] = useState(item.quantity.toString());
  const api = useApi();
  const router = useRouter();
  const { refresh: refreshCart } = useCart();

  // Stable refs so the debounced function is never recreated
  const apiRef = useRef(api);
  const routerRef = useRef(router);
  const itemRef = useRef(item);
  useEffect(() => {
    apiRef.current = api;
  }, [api]);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  useEffect(() => {
    itemRef.current = item;
  }, [item]);

  const debouncedUpdate = useRef(
    debounce(async (newQuantity: string) => {
      const num = Number(newQuantity);
      const nextQty = Number.isNaN(num) || num < 1 ? 1 : num;
      const currentItem = itemRef.current;

      if (nextQty === currentItem.quantity) return;

      try {
        const result = await updateCartQuantity(
          apiRef.current,
          currentItem.id,
          nextQty,
        );
        if (result.success) {
          routerRef.current.refresh();
        } else {
          toast.error(result.error || "Failed to update cart quantity");
          setQuantity(currentItem.quantity.toString());
        }
      } catch (error) {
        console.error("Error updating quantity:", error);
        toast.error("Failed to update cart quantity");
        setQuantity(currentItem.quantity.toString());
      }
    }, 400),
  ).current;

  const handleDeleteItem = async () => {
    try {
      const result = await removeFromCart(api, item.id);

      if (result.success) {
        toast.success(result.message || "Product removed from cart");
        refreshCart();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to remove product from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove product from cart");
    }
  };

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
        <p className="text-gray-600">
          {formatPrice(item.unit_price, currency)}
        </p>
        <QuantitySelector
          quantity={quantity}
          onQuantityChange={(value) => {
            setQuantity(value);
            debouncedUpdate(value || "1");
          }}
          productName={item.product_name}
          className="mt-2"
        />
      </div>
      <button
        type="button"
        className="text-red-500 hover:text-red-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 rounded px-2 py-1"
        onClick={handleDeleteItem}
        aria-label={tA11y("removeFromCart", { product: item.product_name })}
      >
        {t("actions.remove")}
      </button>
    </div>
  );
}
