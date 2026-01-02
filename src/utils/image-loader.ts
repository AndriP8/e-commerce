import type { ImageLoaderProps } from "next/image";

const normalizeSrc = (src: string) => {
  return src.startsWith("/") ? src.slice(1) : src;
};

export default function cloudflareLoader({ src, width, quality }: ImageLoaderProps) {
  const params = [`width=${width}`];
  if (quality) {
    params.push(`quality=${quality}`);
  }

  if (process.env.NODE_ENV === "development") {
    return `${src}?${params.join("&")}`;
  }

  const normalizedSrc = normalizeSrc(src);
  const cdnDomain = process.env.NEXT_PUBLIC_CDN_URL;

  const imagePath = normalizedSrc.replace(`${cdnDomain}/`, "");

  return `${cdnDomain}/cdn-cgi/image/${params.join(",")}/${imagePath}`;
}
