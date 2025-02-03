import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError } from "@/lib/helpers/error-response";
import { publicProductSchema } from "@/lib/schema/public/product.schema";

type GetProductResponse = Omit<
  z.infer<typeof publicProductSchema.read.response>,
  "pagination"
>;

export async function GET() {
  try {
    const baseQuery = db
      .selectFrom("products")
      .innerJoin("categories", "products.category_id", "categories.id")
      .where("products.deleted_at", "is", null);

    const sizeVariants = await db
      .selectFrom("product_sizes")
      .innerJoin("sizes", "product_sizes.size_id", "sizes.id")
      .where("product_sizes.deleted_at", "is", null)
      .select([
        "product_sizes.stock",
        "product_sizes.product_id",
        "sizes.id as size_id",
        "sizes.size",
      ])
      .execute();

    const products = await baseQuery
      .selectAll("products")
      .select(["categories.name as category_name"])
      .orderBy("products.created_at", "desc")
      .limit(4)
      .execute();

    const formattedProducts = products.map((product) => {
      const variants = sizeVariants.reduce((acc, variant) => {
        if (variant.product_id === product.id) {
          acc.push({
            size: variant.size,
            size_id: variant.size_id,
            stock: variant.stock,
          });
        }
        return acc;
      }, [] as GetProductResponse["data"][number]["variants"]);
      const { category_name, category_id, ...productData } = product;
      return {
        ...productData,
        category: {
          id: product.category_id,
          name: product.category_name,
        },
        variants,
        images: JSON.parse(JSON.stringify(product.images)),
      };
    });

    return handleApiData<GetProductResponse>(
      {
        data: formattedProducts,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
