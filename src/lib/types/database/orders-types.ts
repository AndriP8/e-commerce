import { Insertable, Selectable, Updateable } from "kysely";
import { Orders as OrdersTable } from "kysely-codegen";

export type Order = Selectable<OrdersTable>;
export type CreateOrder = Insertable<OrdersTable>;
export type UpdateOrder = Updateable<OrdersTable>;
