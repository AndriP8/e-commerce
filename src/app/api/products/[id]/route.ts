import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { defaultTimestamp } from "@/database/utils/common-column";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { s3ClientConfig } from "@/lib/helpers/s3";
import { validateBody } from "@/lib/helpers/validate-body";
import { verifyToken } from "@/lib/helpers/verify-token";
import { productSchema } from "@/lib/schema/product.schema";

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
          updated_at: defaultTimestamp,
        })
        .where("id", "=", route.params.id)
        .returningAll()
        .executeTakeFirstOrThrow();

      const productSizeData = await Promise.all(
        variants.map(async (variant) => {
          const existingVariant = await db
            .selectFrom("product_sizes")
            .where("product_id", "=", productData.id)
            .where("size_id", "=", variant.size_id)
            .selectAll()
            .executeTakeFirst();

          if (existingVariant) {
            return await db
              .updateTable("product_sizes")
              .set({
                stock: variant.stock,
                updated_at: defaultTimestamp,
              })
              .where("id", "=", existingVariant.id)
              .returningAll()
              .executeTakeFirstOrThrow();
          }

          return await db
            .insertInto("product_sizes")
            .values({
              stock: variant.stock,
              size_id: variant.size_id,
              product_id: productData.id,
            })
            .returningAll()
            .executeTakeFirstOrThrow();
        }),
      );
      return {
        ...productData,
        images: JSON.parse(JSON.stringify(productData.images)) as string[],
        variants: productSizeData,
      };
    });
    return handleApiData<EditProductResponse>(
      { data: product },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

type GetDetailProductParams = z.infer<typeof productSchema.readDetail.params>;
type GetDetailProductResponse = z.infer<
  typeof productSchema.readDetail.response
>;
export async function GET(
  request: NextRequest,
  route: { params: GetDetailProductParams },
) {
  const token = cookies().get("session")?.value || "";

  try {
    await verifyToken(token);
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
    return handleApiData<GetDetailProductResponse>(
      { data: productData },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error, { status: 400 });
  }
}

type DeleteProductParams = z.infer<typeof productSchema.delete.params>;
type DeleteProductResponse = z.infer<typeof productSchema.delete.response>;
export async function DELETE(
  request: NextRequest,
  route: { params: DeleteProductParams },
) {
  const token = cookies().get("session")?.value || "";

  try {
    await verifyToken(token);
    const productData = await db.transaction().execute(async (trx) => {
      const updatedProduct = await trx
        .updateTable("products")
        .where("id", "=", route.params.id)
        .set({ deleted_at: defaultTimestamp })
        .returningAll()
        .executeTakeFirstOrThrow();

      const updatedProductSizes = await trx
        .updateTable("product_sizes")
        .where("product_id", "=", route.params.id)
        .set({ deleted_at: defaultTimestamp })
        .returningAll()
        .execute();

      return {
        ...updatedProduct,
        variants: updatedProductSizes,
      };
    });
    const productImages = JSON.parse(
      JSON.stringify(productData.images),
    ) as string[];

    productImages.forEach(async (path) => {
      const command = new DeleteObjectCommand({
        Bucket: process.env.BUCKET_NAME || "",
        Key: path,
      });
      await s3ClientConfig.send(command);
      s3ClientConfig.destroy();
    });

    return handleApiData<DeleteProductResponse>(
      { data: "OK" },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
