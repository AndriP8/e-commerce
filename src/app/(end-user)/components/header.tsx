import { ShoppingCart, User } from "lucide-react";
import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold text-gray-800">
          MenStyle
        </Link>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="text-gray-600 hover:text-gray-800">
                Home
              </Link>
            </li>
            <li>
              <Link href="/shop" className="text-gray-600 hover:text-gray-800">
                Shop
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-600 hover:text-gray-800">
                New Arrivals
              </Link>
            </li>
            <li>
              <Link href="#" className="text-gray-600 hover:text-gray-800">
                Sale
              </Link>
            </li>
          </ul>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/user" className="text-gray-600 hover:text-gray-800">
            <User size={24} />
            <span className="sr-only">User Information</span>
          </Link>
          <Link href="/cart" className="text-gray-600 hover:text-gray-800">
            <ShoppingCart size={24} />
          </Link>
        </div>
      </div>
    </header>
  );
}
