import { Insertable, Selectable, Updateable } from "kysely";

import { Buyers as BuyersTable } from "@/generated/db";

export type Buyer = Selectable<BuyersTable>;
export type CreateBuyer = Insertable<BuyersTable>;
export type UpdateBuyer = Updateable<BuyersTable>;
