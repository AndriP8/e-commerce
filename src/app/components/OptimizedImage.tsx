"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useState } from "react";
import { DEFAULT_BLUR_DATA_URL } from "@/app/constants/images";

interface OptimizedImageProps extends Omit<ImageProps, "onLoad" | "onError"> {
  fallbackSrc?: string;
  showSkeleton?: boolean;
  aspectRatio?: "square" | "video" | "photo" | string;
  onLoadComplete?: () => void;
  onError?: () => void;
}

/**
 * Optimized Image component with performance enhancements
 */
export default function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  showSkeleton = true,
  aspectRatio = "square",
  className = "",
  onLoadComplete,
  onError,
  priority = false,
  placeholder = "blur",
  blurDataURL = DEFAULT_BLUR_DATA_URL,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoadComplete?.();
  };

  const handleError = () => {
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setHasError(false);
    } else {
      onError?.();
    }
  };

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square";
      case "video":
        return "aspect-video";
      case "photo":
        return "aspect-photo";
      default:
        return aspectRatio;
    }
  };

  const containerClasses = `
    image-container 
    ${getAspectRatioClass()} 
    ${className}
  `.trim();

  const imageClasses = `
    object-cover 
    transition-opacity 
    duration-300
    ${isLoaded ? "opacity-100" : "opacity-0"}
  `.trim();

  return (
    <div className={containerClasses}>
      {showSkeleton && !isLoaded && !hasError && (
        <div className="absolute inset-0 skeleton skeleton-image" />
      )}

      {!hasError && (
        <Image
          src={currentSrc}
          alt={alt}
          fill
          className={imageClasses}
          onLoad={handleLoad}
          onError={handleError}
          priority={priority}
          placeholder={placeholder}
          blurDataURL={blurDataURL || DEFAULT_BLUR_DATA_URL}
          data-loaded={isLoaded}
          {...props}
        />
      )}

      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      )}
    </div>
  );
}

/**
 * Optimized Image component specifically for product cards
 */
export function ProductImage({
  src,
  alt,
  priority = false,
  className = "",
  ...props
}: Omit<OptimizedImageProps, "aspectRatio">) {
  return (
    <OptimizedImage
      src={src}
      alt={alt}
      aspectRatio="square"
      priority={priority}
      className={`hover-scale ${className}`}
      fallbackSrc={`${process.env.NEXT_PUBLIC_CDN_URL}/placeholder-product.webp`}
      {...props}
    />
  );
}

/**
 * Optimized Image component for avatars and logos
 */
export function AvatarImage({
  src,
  alt,
  size = 48,
  className = "",
  ...props
}: Omit<OptimizedImageProps, "aspectRatio" | "fill"> & { size?: number }) {
  return (
    <div
      className={`relative rounded-full overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        aspectRatio="square"
        className="rounded-full"
        sizes={`${size}px`}
        fallbackSrc="/default-avatar.svg"
        {...props}
      />
    </div>
  );
}
