"use client";

import type { ReactNode } from "react";
import { useHoverPrefetch } from "@/app/hooks/usePrefetch";

interface ProductCardWrapperProps {
  slug: string;
  children: ReactNode;
}

export default function ProductCardWrapper({
  slug,
  children,
}: ProductCardWrapperProps) {
  const { prefetch, cancelPrefetch } = useHoverPrefetch(300);
  const productUrl = `/products/${slug}`;

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: Prefetching on hover is an enhancement, not a semantic interaction
    <div
      onMouseEnter={() => prefetch(productUrl)}
      onMouseLeave={cancelPrefetch}
      onFocus={() => prefetch(productUrl)}
    >
      {children}
    </div>
  );
}
