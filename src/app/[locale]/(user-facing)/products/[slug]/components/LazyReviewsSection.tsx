"use client";

import { Suspense, lazy } from "react";

const ReviewsSection = lazy(() => import("./ReviewsSection"));

interface Review {
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  review_text: string | null;
  rating: number;
  created_at: Date | string;
  is_verified_purchase: boolean;
}

interface LazyReviewsSectionProps {
  reviews: Review[];
}

function ReviewsSkeleton() {
  return (
    <div className="mt-12 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-48 mb-6" />
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b pb-6">
            <div className="flex items-center mb-2">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((j) => (
                  <div key={j} className="w-4 h-4 bg-gray-200 rounded" />
                ))}
              </div>
              <div className="h-4 bg-gray-200 rounded w-32 ml-2" />
            </div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="flex gap-2">
              <div className="h-3 bg-gray-200 rounded w-20" />
              <div className="h-3 bg-gray-200 rounded w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LazyReviewsSection({ reviews }: LazyReviewsSectionProps) {
  return (
    <Suspense fallback={<ReviewsSkeleton />}>
      <ReviewsSection reviews={reviews} />
    </Suspense>
  );
}
