import { Insertable, Selectable, Updateable } from "kysely";

import { Orders as OrdersTable } from "@/generated/db";

export type Order = Selectable<OrdersTable>;
export type CreateOrder = Insertable<OrdersTable>;
export type UpdateOrder = Updateable<OrdersTable>;
