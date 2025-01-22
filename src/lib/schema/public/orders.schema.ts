import { z } from "zod";

import { orderStatus } from "@/lib/enums/order-status";
import {
  CreateOrderItem as CreateOrderItemDB,
  OrderItem as OrderItemDB,
} from "@/lib/types/database/order-item-types";
import { CreateOrder, Order } from "@/lib/types/database/orders-types";

import { paginationSchema } from "../pagination.schema";
import { SchemaType } from "../schema-types";

type CreateOrderItem = Pick<CreateOrderItemDB, "product_id" | "quantity"> & {
  size_id: string;
};

type CreateOrderBodyType = Omit<
  CreateOrder,
  "buyer_id" | "total_amount" | "status"
> & {
  products: CreateOrderItem[];
};

const createOrderBody = z.object({
  address: z.string(),
  description: z.string(),
  products: z.array(
    z.object({
      product_id: z.string(),
      quantity: z.number(),
      size_id: z.string(),
    }),
  ),
});

createOrderBody._output satisfies CreateOrderBodyType;

type OrderItem = Omit<OrderItemDB, "category_id" | "size_id"> & {
  category: string;
  size: string;
};

type OrderData = Omit<Order, "buyer_id"> & {
  items: OrderItem[];
};

const ordersData = z.object({
  id: z.string(),
  address: z.string(),
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

export const publicOrderSchema = {
  path: "/public/order",
  create: {
    path: "/",
    body: createOrderBody,
    response: z.object({
      data: z.literal("OK"),
    }),
  },
  read: {
    path: "/",
    query: z.object({
      page: z.number(),
      size: z.number(),
    }),
    response: z.object({
      data: z.array(ordersData),
      pagination: paginationSchema,
    }),
  },
} satisfies Partial<SchemaType>;
