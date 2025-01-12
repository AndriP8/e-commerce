import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError } from "@/lib/helpers/error-response";
import { publicProductSchema } from "@/lib/schema/public/product.schema";

type GetProductDetailResponse = z.infer<
  typeof publicProductSchema.readDetail.response
>;
type ProductDetailParams = z.infer<
  typeof publicProductSchema.readDetail.params
>;

export async function GET(
  _request: NextRequest,
  route: { params: ProductDetailParams },
) {
  try {
    const product = await db
      .selectFrom("products")
      .innerJoin("categories", "products.category_id", "categories.id")
      .where("products.id", "=", route.params.id)
      .where("products.deleted_at", "is", null)
      .selectAll("products")
      .select(["categories.name as category_name"])
      .executeTakeFirstOrThrow();

    const sizeVariants = await db
      .selectFrom("product_sizes")
      .where("product_sizes.product_id", "=", route.params.id)
      .where("product_sizes.deleted_at", "is", null)
      .innerJoin("sizes", "product_sizes.size_id", "sizes.id")
      .select(["product_sizes.stock", "sizes.size", "sizes.id as size_id"])
      .execute();

    const { category_name, category_id, ...productValue } = product;
    const productData = {
      ...productValue,
      category: {
        id: category_id,
        name: category_name,
      },
      variants: sizeVariants,
      images: JSON.parse(JSON.stringify(product.images)),
    };
    return handleApiData<GetProductDetailResponse>(
      { data: productData },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
