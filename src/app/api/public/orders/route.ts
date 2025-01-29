import { sql } from "kysely";
import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { getPaginationInfo, paginate } from "@/database/utils/pagination";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { validateBody } from "@/lib/helpers/validate-body";
import { verifyToken } from "@/lib/helpers/verify-token";
import { publicOrderSchema } from "@/lib/schema/public/orders.schema";
import { CreateOrderItem } from "@/lib/types/database/order-item-types";

type CreateOrderResponse = z.infer<typeof publicOrderSchema.create.response>;
export async function POST(request: NextRequest) {
  const token = request.headers.get("Authorization") || "";

  try {
    const decodedToken = await verifyToken(token);
    if (!decodedToken) return;

    const body = (await request.json()) as z.infer<
      typeof publicOrderSchema.create.body
    >;
    const { error } = validateBody({
      body,
      schema: publicOrderSchema.create.body,
    });
    if (error) return throwError(error, { status: 400 });

    const { products: bodyProducts, ...orderBody } = body;

    await db.transaction().execute(async (trx) => {
      const productData = await db
        .selectFrom("products")
        .where(
          "id",
          "in",
          bodyProducts.map((bodyProduct) => bodyProduct.product_id),
        )
        .selectAll()
        .execute();

      const validOrderItems = bodyProducts.map((bodyProduct) => {
        const products = productData.find(
          (product) => product.id === bodyProduct.product_id,
        );
        if (!products) return null;

        const discountedPrice = products.discount
          ? (products.price * products.discount) / 100
          : 0;

        return {
          ...products,
          quantity: bodyProduct.quantity,
          size_id: bodyProduct.size_id,
          totalPrice: (products.price - discountedPrice) * bodyProduct.quantity,
        };
      });

      const totalAmout = validOrderItems.reduce((acc, curr) => {
        if (!curr) return 0;
        return acc + curr.totalPrice;
      }, 0);

      const createOrder = await trx
        .insertInto("orders")
        .values({
          ...orderBody,
          buyer_id: decodedToken.id,
          total_amount: totalAmout,
          status: "pending",
        })
        .returningAll()
        .executeTakeFirstOrThrow();

      const orderItems = validOrderItems.reduce((acc, orderItem) => {
        if (orderItem) {
          acc.push({
            order_id: createOrder.id,
            category_id: orderItem.category_id,
            size_id: orderItem.size_id,
            description: orderItem.description,
            name: orderItem.name,
            price: orderItem.price,
            sku: orderItem.sku,
            product_id: orderItem.id,
            quantity: orderItem.quantity,
            images: JSON.stringify(orderItem.images),
            discount: orderItem.discount,
          });
        }
        return acc;
      }, [] as CreateOrderItem[]);

      const createOrderItems = await trx
        .insertInto("order_items")
        .values(orderItems)
        .returningAll()
        .execute();

      validOrderItems.map(async (orderItem) => {
        if (!orderItem) return;
        await trx
          .updateTable("product_sizes")
          .set((eb) => ({
            stock: eb("stock", "-", orderItem.quantity),
          }))
          .where("product_id", "=", orderItem.id)
          .where("size_id", "=", orderItem.size_id)
          .returningAll()
          .execute();
      });

      return {
        order: createOrder,
        items: createOrderItems,
      };
    });

    return handleApiData<CreateOrderResponse>(
      {
        data: "OK",
      },
      { status: 201 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}

type GetOrderResponse = z.infer<typeof publicOrderSchema.read.response>;
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
