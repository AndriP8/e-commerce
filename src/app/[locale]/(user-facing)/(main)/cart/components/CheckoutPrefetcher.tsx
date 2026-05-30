"use client";

import { useDelayedPrefetch } from "@/app/hooks/usePrefetch";

export default function CheckoutPrefetcher() {
  useDelayedPrefetch("/checkout", 2000);
  return null;
}
