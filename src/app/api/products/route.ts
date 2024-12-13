import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { paginate } from "@/database/utils/pagination";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { validateBody } from "@/lib/helpers/validate-body";
import { productSchema, sizes } from "@/lib/schema/product.schema";

type CreateProductBody = z.infer<typeof productSchema.create.body>;
type CreateProductResponse = z.infer<typeof productSchema.create.response>;
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateProductBody;

    const { error } = validateBody({
      body,
      schema: productSchema.create.body,
    });
    if (error) return throwError(error, { status: 400 });

    const product = await db.transaction().execute(async (trx) => {
      const { variants, ...product } = body;
      const productData = await trx
        .insertInto("products")
        .values({
          ...product,
          images: JSON.stringify(product.images),
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const productSizeData = await Promise.all(
        variants.map((variant) =>
          trx
            .insertInto("product_sizes")
            .values({
              stock: variant.stock,
              size_id: variant.size_id,
              product_id: productData.id,
            })
            .returning(["stock", "size_id"])
            .executeTakeFirstOrThrow(),
        ),
      );

      return {
        ...productData,
        images: JSON.parse(JSON.stringify(productData.images)) as string[],
        variants: productSizeData,
      };
    });

    return handleApiData<CreateProductResponse>(product, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

type GetProductResponse = z.infer<typeof productSchema.read.response>;
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = Number(searchParams.get("page"));
  const size = Number(searchParams.get("size"));

  try {
    const products = await db
      .selectFrom("products")
      .leftJoin("categories", "products.category_id", "categories.id")
      .where("products.deleted_at", "is", null)
      .selectAll("products")
      .select(["categories.name as category_name"])
      .$call((qb) => paginate(qb, { page, size }))
      .execute();

    const sizeVariants = await db
      .selectFrom("product_sizes")
      .leftJoin("sizes", "product_sizes.size_id", "sizes.id")
      .where("product_sizes.deleted_at", "is", null)
      .select([
        "product_sizes.id",
        "product_sizes.stock",
        "product_sizes.product_id",
        "sizes.size",
      ])
      .execute();

    const formattedProducts = products.map((product) => {
      const variants = sizeVariants.filter(
        (variant) => variant.product_id === product.id,
      );
      const { category_id, ...productData } = product;
      return {
        ...productData,
        category_name: product.category_name || "",
        images: JSON.parse(JSON.stringify(product.images)),
        variants: variants.map((variant) => ({
          size: variant.size || sizes[0],
          stock: variant.stock,
        })),
      };
    });

    return handleApiData<GetProductResponse>(formattedProducts, {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
