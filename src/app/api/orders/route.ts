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

    const baseQuery = db
      .selectFrom("orders")
      .innerJoin("buyers", "orders.buyer_id", "buyers.id");

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
      ])
      .$call((qb) => paginate(qb, { page, size }))
      .execute();
    if (!orders.length) return throwError("Orders not found", { status: 404 });

    const orderItems = await db
      .selectFrom("order_items")
      .where(
        "order_id",
        "in",
        orders.map((order) => order.id),
      )
      .innerJoin("categories", "categories.id", "order_items.category_id")
      .innerJoin("sizes", "sizes.id", "order_items.size_id")
      .select((eb) => [
        "order_items.id as id",
        "order_items.name as name",
        "order_items.price as price",
        "order_items.sku as sku",
        "order_items.description as description",
        "order_items.discount as discount",
        eb.cast<string[]>("order_items.images", "jsonb").as("images"),
        "order_items.order_id as order_id",
        "order_items.product_id as product_id",
        "order_items.quantity as quantity",
        "categories.name as category",
        "sizes.size as size",
      ])
      .execute();

    const formattedOrders = orders.map((order) => {
      const filteredOrderItems = orderItems.filter(
        (item) => item.order_id === order.id,
      );
      return {
        ...order,
        items: filteredOrderItems,
      };
    });

    const pagination = await getPaginationInfo(
      baseQuery,
      { page, size },
      orders.length,
    );
    return handleApiData<GetOrderResponse>(
      {
        data: formattedOrders,
        pagination,
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
