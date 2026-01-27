"use client";

import { useTranslations } from "next-intl";
import StarRating from "./StarRating";

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
    <section className="mt-12" aria-labelledby="reviews-heading">
      <h2 id="reviews-heading" className="text-2xl font-bold mb-6">
        {t("customerReviews")}
      </h2>

      {reviews && reviews.length > 0 ? (
        <div className="space-y-6" role="list" aria-label={t("customerReviews")}>
          {reviews.map((review, index) => (
            <article
              key={`${review.first_name}-${index}`}
              className="border-b pb-6"
              role="listitem"
            >
              <div className="flex items-center mb-2">
                <StarRating rating={review.rating} size="sm" />
                <span className="font-medium ml-2">{review.title}</span>
              </div>
              <p className="text-gray-700 mb-2">{review.review_text}</p>
              <footer className="text-sm text-gray-500">
                <span>
                  {review.first_name} {review.last_name}
                </span>
                <span className="mx-2" aria-hidden="true">
                  •
                </span>
                <time dateTime={new Date(review.created_at).toISOString()}>
                  {new Date(review.created_at).toLocaleDateString()}
                </time>
                {review.is_verified_purchase && (
                  <span className="ml-2 text-green-600">{t("verifiedPurchase")}</span>
                )}
              </footer>
            </article>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">{t("noReviews")}</p>
      )}
    </section>
  );
}
