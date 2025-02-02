import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { z } from "zod";

import { db } from "@/database/client";
import { defaultTimestamp } from "@/database/utils/common-column";
import { handleApiData } from "@/lib/helpers/data-response";
import { handleApiError, throwError } from "@/lib/helpers/error-response";
import { validateBody } from "@/lib/helpers/validate-body";
import { verifyToken } from "@/lib/helpers/verify-token";
import { ordersSchema } from "@/lib/schema/orders.schema";

type UpdateOrderBody = z.infer<typeof ordersSchema.update.body>;
type UpdateProductParams = z.infer<typeof ordersSchema.update.params>;
type UpdateProductResponse = z.infer<typeof ordersSchema.update.response>;
export async function PUT(
  request: NextRequest,
  route: { params: UpdateProductParams },
) {
  const token = cookies().get("session")?.value || "";

  try {
    await verifyToken(token);
    const body = (await request.json()) as UpdateOrderBody;

    const { error } = validateBody({
      body,
      schema: ordersSchema.update.body,
    });
    if (error) return throwError(error, { status: 400 });

    const { status, receipt_number } = body;

    const orderData = await db
      .selectFrom("orders")
      .where("id", "=", route.params.id)
      .selectAll()
      .executeTakeFirst();

    switch (orderData?.status) {
      case "pending":
        if (
          status !== "confirmed" &&
          status !== "cancelled" &&
          status !== "pending"
        )
          return throwError(
            "Pending orders can only be confirmed or cancelled",
            { status: 400 },
          );
        break;
      case "confirmed":
        if (status !== "processing" && status !== "confirmed")
          return throwError("Confirmed orders can only be processed", {
            status: 400,
          });
        break;
      case "processing":
        if (status !== "shipment" && status !== "processing")
          return throwError("Processing orders can only be shipped", {
            status: 400,
          });
        break;
      case "shipment":
        if (status !== "delivered" && status !== "shipment")
          return throwError("Shipment orders can only be delivered", {
            status: 400,
          });
        break;
      case "delivered":
        if (status !== "completed" && status !== "delivered")
          return throwError("Delivered orders can only be completed", {
            status: 400,
          });
        break;
      default:
        break;
    }

    const order = await db
      .updateTable("orders")
      .set({ status, receipt_number, updated_at: defaultTimestamp })
      .where("id", "=", route.params.id)
      .returningAll()
      .executeTakeFirst();
    if (!order) return throwError("Order not found", { status: 404 });

    return handleApiData<UpdateProductResponse>(
      {
        data: "OK",
      },
      { status: 200 },
    );
  } catch (error) {
    return handleApiError(error);
  }
}
