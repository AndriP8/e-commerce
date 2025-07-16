import { useState } from "react";
import Image from "next/image";
import { ProductsResponse } from "@/app/types/product-types";
import { toast } from "sonner";
import { useAuth } from "@/app/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProductCart({
  product,
}: {
  product: ProductsResponse["data"][number];
}) {
  const [isAdding, setIsAdding] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const addToCart = async (productId: string) => {
    // Check if user is authenticated
    if (!isAuthenticated) {
      toast.error("Please login to add items to your cart");
      router.push("/login");
      return;
    }

    setIsAdding(true);
    const response = await fetch("/api/cart/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: 1, // Default quantity of 1
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      toast.error(data.error ? data.error : "An unknown error occurred");
    } else {
      toast.success("Product added to cart");
    }
    setIsAdding(false);
  };
  return (
    <div className="border rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <Link href={`/products/${product.id}`}>
        <div className="relative h-48">
          <Image
            src={product.category?.image_url || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h2 className="font-semibold text-lg mb-2">{product.name}</h2>
          <p className="text-gray-700 mb-4">${product.base_price}</p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        <button
          onClick={() => addToCart(product.id)}
          disabled={isAdding}
          className={`w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors ${
            isAdding ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
