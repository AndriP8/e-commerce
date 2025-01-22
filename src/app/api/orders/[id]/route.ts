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
  const token = request.headers.get("Authorization") || "";

  try {
    await verifyToken(token);
    const body = (await request.json()) as UpdateOrderBody;

    const { error } = validateBody({
      body,
      schema: ordersSchema.update.body,
    });
    if (error) return throwError(error, { status: 400 });

    const { status, receipt_number } = body;
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
