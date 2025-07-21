"use client";

import { useState, useEffect, useCallback } from "react";
import { useQueryState } from "nuqs";
import { debounce } from "@/app/utils/debounce";
import { Search, X } from "lucide-react";

export default function SearchInput() {
  // Local state for immediate UI updates
  const [localSearchTerm, setLocalSearchTerm] = useState("");
  
  // Use nuqs for search query parameter (server-side filtering)
  const [searchTerm, setSearchTerm] = useQueryState("search", {
    defaultValue: "",
    clearOnDefault: true,
  });

  // Create debounced function to update URL search params
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
    }, 300),
    [setSearchTerm],
  );

  // Update URL search params when local search term changes
  useEffect(() => {
    debouncedSetSearchTerm(localSearchTerm);
  }, [localSearchTerm, debouncedSetSearchTerm]);

  // Sync local state with URL params on mount
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleClear = () => {
    setLocalSearchTerm("");
    setSearchTerm("");
  };

  return (
    <div className="relative max-w-md mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <input
          type="text"
          placeholder="Search products..."
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
        {localSearchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      {searchTerm && (
        <p className="text-sm text-gray-600 mt-2">
          Searching for: <span className="font-medium">"{searchTerm}"</span>
        </p>
      )}
    </div>
  );
}