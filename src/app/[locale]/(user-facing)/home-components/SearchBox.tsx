"use client";

import { useQueryState } from "nuqs";
import { debounce } from "@/app/utils/debounce";
import { useEffect, useState, useMemo, useRef } from "react";

interface SearchBoxProps {
  defaultValue?: string;
}

export default function SearchBox({ defaultValue = "" }: SearchBoxProps) {
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    shallow: false,
  });

  const [inputValue, setInputValue] = useState(defaultValue);

  // Update input value when searchQuery changes (e.g., browser back/forward)
  useEffect(() => {
    setInputValue(searchQuery || "");
  }, [searchQuery]);

  const setSearchQueryRef = useRef(setSearchQuery);

  useEffect(() => {
    setSearchQueryRef.current = setSearchQuery;
  }, [setSearchQuery]);

  const handleSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQueryRef.current(query || null);
      }, 300),
    [],
  );

  // Clean up debounced function on unmount
  useEffect(() => {
    return () => {
      handleSearch.cancel();
    };
  }, [handleSearch]);

  return (
    <div className="relative w-1/2">
      <input
        type="text"
        placeholder="Search products..."
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={inputValue}
        onChange={(e) => {
          const newValue = e.target.value;
          setInputValue(newValue);
          handleSearch(newValue);
        }}
      />
    </div>
  );
}
