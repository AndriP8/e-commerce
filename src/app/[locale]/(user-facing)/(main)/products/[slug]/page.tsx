import type { Metadata } from "next";
import { cookies } from "next/headers";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ImagePreload } from "@/app/components/ImagePreload";
import { BreadcrumbJsonLd, ProductJsonLd } from "@/app/components/JsonLd";
import { DEFAULT_BLUR_DATA_URL, IMAGE_SIZES } from "@/app/constants/images";
import type { ProductDetailResponse } from "@/app/types/product-types";
import { formatPrice } from "@/app/utils/format-price-currency";
import AddToCart from "./components/AddToCart";
import LazyReviewsSection from "./components/LazyReviewsSection";
import StarRating from "./components/StarRating";

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

async function getProduct(slug: string): Promise<ProductDetailResponse> {
  const cookieStore = await cookies();
  const cookieCurrency = cookieStore.get("preferred_currency")?.value || "";
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${slug}`,
    {
      headers: {
        Cookie: `preferred_currency=${cookieCurrency}`,
      },
    },
  );
  if (!response.ok) {
    throw new Error("Failed to fetch product");
  }
  return response.json();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const productData = await getProduct(slug);
  const product = productData.data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  // Get the first image URL if available
  const imageUrl =
    product.images && product.images.length > 0
      ? `${product.images[0].image_url}`
      : null;

  return {
    title: `${product.name} | E-Commerce Store`,
    description:
      product.description || `Buy ${product.name} at our E-Commerce Store`,
    keywords: `${product.name}, ${product.category?.name || "product"}, e-commerce, shopping`,
    openGraph: {
      title: product.name,
      description:
        product.description || `Buy ${product.name} at our E-Commerce Store`,
      type: "website",
      url: `${baseUrl}/products/${slug}`,
      images: imageUrl ? [{ url: imageUrl }] : [],
    },
    alternates: {
      canonical: `${baseUrl}/products/${slug}`,
    },
  };
}

export default async function ProductDetail({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "ProductDetail" });
  const tNav = await getTranslations({ locale, namespace: "Navigation" });
  const productData = await getProduct(slug);
  const product = productData.data;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";

  // Get first image URL for preloading
  const firstImageUrl =
    product.images && product.images.length > 0
      ? product.images[0].image_url
      : null;

  // Breadcrumb items: Home > Category > Product
  const breadcrumbItems = [
    { name: tNav("home"), url: "/" },
    ...(product.category
      ? [
          {
            name: product.category.name,
            url: `/?search=${encodeURIComponent(product.category.name)}`,
          },
        ]
      : []),
    { name: product.name, url: `/products/${slug}` },
  ];

  return (
    <div>
      {/* JSON-LD Structured Data */}
      <ProductJsonLd
        product={{
          name: product.name,
          description: product.description,
          slug: product.slug,
          base_price: product.base_price,
          brand: product.brand,
          sku: product.sku,
          images: product.images,
          category: product.category,
          rating: product.rating,
          stock: product.stock,
        }}
        currencyCode={productData.currency.code}
        baseUrl={baseUrl}
      />
      <BreadcrumbJsonLd items={breadcrumbItems} baseUrl={baseUrl} />

      {/* Preload critical product image */}
      {firstImageUrl && <ImagePreload src={firstImageUrl} />}

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div className="relative">
            <div className="sticky top-24">
              <div className="relative h-96 w-full mb-4 rounded-lg overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={`${product.images[0].image_url}`}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes={IMAGE_SIZES.PRODUCT_DETAIL}
                    priority
                    placeholder="blur"
                    blurDataURL={DEFAULT_BLUR_DATA_URL}
                  />
                ) : (
                  <Image
                    src="400x500.webp"
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes={IMAGE_SIZES.PRODUCT_DETAIL}
                    priority
                    placeholder="blur"
                    blurDataURL={DEFAULT_BLUR_DATA_URL}
                  />
                )}
              </div>

              {/* Thumbnail Images */}
              {product.images && product.images.length > 1 && (
                <fieldset
                  className="grid grid-cols-5 gap-2"
                  aria-label={t("accessibility.thumbnails")}
                >
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      className="relative h-20 rounded-md overflow-hidden cursor-pointer border hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`View image ${index + 1} of ${product.images.length}`}
                    >
                      <Image
                        src={`${image.image_url}`}
                        alt={image.alt_text || product.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                        loading={index < 3 ? "eager" : "lazy"}
                        placeholder="blur"
                        blurDataURL={DEFAULT_BLUR_DATA_URL}
                      />
                    </button>
                  ))}
                </fieldset>
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
              <StarRating rating={product.rating.average} />
              <span className="text-sm text-gray-600 ml-2">
                {product.rating.average.toFixed(1)} (
                {t("reviews.count", { count: product.rating.count })})
              </span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-2xl font-bold">
                {formatPrice(product.base_price, productData.currency)}
              </span>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">
                {t("info.description")}
              </h2>
              <p className="text-gray-700">{product.description}</p>
            </div>

            {/* Variants */}
            {product.variants && product.variants.length > 0 && (
              <fieldset className="mb-6">
                <legend className="text-lg font-semibold mb-2">
                  {t("info.variants")}
                </legend>
                <div className="grid grid-cols-2 gap-2" role="radiogroup">
                  {product.variants.map((variant, index) => (
                    <label
                      key={variant.id}
                      className="border rounded-md p-3 cursor-pointer hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
                    >
                      <input
                        type="radio"
                        name="product-variant"
                        value={variant.id}
                        defaultChecked={index === 0}
                        className="sr-only"
                      />
                      <div className="font-medium">{variant.variant_name}</div>
                      <div className="text-sm text-gray-600">
                        {formatPrice(variant.price, productData.currency)}
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>
            )}

            {/* Add to Cart */}
            <AddToCart productId={product.id} />

            {/* Seller Info */}
            <div className="mt-8 p-4 border rounded-md">
              <h2 className="text-lg font-semibold mb-2">{t("info.soldBy")}</h2>
              <div className="flex items-center">
                {product.seller?.logo_url && (
                  <div className="relative h-12 w-12 mr-3">
                    <Image
                      src={product.seller.logo_url}
                      alt={product.seller.business_name}
                      fill
                      className="object-cover rounded-full"
                      sizes="48px"
                      loading="lazy"
                      placeholder="blur"
                      blurDataURL={DEFAULT_BLUR_DATA_URL}
                    />
                  </div>
                )}
                <div>
                  <div className="font-medium">
                    {product.seller?.business_name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {product.seller?.rating} ★ (
                    {t("reviews.count", {
                      count: product.seller?.total_reviews || 0,
                    })}
                    )
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <LazyReviewsSection reviews={product.reviews} />
      </div>
    </div>
  );
}
