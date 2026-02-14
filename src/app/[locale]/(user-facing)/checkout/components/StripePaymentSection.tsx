"use client";

import { Elements } from "@stripe/react-stripe-js";
import { getStripe } from "@/app/utils/stripe";
import PaymentForm from "./PaymentForm";
import { GetCartResponse } from "@/app/types/cart";
import { ShippingDetail } from "@/schemas/checkout";
import { AddressDetail } from "@/schemas/common";

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
