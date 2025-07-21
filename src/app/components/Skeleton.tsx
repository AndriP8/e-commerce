"use client";

import { memo } from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = memo(function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse'
}: SkeletonProps) {
  const baseClasses = 'bg-gray-200';
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'skeleton',
    none: ''
  };
  
  const variantClasses = {
    text: 'skeleton-text',
    rectangular: 'rounded',
    circular: 'rounded-full'
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <div
      className={`
        ${baseClasses}
        ${animationClasses[animation]}
        ${variantClasses[variant]}
        ${className}
      `.trim()}
      style={style}
    />
  );
});

export default Skeleton;

// Product Card Skeleton
export const ProductCardSkeleton = memo(function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="aspect-square bg-gray-200">
        <Skeleton className="w-full h-full" animation="wave" />
      </div>
      <div className="p-4">
        <Skeleton className="h-6 mb-2" width="80%" />
        <Skeleton className="h-4 mb-3" width="60%" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-6" width="40%" />
          <Skeleton className="h-8" width="80px" />
        </div>
      </div>
    </div>
  );
});

// Product List Skeleton
export const ProductListSkeleton = memo(function ProductListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
});

// Cart Item Skeleton
export const CartItemSkeleton = memo(function CartItemSkeleton() {
  return (
    <div className="border rounded-lg p-4 flex gap-4 items-center">
      <Skeleton className="w-24 h-24" variant="rectangular" />
      <div className="flex-1">
        <Skeleton className="h-5 mb-2" width="70%" />
        <Skeleton className="h-4 mb-3" width="40%" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8" variant="rectangular" />
          <Skeleton className="w-10 h-6" variant="rectangular" />
          <Skeleton className="w-8 h-8" variant="rectangular" />
        </div>
      </div>
      <Skeleton className="h-6" width="60px" />
    </div>
  );
});

// Product Detail Skeleton
export const ProductDetailSkeleton = memo(function ProductDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image Section */}
        <div>
          <Skeleton className="h-96 w-full mb-4" variant="rectangular" />
          <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }, (_, index) => (
              <Skeleton key={index} className="h-20" variant="rectangular" />
            ))}
          </div>
        </div>
        
        {/* Details Section */}
        <div>
          <Skeleton className="h-4 mb-2" width="30%" />
          <Skeleton className="h-8 mb-2" width="80%" />
          <div className="flex items-center mb-4">
            <div className="flex gap-1 mr-2">
              {Array.from({ length: 5 }, (_, index) => (
                <Skeleton key={index} className="w-5 h-5" variant="circular" />
              ))}
            </div>
            <Skeleton className="h-4" width="40%" />
          </div>
          <Skeleton className="h-8 mb-6" width="30%" />
          <div className="mb-6">
            <Skeleton className="h-6 mb-2" width="25%" />
            <Skeleton className="h-4 mb-1" width="100%" />
            <Skeleton className="h-4 mb-1" width="90%" />
            <Skeleton className="h-4" width="70%" />
          </div>
          <Skeleton className="h-12 w-full" variant="rectangular" />
        </div>
      </div>
    </div>
  );
});