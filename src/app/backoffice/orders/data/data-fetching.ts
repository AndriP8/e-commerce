import { z } from "zod";

import { ordersSchema } from "@/lib/schema/orders.schema";

export type Order = z.infer<typeof ordersSchema.read.response>;
type OrderQuery = z.infer<typeof ordersSchema.read.query>;
type FetchOrderArgs = OrderQuery;

export async function getOrders({
  page,
  size,
}: FetchOrderArgs): Promise<Order> {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  const result = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/orders?${params.toString()}`,
  );
  if (!result.ok) {
    return result.json();
  }
  const data = await result.json();
  return data as Order;
}
