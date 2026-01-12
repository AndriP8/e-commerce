"use client";

import React, { useState, useEffect, useRef } from "react";
import { SelectedCurrency, useCurrency } from "@/app/contexts/CurrencyContext";

interface CurrencySelectorProps {
  className?: string;
  showLabel?: boolean;
}

export default function CurrencySelector({
  className = "",
  showLabel = true,
}: CurrencySelectorProps) {
  const { selectedCurrency, availableCurrencies, changeCurrency, isLoading } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCurrencyChange = async (currency: SelectedCurrency) => {
    await changeCurrency(currency);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className={`flex items-center space-x-2 h-[38px] ${className}`}>
        {showLabel && <span className="text-sm text-gray-600 w-full">Currency:</span>}
        <div className="animate-pulse bg-gray-200 h-8 w-full rounded"></div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {showLabel && (
        <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
      )}

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <span className="flex items-center">
            <span className="ml-3 block truncate">
              {selectedCurrency.symbol} {selectedCurrency.code} - {selectedCurrency.name}
            </span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {availableCurrencies.map((currency) => (
              <button
                key={currency.id}
                onClick={() => handleCurrencyChange(currency)}
                className={`${
                  currency.code === selectedCurrency.code
                    ? "text-white bg-blue-600"
                    : "text-gray-900"
                } cursor-default select-none relative py-2 pl-3 pr-9 w-full text-left hover:bg-blue-50 hover:text-gray-900`}
              >
                <div className="flex items-center">
                  <span
                    className={`${
                      currency.code === selectedCurrency.code ? "font-semibold" : "font-normal"
                    } ml-3 block truncate`}
                  >
                    {currency.symbol} {currency.code} - {currency.name}
                  </span>
                </div>

                {currency.code === selectedCurrency.code && (
                  <span className="text-white absolute inset-y-0 right-0 flex items-center pr-4">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
