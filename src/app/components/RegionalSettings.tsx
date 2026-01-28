"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useCurrency } from "@/app/contexts/CurrencyContext";
import { useFocusTrap } from "@/app/hooks/useFocusTrap";
import { Globe } from "lucide-react";

interface RegionalSettingsProps {
  className?: string;
}

const AVAILABLE_LOCALES = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
] as const;

export default function RegionalSettings({ className = "" }: RegionalSettingsProps) {
  const t = useTranslations("RegionalSettings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { selectedCurrency, availableCurrencies, changeCurrency } = useCurrency();

  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [tempLocale, setTempLocale] = useState(locale);
  const [tempCurrency, setTempCurrency] = useState(selectedCurrency);
  const [languageFocusedIndex, setLanguageFocusedIndex] = useState(-1);
  const [currencyFocusedIndex, setCurrencyFocusedIndex] = useState(-1);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const languageButtonRef = useRef<HTMLButtonElement>(null);
  const currencyButtonRef = useRef<HTMLButtonElement>(null);
  const languageListRef = useRef<HTMLUListElement>(null);
  const currencyListRef = useRef<HTMLUListElement>(null);
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const currentLanguageName = AVAILABLE_LOCALES.find((l) => l.code === locale)?.name || "English";

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTempLocale(locale);
      setTempCurrency(selectedCurrency);
      setLanguageFocusedIndex(-1);
      setCurrencyFocusedIndex(-1);
      setIsLanguageOpen(false);
      setIsCurrencyOpen(false);
    }
  }, [isOpen, locale, selectedCurrency]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus();
    }
  }, [isOpen]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
    setIsLanguageOpen(false);
    setIsCurrencyOpen(false);
    triggerRef.current?.focus();
  }, []);

  const handleSave = useCallback(async () => {
    if (tempCurrency.code !== selectedCurrency.code) {
      await changeCurrency(tempCurrency);
    }

    if (tempLocale !== locale) {
      router.replace(pathname, { locale: tempLocale });
    }

    setIsOpen(false);
    triggerRef.current?.focus();
  }, [tempCurrency, tempLocale, selectedCurrency, locale, changeCurrency, router, pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        isLanguageOpen &&
        languageButtonRef.current &&
        !languageButtonRef.current.contains(target) &&
        languageListRef.current &&
        !languageListRef.current.contains(target)
      ) {
        setIsLanguageOpen(false);
      }

      if (
        isCurrencyOpen &&
        currencyButtonRef.current &&
        !currencyButtonRef.current.contains(target) &&
        currencyListRef.current &&
        !currencyListRef.current.contains(target)
      ) {
        setIsCurrencyOpen(false);
      }

      if (
        isOpen &&
        modalRef.current &&
        !modalRef.current.contains(target) &&
        !languageListRef.current?.contains(target) &&
        !currencyListRef.current?.contains(target)
      ) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLanguageOpen, isCurrencyOpen, handleCancel]);

  useFocusTrap(modalRef, isOpen);

  const handleModalKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleCancel],
  );

  const handleLanguageButtonKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsLanguageOpen(true);
    }
  }, []);

  const handleLanguageListboxKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setLanguageFocusedIndex((prev) => (prev < AVAILABLE_LOCALES.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setLanguageFocusedIndex((prev) => (prev > 0 ? prev - 1 : AVAILABLE_LOCALES.length - 1));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (languageFocusedIndex >= 0 && languageFocusedIndex < AVAILABLE_LOCALES.length) {
            setTempLocale(AVAILABLE_LOCALES[languageFocusedIndex].code);
            setIsLanguageOpen(false);
            languageButtonRef.current?.focus();
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsLanguageOpen(false);
          languageButtonRef.current?.focus();
          break;
        case "Tab":
          setIsLanguageOpen(false);
          break;
      }
    },
    [languageFocusedIndex],
  );

  const handleCurrencyButtonKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsCurrencyOpen(true);
    }
  }, []);

  const handleCurrencyListboxKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setCurrencyFocusedIndex((prev) => (prev < availableCurrencies.length - 1 ? prev + 1 : 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setCurrencyFocusedIndex((prev) => (prev > 0 ? prev - 1 : availableCurrencies.length - 1));
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          if (currencyFocusedIndex >= 0 && currencyFocusedIndex < availableCurrencies.length) {
            setTempCurrency(availableCurrencies[currencyFocusedIndex]);
            setIsCurrencyOpen(false);
            currencyButtonRef.current?.focus();
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsCurrencyOpen(false);
          currencyButtonRef.current?.focus();
          break;
        case "Tab":
          setIsCurrencyOpen(false);
          break;
      }
    },
    [currencyFocusedIndex, availableCurrencies],
  );

  useEffect(() => {
    if (isLanguageOpen && languageListRef.current && languageFocusedIndex >= 0) {
      languageListRef.current.focus();
      const items = languageListRef.current.querySelectorAll('[role="option"]');
      if (items[languageFocusedIndex]) {
        (items[languageFocusedIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
      }
    }
  }, [languageFocusedIndex, isLanguageOpen]);

  useEffect(() => {
    if (isCurrencyOpen && currencyListRef.current && currencyFocusedIndex >= 0) {
      currencyListRef.current.focus();
      const items = currencyListRef.current.querySelectorAll('[role="option"]');
      if (items[currencyFocusedIndex]) {
        (items[currencyFocusedIndex] as HTMLElement).scrollIntoView({ block: "nearest" });
      }
    }
  }, [currencyFocusedIndex, isCurrencyOpen]);

  useEffect(() => {
    if (isLanguageOpen) {
      const currentIndex = AVAILABLE_LOCALES.findIndex((l) => l.code === tempLocale);
      setLanguageFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isLanguageOpen, tempLocale]);

  useEffect(() => {
    if (isCurrencyOpen) {
      const currentIndex = availableCurrencies.findIndex((c) => c.code === tempCurrency.code);
      setCurrencyFocusedIndex(currentIndex >= 0 ? currentIndex : 0);
    }
  }, [isCurrencyOpen, tempCurrency, availableCurrencies]);

  const tempLanguageName = AVAILABLE_LOCALES.find((l) => l.code === tempLocale)?.name || "English";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        className={`flex items-center space-x-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        aria-label={t("trigger", {
          language: currentLanguageName,
          currency: selectedCurrency.code,
        })}
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span>
          {currentLanguageName} - {selectedCurrency.code}
        </span>
      </button>

      {isMounted &&
        isOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 isolate">
            <div className="absolute inset-0 bg-black/50" aria-hidden="true" />

            <div
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="regional-settings-title"
              aria-describedby="regional-settings-description"
              tabIndex={-1}
              onKeyDown={handleModalKeyDown}
              className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10 animate-in fade-in zoom-in-95 duration-200 transform-gpu will-change-transform"
            >
              <h2 id="regional-settings-title" className="text-xl font-semibold text-gray-900 mb-2">
                {t("modalTitle")}
              </h2>
              <p id="regional-settings-description" className="text-sm text-gray-600 mb-8">
                {t("modalDescription")}
              </p>

              <div className="mb-8">
                <label
                  id="language-label"
                  htmlFor="language-button"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("languageLabel")}
                </label>
                <div className="relative">
                  <button
                    id="language-button"
                    ref={languageButtonRef}
                    type="button"
                    onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                    onKeyDown={handleLanguageButtonKeyDown}
                    className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    aria-haspopup="listbox"
                    aria-expanded={isLanguageOpen}
                    aria-labelledby="language-label"
                    aria-controls={isLanguageOpen ? "language-listbox" : undefined}
                  >
                    <span className="block truncate">{tempLanguageName}</span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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

                  {isLanguageOpen && (
                    <ul
                      ref={languageListRef}
                      id="language-listbox"
                      role="listbox"
                      aria-labelledby="language-label"
                      aria-activedescendant={
                        languageFocusedIndex >= 0
                          ? `language-option-${languageFocusedIndex}`
                          : undefined
                      }
                      tabIndex={0}
                      onKeyDown={handleLanguageListboxKeyDown}
                      className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                    >
                      {AVAILABLE_LOCALES.map((lang, index) => {
                        const isSelected = lang.code === tempLocale;
                        const isFocused = index === languageFocusedIndex;
                        return (
                          <li
                            key={lang.code}
                            id={`language-option-${index}`}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setTempLocale(lang.code);
                              setIsLanguageOpen(false);
                              languageButtonRef.current?.focus();
                            }}
                            className={`${isSelected ? "text-white bg-blue-600" : "text-gray-900"} ${
                              isFocused && !isSelected ? "bg-blue-100" : ""
                            } cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-gray-900`}
                          >
                            <span
                              className={`${isSelected ? "font-semibold" : "font-normal"} block truncate`}
                            >
                              {lang.name}
                            </span>
                            {isSelected && (
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
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <label
                  id="currency-label"
                  htmlFor="currency-button"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("currencyLabel")}
                </label>
                <div className="relative">
                  <button
                    id="currency-button"
                    ref={currencyButtonRef}
                    type="button"
                    onClick={() => setIsCurrencyOpen(!isCurrencyOpen)}
                    onKeyDown={handleCurrencyButtonKeyDown}
                    className="relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-3 text-left cursor-default focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    aria-haspopup="listbox"
                    aria-expanded={isCurrencyOpen}
                    aria-labelledby="currency-label"
                    aria-controls={isCurrencyOpen ? "currency-listbox" : undefined}
                  >
                    <span className="block truncate">
                      {tempCurrency.code} - {tempCurrency.name}
                    </span>
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
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

                  {isCurrencyOpen && (
                    <ul
                      ref={currencyListRef}
                      id="currency-listbox"
                      role="listbox"
                      aria-labelledby="currency-label"
                      aria-activedescendant={
                        currencyFocusedIndex >= 0
                          ? `currency-option-${currencyFocusedIndex}`
                          : undefined
                      }
                      tabIndex={0}
                      onKeyDown={handleCurrencyListboxKeyDown}
                      className="absolute z-50 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
                    >
                      {availableCurrencies.map((currency, index) => {
                        const isSelected = currency.code === tempCurrency.code;
                        const isFocused = index === currencyFocusedIndex;
                        return (
                          <li
                            key={currency.id}
                            id={`currency-option-${index}`}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setTempCurrency(currency);
                              setIsCurrencyOpen(false);
                              currencyButtonRef.current?.focus();
                            }}
                            className={`${isSelected ? "text-white bg-blue-600" : "text-gray-900"} ${
                              isFocused && !isSelected ? "bg-blue-100" : ""
                            } cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 hover:text-gray-900`}
                          >
                            <span
                              className={`${isSelected ? "font-semibold" : "font-normal"} block truncate`}
                            >
                              {currency.symbol} {currency.code} - {currency.name}
                            </span>
                            {isSelected && (
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
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t("cancelButton")}
                </button>
                <button
                  ref={saveButtonRef}
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t("saveButton")}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
