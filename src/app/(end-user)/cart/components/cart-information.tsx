"use client";

import Link from "next/link";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/helpers/format-price";

import { CartItem } from "./cart-item";

const data = [
  {
    id: "c0512dbf-c275-45b1-bcac-f91142021ac8",
    name: "Soup - Knorr, Chicken Noodle",
    price: 10000,
    description: "Oth diab with moderate nonp rtnop with macular edema, r eye",
    images: ["92f8d830-6c52-423e-89cd-57424474fc7c-png.png"],
    discount: 20,
    sku: "1608211134",
    created_at: "2025-01-11 15:59:57.444",
    updated_at: null,
    deleted_at: null,
    category: "Shirts",
    size: "XL",
    order_id: "",
    product_id: "",
    quantity: 1,
  },
];

const subtotal = 1000000;

export default function CartInformation() {
  return (
    <section className="container mx-auto px-4">
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items Section */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-2">Your cart</h1>
          <p className="text-gray-600 mb-6">
            Not ready to checkout?{" "}
            <Link href="/shop" className="underline">
              Continue Shopping
            </Link>
          </p>
          <div className="space-y-6">
            {data.map((product) => (
              <CartItem key={product.id} item={product} />
            ))}
          </div>
          <div className="mt-12">
            <h2 className="text-xl font-bold mb-4">Order Information</h2>
            <Accordion type="single" collapsible className="space-y-4">
              <AccordionItem value="return-policy">
                <AccordionTrigger className="text-left">
                  Return Policy
                </AccordionTrigger>
                <AccordionContent>
                  This is our example return policy which is everything you need
                  to know about our returns.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping-options">
                <AccordionTrigger className="text-left">
                  Shipping Options
                </AccordionTrigger>
                <AccordionContent>
                  Available shipping options will be calculated at checkout.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        {/* Order Summary Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <Input placeholder="Enter coupon code here" className="mb-4" />
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>Calculated at the next step</span>
              </div>
            </div>
            <div className="flex justify-between font-bold border-t pt-4 mb-6">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Button className="w-full bg-black text-white hover:bg-gray-800">
              Continue to checkout
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
