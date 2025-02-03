"use client";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatPrice } from "@/lib/helpers/format-price";

import {
  FeaturedProductsResponse,
  getFeaturedProducts,
} from "../data/data-fetching";

export default function FeaturedProducts() {
  const { data } = useQuery<FeaturedProductsResponse>({
    queryFn: () => getFeaturedProducts(),
    queryKey: ["featured-products"],
  });
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {data?.data.map((product) => {
            const price = product.discount
              ? product.price - (product.price * product.discount) / 100
              : product.price;

            const mainPrice = formatPrice(price);
            const originalPrice = formatPrice(product.price);
            return (
              <Card
                key={product.id}
                className="flex flex-col justify-between h-[442px]"
              >
                <CardContent className="p-4">
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BUCKET_URL}/${product.images[0]}`}
                    alt={`${product.name} - Featured Product`}
                    className="w-full h-64 object-cover mb-4"
                    width={254}
                    height={256}
                  />
                  <h3 className="font-semibold text-lg truncate">
                    {product.name}
                  </h3>
                  <div>
                    <p className="text-gray-600 font-bold">{mainPrice}</p>
                    {product.discount ? (
                      <div className="flex space-x-2 text-sm">
                        <p className="text-red-500">{product.discount}%</p>
                        <p className="line-through">{originalPrice}</p>
                      </div>
                    ) : null}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Add to Cart</Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
