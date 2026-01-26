import type { ImageLoaderProps } from "next/image";

const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const normalizedSrc = normalizeSrc(src);

  const baseUrl = normalizedSrc.startsWith("e-commerce/")
    ? normalizedSrc
    : `e-commerce/${normalizedSrc}`;

  const imageUrl = `https://cdn.andripurnomo.com/${baseUrl}`;

  const params = new URLSearchParams();
  if (width) params.set("w", width.toString());
  if (quality) params.set("q", quality.toString());

  const queryString = params.toString();
  return queryString ? `${imageUrl}?${queryString}` : imageUrl;
}
