import type { ImageLoaderProps } from "next/image";

const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

export default function cloudflareLoader({ src }: ImageLoaderProps) {
  const normalizedSrc = normalizeSrc(src);

  const baseUrl = normalizedSrc.startsWith("e-commerce/")
    ? normalizedSrc
    : `e-commerce/${normalizedSrc}`;

  return `https://cdn.andripurnomo.com/${baseUrl}`;
}
