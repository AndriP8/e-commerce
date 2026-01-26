"use client";

import { useHoverPrefetch } from "@/app/hooks/usePrefetch";
import { ReactNode } from "react";

interface ProductCardWrapperProps {
  slug: string;
  children: ReactNode;
}

export default function ProductCardWrapper({ slug, children }: ProductCardWrapperProps) {
  const { prefetch, cancelPrefetch } = useHoverPrefetch(300);
  const productUrl = `/products/${slug}`;

  return (
    <div
      onMouseEnter={() => prefetch(productUrl)}
      onMouseLeave={cancelPrefetch}
      onFocus={() => prefetch(productUrl)}
    >
      {children}
    </div>
  );
}
