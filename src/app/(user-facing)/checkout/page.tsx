import { GetCartResponse } from "@/app/types/cart";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth-utils";
import Link from "next/link";
import CheckoutForm from "./components/CheckoutForm";
import DynamicOrderSummary from "./components/DynamicOrderSummary";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Checkout | E-Commerce Store",
  description: "Complete your purchase securely",
  keywords: "checkout, payment, order, e-commerce, secure payment",
  alternates: {
    canonical: `${
      process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001"
    }/checkout`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

async function getCart({
  cookieCurrency,
  token,
}: {
  cookieCurrency: string;
  token: string;
}) {
  const response = await fetch("http://localhost:3001/api/cart/products", {
    headers: {
      Cookie: `token=${token}; preferred_currency=${cookieCurrency}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cart items");
  }
  const result = (await response.json()) as GetCartResponse;
  return result;
}

export default async function CheckoutPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const cookieCurrency = cookieStore.get("preferred_currency")?.value || "";

  let isAuthenticated = false;

  if (token) {
    try {
      await verifyToken(token);
      isAuthenticated = true;
    } catch (_error) {
      isAuthenticated = false;
    }
  }

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="text-lg mb-6">You need to be logged in to checkout</p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="border border-blue-600 text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  const cart = await getCart({
    cookieCurrency,
    token,
  });
  const cartItems = cart.data.items;

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg mb-4">Your cart is empty</p>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <CheckoutForm cart={cart} />
        </div>

        <DynamicOrderSummary cart={cart} />
      </div>
    </div>
  );
}
