import { z } from "zod";

import { ordersSchema } from "@/lib/schema/orders.schema";

export type UpdateOrderBody = z.infer<typeof ordersSchema.update.body>;
export type UpdateOrderResponse = z.infer<typeof ordersSchema.update.response>;
type UpdateOrderArgs = {
  params: string;
  body: UpdateOrderBody;
};

export async function updateOrder({
  params,
  body,
}: UpdateOrderArgs): Promise<UpdateOrderResponse> {
  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders/${params}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!result.ok) return result.json();
  const data = await result.json();
  return data;
}
