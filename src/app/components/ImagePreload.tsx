interface ImagePreloadProps {
  src: string;
  as?: "image";
  type?: string;
  fetchPriority?: "high" | "low" | "auto";
}

export function ImagePreload({
  src,
  as = "image",
  type = "image/webp",
  fetchPriority = "high",
}: ImagePreloadProps) {
  return <link rel="preload" href={src} as={as} type={type} fetchPriority={fetchPriority} />;
}
