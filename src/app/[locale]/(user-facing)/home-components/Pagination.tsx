"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  searchQuery?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  searchQuery,
}: PaginationProps) {
  const t = useTranslations("Home");
  const tA11y = useTranslations("Accessibility");

  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers to display
  const getPageNumbers = (): (number | "ellipsis")[] => {
    const pages: (number | "ellipsis")[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("ellipsis");
      }

      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("ellipsis");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  const buildUrl = (page: number): string => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (searchQuery) params.set("search", searchQuery);
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "/";
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-gray-200"
      aria-label={tA11y("pagination")}
    >
      <p className="text-sm text-gray-700">
        {t("pagination.showing", { start, end, total: totalItems })}
      </p>

      <div className="flex items-center gap-1">
        {/* Previous button */}
        {currentPage > 1 ? (
          <Link
            href={buildUrl(currentPage - 1)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t("pagination.previous")}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("pagination.previous")}</span>
          </Link>
        ) : (
          <button
            disabled
            aria-disabled="true"
            aria-label={t("pagination.previous")}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed"
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{t("pagination.previous")}</span>
          </button>
        )}

        {/* Page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-sm text-gray-500"
                aria-label={tA11y("morePages")}
              >
                <span aria-hidden="true">...</span>
              </span>
            ) : (
              <Link
                key={page}
                href={buildUrl(page)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </Link>
            ),
          )}
        </div>

        {/* Mobile page indicator */}
        <span className="sm:hidden px-3 py-2 text-sm text-gray-700">
          {t("pagination.page", { current: currentPage, total: totalPages })}
        </span>

        {/* Next button */}
        {currentPage < totalPages ? (
          <Link
            href={buildUrl(currentPage + 1)}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label={t("pagination.next")}
          >
            <span className="hidden sm:inline">{t("pagination.next")}</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        ) : (
          <button
            disabled
            aria-disabled="true"
            aria-label={t("pagination.next")}
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed"
          >
            <span className="hidden sm:inline">{t("pagination.next")}</span>
            <ChevronRight className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>
    </nav>
  );
}
