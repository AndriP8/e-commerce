import { GetCartResponse } from "@/app/types/cart";
import Link from "next/link";
import CartItem from "./components/cartItem";
import { cookies } from "next/headers";
import { verifyToken } from "@/app/utils/auth-utils";

async function getCart() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const response = await fetch("http://localhost:3001/api/cart/products", {
    headers: {
      Cookie: `token=${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch cart");
  }
  const result = (await response.json()) as GetCartResponse;
  return result;
}

export default async function CartPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      await verifyToken(token);
      isAuthenticated = true;
    } catch (error) {
      isAuthenticated = false;
    }
  }

  // If not authenticated, show login message
  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
        <p className="text-lg mb-6">
          You need to be logged in to view your cart
        </p>
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

  const cart = await getCart();
  const cartItems = cart.data.items;

  if (!cartItems || cartItems.length === 0)
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

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
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
        Your Cart
      </h1>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="space-y-4">
            {cartItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
        </div>

        <div className="border rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${cart.data.total_price}</span>
            </div>
            <Link
              href="/checkout"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-center block"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
