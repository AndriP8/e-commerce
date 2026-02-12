"use client";

import { useId, useState, useEffect } from "react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useQueryState, useQueryStates, parseAsInteger, parseAsString } from "nuqs";

interface SearchBarProps {
  className?: string;
}

export default function SearchBar({ className = "" }: SearchBarProps) {
  const t = useTranslations("Home");
  const tA11y = useTranslations("Accessibility");
  const router = useRouter();
  const pathname = usePathname();
  const inputId = useId();

  const [{ search: queryState, page }, setQueryParams] = useQueryStates(
    {
      search: parseAsString.withDefault(""),
      page: parseAsInteger.withDefault(1),
    },
    {
      shallow: false,
    },
  );

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (pathname === "/") {
      setInputValue(queryState || "");
    }
  }, [queryState, pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = inputValue.trim();

    if (pathname === "/") {
      setQueryParams({
        search: trimmedQuery || null,
        page: null, // Reset page to 1
      });
    } else if (trimmedQuery) {
      router.push(`/?search=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className={`w-full ${className}`} role="search">
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">
          {tA11y("searchProducts")}
        </label>
        <input
          id={inputId}
          type="search"
          onChange={(e) => {
            const newValue = e.target.value;
            setInputValue(newValue);
            if (newValue === "" && pathname === "/") {
              setQueryParams({
                search: null,
                page: null,
              });
            }
          }}
          value={inputValue}
          placeholder={t("search")}
          className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none focus:text-blue-600"
          aria-label={t("search")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
