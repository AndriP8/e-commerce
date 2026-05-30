"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import { Link } from "@/i18n/navigation";

export default function OrderConfirmationError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");
  const tCart = useTranslations("Cart");

  useEffect(() => {
    console.error("Order confirmation error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
        <svg
          className="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{t("title")}</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        {t("globalDescription")}
      </p>
      <div className="flex justify-center space-x-4">
        <button
          onClick={reset}
          type="button"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          {t("tryAgain")}
        </button>
        <Link
          href="/"
          className="bg-gray-100 text-gray-800 px-6 py-2 rounded hover:bg-gray-200 transition-colors"
        >
          {tCart("actions.continueShopping")}
        </Link>
      </div>
    </div>
  );
}
