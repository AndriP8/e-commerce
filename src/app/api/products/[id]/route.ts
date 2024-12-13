import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { validateBody } from "@/lib/helpers/validate-body";
import { productSchema, sizes } from "@/lib/schema/product.schema";

type EditProductParams = z.infer<typeof productSchema.update.params>;
type EditProductBody = z.infer<typeof productSchema.update.body>;
type EditProductResponse = z.infer<typeof productSchema.update.response>;

export async function PUT(
  request: NextRequest,
  route: { params: EditProductParams },
) {
  try {
    const body = (await request.json()) as EditProductBody;
    const { error } = validateBody({
      body,
      schema: productSchema.create.body,
    });
    if (error) return throwError(error, { status: 400 });

    const product = await db.transaction().execute(async () => {
      const { variants, ...product } = body;
      const productData = await db
        .updateTable("products")
        .set({
          ...product,
          images: JSON.stringify(product.images),
        })
        .where("id", "=", route.params.id)
        .returningAll()
        .executeTakeFirstOrThrow();

      const productSizeData = await Promise.all(
        variants.map((variant) =>
          db
            .updateTable("product_sizes")
            .set({
              stock: variant.stock,
              size_id: variant.size_id,
            })
            .where("product_id", "=", productData.id)
            .returningAll()
            .executeTakeFirstOrThrow(),
        ),
      );
      return {
        ...productData,
        images: JSON.parse(JSON.stringify(productData.images)) as string[],
        variants: productSizeData,
      };
    });
    return handleApiData<EditProductResponse>(product, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

type GetDetailProductParams = z.infer<typeof productSchema.readDetail.params>;
type GetDetailProductResponse = z.infer<
  typeof productSchema.readDetail.response
>;
export async function GET(
  _request: NextRequest,
  route: { params: GetDetailProductParams },
) {
  try {
    const product = await db
      .selectFrom("products")
      .leftJoin("categories", "products.category_id", "categories.id")
      .where("products.id", "=", route.params.id)
      .where("products.deleted_at", "is", null)
      .selectAll("products")
      .select(["categories.name as category_name"])
      .executeTakeFirstOrThrow();

    const sizeVariants = await db
      .selectFrom("product_sizes")
      .where("product_sizes.product_id", "=", route.params.id)
      .where("product_sizes.deleted_at", "is", null)
      .leftJoin("sizes", "product_sizes.size_id", "sizes.id")
      .select(["product_sizes.stock", "sizes.size"])
      .execute();

    const productData = {
      ...product,
      category_name: product.category_name || "",
      images: JSON.parse(JSON.stringify(product.images)),
      variants: sizeVariants.map((variant) => ({
        size: variant.size || sizes[0],
        stock: variant.stock,
      })),
    };

    return handleApiData<GetDetailProductResponse>(productData, {
      status: 200,
    });
  } catch (error) {
    return handleApiError(error, { status: 400 });
  }
}

type DeleteProductParams = z.infer<typeof productSchema.delete.params>;
type DeleteProductResponse = z.infer<typeof productSchema.delete.response>;
export async function DELETE(
  _request: NextRequest,
  route: { params: DeleteProductParams },
) {
  try {
    await db.transaction().execute(async () => {
      await db
        .updateTable("products")
        .where("id", "=", route.params.id)
        .set({ deleted_at: Date() })
        .execute();
      await db
        .updateTable("product_sizes")
        .where("product_id", "=", route.params.id)
        .set({ deleted_at: Date() })
        .execute();
    });
    return handleApiData<DeleteProductResponse>("OK", { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
