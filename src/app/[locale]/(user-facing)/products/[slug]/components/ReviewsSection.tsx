"use client";

import { useTranslations } from "next-intl";

interface Review {
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  review_text: string | null;
  rating: number;
  created_at: Date | string;
  is_verified_purchase: boolean;
}

interface ReviewsSectionProps {
  reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const t = useTranslations("Products");

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">{t("customerReviews")}</h2>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review, index) => (
            <div key={`${review.first_name}-${index}`} className="border-b pb-6">
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating ? "text-yellow-400" : "text-gray-300"
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="font-medium ml-2">{review.title}</span>
              </div>
              <p className="text-gray-700 mb-2">{review.review_text}</p>
              <div className="text-sm text-gray-500">
                <span>
                  {review.first_name} {review.last_name}
                </span>
                <span className="mx-2">•</span>
                <span>{new Date(review.created_at).toLocaleDateString()}</span>
                {review.is_verified_purchase && (
                  <span className="ml-2 text-green-600">{t("verifiedPurchase")}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">{t("noReviews")}</p>
      )}
    </div>
  );
}
