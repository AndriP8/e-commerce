"use client";

import Link from "next/link";
import { useAuth } from "@/app/contexts/AuthContext";
import CurrencySelector from "@/app/components/CurrencySelector";

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            E-Commerce
          </Link>

          <div className="flex items-center space-x-6">
            <CurrencySelector className="w-48" showLabel={false} />
            
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/cart" className="text-gray-700 hover:text-blue-600">
                Cart
              </Link>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Hello, {user?.firstName || user?.email.split("@")[0]}
                </span>
                <button
                  onClick={() => logout()}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
