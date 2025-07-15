"use client";

import { CheckoutCostProvider } from "@/app/contexts/CheckoutCostContext";

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CheckoutCostProvider>{children}</CheckoutCostProvider>;
}
