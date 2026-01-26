"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import CurrencySelector from "@/app/components/CurrencySelector";
import SearchBar from "@/app/components/SearchBar";
import LanguageSwitcher from "@/app/components/LanguageSwitcher";
import { useTranslations } from "next-intl";

export default function Navbar() {
  const t = useTranslations("Navigation");
  const { isAuthenticated, user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="flex justify-between items-center mb-3">
            <Link href="/" className="text-xl font-bold">
              E-Commerce
            </Link>

            <div className="flex items-center space-x-4">
              <Link href="/cart" className="text-gray-700 hover:text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
                aria-label="Toggle menu"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          <SearchBar />

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="mt-4 py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-3">
                <Link
                  href="/"
                  className="text-gray-700 hover:text-blue-600 py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {t("home")}
                </Link>

                {isAuthenticated ? (
                  <>
                    <div className="text-sm text-gray-600 py-2 border-b border-gray-100">
                      {t("hello", { name: user?.firstName || user?.email.split("@")[0] || "" })}
                    </div>
                    <Link
                      href="/orders"
                      className="text-gray-700 hover:text-blue-600 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("myOrders")}
                    </Link>
                    <div className="py-2">
                      <CurrencySelector className="w-full" showLabel={true} />
                    </div>
                    <div className="py-2">
                      <LanguageSwitcher />
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-red-600 hover:text-red-800 text-left py-2"
                    >
                      {t("logout")}
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-blue-600 hover:text-blue-800 py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("login")}
                    </Link>
                    <Link
                      href="/register"
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-center"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {t("register")}
                    </Link>
                    <div className="py-2">
                      <CurrencySelector className="w-full" showLabel={true} />
                    </div>
                    <div className="py-2">
                      <LanguageSwitcher />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex justify-between items-center">
          <Link href="/" className="text-xl font-bold mr-6">
            E-Commerce
          </Link>

          <div className="flex-1 max-w-md">
            <SearchBar />
          </div>

          <div className="flex items-center space-x-6 ml-6">
            <LanguageSwitcher />
            <CurrencySelector className="w-48" showLabel={false} />

            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                {t("home")}
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-blue-600">
                {t("cart")}
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {t("hello", { name: user?.firstName || user?.email.split("@")[0] || "" })}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  {t("logout")}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-sm text-blue-600 hover:text-blue-800">
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
