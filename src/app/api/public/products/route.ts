import { sql } from "kysely";
import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { getPaginationInfo, paginate } from "@/database/utils/pagination";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError } from "@/lib/helpers/error-response";
import { publicProductSchema } from "@/lib/schema/public/product.schema";

type GetProductResponse = z.infer<typeof publicProductSchema.read.response>;
type GetProductQuery = z.infer<typeof publicProductSchema.read.query>;

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page"));
    const size = Number(searchParams.get("size"));
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sort_by") as GetProductQuery["sort_by"];
    const sortDirection = searchParams.get(
      "sort_direction",
    ) as GetProductQuery["sort_direction"];
    const categories = searchParams.getAll(
      "categories",
    ) as GetProductQuery["categories"];
    const sizes = searchParams.getAll("sizes") as string[];

    const baseQuery = db
      .selectFrom("products")
      .innerJoin("categories", "products.category_id", "categories.id")
      .innerJoinLateral(
        (eb) =>
          eb
            .selectFrom("product_sizes")
            .whereRef("product_sizes.product_id", "=", "products.id")
            .innerJoin("sizes", "sizes.id", "product_sizes.size_id")
            .$if(!!sizes.length, (qb) =>
              qb.where("product_sizes.product_id", "in", (subQb) =>
                subQb
                  .selectFrom("product_sizes")
                  .innerJoin("sizes", "sizes.id", "product_sizes.size_id")
                  .where("sizes.size", "in", sizes)
                  .select("product_sizes.product_id"),
              ),
            )
            .select([
              sql<
                GetProductResponse["data"][number]["variants"]
              >`json_agg(json_build_object(
               'size_id', product_sizes.size_id,
               'size', sizes.size,
               'stock', product_sizes.stock
               ))`.as("variants"),
            ])
            .as("v"),
        (join) => join.onTrue(),
      )
      .where("products.deleted_at", "is", null)
      .$if(!!search, (qb) => qb.where("products.name", "ilike", `%${search}%`))
      .$if(!!categories?.length, (qb) =>
        qb.where("categories.name", "in", categories || []),
      );

    const products = await baseQuery
      .select([
        "products.id as id",
        "products.name as name",
        "price",
        "sku",
        "description",
        "discount",
        sql<GetProductResponse["data"][number]["images"]>`products.images`.as(
          "images",
        ),
        "v.variants",
        sql<GetProductResponse["data"][number]["category"]>`json_build_object(
          'id', categories.id,
          'name', categories.name
          )`.as("category"),
        "products.created_at as created_at",
        "products.updated_at as updated_at",
        "products.deleted_at as deleted_at",
      ])
      .$if(sortBy === "price", (qb) =>
        qb.orderBy("products.price", sortDirection),
      )
      .$if(sortBy === "created_at", (qb) =>
        qb.orderBy("products.created_at", sortDirection),
      )
      .$call((qb) => paginate(qb, { page, size }))
      .execute();

    const pagination = await getPaginationInfo(
      baseQuery,
      { page, size },
      products.length,
    );

    return handleApiData<GetProductResponse>(
      {
        data: products,
        pagination,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
