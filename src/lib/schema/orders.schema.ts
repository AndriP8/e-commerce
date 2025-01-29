import { z } from "zod";

import { OrderItem as OrderItemDB } from "@/lib/types/database/order-item-types";
import { Order } from "@/lib/types/database/orders-types";

import { orderStatus } from "../enums/order-status";
import { paginationSchema } from "./pagination.schema";
import { SchemaType } from "./schema-types";

type OrderItem = Omit<OrderItemDB, "category_id" | "size_id"> & {
  category: string;
  size: string;
};

type OrderData = Omit<Order, "buyer_id"> & {
  buyer_name: string;
  items: OrderItem[];
};

const ordersData = z.object({
  id: z.string(),
  address: z.string(),
  buyer_name: z.string(),
  description: z.string().nullable(),
  receipt_number: z.string().nullable(),
  status: z.enum(orderStatus),
  total_amount: z.number(),
  created_at: z.string(),
  updated_at: z.string().nullable(),
  items: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      price: z.number(),
      sku: z.string(),
      description: z.string(),
      discount: z.number().nullable(),
      images: z.array(z.string()),
      category: z.string(),
      size: z.string(),
      order_id: z.string(),
      product_id: z.string(),
      quantity: z.number(),
    }),
  ),
});
ordersData._output satisfies OrderData;

const readOrderQuery = z.object({
  page: z.number(),
  size: z.number(),
});

export const ordersSchema = {
  path: "/orders",
  read: {
    path: "/",
    query: readOrderQuery,
    response: z.object({
      data: z.array(ordersData),
      pagination: paginationSchema,
    }),
  },
  update: {
    path: "/:id",
    params: z.object({
      id: z.string(),
    }),
    body: z.object({
      status: z.enum(orderStatus),
      receipt_number: z.string().nullable().optional(),
    }),
    response: z.object({
      data: z.literal("OK"),
    }),
  },
} satisfies Partial<SchemaType>;
