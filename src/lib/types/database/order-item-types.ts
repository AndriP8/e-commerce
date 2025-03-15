import { Insertable, Selectable, Updateable } from "kysely";

import { OrderItems as OrderItemssTable } from "@/generated/db";

export type OrderItem = Selectable<OrderItemssTable>;
export type CreateOrderItem = Insertable<OrderItemssTable>;
export type UpdateOrderItem = Updateable<OrderItemssTable>;
