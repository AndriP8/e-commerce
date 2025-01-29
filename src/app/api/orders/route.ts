import { sql } from "kysely";
import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { getPaginationInfo, paginate } from "@/database/utils/pagination";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { verifyToken } from "@/lib/helpers/verify-token";
import { ordersSchema } from "@/lib/schema/orders.schema";

type GetOrderResponse = z.infer<typeof ordersSchema.read.response>;

export async function GET(request: NextRequest) {
  const token = request.headers.get("Authorization") || "";

  try {
    await verifyToken(token);

    const searchParams = request.nextUrl.searchParams;
    const page = Number(searchParams.get("page"));
    const size = Number(searchParams.get("size"));
    // TODO: add search feature

    const baseQuery = db
      .selectFrom("orders")
      .innerJoin("buyers", "orders.buyer_id", "buyers.id")
      .innerJoinLateral(
        (eb) =>
          eb
            .selectFrom("order_items")
            .whereRef("order_id", "=", "orders.id")
            .innerJoin("categories", "categories.id", "order_items.category_id")
            .innerJoin("sizes", "sizes.id", "order_items.size_id")
            .select([
              sql<
                GetOrderResponse["data"][number]["items"]
              >`json_agg(json_build_object(
              'id', order_items.id,
              'name', order_items.name,
              'price', order_items.price,
              'sku', order_items.sku,
              'description', order_items.description,
              'discount', order_items.discount,
              'images', order_items.images::text::jsonb,
              'category', categories.name,
              'size', sizes.size,
              'order_id', order_items.order_id,
              'product_id', order_items.product_id,
              'quantity', order_items.quantity
            ))`.as("items"),
            ])
            .as("order_items"),
        (join) => join.onTrue(),
      );

    const orders = await baseQuery
      .select([
        "orders.id",
        "orders.address",
        "orders.description",
        "orders.receipt_number",
        "orders.status",
        "orders.total_amount",
        "orders.created_at",
        "orders.updated_at",
        "buyers.name as buyer_name",
        "order_items.items",
      ])
      .$call((qb) => paginate(qb, { page, size }))
      .execute();

    if (!orders.length) return throwError("Orders not found", { status: 404 });

    const pagination = await getPaginationInfo(
      baseQuery,
      { page, size },
      orders.length,
    );
    return handleApiData<GetOrderResponse>(
      {
        data: orders,
        pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
