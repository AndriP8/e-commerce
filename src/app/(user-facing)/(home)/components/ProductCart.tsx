import Image from "next/image";
import { ProductsResponse } from "@/app/types/product-types";
import Link from "next/link";
import { formatPrice } from "@/app/utils/format-price-currency";
import { DEFAULT_BLUR_DATA_URL, IMAGE_SIZES } from "@/app/constants/images";
import AddToCartButton from "./AddToCartButton";

interface ProductCartProps {
  product: ProductsResponse["data"][number];
  currency: ProductsResponse["currency"];
  priority?: boolean;
}

export default function ProductCart({
  product,
  currency,
  priority = false,
}: ProductCartProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square w-full bg-gray-100">
          <Image
            src={`${process.env.NEXT_PUBLIC_CDN_URL}/${product.category?.image_url}`}
            alt={product.name}
            fill
            className="object-cover hover:scale-105 transition-transform duration-300"
            sizes={IMAGE_SIZES.PRODUCT_CARD}
            priority={priority}
            loading={priority ? "eager" : "lazy"}
            placeholder="blur"
            blurDataURL={DEFAULT_BLUR_DATA_URL}
          />
        </div>
      </Link>

      <div className="p-4 space-y-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-2transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-3 line-clamp-1">
          {product.description}
        </p>
        <div>
          <span className="text-xl font-bold ">
            {formatPrice(parseFloat(product.base_price), currency)}
          </span>
        </div>
        <AddToCartButton productId={product.id} />
      </div>
    </div>
  );
}
