import { ProductDetailResponse } from "@/app/types/product-types";
import Image from "next/image";
import AddToCart from "./components/AddToCart";
import { cookies } from "next/headers";
import { formatPrice } from "@/app/utils/format-price-currency";

async function getProduct(id: string): Promise<ProductDetailResponse> {
  const cookieStore = await cookies();
  const cookieCurrency = cookieStore.get("preferred_currency")?.value || "";
  const response = await fetch(`http://localhost:3001/api/products/${id}`, {
    headers: {
      Cookie: `preferred_currency=${cookieCurrency}`,
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return response.json();
}

export default async function ProductDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productData = await getProduct(id);
  const product = productData.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="relative">
          <div className="sticky top-24">
            <div className="relative h-96 w-full mb-4 rounded-lg overflow-hidden">
              {product.images && product.images.length > 0 ? (
                <Image
                  src={`${process.env.NEXT_PUBLIC_CDN_URL}/${product.images[0].image_url}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <Image
                  src={`${process.env.NEXT_PUBLIC_CDN_URL}/400x500.webp}`}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative h-20 rounded-md overflow-hidden cursor-pointer border hover:border-blue-500"
                  >
                    <Image
                      src={`${process.env.NEXT_PUBLIC_CDN_URL}/${image.image_url}`}
                      alt={image.alt_text || product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-2">
            <span className="text-sm text-blue-600">
              {product.category?.name}
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          {/* Ratings */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${
                    i < Math.round(product.rating.average)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-sm text-gray-600 ml-2">
              {product.rating.average.toFixed(1)} ({product.rating.count}{" "}
              reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <span className="text-2xl font-bold">
              {formatPrice(
                parseFloat(product.base_price),
                productData.currency,
              )}
            </span>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Variants</h2>
              <div className="grid grid-cols-2 gap-2">
                {product.variants.map((variant) => (
                  <div
                    key={variant.id}
                    className="border rounded-md p-3 cursor-pointer hover:border-blue-500"
                  >
                    <div className="font-medium">{variant.variant_name}</div>
                    <div className="text-sm text-gray-600">
                      {formatPrice(
                        parseFloat(variant.price),
                        productData.currency,
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <AddToCart productId={product.id} />

          {/* Seller Info */}
          <div className="mt-8 p-4 border rounded-md">
            <h2 className="text-lg font-semibold mb-2">Sold by</h2>
            <div className="flex items-center">
              {product.seller?.logo_url && (
                <div className="relative h-12 w-12 mr-3">
                  <Image
                    src={product.seller.logo_url}
                    alt={product.seller.business_name}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              )}
              <div>
                <div className="font-medium">
                  {product.seller?.business_name}
                </div>
                <div className="text-sm text-gray-600">
                  {product.seller?.rating} ★ ({product.seller?.total_reviews}{" "}
                  reviews)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>

        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-6">
            {product.reviews.map((review) => (
              <div key={review.first_name} className="border-b pb-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < review.rating
                            ? "text-yellow-400"
                            : "text-gray-300"
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="font-medium ml-2">{review.title}</span>
                </div>
                <p className="text-gray-700 mb-2">{review.review_text}</p>
                <div className="text-sm text-gray-500">
                  <span>
                    {review.first_name} {review.last_name}
                  </span>
                  <span className="mx-2">•</span>
                  <span>
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                  {review.is_verified_purchase && (
                    <span className="ml-2 text-green-600">
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No reviews yet.</p>
        )}
      </div>
    </div>
  );
}
