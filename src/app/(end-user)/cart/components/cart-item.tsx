"use client";

import Image from "next/image";
import { useState } from "react";

import { Order } from "@/app/backoffice/orders/data/data-fetching";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/helpers/format-price";

type CartItemProps = {
  item: Order["data"][number]["items"][number];
};

export function CartItem({ item }: CartItemProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const price = item.discount
    ? item.price - (item.price * item.discount) / 100
    : item.price;

  const mainPrice = formatPrice(price);
  const originalPrice = formatPrice(item.price);

  return (
    <div className="flex gap-4 pb-6 border-b">
      <div className="w-24 h-24 bg-gray-200 rounded">
        <Image
          src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/${item.images[0]}`}
          alt={`${item.name} - Featured Product`}
          className="w-full h-full rounded-sm object-cover mb-4"
          width={96}
          height={96}
        />
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg">{item.name}</h3>
        <p className="text-sm text-gray-600">Size: {item.size}</p>
        <p className="text-sm text-gray-600">Category: {item.category}</p>
        <div>
          <p className="text-gray-600 font-bold">{mainPrice}</p>
          {item.discount ? (
            <div className="flex space-x-2 text-sm">
              <p className="text-red-500">{item.discount}%</p>
              <p className="line-through">{originalPrice}</p>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center border rounded">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={decrementQuantity}
          >
            -
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-12 h-8 text-center border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            min="1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={incrementQuantity}
          >
            +
          </Button>
        </div>
        <button className="text-sm text-gray-600 underline">Remove</button>
      </div>
    </div>
  );
}
