"use client";

import { Elements } from "@stripe/react-stripe-js";
import type { GetCartResponse } from "@/app/types/cart";
import { getStripe } from "@/app/utils/stripe";
import type { ShippingDetail } from "@/schemas/checkout";
import type { AddressDetail } from "@/schemas/common";
import PaymentForm from "./PaymentForm";

const stripePromise = getStripe();

interface StripePaymentSectionProps {
  clientSecret: string;
  cart: GetCartResponse;
  addressDetail: AddressDetail;
  shippingDetail: ShippingDetail;
  shippingAddress: AddressDetail;
}

export default function StripePaymentSection({
  clientSecret,
  cart,
  addressDetail,
  shippingDetail,
  shippingAddress,
}: StripePaymentSectionProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <PaymentForm
        cart={cart}
        addressDetail={addressDetail}
        shippingDetail={shippingDetail}
        shippingAddress={shippingAddress}
      />
    </Elements>
  );
}
