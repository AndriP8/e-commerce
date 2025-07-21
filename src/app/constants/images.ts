/**
 * Image-related constants for the application
 */

/**
 * Default blur data URL for image placeholders
 * This is a 1x1 pixel transparent JPEG encoded as base64
 */
export const DEFAULT_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=";

/**
 * Image sizes for different use cases
 */
export const IMAGE_SIZES = {
  THUMBNAIL: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  PRODUCT_CARD:
    "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
  PRODUCT_DETAIL: "(max-width: 768px) 100vw, 50vw",
  AVATAR: "48px",
} as const;
