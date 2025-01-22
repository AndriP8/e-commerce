import { Insertable, Selectable, Updateable } from "kysely";
import { OrderItems as OrderItemssTable } from "kysely-codegen";

export type OrderItem = Selectable<OrderItemssTable>;
export type CreateOrderItem = Insertable<OrderItemssTable>;
export type UpdateOrderItem = Updateable<OrderItemssTable>;
