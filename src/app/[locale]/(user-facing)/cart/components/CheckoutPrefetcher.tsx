"use client";

import { useDelayedPrefetch } from "@/app/hooks/usePrefetch";

/**
 * Component that prefetches the checkout page after user has been on cart for 2 seconds
 * This is a client component that renders nothing visible
 */
export default function CheckoutPrefetcher() {
  useDelayedPrefetch("/checkout", 2000);
  return null;
}
